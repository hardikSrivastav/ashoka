export type GradingType = 'absolute' | 'relative' | 'unknown';
export type ClassMode = 'offline' | 'online' | 'hybrid' | 'unknown';

export const normalizeGradingType = (raw: string | undefined | null): GradingType => {
  const v = (raw ?? '').trim().toLowerCase();
  if (['absolute', 'abs'].includes(v)) return 'absolute';
  if (['relative', 'rel'].includes(v)) return 'relative';
  return 'unknown';
};

export const normalizeClassMode = (raw: string | undefined | null): ClassMode => {
  const v = (raw ?? '').trim().toLowerCase();
  if (['offline', 'in-person', 'in person', 'on-campus', 'on campus'].includes(v)) return 'offline';
  if (['online', 'remote'].includes(v)) return 'online';
  if (['hybrid', 'blended'].includes(v)) return 'hybrid';
  return 'unknown';
};

export const normalizeBoolean = (raw: string | boolean | undefined | null): boolean | 'unknown' => {
  if (typeof raw === 'boolean') return raw;
  const v = (raw ?? '').trim().toLowerCase();
  if (['true', 'yes', 'y', '1'].includes(v)) return true;
  if (['false', 'no', 'n', '0'].includes(v)) return false;
  return 'unknown';
};
