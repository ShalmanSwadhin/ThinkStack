import { cn } from '../../utils/cn';

const ICONS = {
  gemini: '🤖',
  judge0: '⚙️',
};

export default function ComingSoonPlaceholder({
  title,
  message,
  service = 'gemini',
  className,
  compact = false,
}) {
  const icon = ICONS[service] ?? '🚧';

  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200/80 bg-white shadow-soft dark:border-slate-700/60 dark:bg-slate-800/90 dark:shadow-none',
        compact ? 'p-4' : 'p-6 sm:p-8',
        className
      )}
      role="status"
    >
      <div className={cn('flex gap-4', compact ? 'items-start' : 'items-start sm:items-center')}>
        <div
          className={cn(
            'flex shrink-0 items-center justify-center rounded-xl bg-slate-100 text-2xl dark:bg-slate-900',
            compact ? 'h-10 w-10 text-xl' : 'h-12 w-12 sm:h-14 sm:w-14 sm:text-3xl'
          )}
          aria-hidden
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Coming Soon
          </p>
          <h2
            className={cn(
              'font-semibold text-slate-900 dark:text-white',
              compact ? 'text-base' : 'text-lg sm:text-xl'
            )}
          >
            {title}
          </h2>
          <p
            className={cn(
              'mt-2 text-slate-600 dark:text-slate-400',
              compact ? 'text-sm leading-relaxed' : 'text-sm sm:text-base leading-relaxed'
            )}
          >
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}

export const COMING_SOON_COPY = {
  gemini: {
    title: 'AI Tutor Coming Soon',
    message:
      'The AI Tutor is temporarily unavailable because the AI service has not yet been configured. This feature will be enabled in a future update.',
  },
  judge0: {
    title: 'Online Code Execution Coming Soon',
    message:
      'The online compiler has not yet been configured. You can still browse problems and write code. Online execution will be enabled in a future update.',
  },
};
