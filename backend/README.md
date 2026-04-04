# Six Degrees: Backend Engine & Semantic Judging

This backend provides the core "brain" for the **Six Degrees** word association game. It is a **FastAPI** application designed to perform real-time semantic evaluation of word pairs using a combination of traditional NLP corpora and modern LLMs.

## 🧠 The Field: Semantic Word Association (NLP)

This project operates in the space of **Lexical Semantics** and **Computational Linguistics**. It specifically explores:
- **Semantic Relatedness**: Determining if two words (A and B) belong to the same conceptual network.
- **Linguistic Grounding**: Forcing an LLM to evaluate connections based on literal dictionary definitions rather than vague vector-space proximity alone.

## 🛠️ Tech Stack & Internal Logic

### 1. Noun Corpus Discovery (NLTK & Brown)
The backend uses the **Brown Corpus** via the **NLTK** library to identify common English nouns.
- **Filtering**: We extract the top 5,000 most common words, filtering for those that have at least one **Noun Synset** in WordNet.
- **Random Sampling**: Upon game start, the engine selects two distinct nouns from this pool to serve as the "Start" and "Target" words.

### 2. Grounding via WordNet
To ensure logical consistency, we fetch the first **WordNet Synset** definition for every word in the session.
- **The Definition Constraint**: When a user submits a guess, that guess's definition is retrieved. The AI Judge is then provided with the literal definitions of both the anchor and the guess.
- **Why?**: This prevents "semantic drift." For example, if the definition of "Fair" is "a traveling show," the Judge will reject the connection to "Justice" because the definitions do not intersect in that specific context.

### 3. The Gemini Judging Engine
The semantic "Judge" is a multi-turn logical validator powered by **Google Gemini**.

**The Prompt Strategy**:
The Judge is provided with the following instructions:
- Use *only* the provided definitions.
- Reject metaphorical, symbolic, or purely etymological links.
- Only accept direct "category" links, synonyms, or strong factual/cultural associations.

### 4. Resilient Fallback: "The Circuit Breaker"
To manage API rate limits and quotas, we've implemented an automated model fallback chain in `game_logic.py`:
- **Model List**: `gemini-2.5-flash`, `gemini-1.5-flash`, `gemini-3.1-flash-lite-preview`.
- **Tripping the Breaker**: If any model returns a `429 (Rate Limit)` or `Quota Exhausted` error, the system stores that model's failure state and "trips the breaker," automatically upgrading or switching to the next model in the chain for the rest of the game session.

## 🔌 API Documentation

- `GET /api/start`: Returns two random nouns and their WordNet definitions.
- `POST /api/judge`: Accepts a `{guess, current_word, target_word, current_def, target_def}` payload and returns a JSON response with status ("win", "continue", "fail") and a detailed AI explanation string.

## 🚀 Installation & Running

```bash
pip install -r requirements.txt
python main.py
```
> [!IMPORTANT]
> Ensure `GOOGLE_API_KEY` is set in your `.env`. The server will download NLTK's `brown`, `wordnet`, and `omw-1.4` packages on the first startup.
