import { TOPIC_CATEGORIES } from 'shared/constants';
import topicRepository from '../repositories/TopicRepository.js';
import userProgressRepository from '../repositories/UserProgressRepository.js';
import userRepository from '../repositories/UserRepository.js';
import { UserProgress } from '../models/index.js';
import AppError from '../utils/AppError.js';
import gamificationService from './GamificationService.js';

const CATEGORY_LABELS = {
  [TOPIC_CATEGORIES.FUNDAMENTALS]: 'Fundamentals',
  [TOPIC_CATEGORIES.LINEAR]: 'Linear Structures',
  [TOPIC_CATEGORIES.TREES]: 'Trees & Heaps',
  [TOPIC_CATEGORIES.GRAPHS]: 'Graphs',
  [TOPIC_CATEGORIES.ADVANCED]: 'Advanced Topics',
};

const CATEGORY_ORDER = [
  TOPIC_CATEGORIES.FUNDAMENTALS,
  TOPIC_CATEGORIES.LINEAR,
  TOPIC_CATEGORIES.TREES,
  TOPIC_CATEGORIES.GRAPHS,
  TOPIC_CATEGORIES.ADVANCED,
];

const DEFAULT_PROGRESS = {
  status: 'not_started',
  progressPercent: 0,
  completedAt: null,
  xpAwarded: false,
};

const formatProgress = (progress) => {
  if (!progress) return { ...DEFAULT_PROGRESS };
  return {
    status: progress.status,
    progressPercent: progress.progressPercent ?? 0,
    completedAt: progress.completedAt ?? null,
    xpAwarded: progress.xpAwarded ?? false,
  };
};

const formatTopicSummary = (topic, progress) => ({
  id: topic._id.toString(),
  slug: topic.slug,
  title: topic.title,
  category: topic.category,
  difficulty: topic.difficulty,
  order: topic.order,
  estimatedMinutes: topic.estimatedMinutes,
  xpReward: topic.xpReward,
  tags: topic.tags ?? [],
  progress: formatProgress(progress),
});

const formatProblemSummary = (problem) => ({
  id: problem._id.toString(),
  slug: problem.slug,
  title: problem.title,
  difficulty: problem.difficulty,
});

const formatQuizSummary = (quiz) => {
  if (!quiz) return null;
  return {
    id: quiz._id.toString(),
    title: quiz.title,
  };
};

export class LearningService {
  async listTopics(userId) {
    const [topics, progressRecords] = await Promise.all([
      topicRepository.findAllPublished({
        select: 'slug title category difficulty order estimatedMinutes xpReward tags',
      }),
      userProgressRepository.findAllByUser(userId),
    ]);

    const progressByTopicId = new Map(
      progressRecords.map((record) => [record.topicId.toString(), record])
    );

    const categories = CATEGORY_ORDER.map((category) => {
      const categoryTopics = topics
        .filter((topic) => topic.category === category)
        .map((topic) =>
          formatTopicSummary(topic, progressByTopicId.get(topic._id.toString()))
        );

      return {
        category,
        label: CATEGORY_LABELS[category] ?? category,
        topics: categoryTopics,
      };
    }).filter((group) => group.topics.length > 0);

    const allProgress = topics.map((topic) =>
      formatProgress(progressByTopicId.get(topic._id.toString()))
    );

    return {
      categories,
      summary: {
        total: topics.length,
        completed: allProgress.filter((item) => item.status === 'completed').length,
        inProgress: allProgress.filter((item) => item.status === 'in_progress').length,
      },
    };
  }

