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

### Key Features

**✅ Implemented:**
- **Google OAuth Authentication**: Secure login with Drive & Sheets permissions; "Keep me signed in" option (sessionStorage vs localStorage)
- **Workspace Setup**: Automated workspace initialization with Drive folder + spreadsheet
- **Google Sheets Database**: 8 sheets (README, Classes, Students, Tests, Results, Mistakes, Rubrics, Config)
- **Subject-Based Class Management**: 4-step wizard for creating classes with subject selection (12 predefined Romanian subjects + custom), school year, class name, and student roster management
- **Shared Student Rosters**: Multiple subjects can share the same class roster (e.g., Math-5A and Romanian-5A both use "5A" students)
- **Bulk Student Input**: Paste student names (one per line) or reuse existing rosters
- **Multi-language Support**: Romanian (default) and English with persistent language selection — fully applied across login, dashboard, and class management
- **Account Management**: View all configuration, reset workspace, logout
- **Auto-Documentation**: README sheet in spreadsheet explains data structure
- **Vibrant Design**: Gradient-based UI with animations, shimmer effects, and modern glass-morphism — including redesigned two-column login page

**🚧 In Progress:**
- **Photo Inbox**: Bulk photo upload and student assignment
- **AI Grading**: Gemini Vision integration for handwriting recognition
- **Teacher Review**: Side-by-side photo vs AI evaluation interface
- **Mistake Tracking**: Automated error classification and pattern detection
- **Analytics Dashboard**: Class-wide trends and student progress tracking

### Tech Stack
- **Frontend**: React + Vite + shadcn/ui + Tailwind CSS
- **Database**: Google Sheets API (zero hosting costs)
- **Storage**: Google Drive API (teacher's own Drive)
- **AI**: Google Gemini 2.5 Flash (free tier — no credit card needed)
- **Charts**: Recharts (analytics dashboard)
- **Deployment**: Local-first (no backend server needed)

### Design Philosophy
- **Vibrant & Fun**: Colorful gradients, animations, and modern glass-morphism effects
- **User-Friendly**: Intuitive interface with clear visual hierarchy
- **Accessible**: High contrast text, proper semantic HTML, ARIA labels
- **Responsive**: Mobile-first design that works on all screen sizes
- **Performance**: Smooth 60fps animations with hardware acceleration
- **Delightful**: Micro-interactions and hover effects make the UI engaging

## Status

**Current Phase**: Milestone 2 Complete - Class & Student Management ✅

**Completed Milestones:**
- ✅ **Milestone 0**: Project Scaffold
  - React + Vite + TypeScript + shadcn/ui
  - Service layer architecture with interfaces
  - 7-page routing structure

- ✅ **Milestone 1**: Auth + Google APIs
  - Google OAuth 2.0 with Drive & Sheets scopes
  - Direct API calls from browser (no backend needed)
  - Google Sheets service (full CRUD for 8 sheets)
  - Google Drive service (folder operations)
  - Workspace initialization (auto-creates spreadsheet + organized folder)

- ✅ **Milestone 2**: Class & Student Management
  - Full CRUD for classes (name, grade level, school year)
  - Full CRUD for students (name, student number, class assignment)
  - Multi-language UI (Romanian/English)
  - Account dropdown with workspace configuration
  - Reset workspace functionality

**In Progress:**
- 🚧 **Milestone 3**: Photo Inbox & Assignment
- ⏳ **Milestone 4**: AI Grading Engine (Gemini integration)
- ⏳ **Milestone 5**: Teacher Review Interface
- ⏳ **Milestone 6**: Analytics Dashboard

## Recent Updates

### February 2026
- **🗑️ Trash-Aware Initialization**: Dashboard now verifies cached Drive/Sheets IDs against the Drive API on load — if the spreadsheet was moved to trash, the stale cache is cleared and a "Recreate Workspace" prompt appears instead of silently using the deleted file
- **🎨 Gradient Header & Navigation**: Full-width purple/pink/rose gradient header replacing the plain white bar — includes app logo, navigation links (Dashboard, Classes, Inbox, Analytics) with active state highlighting, language switcher, and avatar account menu styled for the gradient background; mobile-responsive with horizontal scroll nav
- **🔐 Login Page Redesign**: Two-column layout — vibrant purple/pink gradient panel on the left with app benefits, clean white card on the right with Google sign-in button and "Keep me signed in" checkbox
- **🔑 Persistent Session Control**: "Keep me signed in" checkbox on login — unchecked (default) stores tokens in `sessionStorage` (cleared on tab close), checked stores in `localStorage` (persists across sessions)
- **🌍 Full Login i18n**: All login page text is now translated in Romanian and English; login page respects the selected language like the rest of the app
- **📚 Subject-Based Class Management**: Complete class management system
  - 4-step wizard: Subject → School Year → Class Name → Students
  - 12 predefined Romanian subjects (Math, Romanian, English, History, etc.) + custom subjects
  - Auto-defaults to current academic year (Sept-Aug calendar)
  - Detects and reuses existing student rosters across subjects
  - Bulk student input (paste names, one per line)
  - Classes page with vibrant empty state and grouped-by-year list view
  - Delete functionality with confirmation dialogs
  - Full i18n support (Romanian/English)
- **🎨 Vibrant Gradient Design**: Beautiful gradient cards with animations, shimmer effects, and glass-morphism
  - Purple/pink/rose gradient for Photo Inbox
  - Blue/cyan/teal gradient for Classes
  - Orange/amber/yellow gradient for Analytics
  - Emerald/teal gradient for achievements banner
  - Smooth hover animations with lift effects
  - Shimmer animations sliding across cards
  - Modern, fun, and engaging interface
- **📚 README Sheet**: Auto-generated documentation in every graide-data spreadsheet explaining data structure, relationships, and editing guidelines
- **🌍 Internationalization**: Full Romanian/English support with Romanian as default language
- **⚙️ Enhanced Account Menu**: View all workspace configuration (folder, spreadsheet, organized folder IDs) with one-click access to Drive/Sheets
- **🔄 Reset Configuration**: Reset workspace setup without losing authentication
- **🚀 Unified Setup Flow**: Single dialog handles both Drive URL configuration and workspace initialization
- **✨ Auto-Initialization**: Automatically detects missing spreadsheet and prompts for setup
- **🎨 Branding Update**: Navy + coral color scheme with new logo

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
