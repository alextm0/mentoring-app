const db = require('../config/database');
const { logs, users } = require('../models');
const { eq, and, desc, gte, lte } = require('drizzle-orm');

/**
 * Create a new log entry
 */
const create = async (data) => {
  return await db
    .insert(logs)
    .values(data)
    .returning()
    .then(rows => rows[0]);
};

/**
 * Find logs by user ID
 */
const findByUserId = async (userId, limit = 100) => {
  return await db
    .select()
    .from(logs)
    .where(eq(logs.user_id, userId))
    .orderBy(desc(logs.created_at))
    .limit(limit);
};

/**
 * Find logs by entity type and ID
 */
const findByEntity = async (entityType, entityId, limit = 100) => {
  return await db
    .select()
    .from(logs)
    .where(
      and(
        eq(logs.entity_type, entityType),
        eq(logs.entity_id, entityId)
      )
    )
    .orderBy(desc(logs.created_at))
    .limit(limit);
};

/**
 * Find logs by date range
 */
const findByDateRange = async (startDate, endDate, limit = 1000) => {
  return await db
    .select()
    .from(logs)
    .where(
      and(
        gte(logs.created_at, startDate),
        lte(logs.created_at, endDate)
      )
    )
    .orderBy(desc(logs.created_at))
    .limit(limit);
};

/**
 * Get frequency analysis of user actions
 */
const getUserActionFrequency = async (userId, startDate, endDate) => {
  // This is a complex query that will return the count of each action type
  // for a specific user within a date range
  const result = await db.execute(sql`
    SELECT 
      action, 
      entity_type, 
      COUNT(*) as frequency
    FROM logs
    WHERE 
      user_id = ${userId} AND
      created_at >= ${startDate} AND
      created_at <= ${endDate}
    GROUP BY action, entity_type
    ORDER BY frequency DESC
  `);
  
  return result.rows;
};

/**
 * Find all logs with pagination
 */
const findAll = async (page = 1, limit = 100) => {
  const offset = (page - 1) * limit;
  
  return await db
    .select({
      ...logs,
      user_email: users.email
    })
    .from(logs)
    .leftJoin(users, eq(logs.user_id, users.id))
    .orderBy(desc(logs.created_at))
    .limit(limit)
    .offset(offset);
};

module.exports = {
  create,
  findByUserId,
  findByEntity,
  findByDateRange,
  getUserActionFrequency,
  findAll,
}; 