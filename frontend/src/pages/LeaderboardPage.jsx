import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { useLeaderboard } from '../features/leaderboard/useLeaderboard';
import LeaderboardTable from '../features/leaderboard/components/LeaderboardTable';
import UserRankCard from '../features/leaderboard/components/UserRankCard';
import { cn } from '../utils/cn';

const periods = [
  { id: 'global', label: 'All-time' },
  { id: 'weekly', label: 'This week' },
];

export default function LeaderboardPage() {
  const {
    period,
    entries,
    currentUser,
    periodStart,
    periodEnd,
    isLoading,
    error,
    changePeriod,
    refetch,
  } = useLeaderboard('global');

  return (
    <div className="page-container py-8 pb-24 lg:pb-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="page-heading">Leaderboard</h1>
            <p className="page-subheading">
              Compare XP with learners worldwide. Top 100 rankings plus your personal rank.
            </p>
            {period === 'weekly' && periodStart && periodEnd && (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Week: {periodStart} — {periodEnd}
              </p>
            )}
          </div>

          <div className="inline-flex rounded-xl border bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
            {periods.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => changePeriod(item.id)}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                  period === item.id
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300">
            <span>{error}</span>
            <Button size="sm" variant="secondary" onClick={refetch}>
              Retry
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-6">
            <div className="h-28 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            <div className="h-96 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          </div>
        ) : (
          <>
            <div className="mb-6">
              <UserRankCard currentUser={currentUser} period={period} />
            </div>

            <LeaderboardTable
              entries={entries}
              period={period}
              emptyMessage={
                period === 'weekly'
                  ? 'No weekly XP yet. Complete activities this week to appear on the board.'
                  : undefined
              }
            />
          </>
        )}
      </motion.div>
    </div>
  );
}
