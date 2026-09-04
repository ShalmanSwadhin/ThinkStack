# ThinkStack — Software Requirements Specification (SRS)

**Version:** 1.0.0  
**Date:** June 27, 2026  
**Project:** ThinkStack — Interactive Data Structures & Algorithms Learning Platform  
**Status:** Approved for Development

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) defines the functional and non-functional requirements for **ThinkStack**, a production-grade web platform that unifies learning materials, interactive algorithm visualizations, coding practice, quizzes, progress tracking, gamification, AI tutoring, and administrative tooling into a single educational experience.

### 1.2 Scope

ThinkStack targets computer science students, self-taught developers, and interview preparation learners. The platform delivers structured DSA curriculum, hands-on practice, visual learning aids, and measurable progress — suitable for a Final Year University Project and public deployment.

**In Scope:**
- User authentication and role-based access (Student, Admin)
- Learning module with 20+ DSA topics
- Interactive algorithm visualizer with step-by-step controls
- Code playground with multi-language Judge0 execution
- Coding problems with test cases and submissions
- Quiz system per topic
- AI tutor powered by Google Gemini
- Notes, bookmarks, and personal study tools
- Progress tracking, analytics, and streaks
- Gamification (XP, levels, badges, coins, daily challenges)
- Leaderboards and contests
- Admin dashboard for content and user management
- Notifications, search, and user settings
- Deployment to Vercel (frontend), Render (backend), MongoDB Atlas

**Out of Scope (v1.0):**
- Native mobile applications (responsive web only)
- Real-time collaborative coding (pair programming)
- Custom on-premise Judge0 deployment
- Payment/subscription billing
- Video lecture hosting (external links only)
- Multi-tenant institutional SSO (future enhancement)

### 1.3 Definitions & Acronyms

| Term | Definition |
|------|------------|
| DSA | Data Structures and Algorithms |
| JWT | JSON Web Token |
| RBAC | Role-Based Access Control |
| SRS | Software Requirements Specification |
| XP | Experience Points |
| API | Application Programming Interface |
| Judge0 | Third-party code execution API |
| Gemini | Google Generative AI API |

### 1.4 References

- IEEE 830-1998 — Recommended Practice for Software Requirements Specifications
- OWASP Top 10 Web Application Security Risks
- MongoDB Schema Design Best Practices
- React 18+ Official Documentation

### 1.5 Overview

This document is organized into: overall description, functional requirements, non-functional requirements, external interface requirements, and system constraints.

---

## 2. Overall Description

### 2.1 Product Perspective

ThinkStack is a standalone MERN-stack web application with external service integrations:

```
┌─────────────┐     HTTPS      ┌─────────────┐     REST      ┌──────────────┐
│   Browser   │ ◄────────────► │   Frontend  │ ◄───────────► │   Backend    │
│  (React)    │                │   (Vercel)  │               │   (Render)   │
└─────────────┘                └─────────────┘               └──────┬───────┘
                                                                    │
                    ┌───────────────────────────────────────────────┼───────────────┐
                    │                                               │               │
              ┌─────▼─────┐   ┌──────────┐   ┌──────────┐   ┌──────▼──────┐  ┌──────▼──────┐
              │ MongoDB   │   │ Cloudinary│   │  Judge0  │   │   Gemini    │  │   Resend    │
              │  Atlas    │   │ (Storage) │   │ (Compiler)│   │  (AI Tutor) │  │  (Email)    │
              └───────────┘   └──────────┘   └──────────┘   └─────────────┘  └─────────────┘
```

### 2.2 Product Functions (Summary)

