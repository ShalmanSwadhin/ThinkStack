/**
 * Regression tests for nested control flow in the Manual Tracing engine: loops inside
 * loops, if/else inside if/else, and every mix of the two.
 *
 * Every program is traced and checked for:
 *   - the exact order of EXECUTED source lines (execution order, not source order),
 *   - which if/else clauses are announced as SKIPPED (and that they come after the taken body),
 *   - loop entry, per-iteration state, and explicit loop-exit events,
 *   - per-step variable state and accumulated output,
 *   - that every step points at a real, executable source line (never a comment/blank line).
 *
 * The expected sequences below were derived by hand from the Python semantics of each
 * program — not copied from the engine's output.
 */
import { buildTracePlan, clearIRCache } from '../../../shared/tracing/index.js';

beforeEach(() => clearIRCache());

const trace = (code, language = 'python') => buildTracePlan(code, language);
// A condition that evaluated to false still RAN (its test was evaluated) — it is its
// branch that is skipped — so evaluated conditions count as executed lines.
const evaluated = (s) =>
  s.executionStatus === 'Executed' || s.conditionResult === true || s.conditionResult === false;
const executed = (plan) => plan.steps.filter(evaluated);
// A clause announced as skipped without being evaluated (e.g. an `else` after a taken `if`).
const skipped = (plan) =>
  plan.steps.filter((s) => s.executionStatus === 'Skipped' && s.conditionResult == null);
const executedLines = (plan) => executed(plan).map((s) => s.line);
const finalOutput = (plan) => plan.steps.at(-1).output;
const finalVars = (plan) => plan.steps.at(-1).variables;

describe('every step points at real, executable source', () => {
  const programs = {
    'nested loop + nested if/else': `for i in range(3):\n    # compare the two indexes\n    for j in range(3):\n\n        if i == j:\n            print("same")\n        else:\n            # i and j differ\n            if i > j:\n                print("greater")\n            else:\n                print("less")\n`,
    'while + if/else': `i = 0\nwhile i < 5:\n    if i % 2 == 0:\n        print("even")\n    else:\n        print("odd")\n    i += 1\n`,
  };

  for (const [name, code] of Object.entries(programs)) {
    it(`${name}: no step lands on a comment or blank line`, () => {
      const lines = code.split('\n');
      const plan = trace(code);
      expect(plan.steps.length).toBeGreaterThan(0);
      for (const step of plan.steps) {
        const text = lines[step.line - 1];
        expect(text).toBeDefined();
        expect(text.trim()).not.toBe('');
        expect(text.trim().startsWith('#')).toBe(false);
        expect(step.sourceLine).toBe(text);
      }
    });
  }

  it('numbers steps 1..n in execution order and never invents a line past the end of the file', () => {
    const code = `for i in range(2):\n    print(i)\n`;
    const plan = trace(code);
    plan.steps.forEach((step, index) => expect(step.executionOrder).toBe(index + 1));
    expect(plan.lineCount).toBe(2);
    expect(Math.max(...plan.steps.map((s) => s.line))).toBeLessThanOrEqual(2);
  });
});

describe('TEST 1 — simple loop', () => {
  const code = `for i in range(3):\n    print(i)\n`;

  it('runs the header, body, header, body, header, body, then exits the loop', () => {
    const plan = trace(code);
    expect(executedLines(plan)).toEqual([1, 2, 1, 2, 1, 2, 1]);
    expect(finalOutput(plan)).toEqual(['0', '1', '2']);
  });

  it('tracks the loop variable and ends with an explicit loop-exit event', () => {
    const plan = trace(code);
    const headers = plan.steps.filter((s) => s.line === 1);
    expect(headers.map((s) => s.variables.i)).toEqual([0, 1, 2, 2]);
    expect(headers.map((s) => s.conditionResult)).toEqual([null, null, null, false]);
    expect(headers.at(-1).explanation).toMatch(/no more items|finished/i);
    expect(finalVars(plan)).toEqual({ i: 2 });
  });
});

