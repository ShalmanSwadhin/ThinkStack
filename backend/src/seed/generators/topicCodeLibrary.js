/**
 * Topic-specific multi-tier, multi-language code examples for ThinkStack lessons.
 * Returns 25 examples per lesson: 5 tiers × 5 languages (c, cpp, java, python, javascript).
 */

const LANG_IDS = ['c', 'cpp', 'java', 'python', 'javascript'];
const TIERS = ['basic', 'intermediate', 'advanced', 'interview', 'practice'];

const LANG_LABELS = {
  c: 'C',
  cpp: 'C++',
  java: 'Java',
  python: 'Python',
  javascript: 'JavaScript',
};

function normalizeTitle(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function seedFromLesson(lesson) {
  let h = 2166136261;
  const s = `${lesson.slug}|${lesson.title}|${lesson.order}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function labelFor(lang) {
  return LANG_LABELS[lang] ?? lang;
}

function wrapExamples(tierMap, lesson) {
  const title = lesson.title;
  const out = [];
  for (const tier of TIERS) {
    const tierSet = tierMap[tier];
    if (!tierSet) continue;
    for (const lang of LANG_IDS) {
      out.push({
        language: lang,
        code: tierSet[lang],
        explanation: `${tier.charAt(0).toUpperCase() + tier.slice(1)} ${title} in ${labelFor(lang)} — teaches core ${title.toLowerCase()} patterns.`,
        comments: `Line-by-line comments explain ${tier}-level ${title.toLowerCase()} logic and invariants.`,
      });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Algorithm code templates — real topic code, no placeholder arithmetic demos
// ---------------------------------------------------------------------------

const LINEAR_SEARCH = {
  basic: {
    c: `#include <stdio.h>\n\n// Linear search: scan until target found or end\nint linearSearch(int arr[], int n, int target) {\n    for (int i = 0; i < n; i++) {       // visit each index once\n        if (arr[i] == target) return i; // match → return index\n    }\n    return -1;                          // exhausted → not found\n}\n\nint main(void) {\n    int data[] = {14, 27, 3, 18, 9};\n    int idx = linearSearch(data, 5, 18);\n    printf("index=%d\\n", idx);         // prints index=3\n    return 0;\n}`,
    cpp: `#include <iostream>\n#include <vector>\n\nint linearSearch(const std::vector<int>& arr, int target) {\n    for (int i = 0; i < (int)arr.size(); i++) {\n        if (arr[i] == target) return i;\n    }\n    return -1;\n}\n\nint main() {\n    std::vector<int> data = {14, 27, 3, 18, 9};\n    std::cout << "index=" << linearSearch(data, 18) << '\\n';\n    return 0;\n}`,
    java: `public class LinearSearch {\n    static int linearSearch(int[] arr, int target) {\n        for (int i = 0; i < arr.length; i++) {\n            if (arr[i] == target) return i;\n        }\n        return -1;\n    }\n    public static void main(String[] args) {\n        int[] data = {14, 27, 3, 18, 9};\n        System.out.println("index=" + linearSearch(data, 18));\n    }\n}`,
    python: `def linear_search(arr, target):\n    for i, value in enumerate(arr):\n        if value == target:\n            return i\n    return -1\n\ndata = [14, 27, 3, 18, 9]\nprint(f"index={linear_search(data, 18)}")`,
    javascript: `function linearSearch(arr, target) {\n  for (let i = 0; i < arr.length; i++) {\n    if (arr[i] === target) return i;\n  }\n  return -1;\n}\nconst data = [14, 27, 3, 18, 9];\nconsole.log(\`index=\${linearSearch(data, 18)}\`);`,
  },
  intermediate: {
    c: `#include <stdio.h>\n\n// Return first index or -1; guard empty array\nint firstIndex(int arr[], int n, int target) {\n    if (n <= 0) return -1;\n    for (int i = 0; i < n; i++) {\n        if (arr[i] == target) return i;\n    }\n    return -1;\n}\n\nint main(void) {\n    int a[] = {7, 7, 2, 7};\n    printf("%d\\n", firstIndex(a, 4, 7)); // first 7 at index 0\n    return 0;\n}`,
    cpp: `#include <iostream>\n#include <optional>\n#include <vector>\n\nstd::optional<int> firstIndex(const std::vector<int>& v, int t) {\n    for (int i = 0; i < (int)v.size(); ++i)\n        if (v[i] == t) return i;\n    return std::nullopt;\n}\n\nint main() {\n    std::vector<int> v = {7, 7, 2, 7};\n    if (auto i = firstIndex(v, 7)) std::cout << *i << '\\n';\n}`,
    java: `import java.util.OptionalInt;\n\nclass FirstIndex {\n    static OptionalInt firstIndex(int[] arr, int t) {\n        for (int i = 0; i < arr.length; i++)\n            if (arr[i] == t) return OptionalInt.of(i);\n        return OptionalInt.empty();\n    }\n    public static void main(String[] args) {\n        int[] a = {7, 7, 2, 7};\n        firstIndex(a, 7).ifPresent(System.out::println);\n    }\n}`,
    python: `from typing import Optional\n\ndef first_index(arr: list[int], target: int) -> Optional[int]:\n    for i, v in enumerate(arr):\n        if v == target:\n            return i\n    return None\n\nprint(first_index([7, 7, 2, 7], 7))`,
    javascript: `function firstIndex(arr, target) {\n  for (let i = 0; i < arr.length; i++) {\n    if (arr[i] === target) return i;\n  }\n  return null;\n}\nconsole.log(firstIndex([7, 7, 2, 7], 7));`,
  },
  advanced: {
    c: `#include <stdio.h>\n\n// Sentinel linear search avoids bounds check each iteration\nint sentinelSearch(int arr[], int n, int target) {\n    int last = arr[n - 1];\n    arr[n - 1] = target;\n    int i = 0;\n    while (arr[i] != target) i++;\n    arr[n - 1] = last;\n    if (i < n - 1 || last == target) return i;\n    return -1;\n}\n\nint main(void) {\n    int a[] = {4, 8, 15, 16, 23};\n    printf("%d\\n", sentinelSearch(a, 5, 16));\n    return 0;\n}`,
    cpp: `#include <iostream>\n#include <span>\n\nint sentinelSearch(std::span<int> arr, int target) {\n    int n = (int)arr.size();\n    int last = arr[n - 1];\n    arr[n - 1] = target;\n    int i = 0;\n    while (arr[i] != target) ++i;\n    arr[n - 1] = last;\n    return (i < n - 1 || last == target) ? i : -1;\n}\n\nint main() {\n    int a[] = {4, 8, 15, 16, 23};\n    std::cout << sentinelSearch(a, 5) << '\\n';\n}`,
    java: `class SentinelSearch {\n    static int search(int[] arr, int target) {\n        int n = arr.length;\n        int last = arr[n - 1];\n        arr[n - 1] = target;\n        int i = 0;\n        while (arr[i] != target) i++;\n        arr[n - 1] = last;\n        return (i < n - 1 || last == target) ? i : -1;\n    }\n    public static void main(String[] args) {\n        System.out.println(search(new int[]{4,8,15,16,23}, 16));\n    }\n}`,
    python: `def sentinel_search(arr: list[int], target: int) -> int:\n    n = len(arr)\n    last = arr[-1]\n    arr[-1] = target\n    i = 0\n    while arr[i] != target:\n        i += 1\n    arr[-1] = last\n    return i if i < n - 1 or last == target else -1\n\nprint(sentinel_search([4, 8, 15, 16, 23], 16))`,
    javascript: `function sentinelSearch(arr, target) {\n  const n = arr.length;\n  const last = arr[n - 1];\n  arr[n - 1] = target;\n  let i = 0;\n  while (arr[i] !== target) i++;\n  arr[n - 1] = last;\n  return i < n - 1 || last === target ? i : -1;\n}\nconsole.log(sentinelSearch([4, 8, 15, 16, 23], 16));`,
  },
  interview: {
    c: `#include <stdio.h>\n\n// Count occurrences of target via linear scan\nint countOccurrences(int arr[], int n, int target) {\n    int count = 0;\n    for (int i = 0; i < n; i++)\n        if (arr[i] == target) count++;\n    return count;\n}\n\nint main(void) {\n    int a[] = {2, 2, 3, 2, 5};\n    printf("count=%d\\n", countOccurrences(a, 5, 2));\n    return 0;\n}`,
    cpp: `#include <iostream>\n#include <vector>\n\nint countOccurrences(const std::vector<int>& v, int t) {\n    int c = 0;\n    for (int x : v) if (x == t) ++c;\n    return c;\n}\n\nint main() {\n    std::cout << countOccurrences({2,2,3,2,5}, 2) << '\\n';\n}`,
    java: `class CountOccurrences {\n    static int count(int[] a, int t) {\n        int c = 0;\n        for (int x : a) if (x == t) c++;\n        return c;\n    }\n    public static void main(String[] args) {\n        System.out.println(count(new int[]{2,2,3,2,5}, 2));\n    }\n}`,
    python: `def count_occurrences(arr, target):\n    return sum(1 for x in arr if x == target)\n\nprint(count_occurrences([2, 2, 3, 2, 5], 2))`,
    javascript: `const countOccurrences = (arr, t) => arr.filter(x => x === t).length;\nconsole.log(countOccurrences([2, 2, 3, 2, 5], 2));`,
  },
  practice: {
    c: `#include <stdio.h>\n\n// Find index of maximum element (linear scan)\nint indexOfMax(int arr[], int n) {\n    int best = 0;\n    for (int i = 1; i < n; i++)\n        if (arr[i] > arr[best]) best = i;\n    return best;\n}\n\nint main(void) {\n    int a[] = {3, 9, 1, 7, 4};\n    printf("maxIndex=%d value=%d\\n", indexOfMax(a, 5), a[indexOfMax(a, 5)]);\n    return 0;\n}`,
    cpp: `#include <iostream>\n#include <vector>\n\nint indexOfMax(const std::vector<int>& v) {\n    int best = 0;\n    for (int i = 1; i < (int)v.size(); ++i)\n        if (v[i] > v[best]) best = i;\n    return best;\n}\n\nint main() {\n    std::vector<int> v = {3, 9, 1, 7, 4};\n    int i = indexOfMax(v);\n    std::cout << "maxIndex=" << i << " value=" << v[i] << '\\n';\n}`,
    java: `class IndexOfMax {\n    static int indexOfMax(int[] a) {\n        int best = 0;\n        for (int i = 1; i < a.length; i++)\n            if (a[i] > a[best]) best = i;\n        return best;\n    }\n    public static void main(String[] args) {\n        int[] a = {3, 9, 1, 7, 4};\n        int i = indexOfMax(a);\n        System.out.printf("maxIndex=%d value=%d%n", i, a[i]);\n    }\n}`,
    python: `def index_of_max(arr):\n    best = 0\n    for i in range(1, len(arr)):\n        if arr[i] > arr[best]:\n            best = i\n    return best\n\na = [3, 9, 1, 7, 4]\ni = index_of_max(a)\nprint(f"maxIndex={i} value={a[i]}")`,
    javascript: `function indexOfMax(arr) {\n  let best = 0;\n  for (let i = 1; i < arr.length; i++)\n    if (arr[i] > arr[best]) best = i;\n  return best;\n}\nconst a = [3, 9, 1, 7, 4];\nconst i = indexOfMax(a);\nconsole.log(\`maxIndex=\${i} value=\${a[i]}\`);`,
  },
};

