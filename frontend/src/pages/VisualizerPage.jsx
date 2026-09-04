import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import AlgorithmCard, { ALGORITHMS, ALGORITHM_CATEGORIES } from '../features/visualizer/components/AlgorithmCard';
import Card, { CardContent } from '../components/ui/Card';

const categories = Object.keys(ALGORITHM_CATEGORIES);

export default function VisualizerPage() {
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return ALGORITHMS;
    return ALGORITHMS.filter((algo) => algo.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="page-container py-8 pb-24 lg:pb-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="page-heading">Algorithm Visualizer</h1>
        <p className="page-subheading">
          Step through {ALGORITHMS.length} algorithms with play controls, highlights, and live statistics.
        </p>
      </motion.div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={`rounded-full px-3 py-1.5 text-sm font-medium ${
            activeCategory === 'all'
              ? 'bg-brand-600 text-white'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              activeCategory === category
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {ALGORITHM_CATEGORIES[category]}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((algorithm) => (
          <AlgorithmCard key={algorithm.id} algorithm={algorithm} />
        ))}
      </div>

      {filtered.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">No algorithms in this category.</CardContent>
        </Card>
      )}
    </div>
  );
}
