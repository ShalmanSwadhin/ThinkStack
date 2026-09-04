import { body, param, query } from 'express-validator';
import { BOOKMARK_TYPES } from '../models/Bookmark.model.js';

export const listBookmarksValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('targetType').optional().isIn(BOOKMARK_TYPES),
];

export const bookmarkBodyValidator = [
  body('targetType').isIn(BOOKMARK_TYPES).withMessage('Invalid bookmark type'),
  body('targetId').optional().isMongoId().withMessage('Invalid target ID'),
  body('targetSlug').optional().isString().trim().notEmpty(),
  body().custom((value) => {
    if (!value.targetId && !value.targetSlug) {
      throw new Error('targetId or targetSlug is required');
    }
    return true;
  }),
];

export const bookmarkIdValidator = [param('id').isMongoId().withMessage('Invalid bookmark ID')];

export const bookmarkStatusValidator = [
  query('targetType').isIn(BOOKMARK_TYPES).withMessage('Invalid bookmark type'),
  query('ids').isString().notEmpty().withMessage('ids query parameter is required'),
];

export const removeBookmarkBodyValidator = [
  body('targetType').optional().isIn(BOOKMARK_TYPES),
  body('targetId').optional().isMongoId(),
  body('targetSlug').optional().isString().trim().notEmpty(),
];
