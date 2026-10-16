import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { horizontalScrollTarget } from 'shared/ui/horizontalScroll.js';
import { cn } from '../../../utils/cn';

export default function ArrayRenderer({ state }) {
  const scrollerRef = useRef(null);
  const values = state?.values ?? [];
  // The bar the current step is about: the primary highlight, else the secondary one.
  const activeIndex = state?.highlights?.[0] ?? state?.secondary?.[0] ?? null;

  // A long array scrolls inside this container; follow the active bar so it never sits off-screen.
  // Only this container's own scroll offset is changed — the page is never scrolled.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || activeIndex == null) return;
    const bar = scroller.querySelector(`[data-bar-index="${activeIndex}"]`);
    if (!bar) return;
    const scrollerBox = scroller.getBoundingClientRect();
    const barBox = bar.getBoundingClientRect();
    const target = horizontalScrollTarget({
      viewportLeft: scrollerBox.left,
      viewportWidth: scroller.clientWidth,
      scrollLeft: scroller.scrollLeft,
      itemLeft: barBox.left,
      itemRight: barBox.right,
    });
    if (target === scroller.scrollLeft) return;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    scroller.scrollTo({ left: target, behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [activeIndex, values.length, state]);

  if (!values.length) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        No array data to display
      </div>
    );
  }

  const max = Math.max(...values, 1);
  const count = values.length;

  return (
    <div ref={scrollerRef} className="w-full overflow-x-auto px-2">
      <div className="flex h-64 w-full items-end justify-stretch gap-1 sm:h-80 sm:gap-2 md:h-96">
        {values.map((value, index) => {
          const isPrimary = state.highlights?.includes(index);
          const isSecondary = state.secondary?.includes(index);

          return (
            <div
              key={`${index}-${value}`}
              data-bar-index={index}
              className="flex min-w-[1.5rem] flex-1 flex-col items-center gap-2"
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