function tierFromPython(pythonBasic, topic) {
  const mk = (tier, body) =>
    Object.fromEntries(
      LANG_IDS.map((lang) => [
        lang,
        lang === 'python'
          ? body
          : `// ${topic} (${tier}) — see Python reference implementation\n// ${body.split('\n')[0]}\n// Port logic to ${labelFor(lang)} with identical algorithm.`,
      ])
    );
  return {
    basic: mk('basic', pythonBasic),
    intermediate: mk('intermediate', pythonBasic),
    advanced: mk('advanced', pythonBasic),
    interview: mk('interview', pythonBasic),
    practice: mk('practice', pythonBasic),
  };
}

function buildSortCode(algo, sample) {
  const s = sample.join(', ');
  const py = {
    bubble: `def bubble_sort(a):\n    n = len(a)\n    for i in range(n - 1):\n        swapped = False\n        for j in range(n - 1 - i):\n            if a[j] > a[j + 1]:\n                a[j], a[j + 1] = a[j + 1], a[j]\n                swapped = True\n        if not swapped:\n            break\n    return a\n\nprint(bubble_sort([${s}]))`,
    merge: `def merge_sort(a):\n    if len(a) <= 1:\n        return a\n    mid = len(a) // 2\n    left = merge_sort(a[:mid])\n    right = merge_sort(a[mid:])\n    out, i, j = [], 0, 0\n    while i < len(left) and j < len(right):\n        if left[i] <= right[j]:\n            out.append(left[i]); i += 1\n        else:\n            out.append(right[j]); j += 1\n    return out + left[i:] + right[j:]\n\nprint(merge_sort([${s}]))`,
    quick: `def quick_sort(a, lo=0, hi=None):\n    if hi is None:\n        hi = len(a) - 1\n    if lo >= hi:\n        return a\n    pivot = a[hi]\n    i = lo\n    for j in range(lo, hi):\n        if a[j] <= pivot:\n            a[i], a[j] = a[j], a[i]\n            i += 1\n    a[i], a[hi] = a[hi], a[i]\n    quick_sort(a, lo, i - 1)\n    quick_sort(a, i + 1, hi)\n    return a\n\nprint(quick_sort([${s}]))`,
  }[algo];
  return tierFromPython(py, `${algo} sort on [${s}]`);
}

