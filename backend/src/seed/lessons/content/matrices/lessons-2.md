# Search in Sorted Matrix
kind: algorithm
time: O(m + n) for the staircase search of an m by n matrix whose rows and columns are both sorted, since each step discards a whole row or column; O(log(m · n)) when the matrix is fully sorted in reading order and can be treated as one sorted array.
space: O(1) extra space for both methods.

## intro
Searching an unsorted matrix means checking every cell, but when the matrix has order, you can discard whole rows or columns with a single comparison. Two sorted-matrix layouts are common in interviews and in real data tables, and each has its own elegant search that is much faster than scanning.

## theory
Layout 1: rows and columns each sorted in ascending order (but the first element of a row can be smaller than the last element of the row above). Example:

`1 4 7 11` / `2 5 8 12` / `3 6 9 16` / `10 13 14 17`

The staircase (saddleback) search starts at the top-right corner. Compare the target with the current value:

- If equal, found
- If the current value is larger than the target, nothing below it in this column can be the target (columns increase downward), and everything in this column from here down is larger, so move left
- If the current value is smaller than the target, everything to its left in this row is smaller still, so move down

Each step eliminates a row or a column, so at most m + n steps are taken: O(m + n) time, O(1) space. Starting at the bottom-left works symmetrically. Starting at the top-left or bottom-right does not work, because both moves lead to larger values and the comparison cannot decide.

Layout 2: each row is sorted and the first element of each row is greater than the last element of the previous row. Then reading the matrix row by row yields one sorted sequence. Binary search over the flattened indexes 0 to m · n - 1 works, converting an index k to row `k // n` and column `k % n`, in O(log(m · n)) time.

Other approaches: binary search each row (O(m log n)) when only rows are sorted; divide the matrix into quadrants and discard one; for counting elements smaller than a value, use the staircase walk in O(m + n), which makes the k-th smallest element solvable by binary search on the value.

Edge cases: empty matrix or empty rows, a single row or column, duplicate values, and targets smaller than the minimum or larger than the maximum.

## explain
1. Find out which kind of order the matrix has: both rows and columns sorted, or fully sorted in reading order.
2. For both-sorted, start at the top-right corner and move left or down according to the comparison.
3. For fully sorted, run binary search on the flattened range and convert each middle index to a row and a column.
4. Count steps or comparisons to check the bound.
5. Return the position, or a sentinel when the loop ends without a match.
6. Test with a target in each corner, a missing target and a one-row matrix.

## example
In the 4 by 4 matrix above, searching for 9 starts at 11 (too big, go left), then 7 (too small, go down), 8 (go down), and finds 9 at row 2, column 2 after 4 steps. Searching for 15 visits five cells and walks off the bottom edge, reporting that it is absent. The JavaScript function treats a fully sorted 3 by 3 matrix as one array: looking for 9 finds the middle element at row 1, column 1, and looking for 4 returns null.

## real
Spreadsheets with sorted columns, tile maps indexed by value ranges and databases of sorted pages use these tricks, and the staircase search is a classic example of eliminating a row or column per comparison.

## pros
- Far fewer comparisons than scanning every cell
- Constant extra space
- The reasoning generalises to counting problems

## cons
- Works only when the order assumptions hold
- Starting from the wrong corner fails
- Off-by-one errors in the index conversion are common

## uses
- Searching sorted tables and grids
- Counting elements below a value in a sorted matrix
- Finding the k-th smallest element in a sorted matrix
- Practising elimination-based search for interviews

## mistakes
- Starting at the top-left corner
- Assuming a fully sorted layout when only rows and columns are sorted
- Mixing up row and column in the index conversion
- Forgetting empty matrices

## interview
**Q:** How do you search a matrix whose rows and columns are both sorted?
**A:** Start at the top-right corner. If the value is too large move left, if too small move down; each step removes a row or a column, so it takes at most rows plus columns steps.

**Q:** Why does the staircase search not start at the top-left corner?
**A:** From there both possible moves, right and down, lead to larger values, so a comparison with the target cannot tell which direction to take.

**Q:** How do you binary search a matrix whose rows continue in order from one to the next?
**A:** Treat it as an array of rows times columns elements: for a middle index k, the row is k divided by the number of columns and the column is k modulo the number of columns.

## summary
Use the structure of the order to discard a row or column per comparison: the staircase search for row- and column-sorted matrices in O(m + n), and binary search on flattened indexes for fully sorted ones in O(log(m n)).

## codenote
The Python sample runs the staircase search and counts steps. The JavaScript sample binary searches a fully sorted matrix.