describe('TEST 2 — nested loop', () => {
  const code = `for i in range(2):\n    for j in range(3):\n        print(i, j)\n`;

  it('finishes the whole inner loop (and exits it) before the next outer iteration', () => {
    const plan = trace(code);
    expect(executedLines(plan)).toEqual([
      1, 2, 3, 2, 3, 2, 3, 2, // i=0: inner j=0,1,2 then inner exit
      1, 2, 3, 2, 3, 2, 3, 2, // i=1: inner j=0,1,2 then inner exit
      1, //                      outer loop exit
    ]);
    expect(finalOutput(plan)).toEqual(['0 0', '0 1', '0 2', '1 0', '1 1', '1 2']);
  });

  it('shows exactly one inner-loop exit per outer iteration plus one outer-loop exit', () => {
    const plan = trace(code);
    const exits = plan.steps.filter((s) => s.eventType === 'Loop' && s.conditionResult === false);
    expect(exits.map((s) => s.line)).toEqual([2, 2, 1]);
  });

  it('keeps i and j correct at every print', () => {
    const plan = trace(code);
    const prints = plan.steps.filter((s) => s.eventType === 'Output');
    expect(prints.map((s) => [s.variables.i, s.variables.j])).toEqual([
      [0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2],
    ]);
    expect(finalVars(plan)).toEqual({ i: 1, j: 2 });
  });
});

describe('TEST 3 — nested if/else', () => {
  const program = (x) =>
    `x = ${x}\nif x > 0:\n    if x > 10:\n        print("large")\n    else:\n        print("small")\nelse:\n    print("negative")\n`;

  it('x = 15: takes the inner if, then announces both else clauses as skipped', () => {
    const plan = trace(program(15));
    expect(executedLines(plan)).toEqual([1, 2, 3, 4]);
    expect(skipped(plan).map((s) => s.line)).toEqual([5, 7]);
    expect(plan.steps.map((s) => s.line)).toEqual([1, 2, 3, 4, 5, 7]); // skips come AFTER the taken body
    expect(finalOutput(plan)).toEqual(['large']);
  });

  it('x = 5: inner condition is false so the inner else runs; outer else is skipped', () => {
    const plan = trace(program(5));
    expect(executedLines(plan)).toEqual([1, 2, 3, 5, 6]);
    expect(skipped(plan).map((s) => s.line)).toEqual([7]);
    expect(plan.steps.find((s) => s.line === 3).conditionResult).toBe(false);
    expect(finalOutput(plan)).toEqual(['small']);
  });

  it('x = -2: outer condition is false so only the outer else runs; the inner block is never entered', () => {
    const plan = trace(program(-2));
    expect(executedLines(plan)).toEqual([1, 2, 7, 8]);
    expect(skipped(plan)).toEqual([]);
    expect(plan.steps.some((s) => s.line === 3 || s.line === 4 || s.line === 6)).toBe(false);
    expect(finalOutput(plan)).toEqual(['negative']);
  });
});

describe('TEST 4 — loop + if/else', () => {
  const code = `for i in range(5):\n    if i % 2 == 0:\n        print("even")\n    else:\n        print("odd")\n`;

  it('runs exactly one branch per iteration', () => {
    const plan = trace(code);
    expect(finalOutput(plan)).toEqual(['even', 'odd', 'even', 'odd', 'even']);
    expect(executedLines(plan)).toEqual([
      1, 2, 3, //    i=0 even
      1, 2, 4, 5, // i=1 odd (else clause runs)
      1, 2, 3, //    i=2 even
      1, 2, 4, 5, // i=3 odd
      1, 2, 3, //    i=4 even
      1, //          loop exit
    ]);
  });

  it('records the condition result for every iteration and never runs both branches', () => {
    const plan = trace(code);
    const conditions = plan.steps.filter((s) => s.line === 2).map((s) => s.conditionResult);
    expect(conditions).toEqual([true, false, true, false, true]);
    const evenPrints = executed(plan).filter((s) => s.line === 3).length;
    const oddPrints = executed(plan).filter((s) => s.line === 5).length;
    expect([evenPrints, oddPrints]).toEqual([3, 2]);
  });

  it('announces the else clause as skipped only on the iterations where the if was taken', () => {
    const plan = trace(code);
    expect(skipped(plan).map((s) => s.line)).toEqual([4, 4, 4]);
  });
});