1. **Authentication** — Register, login, refresh tokens, password reset, profile management
2. **Learning** — Structured curriculum with theory, examples, complexity, quizzes
3. **Visualization** — Interactive step-through algorithm animations
4. **Coding** — Playground and problem-solving with automated grading
5. **Assessment** — Quizzes with scoring and explanations
6. **AI Tutor** — Concept explanation, code review, hints, generated questions
7. **Progress** — Track completion, streaks, time spent, weak areas
8. **Gamification** — XP, levels, badges, coins, daily challenges
9. **Social/Competition** — Leaderboards and timed contests
10. **Administration** — CRUD for users, content, analytics, announcements
11. **Platform Services** — Search, notifications, settings, dark/light theme

### 2.3 User Classes

| Role | Description |
|------|-------------|
| **Guest** | Browse public landing page; limited preview content |
| **Student** | Full learning, practice, gamification, AI tutor access |
| **Admin** | Content management, user moderation, analytics, system config |

### 2.4 Operating Environment

- **Client:** Modern browsers (Chrome 100+, Firefox 100+, Safari 15+, Edge 100+)
- **Server:** Node.js 20 LTS on Render
- **Database:** MongoDB Atlas (M10+ recommended for production)
- **Network:** HTTPS everywhere; REST API over JSON

### 2.5 Design & Implementation Constraints

- MERN stack as specified (React/Vite frontend, Express backend, MongoDB)
- Third-party APIs: Judge0, Gemini, Cloudinary, Resend
- No API keys exposed on client; all secrets server-side
- Monorepo-style folder structure with shared types/constants
- Clean Architecture with MVC on backend, feature-based modules on frontend

### 2.6 Assumptions & Dependencies

- Users have stable internet connectivity
- Judge0 API availability for code execution (with rate limits and fallback messaging)
- Google Gemini API quota sufficient for AI tutor usage
- MongoDB Atlas cluster provisioned before deployment
- Cloudinary account for avatar and asset uploads

---

## 3. Functional Requirements

### 3.1 Authentication & Authorization (FR-AUTH)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AUTH-01 | System shall allow user registration with email, username, password | Must |
| FR-AUTH-02 | System shall validate email format and password strength (min 8 chars, mixed case, number) | Must |
| FR-AUTH-03 | System shall hash passwords using bcrypt (cost factor ≥ 12) | Must |
| FR-AUTH-04 | System shall authenticate users via JWT access token (15 min) + refresh token (7 days) | Must |
| FR-AUTH-05 | System shall support token refresh without re-login | Must |
| FR-AUTH-06 | System shall enforce RBAC: `student`, `admin` roles | Must |
| FR-AUTH-07 | System shall send password reset email via Resend | Should |
| FR-AUTH-08 | System shall rate-limit auth endpoints (5 req/min per IP) | Must |
| FR-AUTH-09 | System shall allow profile update (avatar via Cloudinary, bio, preferences) | Should |
| FR-AUTH-10 | System shall log out by invalidating refresh token | Must |

### 3.2 User Dashboard (FR-DASH)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-DASH-01 | Dashboard shall display learning progress overview (% complete per category) | Must |
| FR-DASH-02 | Dashboard shall show XP, level, streak, coins, recent activity | Must |
| FR-DASH-03 | Dashboard shall recommend next topic based on progress | Should |
| FR-DASH-04 | Dashboard shall display daily challenge widget | Must |
| FR-DASH-05 | Dashboard shall show recent submissions and quiz scores | Should |
| FR-DASH-06 | Dashboard shall be responsive (mobile, tablet, desktop) | Must |

### 3.3 Learning Module (FR-LEARN)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-LEARN-01 | System shall provide 20+ DSA topics as specified | Must |
| FR-LEARN-02 | Each topic shall include: intro, theory, real-world example, advantages, disadvantages, applications, animations, time/space complexity, common mistakes, interview questions, practice problems, summary, quiz link | Must |
| FR-LEARN-03 | Topics shall be organized by category and difficulty | Must |
| FR-LEARN-04 | User shall mark topics as complete/in-progress | Must |
| FR-LEARN-05 | Content shall support syntax-highlighted code examples | Must |
| FR-LEARN-06 | Admin shall CRUD learning topics via admin panel | Must |

