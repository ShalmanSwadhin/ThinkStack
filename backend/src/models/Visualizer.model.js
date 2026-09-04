import mongoose from 'mongoose';

const visualizerCodeSchema = new mongoose.Schema(
  {
    language: { type: String, required: true },
    code: { type: String, default: '' },
    explanation: { type: String, default: '' },
  },
  { _id: false }
);

const visualizerSchema = new mongoose.Schema(
  {
    algorithmId: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    timeComplexity: { type: String, default: '' },
    spaceComplexity: { type: String, default: '' },
    codeExamples: [visualizerCodeSchema],
    animationConfig: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
    examples: [{ type: String }],
    supportedLanguages: [{ type: String }],
    visibility: { type: String, enum: ['public', 'private', 'unlisted'], default: 'public' },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published' },
    order: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

visualizerSchema.index({ category: 1, order: 1 });
visualizerSchema.index({ status: 1 });

const Visualizer = mongoose.model('Visualizer', visualizerSchema);

export default Visualizer;
