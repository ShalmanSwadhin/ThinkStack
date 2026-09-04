import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useDashboard } from '../features/dashboard/useDashboard';
import StatsCards from '../features/dashboard/components/StatsCards';
import DailyChallengeCard from '../features/dashboard/components/DailyChallengeCard';
import CategoryProgressChart from '../features/dashboard/components/CategoryProgressChart';
import RecommendedTopicCard from '../features/dashboard/components/RecommendedTopicCard';
import RecentActivityList from '../features/dashboard/components/RecentActivityList';
import DashboardSkeleton from '../features/dashboard/components/DashboardSkeleton';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/auth/authSlice';

const quickLinks = [
  { title: 'Continue Learning', desc: 'Pick up where you left off', href: '/learn', icon: '📚' },
  { title: 'View Progress', desc: 'Charts and weak area insights', href: '/progress', icon: '📈' },
  { title: 'Achievements', desc: 'Badges, streaks, daily challenges', href: '/achievements', icon: '🏅' },
  { title: 'Visualizer', desc: 'Watch algorithms in action', href: '/visualizer', icon: '🎬' },
  { title: 'AI Tutor', desc: 'Get help with concepts', href: '/ai-tutor', icon: '🤖' },
];

export default function DashboardPage() {
  const user = useSelector(selectCurrentUser);
  const {
    stats,
    categoryProgress,
    dailyChallenge,
    recommendedTopic,
    recentActivity,
    isLoading,
    error,
    refetch,
  } = useDashboard();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="page-container py-8 pb-24 lg:pb-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="page-heading">Dashboard</h1>
        <p className="page-subheading">
          Welcome back{user?.username ? `, ${user.username}` : ''} — your DSA learning hub.
        </p>
      </motion.div>

      {error && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300">
          <span>{error}</span>
          <Button size="sm" variant="secondary" onClick={refetch}>
            Retry
          </Button>
        </div>
      )}

      <StatsCards stats={stats} />

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <DailyChallengeCard challenge={dailyChallenge} />
        <RecommendedTopicCard topic={recommendedTopic} />
      </div>

      <div className="mb-8">
        <CategoryProgressChart categoryProgress={categoryProgress} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump into your learning journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.title}
                  to={link.href}
                  className="card-interactive flex items-start gap-3 !p-4"
                >
                  <span className="text-2xl">{link.icon}</span>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{link.title}</p>
                    <p className="text-sm text-slate-500">{link.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <RecentActivityList activities={recentActivity} />
      </div>
    </div>
  );
}
