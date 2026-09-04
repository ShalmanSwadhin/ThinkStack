import { ROLES, TOPIC_CATEGORIES, DIFFICULTY } from 'shared/constants';
import userRepository from '../repositories/UserRepository.js';
import topicRepository from '../repositories/TopicRepository.js';
import problemRepository from '../repositories/ProblemRepository.js';
import quizRepository from '../repositories/QuizRepository.js';
import contestRepository from '../repositories/ContestRepository.js';
import announcementRepository from '../repositories/AnnouncementRepository.js';
import contestService from './ContestService.js';
import notificationService from './NotificationService.js';
import { buildTopicContent } from '../seed/data/topics.js';
import { buildQuizQuestions } from '../seed/data/quizzes.js';
import { toCsv } from '../utils/csvExport.js';
import { resolveEffectiveContestStatus } from '../utils/contestScoring.js';
import AppError from '../utils/AppError.js';
import visualizerRepository from '../repositories/VisualizerRepository.js';
import certificateRepository from '../repositories/CertificateRepository.js';
import platformSettingsRepository from '../repositories/PlatformSettingsRepository.js';
import badgeRepository from '../repositories/BadgeRepository.js';
import dailyChallengeRepository from '../repositories/DailyChallengeRepository.js';
import {
  User,
  Topic,
  Problem,
  Quiz,
  Contest,
  Submission,
  UserProgress,
  Badge,
  DailyChallenge,
  Announcement,
} from '../models/index.js';

const ANALYTICS_DAYS = 30;

