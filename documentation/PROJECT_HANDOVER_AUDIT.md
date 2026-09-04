# THINKSTACK — COMPLETE PROJECT HANDOVER & AUDIT REPORT

**Audit date:** 2026-09-04
**Auditor:** Claude (Sonnet 5), fresh session, zero prior context on this codebase
**Method:** Static code inventory (2 parallel deep-read agents covering 100% of `backend/src` and `frontend/src`) + live execution testing (real MongoDB, real HTTP requests against a running backend/frontend, Jest suite, ESLint, production build) — not a read-only guess. Every claim below is either a direct code citation or an observed test result; the two are labeled separately.

---

## 1. Executive Summary

ThinkStack is a genuinely substantial, largely-complete MERN DSA learning platform, not a shell or demo. The backend (17 route groups, 26 Mongoose models, layered routes→controllers→services→repositories architecture) is well-structured and the frontend (29 pages, 21 feature modules) mirrors it cleanly. This is materially better condition than "assume nothing works" audits usually find:

- **193/193 backend Jest tests pass** against a real local MongoDB (no mocked DB layer).
- Both ESLint configs (frontend + backend) are **clean** — zero errors, only minor unused-var/fast-refresh warnings.
- **Production frontend build succeeds** (`vite build`), with two chunks flagged oversized (perf debt, not a bug).
- **Register → Login → Logout → Login again** was tested through 3+ full cycles live against the running server: it worked correctly every time. **The previously-reported "Invalid email or password after logout" bug could not be reproduced** and no code path explains how it could occur (see §10, §25 Bug BUG-01... actually not found as a bug — documented explicitly as "checked, not reproduced").
- Data persistence verified for real: created a note, restarted the entire backend Node process, logged in again — the note (and its edit) survived, proving real MongoDB persistence rather than in-memory/mock state.
- Full gamification pipeline verified end-to-end live: passing a quiz awarded XP, a badge, and coins, all visible immediately in the DB-backed dashboard/leaderboard.
- RBAC (student vs admin), IDOR protection (cross-user note access blocked), and the refresh-token rotation flow all verified correct via live requests.
- **One real, reproducible bug found and confirmed**: `JUDGE0_MOCK=true` / setting mock flags alone does **not** enable the documented "simulated code execution without a real API key" dev experience — see Bug §25 BUG-01. This affects Problems, Playground, and Contests code execution, and by identical code pattern, the AI Tutor's Gemini mock path.
- The Linear Search / visualizer "stale state" bug the brief asked me to specifically hunt for was **investigated in depth and not found** — the `useCallback`/`useEffect` dependency chain is correct. This is reported as a verified negative, not skipped.

**Overall verdict**: this is a well-engineered, largely production-shaped codebase suitable to continue building on directly. The main real gaps are: two third-party integrations (Judge0, Gemini) unconfigured with a doc/behavior mismatch in dev, no browser-driven UI testing was possible in this audit (no browser automation tool was available to this session — see §26 Known Limitations), and normal pre-launch polish items (bundle size, a few unused-var lint warnings).

---

## 2. Project Purpose

From `README.md` and `documentation/planning/*`: ThinkStack is a "Final Year University Project"-grade, portfolio-quality DSA learning platform unifying structured learning content, interactive algorithm visualizers, a code playground, LeetCode-style problems, quizzes, an AI tutor, notes, progress analytics, gamification (XP/levels/badges/coins/streaks), leaderboards, timed contests, and an admin CMS — for students studying data structures & algorithms.

---

## 3. Technology Stack (verified from actual `package.json` files, not assumed)

| Layer | Technology | Version (from lockfiles) |
|---|---|---|
| Frontend | React | 19.0.0 |
| | Vite | 6.2.3 (running instance reported 6.4.3) |
| | Redux Toolkit | 2.6.1 |
| | React Router | 7.4.0 |
| | Tailwind CSS | 3.4.17 |
| | Monaco Editor (`@monaco-editor/react`) | 4.7.0 |
| | Chart.js / react-chartjs-2 | 4.4.8 / 5.3.0 |
| | ReactFlow | 11.11.4 (tree/graph visualizer rendering) |
| | Framer Motion | 12.6.2 |
| | Axios | 1.8.4 |
| Backend | Node.js | engines require ≥20 (running on v22.17.0) |
| | Express | 4.21.2 |
| | Mongoose | 8.13.0 |
| | jsonwebtoken | 9.0.2 |
| | bcryptjs | 3.0.2 |
| | express-rate-limit / express-mongo-sanitize / helmet | 7.5.0 / 2.2.0 / 8.1.0 |
| | winston (logging), morgan (HTTP logs) | 3.17.0 / 1.10.0 |
| Database | MongoDB | local install found at `C:\Program Files\MongoDB\Server\8.2`, running as a Windows service; connects to `mongodb://localhost:27017/thinkstack` in dev. Production is designed for MongoDB Atlas (`backend/.env.example`). |
| Test | Jest 29 + Supertest 7 | real integration tests against a real (non-mocked) MongoDB test database |
| Monorepo | npm workspaces (`frontend`, `backend`, `shared`) | root `package.json` orchestrates via `concurrently` |

`shared/` is a genuine shared package (`shared/package.json`, aliased in both `vite.config.js` and presumably backend imports) exporting `algorithms`, `constants`, `types`, `tracing` — used by **both** the frontend visualizer and the backend seed generator, so algorithm implementations are not duplicated.

---

## 4. How to Run the Project (verified by actually doing it)

```bash
# from repo root — dependencies were already installed (hoisted to root node_modules)
npm run dev            # concurrently starts frontend (Vite, :5173) + backend (nodemon, :5000)
# or separately:
npm run dev:backend    # nodemon src/server.js, backend/package.json "predev" runs a free-port check on 5000
npm run dev:frontend   # vite, serves :5173, proxies /api/* to :5000 (frontend/vite.config.js)
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api/v1 — health at `/api/v1/health`
- MongoDB must be running locally (Windows service `MongoDB` was already running throughout this audit) or `MONGODB_URI` pointed at Atlas.
- On every backend start (`BOOTSTRAP_ON_START=true` by default), the server auto-seeds/upserts an admin user, a demo student user, ~500 curriculum topics, 300 generated problems, 57 badges, 50 certificates, 30 contests, daily challenges, and one welcome announcement (see §15 Seed Data). This is idempotent (`$setOnInsert`) so it does not clobber real user data on restart — **verified live**: restarting the backend mid-audit did not lose or duplicate the test note/announcement/quiz-attempt created moments earlier.
- `npm run build -w frontend` — **succeeds**, ~20s, outputs to `frontend/dist`.
- `npm run test -w backend` — **193/193 tests pass** in ~140s (see §23).
- `npm run lint` (both packages) — **0 errors**, minor warnings only (see §23).
- `npm run smoke` (`scripts/smoke-test.mjs`) — **7/7 checks pass** against the local dev instance (health, register, access-token issuance, `/auth/me`, `/auth/refresh`, authenticated `/topics`, frontend reachability).

**Operational note discovered during the audit**: at the start of this session, a backend and frontend dev server were already running (started outside this session, ports 5000/5173 already bound, with an established browser connection to :5173). Partway through testing, that pre-existing backend process was found to have stopped unexpectedly (its log showed `nodemon` had received a hard kill and logged `app crashed`). This was traced to an admin PowerShell `Stop-Process` command issued *by this audit* against a stale PID captured from an earlier `netstat` snapshot — i.e. **this audit killed it**, not a spontaneous crash. It was restarted cleanly with `npm run dev:backend` and ran without issue for the remainder of the session. Flagging this only so the next session doesn't misread it as an unexplained instability — no code defect was involved.

---

## 5. Environment Variables Required

From `backend/.env.example` / `frontend/.env.example` / actual `.env` files inspected (secrets not reproduced — dev defaults only, all clearly non-production placeholder values):

**Backend** (`backend/.env`):
| Variable | Required? | Notes |
|---|---|---|
| `NODE_ENV`, `PORT` | Yes | `development`, `5000` in dev |
| `MONGODB_URI` | Yes | local `mongodb://localhost:27017/thinkstack` in dev; Atlas URI in prod |
| `TEST_MONGODB_URI` | For `npm test` | separate DB (`thinkstack_test`), auto-dropped each test run — **never point this at the dev DB** |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | **Required in production** (`config/env.js` throws at boot if missing when `NODE_ENV=production`); dev has insecure hardcoded fallbacks — see Security §19 |
| `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | No | defaults `15m` / `7d` |
| `FRONTEND_URL` | Yes (CORS) | `http://localhost:5173` in dev |
| `JUDGE0_API_KEY`, `JUDGE0_API_URL`, `JUDGE0_API_HOST`, `JUDGE0_MOCK` | No (optional integration) | empty key = "Coming Soon" UI regardless of `JUDGE0_MOCK` — see Bug BUG-01 |
| `GEMINI_API_KEY`, `GEMINI_MODEL`, `GEMINI_MOCK` | No (optional) | same caveat as Judge0 |
| `CLOUDINARY_*` | No | avatar uploads; unset in dev, feature effectively disabled without it |
| `RESEND_API_KEY`, `EMAIL_FROM` | No | password-reset email; if unset, reset link is only logged server-side (dev convenience, see §19) |
| `ADMIN_EMAIL/USERNAME/PASSWORD` | No | defaults `admin@thinkstack.dev` / `admin` / `ChangeMe123!` — auto-provisioned admin on every boot |
| `DEMO_EMAIL/USERNAME/PASSWORD` | No (dev only) | `student@thinkstack.dev` / `student` / `Student123!`; **skipped entirely when `NODE_ENV=production`** |
| `BOOTSTRAP_ON_START` | No | default `true`; set `false` to skip auto-seed on boot |
| `AI_RATE_LIMIT_PER_HOUR`, `CODE_EXEC_RATE_LIMIT_PER_MIN` | No | defaults 20/hr, 10/min |

