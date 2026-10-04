# Array Memory Layout
kind: concept
time: Not applicable — the layout explains why reading any element takes constant time, but this lesson is about how elements are arranged in memory.
space: Not applicable — an array of n elements of size s occupies n times s bytes plus a small header, a fact that follows from the layout rather than from an algorithm.

## intro
An array is a block of memory holding elements of the same type one after another with no gaps. That simple arrangement is the reason indexing is instant, loops over arrays are fast, and inserting in the middle is slow. Everything else about arrays follows from the layout.

## theory
The key properties of an array in memory:

- Contiguous: the elements occupy consecutive addresses, starting at the base address
- Homogeneous: every element has the same size, so the position of any element can be computed
- Address formula: the address of element i is `base + i * element_size`. This is one multiplication and one addition, independent of the array's length, which is why indexing is O(1).
- Zero-based indexing follows from the formula: the first element is at offset 0
- The total size is `length * element_size`; a four-element array of 4-byte integers occupies 16 bytes

Consequences:

- Random access is constant time; searching for a value is not
- Inserting or deleting in the middle requires shifting every later element, which is O(n)
- Contiguity makes arrays cache-friendly: one cache line holds several neighbours, so sequential traversal is very fast
- The size must be known to allocate, so growing requires allocating a larger block and copying (see dynamic arrays)

Language variations:

- C and C++ arrays, and Java arrays of primitives, hold the values directly
- Python's built-in list is an array of references: the list is contiguous, but each slot holds a pointer to an object elsewhere in memory, so the values themselves may be scattered. Python's `array` module, NumPy arrays and JavaScript typed arrays store raw values contiguously.
- Multidimensional arrays are flattened into one block in row-major order (rows one after another) in C-family languages and NumPy, and column-major in Fortran and MATLAB, so element (r, c) of an array with `cols` columns is at offset `r * cols + c`

The address formula is also what makes out-of-bounds access dangerous in C: nothing checks that i is within the array before computing the address.

## explain
1. Picture memory as a row of numbered boxes; an array reserves a run of adjacent boxes.
2. To find element i, jump i boxes (times the box size) from the start; no searching is needed.
3. To insert in the middle, every later element must be moved one place to make a gap.
4. To grow the array, find a bigger free run, copy everything and release the old run.
5. For two dimensions, decide the order (rows first or columns first) and use the flattening formula.
6. Remember that Python lists store references, so summing a list of numbers touches both the list and the number objects.

## example
The Python `array` module stores real machine integers. An array of four ints reports an item size of 4 bytes and a length of 4, so it occupies 16 bytes. Reading raw memory at the base address plus index times 4 returns the elements `[10, 20, 30, 40]`, which is exactly the address formula in action. The JavaScript sample flattens a 3 by 4 grid into an `Int32Array` and sets row 1, column 2 using the offset `1 * 4 + 2`, which lands at flat position 6; the buffer is 48 bytes. The C program, not run here, prints the size of an array and the distance between consecutive elements.

## real
Image buffers, audio samples, database pages and numerical arrays are contiguous blocks, and libraries like NumPy are fast because they exploit this layout, using one tight loop over contiguous memory instead of chasing pointers.

## pros
- Constant-time access to any element by index
- Compact storage with no per-element overhead
- Excellent cache behavior for sequential access

## cons
- Fixed size once allocated
- Insertion and deletion in the middle shift many elements
- A large contiguous block may be hard to find in fragmented memory

## uses
- Storing sequences of numbers, characters and records
- Image, audio and matrix data
- Implementing stacks, queues, heaps and hash tables
- Lookup tables indexed by small integers

## mistakes
- Assuming Python lists store values contiguously like C arrays
- Forgetting the element size when computing byte offsets
- Reading outside the block in C where nothing checks the index
- Choosing an array when frequent insertions in the middle dominate

## interview
**Q:** Why is array indexing O(1)?
**A:** Because elements are stored contiguously with equal size, so the address of element i is the base address plus i times the element size, a single calculation regardless of the array's length.

**Q:** Why is inserting in the middle of an array O(n)?
**A:** All elements after the insertion point must be shifted one position to make room, and in the worst case that is every element.

**Q:** How is a 2D array stored in memory in C?
**A:** In row-major order: all of row 0, then row 1, and so on, so element (r, c) is at offset r times the number of columns plus c.

## summary
Arrays are contiguous blocks of equal-sized elements, so element i lives at base plus i times the size. This gives constant-time indexing and fast traversal but costly insertion and a fixed size.

## codenote
The Python sample reads raw memory using the address formula. The JavaScript sample flattens a grid by row-major offsets. The C program prints the size and spacing of an array.

## code
### python
```python
import ctypes
from array import array

numbers = array("i", [10, 20, 30, 40])
address, length = numbers.buffer_info()
print(numbers.itemsize, length, numbers.itemsize * length)

step = numbers.itemsize
print([ctypes.c_int.from_address(address + i * step).value for i in range(length)])
```
Output:
```text
4 4 16
[10, 20, 30, 40]
```
### javascript
```javascript
const rows = 3;
const cols = 4;
const grid = new Int32Array(rows * cols);

grid[1 * cols + 2] = 7;
console.log(grid.join(" "), grid.byteLength);
```
Output:
```text
0 0 0 0 0 0 7 0 0 0 0 0 48
```
### c
```c
#include <stdio.h>

int main(void) {
    int values[4] = {10, 20, 30, 40};
    printf("%zu bytes in total\n", sizeof(values));
    printf("%td bytes between elements\n",
           (char *)&values[1] - (char *)&values[0]);
    return 0;
}
```

