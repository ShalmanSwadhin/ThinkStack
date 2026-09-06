/**
 * Regression + cross-language tests for the tracing engine's type-aware expression
 * evaluator (tokenizer -> expressionParser -> evaluator/typeSystem), added when the
 * old `new Function`-based raw-expression fallback was replaced. See
 * NEXT_PHASE_MANUAL_TRACING_FIX_REPORT.md for the full root-cause investigation.
 *
 * The anchor case is:
 *   int sum=24, i=23;
 *   i=i%4;
 *   sum=sum/i++;
 *   printf("sum=%5d i=%d\n", --sum, ++i);
 *   sum*=i--;
 *   printf("sum=%5d i=%d", sum++, i--);
 * which must produce exactly "sum=    7 i=5\n" then "sum=   35 i=4" — not
 * "sum=7.6666666666667 i=..." (the bug this suite exists to prevent regressing).
 */
import { buildTracePlan, extractFinalState, clearIRCache } from '../../../shared/tracing/index.js';

function wrapC(body, lang = 'c') {
  const cout = lang === 'cpp' ? '#include <iostream>\nusing namespace std;\n' : '#include <stdio.h>\n';
  return `${cout}int main() {\n${body}\n  return 0;\n}`;
}

function finalVars(source, lang) {
  return extractFinalState(buildTracePlan(source, lang)).variables;
}

function finalOutput(source, lang) {
  return extractFinalState(buildTracePlan(source, lang)).output;
}

beforeEach(() => {
  clearIRCache();
});

describe('Mandatory regression tests — type-aware arithmetic (Section 24)', () => {
  it('1. integer division truncates evenly in C', () => {
    const vars = finalVars(wrapC('  int a = 10, b = 2;\n  int c = a / b;'), 'c');
    expect(vars.c).toBe(5);
  });

  it('2. integer division truncates a non-even result toward zero in C', () => {
    const vars = finalVars(wrapC('  int a = 7, b = 2;\n  int c = a / b;'), 'c');
    expect(vars.c).toBe(3);
    expect(Number.isInteger(vars.c)).toBe(true);
  });

  it('3. float division produces a real quotient in C', () => {
    const vars = finalVars(wrapC('  float a = 7, b = 2;\n  float c = a / b;'), 'c');
    expect(vars.c).toBeCloseTo(3.5, 10);
  });

  it('4. postfix increment: expression value is OLD value, variable ends up incremented', () => {
    const vars = finalVars(wrapC('  int i = 5;\n  int j = i++;'), 'c');
    expect(vars.j).toBe(5);
    expect(vars.i).toBe(6);
  });

  it('5. prefix increment: expression value is NEW value', () => {
    const vars = finalVars(wrapC('  int i = 5;\n  int j = ++i;'), 'c');
    expect(vars.j).toBe(6);
    expect(vars.i).toBe(6);
  });

  it('6. postfix decrement: expression value is OLD value, variable ends up decremented', () => {
    const vars = finalVars(wrapC('  int i = 5;\n  int j = i--;'), 'c');
    expect(vars.j).toBe(5);
    expect(vars.i).toBe(4);
  });

  it('7. prefix decrement: expression value is NEW value', () => {
    const vars = finalVars(wrapC('  int i = 5;\n  int j = --i;'), 'c');
    expect(vars.j).toBe(4);
    expect(vars.i).toBe(4);
  });

  it('8. compound assignment evaluates the RHS (with its own side effect) exactly once, before combining', () => {
    // sum *= i-- : i-- yields the OLD i (3) and decrements i to 2; sum = 10 * 3 = 30.
    const vars = finalVars(wrapC('  int sum = 10, i = 3;\n  sum *= i--;'), 'c');
    expect(vars.sum).toBe(30);
    expect(vars.i).toBe(2);
  });

  it('9. full reported bug reproduces the exact expected output', () => {
    const code = wrapC(
      [
        '  int sum=24, i=23;',
        '  i=i%4;',
        '  sum=sum/i++;',
        '  printf("sum=%5d i=%d\\n", --sum, ++i);',
        '  sum*=i--;',
        '  printf("sum=%5d i=%d", sum++, i--);',
      ].join('\n')
    );
    const output = finalOutput(code, 'c');
    expect(output).toEqual(['sum=    7 i=5\n', 'sum=   35 i=4']);
  });
});

