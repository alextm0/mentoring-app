const request = require('supertest');
const app     = require('../app');
const db      = require('../config/database');
const { users } = require('../models');
const { eq }  = require('drizzle-orm');

const API_PREFIX = '/api/v1';

describe('User Endpoints', () => {
  let mentorToken, mentorId;
  let menteeToken, menteeId;

  // baseline accounts
  const mentorUser = {
    email: 'mentor@test.com',
    password: 'password123',
    role: 'MENTOR',
  };

  const menteeUser = {
    email: 'mentee@test.com',
    password: 'password123',
    role: 'MENTEE',
  };

  /* ──────────────────────────── setup / teardown ─────────────────────────── */

  beforeAll(async () => {
    // ensure a clean slate
    await db.delete(users).where(eq(users.email, menteeUser.email));
    await db.delete(users).where(eq(users.email, mentorUser.email));

    /* ─ create mentor ─ */
    const mentorRes = await request(app)
      .post(`${API_PREFIX}/auth/signup`)
      .send(mentorUser)
      .expect(201);

    mentorToken = mentorRes.body.token;
    mentorId    = mentorRes.body.user.id;

    /* ─ create mentee ─ */
    const menteeRes = await request(app)
      .post(`${API_PREFIX}/auth/signup`)
      .send(menteeUser)
      .expect(201);

    menteeToken = menteeRes.body.token;
    menteeId    = menteeRes.body.user.id;

    /* ─ link mentee → mentor ─ */
    await db
      .update(users)
      .set({ mentor_id: mentorId })
      .where(eq(users.id, menteeId));
  });

  afterAll(async () => {
    await db.delete(users).where(eq(users.email, menteeUser.email));
    await db.delete(users).where(eq(users.email, mentorUser.email));
  });

  /* ─────────────────────────── /users/me ─────────────────────────── */

  describe('GET /users/me', () => {
    it('should return authenticated user profile', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/users/me`)
        .set('Authorization', `Bearer ${menteeToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('email', menteeUser.email);
      expect(res.body).toHaveProperty('role',  menteeUser.role);
      expect(res.body).toHaveProperty('mentor_id', mentorId);
      expect(res.body).not.toHaveProperty('password_hash');
    });

    it('should return 401 without auth token', async () => {
      await request(app)
        .get(`${API_PREFIX}/users/me`)
        .expect(401);
    });
  });

  /* ───────────────────────── /users/mentees ───────────────────────── */

  describe('GET /users/mentees', () => {
    it('should allow mentor to view their mentees', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/users/mentees`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const mentee = res.body.find(u => u.id === menteeId);
      expect(mentee).toBeTruthy();
      expect(mentee.email).toBe(menteeUser.email);
    });

    it('should not allow mentee to view mentees', async () => {
      await request(app)
        .get(`${API_PREFIX}/users/mentees`)
        .set('Authorization', `Bearer ${menteeToken}`)
        .expect(403);
    });
  });

  /* ───────────────────────── /users/mentor ───────────────────────── */

  describe('GET /users/mentor', () => {
    it('should allow mentee to view their mentor', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/users/mentor`)
        .set('Authorization', `Bearer ${menteeToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('id',    mentorId);
      expect(res.body).toHaveProperty('email', mentorUser.email);
    });

    it('should not allow mentor to view mentor', async () => {
      await request(app)
        .get(`${API_PREFIX}/users/mentor`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .expect(403);
    });

    it('should return 404 if mentee has no mentor', async () => {
      /* create a fresh, un‑linked mentee */
      const unassigned = {
        email: `unassigned_${Date.now()}@test.com`,
        password: 'password123',
        role: 'MENTEE',
      };

      const signupRes = await request(app)
        .post(`${API_PREFIX}/auth/signup`)
        .send(unassigned)
        .expect(201);

      const token = signupRes.body.token;

      await request(app)
        .get(`${API_PREFIX}/users/mentor`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      // cleanup
      await db.delete(users).where(eq(users.email, unassigned.email));
    });
  });
});
