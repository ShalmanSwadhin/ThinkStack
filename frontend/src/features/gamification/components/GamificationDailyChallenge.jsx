import { Link } from 'react-router-dom';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

const challengeLinks = {
  problem: '/problems',
  quiz: '/quizzes',
  topic: '/learn',
  streak: '/learn',
};

const typeLabels = {
  problem: 'Problem',
  quiz: 'Quiz',
  topic: 'Topic',
  streak: 'Streak',
};

export default function GamificationDailyChallenge({ challenge }) {
  return (
    <Card className="border-brand-200 bg-gradient-to-br from-brand-50 to-white dark:border-brand-900 dark:from-brand-950 dark:to-slate-800">
      <CardHeader>
        <CardTitle>Daily Challenge</CardTitle>
        <CardDescription>Complete today&apos;s goal for bonus XP and coins</CardDescription>
      </CardHeader>
      <CardContent>
        {!challenge ? (
          <p className="py-6 text-center text-sm text-slate-500">No challenge scheduled today.</p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-300">
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
              <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                ✓ Completed today
              </div>
            ) : (
              <Link to={challengeLinks[challenge.type] ?? '/dashboard'}>
                <Button size="sm">Start Challenge</Button>
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
