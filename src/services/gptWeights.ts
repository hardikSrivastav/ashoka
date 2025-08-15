import OpenAI from 'openai';
import { z } from 'zod';
import type { RecommendationRequestWeights } from '../models/types';

const WeightsSchema = z.object({
  overall_rating: z.number().min(0).max(1).optional(),
  fairness_transparency: z.number().min(0).max(1).optional(),
  assignments_match_content: z.number().min(0).max(1).optional(),
  grading_ease: z.number().min(0).max(1).optional(),
  teaching_quality: z.number().min(0).max(1).optional(),
  course_recommended: z.number().min(0).max(1).optional(),
  assessment_alignment: z.number().min(0).max(1).optional(),
  grading_type_match: z.number().min(0).max(1).optional(),
  class_mode_match: z.number().min(0).max(1).optional(),
  extra_credit: z.number().min(0).max(1).optional(),
  faculty_pedigree: z.number().min(0).max(1).optional(),
  review_count_confidence: z.number().min(0).max(1).optional(),
}).refine(obj => {
  // Optional: ensure sum <= 1.5 (weights are relative, not strict prob.)
  const sum = Object.values(obj).reduce((a, v) => a + (typeof v === 'number' ? v : 0), 0);
  return sum > 0 && sum <= 2.5;
}, { message: 'Weights sum out of expected bounds' });

export async function formAnswersToWeights(formAnswers: Record<string, unknown>, client?: OpenAI): Promise<RecommendationRequestWeights> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set');
  const openai = client ?? new OpenAI({ apiKey });

  const system = `You are a course recommendation weight generator. Given a concise user profile (major, goals, preferences), return a compact JSON object mapping component weights (0..1) suitable for scoring with keys: overall_rating, fairness_transparency, grading_ease, teaching_quality, assessment_alignment, grading_type_match, class_mode_match, extra_credit, faculty_pedigree, review_count_confidence.`;

  const user = JSON.stringify({ formAnswers }, null, 2);

  const comp = await openai.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ]
  });

  const text = comp.choices?.[0]?.message?.content || '';
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    // Try to salvage by extracting a JSON block from the text
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try { json = JSON.parse(match[0]); } catch { /* ignore */ }
    }
    if (!json) {
      throw new Error('LLM did not return valid JSON');
    }
  }
  // Try strict schema first
  const parsed = WeightsSchema.safeParse(json);
  if (parsed.success) {
    return parsed.data as RecommendationRequestWeights;
  }
  // Lenient salvage: coerce known keys to numbers and clamp 0..1
  const keys: Array<keyof RecommendationRequestWeights> = [
    'overall_rating','fairness_transparency','assignments_match_content','grading_ease','teaching_quality','course_recommended','assessment_alignment','grading_type_match','class_mode_match','extra_credit','faculty_pedigree','review_count_confidence'
  ];
  const out: RecommendationRequestWeights = {};
  for (const k of keys) {
    const v = (json as any)[k];
    const num = typeof v === 'number' ? v : (typeof v === 'string' ? Number(v.trim()) : NaN);
    if (Number.isFinite(num)) {
      (out as any)[k] = Math.max(0, Math.min(1, num));
    }
  }
  // If nothing salvageable, fall back to safe defaults
  const sum = Object.values(out).reduce((a, v) => a + (typeof v === 'number' ? v : 0), 0);
  if (sum === 0) {
    return {
      overall_rating: 0.35,
      fairness_transparency: 0.15,
      grading_ease: 0.10,
      teaching_quality: 0.15,
      assessment_alignment: 0.10,
      grading_type_match: 0.05,
      class_mode_match: 0.05,
      extra_credit: 0.03,
      faculty_pedigree: 0.07,
      review_count_confidence: 0.10,
    };
  }
  return out;
}
