# Data Flow Diagram — ThinkStack

## Level 0 — Context Diagram

```mermaid
flowchart LR
    Student((Student))
    Admin((Admin))
    TS[ThinkStack Platform]
    Judge0[Judge0]
    Gemini[Gemini]
    Cloudinary[Cloudinary]
    Resend[Resend]
    MongoDB[(MongoDB)]

    Student <-->|Learning, Code, Quizzes| TS
    Admin <-->|Manage Content, Analytics| TS
    TS <-->|Read/Write Data| MongoDB
    TS -->|Execute Code| Judge0
    TS -->|AI Queries| Gemini
    TS -->|Upload Assets| Cloudinary
    TS -->|Send Email| Resend
```

## Level 1 — Major Processes

```mermaid
flowchart TB
    subgraph External
        User[User]
        DB[(MongoDB)]
        J0[Judge0]
        AI[Gemini]
    end

    subgraph ThinkStack
        P1[1.0 Authenticate User]
        P2[2.0 Deliver Learning Content]
        P3[3.0 Run Visualizer]
        P4[4.0 Execute Code]
        P5[5.0 Grade Submissions]
        P6[6.0 Assess Quizzes]
        P7[7.0 AI Tutoring]
        P8[8.0 Track Progress & Gamify]
        P9[9.0 Admin Management]
    end

    User --> P1
    P1 --> DB
    User --> P2
    P2 --> DB
    User --> P3
    P3 --> User
    User --> P4
    P4 --> J0
    P4 --> DB
    User --> P5
    P5 --> J0
    P5 --> DB
    P5 --> P8
    User --> P6
    P6 --> DB
    P6 --> P8
    User --> P7
    P7 --> AI
    P7 --> DB
    P8 --> DB
    User --> P9
    P9 --> DB
```

## Data Stores

| Store | Description |
|-------|-------------|
| D1: Users | User accounts, gamification, preferences |
| D2: Content | Topics, problems, quizzes |
| D3: Submissions | Code submissions and results |
| D4: Progress | Topic completion, quiz attempts |
| D5: Platform | Notifications, contests, badges |

## Key Data Flows

| Flow | Data | Direction |
|------|------|-----------|
| Login | credentials → tokens | User → P1 → D1 |
| Study topic | topicId → content | User → P2 → D2 |
| Submit code | source + language → verdict | User → P5 → J0 → D3 |
| Quiz submit | answers → score | User → P6 → D4 |
| AI question | prompt → response | User → P7 → AI → D1 |
| XP update | activity event → xp/level | P8 → D1 |
