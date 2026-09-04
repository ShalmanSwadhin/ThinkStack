import { cn } from '../../utils/cn';

export default function NavTooltip({ label, children, show }) {
  if (!show) return children;

  return (
    <div className="group/tooltip relative">
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2',
          'whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-soft-lg',
          'opacity-0 transition-all duration-200 ease-smooth',
          'group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100',
          'dark:bg-slate-700'
        )}
      >
        {label}
      </span>
    </div>
  );
}
