import { BaseRepository } from './BaseRepository.js';
import { SearchHistory } from '../models/index.js';

const MAX_HISTORY_PER_USER = 30;

export class SearchHistoryRepository extends BaseRepository {
  constructor() {
    super(SearchHistory);
  }

  async upsertQuery(userId, query) {
    const entry = await this.model.findOneAndUpdate(
      { userId, query },
      { lastSearchedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const count = await this.model.countDocuments({ userId });
    if (count > MAX_HISTORY_PER_USER) {
      const oldest = await this.model
        .find({ userId })
        .sort({ lastSearchedAt: 1 })
        .limit(count - MAX_HISTORY_PER_USER)
        .select('_id')
        .lean()
        .exec();
      const ids = oldest.map((item) => item._id);
      if (ids.length) {
        await this.model.deleteMany({ _id: { $in: ids } });
      }
    }

    return entry;
  }

  async listRecent(userId, limit = 10) {
    return this.model
      .find({ userId })
      .sort({ lastSearchedAt: -1 })
      .limit(limit)
      .lean()
      .exec();
  }

  async clearAll(userId) {
    return this.model.deleteMany({ userId });
  }
}

export default new SearchHistoryRepository();
