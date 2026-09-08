/**
 * Regression tests for the tracing engine's semantic event model:
 *   - trace-event ORDERING (real execution order, not source-line order)
 *   - trace-event CLASSIFICATION (eventType/eventSubtype/executionStatus/
 *     conditionResult, computed from parsed AST/IR fields — see
 *     explain/classify.js — not generic "Statement"/"Assignment"/"Comment" labels)
 *
 * Background: `if (a > b && c < 10) { b = b + a--; } else { c = c + b++; }` used to
 * show its condition, THEN an immediate "else: skipped" notice, THEN the executed
 * `b = b + a--` line — i.e. source order, not execution order (the skip notice was
 * emitted the instant the branch was taken, before its body had run). Separately,
 * `#include`, blank lines, and `int a = 17;`-style declarations were all lumped
 * into "Statement"/"Comment"/"Assignment" respectively, which is semantically wrong
 * and educationally misleading for a tracing tool.
 */
import { buildTracePlan, extractFinalState, clearIRCache } from '../../../shared/tracing/index.js';

function wrapC(body) {
  return `#include <stdio.h>\nint main() {\n${body}\n  return 0;\n}`;
}

function steps(code, lang = 'c') {
  return buildTracePlan(code, lang).steps;
}

function finalVars(code, lang = 'c') {
  return extractFinalState(buildTracePlan(code, lang)).variables;
}

beforeEach(() => {
  clearIRCache();
});

