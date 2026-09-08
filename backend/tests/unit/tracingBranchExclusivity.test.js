/**
 * Regression tests triggered by a report that a large nested if/else-if/else +
 * loop program traced incorrectly. Root-caused to TWO separate, real bugs in
 * `parsers/blockParser.js`'s if/else-if/else chain parser — NOT the branch
 * selection logic itself (which was already correct after the earlier
 * if/else-fix pass — see tracingControlFlow.test.js):
 *
 *   1. Allman/GNU brace style: when a clause's body closes with a bare `}` on
 *      its own line and the next clause's `else`/`else if` starts a SEPARATE
 *      following line (rather than sharing the `}`'s line, i.e. `} else if (...) {`
 *      on one line), the parser treated the bare `}` as "chain ends here" and
 *      never recognized the `else if (...)` line as a continuation at all. It
 *      fell through as an unrecognized top-level statement (a silent no-op), and
 *      everything physically after it in the source ran completely
 *      UNCONDITIONALLY as ordinary top-level code — reproducing exactly the
 *      reported symptom ("execution enters a branch whose condition is false").
 *   2. A statement wrapped across multiple physical lines (e.g. a `printf(...)`
 *      call with its closing paren on a later line) was silently dropped
 *      entirely — the first physical line was missing its closing `)` so nothing
 *      recognized it as a call, and the continuation line(s) matched nothing
 *      either.
 *
 * The reported program's expected final state (from the bug report) was
 * total=84 score=263 bonus=91 count=32. That figure could NOT be reproduced by
 * an independently-written reference implementation of the same program (a
 * direct, careful JS transliteration using the same truncating-division/
 * postfix-increment semantics), nor by hand-verifying three specific tricky
 * segments (a for-loop whose index is ALSO manually incremented inside its own
 * body, a `continue`, and a `break`) line-by-line against the C source. All
 * three converge on total=169 score=182 bonus=50 count=23, which is what this
 * suite asserts as the correct regression value — see the accompanying report
 * for the full verification trail. Notably, the bug report's OWN Section 7
 * worked example (`i=2, score=48` → `score = score + i++` → `score=50, i=3`)
 * already contradicts its Section 2 narrative (which claims score stays 48 at
 * the same point) — the engine's behavior here matches the report's own stated
 * rule, not its narrative.
 */
import { buildTracePlan, extractFinalState, clearIRCache } from '../../../shared/tracing/index.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

function wrapC(body) {
  return `#include <stdio.h>\nint main() {\n${body}\n  return 0;\n}`;
}

function finalVars(code, lang = 'c') {
  return extractFinalState(buildTracePlan(code, lang)).variables;
}

function steps(code, lang = 'c') {
  return buildTracePlan(code, lang).steps;
}

beforeEach(() => {
  clearIRCache();
});

describe('Test A/B: if/else-if/else mutual exclusivity', () => {
  it('Test A: the else-if branch is taken; the final else never runs', () => {
    const code = wrapC('  int x = 5;\n  if (x > 10) {\n    x = 100;\n  }\n  else if (x > 3) {\n    x = 50;\n  }\n  else {\n    x = 10;\n  }');
    expect(finalVars(code).x).toBe(50);
  });

  it('Test B: no condition matches; the final else runs', () => {
    const code = wrapC('  int x = 1;\n  if (x > 10) {\n    x = 100;\n  }\n  else if (x > 5) {\n    x = 50;\n  }\n  else {\n    x = 10;\n  }');
    expect(finalVars(code).x).toBe(10);
  });

  it('Allman-style else-if (}/else-if on SEPARATE lines) is a real regression case: same exclusivity, GNU/Allman brace layout', () => {
    // This exact layout — `}` alone, then `else if (...)` on the NEXT line — is
    // what silently broke: the else-if body ran unconditionally regardless of
    // its own condition.
    const code = wrapC(
      [
        '  int x = 5;',
        '  if (x > 10)',
        '  {',
        '    x = 100;',
        '  }',
        '  else if (x > 3)',
        '  {',
        '    x = 50;',
        '  }',
        '  else',
        '  {',
        '    x = 10;',
        '  }',
      ].join('\n')
    );
    expect(finalVars(code).x).toBe(50);
  });

  it('Allman-style final else is also reached correctly when no condition matches', () => {
    const code = wrapC(
      [
        '  int x = 1;',
        '  if (x > 10)',
        '  {',
        '    x = 100;',
        '  }',
        '  else if (x > 5)',
        '  {',
        '    x = 50;',
        '  }',
        '  else',
        '  {',
        '    x = 10;',
        '  }',
      ].join('\n')
    );
    expect(finalVars(code).x).toBe(10);
  });

  it('a skipped branch (Allman style) never generates a fake execution event for its body', () => {
    const code = wrapC(
      ['  int x = 5;', '  if (x > 10)', '  {', '    x = 100;', '  }', '  else if (x > 3)', '  {', '    x = 50;', '  }', '  else', '  {', '    x = 10;', '  }'].join('\n')
    );
    const s = steps(code);
    expect(s.some((st) => st.sourceLine.trim() === 'x = 100;')).toBe(false);
    expect(s.some((st) => st.sourceLine.trim() === 'x = 10;')).toBe(false);
    const elseIfStep = s.find((st) => st.sourceLine.includes('x > 3'));
    expect(elseIfStep.executionStatus).toBe('Executed');
  });
});

