require('dotenv').config();
const http = require('http');
const app = require('./app');
const env = require('./config/env');
const { initScheduler } = require('./utils/scheduler');
const logger = require('./utils/logger');

const PORT = Number(env.PORT) || 5000;
const server = http.createServer(app);

server.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
  
  // Initialize the scheduler once the server is running
  initScheduler();
});

server.on('error', err => {
  logger.error('HTTP server error:', err);
  process.exit(1);
});
