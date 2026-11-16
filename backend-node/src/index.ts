import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import dotenv from 'dotenv';
import path from 'path';
import { sql } from './db';

// Look for .env.local in the parent directory
dotenv.config({ path: path.resolve(process.cwd(), '../.env.local') });

const fastify = Fastify({
  logger: true // This prints errors to your terminal
});

// Register Plugins
fastify.register(cors, { 
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'] // Allow Next.js frontend
});

fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'fallback_secret'
});

// Health Check Route (For UptimeRobot)
fastify.get('/health', async (request, reply) => {
  try {
    // Ping the database to ensure connection is alive
    await sql`SELECT 1`;
    return { status: 'ok', database: 'connected', timestamp: new Date().toISOString() };
  } catch (error) {
    fastify.log.error(error);
    reply.status(500);
    return { status: 'error', database: 'disconnected' };
  }
});

// Test Route
fastify.get('/api/v1', async () => {
  return { message: 'Welcome to SheriaHub API' };
});

// Start Server
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3001;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`SheriaHub Backend running on http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();