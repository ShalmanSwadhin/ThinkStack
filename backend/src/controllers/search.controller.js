import searchService from '../services/SearchService.js';
import searchHistoryService from '../services/SearchHistoryService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const search = asyncHandler(async (req, res) => {
  const data = await searchService.globalSearch(req.user.id, req.query.q, req.query);
  await searchHistoryService.recordSearch(req.user.id, req.query.q);
  sendSuccess(res, data);
});

export const suggest = asyncHandler(async (req, res) => {
  const data = await searchService.getSuggestions(req.user.id, req.query.q, req.query);
  sendSuccess(res, data);
});

export const listHistory = asyncHandler(async (req, res) => {
  const data = await searchHistoryService.listHistory(req.user.id, req.query);
  sendSuccess(res, data);
});

export const removeHistoryEntry = asyncHandler(async (req, res) => {
  const data = await searchHistoryService.removeEntry(req.user.id, req.params.id);
  sendSuccess(res, data, 'Search history entry removed');
});

export const clearHistory = asyncHandler(async (req, res) => {
  const data = await searchHistoryService.clearHistory(req.user.id);
  sendSuccess(res, data, 'Search history cleared');
});

export default {
  search,
  suggest,
  listHistory,
  removeHistoryEntry,
  clearHistory,
};
