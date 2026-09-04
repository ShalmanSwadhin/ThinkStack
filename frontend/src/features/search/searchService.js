import api from '../../services/api';

export const searchApi = {
  search: async (params = {}) => {
    const response = await api.get('/search', { params });
    return response.data.data;
  },

  suggest: async (params = {}) => {
    const response = await api.get('/search/suggest', { params });
    return response.data.data;
  },

  listHistory: async (params = {}) => {
    const response = await api.get('/search/history', { params });
    return response.data.data;
  },

  clearHistory: async () => {
    await api.delete('/search/history');
  },

  removeHistoryEntry: async (id) => {
    await api.delete(`/search/history/${id}`);
  },
};

export default searchApi;
