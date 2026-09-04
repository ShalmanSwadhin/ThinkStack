import request from 'supertest';
import app from '../../src/app.js';
import {
  User,
  Topic,
  DailyChallenge,
  UserProgress,
  Submission,
  Quiz,
  QuizAttempt,
  Problem,
} from '../../src/models/index.js';
import { TOPIC_CATEGORIES, VERDICT } from 'shared/constants';
import { connectTestDB, disconnectTestDB, describeIfDb } from '../helpers/db.js';

describeIfDb('Dashboard API', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await User.deleteMany({ email: /dashtest/ });
    await Topic.deleteMany({ slug: /dashtest/ });
    await DailyChallenge.deleteMany({});
    await UserProgress.deleteMany({});
    await Submission.deleteMany({});
    await QuizAttempt.deleteMany({});
    await Quiz.deleteMany({ title: /dashtest/ });
    await Problem.deleteMany({ slug: /dashtest/ });
  });

  const registerUser = async (suffix = '') => {
    const agent = request.agent(app);
    const payload = {
      username: `dashtest_user${suffix}`,
      email: `dashtest${suffix}@example.com`,
      password: 'TestPass1',
    };
    const res = await agent.post('/api/v1/auth/register').send(payload);
    return { agent, token: res.body.data.accessToken, userId: res.body.data.user.id };
  };

  it('requires authentication', async () => {
    const res = await request(app).get('/api/v1/dashboard');
    expect(res.status).toBe(401);
  });

  it('returns dashboard data for a new user', async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await Topic.create({
      slug: 'dashtest-arrays',
      title: 'Arrays Intro',
      category: TOPIC_CATEGORIES.FUNDAMENTALS,
      difficulty: 'beginner',
      order: 1,
      status: 'published',
    });

    await DailyChallenge.create({
      date: today,
      type: 'problem',
      target: { count: 1 },
      xpReward: 20,
      description: 'Solve one problem today',
      isActive: true,
    });

    const { agent, token } = await registerUser('_new');

    const res = await agent.get('/api/v1/dashboard').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.stats.xp).toBeDefined();
    expect(res.body.data.categoryProgress).toHaveLength(5);
    expect(res.body.data.dailyChallenge).toMatchObject({
      description: 'Solve one problem today',
      completed: false,
    });
    expect(res.body.data.recommendedTopic).toMatchObject({
      slug: 'dashtest-arrays',
      title: 'Arrays Intro',
    });
    expect(res.body.data.recentActivity).toEqual([]);
  });

  it('returns category progress and recent activity', async () => {
    const userDoc = await User.create({
      username: 'dashtest_progress',
      email: 'dashtest_progress@example.com',
      passwordHash: 'hash',
      stats: { topicsCompleted: 1, problemsSolved: 1, quizzesPassed: 1 },
    });

    const topic = await Topic.create({
      slug: 'dashtest-linked-list',
      title: 'Linked Lists',
      category: TOPIC_CATEGORIES.LINEAR,
      difficulty: 'beginner',
      order: 1,
      status: 'published',
    });

    await Topic.create({
      slug: 'dashtest-stack',
      title: 'Stacks',
      category: TOPIC_CATEGORIES.LINEAR,
      difficulty: 'beginner',
      order: 2,
      status: 'published',
    });

    await UserProgress.create({
      userId: userDoc._id,
      topicId: topic._id,
      status: 'completed',
      progressPercent: 100,
      completedAt: new Date(),
    });

    const problem = await Problem.create({
      slug: 'dashtest-two-sum',
      title: 'Two Sum Dash',
      difficulty: 'easy',
      topicSlugs: ['dashtest-linked-list'],
      status: 'published',
      description: 'Find two numbers',
      constraints: 'n >= 2',
      examples: [],
      testCases: [{ input: '1 2', expectedOutput: '3', isHidden: false }],
      starterCode: { javascript: 'function solve() {}' },
      tags: ['array'],
      createdBy: userDoc._id,
    });

    await Submission.create({
      userId: userDoc._id,
      problemId: problem._id,
      type: 'problem',
      language: 'javascript',
      sourceCode: 'console.log(1)',
      verdict: VERDICT.ACCEPTED,
    });

    const quiz = await Quiz.create({
      title: 'dashtest Arrays Quiz',
      topicId: topic._id,
      status: 'published',
      questions: [
        {
          question: 'What is an array?',
          options: ['A', 'B', 'C', 'D'],
          correctIndex: 0,
          explanation: 'Basic structure',
        },
      ],
      passingScore: 70,
      timeLimitMinutes: 10,
      xpReward: 30,
    });

    await QuizAttempt.create({
      userId: userDoc._id,
      quizId: quiz._id,
      answers: [0],
      score: 100,
      passed: true,
    });

    const tokenService = (await import('../../src/services/TokenService.js')).default;
    const accessToken = tokenService.generateAccessToken(userDoc);

    const res = await request(app)
      .get('/api/v1/dashboard')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);

    const linearProgress = res.body.data.categoryProgress.find(
      (item) => item.category === TOPIC_CATEGORIES.LINEAR
    );
    expect(linearProgress.completed).toBe(1);
    expect(linearProgress.total).toBe(2);
    expect(linearProgress.percentComplete).toBe(50);

    expect(res.body.data.recentActivity.length).toBeGreaterThanOrEqual(2);
    expect(res.body.data.recentActivity.some((item) => item.type === 'submission')).toBe(true);
    expect(res.body.data.recentActivity.some((item) => item.type === 'quiz')).toBe(true);
  });
});
