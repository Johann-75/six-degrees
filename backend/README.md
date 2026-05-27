# Backend

FastAPI server that handles word pair generation and AI-based guess evaluation.

## Setup

```bash
cp .env.example .env   # add GROQ_API_KEY
pip install -r requirements.txt
python main.py         # runs on localhost:8000
```

## Endpoints

**`GET /api/start`** — generates a new word pair with definitions.

**`POST /api/judge`** — evaluates a guess against the current anchor and target.

```json
{
  "guess": "diamond",
  "current_word": "mine",
  "current_def": "excavation from which minerals are extracted",
  "target_word": "lady",
  "target_def": "a polite name for any woman",
  "chain": ["mine"]
}
```

Returns `status: continue | win | fail` with reasoning and creativity score.
