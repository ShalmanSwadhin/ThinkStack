/**
 * Quality gate for the hand-written Learn lessons (backend/src/seed/lessons/content).
 *
 * Every lesson is checked for structure, for being about its own topic (no filler or
 * cross-topic contamination), for uniqueness across the whole curriculum, and — most
 * importantly — its code samples are EXECUTED and their output compared with the output
 * printed beside them, so a sample can never drift out of sync with its explanation.
 */
import { MODULES } from '../../src/seed/curriculum/modules.js';
import { loadAuthoredLessons } from '../../src/seed/lessons/index.js';
import { parseLessonFile } from '../../src/seed/lessons/parse.js';
import { validateLesson } from '../../src/seed/lessons/schema.js';
import { lessonToContent, lessonToQuiz } from '../../src/seed/lessons/build.js';
import { ALGORITHM_MAP } from '../../../shared/algorithms/catalog.js';
import { runSample } from '../helpers/runLessonCode.js';

const { byModule } = loadAuthoredLessons();
const entries = [];
for (const module of MODULES) {
  for (const title of module.lessons) {
    const lesson = byModule[module.id]?.[title];
    if (lesson) entries.push({ module, title, lesson, label: `${module.id} › ${title}` });
  }
}

describe('lesson file format', () => {
  const sample = [
    '# Sample Lesson',
    'kind: concept',
    'time: Not applicable — a sample.',
    'space: Not applicable — a sample.',
    'practice: a-key, another-key',
    '',
    '## intro',
    'First paragraph.',
    '',
    '## pros',
    '- one',
    '  continued',
    '- two',
    '',
    '## interview',
    '**Q:** Why?',
    '**A:** Because.',
    '',
    '**Q:** And?',
    '**A:** Then.',
    '',
    '## code',
    '### python',
    '```python',
    '# not a heading, and neither is the next line',
    '## still code',
    'print(1)',
    '```',
    'Output:',
    '```text',
    '1',
    '```',
    '',
    '## quiz',
    '1. Pick the right one?',
    '   - [ ] wrong',
    '   - [x] right',
    '   > Because it is.',
  ].join('\n');

  it('parses header lines, text, lists, interview pairs, code with output and quizzes', () => {
    const { 'Sample Lesson': lesson } = parseLessonFile(sample);
    expect(lesson.kind).toBe('concept');
    expect(lesson.practice).toEqual(['a-key', 'another-key']);
    expect(lesson.intro).toBe('First paragraph.');
    expect(lesson.pros).toEqual(['one continued', 'two']);
    expect(lesson.interview).toEqual([['Why?', 'Because.'], ['And?', 'Then.']]);
    expect(lesson.code).toEqual([{ lang: 'python', src: '# not a heading, and neither is the next line\n## still code\nprint(1)', out: '1' }]);
    expect(lesson.quiz).toEqual([['Pick the right one?', ['wrong', 'right'], 1, 'Because it is.']]);
  });

  it('rejects unknown sections and double-marked quiz answers instead of ignoring them', () => {
    expect(() => parseLessonFile('# X\n\n## nonsense\ntext')).toThrow(/unknown section/);
    expect(() => parseLessonFile('# X\n\n## quiz\n1. Q?\n   - [x] a\n   - [x] b')).toThrow(/two correct answers/);
    expect(() => parseLessonFile('# X\nbogus line\n\n## intro\nhi')).toThrow(/unrecognised header/);
  });

  it('turns an authored lesson into the stored content and quiz shapes', () => {
    const lesson = entries[0]?.lesson;
    if (!lesson) return;
    const content = lessonToContent(lesson);
    expect(content.codeExamples[0]).toMatchObject({ language: lesson.code[0].lang, code: lesson.code[0].src });
    expect(content.interviewQuestions).toHaveLength(3);
    const quiz = lessonToQuiz(lesson);
    expect(quiz).toHaveLength(4);
    expect(quiz.every((q) => q.options.length === 4 && q.correctIndex >= 0 && q.correctIndex <= 3)).toBe(true);
  });
});

