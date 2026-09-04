import quizService from '../services/QuizService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const listQuizzes = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const data = await quizService.listQuizzes(req.user.id, {
    page,
    limit,
    topic: req.query.topic,
    search: req.query.search,
  });
  sendSuccess(res, data, 'Success', 200, data.meta);
});

export const getQuiz = asyncHandler(async (req, res) => {
  const data = await quizService.getQuiz(req.user.id, req.params.id);
  sendSuccess(res, data);
});

export const submitAttempt = asyncHandler(async (req, res) => {
  const data = await quizService.submitAttempt(req.user.id, req.params.id, req.body);
  sendSuccess(res, data, 'Quiz submitted');
});

export const listAttempts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const data = await quizService.listAttempts(req.user.id, req.params.id, { page, limit });
  sendSuccess(res, data, 'Success', 200, data.meta);
});

export const getAttempt = asyncHandler(async (req, res) => {
  const data = await quizService.getAttempt(req.user.id, req.params.id, req.params.attemptId);
  sendSuccess(res, data);
});

export default { listQuizzes, getQuiz, submitAttempt, listAttempts, getAttempt };
