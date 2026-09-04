/** User roles */
export const ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin',
};

/** Topic categories */
export const TOPIC_CATEGORIES = {
  FUNDAMENTALS: 'fundamentals',
  LINEAR: 'linear',
  TREES: 'trees',
  GRAPHS: 'graphs',
  ADVANCED: 'advanced',
};

/** Difficulty levels */
export const DIFFICULTY = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
};

/** Submission verdicts */
export const VERDICT = {
  ACCEPTED: 'accepted',
  WRONG_ANSWER: 'wrong_answer',
  TLE: 'tle',
  MLE: 'mle',
  RUNTIME_ERROR: 'runtime_error',
  COMPILE_ERROR: 'compile_error',
  PENDING: 'pending',
};

/** Supported programming languages (Judge0 IDs) */
export const LANGUAGES = {
  C: { id: 50, name: 'C', monaco: 'c' },
  CPP: { id: 54, name: 'C++', monaco: 'cpp' },
  JAVA: { id: 62, name: 'Java', monaco: 'java' },
  PYTHON: { id: 71, name: 'Python', monaco: 'python' },
  JAVASCRIPT: { id: 63, name: 'JavaScript', monaco: 'javascript' },
};

/** Gamification XP rewards */
export const XP_REWARDS = {
  TOPIC_COMPLETE: 50,
  QUIZ_PASS: 30,
  PROBLEM_EASY: 10,
  PROBLEM_MEDIUM: 25,
  PROBLEM_HARD: 50,
  DAILY_CHALLENGE: 20,
  DAILY_LOGIN: 5,
};

/** Coins earned alongside XP (earn-only in v1) */
export const COIN_REWARDS = {
  TOPIC_COMPLETE: 5,
  QUIZ_PASS: 3,
  PROBLEM_EASY: 1,
  PROBLEM_MEDIUM: 3,
  PROBLEM_HARD: 5,
  DAILY_CHALLENGE: 10,
  DAILY_LOGIN: 1,
  BADGE_DIVISOR: 10,
};

/** API response codes */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
};

/** Pagination defaults */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};
