# grAIde Project Scaffold

**Status:** ✅ Complete (Milestone 0)
**Created:** 2026-02-15

## What Was Created

### Core Configuration
- ✅ **package.json** - All dependencies for React, TypeScript, Google APIs, Gemini AI
- ✅ **tsconfig.json** - Strict TypeScript configuration with path aliases (@/)
- ✅ **vite.config.ts** - Vite build tool configuration
- ✅ **tailwind.config.ts** - Tailwind CSS + shadcn/ui theming
- ✅ **eslint.config.js** - ESLint for code quality
- ✅ **components.json** - shadcn/ui configuration
- ✅ **.gitignore** - Git ignore rules (node_modules, .env, dist)
- ✅ **.env.example** - Template for environment variables

### Project Structure
```
src/
├── components/
│   ├── photo-inbox/         # Photo sorting UI (empty - Milestone 2)
│   ├── grading/             # Teacher review interface (empty - Milestone 4)
│   ├── classes/             # Class management (empty - Milestone 1)
│   ├── students/            # Student management (empty - Milestone 1)
│   ├── tests/               # Test setup (empty - Milestone 2)
│   ├── analytics/           # Dashboard (empty - Milestone 5)
│   ├── layout/              # App shell, nav, header (empty)
│   └── ui/                  # shadcn/ui components
│       ├── button.tsx       # ✅ Created
│       └── card.tsx         # ✅ Created
├── services/                # Business logic layer (interfaces only)
│   ├── auth/
│   │   └── auth-service.ts           # ✅ AuthService interface
│   ├── google/
│   │   ├── sheets-service.ts         # ✅ SheetsService interface
│   │   └── drive-service.ts          # ✅ DriveService interface
│   ├── ai/
│   │   └── ai-service.ts             # ✅ AIGradingService interface
│   ├── photos/              # Photo inbox logic (empty - Milestone 2)
│   └── grading/             # Grading orchestration (empty - Milestone 3)
├── hooks/                   # React hooks (empty)
├── types/                   # TypeScript type definitions
│   ├── sheets.ts            # ✅ 7-sheet data model
│   ├── grading.ts           # ✅ Grading domain types
│   ├── drive.ts             # ✅ Drive types
│   └── index.ts             # ✅ Central exports
├── lib/
│   └── utils.ts             # ✅ Utility functions (cn, generateId, etc.)
├── pages/                   # Route components
│   ├── LoginPage.tsx        # ✅ Placeholder with Google button
│   ├── DashboardPage.tsx    # ✅ Placeholder with nav
│   ├── PhotoInboxPage.tsx   # ✅ Placeholder
│   ├── GradingPage.tsx      # ✅ Placeholder
│   ├── ClassesPage.tsx      # ✅ Placeholder
│   ├── AnalyticsPage.tsx    # ✅ Placeholder
│   └── NotFoundPage.tsx     # ✅ 404 page
├── App.tsx                  # ✅ Main app with routing
├── main.tsx                 # ✅ Entry point
├── index.css                # ✅ Tailwind + shadcn/ui styles
└── vite-env.d.ts            # ✅ Vite type declarations
```

### Type Definitions Created

**sheets.ts** - Matches 7-sheet Google Sheets data model:
- `Class`, `Student`, `Test`, `Result`, `Mistake`, `Rubric`, `Config`
- All interfaces match docs/data-model.md specification

**grading.ts** - Grading domain (adapted from Lovable design):
- `Annotation`, `Comment`, `TestPage`, `GradingResult`, `QuestionGrade`
- Extended with grAIde-specific fields (questionNum, mistakeType, aiConfidence)

**drive.ts** - Google Drive integration:
- `DriveFile`, `DriveFolder`, `PhotoInboxItem`, `FolderStructure`

### Service Layer Interfaces

All service interfaces defined (implementations come in later milestones):

**AuthService** - Google OAuth authentication
- `login()`, `logout()`, `getToken()`, `isAuthenticated()`, `getUserInfo()`

**SheetsService** - Complete CRUD for all 7 sheets
- Classes, Students, Tests, Results, Mistakes, Rubrics, Config
- Filtering and querying capabilities

**DriveService** - Google Drive file operations
- List, upload, move, rename, create folders
- Download URLs, folder structure initialization

**AIGradingService** - AI grading with Gemini Vision
- `gradeSubmission(photoUrls, rubrics)` → AIGradingResult
- Returns scores, mistakes, bounding boxes, confidence

## How to Use

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
# Opens at http://localhost:5173
```

### Build
```bash
npm run build
npm run preview
```

### Environment Setup
1. Copy `.env.example` to `.env`
2. Add Google OAuth credentials (get from Google Cloud Console)
3. Add Gemini API key (get from https://aistudio.google.com/)

## What Works Right Now

- ✅ Dev server runs (`npm run dev`)
- ✅ Production build works (`npm run build`)
- ✅ Routing is configured (all routes render placeholder pages)
- ✅ Tailwind CSS styling is active
- ✅ shadcn/ui components (button, card) are available
- ✅ TypeScript strict mode enabled with path aliases
- ✅ ESLint configured

## What's Next (Milestone 1)

1. Implement **GoogleAuthService** (OAuth login)
2. Implement **LocalSheetsService** (Google Sheets CRUD)
3. Implement **LocalDriveService** (Google Drive operations)
4. Create auto-initialize logic (create "graide-data" spreadsheet on first login)
5. Build **Classes & Students management UI** (forms for CRUD)

## Notes

- All service interfaces follow dependency inversion principle
- Implementations can be swapped without changing UI code
- Service layer supports both local (MVP) and remote (future) implementations
- Type definitions match grAIde specs and Lovable design
- Project structure matches docs/architecture.md and claude.md

---

**Scaffold completed successfully!** ✅

Ready for Milestone 1: Auth + Google APIs implementation.
