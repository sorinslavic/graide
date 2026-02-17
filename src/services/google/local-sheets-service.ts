/**
 * Local Google Sheets Service Implementation
 * Makes direct API calls from browser using OAuth token
 */

import {
  Class,
  Student,
  Test,
  Submission,
  SubmissionDetail,
  Rubric,
  Config,
  SHEET_NAMES,
} from '@/types';
import { SheetsService, TestFilters, SubmissionFilters } from './sheets-service';
import { googleAuthService, AuthExpiredError } from '../auth/google-auth-service';

const SPREADSHEET_NAME = 'graide-data';
const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

/**
 * Current schema version. Bump this whenever sheet structure changes
 * (new sheets, new columns, updated README content, etc.)
 *
 * History:
 *   1 — initial schema (7 data sheets, no README, no schema_version)
 *   2 — added README sheet with documentation
 *   3 — replaced Results/Mistakes with Submissions/SubmissionDetails;
 *       updated Tests columns (type, class_ids, given_at, deadline,
 *       grading_system, max_score, status, drive_folder_id)
 */
export const SCHEMA_VERSION = 3;

/**
 * Schema definitions for each sheet (column headers)
 */
const SHEET_SCHEMAS = {
  README: [], // No headers - will be populated with documentation
  [SHEET_NAMES.CLASSES]: [
    'id',
    'subject',
    'class_name',
    'grade_level',
    'school_year',
    'created_at',
  ],
  [SHEET_NAMES.STUDENTS]: ['id', 'class_name', 'school_year', 'name', 'student_num'],
  [SHEET_NAMES.TESTS]: [
    'id',
    'name',
    'type',
    'class_ids',
    'given_at',
    'deadline',
    'grading_system',
    'max_score',
    'status',
    'drive_folder_id',
    'created_at',
  ],
  [SHEET_NAMES.SUBMISSIONS]: [
    'id',
    'test_id',
    'student_id',
    'class_id',
    'status',
    'grade',
    'ai_grade',
    'drive_file_ids',
    'notes',
    'corrected_at',
    'created_at',
  ],
  [SHEET_NAMES.SUBMISSION_DETAILS]: [
    'id',
    'submission_id',
    'file_id',
    'question_num',
    'mistake_type',
    'description',
    'points_deducted',
    'ai_notes',
    'teacher_notes',
    'ai_confidence',
  ],
  [SHEET_NAMES.RUBRICS]: [
    'id',
    'test_id',
    'question_num',
    'answer_key',
    'partial_credit',
    'max_points',
  ],
  [SHEET_NAMES.CONFIG]: ['key', 'value'],
};

export class LocalSheetsService implements SheetsService {
  private spreadsheetId: string | null = null;

  /**
   * Get OAuth access token
   */
  private async getAccessToken(): Promise<string> {
    const token = await googleAuthService.getToken();
    if (!token) {
      throw new Error('No authentication token available. Please sign in.');
    }
    return token;
  }

