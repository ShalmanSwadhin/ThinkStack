# Pointer Arithmetic
kind: concept
time: Not applicable — adding an integer to a pointer is a single instruction. The lesson is about what the result means and when it is valid.
space: Not applicable — arithmetic on a pointer produces another address and does not allocate anything.

## intro
In C and C++ you can add and subtract integers from a pointer, and the compiler scales the arithmetic by the size of the pointed-to type. This is how array indexing really works and how code walks through buffers, but stepping outside the object a pointer belongs to is undefined behavior.

## theory
Rules for a pointer `p` of type `T *`:

- `p + n` is the address n elements after p, which is n times `sizeof(T)` bytes in numeric terms. The compiler does the scaling, so `int *p; p + 1` moves 4 bytes on a typical machine, while for `char *` it moves 1 byte.
- `p - n` moves backward by n elements
- `p++` and `p--` step to the next or previous element
- Subtracting two pointers into the same array gives the number of elements between them, of type `ptrdiff_t`
- Comparing pointers with `<`, `>` and `==` is meaningful only for pointers into the same array (or one past its end)
- Adding two pointers, multiplying or dividing a pointer is not allowed
- `void *` has no element size, so standard C forbids arithmetic on it (some compilers allow it as an extension, treating the size as 1)

The relationship to arrays: for an array `a`, the expression `a[i]` is defined as `*(a + i)`. This is why `i[a]` also compiles, and why array names decay to pointers.

Valid range: a pointer may point to any element of an array, or to one position just past the last element (used as an end marker, but never dereferenced). Forming a pointer beyond that is undefined behavior, even if it is not dereferenced. Dereferencing out-of-range pointers causes buffer overflows and over-reads, a leading source of security vulnerabilities.

Typical uses: iterating with a begin and end pointer, parsing binary data byte by byte, implementing string functions, walking through 2D arrays stored in one block, and implementing allocators and containers.

Other languages restrict this: Java and Python have no pointer arithmetic, Rust allows it only in `unsafe` code, and Go has none outside the unsafe package. Typed arrays in JavaScript provide offset views onto a shared buffer.

## explain
1. Remember that arithmetic moves by whole elements, not bytes.
2. To visit each element, start at the first, step with `p++` and stop when you reach the end pointer (one past the last element).
3. To find the number of elements between two pointers, subtract them.
4. Check bounds before dereferencing; the language will not.
5. Use the array indexing form when it reads more clearly: it means the same thing.
6. Avoid arithmetic on pointers of unrelated objects and on void pointers.

## example
The Python sample uses `ctypes` to place four 32-bit integers in a raw array and compute the address of each element as the base address plus the index times the element size of 4 bytes. It prints the index, the integer read from that address and the byte offset: `0 10 0`, `1 20 4`, `2 30 8` and `3 40 12`, which is the arithmetic a C compiler does for `*(p + i)`. The JavaScript sample creates a view of the same buffer starting at byte 8, which shows elements 30 and 40 and reports the byte offset 8. The C program, not run here, sums an array with a moving pointer and an end pointer.

## real
Network protocol parsers, image processors and memory allocators move pointers through buffers, and an off-by-one in the end condition is the classic cause of buffer overflows and the bugs that attackers exploit.

## pros
- Efficient traversal without index variables
- Direct control over memory layout
- The natural mechanism behind arrays and strings in C

## cons
- No bounds checking, so mistakes become memory corruption
- Undefined behavior for pointers outside the object
- Hard to read and verify compared with indexing

## uses
- Walking through buffers and strings
- Parsing binary data formats
- Implementing containers and allocators
- Computing distances between positions in an array

## mistakes
- Forgetting that arithmetic is scaled by the element size
- Stepping past one-past-the-end and dereferencing
- Mixing pointers from different arrays in comparisons or subtraction
- Performing arithmetic on a void pointer in portable code

## interview
**Q:** What does p + 1 mean for an int pointer?
**A:** The address of the next int, which numerically is the address of p plus the size of an int; the compiler scales the offset by the element size.

**Q:** How is array indexing related to pointer arithmetic?
**A:** The expression a[i] is defined as *(a + i): the array name converts to a pointer to the first element, i elements are added, and the result is dereferenced.

**Q:** What is a one-past-the-end pointer?
**A:** A pointer to the position just after the last element of an array. It may be formed and compared but never dereferenced, and it is used as the end marker in loops.

## summary
Pointer arithmetic moves in units of the pointed-to type and underlies array indexing. Keep every pointer within its array or one past the end, and prefer indexing when it is clearer.

## codenote
The Python sample reproduces the address calculation with ctypes. The JavaScript sample uses a typed-array view with a byte offset. The C program walks an array with begin and end pointers.

