export const toNonEmptyArray = (value: string | undefined | null): string[] => {
  if (!value) return [];
  // split by common delimiters and emails separators
  return value
    .split(/[;,]|\n/g)
    .map(s => s.trim())
    .filter(Boolean);
};

export const toNumberOrUndefined = (v: string | number | undefined | null): number | undefined => {
  if (v === null || v === undefined) return undefined;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  return Number.isFinite(n) ? n : undefined;
};

export const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

export const clamp05 = (v: number): number => Math.max(0, Math.min(5, v));

export const normalizeCode = (code: string | undefined | null): string => (code ?? '').trim().toUpperCase();

export const normalizeEmail = (email: string | undefined | null): string => (email ?? '').trim().toLowerCase();

export const normalizeName = (name: string | undefined | null): string => (name ?? '').trim().toLowerCase();
