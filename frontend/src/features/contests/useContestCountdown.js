import { useEffect, useMemo, useState } from 'react';

export function useContestCountdown({ startTime, endTime, status: storedStatus, serverOffsetMs = 0 }) {
  const [now, setNow] = useState(() => Date.now() + serverOffsetMs);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now() + serverOffsetMs);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [serverOffsetMs]);

  const status = useMemo(() => {
    if (storedStatus === 'cancelled') return 'cancelled';
    const startMs = new Date(startTime).getTime();
    const endMs = new Date(endTime).getTime();
    if (now < startMs) return 'scheduled';
    if (now >= startMs && now < endMs) return 'active';
    return 'completed';
  }, [startTime, endTime, storedStatus, now]);

  const startMs = new Date(startTime).getTime();
  const endMs = new Date(endTime).getTime();

  const timing = useMemo(
    () => ({
      msUntilStart: status === 'scheduled' ? Math.max(0, startMs - now) : 0,
      msUntilEnd: status === 'active' ? Math.max(0, endMs - now) : 0,
      msSinceEnd: status === 'completed' ? Math.max(0, now - endMs) : 0,
    }),
    [status, startMs, endMs, now]
  );

  const isContestActive = status === 'active';
  const isContestEnded = status === 'completed' || status === 'cancelled';
  const canSubmit = isContestActive;

  return { status, timing, isContestActive, isContestEnded, canSubmit, now };
}

export default useContestCountdown;