## code
### python
```python
import ctypes

numbers = (ctypes.c_int * 4)(10, 20, 30, 40)
size = ctypes.sizeof(ctypes.c_int)
base = ctypes.addressof(numbers)

for index in range(4):
    address = base + index * size
    print(index, ctypes.c_int.from_address(address).value, address - base)
```
Output:
```text
0 10 0
1 20 4
2 30 8
3 40 12
```
### javascript
```javascript
const numbers = new Int32Array([10, 20, 30, 40]);
const tail = new Int32Array(numbers.buffer, 8, 2);

console.log(tail, tail.byteOffset);
```
Output:
```text
Int32Array(2) [ 30, 40 ] 8
```
### c
```c
#include <stdio.h>

int main(void) {
    int values[5] = {3, 1, 4, 1, 5};
    int *p = values;
    int *end = values + 5;
    int sum = 0;

    while (p < end) {
        sum += *p;
        p++;
    }
    printf("%d\n", sum);
    return 0;
}
```

## quiz
1. If p is an int pointer, what does p + 2 point to?
   - [ ] Two bytes after p
   - [x] Two ints after p, so eight bytes on a typical machine
   - [ ] The value stored at p plus two
   - [ ] Nothing valid
   > Pointer arithmetic is scaled by the size of the pointed-to type.
2. What is the expression a[i] defined as in C?
   - [ ] a plus i bytes
   - [x] The value at the address a + i
   - [ ] A copy of the array
   - [ ] The i-th byte of a
   > Indexing is dereferenced pointer arithmetic.
3. Which pointer may be formed but never dereferenced?
   - [ ] A null pointer after free
   - [x] A pointer one position past the last element of an array
   - [ ] A pointer to the first element
   - [ ] A void pointer
   > It is used as an end marker for loops.
4. Why is walking past the end of a buffer dangerous?
   - [ ] It slows the processor
   - [x] It reads or overwrites memory that belongs to something else, a common security flaw
   - [ ] It allocates more memory
   - [ ] It is checked and always rejected
   > C does not check bounds, so the access just happens.

# Smart Pointers Overview
kind: concept
time: Not applicable — smart pointers add a small constant cost per operation, such as updating a reference count. The lesson concerns ownership and safety.
space: Not applicable — shared pointers carry a control block with counts, which adds a few words of overhead to each shared object.

## intro
A smart pointer is an object that behaves like a pointer but also manages the lifetime of what it points to, releasing it automatically at the right time. Smart pointers bring the safety of garbage-collected languages to C++ without a collector, by tying cleanup to scope.

## theory
The idea is RAII, resource acquisition is initialisation: acquire the resource in a constructor and release it in the destructor. Because destructors run automatically when an object goes out of scope, even when an exception is thrown, the memory cannot be forgotten.

The main C++ smart pointers (in the `<memory>` header):

- `std::unique_ptr<T>`: sole ownership. Exactly one unique_ptr owns the object; it cannot be copied, only moved, and the object is deleted when the owner is destroyed. Zero overhead compared to a raw pointer. Create with `std::make_unique<T>(args)`.
- `std::shared_ptr<T>`: shared ownership by reference counting. Copying a shared_ptr increases a count; the object is deleted when the last owner is destroyed. Create with `std::make_shared<T>(args)`. It has a control block with the counts, and atomic count updates cost something.
- `std::weak_ptr<T>`: a non-owning observer of a shared object. It does not keep it alive and must be converted with `lock()` to a shared_ptr, which is empty if the object is gone. It breaks reference cycles, for example the parent pointer in a tree.

Guidelines:

- Prefer stack objects and containers; use unique_ptr when heap allocation is needed with a single owner
- Use shared_ptr only when ownership is truly shared, and watch for cycles
- Pass raw pointers or references to functions that only use an object without owning it
- Avoid `new` and `delete` in application code
- Do not create two independent shared_ptrs from the same raw pointer

Rust achieves a similar goal at compile time with ownership and borrowing, and other languages offer scoped constructs: Python's `with` statements and context managers, Java's try-with-resources, C#'s `using`. The principle is the same: tie release to scope.

## explain
1. Decide who owns the object: one owner, several owners or nobody (just a user).
2. For one owner, use unique_ptr and move it when ownership transfers.
3. For several owners, use shared_ptr and copy it to share.
4. For observers that must not extend the lifetime, use weak_ptr or a raw reference.
5. Create objects with make_unique or make_shared, not new.
6. Check for cycles among shared_ptrs and break them with weak_ptr.

## example
The C++ program, not run here, creates a unique_ptr to a number, moves it to another owner and shows that the first is now empty; it also copies a shared_ptr and prints the use count of 2. The Python sample illustrates the same scoped-release idea with a context manager: the resource is acquired when the with block begins, used, and released when the block ends, even if an error occurs, and the output shows acquire, use, release and then the line after the block.

## real
Modern C++ code bases ban naked new and delete in favour of smart pointers, and the standard library's containers, strings and file streams are built on RAII so that cleanup is automatic.

## pros
- Memory is released automatically, even when exceptions occur
- Ownership is stated in the type
- Eliminates most leaks, double frees and dangling pointers

## cons
- Shared pointers add reference-counting overhead
- Cycles of shared pointers still leak
- Learning the different kinds and when to use each takes effort

