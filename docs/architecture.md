# grAIde Architecture

## Overview
grAIde is a locally-hosted web application that uses Google Sheets as a database and Google Drive for photo storage. This architecture eliminates hosting costs and gives teachers full control over their data.

## Technology Stack

### Frontend
- **Framework**: React 18+
- **Build Tool**: Vite (fast dev server, optimized builds)
- **UI Library**: TBD (shadcn/ui, MUI, or custom)
- **State Management**: React Context / Zustand (TBD)
- **Styling**: Tailwind CSS (likely)

**Rationale**: React + Vite provides fast development experience and runs efficiently on localhost.

### Backend
- **Runtime**: **None required** ✅
- **Architecture**: Frontend-only application
- **APIs**: Direct integration with Google APIs from browser

**Rationale**: By using Google Sheets API and Drive API directly from the frontend, we eliminate the need for a backend server, reducing complexity and cost to zero.

### Database
- **Primary Database**: **Google Sheets API**
  - Teachers table
  - Classes table
  - Students table
  - Tests table
  - Grades table
  - Mistakes table
- **Query Method**: Google Sheets API v4

**Rationale**:
- ✅ Zero hosting costs
- ✅ Teacher can edit data directly (familiar Excel-like interface)
- ✅ Built-in version history and backup
- ✅ Easy data export
- ✅ No database migrations needed
- ⚠️ Limited to ~10M cells per spreadsheet (sufficient for MVP)

### File Storage
- **Storage**: **Google Drive API**
- **Organization**: Folder-based structure
  - `/graide/2024-2025/Class-5A/Test-1/student_name.jpg`
- **Access**: Drive API for upload/download/display

**Rationale**:
- ✅ Zero storage costs
- ✅ Teacher owns all their data
- ✅ Built-in backup and sharing
- ✅ Familiar interface for manual management

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

### Authentication
- **Auth Provider**: **Google OAuth 2.0**
- **Scopes Needed**:
  - `https://www.googleapis.com/auth/spreadsheets` (read/write Sheets)
  - `https://www.googleapis.com/auth/drive.file` (access Drive files created by app)
- **Session Management**: OAuth tokens stored in browser localStorage

**Rationale**: Teacher logs in with Google account, grants permissions once, app can then access their Sheets and Drive.

### Deployment
- **Hosting**: **Local (localhost:3000)**
- **Distribution**: Git repository clone
- **Updates**: `git pull` + `npm install`
- **CI/CD**: Not needed for local deployment

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
1. Teacher uploads test photos → Google Drive (via Drive API)
2. App stores Drive file IDs → Google Sheets
3. App sends photo to GPT-4 Vision → OpenAI API
4. AI returns grades/mistakes → App processes
5. App writes results → Google Sheets
6. Teacher reviews in app → Can override/adjust
7. Final grades stored → Google Sheets
```

### Data Access Pattern
```
App Startup:
├─ OAuth login (Google)
├─ Fetch classes → Read from Sheets
├─ Fetch students → Read from Sheets
└─ Cache in React state

Grading Session:
├─ Load test photos → Read from Drive
├─ Send to AI → OpenAI API
├─ Display results → React UI
└─ Save grades → Write to Sheets

Analytics View:
├─ Query Grades sheet → Aggregate data
├─ Query Mistakes sheet → Pattern analysis
└─ Display charts → React UI
```

## System Components

### Core Modules
1. **Auth Module**: Google OAuth, token management
2. **Sheets Service**: CRUD operations on Google Sheets
3. **Drive Service**: Upload/download/list files from Drive
4. **AI Service**: Send photos to GPT-4 Vision, parse responses
5. **Grading Engine**: Orchestrate photo → AI → grade workflow
6. **Analytics Engine**: Query Sheets for patterns and trends
7. **UI Components**: React components for grading, management, analytics

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

1. **OAuth Scopes**: Request minimal permissions (Sheets + Drive files created by app)
2. **Token Storage**: Store OAuth tokens in browser localStorage (encrypted)
3. **API Keys**: OpenAI API key in `.env` (not committed to git)
4. **Student Privacy**: Photos stored in teacher's private Drive
5. **Data Access**: Only teacher can access their own data via OAuth

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
