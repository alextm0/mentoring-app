const request = require('supertest');
const app = require('../app');
const db = require('../repos/db');
const { users, assignments, resources, submissions, comments } = require('../repos/schema/schema');
const { eq } = require('drizzle-orm');

const API_PREFIX = '/api/v1';

describe('Mentor Endpoints', () => {
  let mentorToken;
  let mentorId;
  let menteeToken;
  let menteeId;
  let otherMentorToken;
  let otherMentorId;

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

  const otherMentorUser = {
    email: 'othermentor@test.com',
    password: 'password123',
    role: 'MENTOR'
  };

  async function cleanupTestData() {
    // Delete in correct order to handle foreign key constraints
    await db.delete(comments).where(true);
    await db.delete(submissions).where(true);
    await db.delete(resources).where(true);
    await db.delete(assignments).where(true);
    await db.delete(users).where(eq(users.email, menteeUser.email));
    await db.delete(users).where(eq(users.email, mentorUser.email));
    await db.delete(users).where(eq(users.email, otherMentorUser.email));
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

    // Create other mentor
    const otherMentorRes = await request(app)
      .post(`${API_PREFIX}/auth/signup`)
      .send(otherMentorUser);
    otherMentorToken = otherMentorRes.body.token;
    otherMentorId = otherMentorRes.body.user.id;

    // Create mentee
    const menteeRes = await request(app)
      .post(`${API_PREFIX}/auth/signup`)
      .send(menteeUser);
    menteeToken = menteeRes.body.token;
    menteeId = menteeRes.body.user.id;

    await new Promise(resolve => setTimeout(resolve, 100));
  });

  afterAll(async () => {
    await cleanupTestData();
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  describe('POST /mentors/:mentorId/mentees', () => {
    it('should allow mentor to attach a mentee', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/mentors/${mentorId}/mentees`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({ menteeId })
        .expect(200);

      expect(res.body.mentee).toHaveProperty('mentor_id', mentorId);
    });

    it('should not allow mentor to attach already attached mentee', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/mentors/${mentorId}/mentees`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({ menteeId })
        .expect(400);

      expect(res.body).toHaveProperty('message', 'Mentee already has a mentor');
    });

    it('should not allow mentor to attach to other mentor\'s ID', async () => {
      await request(app)
        .post(`${API_PREFIX}/mentors/${otherMentorId}/mentees`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({ menteeId })
        .expect(403);
    });
  });

  describe('GET /mentors/:mentorId/mentees', () => {
    it('should allow mentor to view their mentees', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/mentors/${mentorId}/mentees`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).toHaveProperty('email', menteeUser.email);
    });

    it('should not allow mentor to view other mentor\'s mentees', async () => {
      await request(app)
        .get(`${API_PREFIX}/mentors/${otherMentorId}/mentees`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .expect(403);
    });
  });

  describe('DELETE /mentors/:mentorId/mentees/:menteeId', () => {
    it('should allow mentor to detach their mentee', async () => {
      const res = await request(app)
        .delete(`${API_PREFIX}/mentors/${mentorId}/mentees/${menteeId}`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('message', 'Mentee detached successfully');

      // Verify mentee is detached
      const [mentee] = await db
        .select()
        .from(users)
        .where(eq(users.id, menteeId))
        .limit(1);
      
      expect(mentee.mentor_id).toBeNull();
    });

    it('should not allow mentor to detach non-existent mentee', async () => {
      await request(app)
        .delete(`${API_PREFIX}/mentors/${mentorId}/mentees/${menteeId}`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .expect(404);
    });
  });
}); 