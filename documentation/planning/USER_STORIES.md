# ThinkStack — User Stories

Format: **As a** [role], **I want** [action], **so that** [benefit].

Priority: **P0** (Must), **P1** (Should), **P2** (Could)

---

## Epic 1: Authentication & Onboarding

| ID | Story | Priority | Acceptance Criteria |
|----|-------|----------|---------------------|
| US-001 | As a **guest**, I want to **register with email and password**, so that **I can save my learning progress**. | P0 | Form validation; success redirects to dashboard; welcome email sent |
| US-002 | As a **student**, I want to **log in securely**, so that **I can access my account**. | P0 | JWT issued; invalid credentials show error; rate limited |
| US-003 | As a **student**, I want to **stay logged in via refresh tokens**, so that **I don't re-login every 15 minutes**. | P0 | Silent refresh on 401; redirect to login if refresh fails |
| US-004 | As a **student**, I want to **reset my password via email**, so that **I can recover my account**. | P1 | Email with secure token; token expires in 1 hour |
| US-005 | As a **student**, I want to **upload a profile avatar**, so that **I appear on leaderboards**. | P1 | Cloudinary upload; max 2MB; JPG/PNG only |

---

## Epic 2: Learning Module

| ID | Story | Priority | Acceptance Criteria |
|----|-------|----------|---------------------|
| US-010 | As a **student**, I want to **browse DSA topics by category**, so that **I can follow a structured path**. | P0 | Categories visible; progress badges on cards |
| US-011 | As a **student**, I want to **read comprehensive topic content**, so that **I understand theory before practice**. | P0 | All sections render; code blocks highlighted |
| US-012 | As a **student**, I want to **mark a topic complete**, so that **my progress is tracked**. | P0 | Checkbox persists; XP awarded once |
| US-013 | As a **student**, I want to **jump to practice problems from a topic**, so that **I can apply what I learned**. | P0 | Linked problems filtered by topic tag |
| US-014 | As an **admin**, I want to **create and edit topics**, so that **curriculum stays current**. | P0 | Rich editor; preview; publish/draft status |

---

## Epic 3: Algorithm Visualizer

| ID | Story | Priority | Acceptance Criteria |
|----|-------|----------|---------------------|
| US-020 | As a **student**, I want to **step through sorting algorithms**, so that **I see each comparison and swap**. | P0 | Play/pause/step controls work; highlights visible |
| US-021 | As a **student**, I want to **adjust animation speed**, so that **I can learn at my pace**. | P0 | Slider 0.5x–3x; persists during session |
| US-022 | As a **student**, I want to **input custom array data**, so that **I test edge cases**. | P0 | Validation for numeric input; error on invalid |
| US-023 | As a **student**, I want to **visualize graph algorithms on a graph**, so that **I understand traversal paths**. | P0 | Nodes/edges animate; visited nodes highlighted |
| US-024 | As a **student**, I want to **see operation statistics**, so that **I connect visuals to complexity**. | P0 | Comparison/swap/step counters update live |

---

## Epic 4: Code Playground & Problems

| ID | Story | Priority | Acceptance Criteria |
|----|-------|----------|---------------------|
| US-030 | As a **student**, I want to **write and run code in multiple languages**, so that **I practice in my preferred language**. | P0 | 5 languages; stdout/stderr displayed |
| US-031 | As a **student**, I want to **save playground snippets**, so that **I can revisit experiments**. | P0 | Named saves; list in sidebar |
| US-032 | As a **student**, I want to **submit solutions to problems**, so that **I get instant verdicts**. | P0 | All test cases run; verdict displayed |
| US-033 | As a **student**, I want to **filter problems by difficulty and topic**, so that **I find relevant practice**. | P0 | Filters combine; pagination works |
| US-034 | As an **admin**, I want to **add problems with test cases**, so that **students have fresh content**. | P0 | Hidden tests not visible to students |

---

## Epic 5: Quizzes & Assessment

| ID | Story | Priority | Acceptance Criteria |
|----|-------|----------|---------------------|
| US-040 | As a **student**, I want to **take a quiz after a topic**, so that **I verify understanding**. | P0 | MCQ interface; submit shows score |
| US-041 | As a **student**, I want to **see explanations for wrong answers**, so that **I learn from mistakes**. | P0 | Explanation shown per question |
| US-042 | As a **student**, I want to **earn XP for passing quizzes**, so that **I'm motivated to study**. | P0 | ≥70% = pass; XP credited once per quiz |

