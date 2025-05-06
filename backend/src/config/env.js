require('dotenv').config();
const { z } = require('zod');

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.string().default('5000'),
  JWT_SECRET: z.string(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const env = envSchema.parse(process.env);

module.exports = env;