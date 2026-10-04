import { ARR, RETURN_VALUE, entryRule, rule, swapOf } from './helpers.js';

const RETURN = RETURN_VALUE;
const COMPLETE = rule(/complete/i, [RETURN, '@last'], 'last');

// The statement that records a traversal visit, in each language's spelling.
const RECORD_VISIT = [
  /\bresult\s*\.\s*(?:append|add|push|push_back)\s*\(/,
  /\bresult\s*\[.*\]\s*=\s*node/,
];

const traversal = (order, name) => [
  entryRule(/built binary search tree/i, name),
  rule(new RegExp(`visit .* \\(${order}`, 'i'), RECORD_VISIT, 'first'),
  rule(/traversal complete/i, [RETURN, '@last'], 'last'),
];

export const TREES = {
  'bst-insert': [
    entryRule(/build binary search tree/i, 'insert'),
    // The ordering decision that sends the value left or right.
    rule(/compare .* with/i, /\bif\b.*\bval(?:ue)?\s*<\s*root/, 'first'),
    rule(/tree after inserting|construction complete/i, /\breturn\s+root\b/, 'last'),
  ],

  'avl-insert': [
    rule(/compare .* with/i, /\bif\b.*\bval(?:ue)?\s*<\s*node/, 'first'),
    // Rotations are decided by the balance factor check.
    rule(/rotation|rotate/i, /\bif\b.*\bbalance\s*[<>]/, 'first'),
    rule(/avl tree after inserting|construction complete/i, /\breturn\s+node\b/, 'last'),
  ],

  'trie-insert': [
    entryRule(/build trie|insert word/i, 'insert|trie_?insert'),
    // Adding a character = creating the child node when it is missing.
    rule(
      /add character/i,
      /\bchildren\b.*\b(?:TrieNode|new_trie_node)\b|\bputIfAbsent\b|\bcomputeIfAbsent\b|\bsetdefault\b/,
      'first'
    ),
    rule(/mark end of word/i, /\bis_?end_?of_?word\s*=\s*true/i),
    rule(/construction complete/i, [RETURN, '@last'], 'last'),
  ],

  heapify: [
    entryRule(/visualize array as binary heap/i, 'heapify'),
    rule(/heapify subtree/i, /\blargest\s*=\s*i\b/),
    rule(/compare .* with left child/i, /\bleft\s*<\s*n\b.*\[\s*left\s*\]\s*>/),
    rule(/compare .* with right child/i, /\bright\s*<\s*n\b.*\[\s*right\s*\]\s*>/),
    rule(/swap to restore heap property/i, swapOf('i', 'largest'), 'first'),
    rule(/max heap ready/i, [RETURN, '@last'], 'last'),
  ],

  'tree-inorder': traversal('inorder', 'inorder'),
  'tree-preorder': traversal('preorder', 'preorder'),
  'tree-postorder': traversal('postorder', 'postorder'),

  'level-order-bfs': [
    entryRule(/built binary search tree/i, 'level_?order'),
    rule(
      /dequeue and visit/i,
      /\bnode\s*=\s*(?:\w*(?:queue|q)\w*\s*\.\s*(?:pop|poll|dequeue|popleft|remove|shift|front)\s*\(|queue\s*\[\s*front\+\+)/i,
      'first'
    ),
    rule(/traversal complete/i, [RETURN, '@last'], 'last'),
  ],

  'segment-tree-demo': [
    entryRule(/build segment tree/i, 'build'),
    rule(/place leaf value/i, /\btree\s*\[\s*size\s*\+\s*i\s*\]\s*=/),
    rule(/internal node/i, /\btree\s*\[\s*i\s*\]\s*=\s*tree\s*\[/),
    rule(/range sum query/i, /\bsum_?over_?range\s*\(/i),
  ],

  'fenwick-tree-demo': [
    entryRule(/build fenwick tree/i, 'update'),
    rule(/update\(index/i, /\btree\s*\[\s*i\s*\]\s*\+=\s*delta/),
    rule(/query\(prefix sum/i, /\b(?:total|sum)\s*\+=\s*tree\s*\[\s*i\s*\]/),
    rule(/fenwick tree ready/i, /\breturn\s+(?:total|sum)\b/, 'last'),
  ],
};

export { ARR };