## quiz
1. What is the address of element i in an array?
   - [ ] base plus i
   - [x] base plus i times the element size
   - [ ] base times i
   - [ ] base minus i
   > The element size scales the index.
2. Why is traversing a C array fast?
   - [ ] Because arrays are stored on disk
   - [x] Neighbouring elements share cache lines, so memory is read efficiently
   - [ ] Because indexes start at 0
   - [ ] Because arrays cannot change
   > Contiguity gives excellent spatial locality.
3. How does Python's built-in list differ from a C array?
   - [ ] It is not ordered
   - [x] It stores references to objects rather than the values themselves
   - [ ] It cannot be indexed
   - [ ] It has a fixed size
   > The slots are contiguous but each holds a pointer.
4. Where is element (2, 1) of a 3 by 4 row-major array?
   - [ ] Offset 3
   - [ ] Offset 6
   - [x] Offset 9
   - [ ] Offset 12
   > The offset is 2 times 4 plus 1.

# Static vs Dynamic Arrays
kind: algorithm
time: Indexing is O(1) for both. Appending to a dynamic array is O(1) amortised, with an occasional O(n) resize; inserting or deleting in the middle is O(n) for both kinds. A static array cannot grow at all.
space: O(n) for the elements. A dynamic array may hold up to about twice as much capacity as elements, because of the growth strategy, and needs a temporary second block while it resizes.

## intro
A static array has a size fixed when it is created, while a dynamic array can grow and shrink as items are added and removed. Most everyday languages offer the dynamic kind (Python lists, Java ArrayList, C++ vector, JavaScript arrays), and understanding how it works underneath explains its costs.

## theory
Static array:

- Size is set at creation (a fixed-size array in C, Java arrays, typed arrays) and cannot change
- Memory is allocated once, contiguously; no resizing cost, no wasted capacity if sized well
- Adding more elements than it holds requires creating a new array and copying by hand

Dynamic array (resizable array, vector):

- Wraps a static array of some capacity and tracks the number of elements currently used (the size)
- Appending writes to the next free slot when size is less than capacity: O(1)
- When the array is full, it allocates a new block with larger capacity, copies all elements and releases the old block: O(n) for that one append
- Growth factor: doubling (or 1.5 times) the capacity makes resizes rare. With doubling, a sequence of n appends copies about 1 + 2 + 4 + ... + n/2, less than n elements in total, so the average cost per append is constant: this is amortised O(1)
- Growing by a fixed amount instead (add 10 slots each time) would copy about n²/20 elements in total, which is quadratic and much worse
- Shrinking policies release memory when the array is mostly empty, usually when it falls below a quarter full, to avoid repeated resize at a boundary

