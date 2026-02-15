# grAIde - Data Model

## High-Level Architecture (Google Sheets + Drive + Gemini)

```
┌─────────────────────────────────────────────────────────────────┐
│                    grAIde Web App (localhost:3000)               │
│                         React + Vite                            │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Teacher Interface                      │  │
│  │  - Photo Inbox        - Manage Classes                   │  │
│  │  - Grade Tests        - View Student History             │  │
│  │  - Review & Override  - Analytics Dashboard              │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────┬──────────────┬──────────────┬─────────────┘
                     │              │              │
          ┌──────────▼─────┐  ┌────▼────────┐  ┌──▼───────────┐
          │ Google Sheets  │  │ Google Drive │  │ Gemini API   │
          │ API            │  │ API          │  │ (AI Studio)  │
          └──────┬─────────┘  └────┬────────┘  └──┬───────────┘
                 │                 │               │
          ┌──────▼─────────┐  ┌────▼────────┐  ┌──▼───────────┐
          │ "graide-data"  │  │ Shared       │  │ Gemini 2.5   │
          │  spreadsheet   │  │ Folder       │  │ Flash        │
          │                │  │              │  │              │
          │ 7 sheets:      │  │ • Inbox      │  │ • Vision     │
          │ • Classes      │  │   (root)     │  │ • Grading    │
          │ • Students     │  │ • organized/ │  │ • Mistakes   │
          │ • Tests        │  │   Year/      │  │ • Feedback   │
          │ • Results      │  │   Class/     │  │              │
          │ • Mistakes     │  │   Test/      │  └──────────────┘
          │ • Rubrics      │  │              │
          │ • Config       │  └──────────────┘
          └────────────────┘
               ▲                      ▲
               │                      │
               └──────────┬───────────┘
                          │
                   Teacher can edit
                   directly in Sheets
                   or upload to Drive
```

## Entity Relationship Diagram

```
┌──────────────────┐
│      CLASS       │
│──────────────────│
│ id               │
│ name             │  (e.g., "5A", "7B")
│ grade_level      │  (e.g., 5, 6, 7, 8)
│ school_year      │  (e.g., "2025-2026")
│ created_at       │
└───────┬──────────┘
        │
        │ has (1:N)
        ▼
┌──────────────────┐
│     STUDENT      │
│──────────────────│
│ id               │
│ class_id         │
│ name             │
│ student_num      │  (optional)
└───────┬──────────┘
        │
        │ takes (N:M via Results)
        ▼
┌──────────────────┐         ┌──────────────────┐
│     RESULTS      │────────►│      TEST        │
│──────────────────│ N:1     │──────────────────│
│ id               │         │ id               │
│ student_id       │         │ class_id         │
│ test_id          │         │ name             │
│ class_id         │         │ date             │
│ school_year      │         │ total_points     │
│ drive_file_id    │◄──┐     │ num_questions    │
│ file_path        │   │     │ points_per_q     │  (e.g., "10,10,20,30,30")
│ total_score      │   │     │ created_at       │
│ status           │   │     └──────────────────┘
│ graded_at        │   │
│ reviewed_at      │   │     Points to actual photo
│ assigned_at      │   │     in teacher's Google Drive
└───────┬──────────┘   │
        │              │
        │ has (1:N)    │
        ▼              │
┌──────────────────┐   │
│     MISTAKE      │   │
│──────────────────│   │
│ id               │   │
│ result_id        │   │
│ question_num     │   │
│ mistake_type     │   │     (wrong_formula, calculation_error,
│ description      │   │      concept_error, transcription_error)
│ points_deducted  │   │
│ ai_confidence    │   │     (0.0 - 1.0, how sure the AI was)
└──────────────────┘   │
                       │
┌──────────────────┐   │
│     RUBRICS      │   │
│──────────────────│   │
│ id               │   │
│ test_id          │   │
│ question_num     │   │
│ answer_key       │   │     (expected answer / solution approach)
│ partial_credit   │   │     (rules for partial credit)
│ max_points       │   │
└──────────────────┘   │
                       │
┌──────────────────┐   │
│     CONFIG       │───┘
│──────────────────│
│ key              │     (settings key-value store)
│ value            │     (e.g., "folder_id", "default_school_year",
│                  │      "gemini_model", "grading_language")
└──────────────────┘
```

## Google Drive Folder Structure

### Shared Folder Model (MVP)

Teacher creates a folder, shares it with the app. Inside:

