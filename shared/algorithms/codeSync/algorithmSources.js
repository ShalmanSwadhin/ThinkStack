/**
 * Multi-language source code for visualizer algorithms.
 * Every algorithm has implementations in C, C++, Java, Python, and JavaScript.
 */

const LANGS = ['c', 'cpp', 'java', 'python', 'javascript'];

const SEARCHING = {
  'linear-search': {
    python: `# Linear Search — scan each element until target is found
def linear_search(arr, target):
    # Iterate through every index in the array
    for i in range(len(arr)):
        # Compare current element with the target value
        if arr[i] == target:
            # Target found — return its index immediately
            return i
    # Exhausted all elements without a match
    return -1`,
    javascript: `// Linear Search — scan each element until target is found
function linearSearch(arr, target) {
  // Iterate through every index in the array
  for (let i = 0; i < arr.length; i++) {
    // Compare current element with the target value
    if (arr[i] === target) {
      // Target found — return its index immediately
      return i;
    }
  }
  // Exhausted all elements without a match
  return -1;
}`,
    c: `// Linear Search — scan each element until target is found
#include <stdio.h>

int linear_search(int arr[], int n, int target) {
    // Iterate through every index in the array
    for (int i = 0; i < n; i++) {
        // Compare current element with the target value
        if (arr[i] == target) {
            // Target found — return its index immediately
            return i;
        }
    }
    // Exhausted all elements without a match
    return -1;
}`,
    cpp: `// Linear Search — scan each element until target is found
#include <vector>

int linearSearch(const std::vector<int>& arr, int target) {
    // Iterate through every index in the array
    for (int i = 0; i < (int)arr.size(); i++) {
        // Compare current element with the target value
        if (arr[i] == target) {
            // Target found — return its index immediately
            return i;
        }
    }
    // Exhausted all elements without a match
    return -1;
}`,
    java: `// Linear Search — scan each element until target is found
public class LinearSearch {
    public static int linearSearch(int[] arr, int target) {
        // Iterate through every index in the array
        for (int i = 0; i < arr.length; i++) {
            // Compare current element with the target value
            if (arr[i] == target) {
                // Target found — return its index immediately
                return i;
            }
        }
        // Exhausted all elements without a match
        return -1;
    }
}`,
  },
  'binary-search': {
    python: `# Binary Search — requires a sorted array
def binary_search(arr, target):
    # Initialize search boundaries
    low, high = 0, len(arr) - 1
    while low <= high:
        # Compute middle index to split search space in half
        mid = (low + high) // 2
        # Check if middle element is the target
        if arr[mid] == target:
            return mid
        # Target lies in the right half — discard left
        elif arr[mid] < target:
            low = mid + 1
        # Target lies in the left half — discard right
        else:
            high = mid - 1
    # Target not present in the sorted array
    return -1`,
    javascript: `// Binary Search — requires a sorted array
function binarySearch(arr, target) {
  // Initialize search boundaries
  let low = 0, high = arr.length - 1;
  while (low <= high) {
    // Compute middle index to split search space in half
    const mid = Math.floor((low + high) / 2);
    // Check if middle element is the target
    if (arr[mid] === target) return mid;
    // Target lies in the right half — discard left
    else if (arr[mid] < target) low = mid + 1;
    // Target lies in the left half — discard right
    else high = mid - 1;
  }
  // Target not present in the sorted array
  return -1;
}`,
    c: `// Binary Search — requires a sorted array
int binary_search(int arr[], int n, int target) {
    // Initialize search boundaries
    int low = 0, high = n - 1;
    while (low <= high) {
        // Compute middle index to split search space in half
        int mid = low + (high - low) / 2;
        // Check if middle element is the target
        if (arr[mid] == target) return mid;
        // Target lies in the right half — discard left
        else if (arr[mid] < target) low = mid + 1;
        // Target lies in the left half — discard right
        else high = mid - 1;
    }
    // Target not present in the sorted array
    return -1;
}`,
    cpp: `// Binary Search — requires a sorted array
int binarySearch(const std::vector<int>& arr, int target) {
    // Initialize search boundaries
    int low = 0, high = (int)arr.size() - 1;
    while (low <= high) {
        // Compute middle index to split search space in half
        int mid = low + (high - low) / 2;
        // Check if middle element is the target
        if (arr[mid] == target) return mid;
        // Target lies in the right half — discard left
        else if (arr[mid] < target) low = mid + 1;
        // Target lies in the left half — discard right
        else high = mid - 1;
    }
    // Target not present in the sorted array
    return -1;
}`,
    java: `// Binary Search — requires a sorted array
public class BinarySearch {
    public static int binarySearch(int[] arr, int target) {
        // Initialize search boundaries
        int low = 0, high = arr.length - 1;
        while (low <= high) {
            // Compute middle index to split search space in half
            int mid = low + (high - low) / 2;
            // Check if middle element is the target
            if (arr[mid] == target) return mid;
            // Target lies in the right half — discard left
            else if (arr[mid] < target) low = mid + 1;
            // Target lies in the left half — discard right
            else high = mid - 1;
        }
        // Target not present in the sorted array
        return -1;
    }
}`,
  },
};

