// AI-driven decision maker: bundles all relevant section/course info and
// asks the LLM to rank base courses and pick preferred sections.

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

import type { Indices } from './indices';

export async function aiDecide(indices: Indices, formAnswers: Record<string, unknown>, options: { numPreferredSections: number }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');
  const openai = new OpenAI({ apiKey });

  // Build a compact, bounded context for the LLM: ACTIVE base courses with a short
  // summary per section (ratings compacted, metadata, and faculty snippets).
  const courses = Array.from(indices.courseByCode.values()).filter(c => c.status === 'ACTIVE');
  const payload: any = { formAnswers, options, courses: [] as any[] };
  for (const course of courses) {
    const ls = indices.sectionsByCourse.get(course.code) ?? [];
    // Sort sections by simple heuristic: overallRating desc, then totalReviews desc
    const sorted = ls.slice().sort((a, b) => {
      const ra = indices.ratingsBySection.get(a);
      const rb = indices.ratingsBySection.get(b);
      const oa = ra?.overallRating ?? 0;
      const ob = rb?.overallRating ?? 0;
      if (oa !== ob) return ob - oa;
      const ta = ra?.totalReviews ?? 0;
      const tb = rb?.totalReviews ?? 0;
      return tb - ta;
    });
    const sections = sorted.slice(0, 6).map(code => {
      const r = indices.ratingsBySection.get(code);
      const s = indices.sectionByLsCode.get(code);
      const fac = (s?.facultyEmails ?? []).map(e => indices.facultyByEmail.get(e)).filter(Boolean) as any[];
      const facBrief = fac.map(f => ({ name: f?.targetName, title: f?.title, edu: f?.education }));
      return {
        lsCode: code,
        semester: r?.semester,
        ratings: r ? {
          overall: r.overallRating, trans: r.transparentGrading, assign: r.assignmentsMatchContent, fair: r.gradesFairly, lect: r.goodLecturerOrator,
          rec: r.courseRecommended, ease: r.gradesEasy, total: r.totalReviews
        } : null,
        meta: { gradingType: r?.gradingType, classMode: r?.classMode, extraCredit: r?.extraCredit },
        desc: (s?.description ?? '').slice(0, 300),
        req: (s?.requirements ?? '').slice(0, 150),
        faculty: facBrief,
        facultyNames: s?.facultyNames ?? [],
      };
    });
    payload.courses.push({ code: course.code, title: course.title, sections });
  }

  const system = `You are an academic advisor. Given student preferences and the provided course data, return JSON and include ALL courses.
Output rules:
- Return an object with key rankedCourses: an array with length EXACTLY equal to the number of input courses.
- Each item must be: { code, title, reasoning, recommendedSections: { preferred: [SectionObj..<=N], alternates: [SectionObj..<=2] } }.
- SectionObj must be: { lsCode, why, evidence }
  - why: one sentence explicitly referencing student preferences (optimize_for, grading_type_preference, class_mode_preference, assessment_preference) and the section’s attributes
  - evidence: compact object including { rating_overall, total_reviews, grading_type, class_mode, extra_credit, faculty_names_or_titles }
- For each course, select up to N preferred sections (N provided in options) and up to 2 alternates. Do not include other sections.
- Use: ratings and review counts (prefer more), grading type/mode, extra credit, description/requirements signals, and faculty title/education hints.
- Penalize missing ratings explicitly in your reasoning and choices.
- Additionally include a string field tableMarkdown which is a concise markdown table with columns: Code | Title | Reasoning | Preferred | Alternates. Each list should show lsCodes joined by commas. Keep tableMarkdown under 200 rows.
- Do NOT omit any course.`;

  const user = JSON.stringify(payload);
  let text = '';
  try {
    const comp = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ]
    });
    text = comp.choices?.[0]?.message?.content || '';
  } catch (err: any) {
    const status = err?.status || err?.code || 'unknown';
    const type = err?.error?.type || err?.name || 'OpenAIError';
    const msgTxt = err?.message || String(err);
    throw new Error(`OpenAI request failed | status=${status} type=${type} msg=${msgTxt}`);
  }

  let json: any;
  
  // Simple parsing attempts
  const parseAttempts = [
    text, // Raw text
    text.replace(/^```[a-zA-Z]*\n|```$/gm, ''), // Strip code fences
    text.replace(/,(\s*[}\]])/g, '$1'), // Remove trailing commas
  ];

  for (const attempt of parseAttempts) {
    try {
      json = JSON.parse(attempt);
      break;
    } catch {
      continue;
    }
  }

  if (!json) {
    // Log for debugging and throw error
    try {
      const logsDir = path.join(process.cwd(), 'logs');
      if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
      const file = path.join(logsDir, `ai-response-${Date.now()}.txt`);
      fs.writeFileSync(file, text || '', 'utf8');
    } catch {}
    const head = text ? text.slice(0, 200).replace(/\s+/g, ' ').trim() : '';
    throw new Error(`AI did not return valid JSON | len=${text?.length || 0} head="${head}"`);
  }

  // Ensure we include all courses; append missing with placeholders if needed
  try {
    const returnedCodes = new Set<string>((json.rankedCourses ?? []).map((x: any) => x.code));
    const missing = courses.filter(c => !returnedCodes.has(c.code));
    for (const m of missing) {
      json.rankedCourses = json.rankedCourses ?? [];
      json.rankedCourses.push({
        code: m.code,
        title: m.title,
        reasoning: 'Included by server for completeness; AI omitted this course.',
        recommendedSections: { preferred: [], neutral: [], notPreferred: [] }
      });
    }
    // Post-process: collapse neutral/notPreferred into alternates and cap lengths
    for (const rc of json.rankedCourses) {
      const rs = rc.recommendedSections || {};
      const preferred = Array.isArray(rs.preferred) ? rs.preferred.slice(0, options.numPreferredSections) : [];
      const alternatesRaw = [] as any[];
      if (Array.isArray(rs.alternates)) alternatesRaw.push(...rs.alternates);
      if (Array.isArray(rs.neutral)) alternatesRaw.push(...rs.neutral);
      if (Array.isArray(rs.notPreferred)) alternatesRaw.push(...rs.notPreferred);
      const alternates = alternatesRaw.slice(0, 2);
      rc.recommendedSections = { preferred, alternates };
    }
  } catch {}
  return json;
}
