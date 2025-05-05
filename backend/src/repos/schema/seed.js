require('dotenv').config();
const db = require('../db');
const { users, assignments } = require('./schema');
const { eq } = require('drizzle-orm');

async function seed() {
  try {
    console.log('Starting seed...');

    // Clean up existing test data
    await db.delete(users).where(eq(users.email, 'mentor@example.com'));
    await db.delete(users).where(eq(users.email, 'mentee1@example.com'));
    await db.delete(users).where(eq(users.email, 'mentee2@example.com'));

    // Create a mentor
    const [mentor] = await db.insert(users).values({
      email: 'mentor@example.com',
      password_hash: '$2a$10$K.0HwpsoPDGaB/atHHhJke.H6nUPtFv2lmGxBYAZ.wKw0kxV/w2q6', // password123
      role: 'MENTOR'
    }).returning();

    console.log('Created mentor:', mentor);

    // Create two mentees
    const [mentee1, mentee2] = await db.insert(users).values([
      {
        email: 'mentee1@example.com',
        password_hash: '$2a$10$K.0HwpsoPDGaB/atHHhJke.H6nUPtFv2lmGxBYAZ.wKw0kxV/w2q6', // password123
        role: 'MENTEE',
        mentor_id: mentor.id // Directly assign mentor
      },
      {
        email: 'mentee2@example.com',
        password_hash: '$2a$10$K.0HwpsoPDGaB/atHHhJke.H6nUPtFv2lmGxBYAZ.wKw0kxV/w2q6', // password123
        role: 'MENTEE'
        // This mentee has no mentor initially
      }
    ]).returning();

    console.log('Created mentees:', { mentee1, mentee2 });

    // Create an assignment
    const [assignment] = await db.insert(assignments).values({
      mentor_id: mentor.id,
      title: 'First Assignment',
      description: 'Complete a basic React component'
    }).returning();

    console.log('Created assignment:', assignment);

    // Verify mentor-mentee relationship
    const mentorWithMentees = await db
      .select()
      .from(users)
      .where(eq(users.mentor_id, mentor.id));
    
    console.log('Mentees under mentor:', mentorWithMentees);

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed(); 