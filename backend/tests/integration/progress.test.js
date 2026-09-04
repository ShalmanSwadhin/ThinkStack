import request from 'supertest';
import app from '../../src/app.js';
import {
  User,
  Topic,
  UserProgress,
  Submission,
  Quiz,
  QuizAttempt,
  Problem,
} from '../../src/models/index.js';
import { TOPIC_CATEGORIES, VERDICT } from 'shared/constants';
import { buildTopicContent } from '../../src/seed/data/topics.js';
import { connectTestDB, disconnectTestDB, describeIfDb } from '../helpers/db.js';

describeIfDb('Progress API', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await User.deleteMany({ email: /progresstest/ });
    await Topic.deleteMany({ slug: /progresstest/ });
    await UserProgress.deleteMany({});
    await Submission.deleteMany({});
    await QuizAttempt.deleteMany({});
    await Quiz.deleteMany({ title: /progresstest/ });
    await Problem.deleteMany({ slug: /progresstest/ });
  });

  const registerUser = async (suffix = '') => {
    const agent = request.agent(app);
    const payload = {
      username: `progresstest_user${suffix}`,
      email: `progresstest${suffix}@example.com`,
      password: 'TestPass1',
    };
    const res = await agent.post('/api/v1/auth/register').send(payload);
    return { agent, token: res.body.data.accessToken, userId: res.body.data.user.id };
  };

  it('requires authentication', async () => {
    const res = await request(app).get('/api/v1/progress');
    expect(res.status).toBe(401);
  });

  it('returns progress overview for a new user', async () => {
    await Topic.create({
      slug: 'progresstest-arrays',
      title: 'Progress Arrays',
      category: TOPIC_CATEGORIES.FUNDAMENTALS,
      difficulty: 'beginner',
      order: 1,
      status: 'published',
      content: buildTopicContent('Progress Arrays'),
    });

    const { agent, token } = await registerUser('_new');

    const res = await agent.get('/api/v1/progress').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.overview.topicsTotal).toBeGreaterThanOrEqual(1);
    expect(res.body.data.categoryProgress).toHaveLength(5);
    expect(res.body.data.activityTimeline).toHaveLength(30);
    expect(res.body.data.timeByCategory).toHaveLength(5);
    expect(res.body.data.weakAreas).toBeDefined();
  });

  it('includes activity timeline and time spent data', async () => {
    const { agent, token, userId } = await registerUser('_activity');

    const topic = await Topic.create({
      slug: 'progresstest-graphs',
      title: 'Progress Graphs',
      category: TOPIC_CATEGORIES.GRAPHS,
      difficulty: 'intermediate',
      order: 1,
      status: 'published',
      content: buildTopicContent('Progress Graphs'),
    });

    await UserProgress.create({
      userId,
      topicId: topic._id,
      status: 'completed',
      progressPercent: 100,
      timeSpentMinutes: 25,
      completedAt: new Date(),
    });

    const res = await agent.get('/api/v1/progress').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.overview.totalTimeSpentMinutes).toBe(25);
    expect(res.body.data.timeByCategory.some((item) => item.minutes === 25)).toBe(true);

    const todayEntry = res.body.data.activityTimeline.find((item) => item.topicsCompleted > 0);
    expect(todayEntry).toBeDefined();
    expect(todayEntry.topicsCompleted).toBe(1);
  });

  it('detects weak areas for low quiz scores and unsolved problems', async () => {
    const { agent, token, userId } = await registerUser('_weak');

    const topic = await Topic.create({
      slug: 'progresstest-trees',
      title: 'Progress Trees',
      category: TOPIC_CATEGORIES.TREES,
      difficulty: 'intermediate',
      order: 1,
      status: 'published',
      content: buildTopicContent('Progress Trees'),
    });

    await UserProgress.create({
      userId,
      topicId: topic._id,
      status: 'in_progress',
      progressPercent: 50,
    });

    const quiz = await Quiz.create({
      title: 'progresstest Trees Quiz',
      topicId: topic._id,
      status: 'published',
      questions: [
        {
          question: 'What is a tree?',
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
      userId,
      quizId: quiz._id,
      answers: [1],
      score: 0,
      passed: false,
    });

    const problem = await Problem.create({
      slug: 'progresstest-unsolved',
      title: 'Unsolved Problem',
      difficulty: 'easy',
      topicSlugs: ['progresstest-trees'],
      status: 'published',
      description: 'Practice problem',
      constraints: 'n >= 1',
      examples: [],
      testCases: [{ input: '1', expectedOutput: '1', isHidden: false }],
      starterCode: { javascript: 'function solve() {}' },
      tags: ['tree'],
      createdBy: userId,
    });

    await Submission.create({
      userId,
      problemId: problem._id,
      type: 'problem',
      language: 'javascript',
      sourceCode: 'console.log(0)',
      verdict: VERDICT.WRONG_ANSWER,
    });

    const res = await agent.get('/api/v1/progress').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.weakAreas.topics.some((item) => item.slug === 'progresstest-trees')).toBe(
      true
    );
    expect(res.body.data.weakAreas.quizzes.some((item) => item.title.includes('Trees Quiz'))).toBe(
      true
    );
    expect(res.body.data.weakAreas.problems.some((item) => item.slug === 'progresstest-unsolved')).toBe(
      true
    );
  });

  it('records time spent via topic progress endpoint', async () => {
    await Topic.create({
      slug: 'progresstest-time',
      title: 'Time Tracking Topic',
      category: TOPIC_CATEGORIES.FUNDAMENTALS,
      difficulty: 'beginner',
      order: 1,
      status: 'published',
      content: buildTopicContent('Time Tracking Topic'),
    });

    const { agent, token, userId } = await registerUser('_time');

    const res = await agent
      .patch('/api/v1/topics/progresstest-time/progress')
      .set('Authorization', `Bearer ${token}`)
      .send({ addMinutes: 10 });

    expect(res.status).toBe(200);

    const progress = await UserProgress.findOne({ userId });
    expect(progress.timeSpentMinutes).toBe(10);
  });
});
