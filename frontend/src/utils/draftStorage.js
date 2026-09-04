/**
 * Session/local draft persistence helpers.
 */
export function readDraft(key, fallback = null) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeDraft(key, value) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable
  }
}

export function clearDraft(key) {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(key);
}

export function draftKeys(prefix, id) {
  return `${prefix}:${id ?? 'new'}`;
}
