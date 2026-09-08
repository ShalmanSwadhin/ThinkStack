import mongoose from 'mongoose';
import { XP_REWARDS, COIN_REWARDS } from 'shared/constants';
import userRepository from '../repositories/UserRepository.js';
import contestParticipantRepository from '../repositories/ContestParticipantRepository.js';
import {
  badgeRepository,
  userBadgeRepository,
} from '../repositories/BadgeRepository.js';
import dailyChallengeRepository from '../repositories/DailyChallengeRepository.js';
import {
  User,
  Note,
  Submission,
  AITutorConversation,
} from '../models/index.js';
import { levelProgress } from '../utils/gamification.js';
import AppError from '../utils/AppError.js';
import notificationService from './NotificationService.js';

const ACTIVITY_TO_CHALLENGE = {
  topic_complete: 'topic',
  problem_solved: 'problem',
  quiz_passed: 'quiz',
};

const STREAK_ACTIVITIES = new Set([
  'login',
  'topic_complete',
  'problem_solved',
  'quiz_passed',
]);

const formatBadge = (badge, earnedAt = null) => ({
  id: badge._id.toString(),
  slug: badge.slug,
  name: badge.name,
  description: badge.description,
  icon: badge.icon,
  xpBonus: badge.xpBonus ?? 0,
  criteria: badge.criteria,
  earned: Boolean(earnedAt),
  earnedAt,
});

export class GamificationService {
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const [earnedBadges, allBadges, dailyChallenge, dailyCompletions] = await Promise.all([
      userBadgeRepository.findByUser(userId),
      badgeRepository.findAllActive(),
      this.getDailyChallengeStatus(userId),
      dailyChallengeRepository.countCompletionsForUser(userId),
    ]);

    // `badgeId` can populate to null if the referenced Badge was deleted/reseeded
    // after this UserBadge record was created (a dangling reference) — skip those
    // rather than crashing the whole profile fetch over stale join data.
    const earnedMap = new Map(
      earnedBadges
        .filter((entry) => entry.badgeId)
        .map((entry) => [entry.badgeId._id.toString(), entry.earnedAt])
    );

    const badges = allBadges.map((badge) =>
      formatBadge(badge, earnedMap.get(badge._id.toString()) ?? null)
    );

