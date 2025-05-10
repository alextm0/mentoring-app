const express = require('express');
const cors = require('cors');
const db = require('./config/database');
const { users } = require('./models');
const routes = require('./routes');
const errorHandling = require('./utils/errorHandler');
const rateLimiter = require('./middleware/rateLimit');
const requestLogger = require('./middleware/requestLogger');

const swaggerUi = require('swagger-ui-express');
const jsYaml = require('js-yaml');
const fs = require('fs');

const app = express();

// Global middleware
app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend domain
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(requestLogger);

// Routes that should not be rate-limited
app.get('/health', async (_req, res) => {
  try {
    await db.select().from(users).limit(1);
    const memoryUsage = process.memoryUsage();
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      memory: {
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      },
      uptime: process.uptime(),
    });
  } catch (e) {
    res.status(503).json({ status: 'unhealthy', database: 'disconnected', message: e.message });
  }
});

let swaggerDocument;
try {
  const yamlContent = fs.readFileSync('./docs/api.yaml', 'utf8');
  // Use loadAll to handle multiple documents, but only take the first one
  const documents = [];
  jsYaml.loadAll(yamlContent, (doc) => documents.push(doc));
  if (documents.length === 0) {
    throw new Error('No valid YAML documents found');
  }
  swaggerDocument = documents[0]; // Take the first document
} catch (e) {
  console.error('Failed to load Swagger document:', e);
  swaggerDocument = { openapi: '3.0.0', info: { title: 'API', version: '1.0.0' }, paths: {} };
}
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Apply rate limiting to API routes only
// app.use((req, res, next) => {
//   if (req.path.startsWith('/api/v1')) {
//     return rateLimiter(req, res, next);
//   }
//   next();
// });

// Main API routes
app.use(routes);

// 404 handler
app.use((_req, res) => res.status(404).json({ error: 'Not Found' }));

// Error handling middleware (must be last)
app.use(errorHandling);

module.exports = app;