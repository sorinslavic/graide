# grAIde - Data Model & Architecture

## High-Level Architecture (Google Sheets + Drive)

```
┌─────────────────────────────────────────────────────────────────┐
│                    grAIde Web App (localhost:3000)              │
│                         React + Vite                            │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Teacher Interface                     │  │
│  │  - View/Grade Tests    - Manage Classes                 │  │
│  │  - View Mistakes       - View Student History           │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬───────────────┬────────────────────────┘
                         │               │
                         │               │
          ┌──────────────▼─────┐   ┌─────▼──────────────┐
          │  Google Sheets API │   │ Google Drive API   │
          └──────────┬──────────┘   └─────┬──────────────┘
                     │                    │
                     │                    │
          ┌──────────▼──────────┐   ┌─────▼──────────────┐
          │   Google Sheet      │   │   Google Drive     │
          │  "graide-data"      │   │   /graide/         │
          │                     │   │                    │
          │  Sheets:            │   │  Folder Structure: │
          │  - Teachers         │   │  /2024-2025/       │
          │  - Classes          │   │    /Class-5A/      │
          │  - Students         │   │      /Test-1/      │
          │  - Tests            │   │        *.jpg       │
          │  - Grades           │   │                    │
          │  - Mistakes         │   │                    │
          └─────────────────────┘   └────────────────────┘
               ▲                           ▲
               │                           │
               └───────────────┬───────────┘
                               │
                        Teacher can edit
                        directly in Sheets
                        or upload to Drive
```

## Entity Relationship Diagram

```
┌──────────────┐
│   TEACHER    │
│──────────────│
│ id           │
│ name         │
│ email        │
│ gdrive_token │◄─────┐
└──────┬───────┘      │
       │              │ Links their Google Drive
       │              │
       │ teaches      │
       │ (1:N)        │
       ▼              │
┌──────────────┐      │
│    CLASS     │      │
│──────────────│      │
│ id           │      │
│ teacher_id   │──────┘
│ name         │ (e.g., "Class 5A", "Class 7B")
│ grade_level  │ (e.g., 5, 6, 7, 8)
│ school_year  │ (e.g., "2024-2025")
└──────┬───────┘
       │
       │ has
       │ (1:N)
       ▼
┌──────────────┐
│   STUDENT    │
│──────────────│
│ id           │
│ class_id     │
│ name         │
│ student_num  │ (optional student number)
└──────┬───────┘
       │
       │ submits
       │ (1:N)
       ▼
┌──────────────────┐
│ TEST_SUBMISSION  │
│──────────────────│
│ id               │
│ student_id       │
│ test_id          │──────┐
│ gdrive_file_id   │◄─┐   │
│ gdrive_folder    │  │   │
│ total_score      │  │   │
│ graded_at        │  │   │
│ status           │  │   │
└──────┬───────────┘  │   │
       │              │   │
       │ has          │   │
       │ (1:N)        │   │
       ▼              │   │
┌──────────────────┐  │   │
│  MISTAKE         │  │   │
│──────────────────│  │   │
│ id               │  │   │
│ submission_id    │  │   │
│ question_num     │  │   │
│ mistake_type     │  │   │ References photo
│ description      │  │   │ stored in
│ points_deducted  │  │   │ Google Drive
└──────────────────┘  │   │
                      │   │
       ┌──────────────┘   │
       │                  │
       │                  │ belongs to
       │                  │ (N:1)
       │                  │
       │                  ▼
       │           ┌──────────────┐
       │           │     TEST     │
       │           │──────────────│
       │           │ id           │
       └───────────│ class_id     │
  Points to       │ teacher_id   │
  actual photo    │ name         │
  in teacher's    │ date         │
  Google Drive    │ total_points │
                  │ num_questions│
                  └──────────────┘
```

## Data Flow

### 1. Teacher Setup
```
Teacher → grAIde → Google OAuth → Teacher's Google Drive
                                       │
                                       ▼
                              grAIde stores access token
```

### 2. Test Upload & Grading Flow
```
Teacher takes photos → Uploads to Google Drive
         │                    /graide/2024/Class5A/Test3/
         │
         ▼
    grAIde scans folder → Detects new photos
         │
         ▼
    AI processes each photo
         │
         ├──→ Recognizes student name
         ├──→ Extracts answers
         ├──→ Grades problems
         └──→ Identifies mistakes
         │
         ▼
    Stores in Database:
         ├── Test submission metadata
         ├── Grade/score
         ├── Mistake patterns
         └── Google Drive file reference (NOT the photo itself)
```

### 3. What's Stored Where

**Google Drive:**
- ✅ Actual photos/scans of test papers
- ✅ Organized in folder structure
- ✅ Full resolution images
- ✅ Teacher uploads photos here

