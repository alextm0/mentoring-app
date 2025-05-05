const request = require('supertest');
const app = require('../app');
const db = require('../repos/db');
const { users } = require('../repos/schema/schema');
const { eq } = require('drizzle-orm');

const API_PREFIX = '/api/v1';

describe('User Endpoints', () => {
  let mentorToken;
  let mentorId;
  let menteeToken;
  let menteeId;

  const mentorUser = {
    email: 'mentor@test.com',
    password: 'password123',
    role: 'MENTOR'
  };

  const menteeUser = {
    email: 'mentee@test.com',
    password: 'password123',
    role: 'MENTEE'
  };

  beforeAll(async () => {
    // Clean up test users
    await db.delete(users).where(eq(users.email, menteeUser.email));
    await db.delete(users).where(eq(users.email, mentorUser.email));
    await new Promise(resolve => setTimeout(resolve, 100));

    // Create mentor
    const mentorRes = await request(app)
      .post(`${API_PREFIX}/auth/signup`)
      .send(mentorUser);
    mentorToken = mentorRes.body.token;
    mentorId = mentorRes.body.user.id;

    // Create mentee
    const menteeRes = await request(app)
      .post(`${API_PREFIX}/auth/signup`)
      .send(menteeUser);
    menteeToken = menteeRes.body.token;
    menteeId = menteeRes.body.user.id;

    // Link mentee to mentor
    await db
      .update(users)
      .set({ mentor_id: mentorId })
      .where(eq(users.id, menteeId));

    await new Promise(resolve => setTimeout(resolve, 100));
  });

  afterAll(async () => {
    await db.delete(users).where(eq(users.email, menteeUser.email));
    await db.delete(users).where(eq(users.email, mentorUser.email));
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  describe('GET /users/me', () => {
    it('should return authenticated user profile', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/users/me`)
        .set('Authorization', `Bearer ${menteeToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('email', menteeUser.email);
      expect(res.body).toHaveProperty('role', menteeUser.role);
      expect(res.body).toHaveProperty('mentor_id', mentorId);
      expect(res.body).not.toHaveProperty('password_hash');
    });

    it('should return 401 without auth token', async () => {
      await request(app)
        .get(`${API_PREFIX}/users/me`)
        .expect(401);
    });
  });

  describe('GET /users/mentees', () => {
    it('should allow mentor to view their mentees', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/users/mentees`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
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

  describe('GET /users/mentor', () => {
    it('should allow mentee to view their mentor', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/users/mentor`)
        .set('Authorization', `Bearer ${menteeToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('id', mentorId);
      expect(res.body).toHaveProperty('email', mentorUser.email);
    });

    it('should not allow mentor to view mentor', async () => {
      await request(app)
        .get(`${API_PREFIX}/users/mentor`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .expect(403);
    });

    it('should return 404 if mentee has no mentor', async () => {
      // Create a new mentee without mentor
      const unassignedMentee = {
        email: 'unassigned@test.com',
        password: 'password123',
        role: 'MENTEE'
      };

      const menteeRes = await request(app)
        .post(`${API_PREFIX}/auth/signup`)
        .send(unassignedMentee);

      await request(app)
        .get(`${API_PREFIX}/users/mentor`)
        .set('Authorization', `Bearer ${menteeRes.body.token}`)
        .expect(404);

      // Clean up
      await db.delete(users).where(eq(users.email, unassignedMentee.email));
    });
  });
}); 