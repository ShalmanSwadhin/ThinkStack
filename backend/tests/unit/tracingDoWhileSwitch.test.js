/**
 * Regression tests for `do-while` and `switch`/`case` — previously documented as
 * unimplemented limitations of the tracing engine, now implemented by reusing the
 * SAME unified block-stack architecture used for if-chains and for/while loops
 * (see engine/executor.js):
 *   - `do-while` reuses the while-loop re-check logic exactly (evaluate condition,
 *     jump back or pop) — the only difference is entering the body unconditionally
 *     the first time, before any condition check.
 *   - `switch` pushes a 'switch' block-stack frame so `break` can find and exit
 *     it (like a loop), while falling off the end of the switch body naturally
 *     pops the frame with no redirect (unlike an if-chain, which must skip its
 *     remaining clauses). `case`/`default` are parsed as plain jump-target labels
 *     — everything between them is ordinary code (including nested if/for/while),
 *     so fall-through (no `break`) works exactly as in real C.
 *   - `continue` inside a switch that is itself inside a loop correctly targets
 *     the LOOP, never the switch — C has no notion of "continuing" a switch.
 */
import { buildTracePlan, extractFinalState, clearIRCache } from '../../../shared/tracing/index.js';

function wrapC(body) {
  return `#include <stdio.h>\nint main() {\n${body}\n  return 0;\n}`;
}

function finalVars(code, lang = 'c') {
  return extractFinalState(buildTracePlan(code, lang)).variables;
}

beforeEach(() => {
  clearIRCache();
});

describe('do-while', () => {
  it('executes the body at least once even when the condition starts false', () => {
    const code = wrapC('  int i = 10;\n  int runs = 0;\n  do {\n    runs = runs + 1;\n  } while (i < 3);');
    expect(finalVars(code)).toMatchObject({ runs: 1, i: 10 });
  });

  it('loops until the condition becomes false', () => {
    const code = wrapC('  int i = 0;\n  do {\n    i = i + 1;\n  } while (i < 5);');
    expect(finalVars(code).i).toBe(5);
  });

  it('break exits a do-while immediately', () => {
    const code = wrapC('  int i = 0;\n  do {\n    if (i == 2) {\n      break;\n    }\n    i = i + 1;\n  } while (i < 100);');
    expect(finalVars(code).i).toBe(2);
  });

  it('continue re-checks the do-while condition without running the rest of the body', () => {
    const code = wrapC(
      '  int i = 0;\n  int touched = 0;\n  do {\n    i = i + 1;\n    if (i == 2) {\n      continue;\n    }\n    touched = touched + 1;\n  } while (i < 4);'
    );
    const vars = finalVars(code);
    expect(vars.i).toBe(4);
    expect(vars.touched).toBe(3); // every i except i==2
  });

  it('Allman-style do-while (`do` / `{` / `}` / `while (...)` each on their own line) works the same as the compact style', () => {
    const code = wrapC('  int i = 0;\n  do\n  {\n    i = i + 1;\n  }\n  while (i < 4);');
    expect(finalVars(code).i).toBe(4);
  });

  it('a nested do-while inside a for-loop runs correctly on every outer iteration', () => {
    const code = wrapC(
      '  int total = 0;\n  for (int i = 0; i < 3; i++) {\n    int j = 0;\n    do {\n      total = total + 1;\n      j = j + 1;\n    } while (j < 2);\n  }'
    );
    expect(finalVars(code).total).toBe(6);
  });
});

describe('switch / case', () => {
  it('executes the matching case', () => {
    const code = wrapC(
      '  int x = 2, y = 0;\n  switch (x) {\n    case 1:\n      y = 10;\n      break;\n    case 2:\n      y = 20;\n      break;\n    default:\n      y = 99;\n  }'
    );
    expect(finalVars(code).y).toBe(20);
  });

  it('falls back to default when no case matches', () => {
    const code = wrapC(
      '  int x = 5, y = 0;\n  switch (x) {\n    case 1:\n      y = 10;\n      break;\n    case 2:\n      y = 20;\n      break;\n    default:\n      y = 99;\n  }'
    );
    expect(finalVars(code).y).toBe(99);
  });

  it('falls through into the next case when there is no break', () => {
    const code = wrapC(
      '  int x = 1, y = 0;\n  switch (x) {\n    case 1:\n      y = y + 1;\n    case 2:\n      y = y + 10;\n      break;\n    case 3:\n      y = y + 100;\n  }'
    );
    expect(finalVars(code).y).toBe(11); // case 1 runs, falls through to case 2, break stops before case 3
  });

  it('does nothing when no case matches and there is no default', () => {
    const code = wrapC('  int x = 99, y = 5;\n  switch (x) {\n    case 1:\n      y = 10;\n      break;\n  }');
    expect(finalVars(code).y).toBe(5);
  });

  it('break inside a switch exits only the switch, not an enclosing loop', () => {
    const code = wrapC(
      [
        '  int total = 0;',
        '  for (int i = 0; i < 3; i++) {',
        '    switch (i) {',
        '      case 1:',
        '        total = total + 100;',
        '        break;',
        '      default:',
        '        total = total + 1;',
        '    }',
        '  }',
      ].join('\n')
    );
    // i=0: default (+1), i=1: case1 (+100), i=2: default (+1) — loop ran all 3 times
    expect(finalVars(code)).toMatchObject({ total: 102, i: 3 });
  });

  it('continue inside a switch inside a loop targets the LOOP, not the switch', () => {
    const code = wrapC(
      [
        '  int total = 0;',
        '  for (int i = 0; i < 4; i++) {',
        '    switch (i) {',
        '      case 2:',
        '        continue;',
        '      default:',
        '        total = total + i;',
        '    }',
        '    total = total + 1000;',
        '  }',
      ].join('\n')
    );
    // i=0: default(+0)+1000=1000 | i=1: default(+1)+1000=1001 (running total 2001)
    // i=2: matches case 2 -> continue immediately (no default fall-through, no +1000)
    // i=3: default(+3)+1000=1003 (running total 2001+3+1000=3004)
    expect(finalVars(code)).toMatchObject({ total: 3004, i: 4 });
  });

  it('nested if/for/while inside a case work exactly as anywhere else', () => {
    const code = wrapC(
      [
        '  int x = 1, sum = 0;',
        '  switch (x) {',
        '    case 1:',
        '      for (int i = 0; i < 3; i++) {',
        '        sum = sum + i;',
        '      }',
        '      break;',
        '    default:',
        '      sum = -1;',
        '  }',
      ].join('\n')
    );
    expect(finalVars(code).sum).toBe(3); // 0+1+2
  });
});
