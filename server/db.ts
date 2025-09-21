import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

// Construct DATABASE_URL from individual PostgreSQL environment variables
let databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  const { PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE } = process.env;
  
  if (!PGHOST || !PGPORT || !PGUSER || !PGPASSWORD || !PGDATABASE) {
    throw new Error('PostgreSQL environment variables are required (PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE)');
  }
  
  databaseUrl = `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}`;
}

// Create the postgres client with SSL configuration
// Use SSL prefer instead of require to handle both SSL and non-SSL connections
export const sql = postgres(databaseUrl, { 
  ssl: 'require', // Changed to 'require' for Supabase production
  max: 10, // Maximum connections
  idle_timeout: 20,
  connect_timeout: 10
});

// Create the drizzle instance
export const db = drizzle(sql, { schema });

// Test database connection
async function testConnection() {
  try {
    await sql`SELECT 1`;
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }
}

// Test connection on startup
testConnection().catch(console.error);