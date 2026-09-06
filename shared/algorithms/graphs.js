import { initStats, pushGraphStep, graphLayout, DEFAULT_GRAPH } from './core.js';

const withGraph = (steps, stats, description, highlights, extra = {}) => {
  pushGraphStep(
    steps,
    stats,
    description,
    graphLayout(DEFAULT_GRAPH.nodes, DEFAULT_GRAPH.edges, highlights, {
      start: DEFAULT_GRAPH.start,
      goal: DEFAULT_GRAPH.goal,
      ...extra,
    })
  );
};

export const dfs = (input = {}) => {
  const start = input.start ?? DEFAULT_GRAPH.start;
  const steps = [];
  const stats = initStats();
  const adj = buildAdj(DEFAULT_GRAPH.edges);
  const visited = [];
  const stack = [start];

  withGraph(steps, stats, `Start DFS from node ${start}.`, { nodes: [start], edges: [] }, { visited: [], start });

  while (stack.length) {
    const node = stack.pop();
    if (visited.includes(node)) continue;
    visited.push(node);
    stats.comparisons += 1;
    withGraph(steps, stats, `Visit node ${node}.`, { nodes: [node], edges: [] }, { visited: [...visited], start });

    [...(adj[node] ?? [])].reverse().forEach((next) => {
      if (!visited.includes(next)) {
        stats.comparisons += 1;
        stack.push(next);
        withGraph(steps, stats, `Push neighbor ${next} onto stack.`, { nodes: [next], edges: [] }, { visited: [...visited], start });
      }
    });
  }

  withGraph(steps, stats, 'DFS traversal complete.', { nodes: visited, edges: [] }, { visited, start });
  return steps;
};

export const bfs = (input = {}) => {
  const start = input.start ?? DEFAULT_GRAPH.start;
  const steps = [];
  const stats = initStats();
  const adj = buildAdj(DEFAULT_GRAPH.edges);
  const visited = [];
  const queue = [start];

  withGraph(steps, stats, `Start BFS from node ${start}.`, { nodes: [start], edges: [] }, { visited: [], queue: [...queue], start });

  while (queue.length) {
    const node = queue.shift();
    if (visited.includes(node)) continue;
    visited.push(node);
    stats.comparisons += 1;
    withGraph(steps, stats, `Visit node ${node}.`, { nodes: [node], edges: [] }, { visited: [...visited], queue: [...queue], start });

    (adj[node] ?? []).forEach((next) => {
      if (!visited.includes(next) && !queue.includes(next)) {
        queue.push(next);
        stats.comparisons += 1;
        withGraph(steps, stats, `Enqueue neighbor ${next}.`, { nodes: [next], edges: [] }, { visited: [...visited], queue: [...queue], start });
      }
    });
  }

  withGraph(steps, stats, 'BFS traversal complete.', { nodes: visited, edges: [] }, { visited, start });
  return steps;
};

export const dijkstra = (input = {}) => {
  const start = input.start ?? DEFAULT_GRAPH.start;
  const steps = [];
  const stats = initStats();
  const distances = Object.fromEntries(DEFAULT_GRAPH.nodes.map((node) => [node.id, Infinity]));
  distances[start] = 0;
  const visited = [];
  const unvisited = new Set(DEFAULT_GRAPH.nodes.map((node) => node.id));

  withGraph(steps, stats, `Initialize distances from ${start}.`, { nodes: [start], edges: [] }, { distances: { ...distances }, visited, start });

  while (unvisited.size) {
    let current = null;
    let best = Infinity;
    unvisited.forEach((node) => {
      stats.comparisons += 1;
      if (distances[node] < best) {
        best = distances[node];
        current = node;
      }
    });

    if (current === null || best === Infinity) break;
    unvisited.delete(current);
    visited.push(current);
    withGraph(steps, stats, `Select node ${current} with distance ${distances[current]}.`, { nodes: [current], edges: [] }, { distances: { ...distances }, visited: [...visited], start });

    DEFAULT_GRAPH.edges
      .filter((edge) => edge.source === current)
      .forEach((edge) => {
        const alt = distances[current] + edge.weight;
        stats.comparisons += 1;
        if (alt < distances[edge.target]) {
          distances[edge.target] = alt;
          withGraph(steps, stats, `Relax edge ${edge.source}-${edge.target} to distance ${alt}.`, { nodes: [edge.target], edges: [edge.id] }, { distances: { ...distances }, visited: [...visited], start });
        }
      });
  }

  withGraph(steps, stats, 'Dijkstra complete.', { nodes: visited, edges: [] }, { distances, visited, start });
  return steps;
};