## code
### python
```python
def staircase_search(matrix, target):
    r, c = 0, len(matrix[0]) - 1
    steps = 0
    while r < len(matrix) and c >= 0:
        steps += 1
        value = matrix[r][c]
        if value == target:
            return (r, c), steps
        if value > target:
            c -= 1
        else:
            r += 1
    return None, steps

matrix = [
    [1, 4, 7, 11],
    [2, 5, 8, 12],
    [3, 6, 9, 16],
    [10, 13, 14, 17],
]
print(staircase_search(matrix, 9), staircase_search(matrix, 15))
```
Output:
```text
((2, 2), 4) (None, 5)
```
### javascript
```javascript
function findInSorted(matrix, target) {
  const cols = matrix[0].length;
  let lo = 0;
  let hi = matrix.length * cols - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const value = matrix[Math.floor(mid / cols)][mid % cols];
    if (value === target) return [Math.floor(mid / cols), mid % cols];
    if (value < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return null;
}

const sorted = [[1, 3, 5], [7, 9, 11], [13, 15, 17]];
console.log(findInSorted(sorted, 9), findInSorted(sorted, 4));
```
Output:
```text
[ 1, 1 ] null
```

## quiz
1. Where does the staircase search start in a matrix with sorted rows and columns?
   - [ ] Top-left corner
   - [x] Top-right corner
   - [ ] The center
   - [ ] A random cell
   > From there one direction decreases and the other increases.
2. What happens when the current value is larger than the target in the staircase search?
   - [ ] Move down
   - [x] Move left
   - [ ] Stop
   - [ ] Restart
   > Everything below it in the column is larger still.
3. What is the maximum number of steps of the staircase search in an m by n matrix?
   - [ ] m times n
   - [x] m plus n
   - [ ] log m
   - [ ] m
   > Each step removes a row or a column.
4. How do you convert a flattened index k to a column in a matrix with n columns?
   - [ ] k divided by n
   - [x] k modulo n
   - [ ] k plus n
   - [ ] n minus k
   > The row is the quotient and the column the remainder.

# Graph Adjacency Matrix
kind: algorithm
time: O(1) to test whether an edge exists, O(V) to list the neighbours of a vertex, and O(V²) to build the matrix or scan all edges, for a graph with V vertices.
space: O(V²) regardless of how many edges there are, which is wasteful for sparse graphs.

## intro
A graph is a set of vertices connected by edges, and an adjacency matrix stores it as a square grid: row i, column j holds 1 (or the edge weight) when there is an edge from vertex i to vertex j. It is the most direct way to answer "is there an edge between these two vertices?" and it connects matrix operations to graph questions.

## theory
Construction for V vertices numbered 0 to V - 1: create a V by V matrix of zeros; for each edge (a, b) set `A[a][b] = 1`; for an undirected graph also set `A[b][a] = 1`, so the matrix is symmetric. For weighted graphs store the weight, using zero, infinity or None for no edge, as the problem requires; the diagonal holds self-loops.

Properties and costs:

- Edge lookup, insertion and removal: O(1)
- Listing neighbours of a vertex: scan the row, O(V)
- Degree of a vertex in an undirected graph: the sum of its row; in a directed graph, the row sum is the out-degree and the column sum the in-degree
- Space: O(V²), good for dense graphs and small graphs, wasteful for sparse ones where an adjacency list with O(V + E) space is better
- Iterating over all edges: O(V²)

Matrix powers count walks: the entry `(A^k)[i][j]` is the number of walks of length k from i to j. With the squared matrix, `A²[0][3]` counts two-edge paths from vertex 0 to vertex 3. Boolean powers answer reachability, and repeated squaring computes walks of long length quickly.

Algorithms that suit the matrix form: Floyd-Warshall for all-pairs shortest paths (working directly on a distance matrix), transitive closure, checking for symmetry or self-loops, and spectral methods using eigenvalues of the matrix.

When to choose which structure: use a matrix for dense graphs, small fixed vertex sets and constant-time edge queries; use adjacency lists for large sparse graphs and traversal-heavy algorithms (BFS, DFS) that mostly list neighbours.

## explain
1. Number the vertices from 0 to V - 1, mapping names to indexes if needed.
2. Create a V by V matrix filled with zeros (or an infinity value for weights).
3. For each edge, set the entry, and its mirror for an undirected graph.
4. Answer edge queries by reading one cell and neighbour queries by scanning a row.
5. Compute degrees from row sums and, for walk counts, multiply the matrix by itself.
6. Compare the V² memory with V + E before committing to the matrix.

## example
The undirected edges (0, 1), (0, 2), (1, 2) and (2, 3) give the symmetric matrix `[[0, 1, 1, 0], [1, 0, 1, 0], [1, 1, 0, 1], [0, 0, 1, 0]]`. The row sums give the degrees `[2, 2, 3, 1]`. Squaring the matrix shows that there is exactly one path of length two from vertex 0 to vertex 3 (through vertex 2), and `has_edge(0, 3)` is False. The JavaScript sample lists neighbours and tests an edge.

## real
Network adjacency tables, dependency matrices, game boards and small route maps use adjacency matrices, and shortest-path algorithms on dense road or airline tables operate directly on them.

## pros
- Constant-time edge queries
- Simple to implement and reason about
- Matrix operations give walk counts and reachability

## cons
- O(V²) memory even when there are few edges
- Listing neighbours costs O(V) even if the vertex has a few
- Adding vertices requires resizing the matrix

## uses
- Dense graphs and small networks
- Counting walks and checking reachability with matrix powers
- All-pairs shortest-path algorithms
- Tournament and relationship tables

