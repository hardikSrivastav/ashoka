import type { ClassMode, GradingType } from './enums';

export interface ScheduleCourse {
  code: string; // FC-xxxx
  title: string;
  facultyNames: string[];
  facultyEmails: string[];
  status: 'ACTIVE' | 'INACTIVE' | string;
}

export interface SectionDetails {
  lsCode: string; // FC-xxxx-n
  courseCode: string; // base FC-xxxx
  courseTitle: string;
  description?: string;
  requirements?: string;
  learningOutcomes?: string;
  facultyNames: string[];
  facultyEmails: string[];
}

export interface SectionRatings {
  lsCode: string; // ratings.course_code
  semester?: string;
  overallRating?: number; // 0..5
  transparentGrading?: number; // 0..5
  assignmentsMatchContent?: number; // 0..5
  gradesEasy?: number; // 0..5
  gradesFairly?: number; // 0..5
  goodLecturerOrator?: number; // 0..5
  courseRecommended?: number; // 0..5
  totalReviews?: number; // integer
  gradingType?: GradingType;
  classMode?: ClassMode;
  extraCredit?: boolean | 'unknown';
}

export interface FacultyProfile {
  targetName?: string;
  email?: string;
  title?: string;
  education?: string;
  department?: string;
  profileUrl?: string;
  researchInterests?: string;
}

export interface JoinedSection extends SectionDetails {
  ratings?: SectionRatings;
  hasRecentRatings: boolean;
}

export interface RecommendationRequestWeights {
  overall_rating?: number;
  fairness_transparency?: number;
  assignments_match_content?: number;
  grading_ease?: number;
  teaching_quality?: number;
  course_recommended?: number;
  assessment_alignment?: number;
  grading_type_match?: number;
  class_mode_match?: number;
  extra_credit?: number;
  faculty_pedigree?: number;
  review_count_confidence?: number;
}

export interface RecommendationOptions {
  numPreferredSections?: number; // default 2
  detailedExplanations?: boolean; // default false
}

export interface RecommendationRequest {
  mode?: 'scoring' | 'ai';
  weights?: RecommendationRequestWeights;
  hardConstraints?: {
    active_only?: boolean;
    term?: string; // e.g., Monsoon 2025
  };
  formAnswers?: Record<string, unknown>; // optional path using LLM (Anthropic)
  options?: RecommendationOptions;
}
