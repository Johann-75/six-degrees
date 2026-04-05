# --- STEP 1: Build the React Frontend (UPGRADED TO NODE 22) ---
FROM node:22 AS build-step
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# --- STEP 2: Set up the Python Backend ---
FROM python:3.11-slim
WORKDIR /app

# Install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download NLTK data (The RAM Savior)
RUN python -c "import nltk; nltk.download('wordnet'); nltk.download('omw-1.4'); nltk.download('brown')"

# Copy the built frontend into the backend's static folder
COPY --from=build-step /app/frontend/dist /app/backend/static
COPY backend/ /app/backend

WORKDIR /app/backend

# Hugging Face runs on port 7860
ENV PORT=7860
EXPOSE 7860

# Run with Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]