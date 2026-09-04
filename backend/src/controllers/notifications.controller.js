import notificationService from '../services/NotificationService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const listNotifications = asyncHandler(async (req, res) => {
  const data = await notificationService.listNotifications(req.user.id, req.query);
  sendSuccess(res, data, 'Success', 200, data.meta);
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const data = await notificationService.getUnreadCount(req.user.id);
  sendSuccess(res, data);
});

export const markAsRead = asyncHandler(async (req, res) => {
  const data = await notificationService.markAsRead(req.user.id, req.params.id);
  sendSuccess(res, data, 'Notification marked as read');
});

export const markAsUnread = asyncHandler(async (req, res) => {
  const data = await notificationService.markAsUnread(req.user.id, req.params.id);
  sendSuccess(res, data, 'Notification marked as unread');
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  const data = await notificationService.markAllAsRead(req.user.id);
  sendSuccess(res, data, 'All notifications marked as read');
});

export const clearAll = asyncHandler(async (req, res) => {
  const data = await notificationService.clearAll(req.user.id);
  sendSuccess(res, data, 'Notifications cleared');
});

export default {
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  clearAll,
};