describe('TEST 5 — nested loop + nested if/else', () => {
  const code = [
    'for i in range(3):',
    '    for j in range(3):',
    '        if i == j:',
    '            print("same")',
    '        else:',
    '            if i > j:',
    '                print("greater")',
    '            else:',
    '                print("less")',
    '',
  ].join('\n');

  const reference = () => {
    const out = [];
    for (let i = 0; i < 3; i += 1) {
      for (let j = 0; j < 3; j += 1) {
        if (i === j) out.push('same');
        else if (i > j) out.push('greater');
        else out.push('less');
      }
    }
    return out;
  };

  it('produces the same output as an independent reference implementation', () => {
    expect(finalOutput(trace(code))).toEqual(reference());
  });

  it('visits the three decision lines in the right order for the first inner pass (i=0)', () => {
    const plan = trace(code);
    // i=0: j=0 same | j=1 less | j=2 less, then inner exit
    expect(executedLines(plan).slice(0, 17)).toEqual([
      1, 2, 3, 4, //          i=0, j=0: i == j -> "same"
      2, 3, 5, 6, 8, 9, //    j=1: not equal -> else -> i > j false -> inner else -> "less"
      2, 3, 5, 6, 8, 9, //    j=2: same path -> "less"
      2, //                   inner loop exit
    ]);
    // ...and the very next executed line is the next OUTER iteration's header.
    expect(executedLines(plan)[17]).toBe(1);
  });

  it('only ever executes one of the three prints per (i, j) pair', () => {
    const plan = trace(code);
    const prints = plan.steps.filter((s) => s.eventType === 'Output');
    expect(prints).toHaveLength(9);
    expect(prints.map((s) => [s.variables.i, s.variables.j, s.output.at(-1)])).toEqual([
      [0, 0, 'same'], [0, 1, 'less'], [0, 2, 'less'],
      [1, 0, 'greater'], [1, 1, 'same'], [1, 2, 'less'],
      [2, 0, 'greater'], [2, 1, 'greater'], [2, 2, 'same'],
    ]);
  });

  it('has three inner-loop exits and one outer-loop exit, and ends with the outer exit', () => {
    const plan = trace(code);
    const exits = plan.steps.filter((s) => s.eventType === 'Loop' && s.conditionResult === false);
    expect(exits.map((s) => s.line)).toEqual([2, 2, 2, 1]);
    expect(plan.steps.at(-1).line).toBe(1);
    expect(finalVars(plan)).toEqual({ i: 2, j: 2 });
  });
});