```
📁 [Teacher's Shared Folder]
├── 📊 graide-data                    (spreadsheet — auto-created by app)
├── 📷 IMG_20250215_1234.jpg          (inbox — unassigned photos)
├── 📷 IMG_20250215_1235.jpg          (inbox — unassigned photos)
├── 📷 IMG_20250215_1236.jpg          (inbox — unassigned photos)
└── 📁 organized/                     (auto-created by app)
    └── 📁 2025-2026/
        ├── 📁 5A/
        │   ├── 📁 Math-Test-3/
        │   │   ├── 📷 maria_popescu.jpg
        │   │   ├── 📷 andrei_ionescu.jpg
        │   │   ├── 📷 elena_dumitrescu_p1.jpg
        │   │   └── 📷 elena_dumitrescu_p2.jpg
        │   └── 📁 Math-Test-2/
        │       └── ...
        └── 📁 7B/
            └── ...
```

**Two zones:**
- **Inbox** (folder root): Loose photos dumped from phone — unsorted
- **Organized** (`organized/`): Photos sorted by app into `Year/Class/Test/student.jpg`

### Photo Upload Workflow
1. Teacher takes photos of tests on phone
2. Opens Google Drive app → navigates to shared folder → uploads all photos
3. Photos land in folder root (the "inbox")
4. Teacher opens grAIde → Photo Inbox shows new photos
5. Teacher assigns photos to students (class + test + student)
6. App moves assigned photos into `organized/` subfolders via Drive API
7. App records the mapping in the Results sheet

## Google Sheets Schema

All sheets live in a single spreadsheet called **"graide-data"**, auto-created inside the teacher's shared folder on first login.

---

### Sheet 1: Classes

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| id | string | Unique ID (auto-generated) | `c_001` |
| name | string | Class display name | `5A` |
| grade_level | number | Grade number | `5` |
| school_year | string | Academic year | `2025-2026` |
| created_at | datetime | When created | `2025-09-01T10:00:00Z` |

```
┌────────┬──────┬─────────────┬─────────────┬─────────────────────┐
│ id     │ name │ grade_level │ school_year │ created_at          │
├────────┼──────┼─────────────┼─────────────┼─────────────────────┤
│ c_001  │ 5A   │ 5           │ 2025-2026   │ 2025-09-01T10:00:00 │
│ c_002  │ 7B   │ 7           │ 2025-2026   │ 2025-09-01T10:00:00 │
│ c_003  │ 6A   │ 6           │ 2024-2025   │ 2024-09-01T10:00:00 │
└────────┴──────┴─────────────┴─────────────┴─────────────────────┘
```

**Notes:**
- No separate `teacher_id` — MVP is single-teacher. The spreadsheet itself is per-teacher.
- `school_year` allows filtering without separate spreadsheets per year.

---

### Sheet 2: Students

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| id | string | Unique ID | `s_001` |
| class_id | string | FK to Classes | `c_001` |
| name | string | Full name | `Ion Popescu` |
| student_num | string | Optional number/code | `12` |

```
┌────────┬──────────┬────────────────┬─────────────┐
│ id     │ class_id │ name           │ student_num │
├────────┼──────────┼────────────────┼─────────────┤
│ s_001  │ c_001    │ Ion Popescu    │ 12          │
│ s_002  │ c_001    │ Maria Ionescu  │ 13          │
│ s_003  │ c_002    │ Andrei Pop     │ 8           │
└────────┴──────────┴────────────────┴─────────────┘
```

---

### Sheet 3: Tests

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| id | string | Unique ID | `t_001` |
| class_id | string | FK to Classes | `c_001` |
| name | string | Test name | `Math Test 3: Fractions` |
| date | date | Test date | `2025-01-15` |
| total_points | number | Maximum score | `100` |
| num_questions | number | Number of questions | `5` |
| points_per_q | string | Points per question (comma-separated) | `10,10,20,30,30` |
| created_at | datetime | When created | `2025-01-14T18:00:00Z` |

```
┌────────┬──────────┬──────────────────────────┬────────────┬──────────────┬───────────┬───────────────┐
│ id     │ class_id │ name                     │ date       │ total_points │ questions │ points_per_q  │
├────────┼──────────┼──────────────────────────┼────────────┼──────────────┼───────────┼───────────────┤
│ t_001  │ c_001    │ Math Test 3: Fractions   │ 2025-01-15 │ 100          │ 5         │ 10,10,20,30,30│
│ t_002  │ c_001    │ Math Test 4: Decimals    │ 2025-02-10 │ 100          │ 6         │ 15,15,15,15,20,20│
└────────┴──────────┴──────────────────────────┴────────────┴──────────────┴───────────┴───────────────┘
```

