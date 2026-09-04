import mongoose from 'mongoose';
import { XP_REWARDS } from 'shared/constants';
import { User, UserProgress, QuizAttempt, DailyChallengeCompletion, UserBadge, Submission } from '../models/index.js';
import { calculateLevel } from '../utils/gamification.js';

const ACTIVE_USER_FILTER = { isActive: true, isSuspended: false };

const problemXpExpression = {
  $switch: {
    branches: [
      { case: { $eq: ['$problem.difficulty', 'easy'] }, then: XP_REWARDS.PROBLEM_EASY },
      { case: { $eq: ['$problem.difficulty', 'medium'] }, then: XP_REWARDS.PROBLEM_MEDIUM },
      { case: { $eq: ['$problem.difficulty', 'hard'] }, then: XP_REWARDS.PROBLEM_HARD },
    ],
    default: XP_REWARDS.PROBLEM_EASY,
  },
};

const mergeXpRows = (rows) => {
  const totals = new Map();
  for (const row of rows) {
    const userId = row._id.toString();
    totals.set(userId, (totals.get(userId) ?? 0) + row.xp);
  }
  return totals;
};

const assignRanks = (entries) => {
  let rank = 0;
  let lastXp = null;

  return entries.map((entry, index) => {
    if (entry.xp !== lastXp) {
      rank = index + 1;
      lastXp = entry.xp;
    }
    return { ...entry, rank };
  });
};

export class LeaderboardRepository {
  async findGlobalLeaderboard(limit = 100) {
    return User.find(ACTIVE_USER_FILTER)
      .sort({ 'gamification.xp': -1, createdAt: 1 })
      .limit(limit)
      .select('username profile.displayName profile.avatar gamification stats.problemsSolved')
      .lean()
      .exec();
  }

  async getGlobalRank(userId) {
    const user = await User.findById(userId)
      .select('gamification.xp isActive isSuspended')
      .lean()
      .exec();

    if (!user || !user.isActive || user.isSuspended) {
      return null;
    }

    const xp = user.gamification?.xp ?? 0;
    const ahead = await User.countDocuments({
      ...ACTIVE_USER_FILTER,
      $or: [{ 'gamification.xp': { $gt: xp } }, { 'gamification.xp': xp, _id: { $lt: user._id } }],
    }).exec();

    return ahead + 1;
  }