describe('TEST 6 — while + if/else', () => {
  const code = `i = 0\nwhile i < 5:\n    if i % 2 == 0:\n        print("even")\n    else:\n        print("odd")\n    i += 1\n`;

  it('re-checks the while condition after each pass and exits when it turns false', () => {
    const plan = trace(code);
    expect(executedLines(plan)).toEqual([
      1,
      2, 3, 4, 7, //    i=0 even
      2, 3, 5, 6, 7, // i=1 odd
      2, 3, 4, 7, //    i=2 even
      2, 3, 5, 6, 7, // i=3 odd
      2, 3, 4, 7, //    i=4 even
      2, //             i=5 -> condition false, loop exits
    ]);
    expect(finalOutput(plan)).toEqual(['even', 'odd', 'even', 'odd', 'even']);
    expect(finalVars(plan)).toEqual({ i: 5 });
  });

  it('records the while condition result on every check', () => {
    const plan = trace(code);
    const checks = plan.steps.filter((s) => s.line === 2).map((s) => s.conditionResult);
    expect(checks).toEqual([true, true, true, true, true, false]);
  });

  it('increments i exactly once per iteration, after the branch', () => {
    const plan = trace(code);
    const increments = plan.steps.filter((s) => s.line === 7);
    expect(increments.map((s) => s.variables.i)).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('TEST 7 — mixed nesting (loop > if > loop)', () => {
  const code = `for i in range(3):\n    if i == 1:\n        for j in range(2):\n            print(j)\n    else:\n        print(i)\n`;

  it('only enters the inner loop on the iteration where the condition holds', () => {
    const plan = trace(code);
    expect(executedLines(plan)).toEqual([
      1, 2, 5, 6, //          i=0: not 1 -> else -> print(i)
      1, 2, 3, 4, 3, 4, 3, // i=1: inner loop j=0, j=1, then inner exit
      1, 2, 5, 6, //          i=2: else again
      1, //                   outer loop exit
    ]);
    expect(finalOutput(plan)).toEqual(['0', '0', '1', '2']);
  });

  it('announces the else as skipped once, after the inner loop has finished', () => {
    const plan = trace(code);
    const skips = skipped(plan);
    expect(skips.map((s) => s.line)).toEqual([5]);
    const skipIndex = plan.steps.indexOf(skips[0]);
    const lastInnerExit = plan.steps.findLastIndex((s) => s.line === 3 && s.conditionResult === false);
    expect(skipIndex).toBeGreaterThan(lastInnerExit);
  });

  it('keeps both loop variables correct', () => {
    const plan = trace(code);
    const inner = plan.steps.filter((s) => s.line === 4);
    expect(inner.map((s) => [s.variables.i, s.variables.j])).toEqual([[1, 0], [1, 1]]);
    expect(finalVars(plan)).toEqual({ i: 2, j: 1 });
  });
});

describe('other nesting shapes', () => {
  it('for inside while', () => {
    const plan = trace(`n = 0\nwhile n < 2:\n    for k in range(2):\n        print(n, k)\n    n += 1\n`);
    expect(finalOutput(plan)).toEqual(['0 0', '0 1', '1 0', '1 1']);
    expect(finalVars(plan)).toEqual({ n: 2, k: 1 });
  });

  it('while inside for', () => {
    const plan = trace(`for a in range(2):\n    b = 0\n    while b < 2:\n        print(a, b)\n        b += 1\n`);
    expect(finalOutput(plan)).toEqual(['0 0', '0 1', '1 0', '1 1']);
  });

  it('break leaves only the innermost loop; the outer loop carries on', () => {
    const plan = trace(`for i in range(3):\n    for j in range(3):\n        if j == 1:\n            break\n        print(i, j)\n`);
    expect(finalOutput(plan)).toEqual(['0 0', '1 0', '2 0']);
  });

  it('continue skips the rest of the current inner iteration only', () => {
    const plan = trace(`for i in range(2):\n    for j in range(3):\n        if j == 1:\n            continue\n        print(i, j)\n`);
    expect(finalOutput(plan)).toEqual(['0 0', '0 2', '1 0', '1 2']);
  });

  it('else-if chain inside a loop picks exactly one clause per iteration', () => {
    const plan = trace(`for n in range(4):\n    if n == 0:\n        print("zero")\n    elif n == 1:\n        print("one")\n    else:\n        print("many")\n`);
    expect(finalOutput(plan)).toEqual(['zero', 'one', 'many', 'many']);
  });
});

describe('the same nested program behaves identically across languages', () => {
  const expected = (() => {
    const out = [];
    for (let i = 0; i < 3; i += 1) {
      for (let j = 0; j < 3; j += 1) out.push(i === j ? 'same' : i > j ? 'greater' : 'less');
    }
    return out;
  })();

  const programs = {
    python: `for i in range(3):\n    for j in range(3):\n        if i == j:\n            print("same")\n        else:\n            if i > j:\n                print("greater")\n            else:\n                print("less")\n`,
    javascript: `for (let i = 0; i < 3; i++) {\n  for (let j = 0; j < 3; j++) {\n    if (i === j) {\n      console.log("same");\n    } else {\n      if (i > j) {\n        console.log("greater");\n      } else {\n        console.log("less");\n      }\n    }\n  }\n}\n`,
    c: `#include <stdio.h>\nint main() {\n    for (int i = 0; i < 3; i++) {\n        for (int j = 0; j < 3; j++) {\n            if (i == j) {\n                printf("same\\n");\n            } else {\n                if (i > j) {\n                    printf("greater\\n");\n                } else {\n                    printf("less\\n");\n                }\n            }\n        }\n    }\n    return 0;\n}\n`,
    java: `public class Main {\n    public static void main(String[] args) {\n        for (int i = 0; i < 3; i++) {\n            for (int j = 0; j < 3; j++) {\n                if (i == j) {\n                    System.out.println("same");\n                } else {\n                    if (i > j) {\n                        System.out.println("greater");\n                    } else {\n                        System.out.println("less");\n                    }\n                }\n            }\n        }\n    }\n}\n`,
  };

  for (const [language, code] of Object.entries(programs)) {
    it(`${language}: output matches and one branch runs per (i, j) pair`, () => {
      const plan = trace(code, language);
      // C's printf only adds a newline when the format string contains one.
      expect(finalOutput(plan).map((line) => line.replace(/\n$/, ''))).toEqual(expected);

      const decisions = plan.steps
        .filter((s) => s.eventType === 'Condition' && s.conditionResult !== null)
        .map((s) => s.conditionResult);
      // 9 pairs: the outer if/else is evaluated 9 times, the nested if only when it was false (6 times)
      expect(decisions).toHaveLength(9 + 6);
    });
  }
});
