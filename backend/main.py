"""
FastAPI entrypoint for the Six Degrees Semantic Navigation Engine.
Exposes endpoints for game initialization and semantic judging.
"""

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager
from game_logic import setup_nltk, get_random_noun_pair, get_word_definition, check_word_relation

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handles startup tasks (NLTK setup) and shutdown logic."""
    setup_nltk()
    yield

app = FastAPI(
    title="Six Degrees Backend",
    description="AI-powered semantic navigation and judging engine.",
    version="1.0.0",
    lifespan=lifespan
)

# --- MIDDLEWARE & SECURITY ---
# FRONTEND_URL should be set in production to your frontend's deployment URL.
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DATA MODELS ---
class GuessRequest(BaseModel):
    """Pydantic model for user guess evaluation requests."""
    guess: str
    current_word: str
    target_word: str
    current_def: str
    target_def: str

# --- ENDPOINTS ---
@app.get("/api/start")
def start_game():
    """
    Initializes a new game session.
    Returns: A pair of random nouns and their WordNet definitions.
    """
    word_a, word_b = get_random_noun_pair()
    return {
        "word_a": word_a,
        "word_a_def": get_word_definition(word_a),
        "word_b": word_b,
        "word_b_def": get_word_definition(word_b),
    }

@app.post("/api/judge")
def handle_guess(req: GuessRequest):
    """
    Evaluates a user's guess against the current semantic anchor and the target word.
    Returns: Status ('win', 'fail', 'continue') and an explanation from the LLM.
    """
    guess = req.guess.strip().lower()
    guess_def = get_word_definition(guess)
    
    # 1. Validate the guess is related to the current word
    is_related_to_current, explanation = check_word_relation(
        guess, req.current_word, guess_def, req.current_def
    )
    
    if is_related_to_current is None:
        raise HTTPException(status_code=500, detail=explanation)
        
    if not is_related_to_current:
        return {
            "status": "fail",
            "message": explanation
        }
        
    # 2. Check for the final connection to the target word (win logic)
    is_related_to_target, target_explanation = check_word_relation(
        guess, req.target_word, guess_def, req.target_def
    )
    
    if is_related_to_target:
        return {
            "status": "win",
            "message": target_explanation
        }
    
    # 3. Valid jump: update the semantic anchor
    return {
        "status": "continue",
        "message": explanation,
        "new_anchor": guess,
        "new_anchor_def": guess_def
    }

# --- LOCAL EXECUTION ---
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
