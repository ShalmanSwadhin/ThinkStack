import { Link } from 'react-router-dom';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

const typeLabels = {
  problem: 'Problem',
  quiz: 'Quiz',
  topic: 'Topic',
  streak: 'Streak',
};

const challengeLinks = {
  problem: '/problems',
  quiz: '/quizzes',
  topic: '/learn',
  streak: '/learn',
};

export default function DailyChallengeCard({ challenge }) {
  return (
    <Card elevated className="overflow-hidden border-brand-200/60 bg-gradient-to-br from-brand-50 via-white to-indigo-50/30 dark:border-brand-900/40 dark:from-brand-950/80 dark:via-slate-800/90 dark:to-slate-900/50">
      <CardHeader>
        <CardTitle>Daily Challenge</CardTitle>
        <CardDescription>Earn bonus XP and coins by completing today&apos;s goal</CardDescription>
      </CardHeader>
      <CardContent>
        {!challenge ? (
          <div className="empty-state border-0 bg-transparent py-4">
            <span className="empty-state-icon" aria-hidden="true">🎯</span>
            <p className="empty-state-title">No challenge scheduled today</p>
            <p className="empty-state-desc">Check back tomorrow for a new challenge.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="badge-brand">
                  {typeLabels[challenge.type] ?? challenge.type}
                </span>
                <p className="mt-3 text-slate-700 dark:text-slate-200">{challenge.description}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-2xl font-bold text-brand-600">+{challenge.xpReward}</p>
                <p className="text-xs text-slate-400">XP</p>
              </div>
            </div>

            {challenge.completed ? (
              <div className="alert-success flex items-center gap-2 font-medium">
                <span>✓</span>
                Completed today
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                <Link to={challengeLinks[challenge.type] ?? '/learn'}>
                  <Button size="sm">Start Challenge</Button>
                </Link>
                <Link to="/achievements" className="self-center text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">
                  View achievements
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