Trade-offs: dynamic arrays waste up to half their capacity, an individual append can be slow (a latency spike), and references or pointers into the array can become invalid after a resize. If the final size is known, reserving capacity up front (`reserve` in C++, the capacity argument of Java's ArrayList) avoids the copying.

JavaScript note: typed arrays are static; ordinary arrays are dynamic and engines choose internal representations behind the scenes. In Python, `list.append` is amortised constant time with a mild over-allocation of about one eighth.

## explain
1. Decide whether the size is known in advance. If so, a static array (or a reserved dynamic array) is enough.
2. If not, use a dynamic array and rely on amortised O(1) appends.
3. Understand that resizing allocates, copies and frees, so references to old storage break.
4. For large known sizes, reserve capacity to avoid repeated copying.
5. Choose the growth factor by the trade-off between wasted memory and copying.
6. Use a different structure, such as a linked list or deque, if insertion at the front dominates.

## example
The Python class `DynamicArray` starts with capacity 1 and doubles whenever it is full, counting the elements it copies. After 16 appends, the size is 16, the capacity is 16 and 15 element copies happened in total (1 + 2 + 4 + 8), less than the number of appends. The 17th append triggers one more resize to capacity 32 with 16 more copies, giving 31. The JavaScript sample shows that a typed array has no push method because its length is fixed, while an ordinary array grows with each push. The C program, not run here, contrasts a fixed array with a growing buffer.

## real
Nearly every program uses a dynamic array for lists of items whose number is unknown at the start, and performance engineers reserve capacity for large lists to avoid the cost of repeated resizing.

## pros
- Static arrays have no resize cost and predictable memory
- Dynamic arrays grow as needed with amortised constant-time append
- Both keep constant-time indexing and cache-friendly layout

## cons
- Static arrays cannot grow
- Dynamic arrays waste capacity and have occasional slow appends
- Resizing invalidates references into the old storage

## uses
- Static arrays for fixed tables, buffers and embedded systems
- Dynamic arrays for lists, queues and collections of unknown size
- Reserving capacity for large collections built in a loop
- Building stacks and heaps on top of arrays

## mistakes
- Keeping an index or pointer to an element across an operation that may resize the array
- Growing by a fixed increment and ending up with quadratic cost
- Assuming that every append is O(1) in the worst case
- Using a dynamic array when many insertions at the front are needed

## interview
**Q:** What is the amortised cost of appending to a dynamic array?
**A:** O(1). Individual appends that trigger a resize cost O(n), but resizes happen rarely when capacity doubles, so the average over many appends is constant.

**Q:** Why double the capacity instead of adding a fixed amount?
**A:** Doubling makes the total copying cost linear in the number of appends, while adding a fixed amount makes it quadratic.

**Q:** What is the difference between the size and the capacity of a dynamic array?
**A:** Size is the number of elements currently stored; capacity is the number of slots allocated, which is at least the size.

## summary
Static arrays are fixed in size, and dynamic arrays wrap them and resize by allocating a bigger block and copying. Doubling the capacity makes append amortised constant time, at the price of some wasted space and occasional slow appends.

## codenote
The Python class counts copies during growth. The JavaScript lines contrast fixed and growing arrays. The C program shows both kinds.

## code
### python
```python
class DynamicArray:
    def __init__(self):
        self.capacity = 1
        self.size = 0
        self.data = [None] * self.capacity
        self.copies = 0

    def append(self, value):
        if self.size == self.capacity:
            self.capacity *= 2
            bigger = [None] * self.capacity
            for i in range(self.size):
                bigger[i] = self.data[i]
                self.copies += 1
            self.data = bigger
        self.data[self.size] = value
        self.size += 1

array = DynamicArray()
for value in range(16):
    array.append(value)
print(array.size, array.capacity, array.copies)

array.append(16)
print(array.size, array.capacity, array.copies)
```
Output:
```text
16 16 15
17 32 31
```
### javascript
```javascript
console.log(typeof Int8Array.prototype.push);

const list = [];
for (let i = 0; i < 5; i++) list.push(i);
console.log(list.length);
```
Output:
```text
undefined
5
```
### c
```c
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int fixed[4] = {1, 2, 3, 4};

    int capacity = 2;
    int size = 0;
    int *growing = malloc(capacity * sizeof(int));
    for (int i = 0; i < 5; i++) {
        if (size == capacity) {
            capacity *= 2;
            growing = realloc(growing, capacity * sizeof(int));
        }
        growing[size++] = i;
    }
    printf("%d %d %d\n", fixed[3], size, capacity);
    free(growing);
    return 0;
}
```

## quiz
1. Why is appending to a dynamic array amortised O(1)?
   - [ ] It never resizes
   - [x] Resizes are rare because capacity doubles, so the cost spreads over many appends
   - [ ] It uses a linked list
   - [ ] It skips copying
   > The total copying over n appends is less than n elements.
2. What happens when a dynamic array is full and an element is appended?
   - [ ] The program stops
   - [x] A larger block is allocated, elements are copied, and the old block is freed
   - [ ] The oldest element is deleted
   - [ ] Nothing, it just writes past the end
   > Resizing preserves the elements in a bigger contiguous block.
3. What is wrong with growing by a fixed number of slots each time?
   - [ ] It uses too little memory
   - [x] The total copying becomes quadratic
   - [ ] It is impossible
   - [ ] It removes indexing
   > Many resizes each copy a growing number of elements.
4. What is the difference between size and capacity?
   - [ ] They are always equal
   - [x] Size is the number of stored elements, capacity the number of allocated slots
   - [ ] Capacity counts only the first element
   - [ ] Size is the number of bytes
   > Capacity is at least the size.

# Indexing and Bounds
kind: algorithm
time: O(1) per index access in any array. Finding the index of a value by scanning is O(n). Slicing a range costs time proportional to the number of elements copied.
space: O(1) for an access; checking the bound adds no memory.

## intro
Indexing selects an element by its position, and bounds are the limits within which an index is valid. Most array bugs live at the edges: off-by-one errors, negative indexes, and reads past the end. Knowing exactly what your language does at the boundary prevents them.

## theory
Valid indexes for an array of length n are 0 up to n - 1 in zero-based languages. Using an index outside that range is out of bounds. What happens next depends on the language:

- Python raises IndexError for a list index that is outside the range
- Java throws ArrayIndexOutOfBoundsException
- JavaScript returns `undefined` for a read outside the range and creates a sparse array for a write beyond the end
- C and C++ do no checking: the program reads or writes whatever lies at that address, which is undefined behavior and a major source of security bugs
- Rust checks and panics; many languages offer checked and unchecked variants

Negative indexes:

- Python and some other languages interpret -1 as the last element, -2 as the second to last, and so on, which is convenient but can hide a bug where a computed index accidentally becomes negative
- JavaScript brackets treat negative numbers as property names and return undefined; use the `at` method for negative indexing
- C treats a negative index as pointer arithmetic backward

Slices are lenient in Python: `items[5:10]` on a short list returns an empty list instead of raising.

Common mistakes: using `<=` instead of `<` in a loop bound, forgetting that the last valid index is length minus one, off-by-one in ranges where the end is exclusive, and computing the middle of a range without overflow in fixed-width integers.

Defences: loop with for-each when the index is not needed, use `range(len(a))` or `enumerate`, check bounds explicitly before indexing derived values, and test with the empty array, one element and the boundary values.

## explain
1. State the valid range of indexes: zero up to length minus one.
2. When computing an index, ask whether it can fall outside that range, including negative values.
3. Check or clamp the index before using it if it comes from input or arithmetic.
4. Prefer iteration forms that do not expose indexes.
5. Decide whether a negative index is intended (from the end) or a bug.
6. Test the empty list, a single element, the first and last indexes and one past each end.

## example
For the list `["a", "b", "c", "d"]` in Python, indexes 0, -1 and `len(items) - 1` give "a", "d" and "d". Indexes 4 and -5 are both outside the list, and each raises an IndexError with the message "list index out of range", which the program catches and prints. The JavaScript lines show that reading index 4 gives undefined, `at(-1)` gives "d", a fractional index gives undefined and the string "1" works as a property name and finds "b". The C program, not run here, shows why a loop bound of `<=` reads past the end.

## real
Buffer overflows from missing bounds checks have caused major security incidents, while Python's IndexError is among the most common exceptions in everyday programs; both come from the same off-by-one mistakes.

## pros
- Constant-time access by position
- Languages with bounds checks turn mistakes into clear errors
- Negative indexing makes working with the end convenient

## cons
- Off-by-one errors are very common
- No checking in C leads to silent corruption
- Negative indexes can hide computed-index bugs

## uses
- Reading and writing elements by position
- Accessing the first and last elements
- Computing neighbours as i - 1 and i + 1
- Validating user-supplied positions

## mistakes
- Using less than or equal against the length in a loop
- Forgetting that an empty array has no valid index
- Computing an index that silently goes negative in Python
- Assuming JavaScript throws when an index is out of range

## interview
**Q:** What are the valid indexes of an array of length n?
**A:** 0 to n - 1 in zero-based languages. Anything else is out of bounds, and the language either reports an error or, in C, silently accesses unrelated memory.

**Q:** What does list[-1] mean in Python?
**A:** The last element. Negative indexes count backward from the end, with -1 being the last item, -2 the one before and so on.

**Q:** What happens when you read past the end of a JavaScript array?
**A:** You get undefined, with no error, which can propagate silently through later calculations.

## summary
Valid indexes run from 0 to length minus one. Know how your language reacts outside that range, guard computed indexes, and test the edges: empty, single element, first, last and one past either end.

## codenote
The Python sample shows valid, negative and invalid indexes. The JavaScript sample shows the lenient behavior. The C program shows the classic loop-bound error.

## code
### python
```python
items = ["a", "b", "c", "d"]
print(items[0], items[-1], items[len(items) - 1])

for index in (4, -5):
    try:
        items[index]
    except IndexError as error:
        print(index, "->", error)
```
Output:
```text
a d d
4 -> list index out of range
-5 -> list index out of range
```
### javascript
```javascript
const items = ["a", "b", "c", "d"];
console.log(items[4], items.at(-1), items[1.5], items["1"]);
```
Output:
```text
undefined d undefined b
```
### c
```c
#include <stdio.h>

int main(void) {
    int values[3] = {7, 8, 9};
    int total = 0;

    /* the loop bound must be < 3; using <= 3 would read values[3], past the end */
    for (int i = 0; i < 3; i++) {
        total += values[i];
    }
    printf("%d\n", total);
    return 0;
}
```

## quiz
1. What is the last valid index of an array with 10 elements?
   - [ ] 10
   - [x] 9
   - [ ] 11
   - [ ] 1
   > Zero-based indexing ends at length minus one.
2. What does C do when you read past the end of an array?
   - [ ] Throws an exception
   - [x] Reads whatever memory lies there; the behavior is undefined
   - [ ] Returns zero
   - [ ] Stops the program cleanly
   > C does not check bounds.
3. What does items[10] give in JavaScript for a four-element array?
   - [ ] An error
   - [x] undefined
   - [ ] null
   - [ ] 0
   > JavaScript returns undefined for missing properties.
4. Which test inputs best expose index bugs?
   - [ ] Only large arrays
   - [x] The empty array, one element and the first and last indexes
   - [ ] Only random values
   - [ ] Only negative numbers
   > Bugs appear at the boundaries.

# Array Traversal Patterns
kind: algorithm
time: O(n) for a single pass over n elements; patterns that use two pointers from the ends, step through pairs or skip elements still visit each element at most a constant number of times.
space: O(1) extra space for the pointer-based patterns; patterns that build a new array, such as reversed copies or difference lists, use O(n).
practice: sum-of-array-elements, find-minimum-element

## intro
Almost every array algorithm begins with a decision about how to walk through the elements. A handful of traversal patterns cover the great majority of cases, and choosing the right one often decides whether the solution is simple or awkward.

## theory
Common patterns:

- Forward scan: visit indexes 0 to n - 1, maintaining a running value such as a total, a maximum or a count
- Backward scan: visit from n - 1 down to 0, useful for removing items safely, finding the last match, or when later elements influence earlier ones
- Strided traversal: step by k to visit every k-th element (`nums[::2]` in Python)
- Two pointers from the ends: start at both ends and move toward the middle, used for reversing, palindrome checks and pair problems on sorted data
- Adjacent pairs: compare each element with its neighbour, using `zip(nums, nums[1:])` or indexes i and i + 1, for differences, monotonicity and runs
- Read and write pointers: one pointer scans, another marks where to write, for in-place filtering and compaction
- Nested traversal: one loop inside another for all pairs or for grids
- Sliding window: a range that moves along the array, adding the new element and dropping the old one
- Iteration with indexes: `enumerate` when both position and value are needed

Each of these visits elements in O(n) time except nested loops. The choice affects clarity and sometimes correctness: removing items while scanning forward skips elements, while scanning backward does not.

Guidelines: iterate over the values directly when indexes are not needed; use indexes only when you must write, compare neighbours or move in a special order; keep the loop condition simple and the body small.

## explain
1. Identify what the algorithm needs at each step: only the current value, the position, the neighbour or both ends.
2. Choose the pattern that provides exactly that.
3. Initialise the running state before the loop.
4. Write the loop condition from the pointers' ranges and check the last iteration by hand.
5. Update the state in the body and move the pointers.
6. Test with an empty array, one element, two elements and an odd and an even length.

## example
With `[4, 8, 15, 16, 23, 42]` the reversed copy `nums[::-1]` is `[42, 23, 16, 15, 8, 4]`, the strided view `nums[::2]` is `[4, 15, 23]`, and the adjacent differences from zipping the list with itself shifted by one are `[4, 7, 1, 7, 19]`. A two-pointer loop starting at both ends pairs the elements as `(4, 42)`, `(8, 23)` and `(15, 16)`. The JavaScript sample computes the sum and the minimum in one forward scan.

## real
Compression, signal processing, text editors and databases all rely on these walks, and nearly every coding interview problem about arrays starts with picking one of them.

## pros
- A small catalogue of patterns solves most problems
- Linear time with constant extra space for the pointer patterns
- Patterns compose: a sliding window is a forward scan with two pointers

## cons
- Index-based loops invite off-by-one errors
- Modifying the array while scanning forward skips elements
- Copy-based patterns such as reversed copies use extra memory

## uses
- Computing sums, minimums and counts
- Reversing and comparing from both ends
- Detecting increasing runs and measuring differences
- Compacting arrays in place

## mistakes
- Removing elements during a forward scan
- Letting the two pointers cross incorrectly or stopping one step early
- Using an index loop where direct iteration is clearer
- Forgetting to handle arrays with fewer than two elements in neighbour patterns

## interview
**Q:** When would you scan an array backward?
**A:** When removing items in place so earlier indexes stay valid, when you want the last match, or when later elements determine what an earlier element should do.

**Q:** What is the two-pointer pattern from the ends?
**A:** One pointer starts at the first element and another at the last, and they move toward each other, which gives linear-time solutions for reversing, palindrome checks and pair problems on sorted arrays.

**Q:** How do you iterate over adjacent pairs in Python?
**A:** Use zip(nums, nums[1:]), which yields each element together with the one after it, or loop over indexes from 0 to length minus two.

## summary
Choose a traversal that matches what each step needs: forward, backward, strided, from both ends, over neighbours or with separate read and write pointers. Most are linear time with constant extra space.

## codenote
The Python sample shows reversed, strided, adjacent and two-ended traversals. The JavaScript sample combines a sum and a minimum in one pass.

## code
### python
```python
nums = [4, 8, 15, 16, 23, 42]

print(nums[::-1])
print(nums[::2])
print([b - a for a, b in zip(nums, nums[1:])])

low, high = 0, len(nums) - 1
pairs = []
while low < high:
    pairs.append((nums[low], nums[high]))
    low += 1
    high -= 1
print(pairs)
```
Output:
```text
[42, 23, 16, 15, 8, 4]
[4, 15, 23]
[4, 7, 1, 7, 19]
[(4, 42), (8, 23), (15, 16)]
```
### javascript
```javascript
const nums = [4, 8, 15, 16, 23, 42];
let total = 0;
let smallest = nums[0];

for (const value of nums) {
  total += value;
  if (value < smallest) smallest = value;
}
console.log(total, smallest);
```
Output:
```text
108 4
```

## quiz
1. Why scan backward when removing elements in place?
   - [ ] It is faster
   - [x] Removing later items does not shift the positions still to be visited
   - [ ] Python requires it
   - [ ] It uses less memory
   > A forward scan would skip the element that moves into the removed slot.
2. When do two pointers moving from the ends toward the middle stop?
   - [ ] When they are equal or have crossed
   - [ ] When one reaches zero
   - [ ] After n steps exactly
   - [x] When the left pointer is no longer less than the right pointer
   > The loop condition is left less than right for pairs.
3. What does zip(nums, nums[1:]) produce?
   - [ ] Pairs of equal elements
   - [x] Each element together with the following one
   - [ ] The array reversed
   - [ ] Every second element
   > The shifted copy aligns each item with its successor.
4. What is the time complexity of one forward scan over n elements?
   - [ ] O(1)
   - [x] O(n)
   - [ ] O(log n)
   - [ ] O(n squared)
   > Each element is visited once.

# In Place Modifications
kind: algorithm
time: O(n) for the in-place reversal and the compaction, each of which touches every element a constant number of times.
space: O(1) extra space, since only a few index variables are needed, in contrast with approaches that build a new array.
practice: reverse-array-print

## intro
An in-place algorithm changes an array using only a constant amount of extra memory, rearranging the existing elements rather than building a copy. It saves memory and avoids allocation, and it comes with the responsibility of changing data that other code may be looking at.

## theory
Techniques for working in place:

- Swapping: exchange two elements, `a[i], a[j] = a[j], a[i]` in Python or with a temporary in other languages
- Reversal with two pointers: swap the elements at the ends and move inward until the pointers meet
- Read and write pointers (compaction): scan with a read index, copy elements worth keeping to the write index, advance the write index only when something was kept. This removes items, filters or moves zeros to the end in one pass.
- Partitioning: arrange elements so that those satisfying a condition come first, the idea behind quicksort's partition and the Dutch national flag problem
- Cyclic placement: put each element at the index it belongs to, used when values lie in a known range
- Rotation by reversing segments (see the rotation lesson)

Considerations:

- Side effects: callers' references see the change, so document it, and by convention functions that change in place return nothing (Python's `list.sort()` and `list.reverse()` return None)
- Stability: in-place methods may change the relative order of equal items
- Not always possible in O(1) space; some problems need extra memory
- Easy to corrupt data with an off-by-one in the pointer updates, so test on small cases by hand
- Language specifics: JavaScript `sort`, `reverse`, `splice` and `fill` mutate; `toSorted`, `toReversed` and `slice` return copies

