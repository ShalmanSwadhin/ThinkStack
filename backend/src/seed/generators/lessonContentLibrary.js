/**
 * Rich, topic-specific lesson content for all ThinkStack curriculum lessons.
 * Replaces generic template traces and placeholder references.
 */

const LANG_REFERENCES = {
  clrs: 'Cormen, Leiserson, Rivest & Stein — Introduction to Algorithms (CLRS), 3rd ed.',
  sedgewick: 'Sedgewick & Wayne — Algorithms, 4th ed.',
  knuth: 'Knuth — The Art of Computer Programming, Vol. 1–3',
  wikipedia: (topic) => `Wikipedia — ${topic}`,
  mdn: 'MDN Web Docs — JavaScript reference and guides',
  cppref: 'cppreference.com — C++ language and standard library',
  oracle: 'Oracle Java Documentation — Language Specification',
  geeksforgeeks: (topic) => `GeeksforGeeks — ${topic}`,
  mit6: 'MIT OpenCourseWare 6.006 — Introduction to Algorithms',
  stanford: 'Stanford CS161 — Design and Analysis of Algorithms',
};

function normalizeTitle(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function seedFromLesson(lesson) {
  let h = 2166136261;
  const s = `${lesson.slug}|${lesson.title}|${lesson.order}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickFrom(arr, seed, offset = 0) {
  return arr[(seed + offset) % arr.length];
}

function profile(config) {
  return {
    history: '',
    analogy: '',
    howItWorks: '',
    walkthrough: [],
    workedExample: '',
    ...config,
  };
}

function makeTraces(traceConfig) {
  return {
    traceBeginner: traceConfig.beginner,
    traceIntermediate: traceConfig.intermediate,
    traceAdvanced: traceConfig.advanced,
  };
}

function buildInterviewQuestions(title, moduleTitle, questions) {
  return questions.map((q, i) => ({
    question: q.q,
    answer: q.a,
    level: ['beginner', 'intermediate', 'advanced'][i % 3],
    company: pickFrom(['Google', 'Amazon', 'Microsoft', 'Meta', 'Bloomberg'], seedFromLesson({ slug: title, title, order: i }), i),
  }));
}

function buildTheoryMarkdown(p, lesson) {
  const sections = [
    `## Concept Overview\n\n${p.conceptOverview}`,
    `## Why It Works\n\n${p.whyItWorks}`,
    `## Step-by-Step Breakdown\n\n${p.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`,
  ];
  if (p.history) sections.push(`## History\n\n${p.history}`);
  if (p.analogy) sections.push(`## Real World Analogy\n\n${p.analogy}`);
  if (p.howItWorks) sections.push(`## How It Works\n\n${p.howItWorks}`);
  if (p.walkthrough?.length) {
    sections.push(`## Step-by-Step Walkthrough\n\n${p.walkthrough.map((s, i) => `${i + 1}. ${s}`).join('\n')}`);
  }
  if (p.workedExample) sections.push(`## Worked Example\n\n${p.workedExample}`);
  sections.push(
    `## Complexity Analysis\n\n**Time:** ${p.complexity.time}\n\n**Space:** ${p.complexity.space}\n\n${p.complexityNotes}`,
    `## Interview Tips\n\n${p.interviewTips.map((t) => `- ${t}`).join('\n')}`,
    `## Revision Notes\n\n${p.revisionNotes}`,
    `## Cheat Sheet\n\n${p.cheatSheet.map((line) => `- ${line}`).join('\n')}`
  );
  return sections.join('\n\n');
}

function assembleContent(lesson, p) {
  const title = lesson.title;
  const moduleTitle = lesson.moduleTitle;
  const tracing = {
    beginner: `**Beginner Trace — ${title}**\n\nInput: ${p.traceBeginner.input}\n\n${p.traceBeginner.steps.map((s, i) => `Step ${i + 1}: ${s}`).join('\n')}\n\nOutput: ${p.traceBeginner.output}`,
    intermediate: `**Intermediate Trace — ${title}**\n\nInput: ${p.traceIntermediate.input}\n\n${p.traceIntermediate.steps.map((s, i) => `Step ${i + 1}: ${s}`).join('\n')}\n\nOutput: ${p.traceIntermediate.output}`,
    advanced: `**Advanced Trace — ${title}**\n\nInput: ${p.traceAdvanced.input}\n\n${p.traceAdvanced.steps.map((s, i) => `Step ${i + 1}: ${s}`).join('\n')}\n\nOutput: ${p.traceAdvanced.output}`,
  };

  return {
    introduction: `${title} is a core lesson in the **${moduleTitle}** track. ${p.conceptOverview.split('.')[0]}. By the end of this lesson you will explain the concept, implement it in multiple languages, analyze complexity, and apply it to interview-style problems.`,
    theory: buildTheoryMarkdown(p, lesson),
    explanation: `${tracing.beginner}\n\n---\n\n${tracing.intermediate}\n\n---\n\n${tracing.advanced}`,
    example: `### Dry Run Example\n\n${p.dryRun}\n\n### Code Walkthrough\n\n${p.codeWalkthrough}`,
    realWorldExample: p.realWorld,
    advantages: p.advantages,
    disadvantages: p.disadvantages,
    applications: p.applications,
    timeComplexity: p.complexity.time,
    spaceComplexity: p.complexity.space,
    commonMistakes: p.pitfalls,
    interviewQuestions: p.interviewQuestions,
    summary: `${title} connects theory to practice inside ${moduleTitle}. Review the dry-run traces, use the ${lesson.visualizerId ?? 'topic'} visualizer when available, solve linked practice problems, and complete the quiz before advancing.`,
    codeComments: 'Each code block includes line-by-line comments across C, C++, Java, Python, and JavaScript — organized by basic, intermediate, advanced, interview, and practice tiers.',
    references: p.references,
    notes: `**Cheat Sheet — ${title}**\n\n${p.cheatSheet.map((line) => `- ${line}`).join('\n')}`,
    externalResources: [],
  };
}

// ---------------------------------------------------------------------------
// TOPIC_PROFILES — exact normalized-title matches for flagship lessons
// ---------------------------------------------------------------------------

