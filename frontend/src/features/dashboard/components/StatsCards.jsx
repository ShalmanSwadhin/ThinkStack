import { motion } from 'framer-motion';

const statConfig = [
  { key: 'xp', label: 'XP', subKey: 'level', subPrefix: 'Level ', icon: '⚡' },
  { key: 'streak', label: 'Streak', nested: 'current', sub: 'days', icon: '🔥' },
  { key: 'problemsSolved', label: 'Problems', sub: 'solved', icon: '🧩' },
  { key: 'topicsCompleted', label: 'Topics', sub: 'completed', icon: '📚' },
  { key: 'coins', label: 'Coins', sub: 'earned', icon: '🪙' },
];

export default function StatsCards({ stats }) {
  if (!stats) return null;

  const getValue = (config) => {
    if (config.nested) {
      return stats[config.key]?.[config.nested] ?? 0;
    }
    return stats[config.key] ?? 0;
  };

  const getSub = (config) => {
    if (config.subKey) {
      return `${config.subPrefix}${stats[config.subKey] ?? 1}`;
    }
    return config.sub;
  };

  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {statConfig.map((config, index) => (
        <motion.div
          key={config.key}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="stat-card">
            <div className="flex items-start justify-between gap-2">
              <p className="stat-label">{config.label}</p>
              <span className="text-base opacity-60 transition-opacity group-hover:opacity-100" aria-hidden="true">
                {config.icon}
              </span>
            </div>
            <p className="stat-value mt-2">{String(getValue(config))}</p>
            <p className="stat-meta mt-1">{getSub(config)}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
