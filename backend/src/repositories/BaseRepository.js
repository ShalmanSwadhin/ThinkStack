/**
 * Generic repository base class wrapping Mongoose models
 */
export class BaseRepository {
  /**
   * @param {import('mongoose').Model} model
   */
  constructor(model) {
    this.model = model;
  }

  async findById(id, options = {}) {
    let query = this.model.findById(id);
    if (options.select) query = query.select(options.select);
    if (options.populate) query = query.populate(options.populate);
    return query.lean(options.lean ?? false).exec();
  }

  async findOne(filter, options = {}) {
    let query = this.model.findOne(filter);
    if (options.select) query = query.select(options.select);
    if (options.populate) query = query.populate(options.populate);
    return query.lean(options.lean ?? false).exec();
  }

  async find(filter = {}, options = {}) {
    const {
      page = 1,
      limit = 20,
      sort = { createdAt: -1 },
      select,
      populate,
      lean = true,
    } = options;

    const skip = (page - 1) * limit;

    let query = this.model.find(filter).sort(sort).skip(skip).limit(limit);
    if (select) query = query.select(select);
    if (populate) query = query.populate(populate);

    const [data, total] = await Promise.all([
      query.lean(lean).exec(),
      this.model.countDocuments(filter),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async create(data) {
    const doc = await this.model.create(data);
    return doc.toObject ? doc.toObject() : doc;
  }

  async updateById(id, data, options = {}) {
    return this.model
      .findByIdAndUpdate(id, data, { new: true, runValidators: true, ...options })
      .lean()
      .exec();
  }

  async deleteById(id) {
    return this.model.findByIdAndDelete(id).lean().exec();
  }

  async count(filter = {}) {
    return this.model.countDocuments(filter);
  }

  async exists(filter) {
    return this.model.exists(filter);
  }
}

export default BaseRepository;
