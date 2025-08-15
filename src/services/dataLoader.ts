import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import { normalizeClassMode, normalizeGradingType, normalizeBoolean } from '../models/enums';
import { normalizeCode, normalizeEmail, toNonEmptyArray, toNumberOrUndefined } from './normalize';
import type { FacultyProfile, ScheduleCourse, SectionDetails, SectionRatings } from '../models/types';

export interface LoadedData {
  schedule: ScheduleCourse[];
  sections: SectionDetails[];
  ratings: SectionRatings[];
  faculties: FacultyProfile[];
}

interface CsvRow { [key: string]: string }

async function readCsv(filePath: string): Promise<CsvRow[]> {
  return new Promise((resolve, reject) => {
    const rows: CsvRow[] = [];
    fs.createReadStream(filePath)
      .pipe(parse({ columns: true, skip_empty_lines: true, relax_quotes: true }))
      .on('data', (row: CsvRow) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', (err: Error) => reject(err));
  });
}

export async function loadAll(csvDir: string): Promise<LoadedData> {
  const schedulePath = path.join(csvDir, 'ashoka-course-schedule.csv');
  const seleniumPath = path.join(csvDir, 'ashoka_courses_selenium.csv');
  const ratingsPath = path.join(csvDir, 'ashoka_course_ratings_fixed.csv');
  const facultyPath = path.join(csvDir, 'ashoka_faculty_profiles.csv');

  const [scheduleRows, seleniumRows, ratingsRows, facultyRows] = await Promise.all([
    readCsv(schedulePath),
    readCsv(seleniumPath),
    readCsv(ratingsPath),
    readCsv(facultyPath),
  ]);

  const schedule: ScheduleCourse[] = scheduleRows.map(r => ({
    code: normalizeCode(r['Code']),
    title: (r['Title'] ?? '').trim(),
    facultyNames: toNonEmptyArray(r['Faculty Names']),
    facultyEmails: toNonEmptyArray(r['Faculty Emails']).map(normalizeEmail),
    status: (r['Status'] ?? '').trim(),
  }));

  const sections: SectionDetails[] = seleniumRows.map(r => {
    const ls = normalizeCode(r['ls_code'] ?? r['lsCode'] ?? r['LS_CODE']);
    // Derive base course code (FC-xxxx) from section code (FC-xxxx-n)
    const base = ls.replace(/-\d+$/, '');
    return {
      lsCode: ls,
      courseCode: base,
      courseTitle: (r['course_title_table'] ?? r['course_title'] ?? r['title'] ?? '').trim(),
      description: (r['description'] ?? '').trim(),
      requirements: (r['requirements'] ?? '').trim(),
      learningOutcomes: (r['learning_outcomes'] ?? '').trim(),
      facultyNames: toNonEmptyArray(r['faculty'] ?? r['faculty_table']).map(s => s.replace(/\s*\[[^\]]*\]/g, '').trim()),
      facultyEmails: toNonEmptyArray(r['faculty_table'] ?? '').flatMap(s => s.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) ?? []).map(normalizeEmail),
    };
  }).filter(s => s.lsCode && s.courseCode);

  const ratings: SectionRatings[] = ratingsRows.map(r => {
    const gradingTypeRaw = (r['grading_type'] ?? r['gradingType'] ?? r['Grading Type']) as string | undefined;
    const classModeRaw = (r['class_mode'] ?? r['classMode'] ?? r['Class Mode']) as string | undefined;
    const extraRaw = (r['extra_credit'] ?? r['extraCredit'] ?? r['Extra Credit']) as string | undefined;
    return {
      lsCode: normalizeCode(r['course_code'] ?? r['Course Code'] ?? r['ls_code']),
      semester: (r['semester'] ?? '').trim(),
      overallRating: toNumberOrUndefined(r['overall_rating']),
      transparentGrading: toNumberOrUndefined(r['transparent_grading']),
      assignmentsMatchContent: toNumberOrUndefined(r['assignments_match_content']),
      gradesEasy: toNumberOrUndefined(r['grades_easy']),
      gradesFairly: toNumberOrUndefined(r['grades_fairly']),
      goodLecturerOrator: toNumberOrUndefined(r['good_lecturer_orator']),
      courseRecommended: toNumberOrUndefined(r['course_recommended']),
      totalReviews: toNumberOrUndefined(r['total_reviews']) ?? 0,
      gradingType: normalizeGradingType(gradingTypeRaw),
      classMode: normalizeClassMode(classModeRaw),
      extraCredit: normalizeBoolean(extraRaw),
    };
  }).filter(r => r.lsCode);

  const faculties: FacultyProfile[] = facultyRows.map(r => ({
    targetName: (r['target_name'] ?? r['name'] ?? '').trim(),
    email: normalizeEmail(r['email']),
    title: (r['title'] ?? '').trim(),
    education: (r['education'] ?? '').trim(),
    department: (r['department'] ?? '').trim(),
    profileUrl: (r['profile_url'] ?? '').trim(),
    researchInterests: (r['research_interests'] ?? '').trim(),
  }));

  return { schedule, sections, ratings, faculties };
}
