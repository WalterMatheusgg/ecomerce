import { beforeAll, afterAll } from 'vitest';
import dotenv from 'dotenv';
import path from 'node:path';

// Ensure test env is set before any app imports/config loads
process.env.NODE_ENV = 'test';
dotenv.config({ path: path.resolve(__dirname, '..', '.env.test') });

beforeAll(() => {
  if (!process.env.DATABASE_URL?.includes('_test') && !process.env.DATABASE_URL?.includes(':5433')) {
    throw new Error('Refusing to operate on a non-test database');
  }
});

afterAll(async () => {
  // no-op
});
