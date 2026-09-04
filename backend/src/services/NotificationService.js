import mongoose from 'mongoose';
import notificationRepository from '../repositories/NotificationRepository.js';
import userRepository from '../repositories/UserRepository.js';
import AppError from '../utils/AppError.js';

const TYPE_ICONS = {
  achievement: '🏆',
  contest: '🏁',
  announcement: '📢',
  streak: '🔥',
  system: 'ℹ️',
};

const formatNotification = (notification) => ({
  id: notification._id.toString(),
  type: notification.type,
  title: notification.title,
  message: notification.message,
  read: notification.read ?? false,
  data: notification.data ?? {},
  createdAt: notification.createdAt,
});

export class NotificationService {
  async listNotifications(userId, query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 20;
    const filter = {};

    if (query.type) {
      filter.type = query.type;
    }

    if (query.unread === 'true') {
      filter.read = false;
    }

    const { data, meta } = await notificationRepository.findByUser(userId, filter, {
      page,
      limit,
    });

    const unreadCount = await notificationRepository.countUnread(userId);

    return {
      notifications: data.map(formatNotification),
      unreadCount,
      meta,
    };
  }

  async getUnreadCount(userId) {
    await this.maybeSendStreakReminder(userId);
    const count = await notificationRepository.countUnread(userId);
    return { unreadCount: count };
  }

  async markAsRead(userId, id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid notification ID', 400);
    }

    const notification = await notificationRepository.markAsRead(id, userId);
    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    return formatNotification(notification);
  }

  async markAsUnread(userId, id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid notification ID', 400);
    }

    const notification = await notificationRepository.markAsUnread(id, userId);
    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    return formatNotification(notification);
  }

  async markAllAsRead(userId) {
    const updated = await notificationRepository.markAllAsRead(userId);
    return { updated };
  }

  async clearAll(userId) {
    const deleted = await notificationRepository.deleteAllForUser(userId);
    return { deleted };
  }

  async createNotification({ userId, type, title, message, data = {} }) {
    const notification = await notificationRepository.create({
      userId,
      type,
      title,
      message,
      data,
      read: false,
    });
    return formatNotification(notification);
  }

  async notifyAchievement(userId, badge) {
    return this.createNotification({
      userId,
      type: 'achievement',
      title: `${TYPE_ICONS.achievement} Badge unlocked: ${badge.name}`,
      message: badge.description ?? 'You earned a new badge!',
      data: {
        badgeId: badge.id ?? badge._id?.toString(),
        badgeSlug: badge.slug,
        icon: badge.icon,
      },
    });
  }

  async notifyContestRegistration(userId, contest) {
    return this.createNotification({
      userId,
      type: 'contest',
      title: `${TYPE_ICONS.contest} Registered for ${contest.title}`,
      message: `You're registered for "${contest.title}". Good luck!`,
      data: {
        contestId: contest._id?.toString() ?? contest.id,
        contestSlug: contest.slug,
        event: 'registered',
      },
    });
  }

  async notifyContestStarted(userId, contest) {
    return this.createNotification({
      userId,
      type: 'contest',
      title: `${TYPE_ICONS.contest} ${contest.title} is live`,
      message: `"${contest.title}" has started. Join now and climb the leaderboard!`,
      data: {
        contestId: contest._id?.toString() ?? contest.id,
        contestSlug: contest.slug,
        event: 'started',
      },
    });
  }

  async notifyContestResult(userId, contest, { rank, score }) {
    const title =
      rank === 1
        ? `${TYPE_ICONS.contest} You won ${contest.title}!`
        : `${TYPE_ICONS.contest} ${contest.title} results are in`;

    const message =
      rank === 1
        ? `Congratulations! You ranked #1 with ${score} points.`
        : `The contest has ended. You finished at rank #${rank} with ${score} points.`;

    return this.createNotification({
      userId,
      type: 'contest',
      title,
      message,
      data: {
        contestId: contest._id?.toString() ?? contest.id,
        contestSlug: contest.slug,
        event: 'completed',
        rank,
        score,
      },
    });
  }

  async notifyAnnouncements(announcement, userIds) {
    if (!userIds.length) return 0;

    const message =
      announcement.content.length > 240
        ? `${announcement.content.slice(0, 237)}...`
        : announcement.content;

    const docs = userIds.map((userId) => ({
      userId,
      type: 'announcement',
      title: announcement.title,
      message,
      data: { announcementId: announcement._id.toString() },
      read: false,
    }));

    await notificationRepository.insertMany(docs);
    return docs.length;
  }

  async maybeSendStreakReminder(userId) {
    const user = await userRepository.findById(userId);
    const streak = user?.gamification?.streak?.current ?? 0;
    if (streak < 1) return null;

    const lastActivity = user.gamification?.streak?.lastActivityDate
      ? new Date(user.gamification.streak.lastActivityDate)
      : null;
    if (!lastActivity) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastActivity.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((today - lastActivity) / (24 * 60 * 60 * 1000));
    if (diffDays !== 1) return null;

    const alreadySent = await notificationRepository.hasStreakReminderToday(userId);
    if (alreadySent) return null;

    return this.createNotification({
      userId,
      type: 'streak',
      title: `${TYPE_ICONS.streak} Keep your ${streak}-day streak alive`,
      message: `You haven't studied today yet. Complete any activity to extend your ${streak}-day streak.`,
      data: { streak, event: 'reminder' },
    });
  }
}

export default new NotificationService();
