import { getAlgorithmSource } from './algorithmSources.js';

const BASE_TEMPLATES = {
  'linear-search': {
    name: 'Linear Search',
    lines: [
      '// Linear Search — scan each element until target is found',
      'function linearSearch(array, target):',
      '    // Iterate through every index in the array',
      '    for i from 0 to length(array) - 1:',
      '        // Compare current element with target',
      '        if array[i] == target:',
      '            // Target found — return its index',
      '            return i',
      '    // Target was not present in the array',
      '    return -1',
    ],
  },
  'binary-search': {
    name: 'Binary Search',
    lines: [
      '// Binary Search — requires a sorted array',
      'function binarySearch(array, target):',
      '    low = 0',
      '    high = length(array) - 1',
      '    while low <= high:',
      '        // Find the middle index',
      '        mid = floor((low + high) / 2)',
      '        if array[mid] == target:',
      '            return mid',
      '        // Target is in the right half',
      '        else if array[mid] < target:',
      '            low = mid + 1',
      '        // Target is in the left half',
      '        else:',
      '            high = mid - 1',
      '    return -1',
    ],
  },
  'jump-search': {
    name: 'Jump Search',
    lines: [
      '// Jump Search — block-based search on sorted array',
      'function jumpSearch(array, target):',
      '    n = length(array)',
      '    step = floor(sqrt(n))',
      '    prev = 0',
      '    // Jump ahead in blocks until value >= target',
      '    while array[min(step, n) - 1] < target:',
      '        prev = step',
      '        step += floor(sqrt(n))',
      '        if prev >= n: return -1',
      '    // Linear scan within the current block',
      '    for i from prev to min(step, n) - 1:',
      '        if array[i] == target: return i',
      '    return -1',
    ],
  },
  'interpolation-search': {
    name: 'Interpolation Search',
    lines: [
      '// Interpolation Search — estimate position in sorted array',
      'function interpolationSearch(array, target):',
      '    low = 0',
      '    high = length(array) - 1',
      '    while low <= high and target >= array[low] and target <= array[high]:',
      '        // Estimate probe index using interpolation formula',
      '        pos = low + ((target - array[low]) * (high - low)) / (array[high] - array[low])',
      '        if array[pos] == target: return pos',
      '        if array[pos] < target: low = pos + 1',
      '        else: high = pos - 1',
      '    return -1',
    ],
  },
  'ternary-search': {
    name: 'Ternary Search',
    lines: [
      '// Ternary Search — split the search range into three parts',
      'function ternarySearch(array, target):',
      '    low = 0',
      '    high = length(array) - 1',
      '    while low <= high:',
      '        third = (high - low) / 3',
      '        mid1 = low + third',
      '        mid2 = high - third',
      '        // Check both third-points against the target',
      '        if array[mid1] == target: return mid1',
      '        if array[mid2] == target: return mid2',
      '        // Narrow to whichever third contains the target',
      '        if target < array[mid1]: high = mid1 - 1',
      '        else if target > array[mid2]: low = mid2 + 1',
      '        else: low = mid1 + 1; high = mid2 - 1',
      '    return -1',
    ],
  },
  'exponential-search': {
    name: 'Exponential Search',
    lines: [
      '// Exponential Search — find a range, then binary search inside it',
      'function exponentialSearch(array, target):',
      '    if array[0] == target: return 0',
      '    // Grow the bound exponentially until it overshoots the target',
      '    bound = 1',
      '    while bound < length(array) and array[bound] <= target:',
      '        bound = bound * 2',
      '    low = bound / 2',
      '    high = min(bound, length(array) - 1)',
      '    // Binary search within the discovered range',
      '    while low <= high:',
      '        mid = floor((low + high) / 2)',
      '        if array[mid] == target: return mid',
      '        else if array[mid] < target: low = mid + 1',
      '        else: high = mid - 1',
      '    return -1',
    ],
  },
  'bubble-sort': {
    name: 'Bubble Sort',
    lines: [
      '// Bubble Sort — repeatedly swap adjacent out-of-order elements',
      'function bubbleSort(array):',
      '    n = length(array)',
      '    for i from 0 to n - 1:',
      '        for j from 0 to n - i - 2:',
      '            // Compare adjacent values',
      '            if array[j] > array[j + 1]:',
      '                // Swap adjacent values',
      '                swap(array[j], array[j + 1])',
      '    return array',
    ],
  },
  'selection-sort': {
    name: 'Selection Sort',
    lines: [
      '// Selection Sort — place smallest element at each position',
      'function selectionSort(array):',
      '    n = length(array)',
      '    for i from 0 to n - 1:',
      '        minIndex = i',
      '        for j from i + 1 to n - 1:',
      '            // Find minimum in unsorted portion',
      '            if array[j] < array[minIndex]: minIndex = j',
      '        // Swap minimum into position i',
      '        swap(array[i], array[minIndex])',
      '    return array',
    ],
  },
  'insertion-sort': {
    name: 'Insertion Sort',
    lines: [
      '// Insertion Sort — build sorted portion one element at a time',
      'function insertionSort(array):',
      '    for i from 1 to length(array) - 1:',
      '        key = array[i]',
      '        j = i - 1',
      '        // Shift larger elements to the right',
      '        while j >= 0 and array[j] > key:',
      '            array[j + 1] = array[j]',
      '            j = j - 1',
      '        // Insert key at correct position',
      '        array[j + 1] = key',
      '    return array',
    ],
  },
  'merge-sort': {
    name: 'Merge Sort',
    lines: [
      '// Merge Sort — divide array into halves, merge sorted parts',
      'function mergeSort(array):',
      '    if length(array) <= 1: return array',
      '    // Divide array into two halves',
      '    mid = floor(length(array) / 2)',
      '    left = mergeSort(array[0..mid])',
      '    right = mergeSort(array[mid..end])',
      '    return merge(left, right)',
      'function merge(left, right):',
      '    // Compare and merge two sorted arrays',
      '    while left and right not empty:',
      '        take smaller front element into result',
      '    return combined result',
    ],
  },
  'quick-sort': {
    name: 'Quick Sort',
    lines: [
      '// Quick Sort — partition around pivot, recurse on halves',
      'function quickSort(array, low, high):',
      '    if low < high:',
      '        // Choose pivot and partition array',
      '        pivotIndex = partition(array, low, high)',
      '        quickSort(array, low, pivotIndex - 1)',
      '        quickSort(array, pivotIndex + 1, high)',
      'function partition(array, low, high):',
      '    pivot = array[high]',
      '    i = low - 1',
      '    for j from low to high - 1:',
      '        if array[j] <= pivot:',
      '            i += 1; swap(array[i], array[j])',
      '    swap(array[i + 1], array[high])',
      '    return i + 1',
    ],
  },
  'heap-sort': {
    name: 'Heap Sort',
    lines: [
      '// Heap Sort — build max heap, repeatedly extract maximum',
      'function heapSort(array):',
      '    n = length(array)',
      '    // Build max heap from array',
      '    for i from floor(n/2) - 1 down to 0:',
      '        heapify(array, n, i)',
      '    for i from n - 1 down to 1:',
      '        swap(array[0], array[i])',
      '        heapify(array, i, 0)',
      '    return array',
    ],
  },
  'counting-sort': {
    name: 'Counting Sort',
    lines: [
      '// Counting Sort — count occurrences, then place by cumulative count',
      'function countingSort(array):',
      '    range = max(array) - min(array) + 1',
      '    count = new array of size range, filled with 0',
      '    // Count occurrences of each value',
      '    for each value in array: count[value - min(array)] += 1',
      '    // Convert counts to cumulative positions',
      '    for i from 1 to range - 1: count[i] += count[i - 1]',
      '    // Place each value at its final output position',
      '    for i from length(array) - 1 down to 0:',
      '        output[count[array[i] - min(array)] - 1] = array[i]',
      '        count[array[i] - min(array)] -= 1',
      '    return output',
    ],
  },
  'radix-sort': {
    name: 'Radix Sort',
    lines: [
      '// Radix Sort (LSD) — sort by each digit place, least significant first',
      'function radixSort(array):',
      '    maxValue = max(array)',
      '    exp = 1',
      '    // Repeat counting sort for each digit place',
      '    while maxValue / exp > 0:',
      '        // Stable counting sort keyed on digit (value / exp) % 10',
      '        countingSortByDigit(array, exp)',
      '        exp = exp * 10',
      '    return array',
    ],
  },
  'bucket-sort': {
    name: 'Bucket Sort',
    lines: [
      '// Bucket Sort — distribute into buckets, sort each, concatenate',
      'function bucketSort(array):',
      '    buckets = create empty buckets sized by range(array)',
      '    // Distribute each value into its bucket',
      '    for each value in array:',
      '        index = bucketIndexFor(value)',
      '        buckets[index].append(value)',
      '    // Sort each bucket individually',
      '    for each bucket in buckets:',
      '        sort(bucket)',
      '    // Concatenate buckets in order',
      '    return concatenate(buckets)',
    ],
  },
  'shell-sort': {
    name: 'Shell Sort',
    lines: [
      '// Shell Sort — gapped insertion sort, shrinking the gap each pass',
      'function shellSort(array):',
      '    gap = length(array) / 2',
      '    while gap > 0:',
      '        // Gapped insertion sort for this gap size',
      '        for i from gap to length(array) - 1:',
      '            temp = array[i]',
      '            j = i',
      '            // Shift elements that are gap apart and out of order',
      '            while j >= gap and array[j - gap] > temp:',
      '                array[j] = array[j - gap]',
      '                j = j - gap',
      '            array[j] = temp',
      '        gap = gap / 2',
      '    return array',
    ],
  },
  'tim-sort': {
    name: 'Tim Sort (simplified)',
    lines: [
      '// Tim Sort — insertion-sort small runs, then merge runs pairwise',
      'function timSort(array):',
      '    RUN = 32',
      '    // Sort every small run with insertion sort',
      '    for each run of size RUN in array:',
      '        insertionSort(run)',
      '    size = RUN',
      '    // Merge runs pairwise, doubling the merge size each pass',
      '    while size < length(array):',
      '        for each pair of adjacent runs of this size:',
      '            merge(runLeft, runRight)',
      '        size = size * 2',
      '    return array',
    ],
  },
  dfs: {
    name: 'Depth-First Search',
    lines: [
      '// DFS — explore as deep as possible before backtracking',
      'function dfs(graph, start):',
      '    visited = empty set',
      '    stack = [start]',
      '    while stack not empty:',
      '        // Visit next node from stack',
      '        node = stack.pop()',
      '        if node in visited: continue',
      '        mark node as visited',
      '        for each neighbor of node:',
      '            if neighbor not in visited:',
      '                stack.push(neighbor)',
      '    return visited',
    ],
  },
  bfs: {
    name: 'Breadth-First Search',
    lines: [
      '// BFS — explore level by level using a queue',
      'function bfs(graph, start):',
      '    visited = empty set',
      '    queue = [start]',
      '    visited.add(start)',
      '    while queue not empty:',
      '        // Dequeue and visit front node',
      '        node = queue.dequeue()',
      '        for each neighbor of node:',
      '            if neighbor not in visited:',
      '                visited.add(neighbor)',
      '                queue.enqueue(neighbor)',
      '    return visited',
    ],
  },
  dijkstra: {
    name: "Dijkstra's Algorithm",
    lines: [
      "// Dijkstra — shortest paths from source in weighted graph",
      'function dijkstra(graph, source):',
      '    // Initialize distances to infinity',
      '    dist[source] = 0',
      '    priorityQueue = all nodes by dist',
      '    while queue not empty:',
      '        // Extract node with minimum distance',
      '        u = queue.extractMin()',
      '        for each edge (u, v) with weight w:',
      '            // Relax edge if shorter path found',
      '            if dist[u] + w < dist[v]:',
      '                dist[v] = dist[u] + w',
      '    return dist',
    ],
  },
  'bellman-ford': {
    name: 'Bellman-Ford',
    lines: [
      '// Bellman-Ford — shortest paths, tolerates negative weights',
      'function bellmanFord(graph, source):',
      '    dist[source] = 0; dist[all others] = infinity',
      '    // Relax every edge V - 1 times',
      '    for i from 1 to numNodes - 1:',
      '        for each edge (u, v, weight) in graph:',
      '            // Relax edge if a shorter path is found',
      '            if dist[u] + weight < dist[v]:',
      '                dist[v] = dist[u] + weight',
      '    return dist',
    ],
  },
  'floyd-warshall': {
    name: 'Floyd-Warshall',
    lines: [
      '// Floyd-Warshall — all-pairs shortest paths via intermediate nodes',
      'function floydWarshall(graph):',
      '    dist = adjacency matrix of graph (infinity where no edge)',
      '    // Try every node k as an intermediate point',
      '    for k in nodes:',
      '        for i in nodes:',
      '            for j in nodes:',
      '                // Relax path i -> j through intermediate k',
      '                if dist[i][k] + dist[k][j] < dist[i][j]:',
      '                    dist[i][j] = dist[i][k] + dist[k][j]',
      '    return dist',
    ],
  },
  prim: {
    name: "Prim's MST",
    lines: [
      "// Prim's Algorithm — grow a minimum spanning tree from a start node",
      'function prim(graph, start):',
      '    inMST = {start}',
      '    mstEdges = []',
      '    // Repeat until every node is in the tree',
      '    while inMST does not contain all nodes:',
      '        // Find the cheapest edge crossing the MST boundary',
      '        edge = minimum-weight edge connecting inMST to outside',
      '        mstEdges.append(edge)',
      '        inMST.add(edge.otherEndpoint)',
      '    return mstEdges',
    ],
  },
  kruskal: {
    name: "Kruskal's MST",
    lines: [
      "// Kruskal's Algorithm — add cheapest edges that don't form a cycle",
      'function kruskal(graph):',
      '    sort edges by weight ascending',
      '    initialize Union-Find with each node in its own set',
      '    mstEdges = []',
      '    // Consider edges from cheapest to most expensive',
      '    for each edge (u, v, weight) in sorted edges:',
      '        // Only add the edge if it connects two different sets',
      '        if find(u) != find(v):',
      '            union(u, v)',
      '            mstEdges.append(edge)',
      '    return mstEdges',
    ],
  },
  'a-star': {
    name: 'A* Search',
    lines: [
      '// A* Search — best-first search guided by cost + heuristic',
      'function aStar(graph, start, goal):',
      '    openSet = {start}; gScore[start] = 0',
      '    // Explore the most promising node first',
      '    while openSet is not empty:',
      '        current = node in openSet with lowest f = g + heuristic',
      '        if current == goal: return reconstructPath(current)',
      '        openSet.remove(current)',
      '        // Relax each neighbor via the current node',
      '        for each neighbor via edge (current, neighbor, weight):',
      '            tentative = gScore[current] + weight',
      '            if tentative < gScore[neighbor]:',
      '                gScore[neighbor] = tentative',
      '                openSet.add(neighbor)',
      '    return failure',
    ],
  },
  'topological-sort': {
    name: 'Topological Sort',
    lines: [
      "// Topological Sort (Kahn's algorithm) — order respecting dependencies",
      'function topologicalSort(graph):',
      '    indegree = count of incoming edges for every node',
      '    queue = all nodes with indegree 0',
      '    order = []',
      '    // Repeatedly remove a node with no remaining dependencies',
      '    while queue is not empty:',
      '        node = queue.dequeue()',
      '        order.append(node)',
      '        // Removing node frees up its neighbors',
      '        for each neighbor of node:',
      '            indegree[neighbor] -= 1',
      '            if indegree[neighbor] == 0: queue.enqueue(neighbor)',
      '    return order',
    ],
  },
  'union-find': {
    name: 'Union Find',
    lines: [
      '// Union-Find (Disjoint Set) — track connected components with path compression',
      'function find(x):',
      '    if parent[x] != x: parent[x] = find(parent[x])',
      '    return parent[x]',
      'function union(a, b):',
      '    rootA = find(a); rootB = find(b)',
      '    // Only merge if they are in different sets',
      '    if rootA != rootB: parent[rootA] = rootB',
      'function processEdges(edges):',
      '    for each edge (u, v) in edges:',
      '        if find(u) != find(v): union(u, v)',
    ],
  },
  'scc-kosaraju': {
    name: 'Strongly Connected Components (Kosaraju)',
    lines: [
      "// Kosaraju's Algorithm — two-pass DFS to find strongly connected components",
      'function kosaraju(graph):',
      '    // Pass 1: DFS on the original graph, record finish order',
      '    for each unvisited node: dfs1(node) and push to finishStack on finish',
      '    transposed = reverse every edge in graph',
      '    // Pass 2: DFS on the transposed graph in reverse finish order',
      '    while finishStack is not empty:',
      '        node = finishStack.pop()',
      '        if node is unvisited in transposed:',
      '            component = dfs2(transposed, node)',
      '            record component as one SCC',
      '    return all components',
    ],
  },
  'bridges-tarjan': {
    name: 'Bridges (Tarjan)',
    lines: [
      "// Tarjan's Bridge-Finding — DFS with discovery and low-link values",
      'function findBridges(graph):',
      '    disc = low = empty maps; timer = 0',
      '    function dfs(u, parentEdge):',
      '        disc[u] = low[u] = timer; timer += 1',
      '        for each edge (u, v) that is not parentEdge:',
      '            if v is unvisited:',
      '                dfs(v, edge)',
      '                low[u] = min(low[u], low[v])',
      '                // No back edge from v\'s subtree reaches u or above',
      '                if low[v] > disc[u]: mark edge (u, v) as a bridge',
      '            else: low[u] = min(low[u], disc[v])',
      '    for each unvisited node: dfs(node, null)',
      '    return bridges',
    ],
  },
  'articulation-points': {
    name: 'Articulation Points (Tarjan)',
    lines: [
      "// Tarjan's Articulation Points — DFS with discovery and low-link values",
      'function findArticulationPoints(graph):',
      '    disc = low = empty maps; timer = 0',
      '    function dfs(u, parent):',
      '        disc[u] = low[u] = timer; timer += 1; children = 0',
      '        for each neighbor v of u where v != parent:',
      '            if v is unvisited:',
      '                children += 1',
      '                dfs(v, u)',
      '                low[u] = min(low[u], low[v])',
      '                // v cannot reach above u without going through u',
      '                if (parent != null and low[v] >= disc[u]) or (parent == null and children > 1):',
      '                    mark u as an articulation point',
      '            else: low[u] = min(low[u], disc[v])',
      '    return articulationPoints',
    ],
  },
  'bst-insert': {
    name: 'BST Insert',
    lines: [
      '// Binary Search Tree — insert maintaining BST property',
      'function insert(root, value):',
      '    if root is null: return new Node(value)',
      '    // Compare value with current node',
      '    if value < root.value:',
      '        // Go to left subtree',
      '        root.left = insert(root.left, value)',
      '    else if value > root.value:',
      '        // Go to right subtree',
      '        root.right = insert(root.right, value)',
      '    return root',
    ],
  },
  'avl-insert': {
    name: 'AVL Insert',
    lines: [
      '// AVL Tree — insert then rebalance if needed',
      'function avlInsert(node, value):',
      '    // Standard BST insert',
      '    if node is null: return new Node(value)',
      '    if value < node.value: node.left = avlInsert(node.left, value)',
      '    else: node.right = avlInsert(node.right, value)',
      '    // Update height and balance factor',
      '    balance = height(node.left) - height(node.right)',
      '    // Perform rotation to restore balance',
      '    if balance > 1: return rotateRight(node)',
      '    if balance < -1: return rotateLeft(node)',
      '    return node',
    ],
  },
  'trie-insert': {
    name: 'Trie Insert',
    lines: [
      '// Trie — insert word character by character',
      'function trieInsert(root, word):',
      '    node = root',
      '    for each character in word:',
      '        // Move to child or create new node',
      '        if character not in node.children:',
      '            node.children[character] = new TrieNode()',
      '        node = node.children[character]',
      '    // Mark end of word',
      '    node.isEndOfWord = true',
      '    return root',
    ],
  },
  heapify: {
    name: 'Binary Heap',
    lines: [
      '// Heapify — restore the max-heap property at a subtree root',
      'function heapify(array, n, i):',
      '    largest = i',
      '    left = 2 * i + 1',
      '    right = 2 * i + 2',
      '    // Find the largest among node, left child, right child',
      '    if left < n and array[left] > array[largest]: largest = left',
      '    if right < n and array[right] > array[largest]: largest = right',
      '    // Swap and recurse if the root was not already the largest',
      '    if largest != i:',
      '        swap(array[i], array[largest])',
      '        heapify(array, n, largest)',
    ],
  },
  'tree-inorder': {
    name: 'Inorder Traversal',
    lines: [
      '// Inorder Traversal — left subtree, node, right subtree',
      'function inorder(node, result):',
      '    if node is null: return',
      '    // Visit left subtree first',
      '    inorder(node.left, result)',
      '    // Then visit this node',
      '    result.append(node.value)',
      '    // Then visit right subtree',
      '    inorder(node.right, result)',
      '    return result',
    ],
  },
  'tree-preorder': {
    name: 'Preorder Traversal',
    lines: [
      '// Preorder Traversal — node, left subtree, right subtree',
      'function preorder(node, result):',
      '    if node is null: return',
      '    // Visit this node first',
      '    result.append(node.value)',
      '    // Then visit left subtree',
      '    preorder(node.left, result)',
      '    // Then visit right subtree',
      '    preorder(node.right, result)',
      '    return result',
    ],
  },
  'tree-postorder': {
    name: 'Postorder Traversal',
    lines: [
      '// Postorder Traversal — left subtree, right subtree, node',
      'function postorder(node, result):',
      '    if node is null: return',
      '    // Visit left subtree first',
      '    postorder(node.left, result)',
      '    // Then visit right subtree',
      '    postorder(node.right, result)',
      '    // Then visit this node last',
      '    result.append(node.value)',
      '    return result',
    ],
  },
  'level-order-bfs': {
    name: 'Level Order Traversal',
    lines: [
      '// Level Order Traversal — visit nodes level by level using a queue',
      'function levelOrder(root):',
      '    if root is null: return []',
      '    queue = [root]',
      '    result = []',
      '    // Dequeue, visit, and enqueue children',
      '    while queue is not empty:',
      '        node = queue.dequeue()',
      '        result.append(node.value)',
      '        if node.left: queue.enqueue(node.left)',
      '        if node.right: queue.enqueue(node.right)',
      '    return result',
    ],
  },
  'segment-tree-demo': {
    name: 'Segment Tree Range Query',
    lines: [
      '// Segment Tree — build bottom-up, then answer a range-sum query',
      'function build(values):',
      '    tree = array of size 2 * size(values)',
      '    // Leaves hold the original values',
      '    for i from 0 to length(values) - 1: tree[size + i] = values[i]',
      '    // Each internal node is the sum of its two children',
      '    for i from size - 1 down to 1: tree[i] = tree[2i] + tree[2i + 1]',
      '    return tree',
      'function query(tree, left, right):',
      '    // Combine only the O(log n) nodes covering [left, right]',
      '    return sumOverRange(tree, left, right)',
    ],
  },
  'fenwick-tree-demo': {
    name: 'Fenwick Tree (BIT)',
    lines: [
      '// Fenwick Tree (Binary Indexed Tree) — point update, prefix-sum query',
      'function update(tree, i, delta):',
      '    // Propagate the change to every ancestor via i += i & -i',
      '    while i <= n:',
      '        tree[i] += delta',
      '        i += i & (-i)',
      'function query(tree, i):',
      '    sum = 0',
      '    // Accumulate partial sums via i -= i & -i',
      '    while i > 0:',
      '        sum += tree[i]',
      '        i -= i & (-i)',
      '    return sum',
    ],
  },
};

