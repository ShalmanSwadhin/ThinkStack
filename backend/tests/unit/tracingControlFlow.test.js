/**
 * Control-flow correctness regression tests for the tracing engine.
 *
 * Triggered by a stress test that found: `if (a > b && c < 10) { b = b + a--; }
 * else { c = c + b++; }` with a=10,b=3,c=5 correctly took the true branch (a=9,
 * b=13,c=5) but THEN also ran the else branch (b=14,c=18) — mutually exclusive
 * branches both executed. Root-caused to `parsers/blockParser.js`'s if/else chain
 * parser assuming every clause body is brace-delimited; a BRACELESS body (`if (cond)
 * stmt; else stmt;` — valid, common C/C++/Java/JS syntax) has no `}` to bound it, so
 * the old code fell back to scanning for the next `}` ANYWHERE in the rest of the
 * file, which (finding none, or finding the wrong one) swallowed the else clause
 * into the if's own "body" and then re-ran it as a supposedly separate clause.
 *
 * While auditing the fix, three further genuine (not hypothetical) bugs were found
 * and fixed the same way — via property tests, not because they were reported:
 *   - a full `if (...) { ... } else { ... }` chain on ONE physical line executed
 *     NEITHER branch (a degenerate empty body range on both sides);
 *   - a helper function defined before `main` (`int square(int x) { return x*x; }`)
 *     stopped the ENTIRE trace at its `return`, since there is no call stack to
 *     unwind and RETURN was treated as "the whole program is over";
 *   - a fixed-size array declaration (`int arr[5] = {1,2,3,4,5};`) was invisible to
 *     the declaration parser (which only recognized empty `arr[]` brackets), so the
 *     array was silently never created.
 */
import { buildTracePlan, extractFinalState, clearIRCache } from '../../../shared/tracing/index.js';

function wrapC(body, lang = 'c') {
  const cout = lang === 'cpp' ? '#include <iostream>\nusing namespace std;\n' : '#include <stdio.h>\n';
  return `${cout}int main() {\n${body}\n  return 0;\n}`;
}

function finalVars(source, lang) {
  return extractFinalState(buildTracePlan(source, lang)).variables;
}

beforeEach(() => {
  clearIRCache();
});

describe('Mutually exclusive if/else branches (the reported stress-test bug)', () => {
  const REPORTED_BODY = '  int a = 10, b = 3, c = 5;\n  if (a > b && c < 10) {\n    b = b + a--;\n  } else {\n    c = c + b++;\n  }';

  it('braced if/else: only the true branch runs', () => {
    const vars = finalVars(wrapC(REPORTED_BODY), 'c');
    expect(vars).toEqual({ a: 9, b: 13, c: 5 });
  });

  it('braceless if/else (both clauses single-statement, no braces at all): only the true branch runs', () => {
    const body = '  int a = 10, b = 3, c = 5;\n  if (a > b && c < 10)\n    b = b + a--;\n  else\n    c = c + b++;';
    const vars = finalVars(wrapC(body), 'c');
    expect(vars).toEqual({ a: 9, b: 13, c: 5 });
  });

  it('braceless if, braced else: only the true branch runs', () => {
    const body = '  int a = 10, b = 3, c = 5;\n  if (a > b && c < 10)\n    b = b + a--;\n  else {\n    c = c + b++;\n  }';
    const vars = finalVars(wrapC(body), 'c');
    expect(vars).toEqual({ a: 9, b: 13, c: 5 });
  });

  it('braced if, braceless else: only the true branch runs', () => {
    const body = '  int a = 10, b = 3, c = 5;\n  if (a > b && c < 10) {\n    b = b + a--;\n  } else\n    c = c + b++;';
    const vars = finalVars(wrapC(body), 'c');
    expect(vars).toEqual({ a: 9, b: 13, c: 5 });
  });

  it('the whole if/else on ONE physical line: only the true branch runs', () => {
    const body = '  int a = 10, b = 3, c = 5;\n  if (a > b && c < 10) { b = b + a--; } else { c = c + b++; }';
    const vars = finalVars(wrapC(body), 'c');
    expect(vars).toEqual({ a: 9, b: 13, c: 5 });
  });

  it('when the condition is false, only the else branch runs (braced)', () => {
    const body = '  int a = 1, b = 3, c = 5;\n  if (a > b && c < 10) {\n    b = b + a--;\n  } else {\n    c = c + b++;\n  }';
    const vars = finalVars(wrapC(body), 'c');
    // a > b is false, so: c = 5 + 3 = 8, b becomes 4 (postfix ++), a untouched.
    expect(vars).toEqual({ a: 1, b: 4, c: 8 });
  });

  it('when the condition is false, only the else branch runs (braceless)', () => {
    const body = '  int a = 1, b = 3, c = 5;\n  if (a > b && c < 10)\n    b = b + a--;\n  else\n    c = c + b++;';
    const vars = finalVars(wrapC(body), 'c');
    expect(vars).toEqual({ a: 1, b: 4, c: 8 });
  });

  it('property test: across many (a,b,c) triples, exactly one branch fires — never both, never neither', () => {
    function randInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    for (let trial = 0; trial < 100; trial += 1) {
      const a = randInt(-20, 20);
      const b = randInt(-20, 20);
      const c = randInt(-20, 20);
      const body = `  int a = ${a}, b = ${b}, c = ${c};\n  if (a > b && c < 10) {\n    b = b + a--;\n  } else {\n    c = c + b++;\n  }`;
      const vars = finalVars(wrapC(body), 'c');
      const conditionTrue = a > b && c < 10;
      if (conditionTrue) {
        expect(vars).toEqual({ a: a - 1, b: b + a, c });
      } else {
        expect(vars).toEqual({ a, b: b + 1, c: c + b });
      }
    }
  });
});

