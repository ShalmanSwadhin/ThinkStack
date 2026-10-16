import { jest } from '@jest/globals';
import http from 'node:http';

/**
 * A self-hosted Judge0 (the free, open-source Judge0 CE) must work with just JUDGE0_API_URL.
 * Before, only a RapidAPI key counted as "configured", so a perfectly good self-hosted URL was
 * reported as Coming Soon and code execution never ran. A RapidAPI URL without a key must stay
 * Coming Soon.
 *
 * config/env.js reads process.env once at import, so each scenario sets the environment and
 * imports a fresh module graph (see integrationStatus.test.js for the same pattern).
 */
const KEYS = ['NODE_ENV', 'JUDGE0_MOCK', 'JUDGE0_API_KEY', 'JUDGE0_API_URL', 'JUDGE0_AUTH_TOKEN', 'GEMINI_MOCK', 'GEMINI_API_KEY'];

async function withEnv(overrides, fn) {
  const saved = {};
  for (const key of KEYS) {
    saved[key] = process.env[key];
    delete process.env[key];
  }
  Object.assign(process.env, { NODE_ENV: 'development', JUDGE0_MOCK: 'false', ...overrides });
  jest.resetModules();
  try {
    const status = await import('../../src/utils/integrationStatus.js');
    const { Judge0Service } = await import('../../src/services/Judge0Service.js');
    await fn({ status, judge0: new Judge0Service() });
  } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    jest.resetModules();
  }
}

describe('Judge0 configuration', () => {
  it('treats a self-hosted URL without a key as configured', async () => {
    await withEnv({ JUDGE0_API_URL: 'http://localhost:2358' }, async ({ status, judge0 }) => {
      expect(status.isJudge0SelfHosted()).toBe(true);
      expect(status.isJudge0Configured()).toBe(true);
      expect(status.isJudge0ComingSoon()).toBe(false);
      expect(judge0.isConfigured()).toBe(true);
      expect(status.getIntegrationStatus().judge0.status).toBe('configured');
    });
  });

  it('still reports Coming Soon for the RapidAPI endpoint without a key', async () => {
    await withEnv({ JUDGE0_API_URL: 'https://judge0-ce.p.rapidapi.com' }, async ({ status }) => {
      expect(status.isJudge0SelfHosted()).toBe(false);
      expect(status.isJudge0ComingSoon()).toBe(true);
    });
  });

  it('still reports Coming Soon with no URL and no key, and with an unparseable URL', async () => {
    await withEnv({}, async ({ status }) => expect(status.isJudge0ComingSoon()).toBe(true));
    await withEnv({ JUDGE0_API_URL: 'not a url' }, async ({ status }) => expect(status.isJudge0ComingSoon()).toBe(true));
  });

  it('accepts a RapidAPI key as before', async () => {
    await withEnv({ JUDGE0_API_URL: 'https://judge0-ce.p.rapidapi.com', JUDGE0_API_KEY: 'k' }, async ({ status }) => {
      expect(status.isJudge0Configured()).toBe(true);
      expect(status.isJudge0ComingSoon()).toBe(false);
    });
  });
});

describe('Judge0Service against a self-hosted server', () => {
  let server;
  let baseUrl;
  const seen = [];

  beforeAll(async () => {
    server = http.createServer((req, res) => {
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        seen.push({ method: req.method, url: req.url, headers: req.headers, body });
        res.setHeader('content-type', 'application/json');
        if (req.method === 'POST') {
          res.end(JSON.stringify({ token: 'tok-1' }));
        } else {
          res.end(JSON.stringify({ token: 'tok-1', status: { id: 3, description: 'Accepted' }, stdout: '6\n', stderr: null, time: '0.01', memory: 1024 }));
        }
      });
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  it('submits, polls and judges the output with no API key and sends the auth token when set', async () => {
    seen.length = 0;
    await withEnv({ JUDGE0_API_URL: baseUrl, JUDGE0_AUTH_TOKEN: 'secret-token' }, async ({ judge0 }) => {
      const result = await judge0.execute({ languageId: 71, sourceCode: 'print(6)', stdin: '', expectedOutput: '6' });
      expect(result.verdict).toBe('accepted');
      expect(result.stdout).toBe('6\n');
    });
    const post = seen.find((r) => r.method === 'POST');
    expect(post.url).toContain('/submissions');
    expect(JSON.parse(post.body)).toMatchObject({ language_id: 71, source_code: 'print(6)' });
    expect(post.headers['x-auth-token']).toBe('secret-token');
    expect(post.headers['x-rapidapi-key']).toBeUndefined();
  });

  it('reports a wrong answer when the self-hosted server returns different output', async () => {
    await withEnv({ JUDGE0_API_URL: baseUrl }, async ({ judge0 }) => {
      const result = await judge0.execute({ languageId: 71, sourceCode: 'print(6)', stdin: '', expectedOutput: '7' });
      expect(result.verdict).toBe('wrong_answer');
    });
  });
});