## uses
- Managing heap objects with a single owner in C++
- Sharing immutable data between components
- Breaking cycles in trees and graphs with weak pointers
- Tying release of files and locks to scope in any language

## mistakes
- Creating two shared pointers independently from the same raw pointer
- Using shared_ptr everywhere when unique_ptr would do
- Forming cycles of shared pointers
- Keeping a raw pointer after the owning smart pointer has released the object

## interview
**Q:** What is the difference between unique_ptr and shared_ptr?
**A:** A unique_ptr has exclusive ownership and cannot be copied, only moved, and has no overhead. A shared_ptr allows several owners using reference counting and deletes the object when the last owner goes away.

**Q:** What problem does weak_ptr solve?
**A:** It lets you observe a shared object without owning it, which breaks reference cycles, such as a child pointing back to its parent, that would otherwise keep both alive forever.

**Q:** What does RAII mean?
**A:** Resource acquisition is initialisation: a resource is acquired in a constructor and released in the destructor, so its lifetime is tied to the scope of an object and cleanup is automatic.

## summary
Smart pointers manage lifetimes automatically through RAII: unique_ptr for single ownership, shared_ptr for shared ownership and weak_ptr for observation. Prefer scoped ownership over manual new and delete in every language.

## codenote
The Python sample shows scope-tied release using a context manager. The C++ sample shows moving a unique_ptr and counting owners of a shared_ptr.

## code
### python
```python
from contextlib import contextmanager

@contextmanager
def owned(name):
    print("acquire", name)
    try:
        yield name
    finally:
        print("release", name)

with owned("file") as resource:
    print("using", resource)
print("after")
```
Output:
```text
acquire file
using file
release file
after
```
### cpp
```cpp
#include <iostream>
#include <memory>

int main() {
    auto first = std::make_unique<int>(42);
    auto second = std::move(first);
    std::cout << (first == nullptr) << " " << *second << std::endl;

    auto shared = std::make_shared<int>(7);
    auto another = shared;
    std::cout << shared.use_count() << std::endl;
    return 0;
}
```

## quiz
1. What does a unique_ptr guarantee?
   - [ ] Several owners share the object
   - [x] Exactly one owner, and the object is deleted when the owner is destroyed
   - [ ] The object is never deleted
   - [ ] The pointer cannot be null
   > Exclusive ownership gives automatic and predictable cleanup.
2. What is weak_ptr used for?
   - [ ] To own an object
   - [x] To observe a shared object without keeping it alive, for example to break cycles
   - [ ] To allocate arrays
   - [ ] To speed up copying
   > It does not increase the reference count.
3. What does RAII tie the lifetime of a resource to?
   - [ ] The program's start time
   - [x] The scope of an owning object
   - [ ] The file name
   - [ ] The garbage collector
   > The destructor releases the resource automatically.
4. Why avoid creating two shared pointers from the same raw pointer?
   - [ ] It is slower
   - [x] Each would keep its own count and both would try to delete the object
   - [ ] The compiler forbids it
   - [ ] It copies the object
   > A double delete corrupts memory.

# Memory Alignment
kind: concept
time: Not applicable — alignment affects the speed of individual memory accesses by a small constant factor, or on some processors correctness, not an algorithm's growth rate.
space: Not applicable — padding increases the size of structures by a few bytes each, but there is no asymptotic bound.

## intro
Processors prefer to read values from addresses that are multiples of the value's size: a four-byte integer at an address divisible by 4, an eight-byte double at an address divisible by 8. To satisfy that, compilers insert unused padding bytes inside structures, and the order of fields can change how large a structure is.

## theory
Definitions:

- Alignment requirement: the address of an object must be a multiple of its alignment, usually equal to its size for primitive types (1 for char, 2 for short, 4 for int, 8 for double and for pointers on 64-bit systems)
- Padding: unused bytes the compiler inserts between fields so that each is properly aligned, and after the last field so that arrays of the structure keep every element aligned
- Structure alignment equals the largest alignment among its members, and its size is rounded up to a multiple of it

Why it matters:

- Some processors (older ARM, SPARC) fault on misaligned access; x86 allows it but may be slower, especially if the access crosses a cache line
- Atomic operations generally require alignment
- SIMD instructions often need 16, 32 or 64-byte alignment
- Wasted padding enlarges data and reduces cache efficiency

Example: a struct with a char, then an int, then a char is laid out as the char at offset 0, three padding bytes, the int at offset 4, the second char at offset 8 and three bytes of trailing padding, giving size 12. Reordering to int, char, char gives offsets 0, 4 and 5 with two bytes of trailing padding, size 8. Ordering fields from the largest alignment to the smallest usually minimises padding.

Tools and controls:

- `sizeof` and `offsetof` in C reveal layout; C11 and C++11 provide `alignof` and `alignas`
- Packing directives (`#pragma pack`, `__attribute__((packed))`) remove padding but risk misaligned access
- Allocators such as `malloc` return memory aligned for any type; special functions (`aligned_alloc`, `posix_memalign`) give stricter alignment
- Binary file formats and network protocols specify layouts explicitly rather than relying on in-memory struct layout
- JavaScript typed arrays enforce alignment: a view's byte offset must be a multiple of the element size

