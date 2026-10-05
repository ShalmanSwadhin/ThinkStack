# Matrix Representation
kind: algorithm
time: O(1) to read or write one element by row and column; O(r · c) to create, copy, fill or print an r by c matrix.
space: O(r · c) for the elements, plus O(r) extra row references when the matrix is stored as a list of rows.

## intro
A matrix is a rectangular grid of values arranged in rows and columns. In programs it models tables, images, game boards, graphs and systems of equations. Before doing any matrix algorithm you must decide how the grid is stored, because the representation controls both the code you write and the speed you get.

## theory
Mathematical view: an m by n matrix has m rows and n columns, and the element in row i and column j is written `A[i][j]` (programs count from zero). A square matrix has m equal to n. The identity matrix has ones on the main diagonal and zeros elsewhere. The shape (m, n) is part of the data and must be checked before operations.

Common storage choices:

- List of lists (nested arrays): `grid[r][c]`. Simple and flexible; each row is a separate object, rows can in principle have different lengths (jagged), and rows can be swapped cheaply by exchanging references.
- Flat one-dimensional array with computed indexes: element (r, c) is at `r * cols + c`. One block of memory, compact and cache-friendly, and trivial to copy; the shape is stored separately.
- Typed or numeric arrays (NumPy, typed arrays, `double[][]` in Java): fixed element type, no per-element object overhead
- Dictionaries or sparse formats when most entries are zero (see the sparse matrix lesson)
- A wrapper class that stores `rows`, `cols` and the data, and offers `get` and `set` with bounds checking

Design points:

- Validate shapes at creation: every row must have the same length
- Decide the indexing order once, row then column, and keep it everywhere
- Create each row separately; repeating one list reference would alias all rows
- Keep the dimensions together with the data so functions can check compatibility
- Choose the element type to fit the problem: integers for counts, floats for measurements, booleans or small integers for flags

Access by index is constant time in every representation. The costs differ in copying, memory overhead and traversal speed.

## explain
1. Write down the dimensions and what a row and a column mean in the problem.
2. Choose the representation: nested lists for clarity, a flat array for speed or interoperability.
3. Create the matrix with a fill value, making each row a separate list.
4. Wrap access in helper functions if you use the flat form, so the index formula lives in one place.
5. Validate shapes before every operation that combines matrices.
6. Test with a one-by-one matrix, a single row, a single column and a non-square matrix.

## example
The Python class `Matrix` stores `rows`, `cols` and one flat list. A 2 by 3 matrix filled with zeros has six entries; setting row 1, column 2 to 7 writes position `1 * 3 + 2` and setting row 0, column 0 to 1 writes position 0, so the data is `[1, 0, 0, 0, 0, 7]`. Reading (1, 2) returns 7 and the shape is `(2, 3)`. Slicing the flat list into rows reproduces the nested form, which the comparison confirms. The JavaScript sample builds a 3 by 3 identity matrix with `Array.from` and prints each row.

## real
Spreadsheets, images, chess boards, transformation matrices in graphics and adjacency matrices of networks all use this structure, and libraries such as NumPy exist to store and process matrices in flat typed blocks.

## pros
- Constant-time access to any element
- Natural fit for tables, grids and linear algebra
- Flat storage is compact and fast to traverse

## cons
- Memory grows with the product of the dimensions, even for mostly empty data
- Nested lists have per-row overhead and can alias rows by mistake
- Shape errors cause confusing failures if not validated

## uses
- Storing tables, boards and images
- Solving systems of equations and transformations
- Representing graphs as adjacency matrices
- Holding dynamic programming tables

## mistakes
- Building a matrix by repeating one row list
- Swapping the order of row and column indexes in some places
- Mixing jagged rows into code that assumes a rectangle
- Forgetting to store or check the dimensions with a flat array

## interview
**Q:** How do you map a 2D index to a flat array index?
**A:** For row-major storage, the index is row times the number of columns plus the column. The reverse mapping uses integer division and remainder by the number of columns.

**Q:** What is the identity matrix and why is it useful?
**A:** A square matrix with ones on the main diagonal and zeros elsewhere. Multiplying any matrix by it, when the shapes allow, leaves the matrix unchanged, so it plays the role of the number one.

**Q:** What are the trade-offs between nested lists and a flat array?
**A:** Nested lists are easier to read and allow cheap row swaps, while a flat array uses one contiguous block with less overhead and better cache behavior but needs index arithmetic.

## summary
A matrix is a grid with a fixed shape. Choose nested lists for clarity or a flat array for compactness, create rows separately, keep the dimensions with the data and validate shapes before combining matrices.

## codenote
The Python class stores a flat list and exposes row and column access. The JavaScript sample builds an identity matrix.

## code
### python
```python
class Matrix:
    def __init__(self, rows, cols, fill=0):
        self.rows = rows
        self.cols = cols
        self.data = [fill] * (rows * cols)

    def get(self, r, c):
        return self.data[r * self.cols + c]

    def set(self, r, c, value):
        self.data[r * self.cols + c] = value

m = Matrix(2, 3)
m.set(1, 2, 7)
m.set(0, 0, 1)
print(m.data, m.get(1, 2), (m.rows, m.cols))

nested = [[1, 0, 0], [0, 0, 7]]
print(nested == [m.data[i * 3:(i + 1) * 3] for i in range(2)])
```
Output:
```text
[1, 0, 0, 0, 0, 7] 7 (2, 3)
True
```
### javascript
```javascript
const size = 3;
const identity = Array.from({ length: size }, (_, i) =>
  Array.from({ length: size }, (_, j) => (i === j ? 1 : 0))
);

for (const row of identity) console.log(row.join(" "));
```
Output:
```text
1 0 0
0 1 0
0 0 1
```

