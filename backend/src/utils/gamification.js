/**
 * Calculate user level from XP
 * Formula: level = floor(sqrt(xp / 100))
 * @param {number} xp
 * @returns {number}
 */
export const calculateLevel = (xp = 0) => {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 100));
};

/**
 * XP required to reach a given level
 * @param {number} level
 * @returns {number}
 */
export const xpForLevel = (level) => level * level * 100;

/**
 * XP progress within the current level toward the next
 * @param {number} xp
 */
export const levelProgress = (xp = 0) => {
  const safeXp = Math.max(0, xp);
  const currentLevel = calculateLevel(safeXp);
  const currentLevelXp = xpForLevel(currentLevel);
  const nextLevelXp = xpForLevel(currentLevel + 1);
  const xpIntoLevel = safeXp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;

  return {
    currentLevel,
    nextLevel: currentLevel + 1,
    xpIntoLevel,
    xpForNextLevel: xpNeeded,
    percent: xpNeeded > 0 ? Math.round((xpIntoLevel / xpNeeded) * 100) : 100,
  };
};

export default { calculateLevel, xpForLevel, levelProgress };
