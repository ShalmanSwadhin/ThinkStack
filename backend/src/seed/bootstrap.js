import logger from '../utils/logger.js';
import {
  User,
  Topic,
  Problem,
  Quiz,
  Badge,
  Certificate,
  Visualizer,
  DailyChallenge,
  Announcement,
  Contest,
} from '../models/index.js';
import { buildTopics } from './data/topics.js';
import { PROBLEMS } from './generators/problemBank.js';
import { BADGES } from './data/badges.js';
import { CERTIFICATES } from './data/certificates.js';
import { buildQuizQuestionsForLesson } from './generators/quizBuilder.js';
import { CONTESTS } from './data/contests.js';
import { buildVisualizerSeedData } from './data/visualizers.js';
import ensureAdmin from './ensureAdmin.js';
import ensureDemoUser from './ensureDemoUser.js';
import { DIFFICULTY } from 'shared/constants';

const DAILY_CHALLENGE_TYPES = ['problem', 'quiz', 'topic', 'streak', 'tracing', 'visualizer', 'interview'];
const DAILY_CHALLENGE_DAYS = 30;
const WELCOME_ANNOUNCEMENT_TITLE = 'Welcome to ThinkStack';

const CONTEST_DIFFICULTY_MAP = {
  beginner: 'easy',
  intermediate: 'medium',
  advanced: 'hard',
};

function buildUpdate(mode, document) {
  return mode === 'sync' ? { $set: document } : { $setOnInsert: document };
}

async function ensureBadges(mode, stats) {
  const ops = BADGES.map((badge) => ({
    updateOne: {
      filter: { slug: badge.slug },
      update: buildUpdate(mode, badge),
      upsert: true,
    },
  }));

  const result = await Badge.bulkWrite(ops, { ordered: false });
  stats.badges.upserted = result.upsertedCount;
  stats.badges.existing = result.matchedCount - result.modifiedCount;
  stats.badges.updated = mode === 'sync' ? result.modifiedCount : 0;
}

async function ensureCertificates(mode, stats) {
  for (const cert of CERTIFICATES) {
    const existing = await Certificate.findOne({ slug: cert.slug }).select('_id').lean();
    if (existing && mode !== 'sync') {
      stats.certificates.existing += 1;
      continue;
    }

    await Certificate.findOneAndUpdate({ slug: cert.slug }, buildUpdate(mode, cert), {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    });

    if (existing) stats.certificates.updated += 1;
    else stats.certificates.created += 1;
  }
}

async function ensureVisualizers(mode, stats) {
  const visualizers = buildVisualizerSeedData();

  for (const viz of visualizers) {
    const existing = await Visualizer.findOne({ algorithmId: viz.algorithmId }).select('_id').lean();
    if (existing && mode !== 'sync') {
      stats.visualizers.existing += 1;
      continue;
    }

    await Visualizer.findOneAndUpdate({ algorithmId: viz.algorithmId }, buildUpdate(mode, viz), {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    });

    if (existing) stats.visualizers.updated += 1;
    else stats.visualizers.created += 1;
  }
}

async function ensureTopicsAndQuizzes(adminId, mode, stats) {
  const topicMap = new Map();
  const TOPICS = buildTopics();
  let totalQuestions = 0;

  for (const topicData of TOPICS) {
    const existingTopic = await Topic.findOne({ slug: topicData.slug }).select('_id').lean();

    const { visualizerId, moduleId, content, ...topicFields } = topicData;

    const topicDocument = {
      ...topicFields,
      content,
      status: 'published',
      xpReward: 50,
      createdBy: adminId,
      animationConfig: {
        type: visualizerId ?? topicData.slug,
        defaultParams: {},
      },
    };

    const topic = await Topic.findOneAndUpdate(
      { slug: topicData.slug },
      buildUpdate(mode, topicDocument),
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );

    if (!existingTopic) stats.topics.created += 1;
    else if (mode === 'sync') stats.topics.updated += 1;
    else stats.topics.existing += 1;

    const lessonMeta = {
      title: topicData.title,
      moduleTitle: topicData.tags?.find((t) => t.startsWith('module:'))?.replace('module:', '') ?? moduleId,
      slug: topicData.slug,
      order: topicData.order,
      complexity: {
        time: content.timeComplexity,
        space: content.spaceComplexity,
      },
      applications: content.applications ?? [],
      pitfalls: content.commonMistakes ?? [],
    };

    const questions = buildQuizQuestionsForLesson(lessonMeta);
    totalQuestions += questions.length;

    const quizDocument = {
      topicId: topic._id,
      title: `${topicData.title} Quiz`,
      category: topicData.category,
      passingScore: 70,
      timeLimitMinutes: 15,
      questions,
      xpReward: 30,
      status: 'published',
    };

    let quiz = await Quiz.findOne({ topicId: topic._id });
    if (!quiz) {
      quiz = await Quiz.create(quizDocument);
      stats.quizzes.created += 1;
    } else if (mode === 'sync') {
      quiz = await Quiz.findOneAndUpdate({ topicId: topic._id }, { $set: quizDocument }, { new: true });
      stats.quizzes.updated += 1;
    } else {
      stats.quizzes.existing += 1;
    }

    if (!topic.quizId || String(topic.quizId) !== String(quiz._id)) {
      await Topic.findByIdAndUpdate(topic._id, { quizId: quiz._id });
    }

    topicMap.set(topicData.slug, topic);
  }

  stats.quizQuestions = totalQuestions;
  return { topicMap, orderedTopics: TOPICS.map((t) => t.slug) };
}

