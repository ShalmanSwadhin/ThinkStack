import { buildQuizForTitle } from '../curriculum/index.js';

/**
 * Quiz questions for a topic by title: the lesson's hand-written quiz when the title is a
 * curriculum lesson, otherwise a neutral scaffold (admin-created drafts, test topics).
 */
export function buildQuizQuestions(topicTitle) {
  return buildQuizForTitle(topicTitle);
}

export default buildQuizQuestions;
