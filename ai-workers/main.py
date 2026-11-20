from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from groq import Groq
import psycopg2
import os
from dotenv import load_dotenv
import json

# Load environment variables from the root .env.local
load_dotenv(dotenv_path="../.env.local")

app = FastAPI(title="SheriaHub AI Worker")

# Initialize Groq Client
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Database connection
def get_db_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"))

# Request Schema
class ChatRequest(BaseModel):
    query: str

# Response Schema
class ChatResponse(BaseModel):
    answer: str
    sources: list

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ai-worker"}

@app.post("/api/chat", response_model=ChatResponse)
def chat_with_ai(request: ChatRequest):
    try:
        # 1. Connect to DB and retrieve context
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Simple keyword search for now (we will upgrade to pgvector later)
        search_term = f"%{request.query}%"
        cur.execute("""
            SELECT id, title, citation, content 
            FROM "LegalDocument" 
            WHERE title ILIKE %s OR content ILIKE %s
            LIMIT 3;
        """, (search_term, search_term))
        
        rows = cur.fetchall()
        cur.close()
        conn.close()

        if not rows:
            return {"answer": "I could not find any legal documents related to your query in the library.", "sources": []}

        # 2. Format the context
        context = ""
        sources = []
        for row in rows:
            doc_id, title, citation, content = row
            context += f"Document: {title} ({citation})\nContent: {content[:2000]}...\n\n"
            sources.append({"id": doc_id, "title": title})

        # 3. Call Groq API
        prompt = f"""You are SheriaHub, a Kenyan legal AI assistant. 
Answer the user's question based ONLY on the provided legal context. 
If the answer is not in the context, say "I don't have that information in the current library."
Always cite the document title.

Context:
{context}

Question: {request.query}
"""

        completion = groq_client.chat.completions.create(
            model="openai/gpt-oss-20b", # The recommended replacement for Llama 3.1 8B
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=1024,
        )

        answer = completion.choices[0].message.content

        return {"answer": answer, "sources": sources}

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))