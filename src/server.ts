import Fastify from 'fastify';
import cors from '@fastify/cors';
// Using Fastify's built-in pino integration via options
import { registerHealthRoutes } from './routes/health';
import { registerCourseRoutes } from './routes/courses';
import { registerSectionRoutes } from './routes/sections';
import { registerFacultyRoutes } from './routes/faculties';
import { registerAdminRoutes } from './routes/admin';
import { registerRecommendationRoutes } from './routes/recommendations';
import { Indices } from './services/indices';

export function buildServer(getIndices: () => Indices, csvDir: string) {
  const app = Fastify({ logger: { level: process.env.NODE_ENV === 'production' ? 'info' : 'debug' } });

  app.register(cors, { origin: true, methods: ['GET', 'POST', 'OPTIONS'] });

  app.addHook('onRequest', async (req, reply) => {
    reply.header('X-API-Version', 'v1');
  });

  // Register routes with /api prefix
  app.register(async function (fastify) {
    registerHealthRoutes(fastify);
    registerCourseRoutes(fastify, getIndices);
    registerSectionRoutes(fastify, getIndices);
    registerFacultyRoutes(fastify, getIndices);
    registerAdminRoutes(fastify, { csvDir, setIndices: (i) => { (getIndices as any).set?.(i); } });
    registerRecommendationRoutes(fastify, getIndices);
  }, { prefix: '/api' });

  return app;
}
