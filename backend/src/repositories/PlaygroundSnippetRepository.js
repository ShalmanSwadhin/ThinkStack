import { BaseRepository } from './BaseRepository.js';
import { PlaygroundSnippet } from '../models/index.js';

export class PlaygroundSnippetRepository extends BaseRepository {
  constructor() {
    super(PlaygroundSnippet);
  }

  async findByUser(userId, options = {}) {
    return this.find({ userId, isDeleted: false }, { sort: { updatedAt: -1 }, ...options });
  }

  async findByIdForUser(id, userId) {
    return this.findOne({ _id: id, userId, isDeleted: false });
  }

  async softDelete(id, userId) {
    return this.model
      .findOneAndUpdate(
        { _id: id, userId, isDeleted: false },
        { isDeleted: true },
        { new: true }
      )
      .lean()
      .exec();
  }
}

export default new PlaygroundSnippetRepository();
