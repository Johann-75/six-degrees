# Step 1: Build the React Frontend
FROM node:18 as build-step
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Step 2: Set up the Python Backend
FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Pre-download NLTK data so it's ready on boot
RUN python -c "import nltk; nltk.download('wordnet'); nltk.download('omw-1.4'); nltk.download('brown')"

# Copy the built frontend to the backend's static folder
COPY --from=build-step /app/frontend/dist /app/backend/static
COPY backend/ /app/backend

WORKDIR /app/backend
# Hugging Face uses port 7860 by default
ENV PORT=7860
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]