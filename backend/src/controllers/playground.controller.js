import playgroundService from '../services/PlaygroundService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const listLanguages = asyncHandler(async (_req, res) => {
  const data = playgroundService.listLanguages();
  sendSuccess(res, data);
});

export const runCode = asyncHandler(async (req, res) => {
  const data = await playgroundService.runCode(req.user.id, req.body);
  sendSuccess(res, data, 'Code executed');
});

export const listHistory = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const data = await playgroundService.listHistory(req.user.id, { page, limit });
  sendSuccess(res, data, 'Success', 200, data.meta);
});

export const listSnippets = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;
  const data = await playgroundService.listSnippets(req.user.id, { page, limit });
  sendSuccess(res, data, 'Success', 200, data.meta);
});

export const getSnippet = asyncHandler(async (req, res) => {
  const data = await playgroundService.getSnippet(req.user.id, req.params.id);
  sendSuccess(res, data);
});

export const createSnippet = asyncHandler(async (req, res) => {
  const data = await playgroundService.createSnippet(req.user.id, req.body);
  sendSuccess(res, data, 'Snippet saved', 201);
});

export const updateSnippet = asyncHandler(async (req, res) => {
  const data = await playgroundService.updateSnippet(req.user.id, req.params.id, req.body);
  sendSuccess(res, data, 'Snippet updated');
});

export const deleteSnippet = asyncHandler(async (req, res) => {
  const data = await playgroundService.deleteSnippet(req.user.id, req.params.id);
  sendSuccess(res, data, 'Snippet deleted');
});

export default {
  listLanguages,
  runCode,
  listHistory,
  listSnippets,
  getSnippet,
  createSnippet,
  updateSnippet,
  deleteSnippet,
};
