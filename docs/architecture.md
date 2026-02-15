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
- **APIs**: Direct integration with Google APIs and OpenAI from browser (MVP)
- **Future**: Service implementations can be swapped to call a backend server without changing UI code

**Rationale**: By using Google Sheets API, Drive API, and OpenAI API directly from the frontend, we eliminate the need for a backend server for MVP. Since the app runs on localhost (teacher's laptop), API keys in `.env` are safe. A clean service layer with TypeScript interfaces ensures we can extract a backend later by swapping implementations — zero UI changes required.

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
    // calls OpenAI directly from browser
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
- **Storage**: **Google Drive API** — `test-scans/` subfolder inside the teacher's shared folder
- **Organization**: Folder-based structure managed by the app
  - `test-scans/[ClassName]-[TestName]-[Date]/student_name.jpg`
- **Upload**: Teacher uploads photos directly from phone via Google Drive's native "Send to Drive" feature
- **Access**: Drive API for reading/listing photos; app reads from known folder structure

**Rationale**:
- ✅ Zero storage costs
- ✅ Teacher owns all their data
- ✅ Built-in backup and sharing
- ✅ Familiar interface — teacher uploads from phone, no custom upload UI needed for MVP
- ✅ Teacher can browse photos in Drive anytime

### AI/ML
- **Primary AI**: **OpenAI GPT-4 Vision API** (or Claude Vision)
- **Use Cases**:
  - Photo analysis (reading handwritten math)
  - Answer evaluation (right/wrong calculations)
  - Mistake classification (formula errors, calculation errors, etc.)
  - Points assignment per question
  - Grade calculation
  - Pattern detection (class-wide trends)
  - Feedback generation (what to review)

**Rationale**: Vision models can analyze test photos directly without OCR step, handling both text and geometric drawings.

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
└── 📁 test-scans/
    └── 📁 [ClassName]-[TestName]-[Date]/
        ├── 📷 student1.jpg
        ├── 📷 student2.jpg
        └── ...
```

**Photo upload workflow**: Teacher takes a photo with their phone → "Send to Drive" → selects the appropriate test-scans subfolder. No upload UI needed in the app for MVP.

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
│  │  • Grading Interface                          │    │
│  │  • Class/Student Management                   │    │
│  │  • Analytics Dashboard                        │    │
│  │  • Test Upload                                │    │
│  └───┬────────────────────┬───────────────────┬──┘    │
│      │                    │                   │        │
└──────┼────────────────────┼───────────────────┼────────┘
       │                    │                   │
       │ Google            │ Google            │ OpenAI
       │ Sheets API        │ Drive API         │ API
       │                    │                   │
   ┌───▼─────────┐     ┌────▼─────────┐    ┌───▼────────┐
   │   Google    │     │   Google     │    │  GPT-4     │
   │   Sheets    │     │    Drive     │    │  Vision    │
   │             │     │              │    │    API     │
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
1. Teacher takes photo of test → uploads to Drive from phone ("Send to Drive")
2. App lists photos in test-scans subfolder → Google Drive API
3. App sends photo to GPT-4 Vision → OpenAI API
4. AI returns grades/mistakes → App processes
5. App writes results → Google Sheets
6. Teacher reviews in app → Can override/adjust
7. Final grades stored → Google Sheets
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
├─ Send to AI → OpenAI API
├─ Display results → React UI
└─ Save grades → Write to Sheets

Analytics View:
├─ Query Results sheet → Aggregate data
├─ Query Mistakes sheet → Pattern analysis
└─ Display charts → React UI
```

## System Components

### Core Modules (Service Layer Architecture)

Each service is defined as a **TypeScript interface** with a concrete implementation. This keeps UI and business logic fully decoupled.

1. **Auth Service** (`services/auth/`): Google OAuth, token management
2. **Sheets Service** (`services/google/sheets`): CRUD operations on Google Sheets
3. **Drive Service** (`services/google/drive`): Upload/download/list files from Drive
4. **AI Grading Service** (`services/ai/`): Send photos to GPT-4 Vision, parse responses
5. **Grading Engine** (`services/grading/`): Orchestrate photo → AI → grade workflow
6. **Analytics Engine** (`services/analytics/`): Query Sheets for patterns and trends
7. **UI Components** (`components/`): React components for grading, management, analytics

**Key principle:** Components never call external APIs directly — they always go through service interfaces via React hooks.

### External Dependencies
- `@react-oauth/google` - Google OAuth
- `googleapis` - Google Sheets & Drive APIs
- `openai` - OpenAI API client
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
4. **API Keys**: OpenAI API key in `.env` (not committed to git)
5. **Student Privacy**: Photos stored in teacher's private Drive, in a folder they control
6. **Data Access**: Only teacher can access their own data via OAuth

## Scalability Considerations

### Current Limitations (Acceptable for MVP)
- Google Sheets: ~10M cells (sufficient for hundreds of students, thousands of tests)
- Drive API: 1000 requests/100 seconds (plenty for grading workflow)
- OpenAI API: Rate limits vary by tier (gradual grading is fine)

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
| AI | OpenAI Vision | Claude Vision, local models | Best vision quality |
| Deployment | Local | Vercel, Netlify, Railway | Zero cost, zero complexity |

## Notes
- Architecture optimized for MVP speed and zero cost
- Can evolve to cloud-hosted as needs grow
- Teacher data ownership is non-negotiable
- Simplicity > scalability (for now)
