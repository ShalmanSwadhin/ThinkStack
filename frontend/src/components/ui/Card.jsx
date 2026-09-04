import { cn } from '../../utils/cn';

export default function Card({
  children,
  className,
  glass = false,
  interactive = false,
  elevated = false,
  ...props
}) {
  return (
    <div
      className={cn(
        glass ? 'glass-card p-4 sm:p-6' : 'card-base',
        interactive && 'card-interactive',
        elevated && !glass && 'shadow-soft-md',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return <div className={cn('mb-4', className)}>{children}</div>;
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={cn('text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100', className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className }) {
  return (
    <p className={cn('mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400', className)}>
      {children}
    </p>
  );
}

export function CardContent({ children, className }) {
  return <div className={cn(className)}>{children}</div>;
}
