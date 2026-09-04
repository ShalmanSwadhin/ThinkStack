import { Link, Navigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import BookmarkButton from '../features/bookmarks/components/BookmarkButton';
import { useQuiz } from '../features/quizzes/useQuiz';
import QuizQuestion from '../features/quizzes/components/QuizQuestion';
import QuizTimer from '../features/quizzes/components/QuizTimer';
import QuizResults from '../features/quizzes/components/QuizResults';

export default function QuizTakePage() {
  const { id } = useParams();
  const {
    quiz,
    answers,
    result,
    attempts,
    isLoading,
    isSubmitting,
    error,
    secondsLeft,
    allAnswered,
    setAnswer,
    submitQuiz,
    loadAttempt,
    restartQuiz,
  } = useQuiz(id);

  if (isLoading) {
    return (
      <div className="page-container py-8">
        <div className="h-96 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
      </div>
    );
  }

  if (!quiz) {
    return <Navigate to="/quizzes" replace />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="page-container py-6 pb-24 lg:pb-8"
    >
      <div className="mb-4">
        <Link
          to="/quizzes"
          className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          ← Back to quizzes
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      )}

      {attempts.length > 0 && !result && (
        <div className="mb-4 rounded-xl border bg-white p-4 dark:bg-slate-800">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Previous attempts</p>
          <ul className="mt-2 space-y-2">
            {attempts.map((attempt) => (
              <li key={attempt.id} className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                <span className="min-w-0 text-slate-600 dark:text-slate-300">
                  {attempt.score}% · {attempt.passed ? 'Passed' : 'Failed'} ·{' '}
                  {new Date(attempt.createdAt).toLocaleString()}
                </span>
                <Button variant="ghost" size="sm" onClick={() => loadAttempt(attempt.id)}>
                  Review
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result ? (
        <>
          <QuizResults quiz={quiz} result={result} />
          <div className="mt-4 flex justify-end">
            <Button variant="secondary" onClick={restartQuiz}>
              Try again
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="page-heading">{quiz.title}</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {quiz.questionCount} questions · Pass {quiz.passingScore}% · +{quiz.xpReward} XP
                {quiz.topic ? ` · ${quiz.topic.title}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <BookmarkButton targetType="quiz" targetId={quiz.id} />
              <QuizTimer secondsLeft={secondsLeft} timeLimitMinutes={quiz.timeLimitMinutes} />
            </div>
          </div>

          {secondsLeft === 0 && !allAnswered && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
              Time is up. Submitting your current answers…
            </div>
          )}

          <div className="space-y-4">
            {quiz.questions.map((question, index) => (
              <QuizQuestion
                key={question.id}
                question={question}
                index={index}
                selectedIndex={answers[question.id]}
                onSelect={(optionIndex) => setAnswer(question.id, optionIndex)}
                disabled={isSubmitting}
              />
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={() => submitQuiz()} disabled={!allAnswered || isSubmitting}>
              {isSubmitting ? 'Submitting…' : 'Submit quiz'}
            </Button>
          </div>
        </>
      )}
    </motion.div>
  );
}
