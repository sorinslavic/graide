/**
 * Type definitions for Google Sheets data model
 * Matches the 7-sheet structure defined in docs/data-model.md
 */

export interface Class {
  id: string; // Internal ID for database operations
  subject: string; // e.g., "Matematică", "Limba Română"
  class_name: string; // e.g., "5A", "7B"
  grade_level: number; // 5, 6, 7, 8
  school_year: string; // e.g., "2025-2026"
  created_at: string;
}

export interface Student {
  id: string;
  class_name: string; // e.g., "5A" - shared across all subjects
  school_year: string; // e.g., "2025-2026"
  name: string;
  student_num?: string; // Optional student number/ID
}

export type AssessmentType = 'test' | 'homework' | 'project' | 'quiz';
export type GradingSystem = '1-10' | '1-100' | 'percentage' | 'points';
export type TestStatus = 'active' | 'archived';
export type SubmissionStatus = 'new' | 'correcting' | 'corrected' | 'absent';

export interface Test {
  id: string;
  name: string;
  type: AssessmentType;
  /** Comma-separated Class IDs this test was assigned to */
  class_ids: string;
  given_at: string; // ISO date — when the test was handed out
  deadline: string; // ISO date — same as given_at for in-class tests; later for homework
  grading_system: GradingSystem;
  max_score: number; // 10 for "1-10", 100 for "1-100", etc.
  status: TestStatus;
  /** Optional Drive folder ID linking to all photos for this test */
  drive_folder_id?: string;
  created_at: string;
}

export interface Submission {
  id: string;
  test_id: string; // FK → Test
  student_id: string; // FK → Student
  class_id: string; // FK → Class (denormalized for easy querying)
  status: SubmissionStatus;
  grade?: number; // Final grade (teacher-set or AI-suggested + approved)
  ai_grade?: number; // AI suggested grade (filled in Milestone 4)
  /** Comma-separated Drive file IDs attached to this submission */
  drive_file_ids?: string;
  notes?: string; // Teacher notes
  corrected_at?: string;
  created_at: string;
}

export interface SubmissionDetail {
  id: string;
  submission_id: string; // FK → Submission
  file_id?: string; // Which photo this detail refers to (from drive_file_ids)
  question_num: number;
  mistake_type:
    | 'wrong_formula'
    | 'calculation_error'
    | 'concept_error'
    | 'transcription_error'
    | 'incomplete'
    | 'other';
  description: string;
  points_deducted: number;
  ai_notes?: string;
  teacher_notes?: string;
  ai_confidence?: number; // 0.0–1.0
}

/** @deprecated Use Submission instead */
export interface Result {
  id: string;
  student_id: string;
  test_id: string;
  subject: string;
  class_name: string;
  school_year: string;
  drive_file_id: string;
  file_path: string;
  total_score?: number;
  ai_score?: number;
  status: 'pending_grade' | 'graded' | 'reviewed';
  assigned_at?: string;
  graded_at?: string;
  reviewed_at?: string;
  teacher_notes?: string;
}

export interface Mistake {
  id: string;
  result_id: string;
  question_num: number;
  mistake_type:
    | 'wrong_formula'
    | 'calculation_error'
    | 'concept_error'
    | 'transcription_error'
    | 'incomplete'
    | 'other';
  description: string;
  points_deducted: number;
  ai_confidence: number;
}

export interface Rubric {
  id: string;
  test_id: string;
  question_num: number;
  answer_key: string;
  partial_credit?: string;
  max_points: number;
}

export interface Config {
  key: string;
  value: string;
}

/**
 * Sheet names in the graide-data spreadsheet
 */
export const SHEET_NAMES = {
  CLASSES: 'Classes',
  STUDENTS: 'Students',
  TESTS: 'Tests',
  SUBMISSIONS: 'Submissions',
  SUBMISSION_DETAILS: 'SubmissionDetails',
  RUBRICS: 'Rubrics',
  CONFIG: 'Config',
  /** @deprecated Use SUBMISSIONS */
  RESULTS: 'Results',
  /** @deprecated Use SUBMISSION_DETAILS */
  MISTAKES: 'Mistakes',
} as const;