export const bellmanFord = () => {
  const steps = [];
  const stats = initStats();
  const distances = Object.fromEntries(DEFAULT_GRAPH.nodes.map((node) => [node.id, Infinity]));
  distances[DEFAULT_GRAPH.start] = 0;

  withGraph(steps, stats, 'Initialize Bellman-Ford distances.', { nodes: [DEFAULT_GRAPH.start], edges: [] }, { distances: { ...distances }, start: DEFAULT_GRAPH.start });

  for (let i = 0; i < DEFAULT_GRAPH.nodes.length - 1; i += 1) {
    DEFAULT_GRAPH.edges.forEach((edge) => {
      const alt = distances[edge.source] + edge.weight;
      stats.comparisons += 1;
      if (distances[edge.source] !== Infinity && alt < distances[edge.target]) {
        distances[edge.target] = alt;
        withGraph(steps, stats, `Relax ${edge.source}-${edge.target} to ${alt} (pass ${i + 1}).`, { nodes: [edge.target], edges: [edge.id] }, { distances: { ...distances }, start: DEFAULT_GRAPH.start });
      }
    });
  }

  withGraph(steps, stats, 'Bellman-Ford complete.', { nodes: DEFAULT_GRAPH.nodes.map((n) => n.id), edges: [] }, { distances, start: DEFAULT_GRAPH.start });
  return steps;
};

export const floydWarshall = () => {
  const ids = DEFAULT_GRAPH.nodes.map((node) => node.id);
  const dist = Object.fromEntries(ids.map((id) => [id, Object.fromEntries(ids.map((other) => [other, id === other ? 0 : Infinity]))]));

  DEFAULT_GRAPH.edges.forEach((edge) => {
    dist[edge.source][edge.target] = edge.weight;
  });

  const steps = [];
  const stats = initStats();

  const matrix = () => ids.map((row) => ids.map((col) => dist[row][col]));

  pushMatrix(steps, stats, 'Initialize distance matrix.', matrix());

  ids.forEach((k) => {
    ids.forEach((i) => {
      ids.forEach((j) => {
        stats.comparisons += 1;
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j];
          pushMatrix(steps, stats, `Relax path ${i}→${k}→${j} using intermediate ${k}.`, matrix(), [[i, j]]);
        }
      });
    });
  });

  pushMatrix(steps, stats, 'Floyd-Warshall complete.', matrix());
  return steps;
};

const pushMatrix = (steps, stats, description, values, highlights = []) => {
  stats.steps += 1;
  steps.push({
    description,
    state: {
      type: 'matrix',
      labels: DEFAULT_GRAPH.nodes.map((node) => node.id),
      values,
      highlights,
    },
    stats: { ...stats },
  });
};

