# Entity Relationship Diagram — ThinkStack

```mermaid
erDiagram
    USERS ||--o{ REFRESH_TOKENS : has
    USERS ||--o{ SUBMISSIONS : makes
    USERS ||--o{ QUIZ_ATTEMPTS : takes
    USERS ||--o{ NOTES : writes
    USERS ||--o{ USER_BADGES : earns
    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ USER_PROGRESS : tracks
    USERS ||--o{ PLAYGROUND_SNIPPETS : saves
    USERS ||--o{ AI_CONVERSATIONS : chats
    USERS ||--o{ CONTEST_PARTICIPANTS : joins

    TOPICS ||--o| QUIZZES : has
    TOPICS ||--o{ USER_PROGRESS : completed_in
    TOPICS }o--o{ PROBLEMS : related

    PROBLEMS ||--o{ SUBMISSIONS : receives

    QUIZZES ||--o{ QUIZ_ATTEMPTS : attempted

    BADGES ||--o{ USER_BADGES : awarded

    CONTESTS ||--o{ CONTEST_PARTICIPANTS : includes
    CONTESTS }o--o{ PROBLEMS : contains
    CONTESTS ||--o{ CONTEST_SUBMISSIONS : scores

    DAILY_CHALLENGES ||--o{ DAILY_COMPLETIONS : completed_by

    USERS {
        ObjectId _id PK
        string email UK
        string username UK
        string passwordHash
        string role
        object gamification
        object stats
        object preferences
    }

    TOPICS {
        ObjectId _id PK
        string slug UK
        string title
        string category
        string difficulty
        object content
        ObjectId quizId FK
    }

    PROBLEMS {
        ObjectId _id PK
        string slug UK
        string title
        string difficulty
        array testCases
        object starterCode
    }

    SUBMISSIONS {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId problemId FK
        string language
        string verdict
        datetime createdAt
    }

    QUIZZES {
        ObjectId _id PK
        ObjectId topicId FK
        array questions
        number passingScore
    }

    CONTESTS {
        ObjectId _id PK
        string title
        datetime startTime
        datetime endTime
        array problemIds
    }
```

## Relationship Notes

| Relationship | Type | Description |
|--------------|------|-------------|
| User → Submissions | 1:N | User can have many code submissions |
| Topic → Quiz | 1:1 | Each topic has one associated quiz |
| Topic → Problems | N:M | Topics link to related practice problems |
| User → UserProgress | 1:N | One progress record per topic per user |
| Contest → Problems | N:M | Contest includes subset of problems |
| Badge → UserBadges | 1:N | Badge definition; many users can earn same badge |
