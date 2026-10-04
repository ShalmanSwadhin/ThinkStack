import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../features/auth/authSlice';

const DISMISS_KEY = 'thinkstack-guest-banner-dismissed';

function wasDismissed() {
  try {
    return window.sessionStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

export default function GuestBanner() {
  const user = useSelector(selectCurrentUser);
  const [dismissed, setDismissed] = useState(wasDismissed);

  if (!user?.isGuest || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      window.sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // Banner simply reappears next visit.
    }
  };

  return (
    <div
      role="status"
      className="flex items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200"
    >
      <p>
        You&apos;re using a guest account. Your progress is saved in this browser only —{' '}
        <Link to="/register" className="font-semibold underline underline-offset-2">
          create a free account
        </Link>{' '}
        to keep it and open it from any device.
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss guest notice"
        className="shrink-0 rounded px-1.5 py-0.5 text-sm leading-none hover:bg-amber-100 dark:hover:bg-amber-900/50"
      >
        ×
      </button>
    </div>
  );
}