The pattern to remember for compaction: the write index never passes the read index, so unread data is never overwritten.

## explain
1. Decide what the final arrangement must look like.
2. Choose the pattern: swap pairs for reversal, read-write pointers for filtering, partition for grouping.
3. Set the pointers at the correct start positions.
4. In each step, perform the swap or copy and move the pointers; make sure each element is handled exactly once.
5. Return the new logical length when the array is compacted, or None for a pure rearrangement.
6. Test with empty, single-element and all-equal inputs.

## example
The function `reverse_in_place` swaps the first and last elements and moves inward, turning `[1, 2, 3, 4, 5]` into `[5, 4, 3, 2, 1]`; the object returned is the same list that was passed in, so the identity check prints True. The function `move_zeros` keeps a write index, swaps each non-zero element to it and ends with `[1, 3, 12, 0, 0]` from `[0, 1, 0, 3, 12]` in a single pass. The JavaScript lines contrast `toReversed`, which returns a new array and leaves the original `[ 1, 2, 3 ]` alone, with `reverse`, which changes the array itself.

## real
Operating systems and embedded devices work in place because memory is scarce, sorting libraries partition arrays in place, and image processing routines flip and filter buffers without copying.

## pros
- Constant extra memory
- No allocation or copying
- Often faster because of cache-friendly access

