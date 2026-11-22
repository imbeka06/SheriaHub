from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from groq import Groq
import psycopg2
import os
import re
from dotenv import load_dotenv

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
        # 1. Extract keywords from the user's query (Ignoring common stop words)
        stop_words = {"what", "did", "the", "say", "about", "in", "a", "is", "of", "to", "and", "for", "on", "with", "case"}
        words = re.findall(r'\b\w+\b', request.query.lower())
        keywords = [w for w in words if w not in stop_words and len(w) > 2]

        if not keywords:
            keywords = words # Fallback if all words were stop words

        # 2. Connect to DB and retrieve context
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Build a dynamic SQL query using ILIKE for any of the keywords
        conditions = " OR ".join([f"title ILIKE %s OR content ILIKE %s" for _ in keywords])
        params = []
        for kw in keywords:
            params.extend([f"%{kw}%", f"%{kw}%"])

        query = f"""
            SELECT id, title, citation, content 
            FROM "LegalDocument" 
            WHERE {conditions}
            LIMIT 3;
        """
        
        cur.execute(query, tuple(params))
        rows = cur.fetchall()
        cur.close()
        conn.close()

        if not rows:
            return {"answer": "I could not find any legal documents related to your query in the library.", "sources": []}

        # 3. Format the context
        context = ""
        sources = []
        for row in rows:
            doc_id, title, citation, content = row
            context += f"Document: {title} ({citation})\nContent: {content[:2000]}...\n\n"
            sources.append({"id": doc_id, "title": title})

        # 4. Call Groq API
        prompt = f"""You are SheriaHub, a Kenyan legal AI assistant. 
Answer the user's question based ONLY on the provided legal context. 
If the answer is not in the context, say "I don't have that information in the current library."
Always cite the document title.

Context:
{context}

Question: {request.query}
"""

        completion = groq_client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=1024,
        )

        answer = completion.choices[0].message.content

        return {"answer": answer, "sources": sources}

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))