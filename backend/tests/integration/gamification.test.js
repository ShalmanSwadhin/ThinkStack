import request from 'supertest';
import app from '../../src/app.js';
import {
  User,
  Topic,
  Badge,
  UserBadge,
  DailyChallenge,
  DailyChallengeCompletion,
  Problem,
} from '../../src/models/index.js';
import { TOPIC_CATEGORIES } from 'shared/constants';
import { buildTopicContent } from '../../src/seed/data/topics.js';
import { connectTestDB, disconnectTestDB, describeIfDb } from '../helpers/db.js';

describeIfDb('Gamification API', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await User.deleteMany({ email: /gametest/ });
    await Topic.deleteMany({ slug: /gametest/ });
    await UserBadge.deleteMany({});
    await DailyChallengeCompletion.deleteMany({});
    await DailyChallenge.deleteMany({});
    await Problem.deleteMany({ slug: /gametest/ });
  });

  const registerUser = async (suffix = '') => {
    const agent = request.agent(app);
    const payload = {
      username: `gametest_user${suffix}`,
      email: `gametest${suffix}@example.com`,
      password: 'TestPass1',
    };
    const res = await agent.post('/api/v1/auth/register').send(payload);
    return { agent, token: res.body.data.accessToken, userId: res.body.data.user.id };
  };

  const seedBadge = async () => {
    await Badge.findOneAndUpdate(
      { slug: 'first-topic' },
      {
        slug: 'first-topic',
        name: 'First Steps',
        description: 'Complete your first topic',
        icon: '📖',
        criteria: { type: 'topics_completed', threshold: 1 },
        xpBonus: 20,
        isActive: true,
      },
      { upsert: true, new: true }
    );
  };

  it('requires authentication', async () => {
    const res = await request(app).get('/api/v1/gamification');
    expect(res.status).toBe(401);
  });

  it('returns gamification profile with level progress and badges', async () => {
    await seedBadge();
    const { agent, token } = await registerUser('_profile');

    const res = await agent.get('/api/v1/gamification').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.levelProgress.currentLevel).toBe(0);
    expect(res.body.data.badges.available.length).toBeGreaterThan(0);
    expect(res.body.data.gamification.coins).toBeDefined();
  });

  it('awards badge and coins when completing first topic', async () => {
    await seedBadge();
    await Topic.create({
      slug: 'gametest-arrays',
      title: 'Gamification Arrays',
      category: TOPIC_CATEGORIES.FUNDAMENTALS,
      difficulty: 'beginner',
      order: 1,
      status: 'published',
      xpReward: 50,
      content: buildTopicContent('Gamification Arrays'),
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await DailyChallenge.create({
      date: today,
      type: 'topic',
      target: { count: 1 },
      xpReward: 20,
      description: 'Complete a topic today',
      isActive: true,
    });

    const { agent, token } = await registerUser('_topic');

    const completeRes = await agent
      .patch('/api/v1/topics/gametest-arrays/progress')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'completed' });

    expect(completeRes.status).toBe(200);
    expect(completeRes.body.data.xpAwarded).toBe(50);
    expect(completeRes.body.data.newBadges?.length).toBeGreaterThan(0);
    expect(completeRes.body.data.dailyChallengeCompleted).toBe(true);
    expect(completeRes.body.data.coinsEarned).toBeGreaterThan(0);

    const profile = await agent
      .get('/api/v1/gamification')
      .set('Authorization', `Bearer ${token}`);

    expect(profile.body.data.badges.earnedCount).toBeGreaterThan(0);
    expect(profile.body.data.dailyChallenge.completed).toBe(true);

    const completionCount = await DailyChallengeCompletion.countDocuments({});
    expect(completionCount).toBe(1);
  });

  it('updates streak on login', async () => {
    const { agent, token } = await registerUser('_streak');

    await agent.post('/api/v1/auth/login').send({
      email: 'gametest_streak@example.com',
      password: 'TestPass1',
    });

    const profile = await agent
      .get('/api/v1/gamification')
      .set('Authorization', `Bearer ${token}`);

    expect(profile.body.data.gamification.streak.current).toBeGreaterThanOrEqual(1);
  });

  it('awards problem-solving coins on first accept', async () => {
    const { agent, token, userId } = await registerUser('_coins');

    await Problem.create({
      slug: 'gametest-easy',
      title: 'Easy Gamification Problem',
      difficulty: 'easy',
      topicSlugs: ['gametest-arrays'],
      status: 'published',
      description: 'Return sum',
      constraints: '',
      examples: [{ input: '1 2', output: '3' }],
      testCases: [{ input: '1 2', expectedOutput: '3', isHidden: false }],
      starterCode: { python: 'print(3)' },
      tags: ['array'],
      createdBy: userId,
    });

    const submitRes = await agent
      .post('/api/v1/problems/gametest-easy/submit')
      .set('Authorization', `Bearer ${token}`)
      .send({ language: 'python', sourceCode: 'print(3)' });

    expect(submitRes.status).toBe(200);
    expect(submitRes.body.data.coinsEarned).toBeGreaterThan(0);

    const profile = await agent
      .get('/api/v1/gamification')
      .set('Authorization', `Bearer ${token}`);

    expect(profile.body.data.stats.problemsSolved).toBe(1);
  });
});
