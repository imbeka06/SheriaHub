import os
import psycopg2
import uuid
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
from datasets import load_dataset

# Load environment variables
load_dotenv(dotenv_path="../.env.local")

print("Loading embedding model...")
model = SentenceTransformer('all-MiniLM-L6-v2')

def get_db_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"))

def ingest_corpus():
    print("Loading dataset from Hugging Face...")
    dataset = load_dataset("MakiniAI/kenya-law-corpus", split="train", streaming=True)
    
    conn = get_db_connection()
    cur = conn.cursor()

    count = 0
    MAX_CHUNKS = 50 
    
    for row in dataset:
        if count >= MAX_CHUNKS:
            break
            
        text = row['text']
        metadata = row['metadata'] 
        title = metadata.get('title', 'Unknown Kenyan Legal Document')
        
        doc_id = str(uuid.uuid4())
        
        try:
            # 1. Insert into LegalDocument (FIXED: Added quotes around "docType")
            cur.execute("""
                INSERT INTO "LegalDocument" (id, title, citation, court, "docType", content, "createdAt", "updatedAt")
                VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW())
            """, (doc_id, title, "HF Corpus", "Various", "CASE", text))
            
            # 2. Generate embedding and insert into DocumentChunk
            embedding = model.encode(text).tolist()
            cur.execute("""
                INSERT INTO "DocumentChunk" (id, "documentId", content, embedding)
                VALUES (%s, %s, %s, %s::vector)
            """, (str(uuid.uuid4()), doc_id, text, embedding))
            
            conn.commit()
            count += 1
            print(f"[{count}/{MAX_CHUNKS}] Ingested: {title[:60]}...")
            
        except Exception as e:
            print(f"Error ingesting row: {e}")
            conn.rollback()

    cur.close()
    conn.close()
    print(f"Ingestion complete! {count} chunks added to the database.")

if __name__ == "__main__":
    ingest_corpus()