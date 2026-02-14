# grAIde - Specification Q&A

This document tracks the questions and answers that define the grAIde product specification.

## Status
- **Total Questions**: 6
- **Answered**: 5
- **Remaining**: 1

---

## Questions & Answers

### Q1: What is the ONE biggest pain point to solve first?
**Category**: Scope & Priorities
**Status**: ✅ Answered
**Answer**:

**Primary Pain Point: SPEED**

The grading volume is significant:
- 60-90 papers per weekend
- 3-5 minutes per paper
- Total: 4-6 hours of non-stop grading

**Related Pain Points:**
1. **Fatigue-induced mistakes**: Long grading sessions lead to errors
2. **No tracking system**: Grades and mistakes are not systematically recorded, requiring revisiting
3. **Pattern analysis needed**:
   - Same mistakes across multiple students (class-wide patterns)
   - Similar mistakes by individual students over time (student-specific patterns)
4. **Physical paper management**: Carrying 100+ papers between home and classroom
5. **Legibility issues**: Reading messy handwriting slows down the process

**Implication for MVP**:
The solution must prioritize reducing grading time while automatically tracking grades and extracting mistake patterns. Digital paper management (via scanning/photos) would also eliminate the physical burden.

---

### Q2: How does your wife currently grade tests?
**Category**: Current Workflow
**Status**: ✅ Answered
**Answer**:

**Current Manual Process:**

**Test Format:**
- Physical A4 papers (stack of 60-90)
- Two question types:
  1. Simple answer entry directly on test page
  2. Multi-step problems requiring additional pages showing computation/work

**Step-by-Step Grading Workflow:**
1. Pick up each paper from stack
2. Identify student name on paper
3. Review each problem and student's answer
4. Circle answers in red (incorrect) or green (correct)
5. Assign points for each question
6. Manually add up all points to calculate total score
7. While grading, identify and mark specific mistakes:
   - Incorrect formulas
   - Basic math operation errors (addition, subtraction, etc.)
   - Typos that led to wrong results
   - Circle and annotate the error

**Grade Recording:**
- Online gradebook exists but is **optional/not always used**
- **Primary requirement**: Must be able to verbally tell each student their grade
- **Critical requirement**: Must remember what mistakes each student made to guide them toward understanding

**Key Insight:**
The goal isn't just recording grades - it's retaining knowledge of each student's specific errors to provide individualized guidance and reteaching. This mental load is significant across 60-90 students per test.

---

### Q3: What types of math questions does she grade most often?
**Category**: Content Types
**Status**: ✅ Answered
**Answer**:

**Grade Level & Location:**
- Math teacher in Romania
- Grades 5-8 (ages ~10-14)
- Middle school mathematics curriculum

**Subject Coverage:**
- **Full range** of middle school math topics:
  - Arithmetic (basic operations, fractions, decimals)
  - Algebra (equations, variables, expressions)
  - Geometry (shapes, area, perimeter, angles, theorems)
  - Word problems across all topics
  - Mixed/combined topics

**Test Format:**
- A4 paper with **3-10 problems** per test
- These are **problems, not simple questions** - multi-step work required
- **NOT multiple choice** - open-ended responses requiring work

**Answer Format (Mixed):**
1. **Direct answers on test page**: When the answer fits in provided space
2. **Additional scratch paper**: For problems requiring:
   - Geometric drawings and diagrams
   - Step-by-step calculations (showing work)
   - Extended solutions

**Grading Complexity:**
- Teacher reviews **multiple pages per student**:
  - Main test page (with questions)
  - Additional work pages (calculations, drawings)
- Must evaluate both final answer AND work process
- Must review geometric drawings for accuracy

**Key Implication for AI:**
- Must handle diverse problem types (not specialized for one topic)
- Must process multiple pages per student submission
- Must evaluate both mathematical work AND visual elements (geometry drawings)
- Must understand multi-step problem solving, not just final answers

---

### Q4: What platform would work best?
**Category**: Platform
**Status**: ✅ Answered
**Answer**:

**Platform Decision: Web App (Local Hosting)**

**Primary Choice:**
- **Web application** running locally on teacher's laptop
- Access via `localhost:3000` (no internet deployment needed)
- Built with React/Vue + Vite for fast development

**Data Storage Architecture:**
1. **Google Sheets as Database**
   - Teacher can view/edit all data directly in familiar spreadsheet interface
   - No separate database server needed
   - Built-in backup and version history
   - Easy data export to Excel

   **Sheets Structure:**
   - Sheet 1: Teachers
   - Sheet 2: Classes
   - Sheet 3: Students
   - Sheet 4: Tests
   - Sheet 5: Grades & Mistakes

2. **Google Drive for Photos**
   - Teacher uploads test photos to her own Google Drive
   - App references photos via Drive API
   - No separate photo storage needed
   - She owns all her data

**Multi-Teacher Support:**
- Shared Google Drive approach (one Drive for the whole school)
- Folder structure separates each teacher's data
- Teachers access only their classes through the app
- School admin can access full Drive if needed

**Setup Process:**
1. Clone repository
2. Add Google API keys to `.env` file
3. Run `npm install && npm run dev`
4. Open browser to `localhost:3000`
5. Grant Google permissions (Sheets + Drive access)
6. Start using

**Key Benefits:**
- ✅ Zero hosting costs
- ✅ Zero deployment complexity
- ✅ Teacher controls all data
- ✅ Familiar data editing (Google Sheets = Excel)
- ✅ Works offline (after initial data load)
- ✅ No vendor lock-in
- ✅ Easy backup (copy the Sheet)

**Technical Stack:**
- Frontend: React + Vite
- Database: Google Sheets API
- Storage: Google Drive API
- Auth: Google OAuth 2.0
- No backend server required

**Scalability:**
- MVP: Single teacher, runs locally
- Future: Could deploy to web hosting if needed
- Current approach supports multiple teachers sharing one Drive

---

### Q5: Should students see their grades/feedback through the app?
**Category**: Users & Access
**Status**: ✅ Answered
**Answer**:

**Progressive Student Access Strategy:**

**MVP (v0.1) - Teacher Only:**
- ❌ NO student access to the app
- ✅ Teacher-only interface
- Teacher tells students their grades verbally (current workflow)
- Focus on making grading faster for teacher first

**V1 (Future - When Hosted) - Shareable Test Links:**
When the app is deployed to web hosting, teachers can generate shareable links for individual tests:
- ✅ **Share link per test** (no login required)
- Students click link and see:
  - 📸 Photos of their test pages
  - 🔴 Mistakes circled in red by AI
  - 💡 Suggestions for what to learn/review again
  - 📊 Final grade/score
- ✅ Simple, focused view (just that one test)
- ✅ No authentication needed (link-based access)
- ❌ No access to other tests or full history

**V2+ (Future-Future) - Full Student Portal:**
Eventually could build full student login system:
- Student accounts with authentication
- View all their tests over time
- Track progress across multiple tests
- See mistake patterns
- **NOT in scope for MVP or V1**

**Implication for MVP Development:**
- Build teacher-only UI first
- No student authentication system needed
- No student-facing pages in MVP
- Simpler, faster development
- Can add student features later when app is hosted

---

### Q6: What AI capabilities are most valuable?
**Category**: AI Functionality
**Status**: ⏸️ Not asked yet
**Answer**:

---

## Notes
- This document will be updated after each question is answered
- Answers will also be reflected in relevant documentation files