## explain
1. List the fields with their sizes and alignments.
2. Place each field at the next offset that is a multiple of its alignment.
3. Round the total size up to a multiple of the structure's alignment.
4. Compare orderings: put the largest fields first to reduce padding.
5. Verify with sizeof and offsetof rather than trusting your arithmetic.
6. Do not rely on in-memory layout for files or network messages; serialise explicitly.

## example
With `ctypes`, a structure of a char, an int and a char has size 12 while the same fields ordered int, char, char occupy only 8, and the offsets show the int at byte 4 in both. The JavaScript sample tries to create a 32-bit integer view at byte offset 1 of an 8-byte buffer and fails with a RangeError because the offset is not a multiple of 4. The C program, not run here, prints sizeof for the two layouts.

## real
Game engines and database engines carefully order struct fields to save memory across millions of records, and network code serialises fields byte by byte so that different machines agree on the format.

## pros
- Aligned access is fast and always supported
- Reordering fields can shrink data with no code changes
- Tools report layout exactly

## cons
- Padding wastes memory
- Misaligned access can crash on some processors
- Packed structures trade space for slower or unsafe access

## uses
- Reducing the memory footprint of large arrays of structures
- Meeting alignment requirements of SIMD and atomic operations
- Designing binary file and network formats
- Understanding errors from misaligned buffer views

## mistakes
- Assuming the size of a struct is the sum of its fields
- Writing structs directly to files and reading them on another machine
- Packing structures and then accessing members through unaligned pointers
- Ordering fields by meaning when order by size would save space

## interview
**Q:** What is padding in a structure?
**A:** Unused bytes inserted by the compiler between members, and at the end, so that each member is properly aligned and arrays of the structure stay aligned.

**Q:** How can reordering fields reduce the size of a struct?
**A:** Placing members with larger alignment first lets smaller members pack together without padding between them, so less trailing and internal padding is needed.

**Q:** Why can unaligned access be a problem?
**A:** On some architectures it causes a hardware fault, and on others it is slower, especially when the value crosses a cache line boundary.

## summary
Fields are placed at multiples of their alignment, with padding added as needed. Order fields from largest to smallest to save space, check layouts with sizeof and offsetof, and never rely on struct layout for portable data.

## codenote
The Python sample prints struct sizes and offsets for two field orders. The JavaScript sample shows an alignment error from a typed-array view. The C program prints sizes with sizeof.

## code
### python
```python
import ctypes

class Padded(ctypes.Structure):
    _fields_ = [("a", ctypes.c_char), ("b", ctypes.c_int), ("c", ctypes.c_char)]

class Compact(ctypes.Structure):
    _fields_ = [("b", ctypes.c_int), ("a", ctypes.c_char), ("c", ctypes.c_char)]

print(ctypes.sizeof(Padded), ctypes.sizeof(Compact))
print(Padded.b.offset, Compact.a.offset)
```
Output:
```text
12 8
4 4
```
### javascript
```javascript
try {
  new Int32Array(new ArrayBuffer(8), 1);
} catch (error) {
  console.log(error.name);
}
console.log(new Int32Array(new ArrayBuffer(8), 4).length);
```
Output:
```text
RangeError
1
```
### c
```c
#include <stdio.h>

struct Padded {
    char a;
    int b;
    char c;
};

struct Compact {
    int b;
    char a;
    char c;
};

int main(void) {
    printf("%zu %zu\n", sizeof(struct Padded), sizeof(struct Compact));
    return 0;
}
```

## quiz
1. Why does the compiler insert padding in structures?
   - [ ] To waste memory
   - [x] To place each field at an address that is a multiple of its alignment
   - [ ] To hide the data
   - [ ] To make copying slower
   > Aligned access is faster or required on many processors.
2. How can the size of a structure with a char, an int and a char be reduced?
   - [ ] Rename the fields
   - [x] Order the fields with the int first, then the chars
   - [ ] Add more padding
   - [ ] Use a pointer
   > Larger fields first lets smaller ones pack together.
3. What alignment does a 4-byte int usually require?
   - [ ] 1
   - [ ] 2
   - [x] 4
   - [ ] 16
   > Primitive types are usually aligned to their own size.
4. Why should structs not be written directly to a file that other machines read?
   - [ ] Files cannot hold structs
   - [x] Padding and byte order differ between machines, so the layout is not portable
   - [ ] It is too fast
   - [ ] Structs are always identical everywhere
   > Serialise fields explicitly instead.

# Cache Locality
kind: concept
time: Not applicable — traversal order does not change the number of operations, but it can change the running time by a large constant factor because of cache misses. The lesson counts misses rather than operations.
space: Not applicable — locality concerns how memory is accessed, not how much is used.

