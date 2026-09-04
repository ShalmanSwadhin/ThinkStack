import { getIntegrationStatus } from '../utils/integrationStatus.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getIntegrationStatusHandler = asyncHandler(async (_req, res) => {
  res.status(200).json({
    success: true,
    data: getIntegrationStatus(),
  });
});

export default { getIntegrationStatusHandler };
