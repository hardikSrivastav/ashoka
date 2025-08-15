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

  const totalCourses = courses.length;
  const system = `You are an academic advisor. Given student preferences and the provided course data, return JSON and include ALL courses.
Output rules:
- Return an object with key rankedCourses: an array with length EXACTLY ${totalCourses} (the number of input courses), strictly ordered best to worst.
- Each item must be: { code, title, reasoning, recommendedSections: { preferred: [SectionObj..<=N], neutral: [SectionObj..*], notPreferred: [SectionObj..*] } }.
 - SectionObj must be: { lsCode, why, evidence }
  - why: one sentence explicitly referencing student preferences (optimize_for, grading_type_preference, class_mode_preference, assessment_preference) and the section’s attributes
  - evidence: compact object including { rating_overall, total_reviews, grading_type, class_mode, extra_credit, faculty_names_or_titles }
- For each course, select up to N preferred sections (N provided in options). Additionally, classify any remaining provided sections into either neutral or notPreferred. Do not omit any provided section.
 - Use: ratings and review counts (prefer more), grading type/mode, extra credit, description/requirements signals, and faculty title/education hints.
 - Penalize missing ratings explicitly in your reasoning and choices.
 - Additionally include a string field tableMarkdown which is a concise markdown table with columns: Code | Title | Reasoning | Preferred | Neutral | Not Preferred. Preferred/Neutral/Not Preferred should list lsCodes joined by commas. Keep tableMarkdown under 200 rows.
 - The rankedCourses array MUST contain ALL provided courses, strictly ordered best to worst.
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

  // Normalize: ensure rankedCourses exists and has ALL courses, classify sections buckets
  try {
    // 1) If model used buckets, flatten to rankedCourses preserving order preferred -> neutral -> notPreferred
    if (!Array.isArray(json.rankedCourses) && (Array.isArray(json.preferredCourses) || Array.isArray(json.neutralCourses) || Array.isArray(json.notPreferredCourses))) {
      const flat: any[] = [];
      const pushAll = (arr?: any[]) => { if (Array.isArray(arr)) for (const x of arr) flat.push(x); };
      pushAll(json.preferredCourses);
      pushAll(json.neutralCourses);
      pushAll(json.notPreferredCourses);
      json.rankedCourses = flat;
    }

    // 2) Ensure all courses are present exactly once
    const codeToCourse = new Map<string, any>();
    if (Array.isArray(json.rankedCourses)) {
      for (const it of json.rankedCourses) {
        if (it && it.code) codeToCourse.set(it.code, it);
      }
    } else {
      json.rankedCourses = [];
    }
    for (const base of courses) {
      if (!codeToCourse.has(base.code)) {
        const sect = (payload.courses.find((c: any) => c.code === base.code)?.sections || []) as any[];
        const preferred = sect.slice(0, options.numPreferredSections).map(s => ({ lsCode: s.lsCode }));
        const rest = sect.slice(options.numPreferredSections).slice(0, 2).map(s => ({ lsCode: s.lsCode }));
        json.rankedCourses.push({ code: base.code, title: base.title, reasoning: 'Auto-added to complete ranking.', recommendedSections: { preferred, neutral: [], notPreferred: [], alternates: rest } });
      }
    }

    // 3) Trim sections per course and build tableMarkdown
    const capCourse = (course: any) => {
      const rs = course.recommendedSections || {};
      const preferred = Array.isArray(rs.preferred) ? rs.preferred.slice(0, options.numPreferredSections) : [];
      const neutral = Array.isArray(rs.neutral) ? rs.neutral : [];
      const notPreferred = Array.isArray(rs.notPreferred) ? rs.notPreferred : [];
      const alternates = Array.isArray(rs.alternates) ? rs.alternates.slice(0, 2) : [];
      course.recommendedSections = { preferred, neutral, notPreferred, alternates };
      return course;
    };
    json.rankedCourses = json.rankedCourses.map(capCourse);

    const tableHeader = 'Code | Title | Reasoning | Preferred | Neutral | Not Preferred\n--|--|--|--|--|--\n';
    const rows: string[] = [];
    for (const it of json.rankedCourses as any[]) {
      const pref = (it.recommendedSections?.preferred || []).map((p: any) => (typeof p === 'string' ? p : p.lsCode)).join(', ');
      const neu = (it.recommendedSections?.neutral || []).map((p: any) => (typeof p === 'string' ? p : p.lsCode)).join(', ');
      const notp = (it.recommendedSections?.notPreferred || []).map((p: any) => (typeof p === 'string' ? p : p.lsCode)).join(', ');
      rows.push(`${it.code} | ${it.title?.replace(/\|/g, '/')} | ${(it.reasoning || '').replace(/\|/g, '/')} | ${pref} | ${neu} | ${notp}`);
    }
    json.tableMarkdown = tableHeader + rows.join('\n');

    return json;
  } catch {
    return json;
  }
}
