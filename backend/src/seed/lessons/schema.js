/**
 * Authoring format for ThinkStack lessons.
 *
 * Every curriculum lesson is written by hand in backend/src/seed/lessons/<moduleId>.js as
 * an object shaped like the one documented below, keyed by the lesson's exact title.
 * Nothing about a lesson's wording is derived from its title by a template — if a field
 * would only differ from another lesson's by a swapped title, it does not belong here.
 *
 *   kind       'algorithm' | 'concept'. Algorithmic lessons state real Big-O time/space.
 *              Conceptual lessons (version control, IDEs, naming…) have no meaningful
 *              Big-O, so `time`/`space` must begin "Not applicable —" / "Not an
 *              algorithmic topic —" and then say what cost DOES matter for that topic.
 *   viz        id of a visualizer from shared/algorithms/catalog.js that genuinely
 *              demonstrates THIS lesson (omit when none does — never a module default).
 *   intro      1-3 sentences: what the topic is and why it matters.
 *   theory     markdown: the concepts, definitions and rules of the topic.
 *   explain    markdown: how it works, step by step.
 *   example    markdown: a concrete worked example / dry run / workflow for THIS topic.
 *   real       how the topic shows up in real software.
 *   pros/cons  advantages / disadvantages OF THIS TOPIC (2-4 each).
 *   uses       applications (3-5).
 *   time/space complexity (see `kind`).
 *   mistakes   realistic mistakes learners make with THIS topic (3-5).
 *   interview  exactly 3 [question, answer] pairs, specific to the topic.
 *   summary    2-3 sentence recap.
 *   code       one or more runnable samples: { lang, src, out? }. `out` is the exact
 *              stdout the sample prints; tests execute python/javascript/bash samples
 *              and compare. lang: python | javascript | java | cpp | c | bash | json | text.
 *   codeNote   what the code demonstrates (shown under the editor).
 *   practice   problem-bank template keys (see generators/problemBank.js) that genuinely
 *              exercise this topic. Omit for topics no bank problem fits.
 *   quiz       exactly 4 [question, [4 options], correctIndex, explanation] entries.
 */

export const INTERVIEW_QA_PER_LESSON = 3;
export const QUIZ_QUESTIONS_PER_LESSON = 4;
export const CODE_LANGUAGES = ['python', 'javascript', 'java', 'cpp', 'c', 'bash', 'json', 'text'];
export const LESSON_KINDS = ['algorithm', 'concept'];

const MIN_LENGTH = { intro: 40, theory: 150, explain: 100, example: 70, real: 30, summary: 40, codeNote: 20 };

