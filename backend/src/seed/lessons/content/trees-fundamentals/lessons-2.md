# Height and Depth
kind: algorithm
time: O(n) to compute the height of a tree with n nodes, since every node is visited once; the depth of a single node costs O(depth) by following parent links, or O(1) if depths were precomputed.
space: O(h) for the recursion stack, where h is the height, up to O(n) for a chain.

## intro
Height and depth are the two basic measurements of a tree, and they decide how long operations take: searching a binary search tree costs about its height, and recursion on a tree needs stack space proportional to it. Computing them correctly, and remembering which is measured from the top and which from the bottom, is a prerequisite for many tree problems.

## theory
Definitions (edge counting convention):

- Depth of a node: the number of edges on the path from the root to the node; the root has depth 0
- Height of a node: the number of edges on the longest path from the node down to a leaf; leaves have height 0
- Height of the tree: the height of the root, equal to the maximum depth of any node

Many problem statements count nodes instead of edges, so the maximum depth of a binary tree is the number of nodes along the longest root to leaf path, which is the edge height plus one. State your convention. In the node counting convention an empty tree has height 0 and a single node has height 1; in the edge counting convention an empty tree has height −1 and a single node has height 0.

Recursive height (node counting version):

- If the node is empty, return 0
- Return `1 + max(height(left), height(right))`

For the tree with root 3, left child 9, right child 20 with children 15 and 7, the height is 3 nodes (2 edges). The depth of the node 15 is 2.

Computing depths of all nodes: pass the depth down during a traversal (`depth(child) = depth(node) + 1`), or use a parent map and climb, or record the level during breadth first search.

Minimum depth: the number of nodes along the shortest path from the root to a leaf. A common bug is to take `1 + min(height(left), height(right))`, which is wrong when one child is missing: the missing child does not count as a leaf, so the path must continue through the other child. Correct rule: if one child is empty, use the other child's minimum depth. For the sample tree the minimum depth is 2 (the path 3 → 9), while for a chain of three nodes it is 3.

Related measurements:

- Depth of a specific node in a binary search tree: count the comparisons in a search for its key
- Diameter and balance both reuse the height function
- The depth of a leaf bounds the number of recursive calls on the path from the root
- Average depth of nodes, called the internal path length divided by n, measures the average cost of a search

Relationship with the number of nodes: a binary tree with n nodes has height between ⌈log2(n + 1)⌉ and n (node counting). A balanced binary tree with 1,000,000 nodes has about 20 levels, while a skewed tree with the same nodes has a million levels.

Implementation notes:

- Recursion depth equals the height, so skewed trees with many nodes may overflow the call stack. Compute the height iteratively with breadth first search by counting levels, or with an explicit stack that carries depth values.
- For n-ary trees, take the maximum over all children and return 0 or 1 for leaves according to the convention
- Cache the heights in nodes (as AVL trees do) so repeated queries cost O(1) and updates recompute only along the path to the root

Testing: empty tree, single node, left chain, right chain, perfect tree (height log2 n) and an unbalanced tree where the left and right heights differ.

## explain
1. Choose whether height counts nodes or edges and say so.
2. For the height, return the base value for an empty tree.
3. Compute the heights of the left and right subtrees and take the larger plus one.
4. For depth, pass the current depth to the children as depth plus one.
5. For the minimum depth, handle nodes that have only one child separately.
6. Switch to an iterative level count for very deep trees.

## example
The Python program computes the height 3 and minimum depth 2 of the sample tree, prints the depth of every node and shows the common minimum depth bug on a left chain. The JavaScript program computes the maximum depth iteratively by counting levels and prints 3 for the sample tree and 4 for a chain of four nodes.

## real
Database indexes aim for small height because each level costs a disk read, balanced tree libraries store heights in nodes to keep the structure shallow, and recursive algorithms report depth limits for stack safety.

## pros
- Simple recursive definitions
- Direct link to search cost and stack depth
- Easily cached in nodes

## cons
- Conventions differ between edges and nodes
- Recursive depth limits bite on trees with a huge height
- Minimum depth has a classic one-child mistake

## uses
- Bounding the cost of tree searches
- Checking balance conditions
- Computing diameters and path lengths
- Estimating recursion stack requirements

## mistakes
- Mixing the node count and edge count conventions
- Computing the minimum depth with min over both children when one child is missing
- Mixing up the downward and the upward measurement
- Using recursion for trees that can have millions of levels

## interview
**Q:** How do you compute the height of a binary tree?
**A:** Recursively: an empty tree has height zero in the node counting convention, otherwise the height is one plus the larger of the heights of the left and right subtrees; the cost is O(n).

**Q:** What is the common mistake when computing the minimum depth?
**A:** Taking one plus the minimum of both subtree heights, which wrongly treats a missing child as a leaf at depth zero; if one child is empty you must follow the other child.

**Q:** How can the height be computed without recursion?
**A:** Run a level order traversal with a queue and count the number of levels processed.

## summary
Depth is measured from the root down and height from a node to its deepest leaf, and both are computed in O(n) with simple recursion. Fix the counting convention, handle one-child nodes in the minimum depth and use an iterative level count for deep trees.

## codenote
The Python sample computes height, depths and the minimum depth. The JavaScript sample counts levels iteratively.

