import { initStats, pushTreeStep, layoutTreeNodes } from './core.js';

let nodeCounter = 0;
const nextId = () => `n${(nodeCounter += 1)}`;

const createNode = (value, parentId = null) => ({
  id: nextId(),
  value,
  parentId,
  left: null,
  right: null,
});

const snapshotTree = (steps, stats, root, description, highlightIds = []) => {
  const walk = (node) => {
    if (!node) return null;
    return {
      ...node,
      highlighted: highlightIds.includes(node.id),
      left: walk(node.left),
      right: walk(node.right),
    };
  };

  pushTreeStep(steps, stats, description, {
    nodes: layoutTreeNodes(walk(root)),
    rootId: root?.id ?? null,
  });
};

export const bstInsert = (input) => {
  nodeCounter = 0;
  const values = [...input];
  const steps = [];
  const stats = initStats();
  let root = null;

  pushTreeStep(steps, stats, 'Build binary search tree by inserting values.', { nodes: [], rootId: null });

  const insert = (node, value, parentId) => {
    if (!node) {
      return createNode(value, parentId);
    }

    stats.comparisons += 1;
    snapshotTree(steps, stats, root, `Compare ${value} with ${node.value}.`, [node.id]);

    if (value < node.value) {
      node.left = insert(node.left, value, node.id);
    } else if (value > node.value) {
      node.right = insert(node.right, value, node.id);
    }

    return node;
  };

  values.forEach((value) => {
    root = insert(root, value, null);
    snapshotTree(steps, stats, root, `Tree after inserting ${value}.`, []);
  });

  snapshotTree(steps, stats, root, 'BST construction complete.', []);
  return steps;
};

const avlHeight = (node) => (node ? 1 + Math.max(avlHeight(node.left), avlHeight(node.right)) : 0);
const avlBalance = (node) => (node ? avlHeight(node.left) - avlHeight(node.right) : 0);

const avlRotateRight = (y) => {
  const x = y.left;
  const t2 = x.right;
  x.right = y;
  y.left = t2;
  return x;
};

const avlRotateLeft = (x) => {
  const y = x.right;
  const t2 = y.left;
  y.left = x;
  x.right = t2;
  return y;
};

export const avlInsert = (input) => {
  nodeCounter = 0;
  const values = [...input];
  const steps = [];
  const stats = initStats();
  let root = null;

  const rebalance = (node) => {
    const balance = avlBalance(node);
    if (balance > 1 && avlBalance(node.left) >= 0) {
      snapshotTree(steps, stats, root, 'Left-left rotation.', [node.id]);
      return avlRotateRight(node);
    }
    if (balance < -1 && avlBalance(node.right) <= 0) {
      snapshotTree(steps, stats, root, 'Right-right rotation.', [node.id]);
      return avlRotateLeft(node);
    }
    if (balance > 1 && avlBalance(node.left) < 0) {
      snapshotTree(steps, stats, root, 'Left-right double rotation.', [node.id]);
      node.left = avlRotateLeft(node.left);
      return avlRotateRight(node);
    }
    if (balance < -1 && avlBalance(node.right) > 0) {
      snapshotTree(steps, stats, root, 'Right-left double rotation.', [node.id]);
      node.right = avlRotateRight(node.right);
      return avlRotateLeft(node);
    }
    return node;
  };

  const insert = (node, value, parentId) => {
    if (!node) return createNode(value, parentId);

    stats.comparisons += 1;
    snapshotTree(steps, stats, root, `Compare ${value} with ${node.value}.`, [node.id]);

    if (value < node.value) node.left = insert(node.left, value, node.id);
    else if (value > node.value) node.right = insert(node.right, value, node.id);
    else return node;

    return rebalance(node);
  };

  values.forEach((value) => {
    root = insert(root, value, null);
    snapshotTree(steps, stats, root, `AVL tree after inserting ${value}.`, []);
  });

  snapshotTree(steps, stats, root, 'AVL tree construction complete.', []);
  return steps;
};

class TrieNode {
  constructor(char = '') {
    this.id = nextId();
    this.char = char;
    this.children = {};
    this.isEnd = false;
    this.highlighted = false;
  }
}

const trieToTreeState = (root) => {
  const nodes = [];

  const walk = (node, depth, indexInLevel, parentId = null) => {
    nodes.push({
      id: node.id,
      value: node.char || '•',
      label: node.char || 'root',
      x: 60 + indexInLevel * 70,
      y: depth * 70 + 30,
      parentId,
      highlighted: node.highlighted,
      secondary: node.isEnd,
    });

    Object.values(node.children).forEach((child, childIndex) => {
      walk(child, depth + 1, childIndex, node.id);
    });
  };

  if (root) walk(root, 0, 0);
  return { nodes, rootId: root?.id ?? null };
};

