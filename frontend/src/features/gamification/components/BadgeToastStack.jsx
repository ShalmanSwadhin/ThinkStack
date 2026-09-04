import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { setBadgeListener } from '../badgeNotify';

export default function BadgeToastStack() {
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    setBadgeListener((badges) => {
      setQueue((current) => [...current, ...badges]);
    });
    return () => setBadgeListener(null);
  }, []);

  useEffect(() => {
    if (queue.length === 0) return undefined;
    const timer = setTimeout(() => {
      setQueue((current) => current.slice(1));
    }, 4500);
    return () => clearTimeout(timer);
  }, [queue]);

  const active = queue[0];

  return (
    <div className="pointer-events-none fixed bottom-24 right-4 z-50 max-w-sm lg:bottom-8">
      <AnimatePresence mode="wait">
        {active ? (
          <motion.div
            key={active.id ?? active.slug}
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            className="pointer-events-auto rounded-2xl border border-brand-200 bg-white p-4 shadow-xl dark:border-brand-800 dark:bg-slate-900"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
              Badge unlocked
            </p>
            <div className="mt-2 flex items-start gap-3">
              <span className="text-3xl">{active.icon}</span>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{active.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{active.description}</p>
                {active.xpBonus > 0 ? (
                  <p className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    +{active.xpBonus} bonus XP
                  </p>
                ) : null}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
