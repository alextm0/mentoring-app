const request = require('supertest');
const app     = require('../app');
const db      = require('../config/database');
const { users, assignments } = require('../models');
const { eq }  = require('drizzle-orm');

const API_PREFIX = '/api/v1';

describe('Assignment Endpoints', () => {
  let mentorToken, mentorId;
  let menteeToken, menteeId;
  let assignmentId;

  const mentorUser = {
    email: 'assign-mentor@test.com',
    password: 'password123',
    role: 'MENTOR',
  };

  const menteeUser = {
    email: 'assign-mentee@test.com',
    password: 'password123',
    role: 'MENTEE',
  };

  beforeAll(async () => {
    await db.delete(users).where(eq(users.email, menteeUser.email));
    await db.delete(users).where(eq(users.email, mentorUser.email));

    /* ─ mentor ─ */
    const mentorRes = await request(app)
      .post(`${API_PREFIX}/auth/signup`)
      .send(mentorUser)
      .expect(201);

    mentorToken = mentorRes.body.token;
    mentorId    = mentorRes.body.user.id;

    /* ─ mentee ─ */
    const menteeRes = await request(app)
      .post(`${API_PREFIX}/auth/signup`)
      .send(menteeUser)
      .expect(201);

    menteeToken = menteeRes.body.token;
    menteeId    = menteeRes.body.user.id;

    /* link mentee → mentor */
    await db
      .update(users)
      .set({ mentor_id: mentorId })
      .where(eq(users.id, menteeId));
  });

  afterAll(async () => {
    await db.delete(assignments).where(eq(assignments.mentor_id, mentorId));
    await db.delete(users).where(eq(users.email, menteeUser.email));
    await db.delete(users).where(eq(users.email, mentorUser.email));
  });

  /* ───────────── POST /assignments ───────────── */

  describe('POST /assignments', () => {
    it('should allow mentor to create assignment', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/assignments`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({ title: 'JS Basics', description: 'first lesson' })
        .expect(201);

      assignmentId = res.body.id;
      expect(res.body).toHaveProperty('title', 'JS Basics');
      expect(res.body).toHaveProperty('mentor_id', mentorId);
    });

    it('should not allow mentee to create assignment', async () => {
      await request(app)
        .post(`${API_PREFIX}/assignments`)
        .set('Authorization', `Bearer ${menteeToken}`)
        .send({ title: 'Hack', description: 'nope' })
        .expect(403);
    });

    it('should validate required fields', async () => {
      await request(app)
        .post(`${API_PREFIX}/assignments`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({ })                 // no title
        .expect(400);
    });
  });

  /* ───────────── GET /assignments ───────────── */

  describe('GET /assignments', () => {
    it('should list mentor assignments', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/assignments`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const found = res.body.find(a => a.id === assignmentId);
      expect(found).toBeTruthy();
    });

    it('should not allow mentee to list all assignments', async () => {
      await request(app)
        .get(`${API_PREFIX}/assignments`)
        .set('Authorization', `Bearer ${menteeToken}`)
        .expect(403);
    });
  });

  /* ───────────── GET /assignments/mine ───────────── */

  describe('GET /assignments/mine', () => {
    it('should list mentee assignments', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/assignments/mine`)
        .set('Authorization', `Bearer ${menteeToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const found = res.body.find(a => a.id === assignmentId);
      expect(found).toBeTruthy();
    });

    it('should not allow mentor to view mentee assignments', async () => {
      await request(app)
        .get(`${API_PREFIX}/assignments/mine`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .expect(403);
    });

    it('should return 404 for mentee without mentor', async () => {
      const unassigned = {
        email: `unassigned_${Date.now()}@test.com`,
        password: 'password123',
        role: 'MENTEE',          // ← mentee with no mentor_id
      };

      const signupRes = await request(app)
        .post(`${API_PREFIX}/auth/signup`)
        .send(unassigned)
        .expect(201);

      const token = signupRes.body.token;

      await request(app)
        .get(`${API_PREFIX}/assignments/mine`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      await db.delete(users).where(eq(users.email, unassigned.email));
    });
  });

  /* Additional PUT /assignments/:id and DELETE tests would follow here … */
});
