import { sendError, sendComingSoon } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';
import env from '../config/env.js';

export const notFound = (req, res) => {
  sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
};

export const errorHandler = (err, req, res, _next) => {
  if (err.name === 'ComingSoonError') {
    return sendComingSoon(res, err.service, err.message);
  }

  logger.error(err.message, { stack: err.stack, url: req.originalUrl });

  if (err.name === 'AppError') {
    return sendError(res, err.message, err.statusCode, err.details);
  }

  if (err.name === 'ValidationError') {
    return sendError(res, 'Validation failed', 400, err.errors);
  }

  if (err.name === 'CastError') {
    return sendError(res, 'Invalid ID format', 400);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return sendError(res, `${field} already exists`, 409);
  }

  if (err.message === 'Not allowed by CORS') {
    return sendError(res, 'CORS policy violation', 403);
  }

  const statusCode = err.statusCode || 500;
  const message =
    env.isProduction && statusCode === 500 ? 'Internal server error' : err.message;

  return sendError(res, message, statusCode);
};

export default { notFound, errorHandler };
