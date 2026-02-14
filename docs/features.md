# grAIde Features

## Overview
grAIde is an AI-powered grading assistant for teachers, with initial focus on mathematics education.

## Target Use Case

**Grade Level:** Grades 5-8 (middle school, ages 10-14)
**Subject:** Full range of middle school mathematics
  - Arithmetic (operations, fractions, decimals)
  - Algebra (equations, variables, expressions)
  - Geometry (shapes, area, perimeter, angles, theorems)
  - Word problems across all topics

**Test Characteristics:**
- 3-10 open-ended problems per test (NOT multiple choice)
- Multi-step problem solving required
- **Multi-page submissions:**
  - Main test page (A4) with questions
  - Additional scratch paper for calculations and drawings
- **Mixed answer formats:**
  - Short answers written on test page
  - Extended work requiring separate pages
  - Geometric diagrams and visual elements

**Key Challenge:** AI must handle diverse problem types and multi-page, multi-format student work

## Problem Context
**Current Pain Points:**
- 60-90 papers to grade per weekend
- 3-5 minutes per paper = 4-6 hours of continuous work
- Fatigue leads to grading mistakes
- No systematic tracking of grades and student mistakes
- Difficult to identify patterns (class-wide or student-specific)
- Physical burden of carrying 100+ papers
- Handwriting legibility issues slow down grading

**Primary Goal:** Dramatically reduce grading time while improving accuracy and insight

## Current Workflow (Manual Grading)

**Today's Process:**
1. ✋ Pick up paper from stack (60-90 papers)
2. 👁️ Identify student name
3. 📄 Read each problem and answer
4. ⭕ Circle in red/green (correct/incorrect)
5. ✏️ Assign points per question
6. ➕ Manually add up total score
7. 🔍 Identify & mark specific errors:
   - Wrong formulas
   - Math operation mistakes
   - Typos causing wrong results
8. 🧠 **Remember** each student's mistakes for future guidance (mental load!)
9. 📋 *Sometimes* enter grades in online gradebook (optional)
10. 💬 Must be able to tell each student their grade and guide them on mistakes

**Critical Insight:** The teacher needs to retain knowledge of 60-90 students × multiple errors each = hundreds of data points in memory to provide effective guidance later.

## grAIde Workflow (AI-Assisted Grading)

**Tomorrow's Process:**
1. 📸 Photo upload batch of papers (replaces carrying papers home)
2. 🤖 AI identifies student names automatically
3. 🤖 AI reads answers (handles handwriting)
4. 🤖 AI evaluates correctness against answer key
5. 🤖 AI assigns points automatically
6. 🤖 Auto-calculates total score
7. 🤖 AI identifies specific error types:
   - Formula errors
   - Computation mistakes
   - Classification of mistake patterns
8. 💾 **Automatic storage** of all grades & mistakes (zero mental load!)
9. ✅ Teacher reviews AI suggestions, makes adjustments if needed
10. 📊 System provides mistake patterns & insights automatically
11. 💬 Teacher can instantly access any student's performance data

**Transformation:** From 60-90 manual reviews taking 4-6 hours → Quick review and adjustment of AI work taking 1-2 hours

---

## MVP Features (Priority Order)

### 1. Paper Digitization & OCR (Critical for Speed)
**Goal:** Eliminate physical paper burden and enable digital grading
- [ ] Mobile/web photo upload of test papers
- [ ] **Multi-page handling per student**:
  - [ ] Upload main test page + multiple scratch/work pages
  - [ ] Associate all pages with correct student
  - [ ] Navigate between pages during review
- [ ] Batch upload (multiple students at once)
- [ ] OCR for handwritten math:
  - [ ] Numbers, equations, expressions
  - [ ] Mathematical symbols (+, -, ×, ÷, =, etc.)
  - [ ] Fractions, exponents, roots
- [ ] **Visual element processing**:
  - [ ] Geometric diagrams and drawings
  - [ ] Graphs and charts
  - [ ] Image-to-understanding for visual answers
- [ ] Student name recognition on papers
- [ ] Paper organization by test/class

**Impact:** Reduces time carrying papers, enables grading anywhere, handles real-world test complexity

### 2. AI-Powered Grading (Critical for Speed)
**Goal:** Cut grading time from 3-5 min to under 1 min per paper
- [ ] Define answer key with expected answers per question
- [ ] **AI evaluates diverse problem types**:
  - [ ] Arithmetic calculations
  - [ ] Algebraic solutions
  - [ ] Geometric problems (including visual verification)
  - [ ] Word problems
- [ ] **Evaluate work process, not just final answer**:
  - [ ] Review step-by-step calculations
  - [ ] Identify where in the process errors occurred
  - [ ] Verify correct formulas were used
- [ ] Automatic point assignment
- [ ] Suggest partial credit decisions (correct method, calculation error)
- [ ] Handle multiple valid solution approaches

**Impact:** Saves 2-4 minutes per paper = 3-4 hours per weekend

### 3. Automatic Grade & Mistake Tracking (Critical for Accuracy)
**Goal:** Eliminate re-grading and manual tracking, offload mental burden
- [ ] Automatic grade book updates
- [ ] Record which questions each student got wrong
- [ ] Identify and classify mistake types:
  - [ ] Incorrect formulas used
  - [ ] Basic math operation errors (addition, subtraction, multiplication, division)
  - [ ] Typos/transcription errors leading to wrong results
  - [ ] Conceptual misunderstandings
- [ ] Store all mistake data per student per test
- [ ] Store historical data for trend analysis
- [ ] Enable quick lookup: "What mistakes did Student X make on Test Y?"

**Impact:** No more revisiting papers, eliminates tracking errors, removes mental burden of remembering 60-90 students' specific errors

### 4. Pattern Recognition & Analytics (High Value)
**Goal:** Surface insights that are impossible to spot manually
- [ ] Identify most commonly missed questions (class-wide)
- [ ] Detect recurring mistake patterns per student
- [ ] Flag students struggling with specific concepts
- [ ] Compare performance across tests over time

**Impact:** Enables targeted teaching interventions

### 5. Teacher Review & Adjustment Interface (Critical for Trust)
**Goal:** Keep teacher in control, enable quick AI result verification
- [ ] Side-by-side view: original answer vs AI evaluation
- [ ] Easy override of AI grading decisions
- [ ] Quick partial credit adjustments
- [ ] Batch approval for confident AI results
- [ ] Flag uncertain answers for manual review
- [ ] Add/edit teacher comments per question or paper

**Impact:** Maintains teacher authority while benefiting from AI speed

### 6. Basic Student & Test Management (Foundation)
**Goal:** Support the grading workflow
- [ ] Create class rosters
- [ ] Organize tests by date/topic
- [ ] Basic test configuration (questions, points)
- [ ] Simple navigation between papers

**Impact:** Enables all other features

## Future Features
- [ ] Test generation with AI
- [ ] Multi-subject support
- [ ] Parent/student portal
- [ ] Integration with LMS platforms

## Notes
This document will be updated as we define the specific features and priorities.