**Notes:**
- `points_per_q` is a simple comma-separated string. The AI uses this to know how many points each question is worth.

---

### Sheet 4: Results

The central sheet connecting students, tests, photos, and grades. Each row = one student's submission for one test.

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| id | string | Unique ID | `r_001` |
| student_id | string | FK to Students | `s_001` |
| test_id | string | FK to Tests | `t_001` |
| class_id | string | FK to Classes (denormalized for easy queries) | `c_001` |
| school_year | string | Academic year (denormalized) | `2025-2026` |
| drive_file_id | string | Google Drive file ID of the photo | `1abc...xyz` |
| file_path | string | Path in organized/ folder | `organized/2025-2026/5A/Math-Test-3/ion_popescu.jpg` |
| total_score | number | Final score (after teacher review) | `85` |
| ai_score | number | AI's suggested score (before review) | `83` |
| status | string | Workflow state | `reviewed` |
| assigned_at | datetime | When photo was assigned to student | `2025-01-15T14:00:00Z` |
| graded_at | datetime | When AI graded | `2025-01-15T14:05:00Z` |
| reviewed_at | datetime | When teacher reviewed | `2025-01-15T14:10:00Z` |
| teacher_notes | string | Optional teacher comments | `Good effort on Q3` |

```
┌────────┬────────────┬─────────┬──────────┬─────────────┬───────────────┬────────────────────────┬───────┬──────────┬──────────────┐
│ id     │ student_id │ test_id │ class_id │ school_year │ drive_file_id │ file_path              │ score │ ai_score │ status       │
├────────┼────────────┼─────────┼──────────┼─────────────┼───────────────┼────────────────────────┼───────┼──────────┼──────────────┤
│ r_001  │ s_001      │ t_001   │ c_001    │ 2025-2026   │ 1abc...xyz    │ organized/.../ion.jpg  │ 85    │ 83       │ reviewed     │
│ r_002  │ s_002      │ t_001   │ c_001    │ 2025-2026   │ 1def...uvw    │ organized/.../maria.jpg│ 92    │ 92       │ reviewed     │
│ r_003  │ s_003      │ t_001   │ c_002    │ 2025-2026   │ 1ghi...rst    │ organized/.../andrei.  │       │          │ pending_grade│
└────────┴────────────┴─────────┴──────────┴─────────────┴───────────────┴────────────────────────┴───────┴──────────┴──────────────┘
```

**Status values:**
| Status | Meaning |
|--------|---------|
| `pending_grade` | Photo assigned to student, not yet graded by AI |
| `graded` | AI has graded, awaiting teacher review |
| `reviewed` | Teacher has reviewed and approved/adjusted the grade |

---

### Sheet 5: Mistakes

Each row = one mistake found by AI (or teacher) on a specific question of a specific result.

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| id | string | Unique ID | `m_001` |
| result_id | string | FK to Results | `r_001` |
| question_num | number | Which question (1-based) | `2` |
| mistake_type | string | Category of mistake | `wrong_formula` |
| description | string | What went wrong | `Used addition instead of multiplication` |
| points_deducted | number | Points lost for this mistake | `10` |
| ai_confidence | number | AI's confidence (0.0-1.0) | `0.92` |

```
┌────────┬───────────┬──────────────┬────────────────────┬────────────────────────────────┬──────────────┬───────────────┐
│ id     │ result_id │ question_num │ mistake_type       │ description                    │ points_lost  │ ai_confidence │
├────────┼───────────┼──────────────┼────────────────────┼────────────────────────────────┼──────────────┼───────────────┤
│ m_001  │ r_001     │ 2            │ wrong_formula      │ Used + instead of ×            │ 10           │ 0.95          │
│ m_002  │ r_001     │ 4            │ calculation_error  │ 3+5=7 (should be 8)            │ 5            │ 0.88          │
│ m_003  │ r_002     │ 3            │ concept_error      │ Confused area with perimeter   │ 8            │ 0.72          │
└────────┴───────────┴──────────────┴────────────────────┴────────────────────────────────┴──────────────┴───────────────┘
```

**Mistake types:**
| Type | Description |
|------|-------------|
| `wrong_formula` | Student used the wrong formula or approach |
| `calculation_error` | Arithmetic mistake (e.g., 3+5=7) |
| `concept_error` | Fundamental misunderstanding (e.g., area vs perimeter) |
| `transcription_error` | Copied a number wrong from one step to the next |
| `incomplete` | Student didn't finish the problem |
| `other` | Doesn't fit other categories |

---

### Sheet 6: Rubrics

