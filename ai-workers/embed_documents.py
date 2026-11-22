import os
import psycopg2
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
import uuid

# Load environment variables
load_dotenv(dotenv_path="../.env.local")

# Load the embedding model (all-MiniLM-L6-v2 is fast, free, and outputs 384 dimensions)
# Note: If you change the model, you must change the vector dimensions in your Prisma schema
print("Loading embedding model...")
model = SentenceTransformer('all-MiniLM-L6-v2')

def get_db_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"))

def chunk_text(text, chunk_size=1000, overlap=200):
    """Splits text into chunks with a slight overlap to preserve context."""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap
    return chunks

def embed_documents():
    conn = get_db_connection()
    cur = conn.cursor()

    # 1. Find documents that don't have chunks yet
    cur.execute("""
        SELECT d.id, d.title, d.content 
        FROM "LegalDocument" d
        LEFT JOIN "DocumentChunk" c ON d.id = c."documentId"
        WHERE c.id IS NULL;
    """)
    docs = cur.fetchall()

    if not docs:
        print("No new documents to embed.")
        return

    for doc_id, title, content in docs:
        print(f"Processing: {title}")
        chunks = chunk_text(content)
        
        for chunk in chunks:
            # 2. Generate the embedding (returns a list of floats)
            embedding = model.encode(chunk).tolist()
            
            # 3. Insert into the database
            #  use a subquery to cast the list to a vector
            cur.execute("""
                INSERT INTO "DocumentChunk" (id, "documentId", content, embedding)
                VALUES (%s, %s, %s, %s::vector)
            """, (str(uuid.uuid4()), doc_id, chunk, embedding))

        conn.commit()
        print(f"Successfully embedded {len(chunks)} chunks for {title}.")

    cur.close()
    conn.close()
    print("All documents embedded successfully!")

if __name__ == "__main__":
    embed_documents()