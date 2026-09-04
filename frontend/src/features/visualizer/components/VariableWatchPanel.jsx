import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../utils/cn';

function formatValue(value) {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return `[${value.join(', ')}]`;
  if (typeof value === 'object') {
    return Object.entries(value)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
  }
  return String(value);
}

export default function VariableWatchPanel({ variables, className }) {
  const entries = Object.entries(variables ?? {}).filter(
    ([, value]) => value !== undefined && value !== null
  );

  return (
    <div className={cn('overflow-hidden rounded-2xl border bg-white dark:bg-slate-800', className)}>
      <div className="border-b px-4 py-3 dark:border-slate-700">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Variable Watch</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Updates each visualization step</p>
      </div>

      {entries.length ? (
        <div className="divide-y dark:divide-slate-700">
          <AnimatePresence mode="popLayout">
            {entries.map(([name, value]) => (
              <motion.div
                key={name}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.2 }}
                className="flex items-start justify-between gap-3 px-4 py-2.5"
              >
                <span className="font-mono text-sm font-medium text-brand-600 dark:text-brand-400">{name}</span>
                <span className="max-w-[60%] break-all text-right font-mono text-sm text-slate-700 dark:text-slate-300">
                  {formatValue(value)}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <p className="px-4 py-6 text-sm text-slate-500 dark:text-slate-400">
          Step through the visualization to watch variables update.
        </p>
      )}
    </div>
  );
}
