import request from 'supertest';
import app from '../../src/app.js';
import { User, Topic, Problem, Note } from '../../src/models/index.js';
import { TOPIC_CATEGORIES, DIFFICULTY } from 'shared/constants';
import { buildTopicContent } from '../../src/seed/data/topics.js';
import { connectTestDB, disconnectTestDB, describeIfDb } from '../helpers/db.js';

describeIfDb('Search API', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await User.deleteMany({ email: /searchtest/ });
    await Topic.deleteMany({ slug: /searchtest/ });
    await Problem.deleteMany({ slug: /searchtest/ });
    await Note.deleteMany({ title: /searchtest/i });
  });

  const registerUser = async (suffix = '') => {
    const agent = request.agent(app);
    const payload = {
      username: `searchtest_user${suffix}`,
      email: `searchtest${suffix}@example.com`,
      password: 'TestPass1',
    };
    const res = await agent.post('/api/v1/auth/register').send(payload);
    return { agent, token: res.body.data.accessToken, userId: res.body.data.user.id };
  };

  const seedTopic = async (overrides = {}) =>
    Topic.create({
      slug: 'searchtest-graph-traversal',
      title: 'searchtest Graph Traversal',
      category: TOPIC_CATEGORIES.GRAPHS,
      difficulty: DIFFICULTY.INTERMEDIATE,
      order: 99,
      status: 'published',
      xpReward: 50,
      tags: ['graphs', 'bfs'],
      content: buildTopicContent('Graph Traversal'),
      ...overrides,
    });

  const seedProblem = async (overrides = {}) =>
    Problem.create({
      slug: 'searchtest-shortest-path',
      title: 'searchtest Shortest Path',
      difficulty: DIFFICULTY.MEDIUM,
      status: 'published',
      description: 'Find the shortest path in an unweighted graph using BFS searchtest',
      topicSlugs: ['searchtest-graph-traversal'],
      tags: ['graph', 'bfs'],
      examples: [{ input: '2 1', output: '1' }],
      testCases: [{ input: '2 1', expectedOutput: '1', isHidden: false }],
      starterCode: { python: 'pass' },
      ...overrides,
    });

  it('requires authentication', async () => {
    const res = await request(app).get('/api/v1/search').query({ q: 'graph' });
    expect(res.status).toBe(401);
  });

  it('validates minimum query length', async () => {
    const { agent, token } = await registerUser('_validate');

    const res = await agent
      .get('/api/v1/search')
      .query({ q: 'a' })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  it('returns grouped results for topics and problems', async () => {
    const { agent, token } = await registerUser('_results');
    await seedTopic();
    await seedProblem();

    const res = await agent
      .get('/api/v1/search')
      .query({ q: 'searchtest graph' })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.topics.length).toBeGreaterThan(0);
    expect(res.body.data.problems.length).toBeGreaterThan(0);
    expect(res.body.data.topics[0].href).toContain('/learn/');
    expect(res.body.data.problems[0].href).toContain('/problems/');
    expect(res.body.data.meta.total).toBeGreaterThan(0);
  });

  it('returns only the current user notes', async () => {
    const userA = await registerUser('_notes_a');
    const userB = await registerUser('_notes_b');

    await Note.create({
      userId: userA.userId,
      title: 'searchtest private graph notes',
      content: 'BFS and DFS patterns for interviews',
      tags: ['graphs'],
    });

    await Note.create({
      userId: userB.userId,
      title: 'searchtest other user note',
      content: 'Should not appear in user A search',
      tags: ['private'],
    });

    const res = await userA.agent
      .get('/api/v1/search')
      .query({ q: 'searchtest graph' })
      .set('Authorization', `Bearer ${userA.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.notes).toHaveLength(1);
    expect(res.body.data.notes[0].title).toContain('private graph notes');
  });

  it('excludes draft topics and problems', async () => {
    const { agent, token } = await registerUser('_draft');
    await seedTopic({ status: 'draft', slug: 'searchtest-draft-topic', title: 'searchtest Draft Topic' });
    await seedProblem({ status: 'draft', slug: 'searchtest-draft-problem', title: 'searchtest Draft Problem' });

    const res = await agent
      .get('/api/v1/search')
      .query({ q: 'searchtest draft' })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.topics).toHaveLength(0);
    expect(res.body.data.problems).toHaveLength(0);
  });

  it('returns autocomplete suggestions', async () => {
    const { agent, token } = await registerUser('_suggest');
    await seedTopic();
    await seedProblem();

    const res = await agent
      .get('/api/v1/search/suggest')
      .query({ q: 'searchtest shortest' })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.suggestions.length).toBeGreaterThan(0);
    expect(res.body.data.suggestions[0]).toMatchObject({
      type: expect.stringMatching(/topic|problem|note/),
      title: expect.any(String),
      href: expect.any(String),
    });
  });

  it('returns empty groups when nothing matches', async () => {
    const { agent, token } = await registerUser('_empty');

    const res = await agent
      .get('/api/v1/search')
      .query({ q: 'searchtest-zzzz-not-found' })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.topics).toHaveLength(0);
    expect(res.body.data.problems).toHaveLength(0);
    expect(res.body.data.notes).toHaveLength(0);
    expect(res.body.data.meta.total).toBe(0);
  });
});