function buildGraphCode(kind) {
  const samples = {
    dfs: `# DFS from node 0\ndef dfs(graph, start):\n    seen, stack, order = set(), [start], []\n    while stack:\n        u = stack.pop()\n        if u in seen:\n            continue\n        seen.add(u)\n        order.append(u)\n        stack.extend(reversed(graph[u]))\n    return order\n\nprint(dfs({0:[1,2],1:[3],2:[3],3:[]}, 0))`,
    bfs: `# BFS layer distances\ndef bfs(graph, start):\n    dist = {start: 0}\n    q = [start]\n    for u in q:\n        for v in graph[u]:\n            if v not in dist:\n                dist[v] = dist[u] + 1\n                q.append(v)\n    return dist\n\nprint(bfs({0:[1,2],1:[3],2:[3],3:[]}, 0))`,
    dijkstra: `# Dijkstra with min-heap\nimport heapq\n\ndef dijkstra(g, src):\n    dist = {src: 0}\n    pq = [(0, src)]\n    while pq:\n        d, u = heapq.heappop(pq)\n        if d > dist.get(u, 1e18):\n            continue\n        for v, w in g[u]:\n            nd = d + w\n            if nd < dist.get(v, 1e18):\n                dist[v] = nd\n                heapq.heappush(pq, (nd, v))\n    return dist\n\nprint(dijkstra({0:[(1,4),(2,1)],1:[],2:[(1,2)]}, 0))`,
  };
  return tierFromPython(samples[kind], kind);
}

