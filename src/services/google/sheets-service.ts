/**
 * Google Sheets service interface
 * Implementations: LocalSheetsService (direct API calls from browser)
 */

import {
  Class,
  Student,
  Test,
  Submission,
  SubmissionDetail,
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
  getTests(filters?: TestFilters): Promise<Test[]>;
  getTest(id: string): Promise<Test | null>;
  createTest(testData: Omit<Test, 'id' | 'created_at'>): Promise<Test>;
  updateTest(id: string, testData: Partial<Test>): Promise<Test>;
  deleteTest(id: string): Promise<void>;

  // Submissions
  getSubmissions(filters?: SubmissionFilters): Promise<Submission[]>;
  getSubmission(id: string): Promise<Submission | null>;
  createSubmission(data: Omit<Submission, 'id' | 'created_at'>): Promise<Submission>;
  /** Create one Submission per student in the given class for a test */
  bulkCreateSubmissions(testId: string, classId: string): Promise<Submission[]>;
  updateSubmission(id: string, data: Partial<Submission>): Promise<Submission>;
  deleteSubmission(id: string): Promise<void>;

  // Submission Details
  getSubmissionDetails(submissionId: string): Promise<SubmissionDetail[]>;
  createSubmissionDetail(data: Omit<SubmissionDetail, 'id'>): Promise<SubmissionDetail>;
  updateSubmissionDetail(id: string, data: Partial<SubmissionDetail>): Promise<SubmissionDetail>;
  deleteSubmissionDetail(id: string): Promise<void>;

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

export interface TestFilters {
  classId?: string;
  status?: Test['status'];
}

export interface SubmissionFilters {
  testId?: string;
  studentId?: string;
  classId?: string;
  status?: Submission['status'];
}

/**
 * Export implementations
 */
export { LocalSheetsService, localSheetsService } from './local-sheets-service';
