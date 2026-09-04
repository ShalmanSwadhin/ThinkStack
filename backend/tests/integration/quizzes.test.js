import request from 'supertest';
import app from '../../src/app.js';
import { User, Topic, Quiz, QuizAttempt } from '../../src/models/index.js';
import { TOPIC_CATEGORIES, DIFFICULTY } from 'shared/constants';
import { buildQuizQuestions } from '../../src/seed/data/quizzes.js';
import { buildTopicContent } from '../../src/seed/data/topics.js';
import { connectTestDB, disconnectTestDB, describeIfDb } from '../helpers/db.js';

describeIfDb('Quizzes API', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await User.deleteMany({ email: /quiztest/ });
    await Topic.deleteMany({ slug: /quiztest/ });
    await Quiz.deleteMany({});
    await QuizAttempt.deleteMany({});
  });

  const registerUser = async (suffix = '') => {
    const agent = request.agent(app);
    const payload = {
      username: `quiztest_user${suffix}`,
      email: `quiztest${suffix}@example.com`,
      password: 'TestPass1',
    };
    const res = await agent.post('/api/v1/auth/register').send(payload);
    return { agent, token: res.body.data.accessToken, userId: res.body.data.user.id };
  };

  const seedQuiz = async () => {
    const topic = await Topic.create({
      slug: 'quiztest-arrays',
      title: 'Test Arrays',
      category: TOPIC_CATEGORIES.FUNDAMENTALS,
      difficulty: DIFFICULTY.BEGINNER,
      order: 1,
      status: 'published',
      content: buildTopicContent('Test Arrays'),
    });

    const questions = buildQuizQuestions('Test Arrays');

    const quiz = await Quiz.create({
      topicId: topic._id,
      title: 'Arrays Quiz',
      passingScore: 70,
      timeLimitMinutes: 15,
      questions,
      xpReward: 30,
      status: 'published',
    });

    return { topic, quiz, questionCount: questions.length };
  };

  it('requires authentication', async () => {
    const res = await request(app).get('/api/v1/quizzes');
    expect(res.status).toBe(401);
  });

  it('lists published quizzes with user progress', async () => {
    const { quiz, questionCount } = await seedQuiz();
    const { agent, token } = await registerUser('_list');

    const res = await agent.get('/api/v1/quizzes').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const item = res.body.data.quizzes.find((entry) => entry.id === quiz._id.toString());
    expect(item).toBeDefined();
    expect(item.questionCount).toBe(questionCount);
  });

  it('returns quiz without correct answers', async () => {
    const { quiz, questionCount } = await seedQuiz();
    const { agent, token } = await registerUser('_get');

    const res = await agent
      .get(`/api/v1/quizzes/${quiz._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.questions).toHaveLength(questionCount);
    expect(res.body.data.questions[0].correctIndex).toBeUndefined();
    expect(res.body.data.questions[0].explanation).toBeUndefined();
  });

  it('submits passing attempt with explanations and awards XP once', async () => {
    const { quiz } = await seedQuiz();
    const { agent, token, userId } = await registerUser('_pass');
    const answers = quiz.questions.map((question) => question.correctIndex);

    const first = await agent
      .post(`/api/v1/quizzes/${quiz._id}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .send({ answers, timeTakenSeconds: 120 });

    expect(first.status).toBe(200);
    expect(first.body.data.attempt.score).toBe(100);
    expect(first.body.data.attempt.passed).toBe(true);
    expect(first.body.data.results).toHaveLength(quiz.questions.length);
    expect(first.body.data.results[0].explanation).toBeTruthy();
    expect(first.body.data.xpAwarded).toBe(30);

    const user = await User.findById(userId);
    expect(user.stats.quizzesPassed).toBe(1);

    const second = await agent
      .post(`/api/v1/quizzes/${quiz._id}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .send({ answers, timeTakenSeconds: 90 });

    expect(second.body.data.xpAwarded).toBe(0);
  });

  it('returns failing score without XP', async () => {
    const { quiz } = await seedQuiz();
    const { agent, token } = await registerUser('_fail');
    const answers = quiz.questions.map(() => 3);

    const res = await agent
      .post(`/api/v1/quizzes/${quiz._id}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .send({ answers, timeTakenSeconds: 60 });

    expect(res.status).toBe(200);
    expect(res.body.data.attempt.passed).toBe(false);
    expect(res.body.data.xpAwarded).toBe(0);
    expect(res.body.data.results.some((item) => !item.isCorrect)).toBe(true);
  });

  it('filters quizzes by topic slug', async () => {
    const { topic, quiz } = await seedQuiz();
    const { agent, token } = await registerUser('_topic');

    const res = await agent
      .get(`/api/v1/quizzes?topic=${topic.slug}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.quizzes).toHaveLength(1);
    expect(res.body.data.quizzes[0].id).toBe(quiz._id.toString());
  });

  it('searches quizzes by partial topic or title match', async () => {
    const { quiz } = await seedQuiz();
    const { agent, token } = await registerUser('_search');

    const byTopic = await agent
      .get('/api/v1/quizzes?search=arrays')
      .set('Authorization', `Bearer ${token}`);

    expect(byTopic.status).toBe(200);
    expect(byTopic.body.data.quizzes.some((entry) => entry.id === quiz._id.toString())).toBe(true);

    const byTitle = await agent
      .get('/api/v1/quizzes?search=Arrays Quiz')
      .set('Authorization', `Bearer ${token}`);

    expect(byTitle.status).toBe(200);
    expect(byTitle.body.data.quizzes.some((entry) => entry.id === quiz._id.toString())).toBe(true);
  });

  it('lists attempt history', async () => {
    const { quiz } = await seedQuiz();
    const { agent, token } = await registerUser('_history');
    const answers = quiz.questions.map((question) => question.correctIndex);

    await agent
      .post(`/api/v1/quizzes/${quiz._id}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .send({ answers, timeTakenSeconds: 45 });

    const res = await agent
      .get(`/api/v1/quizzes/${quiz._id}/attempts`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.attempts).toHaveLength(1);
    expect(res.body.data.attempts[0].passed).toBe(true);
  });
});
