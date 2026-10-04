import { buildTracePlan, clearIRCache } from './shared/tracing/index.js';
const show = (label, code, lang='python') => {
  clearIRCache();
  const plan = buildTracePlan(code, lang);
  console.log('---', label);
  console.log('output:', JSON.stringify(plan.steps.at(-1).output));
  console.log(plan.steps.map(s => `${s.line}:${s.eventSubtype}${s.conditionResult===true?'(T)':s.conditionResult===false?'(F)':''}${s.executionStatus==='Skipped'?'[skip]':''}`).join(' '));
};
show('py break nested', `for i in range(3):\n    for j in range(3):\n        if j == 1:\n            break\n        print(i, j)\n`);
show('py continue nested', `for i in range(2):\n    for j in range(3):\n        if j == 1:\n            continue\n        print(i, j)\n`);
show('js break nested', `for (let i = 0; i < 3; i++) {\n  for (let j = 0; j < 3; j++) {\n    if (j === 1) {\n      break;\n    }\n    console.log(i, j);\n  }\n}\n`, 'javascript');
show('py break single loop', `for j in range(3):\n    if j == 1:\n        break\n    print(j)\nprint("done")\n`);