## code
### python
```python
class Node:
    def __init__(self, value, left=None, right=None):
        self.value, self.left, self.right = value, left, right

def height(node):
    return 0 if node is None else 1 + max(height(node.left), height(node.right))

def min_depth(node):
    if node is None:
        return 0
    if node.left is None:
        return 1 + min_depth(node.right)
    if node.right is None:
        return 1 + min_depth(node.left)
    return 1 + min(min_depth(node.left), min_depth(node.right))

def wrong_min_depth(node):
    return 0 if node is None else 1 + min(wrong_min_depth(node.left), wrong_min_depth(node.right))

def depths(node, depth=0, out=None):
    out = {} if out is None else out
    if node:
        out[node.value] = depth
        depths(node.left, depth + 1, out)
        depths(node.right, depth + 1, out)
    return out

tree = Node(3, Node(9), Node(20, Node(15), Node(7)))
print(height(tree), min_depth(tree), depths(tree))
chain = Node(1, Node(2, Node(3)))
print(min_depth(chain), wrong_min_depth(chain))
```
Output:
```text
3 2 {3: 0, 9: 1, 20: 1, 15: 2, 7: 2}
3 1
```
### javascript
```javascript
function maxDepth(root) {
  let level = root ? [root] : [];
  let depth = 0;
  while (level.length) {
    depth++;
    level = level.flatMap((node) => [node.left, node.right].filter(Boolean));
  }
  return depth;
}

const sample = { value: 3, left: { value: 9 }, right: { value: 20, left: { value: 15 }, right: { value: 7 } } };
const chain = { value: 1, right: { value: 2, right: { value: 3, right: { value: 4 } } } };
console.log(maxDepth(sample), maxDepth(chain), maxDepth(null));
```
Output:
```text
3 4 0
```

## quiz
1. What is the depth of the root node?
   - [ ] 1
   - [x] 0
   - [ ] The height of the tree
   - [ ] Undefined
   > Depth counts edges from the root.
2. What does the height of a node measure?
   - [ ] Edges from the root
   - [x] Edges on the longest path down to a leaf
   - [ ] The number of siblings
   - [ ] The number of ancestors
   > Height looks downward, depth looks upward.
3. Why is min(left, right) plus one wrong for the minimum depth of a chain?
   - [ ] It gives a larger number
   - [x] A missing child is wrongly treated as a leaf at depth zero
   - [ ] It needs a queue
   - [ ] It ignores the root
   > The path must continue through the existing child.
4. How can the height be found without recursion?
   - [ ] By sorting the nodes
   - [x] By counting the levels in a level order traversal
   - [ ] By counting the leaves
   - [ ] By hashing the nodes
   > Each round of the queue is one level.

# Balanced vs Unbalanced
kind: algorithm
time: O(n) to check whether a tree with n nodes is height balanced when heights are computed bottom up in one pass; the naive version that recomputes heights at every node is O(n squared) for skewed trees.
space: O(h) for the recursion stack, where h is the height of the tree.

## intro
A balanced tree keeps its height close to the logarithm of the number of nodes, so searches and inserts stay fast. An unbalanced tree can degenerate into a chain where every operation takes linear time. Telling the two apart, and checking balance efficiently, is both a common interview question and the first step toward understanding AVL and red-black trees.

## theory
Height balanced definition: a binary tree is height balanced if, for every node, the heights of its left and right subtrees differ by at most 1. This is the condition maintained by AVL trees.

Variants of balance:

- Height balanced (AVL condition): subtree heights differ by at most one at every node
- Weight balanced: the subtree sizes are within a constant factor of each other
- Perfectly balanced: all leaves are at the same depth
- Red-black balance: no root to leaf path is more than twice as long as any other

Why balance matters: a binary search tree built by inserting the keys 1 to 7 in sorted order is a chain of height 7 (node counting), so a search takes up to 7 steps, while a balanced tree of the same keys has height 3. For a million keys the difference is 20 steps against a million.

Efficient check (bottom up, one pass): return the height of a subtree, or a sentinel such as −1 if the subtree is already unbalanced.

- If the node is empty, return 0
- Get the heights of the left and right subtrees; if either is −1, return −1
- If the heights differ by more than one, return −1
- Otherwise return `1 + max(left, right)`

The tree is balanced if the result is not −1. Each node is processed once, so the time is O(n).

Naive check (top down): at each node compute the heights of both subtrees with separate recursive calls and compare, then recurse into the children. A skewed tree makes the height computation repeated at every node, giving O(n squared). The one-pass version avoids it by combining the height computation and the balance check.

Examples: the tree with root 3, children 9 and 20, and grandchildren 15 and 7 is balanced (subtree heights 1 and 2). A chain 1 → 2 → 3 is not balanced, because at the root the left subtree is empty (height 0) and the right subtree has height 2. A tree can look balanced at the root and still fail deeper down: the root's two subtrees might have equal heights while one subtree is itself a chain.

Keeping trees balanced:

- AVL trees: after each insertion or deletion, restore the balance factor (height of left minus height of right, in the range −1 to 1) with rotations
- Red-black trees: colour rules guarantee that the longest path is at most twice the shortest, with fewer rotations
- Treaps, splay trees and skip lists: randomisation or self adjustment gives balance in expectation or in amortised terms
- B-trees: multiway balanced trees for disk based indexes
- Building a balanced tree from sorted data: choose the middle element as the root and recurse on both halves, giving height ⌈log2(n + 1)⌉

Comparison of costs: search, insert and delete are O(h). For a balanced tree h = O(log n); for a degenerate tree h = n. Randomly ordered insertions into a plain binary search tree give an expected height of about 1.39 log2 n, but sorted or nearly sorted input is common in practice, which is why self balancing trees exist.

Testing: empty tree (balanced), single node, a chain of two nodes (balanced) and three nodes (not), a balanced tree with one deep subtree and a tree built from sorted keys.

## explain
1. Define the balance condition: subtree heights differ by at most one.
2. Compute heights bottom up and return a sentinel when a subtree is unbalanced.
3. Compare the child heights at each node and propagate failure upward.
4. Report balanced if the root result is not the sentinel.
5. To fix an unbalanced tree, rebuild from the sorted keys with the middle as the root, or use a self balancing tree.
6. Test chains, perfect trees and trees that are unbalanced only deep inside.

## example
The Python program checks balance for the sample tree (balanced), a three node chain (not balanced) and a tree whose right subtree is a chain of three nodes (not balanced), and compares the height of a binary search tree built from the sorted keys 1 to 7 (7) with a balanced build (3). The JavaScript program builds a balanced tree from sorted keys by taking the middle element and reports the root 501 and the height 10 for 1000 keys.

## real
Database indexes and ordered maps use balanced trees to guarantee logarithmic operations, and libraries such as Java's TreeMap and C++'s std::map are built on red-black trees.

## pros
- Guarantees logarithmic search and update costs
- The balance check is a simple bottom up pass
- Balanced trees can be built from sorted data in linear time