## mistakes
- Forgetting to set the mirror entry in an undirected graph
- Using a matrix for a huge sparse graph and running out of memory
- Confusing the weight zero with the absence of an edge
- Mixing up rows and columns for directed edges

## interview
**Q:** What are the main trade-offs of an adjacency matrix versus an adjacency list?
**A:** The matrix has O(1) edge lookup but uses O(V squared) memory and O(V) neighbour listing. The list uses O(V plus E) memory and lists neighbours in time proportional to the degree but needs a scan for edge lookup.

**Q:** What does the entry of the squared adjacency matrix mean?
**A:** The number of walks of length two between the two vertices, so entry (i, j) counts the vertices k with edges from i to k and from k to j.

**Q:** Why is the adjacency matrix of an undirected graph symmetric?
**A:** Because an edge between a and b is recorded in both directions, so entry (a, b) always equals entry (b, a).

## summary
An adjacency matrix stores edges in a V by V grid, giving constant-time edge checks and matrix-based reasoning at the price of quadratic memory. Prefer it for dense graphs and lists for sparse ones.

## codenote
The Python sample builds the matrix, computes degrees and counts two-edge paths with a matrix product. The JavaScript sample lists neighbours and tests an edge.

## code
### python
```python
edges = [(0, 1), (0, 2), (1, 2), (2, 3)]
n = 4
adjacency = [[0] * n for _ in range(n)]
for a, b in edges:
    adjacency[a][b] = 1
    adjacency[b][a] = 1

print(adjacency)
print([sum(row) for row in adjacency])

def square(m):
    size = len(m)
    return [[sum(m[i][k] * m[k][j] for k in range(size)) for j in range(size)]
            for i in range(size)]

print(square(adjacency)[0][3], adjacency[0][3] == 1)
```
Output:
```text
[[0, 1, 1, 0], [1, 0, 1, 0], [1, 1, 0, 1], [0, 0, 1, 0]]
[2, 2, 3, 1]
1 False
```
### javascript
```javascript
const adjacency = [
  [0, 1, 1, 0],
  [1, 0, 1, 0],
  [1, 1, 0, 1],
  [0, 0, 1, 0],
];

const neighbors = (v) => adjacency[v].flatMap((edge, other) => (edge ? [other] : []));
console.log(neighbors(2).join(","), adjacency[1][3] === 1);
```
Output:
```text
0,1,3 false
```

## quiz
1. What is the space cost of an adjacency matrix for V vertices?
   - [ ] O(V)
   - [x] O(V squared)
   - [ ] O(E)
   - [ ] O(log V)
   > The matrix has V rows and V columns whatever the edge count.
2. How fast is an edge lookup in an adjacency matrix?
   - [ ] O(V)
   - [x] O(1)
   - [ ] O(E)
   - [ ] O(log V)
   > One cell is read.
3. What does the sum of a row give in an undirected graph?
   - [ ] The number of vertices
   - [x] The degree of that vertex
   - [ ] The number of components
   - [ ] The total weight
   > Each neighbour contributes a one.
4. When is an adjacency list better than a matrix?
   - [ ] For small dense graphs
   - [x] For large sparse graphs
   - [ ] Never
   - [ ] For graphs with no vertices
   > A list uses space proportional to the actual edges.

# Image Processing Grids
kind: algorithm
time: O(w · h) for a per-pixel operation such as inversion or thresholding on a w by h image; a convolution with a k by k kernel costs O(w · h · k²).
space: O(w · h) for an output image, or O(1) extra when the operation changes pixels in place.

## intro
A digital image is a grid of numbers: one value per pixel for grayscale, or three or four per pixel for color. Most image operations are matrix operations in disguise, applied pixel by pixel or over small neighbourhoods, which makes images a friendly place to practise grids.

## theory
Representation:

- Grayscale: an h by w matrix of intensities, commonly integers from 0 (black) to 255 (white) in 8 bits
- Color: three channels (red, green, blue), stored as a third dimension or interleaved in a flat array; an optional fourth channel holds transparency
- Coordinates: the origin is usually the top-left corner, rows grow downward, and the pair is written (row, column) or (y, x) in code, but (x, y) in many graphics APIs; mixing them up is a classic bug
- Clamping: results are limited to the valid range; `Uint8ClampedArray` in JavaScript clamps values and rounds to the nearest integer automatically

Pixel-wise operations (each output depends on one input pixel): inversion `255 - p`, brightness `p + b` with clamping, contrast scaling, thresholding (`1 if p >= t else 0`) which creates binary images, and conversions such as grayscale from weighted channels.

Geometric operations: flips (reverse each row for horizontal, reverse the row order for vertical), rotations by transposing and reversing, cropping by slicing, scaling by sampling or interpolating.

Neighbourhood operations use a kernel, a small matrix of weights slid over the image (convolution): box blur averages the 3 by 3 neighbourhood, Gaussian blur weights the center more, sharpening and edge detection (Sobel, Laplacian) use kernels with positive and negative weights. Border pixels need a policy: skip, repeat the edge, wrap or treat missing values as zero.

