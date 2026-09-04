import problemService from '../services/ProblemService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const listProblems = asyncHandler(async (req, res) => {
  const data = await problemService.listProblems(req.user.id, req.query);
  sendSuccess(res, data, 'Success', 200, data.meta);
});

export const getProblem = asyncHandler(async (req, res) => {
  const data = await problemService.getProblemBySlug(req.user.id, req.params.slug);
  sendSuccess(res, data);
});

export const runSample = asyncHandler(async (req, res) => {
  const data = await problemService.runSample(req.user.id, req.params.slug, req.body);
  sendSuccess(res, data, 'Sample run complete');
});

export const submitSolution = asyncHandler(async (req, res) => {
  const data = await problemService.submitSolution(req.user.id, req.params.slug, req.body);
  sendSuccess(res, data, 'Submission recorded');
});

export const listSubmissions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const data = await problemService.listSubmissions(req.user.id, req.params.slug, { page, limit });
  sendSuccess(res, data, 'Success', 200, data.meta);
});

export default {
  listProblems,
  getProblem,
  runSample,
  submitSolution,
  listSubmissions,
};