## cons
- Maintaining balance costs rotations on updates
- Naive checks repeat height computations
- Different balance definitions cause confusion

## uses
- Verifying the height balance of a tree
- Explaining why plain binary search trees degrade
- Building balanced trees from sorted arrays
- Choosing between AVL and red-black trees

## mistakes
- Checking only the root and not every node
- Recomputing heights separately at each node and paying quadratic time
- Assuming that equal subtree heights at the root mean balance
- Building a search tree from sorted input by plain insertions

## interview
**Q:** What does it mean for a binary tree to be height balanced?
**A:** For every node, the heights of its left and right subtrees differ by at most one, which keeps the overall height logarithmic.

**Q:** How do you check balance in O(n)?
**A:** Compute heights bottom up and return a sentinel value as soon as any node has subtrees whose heights differ by more than one, so each node is processed once.

**Q:** Why does inserting sorted keys ruin a plain binary search tree?
**A:** Each new key becomes the right child of the previous one, forming a chain of height n, so searches take linear time instead of logarithmic time.

## summary
A balanced tree has subtree heights that differ by at most one at every node and so keeps operations at O(log n), while an unbalanced tree can degrade to a chain. A single bottom up pass checks balance in O(n), and self balancing trees or middle element builds keep the height small.

## codenote
The Python sample checks balance and compares heights. The JavaScript sample builds a balanced tree from sorted keys.

## code
### python
```python
class Node:
    def __init__(self, value, left=None, right=None):
        self.value, self.left, self.right = value, left, right

def check(node):
    if node is None:
        return 0
    left, right = check(node.left), check(node.right)
    if left == -1 or right == -1 or abs(left - right) > 1:
        return -1
    return 1 + max(left, right)

def height(node):
    return 0 if node is None else 1 + max(height(node.left), height(node.right))

def insert(root, value):
    if root is None:
        return Node(value)
    if value < root.value:
        root.left = insert(root.left, value)
    else:
        root.right = insert(root.right, value)
    return root

def from_sorted(values):
    if not values:
        return None
    mid = len(values) // 2
    return Node(values[mid], from_sorted(values[:mid]), from_sorted(values[mid + 1:]))

sample = Node(3, Node(9), Node(20, Node(15), Node(7)))
chain = Node(1, None, Node(2, None, Node(3)))
tricky = Node(1, Node(2), Node(3, None, Node(4, None, Node(5))))
print(check(sample) != -1, check(chain) != -1, check(tricky) != -1)
skewed = None
for key in range(1, 8):
    skewed = insert(skewed, key)
print(height(skewed), height(from_sorted(list(range(1, 8)))))
```
Output:
```text
True False False
7 3
```
### javascript
```javascript
function buildBalanced(sorted) {
  if (!sorted.length) return null;
  const mid = Math.floor(sorted.length / 2);
  return {
    value: sorted[mid],
    left: buildBalanced(sorted.slice(0, mid)),
    right: buildBalanced(sorted.slice(mid + 1)),
  };
}

function height(node) {
  return node ? 1 + Math.max(height(node.left), height(node.right)) : 0;
}

const keys = Array.from({ length: 1000 }, (_, i) => i + 1);
const tree = buildBalanced(keys);
console.log(tree.value, height(tree), Math.ceil(Math.log2(keys.length + 1)));
```
Output:
```text
501 10 10
```

## quiz
1. When is a binary tree height balanced?
   - [ ] When all leaves are at the same depth
   - [x] When the subtree heights differ by at most one at every node
   - [ ] When it has an even number of nodes
   - [ ] When it is a search tree
   > Every node must satisfy the condition, not only the root.
2. Why is the naive balance check slow on skewed trees?
   - [ ] It uses a queue
   - [x] It recomputes subtree heights at every node, giving O(n squared)
   - [ ] It sorts the nodes
   - [ ] It uses hashing
   > The one-pass bottom up check avoids the repetition.
3. What height does a binary search tree get from inserting 1 to 7 in order?
   - [ ] 3
   - [x] 7
   - [ ] 4
   - [ ] 2
   > Each key becomes the right child of the previous one.
4. How can a balanced tree be built from sorted keys?
   - [ ] Insert them in order
   - [x] Use the middle key as the root and build both halves recursively
   - [ ] Insert them in reverse order
   - [ ] Use the smallest key as the root
   > The halves have almost equal sizes.

# Serialize Deserialize Tree
kind: algorithm
time: O(n) to serialize and O(n) to deserialize a tree with n nodes, since each node is written and read once.
space: O(n) for the output string, plus O(h) for the recursion stack where h is the tree height.

## intro
To store a tree in a file, send it over a network or compare two trees, you need to turn it into a flat sequence and rebuild it later. Serialization writes the tree to a string and deserialization reconstructs an identical tree from that string. The design question is how to record the shape, not only the values.

## theory
Why values alone are not enough: different trees can have the same sequence of values. A preorder list `1, 2, 3` could be a root with two children, or a chain. The serialization must also encode where children are missing.

Preorder with null markers:

- Write the node value; for an empty child write a marker such as `#`
- Serialize the left subtree, then the right subtree
- Example: the tree with root 3, left child 9, right child 20 with children 15 and 7 becomes `3,9,#,#,20,15,#,#,7,#,#`
- To read it back, consume tokens in order: a marker returns an empty child; a value creates a node, and then the left subtree is read recursively followed by the right subtree

Because the markers record every empty position, the sequence has 2n + 1 tokens for a tree with n nodes (n values and n + 1 markers), and preorder with markers identifies the tree uniquely.

Level order with nulls (the format of many online problems and test data): breadth first, writing `null` for missing children, e.g. `3,9,20,null,null,15,7`. Trailing nulls can be trimmed. To deserialize, create the root, then walk through the tokens assigning left and right children to the nodes in the queue in order.

Other formats:

