# grAIde - Claude Context File

> AI-powered grading assistant for teachers. This file provides quick context for Claude Code to understand the project.

## Project Status

**Current Phase:** Specification Complete → Ready for Development
**Next Milestone:** Project scaffold (React + Vite + TypeScript)
**No source code yet** - all documentation complete, implementation pending

**UI Design Reference:** Lovable-generated mock at https://github.com/sorinslavic/grade-grader-hero
- Beautiful 3-column grading interface (thumbnails | canvas | comments)
- Annotation-based review system
- We'll adapt this design to fit grAIde's AI-first workflow

## Quick Overview

grAIde combines "grading" with "AI" to help math teachers (grades 5-8, Romanian middle school) save time grading tests. The app cuts grading time by 60-80% while automatically tracking mistakes and surfacing patterns.

**Problem:** Teachers spend 4-6 hours every weekend grading 60-90 test papers
**Solution:** Photo-based upload → AI grades → teacher reviews → done in 1-2 hours

## Tech Stack

- **Frontend:** React 18+ + Vite + TypeScript + shadcn/ui + Tailwind CSS
- **State:** React Context (no Redux/Zustand needed)
- **Database:** Google Sheets API (zero-cost, teacher-editable)
- **Storage:** Google Drive API (teacher's own Drive)
- **AI:** Google Gemini 2.5 Flash (free tier, no credit card needed)
- **Charts:** Recharts (for analytics)
- **Auth:** Google OAuth 2.0
- **Deployment:** Local-first (localhost:3000), no backend server needed for MVP

## Architecture Principles

### 1. Local-First Design
- App runs on `localhost:3000` on teacher's laptop
- Zero hosting costs, zero deployment complexity
- Teacher owns all data in their Google account
- Can deploy to cloud later if needed

### 2. Service Layer Pattern (Interface-Based)
**Critical:** All business logic uses TypeScript interfaces. This allows swapping implementations without changing UI code.

```typescript
// Interface (contract)
export interface AIGradingService {
  gradeSubmission(photos: string[], answerKey: AnswerKey): Promise<GradingResult>;
}

// MVP: Direct browser calls (safe on localhost)
export class LocalAIGradingService implements AIGradingService { ... }

// Future: Backend proxy (when deployed to cloud)
export class RemoteAIGradingService implements AIGradingService { ... }
```

**Services to implement:**
- `AuthService` - Google OAuth
- `SheetsService` - CRUD on Google Sheets
- `DriveService` - File operations in Drive
- `PhotoInboxService` - Photo sorting and assignment
- `AIGradingService` - Gemini Vision API calls
- `GradingEngine` - Orchestrates photo → AI → grade workflow
- `AnalyticsEngine` - Patterns and trends from Sheets data

### 3. Google Sheets as Database
Single spreadsheet: `graide-data` (7 sheets):
1. **Classes** - Class rosters (5A, 7B, etc.)
2. **Students** - Student names linked to classes
3. **Tests** - Test metadata (name, date, points per question)
4. **Results** - Central sheet: student + test + photo + grade + status
5. **Mistakes** - Error tracking (question, type, points deducted)
6. **Rubrics** - Answer keys per test/question
7. **Config** - Key-value settings store

**Why Sheets?**
- Teacher can edit directly (familiar Excel-like interface)
- Built-in version history and backup
- Zero hosting costs
- Easy export to Excel
- No migrations needed

### 4. Google Drive Folder Structure

```
📁 [Teacher's Shared Folder]
├── 📊 graide-data                    (spreadsheet - auto-created)
├── 📷 IMG_001.jpg                    (inbox - unassigned photos)
├── 📷 IMG_002.jpg                    (inbox)
└── 📁 organized/                     (auto-created by app)
    └── 📁 2025-2026/
        ├── 📁 5A/
        │   └── 📁 Math-Test-3/
        │       ├── 📷 maria_popescu.jpg
        │       └── 📷 andrei_ionescu.jpg
        └── 📁 7B/
            └── ...
```

**Two zones:**
- **Inbox** (folder root): Loose photos dumped from phone
- **Organized** (`organized/`): Photos sorted by app into Year/Class/Test/student.jpg

## Key Features

### MVP Features (Must-Have)
1. **Photo Inbox** - Bulk upload from phone, quick sorting to students
2. **AI Grading** - Gemini Vision reads handwriting, evaluates math, assigns points
3. **Teacher Review** - Side-by-side (photo vs AI), easy overrides
4. **Mistake Tracking** - Auto-classify errors (wrong_formula, calculation_error, etc.)
5. **Pattern Detection** - Class-wide trends, per-student history
6. **Google Sheets Integration** - All data in spreadsheet teacher can edit

### V1 Features (Future)
- Shareable test links for students (no login needed)
- Enhanced pattern analysis and recommendations
- Multi-teacher support

### V2+ Features (Long-term)
- Full student portal with authentication
- Subject expansion (language, history, geography)
- Per-student OCR tuning

## Data Model Details

### Results Sheet (Central Table)
Each row = one student's submission for one test

| Column | Type | Description |
|--------|------|-------------|
| id | string | Unique ID |
| student_id | string | FK to Students |
| test_id | string | FK to Tests |
| class_id | string | FK to Classes (denormalized) |
| school_year | string | e.g., "2025-2026" |
| drive_file_id | string | Google Drive file ID |
| file_path | string | `organized/2025-2026/5A/Math-Test-3/student.jpg` |
| total_score | number | Final score (after teacher review) |
| ai_score | number | AI's suggested score |
| status | string | `pending_grade` → `graded` → `reviewed` |
| assigned_at | datetime | When photo assigned |
| graded_at | datetime | When AI graded |
| reviewed_at | datetime | When teacher reviewed |

### Mistakes Sheet
Each row = one mistake on one question

| Column | Description |
|--------|-------------|
| result_id | FK to Results |
| question_num | Which question (1-based) |
| mistake_type | `wrong_formula`, `calculation_error`, `concept_error`, etc. |
| description | What went wrong |
| points_deducted | Points lost |
| ai_confidence | 0.0-1.0 |

## Photo Inbox Workflow (Critical Feature)

**Problem:** Teacher photographs 50 tests, needs to assign them to students
**Solution:** Photo Inbox UI

### Upload (Phone)
1. Take photos of all tests
2. Open Google Drive app → navigate to shared folder
3. Upload all photos → they land in folder root (inbox)

### Sort (App)
1. Teacher opens grAIde → "Photo Inbox" badge shows "50 new"
2. App lists all images in folder root (excludes `organized/` subfolder)
3. Teacher workflow:
   - Select class + test (dropdowns at top)
   - Click photo → pick student from list
   - Photo gets checkmark + student name overlay
   - Repeat for all photos (keyboard shortcuts available)
   - Click "Assign All" → app moves photos to `organized/Year/Class/Test/student.jpg`
   - App writes rows to Results sheet (status: `pending_grade`)

**Impact:** 50 photos sorted in ~2 minutes instead of 20+ minutes of manual folder management

## Grading Workflow

```
1. Teacher takes 50 photos on phone
2. Uploads to shared Drive folder (one action - "Send to Drive")
3. Opens grAIde → Photo Inbox shows 50 new
4. Assigns photos: pick class + test, tag each with student
5. App moves photos to organized/, writes Results rows
6. Teacher clicks "Grade" → app sends photos + rubrics to Gemini
7. Gemini returns: scores, mistakes, confidence
8. App writes to Results (ai_score, status: graded) + Mistakes sheet
9. Teacher reviews side-by-side (photo vs AI)
10. Teacher approves/adjusts → final grade saved (status: reviewed)
```

## Project Structure (When Implemented)

```
graide/
├── src/
│   ├── components/          # UI layer (React)
│   │   ├── photo-inbox/     #   Photo sorting UI
│   │   ├── grading/         #   Grading & review
│   │   ├── classes/         #   Class management
│   │   ├── students/        #   Student management
│   │   ├── tests/           #   Test setup
│   │   ├── analytics/       #   Dashboard
│   │   └── common/          #   Shared components
│   ├── services/            # Business logic (interfaces + impls)
│   │   ├── auth/            #   Google OAuth
│   │   ├── google/          #   Sheets & Drive APIs
│   │   ├── ai/              #   Gemini AI grading
│   │   ├── photos/          #   Photo inbox logic
│   │   └── grading/         #   Grading orchestration
│   ├── hooks/               # React hooks (connects services to UI)
│   ├── utils/               # Helper functions
│   ├── types/               # TypeScript types
│   ├── App.tsx              # Main app
│   └── main.tsx             # Entry point
├── public/                  # Static assets
├── docs/                    # Documentation (complete)
│   ├── project-overview.md
│   ├── architecture.md
│   ├── data-model.md
│   ├── features.md
│   ├── spec-qa.md
│   └── development.md
├── .env                     # API keys (not committed)
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## Development Milestones

**Milestone 0: Project Scaffold** (NEXT)
- [ ] Initialize React + Vite + TypeScript
- [ ] Set up folder structure
- [ ] Configure ESLint, Prettier, Tailwind
- [ ] Create `.env.example`

**Milestone 1: Auth + Google APIs**
- [ ] Google OAuth login service
- [ ] Google Sheets service (CRUD)
- [ ] Google Drive service (upload/list/move)
- [ ] Auto-create "graide-data" spreadsheet on first login

**Milestone 2: Class & Student Management**
- [ ] Class management UI
- [ ] Student management UI
- [ ] Wire to Sheets service

**Milestone 3: Photo Inbox**
- [ ] Photo upload to Drive
- [ ] Photo Inbox UI (grid view, sorting)
- [ ] Assign photos to students
- [ ] Move to organized/ folder
- [ ] Write to Results sheet

**Milestone 4: AI Grading Engine**
- [ ] AI service interface + implementation
- [ ] Prompt engineering for math grading
- [ ] Parse AI responses
- [ ] Store in Results + Mistakes sheets

**Milestone 5: Teacher Review Interface**
- [ ] Side-by-side view (photo vs AI)
- [ ] Override/adjust grades
- [ ] Approve/reject per question
- [ ] Teacher comments

**Milestone 6: Analytics Dashboard**
- [ ] Class-wide mistake patterns
- [ ] Per-student error history
- [ ] Score distribution charts
- [ ] Quick lookup

## Key Decisions & Constraints

### Why Gemini (not OpenAI)?
- Free tier (no credit card needed)
- Same Google ecosystem as Sheets/Drive
- Excellent vision/multimodal capabilities
- 1,000 requests/day free (plenty for grading)

### Why No Backend for MVP?
- App runs on localhost (API keys in `.env` are safe)
- Direct API calls from browser (Google Sheets, Drive, Gemini)
- Service layer allows swapping to backend later (just change implementation)

### OAuth Scopes Needed
- `openid` + `profile` + `email` (identity)
- `https://www.googleapis.com/auth/spreadsheets` (Sheets read/write)
- `https://www.googleapis.com/auth/drive` (Drive read/write - needed for teacher-uploaded photos)

### Shared Folder Model
- Teacher creates folder in Drive
- Teacher shares folder with edit link
- Teacher pastes link in app → app extracts folder ID → stores in localStorage
- App creates spreadsheet + organized/ subfolder inside

### Multi-Page Test Handling
- Students may submit main test page + multiple scratch/work pages
- Teacher assigns multiple photos to one student (page 1, page 2, etc.)
- Files named: `student_name.jpg`, `student_name_p2.jpg`, etc.
- AI receives all pages for evaluation

## Coding Conventions

### Naming
- Files: `kebab-case.ts`
- Components: `PascalCase.tsx`
- Functions: `camelCase`
- Interfaces: `PascalCase` (e.g., `AIGradingService`)
- Implementations: `PascalCase` (e.g., `LocalAIGradingService`)

### Commits
Follow conventional commits:
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation
- `refactor:` code improvements
- `test:` tests
- `chore:` maintenance

### Branches
- `main` - stable, production-ready
- `claude/*` - AI-generated features
- `feature/*` - human developer features
- `fix/*` - bug fixes

## Environment Variables

```env
# Google OAuth (from Google Cloud Console)
VITE_GOOGLE_CLIENT_ID=...
VITE_GOOGLE_CLIENT_SECRET=...

# Gemini API (from AI Studio - free, no credit card)
VITE_GEMINI_API_KEY=...

# App Config
VITE_APP_URL=http://localhost:3000
```

## Important Notes

1. **Teacher owns all data** - everything lives in their Google account
2. **Zero cost for MVP** - no hosting, no database, no storage fees
3. **Service layer is critical** - enables backend extraction later without UI changes
4. **Photo Inbox is key differentiator** - bulk photo management saves massive time
5. **AI evaluates work process, not just answers** - looks at step-by-step calculations
6. **Teacher stays in control** - AI suggests, teacher approves/overrides
7. **Pattern detection from day one** - data model supports analytics from start
8. **MVP is math-only** - but architecture supports multi-subject expansion
9. **No student access in MVP** - teacher-only interface (students in V1+)
10. **Target user:** Romanian math teacher, grades 5-8, 60-90 papers/weekend

## User Stories (Primary Use Case)

**As a math teacher, I want to:**
- Upload photos of 60-90 test papers in one batch
- Quickly assign each photo to the correct student
- Let AI grade all papers automatically
- Review AI suggestions and make adjustments
- See which mistakes each student made
- Identify class-wide patterns (which questions everyone missed)
- Track student improvement over time
- Reduce grading time from 4-6 hours to 1-2 hours

## Success Metrics

**Primary:**
- Time per paper: 3-5 min → under 1 min (60-80% reduction)
- Weekly time saved: 3-4 hours per weekend

**Secondary:**
- Grading accuracy (fewer fatigue mistakes)
- Pattern identification (actionable insights per test)
- Teacher satisfaction (stress reduction)
- Adoption (teacher uses for every test)

## Documentation Map

| Doc | Purpose |
|-----|---------|
| README.md | Project introduction, quick start |
| docs/project-overview.md | Vision, problem, solution, goals |
| docs/architecture.md | Tech stack, service layer, data flow, Photo Inbox |
| docs/data-model.md | Google Sheets schema (7 sheets), Drive folder structure |
| docs/features.md | Feature roadmap (MVP → V1 → V2) |
| docs/spec-qa.md | Product specification Q&A (6/6 complete) |
| docs/development.md | Setup, workflow, milestones, troubleshooting |
| claude.md | This file - quick context for Claude Code |

## Quick Start (Future, After Implementation)

```bash
# 1. Clone
git clone https://github.com/sorinslavic/graide.git
cd graide

# 2. Install
npm install

# 3. Setup .env
# Add Google OAuth credentials + Gemini API key

# 4. Run
npm run dev

# 5. Open browser
# http://localhost:3000
```

## UI Design Reference (Lovable Mock)

A design mock was created using Lovable AI at https://github.com/sorinslavic/grade-grader-hero

### What to Adopt from Lovable Design

**✅ Keep (Excellent Design):**
1. **Three-column layout** - Thumbnails | Canvas | Comments
2. **Annotation canvas** - Visual overlay on test images
3. **Multi-page navigation** - Thumbnail sidebar + prev/next
4. **Status color coding** - Green (correct), Red (incorrect), Neutral
5. **Comments panel** - Per-annotation feedback
6. **Breadcrumb nav** - Teacher → Class → Test → Student
7. **Overall UI polish** - Beautiful, professional design

**⚠️ Adapt (Needs Integration):**
1. **Annotation model** → Map to grAIde's Mistakes records
2. **Add question structure** - Q1: 20pts, Q2: 30pts (not in Lovable)
3. **Pre-populate from AI** - Auto-create annotations from Gemini results
4. **Mistake type classification** - wrong_formula, calculation_error, etc.
5. **Google Sheets persistence** - Save to Results + Mistakes sheets

**❌ Remove (Not Needed):**
1. **Freehand drawing tools** (pen, highlight) - Only need pointer + circle
2. **In-memory state only** - Must persist to Google Sheets

### Implementation Strategy

**Phase 1-3:** Build foundation (Auth, Photo Inbox, AI Engine)
**Phase 4:** Port Lovable's grading interface components and adapt to grAIde's model
- Copy: TestCanvas, Toolbar, CommentsPanel, PageThumbnails, BreadcrumbNav
- Modify: Add question structure, mistake types, AI pre-population, Sheets integration
- Result: AI-first grading with beautiful UI for teacher review

## Next Actions

**Immediate:** Create project scaffold (Milestone 0)
- Initialize Vite + React + TypeScript project
- Set up folder structure (components/, services/, hooks/, types/)
- Install dependencies (shadcn/ui, Tailwind, react-oauth, googleapis, @google/generative-ai, recharts)
- Configure ESLint, Prettier, Tailwind
- Create `.env.example`

**Then:** Follow phased implementation order (see above)
1. Auth + Google APIs (Week 1)
2. Photo Inbox (Week 2)
3. AI Grading Engine (Week 2-3)
4. Port & adapt Lovable design (Week 3-4)
5. Analytics Dashboard (Week 5)

---

**Last Updated:** 2026-02-15
**Status:** Ready for development - specs complete, UI design reference identified
