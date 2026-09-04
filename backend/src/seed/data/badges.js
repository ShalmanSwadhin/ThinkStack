/**
 * 100+ achievement badges for the ThinkStack gamification system.
 */
const BADGE_ICONS = ['🏅', '🎯', '⭐', '🔥', '💎', '🧠', '📚', '🎓', '🏆', '⚡', '🥇', '📊', '✅', '🔴', '🟡', '🟢'];

function badge(slug, name, description, type, threshold, xpBonus, category = 'general') {
  return {
    slug,
    name,
    description,
    icon: BADGE_ICONS[slug.length % BADGE_ICONS.length],
    criteria: { type, threshold },
    xpBonus,
    category,
    isActive: true,
    status: 'published',
  };
}

const CORE_BADGES = [
  badge('first-login', 'Welcome Aboard', 'Log in for the first time', 'login', 1, 10, 'onboarding'),
  badge('first-topic', 'First Steps', 'Complete your first lesson', 'topics_completed', 1, 20, 'learning'),
  badge('five-topics', 'Knowledge Seeker', 'Complete 5 lessons', 'topics_completed', 5, 50, 'learning'),
  badge('ten-topics', 'Dedicated Learner', 'Complete 10 lessons', 'topics_completed', 10, 100, 'learning'),
  badge('twenty-five-topics', 'Quarter Scholar', 'Complete 25 lessons', 'topics_completed', 25, 150, 'learning'),
  badge('fifty-topics', 'Halfway Hero', 'Complete 50 lessons', 'topics_completed', 50, 250, 'learning'),
  badge('hundred-topics', 'Century Scholar', 'Complete 100 lessons', 'topics_completed', 100, 400, 'learning'),
  badge('two-hundred-topics', 'Double Century', 'Complete 200 lessons', 'topics_completed', 200, 600, 'learning'),
  badge('all-topics', 'DSA Master', 'Complete all curriculum lessons', 'topics_completed', 500, 1000, 'learning'),
  badge('first-problem', 'Problem Solver', 'Solve your first problem', 'problems_solved', 1, 15, 'practice'),
  badge('ten-problems', 'Code Warrior', 'Solve 10 problems', 'problems_solved', 10, 50, 'practice'),
  badge('twenty-five-problems', 'Algorithm Apprentice', 'Solve 25 problems', 'problems_solved', 25, 100, 'practice'),
  badge('fifty-problems', 'Century Coder', 'Solve 50 problems', 'problems_solved', 50, 200, 'practice'),
  badge('hundred-problems', 'Grind Master', 'Solve 100 problems', 'problems_solved', 100, 400, 'practice'),
  badge('two-hundred-problems', 'Problem Crusher', 'Solve 200 problems', 'problems_solved', 200, 700, 'practice'),
  badge('three-hundred-problems', 'Problem Legend', 'Solve 300 problems', 'problems_solved', 300, 1000, 'practice'),
  badge('first-quiz', 'Quiz Taker', 'Pass your first quiz', 'quizzes_passed', 1, 15, 'assessment'),
  badge('five-quizzes', 'Quiz Champion', 'Pass 5 quizzes', 'quizzes_passed', 5, 50, 'assessment'),
  badge('twenty-five-quizzes', 'Quiz Expert', 'Pass 25 quizzes', 'quizzes_passed', 25, 150, 'assessment'),
  badge('fifty-quizzes', 'Quiz Master', 'Pass 50 quizzes', 'quizzes_passed', 50, 300, 'assessment'),
  badge('streak-3', 'On a Roll', 'Maintain a 3-day streak', 'streak', 3, 30, 'engagement'),
  badge('streak-7', 'Week Warrior', 'Maintain a 7-day streak', 'streak', 7, 70, 'engagement'),
  badge('streak-14', 'Fortnight Focus', 'Maintain a 14-day streak', 'streak', 14, 120, 'engagement'),
  badge('streak-30', 'Unstoppable', 'Maintain a 30-day streak', 'streak', 30, 300, 'engagement'),
  badge('streak-60', 'Iron Will', 'Maintain a 60-day streak', 'streak', 60, 500, 'engagement'),
  badge('streak-100', 'Centurion Streak', 'Maintain a 100-day streak', 'streak', 100, 800, 'engagement'),
  badge('level-5', 'Rising Star', 'Reach level 5', 'level', 5, 50, 'progression'),
  badge('level-10', 'Expert', 'Reach level 10', 'level', 10, 150, 'progression'),
  badge('level-20', 'Legend', 'Reach level 20', 'level', 20, 500, 'progression'),
  badge('level-30', 'Grandmaster', 'Reach level 30', 'level', 30, 800, 'progression'),
  badge('first-easy', 'Easy Pickings', 'Solve an easy problem', 'easy_solved', 1, 10, 'difficulty'),
  badge('ten-easy', 'Easy Ten', 'Solve 10 easy problems', 'easy_solved', 10, 40, 'difficulty'),
  badge('fifty-easy', 'Easy Fifty', 'Solve 50 easy problems', 'easy_solved', 50, 150, 'difficulty'),
  badge('first-medium', 'Middle Ground', 'Solve a medium problem', 'medium_solved', 1, 25, 'difficulty'),
  badge('twenty-five-medium', 'Medium Master', 'Solve 25 medium problems', 'medium_solved', 25, 120, 'difficulty'),
  badge('first-hard', 'Hard Mode', 'Solve a hard problem', 'hard_solved', 1, 50, 'difficulty'),
  badge('ten-hard', 'Hard Ten', 'Solve 10 hard problems', 'hard_solved', 10, 200, 'difficulty'),
  badge('visualizer-user', 'Visual Learner', 'Use the visualizer 10 times', 'visualizer_sessions', 10, 30, 'tools'),
  badge('visualizer-50', 'Animation Ace', 'Use the visualizer 50 times', 'visualizer_sessions', 50, 100, 'tools'),
  badge('ai-curious', 'AI Curious', 'Ask the AI tutor 5 questions', 'ai_messages', 5, 25, 'tools'),
  badge('ai-power-user', 'AI Power User', 'Ask the AI tutor 50 questions', 'ai_messages', 50, 150, 'tools'),
  badge('note-taker', 'Note Taker', 'Create 5 notes', 'notes_created', 5, 20, 'tools'),
  badge('note-master', 'Note Master', 'Create 25 notes', 'notes_created', 25, 80, 'tools'),
  badge('contest-participant', 'Contestant', 'Join your first contest', 'contests_joined', 1, 40, 'contests'),
  badge('contest-10', 'Regular Competitor', 'Join 10 contests', 'contests_joined', 10, 150, 'contests'),
  badge('contest-winner', 'Champion', 'Finish 1st in a contest', 'contest_wins', 1, 200, 'contests'),
  badge('leaderboard-top-100', 'Top 100', 'Reach top 100 on leaderboard', 'leaderboard_rank', 100, 100, 'social'),
  badge('leaderboard-top-10', 'Elite Ten', 'Reach top 10 on leaderboard', 'leaderboard_rank', 10, 300, 'social'),
  badge('daily-challenge-7', 'Challenge Accepted', 'Complete 7 daily challenges', 'daily_challenges', 7, 70, 'engagement'),
  badge('daily-challenge-30', 'Monthly Grinder', 'Complete 30 daily challenges', 'daily_challenges', 30, 250, 'engagement'),
  badge('xp-1000', 'XP Collector', 'Earn 1000 total XP', 'total_xp', 1000, 100, 'progression'),
  badge('xp-5000', 'XP Hoarder', 'Earn 5000 total XP', 'total_xp', 5000, 300, 'progression'),
  badge('xp-10000', 'XP Legend', 'Earn 10000 total XP', 'total_xp', 10000, 600, 'progression'),
];

