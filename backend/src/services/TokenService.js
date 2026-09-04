import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import env from '../config/env.js';

export class TokenService {
  generateAccessToken(user) {
    return jwt.sign(
      { sub: user._id.toString(), role: user.role, type: 'access' },
      env.jwt.accessSecret,
      { expiresIn: env.jwt.accessExpiresIn }
    );
  }

  verifyAccessToken(token) {
    const payload = jwt.verify(token, env.jwt.accessSecret);
    if (payload.type !== 'access') {
      throw new Error('Invalid token type');
    }
    return payload;
  }

  generateRefreshToken(user) {
    const jti = crypto.randomBytes(16).toString('hex');
    return jwt.sign(
      { sub: user._id.toString(), role: user.role, type: 'refresh', jti },
      env.jwt.refreshSecret,
      { expiresIn: env.jwt.refreshExpiresIn }
    );
  }

  verifyRefreshToken(token) {
    const payload = jwt.verify(token, env.jwt.refreshSecret);
    if (payload.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    return payload;
  }

  /** @deprecated Use generateRefreshToken — kept for tests referencing opaque tokens */
  generateRefreshTokenValue() {
    return crypto.randomBytes(40).toString('hex');
  }

  hashToken(token) {
    return crypto.createHmac('sha256', env.jwt.refreshSecret).update(token).digest('hex');
  }

  getRefreshTokenExpiry() {
    const expiresIn = env.jwt.refreshExpiresIn;
    const match = expiresIn.match(/^(\d+)([dhms])$/);
    if (!match) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers = { d: 86400000, h: 3600000, m: 60000, s: 1000 };
    return new Date(Date.now() + value * multipliers[unit]);
  }

  generatePasswordResetToken() {
    const token = crypto.randomBytes(32).toString('hex');
    const hash = this.hashToken(token);
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    return { token, hash, expires };
  }
}

export default new TokenService();