## intro
Two loops that do exactly the same arithmetic on the same data can run at very different speeds, depending on the order in which they touch memory. Cache locality is the principle that accessing nearby addresses in sequence lets the processor's cache do most of the work.

## theory
How caches work, in brief:

- Memory is transferred to the cache in fixed-size blocks called cache lines, typically 64 bytes
- When a program reads one value, its whole line is loaded, so the following neighbouring values are already in the cache (spatial locality)
- Recently used lines are kept for reuse (temporal locality), and old ones are evicted when the cache is full, often by a least-recently-used policy
- A cache miss costs on the order of 100 cycles to RAM, against a few cycles for a hit

Array layout decides the best order. C, C++, Java and most languages store a two-dimensional array row by row (row-major order), so neighbouring columns of one row are adjacent in memory. Fortran and MATLAB store column by column. Walking along a row touches consecutive addresses and uses each loaded line fully; walking down a column jumps by a whole row each time, using one element per line and possibly evicting lines before they are reused.

Consequences and techniques:

- Loop in the order the data is laid out: the innermost loop should vary the fastest-changing index
- Blocking (tiling): process the data in small tiles that fit in the cache, as in fast matrix multiplication
- Prefer arrays of contiguous values over linked structures, where each node may be in a different place and every step is a likely miss
- Structure of arrays versus array of structures: keep together the fields that are used together
- Keep the working set small
- Avoid false sharing, where two threads write different values on the same cache line

For a rough sense: summing a large matrix row by row can be several times faster than column by column, even though both do the same additions.

## explain
1. Find out how the data is laid out in memory: row-major or column-major, contiguous or linked.
2. Arrange loops so the innermost loop walks consecutive addresses.
3. Reuse data while it is still in the cache, processing it in blocks if needed.
4. Replace pointer-chasing structures with arrays when performance matters.
5. Measure with a profiler or hardware counters; do not guess.
6. Check that the optimisation keeps the results identical.

## example
The Python program simulates a small cache with 4 lines of 8 elements, using least-recently-used replacement, over an 8 by 8 matrix stored row by row. Visiting the elements row by row loads each row once, so the simulation counts 8 misses. Visiting them column by column goes through 8 different rows for each column, more than the cache can hold, so every one of the 64 accesses misses. The JavaScript sample lists the memory indexes visited by the two orders for a 3 by 3 matrix: consecutive numbers for rows and jumps of 3 for columns.

## real
High-performance libraries for linear algebra, graphics and databases are written around cache behavior, and a common optimisation task is simply to swap the order of two loops.

## pros
- Large speed-ups from a change of loop order alone
- The principles apply across languages and hardware
- Contiguous layouts are simple as well as fast

## cons
- Benefits depend on the machine and are invisible in the code
- Blocking and layout changes complicate the program
- Premature tuning can hide the real bottleneck

## uses
- Ordering loops over matrices and images
- Choosing arrays over linked lists for hot data
- Tiling computations to fit the cache
- Arranging fields in structures by access pattern

## mistakes
- Traversing a row-major array column by column
- Using pointer-heavy structures in performance-critical loops
- Optimising for cache without measuring
- Sharing a cache line between threads that write independently

## interview
**Q:** What is cache locality and why does it matter?
**A:** It is the tendency to access nearby or recently used memory. Programs with good locality hit the fast cache more often, so they run faster than programs with the same operation count but scattered access.

**Q:** Why is iterating over a row-major matrix by rows faster than by columns?
**A:** Elements of a row are adjacent in memory, so each loaded cache line serves several accesses, whereas moving down a column jumps by the row length and wastes most of each line.

**Q:** What is loop tiling?
**A:** Splitting loops so the data is processed in blocks small enough to fit in the cache, which lets each block be reused many times before being evicted.

## summary
Memory is fetched in cache lines, so sequential access is cheap and scattered access is costly. Match the loop order to the data layout, prefer contiguous data and block large computations.

## codenote
The Python sample simulates the cache to count misses for two traversal orders. The JavaScript sample lists the visited indexes.

## code
### python
```python
from collections import OrderedDict

def misses(order, line_size=8, capacity=4):
    cache = OrderedDict()
    count = 0
    for address in order:
        line = address // line_size
        if line in cache:
            cache.move_to_end(line)
        else:
            count += 1
            cache[line] = True
            if len(cache) > capacity:
                cache.popitem(last=False)
    return count

n = 8
by_rows = [r * n + c for r in range(n) for c in range(n)]
by_columns = [r * n + c for c in range(n) for r in range(n)]
print(misses(by_rows), misses(by_columns))
```
Output:
```text
8 64
```
### javascript
```javascript
const n = 3;
const byRows = [];
const byColumns = [];

for (let r = 0; r < n; r++) {
  for (let c = 0; c < n; c++) byRows.push(r * n + c);
}
for (let c = 0; c < n; c++) {
  for (let r = 0; r < n; r++) byColumns.push(r * n + c);
}

console.log(byRows);
console.log(byColumns);
```
Output:
```text
[
  0, 1, 2, 3, 4,
  5, 6, 7, 8
]
[
  0, 3, 6, 1, 4,
  7, 2, 5, 8
]
```

