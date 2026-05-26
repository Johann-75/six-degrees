import os
import random
import json
import time
import nltk
from nltk.corpus import brown, wordnet as wn
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# ─────────────────────────────────────────────
# 1. SETUP & AUTHENTICATION
# ─────────────────────────────────────────────

GROQ_API_KEY = os.getenv('GROQ_API_KEY')
client = None

if GROQ_API_KEY and not GROQ_API_KEY.strip().startswith("gsk_your_"):
    client = Groq(api_key=GROQ_API_KEY.strip())
else:
    print("WARNING: GROQ_API_KEY is missing or invalid in your .env file!")

# Llama 3.3 70B is extremely capable and fast on Groq's LPUs
MODEL_NAME = 'llama-3.3-70b-versatile'

WORDS = []

# ─────────────────────────────────────────────
# 2. THE LITERATE JUDGE PROMPT
# ─────────────────────────────────────────────

JUDGE_PROMPT = """
You are the Semantic Arena Judge for a word-linking game called "Six Degrees".

RULES:
- STRICT DEFINITION MATCH: You MUST evaluate the GUESS based strictly on the provided '{anchor_def}'. If the ANCHOR is defined as a 'leader', you CANNOT accept links to a 'measuring stick'. 
- NO HALLUCINATIONS: Do not invent intermediary words. Do not evaluate the guess against the TARGET until checking the 'connects_to_target' condition.
- REJECT "Waffle-Logic": Do NOT allow weak, multi-step mental gymnastics to connect words.
- REJECT "Universalisms": words like 'thing', 'object', 'earth', 'time' that mean nothing as a bridge.
- REJECT "Transitive Logic": The guess must relate DIRECTLY to the Anchor. 
- WIN CONDITION: 'connects_to_target' is ONLY true if the GUESS is a direct, obvious bridge to the TARGET.

ANCHOR : '{anchor}' — {anchor_def}
TARGET : '{target}' — {target_def}
CHAIN  : {chain}
GUESS  : '{guess}'

Respond ONLY with valid JSON matching this schema:
{{
  "related_to_anchor": <bool>,
  "connects_to_target": <bool>,
  "creativity_score": <int 1-10>,
  "anchor_reasoning": "<why it links/fails to the anchor>",
  "target_reasoning": "<why it links/fails to the target>",
  "guess_definition": "<1 short sentence defining the GUESS (only if accepted, else empty)>"
}}
"""

# ─────────────────────────────────────────────
# 3. WORD POOL GENERATION & NLTK SETUP
# ─────────────────────────────────────────────

def setup_nltk():
    """Initializes the NLTK Brown and WordNet data structures."""
    print("Building word pool...")
    for pkg in ['brown', 'wordnet', 'omw-1.4']:
        nltk.download(pkg, quiet=True)

    freq_dist = nltk.FreqDist(
        w.lower() for w in brown.words()
        if w.isalpha() and 4 <= len(w) <= 12
    )

    # Mid-tier words for optimal difficulty (skips too easy and too obscure)
    _word_pool = [word for word, _ in freq_dist.most_common(4000)][800:3500]
    nouns = [w for w in _word_pool if len(wn.synsets(w, pos='n')) > 0]

    WORDS.clear()
    WORDS.extend(nouns)
    random.shuffle(WORDS)
    print(f"Word pool ready: {len(WORDS)} nouns loaded.")


def _get_exact_synsets(word: str, max_senses: int = 5):
    """Returns synsets where the word is an EXACT lemma match.
    Falls back to raw synsets if no exact match is found (defensive)."""
    word_lower = word.lower()
    all_syns = wn.synsets(word_lower, pos='n') or wn.synsets(word_lower)
    if not all_syns:
        return []

    # Prioritize synsets with exact lemma match
    exact = [
        s for s in all_syns
        if word_lower in [lemma.name().lower() for lemma in s.lemmas()]
    ]
    return (exact or all_syns)[:max_senses]