Practical points: process row by row for cache speed, use integer arithmetic where possible, avoid modifying the input while reading neighbours (write into a new array), and use libraries (NumPy, OpenCV, Pillow) for real work.

## explain
1. Decide the pixel format and value range.
2. Choose the operation type: pixel-wise, geometric or neighbourhood.
3. Loop over rows and columns, reading from the input and writing to an output grid.
4. For neighbourhoods, decide how to handle borders before coding the loop.
5. Clamp the results to the valid range.
6. Check the result on a tiny image where you can calculate by hand.

## example
The 3 by 3 image with rows `[10, 20, 30]`, `[40, 50, 60]` and `[70, 80, 90]` is inverted with `255 - p`; the first row becomes `[245, 235, 225]`. Thresholding at 50 gives `[[0, 0, 0], [0, 1, 1], [1, 1, 1]]`. A box blur of the center pixel averages all nine values, 450 divided by 9, giving 50. Flipping horizontally reverses each row, so the first row becomes `[30, 20, 10]`. The JavaScript sample shows how a clamped array treats out-of-range brightness values: 300 becomes 255, -5 becomes 0 and 128.6 rounds to 129.

## real
Photo editors, medical imaging, camera pipelines, computer vision and games apply these grid operations to millions of pixels per frame, often on GPUs where the same small kernel runs on every pixel in parallel.

## pros
- Simple, regular loops over a grid
- Per-pixel operations are easy to parallelise
- Kernels give a uniform way to express many filters

## cons
- Large images make naive loops slow in interpreted languages
- Border handling and value clamping add details
- Row and column versus x and y conventions cause bugs

## uses
- Adjusting brightness, contrast and color
- Blurring, sharpening and edge detection
- Flipping, rotating and cropping
- Creating binary masks for object detection

## mistakes
- Overwriting the input while later pixels still need the original values
- Forgetting to clamp results into the valid range
- Mixing up (row, column) and (x, y) order
- Ignoring the border when applying a kernel

## interview
**Q:** How is a grayscale image represented in memory?
**A:** As a two-dimensional array of intensity values, typically 8-bit integers from 0 to 255, stored row by row, with the origin at the top-left corner.

**Q:** How do you flip an image horizontally?
**A:** Reverse the order of the pixels within each row; a vertical flip reverses the order of the rows instead.

**Q:** What is a convolution kernel?
**A:** A small matrix of weights that is slid over the image, replacing each pixel with the weighted sum of its neighbourhood, which implements blurs, sharpening and edge detection.

## summary
An image is a grid of pixel values processed pixel by pixel, geometrically or through neighbourhood kernels. Write to a new grid, clamp the values, handle borders deliberately and watch the coordinate order.

## codenote
The Python sample inverts, thresholds, blurs one pixel and flips a tiny image. The JavaScript sample demonstrates clamping.

## code
### python
```python
image = [[10, 20, 30], [40, 50, 60], [70, 80, 90]]

def invert(img):
    return [[255 - p for p in row] for row in img]

def threshold(img, level):
    return [[1 if p >= level else 0 for p in row] for row in img]

def blur_center(img):
    return sum(sum(row) for row in img) // 9

print(invert(image)[0], threshold(image, 50), blur_center(image))
print([row[::-1] for row in image][0])
```
Output:
```text
[245, 235, 225] [[0, 0, 0], [0, 1, 1], [1, 1, 1]] 50
[30, 20, 10]
```
### javascript
```javascript
const pixels = new Uint8ClampedArray([300, -5, 128.6]);
console.log(pixels);
```
Output:
```text
Uint8ClampedArray(3) [ 255, 0, 129 ]
```

## quiz
1. What does inverting a grayscale pixel p compute for 8-bit images?
   - [ ] p minus 255
   - [x] 255 minus p
   - [ ] p times 255
   - [ ] p divided by 2
   > Dark pixels become light and light pixels become dark.
2. How do you flip an image horizontally?
   - [ ] Reverse the order of the rows
   - [x] Reverse the pixels within each row
   - [ ] Transpose it
   - [ ] Invert every pixel
   > Horizontal flipping mirrors left to right.
3. Why write the output to a new grid in a blur?
   - [ ] To use more memory
   - [x] Later pixels need the original neighbour values, not already blurred ones
   - [ ] Blurs require two images by definition
   - [ ] Because of clamping
   > Updating in place would mix new and old values.
4. What does clamping do?
   - [ ] Sorts the pixel values
   - [x] Forces values into the valid range, such as 0 to 255
   - [ ] Removes pixels
   - [ ] Converts to color
   > Out-of-range results are limited to the minimum or maximum.

# Matrix DP Preview
kind: algorithm
time: O(r · c) for the grid dynamic programming examples, since each of the r · c cells is computed from a constant number of earlier cells.
space: O(r · c) for the full table, which the next lesson reduces to O(c) by keeping only the previous row.

## intro
Many optimisation and counting problems on grids can be solved by filling a table where each cell is computed from its neighbours above and to the left. This is dynamic programming in its most visual form, and the matrix is both the input and the structure of the solution.

