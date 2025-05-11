const request = require('supertest');
const { eq } = require('drizzle-orm');
const app = require('../app');
const db = require('../config/database');
const { users, assignments, submissions } = require('../models');
const { createTestUser, createTestToken } = require('./helpers');

describe('Submissions API', () => {
  let mentor;
  let mentee;
  let mentorToken;
  let menteeToken;
  let testAssignment;
  let testSubmission;

  beforeAll(async () => {
    // Create test users
    mentor = await createTestUser('mentor@test.com', 'MENTOR');
    mentee = await createTestUser('mentee@test.com', 'MENTEE', mentor.id);
    
    // Create tokens
    mentorToken = createTestToken(mentor);
    menteeToken = createTestToken(mentee);

    // Create a test assignment
    [testAssignment] = await db.insert(assignments).values({
      mentor_id: mentor.id,
      title: 'Test Assignment',
      description: 'Test Description'
    }).returning();

    // Create a test submission
    [testSubmission] = await db.insert(submissions).values({
      assignment_id: testAssignment.id,
      mentee_id: mentee.id,
      snippet: 'console.log("Hello World");',
      completed: false
    }).returning();
  });

  afterAll(async () => {
    await db.delete(submissions).where(true);
    await db.delete(assignments).where(true);
    await db.delete(users).where(true);
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  describe('GET /api/v1/submissions', () => {
    it('should list all submissions for a mentor', async () => {
      const res = await request(app)
        .get('/api/v1/submissions')
        .set('Authorization', `Bearer ${mentorToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('assignment_id');
      expect(res.body[0]).toHaveProperty('mentee_id');
      expect(res.body[0]).toHaveProperty('snippet');
      expect(res.body[0]).toHaveProperty('completed');
    });

    it('should reject listing all submissions for a mentee', async () => {
      const res = await request(app)
        .get('/api/v1/submissions')
        .set('Authorization', `Bearer ${menteeToken}`);

      expect(res.status).toBe(403);
    });

    it('should return empty array for mentor with no submissions', async () => {
      // Create a new mentor with no assignments/submissions
      const otherMentor = await createTestUser('other-mentor@test.com', 'MENTOR');
      const otherMentorToken = createTestToken(otherMentor);

      const res = await request(app)
        .get('/api/v1/submissions')
        .set('Authorization', `Bearer ${otherMentorToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
  });

  describe('POST /api/v1/submissions', () => {
    it('should create submission as mentee', async () => {
      const res = await request(app)
        .post('/api/v1/submissions')
        .set('Authorization', `Bearer ${menteeToken}`)
        .send({
          assignment_id: testAssignment.id,
          snippet: 'function test() { return true; }'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.snippet).toBe('function test() { return true; }');
      expect(res.body.completed).toBe(false);
    });

    it('should reject submission without snippet', async () => {
      const res = await request(app)
        .post('/api/v1/submissions')
        .set('Authorization', `Bearer ${menteeToken}`)
        .send({
          assignment_id: testAssignment.id
        });

      expect(res.status).toBe(400);
    });

    it('should reject submission by mentor', async () => {
      const res = await request(app)
        .post('/api/v1/submissions')
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({
          assignment_id: testAssignment.id,
          snippet: 'console.log("test");'
        });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/v1/submissions/mine', () => {
    it('should list mentee submissions', async () => {
      const res = await request(app)
        .get('/api/v1/submissions/mine')
        .set('Authorization', `Bearer ${menteeToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('snippet');
    });

    it('should reject listing for mentor', async () => {
      const res = await request(app)
        .get('/api/v1/submissions/mine')
        .set('Authorization', `Bearer ${mentorToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/v1/submissions/:assignmentId', () => {
    it('should list assignment submissions for mentor', async () => {
      const res = await request(app)
        .get(`/api/v1/submissions/${testAssignment.id}`)
        .set('Authorization', `Bearer ${mentorToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('snippet');
    });

    it('should reject listing for mentee', async () => {
      const res = await request(app)
        .get(`/api/v1/submissions/${testAssignment.id}`)
        .set('Authorization', `Bearer ${menteeToken}`);

      expect(res.status).toBe(403);
    });

    it('should reject listing for unrelated mentor', async () => {
      const otherMentor = await createTestUser('other@test.com', 'MENTOR');
      const otherToken = createTestToken(otherMentor);

      const res = await request(app)
        .get(`/api/v1/submissions/${testAssignment.id}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /api/v1/submissions/:id/complete', () => {
    it('should toggle completion status as mentor', async () => {
      const res = await request(app)
        .patch(`/api/v1/submissions/${testSubmission.id}/complete`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({ completed: true });

      expect(res.status).toBe(200);
      expect(res.body.completed).toBe(true);

      // Verify in database
      const [updated] = await db
        .select()
        .from(submissions)
        .where(eq(submissions.id, testSubmission.id))
        .limit(1);
      expect(updated.completed).toBe(true);
    });

    it('should reject completion toggle by mentee', async () => {
      const res = await request(app)
        .patch(`/api/v1/submissions/${testSubmission.id}/complete`)
        .set('Authorization', `Bearer ${menteeToken}`)
        .send({ completed: true });

      expect(res.status).toBe(403);
    });

    it('should reject completion toggle by unrelated mentor', async () => {
      const otherMentor = await createTestUser('other@test.com', 'MENTOR');
      const otherToken = createTestToken(otherMentor);

      const res = await request(app)
        .patch(`/api/v1/submissions/${testSubmission.id}/complete`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ completed: true });

      expect(res.status).toBe(403);
    });
  });
}); 