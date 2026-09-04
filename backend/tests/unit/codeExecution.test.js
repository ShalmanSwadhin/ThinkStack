import {
  normalizeOutput,
  outputsMatch,
  resolveVerdict,
  getProblemXpReward,
} from '../../src/utils/codeExecution.js';
import { VERDICT, DIFFICULTY } from 'shared/constants';

describe('codeExecution utils', () => {
  it('normalizes trailing whitespace and line endings', () => {
    expect(normalizeOutput(' 1 2 3 \r\n')).toBe('1 2 3');
    expect(normalizeOutput('a\nb\n')).toBe('a\nb');
  });

  it('compares outputs after normalization', () => {
    expect(outputsMatch('10\n', '10')).toBe(true);
    expect(outputsMatch('10', '11')).toBe(false);
  });

  it('resolves wrong answer when stdout mismatches expected output', () => {
    const result = { verdict: VERDICT.ACCEPTED, stdout: '5' };
    expect(resolveVerdict(result, '6')).toBe(VERDICT.WRONG_ANSWER);
    expect(resolveVerdict(result, '5')).toBe(VERDICT.ACCEPTED);
  });

  it('returns XP reward by difficulty', () => {
    expect(getProblemXpReward({ difficulty: DIFFICULTY.EASY })).toBe(10);
    expect(getProblemXpReward({ difficulty: DIFFICULTY.MEDIUM })).toBe(25);
    expect(getProblemXpReward({ difficulty: DIFFICULTY.HARD })).toBe(50);
  });
});
