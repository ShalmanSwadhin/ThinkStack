import { BaseRepository } from './BaseRepository.js';
import { User } from '../models/index.js';
import { calculateLevel } from '../utils/gamification.js';

export class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email, includePassword = false) {
    let query = User.findOne({ email: email.toLowerCase() });
    if (includePassword) {
      query = query.select('+passwordHash');
    }
    return query.exec();
  }

  async findByUsername(username) {
    return User.findOne({ username: username.toLowerCase() }).lean().exec();
  }

  async findLeaderboard(limit = 100) {
    return User.find({ isActive: true, isSuspended: false })
      .sort({ 'gamification.xp': -1 })
      .limit(limit)
      .select('username profile.displayName profile.avatar gamification.xp gamification.level stats.problemsSolved')
      .lean()
      .exec();
  }

  async addXP(userId, amount) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { 'gamification.xp': amount } },
      { new: true, runValidators: true }
    ).exec();

    if (!user) return null;

    const level = calculateLevel(user.gamification.xp);
    return User.findByIdAndUpdate(
      userId,
      { 'gamification.level': level },
      { new: true, runValidators: true }
    )
      .lean()
      .exec();
  }

  async incrementStat(userId, statField, amount = 1) {
    return User.findByIdAndUpdate(
      userId,
      { $inc: { [`stats.${statField}`]: amount } },
      { new: true }
    )
      .lean()
      .exec();
  }

  async addCoins(userId, amount) {
    if (!amount || amount <= 0) return null;
    return User.findByIdAndUpdate(
      userId,
      { $inc: { 'gamification.coins': amount } },
      { new: true, runValidators: true }
    )
      .lean()
      .exec();
  }

  async addXPAndCoins(userId, xpAmount, coinAmount) {
    const user = await this.addXP(userId, xpAmount);
    if (!user) return null;
    if (coinAmount > 0) {
      return User.findByIdAndUpdate(
        userId,
        { $inc: { 'gamification.coins': coinAmount } },
        { new: true, runValidators: true }
      )
        .lean()
        .exec();
    }
    return user;
  }
}

export default new UserRepository();
