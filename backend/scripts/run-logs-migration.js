require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Create PostgreSQL pool for database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('Running logs table migration...');
    
    // Path to the migration file
    const migrationPath = path.join(__dirname, '../migrations/0001_create_logs_table.sql');
    
    // Read the migration SQL
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await client.query(migrationSQL);
    
    console.log('Logs table migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration(); 