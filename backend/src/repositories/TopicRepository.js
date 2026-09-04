import { BaseRepository } from './BaseRepository.js';
import { Topic } from '../models/index.js';

export class TopicRepository extends BaseRepository {
  constructor() {
    super(Topic);
  }

  async findBySlug(slug, options = {}) {
    return this.findOne({ slug: slug.toLowerCase(), ...options.filter }, options);
  }

  async findPublished(options = {}) {
    return this.find({ status: 'published' }, { sort: { order: 1 }, ...options });
  }

  async findAllPublished(options = {}) {
    const { select, populate } = options;
    let query = this.model.find({ status: 'published' }).sort({ order: 1 });
    if (select) query = query.select(select);
    if (populate) query = query.populate(populate);
    return query.lean().exec();
  }

  async findPublishedBySlug(slug, options = {}) {
    let query = this.model.findOne({ slug: slug.toLowerCase(), status: 'published' });
    if (options.populate) query = query.populate(options.populate);
    return query.lean().exec();
  }

  async findByCategory(category, options = {}) {
    return this.find(
      { category, status: 'published' },
      { sort: { order: 1 }, ...options }
    );
  }

  async search(query, options = {}) {
    return this.find(
      { $text: { $search: query }, status: 'published' },
      { sort: { score: { $meta: 'textScore' } }, ...options }
    );
  }

  async findPublishedIdsMatching(term) {
    if (!term?.trim()) return [];

    const regex = new RegExp(term.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const topics = await this.model
      .find({ status: 'published', $or: [{ slug: regex }, { title: regex }] }, { _id: 1 })
      .lean()
      .exec();

    return topics.map((topic) => topic._id);
  }
}

export default new TopicRepository();
