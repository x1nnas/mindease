import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../server';

describe('Auth Middleware', () => {
  const validToken = jwt.sign({ id: 'test-user-id' }, process.env.JWT_SECRET as string, {
    expiresIn: '7d',
  });

  describe('GET /api/protected', () => {
    it('should allow access with valid token', async () => {
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Protected route accessed successfully');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id', 'test-user-id');
    });

    it('should return 401 if no token is provided', async () => {
      const response = await request(app)
        .get('/api/protected');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Not authorized, no token');
    });

    it('should return 401 if Authorization header is missing', async () => {
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', '');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Not authorized, no token');
    });

    it('should return 401 if token does not start with "Bearer "', async () => {
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', validToken);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Not authorized, no token');
    });

    it('should return 403 if token is invalid', async () => {
      const invalidToken = 'invalid.token.here';
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'Invalid token');
    });

    it('should return 403 if token is expired', async () => {
      const expiredToken = jwt.sign({ id: 'test-user-id' }, process.env.JWT_SECRET as string, {
        expiresIn: '-1h',
      });

      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'Invalid token');
    });

    it('should return 403 if token is signed with wrong secret', async () => {
      const wrongSecretToken = jwt.sign({ id: 'test-user-id' }, 'wrong-secret', {
        expiresIn: '7d',
      });

      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', `Bearer ${wrongSecretToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'Invalid token');
    });

    it('should handle token with extra spaces', async () => {
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', `Bearer  ${validToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'Invalid token');
    });

    it('should extract user info from valid token', async () => {
      const customToken = jwt.sign(
        { id: 'custom-user-123', email: 'user@example.com' },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d' }
      );

      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', `Bearer ${customToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toHaveProperty('id', 'custom-user-123');
    });
  });
});
