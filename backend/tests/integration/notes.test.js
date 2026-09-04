import request from 'supertest';
import app from '../../src/app.js';
import { User, Note, Topic, Problem } from '../../src/models/index.js';
import { TOPIC_CATEGORIES, DIFFICULTY } from 'shared/constants';
import { buildTopicContent } from '../../src/seed/data/topics.js';
import { connectTestDB, disconnectTestDB, describeIfDb } from '../helpers/db.js';

describeIfDb('Notes API', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await User.deleteMany({ email: /notetest/ });
    await Note.deleteMany({});
    await Topic.deleteMany({ slug: /notetest/ });
    await Problem.deleteMany({ slug: /notetest/ });
  });

  const registerUser = async (suffix = '') => {
    const agent = request.agent(app);
    const payload = {
      username: `notetest_user${suffix}`,
      email: `notetest${suffix}@example.com`,
      password: 'TestPass1',
    };
    const res = await agent.post('/api/v1/auth/register').send(payload);
    return { agent, token: res.body.data.accessToken, userId: res.body.data.user.id };
  };

  const seedTopic = async () =>
    Topic.create({
      slug: 'notetest-arrays',
      title: 'Note Test Arrays',
      category: TOPIC_CATEGORIES.FUNDAMENTALS,
      difficulty: DIFFICULTY.BEGINNER,
      order: 1,
      status: 'published',
      xpReward: 50,
      content: buildTopicContent('Note Test Arrays'),
    });

  const seedProblem = async () =>
    Problem.create({
      slug: 'notetest-two-sum',
      title: 'Note Test Two Sum',
      difficulty: DIFFICULTY.EASY,
      status: 'published',
      description: 'Find two numbers',
      topicSlugs: ['notetest-arrays'],
      tags: ['array'],
      examples: [{ input: '1 2', output: '3' }],
      testCases: [{ input: '1 2', expectedOutput: '3', isHidden: false }],
      starterCode: { python: 'pass' },
    });

  it('requires authentication for notes routes', async () => {
    const res = await request(app).get('/api/v1/notes');
    expect(res.status).toBe(401);
  });

  it('creates, lists, reads, updates, and deletes a note', async () => {
    const { agent, token } = await registerUser('_crud');
    const topic = await seedTopic();

    const createRes = await agent
      .post('/api/v1/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Array Notes',
        content: '## Key points\n- Use two pointers',
        tags: ['arrays', 'study'],
        topicSlug: topic.slug,
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.title).toBe('Array Notes');
    expect(createRes.body.data.topic.slug).toBe('notetest-arrays');
    expect(createRes.body.data.tags).toEqual(['arrays', 'study']);

    const noteId = createRes.body.data.id;

    const listRes = await agent
      .get('/api/v1/notes')
      .set('Authorization', `Bearer ${token}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.notes).toHaveLength(1);

    const getRes = await agent
      .get(`/api/v1/notes/${noteId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.content).toContain('two pointers');

    const updateRes = await agent
      .patch(`/api/v1/notes/${noteId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated Array Notes', tags: ['review'] });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.title).toBe('Updated Array Notes');
    expect(updateRes.body.data.tags).toEqual(['review']);

    const deleteRes = await agent
      .delete(`/api/v1/notes/${noteId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteRes.status).toBe(200);

    const afterList = await agent
      .get('/api/v1/notes')
      .set('Authorization', `Bearer ${token}`);

    expect(afterList.body.data.notes).toHaveLength(0);

    const count = await Note.countDocuments({ isDeleted: true });
    expect(count).toBe(1);
  });

  it('links notes to problems via slug', async () => {
    const { agent, token } = await registerUser('_problem');
    await seedProblem();

    const res = await agent
      .post('/api/v1/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Two Sum approach',
        content: 'Use a hash map',
        problemSlug: 'notetest-two-sum',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.problem.slug).toBe('notetest-two-sum');
  });

  it('filters notes by topic slug and tag', async () => {
    const { agent, token } = await registerUser('_filter');
    const topic = await seedTopic();

    await agent
      .post('/api/v1/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Topic note',
        content: 'linked',
        topicSlug: topic.slug,
        tags: ['linked'],
      });

    await agent
      .post('/api/v1/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'General note',
        content: 'standalone',
        tags: ['general'],
      });

    const topicFilter = await agent
      .get('/api/v1/notes')
      .query({ topicSlug: topic.slug })
      .set('Authorization', `Bearer ${token}`);

    expect(topicFilter.body.data.notes).toHaveLength(1);
    expect(topicFilter.body.data.notes[0].title).toBe('Topic note');

    const tagFilter = await agent
      .get('/api/v1/notes')
      .query({ tag: 'general' })
      .set('Authorization', `Bearer ${token}`);

    expect(tagFilter.body.data.notes).toHaveLength(1);
    expect(tagFilter.body.data.notes[0].title).toBe('General note');
  });

  it('searches notes by text', async () => {
    const { agent, token } = await registerUser('_search');

    await agent
      .post('/api/v1/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Binary Search Cheatsheet',
        content: 'Divide and conquer on sorted arrays',
        tags: ['binary-search'],
      });

    await agent
      .post('/api/v1/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Stack tricks',
        content: 'LIFO pattern for parsing',
      });

    const searchRes = await agent
      .get('/api/v1/notes')
      .query({ search: 'binary sorted' })
      .set('Authorization', `Bearer ${token}`);

    expect(searchRes.status).toBe(200);
    expect(searchRes.body.data.notes.length).toBeGreaterThanOrEqual(1);
    expect(searchRes.body.data.notes[0].title).toContain('Binary Search');
  });

  it('prevents access to another user note', async () => {
    const userA = await registerUser('_a');
    const userB = await registerUser('_b');

    const createRes = await userA.agent
      .post('/api/v1/notes')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ title: 'Private note', content: 'secret' });

    const noteId = createRes.body.data.id;

    const getRes = await userB.agent
      .get(`/api/v1/notes/${noteId}`)
      .set('Authorization', `Bearer ${userB.token}`);

    expect(getRes.status).toBe(404);
  });

  it('returns 404 for unknown note', async () => {
    const { agent, token } = await registerUser('_404');
    const fakeId = '507f1f77bcf86cd799439011';

    const res = await agent
      .get(`/api/v1/notes/${fakeId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
