import { FastifyInstance } from 'fastify';
import type { Indices } from '../services/indices';

export async function registerCourseRoutes(app: FastifyInstance, indices: () => Indices) {
  app.get('/courses', async (req, reply) => {
    const idx = indices();
    const list = Array.from(idx.courseByCode.values())
      .filter(c => c.status === 'ACTIVE')
      .map(c => {
        const sections = idx.sectionsByCourse.get(c.code) ?? [];
        const numRated = sections.filter(ls => idx.ratingsBySection.has(ls)).length;
        return {
          code: c.code,
          title: c.title,
          status: c.status,
          numSections: sections.length,
          numRatedSections: numRated,
        };
      });
    return list;
  });

  app.get('/courses/:code', async (req, reply) => {
    const idx = indices();
    const code = String((req.params as any).code).toUpperCase();
    const c = idx.courseByCode.get(code);
    if (!c) return reply.code(404).send({ error: 'Not Found', message: `Course ${code} not found` });
    const sections = (idx.sectionsByCourse.get(code) ?? []).map(lsCode => {
      const s = idx.sectionByLsCode.get(lsCode);
      const r = idx.ratingsBySection.get(lsCode);
      return {
        lsCode,
        title: s?.courseTitle ?? '',
        hasRatings: Boolean(r && r.overallRating !== undefined),
        gradingType: r?.gradingType ?? 'unknown',
        classMode: r?.classMode ?? 'unknown',
        extraCredit: r?.extraCredit ?? 'unknown',
      };
    });
    return {
      code: c.code,
      title: c.title,
      status: c.status,
      sections,
      faculty: { names: c.facultyNames, emails: c.facultyEmails },
    };
  });
}