## cons
- Changes the data that other code may still reference
- Easy to get pointer updates wrong
- Harder to reason about and to test than building a new array

## uses
- Reversing and rotating arrays
- Removing items or moving zeros to the end
- Partitioning around a pivot
- Processing large buffers where copying is too costly

## mistakes
- Modifying an array that another part of the program is reading
- Moving the write pointer past the read pointer and overwriting unread data
- Forgetting to return the new length after compaction
- Using a copying method such as slice and assuming the original changed

## interview
**Q:** What does it mean for an algorithm to be in place?
**A:** It transforms the input using only O(1) extra memory beyond the input itself, usually by swapping or overwriting elements within the same array.

**Q:** How do you move all zeros to the end of an array in place?
**A:** Scan with a read index and keep a write index; swap each non-zero element to the write position and advance it. All zeros end up after the write index in one pass.

**Q:** Why do functions such as list.sort return None in Python?
**A:** To signal that they modify the list in place and to prevent code from treating the result as a new sorted copy.

## summary
In-place algorithms rearrange the existing array with swaps and read-write pointers, using O(1) extra space. Be careful about aliasing and pointer updates, and document the mutation.

## codenote
The Python sample reverses and compacts lists in place. The JavaScript sample contrasts the copying and mutating array methods.

## code
### python
```python
def reverse_in_place(items):
    left, right = 0, len(items) - 1
    while left < right:
        items[left], items[right] = items[right], items[left]
        left += 1
        right -= 1
    return items

def move_zeros(items):
    write = 0
    for read in range(len(items)):
        if items[read] != 0:
            items[write], items[read] = items[read], items[write]
            write += 1
    return items

data = [1, 2, 3, 4, 5]
result = reverse_in_place(data)
print(result, result is data)

zeros = [0, 1, 0, 3, 12]
print(move_zeros(zeros))
```
Output:
```text
[5, 4, 3, 2, 1] True
[1, 3, 12, 0, 0]
```
### javascript
```javascript
const numbers = [1, 2, 3];
const copy = numbers.toReversed();
console.log(numbers, copy);

numbers.reverse();
console.log(numbers);
```
Output:
```text
[ 1, 2, 3 ] [ 3, 2, 1 ]
[ 3, 2, 1 ]
```

