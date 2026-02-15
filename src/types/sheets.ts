/**
 * Type definitions for Google Sheets data model
 * Matches the 7-sheet structure defined in docs/data-model.md
 */

export interface Class {
  id: string;
  name: string;
  grade_level: number;
  school_year: string;
  created_at: string;
}

export interface Student {
  id: string;
  class_id: string;
  name: string;
  student_num?: string;
}

export interface Test {
  id: string;
  class_id: string;
  name: string;
  date: string;
  total_points: number;
  num_questions: number;
  points_per_q: string; // Comma-separated: "10,10,20,30,30"
  created_at: string;
}

export interface Result {
  id: string;
  student_id: string;
  test_id: string;
  class_id: string;
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
  RESULTS: 'Results',
  MISTAKES: 'Mistakes',
  RUBRICS: 'Rubrics',
  CONFIG: 'Config',
} as const;
