import type { FacultyProfile } from '../models/types';

const SENIORITY_KEYWORDS = ['professor', 'associate professor', 'assistant professor', 'visiting professor', 'director', 'head of'];
const PEDIGREE_KEYWORDS = ['ph.d', 'phd', 'oxford', 'cambridge', 'harvard', 'mit', 'stanford', 'yale', 'princeton', 'iit', 'iisc'];

export function computeFacultyPedigreeBoost(profiles: FacultyProfile[]): number {
  if (!profiles.length) return 0;
  let score = 0;
  for (const p of profiles) {
    const title = (p.title ?? '').toLowerCase();
    const edu = (p.education ?? '').toLowerCase();
    if (SENIORITY_KEYWORDS.some(k => title.includes(k))) score += 0.15;
    if (PEDIGREE_KEYWORDS.some(k => edu.includes(k))) score += 0.15;
  }
  // Cap total boost
  return Math.min(0.35, score);
}