## quiz
1. What is the extra space used by an in-place algorithm?
   - [ ] O(n)
   - [x] O(1)
   - [ ] O(log n)
   - [ ] O(n squared)
   > Only a few variables are used beyond the input.
2. In the read and write pointer pattern, what must be true of the write index?
   - [ ] It is always zero
   - [x] It never passes the read index, so unread data is not overwritten
   - [ ] It moves backward
   - [ ] It equals the length
   > Elements are copied only to positions already read.
3. What does Python's list.sort() return?
   - [ ] The sorted list
   - [ ] A copy
   - [x] None, because it sorts in place
   - [ ] The number of swaps
   > The return value signals that the list itself was changed.
4. Which JavaScript method returns a reversed copy and leaves the original unchanged?
   - [ ] reverse
   - [x] toReversed
   - [ ] sort
   - [ ] splice
   > toReversed creates a new array.

# Multidimensional Arrays Intro
kind: algorithm
time: O(r · c) to visit every cell of an r by c grid; reading or writing a single cell is O(1) by its row and column.
space: O(r · c) for the grid itself; a transposed copy needs the same again, while a flat array with computed indexes needs no extra pointers.

## intro
A multidimensional array arranges data in a grid: rows and columns for tables, images and game boards, or more dimensions for volumes and tensors. Most languages build them from arrays of arrays, which brings some surprises about copying and layout.

## theory
Representations:

- Array of arrays (nested lists in Python, `int[][]` in Java, nested arrays in JavaScript): each row is a separate array held by an outer array. Rows can have different lengths (jagged arrays), and each row is allocated separately.
- True contiguous 2D arrays (`int grid[3][4]` in C, NumPy arrays): one block of memory in row-major order, with element (r, c) at offset `r * cols + c`
- A flat one-dimensional array with manual indexing, which works in every language and is very cache-friendly

Access: `grid[r][c]` for nested arrays, with r indexing rows and c columns. Out-of-range row or column is an index error, and in Python negative indexes still work from the end.

Traversal: nested loops, with the outer loop over rows and the inner over columns for row-major data. Common operations include transposing (swap rows and columns, `zip(*grid)` in Python), flattening, and reading diagonals, borders and neighbours.

The classic pitfall in Python and JavaScript is creating a grid with repetition: `[[0] * 3] * 3` creates three references to the same inner list, so changing one cell changes the whole column. The fix is a comprehension that builds a new row each time, `[[0] * 3 for _ in range(3)]`. In JavaScript the same trap occurs with `Array(3).fill([])`.

