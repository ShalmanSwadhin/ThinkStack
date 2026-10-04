import { ALGORITHM_MAP, runAlgorithm } from './shared/algorithms/catalog.js';
import { getAlgorithmCode } from './shared/algorithms/codeSync/templates.js';
import { LINE_MAP, inferCodeLine } from './shared/algorithms/codeSync/lineMapper.js';

const LANGS = ['pseudocode', 'python', 'javascript', 'c', 'cpp', 'java'];
const kindOf = (text) => {
  const t = text.trim();
  if (!t) return 'blank';
  if (/^(\/\/|#(?!include|define|pragma)|\/\*|\*)/.test(t)) return 'comment';
  return 'code';
};

let total = 0, onComment = 0, onBlank = 0, unmatched = 0;
const perAlgo = {};
const worst = [];
for (const [id, algo] of Object.entries(ALGORITHM_MAP)) {
  let steps = [];
  try { steps = runAlgorithm(id, '', { target: algo.defaultTarget ?? 42 }).steps; } catch (e) { console.log('RUN FAIL', id, e.message); continue; }
  const descs = [...new Set(steps.map((s) => s.description))];
  const sources = Object.fromEntries(LANGS.map((l) => [l, getAlgorithmCode(id, l, algo.category).source.split('\n')]));
  const patterns = LINE_MAP[id] ?? [];
  for (const d of descs) {
    const matched = patterns.some((p) => p.test.test(d));
    if (!matched) { unmatched += 1; (perAlgo[id] ??= { unmatched: [], bad: 0, n: 0 }).unmatched.push(d); }
    for (const l of LANGS) {
      const line = inferCodeLine(id, algo.category, d, 0, 1, l);
      const text = sources[l][line - 1] ?? '<<out of range>>';
      const k = kindOf(text);
      total += 1;
      const e = (perAlgo[id] ??= { unmatched: [], bad: 0, n: 0 });
      e.n += 1;
      if (k === 'comment') { onComment += 1; e.bad += 1; }
      if (k === 'blank') { onBlank += 1; e.bad += 1; }
      if (k !== 'code' && worst.length < 12 && l === 'python') worst.push(`${id} [${l}] "${d.slice(0,50)}" -> L${line}: ${text.trim().slice(0,60)}`);
    }
  }
}
console.log(`distinct (algorithm, step-description, language) lookups: ${total}`);
console.log(`  land on a COMMENT line: ${onComment} (${(100*onComment/total).toFixed(1)}%)`);
console.log(`  land on a BLANK line:   ${onBlank}`);
console.log(`  step descriptions matching NO pattern: ${unmatched}`);
console.log('\nsample python hits on comments:'); worst.forEach((w) => console.log('  ' + w));
const bad = Object.entries(perAlgo).filter(([, v]) => v.bad || v.unmatched.length).sort((a, b) => b[1].bad - a[1].bad);
console.log(`\nalgorithms with at least one bad mapping or unmatched description: ${bad.length}/${Object.keys(ALGORITHM_MAP).length}`);
bad.slice(0, 12).forEach(([id, v]) => console.log(`  ${id.padEnd(22)} bad=${v.bad}/${v.n} unmatched=${v.unmatched.length}`));
