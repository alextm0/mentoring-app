require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const schema = require('./schema/schema');

// Create the connection pool
const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

module.exports = db; 