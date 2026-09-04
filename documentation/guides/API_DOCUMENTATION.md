# ThinkStack — API Documentation

**Version:** 1.0.0  
**Base URL:** `/api/v1`  
**OpenAPI spec:** [openapi.yaml](../openapi.yaml)

Import `documentation/openapi.yaml` into [Swagger Editor](https://editor.swagger.io), Postman, or Insomnia for interactive exploration.

---

## Overview

| Property | Value |
|----------|-------|
| Style | REST JSON |
| Auth | JWT Bearer + HTTP-only refresh cookie |
| Envelope | `{ success, message, data, meta }` |
| Errors | `{ success: false, error: { message, details } }` |
| Rate limits | Auth 5/min; code exec 10/min; AI 20/hour; global 100/15min (prod) |

---

## Authentication

### Flow

1. `POST /auth/register` or `POST /auth/login` → returns `accessToken` in body + `refreshToken` cookie.
2. Send `Authorization: Bearer <accessToken>` on protected routes.
3. On 401, `POST /auth/refresh` with cookie (no body) → new access token.
4. `POST /auth/logout` revokes refresh token and clears cookie.

### Cookie (production)

| Attribute | Value |
|-----------|-------|
| Name | `refreshToken` |
| Path | `/api/v1` |
| HttpOnly | `true` |
| Secure | `true` (production) |
| SameSite | `None` (cross-origin Vercel ↔ Render) |

Frontend must use `withCredentials: true` on Axios/fetch.

### Roles

| Role | Access |
|------|--------|
| `student` | All student routes |
| `admin` | Student routes + `/admin/*` |

---

## Endpoint index

### Public / health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | — | Service health |

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | — | Create account |
| POST | `/auth/login` | — | Login |
| POST | `/auth/refresh` | Cookie | Rotate tokens |
| POST | `/auth/logout` | Cookie | Logout |
| POST | `/auth/logout-all` | Bearer | Revoke all sessions |
| GET | `/auth/me` | Bearer | Current user |
| POST | `/auth/forgot-password` | — | Request reset email |
| POST | `/auth/reset-password` | — | Reset with token |

### Student modules

| Module | Base path | Key operations |
|--------|-----------|----------------|
| Dashboard | `/dashboard` | GET summary |
| Learning | `/topics` | List, read, progress |
| Playground | `/playground` | Run code, snippets, history |
| Problems | `/problems` | List, detail, run, submit |
| Quizzes | `/quizzes` | List, take, submit, attempts |
| AI Tutor | `/ai` | Conversations, chat |
| Notes | `/notes` | CRUD, search/filter |
| Progress | `/progress` | Aggregated stats |
| Gamification | `/gamification` | XP, badges, streak |
| Leaderboard | `/leaderboard` | Global/weekly ranks |
| Contests | `/contests` | Register, submit, leaderboard |
| Notifications | `/notifications` | List, read/unread, clear |
| Search | `/search` | Full search + suggest |
| Settings | `/settings` | Prefs, profile, password, delete |

### Admin (`admin` role required)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/analytics` | Platform metrics |
| GET | `/admin/export/:type` | CSV export (`users`, `submissions`) |
| GET/PATCH | `/admin/users` | User management |
| GET/POST/PATCH | `/admin/topics` | Topic CRUD |
| GET/POST/PATCH | `/admin/problems` | Problem CRUD |
| GET/PATCH | `/admin/quizzes` | Quiz management |
| GET/POST/PATCH | `/admin/contests` | Contest CRUD |
| GET/POST/PATCH | `/admin/announcements` | Announcements + notify |

---

## Common status codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Validation error (`error.details` array) |
| 401 | Unauthorized / invalid token |
| 403 | Forbidden (wrong role) |
| 404 | Resource not found |
| 409 | Conflict (duplicate email, etc.) |
| 429 | Rate limit exceeded |
| 500 | Server error |

---

## Example requests

### Register

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "student@example.com",
  "username": "student1",
  "password": "SecurePass123!",
  "displayName": "Student One"
}
```

### Authenticated request

```http
GET /api/v1/dashboard
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Search

```http
GET /api/v1/search?q=binary%20search
Authorization: Bearer ...
```

---

## External proxies (server-side only)

| Service | Used by | Env vars |
|---------|---------|----------|
| Judge0 | Playground, problems, contests | `JUDGE0_API_KEY`, `JUDGE0_MOCK` |
| Google Gemini | AI Tutor | `GEMINI_API_KEY`, `GEMINI_MOCK` |
| Resend | Password reset | `RESEND_API_KEY` |

API keys are never exposed to the frontend.

---

## Related

- [Deployment Guide](DEPLOYMENT.md)
- [Installation Guide](INSTALLATION.md)
- [Architecture](../planning/ARCHITECTURE.md)
