import mongoose from 'mongoose';

const dailyChallengeSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true, unique: true },
    type: {
      type: String,
      enum: ['problem', 'quiz', 'topic', 'streak', 'tracing', 'visualizer', 'interview'],
      required: true,
    },
    target: { type: mongoose.Schema.Types.Mixed, required: true },
    xpReward: { type: Number, default: 20, min: 0 },
    description: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

dailyChallengeSchema.index({ isActive: 1, date: -1 });

const DailyChallenge = mongoose.model('DailyChallenge', dailyChallengeSchema);

export default DailyChallenge;
