/**
 * Turns an authored lesson (see ./schema.js) into the documents the database stores.
 * This is pure re-shaping: no wording is generated here.
 */

const DIFFICULTIES = ['easy', 'medium', 'medium', 'hard'];

const wordCount = (text) => (String(text ?? '').match(/\S+/g) ?? []).length;

/** Reading time from the lesson's real length (≈180 wpm for prose, 12 lines/min for code). */
export function estimateMinutes(lesson) {
  const prose = [lesson.intro, lesson.theory, lesson.explain, lesson.example, lesson.real, lesson.summary, ...lesson.pros, ...lesson.cons, ...lesson.uses, ...lesson.mistakes]
    .map(wordCount)
    .reduce((a, b) => a + b, 0);
  const interview = lesson.interview.flat().map(wordCount).reduce((a, b) => a + b, 0);
  const codeLines = Math.max(...lesson.code.map((sample) => sample.src.split('\n').length));
  const minutes = Math.round((prose + interview) / 180 + codeLines / 12);
  return Math.min(45, Math.max(6, minutes));
}

export function lessonToContent(lesson) {
  return {
    introduction: lesson.intro,
    theory: lesson.theory,
    explanation: lesson.explain,
    example: lesson.example,
    realWorldExample: lesson.real,
    advantages: [...lesson.pros],
    disadvantages: [...lesson.cons],
    applications: [...lesson.uses],
    timeComplexity: lesson.time,
    spaceComplexity: lesson.space,
    commonMistakes: [...lesson.mistakes],
    interviewQuestions: lesson.interview.map(([question, answer]) => ({ question, answer })),
    summary: lesson.summary,
    codeExamples: lesson.code.map((sample) => ({
      language: sample.lang,
      code: sample.src,
      explanation: lesson.codeNote,
      comments: '',
    })),
    codeComments: '',
    references: [],
    notes: '',
    externalResources: [],
  };
}

function hashSeed(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministic shuffle (Fisher–Yates with a seeded PRNG) so the correct answer is spread
 * evenly over the four positions and is stable between seed runs.
 */
export function shuffleOptions(options, correctIndex, seedKey) {
  const order = options.map((_, index) => index);
  const random = mulberry32(hashSeed(seedKey));
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return { options: order.map((index) => options[index]), correctIndex: order.indexOf(correctIndex) };
}

/** @param {string} seedKey stable per lesson (e.g. its slug) so the shuffle is reproducible */
export function lessonToQuiz(lesson, seedKey = lesson.intro.slice(0, 40)) {
  return lesson.quiz.map(([question, options, correctIndex, explanation], index) => {
    const shuffled = shuffleOptions(options, correctIndex, `${seedKey}#${index}`);
    return {
      question,
      options: shuffled.options,
      correctIndex: shuffled.correctIndex,
      explanation,
      difficulty: DIFFICULTIES[index] ?? 'medium',
    };
  });
}

/** First sentence of the intro, used as the lesson's short description. */
export function lessonDescription(lesson) {
  const first = lesson.intro.trim().split(/(?<=[.!?])\s/)[0];
  return first.length > 220 ? `${first.slice(0, 217)}…` : first;
}

export default { lessonToContent, lessonToQuiz, estimateMinutes, lessonDescription };
