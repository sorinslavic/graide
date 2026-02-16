# Milestone 1: Auth + Google APIs - Implementation Plan

**Status:** 🚧 In Progress - Phase 1/5 Complete ✅
**Goal:** Build authentication and data persistence layer for grAIde
**Expected Duration:** 1-2 days of focused development

---

## Overview

Milestone 1 establishes the foundation for grAIde by implementing:
1. Google OAuth authentication
2. Google Sheets integration (7-sheet data model)
3. Google Drive integration (folder and file operations)
4. First-time setup wizard
5. Class & Student management UI

By the end of this milestone, teachers will be able to:
- ✅ Login with their Google account
- ✅ Complete first-time setup (provide Drive folder)
- ✅ Create/edit/delete classes
- ✅ Create/edit/delete students
- ✅ All data persists to Google Sheets

---

## Implementation Phases

We'll implement in 5 phases with **testing checkpoints** after each phase.

### Phase 1: Google OAuth Authentication ✅

**Duration:** 3-4 hours
**Priority:** CRITICAL (everything depends on this)
**Status:** COMPLETE - Tested and working

#### What We're Building
- Google OAuth login flow
- Token management (store in localStorage)
- Protected routes (redirect to login if not authenticated)
- User profile display

#### Files to Create/Modify
```
src/
├── services/auth/
│   └── google-auth-service.ts          [NEW] OAuth implementation
├── hooks/
│   └── use-auth.ts                     [NEW] React hook for auth
├── components/layout/
│   └── ProtectedRoute.tsx              [NEW] Route protection
├── pages/
│   └── LoginPage.tsx                   [UPDATE] Real OAuth button
└── App.tsx                             [UPDATE] Wrap with OAuth provider
```

#### Implementation Steps

1. **Install dependencies** (if needed)
   ```bash
   # Check if @react-oauth/google is installed
   npm list @react-oauth/google
   ```

2. **Create GoogleAuthService** (`src/services/auth/google-auth-service.ts`)
   - Implement `AuthService` interface
   - Methods:
     - `login()` - Trigger OAuth flow
     - `logout()` - Clear tokens
     - `getToken()` - Return access token
     - `isAuthenticated()` - Check if logged in
     - `getUserInfo()` - Get email, name, picture
   - Store token in `localStorage.getItem('google_oauth_token')`

3. **Create useAuth hook** (`src/hooks/use-auth.ts`)
   - Wraps GoogleAuthService
   - Provides: `login()`, `logout()`, `user`, `isAuthenticated`, `token`
   - React Context for sharing auth state

4. **Update App.tsx**
   - Wrap app with `GoogleOAuthProvider`
   - Pass `VITE_GOOGLE_CLIENT_ID` from env

5. **Update LoginPage.tsx**
   - Replace placeholder button with `<GoogleLogin />` component
   - Handle `onSuccess` → store token → redirect to `/dashboard`
   - Handle `onError` → show error message

6. **Create ProtectedRoute component** (`src/components/layout/ProtectedRoute.tsx`)
   - Check if authenticated
   - If not → redirect to `/`
   - If yes → render children

7. **Wrap routes in App.tsx**
   - All routes except `/` wrapped with `<ProtectedRoute>`

#### Environment Variables Needed

Create `.env` file:
```env
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
```

**How to get OAuth credentials:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project "grAIde"
3. Enable APIs: Google Sheets API, Google Drive API
4. Create OAuth 2.0 credentials
5. Authorized JavaScript origins: `http://localhost:5173`
6. Authorized redirect URIs: `http://localhost:5173`
7. Copy Client ID to `.env`

#### OAuth Scopes Required
```javascript
const scopes = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive',
];
```

#### Testing Checklist (Phase 1) ✅ ALL PASSED
- [x] Click "Sign in with Google" button on LoginPage
- [x] Google OAuth popup appears
- [x] Select Google account and grant permissions
- [x] After success, redirected to `/dashboard`
- [x] User email/picture displayed in header
- [x] Refresh page → still logged in (token persisted)
- [x] Navigate to `/classes` → works (protected route)
- [x] Logout → token cleared, redirected to `/`
- [x] Try accessing `/dashboard` after logout → redirected to `/`

---

### Phase 2: Google Sheets Service ⏳

**Duration:** 4-5 hours
**Priority:** CRITICAL (data persistence)