describe('Execution order (Section 1 / Section 4): real runtime order, not source order', () => {
  it('true branch: condition → executed body → else marked skipped AFTER the body (not before)', () => {
    const code = wrapC('  int a = 10, b = 3, c = 5;\n  if (a > b && c < 10) {\n    b = b + a--;\n  } else {\n    c = c + b++;\n  }');
    const s = steps(code);

    const conditionStep = s.find((st) => st.sourceLine.includes('if (a > b'));
    const bodyStep = s.find((st) => st.sourceLine.includes('b + a--'));
    const elseStep = s.find((st) => st.sourceLine.trim() === '} else {');

    expect(conditionStep.executionStatus).toBe('Executed');
    expect(bodyStep.executionStatus).toBe('Executed');
    expect(elseStep.executionStatus).toBe('Skipped');

    // The crux of the fix: execution order must be condition, THEN body, THEN the
    // else's skip notice — never skip-before-body.
    expect(conditionStep.executionOrder).toBeLessThan(bodyStep.executionOrder);
    expect(bodyStep.executionOrder).toBeLessThan(elseStep.executionOrder);

    expect(finalVars(code)).toEqual({ a: 9, b: 13, c: 5 });
  });

  it('false branch: condition → if-branch marked skipped → else body executes, in that order', () => {
    const code = wrapC('  int a = 1, b = 3, c = 5;\n  if (a > b && c < 10) {\n    b = b + a--;\n  } else {\n    c = c + b++;\n  }');
    const s = steps(code);

    const conditionStep = s.find((st) => st.sourceLine.includes('if (a > b'));
    const elseBodyStep = s.find((st) => st.sourceLine.includes('c + b++'));

    expect(conditionStep.executionStatus).toBe('Skipped');
    expect(conditionStep.conditionResult).toBe(false);
    expect(elseBodyStep.executionStatus).toBe('Executed');
    expect(conditionStep.executionOrder).toBeLessThan(elseBodyStep.executionOrder);

    // The if-branch's own body line must never appear as an executed step.
    expect(s.some((st) => st.sourceLine.includes('b + a--'))).toBe(false);
    expect(finalVars(code)).toEqual({ a: 1, b: 4, c: 8 });
  });

  it('nested conditions: only the correct nested path executes, in real order', () => {
    const code = wrapC(
      [
        '  int a = 5, b = 5, c = 0;',
        '  if (a > 0) {',
        '    if (b > 0) {',
        '      c = 1;',
        '    } else {',
        '      c = 2;',
        '    }',
        '  } else {',
        '    c = 3;',
        '  }',
      ].join('\n')
    );
    const s = steps(code);
    const outerIf = s.find((st) => st.sourceLine.includes('if (a > 0)'));
    const innerIf = s.find((st) => st.sourceLine.includes('if (b > 0)'));
    const innerElse = s.find((st) => st.sourceLine.trim() === '} else {' && st.line > innerIf.line);
    const cAssign = s.find((st) => st.sourceLine.trim() === 'c = 1;');

    expect(outerIf.executionStatus).toBe('Executed');
    expect(innerIf.executionStatus).toBe('Executed');
    expect(cAssign.executionStatus).toBe('Executed');
    expect(innerElse.executionStatus).toBe('Skipped');
    expect(innerIf.executionOrder).toBeLessThan(cAssign.executionOrder);
    expect(cAssign.executionOrder).toBeLessThan(innerElse.executionOrder);
    expect(finalVars(code).c).toBe(1);
  });

  it('else-if chain: exactly one branch executes, and only ITS body appears before its own skip notices', () => {
    const code = wrapC(
      ['  int a = 2, x = 0;', '  if (a == 1) {', '    x = 1;', '  } else if (a == 2) {', '    x = 2;', '  } else {', '    x = 3;', '  }'].join('\n')
    );
    const s = steps(code);
    const executedClause = s.filter((st) => st.eventType === 'Condition' || st.eventType === 'Branch').filter((st) => st.executionStatus === 'Executed');
    const skippedClauses = s.filter((st) => st.eventType === 'Condition' || st.eventType === 'Branch').filter((st) => st.executionStatus === 'Skipped');
    expect(executedClause).toHaveLength(1);
    expect(executedClause[0].sourceLine).toContain('a == 2');
    expect(skippedClauses).toHaveLength(2); // `a == 1` (evaluated false) and `else` (never reached)
    expect(finalVars(code).x).toBe(2);
  });

  it('for-loop execution order: initialization, then (condition, body, update) per iteration, ending on a false condition', () => {
    const code = wrapC('  int x = 0;\n  for (int i = 0; i < 3; i++) {\n    x += i;\n  }');
    const s = steps(code).filter((st) => st.sourceLine.includes('for (') || st.sourceLine.includes('x += i'));

    const phases = s.map((st) => st.eventSubtype);
    expect(phases).toEqual([
      'LoopInitialization',
      'For', // condition → true
      'CompoundAssignment', // body
      'LoopUpdate',
      'For', // condition → true
      'CompoundAssignment',
      'LoopUpdate',
      'For', // condition → true
      'CompoundAssignment',
      'LoopUpdate',
      'For', // condition → false, loop ends
    ]);
    expect(s[0].executionStatus).toBe('Executed'); // initialization
    expect(s.at(-1).conditionResult).toBe(false); // final condition check
    expect(finalVars(code).x).toBe(3); // 0+1+2
  });
});

