import { RETURN_VALUE, call, entry, entryRule, rule } from './helpers.js';

const RETURN = RETURN_VALUE;
const COMPLETE = rule(/complete/i, [RETURN, '@last'], 'last');

// Appending an edge to the MST result, in each language's spelling.
const ADD_MST_EDGE = [
  /\b(?:mst_?edges|mstEdges|mst|result)\s*\.\s*(?:append|add|push|push_back)\s*\(/i,
  /\bmst\[count\+\+\]\s*=/,
];

// `low[u] = min(low[u], <other>[v])` in every spelling (min / MIN / Math.min / std::min).
const lowUpdate = (other) =>
  new RegExp(`\\blow\\s*\\[\\s*u\\s*\\]\\s*=\\s*(?:std::|Math\\.)?min\\s*\\(\\s*low\\s*\\[\\s*u\\s*\\]\\s*,\\s*${other}\\s*\\[\\s*v\\s*\\]`, 'i');

// The driver loop that starts a DFS from every unvisited node (absent from some listings,
// which show only the recursive helper — those fall back to the helper's signature).
const DFS_DRIVER = [
  /\bfor\s+node\s+in\b/,
  /\bfor\s*\(\s*(?:int|let|const)\s+node\b/,
  /\bfor each unvisited node\b/i,
  entry('(?:dfs_?bridges|dfs_?ap|dfs)'),
  '@first',
];

const DISCOVER = /\bdisc\s*\[\s*u\s*\]\s*=/;

export const GRAPHS = {
  dfs: [
    entryRule(/start dfs/i, 'dfs'),
    rule(
      /visit node/i,
      [
        /\b(?:node|u|current|cur)\s*=\s*\w*(?:stack|st)\w*\s*(?:\.\s*(?:pop|removeLast|remove)\s*\(|\[)/i,
        /\bvis(?:ited)?\s*\[\s*(?:u|start)\s*\]\s*=\s*(?:true|1)/,
        /\bvisited\s*\.\s*add\s*\(\s*start/,
      ],
      'first'
    ),
    rule(
      /push neighbor/i,
      [
        /\bstack\s*\.\s*(?:append|push|add|push_back|addLast)\s*\(\s*(?:neighbor|v)\s*\)/i,
        /\bdfs\s*\([^)]*\bv\b/,
      ],
      'first'
    ),
    COMPLETE,
  ],

  bfs: [
    entryRule(/start bfs/i, 'bfs'),
    rule(
      /visit node/i,
      [
        /\b(?:node|u)\s*=\s*\w*(?:queue|q)\w*\s*\.\s*(?:popleft|dequeue|poll|shift|remove|pop|front)\s*\(/i,
        /\b(?:u|node)\s*=\s*queue\s*\[\s*front\+\+\s*\]/,
      ],
      'first'
    ),
    rule(
      /enqueue neighbor/i,
      [
        /\b(?:queue|q)\s*\.\s*(?:append|enqueue|push|add|offer|push_back)\s*\(\s*(?:neighbor|v)\s*\)/i,
        /\bqueue\s*\[\s*rear\+\+\s*\]\s*=\s*v/,
      ],
      'first'
    ),
    COMPLETE,
  ],

  dijkstra: [
    rule(/initialize distances/i, /\bdist\s*\[\s*(?:source|src)\s*\]\s*=\s*0/),
    rule(/select node/i, /\b(?:heappop|extractMin|extract_?min|min_?dist_?node|poll|top)\b|\bpq\s*\.\s*(?:pop|shift)\b/i, 'first'),
    rule(/relax edge/i, [/\bdist\s*\[.*\]\s*=\s*dist\s*\[\s*u\s*\]\s*\+/, /\brelax_?edges\s*\(/i], 'first'),
    COMPLETE,
  ],

  'bellman-ford': [
    rule(/initialize bellman-ford/i, /\bdist\s*\[\s*source\s*\]\s*=\s*0/),
    rule(/relax .*\bpass\b/i, /\bdist\s*\[.*\]\s*=\s*dist\s*\[.*\]\s*\+/, 'first'),
    COMPLETE,
  ],

  'floyd-warshall': [
    entryRule(/initialize distance matrix/i, 'floyd_?warshall'),
    rule(/relax path/i, /\bdist\s*\[\s*i\s*\]\s*\[\s*j\s*\]\s*=\s*dist\s*\[\s*i\s*\]\s*\[\s*k\s*\]/),
    COMPLETE,
  ],

  prim: [
    entryRule(/start prim/i, 'prim'),
    rule(/add edge/i, ADD_MST_EDGE, 'first'),
    COMPLETE,
  ],

  kruskal: [
    rule(/sort edges/i, /\bsort\b|\bqsort\b|Collections\.sort|\.sort\s*\(/i, 'first'),
    rule(/add edge/i, ADD_MST_EDGE, 'first'),
    rule(/skip edge/i, /\bfind\s*\(.*\)\s*!==?\s*find\s*\(/),
    COMPLETE,
  ],

  'a-star': [
    entryRule(/a\* search from/i, 'a_?star'),
    rule(/expand node/i, /\bcurrent\s*=/, 'first'),
    rule(/goal .* reached/i, /\bcurrent\s*={2,3}\s*goal/),
    rule(
      /update path to/i,
      [/\b(?:g_score|gScore)\s*\[\s*neighbor\s*\]\s*=\s*tentative/i, /\brelax_?neighbors\s*\(/i, /\bg_?score\s*\.\s*put\s*\(/i],
      'first'
    ),
    rule(/could not reach goal/i, [/\breturn\s+(?:None|null|nullptr|failure|no_path\s*\()/i, '@last'], 'last'),
  ],

  'topological-sort': [
    rule(/compute in-degree/i, [call('compute_?indegree'), /\bindegree\b/i], 'first'),
    rule(
      /remove node/i,
      /\bnode\s*=\s*(?:\w*(?:queue|q)\w*\s*\.\s*(?:pop|poll|dequeue|popleft|remove|shift|front)\s*\(|dequeue\s*\()/i,
      'first'
    ),
    rule(
      /decrement in-degree/i,
      /\bindegree\s*\[.*\]\s*(?:-=\s*1|--|=\s*indegree\s*\[.*\]\s*-\s*1)|--\s*indegree\s*\[/i,
      'first'
    ),
    rule(/topological order/i, [RETURN, '@last'], 'last'),
  ],

  'union-find': [
    // The listing shows find/union/process_edges but not the parent-array setup, so the
    // "initialize" event points at the driver that sets the edge processing in motion.
    entryRule(/initialize each node/i, 'process_?edges'),
    // The statement that actually links two sets.
    rule(/union\(/i, /\bparent\s*\[\s*root_?a\s*\]\s*=\s*root_?b/i),
    // The connectivity check that decides whether to union or skip.
    rule(/find\(.*==.*find/i, /\bfind\s*\(.*\)\s*!==?\s*find\s*\(/),
    rule(/complete/i, [RETURN, '@last'], 'last'),
  ],

  'scc-kosaraju': [
    rule(/pass \d+: dfs on the original/i, [call('dfs1'), /\bdfs\s*\(/], 'first'),
    rule(/visit .* \(pass 1|finish /i, [call('dfs1'), /\bdfs\s*\(/], 'first'),
    rule(/pass \d+: dfs on the transpose/i, [/\btransposed\s*=|\breverse_?edges\s*\(/i, /\bwhile\b/], 'first'),
    rule(/visit .* \(pass 2|component \d+:/i, [call('dfs2'), /\bcomponents?\s*\.\s*(?:append|add|push)/i], 'first'),
    rule(/strongly connected components:/i, [RETURN, '@last'], 'last'),
  ],

  'bridges-tarjan': [
    rule(/dfs to compute discovery/i, DFS_DRIVER, 'first'),
    rule(/discover .* at time/i, DISCOVER, 'first'),
    rule(/back edge/i, lowUpdate('disc'), 'first'),
    rule(/back from/i, lowUpdate('low'), 'first'),
    rule(
      /is a bridge/i,
      [/\bbridges\s*\.\s*(?:append|add|push|push_back)\s*\(/, /\bbridges\s*\[.*\]\s*=/, /\bmark edge .* as a bridge/i],
      'first'
    ),
    rule(/bridges found/i, [RETURN, '@last'], 'last'),
  ],

  'articulation-points': [
    rule(/dfs to compute discovery/i, DFS_DRIVER, 'first'),
    rule(/discover .* at time/i, DISCOVER, 'first'),
    // Two sites mark an articulation point: the non-root rule (inside the child loop) comes
    // first in every listing, the root rule (more than one DFS child) comes last.
    rule(
      /is an articulation point \(child/i,
      [/\bap\s*\.\s*(?:add|append|push|insert)\s*\(/, /\bap\s*\[\s*u\s*\]\s*=\s*true/, /\bmark u as an articulation point/i],
      'first'
    ),
    rule(
      /is an articulation point \(root/i,
      [/\bap\s*\.\s*(?:add|append|push|insert)\s*\(/, /\bap\s*\[\s*u\s*\]\s*=\s*true/, /\bmark u as an articulation point/i],
      'last'
    ),
    rule(/articulation points:/i, [RETURN, '@last'], 'last'),
  ],
};
