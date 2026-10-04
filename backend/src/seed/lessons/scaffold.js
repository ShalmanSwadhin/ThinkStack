/**
 * Neutral scaffolds for topics that are NOT part of the authored curriculum — a draft
 * topic an admin just created, or a throwaway topic made by a test. They contain no
 * invented teaching material: only clearly-marked prompts to be replaced, so nothing
 * made-up can be mistaken for a real lesson.
 */

export function buildScaffoldContent(title) {
  return {
    introduction: `Write a short introduction to "${title}" here.`,
    theory: `Explain the core ideas of "${title}" here.`,
    explanation: `Describe, step by step, how "${title}" works.`,
    example: `Add a worked example for "${title}".`,
    realWorldExample: `Describe where "${title}" is used in real software.`,
    advantages: [`Add an advantage of ${title}.`],
    disadvantages: [`Add a limitation of ${title}.`],
    applications: [`Add an application of ${title}.`],
    timeComplexity: 'Add the time complexity, or note that it does not apply.',
    spaceComplexity: 'Add the space complexity, or note that it does not apply.',
    commonMistakes: [`Add a common mistake when learning ${title}.`],
    interviewQuestions: [{ question: `Add an interview question about ${title}.`, answer: 'Add the answer.' }],
    summary: `Summarise "${title}" in a few sentences.`,
    codeExamples: [],
    codeComments: '',
    references: [],
    notes: '',
    externalResources: [],
  };
}

export function buildScaffoldQuiz(title) {
  return [1, 2, 3].map((number) => ({
    question: `Placeholder question ${number} for "${title}" — replace it before publishing.`,
    options: ['Correct answer (replace)', 'Distractor (replace)', 'Distractor (replace)', 'Distractor (replace)'],
    correctIndex: 0,
    explanation: 'Replace this placeholder with a real explanation.',
    difficulty: 'easy',
  }));
}

export default { buildScaffoldContent, buildScaffoldQuiz };