Answer keys and grading rules per question per test. The AI uses this to evaluate student work.

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| id | string | Unique ID | `rb_001` |
| test_id | string | FK to Tests | `t_001` |
| question_num | number | Which question (1-based) | `1` |
| answer_key | string | Expected answer or solution approach | `3/4 + 1/2 = 5/4 = 1.25` |
| partial_credit | string | Rules for partial credit | `Half credit if correct method but wrong calculation` |
| max_points | number | Maximum points for this question | `20` |

```
┌────────┬─────────┬──────────────┬──────────────────────────────┬────────────────────────────────────┬────────────┐
│ id     │ test_id │ question_num │ answer_key                   │ partial_credit                     │ max_points │
├────────┼─────────┼──────────────┼──────────────────────────────┼────────────────────────────────────┼────────────┤
│ rb_001 │ t_001   │ 1            │ 3/4 + 1/2 = 5/4 = 1.25      │ Half credit if method is correct   │ 10         │
│ rb_002 │ t_001   │ 2            │ 2x + 5 = 15 → x = 5         │ Full credit for any valid approach │ 10         │
│ rb_003 │ t_001   │ 3            │ Area = π × r² = 78.5 cm²    │ Accept 78-79 range                 │ 20         │
└────────┴─────────┴──────────────┴──────────────────────────────┴────────────────────────────────────┴────────────┘
```

---

### Sheet 7: Config

Simple key-value store for app settings. Persisted in Sheets so they survive browser cache clears.

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| key | string | Setting name | `default_school_year` |
| value | string | Setting value | `2025-2026` |

```
┌──────────────────────┬───────────────────────┐
│ key                  │ value                 │
├──────────────────────┼───────────────────────┤
│ default_school_year  │ 2025-2026             │
│ teacher_name         │ Maria Popescu         │
│ teacher_email        │ maria@school.ro       │
│ gemini_model         │ gemini-2.5-flash      │
│ grading_language     │ ro                    │
│ folder_id            │ 1abc...xyz            │
└──────────────────────┴───────────────────────┘
```

**Notes:**
- No separate Teachers sheet needed for MVP (single teacher). Teacher info stored here.
- `folder_id` is backed up here as well as in localStorage for resilience.

---

## Data Flow

### 1. First Login
```
Teacher → Google OAuth → Grant permissions (Sheets + Drive)
    │
    ▼
Teacher pastes shared folder link → app extracts folder ID
    │
    ▼
App checks folder for "graide-data" spreadsheet
    │
    ├── Found → load existing data
    └── Not found → create spreadsheet with 7 empty sheets
```

### 2. Grading Workflow
```
Teacher takes 50 photos on phone
    │
    ▼
Uploads to shared Drive folder ("Send to Drive" — one action)
    │
    ▼
Opens grAIde → Photo Inbox shows 50 new photos
    │
    ▼
Assigns photos: pick class + test, tag each with student name
    │
    ▼
App moves photos → organized/[Year]/[Class]/[Test]/[Student].jpg
App writes Results rows (status: pending_grade)
    │
    ▼
Teacher clicks "Grade" → App sends photos + rubrics to Gemini
    │
    ▼
Gemini returns: scores per question, mistakes found, confidence
    │
    ▼
App writes to Results (ai_score, status: graded) + Mistakes sheet
    │
    ▼
Teacher reviews side-by-side (photo vs AI evaluation)
    │
    ▼
Teacher approves/adjusts → App updates Results (total_score, status: reviewed)
```

### 3. What's Stored Where

| Storage | What | Details |
|---------|------|---------|
| **Google Drive** | Photos | Actual test photos, organized in folders |
| **Google Sheets** | All structured data | Classes, students, tests, results, mistakes, rubrics, config |
| **Browser localStorage** | Session data | OAuth token, folder ID (also backed up in Config sheet) |
| **`.env` file** | API keys | Google OAuth credentials, Gemini API key |
| **Nothing stored locally** | No database | Everything persists in Google's cloud |

---

## Benefits of This Data Model

- **Teacher-friendly**: Can open Sheets and edit student names, fix data directly
- **Zero cost**: No database hosting fees
- **Easy backup**: Just copy the spreadsheet
- **Version history**: Google tracks all changes automatically
- **Export**: Can export to Excel anytime for reporting
- **Collaborative**: School admin can access if needed
- **Simple setup**: No database migrations — schema = sheet columns
- **Resilient**: Data survives browser clears, laptop changes (it's in the cloud)
- **Query-friendly**: Sheets API supports filtering and sorting
- **Denormalized where needed**: `class_id` and `school_year` in Results for fast queries without joins