## quiz
1. What is the flat index of row r, column c in a row-major matrix with cols columns?
   - [ ] r + c
   - [x] r times cols plus c
   - [ ] c times cols plus r
   - [ ] r times c
   > Each full row occupies cols positions.
2. What does the identity matrix contain?
   - [ ] All ones
   - [ ] All zeros
   - [x] Ones on the main diagonal and zeros elsewhere
   - [ ] The numbers 1 to n
   > Multiplying by it leaves a matrix unchanged.
3. Why create each row of a list-of-lists matrix separately?
   - [ ] To make it faster
   - [x] Repeating one row object would make every row the same list
   - [ ] Python requires it
   - [ ] To save memory
   > A shared row means a change appears in every row.
4. What should be checked before multiplying or adding two matrices?
   - [ ] Their element types only
   - [x] That their shapes are compatible
   - [ ] That they have the same name
   - [ ] That they are square
   > Operations are only defined for compatible dimensions.

# Row Major vs Column Major
kind: concept
time: Not applicable — the layout does not change the number of operations, but it changes the speed of traversal by a large constant factor because of caching. The lesson explains where each element lives.
space: Not applicable — both layouts store the same number of elements; only their order in memory differs.

## intro
Memory is a one-dimensional row of cells, so a two-dimensional matrix must be flattened. There are two natural ways: lay the matrix out row after row, or column after column. The choice is invisible in the maths but decides which loops run fast and how data crosses between languages and libraries.

## theory
Row-major order stores each row contiguously, so the elements of a row are neighbours in memory. The offset of element (r, c) in a matrix with `cols` columns is `r * cols + c`. C, C++, Java, Python (nested lists and NumPy by default), Rust, Go and JavaScript use row-major order.

Column-major order stores each column contiguously. The offset is `c * rows + r`. Fortran, MATLAB, R, Julia and many numerical libraries (BLAS and LAPACK) use column-major order.

Strides generalise both. The stride of a dimension is how many elements to skip to move one step along it. Row-major has strides `(cols, 1)`; column-major has `(1, rows)`. Transposing a matrix can then be done without moving data, simply by swapping the strides, and NumPy does exactly that.

Consequences:

- Traversal speed: walking along the contiguous dimension uses each cache line fully, while walking across it jumps by a whole row or column each step. In row-major storage, loop over rows in the outer loop and columns in the inner loop; in column-major, reverse that.
- Interoperability: passing a row-major buffer to a column-major routine without conversion silently produces the transpose. Data files, image formats and GPU libraries each document which order they use.
- Algorithms: matrix multiplication and transposition are reorganised (blocked) to fit the layout and the cache.
- Language differences affect how you read documentation: "the first index varies fastest" means column-major.

The same set of numbers read in the two orders is a different matrix: the buffer `1 2 3 4 5 6` is the 2 by 3 matrix with rows (1, 2, 3) and (4, 5, 6) in row-major order, and the matrix with columns (1, 2), (3, 4), (5, 6) in column-major order.

## explain
1. Find out which order the language, library or file format uses.
2. Use the offset formula for that order whenever you index a flat buffer.
3. Make the innermost loop walk the contiguous dimension.
4. When exchanging data with another system, convert or transpose explicitly.
5. Use strides, if the library offers them, to avoid copying for transposes.
6. Test with a non-square matrix, because square matrices hide index mix-ups.

## example
For the matrix with rows `[1, 2, 3]` and `[4, 5, 6]`, the row-major reading order is `[1, 2, 3, 4, 5, 6]` and the column-major order is `[1, 4, 2, 5, 3, 6]`. The element at row 0, column 2 is the value 3, found at offset `0 * 3 + 2 = 2` in the first and offset `2 * 2 + 0 = 4` in the second. The JavaScript sample reads the same six-element buffer with both formulas: asking for row 0, column 1 yields 2 in row-major and 3 in column-major, showing that the layout is a convention that must be agreed.

## real
Numerical code in Python meets Fortran libraries through wrappers that must account for the order, image libraries disagree about whether the first dimension is height or width, and unexplained transposed results are a classic bug when crossing library boundaries.

## pros
- Row-major matches how C-family languages and most text tables are written
- Column-major matches the conventions of numerical linear algebra
- Strides let one buffer serve several views without copying

## cons
- Mixing the two silently yields transposed data
- The wrong loop order can make a program several times slower
- Documentation sometimes uses ambiguous words such as "first index"

## uses
- Indexing flat buffers received from other libraries
- Ordering loops over images and tables
- Exchanging data with Fortran, MATLAB or R
- Understanding NumPy views and transposes

## mistakes
- Assuming every library stores matrices in row-major order
- Looping across the non-contiguous dimension in the inner loop
- Testing only square matrices, which hides mixed-up dimensions
- Copying data to transpose when a stride swap would do

## interview
**Q:** What is the difference between row-major and column-major order?
**A:** In row-major order the elements of each row are stored contiguously, so the offset of (r, c) is r times the number of columns plus c. In column-major order the elements of each column are contiguous, and the offset is c times the number of rows plus r.

**Q:** Why does the loop order matter for performance?
**A:** Memory is fetched in cache lines, so walking along the contiguous dimension uses every fetched element, while walking across it touches one element per line and causes many cache misses.

**Q:** How can a transpose be done without copying data?
**A:** By swapping the strides of the two dimensions in a view of the same buffer, so the same memory is interpreted in the other order.

## summary
Row-major stores rows contiguously and column-major stores columns contiguously. Know which one your tools use, loop along the contiguous dimension and convert or transpose explicitly at library boundaries.

## codenote
The Python sample lists the elements in both orders and computes both offsets. The JavaScript sample reads one buffer in two ways.

