# Memory Hierarchy Overview
kind: concept
time: Not applicable — the hierarchy is a hardware design, and the figures below are typical orders of magnitude that vary between machines. What matters for programmers is the large ratio between the levels.
space: Not applicable — each level trades capacity for speed, which is the point of the lesson rather than a bound on an algorithm.

## intro
A computer does not have one kind of memory but a ladder of them, from a handful of ultra-fast registers inside the processor to huge but slow disks. Programs run quickly when the data they need is near the top of the ladder, and slowly when it has to be fetched from far below.

## theory
From fastest and smallest to slowest and largest:

- Registers: a few dozen storage cells inside the processor core, accessed in a fraction of a nanosecond
- L1 cache: tens of kilobytes per core, about one nanosecond
- L2 cache: hundreds of kilobytes to a few megabytes, a few nanoseconds
- L3 cache: several to tens of megabytes shared by cores, around ten to twenty nanoseconds
- Main memory (RAM): gigabytes, about eighty to a hundred nanoseconds
- Solid-state drive: terabytes, around a hundred microseconds
- Hard disk drive: terabytes, around ten milliseconds, because a mechanical head must move
- Network storage: slower still, and variable

Each step down is larger in capacity, cheaper per byte and slower, by factors of roughly 4 to 100 per level and up to a hundred thousand times between RAM and a hard disk.

The hierarchy works because of locality of reference:

- Temporal locality: data used recently is likely to be used again soon, so it is kept in a fast level
- Spatial locality: data near a recently used address is likely to be used next, so memory is moved in blocks (cache lines, commonly 64 bytes; disk pages, commonly 4 kilobytes)

The hardware and operating system move data between levels automatically. A cache hit finds the data in the level; a miss goes to the next level down, and a miss all the way through RAM may stall the processor for hundreds of cycles. Virtual memory extends the hierarchy by using disk as overflow for RAM, which is extremely slow when the working set no longer fits.

Programming consequences: arrays traversed in order are fast; random jumps through large structures are slow; keeping the working set small helps; and measuring beats guessing.

## explain
1. Think of the hierarchy as a pyramid: tiny and fast at the top, huge and slow at the bottom.
2. When the processor needs a value, it checks the levels from the top down until it finds it.
3. A found copy is a hit; otherwise the block containing the value is copied up through the levels, evicting something older.
4. Because whole blocks are copied, neighbouring values arrive for free.
5. A program that reuses data and accesses it in order benefits from the caches.
6. A program that jumps around or has a working set larger than a level suffers misses at that level.

## example
The Python program lists approximate latencies and prints each as a multiple of the L1 access time. A register is about a third of an L1 access, RAM is 80 times slower, a solid-state drive is 100,000 times slower and a hard disk 10,000,000 times slower, so a single disk access costs as much as millions of cache accesses. The JavaScript lines show the sizes of typed array elements: an array of four 32-bit integers uses 16 bytes, and a 64-bit float uses 8 bytes, which determines how many fit in a 64-byte cache line.

## real
Databases keep hot data in memory caches because disks are slow, web services add layers of caches for the same reason, and performance engineers often find that a program is limited by memory access rather than by arithmetic.

## pros
- Gives a fast, large and affordable memory system by combining different technologies
- Locality lets small caches serve most accesses
- Programmers can improve speed by organising data access

## cons
- Performance depends on access patterns that are invisible in the source code
- Cache behaviour differs between machines
- A miss to disk or network is thousands to millions of times slower than a hit

## uses
- Explaining why sequential access beats random access
- Sizing caches and working sets in services
- Choosing data layouts for performance-critical code
- Understanding why memory-bound programs do not speed up with faster processors

## mistakes
- Treating all memory accesses as equally fast
- Optimising arithmetic when the program is waiting for memory
- Assuming that a bigger working set only costs proportionally more
- Forgetting that virtual memory paging to disk can freeze a program

## interview
**Q:** What is the memory hierarchy and why does it exist?
**A:** It is the layering of registers, caches, main memory and storage by speed and size. Fast memory is expensive and small, large memory is slow, so combining them with caching gives good speed at acceptable cost.

**Q:** What is the difference between temporal and spatial locality?
**A:** Temporal locality means recently used data is likely to be used again soon. Spatial locality means data near recently used addresses is likely to be used next.

**Q:** What is a cache miss?
**A:** A request for data that is not in the cache level checked, so it must be fetched from a slower level, which costs many more cycles than a hit.

## summary
Memory is a hierarchy from registers to disk, trading speed for capacity. Locality makes caches effective, and programs run fastest when their data access is sequential and their working set small.

## codenote
The Python sample expresses each level's typical latency relative to L1. The JavaScript sample shows the byte sizes that decide how many values fit in a cache line.

## code
### python
```python
LATENCY_NS = {
    "register": 0.3,
    "L1 cache": 1,
    "L2 cache": 4,
    "L3 cache": 15,
    "RAM": 80,
    "SSD": 100_000,
    "HDD": 10_000_000,
}

for name, nanoseconds in LATENCY_NS.items():
    print(f"{name:9} {nanoseconds / LATENCY_NS['L1 cache']:>12,.1f}x L1")
```
Output:
```text
register           0.3x L1
L1 cache           1.0x L1
L2 cache           4.0x L1
L3 cache          15.0x L1
RAM               80.0x L1
SSD          100,000.0x L1
HDD       10,000,000.0x L1
```
### javascript
```javascript
const ints = new Int32Array(4);
console.log(ints.byteLength, Float64Array.BYTES_PER_ELEMENT);
console.log(64 / Int32Array.BYTES_PER_ELEMENT);
```
Output:
```text
16 8
16
```

