import request from 'supertest';
import app from '../../src/app.js';
import { User, Notification, Badge, UserBadge } from '../../src/models/index.js';
import { connectTestDB, disconnectTestDB, describeIfDb } from '../helpers/db.js';

describeIfDb('Notifications API', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await User.deleteMany({ email: /notiftest/ });
    await Notification.deleteMany({ title: /notiftest/i });
    await UserBadge.deleteMany({});
  });

  const registerUser = async (suffix = '') => {
    const agent = request.agent(app);
    const payload = {
      username: `notiftest_user${suffix}`,
      email: `notiftest${suffix}@example.com`,
      password: 'TestPass1',
    };
    const res = await agent.post('/api/v1/auth/register').send(payload);
    return { agent, token: res.body.data.accessToken, userId: res.body.data.user.id };
  };

  const seedNotification = async (userId, overrides = {}) =>
    Notification.create({
      userId,
      type: 'system',
      title: 'notiftest System alert',
      message: 'Test notification body',
      read: false,
      ...overrides,
    });

  it('requires authentication for notification routes', async () => {
    const res = await request(app).get('/api/v1/notifications');
    expect(res.status).toBe(401);
  });

  it('lists notifications with unread count', async () => {
    const { agent, token, userId } = await registerUser('_list');
    await seedNotification(userId, { type: 'announcement', read: false });
    await seedNotification(userId, { type: 'achievement', read: true, title: 'notiftest Badge' });

    const res = await agent
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.notifications).toHaveLength(2);
    expect(res.body.data.unreadCount).toBe(1);
    expect(res.body.meta.total).toBe(2);
  });

  it('returns unread count', async () => {
    const { agent, token, userId } = await registerUser('_count');
    await seedNotification(userId);
    await seedNotification(userId, { read: true, title: 'notiftest Read item' });

    const res = await agent
      .get('/api/v1/notifications/unread-count')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.unreadCount).toBe(1);
  });

  it('marks a notification as read and unread', async () => {
    const { agent, token, userId } = await registerUser('_read');
    const notification = await seedNotification(userId);

    const readRes = await agent
      .patch(`/api/v1/notifications/${notification._id}/read`)
      .set('Authorization', `Bearer ${token}`);

    expect(readRes.status).toBe(200);
    expect(readRes.body.data.read).toBe(true);

    const unreadRes = await agent
      .patch(`/api/v1/notifications/${notification._id}/unread`)
      .set('Authorization', `Bearer ${token}`);

    expect(unreadRes.status).toBe(200);
    expect(unreadRes.body.data.read).toBe(false);
  });

  it('marks all notifications as read', async () => {
    const { agent, token, userId } = await registerUser('_read_all');
    await seedNotification(userId);
    await seedNotification(userId, { title: 'notiftest Second alert' });

    const res = await agent
      .patch('/api/v1/notifications/read-all')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.updated).toBe(2);

    const unread = await Notification.countDocuments({ userId, read: false });
    expect(unread).toBe(0);
  });

  it('clears all notifications for the user', async () => {
    const { agent, token, userId } = await registerUser('_clear');
    await seedNotification(userId);
    await seedNotification(userId, { title: 'notiftest Another alert' });

    const res = await agent
      .delete('/api/v1/notifications')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.deleted).toBe(2);

    const remaining = await Notification.countDocuments({ userId });
    expect(remaining).toBe(0);
  });

  it('prevents accessing another user notification', async () => {
    const userA = await registerUser('_owner');
    const userB = await registerUser('_other');
    const notification = await seedNotification(userA.userId);

    const res = await userB.agent
      .patch(`/api/v1/notifications/${notification._id}/read`)
      .set('Authorization', `Bearer ${userB.token}`);

    expect(res.status).toBe(404);
  });

  it('creates achievement notification when a badge is unlocked', async () => {
    const { agent, token, userId } = await registerUser('_badge');

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

    await User.findByIdAndUpdate(userId, {
      'stats.topicsCompleted': 1,
    });
    await UserBadge.deleteMany({ userId });

    const beforeCount = await Notification.countDocuments({ userId, type: 'achievement' });

    await agent.get('/api/v1/gamification').set('Authorization', `Bearer ${token}`);

    await agent
      .post('/api/v1/auth/login')
      .send({ email: 'notiftest_badge@example.com', password: 'TestPass1' });

    const afterCount = await Notification.countDocuments({ userId, type: 'achievement' });
    expect(afterCount).toBeGreaterThan(beforeCount);
  });

  it('creates streak reminder when last activity was yesterday', async () => {
    const { agent, token, userId } = await registerUser('_streak');

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(12, 0, 0, 0);

    await User.findByIdAndUpdate(userId, {
      gamification: {
        xp: 100,
        level: 1,
        coins: 0,
        streak: {
          current: 5,
          longest: 5,
          lastActivityDate: yesterday,
        },
      },
    });

    const res = await agent
      .get('/api/v1/notifications/unread-count')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);

    const streakNotification = await Notification.findOne({ userId, type: 'streak' });
    expect(streakNotification).toBeTruthy();
    expect(streakNotification.title).toMatch(/5-day streak/i);
  });
});
