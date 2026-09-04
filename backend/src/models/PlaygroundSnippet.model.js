import mongoose from 'mongoose';

const playgroundSnippetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    language: { type: String, required: true },
    sourceCode: { type: String, required: true },
    stdin: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

playgroundSnippetSchema.index({ userId: 1, isDeleted: 1, updatedAt: -1 });

const PlaygroundSnippet = mongoose.model('PlaygroundSnippet', playgroundSnippetSchema);

export default PlaygroundSnippet;