describe('Event classification (Section 2 / Section 6): semantic categories, not generic labels', () => {
  it('a C #include is classified as a Preprocessor Directive, not a Statement', () => {
    const s = steps(wrapC('  int x = 1;'));
    const includeStep = s.find((st) => st.sourceLine.includes('#include'));
    expect(includeStep.eventType).toBe('Preprocessor Directive');
    expect(includeStep.eventSubtype).toBe('Include');
    expect(includeStep.executionStatus).toBe('NotApplicable');
    expect(includeStep.type).not.toBe('statement');
  });

  it('a declaration with an initializer is classified as Declaration, not Assignment', () => {
    const s = steps(wrapC('  int a = 17;'));
    const declStep = s.find((st) => st.sourceLine.includes('int a = 17'));
    expect(declStep.eventType).toBe('Declaration');
    expect(declStep.eventSubtype).toBe('DeclarationAndInitialization');
    expect(declStep.type).toBe('declaration');
    expect(declStep.type).not.toBe('assign');
  });

  it('a multi-variable declaration classifies EACH variable as its own Declaration event', () => {
    const s = steps(wrapC('  int a = 17, b = 5, c = 2;'));
    const declSteps = s.filter((st) => st.sourceLine.includes('int a = 17'));
    expect(declSteps).toHaveLength(3);
    for (const step of declSteps) {
      expect(step.eventType).toBe('Declaration');
      expect(step.eventSubtype).toBe('DeclarationAndInitialization');
    }
  });

  it('a declaration with NO initializer is classified as plain Declaration (not Declaration+Initialization)', () => {
    const s = steps(wrapC('  int x;\n  x = 5;'));
    const declOnly = s.find((st) => st.sourceLine.trim() === 'int x;');
    const laterAssign = s.find((st) => st.sourceLine.trim() === 'x = 5;');
    expect(declOnly.eventType).toBe('Declaration');
    expect(declOnly.eventSubtype).toBe('Declaration');
    // The LATER line assigns to an already-declared `x` — that's a real Assignment,
    // not a second declaration.
    expect(laterAssign.eventType).toBe('Assignment');
  });

  it('a genuine reassignment (already-declared variable) is classified as Assignment', () => {
    const s = steps(wrapC('  int a = 1;\n  a = 2;'));
    const reassign = s.find((st) => st.sourceLine.trim() === 'a = 2;');
    expect(reassign.eventType).toBe('Assignment');
    expect(reassign.eventSubtype).toBe('Assignment');
  });

  it("Python reassignment is classified as Assignment, not Declaration, despite Python's parser tagging every `x = ...` line as a declaration syntactically (no declaration keyword exists to tell them apart)", () => {
    const s = steps(['a = 10', 'a = a + 1'].join('\n'), 'python');
    const first = s.find((st) => st.sourceLine === 'a = 10');
    const second = s.find((st) => st.sourceLine === 'a = a + 1');
    expect(first.eventType).toBe('Declaration');
    expect(second.eventType).toBe('Assignment');
  });

  it('a comment line is classified as Comment', () => {
    const s = steps(wrapC('  // this is a comment\n  int a = 1;'));
    const commentStep = s.find((st) => st.sourceLine.includes('this is a comment'));
    expect(commentStep.eventType).toBe('Comment');
    expect(commentStep.executionStatus).toBe('NotApplicable');
  });

  it('a blank line is classified as Blank, NEVER as Comment', () => {
    const s = steps(wrapC('  int a = 1;\n\n  int b = 2;'));
    const blankStep = s.find((st) => st.sourceLine === '');
    expect(blankStep).toBeDefined();
    expect(blankStep.eventType).toBe('Blank');
    expect(blankStep.eventType).not.toBe('Comment');
    expect(blankStep.type).not.toBe('comment');
  });

  it('printf is classified as Output', () => {
    const s = steps(wrapC('  printf("hi");'));
    const printStep = s.find((st) => st.sourceLine.includes('printf'));
    expect(printStep.eventType).toBe('Output');
  });

  it('scanf is classified as Input, and is reported honestly as not simulated', () => {
    const s = steps(wrapC('  int x;\n  scanf("%d", &x);'));
    const scanfStep = s.find((st) => st.sourceLine.includes('scanf'));
    expect(scanfStep.eventType).toBe('Input');
    expect(scanfStep.executionStatus).toBe('NotSimulated');
  });

  it('if / else-if / else each get their own eventType+eventSubtype', () => {
    const code = wrapC(
      ['  int a = 2, x = 0;', '  if (a == 1) {', '    x = 1;', '  } else if (a == 2) {', '    x = 2;', '  } else {', '    x = 3;', '  }'].join('\n')
    );
    const s = steps(code);
    const ifClause = s.find((st) => st.sourceLine.includes('a == 1'));
    const elseIfClause = s.find((st) => st.sourceLine.includes('a == 2'));
    const elseClause = s.find((st) => st.sourceLine.trim() === '} else {');
    expect(ifClause.eventType).toBe('Condition');
    expect(ifClause.eventSubtype).toBe('If');
    expect(elseIfClause.eventType).toBe('Condition');
    expect(elseIfClause.eventSubtype).toBe('ElseIf');
    expect(elseClause.eventType).toBe('Branch');
    expect(elseClause.eventSubtype).toBe('Else');
  });

  it('for/while loops are classified as Loop', () => {
    const forStep = steps(wrapC('  for (int i = 0; i < 1; i++) {\n    i = i;\n  }')).find((st) => st.eventSubtype === 'For');
    const whileStep = steps(wrapC('  int i = 0;\n  while (i < 1) {\n    i = i + 1;\n  }')).find((st) => st.eventSubtype === 'While');
    expect(forStep.eventType).toBe('Loop');
    expect(whileStep.eventType).toBe('Loop');
  });

  it('break/continue/return are classified as ControlFlow', () => {
    const breakStep = steps(wrapC('  for (int i = 0; i < 3; i++) {\n    break;\n  }')).find((st) => st.sourceLine.trim() === 'break;');
    const continueStep = steps(wrapC('  for (int i = 0; i < 3; i++) {\n    continue;\n  }')).find((st) => st.sourceLine.trim() === 'continue;');
    const returnStep = steps(wrapC('  return 0;')).find((st) => st.sourceLine.includes('return 0'));
    expect(breakStep.eventType).toBe('ControlFlow');
    expect(breakStep.eventSubtype).toBe('Break');
    expect(continueStep.eventType).toBe('ControlFlow');
    expect(continueStep.eventSubtype).toBe('Continue');
    expect(returnStep.eventType).toBe('ControlFlow');
    expect(returnStep.eventSubtype).toBe('Return');
  });

  it('a function definition is classified as FunctionDeclaration and honestly marked as not traced', () => {
    const code = [
      '#include <stdio.h>',
      'int square(int x) {',
      '  return x * x;',
      '}',
      'int main() {',
      '  int y = 1;',
      '  return 0;',
      '}',
    ].join('\n');
    const s = steps(code);
    const funcDefStep = s.find((st) => st.sourceLine.includes('int square'));
    expect(funcDefStep.eventType).toBe('FunctionDeclaration');
    expect(funcDefStep.executionStatus).toBe('NotApplicable');
    // Its body must never appear as an executed step (no call-stack model).
    expect(s.some((st) => st.sourceLine.includes('x * x'))).toBe(false);
  });

  it('a bare function-call statement is classified as FunctionCall', () => {
    const code = [
      '#include <stdio.h>',
      'int helper(int x) {',
      '  return x;',
      '}',
      'int main() {',
      '  helper(5);',
      '  return 0;',
      '}',
    ].join('\n');
    const s = steps(code);
    const callStep = s.find((st) => st.sourceLine.trim() === 'helper(5);');
    expect(callStep.eventType).toBe('FunctionCall');
  });
});

