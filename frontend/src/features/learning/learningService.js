import api, { getAccessToken } from '../../services/api';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const learningApi = {
  listTopics: async () => {
    const response = await api.get('/topics');
    return response.data.data;
  },

  getTopic: async (slug) => {
    const response = await api.get(`/topics/${slug}`);
    return response.data.data;
  },

  updateProgress: async (slug, payload) => {
    const response = await api.patch(`/topics/${slug}/progress`, payload);
    return response.data.data;
  },

  recordTime: async (slug, minutes) => {
    const response = await api.patch(`/topics/${slug}/progress`, { addMinutes: minutes });
    return response.data.data;
  },

  recordTimeKeepalive: (slug, minutes) => {
    if (!slug || minutes < 1) return;
    const accessToken = getAccessToken();
    fetch(`${API_URL}/topics/${slug}/progress`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ addMinutes: minutes }),
      credentials: 'include',
      keepalive: true,
    }).catch(() => {});
  },
};

export default learningApi;
