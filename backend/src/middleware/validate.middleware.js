import { validationResult } from 'express-validator';
import AppError from '../utils/AppError.js';

export const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));
    return next(Object.assign(new AppError('Validation failed', 400), { details }));
  }
  next();
};

// Extend AppError to carry details - update AppError
export default validate;