- Inorder alone cannot identify a tree; preorder plus inorder (with distinct values) can, but needs two sequences
- Parenthesised form such as `3(9)(20(15)(7))`, easy to read, used in some textbook problems
- JSON with nested objects, `{"value": 3, "left": ..., "right": ...}`, readable and language independent, at a size cost
- Binary encodings: store the shape as a bit sequence (one bit per node for presence) and the values in a separate array, which compresses well
- For a binary search tree, the preorder values alone are enough, because the tree can be rebuilt by inserting them in order (or with a bound-based recursion), which gives a compact serialization without markers

Round trip check: `deserialize(serialize(tree))` must equal the original tree. Test this property on many random trees, including empty ones, chains and trees with duplicate values and negative numbers. Compare trees structurally, not by identity.

Pitfalls:

- Values that contain the separator or the marker (use a safe encoding such as JSON, or lengths)
- Empty trees: the serialization of an empty tree is a single marker, and the deserializer must return an empty tree
- Recursion depth for very deep trees, requiring iterative versions for chains
- Stateful deserializers that share an iterator or index between calls: make sure the position is advanced exactly once per token
- Level order with trimmed trailing nulls: the reader must not run past the end of the tokens

Generalisation: n-ary trees store the number of children with each node (`value,count,...`) or a marker that ends each child list. Graphs need node identifiers and edge lists, since the same node can be reached by many paths.

Use in practice: persistence of syntax trees, network transfer of configuration trees, caching of computed trees, test fixtures, and checking whether one tree is a subtree of another by comparing serialized strings (with separators around values to avoid false matches).

## explain
1. Choose a format that records both values and the shape, such as preorder with markers.
2. To serialize, write the node value or the marker, then recurse into both children.
3. Join the tokens with a separator that cannot appear in values.
4. To deserialize, read tokens from an iterator: a marker gives an empty child, a value creates a node followed by two recursive reads.
5. Verify that deserialize(serialize(tree)) equals the tree on many examples.
6. Handle empty trees and very deep trees explicitly.

## example
The Python program serializes the sample tree as `3,9,#,#,20,15,#,#,7,#,#`, reads it back, confirms the round trip gives the same level order and handles the empty tree. The JavaScript program serializes the tree in level order with nulls to `3,9,20,null,null,15,7` and rebuilds it.

## real
Distributed systems send configuration and syntax trees over the network, databases persist index trees to disk pages, and test suites store tree fixtures as text.

## pros
- Preorder with markers is simple and unambiguous
- Linear time in both directions
- A round trip test makes correctness easy to check

## cons
- Markers double the length for sparse shapes
- Recursion depth can overflow on chains
- Values containing separators need escaping

## uses
- Saving and loading trees
- Sending trees between services
- Comparing trees and subtrees as strings
- Building test fixtures from compact text

## mistakes
- Serializing only the values and losing the shape
- Using a separator that appears inside values
- Not advancing the token position exactly once in the recursive reader
- Not writing a marker for an empty tree

## interview
**Q:** How do you serialize a binary tree so it can be rebuilt uniquely?
**A:** Write a preorder traversal that includes a marker for every empty child, so the shape is recorded together with the values and the reader can rebuild the tree from the same order.

**Q:** How many tokens does the preorder with markers format use for n nodes?
**A:** 2n plus 1 tokens: n values and n plus 1 markers for the empty child positions.

**Q:** How does a binary search tree serialization differ?
**A:** Its preorder values alone are enough, because inserting them in order or using value bounds reconstructs the same tree without markers.

## summary
Serialization records both values and shape, most simply as a preorder with null markers of 2n + 1 tokens, which is read back with a recursive reader in O(n). Test the round trip and handle empty trees, separators and deep chains.

## codenote
The Python sample uses preorder with markers. The JavaScript sample uses level order with nulls.

## code
### python
```python
from collections import deque

class Node:
    def __init__(self, value, left=None, right=None):
        self.value, self.left, self.right = value, left, right

def serialize(node):
    return "#" if node is None else f"{node.value},{serialize(node.left)},{serialize(node.right)}"

def deserialize(text):
    tokens = iter(text.split(","))

    def read():
        token = next(tokens)
        if token == "#":
            return None
        return Node(int(token), read(), read())

    return read()

def levels(root):
    out, queue = [], deque([root] if root else [])
    while queue:
        out.append([n.value for n in queue])
        queue = deque(c for n in queue for c in (n.left, n.right) if c)
    return out

tree = Node(3, Node(9), Node(20, Node(15), Node(7)))
text = serialize(tree)
print(text)
print(levels(deserialize(text)) == levels(tree), serialize(None), deserialize("#"))
```
Output:
```text
3,9,#,#,20,15,#,#,7,#,#
True # None
```
### javascript
```javascript
function serialize(root) {
  const tokens = [];
  const queue = [root];
  while (queue.length) {
    const node = queue.shift();
    if (node) {
      tokens.push(node.value);
      queue.push(node.left, node.right);
    } else {
      tokens.push("null");
    }
  }
  while (tokens[tokens.length - 1] === "null") tokens.pop();
  return tokens.join(",");
}

function deserialize(text) {
  const tokens = text.split(",");
  const make = (token) => (token === undefined || token === "null" ? null : { value: Number(token), left: null, right: null });
  const root = make(tokens[0]);
  const queue = [root];
  let i = 1;
  while (queue.length && i < tokens.length) {
    const node = queue.shift();
    node.left = make(tokens[i++]);
    node.right = make(tokens[i++]);
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
  return root;
}

const text = "3,9,20,null,null,15,7";
console.log(serialize(deserialize(text)) === text, serialize(deserialize(text)));
```
Output:
```text
true 3,9,20,null,null,15,7
```

## quiz
1. Why is a list of preorder values alone not enough to rebuild a binary tree?
   - [ ] It is too long
   - [x] Different tree shapes can share the same preorder values
   - [ ] It has no root
   - [ ] It needs sorting
   > Markers or a second traversal record the shape.
2. How many tokens does preorder with markers use for a tree with n nodes?
   - [ ] n
   - [x] 2n + 1
   - [ ] 3n
   - [ ] n squared
   > There are n values and n plus 1 markers.
3. Which test checks a serializer?
   - [ ] Sorting the output
   - [x] deserialize(serialize(tree)) must equal the tree
   - [ ] Counting the characters only
   - [ ] Printing the output twice
   > The round trip property covers shapes and values.
