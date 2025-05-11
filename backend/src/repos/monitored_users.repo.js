const db = require('../config/database');
const { monitored_users, users } = require('../models');
const { eq, and, desc, isNull, lt, gte } = require('drizzle-orm');

/**
 * Add a user to the monitored list
 */
const addMonitoredUser = async (data) => {
  return await db
    .insert(monitored_users)
    .values({
      ...data,
      is_active: true
    })
    .returning()
    .then(rows => rows[0]);
};

/**
 * Check if a user is already being monitored
 */
const isUserMonitored = async (userId) => {
  const result = await db
    .select()
    .from(monitored_users)
    .where(
      and(
        eq(monitored_users.user_id, userId),
        eq(monitored_users.is_active, true)
      )
    )
    .limit(1);
  
  return result.length > 0;
};

/**
 * Get all active monitored users
 */
const getActiveMonitoredUsers = async () => {
  return await db
    .select({
      ...monitored_users,
      user_email: users.email,
      user_role: users.role
    })
    .from(monitored_users)
    .innerJoin(users, eq(monitored_users.user_id, users.id))
    .where(eq(monitored_users.is_active, true))
    .orderBy(desc(monitored_users.created_at));
};

/**
 * Get all monitored users (including inactive)
 */
const getAllMonitoredUsers = async () => {
  return await db
    .select({
      ...monitored_users,
      user_email: users.email,
      user_role: users.role,
      resolver_email: users.email
    })
    .from(monitored_users)
    .innerJoin(users, eq(monitored_users.user_id, users.id))
    .leftJoin(users, eq(monitored_users.resolved_by, users.id))
    .orderBy(desc(monitored_users.created_at));
};

/**
 * Get monitored user by ID
 */
const getMonitoredUserById = async (id) => {
  return await db
    .select({
      ...monitored_users,
      user_email: users.email,
      user_role: users.role
    })
    .from(monitored_users)
    .innerJoin(users, eq(monitored_users.user_id, users.id))
    .where(eq(monitored_users.id, id))
    .limit(1)
    .then(rows => rows[0]);
};

/**
 * Resolve a monitored user (mark as inactive)
 */
const resolveMonitoredUser = async (id, adminId, notes) => {
  return await db
    .update(monitored_users)
    .set({
      is_active: false,
      resolved_at: new Date(),
      resolved_by: adminId,
      resolution_notes: notes,
      updated_at: new Date()
    })
    .where(eq(monitored_users.id, id))
    .returning()
    .then(rows => rows[0]);
};

/**
 * Update an existing monitored user
 */
const updateMonitoredUser = async (id, data) => {
  return await db
    .update(monitored_users)
    .set({
      ...data,
      updated_at: new Date()
    })
    .where(eq(monitored_users.id, id))
    .returning()
    .then(rows => rows[0]);
};

module.exports = {
  addMonitoredUser,
  isUserMonitored,
  getActiveMonitoredUsers,
  getAllMonitoredUsers,
  getMonitoredUserById,
  resolveMonitoredUser,
  updateMonitoredUser
}; 