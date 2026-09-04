import { jest } from '@jest/globals';

/**
 * Regression tests for BUG-01 (see documentation/PROJECT_HANDOVER_AUDIT.md and
 * NEXT_PHASE_QA_REPORT.md): `JUDGE0_MOCK=true` / `GEMINI_MOCK=true` must be sufficient
 * on their own to activate mock mode in dev/test — no dummy API key should be required.
 * Mock mode must never activate in production, regardless of the mock flag, so a stray
 * `*_MOCK=true` left over from a dev `.env` can never bypass real credential checks on
 * a deployed server.
 *
 * `src/config/env.js` reads `process.env` once at import time, so each scenario below
 * mutates `process.env`, forces a fresh module graph with `jest.resetModules()`, and
 * dynamically imports the modules under test — then always restores `process.env` in
 * `finally`, since `maxWorkers: 1` means every test file in this suite shares the same
 * OS process and a leaked mutation would corrupt unrelated tests.
 */

const ENV_KEYS = ['NODE_ENV', 'JUDGE0_MOCK', 'JUDGE0_API_KEY', 'GEMINI_MOCK', 'GEMINI_API_KEY'];
const PROD_REQUIRED_DEFAULTS = {
  MONGODB_URI: 'mongodb://localhost:27017/thinkstack_integration_status_test',
  JWT_ACCESS_SECRET: 'test-access-secret',
  JWT_REFRESH_SECRET: 'test-refresh-secret',
};

/**
 * Runs `fn` with `process.env` set exactly to `overrides` (plus the production-required
 * vars auto-filled when `NODE_ENV: 'production'` is requested, so `config/env.js` doesn't
 * throw at import time), against a freshly-imported module graph. Restores the previous
 * `process.env` afterward no matter how `fn` exits.
 */
async function withEnv(overrides, fn) {
  const saved = {};
  for (const key of [...ENV_KEYS, ...Object.keys(PROD_REQUIRED_DEFAULTS)]) {
    saved[key] = process.env[key];
    delete process.env[key];
  }

  const effective =
    overrides.NODE_ENV === 'production' ? { ...PROD_REQUIRED_DEFAULTS, ...overrides } : overrides;
  Object.assign(process.env, effective);

  jest.resetModules();
  try {
    const integrationStatus = await import('../../src/utils/integrationStatus.js');
    const { Judge0Service } = await import('../../src/services/Judge0Service.js');
    const { GeminiService } = await import('../../src/services/GeminiService.js');
    await fn({ integrationStatus, judge0: new Judge0Service(), gemini: new GeminiService() });
  } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    jest.resetModules();
  }
}

