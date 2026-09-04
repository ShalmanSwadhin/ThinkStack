import { BaseRepository } from './BaseRepository.js';
import { AITutorConversation } from '../models/index.js';

const MAX_CONVERSATIONS_PER_USER = 50;

export class AITutorConversationRepository extends BaseRepository {
  constructor() {
    super(AITutorConversation);
  }

  async findByIdForUser(id, userId) {
    return this.findOne({ _id: id, userId });
  }

  async findByUser(userId, options = {}) {
    return this.find({ userId }, { sort: { updatedAt: -1 }, ...options });
  }

  async appendMessages(id, userId, newMessages) {
    return this.model
      .findOneAndUpdate(
        { _id: id, userId },
        { $push: { messages: { $each: newMessages } } },
        { new: true, runValidators: true }
      )
      .lean()
      .exec();
  }

  async updateTitle(id, userId, title) {
    return this.model
      .findOneAndUpdate({ _id: id, userId }, { title }, { new: true })
      .lean()
      .exec();
  }

  async deleteForUser(id, userId) {
    return this.model.findOneAndDelete({ _id: id, userId }).lean().exec();
  }

  async pruneOldConversations(userId, max = MAX_CONVERSATIONS_PER_USER) {
    const total = await this.count({ userId });
    if (total <= max) return 0;

    const excess = total - max;
    const oldest = await this.model
      .find({ userId })
      .sort({ updatedAt: 1 })
      .limit(excess)
      .select('_id')
      .lean()
      .exec();

    if (!oldest.length) return 0;

    const ids = oldest.map((doc) => doc._id);
    await this.model.deleteMany({ _id: { $in: ids } }).exec();
    return ids.length;
  }
}

export default new AITutorConversationRepository();
