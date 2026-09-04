import env from '../config/env.js';
import logger from './logger.js';

export const COMING_SOON_MESSAGES = {
  gemini:
    'The AI Tutor is temporarily unavailable because the AI service has not yet been configured. This feature will be enabled in a future update.',
  judge0:
    'The online compiler has not yet been configured. You can still browse problems and write code. Online execution will be enabled in a future update.',
};

const warned = { gemini: false, judge0: false };

export const isGeminiConfigured = () => Boolean(env.gemini.apiKey?.trim());

export const isJudge0Configured = () => Boolean(env.judge0.apiKey?.trim());

// Mock mode is a dev/test convenience only — it can never activate in production,
// so a `*_MOCK=true` left over from a dev .env can't silently bypass real credential
// checks on a deployed server. Explicitly enabling it in dev/test is not "silent":
// it's a deliberate opt-in, so no API key is required in that case.
const isMockAllowedInThisEnv = () => env.nodeEnv !== 'production';

export const shouldUseGeminiMock = () => {
  if (env.gemini.mock && isMockAllowedInThisEnv()) return true;
  return env.nodeEnv === 'test' && !isGeminiConfigured();
};

export const shouldUseJudge0Mock = () => {
  if (env.judge0.mock && isMockAllowedInThisEnv()) return true;
  return env.nodeEnv === 'test' && !isJudge0Configured();
};

export const isGeminiComingSoon = () => {
  if (isGeminiConfigured()) return false;
  if (shouldUseGeminiMock()) return false;
  if (env.nodeEnv === 'test') return false;
  return true;
};

export const isJudge0ComingSoon = () => {
  if (isJudge0Configured()) return false;
  if (shouldUseJudge0Mock()) return false;
  if (env.nodeEnv === 'test') return false;
  return true;
};

export const warnGeminiNotConfigured = () => {
  if (warned.gemini) return;
  warned.gemini = true;
  logger.warn('Gemini API key not configured.');
};

export const warnJudge0NotConfigured = () => {
  if (warned.judge0) return;
  warned.judge0 = true;
  logger.warn('Judge0 API key not configured.');
};

// `status`/`label` reflect whether a request will actually succeed (real key OR mock
// mode) — this is what the frontend gates its "Coming Soon" placeholder on. `configured`
// stays narrowly "a real key is present" for anything that specifically needs that.
export const getIntegrationStatus = () => ({
  gemini: {
    service: 'Gemini',
    configured: isGeminiConfigured(),
    status: isGeminiComingSoon() ? 'coming_soon' : 'configured',
    label: isGeminiComingSoon() ? 'Coming Soon' : isGeminiConfigured() ? 'Configured' : 'Mock Mode',
  },
  judge0: {
    service: 'Judge0',
    configured: isJudge0Configured(),
    status: isJudge0ComingSoon() ? 'coming_soon' : 'configured',
    label: isJudge0ComingSoon() ? 'Coming Soon' : isJudge0Configured() ? 'Configured' : 'Mock Mode',
  },
});

export const buildComingSoonPayload = (service) => {
  const key = service === 'Gemini' ? 'gemini' : 'judge0';
  if (key === 'gemini') warnGeminiNotConfigured();
  if (key === 'judge0') warnJudge0NotConfigured();

  return {
    success: false,
    comingSoon: true,
    service,
    message: COMING_SOON_MESSAGES[key],
  };
};
