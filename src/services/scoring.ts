import type { ClassMode, GradingType } from '../models/enums';
import type { RecommendationRequestWeights, SectionRatings } from '../models/types';
import { clamp01 } from './normalize';

export interface SectionMetadataMatch {
  gradingTypeMatch: number; // 0..1
  classModeMatch: number; // 0..1
  extraCredit: number; // 0 or 1
  assessmentAlignment: number; // 0..1
  rigorAlignment?: number; // 0..1
  attendanceAlignment?: number; // 0..1
}

export interface ConfidenceFactors {
  reviewFactor: number; // 0..1
  recencyFactor: number; // 0..1
}

export interface SectionScoreBreakdown {
  ratingComponents: {
    overall?: number;
    transparency?: number;
    fairness?: number;
    lecturer?: number;
    recommendation?: number;
    gradingEase?: number;
  };
  metadata: SectionMetadataMatch;
  confidence: ConfidenceFactors;
  facultyBoost: number; // 0..1
  noRatingsPenalty: number; // 0..1 (subtracted)
  total: number; // 0..1
}

function normalizeRating05(x?: number): number { return x !== undefined ? clamp01(x / 5) : 0; }

export function computeSectionScore(
  weights: RecommendationRequestWeights,
  ratings: SectionRatings | undefined,
  metadata: SectionMetadataMatch,
  confidence: ConfidenceFactors,
  facultyBoost: number,
  useGradingEase: boolean,
  noRatingsPenalty: number,
): SectionScoreBreakdown {
  const w = {
    overall_rating: weights.overall_rating ?? 0.35,
    fairness_transparency: weights.fairness_transparency ?? 0.15,
    assignments_match_content: weights.assignments_match_content ?? 0.08,
    grading_ease: weights.grading_ease ?? 0.10,
    teaching_quality: weights.teaching_quality ?? 0.15,
    course_recommended: weights.course_recommended ?? 0.07,
    assessment_alignment: weights.assessment_alignment ?? 0.10,
    grading_type_match: weights.grading_type_match ?? 0.05,
    class_mode_match: weights.class_mode_match ?? 0.05,
    extra_credit: weights.extra_credit ?? 0.03,
    faculty_pedigree: weights.faculty_pedigree ?? 0.07,
    review_count_confidence: weights.review_count_confidence ?? 0.10,
  };

  const hasRatings = Boolean(ratings && ratings.overallRating !== undefined);
  const ratingComponents = {
    overall: normalizeRating05(ratings?.overallRating),
    transparency: normalizeRating05(ratings?.transparentGrading),
    assignmentsMatch: normalizeRating05(ratings?.assignmentsMatchContent),
    fairness: normalizeRating05(ratings?.gradesFairly),
    lecturer: normalizeRating05(ratings?.goodLecturerOrator),
    recommendation: normalizeRating05(ratings?.courseRecommended),
    gradingEase: useGradingEase ? normalizeRating05(ratings?.gradesEasy) : 0,
  };

  // Ratings subtotal (skip if not present)
  const ratingsSubtotal = hasRatings
    ? (w.overall_rating * (ratingComponents.overall ?? 0))
      + (w.fairness_transparency * (((ratingComponents.transparency ?? 0) + (ratingComponents.fairness ?? 0)) / 2))
      + (w.assignments_match_content * (ratingComponents.assignmentsMatch ?? 0))
      + (w.teaching_quality * (ratingComponents.lecturer ?? 0))
      + (w.course_recommended * (ratingComponents.recommendation ?? 0))
      + ((useGradingEase ? w.grading_ease : 0) * (ratingComponents.gradingEase ?? 0))
    : 0;

  const metadataSubtotal =
    (w.assessment_alignment * (metadata.assessmentAlignment)) +
    (w.grading_type_match * (metadata.gradingTypeMatch)) +
    (w.class_mode_match * (metadata.classModeMatch)) +
    (w.extra_credit * (metadata.extraCredit));

  const confidenceSubtotal = w.review_count_confidence * ((confidence.reviewFactor + confidence.recencyFactor) / 2);

  const facultySubtotal = w.faculty_pedigree * facultyBoost;

  // Normalize by the sum of effective weights to avoid saturation at 1
  const effectiveWeightSum =
    (hasRatings ? (w.overall_rating + w.fairness_transparency + w.teaching_quality + (useGradingEase ? w.grading_ease : 0)) : 0)
    + (hasRatings ? (w.assignments_match_content + w.course_recommended) : 0)
    + w.assessment_alignment + w.grading_type_match + w.class_mode_match + w.extra_credit
    + w.review_count_confidence + w.faculty_pedigree;

  const combined = ratingsSubtotal + metadataSubtotal + confidenceSubtotal + facultySubtotal;
  const normalized = effectiveWeightSum > 0 ? (combined / effectiveWeightSum) : 0;

  const penalty = hasRatings ? 0 : noRatingsPenalty;
  const total = clamp01(normalized - penalty);

  return {
    ratingComponents,
    metadata,
    confidence,
    facultyBoost,
    noRatingsPenalty: penalty,
    total,
  };
}

export function gradingTypeMatchScore(userPref: GradingType | 'no_preference', section: GradingType | undefined): number {
  if (userPref === 'no_preference') return 0.5;
  if (!section || section === 'unknown') return 0.5;
  return userPref === section ? 1 : 0;
}

export function classModeMatchScore(userPref: ClassMode | 'no_preference', section: ClassMode | undefined): number {
  if (userPref === 'no_preference') return 0.5;
  if (!section || section === 'unknown') return 0.5;
  return userPref === section ? 1 : 0;
}

export function reviewCountFactor(totalReviews?: number, riskTolerance: 'low' | 'medium' | 'high' = 'medium'): number {
  const n = Math.max(0, totalReviews ?? 0);
  const base = Math.log10(1 + n) / Math.log10(1 + 20); // saturate around 20 reviews
  const factor = riskTolerance === 'low' ? base : riskTolerance === 'high' ? 1 : (base * 0.8 + 0.2);
  return clamp01(factor);
}
