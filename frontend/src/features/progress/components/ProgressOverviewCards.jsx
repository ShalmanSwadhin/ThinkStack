import { motion } from 'framer-motion';

const statConfig = [
  { key: 'topicsCompleted', label: 'Topics Done', sub: 'completed', icon: '✅' },
  { key: 'topicsInProgress', label: 'In Progress', sub: 'topics', icon: '📖' },
  { key: 'problemsSolved', label: 'Problems', sub: 'solved', icon: '🧩' },
  { key: 'quizzesPassed', label: 'Quizzes', sub: 'passed', icon: '📝' },
  { key: 'totalTimeSpentMinutes', label: 'Study Time', format: (value) => `${value} min`, icon: '⏱️' },
];

export default function ProgressOverviewCards({ overview }) {
  if (!overview) return null;

  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {statConfig.map((config, index) => (
        <motion.div
          key={config.key}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.35 }}
        >
          <div className="stat-card">
            <div className="flex items-start justify-between gap-2">
              <p className="stat-label">{config.label}</p>
              <span className="text-sm opacity-50" aria-hidden="true">
                {config.icon}
              </span>
            </div>
            <p className="stat-value mt-2">
              {config.format ? config.format(overview[config.key] ?? 0) : String(overview[config.key] ?? 0)}
            </p>
            <p className="stat-meta mt-1">
              {config.key === 'topicsCompleted' ? `of ${overview.topicsTotal ?? 0} total` : config.sub}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
