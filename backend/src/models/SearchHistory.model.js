import mongoose from 'mongoose';

const searchHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    query: { type: String, required: true, trim: true, maxlength: 100 },
    lastSearchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

searchHistorySchema.index({ userId: 1, query: 1 }, { unique: true });
searchHistorySchema.index({ userId: 1, lastSearchedAt: -1 });

const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);

export default SearchHistory;
