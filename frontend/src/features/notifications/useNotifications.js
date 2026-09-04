import { useCallback, useEffect, useRef, useState } from 'react';
import notificationsApi from './notificationsService';

const TYPE_LABELS = {
  achievement: 'Achievement',
  contest: 'Contest',
  announcement: 'Announcement',
  streak: 'Streak',
  system: 'System',
};

export const getNotificationTypeLabel = (type) => TYPE_LABELS[type] ?? 'Notification';

const isUnauthorized = (err) => err?.response?.status === 401;

export function useNotifications({ enabled = true, pollInterval = 60000 } = {}) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const pollRef = useRef(null);
  const authPausedRef = useRef(false);

  useEffect(() => {
    authPausedRef.current = false;
  }, [enabled]);

  const fetchUnreadCount = useCallback(async () => {
    if (!enabled || authPausedRef.current) return;
    try {
      const data = await notificationsApi.getUnreadCount();
      setUnreadCount(data.unreadCount ?? 0);
      authPausedRef.current = false;
    } catch (err) {
      if (isUnauthorized(err)) {
        authPausedRef.current = true;
        setUnreadCount(0);
      }
    }
  }, [enabled]);

  const fetchNotifications = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await notificationsApi.listNotifications({ limit: 30 });
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  const openPanel = useCallback(async () => {
    setIsOpen(true);
    await fetchNotifications();
  }, [fetchNotifications]);

  const closePanel = useCallback(() => {
    setIsOpen(false);
  }, []);

  const togglePanel = useCallback(async () => {
    if (isOpen) {
      closePanel();
    } else {
      await openPanel();
    }
  }, [isOpen, openPanel, closePanel]);

  const markAsRead = useCallback(async (id) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((current) =>
        current.map((item) => (item.id === id ? { ...item, read: true } : item))
      );
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch {
      // Ignore transient API errors during interaction.
    }
  }, []);

  const markAsUnread = useCallback(async (id) => {
    await notificationsApi.markAsUnread(id);
    setNotifications((current) =>
      current.map((item) => (item.id === id ? { ...item, read: false } : item))
    );
    setUnreadCount((count) => count + 1);
  }, []);

  const markAllAsRead = useCallback(async () => {
    await notificationsApi.markAllAsRead();
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
    setUnreadCount(0);
  }, []);

  const clearAll = useCallback(async () => {
    await notificationsApi.clearAll();
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;

    fetchUnreadCount();

    pollRef.current = setInterval(fetchUnreadCount, pollInterval);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [enabled, fetchUnreadCount, pollInterval]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    isOpen,
    openPanel,
    closePanel,
    togglePanel,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    clearAll,
    refetch: fetchNotifications,
  };
}

export default useNotifications;
