# Tree Terminology
kind: concept
time: Not an algorithmic topic — terminology has no running time. Visiting every node of a tree with n nodes costs O(n), and following one path from the root costs O(height).
space: Not an algorithmic topic — a tree with n nodes needs O(n) memory, and a recursive traversal needs O(height) stack space.

## intro
A tree is a hierarchical structure of nodes connected by edges, with a single root at the top and no cycles. File systems, HTML documents, organisation charts and the call structure of recursive programs are all trees, and a shared vocabulary of root, parent, child, leaf, depth and height lets you describe them precisely.

## theory
Basic vocabulary:

- Node: an element of the tree that holds a value and links to its children
- Edge: a link between a parent and a child; a tree with n nodes has exactly n − 1 edges
- Root: the unique node with no parent, where every traversal starts
- Parent and child: a node directly above and the nodes directly below it
- Siblings: nodes that share the same parent
- Leaf (external node): a node with no children; an internal node has at least one child
- Ancestor and descendant: any node on the path from the root to a node is its ancestor, and the node is a descendant of each of them
- Subtree: a node together with all its descendants, which is itself a tree
- Degree of a node: the number of its children; the degree of a tree is the maximum degree of its nodes (binary trees have degree at most 2)

Measurements:

- Depth of a node: the number of edges from the root to the node (the root has depth 0)
- Level: all nodes of the same depth; the root is level 0 (some books start at 1, so check the convention)
- Height of a node: the number of edges on the longest downward path from the node to a leaf (leaves have height 0)
- Height of a tree: the height of the root
- Size: the number of nodes in a subtree

Worked example. Consider the tree with root A, whose children are B and C; B has children D and E; C has one child F. Then the leaves are D, E and F, the internal nodes are A, B and C, the depth of F is 2, the height of the tree is 2, the ancestors of F are C and A, the subtree of B has 3 nodes and the tree has 6 nodes and 5 edges.

Kinds of trees:

- General (n-ary) tree: each node may have any number of children, as in a file system
- Binary tree: each node has at most two children, called left and right
- Binary search tree: a binary tree ordered by key so that searching is fast
- Rooted versus unrooted: in graph theory a tree is any connected graph without cycles, and choosing a root gives it a direction
- Forest: a collection of disjoint trees

Representations: nodes with child pointers (or a list of children), an array for complete binary trees (children of index i at 2i + 1 and 2i + 2), or a parent array that stores only the parent of each node, which is compact and used in disjoint set structures.

Why trees matter: they model hierarchy, give logarithmic search paths when balanced, allow recursive definitions (a tree is a node plus a list of subtrees) and underlie parsing, indexing and decision making.

Recursive thinking: nearly every tree function follows the same shape: handle the empty tree, compute something for the left and right subtrees, and combine the results with the current node. The measurements above have recursive definitions: height(node) = 1 + max(height(children)) with the convention that an empty tree has height −1.

Common confusions: depth is measured from the root down while height is measured from a node to the deepest leaf below it; the number of nodes on a path is one more than the number of edges; and a tree with one node has height 0.

## explain
1. Identify the root, the node with no parent.
2. For each node list its children; nodes with none are leaves.
3. Compute depth by counting edges from the root downwards.
4. Compute height by taking the longest downward path to a leaf.
5. Count edges as nodes minus one and check consistency.
6. State which convention you use for levels and heights.

## example
The Python program stores the tree A, B, C, D, E, F as a dictionary of children and prints its root, leaves, the depth and ancestors of F, the height of the tree and the size of the subtree rooted at B. The JavaScript program counts nodes, leaves and levels of a nested object tree.

## real
Operating systems organise folders as trees, browsers represent pages as the document tree, and companies draw reporting structures as trees.

## pros
- A common vocabulary makes tree problems precise
- Recursive definitions give short algorithms
- Hierarchical data fits trees naturally

## cons
- Conventions for depth, level and height differ between books
- Deep trees can overflow recursion stacks
- Plain trees give no search speed without ordering

## uses
- Describing hierarchical data
- Reading the terminology in algorithm problems
- Choosing between tree representations
- Analysing recursive procedures on trees

## mistakes
- Confusing depth with height
- Mixing up nodes and edges when counting path length
- Assuming every tree is binary
- Forgetting that an empty tree has no root

## interview
**Q:** What is the difference between the depth and the height of a node?
**A:** Depth is the number of edges from the root down to the node, while height is the number of edges on the longest path from the node down to a leaf.

**Q:** How many edges does a tree with n nodes have?
**A:** Exactly n minus 1, because every node except the root has exactly one edge to its parent.

**Q:** What is a leaf and what is an internal node?
**A:** A leaf has no children, while an internal node has at least one child.

## summary
A tree is an acyclic hierarchy with a root, parents, children and leaves, described by depth, level, height and size. Learn the vocabulary and the recursive definition, since every tree algorithm builds on them.

## codenote
The Python sample computes terminology measures. The JavaScript sample counts nodes and leaves.

