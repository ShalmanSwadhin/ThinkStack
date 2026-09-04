#!/usr/bin/env node
/**
 * Free a TCP port (cross-platform).
 *
 * Usage:
 *   node scripts/free-port.mjs 5000
 */

import { execSync } from 'node:child_process';

function getWindowsPids(targetPort) {
  try {
    const output = execSync('netstat -ano -p tcp', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const pids = new Set();
    const portSuffix = `:${targetPort}`;

    for (const line of output.split(/\r?\n/)) {
      if (!line.includes('LISTENING')) continue;

      const localAddress = line.trim().split(/\s+/)[1] || '';
      if (!localAddress.endsWith(portSuffix)) continue;

      const pid = line.trim().split(/\s+/).at(-1);
      if (pid && /^\d+$/.test(pid) && pid !== '0') {
        pids.add(Number(pid));
      }
    }

    return [...pids];
  } catch {
    return [];
  }
}

function getUnixPids(targetPort) {
  try {
    const output = execSync(`lsof -ti tcp:${targetPort} -sTCP:LISTEN`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return output
      .split(/\r?\n/)
      .map((value) => value.trim())
      .filter((value) => /^\d+$/.test(value))
      .map(Number);
  } catch {
    return [];
  }
}

function killPid(pid) {
  if (process.platform === 'win32') {
    execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
    return;
  }

  process.kill(pid, 'SIGTERM');
}

/**
 * Stop processes listening on a port.
 * @param {number} targetPort
 * @param {{ excludePid?: number, logger?: { info?: Function, warn?: Function } }} options
 * @returns {number[]} PIDs that were stopped
 */
export function freePort(targetPort, options = {}) {
  const { excludePid, logger } = options;
  const pids = (process.platform === 'win32' ? getWindowsPids(targetPort) : getUnixPids(targetPort)).filter(
    (pid) => pid !== excludePid
  );

  if (pids.length === 0) {
    return [];
  }

  const stopped = [];

  for (const pid of pids) {
    try {
      killPid(pid);
      stopped.push(pid);
      logger?.info?.(`Freed port ${targetPort} (stopped PID ${pid}).`);
    } catch {
      logger?.warn?.(`Could not stop PID ${pid} on port ${targetPort}.`);
    }
  }

  return stopped;
}

function getListeningPids(targetPort) {
  return process.platform === 'win32' ? getWindowsPids(targetPort) : getUnixPids(targetPort);
}

const isDirectRun = process.argv[1]?.includes('free-port');

if (isDirectRun) {
  const args = process.argv.slice(2).filter((arg) => arg !== '--check');
  const checkOnly = process.argv.includes('--check');
  const port = Number.parseInt(args[0] || '5000', 10);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error('Usage: node scripts/free-port.mjs <port> [--check]');
    process.exit(1);
  }

  const listeners = getListeningPids(port).filter((pid) => pid !== process.pid);

  if (checkOnly) {
    if (listeners.length === 0) {
      console.log(`Port ${port} is available.`);
      process.exit(0);
    }

    console.error(
      `Port ${port} is already in use (PID ${listeners.join(', ')}). Stop other dev servers or run "npm run free-port" from the project root.`
    );
    process.exit(1);
  }

  const stopped = freePort(port, {
    logger: {
      info: (message) => console.log(message),
      warn: (message) => console.warn(message),
    },
  });

  if (stopped.length === 0) {
    console.log(`Port ${port} is already free.`);
  }
}
