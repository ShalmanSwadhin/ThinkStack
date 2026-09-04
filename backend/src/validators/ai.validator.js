import { body, param, query } from 'express-validator';

export const conversationIdValidator = [
  param('id').isMongoId().withMessage('Valid conversation ID required'),
];

export const listConversationsValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit must be between 1 and 50'),
];

export const createConversationValidator = [
  body('title').optional().trim().isLength({ max: 100 }).withMessage('Title too long'),
  body('context').optional().isObject().withMessage('Context must be an object'),
  body('context.topicSlug')
    .optional()
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Invalid topic slug'),
  body('context.problemSlug')
    .optional()
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Invalid problem slug'),
];

export const sendMessageValidator = [
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 4000 })
    .withMessage('Message must be at most 4000 characters'),
  body('conversationId').optional().isMongoId().withMessage('Invalid conversation ID'),
  body('context').optional().isObject().withMessage('Context must be an object'),
  body('context.topicSlug')
    .optional()
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Invalid topic slug'),
  body('context.problemSlug')
    .optional()
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Invalid problem slug'),
];

export default {
  conversationIdValidator,
  listConversationsValidator,
  createConversationValidator,
  sendMessageValidator,
};
