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

export default {
  dfs,
  bfs,
  dijkstra,
  bellmanFord,
  floydWarshall,
  prim,
  kruskal,
  astar,
};
