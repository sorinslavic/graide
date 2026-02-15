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

## Quick Start

**Development Setup:**

```bash
# 1. Clone the repository
git clone https://github.com/sorinslavic/graide.git
cd graide

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env and add:
#   - Google OAuth client ID/secret (from Google Cloud Console)
#   - Gemini API key (free from https://aistudio.google.com/)

# 4. Start development server
npm run dev

# 5. Open http://localhost:5173
```

**Current Status:** Scaffold is complete and runs successfully. Features are being implemented in milestones. See [SCAFFOLD.md](./SCAFFOLD.md) for details on what's built so far.

**Requirements:**
- Node.js 18+
- Google account (for OAuth + Sheets + Drive)
- Gemini API key (free from [AI Studio](https://aistudio.google.com/) — no credit card)

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
