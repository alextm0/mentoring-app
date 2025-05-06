require('dotenv').config();
const http = require('http');
const app = require('./app');
const env = require('./config/env');

const PORT = Number(env.PORT) || 5000;
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

server.on('error', err => {
  console.error('HTTP server error:', err);
  process.exit(1);
});
