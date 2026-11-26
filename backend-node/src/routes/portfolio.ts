import { FastifyInstance } from 'fastify';
import { prisma } from '../db';

export default async function portfolioRoutes(fastify: FastifyInstance) {
  fastify.get('/stats', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const userPayload = request.user as { id: string };
    
    try {
      const [projectCount, draftCount] = await Promise.all([
        prisma.researchProject.count({ where: { userId: userPayload.id } }),
        prisma.draft.count({ where: { userId: userPayload.id } })
      ]);

      return reply.send({
        stats: {
          projects: projectCount,
          drafts: draftCount,
          // Mocking these for now until we build the Flashcard/Advocacy tables
          caseBriefs: 0,
          advocacySessions: 0
        }
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch portfolio stats' });
    }
  });
}