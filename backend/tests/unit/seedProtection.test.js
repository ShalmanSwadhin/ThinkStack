/**
 * `seed --sync` must not silently overwrite what an admin changed since the seed last wrote a
 * record, and it must never delete user data. (Previously sync $set every lesson, quiz and
 * problem from source and cleared lesson problem links, discarding admin edits.)
 */
import { Problem, Quiz, Topic } from '../../src/models/index.js';
import bootstrapDatabase from '../../src/seed/bootstrap.js';
import { connectTestDB, disconnectTestDB, clearTestDB, describeIfDb } from '../helpers/db.js';

describeIfDb('seed edit protection', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  it('keeps an admin-edited lesson, quiz and problem on sync, and reports them', async () => {
    const first = await bootstrapDatabase({ only: 'lessons' });
    const topicCount = first.totals.topics;

    const topic = await Topic.findOne({ slug: 'dynamic-programming-memoization-basics' }).lean() ?? (await Topic.findOne({}).lean());
    const quiz = await Quiz.findOne({ topicId: topic._id }).lean();
    const problem = await Problem.findOne({}).lean();
    await Topic.updateOne({ _id: topic._id }, { $set: { title: 'Edited in admin', 'content.summary': 'Admin summary' } });
    await Quiz.updateOne({ _id: quiz._id }, { $set: { passingScore: 55 } });
    await Problem.updateOne({ _id: problem._id }, { $set: { description: 'Admin rewrote this statement.' } });

    const second = await bootstrapDatabase({ mode: 'sync', only: 'lessons' });

    expect(second.topics.protected).toBe(1);
    expect(second.quizzes.protected).toBe(1);
    expect(second.problems.protected).toBe(1);
    expect(second.topics.updated).toBe(topicCount - 1);

    expect((await Topic.findById(topic._id)).title).toBe('Edited in admin');
    expect((await Topic.findById(topic._id)).content.summary).toBe('Admin summary');
    expect((await Quiz.findById(quiz._id)).passingScore).toBe(55);
    expect((await Problem.findById(problem._id)).description).toBe('Admin rewrote this statement.');
  });

  it('overwrites edited records only when forced', async () => {
    await bootstrapDatabase({ only: 'lessons' });
    const topic = await Topic.findOne({}).lean();
    await Topic.updateOne({ _id: topic._id }, { $set: { title: 'Edited in admin' } });

    const forced = await bootstrapDatabase({ mode: 'sync', only: 'lessons', force: true });

    expect(forced.topics.protected).toBe(0);
    expect((await Topic.findById(topic._id)).title).toBe(topic.title);
  });

  it('keeps syncing records nobody edited, and a second sync protects nothing', async () => {
    await bootstrapDatabase({ only: 'lessons' });
    const sync = await bootstrapDatabase({ mode: 'sync', only: 'lessons' });
    expect(sync.topics.protected).toBe(0);
    expect(sync.quizzes.protected).toBe(0);
    expect(sync.problems.protected).toBe(0);
    expect(sync.topics.updated).toBe(sync.totals.topics);
  });

  it('never lets an insert-mode run overwrite an edited lesson', async () => {
    await bootstrapDatabase({ only: 'lessons' });
    const topic = await Topic.findOne({}).lean();
    await Topic.updateOne({ _id: topic._id }, { $set: { title: 'Edited in admin' } });
    await bootstrapDatabase({ only: 'lessons' });
    expect((await Topic.findById(topic._id)).title).toBe('Edited in admin');
  });

  it('does not expose the seed fingerprint on stored records by default', async () => {
    await bootstrapDatabase({ only: 'lessons' });
    const topic = await Topic.findOne({}).lean();
    expect(topic.seedHash).toBeUndefined();
    const withHash = await Topic.findOne({}).select('+seedHash').lean();
    expect(withHash.seedHash).toMatch(/^[0-9a-f]{40}$/);
  });
});
