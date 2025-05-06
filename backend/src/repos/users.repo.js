const db = require('../config/database');
const { users } = require('../models');
const { eq } = require('drizzle-orm');

const findByEmail = async (email) => {
  return await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1)
    .then(rows => rows[0]);
};

const findById = async (id) => {
  return await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1)
    .then(rows => rows[0]);
};

const create = async (data) => {
  const userData = {
    email:         data.email.toLowerCase(),
    password_hash: data.password_hash,
    role:          data.role,
    mentor_id:     data.mentor_id, 
  };
  return await db
    .insert(users)
    .values(userData)
    .returning()
    .then(rows => rows[0]);
};

const update = async (id, data) => {
  // only allow actual user columns to be updated
  const updatable = ['email','password_hash','role','mentor_id'];
  const updateData = Object.fromEntries(
    Object.entries(data).filter(([k]) => updatable.includes(k))
  );

  return await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, id))
    .returning()
    .then(rows => rows[0]);
};

const remove = async (id) => {
  return await db
    .delete(users)
    .where(eq(users.id, id))
    .returning()
    .then(rows => rows[0]);
};

const findMenteesByMentorId = async (mentorId) => {
  return await db
    .select()
    .from(users)
    .where(eq(users.mentor_id, mentorId));
};

module.exports = {
  findByEmail,
  findById,
  create,
  update,
  remove,
  findMenteesByMentorId,
};
