#!/usr/bin/env node
/**
 * Production smoke test — verifies deployed API (and optionally frontend).
 *
 * Usage:
 *   API_URL=https://your-api.onrender.com/api/v1 npm run smoke
 *   API_URL=... FRONTEND_URL=https://your-app.vercel.app npm run smoke
 */

const API_URL = process.env.API_URL || 'http://localhost:5000/api/v1';
const FRONTEND_URL = process.env.FRONTEND_URL || '';

const results = [];
let failed = 0;

function pass(label) {
  results.push({ label, ok: true });
  console.log(`  ✓ ${label}`);
}

function fail(label, detail) {
  results.push({ label, ok: false, detail });
  console.error(`  ✗ ${label}: ${detail}`);
  failed += 1;
}

async function request(method, path, { body, token, cookies } = {}) {
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (cookies) headers.Cookie = cookies;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const setCookie = res.headers.get('set-cookie');
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }

  return { status: res.status, json, setCookie, text };
}

function extractRefreshCookie(setCookie) {
  if (!setCookie) return '';
  const match = setCookie.match(/refreshToken=([^;]+)/);
  return match ? `refreshToken=${match[1]}` : '';
}

async function checkHealth() {
  const { status, json } = await request('GET', '/health');
  if (status === 200 && json?.success && json?.data?.status === 'ok') {
    pass('GET /health');
  } else {
    fail('GET /health', `status=${status}`);
  }
}

async function checkAuthFlow() {
  const email = `smoke-${Date.now()}@thinkstack.dev`;
  const password = 'SmokeTest123!';

  const register = await request('POST', '/auth/register', {
    body: { email, username: `smoke${Date.now()}`, password, displayName: 'Smoke Test' },
  });

  if (register.status !== 201 || !register.json?.success) {
    fail('POST /auth/register', register.json?.error?.message || `status=${register.status}`);
    return;
  }
  pass('POST /auth/register');

  const accessToken = register.json.data?.accessToken;
  const refreshCookie = extractRefreshCookie(register.setCookie);

  if (!accessToken) {
    fail('access token issued', 'missing from register response');
    return;
  }
  pass('access token issued');

  const me = await request('GET', '/auth/me', { token: accessToken });
  if (me.status === 200 && me.json?.data?.email === email) {
    pass('GET /auth/me');
  } else {
    fail('GET /auth/me', `status=${me.status}`);
  }

  const refresh = await request('POST', '/auth/refresh', { cookies: refreshCookie });
  if (refresh.status === 200 && refresh.json?.data?.accessToken) {
    pass('POST /auth/refresh');
  } else {
    fail('POST /auth/refresh', refresh.json?.error?.message || `status=${refresh.status}`);
  }

  const topics = await request('GET', '/topics', { token: accessToken });
  if (topics.status === 200 && topics.json?.data?.categories) {
    pass('GET /topics (authenticated)');
  } else {
    fail('GET /topics', `status=${topics.status}`);
  }
}

async function checkFrontend() {
  if (!FRONTEND_URL) {
    console.log('  — FRONTEND_URL not set; skipping frontend check');
    return;
  }

  try {
    const res = await fetch(FRONTEND_URL, { redirect: 'follow' });
    const html = await res.text();
    if (res.status === 200 && (html.includes('ThinkStack') || html.includes('root'))) {
      pass(`Frontend reachable (${FRONTEND_URL})`);
    } else {
      fail('Frontend reachable', `status=${res.status}`);
    }
  } catch (err) {
    fail('Frontend reachable', err.message);
  }
}

async function main() {
  console.log(`\nThinkStack smoke test`);
  console.log(`API: ${API_URL}`);
  if (FRONTEND_URL) console.log(`Frontend: ${FRONTEND_URL}`);
  console.log('');

  await checkHealth();
  await checkAuthFlow();
  await checkFrontend();

  console.log('');
  const total = results.length;
  const passed = total - failed;
  console.log(`Result: ${passed}/${total} passed`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Smoke test crashed:', err);
  process.exit(1);
});
