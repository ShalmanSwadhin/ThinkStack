import mongoose from 'mongoose';
import { XP_REWARDS, COIN_REWARDS } from 'shared/constants';

const rankSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    minXp: { type: Number, required: true, min: 0 },
    icon: { type: String, default: '🏆' },
  },
  { _id: false }
);

const levelSchema = new mongoose.Schema(
  {
    level: { type: Number, required: true, min: 1 },
    xpRequired: { type: Number, required: true, min: 0 },
    title: { type: String, required: true },
  },
  { _id: false }
);

const platformSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'global' },
    xpRules: {
      topicComplete: { type: Number, default: XP_REWARDS.TOPIC_COMPLETE },
      quizPass: { type: Number, default: XP_REWARDS.QUIZ_PASS },
      problemEasy: { type: Number, default: XP_REWARDS.PROBLEM_EASY },
      problemMedium: { type: Number, default: XP_REWARDS.PROBLEM_MEDIUM },
      problemHard: { type: Number, default: XP_REWARDS.PROBLEM_HARD },
      dailyChallenge: { type: Number, default: XP_REWARDS.DAILY_CHALLENGE },
      dailyLogin: { type: Number, default: XP_REWARDS.DAILY_LOGIN },
    },
    coinRules: {
      topicComplete: { type: Number, default: COIN_REWARDS.TOPIC_COMPLETE },
      quizPass: { type: Number, default: COIN_REWARDS.QUIZ_PASS },
      problemEasy: { type: Number, default: COIN_REWARDS.PROBLEM_EASY },
      problemMedium: { type: Number, default: COIN_REWARDS.PROBLEM_MEDIUM },
      problemHard: { type: Number, default: COIN_REWARDS.PROBLEM_HARD },
      dailyChallenge: { type: Number, default: COIN_REWARDS.DAILY_CHALLENGE },
      dailyLogin: { type: Number, default: COIN_REWARDS.DAILY_LOGIN },
    },
    ranks: [rankSchema],
    levels: [levelSchema],
    leaderboardSettings: {
      defaultPeriod: { type: String, enum: ['weekly', 'monthly', 'all-time'], default: 'all-time' },
      showCoins: { type: Boolean, default: true },
      showStreak: { type: Boolean, default: true },
      minXpToAppear: { type: Number, default: 0 },
    },
    notificationDefaults: {
      achievements: { type: Boolean, default: true },
      contests: { type: Boolean, default: true },
      announcements: { type: Boolean, default: true },
      streaks: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

const PlatformSettings = mongoose.model('PlatformSettings', platformSettingsSchema);

export default PlatformSettings;
