import contestService from '../services/ContestService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const listContests = asyncHandler(async (req, res) => {
  const data = await contestService.listContests(req.user.id, req.query);
  sendSuccess(res, data, 'Success', 200, data.meta);
});

export const getContest = asyncHandler(async (req, res) => {
  const data = await contestService.getContestBySlug(req.user.id, req.params.slug);
  sendSuccess(res, data);
});

export const registerForContest = asyncHandler(async (req, res) => {
  const data = await contestService.register(req.user.id, req.params.slug);
  sendSuccess(res, data, data.alreadyRegistered ? 'Already registered' : 'Registered for contest');
});

export const getContestLeaderboard = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 100;
  const data = await contestService.getLeaderboard(req.user.id, req.params.slug, { limit });
  sendSuccess(res, data);
});

export const getContestProblem = asyncHandler(async (req, res) => {
  const data = await contestService.getContestProblem(
    req.user.id,
    req.params.slug,
    req.params.problemSlug
  );
  sendSuccess(res, data);
});

export const runContestSample = asyncHandler(async (req, res) => {
  const data = await contestService.runSample(
    req.user.id,
    req.params.slug,
    req.params.problemSlug,
    req.body
  );
  sendSuccess(res, data, 'Sample run complete');
});

export const submitContestSolution = asyncHandler(async (req, res) => {
  const data = await contestService.submitSolution(
    req.user.id,
    req.params.slug,
    req.params.problemSlug,
    req.body
  );
  sendSuccess(res, data, 'Contest submission recorded');
});

export const createContest = asyncHandler(async (req, res) => {
  const data = await contestService.createContest(req.user.id, req.body);
  sendSuccess(res, data, 'Contest created', 201);
});

export default {
  listContests,
  getContest,
  registerForContest,
  getContestLeaderboard,
  getContestProblem,
  runContestSample,
  submitContestSolution,
  createContest,
};
