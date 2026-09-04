import mongoose from 'mongoose';
import { VERDICT, ROLES } from 'shared/constants';
import contestRepository from '../repositories/ContestRepository.js';
import contestParticipantRepository from '../repositories/ContestParticipantRepository.js';
import contestSubmissionRepository from '../repositories/ContestSubmissionRepository.js';
import problemRepository from '../repositories/ProblemRepository.js';
import submissionRepository from '../repositories/SubmissionRepository.js';
import userRepository from '../repositories/UserRepository.js';
import judge0Service from './Judge0Service.js';
import gamificationService from './GamificationService.js';
import notificationService from './NotificationService.js';
import AppError from '../utils/AppError.js';
import { resolveLanguage } from '../utils/codeExecution.js';
import {
  calculateIcpcScore,
  getContestProblemPoints,
  resolveEffectiveContestStatus,
} from '../utils/contestScoring.js';

const formatContestSummary = (contest, participant = null) => {
  const effectiveStatus = resolveEffectiveContestStatus(contest);
  const now = Date.now();
  const startMs = new Date(contest.startTime).getTime();
  const endMs = new Date(contest.endTime).getTime();

  return {
    id: contest._id.toString(),
    slug: contest.slug,
    title: contest.title,
    description: contest.description ?? '',
    startTime: contest.startTime,
    endTime: contest.endTime,
    status: effectiveStatus,
    storedStatus: contest.status,
    problemCount: contest.problemIds?.length ?? 0,
    isRegistered: Boolean(participant),
    participant: participant
      ? {
          score: participant.score ?? 0,
          penaltyMinutes: participant.penaltyMinutes ?? 0,
          rank: participant.rank ?? null,
        }
      : null,
    timing: {
      msUntilStart: effectiveStatus === 'scheduled' ? Math.max(0, startMs - now) : 0,
      msUntilEnd: effectiveStatus === 'active' ? Math.max(0, endMs - now) : 0,
      msSinceEnd: effectiveStatus === 'completed' ? Math.max(0, now - endMs) : 0,
    },
  };
};

const formatSubmission = (submission) => ({
  id: submission._id.toString(),
  language: submission.language,
  verdict: submission.verdict,
  points: submission.points ?? 0,
  submittedAt: submission.submittedAt ?? submission.createdAt,
});

export class ContestService {
  async listContests(userId, query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 20;
    const filter = {};

    if (query.status && query.status !== 'all') {
      if (query.status === 'upcoming') {
        filter.startTime = { $gt: new Date() };
        filter.status = { $ne: 'cancelled' };
      } else if (query.status === 'active') {
        filter.startTime = { $lte: new Date() };
        filter.endTime = { $gte: new Date() };
        filter.status = { $ne: 'cancelled' };
      } else if (query.status === 'past') {
        filter.endTime = { $lt: new Date() };
      } else {
        filter.status = query.status;
      }
    }

    const { data, meta } = await contestRepository.findFiltered(filter, { page, limit });
    const contestIds = data.map((contest) => contest._id);
    const participants = await contestParticipantRepository.model
      .find({ contestId: { $in: contestIds }, userId })
      .lean()
      .exec();
    const participantMap = new Map(
      participants.map((entry) => [entry.contestId.toString(), entry])
    );

    await Promise.all(data.map((contest) => this.syncContestStatus(contest)));

    return {
      contests: data.map((contest) =>
        formatContestSummary(contest, participantMap.get(contest._id.toString()) ?? null)
      ),
      meta,
    };
  }

  async getContestBySlug(userId, slug) {
    const contest = await contestRepository.findBySlug(slug, {
      populate: { path: 'problemIds', select: 'slug title difficulty tags' },
    });

    if (!contest) {
      throw new AppError('Contest not found', 404);
    }

    await this.syncContestStatus(contest);
    const refreshed = await contestRepository.findBySlug(slug, {
      populate: { path: 'problemIds', select: 'slug title difficulty tags' },
    });

    const participant = await contestParticipantRepository.findByContestAndUser(
      refreshed._id,
      userId
    );
    const statusMap = participant
      ? await contestSubmissionRepository.getProblemStatusMap(refreshed._id, userId)
      : { solved: new Set(), attempted: new Set() };

    const problems = (refreshed.problemIds ?? []).map((problem) => {
      const id = problem._id.toString();
      let status = 'unsolved';
      if (statusMap.solved.has(id)) status = 'solved';
      else if (statusMap.attempted.has(id)) status = 'attempted';

      return {
        id,
        slug: problem.slug,
        title: problem.title,
        difficulty: problem.difficulty,
        tags: problem.tags ?? [],
        points: getContestProblemPoints(problem),
        status,
      };
    });

    const summary = formatContestSummary(refreshed, participant);
    const leaderboardPreview = await this.buildLeaderboard(refreshed._id, 5);

    return {
      ...summary,
      problems,
      leaderboardPreview: leaderboardPreview.entries,
    };
  }

