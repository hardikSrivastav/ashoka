import { FastifyInstance } from 'fastify';
import type { Indices } from '../services/indices';

export async function registerSectionRoutes(app: FastifyInstance, indices: () => Indices) {
  app.get('/sections/:lsCode', async (req, reply) => {
    const idx = indices();
    const lsCode = String((req.params as any).lsCode).toUpperCase();
    const s = idx.sectionByLsCode.get(lsCode);
    if (!s) return reply.code(404).send({ error: 'Not Found', message: `Section ${lsCode} not found` });
    const r = idx.ratingsBySection.get(lsCode);
    const baseCode = s.courseCode;
    const faculty = s.facultyEmails.map(email => ({
      email,
      name: s.facultyNames.find(n => n.toLowerCase().includes(email.split('@')[0].split('.')[0])) || undefined,
      profile: idx.facultyByEmail.get(email) || undefined,
    }));
    const notes: string[] = [];
    if (!r || r.overallRating === undefined) notes.push('No recent ratings');

    return {
      lsCode,
      baseCode,
      title: s.courseTitle,
      semester: r?.semester,
      ratings: r && r.overallRating !== undefined ? {
        overall: r.overallRating,
        transparentGrading: r.transparentGrading,
        assignmentsMatchContent: r.assignmentsMatchContent,
        gradesEasy: r.gradesEasy,
        gradesFairly: r.gradesFairly,
        goodLecturerOrator: r.goodLecturerOrator,
        courseRecommended: r.courseRecommended,
        totalReviews: r.totalReviews,
      } : undefined,
      metadata: {
        gradingType: r?.gradingType ?? 'unknown',
        classMode: r?.classMode ?? 'unknown',
        extraCredit: r?.extraCredit ?? 'unknown',
      },
      assessment: { tags: [] },
      faculty,
      notes,
    };
  });
}