## code
### python
```python
children = {"A": ["B", "C"], "B": ["D", "E"], "C": ["F"], "D": [], "E": [], "F": []}
parent = {child: node for node, kids in children.items() for child in kids}

def depth(node):
    return 0 if node not in parent else 1 + depth(parent[node])

def height(node):
    return 0 if not children[node] else 1 + max(height(kid) for kid in children[node])

def size(node):
    return 1 + sum(size(kid) for kid in children[node])

def ancestors(node):
    return [] if node not in parent else [parent[node]] + ancestors(parent[node])

leaves = [node for node, kids in children.items() if not kids]
print(leaves, depth("F"), ancestors("F"), height("A"), size("B"), len(children) - 1)
```
Output:
```text
['D', 'E', 'F'] 2 ['C', 'A'] 2 3 5
```
### javascript
```javascript
const tree = {
  value: "root",
  children: [
    { value: "docs", children: [{ value: "a.txt", children: [] }, { value: "b.txt", children: [] }] },
    { value: "src", children: [{ value: "main.js", children: [] }] },
  ],
};

function stats(node, level = 0) {
  const own = { nodes: 1, leaves: node.children.length ? 0 : 1, levels: level + 1 };
  return node.children.map((child) => stats(child, level + 1)).reduce((a, b) => ({
    nodes: a.nodes + b.nodes,
    leaves: a.leaves + b.leaves,
    levels: Math.max(a.levels, b.levels),
  }), own);
}

console.log(stats(tree));
```
Output:
```text
{ nodes: 6, leaves: 3, levels: 3 }
```

## quiz
1. What is the root of a tree?
   - [ ] A leaf with the largest value
   - [x] The node that has no parent
   - [ ] The last node inserted
   - [ ] Any node with two children
   > Every other node has exactly one parent.
2. How is the height of a leaf defined?
   - [ ] One
   - [x] Zero
   - [ ] The depth of the root
   - [ ] The number of siblings
   > A leaf has no downward edges.
3. How many edges does a tree with 6 nodes have?
   - [ ] 6
   - [x] 5
   - [ ] 7
   - [ ] 12
   > Each non-root node contributes one edge.
4. What do the siblings of a node share?
   - [ ] The same value
   - [x] The same parent
   - [ ] The same depth only by accident
   - [ ] The same subtree
   > Siblings are children of one node.

# Binary Tree Properties
kind: concept
time: Not an algorithmic topic — these are structural facts. They bound running times: a binary tree with n nodes has height between about log2 n and n − 1, so root to leaf algorithms take between O(log n) and O(n) steps.
space: Not an algorithmic topic — an array representation of a complete binary tree uses n cells with no pointers, while a skewed tree stored in an array wastes exponential space.

## intro
A binary tree allows each node at most two children. That small restriction gives a rich set of exact counting rules, such as how many nodes fit in a given height, and a vocabulary of shapes, full, complete, perfect and skewed, that explains why some trees are fast and others degenerate into linked lists.

## theory
Counting facts (with the root at level 0 and height measured in edges):

- A binary tree has at most 2^i nodes at level i
- A binary tree of height h has at most 2^(h + 1) − 1 nodes in total
- A binary tree with n nodes has height at least ⌈log2(n + 1)⌉ − 1, so the best case is logarithmic, and at most n − 1 for a chain
- In a binary tree, the number of leaves equals the number of nodes with two children plus one
- A full binary tree with L leaves has exactly 2L − 1 nodes
- A tree with n nodes has n − 1 edges and n + 1 null child links (pointers)

Shapes:

- Full (strict) binary tree: every node has 0 or 2 children
- Perfect binary tree: all internal nodes have two children and all leaves are at the same depth; it has exactly 2^(h + 1) − 1 nodes, for example 7 nodes at height 2 and 15 at height 3
- Complete binary tree: every level is completely filled except possibly the last, which is filled from left to right. Heaps are complete trees.
- Balanced tree: the heights of the two subtrees of every node differ by at most one (AVL condition), or the height is O(log n)
- Degenerate or skewed tree: every node has one child, so the tree is a linked list with height n − 1

Array representation of a complete binary tree: with the root at index 0, the children of the node at index i are at 2i + 1 and 2i + 2 and its parent is at (i − 1) // 2. No pointers are stored and the layout is cache friendly. A skewed tree stored this way would need 2^n cells, so arrays suit only complete trees; trees with gaps use pointers or an explicit placeholder.

Why shape matters: operations on a binary search tree cost O(height). Inserting sorted keys one after another into a plain binary search tree produces a skewed tree with height n − 1, and each search is linear. Balanced variants (AVL, red-black) keep the height near log2 n. A perfect tree with 1,000,000 nodes has height under 20.

Checks you can code:

- Is the tree full? Every node has zero or two children
- Is it perfect? Compare the node count with 2^(h + 1) − 1
- Is it complete? Traverse level by level; once a missing child appears, no further node may have children (or use the array index test: the position of every node is less than the node count)

Examples: the tree 1, 2, 3, 4, 5, 6, 7 in level order is perfect; 1, 2, 3, 4, 5 is complete but not perfect; 1, 2, 3, 4, None, None, 7 is not complete because node 3 has a child while node 2 is missing its right child; and 1, 2, 3, None, 5 is neither full nor complete.

Applications of the facts: bounding the height of heaps and balanced trees, sizing arrays for heaps, estimating the number of comparisons in decision trees (a binary decision tree with n! leaves has height at least log2(n!), which proves the Ω(n log n) lower bound for comparison sorting), and deriving the depth of recursion in divide and conquer algorithms.

## explain
1. Decide the convention for levels and height.
2. Use the maximum counts per level to bound the number of nodes for a given height.
3. Classify the shape: full, complete, perfect or skewed.
4. For complete trees use the array index formulas for parent and children.
5. Relate height to the cost of search and insertion.
6. Check shapes with a level order traversal or the node count formula.

