/**
 * Executes the code samples that ship inside lessons so a sample can never silently
 * drift away from the output printed next to it.
 *
 *   python / javascript / bash  — actually run; stdout is compared with the sample's `out`
 *   json                        — must parse
 *   java / c / cpp              — COMPILED AND RUN when a compiler is found (see findCompiler);
 *                                 otherwise only checked for balanced brackets and reported as
 *                                 `executed: false` so a syntax check is never mistaken for a run
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

/**
 * Compiler discovery for the compiled languages. Nothing is installed or assumed:
 *   LESSON_CC / LESSON_CXX       full command for the C / C++ compiler (may contain arguments,
 *                                e.g. "python -m ziglang cc"); else gcc/clang/cc, g++/clang++/c++
 *   LESSON_JAVAC / LESSON_JAVA   javac / java commands; else PATH, else $JAVA_HOME/bin
 * Returns null when the language cannot be compiled here.
 */
const compilerCache = new Map();
// A value that is an existing file (a path with spaces, e.g. under "Program Files") is one command;
// anything else is split on whitespace so arguments can follow ("python -m ziglang cc").
const splitCommand = (text) => {
  const value = String(text).trim();
  return fs.existsSync(value) ? [value] : value.split(/\s+/).filter(Boolean);
};
const works = (command, args = ['--version']) => {
  const [exe, ...rest] = command;
  const probe = spawnSync(exe, [...rest, ...args], { encoding: 'utf8', timeout: 60000 });
  return !probe.error && (probe.status === 0 || (probe.stdout ?? '').length > 0 || (probe.stderr ?? '').length > 0);
};

export function findCompiler(lang) {
  if (compilerCache.has(lang)) return compilerCache.get(lang);
  let found = null;
  if (lang === 'c' || lang === 'cpp') {
    const override = process.env[lang === 'c' ? 'LESSON_CC' : 'LESSON_CXX'];
    const candidates = override ? [splitCommand(override)] : (lang === 'c' ? ['gcc', 'clang', 'cc'] : ['g++', 'clang++', 'c++']).map((name) => [name]);
    found = candidates.find((command) => works(command)) ?? null;
  } else if (lang === 'java') {
    const javaHome = process.env.JAVA_HOME ? path.join(process.env.JAVA_HOME, 'bin') : null;
    const pick = (envName, tool) => {
      const candidates = [process.env[envName] ? splitCommand(process.env[envName]) : null, [tool], javaHome ? [path.join(javaHome, tool)] : null].filter(Boolean);
      return candidates.find((command) => works(command, ['-version'])) ?? null;
    };
    const javac = pick('LESSON_JAVAC', 'javac');
    const java = pick('LESSON_JAVA', 'java');
    found = javac && java ? { javac, java } : null;
  }
  compilerCache.set(lang, found);
  return found;
}

/** Forget remembered compiler lookups (tests that change the LESSON_* environment variables). */
export const resetCompilerCache = () => compilerCache.clear();

/** Whether samples of this language would really be executed in this environment. */
export const canExecute = (lang) => ['python', 'javascript', 'bash'].includes(lang) ? true : Boolean(findCompiler(lang));

function compileAndRun(sample) {
  const { lang, src, out } = sample;
  const tool = findCompiler(lang);
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lesson-compiled-'));
  try {
    let compile;
    let run;
    if (lang === 'java') {
      const className = /public\s+(?:final\s+)?class\s+(\w+)/.exec(src)?.[1] ?? /\bclass\s+(\w+)/.exec(src)?.[1] ?? 'Main';
      fs.writeFileSync(path.join(root, `${className}.java`), src);
      const [javac, ...javacArgs] = tool.javac;
      compile = spawnSync(javac, [...javacArgs, '-d', root, path.join(root, `${className}.java`)], { encoding: 'utf8', timeout: 120000 });
      if (compile.status === 0) {
        const [java, ...javaArgs] = tool.java;
        run = spawnSync(java, [...javaArgs, '-cp', root, className], { encoding: 'utf8', timeout: 30000 });
      }
    } else {
      const file = path.join(root, lang === 'c' ? 'main.c' : 'main.cpp');
      const exe = path.join(root, process.platform === 'win32' ? 'sample.exe' : 'sample');
      fs.writeFileSync(file, src);
      const [cc, ...ccArgs] = tool;
      compile = spawnSync(cc, [...ccArgs, '-o', exe, file, ...(lang === 'c' ? ['-lm'] : [])], { encoding: 'utf8', timeout: 240000 });
      if (compile.status === 0) run = spawnSync(exe, [], { encoding: 'utf8', timeout: 30000 });
    }
    if (compile.error || compile.status !== 0) {
      return { status: 'failed', executed: false, detail: `compile error: ${normalise(compile.stderr || String(compile.error)).split('\n').slice(0, 4).join(' | ')}` };
    }
    if (run.error || run.status !== 0) {
      return { status: 'failed', executed: true, detail: `exit ${run.status}: ${normalise(run.stderr).split('\n').slice(-3).join(' | ')}` };
    }
    if (out !== undefined && normalise(run.stdout) !== normalise(out)) {
      return { status: 'failed', executed: true, detail: `output mismatch\n--- expected\n${normalise(out)}\n--- actual\n${normalise(run.stdout)}` };
    }
    return { status: 'passed', executed: true, detail: out === undefined ? 'compiled and ran without error' : 'compiled, ran, output matches' };
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

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
    if (problem) return { status: 'failed', executed: false, detail: problem };
    if (findCompiler(lang)) return compileAndRun(sample);
    return { status: 'passed', executed: false, detail: 'brackets balanced (no compiler available: syntax check only, NOT compiled or run)' };
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

export default { runSample, pythonCommand, nodeAvailable, bashAvailable, findCompiler, canExecute, resetCompilerCache };
