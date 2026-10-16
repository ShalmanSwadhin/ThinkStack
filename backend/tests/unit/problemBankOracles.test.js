/**
 * Independent cross-checks of the problem bank.
 *
 * problemBank.test.js proves every reference solution agrees with the hand-written examples.
 * This file goes further for the trickier problems: each one is re-solved here with a
 * DIFFERENT, deliberately naive method (brute force, exhaustive search, simulation) on many
 * generated inputs, so a bug that survives both the examples and the reference solution would
 * still have to be reproduced by an unrelated algorithm to go unnoticed.
 */
import { PROBLEM_SPECS } from '../../src/seed/problems/index.js';
import { createRng } from '../../src/seed/problems/rng.js';

const spec = (title) => {
  const found = PROBLEM_SPECS.find((s) => s.title === title);
  if (!found) throw new Error(`no problem called ${title}`);
  return found;
};
const nums = (text) => text.trim().split(/\s+/).map(Number);

/** Run `oracle(input)` against the reference solution on `rounds` generated inputs. */
function crossCheck(title, oracle, { rounds = 24, sizes = [1, 2, 3, 4, 5, 6, 7, 8] } = {}) {
  const s = spec(title);
  const mismatches = [];
  for (let i = 0; i < rounds; i += 1) {
    const n = sizes[i % sizes.length];
    const input = s.gen(createRng(`oracle:${title}:${i}`), n);
    const expected = String(oracle(input)).trim();
    const actual = String(s.solve(input)).trim();
    if (expected !== actual) mismatches.push({ input, expected, actual });
  }
  expect(mismatches).toEqual([]);
}

function components(n, edges, skipNode = -1, skipEdge = -1) {
  const p = Array.from({ length: n }, (_, i) => i);
  const f = (x) => { while (p[x] !== x) x = p[x]; return x; };
  let c = 0;
  for (let i = 0; i < n; i += 1) if (i !== skipNode) c += 1;
  edges.forEach(([u, v], idx) => {
    if (idx === skipEdge || u === skipNode || v === skipNode) return;
    const a = f(u);
    const b = f(v);
    if (a !== b) { p[a] = b; c -= 1; }
  });
  return c;
}

const parseGraph = (input) => {
  const [n, m, ...e] = nums(input);
  const edges = [];
  for (let i = 0; i < m; i += 1) edges.push([e[2 * i], e[2 * i + 1]]);
  return { n, edges };
};