4. What is enough to serialize a binary search tree without markers?
   - [ ] Its level order only
   - [x] Its preorder values, since insertion in that order rebuilds the tree
   - [ ] Its leaves only
   - [ ] Its height
   > The ordering property supplies the shape.

# Lowest Common Ancestor
kind: algorithm
time: O(n) for a general binary tree with a single recursive pass, and O(h) for a binary search tree where each step discards one subtree.
space: O(h) for the recursion stack; the iterative search in a binary search tree uses O(1).

## intro
The lowest common ancestor (LCA) of two nodes is the deepest node that has both of them as descendants, where a node counts as a descendant of itself. It answers questions such as where two branches of an organisation chart meet, which common folder contains two files, or the nearest shared version in a history tree.

## theory
Definition: for nodes p and q in a rooted tree, the LCA is the lowest (deepest) node that is an ancestor of both. If p is an ancestor of q, then the LCA is p.

General binary tree, recursive solution:

- If the current node is empty, or is p or q, return it
- Search the left subtree and the right subtree for p and q
- If both searches return a node, p and q lie on different sides, so the current node is the LCA
- Otherwise return whichever side returned a node (or empty if neither did)

For the tree with root 3, left child 5, right child 1, where 5 has children 6 and 2 (and 2 has children 7 and 4) and 1 has children 0 and 8: the LCA of 5 and 1 is 3; the LCA of 5 and 4 is 5, because 4 lies below 5; the LCA of 6 and 4 is 5. The answer is found in one pass over the nodes, O(n).

The recursion relies on the guarantee that both nodes exist in the tree. If they may be missing, the function must also record how many of the targets were found, and it should only report the LCA if both were seen.

Binary search tree: use the ordering. Starting at the root, if both values are smaller than the current node, go left; if both are larger, go right; otherwise the current node is the split point and therefore the LCA. For the BST with root 6, children 2 and 8, 2 having children 0 and 4 (4 having 3 and 5), and 8 having 7 and 9: the LCA of 2 and 8 is 6, the LCA of 2 and 4 is 2 and the LCA of 3 and 5 is 4. Time O(h), and it can be written as a loop without recursion.

Parent pointers: if each node knows its parent, climb from p collecting ancestors in a set, then climb from q until a node is in the set; or compute the depths, lift the deeper node until both are at the same depth, and move both up together. O(h) time.

Many queries: if you must answer many LCA queries on a fixed tree, preprocess:

- Euler tour plus a range minimum query (sparse table): O(n log n) preprocessing and O(1) per query
- Binary lifting: store the 2^k-th ancestor of each node; a query takes O(log n) and uses O(n log n) memory
- Tarjan's offline algorithm with union find: all queries in near linear time
- Heavy-light decomposition: O(log n) per query and useful for path queries too

Applications:

- Distance between two nodes: `depth(p) + depth(q) − 2 · depth(LCA)`
- Path queries and path updates in trees
- Common ancestor in version control histories and class hierarchies
- Network routing in tree topologies, and computing the nearest common manager in a company hierarchy

Edge cases: p equals q (the LCA is that node), one node is the root, one node is an ancestor of the other, a chain-shaped tree and nodes missing from the tree.

Testing: compare the fast method with a brute-force approach that stores the root paths of both nodes and takes the last shared node.

## explain
1. Clarify whether the tree is a general binary tree or a search tree, and whether the nodes are guaranteed to exist.
2. For a general tree, recurse: return the node if it is p or q; combine the results of both sides.
3. If both sides return something, the current node is the LCA.
4. For a search tree, walk down and stop at the first node whose value lies between p and q.
5. With parent pointers, equalise depths and climb together.
6. For many queries, preprocess with binary lifting or an Euler tour.

## example
The Python function finds the LCA in the general tree above: 3 for nodes 5 and 1, 5 for nodes 5 and 4 and 5 for nodes 6 and 4. The JavaScript function walks down a binary search tree and prints 6, 2 and 4 for the pairs (2, 8), (2, 4) and (3, 5).

## real
Version control tools find the merge base of two branches, which is the lowest common ancestor in the commit graph, and organisation tools find the nearest shared manager of two employees.

## pros
- Single pass solution for general trees
- Logarithmic walk in balanced search trees
- Supports distance and path queries

## cons
- The general solution assumes both nodes exist
- Many queries need preprocessing structures
- Search tree shortcuts fail for unordered trees

## uses
- Finding the merge base in version histories
- Computing distances between tree nodes
- Answering common ancestor queries in hierarchies
- Path queries in tree algorithms

## mistakes
- Forgetting that a node is its own ancestor
- Using the binary search tree shortcut on a tree that is not ordered
- Returning the first match without checking both subtrees
- Assuming both nodes exist without checking

## interview
**Q:** How do you find the lowest common ancestor in a general binary tree?
**A:** Recurse; return the node if it equals p or q, otherwise search both subtrees, and if both return a node the current node is the LCA, else return whichever side found something.

**Q:** How does the search tree version avoid scanning the whole tree?
**A:** It compares the values with the current node: if both are smaller go left, if both are larger go right, otherwise the current node splits them and is the LCA, in O(h) time.

**Q:** How do you compute the distance between two nodes using the LCA?
**A:** Add the depths of the two nodes and subtract twice the depth of their lowest common ancestor.

## summary
The lowest common ancestor is the deepest node that has both targets below or at it; a general tree needs one O(n) recursive pass, a search tree needs only an O(h) walk, and many queries call for binary lifting or an Euler tour.

## codenote
The Python sample finds the LCA in a general tree. The JavaScript sample uses the search tree shortcut.

