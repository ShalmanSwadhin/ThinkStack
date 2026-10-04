/**
 * Regression tests for the visualizer's source-code highlighting.
 *
 * Background: the highlighted line used to come from a table of hard-coded absolute line
 * numbers matched against the step's description. The numbers had drifted from the real
 * listings, so ~81% of lookups landed on a COMMENT line (e.g. the binary-search "right
 * half" step highlighted `# Target lies in the right half`). The mapping is now
 *
 *     step (event) -> executable statement (anchor) -> source line -> highlight
 *
 * with anchors matched ONLY against executable lines, so comments, blank lines and bare
 * braces can never be highlighted and the answer survives edits to the listing.
 */
import { ALGORITHM_MAP, runAlgorithm } from '../../../shared/algorithms/catalog.js';
import { getAlgorithmCode } from '../../../shared/algorithms/codeSync/templates.js';
import { CODE_LANGUAGES } from '../../../shared/algorithms/codeSync/languages.js';
import { analyzeSource } from '../../../shared/algorithms/codeSync/sourceAnalysis.js';
import {
  EVENT_MAP,
  findEventRule,
  inferCodeLine,
  resolveRule,
} from '../../../shared/algorithms/codeSync/lineMapper.js';

const ALL_LANGUAGES = CODE_LANGUAGES.map((l) => l.id);
const ALGORITHMS = Object.values(ALGORITHM_MAP);

const listing = (algo, language) => {
  const { source } = getAlgorithmCode(algo.id, language, algo.category);
  return analyzeSource(source, language);
};

const BIG_ARRAY = Array.from({ length: 70 }, (_, i) => (i * 37 + 11) % 97).join(', ');
const ARRAYS = [
  '',
  '1',
  '2, 1',
  '5, 3, 8, 1, 9, 2, 7',
  '1, 2, 3, 4, 5, 6, 7, 8',
  '4, 4, 4, 2, 2',
  '9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 11, 10',
  // Larger than Tim Sort's run size, so its merge-runs events actually occur.
  BIG_ARRAY,
];
const WORDS = ['', 'cat', 'cat, car, card, care, dog', 'a, ab, abc'];

/** Every step description the algorithm emits across a broad spread of inputs/targets. */
function collectDescriptions(algo) {
  const descriptions = new Set();
  const add = (steps) => steps.forEach((step) => descriptions.add(step.description));
  const run = (input, target) => {
    try {
      add(runAlgorithm(algo.id, input, { target }).steps);
    } catch {
      // an input an algorithm rejects is not interesting here
    }
  };

  if (algo.inputType === 'array-target') {
    for (const input of ARRAYS) {
      const values = input.split(',').map((v) => Number(v.trim())).filter(Number.isFinite);
      const sorted = [...values].sort((a, b) => a - b);
      const targets = [algo.defaultTarget ?? 42, sorted[0], sorted.at(-1), sorted[Math.floor(sorted.length / 2)], -5, 1000];
      for (const target of targets) run(sorted.length ? sorted.join(', ') : input, target);
    }
  } else if (algo.inputType === 'words') {
    for (const input of WORDS) run(input);
  } else if (algo.inputType === 'array') {
    for (const input of ARRAYS) run(input);
  } else {
    for (let i = 0; i < 4; i += 1) run('');
  }
  for (let i = 0; i < 4; i += 1) {
    run(algo.randomInput ? algo.randomInput().join?.(', ') ?? '' : '', algo.defaultTarget ?? 42);
  }
  return [...descriptions];
}