**Topics (v1.0):** Arrays, Strings, Searching, Sorting, Recursion, Linked Lists, Stacks, Queues, Deques, Hash Tables, Heaps, Priority Queues, Trees, BST, AVL Trees, Red-Black Trees, Trie, Graphs, Dynamic Programming, Greedy, Backtracking, Bit Manipulation

### 3.4 Algorithm Visualizer (FR-VIZ)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-VIZ-01 | Visualizer shall support searching: Linear, Binary, Jump, Interpolation | Must |
| FR-VIZ-02 | Visualizer shall support sorting: Bubble, Selection, Insertion, Merge, Quick, Heap, Counting, Radix, Bucket, Shell | Must |
| FR-VIZ-03 | Visualizer shall support trees: BST, AVL, Trie, Heap | Must |
| FR-VIZ-04 | Visualizer shall support graphs: DFS, BFS, Dijkstra, Bellman-Ford, Floyd-Warshall, Prim, Kruskal, A* | Must |
| FR-VIZ-05 | Controls: Play, Pause, Resume, Next Step, Previous Step, Speed Slider | Must |
| FR-VIZ-06 | Data input: Random Data, Custom Data | Must |
| FR-VIZ-07 | Visual highlights for comparisons and swaps | Must |
| FR-VIZ-08 | Statistics panel (comparisons, swaps, time steps) | Must |
| FR-VIZ-09 | Visualizer shall use React Flow / Canvas for graph/tree rendering | Must |

### 3.5 Code Playground (FR-PLAY)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-PLAY-01 | Support languages: C, C++, Java, Python, JavaScript | Must |
| FR-PLAY-02 | Monaco Editor with syntax highlighting | Must |
| FR-PLAY-03 | Run code via Judge0 API with stdin/stdout consoles | Must |
| FR-PLAY-04 | Save, copy, download code snippets | Must |
| FR-PLAY-05 | Submission history per user | Must |
| FR-PLAY-06 | Execution timeout: 10 seconds default | Must |

### 3.6 Coding Problems (FR-PROB)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-PROB-01 | Problems with title, description, difficulty, tags, constraints, examples | Must |
| FR-PROB-02 | Hidden and public test cases | Must |
| FR-PROB-03 | Submit solution; run against all test cases via Judge0 | Must |
| FR-PROB-04 | Verdicts: Accepted, Wrong Answer, TLE, MLE, Runtime Error, Compile Error | Must |
| FR-PROB-05 | Filter/search by difficulty, topic, status | Must |
| FR-PROB-06 | Admin CRUD for problems and test cases | Must |

### 3.7 Quiz System (FR-QUIZ)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-QUIZ-01 | Multiple-choice quizzes linked to topics | Must |
| FR-QUIZ-02 | Timed and untimed modes | Should |
| FR-QUIZ-03 | Instant feedback with explanations | Must |
| FR-QUIZ-04 | Score persistence and XP reward on pass (≥70%) | Must |
| FR-QUIZ-05 | Admin CRUD for quiz questions | Must |

### 3.8 AI Tutor (FR-AI)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AI-01 | Chat interface powered by Google Gemini (server-side proxy) | Must |
| FR-AI-02 | Capabilities: explain concepts, complexity analysis, quiz generation, interview questions, code review, debug assistance, hints | Must |
| FR-AI-03 | Context-aware: current topic/problem injected into prompt | Should |
| FR-AI-04 | Rate limit: 20 messages/hour per user (configurable) | Must |
| FR-AI-05 | Chat history stored per user (last 50 sessions) | Should |
| FR-AI-06 | API keys never exposed to client | Must |

### 3.9 Notes (FR-NOTE)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-NOTE-01 | User-created notes linked to topics/problems | Must |
| FR-NOTE-02 | Rich text or Markdown support | Should |
| FR-NOTE-03 | Search and filter notes | Must |
| FR-NOTE-04 | CRUD operations for own notes | Must |