---

## Epic 6: AI Tutor

| ID | Story | Priority | Acceptance Criteria |
|----|-------|----------|---------------------|
| US-050 | As a **student**, I want to **ask the AI to explain a concept**, so that **I get personalized help**. | P0 | Response within 10s; markdown rendered |
| US-051 | As a **student**, I want to **paste code for review**, so that **I get improvement suggestions**. | P0 | Code block detected; feedback structured |
| US-052 | As a **student**, I want to **request a hint on a problem**, so that **I'm unstuck without full solution**. | P0 | Hint level 1–3; no full answer in hint 1 |
| US-053 | As a **student**, I want to **generate practice interview questions**, so that **I prepare for interviews**. | P1 | Questions relevant to current topic |

---

## Epic 7: Progress & Gamification

| ID | Story | Priority | Acceptance Criteria |
|----|-------|----------|---------------------|
| US-060 | As a **student**, I want to **see my XP and level**, so that **I feel progression**. | P0 | Level formula applied; progress bar to next level |
| US-061 | As a **student**, I want to **earn badges for milestones**, so that **achievements are recognized**. | P0 | Badge toast on unlock; profile shows all |
| US-062 | As a **student**, I want a **daily challenge**, so that **I maintain consistent practice**. | P0 | New challenge at midnight UTC; bonus XP |
| US-063 | As a **student**, I want to **track my learning streak**, so that **I'm motivated to return daily**. | P0 | Streak increments on activity; breaks on miss |
| US-064 | As a **student**, I want to **view progress charts**, so that **I see improvement over time**. | P1 | Chart.js line/bar charts on dashboard |

---

## Epic 8: Leaderboards & Contests

| ID | Story | Priority | Acceptance Criteria |
|----|-------|----------|---------------------|
| US-070 | As a **student**, I want to **see global XP leaderboard**, so that **I compare with peers**. | P0 | Top 100; my rank highlighted |
| US-071 | As a **student**, I want to **join a timed contest**, so that **I test skills under pressure**. | P1 | Countdown; submissions only during window |
| US-072 | As an **admin**, I want to **create contests with problem sets**, so that **I run class competitions**. | P1 | Start/end times enforced; leaderboard auto-generated |

---

## Epic 9: Admin & Platform

| ID | Story | Priority | Acceptance Criteria |
|----|-------|----------|---------------------|
| US-080 | As an **admin**, I want to **manage users**, so that **I can suspend abusive accounts**. | P0 | Role change; suspend toggle |
| US-081 | As an **admin**, I want to **view analytics**, so that **I understand platform usage**. | P0 | Charts: signups, submissions, active users |
| US-082 | As a **student**, I want to **search topics and problems**, so that **I find content quickly**. | P0 | Results in <500ms; relevance ranked |
| US-083 | As a **student**, I want to **receive notifications**, so that **I don't miss contests or achievements**. | P0 | Bell icon with unread count |
| US-084 | As a **student**, I want to **toggle dark/light theme**, so that **I study comfortably at night**. | P0 | Persists in localStorage + profile |

---

## Epic 10: Notes & Settings

| ID | Story | Priority | Acceptance Criteria |
|----|-------|----------|---------------------|
| US-090 | As a **student**, I want to **write notes on topics**, so that **I capture personal insights**. | P1 | Markdown editor; linked to topic |
| US-091 | As a **student**, I want to **configure editor settings**, so that **coding feels familiar**. | P2 | Font size, tab width saved |

---

## Story Point Summary (Planning)

| Epic | Stories | Est. Points |
|------|---------|-------------|
| Authentication | 5 | 21 |
| Learning | 5 | 34 |
| Visualizer | 5 | 55 |
| Playground & Problems | 5 | 42 |
| Quizzes | 3 | 13 |
| AI Tutor | 4 | 21 |
| Progress & Gamification | 5 | 21 |
| Leaderboards & Contests | 3 | 21 |
| Admin & Platform | 5 | 34 |
| Notes & Settings | 2 | 8 |
| **Total** | **42** | **~270** |
