/**
 * The lesson-sample runner must never report a syntax check as an execution. These tests pin
 * that behaviour without needing a compiler on the machine, and exercise real compilation
 * (including a compile error being reported) when one is available.
 */
import { canExecute, findCompiler, resetCompilerCache, runSample } from '../helpers/runLessonCode.js';

const C_HELLO = '#include <stdio.h>\nint main(void) {\n    printf("hi\\n");\n    return 0;\n}';
const C_BROKEN = '#include <stdio.h>\nint main(void) {\n    printf("hi\\n")\n    return 0;\n}';

describe('runSample for compiled languages', () => {
  it('flags an unbalanced listing as failed without needing a compiler', () => {
    const result = runSample({ lang: 'c', src: 'int main( {', out: undefined });
    expect(result.status).toBe('failed');
    expect(result.executed).toBe(false);
  });

  it('says plainly that nothing was compiled or run when there is no compiler', () => {
    const saved = process.env.LESSON_CC;
    process.env.LESSON_CC = 'definitely-not-a-compiler-xyz';
    resetCompilerCache();
    try {
      const result = runSample({ lang: 'c', src: C_HELLO });
      expect(result.status).toBe('passed');
      expect(result.executed).toBe(false);
      expect(result.detail).toMatch(/NOT compiled or run/);
      expect(canExecute('c')).toBe(false);
    } finally {
      if (saved === undefined) delete process.env.LESSON_CC;
      else process.env.LESSON_CC = saved;
      resetCompilerCache();
    }
  });

  const maybe = findCompiler('c') ? it : it.skip;

  maybe('compiles and runs a C sample and compares its output', () => {
    expect(canExecute('c')).toBe(true);
    const ok = runSample({ lang: 'c', src: C_HELLO, out: 'hi' });
    expect(ok).toMatchObject({ status: 'passed', executed: true });
    const wrong = runSample({ lang: 'c', src: C_HELLO, out: 'bye' });
    expect(wrong.status).toBe('failed');
    expect(wrong.detail).toMatch(/output mismatch/);
  }, 120000);

  maybe('reports a C compile error instead of passing on balanced brackets', () => {
    const result = runSample({ lang: 'c', src: C_BROKEN });
    expect(result.status).toBe('failed');
    expect(result.detail).toMatch(/compile error/);
  }, 120000);
});