describe('Test C: continue skips the rest of the loop body and still runs the update', () => {
  it('statements after continue are skipped; the loop update still executes', () => {
    const code = wrapC(
      ['  int sum = 0;', '  int touched = 0;', '  for (int i = 0; i < 5; i++) {', '    if (i == 2) {', '      continue;', '    }', '    sum = sum + i;', '    touched = touched + 100;', '  }'].join(
        '\n'
      )
    );
    const vars = finalVars(code);
    // i=2's iteration must NOT add 100 to `touched` (statement after continue).
    expect(vars.sum).toBe(0 + 1 + 3 + 4); // 8, i=2 skipped
    expect(vars.touched).toBe(400); // only 4 of 5 iterations reach it
    // The loop still terminates normally (update + condition kept running).
    expect(vars.i).toBe(5);
  });
});

describe('Test D/E: break terminates only the nearest enclosing loop', () => {
  it('Test D: break exits the loop it is directly inside', () => {
    const code = wrapC('  int i;\n  for (i = 0; i < 10; i++) {\n    if (i == 3) {\n      break;\n    }\n  }');
    expect(finalVars(code).i).toBe(3);
  });

  it('Test E: breaking the inner loop does not break the outer loop', () => {
    const code = wrapC(
      [
        '  int outerRuns = 0;',
        '  int innerBreakAt = -1;',
        '  for (int i = 0; i < 3; i++) {',
        '    outerRuns = outerRuns + 1;',
        '    for (int j = 0; j < 5; j++) {',
        '      if (j == 2) {',
        '        innerBreakAt = j;',
        '        break;',
        '      }',
        '    }',
        '  }',
      ].join('\n')
    );
    const vars = finalVars(code);
    expect(vars.outerRuns).toBe(3); // outer loop ran all 3 times, unaffected by inner breaks
    expect(vars.innerBreakAt).toBe(2);
  });

  it('the loop update does NOT execute after break, but DOES execute after continue (Section 8)', () => {
    // If the update ran after break, `i` would be 4 (3, then i++). It must stay 3.
    const breakCode = wrapC('  int i;\n  for (i = 0; i < 10; i++) {\n    if (i == 3) {\n      break;\n    }\n  }');
    expect(finalVars(breakCode).i).toBe(3);

    // If the update did NOT run after continue, this would infinite-loop or `i`
    // would never advance past 2; confirm it reaches the natural termination value.
    const continueCode = wrapC('  int i;\n  for (i = 0; i < 5; i++) {\n    if (i == 2) {\n      continue;\n    }\n  }');
    expect(finalVars(continueCode).i).toBe(5);
  });
});

describe('Test F: postfix increment inside a compound expression', () => {
  it('x = x + i++ uses the OLD value of i, then increments it', () => {
    const code = wrapC('  int i = 2;\n  int x = 10;\n  x = x + i++;');
    expect(finalVars(code)).toEqual({ i: 3, x: 12 });
  });

  it('bonus += k++; count += k; — the SECOND statement sees the NEW k (a real sequence point exists between them)', () => {
    const code = wrapC('  int k = 1, bonus = 5, count = 0;\n  bonus += k++;\n  count += k;');
    const vars = finalVars(code);
    expect(vars.bonus).toBe(6); // 5 + OLD k (1)
    expect(vars.k).toBe(2); // incremented
    expect(vars.count).toBe(2); // uses NEW k (2), not the old value used by the previous statement
  });
});

describe('Multi-line statement continuation (a real, separate bug found while investigating)', () => {
  it('a printf call whose closing paren is on a LATER physical line still executes and produces output', () => {
    const code = [
      '#include <stdio.h>',
      'int main() {',
      '  int total = 5;',
      '  printf("total=%d",',
      '         total);',
      '  return 0;',
      '}',
    ].join('\n');
    const result = extractFinalState(buildTracePlan(code, 'c'));
    expect(result.output).toEqual(['total=5']);
  });
});

describe('Test G: full complex regression program', () => {
  it('the exact reported program converges on the independently-verified correct final state', () => {
    const code = readFileSync(join(__dirname, 'fixtures', 'branchExclusivityStressTest.c'), 'utf8');
    const plan = buildTracePlan(code, 'c');
    const result = extractFinalState(plan);
    // Verified via: (1) an independent JS reference transliteration of this exact
    // program using the same truncating-division/postfix-increment semantics,
    // producing an IDENTICAL result; (2) hand-tracing three specific tricky
    // segments (a for-loop whose index is ALSO manually incremented inside its
    // own body, a `continue`, and a `break`) line-by-line against the C source,
    // each matching this engine's own trace exactly. See this file's header
    // comment and the fix report for the full verification trail.
    expect(result.variables).toMatchObject({ total: 169, score: 182, bonus: 50, count: 23 });
    expect(result.output).toEqual(['total=169 score=182 bonus=50 count=23\n']);
  });
});
