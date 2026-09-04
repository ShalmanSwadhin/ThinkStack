import mongoose from 'mongoose';
import { VERDICT } from 'shared/constants';
import problemRepository from '../repositories/ProblemRepository.js';
import submissionRepository from '../repositories/SubmissionRepository.js';
import userRepository from '../repositories/UserRepository.js';
import judge0Service from './Judge0Service.js';
import gamificationService from './GamificationService.js';
import AppError from '../utils/AppError.js';
import { getProblemXpReward, resolveLanguage } from '../utils/codeExecution.js';

const getUserStatus = (problemId, { solved, attempted }) => {
  const id = problemId.toString();
  if (solved.has(id)) return 'solved';
  if (attempted.has(id)) return 'attempted';
  return 'unsolved';
};

const formatProblemSummary = (problem, statusSets) => ({
  id: problem._id.toString(),
  slug: problem.slug,
  title: problem.title,
  difficulty: problem.difficulty,
  tags: problem.tags ?? [],
  topicSlugs: problem.topicSlugs ?? [],
  acceptanceRate: problem.acceptanceRate ?? 0,
  totalSubmissions: problem.totalSubmissions ?? 0,
  xpReward: getProblemXpReward(problem),
  userStatus: getUserStatus(problem._id, statusSets),
});

const formatProblemDetail = (problem, statusSets) => {
  const publicTestCases = (problem.testCases ?? []).filter((testCase) => !testCase.isHidden);
  const hiddenCount = (problem.testCases ?? []).filter((testCase) => testCase.isHidden).length;

  return {
    id: problem._id.toString(),
    slug: problem.slug,
    title: problem.title,
    difficulty: problem.difficulty,
    tags: problem.tags ?? [],
    topicSlugs: problem.topicSlugs ?? [],
    description: problem.description,
    constraints: problem.constraints ?? '',
    examples: problem.examples ?? [],
    starterCode: problem.starterCode ?? {},
    publicTestCases,
    hiddenTestCount: hiddenCount,
    totalTestCount: problem.testCases?.length ?? 0,
    acceptanceRate: problem.acceptanceRate ?? 0,
    totalSubmissions: problem.totalSubmissions ?? 0,
    xpReward: getProblemXpReward(problem),
    userStatus: getUserStatus(problem._id, statusSets),
    links: {
      aiTutor: `/ai-tutor?problem=${problem.slug}`,
    },
  };
};

const formatSubmission = (submission) => ({
  id: submission._id.toString(),
  language: submission.language,
  verdict: submission.verdict,
  testCasesPassed: submission.testCasesPassed ?? 0,
  testCasesTotal: submission.testCasesTotal ?? 0,
  executionTime: submission.executionTime ?? null,
  memoryUsed: submission.memoryUsed ?? null,
  stdout: submission.stdout ?? '',
  stderr: submission.stderr ?? '',
  createdAt: submission.createdAt,
});

const buildStatusFilter = (status, statusSets) => {
  if (!status || status === 'all') return null;

  const solvedIds = [...statusSets.solved].map((id) => new mongoose.Types.ObjectId(id));
  const attemptedOnlyIds = [...statusSets.attempted]
    .filter((id) => !statusSets.solved.has(id))
    .map((id) => new mongoose.Types.ObjectId(id));

  if (status === 'solved') {
    return solvedIds.length ? { _id: { $in: solvedIds } } : { _id: { $in: [] } };
  }
  if (status === 'attempted') {
    return attemptedOnlyIds.length ? { _id: { $in: attemptedOnlyIds } } : { _id: { $in: [] } };
  }
  if (status === 'unsolved') {
    const excludeIds = [...statusSets.attempted].map((id) => new mongoose.Types.ObjectId(id));
    return excludeIds.length ? { _id: { $nin: excludeIds } } : {};
  }

  throw new AppError('Invalid status filter', 400);
};

export class ProblemService {
  async listProblems(userId, query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 20;
    const { difficulty, topic, status, search } = query;

    const statusSets = await submissionRepository.getUserProblemStatusSets(userId);

    const filter = {};
    if (difficulty) filter.difficulty = difficulty;
    if (topic?.trim()) {
      const escaped = topic.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.topicSlugs = new RegExp(escaped, 'i');
    }
    if (search?.trim()) {
      filter.$text = { $search: search.trim() };
    }

    const statusFilter = buildStatusFilter(status, statusSets);
    if (statusFilter) {
      Object.assign(filter, statusFilter);
    }

    const sort = search?.trim()
      ? { score: { $meta: 'textScore' } }
      : { difficulty: 1, title: 1 };

    const { data, meta } = await problemRepository.findPublishedFiltered(filter, {
      page,
      limit,
      sort,
      select: 'slug title difficulty tags topicSlugs acceptanceRate totalSubmissions xpReward',
    });

    return {
      problems: data.map((problem) => formatProblemSummary(problem, statusSets)),
      meta,
    };
  }

  async getProblemBySlug(userId, slug) {
    const problem = await problemRepository.findOne({
      slug: slug.toLowerCase(),
      status: 'published',
    });

    if (!problem) {
      throw new AppError('Problem not found', 404);
    }

    const statusSets = await submissionRepository.getUserProblemStatusSets(userId);
    return formatProblemDetail(problem, statusSets);
  }

