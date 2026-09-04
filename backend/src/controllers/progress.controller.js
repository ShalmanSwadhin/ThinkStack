import progressService from '../services/ProgressService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getProgress = asyncHandler(async (req, res) => {
  const data = await progressService.getProgress(req.user.id);
  sendSuccess(res, data);
});

export default { getProgress };
