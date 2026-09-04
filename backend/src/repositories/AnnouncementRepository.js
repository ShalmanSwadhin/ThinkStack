import { BaseRepository } from './BaseRepository.js';
import { Announcement } from '../models/index.js';

export class AnnouncementRepository extends BaseRepository {
  constructor() {
    super(Announcement);
  }

  async findActive() {
    const now = new Date();
    return Announcement.find({
      isActive: true,
      startsAt: { $lte: now },
      $or: [{ expiresAt: null }, { expiresAt: { $exists: false } }, { expiresAt: { $gte: now } }],
    })
      .sort({ priority: -1, startsAt: -1 })
      .lean()
      .exec();
  }
}

export default new AnnouncementRepository();
