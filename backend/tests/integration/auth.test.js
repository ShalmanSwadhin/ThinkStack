import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../../src/app.js';
import { User } from '../../src/models/index.js';
import { connectTestDB, disconnectTestDB, describeIfDb } from '../helpers/db.js';

describeIfDb('Auth API', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await User.deleteMany({ email: /authtest/ });
  });

  const makeUser = (suffix = '') => ({
    username: `authtest_user${suffix}`,
    email: `authtest${suffix}@example.com`,
    password: 'TestPass1',
  });

  it('registers a new user', async () => {
    const testUser = makeUser('_reg');
    const res = await request(app).post('/api/v1/auth/register').send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('rejects duplicate email on register', async () => {
    const testUser = makeUser('_dup');
    await request(app).post('/api/v1/auth/register').send(testUser);
    const res = await request(app).post('/api/v1/auth/register').send({
      ...testUser,
      username: 'other_user',
    });

    expect(res.status).toBe(409);
  });

  it('logs in with valid credentials', async () => {
    const testUser = makeUser('_login');
    await request(app).post('/api/v1/auth/register').send(testUser);

    const res = await request(app).post('/api/v1/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.username).toBe(testUser.username);
  });

  it('rejects invalid login credentials', async () => {
    const testUser = makeUser('_badlogin');
    const passwordHash = await bcrypt.hash(testUser.password, 12);
    await User.create({
      username: testUser.username,
      email: testUser.email,
      passwordHash,
    });

    const res = await request(app).post('/api/v1/auth/login').send({
      email: testUser.email,
      password: 'WrongPass1',
    });

    expect(res.status).toBe(401);
  });

  it('refreshes token with valid cookie', async () => {
    const testUser = makeUser('_refresh');
    const agent = request.agent(app);
    const registerRes = await agent.post('/api/v1/auth/register').send(testUser);
    expect(registerRes.status).toBe(201);

    const refreshRes = await agent.post('/api/v1/auth/refresh');
    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.data.accessToken).toBeDefined();
  });

  it('returns current user from /me', async () => {
    const testUser = makeUser('_me');
    const agent = request.agent(app);
    const registerRes = await agent.post('/api/v1/auth/register').send(testUser);
    const token = registerRes.body.data.accessToken;

    const meRes = await agent.get('/api/v1/auth/me').set('Authorization', `Bearer ${token}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.data.email).toBe(testUser.email);
  });

  it('logs out and invalidates refresh token', async () => {
    const testUser = makeUser('_logout');
    const agent = request.agent(app);
    await agent.post('/api/v1/auth/register').send(testUser);

    const logoutRes = await agent.post('/api/v1/auth/logout');
    expect(logoutRes.status).toBe(200);

    const refreshRes = await agent.post('/api/v1/auth/refresh');
    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.data.authenticated).toBe(false);
  });

  it('logs in again after logout with same credentials', async () => {
    const testUser = makeUser('_relogin');
    const agent = request.agent(app);
    await agent.post('/api/v1/auth/register').send(testUser);

    const logoutRes = await agent.post('/api/v1/auth/logout');
    expect(logoutRes.status).toBe(200);

    const loginRes = await agent.post('/api/v1/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data.accessToken).toBeDefined();
    expect(loginRes.body.data.user.email).toBe(testUser.email);
  });

  it('handles forgot password for existing user', async () => {
    const testUser = makeUser('_forgot');
    const passwordHash = await bcrypt.hash(testUser.password, 12);
    await User.create({
      username: testUser.username,
      email: testUser.email,
      passwordHash,
    });

    const res = await request(app).post('/api/v1/auth/forgot-password').send({
      email: testUser.email,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
