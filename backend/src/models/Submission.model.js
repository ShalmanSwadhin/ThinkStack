import mongoose from 'mongoose';
import { VERDICT } from 'shared/constants';

const submissionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
    type: { type: String, enum: ['problem', 'playground', 'contest'], required: true },
    contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest' },
    language: { type: String, required: true },
    sourceCode: { type: String, required: true },
    stdin: { type: String, default: '' },
    stdout: { type: String, default: '' },
    stderr: { type: String, default: '' },
    verdict: {
      type: String,
      enum: Object.values(VERDICT),
      default: VERDICT.PENDING,
    },
    executionTime: { type: Number, min: 0 },
    memoryUsed: { type: Number, min: 0 },
    testCasesPassed: { type: Number, default: 0, min: 0 },
    testCasesTotal: { type: Number, default: 0, min: 0 },
    judge0Token: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

submissionSchema.index({ userId: 1, createdAt: -1 });
submissionSchema.index({ problemId: 1, userId: 1 });
submissionSchema.index({ contestId: 1, userId: 1 });

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;