**Frontend** (`frontend/.env`):
| Variable | Notes |
|---|---|
| `VITE_API_URL` | `/api/v1` in dev (relies on Vite proxy for cookies to work); full absolute URL in prod |
| `VITE_APP_NAME` | display name |
| `VITE_CLOUDINARY_CLOUD_NAME` / `VITE_CLOUDINARY_UPLOAD_PRESET` | avatar upload widget config |

---

## 6–9. Application / Frontend / Backend / Database Architecture

### 6. High-level architecture
Classic MERN SPA + REST API. Frontend is a Vite-built React SPA (client-side routed) talking to an Express REST API under `/api/v1`, backed by MongoDB. In dev, Vite proxies `/api` to the Express server on :5000 so that the httpOnly refresh-token cookie is same-origin (critical — see §10). In production the frontend (Vercel) and backend (Render) are cross-origin, and CORS/cookie `sameSite` settings switch accordingly (`config/cors.js`, `config/env.js` — verified by reading, not deployed/tested here).

### 7. Frontend architecture
- **Entry**: `frontend/src/main.jsx` → `app/providers.jsx` (`<Provider store>` → `<AuthInitializer>` → `<AppRouter/>`).
- **Routing**: `app/router.jsx`, `react-router-dom` v7 `BrowserRouter`. ~29 routes; only 5 are eagerly imported (Landing, Dashboard, Learn, NotFound, + auth pages), everything else is `React.lazy` + `Suspense`. Full route table in Appendix A.
- **State management**: Redux Toolkit store (`app/store.js`) registers **only two slices** — `auth` and `theme`. Every other feature (dashboard, problems, quizzes, contests, admin, notes, etc.) uses local component/hook state (`useXxx.js` pattern) that calls a `xxxService.js` wrapping the shared Axios instance. This is a deliberate, consistent architectural convention across the whole app, not an oversight — **do not "fix" this by converting features to Redux slices** unless the user explicitly asks; it would be a large, risky, unrequested refactor of a working pattern.
- **API layer**: `frontend/src/services/api.js` — a single well-built Axios instance. Access token lives in a **module-level JS variable** (not localStorage — deliberate XSS mitigation). Refresh-token cookie is httpOnly and sent via `withCredentials: true`. The 401-response interceptor implements a correct single-flight refresh queue (concurrent 401s all wait on one `/auth/refresh` call, then retry). `localStorage`/`sessionStorage` usage is limited to: a theme preference, a "has a session, worth trying silent refresh on boot" hint (`thinkstack-has-session`, no token stored), an explicit-logout flag, and short-lived autosave/draft caches (notes, quiz-in-progress, playground editor) that always get superseded by a real API save — **no feature was found to be silently local-only when it should be DB-backed**.
- **Styling/design system**: Tailwind (`darkMode:'class'`), a custom `brand` indigo-based palette + `surface` tokens, a large `@layer components` set of reusable classes in `frontend/src/styles/index.css` (`.btn-*`, `.card-*`, `.stat-*`, `.badge`, `.glass*`, `.data-table*`, `.empty-state*`, `.skeleton`, etc.) plus a small set of reusable React components in `components/ui/` (`Button`, `Card`+subcomponents, `ComingSoonPlaceholder`). This is a real, consistent design system — **reuse these classes/components for any new UI**, don't invent parallel ones.

### 8. Backend architecture
Layered: `routes/` → `controllers/` (thin — parse req, call exactly one service, `sendSuccess`) → `services/` (business logic) → `repositories/` (one per model, Mongoose query encapsulation) → `models/`. This is consistently applied across all 17 route groups. `middleware/`, `validators/` (express-validator schemas per route group), `utils/` (AppError, asyncHandler, apiResponse, gamification math, contest scoring, code-execution verdict mapping, CSV export, admin audit logging), `config/` (env, db, cors), `seed/` (bootstrap + curriculum/problem/badge generators).

Full route inventory, model inventory, and relationship map: **Appendix A / Appendix B**.

### 9. Database architecture
26 Mongoose models. Root entity is `User`; almost everything else hangs off `userId`. Key relationship spine:
```
User ─┬─< RefreshToken (session/device tracking, revocable)
      ├─< UserProgress >─ Topic ─┬─< Topic (self-refs: prerequisites/related/suggested/navigation)
      │                          ├── Quiz (1:1 via Topic.quizId) ─< QuizAttempt >─ User
      │                          └─< Problem (Topic.relatedProblems)
      ├─< Submission >─ Problem, Contest
      ├─< Note >─ Topic, Problem
      ├─< PlaygroundSnippet, AITutorConversation, SearchHistory, Notification
      ├─< Bookmark (polymorphic → Topic|Problem|Quiz)
      ├─< UserBadge >─ Badge
      ├─< DailyChallengeCompletion >─ DailyChallenge
      ├─< ContestParticipant >─ Contest ─< ContestSubmission >─ Problem, Submission
      └─< AuditLog (as adminId, records every admin mutation)
PlatformSettings — singleton config doc, no relations.
```
Full field-level schema for all 26 models is in **Appendix B** (from the backend inventory agent — verified against actual model source files).

---

## 10. Authentication & Authorization — TESTED LIVE, not inferred

### How it actually works (from code + confirmed by live traffic)
- **Access token**: JWT, HS256, 15 min default, sent as `Authorization: Bearer <token>`, kept client-side only in a JS variable (never localStorage).
- **Refresh token**: JWT, 7 days default, delivered **only** as an httpOnly cookie (`refreshToken`, path `/api/v1`; `secure`+`sameSite:none` in prod, `sameSite:lax` in dev). It is *also* HMAC-hashed and persisted server-side in the `RefreshToken` collection (TTL-indexed) — meaning refresh tokens are **stateful/revocable**, not pure stateless JWTs. `/auth/refresh` rotates the token (old one revoked, new one issued) on every use.
- **Login lockout**: 5 failed password attempts locks the account 15 minutes (`User.loginAttempts`/`lockUntil`).
- **Rate limiting on auth endpoints**: 5 requests/minute per IP on register/login/forgot/reset (`authLimiter`) — **observed live**: 3 rapid logout→login cycles succeeded, the 4th and 5th were correctly rejected with HTTP 429 "Too many auth attempts," not a false credential failure.
- **RBAC**: single `authorize(ROLES.ADMIN)` middleware, applied router-wide to the entire `/api/v1/admin/*` router and to `POST /contests`. No per-endpoint RBAC drift found.

### Live test results

