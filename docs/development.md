# Development Guide

## Milestone Progress

| Milestone | Status | Description |
|-----------|--------|-------------|
| 0: Scaffold | ✅ Complete | React + Vite + TypeScript + shadcn/ui, service layer, routing |
| 1: Auth + APIs | ✅ Complete | Google OAuth, Sheets CRUD (8 sheets), Drive operations, workspace init |
| 2: Class Management | ✅ Complete | Full class/student CRUD, i18n (RO/EN), vibrant gradient UI |
| 3: Photo Inbox | 🚧 Next | Bulk photo upload, assign to students, Drive organisation |
| 4: AI Grading | ⏳ Pending | Gemini Vision integration, handwriting recognition |
| 5: Teacher Review | ⏳ Pending | Side-by-side photo vs AI, grade overrides, annotations |
| 6: Analytics | ⏳ Pending | Mistake patterns, student trends, charts |

---

## Getting Started

### Prerequisites
- **Node.js**: 18+ (LTS recommended)
- **npm**: 9+ (comes with Node.js)
- **Google Account**: For Google Sheets & Drive access
- **Git**: For cloning repository
- **Code Editor**: VS Code recommended

### Setup

#### 1. Clone Repository
```bash
git clone https://github.com/sorinslavic/graide.git
cd graide
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Configure Google API Credentials

**A. Create Google Cloud Project**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project: "grAIde" (or your preferred name)
3. Enable APIs:
   - Google Sheets API
   - Google Drive API

**B. Create OAuth 2.0 Credentials**
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: "Web application"
4. Authorized JavaScript origins: `http://localhost:3000`
5. Authorized redirect URIs: `http://localhost:3000`
6. Copy Client ID and Client Secret

**C. Create `.env` File**
Create `.env` in project root:
```env
# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_client_id_here
VITE_GOOGLE_CLIENT_SECRET=your_client_secret_here

# Gemini API (for AI grading — free tier from AI Studio)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# App Config
VITE_APP_URL=http://localhost:3000
```

⚠️ **Never commit `.env` to git** - it's already in `.gitignore`

#### 4. Get Gemini API Key (for AI grading — free, no credit card)
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API Key" → "Create API key"
4. Copy the key and add to `.env` as `VITE_GEMINI_API_KEY`

> The free tier allows ~1,000 requests/day — plenty for grading a full class.

#### 5. Start Development Server
```bash
npm run dev
```

App will open at `http://localhost:3000`

#### 6. First Login & Setup
1. Click "Login with Google"
2. Grant permissions (Sheets + Drive access)
3. App will create initial spreadsheet structure
4. You're ready to grade!

---

## Development Workflow

### Branch Strategy
- `main` - production-ready code (stable)
- `claude/*` - AI-generated feature branches
- `feature/*` - human developer feature branches
- `fix/*` - bug fixes

### Commit Message Convention
Follow conventional commits:
```
feat: add new feature
fix: resolve bug
docs: update documentation
refactor: code improvements
test: add tests
chore: maintenance tasks
style: formatting changes
```

Example:
```bash
git commit -m "feat: add AI grading for multiple choice questions"
git commit -m "fix: resolve Google Sheets API rate limit error"
git commit -m "docs: update README with setup instructions"
```

### Pull Request Process
1. Create feature branch from `main`
2. Make changes and commit
3. Push to remote
4. Create PR with description of changes
5. Wait for review
6. Merge after approval

---

## Schema Versioning

grAIde uses Google Sheets as its database. The spreadsheet structure (sheets, columns, README content) is defined in code and may change as features are added. A versioning system ensures existing spreadsheets are automatically updated without losing data.

### How It Works

1. **`SCHEMA_VERSION`** — an integer constant in `src/services/google/local-sheets-service.ts`
2. **`schema_version`** — a key stored in the Config sheet of every user's spreadsheet
3. On every dashboard load, the app reads `schema_version` from the Config sheet and compares it to `SCHEMA_VERSION` in code
4. If the code version is higher, `reconcileSchema()` runs automatically:
   - Creates any missing sheet tabs
   - Refreshes the README sheet content
   - Updates `schema_version` in Config
5. The user sees a toast: *"Workspace updated to the latest version"*

### Version History

| Version | What changed |
|---------|-------------|
| 1 | Initial schema — 7 data sheets (Classes, Students, Tests, Results, Mistakes, Rubrics, Config) |
| 2 | Added README sheet with auto-generated documentation |
| 3 | Replaced Results → Submissions (new status flow, drive_file_ids CSV); Mistakes → SubmissionDetails (per question/photo); Tests redesigned with type, class_ids, given_at, deadline, grading_system, status |

### ⚠️ When You Must Bump `SCHEMA_VERSION`

**Bump the version whenever you change any of the following:**

