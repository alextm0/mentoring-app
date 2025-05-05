require('dotenv').config();

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

// Global test setup
beforeAll(async () => {
  // Add any global setup if needed
});

// Global test teardown
afterAll(async () => {
  // Add any global cleanup if needed
}); 