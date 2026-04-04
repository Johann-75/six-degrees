"""
Core game logic for the Six Degrees Semantic Navigation Engine.
Handles NLTK data setup, WordNet-based definition retrieval, 
and Google Gemini backed semantic judging with fallback support.
"""

import os
import random
import time
import nltk
from nltk.corpus import brown, wordnet as wn
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

# Tiered fallback models for high availability and rate-limit handling
FALLBACK_MODELS = [
    'gemini-2.5-flash',                     # Primary: High reasoning, low limits
    'gemini-2.5-flash-lite',                # Backup 1: Stable flash model
    'gemini-3.1-flash-lite-preview',        # Backup 2: Large RPD (500) limit
    'gemini-2.0-flash-lite',                # Backup 3: Legacy stable
    'gemini-flash-lite-latest'              # Backup 4: Absolute last resort
]

# Global state for model circuit breaker and word pool
ACTIVE_MODEL_INDEX = 0
WORDS = []

def setup_nltk():
    """
    Downloads required NLTK corpora and builds a pool of 500 common nouns
    from the Brown corpus to use as start/target words.
    """
    global WORDS
    print("Setting up NLTK data...")
    nltk.download('brown', quiet=True)
    nltk.download('wordnet', quiet=True)
    nltk.download('omw-1.4', quiet=True)
    
    print("Generating common nouns from Brown corpus...")
    freq_dist = nltk.FreqDist(w.lower() for w in brown.words() if w.isalpha() and 3 <= len(w) <= 10)
    most_common_words = [word for word, freq in freq_dist.most_common(5000)]
    
    # Filter for words that have a noun synset in WordNet
    nouns = [word for word in most_common_words if len(wn.synsets(word, pos='n')) > 0][:500]
    WORDS = nouns
    print(f"NLTK setup complete. Pool size: {len(WORDS)} nouns.")

def get_word_definition(word: str) -> str:
    """
    Retrieves the most relevant WordNet definition for a word.
    Prioritizes exact lemma matches and specific Parts of Speech (Verb > Noun).
    """
    word_lower = word.lower()
    all_synsets = wn.synsets(word_lower)
    
    if not all_synsets:
        return "No definition found."

    # Filter for exact lemma matches to avoid morphological confusion (e.g., discuss/discus)
    exact_synsets = [
        s for s in all_synsets
        if word_lower in [l.name() for l in s.lemmas()]
    ]

    # Priority by Part of Speech: Verb (v) > Noun (n) > Adjective (a/s) > Adverb (r)
    pos_priority = ['v', 'n', 'a', 's', 'r']
    candidate_pool = exact_synsets if exact_synsets else all_synsets

    for pos in pos_priority:
        pos_synsets = [s for s in candidate_pool if s.pos() == pos]
        if pos_synsets:
            return pos_synsets[0].definition()

    return candidate_pool[0].definition()

def get_random_noun_pair():
    """Returns a random pair of nouns from the initialized NLTK pool."""
    if not WORDS:
        setup_nltk()
    return random.sample(WORDS, 2)

def generate_with_fallback(prompt: str, max_retries: int = 3, verbose: bool = False):
    """
    Generates content using Google Gemini with an automated circuit breaker.
    If a model hits a rate limit or quota, it switches to the next fallback tier.
    """
    global ACTIVE_MODEL_INDEX

    for i in range(ACTIVE_MODEL_INDEX, len(FALLBACK_MODELS)):
        model_name = FALLBACK_MODELS[i]
        if verbose: print(f"🔁 Querying {model_name}...")

        for attempt in range(max_retries):
            try:
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(prompt)
                
                if verbose: print(f"✅ Success with {model_name}")
                return response, model_name

            except Exception as e:
                error_msg = str(e).lower()
                
                # Trip the circuit breaker for hard limits or quota exhaustion
                if "quota" in error_msg or "exhausted" in error_msg or "404" in error_msg:
                    ACTIVE_MODEL_INDEX = i + 1
                    break 

                # Exponential backoff for transient rate limits (RPM)
                if "429" in error_msg:
                    wait_time = 15 * (attempt + 1)
                    time.sleep(wait_time)
                    continue

                break # Unknown error, move to next model

    return None, None

def process_model_response(response):
    """
    Parses the LLM response for a YES/NO verdict and explanation.
    Supports both standard English and stylized Unicode indicators.
    """
    if not response or not response.candidates or not response.candidates[0].content.parts:
        return None, "The AI blocked the response or returned an empty result."

    text = response.text.upper()
    original_text = response.text

    # Match stylized "𝕐𝔼𝕊" or standard "YES" at the start of the response
    if "𝕐𝔼𝕊" in text or text.startswith("YES"):
        return True, original_text
    elif "ℕ𝕆" in text or text.startswith("NO"):
        return False, original_text
    
    return None, "The response format was invalid. Please try another word."

def check_word_relation(word1: str, word2: str, def1: str, def2: str):
    """
    Judges whether two words are related based purely on their dictionary definitions.
    Uses the currently active LLM from the fallback chain.
    """
    prompt = f"""
    Judge the connection between these two concepts:
    WORD A: '{word1}' (Definition: {def1})
    WORD B: '{word2}' (Definition: {def2})

    RULES:
    1. GROUNDING: Judge based ONLY on the provided definitions. 
    2. BANNED: Metaphorical, symbolic, or slang links.
    3. ALLOWED: Direct categories, synonyms, or conceptual intersections.

    FORMAT:
    "𝕐𝔼𝕊, '{word1}' is related to '{word2}'." OR "ℕ𝕆, '{word1}' is not related to '{word2}'."
    Follow with 1-2 factual sentences explaining why.
    """
    response, _ = generate_with_fallback(prompt)

    if response is None:
        return None, "Backend Error: All API models are currently rate-limited."

    return process_model_response(response)