const SORTING = {
  'bubble-sort': {
    python: `# Bubble Sort — repeatedly swap adjacent out-of-order elements
def bubble_sort(arr):
    n = len(arr)
    # Outer loop: each pass places one element in final position
    for i in range(n - 1):
        # Inner loop: compare adjacent pairs in unsorted portion
        for j in range(n - i - 1):
            # Swap if left element is greater than right
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`,
    javascript: `// Bubble Sort — repeatedly swap adjacent out-of-order elements
function bubbleSort(arr) {
  const n = arr.length;
  // Outer loop: each pass places one element in final position
  for (let i = 0; i < n - 1; i++) {
    // Inner loop: compare adjacent pairs in unsorted portion
    for (let j = 0; j < n - i - 1; j++) {
      // Swap if left element is greater than right
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
    c: `// Bubble Sort — repeatedly swap adjacent out-of-order elements
void bubble_sort(int arr[], int n) {
    // Outer loop: each pass places one element in final position
    for (int i = 0; i < n - 1; i++) {
        // Inner loop: compare adjacent pairs in unsorted portion
        for (int j = 0; j < n - i - 1; j++) {
            // Swap if left element is greater than right
            if (arr[j] > arr[j + 1]) {
                int tmp = arr[j]; arr[j] = arr[j + 1]; arr[j + 1] = tmp;
            }
        }
    }
}`,
    cpp: `// Bubble Sort — repeatedly swap adjacent out-of-order elements
void bubbleSort(std::vector<int>& arr) {
    int n = arr.size();
    // Outer loop: each pass places one element in final position
    for (int i = 0; i < n - 1; i++) {
        // Inner loop: compare adjacent pairs in unsorted portion
        for (int j = 0; j < n - i - 1; j++) {
            // Swap if left element is greater than right
            if (arr[j] > arr[j + 1]) std::swap(arr[j], arr[j + 1]);
        }
    }
}`,
    java: `// Bubble Sort — repeatedly swap adjacent out-of-order elements
public class BubbleSort {
    public static void bubbleSort(int[] arr) {
        int n = arr.length;
        // Outer loop: each pass places one element in final position
        for (int i = 0; i < n - 1; i++) {
            // Inner loop: compare adjacent pairs in unsorted portion
            for (int j = 0; j < n - i - 1; j++) {
                // Swap if left element is greater than right
                if (arr[j] > arr[j + 1]) {
                    int tmp = arr[j]; arr[j] = arr[j + 1]; arr[j + 1] = tmp;
                }
            }
        }
    }
}`,
  },
  'merge-sort': {
    python: `# Merge Sort — divide array into halves, merge sorted parts
def merge_sort(arr):
    # Base case: single element is already sorted
    if len(arr) <= 1:
        return arr
    # Divide array into two halves
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    # Merge the two sorted halves
    return merge(left, right)

def merge(left, right):
    result, i, j = [], 0, 0
    # Compare front elements and take the smaller one
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i]); i += 1
        else:
            result.append(right[j]); j += 1
    return result + left[i:] + right[j:]`,
    javascript: `// Merge Sort — divide array into halves, merge sorted parts
function mergeSort(arr) {
  // Base case: single element is already sorted
  if (arr.length <= 1) return arr;
  // Divide array into two halves
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  // Merge the two sorted halves
  return merge(left, right);
}

function merge(left, right) {
  const result = []; let i = 0, j = 0;
  // Compare front elements and take the smaller one
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) result.push(left[i++]);
    else result.push(right[j++]);
  }
  return result.concat(left.slice(i), right.slice(j));
}`,
    c: `// Merge Sort — divide and conquer with merge step
