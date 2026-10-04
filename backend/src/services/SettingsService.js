import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import userRepository from '../repositories/UserRepository.js';
import refreshTokenRepository from '../repositories/RefreshTokenRepository.js';
import { User, Note, Notification } from '../models/index.js';
import AppError from '../utils/AppError.js';

const BCRYPT_ROUNDS = 12;

const validatePasswordStrength = (password) => {
  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters', 400);
  }
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    throw new AppError('Password must contain uppercase, lowercase, and a number', 400);
  }
};

const formatSettings = (user) => ({
  profile: {
    displayName: user.profile?.displayName ?? '',
    bio: user.profile?.bio ?? '',
    github: user.profile?.github ?? '',
    linkedin: user.profile?.linkedin ?? '',
    avatar: user.profile?.avatar ?? null,
  },
  preferences: {
    theme: user.preferences?.theme ?? 'system',
    editorFontSize: user.preferences?.editorFontSize ?? 14,
    editorTabSize: user.preferences?.editorTabSize ?? 4,
    emailNotifications: user.preferences?.emailNotifications ?? true,
  },
  account: {
    username: user.username,
    email: user.isGuest ? null : user.email,
    isGuest: Boolean(user.isGuest),
    role: user.role,
    createdAt: user.createdAt,
  },
});

export class SettingsService {
  async getSettings(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return formatSettings(user);
  }

  async updatePreferences(userId, updates) {
    const user = await User.findById(userId).exec();
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.preferences) user.preferences = {};

    if (updates.theme != null) {
      user.preferences.theme = updates.theme;
    }
    if (updates.editorFontSize != null) {
      user.preferences.editorFontSize = updates.editorFontSize;
    }
    if (updates.editorTabSize != null) {
      user.preferences.editorTabSize = updates.editorTabSize;
    }
    if (updates.emailNotifications != null) {
      user.preferences.emailNotifications = updates.emailNotifications;
    }

    await user.save();
    return formatSettings(user);
  }

  async updateProfile(userId, updates) {
    const user = await User.findById(userId).exec();
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.profile) user.profile = {};

    if (updates.displayName != null) {
      user.profile.displayName = updates.displayName.trim();
    }
    if (updates.bio != null) {
      user.profile.bio = updates.bio;
    }
    if (updates.github != null) {
      user.profile.github = updates.github.trim();
    }
    if (updates.linkedin != null) {
      user.profile.linkedin = updates.linkedin.trim();
    }

    await user.save();
    return formatSettings(user);
  }

  async changePassword(userId, { currentPassword, newPassword }) {
    validatePasswordStrength(newPassword);

    const user = await User.findById(userId).select('+passwordHash').exec();
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 400);
    }

    user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await user.save();
    await refreshTokenRepository.revokeAllForUser(userId);

    return { message: 'Password updated successfully' };
  }

  async deleteAccount(userId, { password, confirmation }) {
    if (confirmation !== 'DELETE') {
      throw new AppError('Type DELETE to confirm account deletion', 400);
    }

    const user = await User.findById(userId).select('+passwordHash').exec();
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role === 'admin') {
      throw new AppError('Admin accounts cannot be deleted via self-service', 403);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Password is incorrect', 400);
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const deletedSuffix = user._id.toString().slice(-8);

    await Promise.all([
      Note.updateMany({ userId: userObjectId }, { isDeleted: true }),
      Notification.deleteMany({ userId: userObjectId }),
      refreshTokenRepository.revokeAllForUser(userId),
    ]);

    user.username = `deleted_${deletedSuffix}`;
    user.email = `deleted.${deletedSuffix}@deleted.thinkstack.local`;
    user.passwordHash = await bcrypt.hash(cryptoRandom(), BCRYPT_ROUNDS);
    user.isActive = false;
    user.profile = {};
    user.preferences = {
      theme: 'system',
      editorFontSize: 14,
      editorTabSize: 4,
      emailNotifications: false,
    };

    await user.save();

    return { message: 'Account deleted successfully' };
  }
}

function cryptoRandom() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default new SettingsService();