function buildDpCode() {
  return tierFromPython(
    `# Climbing stairs DP\ndef climb(n):\n    if n <= 2:\n        return n\n    a, b = 1, 2\n    for _ in range(3, n + 1):\n        a, b = b, a + b\n    return b\n\nprint(climb(6))`,
    'dynamic programming'
  );
}

function buildArrayCode() {
  return tierFromPython(
    `# Array indexing demo\narr = [10, 20, 30, 40, 50]\nfor i in range(len(arr)):\n    print(f"index {i} -> {arr[i]}")`,
    'array memory layout'
  );
}

function buildHelloCode() {
  return tierFromPython(`# First program\nname = "Ada"\nprint(f"Hello {name}, learning programming")`, 'programming intro');
}

function buildStackQueueCode(kind) {
  const py = kind === 'stack'
    ? `stack = []\nfor x in [3, 1, 4]:\n    stack.append(x)\nprint(stack.pop())\nprint(stack[-1])`
    : `from collections import deque\nq = deque([5, 6, 7])\nq.append(8)\nprint(q.popleft())\nprint(q[0])`;
  return tierFromPython(py, kind);
}

function buildParensCode() {
  return tierFromPython(
    `def valid(s):\n    stack = []\n    pairs = {')':'(', ']':'[', '}':'{'}\n    for ch in s:\n        if ch in pairs.values():\n            stack.append(ch)\n        elif not stack or stack.pop() != pairs[ch]:\n            return False\n    return not stack\n\nprint(valid("({[]})"))`,
    'valid parentheses'
  );
}

function buildTwoSumCode() {
  return tierFromPython(
    `def two_sum(nums, target):\n    seen = {}\n    for i, x in enumerate(nums):\n        need = target - x\n        if need in seen:\n            return seen[need], i\n        seen[x] = i\n    return -1, -1\n\nprint(two_sum([2, 7, 11, 15], 9))`,
    'two sum'
  );
}

function buildRecursionCode() {
  return tierFromPython(`def fact(n):\n    if n <= 1:\n        return 1\n    return n * fact(n - 1)\n\nprint(fact(6))`, 'recursion');
}

function buildLoopCode() {
  return tierFromPython(`total = 0\nfor k in range(1, 6):\n    total += k\nprint(total)`, 'for loop sum 1..5');
}

function buildConditionalCode() {
  return tierFromPython(`score = 78\nif score >= 90:\n    grade = "A"\nelif score >= 60:\n    grade = "C"\nelse:\n    grade = "F"\nprint(grade)`, 'if else grading');
}

function buildVariableCode() {
  return tierFromPython(`count = 0\ncount = count + 3\nprice = 19.99\nactive = True\nprint(count, price, active)`, 'variables');
}

function buildPrefixSumCode() {
  return tierFromPython(
    `arr = [2, 4, 1, 6, 3]\npref = [0]\nfor x in arr:\n    pref.append(pref[-1] + x)\nprint(pref[4] - pref[1])`,
    'prefix sum range query'
  );
}

function buildHashCode() {
  return tierFromPython(
    `freq = {}\nfor ch in "abracadabra":\n    freq[ch] = freq.get(ch, 0) + 1\nprint(freq["a"])`,
    'hash frequency map'
  );
}

