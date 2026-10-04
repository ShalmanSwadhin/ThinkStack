import request from 'supertest';
import app from '../../src/app.js';
import { User, Topic, UserProgress } from '../../src/models/index.js';
import { TOPIC_CATEGORIES, DIFFICULTY } from 'shared/constants';
import { buildTopicContent } from '../../src/seed/data/topics.js';
import { connectTestDB, disconnectTestDB, describeIfDb } from '../helpers/db.js';

describeIfDb('Guest accounts', () => {
  const createdUserIds = [];

  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await Topic.deleteMany({ slug: /guesttest/ });
    await User.deleteMany({ email: /guesttest/ });
    await Topic.create({
      slug: 'guesttest-arrays',
      title: 'Guest Test Arrays',
      category: TOPIC_CATEGORIES.FUNDAMENTALS,
      difficulty: DIFFICULTY.BEGINNER,
      order: 1,
      status: 'published',
      xpReward: 50,
      content: buildTopicContent('Guest Test Arrays'),
    });
  });

  afterEach(async () => {
    if (createdUserIds.length) {
      await UserProgress.deleteMany({ userId: { $in: createdUserIds } });
      await User.deleteMany({ _id: { $in: createdUserIds } });
      createdUserIds.length = 0;
    }
  });

  const startGuest = async () => {
    const res = await request(app).post('/api/v1/auth/guest');
    if (res.body?.data?.user?.id) createdUserIds.push(res.body.data.user.id);
    return res;
  };

  const authed = (token) => ({ Authorization: `Bearer ${token}` });

  it('starts an anonymous guest session with a browser key and refresh cookie', async () => {
    const res = await startGuest();

    expect(res.status).toBe(201);
    expect(res.body.data.user).toMatchObject({ isGuest: true, email: null, role: 'student' });
    expect(res.body.data.user.username).toMatch(/^guest_[0-9a-f]{8}$/);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.guestKey).toMatch(/^[0-9a-f]{64}$/);
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('never stores the guest key itself, only a hash of it', async () => {
    const res = await startGuest();
    const stored = await User.findById(res.body.data.user.id).select('+guestKeyHash').lean();

    expect(stored.guestKeyHash).toBeDefined();
    expect(stored.guestKeyHash).not.toBe(res.body.data.guestKey);
    expect(JSON.stringify(stored)).not.toContain(res.body.data.guestKey);
  });

  it('gives guests the real app: they earn XP and progress like an account holder', async () => {
    const { body } = await startGuest();
    const token = body.data.accessToken;

    const me = await request(app).get('/api/v1/auth/me').set(authed(token));
    expect(me.status).toBe(200);
    expect(me.body.data.isGuest).toBe(true);

    const topics = await request(app).get('/api/v1/topics').set(authed(token));
    expect(topics.status).toBe(200);

    const complete = await request(app)
      .patch('/api/v1/topics/guesttest-arrays/progress')
      .set(authed(token))
      .send({ status: 'completed' });
    expect(complete.status).toBe(200);
    expect(complete.body.data.xpAwarded).toBe(50);
    expect(complete.body.data.gamification.xp).toBeGreaterThanOrEqual(50);
  });

  it('resumes the same guest (and its progress) from the browser key alone', async () => {
    const { body } = await startGuest();
    await request(app)
      .patch('/api/v1/topics/guesttest-arrays/progress')
      .set(authed(body.data.accessToken))
      .send({ status: 'completed' });

    const resumed = await request(app)
      .post('/api/v1/auth/guest/resume')
      .send({ guestKey: body.data.guestKey });

    expect(resumed.status).toBe(200);
    expect(resumed.body.data.user.id).toBe(body.data.user.id);
    expect(resumed.body.data.user.isGuest).toBe(true);

    const topics = await request(app)
      .get('/api/v1/topics')
      .set(authed(resumed.body.data.accessToken));
    const topic = topics.body.data.categories
      .flatMap((category) => category.topics)
      .find((item) => item.slug === 'guesttest-arrays');
    expect(topic.progress.status).toBe('completed');
  });

  it('rejects an unknown or malformed guest key', async () => {
    const unknown = await request(app)
      .post('/api/v1/auth/guest/resume')
      .send({ guestKey: 'a'.repeat(64) });
    expect(unknown.status).toBe(401);

    const malformed = await request(app).post('/api/v1/auth/guest/resume').send({ guestKey: 'nope' });
    expect(malformed.status).toBeGreaterThanOrEqual(400);
    expect(malformed.status).toBeLessThan(500);
    expect(malformed.status).not.toBe(401);
  });

  it('cannot be used through email/password login or password reset', async () => {
    const { body } = await startGuest();
    const stored = await User.findById(body.data.user.id).lean();

    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: stored.email, password: 'Whatever123' });
    expect(login.status).toBe(401);

    const forgot = await request(app).post('/api/v1/auth/forgot-password').send({ email: stored.email });
    expect(forgot.status).toBe(200);
    const after = await User.findById(body.data.user.id).select('+passwordResetToken').lean();
    expect(after.passwordResetToken).toBeUndefined();
  });

  describe('upgrading a guest to a real account', () => {
    const credentials = (suffix) => ({
      username: `guesttest_user${suffix}`,
      email: `guesttest${suffix}@example.com`,
      password: 'TestPass1',
    });

    it('keeps the same user, progress and XP, and enables normal login from anywhere', async () => {
      const { body } = await startGuest();
      const token = body.data.accessToken;
      await request(app)
        .patch('/api/v1/topics/guesttest-arrays/progress')
        .set(authed(token))
        .send({ status: 'completed' });
      const before = await request(app).get('/api/v1/auth/me').set(authed(token));

      const creds = credentials('_ok');
      const upgraded = await request(app)
        .post('/api/v1/auth/guest/upgrade')
        .set(authed(token))
        .send(creds);

      expect(upgraded.status).toBe(200);
      expect(upgraded.body.data.user).toMatchObject({
        id: body.data.user.id,
        isGuest: false,
        email: creds.email,
        username: creds.username,
      });
      expect(upgraded.body.data.user.gamification.xp).toBe(before.body.data.gamification.xp);

      const login = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: creds.email, password: creds.password });
      expect(login.status).toBe(200);
      expect(login.body.data.user.id).toBe(body.data.user.id);

      const topics = await request(app)
        .get('/api/v1/topics')
        .set(authed(login.body.data.accessToken));
      const topic = topics.body.data.categories
        .flatMap((category) => category.topics)
        .find((item) => item.slug === 'guesttest-arrays');
      expect(topic.progress.status).toBe('completed');
    });

    it('invalidates the old guest key once upgraded', async () => {
      const { body } = await startGuest();
      await request(app)
        .post('/api/v1/auth/guest/upgrade')
        .set(authed(body.data.accessToken))
        .send(credentials('_key'));

      const resume = await request(app)
        .post('/api/v1/auth/guest/resume')
        .send({ guestKey: body.data.guestKey });
      expect(resume.status).toBe(401);
    });

    it('requires a signed-in session and a guest account', async () => {
      const anonymous = await request(app).post('/api/v1/auth/guest/upgrade').send(credentials('_anon'));
      expect(anonymous.status).toBe(401);

      const registered = await request(app).post('/api/v1/auth/register').send(credentials('_real'));
      createdUserIds.push(registered.body.data.user.id);
      expect(registered.body.data.user.isGuest).toBe(false);

      const notGuest = await request(app)
        .post('/api/v1/auth/guest/upgrade')
        .set(authed(registered.body.data.accessToken))
        .send(credentials('_real2'));
      expect(notGuest.status).toBe(400);
    });

    it('rejects an email that is already registered and leaves the guest intact', async () => {
      const taken = credentials('_taken');
      const registered = await request(app).post('/api/v1/auth/register').send(taken);
      createdUserIds.push(registered.body.data.user.id);

      const { body } = await startGuest();
      const res = await request(app)
        .post('/api/v1/auth/guest/upgrade')
        .set(authed(body.data.accessToken))
        .send({ ...taken, username: 'guesttest_other' });

      expect(res.status).toBe(409);
      const me = await request(app).get('/api/v1/auth/me').set(authed(body.data.accessToken));
      expect(me.body.data.isGuest).toBe(true);
    });
  });
});
