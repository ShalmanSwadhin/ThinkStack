import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';

export default function QuizResults({ quiz, result }) {
  if (!result) return null;

  const { attempt, results, xpAwarded } = result;

  return (
    <div className="space-y-6">
      <div
        className={`rounded-2xl border p-6 text-center ${
          attempt.passed
            ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30'
            : 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30'
        }`}
      >
        <p className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">Your score</p>
        <p className="mt-2 text-4xl font-bold text-slate-900 dark:text-white">{attempt.score}%</p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {attempt.correctCount}/{attempt.total} correct
          {attempt.passed ? ' — Passed!' : ` — Need ${quiz.passingScore}% to pass`}
        </p>
        {xpAwarded > 0 && (
          <p className="mt-2 text-sm font-semibold text-brand-600 dark:text-brand-400">
            +{xpAwarded} XP earned
          </p>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Review answers</h3>
        {results.map((item, index) => (
          <div
            key={item.questionId}
            className={`rounded-xl border p-4 ${
              item.isCorrect
                ? 'border-emerald-200 dark:border-emerald-900/50'
                : 'border-red-200 dark:border-red-900/50'
            }`}
          >
            <p className="font-medium text-slate-900 dark:text-white">
              {index + 1}. {item.question}
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Your answer: {item.options[item.selectedIndex]}
            </p>
            {!item.isCorrect && (
              <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
                Correct: {item.options[item.correctIndex]}
              </p>
            )}
            {item.explanation ? (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{item.explanation}</p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/quizzes">
          <Button variant="secondary">Back to quizzes</Button>
        </Link>
        {quiz.topic?.slug ? (
          <Link to={`/learn/${quiz.topic.slug}`}>
            <Button variant="ghost">Review topic</Button>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
