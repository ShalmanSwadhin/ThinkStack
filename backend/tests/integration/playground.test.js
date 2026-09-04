import request from 'supertest';
import app from '../../src/app.js';
import { User, Submission, PlaygroundSnippet } from '../../src/models/index.js';
import { connectTestDB, disconnectTestDB, describeIfDb } from '../helpers/db.js';

describeIfDb('Playground API', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await User.deleteMany({ email: /playtest/ });
    await Submission.deleteMany({});
    await PlaygroundSnippet.deleteMany({});
  });

  const registerUser = async (suffix = '') => {
    const agent = request.agent(app);
    const payload = {
      username: `playtest_user${suffix}`,
      email: `playtest${suffix}@example.com`,
      password: 'TestPass1',
    };
    const res = await agent.post('/api/v1/auth/register').send(payload);
    return { agent, token: res.body.data.accessToken, userId: res.body.data.user.id };
  };

  it('requires authentication for playground routes', async () => {
    const res = await request(app).post('/api/v1/playground/run').send({
      language: 'python',
      sourceCode: 'print(1)',
    });
    expect(res.status).toBe(401);
  });

  it('lists supported languages', async () => {
    const { agent, token } = await registerUser('_langs');

    const res = await agent
      .get('/api/v1/playground/languages')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
    expect(res.body.data.map((item) => item.monaco)).toContain('python');
  });

  it('runs code and stores submission history (mock Judge0)', async () => {
    const { agent, token, userId } = await registerUser('_run');

    const runRes = await agent
      .post('/api/v1/playground/run')
      .set('Authorization', `Bearer ${token}`)
      .send({
        language: 'python',
        sourceCode: 'print("hello")',
        stdin: 'test-input',
      });

    expect(runRes.status).toBe(200);
    expect(runRes.body.data.submission.verdict).toBe('accepted');
    expect(runRes.body.data.submission.stdout).toContain('Echo: test-input');
    expect(runRes.body.data.mockMode).toBe(true);

    const historyRes = await agent
      .get('/api/v1/playground/history')
      .set('Authorization', `Bearer ${token}`);

    expect(historyRes.status).toBe(200);
    expect(historyRes.body.data.submissions).toHaveLength(1);
    expect(historyRes.body.data.submissions[0].language).toBe('python');

    const count = await Submission.countDocuments({ userId, type: 'playground' });
    expect(count).toBe(1);
  });

  it('rejects unsupported language', async () => {
    const { agent, token } = await registerUser('_badlang');

    const res = await agent
      .post('/api/v1/playground/run')
      .set('Authorization', `Bearer ${token}`)
      .send({
        language: 'rust',
        sourceCode: 'fn main() {}',
      });

    expect(res.status).toBe(400);
  });

  it('creates, lists, updates, and deletes snippets', async () => {
    const { agent, token } = await registerUser('_snippets');

    const createRes = await agent
      .post('/api/v1/playground/snippets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Hello Python',
        language: 'python',
        sourceCode: 'print("hi")',
        stdin: '',
      });

    expect(createRes.status).toBe(201);
    const snippetId = createRes.body.data.id;

    const listRes = await agent
      .get('/api/v1/playground/snippets')
      .set('Authorization', `Bearer ${token}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.snippets).toHaveLength(1);
    expect(listRes.body.data.snippets[0].title).toBe('Hello Python');

    const updateRes = await agent
      .patch(`/api/v1/playground/snippets/${snippetId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated Title' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.title).toBe('Updated Title');

    const deleteRes = await agent
      .delete(`/api/v1/playground/snippets/${snippetId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteRes.status).toBe(200);

    const afterList = await agent
      .get('/api/v1/playground/snippets')
      .set('Authorization', `Bearer ${token}`);

    expect(afterList.body.data.snippets).toHaveLength(0);
  });

  it('returns 404 for unknown snippet', async () => {
    const { agent, token } = await registerUser('_404');
    const fakeId = '507f1f77bcf86cd799439011';

    const res = await agent
      .get(`/api/v1/playground/snippets/${fakeId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