## example
The Python program prints the maximum node counts per level for a tree of height 3, the minimum height for 1000 nodes, and classifies several level-order lists as perfect, complete or neither. The JavaScript program checks the complete tree property with the array index rule and finds parent and child indexes in the array form.

## real
Binary heaps store complete trees in arrays, binary decision diagrams use binary trees, and database indexes are designed to stay shallow, which the counting facts quantify.

## pros
- Exact counting rules give guaranteed bounds
- Complete trees fit in arrays without pointers
- Shape vocabulary predicts performance

## cons
- Skewed trees destroy the logarithmic bounds
- Array representation wastes space for sparse trees
- Terminology differs between sources, such as full and complete

## uses
- Bounding the height and size of trees
- Sizing heaps stored in arrays
- Classifying tree shapes in problems
- Explaining lower bounds for comparison sorts

## mistakes
- Confusing full, complete and perfect trees
- Using 1 based and 0 based index formulas interchangeably
- Assuming every binary tree has logarithmic height
- Forgetting that the last level of a complete tree fills from the left

## interview
**Q:** What is the maximum number of nodes in a binary tree of height h?
**A:** 2^(h + 1) − 1, reached by a perfect binary tree with all levels full, where height counts edges from the root to the deepest leaf.

**Q:** What is the difference between a full and a complete binary tree?
**A:** In a full tree every node has zero or two children, while in a complete tree every level is filled except possibly the last, which is filled from the left.

**Q:** How are the children of a node found in the array form of a complete binary tree?
**A:** With the root at index 0, the children of index i are at 2i + 1 and 2i + 2, and the parent is at (i − 1) divided by 2, rounded down.

## summary
Binary trees obey exact counting rules: at most 2^i nodes at level i, at most 2^(h + 1) − 1 in total, and height between log n and n − 1. Shape names such as full, perfect, complete and skewed predict how fast the tree is.

## codenote
The Python sample computes the counts and classifies shapes. The JavaScript sample uses the array index formulas.

## code
### python
```python
import math

def classify(level_order):
    n = len(level_order)
    complete = True
    missing_seen = False
    for value in level_order:
        if value is None:
            missing_seen = True
        elif missing_seen:
            complete = False
    perfect = complete and None not in level_order and (n + 1) & n == 0
    return "perfect" if perfect else "complete" if complete else "neither"

print([2 ** level for level in range(4)], sum(2 ** level for level in range(4)))
print(math.ceil(math.log2(1000 + 1)) - 1)
print(classify([1, 2, 3, 4, 5, 6, 7]), classify([1, 2, 3, 4, 5]), classify([1, 2, 3, 4, None, None, 7]))
```
Output:
```text
[1, 2, 4, 8] 15
9
perfect complete neither
```
### javascript
```javascript
function isComplete(levelOrder) {
  const firstGap = levelOrder.indexOf(null);
  return firstGap === -1 || levelOrder.slice(firstGap).every((value) => value === null);
}

const parent = (i) => Math.floor((i - 1) / 2);
const children = (i) => [2 * i + 1, 2 * i + 2];

console.log(isComplete([1, 2, 3, 4, 5]), isComplete([1, 2, 3, null, 5]));
console.log(parent(5), children(2).join(" "), children(0).join(" "));
```
Output:
```text
true false
2 5 6 1 2
```

## quiz
1. What is the maximum number of nodes at level 3 of a binary tree?
   - [ ] 3
   - [x] 8
   - [ ] 6
   - [ ] 16
   > Level i holds at most 2 to the power i nodes.
2. How many nodes does a perfect binary tree of height 2 have?
   - [ ] 4
   - [x] 7
   - [ ] 8
   - [ ] 9
   > It has 2 to the power 3 minus 1 nodes.
3. What is a skewed binary tree?
   - [ ] A tree with all leaves at one depth
   - [x] A tree in which every node has at most one child, like a list
   - [ ] A tree stored in an array
   - [ ] A full tree
   > Its height equals the number of nodes minus one.
4. Where is the left child of the node at index 2 in the array form?
   - [ ] Index 3
   - [x] Index 5
   - [ ] Index 4
   - [ ] Index 6
   > The left child of index i is at 2i plus 1.

# Tree Traversals Inorder
kind: algorithm
time: O(n) for a tree with n nodes, since every node is visited exactly once.
space: O(h) for the recursion stack or an explicit stack, where h is the height, ranging from O(log n) in a balanced tree to O(n) in a skewed one; Morris traversal uses O(1).
viz: tree-inorder

## intro
An inorder traversal visits the left subtree, then the node itself, then the right subtree. For a binary search tree this visits the keys in sorted order, which is the reason inorder traversal is the most important of the depth first orders: it turns a tree back into a sorted list.

## theory
Recursive definition:

- If the node is empty, stop
- Traverse the left subtree
- Visit the node (print or collect its value)
- Traverse the right subtree

For the tree with root 3, left child 9, right child 20 whose children are 15 and 7, the inorder sequence is 9, 3, 15, 20, 7. For the binary search tree with root 4, children 2 and 6, and leaves 1, 3, 5, 7 the sequence is 1, 2, 3, 4, 5, 6, 7: sorted, as expected.

Iterative version with an explicit stack:

- Start with `current = root` and an empty stack
- While `current` exists or the stack is not empty: go as far left as possible, pushing each node; then pop a node, visit it, and set `current` to its right child

This simulates the recursion and gives the same order. The stack holds the path of ancestors whose left subtrees are being processed, so its size is at most the height.

