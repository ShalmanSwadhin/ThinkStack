/**
 * The code-sync highlighter classifies a step by matching its description text against an
 * ordered list of rules. First-match-wins makes that fragile: a description that two rules
 * both match is silently sent to whichever rule happens to come first. This audit runs every
 * algorithm on many random inputs and requires that
 *   1. every description it emits is matched by a rule, and
 *   2. when more than one rule matches, they all point at the same line in every language —
 *      so rule order and rewording can never silently change where the highlight lands.
 * It found three real mis-mappings (dequeue, hash-table completion, Kosaraju pass 2), pinned below.
 */
import { ALGORITHMS, ALGORITHM_MAP, runAlgorithm } from '../../../shared/algorithms/catalog.js';
import { CODE_LANGUAGES } from '../../../shared/algorithms/codeSync/index.js';
import { EVENT_MAP, findEventRule, inferCodeLine, resolveRule } from '../../../shared/algorithms/codeSync/lineMapper.js';
import { getAlgorithmCode } from '../../../shared/algorithms/codeSync/templates.js';
import { getAnalysis } from '../../../shared/algorithms/codeSync/sourceAnalysis.js';

const languages = CODE_LANGUAGES.map((l) => l.id ?? l.value ?? l);
const normalise = (text) => text.replace(/-?\d+(?:\.\d+)?/g, 'N');

function emittedDescriptions(algo, runs = 20) {
  const seen = new Map();
  for (let i = 0; i < runs; i += 1) {
    const { steps } = runAlgorithm(algo.id, algo.randomInput(), { target: algo.defaultTarget });
    for (const step of steps) if (!seen.has(normalise(step.description))) seen.set(normalise(step.description), step.description);
  }
  return [...seen.values()];
}

describe('step classification is complete and unambiguous', () => {
  it.each(ALGORITHMS.map((a) => [a.id, a]))('%s', (_id, algo) => {
    const rules = EVENT_MAP[algo.id] ?? [];
    const analyses = Object.fromEntries(languages.map((l) => [l, getAnalysis(getAlgorithmCode(algo.id, l, algo.category).source, l)]));
    const uncovered = [];
    const ambiguous = [];
    for (const description of emittedDescriptions(algo)) {
      const matching = rules.filter((r) => r.test.test(description));
      if (matching.length === 0) uncovered.push(description);
      else if (matching.length > 1) {
        const lines = new Set(matching.map((r) => languages.map((l) => resolveRule(r, analyses[l], l).line).join(',')));
        if (lines.size > 1) ambiguous.push(`${description} -> ${matching.map((r) => String(r.test)).join(' | ')}`);
      }
    }
    expect({ uncovered, ambiguous }).toEqual({ uncovered: [], ambiguous: [] });
  }, 60000);
});

describe('descriptions that used to be mis-classified', () => {
  const lineText = (id, description, language) => {
    const algo = ALGORITHM_MAP[id];
    const { source } = getAlgorithmCode(id, language, algo.category);
    const line = inferCodeLine(id, algo.category, description, 0, 1, language);
    return source.split('\n')[line - 1].trim();
  };

  it('"Dequeue front element." highlights the dequeue, not the peek', () => {
    expect(lineText('queue-operations', 'Dequeue front element.', 'python')).toMatch(/pop\(0\)|popleft|dequeue/);
    expect(lineText('queue-operations', 'Front element is 4.', 'python')).toMatch(/front\s*=/);
  });

  it('"Hash table insertion complete." highlights the end of the function, not the index computation', () => {
    expect(lineText('hash-linear-probing', 'Hash table insertion complete.', 'python')).toMatch(/^return/);
    expect(lineText('hash-linear-probing', 'Hash 15: index = 15 % 7 = 1.', 'python')).toMatch(/index\s*=/);
  });

  it('Kosaraju pass 2 highlights the transpose step, not the pass-1 DFS call', () => {
    const rule = findEventRule('scc-kosaraju', 'Pass 2: DFS on the transpose graph in reverse finish order.');
    expect(String(rule.test)).toMatch(/transpose/);
    expect(String(findEventRule('scc-kosaraju', 'Finish E. Finish order: [E].').test)).toMatch(/finish/);
  });
});