export const prim = () => {
  const steps = [];
  const stats = initStats();
  const start = DEFAULT_GRAPH.start;
  const mstEdges = [];
  const inMst = new Set([start]);

  withGraph(steps, stats, `Start Prim's MST from ${start}.`, { nodes: [start], edges: [] }, { mstEdges: [], start });

  while (inMst.size < DEFAULT_GRAPH.nodes.length) {
    let best = null;
    DEFAULT_GRAPH.edges.forEach((edge) => {
      const connects =
        (inMst.has(edge.source) && !inMst.has(edge.target)) ||
        (inMst.has(edge.target) && !inMst.has(edge.source));
      if (!connects) return;
      stats.comparisons += 1;
      if (!best || edge.weight < best.weight) best = edge;
    });

    if (!best) break;
    mstEdges.push(best.id);
    inMst.add(best.source);
    inMst.add(best.target);
    withGraph(steps, stats, `Add edge ${best.source}-${best.target} (weight ${best.weight}) to MST.`, { nodes: [best.source, best.target], edges: [best.id] }, { mstEdges: [...mstEdges], start });
  }

  withGraph(steps, stats, "Prim's algorithm complete.", { nodes: [...inMst], edges: mstEdges }, { mstEdges, start });
  return steps;
};

export const kruskal = () => {
  const steps = [];
  const stats = initStats();
  const parent = Object.fromEntries(DEFAULT_GRAPH.nodes.map((node) => [node.id, node.id]));
  const mstEdges = [];

  const find = (x) => {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  };

  const union = (a, b) => {
    parent[find(a)] = find(b);
  };

  const edges = [...DEFAULT_GRAPH.edges].sort((a, b) => a.weight - b.weight);
  withGraph(steps, stats, 'Sort edges by weight for Kruskal.', { nodes: [], edges: [] }, { mstEdges: [] });

  edges.forEach((edge) => {
    stats.comparisons += 1;
    if (find(edge.source) !== find(edge.target)) {
      union(edge.source, edge.target);
      mstEdges.push(edge.id);
      withGraph(steps, stats, `Add edge ${edge.source}-${edge.target} (weight ${edge.weight}).`, { nodes: [edge.source, edge.target], edges: [edge.id] }, { mstEdges: [...mstEdges] });
    } else {
      withGraph(steps, stats, `Skip edge ${edge.source}-${edge.target} (would form cycle).`, { nodes: [], edges: [edge.id] }, { mstEdges: [...mstEdges] });
    }
  });

  withGraph(steps, stats, "Kruskal's algorithm complete.", { nodes: DEFAULT_GRAPH.nodes.map((n) => n.id), edges: mstEdges }, { mstEdges });
  return steps;
};

export const astar = (input = {}) => {
  const start = input.start ?? DEFAULT_GRAPH.start;
  const goal = input.goal ?? DEFAULT_GRAPH.goal;
  const steps = [];
  const stats = initStats();
  const heuristic = { A: 7, B: 6, C: 2, D: 1, E: 0 };
  const open = [start];
  const cameFrom = {};
  const gScore = Object.fromEntries(DEFAULT_GRAPH.nodes.map((node) => [node.id, Infinity]));
  gScore[start] = 0;

  withGraph(steps, stats, `A* search from ${start} to ${goal}.`, { nodes: [start], edges: [] }, { start, goal, path: [start] });

  while (open.length) {
    open.sort((a, b) => gScore[a] + heuristic[a] - (gScore[b] + heuristic[b]));
    const current = open.shift();
    stats.comparisons += 1;
    withGraph(steps, stats, `Expand node ${current} (f=${gScore[current] + heuristic[current]}).`, { nodes: [current], edges: [] }, { start, goal, path: reconstruct(cameFrom, current) });

    if (current === goal) {
      withGraph(steps, stats, `Goal ${goal} reached.`, { nodes: reconstruct(cameFrom, goal), edges: [] }, { start, goal, path: reconstruct(cameFrom, goal) });
      return steps;
    }

    DEFAULT_GRAPH.edges
      .filter((edge) => edge.source === current)
      .forEach((edge) => {
        const tentative = gScore[current] + edge.weight;
        stats.comparisons += 1;
        if (tentative < gScore[edge.target]) {
          cameFrom[edge.target] = current;
          gScore[edge.target] = tentative;
          if (!open.includes(edge.target)) open.push(edge.target);
          withGraph(steps, stats, `Update path to ${edge.target} with cost ${tentative}.`, { nodes: [edge.target], edges: [edge.id] }, { start, goal, path: reconstruct(cameFrom, edge.target) });
        }
      });
  }

  withGraph(steps, stats, 'A* could not reach goal.', { nodes: [], edges: [] }, { start, goal });
  return steps;
};

