import request from 'supertest';
import app from '../../src/app.js';
import { User, Note, Notification } from '../../src/models/index.js';
import { ROLES } from 'shared/constants';
import { connectTestDB, disconnectTestDB, describeIfDb } from '../helpers/db.js';

describeIfDb('Settings API', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await User.deleteMany({ email: /settingstest/ });
    await Note.deleteMany({ title: /settingstest/i });
    await Notification.deleteMany({});
  });

  const registerUser = async (suffix = '') => {
    const agent = request.agent(app);
    const payload = {
      username: `settingstest_user${suffix}`,
      email: `settingstest${suffix}@example.com`,
      password: 'TestPass1',
    };
    const res = await agent.post('/api/v1/auth/register').send(payload);
    return {
      agent,
      token: res.body.data.accessToken,
      userId: res.body.data.user.id,
      email: payload.email,
      password: payload.password,
    };
  };

  it('requires authentication', async () => {
    const res = await request(app).get('/api/v1/settings');
    expect(res.status).toBe(401);
  });

  it('returns settings for the current user', async () => {
    const { agent, token, email } = await registerUser('_get');

    const res = await agent.get('/api/v1/settings').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.account.email).toBe(email);
    expect(res.body.data.preferences.theme).toBeDefined();
    expect(res.body.data.profile).toBeDefined();
  });

  it('updates preferences including theme and editor settings', async () => {
    const { agent, token } = await registerUser('_prefs');

    const res = await agent
      .patch('/api/v1/settings/preferences')
      .set('Authorization', `Bearer ${token}`)
      .send({
        theme: 'dark',
        editorFontSize: 18,
        editorTabSize: 2,
        emailNotifications: false,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.preferences.theme).toBe('dark');
    expect(res.body.data.preferences.editorFontSize).toBe(18);
    expect(res.body.data.preferences.editorTabSize).toBe(2);
    expect(res.body.data.preferences.emailNotifications).toBe(false);
  });

  it('updates profile fields', async () => {
    const { agent, token } = await registerUser('_profile');

    const res = await agent
      .patch('/api/v1/settings/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        displayName: 'Settings Tester',
        bio: 'Learning DSA every day',
        github: 'https://github.com/tester',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.profile.displayName).toBe('Settings Tester');
    expect(res.body.data.profile.bio).toContain('DSA');
    expect(res.body.data.profile.github).toContain('github.com');
  });

  it('changes password with current password verification', async () => {
    const user = await registerUser('_password');

    const res = await user.agent
      .patch('/api/v1/settings/password')
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        currentPassword: user.password,
        newPassword: 'NewPass123',
      });

    expect(res.status).toBe(200);

    const loginOld = await user.agent.post('/api/v1/auth/login').send({
      email: user.email,
      password: user.password,
    });
    expect(loginOld.status).toBe(401);

    const loginNew = await user.agent.post('/api/v1/auth/login').send({
      email: user.email,
      password: 'NewPass123',
    });
    expect(loginNew.status).toBe(200);
  });

  it('deletes account and anonymizes user data', async () => {
    const user = await registerUser('_delete');

    await Note.create({
      userId: user.userId,
      title: 'settingstest private note',
      content: 'To be soft deleted',
    });

    await Notification.create({
      userId: user.userId,
      type: 'system',
      title: 'settingstest alert',
      message: 'Remove on delete',
    });

    const res = await user.agent
      .delete('/api/v1/settings/account')
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        password: user.password,
        confirmation: 'DELETE',
      });

    expect(res.status).toBe(200);

    const deletedUser = await User.findById(user.userId);
    expect(deletedUser.isActive).toBe(false);
    expect(deletedUser.email).toContain('deleted.thinkstack.local');

    const notes = await Note.countDocuments({ userId: user.userId, isDeleted: true });
    expect(notes).toBe(1);

    const notifications = await Notification.countDocuments({ userId: user.userId });
    expect(notifications).toBe(0);

    const loginRes = await user.agent.post('/api/v1/auth/login').send({
      email: user.email,
      password: user.password,
    });
    expect(loginRes.status).toBe(401);
  });

  it('blocks admin self-deletion', async () => {
    const user = await registerUser('_admin');
    await User.findByIdAndUpdate(user.userId, { role: ROLES.ADMIN });

    const res = await user.agent
      .delete('/api/v1/settings/account')
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        password: user.password,
        confirmation: 'DELETE',
      });

    expect(res.status).toBe(403);
  });
});
