# SheriaHub Architecture Blueprint

## 1. Core Stack
- **Frontend:** Next.js, React, TypeScript, Tailwind CSS.
- **Backend (Main API):** Node.js (Fastify).
- **Backend (AI Workers):** Python (FastAPI).
- **Database:** Neon PostgreSQL with pgvector.
- **Storage:** Cloudflare R2 (for PDFs, audio, blobs).
- **Hosting:** Cloudflare Pages (Frontend) + Render (Backend/Workers).

## 2. Zero-to-Scale Infrastructure Strategy
- **Frontend Hosting:** Cloudflare Pages (Free tier, unlimited bandwidth, commercial use allowed).
- **Backend Hosting:** Render Free Tier. **Mitigation:** Use UptimeRobot to ping /health every 5 minutes to prevent cold starts.
- **Database:** Neon Free Tier (1 GB storage). **Mitigation:** Do NOT store raw files here. Only store user metadata, relational data, and vector embeddings.
- **Blob Storage:** Cloudflare R2 (10 GB free). Store all uploaded PDFs, audio files, and generated documents here.

## 3. AI & Intelligence Strategy
- **LLM Gateway:** reellmpool to aggregate and failover across free tiers.
- **Primary LLM:** Groq (openai/gpt-oss-20b). (Note: Llama 3.1 8B is deprecated).
- **Failover LLMs:** Google Gemini (Flash), OpenRouter, Mistral.
- **Speech-to-Text (STT):** Groq Whisper (Free tier).
- **Text-to-Speech (TTS):** VoiceStudio (Self-hosted).
- **Legal Data Source:** Official Kenya Law API via pykenyalaw Python client.

## 4. Security & Compliance
- **Data Protection:** Kenya Data Protection Act, 2019 alignment.
- **Authentication:** JWT / Session-based with RBAC (Student, Lecturer, Researcher, Admin).
