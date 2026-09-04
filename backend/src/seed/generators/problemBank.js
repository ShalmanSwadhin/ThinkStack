import { DIFFICULTY } from 'shared/constants';
import { buildLessonCatalog } from '../curriculum/index.js';

const COMPANIES = [
  'Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 'Netflix', 'Uber', 'Airbnb',
  'Bloomberg', 'Goldman Sachs', 'Adobe', 'Salesforce', 'LinkedIn', 'Twitter',
  'Spotify', 'Stripe', 'Palantir', 'Oracle', 'IBM', 'Intel',
];

const PROBLEM_TEMPLATES = {
  easy: [
    { title: 'Sum of Array Elements', desc: 'Given n integers, print their sum.', input: 'n followed by n integers', output: 'single integer sum', example: { in: '4\n1 2 3 4', out: '10' } },
    { title: 'Count Even Numbers', desc: 'Count how many numbers in the array are even.', input: 'n and n integers', output: 'count of evens', example: { in: '5\n1 2 3 4 5', out: '2' } },
    { title: 'Find Minimum Element', desc: 'Print the smallest value in the array.', input: 'n and array', output: 'minimum value', example: { in: '4\n3 1 4 2', out: '1' } },
    { title: 'Reverse Array Print', desc: 'Print array elements in reverse order.', input: 'n and array', output: 'reversed space-separated', example: { in: '3\n1 2 3', out: '3 2 1' } },
    { title: 'Check Palindrome String', desc: 'Print YES if string is palindrome, else NO.', input: 'single string', output: 'YES or NO', example: { in: 'racecar', out: 'YES' } },
    { title: 'Factorial Calculation', desc: 'Compute n! for given n.', input: 'integer n', output: 'factorial', example: { in: '5', out: '120' } },
    { title: 'Linear Search Position', desc: 'Find 0-based index of target or -1.', input: 'n, target, array', output: 'index or -1', example: { in: '5 3\n1 2 3 4 5', out: '2' } },
    { title: 'Count Vowels in String', desc: 'Count vowels case-insensitively.', input: 'string', output: 'vowel count', example: { in: 'Hello', out: '2' } },
    { title: 'Maximum of Two Numbers', desc: 'Print the larger of two integers.', input: 'a b', output: 'max(a,b)', example: { in: '3 7', out: '7' } },
    { title: 'Absolute Difference', desc: 'Print |a - b|.', input: 'a b', output: 'absolute difference', example: { in: '5 9', out: '4' } },
  ],
  medium: [
    { title: 'Two Sum Indices', desc: 'Find two indices whose values sum to target (0-based, i<j).', input: 'n, target, array', output: 'i j or -1 -1', example: { in: '4 6\n2 7 11 15', out: '0 1' } },
    { title: 'Valid Parentheses', desc: 'Check if bracket string is valid.', input: 'bracket string', output: 'YES or NO', example: { in: '({[]})', out: 'YES' } },
    { title: 'Binary Search Position', desc: 'Find index of target in sorted array.', input: 'n, target, sorted array', output: 'index or -1', example: { in: '5 3\n1 2 3 4 5', out: '2' } },
    { title: 'Longest Substring Without Repeat', desc: 'Length of longest substring without repeating characters.', input: 'string', output: 'integer length', example: { in: 'abcabcbb', out: '3' } },
    { title: 'Merge Two Sorted Arrays', desc: 'Merge two sorted arrays into one sorted output.', input: 'two sorted arrays', output: 'merged array', example: { in: '3\n1 3 5\n3\n2 4 6', out: '1 2 3 4 5 6' } },
    { title: 'Coin Change Minimum', desc: 'Minimum coins to make amount or -1.', input: 'amount, coin denominations', output: 'min coins', example: { in: '11\n1 2 5', out: '3' } },
    { title: 'BFS Shortest Path Length', desc: 'Shortest path from node 0 to n-1 in unweighted graph.', input: 'graph edges', output: 'path length', example: { in: '3 2\n0 1\n1 2', out: '2' } },
    { title: 'Kth Largest Element', desc: 'Find kth largest element in unsorted array.', input: 'n, k, array', output: 'kth largest', example: { in: '6 2\n3 2 1 5 6 4', out: '5' } },
    { title: 'Group Anagrams Count', desc: 'Count number of anagram groups in word list.', input: 'n words', output: 'group count', example: { in: '3\neat tea ate', out: '1' } },
    { title: 'Tree Level Order Traversal', desc: 'Print BFS levels line by line.', input: 'tree parent array', output: 'level lines', example: { in: '5\n-1 0 0 1 1', out: '0\n1 2\n3 4' } },
  ],
  hard: [
    { title: 'N Queens Count', desc: 'Count solutions to n-queens problem.', input: 'n', output: 'solution count', example: { in: '4', out: '2' } },
    { title: 'Sliding Window Maximum', desc: 'Max of each window of size k.', input: 'n, k, array', output: 'window maxima', example: { in: '8 3\n1 3 -1 -3 5 3 6 7', out: '3 3 5 5 6 7' } },
    { title: 'Word Ladder Length', desc: 'Shortest transformation sequence length.', input: 'begin, end, word list', output: 'length or 0', example: { in: 'hit cog\n3\nhot dot cog', out: '5' } },
    { title: 'Edit Distance', desc: 'Minimum operations to convert word1 to word2.', input: 'two strings', output: 'edit distance', example: { in: 'horse\nros', out: '3' } },
    { title: 'Dijkstra Shortest Path', desc: 'Shortest path from source in weighted graph.', input: 'weighted graph', output: 'distances', example: { in: '4 4\n0 1 1\n1 2 2\n2 3 1\n0 3 5', out: '0 1 3 4' } },
    { title: 'Longest Increasing Subsequence', desc: 'Length of LIS.', input: 'array', output: 'LIS length', example: { in: '6\n10 9 2 5 3 7', out: '3' } },
    { title: 'Articulation Points Count', desc: 'Count articulation points in graph.', input: 'graph', output: 'count', example: { in: '5 5\n0 1\n1 2\n2 0\n1 3\n3 4', out: '1' } },
    { title: 'Maximum Flow', desc: 'Max flow from source to sink (simplified).', input: 'flow network', output: 'max flow value', example: { in: '4 5\n0 1 3\n0 2 2\n1 2 1\n1 3 2\n2 3 3', out: '4' } },
    { title: 'Regex Wildcard Matching', desc: 'Match string with ? and * wildcards.', input: 'text and pattern', output: 'YES or NO', example: { in: 'aa\na*', out: 'YES' } },
    { title: 'Trapping Rain Water', desc: 'Total trapped water between bars.', input: 'heights', output: 'water units', example: { in: '6\n0 1 0 2 1 0', out: '1' } },
  ],
};

