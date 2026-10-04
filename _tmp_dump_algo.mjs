import { ALGORITHM_MAP, runAlgorithm } from './shared/algorithms/catalog.js';
import { getAlgorithmCode } from './shared/algorithms/codeSync/templates.js';
const ids = process.argv[2].split(',');
const langs = (process.argv[3] || 'python').split(',');
const kindOf = (t0) => { const t = t0.trim(); return !t ? '_' : /^(\/\/|#(?!include|define|pragma)|\/\*|\*)/.test(t) ? '#' : ' '; };
for (const id of ids) {
  const algo = ALGORITHM_MAP[id];
  const shapes = new Map();
  const inputs = ['', '5, 3, 8, 1, 9, 2, 7', '42'];
  for (const inp of inputs) {
    try {
      for (const s of runAlgorithm(id, inp, { target: algo.defaultTarget ?? 42 }).steps) {
        const shape = s.description.replace(/-?\d+(\.\d+)?/g, 'N');
        shapes.set(shape, (shapes.get(shape) ?? 0) + 1);
      }
    } catch {}
  }
  console.log(`\n######## ${id}  (${algo.category})`);
  console.log('EVENT SHAPES:'); for (const [k, v] of shapes) console.log(`   x${String(v).padStart(3)}  ${k}`);
  for (const l of langs) {
    console.log(`SOURCE [${l}] ('#'=comment)`);
    getAlgorithmCode(id, l, algo.category).source.split('\n').forEach((t, i) => console.log(`${String(i + 1).padStart(3)}${kindOf(t)}| ${t}`));
  }
}
