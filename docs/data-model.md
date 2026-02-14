# grAIde - Data Model & Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         grAIde Web App                          │
│                                                                 │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐ │
│  │   Teacher    │      │   Teacher    │      │   Teacher    │ │
│  │   Portal 1   │      │   Portal 2   │      │   Portal N   │ │
│  └──────┬───────┘      └──────┬───────┘      └──────┬───────┘ │
│         │                     │                     │         │
│         └─────────────────────┼─────────────────────┘         │
│                               │                               │
│                    ┌──────────▼──────────┐                    │
│                    │  grAIde Database    │                    │
│                    │  (Metadata Only)    │                    │
│                    └──────────┬──────────┘                    │
└───────────────────────────────┼────────────────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │   Google Drive API    │
                    └───────────┬───────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
   ┌────▼─────┐          ┌─────▼──────┐         ┌─────▼──────┐
   │ Teacher  │          │  Teacher   │         │  Teacher   │
   │ 1 Drive  │          │  2 Drive   │         │  N Drive   │
   │          │          │            │         │            │
   │ /graide/ │          │  /graide/  │         │  /graide/  │
   │  /2024/  │          │   /2024/   │         │   /2024/   │
   │  /class5/│          │  /class7/  │         │  /class6/  │
   │  /*.jpg  │          │  /*.jpg    │         │  /*.jpg    │
   └──────────┘          └────────────┘         └────────────┘
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

**Google Drive (Teacher's Account):**
- ✅ Actual photos/scans of test papers
- ✅ Organized in folder structure
- ✅ Full resolution images

**grAIde Database:**
- ✅ Teacher info + Google Drive token
- ✅ Class lists (names, grade levels)
- ✅ Student names
- ✅ Test metadata (name, date, total points)
- ✅ Grades and scores
- ✅ Mistake patterns and analytics
- ✅ **Cross-references** to Google Drive files (file IDs, folder paths)
- ❌ NO photo storage - just pointers to Drive

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

## Example Folder Structure in Google Drive

```
📁 graide/
  📁 2024-2025/
    📁 Class-5A/
      📁 Test-1-Fractions/
        📄 student_ion_popescu.jpg
        📄 student_maria_ionescu.jpg
        📄 student_andrei_pop.jpg
      📁 Test-2-Decimals/
        📄 student_ion_popescu_p1.jpg
        📄 student_ion_popescu_p2.jpg
        📄 student_maria_ionescu.jpg
    📁 Class-7B/
      📁 Test-1-Algebra/
        📄 ...
```

---

Does this architecture match your vision? Any adjustments needed?