## quiz
1. What is a cache line?
   - [ ] A cable
   - [x] The fixed-size block of memory moved between levels, commonly 64 bytes
   - [ ] A line of source code
   - [ ] A row in a database
   > Neighbouring values arrive together, which is why locality helps.
2. In a row-major array, which traversal order has good locality?
   - [ ] Column by column
   - [x] Row by row
   - [ ] Random order
   - [ ] Diagonal
   > Elements of one row are adjacent in memory.
3. Why are linked lists often slower than arrays for scanning?
   - [ ] They contain fewer elements
   - [x] Nodes can be scattered in memory, so each step is likely a cache miss
   - [ ] They use the stack
   - [ ] They cannot be traversed in order
   > Contiguous arrays use each loaded cache line fully.
4. What does loop tiling aim to do?
   - [ ] Reduce the number of loops to one
   - [x] Process data in blocks that fit in cache so they are reused before eviction
   - [ ] Make the loops infinite
   - [ ] Remove the need for arrays
   > Reuse while the block is still in the cache avoids repeated misses.

# Memory Safety Best Practices
kind: concept
time: Not applicable — safety measures such as bounds checks add a small constant cost per access. The lesson is about practices that prevent memory errors.
space: Not applicable — the practices concern correctness and security, not memory consumption.

## intro
Memory-unsafe code, which reads or writes memory it should not, causes crashes, data corruption and a large share of serious security vulnerabilities. A set of habits, languages features and tools prevents nearly all of it.

## theory
The main classes of memory error:

- Buffer overflow and over-read: writing or reading beyond the end of an array or buffer
- Use after free: using memory after releasing it
- Double free and invalid free: releasing the same block twice or a block that was not allocated
- Uninitialised memory: reading values that were never set
- Memory leaks: never releasing what was allocated
- Null pointer dereference: following a pointer that points nowhere
- Integer overflow leading to a too-small allocation, followed by a write of the intended larger amount
- Stack overflow from unbounded recursion or huge local arrays
- Format string errors and unchecked casts

Best practices:

- Choose a memory-safe language when you can: Python, Java, JavaScript, Go and Rust prevent most of these by construction (bounds checks, garbage collection or ownership rules)
- In C and C++, use safer abstractions: `std::vector`, `std::string`, `std::array` and smart pointers instead of raw arrays and `malloc`; use `at()` or checked access in debug builds; use `std::span` or `string_view` for bounds-aware views
- Avoid dangerous functions: `gets` (removed), `strcpy`, `strcat` and `sprintf` without limits; prefer length-limited versions (`fgets`, `snprintf`, `strncpy` with care) or safer library types
- Validate all sizes and indexes coming from outside the program, and check arithmetic for overflow before allocating
- Initialise variables and memory; set freed pointers to NULL
- Give each allocation a single owner and release it with RAII or in one cleanup path
- Compile with warnings enabled and treated as errors; run static analysers
- Test with sanitizers (AddressSanitizer, UndefinedBehaviorSanitizer), Valgrind and fuzzing
- Apply least privilege and mitigations such as stack canaries, non-executable stacks and address space layout randomisation as defence in depth

Language differences are visible in small examples: indexing past the end of a Python list raises IndexError, a JavaScript typed array ignores out-of-range writes, and in C the same access silently touches whatever memory is there.

## explain
1. Treat all external input, sizes and indexes as untrusted and validate them.
2. Prefer containers and string types that manage their own storage and know their size.
3. Make sure every index is checked against the length before use.
4. Use tools: compiler warnings, static analysis, sanitizers and fuzzers in your build.
5. Give ownership of every allocation to one object or scope.
6. Review code for the classic patterns: unchecked copies, off-by-one loops, missing NULL checks.

## example
In Python, `data[5]` on a three-element list raises IndexError, while slicing beyond the end quietly returns an empty list, so code must choose the form that matches its intent. Negative indexes count from the end. The JavaScript sample writes to index 5 of a two-element Uint8Array and the write is silently ignored, and assigning 256 to an element wraps to 0, a reminder that fixed-width integer types wrap. The C programs, not run here, contrast an unbounded copy that can overflow with a length-limited one.

## real
Large software vendors have reported that around seventy percent of their serious security bugs are memory-safety issues, which is why governments and companies are pushing the adoption of memory-safe languages and why sanitizers run in continuous integration.

## pros
- Memory-safe languages remove whole classes of vulnerabilities
- Tools find many bugs before release
- Safer abstractions in C and C++ cost little

## cons
- Checks add small overhead
- Legacy C code bases are costly to migrate
- Tools only find bugs on the paths exercised by tests

## uses
- Writing network-facing and security-sensitive code
- Reviewing C and C++ code
- Setting up sanitizers and fuzzing in continuous integration
- Choosing languages for new projects

