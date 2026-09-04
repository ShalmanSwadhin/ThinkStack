import settingsService from '../services/SettingsService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getSettings = asyncHandler(async (req, res) => {
  const data = await settingsService.getSettings(req.user.id);
  sendSuccess(res, data);
});

export const updatePreferences = asyncHandler(async (req, res) => {
  const data = await settingsService.updatePreferences(req.user.id, req.body);
  sendSuccess(res, data, 'Preferences updated');
});

export const updateProfile = asyncHandler(async (req, res) => {
  const data = await settingsService.updateProfile(req.user.id, req.body);
  sendSuccess(res, data, 'Profile updated');
});

export const changePassword = asyncHandler(async (req, res) => {
  const data = await settingsService.changePassword(req.user.id, req.body);
  sendSuccess(res, data, data.message);
});

export const deleteAccount = asyncHandler(async (req, res) => {
  const data = await settingsService.deleteAccount(req.user.id, req.body);
  sendSuccess(res, data, data.message);
});

export default {
  getSettings,
  updatePreferences,
  updateProfile,
  changePassword,
  deleteAccount,
};