async function wireTopicNavigation(topicMap, orderedSlugs, mode) {
  const ids = orderedSlugs.map((slug) => topicMap.get(slug)?._id).filter(Boolean);

  for (let i = 0; i < ids.length; i++) {
    const topic = topicMap.get(orderedSlugs[i]);
    if (!topic) continue;

    const navigation = {
      previousLesson: i > 0 ? ids[i - 1] : undefined,
      nextLesson: i < ids.length - 1 ? ids[i + 1] : undefined,
      relatedLessons: [],
      suggestedLessons: [],
    };

    if (i > 0 && i < ids.length - 1) {
      navigation.relatedLessons = [ids[i - 1], ids[i + 1]].filter(Boolean);
    }
    if (i < ids.length - 2) {
      navigation.suggestedLessons = [ids[i + 2]].filter(Boolean);
    }

    await Topic.findByIdAndUpdate(topic._id, { navigation });
  }
}

async function ensureProblems(adminId, topicMap, mode, stats) {
  const problemIdsByTopic = new Map();

  for (const problemData of PROBLEMS) {
    const problemDocument = { ...problemData, createdBy: adminId };
    const existing = await Problem.findOne({ slug: problemData.slug }).select('_id').lean();

    let problem;
    if (!existing) {
      problem = await Problem.create(problemDocument);
      stats.problems.created += 1;
    } else if (mode === 'sync') {
      problem = await Problem.findOneAndUpdate(
        { slug: problemData.slug },
        { $set: problemDocument },
        { new: true, runValidators: true }
      );
      stats.problems.updated += 1;
    } else {
      problem = await Problem.findById(existing._id);
      stats.problems.existing += 1;
    }

    for (const topicSlug of problemData.topicSlugs || []) {
      if (!problemIdsByTopic.has(topicSlug)) problemIdsByTopic.set(topicSlug, []);
      problemIdsByTopic.get(topicSlug).push(problem._id);
    }
  }

  for (const [slug, topic] of topicMap) {
    const topicDoc = await Topic.findById(topic._id).select('relatedProblems').lean();
    const hasRelated = Array.isArray(topicDoc?.relatedProblems) && topicDoc.relatedProblems.length > 0;
    if (hasRelated && mode !== 'sync') continue;

    const relatedIds = problemIdsByTopic.get(slug) || [];
    if (relatedIds.length === 0) continue;

    await Topic.findByIdAndUpdate(topic._id, { relatedProblems: relatedIds.slice(0, 10) });
  }
}

async function ensureDailyChallenges(mode, stats) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const descriptions = {
    problem: 'Solve one practice problem from the curated problem set',
    quiz: 'Pass one topic quiz with at least 70% score',
    topic: 'Complete one lesson in the curriculum',
    streak: 'Maintain your daily learning streak',
    tracing: 'Complete a manual tracing exercise in any lesson',
    visualizer: 'Run one algorithm visualization and step through all states',
    interview: 'Review three interview Q&A pairs from a lesson',
  };

  for (let i = 0; i < DAILY_CHALLENGE_DAYS; i += 1) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const type = DAILY_CHALLENGE_TYPES[i % DAILY_CHALLENGE_TYPES.length];

    const challengeDocument = {
      date,
      type,
      target: { count: type === 'interview' ? 3 : 1 },
      xpReward: 20 + (i % 5) * 5,
      description: descriptions[type] ?? `Complete today's ${type} challenge`,
      isActive: true,
    };

    const existing = await DailyChallenge.findOne({ date }).select('_id').lean();
    if (existing && mode !== 'sync') {
      stats.dailyChallenges.existing += 1;
      continue;
    }

    await DailyChallenge.findOneAndUpdate(
      { date },
      mode === 'sync' ? { $set: challengeDocument } : { $setOnInsert: challengeDocument },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (existing) stats.dailyChallenges.updated += 1;
    else stats.dailyChallenges.created += 1;
  }
}

function pickProblemsForContest(allProblems, contestData, index) {
  const diffMap = { beginner: DIFFICULTY.EASY, intermediate: DIFFICULTY.MEDIUM, advanced: DIFFICULTY.HARD };
  const targetDiff = diffMap[contestData.difficulty] ?? DIFFICULTY.MEDIUM;
  const filtered = allProblems.filter((p) => p.difficulty === targetDiff);
  const pool = filtered.length >= contestData.problemCount ? filtered : allProblems;
  const start = (index * contestData.problemCount) % Math.max(1, pool.length - contestData.problemCount + 1);
  return pool.slice(start, start + contestData.problemCount);
}

