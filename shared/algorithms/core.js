export const initStats = () => ({ comparisons: 0, swaps: 0, steps: 0 });

export const cloneStats = (stats) => ({ ...stats });

export const pushArrayStep = (steps, stats, description, values, highlights = [], secondary = []) => {
  stats.steps += 1;
  steps.push({
    description,
    state: {
      type: 'array',
      values: [...values],
      highlights: [...highlights],
      secondary: [...secondary],
    },
    stats: cloneStats(stats),
  });
};

export const pushGraphStep = (steps, stats, description, graphState) => {
  stats.steps += 1;
  steps.push({
    description,
    state: {
      type: 'graph',
      ...graphState,
    },
    stats: cloneStats(stats),
  });
};

export const pushTreeStep = (steps, stats, description, treeState) => {
  stats.steps += 1;
  steps.push({
    description,
    state: {
      type: 'tree',
      ...treeState,
    },
    stats: cloneStats(stats),
  });
};

export const pushMatrixStep = (steps, stats, description, matrixState) => {
  stats.steps += 1;
  steps.push({
    description,
    state: {
      type: 'matrix',
      ...matrixState,
    },
    stats: cloneStats(stats),
  });
};

export const compare = (stats, a, b) => {
  stats.comparisons += 1;
  return a < b ? -1 : a > b ? 1 : 0;
};

export const swap = (stats, arr, i, j) => {
  if (i === j) return;
  [arr[i], arr[j]] = [arr[j], arr[i]];
  stats.swaps += 1;
};

export const randomArray = (size = 8, min = 5, max = 99) => {
  const length = Math.max(3, Math.min(size, 20));
  return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min);
};

export const randomArrayForRadix = (size = 8) =>
  Array.from({ length: Math.max(3, Math.min(size, 12)) }, () => Math.floor(Math.random() * 900) + 10);

export const randomFloatArray = (size = 8) =>
  Array.from({ length: Math.max(3, Math.min(size, 12)) }, () =>
    Number((Math.random() * 0.99 + 0.01).toFixed(2))
  );

export const parseNumberList = (input, fallback = [8, 3, 5, 1, 9, 2]) => {
  if (!input?.trim()) return [...fallback];
  const values = input
    .split(/[,\s]+/)
    .map((part) => Number(part.trim()))
    .filter((value) => Number.isFinite(value));
  return values.length >= 2 ? values : [...fallback];
};

export const parseWordList = (input, fallback = ['cat', 'car', 'card', 'care']) => {
  if (!input?.trim()) return [...fallback];
  const words = input
    .split(/[,\s]+/)
    .map((word) => word.trim().toLowerCase())
    .filter(Boolean);
  return words.length >= 1 ? words : [...fallback];
};

export const layoutTreeNodes = (root) => {
  if (!root) return [];

  const nodes = [];
  let xCounter = 0;
  const xGap = 72;
  const yGap = 96;

  const assign = (node, depth) => {
    if (!node) return;
    assign(node.left, depth + 1);
    const x = xCounter * xGap + 48;
    xCounter += 1;
    nodes.push({
      id: node.id,
      value: node.value,
      label: String(node.value),
      x,
      y: depth * yGap + 48,
      parentId: node.parentId ?? null,
      highlighted: node.highlighted ?? false,
      secondary: node.secondary ?? false,
    });
    assign(node.right, depth + 1);
  };

  assign(root, 0);
  return nodes;
};

export const DEFAULT_GRAPH = {
  nodes: [
    { id: 'A', label: 'A' },
    { id: 'B', label: 'B' },
    { id: 'C', label: 'C' },
    { id: 'D', label: 'D' },
    { id: 'E', label: 'E' },
  ],
  edges: [
    { id: 'A-B', source: 'A', target: 'B', weight: 4 },
    { id: 'A-C', source: 'A', target: 'C', weight: 2 },
    { id: 'B-D', source: 'B', target: 'D', weight: 3 },
    { id: 'C-D', source: 'C', target: 'D', weight: 1 },
    { id: 'C-E', source: 'C', target: 'E', weight: 5 },
    { id: 'D-E', source: 'D', target: 'E', weight: 2 },
  ],
  start: 'A',
  goal: 'E',
};

export const graphLayout = (nodes, edges, highlights = { nodes: [], edges: [] }, extra = {}) => {
  const positions = {
    A: { x: 80, y: 180 },
    B: { x: 260, y: 80 },
    C: { x: 260, y: 280 },
    D: { x: 440, y: 180 },
    E: { x: 620, y: 180 },
  };

  return {
    nodes: nodes.map((node) => ({
      ...node,
      x: positions[node.id]?.x ?? 0,
      y: positions[node.id]?.y ?? 0,
      highlighted: highlights.nodes.includes(node.id),
      visited: extra.visited?.includes(node.id) ?? false,
      distance: extra.distances?.[node.id],
    })),
    edges: edges.map((edge) => ({
      ...edge,
      highlighted: highlights.edges.includes(edge.id),
      inMst: extra.mstEdges?.includes(edge.id) ?? false,
    })),
    visited: extra.visited ?? [],
    path: extra.path ?? [],
    distances: extra.distances ?? {},
    queue: extra.queue ?? [],
    start: extra.start,
    goal: extra.goal,
  };
};
