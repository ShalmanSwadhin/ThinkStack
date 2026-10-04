import { createSlice } from '@reduxjs/toolkit';
import { setAccessToken, clearAccessToken, setSessionIsGuest } from '../../services/api';
import { authExtraReducers } from './authThunks';

const initialState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      state.error = null;
      setAccessToken(accessToken);
      setSessionIsGuest(user?.isGuest);
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.error = null;
      clearAccessToken();
      setSessionIsGuest(false);
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setInitialized: (state) => {
      state.isInitialized = true;
      state.isLoading = false;
    },
  },
  extraReducers: authExtraReducers,
});

export const { setCredentials, logout, setLoading, setError, updateUser, setInitialized } =
  authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthInitialized = (state) => state.auth.isInitialized;
export const selectAuthError = (state) => state.auth.error;
export const selectIsAdmin = (state) => state.auth.user?.role === 'admin';
