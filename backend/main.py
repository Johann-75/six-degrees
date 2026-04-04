from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager
from game_logic import setup_nltk, get_random_noun_pair, get_word_definition, check_word_relation

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup NLTK on startup
    setup_nltk()
    yield

app = FastAPI(lifespan=lifespan)

# Add CORS middleware to allow the Vite frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GuessRequest(BaseModel):
    guess: str
    current_word: str
    target_word: str
    current_def: str
    target_def: str

@app.get("/api/start")
def start_game():
    word_a, word_b = get_random_noun_pair()
    return {
        "word_a": word_a,
        "word_a_def": get_word_definition(word_a),
        "word_b": word_b,
        "word_b_def": get_word_definition(word_b),
    }

@app.post("/api/judge")
def handle_guess(req: GuessRequest):
    guess = req.guess.strip().lower()
    
    # We fetch the guess definition immediately
    guess_def = get_word_definition(guess)
    
    # 1. Check if the guess is related to the current_word
    is_related_to_current, explanation = check_word_relation(guess, req.current_word, guess_def, req.current_def)
    
    if is_related_to_current is None:
        raise HTTPException(status_code=500, detail=explanation)
        
    if not is_related_to_current:
        return {
            "status": "fail",
            "message": explanation
        }
        
    # 2. If it is related, check if it's connected to the target word (win condition)
    is_related_to_target, target_explanation = check_word_relation(guess, req.target_word, guess_def, req.target_def)
    
    if is_related_to_target:
        return {
            "status": "win",
            "message": target_explanation
        }
    
    # Valid jump but game is not won
    return {
        "status": "continue",
        "message": explanation,
        "new_anchor": guess,
        "new_anchor_def": guess_def
    }

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
