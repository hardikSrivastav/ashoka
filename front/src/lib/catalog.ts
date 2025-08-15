// Lightweight CSV readers to enrich course rows with catalogue and ratings
// Vite allows importing raw text with ?raw
// @ts-ignore
import seleniumCsv from '../../../good-csvs/ashoka_courses_selenium.csv?raw';
// @ts-ignore
import ratingsCsv from '../../../good-csvs/ashoka_course_ratings_fixed.csv?raw';

export interface SectionCatalogue {
  lsCode: string;
  title?: string;
  description?: string;
  requirements?: string;
}

export interface SectionRatings {
  lsCode: string;
  overallRating?: number;
  totalReviews?: number;
  gradingType?: string;
  classMode?: string;
  extraCredit?: string | boolean;
}

function safeNumber(v: string | undefined): number | undefined {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function parseCsv(text: string): string[][] {
  return text
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      // Simple CSV splitter (no embedded commas handling)
      // Good enough for our controlled fields we read below
      return line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map((s) => s.replace(/^"|"$/g, ''));
    });
}

// Build LSCode -> catalogue info
const seleniumRows = parseCsv(String(seleniumCsv));
const seleniumHeader = seleniumRows.shift() || [];
const h = (name: string) => seleniumHeader.indexOf(name);
const iTitle = h('course_title_table');
const iDesc = h('description');
const iReq = h('requirements');
const iLs = h('ls_code');

const catalogueByLs: Record<string, SectionCatalogue> = {};
for (const row of seleniumRows) {
  const ls = (row[iLs] || '').trim().toUpperCase();
  if (!ls) continue;
  if (!catalogueByLs[ls]) catalogueByLs[ls] = { lsCode: ls };
  catalogueByLs[ls].title = row[iTitle] || catalogueByLs[ls].title;
  catalogueByLs[ls].description = row[iDesc] || catalogueByLs[ls].description;
  catalogueByLs[ls].requirements = row[iReq] || catalogueByLs[ls].requirements;
}

// Build LSCode -> ratings info
const ratingRows = parseCsv(String(ratingsCsv));
const ratingHeader = ratingRows.shift() || [];
const rh = (name: string) => ratingHeader.indexOf(name);
const rCode = rh('course_code');
const rOverall = rh('overall_rating');
const rTotal = rh('total_reviews');
const rType = rh('grading_type');
const rMode = rh('class_mode');
const rExtra = rh('extra_credit');

const ratingsByLs: Record<string, SectionRatings> = {};
for (const row of ratingRows) {
  const ls = (row[rCode] || '').trim().toUpperCase();
  if (!ls) continue;
  ratingsByLs[ls] = {
    lsCode: ls,
    overallRating: safeNumber(row[rOverall]),
    totalReviews: safeNumber(row[rTotal]),
    gradingType: (row[rType] || '').toLowerCase(),
    classMode: (row[rMode] || '').toLowerCase(),
    extraCredit: (row[rExtra] || '').toLowerCase(),
  };
}

export function getCatalogue(lsCode: string): SectionCatalogue | undefined {
  return catalogueByLs[lsCode.toUpperCase()];
}

export function getRatings(lsCode: string): SectionRatings | undefined {
  return ratingsByLs[lsCode.toUpperCase()];
}
