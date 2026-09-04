/**
 * IR parse cache — avoids reparsing unchanged source code.
 */

const cache = new Map();
const MAX_CACHE_SIZE = 100;

export function getCachedIR(sourceHash) {
  return cache.get(sourceHash) ?? null;
}

export function setCachedIR(sourceHash, program) {
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  cache.set(sourceHash, program);
}

export function clearIRCache() {
  cache.clear();
}

export function getCacheStats() {
  return { size: cache.size, maxSize: MAX_CACHE_SIZE };
}

export default { getCachedIR, setCachedIR, clearIRCache, getCacheStats };
