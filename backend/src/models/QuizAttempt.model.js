import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    answers: [{ type: Number, min: 0 }],
    score: { type: Number, required: true, min: 0, max: 100 },
    passed: { type: Boolean, required: true },
    timeTakenSeconds: { type: Number, min: 0 },
    xpAwarded: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

quizAttemptSchema.index({ userId: 1, quizId: 1, createdAt: -1 });
quizAttemptSchema.index({ userId: 1, quizId: 1, passed: 1, xpAwarded: 1 });

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);

export default QuizAttempt;
