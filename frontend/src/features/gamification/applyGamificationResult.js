import { updateUser } from '../auth/authSlice';

export function applyGamificationResult(dispatch, data) {
  if (!data) return [];

  if (data.gamification || data.stats) {
    dispatch(
      updateUser({
        gamification: data.gamification ?? undefined,
        stats: data.stats ?? undefined,
      })
    );
  }

  return data.newBadges ?? [];
}

export default applyGamificationResult;
