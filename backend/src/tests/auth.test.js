const request = require('supertest');
const app = require('../app');
const db = require('../repos/db');
const { users } = require('../repos/schema/schema');
const { eq } = require('drizzle-orm');

const API_PREFIX = '/api/v1';

describe('Authentication Endpoints', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    role: 'MENTOR'
  };

  beforeAll(async () => {
    // Clean up test user if exists
    await db.delete(users).where(eq(users.email, testUser.email));
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for DB cleanup
  });

  afterEach(async () => {
    // Clean up between tests
    await db.delete(users).where(eq(users.email, testUser.email));
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for DB cleanup
  });

  afterAll(async () => {
    // Final cleanup
    await db.delete(users).where(eq(users.email, testUser.email));
    await new Promise(resolve => setTimeout(resolve, 500)); // Longer delay for final cleanup
  });

  describe('POST /auth/signup', () => {
    it('should create a new user and return token', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/auth/signup`)
        .send(testUser)
        .expect(201);

      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', testUser.email);
      expect(res.body.user).toHaveProperty('role', testUser.role);
      expect(res.body.user).not.toHaveProperty('password'); // Ensure password is not returned
    });

    it('should not allow duplicate email', async () => {
      // First create a user
      await request(app)
        .post(`${API_PREFIX}/auth/signup`)
        .send(testUser);

      // Try to create duplicate
      const res = await request(app)
        .post(`${API_PREFIX}/auth/signup`)
        .send(testUser)
        .expect(400);

      expect(res.body).toHaveProperty('message', 'User already exists');
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/auth/signup`)
        .send({})
        .expect(400);

      expect(res.body).toHaveProperty('error', 'Validation error');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Create test user for login tests
      await request(app)
        .post(`${API_PREFIX}/auth/signup`)
        .send(testUser);
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay after user creation
    });

    it('should login existing user and return token', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/auth/login`)
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', testUser.email);
      expect(res.body.user).toHaveProperty('role', testUser.role);
      expect(res.body.user).not.toHaveProperty('password'); // Ensure password is not returned
    });

    it('should reject invalid credentials', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/auth/login`)
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should reject non-existent user', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/auth/login`)
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });
  });
}); 