**Google Sheets (Teacher's "graide-data" spreadsheet):**
- ✅ Teacher info (name, email, Google account)
- ✅ Class lists (names, grade levels, school year)
- ✅ Student names and details
- ✅ Test metadata (name, date, total points, number of questions)
- ✅ Grades and scores (per student, per test)
- ✅ Mistake patterns and analytics
- ✅ **Cross-references** to Google Drive files (Drive file IDs, folder paths)
- ✅ **Editable by teacher** - can fix names, add students, etc. directly in Sheets
- ❌ NO photo storage - just references to Drive

**Local Machine (Teacher's Laptop):**
- ✅ grAIde web app code
- ✅ Google API credentials (.env file)
- ✅ Browser cache for faster loading
- ❌ NO persistent database - everything in Google Sheets/Drive

## Key Architectural Decisions

### ✅ Advantages
1. **No storage costs** - photos stay in teacher's Drive
2. **Privacy** - teachers own their data
3. **Scalability** - each teacher's Drive is isolated
4. **Familiar** - teachers already use Google Drive
5. **Backup** - Google handles backups automatically

### 🎯 Implementation Notes
- Use Google Drive API to read photos
- Store Drive file IDs as references
- Support folder-based organization (class/test/date)
- Teacher can access original photos anytime via Drive
- App only stores structured metadata + analytics

## Google Drive Folder Structure

**For Single Teacher (MVP):**
```
📁 graide/
  📁 2024-2025/
    📁 Class-5A/
      📁 Test-1-Fractions/
        📄 student_ion_popescu.jpg
        📄 student_maria_ionescu.jpg
      📁 Test-2-Decimals/
        📄 student_ion_popescu_p1.jpg
        📄 student_ion_popescu_p2.jpg
    📁 Class-7B/
      📁 Test-1-Algebra/
        📄 student_andrei_pop.jpg
```

**For Multiple Teachers (Shared School Drive):**
```
📁 graide-school/
  📁 2024-2025/
    📁 maria-popescu/        ← Teacher folder
      📁 Class-5A/
        📁 Test-1-Fractions/
          📄 student_ion.jpg
      📁 Class-7B/
        📁 Test-1-Algebra/
          📄 student_maria.jpg
    📁 ion-ionescu/
      📁 Class-6A/
        📁 Test-1-Geometry/
          📄 student_andrei.jpg
```

## Google Sheets Schema

**Sheet 1: Teachers**
```
┌────┬────────────────┬─────────────────────┬────────────────┐
│ ID │ Name           │ Email               │ Drive Folder   │
├────┼────────────────┼─────────────────────┼────────────────┤
│ 1  │ Maria Popescu  │ maria@school.ro     │ maria-popescu  │
│ 2  │ Ion Ionescu    │ ion@school.ro       │ ion-ionescu    │
└────┴────────────────┴─────────────────────┴────────────────┘
```

**Sheet 2: Classes**
```
┌────┬────────────┬──────────┬────────────┬─────────┐
│ ID │ Teacher_ID │ Name     │ Grade      │ Year    │
├────┼────────────┼──────────┼────────────┼─────────┤
│ 1  │ 1          │ Class 5A │ 5          │ 2024-25 │
│ 2  │ 1          │ Class 7B │ 7          │ 2024-25 │
│ 3  │ 2          │ Class 6A │ 6          │ 2024-25 │
└────┴────────────┴──────────┴────────────┴─────────┘
```

**Sheet 3: Students**
```
┌────┬──────────┬────────────────┬────────────┐
│ ID │ Class_ID │ Name           │ Number     │
├────┼──────────┼────────────────┼────────────┤
│ 1  │ 1        │ Ion Popescu    │ 12         │
│ 2  │ 1        │ Maria Ionescu  │ 13         │
│ 3  │ 2        │ Andrei Pop     │ 8          │
└────┴──────────┴────────────────┴────────────┘
```

**Sheet 4: Tests**
```
┌────┬──────────┬────────────────────┬────────────┬──────────────┬───────────┐
│ ID │ Class_ID │ Name               │ Date       │ Total_Points │ Questions │
├────┼──────────┼────────────────────┼────────────┼──────────────┼───────────┤
│ 1  │ 1        │ Test 1: Fractions  │ 2024-01-15 │ 100          │ 5         │
│ 2  │ 1        │ Test 2: Decimals   │ 2024-02-10 │ 100          │ 6         │
└────┴──────────┴────────────────────┴────────────┴──────────────┴───────────┘
```

**Sheet 5: Grades**
```
┌────┬────────────┬─────────┬───────┬────────────┬──────────────────────┐
│ ID │ Student_ID │ Test_ID │ Score │ Graded_At  │ Drive_File_ID        │
├────┼────────────┼─────────┼───────┼────────────┼──────────────────────┤
│ 1  │ 1          │ 1       │ 85    │ 2024-01-16 │ 1abc...xyz           │
│ 2  │ 2          │ 1       │ 92    │ 2024-01-16 │ 1def...uvw           │
└────┴────────────┴─────────┴───────┴────────────┴──────────────────────┘
```

**Sheet 6: Mistakes**
```
┌────┬──────────┬──────────────┬────────────────────┬─────────────┬──────────────┐
│ ID │ Grade_ID │ Question_Num │ Mistake_Type       │ Description │ Points_Lost  │
├────┼──────────┼──────────────┼────────────────────┼─────────────┼──────────────┤
│ 1  │ 1        │ 2            │ Wrong Formula      │ Used +      │ 10           │
│ 2  │ 1        │ 4            │ Calculation Error  │ 3+5=7       │ 5            │
└────┴──────────┴──────────────┴────────────────────┴─────────────┴──────────────┘
```

---

## Benefits of Google Sheets Approach

✅ **Teacher-Friendly**: Can edit student names, fix data directly in familiar interface
✅ **Zero Cost**: No database hosting fees
✅ **Easy Backup**: Just copy the spreadsheet
✅ **Version History**: Google tracks all changes automatically
✅ **Export**: Can export to Excel anytime for reporting
✅ **Collaborative**: School admin can access if needed
✅ **Simple Setup**: No database migrations or schema updates
