import { BaseRepository } from './BaseRepository.js';
import { UserProgress } from '../models/index.js';

export class UserProgressRepository extends BaseRepository {
  constructor() {
    super(UserProgress);
  }

  async findByUserAndTopic(userId, topicId) {
    return this.findOne({ userId, topicId });
  }

  async markInProgress(userId, topicId) {
    return UserProgress.findOneAndUpdate(
      { userId, topicId },
      {
        status: 'in_progress',
        progressPercent: 50,
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    )
      .lean()
      .exec();
  }

  async findAllByUser(userId) {
    return UserProgress.find({ userId }).lean().exec();
  }

  async markCompleted(userId, topicId) {
    return UserProgress.findOneAndUpdate(
      { userId, topicId },
      {
        status: 'completed',
        progressPercent: 100,
        completedAt: new Date(),
      },
      { new: true, upsert: true, runValidators: true }
    )
      .lean()
      .exec();
  }

  async getUserSummary(userId) {
    const [total, completed, inProgress] = await Promise.all([
      UserProgress.countDocuments({ userId }),
      UserProgress.countDocuments({ userId, status: 'completed' }),
      UserProgress.countDocuments({ userId, status: 'in_progress' }),
    ]);

    return { total, completed, inProgress };
  }

  async addTimeSpent(userId, topicId, minutes) {
    return UserProgress.findOneAndUpdate(
      { userId, topicId },
      { $inc: { timeSpentMinutes: minutes } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    )
      .lean()
      .exec();
  }
}

export default new UserProgressRepository();
