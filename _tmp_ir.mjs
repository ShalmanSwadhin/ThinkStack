import { compileToIR, clearIRCache } from './shared/tracing/index.js';
const dump = (label, code, lang='python') => {
  clearIRCache();
  const p = compileToIR(code, lang);
  console.log('---', label, 'instructions:', p.instructions.length);
  p.instructions.forEach((i) => console.log(`  [${i.index}] L${i.line} ${i.op} bodyStart=${i.bodyStartIndex ?? '-'} bodyEnd=${i.bodyEndIndex ?? '-'}`));
};
dump('T2 nested', `for i in range(2):\n    for j in range(3):\n        print(i, j)\n`);
dump('break nested', `for i in range(3):\n    for j in range(3):\n        if j == 1:\n            break\n        print(i, j)\n`);
