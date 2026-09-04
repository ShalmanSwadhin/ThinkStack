/**
 * Builds unique educational topic content from structured lesson metadata.
 * @deprecated Prefer buildRichLessonContent from lessonContentLibrary.js
 */
import { buildRichLessonContent } from './lessonContentLibrary.js';

export function buildLessonContent(lesson) {
  return buildRichLessonContent(lesson);
}

function buildTheorySection(lesson) {
  const sections = [
    `## Concept Overview\n\n${lesson.conceptOverview}`,
    `## Why It Works\n\n${lesson.whyItWorks}`,
    `## Step-by-Step Breakdown\n\n${lesson.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}`,
    `## Complexity Analysis\n\n**Time:** ${lesson.complexity.time}\n\n**Space:** ${lesson.complexity.space}\n\n${lesson.complexityNotes}`,
    `## Interview Tips\n\n${lesson.interviewTips.map((tip) => `- ${tip}`).join('\n')}`,
    `## Revision Notes\n\n${lesson.revisionNotes}`,
  ];
  return sections.join('\n\n');
}

function buildWorkedExample(lesson) {
  return `### Dry Run Example\n\n${lesson.dryRun}\n\n### Code Walkthrough\n\n${lesson.codeWalkthrough}`;
}

function buildCheatSheet(lesson) {
  return `**Cheat Sheet — ${lesson.title}**\n\n${lesson.cheatSheet.map((line) => `- ${line}`).join('\n')}`;
}

function buildTracingExamples(lesson) {
  return {
    beginner: `**Beginner Trace — ${lesson.title}**\n\nInput: ${lesson.traceBeginner.input}\n\n${lesson.traceBeginner.steps.map((s, i) => `Step ${i + 1}: ${s}`).join('\n')}\n\nOutput: ${lesson.traceBeginner.output}`,
    intermediate: `**Intermediate Trace — ${lesson.title}**\n\nInput: ${lesson.traceIntermediate.input}\n\n${lesson.traceIntermediate.steps.map((s, i) => `Step ${i + 1}: ${s}`).join('\n')}\n\nOutput: ${lesson.traceIntermediate.output}`,
    advanced: `**Advanced Trace — ${lesson.title}**\n\nInput: ${lesson.traceAdvanced.input}\n\n${lesson.traceAdvanced.steps.map((s, i) => `Step ${i + 1}: ${s}`).join('\n')}\n\nOutput: ${lesson.traceAdvanced.output}`,
  };
}

/**
 * Derive rich lesson metadata from module + lesson definition.
 */
