import searchRepository from '../repositories/SearchRepository.js';
import AppError from '../utils/AppError.js';

const CATEGORY_LABELS = {
  fundamentals: 'Fundamentals',
  linear: 'Linear Structures',
  trees: 'Trees & Heaps',
  graphs: 'Graphs',
  advanced: 'Advanced Topics',
};

const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 100;
const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 20;
const SUGGESTION_LIMIT = 8;

export const sanitizeSearchQuery = (rawQuery) => {
  if (typeof rawQuery !== 'string') return '';

  return rawQuery
    .trim()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const parseLimit = (value, fallback = DEFAULT_LIMIT) => {
  const parsed = parseInt(value, 10);
  if (!parsed || parsed < 1) return fallback;
  return Math.min(parsed, MAX_LIMIT);
};

const formatTopic = (topic) => ({
  id: topic._id.toString(),
  slug: topic.slug,
  title: topic.title,
  category: topic.category,
  categoryLabel: CATEGORY_LABELS[topic.category] ?? topic.category,
  difficulty: topic.difficulty,
  tags: topic.tags ?? [],
  score: topic.score ?? 0,
  href: `/learn/${topic.slug}`,
});

const formatProblem = (problem) => ({
  id: problem._id.toString(),
  slug: problem.slug,
  title: problem.title,
  difficulty: problem.difficulty,
  tags: problem.tags ?? [],
  topicSlugs: problem.topicSlugs ?? [],
  acceptanceRate: problem.acceptanceRate ?? 0,
  score: problem.score ?? 0,
  href: `/problems/${problem.slug}`,
});

const formatNote = (note) => ({
  id: note._id.toString(),
  title: note.title,
  tags: note.tags ?? [],
  topic: note.topicId
    ? {
        slug: note.topicId.slug,
        title: note.topicId.title,
      }
    : null,
  problem: note.problemId
    ? {
        slug: note.problemId.slug,
        title: note.problemId.title,
      }
    : null,
  updatedAt: note.updatedAt,
  score: note.score ?? 0,
  href: `/notes/${note._id.toString()}`,
});

export class SearchService {
  resolveQuery(rawQuery) {
    const query = sanitizeSearchQuery(rawQuery);

    if (!query) {
      throw new AppError('Search query is required', 400);
    }

    if (query.length < MIN_QUERY_LENGTH) {
      throw new AppError(`Search query must be at least ${MIN_QUERY_LENGTH} characters`, 400);
    }

    if (query.length > MAX_QUERY_LENGTH) {
      throw new AppError(`Search query must be at most ${MAX_QUERY_LENGTH} characters`, 400);
    }

    return query;
  }

  async globalSearch(userId, rawQuery, options = {}) {
    const query = this.resolveQuery(rawQuery);
    const limit = parseLimit(options.limit);

    const [topics, problems, notes] = await Promise.all([
      searchRepository.searchTopics(query, limit),
      searchRepository.searchProblems(query, limit),
      searchRepository.searchNotes(userId, query, limit),
    ]);

    const formattedTopics = topics.map(formatTopic);
    const formattedProblems = problems.map(formatProblem);
    const formattedNotes = notes.map(formatNote);

    return {
      query,
      topics: formattedTopics,
      problems: formattedProblems,
      notes: formattedNotes,
      meta: {
        total: formattedTopics.length + formattedProblems.length + formattedNotes.length,
        counts: {
          topics: formattedTopics.length,
          problems: formattedProblems.length,
          notes: formattedNotes.length,
        },
      },
    };
  }

  async getSuggestions(userId, rawQuery, options = {}) {
    const query = this.resolveQuery(rawQuery);
    const perTypeLimit = Math.min(parseLimit(options.limit, 4), 6);

    const [topics, problems, notes] = await Promise.all([
      searchRepository.searchTopics(query, perTypeLimit),
      searchRepository.searchProblems(query, perTypeLimit),
      searchRepository.searchNotes(userId, query, perTypeLimit),
    ]);

    const suggestions = [
      ...topics.map((topic) => ({
        type: 'topic',
        id: topic._id.toString(),
        title: topic.title,
        subtitle: CATEGORY_LABELS[topic.category] ?? topic.category,
        href: `/learn/${topic.slug}`,
        score: topic.score ?? 0,
      })),
      ...problems.map((problem) => ({
        type: 'problem',
        id: problem._id.toString(),
        title: problem.title,
        subtitle: problem.difficulty,
        href: `/problems/${problem.slug}`,
        score: problem.score ?? 0,
      })),
      ...notes.map((note) => ({
        type: 'note',
        id: note._id.toString(),
        title: note.title,
        subtitle: note.topicId?.title || note.problemId?.title || 'Personal note',
        href: `/notes/${note._id.toString()}`,
        score: note.score ?? 0,
      })),
    ]
      .sort((a, b) => b.score - a.score)
      .slice(0, SUGGESTION_LIMIT);

    return {
      query,
      suggestions,
    };
  }
}

export default new SearchService();
