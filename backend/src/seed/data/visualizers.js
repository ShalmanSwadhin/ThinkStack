import { ALGORITHMS } from 'shared/algorithms';

/**
 * Seed metadata for all runtime visualizer algorithms (50+ when catalog expands).
 */
export function buildVisualizerSeedData() {
  return ALGORITHMS.map((algo, index) => ({
    algorithmId: algo.id,
    name: algo.name,
    description: `Interactive step-by-step visualization of ${algo.name}. Watch how data transforms at each step.`,
    category: algo.category,
    difficulty: index % 3 === 0 ? 'beginner' : index % 3 === 1 ? 'intermediate' : 'advanced',
    timeComplexity: inferTimeComplexity(algo.id),
    spaceComplexity: inferSpaceComplexity(algo.id),
    animationConfig: { renderer: algo.renderer, inputType: algo.inputType },
    supportedLanguages: ['c', 'cpp', 'java', 'python', 'javascript'],
    status: 'published',
    visibility: 'public',
    order: index + 1,
  }));
}

function inferTimeComplexity(id) {
  const map = {
    'linear-search': 'O(n)',
    'binary-search': 'O(log n)',
    'merge-sort': 'O(n log n)',
    'quick-sort': 'O(n log n) average',
    'bubble-sort': 'O(n²)',
    dfs: 'O(V + E)',
    bfs: 'O(V + E)',
    dijkstra: 'O(E log V)',
    'floyd-warshall': 'O(V³)',
  };
  return map[id] ?? 'Varies by input';
}

function inferSpaceComplexity(id) {
  const map = {
    'merge-sort': 'O(n)',
    dfs: 'O(V)',
    bfs: 'O(V)',
    'floyd-warshall': 'O(V²)',
  };
  return map[id] ?? 'O(1) to O(n)';
}

export default buildVisualizerSeedData;