void merge(int arr[], int l, int m, int r) {
    // Copy halves into temp arrays, merge back in sorted order
    int n1 = m - l + 1, n2 = r - m;
    int L[n1], R[n2];
    for (int i = 0; i < n1; i++) L[i] = arr[l + i];
    for (int j = 0; j < n2; j++) R[j] = arr[m + 1 + j];
    int i = 0, j = 0, k = l;
    // Compare front elements and take the smaller one
    while (i < n1 && j < n2)
        arr[k++] = (L[i] <= R[j]) ? L[i++] : R[j++];
    while (i < n1) arr[k++] = L[i++];
    while (j < n2) arr[k++] = R[j++];
}`,
    cpp: `// Merge Sort — divide array into halves, merge sorted parts
void merge(std::vector<int>& arr, int l, int m, int r) {
    std::vector<int> L(arr.begin() + l, arr.begin() + m + 1);
    std::vector<int> R(arr.begin() + m + 1, arr.begin() + r + 1);
    int i = 0, j = 0, k = l;
    // Compare front elements and take the smaller one
    while (i < (int)L.size() && j < (int)R.size())
        arr[k++] = (L[i] <= R[j]) ? L[i++] : R[j++];
    while (i < (int)L.size()) arr[k++] = L[i++];
    while (j < (int)R.size()) arr[k++] = R[j++];
}`,
    java: `// Merge Sort — divide array into halves, merge sorted parts
public class MergeSort {
    static void merge(int[] arr, int l, int m, int r) {
        int[] L = java.util.Arrays.copyOfRange(arr, l, m + 1);
        int[] R = java.util.Arrays.copyOfRange(arr, m + 1, r + 1);
        int i = 0, j = 0, k = l;
        // Compare front elements and take the smaller one
        while (i < L.length && j < R.length)
            arr[k++] = (L[i] <= R[j]) ? L[i++] : R[j++];
        while (i < L.length) arr[k++] = L[i++];
        while (j < R.length) arr[k++] = R[j++];
    }
}`,
  },
  'quick-sort': {
    python: `# Quick Sort — partition around pivot, recurse on halves
def quick_sort(arr, low, high):
    if low < high:
        # Partition array and get pivot's final index
        pivot = partition(arr, low, high)
        # Recursively sort left and right partitions
        quick_sort(arr, low, pivot - 1)
        quick_sort(arr, pivot + 1, high)

def partition(arr, low, high):
    pivot = arr[high]  # Choose last element as pivot
    i = low - 1
    for j in range(low, high):
        # Move elements smaller than pivot to the left
        if arr[j] <= pivot:
            i += 1; arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1`,
    javascript: `// Quick Sort — partition around pivot, recurse on halves
function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    // Partition array and get pivot's final index
    const pivot = partition(arr, low, high);
    // Recursively sort left and right partitions
    quickSort(arr, low, pivot - 1);
    quickSort(arr, pivot + 1, high);
  }
  return arr;
}