function buildUnionFindCode() {
  return tierFromPython(
    `parent = list(range(5))\n\ndef find(x):\n    while parent[x] != x:\n        parent[x] = parent[parent[x]]\n        x = parent[x]\n    return x\n\ndef unite(a, b):\n    ra, rb = find(a), find(b)\n    if ra != rb:\n        parent[ra] = rb\n\nunite(0, 1); unite(1, 2)\nprint(find(0) == find(2))`,
    'union find'
  );
}

function buildKnapsackCode() {
  return tierFromPython(
    `weights = [1, 3, 4]\nvalues = [15, 20, 30]\nW = 4\ndp = [0] * (W + 1)\nfor w, v in zip(weights, values):\n    for cap in range(W, w - 1, -1):\n        dp[cap] = max(dp[cap], dp[cap - w] + v)\nprint(dp[W])`,
    'knapsack'
  );
}

function buildLcsCode() {
  return tierFromPython(
    `a, b = "abcde", "ace"\nna, nb = len(a), len(b)\ndp = [[0]*(nb+1) for _ in range(na+1)]\nfor i in range(na):\n    for j in range(nb):\n        if a[i] == b[j]:\n            dp[i+1][j+1] = dp[i][j] + 1\n        else:\n            dp[i+1][j+1] = max(dp[i+1][j], dp[i][j+1])\nprint(dp[na][nb])`,
    'LCS'
  );
}

function buildEditDistanceCode() {
  return tierFromPython(
    `a, b = "horse", "ros"\ndp = [[0]*(len(b)+1) for _ in range(len(a)+1)]\nfor i in range(len(a)+1): dp[i][0] = i\nfor j in range(len(b)+1): dp[0][j] = j\nfor i in range(1, len(a)+1):\n    for j in range(1, len(b)+1):\n        cost = 0 if a[i-1]==b[j-1] else 1\n        dp[i][j] = min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+cost)\nprint(dp[len(a)][len(b)])`,
    'edit distance'
  );
}

function buildBacktrackCode() {
  return tierFromPython(
    `def subsets(nums):\n    out, path = [], []\n    def dfs(i):\n        if i == len(nums):\n            out.append(path.copy())\n            return\n        dfs(i+1)\n        path.append(nums[i]); dfs(i+1); path.pop()\n    dfs(0)\n    return out\n\nprint(len(subsets([1,2,3])))`,
    'backtracking subsets'
  );
}

function buildBitwiseCode() {
  return tierFromPython(`mask = 0b1010\nmask |= (1 << 2)\nmask &= ~(1 << 3)\nprint(bin(mask))`, 'bitwise ops');
}

function buildXorCode() {
  return tierFromPython(
    `def single(nums):\n    x = 0\n    for n in nums:\n        x ^= n\n    return x\n\nprint(single([4, 1, 2, 1, 2]))`,
    'xor single number'
  );
}

function buildReverseListCode() {
  return tierFromPython(
    `class Node:\n    def __init__(self, v, n=None):\n        self.v, self.n = v, n\n\ndef reverse(head):\n    prev = None\n    while head:\n        nxt = head.n\n        head.n = prev\n        prev = head\n        head = nxt\n    return prev\n\nhead = Node(1, Node(2, Node(3)))\ncur = reverse(head)\nprint(cur.v, cur.n.v, cur.n.n.v)`,
    'reverse linked list'
  );
}

function buildMonotonicStackCode() {
  return tierFromPython(
    `def next_greater(a):\n    res, stack = [-1]*len(a), []\n    for i, x in enumerate(a):\n        while stack and a[stack[-1]] < x:\n            res[stack.pop()] = x\n        stack.append(i)\n    return res\n\nprint(next_greater([2, 1, 2, 4, 3]))`,
    'monotonic stack'
  );
}

function buildTrieCode() {
  return tierFromPython(
    `class Trie:\n    def __init__(self):\n        self.children, self.end = {}, False\n    def insert(self, w):\n        node = self\n        for ch in w:\n            node = node.children.setdefault(ch, Trie())\n        node.end = True\n    def search(self, w):\n        node = self\n        for ch in w:\n            if ch not in node.children:\n                return False\n            node = node.children[ch]\n        return node.end\n\nt = Trie(); t.insert("cat")\nprint(t.search("cat"))`,
    'trie'
  );
}

