import mongoose from 'mongoose';

const dailyChallengeCompletionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'DailyChallenge', required: true },
    completedAt: { type: Date, default: Date.now },
    xpAwarded: { type: Number, default: 0, min: 0 },
  },
  { timestamps: false }
);

dailyChallengeCompletionSchema.index({ userId: 1, challengeId: 1 }, { unique: true });

const DailyChallengeCompletion = mongoose.model(
  'DailyChallengeCompletion',
  dailyChallengeCompletionSchema
);

export default DailyChallengeCompletion;
