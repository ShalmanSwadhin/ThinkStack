import api from '../../services/api';

export const settingsApi = {
  getSettings: async () => {
    const response = await api.get('/settings');
    return response.data.data;
  },

  updatePreferences: async (payload) => {
    const response = await api.patch('/settings/preferences', payload);
    return response.data.data;
  },

  updateProfile: async (payload) => {
    const response = await api.patch('/settings/profile', payload);
    return response.data.data;
  },

  changePassword: async (payload) => {
    const response = await api.patch('/settings/password', payload);
    return response.data.data;
  },

  deleteAccount: async (payload) => {
    const response = await api.delete('/settings/account', { data: payload });
    return response.data.data;
  },
};

export default settingsApi;