describe('Nested and chained if/else (audit)', () => {
  it('nested if/else: inner branch selection does not leak into the outer branch', () => {
    const body = [
      '  int a = 10, b = 3, c = 5, result = 0;',
      '  if (a > 5) {',
      '    if (a > b && c < 10) {',
      '      b = b + a--;',
      '      result = 1;',
      '    } else {',
      '      c = c + b++;',
      '      result = 2;',
      '    }',
      '  } else {',
      '    result = 3;',
      '  }',
    ].join('\n');
    const vars = finalVars(wrapC(body), 'c');
    expect(vars).toEqual({ a: 9, b: 13, c: 5, result: 1 });
  });

  it('if/else-if/else chain (else-if branch): exactly one branch executes', () => {
    const body = [
      '  int x = 5, y = 0;',
      '  if (x > 10) {',
      '    y = 1;',
      '  } else if (x > 3) {',
      '    y = 2;',
      '  } else {',
      '    y = 3;',
      '  }',
    ].join('\n');
    expect(finalVars(wrapC(body), 'c')).toEqual({ x: 5, y: 2 });
  });

  it("Python's elif/else chain: exactly one branch executes", () => {
    const code = 'x = 5\ny = 0\nif x > 10:\n    y = 1\nelif x > 3:\n    y = 2\nelse:\n    y = 3';
    expect(finalVars(code, 'python')).toEqual({ x: 5, y: 2 });
  });
});

describe('if/else interacting with loops, break, continue, return (audit)', () => {
  it('if/else inside a for-loop toggles correctly across every iteration', () => {
    const body = [
      '  int sum = 0;',
      '  for (int i = 0; i < 6; i++) {',
      '    if (i % 2 == 0) {',
      '      sum = sum + i;',
      '    } else {',
      '      sum = sum - i;',
      '    }',
      '  }',
    ].join('\n');
    // +0 -1 +2 -3 +4 -5 = -3
    expect(finalVars(wrapC(body), 'c').sum).toBe(-3);
  });

  it('nested for-loops with if/else inside: inner loop state does not leak across outer iterations', () => {
    const body = [
      '  int total = 0;',
      '  for (int i = 0; i < 3; i++) {',
      '    for (int j = 0; j < 3; j++) {',
      '      if (j > i) {',
      '        total = total + 1;',
      '      } else {',
      '        total = total - 1;',
      '      }',
      '    }',
      '  }',
    ].join('\n');
    // i=0: j=0,1,2 -> -1,+1,+1 = +1 | i=1: j=0,1,2 -> -1,-1,+1 = -1 | i=2: -1,-1,-1 = -3
    // total = 1 - 1 - 3 = -3
    expect(finalVars(wrapC(body), 'c').total).toBe(-3);
  });

  it('break inside if inside for-loop exits the loop without corrupting the if/else logic', () => {
    const body = [
      '  int result = 0;',
      '  for (int i = 0; i < 10; i++) {',
      '    if (i == 5) {',
      '      break;',
      '    } else if (i % 2 == 0) {',
      '      result = result + i;',
      '    } else {',
      '      result = result - i;',
      '    }',
      '  }',
    ].join('\n');
    // i=0..4: +0 -1 +2 -3 +4 = 2, then break at i=5
    expect(finalVars(wrapC(body), 'c').result).toBe(2);
  });

  it('continue inside if inside for-loop skips exactly one iteration per if/else evaluation', () => {
    const body = [
      '  int sum = 0;',
      '  for (int i = 0; i < 6; i++) {',
      '    if (i == 3) {',
      '      continue;',
      '    } else {',
      '      sum = sum + i;',
      '    }',
      '  }',
    ].join('\n');
    // 0+1+2+4+5 = 12 (3 skipped)
    expect(finalVars(wrapC(body), 'c').sum).toBe(12);
  });

  it('return inside a branch of if/else stops the trace at that point (no further lines run)', () => {
    const code = [
      '#include<stdio.h>',
      'int main() {',
      '  int x = 10;',
      '  if (x > 5) {',
      '    x = 100;',
      '    return 0;',
      '  } else {',
      '    x = 200;',
      '  }',
      '  x = 999;',
      '  return 0;',
      '}',
    ].join('\n');
    expect(finalVars(code, 'c').x).toBe(100);
  });
});

