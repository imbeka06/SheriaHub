from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from groq import Groq
import psycopg2
import os
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer

load_dotenv(dotenv_path="../.env.local")

app = FastAPI(title="SheriaHub AI Worker")
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

print("Loading embedding model for API...")
model = SentenceTransformer('all-MiniLM-L6-v2')

def get_db_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"))

class ChatRequest(BaseModel):
    query: str

class ChatResponse(BaseModel):
    answer: str
    sources: list

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ai-worker"}

@app.post("/api/chat", response_model=ChatResponse)
def chat_with_ai(request: ChatRequest):
    try:
        query_embedding = model.encode(request.query).tolist()

        conn = get_db_connection()
        cur = conn.cursor()
        
        # Fetch the top 3 most similar chunks
        cur.execute("""
            SELECT c.content, d.title, d.citation
            FROM "DocumentChunk" c
            JOIN "LegalDocument" d ON c."documentId" = d.id
            ORDER BY c.embedding <=> %s::vector
            LIMIT 3;
        """, (query_embedding,))
        
        rows = cur.fetchall()
        cur.close()
        conn.close()

        if not rows:
            return {"answer": "I could not find any legal documents related to your query.", "sources": []}

        # Format context for the LLM
        context = ""
        sources = []
        seen_docs = set()
        
        for row in rows:
            content, title, citation = row
            context += f"Document: {title} ({citation})\nContent: {content}\n\n"
            
            # Only add unique documents to the sources list
            if title not in seen_docs:
                sources.append({
                    "title": title,
                    "citation": citation,
                    "snippet": content[:150] + "..." # Short preview of the text used
                })
                seen_docs.add(title)

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

        return {"answer": completion.choices[0].message.content, "sources": sources}

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))