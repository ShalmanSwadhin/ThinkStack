import tokenService from '../services/TokenService.js';
import AppError from '../utils/AppError.js';
import { sendError } from '../utils/apiResponse.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = tokenService.verifyAccessToken(token);

    if (decoded.type !== 'access') {
      throw new AppError('Invalid token type', 401);
    }

    req.user = {
      id: decoded.sub,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Access token expired', 401);
    }
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 'Invalid access token', 401);
    }
    next(error);
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return sendError(res, 'Authentication required', 401);
  }
  if (!roles.includes(req.user.role)) {
    return sendError(res, 'Insufficient permissions', 403);
  }
  next();
};

export const optionalAuth = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = tokenService.verifyAccessToken(token);
      req.user = { id: decoded.sub, role: decoded.role };
    }
  } catch {
    // Optional — ignore invalid tokens
  }
  next();
};

export default { authenticate, authorize, optionalAuth };