  async runSample(userId, slug, { language, sourceCode, stdin }) {
    const problem = await problemRepository.findOne({
      slug: slug.toLowerCase(),
      status: 'published',
    });

    if (!problem) {
      throw new AppError('Problem not found', 404);
    }

    const sampleInput =
      stdin ??
      problem.examples?.[0]?.input ??
      problem.testCases?.find((testCase) => !testCase.isHidden)?.input;

    if (!sampleInput) {
      throw new AppError('No sample input available for this problem', 400);
    }

    const expectedOutput =
      problem.examples?.find((example) => example.input === sampleInput)?.output ??
      problem.testCases?.find((testCase) => testCase.input === sampleInput)?.expectedOutput ??
      null;

    const { monaco, config } = resolveLanguage(language);
    const result = await judge0Service.execute({
      languageId: config.id,
      sourceCode,
      stdin: sampleInput,
      expectedOutput,
    });

    return {
      run: {
        stdin: sampleInput,
        stdout: result.stdout,
        stderr: result.stderr,
        verdict: result.verdict,
        executionTime: result.executionTime,
        memoryUsed: result.memoryUsed,
        language: monaco,
      },
      mockMode: judge0Service.isMockMode(),
    };
  }

  async submitSolution(userId, slug, { language, sourceCode }) {
    const problem = await problemRepository.findOne({
      slug: slug.toLowerCase(),
      status: 'published',
    });

    if (!problem) {
      throw new AppError('Problem not found', 404);
    }

    const { monaco, config } = resolveLanguage(language);
    const testCases = problem.testCases ?? [];

    if (!testCases.length) {
      throw new AppError('Problem has no test cases configured', 500);
    }

    let passed = 0;
    let finalVerdict = VERDICT.ACCEPTED;
    let lastResult = null;
    let maxExecutionTime = 0;
    let maxMemoryUsed = 0;

    for (const testCase of testCases) {
      const result = await judge0Service.execute({
        languageId: config.id,
        sourceCode,
        stdin: testCase.input,
        expectedOutput: testCase.expectedOutput,
      });

      lastResult = result;
      maxExecutionTime = Math.max(maxExecutionTime, result.executionTime ?? 0);
      maxMemoryUsed = Math.max(maxMemoryUsed, result.memoryUsed ?? 0);

      if (result.verdict === VERDICT.ACCEPTED) {
        passed += 1;
      } else if (finalVerdict === VERDICT.ACCEPTED) {
        finalVerdict = result.verdict;
      }
    }

    if (passed < testCases.length && finalVerdict === VERDICT.ACCEPTED) {
      finalVerdict = VERDICT.WRONG_ANSWER;
    }

    const accepted = finalVerdict === VERDICT.ACCEPTED;
    const hadAccepted = await submissionRepository.hasAcceptedSubmission(userId, problem._id);

    const submission = await submissionRepository.create({
      userId,
      problemId: problem._id,
      type: 'problem',
      language: monaco,
      sourceCode,
      stdout: lastResult?.stdout ?? '',
      stderr: lastResult?.stderr ?? '',
      verdict: finalVerdict,
      executionTime: maxExecutionTime || null,
      memoryUsed: maxMemoryUsed || null,
      testCasesPassed: passed,
      testCasesTotal: testCases.length,
      judge0Token: lastResult?.judge0Token,
    });

    await problemRepository.incrementSubmissionStats(problem._id, accepted);

    let xpAwarded = 0;
    let updatedUser = null;

    if (accepted && !hadAccepted) {
      xpAwarded = getProblemXpReward(problem);
      updatedUser = await userRepository.addXP(userId, xpAwarded);
      await userRepository.incrementStat(userId, 'problemsSolved');
    }

    if (!updatedUser && accepted) {
      updatedUser = await userRepository.findById(userId);
    }

    let activity = { newBadges: [], dailyChallengeCompleted: false, xpBonus: 0, coinsEarned: 0 };
    if (accepted) {
      activity = await gamificationService.processActivity(userId, {
        activityType: 'problem_solved',
        meta: { difficulty: problem.difficulty },
      });
    }

    return {
      submission: formatSubmission(submission),
      xpAwarded,
      gamification: activity.gamification ?? updatedUser?.gamification ?? null,
      stats: activity.stats ?? updatedUser?.stats ?? null,
      newBadges: activity.newBadges ?? [],
      dailyChallengeCompleted: activity.dailyChallengeCompleted ?? false,
      bonusXp: activity.xpBonus ?? 0,
      coinsEarned: activity.coinsEarned ?? 0,
      mockMode: judge0Service.isMockMode(),
    };
  }

  async listSubmissions(userId, slug, { page = 1, limit = 20 } = {}) {
    const problem = await problemRepository.findOne({
      slug: slug.toLowerCase(),
      status: 'published',
    });

    if (!problem) {
      throw new AppError('Problem not found', 404);
    }

    const { data, meta } = await submissionRepository.findByUserAndProblemSlug(
      userId,
      problem._id,
      { page, limit }
    );

    return {
      submissions: data.map(formatSubmission),
      meta,
    };
  }
}

export default new ProblemService();
