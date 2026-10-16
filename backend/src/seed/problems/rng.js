/** Deterministic random helpers so generated hidden test cases are identical on every seed run. */
function hashString(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function createRng(seedText) {
  let state = hashString(String(seedText)) || 1;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (lo, hi) => lo + Math.floor(next() * (hi - lo + 1));
  const rng = {
    next,
    int,
    pick: (list) => list[int(0, list.length - 1)],
    arr: (n, lo, hi) => Array.from({ length: n }, () => int(lo, hi)),
    /** n distinct integers from [lo, hi], in random order. */
    distinct: (n, lo, hi) => {
      const pool = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
      for (let i = pool.length - 1; i > 0; i -= 1) {
        const j = int(0, i);
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      return pool.slice(0, n);
    },
    perm: (n) => rng.distinct(n, 0, n - 1),
    str: (n, alphabet = 'abcdefghijklmnopqrstuvwxyz') => Array.from({ length: n }, () => alphabet[int(0, alphabet.length - 1)]).join(''),
    /** Random connected undirected graph on n nodes (0-based) with `extra` extra edges: [u, v] pairs. */
    graph: (n, extra = 0) => {
      const edges = [];
      const seen = new Set();
      const add = (u, v) => {
        const key = u < v ? `${u},${v}` : `${v},${u}`;
        if (u === v || seen.has(key)) return false;
        seen.add(key);
        edges.push([u, v]);
        return true;
      };
      for (let v = 1; v < n; v += 1) add(int(0, v - 1), v);
      let tries = extra * 5;
      let left = extra;
      while (left > 0 && tries > 0 && n > 2) {
        if (add(int(0, n - 1), int(0, n - 1))) left -= 1;
        tries -= 1;
      }
      return edges;
    },
  };
  return rng;
}

export default createRng;
