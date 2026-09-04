import { BaseRepository } from './BaseRepository.js';
import { Submission } from '../models/index.js';

export class SubmissionRepository extends BaseRepository {
  constructor() {
    super(Submission);
  }

  async findByUser(userId, options = {}) {
    return this.find({ userId }, { sort: { createdAt: -1 }, ...options });
  }

  async findByUserAndProblem(userId, problemId, options = {}) {
    return this.find({ userId, problemId }, { sort: { createdAt: -1 }, ...options });
  }

  async hasAcceptedSubmission(userId, problemId) {
    return Submission.exists({ userId, problemId, verdict: 'accepted' });
  }

  async getUserProblemStatusSets(userId) {
    const submissions = await Submission.find({ userId, type: 'problem', problemId: { $ne: null } })
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

  async findByUserAndProblemSlug(userId, problemId, options = {}) {
    return this.find({ userId, problemId, type: 'problem' }, { sort: { createdAt: -1 }, ...options });
  }
}

export default new SubmissionRepository();