## code
### python
```python
rows, cols = 2, 3
grid = [[1, 2, 3], [4, 5, 6]]

row_major = [grid[r][c] for r in range(rows) for c in range(cols)]
column_major = [grid[r][c] for c in range(cols) for r in range(rows)]
print(row_major, column_major)

r, c = 0, 2
print(r * cols + c, c * rows + r)
print(row_major[r * cols + c], column_major[c * rows + r])
```
Output:
```text
[1, 2, 3, 4, 5, 6] [1, 4, 2, 5, 3, 6]
2 4
3 3
```
### javascript
```javascript
const buffer = new Int8Array([1, 2, 3, 4, 5, 6]);
const rows = 2;
const cols = 3;

const rowMajor = (r, c) => buffer[r * cols + c];
const columnMajor = (r, c) => buffer[c * rows + r];

console.log(rowMajor(0, 1), columnMajor(0, 1));
```
Output:
```text
2 3
```

## quiz
1. Which of these languages stores matrices in column-major order by default?
   - [ ] C
   - [ ] Java
   - [x] Fortran
   - [ ] Python lists
   > Fortran and MATLAB use column-major order.
2. What is the offset of (r, c) in a column-major matrix with rows rows?
   - [ ] r times rows plus c
   - [x] c times rows plus r
   - [ ] r plus c
   - [ ] r times c
   > Each full column occupies rows positions.
3. Why is looping over columns in the inner loop slow for row-major data?
   - [ ] Columns are longer
   - [x] Each step jumps by a whole row, so cache lines are poorly used
   - [ ] Row-major data cannot be indexed by column
   - [ ] It uses more memory
   > Contiguous access is much faster than strided access.
4. How does NumPy transpose a matrix without copying?
   - [ ] It sorts the data
   - [x] It swaps the strides in a view of the same memory
   - [ ] It deletes rows
   - [ ] It compresses the buffer
   > A different stride pattern reads the same buffer as the transpose.

# Matrix Traversal
kind: algorithm
time: O(r · c) to visit every cell of an r by c matrix; visiting the neighbours of one cell is O(1) because each cell has at most eight of them.
space: O(1) extra for a plain scan; O(r · c) in the worst case for a visited marker or the explicit stack of a flood fill.

## intro
Most matrix problems begin with walking over the cells in some order: row by row, column by column, along diagonals, or outward from a cell to its neighbours. Choosing the walk and getting the boundary checks right is the foundation for image filters, board games, path finding and region counting.

## theory
Basic traversals:

- Row-wise: outer loop over rows, inner over columns; the natural and fastest order for row-major storage
- Column-wise: outer loop over columns, inner over rows; use `zip(*grid)` in Python to obtain the columns
- Diagonal and anti-diagonal: cells with equal `r - c` or equal `r + c`
- Border or perimeter, spiral and layer-by-layer walks
- Reverse and zigzag orders

Neighbours of a cell (r, c):

- Four-directional: up, down, left and right, using the direction list `(-1, 0), (1, 0), (0, -1), (0, 1)`
- Eight-directional: add the four diagonal moves (kings in chess)
- Always check bounds before using a neighbour: `0 <= nr < rows` and `0 <= nc < cols`. Corner cells have 2 (or 3) neighbours, edge cells 3 (or 5) and interior cells 4 (or 8).

Region exploration (flood fill, counting islands): start from an unvisited cell with the target value, then repeatedly visit its neighbours with the same value, marking them visited. Depth-first search with an explicit stack or recursion, or breadth-first search with a queue, both cost O(r · c) because each cell is visited a constant number of times. Recursion can overflow on large grids, so prefer an explicit stack.

Practical tips: define the direction list once, use tuples for coordinates, mark visited cells in a separate matrix or by modifying the input if allowed, and test small grids including single rows and columns.

## explain
1. Decide the order: rows, columns, diagonals or spreading from a start cell.
2. Write the loops with the matrix dimensions taken from the data, not hard-coded.
3. For neighbour-based algorithms, define the direction vectors and the bounds check in one helper.
4. For regions, keep a visited marker and an explicit stack or queue.
5. Process each cell exactly once.
6. Test with empty, one-cell, one-row and one-column matrices and with an all-equal matrix.

## example
The neighbour helper returns `[(1, 0), (0, 1)]` for the corner (0, 0) of a 3 by 3 grid, while the center cell has 4 neighbours. Row sums of `[[1, 2, 3], [4, 5, 6], [7, 8, 9]]` are `[6, 15, 24]` and column sums, obtained by zipping the rows, are `[12, 15, 18]`. The JavaScript function counts regions of 1s in a 3 by 4 grid with an explicit stack: the top-left group and the bottom-right group are separate, so it prints 2.

## real
Image editors use flood fill for the paint bucket, games walk neighbours to compute moves and minesweeper counts, and map software counts connected regions of land or water.

## pros
- A few traversal patterns cover most grid problems
- Linear time in the number of cells
- Direction lists make neighbour code short and uniform

## cons
- Boundary checks are easy to forget
- Recursive flood fill can overflow the stack
- Column-wise walks over row-major data are slow

## uses
- Summing rows, columns and regions
- Counting neighbours in cellular automata and board games
- Counting islands and connected regions
- Image painting and filtering

## mistakes
- Indexing a neighbour outside the matrix
- Swapping row and column limits in the loop bounds
- Forgetting to mark cells as visited and looping forever
- Using deep recursion for large regions

## interview
**Q:** How do you visit the four neighbours of a cell safely?
**A:** Keep a list of direction offsets, add each to the cell's coordinates and check that the new row and column lie within the matrix before using them.

**Q:** What is the time complexity of counting connected regions in a grid?
**A:** O(rows times columns), since each cell is visited a constant number of times by the search that explores a region.

**Q:** Why prefer an explicit stack over recursion for flood fill?
**A:** A large region can be hundreds of thousands of cells deep, which overflows the call stack; an explicit stack lives on the heap and has no such limit.

