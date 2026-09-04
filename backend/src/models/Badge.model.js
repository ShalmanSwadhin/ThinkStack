import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    icon: { type: String, default: '🏅' },
    criteria: {
      type: { type: String, required: true },
      threshold: { type: Number, required: true, min: 1 },
    },
    xpBonus: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published' },
    category: { type: String, default: 'general' },
  },
  { timestamps: true }
);

badgeSchema.index({ 'criteria.type': 1 });

const Badge = mongoose.model('Badge', badgeSchema);

export default Badge;