Related ideas: neighbours of a cell are at (r ± 1, c) and (r, c ± 1), with bounds checks; images are 2D arrays of pixels; matrices in mathematics multiply with three nested loops.

## explain
1. Decide the dimensions and whether rows have equal length.
2. Create the grid so that every row is a separate array.
3. Access cells as grid[row][column] and keep the order consistent everywhere.
4. Loop rows outside and columns inside for good locality in row-major storage.
5. Check bounds when looking at neighbours.
6. For performance-critical code, consider a flat array and the offset formula.

## example
In Python, `bad = [[0] * 3] * 3` followed by `bad[0][0] = 1` shows `[[1, 0, 0], [1, 0, 0], [1, 0, 0]]` because all rows are the same list. The comprehension version changes only the first row: `[[1, 0, 0], [0, 0, 0], [0, 0, 0]]`. The transpose of `[[1, 2, 3], [4, 5, 6]]` via `zip(*grid)` is `[[1, 4], [2, 5], [3, 6]]`, and the cell at row 1, column 2 of the flattened grid is found at offset `1 * 3 + 2`, giving 6. The JavaScript sample builds a grid correctly with `Array.from` and shows the shared-row trap with `fill`.

## real
Spreadsheets, game boards, image editors and map data are two-dimensional arrays, and bugs from accidentally shared rows are among the best-known beginner mistakes in Python.

## pros
- Natural representation of tables and images
- Constant-time access by row and column
- Nested loops express traversals clearly

## cons
- Shared-row aliasing when created by repetition
- Jagged rows complicate assumptions about shape
- Column-order traversal of row-major data has poor locality

## uses
- Game boards, grids and mazes
- Images and tables of numbers
- Matrix arithmetic
- Dynamic programming tables

## mistakes
- Building a grid by multiplying a list of lists
- Mixing up the order of row and column indexes
- Traversing columns in the outer loop of row-major data
- Forgetting bounds checks for neighbours at the edges

## interview
**Q:** Why does [[0] * 3] * 3 create a problem in Python?
**A:** The outer multiplication repeats the same inner list object three times, so all three rows are one list and changing one cell appears in every row.

**Q:** How do you convert a 2D index to a flat index?
**A:** For a row-major layout, the flat index is row times the number of columns plus the column.

**Q:** How can you transpose a list of lists in Python?
**A:** Apply the zip function to the unpacked rows of the grid, which pairs up the first elements of each row, then the second elements, and so on; convert the resulting tuples to lists if needed.

## summary
A grid is usually an array of arrays or one flat block with computed indexes. Create each row separately, keep the row and column order consistent, and traverse in the order of the memory layout.

## codenote
The Python sample shows the shared-row bug, the corrected construction, the transpose and the flat offset. The JavaScript sample builds a safe grid and demonstrates the fill trap.

## code
### python
```python
bad = [[0] * 3] * 3
bad[0][0] = 1
print(bad)

good = [[0] * 3 for _ in range(3)]
good[0][0] = 1
print(good)

grid = [[1, 2, 3], [4, 5, 6]]
print([list(column) for column in zip(*grid)])

cols = 3
flat = [value for row in grid for value in row]
print(flat[1 * cols + 2])
```
Output:
```text
[[1, 0, 0], [1, 0, 0], [1, 0, 0]]
[[1, 0, 0], [0, 0, 0], [0, 0, 0]]
[[1, 4], [2, 5], [3, 6]]
6
```
### javascript
```javascript
const safe = Array.from({ length: 2 }, () => Array(2).fill(0));
safe[0][0] = 1;
console.log(JSON.stringify(safe));

const shared = Array(2).fill([]);
shared[0].push("x");
console.log(JSON.stringify(shared));
```
Output:
```text
[[1,0],[0,0]]
[["x"],["x"]]
```

## quiz
1. Why do all rows change in [[0] * 3] * 3 when one cell is set?
   - [ ] The cell is global
   - [x] All three rows are the same list object
   - [ ] Python copies values lazily
   - [ ] The rows are sorted
   > Repetition copies the reference, not the list.
2. What is the flat offset of row r, column c in a row-major grid with cols columns?
   - [ ] r + c
   - [x] r times cols plus c
   - [ ] c times cols plus r
   - [ ] r times c
   > Each full row occupies cols positions.
3. Which loop nesting is best for a row-major grid?
   - [ ] Columns in the outer loop
   - [x] Rows in the outer loop and columns in the inner loop
   - [ ] Either, there is no difference
   - [ ] A single loop over the diagonal
   > The inner loop should walk consecutive memory.
4. What does applying zip to the unpacked rows of a grid do?
   - [ ] Sorts them
   - [x] Groups the elements by column, giving the transpose
   - [ ] Reverses each row
   - [ ] Flattens the grid
   > The first elements of each row form the first output tuple.

# Array Copying and Slicing
kind: algorithm
time: O(k) to copy or slice k elements; a deep copy costs time proportional to the total size of all nested objects. Creating a view onto the same data is O(1).
space: O(k) extra for a copy of k elements; a view uses O(1) extra because it shares the original storage.

## intro
Copying an array sounds trivial, but the word copy hides several different operations: a new reference to the same array, a new array that shares its elements, a fully independent duplicate, or a window onto the original data. Mixing them up is a common source of bugs where changing one array changes another.

## theory
Levels of copying:

