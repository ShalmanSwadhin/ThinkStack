import bookmarksService from '../services/BookmarksService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const listBookmarks = asyncHandler(async (req, res) => {
  const data = await bookmarksService.listBookmarks(req.user.id, req.query);
  sendSuccess(res, data, 'Success', 200, data.meta);
});

export const addBookmark = asyncHandler(async (req, res) => {
  const data = await bookmarksService.addBookmark(req.user.id, req.body);
  sendSuccess(res, data, 'Bookmark added', 201);
});

export const removeBookmark = asyncHandler(async (req, res) => {
  const data = await bookmarksService.removeBookmark(req.user.id, {
    bookmarkId: req.params.id,
    ...req.body,
  });
  sendSuccess(res, data, 'Bookmark removed');
});

export const removeBookmarkByTarget = asyncHandler(async (req, res) => {
  const data = await bookmarksService.removeBookmark(req.user.id, req.body);
  sendSuccess(res, data, 'Bookmark removed');
});

export const getBookmarkStatus = asyncHandler(async (req, res) => {
  const ids = req.query.ids.split(',').map((id) => id.trim()).filter(Boolean);
  const data = await bookmarksService.getStatus(req.user.id, {
    targetType: req.query.targetType,
    ids,
  });
  sendSuccess(res, data);
});

export default {
  listBookmarks,
  addBookmark,
  removeBookmark,
  removeBookmarkByTarget,
  getBookmarkStatus,
};
