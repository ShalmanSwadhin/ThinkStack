import { useCallback, useEffect, useState } from 'react';
import gamificationApi from './gamificationService';

export function useGamification() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await gamificationApi.getProfile();
      setProfile(data);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load achievements');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
  };
}

export default useGamification;