describe('independent oracles agree with the reference solutions', () => {
  it('N Queens Count matches the known sequence', () => {
    const known = [1, 0, 0, 2, 10, 4, 40, 92, 352];
    for (let n = 1; n <= 9; n += 1) expect(Number(spec('N Queens Count').solve(String(n)))).toBe(known[n - 1]);
  });

  it('Articulation Points Count: remove each node and compare component counts', () => {
    crossCheck('Articulation Points Count', (input) => {
      const { n, edges } = parseGraph(input);
      const base = components(n, edges);
      let c = 0;
      for (let v = 0; v < n; v += 1) if (components(n, edges, v) > base - (edges.some(([a, b]) => a === v || b === v) ? 0 : 1)) c += 1;
      return c;
    });
  });

  it('Bridges Count: remove each edge and compare component counts', () => {
    crossCheck('Bridges Count', (input) => {
      const { n, edges } = parseGraph(input);
      const base = components(n, edges);
      let c = 0;
      for (let i = 0; i < edges.length; i += 1) if (components(n, edges, -1, i) > base) c += 1;
      return c;
    });
  });

  it('Edit Distance matches memoised recursion', () => {
    crossCheck('Edit Distance', (input) => {
      const [a, b = ''] = input.replace(/\r/g, '').split('\n');
      const memo = new Map();
      const go = (i, j) => {
        if (i === a.length) return b.length - j;
        if (j === b.length) return a.length - i;
        const key = `${i},${j}`;
        if (memo.has(key)) return memo.get(key);
        const r = a[i] === b[j] ? go(i + 1, j + 1) : 1 + Math.min(go(i + 1, j), go(i, j + 1), go(i + 1, j + 1));
        memo.set(key, r);
        return r;
      };
      return go(0, 0);
    });
  });

  it('Longest Increasing Subsequence matches exhaustive subsets', () => {
    crossCheck('Longest Increasing Subsequence', (input) => {
      const [n, ...a] = nums(input);
      let best = 0;
      for (let mask = 0; mask < 1 << n; mask += 1) {
        let last = -Infinity;
        let ok = true;
        let len = 0;
        for (let i = 0; i < n && ok; i += 1) if (mask & (1 << i)) { if (a[i] <= last) ok = false; last = a[i]; len += 1; }
        if (ok) best = Math.max(best, len);
      }
      return best;
    }, { sizes: [1, 2, 3, 5, 8, 10, 12, 4] });
  });

  it('Maximum Flow equals the minimum cut over all node subsets', () => {
    crossCheck('Maximum Flow', (input) => {
      const [n, m, ...e] = nums(input);
      let best = Infinity;
      for (let mask = 0; mask < 1 << n; mask += 1) {
        if (!(mask & 1) || mask & (1 << (n - 1))) continue;
        let cut = 0;
        for (let i = 0; i < m; i += 1) if ((mask & (1 << e[3 * i])) && !(mask & (1 << e[3 * i + 1]))) cut += e[3 * i + 2];
        best = Math.min(best, cut);
      }
      return best;
    }, { sizes: [1, 2, 3, 4, 5, 6, 3, 4] });
  });

  it('Dijkstra Shortest Path matches Bellman-Ford', () => {
    crossCheck('Dijkstra Shortest Path', (input) => {
      const [n, m, ...e] = nums(input);
      const d = Array(n).fill(Infinity);
      d[0] = 0;
      for (let it = 0; it < n; it += 1) for (let i = 0; i < m; i += 1) {
        const [u, v, w] = [e[3 * i], e[3 * i + 1], e[3 * i + 2]];
        if (d[u] + w < d[v]) d[v] = d[u] + w;
        if (d[v] + w < d[u]) d[u] = d[v] + w;
      }
      return d.map((x) => (x === Infinity ? -1 : x)).join(' ');
    });
  });

  it('Trapping Rain Water matches the per-bar definition', () => {
    crossCheck('Trapping Rain Water', (input) => {
      const [n, ...a] = nums(input);
      let w = 0;
      for (let i = 0; i < n; i += 1) w += Math.max(0, Math.min(Math.max(...a.slice(0, i + 1)), Math.max(...a.slice(i, n))) - a[i]);
      return w;
    }, { rounds: 40, sizes: [1, 2, 3, 5, 8, 13, 21, 25] });
  });

  it('Coin Change Minimum matches breadth-first search over amounts', () => {
    crossCheck('Coin Change Minimum', (input) => {
      const l = input.trim().split('\n');
      const amount = Number(l[0]);
      const coins = l[1].trim().split(/\s+/).map(Number);
      const dist = new Map([[0, 0]]);
      const q = [0];
      for (let h = 0; h < q.length; h += 1) for (const c of coins) {
        const nx = q[h] + c;
        if (nx <= amount && !dist.has(nx)) { dist.set(nx, dist.get(q[h]) + 1); q.push(nx); }
      }
      return dist.has(amount) ? dist.get(amount) : -1;
    });
  });

  it('Josephus Problem matches direct simulation', () => {
    crossCheck('Josephus Problem', (input) => {
      const [n, k] = nums(input);
      const people = Array.from({ length: n }, (_, i) => i + 1);
      let idx = 0;
      while (people.length > 1) { idx = (idx + k - 1) % people.length; people.splice(idx, 1); }
      return people[0];
    }, { sizes: [1, 2, 3, 4, 5, 8, 12, 20] });
  });

  it('Digit Sum Count Up To N matches counting every number', () => {
    crossCheck('Digit Sum Count Up To N', (input) => {
      const [N, S] = nums(input);
      let c = 0;
      for (let x = 0; x <= Math.min(N, 5000); x += 1) if ([...String(x)].reduce((s, d) => s + Number(d), 0) === S) c += 1;
      return N > 5000 ? null : c;
    }, { rounds: 1 });
    const s = spec('Digit Sum Count Up To N');
    for (const [N, S] of [[99, 9], [1000, 3], [4999, 20], [10, 1], [0, 0]]) {
      let c = 0;
      for (let x = 0; x <= N; x += 1) if ([...String(x)].reduce((a, d) => a + Number(d), 0) === S) c += 1;
      expect(Number(s.solve(`${N} ${S}`))).toBe(c);
    }
  });

  it('Chinese Remainder Theorem matches a search over the residues', () => {
    crossCheck('Chinese Remainder Theorem', (input) => {
      const [k, ...v] = nums(input);
      let M = 1;
      for (let i = 0; i < k; i += 1) M *= v[2 * i + 1];
      for (let x = 0; x < M; x += 1) {
        let ok = true;
        for (let i = 0; i < k; i += 1) if (x % v[2 * i + 1] !== v[2 * i]) ok = false;
        if (ok) return x;
      }
      return -1;
    });
  });

  it('Egg Drop Minimum Trials matches the classic recursion', () => {
    crossCheck('Egg Drop Minimum Trials', (input) => {
      const [k, n] = nums(input);
      const memo = new Map();
      const go = (e, f) => {
        if (f <= 1 || e === 1) return f;
        const key = `${e},${f}`;
        if (memo.has(key)) return memo.get(key);
        let best = Infinity;
        for (let x = 1; x <= f; x += 1) best = Math.min(best, 1 + Math.max(go(e - 1, x - 1), go(e, f - x)));
        memo.set(key, best);
        return best;
      };
      return go(k, n);
    }, { sizes: [1, 2, 3, 4, 5, 6, 7, 8] });
  });

  it('Traveling Salesman Minimum Cost matches trying every permutation', () => {
    crossCheck('Traveling Salesman Minimum Cost', (input) => {
      const [n, ...v] = nums(input);
      const c = (i, j) => v[i * n + j];
      let best = Infinity;
      const perm = (rest, last, cost) => {
        if (!rest.length) { best = Math.min(best, cost + c(last, 0)); return; }
        rest.forEach((x, i) => perm(rest.filter((_, j) => j !== i), x, cost + c(last, x)));
      };
      perm(Array.from({ length: n - 1 }, (_, i) => i + 1), 0, 0);
      return best;
    }, { sizes: [1, 2, 3, 4, 5, 6, 4, 5] });
  });

  it('Minimum Cost Task Assignment matches trying every permutation', () => {
    crossCheck('Minimum Cost Task Assignment', (input) => {
      const [n, ...v] = nums(input);
      let best = Infinity;
      const perm = (used, row, cost) => {
        if (row === n) { best = Math.min(best, cost); return; }
        for (let j = 0; j < n; j += 1) if (!used[j]) { used[j] = true; perm(used, row + 1, cost + v[row * n + j]); used[j] = false; }
      };
      perm(Array(n).fill(false), 0, 0);
      return best;
    }, { sizes: [1, 2, 3, 4, 5, 6, 3, 4] });
  });

  it('Largest Rectangle in Histogram matches checking every bar range', () => {
    crossCheck('Largest Rectangle in Histogram', (input) => {
      const [n, ...a] = nums(input);
      let best = 0;
      for (let i = 0; i < n; i += 1) { let mn = Infinity; for (let j = i; j < n; j += 1) { mn = Math.min(mn, a[j]); best = Math.max(best, mn * (j - i + 1)); } }
      return best;
    }, { rounds: 40, sizes: [1, 2, 3, 5, 8, 13, 21, 25] });
  });

  it('Fibonacci Modulo Huge N matches iteration for small n', () => {
    const s = spec('Fibonacci Modulo Huge N');
    const P = 1000000007n;
    let a = 0n;
    let b = 1n;
    for (let n = 0; n <= 300; n += 1) { expect(s.solve(String(n))).toBe(a.toString()); [a, b] = [b, (a + b) % P]; }
  });

  it('Convex Hull Vertex Count matches the "not inside the others" definition', () => {
    crossCheck('Convex Hull Vertex Count', (input) => {
      const [n, ...v] = nums(input);
      const pts = [...new Set(Array.from({ length: n }, (_, i) => `${v[2 * i]},${v[2 * i + 1]}`))].map((s) => s.split(',').map(Number));
      if (pts.length <= 2) return pts.length;
      const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
      let count = 0;
      // A point is a hull corner when some line through it has every other point strictly on one side or on the line outside its open segment...
      // equivalently: it is not a convex combination of the others. Check via triangles and segments.
      for (const p of pts) {
        const others = pts.filter((q) => q !== p);
        let inside = false;
        for (let i = 0; i < others.length && !inside; i += 1) for (let j = i + 1; j < others.length && !inside; j += 1) {
          const a = others[i];
          const b = others[j];
          if (cr(a, b, p) === 0 && Math.min(a[0], b[0]) <= p[0] && p[0] <= Math.max(a[0], b[0]) && Math.min(a[1], b[1]) <= p[1] && p[1] <= Math.max(a[1], b[1])) inside = true;
          for (let k = j + 1; k < others.length && !inside; k += 1) {
            const c = others[k];
            const d1 = cr(a, b, p);
            const d2 = cr(b, c, p);
            const d3 = cr(c, a, p);
            const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
            const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
            if (!(hasNeg && hasPos) && cr(a, b, c) !== 0) inside = true;
          }
        }
        if (!inside) count += 1;
      }
      return count;
    }, { sizes: [1, 2, 3, 4, 5, 6, 7, 8] });
  });

  it('Strongly Connected Components Count matches pairwise reachability', () => {
    crossCheck('Strongly Connected Components Count', (input) => {
      const { n, edges } = parseGraph(input);
      const reach = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j));
      for (const [u, v] of edges) reach[u][v] = true;
      for (let k = 0; k < n; k += 1) for (let i = 0; i < n; i += 1) for (let j = 0; j < n; j += 1) if (reach[i][k] && reach[k][j]) reach[i][j] = true;
      const comp = Array(n).fill(-1);
      let c = 0;
      for (let i = 0; i < n; i += 1) if (comp[i] < 0) { c += 1; for (let j = 0; j < n; j += 1) if (reach[i][j] && reach[j][i]) comp[j] = c; }
      return c;
    });
  });
});

describe('problem bank shape', () => {
  it('has 300 problems split 100 / 130 / 70 so that every solved-problems badge stays reachable', () => {
    const count = (d) => PROBLEM_SPECS.filter((s) => s.difficulty === d).length;
    expect(PROBLEM_SPECS).toHaveLength(300);
    expect([count('easy'), count('medium'), count('hard')]).toEqual([100, 130, 70]);
  });
});