const STRUCTURES_TEMPLATES = {
  'stack-operations': {
    name: 'Stack Operations',
    lines: [
      '// Stack — Last In, First Out (LIFO)',
      'function stackDemo(values):',
      '    stack = []',
      '    // Push every value onto the stack',
      '    for each value in values: stack.push(value)',
      '    // Pop values off until the stack is empty',
      '    while stack is not empty:',
      '        top = stack.peek()',
      '        stack.pop()',
      '    return "done"',
    ],
  },
  'queue-operations': {
    name: 'Queue Operations',
    lines: [
      '// Queue — First In, First Out (FIFO)',
      'function queueDemo(values):',
      '    queue = []',
      '    // Enqueue every value at the back',
      '    for each value in values: queue.enqueue(value)',
      '    // Dequeue values off the front until empty',
      '    while queue is not empty:',
      '        front = queue.peekFront()',
      '        queue.dequeue()',
      '    return "done"',
    ],
  },
  'linked-list-insert': {
    name: 'Linked List Insert',
    lines: [
      '// Linked List — insert each value at the tail',
      'function insertAtTail(head, value):',
      '    newNode = Node(value)',
      '    if head is null: return newNode',
      '    // Walk to the last node',
      '    current = head',
      '    while current.next is not null:',
      '        current = current.next',
      '    // Link the new node after it',
      '    current.next = newNode',
      '    return head',
    ],
  },
  'hash-linear-probing': {
    name: 'Hash Table (Linear Probing)',
    lines: [
      '// Hash Table — linear probing resolves collisions',
      'function insert(table, value):',
      '    index = hash(value) % tableSize',
      '    // Probe forward while the slot is occupied',
      '    while table[index] is not empty:',
      '        index = (index + 1) % tableSize',
      '    // Place the value in the first free slot found',
      '    table[index] = value',
      '    return table',
    ],
  },
  'monotonic-stack': {
    name: 'Monotonic Stack',
    lines: [
      '// Monotonic Stack — find the next greater element for each index',
      'function nextGreaterElements(array):',
      '    result = array filled with -1',
      '    stack = []  // holds indices, values kept decreasing',
      '    // Scan left to right, resolving smaller values on the way',
      '    for i from 0 to length(array) - 1:',
      '        while stack is not empty and array[stack.top] < array[i]:',
      '            // array[i] is the next greater element for stack.top',
      '            result[stack.pop()] = array[i]',
      '        stack.push(i)',
      '    return result',
    ],
  },
  'deque-sliding-window': {
    name: 'Deque Sliding Window Maximum',
    lines: [
      '// Deque Sliding Window Maximum — O(n) using a monotonic deque of indices',
      'function slidingWindowMax(array, k):',
      '    deque = []  // holds indices, values kept decreasing',
      '    result = []',
      '    for i from 0 to length(array) - 1:',
      '        // Drop indices that have fallen out of the window',
      '        while deque is not empty and deque.front <= i - k: deque.popFront()',
      '        // Drop smaller values — they can never be the max again',
      '        while deque is not empty and array[deque.back] <= array[i]: deque.popBack()',
      '        deque.pushBack(i)',
      '        if i >= k - 1: result.append(array[deque.front])',
      '    return result',
    ],
  },
  'two-pointer': {
    name: 'Two Pointer Technique',
    lines: [
      '// Two Pointer — scan from both ends of a sorted array toward the middle',
      'function twoPointer(array, target):',
      '    left = 0',
      '    right = length(array) - 1',
      '    // Move pointers inward based on the current sum',
      '    while left < right:',
      '        sum = array[left] + array[right]',
      '        if sum == target: return (left, right)',
      '        else if sum < target: left += 1',
      '        else: right -= 1',
      '    return (-1, -1)',
    ],
  },
  'sliding-window': {
    name: 'Sliding Window',
    lines: [
      '// Sliding Window — maintain a running window of fixed size k',
      'function slidingWindow(array, k):',
      '    results = []',
      '    // Slide the window one position at a time',
      '    for i from 0 to length(array) - k:',
      '        window = array[i .. i + k - 1]',
      '        // Compute the aggregate (e.g. max) for this window',
      '        results.append(aggregate(window))',
      '    return results',
    ],
  },
  'prefix-sum': {
    name: 'Prefix Sum',
    lines: [
      '// Prefix Sum — precompute running totals for O(1) range-sum queries',
      'function buildPrefixSum(array):',
      '    prefix = new array of length length(array)',
      '    running = 0',
      '    // Accumulate a running total as we scan',
      '    for i from 0 to length(array) - 1:',
      '        running += array[i]',
      '        prefix[i] = running',
      '    return prefix',
    ],
  },
  'greedy-activity': {
    name: 'Activity Selection (Greedy)',
    lines: [
      '// Activity Selection — greedily pick by earliest finish time',
      'function activitySelection(activities):',
      '    sort activities by finish time ascending',
      '    selected = [activities[0]]',
      '    lastFinish = activities[0].finish',
      '    // Only keep activities that start after the last one finished',
      '    for each activity in activities[1..]:',
      '        if activity.start >= lastFinish:',
      '            selected.append(activity)',
      '            lastFinish = activity.finish',
      '    return selected',
    ],
  },
  'backtracking-subsets': {
    name: 'Backtracking Subsets',
    lines: [
      '// Backtracking — generate all subsets via include/exclude recursion',
      'function subsets(array, index, current, result):',
      '    if index == length(array):',
      '        result.append(copy of current)',
      '        return',
      '    // Branch 1: include this element',
      '    current.append(array[index])',
      '    subsets(array, index + 1, current, result)',
      '    current.removeLast()',
      '    // Branch 2: exclude this element (backtrack)',
      '    subsets(array, index + 1, current, result)',
    ],
  },
  'kmp-search': {
    name: 'KMP Pattern Match',
    lines: [
      '// Knuth-Morris-Pratt — skip re-comparisons using a failure function',
      'function kmpSearch(text, pattern):',
      '    lps = buildFailureFunction(pattern)',
      '    i = 0; j = 0',
      '    while i < length(text):',
      '        // Advance both pointers while characters match',
      '        if text[i] == pattern[j]: i += 1; j += 1',
      '        if j == length(pattern): report match at i - j; j = lps[j - 1]',
      '        // Mismatch — fall back using the failure function, not i',
      '        else if i < length(text) and text[i] != pattern[j]:',
      '            if j != 0: j = lps[j - 1]',
      '            else: i += 1',
      '    return matches',
    ],
  },
  'rabin-karp': {
    name: 'Rabin-Karp',
    lines: [
      '// Rabin-Karp — compare rolling hashes before confirming a match',
      'function rabinKarp(text, pattern):',
      '    patternHash = hash(pattern)',
      '    windowHash = hash(text[0 .. length(pattern) - 1])',
      '    for i from 0 to length(text) - length(pattern):',
      '        // Only do a full comparison when hashes agree',
      '        if windowHash == patternHash and text[i..] matches pattern:',
      '            report match at i',
      '        // Roll the hash forward by one character',
      '        windowHash = roll(windowHash, text[i], text[i + length(pattern)])',
      '    return matches',
    ],
  },
};

