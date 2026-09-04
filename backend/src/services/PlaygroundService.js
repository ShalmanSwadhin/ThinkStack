import { LANGUAGES, VERDICT } from 'shared/constants';
import judge0Service from './Judge0Service.js';
import playgroundSnippetRepository from '../repositories/PlaygroundSnippetRepository.js';
import submissionRepository from '../repositories/SubmissionRepository.js';
import AppError from '../utils/AppError.js';

const LANGUAGE_KEYS = Object.keys(LANGUAGES);

const resolveLanguage = (language) => {
  const normalized = String(language || '').toLowerCase();
  const entry = Object.entries(LANGUAGES).find(
    ([, value]) => value.monaco === normalized || value.name.toLowerCase() === normalized
  );

  if (!entry) {
    throw new AppError(
      `Unsupported language. Supported: ${LANGUAGE_KEYS.map((key) => LANGUAGES[key].monaco).join(', ')}`,
      400
    );
  }

  const [key, config] = entry;
  return { key, config, monaco: config.monaco };
};

const formatSnippet = (snippet) => ({
  id: snippet._id.toString(),
  title: snippet.title,
  language: snippet.language,
  sourceCode: snippet.sourceCode,
  stdin: snippet.stdin ?? '',
  createdAt: snippet.createdAt,
  updatedAt: snippet.updatedAt,
});

const formatSubmission = (submission) => ({
  id: submission._id.toString(),
  language: submission.language,
  sourceCode: submission.sourceCode,
  stdin: submission.stdin ?? '',
  stdout: submission.stdout ?? '',
  stderr: submission.stderr ?? '',
  verdict: submission.verdict,
  executionTime: submission.executionTime ?? null,
  memoryUsed: submission.memoryUsed ?? null,
  createdAt: submission.createdAt,
});

export class PlaygroundService {
  listLanguages() {
    return LANGUAGE_KEYS.map((key) => ({
      key,
      id: LANGUAGES[key].id,
      name: LANGUAGES[key].name,
      monaco: LANGUAGES[key].monaco,
    }));
  }

  async runCode(userId, { language, sourceCode, stdin = '' }) {
    const { monaco, config } = resolveLanguage(language);

    const result = await judge0Service.execute({
      languageId: config.id,
      sourceCode,
      stdin,
    });

    const submission = await submissionRepository.create({
      userId,
      type: 'playground',
      language: monaco,
      sourceCode,
      stdin,
      stdout: result.stdout,
      stderr: result.stderr,
      verdict: result.verdict ?? VERDICT.PENDING,
      executionTime: result.executionTime,
      memoryUsed: result.memoryUsed,
      judge0Token: result.judge0Token,
    });

    return {
      submission: formatSubmission(submission),
      mockMode: judge0Service.isMockMode(),
    };
  }

  async listHistory(userId, { page = 1, limit = 20 } = {}) {
    const { data, meta } = await submissionRepository.find(
      { userId, type: 'playground' },
      { page, limit, sort: { createdAt: -1 } }
    );

    return {
      submissions: data.map(formatSubmission),
      meta,
    };
  }

  async listSnippets(userId, { page = 1, limit = 50 } = {}) {
    const { data, meta } = await playgroundSnippetRepository.findByUser(userId, { page, limit });
    return {
      snippets: data.map(formatSnippet),
      meta,
    };
  }

  async getSnippet(userId, id) {
    const snippet = await playgroundSnippetRepository.findByIdForUser(id, userId);
    if (!snippet) {
      throw new AppError('Snippet not found', 404);
    }
    return formatSnippet(snippet);
  }

  async createSnippet(userId, { title, language, sourceCode, stdin = '' }) {
    const { monaco } = resolveLanguage(language);

    const snippet = await playgroundSnippetRepository.create({
      userId,
      title,
      language: monaco,
      sourceCode,
      stdin,
    });

    return formatSnippet(snippet);
  }

  async updateSnippet(userId, id, updates) {
    const existing = await playgroundSnippetRepository.findByIdForUser(id, userId);
    if (!existing) {
      throw new AppError('Snippet not found', 404);
    }

    const data = {};
    if (updates.title != null) data.title = updates.title;
    if (updates.sourceCode != null) data.sourceCode = updates.sourceCode;
    if (updates.stdin != null) data.stdin = updates.stdin;
    if (updates.language != null) {
      data.language = resolveLanguage(updates.language).monaco;
    }

    const snippet = await playgroundSnippetRepository.updateById(id, data);
    return formatSnippet(snippet);
  }

  async deleteSnippet(userId, id) {
    const snippet = await playgroundSnippetRepository.softDelete(id, userId);
    if (!snippet) {
      throw new AppError('Snippet not found', 404);
    }
    return { id: snippet._id.toString() };
  }
}

export default new PlaygroundService();
