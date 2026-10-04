import axios from 'axios';
import { resumeGuestSession } from './guestSession';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let accessToken = null;
let onSessionRefreshed = null;
let sessionIsGuest = false;

// Only a session that is already a guest may silently fall back to the stored guest key;
// an expired account-holder session must never turn into a guest one.
export const setSessionIsGuest = (value) => {
  sessionIsGuest = Boolean(value);
};

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const clearAccessToken = () => {
  accessToken = null;
};

export const resetAuthInterceptor = () => {
  isRefreshing = false;
  failedQueue.forEach((prom) => prom.reject(new Error('Session ended')));
  failedQueue = [];
  clearAccessToken();
  sessionIsGuest = false;
};

export const markExplicitLogout = () => {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('thinkstack-explicit-logout', '1');
  }
};

export const consumeExplicitLogout = () => {
  if (typeof sessionStorage === 'undefined') return false;
  const flag = sessionStorage.getItem('thinkstack-explicit-logout') === '1';
  if (flag) {
    sessionStorage.removeItem('thinkstack-explicit-logout');
  }
  return flag;
};

const SESSION_HINT_KEY = 'thinkstack-has-session';

export const markPersistedSession = () => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(SESSION_HINT_KEY, '1');
  }
};

export const clearPersistedSession = () => {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(SESSION_HINT_KEY);
  }
};

export const hasPersistedSessionHint = () => {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem(SESSION_HINT_KEY) === '1';
};

export const setOnSessionRefreshed = (callback) => {
  onSessionRefreshed = callback;
};

api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/')) {
        return Promise.reject(error);
      }
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const payload = data.data?.accessToken
          ? data.data
          : sessionIsGuest
            ? await resumeGuestSession()
            : data.data;
        if (!payload?.accessToken) {
          clearPersistedSession();
          clearAccessToken();
          const noSessionError = new Error('No active session');
          processQueue(noSessionError, null);
          return Promise.reject(noSessionError);
        }
        const newToken = payload.accessToken;
        const user = payload.user;
        setAccessToken(newToken);
        markPersistedSession();
        if (onSessionRefreshed) {
          onSessionRefreshed({ accessToken: newToken, user });
        }
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAccessToken();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
