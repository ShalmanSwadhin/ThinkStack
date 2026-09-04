import { getAlgorithmSource } from './algorithmSources.js';

const BASE_TEMPLATES = {
  'linear-search': {
    name: 'Linear Search',
    lines: [
      '// Linear Search — scan each element until target is found',
      'function linearSearch(array, target):',
      '    // Iterate through every index in the array',
      '    for i from 0 to length(array) - 1:',
      '        // Compare current element with target',
      '        if array[i] == target:',
      '            // Target found — return its index',
      '            return i',
      '    // Target was not present in the array',
      '    return -1',
    ],
  },
  'binary-search': {
    name: 'Binary Search',
    lines: [
      '// Binary Search — requires a sorted array',
      'function binarySearch(array, target):',
      '    low = 0',
      '    high = length(array) - 1',
      '    while low <= high:',
      '        // Find the middle index',
      '        mid = floor((low + high) / 2)',
      '        if array[mid] == target:',
      '            return mid',
      '        // Target is in the right half',
      '        else if array[mid] < target:',
      '            low = mid + 1',
      '        // Target is in the left half',
      '        else:',
      '            high = mid - 1',
      '    return -1',
    ],
  },
  'jump-search': {
    name: 'Jump Search',
    lines: [
      '// Jump Search — block-based search on sorted array',
      'function jumpSearch(array, target):',
      '    n = length(array)',
      '    step = floor(sqrt(n))',
      '    prev = 0',
      '    // Jump ahead in blocks until value >= target',
      '    while array[min(step, n) - 1] < target:',
      '        prev = step',
      '        step += floor(sqrt(n))',
      '        if prev >= n: return -1',
      '    // Linear scan within the current block',
      '    for i from prev to min(step, n) - 1:',
      '        if array[i] == target: return i',
      '    return -1',
    ],
  },
  'interpolation-search': {
    name: 'Interpolation Search',
    lines: [
      '// Interpolation Search — estimate position in sorted array',
      'function interpolationSearch(array, target):',
      '    low = 0',
      '    high = length(array) - 1',
      '    while low <= high and target >= array[low] and target <= array[high]:',
      '        // Estimate probe index using interpolation formula',
      '        pos = low + ((target - array[low]) * (high - low)) / (array[high] - array[low])',
      '        if array[pos] == target: return pos',
      '        if array[pos] < target: low = pos + 1',
      '        else: high = pos - 1',
      '    return -1',
    ],
  },
  'bubble-sort': {
    name: 'Bubble Sort',
    lines: [
      '// Bubble Sort — repeatedly swap adjacent out-of-order elements',
      'function bubbleSort(array):',
      '    n = length(array)',
      '    for i from 0 to n - 1:',
      '        for j from 0 to n - i - 2:',
      '            // Compare adjacent values',
      '            if array[j] > array[j + 1]:',
      '                // Swap adjacent values',
      '                swap(array[j], array[j + 1])',
      '    return array',
    ],
  },
  'selection-sort': {
    name: 'Selection Sort',
    lines: [
      '// Selection Sort — place smallest element at each position',
      'function selectionSort(array):',
      '    n = length(array)',
      '    for i from 0 to n - 1:',
      '        minIndex = i',
      '        for j from i + 1 to n - 1:',
      '            // Find minimum in unsorted portion',
      '            if array[j] < array[minIndex]: minIndex = j',
      '        // Swap minimum into position i',
      '        swap(array[i], array[minIndex])',
      '    return array',
    ],
  },
  'insertion-sort': {
    name: 'Insertion Sort',
    lines: [
      '// Insertion Sort — build sorted portion one element at a time',
      'function insertionSort(array):',
      '    for i from 1 to length(array) - 1:',
      '        key = array[i]',
      '        j = i - 1',
      '        // Shift larger elements to the right',
      '        while j >= 0 and array[j] > key:',
      '            array[j + 1] = array[j]',
      '            j = j - 1',
      '        // Insert key at correct position',
      '        array[j + 1] = key',
      '    return array',
    ],
  },
  'merge-sort': {
    name: 'Merge Sort',
    lines: [
      '// Merge Sort — divide array into halves, merge sorted parts',
      'function mergeSort(array):',
      '    if length(array) <= 1: return array',
      '    // Divide array into two halves',
      '    mid = floor(length(array) / 2)',
      '    left = mergeSort(array[0..mid])',
      '    right = mergeSort(array[mid..end])',
      '    return merge(left, right)',
      'function merge(left, right):',
      '    // Compare and merge two sorted arrays',
      '    while left and right not empty:',
      '        take smaller front element into result',
      '    return combined result',
    ],
  },
  'quick-sort': {
    name: 'Quick Sort',
    lines: [
      '// Quick Sort — partition around pivot, recurse on halves',
      'function quickSort(array, low, high):',
      '    if low < high:',
      '        // Choose pivot and partition array',
      '        pivotIndex = partition(array, low, high)',
      '        quickSort(array, low, pivotIndex - 1)',
      '        quickSort(array, pivotIndex + 1, high)',
      'function partition(array, low, high):',
      '    pivot = array[high]',
      '    i = low - 1',
      '    for j from low to high - 1:',
      '        if array[j] <= pivot:',
      '            i += 1; swap(array[i], array[j])',
      '    swap(array[i + 1], array[high])',
      '    return i + 1',
    ],
  },
  'heap-sort': {
    name: 'Heap Sort',
    lines: [
      '// Heap Sort — build max heap, repeatedly extract maximum',
      'function heapSort(array):',
      '    n = length(array)',
      '    // Build max heap from array',
      '    for i from floor(n/2) - 1 down to 0:',
      '        heapify(array, n, i)',
      '    for i from n - 1 down to 1:',
      '        swap(array[0], array[i])',
      '        heapify(array, i, 0)',
      '    return array',
    ],
  },
  dfs: {
    name: 'Depth-First Search',
    lines: [
      '// DFS — explore as deep as possible before backtracking',
      'function dfs(graph, start):',
      '    visited = empty set',
      '    stack = [start]',
      '    while stack not empty:',
      '        // Visit next node from stack',
      '        node = stack.pop()',
      '        if node in visited: continue',
      '        mark node as visited',
      '        for each neighbor of node:',
      '            if neighbor not in visited:',
      '                stack.push(neighbor)',
      '    return visited',
    ],
  },
  bfs: {
    name: 'Breadth-First Search',
    lines: [
      '// BFS — explore level by level using a queue',
      'function bfs(graph, start):',
      '    visited = empty set',
      '    queue = [start]',
      '    visited.add(start)',
      '    while queue not empty:',
      '        // Dequeue and visit front node',
      '        node = queue.dequeue()',
      '        for each neighbor of node:',
      '            if neighbor not in visited:',
      '                visited.add(neighbor)',
      '                queue.enqueue(neighbor)',
      '    return visited',
    ],
  },
  dijkstra: {
    name: "Dijkstra's Algorithm",
    lines: [
      "// Dijkstra — shortest paths from source in weighted graph",
      'function dijkstra(graph, source):',
      '    // Initialize distances to infinity',
      '    dist[source] = 0',
      '    priorityQueue = all nodes by dist',
      '    while queue not empty:',
      '        // Extract node with minimum distance',
      '        u = queue.extractMin()',
      '        for each edge (u, v) with weight w:',
      '            // Relax edge if shorter path found',
      '            if dist[u] + w < dist[v]:',
      '                dist[v] = dist[u] + w',
      '    return dist',
    ],
  },
  'bst-insert': {
    name: 'BST Insert',
    lines: [
      '// Binary Search Tree — insert maintaining BST property',
      'function insert(root, value):',
      '    if root is null: return new Node(value)',
      '    // Compare value with current node',
      '    if value < root.value:',
      '        // Go to left subtree',
      '        root.left = insert(root.left, value)',
      '    else if value > root.value:',
      '        // Go to right subtree',
      '        root.right = insert(root.right, value)',
      '    return root',
    ],
  },
  'avl-insert': {
    name: 'AVL Insert',
    lines: [
      '// AVL Tree — insert then rebalance if needed',
      'function avlInsert(node, value):',
      '    // Standard BST insert',
      '    if node is null: return new Node(value)',
      '    if value < node.value: node.left = avlInsert(node.left, value)',
      '    else: node.right = avlInsert(node.right, value)',
      '    // Update height and balance factor',
      '    balance = height(node.left) - height(node.right)',
      '    // Perform rotation to restore balance',
      '    if balance > 1: return rotateRight(node)',
      '    if balance < -1: return rotateLeft(node)',
      '    return node',
    ],
  },
  'trie-insert': {
    name: 'Trie Insert',
    lines: [
      '// Trie — insert word character by character',
      'function trieInsert(root, word):',
      '    node = root',
      '    for each character in word:',
      '        // Move to child or create new node',
      '        if character not in node.children:',
      '            node.children[character] = new TrieNode()',
      '        node = node.children[character]',
      '    // Mark end of word',
      '    node.isEndOfWord = true',
      '    return root',
    ],
  },
};

