import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import path from 'path';
import fs from 'fs';
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

  // Configure CORS for your domain
  app.register(cors, { 
    origin: [
      'http://ashokafc.hardiksrivastava.com',
      'https://ashokafc.hardiksrivastava.com',
      'http://13.233.206.38',
      'http://localhost:5173', // for development
      'http://localhost:3000'  // for development
    ], 
    methods: ['GET', 'POST', 'OPTIONS'] 
  });

  // Serve static files from frontend build output
  const staticRoot = path.join(process.cwd(), 'front', 'dist');
  app.register(fastifyStatic, {
    root: staticRoot,
    prefix: '/',
    // leave decorateReply as default (true) so reply.sendFile is available
  });

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

  // Serve index.html for all non-API routes (SPA routing)
  app.setNotFoundHandler(async (request, reply) => {
    if (request.url.startsWith('/api/')) {
      return reply.status(404).send({ error: 'Not found' });
    } else {
      const canSendFile = typeof (reply as any).sendFile === 'function';
      if (canSendFile) {
        return (reply as any).sendFile('index.html');
      }
      try {
        const htmlPath = path.join(staticRoot, 'index.html');
        const html = fs.readFileSync(htmlPath, 'utf8');
        return reply.header('content-type', 'text/html').send(html);
      } catch {
        return reply.status(404).send({ error: 'Not found' });
      }
    }
  });

  return app;
}