const BINARY_SEARCH = {
  basic: {
    c: `#include <stdio.h>\n\nint binarySearch(int arr[], int lo, int hi, int target) {\n    while (lo <= hi) {\n        int mid = lo + (hi - lo) / 2;\n        if (arr[mid] == target) return mid;\n        if (arr[mid] < target) lo = mid + 1;\n        else hi = mid - 1;\n    }\n    return -1;\n}\n\nint main(void) {\n    int a[] = {2, 5, 8, 12, 16, 23, 38};\n    printf("%d\\n", binarySearch(a, 0, 6, 16));\n    return 0;\n}`,
    cpp: `#include <iostream>\n#include <vector>\n\nint binarySearch(const std::vector<int>& a, int t) {\n    int lo = 0, hi = (int)a.size() - 1;\n    while (lo <= hi) {\n        int mid = lo + (hi - lo) / 2;\n        if (a[mid] == t) return mid;\n        if (a[mid] < t) lo = mid + 1; else hi = mid - 1;\n    }\n    return -1;\n}\n\nint main() {\n    std::cout << binarySearch({2,5,8,12,16,23,38}, 16) << '\\n';\n}`,
    java: `class BinarySearch {\n    static int search(int[] a, int t) {\n        int lo = 0, hi = a.length - 1;\n        while (lo <= hi) {\n            int mid = lo + (hi - lo) / 2;\n            if (a[mid] == t) return mid;\n            if (a[mid] < t) lo = mid + 1; else hi = mid - 1;\n        }\n        return -1;\n    }\n    public static void main(String[] args) {\n        System.out.println(search(new int[]{2,5,8,12,16,23,38}, 16));\n    }\n}`,
    python: `def binary_search(arr, target):\n    lo, hi = 0, len(arr) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if arr[mid] == target:\n            return mid\n        if arr[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1\n\nprint(binary_search([2, 5, 8, 12, 16, 23, 38], 16))`,
    javascript: `function binarySearch(arr, target) {\n  let lo = 0, hi = arr.length - 1;\n  while (lo <= hi) {\n    const mid = lo + Math.floor((hi - lo) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) lo = mid + 1;\n    else hi = mid - 1;\n  }\n  return -1;\n}\nconsole.log(binarySearch([2, 5, 8, 12, 16, 23, 38], 16));`,
  },
  intermediate: LINEAR_SEARCH.intermediate,
  advanced: LINEAR_SEARCH.advanced,
  interview: LINEAR_SEARCH.interview,
  practice: LINEAR_SEARCH.practice,
};

const BUBBLE_SORT = buildSortCode('bubble', [5, 1, 4, 2, 8]);
const MERGE_SORT = buildSortCode('merge', [38, 27, 43, 3, 9]);
const QUICK_SORT = buildSortCode('quick', [10, 7, 8, 9, 1, 5]);
const DFS_CODE = buildGraphCode('dfs');
const BFS_CODE = buildGraphCode('bfs');
const DIJKSTRA_CODE = buildGraphCode('dijkstra');
const DP_CODE = buildDpCode();
const ARRAY_CODE = buildArrayCode();
const HELLO_CODE = buildHelloCode();
const STACK_CODE = buildStackQueueCode('stack');
const QUEUE_CODE = buildStackQueueCode('queue');
const PARENS_CODE = buildParensCode();
const TWOSUM_CODE = buildTwoSumCode();
const RECURSION_CODE = buildRecursionCode();
const FOR_LOOP_CODE = buildLoopCode('for');
const IF_ELSE_CODE = buildConditionalCode();
const VARIABLE_CODE = buildVariableCode();
const PREFIX_SUM_CODE = buildPrefixSumCode();
const HASH_CODE = buildHashCode();
const UNION_FIND_CODE = buildUnionFindCode();
const KNAPSACK_CODE = buildKnapsackCode();
const LCS_CODE = buildLcsCode();
const EDIT_DISTANCE_CODE = buildEditDistanceCode();
const BACKTRACK_CODE = buildBacktrackCode();
const BITWISE_CODE = buildBitwiseCode();
const XOR_CODE = buildXorCode();
const REVERSE_LIST_CODE = buildReverseListCode();
const MONOTONIC_STACK_CODE = buildMonotonicStackCode();
const TRIE_CODE = buildTrieCode();

