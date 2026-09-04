import leaderboardService from '../services/LeaderboardService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getLeaderboard = asyncHandler(async (req, res) => {
  const data = await leaderboardService.getLeaderboard(req.user.id, {
    period: req.query.period,
    limit: req.query.limit,
  });
  sendSuccess(res, data);
});

export default { getLeaderboard };