## summary
Walk matrices row-wise for speed, use direction lists with bounds checks for neighbours, and use a visited marker with a stack or queue for regions. All of it is linear in the number of cells.

## codenote
The Python sample shows neighbour generation and row and column sums. The JavaScript sample counts connected regions with an explicit stack.

## code
### python
```python
DIRECTIONS = [(-1, 0), (1, 0), (0, -1), (0, 1)]

def neighbors(r, c, rows, cols):
    return [(r + dr, c + dc) for dr, dc in DIRECTIONS
            if 0 <= r + dr < rows and 0 <= c + dc < cols]

print(neighbors(0, 0, 3, 3), len(neighbors(1, 1, 3, 3)))

grid = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
print([sum(row) for row in grid], [sum(column) for column in zip(*grid)])
```
Output:
```text
[(1, 0), (0, 1)] 4
[6, 15, 24] [12, 15, 18]
```
### javascript
```javascript
function countRegions(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  const seen = grid.map((row) => row.map(() => false));
  let regions = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== 1 || seen[r][c]) continue;
      regions++;
      const stack = [[r, c]];
      seen[r][c] = true;
      while (stack.length) {
        const [cr, cc] = stack.pop();
        for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
          const nr = cr + dr;
          const nc = cc + dc;
          if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
          if (grid[nr][nc] === 1 && !seen[nr][nc]) {
            seen[nr][nc] = true;
            stack.push([nr, nc]);
          }
        }
      }
    }
  }
  return regions;
}

console.log(countRegions([
  [1, 1, 0, 0],
  [1, 0, 0, 1],
  [0, 0, 1, 1],
]));
```
Output:
```text
2
```

## quiz
1. How many four-directional neighbours does a corner cell have?
   - [ ] 4
   - [ ] 3
   - [x] 2
   - [ ] 1
   > A corner has only two neighbours inside the grid.
2. What must be checked before using a neighbour's coordinates?
   - [ ] That the cell is even
   - [x] That the row and column are within the matrix bounds
   - [ ] That the value is zero
   - [ ] That the cell was never read
   > Out-of-range access fails or reads the wrong cell.
3. What is the time complexity of visiting every cell of an r by c matrix?
   - [ ] O(r + c)
   - [x] O(r times c)
   - [ ] O(log r)
   - [ ] O(r squared)
   > Each cell is visited once.
4. Why mark cells as visited in a region search?
   - [ ] To sort them
   - [x] To avoid processing a cell more than once and looping forever
   - [ ] To save memory
   - [ ] To count the rows
   > Without marks the search would revisit neighbours endlessly.

# Matrix Transpose
kind: algorithm
time: O(r · c) to transpose an r by c matrix, since every element is moved once; O(1) for a stride-swapping view that copies nothing.
space: O(r · c) for a transposed copy of a rectangular matrix; O(1) extra for the in-place transpose of a square matrix.

## intro
The transpose of a matrix flips it over its main diagonal, so rows become columns: the element at row i, column j moves to row j, column i. It is one of the most common matrix operations and a good example of the difference between making a copy and working in place.

## theory
Definition: for an m by n matrix A, the transpose `A^T` is an n by m matrix with `A^T[j][i] = A[i][j]`. The transpose of the transpose is the original, and the transpose of a product reverses the order: `(AB)^T = B^T A^T`. A matrix equal to its transpose is symmetric.

Implementation options:

- New matrix: allocate n rows of m elements and copy each element to its mirrored position. Works for any shape, O(r · c) time and space. In Python, `list(zip(*grid))` produces tuples that can be converted back to lists.
- In place for a square matrix: swap `A[i][j]` with `A[j][i]` only for pairs where j is greater than i (the upper triangle), so every pair is swapped exactly once. Swapping for all pairs would transpose twice and leave the matrix unchanged.
- In place for a rectangle: much harder, because the shape changes; it needs cycle-following permutations of a flat array and is rarely worth the trouble
- View with swapped strides, as NumPy's `.T`: no data moves at all

Applications built on transpose:

- Rotating a square matrix 90 degrees clockwise: transpose, then reverse each row. Counter-clockwise: transpose, then reverse the order of the rows (or reverse each row, then transpose).
- Converting between row-major and column-major data
- Working with columns using row-oriented code
- Defining symmetric and orthogonal matrices, and solving least-squares problems

Memory behavior: a naive transpose reads along rows but writes along columns (or the reverse), which is cache-unfriendly for large matrices. Blocked transposition processes small tiles to keep both reads and writes within the cache.

## explain
1. Decide whether you need a new matrix or may modify the existing one.
2. For a copy, create a matrix with swapped dimensions and fill it by the rule `new[j][i] = old[i][j]`.
3. For a square matrix in place, loop i from 0 and j from i + 1, and swap the two mirrored elements.
4. For a rotation, transpose and then reverse each row.
5. Check that the result has the swapped shape.
6. Test with a square, a wide, a tall and a one-row matrix.

## example
Transposing `[[1, 2, 3], [4, 5, 6], [7, 8, 9]]` in place by swapping the upper triangle with the lower gives `[[1, 4, 7], [2, 5, 8], [3, 6, 9]]`. A 2 by 3 rectangle cannot be done in place, so zipping the rows gives the 3 by 2 result `[[1, 4], [2, 5], [3, 6]]`. Reversing each row of the transposed square matrix rotates the original 90 degrees clockwise, giving `[[7, 4, 1], [8, 5, 2], [9, 6, 3]]`. The JavaScript sample transposes a matrix with `map`.

## real
Graphics and machine learning pipelines transpose matrices constantly, image rotation uses transpose and reversal, and libraries expose the transpose as a free view so that large arrays are never copied.

## pros
- Simple rule that works for any shape with a copy
- In-place square transpose needs no extra memory
- Combines with row reversal to rotate images