const formatLocalDate = (date) => {
  const value = new Date(date);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
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

const fillTimeline = (rows, dateField = '_id') => {
  const counts = Object.fromEntries(rows.map((row) => [row[dateField], row.count]));
  return buildDateRange(ANALYTICS_DAYS).map((date) => ({
    date,
    count: counts[date] ?? 0,
  }));
};

const parseSort = (sortParam, defaultSort) => {
  if (!sortParam) return defaultSort;
  const desc = sortParam.startsWith('-');
  const field = desc ? sortParam.slice(1) : sortParam;
  return { [field]: desc ? -1 : 1 };
};

const formatUser = (user) => ({
  id: user._id.toString(),
  username: user.username,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  isSuspended: user.isSuspended,
  xp: user.gamification?.xp ?? 0,
  level: user.gamification?.level ?? 0,
  problemsSolved: user.stats?.problemsSolved ?? 0,
  createdAt: user.createdAt,
  lastLoginAt: user.lastLoginAt ?? null,
});

export class AdminService {
  async getAnalytics() {
    const since = new Date();
    since.setDate(since.getDate() - (ANALYTICS_DAYS - 1));
    since.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      publishedTopics,
      publishedProblems,
      publishedQuizzes,
      totalContests,
      totalSubmissions,
      userGrowthRows,
      submissionRows,
      popularTopics,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ isActive: true, isSuspended: false }),
      User.countDocuments({ isSuspended: true }),
      Topic.countDocuments({ status: 'published' }),
      Problem.countDocuments({ status: 'published' }),
      Quiz.countDocuments({ status: 'published' }),
      Contest.countDocuments({}),
      Submission.countDocuments({}),
      User.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
      ]),
      Submission.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
      ]),
      UserProgress.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: '$topicId', completions: { $sum: 1 } } },
        { $sort: { completions: -1 } },
        { $limit: 8 },
        {
          $lookup: {
            from: 'topics',
            localField: '_id',
            foreignField: '_id',
            as: 'topic',
          },
        },
        { $unwind: '$topic' },
        {
          $project: {
            slug: '$topic.slug',
            title: '$topic.title',
            category: '$topic.category',
            completions: 1,
          },
        },
      ]),
    ]);

    return {
      overview: {
        totalUsers,
        activeUsers,
        suspendedUsers,
        publishedTopics,
        publishedProblems,
        publishedQuizzes,
        totalContests,
        totalSubmissions,
      },
      userGrowth: fillTimeline(userGrowthRows),
      submissionActivity: fillTimeline(submissionRows),
      popularTopics,
    };
  }

  async exportReport(type) {
    if (type === 'users') {
      const users = await User.find({})
        .select('username email role isActive isSuspended createdAt gamification.xp stats.problemsSolved')
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      const csv = toCsv(
        ['username', 'email', 'role', 'isActive', 'isSuspended', 'xp', 'problemsSolved', 'createdAt'],
        users.map((user) => ({
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          isSuspended: user.isSuspended,
          xp: user.gamification?.xp ?? 0,
          problemsSolved: user.stats?.problemsSolved ?? 0,
          createdAt: user.createdAt?.toISOString?.() ?? '',
        }))
      );

      return { filename: 'thinkstack-users.csv', csv };
    }

    if (type === 'submissions') {
      const submissions = await Submission.find({})
        .sort({ createdAt: -1 })
        .limit(5000)
        .populate('problemId', 'slug title')
        .populate('userId', 'username email')
        .lean()
        .exec();

      const csv = toCsv(
        ['username', 'email', 'problemSlug', 'problemTitle', 'type', 'verdict', 'language', 'createdAt'],
        submissions.map((submission) => ({
          username: submission.userId?.username ?? '',
          email: submission.userId?.email ?? '',
          problemSlug: submission.problemId?.slug ?? '',
          problemTitle: submission.problemId?.title ?? '',
          type: submission.type,
          verdict: submission.verdict,
          language: submission.language,
          createdAt: submission.createdAt?.toISOString?.() ?? '',
        }))
      );

      return { filename: 'thinkstack-submissions.csv', csv };
    }

    throw new AppError('Unsupported export type', 400);
  }

  async listUsers(query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 20;
    const filter = {};

    if (query.role) filter.role = query.role;
    if (query.status === 'active') {
      filter.isActive = true;
      filter.isSuspended = false;
    }
    if (query.status === 'suspended') filter.isSuspended = true;
    if (query.search?.trim()) {
      const search = query.search.trim();
      filter.$or = [
        { username: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }

    const { data, meta } = await userRepository.find(filter, {
      page,
      limit,
      sort: { createdAt: -1 },
      select:
        'username email role isActive isSuspended gamification.xp gamification.level stats createdAt lastLoginAt',
    });

    return {
      users: data.map(formatUser),
      meta,
    };
  }

  async updateUser(adminId, userId, payload) {
    if (adminId === userId && payload.role && payload.role !== ROLES.ADMIN) {
      throw new AppError('You cannot remove your own admin role', 400);
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const updates = {};
    if (payload.role) updates.role = payload.role;
    if (typeof payload.isSuspended === 'boolean') updates.isSuspended = payload.isSuspended;
    if (typeof payload.isActive === 'boolean') updates.isActive = payload.isActive;

    if (!Object.keys(updates).length) {
      throw new AppError('No valid fields to update', 400);
    }

    const updated = await userRepository.updateById(userId, updates);
    return formatUser(updated);
  }

  async listTopics(query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 20;
    const filter = {};
    if (query.status) filter.status = query.status;
    if (query.category) filter.category = query.category;
    if (query.difficulty) filter.difficulty = query.difficulty;
    if (query.visibility) filter.visibility = query.visibility;
    if (query.search?.trim()) {
      filter.$text = { $search: query.search.trim() };
    }

    const defaultSort = query.search?.trim()
      ? { score: { $meta: 'textScore' } }
      : parseSort(query.sort, { category: 1, order: 1 });

    const { data, meta } = await topicRepository.find(filter, {
      page,
      limit,
      sort: defaultSort,
      select:
        'slug title category difficulty order status visibility xpReward estimatedMinutes tags createdAt updatedAt',
    });

    return {
      topics: data.map((topic) => ({
        id: topic._id.toString(),
        slug: topic.slug,
        title: topic.title,
        category: topic.category,
        difficulty: topic.difficulty,
        order: topic.order,
        status: topic.status,
        visibility: topic.visibility ?? 'public',
        xpReward: topic.xpReward,
        estimatedMinutes: topic.estimatedMinutes,
        tags: topic.tags ?? [],
        updatedAt: topic.updatedAt,
      })),
      meta,
    };
  }

  async getTopic(topicId) {
    const topic = await topicRepository.findById(topicId, {
      populate: [
        { path: 'quizId', select: 'title status' },
        { path: 'relatedProblems', select: 'slug title difficulty' },
        { path: 'prerequisites', select: 'slug title' },
        { path: 'relatedTopicIds', select: 'slug title' },
        { path: 'suggestedTopicIds', select: 'slug title' },
        { path: 'navigation.previousLesson', select: 'slug title' },
        { path: 'navigation.nextLesson', select: 'slug title' },
        { path: 'navigation.relatedLessons', select: 'slug title' },
        { path: 'navigation.suggestedLessons', select: 'slug title' },
      ],
    });
    if (!topic) throw new AppError('Topic not found', 404);
    return this.formatTopicDetail(topic);
  }

  formatTopicDetail(topic) {
    const mapRef = (item) =>
      item ? { id: item._id.toString(), slug: item.slug, title: item.title } : null;
    const mapRefs = (items) => (items ?? []).map(mapRef).filter(Boolean);

    return {
      id: topic._id.toString(),
      slug: topic.slug,
      title: topic.title,
      description: topic.description ?? '',
      category: topic.category,
      difficulty: topic.difficulty,
      order: topic.order,
      status: topic.status,
      visibility: topic.visibility ?? 'public',
      thumbnail: topic.thumbnail ?? '',
      banner: topic.banner ?? '',
      estimatedMinutes: topic.estimatedMinutes,
      xpReward: topic.xpReward,
      tags: topic.tags ?? [],
      content: topic.content ?? {},
      animationConfig: topic.animationConfig ?? {},
      relatedProblemIds: (topic.relatedProblems ?? []).map((p) =>
        typeof p === 'object' ? p._id.toString() : p.toString()
      ),
      relatedProblems: mapRefs(topic.relatedProblems),
      prerequisiteIds: (topic.prerequisites ?? []).map((p) =>
        typeof p === 'object' ? p._id.toString() : p.toString()
      ),
      prerequisites: mapRefs(topic.prerequisites),
      relatedTopicIds: (topic.relatedTopicIds ?? []).map((p) =>
        typeof p === 'object' ? p._id.toString() : p.toString()
      ),
      relatedTopics: mapRefs(topic.relatedTopicIds),
      suggestedTopicIds: (topic.suggestedTopicIds ?? []).map((p) =>
        typeof p === 'object' ? p._id.toString() : p.toString()
      ),
      suggestedTopics: mapRefs(topic.suggestedTopicIds),
      navigation: {
        previousLessonId: topic.navigation?.previousLesson?._id?.toString() ?? topic.navigation?.previousLesson?.toString() ?? null,
        nextLessonId: topic.navigation?.nextLesson?._id?.toString() ?? topic.navigation?.nextLesson?.toString() ?? null,
        relatedLessonIds: (topic.navigation?.relatedLessons ?? []).map((p) =>
          typeof p === 'object' ? p._id.toString() : p.toString()
        ),
        suggestedLessonIds: (topic.navigation?.suggestedLessons ?? []).map((p) =>
          typeof p === 'object' ? p._id.toString() : p.toString()
        ),
        previousLesson: mapRef(topic.navigation?.previousLesson),
        nextLesson: mapRef(topic.navigation?.nextLesson),
        relatedLessons: mapRefs(topic.navigation?.relatedLessons),
        suggestedLessons: mapRefs(topic.navigation?.suggestedLessons),
      },
      quizId: topic.quizId?._id?.toString() ?? topic.quizId?.toString() ?? null,
      quiz: topic.quizId && typeof topic.quizId === 'object'
        ? { id: topic.quizId._id.toString(), title: topic.quizId.title, status: topic.quizId.status }
        : null,
      createdAt: topic.createdAt,
      updatedAt: topic.updatedAt,
    };
  }

  async createTopic(adminId, payload) {
    const {
      slug,
      title,
      category,
      difficulty = DIFFICULTY.BEGINNER,
      order = 0,
      status = 'draft',
      xpReward = 50,
    } = payload;

    if (!Object.values(TOPIC_CATEGORIES).includes(category)) {
      throw new AppError('Invalid topic category', 400);
    }

    const existing = await topicRepository.findOne({ slug: slug.toLowerCase() });
    if (existing) {
      throw new AppError('Topic slug already exists', 409);
    }

    const topic = await topicRepository.create({
      slug: slug.toLowerCase(),
      title,
      category,
      difficulty,
      order,
      status,
      xpReward,
      content: buildTopicContent(title),
      createdBy: adminId,
    });

    const quiz = await quizRepository.create({
      topicId: topic._id,
      title: `${title} Quiz`,
      passingScore: 70,
      timeLimitMinutes: 15,
      questions: buildQuizQuestions(title),
      xpReward: 30,
      status: status === 'published' ? 'published' : 'draft',
    });

    await topicRepository.updateById(topic._id, { quizId: quiz._id });

    return {
      id: topic._id.toString(),
      slug: topic.slug,
      title: topic.title,
      status: topic.status,
      quizId: quiz._id.toString(),
    };
  }

  async updateTopic(topicId, payload) {
    const allowed = [
      'title',
      'slug',
      'description',
      'category',
      'difficulty',
      'order',
      'status',
      'visibility',
      'thumbnail',
      'banner',
      'xpReward',
      'estimatedMinutes',
      'tags',
      'content',
      'animationConfig',
      'relatedProblemIds',
      'prerequisiteIds',
      'relatedTopicIds',
      'suggestedTopicIds',
      'navigation',
    ];
    const updates = {};

    for (const key of allowed) {
      if (payload[key] === undefined) continue;
      if (key === 'slug') {
        updates.slug = payload.slug.toLowerCase();
      } else if (key === 'relatedProblemIds') {
        updates.relatedProblems = payload.relatedProblemIds;
      } else if (key === 'prerequisiteIds') {
        updates.prerequisites = payload.prerequisiteIds;
      } else if (key === 'relatedTopicIds') {
        updates.relatedTopicIds = payload.relatedTopicIds;
      } else if (key === 'suggestedTopicIds') {
        updates.suggestedTopicIds = payload.suggestedTopicIds;
      } else if (key === 'navigation') {
        const nav = payload.navigation ?? {};
        updates.navigation = {
          previousLesson: nav.previousLessonId || null,
          nextLesson: nav.nextLessonId || null,
          relatedLessons: nav.relatedLessonIds ?? [],
          suggestedLessons: nav.suggestedLessonIds ?? [],
        };
      } else {
        updates[key] = payload[key];
      }
    }

    if (!Object.keys(updates).length) {
      throw new AppError('No valid fields to update', 400);
    }

    if (updates.slug) {
      const existing = await topicRepository.findOne({ slug: updates.slug });
      if (existing && existing._id.toString() !== topicId) {
        throw new AppError('Topic slug already exists', 409);
      }
    }

    const topic = await topicRepository.updateById(topicId, updates);
    if (!topic) {
      throw new AppError('Topic not found', 404);
    }

    if (updates.status && topic.quizId) {
      const quizStatus = updates.status === 'published' ? 'published' : updates.status === 'archived' ? 'archived' : 'draft';
      await quizRepository.updateById(topic.quizId, { status: quizStatus });
    }

    return this.getTopic(topicId);
  }

  async deleteTopic(topicId) {
    const topic = await topicRepository.findById(topicId);
    if (!topic) throw new AppError('Topic not found', 404);
    await topicRepository.deleteById(topicId);
    if (topic.quizId) {
      await quizRepository.deleteById(topic.quizId);
    }
    return { deleted: true };
  }

  async duplicateTopic(topicId) {
    const topic = await topicRepository.findById(topicId);
    if (!topic) throw new AppError('Topic not found', 404);

    let copySlug = `${topic.slug}-copy`;
    let suffix = 1;
    while (await topicRepository.findOne({ slug: copySlug })) {
      suffix += 1;
      copySlug = `${topic.slug}-copy-${suffix}`;
    }

    const copy = await topicRepository.create({
      slug: copySlug,
      title: `${topic.title} (Copy)`,
      description: topic.description,
      category: topic.category,
      difficulty: topic.difficulty,
      order: topic.order + 1,
      status: 'draft',
      visibility: topic.visibility,
      thumbnail: topic.thumbnail,
      banner: topic.banner,
      content: topic.content,
      animationConfig: topic.animationConfig,
      relatedProblems: topic.relatedProblems,
      prerequisites: topic.prerequisites,
      relatedTopicIds: topic.relatedTopicIds,
      suggestedTopicIds: topic.suggestedTopicIds,
      navigation: topic.navigation,
      estimatedMinutes: topic.estimatedMinutes,
      xpReward: topic.xpReward,
      tags: topic.tags,
      createdBy: topic.createdBy,
    });

    const quiz = await quizRepository.create({
      topicId: copy._id,
      title: `${copy.title} Quiz`,
      passingScore: 70,
      timeLimitMinutes: 15,
      questions: buildQuizQuestions(copy.title),
      xpReward: 30,
      status: 'draft',
    });
    await topicRepository.updateById(copy._id, { quizId: quiz._id });

    return { id: copy._id.toString(), slug: copy.slug, title: copy.title };
  }

  async bulkUpdateTopics(ids, payload) {
    if (!ids?.length) throw new AppError('No ids provided', 400);
    const updates = {};
    if (payload.status) updates.status = payload.status;
    if (payload.visibility) updates.visibility = payload.visibility;
    if (!Object.keys(updates).length) throw new AppError('No valid bulk fields', 400);

    const result = await Topic.updateMany({ _id: { $in: ids } }, updates);
    return { modified: result.modifiedCount };
  }

  async listProblems(query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 20;
    const filter = {};
    if (query.status) filter.status = query.status;
    if (query.difficulty) filter.difficulty = query.difficulty;
    if (query.search?.trim()) {
      filter.$text = { $search: query.search.trim() };
    }

    const { data, meta } = await problemRepository.find(filter, {
      page,
      limit,
      sort: query.search?.trim()
        ? { score: { $meta: 'textScore' } }
        : parseSort(query.sort, { updatedAt: -1 }),
      select:
        'slug title difficulty status tags topicSlugs acceptanceRate totalSubmissions createdAt updatedAt',
    });

    return {
      problems: data.map((problem) => ({
        id: problem._id.toString(),
        slug: problem.slug,
        title: problem.title,
        difficulty: problem.difficulty,
        status: problem.status,
        tags: problem.tags ?? [],
        topicSlugs: problem.topicSlugs ?? [],
        acceptanceRate: problem.acceptanceRate ?? 0,
        totalSubmissions: problem.totalSubmissions ?? 0,
        updatedAt: problem.updatedAt,
      })),
      meta,
    };
  }

  async getProblem(problemId) {
    const problem = await problemRepository.findById(problemId);
    if (!problem) throw new AppError('Problem not found', 404);
    return {
      id: problem._id.toString(),
      slug: problem.slug,
      title: problem.title,
      difficulty: problem.difficulty,
      tags: problem.tags ?? [],
      companies: problem.companies ?? [],
      topicSlugs: problem.topicSlugs ?? [],
      description: problem.description,
      constraints: problem.constraints ?? '',
      hints: problem.hints ?? [],
      editorial: problem.editorial ?? '',
      examples: problem.examples ?? [],
      starterCode: problem.starterCode ?? {},
      boilerplateCode: problem.boilerplateCode ?? {},
      referenceSolution: problem.referenceSolution ?? {},
      testCases: problem.testCases ?? [],
      timeLimitMs: problem.timeLimitMs ?? 2000,
      memoryLimitKb: problem.memoryLimitKb ?? 256000,
      supportedLanguages: problem.supportedLanguages ?? [],
      xpReward: problem.xpReward ?? {},
      status: problem.status,
      acceptanceRate: problem.acceptanceRate ?? 0,
      totalSubmissions: problem.totalSubmissions ?? 0,
      createdAt: problem.createdAt,
      updatedAt: problem.updatedAt,
    };
  }

  async createProblem(adminId, payload) {
    const {
      slug,
      title,
      difficulty = DIFFICULTY.EASY,
      description,
      topicSlugs = [],
      status = 'draft',
      testCases,
    } = payload;

    const existing = await problemRepository.findOne({ slug: slug.toLowerCase() });
    if (existing) {
      throw new AppError('Problem slug already exists', 409);
    }

    const problem = await problemRepository.create({
      slug: slug.toLowerCase(),
      title,
      difficulty,
      description,
      topicSlugs: topicSlugs.map((value) => value.toLowerCase()),
      status,
      constraints: payload.constraints ?? '',
      examples: payload.examples ?? [],
      starterCode: payload.starterCode ?? { python: '# Write your solution here\n' },
      testCases,
      tags: payload.tags ?? [],
      createdBy: adminId,
    });

    return {
      id: problem._id.toString(),
      slug: problem.slug,
      title: problem.title,
      status: problem.status,
    };
  }

  async updateProblem(problemId, payload) {
    const allowed = [
      'title',
      'slug',
      'difficulty',
      'description',
      'constraints',
      'status',
      'tags',
      'companies',
      'topicSlugs',
      'hints',
      'editorial',
      'examples',
      'starterCode',
      'boilerplateCode',
      'referenceSolution',
      'testCases',
      'timeLimitMs',
      'memoryLimitKb',
      'supportedLanguages',
      'xpReward',
    ];
    const updates = Object.fromEntries(
      Object.entries(payload).filter(([key, value]) => allowed.includes(key) && value !== undefined)
    );

    if (updates.slug) updates.slug = updates.slug.toLowerCase();
    if (updates.topicSlugs) {
      updates.topicSlugs = updates.topicSlugs.map((value) => value.toLowerCase());
    }

    if (!Object.keys(updates).length) {
      throw new AppError('No valid fields to update', 400);
    }

    if (updates.slug) {
      const existing = await problemRepository.findOne({ slug: updates.slug });
      if (existing && existing._id.toString() !== problemId) {
        throw new AppError('Problem slug already exists', 409);
      }
    }

    const problem = await problemRepository.updateById(problemId, updates);
    if (!problem) {
      throw new AppError('Problem not found', 404);
    }

    return this.getProblem(problemId);
  }

  async deleteProblem(problemId) {
    const problem = await problemRepository.findById(problemId);
    if (!problem) throw new AppError('Problem not found', 404);
    await problemRepository.deleteById(problemId);
    return { deleted: true };
  }

  async duplicateProblem(problemId) {
    const problem = await problemRepository.findById(problemId);
    if (!problem) throw new AppError('Problem not found', 404);

    let copySlug = `${problem.slug}-copy`;
    let suffix = 1;
    while (await problemRepository.findOne({ slug: copySlug })) {
      suffix += 1;
      copySlug = `${problem.slug}-copy-${suffix}`;
    }

    const copy = await problemRepository.create({
      slug: copySlug,
      title: `${problem.title} (Copy)`,
      difficulty: problem.difficulty,
      tags: problem.tags,
      companies: problem.companies,
      topicSlugs: problem.topicSlugs,
      description: problem.description,
      constraints: problem.constraints,
      hints: problem.hints,
      editorial: problem.editorial,
      examples: problem.examples,
      starterCode: problem.starterCode,
      boilerplateCode: problem.boilerplateCode,
      referenceSolution: problem.referenceSolution,
      testCases: problem.testCases,
      timeLimitMs: problem.timeLimitMs,
      memoryLimitKb: problem.memoryLimitKb,
      supportedLanguages: problem.supportedLanguages,
      xpReward: problem.xpReward,
      status: 'draft',
      createdBy: problem.createdBy,
    });

    return { id: copy._id.toString(), slug: copy.slug, title: copy.title };
  }

  async bulkUpdateProblems(ids, payload) {
    if (!ids?.length) throw new AppError('No ids provided', 400);
    const updates = {};
    if (payload.status) updates.status = payload.status;
    if (!Object.keys(updates).length) throw new AppError('No valid bulk fields', 400);
    const result = await Problem.updateMany({ _id: { $in: ids } }, updates);
    return { modified: result.modifiedCount };
  }

  async listQuizzes(query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 20;
    const filter = {};
    if (query.status) filter.status = query.status;
    if (query.search?.trim()) {
      filter.title = new RegExp(query.search.trim(), 'i');
    }

    const { data, meta } = await quizRepository.find(filter, {
      page,
      limit,
      sort: parseSort(query.sort, { updatedAt: -1 }),
      populate: { path: 'topicId', select: 'slug title' },
    });

    return {
      quizzes: data.map((quiz) => ({
        id: quiz._id.toString(),
        title: quiz.title,
        category: quiz.category ?? '',
        status: quiz.status,
        visibility: quiz.visibility ?? 'public',
        passingScore: quiz.passingScore,
        timeLimitMinutes: quiz.timeLimitMinutes,
        xpReward: quiz.xpReward,
        shuffleQuestions: quiz.shuffleQuestions ?? false,
        shuffleOptions: quiz.shuffleOptions ?? false,
        negativeMarking: quiz.negativeMarking ?? { enabled: false, penalty: 0 },
        questionCount: quiz.questions?.length ?? 0,
        topic: quiz.topicId
          ? {
              id: quiz.topicId._id.toString(),
              slug: quiz.topicId.slug,
              title: quiz.topicId.title,
            }
          : null,
        updatedAt: quiz.updatedAt,
      })),
      meta,
    };
  }

  async getQuiz(quizId) {
    const quiz = await quizRepository.findById(quizId, {
      populate: { path: 'topicId', select: 'slug title' },
    });
    if (!quiz) throw new AppError('Quiz not found', 404);
    return {
      id: quiz._id.toString(),
      topicId: quiz.topicId?._id?.toString() ?? quiz.topicId?.toString(),
      topic: quiz.topicId && typeof quiz.topicId === 'object'
        ? { id: quiz.topicId._id.toString(), slug: quiz.topicId.slug, title: quiz.topicId.title }
        : null,
      title: quiz.title,
      category: quiz.category ?? '',
      passingScore: quiz.passingScore,
      timeLimitMinutes: quiz.timeLimitMinutes,
      xpReward: quiz.xpReward,
      shuffleQuestions: quiz.shuffleQuestions ?? false,
      shuffleOptions: quiz.shuffleOptions ?? false,
      negativeMarking: quiz.negativeMarking ?? { enabled: false, penalty: 0 },
      visibility: quiz.visibility ?? 'public',
      status: quiz.status,
      questions: quiz.questions ?? [],
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
    };
  }

  async updateQuiz(quizId, payload) {
    const allowed = [
      'title',
      'category',
      'status',
      'visibility',
      'passingScore',
      'timeLimitMinutes',
      'xpReward',
      'questions',
      'shuffleQuestions',
      'shuffleOptions',
      'negativeMarking',
    ];
    const updates = Object.fromEntries(
      Object.entries(payload).filter(([key, value]) => allowed.includes(key) && value !== undefined)
    );

    if (!Object.keys(updates).length) {
      throw new AppError('No valid fields to update', 400);
    }

    const quiz = await quizRepository.updateById(quizId, updates);
    if (!quiz) {
      throw new AppError('Quiz not found', 404);
    }

    return this.getQuiz(quizId);
  }

  async deleteQuiz(quizId) {
    const quiz = await quizRepository.findById(quizId);
    if (!quiz) throw new AppError('Quiz not found', 404);
    await Topic.updateMany({ quizId }, { $unset: { quizId: 1 } });
    await quizRepository.deleteById(quizId);
    return { deleted: true };
  }

  async duplicateQuiz(quizId) {
    const quiz = await quizRepository.findById(quizId);
    if (!quiz) throw new AppError('Quiz not found', 404);

    const copy = await quizRepository.create({
      topicId: quiz.topicId,
      title: `${quiz.title} (Copy)`,
      category: quiz.category,
      passingScore: quiz.passingScore,
      timeLimitMinutes: quiz.timeLimitMinutes,
      xpReward: quiz.xpReward,
      shuffleQuestions: quiz.shuffleQuestions,
      shuffleOptions: quiz.shuffleOptions,
      negativeMarking: quiz.negativeMarking,
      visibility: quiz.visibility,
      status: 'draft',
      questions: quiz.questions,
    });

    return { id: copy._id.toString(), title: copy.title };
  }

  async bulkUpdateQuizzes(ids, payload) {
    if (!ids?.length) throw new AppError('No ids provided', 400);
    const updates = {};
    if (payload.status) updates.status = payload.status;
    if (payload.visibility) updates.visibility = payload.visibility;
    if (!Object.keys(updates).length) throw new AppError('No valid bulk fields', 400);
    const result = await Quiz.updateMany({ _id: { $in: ids } }, updates);
    return { modified: result.modifiedCount };
  }

  async createQuiz(payload) {
    const topic = await topicRepository.findBySlug(payload.topicSlug?.toLowerCase());
    if (!topic) {
      throw new AppError('Topic not found', 404);
    }

    const quiz = await quizRepository.create({
      topicId: topic._id,
      title: payload.title?.trim() || `${topic.title} Quiz`,
      passingScore: payload.passingScore ?? 70,
      timeLimitMinutes: payload.timeLimitMinutes ?? 10,
      xpReward: payload.xpReward ?? 30,
      status: payload.status ?? 'draft',
      questions:
        payload.questions?.length > 0
          ? payload.questions
          : buildQuizQuestions(topic.title),
    });

    if (!topic.quizId) {
      await topicRepository.updateById(topic._id, { quizId: quiz._id });
    }

    return {
      id: quiz._id.toString(),
      title: quiz.title,
      status: quiz.status,
      questionCount: quiz.questions?.length ?? 0,
    };
  }

  async listContests(query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 20;
    const filter = {};
    if (query.status) filter.status = query.status;
    if (query.search?.trim()) {
      filter.$or = [
        { title: new RegExp(query.search.trim(), 'i') },
        { slug: new RegExp(query.search.trim(), 'i') },
      ];
    }

    const { data, meta } = await contestRepository.findFiltered(filter, {
      page,
      limit,
      sort: parseSort(query.sort, { startTime: -1 }),
      select:
        'slug title status startTime endTime durationMinutes problemIds difficulty visibility rules timeLimitMinutes thumbnail banner scoring createdAt updatedAt',
    });

    return {
      contests: data.map((contest) => ({
        id: contest._id.toString(),
        slug: contest.slug,
        title: contest.title,
        status: resolveEffectiveContestStatus(contest),
        storedStatus: contest.status,
        startTime: contest.startTime,
        endTime: contest.endTime,
        durationMinutes: contest.durationMinutes,
        difficulty: contest.difficulty,
        visibility: contest.visibility,
        rules: contest.rules,
        timeLimitMinutes: contest.timeLimitMinutes,
        thumbnail: contest.thumbnail ?? '',
        banner: contest.banner ?? '',
        scoring: contest.scoring ?? {},
        problemCount: contest.problemIds?.length ?? 0,
        updatedAt: contest.updatedAt,
      })),
      meta,
    };
  }

  async getContest(contestId) {
    const contest = await contestRepository.findById(contestId, {
      populate: { path: 'problemIds', select: 'slug title difficulty status' },
    });
    if (!contest) throw new AppError('Contest not found', 404);

    return {
      id: contest._id.toString(),
      slug: contest.slug,
      title: contest.title,
      description: contest.description ?? '',
      thumbnail: contest.thumbnail ?? '',
      banner: contest.banner ?? '',
      startTime: contest.startTime,
      endTime: contest.endTime,
      durationMinutes: contest.durationMinutes,
      rules: contest.rules ?? '',
      scoring: contest.scoring ?? {},
      difficulty: contest.difficulty,
      visibility: contest.visibility,
      timeLimitMinutes: contest.timeLimitMinutes,
      leaderboardSettings: contest.leaderboardSettings ?? {},
      status: contest.status,
      effectiveStatus: resolveEffectiveContestStatus(contest),
      problemIds: (contest.problemIds ?? []).map((p) =>
        typeof p === 'object' ? p._id.toString() : p.toString()
      ),
      problems: (contest.problemIds ?? [])
        .filter((p) => typeof p === 'object')
        .map((p) => ({
          id: p._id.toString(),
          slug: p.slug,
          title: p.title,
          difficulty: p.difficulty,
        })),
      createdAt: contest.createdAt,
      updatedAt: contest.updatedAt,
    };
  }

  async updateContest(contestId, payload) {
    const contest = await contestRepository.findById(contestId);
    if (!contest) {
      throw new AppError('Contest not found', 404);
    }

    const allowed = [
      'title',
      'slug',
      'description',
      'thumbnail',
      'banner',
      'rules',
      'scoring',
      'difficulty',
      'visibility',
      'timeLimitMinutes',
      'durationMinutes',
      'leaderboardSettings',
      'startTime',
      'endTime',
      'status',
      'problemSlugs',
      'problemIds',
    ];
    const updates = {};

    for (const key of allowed) {
      if (payload[key] === undefined) continue;
      if (key === 'startTime' || key === 'endTime') {
        updates[key] = new Date(payload[key]);
      } else if (key === 'problemSlugs') {
        const problems = await Problem.find({
          slug: { $in: payload.problemSlugs.map((value) => value.toLowerCase()) },
          status: 'published',
        })
          .select('_id')
          .lean()
          .exec();
        if (!problems.length) {
          throw new AppError('At least one published problem slug is required', 400);
        }
        updates.problemIds = problems.map((problem) => problem._id);
      } else if (key === 'problemIds') {
        updates.problemIds = payload.problemIds;
      } else if (key === 'slug') {
        updates.slug = payload.slug.toLowerCase();
      } else {
        updates[key] = payload[key];
      }
    }

    if (!Object.keys(updates).length) {
      throw new AppError('No valid fields to update', 400);
    }

    const updated = await contestRepository.updateById(contestId, updates);
    return this.getContest(contestId);
  }

  async deleteContest(contestId) {
    const contest = await contestRepository.findById(contestId);
    if (!contest) throw new AppError('Contest not found', 404);
    await contestRepository.deleteById(contestId);
    return { deleted: true };
  }

  async duplicateContest(contestId) {
    const contest = await contestRepository.findById(contestId);
    if (!contest) throw new AppError('Contest not found', 404);

    let copySlug = `${contest.slug}-copy`;
    let suffix = 1;
    while (await contestRepository.findOne({ slug: copySlug })) {
      suffix += 1;
      copySlug = `${contest.slug}-copy-${suffix}`;
    }

    const copy = await contestRepository.create({
      title: `${contest.title} (Copy)`,
      slug: copySlug,
      description: contest.description,
      thumbnail: contest.thumbnail,
      banner: contest.banner,
      startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      durationMinutes: contest.durationMinutes,
      problemIds: contest.problemIds,
      rules: contest.rules,
      scoring: contest.scoring,
      difficulty: contest.difficulty,
      visibility: contest.visibility,
      timeLimitMinutes: contest.timeLimitMinutes,
      leaderboardSettings: contest.leaderboardSettings,
      status: 'scheduled',
      createdBy: contest.createdBy,
    });

    return { id: copy._id.toString(), slug: copy.slug, title: copy.title };
  }

  async bulkUpdateContests(ids, payload) {
    if (!ids?.length) throw new AppError('No ids provided', 400);
    const updates = {};
    if (payload.status) updates.status = payload.status;
    if (!Object.keys(updates).length) throw new AppError('No valid bulk fields', 400);
    const result = await Contest.updateMany({ _id: { $in: ids } }, updates);
    return { modified: result.modifiedCount };
  }

  async listAnnouncements(query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 20;
    const filter = {};
    if (query.isActive != null) filter.isActive = query.isActive === 'true';

    const { data, meta } = await announcementRepository.find(filter, {
      page,
      limit,
      sort: { createdAt: -1 },
    });

    return {
      announcements: data.map((item) => ({
        id: item._id.toString(),
        title: item.title,
        content: item.content,
        isActive: item.isActive,
        priority: item.priority,
        startsAt: item.startsAt,
        expiresAt: item.expiresAt ?? null,
        createdAt: item.createdAt,
      })),
      meta,
    };
  }

  async createAnnouncement(adminId, payload) {
    const { title, content, priority = 'normal', isActive = true, startsAt, expiresAt } = payload;

    const announcement = await announcementRepository.create({
      title,
      content,
      priority,
      isActive,
      startsAt: startsAt ? new Date(startsAt) : new Date(),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: adminId,
    });

    if (isActive) {
      await this.notifyUsersAboutAnnouncement(announcement);
    }

    return {
      id: announcement._id.toString(),
      title: announcement.title,
      isActive: announcement.isActive,
      priority: announcement.priority,
    };
  }

  async updateAnnouncement(announcementId, payload) {
    const allowed = ['title', 'content', 'priority', 'isActive', 'startsAt', 'expiresAt'];
    const updates = {};

    for (const key of allowed) {
      if (payload[key] === undefined) continue;
      updates[key] =
        key === 'startsAt' || key === 'expiresAt' ? new Date(payload[key]) : payload[key];
    }

    if (!Object.keys(updates).length) {
      throw new AppError('No valid fields to update', 400);
    }

    const previous = await announcementRepository.findById(announcementId);
    if (!previous) {
      throw new AppError('Announcement not found', 404);
    }

    const announcement = await announcementRepository.updateById(announcementId, updates);
    if (announcement.isActive && !previous.isActive) {
      await this.notifyUsersAboutAnnouncement(announcement);
    }

    return {
      id: announcement._id.toString(),
      title: announcement.title,
      isActive: announcement.isActive,
      priority: announcement.priority,
    };
  }

  async notifyUsersAboutAnnouncement(announcement) {
    const users = await User.find({
      isActive: true,
      isSuspended: false,
    })
      .select('_id')
      .lean()
      .exec();

    if (!users.length) return 0;

    return notificationService.notifyAnnouncements(
      announcement,
      users.map((user) => user._id)
    );
  }

  async createContest(adminId, payload) {
    return contestService.createContest(adminId, payload);
  }

  // --- Badges ---
  async listBadges(query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 50;
    const filter = {};
    if (query.status) filter.status = query.status;
    if (query.search?.trim()) {
      filter.$or = [
        { name: new RegExp(query.search.trim(), 'i') },
        { slug: new RegExp(query.search.trim(), 'i') },
      ];
    }
    const { data, meta } = await badgeRepository.find(filter, {
      page,
      limit,
      sort: parseSort(query.sort, { name: 1 }),
    });
    return {
      badges: data.map((b) => ({
        id: b._id.toString(),
        slug: b.slug,
        name: b.name,
        description: b.description,
        icon: b.icon,
        category: b.category ?? 'general',
        criteria: b.criteria,
        xpBonus: b.xpBonus,
        isActive: b.isActive,
        status: b.status ?? 'published',
      })),
      meta,
    };
  }

  async getBadge(badgeId) {
    const badge = await badgeRepository.findById(badgeId);
    if (!badge) throw new AppError('Badge not found', 404);
    return {
      id: badge._id.toString(),
      slug: badge.slug,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      category: badge.category ?? 'general',
      criteria: badge.criteria,
      xpBonus: badge.xpBonus,
      isActive: badge.isActive,
      status: badge.status ?? 'published',
    };
  }

  async createBadge(payload) {
    const existing = await badgeRepository.findOne({ slug: payload.slug.toLowerCase() });
    if (existing) throw new AppError('Badge slug already exists', 409);
    const badge = await badgeRepository.create({
      ...payload,
      slug: payload.slug.toLowerCase(),
    });
    return this.getBadge(badge._id);
  }

  async updateBadge(badgeId, payload) {
    const allowed = ['name', 'description', 'icon', 'category', 'criteria', 'xpBonus', 'isActive', 'status'];
    const updates = Object.fromEntries(
      Object.entries(payload).filter(([key, value]) => allowed.includes(key) && value !== undefined)
    );
    if (!Object.keys(updates).length) throw new AppError('No valid fields to update', 400);
    const badge = await badgeRepository.updateById(badgeId, updates);
    if (!badge) throw new AppError('Badge not found', 404);
    return this.getBadge(badgeId);
  }

  async deleteBadge(badgeId) {
    const badge = await badgeRepository.findById(badgeId);
    if (!badge) throw new AppError('Badge not found', 404);
    await badgeRepository.deleteById(badgeId);
    return { deleted: true };
  }

  // --- Visualizers ---
  async listVisualizers(query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 50;
    const filter = {};
    if (query.status) filter.status = query.status;
    if (query.category) filter.category = query.category;
    if (query.search?.trim()) {
      filter.$or = [
        { name: new RegExp(query.search.trim(), 'i') },
        { algorithmId: new RegExp(query.search.trim(), 'i') },
      ];
    }
    const { data, meta } = await visualizerRepository.find(filter, {
      page,
      limit,
      sort: parseSort(query.sort, { order: 1, name: 1 }),
    });
    return {
      visualizers: data.map((v) => ({
        id: v._id.toString(),
        algorithmId: v.algorithmId,
        name: v.name,
        category: v.category,
        difficulty: v.difficulty,
        visibility: v.visibility,
        status: v.status,
        order: v.order,
      })),
      meta,
    };
  }

  async getVisualizer(id) {
    const visualizer = await visualizerRepository.findById(id);
    if (!visualizer) throw new AppError('Visualizer not found', 404);
    return {
      id: visualizer._id.toString(),
      algorithmId: visualizer.algorithmId,
      name: visualizer.name,
      description: visualizer.description ?? '',
      category: visualizer.category,
      difficulty: visualizer.difficulty,
      timeComplexity: visualizer.timeComplexity ?? '',
      spaceComplexity: visualizer.spaceComplexity ?? '',
      codeExamples: visualizer.codeExamples ?? [],
      animationConfig: visualizer.animationConfig ?? {},
      examples: visualizer.examples ?? [],
      supportedLanguages: visualizer.supportedLanguages ?? [],
      visibility: visualizer.visibility,
      status: visualizer.status,
      order: visualizer.order,
    };
  }

  async createVisualizer(payload) {
    const existing = await visualizerRepository.findByAlgorithmId(payload.algorithmId);
    if (existing) throw new AppError('Visualizer algorithm ID already exists', 409);
    const visualizer = await visualizerRepository.create({
      ...payload,
      algorithmId: payload.algorithmId.toLowerCase(),
    });
    return this.getVisualizer(visualizer._id);
  }

  async updateVisualizer(id, payload) {
    const allowed = [
      'name',
      'description',
      'category',
      'difficulty',
      'timeComplexity',
      'spaceComplexity',
      'codeExamples',
      'animationConfig',
      'examples',
      'supportedLanguages',
      'visibility',
      'status',
      'order',
    ];
    const updates = Object.fromEntries(
      Object.entries(payload).filter(([key, value]) => allowed.includes(key) && value !== undefined)
    );
    if (!Object.keys(updates).length) throw new AppError('No valid fields to update', 400);
    const visualizer = await visualizerRepository.updateById(id, updates);
    if (!visualizer) throw new AppError('Visualizer not found', 404);
    return this.getVisualizer(id);
  }

  async deleteVisualizer(id) {
    const visualizer = await visualizerRepository.findById(id);
    if (!visualizer) throw new AppError('Visualizer not found', 404);
    await visualizerRepository.deleteById(id);
    return { deleted: true };
  }

  // --- Certificates ---
  async listCertificates(query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 20;
    const filter = {};
    if (query.status) filter.status = query.status;
    if (query.search?.trim()) {
      filter.$or = [
        { name: new RegExp(query.search.trim(), 'i') },
        { slug: new RegExp(query.search.trim(), 'i') },
      ];
    }
    const { data, meta } = await certificateRepository.find(filter, {
      page,
      limit,
      sort: parseSort(query.sort, { name: 1 }),
    });
    return {
      certificates: data.map((c) => ({
        id: c._id.toString(),
        slug: c.slug,
        name: c.name,
        description: c.description,
        isActive: c.isActive,
        status: c.status,
        xpBonus: c.xpBonus,
      })),
      meta,
    };
  }

  async getCertificate(id) {
    const cert = await certificateRepository.findById(id);
    if (!cert) throw new AppError('Certificate not found', 404);
    return {
      id: cert._id.toString(),
      slug: cert.slug,
      name: cert.name,
      description: cert.description ?? '',
      template: cert.template ?? {},
      criteria: cert.criteria,
      xpBonus: cert.xpBonus,
      isActive: cert.isActive,
      status: cert.status,
    };
  }

  async createCertificate(payload) {
    const existing = await certificateRepository.findBySlug(payload.slug);
    if (existing) throw new AppError('Certificate slug already exists', 409);
    const cert = await certificateRepository.create({
      ...payload,
      slug: payload.slug.toLowerCase(),
    });
    return this.getCertificate(cert._id);
  }

  async updateCertificate(id, payload) {
    const allowed = ['name', 'description', 'template', 'criteria', 'xpBonus', 'isActive', 'status'];
    const updates = Object.fromEntries(
      Object.entries(payload).filter(([key, value]) => allowed.includes(key) && value !== undefined)
    );
    if (!Object.keys(updates).length) throw new AppError('No valid fields to update', 400);
    const cert = await certificateRepository.updateById(id, updates);
    if (!cert) throw new AppError('Certificate not found', 404);
    return this.getCertificate(id);
  }

  async deleteCertificate(id) {
    const cert = await certificateRepository.findById(id);
    if (!cert) throw new AppError('Certificate not found', 404);
    await certificateRepository.deleteById(id);
    return { deleted: true };
  }

  // --- Platform Settings ---
  async getPlatformSettings() {
    const settings = await platformSettingsRepository.getGlobal();
    return {
      id: settings._id.toString(),
      xpRules: settings.xpRules,
      coinRules: settings.coinRules,
      ranks: settings.ranks ?? [],
      levels: settings.levels ?? [],
      leaderboardSettings: settings.leaderboardSettings,
      notificationDefaults: settings.notificationDefaults,
    };
  }

  async updatePlatformSettings(payload) {
    const allowed = ['xpRules', 'coinRules', 'ranks', 'levels', 'leaderboardSettings', 'notificationDefaults'];
    const updates = Object.fromEntries(
      Object.entries(payload).filter(([key, value]) => allowed.includes(key) && value !== undefined)
    );
    if (!Object.keys(updates).length) throw new AppError('No valid fields to update', 400);
    await platformSettingsRepository.getGlobal();
    const settings = await platformSettingsRepository.updateById(
      (await platformSettingsRepository.getGlobal())._id,
      updates
    );
    return {
      id: settings._id.toString(),
      xpRules: settings.xpRules,
      coinRules: settings.coinRules,
      ranks: settings.ranks ?? [],
      levels: settings.levels ?? [],
      leaderboardSettings: settings.leaderboardSettings,
      notificationDefaults: settings.notificationDefaults,
    };
  }

  // --- Daily Challenges ---
  async listDailyChallenges(query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 30;
    const filter = {};
    if (query.isActive != null) filter.isActive = query.isActive === 'true';
    const { data, meta } = await dailyChallengeRepository.find(filter, {
      page,
      limit,
      sort: { date: -1 },
    });
    return {
      challenges: data.map((c) => ({
        id: c._id.toString(),
        date: c.date,
        type: c.type,
        target: c.target,
        xpReward: c.xpReward,
        description: c.description,
        isActive: c.isActive,
      })),
      meta,
    };
  }

  async createDailyChallenge(payload) {
    const challenge = await dailyChallengeRepository.create(payload);
    return {
      id: challenge._id.toString(),
      date: challenge.date,
      type: challenge.type,
      isActive: challenge.isActive,
    };
  }

  async updateDailyChallenge(id, payload) {
    const allowed = ['type', 'target', 'xpReward', 'description', 'isActive'];
    const updates = Object.fromEntries(
      Object.entries(payload).filter(([key, value]) => allowed.includes(key) && value !== undefined)
    );
    if (!Object.keys(updates).length) throw new AppError('No valid fields to update', 400);
    const challenge = await dailyChallengeRepository.updateById(id, updates);
    if (!challenge) throw new AppError('Daily challenge not found', 404);
    return {
      id: challenge._id.toString(),
      date: challenge.date,
      type: challenge.type,
      isActive: challenge.isActive,
    };
  }

  async deleteDailyChallenge(id) {
    const challenge = await dailyChallengeRepository.findById(id);
    if (!challenge) throw new AppError('Daily challenge not found', 404);
    await dailyChallengeRepository.deleteById(id);
    return { deleted: true };
  }

  async deleteAnnouncement(announcementId) {
    const item = await announcementRepository.findById(announcementId);
    if (!item) throw new AppError('Announcement not found', 404);
    await announcementRepository.deleteById(announcementId);
    return { deleted: true };
  }

  async bulkUpdateAnnouncements(ids, payload) {
    if (!ids?.length) throw new AppError('No ids provided', 400);
    const updates = {};
    if (typeof payload.isActive === 'boolean') updates.isActive = payload.isActive;
    if (!Object.keys(updates).length) throw new AppError('No valid bulk fields', 400);
    const result = await Announcement.updateMany({ _id: { $in: ids } }, updates);
    return { modified: result.modifiedCount };
  }
}

export default new AdminService();