const buildAdj = (edges) => {
  const adj = {};
  edges.forEach((edge) => {
    if (!adj[edge.source]) adj[edge.source] = [];
    if (!adj[edge.target]) adj[edge.target] = [];
    adj[edge.source].push(edge.target);
    adj[edge.target].push(edge.source);
  });
  return adj;
};

const reconstruct = (cameFrom, current) => {
  const path = [current];
  while (cameFrom[current]) {
    current = cameFrom[current];
    path.unshift(current);
  }
  return path;
};

const buildDirectedAdj = (edges) => {
  const adj = {};
  edges.forEach((edge) => {
    if (!adj[edge.source]) adj[edge.source] = [];
    adj[edge.source].push(edge.target);
  });
  return adj;
};

/** Kahn's algorithm — BFS-based topological sort using in-degree counts */
export const topologicalSort = () => {
  const steps = [];
  const stats = initStats();
  const adj = buildDirectedAdj(DEFAULT_GRAPH.edges);
  const indegree = Object.fromEntries(DEFAULT_GRAPH.nodes.map((n) => [n.id, 0]));
  DEFAULT_GRAPH.edges.forEach((edge) => {
    indegree[edge.target] += 1;
  });

  withGraph(steps, stats, 'Compute in-degree of every node.', { nodes: [], edges: [] }, { visited: [] });

  const queue = DEFAULT_GRAPH.nodes.filter((n) => indegree[n.id] === 0).map((n) => n.id);
  const order = [];

  while (queue.length) {
    const node = queue.shift();
    order.push(node);
    stats.comparisons += 1;
    withGraph(steps, stats, `Remove node ${node} (in-degree 0). Order so far: [${order.join(', ')}].`, { nodes: [node], edges: [] }, { visited: [...order] });

    (adj[node] ?? []).forEach((next) => {
      indegree[next] -= 1;
      stats.comparisons += 1;
      withGraph(steps, stats, `Decrement in-degree of ${next} to ${indegree[next]}.`, { nodes: [next], edges: [] }, { visited: [...order] });
      if (indegree[next] === 0) queue.push(next);
    });
  }

  withGraph(steps, stats, `Topological order: [${order.join(', ')}].`, { nodes: order, edges: [] }, { visited: order });
  return steps;
};

/** Union-Find (Disjoint Set Union) with path compression — processes edges in given order, no weight sorting */
export const unionFind = () => {
  const steps = [];
  const stats = initStats();
  const parent = Object.fromEntries(DEFAULT_GRAPH.nodes.map((node) => [node.id, node.id]));
  const unioned = [];

  const find = (x, path = []) => {
    if (parent[x] !== x) {
      path.push(x);
      return find(parent[x], path);
    }
    path.forEach((node) => {
      parent[node] = x;
    });
    return x;
  };

  withGraph(steps, stats, 'Initialize each node as its own parent (singleton sets).', { nodes: [], edges: [] }, { mstEdges: [] });

  DEFAULT_GRAPH.edges.forEach((edge) => {
    const rootA = find(edge.source);
    const rootB = find(edge.target);
    stats.comparisons += 1;
    if (rootA !== rootB) {
      parent[rootA] = rootB;
      unioned.push(edge.id);
      withGraph(steps, stats, `Union(${edge.source}, ${edge.target}): different sets, merge them.`, { nodes: [edge.source, edge.target], edges: [edge.id] }, { mstEdges: [...unioned] });
    } else {
      withGraph(steps, stats, `Find(${edge.source}) == Find(${edge.target}): already connected, skip.`, { nodes: [], edges: [edge.id] }, { mstEdges: [...unioned] });
    }
  });

  withGraph(steps, stats, 'Union-Find processing complete.', { nodes: DEFAULT_GRAPH.nodes.map((n) => n.id), edges: unioned }, { mstEdges: unioned });
  return steps;
};