#### What We're Building
- Google Sheets API integration
- Auto-create "graide-data" spreadsheet with 7 sheets
- CRUD operations for Classes and Students
- Config storage (folder_id, spreadsheet_id)

#### Files to Create/Modify
```
src/
├── services/google/
│   └── local-sheets-service.ts         [NEW] Sheets API implementation
├── hooks/
│   └── use-sheets.ts                   [NEW] React Query hooks
└── lib/
    └── sheets-schema.ts                [NEW] Sheet headers/schemas
```

#### Implementation Steps

1. **Create sheet schema definitions** (`src/lib/sheets-schema.ts`)
   ```typescript
   export const SHEET_HEADERS = {
     CLASSES: ['id', 'name', 'grade_level', 'school_year', 'created_at'],
     STUDENTS: ['id', 'class_id', 'name', 'student_num'],
     // ... etc for all 7 sheets
   };
   ```

2. **Create LocalSheetsService** (`src/services/google/local-sheets-service.ts`)
   - Import `googleapis` package
   - Authenticate using OAuth token from `useAuth()`
   - Implement all methods from `SheetsService` interface

3. **Implement `initializeSpreadsheet(folderId)`**
   - Search for "graide-data" in folder
   - If not found:
     - Create new spreadsheet
     - Create 7 sheets (Classes, Students, Tests, Results, Mistakes, Rubrics, Config)
     - Add headers to each sheet
     - Move spreadsheet to folder
   - Return spreadsheet ID

4. **Implement Classes CRUD**
   - `getClasses()` → read all rows from Classes sheet
   - `createClass(data)` → append row with auto-generated ID
   - `updateClass(id, data)` → find row by ID, update
   - `deleteClass(id)` → find row by ID, delete

5. **Implement Students CRUD**
   - Same pattern as Classes
   - `getStudents(classId?)` → filter by class_id if provided

6. **Implement Config operations**
   - `getConfig(key)` → read from Config sheet
   - `setConfig(key, value)` → write to Config sheet
   - `getAllConfig()` → read all config rows

7. **Create useSheets hook** (`src/hooks/use-sheets.ts`)
   - Uses React Query
   - Provides:
     - `useClasses()` → query for classes list
     - `useCreateClass()` → mutation for creating class
     - `useUpdateClass()` → mutation for updating
     - `useDeleteClass()` → mutation for deleting
     - Same pattern for Students

#### Testing Checklist (Phase 2)
- [ ] After login, app auto-creates "graide-data" spreadsheet
- [ ] Open Google Sheets → verify spreadsheet exists
- [ ] Verify 7 sheets created: Classes, Students, Tests, Results, Mistakes, Rubrics, Config
- [ ] Each sheet has correct headers
- [ ] Create a class via API → row appears in Classes sheet
- [ ] Update class → row updates in sheet
- [ ] Delete class → row removed from sheet
- [ ] Create student → appears in Students sheet
- [ ] All changes visible in Google Sheets immediately

---

### Phase 3: Google Drive Service ⏳

**Duration:** 2-3 hours
**Priority:** HIGH (needed for setup)

#### What We're Building
- Google Drive API integration
- Parse Drive share links to extract folder ID
- Create folders (organized/ subfolder)
- List files and folders

#### Files to Create/Modify
```
src/
├── services/google/
│   └── local-drive-service.ts          [NEW] Drive API implementation
└── hooks/
    └── use-drive.ts                    [NEW] React Query hooks
```

#### Implementation Steps

1. **Create LocalDriveService** (`src/services/google/local-drive-service.ts`)
   - Import `googleapis` package
   - Authenticate using OAuth token

2. **Implement folder operations**
   - `extractFolderIdFromShareLink(link)`
     - Parse URLs like: `https://drive.google.com/drive/folders/ABC123?usp=sharing`
     - Extract: `ABC123`
   - `initializeFolderStructure(rootFolderId)`
     - Check if `organized/` subfolder exists
     - If not, create it
     - Return `organizedFolderId`
   - `createFolder(parentId, name)` → create folder
   - `listFolders(folderId)` → list subfolders

3. **Implement file operations**
   - `listFiles(folderId, options)` → list files
     - Filter by mimeType: `image/jpeg`, `image/png`
     - Exclude subfolders from results
   - `getFile(fileId)` → get file metadata
   - `getDownloadUrl(fileId)` → get URL for displaying

4. **Create useDrive hook** (`src/hooks/use-drive.ts`)
   - `useFolderFiles(folderId)` → query files in folder
   - `useCreateFolder()` → mutation for creating folder