## quiz
1. Which level of the memory hierarchy is the fastest?
   - [ ] Main memory
   - [ ] L3 cache
   - [x] Registers
   - [ ] Solid-state drive
   > Registers sit inside the processor core and are accessed almost instantly.
2. What does spatial locality mean?
   - [ ] Data is stored in a different room
   - [x] Data near a recently used address is likely to be used soon
   - [ ] Only one value is used at a time
   - [ ] Memory is arranged in space-saving form
   > Caches fetch whole blocks because neighbours are likely to be needed.
3. Roughly how much slower is a hard disk access than an L1 cache access?
   - [ ] Twice
   - [ ] A hundred times
   - [x] Millions of times
   - [ ] The same
   > Mechanical movement makes disks millions of times slower than a first-level cache.
4. What is a cache hit?
   - [ ] Damage to the cache chip
   - [x] The requested data is found in the cache
   - [ ] A write to disk
   - [ ] An error message
   > A hit avoids the slower trip to the next level.

# Stack vs Heap Memory
kind: concept
time: Not applicable — stack allocation is a pointer adjustment and heap allocation involves bookkeeping, so the heap is slower per allocation, but the lesson contrasts their behavior rather than counting steps.
space: Not applicable — the stack is small and fixed in size, the heap is large and grows on demand; the lesson compares them without a Big-O bound.

## intro
A running program keeps its data in two main regions of memory. The stack holds the local variables of active function calls and is managed automatically. The heap holds data that must outlive a single call or whose size is unknown in advance, and it is managed explicitly or by a garbage collector.

## theory
The stack:

- Organised as last in, first out: each function call pushes a frame with parameters, local variables and the return address; returning pops it
- Allocation and release are just moving a pointer, so they are very fast
- Size is limited, typically 1 to 8 megabytes per thread, so very deep recursion or huge local arrays cause a stack overflow
- Lifetime is tied to the call: when the function returns, its variables disappear
- Memory is contiguous and cache-friendly

The heap:

- A large pool from which blocks of any size can be requested and released in any order (`malloc` and `free` in C, `new` and `delete` in C++, object creation in managed languages)
- Allocation requires the allocator to find a suitable free block, so it is slower, and the pool can become fragmented
- Lifetime is under program control, not tied to a function, so heap data can be returned from functions and shared
- In C and C++ the programmer must free it; in Java, Python and JavaScript a garbage collector or reference counting does it
- Access goes through a pointer or reference, adding an indirection

Where things live depends on the language:

- C and C++: local variables and arrays of fixed size on the stack; `malloc`, `new` on the heap
- Java: local primitive variables and references on the stack; all objects on the heap
- Python: every object, including integers and lists, lives on the heap; the frames hold only names that refer to them
- JavaScript: objects and closures on the heap; the engine may place short-lived values on the stack as an optimisation

Typical bugs: stack overflow (infinite recursion, giant local arrays), returning a pointer to a local variable (dangling pointer), heap leaks, and fragmentation.

## explain
1. Ask how long the data must live. If it ends with the function, the stack is right.
2. Ask whether the size is known at compile time and small. If not, use the heap.
3. If the data must be returned or shared across calls, allocate it on the heap.
4. In C and C++, pair every heap allocation with exactly one release.
5. In garbage-collected languages, remember that the objects live on the heap and stay alive while referenced.
6. Avoid deep recursion and large stack arrays.

## example
The Python function `make` has a local name and a list. When it returns, its frame vanishes along with the local name, but the list is a heap object and survives because the caller holds a reference to it, so printing it shows `[1, 2, 3]`. `sys.getrefcount` confirms the object is referenced. The C sample, not run here, contrasts a stack array that disappears at the end of the function with a block from `malloc` that the caller can use and must free.

## real
Operating systems give each thread a fixed stack, servers allocate large buffers on the heap, and stack overflows from runaway recursion are a classic crash. Security tools look for buffer overflows in stack buffers because they can overwrite return addresses.

## pros
- The stack gives very fast, automatic management for local data
- The heap supports flexible sizes and lifetimes
- Knowing both lets you place data deliberately

## cons
- Stack space is small and overflows on deep recursion
- Heap allocation is slower and can fragment
- Blocks managed by hand are easy to leak or to release twice

## uses
- Keeping short-lived local values on the stack
- Allocating large or variable-sized buffers on the heap
- Returning data from functions via heap allocation
- Diagnosing crashes caused by stack exhaustion

## mistakes
- Returning the address of a local variable
- Allocating very large arrays on the stack
- Forgetting to release heap memory in C and C++
- Assuming Python stores small objects on the stack

## interview
**Q:** What is the difference between stack and heap memory?
**A:** The stack stores local variables and call frames with automatic, last-in first-out lifetime and very fast allocation, while the heap stores dynamically allocated data with a lifetime controlled by the program or a garbage collector.

**Q:** What causes a stack overflow?
**A:** Using more stack than is available, typically through infinite or very deep recursion, or very large local arrays.

**Q:** Where are objects stored in Java?
**A:** On the heap. Local variables hold references to them, and the references themselves are on the stack.

## summary
The stack holds short-lived, automatically managed call data, and the heap holds flexible data that outlives calls. Choose by lifetime and size, and avoid dangling pointers, leaks and overflows.

