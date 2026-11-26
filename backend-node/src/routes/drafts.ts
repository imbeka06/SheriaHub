import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db';

export default async function draftRoutes(fastify: FastifyInstance) {
  // GET ALL DRAFTS
  fastify.get('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const userPayload = request.user as { id: string };
    try {
      const drafts = await prisma.draft.findMany({
        where: { userId: userPayload.id },
        orderBy: { updatedAt: 'desc' }
      });
      return reply.send({ drafts });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch drafts' });
    }
  });

  // SAVE A DRAFT
  fastify.post('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const userPayload = request.user as { id: string };
    const schema = z.object({
      title: z.string().min(1),
      draftType: z.string(),
      content: z.string(),
    });

    const parsedBody = schema.safeParse(request.body);
    if (!parsedBody.success) return reply.status(400).send({ error: parsedBody.error.issues });

    try {
      const draft = await prisma.draft.create({
        data: {
          title: parsedBody.data.title,
          draftType: parsedBody.data.draftType,
          content: parsedBody.data.content,
          userId: userPayload.id,
        }
      });
      return reply.status(201).send({ draft });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to save draft' });
    }
  });
}