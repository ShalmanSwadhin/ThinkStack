import { motion } from 'framer-motion';
import { useQuizzes } from '../features/quizzes/useQuizzes';
import QuizCard from '../features/quizzes/components/QuizCard';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';

export default function QuizzesPage() {
  const { quizzes, meta, filters, isLoading, error, updateFilters, refetch } = useQuizzes();

  return (
    <div className="page-container py-8 pb-24 lg:pb-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="page-heading">Quizzes</h1>
          <p className="page-subheading">
            Topic-linked assessments with instant feedback. Pass with 70%+ to earn XP.
          </p>
        </div>

        <div className="mb-6">
          <input
            type="search"
            className="input-field max-w-md"
            placeholder="Search quizzes by title or topic…"
            value={filters.search}
            onChange={(event) => updateFilters({ search: event.target.value })}
            aria-label="Search quizzes"
          />
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
                className="h-36 animate-pulse rounded-xl border bg-slate-100 dark:bg-slate-800"
              />
            ))}
          </div>
        ) : quizzes.length === 0 ? (
          <Card className="text-center">
            <CardContent className="py-12">
              <span className="text-4xl">✅</span>
              <p className="mt-3 font-medium text-slate-600 dark:text-slate-300">No quizzes found</p>
              <p className="mt-1 text-sm text-slate-400">Run the seed script to populate topic quizzes.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {quizzes.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} />
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
