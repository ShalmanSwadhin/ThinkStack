import { MODULES } from './modules.js';
import { getAuthoredLesson } from '../lessons/index.js';
import { lessonToContent, lessonToQuiz, estimateMinutes, lessonDescription } from '../lessons/build.js';
import { buildScaffoldContent, buildScaffoldQuiz } from '../lessons/scaffold.js';

// TRANSITIONAL: lessons not yet hand-written still use the old template pipeline. Removed
// once all 500 lessons have authored content (lessonContent.test.js enforces completeness).
import { buildLessonMetadata } from '../generators/contentBuilder.js';
import { buildRichLessonContent } from '../generators/lessonContentLibrary.js';
import { buildTopicCodeExamples } from '../generators/topicCodeLibrary.js';
import { buildQuizQuestionsForLesson } from '../generators/quizBuilder.js';

function toSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Flatten modules into lesson definitions (slug, ordering, category, tags …).
 * `authored` is the hand-written lesson or null.
 */
export function buildLessonCatalog() {
  const lessons = [];
  let globalOrder = 1;

  for (const module of MODULES) {
    module.lessons.forEach((lessonTitle, lessonIndex) => {
      const authored = getAuthoredLesson(module.id, lessonTitle);
      const legacy = authored ? null : buildLessonMetadata(module, lessonTitle, lessonIndex, globalOrder);

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
        visualizerId: authored ? authored.viz ?? null : module.visualizerId,
        practice: authored?.practice ?? [],
        authored,
        legacy,
      });
      globalOrder += 1;
    });
  }

  return lessons;
}

/** Build TOPICS array for the seed bootstrap. */
export function buildTopics() {
  return buildLessonCatalog().map((lesson) => {
    let content;
    let quiz;
    let description;
    let estimatedMinutes;

    if (lesson.authored) {
      content = lessonToContent(lesson.authored);
      quiz = lessonToQuiz(lesson.authored, lesson.slug);
      description = lessonDescription(lesson.authored);
      estimatedMinutes = estimateMinutes(lesson.authored);
    } else {
      content = buildRichLessonContent(lesson.legacy);
      content.codeExamples = buildTopicCodeExamples(lesson.legacy);
      quiz = buildQuizQuestionsForLesson({
        title: lesson.title,
        moduleTitle: lesson.moduleId,
        slug: lesson.slug,
        order: lesson.order,
        complexity: { time: content.timeComplexity, space: content.spaceComplexity },
        applications: content.applications ?? [],
        pitfalls: content.commonMistakes ?? [],
      });
      description = lesson.legacy.description;
      estimatedMinutes = lesson.legacy.estimatedMinutes;
    }

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
  if (found) {
    const catalogEntry = buildLessonCatalog().find((l) => l.title === title);
    const content = buildRichLessonContent(catalogEntry.legacy);
    content.codeExamples = buildTopicCodeExamples(catalogEntry.legacy);
    return content;
  }
  return buildScaffoldContent(title);
}

/** Quiz questions for a topic by title (same rule as buildTopicContent). */
export function buildQuizForTitle(title) {
  const found = findLessonByTitle(title);
  if (found?.lesson) return lessonToQuiz(found.lesson, `${found.module.id}-${toSlug(title)}`);
  if (found) {
    const topic = TOPICS.find((t) => t.title === title);
    if (topic) return topic.quiz;
  }
  return buildScaffoldQuiz(title);
}

export default buildTopics;
