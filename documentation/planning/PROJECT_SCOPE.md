# ThinkStack — Project Scope

**Version:** 1.0.0  
**Date:** June 27, 2026

---

## 1. Project Vision

Build a **production-ready**, unified DSA learning platform that combines the best aspects of LeetCode (coding practice), Visualgo (visualizations), GeeksforGeeks (structured theory), and AlgoExpert (guided learning) — enhanced with AI tutoring and gamification for modern learners.

---

## 2. Scope Boundaries

### 2.1 In Scope (v1.0 Release)

| Domain | Included Features |
|--------|-------------------|
| **Identity** | Registration, login, JWT auth, refresh tokens, RBAC (student/admin), profile |
| **Learning** | 22 DSA topics with full content template (theory → quiz) |
| **Visualization** | 30+ algorithms with interactive controls |
| **Coding** | Playground (5 languages) + 50+ graded problems |
| **Assessment** | MCQ quizzes per topic |
| **AI** | Gemini-powered tutor (explain, review, hint, generate) |
| **Engagement** | XP, levels, badges, coins, streaks, daily challenges |
| **Competition** | Global leaderboards + timed contests |
| **Admin** | User/content management, analytics, announcements |
| **Platform** | Search, notifications, notes, settings, dark/light theme |
| **Ops** | Deploy to Vercel/Render/Atlas, CI, tests, documentation |

### 2.2 Out of Scope (v1.0 — Future Roadmap)

| Feature | Reason |
|---------|--------|
| Mobile native apps | Web-responsive sufficient for FYP |
| Real-time pair programming | Complexity; WebSocket infrastructure |
| Video hosting | Use external embeds/links |
| Payment/subscriptions | Not required for educational FYP |
| Multi-language UI (i18n) | English only v1.0 |
| Custom Judge0 self-hosting | Use RapidAPI/hosted Judge0 |
| Institutional SSO/LMS integration | Future enterprise feature |
| Discussion forums / comments | Moderation overhead; v2.0 |
| Social following / friends | v2.0 enhancement |

### 2.3 Constraints

- **Timeline:** 20 milestones, sequential delivery
- **Team Model:** Single-repo, modular architecture (supports team extension)
- **Budget:** Free-tier friendly (Vercel, Render, Atlas M0/M2)
- **Quality Bar:** Production-ready, not prototype

---

## 3. Stakeholders

| Stakeholder | Interest |
|-------------|----------|
| Students (primary users) | Learn DSA effectively with visuals and practice |
| University evaluators | Demonstrate full SDLC, architecture, deployment |
| Admin/Faculty | Monitor progress, manage content, run contests |
| Portfolio reviewers | Assess code quality, scalability, UX |

---

## 4. Success Criteria

1. **Functional:** All P0 user stories implemented
2. **Technical:** Clean architecture, 80%+ API test coverage, security checklist passed
3. **UX:** Responsive, accessible, dark mode, professional dashboard
4. **Content:** 22 topics, 50+ problems, 30+ visualizer algorithms
5. **Deployment:** Public URL live on Vercel + Render
6. **Documentation:** SRS, API docs, deployment guide, UML diagrams complete

---

## 5. Module Scope Matrix

| Module | Frontend | Backend | Database | External APIs |
|--------|----------|---------|----------|---------------|
| Auth | ✅ | ✅ | users, refreshtokens | Resend |
| Dashboard | ✅ | ✅ | userprogress, aggregations | — |
| Learning | ✅ | ✅ | topics | — |
| Visualizer | ✅ | — | — | — |
| Playground | ✅ | ✅ | submissions, snippets | Judge0 |
| Problems | ✅ | ✅ | problems, submissions | Judge0 |
| Quizzes | ✅ | ✅ | quizzes, attempts | — |
| AI Tutor | ✅ | ✅ | conversations | Gemini |
| Notes | ✅ | ✅ | notes | — |
| Progress | ✅ | ✅ | userprogress, stats | — |
| Gamification | ✅ | ✅ | users, badges | — |
| Leaderboards | ✅ | ✅ | users (xp index) | — |
| Contests | ✅ | ✅ | contests, participants | Judge0 |
| Admin | ✅ | ✅ | all collections | — |
| Notifications | ✅ | ✅ | notifications | Resend (optional) |
| Search | ✅ | ✅ | text indexes | — |
| Settings | ✅ | ✅ | users.preferences | Cloudinary |

---

## 6. Assumptions

- Development environment: Node.js 20+, npm, Git, MongoDB Atlas account
- External API keys obtainable (Judge0, Gemini, Cloudinary, Resend)
- Target users primarily on desktop/laptop for coding; mobile for reading
- Content authored in Markdown with admin seeding + CMS-style editor

---

## 7. Deliverables Checklist

### Documentation
- [x] Software Requirements Specification
- [x] Architecture Document
- [x] Database Design
- [x] User Stories & Personas
- [x] Use Cases
- [x] Milestone Roadmap
- [ ] API Documentation (OpenAPI) — Milestone 20
- [ ] Installation Guide — Milestone 1
- [ ] Deployment Guide — Milestone 20
- [x] UML / Diagrams (initial set)

### Software
- [ ] Frontend application (React/Vite)
- [ ] Backend API (Express)
- [ ] Database schemas + seeds
- [ ] Test suites
- [ ] CI/CD pipeline
- [ ] Production deployment

---

*Scope changes require SRS version bump and roadmap adjustment.*