  /**
   * Make authenticated API request
   */
  private async fetchAPI(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const token = await this.getAccessToken();

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) throw new AuthExpiredError();
      const error = await response.text();
      throw new Error(`Sheets API error: ${response.status} - ${error}`);
    }

    return response;
  }

  /**
   * Initialize spreadsheet (create if doesn't exist)
   */
  async initializeSpreadsheet(folderId: string): Promise<string> {
    try {
      // Check if spreadsheet ID is cached
      const cachedId = localStorage.getItem('graide_spreadsheet_id');
      if (cachedId) {
        // Verify it still exists
        try {
          const response = await this.fetchAPI(
            `${SHEETS_API_BASE}/${cachedId}`
          );
          await response.json();
          this.spreadsheetId = cachedId;
          console.log('✅ Using existing spreadsheet:', cachedId);
          return cachedId;
        } catch {
          // Spreadsheet no longer exists, clear cache
          localStorage.removeItem('graide_spreadsheet_id');
        }
      }

      // Search for existing spreadsheet in the folder
      const existingId = await this.findSpreadsheetInFolder(folderId);
      if (existingId) {
        this.spreadsheetId = existingId;
        localStorage.setItem('graide_spreadsheet_id', existingId);
        console.log('✅ Found existing spreadsheet:', existingId);
        return existingId;
      }

      // Create new spreadsheet
      console.log('📝 Creating new graide-data spreadsheet...');
      const newId = await this.createSpreadsheet(folderId);
      this.spreadsheetId = newId;
      localStorage.setItem('graide_spreadsheet_id', newId);
      console.log('✅ Created new spreadsheet:', newId);
      return newId;
    } catch (error) {
      console.error('❌ Failed to initialize spreadsheet:', error);
      throw error;
    }
  }

  /**
   * Find spreadsheet in Drive folder
   */
  private async findSpreadsheetInFolder(
    folderId: string
  ): Promise<string | null> {
    try {
      const token = await this.getAccessToken();
      const query = `name='${SPREADSHEET_NAME}' and '${folderId}' in parents and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`;

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.files && data.files.length > 0) {
        return data.files[0].id;
      }
      return null;
    } catch (error) {
      console.error('Error searching for spreadsheet:', error);
      return null;
    }
  }

  /**
   * Create new spreadsheet with schema
   */
  private async createSpreadsheet(folderId: string): Promise<string> {
    const token = await this.getAccessToken();

    // Step 1: Create spreadsheet
    const createResponse = await fetch(`${SHEETS_API_BASE}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title: SPREADSHEET_NAME,
        },
        sheets: Object.keys(SHEET_SCHEMAS).map((sheetName) => ({
          properties: {
            title: sheetName,
          },
        })),
      }),
    });

    const spreadsheet = await createResponse.json();
    const spreadsheetId = spreadsheet.spreadsheetId;

    // Step 2: Move to folder
    await fetch(
      `https://www.googleapis.com/drive/v3/files/${spreadsheetId}?addParents=${folderId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Step 3: Add headers to data sheets
    const headerRequests = Object.entries(SHEET_SCHEMAS)
      .filter(([sheetName]) => sheetName !== 'README' && sheetName.length > 0)
      .map(([sheetName, headers]) => ({
        updateCells: {
          range: {
            sheetId: spreadsheet.sheets.find(
              (s: { properties: { title: string } }) =>
                s.properties.title === sheetName
            )?.properties.sheetId,
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: headers.length,
          },
          rows: [
            {
              values: headers.map((header) => ({
                userEnteredValue: { stringValue: header },
                userEnteredFormat: {
                  textFormat: { bold: true },
                  backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 },
                },
              })),
            },
          ],
          fields: 'userEnteredValue,userEnteredFormat',
        },
      }));

    await fetch(`${SHEETS_API_BASE}/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests: headerRequests }),
    });

    // Step 4: Populate README sheet
    await this.populateReadme(spreadsheetId, spreadsheet.sheets, token);

    return spreadsheetId;
  }

  /**
   * Populate README sheet with documentation
   */
  private async populateReadme(
    spreadsheetId: string,
    sheets: { properties: { title: string; sheetId: number } }[],
    token: string
  ): Promise<void> {
    const readmeSheet = sheets.find((s) => s.properties.title === 'README');
    if (!readmeSheet) return;

    const readmeContent = [
      ['📚 grAIde Data - README', '', '', ''],
      ['', '', '', ''],
      ['Welcome to grAIde!', '', '', ''],
      [
        'This spreadsheet contains all your grading data. You can view and edit it directly in Google Sheets.',
        '',
        '',
        '',
      ],
      ['', '', '', ''],
      ['📊 SHEETS OVERVIEW', '', '', ''],
      ['', '', '', ''],
      ['Sheet', 'Purpose', 'Key Fields', 'Notes'],
      [
        'Classes',
        'Subject-class combinations (Math-5A, etc.)',
        'subject, class_name, grade_level, school_year',
        'One row per subject-class (e.g., Math-5A, Romanian-5A)',
      ],
      [
        'Students',
        'Student information',
        'class_name, school_year, name, student_num',
        'Shared across subjects (class_name like "5A")',
      ],
      [
        'Tests',
        'Assessment definitions (tests, homework, projects)',
        'name, type, class_ids, given_at, deadline, grading_system',
        'One row per assessment; class_ids is comma-separated Class IDs',
      ],
      [
        'Submissions',
        'One per student per test — tracks grading status and photos',
        'test_id, student_id, class_id, status, grade, drive_file_ids',
        'Status: new → correcting → corrected | absent',
      ],
      [
        'SubmissionDetails',
        'Per-question details for each submission',
        'submission_id, question_num, mistake_type, points_deducted',
        'Linked to Submissions via submission_id',
      ],
      [
        'Rubrics',
        'Answer keys per test',
        'test_id, question_num, answer_key, max_points',
        'Linked to Tests via test_id',
      ],
      [
        'Config',
        'App settings (key-value)',
        'key, value',
        'System configuration',
      ],
      ['', '', '', ''],
      ['🔗 RELATIONSHIPS', '', '', ''],
      ['', '', '', ''],
      [
        'Class Name → Students',
        'Students linked by class_name (e.g., "5A") - shared across subjects',
        '',
        '',
      ],
      ['Tests → Classes', 'Tests.class_ids contains comma-separated Class IDs', '', ''],
      [
        'Tests + Students → Submissions',
        'One Submission per student per test (test_id + student_id + class_id)',
        '',
        '',
      ],
      [
        'Submissions → SubmissionDetails',
        'Each submission can have multiple per-question details (submission_id)',
        '',
        '',
      ],
      [
        'Tests → Rubrics',
        'Each test has answer keys for questions (test_id)',
        '',
        '',
      ],
      ['', '', '', ''],
      ['📝 FIELD DESCRIPTIONS', '', '', ''],
      ['', '', '', ''],
      ['Field', 'Type', 'Description', 'Example'],
      ['id', 'String', 'Unique identifier (auto-generated)', '1234567890-abc123'],
      ['subject', 'String', 'Subject name', 'Matematică, Limba Română'],
      ['class_name', 'String', 'Class identifier (shared across subjects)', '5A, 7B, 8C'],
      ['student_id', 'String', 'Reference to Students.id', '1234567890-abc123'],
      ['test_id', 'String', 'Reference to Tests.id', '1234567890-abc123'],
      ['submission_id', 'String', 'Reference to Submissions.id', '1234567890-abc123'],
      ['class_ids', 'String', 'Comma-separated Class IDs (Tests)', 'id1,id2,id3'],
      ['school_year', 'String', 'Academic year', '2025-2026'],
      ['grade_level', 'String', 'Grade number', '5, 6, 7, 8'],
      ['type', 'String', 'Assessment type', 'test, homework, project, quiz'],
      ['grading_system', 'String', 'Grading scale used', '1-10, 1-100, percentage, points'],
      ['status (Test)', 'String', 'Test status', 'active, archived'],
      ['status (Submission)', 'String', 'Submission status', 'new, correcting, corrected, absent'],
      [
        'mistake_type',
        'String',
        'Error category',
        'wrong_formula, calculation_error, concept_error',
      ],
      ['drive_file_ids', 'String', 'Comma-separated Drive file IDs for photos', 'fileId1,fileId2'],
      [
        'ai_confidence',
        'Number',
        'AI confidence score (0.0-1.0)',
        '0.95',
      ],
      ['', '', '', ''],
      ['✏️ EDITING DATA', '', '', ''],
      ['', '', '', ''],
      [
        '✅ You can edit:',
        'Student names, test metadata, grades, teacher notes',
        '',
        '',
      ],
      [
        '⚠️ Be careful:',
        'Do not delete ID columns or change IDs (breaks relationships)',
        '',
        '',
      ],
      [
        '🚫 Do not edit:',
        'drive_file_id, file_path (managed by grAIde)',
        '',
        '',
      ],
      ['', '', '', ''],
      ['💡 TIPS', '', '', ''],
      ['', '', '', ''],
      [
        '• Filter & Sort:',
        'Use Google Sheets filters to analyze data',
        '',
        '',
      ],
      [
        '• Export:',
        'Download as Excel (File → Download → Microsoft Excel)',
        '',
        '',
      ],
      [
        '• Backup:',
        'Google Sheets auto-saves, but you can make copies for backup',
        '',
        '',
      ],
      [
        '• Version History:',
        'File → Version history to see/restore previous versions',
        '',
        '',
      ],
      ['', '', '', ''],
      ['🔍 COMMON QUERIES', '', '', ''],
      ['', '', '', ''],
      [
        'Q: How do I see all grades for Class 5A?',
        'A: Go to Submissions sheet, filter by class_id',
        '',
        '',
      ],
      [
        'Q: How do I find mistakes for a specific student?',
        'A: Go to SubmissionDetails sheet, join with Submissions using submission_id',
        '',
        '',
      ],
      [
        'Q: Can I edit student names?',
        'A: Yes! Edit directly in Students sheet',
        '',
        '',
      ],
      [
        'Q: Can I change test grades?',
        'A: Yes! Edit grade in Submissions sheet',
        '',
        '',
      ],
      ['', '', '', ''],
      ['📧 NEED HELP?', '', '', ''],
      ['', '', '', ''],
      [
        'grAIde is open source!',
        'Report issues at: https://github.com/sorinslavic/graide',
        '',
        '',
      ],
      ['', '', '', ''],
      ['Last updated: ' + new Date().toISOString().split('T')[0], '', '', ''],
    ];

    // Convert to cell format with styling
    const rows = readmeContent.map((row, rowIndex) => ({
      values: row.map((cell, colIndex) => {
        const isTitle = rowIndex === 0;
        const isHeader =
          rowIndex === 5 ||
          rowIndex === 7 ||
          rowIndex === 18 ||
          rowIndex === 28 ||
          rowIndex === 41 ||
          rowIndex === 47 ||
          rowIndex === 53;
        const isColumnHeader =
          rowIndex === 7 ||
          rowIndex === 28 ||
          rowIndex === 30;

        return {
          userEnteredValue: { stringValue: cell },
          userEnteredFormat: {
            textFormat: {
              bold: isTitle || isHeader || isColumnHeader,
              fontSize: isTitle ? 16 : isHeader ? 14 : 10,
            },
            backgroundColor: isTitle
              ? { red: 0.2, green: 0.4, blue: 0.7 }
              : isHeader
              ? { red: 0.95, green: 0.95, blue: 0.95 }
              : isColumnHeader
              ? { red: 0.9, green: 0.9, blue: 0.9 }
              : { red: 1, green: 1, blue: 1 },
            textFormat: {
              ...{ bold: isTitle || isHeader || isColumnHeader },
              foregroundColor: isTitle
                ? { red: 1, green: 1, blue: 1 }
                : { red: 0, green: 0, blue: 0 },
            },
            wrapStrategy: 'WRAP',
          },
        };
      }),
    }));

    await fetch(`${SHEETS_API_BASE}/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            updateCells: {
              range: {
                sheetId: readmeSheet.properties.sheetId,
                startRowIndex: 0,
                endRowIndex: rows.length,
                startColumnIndex: 0,
                endColumnIndex: 4,
              },
              rows,
              fields: 'userEnteredValue,userEnteredFormat',
            },
          },
          // Set column widths
          {
            updateDimensionProperties: {
              range: {
                sheetId: readmeSheet.properties.sheetId,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 1,
              },
              properties: { pixelSize: 200 },
              fields: 'pixelSize',
            },
          },
          {
            updateDimensionProperties: {
              range: {
                sheetId: readmeSheet.properties.sheetId,
                dimension: 'COLUMNS',
                startIndex: 1,
                endIndex: 4,
              },
              properties: { pixelSize: 250 },
              fields: 'pixelSize',
            },
          },
        ],
      }),
    });
  }

  /**
   * Get spreadsheet ID (initialize if needed)
   */
  private async getSpreadsheetId(): Promise<string> {
    if (!this.spreadsheetId) {
      const folderId = localStorage.getItem('graide_folder_id');
      if (!folderId) {
        throw new Error(
          'No Drive folder configured. Please complete setup first.'
        );
      }
      await this.initializeSpreadsheet(folderId);
    }
    return this.spreadsheetId!;
  }

  /**
   * Read all rows from a sheet
   */
  private async readSheet(sheetName: string): Promise<string[][]> {
    const spreadsheetId = await this.getSpreadsheetId();
    const range = `${sheetName}!A2:ZZ`; // Skip header row

    const response = await this.fetchAPI(
      `${SHEETS_API_BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}`
    );

    const data = await response.json();
    return data.values || [];
  }

  /**
   * Append rows to a sheet
   */
  private async appendRows(
    sheetName: string,
    rows: string[][]
  ): Promise<void> {
    const spreadsheetId = await this.getSpreadsheetId();
    const range = `${sheetName}!A:A`;

    await this.fetchAPI(
      `${SHEETS_API_BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=RAW`,
      {
        method: 'POST',
        body: JSON.stringify({
          values: rows,
        }),
      }
    );
  }

  /**
   * Update a specific row
   */
  private async updateRow(
    sheetName: string,
    rowIndex: number,
    values: string[]
  ): Promise<void> {
    const spreadsheetId = await this.getSpreadsheetId();
    const range = `${sheetName}!A${rowIndex}:ZZ${rowIndex}`;

    await this.fetchAPI(
      `${SHEETS_API_BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`,
      {
        method: 'PUT',
        body: JSON.stringify({
          values: [values],
        }),
      }
    );
  }

  /**
   * Delete a row
   */
  private async deleteRow(sheetName: string, rowIndex: number): Promise<void> {
    const spreadsheetId = await this.getSpreadsheetId();

    // Get sheet ID
    const response = await this.fetchAPI(
      `${SHEETS_API_BASE}/${spreadsheetId}`
    );
    const spreadsheet = await response.json();
    const sheet = spreadsheet.sheets.find(
      (s: { properties: { title: string } }) =>
        s.properties.title === sheetName
    );

    if (!sheet) {
      throw new Error(`Sheet ${sheetName} not found`);
    }

    await this.fetchAPI(`${SHEETS_API_BASE}/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      body: JSON.stringify({
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: sheet.properties.sheetId,
                dimension: 'ROWS',
                startIndex: rowIndex - 1,
                endIndex: rowIndex,
              },
            },
          },
        ],
      }),
    });
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Convert row to object
   */
  private rowToObject<T>(headers: string[], row: string[]): T {
    const obj: Record<string, string> = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || '';
    });
    return obj as T;
  }

  /**
   * Convert object to row
   */
  private objectToRow(headers: string[], obj: Record<string, unknown>): string[] {
    return headers.map((header) => {
      const value = obj[header];
      return value !== undefined && value !== null ? String(value) : '';
    });
  }

  // ==================== CLASSES ====================

  async getClasses(schoolYear?: string): Promise<Class[]> {
    const rows = await this.readSheet(SHEET_NAMES.CLASSES);
    const headers = SHEET_SCHEMAS[SHEET_NAMES.CLASSES];

    let classes = rows.map((row) => this.rowToObject<Class>(headers, row));

    if (schoolYear) {
      classes = classes.filter((c) => c.school_year === schoolYear);
    }

    return classes;
  }

  async getClass(id: string): Promise<Class | null> {
    const classes = await this.getClasses();
    return classes.find((c) => c.id === id) || null;
  }

  async createClass(classData: Omit<Class, 'id' | 'created_at'>): Promise<Class> {
    const newClass: Class = {
      id: this.generateId(),
      ...classData,
      created_at: new Date().toISOString(),
    };

    const headers = SHEET_SCHEMAS[SHEET_NAMES.CLASSES];
    const row = this.objectToRow(headers, newClass);

    await this.appendRows(SHEET_NAMES.CLASSES, [row]);
    return newClass;
  }

  async updateClass(id: string, classData: Partial<Class>): Promise<Class> {
    const rows = await this.readSheet(SHEET_NAMES.CLASSES);
    const headers = SHEET_SCHEMAS[SHEET_NAMES.CLASSES];
    const rowIndex = rows.findIndex((row) => row[0] === id);

    if (rowIndex === -1) {
      throw new Error(`Class ${id} not found`);
    }

    const existingClass = this.rowToObject<Class>(headers, rows[rowIndex]);
    const updatedClass = { ...existingClass, ...classData };
    const row = this.objectToRow(headers, updatedClass);

    await this.updateRow(SHEET_NAMES.CLASSES, rowIndex + 2, row); // +2 for header + 0-index
    return updatedClass;
  }

  async deleteClass(id: string): Promise<void> {
    const rows = await this.readSheet(SHEET_NAMES.CLASSES);
    const rowIndex = rows.findIndex((row) => row[0] === id);

    if (rowIndex === -1) {
      throw new Error(`Class ${id} not found`);
    }

    await this.deleteRow(SHEET_NAMES.CLASSES, rowIndex + 2);
  }

  // ==================== STUDENTS ====================

  async getStudents(classId?: string): Promise<Student[]> {
    const rows = await this.readSheet(SHEET_NAMES.STUDENTS);
    const headers = SHEET_SCHEMAS[SHEET_NAMES.STUDENTS];

    let students = rows.map((row) => this.rowToObject<Student>(headers, row));

    if (classId) {
      students = students.filter((s) => s.class_id === classId);
    }

    return students;
  }

  async getStudent(id: string): Promise<Student | null> {
    const students = await this.getStudents();
    return students.find((s) => s.id === id) || null;
  }

  async createStudent(studentData: Omit<Student, 'id'>): Promise<Student> {
    const newStudent: Student = {
      id: this.generateId(),
      ...studentData,
    };

    const headers = SHEET_SCHEMAS[SHEET_NAMES.STUDENTS];
    const row = this.objectToRow(headers, newStudent);

    await this.appendRows(SHEET_NAMES.STUDENTS, [row]);
    return newStudent;
  }

  async updateStudent(id: string, studentData: Partial<Student>): Promise<Student> {
    const rows = await this.readSheet(SHEET_NAMES.STUDENTS);
    const headers = SHEET_SCHEMAS[SHEET_NAMES.STUDENTS];
    const rowIndex = rows.findIndex((row) => row[0] === id);

    if (rowIndex === -1) {
      throw new Error(`Student ${id} not found`);
    }

    const existingStudent = this.rowToObject<Student>(headers, rows[rowIndex]);
    const updatedStudent = { ...existingStudent, ...studentData };
    const row = this.objectToRow(headers, updatedStudent);

    await this.updateRow(SHEET_NAMES.STUDENTS, rowIndex + 2, row);
    return updatedStudent;
  }

  async deleteStudent(id: string): Promise<void> {
    const rows = await this.readSheet(SHEET_NAMES.STUDENTS);
    const rowIndex = rows.findIndex((row) => row[0] === id);

    if (rowIndex === -1) {
      throw new Error(`Student ${id} not found`);
    }

    await this.deleteRow(SHEET_NAMES.STUDENTS, rowIndex + 2);
  }

  // ==================== TESTS ====================

  async getTests(filters?: TestFilters): Promise<Test[]> {
    const rows = await this.readSheet(SHEET_NAMES.TESTS);
    const headers = SHEET_SCHEMAS[SHEET_NAMES.TESTS];

    let tests = rows.map((row) => this.rowToObject<Test>(headers, row));

    if (filters?.classId) {
      // class_ids is CSV — check if classId appears in the list
      tests = tests.filter((t) =>
        t.class_ids.split(',').map((s) => s.trim()).includes(filters.classId!)
      );
    }
    if (filters?.status) {
      tests = tests.filter((t) => t.status === filters.status);
    }

    return tests;
  }

  async getTest(id: string): Promise<Test | null> {
    const tests = await this.getTests();
    return tests.find((t) => t.id === id) || null;
  }

  async createTest(testData: Omit<Test, 'id' | 'created_at'>): Promise<Test> {
    const newTest: Test = {
      id: this.generateId(),
      ...testData,
      created_at: new Date().toISOString(),
    };

    const headers = SHEET_SCHEMAS[SHEET_NAMES.TESTS];
    const row = this.objectToRow(headers, newTest);

    await this.appendRows(SHEET_NAMES.TESTS, [row]);
    return newTest;
  }

  async updateTest(id: string, testData: Partial<Test>): Promise<Test> {
    const rows = await this.readSheet(SHEET_NAMES.TESTS);
    const headers = SHEET_SCHEMAS[SHEET_NAMES.TESTS];
    const rowIndex = rows.findIndex((row) => row[0] === id);

    if (rowIndex === -1) {
      throw new Error(`Test ${id} not found`);
    }

    const existingTest = this.rowToObject<Test>(headers, rows[rowIndex]);
    const updatedTest = { ...existingTest, ...testData };
    const row = this.objectToRow(headers, updatedTest);

    await this.updateRow(SHEET_NAMES.TESTS, rowIndex + 2, row);
    return updatedTest;
  }

  async deleteTest(id: string): Promise<void> {
    const rows = await this.readSheet(SHEET_NAMES.TESTS);
    const rowIndex = rows.findIndex((row) => row[0] === id);

    if (rowIndex === -1) {
      throw new Error(`Test ${id} not found`);
    }

    await this.deleteRow(SHEET_NAMES.TESTS, rowIndex + 2);
  }

  // ==================== SUBMISSIONS ====================

  async getSubmissions(filters?: SubmissionFilters): Promise<Submission[]> {
    const rows = await this.readSheet(SHEET_NAMES.SUBMISSIONS);
    const headers = SHEET_SCHEMAS[SHEET_NAMES.SUBMISSIONS];

    let submissions = rows.map((row) => this.rowToObject<Submission>(headers, row));

    if (filters?.testId) {
      submissions = submissions.filter((s) => s.test_id === filters.testId);
    }
    if (filters?.studentId) {
      submissions = submissions.filter((s) => s.student_id === filters.studentId);
    }
    if (filters?.classId) {
      submissions = submissions.filter((s) => s.class_id === filters.classId);
    }
    if (filters?.status) {
      submissions = submissions.filter((s) => s.status === filters.status);
    }

    return submissions;
  }

  async getSubmission(id: string): Promise<Submission | null> {
    const submissions = await this.getSubmissions();
    return submissions.find((s) => s.id === id) || null;
  }

  async createSubmission(data: Omit<Submission, 'id' | 'created_at'>): Promise<Submission> {
    const newSubmission: Submission = {
      id: this.generateId(),
      ...data,
      created_at: new Date().toISOString(),
    };

    const headers = SHEET_SCHEMAS[SHEET_NAMES.SUBMISSIONS];
    const row = this.objectToRow(headers, newSubmission as unknown as Record<string, unknown>);
    await this.appendRows(SHEET_NAMES.SUBMISSIONS, [row]);
    return newSubmission;
  }

  /**
   * Create one Submission (status: 'new') per student in the given class.
   * Called automatically when a test is assigned to a class.
   */
  async bulkCreateSubmissions(testId: string, classId: string): Promise<Submission[]> {
    const [students, cls] = await Promise.all([
      this.getStudents(),
      this.getClass(classId),
    ]);
    if (!cls) throw new Error(`Class ${classId} not found`);

    const studentsInClass = students.filter(
      (s) => s.class_name === cls.class_name && s.school_year === cls.school_year
    );

    const now = new Date().toISOString();
    const submissions: Submission[] = studentsInClass.map((student) => ({
      id: this.generateId(),
      test_id: testId,
      student_id: student.id,
      class_id: classId,
      status: 'new' as const,
      created_at: now,
    }));

    if (submissions.length === 0) return [];

    const headers = SHEET_SCHEMAS[SHEET_NAMES.SUBMISSIONS];
    const rows = submissions.map((s) =>
      this.objectToRow(headers, s as unknown as Record<string, unknown>)
    );
    await this.appendRows(SHEET_NAMES.SUBMISSIONS, rows);
    return submissions;
  }

  async updateSubmission(id: string, data: Partial<Submission>): Promise<Submission> {
    const rows = await this.readSheet(SHEET_NAMES.SUBMISSIONS);
    const headers = SHEET_SCHEMAS[SHEET_NAMES.SUBMISSIONS];
    const rowIndex = rows.findIndex((row) => row[0] === id);

    if (rowIndex === -1) throw new Error(`Submission ${id} not found`);

    const existing = this.rowToObject<Submission>(headers, rows[rowIndex]);
    const updated = { ...existing, ...data };
    const row = this.objectToRow(headers, updated as unknown as Record<string, unknown>);
    await this.updateRow(SHEET_NAMES.SUBMISSIONS, rowIndex + 2, row);
    return updated;
  }

  async deleteSubmission(id: string): Promise<void> {
    const rows = await this.readSheet(SHEET_NAMES.SUBMISSIONS);
    const rowIndex = rows.findIndex((row) => row[0] === id);
    if (rowIndex === -1) throw new Error(`Submission ${id} not found`);
    await this.deleteRow(SHEET_NAMES.SUBMISSIONS, rowIndex + 2);
  }

  // ==================== SUBMISSION DETAILS ====================

  async getSubmissionDetails(submissionId: string): Promise<SubmissionDetail[]> {
    const rows = await this.readSheet(SHEET_NAMES.SUBMISSION_DETAILS);
    const headers = SHEET_SCHEMAS[SHEET_NAMES.SUBMISSION_DETAILS];
    const details = rows.map((row) => this.rowToObject<SubmissionDetail>(headers, row));
    return details.filter((d) => d.submission_id === submissionId);
  }

  async createSubmissionDetail(data: Omit<SubmissionDetail, 'id'>): Promise<SubmissionDetail> {
    const newDetail: SubmissionDetail = {
      id: this.generateId(),
      ...data,
    };

    const headers = SHEET_SCHEMAS[SHEET_NAMES.SUBMISSION_DETAILS];
    const row = this.objectToRow(headers, newDetail as unknown as Record<string, unknown>);
    await this.appendRows(SHEET_NAMES.SUBMISSION_DETAILS, [row]);
    return newDetail;
  }

  async updateSubmissionDetail(id: string, data: Partial<SubmissionDetail>): Promise<SubmissionDetail> {
    const rows = await this.readSheet(SHEET_NAMES.SUBMISSION_DETAILS);
    const headers = SHEET_SCHEMAS[SHEET_NAMES.SUBMISSION_DETAILS];
    const rowIndex = rows.findIndex((row) => row[0] === id);

    if (rowIndex === -1) throw new Error(`SubmissionDetail ${id} not found`);

    const existing = this.rowToObject<SubmissionDetail>(headers, rows[rowIndex]);
    const updated = { ...existing, ...data };
    const row = this.objectToRow(headers, updated as unknown as Record<string, unknown>);
    await this.updateRow(SHEET_NAMES.SUBMISSION_DETAILS, rowIndex + 2, row);
    return updated;
  }

  async deleteSubmissionDetail(id: string): Promise<void> {
    const rows = await this.readSheet(SHEET_NAMES.SUBMISSION_DETAILS);
    const rowIndex = rows.findIndex((row) => row[0] === id);
    if (rowIndex === -1) throw new Error(`SubmissionDetail ${id} not found`);
    await this.deleteRow(SHEET_NAMES.SUBMISSION_DETAILS, rowIndex + 2);
  }

  // ==================== RUBRICS ====================

  async getRubrics(testId: string): Promise<Rubric[]> {
    const rows = await this.readSheet(SHEET_NAMES.RUBRICS);
    const headers = SHEET_SCHEMAS[SHEET_NAMES.RUBRICS];

    const rubrics = rows.map((row) => this.rowToObject<Rubric>(headers, row));
    return rubrics.filter((r) => r.test_id === testId);
  }

  async createRubric(rubricData: Omit<Rubric, 'id'>): Promise<Rubric> {
    const newRubric: Rubric = {
      id: this.generateId(),
      ...rubricData,
    };

    const headers = SHEET_SCHEMAS[SHEET_NAMES.RUBRICS];
    const row = this.objectToRow(headers, newRubric);

    await this.appendRows(SHEET_NAMES.RUBRICS, [row]);
    return newRubric;
  }

  async updateRubric(id: string, rubricData: Partial<Rubric>): Promise<Rubric> {
    const rows = await this.readSheet(SHEET_NAMES.RUBRICS);
    const headers = SHEET_SCHEMAS[SHEET_NAMES.RUBRICS];
    const rowIndex = rows.findIndex((row) => row[0] === id);

    if (rowIndex === -1) {
      throw new Error(`Rubric ${id} not found`);
    }

    const existingRubric = this.rowToObject<Rubric>(headers, rows[rowIndex]);
    const updatedRubric = { ...existingRubric, ...rubricData };
    const row = this.objectToRow(headers, updatedRubric);

    await this.updateRow(SHEET_NAMES.RUBRICS, rowIndex + 2, row);
    return updatedRubric;
  }

  async deleteRubric(id: string): Promise<void> {
    const rows = await this.readSheet(SHEET_NAMES.RUBRICS);
    const rowIndex = rows.findIndex((row) => row[0] === id);

    if (rowIndex === -1) {
      throw new Error(`Rubric ${id} not found`);
    }

    await this.deleteRow(SHEET_NAMES.RUBRICS, rowIndex + 2);
  }

  // ==================== SCHEMA MIGRATION ====================

  /**
   * Read the schema version stored in the Config sheet.
   * Returns 0 if the Config sheet has no schema_version entry (pre-v2).
   */
  async checkSchemaVersion(): Promise<{ upToDate: boolean; storedVersion: number }> {
    try {
      const versionStr = await this.getConfig('schema_version');
      const storedVersion = versionStr ? parseInt(versionStr, 10) : 0;
      return { upToDate: storedVersion >= SCHEMA_VERSION, storedVersion };
    } catch {
      // If Config sheet doesn't exist yet, treat as version 0
      return { upToDate: false, storedVersion: 0 };
    }
  }

  /**
   * Fetch the current list of sheet tabs from the spreadsheet.
   */
  private async getSheetsList(): Promise<{ title: string; sheetId: number }[]> {
    const spreadsheetId = await this.getSpreadsheetId();
    const response = await this.fetchAPI(
      `${SHEETS_API_BASE}/${spreadsheetId}?fields=sheets.properties(title,sheetId)`
    );
    const data = await response.json();
    return (data.sheets ?? []).map(
      (s: { properties: { title: string; sheetId: number } }) => ({
        title: s.properties.title,
        sheetId: s.properties.sheetId,
      })
    );
  }

  /**
   * Add a new sheet tab to the spreadsheet. Returns its sheetId.
   */
  private async addSheetTab(title: string): Promise<number> {
    const spreadsheetId = await this.getSpreadsheetId();
    const token = await this.getAccessToken();
    const response = await fetch(`${SHEETS_API_BASE}/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests: [{ addSheet: { properties: { title } } }] }),
    });
    const data = await response.json();
    return data.replies[0].addSheet.properties.sheetId as number;
  }

  /**
   * Write bold header row to a sheet tab.
   */
  private async writeHeaders(sheetId: number, headers: string[]): Promise<void> {
    const spreadsheetId = await this.getSpreadsheetId();
    const token = await this.getAccessToken();
    await fetch(`${SHEETS_API_BASE}/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [{
          updateCells: {
            range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: headers.length },
            rows: [{
              values: headers.map((h) => ({
                userEnteredValue: { stringValue: h },
                userEnteredFormat: { textFormat: { bold: true }, backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 } },
              })),
            }],
            fields: 'userEnteredValue,userEnteredFormat',
          },
        }],
      }),
    });
  }

  /**
   * Refresh the README sheet content using current sheet list.
   * Creates the README sheet if it doesn't exist.
   */
  private async refreshReadme(): Promise<void> {
    const spreadsheetId = await this.getSpreadsheetId();
    const token = await this.getAccessToken();
    let sheets = await this.getSheetsList();

    if (!sheets.find((s) => s.title === 'README')) {
      await this.addSheetTab('README');
      sheets = await this.getSheetsList();
    }

    // Adapt to the format expected by populateReadme
    const sheetsForReadme = sheets.map((s) => ({
      properties: { title: s.title, sheetId: s.sheetId },
    }));
    await this.populateReadme(spreadsheetId, sheetsForReadme, token);
  }

  /**
   * Reconcile the spreadsheet to the current schema version.
   * Idempotent — safe to call on an already up-to-date spreadsheet.
   *
   * What this does:
   *   - Ensures every sheet in SHEET_SCHEMAS exists (creates missing ones)
   *   - Refreshes README content
   *   - Writes schema_version to Config
   */
  async reconcileSchema(): Promise<void> {
    console.log('🔧 Starting schema reconciliation...');

    const sheets = await this.getSheetsList();
    const existingTitles = new Set(sheets.map((s) => s.title));

    // Ensure each expected sheet exists
    for (const [sheetName, headers] of Object.entries(SHEET_SCHEMAS)) {
      if (sheetName === 'README') continue; // handled separately below
      if (!existingTitles.has(sheetName)) {
        console.log(`  📋 Creating missing sheet: ${sheetName}`);
        const sheetId = await this.addSheetTab(sheetName);
        if (headers.length > 0) {
          await this.writeHeaders(sheetId, headers as string[]);
        }
      }
    }

    // Refresh README (create if missing, always update content)
    console.log('  📚 Refreshing README sheet');
    await this.refreshReadme();

    // Write current schema version to Config
    await this.setConfig('schema_version', String(SCHEMA_VERSION));

    console.log(`✅ Schema reconciliation complete (v${SCHEMA_VERSION})`);
  }

  // ==================== CONFIG ====================

  async getConfig(key: string): Promise<string | null> {
    const rows = await this.readSheet(SHEET_NAMES.CONFIG);
    const row = rows.find((r) => r[0] === key);
    return row ? row[1] : null;
  }

  async setConfig(key: string, value: string): Promise<void> {
    const rows = await this.readSheet(SHEET_NAMES.CONFIG);
    const rowIndex = rows.findIndex((r) => r[0] === key);

    if (rowIndex === -1) {
      // Key doesn't exist, append new row
      await this.appendRows(SHEET_NAMES.CONFIG, [[key, value]]);
    } else {
      // Key exists, update row
      await this.updateRow(SHEET_NAMES.CONFIG, rowIndex + 2, [key, value]);
    }
  }

  async getAllConfig(): Promise<Config[]> {
    const rows = await this.readSheet(SHEET_NAMES.CONFIG);
    return rows.map((row) => ({ key: row[0], value: row[1] }));
  }
}

// Export singleton instance
export const localSheetsService = new LocalSheetsService();
