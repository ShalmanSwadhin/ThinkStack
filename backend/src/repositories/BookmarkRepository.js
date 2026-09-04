import { BaseRepository } from './BaseRepository.js';
import { Bookmark } from '../models/index.js';

export class BookmarkRepository extends BaseRepository {
  constructor() {
    super(Bookmark);
  }

  async findByUserAndTarget(userId, targetType, targetId) {
    return this.model.findOne({ userId, targetType, targetId }).lean().exec();
  }

  async deleteByUserAndTarget(userId, targetType, targetId) {
    return this.model.findOneAndDelete({ userId, targetType, targetId }).lean().exec();
  }
}

export default new BookmarkRepository();
