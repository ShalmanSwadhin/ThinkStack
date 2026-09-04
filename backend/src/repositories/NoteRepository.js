import { BaseRepository } from './BaseRepository.js';
import { Note } from '../models/index.js';

export class NoteRepository extends BaseRepository {
  constructor() {
    super(Note);
  }

  async findByUser(userId, filter = {}, options = {}) {
    return this.find(
      { userId, isDeleted: false, ...filter },
      { sort: { updatedAt: -1 }, ...options }
    );
  }

  async findByIdForUser(id, userId, options = {}) {
    return this.findOne({ _id: id, userId, isDeleted: false }, options);
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

export default new NoteRepository();
