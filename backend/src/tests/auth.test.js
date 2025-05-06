const request = require('supertest');
const app     = require('../app');
const db      = require('../config/database');
const { users } = require('../models');
const { eq }  = require('drizzle-orm');

const API_PREFIX = '/api/v1';

describe('Authentication Endpoints', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    role: 'MENTOR',
  };

  beforeAll(async () => {
    // clean out any residue from previous runs
    await db.delete(users).where(eq(users.email, testUser.email));
  });

  afterEach(async () => {
    // tidy between individual tests
    await db.delete(users).where(eq(users.email, testUser.email));
  });

  afterAll(async () => {
    await db.delete(users).where(eq(users.email, testUser.email));
  });

  /* ───────────────────────── POST /auth/signup ───────────────────────── */

  describe('POST /auth/signup', () => {
    it('should create a new user and return token', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/auth/signup`)
        .send(testUser)
        .expect(201);

      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', testUser.email);
      expect(res.body.user).toHaveProperty('role',  testUser.role);
      expect(res.body.user).not.toHaveProperty('password_hash');
    });

    it('should not allow duplicate email', async () => {
      // first signup
      await request(app)
        .post(`${API_PREFIX}/auth/signup`)
        .send(testUser)
        .expect(201);

      // duplicate signup
      const res = await request(app)
        .post(`${API_PREFIX}/auth/signup`)
        .send(testUser)
        .expect(400);

      expect(res.body).toHaveProperty('message', 'User already exists');
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/auth/signup`)
        .send({})                           // missing all fields
        .expect(400);

      expect(res.body).toHaveProperty('message', 'Validation error');
      expect(Array.isArray(res.body.errors)).toBe(true);
    });
  });

  /* ───────────────────────── POST /auth/login ───────────────────────── */

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // create a user for each login test
      await request(app)
        .post(`${API_PREFIX}/auth/signup`)
        .send(testUser)
        .expect(201);
    });

    it('should login existing user and return token', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/auth/login`)
        .send({
          email:    testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', testUser.email);
      expect(res.body.user).toHaveProperty('role',  testUser.role);
    });

    it('should reject invalid credentials', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/auth/login`)
        .send({
          email:    testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should reject non-existent user', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/auth/login`)
        .send({
          email:    'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);

      expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });
  });
});
