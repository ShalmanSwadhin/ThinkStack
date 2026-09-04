function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function QuizTimer({ secondsLeft, timeLimitMinutes }) {
  if (!timeLimitMinutes || secondsLeft == null) return null;

  const urgent = secondsLeft <= 60;

  return (
    <div
      className={`rounded-xl border px-4 py-2 text-sm font-medium ${
        urgent
          ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300'
          : 'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
      }`}
    >
      Time left: {formatTime(secondsLeft)}
    </div>
  );
}
