import { query, param } from 'express-validator';

export const searchQueryValidator = [
  query('q')
    .trim()
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Search query must be between 2 and 100 characters'),
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('limit must be between 1 and 20'),
];

export const historyIdValidator = [param('id').isMongoId().withMessage('Invalid history entry ID')];

export default {
  searchQueryValidator,
  historyIdValidator,
};