- `SHEET_SCHEMAS` in `local-sheets-service.ts` — adding a new sheet, adding or renaming columns
- `populateReadme()` — updating the README sheet content
- Any default rows written to sheets during initialization (e.g., default Config keys)

**How to bump:**

1. Open `src/services/google/local-sheets-service.ts`
2. Increment `SCHEMA_VERSION` by 1
3. Add a line to the version history comment above the constant describing what changed
4. Add a line to the **Version History** table above in this file

```typescript
// Before
export const SCHEMA_VERSION = 2;

// After (example: added a new "Templates" sheet in v3)
/**
 * ...
 *   2 — added README sheet with documentation
 *   3 — added Templates sheet for reusable rubrics   ← add this
 */
export const SCHEMA_VERSION = 3;             ← bump this
```

The reconciliation is **idempotent** — running it on a spreadsheet that is already up to date is safe and does nothing.

### What Reconciliation Does NOT Do

- It does **not** delete existing data or rows
- It does **not** rename existing columns (renaming a column = add new + migrate data manually)
- It does **not** remove old sheets

If a migration requires data transformation (e.g., splitting a column into two), handle it with a dedicated migration step inside `reconcileSchema()` before bumping the version.

---

## Project Structure

```
graide/
├── src/
│   ├── components/          # UI layer (React - what the user sees)
│   │   ├── grading/         #   Grading & review interface
│   │   ├── classes/         #   Class management
│   │   ├── students/        #   Student management
│   │   ├── tests/           #   Test setup & photo upload
│   │   ├── analytics/       #   Analytics dashboard
│   │   └── common/          #   Shared UI components
│   ├── services/            # Business logic layer (interfaces + implementations)
│   │   ├── auth/            #   Google OAuth service
│   │   │   ├── auth-service.ts          # Interface
│   │   │   └── google-auth-service.ts   # Implementation
│   │   ├── google/          #   Google Sheets & Drive services
│   │   │   ├── sheets-service.ts        # Interface
│   │   │   ├── local-sheets-service.ts  # Implementation (direct API)
│   │   │   ├── drive-service.ts         # Interface
│   │   │   └── local-drive-service.ts   # Implementation (direct API)
│   │   ├── ai/              #   AI grading service
│   │   │   ├── ai-service.ts            # Interface
│   │   │   └── local-ai-service.ts      # Implementation (direct Gemini API)
│   │   └── grading/         #   Grading orchestration
│   │       └── grading-engine.ts        # Photo → AI → grade workflow
│   ├── hooks/               # React hooks (connects services to components)
│   ├── utils/               # Helper functions
│   ├── types/               # TypeScript types & shared models
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── public/                  # Static assets
├── docs/                    # Documentation
├── .env.example             # Example environment variables
├── .gitignore
├── package.json
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
└── README.md

### Architecture Note
The `services/` layer uses TypeScript interfaces so implementations can be
swapped without changing UI code. For MVP, all services call APIs directly
from the browser (safe on localhost). To extract a backend later, add new
implementation files (e.g., `remote-ai-service.ts`) that call a server
instead — no component changes needed.
```

---

## Testing

### Manual Testing Checklist
- [x] **OAuth login flow works** (Phase 1 ✅)
- [ ] Can create/edit classes (Phase 5)
- [ ] Can add/edit students (Phase 5)
- [ ] Can upload test photos to Drive (Milestone 2)
- [ ] AI grading produces correct results (Milestone 3)
- [ ] Grades save to Sheets correctly (Phase 2)
- [ ] Analytics dashboard displays data (Milestone 5)
- [ ] Can edit data in Sheets and see changes in app (Phase 2)

### Automated Testing (Future)
- Unit tests: `npm run test`
- E2E tests: `npm run test:e2e`

---

## Deployment

