import api, {
  setAccessToken,
  markPersistedSession,
  clearPersistedSession,
} from '../../services/api';

const extractError = (error) => {
  const message = error.response?.data?.error?.message || error.message || 'Something went wrong';
  const details = error.response?.data?.error?.details;
  return { message, details };
};

export const authApi = {
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data.data;
  },

  login: async (data) => {
    const response = await api.post('/auth/login', data);
    return response.data.data;
  },

  refresh: async () => {
    const response = await api.post('/auth/refresh');
    return response.data.data;
  },

  logout: async () => {
    await api.post('/auth/logout');
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (data) => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },
};

export const applyAuthSession = (data) => {
  if (data?.accessToken) {
    setAccessToken(data.accessToken);
    markPersistedSession();
  }
  return data;
};

export { extractError };
export default authApi;
