# Six Degrees: Semantic Engine & The Groq "Librarian" Judge 🧠

This backend is the high-performance linguistic core of the **Six Degrees** word association engine. It utilizes a hybrid architecture that pairs **WordNet's** structural lexical database with **Groq's** lightning-fast LPU inference utilizing the advanced **Llama-3.3-70B** model to evaluate semantic jumps in real-time.

---

## 🚀 Key Features

### 1. The Groq Semantic Arena Judge
Powered by `llama-3.3-70b-versatile` running on Groq, the Judge acts as a high-IQ linguistic arbiter.
- **Strict JSON Enforcement**: The engine calls Groq with strict JSON output parameters (`response_format={"type": "json_object"}`), ensuring reliable data flow and high-speed processing under zero latency.
- **Grounding**: The Judge evaluates relationships based on provided dictionary definitions, rejecting loose metaphorical or slang-based links unless there is a physical, logical, or category intersection in their core definitions.
- **Explainability**: Every acceptance or rejection comes with a context-backed explanation and a creativity score (1 to 10).

### 2. Context-Aware Definition Updates
Unlike standard dictionary lookups, this engine updates anchor definitions contextually.
- When a guess is accepted, the prompt instructs the Groq contextual dictionary to define the new word *based strictly on the semantic link used to connect them* (e.g. defining "vault" specifically as a safe storage room rather than an architectural archway when linked from "safe").

### 3. Infinite Loop Prevention
- The backend evaluates guesses against the active word `chain` history passed down in the request body. If a player attempts to repeat a previously played word to cycle paths, the engine instantly flags a circular gameplay failure.

### 4. Direct UI-to-Backend Definition Alignment
- To prevent polysemy mismatches (where the user sees one word meaning but the judge evaluates against another), the API accepts `current_def` and `target_def` directly in the payload, forcing the judge to use the exact same definition visible on the client screen.

### 5. Nouns Corpus Discovery (NLTK & Brown)
The game nouns pool is generated from a high-quality slice of the **NLTK Brown Corpus**.
- **Goldilocks Zone**: The engine extracts words from the mid-tier frequency range `[800:3500]`, filtering for those with valid **Noun Synsets**. This ensures start and target words are standard and high-frequency, keeping gameplay challenging but intuitive.
- **Hyponym Category Non-Intersection**: Startup word pairs are filtered to ensure they share zero immediate hypernym categories, making sure they are not trivial synonyms.

---

## 🔌 API Endpoints

### `GET /api/start`
- **Output**: Generates game session nouns and context-grounded definitions via Groq (with local WordNet fallbacks).
  ```json
  {
    "word_a": "workers",
    "word_a_def": "Workers are individuals who perform tasks or labor in exchange for payment...",
    "word_b": "corporation",
    "word_b_def": "A corporation is a large business organization that operates to make a profit."
  }
  ```

### `POST /api/judge`
- **Input Payload**: Evaluates proposed guesses.
  ```json
  {
    "guess": "exchange",
    "current_word": "switch",
    "current_def": "to change or exchange something for something else",
    "target_word": "mine",
    "target_def": "something that belongs to or is possessed by someone",
    "chain": ["switch"]
  }
  ```
- **Output Response (Continue/Win/Fail)**:
  ```json
  {
    "status": "continue",
    "message": "The guess 'exchange' is a synonym of 'switch'...",
    "new_anchor": "exchange",
    "new_anchor_def": "to give something and receive something else in return",
    "creativity_score": 2
  }
  ```

---

## 🚀 Setup & Execution

1. **Configure Environment Variables**:
   Add your Groq API Key to `backend/.env`:
   ```bash
   GROQ_API_KEY=gsk_your_api_key_here
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the Server**:
   ```bash
   python main.py
   ```
   The FastAPI server will boot, automatically download necessary NLTK datasets (Brown corpus, WordNet), initialize the word pool, and serve the API on `http://localhost:8000/`.