import type { FacultyProfile, ScheduleCourse, SectionDetails, SectionRatings } from '../models/types';
import { normalizeEmail, normalizeName } from './normalize';

export interface Indices {
  courseByCode: Map<string, ScheduleCourse>;
  sectionsByCourse: Map<string, string[]>;
  sectionByLsCode: Map<string, SectionDetails>;
  ratingsBySection: Map<string, SectionRatings>;
  facultyByEmail: Map<string, FacultyProfile>;
  facultyByName: Map<string, FacultyProfile[]>;
}

export function buildIndices(data: {
  schedule: ScheduleCourse[];
  sections: SectionDetails[];
  ratings: SectionRatings[];
  faculties: FacultyProfile[];
}): Indices {
  const courseByCode = new Map<string, ScheduleCourse>();
  const sectionsByCourse = new Map<string, string[]>();
  const sectionByLsCode = new Map<string, SectionDetails>();
  const ratingsBySection = new Map<string, SectionRatings>();
  const facultyByEmail = new Map<string, FacultyProfile>();
  const facultyByName = new Map<string, FacultyProfile[]>();

  for (const c of data.schedule) {
    courseByCode.set(c.code, c);
  }

  for (const s of data.sections) {
    sectionByLsCode.set(s.lsCode, s);
    const arr = sectionsByCourse.get(s.courseCode) ?? [];
    arr.push(s.lsCode);
    sectionsByCourse.set(s.courseCode, arr);
  }

  for (const r of data.ratings) {
    ratingsBySection.set(r.lsCode, r);
  }

  for (const f of data.faculties) {
    if (f.email) {
      facultyByEmail.set(normalizeEmail(f.email), f);
    }
    if (f.targetName) {
      const key = normalizeName(f.targetName);
      const arr = facultyByName.get(key) ?? [];
      arr.push(f);
      facultyByName.set(key, arr);
    }
  }

  return { courseByCode, sectionsByCourse, sectionByLsCode, ratingsBySection, facultyByEmail, facultyByName };
}
