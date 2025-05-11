const db = require("../config/database");
const { monitored_users, users } = require("../models");
const { eq, and, desc, isNull, lt, gte, sql } = require("drizzle-orm");
const { createTable } = require("drizzle-orm/pg-core");

/* ────────────────────────────────────────────────────────────── *
 * Add a user to the monitored list
 * ────────────────────────────────────────────────────────────── */
const addMonitoredUser = async (data) =>
  db
    .insert(monitored_users)
    .values({ ...data, is_active: true })
    .returning()
    .then((rows) => rows[0]);

/* ────────────────────────────────────────────────────────────── *
 * Check if a user is already being monitored
 * ────────────────────────────────────────────────────────────── */
const isUserMonitored = async (userId) => {
  const rows = await db
    .select()
    .from(monitored_users)
    .where(and(eq(monitored_users.user_id, userId), eq(monitored_users.is_active, true)))
    .limit(1)
    .execute(); // ← important
  return rows.length > 0;
};

/* ────────────────────────────────────────────────────────────── *
 * Get all active monitored users
 * ────────────────────────────────────────────────────────────── */
const getActiveMonitoredUsers = async () =>
  db
    .select({
      ...monitored_users,
      user_email: users.email,
      user_role: users.role,
    })
    .from(monitored_users)
    .innerJoin(users, eq(monitored_users.user_id, users.id))
    .where(eq(monitored_users.is_active, true))
    .orderBy(desc(monitored_users.created_at))
    .execute(); // ← important

/* ────────────────────────────────────────────────────────────── *
 * Get all monitored users (including inactive)
 * ────────────────────────────────────────────────────────────── */
const getAllMonitoredUsers = async () => {
  return await db
    .select({
      ...monitored_users,
      user_email: users.email,
      user_role: users.role,
      resolver_email: sql`resolver.email`
    })
    .from(monitored_users)
    .innerJoin(users, eq(monitored_users.user_id, users.id))
    .leftJoin(
      sql`${users} as resolver`, 
      eq(monitored_users.resolved_by, sql`resolver.id`)
    )
    .orderBy(desc(monitored_users.created_at))
    .execute(); // ← important
};

/* ────────────────────────────────────────────────────────────── *
 * Get monitored user by ID
 * ────────────────────────────────────────────────────────────── */
const getMonitoredUserById = async (id) =>
  db
    .select({
      ...monitored_users,
      user_email: users.email,
      user_role: users.role,
    })
    .from(monitored_users)
    .innerJoin(users, eq(monitored_users.user_id, users.id))
    .where(eq(monitored_users.id, id))
    .limit(1)
    .execute() // ← important
    .then((rows) => rows[0]);

/* ────────────────────────────────────────────────────────────── *
 * Resolve a monitored user (mark as inactive)
 * ────────────────────────────────────────────────────────────── */
const resolveMonitoredUser = async (id, adminId, notes) =>
  db
    .update(monitored_users)
    .set({
      is_active: false,
      resolved_at: new Date(),
      resolved_by: adminId,
      resolution_notes: notes,
      updated_at: new Date(),
    })
    .where(eq(monitored_users.id, id))
    .returning()
    .then((rows) => rows[0]);

/* ────────────────────────────────────────────────────────────── *
 * Update an existing monitored user
 * ────────────────────────────────────────────────────────────── */
const updateMonitoredUser = async (id, data) =>
  db
    .update(monitored_users)
    .set({ ...data, updated_at: new Date() })
    .where(eq(monitored_users.id, id))
    .returning()
    .then((rows) => rows[0]);

module.exports = {
  addMonitoredUser,
  isUserMonitored,
  getActiveMonitoredUsers,
  getAllMonitoredUsers,
  getMonitoredUserById,
  resolveMonitoredUser,
  updateMonitoredUser,
};
