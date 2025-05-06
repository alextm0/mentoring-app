// drizzle.config.js
require('dotenv').config();

/** @type { import("drizzle-kit").Config } */
module.exports = {
  schema: './src/models/*.js',
  out: './migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true
};