Morris traversal: reaches O(1) extra space by temporarily threading the tree. For each node with a left subtree, find its inorder predecessor (the rightmost node of the left subtree) and link the predecessor's right pointer to the node; later, when you return to the node through that thread, remove the thread and visit it. Each edge is traversed at most three times, so the time stays O(n), and the tree is restored at the end.

Uses of inorder traversal:

- Sorted output of a binary search tree
- Validating a BST: the inorder sequence must be strictly increasing
- Finding the k-th smallest element: stop after k visits (or use subtree sizes)
- Converting a BST to a sorted array or a sorted array to a balanced BST (the middle element becomes the root)
- Successor and predecessor queries: the next node in the inorder sequence
- Expression trees: inorder prints the infix expression (with parentheses added around subexpressions)
- Range queries and merging two BSTs by merging their inorder sequences

Complexity: the time is linear in the number of nodes. Recursion depth equals the height, so a skewed tree with 100,000 nodes can overflow the call stack in languages with small limits; the iterative version avoids the problem by using the heap.

Generators: in Python a recursive generator (`yield from`) streams the nodes lazily, which is useful when only the first few values are needed, such as the k smallest.

Pitfalls: confusing the order of the three steps (moving the visit step gives preorder or postorder), forgetting the null check, and in the iterative version forgetting to move to the right child after visiting. Without a BST property, inorder has no special meaning beyond a consistent order.

Testing: empty tree (empty sequence), single node, left-only chain (the values from deepest to the root) and right-only chain.

## explain
1. If the current node is empty, return.
2. Traverse the left subtree.
3. Visit the current node.
4. Traverse the right subtree.
5. For the iterative form, push nodes while moving left, then pop, visit and move right.
6. Check the output of a BST against a sorted list.

## example
The Python program traverses the tree 3, 9, 20, 15, 7 inorder both recursively and iteratively, giving 9, 3, 15, 20, 7, and it prints 1 to 7 for the binary search tree rooted at 4. The JavaScript program uses an explicit stack and returns the third smallest key of the same BST, which is 3.

## real
Databases scan ordered indexes with inorder traversals, compilers print infix expressions from expression trees, and libraries that offer sorted maps iterate in inorder.

## pros
- Produces sorted order for binary search trees
- Simple recursive definition
- Iterative and constant space variants exist

## cons
- Recursion can overflow on very deep trees
- Gives no special order for unordered trees
- Morris traversal modifies the tree temporarily

## uses
- Sorted listing of a binary search tree
- Validating the BST property
- Finding the k-th smallest key
- Printing infix expressions

## mistakes
- Moving the visit step and producing a different traversal order
- Not setting the current node to its right child after popping in the iterative form
- Forgetting the empty tree case
- Using inorder on an unordered tree and expecting sorted output

## interview
**Q:** What order does an inorder traversal visit nodes in?
**A:** Left subtree, then the node, then the right subtree, which gives the keys of a binary search tree in ascending order.

**Q:** How do you perform an inorder traversal without recursion?
**A:** Use a stack: push nodes while going left, pop one to visit it and move to its right child, and repeat until both the current node and the stack are empty.

**Q:** How can inorder traversal check whether a tree is a valid binary search tree?
**A:** Traverse inorder while remembering the previous value; the tree is valid only if every value is strictly greater than the previous one.

## summary
Inorder traversal visits left, node, right in O(n) time and gives sorted keys for a binary search tree. Use a stack to avoid deep recursion, and Morris threading when constant space is required.

## codenote
The Python sample traverses recursively and iteratively. The JavaScript sample finds the k-th smallest key.

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

def inorder(node):
    return inorder(node.left) + [node.value] + inorder(node.right) if node else []

def inorder_iterative(root):
    out, stack, current = [], [], root
    while current or stack:
        while current:
            stack.append(current)
            current = current.left
        current = stack.pop()
        out.append(current.value)
        current = current.right
    return out

tree = build([3, 9, 20, None, None, 15, 7])
print(inorder(tree), inorder_iterative(tree))
print(inorder(build([4, 2, 6, 1, 3, 5, 7])))
```
Output:
```text
[9, 3, 15, 20, 7] [9, 3, 15, 20, 7]
[1, 2, 3, 4, 5, 6, 7]
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

function kthSmallest(root, k) {
  const stack = [];
  let current = root;
  while (current || stack.length) {
    while (current) {
      stack.push(current);
      current = current.left;
    }
    current = stack.pop();
    if (--k === 0) return current.value;
    current = current.right;
  }
  return undefined;
}

