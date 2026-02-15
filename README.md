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

**Current Phase**: Foundation Development (Milestone 0 ✅ Complete)

- ✅ **Milestone 0**: Project scaffold complete (React + Vite + TypeScript)
  - Complete type system (sheets, grading, drive)
  - Service layer interfaces (Auth, Sheets, Drive, AI)
  - Routing with 7 page placeholders
  - Tailwind CSS + shadcn/ui components
  - 917 lines of TypeScript code, builds successfully
- 🚧 **Next**: Milestone 1 - Auth + Google APIs implementation
  - Google OAuth login
  - Google Sheets service (CRUD for all 7 sheets)
  - Google Drive service (file operations)
  - Class & Student management UI

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

❌ **What's Not Yet Implemented:**
- Google OAuth login (Milestone 1)
- Data persistence to Google Sheets (Milestone 1)
- Photo upload to Drive (Milestone 2)
- AI grading (Milestone 3)

See [SCAFFOLD.md](./SCAFFOLD.md) for complete details on what's built.

### Optional: Configure Environment Variables

For future milestones that require Google APIs:

```bash
cp .env.example .env
```

Edit `.env` and add:
- Google OAuth client ID/secret (from [Google Cloud Console](https://console.cloud.google.com))
- Gemini API key (free from [AI Studio](https://aistudio.google.com/))

**Note:** You don't need these yet - the app runs without them for now.

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
