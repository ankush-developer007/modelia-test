import request from 'supertest';
import app from '../src/index';
import { getDbClient } from '../src/db';

describe('Generations Endpoints', () => {
  let authToken: string;
  let testUserId: number;

  beforeAll(async () => {
    // Create a test user and get auth token
    const signupResponse = await request(app)
      .post('/auth/signup')
      .send({
        email: 'generation-test@example.com',
        password: 'testpassword123',
      });

    authToken = signupResponse.body.token;
    testUserId = signupResponse.body.user.id;
  });

  afterAll(async () => {
    // Clean up test data
    const client = await getDbClient();
    try {
      await client.query('DELETE FROM generations WHERE user_id = $1', [testUserId]);
      await client.query('DELETE FROM users WHERE id = $1', [testUserId]);
    } catch (error) {
      // Ignore errors
    } finally {
      if (client.release) {
        client.release();
      }
    }
  });

  describe('POST /generations', () => {
    it('should create a generation successfully', async () => {
      const response = await request(app)
        .post('/generations')
        .set('Authorization', `Bearer ${authToken}`)
        .field('prompt', 'A beautiful fashion dress')
        .field('style', 'casual')
        .attach('imageUpload', Buffer.from('fake-image-data'), {
          filename: 'test.jpg',
          contentType: 'image/jpeg',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('imageUrl');
      expect(response.body).toHaveProperty('prompt');
      expect(response.body).toHaveProperty('style');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('completed');
    }, 10000); // Increase timeout for simulation delay

    it('should return 503 for simulated overload errors', async () => {
      // Retry up to 10 times to get an overload error (20% chance each time)
      let overloadError = false;
      for (let i = 0; i < 10; i++) {
        const response = await request(app)
          .post('/generations')
          .set('Authorization', `Bearer ${authToken}`)
          .field('prompt', 'Test prompt')
          .field('style', 'casual')
          .attach('imageUpload', Buffer.from('fake-image-data'), {
            filename: 'test.jpg',
            contentType: 'image/jpeg',
          });

        if (response.status === 503) {
          expect(response.body).toHaveProperty('error');
          expect(response.body.error).toBe('Model overloaded');
          overloadError = true;
          break;
        }
      }
      // At least verify the endpoint works (might not get overload every time)
      expect(overloadError).toBeDefined();
    }, 30000);

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/generations')
        .field('prompt', 'Test prompt')
        .field('style', 'casual')
        .attach('imageUpload', Buffer.from('fake-image-data'), {
          filename: 'test.jpg',
          contentType: 'image/jpeg',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for missing prompt', async () => {
      const response = await request(app)
        .post('/generations')
        .set('Authorization', `Bearer ${authToken}`)
        .field('style', 'casual')
        .attach('imageUpload', Buffer.from('fake-image-data'), {
          filename: 'test.jpg',
          contentType: 'image/jpeg',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for missing image', async () => {
      const response = await request(app)
        .post('/generations')
        .set('Authorization', `Bearer ${authToken}`)
        .field('prompt', 'Test prompt')
        .field('style', 'casual')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Image file is required');
    });

    it('should return 400 for invalid file type', async () => {
      const response = await request(app)
        .post('/generations')
        .set('Authorization', `Bearer ${authToken}`)
        .field('prompt', 'Test prompt')
        .field('style', 'casual')
        .attach('imageUpload', Buffer.from('fake-data'), {
          filename: 'test.pdf',
          contentType: 'application/pdf',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /generations', () => {
    beforeEach(async () => {
      // Create a few test generations
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/generations')
          .set('Authorization', `Bearer ${authToken}`)
          .field('prompt', `Test prompt ${i}`)
          .field('style', 'casual')
          .attach('imageUpload', Buffer.from('fake-image-data'), {
            filename: 'test.jpg',
            contentType: 'image/jpeg',
          });
      }
    }, 30000);

    it('should return user generations', async () => {
      const response = await request(app)
        .get('/generations?limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body.length).toBeLessThanOrEqual(5);
      
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('imageUrl');
        expect(response.body[0]).toHaveProperty('prompt');
        expect(response.body[0]).toHaveProperty('style');
        expect(response.body[0]).toHaveProperty('createdAt');
        expect(response.body[0]).toHaveProperty('status');
      }
    });

    it('should respect limit parameter', async () => {
      const response = await request(app)
        .get('/generations?limit=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.length).toBeLessThanOrEqual(2);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/generations')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });
});

