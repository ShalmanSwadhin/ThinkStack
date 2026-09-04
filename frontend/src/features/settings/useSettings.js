import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import settingsApi from './settingsService';
import { setTheme } from '../theme/themeSlice';
import { updateUser } from '../auth/authSlice';
import { logoutUser } from '../auth/authThunks';

const emptyPasswordForm = () => ({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const emptyDeleteForm = () => ({
  password: '',
  confirmation: '',
});

export function useSettings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
  const [deleteForm, setDeleteForm] = useState(emptyDeleteForm);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await settingsApi.getSettings();
      setSettings(data);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const applySettingsToStore = useCallback(
    (data) => {
      if (data?.preferences?.theme) {
        dispatch(setTheme(data.preferences.theme));
      }
      dispatch(
        updateUser({
          profile: data.profile,
          preferences: data.preferences,
        })
      );
    },
    [dispatch]
  );

  const savePreferences = useCallback(
    async (updates) => {
      setIsSaving(true);
      setMessage('');
      setError(null);
      try {
        const data = await settingsApi.updatePreferences(updates);
        setSettings(data);
        applySettingsToStore(data);
        setMessage('Preferences saved');
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to save preferences');
      } finally {
        setIsSaving(false);
      }
    },
    [applySettingsToStore]
  );

  const saveProfile = useCallback(async (updates) => {
    setIsSaving(true);
    setMessage('');
    setError(null);
    try {
      const data = await settingsApi.updateProfile(updates);
      setSettings(data);
      applySettingsToStore(data);
      setMessage('Profile saved');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  }, [applySettingsToStore]);

  const submitPasswordChange = useCallback(async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setIsSaving(true);
    setMessage('');
    setError(null);
    try {
      await settingsApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm(emptyPasswordForm());
      setMessage('Password updated. Please sign in again.');
      await dispatch(logoutUser());
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to change password');
    } finally {
      setIsSaving(false);
    }
  }, [dispatch, navigate, passwordForm]);

  const submitAccountDeletion = useCallback(async () => {
    setIsSaving(true);
    setMessage('');
    setError(null);
    try {
      await settingsApi.deleteAccount({
        password: deleteForm.password,
        confirmation: deleteForm.confirmation,
      });
      await dispatch(logoutUser());
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to delete account');
    } finally {
      setIsSaving(false);
    }
  }, [deleteForm, dispatch, navigate]);

  return {
    settings,
    isLoading,
    error,
    message,
    isSaving,
    passwordForm,
    deleteForm,
    setPasswordForm,
    setDeleteForm,
    savePreferences,
    saveProfile,
    submitPasswordChange,
    submitAccountDeletion,
    refetch: fetchSettings,
  };
}

export default useSettings;