  async register(userId, slug) {
    const contest = await this.getContestDocument(slug);
    const effectiveStatus = resolveEffectiveContestStatus(contest);

    if (effectiveStatus === 'completed' || effectiveStatus === 'cancelled') {
      throw new AppError('Registration is closed for this contest', 400);
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const existing = await contestParticipantRepository.findByContestAndUser(contest._id, userId);
    if (existing) {
      return {
        participant: existing,
        alreadyRegistered: true,
        newBadges: [],
      };
    }

    const participant = await contestParticipantRepository.register(
      contest._id,
      userId,
      user.username
    );

    await notificationService.notifyContestRegistration(userId, contest);

    const badgeResult = await gamificationService.evaluateAndAwardBadges(userId);

    return {
      participant,
      alreadyRegistered: false,
      newBadges: badgeResult.newBadges,
    };
  }

  async getLeaderboard(userId, slug, { limit = 100 } = {}) {
    const contest = await this.getContestDocument(slug);
    await this.syncContestStatus(contest);
    const data = await this.buildLeaderboard(contest._id, limit);

    const currentEntry = data.entries.find((entry) => entry.userId === userId);
    const participant = await contestParticipantRepository.findByContestAndUser(
      contest._id,
      userId
    );

    return {
      contest: {
        id: contest._id.toString(),
        slug: contest.slug,
        title: contest.title,
        status: resolveEffectiveContestStatus(contest),
        startTime: contest.startTime,
        endTime: contest.endTime,
      },
      entries: data.entries,
      currentUser: participant
        ? {
            userId,
            username: participant.username,
            rank: currentEntry?.rank ?? participant.rank ?? null,
            score: participant.score ?? 0,
            penaltyMinutes: participant.penaltyMinutes ?? 0,
            inTopList: Boolean(currentEntry),
          }
        : null,
    };
  }

  async getContestProblem(userId, contestSlug, problemSlug) {
    const contest = await this.getContestDocument(contestSlug);
    const effectiveStatus = resolveEffectiveContestStatus(contest);

    const participant = await contestParticipantRepository.findByContestAndUser(
      contest._id,
      userId
    );
    if (!participant) {
      throw new AppError('Register for the contest before opening problems', 403);
    }

    if (effectiveStatus === 'scheduled') {
      throw new AppError('Contest has not started yet', 403);
    }

    const problem = await problemRepository.findOne({
      slug: problemSlug.toLowerCase(),
      status: 'published',
    });

    if (!problem) {
      throw new AppError('Problem not found', 404);
    }

    const inContest = (contest.problemIds ?? []).some(
      (id) => id.toString() === problem._id.toString()
    );
    if (!inContest) {
      throw new AppError('Problem is not part of this contest', 404);
    }

    const statusMap = await contestSubmissionRepository.getProblemStatusMap(
      contest._id,
      userId
    );
    const problemId = problem._id.toString();
    let status = 'unsolved';
    if (statusMap.solved.has(problemId)) status = 'solved';
    else if (statusMap.attempted.has(problemId)) status = 'attempted';

    const publicTestCases = (problem.testCases ?? []).filter((testCase) => !testCase.isHidden);

    return {
      contest: {
        slug: contest.slug,
        title: contest.title,
        status: effectiveStatus,
        startTime: contest.startTime,
        endTime: contest.endTime,
        msUntilEnd:
          effectiveStatus === 'active'
            ? Math.max(0, new Date(contest.endTime).getTime() - Date.now())
            : 0,
      },
      problem: {
        id: problemId,
        slug: problem.slug,
        title: problem.title,
        difficulty: problem.difficulty,
        description: problem.description,
        constraints: problem.constraints ?? '',
        examples: problem.examples ?? [],
        starterCode: problem.starterCode ?? {},
        publicTestCases,
        points: getContestProblemPoints(problem),
        status,
      },
      canSubmit: effectiveStatus === 'active',
    };
  }

  async runSample(userId, contestSlug, problemSlug, { language, sourceCode, stdin }) {
    await this.getContestProblem(userId, contestSlug, problemSlug);

    const problem = await problemRepository.findOne({
      slug: problemSlug.toLowerCase(),
      status: 'published',
    });

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

  async submitSolution(userId, contestSlug, problemSlug, { language, sourceCode }) {
    const contest = await this.getContestDocument(contestSlug);
    const effectiveStatus = resolveEffectiveContestStatus(contest);

    if (effectiveStatus !== 'active') {
      throw new AppError('Submissions are only allowed while the contest is active', 403);
    }

    const participant = await contestParticipantRepository.findByContestAndUser(
      contest._id,
      userId
    );
    if (!participant) {
      throw new AppError('Register for the contest before submitting', 403);
    }

    const problem = await problemRepository.findOne({
      slug: problemSlug.toLowerCase(),
      status: 'published',
    });

    if (!problem) {
      throw new AppError('Problem not found', 404);
    }

    const inContest = (contest.problemIds ?? []).some(
      (id) => id.toString() === problem._id.toString()
    );
    if (!inContest) {
      throw new AppError('Problem is not part of this contest', 404);
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
    const points = accepted ? getContestProblemPoints(problem) : 0;

    const submission = await submissionRepository.create({
      userId,
      problemId: problem._id,
      contestId: contest._id,
      type: 'contest',
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

    const contestSubmission = await contestSubmissionRepository.createSubmission({
      contestId: contest._id,
      userId,
      problemId: problem._id,
      submissionId: submission._id,
      language: monaco,
      verdict: finalVerdict,
      points,
      submittedAt: new Date(),
    });

    await this.recalculateContestScores(contest._id);

    return {
      submission: formatSubmission(contestSubmission),
      verdict: finalVerdict,
      points,
      accepted,
      mockMode: judge0Service.isMockMode(),
    };
  }

  async createContest(adminId, payload) {
    const {
      title,
      slug,
      description = '',
      rules = '',
      difficulty = 'medium',
      visibility = 'public',
      timeLimitMinutes,
      leaderboardSettings,
      startTime,
      endTime,
      problemSlugs = [],
    } = payload;

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new AppError('Invalid start or end time', 400);
    }

    if (end <= start) {
      throw new AppError('End time must be after start time', 400);
    }

    const problems = await problemRepository.model
      .find({ slug: { $in: problemSlugs.map((value) => value.toLowerCase()) }, status: 'published' })
      .select('_id slug')
      .lean()
      .exec();

    if (!problems.length) {
      throw new AppError('At least one published problem is required', 400);
    }

    if (problems.length !== problemSlugs.length) {
      throw new AppError('One or more problem slugs were not found', 400);
    }

    const contest = await contestRepository.create({
      title: title.trim(),
      slug: slug.toLowerCase().trim(),
      description,
      rules,
      difficulty,
      visibility,
      timeLimitMinutes,
      leaderboardSettings,
      startTime: start,
      endTime: end,
      problemIds: problems.map((problem) => problem._id),
      status: resolveEffectiveContestStatus({ startTime: start, endTime: end, status: 'scheduled' }),
      createdBy: adminId,
    });

    return this.formatCreatedContest(contest, problems);
  }

  async getContestDocument(slug) {
    const contest = await contestRepository.findBySlug(slug);
    if (!contest) {
      throw new AppError('Contest not found', 404);
    }
    return contest;
  }

  async syncContestStatus(contest) {
    const effectiveStatus = resolveEffectiveContestStatus(contest);
    const previousStatus = contest.status;

    if (contest.status !== effectiveStatus && contest.status !== 'cancelled') {
      await contestRepository.syncStatus(contest._id, effectiveStatus);
      contest.status = effectiveStatus;

      if (effectiveStatus === 'active' && previousStatus !== 'active') {
        await this.notifyContestParticipants(contest, 'started');
      }
    }

    if (effectiveStatus === 'completed' && previousStatus !== 'completed') {
      await this.finalizeContest(contest._id);
    }
  }

  async notifyContestParticipants(contest, event) {
    const participants = await contestParticipantRepository.findByContest(contest._id);
    if (!participants.length) return;

    await Promise.all(
      participants.map((participant) => {
        if (event === 'started') {
          return notificationService.notifyContestStarted(
            participant.userId.toString(),
            contest
          );
        }
        return Promise.resolve();
      })
    );
  }

  async recalculateContestScores(contestId) {
    const contest = await contestRepository.findById(contestId);
    if (!contest) return;

    const [participants, submissions, problems] = await Promise.all([
      contestParticipantRepository.findByContest(contestId),
      contestSubmissionRepository.findByContest(contestId),
      problemRepository.model
        .find({ _id: { $in: contest.problemIds ?? [] } })
        .select('_id difficulty xpReward')
        .lean()
        .exec(),
    ]);

    const problemMap = new Map(problems.map((problem) => [problem._id.toString(), problem]));
    const submissionsByUser = new Map();

    for (const submission of submissions) {
      const key = submission.userId.toString();
      if (!submissionsByUser.has(key)) submissionsByUser.set(key, []);
      submissionsByUser.get(key).push(submission);
    }

    for (const participant of participants) {
      const userSubmissions = submissionsByUser.get(participant.userId.toString()) ?? [];
      const { score, penaltyMinutes } = calculateIcpcScore(
        contest.startTime,
        contest.problemIds ?? [],
        userSubmissions,
        problemMap
      );

      await contestParticipantRepository.updateScore(participant._id, score, penaltyMinutes);
    }

    await this.updateContestRanks(contestId);
  }

  async updateContestRanks(contestId) {
    const participants = await contestParticipantRepository.findByContest(contestId);
    const sorted = [...participants].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.penaltyMinutes !== b.penaltyMinutes) return a.penaltyMinutes - b.penaltyMinutes;
      return new Date(a.registeredAt) - new Date(b.registeredAt);
    });

    let rank = 0;
    let lastScore = null;
    let lastPenalty = null;

    for (let index = 0; index < sorted.length; index += 1) {
      const participant = sorted[index];
      if (participant.score !== lastScore || participant.penaltyMinutes !== lastPenalty) {
        rank = index + 1;
        lastScore = participant.score;
        lastPenalty = participant.penaltyMinutes;
      }
      await contestParticipantRepository.updateRank(participant._id, rank);
    }
  }

  async finalizeContest(contestId) {
    await this.recalculateContestScores(contestId);

    const contest = await contestRepository.findById(contestId);
    if (!contest) return;

    const participants = await contestParticipantRepository.model
      .find({ contestId })
      .select('userId rank score')
      .lean()
      .exec();

    await Promise.all(
      participants.map((participant) =>
        notificationService.notifyContestResult(participant.userId.toString(), contest, {
          rank: participant.rank ?? 0,
          score: participant.score ?? 0,
        })
      )
    );

    const winners = participants.filter((entry) => entry.rank === 1 && entry.score > 0);

    await Promise.all(
      winners.map((winner) => gamificationService.evaluateAndAwardBadges(winner.userId.toString()))
    );
  }

  async buildLeaderboard(contestId, limit = 100) {
    await this.recalculateContestScores(contestId);

    const participants = await contestParticipantRepository.findByContest(contestId);
    const sorted = participants.slice(0, limit);

    let rank = 0;
    let lastScore = null;
    let lastPenalty = null;

    const entries = sorted.map((participant, index) => {
      if (participant.score !== lastScore || participant.penaltyMinutes !== lastPenalty) {
        rank = index + 1;
        lastScore = participant.score;
        lastPenalty = participant.penaltyMinutes;
      }

      return {
        rank,
        userId: participant.userId.toString(),
        username: participant.username,
        score: participant.score ?? 0,
        penaltyMinutes: participant.penaltyMinutes ?? 0,
      };
    });

    return { entries };
  }

  formatCreatedContest(contest, problems) {
    return {
      id: contest._id.toString(),
      slug: contest.slug,
      title: contest.title,
      description: contest.description ?? '',
      startTime: contest.startTime,
      endTime: contest.endTime,
      status: contest.status,
      problems: problems.map((problem) => ({
        id: problem._id.toString(),
        slug: problem.slug,
      })),
    };
  }
}

export default new ContestService();