const GENERIC_TEMPLATES = {
  searching: [
    '// Search algorithm',
    'function search(array, target):',
    '    // Initialize search boundaries',
    '    initialize pointers and state',
    '    while search continues:',
    '        // Inspect current candidate element',
    '        compare or probe current position',
    '        if target found: return index',
    '        // Move search window forward',
    '        update search boundaries',
    '    return -1',
  ],
  sorting: [
    '// Sorting algorithm',
    'function sort(array):',
    '    n = length(array)',
    '    // Outer loop over passes or partitions',
    '    for each pass or partition:',
    '        // Compare elements in current window',
    '        if out of order: swap elements',
    '        // Merge, insert, or heapify as needed',
    '        update sorted portion',
    '    return sorted array',
  ],
  trees: [
    '// Tree algorithm',
    'function treeOperation(root, value):',
    '    if root is null: handle base case',
    '    // Traverse or compare at current node',
    '    process current node',
    '    // Recurse into left or right subtree',
    '    update child pointers',
    '    // Rebalance or mark if needed',
    '    return updated root',
  ],
  graphs: [
    '// Graph algorithm',
    'function graphAlgorithm(graph, start):',
    '    // Initialize visited set and distances',
    '    initialize state structures',
    '    while nodes or edges remain:',
    '        // Visit or relax next node/edge',
    '        process current node',
    '        // Update neighbors or queue',
    '        enqueue or relax adjacent nodes',
    '    return result',
  ],
};

