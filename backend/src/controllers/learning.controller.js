import learningService from '../services/LearningService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const listTopics = asyncHandler(async (req, res) => {
  const data = await learningService.listTopics(req.user.id);
  sendSuccess(res, data);
});

export const getTopic = asyncHandler(async (req, res) => {
  const data = await learningService.getTopicBySlug(req.user.id, req.params.slug);
  sendSuccess(res, data);
});

export const updateTopicProgress = asyncHandler(async (req, res) => {
  const data = await learningService.updateProgress(req.user.id, req.params.slug, req.body);
  sendSuccess(res, data, 'Progress updated');
});

export default { listTopics, getTopic, updateTopicProgress };
