import quizRepository, { quizAttemptRepository } from '../repositories/QuizRepository.js';
import topicRepository from '../repositories/TopicRepository.js';
import userRepository from '../repositories/UserRepository.js';
import gamificationService from './GamificationService.js';
import AppError from '../utils/AppError.js';

const stripQuestionForClient = (question) => ({
  id: question._id.toString(),
  question: question.question,
  options: question.options,
  difficulty: question.difficulty,
});

const formatQuizSummary = (quiz, attemptStats) => {
  const stats = attemptStats?.get(quiz._id.toString());
  const topic = quiz.topicId;

  return {
    id: quiz._id.toString(),
    title: quiz.title,
    topic: topic
      ? {
          id: topic._id?.toString?.() ?? topic.toString(),
          slug: topic.slug,
          title: topic.title,
        }
      : null,
    questionCount: quiz.questions?.length ?? 0,
    passingScore: quiz.passingScore,
    timeLimitMinutes: quiz.timeLimitMinutes ?? null,
    xpReward: quiz.xpReward,
    bestScore: stats?.bestScore ?? null,
    passed: stats?.passed ?? false,
    attemptCount: stats?.attemptCount ?? 0,
    lastAttemptAt: stats?.lastAttemptAt ?? null,
  };
};

const gradeAttempt = (quiz, answers) => {
  const questions = quiz.questions ?? [];

  if (answers.length !== questions.length) {
    throw new AppError('Answer count must match question count', 400);
  }

  const results = questions.map((question, index) => {
    const selectedIndex = answers[index];
    if (
      !Number.isInteger(selectedIndex) ||
      selectedIndex < 0 ||
      selectedIndex >= question.options.length
    ) {
      throw new AppError(`Invalid answer for question ${index + 1}`, 400);
    }

    const isCorrect = selectedIndex === question.correctIndex;

    return {
      questionId: question._id.toString(),
      question: question.question,
      options: question.options,
      selectedIndex,
      correctIndex: question.correctIndex,
      isCorrect,
      explanation: question.explanation ?? '',
    };
  });

  const correctCount = results.filter((item) => item.isCorrect).length;
  const score = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;
  const passed = score >= quiz.passingScore;

  return { results, score, passed, correctCount, total: questions.length };
};

export class QuizService {
  async listQuizzes(userId, { page = 1, limit = 20, topic, search } = {}) {
    const filter = { status: 'published' };
    const term = (search || topic || '').trim();

    if (term) {
      const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const topicIds = await topicRepository.findPublishedIdsMatching(term);

      const orConditions = [{ title: regex }];
      if (topicIds.length) {
        orConditions.push({ topicId: { $in: topicIds } });
      }
      filter.$or = orConditions;
    }

    const { data, meta } = await quizRepository.find(filter, {
      page,
      limit,
      sort: { title: 1 },
      populate: { path: 'topicId', select: 'slug title' },
    });

    const quizIds = data.map((quiz) => quiz._id);
    const bestAttempts = await quizAttemptRepository.getBestAttemptsByUser(userId, quizIds);
    const attemptStats = new Map(bestAttempts.map((item) => [item._id.toString(), item]));

    return {
      quizzes: data.map((quiz) => formatQuizSummary(quiz, attemptStats)),
      meta,
    };
  }

  async getQuiz(userId, quizId) {
    const quiz = await quizRepository.findPublishedById(quizId, {
      populate: { path: 'topicId', select: 'slug title' },
    });

    if (!quiz) {
      throw new AppError('Quiz not found', 404);
    }

    const bestAttempt = await quizAttemptRepository.findBestAttempt(userId, quizId);
    const topic = quiz.topicId;

    return {
      id: quiz._id.toString(),
      title: quiz.title,
      passingScore: quiz.passingScore,
      timeLimitMinutes: quiz.timeLimitMinutes ?? null,
      xpReward: quiz.xpReward,
      questionCount: quiz.questions.length,
      topic: topic
        ? {
            id: topic._id.toString(),
            slug: topic.slug,
            title: topic.title,
          }
        : null,
      questions: quiz.questions.map(stripQuestionForClient),
      bestScore: bestAttempt?.score ?? null,
      passed: bestAttempt?.passed ?? false,
    };
  }