## cons
- A copy doubles memory for large matrices
- Swapping every pair, not just the upper triangle, silently undoes the transpose
- Cache behavior is poor without blocking

## uses
- Rotating square matrices and images
- Switching between row and column orientation
- Working with symmetric matrices
- Preparing data for algorithms that need columns as rows

## mistakes
- Swapping all pairs and ending up with the original matrix
- Trying to transpose a rectangular matrix in place with the square algorithm
- Forgetting that the shape changes for non-square input
- Using the transpose when the inverse rotation was needed

## interview
**Q:** How do you transpose a square matrix in place?
**A:** Loop over the upper triangle, for each row i and each column j greater than i, and swap element (i, j) with element (j, i). Each pair is swapped once.

**Q:** How do you rotate a square matrix 90 degrees clockwise in place?
**A:** Transpose it, then reverse every row. Both steps work in place on a square matrix.

**Q:** What is a symmetric matrix?
**A:** A square matrix that equals its own transpose, so the element at (i, j) is the same as the element at (j, i).

## summary
Transposing swaps rows and columns: copy for any shape, swap the upper triangle for a square matrix in place, or swap strides in a view. Reversing the rows of the transpose rotates a square matrix clockwise.

## codenote
The Python sample transposes in place, by zipping and then rotates by reversing rows. The JavaScript sample transposes with map.

## code
### python
```python
def transpose_in_place(matrix):
    n = len(matrix)
    for i in range(n):
        for j in range(i + 1, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]

square = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
transpose_in_place(square)
print(square)

rectangle = [[1, 2, 3], [4, 5, 6]]
print([list(column) for column in zip(*rectangle)])

for row in square:
    row.reverse()
print(square)
```
Output:
```text
[[1, 4, 7], [2, 5, 8], [3, 6, 9]]
[[1, 4], [2, 5], [3, 6]]
[[7, 4, 1], [8, 5, 2], [9, 6, 3]]
```
### javascript
```javascript
const matrix = [[1, 2, 3], [4, 5, 6]];
const transposed = matrix[0].map((_, c) => matrix.map((row) => row[c]));
console.log(JSON.stringify(transposed));
```
Output:
```text
[[1,4],[2,5],[3,6]]
```

## quiz
1. What is the shape of the transpose of a 2 by 5 matrix?
   - [ ] 2 by 5
   - [x] 5 by 2
   - [ ] 10 by 1
   - [ ] 1 by 10
   > Rows and columns trade places.
2. Which pairs does an in-place square transpose swap?
   - [ ] Every pair of elements
   - [x] Each pair (i, j) and (j, i) once, for j greater than i
   - [ ] Only the diagonal
   - [ ] Only the first row
   > Swapping all pairs would undo the work.
3. How do you rotate a square matrix 90 degrees clockwise?
   - [ ] Reverse the columns only
   - [x] Transpose it and then reverse every row
   - [ ] Sort the rows
   - [ ] Swap the first and last rows
   > The two steps together form the clockwise rotation.
4. What is a symmetric matrix?
   - [ ] One with all equal elements
   - [x] One equal to its own transpose
   - [ ] One with only zeros
   - [ ] One with an odd number of rows
   > The elements mirror across the main diagonal.

# Matrix Multiplication Basics
kind: algorithm
time: O(m · n · p) for multiplying an m by n matrix with an n by p matrix using the definition; O(n³) for two n by n matrices. Faster algorithms such as Strassen's reach about O(n^2.81).
space: O(m · p) for the result matrix; O(1) extra beyond the output in the basic algorithm.

## intro
Matrix multiplication combines two matrices into a third, and it is the workhorse of graphics, physics, machine learning and network analysis. The rule looks odd at first, rows times columns, but it follows directly from composing linear transformations, and the triple loop that implements it is a classic example of cubic cost.

## theory
Definition: if A has m rows and n columns and B has n rows and p columns, their product C = AB has m rows and p columns, and
`C[i][j] = A[i][0]·B[0][j] + A[i][1]·B[1][j] + ... + A[i][n-1]·B[n-1][j]`,
the dot product of row i of A with column j of B.

Requirements and properties:

- The number of columns of A must equal the number of rows of B; otherwise the product is undefined
- Multiplication is associative, `(AB)C = A(BC)`, and distributes over addition
- It is generally not commutative: `AB` and `BA` differ, and one of them may not even exist
- The identity matrix I satisfies `AI = IA = A`
- Multiplying a matrix by a vector is the special case with p equal to 1

Algorithm: three nested loops, over i (rows of A), j (columns of B) and k (the shared dimension), accumulating the sum into `C[i][j]`. The number of scalar multiplications is m · n · p; for two 2 by 2 matrices that is 8, for a 2 by 3 times 3 by 4 product it is 24.

Performance notes:

- The loop order matters for caches: the order i, k, j reads rows of B contiguously and is usually faster than i, j, k in row-major storage
- Blocked (tiled) algorithms improve cache use further
- Strassen's algorithm and later improvements lower the exponent, but libraries mostly use highly tuned cubic algorithms (BLAS) because of constants and stability
- Powers of a matrix can be computed by repeated squaring in O(log k) multiplications, used for linear recurrences and counting paths in graphs

Typical applications: composing rotations and scalings in graphics, transition matrices in Markov chains, neural network layers, and counting walks of length k in a graph through the k-th power of its adjacency matrix.

## explain
1. Check the shapes: columns of A equal rows of B, and decide the result shape m by p.
2. Create the result matrix filled with zeros.
3. Loop over i and j, and compute the dot product of row i and column j.
4. Consider the loop order for cache efficiency in large cases.
5. Verify with the identity matrix and with a small case computed by hand.
6. Do not assume commutativity; keep the order of factors.