const DP_TEMPLATES = {
  'fibonacci-dp': {
    name: 'Fibonacci (Memoization)',
    lines: [
      '// Fibonacci with Memoization — cache subproblem results',
      'function fib(n, memo):',
      '    if n <= 1: return n',
      '    // Reuse a cached result if we have already solved this subproblem',
      '    if memo[n] is set: return memo[n]',
      '    // Otherwise solve it from smaller subproblems and cache it',
      '    memo[n] = fib(n - 1, memo) + fib(n - 2, memo)',
      '    return memo[n]',
    ],
  },
  'knapsack-dp': {
    name: '0/1 Knapsack',
    lines: [
      '// 0/1 Knapsack — tabulate best value for each (item, capacity) pair',
      'function knapsack(weights, values, capacity):',
      '    dp = table of size (n + 1) x (capacity + 1), filled with 0',
      '    for i from 1 to n:',
      '        for w from 0 to capacity:',
      '            // Take the item only if it fits',
      '            if weights[i-1] <= w:',
      '                dp[i][w] = max(dp[i-1][w], dp[i-1][w-weights[i-1]] + values[i-1])',
      '            else: dp[i][w] = dp[i-1][w]',
      '    return dp[n][capacity]',
    ],
  },
  'coin-change-dp': {
    name: 'Coin Change',
    lines: [
      '// Coin Change — minimum coins to make each amount up to the target',
      'function coinChange(coins, amount):',
      '    dp = array of size amount + 1, filled with infinity',
      '    dp[0] = 0',
      '    for a from 1 to amount:',
      '        // Try every coin and keep the best (minimum) result',
      '        for each coin in coins:',
      '            if coin <= a: dp[a] = min(dp[a], dp[a - coin] + 1)',
      '    return dp[amount]',
    ],
  },
  'lis-dp': {
    name: 'Longest Increasing Subsequence',
    lines: [
      '// Longest Increasing Subsequence — O(n^2) tabulation',
      'function lis(array):',
      '    dp = array of 1s, same length as array',
      '    for i from 1 to length(array) - 1:',
      '        for j from 0 to i - 1:',
      '            // Extend the LIS ending at j if it keeps increasing',
      '            if array[j] < array[i]: dp[i] = max(dp[i], dp[j] + 1)',
      '    return max(dp)',
    ],
  },
  'bitmask-dp': {
    name: 'Bitmask DP (subset-sum bitset)',
    lines: [
      '// Bitmask DP — track achievable subset sums as bits of an integer',
      'function achievableSums(array):',
      '    dp = 1  // bit 0 (sum 0) is always achievable',
      '    // Each number ORs in every previously-achievable sum plus itself',
      '    for each num in array:',
      '        dp = dp | (dp << num)',
      '    // Bit s of dp is set if some subset sums to s',
      '    return dp',
    ],
  },
  'edit-distance-dp': {
    name: 'Edit Distance',
    lines: [
      '// Edit Distance (Levenshtein) — min insert/delete/replace to transform word1 -> word2',
      'function editDistance(word1, word2):',
      '    dp = table of size (m+1) x (n+1)',
      '    for i from 0 to m: dp[i][0] = i',
      '    for j from 0 to n: dp[0][j] = j',
      '    for i from 1 to m:',
      '        for j from 1 to n:',
      '            if word1[i-1] == word2[j-1]: dp[i][j] = dp[i-1][j-1]',
      '            // Otherwise take the cheapest of delete, insert, replace',
      '            else: dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])',
      '    return dp[m][n]',
    ],
  },
};

