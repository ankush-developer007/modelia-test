import dotenv from 'dotenv';
import { initializeDatabase } from '../src/db';

dotenv.config({ path: '.env.test' });

// Setup test database before all tests
beforeAll(async () => {
  // Use SQLite for tests
  process.env.SQLITE_DB_PATH = './data/test.db';
  await initializeDatabase();
});

// Clean up after all tests
afterAll(async () => {
  // Cleanup can be added here if needed
});

