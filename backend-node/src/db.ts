import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import path from 'path';

// Look for .env.local in the parent directory
dotenv.config({ path: path.resolve(process.cwd(), '../.env.local') });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in the root .env.local file");
}

export const sql = neon(process.env.DATABASE_URL);