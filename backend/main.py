"""
FastAPI entrypoint for the Six Degrees Semantic Navigation Engine.
Handles context-aware game logic and serves the React frontend.
"""

import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager

# Import updated logic from game_logic.py
from game_logic import setup_nltk, get_random_noun_pair, get_word_definition, check_word_relation

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handles startup tasks (NLTK setup)."""
    setup_nltk()
    yield

app = FastAPI(
    title="Six Degrees Backend",
    description="AI-powered semantic navigation engine.",
    version="1.1.0",
    lifespan=lifespan
)

# --- MIDDLEWARE ---
# Simplified for Hugging Face (Same-origin in Docker)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DATA MODELS ---
class GuessRequest(BaseModel):
    guess: str
    current_word: str
    target_word: str
    current_def: str
    target_def: str

# --- API ENDPOINTS ---

@app.get("/api/start")
async def start_game():
    """Initializes a new game session with random nouns."""
    try:
        word_a, word_b = get_random_noun_pair()
        # Initial definitions don't have context yet
        return {
            "word_a": word_a,
            "word_a_def": get_word_definition(word_a),
            "word_b": word_b,
            "word_b_def": get_word_definition(word_b),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/judge")
async def handle_guess(req: GuessRequest):
    """Evaluates a guess using the 'Librarian' for context-aware definitions."""
    guess = req.guess.strip().lower()
    
    # --- THE LIBRARIAN IN ACTION ---
    # We pass 'current_word' as context so Gemini picks the right 
    # meaning for the user's guess based on where they just came from.
    guess_def = get_word_definition(guess, context_word=req.current_word)
    
    # 1. Validate relation to the Current Word (The Jump)
    is_related_to_current, explanation = check_word_relation(
        guess, req.current_word, guess_def, req.current_def
    )
    
    if is_related_to_current is None:
        raise HTTPException(status_code=500, detail=explanation)
        
    if not is_related_to_current:
        return {"status": "fail", "message": explanation}
        
    # 2. Check for the Win (Relation to Target)
    is_related_to_target, target_explanation = check_word_relation(
        guess, req.target_word, guess_def, req.target_def
    )
    
    if is_related_to_target:
        return {"status": "win", "message": target_explanation}
    
    # 3. Successful Move
    return {
        "status": "continue",
        "message": explanation,
        "new_anchor": guess,
        "new_anchor_def": guess_def
    }

# --- STATIC FILES & ROUTING ---

# Path to the React 'dist' folder (mounted as 'static' in Docker)
static_path = os.path.join(os.path.dirname(__file__), "static")

@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    """Catch-all to handle React Router and prevent 404s on refresh."""
    if not request.url.path.startswith("/api"):
        return FileResponse(os.path.join(static_path, "index.html"))
    return {"detail": "Not Found"}

# Mount the frontend (Must be at the bottom)
if os.path.exists(static_path):
    app.mount("/", StaticFiles(directory=static_path, html=True), name="static")

# --- EXECUTION ---
if __name__ == "__main__":
    import uvicorn
    # Hugging Face Spaces port is 7860
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run("main:app", host="0.0.0.0", port=port)