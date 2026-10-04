/**
 * Loads every authored lesson from backend/src/seed/lessons/content/<moduleId>/*.md.
 *
 * `getAuthoredLesson(moduleId, title)` returns the parsed lesson or null. During the
 * migration away from template-generated content a missing lesson returns null; once all
 * 500 are written, the content test fails on any lesson that has no authored file.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseLessonFile } from './parse.js';

const CONTENT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'content');

let cache = null;

/** { [moduleId]: { [lessonTitle]: lesson } }, plus the file each lesson came from. */
export function loadAuthoredLessons() {
  if (cache) return cache;

  const byModule = {};
  const sources = {};
  if (fs.existsSync(CONTENT_DIR)) {
    for (const moduleId of fs.readdirSync(CONTENT_DIR).sort()) {
      const dir = path.join(CONTENT_DIR, moduleId);
      if (!fs.statSync(dir).isDirectory()) continue;
      byModule[moduleId] = {};
      for (const file of fs.readdirSync(dir).filter((name) => name.endsWith('.md')).sort()) {
        const parsed = parseLessonFile(fs.readFileSync(path.join(dir, file), 'utf8'), `${moduleId}/${file}`);
        for (const [title, lesson] of Object.entries(parsed)) {
          if (byModule[moduleId][title]) throw new Error(`Lesson "${title}" is defined in more than one file of ${moduleId}`);
          byModule[moduleId][title] = lesson;
          sources[`${moduleId}::${title}`] = `${moduleId}/${file}`;
        }
      }
    }
  }
  cache = { byModule, sources };
  return cache;
}

export function getAuthoredLesson(moduleId, title) {
  return loadAuthoredLessons().byModule[moduleId]?.[title] ?? null;
}

export function resetAuthoredLessonCache() {
  cache = null;
}

export default { loadAuthoredLessons, getAuthoredLesson, resetAuthoredLessonCache };
