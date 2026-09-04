import { Link } from 'react-router-dom';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

function WeakSection({ title, emptyMessage, children }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
      {children ?? (
        <p className="text-sm text-slate-500 dark:text-slate-400">{emptyMessage}</p>
      )}
    </div>
  );
}

export default function WeakAreasPanel({ weakAreas }) {
  if (!weakAreas) return null;

  const hasWeakAreas =
    weakAreas.categories?.length > 0 ||
    weakAreas.topics?.length > 0 ||
    weakAreas.quizzes?.length > 0 ||
    weakAreas.problems?.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weak Areas</CardTitle>
        <CardDescription>Focus here to improve faster</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!hasWeakAreas ? (
          <div className="py-8 text-center">
            <span className="text-4xl">🎯</span>
            <p className="mt-3 font-medium text-slate-600 dark:text-slate-300">
              No weak areas detected
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Keep learning — we will highlight categories, topics, quizzes, and problems that need
              attention.
            </p>
          </div>
        ) : (
          <>
            <WeakSection title="Categories below 50%" emptyMessage="All categories on track.">
              {weakAreas.categories?.length > 0 ? (
                <ul className="space-y-2">
                  {weakAreas.categories.map((item) => (
                    <li
                      key={item.category}
                      className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-900/50 dark:bg-amber-950/30"
                    >
                      <p className="font-medium text-slate-900 dark:text-white">{item.label}</p>
                      <p className="mt-1 text-slate-600 dark:text-slate-400">
                        {item.recommendation}
                      </p>
                      <Link to="/learn" className="mt-2 inline-block">
                        <Button size="sm" variant="secondary">
                          Browse topics
                        </Button>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </WeakSection>

            <WeakSection title="Incomplete topics" emptyMessage="No stuck topics.">
              {weakAreas.topics?.length > 0 ? (
                <ul className="space-y-2">
                  {weakAreas.topics.map((item) => (
                    <li key={item.slug}>
                      <Link
                        to={`/learn/${item.slug}`}
                        className="flex items-center justify-between rounded-xl border px-4 py-3 transition-colors hover:border-brand-300 hover:bg-brand-50 dark:hover:border-brand-700 dark:hover:bg-brand-950"
                      >
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{item.title}</p>
                          <p className="text-xs text-slate-500">{item.reason}</p>
                        </div>
                        <span className="text-xs text-slate-400">{item.categoryLabel}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </WeakSection>

            <WeakSection title="Quizzes to retake" emptyMessage="No struggling quizzes.">
              {weakAreas.quizzes?.length > 0 ? (
                <ul className="space-y-2">
                  {weakAreas.quizzes.map((item) => (
                    <li key={item.id}>
                      <Link
                        to={`/quizzes/${item.id}`}
                        className="flex items-center justify-between rounded-xl border px-4 py-3 transition-colors hover:border-brand-300 hover:bg-brand-50 dark:hover:border-brand-700 dark:hover:bg-brand-950"
                      >
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{item.title}</p>
                          <p className="text-xs text-slate-500">{item.recommendation}</p>
                        </div>
                        <span className="text-xs font-medium text-rose-600 dark:text-rose-400">
                          {item.score}%
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </WeakSection>

            <WeakSection title="Unsolved problems" emptyMessage="No blocked problems.">
              {weakAreas.problems?.length > 0 ? (
                <ul className="space-y-2">
                  {weakAreas.problems.map((item) => (
                    <li key={item.slug}>
                      <Link
                        to={`/problems/${item.slug}`}
                        className="flex items-center justify-between rounded-xl border px-4 py-3 transition-colors hover:border-brand-300 hover:bg-brand-50 dark:hover:border-brand-700 dark:hover:bg-brand-950"
                      >
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{item.title}</p>
                          <p className="text-xs text-slate-500">
                            {item.attemptCount} attempt{item.attemptCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <span className="text-xs capitalize text-slate-400">{item.difficulty}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </WeakSection>
          </>
        )}
      </CardContent>
    </Card>
  );
}