describe('source analysis', () => {
  it('classifies blank, comment, structural and code lines', () => {
    const lines = analyzeSource('// header\nint x = 1; // trailing\n\n{\n}\n/* block\n still block */\nreturn x;', 'c');
    expect(lines.map((l) => l.kind)).toEqual(['comment', 'code', 'blank', 'structural', 'structural', 'comment', 'comment', 'code']);
    expect(lines[1].code).toBe('int x = 1;');
  });

  it('treats # as a comment in Python but // as floor division', () => {
    const lines = analyzeSource('# comment\nmid = (low + high) // 2  # halve\nx = "# not a comment"', 'python');
    expect(lines.map((l) => l.kind)).toEqual(['comment', 'code', 'code']);
    expect(lines[1].code).toBe('mid = (low + high) // 2');
    expect(lines[2].code).toBe('x = "# not a comment"');
  });

  it('treats #include / #define as code in C, not as comments', () => {
    const lines = analyzeSource('#include <stdio.h>\n#define RUN 32', 'c');
    expect(lines.every((l) => l.kind === 'code')).toBe(true);
  });

  it('keeps else / control-flow headers executable but drops closing-brace-only lines', () => {
    const lines = analyzeSource('} else {\nelse:\n};\n})', 'c');
    expect(lines.map((l) => l.kind)).toEqual(['code', 'code', 'structural', 'structural']);
  });
});

describe('every algorithm has event rules', () => {
  it('covers every algorithm in the catalog', () => {
    expect(ALGORITHMS.filter((a) => !EVENT_MAP[a.id]).map((a) => a.id)).toEqual([]);
  });

  it('has no rules for algorithms that do not exist', () => {
    expect(Object.keys(EVENT_MAP).filter((id) => !ALGORITHM_MAP[id])).toEqual([]);
  });
});

describe('anchors resolve to executable statements', () => {
  for (const algo of ALGORITHMS) {
    it(`${algo.id}: every rule resolves, in every language, to a code line (never a comment or blank)`, () => {
      const problems = [];
      for (const language of ALL_LANGUAGES) {
        const lines = listing(algo, language);
        EVENT_MAP[algo.id].forEach((rule, index) => {
          const { line, hits } = resolveRule(rule, lines, language);
          if (!line) {
            problems.push(`${language}: rule #${index} ${rule.test} matched no executable line`);
            return;
          }
          if (lines[line - 1].kind !== 'code') {
            problems.push(`${language}: rule #${index} ${rule.test} -> L${line} is ${lines[line - 1].kind}`);
          }
          if (hits.length > 1 && rule.nth === undefined) {
            problems.push(`${language}: rule #${index} ${rule.test} is ambiguous (${hits.map((h) => h.number).join(',')}) and declares no 'nth'`);
          }
        });
      }
      expect(problems).toEqual([]);
    });
  }
});

describe('every step the visualizer can emit is mapped to an executable line', () => {
  for (const algo of ALGORITHMS) {
    it(`${algo.id}: all emitted step descriptions match a rule and highlight code in all languages`, () => {
      const descriptions = collectDescriptions(algo);
      expect(descriptions.length).toBeGreaterThan(0);

      const unmatched = descriptions.filter((d) => !findEventRule(algo.id, d));
      expect(unmatched).toEqual([]);

      const onNonCode = [];
      for (const language of ALL_LANGUAGES) {
        const lines = listing(algo, language);
        for (const description of descriptions) {
          const line = inferCodeLine(algo.id, algo.category, description, 0, 1, language);
          if (lines[line - 1]?.kind !== 'code') {
            onNonCode.push(`${language} L${line} (${lines[line - 1]?.kind}) <- "${description}"`);
          }
        }
      }
      expect(onNonCode.slice(0, 5)).toEqual([]);
    });
  }
});

describe('steps carry an accurate precomputed Python line', () => {
  for (const algo of ALGORITHMS) {
    it(`${algo.id}: step.codeLine points at an executable Python line`, () => {
      const lines = listing(algo, 'python');
      const steps = runAlgorithm(algo.id, '', { target: algo.defaultTarget ?? 42 }).steps;
      expect(steps.length).toBeGreaterThan(0);
      for (const step of steps) {
        expect(lines[step.codeLine - 1]?.kind).toBe('code');
      }
    });
  }
});