| Test | Result |
|---|---|
| Register new user | ✅ 201, user + access token returned, refresh cookie set |
| Login with correct credentials | ✅ 200 |
| Logout | ✅ 200, refresh token revoked |
| **Login again immediately after logout** | ✅ 200 — repeated **3 consecutive times** successfully before hitting the (correctly-functioning) rate limiter. **The reported "Invalid email or password" bug after logout could not be reproduced.** No code path was found that would explain it (login looks up by email against the live `User` collection every time — there is no stale-cache layer on the credential-check path). Treat this as a *previously-fixed or environment-specific* issue, not a current defect — see §26. |
| Wrong password | ✅ 401 "Invalid email or password" (correct, generic message — does not leak whether the account exists) |
| Nonexistent email | ✅ Same generic 401 pattern (rate-limited on the attempt tested, but the code path is identical to wrong-password) |
| Duplicate registration (same email) | ✅ 409 "Email already registered" |
| Empty-field registration | ✅ 400 with itemized per-field validation messages (username format, email format, password complexity all checked) |
| Invalid email format | ✅ 400, field-level error |
| Weak password (`"123"`) | ✅ 400, itemized complexity errors (min 8 chars, needs lower/upper/digit) |
| Protected route, no token | ✅ 401 "Authentication required" |
| Protected route, valid student token | ✅ 200 |
| Admin-only route, student token | ✅ 403 "Insufficient permissions" |
| Admin-only route, admin token | ✅ 200, correct data returned |
| Invalid/garbage bearer token | ✅ 401 "Invalid access token" |
| Admin login (`admin@thinkstack.dev` / `ChangeMe123!` from `.env`) | ✅ 200 — **these documented default credentials are live and functional**, not stale doc references. The admin account returned real accumulated gamification stats (1255 XP, level 3, 8 topics completed), indicating genuine prior usage, not a fresh/fake seed artifact. |
| Cross-user resource access (IDOR) — admin fetching a *different user's* note by its Mongo `_id` | ✅ 404 "Note not found" (repository query is scoped by `userId`, not just `_id` — correct) |
| Session persistence after full backend process restart | ✅ Logged in again post-restart with the same credentials, dashboard stats intact |

**Conclusion**: authentication and authorization are solid and correctly implemented. This is the single most heavily-scrutinized area of the brief and it came back clean.

---

## 11. Feature Inventory (what exists — verified against source, not assumed from folder names)

| Area | Present? | Evidence |
|---|---|---|
| Learning (topics, curriculum, examples) | ✅ Yes | `LearningService`, `Topic` model, `LearnPage`/`TopicReaderPage`, ~500 seeded topics across 40 modules |
| Visualizers (sorting/searching/trees/graphs) | ✅ Yes | `shared/algorithms/*` engine + generic `VisualizerWorkspacePage`/ReactFlow renderers; `Visualizer` model + seed catalog |
| Manual code tracing (step debugger) | ✅ Yes | `features/code-tracing`, a genuine **client-side interpreter** (`shared/tracing`) — no backend call needed, by design |
| Playground (multi-language code editor) | ✅ Yes (execution gated) | Monaco editor + `PlaygroundService` + `Judge0Service`; execution shows "Coming Soon" without a Judge0 key (see Bug BUG-01), but snippet CRUD/history is fully functional independent of that |
| Coding problems (LeetCode-style) | ✅ Yes (execution gated) | `Problem` model (300 seeded), `ProblemService`, run/submit endpoints; same Judge0 gating as above |
| Quizzes | ✅ Yes, fully working | Verified live: list → detail → submit → scored → attempt history persisted → XP/badge awarded on pass |
| AI Tutor (Gemini) | ✅ Implemented, gated | `AITutorService`/`GeminiService`, conversation CRUD works regardless; actual AI replies show "Coming Soon" without a Gemini key (same pattern as Judge0) |
| Notes | ✅ Yes, fully working | Verified live: create → read → update → **survives backend restart** |
| Progress tracking | ✅ Yes | `ProgressService` — activity timeline, time-by-category, weak-area detection |
| Gamification (XP/levels/badges/coins/streaks) | ✅ Yes, fully working | Verified live end-to-end: quiz pass → +30 XP (quiz) + 15 XP (badge bonus) → level/coins updated → badge "Quiz Taker" awarded → all visible on `/dashboard` and `/leaderboard` immediately |
| Leaderboards (global/weekly) | ✅ Yes | `LeaderboardService`, verified live — correctly reflects real XP totals including the test XP just awarded |
| Contests | ✅ Implemented | `ContestService`, ICPC-style scoring util, 30 seeded contests; run/submit legs share the same Judge0 gating |
| User system (register/login/roles/profile/settings) | ✅ Yes, fully working | See §10 |
| Admin (CMS for all content types + analytics + CSV export + audit log) | ✅ Yes, fully working | Verified live full CRUD cycle on Announcements (create→update→delete→confirmed-gone); route inventory shows equivalent CRUD for topics/problems/quizzes/contests/badges/visualizers/certificates/daily-challenges/settings/users |
| Notifications | ✅ Yes | In-app center, unread-count polling (pauses on 401 — nice touch), typed notification builders for achievements/contests/announcements/streaks |
| Global search | ✅ Yes | Cross-topic/problem/note search + autocomplete + server-persisted search history |
| Settings (theme, editor prefs, profile, password, account deletion) | ✅ Yes | Password change and account deletion both correctly force a logout afterward (session invalidation) |
| Bookmarks | ✅ Yes | Polymorphic bookmark model (topic/problem/quiz), batched status-lookup context to avoid N+1 |
| Certificates | ✅ Implemented (backend) | Model + admin CRUD + criteria engine exist; **no dedicated frontend page/route found for a student to view/claim earned certificates** — flag as possibly incomplete on the frontend side, verify with product owner (§27 Missing Features) |

---

## 12. Feature Completion Matrix

🟢 COMPLETE/VERIFIED 🟡 PARTIAL 🟠 IMPLEMENTED BUT BROKEN 🔵 IMPLEMENTED, NOT VERIFIED (no live test performed) 🔴 NOT IMPLEMENTED ⚪ PLACEHOLDER/MOCK

| Feature | Status | Evidence |
|---|---|---|
| Registration | 🟢 | Live-tested, incl. all validation edge cases |
| Login | 🟢 | Live-tested |
| Logout | 🟢 | Live-tested |
| Login-after-logout (the specifically-flagged concern) | 🟢 | Live-tested 3× successfully; bug not reproduced |
| Admin login/logout | 🟢 | Live-tested |
| RBAC (student vs admin) | 🟢 | Live-tested both directions |
| Refresh-token rotation | 🟢 | Verified via code + `scripts/smoke-test.mjs` pass |
| Notes CRUD + persistence | 🟢 | Live-tested incl. backend-restart survival |
| Admin Announcements CRUD | 🟢 | Live-tested full cycle |
| Admin CRUD (topics/problems/quizzes/contests/badges/visualizers/certificates/daily-challenges/users) | 🔵 | Route/controller/service code inspected and structurally identical to the verified Announcements path; not independently live-tested for time reasons |
| Quiz taking + scoring + history | 🟢 | Live-tested, including pass/fail scoring math |
| Gamification (XP/level/coins/badges) | 🟢 | Live-tested end-to-end via quiz pass |
| Leaderboard | 🟢 | Live-tested, reflects real-time XP |
| Dashboard aggregate | 🟢 | Live-tested |
| Learning topics list/detail | 🔵 | Code-verified (`GET /topics` used in smoke test and passed), not manually deep-tested per-topic |
| Visualizer — Linear Search stale-state bug | 🟢 (checked, **not present**) | Deep code trace of `useCallback`/`useEffect` deps in `VisualizerWorkspacePage.jsx`; confirmed correct |
| Visualizer — Binary Search / Bubble Sort / Trees / Graphs stale-state | 🟢 (checked, not present) | Same pipeline, pure-function algorithm engine, no analogous issue found |
| Playground code execution | ⚪ (Coming Soon in current env) | Judge0 unconfigured — see Bug BUG-01; snippet CRUD itself is 🟢 |
| Problem run/submit execution | ⚪ (Coming Soon in current env) | Same as above |
| Contest run/submit execution | ⚪ (Coming Soon in current env) | Same as above |
| AI Tutor chat replies | ⚪ (Coming Soon in current env) | Gemini unconfigured; conversation CRUD itself is 🔵 (not live-tested) |
| Notifications | 🔵 | Code-verified, not live-tested |
| Global search | 🔵 | Code-verified, not live-tested |
| Settings (profile/password/theme/account deletion) | 🔵 | Code-verified, not live-tested |
| Bookmarks | 🔵 | Code-verified, not live-tested |
| Contests (registration/leaderboard/standings) | 🔵 | Code-verified, not live-tested |
| Certificates — student-facing view | 🔴 (likely missing) | No frontend route/page found; backend model+admin CRUD exists |
| Frontend responsive/visual QA | 🔵 (not verified) | **No browser automation tool was available in this session** — see §26. Assessed via Tailwind/CSS code reading only, not actual rendering |

