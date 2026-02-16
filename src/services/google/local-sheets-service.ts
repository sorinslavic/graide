/**
 * Local Google Sheets Service Implementation
 * Makes direct API calls from browser using OAuth token
 */

import {
  Class,
  Student,
  Test,
  Result,
  Mistake,
  Rubric,
  Config,
  SHEET_NAMES,
} from '@/types';
import { SheetsService, ResultFilters } from './sheets-service';
import { googleAuthService } from '../auth/google-auth-service';

const SPREADSHEET_NAME = 'graide-data';
const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

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
    'subject',
    'class_name',
    'school_year',
    'name',
    'date',
    'total_points',
    'num_questions',
    'points_per_q',
    'created_at',
  ],
  [SHEET_NAMES.RESULTS]: [
    'id',
    'student_id',
    'test_id',
    'subject',
    'class_name',
    'school_year',
    'drive_file_id',
    'file_path',
    'total_score',
    'ai_score',
    'status',
    'assigned_at',
    'graded_at',
    'reviewed_at',
    'teacher_notes',
  ],
  [SHEET_NAMES.MISTAKES]: [
    'id',
    'result_id',
    'question_num',
    'mistake_type',
    'description',
    'points_deducted',
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
        'Test metadata',
        'subject, class_name, school_year, name, date',
        'Linked by subject+class_name+year',
      ],
      [
        'Results',
        'Student test submissions',
        'student_id, test_id, total_score, status',
        'Central table linking photos to grades',
      ],
      [
        'Mistakes',
        'Error tracking per question',
        'result_id, question_num, mistake_type, points_deducted',
        'Linked to Results via result_id',
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
      ['Subject + Class Name → Tests', 'Tests linked by subject+class_name+year', '', ''],
      [
        'Students + Tests → Results',
        'Each student submission for a test (student_id, test_id)',
        '',
        '',
      ],
      [
        'Results → Mistakes',
        'Each result can have multiple mistakes (result_id)',
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
      ['result_id', 'String', 'Reference to Results.id', '1234567890-abc123'],
      ['school_year', 'String', 'Academic year', '2025-2026'],
      ['grade_level', 'String', 'Grade number', '5, 6, 7, 8'],
      ['status', 'String', 'Grading status', 'pending_grade, graded, reviewed'],
      [
        'mistake_type',
        'String',
        'Error category',
        'wrong_formula, calculation_error, concept_error',
      ],
      ['drive_file_id', 'String', 'Google Drive file ID', 'abc123xyz789'],
      [
        'file_path',
        'String',
        'Path in organized/ folder',
        'organized/2025-2026/5A/Math-Test-3/maria.jpg',
      ],
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
        'A: Go to Results sheet, filter by class_id',
        '',
        '',
      ],
      [
        'Q: How do I find mistakes for a specific student?',
        'A: Go to Mistakes sheet, join with Results using result_id',
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
        'Q: Can I change test scores?',
        'A: Yes! Edit total_score in Results sheet',
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

  async getTests(classId?: string): Promise<Test[]> {
    const rows = await this.readSheet(SHEET_NAMES.TESTS);
    const headers = SHEET_SCHEMAS[SHEET_NAMES.TESTS];

    let tests = rows.map((row) => this.rowToObject<Test>(headers, row));

    if (classId) {
      tests = tests.filter((t) => t.class_id === classId);
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

  // ==================== RESULTS ====================

  async getResults(filters?: ResultFilters): Promise<Result[]> {
    const rows = await this.readSheet(SHEET_NAMES.RESULTS);
    const headers = SHEET_SCHEMAS[SHEET_NAMES.RESULTS];

    let results = rows.map((row) => this.rowToObject<Result>(headers, row));

    if (filters) {
      if (filters.studentId) {
        results = results.filter((r) => r.student_id === filters.studentId);
      }
      if (filters.testId) {
        results = results.filter((r) => r.test_id === filters.testId);
      }
      if (filters.classId) {
        results = results.filter((r) => r.class_id === filters.classId);
      }
      if (filters.schoolYear) {
        results = results.filter((r) => r.school_year === filters.schoolYear);
      }
      if (filters.status) {
        results = results.filter((r) => r.status === filters.status);
      }
    }

    return results;
  }

  async getResult(id: string): Promise<Result | null> {
    const results = await this.getResults();
    return results.find((r) => r.id === id) || null;
  }

  async createResult(resultData: Omit<Result, 'id'>): Promise<Result> {
    const newResult: Result = {
      id: this.generateId(),
      ...resultData,
    };

    const headers = SHEET_SCHEMAS[SHEET_NAMES.RESULTS];
    const row = this.objectToRow(headers, newResult);

    await this.appendRows(SHEET_NAMES.RESULTS, [row]);
    return newResult;
  }

  async updateResult(id: string, resultData: Partial<Result>): Promise<Result> {
    const rows = await this.readSheet(SHEET_NAMES.RESULTS);
    const headers = SHEET_SCHEMAS[SHEET_NAMES.RESULTS];
    const rowIndex = rows.findIndex((row) => row[0] === id);

    if (rowIndex === -1) {
      throw new Error(`Result ${id} not found`);
    }

    const existingResult = this.rowToObject<Result>(headers, rows[rowIndex]);
    const updatedResult = { ...existingResult, ...resultData };
    const row = this.objectToRow(headers, updatedResult);

    await this.updateRow(SHEET_NAMES.RESULTS, rowIndex + 2, row);
    return updatedResult;
  }

  async deleteResult(id: string): Promise<void> {
    const rows = await this.readSheet(SHEET_NAMES.RESULTS);
    const rowIndex = rows.findIndex((row) => row[0] === id);

    if (rowIndex === -1) {
      throw new Error(`Result ${id} not found`);
    }

    await this.deleteRow(SHEET_NAMES.RESULTS, rowIndex + 2);
  }

  // ==================== MISTAKES ====================

  async getMistakes(resultId: string): Promise<Mistake[]> {
    const rows = await this.readSheet(SHEET_NAMES.MISTAKES);
    const headers = SHEET_SCHEMAS[SHEET_NAMES.MISTAKES];

    const mistakes = rows.map((row) => this.rowToObject<Mistake>(headers, row));
    return mistakes.filter((m) => m.result_id === resultId);
  }

  async createMistake(mistakeData: Omit<Mistake, 'id'>): Promise<Mistake> {
    const newMistake: Mistake = {
      id: this.generateId(),
      ...mistakeData,
    };

    const headers = SHEET_SCHEMAS[SHEET_NAMES.MISTAKES];
    const row = this.objectToRow(headers, newMistake);

    await this.appendRows(SHEET_NAMES.MISTAKES, [row]);
    return newMistake;
  }

  async updateMistake(id: string, mistakeData: Partial<Mistake>): Promise<Mistake> {
    const rows = await this.readSheet(SHEET_NAMES.MISTAKES);
    const headers = SHEET_SCHEMAS[SHEET_NAMES.MISTAKES];
    const rowIndex = rows.findIndex((row) => row[0] === id);

    if (rowIndex === -1) {
      throw new Error(`Mistake ${id} not found`);
    }

    const existingMistake = this.rowToObject<Mistake>(headers, rows[rowIndex]);
    const updatedMistake = { ...existingMistake, ...mistakeData };
    const row = this.objectToRow(headers, updatedMistake);

    await this.updateRow(SHEET_NAMES.MISTAKES, rowIndex + 2, row);
    return updatedMistake;
  }

  async deleteMistake(id: string): Promise<void> {
    const rows = await this.readSheet(SHEET_NAMES.MISTAKES);
    const rowIndex = rows.findIndex((row) => row[0] === id);

    if (rowIndex === -1) {
      throw new Error(`Mistake ${id} not found`);
    }

    await this.deleteRow(SHEET_NAMES.MISTAKES, rowIndex + 2);
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