export function buildLessonMetadata(module, lessonTitle, order, globalOrder) {
  const slug = `${module.id}-${toSlug(lessonTitle)}`;
  const focusParagraph = LESSON_FOCUS[globalOrder % LESSON_FOCUS.length];
  const domain = DOMAIN_KNOWLEDGE[module.category] ?? DOMAIN_KNOWLEDGE.fundamentals;

  return {
    slug,
    title: lessonTitle,
    moduleId: module.id,
    moduleTitle: module.title,
    category: module.category,
    difficulty: order < 4 ? module.difficulty : module.difficulty,
    order: globalOrder,
    tags: [module.id, toSlug(lessonTitle), module.category, `lesson-${order + 1}`],
    visualizerId: module.visualizerId,
    estimatedMinutes: 20 + (order % 5) * 5,
    description: `${lessonTitle} — lesson ${order + 1} in ${module.title}.`,
    focusParagraph,
    conceptOverview: `${lessonTitle} builds on ${module.title} by examining ${focusParagraph.toLowerCase()} Students learn the invariant, implementation choices, and complexity profile that interviewers expect.`,
    whyItWorks: `The technique works because ${domain.whyTemplate.replace('{topic}', lessonTitle.toLowerCase())}`,
    steps: domain.steps.map((s) => s.replace('{topic}', lessonTitle)),
    complexity: domain.complexityFor(order),
    complexityNotes: domain.complexityNotes.replace('{topic}', lessonTitle),
    realWorld: domain.realWorld.replace('{topic}', lessonTitle).replace('{module}', module.title),
    advantages: domain.advantages.map((a) => a.replace('{topic}', lessonTitle)),
    disadvantages: domain.disadvantages.map((d) => d.replace('{topic}', lessonTitle)),
    applications: domain.applications.map((a) => a.replace('{topic}', lessonTitle)),
    pitfalls: domain.pitfalls.map((p) => p.replace('{topic}', lessonTitle)),
    interviewTips: domain.interviewTips.map((t) => t.replace('{topic}', lessonTitle)),
    interviewQuestions: buildInterviewQuestions(lessonTitle, module.title, order),
    revisionNotes: `Remember: ${lessonTitle} in ${module.title} — ${domain.revision.replace('{topic}', lessonTitle)}`,
    dryRun: domain.dryRun.replace('{topic}', lessonTitle).replace('{n}', String(3 + (order % 5))),
    codeWalkthrough: `Walk through the basic example line by line: declarations establish state, the core loop or recursion applies ${lessonTitle.toLowerCase()}, and the return/output phase produces the answer. Compare the five language versions to see syntax differences with identical logic.`,
    cheatSheet: [
      `Definition: ${lessonTitle}`,
      `Module: ${module.title}`,
      `Time: ${domain.complexityFor(order).time}`,
      `Space: ${domain.complexityFor(order).space}`,
      `First check: ${domain.pitfalls[0]?.replace('{topic}', lessonTitle) ?? 'Validate input bounds'}`,
    ],
    references: [`${module.title} — ${lessonTitle} (ThinkStack Curriculum v2)`],
    traceBeginner: makeTrace(lessonTitle, 'small', order),
    traceIntermediate: makeTrace(lessonTitle, 'medium', order),
    traceAdvanced: makeTrace(lessonTitle, 'large', order),
  };
}

