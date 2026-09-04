import { Link, Navigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useContest } from '../features/contests/useContest';
import LiveContestCountdown from '../features/contests/components/LiveContestCountdown';
import ContestProblemList from '../features/contests/components/ContestProblemList';
import ContestLeaderboardTable from '../features/contests/components/ContestLeaderboardTable';
import Button from '../components/ui/Button';
import Card, { CardContent, CardTitle } from '../components/ui/Card';
import { selectCurrentUser } from '../features/auth/authSlice';

export default function ContestDetailPage() {
  const { slug } = useParams();
  const currentUser = useSelector(selectCurrentUser);
  const { contest, leaderboard, isLoading, isRegistering, error, register, refetch } =
    useContest(slug);

  if (isLoading) {
    return (
      <div className="page-container py-8">
        <div className="h-96 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
      </div>
    );
  }

  if (!contest) {
    return <Navigate to="/contests" replace />;
  }

  const canOpenProblems =
    contest.isRegistered && (contest.status === 'active' || contest.status === 'completed');

  return (
    <div className="page-container py-8 pb-24 lg:pb-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-4">
          <Link
            to="/contests"
            className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            ← Back to contests
          </Link>
        </div>

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="page-heading">{contest.title}</h1>
            <p className="mt-2 max-w-3xl text-slate-500 dark:text-slate-400">{contest.description}</p>
            <p className="mt-2 text-sm text-slate-500">
              {new Date(contest.startTime).toLocaleString()} —{' '}
              {new Date(contest.endTime).toLocaleString()}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <LiveContestCountdown
              startTime={contest.startTime}
              endTime={contest.endTime}
              status={contest.status}
            />
            {!contest.isRegistered && contest.status !== 'completed' && contest.status !== 'cancelled' && (
              <Button onClick={register} disabled={isRegistering}>
                {isRegistering ? 'Registering…' : 'Register for contest'}
              </Button>
            )}
            {contest.isRegistered && (
              <span className="text-sm font-medium text-brand-600 dark:text-brand-400">
                You are registered
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300">
            {error}
            <Button size="sm" variant="secondary" className="ml-3" onClick={refetch}>
              Retry
            </Button>
          </div>
        )}

        {contest.participant && (
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <Card glass>
              <CardContent className="pt-4">
                <p className="text-sm text-slate-500">Your score</p>
                <p className="text-3xl font-bold text-brand-600">{contest.participant.score}</p>
              </CardContent>
            </Card>
            <Card glass>
              <CardContent className="pt-4">
                <p className="text-sm text-slate-500">Penalty</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {contest.participant.penaltyMinutes}m
                </p>
              </CardContent>
            </Card>
            <Card glass>
              <CardContent className="pt-4">
                <p className="text-sm text-slate-500">Rank</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {contest.participant.rank ? `#${contest.participant.rank}` : '—'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-3">
          <Card glass className="xl:col-span-2">
            <CardContent>
              <CardTitle>Problems</CardTitle>
              {!contest.isRegistered ? (
                <p className="mt-3 text-sm text-slate-500">
                  Register to unlock the contest problem set when the window opens.
                </p>
              ) : null}
              <div className="mt-4">
                <ContestProblemList
                  contestSlug={contest.slug}
                  problems={contest.problems}
                  disabled={!canOpenProblems}
                />
              </div>
            </CardContent>
          </Card>

          <Card glass>
            <CardContent>
              <CardTitle>Live standings</CardTitle>
              <div className="mt-4">
                <ContestLeaderboardTable
                  entries={leaderboard}
                  currentUserId={currentUser?.id}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