console.log(kthSmallest(build([4, 2, 6, 1, 3, 5, 7]), 3), kthSmallest(build([4, 2, 6, 1, 3, 5, 7]), 8));
```
Output:
```text
3 undefined
```

## quiz
1. What is the visiting order of an inorder traversal?
   - [ ] Node, left, right
   - [x] Left, node, right
   - [ ] Left, right, node
   - [ ] Right, node, left
   > The node is visited between its two subtrees.
2. What does inorder traversal produce for a binary search tree?
   - [ ] Reverse order
   - [x] Keys in ascending order
   - [ ] Level by level order
   - [ ] Random order
   > Smaller keys lie in the left subtree.
3. What does the stack hold in the iterative inorder traversal?
   - [ ] Visited nodes
   - [x] Ancestors whose left subtrees are still being processed
   - [ ] Leaves only
   - [ ] The sorted output
   > They are revisited after their left subtrees are done.
4. How much extra space does Morris traversal need?
   - [ ] O(n)
   - [x] O(1)
   - [ ] O(h)
   - [ ] O(log n)
   > It threads predecessor pointers temporarily.

# Tree Traversals Preorder
kind: algorithm
time: O(n) for n nodes, since every node is visited once and each edge is followed once.
space: O(h) for the recursion stack or the explicit stack, where h is the tree height; O(n) in a skewed tree.
viz: tree-preorder

## intro
A preorder traversal visits a node before its subtrees: the node, then the left subtree, then the right subtree. Because parents come before children, preorder is the natural order for copying a tree, writing it to a file and reading it back, and for any process that needs to know a node before its descendants.

## theory
Recursive definition:

- If the node is empty, stop
- Visit the node
- Traverse the left subtree
- Traverse the right subtree

For the tree with root 3, left child 9, and right child 20 whose children are 15 and 7, the preorder sequence is 3, 9, 20, 15, 7. The root always comes first.

Iterative version with a stack:

- Push the root
- While the stack is not empty: pop a node, visit it, push its right child and then its left child (the right child goes first so the left child is popped first)

The order of pushing matters: pushing the right child first guarantees the left subtree is processed before the right one. Each node is pushed and popped once, and the stack never holds more than about the height plus one node on a path, so the space is O(h).

Preorder facts:

- The first element of the preorder sequence is the root
- The preorder sequence of a subtree is a contiguous block in the whole sequence, so a subtree can be cut out by index
- Preorder alone does not identify a tree uniquely, since different shapes can share it; preorder together with inorder does identify a binary tree with distinct values, and preorder with null markers does as well
- For a binary search tree, the preorder sequence (without markers) is enough to rebuild the tree, by inserting the values in order

Uses:

- Copying a tree: create the node first, then copy the subtrees
- Serialization: write the preorder sequence with a marker for empty children (for example `3,9,#,#,20,15,#,#,7,#,#`), which can be read back recursively
- Prefix (Polish) notation of an expression tree
- Printing a directory tree with the folder name before its contents
- Depth first search on trees and graphs follows preorder when the node is processed on discovery
- Constructing a tree from preorder and inorder sequences
- Evaluating decision trees from the root downwards, and generating paths from the root to each leaf

Depth first generators: in Python `yield` the node and then `yield from` the children; the same function with the order changed gives the other traversals.

Complexity: O(n) time and O(h) space. For a tree with a million nodes and balanced shape the stack depth is about 20; for a chain it is a million, which recursion may not survive, so use the explicit stack.

Pitfalls: pushing left before right in the iterative version (which reverses the sibling order), missing the empty tree check, and forgetting that visiting before recursing is what makes it preorder.

Testing: empty tree, single node, a chain of left children (the sequence is root to leaf) and a chain of right children (also root to leaf), plus a full tree where the output can be checked by hand.

## explain
1. If the node is empty, return.
2. Visit the node first.
3. Traverse the left subtree.
4. Traverse the right subtree.
5. For the iterative form, push the root, then repeatedly pop, visit and push right then left.
6. Compare with the expected sequence on a small tree.

## example
The Python program prints the preorder sequence 3, 9, 20, 15, 7 of the sample tree recursively and iteratively and serializes the tree as `3,9,#,#,20,15,#,#,7,#,#`. The JavaScript program uses an explicit stack to list every root to leaf path of the same tree: 3 → 9 and 3 → 20 → 15 and 3 → 20 → 7.

## real
File systems list directories in preorder, serializers write trees in preorder, and compilers walk syntax trees from the root down to generate code.

## pros
- Parents come before children, which suits copying and serialization
- Simple to implement with recursion or a stack
- The root is always first in the sequence

## cons
- No sorted output for search trees
- Deep recursion can overflow on skewed trees
- Needs markers or a second traversal to reconstruct a unique tree

## uses
- Copying and cloning trees
- Serializing trees to text
- Prefix notation of expression trees
- Listing root to leaf paths

## mistakes
- Pushing the left child before the right child in the iterative version
- Visiting the node after the recursive calls and producing postorder
- Assuming the preorder sequence alone defines the tree
- Forgetting the marker for empty children in serialization

## interview
**Q:** What order does a preorder traversal visit nodes in?
**A:** The node first, then its left subtree and then its right subtree, so every parent appears before its descendants.

**Q:** Why do you push the right child before the left child in the iterative preorder?
**A:** The stack is last in, first out, so the left child pushed last is popped first, which makes the left subtree be processed before the right.

**Q:** Why is preorder used for serialization?
**A:** The root comes first, so a reader can create the node and then recursively read the left and right subtrees, provided empty children are marked.

## summary
Preorder visits the node before its subtrees in O(n) time, which makes it the natural order for copying and serializing trees. In the iterative form push the right child first so the left subtree is handled first.

## codenote
The Python sample traverses and serializes. The JavaScript sample lists root to leaf paths with a stack.

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

def preorder(node):
    return [node.value] + preorder(node.left) + preorder(node.right) if node else []

def preorder_iterative(root):
    out, stack = [], [root]
    while stack:
        node = stack.pop()
        if node:
            out.append(node.value)
            stack.append(node.right)
            stack.append(node.left)
    return out

def serialize(node):
    if node is None:
        return ["#"]
    return [str(node.value)] + serialize(node.left) + serialize(node.right)

tree = build([3, 9, 20, None, None, 15, 7])
print(preorder(tree), preorder_iterative(tree))
print(",".join(serialize(tree)))
```
Output:
```text
[3, 9, 20, 15, 7] [3, 9, 20, 15, 7]
3,9,#,#,20,15,#,#,7,#,#
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