describe('Regression: existing functionality must remain correct after the event-model refactor', () => {
  it('integer division, modulo, and floating point still work', () => {
    expect(finalVars(wrapC('  int a = 7, b = 2;\n  int c = a / b;\n  int m = a % b;'))).toMatchObject({ c: 3, m: 1 });
    expect(finalVars(wrapC('  float a = 7, b = 2;\n  float c = a / b;')).c).toBeCloseTo(3.5, 10);
  });

  it('prefix/postfix increment/decrement still work', () => {
    const vars = finalVars(wrapC('  int i = 5;\n  int post = i++;\n  int pre = ++i;\n  int postd = i--;\n  int pred = --i;'));
    expect(vars).toMatchObject({ post: 5, pre: 7, postd: 7, pred: 5 });
  });

  it('compound assignment still works', () => {
    expect(finalVars(wrapC('  int sum = 10, i = 3;\n  sum *= i--;'))).toEqual({ sum: 30, i: 2 });
  });

  it('the exact originally-reported program still produces the exact expected output', () => {
    const code = wrapC(
      '  int a = 10, b = 3, c = 5;\n  if (a > b && c < 10) {\n    b = b + a--;\n  } else {\n    c = c + b++;\n  }\n  printf("a=%d b=%d c=%d", a, b, c);'
    );
    const plan = buildTracePlan(code, 'c');
    expect(extractFinalState(plan).output).toEqual(['a=9 b=13 c=5']);
  });

  it('for-loop execution and termination still work', () => {
    expect(finalVars(wrapC('  int total = 0;\n  for (int i = 0; i < 5; i++) {\n    total = total + i;\n  }')).total).toBe(10);
  });
});
