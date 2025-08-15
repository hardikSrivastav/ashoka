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

  registerHealthRoutes(app);
  registerCourseRoutes(app, getIndices);
  registerSectionRoutes(app, getIndices);
  registerFacultyRoutes(app, getIndices);
  registerAdminRoutes(app, { csvDir, setIndices: (i) => { (getIndices as any).set?.(i); } });
  registerRecommendationRoutes(app, getIndices);

  return app;
}
