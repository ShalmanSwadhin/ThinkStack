import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../utils/cn';
import { getNotificationTypeLabel } from '../useNotifications';

const TYPE_STYLES = {
  achievement: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  contest: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  announcement: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  streak: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  system: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

function getNotificationLink(notification) {
  const { type, data } = notification;

  if (type === 'contest' && data?.contestSlug) {
    return `/contests/${data.contestSlug}`;
  }

  if (type === 'achievement') {
    return '/achievements';
  }

  if (type === 'streak') {
    return '/dashboard';
  }

  return null;
}

function NotificationItem({ notification, onMarkRead, onMarkUnread, onClose }) {
  const link = getNotificationLink(notification);

  const content = (
    <div
      className={cn(
        'rounded-xl border p-3 transition-colors',
        notification.read
          ? 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
          : 'border-brand-200 bg-brand-50/60 dark:border-brand-800 dark:bg-brand-950/30'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
            TYPE_STYLES[notification.type] ?? TYPE_STYLES.system
          )}
        >
          {getNotificationTypeLabel(notification.type)}
        </span>
        <span className="shrink-0 text-[11px] text-slate-400">
          {formatRelativeTime(notification.createdAt)}
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{notification.title}</p>
      <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{notification.message}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {notification.read ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onMarkUnread(notification.id);
            }}
            className="text-xs font-medium text-slate-500 hover:text-brand-600 dark:text-slate-400"
          >
            Mark unread
          </button>
        ) : (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onMarkRead(notification.id);
            }}
            className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            Mark read
          </button>
        )}
        {link ? (
          <Link
            to={link}
            onClick={onClose}
            className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            View
          </Link>
        ) : null}
      </div>
    </div>
  );

  return content;
}

export default function NotificationPanel({
  notifications,
  isLoading,
  error,
  onMarkRead,
  onMarkUnread,
  onMarkAllAsRead,
  onClearAll,
  onClose,
}) {
  return (
    <div className="flex max-h-[inherit] flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</h2>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onMarkAllAsRead}
            className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            Mark all read
          </button>
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-medium text-slate-500 hover:text-red-600 dark:text-slate-400"
          >
            Clear all
          </button>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
              aria-label="Close notifications"
            >
              Close
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
              />
            ))}
          </div>
        ) : null}

        {!isLoading && error ? (
          <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </p>
        ) : null}

        {!isLoading && !error && notifications.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-3xl">🔔</p>
            <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">All caught up</p>
            <p className="mt-1 text-xs text-slate-500">No notifications yet</p>
          </div>
        ) : null}

        {!isLoading && !error && notifications.length > 0 ? (
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <NotificationItem
                    notification={notification}
                    onMarkRead={onMarkRead}
                    onMarkUnread={onMarkUnread}
                    onClose={onClose}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : null}
      </div>
    </div>
  );
}
