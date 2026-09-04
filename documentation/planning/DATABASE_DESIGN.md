# ThinkStack — Database Design

**Database:** MongoDB Atlas  
**ODM:** Mongoose 8

---

## 1. Design Principles

- **Embed** when data is read together and bounded (quiz questions in quiz, test cases in problem)
- **Reference** when data is shared or unbounded (user → submissions)
- **Denormalize** selectively for read performance (username on leaderboard entries)
- **Index** all query paths used in hot endpoints
- **Soft delete** for user-generated content (`isDeleted: true`)

---

## 2. Collections Overview

| Collection | Purpose | Est. Documents (Year 1) |
|------------|---------|-------------------------|
| `users` | Authentication, profile, gamification stats | 10K |
| `refreshtokens` | Refresh token rotation | 20K |
| `topics` | Learning module content | 25 |
| `problems` | Coding problems + test cases | 200 |
| `submissions` | Code submissions (playground + problems) | 500K |
| `quizzes` | Quiz definitions | 25 |
| `quizattempts` | User quiz results | 50K |
| `notes` | User notes | 30K |
| `badges` | Badge definitions | 30 |
| `userbadges` | Earned badges | 40K |
| `dailychallenges` | Daily challenge definitions | 365 |
| `dailychallengecompletions` | User completions | 100K |
| `contests` | Contest metadata | 50 |
| `contestparticipants` | Contest registrations + scores | 5K |
| `contestsubmissions` | Contest-specific submissions | 20K |
| `notifications` | In-app notifications | 200K |
| `announcements` | Platform announcements | 100 |
| `aitutorconversations` | AI chat sessions | 80K |
| `playgroundsnippets` | Saved playground code | 40K |
| `userprogress` | Topic completion tracking | 150K |
| `auditlogs` | Admin audit trail | 10K |

---

## 3. Schema Definitions

### 3.1 users