## theory
Dynamic programming solves a problem by breaking it into overlapping subproblems and storing their answers. On a grid, the subproblem is usually "the best (or number of ways) to reach cell (r, c)", and the answer for a cell depends only on cells already computed.

Counting paths: how many different routes lead from the top-left to the bottom-right of an r by c grid if you can only move right or down? Every route to (r, c) comes either from above or from the left, so `ways[r][c] = ways[r-1][c] + ways[r][c-1]`. The first row and first column each have exactly one route. For a 3 by 3 grid the answer is 6, and for 3 by 7 it is 28, matching the binomial coefficient C(r + c - 2, r - 1).

Minimum path sum: with a cost in each cell, the cheapest route to (r, c) is its own cost plus the cheaper of the routes from above and from the left: `best[r][c] = cost[r][c] + min(best[r-1][c], best[r][c-1])`. For the grid `[[1, 3, 1], [1, 5, 1], [4, 2, 1]]`, the cheapest route costs 7.

Obstacles are handled by setting the number of ways to zero for blocked cells.

The recipe:

- Define the meaning of one cell of the table precisely
- Write the recurrence in terms of already computed cells
- Fill the base cases (the first row and column)
- Choose an order that respects the dependencies, usually row by row
- Read the answer from the last cell (or take a maximum or sum)
- Optionally reconstruct the path by following the choices backward

Complexity: each cell is computed once from a constant number of neighbours, so time is O(r · c) and the table needs O(r · c) space. The brute-force recursion would take exponential time because it recomputes cells many times.

Related grid problems: largest square of ones, edit distance between two strings (the table is over prefixes), longest common subsequence, knapsack. All share the filled-table pattern.

## explain
1. State what dp[r][c] means in words.
2. Write how it depends on dp[r-1][c], dp[r][c-1] and possibly dp[r-1][c-1].
3. Initialise the first row and column from the base conditions.
4. Fill the table in an order where every dependency is already known.
5. Return dp[last row][last column] or the quantity requested.
6. Check with a tiny grid and by hand, then think about reducing space.

## example
The function `unique_paths` fills a table of ones and adds above and left for the inner cells; for 3 by 3 it returns 6 and for 3 by 7 it returns 28. The function `min_path_sum` builds the cumulative cost table for the grid with costs 1, 3, 1 / 1, 5, 1 / 4, 2, 1 and returns 7, the route along the top row and down the right column. The JavaScript function counts paths on a grid with a blocked center cell and finds 2 routes around it.

## real
Route planning on grids, game maps, text alignment and sequence comparison in bioinformatics are all solved with filled tables, and grid DP is the standard way to introduce dynamic programming.

## pros
- Turns exponential recursion into polynomial time
- The table makes the logic easy to inspect and debug
- Patterns transfer to many other problems

## cons
- Needs a precise definition of what each cell means
- Uses memory proportional to the table size
- Choosing the wrong fill order breaks dependencies

## uses
- Counting routes through grids with or without obstacles
- Finding minimum or maximum cost paths
- Computing edit distance and similar string problems
- Teaching dynamic programming

## mistakes
- Forgetting to initialise the first row and column
- Allowing diagonal moves when the problem does not
- Filling the table in an order that reads cells not yet computed
- Forgetting that blocked cells contribute zero ways

## interview
**Q:** How many ways are there to go from the top-left to the bottom-right of an r by c grid moving only right and down?
**A:** The number of paths to a cell is the sum of the paths to the cell above and to the left, with ones in the first row and column. The answer is the binomial coefficient of r plus c minus 2 choose r minus 1.

**Q:** What is the recurrence for the minimum path sum?
**A:** The best cost to reach a cell is its own cost plus the smaller of the best costs of the cell above and the cell to the left.

**Q:** Why is the DP solution faster than plain recursion?
**A:** Plain recursion recomputes the same cells many times, while the table computes each of the r times c cells once.

## summary
Grid dynamic programming defines a table cell as the answer for reaching that position, derives it from the cells above and to the left and fills the table in order. Time is O(r times c) and the corner holds the answer.

## codenote
The Python sample counts paths and finds the cheapest route. The JavaScript sample counts paths around an obstacle.

## code
### python
```python
def unique_paths(rows, cols):
    ways = [[1] * cols for _ in range(rows)]
    for r in range(1, rows):
        for c in range(1, cols):
            ways[r][c] = ways[r - 1][c] + ways[r][c - 1]
    return ways[-1][-1]

def min_path_sum(grid):
    rows, cols = len(grid), len(grid[0])
    best = [row[:] for row in grid]
    for r in range(rows):
        for c in range(cols):
            if r == 0 and c == 0:
                continue
            up = best[r - 1][c] if r else float("inf")
            left = best[r][c - 1] if c else float("inf")
            best[r][c] += min(up, left)
    return best[-1][-1]

print(unique_paths(3, 3), unique_paths(3, 7))
print(min_path_sum([[1, 3, 1], [1, 5, 1], [4, 2, 1]]))
```
Output:
```text
6 28
7
```
### javascript
```javascript
function pathsWithObstacles(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  const ways = grid.map((row) => row.map(() => 0));
  ways[0][0] = grid[0][0] === 1 ? 0 : 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 1) {
        ways[r][c] = 0;
      } else if (r > 0 || c > 0) {
        ways[r][c] = (r > 0 ? ways[r - 1][c] : 0) + (c > 0 ? ways[r][c - 1] : 0);
      }
    }
  }
  return ways[rows - 1][cols - 1];
}

console.log(pathsWithObstacles([[0, 0, 0], [0, 1, 0], [0, 0, 0]]));
```
Output:
```text
2
```

