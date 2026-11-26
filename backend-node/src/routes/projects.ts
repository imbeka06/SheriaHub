import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db';

export default async function projectRoutes(fastify: FastifyInstance) {
  // GET ALL PROJECTS FOR THE LOGGED-IN USER
  fastify.get('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const userPayload = request.user as { id: string };
    try {
      const projects = await prisma.researchProject.findMany({
        where: { userId: userPayload.id },
        orderBy: { createdAt: 'desc' }
      });
      return reply.send({ projects });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch projects' });
    }
  });

  // CREATE A NEW PROJECT
  fastify.post('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const userPayload = request.user as { id: string };
    const schema = z.object({
      title: z.string().min(3),
      description: z.string().optional(),
    });

    const parsedBody = schema.safeParse(request.body);
    if (!parsedBody.success) {
      return reply.status(400).send({ error: parsedBody.error.issues });
    }

    try {
      const project = await prisma.researchProject.create({
        data: {
          title: parsedBody.data.title,
          description: parsedBody.data.description,
          userId: userPayload.id,
        }
      });
      return reply.status(201).send({ project });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to create project' });
    }
  });
}