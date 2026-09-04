import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, default: '' },
    tags: [{ type: String, trim: true, lowercase: true }],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

noteSchema.index({ userId: 1, isDeleted: 1, updatedAt: -1 });
noteSchema.index({ title: 'text', content: 'text', tags: 'text' });

const Note = mongoose.model('Note', noteSchema);

export default Note;
