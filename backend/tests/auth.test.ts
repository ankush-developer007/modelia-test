import request from 'supertest';
import app from '../src/index';
import { getDbClient } from '../src/db';

describe('Auth Endpoints', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'testpassword123',
  };

  beforeEach(async () => {
    // Clean up test data before each test
    const client = await getDbClient();
    try {
      await client.query('DELETE FROM users WHERE email = $1', [testUser.email]);
    } catch (error) {
      // Ignore if table doesn't exist yet
    } finally {
      if (client.release) {
        client.release();
      }
    }
  });

  describe('POST /auth/signup', () => {
    it('should create a new user successfully', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body).not.toHaveProperty('user.password_hash');
    });

    it('should return 409 if user already exists', async () => {
      // Create user first
      await request(app).post('/auth/signup').send(testUser);

      // Try to create again
      const response = await request(app)
        .post('/auth/signup')
        .send(testUser)
        .expect(409);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('already exists');
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .send({
          email: 'invalid-email',
          password: testUser.password,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('details');
    });

    it('should return 400 for short password', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .send({
          email: testUser.email,
          password: '123',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('details');
    });

    it('should return 400 for missing fields', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .send({ email: testUser.email })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Create a user for login tests
      await request(app).post('/auth/signup').send(testUser);
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send(testUser)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('should return 401 for invalid email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password,
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid email or password');
    });

    it('should return 401 for invalid password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid email or password');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'invalid-email',
          password: testUser.password,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for missing password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});

