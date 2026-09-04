import { MODULES } from './modules.js';
import { buildLessonMetadata } from '../generators/contentBuilder.js';
import { buildRichLessonContent } from '../generators/lessonContentLibrary.js';
import { buildTopicCodeExamples } from '../generators/topicCodeLibrary.js';

function toSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Flatten modules into lesson definitions with full metadata.
 */
export function buildLessonCatalog() {
  const lessons = [];
  let globalOrder = 1;

  for (const module of MODULES) {
    module.lessons.forEach((lessonTitle, lessonIndex) => {
      const meta = buildLessonMetadata(module, lessonTitle, lessonIndex, globalOrder);
      lessons.push({
        ...meta,
        moduleOrder: lessonIndex + 1,
      });
      globalOrder += 1;
    });
  }

  return lessons;
}

/**
 * Build TOPICS array for seed bootstrap.
 */
export function buildTopics() {
  const catalog = buildLessonCatalog();

  return catalog.map((lesson) => {
    const content = buildRichLessonContent(lesson);
    content.codeExamples = buildTopicCodeExamples(lesson);

    return {
      slug: lesson.slug,
      title: lesson.title,
      description: lesson.description,
      category: lesson.category,
      difficulty: lesson.difficulty,
      order: lesson.order,
      tags: [...lesson.tags, `module:${lesson.moduleId}`],
      estimatedMinutes: lesson.estimatedMinutes,
      visualizerId: lesson.visualizerId,
      moduleId: lesson.moduleId,
      content,
    };
  });
}

/**
 * Export lesson catalog for quiz/problem linking.
 */
export { buildLessonCatalog as getLessonCatalog };

/** @deprecated use buildTopics */
export const TOPICS = buildTopics();

/** Legacy export for backward compatibility */
export function buildTopicContent(title) {
  const lesson = buildLessonCatalog().find((l) => l.title === title);
  const meta = lesson ?? {
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    title,
    moduleTitle: 'General',
    moduleId: 'general',
    category: 'fundamentals',
    order: 0,
  };
  const content = buildRichLessonContent(meta);
  content.codeExamples = buildTopicCodeExamples(meta);
  return content;
}

export default buildTopics;