## code
### python
```python
class Node:
    def __init__(self, value, left=None, right=None):
        self.value, self.left, self.right = value, left, right

def lca(node, p, q):
    if node is None or node.value in (p, q):
        return node
    left, right = lca(node.left, p, q), lca(node.right, p, q)
    if left and right:
        return node
    return left or right

tree = Node(3,
            Node(5, Node(6), Node(2, Node(7), Node(4))),
            Node(1, Node(0), Node(8)))
print(lca(tree, 5, 1).value, lca(tree, 5, 4).value, lca(tree, 6, 4).value)
```
Output:
```text
3 5 5
```
### javascript
```javascript
function lcaInBst(root, p, q) {
  let node = root;
  while (node) {
    if (p < node.value && q < node.value) node = node.left;
    else if (p > node.value && q > node.value) node = node.right;
    else return node.value;
  }
  return null;
}

const bst = {
  value: 6,
  left: { value: 2, left: { value: 0 }, right: { value: 4, left: { value: 3 }, right: { value: 5 } } },
  right: { value: 8, left: { value: 7 }, right: { value: 9 } },
};
console.log(lcaInBst(bst, 2, 8), lcaInBst(bst, 2, 4), lcaInBst(bst, 3, 5));
```
Output:
```text
6 2 4
```

## quiz
1. What is the lowest common ancestor of p and q?
   - [ ] The root always
   - [x] The deepest node that has both p and q as descendants, counting itself
   - [ ] The leaf below both nodes
   - [ ] The node with the larger value
   > A node can be its own descendant for this definition.
2. How does the search tree version decide which way to go?
   - [ ] By the height
   - [x] By comparing p and q with the current value
   - [ ] By random choice
   - [ ] By the number of leaves
   > The first node between p and q splits them.
3. How is the distance between two nodes found with the LCA?
   - [ ] depth(p) times depth(q)
   - [x] depth(p) + depth(q) − 2 · depth(LCA)
   - [ ] depth(LCA) only
   - [ ] height(p) + height(q)
   > The shared part of the paths is counted twice and removed.
4. What is the time complexity of the general recursive solution?
   - [ ] O(log n)
   - [x] O(n)
   - [ ] O(1)
   - [ ] O(n squared)
   > Each node is visited at most once.

# Diameter of Binary Tree
kind: algorithm
time: O(n) because one postorder pass computes the height of each node and updates the best path through it; the naive version that recomputes heights at every node is O(n squared) in a skewed tree.
space: O(h) for the recursion stack, where h is the tree height.

## intro
The diameter of a binary tree is the length of the longest path between any two nodes, counted in edges. The path need not pass through the root, which is what makes the problem instructive: the answer at each node combines the heights of its two subtrees, and the best answer is the maximum over all nodes.

## theory
Observation: the longest path has a highest node (the node closest to the root on the path). For that node the path goes down into the left subtree as far as possible and into the right subtree as far as possible. So for every node, the longest path whose top is that node has length `height(left) + height(right)` when height is measured in edges from the child down (or `leftHeight + rightHeight` using node counts of the two arms, minus nothing, in the convention below).

Edge counting convention with heights counted in nodes:

- Let `h(node)` be the number of nodes on the longest downward path from the node (0 for an empty node)
- The longest path through the node has `h(left) + h(right)` edges
- The diameter is the maximum of `h(left) + h(right)` over all nodes

Algorithm (one postorder pass):

- Recursive function returns the height `h(node)`; before returning it updates a global (or nonlocal) best with `h(left) + h(right)`
- Return `1 + max(h(left), h(right))`

For the tree with root 1, left child 2 (with children 4 and 5) and right child 3, the longest path is 4 → 2 → 1 → 3 or 5 → 2 → 1 → 3, with 3 edges, so the diameter is 3 (and passes through the root). For the sample tree 3, 9, 20, 15, 7 the longest path is 9 → 3 → 20 → 15 with 3 edges. For a tree where the root has a short left side and a deep right side the longest path can lie entirely inside the right subtree, which is why the maximum over all nodes is required: for a root whose right child has two long arms, the diameter passes through that child, not through the root.

Naive solution: compute the diameter of the left subtree, the diameter of the right subtree and the path through the root `height(left) + height(right)` where each height is computed separately; since heights are recomputed at every node it costs O(n squared) on a skewed tree. The postorder version fixes this by returning the height and recording the diameter at the same time.

Variants:

- Diameter counted in nodes: add one to the edge count
- Diameter of an n-ary tree: at each node take the two largest child heights, so the path is their sum
- Diameter of a general tree given as a graph: run breadth first search from any node to find the farthest node u, then from u to find the farthest node v; the distance between u and v is the diameter (works for trees, with all edge weights positive)
- Maximum path sum: the same structure, but with values instead of edge counts; the best downward path value is `max(0, ...)` of each child's contribution and the global answer combines the two arms with the node value
- Longest univalue path and longest zigzag path use the same pattern of returning one quantity upwards while recording another globally

Pitfalls: returning the diameter instead of the height from the recursive function, assuming the path goes through the root, confusing edges and nodes, and using a plain variable for the best that is not shared across recursive calls (use a nonlocal variable, a list cell or a returned pair).

Testing: empty tree (0), single node (0), two nodes (1), a chain of n nodes (n − 1), a perfect tree (twice the height), and a tree whose longest path avoids the root.

## explain
1. Define the helper to return the height of a subtree and update the best path.
2. For an empty node return 0.
3. Compute the heights of the left and right subtrees.
4. Update the best diameter with the sum of the two heights.
5. Return one plus the larger height.
6. Report the best value after the traversal from the root.

## example
The Python function returns diameter 3 for the tree 1, 2, 3, 4, 5 and for the sample tree 3, 9, 20, 15, 7, and 6 for a tree whose longest path lies inside the right subtree and avoids the root. The JavaScript function uses two breadth first searches on an adjacency list and also reports 3 for the sample tree.

## real
Network designers measure the longest hop distance in tree topologies, social graph tools estimate the span of tree-like structures, and routing protocols bound latency by the diameter.

## pros
- Linear time with one pass
- Pattern generalises to path sums and zigzag paths
- A graph version works with two breadth first searches

## cons
- Easy to confuse the returned height with the recorded diameter
- Needs a shared variable across recursive calls
- Node versus edge counting causes off-by-one answers

## uses
- Measuring the longest path in a tree
- Maximum path sum problems
- Network topology analysis
- Teaching the return one thing, record another pattern

## mistakes
- Assuming the longest path passes through the root
- Returning the diameter instead of the height from the helper
- Counting nodes instead of edges, or the other way round
- Recomputing heights separately at every node

