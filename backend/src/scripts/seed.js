const bcrypt = require('bcrypt');
const db = require('../repos/db');
const { users, assignments, resources } = require('../repos/schema/schema');

async function seed() {
  try {
    // Clear existing data
    await db.delete(resources).where(true);
    await db.delete(assignments).where(true);
    await db.delete(users).where(true);

    // Create mentor
    const password_hash = await bcrypt.hash('demo123', 10);
    const [mentor] = await db.insert(users).values({
      email: 'mentor@demo.com',
      password_hash,
      role: 'MENTOR'
    }).returning();

    // Create mentees
    const [mentee1] = await db.insert(users).values({
      email: 'mentee1@demo.com',
      password_hash,
      role: 'MENTEE',
      mentor_id: mentor.id
    }).returning();

    const [mentee2] = await db.insert(users).values({
      email: 'mentee2@demo.com',
      password_hash,
      role: 'MENTEE',
      mentor_id: mentor.id
    }).returning();

    // Create assignments
    const [assignment1] = await db.insert(assignments).values({
      mentor_id: mentor.id,
      title: 'JavaScript Basics',
      description: 'Learn the fundamentals of JavaScript programming'
    }).returning();

    const [assignment2] = await db.insert(assignments).values({
      mentor_id: mentor.id,
      title: 'React Components',
      description: 'Create reusable React components using best practices'
    }).returning();

    // Create resources
    await db.insert(resources).values([
      {
        mentor_id: mentor.id,
        title: 'MDN JavaScript Guide',
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
        assignment_id: assignment1.id
      },
      {
        mentor_id: mentor.id,
        title: 'JavaScript.info',
        url: 'https://javascript.info',
        assignment_id: assignment1.id
      },
      {
        mentor_id: mentor.id,
        title: 'React Documentation',
        url: 'https://react.dev',
        assignment_id: assignment2.id
      },
      {
        mentor_id: mentor.id,
        title: 'Git Cheat Sheet',
        url: 'https://education.github.com/git-cheat-sheet-education.pdf'
      }
    ]);

    console.log('Database seeded successfully!');
    console.log('\nDemo credentials:');
    console.log('Mentor: mentor@demo.com / demo123');
    console.log('Mentee 1: mentee1@demo.com / demo123');
    console.log('Mentee 2: mentee2@demo.com / demo123');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed(); 