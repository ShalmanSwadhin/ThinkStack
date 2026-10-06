# Trie Node Structure
kind: algorithm
time: O(L) to insert or look up a word of length L, independent of how many words the trie stores; building a trie from n words of average length L costs O(n · L).
space: O(total characters) in the worst case with a node per character, up to O(n · L · alphabet size) when each node uses a fixed array of children; shared prefixes reduce the node count.
viz: trie-insert

## intro
A trie, also called a prefix tree, stores a set of strings so that words sharing a beginning share the same path. Each node represents one character position, and a flag marks where a word ends. Lookups cost time proportional to the word length, not to the number of stored words, and prefix queries become simple walks down the tree.

## theory
Node structure:

- `children`: a map from a character to the child node (a hash map or dictionary) or a fixed array indexed by the character (26 slots for lowercase letters)
- `is_end` (or `word` / `terminal`): true if the path from the root to this node spells a stored word
- Optional extra data: a count of words passing through the node (for prefix counts), the stored word itself, a frequency, or a value for a map interface

The root represents the empty prefix and holds no character. A path from the root spells a prefix; if the final node has `is_end` set, that prefix is also a complete word. Because prefixes are shared, the words `cat`, `car` and `cart` use one path c → a, then branch into t and r, with `cart` extending the r branch by one more node.

Node count example: the words cat, car, cart and dog create nodes for c, a, t, r, t (under r), d, o, g, which is 8 character nodes plus the root, 9 in total, while storing the words separately would take 3 + 3 + 4 + 3 = 13 characters. Sharing prefixes saves memory when many words begin alike, as in dictionaries and URLs.

Representation choices:

- Hash map children: memory proportional to the characters actually used; flexible for Unicode; slower constants
- Array children (`[None] * 26`): O(1) child access without hashing, but every node pays for 26 slots (208 bytes with 8 byte pointers) even if it has one child, so a trie of 100,000 words can take hundreds of megabytes
- Sorted child lists or arrays with binary search: a compromise
- Compressed (radix or Patricia) tries: merge chains of single child nodes into edges labelled with substrings, reducing the node count to about the number of words; used in routing tables and Redis
- Ternary search trees: each node has three links (less, equal, greater) and one character, saving memory with slightly slower lookups
- DAWG or minimal acyclic automata: share suffixes as well as prefixes

Complexity: insert, search and prefix check cost O(L), which is attractive when L is small and the number of words is large. A hash set also gives O(L) expected lookups (hashing costs O(L)) but cannot answer prefix queries without scanning. A sorted array with binary search costs O(L log n) for lookups and supports prefix ranges, but inserts cost O(n).

Memory vs speed: tries are fast but memory hungry; for static dictionaries, compact representations (double array tries, succinct tries, finite state transducers as in Lucene) cut memory by an order of magnitude.

Typical applications: autocomplete, spell checkers, IP routing (longest prefix match on bits), T9 predictive text, word games, and storing keys with common prefixes such as file paths.

Design details: decide whether the trie is case sensitive, which alphabet it supports, how to represent the end of word (a flag, so a word and its prefix can both be stored: `car` and `cart`), whether to store counts, and whether words can be deleted.

Common bugs: forgetting the end-of-word flag so that a prefix is mistaken for a word, sharing a mutable default dictionary between nodes in Python (`children={}` as a default argument), and using a fixed 26 array with characters outside a to z.

## explain
1. Create a root node with an empty children map and no end flag.
2. Define a node with a children map and an end-of-word flag.
3. To store a word, follow or create a child for each character.
4. Mark the last node as the end of a word.
5. Count the nodes to see how much sharing happens.
6. Choose map or array children according to the alphabet and memory limits.

## example
The Python program builds a trie from `cat`, `car`, `cart` and `dog` and reports 9 nodes including the root, compared with 13 stored characters, and shows the end flags for the nodes. The JavaScript program estimates the memory of array based nodes against map based nodes for the same trie.

## real
Search boxes suggest completions from tries, routers match the longest IP prefix with binary tries, and text editors use them for spell checking and abbreviations.

## pros
- Lookup time depends on the word length only
- Shared prefixes save memory and enable prefix queries
- Words come out in sorted order by traversal

## cons
- Memory hungry with fixed arrays of children
- Poor cache behaviour from pointer chasing
- More complex than a hash set for plain membership

## uses
- Autocomplete and prefix search
- Spell checking dictionaries
- Longest prefix matching in routing
- Word games and puzzle solvers

## mistakes
- Not marking word ends and mistaking prefixes for words
- Allocating 26 slots per node for sparse data
- Using a shared mutable default for the children map
- Ignoring characters outside the supported alphabet

## interview
**Q:** What is a trie and what does each node store?
**A:** A tree where each edge is a character and each path from the root spells a prefix; a node stores its children (by character) and a flag that tells whether a stored word ends there.

**Q:** What is the time complexity of inserting and searching a word in a trie?
**A:** O(L) for a word of length L, independent of the number of stored words.

**Q:** Why does a trie need an end of word flag?
**A:** A word can be a prefix of another word, as car is of cart, so the path alone cannot tell whether car was stored or is merely part of cart.

## summary
A trie stores strings along shared character paths, with each node holding children and an end flag, giving O(L) insert and lookup and cheap prefix queries. Choose child storage by alphabet size and memory budget.

## codenote
The Python sample builds a trie and counts nodes. The JavaScript sample compares node memory estimates.

## code
### python
```python
class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

def insert(root, word):
    node = root
    for ch in word:
        node = node.children.setdefault(ch, TrieNode())
    node.is_end = True

def count_nodes(node):
    return 1 + sum(count_nodes(child) for child in node.children.values())

root = TrieNode()
words = ["cat", "car", "cart", "dog"]
for word in words:
    insert(root, word)
print(count_nodes(root), sum(len(w) for w in words))
node = root
for ch in "car":
    node = node.children[ch]
print(node.is_end, sorted(node.children), node.children["t"].is_end)
```
Output:
```text
9 13
True ['t'] True
```
### javascript
```javascript
function build(words) {
  const root = new Map();
  for (const word of words) {
    let node = root;
    for (const ch of word) {
      if (!node.has(ch)) node.set(ch, new Map());
      node = node.get(ch);
    }
    node.set("$end", true);
  }
  return root;
}

function count(node) {
  let nodes = 1;
  for (const [key, child] of node) if (key !== "$end") nodes += count(child);
  return nodes;
}

const nodes = count(build(["cat", "car", "cart", "dog"]));
console.log(nodes, "array slots", nodes * 26, "map entries", nodes - 1);
```
Output:
```text
9 array slots 234 map entries 8
```

