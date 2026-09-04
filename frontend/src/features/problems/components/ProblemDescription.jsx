import { Link } from 'react-router-dom';
import Card, { CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import BookmarkButton from '../../bookmarks/components/BookmarkButton';
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS, STATUS_LABELS } from '../constants';

export default function ProblemDescription({ problem }) {
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${DIFFICULTY_COLORS[problem.difficulty]}`}
          >
            {DIFFICULTY_LABELS[problem.difficulty]}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Status: {STATUS_LABELS[problem.userStatus]}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            +{problem.xpReward} XP
          </span>
          <BookmarkButton
            targetType="problem"
            targetId={problem.id}
            targetSlug={problem.slug}
            className="ml-auto"
          />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{problem.title}</h1>
      </div>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Description
        </h2>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {problem.description}
        </p>
      </section>

      {problem.constraints ? (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Constraints
          </h2>
          <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
            {problem.constraints}
          </p>
        </section>
      ) : null}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Examples
        </h2>
        <div className="space-y-4">
          {(problem.examples ?? []).map((example, index) => (
            <Card key={index} glass>
              <CardContent className="space-y-2 pt-2 text-sm">
                <div>
                  <p className="mb-1 font-medium text-slate-500">Input</p>
                  <pre className="overflow-x-auto rounded-lg bg-slate-900 p-3 font-mono text-xs text-slate-100">
                    {example.input}
                  </pre>
                </div>
                <div>
                  <p className="mb-1 font-medium text-slate-500">Output</p>
                  <pre className="overflow-x-auto rounded-lg bg-slate-900 p-3 font-mono text-xs text-emerald-300">
                    {example.output}
                  </pre>
                </div>
                {example.explanation ? (
                  <p className="text-slate-600 dark:text-slate-400">{example.explanation}</p>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="text-xs text-slate-500 dark:text-slate-400">
        <p>
          {problem.publicTestCases?.length ?? 0} public + {problem.hiddenTestCount ?? 0} hidden test
          cases
        </p>
        <p className="mt-1">Acceptance rate: {problem.acceptanceRate}%</p>
      </section>

      {problem.links?.aiTutor ? (
        <section className="flex flex-wrap gap-2">
          <Link to={problem.links.aiTutor}>
            <Button variant="secondary" size="sm">
              Ask AI Tutor about this problem
            </Button>
          </Link>
          <Link to={`/notes?problem=${problem.slug}`}>
            <Button variant="ghost" size="sm">
              Take Notes
            </Button>
          </Link>
        </section>
      ) : (
        <section>
          <Link to={`/notes?problem=${problem.slug}`}>
            <Button variant="secondary" size="sm">
              Take Notes
            </Button>
          </Link>
        </section>
      )}
    </div>
  );
}
