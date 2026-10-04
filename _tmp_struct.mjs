import { buildTracePlan, clearIRCache } from './shared/tracing/index.js';
const progs = {
  c: `#include <stdio.h>\nint main() {\n    for (int i = 0; i < 2; i++) {\n        if (i == 0) {\n            printf("zero\n");\n        } else {\n            printf("other\n");\n        }\n    }\n    return 0;\n}\n`,
  java: `public class Main {\n    public static void main(String[] args) {\n        for (int i = 0; i < 2; i++) {\n            if (i == 0) {\n                System.out.println("zero");\n            }\n        }\n    }\n}\n`,
  javascript: `for (let i = 0; i < 2; i++) {\n  if (i === 0) {\n    console.log("zero");\n  }\n}\n`,
  cpp: `#include <iostream>\nusing namespace std;\nint main() {\n    int x = 3;\n    if (x > 1) {\n        cout << "big" << endl;\n    }\n    return 0;\n}\n`,
};
for (const [lang, code] of Object.entries(progs)) {
  clearIRCache();
  const lines = code.split('\n');
  const plan = buildTracePlan(code, lang);
  console.log('---', lang);
  for (const s of plan.steps) {
    const txt = (lines[s.line-1]||'').trim();
    const struct = /^[{}]+;?$/.test(txt) || /(class\s+\w+|main\s*\()/.test(txt);
    console.log(`  L${String(s.line).padStart(2)} ${String(s.eventType).padEnd(14)} ${String(s.eventSubtype).padEnd(22)} ${s.executionStatus.padEnd(13)} ${struct ? '<<< STRUCTURAL ' : ''}${txt}`);
  }
}
