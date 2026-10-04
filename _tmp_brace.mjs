import { compileToIR, buildTracePlan, clearIRCache } from './shared/tracing/index.js';
const dump = (label, code, lang) => {
  clearIRCache();
  const p = compileToIR(code, lang);
  console.log('---', label);
  p.instructions.forEach((i) => console.log(`  [${i.index}] L${i.line} ${i.op}  "${String(i.sourceLine).trim()}"`));
};
dump('js if (no else) closing brace', `for (let j = 0; j < 2; j++) {\n  if (j === 5) {\n    break;\n  }\n  console.log(j);\n}\n`, 'javascript');
dump('c if (no else) closing brace', `#include <stdio.h>\nint main() {\n    int x = 1;\n    if (x > 5) {\n        x = 2;\n    }\n    printf("%d\n", x);\n    return 0;\n}\n`, 'c');
