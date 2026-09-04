import { Topic, Problem, Note } from '../models/index.js';

export class SearchRepository {
  async searchTopics(query, limit = 8) {
    return Topic.find(
      { $text: { $search: query }, status: 'published' },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .select('slug title category difficulty tags')
      .lean()
      .exec();
  }

  async searchProblems(query, limit = 8) {
    return Problem.find(
      { $text: { $search: query }, status: 'published' },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .select('slug title difficulty tags topicSlugs acceptanceRate')
      .lean()
      .exec();
  }

  async searchNotes(userId, query, limit = 8) {
    return Note.find(
      {
        userId,
        isDeleted: false,
        $text: { $search: query },
      },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .select('title tags topicId problemId updatedAt')
      .populate('topicId', 'slug title')
      .populate('problemId', 'slug title')
      .lean()
      .exec();
  }
}

export default new SearchRepository();