#### Testing Checklist (Phase 3)
- [ ] Create a test folder in Google Drive
- [ ] Get share link (e.g., `https://drive.google.com/...`)
- [ ] Call `extractFolderIdFromShareLink(link)` → returns folder ID
- [ ] Call `initializeFolderStructure(folderId)` → creates `organized/` subfolder
- [ ] Open Google Drive → verify `organized/` folder exists
- [ ] Upload test image to folder → call `listFiles()` → image appears
- [ ] Call `getDownloadUrl()` → URL works in browser

---

### Phase 4: First-Time Setup Flow ⏳

**Duration:** 2-3 hours
**Priority:** HIGH (user experience)

#### What We're Building
- Setup wizard for new users
- Collect Drive folder share link
- Auto-initialize folder structure and spreadsheet
- Save config for future sessions

#### Files to Create/Modify
```
src/
├── pages/
│   └── SetupPage.tsx                   [NEW] Setup wizard
├── components/layout/
│   └── Header.tsx                      [NEW] App header with logout
└── App.tsx                             [UPDATE] Add /setup route
```

#### Implementation Steps

1. **Create SetupPage.tsx** (`src/pages/SetupPage.tsx`)
   - Multi-step wizard:
     - Step 1: Welcome message
     - Step 2: "Paste your Google Drive folder share link"
       - Text input for share link
       - Help text: "Create a folder in Google Drive, click Share, copy link"
     - Step 3: Processing...
       - Extract folder ID
       - Initialize folder structure (create organized/)
       - Create spreadsheet
       - Save config
     - Step 4: Success! → redirect to /dashboard

2. **Add setup check to login flow**
   - After OAuth success in LoginPage:
     - Check if `folder_id` exists in config
     - If not → redirect to `/setup`
     - If yes → redirect to `/dashboard`

3. **Create Header component** (`src/components/layout/Header.tsx`)
   - Display user email/picture
   - Logout button
   - Used across all pages

4. **Update DashboardPage.tsx**
   - Add Header component
   - Display welcome message with user's name

#### Testing Checklist (Phase 4)
- [ ] First login → redirected to `/setup`
- [ ] Paste Drive folder share link → "Continue" button enabled
- [ ] Click Continue → processing spinner shows
- [ ] After processing:
   - [ ] Spreadsheet created in Drive folder
   - [ ] `organized/` subfolder created
   - [ ] Config saved (folder_id, spreadsheet_id)
- [ ] Redirected to `/dashboard`
- [ ] Refresh page → goes straight to dashboard (no setup again)
- [ ] Logout → click login again → setup skipped (already done)

---

### Phase 5: Class & Student Management UI ⏳

**Duration:** 3-4 hours
**Priority:** HIGH (first real feature)

#### What We're Building
- Full CRUD UI for Classes and Students
- Forms with validation
- Loading and error states
- Professional UI with shadcn/ui components

#### Files to Create/Modify
```
src/
├── components/classes/
│   ├── ClassForm.tsx                   [NEW] Create/edit class form
│   ├── ClassList.tsx                   [NEW] Display classes
│   ├── StudentForm.tsx                 [NEW] Create/edit student form
│   └── StudentList.tsx                 [NEW] Display students
├── components/ui/
│   ├── dialog.tsx                      [NEW] Modal dialogs
│   ├── form.tsx                        [NEW] Form components
│   ├── input.tsx                       [NEW] Input fields
│   ├── label.tsx                       [NEW] Labels
│   ├── select.tsx                      [NEW] Dropdowns
│   └── table.tsx                       [NEW] Tables
└── pages/
    └── ClassesPage.tsx                 [UPDATE] Full implementation
```

#### Implementation Steps

1. **Add shadcn/ui components**
   ```bash
   npx shadcn-ui@latest add dialog
   npx shadcn-ui@latest add form
   npx shadcn-ui@latest add input
   npx shadcn-ui@latest add label
   npx shadcn-ui@latest add select
   npx shadcn-ui@latest add table
   ```

2. **Create ClassForm.tsx**
   - Uses react-hook-form + zod validation
   - Fields: name, grade_level (1-12), school_year
   - Used for both create and edit
   - Validation:
     - Name required, max 50 chars
     - Grade level required, 1-12
     - School year format: "2024-2025"

