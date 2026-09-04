import mongoose from 'mongoose';
import { VERDICT } from 'shared/constants';

const contestSubmissionSchema = new mongoose.Schema(
  {
    contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission' },
    language: { type: String, required: true },
    verdict: { type: String, enum: Object.values(VERDICT), default: VERDICT.PENDING },
    points: { type: Number, default: 0, min: 0 },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

contestSubmissionSchema.index({ contestId: 1, userId: 1, problemId: 1 });
contestSubmissionSchema.index({ contestId: 1, submittedAt: -1 });

const ContestSubmission = mongoose.model('ContestSubmission', contestSubmissionSchema);

export default ContestSubmission;
