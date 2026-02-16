<p align="center">
  <img src="./docs/assets/logo.svg" alt="grAIde logo" width="400" />
</p>

<p align="center">
  <strong>AI-powered grading assistant for teachers</strong><br/>
  Grade smarter. Teach better. Save hours every weekend.
</p>

---

## About

grAIde combines **grading** with **AI** to help teachers save time and provide better feedback to students. Initially focused on mathematics education for Romanian middle school (grades 5-8), grAIde automates repetitive grading tasks while keeping teachers in full control.

**The problem:** A math teacher grading 60-90 papers every weekend spends 4-6 hours on repetitive work, with no systematic way to track mistakes or spot patterns.

**The solution:** Snap photos, let AI grade, review and approve. Cut grading time by 60-80% while gaining insights that make teaching more effective.

### Key Features (Planned)
- **Photo Inbox**: Dump test photos from phone to Drive, sort them in the app
- **AI Grading**: Gemini Vision reads handwriting, evaluates answers, assigns points
- **Teacher Review**: Side-by-side view of original photo vs AI evaluation, easy overrides
- **Mistake Tracking**: Every error classified and stored — no more mental gymnastics
- **Pattern Detection**: Spot class-wide misconceptions and per-student trends
- **Google Sheets**: All data in a spreadsheet the teacher can edit directly

### Tech Stack
- **Frontend**: React + Vite + shadcn/ui + Tailwind CSS
- **Database**: Google Sheets API (zero hosting costs)
- **Storage**: Google Drive API (teacher's own Drive)
- **AI**: Google Gemini 2.5 Flash (free tier — no credit card needed)
- **Charts**: Recharts (analytics dashboard)
- **Deployment**: Local-first (no backend server needed)

## Status

**Current Phase**: Milestone 1 - Auth + Google APIs (Phase 1/5 Complete ✅)

- ✅ **Milestone 0**: Project scaffold complete (React + Vite + TypeScript)
  - Complete type system (sheets, grading, drive)
  - Service layer interfaces (Auth, Sheets, Drive, AI)
  - Routing with 7 page placeholders
  - Tailwind CSS + shadcn/ui components
  - 917 lines of TypeScript code, builds successfully
- 🚧 **Milestone 1**: Auth + Google APIs implementation (In Progress)
  - ✅ **Phase 1**: Google OAuth authentication (COMPLETE)
    - Google OAuth login with @react-oauth/google
    - Token storage in localStorage with JWT decoding
    - Protected routes with ProtectedRoute component
    - User profile display with Header component
    - Full login/logout flow working
  - ⏳ **Phase 2**: Google Sheets service (CRUD for all 7 sheets)
  - ⏳ **Phase 3**: Google Drive service (file operations)
  - ⏳ **Phase 4**: First-time setup wizard
  - ⏳ **Phase 5**: Class & Student management UI

## Getting Started

### Prerequisites

Before you begin, ensure you have:
- **Node.js 18+** installed ([download here](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git** for cloning the repository

Check your versions:
```bash
node --version  # Should be 18.x or higher
npm --version   # Should be 9.x or higher
```

### Installation & Running the Project

**Step 1: Clone the repository**
```bash
git clone https://github.com/sorinslavic/graide.git
cd graide
```

**Step 2: Install dependencies**
```bash
npm install
```
This will install all required packages (~357 packages, takes 30-60 seconds).

**Step 3: Start the development server**
```bash
npm run dev
```

You should see:
```
  VITE v6.4.1  ready in 329 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Step 4: Open in your browser**

Navigate to: **http://localhost:5173**

You'll see the grAIde login page with the logo and Google sign-in button.

### Available Pages to Explore

Once the server is running, you can navigate to:

- **Login**: http://localhost:5173/
- **Dashboard**: http://localhost:5173/dashboard
- **Photo Inbox**: http://localhost:5173/inbox
- **Classes**: http://localhost:5173/classes
- **Analytics**: http://localhost:5173/analytics

All pages are placeholder UIs right now - features are being implemented in milestones.

### Building for Production

To create a production-ready build:

```bash
# Build the project
npm run build
```

This creates an optimized build in the `dist/` folder.

To preview the production build:
```bash
npm run preview
```

Opens at: **http://localhost:4173**

### Current Status

✅ **What Works:**
- Development server runs and hot-reloads
- All routes and navigation
- Tailwind CSS styling
- TypeScript compilation
- Production builds
- **Google OAuth authentication** (Phase 1 Complete)
- Protected routes and user session management
- User profile display with logout

❌ **What's Not Yet Implemented:**
- Data persistence to Google Sheets (Phase 2)
- Photo upload to Drive (Phase 3)
- First-time setup wizard (Phase 4)
- Class & Student management (Phase 5)
- AI grading (Milestone 3)

See [SCAFFOLD.md](./SCAFFOLD.md) for complete details on what's built.

### Configure Environment Variables (Required for OAuth)

To use the Google OAuth login (Phase 1), you need to set up Google Cloud credentials:

**Step 1: Create `.env` file**
```bash
touch .env
```

**Step 2: Get Google OAuth Credentials**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (e.g., "grAIde")
3. Enable APIs: Google Sheets API, Google Drive API
4. Go to "APIs & Services" → "Credentials"
5. Create OAuth 2.0 Client ID (Web application)
6. Add authorized JavaScript origins: `http://localhost:5173`
7. Add authorized redirect URIs: `http://localhost:5173`
8. Copy the Client ID and Client Secret

**Step 3: Edit `.env` file**
```env
VITE_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=your_client_secret_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_APP_URL=http://localhost:5173
```

**Step 4: Restart dev server**
```bash
# Stop the current server (Ctrl+C)
npm run dev
```

**Note:** `.env` is in `.gitignore` - never commit API credentials to git.

## Documentation

| Doc | Description |
|-----|-------------|
| [Project Overview](./docs/project-overview.md) | Vision, goals, success metrics |
| [Architecture](./docs/architecture.md) | Tech stack, service layer, data flow, Photo Inbox |
| [Data Model](./docs/data-model.md) | Google Sheets schema (7 sheets), Drive folder structure |
| [Features](./docs/features.md) | Feature roadmap (MVP → V1 → V2) |
| [Scaffold Summary](./SCAFFOLD.md) | Milestone 0 completion summary |
| [Claude Context](./claude.md) | Quick context for Claude Code AI |
| [Spec Q&A](./docs/spec-qa.md) | Product specification decisions |
| [Development Guide](./docs/development.md) | Setup, workflow, milestones, troubleshooting |

## Architecture at a Glance

```
Teacher's Laptop (localhost:3000)
    │
    ├── Google Sheets API ──→ "graide-data" spreadsheet (7 sheets)
    ├── Google Drive API  ──→ Shared folder (inbox + organized photos)
    └── Gemini API        ──→ AI grading (vision, free tier)
```

All data lives in the teacher's Google account. Zero hosting costs. Zero infrastructure.

## License

TBD