describe('Function definitions other than main do not corrupt the trace', () => {
  it('a helper function defined BEFORE main is skipped, not executed as top-level code', () => {
    const code = [
      '#include<stdio.h>',
      'int square(int x) {',
      '  return x * x;',
      '}',
      'int main() {',
      '  int a = 10, b = 3, c = 5;',
      '  if (a > b && c < 10) {',
      '    b = b + a--;',
      '  } else {',
      '    c = c + b++;',
      '  }',
      '  return 0;',
      '}',
    ].join('\n');
    expect(finalVars(code, 'c')).toEqual({ a: 9, b: 13, c: 5 });
  });

  it('a helper function defined AFTER main is skipped too', () => {
    const code = [
      '#include<stdio.h>',
      'int main() {',
      '  int x = 5;',
      '  x = x + 1;',
      '  return 0;',
      '}',
      'int helper(int y) {',
      '  return y + 100;',
      '}',
    ].join('\n');
    expect(finalVars(code, 'c').x).toBe(6);
  });
});

describe('Fixed-size array declarations', () => {
  it('`int arr[N] = {...}` (explicit size) creates and traces the array correctly', () => {
    const vars = finalVars(wrapC('  int arr[3] = {1, 2, 3};\n  arr[0] = 99;'), 'c');
    expect(vars.arr).toEqual([99, 2, 3]);
  });

  it('an array snapshot taken BEFORE a later mutation is not retroactively corrupted', () => {
    const code = wrapC('  int arr[3] = {1, 2, 3};\n  int x = arr[0];\n  arr[0] = 99;\n  int y = arr[0];');
    const plan = buildTracePlan(code, 'c');
    const beforeMutation = plan.steps.find((s) => s.sourceLine.includes('int x = arr[0]'));
    expect(beforeMutation.variables.arr).toEqual([1, 2, 3]);
  });
});

describe('Explanatory notes describe the actual expression, not a guessed delta (Section: generic notes)', () => {
  it('`a += i` is described via the real expression, not assumed to always be "+1"', () => {
    const code = wrapC('  int a = 5, i = 7;\n  a += i;');
    const plan = buildTracePlan(code, 'c');
    const step = plan.steps.find((s) => s.sourceLine.includes('a += i'));
    expect(step.variables.a).toBe(12);
    expect(step.explanation).toMatch(/a \+= i/);
    expect(step.explanation).not.toMatch(/increases by one/i);
  });

  it('`a += i` where i happens to be 1 is still described via the expression, not mislabeled as `a++`', () => {
    const code = wrapC('  int a = 5, i = 1;\n  a += i;');
    const plan = buildTracePlan(code, 'c');
    const step = plan.steps.find((s) => s.sourceLine.includes('a += i'));
    expect(step.variables.a).toBe(6);
    expect(step.explanation).toMatch(/a \+= i/);
  });
});

describe('if/while/for headers with nested parentheses in their condition (audit)', () => {
  // `if (max(a, b) > c)`, `while (abs(x) > 5)`, `for (...; i < max(a,b); ...)` all
  // used to be truncated by a non-greedy regex that stopped at the FIRST `)` it
  // saw (the one closing the inner call), not the one actually closing the
  // if/while/for header — so the condition text fed to the expression parser was
  // literally `max(a` or `abs(x`, which failed to parse at all.

  it('if condition containing a function call parses and branches correctly', () => {
    const code = wrapC('  int a = -10, b = 3, flag = 0;\n  if (abs(a) > b) {\n    flag = 1;\n  } else {\n    flag = 2;\n  }');
    expect(finalVars(code, 'c').flag).toBe(1);
  });

  it('while condition containing a function call parses and loops correctly', () => {
    const code = wrapC('  int x = -5, steps = 0;\n  while (abs(x) > 0) {\n    x = x + 1;\n    steps = steps + 1;\n  }');
    expect(finalVars(code, 'c').steps).toBe(5);
  });

  it('for-loop condition containing a function call parses and loops correctly', () => {
    const code = wrapC('  int a = 3, b = 5, count = 0;\n  for (int i = 0; i < max(a, b); i++) {\n    count = count + 1;\n  }');
    expect(finalVars(code, 'c').count).toBe(5);
  });

  it('if condition with nested arithmetic parentheses parses and branches correctly', () => {
    const code = wrapC('  int a = 2, b = 3, c = 4, flag = 0;\n  if ((a + b) * c > 15) {\n    flag = 1;\n  } else {\n    flag = 2;\n  }');
    // (2+3)*4 = 20 > 15 -> true
    expect(finalVars(code, 'c').flag).toBe(1);
  });
});
