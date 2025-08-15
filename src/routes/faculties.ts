import { FastifyInstance } from 'fastify';
import type { Indices } from '../services/indices';
import { normalizeEmail, normalizeName } from '../services/normalize';

export async function registerFacultyRoutes(app: FastifyInstance, indices: () => Indices) {
  app.get('/faculties/:id', async (req) => {
    const idx = indices();
    const id = String((req.params as any).id);
    const email = normalizeEmail(id);
    const byEmail = idx.facultyByEmail.get(email);
    if (byEmail) return { matches: [{ confidence: 1, source: 'email', profile: byEmail }] };

    const nameKey = normalizeName(id);
    const byName = idx.facultyByName.get(nameKey) ?? [];
    return { matches: byName.map(p => ({ confidence: 0.6, source: 'name', profile: p })) };
  });
}
