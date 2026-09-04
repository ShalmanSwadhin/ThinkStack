import { motion } from 'framer-motion';
import { cn } from '../../../utils/cn';

export default function ArrayRenderer({ state }) {
  if (!state?.values?.length) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        No array data to display
      </div>
    );
  }

  const max = Math.max(...state.values, 1);
  const count = state.values.length;

  return (
    <div className="w-full overflow-hidden px-2">
      <div className="flex h-64 w-full items-end justify-stretch gap-1 sm:h-80 sm:gap-2 md:h-96">
        {state.values.map((value, index) => {
          const isPrimary = state.highlights?.includes(index);
          const isSecondary = state.secondary?.includes(index);

          return (
            <div
              key={`${index}-${value}`}
              className="flex min-w-0 flex-1 flex-col items-center gap-2"
              style={{ maxWidth: `${100 / count}%` }}
            >
              <motion.div
                layout
                className={cn(
                  'flex w-full min-w-[1.25rem] items-end justify-center rounded-t-lg border-x border-t transition-colors',
                  isPrimary && 'border-brand-500 bg-brand-500 text-white',
                  !isPrimary && isSecondary && 'border-emerald-400 bg-emerald-400/80 text-white',
                  !isPrimary &&
                    !isSecondary &&
                    'border-slate-300 bg-brand-200 dark:border-slate-600 dark:bg-brand-900/60'
                )}
                style={{ height: `${Math.max(32, (value / max) * 260)}px` }}
              >
                <span className="truncate px-0.5 pb-1 text-[10px] font-semibold sm:text-xs">{value}</span>
              </motion.div>
              <span className="text-[10px] text-slate-400">{index}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