function partition(arr, low, high) {
  const pivot = arr[high]; // Choose last element as pivot
  let i = low - 1;
  for (let j = low; j < high; j++) {
    // Move elements smaller than pivot to the left
    if (arr[j] <= pivot) { i++; [arr[i], arr[j]] = [arr[j], arr[i]]; }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}`,
    c: `// Quick Sort — partition around pivot, recurse on halves
int partition(int arr[], int low, int high) {
    int pivot = arr[high]; // Choose last element as pivot
    int i = low - 1;
    for (int j = low; j < high; j++) {
        // Move elements smaller than pivot to the left
        if (arr[j] <= pivot) { i++; int t=arr[i]; arr[i]=arr[j]; arr[j]=t; }
    }
    int t=arr[i+1]; arr[i+1]=arr[high]; arr[high]=t;
    return i + 1;
}`,
    cpp: `// Quick Sort — partition around pivot, recurse on halves
int partition(std::vector<int>& arr, int low, int high) {
    int pivot = arr[high]; // Choose last element as pivot
    int i = low - 1;
    for (int j = low; j < high; j++) {
        // Move elements smaller than pivot to the left
        if (arr[j] <= pivot) std::swap(arr[++i], arr[j]);
    }
    std::swap(arr[i + 1], arr[high]);
    return i + 1;
}`,
    java: `// Quick Sort — partition around pivot, recurse on halves
public class QuickSort {
    static int partition(int[] arr, int low, int high) {
        int pivot = arr[high]; // Choose last element as pivot
        int i = low - 1;
        for (int j = low; j < high; j++) {
            // Move elements smaller than pivot to the left
            if (arr[j] <= pivot) { i++; int t=arr[i]; arr[i]=arr[j]; arr[j]=t; }
        }
        int t=arr[i+1]; arr[i+1]=arr[high]; arr[high]=t;
        return i + 1;
    }
}`,
  },
};

const GRAPHS = {
  dfs: {
    python: `# DFS — explore as deep as possible before backtracking
def dfs(graph, start):
    visited = set()
    stack = [start]
    while stack:
        # Pop and visit the next node from stack
        node = stack.pop()
        if node in visited:
            continue
        visited.add(node)
        # Push unvisited neighbors onto stack
        for neighbor in graph[node]:
            if neighbor not in visited:
                stack.append(neighbor)
    return visited`,
    javascript: `// DFS — explore as deep as possible before backtracking
function dfs(graph, start) {
  const visited = new Set();
  const stack = [start];
  while (stack.length) {
    // Pop and visit the next node from stack
    const node = stack.pop();
    if (visited.has(node)) continue;
    visited.add(node);
    // Push unvisited neighbors onto stack
    for (const neighbor of graph[node] ?? []) {
      if (!visited.has(neighbor)) stack.push(neighbor);
    }
  }
  return visited;
}`,
    c: `// DFS — explore as deep as possible before backtracking
void dfs(int graph[][MAX], int n, int start, int visited[]) {
    visited[start] = 1;
    // Visit each unvisited neighbor recursively
    for (int v = 0; v < n; v++)
        if (graph[start][v] && !visited[v])
            dfs(graph, n, v, visited);
}`,
    cpp: `// DFS — explore as deep as possible before backtracking
void dfs(const std::vector<std::vector<int>>& g, int u, std::vector<bool>& vis) {
    vis[u] = true;
    // Visit each unvisited neighbor recursively
    for (int v : g[u])
        if (!vis[v]) dfs(g, v, vis);
}`,
    java: `// DFS — explore as deep as possible before backtracking
public class DFS {
    static void dfs(List<List<Integer>> g, int u, boolean[] vis) {
        vis[u] = true;
        // Visit each unvisited neighbor recursively
        for (int v : g.get(u))
            if (!vis[v]) dfs(g, v, vis);
    }
}`,
  },
  bfs: {
    python: `# BFS — explore level by level using a queue
from collections import deque

def bfs(graph, start):
    visited = {start}
    queue = deque([start])
    while queue:
        # Dequeue and visit front node
        node = queue.popleft()
        # Enqueue unvisited neighbors
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return visited`,
    javascript: `// BFS — explore level by level using a queue
function bfs(graph, start) {
  const visited = new Set([start]);
  const queue = [start];
  while (queue.length) {
    // Dequeue and visit front node
    const node = queue.shift();
    // Enqueue unvisited neighbors
    for (const neighbor of graph[node] ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return visited;
}`,
    c: `// BFS — explore level by level using a queue
void bfs(int graph[][MAX], int n, int start, int visited[]) {
    int queue[MAX], front = 0, rear = 0;
    queue[rear++] = start; visited[start] = 1;
    while (front < rear) {
        // Dequeue and visit front node
        int u = queue[front++];
        // Enqueue unvisited neighbors
        for (int v = 0; v < n; v++)
            if (graph[u][v] && !visited[v]) {
                visited[v] = 1; queue[rear++] = v;
            }
    }
}`,
    cpp: `// BFS — explore level by level using a queue
void bfs(const std::vector<std::vector<int>>& g, int start, std::vector<bool>& vis) {
    std::queue<int> q; q.push(start); vis[start] = true;
    while (!q.empty()) {
        // Dequeue and visit front node
        int u = q.front(); q.pop();
        // Enqueue unvisited neighbors
        for (int v : g[u])
            if (!vis[v]) { vis[v] = true; q.push(v); }
    }
}`,
    java: `// BFS — explore level by level using a queue
public class BFS {
    static void bfs(List<List<Integer>> g, int start, boolean[] vis) {
        Queue<Integer> q = new ArrayDeque<>();
        q.add(start); vis[start] = true;
        while (!q.isEmpty()) {
            // Dequeue and visit front node
            int u = q.poll();
            // Enqueue unvisited neighbors
            for (int v : g.get(u))
                if (!vis[v]) { vis[v] = true; q.add(v); }
        }
    }
}`,
  },
  dijkstra: {
    python: `# Dijkstra — shortest paths from source in weighted graph
import heapq

def dijkstra(graph, source):
    # Initialize all distances to infinity except source
    dist = {v: float('inf') for v in graph}
    dist[source] = 0
    pq = [(0, source)]
    while pq:
        # Extract node with minimum distance
        d, u = heapq.heappop(pq)
        if d > dist[u]: continue
        for v, w in graph[u]:
            # Relax edge if shorter path found
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                heapq.heappush(pq, (dist[v], v))
    return dist`,
    javascript: `// Dijkstra — shortest paths from source in weighted graph
function dijkstra(graph, source) {
  // Initialize all distances to infinity except source
  const dist = Object.fromEntries(Object.keys(graph).map(k => [k, Infinity]));
  dist[source] = 0;
  const pq = [[0, source]];
  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    // Extract node with minimum distance
    const [d, u] = pq.shift();
    if (d > dist[u]) continue;
    for (const [v, w] of graph[u] ?? []) {
      // Relax edge if shorter path found
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        pq.push([dist[v], v]);
      }
    }
  }
  return dist;
}`,
    c: `// Dijkstra — shortest paths from source in weighted graph
void dijkstra(int n, int edges[][3], int source, int dist[]) {
    // Initialize all distances to infinity except source
    for (int i = 0; i < n; i++) dist[i] = INT_MAX;
    dist[source] = 0;
    // Repeatedly relax edges from closest unvisited node
    for (int count = 0; count < n - 1; count++) {
        int u = min_dist_node(dist, visited, n);
        visited[u] = 1;
        // Relax all edges from u
        relax_edges(u, edges, dist);
    }
}`,
    cpp: `// Dijkstra — shortest paths from source in weighted graph
std::vector<int> dijkstra(int n, const std::vector<std::vector<std::pair<int,int>>>& g, int src) {
    // Initialize all distances to infinity except source
    std::vector<int> dist(n, INT_MAX);
    dist[src] = 0;
    using P = std::pair<int,int>;
    std::priority_queue<P, std::vector<P>, std::greater<P>> pq;
    pq.push({0, src});
    while (!pq.empty()) {
        // Extract node with minimum distance
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;
        for (auto [v, w] : g[u])
            // Relax edge if shorter path found
            if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; pq.push({dist[v], v}); }
    }
    return dist;
}`,
    java: `// Dijkstra — shortest paths from source in weighted graph
