import connectDB from '../config/db.js';
import logger from '../utils/logger.js';
import { User } from '../models/index.js';
import bootstrapDatabase from './bootstrap.js';

const COLLECTIONS_TO_CLEAR = [
  'users',
  'topics',
  'problems',
  'quizzes',
  'badges',
  'certificates',
  'visualizers',
  'dailychallenges',
  'announcements',
  'contests',
  'contestparticipants',
  'contestsubmissions',
];

async function clearDatabase() {
  logger.info('Clearing existing seed collections...');
  await Promise.all(
    COLLECTIONS_TO_CLEAR.map((name) => User.db.collection(name).deleteMany({}))
  );
}

/**
 * Manual seed entry point.
 *
 * - default: idempotent insert-only bootstrap (same as server startup)
 * - --sync: overwrite seed-managed records from source data
 * - --fresh: wipe seed collections first, then insert defaults
 * - --lessons: with --sync, refresh only lessons, their quizzes and problem links
 */
export async function runSeed(options = {}) {
  const fresh = Boolean(options.fresh);
  const mode = options.sync ? 'sync' : 'insert';

  await connectDB();

  if (fresh) {
    await clearDatabase();
  }

  const stats = await bootstrapDatabase({ mode, only: options.lessonsOnly ? 'lessons' : undefined });

  const summary = {
    mode,
    fresh,
    admin: stats.admin,
    ...stats.totals,
  };

  logger.info('Seed completed successfully', summary);
  return summary;
}

const isDirectRun = process.argv[1]?.includes('seed');

if (isDirectRun) {
  const fresh = process.argv.includes('--fresh');
  const sync = process.argv.includes('--sync');
  const lessonsOnly = process.argv.includes('--lessons');

  runSeed({ fresh, sync, lessonsOnly })
    .then((summary) => {
      console.log('\n✅ Seed Summary:', JSON.stringify(summary, null, 2));
      process.exit(0);
    })
    .catch((error) => {
      logger.error(`Seed failed: ${error.message}`);
      process.exit(1);
    });
}

export { bootstrapDatabase };
export default runSeed;