def get_word_definition(word: str) -> str:
    """Returns the BEST single definition for UI display.
    Uses exact lemma matching to avoid the 'Synset 0 Trap'."""
    syns = _get_exact_synsets(word, max_senses=1)
    return syns[0].definition() if syns else "No exact definition found."


def validate_guess(word: str) -> bool:
    """Checks if a guess has ANY valid WordNet entry.
    Rejects words the dictionary doesn't recognize BEFORE calling the AI."""
    return len(_get_exact_synsets(word)) > 0


def pick_word_pair() -> tuple[str, str]:
    """Picks starting and target words with no shared immediate hypernyms for optimal gameplay."""
    if not WORDS:
        return "cat", "dog"  # Defensive fallback
    for _ in range(100):
        w1, w2 = random.sample(WORDS, 2)
        s1 = wn.synsets(w1, pos='n')
        s2 = wn.synsets(w2, pos='n')
        if not s1 or not s2:
            continue
        h1 = {h for s in s1 for h in s.hypernyms()}
        h2 = {h for s in s2 for h in s.hypernyms()}
        if not h1.intersection(h2):
            return w1, w2
    return tuple(random.sample(WORDS, 2))


# ─────────────────────────────────────────────
# 4. GROQ API SERVICE ROUTING
# ─────────────────────────────────────────────

def call_groq_json(prompt: str) -> dict | None:
    """Standardized function to query Groq and guarantee JSON output."""
    global client
    if not client:
        # Re-try loading client on the fly if key was newly added
        key = os.getenv('GROQ_API_KEY')
        if key and not key.strip().startswith("gsk_your_"):
            client = Groq(api_key=key.strip())
        else:
            print("Groq Client is not configured. (Missing GROQ_API_KEY)")
            return None

    try:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=MODEL_NAME,
            response_format={"type": "json_object"}  # Forces strict JSON format
        )
        content = response.choices[0].message.content
        if content:
            return json.loads(content)
    except Exception as e:
        print(f"Groq API Error: {e}")
    return None


def get_groq_word_definitions(word_a: str, word_b: str) -> dict:
    """Gets primary common sense definitions for starting and target words via Groq,
    with a robust NLTK WordNet fallback."""
    def_prompt = f"""
    You are a dictionary for a word game. Provide the most common, everyday 
    definition for these two nouns in 1 short sentence each.
    Respond ONLY in JSON matching this schema: 
    {{"start_def": "<noun definition of {word_a}>", "target_def": "<noun definition of {word_b}>"}}
    """
    
    result = call_groq_json(def_prompt)
    if result and "start_def" in result and "target_def" in result:
        return result
        
    # Local fallback
    return {
        "start_def": get_word_definition(word_a),
        "target_def": get_word_definition(word_b)
    }


def get_groq_anchor_def_update(current_word: str, previous_word: str, default_def: str) -> str:
    """Updates definition for dynamic anchor word contextually using Groq, with a default fallback."""
    def_update_prompt = f"""
    You are a contextual dictionary for a word game. 
    The player just linked the word '{previous_word}' to the new word '{current_word}'.
    Based on this semantic connection, provide the specific definition for '{current_word}' 
    that makes sense in this context, in 1 short sentence.
    Respond ONLY in JSON: {{"def": "<def>"}}
    """
    update_json = call_groq_json(def_update_prompt)
    if update_json and "def" in update_json:
        return update_json["def"]
    return default_def


def evaluate_guess(anchor: str, anchor_def: str, target: str, target_def: str, guess: str, chain: list[str]) -> dict | None:
    """Invokes the Groq Semantic Arena Judge to evaluate connection properties."""
    chain_str = " → ".join(chain) if len(chain) > 1 else f"{chain[0]} (start)"
    prompt = JUDGE_PROMPT.format(
        anchor=anchor, anchor_def=anchor_def, 
        target=target, target_def=target_def, 
        chain=chain_str, guess=guess
    )
    return call_groq_json(prompt)