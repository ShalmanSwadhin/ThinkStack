const CATEGORY_PATTERNS = {
  searching: [
    { test: /search for|using .* search/i, line: 2 },
    { test: /check index|inspect middle|jump to index|linear scan|probe/i, line: 5 },
    { test: /found at|target .* found/i, line: 8 },
    { test: /not found/i, line: 9 },
    { test: /right half|left half|next block|interpolation/i, line: 6 },
    { test: /block size|sorted array/i, line: 3 },
  ],
  sorting: [
    { test: /start|begin|initial/i, line: 2 },
    { test: /compare|checking|inspect/i, line: 5 },
    { test: /swap|swapping|exchange/i, line: 6 },
    { test: /merge|partition|heapify|insert|select minimum|place element/i, line: 7 },
    { test: /sorted|complete|finished|done/i, line: 10 },
    { test: /pass|outer|inner|pivot/i, line: 4 },
  ],
  trees: [
    { test: /insert|add node|create node/i, line: 3 },
    { test: /rotate|balance|rebalance|avl/i, line: 6 },
    { test: /search|traverse|visit/i, line: 5 },
    { test: /delete|remove/i, line: 8 },
    { test: /trie|prefix|character/i, line: 4 },
    { test: /root|empty tree/i, line: 2 },
  ],
  graphs: [
    { test: /start|initialize|source|goal/i, line: 2 },
    { test: /visit|explore|dequeue|enqueue|push|pop/i, line: 5 },
    { test: /edge|neighbor|adjacent|relax/i, line: 6 },
    { test: /distance|shortest|path found/i, line: 8 },
    { test: /mst|spanning|kruskal|prim/i, line: 7 },
    { test: /visited|mark|complete/i, line: 9 },
  ],
};

const ALGORITHM_PATTERNS = {
  'linear-search': [
    { test: /search for/i, line: 3 },
    { test: /check index/i, line: 5 },
    { test: /found at/i, line: 7 },
    { test: /not found/i, line: 9 },
  ],
  'binary-search': [
    { test: /binary search/i, line: 3 },
    { test: /inspect middle/i, line: 6 },
    { test: /right half/i, line: 9 },
    { test: /left half/i, line: 11 },
    { test: /found at/i, line: 7 },
    { test: /not found/i, line: 13 },
  ],
  'bubble-sort': [
    { test: /bubble sort/i, line: 2 },
    { test: /compare/i, line: 5 },
    { test: /swap/i, line: 6 },
    { test: /sorted|complete/i, line: 9 },
  ],
  'merge-sort': [
    { test: /merge sort/i, line: 2 },
    { test: /divide|split/i, line: 4 },
    { test: /merge/i, line: 8 },
    { test: /compare/i, line: 9 },
  ],
  'quick-sort': [
    { test: /quick sort/i, line: 2 },
    { test: /pivot/i, line: 5 },
    { test: /partition/i, line: 6 },
    { test: /swap/i, line: 7 },
  ],
  dfs: [
    { test: /dfs|depth/i, line: 2 },
    { test: /visit/i, line: 5 },
    { test: /backtrack|return/i, line: 8 },
  ],
  bfs: [
    { test: /bfs|breadth/i, line: 2 },
    { test: /enqueue|dequeue|visit/i, line: 6 },
  ],
  dijkstra: [
    { test: /dijkstra|initialize distances/i, line: 2 },
    { test: /relax|edge/i, line: 7 },
    { test: /extract minimum|select/i, line: 5 },
  ],
  'bst-insert': [
    { test: /insert/i, line: 3 },
    { test: /go left|left/i, line: 6 },
    { test: /go right|right/i, line: 8 },
  ],
  'avl-insert': [
    { test: /insert/i, line: 3 },
    { test: /balance|rotate/i, line: 10 },
  ],
  'trie-insert': [
    { test: /insert|character|prefix/i, line: 4 },
    { test: /end of word|mark/i, line: 7 },
  ],
};

export const inferCodeLine = (algorithmId, category, description, stepIndex, totalSteps) => {
  const text = description ?? '';
  const specific = ALGORITHM_PATTERNS[algorithmId] ?? [];
  const categoryRules = CATEGORY_PATTERNS[category] ?? [];

  for (const rule of [...specific, ...categoryRules]) {
    if (rule.test.test(text)) return rule.line;
  }

  if (stepIndex === 0) return 1;
  if (stepIndex === totalSteps - 1) return 10;
  return Math.min(2 + (stepIndex % 7), 9);
};

export const enrichStepsWithCodeSync = (algorithmId, category, steps) => {
  const total = steps.length;
  return steps.map((step, index) => ({
    ...step,
    codeLine: step.codeLine ?? inferCodeLine(algorithmId, category, step.description, index, total),
  }));
};

export default { inferCodeLine, enrichStepsWithCodeSync };
