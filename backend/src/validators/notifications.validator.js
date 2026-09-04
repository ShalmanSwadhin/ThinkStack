import { param, query } from 'express-validator';

export const listNotificationsValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('type')
    .optional()
    .isIn(['achievement', 'contest', 'announcement', 'streak', 'system'])
    .withMessage('Invalid notification type'),
  query('unread').optional().isIn(['true', 'false']).withMessage('unread must be true or false'),
];

export const notificationIdValidator = [
  param('id').isMongoId().withMessage('Valid notification ID required'),
];

export default {
  listNotificationsValidator,
  notificationIdValidator,
};