const LANGUAGE_TRANSFORMS = {
  python: (lines) =>
    lines.map((line) =>
      line
        .replace(/^function (\w+)\((.*?)\):/, 'def $1($2):')
        .replace(/^    for i from (\d+) to (.+):/, '    for i in range($1, $2 + 1):')
        .replace(/^    for j from (.+) to (.+):/, '    for j in range($1, $2 + 1):')
        .replace(/^    for each (.+) in (.+):/, '    for $1 in $2:')
        .replace(/^    while (.+):/, '    while $1:')
        .replace(/^    if (.+):/, '    if $1:')
        .replace(/^    else if (.+):/, '    elif $1:')
        .replace(/^    else:/, '    else:')
        .replace(/^    return (.+)/, '    return $1')
        .replace(/^    (.+) = (.+)/, '    $1 = $2')
        .replace(/^function (\w+)\((.*?)\):$/, 'def $1($2):')
    ),
  javascript: (lines) =>
    lines.map((line) =>
      line
        .replace(/^function (\w+)\((.*?)\):/, 'function $1($2) {')
        .replace(/^    for i from (\d+) to (.+):/, '  for (let i = $1; i <= $2; i++) {')
        .replace(/^    for j from (.+) to (.+):/, '  for (let j = $1; j <= $2; j++) {')
        .replace(/^    for each (.+) in (.+):/, '  for (const $1 of $2) {')
        .replace(/^    while (.+):/, '  while ($1) {')
        .replace(/^    if (.+):/, '  if ($1) {')
        .replace(/^    else if (.+):/, '  } else if ($1) {')
        .replace(/^    else:/, '  } else {')
        .replace(/^    return (.+)/, '  return $1;')
        .replace(/^    (.+) = (.+)/, '  $1 = $2;')
    ),
  java: (lines) =>
    lines.map((line, i) => {
      if (i === 0) return line.replace('//', '//');
      if (line.startsWith('function ')) {
        const match = line.match(/^function (\w+)\((.*?)\):/);
        if (match) return `    public static int ${match[1]}(${match[2].replace(/array/g, 'int[] arr')}) {`;
      }
      return `        ${line.replace(/^    /, '').replace(/:$/, ' {').replace(/^if /, 'if (').replace(/^while /, 'while (')}`;
    }),
  c: (lines) =>
    lines.map((line, i) => {
      if (i === 0) return line;
      if (line.startsWith('function ')) {
        const match = line.match(/^function (\w+)\((.*?)\):/);
        if (match) return `int ${match[1]}(${match[2]}) {`;
      }
      return `    ${line.replace(/^    /, '').replace(/:$/, ' {')};`;
    }),
  cpp: (lines) =>
    LANGUAGE_TRANSFORMS.c(lines).map((l) => l.replace(/^int /, 'auto ')),
  csharp: (lines) =>
    lines.map((line) => {
      if (line.startsWith('function ')) {
        const match = line.match(/^function (\w+)\((.*?)\):/);
        if (match) return `    static int ${match[1]}(${match[2]}) {`;
      }
      return line.replace(/^    /, '        ');
    }),
  go: (lines) =>
    lines.map((line) => {
      if (line.startsWith('function ')) {
        const match = line.match(/^function (\w+)\((.*?)\):/);
        if (match) return `func ${match[1]}(${match[2]}) int {`;
      }
      return line.replace(/^    /, '\t');
    }),
  rust: (lines) =>
    lines.map((line) => {
      if (line.startsWith('function ')) {
        const match = line.match(/^function (\w+)\((.*?)\):/);
        if (match) return `fn ${match[1]}(${match[2]}) -> i32 {`;
      }
      return line.replace(/^    /, '    ');
    }),
  kotlin: (lines) =>
    lines.map((line) => {
      if (line.startsWith('function ')) {
        const match = line.match(/^function (\w+)\((.*?)\):/);
        if (match) return `fun ${match[1]}(${match[2]}): Int {`;
      }
      return line.replace(/^    /, '    ');
    }),
};

