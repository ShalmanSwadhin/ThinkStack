import authService from '../services/AuthService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import env from '../config/env.js';

const REFRESH_COOKIE = 'refreshToken';
const COOKIE_PATH = '/api/v1';

const refreshCookieOptions = () => ({
  httpOnly: true,
  secure: env.isProduction,
  // Cross-origin SPA (Vercel) + API (Render) requires SameSite=None
  sameSite: env.isProduction ? 'none' : 'lax',
  path: COOKIE_PATH,
});

const setRefreshCookie = (res, refreshToken) => {
  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...refreshCookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const clearRefreshCookie = (res) => {
  // Browsers require matching path/secure/sameSite to delete cross-origin cookies.
  res.clearCookie(REFRESH_COOKIE, refreshCookieOptions());
};

const getClientMeta = (req) => ({
  userAgent: req.headers['user-agent'],
  ipAddress: req.ip,
});

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  setRefreshCookie(res, result.refreshToken);
  sendSuccess(
    res,
    { user: result.user, accessToken: result.accessToken },
    'Registration successful',
    201
  );
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login({
    ...req.body,
    ...getClientMeta(req),
  });
  setRefreshCookie(res, result.refreshToken);
  sendSuccess(res, { user: result.user, accessToken: result.accessToken }, 'Login successful');
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies[REFRESH_COOKIE];

  if (!refreshToken) {
    return sendSuccess(res, { authenticated: false }, 'No active session');
  }

  try {
    const result = await authService.refresh(refreshToken, getClientMeta(req));
    setRefreshCookie(res, result.refreshToken);
    sendSuccess(
      res,
      { authenticated: true, user: result.user, accessToken: result.accessToken },
      'Token refreshed'
    );
  } catch {
    clearRefreshCookie(res);
    sendSuccess(res, { authenticated: false }, 'No active session');
  }
});

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies[REFRESH_COOKIE];
  await authService.logout(refreshToken);
  clearRefreshCookie(res);
  sendSuccess(res, null, 'Logged out successfully');
});

export const logoutAll = asyncHandler(async (req, res) => {
  await authService.logoutAll(req.user.id);
  clearRefreshCookie(res);
  sendSuccess(res, null, 'Logged out from all devices');
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  sendSuccess(res, user);
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);
  sendSuccess(res, null, result.message);
});

export const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.body);
  sendSuccess(res, null, result.message);
});

export default {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  getMe,
  forgotPassword,
  resetPassword,
};