## mistakes
- Trusting a length value supplied by the outside world
- Copying into a fixed buffer without checking the size
- Ignoring compiler warnings about uninitialised variables
- Assuming that a program that did not crash is free of memory errors

## interview
**Q:** What is a buffer overflow?
**A:** Writing more data into a buffer than it can hold, so the extra data overwrites adjacent memory. It can crash the program or let an attacker change its behavior.

**Q:** How do memory-safe languages prevent these errors?
**A:** They check array bounds, manage allocation with garbage collection or ownership rules, forbid raw pointer arithmetic and initialise memory, so errors become exceptions or compile-time failures instead of silent corruption.

**Q:** Name two tools that help find memory errors in C programs.
**A:** AddressSanitizer, built into modern compilers, and Valgrind. Fuzzers and static analysers complement them.

## summary
Use memory-safe languages or safe abstractions, validate inputs, check bounds, give allocations a single owner, avoid unsafe library functions and run sanitizers, analysers and fuzzers continuously.

## codenote
The Python sample shows checked indexing and permissive slicing. The JavaScript sample shows ignored out-of-range writes and wrapping of fixed-width integers. The C file contrasts an unsafe and a bounded copy.

## code
### python
```python
data = [1, 2, 3]

try:
    data[5]
except IndexError:
    print("IndexError")

print(data[5:10], data[-1])
```
Output:
```text
IndexError
[] 3
```
### javascript
```javascript
const bytes = new Uint8Array(2);
bytes[5] = 9;
console.log(bytes[5], bytes.length);

bytes[0] = 256;
console.log(bytes[0]);
```
Output:
```text
undefined 2
0
```
### c
```c
#include <stdio.h>
#include <string.h>

int main(void) {
    char name[8];
    const char *input = "a very long name from outside";

    /* unsafe: strcpy(name, input) would write past the end of name */
    snprintf(name, sizeof(name), "%s", input);
    printf("%s\n", name);
    return 0;
}
```

## quiz
1. What does indexing past the end of a Python list do?
   - [ ] Returns None
   - [x] Raises IndexError
   - [ ] Reads other memory
   - [ ] Returns zero
   > Python checks bounds on every access.
2. Why is strcpy considered dangerous in C?
   - [ ] It is too slow
   - [x] It copies until a terminator with no check against the destination size
   - [ ] It changes the source string
   - [ ] It needs a license
   > A longer input overruns the destination buffer.
3. What is the value of a Uint8Array element after assigning 256?
   - [ ] 256
   - [x] 0
   - [ ] 255
   - [ ] An exception is thrown
   > The value wraps modulo 256 for an unsigned byte.
4. Which approach prevents most memory-safety errors by construction?
   - [ ] Longer variable names
   - [x] Using a memory-safe language or safe abstractions
   - [ ] Fewer comments
   - [ ] Larger buffers
   > Bounds checks and ownership rules remove whole classes of bugs.

# Valgrind and Memory Debuggers
kind: concept
time: Not applicable — debugging tools slow programs down, Valgrind typically by a factor of 10 to 50 and AddressSanitizer by about 2, but this is a tooling trade-off and not an algorithmic cost.
space: Not applicable — the tools use extra memory for their bookkeeping, again a tooling property rather than a bound.

## intro
Memory errors rarely announce themselves where they happen: a corrupted value may crash the program much later and far away. Memory debuggers watch every access and allocation and report the first invalid one, with the exact line, which turns hours of guesswork into minutes.

## theory
Main tools:

- Valgrind (Memcheck) runs a program on a simulated processor and checks every memory access. It reports invalid reads and writes (out of bounds, use after free), uses of uninitialised values, bad and double frees, and leaks at exit with the allocation stack trace. It needs no recompilation, though building with debug symbols (`-g`) gives line numbers. Linux and macOS (varying support); programs run much slower.
- AddressSanitizer (ASan) is a compiler instrumentation (`-fsanitize=address` in GCC and Clang, also in MSVC) that adds checks and replaces the allocator. It is fast enough for tests and continuous integration, detects out-of-bounds access on stack, heap and globals, use after free and leaks (LeakSanitizer).
- UndefinedBehaviorSanitizer (`-fsanitize=undefined`) catches signed overflow, bad shifts, misaligned access and null dereference. MemorySanitizer detects uses of uninitialised memory; ThreadSanitizer detects data races.
- Heap profilers and leak tools for managed runtimes: `tracemalloc` in Python, heap snapshots in browser developer tools and Node's inspector, Java Flight Recorder and heap dumps, `pprof` in Go
- Static analysers (Clang Static Analyzer, Coverity, CodeQL) find potential errors without running the code
- Fuzzers (libFuzzer, AFL) generate inputs that drive programs into rare paths, combined with sanitizers to expose errors

Reading a Valgrind report: the first line names the kind of error (for example "Invalid write of size 4"), followed by the stack where it happened, then "Address ... is 0 bytes after a block of size 40 alloc'd" with the stack where that block was allocated. The leak summary distinguishes "definitely lost", "indirectly lost", "possibly lost" and "still reachable".

