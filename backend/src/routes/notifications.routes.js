import { Router } from 'express';
import {
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  clearAll,
} from '../controllers/notifications.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  listNotificationsValidator,
  notificationIdValidator,
} from '../validators/notifications.validator.js';

const router = Router();

router.use(authenticate);

router.get('/unread-count', getUnreadCount);
router.get('/', listNotificationsValidator, validate, listNotifications);
router.patch('/read-all', markAllAsRead);
router.delete('/', clearAll);
router.patch('/:id/read', notificationIdValidator, validate, markAsRead);
router.patch('/:id/unread', notificationIdValidator, validate, markAsUnread);

export default router;