## codenote
The Python sample shows a heap object surviving after its creating function returns. The C sample contrasts a stack array with a heap block.

## code
### python
```python
import sys

def make():
    local_total = 0
    items = [1, 2, 3]
    return items

kept = make()
print(kept)
print(sys.getrefcount(kept) >= 2)
```
Output:
```text
[1, 2, 3]
True
```
### c
```c
#include <stdio.h>
#include <stdlib.h>

int *make_on_heap(int n) {
    int *block = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) {
        block[i] = i * i;
    }
    return block;
}

int main(void) {
    int on_stack[3] = {1, 2, 3};
    int *on_heap = make_on_heap(4);
    printf("%d %d\n", on_stack[2], on_heap[3]);
    free(on_heap);
    return 0;
}
```

## quiz
1. When does memory on the stack for a local variable get released?
   - [ ] When the program exits
   - [x] When the function that owns it returns
   - [ ] When free is called
   - [ ] When the garbage collector runs
   > Stack frames are popped automatically on return.
2. Which situation calls for heap allocation?
   - [ ] A small counter used inside one function
   - [x] Data whose size is unknown at compile time or that must outlive the function
   - [ ] A loop index
   - [ ] A constant
   > The heap supports flexible size and lifetime.
3. Where are Python integers and lists stored?
   - [ ] On the stack
   - [x] On the heap, with names in frames referring to them
   - [ ] In registers only
   - [ ] On the disk
   > Every Python object is a heap object.
4. What is a typical cause of a stack overflow?
   - [ ] Too many global constants
   - [x] Infinite or very deep recursion
   - [ ] A long variable name
   - [ ] A slow disk
   > Each call adds a frame to a fixed-size stack.

# Pointers in C and C++
kind: concept
time: Not applicable — dereferencing a pointer is a single memory access. The topic is how addresses and values are related.
space: Not applicable — a pointer occupies one machine word, typically 8 bytes on a 64-bit system, regardless of what it points to.

## intro
A pointer is a variable that stores a memory address. Pointers let C and C++ programs refer to data without copying it, build linked structures, work with arrays and allocate memory dynamically, and they are also the source of the language's most serious bugs.

## theory
Basic notation in C:

- `int x = 10;` creates an integer variable
- `int *p = &x;` declares a pointer to int and stores the address of x in it; the ampersand is the address-of operator
- `*p` dereferences the pointer: it means the integer that p points to, and `*p = 99;` changes x
- `NULL` (or `nullptr` in C++) is the value that means "points to nothing", and dereferencing it crashes the program
- A pointer has a type that tells the compiler how many bytes to read and how to interpret them; `void *` is a typeless pointer
- The size of a pointer is fixed for the platform, usually 8 bytes on 64-bit systems

Common uses:

- Passing the address of a variable to a function so the function can modify it (pass by pointer)
- Passing large structures without copying them
- Referring to arrays: the name of an array decays to a pointer to its first element
- Building linked lists, trees and graphs where nodes point to other nodes
- Strings in C are arrays of char accessed through `char *`
- Pointers to functions, which allow callbacks

Dangers:

- Dereferencing a null or uninitialised pointer
- Dangling pointers that refer to memory that was freed or went out of scope
- Out-of-bounds access through pointer arithmetic
- Type confusion through casts

Good habits: initialise pointers (to a valid address or NULL), check for NULL before dereferencing, do not use a pointer after freeing, and use `const` to express intent. C++ offers references and smart pointers to avoid many of these problems.

## explain
1. Read a declaration from the name outward: `int *p` means p is a pointer to int.
2. Use & to obtain an address and * to follow it.
3. Draw boxes: a box for x holding 10, a box for p holding an arrow to x. Dereferencing follows the arrow.
4. When passing a pointer to a function, the function can change the caller's variable by writing through it.
5. Before dereferencing, ask: is it initialised, is it non-null, and does the target still exist?
6. After freeing memory, set the pointer to NULL.

## example
Python cannot create raw pointers, but its `ctypes` module shows the same behavior. A C integer variable holds 10, a pointer to it is created, and writing through the pointer changes the variable, so both the variable and the dereferenced pointer print 99. A C array of four integers is cast to a pointer to its first element; indexing the pointer at 0 and 2 gives 10 and 30. The C program, not run here, does the same in C notation: it declares an integer and a pointer, modifies the integer through the pointer and prints both.

## real
Operating systems, device drivers, databases and game engines are written in C and C++ because pointers give direct control over memory. Many security vulnerabilities are pointer errors, which is why newer languages restrict them.

## pros
- Direct, efficient access to memory and hardware
- Avoids copying large data
- Enables dynamic data structures and callbacks

## cons
- Easy to create invalid pointers and crash or corrupt memory
- Pointer errors are a major source of security flaws
- Syntax with stars and ampersands is confusing for beginners

## uses
- Letting a function modify a caller's variable
- Implementing linked lists, trees and graphs
- Working with arrays and strings in C
- Passing callbacks as function pointers

## mistakes
- Dereferencing a pointer that is null or uninitialised
- Using a pointer after the memory has been freed
- Confusing the pointer with the value it points to
- Forgetting that declaring two pointers needs a star for each name

## interview
**Q:** What is a pointer?
**A:** A variable whose value is the memory address of another object. Dereferencing it accesses the object stored at that address.

**Q:** What do the & and * operators do?
**A:** The ampersand gives the address of a variable, and the star, applied to a pointer, accesses the value stored at the address it holds.