---

## 13. API Inventory

Full endpoint-by-endpoint table (method, path, auth, rate limits, validators, controller) is reproduced in **Appendix A** below — 17 route groups, ~90 endpoints total. Highlights:
- Base path `/api/v1`. Global middleware order: `helmet` → CORS → global rate limit (100/15min prod, 5000/15min dev) → body parsers → `cookie-parser` → `express-mongo-sanitize` → `morgan` → routes → 404 → error handler.
- Every route group except `/health`, `/integrations/status`, and the auth entry points (`/auth/register`, `/login`, `/refresh`, `/logout`, `/forgot-password`, `/reset-password`) requires `authenticate`.
- Admin router (`/admin/*`) requires `authenticate` **and** `authorize(ADMIN)` at the router level — no individual admin route was found missing this guard.
- Response envelope is consistent everywhere: success → `{success:true, message, data}`; error → `{success:false, error:{message, details?}}`; unconfigured-integration → `{success:false, comingSoon:true, service, message}` with **HTTP 200** (a deliberate design choice so the frontend can distinguish "feature not configured" from a real error — confirmed both server- and client-side).

---

## 14. Database Model Inventory

All 26 models, fields, indexes, and refs are documented in **Appendix B**. No orphaned/dead models were found — every model is referenced by at least one repository/service.

---

## 15. Seed Data

`backend/src/seed/bootstrap.js` runs automatically on every server boot (`BOOTSTRAP_ON_START=true` default) and via `npm run seed[:fresh|:sync]`. Confirmed idempotent (insert-mode uses `$setOnInsert`) — **verified live**: it ran again on the backend restart mid-audit without duplicating or resetting the test data created moments before.

What it creates:
- 1 admin (`admin@thinkstack.dev`, `ChangeMe123!` default) + re-syncs role/active/password-hash on every boot if env vars changed.
- 1 demo student (`student@thinkstack.dev`, `Student123!`) — **skipped in production**.
- 57 badges, 50 certificates, ~50+ visualizer catalog entries (from `shared/algorithms`).
- **500 topics across 40 curriculum modules** (confirmed programmatically by the audit agent, not just from a comment) with full rich content, code examples, and a 1:1 auto-generated quiz per topic, plus wired prev/next/related navigation.
- **300 generated problems** (100 easy / 130 medium / 70 hard, template-based, 5-language starter code stubs, 1 visible + 1 hidden test case each).
- 30 days of daily challenges, 30 contests, 1 welcome announcement.

This is template/generator-produced content (not hand-authored), which is worth knowing: problem/topic titles follow a "**Absolute Difference 10**", "**0 1 BFS Quiz**" naming pattern rather than bespoke curated content — fine for a functioning demo/FYP dataset, but flag to the user if they expect hand-written content quality.

---

## 16. Visualizer Audit

See §10-style deep dive already performed by the frontend inventory agent (full trace in the conversation record). Summary:
- Visualizer feature code itself (`frontend/src/features/visualizer/`) is generic playback/rendering plumbing; actual algorithms live in `shared/algorithms/*` as pure functions.
- `VisualizerWorkspacePage.jsx`'s `generateSteps` `useCallback` correctly lists `customInput`/`target` as dependencies; the debounced auto-run `useEffect` correctly lists `generateSteps` itself as a dependency, so React tears down and reschedules on every relevant state change — **no stale-closure bug found** for Linear Search, Binary Search, Bubble Sort, BST Insert, or DFS/BFS (5 algorithms explicitly traced).
- One minor **input-validation** gap (not a staleness bug): clearing the target `<input type="number">` produces `Number('') → NaN`, which would flow into `NaN` comparisons in `linearSearch`/`binarySearch`. Low severity, easy fix (see §17 P2).
- "Randomize" for `array-target` algorithms passes explicit override values into `generateSteps({inputOverride, targetOverride})` rather than relying on state having committed — an above-average-robustness pattern, worth preserving as the convention for any new visualizer.

---

## 17. CRUD Audit

| Entity | Create | Read | Update | Delete | Verified how |
|---|---|---|---|---|---|
| Notes | ✅ | ✅ | ✅ | not tested | Live HTTP, DB-backed, survives restart |
| Admin Announcements | ✅ | ✅ | ✅ | ✅ | Live HTTP full cycle, confirmed absence after delete |
| QuizAttempts | ✅ (via submit) | ✅ | n/a | n/a | Live HTTP, scoring + persistence confirmed |
| Users (admin update) | — | ✅ (list) | not tested | n/a (no user delete endpoint — deletion is self-service via Settings, see model) | List endpoint tested live |
| Topics/Problems/Quizzes/Contests/Badges/Visualizers/Certificates/DailyChallenges (admin) | 🔵 code-verified only | 🔵 | 🔵 | 🔵 | Route/controller/service pattern identical to the verified Announcements path; not independently exercised |

No feature was found where the frontend *claims* to persist data but actually only updates local/React state — this was specifically checked across all 21 feature modules by the frontend inventory agent (see §11 API layer notes).

---

## 18. Persistence Audit

