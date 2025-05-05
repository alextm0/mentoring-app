// drizzle.config.js
require('dotenv').config();

/** @type { import("drizzle-kit").Config } */
module.exports = {
  schema: './src/repos/schema/schema.js',
  out: './src/repos/schema/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true
};