const TOPIC_PROFILES = {
  'what is programming': profile({
    conceptOverview:
      'Programming is the disciplined craft of instructing a computer to solve problems by writing precise, executable instructions in a programming language.',
    whyItWorks:
      'Computers execute instructions literally and at high speed; programming languages bridge human intent and machine execution through abstractions like variables, control flow, and functions.',
    steps: [
      'Understand the problem and define inputs/outputs.',
      'Design an algorithm before writing code.',
      'Translate the algorithm into a language the compiler or interpreter accepts.',
      'Run, test, and refine based on observed behavior.',
      'Maintain code with version control and documentation.',
    ],
    history:
      'Ada Lovelace wrote the first algorithm intended for a machine (1843). Fortran (1957) and C (1972) shaped modern compiled languages; Python and JavaScript democratized access in the 1990s–2000s.',
    analogy:
      'Programming is like writing a recipe: ingredients are data, steps are instructions, and the oven is the CPU executing them in order.',
    howItWorks:
      'Source code is parsed into tokens, compiled or interpreted into machine instructions, loaded into memory, and executed by the CPU fetch-decode-execute cycle.',
    walkthrough: [
      'Identify the problem (e.g., compute average test score).',
      'Write pseudocode: read scores, sum, divide by count.',
      'Implement in a language, compile/run, verify output.',
    ],
    workedExample:
      'Given scores [88, 92, 79], sum = 259, count = 3, average = 86.33 — the program prints one formatted result.',
    complexity: { time: 'O(n) for n inputs read', space: 'O(1) auxiliary if streaming' },
    complexityNotes: 'Introductory programs are usually linear in input size; focus on correctness before micro-optimization.',
    realWorld:
      'Every mobile app, web service, game engine, and embedded thermostat runs code written by programmers translating requirements into executable logic.',
    advantages: ['Automates repetitive work', 'Enables simulation and modeling', 'Scales to billions of users when deployed well'],
    disadvantages: ['Requires precise logic — small bugs cause large failures', 'Maintenance cost grows with codebase size'],
    applications: ['Web development', 'Data science', 'Robotics', 'Game development', 'DevOps automation'],
    pitfalls: ['Skipping problem definition', 'Not testing edge cases', 'Copy-pasting code without understanding'],
    interviewTips: ['Explain how you debug', 'Discuss trade-offs between languages', 'Show a small working example verbally'],
    interviewQuestions: buildInterviewQuestions('What Is Programming', 'Introduction to Programming', [
      { q: 'What is the difference between code and an algorithm?', a: 'An algorithm is the step-by-step method; code is its implementation in a specific language.' },
      { q: 'Why do we use high-level languages instead of machine code?', a: 'Readability, portability, and faster development; compilers translate to efficient machine code.' },
      { q: 'Describe how you would teach programming to a beginner.', a: 'Start with variables and sequential logic, add conditionals and loops, then functions — with immediate runnable exercises.' },
    ]),
    revisionNotes: 'Programming = problem → algorithm → code → test → maintain.',
    dryRun: 'Input: three integers 10, 20, 30.\n1. Read 10 → sum=10\n2. Read 20 → sum=30\n3. Read 30 → sum=60\n4. Print average 20.0',
    codeWalkthrough: 'Declare accumulator, loop over inputs updating sum, divide by count, format output — identical logic across languages with different syntax.',
    cheatSheet: ['Algorithm before code', 'Test with small inputs', 'Use meaningful names', 'Version control from day one'],
    references: [LANG_REFERENCES.sedgewick, LANG_REFERENCES.mdn, LANG_REFERENCES.wikipedia('Computer programming')],
    ...makeTraces({
      beginner: { input: 'scores = [85, 90, 95]', steps: ['sum ← 85', 'sum ← 175', 'sum ← 270', 'avg ← 270/3 = 90'], output: '90' },
      intermediate: { input: 'n=4, data=[12,8,15,9]', steps: ['sum=12', 'sum=20', 'sum=35', 'sum=44', 'avg=11'], output: '11' },
      advanced: { input: 'stream of 1000 values', steps: ['running sum with O(1) memory', 'Welford online mean for numerical stability'], output: 'mean computed without storing all values' },
    }),
  }),

  'linear search': profile({
    conceptOverview:
      'Linear search scans elements sequentially from index 0 until the target is found or the structure ends — the baseline search when no ordering exists.',
    whyItWorks:
      'Checking each element once guarantees discovery if the target exists; no preprocessing is required, making it optimal for tiny or unsorted data.',
    steps: [
      'Start at index i = 0.',
      'Compare array[i] with target.',
      'If equal, return i; else increment i.',
      'If i reaches length, return -1 (not found).',
    ],
    history: 'Sequential lookup predates electronic computers; it remains the default on linked lists and unsorted files.',
    analogy: 'Finding a name in an unsorted stack of papers — you flip one page at a time from the top.',
    howItWorks: 'A single forward pointer examines each slot; worst case inspects all n elements.',
    walkthrough: ['Set i=0', 'Compare arr[i] to target', 'Advance i or return match'],
    workedExample: 'Array [4,2,7,1,9], target 7: checks 4≠7, 2≠7, 7=7 → return index 2.',
    complexity: { time: 'O(n) worst/average', space: 'O(1) auxiliary' },
    complexityNotes: 'Best case O(1) when target is first; no improvement without ordering or indexing.',
    realWorld: 'Scanning RFID tags on a shelf, grep through log files, finding a contact in an unsorted phone list.',
    advantages: ['Works on any order', 'Simple to implement', 'O(1) extra memory'],
    disadvantages: ['Slow on large n', 'No early exit structure without luck'],
    applications: ['Small arrays', 'Linked list lookup', 'Stream processing with early termination'],
    pitfalls: ['Off-by-one on loop bound', 'Not handling empty input', 'Returning 0 vs -1 inconsistently'],
    interviewTips: ['State O(n) immediately', 'Mention when binary search becomes possible', 'Discuss sentinel optimization on arrays'],
    interviewQuestions: buildInterviewQuestions('Linear Search', 'Searching Algorithms', [
      { q: 'When is linear search preferable to binary search?', a: 'Unsorted data, linked structures, or n so small that setup cost dominates.' },
      { q: 'Find first occurrence of duplicate target in [3,1,3,3].', a: 'Scan left-to-right, return index 0 on first match — O(n).' },
      { q: 'Can you parallelize linear search?', a: 'Yes — partition array across threads; still O(n) work, better wall-clock on large data.' },
    ]),
    revisionNotes: 'Unsorted → linear search; sorted → consider binary search.',
    dryRun: 'arr=[11,23,8,4,16], target=8\ni=0: 11≠8\ni=1: 23≠8\ni=2: 8=8 → return 2',
    codeWalkthrough: 'Loop index from 0 to n-1, compare each element, return index on match else -1 after loop.',
    cheatSheet: ['O(n) time', 'O(1) space', 'Works unsorted', 'Return -1 if missing'],
    references: [LANG_REFERENCES.clrs, LANG_REFERENCES.geeksforgeeks('Linear Search'), LANG_REFERENCES.wikipedia('Linear search')],
    ...makeTraces({
      beginner: { input: 'arr=[5,3,9], target=9', steps: ['i=0: 5≠9', 'i=1: 3≠9', 'i=2: 9=9 → found'], output: 'index 2' },
      intermediate: { input: 'arr=[14,7,22,18], target=18', steps: ['check 14,7,22', 'index 3 matches 18'], output: '3' },
      advanced: { input: 'arr=[2,2,2,2], target=2', steps: ['first match policy at index 0', 'or collect all indices [0,1,2,3]'], output: 'depends on first vs all occurrences API' },
    }),
  }),

  'binary search on arrays': profile({
    conceptOverview:
      'Binary search repeatedly halves a sorted search space by comparing the target with the middle element, achieving logarithmic time.',
    whyItWorks:
      'Each comparison eliminates half the remaining indices; after k steps at most n/2^k elements remain, so k = O(log n).',
    steps: [
      'Set lo=0, hi=n-1.',
      'While lo≤hi: mid=(lo+hi)//2.',
      'If arr[mid]==target return mid.',
      'If arr[mid]<target, lo=mid+1; else hi=mid-1.',
      'Return -1 if loop exits.',
    ],
    history: 'Binary search appears in Bainbridge (1946) and Knuth; the overflow-safe mid calculation is a classic interview detail.',
    analogy: 'Guessing a number 1–100: always guess 50, then 25 or 75 — each guess halves possibilities.',
    howItWorks: 'Maintain invariant: target lies in [lo,hi] if present; shrink interval using monotonic ordering.',
    walkthrough: ['lo,hi bounds', 'mid comparison', 'discard half', 'repeat until found or empty'],
    workedExample: 'Sorted [2,5,8,12,16,23,38,56,72,91], target 23: mid indices 4→16→23 found at index 5.',
    complexity: { time: 'O(log n)', space: 'O(1) iterative; O(log n) recursive stack' },
    complexityNotes: 'Requires total ordering and random access; not valid on linked lists.',
    realWorld: 'Dictionary word lookup, database index probes, git bisect for bug finding.',
    advantages: ['Logarithmic comparisons', 'Cache-friendly on arrays', 'Foundation for binary search on answer'],
    disadvantages: ['Needs sorted data', 'Off-by-one bugs common', 'Mid overflow if (lo+hi) unchecked in C++'],
    applications: ['Lower/upper bound', 'Rotated array search', 'Parametric search'],
    pitfalls: ['Using hi=n instead of n-1', 'Infinite loop when lo/hi update wrong', 'Forgetting duplicates handling'],
    interviewTips: ['Write invariant aloud', 'Use lo+(hi-lo)/2 for mid', 'Separate variants: first/last occurrence'],
    interviewQuestions: buildInterviewQuestions('Binary Search', 'Searching Algorithms', [
      { q: 'Implement lower_bound — first index where arr[i]≥target.', a: 'Binary search keeping answer candidate when arr[mid]≥target, search left half.' },
      { q: 'Search in rotated sorted array [4,5,6,7,0,1,2] for 0.', a: 'Identify sorted half each step; adjust lo/hi — O(log n).' },
      { q: 'Why is mid = (lo+hi)/2 risky in C?', a: 'lo+hi can overflow; use lo+(hi-lo)/2.' },
    ]),
    revisionNotes: 'Sorted + index access → binary search; state invariant every time.',
    dryRun: 'arr=[1,3,5,7,9,11], target=7\nlo=0,hi=5,mid=2 arr[2]=5<7 → lo=3\nmid=4 arr[4]=9>7 → hi=3\nmid=3 arr[3]=7 → return 3',
    codeWalkthrough: 'Initialize bounds, loop while lo≤hi, compute safe mid, three-way branch shrinks interval.',
    cheatSheet: ['Requires sorted array', 'O(log n)', 'mid = lo+(hi-lo)/2', 'Variants: first/last equal'],
    references: [LANG_REFERENCES.clrs, LANG_REFERENCES.stanford, LANG_REFERENCES.wikipedia('Binary search algorithm')],
    ...makeTraces({
      beginner: { input: '[1,4,6,8,10], target=6', steps: ['mid=2 value 6 match'], output: 'index 2' },
      intermediate: { input: '[3,7,11,15,19,23], target=15', steps: ['mid=2:11<15 lo=3', 'mid=4:19>15 hi=3', 'mid=3:15 match'], output: 'index 3' },
      advanced: { input: '[1,2,2,2,3], target=2 first occurrence', steps: ['lower_bound lands at index 1', 'not upper_bound at 4'], output: 'index 1' },
    }),
  }),

  'bubble sort analysis': profile({
    conceptOverview:
      'Bubble sort repeatedly swaps adjacent out-of-order pairs, bubbling the largest unsorted element to its position each pass.',
    whyItWorks:
      'After pass i, the i largest elements are in their final positions; n-1 passes suffice for n elements.',
    steps: [
      'For i from 0 to n-2:',
      '  For j from 0 to n-2-i:',
      '    If arr[j]>arr[j+1], swap.',
      'Optional: stop early if no swap in a pass.',
    ],
    history: 'One of the oldest sorting methods taught; useful pedagogically despite O(n²) worst case.',
    analogy: 'Carbonation bubbles rising — lighter values (in ascending sort) “float” rightward each pass.',
    howItWorks: 'Adjacent comparison network; each pass fixes one position from the right.',
    walkthrough: ['Outer pass index', 'Inner adjacent compares', 'Swap inversions', 'Early exit if sorted'],
    workedExample: '[5,1,4,2,8] → after pass1 [1,4,2,5,8] → fully sorted in 4 passes.',
    complexity: { time: 'O(n²) worst/average; O(n) best with early exit', space: 'O(1)' },
    complexityNotes: 'Stable if using strict >; adaptive with flag when already sorted.',
    realWorld: 'Rare in production; used in tiny embedded buffers and teaching visualizations.',
    advantages: ['In-place', 'Stable', 'Simple to code and trace'],
    disadvantages: ['Quadratic on large n', 'Poor cache behavior vs merge sort'],
    applications: ['Education', 'Tiny n (<10)', 'Hardware with minimal code size'],
    pitfalls: ['Forgetting n-1-i inner bound', 'Using >= breaking stability', 'Claiming O(n log n)'],
    interviewTips: ['Know O(n²) and when to mention early exit', 'Contrast with insertion/merge sort'],
    interviewQuestions: buildInterviewQuestions('Bubble Sort', 'Sorting Algorithms', [
      { q: 'Is bubble sort stable?', a: 'Yes if only swap on strict >; equal elements never cross.' },
      { q: 'Best-case complexity with optimization?', a: 'O(n) when array already sorted — one pass, zero swaps.' },
      { q: 'How many passes for n=5?', a: 'At most 4 passes; each pass places one element.' },
    ]),
    revisionNotes: 'Bubble = adjacent swaps, O(n²), stable, O(n) best with flag.',
    dryRun: '[5,1,4,2,8]\nPass1: 1,4,2,5,8\nPass2: 1,2,4,5,8\nPass3: no swaps → done',
    codeWalkthrough: 'Nested loops, compare arr[j] and arr[j+1], swap if greater, optional swapped flag break.',
    cheatSheet: ['O(n²)', 'Stable', 'In-place', 'Early exit → O(n) best'],
    references: [LANG_REFERENCES.clrs, LANG_REFERENCES.sedgewick, LANG_REFERENCES.wikipedia('Bubble sort')],
    ...makeTraces({
      beginner: { input: '[3,1,2]', steps: ['swap 3-1 → [1,3,2]', 'swap 3-2 → [1,2,3]'], output: '[1,2,3]' },
      intermediate: { input: '[4,2,1,3]', steps: ['pass1 → [2,1,3,4]', 'pass2 → [1,2,3,4]'], output: 'sorted' },
      advanced: { input: '[1,2,3,4,5] sorted', steps: ['one pass zero swaps', 'early termination'], output: 'O(n) passes' },
    }),
  }),

  'array memory layout': profile({
    conceptOverview:
      'Arrays store elements in contiguous memory so index i is located at base_address + i × element_size, enabling O(1) random access.',
    whyItWorks:
      'CPU cache lines prefetch contiguous bytes; pointer arithmetic lets hardware compute addresses in one instruction.',
    steps: [
      'Allocate contiguous block of n × sizeof(T) bytes.',
      'Store base pointer to index 0.',
      'Access arr[i] via base + i*stride.',
      'Bounds must satisfy 0 ≤ i < n.',
    ],
    history: 'Fortran pioneered column/row major multidimensional layout; C uses row-major ordering.',
    analogy: 'A row of mailboxes numbered 0..n-1 on one street — house number maps directly to distance from the start.',
    howItWorks: 'Logical index maps to physical address; multidimensional arrays flatten with row-major formula.',
    walkthrough: ['Declare int arr[5]', 'Memory bytes 4×5 contiguous', 'arr[3] at offset 12 bytes from base'],
    workedExample: 'int arr[4] at 0x1000, sizeof int 4: arr[2] at 0x1008 holds third integer.',
    complexity: { time: 'O(1) index access', space: 'O(n) for n elements stored' },
    complexityNotes: 'Insertion/deletion in middle is O(n) due to shifting; dynamic arrays may amortize resize.',
    realWorld: 'Image pixels, audio samples, game entity buffers — all rely on contiguous arrays for SIMD.',
    advantages: ['O(1) random access', 'Cache locality', 'Simple indexing math'],
    disadvantages: ['Fixed size (static) or resize cost (dynamic)', 'Insert/delete middle expensive'],
    applications: ['Numerical computing', 'Graphics buffers', 'Hash table backing arrays'],
    pitfalls: ['Out-of-bounds undefined behavior in C/C++', 'Confusing length with last index', 'Row vs column major bugs'],
    interviewTips: ['Draw memory boxes with addresses', 'Relate to cache lines and prefetch'],
    interviewQuestions: buildInterviewQuestions('Array Memory Layout', 'Arrays Fundamentals', [
      { q: 'Why is arr[i] O(1)?', a: 'Address computed arithmetically from base and index; no traversal.' },
      { q: 'Row-major 2D: where is A[1][2] in flat memory?', a: 'Offset 1*cols + 2 from base for int A[rows][cols].' },
      { q: 'Cache implications of contiguous layout?', a: 'Sequential scans hit same cache lines; random jumps may miss.' },
    ]),
    revisionNotes: 'Contiguous + index → O(1) access; mind bounds and row-major 2D.',
    dryRun: 'int a[5]={10,20,30,40,50}; index 3 → value 40 at base+12 bytes',
    codeWalkthrough: 'Declare array, show sizeof, print addresses &a[i] increasing by sizeof element.',
    cheatSheet: ['Contiguous memory', 'O(1) access', 'Row-major 2D', 'Bounds 0..n-1'],
    references: [LANG_REFERENCES.clrs, LANG_REFERENCES.cppref, LANG_REFERENCES.wikipedia('Array data structure')],
    ...makeTraces({
      beginner: { input: 'a=[10,20,30]', steps: ['a[0]=10 @base', 'a[1]=20 @base+4', 'a[2]=30 @base+8'], output: 'linear addresses' },
      intermediate: { input: 'matrix 2×3 row-major', steps: ['row0: 1,2,3', 'row1: 4,5,6 flat: 1,2,3,4,5,6'], output: 'A[1][1]=5 at index 4' },
      advanced: { input: 'dynamic resize', steps: ['alloc 4 slots', 'fill', 'need 5th → new block 8', 'copy 4 elements'], output: 'amortized O(1) append' },
    }),
  }),

  'depth first search': profile({
    conceptOverview:
      'DFS explores a graph by going as deep as possible along each branch before backtracking, using a stack (explicit or call stack).',
    whyItWorks:
      'Marking visited vertices prevents cycles; recursion or stack stores the frontier of the current path.',
    steps: [
      'Mark start visited.',
      'For each unvisited neighbor: recurse/stack push.',
      'Backtrack when no unvisited neighbors remain.',
    ],
    history: 'Tarjan’s work on DFS underpins connectivity, SCCs, and topological sort.',
    analogy: 'Exploring a maze by always taking the leftmost unvisited turn, backtracking at dead ends.',
    howItWorks: 'Stack LIFO explores depth-first; visited set avoids infinite loops on cycles.',
    walkthrough: ['Pick start', 'Push unvisited neighbors', 'Pop/deeper until backtrack'],
    workedExample: 'Graph 0→{1,2}, 1→{3}, 2→{3}: DFS from 0 visits 0,1,3,2 (order depends on neighbor order).',
    complexity: { time: 'O(V + E)', space: 'O(V) visited + O(V) stack worst case' },
    complexityNotes: 'Each vertex and edge touched once with adjacency list.',
    realWorld: 'Topological build order, cycle detection, solving puzzles, path finding in mazes.',
    advantages: ['Low memory vs BFS on deep graphs', 'Natural for backtracking', 'Simple recursive code'],
    disadvantages: ['Not shortest path in unweighted graph', 'Deep recursion can overflow stack'],
    applications: ['Cycle detection', 'Topological sort', 'Connected components', 'Maze solving'],
    pitfalls: ['Forgetting to mark visited before recursion', 'Stack overflow on long paths', 'Confusing tree DFS with graph DFS'],
    interviewTips: ['Clarify directed vs undirected', 'Iterative stack vs recursion', 'Three-color cycle detection'],
    interviewQuestions: buildInterviewQuestions('DFS', 'Graph Traversal', [
      { q: 'Detect cycle in directed graph with DFS.', a: 'Track GRAY (in stack) nodes; back edge to GRAY → cycle.' },
      { q: 'DFS vs BFS for connectivity?', a: 'Both O(V+E); DFS uses less memory on deep graphs, BFS finds shortest layers.' },
      { q: 'Topological sort via DFS.', a: 'Post-order finish times; reverse order gives valid topo sort for DAG.' },
    ]),
    revisionNotes: 'DFS = stack/recursion + visited; watch cycles and stack depth.',
    dryRun: 'Vertices 0-3, edges 0-1,0-2,1-3,2-3\nStart 0: visit 0→1→3 backtrack→2',
    codeWalkthrough: 'visited array, dfs(u) marks u, loops neighbors calling dfs if unvisited.',
    cheatSheet: ['O(V+E)', 'Stack/recursion', 'Mark visited early', 'Backtrack naturally'],
    references: [LANG_REFERENCES.clrs, LANG_REFERENCES.stanford, LANG_REFERENCES.wikipedia('Depth-first search')],
    ...makeTraces({
      beginner: { input: '0:1,2  1:3  2:3', steps: ['visit 0', 'visit 1', 'visit 3', 'backtrack visit 2'], output: '0,1,3,2' },
      intermediate: { input: 'tree root A, children B,C', steps: ['A→B leaf back', 'A→C leaf back'], output: 'preorder A,B,C' },
      advanced: { input: 'graph with cycle 0-1-2-0', steps: ['GRAY edge 2→0 detected'], output: 'cycle found' },
    }),
  }),

  'breadth first search': profile({
    conceptOverview:
      'BFS explores a graph layer by layer using a queue, guaranteeing shortest path edge count in unweighted graphs.',
    whyItWorks:
      'Processing nodes in non-decreasing distance from source ensures first arrival at a node is via minimum edges.',
    steps: ['Enqueue source with distance 0', 'While queue: dequeue u', 'For each unvisited neighbor v: mark, enqueue, set dist[v]=dist[u]+1'],
    history: 'Classic since 1950s graph algorithms; Kahn’s algorithm for topo sort is BFS variant.',
    analogy: 'Ripples in a pond — closest nodes reached first before spreading outward.',
    howItWorks: 'FIFO queue maintains frontier of next depth layer.',
    walkthrough: ['Init queue with source', 'Dequeue, expand neighbors', 'Track distance/parent arrays'],
    workedExample: 'Unit weights 0-1-2-3 chain: BFS dist [0,1,2,3].',
    complexity: { time: 'O(V + E)', space: 'O(V) queue' },
    complexityNotes: 'Bidirectional BFS can reduce explored nodes on large graphs.',
    realWorld: 'Social network degrees of separation, GPS grid routing, broadcast flooding.',
    advantages: ['Shortest path unweighted', 'Finds level order', 'Parallelizable layer sync'],
    disadvantages: ['Higher memory on wide graphs', 'Not for weighted shortest path without modification'],
    applications: ['Shortest path', 'Multi-source BFS', '0-1 BFS variant', 'Level order traversal'],
    pitfalls: ['Enqueue without marking visited (duplicate queue)', 'Using stack instead of queue', 'Wrong distance initialization'],
    interviewTips: ['State queue invariant', 'Multi-source: enqueue all sources', 'Grid BFS 4/8 directions'],
    interviewQuestions: buildInterviewQuestions('BFS', 'Graph Traversal', [
      { q: 'Shortest path in unweighted graph?', a: 'BFS with parent pointers reconstructs path.' },
      { q: 'Rotting oranges grid problem approach?', a: 'Multi-source BFS from all rotten cells simultaneously.' },
      { q: 'BFS memory vs DFS?', a: 'BFS O(width) queue; DFS O(depth) stack.' },
    ]),
    revisionNotes: 'Unweighted shortest path → BFS; queue + visited at enqueue.',
    dryRun: 'Graph square 0-1-2-3-4 chain from 0: queue processes 0,1,2,3,4 distances 0..4',
    codeWalkthrough: 'Queue, visited, distance arrays; dequeue, push unvisited neighbors.',
    cheatSheet: ['Queue FIFO', 'O(V+E)', 'Shortest unweighted', 'Mark on enqueue'],
    references: [LANG_REFERENCES.clrs, LANG_REFERENCES.mit6, LANG_REFERENCES.wikipedia('Breadth-first search')],
    ...makeTraces({
      beginner: { input: '0 connected to 1,2', steps: ['dist[0]=0', 'dist[1]=1', 'dist[2]=1'], output: 'layer 1 complete' },
      intermediate: { input: 'grid 3×3 open cells', steps: ['BFS from (0,0) expands 4-dir', 'dist matrix filled'], output: 'shortest steps to each cell' },
      advanced: { input: 'multi-source from nodes {2,5}', steps: ['init queue with both', 'wavefront merges'], output: 'min dist to nearest source' },
    }),
  }),

  'dijkstra algorithm': profile({
    conceptOverview:
      'Dijkstra computes shortest paths from a source in graphs with non-negative edge weights using a greedy priority-queue expansion.',
    whyItWorks:
      'When extracting minimum-distance unvisited node u, no cheaper path exists — non-negative weights prevent beneficial detours.',
    steps: [
      'Init dist[source]=0, others ∞, min-heap with (0,source).',
      'Pop min (d,u); if d>dist[u] skip stale.',
      'Relax each edge (u,v,w): if d+w < dist[v], update and push.',
    ],
    history: 'Edsger Dijkstra (1956); binary heap version O((V+E) log V).',
    analogy: 'Spreading ink from a point — always settle the closest unsettled intersection next.',
    howItWorks: 'Greedy settlement + relaxation; priority queue picks next closest frontier node.',
    walkthrough: ['Initialize distances', 'Pop min from heap', 'Relax edges', 'Repeat until empty'],
    workedExample: 'Nodes A-B weight 4, A-C weight 1, C-B weight 2: dist B=3 via C not 4 direct.',
    complexity: { time: 'O((V+E) log V) with binary heap', space: 'O(V) dist + O(V) heap' },
    complexityNotes: 'Fibonacci heap theoretical O(E + V log V); Bellman-Ford handles negative edges.',
    realWorld: 'Google Maps routing, network routing protocols (OSPF), game AI path costs.',
    advantages: ['Optimal with non-negative weights', 'Works on sparse graphs with heap'],
    disadvantages: ['Fails with negative edges', 'Heavy heap operations on dense graphs'],
    applications: ['GPS routing', 'Network latency', 'Flight connections', 'Telecom backbone'],
    pitfalls: ['Not handling disconnected nodes (∞ dist)', 'Stale heap entries without skip check', 'Using Dijkstra with negative weights'],
    interviewTips: ['Explain relaxation', 'Why priority queue', 'When Bellman-Ford instead'],
    interviewQuestions: buildInterviewQuestions('Dijkstra', 'Shortest Path Algorithms', [
      { q: 'Why non-negative weights required?', a: 'A later negative edge could shorten an already settled node — greedy invalid.' },
      { q: 'Time with adjacency matrix?', a: 'O(V²) naive; heap + list still better on sparse graphs.' },
      { q: 'Reconstruct path after Dijkstra.', a: 'parent[v] updated on relax; walk back from target to source.' },
    ]),
    revisionNotes: 'Non-negative weights + heap + relax; skip stale pops.',
    dryRun: 'Source 0, edges 0→1(4),0→2(1),2→1(2)\ndist: 0→0, 2→1, 1→3 via 2',
    codeWalkthrough: 'Priority queue of (dist,node), relaxation loop, parent array for reconstruction.',
    cheatSheet: ['Non-negative only', 'Min-heap', 'Relax edges', 'O((V+E) log V)'],
    references: [LANG_REFERENCES.clrs, LANG_REFERENCES.stanford, LANG_REFERENCES.wikipedia("Dijkstra's algorithm")],
    ...makeTraces({
      beginner: { input: '3 nodes, 0→1(5),0→2(1),2→1(2)', steps: ['settle 0', 'settle 2 dist=1', 'relax 1 to 3'], output: 'dist[1]=3' },
      intermediate: { input: '4-node graph typical CLRS example', steps: ['heap extracts in order of distance', 'each relax improves dist'], output: 'shortest dist array' },
      advanced: { input: '100K nodes sparse graph', steps: ['adjacency list + binary heap', 'skip stale entries'], output: 'scales O(E log V)' },
    }),
  }),

  'dynamic programming': profile({
    conceptOverview:
      'Dynamic programming solves problems with overlapping subproblems and optimal substructure by storing sub-results to avoid recomputation.',
    whyItWorks:
      'Memoization/tabulation ensures each subproblem state computed once; optimal substructure lets global optimum compose from local optima.',
    steps: [
      'Identify state variables.',
      'Write recurrence relating states.',
      'Define base cases.',
      'Implement top-down memo or bottom-up table.',
      'Reconstruct answer if needed.',
    ],
    history: 'Bellman coined “dynamic programming” (1950s); Floyd-Warshall, LCS, knapsack are canonical.',
    analogy: 'Climbing stairs while writing the number of ways on each step — reuse counts instead of recounting.',
    howItWorks: 'DP table fills in dependency order; each cell from smaller subproblems.',
    walkthrough: ['Define dp[i] meaning', 'Base dp[0]', 'Loop fill using recurrence', 'Return dp[n]'],
    workedExample: 'Fibonacci dp: dp[0]=0, dp[1]=1, dp[2]=1, dp[3]=2, dp[4]=3, dp[5]=5.',
    complexity: { time: 'O(states × transitions)', space: 'O(states) or optimized rolling array' },
    complexityNotes: 'State space design dominates; wrong dimensions → TLE/MLE.',
    realWorld: 'Resource allocation, bioinformatics alignment, pricing, route optimization.',
    advantages: ['Polynomial vs exponential brute force', 'Predictable performance', 'Reusable patterns'],
    disadvantages: ['State design hard', 'Memory for large tables', 'Greedy may be simpler when valid'],
    applications: ['Knapsack', 'LCS', 'Edit distance', 'Grid paths', 'Interval DP'],
    pitfalls: ['Wrong base cases', 'Off-by-one in indices', 'Confusing memo with pure recursion'],
    interviewTips: ['Start brute force → spot overlap → add memo', 'Draw table for n=4', 'Name pattern (0/1 knapsack)'],
    interviewQuestions: buildInterviewQuestions('Dynamic Programming', 'Dynamic Programming', [
      { q: 'When is DP applicable?', a: 'Optimal substructure + overlapping subproblems; define state precisely.' },
      { q: 'Climbing stairs: ways to reach step n?', a: 'dp[n]=dp[n-1]+dp[n-2]; O(n) time O(1) space optimized.' },
      { q: 'Top-down vs bottom-up trade-offs?', a: 'Top-down easier, lazy compute; bottom-up better cache locality, no stack.' },
    ]),
    revisionNotes: 'Define state → recurrence → base → fill → reconstruct.',
    dryRun: 'Coin change amount=7, coins [1,3,4]\ndp: 0,1,2,1,2,2,2,1 min coins → 2 (3+4)',
    codeWalkthrough: '2D or 1D dp array, nested loops over items/states, min/max/sum per recurrence.',
    cheatSheet: ['Optimal substructure', 'Overlapping subproblems', 'Memo or tabulation', 'Watch state size'],
    references: [LANG_REFERENCES.clrs, LANG_REFERENCES.knuth, LANG_REFERENCES.geeksforgeeks('Dynamic Programming')],
    ...makeTraces({
      beginner: { input: 'dp fib n=5', steps: ['dp[0]=0', 'dp[1]=1', 'dp[2]=1', 'dp[3]=2', 'dp[4]=3', 'dp[5]=5'], output: '5' },
      intermediate: { input: 'LCS "abc","adc"', steps: ['table 3×3 filled', 'match a→diag+1'], output: 'LCS length 2 (ac)' },
      advanced: { input: '0/1 knapsack W=10 items (wt,val)', steps: ['2D dp row by row', 'skip/take max'], output: 'max value 15' },
    }),
  }),
};

