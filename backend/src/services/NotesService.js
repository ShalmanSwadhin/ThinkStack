import mongoose from 'mongoose';
import noteRepository from '../repositories/NoteRepository.js';
import topicRepository from '../repositories/TopicRepository.js';
import problemRepository from '../repositories/ProblemRepository.js';
import AppError from '../utils/AppError.js';
import gamificationService from './GamificationService.js';

const populateOptions = {
  populate: [
    { path: 'topicId', select: 'slug title' },
    { path: 'problemId', select: 'slug title' },
  ],
};

const formatTopic = (topic) => {
  if (!topic) return null;
  return {
    id: topic._id.toString(),
    slug: topic.slug,
    title: topic.title,
  };
};

const formatProblem = (problem) => {
  if (!problem) return null;
  return {
    id: problem._id.toString(),
    slug: problem.slug,
    title: problem.title,
  };
};

const formatNote = (note) => ({
  id: note._id.toString(),
  title: note.title,
  content: note.content ?? '',
  tags: note.tags ?? [],
  topic: formatTopic(note.topicId),
  problem: formatProblem(note.problemId),
  createdAt: note.createdAt,
  updatedAt: note.updatedAt,
});

const normalizeTags = (tags) => {
  if (!tags) return undefined;
  if (!Array.isArray(tags)) {
    throw new AppError('Tags must be an array', 400);
  }
  return [...new Set(tags.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean))];
};

const resolveTopicLink = async ({ topicId, topicSlug }) => {
  if (topicId) {
    if (!mongoose.Types.ObjectId.isValid(topicId)) {
      throw new AppError('Invalid topic ID', 400);
    }
    const topic = await topicRepository.findById(topicId);
    if (!topic) throw new AppError('Topic not found', 404);
    return topic._id;
  }

  if (topicSlug) {
    const topic = await topicRepository.findPublishedBySlug(topicSlug);
    if (!topic) throw new AppError('Topic not found', 404);
    return topic._id;
  }

  return undefined;
};

const resolveProblemLink = async ({ problemId, problemSlug }) => {
  if (problemId) {
    if (!mongoose.Types.ObjectId.isValid(problemId)) {
      throw new AppError('Invalid problem ID', 400);
    }
    const problem = await problemRepository.findById(problemId);
    if (!problem) throw new AppError('Problem not found', 404);
    return problem._id;
  }

  if (problemSlug) {
    const problem = await problemRepository.findBySlug(problemSlug);
    if (!problem) throw new AppError('Problem not found', 404);
    return problem._id;
  }

  return undefined;
};

export class NotesService {
  async listNotes(userId, query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 20;
    const { search, topicId, problemId, topicSlug, problemSlug, tag } = query;

    const filter = {};

    if (topicId) {
      if (!mongoose.Types.ObjectId.isValid(topicId)) {
        throw new AppError('Invalid topic ID', 400);
      }
      filter.topicId = topicId;
    } else if (topicSlug?.trim()) {
      const topicIds = await topicRepository.findPublishedIdsMatching(topicSlug);
      if (!topicIds.length) {
        return { notes: [], meta: { page, limit, total: 0, pages: 1 } };
      }
      filter.topicId = topicIds.length === 1 ? topicIds[0] : { $in: topicIds };
    }

    if (problemId) {
      if (!mongoose.Types.ObjectId.isValid(problemId)) {
        throw new AppError('Invalid problem ID', 400);
      }
      filter.problemId = problemId;
    } else if (problemSlug) {
      const problem = await problemRepository.findBySlug(problemSlug);
      if (!problem) {
        return { notes: [], meta: { page, limit, total: 0, pages: 1 } };
      }
      filter.problemId = problem._id;
    }

    if (tag?.trim()) {
      filter.tags = tag.trim().toLowerCase();
    }

    let sort = { updatedAt: -1 };
    if (search?.trim()) {
      filter.$text = { $search: search.trim() };
      sort = { score: { $meta: 'textScore' } };
    }

    const { data, meta } = await noteRepository.findByUser(userId, filter, {
      page,
      limit,
      sort,
      ...populateOptions,
    });

    return {
      notes: data.map(formatNote),
      meta,
    };
  }

  async getNote(userId, id) {
    const note = await noteRepository.findByIdForUser(id, userId, populateOptions);
    if (!note) {
      throw new AppError('Note not found', 404);
    }
    return formatNote(note);
  }

  async createNote(userId, payload) {
    const topicId = await resolveTopicLink(payload);
    const problemId = await resolveProblemLink(payload);

    const note = await noteRepository.create({
      userId,
      title: payload.title,
      content: payload.content ?? '',
      tags: normalizeTags(payload.tags) ?? [],
      ...(topicId && { topicId }),
      ...(problemId && { problemId }),
    });

    const populated = await noteRepository.findById(note._id, populateOptions);
    await gamificationService.processActivity(userId, { activityType: 'note_created' });
    return formatNote(populated);
  }

  async updateNote(userId, id, updates) {
    const existing = await noteRepository.findByIdForUser(id, userId);
    if (!existing) {
      throw new AppError('Note not found', 404);
    }

    const data = {};
    if (updates.title != null) data.title = updates.title;
    if (updates.content != null) data.content = updates.content;
    if (updates.tags != null) data.tags = normalizeTags(updates.tags) ?? [];

    if (
      updates.topicId !== undefined ||
      updates.topicSlug !== undefined ||
      updates.unlinkTopic
    ) {
      if (updates.unlinkTopic) {
        data.topicId = null;
      } else {
        data.topicId = await resolveTopicLink(updates);
      }
    }

    if (
      updates.problemId !== undefined ||
      updates.problemSlug !== undefined ||
      updates.unlinkProblem
    ) {
      if (updates.unlinkProblem) {
        data.problemId = null;
      } else {
        data.problemId = await resolveProblemLink(updates);
      }
    }

    await noteRepository.updateById(id, data);
    const note = await noteRepository.findByIdForUser(id, userId, populateOptions);
    return formatNote(note);
  }

  async deleteNote(userId, id) {
    const note = await noteRepository.softDelete(id, userId);
    if (!note) {
      throw new AppError('Note not found', 404);
    }
    return { id: note._id.toString() };
  }
}

export default new NotesService();
