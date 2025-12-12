import request from 'supertest';
import bcrypt from 'bcrypt';
import User from '../models/User';
import app from '../server';

describe('Auth Routes', () => {
  const validEmail = 'test@example.com';
  const validPassword = 'password123';

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: validEmail,
          password: validPassword,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', validEmail);
      expect(response.body.user).toHaveProperty('id');

      const user = await User.findOne({ email: validEmail });
      expect(user).toBeTruthy();
      expect(user?.email).toBe(validEmail.toLowerCase());
    });

    it('should return 400 if email is missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          password: validPassword,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Email and password are required');
    });

    it('should return 400 if password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: validEmail,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Email and password are required');
    });

    it('should return 400 if email format is invalid', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: validPassword,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Invalid email format');
    });

    it('should return 400 if password is too short', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: validEmail,
          password: '12345',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Password must be at least 6 characters long');
    });

    it('should return 409 if user already exists', async () => {
      await User.create({
        email: validEmail.toLowerCase(),
        password: 'hashedpassword',
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: validEmail,
          password: validPassword,
        });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('message', 'User already exists');
    });

    it('should normalize email to lowercase', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'TEST@EXAMPLE.COM',
          password: validPassword,
        });

      expect(response.status).toBe(201);
      expect(response.body.user.email).toBe('test@example.com');

      const user = await User.findOne({ email: 'test@example.com' });
      expect(user).toBeTruthy();
    });

    it('should trim email whitespace', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: '  test@example.com  ',
          password: validPassword,
        });

      expect(response.status).toBe(201);
      expect(response.body.user.email).toBe('test@example.com');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash(validPassword, 10);
      await User.create({
        email: validEmail.toLowerCase(),
        password: hashedPassword,
      });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: validEmail,
          password: validPassword,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', validEmail.toLowerCase());
      expect(response.body.user).toHaveProperty('id');
    });

    it('should return 400 if email is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: validPassword,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Email and password are required');
    });

    it('should return 400 if password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: validEmail,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Email and password are required');
    });

    it('should return 401 if user does not exist', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: validPassword,
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid email or password');
    });

    it('should return 401 if password is incorrect', async () => {
      const hashedPassword = await bcrypt.hash(validPassword, 10);
      await User.create({
        email: 'test2@example.com',
        password: hashedPassword,
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test2@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid email or password');
    });

    it('should normalize email to lowercase for login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'TEST@EXAMPLE.COM',
          password: validPassword,
        });

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe(validEmail.toLowerCase());
    });
  });
});