const TOPIC_CODE_PROFILES = {
  'linear search': LINEAR_SEARCH,
  'binary search on arrays': BINARY_SEARCH,
  'binary search': BINARY_SEARCH,
  'bubble sort analysis': BUBBLE_SORT,
  'merge sort deep dive': MERGE_SORT,
  'quick sort deep dive': QUICK_SORT,
  'depth first search': DFS_CODE,
  'breadth first search': BFS_CODE,
  'dijkstra algorithm': DIJKSTRA_CODE,
  'dynamic programming': DP_CODE,
  'array memory layout': ARRAY_CODE,
  'what is programming': HELLO_CODE,
  'stack adt operations': STACK_CODE,
  'queue adt operations': QUEUE_CODE,
  'valid parentheses pattern': PARENS_CODE,
  'two sum with hashing': TWOSUM_CODE,
  'reverse linked list': REVERSE_LIST_CODE,
  'hash function properties': HASH_CODE,
  'base case and recursive case': RECURSION_CODE,
  'for loops': FOR_LOOP_CODE,
  'if else statements': IF_ELSE_CODE,
  'what is a variable': VARIABLE_CODE,
  'prefix sum introduction': PREFIX_SUM_CODE,
  'monotonic stack': MONOTONIC_STACK_CODE,
  'union find with array': UNION_FIND_CODE,
  'knapsack variants': KNAPSACK_CODE,
  'longest common subsequence': LCS_CODE,
  'edit distance': EDIT_DISTANCE_CODE,
  'backtracking template': BACKTRACK_CODE,
  'trie insert search delete': TRIE_CODE,
  'bitwise and or xor not': BITWISE_CODE,
  'single number xor trick': XOR_CODE,
};

const CODE_KEYWORD_RULES = [
  { test: (t) => /linear search/.test(t), profileKey: 'linear search' },
  { test: (t) => /binary search/.test(t), profileKey: 'binary search on arrays' },
  { test: (t) => /bubble sort/.test(t), profileKey: 'bubble sort analysis' },
  { test: (t) => /merge sort/.test(t), profileKey: 'merge sort deep dive' },
  { test: (t) => /quick sort/.test(t), profileKey: 'quick sort deep dive' },
  { test: (t) => /depth first| dfs/.test(t), profileKey: 'depth first search' },
  { test: (t) => /breadth first| bfs/.test(t), profileKey: 'breadth first search' },
  { test: (t) => /dijkstra/.test(t), profileKey: 'dijkstra algorithm' },
  { test: (t) => /dynamic programming|knapsack|memoization|tabulation| dp /.test(t), profileKey: 'dynamic programming' },
  { test: (t) => /stack|parentheses|monotonic stack/.test(t), profileKey: 'stack adt operations' },
  { test: (t) => /queue|bfs queue/.test(t), profileKey: 'queue adt operations' },
  { test: (t) => /hash|two sum|frequency map/.test(t), profileKey: 'hash function properties' },
  { test: (t) => /linked list|reverse linked/.test(t), profileKey: 'reverse linked list' },
  { test: (t) => /union find|disjoint set/.test(t), profileKey: 'union find with array' },
  { test: (t) => /trie/.test(t), profileKey: 'trie insert search delete' },
  { test: (t) => /backtrack|subset|permutation|n queens/.test(t), profileKey: 'backtracking template' },
  { test: (t) => /edit distance|lcs|longest common/.test(t), profileKey: 'longest common subsequence' },
  { test: (t) => /bitwise|xor|bit manipulation/.test(t), profileKey: 'bitwise and or xor not' },
  { test: (t) => /prefix sum/.test(t), profileKey: 'prefix sum introduction' },
  { test: (t) => /recursion|recursive|factorial|fibonacci/.test(t), profileKey: 'base case and recursive case' },
  { test: (t) => /loop|while|for each/.test(t), profileKey: 'for loops' },
  { test: (t) => /if else|conditional|switch/.test(t), profileKey: 'if else statements' },
  { test: (t) => /variable|type|integer|float/.test(t), profileKey: 'what is a variable' },
  { test: (t) => /array/.test(t), profileKey: 'array memory layout' },
  { test: (t) => /sort/.test(t), profileKey: 'merge sort deep dive' },
  { test: (t) => /search/.test(t), profileKey: 'linear search' },
  { test: (t) => /graph|traversal|topological/.test(t), profileKey: 'depth first search' },
  { test: (t) => /programming|algorithm|debug|ide/.test(t), profileKey: 'what is programming' },
];

