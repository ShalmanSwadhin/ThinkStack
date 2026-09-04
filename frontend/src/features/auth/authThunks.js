import { createAsyncThunk } from '@reduxjs/toolkit';
import authApi, { applyAuthSession, extractError } from './authService';
import { logout as logoutAction } from './authSlice';
import { setTheme } from '../theme/themeSlice';
import { markExplicitLogout, resetAuthInterceptor, clearPersistedSession } from '../../services/api';

const syncUserTheme = (dispatch, user) => {
  if (user?.preferences?.theme) {
    dispatch(setTheme(user.preferences.theme));
  }
};

export const registerUser = createAsyncThunk(
  'auth/register',
  async (formData, { rejectWithValue, dispatch }) => {
    try {
      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      };
      const data = applyAuthSession(await authApi.register(payload));
      syncUserTheme(dispatch, data.user);
      return data;
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (formData, { rejectWithValue, dispatch }) => {
    try {
      const payload = {
        email: formData.email.trim(),
        password: formData.password,
      };
      const data = applyAuthSession(await authApi.login(payload));
      syncUserTheme(dispatch, data.user);
      return data;
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);

export const refreshSession = createAsyncThunk(
  'auth/refresh',
  async (_, { dispatch }) => {
    const data = await authApi.refresh();
    if (!data?.accessToken) {
      clearPersistedSession();
      return null;
    }
    applyAuthSession(data);
    syncUserTheme(dispatch, data.user);
    return data;
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async (_, { dispatch }) => {
  markExplicitLogout();
  clearPersistedSession();
  resetAuthInterceptor();
  try {
    await authApi.logout();
  } catch {
    // Clear local session even if API fails
  }
  dispatch(logoutAction());
});

export const fetchCurrentUser = createAsyncThunk(
  'auth/me',
  async (_, { rejectWithValue }) => {
    try {
      return await authApi.getMe();
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);

export const authExtraReducers = (builder) => {
  builder
    .addCase(registerUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(registerUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
    })
    .addCase(registerUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload?.message || 'Registration failed';
    })
    .addCase(loginUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(loginUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
    })
    .addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload?.message || 'Login failed';
    })
    .addCase(refreshSession.fulfilled, (state, action) => {
      if (!action.payload?.accessToken) {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        return;
      }
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.isLoading = false;
    })
    .addCase(refreshSession.rejected, (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    })
    .addCase(fetchCurrentUser.fulfilled, (state, action) => {
      state.user = action.payload;
    });
};
