import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import { Bell } from 'lucide-react';
import { cn } from '../../../utils/cn';
import useNotifications from '../useNotifications';
import NotificationPanel from './NotificationPanel';
import { NAV_ICON_SIZES } from '../../../components/layout/navConfig';
import { selectAuthInitialized, selectIsAuthenticated } from '../../auth/authSlice';

function getPanelLayout(anchorRect) {
  const viewportWidth = window.innerWidth;
  const isMobile = viewportWidth < 768;
  const panelWidth = isMobile ? viewportWidth - 24 : Math.min(380, viewportWidth - 24);
  const top = anchorRect.bottom + 8;
  const maxHeight = Math.min(520, window.innerHeight - top - 16);

  if (isMobile) {
    return {
      isMobile,
      style: {
        position: 'fixed',
        top,
        left: 12,
        right: 12,
        width: 'auto',
        maxHeight,
      },
    };
  }

  return {
    isMobile,
    style: {
      position: 'fixed',
      top,
      right: Math.max(12, viewportWidth - anchorRect.right),
      width: panelWidth,
      maxHeight,
    },
  };
}

export default function NotificationBell() {
  const bellRef = useRef(null);
  const panelRef = useRef(null);
  const [panelLayout, setPanelLayout] = useState(null);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isInitialized = useSelector(selectAuthInitialized);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const notificationsEnabled = isAuthenticated && isInitialized && Boolean(accessToken);

  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    isOpen,
    togglePanel,
    closePanel,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    clearAll,
  } = useNotifications({ enabled: notificationsEnabled });

  useLayoutEffect(() => {
    if (!isOpen || !bellRef.current) {
      setPanelLayout(null);
      return undefined;
    }

    const updateLayout = () => {
      if (!bellRef.current) return;
      setPanelLayout(getPanelLayout(bellRef.current.getBoundingClientRect()));
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    window.addEventListener('scroll', updateLayout, true);
    return () => {
      window.removeEventListener('resize', updateLayout);
      window.removeEventListener('scroll', updateLayout, true);
    };
  }, [isOpen]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (bellRef.current?.contains(event.target) || panelRef.current?.contains(event.target)) {
        return;
      }
      closePanel();
    };

    if (isOpen) {
      document.addEventListener('pointerdown', handlePointerDown);
    }

    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen, closePanel]);

  useEffect(() => {
    if (!isOpen || !panelLayout?.isMobile) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, panelLayout?.isMobile]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closePanel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, closePanel]);

  return (
    <>
      <div ref={bellRef} className="relative shrink-0">
        <button
          type="button"
          onClick={togglePanel}
          className={cn(
            'relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-all duration-200 ease-smooth',
            'hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50',
            isOpen && 'bg-slate-100 text-brand-600 dark:bg-slate-800 dark:text-brand-400'
          )}
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
        >
          <Bell size={NAV_ICON_SIZES.navbar} strokeWidth={2} aria-hidden="true" />
          {unreadCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-950">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          ) : null}
        </button>
      </div>

      {isOpen && panelLayout
        ? createPortal(
            <>
              {panelLayout.isMobile ? (
                <button
                  type="button"
                  className="fixed inset-0 z-[90] bg-black/40"
                  aria-label="Close notifications"
                  onClick={closePanel}
                />
              ) : null}
              <div
                ref={panelRef}
                style={panelLayout.style}
                className={cn(
                  'z-[100] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl',
                  'dark:border-slate-800 dark:bg-slate-950'
                )}
                role="dialog"
                aria-label="Notifications"
              >
                <NotificationPanel
                  notifications={notifications}
                  isLoading={isLoading}
                  error={error}
                  onMarkRead={markAsRead}
                  onMarkUnread={markAsUnread}
                  onMarkAllAsRead={markAllAsRead}
                  onClearAll={clearAll}
                  onClose={closePanel}
                />
              </div>
            </>,
            document.body
          )
        : null}
    </>
  );
}