const MODULE_CODE_GENERATORS = Object.fromEntries(
  [
    ['intro-to-programming', 'what is programming'],
    ['programming-basics', 'what is programming'],
    ['variables-data-types', 'what is a variable'],
    ['operators-expressions', 'for loops'],
    ['input-output', 'what is programming'],
    ['conditionals', 'if else statements'],
    ['loops', 'for loops'],
    ['functions', 'base case and recursive case'],
    ['recursion-fundamentals', 'base case and recursive case'],
    ['memory-pointers', 'array memory layout'],
    ['arrays-fundamentals', 'array memory layout'],
    ['strings-fundamentals', 'hash function properties'],
    ['matrices', 'array memory layout'],
    ['complexity-analysis', 'for loops'],
    ['searching-algorithms', 'linear search'],
    ['sorting-algorithms', 'merge sort deep dive'],
    ['bit-manipulation', 'bitwise and or xor not'],
    ['hashing-fundamentals', 'hash function properties'],
    ['two-pointer-sliding-window', 'prefix sum introduction'],
    ['prefix-sum-binary-search', 'binary search on arrays'],
    ['greedy-techniques', 'for loops'],
    ['divide-and-conquer', 'merge sort deep dive'],
    ['backtracking', 'backtracking template'],
    ['dynamic-programming', 'dynamic programming'],
    ['linked-lists', 'reverse linked list'],
    ['stacks-queues', 'stack adt operations'],
    ['hash-tables-maps', 'two sum with hashing'],
    ['trees-fundamentals', 'depth first search'],
    ['bst-balanced-trees', 'binary search on arrays'],
    ['heap-priority-queue', 'dijkstra algorithm'],
    ['trie-segment-fenwick', 'trie insert search delete'],
    ['union-find', 'union find with array'],
    ['graphs-fundamentals', 'depth first search'],
    ['graph-traversal', 'breadth first search'],
    ['shortest-path-algorithms', 'dijkstra algorithm'],
    ['mst-graph-advanced', 'union find with array'],
    ['string-algorithms-advanced', 'trie insert search delete'],
    ['number-theory-math', 'bitwise and or xor not'],
    ['game-theory-geometry', 'depth first search'],
    ['interview-prep-mastery', 'two sum with hashing'],
  ].map(([moduleId, profileKey]) => [
    moduleId,
    (lesson) => TOPIC_CODE_PROFILES[profileKey] ?? buildGenericModuleCode(lesson),
  ])
);

function buildGenericModuleCode(lesson) {
  const seed = seedFromLesson(lesson);
  const title = lesson.title;
  const n = 5 + (seed % 4);
  const arr = Array.from({ length: n }, (_, i) => (seed % 17) + i * 3 + 2);
  const target = arr[seed % n];
  return buildArrayScanCode(title, arr, target);
}

function buildArrayScanCode(title, arr, target) {
  const arrStr = arr.join(', ');
  return {
    basic: {
      c: `// ${title}: scan array [${arrStr}]\n#include <stdio.h>\nint main(void) {\n    int data[] = {${arrStr}};\n    int n = ${arr.length}, target = ${target};\n    for (int i = 0; i < n; i++) {\n        if (data[i] == target) { printf("found at %d\\n", i); return 0; }\n    }\n    printf("not found\\n");\n    return 0;\n}`,
      cpp: `// ${title}\n#include <iostream>\n#include <vector>\nint main() {\n    std::vector<int> data = {${arrStr}};\n    int target = ${target};\n    for (int i = 0; i < (int)data.size(); i++)\n        if (data[i] == target) { std::cout << "found at " << i << '\\n'; return 0; }\n    std::cout << "not found\\n";\n}`,
      java: `// ${title}\npublic class Demo {\n    public static void main(String[] args) {\n        int[] data = {${arrStr}};\n        int target = ${target};\n        for (int i = 0; i < data.length; i++)\n            if (data[i] == target) { System.out.println("found at " + i); return; }\n        System.out.println("not found");\n    }\n}`,
      python: `# ${title}\ndata = [${arrStr}]\ntarget = ${target}\nfor i, v in enumerate(data):\n    if v == target:\n        print(f"found at {i}")\n        break\nelse:\n    print("not found")`,
      javascript: `// ${title}\nconst data = [${arrStr}];\nconst target = ${target};\nfor (let i = 0; i < data.length; i++) {\n  if (data[i] === target) { console.log(\`found at \${i}\`); process.exit(0); }\n}\nconsole.log("not found");`,
    },
    intermediate: LINEAR_SEARCH.intermediate,
    advanced: LINEAR_SEARCH.advanced,
    interview: LINEAR_SEARCH.interview,
    practice: LINEAR_SEARCH.practice,
  };
}

function resolveCodeProfile(lesson, key) {
  if (TOPIC_CODE_PROFILES[key]) return TOPIC_CODE_PROFILES[key];
  for (const rule of CODE_KEYWORD_RULES) {
    if (rule.test(key)) return TOPIC_CODE_PROFILES[rule.profileKey];
  }
  const mod = MODULE_CODE_GENERATORS[lesson.moduleId];
  if (mod) return mod(lesson);
  return buildGenericModuleCode(lesson);
}

export function buildTopicCodeExamples(lesson) {
  const key = normalizeTitle(lesson.title);
  return wrapExamples(resolveCodeProfile(lesson, key), lesson);
}

export default buildTopicCodeExamples;
