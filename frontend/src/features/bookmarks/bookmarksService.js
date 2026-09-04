import api from '../../services/api';

export const bookmarksApi = {
  listBookmarks: async (params = {}) => {
    const response = await api.get('/bookmarks', { params });
    return response.data.data;
  },

  getStatus: async (targetType, ids) => {
    const response = await api.get('/bookmarks/status', {
      params: { targetType, ids: ids.join(',') },
    });
    return response.data.data;
  },

  addBookmark: async (payload) => {
    const response = await api.post('/bookmarks', payload);
    return response.data.data;
  },

  removeBookmark: async (payload) => {
    if (payload.bookmarkId) {
      await api.delete(`/bookmarks/${payload.bookmarkId}`);
      return;
    }
    await api.delete('/bookmarks', { data: payload });
  },
};

export default bookmarksApi;
