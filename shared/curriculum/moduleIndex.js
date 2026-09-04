/**
 * Curriculum module index — id, title, and category for navigation UI.
 * Full lesson lists live in backend seed curriculum/modules.js.
 */
export const MODULE_INDEX = [
  { id: 'intro-to-programming', title: 'Introduction to Programming', category: 'fundamentals' },
  { id: 'programming-basics', title: 'Programming Basics', category: 'fundamentals' },
  { id: 'variables-data-types', title: 'Variables and Data Types', category: 'fundamentals' },
  { id: 'operators-expressions', title: 'Operators and Expressions', category: 'fundamentals' },
  { id: 'input-output', title: 'Input and Output', category: 'fundamentals' },
  { id: 'conditionals', title: 'Conditionals', category: 'fundamentals' },
  { id: 'loops', title: 'Loops', category: 'fundamentals' },
  { id: 'functions', title: 'Functions', category: 'fundamentals' },
  { id: 'recursion-fundamentals', title: 'Recursion Fundamentals', category: 'fundamentals' },
  { id: 'memory-pointers', title: 'Memory and Pointers', category: 'fundamentals' },
  { id: 'arrays-fundamentals', title: 'Arrays Fundamentals', category: 'fundamentals' },
  { id: 'strings-fundamentals', title: 'Strings Fundamentals', category: 'fundamentals' },
  { id: 'matrices', title: 'Matrices', category: 'fundamentals' },
  { id: 'complexity-analysis', title: 'Complexity Analysis', category: 'fundamentals' },
  { id: 'searching-algorithms', title: 'Searching Algorithms', category: 'fundamentals' },
  { id: 'sorting-algorithms', title: 'Sorting Algorithms', category: 'fundamentals' },
  { id: 'bit-manipulation', title: 'Bit Manipulation', category: 'advanced' },
  { id: 'hashing-fundamentals', title: 'Hashing Fundamentals', category: 'linear' },
  { id: 'two-pointer-sliding-window', title: 'Two Pointer and Sliding Window', category: 'fundamentals' },
  { id: 'prefix-sum-binary-search', title: 'Prefix Sum and Binary Search', category: 'fundamentals' },
  { id: 'greedy-techniques', title: 'Greedy Techniques', category: 'advanced' },
  { id: 'divide-and-conquer', title: 'Divide and Conquer', category: 'advanced' },
  { id: 'backtracking', title: 'Backtracking', category: 'advanced' },
  { id: 'dynamic-programming', title: 'Dynamic Programming', category: 'advanced' },
  { id: 'linked-lists', title: 'Linked Lists', category: 'linear' },
  { id: 'stacks-queues', title: 'Stacks and Queues', category: 'linear' },
  { id: 'hash-tables-maps', title: 'Hash Tables and Maps', category: 'linear' },
  { id: 'trees-fundamentals', title: 'Trees Fundamentals', category: 'trees' },
  { id: 'bst-balanced-trees', title: 'BST and Balanced Trees', category: 'trees' },
  { id: 'heap-priority-queue', title: 'Heap and Priority Queue', category: 'linear' },
  { id: 'trie-segment-fenwick', title: 'Trie Segment and Fenwick Trees', category: 'trees' },
  { id: 'union-find', title: 'Union Find', category: 'graphs' },
  { id: 'graphs-fundamentals', title: 'Graphs Fundamentals', category: 'graphs' },
  { id: 'graph-traversal', title: 'Graph Traversal', category: 'graphs' },
  { id: 'shortest-path-algorithms', title: 'Shortest Path Algorithms', category: 'graphs' },
  { id: 'mst-graph-advanced', title: 'MST and Advanced Graphs', category: 'graphs' },
  { id: 'string-algorithms-advanced', title: 'Advanced String Algorithms', category: 'advanced' },
  { id: 'number-theory-math', title: 'Number Theory and Math', category: 'advanced' },
  { id: 'game-theory-geometry', title: 'Game Theory and Geometry', category: 'advanced' },
  { id: 'interview-prep-mastery', title: 'Interview Preparation Mastery', category: 'advanced' },
];

export const CATEGORY_LABELS = {
  fundamentals: 'Fundamentals',
  linear: 'Linear Structures',
  trees: 'Trees & Heaps',
  graphs: 'Graphs',
  advanced: 'Advanced Topics',
};

export const CATEGORY_ORDER = ['fundamentals', 'linear', 'trees', 'graphs', 'advanced'];

export default MODULE_INDEX;