**Q:** Why is dereferencing a null pointer a bug?
**A:** A null pointer refers to no object, so reading or writing through it is undefined behavior and usually crashes the program.

## summary
A pointer stores an address. Use & to get one and * to follow it, keep pointers valid and checked, and never use them after the target is gone.

## codenote
The Python sample reproduces pointer behavior with ctypes: writing through a pointer and indexing from an array pointer. The C sample shows the same ideas in C notation.

## code
### python
```python
import ctypes

value = ctypes.c_int(10)
pointer = ctypes.pointer(value)
pointer.contents.value = 99
print(value.value, pointer[0])

numbers = (ctypes.c_int * 4)(10, 20, 30, 40)
first = ctypes.cast(numbers, ctypes.POINTER(ctypes.c_int))
print(first[0], first[2])
```
Output:
```text
99 99
10 30
```
### c
```c
#include <stdio.h>

int main(void) {
    int x = 10;
    int *p = &x;
    *p = 99;
    printf("%d %d\n", x, *p);

    int *nothing = NULL;
    if (nothing == NULL) {
        printf("nothing points nowhere\n");
    }
    return 0;
}
```

## quiz
1. What does applying the dereference operator to p mean when p is a pointer to int?
   - [ ] The address of p
   - [x] The integer that p points to
   - [ ] The size of p
   - [ ] A copy of p
   > Dereferencing follows the stored address to the value.
2. What does the & operator return?
   - [ ] The value of a variable
   - [x] The address of a variable
   - [ ] The type of a variable
   - [ ] A copy of a variable
   > It produces a pointer to the variable.
3. What happens when a null pointer is dereferenced?
   - [ ] It reads zero
   - [x] The behavior is undefined and the program typically crashes
   - [ ] It allocates memory
   - [ ] It returns an empty string
   > A null pointer refers to nothing.
4. Why can a function receiving a pointer modify the caller's variable?
   - [ ] Pointers are global
   - [x] It writes to the address of the original variable
   - [ ] The compiler copies it back
   - [ ] It cannot
   > The pointer gives access to the original location.

# References in C++ and Java
kind: concept
time: Not applicable — following a reference costs about the same as following a pointer. The lesson is about how references behave and differ from pointers.
space: Not applicable — a reference is usually implemented as an address, but the language treats it as an alias or a handle rather than a value to compute with.

## intro
A reference is a safer relative of the pointer: a name that refers to an existing object. C++ references are aliases for another variable, while Java references are handles to objects on the heap. Both give indirect access without the arithmetic and null-pointer perils of raw pointers.

## theory
C++ references:

- Declared with an ampersand after the type: `int &r = x;` makes r another name for x
- Must be initialised when declared and cannot be reseated to refer to something else later
- Cannot be null in well-formed code
- Used mostly for function parameters, `void swap(int &a, int &b)`, and for returning values without copying; `const int &` passes large objects cheaply without allowing modification
- Compared with pointers, references need no dereference operator, support no arithmetic and cannot be null, which makes them harder to misuse

Java references:

- Every object variable is a reference to an object on the heap; there is no pointer arithmetic
- Assigning one object variable to another copies the reference, so both refer to the same object
- References can be null, and dereferencing null throws NullPointerException instead of corrupting memory
- Java passes everything by value, but for objects the value passed is the reference, so a method can modify the object but cannot change which object the caller's variable refers to
- Primitives such as int are stored directly, not by reference

Python and JavaScript object variables behave like Java references: assignment shares the object and mutation is visible through every name.

Related concepts: aliasing (two names for one object, source of surprises when one changes it), copying (shallow copies share nested objects, deep copies do not), and equality versus identity (`equals` versus `==` in Java, `==` versus `is` in Python).

## explain
1. Decide whether you need an alias (C++ reference) or an independent copy.
2. In C++, use a reference parameter to modify the caller's variable, and a const reference to read large objects without copying.
3. In Java, remember that variables hold references; assigning does not duplicate the object.
4. To get an independent object, make an explicit copy (clone, copy constructor, copy method).
5. Compare identity and equality carefully: same object, or equal contents?
6. Be careful with aliasing when the object can be changed through another name.

## example
In Python, `a = [1, 2]` and `b = a` make two names for one list, which `is` and `id` confirm; appending through b changes what a shows. A copy made with `list(a)` is a different object that compares equal. The Java sample, not run here, shows two variables referring to one array and a method that changes the shared object. The C++ sample shows a function whose reference parameter changes the caller's integer.

## real
Java programs are built entirely from references to heap objects, and C++ code uses const references pervasively to avoid copying strings and collections. The bug where two parts of a program unknowingly share one object is common in all of these languages.

## pros
- Safer than raw pointers: no arithmetic, and C++ references cannot be null
- Cheap to pass: no copying of large objects
- Cleaner syntax than pointers for the common cases

## cons
- Aliasing causes surprising changes through another name
- Java references can still be null
- C++ references cannot be reseated and can still dangle if the target is destroyed

## uses
- Passing large objects to functions without copying
- Letting a function modify its argument in C++
- Sharing objects between parts of a Java program
- Writing operators and accessors that return the object itself

## mistakes
- Assuming Java passes objects by copying them
- Returning a reference to a local variable in C++
- Forgetting that assignment copies the reference, not the object
- Comparing references with == when equality of contents is meant

