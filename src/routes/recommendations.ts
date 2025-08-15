import { FastifyInstance } from 'fastify';
import type { Indices } from '../services/indices';
import type { RecommendationRequest } from '../models/types';
import { formAnswersToWeights } from '../services/gptWeights';
import { aiDecide } from '../services/aiDecision';
import { computeSectionScore, classModeMatchScore, gradingTypeMatchScore, reviewCountFactor } from '../services/scoring';
import { extractAssessmentTags } from '../services/assessmentTags';
import { computeFacultyPedigreeBoost } from '../services/facultyBoost';

export async function registerRecommendationRoutes(app: FastifyInstance, indices: () => Indices) {
  app.post('/recommendations', async (req, reply) => {
    const body = req.body as RecommendationRequest | undefined;
    if (!body || (!body.weights && !body.formAnswers)) {
      return reply.code(400).send({ error: 'Bad Request', message: 'Provide weights or formAnswers' });
    }

    // If mode === 'ai', bypass scoring and delegate to LLM
    if (body.mode === 'ai') {
      const t0 = Date.now();
      try {
        (req as any).log?.info({ route: 'POST /recommendations', phase: 'ai:start' }, 'Starting AI decision');
        const decision = await aiDecide(indices(), body.formAnswers ?? {}, { numPreferredSections: body.options?.numPreferredSections ?? 2 });
        const ms = Date.now() - t0;
        (req as any).log?.info({ route: 'POST /recommendations', phase: 'ai:success', ms, courses: Array.isArray(decision?.rankedCourses) ? decision.rankedCourses.length : undefined }, 'AI decision completed');
        return decision;
      } catch (e: any) {
        const ms = Date.now() - t0;
        (req as any).log?.error({ route: 'POST /recommendations', phase: 'ai:error', ms, err: e?.message || String(e) }, 'AI decision failed; falling back');
        // Fallback to deterministic scoring but shape the response like AI output
        const idx = indices();
        const activeCourses = Array.from(idx.courseByCode.values()).filter(c => c.status === 'ACTIVE');
        const fa = (body.formAnswers ?? {}) as Record<string, any>;
        const gradingPref: any = (fa.grading_type_preference ?? 'no_preference').toString().toLowerCase();
        const classModePref: any = (fa.class_mode_preference ?? 'no_preference').toString().toLowerCase();
        const riskTol: 'low' | 'medium' | 'high' = (['low','medium','high'].includes((fa.low_reviews_risk_tolerance ?? '').toString().toLowerCase())
          ? (fa.low_reviews_risk_tolerance as any).toString().toLowerCase()
          : 'medium') as any;
        const assessPrefArr: string[] = Array.isArray(fa.assessment_preference) ? fa.assessment_preference : [];
        const optimizeFor = (fa.optimize_for ?? '').toString().toLowerCase();
        const useGradingEase = optimizeFor === 'gpa' || optimizeFor === 'maximize gpa';

        const s0 = Date.now();
        const rankedCourses = activeCourses.map(course => {
          const lsCodes = (idx.sectionsByCourse.get(course.code) ?? []);
          const sectionResults = lsCodes.map(ls => {
            const section = idx.sectionByLsCode.get(ls)!;
            const rating = idx.ratingsBySection.get(ls);
            const tagsHit = assessPrefArr.length ? assessPrefArr.some(t => ((section.description || section.requirements || '').toLowerCase().includes(t))) : false;
            const alignment = tagsHit ? 0.75 : 0.5;
            const gradingMatch = gradingTypeMatchScore((gradingPref === 'absolute' || gradingPref === 'relative') ? gradingPref : 'no_preference', rating?.gradingType);
            const modeMatch = classModeMatchScore((classModePref === 'offline' || classModePref === 'online' || classModePref === 'hybrid') ? classModePref : 'no_preference', rating?.classMode);
            const metadata = { gradingTypeMatch: gradingMatch, classModeMatch: modeMatch, extraCredit: rating?.extraCredit === true ? 1 : 0, assessmentAlignment: alignment };
            const isM25 = (rating?.semester ?? '').toLowerCase().includes('monsoon 2025');
            const confidence = { reviewFactor: reviewCountFactor(rating?.totalReviews, riskTol), recencyFactor: rating ? (isM25 ? 1 : 0.85) : 0.5 };
            const facultyProfiles = section.facultyEmails.map(e => idx.facultyByEmail.get(e)).filter(Boolean) as any[];
            const facultyBoost = 0; // keep minimal in fallback
            const noRatingsPenalty = rating && rating.overallRating !== undefined ? (isM25 ? 0 : 0.05) : 0.1;
            const breakdown = computeSectionScore({}, rating, metadata, confidence, facultyBoost, useGradingEase, noRatingsPenalty);
            return { lsCode: ls, score: breakdown.total, rating, breakdown };
          }).sort((a, b) => b.score - a.score);

          const topCount = Math.min(3, sectionResults.length);
          const preferred = sectionResults.slice(0, topCount).map(s => ({ lsCode: s.lsCode }));
          const rest = sectionResults.slice(topCount).map(s => ({ lsCode: s.lsCode }));
          const reasoning = 'Fallback (AI unavailable): ranked by ratings, alignment, and reviews.';
          return { code: course.code, title: course.title, reasoning, recommendedSections: { preferred, neutral: rest, notPreferred: [] } };
        }).sort((a, b) => (b.recommendedSections.preferred[0] ? 1 : 0) - (a.recommendedSections.preferred[0] ? 1 : 0));

        const sms = Date.now() - s0;
        (req as any).log?.info({ route: 'POST /recommendations', phase: 'fallback:done', msFallback: sms, courses: rankedCourses.length }, 'Fallback decision built');
        return { rankedCourses, tableMarkdown: undefined };
      }
    }

    let weights = body.weights ?? {};
    if (!body.weights && body.formAnswers) {
      try {
        weights = await formAnswersToWeights(body.formAnswers);
      } catch (e: any) {
        return reply.code(400).send({ error: 'Bad Request', message: `LLM failure: ${e.message}` });
      }
    }
    const options = body.options ?? { numPreferredSections: 2, detailedExplanations: false };

    // Logging: high-level inputs
    try {
      (req as any).log?.info({
        route: 'POST /recommendations',
        usedFormAnswers: Boolean(body.formAnswers),
        weightsUsed: weights,
        options,
      }, 'recommendations: input summary');
    } catch {}

    // Derive user preferences from formAnswers (if present)
    const fa = (body.formAnswers ?? {}) as Record<string, any>;
    const gradingPref: any = (fa.grading_type_preference ?? 'no_preference').toString().toLowerCase();
    const classModePref: any = (fa.class_mode_preference ?? 'no_preference').toString().toLowerCase();
    const riskTol: 'low' | 'medium' | 'high' = (['low','medium','high'].includes((fa.low_reviews_risk_tolerance ?? '').toString().toLowerCase())
      ? (fa.low_reviews_risk_tolerance as any).toString().toLowerCase()
      : 'medium') as any;
    const optimizeFor = (fa.optimize_for ?? '').toString().toLowerCase();
    const useGradingEase = optimizeFor === 'gpa' || optimizeFor === 'maximize gpa';
    const assessPrefArr: string[] = Array.isArray(fa.assessment_preference) ? fa.assessment_preference : [];

    const idx = indices();
    const activeCourses = Array.from(idx.courseByCode.values()).filter(c => c.status === 'ACTIVE');

    const rankedCourses = activeCourses.map(course => {
      const lsCodes = (idx.sectionsByCourse.get(course.code) ?? []);
      const sectionResults = lsCodes.map(ls => {
        const section = idx.sectionByLsCode.get(ls)!;
        const rating = idx.ratingsBySection.get(ls);
        const assessmentTags = extractAssessmentTags([section.description, section.requirements]);
        // Simple alignment: boost if any preferred mode appears in tags
        let alignment = assessmentTags.length ? 0.6 : 0.4;
        if (assessPrefArr.length) {
          const hit = assessmentTags.some(t => assessPrefArr.map((x: string) => x.toLowerCase()).includes(t));
          alignment = hit ? 0.75 : 0.45;
        }

        const gradingMatch = gradingTypeMatchScore((gradingPref === 'absolute' || gradingPref === 'relative') ? gradingPref : 'no_preference', rating?.gradingType);
        const modeMatch = classModeMatchScore((classModePref === 'offline' || classModePref === 'online' || classModePref === 'hybrid') ? classModePref : 'no_preference', rating?.classMode);
        const metadata = { gradingTypeMatch: gradingMatch, classModeMatch: modeMatch, extraCredit: rating?.extraCredit === true ? 1 : 0, assessmentAlignment: alignment };
        const isM25 = (rating?.semester ?? '').toLowerCase().includes('monsoon 2025');
        const confidence = { reviewFactor: reviewCountFactor(rating?.totalReviews, riskTol), recencyFactor: rating ? (isM25 ? 1 : 0.85) : 0.5 };
        const facultyProfiles = section.facultyEmails.map(e => idx.facultyByEmail.get(e)).filter(Boolean) as any[];
        const facultyBoost = computeFacultyPedigreeBoost(facultyProfiles);
        const noRatingsPenalty = rating && rating.overallRating !== undefined ? (isM25 ? 0 : 0.05) : 0.1;
        const breakdown = computeSectionScore(weights, rating, metadata, confidence, facultyBoost, useGradingEase, noRatingsPenalty);

        return {
          lsCode: ls,
          score: breakdown.total,
          breakdown,
          sources: [
            { file: 'ashoka_course_ratings_fixed.csv', key: ls },
            { file: 'ashoka_courses_selenium.csv', key: ls },
            { file: 'ashoka-course-schedule.csv', key: course.code },
          ],
        };
      }).sort((a, b) => {
        const diff = b.score - a.score;
        if (Math.abs(diff) > 1e-6) return diff;
        const ar = idx.ratingsBySection.get(a.lsCode);
        const br = idx.ratingsBySection.get(b.lsCode);
        const aHas = Boolean(ar && ar.overallRating !== undefined);
        const bHas = Boolean(br && br.overallRating !== undefined);
        if (aHas !== bHas) return bHas ? 1 : -1;
        const aRev = ar?.totalReviews ?? 0;
        const bRev = br?.totalReviews ?? 0;
        if (aRev !== bRev) return bRev - aRev;
        const rec = (s: string | undefined) => (s ?? '').toLowerCase().includes('monsoon 2025') ? 2 : (s ?? '').toLowerCase().includes('spring 2024') ? 1 : 0;
        const aRec = rec(ar?.semester);
        const bRec = rec(br?.semester);
        if (aRec !== bRec) return bRec - aRec;
        const aFac = a.breakdown.facultyBoost ?? 0;
        const bFac = b.breakdown.facultyBoost ?? 0;
        if (aFac !== bFac) return bFac - aFac;
        const suffix = (ls: string) => {
          const m = ls.match(/-(\d+)$/);
          return m ? parseInt(m[1], 10) : 0;
        };
        return suffix(a.lsCode) - suffix(b.lsCode);
      });

      const preferred = sectionResults.slice(0, options.numPreferredSections ?? 2);
      const alternates = sectionResults.slice(options.numPreferredSections ?? 2, (options.numPreferredSections ?? 2) + 2);

      const courseScore = preferred[0]?.score ?? 0;

      // Logging: per-course summary and top sections
      try {
        const topForLog = sectionResults.slice(0, 3).map(s => ({
          lsCode: s.lsCode,
          score: Number(s.score.toFixed(3)),
          hasRatings: Boolean(idx.ratingsBySection.get(s.lsCode)?.overallRating !== undefined),
          totalReviews: idx.ratingsBySection.get(s.lsCode)?.totalReviews ?? 0,
          facultyBoost: Number((s.breakdown.facultyBoost ?? 0).toFixed(3)),
          assessmentAlignment: Number(s.breakdown.metadata.assessmentAlignment.toFixed(3)),
        }));
        (req as any).log?.debug({
          course: course.code,
          sections: lsCodes.length,
          top: topForLog,
        }, 'recommendations: course summary');
      } catch {}

      return {
        code: course.code,
        title: course.title,
        score: courseScore,
        preferredSections: preferred.map(p => ({ lsCode: p.lsCode, score: p.score, explanation: options.detailedExplanations ? JSON.stringify(p.breakdown) : undefined, sources: p.sources })),
        alternates: alternates.map(p => ({ lsCode: p.lsCode, score: p.score, sources: p.sources })),
      };
    }).sort((a, b) => b.score - a.score);

    try {
      (req as any).log?.info({
        topCourses: rankedCourses.slice(0, 3).map(c => ({ code: c.code, score: Number((c.score ?? 0).toFixed(3)) })),
      }, 'recommendations: output summary');
    } catch {}

    return { rankedCourses, weightsUsed: weights };
  });
}
