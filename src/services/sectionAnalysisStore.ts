import fs from 'fs';
import path from 'path';

export interface AiSectionAnalysis {
  lsCode: string;
  rigor_level: 'low' | 'medium' | 'high';
  attendance_strictness: 'low' | 'medium' | 'high';
  assessment_mix?: { [k: string]: number };
  workload_estimate?: 'low' | 'medium' | 'high';
  confidence?: number;
}

const DATA_DIR = 'data';
const FILE = path.join(DATA_DIR, 'section_analysis.json');

let inMemory: Record<string, AiSectionAnalysis> | null = null;

export function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function loadSectionAnalysis(): Record<string, AiSectionAnalysis> {
  ensureDataDir();
  if (!fs.existsSync(FILE)) {
    inMemory = {};
    return inMemory;
  }
  const raw = fs.readFileSync(FILE, 'utf8');
  try {
    const obj = JSON.parse(raw);
    inMemory = obj ?? {};
  } catch {
    inMemory = {};
  }
  return inMemory!;
}

export function saveSectionAnalysis(data: Record<string, AiSectionAnalysis>) {
  ensureDataDir();
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8');
  inMemory = data;
}

export function getAnalysis(lsCode: string): AiSectionAnalysis | undefined {
  if (!inMemory) loadSectionAnalysis();
  return inMemory![lsCode];
}

export function setAnalysis(entry: AiSectionAnalysis) {
  const all = inMemory ?? loadSectionAnalysis();
  all[entry.lsCode] = entry;
  saveSectionAnalysis(all);
}