## quiz
1. How is the number of paths to a cell computed when moves are right or down only?
   - [ ] As the product of its row and column
   - [x] As the sum of the paths to the cell above and the cell to the left
   - [ ] As the larger of the two neighbours
   - [ ] As a constant
   > Every route arrives from above or from the left.
2. What is the answer to the number of paths in a 3 by 3 grid?
   - [ ] 3
   - [ ] 4
   - [x] 6
   - [ ] 9
   > It is the binomial coefficient 4 choose 2.
3. What is the time complexity of grid DP for an r by c grid?
   - [ ] O(r plus c)
   - [x] O(r times c)
   - [ ] O(2 to the power of r times c)
   - [ ] O(log r)
   > Each cell is computed once from a constant number of neighbours.
4. How is a blocked cell handled in path counting?
   - [ ] It counts double
   - [x] Its number of ways is set to zero
   - [ ] It is skipped by the loop
   - [ ] It is replaced by the average
   > Nothing can pass through it.

# Matrix Space Optimization
kind: algorithm
time: O(r · c) for the optimised grid dynamic programming, unchanged from the full-table version, because every cell is still computed once.
space: O(c) when only the previous row is kept (rolling array), or O(1) extra when the input matrix itself can be overwritten.

## intro
A dynamic programming table of r by c cells can be enormous, yet each row usually depends only on the row above it. Keeping just one row, or reusing the input itself, cuts the memory from quadratic to linear without changing the answer, and the same ideas apply to in-place transforms of matrices.

## theory
Observation: in the recurrence `ways[r][c] = ways[r-1][c] + ways[r][c-1]`, a cell needs only the cell directly above (previous row) and the cell on its left (same row). So after finishing row r - 1, the rows before it are never read again, and storing them is a waste.

Rolling array (one row): keep a single array `row` of length c. For each new row, update it left to right: `row[c] += row[c-1]`. Before the update `row[c]` holds the value from the row above; after the update it holds the value for the current row, and `row[c-1]` is already the current row's value. The table shrinks from r · c to c cells. If c is larger than r, transpose the roles to keep the smaller dimension.

Two rows: when the recurrence reads more complicated neighbours (the diagonal, as in edit distance), keep `previous` and `current` rows, swapping them at the end of each row. If a single array is used with diagonal dependencies, remember the old diagonal value in a temporary variable before overwriting.

In-place on the input: if the input grid may be modified, store cumulative results in it directly, as in the minimum path sum where `grid[r][c] += min(...)`. The cost is that the input is destroyed, which callers must accept.

Limitations: you cannot reconstruct the actual path from a rolling array, because the earlier rows are gone. If the path is needed, store a compact record of choices (one bit per cell) or use divide-and-conquer methods such as Hirschberg's algorithm, which finds the path in linear space.

Other matrix space savings:

- Symmetric matrices: store only the upper triangle, about half the space
- Sparse matrices: store only non-zero entries
- Bit matrices: pack booleans eight to a byte
- Transposition and rotation of square matrices in place
- Reusing the input matrix as a work area, as in setting entire rows and columns to zero using the first row and column as markers

The goal is to ask of every table: which part will still be read?

## explain
1. Write the recurrence and list exactly which earlier cells each cell reads.
2. If it reads only the previous row (and the current row so far), keep a single row array.
3. Update the row in the order that keeps the needed old values until they are used.
4. If a diagonal value is needed, save it in a temporary variable before overwriting.
5. Verify against the full-table version on random inputs.
6. If the path itself is needed, keep a compact choice record or use a different method.

## example
The one-dimensional version of the path counting function keeps a single row of ones and adds `row[c - 1]` into `row[c]` for each new row; it returns 28 for the 3 by 7 grid, using 7 cells instead of 21. For an 18 by 18 grid it returns 2,333,606,220, which would need 324 cells in the full table but needs 18 here. The JavaScript function builds a row of Pascal's triangle with one array, updating from right to left so that each entry still sees the old value of its left neighbour.

## real
Memory-limited systems, long sequence alignments in genomics and large optimisation tables rely on rolling arrays, which turn problems that would need gigabytes into ones that fit in a few megabytes.

## pros
- Reduces space from quadratic to linear
- Keeps the same time complexity
- Often improves cache behavior

## cons
- Cannot reconstruct the full path without extra work
- Overwriting values in the wrong order silently corrupts the result
- The input may be destroyed if reused

## uses
- Large dynamic programming tables
- Counting and cost computations on grids
- Edit distance and sequence comparison with long inputs
- Computing rows of Pascal's triangle

