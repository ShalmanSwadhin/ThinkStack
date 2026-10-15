import { MODULES } from './modules.js';
import { getAuthoredLesson } from '../lessons/index.js';
import { lessonToContent, lessonToQuiz, estimateMinutes, lessonDescription } from '../lessons/build.js';
import { buildScaffoldContent, buildScaffoldQuiz } from '../lessons/scaffold.js';

function toSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Flatten modules into lesson definitions (slug, ordering, category, tags …).
 * Every curriculum lesson must have hand-written content; a missing one is a build error
 * (lessonContent.test.js enforces the same in CI).
 */
export function buildLessonCatalog() {
  const lessons = [];
  let globalOrder = 1;

  for (const module of MODULES) {
    module.lessons.forEach((lessonTitle, lessonIndex) => {
      const authored = getAuthoredLesson(module.id, lessonTitle);
      if (!authored) throw new Error(`No authored lesson content for "${module.id}" › "${lessonTitle}"`);

      lessons.push({
        slug: `${module.id}-${toSlug(lessonTitle)}`,
        title: lessonTitle,
        moduleId: module.id,
        moduleTitle: module.title,
        category: module.category,
        difficulty: module.difficulty,
        order: globalOrder,
        moduleOrder: lessonIndex + 1,
        tags: [module.id, toSlug(lessonTitle), module.category, `lesson-${lessonIndex + 1}`],
        // A visualizer is attached only when a lesson genuinely demonstrates one.
        visualizerId: authored.viz ?? null,
        practice: authored.practice ?? [],
        authored,
      });
      globalOrder += 1;
    });
  }

  return lessons;
}

/** Build TOPICS array for the seed bootstrap. */
export function buildTopics() {
  return buildLessonCatalog().map((lesson) => {
    const content = lessonToContent(lesson.authored);
    const quiz = lessonToQuiz(lesson.authored, lesson.slug);
    const description = lessonDescription(lesson.authored);
    const estimatedMinutes = estimateMinutes(lesson.authored);

    return {
      slug: lesson.slug,
      title: lesson.title,
      description,
      category: lesson.category,
      difficulty: lesson.difficulty,
      order: lesson.order,
      tags: [...lesson.tags, `module:${lesson.moduleId}`],
      estimatedMinutes,
      visualizerId: lesson.visualizerId,
      moduleId: lesson.moduleId,
      practice: lesson.practice,
      content,
      quiz,
    };
  });
}

/** Export lesson catalog for problem linking. */
export { buildLessonCatalog as getLessonCatalog };

/** @deprecated use buildTopics */
export const TOPICS = buildTopics();

function findLessonByTitle(title) {
  for (const module of MODULES) {
    if (module.lessons.includes(title)) return { module, lesson: getAuthoredLesson(module.id, title) };
  }
  return null;
}

/**
 * Content for a topic by title: the authored lesson when the title is a curriculum lesson,
 * otherwise a neutral scaffold (admin-created drafts, test topics).
 */
export function buildTopicContent(title) {
  const found = findLessonByTitle(title);
  if (found?.lesson) return lessonToContent(found.lesson);
  return buildScaffoldContent(title);
}

/** Quiz questions for a topic by title (same rule as buildTopicContent). */
export function buildQuizForTitle(title) {
  const found = findLessonByTitle(title);
  if (found?.lesson) return lessonToQuiz(found.lesson, `${found.module.id}-${toSlug(title)}`);
  return buildScaffoldQuiz(title);
}

export default buildTopics;
