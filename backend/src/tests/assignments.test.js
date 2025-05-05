const request = require('supertest');
const app = require('../app');
const db = require('../repos/db');
const { users, assignments, resources, submissions, comments } = require('../repos/schema/schema');
const { eq } = require('drizzle-orm');

const API_PREFIX = '/api/v1';

describe('Assignment Endpoints', () => {
  let mentorToken;
  let mentorId;
  let menteeToken;
  let menteeId;
  let assignmentId;

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

  const testAssignment = {
    title: 'Test Assignment',
    description: 'This is a test assignment'
  };

  async function cleanupTestData() {
    // Delete in correct order to handle foreign key constraints
    await db.delete(comments).where(true);
    await db.delete(submissions).where(true);
    await db.delete(resources).where(true);
    await db.delete(assignments).where(eq(assignments.title, testAssignment.title));
    await db.delete(users).where(eq(users.email, menteeUser.email));
    await db.delete(users).where(eq(users.email, mentorUser.email));
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  beforeAll(async () => {
    // Clean up test data
    await cleanupTestData();

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
    await cleanupTestData();
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  describe('POST /assignments', () => {
    it('should allow mentor to create assignment', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/assignments`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .send(testAssignment)
        .expect(201);

      expect(res.body).toHaveProperty('title', testAssignment.title);
      expect(res.body).toHaveProperty('description', testAssignment.description);
      expect(res.body).toHaveProperty('mentor_id', mentorId);

      assignmentId = res.body.id;
    });

    it('should not allow mentee to create assignment', async () => {
      await request(app)
        .post(`${API_PREFIX}/assignments`)
        .set('Authorization', `Bearer ${menteeToken}`)
        .send(testAssignment)
        .expect(403);
    });

    it('should validate required fields', async () => {
      await request(app)
        .post(`${API_PREFIX}/assignments`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('GET /assignments', () => {
    it('should list mentor assignments', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/assignments`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('title');
      expect(res.body[0]).toHaveProperty('description');
    });

    it('should not allow mentee to list all assignments', async () => {
      await request(app)
        .get(`${API_PREFIX}/assignments`)
        .set('Authorization', `Bearer ${menteeToken}`)
        .expect(403);
    });
  });

  describe('GET /assignments/mine', () => {
    it('should list mentee assignments', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/assignments/mine`)
        .set('Authorization', `Bearer ${menteeToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('title', testAssignment.title);
    });

    it('should not allow mentor to view mentee assignments', async () => {
      await request(app)
        .get(`${API_PREFIX}/assignments/mine`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .expect(403);
    });

    it('should return 404 for mentee without mentor', async () => {
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
        .get(`${API_PREFIX}/assignments/mine`)
        .set('Authorization', `Bearer ${menteeRes.body.token}`)
        .expect(404);

      // Clean up
      await db.delete(users).where(eq(users.email, unassignedMentee.email));
    });
  });

  describe('PUT /assignments/:id', () => {
    it('should allow mentor to update their assignment', async () => {
      const updates = {
        title: 'Updated Assignment',
        description: 'Updated description'
      };

      const res = await request(app)
        .put(`${API_PREFIX}/assignments/${assignmentId}`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .send(updates)
        .expect(200);

      expect(res.body).toHaveProperty('title', updates.title);
      expect(res.body).toHaveProperty('description', updates.description);

      // Reset title for other tests
      await request(app)
        .put(`${API_PREFIX}/assignments/${assignmentId}`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .send(testAssignment);
    });

    it('should not allow mentee to update assignment', async () => {
      await request(app)
        .put(`${API_PREFIX}/assignments/${assignmentId}`)
        .set('Authorization', `Bearer ${menteeToken}`)
        .send({ title: 'Unauthorized Update' })
        .expect(403);
    });

    it('should return 404 for non-existent assignment', async () => {
      await request(app)
        .put(`${API_PREFIX}/assignments/00000000-0000-0000-0000-000000000000`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .send(testAssignment)
        .expect(404);
    });
  });

  describe('DELETE /assignments/:id', () => {
    it('should not allow mentee to delete assignment', async () => {
      await request(app)
        .delete(`${API_PREFIX}/assignments/${assignmentId}`)
        .set('Authorization', `Bearer ${menteeToken}`)
        .expect(403);
    });

    it('should allow mentor to delete their assignment', async () => {
      await request(app)
        .delete(`${API_PREFIX}/assignments/${assignmentId}`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .expect(200);

      // Verify assignment is deleted
      await request(app)
        .get(`${API_PREFIX}/assignments/${assignmentId}`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .expect(404);
    });

    it('should return 404 for non-existent assignment', async () => {
      await request(app)
        .delete(`${API_PREFIX}/assignments/00000000-0000-0000-0000-000000000000`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .expect(404);
    });
  });
}); 