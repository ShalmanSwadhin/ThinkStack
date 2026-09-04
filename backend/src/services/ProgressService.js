import mongoose from 'mongoose';
import { TOPIC_CATEGORIES } from 'shared/constants';
import userRepository from '../repositories/UserRepository.js';
import userProgressRepository from '../repositories/UserProgressRepository.js';
import submissionRepository from '../repositories/SubmissionRepository.js';
import dashboardService from './DashboardService.js';
import { Topic, UserProgress, Submission, QuizAttempt, Problem } from '../models/index.js';
import AppError from '../utils/AppError.js';

const CATEGORY_LABELS = {
  [TOPIC_CATEGORIES.FUNDAMENTALS]: 'Fundamentals',
  [TOPIC_CATEGORIES.LINEAR]: 'Linear Structures',
  [TOPIC_CATEGORIES.TREES]: 'Trees & Heaps',
  [TOPIC_CATEGORIES.GRAPHS]: 'Graphs',
  [TOPIC_CATEGORIES.ADVANCED]: 'Advanced Topics',
};

const TIMELINE_DAYS = 30;
const WEAK_CATEGORY_THRESHOLD = 50;
const WEAK_QUIZ_SCORE = 70;

const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const buildDateRange = (days) => {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date(today);
    date.setDate(date.getDate() - index);
    dates.push(formatLocalDate(date));
  }

  return dates;
};

const countByDay = (items, field) => {
  const counts = {};
  for (const item of items) {
    const value = item[field];
    if (!value) continue;
    const day = formatLocalDate(new Date(value));
    counts[day] = (counts[day] ?? 0) + 1;
  }
  return counts;
};

export class ProgressService {
  async getProgress(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const since = new Date();
    since.setDate(since.getDate() - (TIMELINE_DAYS - 1));
    since.setHours(0, 0, 0, 0);

    const [
      categoryProgress,
      publishedTopicCount,
      progressSummary,
      totalTimeSpent,
      timeByCategory,
      topicDetails,
      completedTopics,
      acceptedSubmissions,
      recentQuizAttempts,
      allQuizAttempts,
      statusSets,
    ] = await Promise.all([
      dashboardService.getCategoryProgress(userId),
      Topic.countDocuments({ status: 'published' }),
      userProgressRepository.getUserSummary(userId),
      UserProgress.aggregate([
        { $match: { userId: userObjectId } },
        { $group: { _id: null, total: { $sum: '$timeSpentMinutes' } } },
      ]),
      UserProgress.aggregate([
        { $match: { userId: userObjectId, timeSpentMinutes: { $gt: 0 } } },
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
        {
          $group: {
            _id: '$topic.category',
            minutes: { $sum: '$timeSpentMinutes' },
          },
        },
      ]),
      UserProgress.find({ userId })
        .populate('topicId', 'slug title category status')
        .sort({ updatedAt: -1 })
        .lean()
        .exec(),
      UserProgress.find({
        userId,
        status: 'completed',
        completedAt: { $gte: since },
      })
        .select('completedAt')
        .lean()
        .exec(),
      Submission.find({
        userId,
        type: 'problem',
        verdict: 'accepted',
        createdAt: { $gte: since },
      })
        .select('createdAt')
        .lean()
        .exec(),
      QuizAttempt.find({ userId, createdAt: { $gte: since } })
        .select('createdAt')
        .lean()
        .exec(),
      QuizAttempt.find({ userId })
        .sort({ createdAt: -1 })
        .populate({
          path: 'quizId',
          select: 'title topicId',
          populate: { path: 'topicId', select: 'slug title' },
        })
        .lean()
        .exec(),
      submissionRepository.getUserProblemStatusSets(userId),
    ]);

    const activityTimeline = this.buildActivityTimeline(
      buildDateRange(TIMELINE_DAYS),
      completedTopics,
      acceptedSubmissions,
      recentQuizAttempts
    );

    const formattedTimeByCategory = Object.values(TOPIC_CATEGORIES).map((category) => {
      const row = timeByCategory.find((item) => item._id === category);
      return {
        category,
        label: CATEGORY_LABELS[category] ?? category,
        minutes: row?.minutes ?? 0,
      };
    });

    const formattedTopicDetails = topicDetails
      .filter((record) => record.topicId?.status === 'published')
      .map((record) => ({
        slug: record.topicId.slug,
        title: record.topicId.title,
        category: record.topicId.category,
        categoryLabel: CATEGORY_LABELS[record.topicId.category] ?? record.topicId.category,
        status: record.status,
        progressPercent: record.progressPercent ?? 0,
        timeSpentMinutes: record.timeSpentMinutes ?? 0,
        completedAt: record.completedAt ?? null,
        updatedAt: record.updatedAt,
      }));

    const weakAreas = await this.detectWeakAreas({
      userId,
      categoryProgress,
      topicDetails: formattedTopicDetails,
      quizAttempts: allQuizAttempts,
      statusSets,
    });

    return {
      overview: {
        xp: user.gamification?.xp ?? 0,
        level: user.gamification?.level ?? 0,
        topicsTotal: publishedTopicCount,
        topicsCompleted: user.stats?.topicsCompleted ?? progressSummary.completed,
        topicsInProgress: progressSummary.inProgress,
        problemsSolved: user.stats?.problemsSolved ?? 0,
        quizzesPassed: user.stats?.quizzesPassed ?? 0,
        quizzesAttempted: allQuizAttempts.length,
        totalTimeSpentMinutes: totalTimeSpent[0]?.total ?? 0,
      },
      categoryProgress,
      activityTimeline,
      timeByCategory: formattedTimeByCategory,
      topicDetails: formattedTopicDetails,
      weakAreas,
    };
  }

