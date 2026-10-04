import { ALGORITHM_MAP } from './shared/algorithms/catalog.js';
import { getAlgorithmCode } from './shared/algorithms/codeSync/templates.js';
import { getAnalysis } from './shared/algorithms/codeSync/sourceAnalysis.js';
import { EVENT_MAP, resolveRule } from './shared/algorithms/codeSync/lineMapper.js';

const LANGS = ['pseudocode', 'python', 'javascript', 'c', 'cpp', 'java'];
const ids = (process.argv[2] ? process.argv[2].split(',') : Object.keys(EVENT_MAP));
const show = process.argv[3] || 'python,c,java';  // languages to print resolved text for
let fails = 0, ambig = 0;
for (const id of ids) {
  const algo = ALGORITHM_MAP[id];
  const rules = EVENT_MAP[id];
  if (!rules) { console.log(`## ${id}: NO RULES`); fails += 1; continue; }
  console.log(`\n## ${id}`);
  const listings = Object.fromEntries(LANGS.map((l) => [l, getAnalysis(getAlgorithmCode(id, l, algo.category).source, l)]));
  rules.forEach((r) => {
    const row = [];
    let problem = false;
    for (const l of LANGS) {
      const { line, hits } = resolveRule(r, listings[l], l);
      if (!line) { row.push(`${l}: !!NO MATCH`); fails += 1; problem = true; continue; }
      if (hits.length > 1 && r.nth === undefined && !(Array.isArray(r.anchor) && false)) { row.push(`${l}: !!AMBIGUOUS(${hits.map((h) => h.number).join(',')})`); ambig += 1; problem = true; continue; }
      if (show.split(',').includes(l)) row.push(`${l}:L${line} ${listings[l][line - 1].code.slice(0, 48)}`);
    }
    console.log(`${problem ? 'XX' : '  '} ${String(r.test).padEnd(32)} ${row.join(' | ')}`);
  });
}
console.log(`\nno-match: ${fails}, ambiguous: ${ambig}`);
