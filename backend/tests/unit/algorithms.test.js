import {
  ALGORITHMS,
  ALGORITHM_MAP,
  resolveAlgorithmId,
  runAlgorithm,
} from '../../../shared/algorithms/catalog.js';

describe('Algorithm catalog', () => {
  it('registers all visualizer algorithms', () => {
    expect(ALGORITHMS.length).toBeGreaterThanOrEqual(26);
    expect(Object.keys(ALGORITHM_MAP)).toHaveLength(ALGORITHMS.length);
  });

  it('resolves topic slugs to algorithm ids', () => {
    expect(resolveAlgorithmId('sorting')).toBe('merge-sort');
    expect(resolveAlgorithmId('graphs')).toBe('dfs');
    expect(resolveAlgorithmId('bubble-sort')).toBe('bubble-sort');
  });
});

describe('Algorithm step engines', () => {
  const arrayAlgos = ALGORITHMS.filter((algo) => algo.renderer === 'array');

  it.each(arrayAlgos.map((algo) => [algo.id, algo]))(
    '%s generates steps with stats',
    (_id, algo) => {
      const { steps } = runAlgorithm(algo.id, algo.randomInput().join(','), { target: 42 });
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].description).toBeTruthy();
      expect(steps[0].stats).toMatchObject({
        comparisons: expect.any(Number),
        swaps: expect.any(Number),
        steps: expect.any(Number),
      });
      expect(steps.at(-1).stats.steps).toBe(steps.length);
    }
  );

  it('sorting algorithms finish sorted', () => {
    const { steps } = runAlgorithm('bubble-sort', '5, 1, 4, 2');
    const finalValues = steps.at(-1).state.values;
    expect(finalValues).toEqual([...finalValues].sort((a, b) => a - b));
  });

  it('binary search finds target in steps', () => {
    const { steps } = runAlgorithm('binary-search', '1, 2, 3, 4, 5', { target: 3 });
    const found = steps.some((step) => step.description.includes('found'));
    expect(found).toBe(true);
  });

  it('graph algorithms produce graph state', () => {
    const { steps } = runAlgorithm('bfs', '');
    expect(steps[0].state.type).toBe('graph');
    expect(steps[0].state.nodes.length).toBeGreaterThan(0);
  });

  it('tree algorithms produce tree state', () => {
    const { steps } = runAlgorithm('bst-insert', '50, 30, 70');
    expect(steps.at(-1).state.type).toBe('tree');
    expect(steps.at(-1).state.nodes.length).toBeGreaterThan(0);
  });

  it('floyd-warshall produces matrix state', () => {
    const { steps } = runAlgorithm('floyd-warshall', '');
    expect(steps[0].state.type).toBe('matrix');
    expect(steps.at(-1).state.values.length).toBeGreaterThan(0);
  });

  it('parses custom comma-separated input', () => {
    const { input } = runAlgorithm('merge-sort', '9, 1, 8, 2');
    expect(input).toEqual([9, 1, 8, 2]);
  });
});
