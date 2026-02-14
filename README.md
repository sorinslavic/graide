# grAIde

AI-powered grading assistant for teachers.

## About

grAIde combines **grading** with **AI** to help teachers save time and provide better feedback to students. Initially focused on mathematics education for Romanian middle school (grades 5-8), grAIde aims to automate repetitive grading tasks while keeping teachers in control.

### Key Features (Planned)
- 📸 **Photo Upload**: Upload test photos to Google Drive
- 🤖 **AI Grading**: Automatic grading using AI vision models
- 📊 **Pattern Detection**: Identify common mistakes across students
- 📈 **Student Tracking**: Track individual student progress over time
- 📝 **Google Sheets Integration**: Edit data directly in familiar spreadsheet interface

### Tech Stack
- **Frontend**: React + Vite (runs on localhost)
- **Database**: Google Sheets API (zero hosting costs)
- **Storage**: Google Drive API (teacher's own Drive)
- **AI**: OpenAI Vision API (for grading)
- **Deployment**: Local-first (no backend server needed)

## Status

**Current Phase**: Specification & Design
- ✅ Requirements gathering complete
- ✅ Architecture designed (Google Sheets + Drive)
- 🔄 Building specification (4/6 questions answered)
- ⏳ Development starts soon

## Quick Start

_(Coming soon - app in development)_

Once ready, running grAIde will be as simple as:

```bash
# 1. Clone the repository
git clone https://github.com/sorinslavic/graide.git
cd graide

# 2. Install dependencies
npm install

# 3. Add your Google API credentials
# Create .env file with your Google API keys

# 4. Start the app
npm run dev

# 5. Open browser
# Visit http://localhost:3000
```

**Requirements:**
- Node.js 18+
- Google account
- Google API credentials (Sheets + Drive access)

## Documentation

- [Project Overview](./docs/project-overview.md) - Vision, goals, and key principles
- [Specification Q&A](./docs/spec-qa.md) - Product specification questions and answers
- [Data Model](./docs/data-model.md) - Database schema and architecture diagrams
- [Features](./docs/features.md) - Feature roadmap and requirements
- [Architecture](./docs/architecture.md) - Technical architecture and tech stack
- [Development Guide](./docs/development.md) - Setup, workflow, and contribution guidelines

## Quick Links

- Repository: https://github.com/sorinslavic/graide
- Documentation: [/docs](./docs)

## License

TBD
