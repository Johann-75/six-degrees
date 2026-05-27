# Six Degrees: Semantic Engine & The Groq "Librarian" Judge 🧠

This directory houses the high-performance linguistic core of the **Six Degrees** word association engine. It utilizes a hybrid architecture that pairs **WordNet's** structural lexical database with **Groq's** lightning-fast LPU inference utilizing the advanced **Llama-3.3-70B** model to evaluate semantic jumps in real-time.

---

## 🚀 Key Engineering Features

### 1. The Groq Semantic Arena Judge
Powered by `llama-3.3-70b-versatile` running on Groq, the Judge acts as a high-IQ linguistic arbiter.
* **Strict JSON Enforcement**: The engine forces Groq to compute using JSON mode (`response_format={"type": "json_object"}`), ensuring highly reliable data parsing and low-latency response packaging.
* **Contextual Grounding**: The Judge evaluates relationships based entirely on provided dictionary definitions, rejecting loose metaphorical or slang-based links unless there is a physical, logical, or category intersection in their core definitions.
* **Explainability Matrix**: Every acceptance or rejection response returns a context-backed explanation string alongside an integer creativity score (1 to 10).

### 2. Context-Aware Definition Updates
Unlike standard static dictionary lookups, this engine updates anchor definitions contextually on every valid move.
* When a guess is accepted, the prompt instructs the Groq contextual dictionary to define the new word *based strictly on the semantic link used to connect them* (e.g. defining "vault" specifically as a safe storage room rather than an architectural archway when linked from "safe").

### 3. Infinite Loop Prevention
* The backend evaluates incoming guesses against the active word `chain` history passed down in the request body. If a player attempts to repeat a previously played word to cycle paths, the engine instantly flags a circular gameplay validation failure.

### 4. Direct UI-to-Backend Definition Alignment
* To prevent polysemy mismatches (where the user sees one word meaning on screen but the judge evaluates against another), the API accepts `current_def` and `target_def` directly in the client payload, forcing the judge to use the exact same definition visible on the client screen.

### 5. Nouns Corpus Discovery (NLTK & Brown)
The game nouns pool is generated from a high-quality slice of the **NLTK Brown Corpus**.
* **Goldilocks Zone**: The engine extracts words from the mid-tier frequency range `[800:3500]`, filtering for those with valid **Noun Synsets**. This ensures start and target words are standard and high-frequency, keeping gameplay challenging but intuitive.
* **Hyponym Category Non-Intersection**: Startup word pairs are filtered using hierarchical trees to ensure they share zero immediate hypernym categories, making sure they are not trivial synonyms.

---

## 🔌 API Endpoints

### `GET /api/start`
Generates game session nouns and context-grounded definitions via Groq (with local WordNet fallbacks).

* **Output Response (`200 OK`)**:
```json
  {
    "word_a": "workers",
    "word_a_def": "Workers are individuals who perform tasks or labor in exchange for payment...",
    "word_b": "corporation",
    "word_b_def": "A corporation is a large business organization that operates to make a profit."
  }
```

### `POST /api/judge`

Evaluates the player's proposed semantic guess against the current active anchor card.

* **Input Payload Request Body**:

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

* **Output Response (On Accept/Continue)**:

```json
  {
    "status": "continue",
    "message": "The guess 'diamond' is highly related as it is a precious mineral extracted from a mine.",
    "new_anchor": "diamond",
    "new_anchor_def": "A precious stone consisting of a clear and colourless crystalline form of pure carbon.",
    "creativity_score": 7
  }
```

---

## 🚀 Setup & Local Execution

1. **Configure Environment Variables**:
Create a `.env` file in the root of this folder and add your Groq API Key:

```bash
   cp .env.example .env
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

The FastAPI server will boot up, automatically verify/download your local NLTK datasets (`brown`, `wordnet`, `omw-1.4`), initialize the word pool, and serve the API endpoints on `http://localhost:8000/`.