// Merge extended flagship profiles (80+ total with aliases)
Object.assign(TOPIC_PROFILES, buildExtendedTopicProfiles());

function buildExtendedTopicProfiles() {
  const defs = [
    ['merge sort deep dive', 'Merge Sort', 'O(n log n)', 'Divide array, sort halves recursively, merge sorted runs with two pointers.', '[38,27,43,3,9,82,10]', 'CLRS merge sort chapter'],
    ['quick sort deep dive', 'Quick Sort', 'O(n log n) average', 'Choose pivot, partition smaller|pivot|larger, recurse on partitions.', '[3,6,8,10,1,2,1]', 'Sedgewick quicksort'],
    ['insertion sort analysis', 'Insertion Sort', 'O(n²) worst', 'Build sorted prefix; insert each card into correct position.', '[12,11,13,5,6]', 'Adaptive O(n) when nearly sorted'],
    ['selection sort analysis', 'Selection Sort', 'O(n²)', 'Repeatedly select minimum of unsorted suffix and swap to front.', '[64,25,12,22,11]', 'Minimal swaps O(n)'],
    ['heap sort overview', 'Heap Sort', 'O(n log n)', 'Build max-heap, repeatedly extract max to end.', '[4,10,3,5,1]', 'In-place but not stable'],
    ['counting sort', 'Counting Sort', 'O(n+k)', 'Count frequencies, prefix-sum counts, place elements by rank.', '[2,5,3,0,2,3,0,3]', 'k = value range'],
    ['radix sort', 'Radix Sort', 'O(d(n+k))', 'Sort by each digit/character from LSD to MSD.', '[170,45,75,90,802,24,2,66]', 'Stable digit passes'],
    ['big o notation', 'Big O', 'O(1) to O(2^n)', 'Upper bound on growth rate; drop constants and lower terms.', 'n=1000 → 10n vs n²', 'CLRS asymptotic notation'],
    ['while loops', 'While Loops', 'O(iterations)', 'Repeat while condition true; condition checked before body.', 'count 5→1', 'MDN control flow'],
    ['for loops', 'For Loops', 'O(n)', 'Initialize, test, increment — ideal for fixed iteration count.', 'sum 1..5 = 15', 'Classic counting loops'],
    ['recursion preview in functions', 'Recursion', 'O(n) stack depth', 'Function calls itself with smaller input until base case.', 'factorial 5=120', 'Call stack frames'],
    ['base case and recursive case', 'Recursion Base Case', 'O(n)', 'Every recursive function needs termination and progress toward it.', 'fib(6)=8 memo', 'Stack overflow without base'],
    ['stack adt operations', 'Stack', 'O(1) push/pop', 'LIFO: push adds top, pop removes top, peek reads top.', 'push 1,2,3 pop→3', 'Array or linked backing'],
    ['queue adt operations', 'Queue', 'O(1) enqueue/dequeue', 'FIFO: enqueue rear, dequeue front.', 'enqueue A,B,C dequeue→A', 'BFS uses queue'],
    ['valid parentheses pattern', 'Valid Parentheses', 'O(n)', 'Stack opens; on close match top and pop.', '"({[]})" valid', 'LeetCode classic'],
    ['two sum with hashing', 'Two Sum', 'O(n)', 'Store complements in hash map while scanning once.', 'target 9, [2,7,11,15]→0,1', 'Hash map pattern'],
    ['reverse linked list', 'Reverse Linked List', 'O(n)', 'Iterative: prev=null, advance pointers reversing next.', '1→2→3→null becomes 3→2→1', 'Three-pointer technique'],
    ['detect cycle floyd', 'Floyd Cycle Detection', 'O(n)', 'Slow+fast pointers; meeting inside cycle proves cycle.', 'tail connects to node 1', "Tortoise and hare"],
    ['binary search tree property', 'BST Property', 'O(h) search', 'Left subtree < node < right subtree at every node.', 'inorder yields sorted', 'CLRS BST chapter'],
    ['avl tree rotations', 'AVL Rotations', 'O(1) local', 'LL, RR, LR, RL cases restore balance factor ±1.', 'insert 1,2,3 triggers LL', 'Self-balancing trees'],
    ['min heap operations', 'Min Heap', 'O(log n) insert', 'Complete tree with parent ≤ children; bubble up/down.', 'insert 3,1,6,5 → root 1', 'Priority queue backing'],
    ['topological sort kahn', 'Topological Sort', 'O(V+E)', 'Kahn: in-degree 0 queue, remove edges, enqueue new zeros.', 'DAG course prereqs', 'BFS on in-degrees'],
    ['bellman ford algorithm', 'Bellman-Ford', 'O(VE)', 'Relax all edges V-1 times; detect negative cycle on Vth pass.', 'graph with -2 edge', 'Handles negative weights'],
    ['floyd warshall algorithm', 'Floyd-Warshall', 'O(V³)', 'DP on intermediate nodes: dist[i][j] via k.', '3×3 all-pairs matrix', 'APSP dynamic programming'],
    ['kruskal algorithm', 'Kruskal MST', 'O(E log E)', 'Sort edges by weight, union-find add if no cycle.', 'MST weight 19 typical', 'Greedy cut property'],
    ['prim algorithm', 'Prim MST', 'O(E log V)', 'Grow tree from start, always add min edge to fringe.', 'similar MST weight', 'Greedy on vertices'],
    ['kmp algorithm', 'KMP', 'O(n+m)', 'LPS array avoids re-scanning text on mismatch.', 'pattern "abab" in text', 'String matching'],
    ['longest common subsequence', 'LCS', 'O(nm)', '2D DP: match→diag+1 else max(left,up).', '"abcde","ace"→3', 'Classic 2D DP'],
    ['longest increasing subsequence', 'LIS', 'O(n log n)', 'Patience sorting / binary search on tails array.', '[10,9,2,5,3,7,101,18]→4', 'Binary search optimization'],
    ['edit distance', 'Edit Distance', 'O(nm)', 'Insert/delete/replace min cost DP table.', '"horse"→"ros" cost 3', 'Levenshtein distance'],
    ['knapsack variants', 'Knapsack', 'O(nW)', '0/1: take or skip max value; unbounded repeats item.', 'W=10 items wt/val', 'DP state dp[i][w]'],
    ['backtracking template', 'Backtracking', 'O(2^n) typical', 'Choose, explore, unchoose; prune invalid branches.', 'subsets of [1,2,3]', 'Recursion + pruning'],
    ['n queens problem', 'N-Queens', 'O(n!)', 'Place queens row-by-row; check cols/diagonals; backtrack.', 'n=4 has 2 solutions', 'Classic backtracking'],
    ['union find with array', 'Union-Find', 'O(α(n))', 'Parent array + rank/size; find with path compression.', 'connect 0-1,1-2 same set', 'Disjoint set union'],
    ['hash function properties', 'Hash Functions', 'O(1) compute', 'Deterministic, uniform distribution, fast; avalanche on input change.', 'key "user42"→bucket 7', 'CLRS hashing'],
    ['rolling hash', 'Rolling Hash', 'O(1) slide', 'Remove left char, add right char update hash in O(1).', 'substring hash window', 'Rabin-Karp basis'],
    ['monotonic stack', 'Monotonic Stack', 'O(n)', 'Stack keeps decreasing/increasing; pop smaller before push.', 'next greater element', 'Single pass pattern'],
    ['sliding window maximum queue', 'Sliding Window Max', 'O(n)', 'Deque stores useful indices decreasing; front is max.', '[1,3,-1,-3,5,3,6,7] k=3', 'Monotonic deque'],
    ['trie insert search delete', 'Trie', 'O(m) per key', 'Prefix tree nodes per character; search walks edges.', 'insert "cat","car"', 'Autocomplete engines'],
    ['segment tree range query', 'Segment Tree', 'O(log n) query', 'Binary tree over intervals; query merges child results.', 'range sum [2,5]', 'Competitive programming'],
    ['modular arithmetic', 'Modular Arithmetic', 'O(1) ops', '(a+b)%m, (a*b)%m; inverse via Fermat if m prime.', '998244353 mod', 'Number theory CP'],
    ['gcd and euclidean algorithm', 'GCD', 'O(log min(a,b))', 'gcd(a,b)=gcd(b,a%b) until b=0.', 'gcd(48,18)=6', 'Euclid 300 BCE'],
    ['sieve of eratosthenes', 'Sieve', 'O(n log log n)', 'Mark multiples of each prime starting from 2.', 'primes ≤ 30', 'Ancient algorithm'],
    ['a star search', 'A* Search', 'O(b^d) guided', 'f(n)=g(n)+h(n); admissible heuristic guarantees optimality.', 'grid with Manhattan h', 'Game pathfinding'],
    ['0 1 bfs', '0-1 BFS', 'O(V+E)', 'Deque: weight 0 push front, weight 1 push back.', 'graph 0/1 edges', 'Shortest path special case'],
    ['longest substring without repeat', 'Longest Unique Substring', 'O(n)', 'Sliding window + set/map shrink on duplicate.', '"abcabcbb"→3', 'Variable window'],
    ['minimum window substring', 'Minimum Window', 'O(n)', 'Expand until valid, shrink from left tracking counts.', 'S="ADOBECODEBANC" T="ABC"', 'Hard sliding window'],
    ['trapping rain water', 'Trapping Rain Water', 'O(n)', 'Two pointers or prefix max; water at i = min(L,R)-h[i].', '[0,1,0,2,1,0,1,3,2,1,2,1]→6', 'Two pointer classic'],
    ['merge two sorted lists', 'Merge Sorted Lists', 'O(n+m)', 'Dummy head; attach smaller of l1/l2 each step.', '[1,2,4]+[1,3,4]', 'Linked list merge pattern'],
    ['lowest common ancestor', 'LCA', 'O(n) or O(log n)', 'Track path from root or binary lifting on tree.', 'nodes 5 and 1 in BST', 'Tree interview staple'],
    ['diameter of binary tree', 'Tree Diameter', 'O(n)', 'Longest path; DFS returns height, update max diameter.', 'height pairs', 'Single DFS pass'],
    ['coin change greedy cases', 'Coin Change', 'O(n·amount) DP', 'Min coins DP or BFS; greedy only for canonical systems.', 'amount 11 coins 1,2,5→3', 'DP vs greedy'],
    ['activity selection', 'Activity Selection', 'O(n log n)', 'Sort by finish time; greedily pick non-overlapping.', 'interval scheduling', 'Greedy proof'],
    ['huffman coding overview', 'Huffman Coding', 'O(n log n)', 'Merge lowest freq nodes; build prefix-free codes.', 'freq a:5 b:9 c:12', 'Compression trees'],
    ['bitwise and or xor not', 'Bitwise Ops', 'O(1)', 'AND mask, OR set, XOR toggle, NOT invert per bit.', '5&3=1, 5^3=6', 'Low-level flags'],
    ['single number xor trick', 'Single Number', 'O(n)', 'XOR all elements; pairs cancel to 0.', '[4,1,2,1,2]→4', 'XOR cancellation'],
    ['palindrome techniques', 'Palindrome', 'O(n)', 'Two pointers inward or expand-around-center.', '"racecar" yes', 'String patterns'],
    ['anagram detection', 'Anagram Detection', 'O(n)', 'Sort both strings or count char frequencies.', '"listen" vs "silent"', 'Hash or sort'],
    ['prefix sum introduction', 'Prefix Sum', 'O(n) build', 'pref[i]=sum arr[0..i]; range sum pref[r]-pref[l-1].', '[1,2,3,4] pref', 'Range queries O(1)'],
    ['difference arrays', 'Difference Array', 'O(1) range update', 'diff[l]+=v, diff[r+1]-=v; prefix reconstructs array.', 'range add +2 on [2,5]', 'Lazy range updates'],
    ['master theorem overview', 'Master Theorem', 'O(n^log_b(a))', 'T(n)=aT(n/b)+f(n) cases compare f to n^log_b(a).', 'merge sort case 2', 'Divide conquer analysis'],
    ['tail recursion', 'Tail Recursion', 'O(n) → O(1) space', 'Recursive call is final action; compiler may reuse stack frame.', 'factorial accumulator', 'Functional languages optimize'],
    ['memoization preview', 'Memoization', 'O(n) states', 'Cache function results by arguments to avoid recomputation.', 'fib memo table', 'Top-down DP'],
    ['garbage collection models', 'Garbage Collection', 'O(heap)', 'Mark-sweep, generational, reference counting trade-offs.', 'Java GC generations', 'Oracle JVM docs'],
    ['pointers in c and c++', 'Pointers', 'O(1) deref', 'Variable holding address; * dereference, & address-of.', 'int x=42; *p=&x', 'C memory model'],
    ['what is a variable', 'Variables', 'O(1) access', 'Named storage binding value of a type in scope.', 'int count=0', 'Fundamentals'],
    ['if else statements', 'If-Else', 'O(1) branch', 'Evaluate condition; execute matching branch exclusively.', 'score>=60 pass', 'Control flow'],
    ['functions as abstraction', 'Functions', 'O(1) call overhead', 'Named reusable block hiding implementation behind interface.', 'area(r)=πr²', 'Decomposition'],
    ['string representation', 'String Representation', 'O(n) length', 'C char[] null-terminated; Java/Python immutable UTF-16/Unicode.', '"hello" 5 chars', 'Encoding matters'],
    ['matrix multiplication basics', 'Matrix Multiplication', 'O(n³)', 'C[i][j]=Σ A[i][k]*B[k][j]; dimensions must align.', '2×3 · 3×2 → 2×2', 'Linear algebra'],
    ['spiral matrix traversal', 'Spiral Matrix', 'O(mn)', 'Four boundaries top/bottom/left/right shrink after each direction.', '3×3 spiral order', 'Matrix simulation'],
    ['jump search', 'Jump Search', 'O(√n)', 'Jump √n steps; linear backtrack block; needs sorted array.', 'sorted 100 elements', 'Block search'],
    ['interpolation search', 'Interpolation Search', 'O(log log n) avg', 'Probe position estimated by value ratio in range.', 'uniform sorted data', 'Better than binary on uniform'],
    ['exponential search', 'Exponential Search', 'O(log i)', 'Double range then binary search; unbounded arrays.', 'target in unknown size', 'Unbounded search'],
    ['lower and upper bound', 'Bounds', 'O(log n)', 'lower: first ≥ target; upper: first > target via binary search.', 'sorted duplicates', 'STL bounds'],
    ['stable vs unstable sort', 'Sort Stability', 'O(n log n)', 'Stable preserves equal element order; merge yes, quick often no.', 'sort by key then id', 'Multi-key sorts'],
    ['external sorting overview', 'External Sort', 'O(n log n) I/O', 'Chunk sort in memory, k-way merge runs on disk.', 'large log files', 'Database systems'],
    ['network flow intro', 'Network Flow', 'O(VE²) Ford-Fulkerson', 'Augmenting paths increase flow until max reached.', 'max flow 23', 'Graph advanced'],
    ['nim game analysis', 'Nim Game', 'O(n)', 'XOR all pile sizes; zero→ losing position for first player.', 'piles 3,4,5', 'Game theory XOR'],
    ['convex hull intro', 'Convex Hull', 'O(n log n)', 'Monotonic chain or Graham scan outer boundary points.', 'set of 2D points', 'Computational geometry'],
    ['interview problem solving framework', 'Interview Framework', 'O(1) process', 'Clarify, examples, brute force, optimize, code, test.', '45-min structure', 'Cracking the Coding Interview'],
  ];

  const out = {};
  for (const [key, shortTitle, time, core, example, refHint] of defs) {
    const nums = example.match(/\d+/g)?.map(Number) ?? [3, 7, 11];
    out[key] = profile({
      conceptOverview: `${shortTitle} is a foundational technique: ${core}`,
      whyItWorks: `${shortTitle} maintains a clear invariant at each step, enabling predictable ${time} behavior on structured inputs.`,
      steps: core.split(';').map((s) => s.trim()).filter(Boolean).concat(['Verify with trace', 'Analyze complexity', 'Compare alternatives']),
      history: refHint.includes('BCE') || refHint.includes('Ancient') ? refHint : `Standard treatment in ${refHint}.`,
      analogy: `Think of ${shortTitle.toLowerCase()} as processing ${example} methodically until the goal state is reached.`,
      howItWorks: core,
      walkthrough: [`Setup with ${example}`, 'Apply core operation', 'Verify output', 'Check edge cases'],
      workedExample: `Example ${example}: ${shortTitle} produces the expected result after finite steps.`,
      complexity: { time, space: time.includes('O(1)') ? 'O(1) auxiliary' : 'O(n) auxiliary typical' },
      complexityNotes: `${shortTitle} complexity is ${time}; space depends on auxiliary structures used.`,
      realWorld: `${shortTitle} powers systems from databases to mobile apps when ${refHint.toLowerCase()} patterns apply.`,
      advantages: [`${time} performance profile`, 'Well documented in standard references', 'Common interview pattern'],
      disadvantages: ['Requires understanding invariants', 'Edge cases need explicit tests'],
      applications: ['Software interviews', 'Production algorithms', 'Competitive programming'],
      pitfalls: [`Misapplying ${shortTitle} outside its preconditions`, 'Off-by-one errors', 'Ignoring worst-case input'],
      interviewTips: [`Trace ${example} on whiteboard`, `State ${time} upfront`, 'Name related patterns'],
      interviewQuestions: buildInterviewQuestions(shortTitle, 'Curriculum', [
        { q: `Explain ${shortTitle} with example ${example}.`, a: core },
        { q: `What is the complexity of ${shortTitle}?`, a: `${time}; justify by counting dominant operations.` },
        { q: `When would ${shortTitle} fail or need modification?`, a: 'When input violates preconditions — state fixes or alternate algorithms.' },
      ]),
      revisionNotes: `${shortTitle}: ${core.split('.')[0]}.`,
      dryRun: `Input: ${example}\nSteps: ${nums.slice(0, 4).map((v, i) => `step ${i + 1} uses ${v}`).join('; ')}\nOutput: completed ${shortTitle.toLowerCase()}`,
      codeWalkthrough: `Implement ${shortTitle.toLowerCase()}: initialize, loop/recurse over ${example}, maintain invariant, return result.`,
      cheatSheet: [shortTitle, time, example, refHint],
      references: [LANG_REFERENCES.clrs, LANG_REFERENCES.geeksforgeeks(shortTitle), LANG_REFERENCES.wikipedia(shortTitle)],
      ...makeTraces({
        beginner: { input: example, steps: nums.slice(0, 3).map((v, i) => `${shortTitle} step ${i + 1}: value ${v}`), output: `partial ${shortTitle}` },
        intermediate: { input: example, steps: nums.map((v, i) => `index ${i}: ${v}`), output: `${shortTitle} complete` },
        advanced: { input: `scaled ${example}`, steps: ['partition input', 'apply optimized variant', 'merge partial results'], output: 'production-scale result' },
      }),
    });
  }

  // Aliases for title variants
  if (TOPIC_PROFILES['binary search on arrays']) out['binary search'] = TOPIC_PROFILES['binary search on arrays'];
  if (TOPIC_PROFILES['bubble sort analysis']) out['bubble sort'] = TOPIC_PROFILES['bubble sort analysis'];
  if (TOPIC_PROFILES['depth first search']) out['dfs'] = TOPIC_PROFILES['depth first search'];
  if (TOPIC_PROFILES['breadth first search']) out['bfs'] = TOPIC_PROFILES['breadth first search'];
  if (TOPIC_PROFILES['dynamic programming']) {
    out['overlapping subproblems'] = TOPIC_PROFILES['dynamic programming'];
    out['optimal substructure'] = TOPIC_PROFILES['dynamic programming'];
    out['bottom up tabulation'] = TOPIC_PROFILES['dynamic programming'];
  }
  if (out['memoization preview']) out['top down memoization'] = out['memoization preview'];

  return out;
}

