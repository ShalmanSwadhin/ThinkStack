import { connectTestDB, disconnectTestDB, clearTestDB, describeIfDb } from '../helpers/db.js';
import topicRepository from '../../src/repositories/TopicRepository.js';
import { Topic } from '../../src/models/index.js';
import { TOPIC_CATEGORIES, DIFFICULTY } from 'shared/constants';

describeIfDb('TopicRepository', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  it('finds topic by slug', async () => {
    await Topic.create({
      slug: 'arrays',
      title: 'Arrays',
      category: TOPIC_CATEGORIES.FUNDAMENTALS,
      difficulty: DIFFICULTY.BEGINNER,
      order: 1,
      status: 'published',
    });

    const topic = await topicRepository.findBySlug('arrays');
    expect(topic.title).toBe('Arrays');
  });

  it('finds published topics with pagination', async () => {
    await Topic.create([
      {
        slug: 'arrays',
        title: 'Arrays',
        category: TOPIC_CATEGORIES.FUNDAMENTALS,
        difficulty: DIFFICULTY.BEGINNER,
        order: 1,
        status: 'published',
      },
      {
        slug: 'draft-topic',
        title: 'Draft',
        category: TOPIC_CATEGORIES.FUNDAMENTALS,
        difficulty: DIFFICULTY.BEGINNER,
        order: 2,
        status: 'draft',
      },
    ]);

    const { data, meta } = await topicRepository.findPublished();
    expect(data).toHaveLength(1);
    expect(meta.total).toBe(1);
  });

  it('finds topics by category', async () => {
    await Topic.create([
      {
        slug: 'graphs',
        title: 'Graphs',
        category: TOPIC_CATEGORIES.GRAPHS,
        difficulty: DIFFICULTY.INTERMEDIATE,
        order: 1,
        status: 'published',
      },
      {
        slug: 'arrays',
        title: 'Arrays',
        category: TOPIC_CATEGORIES.FUNDAMENTALS,
        difficulty: DIFFICULTY.BEGINNER,
        order: 1,
        status: 'published',
      },
    ]);

    const { data } = await topicRepository.findByCategory(TOPIC_CATEGORIES.GRAPHS);
    expect(data).toHaveLength(1);
    expect(data[0].slug).toBe('graphs');
  });
});