## interview
**Q:** How do you compute the diameter of a binary tree in O(n)?
**A:** Use a postorder recursion that returns each subtree's height and, at every node, updates the best diameter with the sum of the left and right heights; the answer is the maximum recorded value.

**Q:** Why does the longest path not always pass through the root?
**A:** A very deep subtree can contain a longer path between two of its own nodes than any path through the root, so the best value must be taken over all nodes.

**Q:** How can you find the diameter of an unrooted tree given as a graph?
**A:** Run a breadth first search from any node to find the farthest node, then another from that node; the greatest distance found is the diameter.

## summary
The diameter is the maximum over all nodes of the sum of the heights of their two subtrees, computed in one postorder pass that returns heights and records the best path. Remember that the longest path need not pass through the root.

## codenote
The Python sample uses the postorder method. The JavaScript sample uses two breadth first searches.

## code
### python
```python
class Node:
    def __init__(self, value, left=None, right=None):
        self.value, self.left, self.right = value, left, right

def diameter(root):
    best = 0

    def height(node):
        nonlocal best
        if node is None:
            return 0
        left, right = height(node.left), height(node.right)
        best = max(best, left + right)
        return 1 + max(left, right)

    height(root)
    return best

balanced = Node(1, Node(2, Node(4), Node(5)), Node(3))
sample = Node(3, Node(9), Node(20, Node(15), Node(7)))
inside = Node(1, Node(2), Node(3, Node(4, Node(6, Node(8)), Node(7)), Node(5, None, Node(9, None, Node(10)))))
print(diameter(balanced), diameter(sample), diameter(inside))
```
Output:
```text
3 3 6
```
### javascript
```javascript
function farthest(graph, start) {
  const distance = new Map([[start, 0]]);
  const queue = [start];
  let last = start;
  while (queue.length) {
    const node = queue.shift();
    last = node;
    for (const next of graph[node]) {
      if (!distance.has(next)) {
        distance.set(next, distance.get(node) + 1);
        queue.push(next);
      }
    }
  }
  return [last, distance.get(last)];
}

const graph = { 3: [9, 20], 9: [3], 20: [3, 15, 7], 15: [20], 7: [20] };
const [u] = farthest(graph, 3);
console.log(farthest(graph, u)[1]);
```
Output:
```text
3
```

## quiz
1. What does the helper function return in the diameter algorithm?
   - [ ] The diameter so far
   - [x] The height of the subtree
   - [ ] The number of leaves
   - [ ] The sum of the values
   > The best path is recorded separately.
2. How is the longest path through a node computed?
   - [ ] As the larger of the two heights
   - [x] As the sum of the heights of its left and right subtrees
   - [ ] As the product of the heights
   - [ ] As the depth of the node
   > The path goes down both sides as far as it can.
3. Why must the maximum be taken over all nodes?
   - [ ] To sort the nodes
   - [x] The longest path may lie entirely inside a subtree that does not include the root
   - [ ] To remove duplicates
   - [ ] To balance the tree
   > A deep subtree can contain the longest path.
4. What is the diameter of a chain of 5 nodes in edges?
   - [ ] 5
   - [x] 4
   - [ ] 3
   - [ ] 2
   > A path through all five nodes has four edges.

# Tree Interview Patterns
kind: concept
time: Not an algorithmic topic — this lesson reviews patterns. Most binary tree problems are solved with one traversal in O(n) time and O(h) space, where h is the height.
space: Not an algorithmic topic — the recursion stack depth equals the tree height, which interviewers expect you to mention along with the skewed worst case.

## intro
Tree questions in interviews repeat a handful of patterns: pick a traversal order, define what a recursive call returns, and decide whether the answer is built top down or bottom up. Naming the pattern gives you the skeleton of the solution, and the rest is bookkeeping.

## theory
Pattern 1: bottom up recursion (postorder). The function returns information about its subtree, and the parent combines the two results. Examples: height, size, balance check, diameter, maximum path sum, count of univalue subtrees, lowest common ancestor. Template: base case for an empty node, call both children, combine, optionally update a global answer.

Pattern 2: top down recursion (preorder with parameters). Pass information from the parent to the children as arguments. Examples: depth of each node, root to leaf path sum (carry the remaining target), validating a binary search tree with lower and upper bounds, counting good nodes (carry the maximum so far), building paths. For path sum with target 22 on the tree with root 5, children 4 and 8, where 4 has the child 11 with leaves 7 and 2, and 8 has children 13 and 4 (with 4 having a child 1), the answer is true via 5 → 4 → 11 → 2.

Pattern 3: level order (queue). Per level lists, zigzag, right side view, minimum depth, connecting level neighbours, maximum width.

Pattern 4: two trees at once. Recurse on two nodes together: same tree, symmetric tree, merge two trees, subtree of another tree. A tree is symmetric if its left and right subtrees are mirror images: for the level order 1, 2, 2, 3, 4, 4, 3 the answer is true, and for 1, 2, 2, null, 3, null, 3 it is false. Template: both empty is true, exactly one empty is false, values equal and children cross-matched.

Pattern 5: transform in place. Invert (mirror) a tree by swapping the children at every node, flatten a tree into a linked list in preorder, populate next pointers. Inverting the tree 4, 2, 7, 1, 3, 6, 9 gives the level order 4, 7, 2, 9, 6, 3, 1.

Pattern 6: construct from traversals. Build from preorder and inorder (use a hash map from value to inorder index to find the split in O(1)), from inorder and postorder, from a sorted array (middle element as the root), or from a serialized string.

Pattern 7: binary search tree properties. Inorder is sorted, search by comparison, validate with bounds, k-th smallest by an early stopping inorder, insert and delete, lowest common ancestor by the split point, and convert to a sorted list or a balanced tree.

Pattern 8: paths and sums. Root to leaf paths (backtracking with a path list), path sum III (prefix sums with a hash map along the path), and any node to any node path problems (bottom up with a global maximum).

Pattern 9: parent links and graph conversions. When you need to move upward (distance k from a node, time to burn a tree), build a parent map and run breadth first search from the target, treating the tree as a graph.

