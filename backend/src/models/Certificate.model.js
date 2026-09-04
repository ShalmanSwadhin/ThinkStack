import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    template: {
      backgroundColor: { type: String, default: '#ffffff' },
      accentColor: { type: String, default: '#4f46e5' },
      logoUrl: { type: String, default: '' },
      signatureText: { type: String, default: 'ThinkStack Team' },
      footerText: { type: String, default: '' },
    },
    criteria: {
      type: { type: String, required: true },
      threshold: { type: Number, default: 1, min: 1 },
      topicSlugs: [{ type: String }],
      problemCount: { type: Number },
    },
    xpBonus: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  },
  { timestamps: true }
);

certificateSchema.index({ isActive: 1 });
certificateSchema.index({ status: 1 });

const Certificate = mongoose.model('Certificate', certificateSchema);

export default Certificate;
