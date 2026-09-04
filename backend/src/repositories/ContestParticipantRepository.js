import { BaseRepository } from './BaseRepository.js';
import { ContestParticipant } from '../models/index.js';

export class ContestParticipantRepository extends BaseRepository {
  constructor() {
    super(ContestParticipant);
  }

  async findByContestAndUser(contestId, userId) {
    return this.findOne({ contestId, userId });
  }

  async findByContest(contestId) {
    return ContestParticipant.find({ contestId })
      .sort({ score: -1, penaltyMinutes: 1, registeredAt: 1 })
      .lean()
      .exec();
  }

  async countByUser(userId) {
    return ContestParticipant.countDocuments({ userId });
  }

  async countWinsByUser(userId) {
    return ContestParticipant.countDocuments({ userId, rank: 1 });
  }

  async register(contestId, userId, username) {
    try {
      return await this.create({
        contestId,
        userId,
        username,
        score: 0,
        penaltyMinutes: 0,
      });
    } catch (error) {
      if (error.code === 11000) {
        return this.findByContestAndUser(contestId, userId);
      }
      throw error;
    }
  }

  async updateScore(participantId, score, penaltyMinutes) {
    return this.updateById(participantId, { score, penaltyMinutes });
  }

  async updateRank(participantId, rank) {
    return this.updateById(participantId, { rank });
  }
}

export default new ContestParticipantRepository();
