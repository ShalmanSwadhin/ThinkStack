import { motion } from 'framer-motion';
import { useGamification } from '../features/gamification/useGamification';
import LevelProgressBar from '../features/gamification/components/LevelProgressBar';
import StreakCard from '../features/gamification/components/StreakCard';
import BadgeGrid from '../features/gamification/components/BadgeGrid';
import GamificationDailyChallenge from '../features/gamification/components/GamificationDailyChallenge';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';

export default function AchievementsPage() {
  const { profile, isLoading, error, refetch } = useGamification();

  return (
    <div className="page-container py-8 pb-24 lg:pb-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="page-heading">Achievements</h1>
          <p className="page-subheading">
            XP, levels, badges, coins, streaks, and daily challenges.
          </p>
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
          <div className="space-y-6">
            <div className="h-32 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="h-48 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
              <div className="h-48 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            </div>
          </div>
        ) : profile ? (
          <>
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <Card glass>
                <CardContent className="pt-4">
                  <p className="text-sm text-slate-500">Coins</p>
                  <p className="text-3xl font-bold text-amber-600">
                    {profile.gamification?.coins ?? 0}
                  </p>
                </CardContent>
              </Card>
              <Card glass>
                <CardContent className="pt-4">
                  <p className="text-sm text-slate-500">Daily challenges done</p>
                  <p className="text-3xl font-bold text-brand-600">
                    {profile.dailyChallengesCompleted ?? 0}
                  </p>
                </CardContent>
              </Card>
              <Card glass>
                <CardContent className="pt-4">
                  <p className="text-sm text-slate-500">Badges earned</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {profile.badges?.earnedCount ?? 0}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mb-8 grid gap-6 lg:grid-cols-2">
              <LevelProgressBar
                levelProgress={profile.levelProgress}
                xp={profile.gamification?.xp}
              />
              <StreakCard streak={profile.gamification?.streak} />
            </div>

            <div className="mb-8">
              <GamificationDailyChallenge challenge={profile.dailyChallenge} />
            </div>

            <BadgeGrid badges={profile.badges?.available ?? []} />
          </>
        ) : null}
      </motion.div>
    </div>
  );
}
