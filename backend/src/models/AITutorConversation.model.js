import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: true }
);

const aiTutorConversationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, default: 'New Conversation', trim: true },
    messages: [messageSchema],
    context: {
      topicSlug: { type: String },
      problemSlug: { type: String },
    },
  },
  { timestamps: true }
);

aiTutorConversationSchema.index({ userId: 1, updatedAt: -1 });

const AITutorConversation = mongoose.model('AITutorConversation', aiTutorConversationSchema);

export default AITutorConversation;