```javascript
{
  _id: ObjectId,
  username: String,          // unique, indexed
  email: String,             // unique, indexed
  passwordHash: String,
  role: Enum['student', 'admin'],  // default: 'student'
  profile: {
    displayName: String,
    avatar: String,          // Cloudinary URL
    bio: String,
    github: String,
    linkedin: String
  },
  gamification: {
    xp: Number,              // default: 0, indexed for leaderboard
    level: Number,           // computed, cached
    coins: Number,
    streak: {
      current: Number,
      longest: Number,
      lastActivityDate: Date
    }
  },
  stats: {
    problemsSolved: Number,
    topicsCompleted: Number,
    quizzesPassed: Number,
    totalSubmissions: Number
  },
  preferences: {
    theme: Enum['light', 'dark', 'system'],
    editorFontSize: Number,
    editorTabSize: Number,
    emailNotifications: Boolean
  },
  isActive: Boolean,
  isSuspended: Boolean,
  lastLoginAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:** `{ email: 1 }` unique, `{ username: 1 }` unique, `{ 'gamification.xp': -1 }`, `{ role: 1 }`

---

### 3.2 refreshtokens

```javascript
{
  _id: ObjectId,
  userId: ObjectId,          // ref: users, indexed
  tokenHash: String,
  expiresAt: Date,           // TTL index
  createdAt: Date,
  userAgent: String,
  ipAddress: String
}
```

**Indexes:** `{ userId: 1 }`, `{ expiresAt: 1 }` TTL

---

### 3.3 topics

```javascript
{
  _id: ObjectId,
  slug: String,              // unique, indexed
  title: String,
  category: Enum['fundamentals', 'linear', 'trees', 'graphs', 'advanced'],
  difficulty: Enum['beginner', 'intermediate', 'advanced'],
  order: Number,
  status: Enum['draft', 'published'],
  content: {
    introduction: String,
    theory: String,          // Markdown
    realWorldExample: String,
    advantages: [String],
    disadvantages: [String],
    applications: [String],
    timeComplexity: String,
    spaceComplexity: String,
    commonMistakes: [String],
    interviewQuestions: [{ question: String, answer: String }],
    summary: String,
    codeExamples: [{ language: String, code: String, explanation: String }]
  },
  animationConfig: { type: String, defaultParams: Object },
  relatedProblems: [ObjectId],  // ref: problems
  quizId: ObjectId,             // ref: quizzes
  estimatedMinutes: Number,
  xpReward: Number,
  tags: [String],
  searchText: String,        // denormalized for text index
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:** `{ slug: 1 }` unique, `{ category: 1, order: 1 }`, `{ status: 1 }`, text index on `{ title: 'text', searchText: 'text', tags: 'text' }`

---

### 3.4 problems

```javascript
{
  _id: ObjectId,
  slug: String,
  title: String,
  difficulty: Enum['easy', 'medium', 'hard'],
  tags: [String],
  topicSlugs: [String],
  description: String,       // Markdown
  constraints: String,
  examples: [{ input: String, output: String, explanation: String }],
  starterCode: { c: String, cpp: String, java: String, python: String, javascript: String },
  testCases: [{
    input: String,
    expectedOutput: String,
    isHidden: Boolean,
    weight: Number
  }],
  acceptanceRate: Number,
  totalSubmissions: Number,
  totalAccepted: Number,
  xpReward: { easy: 10, medium: 25, hard: 50 },
  status: Enum['draft', 'published'],
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:** `{ slug: 1 }` unique, `{ difficulty: 1 }`, `{ tags: 1 }`, `{ status: 1 }`, text on `{ title: 'text', description: 'text', tags: 'text' }`

---

### 3.5 submissions

```javascript
{
  _id: ObjectId,
  userId: ObjectId,          // indexed
  problemId: ObjectId,       // nullable (playground)
  type: Enum['problem', 'playground', 'contest'],
  contestId: ObjectId,
  language: String,
  sourceCode: String,
  stdin: String,
  stdout: String,
  stderr: String,
  verdict: Enum['accepted', 'wrong_answer', 'tle', 'mle', 'runtime_error', 'compile_error', 'pending'],
  executionTime: Number,     // ms
  memoryUsed: Number,        // KB
  testCasesPassed: Number,
  testCasesTotal: Number,
  judge0Token: String,
  createdAt: Date            // indexed desc
}
```

**Indexes:** `{ userId: 1, createdAt: -1 }`, `{ problemId: 1, userId: 1 }`, `{ contestId: 1, userId: 1 }`

---

### 3.6 quizzes

```javascript
{
  _id: ObjectId,
  topicId: ObjectId,
  title: String,
  passingScore: Number,      // default: 70
  timeLimitMinutes: Number,  // optional
  questions: [{
    question: String,
    options: [String],
    correctIndex: Number,
    explanation: String,
    difficulty: String
  }],
  xpReward: Number,
  status: Enum['draft', 'published'],
  createdAt: Date,
  updatedAt: Date
}
```

---

### 3.7 quizattempts

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  quizId: ObjectId,
  answers: [Number],
  score: Number,
  passed: Boolean,
  timeTakenSeconds: Number,
  createdAt: Date
}
```

**Indexes:** `{ userId: 1, quizId: 1 }` unique (one scored attempt per quiz, or allow retakes with compound)

---

### 3.8 Additional Collections (Summary)

- **notes:** `{ userId, topicId?, problemId?, title, content, tags, isDeleted, createdAt }`
- **badges:** `{ slug, name, description, icon, criteria, xpBonus }`
- **userbadges:** `{ userId, badgeId, earnedAt }` unique compound
- **dailychallenges:** `{ date, type, target, xpReward, description }`
- **notifications:** `{ userId, type, title, message, read, data, createdAt }`
- **contests:** `{ title, description, startTime, endTime, problemIds, status }`
- **aitutorconversations:** `{ userId, messages[], context, createdAt, updatedAt }`

---

## 4. Entity Relationship Diagram

See `documentation/diagrams/erd.md`

---

## 5. Index Strategy Summary

| Query Pattern | Index |
|---------------|-------|
| Login by email | `users.email` |
| Leaderboard top N | `users.gamification.xp` DESC |
| Topics by category | `topics.category + order` |
| Problems by difficulty + tag | `problems.difficulty`, `problems.tags` |
| User submission history | `submissions.userId + createdAt` |
| Global search | Text indexes on topics, problems |
| Notifications unread | `notifications.userId + read` |

---

## 6. Data Seeding Plan

1. Admin user (env-based bootstrap)
2. 22 learning topics with full content structure
3. 50+ coding problems across difficulties
4. 22 quizzes (one per topic)
5. 30 badge definitions
6. Sample daily challenges (7 days rolling)

---

*Schemas will be implemented as Mongoose models in Milestone 2.*
