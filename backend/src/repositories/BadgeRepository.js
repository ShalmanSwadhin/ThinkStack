import { BaseRepository } from './BaseRepository.js';
import { Badge, UserBadge } from '../models/index.js';

export class BadgeRepository extends BaseRepository {
  constructor() {
    super(Badge);
  }

  async findBySlug(slug) {
    return this.findOne({ slug: slug.toLowerCase(), isActive: true });
  }

  async findAllActive() {
    return Badge.find({ isActive: true }).sort({ name: 1 }).lean().exec();
  }
}

export class UserBadgeRepository extends BaseRepository {
  constructor() {
    super(UserBadge);
  }

  async findByUser(userId) {
    return UserBadge.find({ userId })
      .populate('badgeId')
      .sort({ earnedAt: -1 })
      .lean()
      .exec();
  }

  async hasBadge(userId, badgeId) {
    return UserBadge.exists({ userId, badgeId });
  }

  async awardBadge(userId, badgeId) {
    try {
      return await UserBadge.create({ userId, badgeId });
    } catch (error) {
      if (error.code === 11000) return null;
      throw error;
    }
  }
}

export const badgeRepository = new BadgeRepository();
export const userBadgeRepository = new UserBadgeRepository();

export default badgeRepository;
