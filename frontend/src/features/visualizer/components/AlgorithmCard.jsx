import { Link } from 'react-router-dom';
import { ALGORITHMS, ALGORITHM_CATEGORIES } from 'shared/algorithms/catalog.js';

export default function AlgorithmCard({ algorithm }) {
  return (
    <Link to={`/visualizer/${algorithm.id}`} className="card-interactive group block">
      <p className="font-semibold tracking-tight text-slate-900 transition-colors group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
        {algorithm.name}
      </p>
      <p className="chip mt-2 w-fit capitalize">{ALGORITHM_CATEGORIES[algorithm.category]}</p>
    </Link>
  );
}

export { ALGORITHMS, ALGORITHM_CATEGORIES };
