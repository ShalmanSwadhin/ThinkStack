import { BaseRepository } from './BaseRepository.js';
import { Quiz, QuizAttempt } from '../models/index.js';

export class QuizRepository extends BaseRepository {
  constructor() {
    super(Quiz);
  }

  async findByTopicId(topicId) {
    return this.findOne({ topicId, status: 'published' });
  }

  async findPublishedById(id, options = {}) {
    return this.findOne({ _id: id, status: 'published' }, options);
  }

  async findPublished(options = {}) {
    return this.find({ status: 'published' }, options);
  }
}

export class QuizAttemptRepository extends BaseRepository {
  constructor() {
    super(QuizAttempt);
  }

  async findBestAttempt(userId, quizId) {
    return QuizAttempt.findOne({ userId, quizId })
      .sort({ score: -1 })
      .lean()
      .exec();
  }

  async hasPassedWithXP(userId, quizId) {
    return QuizAttempt.exists({ userId, quizId, passed: true, xpAwarded: true });
  }

  async findByUserAndQuiz(userId, quizId, options = {}) {
    return this.find({ userId, quizId }, { sort: { createdAt: -1 }, ...options });
  }

  async getBestAttemptsByUser(userId, quizIds = []) {
    const match = { userId };
    if (quizIds.length) {
      match.quizId = { $in: quizIds };
    }

    return QuizAttempt.aggregate([
      { $match: match },
      { $sort: { score: -1, createdAt: -1 } },
      {
        $group: {
          _id: '$quizId',
          bestScore: { $first: '$score' },
          passed: { $first: '$passed' },
          attemptCount: { $sum: 1 },
          lastAttemptAt: { $first: '$createdAt' },
        },
      },
    ]);
  }
}

export const quizRepository = new QuizRepository();
export const quizAttemptRepository = new QuizAttemptRepository();

export default quizRepository;