- Alias (assignment): `b = a` makes a second name for the same array. No elements are copied; changes through either name are visible through the other.
- Shallow copy: a new array containing the same element objects. In Python: `a[:]`, `list(a)`, `a.copy()`; in JavaScript: `a.slice()`, `[...a]`. For arrays of numbers or strings this behaves like an independent copy, but if the elements are themselves arrays or objects, the copy shares them with the original.
- Deep copy: duplicates the nested objects recursively (`copy.deepcopy` in Python, `structuredClone` in JavaScript). Costs time and memory proportional to everything reachable.
- View: a window onto the original storage, not a copy. Python's `memoryview` and NumPy slices, and JavaScript typed array `subarray`. Writing through the view changes the original.

Slicing:

- A slice of a Python list (`a[1:4]`) creates a new list (a shallow copy of that range), taking time proportional to its length; changing it does not affect the original
- Slice bounds are half-open (start included, end excluded), lenient about going past the end, and support steps and negative indexes
- NumPy slices and JavaScript `subarray` are views, which is faster but means that modifications are shared

Costs: copying in a loop, or slicing repeatedly inside a recursion, is a hidden source of quadratic behavior. Passing indexes instead of slices avoids it.

Choosing: use an alias when you want to share; a shallow copy for flat data; a deep copy when nested data must be independent; a view for performance when sharing is acceptable.

## explain
1. Decide whether the two arrays should share changes or be independent.
2. For independence of flat data, make a shallow copy.
3. For independence of nested data, make a deep copy.
4. For speed with large data and intended sharing, use a view.
5. After copying, change one and check that the other behaves as intended.
6. Avoid repeated slicing in loops and recursion; pass start and end indexes.

## example
With `matrix = [[1, 2], [3, 4]]`, a shallow copy `matrix[:]` and a deep copy are made, and then `matrix[0][0]` is set to 99. The shallow copy shows 99 as well, because it shares the inner rows, while the deep copy still shows 1. Slicing `nums[1:4]` creates a new list, so setting its first item to 0 leaves the original `[1, 2, 3, 4, 5]` untouched. A `memoryview` slice of a `bytearray` does share data, so writing the byte for "X" through the view changes the original to `aXcdef`. The JavaScript sample contrasts `slice`, a copy, with `subarray`, a view.

## real
Bugs from unintended sharing are classic: a function that modifies a list passed in by the caller, a default configuration copied shallowly and then edited, and machine-learning pipelines whose preprocessing mutates the original data through a view.

## pros
- Copies protect the original data from changes
- Views avoid copying large data
- Slicing syntax is compact and expressive

## cons
- A shallow copy leaves nested elements shared with the original
- Deep copies can be slow and use a lot of memory
- Views make mutations visible in unexpected places

## uses
- Making a safe working copy before modifying data
- Extracting a range of an array
- Giving a function a window onto part of a buffer
- Cloning configuration or state

## mistakes
- Using assignment and expecting a copy
- Using a shallow copy for nested data
- Slicing inside a recursive function and creating quadratic work
- Forgetting that a NumPy or typed-array slice is a view

## interview
**Q:** What is the difference between a shallow and a deep copy?
**A:** A shallow copy creates a new container but the elements are the same objects as in the original. A deep copy recursively duplicates the elements too, so the two structures are fully independent.

**Q:** Does slicing a Python list copy it?
**A:** Yes, it creates a new list holding the selected elements, in time proportional to the slice length. Changing the slice does not affect the original list.

**Q:** What is the danger of a typed-array subarray or a NumPy slice?
**A:** It is a view onto the same memory, so modifying it modifies the original array.

## summary
Assignment aliases, slicing and copy methods make shallow copies, deepcopy makes independent duplicates, and views share storage. Choose by whether the data is nested and whether changes should be shared.

## codenote
The Python sample shows shallow versus deep copies, slice independence and a memoryview that shares data. The JavaScript sample shows slice and subarray.

## code
### python
```python
import copy

matrix = [[1, 2], [3, 4]]
shallow = matrix[:]
deep = copy.deepcopy(matrix)
matrix[0][0] = 99
print(shallow[0][0], deep[0][0])

nums = [1, 2, 3, 4, 5]
part = nums[1:4]
part[0] = 0
print(nums, part)

buffer = bytearray(b"abcdef")
view = memoryview(buffer)[1:4]
view[0] = ord("X")
print(buffer)
```
Output:
```text
99 1
[1, 2, 3, 4, 5] [0, 3, 4]
bytearray(b'aXcdef')
```
### javascript
```javascript
const base = new Int8Array([1, 2, 3, 4]);
const copy = base.slice(1, 3);
const view = base.subarray(1, 3);

view[0] = 9;
console.log(base, copy, view);
```
Output:
```text
Int8Array(4) [ 1, 9, 3, 4 ] Int8Array(2) [ 2, 3 ] Int8Array(2) [ 9, 3 ]
```

## quiz
1. What does b = a do when a is a list in Python?
   - [ ] Copies the list
   - [x] Makes b another name for the same list
   - [ ] Creates a deep copy
   - [ ] Sorts the list
   > Assignment copies the reference only.
2. Why does a shallow copy of a list of lists share changes?
   - [ ] It copies lazily
   - [x] The inner lists are the same objects in both copies
   - [ ] It is a view
   - [ ] It is sorted
   > Only the outer list is new.
3. What makes memoryview slices different from list slices?
   - [ ] They are slower
   - [x] They are views that share the original storage
   - [ ] They are immutable
   - [ ] They copy twice
   > Writing through the view changes the original buffer.
4. Why avoid slicing inside a recursive function?
   - [ ] Slices are not allowed
   - [x] Each slice copies data, which can make the total work quadratic
   - [ ] It changes the base case
   - [ ] It makes the stack smaller
   > Passing indexes avoids the repeated copies.
