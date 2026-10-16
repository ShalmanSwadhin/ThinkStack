import crypto from 'node:crypto';

/**
 * Edit protection for seed-managed records.
 *
 * `seed --sync` rewrites topics, quizzes and problems from the source data. Without a guard it
 * would silently replace anything an admin changed through the admin panel since the last seed.
 * After every seed write we store a fingerprint of the record exactly as it is stored; a later
 * sync recomputes the fingerprint and, when it no longer matches, knows the record was edited
 * by someone else and leaves it alone (reporting it) unless the run is forced.
 *
 * Records seeded before this guard existed carry no fingerprint: they are treated as seed output,
 * overwritten once, and fingerprinted from then on.
 */
export const TOPIC_FIELDS = [
  'title', 'description', 'category', 'difficulty', 'order', 'estimatedMinutes', 'tags', 'status',
  'xpReward', 'content', 'animationConfig', 'relatedProblems', 'navigation',
];
export const QUIZ_FIELDS = ['title', 'category', 'passingScore', 'timeLimitMinutes', 'questions', 'xpReward', 'status'];
export const PROBLEM_FIELDS = [
  'title', 'difficulty', 'tags', 'topicSlugs', 'description', 'constraints', 'hints', 'editorial', 'examples',
  'testCases', 'starterCode', 'referenceSolution', 'companies', 'status',
];

const isObjectId = (value) => value && typeof value === 'object' && value._bsontype === 'ObjectId';

function canonical(value) {
  if (value === undefined) return null;
  if (value === null || typeof value !== 'object') return value;
  if (isObjectId(value)) return String(value);
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(canonical);
  const out = {};
  for (const key of Object.keys(value).sort()) out[key] = canonical(value[key]);
  return out;
}

/** Fingerprint of the listed fields of a stored (lean) document. */
export function fingerprint(doc, fields) {
  const picked = {};
  for (const field of fields) picked[field] = doc?.[field];
  return crypto.createHash('sha1').update(JSON.stringify(canonical(picked))).digest('hex');
}

/** True when the stored record carries a seed fingerprint that no longer matches its content. */
export function isEditedSinceSeed(doc, fields) {
  return Boolean(doc?.seedHash) && doc.seedHash !== fingerprint(doc, fields);
}

/** Stamp a record with the fingerprint of its current stored content. */
export async function stampSeedHash(Model, id, fields) {
  const stored = await Model.findById(id).select(fields.join(' ')).lean();
  if (!stored) return;
  await Model.updateOne({ _id: id }, { $set: { seedHash: fingerprint(stored, fields) } }, { timestamps: false });
}
