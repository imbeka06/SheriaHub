import os
import cloudscraper
from bs4 import BeautifulSoup
import psycopg2
import uuid
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
import time

# Load environment variables
load_dotenv(dotenv_path="../.env.local")

print("Loading embedding model...")
model = SentenceTransformer('all-MiniLM-L6-v2')

def get_db_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"))

def chunk_text(text, chunk_size=1000, overlap=200):
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap
    return chunks

def scrape_and_ingest():
    # Using cloudscraper to bypass Cloudflare 403 blocks
    scraper = cloudscraper.create_scraper(browser={'browser': 'chrome', 'platform': 'windows', 'mobile': False})
    
    # The Court of Appeal recent judgments page
    url = "http://kenyalaw.org/caselaw/cases/recent/2" 
    
    print(f"Fetching page: {url}")
    response = scraper.get(url)
    
    if response.status_code != 200:
        print(f"Failed to fetch page. Status: {response.status_code}")
        return

    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Find links to actual judgments (they usually contain '/caselaw/cases/view/')
    case_links = soup.find_all('a', href=True)
    valid_links = [a for a in case_links if '/caselaw/cases/view/' in a['href']]
    
    if not valid_links:
        print("No case links found. The site structure might have changed.")
        return

    # Limit to 3 cases for testing
    valid_links = valid_links[:3]
    
    conn = get_db_connection()
    cur = conn.cursor()

    for link in valid_links:
        case_url = link['href']
        if not case_url.startswith('http'):
            case_url = "http://kenyalaw.org" + case_url
            
        title = link.text.strip() or "Untitled Judgment"
        if len(title) < 10: # Skip short link texts like "PDF" or "HTML"
            continue
            
        print(f"Downloading: {title}")
        
        try:
            case_resp = scraper.get(case_url)
            case_soup = BeautifulSoup(case_resp.content, 'html.parser')
            
            # Extract text
            for script in case_soup(["script", "style"]):
                script.decompose()
            
            # Get the main content div if possible, otherwise whole page
            content_div = case_soup.find('div', {'id': 'content'}) or case_soup
            content = content_div.get_text(separator="\n", strip=True)
            
            # Basic cleanup (limit to 15k chars for testing)
            content = content[:15000] 

            # 1. Save to LegalDocument table
            doc_id = str(uuid.uuid4())
            cur.execute("""
                INSERT INTO "LegalDocument" (id, title, citation, court, docType, content, "createdAt", "updatedAt")
                VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW())
            """, (doc_id, title, "Recent Judgment", "Court of Appeal", "CASE", content))
            
            # 2. Chunk and Embed
            chunks = chunk_text(content)
            for chunk in chunks:
                embedding = model.encode(chunk).tolist()
                cur.execute("""
                    INSERT INTO "DocumentChunk" (id, "documentId", content, embedding)
                    VALUES (%s, %s, %s, %s::vector)
                """, (str(uuid.uuid4()), doc_id, chunk, embedding))
            
            conn.commit()
            print(f"Successfully ingested and embedded: {title}")
            
            # Be respectful to the server
            time.sleep(2) 
            
        except Exception as e:
            print(f"Error processing {title}: {e}")
            conn.rollback()

    cur.close()
    conn.close()
    print("Scraping and ingestion complete!")

if __name__ == "__main__":
    scrape_and_ingest()