describe('BUG-01 regression: mock-mode gating (integrationStatus.js)', () => {
  // Test A — JUDGE0_MOCK=true + no JUDGE0_API_KEY selects the mock path and does not fail.
  it('Test A: Judge0 mock enabled with no API key uses mock, not Coming Soon', async () => {
    await withEnv(
      { NODE_ENV: 'development', JUDGE0_MOCK: 'true', JUDGE0_API_KEY: '', GEMINI_MOCK: 'false', GEMINI_API_KEY: '' },
      async ({ integrationStatus, judge0 }) => {
        expect(integrationStatus.isJudge0Configured()).toBe(false);
        expect(integrationStatus.shouldUseJudge0Mock()).toBe(true);
        expect(integrationStatus.isJudge0ComingSoon()).toBe(false);

        // Service-level: execute() must resolve with a simulated result, not throw ComingSoonError.
        const result = await judge0.execute({ languageId: 71, sourceCode: 'print(1)', stdin: '' });
        expect(result.verdict).toBeDefined();
        expect(judge0.isMockMode()).toBe(true);
        expect(judge0.isComingSoon()).toBe(false);
      }
    );
  });

  // Test B — GEMINI_MOCK=true + no GEMINI_API_KEY selects the mock path and does not fail.
  it('Test B: Gemini mock enabled with no API key uses mock, not Coming Soon', async () => {
    await withEnv(
      { NODE_ENV: 'development', GEMINI_MOCK: 'true', GEMINI_API_KEY: '', JUDGE0_MOCK: 'false', JUDGE0_API_KEY: '' },
      async ({ integrationStatus, gemini }) => {
        expect(integrationStatus.isGeminiConfigured()).toBe(false);
        expect(integrationStatus.shouldUseGeminiMock()).toBe(true);
        expect(integrationStatus.isGeminiComingSoon()).toBe(false);

        const reply = await gemini.generateChatResponse({
          systemInstruction: 'You are a tutor.',
          messages: [{ role: 'user', content: 'What is a binary tree?' }],
        });
        expect(typeof reply).toBe('string');
        expect(reply.length).toBeGreaterThan(0);
        expect(gemini.isMockMode()).toBe(true);
        expect(gemini.isComingSoon()).toBe(false);
      }
    );
  });

  // Test C — mock disabled + missing key: real integration is not falsely considered
  // configured, and the existing safe "Coming Soon" behavior is preserved.
  it('Test C: mock disabled with no API key stays Coming Soon (safe default preserved)', async () => {
    await withEnv(
      { NODE_ENV: 'development', JUDGE0_MOCK: 'false', JUDGE0_API_KEY: '', GEMINI_MOCK: 'false', GEMINI_API_KEY: '' },
      async ({ integrationStatus, judge0, gemini }) => {
        expect(integrationStatus.isJudge0Configured()).toBe(false);
        expect(integrationStatus.shouldUseJudge0Mock()).toBe(false);
        expect(integrationStatus.isJudge0ComingSoon()).toBe(true);

        expect(integrationStatus.isGeminiConfigured()).toBe(false);
        expect(integrationStatus.shouldUseGeminiMock()).toBe(false);
        expect(integrationStatus.isGeminiComingSoon()).toBe(true);

        await expect(
          judge0.execute({ languageId: 71, sourceCode: 'print(1)', stdin: '' })
        ).rejects.toMatchObject({ name: 'ComingSoonError' });
        await expect(
          gemini.generateChatResponse({ systemInstruction: '', messages: [] })
        ).rejects.toMatchObject({ name: 'ComingSoonError' });
      }
    );
  });

  // Test D — mock enabled + a dummy (non-empty but fake) API key still mocks, i.e. the
  // fix doesn't regress the previously-working "dummy key" workaround.
  it('Test D: mock enabled with a dummy API key still uses mock', async () => {
    await withEnv(
      {
        NODE_ENV: 'development',
        JUDGE0_MOCK: 'true',
        JUDGE0_API_KEY: 'dummy-not-a-real-key',
        GEMINI_MOCK: 'true',
        GEMINI_API_KEY: 'dummy-not-a-real-key',
      },
      async ({ integrationStatus }) => {
        expect(integrationStatus.shouldUseJudge0Mock()).toBe(true);
        expect(integrationStatus.isJudge0ComingSoon()).toBe(false);
        expect(integrationStatus.shouldUseGeminiMock()).toBe(true);
        expect(integrationStatus.isGeminiComingSoon()).toBe(false);
      }
    );
  });

  // Test E — the two integrations are gated independently: enabling one mock does not
  // affect the other, in either direction.
  it('Test E: Judge0 and Gemini mock flags are independent', async () => {
    await withEnv(
      { NODE_ENV: 'development', JUDGE0_MOCK: 'true', JUDGE0_API_KEY: '', GEMINI_MOCK: 'false', GEMINI_API_KEY: '' },
      async ({ integrationStatus }) => {
        expect(integrationStatus.shouldUseJudge0Mock()).toBe(true);
        expect(integrationStatus.isJudge0ComingSoon()).toBe(false);
        expect(integrationStatus.shouldUseGeminiMock()).toBe(false);
        expect(integrationStatus.isGeminiComingSoon()).toBe(true);
      }
    );

    await withEnv(
      { NODE_ENV: 'development', JUDGE0_MOCK: 'false', JUDGE0_API_KEY: '', GEMINI_MOCK: 'true', GEMINI_API_KEY: '' },
      async ({ integrationStatus }) => {
        expect(integrationStatus.shouldUseGeminiMock()).toBe(true);
        expect(integrationStatus.isGeminiComingSoon()).toBe(false);
        expect(integrationStatus.shouldUseJudge0Mock()).toBe(false);
        expect(integrationStatus.isJudge0ComingSoon()).toBe(true);
      }
    );
  });

  // Production safety net — a mock flag must never activate mock mode in production,
  // even with no real key configured. This must stay a hard Coming Soon, not a silent
  // mock fallback, and not a crash.
  it('Production safety: mock flags are ignored in production without real credentials', async () => {
    await withEnv(
      { NODE_ENV: 'production', JUDGE0_MOCK: 'true', JUDGE0_API_KEY: '', GEMINI_MOCK: 'true', GEMINI_API_KEY: '' },
      async ({ integrationStatus, judge0, gemini }) => {
        expect(integrationStatus.shouldUseJudge0Mock()).toBe(false);
        expect(integrationStatus.isJudge0ComingSoon()).toBe(true);
        expect(integrationStatus.shouldUseGeminiMock()).toBe(false);
        expect(integrationStatus.isGeminiComingSoon()).toBe(true);

        await expect(
          judge0.execute({ languageId: 71, sourceCode: 'print(1)', stdin: '' })
        ).rejects.toMatchObject({ name: 'ComingSoonError' });
        await expect(
          gemini.generateChatResponse({ systemInstruction: '', messages: [] })
        ).rejects.toMatchObject({ name: 'ComingSoonError' });
      }
    );
  });

  // Production safety net — a real key in production is honored normally (mock is
  // irrelevant once a real key is present; isConfigured/comingSoon must reflect that).
  it('Production with a real API key is never treated as Coming Soon', async () => {
    await withEnv(
      { NODE_ENV: 'production', JUDGE0_MOCK: 'false', JUDGE0_API_KEY: 'real-looking-key', GEMINI_MOCK: 'false', GEMINI_API_KEY: 'real-looking-key' },
      async ({ integrationStatus }) => {
        expect(integrationStatus.isJudge0Configured()).toBe(true);
        expect(integrationStatus.isJudge0ComingSoon()).toBe(false);
        expect(integrationStatus.isGeminiConfigured()).toBe(true);
        expect(integrationStatus.isGeminiComingSoon()).toBe(false);
      }
    );
  });

  // getIntegrationStatus() is what the frontend's ComingSoonPlaceholder gating reads
  // (frontend/src/features/integrations/useIntegrationStatus.js: `status === 'coming_soon'`).
  // Before the fix this stayed 'coming_soon' even in mock mode, so the frontend never
  // attempted the request that would have worked. Assert the field the frontend actually reads.
  it('getIntegrationStatus() reports mock-enabled integrations as non-"coming_soon"', async () => {
    await withEnv(
      { NODE_ENV: 'development', JUDGE0_MOCK: 'true', JUDGE0_API_KEY: '', GEMINI_MOCK: 'false', GEMINI_API_KEY: '' },
      async ({ integrationStatus }) => {
        const status = integrationStatus.getIntegrationStatus();
        expect(status.judge0.status).not.toBe('coming_soon');
        expect(status.gemini.status).toBe('coming_soon');
      }
    );
  });
});
