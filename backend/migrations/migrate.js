require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const { migrate } = require('drizzle-orm/neon-http/migrator');
const schema = require('../src/models/schema/schema');

async function runMigration() {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql, { schema });

    // ADD INDEXES TO TABLES
    await db.run(sql`
      CREATE INDEX idx_users_email ON users (email);
      CREATE INDEX idx_users_mentor_id ON users (mentor_id);
      CREATE INDEX idx_assignments_mentor_id ON assignments (mentor_id);
      CREATE INDEX idx_submissions_assignment_id ON submissions (assignment_id);
      CREATE INDEX idx_submissions_mentee_id ON submissions (mentee_id);
      CREATE INDEX idx_resources_mentor_id ON resources (mentor_id);
      CREATE INDEX idx_resources_assignment_id ON resources (assignment_id);
    `)

    console.log('Running migrations...');
    await migrate(db, { migrationsFolder: './migrations' });
    console.log('Migrations completed successfully');

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration(); 