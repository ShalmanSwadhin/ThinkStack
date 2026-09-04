import mongoose from 'mongoose';
import bookmarkRepository from '../repositories/BookmarkRepository.js';
import topicRepository from '../repositories/TopicRepository.js';
import problemRepository from '../repositories/ProblemRepository.js';
import quizRepository from '../repositories/QuizRepository.js';
import { BOOKMARK_TYPES } from '../models/Bookmark.model.js';
import AppError from '../utils/AppError.js';

const formatTopicBookmark = (bookmark, topic) => ({
  id: bookmark._id.toString(),
  targetType: 'topic',
  targetId: topic._id.toString(),
  title: topic.title,
  subtitle: topic.category,
  href: `/learn/${topic.slug}`,
  createdAt: bookmark.createdAt,
});

const formatProblemBookmark = (bookmark, problem) => ({
  id: bookmark._id.toString(),
  targetType: 'problem',
  targetId: problem._id.toString(),
  title: problem.title,
  subtitle: problem.difficulty,
  href: `/problems/${problem.slug}`,
  createdAt: bookmark.createdAt,
});

const formatQuizBookmark = (bookmark, quiz) => ({
  id: bookmark._id.toString(),
  targetType: 'quiz',
  targetId: quiz._id.toString(),
  title: quiz.title,
  subtitle: quiz.topicId?.title ?? (typeof quiz.topicId === 'object' ? quiz.topicId?.title : 'Quiz'),
  href: `/quizzes/${quiz._id.toString()}`,
  createdAt: bookmark.createdAt,
});

const resolveTarget = async (targetType, { targetId, targetSlug }) => {
  if (!BOOKMARK_TYPES.includes(targetType)) {
    throw new AppError('Invalid bookmark type', 400);
  }

  if (targetId) {
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      throw new AppError('Invalid target ID', 400);
    }

    if (targetType === 'topic') {
      const topic = await topicRepository.findById(targetId);
      if (!topic || topic.status !== 'published') throw new AppError('Topic not found', 404);
      return { targetId: topic._id, entity: topic };
    }

    if (targetType === 'problem') {
      const problem = await problemRepository.findById(targetId);
      if (!problem || problem.status !== 'published') throw new AppError('Problem not found', 404);
      return { targetId: problem._id, entity: problem };
    }

    const quiz = await quizRepository.findPublishedById(targetId);
    if (!quiz) throw new AppError('Quiz not found', 404);
    return { targetId: quiz._id, entity: quiz };
  }

  if (targetSlug) {
    if (targetType === 'topic') {
      const topic = await topicRepository.findPublishedBySlug(targetSlug);
      if (!topic) throw new AppError('Topic not found', 404);
      return { targetId: topic._id, entity: topic };
    }

    if (targetType === 'problem') {
      const problem = await problemRepository.findBySlug(targetSlug);
      if (!problem || problem.status !== 'published') throw new AppError('Problem not found', 404);
      return { targetId: problem._id, entity: problem };
    }

    throw new AppError('Quiz bookmarks require targetId', 400);
  }

  throw new AppError('targetId or targetSlug is required', 400);
};

export class BookmarksService {
  async listBookmarks(userId, { page = 1, limit = 50, targetType } = {}) {
    const filter = { userId };
    if (targetType) filter.targetType = targetType;

    const { data, meta } = await bookmarkRepository.find(filter, {
      page,
      limit,
      sort: { createdAt: -1 },
      lean: true,
    });

    const bookmarks = await Promise.all(
      data.map(async (bookmark) => {
        if (bookmark.targetType === 'topic') {
          const topic = await topicRepository.findById(bookmark.targetId);
          return topic ? formatTopicBookmark(bookmark, topic) : null;
        }
        if (bookmark.targetType === 'problem') {
          const problem = await problemRepository.findById(bookmark.targetId);
          return problem ? formatProblemBookmark(bookmark, problem) : null;
        }
        const quiz = await quizRepository.findPublishedById(bookmark.targetId, {
          populate: 'topicId',
        });
        return quiz ? formatQuizBookmark(bookmark, quiz) : null;
      })
    );

    return {
      bookmarks: bookmarks.filter(Boolean),
      meta,
    };
  }

  async addBookmark(userId, payload) {
    const { targetType, targetId, targetSlug } = payload;
    const resolved = await resolveTarget(targetType, { targetId, targetSlug });

    const existing = await bookmarkRepository.findByUserAndTarget(
      userId,
      targetType,
      resolved.targetId
    );
    if (existing) {
      throw new AppError('Already bookmarked', 409);
    }

    const bookmark = await bookmarkRepository.create({
      userId,
      targetType,
      targetId: resolved.targetId,
    });

    if (targetType === 'topic') {
      return formatTopicBookmark(bookmark, resolved.entity);
    }
    if (targetType === 'problem') {
      return formatProblemBookmark(bookmark, resolved.entity);
    }
    return formatQuizBookmark(bookmark, resolved.entity);
  }

  async removeBookmark(userId, { bookmarkId, targetType, targetId, targetSlug }) {
    if (bookmarkId) {
      if (!mongoose.Types.ObjectId.isValid(bookmarkId)) {
        throw new AppError('Invalid bookmark ID', 400);
      }
      const bookmark = await bookmarkRepository.findById(bookmarkId);
      if (!bookmark || bookmark.userId.toString() !== userId) {
        throw new AppError('Bookmark not found', 404);
      }
      await bookmarkRepository.deleteById(bookmarkId);
      return { success: true };
    }

    const resolved = await resolveTarget(targetType, { targetId, targetSlug });
    const deleted = await bookmarkRepository.deleteByUserAndTarget(
      userId,
      targetType,
      resolved.targetId
    );
    if (!deleted) {
      throw new AppError('Bookmark not found', 404);
    }
    return { success: true };
  }

  async getStatus(userId, { targetType, ids = [] }) {
    if (!BOOKMARK_TYPES.includes(targetType)) {
      throw new AppError('Invalid bookmark type', 400);
    }

    const objectIds = ids
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    if (!objectIds.length) {
      return { bookmarkedIds: [] };
    }

    const bookmarks = await bookmarkRepository.model
      .find({ userId, targetType, targetId: { $in: objectIds } })
      .select('targetId')
      .lean()
      .exec();

    return {
      bookmarkedIds: bookmarks.map((item) => item.targetId.toString()),
    };
  }
}

export default new BookmarksService();
