import api from '../../services/api';

export const notificationsApi = {
  listNotifications: async (params = {}) => {
    const response = await api.get('/notifications', { params });
    return response.data.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data.data;
  },

  markAsRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data.data;
  },

  markAsUnread: async (id) => {
    const response = await api.patch(`/notifications/${id}/unread`);
    return response.data.data;
  },

  markAllAsRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data.data;
  },

  clearAll: async () => {
    const response = await api.delete('/notifications');
    return response.data.data;
  },
};

export default notificationsApi;
