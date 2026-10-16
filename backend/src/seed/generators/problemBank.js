import { DIFFICULTY } from 'shared/constants';
import { buildLessonCatalog } from '../curriculum/index.js';
import { createRng } from '../problems/rng.js';
import { PROBLEM_SPECS } from '../problems/index.js';

/**
 * The practice problem bank.
 *
 * Every problem is a distinct, hand-specified task (see ../problems/*.js). Its example outputs
 * are written by hand, its hidden test cases are produced by running the problem's own
 * reference solution over deterministic generated and hand-picked inputs, and the reference
 * solution ships with the problem. problemBank.test.js re-checks all of this.
 *
 * (The previous generator stamped each of 30 templates ten times with a numbered title and one
 * shared hidden case whose expected output had nothing to do with the problem, so no correct
 * solution could ever pass. See retireLegacyProblems in bootstrap.js for how those records are
 * handled in an existing database.)
 */

const COMPANIES = [
  'Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 'Netflix', 'Uber', 'Airbnb',
  'Bloomberg', 'Goldman Sachs', 'Adobe', 'Salesforce', 'LinkedIn', 'Twitter',
  'Spotify', 'Stripe', 'Palantir', 'Oracle', 'IBM', 'Intel',
];

const DEFAULT_SIZES = [1, 2, 3, 4, 6, 9, 14, 25];

const DEFAULT_CONSTRAINTS = {
  easy: 'Input sizes are small enough for a simple O(n) or O(n log n) solution.',
  medium: 'Input sizes call for an O(n log n) or O(n) solution unless noted.',
  hard: 'Input sizes call for the efficient algorithm named in the editorial.',
};

const toSlug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Stable key for a problem, e.g. "Binary Search Position" -> "binary-search-position". */
export const templateKey = (title) => toSlug(title);

export const PROBLEM_TEMPLATE_KEYS = new Set(PROBLEM_SPECS.map((spec) => templateKey(spec.title)));

/** Standalone Node program that solves the problem from stdin — stored as the reference solution. */
export function referenceProgram(spec) {
  return `const fs = require('fs');\nconst solve = ${spec.solve.toString()};\nprocess.stdout.write(String(solve(fs.readFileSync(0, 'utf8'))) + '\\n');\n`;
}

/** Example cases first (visible), then edge cases and generated cases (hidden). */
export function buildTestCases(spec) {
  const cases = [];
  const seen = new Set();
  const push = (input, expectedOutput, isHidden) => {
    const key = `${input}\u0000`;
    if (seen.has(key)) return;
    seen.add(key);
    cases.push({ input, expectedOutput, isHidden });
  };

  for (const [input, output] of spec.examples) push(input, output, false);
  for (const input of spec.edge ?? []) push(input, String(spec.solve(input)).trim(), true);
  for (const n of spec.sizes ?? DEFAULT_SIZES) {
    const input = spec.gen(createRng(`${spec.title}:${n}`), n);
    push(input, String(spec.solve(input)).trim(), true);
  }
  return cases;
}

function buildEditorial(spec) {
  return `## ${spec.title}\n\n### Approach\n${spec.idea}\n\n### Reference solution\nA JavaScript reference solution is stored with this problem and produced the expected output of every hidden test case. It favours being obviously correct; where the approach above is faster than the stored solution, the approach above is the one to aim for.`;
}

/**
 * Build the problem documents. A problem is linked to a lesson ONLY when that lesson lists the
 * problem's key under `practice:` (see lessons/schema.js).
 */
export function buildProblemBank() {
  const catalog = buildLessonCatalog();
  const lessonsByKey = new Map();
  for (const lesson of catalog) {
    for (const key of lesson.practice) {
      if (!lessonsByKey.has(key)) lessonsByKey.set(key, []);
      lessonsByKey.get(key).push(lesson);
    }
  }

  return PROBLEM_SPECS.map((spec, index) => {
    const key = templateKey(spec.title);
    const linked = lessonsByKey.get(key) ?? [];
    const difficulty = DIFFICULTY[spec.difficulty.toUpperCase()];
    return {
      slug: key,
      title: spec.title,
      difficulty,
      tags: spec.tags,
      topicSlugs: linked.map((lesson) => lesson.slug),
      description: `${spec.text}\n\nInput\n${spec.input}\n\nOutput\n${spec.output}`,
      constraints: spec.constraints ?? DEFAULT_CONSTRAINTS[spec.difficulty],
      examples: spec.examples.map(([input, output, explanation]) => ({
        input,
        output,
        ...(explanation ? { explanation } : {}),
      })),
      testCases: buildTestCases(spec),
      hints: spec.hints ?? [
        'Work through the first example by hand before writing code',
        'Check the smallest and the largest inputs the constraints allow',
        'State the time complexity of your idea before you code it',
      ],
      editorial: buildEditorial(spec),
      companies: [COMPANIES[index % COMPANIES.length], COMPANIES[(index + 7) % COMPANIES.length]],
      starterCode: {
        python: '# Write your solution here\n',
        javascript: '// Write your solution here\n',
        java: '// Write your solution here\n',
        cpp: '// Write your solution here\n',
        c: '// Write your solution here\n',
      },
      referenceSolution: { language: 'javascript', code: referenceProgram(spec) },
      status: 'published',
    };
  });
}

/**
 * Titles of the retired generated problems (they were stamped out as "<difficulty>-<title>-<n>"),
 * used by bootstrap to find and retire them without touching anything else.
 */
export const LEGACY_TEMPLATE_TITLES = {
  easy: ['Sum of Array Elements', 'Count Even Numbers', 'Find Minimum Element', 'Reverse Array Print', 'Check Palindrome String', 'Factorial Calculation', 'Linear Search Position', 'Count Vowels in String', 'Maximum of Two Numbers', 'Absolute Difference'],
  medium: ['Two Sum Indices', 'Valid Parentheses', 'Binary Search Position', 'Longest Substring Without Repeat', 'Merge Two Sorted Arrays', 'Coin Change Minimum', 'BFS Shortest Path Length', 'Kth Largest Element', 'Group Anagrams Count', 'Tree Level Order Traversal'],
  hard: ['N Queens Count', 'Sliding Window Maximum', 'Word Ladder Length', 'Edit Distance', 'Dijkstra Shortest Path', 'Longest Increasing Subsequence', 'Articulation Points Count', 'Maximum Flow', 'Regex Wildcard Matching', 'Trapping Rain Water'],
};

/** For a legacy slug such as "easy-sum-of-array-elements-12" return the key of its replacement, else null. */
export function legacyReplacementKey(slug) {
  const match = /^(easy|medium|hard)-(.+)-(\d+)$/.exec(slug);
  if (!match) return null;
  const [, difficulty, base] = match;
  const known = LEGACY_TEMPLATE_TITLES[difficulty].find((title) => toSlug(title) === base);
  return known ? toSlug(known) : null;
}

export const PROBLEMS = buildProblemBank();
export default PROBLEMS;