const GENERIC_TEMPLATES = {
  searching: [
    '// Search algorithm',
    'function search(array, target):',
    '    // Initialize search boundaries',
    '    initialize pointers and state',
    '    while search continues:',
    '        // Inspect current candidate element',
    '        compare or probe current position',
    '        if target found: return index',
    '        // Move search window forward',
    '        update search boundaries',
    '    return -1',
  ],
  sorting: [
    '// Sorting algorithm',
    'function sort(array):',
    '    n = length(array)',
    '    // Outer loop over passes or partitions',
    '    for each pass or partition:',
    '        // Compare elements in current window',
    '        if out of order: swap elements',
    '        // Merge, insert, or heapify as needed',
    '        update sorted portion',
    '    return sorted array',
  ],
  trees: [
    '// Tree algorithm',
    'function treeOperation(root, value):',
    '    if root is null: handle base case',
    '    // Traverse or compare at current node',
    '    process current node',
    '    // Recurse into left or right subtree',
    '    update child pointers',
    '    // Rebalance or mark if needed',
    '    return updated root',
  ],
  graphs: [
    '// Graph algorithm',
    'function graphAlgorithm(graph, start):',
    '    // Initialize visited set and distances',
    '    initialize state structures',
    '    while nodes or edges remain:',
    '        // Visit or relax next node/edge',
    '        process current node',
    '        // Update neighbors or queue',
    '        enqueue or relax adjacent nodes',
    '    return result',
  ],
};

