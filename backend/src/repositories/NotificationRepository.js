import { BaseRepository } from './BaseRepository.js';
import { Notification } from '../models/index.js';

export class NotificationRepository extends BaseRepository {
  constructor() {
    super(Notification);
  }

  async findByUser(userId, filter = {}, options = {}) {
    return this.find(
      { userId, ...filter },
      { sort: { createdAt: -1 }, ...options }
    );
  }

  async countUnread(userId) {
    return this.count({ userId, read: false });
  }

  async findByIdForUser(id, userId, options = {}) {
    return this.findOne({ _id: id, userId }, options);
  }

  async markAsRead(id, userId) {
    return this.model
      .findOneAndUpdate({ _id: id, userId }, { read: true }, { new: true })
      .lean()
      .exec();
  }

  async markAsUnread(id, userId) {
    return this.model
      .findOneAndUpdate({ _id: id, userId }, { read: false }, { new: true })
      .lean()
      .exec();
  }

  async markAllAsRead(userId) {
    const result = await this.model
      .updateMany({ userId, read: false }, { read: true })
      .exec();
    return result.modifiedCount ?? 0;
  }

  async deleteAllForUser(userId) {
    const result = await this.model.deleteMany({ userId }).exec();
    return result.deletedCount ?? 0;
  }

  async insertMany(docs) {
    if (!docs.length) return [];
    return Notification.insertMany(docs, { ordered: false });
  }

  async hasStreakReminderToday(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.exists({
      userId,
      type: 'streak',
      createdAt: { $gte: today },
    });
  }
}

export default new NotificationRepository();