Directly tested, not inferred:
1. Created a note via API → visible in list.
2. Updated the note → change reflected immediately.
3. **Killed the entire backend Node process** (hard kill, not graceful shutdown) → restarted via `npm run dev:backend` → MongoDB reconnected → seed bootstrap ran (idempotently, no data loss) → **logged in again and the note + its edit were both still present, byte-for-byte**.
4. Gamification state (XP/coins/badges) similarly persisted across the same restart (visible in the admin account's accumulated 1255 XP / level 3 / 8 topics-completed stats, which predate this audit session entirely — real historical usage data, not seed fixtures).

This confirms MongoDB is the real source of truth for user-generated data, not an in-memory or mocked layer, for every feature actually exercised.

---

## 19. Security Audit

| Finding | Severity | Detail |
|---|---|---|
| Dev-mode CORS allows all origins | **LOW** (dev-only) | `config/cors.js`: `!env.isProduction` short-circuits the origin allow-list check entirely in dev. Production correctly enforces an allow-list. Not a real risk as shipped (dev servers aren't public), but confirm this branch is never accidentally reachable if `NODE_ENV` misconfigures in a deployed environment. |
| Hardcoded dev JWT secret fallbacks | **MEDIUM** | `config/env.js` has default JWT secrets (`'dev-access-secret-change-me'`-style) used if `.env` doesn't set them. Production boot correctly *throws* if these are missing when `NODE_ENV=production`, which mitigates the risk — but this is a footgun if `NODE_ENV` is ever wrong in a real deployment. No action needed beyond awareness; do not weaken the production check. |
| Password reset silently no-ops without `RESEND_API_KEY` | **LOW** (dev-only, by design) | `EmailService.js` logs the reset URL server-side instead of emailing it when no Resend key is set. This is intentional dev-convenience, not a leak (nothing is exposed to the requesting client), but worth knowing before assuming "password reset works" in a fresh environment — it does, but only the person with server log access can complete it without a real email key. |
| No CSRF middleware | **LOW** | Mitigated in practice by Bearer-token access auth (CSRF requires ambient credentials; a bearer token in a JS variable isn't ambient) + `sameSite` on the one cookie that *is* ambient (the refresh token). Standard for this auth pattern; not flagging as an action item. |
| `express-mongo-sanitize` is the only NoSQL-injection guard | **LOW** | Present and correctly wired globally in `app.js`. No raw/unsanitized query construction was found in the repositories reviewed. |
| RBAC | ✅ Verified correct | Router-level `authorize(ADMIN)`, live-tested both allow and deny paths. |
| IDOR | ✅ Verified correct (on Notes) | Cross-user resource access returns 404, not another user's data. Same repository-scoping pattern (`{userId, _id}` queries) is used consistently across Notes/Bookmarks/PlaygroundSnippets/AITutorConversations per the backend inventory — recommend spot-checking 1–2 more of these live before assuming it's universal, but the pattern is consistent in code. |
| bcrypt rounds | ✅ Good | 12 rounds, applied consistently (register, login-rehash-on-mismatch for admin, password change, account deletion anonymization). |
| Rate limiting | ✅ Present and correctly tuned | Auth (5/min), AI chat (20/hr, keyed per-user), code exec (10/min) — all bypassed only under `NODE_ENV=test`, confirmed live via the 429s hit during repeated login testing. |
| XSS | ✅ No `dangerouslySetInnerHTML` found anywhere in `frontend/src` | Markdown content rendering goes through a `MarkdownContent` component; a DOMPurify (`purify.es`) chunk is present in the production build output, indicating sanitization is in the pipeline for any HTML that markdown rendering produces. Not independently verified by injecting a payload in this audit — recommend a follow-up XSS-payload test on Notes/Topic content specifically if that becomes a priority. |
| Admin bootstrap credentials | **LOW**, informational | `admin@thinkstack.dev` / `ChangeMe123!` are live, functional, default credentials in this dev environment (confirmed by live login). This is fine for local dev (same as any FYP-style seed) but **must** be overridden via `.env` before any public deployment — the bootstrap logic re-hashes the admin password to match `.env` on every restart if they diverge, so this is a one-`.env`-edit fix, not a code change. |
| Secrets exposure | None found | `.env` files are gitignored (`.gitignore` includes `.env` patterns — verified); no secrets were found hardcoded in source. All values in this report are dev-default placeholders, already documented in `.env.example`, not real credentials. |

---

## 20–21. Frontend/UI Audit & Responsive Design Audit

**Important limitation, stated plainly**: this session had no browser-automation tool (no Playwright/Puppeteer/screenshot capability was available), so **no live visual/rendering/responsive testing was performed**. What follows is based on code/CSS inspection only, cross-checked against a successful production build and clean ESLint run.

- Design system is consistent and centralized (Tailwind config + `index.css` component-layer classes + a small `components/ui/` set) — see §7. Dark mode is class-based and driven by a Redux slice, standard and low-risk.
- `.page-container`, responsive utility patterns, and Tailwind's default breakpoint system appear used consistently based on class-name grep, but actual breakpoint behavior (mobile/tablet layouts, overflow handling, nav collapsing) was **not visually verified** — flag this explicitly as unverified in any status report to the user, don't claim "responsive: confirmed."
- No broken internal links were found via route-table cross-reference (every `<Link>`/`navigate()` target that could be grepped resolves to a route defined in `router.jsx`), but this was a static check, not a click-through.
- `PlaceholderPage.jsx` exists as a generic "coming soon" component but is **not wired into any route** in `router.jsx` — dead/unused code, or reserved for a future placeholder route. Low-priority cleanup candidate, not a bug.
- Loading/empty/error states: `.skeleton` and `.empty-state*` utility classes exist in the design system and are referenced by feature hooks' loading/error state variables per the inventory — presence confirmed, actual on-screen rendering not verified.

**Recommendation for the next session**: if a browser tool becomes available (or the user runs one manually), this is the highest-value follow-up — everything else in this report has real evidence behind it; the visual/UX layer is the one area resting on code-reading inference rather than observation.

---

## 22. Performance Audit

- **Frontend bundle**: production build succeeds but flags two oversized chunks: `index-*.js` (750 KB / 245 KB gzip — the main entry chunk, likely pulling in Monaco Editor eagerly rather than through the existing lazy-route split) and `ManualTracingPage-*.js` (636 KB / 191 KB gzip — the client-side code-tracing interpreter). Both are candidates for `manualChunks`/deeper dynamic-import splitting, not correctness bugs.
- **Backend**: Mongoose indexes are present and sensible on every high-traffic query path reviewed (leaderboard sort on `gamification.xp`, per-user timeline queries on `{userId, createdAt}`, TTL index on `RefreshToken.expiresAt`, text indexes for search). No obvious missing-index or N+1 pattern was found in the services reviewed (repositories batch-load via single queries with `.populate()`/`$in` rather than looping).
- **Notifications polling**: `useNotifications.js` polls `/notifications/unread-count` every 60s by default and **correctly pauses on 401** (avoids hammering the API for a logged-out session) — a good pattern, not an issue.
- **Learning "time spent" tracking**: uses `fetch(..., {keepalive:true})` on tab-close rather than a normal Axios call — correct choice for reliability, not a bug.
- No memory-leak-shaped patterns (uncleared intervals/listeners) were flagged by the inventory agents; `useContestCountdown`'s 1s interval and the debounced visualizer effect both have cleanup functions in their `useEffect` returns per the code traced.

---

## 23. Automated Testing Results

| Suite | Result |
|---|---|
| `npm run test -w backend` (Jest 29, real MongoDB, `maxWorkers:1`) | **193/193 tests passed**, 28 test suites, ~140s. Covers: 14 integration test files hitting the real Express app + real DB via Supertest (admin, ai, auth, contests, dashboard, gamification, leaderboard, learning, notes, notifications, playground, problems, progress, quizzes, search, settings), 3 repository-level tests, 8 pure-logic unit tests (gamification math, contest scoring, quiz grading, code-execution verdict resolution, search sanitization, tracing engine), plus a `bootstrap.test.js` that runs the real seed pipeline against the test DB. Test DB (`thinkstack_test`) is dropped fresh at suite start and gracefully self-skips (`describeIfDb`) if MongoDB isn't reachable — did not need to fall back to skip mode here since MongoDB was running. |
| `npm run lint -w backend` (ESLint 9) | **0 errors**, 13 warnings — all `no-unused-vars` in seed generators/AdminService/ContestService. Cosmetic. |
| `npm run lint -w frontend` (ESLint 9 + react-hooks/react-refresh plugins) | **0 errors**, 18 warnings — mostly `react-refresh/only-export-components` (files that export a component + a constant/helper — cosmetic, standard Vite/HMR nit) and 2 genuine `react-hooks/exhaustive-deps` warnings (`AITutorPage.jsx:22`, `ManualTracingPage.jsx:76,98` — missing `tutor`/`tracer` in dependency arrays). These are worth a look but did not manifest as an observed bug in live testing. |
| `npm run build -w frontend` (Vite 6) | **Succeeds**, ~20s. Bundle-size warnings only (see §22), not errors. |
| `scripts/smoke-test.mjs` | **7/7 passed** against the live local instance. |

---

## 24. Manual Testing Results — Test Matrix

| Feature | Test | Expected | Actual | Status | Severity |
|---|---|---|---|---|---|
| Register | Valid new user | 201 + token | 201 + token | ✅ | — |
| Register | Duplicate email | 409 | 409 "Email already registered" | ✅ | — |
| Register | Empty body | 400 + field errors | 400, full itemized errors | ✅ | — |
| Register | Invalid email format | 400 | 400 | ✅ | — |
| Register | Weak password | 400 | 400, itemized complexity errors | ✅ | — |
| Login | Correct credentials | 200 | 200 | ✅ | — |
| Login | Wrong password | 401 generic message | 401 "Invalid email or password" | ✅ | — |
| Logout → Login (×3 cycles) | 200 each time | 200 each time (4th/5th rate-limited, expected) | ✅ | — |
| Protected route | No token | 401 | 401 "Authentication required" | ✅ | — |
| Protected route | Valid token | 200 | 200 | ✅ | — |
| Admin route | Student token | 403 | 403 "Insufficient permissions" | ✅ | — |
| Admin route | Admin token | 200 | 200 | ✅ | — |
| Admin login | Documented default creds | 200 | 200, real accumulated stats returned | ✅ | — |
| Notes | Create → Read → Update | Persisted | Persisted, correct data each step | ✅ | — |
| Notes | Persist across backend restart | Data survives | Survived intact | ✅ | — |
| Notes | Cross-user access (IDOR) | 404/403 | 404 "Note not found" | ✅ | — |
| Admin Announcements | Create → Update → Delete → Verify gone | Full cycle correct | Full cycle correct | ✅ | — |
| Quiz | Submit wrong answers | Scored correctly, not passed, no XP | 67% score, `passed:false`, `xpAwarded:0` | ✅ | — |
| Quiz | Submit correct answers | Scored 100%, passed, XP+badge awarded | 100%, `passed:true`, +30 XP quiz +15 XP badge bonus, badge "Quiz Taker" awarded, coins updated | ✅ | — |
| Leaderboard | Reflects new XP immediately | Real-time | Confirmed, admin's historical 1255 XP and the fresh 60 XP test account both correctly ranked | ✅ | — |
| Problem run (no Judge0 key) | Should show integration status honestly | "Coming Soon" response | `{comingSoon:true, service:"Judge0", ...}` HTTP 200 | ✅ (working as designed) | — |
| Problem run (dummy Judge0 key + `JUDGE0_MOCK=true`) | Mock execution should work per docs | Mock execution works | `{verdict:"accepted", mockMode:true, ...}` | ✅ once key present | See BUG-01 below |
| `JUDGE0_MOCK=true` alone (no key), as `.env.example`/README imply is sufficient | Simulated execution without a real key | Still shows "Coming Soon", not mock | ❌ **mismatch between documented and actual behavior** | 🐛 BUG-01 | LOW/MEDIUM (dev-experience only) |
| Visualizer stale-state (Linear Search, per brief) | Old target/input reused on re-run | New values used correctly every time (code-traced) | ✅ (bug not present) | — |
| Frontend build | `vite build` | Succeeds | Succeeds, 20s | ✅ | — |
| Backend test suite | `npm test` | All pass | 193/193 | ✅ | — |
| Lint (both) | 0 errors | 0 errors | 0 errors (warnings only) | ✅ | — |

---

## 25. Bugs Found

### BUG-01 — `JUDGE0_MOCK`/`GEMINI_MOCK` env flags don't enable mock mode without also setting a (dummy) API key
**Severity**: LOW/MEDIUM (developer-experience bug, not a security or data-integrity issue; does not affect production behavior since production is expected to have real keys)
**Feature**: Playground / Problems / Contests code execution; by identical code pattern, AI Tutor (Gemini)
**Preconditions**: Fresh dev environment following the documented setup (`backend/.env.example` / README say: `JUDGE0_MOCK=true` = "mock execution without Judge0", `GEMINI_MOCK=true` = "mock AI without Gemini")
**Steps to reproduce**:
1. Start backend with `JUDGE0_API_KEY=` (empty) and `JUDGE0_MOCK=true` (this is the actual shipped `backend/.env` state, and matches the documented instructions).
2. Log in, `POST /api/v1/problems/:slug/run` with any valid code.
**Expected result** (per README/`.env.example` comments): simulated/mock code execution result.
**Actual result**: `{success:false, comingSoon:true, service:"Judge0", message:"The online compiler has not yet been configured..."}` — the mock path is never reached.
**Root cause**: `backend/src/utils/integrationStatus.js`:
```js
export const isJudge0ComingSoon = () => {
  if (isJudge0Configured()) return false;   // requires a non-empty JUDGE0_API_KEY
  if (env.nodeEnv === 'test') return false;
  return true;                               // <- always true in dev without a key
};
export const shouldUseJudge0Mock = () => {
  if (env.nodeEnv === 'test' && !isJudge0Configured()) return true;
  return isJudge0Configured() && process.env.JUDGE0_MOCK === 'true'; // <- also requires a key
};
```
`Judge0Service`/`AITutorService` check `isComingSoon()` first; since it's true whenever no key is set (regardless of `NODE_ENV` being `development`), the mock branch is unreachable without *also* setting `JUDGE0_API_KEY`/`GEMINI_API_KEY` to some (even fake) non-empty value. **Confirmed live**: setting `JUDGE0_API_KEY=audit-temp-dummy-key` alongside the existing `JUDGE0_MOCK=true` immediately made `/problems/:slug/run` return a correct simulated `{verdict:"accepted", mockMode:true}` response. This temporary key was reverted after the test — `backend/.env` is back to its original state.
**Relevant files**: `backend/src/utils/integrationStatus.js` (`isJudge0ComingSoon`/`isGeminiComingSoon`), `backend/.env.example`, `README.md` (the env var table), `documentation/guides/AI_TUTOR.md`.
**Recommended fix** (pick one, product decision not made here):
- (a) Update the docs to say mock mode requires *both* a (dummy) key and the mock flag, or
- (b) Change `isJudge0ComingSoon()`/`isGeminiComingSoon()` to also return `false` when `shouldUseJudge0Mock()`/`shouldUseGeminiMock()` would be true, so `JUDGE0_MOCK=true` alone is sufficient as documented.
**Blocks other functionality?** No — it only affects local dev experience when trying to exercise code-execution/AI features without real third-party keys; every other feature is unaffected and the "Coming Soon" UI path itself works correctly and gracefully.

### Investigated, NOT a bug — "Invalid email or password after logout"
Explicitly hunted for per the brief. 3 consecutive register→login→logout→login cycles all succeeded live. Code review of `AuthService.login`/`logout` shows no caching layer, no stale in-memory user lookup, and no code path where a successful prior login would poison a later lookup — every login does a fresh `User.findOne({email})` and fresh bcrypt compare. **Recommendation**: do not spend further time chasing this specific symptom unless the user can provide exact reproduction steps/timing (e.g., it may have been a race condition tied to a since-fixed version of the refresh-token flow, or a frontend-only symptom — see §26 limitation — where the Redux `auth` slice or `AuthInitializer` held stale state after logout even though the backend was already correct; that surface **was not independently live-tested via an actual browser** in this audit).

### Investigated, NOT a bug — Linear Search / visualizer stale-state
Explicitly hunted for per the brief, including 4 other visualizers for the same pattern. See §16. No occurrence found; `useCallback`/`useEffect` dependency arrays are correct throughout.

---

## 26. Known Limitations (of this audit, not necessarily of the product)

- **No browser automation tool was available in this session.** All frontend behavior (React state transitions, actual click-through UX, responsive layout, visual regressions, the AuthInitializer's client-side handling of logout/login) was assessed via **code reading only**, cross-checked against passing ESLint/build and a live-tested backend API. Anything in this report attributed to "code-verified" rather than "live-tested"/"verified live" should be treated as **high-confidence but not observationally proven** — the natural next step for a session that *does* have browser tooling.
- Admin CRUD was live-verified end-to-end only for **Announcements**; the other 8 admin-managed entity types (topics/problems/quizzes/contests/badges/visualizers/certificates/daily-challenges) share identical route/controller/service architecture and were not independently exercised for time budget reasons.
- Contests (registration → run/submit → leaderboard) were not live-tested end-to-end (code-verified only); the run/submit legs would hit the same Judge0 "Coming Soon" gate as Problems in this environment anyway.
- No XSS payload was actually injected into Notes/Topic content to verify the DOMPurify pipeline in practice — its presence in the build and the absence of `dangerouslySetInnerHTML` is strong circumstantial evidence, not a positive proof.
- Deployment configuration (`render.yaml`, Vercel config, production CORS/cookie cross-origin behavior) was read but not deployed/tested in this audit.

---

## 27. Missing Features

- **Certificates — no student-facing frontend route/page was found.** Backend model, criteria engine, and admin CRUD all exist (`Certificate` model, `admin.controller.js` certificate endpoints); no corresponding page in `frontend/src/pages` or route in `router.jsx` for a student to view/claim earned certificates. Verify with the user whether this was intentionally deferred or is a genuine gap — do not assume either way.
- `PlaceholderPage.jsx` exists but is unrouted — either dead code or a reserved slot for an announced-but-unbuilt feature; worth a quick "what was this for" check with the user/git history (no git history was available in this session — see Environment note, "Is a git repository: false").

---

## 28. Technical Debt

- Frontend main bundle (750 KB) and `ManualTracingPage` chunk (636 KB) exceed Vite's 500 KB warning threshold — candidates for better code-splitting (§22).
- 13 backend + 18 frontend ESLint warnings (all `no-unused-vars` or `react-refresh`/`react-hooks` advisory-level) — low-effort cleanup, zero functional impact observed.
- The env-flag/"Coming Soon" gating logic (BUG-01) would benefit from a single shared helper instead of the parallel `isXComingSoon`/`shouldUseXMock` pair duplicated for Gemini and Judge0 — not urgent, but the duplication is exactly why the same subtle bug exists in both integrations simultaneously.
- `globalTeardown.js` in the Jest config references `global.__MONGO_SERVER__`, a vestige of an in-memory-Mongo approach that was apparently abandoned in favor of real-MongoDB integration tests — dead code, harmless, but confusing to a future reader expecting an in-memory DB strategy.

---

## 29. Recommended Fix Order (Priority Roadmap)

### P0 — Blocking / Critical
None found. No feature was discovered to be broken in a way that blocks other functionality, and no data-loss or security-critical defect was found.

### P1 — High Priority
1. **Fix or document BUG-01** (Judge0/Gemini mock-mode gating) — affects every developer's first local run-through of the platform's flagship features (Playground, Problem submission, AI Tutor), and the fix is small (either a doc correction or a ~5-line logic change in `integrationStatus.js`).
2. **Get a browser-testing pass done** — this audit's biggest gap is the entire visual/UX/responsive layer and true end-to-end click-through of every feature. Everything is architecturally sound on paper; someone (human or a session with browser tooling) should actually click through the app once.

### P2 — Medium Priority
1. Fix the `NaN` edge case on visualizer target inputs (clearing the field) — trivial, `Number.isNaN` guard.
2. Resolve the 2 genuine `react-hooks/exhaustive-deps` warnings (`AITutorPage.jsx`, `ManualTracingPage.jsx`) — verify they're not masking a real staleness bug in those two specific features (unlike the visualizer, these were *not* deep-traced in this audit).
3. Investigate/confirm whether Certificates has a frontend gap (§27) and close it if intended.
4. Code-split the two oversized bundle chunks.

### P3 — Low Priority
1. Clean up the 13+18 lint warnings.
2. Decide the fate of `PlaceholderPage.jsx` (wire it up or delete it).
3. Remove the dead `global.__MONGO_SERVER__` reference in `tests/globalTeardown.js`.
4. Consider hand-curating a subset of the generated/template problems and topics if content quality (vs. quantity) becomes a priority.

---

## 30. Recommended Next Development Steps

1. Do the P1 items above first — they're both cheap and both directly de-risk everything else.
2. Once browser tooling is available, systematically click through: full auth flow in an actual browser (specifically re-attempt to reproduce the historical logout/login bug report, since it could be a frontend-only Redux/AuthInitializer symptom this audit's API-level testing couldn't see), then each feature page for visual/responsive correctness.
3. Live-verify the remaining 8 admin CRUD entity types and the Contests registration→submission→leaderboard flow, using the same request patterns already proven against Announcements/Notes/Quizzes in this report as a template.
4. If/when real Judge0 and Gemini API keys are available, do one live end-to-end pass with real execution/AI to confirm the non-mock code paths (currently only code-reviewed, never exercised against real third-party APIs in this audit).

---

## 31. Files/Directories That Are Important

- `backend/src/{routes,controllers,services,repositories,models}` — the layered backend; follow this exact pattern for any new endpoint (route → thin controller → service → repository → model).
- `backend/src/utils/integrationStatus.js` + `services/{Judge0Service,GeminiService}.js` — the "Coming Soon"/mock gating pattern; understand this before touching either integration (see BUG-01).
- `backend/src/seed/` — bootstrap/curriculum/problem generators; this is how all demo content is produced, and it's what runs automatically on every server boot.
- `frontend/src/services/api.js` — the single Axios instance + refresh-token interceptor; do not create a second Axios instance elsewhere, everything should go through this one for the 401-refresh-queue logic to keep working.
- `frontend/src/app/{router.jsx,store.js,providers.jsx}` — routing/state entry points.
- `frontend/src/features/<name>/use<Name>.js` + `<name>Service.js` — the established per-feature convention (hook + service, not Redux) for every feature except `auth` and `theme`.
- `shared/algorithms/` — the actual algorithm implementations, consumed by both the frontend visualizer and the backend seed's problem/visualizer generators. Single source of truth; don't duplicate an algorithm implementation elsewhere.
- `frontend/src/styles/index.css` + `tailwind.config.js` — the design system; reuse its classes.
- `documentation/planning/*.md` — pre-existing SRS/Architecture/Database-Design/Roadmap docs; cross-referenced spot-checks during this audit did not turn up contradictions with the actual implementation, so they appear to be reasonably trustworthy background reading (not independently re-verified line-by-line here).
- `documentation/openapi.yaml` — an existing OpenAPI spec; not diffed against the live route inventory in this audit, worth a follow-up check for drift.
- This report: `documentation/PROJECT_HANDOVER_AUDIT.md`.

---

## 32. Final Project Health Assessment

**Green light to continue building.** This is not a shaky or half-finished codebase pretending otherwise — it's a genuinely working full-stack application with real database persistence, correct auth/RBAC, a working gamification loop, and a clean test/lint/build pipeline, built on a consistent and sensible architecture. The gaps that exist (two ungated third-party integrations in dev, unverified visual/responsive layer, a handful of admin CRUD paths not independently live-tested) are honest, bounded, and none of them block further development. The one confirmed bug (BUG-01) is a quick fix. The specific concern that motivated this audit — a login-after-logout credential bug — was actively hunted for and not found; treat it as resolved or environment-specific pending a reproduction from an actual browser session.

---

## "WHAT THE NEXT CLAUDE/CURSOR SESSION SHOULD KNOW"

**What ThinkStack currently is**: A working MERN DSA learning platform — real backend (Express/Mongoose/MongoDB), real React frontend, real auth, real persistence, real gamification. Not a mockup, not a prototype with fake data — the admin account alone has 1255 real accumulated XP from actual prior use.

**What definitely works** (live-tested this session): registration, login, logout, login-after-logout (repeatedly), RBAC, IDOR protection on notes, notes CRUD with real persistence across a full backend restart, admin announcement CRUD, quiz taking/scoring/history, the full gamification pipeline (XP, levels, coins, badges) triggered by a real quiz pass, the leaderboard reflecting it live, and the dev startup/build/test/lint pipeline end to end.

**What does not work as documented**: `JUDGE0_MOCK=true`/`GEMINI_MOCK` alone do not enable mock mode in dev — you must also set a dummy `JUDGE0_API_KEY`/`GEMINI_API_KEY` (see BUG-01, `backend/src/utils/integrationStatus.js`). Until that's fixed or you set dummy keys, Playground/Problem/Contest code execution and AI Tutor replies will show a "Coming Soon" placeholder in any fresh local checkout — this is a documented, deliberate degrade path (not a crash), just not the mock experience the docs describe.

**What remains unfinished / unverified**: the entire visual/UX/responsive layer (no browser tool was available to this audit — this is the single biggest gap, go verify it first if you have browser tooling), 8 of 9 admin-managed entity CRUD paths (only Announcements was live-tested; the pattern is identical though), Contests end-to-end, a possible missing student-facing Certificates page.

**What bugs exist**: Just BUG-01 above, confirmed and reproducible. The historically-reported logout/login credential bug was specifically hunted for and could not be reproduced against the live backend across 3 cycles — if it resurfaces, suspect the **frontend** Redux `auth` slice / `AuthInitializer.jsx` client-side state handling rather than the backend, since that's the layer this audit could not observe directly (no browser).

**What should NOT be changed**: the layered backend architecture (routes→controllers→services→repositories→models) — it's consistently applied, don't introduce a different pattern in new code. The frontend's hook+service-per-feature convention (not Redux) for everything except `auth`/`theme` — this is deliberate, not an oversight, don't "fix" it by adding more Redux slices. The single shared Axios instance in `services/api.js` and its refresh-queue logic — don't create parallel HTTP clients. The `shared/algorithms/` package as the single source of truth for algorithm logic used by both frontend visualizers and backend problem/visualizer seeding.

**Important architectural conventions**: every route requires `authenticate` unless explicitly public (health, integration-status, the auth entry points themselves); admin routes are gated at the router level, not per-endpoint; API responses always follow `{success, message?, data}` / `{success:false, error:{message, details?}}` / `{success:false, comingSoon:true, service, message}` (HTTP 200) shapes — match these exactly in any new endpoint or the frontend's existing error-handling (`err.response?.data?.error?.message`) and `unwrapApiPayload`/`isComingSoonPayload` helpers won't work correctly against it.

**Important reusable components**: `components/ui/{Button,Card,ComingSoonPlaceholder}`, the Tailwind `@layer components` classes in `frontend/src/styles/index.css` (`.btn-*`, `.card-*`, `.stat-*`, `.badge`, `.empty-state*`, `.skeleton`, `.data-table*`), `BookmarkStatusContext` for batched bookmark-status lookups, `useVisualizerPlayer` for any new visualizer's playback state, `draftStorage.js` for the autosave-draft pattern used by Notes/Playground/Quizzes.

**Important database patterns**: soft-delete via `isDeleted` flags (Notes, PlaygroundSnippets) rather than hard delete; TTL index on `RefreshToken.expiresAt` for automatic session cleanup; `$setOnInsert` in the seed pipeline to keep bootstrap idempotent and non-destructive on every server restart — preserve this if you ever touch `seed/bootstrap.js`, it's what makes `BOOTSTRAP_ON_START=true` safe to leave on by default.

**What should be fixed first**: BUG-01 (cheap, high dev-experience impact), then get a real browser-testing pass done — that's the true unknown in this otherwise well-verified codebase.

**Dangerous areas where careless changes could break existing functionality**: `services/api.js`'s refresh-token interceptor (subtle single-flight-queue logic — easy to reintroduce a refresh-loop or race condition if "simplified"); `backend/src/utils/integrationStatus.js` (already has one subtle bug, has parallel Gemini/Judge0 logic that must stay in sync); `backend/src/seed/bootstrap.js` (idempotency is load-bearing — a naive edit could turn the safe "runs on every boot" default into a destructive one); anything touching the refresh-token cookie's `httpOnly`/`sameSite`/`path` settings (`auth.controller.js`) — these are finely tuned for the dev-proxy vs. prod-cross-origin split and easy to silently break one environment while fixing the other.

---

## Appendix A — Full API Route Inventory

*(Verbatim from the backend inventory sub-agent's direct read of every file in `backend/src/routes/`, cross-checked against `app.js` mount order. All paths prefixed `/api/v1`.)*

**`/health`** — `GET /` (public) → health/version status.

**`/integrations`** — `GET /status` (public) → `{gemini:{configured,status,label}, judge0:{...}}`.

**`/auth`** — rate-limited 5/min on register/login/forgot/reset:
- `POST /register`, `POST /login`, `POST /refresh` (reads cookie), `POST /logout`, `POST /forgot-password`, `POST /reset-password` (all public)
- `GET /me`, `POST /logout-all` (authenticated)

**`/dashboard`** — `GET /` (auth)

**`/topics`** (`learning.routes.js`, all auth): `GET /`, `GET /:slug`, `PATCH /:slug/progress`

**`/playground`** (all auth, run rate-limited 10/min): `GET /languages`, `POST /run`, `GET /history`, `GET/POST /snippets`, `GET/PATCH/DELETE /snippets/:id`

**`/problems`** (all auth, run/submit rate-limited): `GET /`, `GET /:slug`, `GET /:slug/submissions`, `POST /:slug/run`, `POST /:slug/submit`

**`/quizzes`** (all auth): `GET /`, `GET /:id`, `POST /:id/submit`, `GET /:id/attempts`, `GET /:id/attempts/:attemptId`

**`/ai`** (all auth, chat rate-limited 20/hr per-user): `GET/POST /conversations`, `GET/DELETE /conversations/:id`, `POST /chat`

**`/notes`** (all auth): `GET/POST /`, `GET/PATCH/DELETE /:id`

**`/progress`** — `GET /` (auth)
**`/gamification`** — `GET /` (auth)
**`/leaderboard`** — `GET /` (auth)

**`/contests`** (all auth; create requires ADMIN; run/submit rate-limited): `GET /`, `POST /` (admin), `GET /:slug`, `POST /:slug/register`, `GET /:slug/leaderboard`, `GET /:slug/problems/:problemSlug`, `POST /:slug/problems/:problemSlug/run`, `POST /:slug/problems/:problemSlug/submit`

**`/admin`** (all auth + ADMIN role, router-wide): full CRUD (list/get/create/update/delete/duplicate/bulk where applicable) for **users** (list/update only), **topics**, **problems**, **quizzes**, **contests**, **announcements**, **badges**, **visualizers**, **certificates**, plus **settings** (get/update), **daily-challenges** (list/create/update/delete), `GET /analytics`, `GET /export/:type` (CSV). Every mutation logged to `AuditLog`.

**`/notifications`** (all auth): `GET /unread-count`, `GET /`, `PATCH /read-all`, `DELETE /`, `PATCH /:id/read`, `PATCH /:id/unread`

**`/search`** (all auth): `GET /`, `GET /suggest`, `GET /history`, `DELETE /history`, `DELETE /history/:id`

**`/settings`** (all auth): `GET /`, `PATCH /preferences`, `PATCH /profile`, `PATCH /password`, `DELETE /account`

**`/bookmarks`** (all auth): `GET /`, `GET /status`, `POST /`, `DELETE /`, `DELETE /:id`

---

## Appendix B — Full Database Model Inventory

*(Verbatim summary from the backend inventory sub-agent's direct read of every file in `backend/src/models/`. 26 models total.)*

| Model | Key fields (abridged) | Refs |
|---|---|---|
| User | username/email(unique), passwordHash, role, profile{}, gamification{xp,level,coins,streak}, stats{}, preferences{}, isActive/isSuspended, loginAttempts/lockUntil, passwordResetToken/Expires | root entity |
| RefreshToken | userId, tokenHash, expiresAt(TTL), userAgent, ipAddress | → User |
| Topic | slug(unique), category, difficulty, status, content{...}, animationConfig, relatedProblems[], prerequisites[]/relatedTopicIds[]/suggestedTopicIds[] (self), navigation{}, quizId, xpReward | → Problem, Topic(self), Quiz, User |
| Problem | slug(unique), difficulty, tags[], testCases[], starterCode{10 langs}, referenceSolution, xpReward{easy/medium/hard} | → User |
| Submission | userId, problemId, type(problem/playground/contest), contestId, verdict, language, sourceCode | → User, Problem, Contest |
| Quiz | topicId, questions[](options,correctIndex,explanation), passingScore, xpReward | → Topic |
| QuizAttempt | userId, quizId, answers[], score, passed, xpAwarded | → User, Quiz |
| Note | userId, topicId, problemId, title, content, isDeleted | → User, Topic, Problem |
| Badge | slug(unique), criteria{type,threshold}, xpBonus | — |
| UserBadge | userId, badgeId, earnedAt (unique compound) | → User, Badge |
| DailyChallenge | date(unique), type(enum×7), target | — |
| DailyChallengeCompletion | userId, challengeId (unique compound), xpAwarded | → User, DailyChallenge |
| Contest | slug(unique), problemIds[], scoring{}, status, startTime/endTime | → Problem, User |
| ContestParticipant | contestId, userId (unique compound), score, penaltyMinutes, rank | → Contest, User |
| ContestSubmission | contestId, userId, problemId, submissionId, verdict, points | → Contest, User, Problem, Submission |
| Notification | userId, type(enum×5), read, data | → User |
| Announcement | title, content, isActive, priority, startsAt/expiresAt | → User(createdBy) |
| AITutorConversation | userId, messages[{role,content,timestamp}], context{} | → User |
| PlaygroundSnippet | userId, language, sourceCode, isDeleted | → User |
| UserProgress | userId, topicId (unique compound), status, progressPercent, xpAwarded | → User, Topic |
| AuditLog | adminId, action, entityType, entityId, metadata | → User |
| Bookmark | userId, targetType(topic/problem/quiz), targetId (polymorphic, unique compound) | → User |
| SearchHistory | userId, query (unique compound), lastSearchedAt | → User |
| Visualizer | algorithmId(unique), category, difficulty, animationConfig | — |
| Certificate | slug(unique), criteria{type,threshold,...}, xpBonus | — |
| PlatformSettings | key(unique, singleton 'global'), xpRules{}, coinRules{}, ranks[], levels[] | — |