// Phrases that only ever appeared in the old template-generated content. Their presence
// means filler crept back in.
const TEMPLATE_FINGERPRINTS = [
  /\{topic\}|\{module\}|\$\{/,
  /\bundefined\b|\[object Object\]|\bNaN\b/,
  /\bTODO\b|\bFIXME\b/,
  /lorem ipsum/i,
  /ThinkStack Curriculum/i,
  /Port logic to/i,
  /identical algorithm\./i,
  /Apply .{1,60} operation on element index/i,
  /complexity profile that interviewers expect/i,
  /reduces cognitive load by giving a repeatable pattern/i,
  /lesson \d+ in /i,
];

const isNonEmptyString = (value, min = 1) => typeof value === 'string' && value.trim().length >= min;

/** Returns a list of human-readable problems with one authored lesson (empty = valid). */
export function validateLesson(lesson, label = 'lesson') {
  const problems = [];
  const fail = (message) => problems.push(`${label}: ${message}`);

  if (!lesson || typeof lesson !== 'object') return [`${label}: not an object`];

  if (!LESSON_KINDS.includes(lesson.kind)) fail(`kind must be one of ${LESSON_KINDS.join(' | ')}`);

  for (const [field, min] of Object.entries(MIN_LENGTH)) {
    if (!isNonEmptyString(lesson[field], min)) fail(`"${field}" is missing or shorter than ${min} characters`);
  }

  const listRules = { pros: 2, cons: 2, uses: 3, mistakes: 3 };
  for (const [field, min] of Object.entries(listRules)) {
    const list = lesson[field];
    if (!Array.isArray(list) || list.length < min || !list.every((item) => isNonEmptyString(item, 8))) {
      fail(`"${field}" needs at least ${min} non-empty entries`);
    } else if (new Set(list.map((item) => item.trim().toLowerCase())).size !== list.length) {
      fail(`"${field}" contains duplicate entries`);
    }
  }

  if (!isNonEmptyString(lesson.time, 8)) fail('"time" is missing');
  if (!isNonEmptyString(lesson.space, 8)) fail('"space" is missing');
  if (lesson.kind === 'concept') {
    const notApplicable = /^Not (applicable|an algorithmic topic)\b/i;
    if (!notApplicable.test(lesson.time ?? '') || !notApplicable.test(lesson.space ?? '')) {
      fail('concept lessons must open "time"/"space" with "Not applicable" / "Not an algorithmic topic" instead of inventing Big-O');
    }
  } else if (lesson.kind === 'algorithm') {
    if (!/O\(|Θ\(|Ω\(|\bconstant\b|\blinear\b|\blogarithmic\b|\bquadratic\b/i.test(`${lesson.time} ${lesson.space}`)) {
      fail('algorithm lessons must state a real complexity');
    }
  }

  const interview = lesson.interview;
  if (
    !Array.isArray(interview) ||
    interview.length !== INTERVIEW_QA_PER_LESSON ||
    !interview.every((pair) => Array.isArray(pair) && pair.length === 2 && isNonEmptyString(pair[0], 12) && isNonEmptyString(pair[1], 20))
  ) {
    fail(`"interview" must be exactly ${INTERVIEW_QA_PER_LESSON} [question, answer] pairs`);
  }

  const quiz = lesson.quiz;
  if (!Array.isArray(quiz) || quiz.length !== QUIZ_QUESTIONS_PER_LESSON) {
    fail(`"quiz" must have exactly ${QUIZ_QUESTIONS_PER_LESSON} questions`);
  } else {
    quiz.forEach((entry, index) => {
      const [question, options, answer, why] = Array.isArray(entry) ? entry : [];
      const where = `quiz[${index}]`;
      if (!isNonEmptyString(question, 12)) fail(`${where} has no question`);
      if (!Array.isArray(options) || options.length !== 4 || !options.every((o) => isNonEmptyString(o, 1))) {
        fail(`${where} needs exactly 4 non-empty options`);
      } else if (new Set(options.map((o) => o.trim().toLowerCase())).size !== 4) {
        fail(`${where} has duplicate options`);
      }
      if (!Number.isInteger(answer) || answer < 0 || answer > 3) fail(`${where} answer must be an index 0-3`);
      if (!isNonEmptyString(why, 15)) fail(`${where} needs an explanation`);
    });
  }

  if (!Array.isArray(lesson.code) || !lesson.code.length) {
    fail('"code" needs at least one sample');
  } else {
    lesson.code.forEach((sample, index) => {
      if (!CODE_LANGUAGES.includes(sample?.lang)) fail(`code[${index}] has unsupported lang "${sample?.lang}"`);
      if (!isNonEmptyString(sample?.src, 10)) fail(`code[${index}] has no source`);
    });
    const languages = lesson.code.map((sample) => sample.lang);
    if (new Set(languages).size !== languages.length) fail('"code" has two samples in the same language');
    // Samples in runnable languages must say what they print so the test can verify it.
    lesson.code.forEach((sample, index) => {
      if (['python', 'javascript', 'bash'].includes(sample?.lang) && sample.out === undefined) {
        fail(`code[${index}] (${sample.lang}) has no expected output block, so it cannot be verified`);
      }
    });
  }

  if (lesson.practice !== undefined && !(Array.isArray(lesson.practice) && lesson.practice.every((k) => typeof k === 'string'))) {
    fail('"practice" must be an array of problem template keys');
  }

  // Code samples legitimately contain things like "${file}" or "undefined", so the filler
  // scan covers the prose of the lesson only.
  const { code: _code, ...prose } = lesson;
  const proseText = JSON.stringify(prose);
  for (const pattern of TEMPLATE_FINGERPRINTS) {
    if (pattern.test(proseText)) fail(`contains template/filler residue matching ${pattern}`);
  }

  // The lesson page renders a small markdown subset (### headings, "- " bullets, `inline
  // code`), and shows intro/real/summary and list entries as plain text. Anything else would
  // appear on screen as literal punctuation.
  const proseFields = [
    ...['intro', 'theory', 'explain', 'example', 'real', 'summary', 'codeNote'].map((key) => lesson[key]),
    ...['pros', 'cons', 'uses', 'mistakes'].flatMap((key) => lesson[key] ?? []),
    ...(lesson.interview ?? []).flat(),
    ...(lesson.quiz ?? []).flatMap((entry) => [entry?.[0], ...(entry?.[1] ?? []), entry?.[3]]),
  ];
  for (const field of proseFields) {
    if (typeof field !== 'string') continue;
    const withoutCode = field.replace(/`[^`\n]*`/g, '');
    if (/\*\*|__/.test(withoutCode)) fail(`uses unsupported **bold**/__ markup: "${field.slice(0, 50)}"`);
    if (/(^|[\s(])\*[A-Za-z]/.test(withoutCode)) fail(`uses unsupported *italic* markup: "${field.slice(0, 50)}"`);
    if (/\]\(/.test(withoutCode)) fail(`uses markdown link syntax, which is not rendered: "${field.slice(0, 50)}"`);
    if (/^\s*\|.*\|\s*$/m.test(field)) fail(`uses a markdown table, which is not rendered: "${field.slice(0, 50)}"`);
    if (/^\s*```/m.test(field)) fail('puts a code fence in prose (use the code section)');
    if (/^#{1,2}\s/m.test(field)) fail('uses a #/## heading inside a section (use ###)');
  }
  for (const field of ['intro', 'real', 'summary']) {
    if (typeof lesson[field] === 'string' && lesson[field].includes('\n')) {
      fail(`"${field}" is shown as a single paragraph and must not contain line breaks`);
    }
  }

  // Only theory / explain / example go through the markdown renderer. Everywhere else a
  // backtick would be shown literally.
  const plainFields = [
    ...['intro', 'real', 'summary', 'codeNote'].map((key) => lesson[key]),
    ...['pros', 'cons', 'uses', 'mistakes'].flatMap((key) => lesson[key] ?? []),
    ...(lesson.interview ?? []).flat(),
    ...(lesson.quiz ?? []).flatMap((entry) => [entry?.[0], ...(entry?.[1] ?? []), entry?.[3]]),
  ];
  for (const field of plainFields) {
    if (typeof field === 'string' && field.includes('`')) {
      fail(`uses a backtick in a plain-text field (only theory/explain/example render \`code\`): "${field.slice(0, 50)}"`);
    }
  }

  if (Array.isArray(lesson.quiz)) {
    lesson.quiz.forEach((entry, index) => {
      const options = Array.isArray(entry?.[1]) ? entry[1] : [];
      if (options.some((option) => /^(all|none|both) of the (above|these)\b/i.test(option.trim()))) {
        fail(`quiz[${index}] uses a positional option ("all/none of the above"), which breaks when options are shuffled`);
      }
    });
  }

  return problems;
}

export default { validateLesson, INTERVIEW_QA_PER_LESSON, QUIZ_QUESTIONS_PER_LESSON, CODE_LANGUAGES, LESSON_KINDS };