describe('Cross-language equivalence (Section 25)', () => {
  const LANGS = ['python', 'javascript', 'java', 'c', 'cpp'];

  const INT_DIV = {
    python: 'a = 7\nb = 2\nc = a // b',
    javascript: 'let a = 7;\nlet b = 2;\nlet c = Math.floor(a / b);',
    java: 'int a = 7, b = 2;\nint c = a / b;',
    c: 'int a = 7, b = 2;\nint c = a / b;',
    cpp: 'int a = 7, b = 2;\nint c = a / b;',
  };

  it('integer division truncates toward zero in every language (via each language\'s own idiom)', () => {
    for (const lang of LANGS) {
      const source = lang === 'c' || lang === 'cpp' ? wrapC(`  ${INT_DIV[lang]}`, lang) : INT_DIV[lang];
      const vars = finalVars(source, lang);
      expect(vars.c).toBe(3);
    }
  });

  it('true (float) division of the same operands differs from integer division, per language typing', () => {
    const cases = {
      python: 'a = 7\nb = 2\nc = a / b',
      javascript: 'let a = 7;\nlet b = 2;\nlet c = a / b;',
      java: 'double a = 7, b = 2;\ndouble c = a / b;',
      c: 'double a = 7, b = 2;\ndouble c = a / b;',
      cpp: 'double a = 7, b = 2;\ndouble c = a / b;',
    };
    for (const lang of LANGS) {
      const source = lang === 'c' || lang === 'cpp' ? wrapC(`  ${cases[lang]}`, lang) : cases[lang];
      const vars = finalVars(source, lang);
      expect(vars.c).toBeCloseTo(3.5, 10);
    }
  });

  const PREFIX_POSTFIX = {
    python: null, // Python has no ++/-- operators — not applicable.
    javascript: 'let i = 5;\nlet j = i++;\nlet k = ++i;',
    java: 'int i = 5;\nint j = i++;\nint k = ++i;',
    c: 'int i = 5;\nint j = i++;\nint k = ++i;',
    cpp: 'int i = 5;\nint j = i++;\nint k = ++i;',
  };

  it('prefix vs postfix increment is distinguished identically across every C-family language', () => {
    for (const lang of ['javascript', 'java', 'c', 'cpp']) {
      const source = lang === 'c' || lang === 'cpp' ? wrapC(`  ${PREFIX_POSTFIX[lang]}`, lang) : PREFIX_POSTFIX[lang];
      const vars = finalVars(source, lang);
      expect(vars.j).toBe(5); // postfix: old value
      expect(vars.i).toBe(7); // 5 -> 6 (postfix) -> 7 (prefix)
      expect(vars.k).toBe(7); // prefix: new value
    }
  });

  const COMPOUND = {
    python: 'sum = 10\ni = 3\nsum *= i',
    javascript: 'let sum = 10;\nlet i = 3;\nsum *= i--;',
    java: 'int sum = 10, i = 3;\nsum *= i--;',
    c: 'int sum = 10, i = 3;\nsum *= i--;',
    cpp: 'int sum = 10, i = 3;\nsum *= i--;',
  };

  it('compound assignment produces the same result across languages that support it', () => {
    for (const lang of ['javascript', 'java', 'c', 'cpp']) {
      const source = lang === 'c' || lang === 'cpp' ? wrapC(`  ${COMPOUND[lang]}`, lang) : COMPOUND[lang];
      const vars = finalVars(source, lang);
      expect(vars.sum).toBe(30);
      expect(vars.i).toBe(2);
    }
  });

  const PRECEDENCE = {
    python: 'x = 2 + 3 * 4 - 1',
    javascript: 'let x = 2 + 3 * 4 - 1;',
    java: 'int x = 2 + 3 * 4 - 1;',
    c: 'int x = 2 + 3 * 4 - 1;',
    cpp: 'int x = 2 + 3 * 4 - 1;',
  };

  it('operator precedence (* before +/-) agrees across every language', () => {
    for (const lang of LANGS) {
      const source = lang === 'c' || lang === 'cpp' ? wrapC(`  ${PRECEDENCE[lang]}`, lang) : PRECEDENCE[lang];
      const vars = finalVars(source, lang);
      expect(vars.x).toBe(13);
    }
  });

  const SHORT_CIRCUIT = {
    python: 'calls = 0\ndef mark():\n    return True\nresult = False and mark()',
    javascript: 'let calls = 0;\nlet result = false && (calls = calls + 1);',
    java: 'int calls = 0;\nboolean result = false && (calls == 0);',
    c: 'int calls = 0;\nint result = 0 && (calls = calls + 1);',
    cpp: 'int calls = 0;\nint result = 0 && (calls = calls + 1);',
  };

  it('&& short-circuits: the right operand is not evaluated when the left is false', () => {
    for (const lang of ['javascript', 'c', 'cpp']) {
      const source = lang === 'c' || lang === 'cpp' ? wrapC(`  ${SHORT_CIRCUIT[lang]}`, lang) : SHORT_CIRCUIT[lang];
      const vars = finalVars(source, lang);
      expect(vars.calls).toBe(0);
      expect(vars.result).toBeFalsy();
    }
  });

  const LOOP_SUM = {
    python: 'total = 0\nfor i in range(1, 6):\n    total = total + i',
    javascript: 'let total = 0;\nfor (let i = 1; i <= 5; i++) {\n  total = total + i;\n}',
    java: 'int total = 0;\nfor (int i = 1; i <= 5; i++) {\n  total = total + i;\n}',
    c: 'int total = 0;\nfor (int i = 1; i <= 5; i++) {\n  total = total + i;\n}',
    cpp: 'int total = 0;\nfor (int i = 1; i <= 5; i++) {\n  total = total + i;\n}',
  };

  it('a for-loop summing 1..5 produces 15 in every language', () => {
    for (const lang of LANGS) {
      const source = lang === 'c' || lang === 'cpp' ? wrapC(`  ${LOOP_SUM[lang]}`, lang) : LOOP_SUM[lang];
      const vars = finalVars(source, lang);
      expect(vars.total).toBe(15);
    }
  });

  const WHILE_LOOP = {
    python: 'n = 0\nwhile n < 5:\n    n = n + 1',
    javascript: 'let n = 0;\nwhile (n < 5) {\n  n = n + 1;\n}',
    java: 'int n = 0;\nwhile (n < 5) {\n  n = n + 1;\n}',
    c: 'int n = 0;\nwhile (n < 5) {\n  n = n + 1;\n}',
    cpp: 'int n = 0;\nwhile (n < 5) {\n  n = n + 1;\n}',
  };

  it('a while-loop counting to 5 terminates with n == 5 in every language', () => {
    for (const lang of LANGS) {
      const source = lang === 'c' || lang === 'cpp' ? wrapC(`  ${WHILE_LOOP[lang]}`, lang) : WHILE_LOOP[lang];
      const vars = finalVars(source, lang);
      expect(vars.n).toBe(5);
    }
  });

  const ARRAY_MUTATE = {
    python: 'arr = [1, 2, 3]\narr[1] = 99',
    javascript: 'const arr = [1, 2, 3];\narr[1] = 99;',
    java: 'int[] arr = {1, 2, 3};\narr[1] = 99;',
    c: 'int arr[] = {1, 2, 3};\narr[1] = 99;',
    cpp: 'int arr[] = {1, 2, 3};\narr[1] = 99;',
  };

  it('array element mutation is visible in the final state in every language', () => {
    for (const lang of LANGS) {
      const source = lang === 'c' || lang === 'cpp' ? wrapC(`  ${ARRAY_MUTATE[lang]}`, lang) : ARRAY_MUTATE[lang];
      const vars = finalVars(source, lang);
      expect(vars.arr).toEqual([1, 99, 3]);
    }
  });
});