Choosing the traversal:

- Need children results before the parent: postorder
- Need information from ancestors: preorder with parameters
- Need level information: breadth first search
- Need sorted order of a search tree: inorder

Complexity and talk track: say that each node is visited once so the time is O(n), and that the space is O(h) from recursion, O(log n) for balanced and O(n) for skewed trees; offer an iterative version with an explicit stack when depth could be a problem.

Edge cases checklist: empty tree, single node, skewed tree, duplicate values, negative values, and trees where a missing child changes the meaning (such as minimum depth).

## explain
1. Decide whether the answer is built bottom up from children or top down from ancestors.
2. Define precisely what each recursive call takes and returns.
3. Write the base case for the empty node first.
4. Combine the results, and update a global answer only when the function returns something else.
5. State the time and space complexity, including the skewed case.
6. Test an empty tree, a single node and a skewed tree.

## example
The Python program checks the symmetric tree property on the level orders 1, 2, 2, 3, 4, 4, 3 (true) and 1, 2, 2, null, 3, null, 3 (false), and inverts the tree 4, 2, 7, 1, 3, 6, 9 to 4, 7, 2, 9, 6, 3, 1. The JavaScript program checks the root to leaf path sum 22 with a top down recursion and prints `true` for the sample tree and `false` for target 100.

## real
Compilers transform syntax trees with these patterns, file synchronisation tools compare two directory trees recursively, and rendering engines propagate layout information down and up the document tree.

## pros
- A few patterns cover most tree questions
- Each pattern has a standard template
- Naming the pattern makes the complexity analysis immediate

## cons
- Recursion depth can be an issue for skewed trees
- Choosing between top down and bottom up takes practice
- Global state in recursive solutions can be error prone

## uses
- Preparing for tree questions in interviews
- Choosing between traversal orders
- Reviewing recursive tree code
- Teaching top down versus bottom up thinking

## mistakes
- Passing information bottom up when it must come from ancestors
- Forgetting the empty tree base case
- Handling one-child nodes incorrectly in problems about leaves and depth
- Using a plain global counter that is not reset between test cases

## interview
**Q:** What is the difference between top down and bottom up tree recursion?
**A:** Top down passes information from parents to children as arguments, as in path sums and BST bounds, while bottom up returns information from children to the parent, as in height and diameter.

**Q:** How do you check whether a binary tree is symmetric?
**A:** Compare the left and right subtrees as mirror images: two empty nodes match, one empty node does not, and otherwise the values must be equal and each node's left child must mirror the other's right child.

**Q:** How do you build a binary tree from its preorder and inorder traversals?
**A:** The first preorder value is the root; find it in the inorder sequence (using a hash map for O(1) lookups) to split the left and right subtrees and recurse on the corresponding segments.

## summary
Tree interview questions reduce to a few patterns: bottom up and top down recursion, level order, two-tree recursion, in-place transforms, construction from traversals and binary search tree properties. State what each call returns, handle the empty node and give the O(n) time and O(h) space.

## codenote
The Python sample checks symmetry and inverts a tree. The JavaScript sample checks a path sum.

## code
### python
```python
from collections import deque

class Node:
    def __init__(self, value):
        self.value, self.left, self.right = value, None, None

def build(values):
    root = Node(values[0])
    queue, i = deque([root]), 1
    while queue and i < len(values):
        node = queue.popleft()
        for side in ("left", "right"):
            if i < len(values) and values[i] is not None:
                child = Node(values[i])
                setattr(node, side, child)
                queue.append(child)
            i += 1
    return root

def mirror(a, b):
    if a is None or b is None:
        return a is b
    return a.value == b.value and mirror(a.left, b.right) and mirror(a.right, b.left)

def invert(node):
    if node:
        node.left, node.right = invert(node.right), invert(node.left)
    return node

def level_order(root):
    out, queue = [], deque([root])
    while queue:
        node = queue.popleft()
        out.append(node.value)
        queue.extend(child for child in (node.left, node.right) if child)
    return out

symmetric = build([1, 2, 2, 3, 4, 4, 3])
lopsided = build([1, 2, 2, None, 3, None, 3])
print(mirror(symmetric.left, symmetric.right), mirror(lopsided.left, lopsided.right))
print(level_order(invert(build([4, 2, 7, 1, 3, 6, 9]))))
```
Output:
```text
True False
[4, 7, 2, 9, 6, 3, 1]
```
### javascript
```javascript
function build(values) {
  const nodes = values.map((v) => (v === null ? null : { value: v, left: null, right: null }));
  let child = 1;
  for (const node of nodes) {
    if (!node) continue;
    node.left = nodes[child++] ?? null;
    node.right = nodes[child++] ?? null;
  }
  return nodes[0];
}

function hasPathSum(node, remaining) {
  if (!node) return false;
  remaining -= node.value;
  if (!node.left && !node.right) return remaining === 0;
  return hasPathSum(node.left, remaining) || hasPathSum(node.right, remaining);
}

const tree = build([5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1]);
console.log(hasPathSum(tree, 22), hasPathSum(tree, 100));
```
Output:
```text
true false
```

## quiz
1. Which recursion style passes information from ancestors to descendants?
   - [ ] Bottom up
   - [x] Top down
   - [ ] Level order
   - [ ] Reverse
   > Arguments carry the information downward.
2. What is the base case in the mirror check of two nodes?
   - [ ] Both nodes have the same value
   - [x] Both empty is true and exactly one empty is false
   - [ ] Both nodes are leaves
   - [ ] The depth is zero
   > The recursion needs to handle missing children.
3. Which pattern suits computing the height of a tree?
   - [ ] Top down with parameters
   - [x] Bottom up where each call returns its subtree height
   - [ ] Zigzag traversal
   - [ ] Morris traversal
   > The parent combines the heights of its children.
4. Why is a hash map used when building a tree from preorder and inorder sequences?
   - [ ] To sort the values
   - [x] To find the root's position in the inorder sequence in constant time
   - [ ] To store the tree height
   - [ ] To detect cycles
   > The position splits the left and right subtrees.
