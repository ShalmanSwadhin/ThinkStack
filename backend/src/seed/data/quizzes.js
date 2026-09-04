export { buildQuizQuestionsForLesson, buildSupplementaryQuizBank } from '../generators/quizBuilder.js';
import { buildQuizQuestionsForLesson } from '../generators/quizBuilder.js';

/** @deprecated Use buildQuizQuestionsForLesson with lesson metadata */
export function buildQuizQuestions(topicTitle) {
  return buildQuizQuestionsForLesson({
    title: topicTitle,
    moduleTitle: 'General',
    slug: topicTitle.toLowerCase().replace(/\s+/g, '-'),
    order: 0,
    complexity: { time: 'O(n)', space: 'O(1)' },
    applications: ['Technical interviews'],
    pitfalls: ['Ignoring edge cases'],
  });
}

export default buildQuizQuestions;