/** Kosaraju's algorithm — DFS finish order, then DFS on the transpose graph */
export const kosarajuSCC = () => {
  const steps = [];
  const stats = initStats();
  const adj = buildDirectedAdj(DEFAULT_GRAPH.edges);
  const transposeAdj = {};
  DEFAULT_GRAPH.edges.forEach((edge) => {
    if (!transposeAdj[edge.target]) transposeAdj[edge.target] = [];
    transposeAdj[edge.target].push(edge.source);
  });

  const visited = new Set();
  const finishOrder = [];

  withGraph(steps, stats, 'Pass 1: DFS on the original graph to compute finish order.', { nodes: [], edges: [] }, { visited: [] });

  const dfs1 = (node) => {
    visited.add(node);
    stats.comparisons += 1;
    withGraph(steps, stats, `Visit ${node} (pass 1).`, { nodes: [node], edges: [] }, { visited: [...visited] });
    (adj[node] ?? []).forEach((next) => {
      if (!visited.has(next)) dfs1(next);
    });
    finishOrder.push(node);
    withGraph(steps, stats, `Finish ${node}. Finish order: [${finishOrder.join(', ')}].`, { nodes: [node], edges: [] }, { visited: [...visited] });
  };
  DEFAULT_GRAPH.nodes.forEach((n) => {
    if (!visited.has(n.id)) dfs1(n.id);
  });

  withGraph(steps, stats, 'Pass 2: DFS on the transpose graph in reverse finish order.', { nodes: [], edges: [] }, { visited: [] });

  const visited2 = new Set();
  const components = [];
  [...finishOrder].reverse().forEach((node) => {
    if (visited2.has(node)) return;
    const component = [];
    const dfs2 = (u) => {
      visited2.add(u);
      component.push(u);
      stats.comparisons += 1;
      withGraph(steps, stats, `Visit ${u} (pass 2, component ${components.length + 1}).`, { nodes: [u], edges: [] }, { visited: [...visited2] });
      (transposeAdj[u] ?? []).forEach((next) => {
        if (!visited2.has(next)) dfs2(next);
      });
    };
    dfs2(node);
    components.push(component);
    withGraph(steps, stats, `Component ${components.length}: [${component.join(', ')}].`, { nodes: component, edges: [] }, { visited: [...visited2] });
  });

  withGraph(steps, stats, `Strongly connected components: ${components.map((c) => `[${c.join(', ')}]`).join(', ')}.`, { nodes: [...visited2], edges: [] }, { visited: [...visited2] });
  return steps;
};

