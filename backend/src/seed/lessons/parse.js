/**
 * Parser for the lesson authoring format (backend/src/seed/lessons/content/**.md).
 *
 *   # Exact Lesson Title                  <- must equal a title in curriculum/modules.js
 *   kind: concept | algorithm             <- header lines: kind, viz, time, space, practice
 *   viz: binary-search
 *   time: Not applicable — …
 *   space: Not applicable — …
 *   practice: sum-of-array-elements, factorial-calculation
 *
 *   ## intro            plain markdown paragraphs
 *   ## theory           markdown (use ### for sub-headings — "## " starts a new section)
 *   ## explain
 *   ## example
 *   ## real
 *   ## pros             "- item" bullets (an indented line continues the previous item)
 *   ## cons
 *   ## uses
 *   ## mistakes
 *   ## interview        **Q:** question  /  **A:** answer   (three pairs)
 *   ## summary
 *   ## codenote
 *   ## code             "### python" (or javascript, bash, …) sub-sections; each holds a
 *                       fenced source block and, optionally, a second fenced block that is
 *                       the exact expected output
 *   ## quiz             "1. Question" followed by four "- [ ]" / "- [x]" options (the [x]
 *                       one is correct) and a "> explanation" line
 *
 * Lines inside ``` fences are never treated as structure, so code may contain "#" or "##".
 */

const TEXT_SECTIONS = new Set(['intro', 'theory', 'explain', 'example', 'real', 'summary', 'codenote']);
const LIST_SECTIONS = new Set(['pros', 'cons', 'uses', 'mistakes']);
const HEADER_KEYS = new Set(['kind', 'viz', 'time', 'space', 'practice']);

class LessonParseError extends Error {
  constructor(message, where) {
    super(where ? `${where}: ${message}` : message);
    this.name = 'LessonParseError';
  }
}