  async getWeekStart() {
    const start = new Date();
    const day = start.getDay();
    const diff = day === 0 ? 6 : day - 1;
    start.setDate(start.getDate() - diff);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  async aggregateWeeklyXp(since) {
    const sinceDate = since instanceof Date ? since : new Date(since);

    const [topicRows, quizRows, challengeRows, badgeRows, problemRows] = await Promise.all([
      UserProgress.aggregate([
        {
          $match: {
            xpAwarded: true,
            completedAt: { $gte: sinceDate },
          },
        },
        {
          $lookup: {
            from: 'topics',
            localField: 'topicId',
            foreignField: '_id',
            as: 'topic',
          },
        },
        { $unwind: '$topic' },
        { $group: { _id: '$userId', xp: { $sum: '$topic.xpReward' } } },
      ]),
      QuizAttempt.aggregate([
        {
          $match: {
            xpAwarded: true,
            passed: true,
            createdAt: { $gte: sinceDate },
          },
        },
        {
          $lookup: {
            from: 'quizzes',
            localField: 'quizId',
            foreignField: '_id',
            as: 'quiz',
          },
        },
        { $unwind: '$quiz' },
        { $group: { _id: '$userId', xp: { $sum: '$quiz.xpReward' } } },
      ]),
      DailyChallengeCompletion.aggregate([
        { $match: { completedAt: { $gte: sinceDate } } },
        { $group: { _id: '$userId', xp: { $sum: '$xpAwarded' } } },
      ]),
      UserBadge.aggregate([
        { $match: { earnedAt: { $gte: sinceDate } } },
        {
          $lookup: {
            from: 'badges',
            localField: 'badgeId',
            foreignField: '_id',
            as: 'badge',
          },
        },
        { $unwind: '$badge' },
        { $group: { _id: '$userId', xp: { $sum: '$badge.xpBonus' } } },
      ]),
      Submission.aggregate([
        {
          $match: {
            type: 'problem',
            verdict: 'accepted',
            createdAt: { $gte: sinceDate },
          },
        },
        { $sort: { createdAt: 1 } },
        {
          $group: {
            _id: { userId: '$userId', problemId: '$problemId' },
            firstAt: { $first: '$createdAt' },
          },
        },
        {
          $lookup: {
            from: 'submissions',
            let: {
              uid: '$_id.userId',
              pid: '$_id.problemId',
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$userId', '$$uid'] },
                      { $eq: ['$problemId', '$$pid'] },
                      { $eq: ['$verdict', 'accepted'] },
                      { $lt: ['$createdAt', sinceDate] },
                    ],
                  },
                },
              },
              { $limit: 1 },
            ],
            as: 'priorAccepted',
          },
        },
        { $match: { priorAccepted: { $size: 0 } } },
        {
          $lookup: {
            from: 'problems',
            localField: '_id.problemId',
            foreignField: '_id',
            as: 'problem',
          },
        },
        { $unwind: '$problem' },
        {
          $group: {
            _id: '$_id.userId',
            xp: { $sum: problemXpExpression },
          },
        },
      ]),
    ]);

    return mergeXpRows([...topicRows, ...quizRows, ...challengeRows, ...badgeRows, ...problemRows]);
  }

  async findWeeklyLeaderboard(limit = 100, since = null) {
    const weekStart = since ?? (await this.getWeekStart());
    const xpByUser = await this.aggregateWeeklyXp(weekStart);

    if (xpByUser.size === 0) {
      return { weekStart, entries: [] };
    }

    const userIds = [...xpByUser.keys()].map((id) => new mongoose.Types.ObjectId(id));
    const users = await User.find({
      _id: { $in: userIds },
      ...ACTIVE_USER_FILTER,
    })
      .select('username profile.displayName profile.avatar gamification stats.problemsSolved createdAt')
      .lean()
      .exec();

    const entries = users
      .map((user) => ({
        user,
        xp: xpByUser.get(user._id.toString()) ?? 0,
      }))
      .filter((entry) => entry.xp > 0)
      .sort((a, b) => {
        if (b.xp !== a.xp) return b.xp - a.xp;
        return new Date(a.user.createdAt) - new Date(b.user.createdAt);
      })
      .slice(0, limit);

    return { weekStart, entries };
  }

  async getWeeklyRank(userId, since = null) {
    const weekStart = since ?? (await this.getWeekStart());
    const xpByUser = await this.aggregateWeeklyXp(weekStart);
    const userXp = xpByUser.get(userId.toString()) ?? 0;

    if (userXp <= 0) {
      return { rank: null, xp: 0, weekStart };
    }

    const user = await User.findById(userId).select('createdAt isActive isSuspended').lean().exec();
    if (!user || !user.isActive || user.isSuspended) {
      return { rank: null, xp: userXp, weekStart };
    }

    const activeIds = new Set(
      (
        await User.find({ ...ACTIVE_USER_FILTER, _id: { $in: [...xpByUser.keys()] } })
          .select('_id createdAt')
          .lean()
          .exec()
      ).map((entry) => entry._id.toString())
    );

    const sorted = [...xpByUser.entries()]
      .filter(([id]) => activeIds.has(id))
      .map(([id, xp]) => ({
        userId: id,
        xp,
        createdAt: id === userId.toString() ? user.createdAt : null,
      }));

    const users = await User.find({
      _id: { $in: sorted.map((entry) => entry.userId) },
    })
      .select('createdAt')
      .lean()
      .exec();
    const createdAtMap = new Map(users.map((entry) => [entry._id.toString(), entry.createdAt]));

    sorted.sort((a, b) => {
      if (b.xp !== a.xp) return b.xp - a.xp;
      const aCreated = createdAtMap.get(a.userId) ?? 0;
      const bCreated = createdAtMap.get(b.userId) ?? 0;
      return new Date(aCreated) - new Date(bCreated);
    });

    const ranked = assignRanks(sorted);
    const match = ranked.find((entry) => entry.userId === userId.toString());

    return {
      rank: match?.rank ?? null,
      xp: userXp,
      weekStart,
    };
  }
}

export const formatLeaderboardEntry = (user, rank, xp) => ({
  rank,
  userId: user._id.toString(),
  username: user.username,
  displayName: user.profile?.displayName || user.username,
  avatar: user.profile?.avatar ?? null,
  xp,
  level: user.gamification?.level ?? calculateLevel(user.gamification?.xp ?? 0),
  problemsSolved: user.stats?.problemsSolved ?? 0,
});

export default new LeaderboardRepository();
