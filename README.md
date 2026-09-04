# ThinkStack

**Interactive Data Structures & Algorithms Learning Platform**

ThinkStack unifies structured learning, interactive algorithm visualizations, coding practice, quizzes, AI tutoring, and gamification into one production-ready educational platform — built for Final Year University Project standards and professional portfolio deployment.

---

## Features

| Module | Description |
|--------|-------------|
| **Learning** | 22+ DSA topics with theory, examples, complexity analysis, and interview prep |
| **Visualizer** | Step-through animations for sorting, searching, trees, and graph algorithms |
| **Playground** | Multi-language code editor with Judge0 execution |
| **Problems** | LeetCode-style challenges with automated grading |
| **Quizzes** | Topic assessments with instant feedback |
| **AI Tutor** | Google Gemini-powered concept explanation and code review |
| **Notes** | Personal Markdown notes linked to topics and problems |
| **Progress** | Activity charts, time tracking, and weak area detection |
| **Gamification** | XP, levels, badges, coins, streaks, daily challenges |
| **Leaderboards** | Global and weekly XP rankings with personal rank |
| **Contests** | Timed competitive programming events |
| **Admin** | Content management, analytics, and user administration |
| **Notifications** | In-app notification center with achievement, contest, announcement, and streak alerts |
| **Search** | Global search across topics, problems, and personal notes with autocomplete |
| **Settings** | Theme, editor preferences, profile, password, and account deletion |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, Tailwind CSS, Redux Toolkit, React Router |
| Backend | Node.js, Express.js, Mongoose |
| Database | MongoDB Atlas |
| Auth | JWT + Refresh Tokens, bcrypt, RBAC |
| Deployment | Vercel (FE), Render (BE) |
| Integrations | Judge0, Google Gemini, Cloudinary, Resend |

---

## Project Structure

```
ThinkStack/
├── frontend/          # React + Vite application
├── backend/           # Express REST API
├── shared/            # Shared types, constants, algorithm engines
├── documentation/     # SRS, architecture, diagrams, guides
├── scripts/           # Seed, deploy, utility scripts
└── assets/            # Static brand assets, images
```

---

## Documentation

| Document | Path |
|----------|------|
| Software Requirements Specification | [documentation/planning/SRS.md](documentation/planning/SRS.md) |
| System Architecture | [documentation/planning/ARCHITECTURE.md](documentation/planning/ARCHITECTURE.md) |
| Database Design | [documentation/planning/DATABASE_DESIGN.md](documentation/planning/DATABASE_DESIGN.md) |
| Milestone Roadmap | [documentation/planning/ROADMAP.md](documentation/planning/ROADMAP.md) |
| User Stories | [documentation/planning/USER_STORIES.md](documentation/planning/USER_STORIES.md) |
| Personas | [documentation/planning/PERSONAS.md](documentation/planning/PERSONAS.md) |
| Use Cases | [documentation/planning/USE_CASES.md](documentation/planning/USE_CASES.md) |
| Project Scope | [documentation/planning/PROJECT_SCOPE.md](documentation/planning/PROJECT_SCOPE.md) |
| Diagrams | [documentation/diagrams/](documentation/diagrams/) |
| Installation Guide | [documentation/guides/INSTALLATION.md](documentation/guides/INSTALLATION.md) |
| Deployment Guide | [documentation/guides/DEPLOYMENT.md](documentation/guides/DEPLOYMENT.md) |
| API Documentation | [documentation/guides/API_DOCUMENTATION.md](documentation/guides/API_DOCUMENTATION.md) |
| AI Tutor Setup | [documentation/guides/AI_TUTOR.md](documentation/guides/AI_TUTOR.md) |
| OpenAPI Spec | [documentation/openapi.yaml](documentation/openapi.yaml) |

---

## Development Status

| Milestone | Status |
|-----------|--------|
| M0 — Planning & Documentation | ✅ Complete |
| M1 — Project Setup | ✅ Complete |
| M2 — Database Schema | ✅ Complete |
| M3 — Authentication | ✅ Complete |
| M4 — User Dashboard | ✅ Complete |
| M5 — Learning Module | ✅ Complete |
| M6 — DSA Visualizer | ✅ Complete |
| M7 — Code Playground | ✅ Complete |
| M8 — Coding Problems | ✅ Complete |
| M9 — Quiz System | ✅ Complete |
| M10 — AI Tutor | ✅ Complete |
| M11 — Notes | ✅ Complete |
| M12 — Progress Tracking | ✅ Complete |
| M13 — Gamification | ✅ Complete |
| M14 — Leaderboards | ✅ Complete |
| M15 — Contest System | ✅ Complete |
| M16 — Admin Dashboard | ✅ Complete |
| M17 — Notifications | ✅ Complete |
| M18 — Search | ✅ Complete |
| M19 — Settings | ✅ Complete |
| M20 — Deployment & QA | ✅ Complete |

**Status:** v1.0 — all milestones complete.

---

## Getting Started

See the full [Installation Guide](documentation/guides/INSTALLATION.md).

```bash
git clone <repository-url>
cd ThinkStack
npm install

# Configure environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start both servers
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api/v1/health

### Environment variables (backend)

Copy `backend/.env.example` → `backend/.env`. Key optional integrations:

| Variable | Purpose |
|----------|---------|
| `JUDGE0_API_KEY` | Real code execution (playground + problems) |
| `JUDGE0_MOCK` | `true` = mock execution without Judge0 |
| `GEMINI_API_KEY` | Real AI Tutor responses ([get key](https://aistudio.google.com/apikey)) |
| `GEMINI_MODEL` | Default: `gemini-2.0-flash` |
| `GEMINI_MOCK` | `true` = mock AI without Gemini |
| `AI_RATE_LIMIT_PER_HOUR` | Chat messages per user per hour (default: 20) |

See [AI Tutor Setup](documentation/guides/AI_TUTOR.md) and [Installation Guide](documentation/guides/INSTALLATION.md) for full details.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend + backend concurrently |
| `npm run dev:frontend` | Frontend only (Vite) |
| `npm run dev:backend` | Backend only (Express) |
| `npm run build` | Production build (frontend) |
| `npm run lint` | ESLint both packages |
| `npm run test` | Backend tests |
| `npm run smoke` | Production smoke test (set `API_URL`) |

---

## License

MIT — See [LICENSE](LICENSE) (to be added).

---

## Authors

ThinkStack — Final Year University Project