3. **Create ClassList.tsx**
   - Table displaying all classes
   - Columns: Name, Grade Level, School Year, Actions
   - Actions: Edit button, Delete button
   - Empty state: "No classes yet - add your first class!"

4. **Update ClassesPage.tsx**
   - Use `useClasses()` hook to fetch data
   - "Add Class" button → opens dialog with ClassForm
   - Display ClassList
   - Click class row → expand to show students
   - Loading spinner while fetching
   - Error message if fetch fails

5. **Create StudentForm.tsx**
   - Fields: name, student_num (optional)
   - Validation: name required, max 100 chars

6. **Create StudentList.tsx**
   - Table per class showing students
   - Columns: Name, Number, Actions
   - Actions: Edit, Delete

7. **Wire up mutations**
   - Create class → calls `useCreateClass()` → refetches list
   - Update class → calls `useUpdateClass()` → refetches
   - Delete class → confirm dialog → calls `useDeleteClass()` → refetches
   - Same for students

#### Testing Checklist (Phase 5)
- [ ] Navigate to `/classes` page
- [ ] Click "Add Class" → form dialog opens
- [ ] Fill in: name="5A", grade=5, year="2025-2026"
- [ ] Submit → dialog closes, class appears in table
- [ ] Verify class exists in Google Sheets
- [ ] Click Edit → form pre-filled → change name → save
- [ ] Verify update in Sheets
- [ ] Click class row → expands to show students section
- [ ] Click "Add Student" → form opens
- [ ] Add student: name="Ion Popescu", num="12"
- [ ] Submit → student appears in table
- [ ] Verify student in Sheets (Students sheet)
- [ ] Edit student → works
- [ ] Delete student → confirm → removed
- [ ] Delete class → confirm → removed (cascade delete students?)
- [ ] Refresh page → all data persists

---

## Environment Setup

### Required Files

**`.env`** (create this file):
```env
# Google OAuth Client ID (from Google Cloud Console)
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com

# Optional: Client Secret (usually not needed for frontend OAuth)
# VITE_GOOGLE_CLIENT_SECRET=YOUR_SECRET
```

**`.env.example`** (already exists, verify it has):
```env
VITE_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=your_client_secret_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_APP_URL=http://localhost:5173
```

### Google Cloud Console Setup

**Step-by-step guide:**

1. **Create Project**
   - Go to https://console.cloud.google.com/
   - Click "Select a project" → "New Project"
   - Name: "grAIde"
   - Click "Create"

2. **Enable APIs**
   - Go to "APIs & Services" → "Library"
   - Search "Google Sheets API" → Enable
   - Search "Google Drive API" → Enable

3. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "grAIde Local Dev"
   - Authorized JavaScript origins:
     - `http://localhost:5173`
   - Authorized redirect URIs:
     - `http://localhost:5173`
   - Click "Create"
   - Copy Client ID

4. **Configure OAuth Consent Screen**
   - Go to "OAuth consent screen"
   - User Type: "External" (for testing) or "Internal" (if G Workspace)
   - App name: "grAIde"
   - User support email: your email
   - Developer contact: your email
   - Scopes: Add scopes
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `.../auth/spreadsheets`
     - `.../auth/drive`
   - Test users: Add your Google account
   - Save

5. **Copy Client ID to .env**
   ```bash
   echo "VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE" > .env
   ```

---

## Success Criteria

### End-to-End Flow
By the end of Milestone 1, this complete flow should work:

1. User opens `http://localhost:5173`
2. Sees login page with Google button
3. Clicks "Sign in with Google"
4. Google OAuth popup → select account → grant permissions
5. Redirected to `/setup` (first time only)
6. Pastes Drive folder share link → clicks Continue
7. App creates:
   - "graide-data" spreadsheet in folder (7 sheets)
   - "organized/" subfolder
8. Redirected to `/dashboard`
9. Clicks "Classes" navigation
10. Clicks "Add Class" → fills form → submits
11. Class appears in UI and in Google Sheets
12. Clicks class → clicks "Add Student" → fills form → submits
13. Student appears in UI and in Google Sheets
14. Refreshes page → all data persists
15. Clicks logout → token cleared
16. Logs in again → goes straight to dashboard (setup already done)

