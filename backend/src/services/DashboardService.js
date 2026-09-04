import { TOPIC_CATEGORIES } from 'shared/constants';
import mongoose from 'mongoose';
import userRepository from '../repositories/UserRepository.js';
import dailyChallengeRepository from '../repositories/DailyChallengeRepository.js';
import { Topic, UserProgress, Submission, QuizAttempt } from '../models/index.js';
import AppError from '../utils/AppError.js';
import notificationService from './NotificationService.js';

const CATEGORY_LABELS = {
  [TOPIC_CATEGORIES.FUNDAMENTALS]: 'Fundamentals',
  [TOPIC_CATEGORIES.LINEAR]: 'Linear Structures',
  [TOPIC_CATEGORIES.TREES]: 'Trees & Heaps',
  [TOPIC_CATEGORIES.GRAPHS]: 'Graphs',
  [TOPIC_CATEGORIES.ADVANCED]: 'Advanced Topics',
};

const RECENT_ACTIVITY_LIMIT = 8;

const formatTopic = (topic) => ({
  id: topic._id.toString(),
  slug: topic.slug,
  title: topic.title,
  category: topic.category,
  difficulty: topic.difficulty,
  estimatedMinutes: topic.estimatedMinutes,
});

export class DashboardService {
  async getDashboard(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    await notificationService.maybeSendStreakReminder(userId);

    const [categoryProgress, dailyChallenge, recommendedTopic, recentActivity] =
      await Promise.all([
        this.getCategoryProgress(userId),
        this.getDailyChallenge(userId),
        this.getRecommendedTopic(userId),
        this.getRecentActivity(userId),
      ]);

    return {
      stats: {
        xp: user.gamification?.xp ?? 0,
        level: user.gamification?.level ?? 0,
        coins: user.gamification?.coins ?? 0,
        streak: {
          current: user.gamification?.streak?.current ?? 0,
          longest: user.gamification?.streak?.longest ?? 0,
        },
        problemsSolved: user.stats?.problemsSolved ?? 0,
        topicsCompleted: user.stats?.topicsCompleted ?? 0,
        quizzesPassed: user.stats?.quizzesPassed ?? 0,
      },
      categoryProgress,
      dailyChallenge,
      recommendedTopic,
      recentActivity,
    };
  }

  async getCategoryProgress(userId) {
    const categories = Object.values(TOPIC_CATEGORIES);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const [topicCounts, completedCounts] = await Promise.all([
      Topic.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: '$category', total: { $sum: 1 } } },
      ]),
      UserProgress.aggregate([
        { $match: { userId: userObjectId, status: 'completed' } },
        {
          $lookup: {
            from: 'topics',
            localField: 'topicId',
            foreignField: '_id',
            as: 'topic',
          },
        },
        { $unwind: '$topic' },
        { $match: { 'topic.status': 'published' } },
        { $group: { _id: '$topic.category', completed: { $sum: 1 } } },
      ]),
    ]);

    const totalByCategory = Object.fromEntries(topicCounts.map((row) => [row._id, row.total]));
    const completedByCategory = Object.fromEntries(
      completedCounts.map((row) => [row._id, row.completed])
    );

    return categories.map((category) => {
      const total = totalByCategory[category] ?? 0;
      const completed = completedByCategory[category] ?? 0;
      return {
        category,
        label: CATEGORY_LABELS[category] ?? category,
        completed,
        total,
        percentComplete: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });
  }

  async getDailyChallenge(userId) {
    const challenge = await dailyChallengeRepository.findByDate();
    if (!challenge) {
      return null;
    }

    const completion = await dailyChallengeRepository.findCompletion(userId, challenge._id);

    return {
      id: challenge._id.toString(),
      type: challenge.type,
      description: challenge.description,
      xpReward: challenge.xpReward,
      completed: Boolean(completion),
      completedAt: completion?.completedAt ?? null,
    };
  }

  async getRecommendedTopic(userId) {
    const completedTopicIds = await UserProgress.find({
      userId,
      status: 'completed',
    })
      .distinct('topicId')
      .exec();

    const nextTopic = await Topic.findOne({
      status: 'published',
      _id: { $nin: completedTopicIds },
    })
      .sort({ order: 1 })
      .select('slug title category difficulty estimatedMinutes')
      .lean()
      .exec();

    return nextTopic ? formatTopic(nextTopic) : null;
  }

  async getRecentActivity(userId) {
    const limit = RECENT_ACTIVITY_LIMIT;

    const [submissions, quizAttempts] = await Promise.all([
      Submission.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('problemId', 'title slug')
        .select('verdict createdAt problemId language type')
        .lean()
        .exec(),
      QuizAttempt.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('quizId', 'title')
        .select('score passed createdAt quizId')
        .lean()
        .exec(),
    ]);

    const activities = [
      ...submissions.map((submission) => ({
        type: 'submission',
        id: submission._id.toString(),
        title: submission.problemId?.title ?? 'Code submission',
        slug: submission.problemId?.slug ?? null,
        verdict: submission.verdict,
        language: submission.language,
        createdAt: submission.createdAt,
      })),
      ...quizAttempts.map((attempt) => ({
        type: 'quiz',
        id: attempt._id.toString(),
        title: attempt.quizId?.title ?? 'Quiz attempt',
        score: attempt.score,
        passed: attempt.passed,
        createdAt: attempt.createdAt,
      })),
    ];

    return activities
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }
}

export default new DashboardService();