const LANGUAGE_TRANSFORMS = {
  python: (lines) =>
    lines.map((line) =>
      line
        .replace(/^function (\w+)\((.*?)\):/, 'def $1($2):')
        .replace(/^    for i from (\d+) to (.+):/, '    for i in range($1, $2 + 1):')
        .replace(/^    for j from (.+) to (.+):/, '    for j in range($1, $2 + 1):')
        .replace(/^    for each (.+) in (.+):/, '    for $1 in $2:')
        .replace(/^    while (.+):/, '    while $1:')
        .replace(/^    if (.+):/, '    if $1:')
        .replace(/^    else if (.+):/, '    elif $1:')
        .replace(/^    else:/, '    else:')
        .replace(/^    return (.+)/, '    return $1')
        .replace(/^    (.+) = (.+)/, '    $1 = $2')
        .replace(/^function (\w+)\((.*?)\):$/, 'def $1($2):')
    ),
  javascript: (lines) =>
    lines.map((line) =>
      line
        .replace(/^function (\w+)\((.*?)\):/, 'function $1($2) {')
        .replace(/^    for i from (\d+) to (.+):/, '  for (let i = $1; i <= $2; i++) {')
        .replace(/^    for j from (.+) to (.+):/, '  for (let j = $1; j <= $2; j++) {')
        .replace(/^    for each (.+) in (.+):/, '  for (const $1 of $2) {')
        .replace(/^    while (.+):/, '  while ($1) {')
        .replace(/^    if (.+):/, '  if ($1) {')
        .replace(/^    else if (.+):/, '  } else if ($1) {')
        .replace(/^    else:/, '  } else {')
        .replace(/^    return (.+)/, '  return $1;')
        .replace(/^    (.+) = (.+)/, '  $1 = $2;')
    ),
  java: (lines) =>
    lines.map((line, i) => {
      if (i === 0) return line.replace('//', '//');
      if (line.startsWith('function ')) {
        const match = line.match(/^function (\w+)\((.*?)\):/);
        if (match) return `    public static int ${match[1]}(${match[2].replace(/array/g, 'int[] arr')}) {`;
      }
      return `        ${line.replace(/^    /, '').replace(/:$/, ' {').replace(/^if /, 'if (').replace(/^while /, 'while (')}`;
    }),
  c: (lines) =>
    lines.map((line, i) => {
      if (i === 0) return line;
      if (line.startsWith('function ')) {
        const match = line.match(/^function (\w+)\((.*?)\):/);
        if (match) return `int ${match[1]}(${match[2]}) {`;
      }
      return `    ${line.replace(/^    /, '').replace(/:$/, ' {')};`;
    }),
  cpp: (lines) =>
    LANGUAGE_TRANSFORMS.c(lines).map((l) => l.replace(/^int /, 'auto ')),
  csharp: (lines) =>
    lines.map((line) => {
      if (line.startsWith('function ')) {
        const match = line.match(/^function (\w+)\((.*?)\):/);
        if (match) return `    static int ${match[1]}(${match[2]}) {`;
      }
      return line.replace(/^    /, '        ');
    }),
  go: (lines) =>
    lines.map((line) => {
      if (line.startsWith('function ')) {
        const match = line.match(/^function (\w+)\((.*?)\):/);
        if (match) return `func ${match[1]}(${match[2]}) int {`;
      }
      return line.replace(/^    /, '\t');
    }),
  rust: (lines) =>
    lines.map((line) => {
      if (line.startsWith('function ')) {
        const match = line.match(/^function (\w+)\((.*?)\):/);
        if (match) return `fn ${match[1]}(${match[2]}) -> i32 {`;
      }
      return line.replace(/^    /, '    ');
    }),
  kotlin: (lines) =>
    lines.map((line) => {
      if (line.startsWith('function ')) {
        const match = line.match(/^function (\w+)\((.*?)\):/);
        if (match) return `fun ${match[1]}(${match[2]}): Int {`;
      }
      return line.replace(/^    /, '    ');
    }),
};

