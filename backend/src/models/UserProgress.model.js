import mongoose from 'mongoose';

const userProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started',
    },
    progressPercent: { type: Number, default: 0, min: 0, max: 100 },
    timeSpentMinutes: { type: Number, default: 0, min: 0 },
    completedAt: { type: Date },
    xpAwarded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userProgressSchema.index({ userId: 1, topicId: 1 }, { unique: true });
userProgressSchema.index({ userId: 1, status: 1 });

const UserProgress = mongoose.model('UserProgress', userProgressSchema);

export default UserProgress;