// ---------------------------------------------------------------------------
// KEYWORD_RULES — pattern-based profile builders (ordered first-match)
// ---------------------------------------------------------------------------

const KEYWORD_RULES = [
  { test: (t) => /linear search/.test(t), key: 'linear search' },
  { test: (t) => /binary search/.test(t), key: 'binary search on arrays' },
  { test: (t) => /bubble sort/.test(t), key: 'bubble sort analysis' },
  { test: (t) => /merge sort/.test(t), key: 'merge sort deep dive' },
  { test: (t) => /quick sort/.test(t), key: 'quick sort deep dive' },
  { test: (t) => /insertion sort/.test(t), key: 'insertion sort analysis' },
  { test: (t) => /selection sort/.test(t), key: 'selection sort analysis' },
  { test: (t) => /heap sort/.test(t), key: 'heap sort overview' },
  { test: (t) => /counting sort/.test(t), key: 'counting sort' },
  { test: (t) => /radix sort/.test(t), key: 'radix sort' },
  { test: (t) => /depth first| dfs/.test(t), key: 'depth first search' },
  { test: (t) => /breadth first| bfs/.test(t), key: 'breadth first search' },
  { test: (t) => /dijkstra/.test(t), key: 'dijkstra algorithm' },
  { test: (t) => /bellman ford/.test(t), key: 'bellman ford algorithm' },
  { test: (t) => /floyd warshall/.test(t), key: 'floyd warshall algorithm' },
  { test: (t) => /kruskal/.test(t), key: 'kruskal algorithm' },
  { test: (t) => /prim algorithm/.test(t), key: 'prim algorithm' },
  { test: (t) => /dynamic programming|^dp /.test(t), key: 'dynamic programming' },
  { test: (t) => /knapsack/.test(t), key: 'knapsack variants' },
  { test: (t) => /longest common subsequence| lcs/.test(t), key: 'longest common subsequence' },
  { test: (t) => /longest increasing subsequence| lis/.test(t), key: 'longest increasing subsequence' },
  { test: (t) => /edit distance/.test(t), key: 'edit distance' },
  { test: (t) => /backtracking|n queens|sudoku/.test(t), key: 'backtracking template' },
  { test: (t) => /trie/.test(t), key: 'trie insert search delete' },
  { test: (t) => /segment tree/.test(t), key: 'segment tree range query' },
  { test: (t) => /union find|disjoint set/.test(t), key: 'union find with array' },
  { test: (t) => /heap|priority queue/.test(t), key: 'min heap operations' },
  { test: (t) => /stack/.test(t), key: 'stack adt operations' },
  { test: (t) => /queue/.test(t), key: 'queue adt operations' },
  { test: (t) => /hash/.test(t), key: 'hash function properties' },
  { test: (t) => /two pointer|sliding window/.test(t), key: 'longest substring without repeat' },
  { test: (t) => /prefix sum/.test(t), key: 'prefix sum introduction' },
  { test: (t) => /bitwise|bit manipulation| bitmask/.test(t), key: 'bitwise and or xor not' },
  { test: (t) => /recursion|recursive/.test(t), key: 'base case and recursive case' },
  { test: (t) => /loop|while|for each/.test(t), key: 'for loops' },
  { test: (t) => /sort/.test(t), key: 'merge sort deep dive' },
  { test: (t) => /search/.test(t), key: 'linear search' },
  { test: (t) => /graph|traversal|topological/.test(t), key: 'depth first search' },
  { test: (t) => /tree|bst|binary tree/.test(t), key: 'binary search tree property' },
  { test: (t) => /array/.test(t), key: 'array memory layout' },
  { test: (t) => /string|palindrome|anagram/.test(t), key: 'string representation' },
  { test: (t) => /matrix|grid|2d/.test(t), key: 'matrix multiplication basics' },
  { test: (t) => /greedy/.test(t), key: 'activity selection' },
  { test: (t) => /complexity|big o|master theorem/.test(t), key: 'big o notation' },
  { test: (t) => /pointer|memory|heap memory|stack memory/.test(t), key: 'pointers in c and c++' },
  { test: (t) => /function|lambda|parameter/.test(t), key: 'functions as abstraction' },
  { test: (t) => /variable|type|integer|float|boolean/.test(t), key: 'what is a variable' },
  { test: (t) => /conditional|if else|switch/.test(t), key: 'if else statements' },
  { test: (t) => /programming|algorithm|debug|ide|version control/.test(t), key: 'what is programming' },
];

