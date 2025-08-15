import { getAnalysis, setAnalysis, AiSectionAnalysis } from './sectionAnalysisStore';
import type { SectionDetails } from '../models/types';

// Use Anthropic to analyze a section; here we sketch the call signature.
export async function analyzeSectionWithLLM(
  section: SectionDetails,
  anthropicClient: any
): Promise<AiSectionAnalysis> {
  const cached = getAnalysis(section.lsCode);
  if (cached) return cached;

  const text = [section.courseTitle, section.description, section.requirements, section.learningOutcomes].filter(Boolean).join('\n\n');
  const prompt = `You are analyzing a university course offering description to estimate academic rigor and attendance strictness.
Return ONLY JSON with keys: rigor_level (low|medium|high), attendance_strictness (low|medium|high), assessment_mix (object), workload_estimate (low|medium|high), confidence (0..1).`;

  const msg = await anthropicClient.messages.create({
    model: 'claude-3-5-sonnet-latest',
    max_tokens: 6000,
    temperature: 0,
    system: prompt,
    messages: [{ role: 'user', content: [{ type: 'text', text }] }]
  });
  const textOut = msg.content?.[0]?.type === 'text' ? msg.content[0].text : '{}';
  let json: any = {};
  try { json = JSON.parse(textOut); } catch { /* ignore */ }
  const out: AiSectionAnalysis = {
    lsCode: section.lsCode,
    rigor_level: ['low','medium','high'].includes(json.rigor_level) ? json.rigor_level : 'medium',
    attendance_strictness: ['low','medium','high'].includes(json.attendance_strictness) ? json.attendance_strictness : 'medium',
    assessment_mix: json.assessment_mix ?? {},
    workload_estimate: ['low','medium','high'].includes(json.workload_estimate) ? json.workload_estimate : 'medium',
    confidence: typeof json.confidence === 'number' ? Math.max(0, Math.min(1, json.confidence)) : 0.6,
  };
  setAnalysis(out);
  return out;
}
