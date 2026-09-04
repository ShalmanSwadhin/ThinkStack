import { connectTestDB, disconnectTestDB, clearTestDB, describeIfDb } from '../helpers/db.js';
import problemRepository from '../../src/repositories/ProblemRepository.js';
import { Problem } from '../../src/models/index.js';
import { DIFFICULTY } from 'shared/constants';

describeIfDb('ProblemRepository', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  it('finds problem by slug', async () => {
    await Problem.create({
      slug: 'two-sum',
      title: 'Two Sum',
      difficulty: DIFFICULTY.EASY,
      description: 'Find two numbers',
      testCases: [{ input: '1', expectedOutput: '1', isHidden: false }],
      status: 'published',
    });

    const problem = await problemRepository.findBySlug('two-sum');
    expect(problem.title).toBe('Two Sum');
  });

  it('updates submission stats and acceptance rate', async () => {
    const problem = await Problem.create({
      slug: 'test-prob',
      title: 'Test',
      difficulty: DIFFICULTY.EASY,
      description: 'Test problem',
      testCases: [{ input: '1', expectedOutput: '1', isHidden: false }],
      status: 'published',
    });

    await problemRepository.incrementSubmissionStats(problem._id, true);
    await problemRepository.incrementSubmissionStats(problem._id, false);

    const updated = await problemRepository.findById(problem._id);
    expect(updated.totalSubmissions).toBe(2);
    expect(updated.totalAccepted).toBe(1);
    expect(updated.acceptanceRate).toBe(50);
  });
});