## example
Multiplying `[[1, 2], [3, 4]]` by `[[5, 6], [7, 8]]` gives `[[19, 22], [43, 50]]`: the first entry is 1 times 5 plus 2 times 7. Multiplying the same matrices in the other order gives `[[23, 34], [31, 46]]`, so the product is not commutative. Multiplying by the identity returns the original matrix, which the program confirms. A 2 by 3 matrix times a 3 by 4 matrix needs 2 times 3 times 4 = 24 multiplications. The JavaScript sample refuses to multiply incompatible shapes by throwing an error.

## real
Every neural network layer is a matrix product, 3D engines multiply transformation matrices for every object in every frame, and scientific computing spends much of its time in tuned matrix multiplication routines.

## pros
- A single operation expresses combined transformations and linear systems
- Well-understood, with extremely optimised libraries
- Associativity allows grouping to minimise cost

## cons
- Cubic cost grows quickly with size
- Not commutative, so order mistakes change results
- Shape mismatches are a frequent error

## uses
- Combining transformations in graphics
- Neural network layers and linear regression
- Counting paths in graphs through powers of the adjacency matrix
- Solving linear recurrences quickly

## mistakes
- Multiplying element by element and calling it matrix multiplication
- Swapping the order of the factors
- Not checking that the inner dimensions match
- Using a naive loop for very large matrices instead of an optimised library

## interview
**Q:** When can two matrices be multiplied and what is the shape of the result?
**A:** When the number of columns of the first equals the number of rows of the second. An m by n matrix times an n by p matrix gives an m by p matrix.

**Q:** What is the time complexity of the standard algorithm for two n by n matrices?
**A:** O(n cubed), because there are n squared result entries and each is a dot product of n pairs.

**Q:** Is matrix multiplication commutative?
**A:** No. AB and BA are generally different, and one of them may not even be defined when the matrices are not square.

## summary
The product of an m by n and an n by p matrix is the m by p matrix of row and column dot products, costing m times n times p multiplications. It is associative, not commutative, and has the identity as a neutral element.

## codenote
The Python sample multiplies in both orders, tests the identity and counts multiplications. The JavaScript sample checks shape compatibility.

## code
### python
```python
def multiply(a, b):
    rows, inner, cols = len(a), len(b), len(b[0])
    result = [[0] * cols for _ in range(rows)]
    for i in range(rows):
        for j in range(cols):
            for k in range(inner):
                result[i][j] += a[i][k] * b[k][j]
    return result

a = [[1, 2], [3, 4]]
b = [[5, 6], [7, 8]]
identity = [[1, 0], [0, 1]]

print(multiply(a, b))
print(multiply(b, a))
print(multiply(a, identity) == a, 2 * 3 * 4)
```
Output:
```text
[[19, 22], [43, 50]]
[[23, 34], [31, 46]]
True 24
```
### javascript
```javascript
function multiply(a, b) {
  if (a[0].length !== b.length) {
    throw new Error("shape mismatch");
  }
  return a.map((row) =>
    b[0].map((_, j) => row.reduce((sum, value, k) => sum + value * b[k][j], 0))
  );
}

console.log(JSON.stringify(multiply([[1, 2, 3]], [[1], [2], [3]])));
try {
  multiply([[1, 2]], [[1, 2]]);
} catch (error) {
  console.log(error.message);
}
```
Output:
```text
[[14]]
shape mismatch
```

## quiz
1. When is the product of A (m by n) and B (p by q) defined?
   - [ ] When m equals p
   - [x] When n equals p
   - [ ] When m equals q
   - [ ] Always
   > The columns of A must match the rows of B.
2. What is the shape of the product of a 2 by 3 and a 3 by 4 matrix?
   - [ ] 3 by 3
   - [x] 2 by 4
   - [ ] 4 by 2
   - [ ] 3 by 4
   > The outer dimensions give the result shape.
3. What is the time complexity of the standard algorithm for two n by n matrices?
   - [ ] O(n)
   - [ ] O(n squared)
   - [x] O(n cubed)
   - [ ] O(log n)
   > Each of the n squared entries needs n multiplications.
4. Which statement about matrix multiplication is true?
   - [ ] It is always commutative
   - [x] It is associative but generally not commutative
   - [ ] It works element by element
   - [ ] It requires square matrices
   > The order of the factors matters, and associativity is the property that holds.

# Spiral Matrix Traversal
kind: algorithm
time: O(r · c) since every cell is visited exactly once, whatever the order.
space: O(1) extra beyond the output list of r · c values when four boundary pointers are used; O(r · c) if a visited matrix is used instead.

## intro
Reading a matrix in a spiral, clockwise from the top-left corner and winding inward, is a favourite exercise because it combines index discipline, boundary handling and careful termination. The same pattern generates spiral matrices, prints layers and tests whether you can maintain several invariants at once.

## theory
Two standard approaches:

- Shrinking boundaries: keep four limits, `top`, `bottom`, `left` and `right`. Repeat while `top <= bottom` and `left <= right`: walk the top row from left to right and increment top; walk the right column from top to bottom and decrement right; if rows remain, walk the bottom row from right to left and decrement bottom; if columns remain, walk the left column from bottom to top and increment left. The two guard checks are essential to avoid walking a row or column twice when only one remains.
- Direction vectors and a visited matrix: move in the current direction (right, down, left, up) until the next cell is out of bounds or visited, then turn clockwise. Simpler to reason about, but needs O(r · c) extra space.

Variants and related problems:

- Spiral order for non-square matrices (the guard checks handle them)
- Counter-clockwise or starting at another corner
- Generating an n by n spiral matrix with the numbers 1 to n squared
- Layer-by-layer rotation of a matrix (the layer is the ring between the current limits)
- Printing the ring or perimeter only

Correctness points: every cell is visited exactly once; the loop ends when a boundary crosses; after the top row and right column are done, the bottom row may already have been consumed (when top has passed bottom) and the left column may already have been consumed (when left has passed right), which the guards detect.