## interview
**Q:** What is the difference between a pointer and a reference in C++?
**A:** A reference is an alias that must be initialised, cannot be null and cannot be changed to refer to another object, and is used without dereferencing. A pointer is a variable holding an address that can be null, reassigned and used in arithmetic.

**Q:** Is Java pass by value or pass by reference?
**A:** Pass by value: for objects, the value passed is a copy of the reference, so the method can change the object but cannot make the caller's variable refer to a different object.

**Q:** What happens when you assign one Java object variable to another?
**A:** Only the reference is copied, so both variables refer to the same object on the heap.

## summary
References give indirect access with fewer hazards than pointers. In C++ they are aliases, and in Java they are the only way to reach objects. Watch aliasing, copy deliberately and distinguish identity from equality.

## codenote
The Python sample shows aliasing, mutation and copying. The Java sample shows shared arrays, and the C++ sample shows an alias parameter.

## code
### python
```python
a = [1, 2]
b = a
print(a is b, id(a) == id(b))

b.append(3)
print(a)

c = list(a)
print(c is a, c == a)
```
Output:
```text
True True
[1, 2, 3]
False True
```
### java
```java
public class Shared {
    static void addOne(int[] values) {
        values[0] = values[0] + 1;
    }

    public static void main(String[] args) {
        int[] data = {1, 2, 3};
        int[] alias = data;
        addOne(alias);
        System.out.println(data[0]);
        System.out.println(data == alias);
    }
}
```
### cpp
```cpp
#include <iostream>

void addOne(int &number) {
    number = number + 1;
}

int main() {
    int count = 5;
    addOne(count);
    std::cout << count << std::endl;
    return 0;
}
```

## quiz
1. What can a C++ reference not do that a pointer can?
   - [ ] Refer to an int
   - [x] Be reseated to refer to a different object after initialisation
   - [ ] Be passed to a function
   - [ ] Refer to a large object
   > A reference is permanently bound to its target.
2. After Object a = b in Java, how many objects exist?
   - [ ] Two
   - [x] One, with two references to it
   - [ ] Zero
   - [ ] It depends on the class
   > Assignment copies the reference, not the object.
3. What does a Java method receive when you pass an object to it?
   - [ ] A deep copy of the object
   - [x] A copy of the reference to the object
   - [ ] The class definition
   - [ ] Nothing
   > The method can modify the shared object but not rebind the caller's variable.
4. Why is returning a reference to a local variable in C++ a bug?
   - [ ] It is slow
   - [x] The variable is destroyed when the function returns, leaving a dangling reference
   - [ ] It changes the type
   - [ ] References cannot be returned
   > Using the reference afterwards is undefined behavior.

# Dynamic Memory Allocation
kind: concept
time: Not applicable — each allocation is a call into the allocator whose cost varies with its design. Growing a buffer by doubling is amortised constant time per element, a result covered in later lessons.
space: Not applicable — the whole point is requesting a chosen amount of memory at run time; there is no fixed bound.

## intro
Dynamic allocation lets a program ask for memory while it is running, in an amount decided at run time, and keep it as long as needed. It is how programs handle data whose size is unknown in advance, like the lines of a file or the elements of a growing list.

## theory
In C the standard library provides:

- `malloc(size)` allocates size bytes and returns a pointer to uninitialised memory, or NULL if it fails
- `calloc(count, size)` allocates and zeroes count items
- `realloc(ptr, newsize)` changes the size of a block, possibly moving it; it returns the new address and the old pointer must no longer be used
- `free(ptr)` returns a block to the allocator; each successful allocation needs exactly one free

C++ uses `new` and `delete` (and `new[]` with `delete[]` for arrays), which also run constructors and destructors, and modern code prefers containers and smart pointers.

Rules:

- Always check the result for NULL
- Compute sizes with `sizeof` and guard against overflow in `count * size`
- Do not use memory after freeing it (use after free), do not free it twice (double free), do not free memory that was not allocated, and do not forget to free it (leak)
- After `realloc` use only the returned pointer; if it returns NULL the original block is still valid
- Initialise memory before reading it

The allocator keeps free lists and metadata, rounds sizes up and can fragment the heap. Growing a buffer geometrically (doubling) rather than by a fixed amount keeps the total copying cost linear.

Managed languages hide this: Python lists over-allocate and grow automatically; JavaScript offers resizable ArrayBuffers; garbage collectors reclaim memory.

## explain
1. Decide how much memory is needed and compute the size with sizeof.
2. Allocate, and immediately check for failure.
3. Initialise the memory, with calloc or by assigning values.
4. Use it only through the pointer, within the bounds you allocated.
5. Grow it with realloc using a temporary pointer, so a failure does not lose the original.
6. Free it exactly once when finished, and set the pointer to NULL.

## example
The C program allocates room for five integers with malloc, checks for NULL, fills them, grows the block to ten with a temporary pointer from realloc and finally frees it. The Python sample uses ctypes to get a raw 8-byte buffer, copies three bytes into it and prints them with the buffer length of 8, then resizes the buffer to 16 bytes and prints its new size. The JavaScript sample creates an ArrayBuffer that is allowed to grow up to 16 bytes and resizes it from 8 to 12.

## real
Every dynamic data structure, from a vector to a hash table, grows by reallocating, and memory-safety tools such as Valgrind and address sanitizers exist chiefly to catch misuse of malloc and free.

## pros
- Memory size can be chosen at run time
- Data can outlive the function that created it
- Large allocations are limited only by available memory

## cons
- Manual management causes leaks, double frees and use after free
- Allocation is slower than stack allocation
- Fragmentation can waste memory