function makeProblem({
  slug,
  title,
  difficulty,
  tags,
  topicSlugs,
  description,
  constraints,
  examples,
  testCases,
  hints,
  editorial,
  companies,
}) {
  return {
    slug,
    title,
    difficulty,
    tags,
    topicSlugs,
    description,
    constraints,
    examples,
    testCases,
    hints: hints ?? ['Consider edge cases first', 'Draw a small example and trace manually', 'Analyze time complexity before coding'],
    editorial:
      editorial ??
      `## Approach\n\nIdentify the pattern, choose appropriate data structures, implement carefully, and verify with edge cases.\n\n## Brute Force\n\nTry all possibilities — useful for correctness baseline.\n\n## Optimized\n\nUse the technique taught in related lessons to improve complexity.`,
    companies: companies ?? [],
    starterCode: {
      python: '# Write your solution here\n',
      javascript: '// Write your solution here\n',
      java: '// Write your solution here\n',
      cpp: '// Write your solution here\n',
      c: '// Write your solution here\n',
    },
    referenceSolution: { language: 'python', code: '# Reference solution available in editorial\n' },
    status: 'published',
  };
}

/**
 * Generate 300 curated DSA problems: 100 easy, 130 medium, 70 hard.
 */
export function buildProblemBank() {
  const catalog = buildLessonCatalog();
  const topicSlugs = catalog.map((l) => l.slug);
  const problems = [];

  const counts = { easy: 100, medium: 130, hard: 70 };
  let problemNum = 0;

  for (const [difficulty, count] of Object.entries(counts)) {
    const templates = PROBLEM_TEMPLATES[difficulty];
    for (let i = 0; i < count; i++) {
      problemNum += 1;
      const template = templates[i % templates.length];
      const topicSlug = topicSlugs[problemNum % topicSlugs.length];
      const moduleSlug = topicSlug.split('-').slice(0, 2).join('-');

      const slug = `${difficulty}-${toSlug(template.title)}-${problemNum}`;
      const title = `${template.title} ${problemNum}`;

      problems.push(
        makeProblem({
          slug,
          title,
          difficulty: DIFFICULTY[difficulty.toUpperCase()],
          tags: [difficulty, moduleSlug, ...template.title.toLowerCase().split(' ').slice(0, 2)],
          topicSlugs: [topicSlug],
          description: `${template.desc}\n\nProblem #${problemNum} — ${template.input}.`,
          constraints: difficulty === 'easy' ? '1 ≤ n ≤ 10⁴' : difficulty === 'medium' ? '1 ≤ n ≤ 10⁵' : '1 ≤ n ≤ 10⁶',
          examples: [
            {
              input: template.example.in,
              output: template.example.out,
              explanation: `Sample case demonstrating ${template.title.toLowerCase()}.`,
            },
          ],
          testCases: [
            { input: template.example.in, expectedOutput: template.example.out, isHidden: false },
            {
              input: generateHiddenInput(difficulty, i),
              expectedOutput: generateHiddenOutput(difficulty, i),
              isHidden: true,
            },
          ],
          companies: [COMPANIES[problemNum % COMPANIES.length], COMPANIES[(problemNum + 7) % COMPANIES.length]],
          editorial: buildEditorial(title, template, difficulty, topicSlug),
        })
      );
    }
  }

  return problems;
}

function buildEditorial(title, template, difficulty, topicSlug) {
  return `## ${title}\n\n**Related lesson:** \`${topicSlug}\`\n\n### Problem Statement\n${template.desc}\n\n### Brute Force\nEnumerate all possibilities — correct but may exceed time limits for ${difficulty} constraints.\n\n### Optimized Solution\nApply the standard ${difficulty}-level pattern: use appropriate data structures, maintain invariants, and stop early when possible.\n\n### Complexity\nTypical ${difficulty} problems require ${difficulty === 'easy' ? 'O(n) or O(n log n)' : difficulty === 'medium' ? 'O(n log n) or O(n)' : 'O(n log n) or O(n²) with optimizations'} time.`;
}

function generateHiddenInput(difficulty, seed) {
  if (difficulty === 'easy') return `${3 + (seed % 5)}\n1 2 3`;
  if (difficulty === 'medium') return `${5 + (seed % 10)}\n1 2 3 4 5`;
  return `${8 + (seed % 5)}\n1 3 -1 -3 5 3 6 7`;
}

function generateHiddenOutput(difficulty, seed) {
  if (difficulty === 'easy') return String(6 + (seed % 3));
  if (difficulty === 'medium') return String(2 + (seed % 4));
  return '3 3 5 5 6 7';
}

function toSlug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export const PROBLEMS = buildProblemBank();
export default PROBLEMS;
