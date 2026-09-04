import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export default async function globalSetup() {
  process.env.NODE_ENV = 'test';

  // Never use MONGODB_URI here — that is the dev database. Tests must use a
  // dedicated test DB or integration tests will wipe local user accounts.
  const uri =
    process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/thinkstack_test';

  process.env.MONGO_URI = uri;

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  } catch (error) {
    console.warn(`\n⚠️  MongoDB unavailable for integration tests: ${error.message}`);
    console.warn('   Repository tests will be skipped. Start MongoDB or set TEST_MONGODB_URI.\n');
    process.env.SKIP_DB_TESTS = 'true';
  }
}
