import request from 'supertest';
import app from '../../src/app.js';
import { User, Topic, UserProgress } from '../../src/models/index.js';
import { TOPIC_CATEGORIES, DIFFICULTY } from 'shared/constants';
import { buildTopicContent } from '../../src/seed/data/topics.js';
import { connectTestDB, disconnectTestDB, describeIfDb } from '../helpers/db.js';

describeIfDb('Learning API', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await User.deleteMany({ email: /learntest/ });
    await Topic.deleteMany({ slug: /learntest/ });
    await UserProgress.deleteMany({});
  });

  const registerUser = async (suffix = '') => {
    const agent = request.agent(app);
    const payload = {
      username: `learntest_user${suffix}`,
      email: `learntest${suffix}@example.com`,
      password: 'TestPass1',
    };
    const res = await agent.post('/api/v1/auth/register').send(payload);
    return { agent, token: res.body.data.accessToken, userId: res.body.data.user.id };
  };

  const seedTopic = async (overrides = {}) =>
    Topic.create({
      slug: 'learntest-arrays',
      title: 'Test Arrays',
      category: TOPIC_CATEGORIES.FUNDAMENTALS,
      difficulty: DIFFICULTY.BEGINNER,
      order: 1,
      status: 'published',
      xpReward: 50,
      content: buildTopicContent('Test Arrays'),
      ...overrides,
    });

  it('requires authentication for topic list', async () => {
    const res = await request(app).get('/api/v1/topics');
    expect(res.status).toBe(401);
  });

  it('lists published topics grouped by category with progress', async () => {
    await seedTopic();
    await Topic.create({
      slug: 'learntest-stacks',
      title: 'Test Stacks',
      category: TOPIC_CATEGORIES.LINEAR,
      difficulty: DIFFICULTY.BEGINNER,
      order: 6,
      status: 'published',
      content: buildTopicContent('Test Stacks'),
    });

    const { agent, token } = await registerUser('_list');

    const res = await agent.get('/api/v1/topics').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.summary.total).toBe(2);
    expect(res.body.data.categories).toHaveLength(2);
    expect(res.body.data.categories[0].topics[0].progress.status).toBe('not_started');
  });

  it('returns topic detail and marks in progress on first view', async () => {
    await seedTopic();
    const { agent, token, userId } = await registerUser('_detail');

    const res = await agent
      .get('/api/v1/topics/learntest-arrays')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Test Arrays');
    expect(res.body.data.content.introduction).toBeDefined();
    expect(res.body.data.content.codeExamples.length).toBeGreaterThan(0);
    expect(res.body.data.progress.status).toBe('in_progress');
    expect(res.body.data.links.aiTutor).toBe('/ai-tutor?topic=learntest-arrays');

    const progress = await UserProgress.findOne({ userId, topicId: res.body.data.id });
    expect(progress.status).toBe('in_progress');
  });

  it('marks topic complete and awards XP once', async () => {
    const topic = await seedTopic();
    const { agent, token, userId } = await registerUser('_complete');

    const first = await agent
      .patch('/api/v1/topics/learntest-arrays/progress')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'completed' });

    expect(first.status).toBe(200);
    expect(first.body.data.progress.status).toBe('completed');
    expect(first.body.data.xpAwarded).toBe(50);
    expect(first.body.data.gamification.xp).toBe(50);

    const user = await User.findById(userId);
    expect(user.stats.topicsCompleted).toBe(1);

    const second = await agent
      .patch('/api/v1/topics/learntest-arrays/progress')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'completed' });

    expect(second.status).toBe(200);
    expect(second.body.data.xpAwarded).toBe(0);

    const userAfter = await User.findById(userId);
    expect(userAfter.gamification.xp).toBe(50);
    expect(userAfter.stats.topicsCompleted).toBe(1);
  });

  it('returns 404 for unknown topic slug', async () => {
    const { agent, token } = await registerUser('_404');

    const res = await agent
      .get('/api/v1/topics/does-not-exist')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
