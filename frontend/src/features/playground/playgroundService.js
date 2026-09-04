import api from '../../services/api';
import { unwrapApiPayload } from '../../utils/apiPayload';

export const playgroundApi = {
  listLanguages: async () => {
    const response = await api.get('/playground/languages');
    return response.data.data;
  },

  runCode: async ({ language, sourceCode, stdin }) => {
    const response = await api.post('/playground/run', { language, sourceCode, stdin });
    return unwrapApiPayload(response);
  },

  listHistory: async (params = {}) => {
    const response = await api.get('/playground/history', { params });
    return response.data.data;
  },

  listSnippets: async (params = {}) => {
    const response = await api.get('/playground/snippets', { params });
    return response.data.data;
  },

  createSnippet: async (payload) => {
    const response = await api.post('/playground/snippets', payload);
    return response.data.data;
  },

  updateSnippet: async (id, payload) => {
    const response = await api.patch(`/playground/snippets/${id}`, payload);
    return response.data.data;
  },

  deleteSnippet: async (id) => {
    const response = await api.delete(`/playground/snippets/${id}`);
    return response.data.data;
  },
};

export default playgroundApi;
