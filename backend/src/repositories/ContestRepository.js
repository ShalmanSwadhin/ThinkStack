import { BaseRepository } from './BaseRepository.js';
import { Contest } from '../models/index.js';

export class ContestRepository extends BaseRepository {
  constructor() {
    super(Contest);
  }

  async findBySlug(slug, options = {}) {
    return this.findOne({ slug: slug.toLowerCase() }, options);
  }

  async findFiltered(filter = {}, options = {}) {
    return this.find(filter, {
      sort: { startTime: -1 },
      ...options,
    });
  }

  async syncStatus(contestId, status) {
    return this.updateById(contestId, { status });
  }
}

export default new ContestRepository();
