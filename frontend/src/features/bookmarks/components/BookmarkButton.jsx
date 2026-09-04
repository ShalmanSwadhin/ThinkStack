import { cn } from '../../../utils/cn';
import { useBookmark } from '../useBookmarks';

export default function BookmarkButton({
  targetType,
  targetId,
  targetSlug,
  initialBookmarked = false,
  className,
  size = 'sm',
}) {
  const { isBookmarked, isLoading, toggleBookmark } = useBookmark({
    targetType,
    targetId,
    targetSlug,
    initialBookmarked,
  });

  const sizeClasses = size === 'sm' ? 'h-8 w-8 text-base' : 'h-10 w-10 text-lg';

  return (
    <button
      type="button"
      onClick={toggleBookmark}
      disabled={isLoading}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      aria-pressed={isBookmarked}
      className={cn(
        'inline-flex items-center justify-center rounded-lg border transition-colors',
        sizeClasses,
        isBookmarked
          ? 'border-amber-300 bg-amber-50 text-amber-600 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
          : 'border-slate-200 bg-white text-slate-500 hover:border-brand-300 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-brand-700',
        className
      )}
    >
      {isBookmarked ? '★' : '☆'}
    </button>
  );
}
