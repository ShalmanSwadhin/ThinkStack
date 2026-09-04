import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: {
      type: [String],
      validate: [(v) => v.length >= 2, 'At least 2 options required'],
    },
    correctIndex: { type: Number, required: true, min: 0 },
    explanation: { type: String, default: '' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  },
  { _id: true }
);

const quizSchema = new mongoose.Schema(
  {
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, default: '' },
    passingScore: { type: Number, default: 70, min: 0, max: 100 },
    timeLimitMinutes: { type: Number, min: 1 },
    questions: {
      type: [questionSchema],
      validate: [(v) => v.length > 0, 'At least one question required'],
    },
    xpReward: { type: Number, default: 30, min: 0 },
    shuffleQuestions: { type: Boolean, default: false },
    shuffleOptions: { type: Boolean, default: false },
    negativeMarking: {
      enabled: { type: Boolean, default: false },
      penalty: { type: Number, default: 0, min: 0 },
    },
    visibility: { type: String, enum: ['public', 'private', 'unlisted'], default: 'public' },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  },
  { timestamps: true }
);

quizSchema.index({ topicId: 1 });
quizSchema.index({ status: 1 });
quizSchema.index({ title: 'text' });

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;
