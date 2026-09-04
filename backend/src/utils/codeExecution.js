import { LANGUAGES, VERDICT, XP_REWARDS } from 'shared/constants';
import AppError from './AppError.js';

const LANGUAGE_KEYS = Object.keys(LANGUAGES);

export const resolveLanguage = (language) => {
  const normalized = String(language || '').toLowerCase();
  const entry = Object.entries(LANGUAGES).find(
    ([, value]) => value.monaco === normalized || value.name.toLowerCase() === normalized
  );

  if (!entry) {
    throw new AppError(
      `Unsupported language. Supported: ${LANGUAGE_KEYS.map((key) => LANGUAGES[key].monaco).join(', ')}`,
      400
    );
  }

  const [key, config] = entry;
  return { key, config, monaco: config.monaco };
};

export const normalizeOutput = (output) => {
  if (output == null) return '';
  return String(output)
    .replace(/\r\n/g, '\n')
    .trim()
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n');
};

export const outputsMatch = (actual, expected) =>
  normalizeOutput(actual) === normalizeOutput(expected);

export const resolveVerdict = (result, expectedOutput) => {
  if (result.verdict !== VERDICT.ACCEPTED) {
    return result.verdict;
  }
  if (expectedOutput == null) {
    return result.verdict;
  }
  return outputsMatch(result.stdout, expectedOutput) ? VERDICT.ACCEPTED : VERDICT.WRONG_ANSWER;
};

export const getProblemXpReward = (problem) => {
  if (problem.xpReward?.[problem.difficulty] != null) {
    return problem.xpReward[problem.difficulty];
  }
  if (problem.difficulty === 'easy') return XP_REWARDS.PROBLEM_EASY;
  if (problem.difficulty === 'medium') return XP_REWARDS.PROBLEM_MEDIUM;
  if (problem.difficulty === 'hard') return XP_REWARDS.PROBLEM_HARD;
  return XP_REWARDS.PROBLEM_EASY;
};

export default {
  resolveLanguage,
  normalizeOutput,
  outputsMatch,
  resolveVerdict,
  getProblemXpReward,
};
