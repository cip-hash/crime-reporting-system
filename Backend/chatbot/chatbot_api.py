import os
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as gen_ai
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Load environment variables
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Load your Q/A data from JSON
with open("faq.json", "r", encoding="utf-8") as f:
    qa_data = json.load(f)

# Load embedding model
embedder = SentenceTransformer("all-MiniLM-L6-v2")

# Precompute embeddings for your Q/A questions
qa_questions = [item["question"] for item in qa_data]
qa_embeddings = embedder.encode(qa_questions, convert_to_tensor=True)

# Configure Gemini AI
if GOOGLE_API_KEY:
    gen_ai.configure(api_key=GOOGLE_API_KEY)
    model = gen_ai.GenerativeModel("gemini-2.0-pro-exp")
else:
    raise ValueError("❌ GOOGLE_API_KEY not found in .env file!")

app = FastAPI()

# Enable CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    message: str

@app.post("/chat")
async def chat(msg: Message):
    user_input = msg.message.strip()

    # Embed the user input
    input_embedding = embedder.encode([user_input], convert_to_tensor=True)

    # Compute cosine similarity
    similarities = cosine_similarity(input_embedding, qa_embeddings)[0]
    max_index = np.argmax(similarities)
    max_score = similarities[max_index]

    # If similarity above threshold, return custom answer
    if max_score >= 0.75:
        matched_answer = qa_data[max_index]["answer"]
        return {"response": matched_answer}

    # Otherwise use Gemini
    try:
        gemini_response = model.generate_content(
            f"Respond concisely in 2-3 sentences: {user_input}"
        )
        response_text = gemini_response.text.strip() if gemini_response.text else "I couldn't generate a response."
    except Exception as e:
        response_text = f"❌ Gemini AI Error: {str(e)}"

    return {"response": response_text}
