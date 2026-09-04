import api from '../../services/api';

export const notesApi = {
  listNotes: async (params = {}) => {
    const response = await api.get('/notes', { params });
    return response.data.data;
  },

  getNote: async (id) => {
    const response = await api.get(`/notes/${id}`);
    return response.data.data;
  },

  createNote: async (payload) => {
    const response = await api.post('/notes', payload);
    return response.data.data;
  },

  updateNote: async (id, payload) => {
    const response = await api.patch(`/notes/${id}`, payload);
    return response.data.data;
  },

  deleteNote: async (id) => {
    const response = await api.delete(`/notes/${id}`);
    return response.data.data;
  },
};

export default notesApi;