## uses
- Reading input of unknown size
- Building lists, trees and graphs
- Creating large buffers and images
- Implementing growable containers

## mistakes
- Not checking whether malloc returned NULL
- Losing the original pointer by assigning the realloc result directly
- Freeing the same block twice
- Using the memory after it has been freed

## interview
**Q:** What is the difference between malloc and calloc?
**A:** malloc allocates uninitialised memory of a given byte size, while calloc allocates space for a number of items and sets all bytes to zero.

**Q:** Why should you not write p = realloc(p, n) directly?
**A:** If realloc fails it returns NULL and the original block is still allocated, so assigning the result to p loses the only pointer to it and leaks the memory.

**Q:** Why do growable containers double their capacity?
**A:** Doubling spreads the cost of copying over many appends, so the average cost per append stays constant, whereas growing by a fixed amount makes the total cost quadratic.

## summary
Dynamic allocation requests memory at run time. Check every allocation, free each block exactly once, use a temporary for realloc and grow buffers geometrically.

## codenote
The C program shows the full allocate, check, grow and free cycle. The Python sample uses raw buffers through ctypes, and the JavaScript sample uses a resizable buffer.

## code
### python
```python
import ctypes

buffer = ctypes.create_string_buffer(8)
ctypes.memmove(buffer, b"abc", 3)
print(buffer.raw[:3], len(buffer))

ctypes.resize(buffer, 16)
print(ctypes.sizeof(buffer))
```
Output:
```text
b'abc' 8
16
```
### javascript
```javascript
const buffer = new ArrayBuffer(8, { maxByteLength: 16 });
console.log(buffer.byteLength, buffer.resizable);

buffer.resize(12);
console.log(buffer.byteLength);
```
Output:
```text
8 true
12
```
### c
```c
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int *values = malloc(5 * sizeof(int));
    if (values == NULL) {
        return 1;
    }
    for (int i = 0; i < 5; i++) {
        values[i] = i * 10;
    }

    int *bigger = realloc(values, 10 * sizeof(int));
    if (bigger == NULL) {
        free(values);
        return 1;
    }
    values = bigger;
    values[9] = 90;
    printf("%d %d\n", values[4], values[9]);

    free(values);
    return 0;
}
```

## quiz
1. What should you check right after calling malloc?
   - [ ] That the pointer is even
   - [x] That the result is not NULL
   - [ ] That the memory is zero
   - [ ] That the program is on the stack
   > Allocation can fail when memory is exhausted.
2. What is a double free?
   - [ ] Freeing memory twice as fast
   - [x] Freeing the same block twice, which corrupts the allocator
   - [ ] Freeing two blocks at once
   - [ ] A kind of garbage collection
   > Each allocation must be released exactly once.
3. Why use a temporary pointer with realloc?
   - [ ] It is faster
   - [x] A failed realloc returns NULL while the original block is still valid and must not be lost
   - [ ] The result is always the same address
   - [ ] realloc needs two pointers
   > Assigning NULL to the only pointer leaks the original block.
4. Why do growable arrays usually double in size?
   - [ ] Two is the only supported factor
   - [x] The cost of copying is spread out so appends are constant time on average
   - [ ] It reduces fragmentation to zero
   - [ ] It avoids using the heap
   > Geometric growth keeps the total copying linear.

# Memory Leaks and Dangling Pointers
kind: concept
time: Not applicable — these are correctness and resource defects. A leak makes a program slower over time through memory pressure, but it has no running-time formula.
space: Not applicable — a leak means unbounded growth in memory use, which is the defect rather than a design property.

## intro
Two opposite mistakes with memory cause many of the nastiest bugs. A leak means memory is kept long after it is needed, so usage creeps upward until the program or the machine fails. A dangling pointer means a reference to memory that has already been released, so the program reads or writes something that is no longer its own.

## theory
Memory leak: allocated memory that is no longer reachable or no longer useful but is never released.

- In C and C++: forgetting `free` or `delete`, losing the only pointer to a block (overwriting it, returning early from a function on an error path), or failing to release resources in a destructor
- In garbage-collected languages the collector frees unreachable objects, so true leaks are rare, but logical leaks occur when objects remain reachable by mistake: a cache that is never cleaned, a list that only grows, event listeners that are never removed, closures that capture large objects
- In Python, reference counting frees most objects immediately; cycles (a refers to b and b refers to a) are freed later by the cycle collector, and objects with problematic finalizers or global registries can stay alive
- Effects: gradually rising memory use, slowdowns from paging, eventually out-of-memory termination; the bug often appears only after long running time

Dangling pointer: a pointer that still holds the address of memory that has been freed or that has gone out of scope.

- Use after free: reading or writing a block after `free`
- Returning the address of a local variable
- Keeping a pointer into a container after the container reallocates (iterator invalidation)
- Double free: freeing a dangling pointer again
- Effects: undefined behavior, which may crash, silently corrupt other data or be exploited by attackers

Prevention:

- Match every allocation with exactly one release, in one clear owner
- Set pointers to NULL after freeing so accidental use fails fast
- Use RAII and smart pointers in C++, `with` statements in Python, `try-with-resources` in Java
- Use weak references for caches and back-pointers
- Test with Valgrind or AddressSanitizer, and monitor memory use in long-running services