const MODULE_BADGES = [
  'intro-to-programming', 'variables-data-types', 'arrays-fundamentals', 'complexity-analysis',
  'searching-algorithms', 'sorting-algorithms', 'linked-lists', 'stacks-queues',
  'trees-fundamentals', 'graphs-fundamentals', 'dynamic-programming', 'backtracking',
  'graph-traversal', 'shortest-path-algorithms', 'string-algorithms-advanced', 'interview-prep-mastery',
].flatMap((mod, i) => [
  badge(
    `module-${mod}-started`,
    `${titleCase(mod)} Explorer`,
    `Start learning in the ${titleCase(mod)} module`,
    'module_started',
    1,
    20 + i * 5,
    'modules'
  ),
  badge(
    `module-${mod}-complete`,
    `${titleCase(mod)} Graduate`,
    `Complete all lessons in ${titleCase(mod)}`,
    'module_completed',
    1,
    50 + i * 10,
    'modules'
  ),
]);

const CATEGORY_BADGES = ['fundamentals', 'linear', 'trees', 'graphs', 'advanced'].flatMap((cat, i) => [
  badge(`category-${cat}-10`, `${titleCase(cat)} Initiate`, `Complete 10 ${cat} lessons`, 'category_lessons', 10 + i * 5, 60 + i * 20, 'categories'),
  badge(`category-${cat}-50`, `${titleCase(cat)} Expert`, `Complete 50 ${cat} lessons`, 'category_lessons', 50 + i * 5, 200 + i * 50, 'categories'),
]);

const MILESTONE_BADGES = Array.from({ length: 20 }, (_, i) => {
  const n = (i + 1) * 5;
  return badge(
    `milestone-lesson-${n}`,
    `Lesson ${n} Complete`,
    `Complete ${n} lessons in the curriculum`,
    'topics_completed',
    n,
    10 + n * 2,
    'milestones'
  );
});

function titleCase(slug) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export const BADGES = [...CORE_BADGES, ...MODULE_BADGES, ...CATEGORY_BADGES, ...MILESTONE_BADGES];

export default BADGES;