public class Dijkstra {
    static int[] dijkstra(int n, List<List<int[]>> g, int src) {
        // Initialize all distances to infinity except source
        int[] dist = new int[n]; java.util.Arrays.fill(dist, Integer.MAX_VALUE);
        dist[src] = 0;
        PriorityQueue<int[]> pq = new PriorityQueue<>((a,b)->a[0]-b[0]);
        pq.add(new int[]{0, src});
        while (!pq.isEmpty()) {
            // Extract node with minimum distance
            int[] cur = pq.poll(); int d = cur[0], u = cur[1];
            if (d > dist[u]) continue;
            for (int[] e : g.get(u)) {
                // Relax edge if shorter path found
                if (dist[u] + e[1] < dist[e[0]]) { dist[e[0]] = dist[u] + e[1]; pq.add(new int[]{dist[e[0]], e[0]}); }
            }
        }
        return dist;
    }
}`,
  },
};

const TREES = {
  'bst-insert': {
    python: `# BST Insert — maintain left < node < right ordering
class Node:
    def __init__(self, val):
        self.val = val; self.left = self.right = None

def insert(root, val):
    # Base case: create new node at empty position
    if not root: return Node(val)
    # Recurse left if value is smaller
    if val < root.val: root.left = insert(root.left, val)
    # Recurse right if value is larger
    elif val > root.val: root.right = insert(root.right, val)
    return root`,
    javascript: `// BST Insert — maintain left < node < right ordering
class Node { constructor(val) { this.val = val; this.left = this.right = null; } }

function insert(root, val) {
  // Base case: create new node at empty position
  if (!root) return new Node(val);
  // Recurse left if value is smaller
  if (val < root.val) root.left = insert(root.left, val);
  // Recurse right if value is larger
  else if (val > root.val) root.right = insert(root.right, val);
  return root;
}`,
    c: `// BST Insert — maintain left < node < right ordering
struct Node { int val; struct Node *left, *right; };

