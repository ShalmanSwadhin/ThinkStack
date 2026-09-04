import bcrypt from 'bcryptjs';
import { ROLES } from 'shared/constants';
import { User } from '../models/index.js';
import env from '../config/env.js';
import logger from '../utils/logger.js';

const BCRYPT_ROUNDS = 12;

/**
 * Ensures the admin account exists and matches ADMIN_* environment variables.
 * Called automatically during database bootstrap on every server startup.
 * Creates the admin if missing; updates password/role if credentials drift.
 */
export async function ensureAdmin() {
  const email = env.admin.email.toLowerCase();
  const username = env.admin.username.toLowerCase();
  const password = env.admin.password;

  let admin = await User.findOne({ email }).select('+passwordHash').exec();

  if (!admin) {
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    admin = await User.create({
      username,
      email,
      passwordHash,
      role: ROLES.ADMIN,
      profile: { displayName: 'ThinkStack Admin' },
      isActive: true,
    });
    logger.info(`Admin user created: ${email}`);
    return admin;
  }

  let updated = false;

  if (admin.role !== ROLES.ADMIN) {
    admin.role = ROLES.ADMIN;
    updated = true;
  }

  if (!admin.isActive) {
    admin.isActive = true;
    updated = true;
  }

  const passwordMatches = await bcrypt.compare(password, admin.passwordHash);
  if (!passwordMatches) {
    admin.passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    admin.loginAttempts = 0;
    admin.lockUntil = undefined;
    updated = true;
    logger.info(`Admin password synchronized from environment for ${email}`);
  }

  if (updated) {
    await admin.save();
  }

  return admin;
}

export default ensureAdmin;
