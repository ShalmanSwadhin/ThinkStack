import { Topic, Problem, Badge, User } from '../../src/models/index.js';
import bootstrapDatabase from '../../src/seed/bootstrap.js';
import { TOPICS } from '../../src/seed/data/topics.js';
import { PROBLEMS } from '../../src/seed/data/problems.js';
import { BADGES } from '../../src/seed/data/badges.js';
import { connectTestDB, disconnectTestDB, clearTestDB, describeIfDb } from '../helpers/db.js';

describeIfDb('bootstrapDatabase', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  it('creates default content on first run', async () => {
    const stats = await bootstrapDatabase();

    expect(stats.admin).toBeTruthy();
    expect(stats.totals.topics).toBe(TOPICS.length);
    expect(stats.totals.problems).toBe(PROBLEMS.length);
    expect(stats.totals.badges).toBe(BADGES.length);
    expect(stats.topics.created).toBe(TOPICS.length);
    expect(stats.problems.created).toBe(PROBLEMS.length);
  });

  it('is idempotent and does not duplicate records on subsequent runs', async () => {
    await bootstrapDatabase();
    const second = await bootstrapDatabase();

    expect(second.topics.created).toBe(0);
    expect(second.topics.existing).toBe(TOPICS.length);
    expect(second.problems.created).toBe(0);
    expect(second.problems.existing).toBe(PROBLEMS.length);
    expect(await Topic.countDocuments()).toBe(TOPICS.length);
    expect(await Problem.countDocuments()).toBe(PROBLEMS.length);
    expect(await Badge.countDocuments()).toBe(BADGES.length);
    expect(await User.countDocuments()).toBeGreaterThanOrEqual(1);
  });
});