describe('authored lessons are structurally complete', () => {
  it('has at least one authored lesson', () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  it.each(entries.map((e) => [e.label, e]))('%s', (_label, { lesson, label }) => {
    expect(validateLesson(lesson, label)).toEqual([]);
  });

  it('does not contain lessons that are not in the curriculum', () => {
    const known = new Set(MODULES.flatMap((m) => m.lessons.map((t) => `${m.id}::${t}`)));
    const stray = [];
    for (const [moduleId, lessons] of Object.entries(byModule)) {
      for (const title of Object.keys(lessons)) if (!known.has(`${moduleId}::${title}`)) stray.push(`${moduleId} › ${title}`);
    }
    expect(stray).toEqual([]);
  });
});

describe('authored lessons are about their own topic', () => {
  const STOPWORDS = new Set(['and', 'the', 'with', 'for', 'vs', 'in', 'of', 'to', 'on', 'a', 'an', 'basics', 'intro', 'introduction', 'overview', 'patterns', 'interview', 'practice']);
  const keywords = (title) =>
    title
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length >= 3 && !STOPWORDS.has(word));

  it.each(entries.map((e) => [e.label, e]))('%s mentions its own subject', (_label, { title, lesson }) => {
    const words = keywords(title);
    if (!words.length) return;
    const body = `${lesson.intro} ${lesson.theory} ${lesson.summary}`.toLowerCase();
    // At least one distinguishing word from the title must appear (allowing simple plurals).
    const hit = words.some((word) => body.includes(word) || body.includes(word.replace(/s$/, '')));
    expect(hit).toBe(true);
  });

  it('visualizer links point at a real visualizer whose subject matches the lesson', () => {
    const problems = [];
    for (const { label, title, lesson } of entries) {
      if (!lesson.viz) continue;
      if (!ALGORITHM_MAP[lesson.viz]) {
        problems.push(`${label}: unknown visualizer "${lesson.viz}"`);
        continue;
      }
      const name = ALGORITHM_MAP[lesson.viz].name.toLowerCase().replace(/[^a-z0-9]+/g, ' ');
      const lessonWords = title.toLowerCase().replace(/[^a-z0-9]+/g, ' ');
      const shared = name.split(' ').filter((word) => word.length > 2 && lessonWords.includes(word));
      if (!shared.length) problems.push(`${label}: visualizer "${lesson.viz}" (${ALGORITHM_MAP[lesson.viz].name}) does not match the lesson title`);
    }
    expect(problems).toEqual([]);
  });
});

describe('no content is repeated across lessons', () => {
  const collect = (pick) => {
    const seen = new Map();
    const duplicates = [];
    for (const { label, lesson } of entries) {
      for (const value of pick(lesson)) {
        const key = String(value).trim().toLowerCase().replace(/\s+/g, ' ');
        if (key.length < 25) continue;
        if (seen.has(key)) duplicates.push(`${seen.get(key)} == ${label}: "${key.slice(0, 70)}"`);
        else seen.set(key, label);
      }
    }
    return duplicates;
  };

  it('intro, theory, explanation, example, real-world and summary are unique', () => {
    for (const field of ['intro', 'theory', 'explain', 'example', 'real', 'summary', 'codeNote']) {
      expect(collect((lesson) => [lesson[field]])).toEqual([]);
    }
  });

  it('pros, cons, uses and mistakes are not copy-pasted between lessons', () => {
    for (const field of ['pros', 'cons', 'uses', 'mistakes']) {
      expect(collect((lesson) => lesson[field])).toEqual([]);
    }
  });

  it('interview questions and quiz questions are unique', () => {
    expect(collect((lesson) => lesson.interview.map(([q]) => q))).toEqual([]);
    expect(collect((lesson) => lesson.quiz.map(([q]) => q))).toEqual([]);
  });

  it('stored quiz answers are spread across all four positions, and shuffling keeps the right answer', () => {
    const counts = [0, 0, 0, 0];
    for (const { module, title, lesson } of entries) {
      const built = lessonToQuiz(lesson, `${module.id}-${title}`);
      built.forEach((question, index) => {
        counts[question.correctIndex] += 1;
        // the option now at correctIndex must be the one the author marked correct
        const [, options, authoredAnswer] = lesson.quiz[index];
        expect(question.options[question.correctIndex]).toBe(options[authoredAnswer]);
      });
    }
    const total = counts.reduce((a, b) => a + b, 0);
    expect(Math.max(...counts) / total).toBeLessThan(0.4);
    expect(Math.min(...counts) / total).toBeGreaterThan(0.12);
  });

  it('shuffling is deterministic', () => {
    const { module, title, lesson } = entries[0];
    expect(lessonToQuiz(lesson, `${module.id}-${title}`)).toEqual(lessonToQuiz(lesson, `${module.id}-${title}`));
  });
});

