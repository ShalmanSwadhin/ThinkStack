import { calculateLevel, xpForLevel, levelProgress } from '../../src/utils/gamification.js';

describe('gamification utils', () => {
  it('calculates level from XP', () => {
    expect(calculateLevel(0)).toBe(0);
    expect(calculateLevel(100)).toBe(1);
    expect(calculateLevel(400)).toBe(2);
    expect(calculateLevel(900)).toBe(3);
  });

  it('returns XP required for level', () => {
    expect(xpForLevel(0)).toBe(0);
    expect(xpForLevel(1)).toBe(100);
    expect(xpForLevel(2)).toBe(400);
    expect(xpForLevel(10)).toBe(10000);
  });

  it('calculates progress toward next level', () => {
    expect(levelProgress(0)).toMatchObject({
      currentLevel: 0,
      nextLevel: 1,
      xpIntoLevel: 0,
      xpForNextLevel: 100,
      percent: 0,
    });
    expect(levelProgress(250).currentLevel).toBe(1);
    expect(levelProgress(250).percent).toBe(50);
  });
});
