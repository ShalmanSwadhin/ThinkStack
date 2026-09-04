import { motion } from 'framer-motion';
import { useContests } from '../features/contests/useContests';
import ContestCard from '../features/contests/components/ContestCard';
import Button from '../components/ui/Button';
import { cn } from '../utils/cn';

const filters = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'past', label: 'Past' },
];

export default function ContestsPage() {
  const { status, contests, isLoading, error, changeStatus, refetch } = useContests('all');

  return (
    <div className="page-container py-8 pb-24 lg:pb-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="page-heading">Contests</h1>
          <p className="page-subheading">
            Timed competitive programming events with ICPC-style scoring and live standings.
          </p>
        </div>

        <div className="mb-6 inline-flex rounded-xl border bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => changeStatus(filter.id)}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                status === filter.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              )}
            >
              {filter.label}
            </button>
          ))}
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
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-40 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        ) : contests.length === 0 ? (
          <div className="rounded-2xl border border-dashed px-6 py-16 text-center text-slate-500 dark:border-slate-700">
            No contests match this filter.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {contests.map((contest) => (
              <ContestCard key={contest.id} contest={contest} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