### Technical Validation
- ✅ OAuth tokens stored and refreshed correctly
- ✅ All API calls authenticated with OAuth token
- ✅ Spreadsheet visible in Google Drive
- ✅ All 7 sheets created with correct headers
- ✅ CRUD operations work for Classes and Students
- ✅ Data syncs between app and Google Sheets
- ✅ React Query caching works (no unnecessary API calls)
- ✅ Loading states display during API calls
- ✅ Error states display if API fails
- ✅ Forms validate input (required fields, formats)
- ✅ Protected routes redirect unauthenticated users
- ✅ Setup wizard only runs once

---

## Testing Strategy

### After Each Phase

**Phase 1:** Test OAuth login/logout flow
**Phase 2:** Test spreadsheet creation and CRUD
**Phase 3:** Test folder operations and file listing
**Phase 4:** Test complete setup wizard
**Phase 5:** Test end-to-end class/student management

### Manual Testing Checklist

See individual phase checklists above.

### Debugging Tips

**OAuth issues:**
- Check Chrome DevTools → Application → Local Storage
- Verify `google_oauth_token` is stored
- Check Console for CORS errors
- Verify OAuth scopes in Google Cloud Console

**Sheets API issues:**
- Check Network tab → API calls → Response
- Verify spreadsheet ID is correct
- Check permissions on spreadsheet (should be writable)
- Test API manually: https://developers.google.com/sheets/api/quickstart/js

**Drive API issues:**
- Verify folder ID is correct
- Check folder permissions (should have write access)
- Test with Drive API Explorer: https://developers.google.com/drive/api/v3/reference

---

## Dependencies

### Already Installed
- `@google/generative-ai` (for Gemini, used in Milestone 3)
- `@radix-ui/*` (UI components)
- `@react-oauth/google` (OAuth)
- `@tanstack/react-query` (data fetching)
- `googleapis` (Google APIs)
- `react-hook-form` (forms)
- `zod` (validation)
- All other dependencies from package.json

### May Need to Install
```bash
# If shadcn/ui components aren't installed yet:
npx shadcn-ui@latest add dialog form input label select table
```

---

## File Tree After Milestone 1

```
src/
├── components/
│   ├── classes/
│   │   ├── ClassForm.tsx           [NEW]
│   │   ├── ClassList.tsx           [NEW]
│   │   ├── StudentForm.tsx         [NEW]
│   │   └── StudentList.tsx         [NEW]
│   ├── layout/
│   │   ├── Header.tsx              [NEW]
│   │   └── ProtectedRoute.tsx      [NEW]
│   └── ui/                         [NEW shadcn components]
│       ├── dialog.tsx
│       ├── form.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       └── table.tsx
├── hooks/
│   ├── use-auth.ts                 [NEW]
│   ├── use-drive.ts                [NEW]
│   └── use-sheets.ts               [NEW]
├── lib/
│   ├── sheets-schema.ts            [NEW]
│   └── utils.ts                    [EXISTS]
├── pages/
│   ├── ClassesPage.tsx             [UPDATE]
│   ├── DashboardPage.tsx           [UPDATE]
│   ├── LoginPage.tsx               [UPDATE]
│   └── SetupPage.tsx               [NEW]
├── services/
│   ├── auth/
│   │   ├── auth-service.ts         [EXISTS - interface]
│   │   └── google-auth-service.ts  [NEW - implementation]
│   └── google/
│       ├── drive-service.ts        [EXISTS - interface]
│       ├── local-drive-service.ts  [NEW - implementation]
│       ├── sheets-service.ts       [EXISTS - interface]
│       └── local-sheets-service.ts [NEW - implementation]
└── App.tsx                         [UPDATE]
```

---

## Next Steps After Milestone 1

Once Milestone 1 is complete, we'll have:
- ✅ Authentication working
- ✅ Data persistence to Google Sheets
- ✅ Drive folder setup
- ✅ Class and Student management

**Milestone 2 will add:**
- Photo Inbox (bulk photo upload and assignment)
- Drive file upload and organization
- Results sheet integration

**Milestone 3 will add:**
- AI Grading Engine (Gemini Vision integration)
- Automatic grading of test photos
- Mistake detection and classification

**Milestone 4 will add:**
- Teacher Review Interface (port Lovable design)
- Annotation system
- Grade override and feedback

---

## Notes

- All API calls use OAuth token from `useAuth()` hook
- React Query provides caching and optimistic updates
- Forms use react-hook-form + zod for validation
- UI built with shadcn/ui components (Tailwind CSS)
- Data model matches 7-sheet schema from docs/data-model.md
- Service layer allows swapping implementations later (local → remote)

---

**Ready to start Phase 1!** 🚀
