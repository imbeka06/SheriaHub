import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db';

export default async function libraryRoutes(fastify: FastifyInstance) {
  // 1. GET ALL DOCUMENTS (Protected)
  fastify.get('/documents', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    try {
      const documents = await prisma.legalDocument.findMany({
        orderBy: { createdAt: 'desc' }
      });
      return reply.send({ documents });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch documents' });
    }
  });

  // 2. CREATE A DOCUMENT (Protected)
  fastify.post('/documents', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const docSchema = z.object({
      title: z.string(),
      citation: z.string().optional(),
      court: z.string().optional(),
      year: z.number().optional(),
      docType: z.enum(['CASE', 'STATUTE', 'CONSTITUTION', 'JOURNAL']).default('CASE'),
      content: z.string(),
    });

    const parsedBody = docSchema.safeParse(request.body);
    if (!parsedBody.success) {
      return reply.status(400).send({ error: parsedBody.error.issues });
    }

    try {
      const newDoc = await prisma.legalDocument.create({
        data: parsedBody.data
      });
      return reply.status(201).send({ message: 'Document added', document: newDoc });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to create document' });
    }
  });
}