import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    priority: { type: String, enum: ['low', 'normal', 'high'], default: 'normal' },
    startsAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

announcementSchema.index({ isActive: 1, startsAt: -1 });

const Announcement = mongoose.model('Announcement', announcementSchema);

export default Announcement;