export const transformPseudocodeLines = (lines, language = 'pseudocode') => {
  if (language === 'pseudocode') {
    return lines;
  }

  if (LANGUAGE_TRANSFORMS[language]) {
    return LANGUAGE_TRANSFORMS[language](lines);
  }

  return lines;
};

export const getAlgorithmCode = (algorithmId, language = 'python', category = 'sorting') => {
  const base = BASE_TEMPLATES[algorithmId] ?? {
    name: algorithmId,
    lines: GENERIC_TEMPLATES[category] ?? GENERIC_TEMPLATES.sorting,
  };

  const source =
    language === 'pseudocode'
      ? base.lines.join('\n')
      : getAlgorithmSource(algorithmId, language, category, base.name);

  const lineCount = source.split('\n').length;

  return {
    algorithmId,
    language,
    name: base.name,
    source,
    lineCount,
  };
};

export const getStepCodeExplanation = (step, algorithmName) => {
  if (step?.explanation && typeof step.explanation === 'object') {
    return step.explanation;
  }
  if (step?.currentExplanation && typeof step.currentExplanation === 'object') {
    return step.currentExplanation;
  }

  const desc = step?.description ?? 'Executing algorithm step.';
  const vars = step?.variables ?? step?.currentVariables ?? {};
  const varSummary = Object.entries(vars)
    .filter(([key]) => !['array', 'distances'].includes(key))
    .slice(0, 4)
    .map(([key, val]) => `${key} = ${val}`)
    .join(', ');

  return {
    what: desc,
    why: varSummary
      ? `This step updates ${algorithmName} state (${varSummary}) to progress toward the correct result.`
      : `This step advances the ${algorithmName} algorithm toward its goal by updating the internal state based on the current data.`,
    how: 'The highlighted line performs the operation described in the step message.',
    when: 'This runs whenever the algorithm reaches this point in its execution flow.',
  };
};

export default { getAlgorithmCode, getStepCodeExplanation, BASE_TEMPLATES };
