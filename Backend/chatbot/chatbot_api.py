import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as gen_ai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

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
    allow_origins=["http://localhost:5173"],  # Allow only your React frontend
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

class Message(BaseModel):
    message: str

@app.post("/chat")
async def chat(msg: Message):
    user_input = msg.message.strip()

    try:
        # Request a concise response by providing an instruction
        gemini_response = model.generate_content(
            f"Respond concisely in 2-3 sentences: {user_input}"
        )
        
        # Extract response text
        response_text = gemini_response.text.strip() if gemini_response.text else "I couldn't generate a response."

    except Exception as e:
        response_text = f"❌ Gemini AI Error: {str(e)}"

    return {"response": response_text}
