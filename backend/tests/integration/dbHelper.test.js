import mongoose from 'mongoose';
import { Problem } from '../../src/models/index.js';
import { connectTestDB, disconnectTestDB, describeIfDb } from '../helpers/db.js';

// Regression: problems.test.js "lists published problems with filters" failed intermittently
// with 500 IndexNotFound because the text index of a freshly dropped database was still being
// built when the first $text query ran. connectTestDB must only resolve once indexes exist.
describeIfDb('test database helper', () => {
  afterAll(async () => {
    await disconnectTestDB();
  });

  it('has the text indexes ready as soon as the connection resolves, even right after a drop', async () => {
    await connectTestDB();
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();

    await connectTestDB();
    await Problem.create({
      slug: 'dbhelper-hard',
      title: 'Hard Problem',
      difficulty: 'hard',
      description: 'index readiness probe',
      testCases: [{ input: '1', expectedOutput: '1', isHidden: false }],
      status: 'published',
    });

    const found = await Problem.find({ $text: { $search: 'Hard' } }).lean();
    expect(found.some((p) => p.slug === 'dbhelper-hard')).toBe(true);
  });
});
