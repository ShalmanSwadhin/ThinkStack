/**
 * Executes the code samples that ship inside lessons so a sample can never silently
 * drift away from the output printed next to it.
 *
 *   python / javascript / bash  — actually run; stdout is compared with the sample's `out`
 *   json                        — must parse
 *   java / c / cpp              — no compiler is assumed; checked for balanced brackets
 *   text                        — pseudocode / plain listings; not executed
 *
 * Bash samples (Git workflows) run in a fresh temporary directory with an isolated HOME
 * that carries a minimal git identity, so they never touch the developer's real config.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const normalise = (text) => String(text ?? '').replace(/\r\n/g, '\n').replace(/[ \t]+$/gm, '').trim();

const toolCache = new Map();
function hasTool(name, versionArgs = ['--version']) {
  if (!toolCache.has(name)) {
    const result = spawnSync(name, versionArgs, { encoding: 'utf8' });
    toolCache.set(name, result.status === 0 || (result.stdout ?? '').length > 0);
  }
  return toolCache.get(name);
}

export const pythonCommand = () => ['python3', 'python'].find((name) => hasTool(name)) ?? null;
export const nodeAvailable = () => hasTool(process.execPath);
export const bashAvailable = () => hasTool('bash') && hasTool('git');

function sandbox() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lesson-code-'));
  const home = path.join(root, 'home');
  const work = path.join(root, 'work');
  fs.mkdirSync(home);
  fs.mkdirSync(work);
  fs.writeFileSync(
    path.join(home, '.gitconfig'),
    '[user]\n\tname = Lesson Author\n\temail = author@example.com\n[init]\n\tdefaultBranch = main\n[advice]\n\tdetachedHead = false\n'
  );
  return { root, home, work };
}

function checkBalanced(source) {
  const pairs = { ')': '(', ']': '[', '}': '{' };
  const stack = [];
  let quote = null;
  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    const next = source[i + 1];
    if (quote) {
      if (ch === '\\') i += 1;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '/' && next === '/') {
      while (i < source.length && source[i] !== '\n') i += 1;
      continue;
    }
    if (ch === '/' && next === '*') {
      i = source.indexOf('*/', i + 2);
      if (i === -1) return 'unterminated block comment';
      i += 1;
      continue;
    }
    if (ch === '"' || ch === "'") quote = ch;
    else if ('([{'.includes(ch)) stack.push(ch);
    else if (pairs[ch]) {
      if (stack.pop() !== pairs[ch]) return `unbalanced "${ch}"`;
    }
  }
  return stack.length ? `unclosed "${stack.at(-1)}"` : null;
}

/** Returns { status: 'passed' | 'skipped' | 'failed', detail } for one sample. */
export function runSample(sample) {
  const { lang, src, out } = sample;

  if (lang === 'json') {
    try {
      JSON.parse(src);
      return { status: 'passed', detail: 'valid JSON' };
    } catch (error) {
      return { status: 'failed', detail: `invalid JSON: ${error.message}` };
    }
  }

  if (lang === 'java' || lang === 'c' || lang === 'cpp') {
    const problem = checkBalanced(src);
    return problem ? { status: 'failed', detail: problem } : { status: 'passed', detail: 'brackets balanced (not compiled)' };
  }

  if (lang === 'text') return { status: 'passed', detail: 'not executed' };

  let result;
  if (lang === 'python') {
    const python = pythonCommand();
    if (!python) return { status: 'skipped', detail: 'python not installed' };
    result = spawnSync(python, ['-X', 'utf8', '-'], { input: src, encoding: 'utf8', timeout: 20000, env: { ...process.env, PYTHONIOENCODING: 'utf-8' } });
  } else if (lang === 'javascript') {
    result = spawnSync(process.execPath, ['-'], { input: src, encoding: 'utf8', timeout: 20000 });
  } else if (lang === 'bash') {
    if (!bashAvailable()) return { status: 'skipped', detail: 'bash/git not installed' };
    const { root, home, work } = sandbox();
    try {
      result = spawnSync('bash', ['-c', `set -e\n${src}`], {
        cwd: work,
        encoding: 'utf8',
        timeout: 30000,
        env: { ...process.env, HOME: home, USERPROFILE: home, XDG_CONFIG_HOME: path.join(home, '.config'), GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: path.join(home, '.gitconfig'), GIT_TERMINAL_PROMPT: '0' },
      });
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  } else {
    return { status: 'failed', detail: `no runner for language "${lang}"` };
  }

  if (result.error) return { status: 'failed', detail: `could not run: ${result.error.message}` };
  if (result.status !== 0) {
    return { status: 'failed', detail: `exit ${result.status}: ${normalise(result.stderr).split('\n').slice(-4).join(' | ')}` };
  }
  if (out !== undefined && normalise(result.stdout) !== normalise(out)) {
    return { status: 'failed', detail: `output mismatch\n--- expected\n${normalise(out)}\n--- actual\n${normalise(result.stdout)}` };
  }
  return { status: 'passed', detail: out === undefined ? 'ran without error' : 'output matches' };
}

export default { runSample, pythonCommand, nodeAvailable, bashAvailable };
