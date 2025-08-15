import fs from 'fs';
import path from 'path';

export type AssessmentTag = 'projects' | 'exams' | 'assignments' | 'reading_load' | 'discussion_seminar' | 'labs';

export interface KeywordConfig { [tag: string]: string[] }

let keywords: KeywordConfig = {};

export function loadKeywords(configDir: string): void {
  const file = path.join(configDir, 'keywords.json');
  const raw = fs.readFileSync(file, 'utf8');
  keywords = JSON.parse(raw);
}

export function extractAssessmentTags(texts: Array<string | undefined | null>): AssessmentTag[] {
  const joined = texts.filter(Boolean).join(' ').toLowerCase();
  const tags: AssessmentTag[] = [];
  for (const [tag, words] of Object.entries(keywords)) {
    if (words.some(w => joined.includes(w.toLowerCase()))) {
      tags.push(tag as AssessmentTag);
    }
  }
  return tags;
}