describe('the highlighted line is the statement that performs the step (binary search)', () => {
  const stepLine = (description, language = 'python') => {
    const lines = listing(ALGORITHM_MAP['binary-search'], language);
    return lines[inferCodeLine('binary-search', 'searching', description, 0, 1, language) - 1].code;
  };

  it('python', () => {
    expect(stepLine('Binary search for 42 on sorted array.')).toBe('low, high = 0, len(arr) - 1');
    expect(stepLine('Inspect middle index 4 (value 58).')).toBe('mid = (low + high) // 2');
    expect(stepLine('Target 58 found at index 4.')).toBe('return mid');
    expect(stepLine('Target is in right half.')).toBe('low = mid + 1');
    expect(stepLine('Target is in left half.')).toBe('high = mid - 1');
    expect(stepLine('Target 42 not found.')).toBe('return -1');
  });

  it('javascript, java and c point at the same statements', () => {
    expect(stepLine('Inspect middle index 4 (value 58).', 'javascript')).toMatch(/mid = Math\.floor/);
    expect(stepLine('Inspect middle index 4 (value 58).', 'java')).toMatch(/^int mid = /);
    expect(stepLine('Inspect middle index 4 (value 58).', 'c')).toMatch(/^int mid = /);
    expect(stepLine('Target is in right half.', 'c')).toMatch(/low = mid \+ 1/);
    expect(stepLine('Target 42 not found.', 'java')).toBe('return -1;');
  });

  it('never highlights the explanatory comments around those statements', () => {
    for (const language of ['python', 'javascript', 'c', 'cpp', 'java', 'pseudocode']) {
      const lines = listing(ALGORITHM_MAP['binary-search'], language);
      for (const description of ['Binary search for 42 on sorted array.', 'Inspect middle index 4 (value 58).', 'Target is in right half.', 'Target is in left half.', 'Target 42 not found.']) {
        const line = inferCodeLine('binary-search', 'searching', description, 0, 1, language);
        expect(lines[line - 1].text.trim()).not.toMatch(/^(#|\/\/)/);
      }
    }
  });
});

describe('the mapping survives edits to the listing (no stored line numbers)', () => {
  // Re-analyze a listing after inserting comment and blank lines before EVERY line, then
  // check each rule still resolves to the very same statement text.
  const withNoise = (source, language) => {
    const marker = language === 'python' ? '#' : '//';
    return source
      .split('\n')
      .flatMap((line) => [`${marker} added explanatory comment`, '', `${marker} a second, wrapped`, `${marker} comment line`, line])
      .join('\n');
  };

  for (const algo of ALGORITHMS) {
    it(`${algo.id}: same statements after comments/blank lines are inserted everywhere`, () => {
      const mismatches = [];
      for (const language of ['python', 'javascript', 'c', 'java']) {
        const { source } = getAlgorithmCode(algo.id, language, algo.category);
        const original = analyzeSource(source, language);
        const noisy = analyzeSource(withNoise(source, language), language);
        EVENT_MAP[algo.id].forEach((rule, index) => {
          const before = original[resolveRule(rule, original, language).line - 1]?.code;
          const after = noisy[resolveRule(rule, noisy, language).line - 1]?.code;
          if (before !== after) mismatches.push(`${language} rule #${index}: "${before}" -> "${after}"`);
        });
      }
      expect(mismatches).toEqual([]);
    });
  }
});

describe('step explanation and highlighted line come from the same event', () => {
  it('the description that picks the line is the one shown as the current step', () => {
    const { steps } = runAlgorithm('binary-search', '2, 5, 8, 12, 16, 23, 38', { target: 16 });
    const lines = listing(ALGORITHM_MAP['binary-search'], 'python');
    const midpoint = steps.find((s) => /inspect middle/i.test(s.description));
    expect(midpoint).toBeDefined();
    expect(lines[midpoint.codeLine - 1].code).toBe('mid = (low + high) // 2');
  });
});