function rootToLeafPaths(root) {
  const paths = [];
  const stack = [[root, [root.value]]];
  while (stack.length) {
    const [node, path] = stack.pop();
    if (!node.left && !node.right) paths.push(path.join("->"));
    if (node.right) stack.push([node.right, [...path, node.right.value]]);
    if (node.left) stack.push([node.left, [...path, node.left.value]]);
  }
  return paths;
}

console.log(rootToLeafPaths(build([3, 9, 20, null, null, 15, 7])).join(" "));
```
Output:
```text
3->9 3->20->15 3->20->7
```

## quiz
1. When is the node visited in a preorder traversal?
   - [ ] After both subtrees
   - [x] Before both subtrees
   - [ ] Between the subtrees
   - [ ] Only for leaves
   > The root of each subtree comes first.
2. Which element is always first in a preorder sequence?
   - [ ] The smallest value
   - [x] The root
   - [ ] The leftmost leaf
   - [ ] The largest value
   > Parents precede their descendants.
3. Why is the right child pushed first in the iterative version?
   - [ ] To save memory
   - [x] So the left child is popped first
   - [ ] Because right children are larger
   - [ ] To avoid null checks
   > The stack reverses the pushing order.
4. What does the preorder sequence of the sample tree look like?
   - [ ] 9, 3, 15, 20, 7
   - [x] 3, 9, 20, 15, 7
   - [ ] 9, 15, 7, 20, 3
   - [ ] 3, 9, 15, 7, 20
   > The root, then the left subtree, then the right subtree.

# Tree Traversals Postorder
kind: algorithm
time: O(n) for n nodes, since every node is visited once after its children.
space: O(h) for the recursion stack or the explicit stack, where h is the height of the tree.
viz: tree-postorder

## intro
A postorder traversal visits both subtrees before the node itself: left, right, then the node. Children are always processed before their parent, so it is the right order whenever a node's answer depends on its descendants, such as computing sizes and heights, evaluating an expression tree or deleting a tree safely.

## theory
Recursive definition:

- If the node is empty, stop
- Traverse the left subtree
- Traverse the right subtree
- Visit the node

For the tree with root 3, left child 9, right child 20 whose children are 15 and 7, the postorder sequence is 9, 15, 7, 20, 3. The root is always last.

Iterative versions:

- Two stacks: push the root on the first stack; repeatedly pop a node, push it on the second stack and push its left then right child on the first; reading the second stack from top to bottom gives postorder (the sequence is the reverse of a root, right, left traversal)
- One stack with a last visited pointer: go left pushing nodes; look at the top; if it has a right child that has not been visited yet, move to that child; otherwise pop and visit the top and remember it as the last visited node. This requires care but uses a single stack.
- Reverse trick: do a preorder variant (node, right, left) and reverse the result

Why postorder suits bottom-up computations: the function receives the answers for both children before computing its own. Examples:

- Height: `1 + max(height(left), height(right))`
- Size: `1 + size(left) + size(right)`
- Directory size: the total size of a folder is the sum of its files and the totals of its subfolders, which are known only after the subfolders are processed. A folder with files of 10 and 20 bytes and subfolders of totals 5 and 100 has total 135.
- Expression evaluation: evaluate both operands, then apply the operator; the postorder of an expression tree is the postfix (reverse Polish) expression, which a stack machine evaluates directly
- Deleting or freeing a tree: free the children before the parent, otherwise the links to the children are lost
- Checking balance and computing the diameter or the maximum path sum, which combine the results of the two children
- Dependency resolution: build the dependencies before the thing that depends on them (a topological order for tree-shaped dependencies)

Generating postfix from the expression tree for `(2 + 3) * 4`: the tree has `*` at the root, `+` with children 2 and 3 on the left and 4 on the right. Postorder gives 2, 3, +, 4, *, which evaluates to 20.

Complexity: O(n) time; space O(h). In a balanced tree the stack is logarithmic, in a chain it is linear.

Comparison of the three depth first orders: preorder = node first (copy, serialize), inorder = node in the middle (sorted output for search trees), postorder = node last (aggregation, deletion). They differ only in where the visit step sits relative to the two recursive calls.

Pitfalls: in the single stack version, visiting a node twice or never when the last visited pointer is not updated; using preorder when a bottom-up property is needed, which forces extra passes; and not handling empty children.

Testing: empty tree, single node, left chain (leaves first, root last), right chain, and a check that for every node its children appear earlier in the sequence.

## explain
1. If the node is empty, return.
2. Traverse the left subtree.
3. Traverse the right subtree.
4. Visit the node, now that both children have been processed.
5. For the iterative form, use a stack with a last visited pointer or two stacks.
6. Use the returned values of the children to compute the node's own result.

## example
The Python program prints the postorder sequence 9, 15, 7, 20, 3 of the sample tree, computes folder sizes bottom up for a small directory tree with total 135, and evaluates `(2 + 3) * 4` from its expression tree to 20. The JavaScript program performs an iterative postorder with a last visited pointer and gets the same sequence for the sample tree.

## real
Build systems compile dependencies before dependents, file utilities compute folder sizes after their contents, and memory managers free child objects before parents.

## pros
- Gives children's results before the parent computes
- Natural fit for sizes, heights and expression evaluation
- Safe order for deleting trees

## cons
- Iterative versions are harder to write
- Recursion depth limits apply to deep trees
- The root is the last node, so no early results about the root

## uses
- Computing sizes, heights and aggregates
- Evaluating expression trees
- Deleting and freeing trees
- Resolving dependencies bottom up

## mistakes
- Visiting the node before the recursive calls and getting preorder
- Forgetting to update the last visited pointer in the one stack version
- Computing aggregates in preorder and needing extra passes
- Ignoring the empty subtree in aggregate functions

## interview
**Q:** In which order does a postorder traversal visit nodes?
**A:** The left subtree, then the right subtree, then the node, so every node comes after all of its descendants and the root is last.

**Q:** Why is postorder used to compute the size of folders?
**A:** A folder's total depends on the totals of its subfolders, which are known only after those subfolders have been fully processed.

**Q:** How can you do a postorder traversal with two stacks?
**A:** Pop from the first stack, push the node on the second and push its left and right children on the first; popping the second stack afterwards yields the postorder sequence.

## summary
Postorder visits left, right, then the node in O(n) time, so each node sees its children's results first. It suits sizes, heights, expression evaluation and safe deletion.

## codenote
The Python sample computes sizes and evaluates an expression tree. The JavaScript sample is an iterative postorder.

## code
### python
```python
class Node:
    def __init__(self, value, left=None, right=None):
        self.value, self.left, self.right = value, left, right

