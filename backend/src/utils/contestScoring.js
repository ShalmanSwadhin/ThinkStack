import { XP_REWARDS } from 'shared/constants';

export const CONTEST_PENALTY_MINUTES = 20;

export const getContestProblemPoints = (problem) => {
  const difficulty = String(problem?.difficulty || 'easy').toLowerCase();
  if (difficulty === 'hard') return XP_REWARDS.PROBLEM_HARD * 6;
  if (difficulty === 'medium') return XP_REWARDS.PROBLEM_MEDIUM * 8;
  return XP_REWARDS.PROBLEM_EASY * 10;
};

export const resolveEffectiveContestStatus = (contest, now = new Date()) => {
  if (contest.status === 'cancelled') return 'cancelled';
  if (now < new Date(contest.startTime)) return 'scheduled';
  if (now <= new Date(contest.endTime)) return 'active';
  return 'completed';
};

export const calculateIcpcScore = (contestStart, problemIds, contestSubmissions, problemMap) => {
  let score = 0;
  let penaltyMinutes = 0;
  const startMs = new Date(contestStart).getTime();

  for (const problemId of problemIds) {
    const problemKey = problemId.toString();
    const submissions = contestSubmissions
      .filter((entry) => entry.problemId.toString() === problemKey)
      .sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));

    const firstAcceptIndex = submissions.findIndex((entry) => entry.verdict === 'accepted');
    if (firstAcceptIndex === -1) continue;

    const problem = problemMap.get(problemKey);
    score += getContestProblemPoints(problem);

    const wrongBefore = submissions
      .slice(0, firstAcceptIndex)
      .filter((entry) => entry.verdict !== 'accepted').length;
    const firstAccept = submissions[firstAcceptIndex];
    const solveMinutes = Math.max(
      0,
      Math.floor((new Date(firstAccept.submittedAt).getTime() - startMs) / 60000)
    );
    penaltyMinutes += solveMinutes + wrongBefore * CONTEST_PENALTY_MINUTES;
  }

  return { score, penaltyMinutes };
};

export default {
  CONTEST_PENALTY_MINUTES,
  getContestProblemPoints,
  resolveEffectiveContestStatus,
  calculateIcpcScore,
};
