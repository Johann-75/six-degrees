"""
Core game logic for the Six Degrees Semantic Navigation Engine.
Optimized for Hugging Face (16GB RAM) and Gemini-powered 
contextual definition retrieval (The Librarian).
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

# Tiered fallback models for high availability
FALLBACK_MODELS = [
    'gemini-1.5-flash',                # Stable workhorse
    'gemini-1.5-flash-8b',             # High speed, higher limits
    'gemini-2.0-flash-lite-preview-02-05', # Modern preview
    'gemini-1.5-pro'                   # High reasoning (Use as last resort)
]

# Global state
ACTIVE_MODEL_INDEX = 0
WORDS = []

def setup_nltk():
    """Builds a pool of 500 common nouns from the Brown corpus."""
    global WORDS
    print("Setting up NLTK data...")
    nltk.download('brown', quiet=True)
    nltk.download('wordnet', quiet=True)
    nltk.download('omw-1.4', quiet=True)
    
    print("Generating common nouns pool...")
    freq_dist = nltk.FreqDist(w.lower() for w in brown.words() if w.isalpha() and 3 <= len(w) <= 10)
    most_common_words = [word for word, freq in freq_dist.most_common(5000)]
    
    # Filter for valid WordNet nouns
    nouns = [word for word in most_common_words if len(wn.synsets(word, pos='n')) > 0][:500]
    WORDS = nouns
    print(f"NLTK setup complete. Pool size: {len(WORDS)} nouns.")

def generate_with_fallback(prompt: str, max_retries: int = 2, verbose: bool = False):
    """Generates content with a circuit breaker for rate limits."""
    global ACTIVE_MODEL_INDEX

    for i in range(ACTIVE_MODEL_INDEX, len(FALLBACK_MODELS)):
        model_name = FALLBACK_MODELS[i]
        for attempt in range(max_retries):
            try:
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(prompt)
                return response
            except Exception as e:
                error_msg = str(e).lower()
                if "quota" in error_msg or "429" in error_msg:
                    if attempt == max_retries - 1:
                        ACTIVE_MODEL_INDEX = i + 1  # Move to next model
                    time.sleep(2)  # Short backoff
                    continue
                break 
    return None

def get_word_definition(word: str, context_word: str = None) -> str:
    """
    THE LIBRARIAN: Retrieves the best WordNet definition.
    If multiple meanings exist, Gemini picks the one that fits the context.
    """
    word_lower = word.lower()
    all_synsets = wn.synsets(word_lower)
    
    if not all_synsets:
        return "No definition found."

    # --- PRIORITY 1: Noun-First friendly sorting ---
    # We now put Nouns (n) before Verbs (v) to avoid "Cardinal/Bishop" issues.
    pos_priority = ['n', 'v', 'a', 's', 'r']
    
    # Filter for exact lemma matches
    candidates = [s for s in all_synsets if word_lower in [l.name() for l in s.lemmas()]]
    if not candidates: candidates = all_synsets

    # --- PRIORITY 2: Semantic Disambiguation (Gemini Librarian) ---
    # If there's more than one meaning and we have a context_word, ask Gemini to pick.
    if len(candidates) > 1 and context_word:
        options = ""
        for i, s in enumerate(candidates):
            options += f"[{i+1}] ({s.pos()}) {s.definition()}\n"

        prompt = f"""
        A user is connecting '{context_word}' to '{word}'. 
        Pick the WordNet definition of '{word}' that makes the most sense in this context.
        
        OPTIONS:
        {options}
        
        Return ONLY the text of the chosen definition. No numbers or labels.
        """
        response = generate_with_fallback(prompt)
        if response and response.text:
            return response.text.strip()

    # --- FALLBACK: Standard POS filtering ---
    for pos in pos_priority:
        pos_synsets = [s for s in candidates if s.pos() == pos]
        if pos_synsets:
            return pos_synsets[0].definition()

    return candidates[0].definition()

def get_random_noun_pair():
    """Returns two nouns from the pool."""
    if not WORDS: setup_nltk()
    return random.sample(WORDS, 2)

def check_word_relation(word1: str, word2: str, def1: str, def2: str):
    """Judges the semantic connection between two concepts."""
    prompt = f"""
    Judge the connection between:
    WORD A: '{word1}' (Definition: {def1})
    WORD B: '{word2}' (Definition: {def2})

    RULES:
    1. GROUNDING: Use ONLY the provided definitions.
    2. STRICTNESS: No loose metaphors or slang.
    3. VERDICT: Start with '𝕐𝔼𝕊' or 'ℕ𝕆'.

    Example: "𝕐𝔼𝕊, 'profit' is related to 'business' because..."
    """
    response = generate_with_fallback(prompt)
    if not response or not response.text:
        return None, "System Error: Brain Offline."

    text = response.text
    if "𝕐𝔼𝕊" in text.upper() or text.upper().startswith("YES"):
        return True, text
    return False, text