async function ensureContests(adminId, mode, stats) {
  const allProblems = await Problem.find({ status: 'published' })
    .sort({ difficulty: 1, slug: 1 })
    .select('_id slug difficulty')
    .lean()
    .exec();

  if (allProblems.length < 3) {
    logger.warn('Bootstrap skipped contests — not enough published problems yet');
    return;
  }

  const now = Date.now();

  for (const [index, contestData] of CONTESTS.entries()) {
    const existing = await Contest.findOne({ slug: contestData.slug }).select('_id').lean();
    if (existing && mode !== 'sync') {
      stats.contests.existing += 1;
      continue;
    }

    const startTime = new Date(now + contestData.offsetStartHours * 60 * 60 * 1000);
    const endTime = new Date(startTime.getTime() + contestData.durationHours * 60 * 60 * 1000);
    const problemSlice = pickProblemsForContest(allProblems, contestData, index);

    const contestDocument = {
      title: contestData.title,
      slug: contestData.slug,
      description: contestData.description,
      startTime,
      endTime,
      durationMinutes: Math.round(contestData.durationHours * 60),
      problemIds: problemSlice.map((p) => p._id),
      difficulty: CONTEST_DIFFICULTY_MAP[contestData.difficulty] ?? 'medium',
      rules: `Type: ${contestData.type}. ICPC-style scoring with ${contestData.problemCount} problems.`,
      createdBy: adminId,
      status: endTime < new Date() ? 'completed' : startTime > new Date() ? 'scheduled' : 'active',
    };

    await Contest.findOneAndUpdate({ slug: contestData.slug }, buildUpdate(mode, contestDocument), {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    });

    if (existing) stats.contests.updated += 1;
    else stats.contests.created += 1;
  }
}

async function ensureAnnouncement(adminId, mode, stats) {
  const existing = await Announcement.findOne({ title: WELCOME_ANNOUNCEMENT_TITLE }).select('_id').lean();
  if (existing && mode !== 'sync') {
    stats.announcements.existing += 1;
    return;
  }

  const announcementDocument = {
    title: WELCOME_ANNOUNCEMENT_TITLE,
    content:
      'Welcome to the complete ThinkStack DSA curriculum — 500 lessons, 300+ problems, 1000+ quiz questions, and 30 contests. Start with Introduction to Programming or jump to your current level.',
    isActive: true,
    priority: 'normal',
    createdBy: adminId,
  };

  await Announcement.findOneAndUpdate(
    { title: WELCOME_ANNOUNCEMENT_TITLE },
    mode === 'sync' ? { $set: announcementDocument } : { $setOnInsert: announcementDocument },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  if (existing) stats.announcements.updated += 1;
  else stats.announcements.created += 1;
}

function createStats() {
  return {
    admin: null,
    badges: { upserted: 0, existing: 0, updated: 0 },
    certificates: { created: 0, existing: 0, updated: 0 },
    visualizers: { created: 0, existing: 0, updated: 0 },
    topics: { created: 0, existing: 0, updated: 0 },
    quizzes: { created: 0, existing: 0, updated: 0 },
    quizQuestions: 0,
    problems: { created: 0, existing: 0, updated: 0 },
    dailyChallenges: { created: 0, existing: 0, updated: 0 },
    contests: { created: 0, existing: 0, updated: 0 },
    announcements: { created: 0, existing: 0, updated: 0 },
    totals: {},
  };
}

export async function bootstrapDatabase(options = {}) {
  const mode = options.mode === 'sync' ? 'sync' : 'insert';
  const stats = createStats();

  const admin = await ensureAdmin();
  stats.admin = admin.email;

  const demoUser = await ensureDemoUser();
  if (demoUser) stats.demo = demoUser.email;

  await ensureBadges(mode, stats);
  await ensureCertificates(mode, stats);
  await ensureVisualizers(mode, stats);

  const { topicMap, orderedTopics } = await ensureTopicsAndQuizzes(admin._id, mode, stats);
  await wireTopicNavigation(topicMap, orderedTopics, mode);
  await ensureProblems(admin._id, topicMap, mode, stats);
  await ensureContests(admin._id, mode, stats);
  await ensureDailyChallenges(mode, stats);
  await ensureAnnouncement(admin._id, mode, stats);

  stats.totals = {
    topics: await Topic.countDocuments(),
    problems: await Problem.countDocuments(),
    quizzes: await Quiz.countDocuments(),
    badges: await Badge.countDocuments(),
    certificates: await Certificate.countDocuments(),
    visualizers: await Visualizer.countDocuments(),
    dailyChallenges: await DailyChallenge.countDocuments(),
    contests: await Contest.countDocuments(),
    announcements: await Announcement.countDocuments(),
    users: await User.countDocuments(),
  };

  logger.info(`Database bootstrap completed [${mode}]`, {
    admin: stats.admin,
    totals: stats.totals,
    quizQuestions: stats.quizQuestions,
    changes: {
      badges: stats.badges,
      certificates: stats.certificates,
      visualizers: stats.visualizers,
      topics: stats.topics,
      quizzes: stats.quizzes,
      problems: stats.problems,
      dailyChallenges: stats.dailyChallenges,
      contests: stats.contests,
      announcements: stats.announcements,
    },
  });

  return stats;
}

export default bootstrapDatabase;
