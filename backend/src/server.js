import net from 'node:net';
import mongoose from 'mongoose';
import app from './app.js';
import connectDB from './config/db.js';
import env from './config/env.js';
import logger from './utils/logger.js';
import bootstrapDatabase from './seed/bootstrap.js';

let httpServer = null;
let shuttingDown = false;

const isNodemonChild = process.env.THINKSTACK_NODEMON === '1';

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function shutdownHttpServer(signal) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  logger.info(`${signal} received — shutting down`);

  if (httpServer) {
    await new Promise((resolve) => {
      try {
        if (typeof httpServer.closeAllConnections === 'function') {
          httpServer.closeAllConnections();
        }
        httpServer.close(() => resolve());
      } catch {
        resolve();
      }
    });
    httpServer = null;
  }

  if (mongoose.connection.readyState !== 0) {
    try {
      await mongoose.disconnect();
    } catch {
      // Ignore disconnect errors during shutdown
    }
  }

  process.exit(0);
}

function registerShutdownHandlers() {
  process.once('SIGINT', () => {
    void shutdownHttpServer('SIGINT');
  });
  process.once('SIGTERM', () => {
    void shutdownHttpServer('SIGTERM');
  });
}

registerShutdownHandlers();

function canBindPort(port) {
  return new Promise((resolve) => {
    const tester = net.createServer();
    tester.once('error', () => resolve(false));
    tester.once('listening', () => tester.close(() => resolve(true)));
    tester.listen(port);
  });
}

async function waitForPortReady(port) {
  if (env.nodeEnv !== 'development' || !isNodemonChild) {
    return;
  }

  // Allow the previous nodemon child time to release the port gracefully.
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (await canBindPort(port)) {
      return;
    }

    await sleep(100);
  }

  const stopped = await releaseDevPort(port);
  if (stopped.length > 0) {
    logger.info(`Released stale listener on port ${port} after dev reload`);
  }

  for (let attempt = 0; attempt < 30; attempt += 1) {
    if (await canBindPort(port)) {
      return;
    }

    await sleep(100);
  }

  throw new Error(`Port ${port} did not become available after a dev reload`);
}

async function releaseDevPort(port) {
  if (env.nodeEnv !== 'development' || !isNodemonChild) {
    return [];
  }

  const { freePort } = await import('../../scripts/free-port.mjs');
  return freePort(port, { excludePid: process.pid, logger });
}

function listen(appInstance, port) {
  return new Promise((resolve, reject) => {
    const server = appInstance.listen(port, () => resolve(server));
    server.on('error', reject);
  });
}

const startServer = async () => {
  await connectDB();

  if (mongoose.connection.readyState === 1 && env.bootstrap.onStart) {
    try {
      await bootstrapDatabase();
    } catch (error) {
      logger.warn(`Database bootstrap skipped: ${error.message}`);
    }
  } else if (mongoose.connection.readyState === 1) {
    logger.info('Database bootstrap disabled (BOOTSTRAP_ON_START=false)');
  }

  await waitForPortReady(env.port);

  try {
    httpServer = await listen(app, env.port);
  } catch (error) {
    if (error.code === 'EADDRINUSE') {
      logger.error(
        `Port ${env.port} is already in use. Run "npm run free-port" from the project root, then restart.`
      );
    } else {
      logger.error(`Server error: ${error.message}`);
    }
    process.exit(1);
  }

  logger.info(`ThinkStack API running on port ${env.port} [${env.nodeEnv}]`);
  logger.info(`Health check: http://localhost:${env.port}/api/v1/health`);
};

startServer().catch((error) => {
  logger.error(`Failed to start server: ${error.message}`);
  process.exit(1);
});
