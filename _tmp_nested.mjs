import { buildTracePlan, extractFinalState, clearIRCache } from './shared/tracing/index.js';

const CASES = {
  'T1 simple loop': `for i in range(3):\n    print(i)\n`,
  'T2 nested loop': `for i in range(2):\n    for j in range(3):\n        print(i, j)\n`,
  'T3 nested if/else (x=15)': `x = 15\nif x > 0:\n    if x > 10:\n        print("large")\n    else:\n        print("small")\nelse:\n    print("negative")\n`,
  'T3b nested if/else (x=5)': `x = 5\nif x > 0:\n    if x > 10:\n        print("large")\n    else:\n        print("small")\nelse:\n    print("negative")\n`,
  'T3c nested if/else (x=-2)': `x = -2\nif x > 0:\n    if x > 10:\n        print("large")\n    else:\n        print("small")\nelse:\n    print("negative")\n`,
  'T4 loop + if/else': `for i in range(5):\n    if i % 2 == 0:\n        print("even")\n    else:\n        print("odd")\n`,
  'T5 nested loop + nested if/else': `for i in range(3):\n    for j in range(3):\n        if i == j:\n            print("same")\n        else:\n            if i > j:\n                print("greater")\n            else:\n                print("less")\n`,
  'T6 while + if/else': `i = 0\nwhile i < 5:\n    if i % 2 == 0:\n        print("even")\n    else:\n        print("odd")\n    i += 1\n`,
  'T7 mixed nesting': `for i in range(3):\n    if i == 1:\n        for j in range(2):\n            print(j)\n    else:\n        print(i)\n`,
};

for (const [name, code] of Object.entries(CASES)) {
  clearIRCache();
  console.log('='.repeat(70)); console.log(name);
  try {
    const plan = buildTracePlan(code, 'python');
    const fin = extractFinalState(plan);
    console.log('OUTPUT:', JSON.stringify(fin.output), '| vars:', JSON.stringify(fin.variables), '| steps:', plan.steps.length);
    const lines = code.split('\n');
    const seq = plan.steps.map((s) => `${s.line}:${(s.eventSubtype||s.type)}${s.conditionResult===true?'(T)':s.conditionResult===false?'(F)':''}`);
    console.log('SEQ:', seq.join(' '));
  } catch (e) { console.log('ERR', e.message); }
}
