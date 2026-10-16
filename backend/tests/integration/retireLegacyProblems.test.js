import mongoose from 'mongoose';
import { Bookmark, Contest, ContestSubmission, Note, Problem, Topic } from '../../src/models/index.js';
import retireLegacyProblems from '../../src/seed/retireLegacyProblems.js';
import { connectTestDB, disconnectTestDB, describeIfDb } from '../helpers/db.js';

const oid = () => new mongoose.Types.ObjectId();

const problem = (slug, extra = {}) =>
  Problem.create({
    slug,
    title: slug,
    difficulty: 'easy',
    description: 'old text',
    testCases: [{ input: '1', expectedOutput: 'garbage', isHidden: true }],
    status: 'published',
    ...extra,
  });

const contest = (slug, problemIds, extra = {}) =>
  Contest.create({
    slug,
    title: slug,
    startTime: new Date(Date.now() - 1000),
    endTime: new Date(Date.now() + 3600 * 1000),
    problemIds,
    difficulty: 'easy',
    ...extra,
  });

describeIfDb('retireLegacyProblems', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await Promise.all([Problem, Contest, ContestSubmission, Bookmark, Note, Topic].map((m) => m.deleteMany({})));
  });

  const seedReal = async () => {
    const sum = await problem('sum-of-array-elements', {
      title: 'Sum of Array Elements',
      description: 'REAL statement',
      testCases: [{ input: '2\n1 2', expectedOutput: '3', isHidden: true }],
    });
    const filler = await problem('absolute-difference');
    return { sum, filler };
  };

  it('archives unreferenced numbered copies instead of deleting them', async () => {
    await seedReal();
    const old = await problem('easy-sum-of-array-elements-7');
    const result = await retireLegacyProblems();
    expect(result.archived).toBe(1);
    const after = await Problem.findById(old._id);
    expect(after).not.toBeNull();
    expect(after.status).toBe('archived');
  });

  it('leaves real problems, custom problems and copies without a replacement alone', async () => {
    const { sum } = await seedReal();
    const custom = await problem('easy-my-own-problem-3');
    const orphan = await problem('hard-n-queens-count-4', { difficulty: 'hard' });
    const result = await retireLegacyProblems();
    expect(result.archived).toBe(0);
    for (const doc of [sum, custom, orphan]) expect((await Problem.findById(doc._id)).status).toBe('published');
  });

  it('moves bookmarks and notes to the replacement and drops a duplicate bookmark', async () => {
    const { sum } = await seedReal();
    const old1 = await problem('easy-sum-of-array-elements-1');
    const old2 = await problem('easy-sum-of-array-elements-2');
    const userA = oid();
    const userB = oid();
    await Bookmark.create({ userId: userA, targetType: 'problem', targetId: old1._id });
    await Bookmark.create({ userId: userB, targetType: 'problem', targetId: old2._id });
    await Bookmark.create({ userId: userB, targetType: 'problem', targetId: sum._id });
    const note = await Note.create({ userId: userA, title: 'n', problemId: old1._id });

    await retireLegacyProblems();

    expect((await Bookmark.findOne({ userId: userA })).targetId.toString()).toBe(sum._id.toString());
    expect(await Bookmark.countDocuments({ userId: userB })).toBe(1);
    expect((await Note.findById(note._id)).problemId.toString()).toBe(sum._id.toString());
  });

  it('re-points a contest nobody has submitted to, keeping its size by topping up', async () => {
    const { sum, filler } = await seedReal();
    const a = await problem('easy-sum-of-array-elements-1');
    const b = await problem('easy-sum-of-array-elements-2');
    const c = await contest('quiet-contest', [a._id, b._id]);

    const result = await retireLegacyProblems();

    expect(result.contestsRemapped).toBe(1);
    const after = await Contest.findById(c._id);
    const ids = after.problemIds.map(String);
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
    expect(ids).toContain(sum._id.toString());
    expect(ids).toContain(filler._id.toString());
  });

  it('keeps a numbered copy published, with the real statement and tests, when a contest with submissions uses it', async () => {
    const { sum } = await seedReal();
    const old = await problem('easy-sum-of-array-elements-9');
    const c = await contest('busy-contest', [old._id]);
    await ContestSubmission.create({ contestId: c._id, userId: oid(), problemId: old._id, language: 'python' });

    const result = await retireLegacyProblems();

    expect(result.kept).toBe(1);
    const after = await Problem.findById(old._id);
    expect(after.status).toBe('published');
    expect(after.description).toBe('REAL statement');
    expect(after.testCases[0].expectedOutput).toBe('3');
    expect((await Contest.findById(c._id)).problemIds.map(String)).toEqual([old._id.toString()]);
    expect(sum.slug).toBe('sum-of-array-elements');
  });

  it('removes retired problems from lesson links and is idempotent', async () => {
    await seedReal();
    const old = await problem('easy-sum-of-array-elements-1');
    const topic = await Topic.create({ slug: 't', title: 'T', category: 'fundamentals', difficulty: 'beginner', order: 1, relatedProblems: [old._id] });

    await retireLegacyProblems();
    expect((await Topic.findById(topic._id)).relatedProblems).toHaveLength(0);

    const second = await retireLegacyProblems();
    expect(second.archived).toBe(0);
    expect(second.contestsRemapped).toBe(0);
    expect(await Problem.countDocuments()).toBe(3);
  });
});