export const trieInsert = (words) => {
  nodeCounter = 0;
  const steps = [];
  const stats = initStats();
  const root = new TrieNode('');

  pushTreeStep(steps, stats, 'Build trie by inserting words.', trieToTreeState(root));

  words.forEach((word) => {
    let node = root;
    pushTreeStep(steps, stats, `Insert word "${word}".`, trieToTreeState(root));

    for (const char of word) {
      stats.comparisons += 1;
      if (!node.children[char]) node.children[char] = new TrieNode(char);
      node = node.children[char];
      node.highlighted = true;
      pushTreeStep(steps, stats, `Add character "${char}".`, trieToTreeState(root));
      node.highlighted = false;
    }

    node.isEnd = true;
    pushTreeStep(steps, stats, `Mark end of word "${word}".`, trieToTreeState(root));
  });

  pushTreeStep(steps, stats, 'Trie construction complete.', trieToTreeState(root));
  return steps;
};

export const heapifyVisual = (input) => {
  const arr = [...input];
  const steps = [];
  const stats = initStats();

  const asTree = (values, highlights = []) => {
    const nodes = values.map((value, index) => {
      const depth = Math.floor(Math.log2(index + 1));
      const firstIndex = 2 ** depth - 1;
      const count = 2 ** depth;
      const pos = index - firstIndex;
      return {
        id: `h${index}`,
        value,
        label: String(value),
        x: 80 + (720 / (count + 1)) * (pos + 1),
        y: depth * 80 + 40,
        parentId: index === 0 ? null : `h${Math.floor((index - 1) / 2)}`,
        highlighted: highlights.includes(index),
        secondary: false,
      };
    });
    return { nodes, rootId: values.length ? 'h0' : null };
  };

  pushTreeStep(steps, stats, 'Visualize array as binary heap.', asTree(arr));

  const heapify = (n, i) => {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < n) {
      stats.comparisons += 1;
      pushTreeStep(steps, stats, `Compare ${arr[i]} with left child ${arr[left]}.`, asTree(arr, [i, left]));
      if (arr[left] > arr[largest]) largest = left;
    }

    if (right < n) {
      stats.comparisons += 1;
      pushTreeStep(steps, stats, `Compare ${arr[largest]} with right child ${arr[right]}.`, asTree(arr, [right, largest]));
      if (arr[right] > arr[largest]) largest = right;
    }

    if (largest !== i) {
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      stats.swaps += 1;
      pushTreeStep(steps, stats, 'Swap to restore heap property.', asTree(arr, [i, largest]));
      heapify(n, largest);
    }
  };

  for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i -= 1) {
    pushTreeStep(steps, stats, `Heapify subtree rooted at index ${i}.`, asTree(arr, [i]));
    heapify(arr.length, i);
  }

  pushTreeStep(steps, stats, 'Max heap ready.', asTree(arr));
  return steps;
};

/** Silently builds a BST from values with no visualization steps (used as a base for traversal demos) */
const buildBstQuiet = (values) => {
  let root = null;
  const insert = (node, value, parentId) => {
    if (!node) return createNode(value, parentId);
    if (value < node.value) node.left = insert(node.left, value, node.id);
    else if (value > node.value) node.right = insert(node.right, value, node.id);
    return node;
  };
  values.forEach((value) => {
    root = insert(root, value, null);
  });
  return root;
};

const traversalDemo = (input, order, describeVisit) => {
  nodeCounter = 0;
  const values = input.length ? input : [50, 30, 70, 20, 40, 60, 80];
  const root = buildBstQuiet(values);
  const steps = [];
  const stats = initStats();
  const visitOrder = [];

  snapshotTree(steps, stats, root, `Built binary search tree from [${values.join(', ')}].`, []);

  const visit = (node) => {
    if (!node) return;
    if (order === 'pre') {
      stats.comparisons += 1;
      visitOrder.push(node.value);
      snapshotTree(steps, stats, root, describeVisit(node.value, visitOrder), [node.id]);
    }
    if (node.left) visit(node.left);
    if (order === 'in') {
      stats.comparisons += 1;
      visitOrder.push(node.value);
      snapshotTree(steps, stats, root, describeVisit(node.value, visitOrder), [node.id]);
    }
    if (node.right) visit(node.right);
    if (order === 'post') {
      stats.comparisons += 1;
      visitOrder.push(node.value);
      snapshotTree(steps, stats, root, describeVisit(node.value, visitOrder), [node.id]);
    }
  };

  visit(root);
  snapshotTree(steps, stats, root, `Traversal complete: [${visitOrder.join(', ')}].`, []);
  return steps;
};

