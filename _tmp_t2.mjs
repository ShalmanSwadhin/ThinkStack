import { buildTracePlan, clearIRCache } from './shared/tracing/index.js';
clearIRCache();
for (const code of [`for i in range(2):\n    for j in range(3):\n        print(i, j)\n`, `for i in range(2):\n    for j in range(3):\n        print(i, j)`]) {
  clearIRCache();
  const plan = buildTracePlan(code, 'python');
  console.log(JSON.stringify(code.slice(-6)), 'steps', plan.steps.length, plan.steps.map(s=>s.line).join(' '));
}