/** Tarjan's bridge-finding algorithm (undirected) using discovery/low-link values */
export const tarjanBridges = () => {
  const steps = [];
  const stats = initStats();
  const adj = buildAdj(DEFAULT_GRAPH.edges);
  const edgeIdOf = {};
  DEFAULT_GRAPH.edges.forEach((e) => {
    edgeIdOf[`${e.source}-${e.target}`] = e.id;
    edgeIdOf[`${e.target}-${e.source}`] = e.id;
  });

  const disc = {};
  const low = {};
  const visited = new Set();
  const bridges = [];
  let timer = 0;

  withGraph(steps, stats, 'DFS to compute discovery and low-link values for each node.', { nodes: [], edges: [] }, { visited: [] });

  const dfs = (u, parentEdge) => {
    visited.add(u);
    disc[u] = low[u] = timer;
    timer += 1;
    withGraph(steps, stats, `Discover ${u} at time ${disc[u]}.`, { nodes: [u], edges: [] }, { visited: [...visited] });

    (adj[u] ?? []).forEach((v) => {
      const eid = edgeIdOf[`${u}-${v}`];
      if (eid === parentEdge) return;
      stats.comparisons += 1;
      if (visited.has(v)) {
        low[u] = Math.min(low[u], disc[v]);
        withGraph(steps, stats, `Back edge ${u}-${v}: update low[${u}] = ${low[u]}.`, { nodes: [u, v], edges: [eid] }, { visited: [...visited] });
      } else {
        dfs(v, eid);
        low[u] = Math.min(low[u], low[v]);
        withGraph(steps, stats, `Back from ${v}: low[${u}] = min(low[${u}], low[${v}]) = ${low[u]}.`, { nodes: [u, v], edges: [eid] }, { visited: [...visited] });
        if (low[v] > disc[u]) {
          bridges.push(eid);
          withGraph(steps, stats, `Edge ${u}-${v} is a bridge (low[${v}]=${low[v]} > disc[${u}]=${disc[u]}).`, { nodes: [u, v], edges: [eid] }, { visited: [...visited], mstEdges: [...bridges] });
        }
      }
    });
  };

  DEFAULT_GRAPH.nodes.forEach((n) => {
    if (!visited.has(n.id)) dfs(n.id, null);
  });

  withGraph(steps, stats, `Bridges found: ${bridges.length ? bridges.join(', ') : 'none'}.`, { nodes: [], edges: bridges }, { visited: [...visited], mstEdges: bridges });
  return steps;
};

/** Tarjan's articulation points algorithm (undirected) using discovery/low-link values */
export const tarjanArticulationPoints = () => {
  const steps = [];
  const stats = initStats();
  const adj = buildAdj(DEFAULT_GRAPH.edges);
  const disc = {};
  const low = {};
  const visited = new Set();
  const articulation = new Set();
  let timer = 0;

  withGraph(steps, stats, 'DFS to compute discovery and low-link values for each node.', { nodes: [], edges: [] }, { visited: [] });

  const dfs = (u, parent) => {
    visited.add(u);
    disc[u] = low[u] = timer;
    timer += 1;
    let children = 0;
    withGraph(steps, stats, `Discover ${u} at time ${disc[u]}.`, { nodes: [u], edges: [] }, { visited: [...visited] });

    (adj[u] ?? []).forEach((v) => {
      if (v === parent) return;
      stats.comparisons += 1;
      if (visited.has(v)) {
        low[u] = Math.min(low[u], disc[v]);
      } else {
        children += 1;
        dfs(v, u);
        low[u] = Math.min(low[u], low[v]);
        if (parent !== null && low[v] >= disc[u] && !articulation.has(u)) {
          articulation.add(u);
          withGraph(steps, stats, `${u} is an articulation point (child ${v} cannot reach above ${u}).`, { nodes: [u], edges: [] }, { visited: [...visited], mstEdges: [...articulation] });
        }
      }
    });

    if (parent === null && children > 1 && !articulation.has(u)) {
      articulation.add(u);
      withGraph(steps, stats, `${u} is an articulation point (root with ${children} independent subtrees).`, { nodes: [u], edges: [] }, { visited: [...visited], mstEdges: [...articulation] });
    }
  };

  DEFAULT_GRAPH.nodes.forEach((n) => {
    if (!visited.has(n.id)) dfs(n.id, null);
  });

  withGraph(steps, stats, `Articulation points: ${articulation.size ? [...articulation].join(', ') : 'none'}.`, { nodes: [...articulation], edges: [] }, { visited: [...visited], mstEdges: [...articulation] });
  return steps;
};

export default {
  dfs,
  bfs,
  dijkstra,
  bellmanFord,
  floydWarshall,
  prim,
  kruskal,
  astar,
  topologicalSort,
  unionFind,
  kosarajuSCC,
  tarjanBridges,
  tarjanArticulationPoints,
};