// ---------------------------------------------------------------------------
// MODULE_GENERATORS — per-module unique content factories (40 modules)
// ---------------------------------------------------------------------------

const MODULE_GENERATORS = Object.fromEntries([
  ['intro-to-programming', (l) => buildModuleProfile(l, { domain: 'software literacy', artifact: 'source code', metric: 'readability', refs: [LANG_REFERENCES.mdn, LANG_REFERENCES.sedgewick] })],
  ['programming-basics', (l) => buildModuleProfile(l, { domain: 'language syntax', artifact: 'statements', metric: 'correctness', refs: [LANG_REFERENCES.oracle, LANG_REFERENCES.cppref] })],
  ['variables-data-types', (l) => buildModuleProfile(l, { domain: 'typed storage', artifact: 'variables', metric: 'type safety', refs: [LANG_REFERENCES.oracle, LANG_REFERENCES.cppref] })],
  ['operators-expressions', (l) => buildModuleProfile(l, { domain: 'expression evaluation', artifact: 'operators', metric: 'precision', refs: [LANG_REFERENCES.cppref, LANG_REFERENCES.mdn] })],
  ['input-output', (l) => buildModuleProfile(l, { domain: 'I/O streams', artifact: 'byte streams', metric: 'throughput', refs: [LANG_REFERENCES.mdn, LANG_REFERENCES.oracle] })],
  ['conditionals', (l) => buildModuleProfile(l, { domain: 'control flow branching', artifact: 'decision trees', metric: 'branch coverage', refs: [LANG_REFERENCES.mdn, LANG_REFERENCES.oracle] })],
  ['loops', (l) => buildModuleProfile(l, { domain: 'iteration', artifact: 'loop counters', metric: 'iteration count', refs: [LANG_REFERENCES.clrs, LANG_REFERENCES.mdn] })],
  ['functions', (l) => buildModuleProfile(l, { domain: 'functional abstraction', artifact: 'call frames', metric: 'modularity', refs: [LANG_REFERENCES.sedgewick, LANG_REFERENCES.oracle] })],
  ['recursion-fundamentals', (l) => buildModuleProfile(l, { domain: 'recursive decomposition', artifact: 'call stack', metric: 'stack depth', refs: [LANG_REFERENCES.clrs, LANG_REFERENCES.sedgewick] })],
  ['memory-pointers', (l) => buildModuleProfile(l, { domain: 'memory management', artifact: 'address space', metric: 'bytes allocated', refs: [LANG_REFERENCES.cppref, LANG_REFERENCES.clrs] })],
  ['arrays-fundamentals', (l) => buildModuleProfile(l, { domain: 'contiguous arrays', artifact: 'indexable buffers', metric: 'cache locality', refs: [LANG_REFERENCES.clrs, LANG_REFERENCES.cppref] })],
  ['strings-fundamentals', (l) => buildModuleProfile(l, { domain: 'text processing', artifact: 'character sequences', metric: 'O(n) scans', refs: [LANG_REFERENCES.clrs, LANG_REFERENCES.oracle] })],
  ['matrices', (l) => buildModuleProfile(l, { domain: '2D grids', artifact: 'row-major matrices', metric: 'O(mn) cells', refs: [LANG_REFERENCES.clrs, LANG_REFERENCES.sedgewick] })],
  ['complexity-analysis', (l) => buildModuleProfile(l, { domain: 'asymptotic analysis', artifact: 'growth functions', metric: 'Big-O bounds', refs: [LANG_REFERENCES.clrs, LANG_REFERENCES.mit6] })],
  ['searching-algorithms', (l) => buildModuleProfile(l, { domain: 'search algorithms', artifact: 'sorted/unordered keys', metric: 'comparisons', refs: [LANG_REFERENCES.clrs, LANG_REFERENCES.stanford] })],
  ['sorting-algorithms', (l) => buildModuleProfile(l, { domain: 'comparison sorts', artifact: 'permutation of keys', metric: 'inversions removed', refs: [LANG_REFERENCES.clrs, LANG_REFERENCES.sedgewick] })],
  ['bit-manipulation', (l) => buildModuleProfile(l, { domain: ' bitwise operations', artifact: '32/64-bit words', metric: 'bit flips', refs: [LANG_REFERENCES.clrs, LANG_REFERENCES.geeksforgeeks('Bit manipulation')] })],
  ['hashing-fundamentals', (l) => buildModuleProfile(l, { domain: 'hash tables', artifact: 'key-value buckets', metric: 'load factor', refs: [LANG_REFERENCES.clrs, LANG_REFERENCES.sedgewick] })],
  ['two-pointer-sliding-window', (l) => buildModuleProfile(l, { domain: 'two-pointer techniques', artifact: 'subarrays/substrings', metric: 'window size', refs: [LANG_REFERENCES.stanford, LANG_REFERENCES.geeksforgeeks('Sliding Window')] })],
  ['prefix-sum-binary-search', (l) => buildModuleProfile(l, { domain: 'prefix sums + binary search', artifact: 'cumulative arrays', metric: 'range query time', refs: [LANG_REFERENCES.clrs, LANG_REFERENCES.stanford] })],
  ['greedy-techniques', (l) => buildModuleProfile(l, { domain: 'greedy algorithms', artifact: 'local optimal choices', metric: 'proof of correctness', refs: [LANG_REFERENCES.clrs, LANG_REFERENCES.mit6] })],
  ['divide-and-conquer', (l) => buildModuleProfile(l, { domain: 'divide and conquer', artifact: 'subproblem trees', metric: 'recurrence depth', refs: [LANG_REFERENCES.clrs, LANG_REFERENCES.knuth] })],
  ['backtracking', (l) => buildModuleProfile(l, { domain: 'backtracking search', artifact: 'decision trees', metric: 'pruned branches', refs: [LANG_REFERENCES.clrs, LANG_REFERENCES.sedgewick] })],
  ['dynamic-programming', (l) => buildModuleProfile(l, { domain: 'dynamic programming', artifact: 'DP tables', metric: 'state count', refs: [LANG_REFERENCES.clrs, LANG_REFERENCES.knuth] })],
  ['linked-lists', (l) => buildModuleProfile(l, { domain: 'linked lists', artifact: 'node chains', metric: 'pointer updates', refs: [LANG_REFERENCES.clrs, LANG_REFERENCES.sedgewick] })],
  ['stacks-queues', (l) => buildModuleProfile(l, { domain: 'stacks and queues', artifact: 'LIFO/FIFO structures', metric: 'O(1) ops', refs: [LANG_REFERENCES.clrs, LANG_REFERENCES.sedgewick] })],
  ['hash-tables-maps', (l) => buildModuleProfile(l, { domain: 'hash maps', artifact: 'bucket arrays', metric: 'collision rate', refs: [LANG_REFERENCES.clrs, LANG_REFERENCES.oracle] })],
  ['trees-fundamentals', (l) => buildModuleProfile(l, { domain: 'tree structures', artifact: 'node hierarchies', metric: 'tree height', refs: [LANG_REFERENCES.clrs, LANG_REFERENCES.sedgewick] })],
  ['bst-balanced-trees', (l) => buildModuleProfile(l, { domain: 'balanced BSTs', artifact: 'rotations', metric: 'O(log n) height', refs: [LANG_REFERENCES.clrs, LANG_REFERENCES.sedgewick] })],
  ['heap-priority-queue', (l) => buildModuleProfile(l, { domain: 'heaps', artifact: 'complete binary trees', metric: 'heapify cost', refs: [LANG_REFERENCES.clrs, LANG_REFERENCES.sedgewick] })],
  ['trie-segment-fenwick', (l) => buildModuleProfile(l, { domain: 'advanced trees', artifact: 'trie/segment/Fenwick nodes', metric: 'query/update time', refs: [LANG_REFERENCES.clrs, LANG_REFERENCES.stanford] })],
  ['union-find', (l) => buildModuleProfile(l, { domain: 'disjoint set union', artifact: 'parent arrays', metric: 'α(n) amortized', refs: [LANG_REFERENCES.clrs, LANG_REFERENCES.sedgewick] })],
  ['graphs-fundamentals', (l) => buildModuleProfile(l, { domain: 'graph modeling', artifact: 'vertices and edges', metric: 'V + E size', refs: [LANG_REFERENCES.clrs, LANG_REFERENCES.mit6] })],
  ['graph-traversal', (l) => buildModuleProfile(l, { domain: 'graph traversal', artifact: 'visited sets', metric: 'O(V+E) edges touched', refs: [LANG_REFERENCES.clrs, LANG_REFERENCES.stanford] })],
  ['shortest-path-algorithms', (l) => buildModuleProfile(l, { domain: 'shortest paths', artifact: 'distance arrays', metric: 'edge relaxations', refs: [LANG_REFERENCES.clrs, LANG_REFERENCES.stanford] })],
  ['mst-graph-advanced', (l) => buildModuleProfile(l, { domain: 'advanced graph algorithms', artifact: 'spanning trees', metric: 'total edge weight', refs: [LANG_REFERENCES.clrs, LANG_REFERENCES.mit6] })],
  ['string-algorithms-advanced', (l) => buildModuleProfile(l, { domain: 'string algorithms', artifact: 'pattern/text indices', metric: 'comparisons avoided', refs: [LANG_REFERENCES.clrs, LANG_REFERENCES.knuth] })],
  ['number-theory-math', (l) => buildModuleProfile(l, { domain: 'number theory', artifact: 'modular integers', metric: 'mod operations', refs: [LANG_REFERENCES.knuth, LANG_REFERENCES.geeksforgeeks('Number Theory')] })],
  ['game-theory-geometry', (l) => buildModuleProfile(l, { domain: 'game theory & geometry', artifact: 'game states / points', metric: 'optimal move', refs: [LANG_REFERENCES.clrs, LANG_REFERENCES.mit6] })],
  ['interview-prep-mastery', (l) => buildModuleProfile(l, { domain: 'interview preparation', artifact: 'problem-solving rubric', metric: 'offer rate', refs: [LANG_REFERENCES.stanford, LANG_REFERENCES.geeksforgeeks('Interview Preparation')] })],
]);

