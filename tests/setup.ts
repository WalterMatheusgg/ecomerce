import { beforeAll, afterAll } from 'vitest';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Ensure test env is set before any app imports/config loads
process.env.NODE_ENV = 'test';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env.test') });

beforeAll(() => {
  if (!process.env.DATABASE_URL?.includes('_test') && !process.env.DATABASE_URL?.includes(':5433')) {
    throw new Error('Refusing to operate on a non-test database');
  }
});

afterAll(async () => {
  const { prisma } = await import('../src/database/prisma.js');
  await prisma.$disconnect();
});
