import { PAGINATION } from 'shared/constants';
import leaderboardRepository, {
  formatLeaderboardEntry,
} from '../repositories/LeaderboardRepository.js';
import userRepository from '../repositories/UserRepository.js';
import gamificationService from './GamificationService.js';
import AppError from '../utils/AppError.js';

const VALID_PERIODS = new Set(['global', 'weekly']);

const formatLocalDate = (date) => {
  const value = new Date(date);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export class LeaderboardService {
  normalizeLimit(limit) {
    const parsed = Number.parseInt(limit, 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      return PAGINATION.MAX_LIMIT;
    }
    return Math.min(parsed, PAGINATION.MAX_LIMIT);
  }

  normalizePeriod(period) {
    const value = String(period || 'global').toLowerCase();
    if (!VALID_PERIODS.has(value)) {
      throw new AppError('Invalid period. Use global or weekly.', 400);
    }
    return value;
  }

  async getLeaderboard(userId, { period = 'global', limit = PAGINATION.MAX_LIMIT } = {}) {
    const normalizedPeriod = this.normalizePeriod(period);
    const normalizedLimit = this.normalizeLimit(limit);

    if (normalizedPeriod === 'weekly') {
      return this.getWeeklyLeaderboard(userId, normalizedLimit);
    }

    return this.getGlobalLeaderboard(userId, normalizedLimit);
  }

  async getGlobalLeaderboard(userId, limit) {
    const [users, rank] = await Promise.all([
      leaderboardRepository.findGlobalLeaderboard(limit),
      leaderboardRepository.getGlobalRank(userId),
    ]);

    const rawEntries = users.map((user) => ({
      user,
      xp: user.gamification?.xp ?? 0,
    }));

    const ranked = this.assignEntryRanks(rawEntries);
    const entries = ranked.map(({ user, rank, xp }) => {
      const entry = formatLeaderboardEntry(user, rank, xp);
      entry.isCurrentUser = entry.userId === userId;
      return entry;
    });

    const currentUserEntry = entries.find((entry) => entry.isCurrentUser);
    const badgeResult = await gamificationService.checkLeaderboardBadges(userId, rank);

    const currentUser = await this.buildCurrentUserSummary(
      userId,
      rank,
      currentUserEntry?.xp ?? (await this.getUserTotalXp(userId)),
      Boolean(currentUserEntry)
    );

    return {
      period: 'global',
      entries,
      currentUser,
      newBadges: badgeResult.newBadges,
    };
  }

  async getWeeklyLeaderboard(userId, limit) {
    const { weekStart, entries: weeklyEntries } =
      await leaderboardRepository.findWeeklyLeaderboard(limit);

    const rankedWeekly = this.assignEntryRanks(
      weeklyEntries.map((entry) => ({ user: entry.user, xp: entry.xp }))
    );
    const entries = rankedWeekly.map(({ user, rank, xp }) => {
      const formatted = formatLeaderboardEntry(user, rank, xp);
      formatted.isCurrentUser = formatted.userId === userId;
      return formatted;
    });

    const { rank, xp: weeklyXp } = await leaderboardRepository.getWeeklyRank(userId, weekStart);
    const currentUserEntry = entries.find((entry) => entry.isCurrentUser);
    const badgeResult = await gamificationService.checkLeaderboardBadges(userId, rank);

    const currentUser = await this.buildCurrentUserSummary(
      userId,
      rank,
      weeklyXp,
      Boolean(currentUserEntry),
      'weeklyXp'
    );

    const now = new Date();

    return {
      period: 'weekly',
      periodStart: formatLocalDate(weekStart),
      periodEnd: formatLocalDate(now),
      entries,
      currentUser,
      newBadges: badgeResult.newBadges,
    };
  }

  async buildCurrentUserSummary(userId, rank, xp, inTopList, xpField = 'xp') {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return {
      userId,
      username: user.username,
      displayName: user.profile?.displayName || user.username,
      avatar: user.profile?.avatar ?? null,
      rank,
      [xpField]: xp,
      totalXp: user.gamification?.xp ?? 0,
      level: user.gamification?.level ?? 0,
      problemsSolved: user.stats?.problemsSolved ?? 0,
      inTopList,
    };
  }

  async getUserTotalXp(userId) {
    const user = await userRepository.findById(userId);
    return user?.gamification?.xp ?? 0;
  }

  assignEntryRanks(entries) {
    let rank = 0;
    let lastXp = null;

    return entries.map((entry, index) => {
      if (entry.xp !== lastXp) {
        rank = index + 1;
        lastXp = entry.xp;
      }
      return { ...entry, rank };
    });
  }
}

export default new LeaderboardService();