describe('Unsupported constructs fail loudly instead of mistracing (Section 22)', () => {
  it('an unparseable expression throws rather than silently returning a wrong value', () => {
    // A genuinely malformed expression (mismatched parens) should surface as a thrown
    // trace error, not a guessed number.
    expect(() => finalVars(wrapC('  int x = (1 + ;'), 'c')).toThrow();
  });
});

describe('if/elif/else chains branch correctly (Section 15) — discovered while verifying control flow', () => {
  // Before this fix, only the FIRST `if` in a chain was ever condition-gated: an
  // `elif`/`else` (Python) or `} else if (...) {"`/`} else {` (brace languages)
  // continuation was parsed with no link back to the earlier clause, so after
  // running the first TRUE branch's body, execution fell straight through into the
  // next clause's body/condition check instead of skipping the rest of the chain —
  // and for brace languages, an `else if (...)` condition was never evaluated at
  // all. The LAST clause always won, regardless of which condition actually held.

  it('an else-if chain in C selects the correct branch, not always the last one', () => {
    const code = wrapC(
      [
        '  int x = 5;',
        '  int y = 0;',
        '  if (x > 10) {',
        '    y = 1;',
        '  } else if (x > 3) {',
        '    y = 2;',
        '  } else {',
        '    y = 3;',
        '  }',
      ].join('\n')
    );
    expect(finalVars(code, 'c').y).toBe(2);
  });

  it('a taken if-branch in C does not fall through into the else branch', () => {
    const code = wrapC(
      [
        '  int x = 20;',
        '  int y = 0;',
        '  if (x > 10) {',
        '    y = 1;',
        '  } else {',
        '    y = 2;',
        '  }',
      ].join('\n')
    );
    expect(finalVars(code, 'c').y).toBe(1);
  });

  it("Python's elif/else chain selects the correct branch", () => {
    const code = 'x = 5\ny = 0\nif x > 10:\n    y = 1\nelif x > 3:\n    y = 2\nelse:\n    y = 3';
    expect(finalVars(code, 'python').y).toBe(2);
  });

  it('a multi-clause elif chain picks exactly one branch, for every value in range', () => {
    const classify = (x) => {
      if (x > 100) return 1;
      if (x > 50) return 2;
      if (x > 10) return 3;
      if (x > 0) return 4;
      return 5;
    };
    for (const x of [-5, 0, 1, 10, 11, 50, 51, 100, 101, 500]) {
      const code = `x = ${x}\ny = 0\nif x > 100:\n    y = 1\nelif x > 50:\n    y = 2\nelif x > 10:\n    y = 3\nelif x > 0:\n    y = 4\nelse:\n    y = 5`;
      expect(finalVars(code, 'python').y).toBe(classify(x));
    }
  });

  it('break inside an if inside a for-loop exits the loop, not just the if', () => {
    const code = wrapC(
      [
        '  int sum = 0;',
        '  for (int i = 0; i < 5; i++) {',
        '    if (i == 3) {',
        '      break;',
        '    }',
        '    sum = sum + i;',
        '  }',
      ].join('\n')
    );
    const vars = finalVars(code, 'c');
    expect(vars.sum).toBe(3); // 0 + 1 + 2, stops before adding 3
    expect(vars.i).toBe(3);
  });

  it('continue inside an if inside a for-loop skips only that iteration', () => {
    const code = wrapC(
      [
        '  int sum = 0;',
        '  for (int i = 0; i < 5; i++) {',
        '    if (i == 2) {',
        '      continue;',
        '    }',
        '    sum = sum + i;',
        '  }',
      ].join('\n')
    );
    expect(finalVars(code, 'c').sum).toBe(8); // 0 + 1 + 3 + 4
  });
});

describe('char arithmetic (Section 21 — type-aware arithmetic)', () => {
  it("a char literal promotes to its numeric code in C/C++/Java arithmetic ('a' + 1 === 98)", () => {
    for (const lang of ['c', 'cpp']) {
      const code = wrapC("  char c = 'a';\n  int n = c + 1;", lang);
      expect(finalVars(code, lang).n).toBe(98);
    }
    expect(finalVars('char c = \'a\';\nint n = c + 1;', 'java').n).toBe(98);
  });
});