  async getTopicBySlug(userId, slug) {
    const topic = await topicRepository.findPublishedBySlug(slug, {
      populate: [
        { path: 'quizId', select: 'title status' },
        { path: 'relatedProblems', select: 'slug title difficulty status' },
        { path: 'navigation.previousLesson', select: 'slug title category order' },
        { path: 'navigation.nextLesson', select: 'slug title category order' },
        { path: 'navigation.relatedLessons', select: 'slug title' },
        { path: 'navigation.suggestedLessons', select: 'slug title' },
      ],
    });

    if (!topic) {
      throw new AppError('Topic not found', 404);
    }

    let progress = await userProgressRepository.findByUserAndTopic(userId, topic._id);

    if (!progress || progress.status === 'not_started') {
      progress = await userProgressRepository.markInProgress(userId, topic._id);
    }

    const relatedProblems = (topic.relatedProblems ?? [])
      .filter((problem) => problem?.status === 'published')
      .map(formatProblemSummary);

    const quiz =
      topic.quizId && topic.quizId.status === 'published'
        ? formatQuizSummary(topic.quizId)
        : null;

    return {
      id: topic._id.toString(),
      slug: topic.slug,
      title: topic.title,
      category: topic.category,
      categoryLabel: CATEGORY_LABELS[topic.category] ?? topic.category,
      difficulty: topic.difficulty,
      estimatedMinutes: topic.estimatedMinutes,
      xpReward: topic.xpReward,
      tags: topic.tags ?? [],
      content: topic.content,
      animationConfig: topic.animationConfig,
      progress: formatProgress(progress),
      quiz,
      relatedProblems,
      links: {
        visualizer: `/visualizer/${topic.animationConfig?.type ?? topic.slug}`,
        quiz: quiz ? `/quizzes/${quiz.id}` : null,
        aiTutor: `/ai-tutor?topic=${topic.slug}`,
      },
      navigation: {
        previousLesson: topic.navigation?.previousLesson
          ? {
              slug: topic.navigation.previousLesson.slug,
              title: topic.navigation.previousLesson.title,
            }
          : null,
        nextLesson: topic.navigation?.nextLesson
          ? {
              slug: topic.navigation.nextLesson.slug,
              title: topic.navigation.nextLesson.title,
            }
          : null,
        relatedLessons: (topic.navigation?.relatedLessons ?? []).map((lesson) => ({
          slug: lesson.slug,
          title: lesson.title,
        })),
        suggestedLessons: (topic.navigation?.suggestedLessons ?? []).map((lesson) => ({
          slug: lesson.slug,
          title: lesson.title,
        })),
      },
    };
  }

  async updateProgress(userId, slug, { status, addMinutes } = {}) {
    const topic = await topicRepository.findPublishedBySlug(slug);
    if (!topic) {
      throw new AppError('Topic not found', 404);
    }

    if (addMinutes != null) {
      await userProgressRepository.addTimeSpent(userId, topic._id, addMinutes);
    }

    if (!status) {
      const progress = await userProgressRepository.findByUserAndTopic(userId, topic._id);
      return {
        progress: formatProgress(progress),
        xpAwarded: 0,
        gamification: null,
      };
    }

    if (status === 'in_progress') {
      const progress = await userProgressRepository.markInProgress(userId, topic._id);
      return {
        progress: formatProgress(progress),
        xpAwarded: 0,
        gamification: null,
      };
    }

    if (status !== 'completed') {
      throw new AppError('Invalid progress status', 400);
    }

    const existing = await userProgressRepository.findByUserAndTopic(userId, topic._id);
    let xpAwarded = 0;
    let updatedUser = null;

    if (!existing?.xpAwarded) {
      xpAwarded = topic.xpReward ?? 0;
      updatedUser = await userRepository.addXP(userId, xpAwarded);
      if (!existing || existing.status !== 'completed') {
        await userRepository.incrementStat(userId, 'topicsCompleted');
      }
    }

    const progress = await UserProgress.findOneAndUpdate(
      { userId, topicId: topic._id },
      {
        status: 'completed',
        progressPercent: 100,
        completedAt: new Date(),
        xpAwarded: true,
      },
      { new: true, upsert: true, runValidators: true }
    )
      .lean()
      .exec();

    if (!updatedUser) {
      updatedUser = await userRepository.findById(userId);
    }

    const activity = await gamificationService.processActivity(userId, {
      activityType: 'topic_complete',
    });

    return {
      progress: formatProgress(progress),
      xpAwarded,
      gamification: activity.gamification ?? updatedUser?.gamification ?? null,
      stats: activity.stats ?? updatedUser?.stats ?? null,
      newBadges: activity.newBadges ?? [],
      dailyChallengeCompleted: activity.dailyChallengeCompleted ?? false,
      bonusXp: activity.xpBonus ?? 0,
      coinsEarned: activity.coinsEarned ?? 0,
    };
  }
}

export default new LearningService();
