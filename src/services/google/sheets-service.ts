/**
 * Google Sheets service interface
 * Implementations: LocalSheetsService (direct API calls from browser)
 */

import {
  Class,
  Student,
  Test,
  Result,
  Mistake,
  Rubric,
  Config,
} from '@/types';

export interface SheetsService {
  /**
   * Initialize spreadsheet (create if doesn't exist)
   */
  initializeSpreadsheet(folderId: string): Promise<string>;

  /**
   * CRUD operations for each sheet
   */

  // Classes
  getClasses(schoolYear?: string): Promise<Class[]>;
  getClass(id: string): Promise<Class | null>;
  createClass(classData: Omit<Class, 'id' | 'created_at'>): Promise<Class>;
  updateClass(id: string, classData: Partial<Class>): Promise<Class>;
  deleteClass(id: string): Promise<void>;

  // Students
  getStudents(classId?: string): Promise<Student[]>;
  getStudent(id: string): Promise<Student | null>;
  createStudent(studentData: Omit<Student, 'id'>): Promise<Student>;
  updateStudent(id: string, studentData: Partial<Student>): Promise<Student>;
  deleteStudent(id: string): Promise<void>;

  // Tests
  getTests(classId?: string): Promise<Test[]>;
  getTest(id: string): Promise<Test | null>;
  createTest(testData: Omit<Test, 'id' | 'created_at'>): Promise<Test>;
  updateTest(id: string, testData: Partial<Test>): Promise<Test>;
  deleteTest(id: string): Promise<void>;

  // Results
  getResults(filters?: ResultFilters): Promise<Result[]>;
  getResult(id: string): Promise<Result | null>;
  createResult(resultData: Omit<Result, 'id'>): Promise<Result>;
  updateResult(id: string, resultData: Partial<Result>): Promise<Result>;
  deleteResult(id: string): Promise<void>;

  // Mistakes
  getMistakes(resultId: string): Promise<Mistake[]>;
  createMistake(mistakeData: Omit<Mistake, 'id'>): Promise<Mistake>;
  updateMistake(id: string, mistakeData: Partial<Mistake>): Promise<Mistake>;
  deleteMistake(id: string): Promise<void>;

  // Rubrics
  getRubrics(testId: string): Promise<Rubric[]>;
  createRubric(rubricData: Omit<Rubric, 'id'>): Promise<Rubric>;
  updateRubric(id: string, rubricData: Partial<Rubric>): Promise<Rubric>;
  deleteRubric(id: string): Promise<void>;

  // Config
  getConfig(key: string): Promise<string | null>;
  setConfig(key: string, value: string): Promise<void>;
  getAllConfig(): Promise<Config[]>;
}

export interface ResultFilters {
  studentId?: string;
  testId?: string;
  classId?: string;
  schoolYear?: string;
  status?: Result['status'];
}
