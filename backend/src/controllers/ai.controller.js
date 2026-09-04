import aiTutorService from '../services/AITutorService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const listConversations = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const data = await aiTutorService.listConversations(req.user.id, { page, limit });
  sendSuccess(res, data, 'Success', 200, data.meta);
});

export const getConversation = asyncHandler(async (req, res) => {
  const data = await aiTutorService.getConversation(req.user.id, req.params.id);
  sendSuccess(res, data);
});

export const createConversation = asyncHandler(async (req, res) => {
  const data = await aiTutorService.createConversation(req.user.id, req.body);
  sendSuccess(res, data, 'Conversation created', 201);
});

export const deleteConversation = asyncHandler(async (req, res) => {
  const data = await aiTutorService.deleteConversation(req.user.id, req.params.id);
  sendSuccess(res, data, 'Conversation deleted');
});

export const sendMessage = asyncHandler(async (req, res) => {
  const data = await aiTutorService.sendMessage(req.user.id, req.body);
  sendSuccess(res, data, 'Message sent');
});

export default {
  listConversations,
  getConversation,
  createConversation,
  deleteConversation,
  sendMessage,
};