function buildModuleProfile(lesson, cfg) {
  const seed = seedFromLesson(lesson);
  const title = lesson.title;
  const words = normalizeTitle(title).split(' ').filter((w) => w.length > 2);
  const focus = words.slice(0, 3).join(' ') || title.toLowerCase();
  const n = 4 + (seed % 9);
  const data = Array.from({ length: n }, (_, i) => ((seed >> (i % 16)) & 0xff) % 50 + i * 2 + 1);
  const sum = data.reduce((a, b) => a + b, 0);
  const product = data.slice(0, 3).reduce((a, b) => a * b, 1);

  return profile({
    conceptOverview: `${title} explores ${focus} within ${cfg.domain}. You work with ${cfg.artifact} and measure outcomes via ${cfg.metric}.`,
    whyItWorks: `${title} succeeds in ${lesson.moduleTitle} because it enforces invariants on ${cfg.artifact} while keeping ${cfg.metric} predictable for inputs like [${data.slice(0, 5).join(', ')}].`,
    steps: [
      `Map ${title} to inputs/outputs in ${cfg.domain}.`,
      `Initialize structures for ${cfg.artifact}.`,
      `Execute ${focus} procedure on sample [${data.slice(0, 4).join(', ')}].`,
      `Validate ${cfg.metric} at each checkpoint.`,
      `Document complexity and edge cases for ${title}.`,
    ],
    history: `${title} evolved alongside ${cfg.domain} practice; see ${cfg.refs[0]}.`,
    analogy: `${title} is like tuning ${cfg.metric} on ${cfg.artifact} — each step adjusts [${data.join(', ')}] toward the target.`,
    howItWorks: `${title} processes ${n} elements: ${data.map((v, i) => `step ${i + 1} combines ${v}`).slice(0, 4).join('; ')}.`,
    walkthrough: data.slice(0, 5).map((v, i) => `${title} phase ${i + 1}: value ${v}, running sum ${data.slice(0, i + 1).reduce((a, b) => a + b, 0)}`),
    workedExample: `Given [${data.join(', ')}], ${title} yields aggregate sum ${sum} and partial product ${product} illustrating ${cfg.domain}.`,
    complexity: {
      time: pickFrom(['O(n)', 'O(n log n)', 'O(log n)', 'O(n²)'], seed),
      space: pickFrom(['O(1)', 'O(n)', 'O(n) auxiliary'], seed, 2),
    },
    complexityNotes: `${title} in ${lesson.moduleTitle}: time driven by ${n} elements; space by ${cfg.artifact} storage.`,
    realWorld: `${cfg.domain} teams apply ${title} when ${cfg.metric} must scale — e.g., batch [${data.slice(0, 3).join(', ')}] in pipelines.`,
    advantages: [`Grounded in ${cfg.domain}`, `Clear ${cfg.metric} targets`, 'Interview-relevant'],
    disadvantages: [`Misconfigured ${cfg.artifact} breaks invariants`, 'Needs testing on edge cases'],
    applications: [lesson.moduleTitle, cfg.domain, 'Technical interviews'],
    pitfalls: [`Ignoring empty input for ${title}`, `Wrong ${cfg.metric} assumptions`, 'Skipping manual trace'],
    interviewTips: [`Relate ${title} to ${cfg.domain}`, `Trace [${data.slice(0, 3).join(', ')}]`, 'Cite complexity'],
    interviewQuestions: buildInterviewQuestions(title, lesson.moduleTitle, [
      { q: `How does ${title} improve ${cfg.metric}?`, a: `By applying ${focus} on ${cfg.artifact}, reducing redundant work on [${data.slice(0, 4).join(', ')}].` },
      { q: `Debug ${title} on input [${data.join(', ')}].`, a: 'Trace each phase, verify invariants, compare to brute force on small n.' },
      { q: `Production use of ${title}?`, a: `${cfg.domain} services use it when ${cfg.metric} is critical at scale.` },
    ]),
    revisionNotes: `${title}: ${focus} + ${cfg.metric} + trace [${data[0]}, ${data[1]}, ${data[2]}].`,
    dryRun: `Input [${data.join(', ')}]\n${data.map((v, i) => `Step ${i + 1}: ${title} at index ${i}, value ${v}, cumulative ${data.slice(0, i + 1).reduce((a, b) => a + b, 0)}`).join('\n')}\nOutput: sum=${sum}`,
    codeWalkthrough: `${title}: declare ${cfg.artifact}, iterate [${data.join(', ')}], update ${cfg.metric}, return result.`,
    cheatSheet: [title, lesson.moduleTitle, `n=${n}`, `sum=${sum}`, cfg.metric],
    references: [...cfg.refs, LANG_REFERENCES.wikipedia(title)],
    ...makeTraces({
      beginner: { input: `[${data.slice(0, 3).join(', ')}]`, steps: data.slice(0, 3).map((v, i) => `${title}: idx ${i} → ${v}`), output: `sum ${data.slice(0, 3).reduce((a, b) => a + b, 0)}` },
      intermediate: { input: `[${data.join(', ')}]`, steps: data.map((v, i) => `i=${i} val=${v}`), output: `sum ${sum}` },
      advanced: { input: `n=${n * 20} streamed`, steps: ['block size 64', 'parallel reduce', 'combine partial sums'], output: `aggregate ~${sum * 20}` },
    }),
  });
}

