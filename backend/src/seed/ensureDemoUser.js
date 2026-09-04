import bcrypt from 'bcryptjs';
import { ROLES } from 'shared/constants';
import { User } from '../models/index.js';
import env from '../config/env.js';
import logger from '../utils/logger.js';

const BCRYPT_ROUNDS = 12;

const DEMO_EMAIL = env.demo?.email || 'student@thinkstack.dev';
const DEMO_USERNAME = env.demo?.username || 'student';
const DEMO_PASSWORD = env.demo?.password || 'Student123!';

/**
 * Ensures a demo student account exists for local development login.
 */
export async function ensureDemoUser() {
  if (env.isProduction) {
    return null;
  }

  const email = DEMO_EMAIL.toLowerCase();
  const username = DEMO_USERNAME.toLowerCase();

  let user = await User.findOne({ email }).select('+passwordHash').exec();

  if (!user) {
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, BCRYPT_ROUNDS);
    user = await User.create({
      username,
      email,
      passwordHash,
      role: ROLES.STUDENT,
      profile: { displayName: 'Demo Student' },
      isActive: true,
    });
    logger.info(`Demo user created: ${email}`);
    return user;
  }

  const passwordMatches = await bcrypt.compare(DEMO_PASSWORD, user.passwordHash);
  if (!passwordMatches) {
    user.passwordHash = await bcrypt.hash(DEMO_PASSWORD, BCRYPT_ROUNDS);
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();
    logger.info(`Demo user password synchronized for ${email}`);
  }

  return user;
}

export default ensureDemoUser;
