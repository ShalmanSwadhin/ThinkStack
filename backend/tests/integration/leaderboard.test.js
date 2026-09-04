import request from 'supertest';
import app from '../../src/app.js';
import {
  User,
  Topic,
  UserProgress,
  Badge,
  UserBadge,
} from '../../src/models/index.js';
import { TOPIC_CATEGORIES } from 'shared/constants';
import { buildTopicContent } from '../../src/seed/data/topics.js';
import userRepository from '../../src/repositories/UserRepository.js';
import { connectTestDB, disconnectTestDB, describeIfDb } from '../helpers/db.js';

describeIfDb('Leaderboard API', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await User.deleteMany({ email: /leadtest/ });
    await Topic.deleteMany({ slug: /leadtest/ });
    await UserProgress.deleteMany({});
    await UserBadge.deleteMany({});
  });

  const registerUser = async (suffix = '') => {
    const agent = request.agent(app);
    const payload = {
      username: `leadtest_user${suffix}`,
      email: `leadtest${suffix}@example.com`,
      password: 'TestPass1',
    };
    const res = await agent.post('/api/v1/auth/register').send(payload);
    return { agent, token: res.body.data.accessToken, userId: res.body.data.user.id };
  };

  it('requires authentication', async () => {
    const res = await request(app).get('/api/v1/leaderboard');
    expect(res.status).toBe(401);
  });

  it('returns global leaderboard sorted by XP with current user rank', async () => {
    const first = await registerUser('_a');
    const second = await registerUser('_b');
    const third = await registerUser('_c');

    await userRepository.addXP(first.userId, 300);
    await userRepository.addXP(second.userId, 500);
    await userRepository.addXP(third.userId, 100);

    const res = await third.agent
      .get('/api/v1/leaderboard')
      .set('Authorization', `Bearer ${third.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.period).toBe('global');
    expect(res.body.data.entries.length).toBeGreaterThanOrEqual(3);
    expect(res.body.data.entries[0].xp).toBeGreaterThanOrEqual(res.body.data.entries[1].xp);
    expect(res.body.data.currentUser.rank).toBe(3);
    expect(res.body.data.currentUser.inTopList).toBe(true);
    expect(res.body.data.currentUser.xp).toBe(100);
  });

  it('shows current user rank even when outside top list', async () => {
    const lowUser = await registerUser('_low');

    for (let index = 0; index < 105; index += 1) {
      const email = `leadtest_bulk${index}@example.com`;
      await User.deleteOne({ email });
      const created = await User.create({
        username: `leadtest_bulk${index}`,
        email,
        passwordHash: 'hash',
        gamification: { xp: 1000 + index, level: 10 },
        isActive: true,
      });
      if (index === 0) {
        await userRepository.addXP(created._id.toString(), 0);
      }
    }

    await userRepository.addXP(lowUser.userId, 10);

    const res = await lowUser.agent
      .get('/api/v1/leaderboard?limit=100')
      .set('Authorization', `Bearer ${lowUser.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.entries).toHaveLength(100);
    expect(res.body.data.currentUser.inTopList).toBe(false);
    expect(res.body.data.currentUser.rank).toBeGreaterThan(100);
  });

  it('returns weekly leaderboard based on recent XP activity', async () => {
    const topic = await Topic.create({
      slug: 'leadtest-arrays',
      title: 'Leaderboard Arrays',
      category: TOPIC_CATEGORIES.FUNDAMENTALS,
      difficulty: 'beginner',
      order: 1,
      status: 'published',
      xpReward: 80,
      content: buildTopicContent('Leaderboard Arrays'),
    });

    const active = await registerUser('_weekly_active');
    const inactive = await registerUser('_weekly_inactive');

    await userRepository.addXP(inactive.userId, 500);

    await UserProgress.create({
      userId: active.userId,
      topicId: topic._id,
      status: 'completed',
      progressPercent: 100,
      completedAt: new Date(),
      xpAwarded: true,
    });

    const res = await active.agent
      .get('/api/v1/leaderboard?period=weekly')
      .set('Authorization', `Bearer ${active.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.period).toBe('weekly');
    expect(res.body.data.periodStart).toBeDefined();
    expect(res.body.data.currentUser.weeklyXp).toBe(80);
    expect(res.body.data.currentUser.rank).toBe(1);

    const weeklyEntry = res.body.data.entries.find(
      (entry) => entry.userId === active.userId
    );
    expect(weeklyEntry?.xp).toBe(80);
  });

  it('awards leaderboard badge when user reaches top 100', async () => {
    await Badge.findOneAndUpdate(
      { slug: 'leaderboard-top-100' },
      {
        slug: 'leaderboard-top-100',
        name: 'Top 100',
        description: 'Reach top 100 on leaderboard',
        icon: '📊',
        criteria: { type: 'leaderboard_rank', threshold: 100 },
        xpBonus: 100,
        isActive: true,
      },
      { upsert: true, new: true }
    );

    const user = await registerUser('_badge');
    await userRepository.addXP(user.userId, 250);

    const res = await user.agent
      .get('/api/v1/leaderboard')
      .set('Authorization', `Bearer ${user.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.currentUser.rank).toBeLessThanOrEqual(100);
    expect(res.body.data.newBadges?.some((badge) => badge.slug === 'leaderboard-top-100')).toBe(
      true
    );

    const earned = await UserBadge.countDocuments({ userId: user.userId });
    expect(earned).toBeGreaterThan(0);
  });

  it('rejects invalid period', async () => {
    const user = await registerUser('_invalid');

    const res = await user.agent
      .get('/api/v1/leaderboard?period=monthly')
      .set('Authorization', `Bearer ${user.token}`);

    expect(res.status).toBe(400);
  });
});
