import api from '../../services/api';
import { unwrapApiPayload } from '../../utils/apiPayload';

export const aiTutorApi = {
  listConversations: async (params = {}) => {
    const response = await api.get('/ai/conversations', { params });
    return response.data.data;
  },

  getConversation: async (id) => {
    const response = await api.get(`/ai/conversations/${id}`);
    return response.data.data;
  },

  createConversation: async (payload = {}) => {
    const response = await api.post('/ai/conversations', payload);
    return response.data.data;
  },

  deleteConversation: async (id) => {
    const response = await api.delete(`/ai/conversations/${id}`);
    return response.data.data;
  },

  sendMessage: async (payload) => {
    const response = await api.post('/ai/chat', payload);
    return unwrapApiPayload(response);
  },
};

export default aiTutorApi;
