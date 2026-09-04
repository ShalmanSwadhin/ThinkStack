import gamificationService from '../services/GamificationService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getGamificationProfile = asyncHandler(async (req, res) => {
  const data = await gamificationService.getProfile(req.user.id);
  sendSuccess(res, data);
});

export default { getGamificationProfile };
