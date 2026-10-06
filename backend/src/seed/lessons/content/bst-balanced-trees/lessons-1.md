# Binary Search Tree Property
kind: algorithm
time: O(h) for search, insert and delete, where h is the tree height: O(log n) when the tree is balanced and O(n) when it degenerates into a chain; validating the whole property takes O(n).
space: O(n) for the nodes, and O(h) for the recursion stack of a recursive operation.
viz: bst-insert

## intro
A binary search tree (BST) is a binary tree in which every node's key is greater than all keys in its left subtree and smaller than all keys in its right subtree. That one ordering rule lets a search discard half of a balanced tree at each step, in the same way binary search discards half of a sorted array, while still allowing cheap insertions.

## theory
The BST property: for every node x, all keys in the left subtree of x are less than the key of x, and all keys in the right subtree are greater. The rule applies to the entire subtree, not just to the immediate children. This is the most common mistake: a tree where each node is larger than its left child and smaller than its right child, but a deeper node violates an ancestor's bound, is not a BST.

Counterexample: the tree with root 5, left child 1 and right child 4 where 4 has children 3 and 6 is not a valid BST, because 3 lies in the right subtree of 5 and is smaller than 5, even though 3 is correctly placed relative to its own parent 4. The tree with root 2, left child 1 and right child 3 is a valid BST.

Duplicates: define a policy and apply it consistently, such as rejecting duplicates (sets), counting them in the node, or always sending equal keys to the right subtree (so the left subtree is strictly smaller and the right subtree is at least as large).

Search: start at the root; if the key equals the node's key you are done; if it is smaller go left, otherwise go right; reaching an empty child means the key is absent. Each step moves down one level, so the cost is O(h).

Minimum and maximum: the minimum is the leftmost node (follow left children), the maximum is the rightmost node. Successor and predecessor queries follow from the same structure: the successor of a node is the minimum of its right subtree, or the lowest ancestor whose left subtree contains the node.

Inorder traversal visits the keys in sorted order, and this characterises the property: a binary tree is a BST exactly when its inorder traversal is strictly increasing.

Validation (checking the property):

- Bounds method: recurse with an allowed open interval `(low, high)`; the root may take any value; the left child must be below the node's key (updating high) and the right child above it (updating low). It is O(n) and needs O(h) stack space.
- Inorder method: traverse inorder and compare each key with the previous one; if a key is not greater than its predecessor, the tree is invalid

For the tree with root 2 and children 1 and 3 both methods say valid; for the counterexample above both say invalid. A comparison of each node only with its direct children would wrongly accept it.

Why the shape matters: the height depends on the order of insertion. Random insertion order gives an expected height about 1.39 log2 n. Sorted insertion gives a chain. This is why self balancing trees (AVL, red-black) exist and why standard libraries use them for ordered maps and sets.

Comparison with other structures:

- Sorted array: binary search in O(log n) but insertion in O(n)
- Hash table: O(1) expected lookups but no order
- BST: O(h) lookups, insertions and deletions plus ordered operations such as minimum, successor, range queries and rank

Implementation notes: store parent pointers when successor queries without a stack are needed; represent keys with a comparator function for custom ordering; avoid recursion on trees that may be skewed.

