import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import learningApi from './learningService';
import applyGamificationResult from '../gamification/applyGamificationResult';
import { notifyBadges } from '../gamification/badgeNotify';

export function useTopic(slug) {
  const dispatch = useDispatch();
  const [topic, setTopic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchTopic = useCallback(async () => {
    if (!slug) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await learningApi.getTopic(slug);
      setTopic(result);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to load topic');
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  const markComplete = useCallback(async () => {
    if (!slug || topic?.progress?.status === 'completed') return null;
    setIsUpdating(true);
    setError(null);
    try {
      const result = await learningApi.updateProgress(slug, { status: 'completed' });
      setTopic((prev) =>
        prev ? { ...prev, progress: result.progress } : prev
      );
      const newBadges = applyGamificationResult(dispatch, result);
      notifyBadges(newBadges);
      return result;
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to update progress');
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, [slug, topic?.progress?.status, dispatch]);

  useEffect(() => {
    fetchTopic();
  }, [fetchTopic]);

  return {
    topic,
    isLoading,
    error,
    isUpdating,
    refetch: fetchTopic,
    markComplete,
  };
}

export default useTopic;