### 3.10 Progress Tracking (FR-PROG)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-PROG-01 | Track topic completion, problem solves, quiz scores | Must |
| FR-PROG-02 | Time spent per module (session tracking) | Should |
| FR-PROG-03 | Visual charts (Chart.js): progress over time, topic breakdown | Must |
| FR-PROG-04 | Weak area identification (low quiz scores, failed problems) | Should |
| FR-PROG-05 | Export progress summary (PDF/JSON) | Could |

### 3.11 Gamification (FR-GAME)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-GAME-01 | XP awarded for: topic complete, problem solved, quiz passed, daily login | Must |
| FR-GAME-02 | Level system: level = floor(sqrt(XP / 100)) | Must |
| FR-GAME-03 | Badges for milestones (first solve, 7-day streak, 100 problems, etc.) | Must |
| FR-GAME-04 | Coins earned/spent (future shop — earn only in v1.0) | Must |
| FR-GAME-05 | Daily challenges with bonus XP | Must |
| FR-GAME-06 | Learning streak (consecutive days with activity) | Must |

### 3.12 Leaderboards (FR-LEAD)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-LEAD-01 | Global leaderboard by XP (top 100) | Must |
| FR-LEAD-02 | Weekly/monthly leaderboard reset option | Should |
| FR-LEAD-03 | User rank display on profile | Must |

### 3.13 Contest System (FR-CONT)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-CONT-01 | Admin-created timed contests with problem set | Must |
| FR-CONT-02 | Live countdown and submission window enforcement | Must |
| FR-CONT-03 | Contest leaderboard (score + penalty time) | Must |
| FR-CONT-04 | ICPC-style scoring optional | Could |

### 3.14 Admin Dashboard (FR-ADMIN)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-ADMIN-01 | Manage users (view, suspend, change role) | Must |
| FR-ADMIN-02 | Manage courses/topics, problems, quizzes, contests | Must |
| FR-ADMIN-03 | Post announcements (banner + notification) | Must |
| FR-ADMIN-04 | Analytics: user growth, submissions, popular topics | Must |
| FR-ADMIN-05 | Export reports (CSV) | Should |

### 3.15 Notifications (FR-NOTIF)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-NOTIF-01 | In-app notification center | Must |
| FR-NOTIF-02 | Types: achievement, contest, announcement, streak reminder | Must |
| FR-NOTIF-03 | Mark read/unread; bulk clear | Must |
| FR-NOTIF-04 | Email notifications for password reset (via Resend) | Must |

### 3.16 Search (FR-SEARCH)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-SEARCH-01 | Global search across topics, problems, notes | Must |
| FR-SEARCH-02 | Autocomplete suggestions | Should |
| FR-SEARCH-03 | MongoDB text indexes for full-text search | Must |

### 3.17 Settings (FR-SET)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-SET-01 | Theme: dark/light mode (persisted) | Must |
| FR-SET-02 | Notification preferences | Should |
| FR-SET-03 | Code editor preferences (font size, tab size) | Should |
| FR-SET-04 | Account deletion (GDPR-style) | Should |

---

## 4. Non-Functional Requirements

### 4.1 Performance (NFR-PERF)

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-PERF-01 | API response time (p95) | < 300ms (excluding Judge0/Gemini) |
| NFR-PERF-02 | First Contentful Paint | < 2s on 4G |
| NFR-PERF-03 | Visualizer step transition | < 100ms |
| NFR-PERF-04 | Concurrent users supported | 500+ (with horizontal scaling on Render) |
| NFR-PERF-05 | Database queries use indexes | 100% on hot paths |

### 4.2 Security (NFR-SEC)