## explain
1. For every allocation, name the owner responsible for releasing it.
2. Check every exit path of a function, including error paths, for cleanup.
3. After freeing a block, set the pointer to NULL or let it go out of scope immediately.
4. Do not store pointers or references to memory whose lifetime you do not control.
5. In managed languages, review long-lived collections and caches and bound their size or use weak references.
6. Run a memory checker or profiler and watch the memory graph of long-running programs.

## example
The Python sample builds two objects that refer to each other and drops the names. A weak reference shows that the objects are still alive, because the cycle keeps them in memory until the cycle collector runs, and after an explicit collection the weak reference is empty. The JavaScript sample contrasts a Map, which keeps its keys alive and reports a size, with a WeakMap, which does not even expose a size because its entries may disappear when the keys are collected. The C program, not run here, shows a leak and its fix, and a dangling pointer that is protected by setting it to NULL.

## real
Long-running servers are restarted on a schedule because of slow leaks, browsers accumulate memory from forgotten event handlers, and use-after-free bugs are among the most commonly exploited security vulnerabilities.

## pros
- Understanding both defects makes code reviews sharper
- Smart pointers and scoped resources prevent most cases
- Tools can find them automatically

## cons
- Leaks show only after long running time
- Dangling pointer bugs may seem to work until memory is reused
- Fixes sometimes require redesigning ownership

## uses
- Reviewing C and C++ code for ownership errors
- Finding unbounded caches and listener leaks in managed languages
- Choosing weak references for caches
- Explaining why long-running services restart periodically

## mistakes
- Returning early from a function without releasing what was allocated
- Overwriting the only pointer to a block
- Using a pointer after freeing the block
- Keeping every object in a global cache forever

## interview
**Q:** What is the difference between a memory leak and a dangling pointer?
**A:** A leak is memory that is no longer needed but not released, so usage grows. A dangling pointer is a pointer to memory that has already been released, so using it is invalid.

**Q:** Can a garbage-collected language have memory leaks?
**A:** Yes, logically. Objects that are still reachable, for example through a growing cache or a forgotten listener, are never collected even though the program no longer needs them.

**Q:** How can you detect leaks in a long-running service?
**A:** Monitor memory use over time, take heap snapshots and compare them, and use tools such as Valgrind, AddressSanitizer or language-specific profilers.

## summary
Leaks keep memory too long, dangling pointers use it too late. Give every allocation one owner, clean up on all paths, null out freed pointers, prefer scoped or smart resource management and test with memory tools.

## codenote
The Python sample uses a weak reference to observe a reference cycle until collection. The JavaScript sample contrasts strong and weak maps. The C sample shows typical mistakes and their fixes.

## code
### python
```python
import gc
import weakref

class Node:
    pass

a = Node()
b = Node()
a.other = b
b.other = a

probe = weakref.ref(a)
del a, b
print(probe() is not None)

gc.collect()
print(probe())
```
Output:
```text
True
None
```
### javascript
```javascript
const strong = new Map([[{}, 1]]);
const weak = new WeakMap();

console.log(strong.size, typeof weak.size);
```
Output:
```text
1 undefined
```
### c
```c
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int *data = malloc(sizeof(int));
    if (data == NULL) {
        return 1;
    }
    *data = 7;
    printf("%d\n", *data);

    free(data);
    data = NULL;

    if (data != NULL) {
        printf("%d\n", *data);
    }
    return 0;
}
```

## quiz
1. What is a memory leak?
   - [ ] Memory that is released twice
   - [x] Memory that is no longer needed but is never released
   - [ ] A pointer to freed memory
   - [ ] A fast cache
   > Usage grows because nothing frees the unused memory.
2. What is a dangling pointer?
   - [ ] A pointer to NULL
   - [x] A pointer to memory that has already been freed or has gone out of scope
   - [ ] A pointer to a function
   - [ ] A pointer that is const
   > Using it is undefined behavior.
3. Why can a growing cache be a leak in a garbage-collected language?
   - [ ] The collector is broken
   - [x] Its entries stay reachable, so they are never collected
   - [ ] Caches use the stack
   - [ ] Caches are written in C
   > Reachability, not usefulness, decides what the collector keeps.
4. What does setting a pointer to NULL after free help with?
   - [ ] Speed
   - [x] Accidental later use fails clearly instead of touching released memory
   - [ ] Memory fragmentation
   - [ ] Compiling
   > Dereferencing NULL fails immediately and is easy to find.

# Garbage Collection Models
kind: concept
time: Not applicable — collectors trade pauses and throughput in different ways, but their cost depends on the implementation and workload rather than a simple formula.
space: Not applicable — collectors need headroom beyond the live data, but the amount varies by design.

## intro
A garbage collector automatically reclaims memory that a program can no longer use, freeing the programmer from calling free. Different languages use different strategies, and the choice explains behaviors such as when finalizers run, why cycles matter and why programs sometimes pause.

## theory
Two foundational approaches:

- Reference counting. Each object stores a count of references to it. When a reference is added the count rises, and when one is removed it falls; at zero the object is freed immediately. Advantages: prompt, predictable release and no long pauses. Disadvantages: the bookkeeping on every assignment, and cycles (a refers to b, b refers to a) never reach zero. CPython uses reference counting plus a separate cycle detector; Swift and Objective-C use automatic reference counting, requiring weak references to break cycles.
- Tracing collection. The collector finds everything reachable from the roots (global variables, stack variables, registers) by following references, then reclaims the rest. Cycles are handled naturally, because an unreachable cycle is simply not found. Used by Java, JavaScript, Go, C# and others.

Tracing variants:

- Mark and sweep: mark all reachable objects, then sweep through memory freeing unmarked ones; can leave memory fragmented
- Mark and compact: also moves live objects together to remove gaps
- Copying (semispace): copy live objects to a fresh area and discard the old one; fast when most objects die
- Generational: based on the observation that most objects die young. New objects are placed in a young generation collected often and cheaply; survivors are promoted to an old generation collected rarely. Used by the JVM, V8 and the .NET runtime.
- Incremental and concurrent collectors do their work in small pieces or on other threads to reduce pause times, at the cost of complexity

Trade-offs: pause times (stop-the-world), throughput, memory overhead and predictability. Real-time and low-latency systems choose collectors that bound pauses, or avoid collection altogether.

Programmer implications: unreachable memory is reclaimed, but timing is not guaranteed, so do not rely on finalizers for releasing files or locks; remove references to large objects you no longer need; avoid creating huge numbers of short-lived objects in hot loops; use weak references for caches.

## explain
1. Identify the roots: the variables and stacks that the program can reach.
2. A tracing collector marks everything reachable from the roots by following references.
3. Anything not marked is garbage and is reclaimed, including whole cycles.
4. A reference-counting system instead frees an object the moment its count falls to zero.
5. Generational systems collect the young area often because most new objects die quickly.
6. As a programmer, release references you no longer need and manage non-memory resources explicitly.

## example
The Python lines show reference counting at work: a new list has two references reported by `sys.getrefcount` (one is the temporary argument), a second name raises it to 3, and deleting the name brings it back to 2. A list that contains itself is a cycle that counting alone cannot free, and `gc.collect()` finds it. The JavaScript program implements a tiny mark-and-sweep over a graph of named objects: starting from the root A it marks A, B and C, and the unreachable pair D and E, which refer to each other, is reported as garbage.

## real
The Java virtual machine offers several collectors tuned for throughput or low latency, Go's collector aims for short pauses, and tuning collector settings is a regular task in production services. In Python, forgetting that cycles need the collector explains delayed destructor calls.

## pros
- Removes whole classes of bugs such as use after free and double free
- Tracing collectors reclaim cycles automatically
- Generational collection is efficient for typical allocation patterns

## cons
- Pauses and overhead can affect latency
- Memory can be released later than needed
- Programmers lose precise control over when cleanup happens

## uses
- Choosing a language runtime for a project
- Tuning collector settings in server applications
- Diagnosing why memory use stays high
- Designing caches with weak references

## mistakes
- Relying on finalizers to close files or release locks
- Creating reference cycles with objects that need prompt cleanup
- Keeping references to large objects that are no longer needed
- Ignoring allocation rates in hot paths

## interview
**Q:** What is the difference between reference counting and tracing garbage collection?
**A:** Reference counting frees an object when its count of references reaches zero, but cannot reclaim cycles. Tracing collection finds all objects reachable from the roots and frees the rest, which handles cycles but may cause pauses.

**Q:** What is the generational hypothesis?
**A:** The observation that most objects die young, so collecting a small young generation frequently is cheap and productive, while the older generation is collected less often.

**Q:** Why should you not rely on finalizers to release resources?
**A:** The collector decides when, or whether, they run, so a file or lock could stay open for a long time; deterministic cleanup should use explicit close calls or scoped constructs.

## summary
Garbage collectors reclaim unreachable memory by reference counting or by tracing from roots, often with generations to cut cost. Understand the model your runtime uses and release non-memory resources explicitly.

## codenote
The Python sample demonstrates reference counts and the cycle collector. The JavaScript sample implements a toy mark and sweep.

## code
### python
```python
import gc
import sys

items = []
print(sys.getrefcount(items))
alias = items
print(sys.getrefcount(items))
del alias
print(sys.getrefcount(items))

cycle = []
cycle.append(cycle)
del cycle
print(gc.collect() >= 1)
```
Output:
```text
2
3
2
True
```
### javascript
```javascript
const heap = {
  A: ["B"],
  B: ["C"],
  C: [],
  D: ["E"],
  E: ["D"],
};
const roots = ["A"];

const marked = new Set();
const stack = [...roots];
while (stack.length) {
  const name = stack.pop();
  if (marked.has(name)) continue;
  marked.add(name);
  stack.push(...heap[name]);
}

const garbage = Object.keys(heap).filter((name) => !marked.has(name));
console.log([...marked].sort(), garbage);
```
Output:
```text
[ 'A', 'B', 'C' ] [ 'D', 'E' ]
```

## quiz
1. What is the weakness of simple reference counting?
   - [ ] It is too slow to free objects
   - [x] Objects in a reference cycle never reach a count of zero
   - [ ] It cannot free lists
   - [ ] It uses the disk
   > A cycle keeps each member referenced by another.
2. What does a tracing collector start from?
   - [ ] The oldest object
   - [x] The roots, such as globals and stack variables
   - [ ] The largest object
   - [ ] A random address
   > Everything reachable from the roots is kept.
3. What is the generational hypothesis?
   - [ ] Objects live forever
   - [x] Most objects die young
   - [ ] Old objects die first
   - [ ] All objects live equally long
   > Collectors exploit it by collecting young objects often.
4. Why is relying on finalizers to close files a bad idea?
   - [ ] Files cannot be closed
   - [x] The collector chooses when or whether finalizers run, so resources may stay open
   - [ ] Finalizers delete files
   - [ ] Finalizers are always instant
   > Deterministic cleanup should use explicit scopes.
