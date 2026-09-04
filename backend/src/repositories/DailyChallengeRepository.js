import { BaseRepository } from './BaseRepository.js';
import { DailyChallenge, DailyChallengeCompletion } from '../models/index.js';

export class DailyChallengeRepository extends BaseRepository {
  constructor() {
    super(DailyChallenge);
  }

  getStartOfDay(date = new Date()) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  async findByDate(date = new Date()) {
    const start = this.getStartOfDay(date);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    return DailyChallenge.findOne({
      date: { $gte: start, $lt: end },
      isActive: true,
    })
      .lean()
      .exec();
  }

  async findCompletion(userId, challengeId) {
    return DailyChallengeCompletion.findOne({ userId, challengeId }).lean().exec();
  }

  async countCompletionsForUser(userId) {
    return DailyChallengeCompletion.countDocuments({ userId });
  }

  async recordCompletion(userId, challengeId, xpAwarded) {
    try {
      return await DailyChallengeCompletion.create({
        userId,
        challengeId,
        xpAwarded,
      });
    } catch (error) {
      if (error.code === 11000) return null;
      throw error;
    }
  }
}

export default new DailyChallengeRepository();
