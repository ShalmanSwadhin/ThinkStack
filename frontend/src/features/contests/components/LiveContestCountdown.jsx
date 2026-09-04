import { useContestCountdown } from '../useContestCountdown';
import { formatDuration } from './ContestCountdown';

export default function LiveContestCountdown({
  startTime,
  endTime,
  status: storedStatus,
  serverOffsetMs = 0,
}) {
  const { status, timing } = useContestCountdown({
    startTime,
    endTime,
    status: storedStatus,
    serverOffsetMs,
  });

  if (status === 'scheduled') {
    return (
      <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200">
        Starts in <span className="font-mono font-semibold">{formatDuration(timing.msUntilStart)}</span>
      </div>
    );
  }

  if (status === 'active') {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
        Time remaining{' '}
        <span className="font-mono font-semibold">{formatDuration(timing.msUntilEnd)}</span>
      </div>
    );
  }

  if (status === 'completed') {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
        Contest ended
      </div>
    );
  }

  if (status === 'cancelled') {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300">
        Contest cancelled
      </div>
    );
  }

  return null;
}