### Local Deployment (Current)
```bash
# Run locally
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Cloud Deployment (Future)
When ready to deploy to cloud:
1. Choose hosting (Vercel, Netlify, etc.)
2. Add environment variables to hosting platform
3. Connect GitHub repository
4. Auto-deploy on push to `main`

---

## Development Phases

### Phase 1: Planning & Design ✅
- [x] Define core features
- [x] Choose technology stack (React + Vite + Google Sheets/Drive)
- [x] Design architecture (local-first, Google APIs)
- [x] Complete specification (6/6 questions answered)
- [x] Define data models (Google Sheets schema)
- [x] UI design reference (Lovable mock analyzed and documented)

### Phase 2: MVP Development (Current)

**Milestone 0: Project Scaffold ✅ COMPLETE**
- [x] Initialize React + Vite + TypeScript project
- [x] Set up folder structure (components/, services/, hooks/, types/)
- [x] Configure ESLint, Prettier, Tailwind CSS
- [x] Create `.env.example` with required variables
- [x] Define complete type system (sheets, grading, drive)
- [x] Create service layer interfaces (Auth, Sheets, Drive, AI)
- [x] Set up routing with 7 page placeholders
- [x] Add shadcn/ui components (button, card)
- [x] Verify build and dev server work successfully
- [x] Document scaffold in SCAFFOLD.md and claude.md

**Status:** 917 lines of TypeScript code, builds successfully, dev server runs at localhost:5173

**Milestone 1: Auth + Google APIs (Sheets/Drive) 🚧 NEXT**
- [ ] Implement Google OAuth login service (interface + implementation)
- [ ] Implement Google Sheets service (CRUD operations)
- [ ] Implement Google Drive service (upload/download/list)
- [ ] Auto-create "graide-data" spreadsheet with 7 sheets on first login
- [ ] Build Class & Student management UI (simple forms)

**Milestone 2: Class & Student Management**
- [ ] Build class management UI (create/edit/delete classes)
- [ ] Build student management UI (create/edit/delete students)
- [ ] Wire UI to Sheets service for persistence

**Milestone 3: Test Setup & Photo Upload**
- [ ] Build test creation UI (name, date, questions, points per question)
- [ ] Build photo upload interface (single + batch)
- [ ] Implement Drive folder organization (year/class/test/)
- [ ] Associate uploaded photos with students

**Milestone 4: AI Grading Engine**
- [ ] Define AI grading service interface
- [ ] Implement local AI service (direct Gemini Vision calls)
- [ ] Build prompt engineering for math grading (answer key + photo → evaluation)
- [ ] Parse AI responses into structured grade + mistake data
- [ ] Store results in Grades + Mistakes sheets

**Milestone 5: Teacher Review & Adjustment Interface**
- [ ] Build side-by-side view (original photo vs AI evaluation)
- [ ] Implement grade override and partial credit adjustments
- [ ] Add approve/reject per question
- [ ] Add teacher comments per question or paper

**Milestone 6: Analytics Dashboard**
- [ ] Build class-wide mistake pattern view
- [ ] Build per-student error history
- [ ] Build score distribution charts
- [ ] Implement quick lookup ("What did Student X get wrong on Test Y?")

### Phase 3: Refinement
- [ ] User feedback integration (teacher testing)
- [ ] Performance optimization
- [ ] Error handling improvements
- [ ] UI/UX polish
- [ ] Additional features from feedback
- [ ] Documentation completion

### Phase 4: Launch
- [ ] Beta testing with multiple teachers
- [ ] Bug fixes from beta
- [ ] Production deployment (if cloud hosting)
- [ ] Monitoring and support setup
- [ ] User onboarding materials

---

## Common Tasks

### Adding a New Feature
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes
# ...

# Commit
git add .
git commit -m "feat: add your feature description"

# Push
git push -u origin feature/your-feature-name

# Create PR on GitHub
```

### Debugging Google API Issues
```bash
# Check OAuth token
localStorage.getItem('google_oauth_token')

# Enable API debug logs
# Add to .env:
VITE_DEBUG_GOOGLE_API=true

# Check Sheets API quota
# Go to Google Cloud Console → APIs & Services → Quotas
```

### Updating Dependencies
```bash
# Check for updates
npm outdated

# Update all dependencies
npm update

# Update specific package
npm update <package-name>

# Update major versions (careful!)
npm install <package-name>@latest
```

---

## Troubleshooting

### Issue: OAuth login fails
**Solution**:
- Check Client ID in `.env` matches Google Cloud Console
- Verify redirect URI is `http://localhost:3000`
- Clear browser cookies and try again

### Issue: Sheets API "Permission Denied"
**Solution**:
- Ensure Google Sheets API is enabled in Cloud Console
- Check OAuth scopes include `https://www.googleapis.com/auth/spreadsheets`
- Re-login to refresh permissions

### Issue: Drive API "File not found"
**Solution**:
- Verify Drive API is enabled
- Check file ID is correct
- Ensure OAuth includes Drive scope
- Verify teacher has access to the file

### Issue: Gemini API rate limit
**Solution**:
- Add delays between API calls (free tier: ~10 RPM)
- Batch multiple questions into a single request where possible
- Cache AI responses to avoid re-grading
- If needed, upgrade to paid tier ($0.10/M input tokens)

---

## Contributing

### Guidelines
1. Follow code style (use Prettier/ESLint)
2. Write clear commit messages
3. Update documentation for new features
4. Add tests for critical functionality
5. Keep PRs focused and small

### Code Style
- Use ES6+ features
- Prefer functional components (React)
- Use async/await over promises
- Name files in kebab-case
- Name components in PascalCase
- Name functions in camelCase

---

## Resources
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [Google Drive API](https://developers.google.com/drive/api)
- [Google Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
- Project documentation: `/docs`

---

## Support

### Getting Help
- Check `/docs` for documentation
- Search existing GitHub issues
- Create new issue with detailed description
- Include error messages and logs

### Reporting Bugs
Include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Screenshots (if applicable)
5. Browser/OS version
6. Error messages from console

---

## License
TBD
