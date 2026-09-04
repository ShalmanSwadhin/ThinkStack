import {
  buildTracePlan,
  compileToIR,
  extractFinalState,
  SAMPLE_CODE,
  clearIRCache,
  getCacheStats,
  IR_OPCODES,
} from '../shared/tracing/index.js';
import {
  ALGORITHM_SAMPLES,
  ALGORITHM_IDS,
  SUPPORTED_LANGS,
} from '../shared/tracing/algorithms/samples.js';

let failed = false;

console.log('=== ThinkStack IR Trace Engine Tests ===\n');

clearIRCache();

for (const lang of SUPPORTED_LANGS) {
  const plan = buildTracePlan(SAMPLE_CODE[lang], lang);
  const last = plan.steps.at(-1);
  const out = last?.output ?? [];
  const vars = Object.keys(last?.variables || {});
  const okOut = out.length >= 1;
  console.log(
    `[sample] ${lang}`,
    okOut ? 'OK' : 'FAIL',
    'steps',
    plan.steps.length,
    'vars',
    vars,
    'out',
    out
  );
  if (!okOut) failed = true;
  if (!vars.includes('name') && lang !== 'c') {
    console.log(`  ${lang} missing name variable`);
    failed = true;
  }
}

const custom = buildTracePlan(`x = 10
y = "hello"
print(y, x)`, 'python');
const customLast = custom.steps.at(-1);
console.log('\n[custom python]', customLast?.variables, 'out', customLast?.output);
if (customLast?.variables?.x !== 10 || customLast?.variables?.y !== 'hello') failed = true;
if (customLast?.output?.[0] !== 'hello 10') failed = true;

console.log('\n=== IR Metadata ===');
const irProgram = compileToIR(SAMPLE_CODE.python, 'python');
console.log('IR instructions:', irProgram.instructions.length);
console.log('IR opcodes:', [...new Set(irProgram.instructions.map((i) => i.op))].join(', '));
console.log('Cache stats:', getCacheStats());

console.log('\n=== Cross-Language Algorithm Tests ===');
for (const algoId of ALGORITHM_IDS) {
  const results = SUPPORTED_LANGS.map((lang) => {
    const plan = buildTracePlan(ALGORITHM_SAMPLES[algoId][lang], lang);
    return extractFinalState(plan);
  });

  let algoOk = true;
  if (algoId === 'bubble-sort') {
    algoOk = results.every((r) => r.variables.arr?.[0] === 1);
  } else if (algoId === 'linear-search' || algoId === 'binary-search') {
    algoOk = results.every((r) => r.variables.found === 2);
  } else if (algoId === 'recursion') {
    algoOk = results.every((r) => r.variables.total === 15);
  }

  console.log(`[${algoId}]`, algoOk ? 'OK' : 'FAIL', 'step counts:', results.map((r) => r.stepCount).join(', '));
  if (!algoOk) failed = true;
}

console.log('\n=== Step IR Fields ===');
const step = buildTracePlan('x = 1', 'python').steps.find(
  (s) => s.irOp === IR_OPCODES.ASSIGN || s.irOp === IR_OPCODES.DECLARE_VARIABLE
);
console.log('Assign step has irOp:', step?.irOp, 'visualEvent:', step?.visualEvent);

console.log(failed ? '\nFAILED' : '\nALL PASSED');
process.exit(failed ? 1 : 0);