def postorder(node):
    return postorder(node.left) + postorder(node.right) + [node.value] if node else []

def total_size(folder):
    own = sum(folder["files"])
    return own + sum(total_size(child) for child in folder["folders"])

def evaluate(node):
    if node.left is None:
        return node.value
    left, right = evaluate(node.left), evaluate(node.right)
    return {"+": left + right, "-": left - right, "*": left * right}[node.value]

tree = Node(3, Node(9), Node(20, Node(15), Node(7)))
print(postorder(tree))
root = {"files": [10, 20], "folders": [{"files": [5], "folders": []}, {"files": [100], "folders": []}]}
print(total_size(root))
expression = Node("*", Node("+", Node(2), Node(3)), Node(4))
print(evaluate(expression), postorder(expression))
```
Output:
```text
[9, 15, 7, 20, 3]
135
20 [2, 3, '+', 4, '*']
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

function postorderIterative(root) {
  const out = [];
  const stack = [];
  let current = root;
  let last = null;
  while (current || stack.length) {
    if (current) {
      stack.push(current);
      current = current.left;
    } else {
      const top = stack[stack.length - 1];
      if (top.right && last !== top.right) {
        current = top.right;
      } else {
        out.push(top.value);
        last = stack.pop();
      }
    }
  }
  return out;
}

