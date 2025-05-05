const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/error');
const db = require('./repos/db');
const { users } = require('./repos/schema/schema');
const routes = require('./routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint that also verifies database connection
app.get('/health', async (req, res, next) => {
  try {
    // Try to query the database
    const result = await db.select().from(users).limit(1);
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Mount all routes without /api/v1 prefix since it's already in routes/index.js
app.use(routes);

// 404 handler - must come before error handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handling - must be last
app.use(errorHandler);

module.exports = app;
