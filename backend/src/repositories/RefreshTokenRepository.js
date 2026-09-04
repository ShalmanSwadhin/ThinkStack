import { BaseRepository } from './BaseRepository.js';
import { RefreshToken } from '../models/index.js';

export class RefreshTokenRepository extends BaseRepository {
  constructor() {
    super(RefreshToken);
  }

  async createToken({ userId, tokenHash, expiresAt, userAgent, ipAddress }) {
    return RefreshToken.create({ userId, tokenHash, expiresAt, userAgent, ipAddress });
  }

  async findByTokenHash(tokenHash) {
    return RefreshToken.findOne({ tokenHash, expiresAt: { $gt: new Date() } }).exec();
  }

  async revokeToken(tokenHash) {
    return RefreshToken.deleteOne({ tokenHash }).exec();
  }

  async revokeAllForUser(userId) {
    return RefreshToken.deleteMany({ userId }).exec();
  }
}

export default new RefreshTokenRepository();
