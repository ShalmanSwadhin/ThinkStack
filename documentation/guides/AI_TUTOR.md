# ThinkStack — AI Tutor Setup

**Milestone 10** — Google Gemini integration via server-side proxy

---

## Overview

The AI Tutor uses **Google Gemini** through a backend proxy at `/api/v1/ai/*`. API keys never reach the browser.

| Feature | Detail |
|---------|--------|
| Chat UI | `/ai-tutor` |
| Context | Topic or problem injected via URL or request body |
| Rate limit | 20 messages/hour per user (configurable) |
| History | Last 50 conversations per user |
| Dev fallback | Mock responses when no API key is configured |

---

## 1. Get a Gemini API Key

1. Open [Google AI Studio](https://aistudio.google.com/apikey)
2. Create an API key for your project
3. Copy the key — keep it server-side only

---

## 2. Configure Backend Environment

In `backend/.env`:

```env
GEMINI_API_KEY=your-api-key-from-google-ai-studio
GEMINI_MODEL=gemini-2.0-flash
GEMINI_MOCK=false
AI_RATE_LIMIT_PER_HOUR=20
```

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Generative AI API key (required for real responses) |
| `GEMINI_MODEL` | Model id (default: `gemini-2.0-flash`) |
| `GEMINI_MOCK` | Set `true` to force mock responses even with a key |
| `AI_RATE_LIMIT_PER_HOUR` | Max chat messages per user per hour |

### Mock mode (no API key)

If `GEMINI_API_KEY` is empty and `GEMINI_MOCK=true` (default in dev), the tutor returns simulated responses. The UI shows a banner when mock mode is active.

---

## 3. Verify

1. Start the app: `npm run dev`
2. Log in and open **AI Tutor** (`/ai-tutor`)
3. Send a message — you should get a reply (mock or real)
4. With context: `/ai-tutor?topic=arrays` or `/ai-tutor?problem=sum-of-numbers`

---

## API Endpoints

All routes require authentication (`Bearer` token).

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/ai/conversations` | List conversations |
| POST | `/api/v1/ai/conversations` | Create empty conversation |
| GET | `/api/v1/ai/conversations/:id` | Get messages |
| DELETE | `/api/v1/ai/conversations/:id` | Delete conversation |
| POST | `/api/v1/ai/chat` | Send message, receive reply |

### Chat request example

```json
POST /api/v1/ai/chat
{
  "message": "Explain binary search step by step",
  "conversationId": "optional-existing-id",
  "context": {
    "topicSlug": "searching",
    "problemSlug": "binary-search-position"
  }
}
```

---

## Context Injection

The tutor enriches the system prompt when context is provided:

- **Topic** — title, category, difficulty, introduction (from learning module)
- **Problem** — title, description, constraints (from problems module)

Entry points in the app:

- Sidebar → **AI Tutor**
- Topic reader → **Ask AI Tutor** (`/ai-tutor?topic=<slug>`)
- Problem page → **Ask AI Tutor about this problem** (`/ai-tutor?problem=<slug>`)
- Dashboard quick link → **AI Tutor**

---

## Production (Render)

Set on your backend service:

- `GEMINI_API_KEY` — required
- `GEMINI_MOCK=false`
- `AI_RATE_LIMIT_PER_HOUR=20` (adjust as needed)

See [deployment-diagram.md](../diagrams/deployment-diagram.md) for full production env list.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Mock responses only | Add `GEMINI_API_KEY` and set `GEMINI_MOCK=false` |
| 503 AI tutor unavailable | Check API key validity and Gemini API status |
| Rate limit error | Wait up to 1 hour or raise `AI_RATE_LIMIT_PER_HOUR` for dev |
| Empty response | Try a shorter message; check backend logs |

---

See also: [INSTALLATION.md](./INSTALLATION.md) · [SRS FR-AI](../planning/SRS.md#38-ai-tutor-fr-ai)
