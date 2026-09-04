import { BaseRepository } from './BaseRepository.js';
import { ContestSubmission } from '../models/index.js';

export class ContestSubmissionRepository extends BaseRepository {
  constructor() {
    super(ContestSubmission);
  }

  async findByContestAndUser(contestId, userId) {
    return ContestSubmission.find({ contestId, userId })
      .sort({ submittedAt: -1 })
      .lean()
      .exec();
  }

  async findByContest(contestId) {
    return ContestSubmission.find({ contestId }).sort({ submittedAt: 1 }).lean().exec();
  }

  async createSubmission(data) {
    return this.create(data);
  }

  async getProblemStatusMap(contestId, userId) {
    const submissions = await ContestSubmission.find({ contestId, userId })
      .select('problemId verdict')
      .lean()
      .exec();

    const solved = new Set();
    const attempted = new Set();

    for (const submission of submissions) {
      const id = submission.problemId.toString();
      attempted.add(id);
      if (submission.verdict === 'accepted') {
        solved.add(id);
      }
    }

    return { solved, attempted };
  }
}

export default new ContestSubmissionRepository();
