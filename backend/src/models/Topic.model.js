import mongoose from 'mongoose';
import { TOPIC_CATEGORIES, DIFFICULTY } from 'shared/constants';

const interviewQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: false }
);

const externalResourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const codeExampleSchema = new mongoose.Schema(
  {
    language: { type: String, required: true },
    code: { type: String, required: true },
    explanation: { type: String, default: '' },
    comments: { type: String, default: '' },
  },
  { _id: false }
);

const topicContentSchema = new mongoose.Schema(
  {
    introduction: { type: String, default: '' },
    theory: { type: String, default: '' },
    explanation: { type: String, default: '' },
    example: { type: String, default: '' },
    realWorldExample: { type: String, default: '' },
    advantages: [{ type: String }],
    disadvantages: [{ type: String }],
    applications: [{ type: String }],
    timeComplexity: { type: String, default: '' },
    spaceComplexity: { type: String, default: '' },
    commonMistakes: [{ type: String }],
    interviewQuestions: [interviewQuestionSchema],
    summary: { type: String, default: '' },
    codeExamples: [codeExampleSchema],
    codeComments: { type: String, default: '' },
    references: [{ type: String }],
    notes: { type: String, default: '' },
    externalResources: [externalResourceSchema],
  },
  { _id: false }
);

const lessonNavigationSchema = new mongoose.Schema(
  {
    previousLesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
    nextLesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
    relatedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],
    suggestedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],
  },
  { _id: false }
);

const topicSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: {
      type: String,
      enum: Object.values(TOPIC_CATEGORIES),
      required: true,
    },
    difficulty: {
      type: String,
      enum: [DIFFICULTY.BEGINNER, DIFFICULTY.INTERMEDIATE, DIFFICULTY.ADVANCED],
      required: true,
    },
    order: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    visibility: { type: String, enum: ['public', 'private', 'unlisted'], default: 'public' },
    thumbnail: { type: String, default: '' },
    banner: { type: String, default: '' },
    content: { type: topicContentSchema, default: () => ({}) },
    animationConfig: {
      type: { type: String },
      defaultParams: { type: mongoose.Schema.Types.Mixed },
    },
    relatedProblems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
    prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],
    relatedTopicIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],
    suggestedTopicIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],
    navigation: { type: lessonNavigationSchema, default: () => ({}) },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    estimatedMinutes: { type: Number, default: 30, min: 1 },
    xpReward: { type: Number, default: 50, min: 0 },
    tags: [{ type: String, trim: true, lowercase: true }],
    searchText: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

topicSchema.pre('save', function updateSearchText(next) {
  this.searchText = [this.title, this.description, ...(this.tags || [])].join(' ').toLowerCase();
  next();
});

topicSchema.index({ category: 1, order: 1 });
topicSchema.index({ status: 1 });
topicSchema.index({ visibility: 1 });
topicSchema.index({ title: 'text', searchText: 'text', tags: 'text' });

const Topic = mongoose.model('Topic', topicSchema);

export default Topic;
