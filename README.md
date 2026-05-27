# Six Degrees 🕸️

A word association game powered by AI. Start with one word, reach another — one semantic link at a time.

Built with FastAPI, React, NLTK, WordNet, and Groq (Llama 3.3 70B).

**[Live Demo →](https://six-degrees-six.vercel.app/)**

---

## How it works

You're given two words. Bridge them by chaining related words — each guess must connect to your current anchor. The AI judge evaluates every move and explains why it accepted or rejected it.

```
MINE → diamond → ring → LADY ✓
```

Bad moves cost HP. Clever moves earn it back.

---

## Stack

| Layer | Tech |
|---|---|
| Backend | FastAPI, Python |
| NLP | NLTK Brown Corpus, WordNet |
| AI Judge | Groq API — Llama 3.3 70B |
| Frontend | React 19, Tailwind CSS v4, Framer Motion |

---

## Running locally

**Backend**
```bash
cd backend
cp .env.example .env      # add your GROQ_API_KEY
pip install -r requirements.txt
python main.py
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```
