// backend-node/src/routes/auth.ts
import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../db'; // Now points correctly to src/db.ts

export default async function authRoutes(fastify: FastifyInstance) {
  // 1. REGISTER ROUTE
  fastify.post('/register', async (request, reply) => {
    const registerSchema = z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(6),
      role: z.enum(['STUDENT', 'LECTURER', 'RESEARCHER', 'ADMIN']).optional(),
    });

    const parsedBody = registerSchema.safeParse(request.body);
    if (!parsedBody.success) {
      // Changed .errors to .issues
      return reply.status(400).send({ error: parsedBody.error.issues });
    }

    const { name, email, password, role } = parsedBody.data;

    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return reply.status(400).send({ error: 'User with this email already exists.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role || 'STUDENT',
        },
      });

      const token = fastify.jwt.sign(
        { id: newUser.id, role: newUser.role },
        { expiresIn: '7d' }
      );

      const { password: _, ...userWithoutPassword } = newUser;

      return reply.status(201).send({
        message: 'User registered successfully',
        user: userWithoutPassword,
        token,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error during registration.' });
    }
  });

  // 2. LOGIN ROUTE
  fastify.post('/login', async (request, reply) => {
    const loginSchema = z.object({
      email: z.string().email(),
      password: z.string(),
    });

    const parsedBody = loginSchema.safeParse(request.body);
    if (!parsedBody.success) {
      // Changed .errors to .issues
      return reply.status(400).send({ error: parsedBody.error.issues });
    }

    const { email, password } = parsedBody.data;

    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return reply.status(401).send({ error: 'Invalid email or password.' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return reply.status(401).send({ error: 'Invalid email or password.' });
      }

      const token = fastify.jwt.sign(
        { id: user.id, role: user.role },
        { expiresIn: '7d' }
      );

      const { password: _, ...userWithoutPassword } = user;

      return reply.send({
        message: 'Login successful',
        user: userWithoutPassword,
        token,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error during login.' });
    }
  });

  // 3. GET CURRENT USER (Protected Route)
  fastify.get('/me', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const userPayload = request.user as { id: string };
    
    const user = await prisma.user.findUnique({
      where: { id: userPayload.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });

    return reply.send({ user });
  });
}