console.log(postorderIterative(build([3, 9, 20, null, null, 15, 7])).join(" "));
```
Output:
```text
9 15 7 20 3
```

## quiz
1. When is the node visited in a postorder traversal?
   - [ ] Before its subtrees
   - [x] After both of its subtrees
   - [ ] Between its subtrees
   - [ ] Only at leaves
   > Children are always processed first.
2. Which task needs postorder?
   - [ ] Printing sorted keys of a BST
   - [x] Computing the total size of a folder from its subfolders
   - [ ] Listing a tree level by level
   - [ ] Finding the minimum key
   > The parent needs the children's totals.
3. What does the postorder of an expression tree give?
   - [ ] The infix expression
   - [x] The postfix expression
   - [ ] The prefix expression
   - [ ] A sorted list
   > Operands come before the operator.
4. Which element is last in a postorder sequence?
   - [ ] The leftmost leaf
   - [x] The root
   - [ ] The maximum
   - [ ] The right child
   > The root is visited after everything below it.

# Level Order BFS Traversal
kind: algorithm
time: O(n) for n nodes, since each node enters and leaves the queue once.
space: O(w) for the queue, where w is the maximum width of the tree, up to about n / 2 for a perfect tree.
viz: level-order-bfs
practice: tree-level-order-traversal

## intro
A level order traversal visits the tree one level at a time, from the root down, and left to right within each level. It uses a queue instead of recursion, and it answers questions about levels: the nodes at each depth, the shortest path from the root to a node, the view of the tree from one side and the minimum depth.

## theory
Algorithm (breadth first search on a tree):

- Put the root in a queue
- While the queue is not empty: remove the front node, visit it, and add its left and right children (if present) to the back of the queue

The queue holds nodes in order of depth: all nodes of level k come before any node of level k + 1, because children are queued behind their parents' siblings.

Grouping by level: process the queue in rounds. At the start of a round record `size = len(queue)`; process exactly that many nodes, collecting their values into one list and queueing their children. The result for the tree with root 3, left child 9 and right child 20 (whose children are 15 and 7) is `[[3], [9, 20], [15, 7]]`.

Variants:

- Zigzag (spiral) order: reverse every second level. For the sample tree the result is `[[3], [20, 9], [15, 7]]`.
- Right side view: the last node of each level. For the tree with root 1, children 2 and 3, and the node 5 under 2 and the node 4 under 3, the right view is 1, 3, 4.
- Left side view: the first node of each level
- Average, maximum or sum per level
- Bottom up level order: reverse the list of levels
- Minimum depth: the first leaf found in the traversal is at minimum depth, so the search can stop early; for the sample tree the minimum depth is 2 nodes (3 and 9)
- Connect next pointers in each level of a perfect tree
- Maximum width, counting the null gaps between the leftmost and rightmost node of each level with position numbers
- Check completeness: once a missing child appears in a level order traversal, no later node may have children
- Serialization in level order, as used for the array notation `[3, 9, 20, null, null, 15, 7]`

Depth first alternative: pass the level number in a recursive function and append values to the list for that level; it gives the same grouping with recursion and O(h) stack space.

Complexity: every node is enqueued and dequeued once, so O(n). Memory is O(w); for a perfect tree the last level holds about half of the nodes. For a skewed tree the queue never holds more than one node, while a recursive depth first approach would need deep recursion, so breadth first search can be the cheaper choice for tall thin trees.

Use a real queue: in Python `collections.deque` (popleft is O(1)); `list.pop(0)` is O(n) and makes the traversal quadratic. In JavaScript use an index pointer into an array or a queue class; `shift` on very large arrays is linear in some engines.

Generalisation: on graphs the same algorithm needs a visited set, and it finds shortest paths in unweighted graphs; on trees no visited set is needed because there are no cycles.

Pitfalls: forgetting to capture the level size before the loop (the queue length changes while you add children), adding null children to the queue and then dereferencing them, and returning an empty list incorrectly for a null root (the answer is an empty list, not a list with an empty level).

## explain
1. If the root is empty, return an empty list.
2. Put the root into a queue.
3. While the queue has nodes, record the number of nodes in the current level.
4. Remove that many nodes, collect their values and queue their non-empty children.
5. Append the collected level to the result.
6. Apply the variant: reverse alternate levels, take the last node, or stop at the first leaf.

## example
The Python function returns `[[3], [9, 20], [15, 7]]` for the sample tree, the zigzag order `[[3], [20, 9], [15, 7]]` and the minimum depth 2. The JavaScript function returns the right side view 1, 3, 4 for the tree given by the level-order array 1, 2, 3, null, 5, null, 4.

## real
Network tools explore a topology by hops, file explorers list folders level by level, and game AI evaluates moves in rounds of equal depth.

## pros
- Visits nodes by depth, which suits level based questions
- Finds the shallowest leaf and the minimum depth early
- Needs no recursion, so deep trees are safe

## cons
- Queue memory can reach half of the nodes in a wide tree
- Needs a real queue for linear time
- Level size must be captured correctly

## uses
- Listing nodes level by level
- Side views and per level aggregates
- Minimum depth and shortest paths from the root
- Level order serialization

## mistakes
- Using list.pop(0) as the queue and getting quadratic time
- Reading the queue length inside the loop instead of before it
- Queuing null children
- Reversing the wrong levels in zigzag order

## interview
**Q:** How do you perform a level order traversal?
**A:** Use a queue: start with the root, repeatedly remove the front node, visit it and enqueue its children; to group by level, process exactly the number of nodes that were in the queue at the start of each round.

**Q:** How do you compute the right side view of a binary tree?
**A:** Do a level order traversal and take the last node of each level, or do a depth first search that visits the right child first and records the first node seen at each depth.

**Q:** What is the space complexity of level order traversal?
**A:** O(w) where w is the maximum width of the tree, which can be about n over 2 for a perfect tree.

## summary
Level order traversal uses a queue to visit nodes depth by depth in O(n) time, and processing the queue in rounds groups the nodes by level. It supports zigzag order, side views, per level aggregates and minimum depth.

## codenote
The Python sample groups nodes by level. The JavaScript sample computes the right side view.

## code
### python
```python
from collections import deque

class Node:
    def __init__(self, value, left=None, right=None):
        self.value, self.left, self.right = value, left, right

def levels(root):
    result, queue = [], deque([root] if root else [])
    while queue:
        level = []
        for _ in range(len(queue)):
            node = queue.popleft()
            level.append(node.value)
            queue.extend(child for child in (node.left, node.right) if child)
        result.append(level)
    return result

def min_depth(root):
    queue, depth = deque([root]), 1
    while queue:
        for _ in range(len(queue)):
            node = queue.popleft()
            if not node.left and not node.right:
                return depth
            queue.extend(child for child in (node.left, node.right) if child)
        depth += 1

tree = Node(3, Node(9), Node(20, Node(15), Node(7)))
result = levels(tree)
print(result)
print([level if i % 2 == 0 else level[::-1] for i, level in enumerate(result)])
print(min_depth(tree))
```
Output:
```text
[[3], [9, 20], [15, 7]]
[[3], [20, 9], [15, 7]]
2
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

function rightSideView(root) {
  const view = [];
  let level = root ? [root] : [];
  while (level.length) {
    view.push(level[level.length - 1].value);
    level = level.flatMap((node) => [node.left, node.right].filter(Boolean));
  }
  return view;
}

console.log(rightSideView(build([1, 2, 3, null, 5, null, 4])).join(" "));
```
Output:
```text
1 3 4
```

## quiz
1. Which data structure drives a level order traversal?
   - [ ] A stack
   - [x] A queue
   - [ ] A heap
   - [ ] A hash map
   > Nodes are processed in the order they are discovered.
2. How do you process one level at a time?
   - [ ] Sort the queue
   - [x] Record the queue size at the start and process that many nodes
   - [ ] Use recursion only
   - [ ] Clear the queue after each node
   > Children added during the round belong to the next level.
3. What is the right side view?
   - [ ] The first node of each level
   - [x] The last node of each level
   - [ ] The rightmost leaf only
   - [ ] The largest value of each level
   > It lists what is visible from the right.
4. What makes list.pop(0) a poor queue in Python?
   - [ ] It returns the wrong node
   - [x] Removing from the front shifts every element, costing O(n)
   - [ ] It breaks the tree
   - [ ] It needs recursion
   > A deque removes from the front in constant time.