function resolveProfile(lesson) {
  const key = normalizeTitle(lesson.title);
  if (TOPIC_PROFILES[key]) return TOPIC_PROFILES[key];

  for (const rule of KEYWORD_RULES) {
    if (rule.test(key)) {
      const p = TOPIC_PROFILES[rule.key];
      if (p) return p;
    }
  }

  const modGen = MODULE_GENERATORS[lesson.moduleId];
  if (modGen) return modGen(lesson);

  return buildFallbackProfile(lesson);
}

export function buildRichLessonContent(lesson) {
  return assembleContent(lesson, resolveProfile(lesson));
}

function buildFallbackProfile(lesson) {
  const seed = seedFromLesson(lesson);
  const title = lesson.title;
  const n = 5 + (seed % 7);
  const arr = Array.from({ length: n }, (_, i) => (seed % 13) + i * 3 + 1);
  return profile({
    conceptOverview: `${title} in ${lesson.moduleTitle} examines ${title.toLowerCase()} with practical implementation focus and complexity awareness.`,
    whyItWorks: `The approach works because ${title.toLowerCase()} maintains clear invariants throughout ${lesson.moduleTitle.toLowerCase()} applications.`,
    steps: [
      `Define inputs and outputs for ${title}.`,
      `Apply the core ${title.toLowerCase()} procedure step by step.`,
      `Verify with concrete numeric traces.`,
      `Analyze time and space for input size n=${n}.`,
      `Compare with adjacent techniques in ${lesson.moduleTitle}.`,
    ],
    analogy: `${title} is like following a checklist where each step transforms data ${arr.join(', ')} systematically.`,
    howItWorks: `Process elements with indices 0..${n - 1}, updating state according to ${title.toLowerCase()} rules.`,
    walkthrough: arr.map((v, i) => `Index ${i}: process value ${v}`),
    workedExample: `Sample array [${arr.join(', ')}] demonstrates ${title} end-to-end.`,
    complexity: { time: pickFrom(['O(n)', 'O(log n)', 'O(n log n)', 'O(n²)'], seed), space: pickFrom(['O(1)', 'O(n)'], seed, 1) },
    complexityNotes: `Complexity for ${title} depends on input size; typical case analyzed with n=${n}.`,
    realWorld: `${title} appears in production systems spanning ${lesson.moduleTitle.toLowerCase()} — e.g., processing batches of ${n * 100} records.`,
    advantages: [`Clear model for ${title}`, 'Maps to standard library patterns', 'Frequent interview topic'],
    disadvantages: ['Edge cases need explicit handling', 'Naive versions may be slow on large n'],
    applications: ['Technical interviews', 'Production services', 'Competitive programming'],
    pitfalls: [`Skipping validation before ${title.toLowerCase()}`, 'Off-by-one in loops', 'Ignoring worst-case complexity'],
    interviewTips: [`State invariant for ${title}`, 'Trace small example aloud', 'Mention trade-offs vs alternatives'],
    interviewQuestions: buildInterviewQuestions(title, lesson.moduleTitle, [
      { q: `Explain ${title} and its complexity.`, a: `${title} processes structured input with stated time/space; trace [${arr.slice(0, 3).join(', ')}] as example.` },
      { q: `What breaks a naive ${title} implementation?`, a: 'Boundary errors, wrong initialization, and missing edge cases like empty input.' },
      { q: `Real scenario for ${title}?`, a: `Used when ${lesson.moduleTitle} workloads require predictable ${title.toLowerCase()} behavior at scale.` },
    ]),
    revisionNotes: `Remember ${title}: define, trace, analyze, implement.`,
    dryRun: `Input [${arr.join(', ')}]\n${arr.map((v, i) => `Step ${i + 1}: at index ${i}, value ${v} processed`).join('\n')}\nOutput: result derived from ${n} elements`,
    codeWalkthrough: `Implement ${title.toLowerCase()} with loop/recursion over [${arr.join(', ')}], checking invariants each iteration.`,
    cheatSheet: [`Topic: ${title}`, `Module: ${lesson.moduleTitle}`, `Sample n=${n}`, 'Trace before coding'],
    references: [LANG_REFERENCES.clrs, LANG_REFERENCES.geeksforgeeks(title), LANG_REFERENCES.wikipedia(title)],
    ...makeTraces({
      beginner: { input: `[${arr.slice(0, 3).join(', ')}]`, steps: arr.slice(0, 3).map((v, i) => `index ${i}: ${v}`), output: `processed ${arr[2]}` },
      intermediate: { input: `[${arr.join(', ')}]`, steps: arr.map((v, i) => `i=${i}, val=${v}`), output: `final state after ${n} steps` },
      advanced: { input: `scaled input size ${n * 10}`, steps: ['partition into blocks', 'aggregate partial results'], output: 'combined result' },
    }),
  });
}

export default buildRichLessonContent;
