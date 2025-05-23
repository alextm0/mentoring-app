const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { eq } = require('drizzle-orm');
const db = require('../config/database');
const { users } = require('../models');

async function createTestUser(email, role, mentor_id = null) {
  // Check if user already exists
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser) {
    return existingUser;
  }

  const password_hash = await bcrypt.hash('test123', 10);
  const [user] = await db.insert(users)
    .values({
      email,
      password_hash,
      role,
      mentor_id
    })
    .returning();

  return user;
}

function createTestToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
}

async function clearDb() {
  await db.delete(comments);
  await db.delete(submissions);
  await db.delete(resources);
  await db.delete(assignments);
  await db.delete(users);
}

module.exports = {
  createTestUser,
  createTestToken,
  clearDb
}; 