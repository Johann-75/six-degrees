# Six Degrees: Semantic Engine & The "Librarian" Judge 🧠

This backend is the neural center of the **Six Degrees** word association game. It uses a hybrid architecture that combines **WordNet's** structured linguistic database with **Google Gemini's** reasoning to evaluate semantic jumps in real-time.

## 🚀 Key Features

### 1. The "Librarian" Logic (Contextual Disambiguation)
Unlike standard dictionary apps, this engine doesn't just grab the first definition. 
- **Context Awareness**: When a user makes a guess, the engine analyzes the "Current Word" and the "Guess" together. 
- **Disambiguation**: If a word has multiple meanings (e.g., "Cardinal" as a Bishop vs. a Direction), the AI "Librarian" selects the definition that best fits the player's path.

### 2. Noun Corpus Discovery (NLTK & Brown)
The game pool is generated from the **Brown Corpus**, ensuring start and target words are common enough to be playable but diverse enough to be challenging.
- **Filtering**: We extract the top 5,000 words, filtering for those with valid **Noun Synsets**.
- **Priority**: The engine uses a strict **Noun-First** Part-of-Speech priority to ensure gameplay remains intuitive.

### 3. The Gemini Judging Engine
Powered by the **Gemini 1.5/2.0** family, the Judge acts as a high-IQ linguistic arbiter.
- **Grounding**: The Judge is forbidden from using "vibe-based" reasoning. It must justify every `𝕐𝔼𝕊` or `ℕ𝕆` based solely on the provided dictionary definitions.
- **Explainability**: Every rejection or acceptance comes with a factual, one-sentence explanation of the conceptual intersection.

### 4. Resilient Fallback: "The Circuit Breaker"
To survive high traffic or API rate limits, the engine uses an automated fallback chain:
- **Primary**: `gemini-1.5-flash` (Fast & reliable)
- **Secondary**: `gemini-1.5-flash-8b` (High throughput)
- **Advanced**: `gemini-2.0-flash-lite-preview` (Next-gen reasoning)

## 🛠️ Architecture: Dockerized All-in-One
The backend is designed for high-RAM environments (like Hugging Face Spaces). 
- **FastAPI**: Handles the high-performance asynchronous API routes.
- **Static Mounting**: The backend is configured to serve the **React (Vite)** frontend directly, eliminating CORS issues and simplifying deployment.

## 🔌 API Endpoints

- `GET /api/start`: Generates the game session nouns and definitions.
- `POST /api/judge`: Evaluates a `{guess, current_word, target_word, current_def, target_def}` payload.

## 🚀 Local Setup

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt