import searchHistoryRepository from '../repositories/SearchHistoryRepository.js';
import { sanitizeSearchQuery } from './SearchService.js';
import AppError from '../utils/AppError.js';

export class SearchHistoryService {
  async recordSearch(userId, rawQuery) {
    const query = sanitizeSearchQuery(rawQuery);
    if (!query || query.length < 2) {
      return null;
    }

    const entry = await searchHistoryRepository.upsertQuery(userId, query);
    return {
      id: entry._id.toString(),
      query: entry.query,
      lastSearchedAt: entry.lastSearchedAt,
    };
  }

  async listHistory(userId, { limit = 10 } = {}) {
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 20);
    const entries = await searchHistoryRepository.listRecent(userId, parsedLimit);

    return {
      history: entries.map((entry) => ({
        id: entry._id.toString(),
        query: entry.query,
        lastSearchedAt: entry.lastSearchedAt,
      })),
    };
  }

  async removeEntry(userId, entryId) {
    const entry = await searchHistoryRepository.findById(entryId);
    if (!entry || entry.userId.toString() !== userId) {
      throw new AppError('Search history entry not found', 404);
    }
    await searchHistoryRepository.deleteById(entryId);
    return { success: true };
  }

  async clearHistory(userId) {
    await searchHistoryRepository.clearAll(userId);
    return { success: true };
  }
}

export default new SearchHistoryService();