Workflow: compile with debug information and without heavy optimisation, run the tests under the tool, fix the first reported error (later ones may be consequences), repeat until clean, and keep the tool in the continuous integration pipeline.

## explain
1. Build the program with debug symbols and low optimisation.
2. Run it under Valgrind, or rebuild with AddressSanitizer and run normally.
3. Read the first error report: kind, line, and where the memory was allocated or freed.
4. Fix that error, then rerun, because later reports are often side effects.
5. Check the leak summary at exit and trace each lost block to its allocation.
6. For managed languages, take heap snapshots over time and compare them to find what grows.

## example
The Python sample uses `tracemalloc` to watch allocations: after creating a thousand 1000-byte objects the tracker reports more than 900,000 bytes in use, and after deleting them the traced total drops below 100,000 bytes, which is how you would confirm a suspected leak is fixed. The JavaScript sample shows the engine's own accounting: allocating a one-megabyte buffer raises the reported total of array buffer memory by at least that amount. The text sample shows the commands and a typical Valgrind error report for an out-of-bounds write.

## real
Teams run their test suites under AddressSanitizer in continuous integration, web developers compare heap snapshots in the browser to find leaks, and security researchers combine fuzzers with sanitizers to discover vulnerabilities.

## pros
- Pinpoints the exact line and the allocation involved
- Finds errors that do not crash the program
- Many tools are free and integrate with test pipelines

## cons
- Valgrind slows execution by an order of magnitude
- Tools only see the paths that the test run exercises
- Output can be long and takes practice to read

## uses
- Finding buffer overflows and use after free in C and C++ programs
- Locating leaks and their allocation sites
- Verifying fixes in continuous integration
- Tracking memory growth in Python and JavaScript services

## mistakes
- Running with optimisation and no debug symbols and getting unreadable reports
- Fixing the last reported error instead of the first
- Ignoring leaks reported as still reachable in long-running programs
- Trusting a clean run on a test that never reached the buggy path

## interview
**Q:** What does Valgrind's Memcheck detect?
**A:** Invalid reads and writes of memory, use of uninitialised values, use after free, double and invalid frees, and memory leaks, each reported with a stack trace.

**Q:** How does AddressSanitizer differ from Valgrind?
**A:** ASan is compiled into the program, so it needs a rebuild but runs only about twice as slow, making it practical for tests; Valgrind runs unmodified binaries but is much slower.

**Q:** Why fix the first error in a report before the others?
**A:** Later errors are often consequences of the first corruption, so fixing it may remove them all.

## summary
Memory debuggers such as Valgrind and the sanitizers report the first invalid access with exact locations. Build with debug symbols, run your tests under them, fix errors in order and keep them in continuous integration. Use heap profilers for managed languages.

## codenote
The Python sample demonstrates tracemalloc measuring allocation and release. The JavaScript sample reads the engine's buffer accounting. The text sample shows the commands and a typical report.

## code
### python
```python
import tracemalloc

tracemalloc.start()
data = [bytes(1000) for _ in range(1000)]
current, peak = tracemalloc.get_traced_memory()
print(current > 900_000)

del data
current, peak = tracemalloc.get_traced_memory()
print(current < 100_000)
tracemalloc.stop()
```
Output:
```text
True
True
```
### javascript
```javascript
const before = process.memoryUsage().arrayBuffers;
const buffer = Buffer.alloc(1_000_000);
const after = process.memoryUsage().arrayBuffers;
console.log(after - before >= buffer.length);
```
Output:
```text
true
```
### text
```text
$ gcc -g -O0 overflow.c -o overflow
$ valgrind --leak-check=full ./overflow

==1234== Invalid write of size 4
==1234==    at 0x1091A3: main (overflow.c:8)
==1234==  Address 0x4a47068 is 0 bytes after a block of size 40 alloc'd
==1234==    at 0x483B7F3: malloc (vg_replace_malloc.c:307)
==1234==    by 0x10917E: main (overflow.c:5)
```

## quiz
1. What does Valgrind's Memcheck report?
   - [ ] The speed of the processor
   - [x] Invalid memory accesses, uninitialised use, bad frees and leaks with stack traces
   - [ ] The size of the executable
   - [ ] The number of source lines
   > It checks every memory access and allocation.
2. Why compile with debug symbols before running a memory checker?
   - [ ] To make the program faster
   - [x] So reports show file names and line numbers
   - [ ] To remove leaks
   - [ ] To hide errors
   > Without symbols, the report shows only addresses.
3. Which tool needs a rebuild but is fast enough for continuous integration?
   - [ ] A printout
   - [x] AddressSanitizer
   - [ ] A text editor
   - [ ] A spreadsheet
   > It instruments the program at compile time and costs about twice the run time.
4. Why fix the first reported error first?
   - [ ] It is the shortest
   - [x] Later errors are frequently consequences of the first corruption
   - [ ] The order is random
   - [ ] Tools only report one error
   > Removing the root cause often clears the rest.