## mistakes
- Updating the row in the wrong direction and reading a value that was already overwritten
- Forgetting to save the diagonal value when the recurrence needs it
- Expecting to recover the path from the rolling array
- Modifying an input that the caller still needs

## interview
**Q:** How do you reduce the space of grid dynamic programming from O(r times c) to O(c)?
**A:** Keep only one row, because each cell depends only on the row above and the cell to its left. Update the row in place from left to right for each new row.

**Q:** Why does the update order matter when using a single array?
**A:** An entry must be read before it is overwritten. For Pascal's triangle, updating from right to left preserves the old values of the left neighbours; for path counting, left to right works because the left neighbour is meant to be the new value.

**Q:** What do you lose when you keep only a rolling row?
**A:** The ability to reconstruct which path produced the answer, because the earlier rows no longer exist.

## summary
When each row depends only on the previous one, keep a single rolling row to cut space to O(c) with unchanged time. Choose the update order carefully, save diagonal values and remember that path reconstruction needs extra information.

## codenote
The Python sample counts paths with one row and compares with a larger grid. The JavaScript sample builds a row of Pascal's triangle in a single array.

## code
### python
```python
def unique_paths_1d(rows, cols):
    row = [1] * cols
    for _ in range(1, rows):
        for c in range(1, cols):
            row[c] += row[c - 1]
    return row[-1]

print(unique_paths_1d(3, 7), unique_paths_1d(18, 18))
print(3 * 7, 7)
```
Output:
```text
28 2333606220
21 7
```
### javascript
```javascript
function pascalRow(n) {
  const row = [1];
  for (let i = 1; i <= n; i++) {
    row.push(0);
    for (let j = i; j > 0; j--) {
      row[j] += row[j - 1];
    }
  }
  return row;
}

console.log(pascalRow(5).join(" "));
```
Output:
```text
1 5 10 10 5 1
```

## quiz
1. When can a dynamic programming grid be reduced to a single row?
   - [ ] When the grid is square
   - [x] When each cell depends only on the previous row and cells earlier in the current row
   - [ ] When the grid has no obstacles
   - [ ] Never
   > Earlier rows are never read again.
2. What space does the one-row version use?
   - [ ] O(r times c)
   - [x] O(c)
   - [ ] O(r squared)
   - [ ] O(1) always
   > Only one row of c entries is stored.
3. What can no longer be done after discarding earlier rows?
   - [ ] Computing the final answer
   - [x] Reconstructing the path that gave the answer
   - [ ] Reading the input
   - [ ] Counting cells
   > The choices made in earlier rows are gone.
4. Why does the Pascal row update run from right to left?
   - [ ] It is faster
   - [x] Each entry needs the old value of its left neighbour, which would be overwritten otherwise
   - [ ] The row is reversed
   - [ ] Arrays can only be updated backward
   > Overwriting in the wrong order corrupts the values still needed.

# Sparse Matrix Representations
kind: algorithm
time: O(nnz) to multiply a sparse matrix by a vector in compressed row format, where nnz is the number of non-zero entries, instead of O(r · c) for the dense form; looking up a single entry costs O(1) in a dictionary format and O(log k) in a row of k entries in compressed format with sorted columns.
space: O(nnz) for the coordinate and dictionary formats, and O(nnz + r) for compressed sparse row, instead of O(r · c) for the dense matrix.

## intro
Many large matrices are almost entirely zeros: the links between web pages, the interactions in a social network, the equations of a physical simulation. Storing every zero wastes memory and time. Sparse representations keep only the non-zero entries, which can reduce a matrix from terabytes to megabytes.

## theory
A matrix is sparse when most entries are zero; the density is nnz divided by r · c, and matrices with densities below a few percent are usually worth storing sparsely.

Common formats:

- Dictionary of keys (DOK): a hash map from (row, column) to value. Easy to build and update, constant-time lookup, no ordering; good while the matrix is being constructed.
- List of lists (LIL): for each row, a list of (column, value) pairs; convenient for row-by-row construction.
- Coordinate format (COO): three parallel arrays of equal length nnz: row indexes, column indexes and values. Simple and flexible, duplicates allowed, and the usual exchange format.
- Compressed sparse row (CSR): the entries of each row are stored contiguously in a `values` array with a matching `col_index` array, plus a `row_ptr` array of length r + 1 whose entry i tells where row i starts; row i occupies positions `row_ptr[i]` to `row_ptr[i+1] - 1`. Very efficient for row slicing and matrix-vector products; changes are expensive.
- Compressed sparse column (CSC): the same idea by columns, fast for column operations
- Special structures: diagonal, banded and block-sparse formats

Example: the matrix with rows `[0, 0, 3]`, `[4, 0, 0]`, `[0, 5, 6]` has nnz = 4. In CSR: `values = [3, 4, 5, 6]`, `col_index = [2, 0, 1, 2]`, `row_ptr = [0, 1, 2, 4]`.

Matrix-vector product in CSR: for each row i, sum `values[k] * x[col_index[k]]` over k from `row_ptr[i]` to `row_ptr[i+1] - 1`. Work is proportional to nnz.