/** Splits `text` into [{ line, inFence }] so structure detection can skip fenced code. */
function tagFences(lines) {
  let inFence = false;
  return lines.map((line) => {
    const isFenceLine = /^```/.test(line);
    const tagged = { line, inFence: inFence || isFenceLine, isFenceLine };
    if (isFenceLine) inFence = !inFence;
    return tagged;
  });
}

function parseList(body, where) {
  const items = [];
  for (const raw of body.split('\n')) {
    if (!raw.trim()) continue;
    if (/^-\s+/.test(raw)) items.push(raw.replace(/^-\s+/, '').trim());
    else if (items.length && /^\s+\S/.test(raw)) items[items.length - 1] += ` ${raw.trim()}`;
    else throw new LessonParseError(`list line is not a "- " bullet: "${raw.trim().slice(0, 60)}"`, where);
  }
  return items;
}

function parseInterview(body, where) {
  const pairs = [];
  let current = null;
  let target = null;
  for (const raw of body.split('\n')) {
    const q = raw.match(/^\*\*Q:\*\*\s*(.*)$/);
    const a = raw.match(/^\*\*A:\*\*\s*(.*)$/);
    if (q) {
      if (current) pairs.push(current);
      current = { q: q[1].trim(), a: '' };
      target = 'q';
    } else if (a) {
      if (!current) throw new LessonParseError('**A:** before any **Q:**', where);
      current.a = a[1].trim();
      target = 'a';
    } else if (raw.trim() && current) {
      current[target] += ` ${raw.trim()}`;
    }
  }
  if (current) pairs.push(current);
  return pairs.map((pair) => [pair.q.trim(), pair.a.trim()]);
}

function parseQuiz(body, where) {
  const questions = [];
  let current = null;
  let reading = null; // 'question' | 'why'
  for (const raw of body.split('\n')) {
    const start = raw.match(/^\d+\.\s+(.*)$/);
    const option = raw.match(/^\s*-\s+\[( |x|X)\]\s+(.*)$/);
    const why = raw.match(/^\s*>\s?(.*)$/);
    if (start) {
      current = { question: start[1].trim(), options: [], answer: -1, why: '' };
      questions.push(current);
      reading = 'question';
    } else if (option) {
      if (!current) throw new LessonParseError('quiz option before any numbered question', where);
      if (option[1].toLowerCase() === 'x') {
        if (current.answer !== -1) throw new LessonParseError(`question "${current.question.slice(0, 40)}" marks two correct answers`, where);
        current.answer = current.options.length;
      }
      current.options.push(option[2].trim());
      reading = 'option';
    } else if (why) {
      if (!current) throw new LessonParseError('"> explanation" before any numbered question', where);
      current.why = `${current.why} ${why[1].trim()}`.trim();
      reading = 'why';
    } else if (raw.trim() && current) {
      if (reading === 'question') current.question += ` ${raw.trim()}`;
      else if (reading === 'why') current.why += ` ${raw.trim()}`;
      else if (reading === 'option') current.options[current.options.length - 1] += ` ${raw.trim()}`;
    }
  }
  return questions.map((q) => [q.question, q.options, q.answer, q.why]);
}

function parseCode(body, where) {
  const samples = [];
  const tagged = tagFences(body.split('\n'));
  let current = null;
  let fenceLines = null;

  for (const { line, inFence, isFenceLine } of tagged) {
    if (!inFence && /^###\s+/.test(line)) {
      current = { lang: line.replace(/^###\s+/, '').trim().toLowerCase(), blocks: [] };
      samples.push(current);
      fenceLines = null;
      continue;
    }
    if (!current) {
      if (line.trim() && !isFenceLine) throw new LessonParseError('text before the first "### language" in ## code', where);
      continue;
    }
    if (isFenceLine) {
      if (fenceLines === null) fenceLines = [];
      else {
        current.blocks.push(fenceLines.join('\n'));
        fenceLines = null;
      }
    } else if (inFence && fenceLines) {
      fenceLines.push(line);
    }
  }

  return samples.map((sample) => {
    if (!sample.blocks.length) throw new LessonParseError(`code section "${sample.lang}" has no fenced source block`, where);
    const result = { lang: sample.lang, src: sample.blocks[0].replace(/\s+$/, '') };
    if (sample.blocks[1] !== undefined) result.out = sample.blocks[1].replace(/\s+$/, '');
    return result;
  });
}

function parseHeader(lines, where) {
  const header = {};
  for (const raw of lines) {
    if (!raw.trim()) continue;
    const match = raw.match(/^([a-z]+):\s*(.*)$/);
    if (!match || !HEADER_KEYS.has(match[1])) {
      throw new LessonParseError(`unrecognised header line "${raw.trim().slice(0, 60)}" (allowed keys: ${[...HEADER_KEYS].join(', ')})`, where);
    }
    header[match[1]] = match[2].trim();
  }
  return header;
}

function buildLesson(title, headerLines, sections, where) {
  const header = parseHeader(headerLines, where);
  const lesson = {};
  if (header.kind) lesson.kind = header.kind;
  if (header.viz) lesson.viz = header.viz;
  if (header.time) lesson.time = header.time;
  if (header.space) lesson.space = header.space;
  if (header.practice) lesson.practice = header.practice.split(',').map((key) => key.trim()).filter(Boolean);

  for (const [name, body] of Object.entries(sections)) {
    if (TEXT_SECTIONS.has(name)) {
      const key = name === 'codenote' ? 'codeNote' : name;
      lesson[key] = body.trim();
    } else if (LIST_SECTIONS.has(name)) {
      lesson[name] = parseList(body, where);
    } else if (name === 'interview') {
      lesson.interview = parseInterview(body, where);
    } else if (name === 'quiz') {
      lesson.quiz = parseQuiz(body, where);
    } else if (name === 'code') {
      lesson.code = parseCode(body, where);
    } else if (name === 'practice') {
      lesson.practice = body.split(/[,\s]+/).map((key) => key.trim()).filter(Boolean);
    } else {
      throw new LessonParseError(`unknown section "## ${name}"`, where);
    }
  }
  return lesson;
}

/**
 * Parses one .md file into { [lessonTitle]: authoredLesson }.
 * @param {string} text file contents
 * @param {string} file used only for error messages
 */
export function parseLessonFile(text, file = 'lessons') {
  const lines = String(text).replace(/\r\n?/g, '\n').split('\n');
  const tagged = tagFences(lines);

  const lessons = {};
  let title = null;
  let headerLines = [];
  let sectionName = null;
  let sections = {};
  let buffer = [];

  const flushSection = () => {
    if (sectionName !== null) sections[sectionName] = buffer.join('\n');
    buffer = [];
  };
  const flushLesson = () => {
    if (title === null) return;
    flushSection();
    const where = `${file} › "${title}"`;
    if (lessons[title]) throw new LessonParseError('lesson defined twice', where);
    lessons[title] = buildLesson(title, headerLines, sections, where);
    headerLines = [];
    sections = {};
    sectionName = null;
  };

  for (const { line, inFence } of tagged) {
    if (!inFence && /^# \S/.test(line)) {
      flushLesson();
      title = line.replace(/^# /, '').trim();
      continue;
    }
    if (title === null) continue;
    if (!inFence && /^## \S/.test(line)) {
      flushSection();
      sectionName = line.replace(/^## /, '').trim().toLowerCase();
      continue;
    }
    if (sectionName === null) headerLines.push(line);
    else buffer.push(line);
  }
  flushLesson();
  return lessons;
}

export { LessonParseError };
export default parseLessonFile;
