# ThinkStack — Production Deployment Guide

Deploy ThinkStack to **Vercel** (frontend), **Render** (backend API), and **MongoDB Atlas** (database). This guide covers first-time setup, environment variables, seeding, smoke tests, and troubleshooting.

---

## Architecture Overview

```
User Browser
    │
    ├─ HTTPS ──► Vercel CDN (React SPA)
    │
    └─ HTTPS + credentials ──► Render (Express API /api/v1)
                                    │
                                    └─► MongoDB Atlas
                                    └─► Judge0 / Gemini / Resend (optional)
```

See also: [deployment-diagram.md](../diagrams/deployment-diagram.md)

| Component | Platform | URL pattern |
|-----------|----------|-------------|
| Frontend | Vercel | `https://your-app.vercel.app` |
| Backend API | Render | `https://thinkstack-api.onrender.com` |
| Database | MongoDB Atlas | `mongodb+srv://...` |

---

## Prerequisites

- GitHub repository connected to Vercel and Render
- [MongoDB Atlas](https://www.mongodb.com/atlas) M0+ cluster
- Node.js 20 locally (for seeding Atlas)
- Optional: [Judge0 RapidAPI](https://rapidapi.com/judge0-official/api/judge0-ce), [Google Gemini API key](https://aistudio.google.com/apikey), [Resend](https://resend.com) for email

---

## 1. MongoDB Atlas

### Create cluster

1. Create a free **M0** cluster (or M2+ for production traffic).
2. **Database Access** → Add user with `readWrite` on `thinkstack` database.
3. **Network Access** → Allow access:
   - Render: add `0.0.0.0/0` (Render uses dynamic outbound IPs on free tier), or use [Render static outbound IPs](https://render.com/docs/static-outbound-ip-addresses) on paid plans.
   - Your machine: add your IP for local seeding.

### Connection string

```
mongodb+srv://<user>:<password>@<cluster>.mongodb.net/thinkstack?retryWrites=true&w=majority
```

Store as `MONGODB_URI` on Render (never commit to git).

### Seed production database

From your local machine with Atlas URI:

```bash
# Point seed script at Atlas (one-time)
MONGODB_URI="mongodb+srv://..." npm run seed -w backend
```

This creates the admin user, 22 topics, 55 problems, quizzes, badges, and sample contests. Change the admin password immediately after first login.

Default seed admin (override via env):

| Field | Default |
|-------|---------|
| Email | `admin@thinkstack.dev` |
| Password | `ChangeMe123!` |

---

## 2. Render (Backend API)

### Option A — Blueprint (`render.yaml`)

The repo includes [`render.yaml`](../../render.yaml) at the project root. In Render:

1. **New** → **Blueprint** → Connect repository.
2. Set secret env vars when prompted (`MONGODB_URI`, `FRONTEND_URL`, API keys).
3. Deploy.

### Option B — Manual Web Service

| Setting | Value |
|---------|-------|
| Root Directory | *(leave empty — monorepo root)* |
| Build Command | `npm install` |
| Start Command | `npm run start -w backend` |
| Health Check Path | `/api/v1/health` |

### Backend environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `production` |
| `MONGODB_URI` | Yes | Atlas connection string |
| `JWT_ACCESS_SECRET` | Yes | Random 256-bit string (`openssl rand -base64 32`) |
| `JWT_REFRESH_SECRET` | Yes | Different random 256-bit string |
| `FRONTEND_URL` | Yes | Vercel URL, e.g. `https://thinkstack.vercel.app` (no trailing slash) |
| `JUDGE0_API_KEY` | For real grading | RapidAPI key |
| `JUDGE0_API_HOST` | If using Judge0 | `judge0-ce.p.rapidapi.com` |
| `JUDGE0_MOCK` | Dev fallback | `false` in production |
| `GEMINI_API_KEY` | For AI Tutor | Google AI Studio key |
| `GEMINI_MOCK` | Dev fallback | `false` in production |
| `GEMINI_MODEL` | Optional | Default `gemini-2.0-flash` |
| `RESEND_API_KEY` | For password reset email | Resend API key |
| `EMAIL_FROM` | Optional | `ThinkStack <noreply@yourdomain.com>` |
| `ADMIN_EMAIL` | Seed only | Admin bootstrap email |
| `ADMIN_PASSWORD` | Seed only | Strong password for seed admin |

### CORS and cookies

- `FRONTEND_URL` must exactly match the Vercel origin (scheme + host, no path).
- Refresh tokens use HTTP-only cookies on path `/api/v1` with `SameSite=None; Secure` in production so cross-origin requests from Vercel include the cookie.
- Frontend Axios is configured with `withCredentials: true`.

### Cold starts (free tier)

Render free tier spins down after inactivity. First request may take 30–60s. The frontend should show loading states; optional: use a cron ping service on `/api/v1/health`.

---

## 3. Vercel (Frontend)

### Project settings

| Setting | Value |
|---------|-------|
| Framework Preset | Vite |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `cd .. && npm install` |

`frontend/vercel.json` includes SPA rewrites so client-side routes work.

### Frontend environment variables

| Variable | Example | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `https://thinkstack-api.onrender.com/api/v1` | Render API base URL |
| `VITE_APP_NAME` | `ThinkStack` | App title |
| `VITE_CLOUDINARY_CLOUD_NAME` | *(optional)* | Media uploads |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | *(optional)* | Unsigned upload preset |

Redeploy after changing env vars (Vite bakes `VITE_*` at build time).

---

## 4. Post-deploy verification

### Automated smoke test

```bash
# API health + auth flow against production
API_URL=https://thinkstack-api.onrender.com/api/v1 npm run smoke

# Include frontend reachability check
API_URL=https://thinkstack-api.onrender.com/api/v1 \
FRONTEND_URL=https://thinkstack.vercel.app \
npm run smoke
```

### Manual checklist

- [ ] `GET /api/v1/health` returns `{ success: true, data: { status: "ok" } }`
- [ ] Register / login on Vercel URL; dashboard loads
- [ ] Refresh token works after 15 min (or force 401 → auto-refresh)
- [ ] Learn page lists topics (seed data)
- [ ] Playground runs code (Judge0 or mock)
- [ ] AI Tutor sends a message (Gemini or mock)
- [ ] Admin login → `/admin` accessible
- [ ] Logout clears session

---

## 5. CI/CD

GitHub Actions (`.github/workflows/ci.yml`) runs on push/PR to `main` and `develop`:

1. Lint frontend + backend
2. Build frontend
3. Run backend tests against MongoDB service container

Vercel and Render deploy independently via their Git integrations (connect the same GitHub repo). Recommended branch deploys:

| Branch | Vercel | Render |
|--------|--------|--------|
| `main` | Production | Production |
| `develop` | Preview | Staging (optional second service) |

---

## 6. Security checklist

- [ ] Unique `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` (never reuse dev secrets)
- [ ] Atlas user has least privilege (`readWrite` on `thinkstack` only)
- [ ] `ADMIN_PASSWORD` changed after seed
- [ ] Judge0 and Gemini keys only on Render (never in frontend env)
- [ ] `FRONTEND_URL` set to production Vercel URL only
- [ ] HTTPS enforced on both Vercel and Render (default)

---

## 7. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| CORS error in browser | `FRONTEND_URL` mismatch | Set exact Vercel URL on Render; redeploy |
| Login works but refresh fails | Cookie blocked | Ensure `SameSite=None`, `Secure`, `withCredentials: true` |
| 503 on first API call | Render cold start | Wait and retry; upgrade plan or health ping |
| Empty topics/problems | DB not seeded | Run `npm run seed` against Atlas URI |
| Judge0 timeouts | Rate limits / plan | Check RapidAPI quota; verify `JUDGE0_MOCK=false` |
| AI Tutor mock responses | Missing Gemini key | Set `GEMINI_API_KEY`, `GEMINI_MOCK=false` |

---

## 8. Local vs production

| Concern | Local | Production |
|---------|-------|------------|
| API URL | `http://localhost:5000/api/v1` | Render URL |
| MongoDB | `mongodb://localhost:27017/thinkstack` | Atlas |
| Cookies | `SameSite=Lax` | `SameSite=None; Secure` |
| Mock modes | `JUDGE0_MOCK=true`, `GEMINI_MOCK=true` | Real keys recommended |

---

## Related docs

- [Installation Guide](INSTALLATION.md) — local development
- [API Documentation](API_DOCUMENTATION.md) — OpenAPI reference
- [AI Tutor Setup](AI_TUTOR.md) — Gemini configuration
