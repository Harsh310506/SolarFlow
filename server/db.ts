import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create the postgres client
export const sql = postgres(process.env.DATABASE_URL);

// Create the drizzle instance
export const db = drizzle(sql, { schema });