struct Node* insert(struct Node* root, int val) {
    // Base case: create new node at empty position
    if (!root) return new_node(val);
    // Recurse left if value is smaller
    if (val < root->val) root->left = insert(root->left, val);
    // Recurse right if value is larger
    else if (val > root->val) root->right = insert(root->right, val);
    return root;
}`,
    cpp: `// BST Insert — maintain left < node < right ordering
struct Node { int val; Node *left, *right; };

Node* insert(Node* root, int val) {
    // Base case: create new node at empty position
    if (!root) return new Node{val, nullptr, nullptr};
    // Recurse left if value is smaller
    if (val < root->val) root->left = insert(root->left, val);
    // Recurse right if value is larger
    else if (val > root->val) root->right = insert(root->right, val);
    return root;
}`,
    java: `// BST Insert — maintain left < node < right ordering
class Node { int val; Node left, right; Node(int v){val=v;} }

class BSTInsert {
    static Node insert(Node root, int val) {
        // Base case: create new node at empty position
        if (root == null) return new Node(val);
        // Recurse left if value is smaller
        if (val < root.val) root.left = insert(root.left, val);
        // Recurse right if value is larger
        else if (val > root.val) root.right = insert(root.right, val);
        return root;
    }
}`,
  },
};

/** Category fallback templates when algorithm-specific source is not defined */
function buildCategorySource(algorithmId, language, category, name) {
  const comment = `// ${name} — step-by-step implementation`;
  const templates = {
    searching: {
      python: `# ${name}\ndef search(arr, target):\n    for i in range(len(arr)):\n        if arr[i] == target: return i\n    return -1`,
      javascript: `// ${name}\nfunction search(arr, target) {\n  for (let i = 0; i < arr.length; i++) {\n    if (arr[i] === target) return i;\n  }\n  return -1;\n}`,
      c: `// ${name}\nint search(int arr[], int n, int target) {\n    for (int i = 0; i < n; i++)\n        if (arr[i] == target) return i;\n    return -1;\n}`,
      cpp: `// ${name}\nint search(const std::vector<int>& arr, int target) {\n    for (int i = 0; i < (int)arr.size(); i++)\n        if (arr[i] == target) return i;\n    return -1;\n}`,
      java: `// ${name}\npublic class Search {\n    static int search(int[] arr, int target) {\n        for (int i = 0; i < arr.length; i++)\n            if (arr[i] == target) return i;\n        return -1;\n    }\n}`,
    },
    sorting: {
      python: `# ${name}\ndef sort_arr(arr):\n    return sorted(arr)  # See full implementation in lesson code`,
      javascript: `// ${name}\nfunction sortArr(arr) {\n  return [...arr].sort((a, b) => a - b);\n}`,
      c: `// ${name}\nvoid sort_arr(int arr[], int n) {\n    qsort(arr, n, sizeof(int), compare_int);\n}`,
      cpp: `// ${name}\nvoid sortArr(std::vector<int>& arr) {\n    std::sort(arr.begin(), arr.end());\n}`,
      java: `// ${name}\npublic class Sort {\n    static void sortArr(int[] arr) {\n        java.util.Arrays.sort(arr);\n    }\n}`,
    },
    graphs: {
      python: `# ${name}\ndef traverse(graph, start):\n    visited = set([start])\n    stack = [start]\n    while stack:\n        u = stack.pop()\n        for v in graph.get(u, []):\n            if v not in visited:\n                visited.add(v); stack.append(v)\n    return visited`,
      javascript: `// ${name}\nfunction traverse(graph, start) {\n  const visited = new Set([start]);\n  const stack = [start];\n  while (stack.length) {\n    const u = stack.pop();\n    for (const v of graph[u] ?? []) {\n      if (!visited.has(v)) { visited.add(v); stack.push(v); }\n    }\n  }\n  return visited;\n}`,
      c: `// ${name}\nvoid traverse(int g[][MAX], int n, int start, int vis[]) {\n    vis[start] = 1;\n    for (int v = 0; v < n; v++)\n        if (g[start][v] && !vis[v]) traverse(g, n, v, vis);\n}`,
      cpp: `// ${name}\nvoid traverse(const std::vector<std::vector<int>>& g, int u, std::vector<bool>& vis) {\n    vis[u] = true;\n    for (int v : g[u]) if (!vis[v]) traverse(g, v, vis);\n}`,
      java: `// ${name}\npublic class Traverse {\n    static void traverse(List<List<Integer>> g, int u, boolean[] vis) {\n        vis[u] = true;\n        for (int v : g.get(u)) if (!vis[v]) traverse(g, v, vis);\n    }\n}`,
    },
    trees: {
      python: `# ${name}\ndef inorder(root):\n    if not root: return []\n    return inorder(root.left) + [root.val] + inorder(root.right)`,
      javascript: `// ${name}\nfunction inorder(root) {\n  if (!root) return [];\n  return [...inorder(root.left), root.val, ...inorder(root.right)];\n}`,
      c: `// ${name}\nvoid inorder(struct Node* root) {\n    if (!root) return;\n    inorder(root->left);\n    printf("%d ", root->val);\n    inorder(root->right);\n}`,
      cpp: `// ${name}\nvoid inorder(Node* root) {\n    if (!root) return;\n    inorder(root->left);\n    std::cout << root->val << ' ';\n    inorder(root->right);\n}`,
      java: `// ${name}\npublic class TreeTraverse {\n    static void inorder(Node root) {\n        if (root == null) return;\n        inorder(root.left);\n        System.out.print(root.val + " ");\n        inorder(root.right);\n    }\n}`,
    },
    dp: {
      python: `# ${name}\ndef solve(n):\n    dp = [0] * (n + 1)\n    dp[0], dp[1] = 0, 1\n    for i in range(2, n + 1):\n        dp[i] = dp[i-1] + dp[i-2]\n    return dp[n]`,
      javascript: `// ${name}\nfunction solve(n) {\n  const dp = Array(n + 1).fill(0);\n  dp[0] = 0; dp[1] = 1;\n  for (let i = 2; i <= n; i++) dp[i] = dp[i-1] + dp[i-2];\n  return dp[n];\n}`,
      c: `// ${name}\nint solve(int n) {\n    int dp[n+1]; dp[0]=0; dp[1]=1;\n    for (int i=2; i<=n; i++) dp[i]=dp[i-1]+dp[i-2];\n    return dp[n];\n}`,
      cpp: `// ${name}\nint solve(int n) {\n    std::vector<int> dp(n+1); dp[0]=0; dp[1]=1;\n    for (int i=2; i<=n; i++) dp[i]=dp[i-1]+dp[i-2];\n    return dp[n];\n}`,
      java: `// ${name}\npublic class DP {\n    static int solve(int n) {\n        int[] dp = new int[n+1]; dp[0]=0; dp[1]=1;\n        for (int i=2; i<=n; i++) dp[i]=dp[i-1]+dp[i-2];\n        return dp[n];\n    }\n}`,
    },
    structures: {
      python: `# ${name}\nclass Stack:\n    def __init__(self): self.data = []\n    def push(self, x): self.data.append(x)\n    def pop(self): return self.data.pop()`,
      javascript: `// ${name}\nclass Stack {\n  constructor() { this.data = []; }\n  push(x) { this.data.push(x); }\n  pop() { return this.data.pop(); }\n}`,
      c: `// ${name}\ntypedef struct { int data[1000]; int top; } Stack;\nvoid push(Stack* s, int x) { s->data[++s->top] = x; }\nint pop(Stack* s) { return s->data[s->top--]; }`,
      cpp: `// ${name}\nclass Stack { std::vector<int> data; public:\n  void push(int x) { data.push_back(x); }\n  int pop() { int v=data.back(); data.pop_back(); return v; }\n};`,
      java: `// ${name}\nclass Stack {\n    Deque<Integer> data = new ArrayDeque<>();\n    void push(int x) { data.pushLast(x); }\n    int pop() { return data.removeLast(); }\n}`,
    },
    techniques: {
      python: `# ${name}\ndef two_pointer(arr, target):\n    left, right = 0, len(arr) - 1\n    while left < right:\n        s = arr[left] + arr[right]\n        if s == target: return (left, right)\n        elif s < target: left += 1\n        else: right -= 1\n    return (-1, -1)`,
      javascript: `// ${name}\nfunction twoPointer(arr, target) {\n  let left = 0, right = arr.length - 1;\n  while (left < right) {\n    const s = arr[left] + arr[right];\n    if (s === target) return [left, right];\n    else if (s < target) left++;\n    else right--;\n  }\n  return [-1, -1];\n}`,
      c: `// ${name}\nvoid two_pointer(int arr[], int n, int target, int* l, int* r) {\n    *l=0; *r=n-1;\n    while (*l < *r) {\n        int s = arr[*l] + arr[*r];\n        if (s == target) return;\n        else if (s < target) (*l)++;\n        else (*r)--;\n    }\n}`,
      cpp: `// ${name}\npair<int,int> twoPointer(vector<int>& arr, int target) {\n    int l=0, r=arr.size()-1;\n    while (l<r) {\n        int s=arr[l]+arr[r];\n        if (s==target) return {l,r};\n        else if (s<target) l++; else r--;\n    }\n    return {-1,-1};\n}`,
      java: `// ${name}\npublic class TwoPointer {\n    static int[] twoPointer(int[] arr, int target) {\n        int l=0, r=arr.length-1;\n        while (l<r) {\n            int s=arr[l]+arr[r];\n            if (s==target) return new int[]{l,r};\n            else if (s<target) l++; else r--;\n        }\n        return new int[]{-1,-1};\n    }\n}`,
    },
  };

  const cat = templates[category] ?? templates.sorting;
  return cat[language] ?? cat.python;
}