export const transformPseudocodeLines = (lines, language = 'pseudocode') => {
  if (language === 'pseudocode') {
    return lines;
  }

  if (LANGUAGE_TRANSFORMS[language]) {
    return LANGUAGE_TRANSFORMS[language](lines);
  }

  return lines;
};

const ALL_PSEUDOCODE_TEMPLATES = { ...BASE_TEMPLATES, ...STRUCTURES_TEMPLATES, ...DP_TEMPLATES };

export const getAlgorithmCode = (algorithmId, language = 'python', category = 'sorting') => {
  const base = ALL_PSEUDOCODE_TEMPLATES[algorithmId] ?? {
    name: algorithmId,
    lines: GENERIC_TEMPLATES[category] ?? GENERIC_TEMPLATES.sorting,
  };

  const source =
    language === 'pseudocode'
      ? base.lines.join('\n')
      : getAlgorithmSource(algorithmId, language, category, base.name, base.lines);

  const lineCount = source.split('\n').length;

  return {
    algorithmId,
    language,
    name: base.name,
    source,
    lineCount,
  };
};

export const getStepCodeExplanation = (step, algorithmName) => {
  if (step?.explanation && typeof step.explanation === 'object') {
    return step.explanation;
  }
  if (step?.currentExplanation && typeof step.currentExplanation === 'object') {
    return step.currentExplanation;
  }

  const desc = step?.description ?? 'Executing algorithm step.';
  const vars = step?.variables ?? step?.currentVariables ?? {};
  const varSummary = Object.entries(vars)
    .filter(([key]) => !['array', 'distances'].includes(key))
    .slice(0, 4)
    .map(([key, val]) => `${key} = ${val}`)
    .join(', ');

  return {
    what: desc,
    why: varSummary
      ? `This step updates ${algorithmName} state (${varSummary}) to progress toward the correct result.`
      : `This step advances the ${algorithmName} algorithm toward its goal by updating the internal state based on the current data.`,
    how: 'The highlighted line performs the operation described in the step message.',
    when: 'This runs whenever the algorithm reaches this point in its execution flow.',
  };
};

export { ALL_PSEUDOCODE_TEMPLATES };

export default { getAlgorithmCode, getStepCodeExplanation, BASE_TEMPLATES, ALL_PSEUDOCODE_TEMPLATES };