## quiz
1. What does each node of a trie typically store?
   - [ ] A whole word only
   - [x] Its children by character and an end-of-word flag
   - [ ] A hash of the word
   - [ ] The word length only
   > The path from the root spells the prefix.
2. What is the time to look up a word of length L in a trie?
   - [ ] O(n)
   - [x] O(L)
   - [ ] O(log n)
   - [ ] O(L squared)
   > One step per character.
3. Why is an end flag required?
   - [ ] To save memory
   - [x] A stored word can be a prefix of another stored word
   - [ ] To sort the children
   - [ ] To count nodes
   > Car is a word and also a prefix of cart.
4. What is the drawback of arrays of 26 children?
   - [ ] Slower lookups
   - [x] Every node pays for 26 slots even if it has few children
   - [ ] They cannot store letters
   - [ ] They need hashing
   > Memory use can become very large for sparse tries.

# Trie Insert Search Delete
kind: algorithm
time: O(L) for insert, search and delete of a word of length L, plus O(L) space for any new nodes created by an insertion.
space: O(L) of extra space for iterative operations, or O(L) stack frames for the recursive delete.
viz: trie-insert

## intro
The three basic trie operations all walk down one character at a time. Insertion creates missing nodes, search follows existing ones and checks the end flag, and deletion removes the end flag and, when possible, prunes nodes that no longer lead to any word. The subtle part is deletion, because nodes shared with other words must stay.

## theory
Insert(word): start at the root; for each character, move to the child for that character, creating it if absent; after the last character set `is_end = True`. Cost O(L). Inserting a word that already exists changes nothing.

Search(word): walk down following the characters; if a child is missing, return false; after the last character return the node's `is_end` flag. Reaching the node without the flag means the word is only a prefix of stored words.

StartsWith(prefix): the same walk, but return true as soon as all characters are matched, ignoring the flag. This is the operation that hash sets cannot offer.

Delete(word): three cases after finding the path:

- The word is not stored (the path is missing or the end flag is false): do nothing
- The word's last node has children (the word is a prefix of longer words): just clear the end flag; all nodes stay
- The word's last node has no children: clear the flag and prune upward, removing nodes until you reach a node that either has another child or marks the end of a different word, or the root

Recursive delete is natural: `delete(node, word, depth)` returns true if the caller should remove the child pointing to this node. At the last character, clear `is_end` and report removable if the node has no children. Otherwise recurse into the child, and if the child is removable, delete it from the children map, then report removable when this node has no children left and is not itself the end of another word.

Example. Insert cat, car, cart and dog (9 nodes with the root). Delete cart: its last node t has no children, so it is pruned; the node r still marks the word car, so the pruning stops; the trie now has 8 nodes. Delete car afterwards: the node r has no children now, so it is removed, and the node a still has the child t (cat), so the pruning stops; the trie has 7 nodes. Searching for car now returns false, searching cat still returns true, and `startswith("ca")` is true. Deleting a word that is only a prefix, such as `ca`, does nothing.

Variants:

- Count-based deletion: store at each node the number of words that pass through it; deletion decrements the counts along the path and removes nodes whose count reaches zero, avoiding the need to inspect children
- Lazy deletion: only clear the end flag and never prune, trading memory for speed (appropriate when deletions are rare)
- Iterative deletion: record the path in a list or stack, then walk back and prune
- Insert with value: store a value at the end node, giving a map from strings to values with prefix operations

Memory behaviour: insertion allocates up to L new nodes; deletion frees up to L nodes; without pruning the trie only grows, which can leak memory in long-running programs that add and remove many keys.

