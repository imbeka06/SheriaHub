import libraryRoutes from './routes/library';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import dotenv from 'dotenv';
import path from 'path';
import { prisma } from './db';
import authRoutes from './routes/auth';

dotenv.config({ path: path.resolve(process.cwd(), '../.env.local') });

const fastify = Fastify({ logger: true });

fastify.register(cors, { 
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'] 
});

fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'fallback_secret'
});

// Setup Authentication Hook
fastify.decorate("authenticate", async function(request: any, reply: any) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

// Health Check
fastify.get('/health', async (request, reply) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', database: 'connected', timestamp: new Date().toISOString() };
  } catch (error) {
    fastify.log.error(error);
    reply.status(500);
    return { status: 'error', database: 'disconnected' };
  }
});

// Register Routes
fastify.register(authRoutes, { prefix: '/api/v1/auth' });
fastify.register(libraryRoutes, { prefix: '/api/v1/library' }); 

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3001;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(` SheriaHub Backend running on http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
// Proxy AI chat requests from frontend to python worker
fastify.post('/api/v1/ai/chat', { onRequest: [fastify.authenticate] }, async (request, reply) => {
  try {
    const { query } = request.body as { query: string };
    
    // Forward the request to the Python AI worker
    const aiResponse = await fetch('http://localhost:8000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });

    if (!aiResponse.ok) {
      throw new Error('AI worker failed to respond');
    }

    const data = await aiResponse.json();
    return reply.send(data);
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({ error: 'Failed to communicate with AI service' });
  }
});
