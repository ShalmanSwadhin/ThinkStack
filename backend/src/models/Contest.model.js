import mongoose from 'mongoose';

const contestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, default: '' },
    thumbnail: { type: String, default: '' },
    banner: { type: String, default: '' },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    durationMinutes: { type: Number, min: 1 },
    problemIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
    rules: { type: String, default: '' },
    scoring: {
      type: {
        pointsPerProblem: { type: Number, default: 100 },
        penaltyMinutes: { type: Number, default: 20 },
        partialScoring: { type: Boolean, default: false },
      },
      default: () => ({}),
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
    timeLimitMinutes: { type: Number, min: 1 },
    leaderboardSettings: {
      type: {
        showPenalty: { type: Boolean, default: true },
        freezeMinutes: { type: Number, default: 0 },
        publicStandings: { type: Boolean, default: true },
      },
      default: () => ({}),
    },
    status: {
      type: String,
      enum: ['scheduled', 'active', 'completed', 'cancelled', 'archived'],
      default: 'scheduled',
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

contestSchema.index({ status: 1, startTime: 1 });
contestSchema.index({ startTime: 1, endTime: 1 });

const Contest = mongoose.model('Contest', contestSchema);

export default Contest;