Edge cases that fail naive code: a single row, a single column, a 1 by 1 matrix, and rectangles with an odd number of rows or columns, where the last layer is a line instead of a ring.

## explain
1. Initialise the four boundaries to the edges of the matrix.
2. Walk the top row, then move top down by one.
3. Walk the right column from the new top to the bottom, then move right left by one.
4. If top is still not past bottom, walk the bottom row backward and move bottom up.
5. If left is still not past right, walk the left column upward and move left in.
6. Repeat while the boundaries have not crossed, and test the edge shapes.

## example
For the 3 by 3 matrix with rows `[1, 2, 3]`, `[4, 5, 6]` and `[7, 8, 9]`, the spiral reads `[1, 2, 3, 6, 9, 8, 7, 4, 5]` with the center element last. For the 3 by 4 matrix with rows up to 12, the order is `[1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]`, where the last ring is a single row, which is why the guards matter. The JavaScript version uses direction vectors and a visited matrix and prints the same order for the square case.

## real
Spiral reading appears in image processing, in printing and tiling algorithms and in game maps, and it is a frequent interview question because small boundary mistakes show up immediately.

## pros
- Linear time with constant extra space using boundaries
- The direction-vector version is easy to get right
- The pattern generalises to generating spirals

## cons
- Boundary guards are easy to miss
- Rectangles with a single remaining row or column break naive code
- The visited-matrix method uses extra memory

## uses
- Reading or writing a matrix in spiral order
- Generating spiral numbered grids
- Layer-by-layer processing such as rotating a matrix in place
- Practising boundary handling for interviews

## mistakes
- Omitting the checks before walking the bottom row and left column
- Walking a single remaining row twice
- Mixing inclusive and exclusive ends of a range
- Forgetting to update a boundary after each side

## interview
**Q:** How do you traverse a matrix in spiral order with constant extra space?
**A:** Maintain top, bottom, left and right boundaries. Walk the top row, right column, bottom row and left column in turn, shrinking the corresponding boundary after each side, and stop when they cross.

**Q:** Why are the checks before the bottom row and left column needed?
**A:** After the top row and right column are consumed, only a single row or column may remain, and without the checks it would be read a second time.

**Q:** What is the time complexity of the spiral traversal?
**A:** O(rows times columns), because each cell is visited exactly once.

## summary
A spiral traversal shrinks four boundaries as it walks the sides of each ring. Guard the bottom row and left column, test single rows and columns, and expect linear time with constant extra space.

## codenote
The Python sample uses boundary pointers for square and rectangular matrices. The JavaScript sample uses direction vectors and a visited matrix.

## code
### python
```python
def spiral(matrix):
    result = []
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1
    while top <= bottom and left <= right:
        result += matrix[top][left:right + 1]
        top += 1
        for r in range(top, bottom + 1):
            result.append(matrix[r][right])
        right -= 1
        if top <= bottom:
            result += matrix[bottom][left:right + 1][::-1]
            bottom -= 1
        if left <= right:
            for r in range(bottom, top - 1, -1):
                result.append(matrix[r][left])
            left += 1
    return result

print(spiral([[1, 2, 3], [4, 5, 6], [7, 8, 9]]))
print(spiral([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]))
```
Output:
```text
[1, 2, 3, 6, 9, 8, 7, 4, 5]
[1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]
```
### javascript
```javascript
function spiral(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const seen = matrix.map((row) => row.map(() => false));
  const moves = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  const order = [];
  let r = 0;
  let c = 0;
  let direction = 0;

  for (let i = 0; i < rows * cols; i++) {
    order.push(matrix[r][c]);
    seen[r][c] = true;
    let nr = r + moves[direction][0];
    let nc = c + moves[direction][1];
    if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || seen[nr][nc]) {
      direction = (direction + 1) % 4;
      nr = r + moves[direction][0];
      nc = c + moves[direction][1];
    }
    r = nr;
    c = nc;
  }
  return order;
}

console.log(spiral([[1, 2, 3], [4, 5, 6], [7, 8, 9]]).join(" "));
```
Output:
```text
1 2 3 6 9 8 7 4 5
```

## quiz
1. What is the spiral order of a 2 by 2 matrix with rows [1, 2] and [3, 4]?
   - [ ] 1, 2, 3, 4
   - [x] 1, 2, 4, 3
   - [ ] 1, 3, 4, 2
   - [ ] 4, 3, 2, 1
   > The walk goes right, down, then left.
2. Why must the bottom row be guarded by top less than or equal to bottom?
   - [ ] It speeds up the code
   - [x] A single remaining row would otherwise be read twice
   - [ ] The rows are sorted
   - [ ] It avoids negative indexes
   > After the top row is consumed there may be no row left.
3. What extra space does the boundary-pointer method need besides the output?
   - [ ] O(r times c)
   - [x] O(1)
   - [ ] O(r)
   - [ ] O(log n)
   > Only four integers are kept.
4. How many times is each cell visited in a spiral traversal?
   - [ ] Twice
   - [x] Exactly once
   - [ ] Depends on the row
   - [ ] Zero times for the center
   > Every cell appears once in the output.

# Diagonal Operations
kind: algorithm
time: O(n) to read one diagonal of an n by n matrix, and O(r · c) to group every cell by its diagonal in an r by c matrix.
space: O(1) for a single diagonal sum, and O(r · c) when all diagonals are collected.

## intro
Diagonals of a matrix are lines of cells running from corner to corner, and a surprising number of problems depend on them: the trace of a matrix, symmetry tests, queens that attack along diagonals, and patterns like Toeplitz matrices. A single observation about the indexes makes them all easy.

## theory
Index relations:

