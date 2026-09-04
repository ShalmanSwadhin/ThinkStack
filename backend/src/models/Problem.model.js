import mongoose from 'mongoose';
import { DIFFICULTY } from 'shared/constants';

const exampleSchema = new mongoose.Schema(
  {
    input: { type: String, required: true },
    output: { type: String, required: true },
    explanation: { type: String },
  },
  { _id: false }
);

const testCaseSchema = new mongoose.Schema(
  {
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    isHidden: { type: Boolean, default: false },
    weight: { type: Number, default: 1, min: 1 },
  },
  { _id: false }
);

const multiLangCodeSchema = new mongoose.Schema(
  {
    c: { type: String, default: '' },
    cpp: { type: String, default: '' },
    java: { type: String, default: '' },
    python: { type: String, default: '' },
    javascript: { type: String, default: '' },
    csharp: { type: String, default: '' },
    go: { type: String, default: '' },
    rust: { type: String, default: '' },
    kotlin: { type: String, default: '' },
    pseudocode: { type: String, default: '' },
  },
  { _id: false }
);

const referenceSolutionSchema = new mongoose.Schema(
  {
    language: { type: String, default: 'python' },
    code: { type: String, default: '' },
  },
  { _id: false }
);

const problemSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    title: { type: String, required: true, trim: true },
    difficulty: {
      type: String,
      enum: [DIFFICULTY.EASY, DIFFICULTY.MEDIUM, DIFFICULTY.HARD],
      required: true,
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    companies: [{ type: String, trim: true }],
    topicSlugs: [{ type: String, trim: true, lowercase: true }],
    description: { type: String, required: true },
    constraints: { type: String, default: '' },
    hints: [{ type: String }],
    editorial: { type: String, default: '' },
    examples: [exampleSchema],
    starterCode: { type: multiLangCodeSchema, default: () => ({}) },
    boilerplateCode: { type: multiLangCodeSchema, default: () => ({}) },
    referenceSolution: { type: referenceSolutionSchema, default: () => ({}) },
    testCases: { type: [testCaseSchema], validate: [(v) => v.length > 0, 'At least one test case required'] },
    timeLimitMs: { type: Number, default: 2000, min: 100 },
    memoryLimitKb: { type: Number, default: 256000, min: 1024 },
    supportedLanguages: [{ type: String }],
    acceptanceRate: { type: Number, default: 0, min: 0, max: 100 },
    totalSubmissions: { type: Number, default: 0, min: 0 },
    totalAccepted: { type: Number, default: 0, min: 0 },
    xpReward: {
      easy: { type: Number, default: 10 },
      medium: { type: Number, default: 25 },
      hard: { type: Number, default: 50 },
    },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

problemSchema.index({ difficulty: 1 });
problemSchema.index({ tags: 1 });
problemSchema.index({ topicSlugs: 1 });
problemSchema.index({ status: 1 });
problemSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Problem = mongoose.model('Problem', problemSchema);

export default Problem;
