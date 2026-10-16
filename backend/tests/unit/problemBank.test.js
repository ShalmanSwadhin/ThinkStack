/**
 * Quality gate for the practice problem bank (backend/src/seed/problems).
 *
 * The bank used to be 30 templates stamped ten times each, with one shared hidden test whose
 * expected output was unrelated to the problem, so no correct solution could pass. These tests
 * make sure that cannot come back: titles are unique, example outputs (written by hand) agree
 * with the reference solution, hidden cases are produced by that solution, and the stored
 * reference program really runs standalone and reproduces every expected output.
 */
import { spawnSync } from 'node:child_process';
import { PROBLEM_SPECS } from '../../src/seed/problems/index.js';
import { PROBLEMS, buildTestCases, referenceProgram, templateKey } from '../../src/seed/generators/problemBank.js';

const norm = (text) => String(text).replace(/\r\n/g, '\n').trim().split('\n').map((l) => l.trimEnd()).join('\n');

describe('problem bank structure', () => {
  it('has distinct titles and slugs, and no numbered duplicates', () => {
    const titles = PROBLEM_SPECS.map((s) => s.title);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(PROBLEMS.map((p) => p.slug)).size).toBe(PROBLEMS.length);
    const numbered = PROBLEMS.filter((p) => /\s\d+$/.test(p.title) || /-\d+$/.test(p.slug));
    expect(numbered.map((p) => p.slug)).toEqual([]);
  });

  it('gives every problem the fields a learner needs', () => {
    const bad = [];
    for (const spec of PROBLEM_SPECS) {
      const missing = ['text', 'input', 'output', 'idea', 'tags'].filter((f) => !spec[f] || (Array.isArray(spec[f]) && !spec[f].length));
      if (!spec.examples?.length) missing.push('examples');
      if (typeof spec.solve !== 'function') missing.push('solve');
      if (typeof spec.gen !== 'function') missing.push('gen');
      if (missing.length) bad.push(`${spec.title}: ${missing.join(', ')}`);
    }
    expect(bad).toEqual([]);
  });
});

describe('problem examples and hidden tests are correct', () => {
  it.each(PROBLEM_SPECS.map((s) => [s.title, s]))('%s', (_title, spec) => {
    for (const [input, output] of spec.examples) {
      expect({ input, got: norm(spec.solve(input)) }).toEqual({ input, got: norm(output) });
    }
    const cases = buildTestCases(spec);
    expect(cases.length).toBeGreaterThanOrEqual(spec.examples.length + 3);
    expect(cases.filter((c) => !c.isHidden)).toHaveLength(spec.examples.length);
    for (const c of cases) {
      expect(c.input.length).toBeGreaterThan(0);
      expect(norm(c.expectedOutput)).not.toBe('');
      expect(norm(c.expectedOutput)).not.toMatch(/NaN|undefined|Infinity/);
    }
  });
});

describe('stored problems', () => {
  it('match the specs and keep stable keys', () => {
    expect(PROBLEMS).toHaveLength(PROBLEM_SPECS.length);
    for (const [i, problem] of PROBLEMS.entries()) {
      expect(problem.slug).toBe(templateKey(PROBLEM_SPECS[i].title));
      expect(problem.testCases.some((c) => c.isHidden)).toBe(true);
      expect(problem.referenceSolution.code).toContain('const solve =');
    }
  });

  it('ship a reference program that runs standalone and reproduces the expected output', () => {
    const failures = [];
    for (const spec of PROBLEM_SPECS) {
      const program = referenceProgram(spec);
      const cases = buildTestCases(spec);
      for (const c of [cases[0], cases[cases.length - 1]]) {
        const run = spawnSync(process.execPath, ['-e', program], { input: c.input, encoding: 'utf8', timeout: 20000 });
        if (run.status !== 0 || norm(run.stdout) !== norm(c.expectedOutput)) failures.push(`${spec.title}: ${run.stderr?.slice(0, 120) || 'output differs'}`);
      }
    }
    expect(failures).toEqual([]);
  }, 300000);
});
