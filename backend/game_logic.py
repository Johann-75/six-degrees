import os
import random
import nltk
from nltk.corpus import brown, wordnet as wn
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

FALLBACK_MODELS = [
    'gemini-2.5-flash',                     # Primary (Smart but low limits)
    'gemini-2.5-flash-lite',                # Backup 1
    'gemini-3.1-flash-lite-preview',        # Backup 2 (The 500-limit beast you found!)
    'gemini-2.0-flash-lite',                # Backup 3 (Legacy stable)
    'gemini-flash-lite-latest'              # Backup 4 (Absolute last resort)
]

ACTIVE_MODEL_INDEX = 0

WORDS = []

def setup_nltk():
    global WORDS
    print("Setting up NLTK data...")
    nltk.download('brown', quiet=True)
    nltk.download('wordnet', quiet=True)
    nltk.download('omw-1.4', quiet=True)
    
    print("Generating top nouns from Brown corpus...")
    freq_dist = nltk.FreqDist(w.lower() for w in brown.words() if w.isalpha() and 3 <= len(w) <= 10)
    most_common_words = [word for word, freq in freq_dist.most_common(5000)]
    nouns = [word for word in most_common_words if len(wn.synsets(word, pos='n')) > 0][:500]
    WORDS = nouns
    print("NLTK setup complete.")

def get_word_definition(word):
    word_lower = word.lower()

    # --- STEP 1: Get ALL synsets for this word ---
    all_synsets = wn.synsets(word_lower)
    if not all_synsets:
        return "No definition found."

    # --- STEP 2: Filter to only synsets where the EXACT word is a lemma ---
    # This prevents "discuss" from resolving to the "discus" (noun) synset.
    exact_synsets = [
        s for s in all_synsets
        if word_lower in [l.name() for l in s.lemmas()]
    ]

    # --- STEP 3: Within exact matches, prefer by Part of Speech ---
    # Priority: Verb (v) > Noun (n) > Adjective (a/s) > Adverb (r)
    pos_priority = ['v', 'n', 'a', 's', 'r']
    candidate_pool = exact_synsets if exact_synsets else all_synsets

    for pos in pos_priority:
        pos_synsets = [s for s in candidate_pool if s.pos() == pos]
        if pos_synsets:
            return pos_synsets[0].definition()

    # --- STEP 4: Absolute fallback ---
    return candidate_pool[0].definition()

def get_random_noun_pair():
    if not WORDS:
        setup_nltk()
    pair = random.sample(WORDS, 2)
    return pair[0], pair[1]

def generate_with_fallback(prompt, max_retries=3, verbose=True):
    global ACTIVE_MODEL_INDEX

    for i in range(ACTIVE_MODEL_INDEX, len(FALLBACK_MODELS)):
        model_name = FALLBACK_MODELS[i]

        if verbose: print(f"\n🔁 Trying model: {model_name}")

        for attempt in range(max_retries):
            try:
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(prompt)

                if verbose: print(f"✅ Success with {model_name}")
                return response, model_name

            except Exception as e:
                error_msg = str(e).lower()
                if verbose: print(f"⚠️ Failed for {model_name}: {e}")

                # --- DAILY QUOTA EXHAUSTED (RPD) ---
                if "quota" in error_msg or "exhausted" in error_msg:
                    if verbose: print(f"💀 {model_name} is dead for the day. Tripping circuit breaker!")
                    ACTIVE_MODEL_INDEX = i + 1
                    break # Break the retry loop, move to next model instantly

                # --- SHORT-TERM RATE LIMIT (RPM) ---
                elif "429" in error_msg:
                    # We hit the 5 per minute limit! 2 seconds isn't enough.
                    # Wait 15s on first fail, 30s on second fail to let the minute clear.
                    wait_time = 15 * (attempt + 1)
                    if verbose: print(f"⏳ Fast rate limit (RPM) hit. Sleeping for {wait_time}s to let the minute clear...")
                    import time
                    time.sleep(wait_time)
                    continue

                # --- MODEL NOT AVAILABLE ---
                elif "404" in error_msg or "not found" in error_msg:
                    ACTIVE_MODEL_INDEX = i + 1
                    break

                # --- SAFETY / UNKNOWN ---
                else:
                    break

    if verbose: print("\n💀 All models exhausted or unavailable.")
    return None, None

def process_model_response(response):
    if not response or not response.candidates or not response.candidates[0].content.parts:
        return None, "The AI blocked this response due to safety filters or an empty result."

    # Convert to uppercase just in case the AI types "Yes" or "yes"
    text = response.text.upper()
    original_text = response.text

    # Check for BOTH our fancy unicode AND standard English
    if "𝕐𝔼𝕊" in text or "YES," in text or "YES " in text or text.startswith("YES"):
        return True, original_text
    elif "ℕ𝕆" in text or "NO," in text or "NO " in text or text.startswith("NO"):
        return False, original_text
    else:
        return None, "The response is unclear. Please try again."

def check_word_relation(word1, word2, def1, def2):
    prompt = f"""
    You are a logical but context-aware judge for a word association game.
    The user is trying to connect:
    WORD A: '{word1}' (Definition: {def1})
    WORD B: '{word2}' (Definition: {def2})

    ### THE RULES ###
    1. GROUNDING: You MUST judge the connection based ONLY on the provided definitions. If a word has multiple meanings, you MUST stick to the one defined above.
    2. BANNED CONNECTIONS:
       - Switching the definition (e.g., treating 'fast' as speed when defined as not eating).
       - Invented/Hypothetical scenarios.
       - Metaphorical, symbolic, or etymological links if the literal definitions do not intersect (e.g., linking a botanical 'tree' to a corporate 'branch').
    3. ALLOWED CONNECTIONS:
       - Direct cause & effect.
       - Common phrases or compound concepts.
       - Direct categories, synonyms, or strong cultural associations.

    ### FORMATTING ###
    - Start with: "𝕐𝔼𝕊, '{word1}' is related to '{word2}'." OR "ℕ𝕆, '{word1}' is not related to '{word2}'."
    - Explain the link (or failure) in 1-2 factual sentences.
    """
    response, used_model = generate_with_fallback(prompt)

    if response is None:
        return None, "Game over, API is dead or rate limited."

    return process_model_response(response)
