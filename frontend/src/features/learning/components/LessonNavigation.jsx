import { Link } from 'react-router-dom';
import { cn } from '../../../utils/cn';

const navButtonClass =
  'inline-flex min-h-[3.25rem] w-full items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm transition-all hover:border-brand-300 hover:bg-brand-50 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-brand-700 dark:hover:bg-brand-950';

export default function LessonNavigation({ previousLesson, nextLesson, className = '' }) {
  if (!previousLesson && !nextLesson) return null;

  return (
    <nav
      className={cn('border-t border-slate-200 pt-6 dark:border-slate-700', className)}
      aria-label="Lesson navigation"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {previousLesson ? (
          <Link to={`/learn/${previousLesson.slug}`} className={navButtonClass}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-base text-slate-600 dark:bg-slate-900 dark:text-slate-300">
              ←
            </span>
            <span className="min-w-0 text-left">
              <span className="block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Previous lesson
              </span>
              <span className="mt-0.5 block truncate">{previousLesson.title}</span>
            </span>
          </Link>
        ) : (
          <div className="hidden sm:block" aria-hidden="true" />
        )}

        {nextLesson ? (
          <Link
            to={`/learn/${nextLesson.slug}`}
            className={cn(navButtonClass, 'sm:col-start-2 sm:justify-end sm:text-right')}
          >
            <span className="min-w-0 flex-1 text-left sm:text-right">
              <span className="block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Next lesson
              </span>
              <span className="mt-0.5 block truncate">{nextLesson.title}</span>
            </span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-base text-white">
              →
            </span>
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
