import request from 'supertest';
import app from '../../src/app.js';
import {
  User,
  Problem,
  Contest,
  ContestParticipant,
  ContestSubmission,
  Submission,
  Badge,
  UserBadge,
} from '../../src/models/index.js';
import { DIFFICULTY, ROLES } from 'shared/constants';
import { connectTestDB, disconnectTestDB, describeIfDb } from '../helpers/db.js';

describeIfDb('Contests API', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await User.deleteMany({ email: /contesttest/ });
    await Problem.deleteMany({ slug: /contesttest/ });
    await Contest.deleteMany({ slug: /contesttest/ });
    await ContestParticipant.deleteMany({});
    await ContestSubmission.deleteMany({});
    await Submission.deleteMany({});
    await UserBadge.deleteMany({});
  });

  const registerUser = async (suffix = '') => {
    const agent = request.agent(app);
    const payload = {
      username: `contesttest_user${suffix}`,
      email: `contesttest${suffix}@example.com`,
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

  const seedProblem = async () =>
    Problem.create({
      slug: 'contesttest-sum',
      title: 'Contest Sum',
      difficulty: DIFFICULTY.EASY,
      tags: ['array'],
      topicSlugs: ['arrays'],
      description: 'Print sum of integers.',
      examples: [{ input: '1 2 3', output: '6' }],
      testCases: [
        { input: '1 2 3', expectedOutput: '6', isHidden: false },
        { input: '10 20', expectedOutput: '30', isHidden: true },
      ],
      starterCode: { python: 'import sys\nprint(sum(map(int, sys.stdin.read().split())))' },
      status: 'published',
    });

  const createActiveContest = async (adminToken, problemSlug, suffix = '') => {
    const start = new Date(Date.now() - 60 * 60 * 1000);
    const end = new Date(Date.now() + 60 * 60 * 1000);

    const res = await request(app)
      .post('/api/v1/contests')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: `Contest Test ${suffix}`,
        slug: `contesttest-live${String(suffix).replace(/_/g, '-')}`,
        description: 'Integration test contest',
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        problemSlugs: [problemSlug],
      });

    return res.body.data;
  };

  const promoteAdmin = async (user) => {
    await User.findByIdAndUpdate(user.userId, { role: ROLES.ADMIN });
    const loginRes = await user.agent.post('/api/v1/auth/login').send({
      email: user.email,
      password: user.password,
    });
    return { ...user, token: loginRes.body.data.accessToken };
  };

  it('requires authentication', async () => {
    const res = await request(app).get('/api/v1/contests');
    expect(res.status).toBe(401);
  });

  it('lists contests for authenticated users', async () => {
    const { agent, token } = await registerUser('_list');
    const res = await agent.get('/api/v1/contests').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.contests)).toBe(true);
  });

  it('allows admin to create a contest', async () => {
    const problem = await seedProblem();
    const admin = await promoteAdmin(await registerUser('_admin'));

    const res = await admin.agent
      .post('/api/v1/contests')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        title: 'Created Contest',
        slug: 'contesttest-created',
        description: 'Admin created contest',
        startTime: new Date(Date.now() + 3600000).toISOString(),
        endTime: new Date(Date.now() + 7200000).toISOString(),
        problemSlugs: [problem.slug],
      });

    expect(res.status).toBe(201);
    expect(res.body.data.slug).toBe('contesttest-created');
  });

  it('registers a user and returns contest detail with problems', async () => {
    const problem = await seedProblem();
    const admin = await promoteAdmin(await registerUser('_detail_admin'));
    const contest = await createActiveContest(admin.token, problem.slug, '_detail');
    const user = await registerUser('_detail');

    const registerRes = await user.agent
      .post(`/api/v1/contests/${contest.slug}/register`)
      .set('Authorization', `Bearer ${user.token}`);

    expect(registerRes.status).toBe(200);
    expect(registerRes.body.data.alreadyRegistered).toBe(false);

    const detail = await user.agent
      .get(`/api/v1/contests/${contest.slug}`)
      .set('Authorization', `Bearer ${user.token}`);

    expect(detail.status).toBe(200);
    expect(detail.body.data.isRegistered).toBe(true);
    expect(detail.body.data.problems).toHaveLength(1);
    expect(detail.body.data.status).toBe('active');
  });

  it('accepts submissions during active contest and updates leaderboard', async () => {
    const problem = await seedProblem();
    const admin = await promoteAdmin(await registerUser('_submit_admin'));
    const contest = await createActiveContest(admin.token, problem.slug, '_submit');
    const user = await registerUser('_submit');

    await user.agent
      .post(`/api/v1/contests/${contest.slug}/register`)
      .set('Authorization', `Bearer ${user.token}`);

    const submitRes = await user.agent
      .post(`/api/v1/contests/${contest.slug}/problems/${problem.slug}/submit`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        language: 'python',
        sourceCode: 'import sys\nprint(sum(map(int, sys.stdin.read().split())))',
      });

    expect(submitRes.status).toBe(200);
    expect(submitRes.body.data.accepted).toBe(true);
    expect(submitRes.body.data.points).toBeGreaterThan(0);

    const leaderboard = await user.agent
      .get(`/api/v1/contests/${contest.slug}/leaderboard`)
      .set('Authorization', `Bearer ${user.token}`);

    expect(leaderboard.status).toBe(200);
    expect(leaderboard.body.data.entries[0].score).toBeGreaterThan(0);
    expect(leaderboard.body.data.currentUser.rank).toBe(1);
  });

  it('blocks submissions after the contest ends', async () => {
    const problem = await seedProblem();
    const admin = await promoteAdmin(await registerUser('_closed_admin'));

    const start = new Date(Date.now() - 3 * 60 * 60 * 1000);
    const end = new Date(Date.now() + 60 * 60 * 1000);

    const createRes = await admin.agent
      .post('/api/v1/contests')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        title: 'Closed Contest',
        slug: 'contesttest-closed',
        description: 'Will be closed before submit',
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        problemSlugs: [problem.slug],
      });

    const contest = createRes.body.data;
    const user = await registerUser('_closed');

    await user.agent
      .post(`/api/v1/contests/${contest.slug}/register`)
      .set('Authorization', `Bearer ${user.token}`);

    await Contest.findOneAndUpdate(
      { slug: contest.slug },
      {
        endTime: new Date(Date.now() - 60 * 1000),
        status: 'completed',
      }
    );

    const submitRes = await user.agent
      .post(`/api/v1/contests/${contest.slug}/problems/${problem.slug}/submit`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        language: 'python',
        sourceCode: 'print(6)',
      });

    expect(submitRes.status).toBe(403);
  });

  it('awards contest participant badge on first registration', async () => {
    await Badge.findOneAndUpdate(
      { slug: 'contest-participant' },
      {
        slug: 'contest-participant',
        name: 'Contestant',
        description: 'Join your first contest',
        icon: '⚡',
        criteria: { type: 'contests_joined', threshold: 1 },
        xpBonus: 40,
        isActive: true,
      },
      { upsert: true, new: true }
    );

    const problem = await seedProblem();
    const admin = await promoteAdmin(await registerUser('_badge_admin'));
    const contest = await createActiveContest(admin.token, problem.slug, '_badge');
    const user = await registerUser('_badge');

    const res = await user.agent
      .post(`/api/v1/contests/${contest.slug}/register`)
      .set('Authorization', `Bearer ${user.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.newBadges?.some((badge) => badge.slug === 'contest-participant')).toBe(
      true
    );
  });
});