Testing: empty tree, single node, duplicate keys per your policy, deep violations (a node that violates an ancestor's bound) and large sorted inputs for depth.

## explain
1. State the rule: left subtree smaller, right subtree larger, for every node.
2. To search, compare with the current key and go left or right until found or empty.
3. To find the minimum or maximum, follow left or right children to the end.
4. To validate, pass lower and upper bounds down the recursion, or check that inorder is strictly increasing.
5. Decide how duplicates are handled.
6. Relate the cost of every operation to the height.

## example
The Python program validates the tree 2, 1, 3 (valid) and the tree 5, 1, 4, null, null, 3, 6 (invalid because 3 violates the bound of the root), both by bounds and by the inorder check. The JavaScript program searches a BST for several keys and prints the path of comparisons for each: found, and not found with the last node visited.

## real
Ordered maps and sets in standard libraries, database indexes and symbol tables are built on balanced search trees that keep this property.

## pros
- Search, insert and delete in O(h)
- Ordered operations such as minimum, successor and range queries
- Inorder traversal yields sorted keys

## cons
- Degenerates to O(n) without balancing
- Needs a total order on keys
- Validation requires bounds, not just local checks

## uses
- Ordered maps and sets
- Dynamic sorted collections with frequent updates
- Finding successors, predecessors and ranges
- Teaching recursive tree algorithms

## mistakes
- Checking each node only against its direct children
- Allowing duplicates inconsistently
- Assuming the height is always logarithmic
- Using strict and non-strict comparisons interchangeably in the validator

## interview
**Q:** What is the binary search tree property?
**A:** For every node, all keys in its left subtree are smaller and all keys in its right subtree are larger, so an inorder traversal yields the keys in increasing order.

**Q:** How do you validate a binary search tree?
**A:** Recurse with an allowed range for each node, tightening the upper bound when going left and the lower bound when going right, or check that the inorder traversal is strictly increasing; checking only direct children is wrong.

**Q:** Why can the cost of BST operations be linear?
**A:** The cost is proportional to the height, and inserting keys in sorted order creates a chain with height n.

## summary
A binary search tree keeps smaller keys on the left and larger keys on the right of every node, which gives O(h) search and sorted inorder traversal. Validate with bounds or the inorder sequence, and remember that balance determines whether h is log n or n.

## codenote
The Python sample validates trees in two ways. The JavaScript sample records the comparison path of a search.

## code
### python
```python
class Node:
    def __init__(self, key, left=None, right=None):
        self.key, self.left, self.right = key, left, right

def valid_bounds(node, low=float("-inf"), high=float("inf")):
    if node is None:
        return True
    if not low < node.key < high:
        return False
    return valid_bounds(node.left, low, node.key) and valid_bounds(node.right, node.key, high)

def inorder(node):
    return inorder(node.left) + [node.key] + inorder(node.right) if node else []

def valid_inorder(node):
    keys = inorder(node)
    return all(a < b for a, b in zip(keys, keys[1:]))

good = Node(2, Node(1), Node(3))
bad = Node(5, Node(1), Node(4, Node(3), Node(6)))
print(valid_bounds(good), valid_inorder(good))
print(valid_bounds(bad), valid_inorder(bad), inorder(bad))
```
Output:
```text
True True
False False [1, 5, 3, 4, 6]
```
### javascript
```javascript
function searchPath(root, key) {
  const path = [];
  let node = root;
  while (node) {
    path.push(node.key);
    if (key === node.key) return path.join(">") + " found";
    node = key < node.key ? node.left : node.right;
  }
  return path.join(">") + " missing";
}

const tree = {
  key: 8,
  left: { key: 3, left: { key: 1 }, right: { key: 6, left: { key: 4 }, right: { key: 7 } } },
  right: { key: 10, right: { key: 14, left: { key: 13 } } },
};
console.log(searchPath(tree, 6));
console.log(searchPath(tree, 5));
```
Output:
```text
8>3>6 found
8>3>6>4 missing
```

## quiz
1. What does the BST property require of a node's left subtree?
   - [ ] Only the left child is smaller
   - [x] Every key in the left subtree is smaller than the node's key
   - [ ] All keys are equal
   - [ ] The subtree is a leaf
   > The rule covers the entire subtree.
2. What does an inorder traversal of a BST produce?
   - [ ] Keys in descending order
   - [x] Keys in ascending order
   - [ ] Keys by level
   - [ ] Random order
   > Smaller keys are visited before larger ones.
3. Why does checking only the direct children fail to validate a BST?
   - [ ] It is too slow
   - [x] A deeper node can violate the bound of a higher ancestor
   - [ ] It needs recursion
   - [ ] Children can be null
   > The tree with 5, 1, 4 and children 3 and 6 shows this.
4. How is the minimum key found?
   - [ ] By following right children
   - [x] By following left children to the end
   - [ ] By scanning all leaves
   - [ ] By checking the root only
   > The leftmost node holds the smallest key.

# BST Insert and Delete
kind: algorithm
time: O(h) for insert and delete, where h is the height: O(log n) for a balanced tree and O(n) for a chain.
space: O(h) for the recursion stack in the recursive versions, or O(1) for iterative insertion.

## intro
Insertion in a binary search tree walks down to the position where the key belongs and attaches a new leaf. Deletion is trickier, since removing a node must keep the ordering intact, and it has three cases depending on how many children the node has. Both operations cost time proportional to the height of the tree.

## theory
Insert:

- If the tree is empty, the new node becomes the root
- Otherwise compare the key with the current node: go left if smaller, right if larger (duplicates according to your policy) until an empty child is found, and put the new node there
- The new node is always a leaf, and no existing node moves

The recursive form returns the (possibly new) subtree root: `insert(node, key)` returns a new node when `node` is empty, otherwise updates a child with the result of the recursive call and returns `node`. The iterative form tracks the parent while descending, which uses O(1) extra space.

Inserting 50, 30, 70, 20, 40, 60, 80 in this order builds a perfect tree of height 2 whose inorder traversal is 20, 30, 40, 50, 60, 70, 80.

Delete a key, three cases:

- The node is a leaf: remove it by clearing its parent's link
- The node has one child: replace the node by its child (splice it out)
- The node has two children: find its inorder successor (the smallest key in its right subtree), copy the successor's key into the node and delete the successor from the right subtree; the successor has at most one child (a right child), so that deletion is an easy case. The inorder predecessor works symmetrically.

Example: in the tree above deleting 20 (leaf) leaves 30 without a left child; deleting 30 afterwards (now one child, 40) replaces it by 40; deleting the root 50 (two children) copies the successor 60 into the root and removes the old 60 leaf. The inorder traversal after these three deletions is 40, 60, 70, 80.

Both operations first search for the key, which costs O(h), and the structural work afterwards is constant except for finding the successor, which is also bounded by the height.

Design decisions:

- Alternate between successor and predecessor replacement when deleting, to avoid a long term bias that makes the tree lopsided
- Return the new root of the subtree from the recursive delete so that parent links are updated correctly, including when the root itself is deleted
- Deleting a key that is not present should leave the tree unchanged
- Store sizes or heights in nodes only if you also update them along the path after changes
- Use parent pointers to unlink nodes without recursion, at the cost of keeping them consistent

Self balancing trees extend these same operations with rotations after the insertion or deletion to restore balance: AVL trees check balance factors up the path, red-black trees fix colour violations.

Pitfalls: forgetting to handle the root as a special case in iterative code, not updating the parent's link after deleting a leaf or a one child node, deleting the successor from the wrong subtree and creating a cycle or losing nodes, and comparing keys with inconsistent ordering.

Testing: insert sequences in increasing, decreasing and random orders and check the inorder output is sorted; delete leaf, one child, two child and root nodes; delete absent keys; insert duplicates per the policy; compare against a sorted list or the language's ordered map.

## explain
1. To insert, walk down comparing keys until an empty child is found, and attach a leaf there.
2. To delete, first search for the node.
3. For a leaf, remove it; for a node with one child, replace it with that child.
4. For two children, copy the inorder successor's key into the node and delete the successor from the right subtree.
5. Return the new subtree root from each recursive call so parent links stay correct.
6. Verify with an inorder traversal after each change.

## example
The Python class inserts 50, 30, 70, 20, 40, 60, 80, prints the inorder keys, then deletes a leaf (20), a one child node (30) and the two child root (50), printing the keys after each step: finally 40, 60, 70, 80. The JavaScript program inserts keys iteratively and deletes a node with two children, printing the inorder keys and the new root key 60.

## real
Ordered maps in standard libraries are built on balanced versions of these operations, and in-memory indexes use them to keep keys sorted under updates.

## pros
- Simple insertion that never moves existing nodes
- Deletion handled by three clear cases
- Keeps keys sorted at all times

## cons
- Operations degrade to O(n) when the tree becomes unbalanced
- Deletion with two children is easy to get wrong
- Recursion depth equals the height

## uses
- Maintaining a dynamic sorted collection
- Implementing ordered sets and maps
- Priority-like lookups by key
- Teaching pointer manipulation and recursion

## mistakes
- Not returning the updated subtree root from the recursive call
- Forgetting to remove the successor after copying its key
- Handling only leaf deletion and ignoring the other cases
- Always using the successor, which gradually unbalances the tree

## interview
**Q:** What are the cases when deleting a node from a binary search tree?
**A:** A leaf is simply removed, a node with one child is replaced by that child, and a node with two children takes the key of its inorder successor (or predecessor), after which that successor node is deleted.

**Q:** Why is the inorder successor a safe replacement for a deleted node?
**A:** It is the smallest key larger than the deleted key, so it is greater than everything in the left subtree and not greater than anything in the right subtree, which keeps the ordering valid.

**Q:** What is the time complexity of insert and delete in a BST?
**A:** O(h), where h is the height of the tree, which is O(log n) for balanced trees and O(n) in the worst case.

## summary
BST insertion attaches a leaf after an O(h) descent, and deletion handles leaves, single children and two-child nodes through the inorder successor. Return updated subtree roots and check the inorder sequence after every change.

## codenote
The Python sample inserts and deletes recursively. The JavaScript sample inserts iteratively and deletes a two-child node.

## code
### python
```python
class Node:
    def __init__(self, key):
        self.key, self.left, self.right = key, None, None

def insert(node, key):
    if node is None:
        return Node(key)
    if key < node.key:
        node.left = insert(node.left, key)
    else:
        node.right = insert(node.right, key)
    return node

def delete(node, key):
    if node is None:
        return None
    if key < node.key:
        node.left = delete(node.left, key)
    elif key > node.key:
        node.right = delete(node.right, key)
    else:
        if node.left is None:
            return node.right
        if node.right is None:
            return node.left
        successor = node.right
        while successor.left:
            successor = successor.left
        node.key = successor.key
        node.right = delete(node.right, successor.key)
    return node

def inorder(node):
    return inorder(node.left) + [node.key] + inorder(node.right) if node else []

root = None
for key in (50, 30, 70, 20, 40, 60, 80):
    root = insert(root, key)
print(inorder(root))
for key in (20, 30, 50):
    root = delete(root, key)
    print(key, inorder(root))
```
Output:
```text
[20, 30, 40, 50, 60, 70, 80]
20 [30, 40, 50, 60, 70, 80]
30 [40, 50, 60, 70, 80]
50 [40, 60, 70, 80]
```
### javascript
```javascript
function insert(root, key) {
  const node = { key, left: null, right: null };
  if (!root) return node;
  let current = root;
  for (;;) {
    const side = key < current.key ? "left" : "right";
    if (!current[side]) {
      current[side] = node;
      return root;
    }
    current = current[side];
  }
}

function remove(node, key) {
  if (!node) return null;
  if (key < node.key) node.left = remove(node.left, key);
  else if (key > node.key) node.right = remove(node.right, key);
  else {
    if (!node.left) return node.right;
    if (!node.right) return node.left;
    let successor = node.right;
    while (successor.left) successor = successor.left;
    node.key = successor.key;
    node.right = remove(node.right, successor.key);
  }
  return node;
}

const inorder = (n) => (n ? [...inorder(n.left), n.key, ...inorder(n.right)] : []);
let root = null;
for (const key of [50, 30, 70, 20, 40, 60, 80]) root = insert(root, key);
root = remove(root, 50);
console.log(inorder(root).join(" "), root.key);
```
Output:
```text
20 30 40 60 70 80 60
```

## quiz
1. Where is a new key attached in a BST insertion?
   - [ ] At the root
   - [x] As a new leaf at the end of the search path
   - [ ] In the middle of the tree
   - [ ] At a random node
   > No existing node moves.
2. What replaces a deleted node that has two children?
   - [ ] Its left child
   - [x] The key of its inorder successor
   - [ ] The tree's root
   - [ ] A new leaf
   > The successor keeps the ordering valid.
3. How is a node with exactly one child deleted?
   - [ ] It is turned into a leaf
   - [x] It is replaced by its child
   - [ ] Both subtrees are deleted
   - [ ] The tree is rebuilt
   > The child takes the node's place under its parent.
4. Why must the recursive delete return a node?
   - [ ] To count the nodes
   - [x] So the parent can update its link when the subtree root changes
   - [ ] To print the keys
   - [ ] To balance the tree
   > The root of the subtree may be replaced.

# BST Search Complexity
kind: algorithm
time: O(h) for search in a tree of height h, giving O(log n) for balanced trees, about 1.39 log2 n expected for randomly built trees and O(n) for a chain.
space: O(1) for iterative search and O(h) for recursive search.
viz: bst-insert

## intro
How fast is a search in a binary search tree? The honest answer is "it depends on the height", and the height depends on the order in which the keys were inserted. This lesson measures the cost directly: the best case, the worst case, the average for random insertions and what it means in practice.

## theory
Cost model: each comparison moves the search one level down, so the number of comparisons for a key is its depth plus one, at most the height plus one. A successful search for a key at depth d costs d + 1 comparisons; an unsuccessful search ends at an empty child and costs up to h + 1 comparisons.

Cases:

- Best case: the key is the root, one comparison
- Worst case: the tree is a chain (inserting sorted keys 1, 2, 3, ... ), and searching for the last key takes n comparisons, O(n)
- Balanced case: the height is ⌊log2 n⌋ and the search takes at most ⌊log2 n⌋ + 1 comparisons. A million keys need about 20 comparisons.
- Random case: for n distinct keys inserted in random order, the expected depth of a node is about 2 ln n, roughly 1.39 log2 n, and the expected height is a small constant factor above that (about 4.3 ln n at most asymptotically, in practice around 2 to 3 times log2 n). The average search is only about 39 percent more comparisons than in a perfectly balanced tree.

Measuring it: build trees from a shuffled list of 1000 keys with a fixed random seed and measure the height, then compare with the chain built from sorted keys of the same size. The sorted insertion gives height 1000 (node counting), the shuffled one gives a height around 20, and the perfectly balanced tree gives 10.

Average successful search cost in the perfect tree with 7 nodes: one node at depth 0, two at depth 1 and four at depth 2, so the average number of comparisons is (1·1 + 2·2 + 4·3) / 7 = 17 / 7 ≈ 2.43; in the chain of 7 nodes the average is (1 + 2 + ... + 7) / 7 = 4.

Space: iterative search needs O(1) memory, since it keeps one pointer; recursive search uses a stack frame per level.

Comparison with alternatives:

- Sorted array with binary search: O(log n) search, no pointers, but O(n) insertion
- Hash table: O(1) expected search, no ordered queries
- Balanced BST (AVL, red-black): worst case O(log n) for search, insert and delete
- Skip list: O(log n) expected with a simpler implementation

Practical effects:

- Cache behaviour: tree nodes are scattered in memory, so each step can be a cache miss; B-trees and cache-aware layouts pack many keys per node to reduce misses
- Key comparison cost: for strings the comparison itself may cost O(length), so the total is O(h · length); tries avoid that for prefix queries
- Input patterns: real data often arrives sorted or nearly sorted (timestamps, ids), so a plain BST is risky; use a self-balancing tree or shuffle
- Adversarial input: a plain BST is vulnerable to input that forces the chain shape, while balanced trees are not

Ways to keep the height small: randomise the insertion order (when you control it), use a treap or randomised structure, or use AVL and red-black trees that rebalance with rotations, bounding the height by about 1.44 log2 n and 2 log2 n respectively.

Testing the claim: write the search to count comparisons, run it on sorted-insertion and balanced trees for the same keys and confirm the counts match the formulas above.

## explain
1. Count each comparison during a search to measure the cost.
2. Compare the best case (root), the worst case (chain) and the balanced case.
3. Build one tree from sorted keys and one from shuffled keys and compare heights.
4. Use the average depth formula for perfect trees and chains as a check.
5. Consider cache effects and key comparison costs in practice.
6. Choose a balancing strategy if input order is not under your control.

## example
The Python program inserts 1000 keys in sorted order and in a seeded random order and prints the chain height 1000, whether the shuffled tree's height lies between 15 and 30 (it does), and the height of a balanced build, 10. The JavaScript program counts the comparisons needed to find the key 7 in a chain and in a balanced tree of the keys 1 to 7: 7 against 3.

## real
Database engines choose B-trees rather than plain binary trees to keep lookups at a handful of page reads, and language libraries use red-black trees so a sorted input cannot slow down ordered maps.

## pros
- Search cost is easy to measure and reason about
- Expected cost for random inputs is close to optimal
- Balanced variants give guaranteed bounds

## cons
- Worst case is linear for sorted input
- Real performance depends on cache behaviour
- Average analysis assumes random insertion order

## uses
- Estimating lookup costs for ordered indexes
- Deciding whether a plain BST is safe for an input pattern
- Comparing search structures
- Explaining why balancing matters

## mistakes
- Quoting O(log n) without saying the tree must be balanced
- Testing only random data and missing the sorted input case
- Ignoring that string keys make each comparison more expensive
- Assuming recursion is free of stack cost

## interview
**Q:** What is the time complexity of searching a binary search tree?
**A:** O(h), where h is the height: O(log n) if the tree is balanced, about 1.39 log2 n on average for random insertion order and O(n) for a degenerate chain.

**Q:** What input produces the worst case for a plain BST?
**A:** Keys inserted in sorted or reverse sorted order, because every new key becomes the child of the previous one and the tree becomes a chain.

**Q:** How do you guarantee logarithmic search time?
**A:** Use a self-balancing tree such as an AVL or red-black tree, which bounds the height by rotating after insertions and deletions.

## summary
BST search costs the depth of the key, so it ranges from one comparison to n comparisons and averages about 1.39 log2 n for random insertion order. Sorted input creates chains, which is why balanced trees give the guaranteed O(log n).

## codenote
The Python sample measures heights for sorted and random inputs. The JavaScript sample counts comparisons.

## code
### python
```python
import random
import sys

sys.setrecursionlimit(5000)

class Node:
    def __init__(self, key):
        self.key, self.left, self.right = key, None, None

def insert(root, key):
    if root is None:
        return Node(key)
    current = root
    while True:
        side = "left" if key < current.key else "right"
        child = getattr(current, side)
        if child is None:
            setattr(current, side, Node(key))
            return root
        current = child

def height(node):
    return 0 if node is None else 1 + max(height(node.left), height(node.right))

def balanced(keys):
    if not keys:
        return None
    mid = len(keys) // 2
    node = Node(keys[mid])
    node.left, node.right = balanced(keys[:mid]), balanced(keys[mid + 1:])
    return node

keys = list(range(1, 1001))
chain = None
for key in keys:
    chain = insert(chain, key)
shuffled = keys[:]
random.Random(5).shuffle(shuffled)
rand_tree = None
for key in shuffled:
    rand_tree = insert(rand_tree, key)
print(height(chain), 15 <= height(rand_tree) <= 30, height(balanced(keys)))
```
Output:
```text
1000 True 10
```
### javascript
```javascript
function comparisons(root, key) {
  let count = 0;
  for (let node = root; node; ) {
    count++;
    if (key === node.key) break;
    node = key < node.key ? node.left : node.right;
  }
  return count;
}

let chain = null;
for (let key = 7; key >= 1; key--) chain = { key, left: null, right: chain };
const balanced = {
  key: 4,
  left: { key: 2, left: { key: 1 }, right: { key: 3 } },
  right: { key: 6, left: { key: 5 }, right: { key: 7 } },
};
console.log(comparisons(chain, 7), comparisons(balanced, 7), comparisons(balanced, 4));
```
Output:
```text
7 3 1
```

## quiz
1. What does the cost of a BST search depend on?
   - [ ] Only the number of keys
   - [x] The depth of the key, bounded by the height
   - [ ] The size of the values
   - [ ] The hash of the key
   > Each comparison moves one level down.
2. Which insertion order gives the worst case?
   - [ ] Random order
   - [x] Sorted order
   - [ ] Alternating small and large keys
   - [ ] Median first
   > Sorted keys build a chain.
3. About how many comparisons does a balanced tree with a million keys need?
   - [ ] 1000
   - [x] About 20
   - [ ] About 500000
   - [ ] 1
   > The height is about log2 of a million.
4. What is the average successful search cost in a perfect tree of 7 nodes?
   - [ ] 4
   - [x] About 2.43 comparisons
   - [ ] 7
   - [ ] 1
   > The sum of depth plus one over all nodes, divided by 7.

# AVL Tree Rotations
kind: algorithm
time: O(log n) for search, insert and delete, because the height stays within about 1.44 log2 n and each insertion needs at most one single or double rotation (deletion may need O(log n) rotations along the path).
space: O(n) for the nodes with a stored height per node, and O(log n) for the recursion stack.
viz: avl-insert

## intro
An AVL tree is a binary search tree that keeps itself balanced: after every insertion or deletion, the heights of the two subtrees of every node differ by at most one. When an update breaks this rule, local rotations restore it, so the tree height stays logarithmic no matter what order the keys arrive in.

## theory
Balance factor: for a node, `balance = height(left) − height(right)`. In an AVL tree it must be −1, 0 or 1 at every node. An insertion changes heights only along the path from the new leaf to the root, so only those nodes can become unbalanced (balance factor 2 or −2).

Rotations are local restructurings that preserve the BST ordering while changing the heights:

- Right rotation at node y with left child x: x becomes the subtree root, y becomes x's right child, and x's old right subtree becomes y's left subtree
- Left rotation at node x with right child y: the mirror image
- Each rotation changes only a constant number of pointers, so it takes O(1)

The four imbalance cases, named by where the extra height is relative to the unbalanced node z:

- Left-left (balance factor 2, the left child's balance factor is 0 or 1): fix with a single right rotation at z. Inserting 30, 20, 10 gives a left chain; a right rotation at 30 makes 20 the root with children 10 and 30.
- Right-right (balance −2, right child's balance −1 or 0): single left rotation at z. Inserting 10, 20, 30 gives root 20.
- Left-right (balance 2, left child's balance −1): rotate the left child left, then rotate z right (double rotation). Inserting 30, 10, 20 gives root 20 with children 10 and 30.
- Right-left (balance −2, right child's balance 1): rotate the right child right, then rotate z left.

Insertion algorithm: insert as in a plain BST, then walk back up the path updating heights; at the first node whose balance factor becomes ±2, apply the matching rotation; after that rotation the subtree height equals its height before the insertion, so no further node above needs repairing. An AVL insertion therefore performs at most one rotation (single or double).

Deletion: delete as in a BST, then update heights and rebalance on the way up; unlike insertion, a rotation can shorten the subtree, so rebalancing may continue up to the root, up to O(log n) rotations.

Height bound: the sparsest AVL tree of height h has a minimum number of nodes N(h) = N(h − 1) + N(h − 2) + 1, a Fibonacci-like recurrence, so the height is at most about 1.44 log2(n + 2). Inserting the keys 1 to 7 in sorted order into an AVL tree gives a perfect tree of height 3 with 4 at the root, and inserting 1 to 1023 gives height 10, where a plain BST would have height 1023. Sorted insertion of 7 keys uses 4 rotations.

Costs and trade-offs: AVL trees are more strictly balanced than red-black trees, so lookups are slightly faster, but updates need more rotations and the stored height (or balance factor) adds a few bits per node. They suit read-heavy workloads.

Implementation tips: store the height in each node and recompute it after each rotation (`1 + max(child heights)`), write the rotations as functions that return the new subtree root, and test with random inserts and deletes while checking the BST property, the balance factors and the stored heights.

## explain
1. Insert the key as in a plain BST.
2. Walk back up, updating each node's height.
3. Compute the balance factor of each node on the path.
4. At the first node with factor 2 or −2, identify the case: left-left, left-right, right-right or right-left.
5. Apply a single rotation or a double rotation to restore balance.
6. Check the BST property, the balance factors and the heights in tests.

## example
The Python class inserts the keys 10, 20, 30 and gets root 20, inserts 30, 10, 20 (double rotation) with root 20 as well, and inserts the sorted keys 1 to 7, counting 4 rotations and ending with root 4 and height 3. The JavaScript program shows the balance factors before and after a left rotation on the chain 10, 20, 30.

## real
Memory resident ordered indexes and some language libraries use AVL trees for read heavy workloads, and file systems used them for extent maps and directories before B-trees took over.

## pros
- Guaranteed O(log n) operations
- Tighter balance than red-black trees gives faster lookups
- Insertion needs at most one rotation

## cons
- More rotations on updates than red-black trees
- Extra height or balance data in every node
- More complex to implement than a plain BST

## uses
- Read heavy ordered maps and sets
- Dynamic sorted collections with strict height bounds
- Teaching rotations and invariants
- Order statistics with extra node data

## mistakes
- Forgetting to update the heights after a rotation
- Mixing up the left-right and right-left cases
- Rebalancing only the root instead of the first unbalanced node on the path
- Expecting deletion to need at most one rotation

## interview
**Q:** What is the AVL balance condition?
**A:** For every node, the heights of the left and right subtrees differ by at most one; the balance factor is therefore always −1, 0 or 1.

**Q:** When is a double rotation needed?
**A:** When the unbalanced node's heavy child leans the opposite way (left-right or right-left); first rotate the child to make the shape a straight line, then rotate the unbalanced node.

**Q:** How many rotations can an AVL insertion and an AVL deletion need?
**A:** An insertion needs at most one single or double rotation, while a deletion may need up to O(log n) rotations along the path to the root.

## summary
AVL trees keep subtree heights within one of each other using single and double rotations after updates, so the height stays below about 1.44 log2 n. Insertion needs at most one rotation, deletion possibly more, and each node stores its height.

## codenote
The Python sample implements AVL insertion and counts rotations. The JavaScript sample shows a left rotation changing balance factors.

## code
### python
```python
class Node:
    def __init__(self, key):
        self.key, self.left, self.right, self.height = key, None, None, 1

class AVL:
    def __init__(self):
        self.root, self.rotations = None, 0

    def h(self, node):
        return node.height if node else 0

    def update(self, node):
        node.height = 1 + max(self.h(node.left), self.h(node.right))

    def rotate_right(self, y):
        x = y.left
        y.left, x.right = x.right, y
        self.update(y)
        self.update(x)
        self.rotations += 1
        return x

    def rotate_left(self, x):
        y = x.right
        x.right, y.left = y.left, x
        self.update(x)
        self.update(y)
        self.rotations += 1
        return y

    def insert_node(self, node, key):
        if node is None:
            return Node(key)
        if key < node.key:
            node.left = self.insert_node(node.left, key)
        else:
            node.right = self.insert_node(node.right, key)
        self.update(node)
        balance = self.h(node.left) - self.h(node.right)
        if balance > 1:
            if key > node.left.key:
                node.left = self.rotate_left(node.left)
            return self.rotate_right(node)
        if balance < -1:
            if key < node.right.key:
                node.right = self.rotate_right(node.right)
            return self.rotate_left(node)
        return node

    def insert(self, key):
        self.root = self.insert_node(self.root, key)

def build(keys):
    tree = AVL()
    for key in keys:
        tree.insert(key)
    return tree

for keys in ([10, 20, 30], [30, 10, 20], [1, 2, 3, 4, 5, 6, 7]):
    tree = build(keys)
    print(keys, tree.root.key, tree.root.height, tree.rotations)
print(build(range(1, 1024)).root.height)
```
Output:
```text
[10, 20, 30] 20 2 1
[30, 10, 20] 20 2 2
[1, 2, 3, 4, 5, 6, 7] 4 3 4
10
```
### javascript
```javascript
const height = (n) => (n ? 1 + Math.max(height(n.left), height(n.right)) : 0);
const balance = (n) => height(n.left) - height(n.right);

function rotateLeft(x) {
  const y = x.right;
  x.right = y.left;
  y.left = x;
  return y;
}

const chain = { key: 10, left: null, right: { key: 20, left: null, right: { key: 30, left: null, right: null } } };
const before = balance(chain);
const root = rotateLeft(chain);
console.log(before, root.key, balance(root), root.left.key, root.right.key);
```
Output:
```text
-2 20 0 10 30
```

## quiz
1. What balance factors are allowed in an AVL tree?
   - [ ] Any integer
   - [x] −1, 0 and 1
   - [ ] Only 0
   - [ ] Only positive numbers
   > Subtree heights may differ by at most one.
2. Which rotation fixes a left-left imbalance?
   - [ ] A left rotation
   - [x] A single right rotation
   - [ ] A double rotation
   - [ ] No rotation is needed
   > The heavy left chain is rotated up.
3. How many rotations can an AVL insertion need at most?
   - [ ] O(log n)
   - [x] One single or double rotation
   - [ ] n
   - [ ] None ever
   > The rotation restores the subtree's previous height.
4. What height bound does an AVL tree satisfy?
   - [ ] n
   - [x] About 1.44 log2 n
   - [ ] 3 log2 n
   - [ ] sqrt n
   > The sparsest AVL trees grow like Fibonacci numbers.

# Red Black Tree Rules
kind: concept
time: Not an algorithmic topic — these are structural rules. They guarantee that search, insert and delete run in O(log n), with at most 2 rotations per insertion and 3 per deletion.
space: Not an algorithmic topic — each node stores one extra bit for its colour, which is why red-black trees are memory friendly compared with trees that store heights.

## intro
A red-black tree is a binary search tree whose nodes are coloured red or black according to a few rules. The rules do not keep the tree perfectly balanced, but they guarantee that the longest root to leaf path is at most twice the shortest, so the height stays within 2 log2(n + 1). Understanding the rules is the key to understanding why the structure works.

## theory
The five red-black properties:

- Every node is either red or black
- The root is black
- Every leaf (the empty null children, treated as sentinel nodes) is black
- A red node cannot have a red child (no two consecutive red nodes on any path)
- Every path from a node down to its null leaves contains the same number of black nodes (the black height)

Why they bound the height: all root to leaf paths have the same number of black nodes, say b. Red nodes cannot be adjacent, so a path has at most b red nodes interleaved, and the longest path has at most 2b nodes while the shortest has b. A tree with black height b has at least 2^b − 1 internal nodes, so b is at most log2(n + 1) and the height is at most 2 log2(n + 1). For a million nodes the height is at most about 40, compared with about 29 for the AVL bound.

Insertion in outline: insert like a BST and colour the new node red (this keeps the black height unchanged). Only property four can break, when the new node's parent is also red. Look at the uncle (the parent's sibling):

- Uncle red: recolour parent and uncle black and the grandparent red, then continue the check at the grandparent (this can propagate to the root; a red root is recoloured black)
- Uncle black and the new node is an inner grandchild (a left-right or right-left shape): rotate at the parent to make it an outer grandchild
- Uncle black and the new node is an outer grandchild: rotate at the grandparent and swap the colours of the parent and grandparent

At most two rotations occur per insertion, and recolouring can walk up the path in O(log n).

Deletion is more intricate: removing a black node reduces the black height on its paths, creating a double black situation resolved by cases involving the sibling's colour and the colours of the sibling's children, with at most three rotations.

Validating a tree against the rules is a good exercise: compute the black height of each subtree bottom up, fail if the left and right black heights differ, and fail if a red node has a red child or the root is red. A tree with a black root 2, red children 1 and 3 is valid, while a tree with a red root, or with a red node having a red child, is invalid; a tree where one path to a null child has two black nodes and another has one is invalid by the black height rule.

Comparison with AVL trees:

- AVL: stricter balance (height up to 1.44 log2 n), faster lookups, more rotations on updates
- Red-black: looser balance (up to 2 log2 n), fewer rotations (at most 2 on insertion and 3 on deletion), one bit per node, better for update heavy workloads

Where they are used: Java's TreeMap and TreeSet, C++ std::map and std::set in common implementations, the Linux kernel's completely fair scheduler and many ordered containers.

Relation to 2-3-4 trees: a red-black tree is an encoding of a 2-3-4 tree (a B-tree of order 4) as a binary tree, where a red node is merged with its black parent to form a larger node. This explains the rules: recolouring corresponds to splitting nodes and rotations to rearranging them.

Left-leaning red-black trees simplify the code by allowing red links only on the left, at the cost of more rotations in some cases.

## explain
1. Learn the five properties: colours, black root, black leaves, no red-red, equal black heights.
2. Insert the new node as red using the BST rule.
3. If the parent is red, look at the uncle: recolour if red, rotate if black.
4. Recolour the root black at the end.
5. Verify trees by computing black heights and checking for adjacent red nodes.
6. Remember the height bound of 2 log2(n + 1).

## example
The Python validator checks four trees against the red-black rules: a valid tree with a black root and two red children, a tree with two adjacent red nodes, a tree whose paths have different black heights and a tree with a red root, and it prints True only for the first. The JavaScript program computes the maximum and minimum path lengths of a valid tree and shows they differ by less than a factor of two.

## real
Ordered maps and sets in major language libraries, schedulers and database in-memory indexes rely on red-black trees to bound the cost of updates.

## pros
- Height at most twice the minimum
- At most two rotations per insertion and three per deletion
- Only one extra bit per node

## cons
- Deletion has many cases and is hard to implement
- Slightly taller trees than AVL, so lookups are a bit slower
- The rules are not obvious without the 2-3-4 tree view

## uses
- Ordered maps and sets in standard libraries
- Scheduling queues keyed by priority or time
- Write heavy ordered indexes in memory
- Explaining balanced tree invariants

## mistakes
- Forgetting that new nodes start red
- Allowing the root to stay red after recolouring
- Treating the null children as having no colour in the black height count
- Confusing the height bound of red-black trees with that of AVL trees

## interview
**Q:** What are the red-black tree properties?
**A:** Nodes are red or black, the root and the null leaves are black, a red node has only black children, and every path from a node to its null leaves has the same number of black nodes.

**Q:** Why does a red-black tree have logarithmic height?
**A:** All paths have equal black height b and red nodes cannot be adjacent, so the longest path is at most twice the shortest, and with at least 2^b minus 1 nodes the height is at most 2 log2(n + 1).

**Q:** When would you choose a red-black tree over an AVL tree?
**A:** For workloads with many insertions and deletions, because red-black trees do fewer rotations per update, while AVL trees suit lookup heavy workloads thanks to their stricter balance.

## summary
Red-black trees colour nodes so that no red node has a red child and all paths have the same black height, which bounds the height by 2 log2(n + 1) with at most two rotations per insertion. They trade slightly taller trees for cheaper updates than AVL trees.

## codenote
The Python sample validates the red-black rules. The JavaScript sample compares longest and shortest paths.

## code
### python
```python
class Node:
    def __init__(self, key, color, left=None, right=None):
        self.key, self.color, self.left, self.right = key, color, left, right

def black_height(node):
    if node is None:
        return 1
    left, right = black_height(node.left), black_height(node.right)
    if left == 0 or right == 0 or left != right:
        return 0
    if node.color == "red" and any(c and c.color == "red" for c in (node.left, node.right)):
        return 0
    return left + (node.color == "black")

def valid(root):
    return root.color == "black" and black_height(root) > 0

good = Node(2, "black", Node(1, "red"), Node(3, "red"))
red_red = Node(5, "black", Node(3, "red", Node(2, "red")), Node(8, "black"))
uneven = Node(5, "black", Node(3, "black", Node(2, "black")), Node(8, "black"))
red_root = Node(4, "red", Node(2, "black"), Node(6, "black"))
print(valid(good), valid(red_red), valid(uneven), valid(red_root))
```
Output:
```text
True False False False
```
### javascript
```javascript
function pathLengths(node) {
  if (!node) return [0, 0];
  const [shortLeft, longLeft] = pathLengths(node.left);
  const [shortRight, longRight] = pathLengths(node.right);
  return [1 + Math.min(shortLeft, shortRight), 1 + Math.max(longLeft, longRight)];
}

const tree = {
  key: 6, color: "black",
  left: { key: 3, color: "red", left: { key: 2, color: "black" }, right: { key: 5, color: "black" } },
  right: { key: 8, color: "black" },
};
const [shortest, longest] = pathLengths(tree);
console.log(shortest, longest, longest <= 2 * shortest);
```
Output:
```text
2 3 true
```

## quiz
1. What colour is a newly inserted node?
   - [ ] Black
   - [x] Red
   - [ ] Either
   - [ ] None
   > A red node leaves the black heights unchanged.
2. What is forbidden regarding red nodes?
   - [ ] Having two black children
   - [x] Having a red child
   - [ ] Being the left child
   - [ ] Being a leaf
   > Consecutive red nodes are not allowed on any path.
3. What does the black height rule demand?
   - [ ] All nodes are black
   - [x] Every path from a node to its null leaves has the same number of black nodes
   - [ ] The root is red
   - [ ] Leaves are red
   > It keeps the paths from differing greatly in length.
4. What height bound does a red-black tree satisfy?
   - [ ] About log2 n
   - [x] At most 2 log2(n + 1)
   - [ ] At most n
   - [ ] At most n over 2
   > The longest path is at most twice the shortest.

# B Tree Overview
kind: concept
time: Not an algorithmic topic — this lesson describes a structure. Search, insert and delete cost O(log n) comparisons, but the number of page reads, which dominates on disk, is O(log_t n) where t is the minimum degree.
space: Not an algorithmic topic — each node is a page that holds between t − 1 and 2t − 1 keys, so nodes are at least half full and storage overhead is bounded.

## intro
A B-tree is a balanced search tree designed for data stored on disk. Instead of two children per node, each node holds many keys and has many children, which makes the tree very short and wide, so that finding a key takes only a handful of disk reads. Databases and file systems rely on B-trees and their variants for indexes.

## theory
Why not a binary tree on disk: reading a disk page takes milliseconds, far slower than a memory access. A balanced binary tree with a billion keys has about 30 levels, so about 30 page reads per lookup. A B-tree with nodes sized to a page and hundreds of keys per node has only 3 to 5 levels for the same data.

Definition (minimum degree t, at least 2):

- Every node except the root has at least t − 1 keys and at most 2t − 1 keys
- The root has at least one key (if the tree is not empty)
- A node with k keys has k + 1 children, and the keys separate the key ranges of the children, as in a multiway search tree
- All leaves are at the same depth, which is what makes the tree perfectly height balanced

Height bound: a B-tree with n keys and minimum degree t has height h at most log_t((n + 1) / 2). With t = 100 and n = one billion keys, the height is at most 4 (counting edges), so a lookup needs at most about 5 page reads, and the upper levels can be kept in memory so the real cost is often one or two reads.

Search: in a node, find the first key greater than or equal to the target (binary search or linear scan within the page); if equal, done; otherwise descend into the child between the surrounding keys; reaching a leaf without a match means the key is absent.

Insertion: insert into the appropriate leaf. If the leaf overflows (2t keys), split it: the median key moves up to the parent and the leaf becomes two nodes with t − 1 and t keys. The split may overflow the parent, which splits in turn, and the split can propagate to the root; a root split creates a new root and increases the height by one. This is the only way the height grows, so all leaves stay at the same depth. A common refinement splits full nodes on the way down so that no backtracking is needed.

Deletion: remove the key from a leaf, or replace it by its predecessor or successor from a leaf. If a node falls below t − 1 keys, borrow a key from a sibling through the parent (rotation) or merge with a sibling, which can propagate upward; if the root becomes empty the height shrinks by one.

Example: inserting the keys 1 to 10 in order into a B-tree with t = 2 (a 2-3-4 tree where nodes hold 1 to 3 keys) gives a tree of height 2 with root key 4, then internal nodes, and all leaves at the same depth; the simulation below prints the keys level by level.

Properties and comparisons:

- Pages are at least half full, so the storage utilisation is at least 50 percent (typically around 69 percent for random inserts)
- Updates touch O(height) pages, and splits are rare because they happen only when a page fills
- Compared with AVL or red-black trees, B-trees trade more complex nodes for far fewer random accesses
- Compared with hash indexes, B-trees support range queries and ordered scans
- In memory, B-trees with moderately sized nodes (a few cache lines) can beat binary trees through cache efficiency; Rust's BTreeMap and some C++ libraries use them for this reason

Applications: relational databases (PostgreSQL, MySQL indexes use B-tree variants), file systems (NTFS, ext4's HTree directories, Btrfs, APFS), key value stores and search indexes.

## explain
1. Choose the minimum degree t so a node fits in a disk page.
2. Search by finding the key's position in the node and descending to the matching child.
3. Insert into a leaf; if it overflows, split it and push the median key to the parent.
4. Repeat splits upward, creating a new root if the root splits.
5. On deletion, borrow from a sibling or merge nodes to keep the minimum number of keys.
6. Use the height bound log_t((n + 1) / 2) to estimate the number of page reads.

## example
The Python program builds a B-tree with minimum degree 2 by inserting the keys 1 to 10 and prints the keys of each level, then computes the maximum height for one billion keys with minimum degrees 2, 50 and 500. The JavaScript program estimates how many keys fit in a 4096 byte page and the resulting height for a billion keys.

## real
Database indexes, file system directories and key value storage engines all store their ordered data in B-trees or close relatives.

## pros
- Very shallow trees, so few page reads per lookup
- Stays balanced automatically with all leaves at the same depth
- Supports ordered scans and range queries

## cons
- Node splitting and merging make the code intricate
- Pages are partly empty, wasting space
- Not as simple as a hash index for pure equality lookups

## uses
- Database indexes
- File system metadata and directories
- Ordered key value stores
- Cache efficient in-memory ordered maps

## mistakes
- Choosing a node size unrelated to the page size of the storage
- Forgetting that a split pushes the median key up, not copying it
- Thinking the height grows at the leaves, when it only grows at the root
- Comparing B-tree speed to binary trees in comparisons instead of page reads

## interview
**Q:** Why are B-trees used for databases and file systems?
**A:** Each node fills a disk page and holds many keys, so the tree is very shallow and a lookup needs only a few page reads, much fewer than a binary tree with the same number of keys.

**Q:** What happens when a B-tree node overflows during insertion?
**A:** The node splits into two nodes around its median key, and the median key moves up into the parent; the split can propagate to the root and increase the height by one.

**Q:** What is the height bound of a B-tree?
**A:** With minimum degree t and n keys, the height is at most log base t of (n + 1) over 2.

## summary
A B-tree stores many keys per node, keeps all leaves at the same depth through splits and merges, and has height O(log_t n), so lookups need only a few page reads. It is the standard structure behind database and file system indexes.

## codenote
The Python sample inserts keys into a small B-tree and prints its levels. The JavaScript sample estimates fanout and height.

## code
### python
```python
import math

class BTree:
    def __init__(self, t):
        self.t = t
        self.root = {"keys": [], "kids": []}

    def insert(self, key):
        root = self.root
        if len(root["keys"]) == 2 * self.t - 1:
            self.root = {"keys": [], "kids": [root]}
            self.split(self.root, 0)
        self.insert_nonfull(self.root, key)

    def split(self, parent, i):
        t, full = self.t, parent["kids"][i]
        right = {"keys": full["keys"][t:], "kids": full["kids"][t:]}
        median = full["keys"][t - 1]
        full["keys"], full["kids"] = full["keys"][:t - 1], full["kids"][:t]
        parent["keys"].insert(i, median)
        parent["kids"].insert(i + 1, right)

    def insert_nonfull(self, node, key):
        if not node["kids"]:
            node["keys"].append(key)
            node["keys"].sort()
            return
        i = sum(1 for k in node["keys"] if k < key)
        if len(node["kids"][i]["keys"]) == 2 * self.t - 1:
            self.split(node, i)
            if key > node["keys"][i]:
                i += 1
        self.insert_nonfull(node["kids"][i], key)

    def levels(self):
        out, level = [], [self.root]
        while level:
            out.append([node["keys"] for node in level])
            level = [kid for node in level for kid in node["kids"]]
        return out

tree = BTree(2)
for key in range(1, 11):
    tree.insert(key)
for level in tree.levels():
    print(level)
for t in (2, 50, 500):
    print(t, math.floor(math.log((10 ** 9 + 1) / 2, t)))
```
Output:
```text
[[4]]
[[2], [6, 8]]
[[1], [3], [5], [7], [9, 10]]
2 28
50 5
500 3
```
### javascript
```javascript
const pageBytes = 4096;
const keyBytes = 8;
const pointerBytes = 8;
const maxKeys = Math.floor((pageBytes - pointerBytes) / (keyBytes + pointerBytes));
const minDegree = Math.ceil((maxKeys + 1) / 2);
const height = Math.floor(Math.log((1e9 + 1) / 2) / Math.log(minDegree));
console.log(maxKeys, minDegree, height);
```
Output:
```text
255 128 4
```

## quiz
1. Why is a B-tree shallow?
   - [ ] It stores only leaves
   - [x] Each node holds many keys and has many children
   - [ ] It is stored in an array
   - [ ] It never splits
   > A wide fanout reduces the number of levels.
2. What happens to the median key when a full node splits?
   - [ ] It is deleted
   - [x] It moves up into the parent node
   - [ ] It stays in both halves
   - [ ] It becomes a leaf
   > The two halves are separated by the median key in the parent.
3. When does the height of a B-tree increase?
   - [ ] When any leaf gets a key
   - [x] When the root splits
   - [ ] When a key is deleted
   - [ ] Never
   > All leaves stay at the same depth because growth happens at the root.
4. What is the minimum number of keys in a non-root node with minimum degree t?
   - [ ] t
   - [x] t − 1
   - [ ] 2t − 1
   - [ ] 1
   > Nodes are at least half full.
