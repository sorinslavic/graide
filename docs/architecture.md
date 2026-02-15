# grAIde Architecture

## Overview
grAIde is a locally-hosted web application that uses Google Sheets as a database and Google Drive for photo storage. This architecture eliminates hosting costs and gives teachers full control over their data.

## Technology Stack

### Frontend
- **Framework**: React 18+
- **Build Tool**: Vite (fast dev server, optimized builds)
- **UI Library**: shadcn/ui (copy-paste components on Radix, fully customizable)
- **State Management**: React Context (built-in, sufficient for app needs)
- **Styling**: Tailwind CSS

**Rationale**: React + Vite provides fast development experience and runs efficiently on localhost.

### Backend
- **Runtime**: **None required for MVP** ✅
- **Architecture**: Frontend-only application with **service layer abstraction**
- **APIs**: Direct integration with Google APIs and Gemini API from browser (MVP)
- **Future**: Service implementations can be swapped to call a backend server without changing UI code

**Rationale**: By using Google Sheets API, Drive API, and Gemini API directly from the frontend, we eliminate the need for a backend server for MVP. Since the app runs on localhost (teacher's laptop), API keys in `.env` are safe. A clean service layer with TypeScript interfaces ensures we can extract a backend later by swapping implementations — zero UI changes required.

### Service Layer Pattern
The app uses **TypeScript interfaces** to separate UI from business logic, similar to Java's interface/implementation pattern:

```typescript
// Interface (contract)
export interface AIGradingService {
  gradeSubmission(photos: string[], answerKey: AnswerKey): Promise<GradingResult>;
}

// MVP Implementation (direct browser call)
export class LocalAIGradingService implements AIGradingService {
  async gradeSubmission(photos, answerKey) {
    // calls Gemini API directly from browser
  }
}

// Future Implementation (calls backend proxy)
export class RemoteAIGradingService implements AIGradingService {
  async gradeSubmission(photos, answerKey) {
    // calls Express server which holds the API key
  }
}
```

**This pattern applies to all services** (AI, Google Sheets, Google Drive). Swapping from local to remote = changing one line of configuration.

**When to extract a backend:**
- When the app moves from localhost to cloud hosting (API keys can't be in frontend)
- When multiple teachers need a shared server
- Implementation: Add a lightweight Node.js + Express server that proxies API calls

### Database
- **Primary Database**: **Google Sheets API** — single spreadsheet auto-created inside the teacher's shared folder
  - Classes sheet
  - Students sheet
  - Tests sheet
  - Results sheet
  - Rubrics sheet
  - Config sheet
- **Query Method**: Google Sheets API v4
- **Scope**: One spreadsheet with a `school_year` column (no need for separate files per year)

**Rationale**:
- ✅ Zero hosting costs
- ✅ Teacher can edit data directly (familiar Excel-like interface)
- ✅ Built-in version history and backup
- ✅ Easy data export
- ✅ No database migrations needed
- ✅ Auto-created on first login if folder is empty
- ⚠️ Limited to ~10M cells per spreadsheet (sufficient for MVP)

### File Storage
- **Storage**: **Google Drive API** — teacher's shared folder
- **Organization**: Two-zone folder structure managed by the app:
  - **Inbox zone** (folder root): loose photos dumped from phone — unsorted
  - **Organized zone** (`organized/`): `[SchoolYear]/[ClassName]/[TestName]/student.jpg` — sorted by app
- **Upload**: Teacher dumps all photos into the shared folder root from phone (zero friction)
- **Sorting**: App's **Photo Inbox** UI lets teacher assign photos → app moves them into `organized/` subfolders
- **Access**: Drive API for reading/listing/moving photos

**Rationale**:
- ✅ Zero storage costs
- ✅ Teacher owns all their data
- ✅ Upload is dead simple — just dump into one folder from phone
- ✅ No manual folder creation or file-by-file organizing
- ✅ Drive stays clean — organized folder is browsable and logical
- ✅ Teacher can browse organized photos in Drive anytime

### AI/ML
- **Primary AI**: **Google Gemini API** (via AI Studio free tier)
- **Model**: Gemini 2.5 Flash (fast, multimodal, free tier available)
- **Auth**: Free API key from [AI Studio](https://aistudio.google.com/) — teacher gets one in 2 minutes, stored in `.env`
- **Endpoint**: `generativelanguage.googleapis.com`
- **Use Cases**:
  - Photo analysis (reading handwritten math)
  - Answer evaluation (right/wrong calculations)
  - Mistake classification (formula errors, calculation errors, etc.)
  - Points assignment per question
  - Grade calculation
  - Pattern detection (class-wide trends)
  - Feedback generation (what to review)

**Free tier limits** (no credit card required):
| Model | Free RPM | Free Daily Requests |
|-------|----------|---------------------|
| Gemini 2.5 Flash | ~10 RPM | ~1,000/day |
| Gemini 2.5 Flash-Lite | 15 RPM | ~1,000/day |
| Gemini 2.5 Pro | 5 RPM | ~1,000/day |

A teacher grading 50 tests/day fits easily within the free tier.

**Why Gemini over OpenAI?**
- ✅ Free tier — zero cost for typical teacher usage
- ✅ No credit card required — teacher just grabs an API key from AI Studio
- ✅ Excellent vision/multimodal — reads handwriting, math formulas, geometric drawings
- ✅ Same Google ecosystem — consistent with Sheets/Drive integration
- ✅ Each teacher uses their own key — no shared billing or infrastructure
- ✅ Runs on localhost — API key in `.env` is safe (never exposed to browser network tab in production)

**Why not OAuth for Gemini?** We investigated using the teacher's Google OAuth token directly for Gemini API calls (eliminating the API key entirely). This technically works but requires the `cloud-platform` OAuth scope — far too broad for a grading app. A dedicated free API key is simpler and safer.

**Rationale**: Vision models can analyze test photos directly without OCR step, handling both text and geometric drawings. Gemini Flash provides the best cost/quality tradeoff for grading use cases.

### Authentication & Data Access
- **Auth Provider**: **Google OAuth 2.0**
- **Scopes Needed**:
  - `openid` + `profile` + `email` (identity)
  - `https://www.googleapis.com/auth/spreadsheets` (read/write Sheets)
  - `https://www.googleapis.com/auth/drive` (read/write Drive — needed to access teacher-uploaded photos)
- **All scopes requested at login** (Drive+Sheets access is core to the app, incremental auth adds no value)
- **Session Management**: OAuth tokens stored in browser localStorage

#### Shared Folder Model (MVP)
Instead of the app magically creating files in Drive, the **teacher controls the folder**:

1. Teacher creates a folder in Google Drive (any name they want)
2. Teacher shares it with an edit link
3. Teacher pastes the share link into grAIde at first login
4. App extracts and stores the **folder ID** in `localStorage`
5. If forgotten, app simply asks again

**Inside the shared folder, the app creates:**
```
📁 [Teacher's Folder Name]
├── 📊 graide-data            (spreadsheet: classes, students, tests, results, rubrics, config)
├── 📷 (loose photos land here — the "inbox")
└── 📁 organized/
    └── 📁 [SchoolYear]/
        └── 📁 [ClassName]/
            └── 📁 [TestName]/
                ├── 📷 student1.jpg
                ├── 📷 student2.jpg
                └── ...
```

**Photo upload workflow**: Teacher takes photos with phone → "Send to Drive" → dumps all into the shared folder root. No subfolder picking needed. The app handles the rest (see Photo Inbox below).

**Why this approach:**
- ✅ Teacher controls the folder — they pick name, location, sharing
- ✅ Teacher can open Drive and see exactly where everything lives
- ✅ Phone upload is dead simple (native Google Drive sharing)
- ✅ No magic — transparent data storage
- ✅ Easy to refactor — folder ID is just a string in localStorage, trivial to move to a DB later

**Rationale**: Teacher logs in with Google, grants permissions once, pastes their folder link. The app works within that folder. Teacher stays in control of their data.

### Deployment
- **Hosting**: **Local (localhost:3000)**
- **Distribution**: Git repository clone
- **Updates**: `git pull` + `npm install`
- **CI/CD**: Not needed for local deployment
- **Custom URL**: Teacher can map `graide.ai` to localhost via `/etc/hosts`:
  ```
  127.0.0.1   graide.ai
  ```
  Then access the app at `http://graide.ai:3000` for a polished experience.

**Future**: Could deploy to Vercel/Netlify if teachers want cloud access

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────┐
│              Teacher's Laptop (localhost:3000)           │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │         grAIde React App (Frontend)            │    │
│  │                                                │    │
│  │  • Photo Inbox (sort & assign)               │    │
│  │  • Grading Interface                          │    │
│  │  • Class/Student Management                   │    │
│  │  • Analytics Dashboard                        │    │
│  └───┬────────────────────┬───────────────────┬──┘    │
│      │                    │                   │        │
└──────┼────────────────────┼───────────────────┼────────┘
       │                    │                   │
       │ Google            │ Google            │ Google
       │ Sheets API        │ Drive API         │ Gemini API
       │                    │                   │
   ┌───▼─────────┐     ┌────▼─────────┐    ┌───▼────────┐
   │   Google    │     │   Google     │    │  Gemini    │
   │   Sheets    │     │    Drive     │    │  2.5 Flash │
   │             │     │              │    │            │
   │ • Teachers  │     │ • Test       │    │            │
   │ • Classes   │     │   Photos     │    │ • Grade    │
   │ • Students  │     │ • Organized  │    │   Tests    │
   │ • Tests     │     │   by Folders │    │ • Find     │
   │ • Grades    │     │              │    │   Mistakes │
   │ • Mistakes  │     │              │    │ • Suggest  │
   └─────────────┘     └──────────────┘    │   Feedback │
                                            └────────────┘
   Teacher can edit         Teacher owns
   directly in Sheets       all photos
```

## Data Flow

### Grading Workflow
```
1. Teacher takes 50 photos of tests on phone
2. Teacher dumps all 50 into shared Drive folder ("Send to Drive" — one action)
3. Teacher opens grAIde → Photo Inbox shows 50 new photos
4. Teacher assigns photos: pick class + test, then tag each photo with student name
5. App moves assigned photos → organized/[Year]/[Class]/[Test]/[Student].jpg
6. Teacher clicks "Grade" on a test → app sends photos to AI
7. AI returns grades/mistakes → app writes to Sheets
8. Teacher reviews, overrides if needed → final grades saved
```

### Data Access Pattern
```
First Login:
├─ OAuth login (Google)
├─ Teacher pastes shared folder link → extract folder ID → store in localStorage
├─ App checks folder for graide-data spreadsheet
├─ If empty → create spreadsheet + test-scans subfolder
└─ Ready to use

App Startup (returning):
├─ OAuth login (Google)
├─ Read folder ID from localStorage (ask again if missing)
├─ Fetch classes → Read from Sheets
├─ Fetch students → Read from Sheets
└─ Cache in React state

Grading Session:
├─ List test photos → Read from Drive (test-scans subfolder)
├─ Send to AI → Gemini API
├─ Display results → React UI
└─ Save grades → Write to Sheets

Analytics View:
├─ Query Results sheet → Aggregate data
├─ Query Mistakes sheet → Pattern analysis
└─ Display charts → React UI
```

## Photo Inbox — Bulk Photo Management

### The Problem
A teacher photographs 50 tests. Without this feature, she'd have to:
- Create folders manually in Drive (per class, per test)
- Move each photo one by one into the right folder
- Name each file with the student's name
- Remember which photos she already processed

This takes longer than the grading itself.

### The Solution: Photo Inbox
The app provides a **Photo Inbox** — a dedicated UI screen where all new (unsorted) photos appear, and the teacher can quickly route them to the right class/test/student with minimal clicks.

### How It Works

#### Upload (phone side — zero friction)
1. Teacher takes photos of all tests (50 photos)
2. Opens Google Drive app on phone → navigates to shared grAIde folder
3. Taps "Upload" → selects all 50 photos → done
4. All 50 photos land in the **root of the shared folder** (no subfolder picking needed)

#### Sort (app side — Photo Inbox UI)
1. Teacher opens grAIde → clicks **"Photo Inbox"** (badge shows "50 new")
2. App queries Drive API: list all image files in folder root (not in `organized/` subfolder)
3. Photos displayed as a **thumbnail grid**, sorted by upload time (newest first)
4. Teacher workflow for assigning:

**Step 1 — Select class + test** (top of screen)
- Dropdown: pick class (e.g., "5A")
- Dropdown: pick test (e.g., "Math Test 3") — or create new test inline
- This sets the "target" for all assignments in this session

**Step 2 — Assign students to photos**
- Teacher clicks a photo thumbnail → a student picker appears (list of students in selected class)
- Teacher picks the student → photo gets a green checkmark + student name overlay
- **Keyboard shortcut flow**: photos can be assigned in sequence — click photo, type first few letters of student name, Enter, next photo auto-selects
- **Multi-page tests**: if a student has multiple pages, teacher selects multiple photos then assigns them to one student (they become page 1, page 2, etc.)

**Step 3 — Confirm & organize**
- Teacher clicks **"Assign All"** (or presses Enter)
- App moves each assigned photo via Drive API:
  - From: `[shared folder root]/IMG_20250215_1234.jpg`
  - To: `organized/2025-2026/5A/Math-Test-3/student_name.jpg` (or `student_name_p1.jpg`, `_p2.jpg` for multi-page)
- App creates subfolders automatically if they don't exist
- App records the mapping in the **Results sheet** (student_id, test_id, drive_file_id, file_path)
- Assigned photos disappear from the inbox
- Remaining unassigned photos stay in the inbox for later

### UI Layout

```
┌─────────────────────────────────────────────────────────┐
│  📥 Photo Inbox                              50 new     │
├─────────────────────────────────────────────────────────┤
│  Class: [  5A  ▾]    Test: [ Math Test 3 ▾] [+ New]    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐    │
│  │      │  │  ✅  │  │      │  │  ✅  │  │      │    │
│  │ img1 │  │ img2 │  │ img3 │  │ img4 │  │ img5 │    │
│  │      │  │Maria │  │      │  │Andrei│  │      │    │
│  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘    │
│                                                         │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐    │
│  │      │  │      │  │      │  │      │  │      │    │
│  │ img6 │  │ img7 │  │ img8 │  │ img9 │  │img10 │    │
│  │      │  │      │  │      │  │      │  │      │    │
│  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘    │
│                                                    ...  │
├─────────────────────────────────────────────────────────┤
│  2 assigned / 50 total          [ Assign & Organize ▶ ] │
└─────────────────────────────────────────────────────────┘
```

### Drive Folder Structure (after organizing)

```
📁 [Teacher's Shared Folder]
├── 📊 graide-data                    (spreadsheet)
├── 📷 IMG_20250215_9999.jpg          (unassigned — still in inbox)
├── 📷 IMG_20250215_9998.jpg          (unassigned — still in inbox)
└── 📁 organized/
    └── 📁 2025-2026/
        ├── 📁 5A/
        │   ├── 📁 Math-Test-3/
        │   │   ├── 📷 maria_popescu.jpg
        │   │   ├── 📷 andrei_ionescu.jpg
        │   │   └── 📷 elena_dumitrescu_p1.jpg
        │   │   └── 📷 elena_dumitrescu_p2.jpg
        │   └── 📁 Math-Test-2/
        │       └── ...
        └── 📁 6B/
            └── ...
```

### Technical Details

#### Drive API Operations
- **List inbox**: `files.list` with `'<folder_id>' in parents AND mimeType contains 'image/'` (excludes `organized/` subfolder and spreadsheet)
- **Move file**: `files.update` with `addParents=<target_folder_id>&removeParents=<root_folder_id>`
- **Rename file**: `files.update` with `name=<student_name>.jpg`
- **Create subfolder**: `files.create` with `mimeType='application/vnd.google-apps.folder'`

#### Data Tracking (Results sheet)
When a photo is assigned, the app writes a row to the Results sheet:
| student_id | test_id | class_id | school_year | drive_file_id | file_path | status | assigned_at |
|---|---|---|---|---|---|---|---|
| s_001 | t_003 | c_5a | 2025-2026 | abc123 | organized/2025-2026/5A/Math-Test-3/maria_popescu.jpg | pending_grade | 2025-02-15T... |

The `status` field tracks: `pending_grade` → `graded` → `reviewed`

#### Edge Cases
- **Duplicate assignment**: warn if a student already has a photo for that test (allow override)
- **Non-image files**: ignore files that aren't images (filter by mimeType)
- **Photos already in organized/**: don't show in inbox (only root-level images appear)
- **Empty inbox**: show a friendly "No new photos — upload from your phone!" message with instructions
- **Bulk operations**: "Select All" to assign all remaining photos at once (useful when photos are in student order and class roster is sorted)

### Why This Matters
- **50 photos sorted in ~2 minutes** instead of 20+ minutes of manual Drive folder management
- Teacher's mental model: "dump photos, sort in app, grade" — three clear steps
- Drive stays clean and browsable even outside the app
- Photo-to-student mapping is stored in Sheets, so grading engine knows exactly which photos to grade

## System Components

### Core Modules (Service Layer Architecture)

Each service is defined as a **TypeScript interface** with a concrete implementation. This keeps UI and business logic fully decoupled.

1. **Auth Service** (`services/auth/`): Google OAuth, token management
2. **Sheets Service** (`services/google/sheets`): CRUD operations on Google Sheets
3. **Drive Service** (`services/google/drive`): List, move, rename, create folders in Drive
4. **Photo Inbox Service** (`services/photos/`): List unassigned photos, assign to student/test, move to organized folder, track in Results sheet
5. **AI Grading Service** (`services/ai/`): Send photos to Gemini Vision, parse responses
6. **Grading Engine** (`services/grading/`): Orchestrate photo → AI → grade workflow
7. **Analytics Engine** (`services/analytics/`): Query Sheets for patterns and trends
8. **UI Components** (`components/`): React components for inbox, grading, management, analytics

**Key principle:** Components never call external APIs directly — they always go through service interfaces via React hooks.

### External Dependencies
- `@react-oauth/google` - Google OAuth
- `googleapis` - Google Sheets & Drive APIs
- `@google/generative-ai` - Google Gemini API client
- `react`, `react-dom` - UI framework
- `vite` - Build tool
- Chart library (TBD) - For analytics visualizations

## Key Design Decisions

### Why Local-First?
1. **Zero cost**: No hosting, no database, no storage fees
2. **Zero deployment complexity**: Just clone and run
3. **Teacher data ownership**: All data in their Google account
4. **Simplicity**: No backend to maintain
5. **Privacy**: Data never leaves teacher's control

### Why Google Sheets as Database?
1. **Familiar interface**: Teachers can fix data issues themselves
2. **Built-in features**: Version history, backups, export to Excel
3. **No migrations**: Schema changes = add a column
4. **Collaborative**: School admin can access if needed
5. **Good enough**: Handles thousands of grades easily

### Why Google Drive for Photos?
1. **Zero storage cost**: Teacher uses their Drive quota
2. **Ownership**: Teacher owns all photos
3. **Accessible**: Can view/download photos outside app
4. **Reliable**: Google's infrastructure
5. **Shareable**: Easy to share with colleagues if needed

### Multi-Teacher Support
- **MVP**: Single teacher, their own Sheet + Drive
- **V1**: Shared Drive with folder-per-teacher structure
- **V2**: Could build proper multi-tenant system if hosted

## Security Considerations

1. **OAuth Scopes**: All scopes requested at login (profile + Sheets + Drive). Drive scope is broader than `drive.file` because the app needs to read teacher-uploaded photos.
2. **Token Storage**: Store OAuth tokens in browser localStorage
3. **Folder ID**: Stored in browser localStorage; if lost, teacher re-pastes share link
4. **API Keys**: Gemini API key in `.env` (not committed to git, free tier from AI Studio)
5. **Student Privacy**: Photos stored in teacher's private Drive, in a folder they control
6. **Data Access**: Only teacher can access their own data via OAuth

## Scalability Considerations

### Current Limitations (Acceptable for MVP)
- Google Sheets: ~10M cells (sufficient for hundreds of students, thousands of tests)
- Drive API: 1000 requests/100 seconds (plenty for grading workflow)
- Gemini API: Free tier ~1,000 requests/day, ~10 RPM (plenty for grading workflow)

### When to Migrate
If app gains traction and needs:
- Multi-school deployment
- Real-time collaboration
- Advanced analytics
- Student login portal

Then consider:
- Deploy to cloud (Vercel/Netlify)
- Add backend (Next.js API routes)
- Migrate to PostgreSQL
- Add proper auth (Clerk, Auth0)

**But for MVP**: Current architecture is perfect.

## Technology Alternatives Considered

| Component | Chosen | Alternatives Considered | Why Chosen |
|-----------|--------|------------------------|------------|
| Frontend | React + Vite | Next.js, Vue, Svelte | Fast dev, widely known |
| Database | Google Sheets | PostgreSQL, SQLite, MongoDB | Zero cost, teacher-editable |
| Storage | Google Drive | AWS S3, Cloudinary | Zero cost, teacher ownership |
| AI | Gemini 2.5 Flash | OpenAI Vision, Claude Vision | Free tier, same Google ecosystem, excellent vision |
| Deployment | Local | Vercel, Netlify, Railway | Zero cost, zero complexity |

## Notes
- Architecture optimized for MVP speed and zero cost
- Can evolve to cloud-hosted as needs grow
- Teacher data ownership is non-negotiable
- Simplicity > scalability (for now)
