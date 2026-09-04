import { motion } from 'framer-motion';
import { useProblems } from '../features/problems/useProblems';
import ProblemCard from '../features/problems/components/ProblemCard';
import ProblemFilters from '../features/problems/components/ProblemFilters';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';

export default function ProblemsPage() {
  const { problems, meta, filters, isLoading, error, updateFilters, refetch } = useProblems();

  return (
    <div className="page-container py-8 pb-24 lg:pb-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="page-heading">Coding Problems</h1>
          <p className="page-subheading">
            50+ DSA challenges with automated grading against public and hidden test cases.
          </p>
        </div>

        <div className="mb-6">
          <ProblemFilters filters={filters} onChange={updateFilters} />
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
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-40 animate-pulse rounded-xl border bg-slate-100 dark:bg-slate-800"
              />
            ))}
          </div>
        ) : problems.length === 0 ? (
          <Card className="text-center">
            <CardContent className="py-12">
              <span className="text-4xl">🧩</span>
              <p className="mt-3 font-medium text-slate-600 dark:text-slate-300">
                No problems match your filters
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Try clearing filters or run the seed script to populate problems.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {problems.map((problem) => (
                <ProblemCard key={problem.id} problem={problem} />
              ))}
            </div>

            {meta && meta.pages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={filters.page <= 1}
                  onClick={() => updateFilters({ page: filters.page - 1 })}
                >
                  Previous
                </Button>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Page {meta.page} of {meta.pages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={filters.page >= meta.pages}
                  onClick={() => updateFilters({ page: filters.page + 1 })}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