describe('code samples run and print what the lesson says they print', () => {
  const runnable = entries.flatMap(({ label, lesson }) => lesson.code.map((sample) => [`${label} [${sample.lang}]`, sample]));

  it.each(runnable)('%s', (_label, sample) => {
    const result = runSample(sample);
    if (result.status === 'skipped') return;
    expect({ status: result.status, detail: result.status === 'failed' ? result.detail : '' }).toEqual({ status: 'passed', detail: '' });
  }, 60000);
});

describe('conceptual lessons do not invent complexity', () => {
  it('concept lessons say complexity is not applicable; algorithm lessons give a real bound', () => {
    const problems = [];
    for (const { label, lesson } of entries) {
      if (lesson.kind === 'concept' && /^\s*O\(/.test(lesson.time)) problems.push(`${label}: concept lesson opens with Big-O`);
      if (lesson.kind === 'algorithm' && /^Not (applicable|an algorithmic)/i.test(lesson.time)) problems.push(`${label}: algorithm lesson says not applicable`);
    }
    expect(problems).toEqual([]);
  });
});

describe('practice problems belong to the lesson', () => {
  // Each problem template may only be attached to lessons whose module/title concerns it.
  const RELEVANCE = {
    'sum-of-array-elements': /array|loop|sum|prefix|iteration|accumulat|statement|expression|operator|variable|input|traversal|reduce/i,
    'count-even-numbers': /even|odd|modulo|operator|conditional|if|loop|filter|arithmetic|remainder|bit|parity/i,
    'find-minimum-element': /minimum|maximum|array|loop|pseudocode|selection|traversal|comparison|scan/i,
    'reverse-array-print': /array|reverse|two.pointer|loop|traversal|rotat|in.place|string|stack/i,
    'check-palindrome-string': /palindrome|string|two.pointer|computational|pattern|recursion|manacher/i,
    'factorial-calculation': /factorial|recursion|recursive|function|loop|base case|multiplication|integer|overflow|exponent|call stack/i,
    'linear-search-position': /linear search|searching|array|loop|search|sentinel/i,
    'count-vowels-in-string': /string|character|loop|conditional|decomposition|input|frequency|text|membership/i,
    'maximum-of-two-numbers': /conditional|if|comparison|ternary|relational|operator|function|max|boolean|decision|guard/i,
    'absolute-difference': /arithmetic|operator|expression|function|difference|numeric|math|sign|precision|range/i,
    'two-sum-indices': /two sum|hash|two.pointer|frequency|complement|sorting|array/i,
    'valid-parentheses': /parenthes|stack|bracket|balanc/i,
    'binary-search-position': /binary search|bound|search|prefix|answer|parametric/i,
    'longest-substring-without-repeat': /substring|window|hash|string|two.pointer/i,
    'merge-two-sorted-arrays': /merge|sorted|two.pointer|sort|divide/i,
    'coin-change-minimum': /coin|dynamic|dp|greedy|knapsack|memoiz|tabulation/i,
    'bfs-shortest-path-length': /bfs|breadth|shortest|queue|graph|traversal|unweighted/i,
    'kth-largest-element': /kth|heap|quick|select|priority|sort/i,
    'group-anagrams-count': /anagram|hash|group|string|frequency|map/i,
    'tree-level-order-traversal': /level order|bfs|tree|traversal|queue/i,
    'n-queens-count': /queen|backtrack|constraint|prun/i,
    'sliding-window-maximum': /sliding window|deque|monotonic|window/i,
    'word-ladder-length': /word ladder|bfs|breadth|graph|shortest/i,
    'edit-distance': /edit distance|dynamic|dp|string|levenshtein/i,
    'dijkstra-shortest-path': /dijkstra|shortest|priority queue|weighted|path/i,
    'longest-increasing-subsequence': /increasing subsequence|lis|dynamic|dp|patience|binary search/i,
    'articulation-points-count': /articulation|bridge|cut|connected|dfs|tarjan/i,
    'maximum-flow': /flow|matching|ford|bipartite|network|cut/i,
    'regex-wildcard-matching': /wildcard|regex|pattern matching|dynamic|string|dp|matching/i,
    'trapping-rain-water': /rain|trapping|two.pointer|stack|prefix|container/i,
  };

  it('only references real problem templates, each on a lesson it is relevant to', () => {
    const problems = [];
    for (const { module, title, lesson, label } of entries) {
      for (const key of lesson.practice ?? []) {
        if (!RELEVANCE[key]) {
          problems.push(`${label}: unknown problem template "${key}"`);
        } else if (!RELEVANCE[key].test(`${module.id} ${title}`)) {
          problems.push(`${label}: "${key}" is not relevant to this lesson`);
        }
      }
    }
    expect(problems).toEqual([]);
  });

  it('the relevance table covers exactly the problem templates that exist', async () => {
    const { PROBLEM_TEMPLATE_KEYS } = await import('../../src/seed/generators/problemBank.js');
    expect([...PROBLEM_TEMPLATE_KEYS].sort()).toEqual(Object.keys(RELEVANCE).sort());
  });
});

describe('lessons are not contaminated with another topic', () => {
  // [pattern that signals a foreign topic, lessons/modules where it legitimately appears]
  const RULES = [
    {
      name: 'version control',
      pattern: /\bgit\b|\bgithub\b|pull request|merge conflict/i,
      allowed: /intro-to-programming|programming-basics|interview-prep|backtracking/i,
    },
    {
      name: 'remnants of the old generic "average of scores" lesson',
      pattern: /average test score|\[85, 90, 95\]|scores = \[|\bavg\s*←/i,
      allowed: /$^/,
    },
    {
      name: 'search / sort / graph algorithm names inside the language-basics modules',
      pattern: /\b(linear search|binary search|bubble sort|merge sort|quick sort|dijkstra|breadth.first|depth.first)\b/i,
      allowed: /^(?!(intro-to-programming|programming-basics|variables-data-types|operators-expressions|input-output) ).*/s,
    },
  ];

  it('keeps each topic out of lessons it does not belong to', () => {
    const problems = [];
    for (const { module, title, lesson, label } of entries) {
      const where = `${module.id} ${title}`;
      const prose = [lesson.intro, lesson.theory, lesson.explain, lesson.example, lesson.real, lesson.summary, ...lesson.pros, ...lesson.cons, ...lesson.uses, ...lesson.mistakes, ...lesson.interview.flat()].join('\n');
      for (const rule of RULES) {
        if (rule.pattern.test(prose) && !rule.allowed.test(where)) problems.push(`${label}: mentions ${rule.name}`);
      }
    }
    expect(problems).toEqual([]);
  });

  it('does not reuse the same code sample in two lessons', () => {
    const seen = new Map();
    const dupes = [];
    for (const { label, lesson } of entries) {
      for (const sample of lesson.code) {
        if (sample.lang === 'text' || sample.lang === 'json') continue;
        const key = sample.src.replace(/\s+/g, ' ').trim();
        if (seen.has(key)) dupes.push(`${seen.get(key)} == ${label} [${sample.lang}]`);
        else seen.set(key, label);
      }
    }
    expect(dupes).toEqual([]);
  });
});
