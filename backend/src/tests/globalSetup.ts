import { MongoMemoryServer } from 'mongodb-memory-server';

export default async function globalSetup() {
  const mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  
  process.env.MONGO_URI = uri;
  (global as any).__MONGO_INSTANCE__ = mongo;
  
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
  }
}