Common bugs: deleting a node that is shared with another word (breaking it), forgetting to check the end flag of intermediate nodes during pruning (removing a shorter word's end), and returning true for search when only a prefix matches.

Testing: insert and search words and prefixes, delete leaf words, words that are prefixes of others and absent words, then compare the trie against a Python set after random operations.

## explain
1. To insert, create missing child nodes along the word and set the end flag.
2. To search, follow the characters and check the end flag of the last node.
3. For a prefix query, follow the characters and ignore the flag.
4. To delete, find the last node; if it has children just clear the flag.
5. Otherwise clear the flag and remove nodes upward while they have no other children and are not word ends.
6. Test against a set with random insertions and deletions.

## example
The Python class inserts cat, car, cart and dog, deletes cart (the trie shrinks from 9 to 8 nodes), then deletes car (to 7 nodes), and prints the search results for car, cat and the prefix ca. The JavaScript program checks a random sequence of operations against a Set and prints `true`.

## real
Autocomplete indexes remove obsolete terms, IP routing tables insert and withdraw prefixes, and spell checkers add custom words to a dictionary trie at run time.

## pros
- All three operations run in time proportional to the word length
- Prefix queries come at no extra cost
- Pruning keeps memory in check

## cons
- Deletion has several cases that are easy to get wrong
- Without pruning, memory only grows
- Pointer based nodes cost more than hash sets for small data

## uses
- Maintaining dynamic dictionaries
- Prefix existence checks
- Routing tables with updates
- Storing keys with associated values

## mistakes
- Deleting a node that other words still use
- Forgetting to clear the end flag and thinking the word was removed
- Returning true for search when only the prefix exists
- Pruning past a node that marks the end of a shorter word

## interview
**Q:** How do you delete a word from a trie?
**A:** Walk to the last node and clear its end flag; if it has no children remove it and continue pruning upward through nodes that have no other children and do not mark the end of another word.

**Q:** What is the difference between search and startsWith?
**A:** Search requires the last node to be marked as the end of a stored word, while startsWith only requires that the path of the prefix exists.

**Q:** Why can lazy deletion be acceptable?
**A:** Clearing the end flag already makes the word disappear from searches, and skipping the pruning saves time, at the cost of memory that is not reclaimed.

## summary
Trie insertion creates a path, search follows it and checks the end flag, and deletion clears the flag and prunes nodes that no longer lead to any word. All run in O(L), with pruning rules that must keep shared nodes alive.

## codenote
The Python sample implements all three operations with pruning. The JavaScript sample checks a trie against a Set.

## code
### python
```python
class Node:
    def __init__(self):
        self.children, self.is_end = {}, False

class Trie:
    def __init__(self):
        self.root = Node()

    def insert(self, word):
        node = self.root
        for ch in word:
            node = node.children.setdefault(ch, Node())
        node.is_end = True

    def _find(self, text):
        node = self.root
        for ch in text:
            node = node.children.get(ch)
            if node is None:
                return None
        return node

    def search(self, word):
        node = self._find(word)
        return bool(node and node.is_end)

    def starts_with(self, prefix):
        return self._find(prefix) is not None

    def delete(self, word):
        def remove(node, depth):
            if depth == len(word):
                node.is_end = False
                return not node.children
            child = node.children.get(word[depth])
            if child is None:
                return False
            if remove(child, depth + 1):
                del node.children[word[depth]]
            return not node.children and not node.is_end
        remove(self.root, 0)

    def size(self):
        def count(node):
            return 1 + sum(count(c) for c in node.children.values())
        return count(self.root)

trie = Trie()
for word in ("cat", "car", "cart", "dog"):
    trie.insert(word)
print(trie.size())
trie.delete("cart")
print(trie.size(), trie.search("car"), trie.search("cart"))
trie.delete("car")
print(trie.size(), trie.search("car"), trie.search("cat"), trie.starts_with("ca"))
trie.delete("ca")
print(trie.size())
```
Output:
```text
9
8 True False
7 False True True
7
```
### javascript
```javascript
class Trie {
  constructor() {
    this.root = { children: new Map(), end: false };
  }

  insert(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, { children: new Map(), end: false });
      node = node.children.get(ch);
    }
    node.end = true;
  }

  has(word) {
    let node = this.root;
    for (const ch of word) {
      node = node.children.get(ch);
      if (!node) return false;
    }
    return node.end;
  }

  remove(word) {
    const walk = (node, depth) => {
      if (depth === word.length) {
        node.end = false;
        return node.children.size === 0;
      }
      const child = node.children.get(word[depth]);
      if (!child) return false;
      if (walk(child, depth + 1)) node.children.delete(word[depth]);
      return node.children.size === 0 && !node.end;
    };
    walk(this.root, 0);
  }
}

let seed = 11;
const random = () => (seed = (seed * 48271) % 2147483647);
const words = ["a", "ab", "abc", "b", "bc", "bca", "ca"];
const trie = new Trie();
const set = new Set();
let same = true;
for (let step = 0; step < 500; step++) {
  const word = words[random() % words.length];
  if (random() % 2) {
    trie.insert(word);
    set.add(word);
  } else {
    trie.remove(word);
    set.delete(word);
  }
  same = same && words.every((w) => trie.has(w) === set.has(w));
}
console.log(same);
```
Output:
```text
true
```

## quiz
1. When does search return true?
   - [ ] When the prefix exists
   - [x] When the path exists and the last node is marked as a word end
   - [ ] When the trie is not empty
   - [ ] When the first letter exists
   > A prefix of a stored word is not a stored word.
2. What happens when you delete a word that is a prefix of another stored word?
   - [ ] All nodes are removed
   - [x] Only its end flag is cleared
   - [ ] The longer word is deleted too
   - [ ] The trie is rebuilt
   > The nodes are still needed by the longer word.
3. When may pruning stop while walking up after a deletion?
   - [ ] Never
   - [x] At a node that has another child or marks the end of another word
   - [ ] At the first node
   - [ ] At the root only
   > Such a node is still in use.
4. What does the startsWith operation ignore?
   - [ ] The characters
   - [x] The end-of-word flag
   - [ ] The root
   - [ ] The children
   > It only needs the prefix path to exist.

# Prefix Matching Applications
kind: algorithm
time: O(P + K) to list K completions of a prefix of length P (walk the prefix in O(P) and traverse the subtree in time proportional to its size); counting completions is O(P) with stored counts.
space: O(total characters) for the trie, plus O(L) recursion for collecting suffixes.
practice: trie-level-order-traversal

## intro
Prefix queries are what tries do best: which words start with these letters, how many do, what is the longest prefix shared by a set of words, which stored string is the longest match for an address. Autocomplete boxes, IP routers and spell checkers are all built from a few such operations over a trie.

## theory
Core prefix operations:

- Walk the prefix: follow its characters from the root; if a character is missing, no word has this prefix
- List completions (autocomplete): from the node reached, traverse its subtree depth first and collect every word where the end flag is set, appending characters along the path. Children visited in alphabetical order give sorted results. For the words car, card, care, cart, cat and dog the completions of `ca` are car, card, care, cart, cat in this order.
- Count words with a prefix: store at each node the number of words passing through it (incremented on insert); the answer is the count at the prefix node in O(P)
- Ranked suggestions: store a frequency at word ends, and either collect and sort all completions (fine for small subtrees) or store the top few suggestions at each node, updating them on insertion so queries cost O(P)
- Limit results: stop the traversal after the first k words

Longest common prefix of a set of words: insert them into a trie and walk from the root while the current node has exactly one child and is not a word end. For `flower`, `flow` and `flight` the walk goes f, l and then branches (o and i), so the answer is `fl`. (A simpler method compares the characters of the first and last word in sorted order, but the trie method also tells you how many words share each prefix.)

Longest prefix match: given a trie of prefixes (such as routes) and a query string, walk as far as the query allows and remember the last node that marked the end of a stored prefix. In IP routing the stored prefixes are bit strings, so each node has two children, and the longest matching prefix decides the next hop. For stored prefixes `10`, `1011` and `0` and the query `101110`, the longest match is `1011`.

Other applications:

- Spell checking and correction: search the trie with bounded edit distance by carrying a row of the edit distance table down the recursion, pruning when the minimum exceeds the limit
- T9 predictive text and phone keypad searches: branch over the letters mapped to each digit
- Word games: validating words and pruning board searches when no word continues a prefix (next lessons)
- Replace words with their shortest dictionary root: walk each word in a sentence and cut at the first end flag
- Search by prefix in file paths, URLs, product codes and log keys
- Keyword filtering and the Aho-Corasick automaton, which adds failure links to a trie for matching many patterns in one pass of the text
- Sorting strings: inserting all strings into a trie and traversing gives lexicographic order (a form of radix sort)

Compared with other approaches:

- Sorted array plus binary search: finds the range of words with the prefix in O(P log n), good for static data, less friendly to updates
- Hash set: no prefix support
- Database LIKE queries on an index: use ordered structures such as B-trees that support prefix ranges
- Trie: O(P) per prefix with ordered results and dynamic updates, at a higher memory cost

Complexity of listing: the number of nodes visited can exceed K when many nodes lead to few words (long unshared tails); compressed tries visit fewer nodes.

Pitfalls: forgetting that the prefix itself may be a word, building the completion strings with repeated concatenation in loops (use a list and join), unbounded results for short prefixes (cap the number of suggestions), and case or Unicode normalisation.

## explain
1. Insert all words, optionally with counts or frequencies.
2. Walk the query prefix from the root and stop if a character is missing.
3. From the prefix node, traverse the subtree and collect words, using alphabetical order for sorted output.
4. For counts, read the stored pass-through count at the prefix node.
5. For the longest common prefix, walk while the node has a single child and is not a word end.
6. For longest prefix match, remember the last end flag seen along the query path.

## example
The Python program lists the completions of `ca` and `d`, counts the words with the prefix `car` and finds the longest common prefix of `flower`, `flow` and `flight`. The JavaScript program finds the longest stored prefix match for bit strings in a small routing table: 1011 for the query 101110.

## real
Search boxes complete queries from tries, routers choose routes by longest prefix match and editors suggest identifiers by prefix.

## pros
- Prefix queries cost time in the prefix length
- Results come in sorted order
- Counts and rankings can be stored in nodes

## cons
- Listing many completions can touch many nodes
- Memory heavy compared with sorted arrays for static data
- Case and Unicode normalisation add complexity

## uses
- Autocomplete and suggestion lists
- Counting words that start with a prefix
- Longest common prefix of a set of strings
- Longest prefix match in routing tables

## mistakes
- Forgetting that the prefix itself can be a stored word
- Building strings by repeated concatenation inside the traversal
- Returning an unbounded number of suggestions for short prefixes
- Treating uppercase and lowercase letters as different without intention

## interview
**Q:** How do you implement autocomplete with a trie?
**A:** Walk the typed prefix to its node, then traverse the subtree depth first collecting the words whose end flag is set, in alphabetical order, and optionally limit the count or rank by stored frequency.

**Q:** How do you find the longest common prefix of many words using a trie?
**A:** Insert all words and walk from the root while the current node has exactly one child and is not a word end; the characters passed form the longest common prefix.

**Q:** What is longest prefix matching and where is it used?
**A:** Finding the longest stored prefix that matches the beginning of a query, as routers do with IP addresses; walk the trie along the query and remember the last node that marked a stored prefix.

## summary
Prefix matching walks a trie along the query and then lists, counts or measures what lies below it, giving autocomplete, longest common prefix and longest prefix match in time proportional to the prefix length plus the output size.

## codenote
The Python sample lists completions and finds a common prefix. The JavaScript sample does longest prefix match.

## code
### python
```python
class Node:
    def __init__(self):
        self.children, self.is_end, self.count = {}, False, 0

root = Node()

def insert(word):
    node = root
    for ch in word:
        node = node.children.setdefault(ch, Node())
        node.count += 1
    node.is_end = True

def find(prefix):
    node = root
    for ch in prefix:
        node = node.children.get(ch)
        if node is None:
            return None
    return node

def completions(prefix):
    node, out = find(prefix), []

    def collect(current, path):
        if current.is_end:
            out.append("".join(path))
        for ch in sorted(current.children):
            collect(current.children[ch], path + [ch])

    if node:
        collect(node, list(prefix))
    return out

for word in ("car", "card", "care", "cart", "cat", "dog"):
    insert(word)
print(completions("ca"), completions("d"), completions("x"))
print(find("car").count, find("ca").count)

def common_prefix(words):
    trie = Node()
    for word in words:
        node = trie
        for ch in word:
            node = node.children.setdefault(ch, Node())
        node.is_end = True
    node, prefix = trie, ""
    while len(node.children) == 1 and not node.is_end:
        ch, node = next(iter(node.children.items()))
        prefix += ch
    return prefix

print(common_prefix(["flower", "flow", "flight"]))
```
Output:
```text
['car', 'card', 'care', 'cart', 'cat'] ['dog'] []
4 5
fl
```
### javascript
```javascript
function buildRoutes(prefixes) {
  const root = { children: {}, route: null };
  for (const prefix of prefixes) {
    let node = root;
    for (const bit of prefix) node = node.children[bit] ??= { children: {}, route: null };
    node.route = prefix;
  }
  return root;
}

function longestMatch(root, address) {
  let node = root;
  let best = null;
  for (const bit of address) {
    node = node.children[bit];
    if (!node) break;
    if (node.route) best = node.route;
  }
  return best;
}

const table = buildRoutes(["10", "1011", "0"]);
console.log(longestMatch(table, "101110"), longestMatch(table, "1001"), longestMatch(table, "110"));
```
Output:
```text
1011 10 null
```

## quiz
1. How are completions of a prefix found?
   - [ ] By scanning all stored words
   - [x] By walking to the prefix node and traversing its subtree for word ends
   - [ ] By sorting the trie
   - [ ] By hashing the prefix
   > The subtree holds exactly the words with that prefix.
2. How can the number of words with a prefix be answered in O(P)?
   - [ ] By traversing the subtree
   - [x] By storing a pass-through count at every node
   - [ ] By sorting the words
   - [ ] By counting the children
   > The count at the prefix node is the answer.
3. What is the longest common prefix of flower, flow and flight?
   - [ ] flo
   - [x] fl
   - [ ] f
   - [ ] flow
   > The trie branches after f and l.
4. What does longest prefix match return for the query 101110 with prefixes 10, 1011 and 0?
   - [ ] 10
   - [x] 1011
   - [ ] 0
   - [ ] Nothing
   > The longest stored prefix that begins the query is chosen.

# Word Search with Trie
kind: algorithm
time: O(R · C · 4^L) in the worst case for an R by C board and maximum word length L, but pruning by the trie typically visits only a small fraction because a path is abandoned as soon as no stored word continues it; building the trie costs O(total characters).
space: O(total characters of the words) for the trie plus O(L) recursion depth.

## intro
Finding one word in a letter grid is a simple depth first search. Finding many words at once is far more expensive if you search for each word separately. A trie of all the words lets a single search follow the grid and the dictionary together, abandoning a path the moment it matches no word's prefix, and discovering every word along shared prefixes in one pass.

## theory
Problem (word search II): given a board of letters and a list of words, find all words that can be built from sequentially adjacent cells (horizontally or vertically), using each cell at most once per word.

Naive approach: run the single word search once per word. For W words of length up to L the cost is O(W · R · C · 4^L), and words with common prefixes repeat the same exploration.

Trie approach:

- Insert all words into a trie; at the end node of each word store the word itself (so you do not need to rebuild it from the path)
- For every cell, start a depth first search with the root: move into the child matching the cell's letter; if there is no such child, stop immediately
- When the current trie node holds a word, add it to the results and clear it from the node, so the same word is not reported twice
- Mark the cell as visited (replace its letter by a placeholder), explore the four neighbours with the child node, then restore the letter

The search prunes any path whose letters are not a prefix of some word, so the exploration is bounded by the shape of the trie instead of by L steps from every cell.

Example: on the board with rows `oaan`, `etae`, `ihkr` and `iflv` and the words `oath`, `pea`, `eat` and `rain`, the found words are `eat` and `oath`. The word `oath` is found by going from o to a, t and h; `eat` by e, a, t; `pea` is impossible because the board has no p; and `rain` fails after r, a (no a next to r in the right order), so it is not found.

Optimisations:

- Prune the trie: after finding a word, remove its end marker, and delete child nodes that become empty (leaf nodes without words), so later searches skip finished branches; with many words this speeds up the search drastically
- Check letter counts first: if the board lacks the letters of a word, drop the word before searching
- Search from the rarer end of the word by reversing it when its last letters are rarer than its first letters
- Use an array of 26 children for speed on lowercase letters
- Avoid creating strings during the search: store the word at the end node instead of building a path string

The wildcard search variant: a trie supports search with `.` as a wildcard for any single letter (add and search word data structure). The search recurses into all children when it meets a dot, costing up to O(26^d) for d dots in the worst case but typically small. With stored words bad, dad and mad, the query `.ad` matches, `b..` matches, `pad` does not and `..d` matches.

Boggle style games combine the trie with the grid adjacency in eight directions; the same pruning makes solving a 4 by 4 board with a dictionary of 100,000 words instantaneous.

Complexity discussion: worst case remains exponential in the word length, because the number of paths in a grid grows by up to three new choices per step, but the trie bounds the work by the number of distinct prefixes that appear on the board, which is small for realistic dictionaries. The trie costs memory proportional to the total length of the words.

Pitfalls: not restoring the cell after a search branch, reporting duplicates when a word is reachable by several paths (clear the stored word on the first hit), forgetting that a word may be a prefix of another word (continue searching after finding it), and recursion depth equal to the word length (fine for words, not for long phrases).

## explain
1. Insert every word into a trie and store the word at its end node.
2. For each cell, start a depth first search at the trie root.
3. If the current letter has no child in the trie, stop this path.
4. If the child holds a word, add it to the results and clear it.
5. Mark the cell, explore the four neighbours, then restore the cell.
6. Optionally prune empty trie branches after a word is found.

## example
The Python program finds `eat` and `oath` on the sample board among the words `oath`, `pea`, `eat` and `rain`, and counts how many cells the trie guided search visits compared with the one-word-at-a-time approach. The JavaScript program implements a trie with wildcard search and prints the results for the queries `pad`, `bad`, `.ad` and `b..` over the words bad, dad and mad.

## real
Word game solvers find every valid word on a board with a trie, crossword assistants search patterns with wildcards, and autocomplete systems with typo tolerance prune candidates the same way.

## pros
- One search finds all words and shares work between common prefixes
- Dead paths are abandoned immediately
- The trie can be pruned as words are found

## cons
- Memory for the trie grows with the dictionary
- Still exponential in the word length in the worst case
- Needs care with visited cells and duplicate results

## uses
- Finding all dictionary words on a letter board
- Boggle and word game solvers
- Wildcard pattern lookups in dictionaries
- Teaching depth first search with pruning

## mistakes
- Forgetting to restore the board cell after exploring a path
- Reporting the same word more than once
- Searching once per word and ignoring shared prefixes
- Stopping the search after finding a word that is also a prefix of another word

## interview
**Q:** Why is a trie better than searching the grid once per word?
**A:** The trie lets one traversal follow all words at once, so shared prefixes are explored only once and any path that matches no word prefix is abandoned immediately.

**Q:** How do you avoid reporting the same word twice?
**A:** Store the word at its trie end node and clear it when found, so a second path to the same word finds nothing to report; optionally prune empty branches.

**Q:** How does wildcard search work in a trie?
**A:** For an ordinary letter follow the matching child; for a dot try every child recursively; the query matches if any path ends at a node marked as a word end.

## summary
A trie guides a depth first search over a letter grid so that all dictionary words are found in a single pass with early pruning, and the same structure supports wildcard lookups by branching on dots. Restore visited cells and avoid duplicates.

## codenote
The Python sample finds words on a board. The JavaScript sample supports wildcard queries.

## code
### python
```python
def find_words(board, words):
    root = {}
    for word in words:
        node = root
        for ch in word:
            node = node.setdefault(ch, {})
        node["$"] = word
    rows, cols = len(board), len(board[0])
    found = []

    def explore(r, c, parent):
        letter = board[r][c]
        node = parent.get(letter)
        if node is None:
            return
        if "$" in node:
            found.append(node.pop("$"))
        board[r][c] = "#"
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and board[nr][nc] != "#":
                explore(nr, nc, node)
        board[r][c] = letter

    for r in range(rows):
        for c in range(cols):
            explore(r, c, root)
    return sorted(found)

board = [list("oaan"), list("etae"), list("ihkr"), list("iflv")]
print(find_words(board, ["oath", "pea", "eat", "rain"]))
```
Output:
```text
['eat', 'oath']
```
### javascript
```javascript
class WordDictionary {
  constructor() {
    this.root = { children: {}, end: false };
  }

  add(word) {
    let node = this.root;
    for (const ch of word) node = node.children[ch] ??= { children: {}, end: false };
    node.end = true;
  }

  search(pattern, node = this.root, index = 0) {
    if (index === pattern.length) return node.end;
    if (pattern[index] === ".") {
      return Object.values(node.children).some((child) => this.search(pattern, child, index + 1));
    }
    const child = node.children[pattern[index]];
    return child ? this.search(pattern, child, index + 1) : false;
  }
}

const dictionary = new WordDictionary();
["bad", "dad", "mad"].forEach((w) => dictionary.add(w));
console.log(["pad", "bad", ".ad", "b.."].map((q) => dictionary.search(q)).join(" "));
```
Output:
```text
false true true true
```

## quiz
1. Why does a trie speed up searching many words on a board?
   - [ ] It sorts the board
   - [x] One search follows all words together and abandons paths that are no word's prefix
   - [ ] It uses less memory than a list
   - [ ] It avoids recursion
   > Shared prefixes are explored once.
2. What is stored at the end node of each word?
   - [ ] The word's length
   - [x] The word itself, cleared when it is found
   - [ ] A count of letters
   - [ ] The board position
   > It prevents duplicate results and avoids rebuilding the string.
3. What must be done to a board cell after exploring its neighbours?
   - [ ] It must be deleted
   - [x] Its original letter must be restored
   - [ ] It must be doubled
   - [ ] It must be skipped later
   > Other paths may need the cell.
4. How does a trie handle a dot in a wildcard query?
   - [ ] It stops the search
   - [x] It tries every child at that position
   - [ ] It deletes the node
   - [ ] It matches only vowels
   > Any single letter may match.

# Segment Tree Build
kind: algorithm
time: O(n) to build a segment tree over n elements, since each of the roughly 2n nodes is computed once from its two children.
space: O(n): about 2n nodes for an iterative bottom up layout, or an array of size 4n for the recursive top down layout (with any n).
viz: segment-tree-demo

## intro
A segment tree stores summaries of ranges of an array, such as sums, minima or maxima, in a binary tree whose leaves are the array elements and whose internal nodes combine their two children. Building it is the first step toward answering range queries and applying updates in logarithmic time instead of scanning the range.

## theory
Idea: the root summarises the whole array `[0, n − 1]`; its children summarise the left and right halves; and so on until the leaves, each a single element. A node covering the range `[l, r]` stores `combine(left child, right child)`, where combine is an associative operation: sum, minimum, maximum, gcd, product modulo a number, bitwise or, or a custom record.

Recursive build (top down):

- `build(node, l, r)`: if `l == r`, store `array[l]` in the node
- Otherwise `mid = (l + r) // 2`, build the left child for `[l, mid]` and the right child for `[mid + 1, r]`, then store the combination of the two children in the node
- Using an array representation with the root at index 1, the children of node i are `2i` and `2i + 1`

Array size: a recursion with arbitrary n needs up to `4n` cells in the array; with n rounded up to a power of two, `2 · 2^⌈log2 n⌉ ≤ 4n` cells. Allocating 4n is the safe rule of thumb.

Example for sums: the array `[1, 3, 5, 7, 9, 11]` gives a root sum of 36. The root splits into `[1, 3, 5]` with sum 9 and `[7, 9, 11]` with sum 27; the tree has 11 nodes (6 leaves and 5 internal nodes), which is 2n − 1.

Bottom up layout (iterative, Codeforces style): allocate an array `tree` of size 2n; place the leaves at `tree[n + i] = array[i]`; for i from n − 1 down to 1 set `tree[i] = combine(tree[2i], tree[2i + 1])`. It builds in a single loop, uses exactly 2n cells and works for any n for commutative operations (for non-commutative operations the bottom up queries need extra care about order). The node 1 does not always represent the whole array in order for non-power-of-two n, but queries on ranges still work.

Complexity: there are about 2n nodes, each computed once in O(1), so the build is O(n). Height is ⌈log2 n⌉, which is what makes queries and updates logarithmic.

Choices of the stored value:

- Sum, product, xor: invertible operations also admit prefix sums or Fenwick trees as alternatives
- Minimum, maximum, gcd: not invertible, so segment trees (or sparse tables for static arrays) are the right tool
- Records for complex queries: for example (best subarray sum, best prefix, best suffix, total) to answer maximum subarray queries on ranges, or (count of the minimum, minimum) to count how many times the minimum occurs
- Matrices or functions, where combine is composition

Compared with alternatives:

- Prefix sums: O(n) build and O(1) range sum, but O(n) updates
- Sparse table: O(n log n) build and O(1) idempotent range queries (min, max), static only
- Fenwick tree: O(n) build, O(log n) prefix queries and updates, compact, limited to invertible or prefix style operations
- Segment tree: O(n) build, O(log n) range queries and updates, the most flexible

Pitfalls: array too small (use 4n), wrong midpoint ranges that overlap, an identity element needed for empty ranges in iterative queries (0 for sums, infinity for minima), and building with a non-associative function.

Testing: compare tree values with brute-force aggregation of the corresponding ranges on random arrays, include n = 1, n = 2 and non powers of two.

## explain
1. Choose the combine operation and its identity value.
2. For a leaf store the array element.
3. For an internal node build both children first and combine their values.
4. Store nodes in an array with children at 2i and 2i plus 1 and allocate 4n cells.
5. For the iterative variant, copy the leaves to the second half and combine downward in a loop.
6. Verify the nodes against brute force on small arrays.

## example
The Python class builds a sum tree for `[1, 3, 5, 7, 9, 11]`, printing the root value 36, the two child sums 9 and 27 and the number of nodes 11. The JavaScript function builds an iterative minimum tree for `[5, 2, 8, 1, 9, 3]` and prints its array of 12 cells.

## real
Databases and analytics engines keep aggregate trees for range statistics, games use them for range based queries over entities and competitive programming relies on them for fast interval problems.

## pros
- Linear time build
- Supports many different combine operations
- Foundation for fast queries and updates

## cons
- Needs about 2n to 4n memory
- The combine operation must be associative
- Recursive layouts waste space for non powers of two

## uses
- Preparing range sum, min and max queries
- Storing aggregates over intervals
- Building records for complex range questions
- Dynamic arrays with updates

## mistakes
- Allocating an array that is too small for the recursive layout
- Using a non-associative combine operation
- Overlapping the child ranges when splitting
- Forgetting the identity value for empty ranges

## interview
**Q:** What does a segment tree store and how is it built?
**A:** Each node stores an aggregate, such as the sum or minimum, of a range of the array; leaves hold single elements and each internal node combines its two children, so the tree is built bottom up or recursively in O(n).

**Q:** How big should the array of a recursive segment tree be?
**A:** Four times the number of elements is a safe size, since the tree has up to 2 times the next power of two nodes.

**Q:** What property must the combine operation have?
**A:** It must be associative, because the tree groups elements in a different way than a left to right scan; an identity element is also needed for empty ranges.

## summary
A segment tree stores range aggregates in a binary tree built in O(n) from the leaves up, using an associative combine operation and about 2n to 4n cells. It prepares logarithmic range queries and updates.

## codenote
The Python sample builds a recursive sum tree. The JavaScript sample builds an iterative minimum tree.

## code
### python
```python
class SegmentTree:
    def __init__(self, values):
        self.n = len(values)
        self.tree = [0] * (4 * self.n)
        self.nodes = 0
        self._build(1, 0, self.n - 1, values)

    def _build(self, node, left, right, values):
        self.nodes += 1
        if left == right:
            self.tree[node] = values[left]
            return
        mid = (left + right) // 2
        self._build(2 * node, left, mid, values)
        self._build(2 * node + 1, mid + 1, right, values)
        self.tree[node] = self.tree[2 * node] + self.tree[2 * node + 1]

tree = SegmentTree([1, 3, 5, 7, 9, 11])
print(tree.tree[1], tree.tree[2], tree.tree[3], tree.nodes, 2 * 6 - 1)
```
Output:
```text
36 9 27 11 11
```
### javascript
```javascript
function buildMinTree(values) {
  const n = values.length;
  const tree = new Array(2 * n).fill(Infinity);
  values.forEach((value, i) => {
    tree[n + i] = value;
  });
  for (let i = n - 1; i >= 1; i--) tree[i] = Math.min(tree[2 * i], tree[2 * i + 1]);
  return tree;
}

const tree = buildMinTree([5, 2, 8, 1, 9, 3]);
console.log(tree.length, tree.slice(1).join(" "));
```
Output:
```text
12 1 1 2 1 3 5 2 8 1 9 3
```

## quiz
1. What does an internal node of a segment tree store?
   - [ ] The index of a leaf
   - [x] The combination of its two children's values
   - [ ] The number of elements
   - [ ] A sorted copy of the range
   > It summarises the range it covers.
2. What is the time to build a segment tree over n elements?
   - [ ] O(n log n)
   - [x] O(n)
   - [ ] O(log n)
   - [ ] O(n squared)
   > Each node is computed once.
3. How large should the array for a recursive segment tree be?
   - [ ] n
   - [x] 4n
   - [ ] n squared
   - [ ] log n
   > The tree may have up to twice the next power of two nodes.
4. Why must the combine operation be associative?
   - [ ] To save memory
   - [x] The tree groups elements differently from a left to right scan
   - [ ] To keep the tree balanced
   - [ ] To avoid recursion
   > Different groupings must give the same answer.

# Segment Tree Range Query
kind: algorithm
time: O(log n) per range query and O(log n) per point update, since a query touches at most about 4 log n nodes and an update walks one root to leaf path.
space: O(n) for the tree, with O(log n) recursion stack.
viz: segment-tree-demo

## intro
Once the segment tree is built, a range query combines the aggregates of a small number of nodes that exactly cover the requested range, and a point update changes one leaf and the nodes above it. Both cost logarithmic time, which is what makes segment trees the standard solution for arrays that change while being queried.

## theory
Range query `query(node, l, r, ql, qr)` for the query range `[ql, qr]`:

- If the node's range `[l, r]` lies completely inside the query range, return the node's stored value
- If it lies completely outside, return the identity element (0 for sums, infinity for minima)
- Otherwise it partially overlaps: query both children and combine their answers

At most two nodes per level are partially overlapped, so the recursion visits O(log n) nodes, and the fully covered nodes found along the way are at most about 2 log n, so the total work is O(log n).

Point update `update(node, l, r, index, value)`: descend to the leaf for `index` (go left or right by comparing with the midpoint), set it, and on the way back recompute each ancestor from its children. O(log n) because it follows a single path.

Example with sums for `[1, 3, 5, 7, 9, 11]`: the sum of indices 1 to 3 is 3 + 5 + 7 = 15. After updating index 1 to the value 10 the same query returns 22 and the total becomes 43. A range minimum query over `[5, 2, 8, 1, 9, 3]` for indices 2 to 5 returns 1.

Iterative bottom up version (for commutative operations): with leaves at `tree[n + i]`, a query on the half open range `[l, r)` runs `l += n; r += n` and loops while `l < r`: if `l` is odd use `tree[l]` and increment it, if `r` is odd decrement it and use `tree[r]`, then halve both. It is short, avoids recursion and is typically 2 to 3 times faster. A point update sets `tree[n + i] = value` and recomputes parents `i //= 2` up to the root.

Why queries and updates are logarithmic: the tree has height ⌈log2 n⌉, an update touches one node per level, and a query decomposes the range into O(log n) canonical segments (maximal nodes inside the range).

Comparison:

- Naive scan: O(n) per query, O(1) update
- Prefix sums: O(1) query, O(n) update
- Segment tree: O(log n) for both, which wins when queries and updates are interleaved
- Fenwick tree: O(log n) for both with simpler code and smaller constants for sums, but less flexible
- Sqrt decomposition: O(sqrt n) for both, simpler for some problems

Custom aggregates: store records so one tree answers richer questions. For maximum subarray queries a node stores `(total, best prefix, best suffix, best subarray)`, and combine merges two such records in constant time. Counting the minimum and its multiplicity, gcd of ranges, the number of elements equal to a value in a range (with a merge sort tree), and matrix products all fit.

Persistent and 2D variants exist, and segment trees on top of other trees (heavy-light decomposition) handle path queries.

Pitfalls: forgetting the identity for out-of-range nodes, mixing inclusive and half open ranges, applying the combine in the wrong order for non commutative operations (left result first), and updating the leaf without recomputing ancestors.

Testing: compare every query with a brute-force aggregate on random arrays and random updates, including single element ranges and the whole array.

## explain
1. Decide the query range and whether it is inclusive.
2. If the node range is inside the query, return the stored value.
3. If it is disjoint, return the identity element.
4. Otherwise combine the results from both children.
5. For an update, descend to the leaf, set the value and recompute the ancestors on the way back.
6. Compare results with a brute-force scan in tests.

## example
The Python class answers the sum of indices 1 to 3 as 15 for `[1, 3, 5, 7, 9, 11]`, updates index 1 to 10 and gets 22, with the total changing from 36 to 43. The JavaScript function uses an iterative tree to answer range minimum queries on `[5, 2, 8, 1, 9, 3]`, printing 1 for the range 2 to 5 and 2 for the range 0 to 2.

## real
Analytics dashboards query aggregates over time ranges while new data arrives, game servers answer range queries over entity lists and competitive programming uses the structure for many interval problems.

## pros
- Logarithmic range queries and point updates
- Supports many operations, including custom records
- Both recursive and fast iterative implementations

## cons
- More memory and code than prefix sums or Fenwick trees
- Needs an associative operation and an identity
- Range updates need lazy propagation

## uses
- Range sum, minimum and maximum with updates
- Counting or checking properties over ranges
- Maximum subarray queries over ranges
- Dynamic programming optimisations

## mistakes
- Returning zero for out-of-range nodes in a minimum query
- Mixing inclusive and half open range conventions
- Not recomputing ancestors after a point update
- Combining results in the wrong order for non commutative operations

## interview
**Q:** How does a segment tree answer a range query in O(log n)?
**A:** It decomposes the range into at most about 2 log n nodes whose ranges lie fully inside the query and combines their stored values, skipping nodes outside the range.

**Q:** How does a point update work?
**A:** It descends to the leaf for the index, changes its value and recomputes the aggregates of the ancestors on the way back up, O(log n).

**Q:** When would you choose a segment tree over prefix sums or a Fenwick tree?
**A:** When the aggregate is not invertible (minimum, maximum, gcd), when you need custom records or when range updates and complex queries are required.

## summary
A segment tree answers range queries by combining the O(log n) nodes that cover the range and updates a point by recomputing one path, giving logarithmic time for both. It works for any associative aggregate and extends to custom records.

## codenote
The Python sample is a recursive sum tree. The JavaScript sample is an iterative minimum tree.

## code
### python
```python
class SegmentTree:
    def __init__(self, values):
        self.n = len(values)
        self.tree = [0] * (4 * self.n)
        self._build(1, 0, self.n - 1, values)

    def _build(self, node, left, right, values):
        if left == right:
            self.tree[node] = values[left]
            return
        mid = (left + right) // 2
        self._build(2 * node, left, mid, values)
        self._build(2 * node + 1, mid + 1, right, values)
        self.tree[node] = self.tree[2 * node] + self.tree[2 * node + 1]

    def query(self, ql, qr, node=1, left=0, right=None):
        right = self.n - 1 if right is None else right
        if qr < left or right < ql:
            return 0
        if ql <= left and right <= qr:
            return self.tree[node]
        mid = (left + right) // 2
        return self.query(ql, qr, 2 * node, left, mid) + self.query(ql, qr, 2 * node + 1, mid + 1, right)

    def update(self, index, value, node=1, left=0, right=None):
        right = self.n - 1 if right is None else right
        if left == right:
            self.tree[node] = value
            return
        mid = (left + right) // 2
        if index <= mid:
            self.update(index, value, 2 * node, left, mid)
        else:
            self.update(index, value, 2 * node + 1, mid + 1, right)
        self.tree[node] = self.tree[2 * node] + self.tree[2 * node + 1]

tree = SegmentTree([1, 3, 5, 7, 9, 11])
print(tree.query(1, 3), tree.query(0, 5))
tree.update(1, 10)
print(tree.query(1, 3), tree.query(0, 5))
```
Output:
```text
15 36
22 43
```
### javascript
```javascript
class MinTree {
  constructor(values) {
    this.n = values.length;
    this.tree = new Array(2 * this.n).fill(Infinity);
    values.forEach((value, i) => {
      this.tree[this.n + i] = value;
    });
    for (let i = this.n - 1; i >= 1; i--) this.tree[i] = Math.min(this.tree[2 * i], this.tree[2 * i + 1]);
  }

  query(from, to) {
    let result = Infinity;
    for (let l = from + this.n, r = to + this.n + 1; l < r; l >>= 1, r >>= 1) {
      if (l & 1) result = Math.min(result, this.tree[l++]);
      if (r & 1) result = Math.min(result, this.tree[--r]);
    }
    return result;
  }
}

const tree = new MinTree([5, 2, 8, 1, 9, 3]);
console.log(tree.query(2, 5), tree.query(0, 2), tree.query(4, 4));
```
Output:
```text
1 2 9
```

## quiz
1. What does a range query return for a node fully inside the query range?
   - [ ] The identity value
   - [x] The node's stored value
   - [ ] Zero always
   - [ ] The sum of the leaves one by one
   > No deeper recursion is needed for it.
2. What should an out-of-range node return in a minimum query?
   - [ ] Zero
   - [x] Infinity, the identity of the minimum
   - [ ] Its stored value
   - [ ] Minus one
   > It must not affect the combination.
3. What is the cost of a point update?
   - [ ] O(n)
   - [x] O(log n)
   - [ ] O(1)
   - [ ] O(n log n)
   > One root to leaf path is recomputed.
4. What is the sum of indices 1 to 3 of 1, 3, 5, 7, 9, 11?
   - [ ] 12
   - [x] 15
   - [ ] 21
   - [ ] 9
   > It is 3 plus 5 plus 7.
