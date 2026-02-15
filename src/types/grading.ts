/**
 * Type definitions for grading domain
 * Adapted from Lovable design with grAIde-specific extensions
 */

import { Mistake } from './sheets';

export type Tool = 'pointer' | 'circle';

export type AnnotationStatus = 'correct' | 'incorrect' | 'neutral';

export interface Annotation {
  id: string;
  x: number; // Percentage (0-100)
  y: number; // Percentage (0-100)
  width: number; // Percentage (0-100)
  height: number; // Percentage (0-100)
  pageIndex: number;
  type: Tool;
  status: AnnotationStatus;
  questionNum?: number; // Link to specific question
  mistakeType?: Mistake['mistake_type']; // Classify the mistake
  aiConfidence?: number; // AI confidence score (0.0-1.0)
  comments?: Comment[];
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  isAI: boolean;
}

export interface TestPage {
  pageNumber: number;
  imageUrl: string; // Google Drive URL or local path
  label: string;
}

export interface GradingResult {
  resultId: string;
  studentName: string;
  testName: string;
  pages: TestPage[];
  annotations: Annotation[];
  totalScore?: number;
  aiScore?: number;
  status: 'pending_grade' | 'graded' | 'reviewed';
}

export interface QuestionGrade {
  questionNum: number;
  maxPoints: number;
  earnedPoints: number;
  status: AnnotationStatus;
  mistakes: Annotation[];
}
