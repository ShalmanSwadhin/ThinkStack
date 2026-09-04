import request from 'supertest';
import app from '../../src/app.js';
import {
  User,
  Topic,
  Problem,
  Quiz,
  Notification,
  AuditLog,
  Announcement,
} from '../../src/models/index.js';
import { DIFFICULTY, ROLES, TOPIC_CATEGORIES } from 'shared/constants';
import { connectTestDB, disconnectTestDB, describeIfDb } from '../helpers/db.js';

describeIfDb('Admin API', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await User.deleteMany({ email: /admintest/ });
    await Topic.deleteMany({ slug: /admintest/ });
    await Problem.deleteMany({ slug: /admintest/ });
    await Quiz.deleteMany({ title: /admintest/ });
    await Notification.deleteMany({});
    await AuditLog.deleteMany({});
    await Announcement.deleteMany({ title: /admintest/ });
  });

  const registerUser = async (suffix = '') => {
    const agent = request.agent(app);
    const payload = {
      username: `admintest_user${suffix}`,
      email: `admintest${suffix}@example.com`,
      password: 'TestPass1',
    };
    const res = await agent.post('/api/v1/auth/register').send(payload);
    return {
      agent,
      token: res.body.data.accessToken,
      userId: res.body.data.user.id,
      email: payload.email,
      password: payload.password,
    };
  };

  const promoteAdmin = async (user) => {
    await User.findByIdAndUpdate(user.userId, { role: ROLES.ADMIN });
    const loginRes = await user.agent.post('/api/v1/auth/login').send({
      email: user.email,
      password: user.password,
    });
    return { ...user, token: loginRes.body.data.accessToken };
  };

  it('requires admin role', async () => {
    const student = await registerUser('_student');
    const res = await student.agent
      .get('/api/v1/admin/analytics')
      .set('Authorization', `Bearer ${student.token}`);
    expect(res.status).toBe(403);
  });

  it('returns analytics overview', async () => {
    const admin = await promoteAdmin(await registerUser('_analytics'));
    const res = await admin.agent
      .get('/api/v1/admin/analytics')
      .set('Authorization', `Bearer ${admin.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.overview.totalUsers).toBeGreaterThan(0);
    expect(res.body.data.userGrowth).toHaveLength(30);
    expect(res.body.data.submissionActivity).toHaveLength(30);
  });

  it('lists and updates users', async () => {
    const admin = await promoteAdmin(await registerUser('_users_admin'));
    await registerUser('_users_target');

    const list = await admin.agent
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${admin.token}`);
    expect(list.status).toBe(200);
    expect(list.body.data.users.length).toBeGreaterThan(0);

    const target = list.body.data.users.find((user) => user.email.includes('target'));
    const update = await admin.agent
      .patch(`/api/v1/admin/users/${target.id}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ isSuspended: true });

    expect(update.status).toBe(200);
    expect(update.body.data.isSuspended).toBe(true);
  });

  it('creates topic and updates publish status', async () => {
    const admin = await promoteAdmin(await registerUser('_topic_admin'));

    const create = await admin.agent
      .post('/api/v1/admin/topics')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        slug: 'admintest-topic',
        title: 'Admin Test Topic',
        category: TOPIC_CATEGORIES.FUNDAMENTALS,
        status: 'draft',
      });

    expect(create.status).toBe(201);

    const update = await admin.agent
      .patch(`/api/v1/admin/topics/${create.body.data.id}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ status: 'published' });

    expect(update.status).toBe(200);
    expect(update.body.data.status).toBe('published');
  });

  it('creates problem as admin', async () => {
    const admin = await promoteAdmin(await registerUser('_problem_admin'));

    const res = await admin.agent
      .post('/api/v1/admin/problems')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        slug: 'admintest-problem',
        title: 'Admin Test Problem',
        description: 'Return the sum of two integers from stdin.',
        difficulty: DIFFICULTY.EASY,
        status: 'published',
        testCases: [{ input: '2 3', expectedOutput: '5', isHidden: false }],
      });

    expect(res.status).toBe(201);
    expect(res.body.data.slug).toBe('admintest-problem');
  });

  it('creates announcement and notifies users', async () => {
    const admin = await promoteAdmin(await registerUser('_announce_admin'));

    const beforeCount = await Notification.countDocuments({ type: 'announcement' });

    const res = await admin.agent
      .post('/api/v1/admin/announcements')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        title: 'admintest Welcome Update',
        content: 'Platform maintenance is scheduled for next week.',
        priority: 'high',
        isActive: true,
      });

    expect(res.status).toBe(201);

    const afterCount = await Notification.countDocuments({ type: 'announcement' });
    expect(afterCount).toBeGreaterThan(beforeCount);

    const auditCount = await AuditLog.countDocuments({ action: 'create_announcement' });
    expect(auditCount).toBe(1);
  });

  it('exports users csv', async () => {
    const admin = await promoteAdmin(await registerUser('_export_admin'));

    const res = await admin.agent
      .get('/api/v1/admin/export/users')
      .set('Authorization', `Bearer ${admin.token}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.text).toContain('username,email,role');
  });
});