    return {
      gamification: {
        xp: user.gamification?.xp ?? 0,
        level: user.gamification?.level ?? 0,
        coins: user.gamification?.coins ?? 0,
        streak: {
          current: user.gamification?.streak?.current ?? 0,
          longest: user.gamification?.streak?.longest ?? 0,
          lastActivityDate: user.gamification?.streak?.lastActivityDate ?? null,
        },
      },
      levelProgress: levelProgress(user.gamification?.xp ?? 0),
      stats: user.stats ?? {},
      badges: {
        earned: badges.filter((badge) => badge.earned),
        available: badges,
        earnedCount: earnedBadges.length,
        totalCount: allBadges.length,
      },
      dailyChallenge,
      dailyChallengesCompleted: dailyCompletions,
    };
  }

  async getDailyChallengeStatus(userId) {
    const challenge = await dailyChallengeRepository.findByDate();
    if (!challenge) return null;

    const completion = await dailyChallengeRepository.findCompletion(userId, challenge._id);

    return {
      id: challenge._id.toString(),
      type: challenge.type,
      description: challenge.description,
      xpReward: challenge.xpReward,
      target: challenge.target,
      completed: Boolean(completion),
      completedAt: completion?.completedAt ?? null,
    };
  }

  async recordLogin(userId) {
    return this.processActivity(userId, { activityType: 'login' });
  }

  async checkLeaderboardBadges(userId, rank) {
    if (!rank || rank <= 0) {
      return { newBadges: [] };
    }

    const result = await this.evaluateAndAwardBadges(userId, { leaderboardRank: rank });
    return { newBadges: result.newBadges };
  }

  async processActivity(userId, { activityType, meta = {} } = {}) {
    const user = await User.findById(userId).exec();
    if (!user) return this.emptyResult();

    const streakUpdate = this.updateStreak(user);
    let xpBonus = 0;
    let coinsEarned = this.getActivityCoins(activityType, meta);

    if (streakUpdate.isNewDay && activityType === 'login') {
      xpBonus += XP_REWARDS.DAILY_LOGIN;
      coinsEarned += COIN_REWARDS.DAILY_LOGIN;
    }

    await user.save();

    if (coinsEarned > 0) {
      await userRepository.addCoins(userId, coinsEarned);
    }

    if (xpBonus > 0) {
      await userRepository.addXP(userId, xpBonus);
    }

    const challengeResult = await this.tryCompleteDailyChallenge(userId, activityType);
    xpBonus += challengeResult.xpAwarded;
    coinsEarned += challengeResult.coinsEarned;

    const badgeResult = await this.evaluateAndAwardBadges(userId, meta);
    xpBonus += badgeResult.xpFromBadges;
    coinsEarned += badgeResult.coinsFromBadges;

    const updatedUser = await userRepository.findById(userId);

    return {
      gamification: updatedUser?.gamification ?? null,
      stats: updatedUser?.stats ?? null,
      xpBonus,
      coinsEarned,
      newBadges: badgeResult.newBadges,
      dailyChallengeCompleted: challengeResult.completed,
      streak: updatedUser?.gamification?.streak ?? null,
    };
  }

  updateStreak(user) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!user.gamification) user.gamification = {};
    if (!user.gamification.streak) user.gamification.streak = {};

    const lastActivity = user.gamification.streak.lastActivityDate
      ? new Date(user.gamification.streak.lastActivityDate)
      : null;

    if (lastActivity) {
      lastActivity.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today - lastActivity) / (24 * 60 * 60 * 1000));

      if (diffDays === 0) {
        return { isNewDay: false };
      }

      if (diffDays === 1) {
        user.gamification.streak.current = (user.gamification.streak.current || 0) + 1;
      } else {
        user.gamification.streak.current = 1;
      }
    } else {
      user.gamification.streak.current = 1;
    }

    user.gamification.streak.lastActivityDate = new Date();
    user.gamification.streak.longest = Math.max(
      user.gamification.streak.longest || 0,
      user.gamification.streak.current
    );

    return { isNewDay: true };
  }

  async tryCompleteDailyChallenge(userId, activityType) {
    const challenge = await dailyChallengeRepository.findByDate();
    if (!challenge) {
      return { completed: false, xpAwarded: 0, coinsEarned: 0 };
    }

    const existing = await dailyChallengeRepository.findCompletion(userId, challenge._id);
    if (existing) {
      return { completed: false, xpAwarded: 0, coinsEarned: 0 };
    }

    const matches =
      ACTIVITY_TO_CHALLENGE[activityType] === challenge.type ||
      (challenge.type === 'streak' && STREAK_ACTIVITIES.has(activityType));

    if (!matches) {
      return { completed: false, xpAwarded: 0, coinsEarned: 0 };
    }

    const completion = await dailyChallengeRepository.recordCompletion(
      userId,
      challenge._id,
      challenge.xpReward
    );

    if (!completion) {
      return { completed: false, xpAwarded: 0, coinsEarned: 0 };
    }

    const xpAwarded = challenge.xpReward ?? XP_REWARDS.DAILY_CHALLENGE;
    const coinsEarned = COIN_REWARDS.DAILY_CHALLENGE;

    await userRepository.addXPAndCoins(userId, xpAwarded, coinsEarned);

    return { completed: true, xpAwarded, coinsEarned };
  }

  async evaluateAndAwardBadges(userId, meta = {}) {
    const [user, earnedBadges, allBadges, metrics] = await Promise.all([
      userRepository.findById(userId),
      userBadgeRepository.findByUser(userId),
      badgeRepository.findAllActive(),
      this.gatherMetrics(userId, meta),
    ]);

    if (!user) {
      return { newBadges: [], xpFromBadges: 0, coinsFromBadges: 0 };
    }

    // Same dangling-reference guard as getProfile() above — a badge earned before
    // a reseed/deletion of the Badge catalog leaves a UserBadge row whose populated
    // `badgeId` is null; that's stale data, not a reason to crash every login.
    const earnedIds = new Set(
      earnedBadges.filter((entry) => entry.badgeId).map((entry) => entry.badgeId._id.toString())
    );
    const newBadges = [];
    let xpFromBadges = 0;
    let coinsFromBadges = 0;

    for (const badge of allBadges) {
      if (earnedIds.has(badge._id.toString())) continue;

      const value = metrics[badge.criteria.type] ?? 0;
      const meetsCriteria =
        badge.criteria.type === 'leaderboard_rank'
          ? value > 0 && value <= badge.criteria.threshold
          : value >= badge.criteria.threshold;

      if (!meetsCriteria) continue;

      const awarded = await userBadgeRepository.awardBadge(userId, badge._id);
      if (!awarded) continue;

      const bonusXp = badge.xpBonus ?? 0;
      const bonusCoins = Math.floor(bonusXp / COIN_REWARDS.BADGE_DIVISOR);

      if (bonusXp > 0) {
        await userRepository.addXPAndCoins(userId, bonusXp, bonusCoins);
        xpFromBadges += bonusXp;
        coinsFromBadges += bonusCoins;
      }

      newBadges.push(formatBadge(badge, awarded.earnedAt ?? new Date()));
      await notificationService.notifyAchievement(userId, formatBadge(badge, awarded.earnedAt ?? new Date()));
    }

    return { newBadges, xpFromBadges, coinsFromBadges };
  }

  async gatherMetrics(userId, meta = {}) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const user = await userRepository.findById(userId);

    const [notesCount, aiMessages, dailyChallenges, difficultyCounts, contestsJoined, contestWins] =
      await Promise.all([
      Note.countDocuments({ userId, isDeleted: false }),
      AITutorConversation.aggregate([
        { $match: { userId: userObjectId } },
        { $unwind: '$messages' },
        { $match: { 'messages.role': 'user' } },
        { $count: 'total' },
      ]),
      dailyChallengeRepository.countCompletionsForUser(userId),
      Submission.aggregate([
        {
          $match: {
            userId: userObjectId,
            type: 'problem',
            verdict: 'accepted',
          },
        },
        {
          $lookup: {
            from: 'problems',
            localField: 'problemId',
            foreignField: '_id',
            as: 'problem',
          },
        },
        { $unwind: '$problem' },
        { $group: { _id: '$problem.difficulty', count: { $sum: 1 } } },
      ]),
      contestParticipantRepository.countByUser(userId),
      contestParticipantRepository.countWinsByUser(userId),
    ]);

    const byDifficulty = Object.fromEntries(
      difficultyCounts.map((row) => [row._id, row.count])
    );

    const loginCount = user?.lastLoginAt ? 1 : 0;

    return {
      login: loginCount,
      topics_completed: user?.stats?.topicsCompleted ?? 0,
      problems_solved: user?.stats?.problemsSolved ?? 0,
      quizzes_passed: user?.stats?.quizzesPassed ?? 0,
      streak: user?.gamification?.streak?.current ?? 0,
      level: user?.gamification?.level ?? 0,
      total_xp: user?.gamification?.xp ?? 0,
      notes_created: notesCount,
      ai_messages: aiMessages[0]?.total ?? 0,
      daily_challenges: dailyChallenges,
      easy_solved: byDifficulty.easy ?? 0,
      medium_solved: byDifficulty.medium ?? 0,
      hard_solved: byDifficulty.hard ?? 0,
      visualizer_sessions: meta.visualizerSessions ?? 0,
      contests_joined: contestsJoined,
      contest_wins: contestWins,
      leaderboard_rank: meta.leaderboardRank ?? 9999,
    };
  }

  getActivityCoins(activityType, meta = {}) {
    switch (activityType) {
      case 'topic_complete':
        return COIN_REWARDS.TOPIC_COMPLETE;
      case 'quiz_passed':
        return COIN_REWARDS.QUIZ_PASS;
      case 'problem_solved': {
        const difficulty = String(meta.difficulty || 'easy').toLowerCase();
        if (difficulty === 'hard') return COIN_REWARDS.PROBLEM_HARD;
        if (difficulty === 'medium') return COIN_REWARDS.PROBLEM_MEDIUM;
        return COIN_REWARDS.PROBLEM_EASY;
      }
      default:
        return 0;
    }
  }

  emptyResult() {
    return {
      gamification: null,
      stats: null,
      xpBonus: 0,
      coinsEarned: 0,
      newBadges: [],
      dailyChallengeCompleted: false,
      streak: null,
    };
  }
}

export default new GamificationService();
