const request = require('supertest');
const { eq } = require('drizzle-orm');
const app = require('../app');
const db = require('../config/database');
const { users, assignments, submissions, comments, resources } = require('../models');
const { createTestUser, createTestToken } = require('./helpers');

const API_PREFIX = '/api/v1';

describe('Comments API', () => {
  let mentor;
  let mentee;
  let mentorToken;
  let menteeToken;
  let testAssignment;
  let testSubmission;
  let testComment;

  async function cleanupTestData() {
    // Delete in correct order to handle foreign key constraints
    await db.delete(comments).where(true);
    await db.delete(submissions).where(true);
    await db.delete(resources).where(true);
    await db.delete(assignments).where(true);
    await db.delete(users).where(true);
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  beforeAll(async () => {
    // Clean up any existing test data
    await cleanupTestData();

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

    // Create a test comment
    [testComment] = await db.insert(comments).values({
      submission_id: testSubmission.id,
      mentor_id: mentor.id,
      line_number: 1,
      comment: 'Good start!'
    }).returning();
  });

  afterAll(async () => {
    await cleanupTestData();
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  describe('POST /comments', () => {
    it('should create comment as mentor', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/comments`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({
          submission_id: testSubmission.id,
          line_number: 1,
          comment: 'Consider using const instead.'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.comment).toBe('Consider using const instead.');
      expect(res.body.line_number).toBe(1);
    });

    it('should reject comment without required fields', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/comments`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({
          submission_id: testSubmission.id
        });

      expect(res.status).toBe(400);
    });

    it('should reject comment by mentee', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/comments`)
        .set('Authorization', `Bearer ${menteeToken}`)
        .send({
          submission_id: testSubmission.id,
          line_number: 1,
          comment: 'Test comment'
        });

      expect(res.status).toBe(403);
    });

    it('should reject comment on unrelated submission', async () => {
      const otherMentor = await createTestUser('other@test.com', 'MENTOR');
      const otherToken = createTestToken(otherMentor);

      const res = await request(app)
        .post(`${API_PREFIX}/comments`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          submission_id: testSubmission.id,
          line_number: 1,
          comment: 'Test comment'
        });

      expect(res.status).toBe(403);

      // Clean up other mentor
      await db.delete(users).where(eq(users.email, 'other@test.com'));
    });
  });

  describe('GET /comments/:submissionId', () => {
    it('should list comments as mentor', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/comments/${testSubmission.id}`)
        .set('Authorization', `Bearer ${mentorToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('comment');
      expect(res.body[0]).toHaveProperty('line_number');
    });

    it('should list comments as mentee', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/comments/${testSubmission.id}`)
        .set('Authorization', `Bearer ${menteeToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should reject listing for unrelated user', async () => {
      const otherMentor = await createTestUser('other@test.com', 'MENTOR');
      const otherToken = createTestToken(otherMentor);

      const res = await request(app)
        .get(`${API_PREFIX}/comments/${testSubmission.id}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.status).toBe(403);

      // Clean up other mentor
      await db.delete(users).where(eq(users.email, 'other@test.com'));
    });
  });
}); 