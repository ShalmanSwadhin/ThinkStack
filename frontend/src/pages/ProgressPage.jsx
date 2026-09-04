import { motion } from 'framer-motion';
import { useProgress } from '../features/progress/useProgress';
import ProgressOverviewCards from '../features/progress/components/ProgressOverviewCards';
import CategoryProgressChart from '../features/dashboard/components/CategoryProgressChart';
import ActivityTimelineChart from '../features/progress/components/ActivityTimelineChart';
import TimeByCategoryChart from '../features/progress/components/TimeByCategoryChart';
import WeakAreasPanel from '../features/progress/components/WeakAreasPanel';
import TopicProgressList from '../features/progress/components/TopicProgressList';
import Button from '../components/ui/Button';

function ProgressSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-80 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
        <div className="h-80 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
      </div>
    </div>
  );
}

export default function ProgressPage() {
  const {
    overview,
    categoryProgress,
    activityTimeline,
    timeByCategory,
    topicDetails,
    weakAreas,
    isLoading,
    error,
    refetch,
  } = useProgress();

  return (
    <div className="page-container py-8 pb-24 lg:pb-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="page-heading">Progress Tracking</h1>
          <p className="page-subheading">
            Aggregated learning stats, activity trends, and weak area recommendations.
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
          <ProgressSkeleton />
        ) : (
          <>
            <ProgressOverviewCards overview={overview} />

            <div className="mb-8 grid gap-6 lg:grid-cols-2">
              <ActivityTimelineChart activityTimeline={activityTimeline} />
              <TimeByCategoryChart timeByCategory={timeByCategory} />
            </div>

            <div className="mb-8">
              <CategoryProgressChart categoryProgress={categoryProgress} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <WeakAreasPanel weakAreas={weakAreas} />
              <TopicProgressList topicDetails={topicDetails} />
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