const ALL_SOURCES = { ...SEARCHING, ...SORTING, ...GRAPHS, ...TREES };

/** Copy searching implementations to related search algorithms */
['jump-search', 'interpolation-search', 'ternary-search', 'exponential-search'].forEach((id) => {
  ALL_SOURCES[id] = ALL_SOURCES['binary-search'];
});

/** Copy sorting implementations to related sort algorithms */
['selection-sort', 'insertion-sort', 'heap-sort', 'counting-sort', 'radix-sort', 'bucket-sort', 'shell-sort', 'tim-sort'].forEach((id) => {
  ALL_SOURCES[id] = ALL_SOURCES['bubble-sort'];
});

/** Copy graph implementations */
['bellman-ford', 'floyd-warshall', 'prim', 'kruskal', 'a-star', 'topological-sort', 'union-find', 'scc-kosaraju', 'bridges-tarjan', 'articulation-points'].forEach((id) => {
  ALL_SOURCES[id] = ALL_SOURCES['dfs'];
});
ALL_SOURCES.bfs = GRAPHS.bfs;

/** Copy tree implementations */
['avl-insert', 'trie-insert', 'heapify', 'tree-inorder', 'tree-preorder', 'tree-postorder', 'level-order-bfs', 'segment-tree-demo', 'fenwick-tree-demo'].forEach((id) => {
  ALL_SOURCES[id] = ALL_SOURCES['bst-insert'];
});

