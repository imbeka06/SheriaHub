import os
import psycopg2
import uuid
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
from datasets import load_dataset
import time

load_dotenv(dotenv_path="../.env.local")

print("Loading embedding model...")
model = SentenceTransformer('all-MiniLM-L6-v2')

def get_db_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"))

def ingest_corpus():
    conn = get_db_connection()
    cur = conn.cursor()

    print("Checking existing documents...")
    cur.execute('SELECT title FROM "LegalDocument"')
    existing_titles = set(row[0] for row in cur.fetchall())
    print(f"Found {len(existing_titles)} documents already in the database.")

    print("Loading dataset from Hugging Face...")
    dataset = load_dataset("MakiniAI/kenya-law-corpus", split="train", streaming=True)
    
    count = 0
    skipped = 0
    
    for row in dataset:
        text = row['text']
        metadata = row['metadata'] 
        title = metadata.get('title', 'Unknown Kenyan Legal Document')

        # Skip if we already ingested this title
        if title in existing_titles:
            skipped += 1
            continue

        doc_id = str(uuid.uuid4())
        
        try:
            # 1. Insert ONLY metadata into LegalDocument (No content!)
            cur.execute("""
                INSERT INTO "LegalDocument" (id, title, citation, court, "docType", "createdAt", "updatedAt")
                VALUES (%s, %s, %s, %s, %s, NOW(), NOW())
            """, (doc_id, title, "HF Corpus", "Various", "CASE"))
            
            # 2. Generate embedding and insert into DocumentChunk
            embedding = model.encode(text).tolist()
            cur.execute("""
                INSERT INTO "DocumentChunk" (id, "documentId", content, embedding)
                VALUES (%s, %s, %s, %s::vector)
            """, (str(uuid.uuid4()), doc_id, text, embedding))
            
            conn.commit()
            count += 1
            existing_titles.add(title) # Add to set so we don't process duplicates in the same run
            
            if count % 100 == 0:
                print(f"Successfully ingested {count} new chunks...")
                time.sleep(1) 
                
        except Exception as e:
            print(f"Error ingesting row: {e}")
            conn.rollback()

    cur.close()
    conn.close()
    print(f"Ingestion complete! Added {count} new chunks. Skipped {skipped} duplicates.")

if __name__ == "__main__":
    ingest_corpus()