# grAIde - Project Overview

## Vision
grAIde is an AI-powered grading assistant designed to help teachers (initially focused on math teachers) save time and provide better feedback to students.

The name combines:
- **Grade** - the core function of evaluating student work
- **AI** - artificial intelligence assistance
- Pronounced like "grayed"

## Problem Statement
**The Reality:** A math teacher grading 60-90 test papers every weekend, spending 3-5 minutes per paper, results in 4-6 hours of continuous grading work.

**The Impact:**
- **Time burden**: Hours of weekend work that could be spent on lesson planning or family time
- **Physical burden**: Carrying 100+ papers between school and home
- **Mental fatigue**: Long grading sessions lead to mistakes and inconsistent scoring
- **Lost insights**: No systematic way to track mistakes or identify patterns across students
- **Repeat work**: Having to revisit papers because grades and mistakes weren't properly recorded
- **Legibility challenges**: Messy handwriting slows down the entire process

**The Cost:** Not just time, but the opportunity to truly understand how each student is learning

## Solution
grAIde transforms grading from a 4-6 hour weekend burden into a streamlined process:

1. **Digitize**: Photo-based upload eliminates carrying papers home
2. **AI-Grade**: Reduce grading time from 3-5 minutes to under 1 minute per paper
3. **Auto-Track**: Automatically record grades and mistakes - no more revisiting papers
4. **Extract Patterns**: Surface insights impossible to spot manually:
   - Which questions trip up the most students?
   - What mistakes does each student repeat over time?
   - Which concepts need re-teaching?

**The Promise**: Cut grading time by 60-80% while gaining insights that make teaching more effective

## Target Users
- **Primary**: Math teachers teaching grades 5-8 (Romanian middle school, ages 10-14)
- **Initial Subjects**: Full range of middle school mathematics (arithmetic, algebra, geometry, word problems)
- **Future Expansion**:
  - Other grade levels (K-4, 9-12)
  - Other subjects (language, history, geography, science)
  - International markets beyond Romania

## Initial Use Case
Built with input from a real math teacher to solve real classroom challenges.

## Key Principles
1. **Teacher-centric**: Built for teachers, by understanding their workflow
2. **Privacy-first**: Student data security is paramount
3. **AI-augmented, not AI-replaced**: Teachers remain in control
4. **Simple to use**: Minimal learning curve
5. **Cost-effective**: Accessible pricing for individual teachers and schools

## Success Metrics
**Primary Metric:**
- **Time per paper**: Reduce from 3-5 minutes to under 1 minute (60-80% reduction)
- **Weekly time saved**: 3-4 hours per weekend

**Secondary Metrics:**
- **Grading accuracy**: Fewer mistakes due to fatigue elimination
- **Pattern identification**: Number of actionable insights surfaced per test
- **Teacher satisfaction**: Weekly grading stress reduction
- **Adoption**: Teacher willingness to use for every test

**Aspirational Goals:**
- Student performance improvement through targeted interventions
- Time reallocated to lesson planning or student interaction

## Project Status
**Phase**: Foundation Development (Milestone 0 Complete)

**Completed:**
- ✅ Problem definition and user research
- ✅ Feature requirements gathered
- ✅ Technology stack decided (React + Vite + Google Sheets/Drive + Gemini)
- ✅ Architecture designed (local-first, zero-cost approach)
- ✅ Complete specification (6/6 questions answered)
- ✅ Data model defined (Google Sheets schema)
- ✅ UI design reference analyzed (Lovable mock reviewed and documented)
- ✅ **Milestone 0**: Project scaffold complete
  - React + Vite + TypeScript setup
  - Complete type system (sheets, grading, drive)
  - Service layer interfaces (Auth, Sheets, Drive, AI)
  - 7 page placeholders with routing
  - Tailwind CSS + shadcn/ui components
  - 917 lines of TypeScript, builds successfully

**Next Steps:**
- 🚧 **Milestone 1**: Auth + Google APIs implementation
  - Google OAuth login
  - Google Sheets service (CRUD for all 7 sheets)
  - Google Drive service (file operations)
  - Class & Student management UI

## Documentation
- [Specification Q&A](./spec-qa.md) - Questions and answers defining the product (6/6 complete)
- [Data Model](./data-model.md) - Database schema and architecture diagrams
- [Features](./features.md) - Feature roadmap and requirements
- [Architecture](./architecture.md) - Technical architecture and tech stack
- [Development](./development.md) - Development setup and guidelines
- [Scaffold Summary](../SCAFFOLD.md) - Milestone 0 completion details
- [Claude Context](../claude.md) - Quick context for Claude Code AI

## Team
- Initial development: Building for real teacher needs
- Open to contributors (future)

## License
TBD
