import { VERDICT } from 'shared/constants';
import env from '../config/env.js';
import AppError from '../utils/AppError.js';
import { resolveVerdict } from '../utils/codeExecution.js';
import logger from '../utils/logger.js';
import ComingSoonError from '../utils/ComingSoonError.js';
import {
  COMING_SOON_MESSAGES,
  isJudge0ComingSoon,
  shouldUseJudge0Mock,
  warnJudge0NotConfigured,
} from '../utils/integrationStatus.js';

const JUDGE0_STATUS_TO_VERDICT = {
  1: VERDICT.PENDING,
  2: VERDICT.PENDING,
  3: VERDICT.ACCEPTED,
  4: VERDICT.WRONG_ANSWER,
  5: VERDICT.TLE,
  6: VERDICT.COMPILE_ERROR,
  7: VERDICT.RUNTIME_ERROR,
  8: VERDICT.RUNTIME_ERROR,
  9: VERDICT.RUNTIME_ERROR,
  10: VERDICT.RUNTIME_ERROR,
  11: VERDICT.RUNTIME_ERROR,
  12: VERDICT.RUNTIME_ERROR,
  13: VERDICT.RUNTIME_ERROR,
  14: VERDICT.RUNTIME_ERROR,
};

const DEFAULT_CPU_TIME_LIMIT = 10;
const DEFAULT_MEMORY_LIMIT = 128000;
const POLL_INTERVAL_MS = 500;
const MAX_POLL_ATTEMPTS = 40;

const useMockMode = () => shouldUseJudge0Mock();

const getBaseUrl = () => {
  if (env.judge0.apiUrl) {
    return env.judge0.apiUrl.replace(/\/$/, '');
  }
  return 'https://judge0-ce.p.rapidapi.com';
};

const buildHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  if (env.judge0.apiKey) {
    headers['X-RapidAPI-Key'] = env.judge0.apiKey;
    headers['X-RapidAPI-Host'] = env.judge0.apiHost;
  }
  return headers;
};

const mapJudge0Result = (result) => {
  const statusId = result.status?.id ?? result.status_id;
  const verdict = JUDGE0_STATUS_TO_VERDICT[statusId] ?? VERDICT.RUNTIME_ERROR;

  return {
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? result.compile_output ?? '',
    verdict,
    executionTime: result.time != null ? parseFloat(result.time) : null,
    memoryUsed: result.memory != null ? parseInt(result.memory, 10) : null,
    judge0Token: result.token ?? null,
    statusDescription: result.status?.description ?? null,
  };
};

const mockExecute = async ({ sourceCode, stdin = '', expectedOutput = null }) => {
  if (sourceCode.includes('__COMPILE_ERROR__')) {
    return {
      stdout: '',
      stderr: 'Mock compile error: invalid syntax',
      verdict: VERDICT.COMPILE_ERROR,
      executionTime: null,
      memoryUsed: null,
      judge0Token: 'mock-compile-error',
      statusDescription: 'Compilation Error',
    };
  }

  if (sourceCode.includes('__RUNTIME_ERROR__')) {
    return {
      stdout: '',
      stderr: 'Mock runtime error: division by zero',
      verdict: VERDICT.RUNTIME_ERROR,
      executionTime: 0.01,
      memoryUsed: 1024,
      judge0Token: 'mock-runtime-error',
      statusDescription: 'Runtime Error',
    };
  }

  if (expectedOutput != null) {
    if (sourceCode.includes('__WRONG__')) {
      return {
        stdout: '999',
        stderr: '',
        verdict: VERDICT.WRONG_ANSWER,
        executionTime: 0.02,
        memoryUsed: 2048,
        judge0Token: 'mock-wrong-answer',
        statusDescription: 'Wrong Answer',
      };
    }

    return {
      stdout: expectedOutput,
      stderr: '',
      verdict: VERDICT.ACCEPTED,
      executionTime: 0.02,
      memoryUsed: 2048,
      judge0Token: 'mock-success',
      statusDescription: 'Accepted',
    };
  }

  const trimmedStdin = stdin.trim();
  const stdout = trimmedStdin ? `Echo: ${trimmedStdin}\n` : 'Hello, ThinkStack!\n';

  return {
    stdout,
    stderr: '',
    verdict: VERDICT.ACCEPTED,
    executionTime: 0.02,
    memoryUsed: 2048,
    judge0Token: 'mock-success',
    statusDescription: 'Accepted',
  };
};

const pollSubmission = async (token) => {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/submissions/${token}?base64_encoded=false&fields=stdout,stderr,compile_output,status,time,memory,token`;

  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
    const response = await fetch(url, { headers: buildHeaders() });

    if (!response.ok) {
      const body = await response.text();
      logger.error('Judge0 poll failed', { status: response.status, body });
      throw new AppError('Code execution service unavailable', 503);
    }

    const result = await response.json();
    const statusId = result.status?.id ?? result.status_id;

    if (statusId > 2) {
      return mapJudge0Result(result);
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new AppError('Code execution timed out', 504);
};

export class Judge0Service {
  isConfigured() {
    return Boolean(env.judge0.apiKey?.trim());
  }

  isComingSoon() {
    return isJudge0ComingSoon();
  }

  isMockMode() {
    return useMockMode();
  }

  async execute({ languageId, sourceCode, stdin = '', expectedOutput = null }) {
    if (isJudge0ComingSoon()) {
      warnJudge0NotConfigured();
      throw new ComingSoonError('Judge0', COMING_SOON_MESSAGES.judge0);
    }

    if (useMockMode()) {
      logger.info('Judge0 mock mode: returning simulated execution result');
      const result = await mockExecute({ sourceCode, stdin, expectedOutput });
      return {
        ...result,
        verdict: resolveVerdict(result, expectedOutput),
      };
    }

    if (!env.judge0.apiKey && !env.judge0.apiUrl) {
      warnJudge0NotConfigured();
      throw new ComingSoonError('Judge0', COMING_SOON_MESSAGES.judge0);
    }

    const baseUrl = getBaseUrl();
    const submitUrl = `${baseUrl}/submissions?base64_encoded=false&wait=false`;

    const payload = {
      language_id: languageId,
      source_code: sourceCode,
      stdin: stdin ?? '',
      cpu_time_limit: DEFAULT_CPU_TIME_LIMIT,
      memory_limit: DEFAULT_MEMORY_LIMIT,
    };

    const response = await fetch(submitUrl, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text();
      logger.error('Judge0 submit failed', { status: response.status, body });
      throw new AppError('Code execution service unavailable', 503);
    }

    const submission = await response.json();
    if (!submission.token) {
      throw new AppError('Invalid response from code execution service', 502);
    }

    const result = await pollSubmission(submission.token);
    return {
      ...result,
      verdict: resolveVerdict(result, expectedOutput),
    };
  }
}

export default new Judge0Service();