function buildInterviewQuestions(title, moduleTitle, order) {
  const levels = ['beginner', 'intermediate', 'advanced'];
  const level = levels[order % 3];
  const companies = ['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 'Bloomberg'][order % 6];

  return [
    {
      question: `[${level}] Explain ${title} and when you would use it in a ${moduleTitle} context.`,
      answer: `Define ${title.toLowerCase()}, state preconditions, give time/space complexity, and describe one ${moduleTitle.toLowerCase()} application. Mention trade-offs versus adjacent approaches.`,
    },
    {
      question: `[${level}] How would you debug an incorrect implementation of ${title}?`,
      answer: 'Trace a small input manually, verify invariants at each step, check boundary cases, and compare against a brute-force reference on random tests.',
    },
    {
      question: `[Company: ${companies}] Describe a production or interview scenario where ${title} is the right tool.`,
      answer: `Connect ${title.toLowerCase()} to a measurable requirement (latency, memory, correctness) and explain why alternatives would be inferior for that workload.`,
    },
  ];
}

function makeTrace(title, size, order) {
  const sizes = { small: 3, medium: 6, large: 10 };
  const n = sizes[size] + (order % 3);
  const steps = [];
  for (let i = 0; i < Math.min(n, 5); i++) {
    steps.push(`Apply ${title} operation on element index ${i}; intermediate state updated`);
  }
  return {
    input: `${size} input with ${n} elements for ${title}`,
    steps,
    output: `Correct ${title.toLowerCase()} result after ${steps.length} tracked operations`,
  };
}

function toSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const LESSON_FOCUS = [
  'This lesson establishes precise definitions and vocabulary used throughout the module.',
  'You will connect abstract definitions to concrete code you can execute and test.',
  'The focus is on invariants — properties that remain true while an algorithm runs.',
  'We compare multiple implementation strategies and their impact on performance.',
  'Edge cases and failure modes are treated as first-class learning objectives.',
  'Interview-style reasoning is integrated so you can articulate trade-offs clearly.',
];

const DOMAIN_KNOWLEDGE = {
  fundamentals: {
    whyTemplate: '{topic} reduces cognitive load by giving a repeatable pattern for organizing computation.',
    steps: [
      'State the problem in precise terms before writing code for {topic}.',
      'Identify inputs, outputs, and constraints that bound valid instances.',
      'Select a data representation compatible with {topic}.',
      'Implement the core logic and verify with small manual traces.',
      'Analyze time and space complexity and document assumptions.',
    ],
    complexityFor: (order) => ({
      time: order % 3 === 0 ? 'O(n)' : order % 3 === 1 ? 'O(log n)' : 'O(1)',
      space: order % 2 === 0 ? 'O(1) auxiliary' : 'O(n) auxiliary',
    }),
    complexityNotes: 'Complexity for {topic} depends on input size n and the number of auxiliary structures allocated during execution.',
    realWorld: '{topic} appears in compilers, web servers, databases, and mobile apps whenever {module} concepts are applied at scale.',
    advantages: [
      '{topic} provides a clear model for reasoning about program behavior.',
      'Implementations map directly to standard library APIs in most languages.',
      'The pattern appears frequently in coding interviews for {topic}.',
    ],
    disadvantages: [
      'Naive {topic} implementations may ignore edge cases that break production code.',
      'Without complexity analysis, {topic} can become a performance bottleneck.',
    ],
    applications: ['Technical interviews', 'Competitive programming', 'Production services', 'Teaching CS1/CS2 courses'],
    pitfalls: [
      'Skipping input validation before applying {topic}.',
      'Confusing best-case behavior with worst-case guarantees for {topic}.',
      'Forgetting off-by-one errors in loops handling {topic}.',
    ],
    interviewTips: [
      'Always state the invariant maintained by {topic} before coding.',
      'Offer a brute-force baseline, then optimize for {topic}.',
      'Mention real constraints (memory, latency) when choosing {topic}.',
    ],
    revision: 'state the invariant, write the pseudocode, then code {topic}.',
    dryRun: 'For input size {n}, trace {topic} step by step: initialize state, process each element, update the result, and return when the loop or recursive base case is reached.',
  },
  linear: {
    whyTemplate: '{topic} exploits sequential or indexed access patterns to achieve predictable performance on structured data.',
    steps: [
      'Model the structure (array, list, stack, queue, hash table) behind {topic}.',
      'Define operations and their amortized costs for {topic}.',
      'Implement pointer/index manipulation carefully for {topic}.',
      'Test empty, single-element, and full-structure edge cases.',
      'Relate {topic} to related linear structures and when to switch.',
    ],
    complexityFor: (order) => ({
      time: order % 2 === 0 ? 'O(n) traversal' : 'O(1) average per operation',
      space: 'O(n) for structure storage',
    }),
    complexityNotes: 'Linear structures backing {topic} usually trade memory for O(1) or O(log n) operations depending on the backing store.',
    realWorld: 'Caches, task schedulers, and browser history stacks use ideas from {topic} in {module}.',
    advantages: ['Cache-friendly when contiguous', 'Simple APIs in standard libraries', 'Composable with other linear patterns'],
    disadvantages: ['Resize/rehash costs if dynamic', 'Poor performance if wrong structure chosen for access pattern'],
    applications: ['LRU caches', 'Undo stacks', 'BFS queues', 'Symbol tables'],
    pitfalls: ['Null pointer dereference in linked structures', 'Iterator invalidation during mutation', 'Hash collision degradation'],
    interviewTips: ['Draw memory layout for {topic}', 'State amortized vs worst case', 'Compare array vs linked backing'],
    revision: 'draw the structure, label pointers/indices, then code {topic}.',
    dryRun: 'Trace {topic} on {n} elements: show head/tail/index movement and memory state after each operation.',
  },
  trees: {
    whyTemplate: '{topic} organizes hierarchical data so searches and updates avoid scanning every record.',
    steps: [
      'Define node fields and child relationships for {topic}.',
      'Specify traversal order (in/pre/post/level) needed for {topic}.',
      'Implement insert/search/delete preserving tree invariants.',
      'Analyze height and balance impact on {topic}.',
      'Connect {topic} to real indexes (B+ trees, tries).',
    ],
    complexityFor: (order) => ({
      time: order % 2 === 0 ? 'O(log n) balanced' : 'O(h) height-dependent',
      space: 'O(n) nodes + O(h) recursion stack',
    }),
    complexityNotes: 'Height h determines performance; balanced variants keep {topic} at O(log n).',
    realWorld: 'Database indexes, filesystems, and autocomplete engines rely on {topic} concepts from {module}.',
    advantages: ['Logarithmic operations when balanced', 'Natural hierarchy modeling', 'Efficient prefix/range queries with variants'],
    disadvantages: ['Rebalancing overhead', 'Pointer overhead vs arrays', 'Complex deletion cases'],
    applications: ['Database indexes', 'Expression parsing', 'Autocomplete', 'Priority scheduling'],
    pitfalls: ['Forgetting null child checks', 'Breaking BST ordering on delete', 'Stack overflow on skewed trees'],
    interviewTips: ['Always mention balance strategy for {topic}', 'Recursive vs iterative traversal trade-offs', 'Serialize tree for test cases'],
    revision: 'verify ordering invariant, then implement {topic}.',
    dryRun: 'Build a tree with {n} keys; trace {topic} rotations or traversals showing node values at each step.',
  },
  graphs: {
    whyTemplate: '{topic} models relationships between entities and enables reachability, shortest path, and connectivity analysis.',
    steps: [
      'Choose adjacency list or matrix representation for {topic}.',
      'Mark visited nodes to avoid redundant work in {topic}.',
      'Apply DFS/BFS/shortest-path logic as required by {topic}.',
      'Track distances/parents/predecessors for reconstruction.',
      'Validate on disconnected, cyclic, and weighted inputs.',
    ],
    complexityFor: (order) => ({
      time: 'O(V + E) traversal; O(E log V) with priority queue when weighted',
      space: 'O(V + E) adjacency storage',
    }),
    complexityNotes: 'Graph size is measured in vertices V and edges E; {topic} complexity scales with both.',
    realWorld: 'Maps, social networks, package routing, and chip placement use {topic} from {module}.',
    advantages: ['Models arbitrary relationships', 'Rich algorithm library', 'Composable with DP and greedy on DAGs'],
    disadvantages: ['Memory for dense graphs', 'Harder to debug than linear structures', 'NP-hard problems on general graphs'],
    applications: ['GPS routing', 'Network flow', 'Dependency resolution', 'Web crawling'],
    pitfalls: ['Not marking visited in BFS/DFS', 'Integer overflow on distances', 'Mis-handling directed vs undirected edges'],
    interviewTips: ['Clarify directed/weighted constraints for {topic}', 'State BFS vs DFS choice rationale', 'Use adjacency list for sparse graphs'],
    revision: 'list V and E, pick representation, then apply {topic}.',
    dryRun: 'On a graph with {n} nodes, trace {topic}: show queue/stack contents and visited set after each step.',
  },
  advanced: {
    whyTemplate: '{topic} combines multiple DSA techniques to solve optimization, counting, or string problems efficiently.',
    steps: [
      'Identify overlapping subproblems or greedy choice for {topic}.',
      'Define state representation compactly for {topic}.',
      'Write recurrence or greedy selection rule.',
      'Implement memoization/tabulation or proof for greedy {topic}.',
      'Optimize space once correctness is verified.',
    ],
    complexityFor: (order) => ({
      time: order % 2 === 0 ? 'O(n²) typical DP' : 'O(n log n) typical greedy/divide',
      space: 'O(n) to O(n²) depending on state dimensions',
    }),
    complexityNotes: 'Advanced {topic} often trades polynomial time for exponential brute force; state compression reduces space.',
    realWorld: 'Route optimization, genomics alignment, and ad bidding use {topic} techniques taught in {module}.',
    advantages: ['Polynomial solutions to otherwise exponential problems', 'Transferable patterns across problem families', 'High interview signal'],
    disadvantages: ['State design is error-prone', 'Greedy requires proof', 'Large memory for high-dimensional DP'],
    applications: ['Resource allocation', 'Bioinformatics', 'Game AI', 'Financial modeling'],
    pitfalls: ['Wrong recurrence base cases', 'Assuming greedy works without proof', 'Modulo arithmetic errors'],
    interviewTips: ['Start from brute force then optimize {topic}', 'Draw state table for small n', 'Name the pattern (knapsack, LIS, interval DP)'],
    revision: 'identify pattern, define state, write transition for {topic}.',
    dryRun: 'For {topic} with {n} items, fill DP table or trace greedy choices row by row showing optimal value updates.',
  },
};

export default buildLessonContent;