| ID | Requirement |
|----|-------------|
| NFR-SEC-01 | Helmet.js security headers on all responses |
| NFR-SEC-02 | CORS restricted to allowed origins |
| NFR-SEC-03 | Input validation via express-validator on all endpoints |
| NFR-SEC-04 | NoSQL injection prevention (mongo-sanitize) |
| NFR-SEC-05 | XSS prevention (sanitize user HTML, CSP headers) |
| NFR-SEC-06 | Rate limiting on auth, AI, and code execution endpoints |
| NFR-SEC-07 | Secrets in environment variables only |
| NFR-SEC-08 | HTTPS enforced in production |

### 4.3 Reliability & Availability (NFR-REL)

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-REL-01 | Uptime | 99.5% |
| NFR-REL-02 | Graceful degradation when Judge0/Gemini unavailable | Error messages, retry |
| NFR-REL-03 | Database backups | Daily (Atlas automated) |

### 4.4 Usability (NFR-USE)

| ID | Requirement |
|----|-------------|
| NFR-USE-01 | WCAG 2.1 AA accessibility baseline |
| NFR-USE-02 | Responsive design (320px – 2560px) |
| NFR-USE-03 | Consistent design system (spacing, typography, colors) |
| NFR-USE-04 | Loading states and error boundaries on all async operations |
| NFR-USE-05 | Keyboard navigation for visualizer controls |

### 4.5 Maintainability (NFR-MAIN)

| ID | Requirement |
|----|-------------|
| NFR-MAIN-01 | Modular feature-based architecture |
| NFR-MAIN-02 | 80%+ API endpoint test coverage |
| NFR-MAIN-03 | ESLint + Prettier enforced |
| NFR-MAIN-04 | OpenAPI/Swagger API documentation |
| NFR-MAIN-05 | Semantic versioning for releases |

### 4.6 Scalability (NFR-SCALE)

| ID | Requirement |
|----|-------------|
| NFR-SCALE-01 | Stateless backend for horizontal scaling |
| NFR-SCALE-02 | Pagination on all list endpoints (default limit 20) |
| NFR-SCALE-03 | Redis caching layer (Phase 2 enhancement) for leaderboards |
| NFR-SCALE-04 | CDN for static assets via Vercel |

---

## 5. External Interface Requirements

### 5.1 User Interfaces

- Landing page with feature highlights and CTA
- Auth pages (login, register, forgot password)
- Student dashboard with sidebar navigation
- Learning topic reader with table of contents
- Full-screen visualizer workspace
- Split-pane code editor (Monaco) with I/O consoles
- Problem detail + submission panel
- Quiz taking interface
- AI tutor chat drawer/page
- Admin panel with data tables and charts
- Settings and profile pages

### 5.2 Hardware Interfaces

None (web-only).

### 5.3 Software Interfaces

| Service | Purpose | Protocol |
|---------|---------|----------|
| MongoDB Atlas | Primary database | MongoDB Wire Protocol |
| Judge0 API | Code compilation/execution | REST |
| Google Gemini API | AI tutor | REST |
| Cloudinary | Image/asset storage | REST SDK |
| Resend | Transactional email | REST |

### 5.4 Communication Interfaces

- REST API over HTTPS (JSON request/response)
- JWT in Authorization header (`Bearer <token>`)
- Refresh token in HTTP-only secure cookie

---

## 6. Data Requirements

See `documentation/planning/DATABASE_DESIGN.md` and `documentation/diagrams/erd.md` for collection schemas, relationships, and indexes.

---

## 7. Acceptance Criteria (Release v1.0)

1. All **Must** priority functional requirements implemented and tested
2. Authentication flow complete with RBAC
3. At least 20 learning topics with full content structure
4. Visualizer supports all listed algorithms with controls
5. Playground executes code in 5 languages via Judge0
6. Minimum 50 coding problems with automated grading
7. AI tutor functional with server-side Gemini integration
8. Gamification and leaderboards operational
9. Admin dashboard manages all content types
10. Deployed to Vercel + Render + MongoDB Atlas with documentation
11. Unit, integration, and API tests passing in CI

---

*Document maintained by ThinkStack Engineering Team.*
