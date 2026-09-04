import request from 'supertest';
import app from '../../src/app.js';
import { User, Problem, Submission } from '../../src/models/index.js';
import { DIFFICULTY } from 'shared/constants';
import { connectTestDB, disconnectTestDB, describeIfDb } from '../helpers/db.js';

describeIfDb('Problems API', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await User.deleteMany({ email: /probtest/ });
    await Problem.deleteMany({ slug: /probtest/ });
    await Submission.deleteMany({});
  });

  const registerUser = async (suffix = '') => {
    const agent = request.agent(app);
    const payload = {
      username: `probtest_user${suffix}`,
      email: `probtest${suffix}@example.com`,
      password: 'TestPass1',
    };
    const res = await agent.post('/api/v1/auth/register').send(payload);
    return { agent, token: res.body.data.accessToken, userId: res.body.data.user.id };
  };

  const seedProblem = async (overrides = {}) =>
    Problem.create({
      slug: 'probtest-sum',
      title: 'Test Sum',
      difficulty: DIFFICULTY.EASY,
      tags: ['array'],
      topicSlugs: ['arrays'],
      description: 'Print sum of space-separated integers.',
      constraints: 'n <= 100',
      examples: [{ input: '1 2 3', output: '6' }],
      testCases: [
        { input: '1 2 3', expectedOutput: '6', isHidden: false },
        { input: '10 20', expectedOutput: '30', isHidden: true },
      ],
      starterCode: { python: '# solve here\n' },
      status: 'published',
      ...overrides,
    });

  const mockAcceptedSolution = `import sys
data = sys.stdin.read().strip().split()
print(sum(map(int, data)))`;

  it('requires authentication', async () => {
    const res = await request(app).get('/api/v1/problems');
    expect(res.status).toBe(401);
  });

  it('lists published problems with filters', async () => {
    await seedProblem();
    await Problem.create({
      slug: 'probtest-hard',
      title: 'Hard Problem',
      difficulty: DIFFICULTY.HARD,
      tags: ['dp'],
      topicSlugs: ['dynamic-programming'],
      description: 'Hard test problem',
      testCases: [{ input: '1', expectedOutput: '1', isHidden: false }],
      status: 'published',
    });

    const { agent, token } = await registerUser('_list');

    const all = await agent.get('/api/v1/problems').set('Authorization', `Bearer ${token}`);
    expect(all.status).toBe(200);
    expect(all.body.data.problems.length).toBeGreaterThanOrEqual(2);

    const easy = await agent
      .get('/api/v1/problems?difficulty=easy')
      .set('Authorization', `Bearer ${token}`);
    expect(easy.body.data.problems.every((item) => item.difficulty === 'easy')).toBe(true);

    const search = await agent
      .get('/api/v1/problems?search=Hard')
      .set('Authorization', `Bearer ${token}`);
    expect(search.body.data.problems.some((item) => item.slug === 'probtest-hard')).toBe(true);
  });

  it('returns problem detail without hidden test cases', async () => {
    await seedProblem();
    const { agent, token } = await registerUser('_detail');

    const res = await agent
      .get('/api/v1/problems/probtest-sum')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Test Sum');
    expect(res.body.data.publicTestCases).toHaveLength(1);
    expect(res.body.data.hiddenTestCount).toBe(1);
    expect(res.body.data.userStatus).toBe('unsolved');
  });

  it('submits accepted solution and awards XP once', async () => {
    await seedProblem();
    const { agent, token, userId } = await registerUser('_submit');

    const submit = await agent
      .post('/api/v1/problems/probtest-sum/submit')
      .set('Authorization', `Bearer ${token}`)
      .send({ language: 'python', sourceCode: mockAcceptedSolution });

    expect(submit.status).toBe(200);
    expect(submit.body.data.submission.verdict).toBe('accepted');
    expect(submit.body.data.submission.testCasesPassed).toBe(2);
    expect(submit.body.data.xpAwarded).toBe(10);

    const user = await User.findById(userId);
    expect(user.stats.problemsSolved).toBe(1);

    const resubmit = await agent
      .post('/api/v1/problems/probtest-sum/submit')
      .set('Authorization', `Bearer ${token}`)
      .send({ language: 'python', sourceCode: mockAcceptedSolution });

    expect(resubmit.body.data.xpAwarded).toBe(0);
  });

  it('returns wrong answer for failing submission', async () => {
    await seedProblem();
    const { agent, token } = await registerUser('_wrong');

    const res = await agent
      .post('/api/v1/problems/probtest-sum/submit')
      .set('Authorization', `Bearer ${token}`)
      .send({ language: 'python', sourceCode: '# __WRONG__\nprint(0)' });

    expect(res.status).toBe(200);
    expect(res.body.data.submission.verdict).toBe('wrong_answer');
    expect(res.body.data.submission.testCasesPassed).toBe(0);
    expect(res.body.data.xpAwarded).toBe(0);
  });

  it('runs sample against first example', async () => {
    await seedProblem();
    const { agent, token } = await registerUser('_run');

    const res = await agent
      .post('/api/v1/problems/probtest-sum/run')
      .set('Authorization', `Bearer ${token}`)
      .send({ language: 'python', sourceCode: mockAcceptedSolution });

    expect(res.status).toBe(200);
    expect(res.body.data.run.stdin).toBe('1 2 3');
    expect(res.body.data.run.verdict).toBe('accepted');
  });

  it('marks user status as solved after accepted submission', async () => {
    await seedProblem();
    const { agent, token } = await registerUser('_status');

    await agent
      .post('/api/v1/problems/probtest-sum/submit')
      .set('Authorization', `Bearer ${token}`)
      .send({ language: 'python', sourceCode: mockAcceptedSolution });

    const solved = await agent
      .get('/api/v1/problems?status=solved')
      .set('Authorization', `Bearer ${token}`);

    expect(solved.body.data.problems.some((item) => item.slug === 'probtest-sum')).toBe(true);
    const solvedItem = solved.body.data.problems.find((item) => item.slug === 'probtest-sum');
    expect(solvedItem.userStatus).toBe('solved');
  });
});
