import request from 'supertest';
import app from '../../src/app.js';
import { User, Topic, Problem, AITutorConversation } from '../../src/models/index.js';
import { TOPIC_CATEGORIES, DIFFICULTY } from 'shared/constants';
import { buildTopicContent } from '../../src/seed/data/topics.js';
import { connectTestDB, disconnectTestDB, describeIfDb } from '../helpers/db.js';

describeIfDb('AI Tutor API', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await User.deleteMany({ email: /aitest/ });
    await Topic.deleteMany({ slug: /aitest/ });
    await Problem.deleteMany({ slug: /aitest/ });
    await AITutorConversation.deleteMany({});
  });

  const registerUser = async (suffix = '') => {
    const agent = request.agent(app);
    const payload = {
      username: `aitest_user${suffix}`,
      email: `aitest${suffix}@example.com`,
      password: 'TestPass1',
    };
    const res = await agent.post('/api/v1/auth/register').send(payload);
    return { agent, token: res.body.data.accessToken, userId: res.body.data.user.id };
  };

  it('requires authentication', async () => {
    const res = await request(app).post('/api/v1/ai/chat').send({ message: 'Hello' });
    expect(res.status).toBe(401);
  });

  it('sends a chat message and creates a conversation (mock Gemini)', async () => {
    const { agent, token } = await registerUser('_chat');

    const res = await agent
      .post('/api/v1/ai/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'Explain arrays in simple terms' });

    expect(res.status).toBe(200);
    expect(res.body.data.conversationId).toBeTruthy();
    expect(res.body.data.reply.role).toBe('assistant');
    expect(res.body.data.reply.content).toContain('Mock AI mode');
    expect(res.body.data.mockMode).toBe(true);

    const conversation = await AITutorConversation.findById(res.body.data.conversationId);
    expect(conversation.messages).toHaveLength(2);
  });

  it('continues an existing conversation with history', async () => {
    const { agent, token } = await registerUser('_history');

    const first = await agent
      .post('/api/v1/ai/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'What is a stack?' });

    const second = await agent
      .post('/api/v1/ai/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({
        conversationId: first.body.data.conversationId,
        message: 'Give me an example use case',
      });

    expect(second.status).toBe(200);
    expect(second.body.data.conversationId).toBe(first.body.data.conversationId);

    const conversation = await AITutorConversation.findById(first.body.data.conversationId);
    expect(conversation.messages).toHaveLength(4);
  });

  it('lists and deletes conversations', async () => {
    const { agent, token } = await registerUser('_list');

    const chat = await agent
      .post('/api/v1/ai/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'Help me with binary search' });

    const list = await agent
      .get('/api/v1/ai/conversations')
      .set('Authorization', `Bearer ${token}`);

    expect(list.status).toBe(200);
    expect(list.body.data.conversations).toHaveLength(1);

    const detail = await agent
      .get(`/api/v1/ai/conversations/${chat.body.data.conversationId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(detail.status).toBe(200);
    expect(detail.body.data.messages).toHaveLength(2);

    const deleted = await agent
      .delete(`/api/v1/ai/conversations/${chat.body.data.conversationId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleted.status).toBe(200);

    const afterList = await agent
      .get('/api/v1/ai/conversations')
      .set('Authorization', `Bearer ${token}`);

    expect(afterList.body.data.conversations).toHaveLength(0);
  });

  it('injects topic context into mock response', async () => {
    await Topic.create({
      slug: 'aitest-arrays',
      title: 'Test Arrays Topic',
      category: TOPIC_CATEGORIES.FUNDAMENTALS,
      difficulty: DIFFICULTY.BEGINNER,
      order: 1,
      status: 'published',
      content: buildTopicContent('Test Arrays Topic'),
    });

    const { agent, token } = await registerUser('_context');

    const res = await agent
      .post('/api/v1/ai/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({
        message: 'Summarize this topic for me',
        context: { topicSlug: 'aitest-arrays' },
      });

    expect(res.status).toBe(200);
    expect(res.body.data.reply.content).toContain('Test Arrays Topic');
    expect(res.body.data.reply.content).toContain('Mock AI mode');
  });

  it('rejects empty messages', async () => {
    const { agent, token } = await registerUser('_empty');

    const res = await agent
      .post('/api/v1/ai/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({ message: '   ' });

    expect(res.status).toBe(400);
  });
});
