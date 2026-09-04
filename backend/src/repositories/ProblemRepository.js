import { BaseRepository } from './BaseRepository.js';
import { Problem } from '../models/index.js';

export class ProblemRepository extends BaseRepository {
  constructor() {
    super(Problem);
  }

  async findBySlug(slug) {
    return this.findOne({ slug: slug.toLowerCase() });
  }

  async findPublished(filter = {}, options = {}) {
    return this.find({ ...filter, status: 'published' }, options);
  }

  async findByTopicSlug(topicSlug, options = {}) {
    return this.find(
      { topicSlugs: topicSlug.toLowerCase(), status: 'published' },
      options
    );
  }

  async findByDifficulty(difficulty, options = {}) {
    return this.find({ difficulty, status: 'published' }, options);
  }

  async incrementSubmissionStats(problemId, accepted = false) {
    const update = { $inc: { totalSubmissions: 1 } };
    if (accepted) {
      update.$inc.totalAccepted = 1;
    }

    const problem = await Problem.findByIdAndUpdate(problemId, update, { new: true }).lean().exec();

    if (problem && problem.totalSubmissions > 0) {
      const rate = Math.round((problem.totalAccepted / problem.totalSubmissions) * 100);
      await Problem.findByIdAndUpdate(problemId, { acceptanceRate: rate }).exec();
    }

    return problem;
  }

  async search(query, options = {}) {
    return this.find(
      { $text: { $search: query }, status: 'published' },
      { sort: { score: { $meta: 'textScore' } }, ...options }
    );
  }

  async findPublishedFiltered(filter = {}, options = {}) {
    return this.find({ ...filter, status: 'published' }, options);
  }

  async countPublished(filter = {}) {
    return this.count({ ...filter, status: 'published' });
  }
}

export default new ProblemRepository();