export const treeInorder = (input) =>
  traversalDemo(input, 'in', (value, order) => `Visit ${value} (inorder: left, node, right). Order so far: [${order.join(', ')}].`);

export const treePreorder = (input) =>
  traversalDemo(input, 'pre', (value, order) => `Visit ${value} (preorder: node, left, right). Order so far: [${order.join(', ')}].`);

export const treePostorder = (input) =>
  traversalDemo(input, 'post', (value, order) => `Visit ${value} (postorder: left, right, node). Order so far: [${order.join(', ')}].`);

/** Level-order (BFS) traversal of a freshly-built BST */
export const levelOrderTraversal = (input) => {
  nodeCounter = 0;
  const values = input.length ? input : [50, 30, 70, 20, 40, 60, 80];
  const root = buildBstQuiet(values);
  const steps = [];
  const stats = initStats();
  const visited = [];

  snapshotTree(steps, stats, root, `Built binary search tree from [${values.join(', ')}].`, []);

  const queue = root ? [root] : [];
  while (queue.length) {
    const node = queue.shift();
    stats.comparisons += 1;
    visited.push(node.value);
    snapshotTree(steps, stats, root, `Dequeue and visit ${node.value}. Level order so far: [${visited.join(', ')}].`, [node.id]);
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }

  snapshotTree(steps, stats, root, `Level-order traversal complete: [${visited.join(', ')}].`, []);
  return steps;
};

/** Segment tree build (bottom-up sum segment tree) + a range-sum query, shown as a tree */
export const segmentTreeDemo = (input) => {
  nodeCounter = 0;
  const values = input.length ? input : [1, 3, 5, 7, 9, 11];
  const n = values.length;
  const size = 2 ** Math.ceil(Math.log2(Math.max(n, 1)));
  const tree = new Array(2 * size).fill(0);
  const steps = [];
  const stats = initStats();

  const idOf = (i) => `seg${i}`;
  const asTreeState = (highlights = []) => {
    const nodes = [];
    for (let i = 1; i < size + n; i += 1) {
      if (i >= size && i >= size + n) continue;
      const depth = Math.floor(Math.log2(i));
      const firstIndex = 2 ** depth;
      const count = 2 ** depth;
      const pos = i - firstIndex;
      nodes.push({
        id: idOf(i),
        value: tree[i] ?? 0,
        label: String(tree[i] ?? 0),
        x: 60 + (760 / (count + 1)) * (pos + 1),
        y: depth * 80 + 40,
        parentId: i === 1 ? null : idOf(Math.floor(i / 2)),
        highlighted: highlights.includes(i),
        secondary: false,
      });
    }
    return { nodes, rootId: nodes.length ? idOf(1) : null };
  };

  pushTreeStep(steps, stats, `Build segment tree for range-sum queries over [${values.join(', ')}].`, asTreeState());

  for (let i = 0; i < n; i += 1) {
    tree[size + i] = values[i];
    pushTreeStep(steps, stats, `Place leaf value ${values[i]} at position ${i}.`, asTreeState([size + i]));
  }

  for (let i = size - 1; i >= 1; i -= 1) {
    tree[i] = (tree[2 * i] ?? 0) + (tree[2 * i + 1] ?? 0);
    stats.comparisons += 1;
    pushTreeStep(steps, stats, `Internal node ${i} = left child + right child = ${tree[i]}.`, asTreeState([i]));
  }

  const ql = 0;
  const qr = Math.min(3, n - 1);
  let sum = 0;
  const queryHighlights = [];
  const query = (node, lo, hi) => {
    if (qr < lo || hi < ql) return;
    if (ql <= lo && hi <= qr) {
      sum += tree[node];
      queryHighlights.push(node);
      return;
    }
    const mid = Math.floor((lo + hi) / 2);
    query(2 * node, lo, mid);
    query(2 * node + 1, mid + 1, hi);
  };
  query(1, 0, size - 1);
  pushTreeStep(steps, stats, `Range sum query [${ql}, ${qr}] = ${sum}.`, asTreeState(queryHighlights));

  return steps;
};

export default {
  bstInsert,
  avlInsert,
  trieInsert,
  heapifyVisual,
  treeInorder,
  treePreorder,
  treePostorder,
  levelOrderTraversal,
  segmentTreeDemo,
};
