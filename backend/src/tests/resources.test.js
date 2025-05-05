const request = require('supertest');
const app = require('../app');
const db = require('../repos/db');
const { users, assignments, resources, submissions, comments } = require('../repos/schema/schema');
const { eq } = require('drizzle-orm');

const API_PREFIX = '/api/v1';

describe('Resource Endpoints', () => {
  let mentorToken;
  let mentorId;
  let menteeToken;
  let menteeId;
  let assignmentId;
  let resourceId;

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

  const testResource = {
    title: 'Test Resource',
    url: 'https://example.com/resource'
  };

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

    // Create test assignment
    const assignmentRes = await request(app)
      .post(`${API_PREFIX}/assignments`)
      .set('Authorization', `Bearer ${mentorToken}`)
      .send(testAssignment);
    assignmentId = assignmentRes.body.id;

    await new Promise(resolve => setTimeout(resolve, 100));
  });

  afterAll(async () => {
    await cleanupTestData();
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  describe('POST /resources', () => {
    it('should allow mentor to create standalone resource', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/resources`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .send(testResource)
        .expect(201);

      expect(res.body).toHaveProperty('title', testResource.title);
      expect(res.body).toHaveProperty('url', testResource.url);
      expect(res.body).toHaveProperty('mentor_id', mentorId);
      expect(res.body.assignment_id).toBeNull();

      resourceId = res.body.id;
    });

    it('should allow mentor to create assignment-linked resource', async () => {
      const linkedResource = {
        ...testResource,
        title: 'Linked Resource',
        assignment_id: assignmentId
      };

      const res = await request(app)
        .post(`${API_PREFIX}/resources`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .send(linkedResource)
        .expect(201);

      expect(res.body).toHaveProperty('title', linkedResource.title);
      expect(res.body).toHaveProperty('assignment_id', assignmentId);
    });

    it('should not allow mentee to create resource', async () => {
      await request(app)
        .post(`${API_PREFIX}/resources`)
        .set('Authorization', `Bearer ${menteeToken}`)
        .send(testResource)
        .expect(403);
    });

    it('should validate required fields', async () => {
      await request(app)
        .post(`${API_PREFIX}/resources`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({})
        .expect(400);
    });

    it('should validate URL format', async () => {
      await request(app)
        .post(`${API_PREFIX}/resources`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({
          title: 'Invalid URL',
          url: 'not-a-url'
        })
        .expect(400);
    });
  });

  describe('GET /resources', () => {
    it('should list mentor resources', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/resources`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('title');
      expect(res.body[0]).toHaveProperty('url');
    });

    it('should filter resources by assignment', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/resources?assignment_id=${assignmentId}`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.every(r => r.assignment_id === assignmentId)).toBe(true);
    });

    it('should not allow mentee to list all resources', async () => {
      await request(app)
        .get(`${API_PREFIX}/resources`)
        .set('Authorization', `Bearer ${menteeToken}`)
        .expect(403);
    });
  });

  describe('GET /resources/mine', () => {
    it('should list mentee resources', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/resources/mine`)
        .set('Authorization', `Bearer ${menteeToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should filter mentee resources by assignment', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/resources/mine?assignment_id=${assignmentId}`)
        .set('Authorization', `Bearer ${menteeToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.every(r => 
        r.assignment_id === assignmentId || r.assignment_id === null
      )).toBe(true);
    });

    it('should not allow mentor to view mentee resources', async () => {
      await request(app)
        .get(`${API_PREFIX}/resources/mine`)
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
        .get(`${API_PREFIX}/resources/mine`)
        .set('Authorization', `Bearer ${menteeRes.body.token}`)
        .expect(404);

      // Clean up
      await db.delete(users).where(eq(users.email, unassignedMentee.email));
    });
  });

  describe('GET /resources/:id', () => {
    it('should allow mentor to view their resource', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/resources/${resourceId}`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('title', testResource.title);
      expect(res.body).toHaveProperty('url', testResource.url);
    });

    it('should allow mentee to view mentor\'s resource', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/resources/${resourceId}`)
        .set('Authorization', `Bearer ${menteeToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('title', testResource.title);
    });

    it('should not allow access to other mentor\'s resource', async () => {
      // Create another mentor
      const otherMentor = {
        email: 'other.mentor@test.com',
        password: 'password123',
        role: 'MENTOR'
      };

      const mentorRes = await request(app)
        .post(`${API_PREFIX}/auth/signup`)
        .send(otherMentor);

      await request(app)
        .get(`${API_PREFIX}/resources/${resourceId}`)
        .set('Authorization', `Bearer ${mentorRes.body.token}`)
        .expect(403);

      // Clean up
      await db.delete(users).where(eq(users.email, otherMentor.email));
    });
  });

  describe('PUT /resources/:id', () => {
    it('should allow mentor to update their resource', async () => {
      const updates = {
        title: 'Updated Resource',
        url: 'https://example.com/updated'
      };

      const res = await request(app)
        .put(`${API_PREFIX}/resources/${resourceId}`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .send(updates)
        .expect(200);

      expect(res.body).toHaveProperty('title', updates.title);
      expect(res.body).toHaveProperty('url', updates.url);

      // Reset for other tests
      await request(app)
        .put(`${API_PREFIX}/resources/${resourceId}`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .send(testResource);
    });

    it('should allow updating assignment link', async () => {
      const updates = {
        ...testResource,
        assignment_id: assignmentId
      };

      const res = await request(app)
        .put(`${API_PREFIX}/resources/${resourceId}`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .send(updates)
        .expect(200);

      expect(res.body).toHaveProperty('assignment_id', assignmentId);

      // Reset for other tests
      await request(app)
        .put(`${API_PREFIX}/resources/${resourceId}`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .send(testResource);
    });

    it('should not allow mentee to update resource', async () => {
      await request(app)
        .put(`${API_PREFIX}/resources/${resourceId}`)
        .set('Authorization', `Bearer ${menteeToken}`)
        .send({ title: 'Unauthorized Update' })
        .expect(403);
    });

    it('should validate URL format on update', async () => {
      await request(app)
        .put(`${API_PREFIX}/resources/${resourceId}`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({
          ...testResource,
          url: 'not-a-url'
        })
        .expect(400);
    });
  });

  describe('DELETE /resources/:id', () => {
    it('should not allow mentee to delete resource', async () => {
      await request(app)
        .delete(`${API_PREFIX}/resources/${resourceId}`)
        .set('Authorization', `Bearer ${menteeToken}`)
        .expect(403);
    });

    it('should allow mentor to delete their resource', async () => {
      await request(app)
        .delete(`${API_PREFIX}/resources/${resourceId}`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .expect(200);

      // Verify resource is deleted
      await request(app)
        .get(`${API_PREFIX}/resources/${resourceId}`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .expect(404);
    });

    it('should return 404 for non-existent resource', async () => {
      await request(app)
        .delete(`${API_PREFIX}/resources/00000000-0000-0000-0000-000000000000`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .expect(404);
    });
  });
}); 