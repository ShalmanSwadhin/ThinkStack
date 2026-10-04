import mongoose from 'mongoose';
import { ROLES } from 'shared/constants';
import { calculateLevel } from '../utils/gamification.js';

const profileSchema = new mongoose.Schema(
  {
    displayName: { type: String, trim: true, maxlength: 100 },
    avatar: { type: String },
    bio: { type: String, maxlength: 500 },
    github: { type: String, trim: true },
    linkedin: { type: String, trim: true },
  },
  { _id: false }
);

const streakSchema = new mongoose.Schema(
  {
    current: { type: Number, default: 0, min: 0 },
    longest: { type: Number, default: 0, min: 0 },
    lastActivityDate: { type: Date },
  },
  { _id: false }
);

const gamificationSchema = new mongoose.Schema(
  {
    xp: { type: Number, default: 0, min: 0 },
    level: { type: Number, default: 0, min: 0 },
    coins: { type: Number, default: 0, min: 0 },
    streak: { type: streakSchema, default: () => ({}) },
  },
  { _id: false }
);

const statsSchema = new mongoose.Schema(
  {
    problemsSolved: { type: Number, default: 0, min: 0 },
    topicsCompleted: { type: Number, default: 0, min: 0 },
    quizzesPassed: { type: Number, default: 0, min: 0 },
    totalSubmissions: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const preferencesSchema = new mongoose.Schema(
  {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    editorFontSize: { type: Number, default: 14, min: 10, max: 24 },
    editorTabSize: { type: Number, default: 4, min: 2, max: 8 },
    emailNotifications: { type: Boolean, default: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.STUDENT },
    profile: { type: profileSchema, default: () => ({}) },
    gamification: { type: gamificationSchema, default: () => ({}) },
    stats: { type: statsSchema, default: () => ({}) },
    preferences: { type: preferencesSchema, default: () => ({}) },
    isGuest: { type: Boolean, default: false },
    guestKeyHash: { type: String, select: false },
    isActive: { type: Boolean, default: true },
    isSuspended: { type: Boolean, default: false },
    loginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre('save', function syncLevel(next) {
  if (this.isModified('gamification.xp') || this.isNew) {
    this.gamification.level = calculateLevel(this.gamification?.xp ?? 0);
  }
  next();
});

userSchema.index({ 'gamification.xp': -1 });
userSchema.index({ role: 1 });
userSchema.index({ guestKeyHash: 1 }, { unique: true, sparse: true });

userSchema.methods.toPublicJSON = function toPublicJSON() {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

const User = mongoose.model('User', userSchema);

export default User;
