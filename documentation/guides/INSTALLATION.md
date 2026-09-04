# ThinkStack — Installation Guide

Development environment setup and optional integrations (Judge0, Gemini AI Tutor, etc.).

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20 LTS or higher |
| npm | 10 or higher |
| Git | Latest |
| MongoDB | Atlas account or local MongoDB 6+ |

Optional for full functionality:

| Integration | Used for | Get started |
|-------------|----------|-------------|
| Judge0 (RapidAPI) | Playground + problem grading | [RapidAPI Judge0 CE](https://rapidapi.com/judge0-official/api/judge0-ce) |
| Google Gemini | AI Tutor chat | [Google AI Studio](https://aistudio.google.com/apikey) |
| Cloudinary | Media uploads (later milestones) | [cloudinary.com](https://cloudinary.com) |
| Resend | Password reset emails | [resend.com](https://resend.com) |

Without optional keys, **mock modes** work for Judge0 and Gemini in local development.

---

## 1. Clone & Install

```bash
git clone <repository-url>
cd ThinkStack
npm install
```

This installs dependencies for the root workspace, `frontend`, `backend`, and `shared` packages.

---

## 2. Environment Configuration

### Backend

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` — minimum for local dev:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/thinkstack
JWT_ACCESS_SECRET=your-dev-access-secret-min-32-chars
JWT_REFRESH_SECRET=your-dev-refresh-secret-min-32-chars
FRONTEND_URL=http://localhost:5173
```

For MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string.

#### Judge0 (playground + problems)

```env
JUDGE0_API_KEY=your-rapidapi-key
JUDGE0_API_HOST=judge0-ce.p.rapidapi.com
JUDGE0_MOCK=false
CODE_EXEC_RATE_LIMIT_PER_MIN=10
```

Leave `JUDGE0_API_KEY` empty and `JUDGE0_MOCK=true` for mock code execution locally.

#### Google Gemini (AI Tutor)

```env
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.0-flash
GEMINI_MOCK=false
AI_RATE_LIMIT_PER_HOUR=20
```

Leave `GEMINI_API_KEY` empty and `GEMINI_MOCK=true` for mock AI responses locally.

Full AI Tutor setup: [AI_TUTOR.md](./AI_TUTOR.md)

### Frontend

```bash
cp frontend/.env.example frontend/.env
```

Default values work for local development:

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_NAME=ThinkStack
```

The Gemini API key is **never** set on the frontend — all AI calls go through the backend proxy.

---

## 3. Run Development Servers

From the project root:

```bash
npm run dev
```

This starts:

- **Frontend** → http://localhost:5173
- **Backend** → http://localhost:5000

Run individually:

```bash
npm run dev:frontend
npm run dev:backend
```

---

## 4. Verify Installation

| Check | URL / Command | Expected |
|-------|---------------|----------|
| Frontend | http://localhost:5173 | Landing page loads |
| Backend health | http://localhost:5000/api/v1/health | `{ "success": true, "data": { "status": "ok" } }` |
| Lint | `npm run lint` | No errors |
| Build | `npm run build` | Frontend builds to `frontend/dist/` |
| Tests | `npm run test` | 83+ tests pass (requires local MongoDB) |
| Seed | `npm run seed` | Populates topics, problems, quizzes, badges |
| AI Tutor | http://localhost:5173/ai-tutor (logged in) | Chat UI; mock or real replies |

---

## 5. Seed the Database

Ensure MongoDB is running, then:

```bash
npm run seed
```

This creates:

- Admin user (`admin@thinkstack.dev` / `ChangeMe123!` by default)
- 22 DSA topics with full content structure
- 55 coding problems
- 22 quizzes (one per topic)
- 30 badge definitions
- 7 daily challenges

To reset and re-seed:

```bash
npm run seed:fresh
```

---

## 6. Project Structure

```
ThinkStack/
├── frontend/          React + Vite + Tailwind
│   └── src/
│       ├── app/       Store, router, providers
│       ├── features/  auth, learning, playground, problems, quizzes, ai-tutor, ...
│       ├── components/ Shared UI
│       ├── pages/     Route pages
│       ├── services/  API client (Axios)
│       └── styles/    Tailwind + design tokens
├── backend/           Express API
│   └── src/
│       ├── config/    env, db, cors
│       ├── services/  Auth, Learning, Judge0, Gemini, AITutor, ...
│       ├── routes/
│       └── utils/
├── shared/            Shared constants & types
├── documentation/
└── scripts/
```

---

## 7. Troubleshooting

### Port already in use

Change `PORT` in `backend/.env` or Vite port in `frontend/vite.config.js`.

### MongoDB connection failed

- Ensure MongoDB is running locally, or
- Verify Atlas connection string and IP whitelist (allow `0.0.0.0/0` for dev)
- Tests skip DB-dependent suites if MongoDB is unavailable (`SKIP_DB_TESTS=true`)

### CORS errors

Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL exactly.

### Mock AI / mock code execution

Expected when optional API keys are not set. Configure `GEMINI_API_KEY` or `JUDGE0_API_KEY` and set the corresponding `*_MOCK=false` flag.

### Module not found after install

```bash
rm -rf node_modules frontend/node_modules backend/node_modules
npm install
```

---

## Next Steps

- **AI Tutor:** [AI_TUTOR.md](./AI_TUTOR.md)
- **Roadmap:** [ROADMAP.md](../planning/ROADMAP.md) — next milestone: M14 Leaderboards
