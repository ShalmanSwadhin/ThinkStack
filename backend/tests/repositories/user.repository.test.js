import bcrypt from 'bcryptjs';
import { connectTestDB, disconnectTestDB, clearTestDB, describeIfDb } from '../helpers/db.js';
import userRepository from '../../src/repositories/UserRepository.js';
import { User } from '../../src/models/index.js';
import { ROLES } from 'shared/constants';

describeIfDb('UserRepository', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  it('creates and finds user by email', async () => {
    const passwordHash = await bcrypt.hash('password123', 12);
    await User.create({
      username: 'testuser',
      email: 'test@example.com',
      passwordHash,
      role: ROLES.STUDENT,
    });

    const user = await userRepository.findByEmail('test@example.com');
    expect(user).toBeTruthy();
    expect(user.email).toBe('test@example.com');
  });

  it('finds user by username', async () => {
    const passwordHash = await bcrypt.hash('password123', 12);
    await User.create({
      username: 'johndoe',
      email: 'john@example.com',
      passwordHash,
    });

    const user = await userRepository.findByUsername('johndoe');
    expect(user.username).toBe('johndoe');
  });

  it('adds XP and recalculates level', async () => {
    const passwordHash = await bcrypt.hash('password123', 12);
    const user = await User.create({
      username: 'xpuser',
      email: 'xp@example.com',
      passwordHash,
      gamification: { xp: 0, level: 0, coins: 0 },
    });

    const updated = await userRepository.addXP(user._id, 400);
    expect(updated.gamification.xp).toBe(400);
    expect(updated.gamification.level).toBe(2);
  });

  it('returns leaderboard sorted by XP', async () => {
    const passwordHash = await bcrypt.hash('password123', 12);
    await User.create({
      username: 'low',
      email: 'low@example.com',
      passwordHash,
      gamification: { xp: 100, level: 1 },
    });
    await User.create({
      username: 'high',
      email: 'high@example.com',
      passwordHash,
      gamification: { xp: 900, level: 3 },
    });

    const board = await userRepository.findLeaderboard(10);
    expect(board[0].username).toBe('high');
    expect(board[1].username).toBe('low');
  });
});
