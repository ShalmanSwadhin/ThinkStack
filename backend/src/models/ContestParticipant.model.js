import mongoose from 'mongoose';

const contestParticipantSchema = new mongoose.Schema(
  {
    contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    score: { type: Number, default: 0, min: 0 },
    penaltyMinutes: { type: Number, default: 0, min: 0 },
    rank: { type: Number, min: 1 },
    registeredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

contestParticipantSchema.index({ contestId: 1, userId: 1 }, { unique: true });
contestParticipantSchema.index({ contestId: 1, score: -1, penaltyMinutes: 1 });

const ContestParticipant = mongoose.model('ContestParticipant', contestParticipantSchema);

export default ContestParticipant;
