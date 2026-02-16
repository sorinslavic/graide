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

export interface Test {
  id: string;
  subject: string; // Reference to Class.subject
  class_name: string; // Reference to Class.class_name
  school_year: string; // Reference to Class.school_year
  name: string;
  date: string;
  total_points: number;
  num_questions: number;
  points_per_q: string; // Comma-separated: "10,10,20,30,30"
  created_at: string;
}

export interface Result {
  id: string;
  student_id: string; // Reference to Student.id
  test_id: string; // Reference to Test.id
  subject: string; // Reference to Class.subject (denormalized)
  class_name: string; // Reference to Class.class_name (denormalized)
  school_year: string; // Reference to Class.school_year (denormalized)
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
  RESULTS: 'Results',
  MISTAKES: 'Mistakes',
  RUBRICS: 'Rubrics',
  CONFIG: 'Config',
} as const;
