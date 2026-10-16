import { Bookmark, Contest, ContestSubmission, Note, Problem, Topic } from '../models/index.js';
import { legacyReplacementKey } from './generators/problemBank.js';

const LEGACY_SLUG = /^(easy|medium|hard)-.+-\d+$/;

const idKey = (id) => String(id);

/**
 * One-time, data-preserving retirement of the problems produced by the old generator
 * ("Sum of Array Elements 12", slug "easy-sum-of-array-elements-12", …).
 *
 * Those records were ten numbered copies of 30 templates, and every copy carried one shared
 * hidden test case whose expected output had nothing to do with the problem, so no correct
 * solution could ever be accepted. The real problems now live under un-numbered slugs; this
 * moves everything that pointed at a legacy copy over to its replacement, WITHOUT deleting
 * anything:
 *
 *  - bookmarks and notes are re-pointed at the replacement (a duplicate bookmark is dropped);
 *  - topic `relatedProblems` entries are removed (the seed re-links lessons to real problems);
 *  - contests nobody has submitted to are re-pointed at the replacement problems (keeping the
 *    problem count by topping up from the same difficulty);
 *  - a legacy copy that a contest with submissions still uses stays published, but its statement,
 *    examples and tests are replaced by the replacement's so the contest keeps working correctly;
 *  - every other legacy copy is archived (status "archived"), never removed, so submissions and
 *    XP history that reference it stay intact.
 *
 * It is idempotent: once nothing published matches the legacy pattern it does nothing.
 */
export async function retireLegacyProblems() {
  const result = { found: 0, archived: 0, kept: 0, contestsRemapped: 0, bookmarksMoved: 0, notesMoved: 0 };

  const candidates = await Problem.find({ slug: LEGACY_SLUG }).select('_id slug status').lean();
  const legacy = candidates.filter((p) => legacyReplacementKey(p.slug));
  if (legacy.length === 0) return result;
  result.found = legacy.length;

  const replacements = await Problem.find({ slug: { $in: [...new Set(legacy.map((p) => legacyReplacementKey(p.slug)))] } }).lean();
  const replacementByKey = new Map(replacements.map((p) => [p.slug, p]));
  // Never retire a legacy copy whose replacement is missing — that would lose the problem.
  const retirable = legacy.filter((p) => replacementByKey.has(legacyReplacementKey(p.slug)));
  const replacementOf = new Map(retirable.map((p) => [idKey(p._id), replacementByKey.get(legacyReplacementKey(p.slug))]));
  const legacyIds = retirable.map((p) => p._id);

  // Contests: re-point the ones nobody has submitted to, remember the ones in use.
  const protectedIds = new Set();
  const contests = await Contest.find({ problemIds: { $in: legacyIds } }).lean();
  for (const contest of contests) {
    const used = await ContestSubmission.exists({ contestId: contest._id });
    if (used) {
      for (const id of contest.problemIds) if (replacementOf.has(idKey(id))) protectedIds.add(idKey(id));
      continue;
    }
    const mapped = [];
    const seen = new Set();
    for (const id of contest.problemIds) {
      const target = replacementOf.get(idKey(id))?._id ?? id;
      if (!seen.has(idKey(target))) {
        seen.add(idKey(target));
        mapped.push(target);
      }
    }
    if (mapped.length < contest.problemIds.length) {
      const fillers = await Problem.find({ status: 'published', difficulty: contest.difficulty, slug: { $not: LEGACY_SLUG }, _id: { $nin: mapped } })
        .sort({ slug: 1 })
        .select('_id')
        .lean();
      for (const filler of fillers) {
        if (mapped.length >= contest.problemIds.length) break;
        mapped.push(filler._id);
      }
    }
    await Contest.updateOne({ _id: contest._id }, { $set: { problemIds: mapped } });
    result.contestsRemapped += 1;
  }

  // Bookmarks and notes follow the problem to its replacement.
  const bookmarks = await Bookmark.find({ targetType: 'problem', targetId: { $in: legacyIds } }).lean();
  for (const bookmark of bookmarks) {
    const target = replacementOf.get(idKey(bookmark.targetId))._id;
    const duplicate = await Bookmark.exists({ userId: bookmark.userId, targetType: 'problem', targetId: target });
    if (duplicate) await Bookmark.deleteOne({ _id: bookmark._id });
    else await Bookmark.updateOne({ _id: bookmark._id }, { $set: { targetId: target } });
    result.bookmarksMoved += 1;
  }
  const notes = await Note.find({ problemId: { $in: legacyIds } }).select('_id problemId').lean();
  for (const note of notes) {
    await Note.updateOne({ _id: note._id }, { $set: { problemId: replacementOf.get(idKey(note.problemId))._id } });
    result.notesMoved += 1;
  }

  // Lesson links to retired copies are dropped; the seed relinks lessons to the real problems.
  await Topic.updateMany({ relatedProblems: { $in: legacyIds } }, { $pull: { relatedProblems: { $in: legacyIds } } });

  for (const problem of retirable) {
    if (protectedIds.has(idKey(problem._id))) {
      const r = replacementOf.get(idKey(problem._id));
      await Problem.updateOne(
        { _id: problem._id },
        {
          $set: {
            title: r.title,
            description: r.description,
            constraints: r.constraints,
            examples: r.examples,
            testCases: r.testCases,
            hints: r.hints,
            editorial: r.editorial,
            tags: r.tags,
            referenceSolution: r.referenceSolution,
            status: 'published',
          },
        }
      );
      result.kept += 1;
    } else if (problem.status !== 'archived') {
      await Problem.updateOne({ _id: problem._id }, { $set: { status: 'archived' } });
      result.archived += 1;
    }
  }

  return result;
}

export default retireLegacyProblems;
