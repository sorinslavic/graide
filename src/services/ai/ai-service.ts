/**
 * AI Grading service interface
 * Implementations: LocalAIService (direct Gemini API calls from browser)
 */

import { Rubric, Mistake } from '@/types';

export interface AIGradingService {
  /**
   * Grade a test submission using AI
   * @param photoUrls - URLs to test photos (can be multiple pages)
   * @param rubrics - Answer key and grading rubric per question
   * @returns AI grading results with scores and detected mistakes
   */
  gradeSubmission(
    photoUrls: string[],
    rubrics: Rubric[]
  ): Promise<AIGradingResult>;
}

export interface AIGradingResult {
  totalScore: number;
  maxScore: number;
  questionGrades: QuestionGrade[];
  mistakes: DetectedMistake[];
  overallFeedback?: string;
}

export interface QuestionGrade {
  questionNum: number;
  earnedPoints: number;
  maxPoints: number;
  isCorrect: boolean;
  feedback?: string;
}

export interface DetectedMistake {
  questionNum: number;
  mistakeType: Mistake['mistake_type'];
  description: string;
  pointsDeducted: number;
  confidence: number; // 0.0-1.0
  boundingBox?: {
    // Location on page (percentages)
    x: number;
    y: number;
    width: number;
    height: number;
    pageIndex: number;
  };
}