- Main diagonal: cells with `r == c`, running from the top-left to the bottom-right
- Anti-diagonal: cells with `r + c == n - 1` in an n by n matrix, running from the top-right to the bottom-left
- Any diagonal parallel to the main one is identified by the constant difference `r - c`; there are `r + c - 1` of them in an r by c matrix, numbered from `-(c - 1)` to `r - 1`
- Any diagonal parallel to the anti-diagonal is identified by the constant sum `r + c`; there are also `r + c - 1` of them (numbered from 0 to `r + c - 2`)

Useful operations:

- Trace: the sum of the main diagonal, defined for square matrices, equal to the sum of the eigenvalues
- Reading or summing a diagonal in O(n)
- Grouping cells by `r - c` or `r + c` with a dictionary: the keys are the diagonal ids
- Checking whether a matrix is diagonal, upper triangular (zeros below the main diagonal) or lower triangular
- Toeplitz test: a matrix is Toeplitz if every diagonal has constant values, which holds exactly when each cell equals the one diagonally up and to its left
- Traversing all diagonals in order, a staple of zigzag problems
- N-Queens: two queens attack each other diagonally if they share `r - c` or `r + c`, which lets solvers keep constant-time diagonal occupancy sets

Edge cases: a 1 by 1 matrix has one cell on both diagonals; for odd n the center cell lies on both diagonals, so naive sums of both diagonals count it twice.

## explain
1. Decide which diagonal family you need: parallel to the main or to the anti-diagonal.
2. Use the identifying quantity: difference r minus c, or sum r plus c.
3. For a single diagonal, loop over the index and use the formula directly.
4. For all diagonals, group cells in a dictionary keyed by the quantity.
5. For tests such as Toeplitz, compare each cell with its up-left neighbour.
6. Watch the center cell of odd-sized matrices when combining both diagonals.

## example
For `[[1, 2, 3], [4, 5, 6], [7, 8, 9]]` the main diagonal is `[1, 5, 9]` with trace 15 and the anti-diagonal is `[3, 5, 7]`. Grouping by `r - c` gives the five diagonals `{-2: [3], -1: [2, 6], 0: [1, 5, 9], 1: [4, 8], 2: [7]}`. The JavaScript `toeplitz` function compares every cell with the one up and left: the matrix `[[1, 2, 3], [4, 1, 2], [7, 4, 1]]` passes and `[[1, 2], [2, 2]]` fails.

## real
Chess engines track diagonals with bit patterns, image processing uses diagonal filters, and numerical code exploits banded and triangular matrices that have structure along diagonals.

## pros
- Simple formulas identify any diagonal
- Grouping by difference or sum turns 2D geometry into dictionary keys
- Enables constant-time diagonal conflict checks

## cons
- Off-by-one and sign mistakes are common
- The shared center cell of odd matrices is double counted if forgotten
- Non-square matrices have no true main anti-diagonal formula using n minus 1

## uses
- Computing the trace and diagonal sums
- Checking triangular, diagonal and Toeplitz properties
- N-Queens style conflict detection
- Zigzag and diagonal-order traversals

## mistakes
- Using r + c equals n minus 1 on a rectangular matrix
- Counting the center cell twice when summing both diagonals
- Mixing up the difference and the sum as diagonal identifiers
- Looping over the wrong dimension for a non-square matrix

## interview
**Q:** How can you tell whether two cells are on the same diagonal?
**A:** They are on the same main-direction diagonal if the difference of row and column is equal, and on the same anti-direction diagonal if the sum of row and column is equal.

**Q:** What is the trace of a matrix?
**A:** The sum of the elements on the main diagonal of a square matrix.

**Q:** How many diagonals parallel to the main diagonal does an r by c matrix have?
**A:** r plus c minus 1, one for each possible value of row minus column.

## summary
Diagonals are identified by row minus column in one direction and row plus column in the other. Use those quantities to read, group and test diagonals, and remember the shared center cell of odd square matrices.

## codenote
The Python sample reads both diagonals and groups all cells by row minus column. The JavaScript sample tests the Toeplitz property.

## code
### python
```python
from collections import defaultdict

matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
n = len(matrix)

main = [matrix[i][i] for i in range(n)]
anti = [matrix[i][n - 1 - i] for i in range(n)]
print(main, anti, sum(main))

diagonals = defaultdict(list)
for r in range(n):
    for c in range(n):
        diagonals[r - c].append(matrix[r][c])
print(dict(sorted(diagonals.items())))
```
Output:
```text
[1, 5, 9] [3, 5, 7] 15
{-2: [3], -1: [2, 6], 0: [1, 5, 9], 1: [4, 8], 2: [7]}
```
### javascript
```javascript
const isToeplitz = (m) =>
  m.every((row, r) =>
    row.every((value, c) => r === 0 || c === 0 || value === m[r - 1][c - 1])
  );

console.log(isToeplitz([[1, 2, 3], [4, 1, 2], [7, 4, 1]]));
console.log(isToeplitz([[1, 2], [2, 2]]));
```
Output:
```text
true
false
```

## quiz
1. Which condition identifies the main diagonal of a square matrix?
   - [ ] r plus c equals n
   - [x] r equals c
   - [ ] r equals 0
   - [ ] c equals n
   > The row and column indexes are equal on the main diagonal.
2. What stays constant along an anti-diagonal?
   - [ ] The difference r minus c
   - [x] The sum r plus c
   - [ ] The row
   - [ ] The column
   > Moving down-left increases the row and decreases the column.
3. How many diagonals parallel to the main one does a 3 by 4 matrix have?
   - [ ] 3
   - [ ] 4
   - [x] 6
   - [ ] 12
   > It is 3 plus 4 minus 1.
4. What is double counted when summing both diagonals of an odd-sized square matrix?
   - [ ] The first element
   - [x] The center element
   - [ ] The last row
   - [ ] Nothing
   > The center lies on both diagonals.