  buildActivityTimeline(dates, completedTopics, acceptedSubmissions, quizAttempts) {
    const topicCounts = countByDay(completedTopics, 'completedAt');
    const problemCounts = countByDay(acceptedSubmissions, 'createdAt');
    const quizCounts = countByDay(quizAttempts, 'createdAt');

    return dates.map((date) => {
      const topicsCompleted = topicCounts[date] ?? 0;
      const problemsSolved = problemCounts[date] ?? 0;
      const quizAttemptCount = quizCounts[date] ?? 0;

      return {
        date,
        topicsCompleted,
        problemsSolved,
        quizAttempts: quizAttemptCount,
        total: topicsCompleted + problemsSolved + quizAttemptCount,
      };
    });
  }

  async detectWeakAreas({ userId, categoryProgress, topicDetails, quizAttempts, statusSets }) {
    const weakCategories = categoryProgress
      .filter((item) => item.total > 0 && item.percentComplete < WEAK_CATEGORY_THRESHOLD)
      .sort((a, b) => a.percentComplete - b.percentComplete)
      .slice(0, 3)
      .map((item) => ({
        category: item.category,
        label: item.label,
        percentComplete: item.percentComplete,
        completed: item.completed,
        total: item.total,
        recommendation: `Review ${item.label} — only ${item.percentComplete}% complete`,
      }));

    const stuckTopics = topicDetails
      .filter((topic) => topic.status === 'in_progress')
      .slice(0, 5)
      .map((topic) => ({
        slug: topic.slug,
        title: topic.title,
        categoryLabel: topic.categoryLabel,
        reason: 'Started but not yet completed',
      }));

    const seenQuizzes = new Set();
    const weakQuizzes = [];
    for (const attempt of quizAttempts) {
      if (!attempt.quizId) continue;
      const quizId = attempt.quizId._id.toString();
      if (seenQuizzes.has(quizId)) continue;
      seenQuizzes.add(quizId);

      if (!attempt.passed || attempt.score < WEAK_QUIZ_SCORE) {
        weakQuizzes.push({
          id: quizId,
          title: attempt.quizId.title,
          score: attempt.score,
          passed: attempt.passed,
          topicSlug: attempt.quizId.topicId?.slug ?? null,
          recommendation: 'Retake this quiz to strengthen understanding',
        });
      }
      if (weakQuizzes.length >= 5) break;
    }

    const unsolvedIds = [...statusSets.attempted].filter((id) => !statusSets.solved.has(id));
    let weakProblems = [];

    if (unsolvedIds.length > 0) {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      const objectIds = unsolvedIds.map((id) => new mongoose.Types.ObjectId(id));
      const problems = await Problem.find({ _id: { $in: objectIds }, status: 'published' })
        .select('slug title difficulty topicSlugs')
        .lean()
        .exec();

      const attemptCounts = await Submission.aggregate([
        {
          $match: {
            userId: userObjectId,
            type: 'problem',
            problemId: { $in: objectIds },
          },
        },
        { $group: { _id: '$problemId', attempts: { $sum: 1 } } },
      ]);

      weakProblems = problems.slice(0, 5).map((problem) => {
        const countRow = attemptCounts.find(
          (row) => row._id.toString() === problem._id.toString()
        );
        return {
          slug: problem.slug,
          title: problem.title,
          difficulty: problem.difficulty,
          topicSlugs: problem.topicSlugs ?? [],
          attemptCount: countRow?.attempts ?? 1,
          recommendation: 'Keep practicing — not yet solved',
        };
      });
    }

    return {
      categories: weakCategories,
      topics: stuckTopics,
      quizzes: weakQuizzes,
      problems: weakProblems,
    };
  }
}

export default new ProgressService();