Choosing: build in DOK, LIL or COO, then convert to CSR or CSC for arithmetic. Libraries (SciPy, Eigen, cuSPARSE) provide these formats and tuned algorithms. Sparse times sparse products and factorisations can suffer fill-in, where non-zeros appear that were zero before.

## explain
1. Measure the density to decide whether sparse storage pays off.
2. Pick a construction format: DOK or COO for gathering entries.
3. Convert to CSR for repeated row-oriented computations such as matrix-vector products.
4. Build row_ptr by counting entries per row and accumulating.
5. Verify against the dense version on small cases.
6. Remember that insertion into CSR is expensive and plan to rebuild rather than update.

## example
The dense matrix with three rows has nine entries but only four non-zeros. Building CSR row by row gives `values = [3, 4, 5, 6]`, `col_index = [2, 0, 1, 2]` and `row_ptr = [0, 1, 2, 4]`. Multiplying by the vector `[1, 2, 3]` visits only those four entries and gives `[9, 4, 28]`, equal to the dense calculation. The JavaScript sample stores the same entries in a `Map` keyed by row and column and sums a row.

## real
Search engines rank pages with enormous sparse link matrices, recommendation systems store user-item ratings sparsely, and finite element simulations assemble sparse systems with millions of equations.

## pros
- Memory and time proportional to non-zeros instead of all cells
- Enables problems that would not fit in memory densely
- Multiple formats suit construction and computation

## cons
- More complex code and indexing
- Random access and updates are slower or harder in compressed formats
- Fill-in can destroy sparsity during factorisations

## uses
- Graph adjacency of large sparse networks
- Linear systems from simulations
- Text and ratings data in machine learning
- Rankings based on link structure

## mistakes
- Using sparse formats for dense data and paying overhead
- Inserting entries one at a time into CSR
- Forgetting that explicit zeros may be stored in some formats
- Converting a huge sparse matrix to dense by accident

## interview
**Q:** What is the compressed sparse row format?
**A:** It stores the non-zero values in one array, their column indexes in a parallel array, and an array of row pointers that marks where each row starts, so each row's entries are contiguous.

**Q:** What is the cost of multiplying a CSR matrix by a vector?
**A:** O(nnz), proportional to the number of stored non-zero entries, instead of O(rows times columns) for a dense matrix.

**Q:** Which format is good for building a sparse matrix incrementally?
**A:** A dictionary of keys or coordinate list, which allow cheap insertion; convert to CSR afterwards for arithmetic.

## summary
Store only the non-zero entries: dictionaries or coordinates while building, compressed row or column formats for computing. Costs scale with the number of non-zeros, and the savings are dramatic for very sparse data.

## codenote
The Python sample builds CSR arrays, multiplies by a vector and checks against the dense result. The JavaScript sample uses a Map as a dictionary of keys.

## code
### python
```python
dense = [[0, 0, 3], [4, 0, 0], [0, 5, 6]]

values, col_index, row_ptr = [], [], [0]
for row in dense:
    for c, value in enumerate(row):
        if value:
            values.append(value)
            col_index.append(c)
    row_ptr.append(len(values))
print(values, col_index, row_ptr)

def csr_multiply(x):
    return [
        sum(values[k] * x[col_index[k]] for k in range(row_ptr[r], row_ptr[r + 1]))
        for r in range(len(dense))
    ]

vector = [1, 2, 3]
dense_result = [sum(a * b for a, b in zip(row, vector)) for row in dense]
print(csr_multiply(vector), csr_multiply(vector) == dense_result)
```
Output:
```text
[3, 4, 5, 6] [2, 0, 1, 2] [0, 1, 2, 4]
[9, 4, 28] True
```
### javascript
```javascript
const sparse = new Map();
sparse.set("0,2", 3);
sparse.set("1,0", 4);
sparse.set("2,1", 5);
sparse.set("2,2", 6);

const get = (r, c) => sparse.get(`${r},${c}`) ?? 0;
console.log(get(2, 2), get(0, 0), sparse.size);
```
Output:
```text
6 0 4
```

## quiz
1. What does the row_ptr array of CSR store?
   - [ ] The values
   - [x] The position in the values array where each row starts
   - [ ] The column numbers
   - [ ] The number of rows only
   > Row i occupies the positions from row_ptr[i] up to the next pointer.
2. What is the cost of multiplying a sparse matrix in CSR by a vector?
   - [ ] O(rows times columns)
   - [x] O(nnz)
   - [ ] O(log n)
   - [ ] O(rows squared)
   > Only the stored non-zero entries are visited.
3. Which format suits building a matrix by inserting entries one at a time?
   - [ ] CSR
   - [x] A dictionary of keys or a coordinate list
   - [ ] A dense array
   - [ ] CSC
   > Compressed formats make insertion expensive.
4. When is sparse storage worthwhile?
   - [ ] When most entries are non-zero
   - [x] When only a small fraction of the entries are non-zero
   - [ ] When the matrix is small and dense
   - [ ] When all entries are equal and non-zero
   > The savings come from skipping the zeros.
