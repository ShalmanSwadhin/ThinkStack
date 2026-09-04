import { getAlgorithmCode, transformPseudocodeLines } from '../algorithms/codeSync/templates.js';

export const TOPIC_CODE_LANGUAGES = [
  { id: 'python', label: 'Python' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'java', label: 'Java' },
  { id: 'cpp', label: 'C++' },
  { id: 'c', label: 'C' },
];

const TOPIC_CODE_CONFIG = {
  arrays: {
    title: 'Array Fundamentals',
    explanation:
      'Demonstrates O(1) index access and O(n) traversal — the two core patterns every array algorithm builds on.',
    lines: [
      '// Array fundamentals — access, traverse, and aggregate',
      'function arrayBasics(nums):',
      '    // O(1) — random access by index',
      '    if length(nums) == 0: return null',
      '    first = nums[0]',
      '    last = nums[length(nums) - 1]',
      '    // O(n) — iterate to compute sum',
      '    total = 0',
      '    for each value in nums:',
      '        total += value',
      '    // O(n) — find maximum element',
      '    maxVal = nums[0]',
      '    for i from 1 to length(nums) - 1:',
      '        if nums[i] > maxVal: maxVal = nums[i]',
      '    return { first, last, total, maxVal }',
    ],
  },
  strings: {
    title: 'String Processing',
    explanation:
      'Shows character access, substring extraction, and a two-pointer palindrome check — common string interview patterns.',
    lines: [
      '// String operations — access, slice, and two-pointer check',
      'function stringBasics(text):',
      '    // O(1) — access character at index',
      '    firstChar = text[0]',
      '    // O(k) — extract substring',
      '    prefix = text[0..2]',
      '    // O(n) — two-pointer palindrome check',
      '    left = 0',
      '    right = length(text) - 1',
      '    while left < right:',
      '        if text[left] != text[right]: return false',
      '        left += 1',
      '        right -= 1',
      '    return true',
    ],
  },
  searching: {
    algorithmId: 'binary-search',
    category: 'searching',
    explanation:
      'Binary search repeatedly halves a sorted array — O(log n) time. Requires the input to be sorted.',
  },
  sorting: {
    algorithmId: 'merge-sort',
    category: 'sorting',
    explanation:
      'Merge sort divides the array in half, sorts each part recursively, then merges — O(n log n) and stable.',
  },
  recursion: {
    title: 'Recursion — Factorial',
    explanation:
      'Every recursive call needs a base case and a smaller subproblem. Here, n! = n × (n−1)!.',
    lines: [
      '// Recursive factorial with base case',
      'function factorial(n):',
      '    // Base case — stop recursion',
      '    if n <= 1: return 1',
      '    // Recursive step — smaller subproblem',
      '    return n * factorial(n - 1)',
    ],
  },
  'linked-lists': {
    title: 'Linked List Traversal',
    explanation:
      'Nodes hold a value and a next pointer. Traversal follows next until null — O(n) time, O(1) extra space.',
    lines: [
      '// Singly linked list — traverse and count nodes',
      'function traverse(head):',
      '    count = 0',
      '    current = head',
      '    // Walk the chain of next pointers',
      '    while current is not null:',
      '        count += 1',
      '        current = current.next',
      '    return count',
    ],
  },
  stacks: {
    title: 'Stack (LIFO)',
    explanation:
      'Push adds to the top; pop removes from the top. Arrays or linked lists both work — all operations are O(1).',
    lines: [
      '// Stack using array — push and pop from end',
      'function stackDemo():',
      '    stack = empty array',
      '    // Push — add to top',
      '    stack.push(10)',
      '    stack.push(20)',
      '    // Pop — remove from top',
      '    top = stack.pop()',
      '    // Peek — view top without removing',
      '    peek = stack[ length(stack) - 1 ]',
      '    return { top, peek, stack }',
    ],
  },
  queues: {
    title: 'Queue (FIFO)',
    explanation:
      'Enqueue adds at the back; dequeue removes from the front. Used in BFS, task scheduling, and buffering.',
    lines: [
      '// Queue — enqueue at back, dequeue from front',
      'function queueDemo():',
      '    queue = empty array',
      '    // Enqueue — add to back',
      '    queue.push("first")',
      '    queue.push("second")',
      '    // Dequeue — remove from front',
      '    front = queue[0]',
      '    queue = queue[1..end]',
      '    return { front, queue }',
    ],
  },
  deques: {
    title: 'Deque (Double-Ended Queue)',
    explanation:
      'Supports O(1) insert and delete at both ends — useful for sliding-window and palindrome problems.',
    lines: [
      '// Deque — add/remove from both ends',
      'function dequeDemo():',
      '    deque = empty array',
      '    // Add to front and back',
      '    deque.unshift(1)',
      '    deque.push(2)',
      '    // Remove from front and back',
      '    front = deque.shift()',
      '    back = deque.pop()',
      '    return { front, back, deque }',
    ],
  },
  'hash-tables': {
    title: 'Hash Table Lookup',
    explanation:
      'Average O(1) insert and lookup using a hash function. Handles collisions with chaining or open addressing.',
    lines: [
      '// Hash map — insert, lookup, and frequency count',
      'function hashTableDemo(items):',
      '    freq = empty map',
      '    for each item in items:',
      '        // Increment count or initialize to 1',
      '        if item in freq:',
      '            freq[item] += 1',
      '        else:',
      '            freq[item] = 1',
      '    // O(1) average lookup',
      '    return freq[items[0]]',
    ],
  },
  heaps: {
    title: 'Min-Heap Operations',
    explanation:
      'A min-heap keeps the smallest element at the root. Insert and extract-min are O(log n).',
    lines: [
      '// Min-heap — push and pop smallest element',
      'function heapDemo(values):',
      '    heap = buildMinHeap(values)',
      '    // Peek minimum — O(1)',
      '    minVal = heap[0]',
      '    // Extract-min — O(log n)',
      '    heap = extractMin(heap)',
      '    // Insert — O(log n)',
      '    heap = insert(heap, 3)',
      '    return { minVal, heap }',
    ],
  },
  'priority-queues': {
    title: 'Priority Queue',
    explanation:
      'Always returns the highest (or lowest) priority item next. Typically implemented with a binary heap.',
    lines: [
      '// Priority queue — dequeue highest priority first',
      'function priorityQueueDemo(tasks):',
      '    pq = buildMaxHeap(tasks by priority)',
      '    // Dequeue highest priority task',
      '    next = pq.extractMax()',
      '    // Insert new task with priority',
      '    pq.insert(newTask, priority=5)',
      '    return next',
    ],
  },
  trees: {
    title: 'Tree Traversal (Inorder)',
    explanation:
      'Inorder visits left subtree, current node, then right subtree. For BSTs this yields sorted order.',
    lines: [
      '// Inorder traversal — left, node, right',
      'function inorder(root, result):',
      '    if root is null: return',
      '    // Visit left subtree first',
      '    inorder(root.left, result)',
      '    // Process current node',
      '    result.append(root.value)',
      '    // Visit right subtree',
      '    inorder(root.right, result)',
    ],
  },
  'binary-search-trees': {
    algorithmId: 'bst-insert',
    category: 'trees',
    explanation:
      'BST property: left < node < right. Search and insert are O(h) where h is tree height.',
  },
  'avl-trees': {
    algorithmId: 'avl-insert',
    category: 'trees',
    explanation:
      'AVL trees self-balance after insert using rotations, keeping height O(log n) for guaranteed performance.',
  },
  'red-black-trees': {
    title: 'Red-Black Tree Insert (Concept)',
    explanation:
      'Red-black trees enforce color rules to stay balanced. After insert, recolor and rotate fix violations.',
    lines: [
      '// Red-black insert — BST insert then fix-up',
      'function rbInsert(root, value):',
      '    // Standard BST insert, new node is red',
      '    root = bstInsert(root, value, color=RED)',
      '    // Fix red-red violations with recolor/rotate',
      '    if hasRedRedViolation(root):',
      '        root = fixViolation(root)',
      '    // Root must always be black',
      '    root.color = BLACK',
      '    return root',
    ],
  },
  trie: {
    algorithmId: 'trie-insert',
    category: 'trees',
    explanation:
      'Trie stores strings character-by-character. Great for prefix search, autocomplete, and spell checking.',
  },
  graphs: {
    algorithmId: 'bfs',
    category: 'graphs',
    explanation:
      'BFS explores a graph level by level using a queue — finds shortest paths in unweighted graphs.',
  },
  'dynamic-programming': {
    title: 'Dynamic Programming — Fibonacci',
    explanation:
      'Store subproblem results to avoid recomputation. Bottom-up builds from base cases iteratively.',
    lines: [
      '// Bottom-up DP — Fibonacci with memo table',
      'function fibDP(n):',
      '    if n <= 1: return n',
      '    // dp[i] = i-th Fibonacci number',
      '    dp = array of size n + 1',
      '    dp[0] = 0',
      '    dp[1] = 1',
      '    for i from 2 to n:',
      '        dp[i] = dp[i - 1] + dp[i - 2]',
      '    return dp[n]',
    ],
  },
  greedy: {
    title: 'Greedy — Coin Change',
    explanation:
      'Greedy picks the locally optimal choice at each step. Works when the coin system is canonical (e.g. US coins).',
    lines: [
      '// Greedy coin change — always take largest coin first',
      'function coinChangeGreedy(amount, coins):',
      '    sort coins descending',
      '    count = 0',
      '    for each coin in coins:',
      '        // Use as many of this coin as possible',
      '        while amount >= coin:',
      '            amount -= coin',
      '            count += 1',
      '    return count',
    ],
  },
  backtracking: {
    title: 'Backtracking — Subsets',
    explanation:
      'Try a choice, recurse, then undo (backtrack). Generates all subsets by including or excluding each element.',
    lines: [
      '// Generate all subsets via backtracking',
      'function subsets(nums, index, path, result):',
      '    // Record current subset',
      '    result.append(copy of path)',
      '    for i from index to length(nums) - 1:',
      '        // Choose nums[i]',
      '        path.append(nums[i])',
      '        // Explore with this choice',
      '        subsets(nums, i + 1, path, result)',
      '        // Undo choice — backtrack',
      '        path.removeLast()',
    ],
  },
  'bit-manipulation': {
    title: 'Bit Manipulation Basics',
    explanation:
      'Bitwise operators work on individual bits. Common tricks: check odd/even, set/clear/toggle a bit.',
    lines: [
      '// Core bitwise operations on integer n',
      'function bitOps(n):',
      '    // Check if bit i is set',
      '    isSet = (n and (1 << i)) != 0',
      '    // Set bit i',
      '    setBit = n or (1 << i)',
      '    // Clear bit i',
      '    clearBit = n and not (1 << i)',
      '    // Toggle bit i',
      '    toggleBit = n xor (1 << i)',
      '    return { isSet, setBit, clearBit, toggleBit }',
    ],
  },
};

export function getTopicCodeSource(slug, language = 'python') {
  const config = TOPIC_CODE_CONFIG[slug];
  if (!config) {
    return null;
  }

  if (config.algorithmId) {
    const algorithmCode = getAlgorithmCode(config.algorithmId, language, config.category);
    return {
      title: algorithmCode.name,
      source: algorithmCode.source,
      explanation: config.explanation,
    };
  }

  const lines = transformPseudocodeLines(config.lines, language);

  return {
    title: config.title,
    source: lines.join('\n'),
    explanation: config.explanation,
  };
}

export function hasTopicCodeExamples(slug) {
  return Boolean(TOPIC_CODE_CONFIG[slug]);
}

export default { TOPIC_CODE_LANGUAGES, getTopicCodeSource, hasTopicCodeExamples };
