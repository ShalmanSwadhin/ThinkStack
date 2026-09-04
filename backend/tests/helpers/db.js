import mongoose from 'mongoose';

export async function connectTestDB() {
  if (process.env.SKIP_DB_TESTS === 'true') {
    return null;
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('Test database URI not configured.');
  }

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  }

  return uri;
}

export async function disconnectTestDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
}

export async function clearTestDB() {
  if (process.env.SKIP_DB_TESTS === 'true') return;

  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
}

export function describeIfDb(name, fn) {
  const runner = process.env.SKIP_DB_TESTS === 'true' ? describe.skip : describe;
  runner(name, fn);
}