  async submitAttempt(userId, quizId, { answers, timeTakenSeconds }) {
    const quiz = await quizRepository.findPublishedById(quizId);

    if (!quiz) {
      throw new AppError('Quiz not found', 404);
    }

    if (!Array.isArray(answers)) {
      throw new AppError('Answers must be an array', 400);
    }

    if (
      quiz.timeLimitMinutes &&
      timeTakenSeconds != null &&
      timeTakenSeconds > quiz.timeLimitMinutes * 60
    ) {
      throw new AppError('Time limit exceeded', 400);
    }

    const { results, score, passed, correctCount, total } = gradeAttempt(quiz, answers);

    const hadXpAward = await quizAttemptRepository.hasPassedWithXP(userId, quizId);
    let xpAwarded = 0;
    let awardXpFlag = false;

    if (passed && !hadXpAward) {
      xpAwarded = quiz.xpReward ?? 0;
      awardXpFlag = true;
    }

    const attempt = await quizAttemptRepository.create({
      userId,
      quizId: quiz._id,
      answers,
      score,
      passed,
      timeTakenSeconds: timeTakenSeconds ?? null,
      xpAwarded: awardXpFlag,
    });

    let updatedUser = null;
    let activity = { newBadges: [], dailyChallengeCompleted: false, xpBonus: 0, coinsEarned: 0 };
    if (awardXpFlag) {
      updatedUser = await userRepository.addXP(userId, xpAwarded);
      await userRepository.incrementStat(userId, 'quizzesPassed');
      activity = await gamificationService.processActivity(userId, { activityType: 'quiz_passed' });
    }

    return {
      attempt: {
        id: attempt._id.toString(),
        score,
        passed,
        correctCount,
        total,
        timeTakenSeconds: attempt.timeTakenSeconds ?? null,
        createdAt: attempt.createdAt,
      },
      results,
      xpAwarded,
      gamification: activity.gamification ?? updatedUser?.gamification ?? null,
      stats: activity.stats ?? updatedUser?.stats ?? null,
      newBadges: activity.newBadges ?? [],
      dailyChallengeCompleted: activity.dailyChallengeCompleted ?? false,
      bonusXp: activity.xpBonus ?? 0,
      coinsEarned: activity.coinsEarned ?? 0,
    };
  }

  async listAttempts(userId, quizId, { page = 1, limit = 20 } = {}) {
    const quiz = await quizRepository.findPublishedById(quizId, {
      select: 'title passingScore',
    });

    if (!quiz) {
      throw new AppError('Quiz not found', 404);
    }

    const { data, meta } = await quizAttemptRepository.findByUserAndQuiz(userId, quizId, {
      page,
      limit,
    });

    return {
      attempts: data.map((attempt) => ({
        id: attempt._id.toString(),
        score: attempt.score,
        passed: attempt.passed,
        timeTakenSeconds: attempt.timeTakenSeconds ?? null,
        xpAwarded: attempt.xpAwarded ?? false,
        createdAt: attempt.createdAt,
      })),
      meta,
    };
  }

  async getAttempt(userId, quizId, attemptId) {
    const quiz = await quizRepository.findPublishedById(quizId);
    if (!quiz) {
      throw new AppError('Quiz not found', 404);
    }

    const attempt = await quizAttemptRepository.findById(attemptId);
    if (
      !attempt ||
      attempt.userId.toString() !== userId ||
      attempt.quizId.toString() !== quizId
    ) {
      throw new AppError('Attempt not found', 404);
    }

    const { results, score, passed, correctCount, total } = gradeAttempt(quiz, attempt.answers);

    return {
      attempt: {
        id: attempt._id.toString(),
        score,
        passed,
        correctCount,
        total,
        timeTakenSeconds: attempt.timeTakenSeconds ?? null,
        createdAt: attempt.createdAt,
      },
      results,
      quiz: {
        id: quiz._id.toString(),
        title: quiz.title,
        passingScore: quiz.passingScore,
      },
    };
  }
}

export default new QuizService();
