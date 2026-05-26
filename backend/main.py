import random
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager

from game_logic import (
    setup_nltk,
    WORDS,
    get_word_definition,
    validate_guess,
    pick_word_pair,
    get_groq_word_definitions,
    get_groq_anchor_def_update,
    evaluate_guess,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Initializing NLTK and Word Bank...")
    setup_nltk()
    print(f"Word bank ready. {len(WORDS)} words loaded.")
    yield
    print("Shutting down...")


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class MoveRequest(BaseModel):
    guess: str
    current_word: str
    target_word: str
    current_def: str | None = None
    target_def: str | None = None
    chain: list[str] | None = None


@app.get("/api/start")
def start_game():
    if not WORDS:
        raise HTTPException(status_code=500, detail="Word bank not initialized.")
    word_a, word_b = pick_word_pair()
    defs = get_groq_word_definitions(word_a, word_b)
    return {
        "word_a": word_a,
        "word_a_def": defs.get("start_def", "Definition unavailable."),
        "word_b": word_b,
        "word_b_def": defs.get("target_def", "Definition unavailable."),
    }


@app.post("/api/judge")
def handle_guess(req: MoveRequest):
    guess = req.guess.strip().lower()

    # Basic input validation — single word, within corpus bounds
    if not guess.replace('-', '').replace(' ', '').isalpha() or len(guess) > 30:
        return {"status": "fail", "message": "Keep it to a single real word, bro."}

    if len(guess) < 2:
        return {"status": "fail", "message": "Too short — use a proper word (2+ letters)."}

    # WordNet existence gate — reject words the dictionary doesn't know
    # BEFORE burning an API call on the AI judge
    if not validate_guess(guess):
        return {"status": "fail", "message": f'"{guess}" isn\'t in the dictionary. Try a real English noun.'}

    # Use client-supplied UI definitions if available (prevents definition mismatch bugs), otherwise fall back to WordNet
    anchor_def = req.current_def or get_word_definition(req.current_word)
    target_def = req.target_def or get_word_definition(req.target_word)
    chain = req.chain or [req.current_word]

    # Stop the Looping check
    normalized_guess = guess.strip().lower()
    normalized_chain = [w.strip().lower() for w in chain]
    if normalized_guess in normalized_chain:
        return {"status": "fail", "message": f"You already used '{guess}' in this chain. Move forward!"}

    # Evaluate the guess via Groq Semantic Arena Judge
    result = evaluate_guess(
        anchor=req.current_word,
        anchor_def=anchor_def,
        target=req.target_word,
        target_def=target_def,
        guess=guess,
        chain=chain,
    )

    if result is None:
        return {"status": "fail", "message": "The judge API is currently unavailable. Please verify your GROQ_API_KEY."}

    related = result.get("related_to_anchor", False)
    win = result.get("connects_to_target", False)
    anchor_reason = result.get("anchor_reasoning", "")
    target_reason = result.get("target_reasoning", "")
    guess_def = result.get("guess_definition", "Definition unavailable.")
    creativity_score = result.get("creativity_score", 5)

    if not related:
        return {"status": "fail", "message": anchor_reason}

    if win:
        return {
            "status": "win",
            "message": anchor_reason,
            "win_reason": target_reason,
            "creativity_score": creativity_score,
        }

    # Fetch updated definition of the new anchor word contextually via Groq
    new_def = get_groq_anchor_def_update(
        current_word=guess,
        previous_word=req.current_word,
        default_def=guess_def
    )
    
    return {
        "status": "continue",
        "message": anchor_reason,
        "new_anchor": guess,
        "new_anchor_def": new_def,
        "creativity_score": creativity_score,
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)