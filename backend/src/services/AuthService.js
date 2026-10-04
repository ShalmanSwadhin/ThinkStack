import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { ROLES } from 'shared/constants';
import { User } from '../models/index.js';
import userRepository from '../repositories/UserRepository.js';
import refreshTokenRepository from '../repositories/RefreshTokenRepository.js';
import tokenService from './TokenService.js';
import emailService from './EmailService.js';
import gamificationService from './GamificationService.js';
import env from '../config/env.js';
import AppError from '../utils/AppError.js';

const BCRYPT_ROUNDS = 12;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000;

const normalizeEmail = (email) => email.trim().toLowerCase();

const formatUser = (user) => ({
  id: user._id.toString(),
  username: user.username,
  email: user.isGuest ? null : user.email,
  isGuest: Boolean(user.isGuest),
  role: user.role,
  profile: user.profile,
  gamification: user.gamification,
  stats: user.stats,
  preferences: user.preferences,
  createdAt: user.createdAt,
});

const validatePasswordStrength = (password) => {
  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters', 400);
  }
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    throw new AppError('Password must contain uppercase, lowercase, and a number', 400);
  }
};

export class AuthService {
  async register({ username, email, password }) {
    validatePasswordStrength(password);

    const existingEmail = await userRepository.findByEmail(normalizeEmail(email));
    if (existingEmail) {
      throw new AppError('Email already registered', 409);
    }

    const existingUsername = await userRepository.findByUsername(username);
    if (existingUsername) {
      throw new AppError('Username already taken', 409);
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await User.create({
      username: username.toLowerCase(),
      email: normalizeEmail(email),
      passwordHash,
      role: ROLES.STUDENT,
      profile: { displayName: username },
    });

    const tokens = await this.issueTokens(user, {});

    return {
      user: formatUser(user),
      ...tokens,
    };
  }

  async login({ email, password, userAgent, ipAddress }) {
    const user = await User.findOne({ email: normalizeEmail(email) })
      .select('+passwordHash +loginAttempts +lockUntil')
      .exec();

    if (!user || user.isGuest) {
      throw new AppError('Invalid email or password', 401);
    }

    if (user.isSuspended) {
      throw new AppError('Account suspended. Contact support.', 403);
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockUntil - new Date()) / 60000);
      throw new AppError(`Account locked. Try again in ${minutesLeft} minutes.`, 429);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
        user.loginAttempts = 0;
      }
      await user.save();
      throw new AppError('Invalid email or password', 401);
    }

    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLoginAt = new Date();
    await user.save();

    await gamificationService.recordLogin(user._id.toString());
    const refreshedUser = await User.findById(user._id).exec();

    const tokens = await this.issueTokens(refreshedUser, { userAgent, ipAddress });

    return {
      user: formatUser(refreshedUser),
      ...tokens,
    };
  }

  // A guest is a real but anonymous account. Its only credential is `guestKey`, a random
  // secret held by the browser that created it; the server stores just a hash of it.
  async createGuest({ userAgent, ipAddress } = {}) {
    const guestKey = crypto.randomBytes(32).toString('hex');
    const passwordHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 4);

    let user;
    for (let attempt = 0; attempt < 3 && !user; attempt += 1) {
      const candidate = new User({
        username: `guest_${crypto.randomBytes(4).toString('hex')}`,
        passwordHash,
        role: ROLES.STUDENT,
        isGuest: true,
        guestKeyHash: tokenService.hashToken(guestKey),
        profile: { displayName: 'Guest' },
        preferences: { emailNotifications: false },
      });
      candidate.email = `guest.${candidate._id}@guest.thinkstack.local`;

      try {
        user = await candidate.save();
      } catch (error) {
        if (error?.code !== 11000 || attempt === 2) throw error;
      }
    }

    const tokens = await this.issueTokens(user, { userAgent, ipAddress });
    return { user: formatUser(user), guestKey, ...tokens };
  }

  async resumeGuest(guestKey, { userAgent, ipAddress } = {}) {
    const user = await User.findOne({
      guestKeyHash: tokenService.hashToken(String(guestKey)),
      isGuest: true,
    }).exec();

    if (!user || !user.isActive || user.isSuspended) {
      throw new AppError('Guest session not found', 401);
    }

    await gamificationService.recordLogin(user._id.toString());
    const refreshedUser = await User.findById(user._id).exec();
    const tokens = await this.issueTokens(refreshedUser, { userAgent, ipAddress });

    return { user: formatUser(refreshedUser), ...tokens };
  }

  // Turns the signed-in guest into a normal account in place, so everything they did as a
  // guest stays attached to the same user id.
  async upgradeGuest(userId, { username, email, password }) {
    validatePasswordStrength(password);

    const user = await User.findById(userId).select('+passwordHash +guestKeyHash').exec();
    if (!user) {
      throw new AppError('User not found', 404);
    }
    if (!user.isGuest) {
      throw new AppError('Only guest accounts can be upgraded', 400);
    }

    const existingEmail = await userRepository.findByEmail(normalizeEmail(email));
    if (existingEmail) {
      throw new AppError('Email already registered', 409);
    }
    const existingUsername = await userRepository.findByUsername(username);
    if (existingUsername) {
      throw new AppError('Username already taken', 409);
    }

    user.username = username.toLowerCase();
    user.email = normalizeEmail(email);
    user.passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    user.isGuest = false;
    user.guestKeyHash = undefined;
    user.profile.displayName = username;
    user.preferences.emailNotifications = true;
    await user.save();

    return { user: formatUser(user) };
  }

  async issueTokens(user, { userAgent, ipAddress }) {
    const accessToken = tokenService.generateAccessToken(user);
    const refreshToken = tokenService.generateRefreshToken(user);
    const tokenHash = tokenService.hashToken(refreshToken);

    await refreshTokenRepository.createToken({
      userId: user._id,
      tokenHash,
      expiresAt: tokenService.getRefreshTokenExpiry(),
      userAgent,
      ipAddress,
    });

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken, { userAgent, ipAddress }) {
    if (!refreshToken) {
      throw new AppError('Refresh token required', 401);
    }

    try {
      tokenService.verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const tokenHash = tokenService.hashToken(refreshToken);
    const stored = await refreshTokenRepository.findByTokenHash(tokenHash);

    if (!stored) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const user = await User.findById(stored.userId).exec();
    if (!user || !user.isActive || user.isSuspended) {
      await refreshTokenRepository.revokeToken(tokenHash);
      throw new AppError('User account unavailable', 401);
    }

    await refreshTokenRepository.revokeToken(tokenHash);

    const tokens = await this.issueTokens(user, { userAgent, ipAddress });

    return {
      user: formatUser(user),
      ...tokens,
    };
  }

  async logout(refreshToken) {
    if (refreshToken) {
      const tokenHash = tokenService.hashToken(refreshToken);
      await refreshTokenRepository.revokeToken(tokenHash);
    }
    return { success: true };
  }

  async logoutAll(userId) {
    await refreshTokenRepository.revokeAllForUser(userId);
    return { success: true };
  }

  async getMe(userId) {
    const user = await User.findById(userId).exec();
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return formatUser(user);
  }

  async forgotPassword(email) {
    const user = await User.findOne({ email: normalizeEmail(email) })
      .select('+passwordResetToken +passwordResetExpires')
      .exec();

    if (!user || user.isGuest) {
      return { message: 'If that email exists, a reset link has been sent.' };
    }

    const { token, hash, expires } = tokenService.generatePasswordResetToken();
    user.passwordResetToken = hash;
    user.passwordResetExpires = expires;
    await user.save();

    const resetUrl = `${env.frontendUrl}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;
    await emailService.sendPasswordResetEmail(user.email, resetUrl);

    return { message: 'If that email exists, a reset link has been sent.' };
  }

  async resetPassword({ email, token, password }) {
    validatePasswordStrength(password);

    const user = await User.findOne({ email: normalizeEmail(email) })
      .select('+passwordResetToken +passwordResetExpires +passwordHash')
      .exec();

    if (!user || !user.passwordResetToken || !user.passwordResetExpires) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    if (user.passwordResetExpires < new Date()) {
      throw new AppError('Reset token has expired', 400);
    }

    const tokenHash = tokenService.hashToken(token);
    if (tokenHash !== user.passwordResetToken) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    user.passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    await refreshTokenRepository.revokeAllForUser(user._id);

    return { message: 'Password reset successful. Please log in.' };
  }
}

export default new AuthService();