/** Copy structure implementations */
['stack-operations', 'queue-operations', 'linked-list-insert', 'hash-linear-probing', 'monotonic-stack', 'deque-sliding-window'].forEach((id) => {
  ALL_SOURCES[id] = {};
  LANGS.forEach((lang) => {
    ALL_SOURCES[id][lang] = buildCategorySource(id, lang, 'structures', id.replace(/-/g, ' '));
  });
});

['two-pointer', 'sliding-window', 'prefix-sum'].forEach((id) => {
  ALL_SOURCES[id] = {};
  LANGS.forEach((lang) => {
    ALL_SOURCES[id][lang] = buildCategorySource(id, lang, 'techniques', id.replace(/-/g, ' '));
  });
});

['fibonacci-dp', 'knapsack-dp', 'coin-change-dp', 'lis-dp', 'bitmask-dp', 'edit-distance-dp'].forEach((id) => {
  ALL_SOURCES[id] = {};
  LANGS.forEach((lang) => {
    ALL_SOURCES[id][lang] = buildCategorySource(id, lang, 'dp', id.replace(/-/g, ' '));
  });
});

['greedy-activity', 'backtracking-subsets', 'kmp-search', 'rabin-karp'].forEach((id) => {
  ALL_SOURCES[id] = {};
  LANGS.forEach((lang) => {
    ALL_SOURCES[id][lang] = buildCategorySource(id, lang, 'techniques', id.replace(/-/g, ' '));
  });
});

export function getAlgorithmSource(algorithmId, language, category = 'sorting', name = algorithmId) {
  const normalized = language === 'pseudocode' ? 'python' : language;
  const entry = ALL_SOURCES[algorithmId];

  if (entry && typeof entry === 'object' && entry[normalized]) {
    return entry[normalized];
  }

  return buildCategorySource(algorithmId, normalized, category, name);
}

export function hasAlgorithmSource(algorithmId, language) {
  const normalized = language === 'pseudocode' ? 'python' : language;
  return Boolean(ALL_SOURCES[algorithmId]?.[normalized]);
}

export default { getAlgorithmSource, hasAlgorithmSource, ALL_SOURCES };
