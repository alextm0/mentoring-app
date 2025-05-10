/* eslint-disable no-console */
const bcrypt = require('bcrypt');
const db = require('../config/database');          // ← adjust path if needed
const { sql } = require('drizzle-orm');

// ---- pull the TABLE objects exactly as defined in your schema ------------
const {
  users,
  assignments,
  resources,
  submissions,
} = require('../models');                          // ← path to the schema!

// ---- helper ----------------------------------------------------------------
const addDays = (d) => new Date(Date.now() + d * 86_400_000); // millis in a day

async function seed() {
  try {
    /* ----------------- wipe existing rows (FK order) ------------------ */
    await db.execute(sql`DELETE FROM ${submissions}`);
    await db.execute(sql`DELETE FROM ${resources}`);
    await db.execute(sql`DELETE FROM ${assignments}`);
    await db.execute(sql`DELETE FROM ${users}`);

    /* --------------------------- mentor ------------------------------- */
    const [mentor] = await db
      .insert(users)
      .values({
        email: 'alextoma1704@gmail.com',
        password_hash: await bcrypt.hash('demo123', 10),
        role: 'MENTOR',
        name: 'Alexandru Toma',
        bio: 'Senior Software Engineer with 10 years of full‑stack experience',
      })
      .returning();

    /* --------------------------- mentees ------------------------------ */
    const menteeProfiles = [
      ['Emma Davis',   'Frontend dev transitioning to full‑stack'],
      ['Michael Chen', 'CS grad focusing on web tech'],
      ['Sarah Wilson', 'Self‑taught dev with a design background'],
    ];

    const mentees = await db
      .insert(users)
      .values(
        await Promise.all(
          menteeProfiles.map(async ([name, bio], i) => ({
            email: `mentee${i + 1}@demo.com`,
            password_hash: await bcrypt.hash('demo123', 10),
            role: 'MENTEE',
            mentor_id: mentor.id,
            name,
            bio,
          })),
        ),
      )
      .returning();

    /* ------------------------- assignments ---------------------------- */
    const assignmentsData = [
      [
        'Full‑Stack Authentication System',
        'Implement JWT auth with password reset and OAuth.',
      ],
      [
        'Real‑time Chat Application',
        'Build a chat app with WebSocket, typing indicators and file sharing.',
      ],
      [
        'E‑commerce Product Management',
        'Create product CRUD, inventory tracking, image upload, categories.',
      ],
      [
        'Performance Optimization Project',
        'Optimize a React app: code‑splitting, lazy loading, state management.',
      ],
    ].map(([title, description]) => ({
      mentor_id: mentor.id,
      title,
      description,
    }));

    const ass = await db.insert(assignments).values(assignmentsData).returning();

    /* -------------------------- resources ----------------------------- */
    const resourcesData = [
      {
        title: 'Authentication Best Practices',
        url: 'https://auth0.com/blog/authentication-best-practices-for-node-js',
        description: 'Comprehensive guide on secure auth flows',
        assignment_id: ass[0].id,
      },
      {
        title: 'WebSocket Tutorial',
        url: 'https://socket.io/get-started/chat',
        description: 'Real‑time chat with Socket.io',
        assignment_id: ass[1].id,
      },
      {
        title: 'React Performance Optimization',
        url: 'https://react.dev/learn/managing-state',
        description: 'Official React docs on performance',
        assignment_id: ass[3].id,
      },
      {
        title: 'Database Design Patterns',
        url: 'https://www.postgresql.org/docs/current/ddl.html',
        description: 'PostgreSQL docs on schema design',
        assignment_id: ass[2].id,
      },
      {
        title: 'AWS S3 File Upload Guide',
        url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/upload-objects.html',
        description: 'Uploading files to S3',
        assignment_id: ass[2].id,
      },
    ].map((row) => ({ ...row, mentor_id: mentor.id }));

    await db.insert(resources).values(resourcesData);

    /* ------------------------- submissions ---------------------------- */
    await db.insert(submissions).values([
      {
        mentee_id: mentees[0].id,
        assignment_id: ass[0].id,
        snippet: '// login controller code…',
        completed: true,
        created_at: addDays(-3),
      },
      {
        mentee_id: mentees[1].id,
        assignment_id: ass[1].id,
        snippet: '// socket.io chat room skeleton…',
        completed: false,
        created_at: new Date(),
      },
      {
        mentee_id: mentees[2].id,
        assignment_id: ass[2].id,
        snippet: '// product CRUD module draft…',
        completed: false,
        created_at: new Date(),
      },
    ]);

    /* --------------------------- done! ------------------------------- */
    console.log('\n✅  Database seeded.\n');
    console.table([
      ['Mentor (you)', 'alextoma1704@gmail.com', 'demo123'],
      ['Mentee 1', 'mentee1@demo.com', 'demo123'],
      ['Mentee 2', 'mentee2@demo.com', 'demo123'],
      ['Mentee 3', 'mentee3@demo.com', 'demo123'],
    ]);
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
