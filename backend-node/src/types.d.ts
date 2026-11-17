// backend-node/src/types.d.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import '@fastify/jwt';

// Tell TypeScript about the jwt payload
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { id: string; role: string };
    user: { id: string; role: string };
  }
}

// Tell TypeScript about our custom authenticate decorator
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}