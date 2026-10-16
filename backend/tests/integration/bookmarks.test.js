import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import { Bookmark, Problem, Quiz, Topic, User } from '../../src/models/index.js';
import { connectTestDB, disconnectTestDB, describeIfDb } from '../helpers/db.js';

describeIfDb('Bookmarks API', () => {
  let topic;
  let problem;
  let quiz;

  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await Promise.all([User, Bookmark, Problem, Quiz, Topic].map((model) => model.deleteMany(model === User ? { email: /bmtest/ } : {})));
    topic = await Topic.create({ slug: 'bm-topic', title: 'Bookmark Topic', category: 'fundamentals', difficulty: 'beginner', order: 1, status: 'published' });
    problem = await Problem.create({
      slug: 'bm-problem',
      title: 'Bookmark Problem',
      difficulty: 'easy',
      description: 'd',
      testCases: [{ input: '1', expectedOutput: '1', isHidden: false }],
      status: 'published',
    });
    quiz = await Quiz.create({
      topicId: topic._id,
      title: 'Bookmark Quiz',
      status: 'published',
      questions: [{ question: 'q?', options: ['a', 'b'], correctIndex: 0 }],
    });
  });

  const register = async (suffix) => {
    const res = await request(app).post('/api/v1/auth/register').send({ username: `bmtest_${suffix}`, email: `bmtest${suffix}@example.com`, password: 'TestPass1' });
    return { token: res.body.data.accessToken, userId: res.body.data.user.id };
  };
  const as = (token) => ({ Authorization: `Bearer ${token}` });
  const add = (token, body) => request(app).post('/api/v1/bookmarks').set(as(token)).send(body);

  it('requires authentication', async () => {
    expect((await request(app).get('/api/v1/bookmarks')).status).toBe(401);
    expect((await request(app).post('/api/v1/bookmarks').send({})).status).toBe(401);
  });

  it('adds, lists and removes bookmarks of every kind', async () => {
    const { token } = await register('a');
    expect((await add(token, { targetType: 'topic', targetId: topic._id.toString() })).status).toBe(201);
    expect((await add(token, { targetType: 'problem', targetSlug: 'bm-problem' })).status).toBe(201);
    const quizAdd = await add(token, { targetType: 'quiz', targetId: quiz._id.toString() });
    expect(quizAdd.status).toBe(201);

    const list = await request(app).get('/api/v1/bookmarks').set(as(token));
    expect(list.status).toBe(200);
    const byType = Object.fromEntries(list.body.data.bookmarks.map((b) => [b.targetType, b]));
    expect(byType.topic.href).toBe('/learn/bm-topic');
    expect(byType.problem.href).toBe('/problems/bm-problem');
    expect(byType.quiz.title).toBe('Bookmark Quiz');
    expect(list.body.data.bookmarks).toHaveLength(3);

    const removed = await request(app).delete(`/api/v1/bookmarks/${byType.topic.id}`).set(as(token));
    expect(removed.status).toBe(200);
    const byTarget = await request(app).delete('/api/v1/bookmarks').set(as(token)).send({ targetType: 'problem', targetSlug: 'bm-problem' });
    expect(byTarget.status).toBe(200);
    expect((await request(app).get('/api/v1/bookmarks').set(as(token))).body.data.bookmarks).toHaveLength(1);
  });

  it('toggles: a second add is a 409 and the status endpoint reflects each change', async () => {
    const { token } = await register('b');
    const id = problem._id.toString();
    const status = async () => (await request(app).get(`/api/v1/bookmarks/status?targetType=problem&ids=${id}`).set(as(token))).body.data.bookmarkedIds;

    expect(await status()).toEqual([]);
    expect((await add(token, { targetType: 'problem', targetId: id })).status).toBe(201);
    expect(await status()).toEqual([id]);
    expect((await add(token, { targetType: 'problem', targetId: id })).status).toBe(409);
    expect((await request(app).delete('/api/v1/bookmarks').set(as(token)).send({ targetType: 'problem', targetId: id })).status).toBe(200);
    expect(await status()).toEqual([]);
    expect((await request(app).delete('/api/v1/bookmarks').set(as(token)).send({ targetType: 'problem', targetId: id })).status).toBe(404);
  });

  it('survives two simultaneous adds: exactly one is created and the loser is a clean 409, not a 500', async () => {
    const { token, userId } = await register('c');
    const body = { targetType: 'topic', targetId: topic._id.toString() };
    const results = await Promise.all([add(token, body), add(token, body), add(token, body)]);
    const statuses = results.map((r) => r.status).sort();
    expect(statuses.filter((s) => s === 201)).toHaveLength(1);
    expect(statuses.every((s) => s === 201 || s === 409)).toBe(true);
    expect(await Bookmark.countDocuments({ userId })).toBe(1);
  });

  it('keeps users apart: you cannot see or remove someone else\'s bookmark', async () => {
    const owner = await register('d');
    const other = await register('e');
    const created = await add(owner.token, { targetType: 'topic', targetId: topic._id.toString() });
    const id = created.body.data.id;

    expect((await request(app).get('/api/v1/bookmarks').set(as(other.token))).body.data.bookmarks).toHaveLength(0);
    expect((await request(app).delete(`/api/v1/bookmarks/${id}`).set(as(other.token))).status).toBe(404);
    expect(await Bookmark.countDocuments({})).toBe(1);
  });

  it('rejects bad input', async () => {
    const { token } = await register('f');
    expect((await add(token, { targetType: 'nonsense', targetId: topic._id.toString() })).status).toBe(400);
    expect((await add(token, { targetType: 'topic', targetId: 'not-an-id' })).status).toBe(400);
    expect((await add(token, { targetType: 'topic', targetId: new mongoose.Types.ObjectId().toString() })).status).toBe(404);
    expect((await add(token, { targetType: 'topic' })).status).toBe(400);
  });

  it('lets a user remove a bookmark whose problem was archived later (and hides the dead link from the list)', async () => {
    const { token } = await register('g');
    const id = problem._id.toString();
    expect((await add(token, { targetType: 'problem', targetId: id })).status).toBe(201);
    await Problem.updateOne({ _id: problem._id }, { $set: { status: 'archived' } });

    const list = await request(app).get('/api/v1/bookmarks').set(as(token));
    expect(list.body.data.bookmarks.find((b) => b.targetType === 'problem')).toBeUndefined();

    const removed = await request(app).delete('/api/v1/bookmarks').set(as(token)).send({ targetType: 'problem', targetId: id });
    expect(removed.status).toBe(200);
    expect(await Bookmark.countDocuments({})).toBe(0);
  });
});
