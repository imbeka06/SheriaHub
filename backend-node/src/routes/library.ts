import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db';
import { randomUUID } from 'crypto';

// Helper to split text into chunks (Roughly 1000 characters per chunk)
function chunkText(text: string, chunkSize = 1000): string[] {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

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

  // 2. GET A SINGLE DOCUMENT BY ID (Protected + Re-assembles Chunks)
  fastify.get('/documents/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      
      const document = await prisma.legalDocument.findUnique({
        where: { id },
        include: {
          chunks: {
            select: { content: true } // Fetch only the text of the chunks
          }
        }
      });

      if (!document) {
        return reply.status(404).send({ error: 'Document not found' });
      }

      // Re-assemble the content from the chunks for the frontend
      const fullContent = document.chunks.map(c => c.content).join("\n\n");

      return reply.send({ 
        document: {
          ...document,
          content: fullContent // Send the combined text so the frontend doesn't break
        } 
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch document' });
    }
  });

  // 3. CREATE A DOCUMENT (Protected)
  fastify.post('/documents', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const docSchema = z.object({
      title: z.string(),
      citation: z.string().optional(),
      court: z.string().optional(),
      year: z.number().optional(),
      docType: z.enum(['CASE', 'STATUTE', 'CONSTITUTION', 'JOURNAL']).default('CASE'),
      content: z.string(), // The frontend still sends the full text
    });

    const parsedBody = docSchema.safeParse(request.body);
    if (!parsedBody.success) {
      return reply.status(400).send({ error: parsedBody.error.issues });
    }

    const { content, ...metadata } = parsedBody.data;

    try {
      // 1. Create the LegalDocument WITHOUT content
      const newDoc = await prisma.legalDocument.create({
        data: metadata
      });

      // 2. Split the text and create the chunks
      const textChunks = chunkText(content);
      const chunkData = textChunks.map(chunk => ({
        documentId: newDoc.id,
        content: chunk,
        // Note: Since this is a manual upload, we aren't generating embeddings here.
        // The Python worker handles embeddings for the bulk data.
      }));

      // Save the chunks to the database
      await prisma.documentChunk.createMany({
        data: chunkData
      });

      return reply.status(201).send({ 
        message: 'Document and chunks added successfully', 
        document: newDoc 
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to create document' });
    }
  });
}