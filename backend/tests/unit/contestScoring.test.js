import { describe, expect, it } from '@jest/globals';
import { calculateIcpcScore, getContestProblemPoints } from '../../src/utils/contestScoring.js';
import { VERDICT } from 'shared/constants';

describe('contestScoring', () => {
  it('returns difficulty-based points', () => {
    expect(getContestProblemPoints({ difficulty: 'easy' })).toBe(100);
    expect(getContestProblemPoints({ difficulty: 'medium' })).toBe(200);
    expect(getContestProblemPoints({ difficulty: 'hard' })).toBe(300);
  });

  it('calculates ICPC score with penalty minutes', () => {
    const contestStart = new Date('2026-01-01T10:00:00.000Z');
    const problemId = '651234567890123456789012';
    const problemMap = new Map([[problemId, { difficulty: 'easy' }]]);

    const submissions = [
      {
        problemId,
        verdict: VERDICT.WRONG_ANSWER,
        submittedAt: new Date('2026-01-01T10:05:00.000Z'),
      },
      {
        problemId,
        verdict: VERDICT.ACCEPTED,
        submittedAt: new Date('2026-01-01T10:20:00.000Z'),
      },
    ];

    const result = calculateIcpcScore(contestStart, [problemId], submissions, problemMap);

    expect(result.score).toBe(100);
    expect(result.penaltyMinutes).toBe(40);
  });
});
