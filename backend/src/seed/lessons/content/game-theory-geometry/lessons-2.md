# Cross Product and Orientation
kind: algorithm
time: O(1) per orientation test, since it evaluates a fixed number of multiplications and subtractions; sorting n points by angle with it costs O(n log n).
space: O(1) per test.

## intro
Given three points, does the path from the first to the second to the third turn left, turn right or go straight? The answer is the sign of one small expression, the cross product. This single test decides whether a point is left of a line, whether polygons are convex, whether segments cross and which points belong on a convex hull, and it needs no division or trigonometry.

## theory
Definition: for vectors a = (ax, ay) and b = (bx, by) the 2D cross product is the scalar `a × b = ax·by − ay·bx`. Geometrically it equals `|a||b| sin(θ)` where θ is the signed angle from a to b, and its absolute value is the area of the parallelogram spanned by the two vectors.

Orientation of three points p, q, r: compute `cross(q − p, r − p) = (qx − px)(ry − py) − (qy − py)(rx − px)`.

- Positive: counter-clockwise turn (r is to the left of the directed line p to q)
- Negative: clockwise turn (r is to the right)
- Zero: collinear (the three points lie on one line)

Example: p = (0, 0), q = (4, 0), r = (2, 3): cross((4, 0), (2, 3)) = 4·3 − 0·2 = 12 > 0, so the turn is counter-clockwise and r is above the directed line. With r = (2, −3) the value is −12. With r = (8, 0) it is 0.

Properties:

- Anti-commutative: `a × b = −(b × a)`, so swapping two points flips the sign
- Bilinear: `a × (b + c) = a × b + a × c`
- Triangle area: `|cross(q − p, r − p)| / 2`; twice the signed area is an exact integer for integer points, so compute with the doubled area
- Orientation is invariant under translation and positive scaling of the coordinates
- The sign corresponds to the screen convention only if the y-axis points up; in screen coordinates it flips

Exactness: with integer coordinates up to 10^9 the products reach 10^18 and the difference of two such products up to 2·10^18, which fits in a signed 64-bit integer (9.2·10^18). With floating point coordinates, an epsilon is needed and near-collinear cases become unreliable; this is why robust geometry libraries use exact or adaptive predicates.

Uses of the orientation test:

- Point side of a line: positive means left
- Segment intersection (next lesson): two segments cross when their endpoints lie on opposite sides of each other's lines
- Convex hull: Graham scan and Andrew's monotone chain keep only counter-clockwise turns
- Polygon convexity: all consecutive triples must turn the same direction
- Polygon orientation: the sign of the shoelace sum tells whether vertices run counter-clockwise
- Point in polygon (ray casting or winding number)
- Angular sorting: compare directions around a pivot by the sign of the cross product, avoiding atan2 (valid within a half-plane; split into half-planes for a full circle)
- Collinearity test: zero cross product, then check betweenness with min and max of the coordinates or the dot product
- Visibility and triangulation: ear clipping decides if a vertex is convex using orientation

The 3D case: the cross product of vectors in space is a vector perpendicular to both, with magnitude equal to the parallelogram area; it gives surface normals in graphics and torque in physics.

Applications: computer graphics, collision detection, GIS (point-in-polygon for map regions), robotics path planning and contest geometry.

Pitfalls: swapping the argument order and getting the opposite sign, comparing floating point results to zero without a tolerance, long products overflowing 32-bit integers, forgetting that zero means collinear rather than invalid, and applying angular comparison across the full circle without splitting at the half-plane.

Testing: use triangles with known orientation, swap points to confirm sign flips, and check collinear points in all orders.

## explain
1. Choose three points in order p, q, r.
2. Form the vectors q minus p and r minus p.
3. Compute their cross product with integer arithmetic.
4. Positive means a left turn, negative a right turn and zero collinear.
5. Take half the absolute value for the triangle area.
6. Use the sign to drive hull, intersection and convexity logic.

## example
The Python program classifies several triples as left, right or collinear, checks the sign flip when two points swap, tests whether polygons are convex (a square and an arrowhead shape) and sorts points by angle around the origin without trigonometry. The JavaScript program finds which side of a line points fall on.

## real
Map software tests which region contains a location, games decide on which side of a wall a character stands, and hull algorithms use the same predicate.

## pros
- Constant-time exact test with integers
- No division or trigonometry
- Underlies many geometry algorithms

## cons
- Sign depends on the coordinate convention
- Floating point inputs make the zero case unreliable
- Large coordinates can overflow narrow integer types

## uses
- Left or right of a line decisions
- Convex hulls and convexity tests
- Segment intersection checks
- Sorting points by angle

## mistakes
- Passing the points in the wrong order
- Comparing a floating point result with exact zero
- Using 32-bit integers for big coordinates
- Treating collinear points as an error

## interview
**Q:** How do you tell whether three points make a left turn?
**A:** Compute the cross product of q minus p and r minus p; a positive value means counter-clockwise, negative clockwise and zero collinear.

**Q:** How can you get the area of a triangle with this test?
**A:** The absolute value of the cross product is twice the area, so halve it, or keep the doubled integer area to stay exact.

**Q:** Why is the integer version preferred?
**A:** It is exact, so collinear cases are decided correctly, as long as the products fit in the integer type.

## summary
The sign of cross(q − p, r − p) tells whether three points turn left, right or lie on a line, and its magnitude is twice the triangle area. This exact constant-time predicate drives convex hulls, intersection tests and angular sorting.

## codenote
The Python sample classifies triples and tests convexity. The JavaScript sample finds the side of a line.

## code
### python
```python
from functools import cmp_to_key

def orient(p, q, r):
    value = (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])
    return (value > 0) - (value < 0)

names = {1: "left", -1: "right", 0: "collinear"}
p, q = (0, 0), (4, 0)
print([names[orient(p, q, r)] for r in [(2, 3), (2, -3), (8, 0), (-1, 0)]])
print(orient(p, (2, 3), q) == -orient(p, q, (2, 3)))

def is_convex(poly):
    signs = {orient(poly[i], poly[(i + 1) % len(poly)], poly[(i + 2) % len(poly)]) for i in range(len(poly))}
    return not (1 in signs and -1 in signs)

print(is_convex([(0, 0), (4, 0), (4, 4), (0, 4)]), is_convex([(0, 0), (4, 0), (2, 1), (4, 4), (0, 4)]))

def angle_key(a, b):
    return -orient((0, 0), a, b)

points = [(1, 1), (-1, 1), (0, 2), (2, 0), (1, 3)]
print(sorted(points, key=cmp_to_key(angle_key)))
```
Output:
```text
['left', 'right', 'collinear', 'collinear']
True
True False
[(2, 0), (1, 1), (1, 3), (0, 2), (-1, 1)]
```
### javascript
```javascript
const side = (a, b, p) => Math.sign((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]));
const a = [0, 0];
const b = [10, 10];
const points = [[3, 7], [7, 3], [5, 5], [-2, -2]];
console.log(points.map((p) => p.join(",") + ":" + side(a, b, p)).join(" "));
```
Output:
```text
3,7:1 7,3:-1 5,5:0 -2,-2:0
```

## quiz
1. What does a positive orientation value mean for p, q, r?
   - [ ] A clockwise turn
   - [x] A counter-clockwise turn
   - [ ] The points are collinear
   - [ ] The points coincide
   > The point r lies to the left of the line from p to q.
2. What does the absolute cross product represent?
   - [ ] The perimeter
   - [x] Twice the area of the triangle
   - [ ] The distance between points
   - [ ] The angle in degrees
   > It is the parallelogram area.
3. What happens to the sign when two of the points swap?
   - [ ] It stays the same
   - [x] It flips
   - [ ] It becomes zero
   - [ ] It doubles
   > The cross product is anti-commutative.
4. When is the integer version safe in 64 bits?
   - [ ] For any coordinates
   - [x] When coordinates are below roughly 10^9
   - [ ] Only for coordinates below 100
   - [ ] Never
   > Products stay below about 2 times 10^18.

# Convex Hull Intro
kind: algorithm
time: O(n log n) for Andrew's monotone chain or Graham scan, dominated by sorting; Jarvis march takes O(n·h) for h hull vertices, and the lower bound for comparison-based hulls is Ω(n log n).
space: O(n) for the sorted points and the hull.

## intro
Imagine hammering a nail at every point and stretching a rubber band around all of them. The band snaps to the convex hull, the smallest convex polygon containing the points. Hulls summarise the outline of a point cloud and are the first step in finding the farthest pair, the smallest enclosing box or the boundary of a shape.

## theory
Definition: the convex hull of a set of points is the smallest convex set containing them; in the plane it is a convex polygon whose vertices are some of the input points. A set is convex if the segment between any two of its points stays inside.

Andrew's monotone chain:

- Sort the points by x, then y, and remove duplicates
- Build the lower hull: scan left to right, keeping a stack; before pushing a point, pop while the last two stack points and the new point do not make a counter-clockwise turn (cross product ≤ 0 removes collinear points too, use < 0 to keep them)
- Build the upper hull the same way scanning right to left
- Concatenate the two chains without repeating the end points

Each point is pushed and popped at most once per chain, so after sorting the scan is O(n), for O(n log n) overall.

Example: points (0,0), (4,0), (4,4), (0,4), (2,2), (1,3), (3,1): the hull is the square with 4 vertices; the interior points are discarded. Points on a straight edge, such as (2, 0), are dropped when collinear points are removed.

Other algorithms:

- Graham scan: choose the lowest point as pivot, sort the others by polar angle around it, scan with a stack and pop non-left turns; O(n log n)
- Jarvis march (gift wrapping): from the leftmost point repeatedly choose the point such that all others lie to the left; O(n·h), good when h is small
- Chan's algorithm combines the two to achieve O(n log h)
- QuickHull: divide and conquer like quicksort, average O(n log n) and worst case O(n²)
- Incremental and dynamic hulls maintain the hull under insertions

Derived results:

- Hull perimeter and area using distance sum and the shoelace formula
- Diameter (farthest pair of points): rotating calipers on the hull in O(h) after the hull is built
- Smallest enclosing rectangle and minimum width via rotating calipers
- Point inside hull queries in O(log h) by binary search on angles from a base vertex
- Minkowski sum of two convex polygons by merging edges by angle
- Hull layers (onion peeling), convex hull trick for lines in dynamic programming optimisation (a related idea using lower envelopes of lines)

Degenerate inputs:

- All points collinear: the hull is the segment between the two extreme points (a monotone chain implementation must return exactly those two points)
- Fewer than three distinct points
- Duplicate points: remove after sorting
- Collinear points on hull edges: decide whether to keep them according to the problem (strict versus non-strict hull)

Applications: collision detection (hulls of objects), pattern recognition and image processing, geographic outlines, clustering boundaries, path planning (the shortest path around obstacles hugs hull vertices) and finding extreme points in optimisation problems (linear programming optimum lies at a hull vertex).

Pitfalls: not removing duplicates, using ≤ versus < incorrectly for collinear points, forgetting to drop the last point of each chain (it duplicates the first of the other), floating point coordinates (use exact predicates), and wrong handling of the all-collinear case that produces a doubled segment.

Testing: compare with a brute force that tests every pair for having all other points on one side, use random points with known hull size, and test collinear and duplicate sets.

## explain
1. Sort the points and remove duplicates.
2. Scan left to right with a stack, popping while the last turn is not counter-clockwise.
3. Record the stack as the lower hull.
4. Scan right to left the same way for the upper hull.
5. Join the chains, dropping the repeated end points.
6. Handle fewer than three points and all-collinear input separately.

## example
The Python program builds the hull of the sample square with interior points (4 vertices), a set of collinear points (2 vertices), and 30 random sets of 40 points checked against a brute force that tests every pair of points. The JavaScript program computes the hull perimeter and area.

## real
Image processing libraries, collision engines and geographic tools compute hulls to summarise outlines of objects and regions.

## pros
- Compact summary of a point set
- O(n log n) with a simple stack
- Enables farthest pair and bounding shape queries

## cons
- The initial sort sets the running time
- Degenerate inputs need care
- Exact predicates are needed for robustness

## uses
- Outline of a point cloud
- Farthest pair and bounding rectangles
- Collision shape simplification
- Extreme points in optimisation

## mistakes
- Keeping duplicate input points
- Mishandling collinear points on edges
- Repeating chain end points in the hull
- Failing on all-collinear inputs

## interview
**Q:** How does Andrew's monotone chain work?
**A:** It sorts the points, builds a lower chain left to right and an upper chain right to left with a stack that pops while the last three points do not turn counter-clockwise, then joins the chains in O(n log n).

**Q:** When is gift wrapping preferable?
**A:** When the hull has few vertices, because it runs in O(n times h) which beats n log n if h is smaller than log n.

**Q:** What is the lower bound for computing a hull?
**A:** Omega of n log n in the comparison model, because sorting reduces to it.

## summary
The convex hull is the rubber band around a point set, built by sorting and a stack of left turns in O(n log n). Handle duplicates and collinear points carefully, and use the hull for extremes, diameter and outlines.

## codenote
The Python sample implements the monotone chain and verifies it. The JavaScript sample measures hull size.

## code
### python
```python
import random

def cross(o, a, b):
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

def convex_hull(points):
    pts = sorted(set(points))
    if len(pts) <= 2:
        return pts
    lower, upper = [], []
    for p in pts:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0:
            lower.pop()
        lower.append(p)
    for p in reversed(pts):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], p) <= 0:
            upper.pop()
        upper.append(p)
    return lower[:-1] + upper[:-1]

square = [(0, 0), (4, 0), (4, 4), (0, 4), (2, 2), (1, 3), (3, 1), (2, 0)]
print(convex_hull(square))
print(convex_hull([(0, 0), (1, 1), (2, 2), (3, 3)]))

def brute(points):
    pts = sorted(set(points))
    on_hull = set()
    for a in pts:
        for b in pts:
            if a == b:
                continue
            others = [c for c in pts if c not in (a, b)]
            sides = [cross(a, b, c) for c in others]
            inside = all(min(a[0], b[0]) <= c[0] <= max(a[0], b[0]) and min(a[1], b[1]) <= c[1] <= max(a[1], b[1])
                         for c, s in zip(others, sides) if s == 0)
            if inside and (all(s >= 0 for s in sides) or all(s <= 0 for s in sides)):
                on_hull.update((a, b))
    return on_hull

rng = random.Random(11)
ok = True
for _ in range(30):
    cloud = [(rng.randint(0, 50), rng.randint(0, 50)) for _ in range(40)]
    if set(convex_hull(cloud)) != brute(cloud):
        ok = False
print(ok, len(convex_hull(cloud)))
```
Output:
```text
[(0, 0), (4, 0), (4, 4), (0, 4)]
[(0, 0), (3, 3)]
True 9
```
### javascript
```javascript
const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

function hull(points) {
  const pts = [...new Set(points.map(String))].map((s) => s.split(",").map(Number)).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const build = (list) => {
    const chain = [];
    for (const p of list) {
      while (chain.length >= 2 && cross(chain[chain.length - 2], chain[chain.length - 1], p) <= 0) chain.pop();
      chain.push(p);
    }
    return chain.slice(0, -1);
  };
  return build(pts).concat(build([...pts].reverse()));
}

const h = hull([[0, 0], [6, 0], [6, 4], [0, 4], [3, 2], [1, 1], [5, 3]]);
let perimeter = 0;
let area2 = 0;
h.forEach((p, i) => {
  const q = h[(i + 1) % h.length];
  perimeter += Math.hypot(q[0] - p[0], q[1] - p[1]);
  area2 += p[0] * q[1] - q[0] * p[1];
});
console.log(h.length, perimeter, Math.abs(area2) / 2);
```
Output:
```text
4 20 24
```

## quiz
1. What is the convex hull of a point set?
   - [ ] The set of all pairs
   - [x] The smallest convex polygon containing all the points
   - [ ] The shortest path through the points
   - [ ] The centroid
   > It is the rubber band stretched around the points.
2. What dominates the cost of the monotone chain?
   - [ ] The stack operations
   - [x] The initial sort
   - [ ] The cross products
   - [ ] Duplicate removal only
   > The scans are linear after sorting.
3. What does the stack pop on while building a chain?
   - [ ] Left turns
   - [x] Turns that are not counter-clockwise
   - [ ] Duplicate points only
   - [ ] The first point
   > Only left turns can stay on the lower hull.
4. When does gift wrapping beat n log n?
   - [ ] When n is small
   - [x] When the hull has very few vertices
   - [ ] When points are collinear
   - [ ] Always
   > Its cost is n times the hull size.

# Line Intersection
kind: algorithm
time: O(1) to test or compute the intersection of two segments or lines; checking n segments pairwise costs O(n²), while the sweep line method finds k intersections in O((n + k) log n).
space: O(1) per pair.

## intro
Do two roads cross? Where do two rays meet? Do any two of a thousand wires touch? Intersection questions come up in maps, games, circuit layout and rendering. The two-segment case reduces to a few orientation tests, and the exact crossing point comes from solving a two-by-two linear system.

## theory
Lines in the plane: represent a line through points p and q as `p + t·(q − p)`, or as `a x + b y = c` with `a = qy − py`, `b = px − qx`, `c = a·px + b·py`.

Intersection point of two lines `a1 x + b1 y = c1` and `a2 x + b2 y = c2`: the determinant `D = a1·b2 − a2·b1`.

- If D ≠ 0 the lines meet at exactly one point `x = (c1·b2 − c2·b1) / D`, `y = (a1·c2 − a2·c1) / D`
- If D = 0 the lines are parallel; they coincide when additionally the equations are proportional (`c1·b2 = c2·b1` and `a1·c2 = a2·c1`)

Example: the lines through (0, 0)–(4, 4) and (0, 4)–(4, 0) have D ≠ 0 and meet at (2, 2). The lines through (0, 0)–(1, 1) and (0, 1)–(1, 2) are parallel.

Segments: the segments pq and rs intersect when

- General case: r and s lie on opposite sides of line pq (orientations of (p, q, r) and (p, q, s) differ in sign), and p and q lie on opposite sides of line rs
- Special cases: when an orientation is zero (collinear), the endpoint must also lie within the bounding box of the other segment (on-segment test using min and max of coordinates)

This test uses only integer cross products and is exact. After it succeeds, compute the intersection point with the line formula if needed (the point may have rational coordinates).

Parametric form: solving `p + t·r = q + u·s` with `r = p2 − p`, `s = q2 − q` gives `t = cross(q − p, s) / cross(r, s)` and `u = cross(q − p, r) / cross(r, s)`. The segments intersect if `0 ≤ t ≤ 1` and `0 ≤ u ≤ 1`, and cross(r, s) = 0 means parallel (collinear overlapping when cross(q − p, r) = 0 too).

Related problems:

- Ray and segment intersection: same with t ≥ 0 for the ray
- Line and circle: substitute the parametric line into the circle equation and solve a quadratic; the discriminant counts 0, 1 or 2 intersections
- Circle and circle: use the distance between centres compared with the sum and difference of radii
- Polygon and line clipping (Cohen-Sutherland, Liang-Barsky for rectangles)
- Point in polygon by counting how many polygon edges a ray from the point crosses (odd means inside)
- Counting all intersections among n segments with the Bentley-Ottmann sweep line in O((n + k) log n)
- Half-plane intersection and visibility polygons in O(n log n)

Precision: with integer endpoints the orientation test is exact, but the intersection point is rational; store numerator and denominator or use floating point only at the end. Never test whether a computed floating point intersection lies on the segment by exact comparison; use the exact orientation test instead.

Applications: collision detection (rays against walls), vector graphics and CAD, GIS overlays of road networks, pathfinding with obstacles, ray tracing, and detecting self-intersections in polygons.

Pitfalls: forgetting the collinear and touching cases, dividing before checking for parallel lines, comparing floating point coordinates for exact equality, mixing infinite lines with finite segments, and double counting a shared endpoint when counting intersections.

Testing: cross, touching at an endpoint, T-junction, collinear overlapping, collinear disjoint and parallel segments, each in both argument orders.

## explain
1. Compute the four orientations of each endpoint against the other segment.
2. If the signs differ on both sides, the segments cross.
3. For zero orientations, check whether the point lies within the other segment's bounding box.
4. For the intersection point, solve the two-by-two system with the determinant.
5. Treat a zero determinant as parallel or coincident.
6. Test touching, T-shaped and collinear configurations in both orders.

## example
The Python program tests several segment pairs (crossing, touching at an endpoint, collinear overlap, collinear disjoint and parallel), computes the crossing point of two diagonals as a fraction, and finds line-circle intersections by the discriminant. The JavaScript program counts crossing pairs among random segments with a brute force check against the parametric solution.

## real
Map overlays, game physics, CAD tools and ray tracers all intersect lines and segments many times per frame.

## pros
- Constant time per pair with integer arithmetic
- Exact test with no division
- Parametric form yields the crossing point

## cons
- Many special cases to handle
- Intersection points are rational, not integers
- Pairwise testing of many segments is quadratic

## uses
- Collision tests between paths
- Ray casting against polygons
- Clipping lines to windows
- Detecting self-intersecting polygons

## mistakes
- Forgetting collinear and touching configurations
- Dividing by a zero determinant
- Testing a rounded intersection point for membership exactly
- Counting a shared endpoint twice

## interview
**Q:** How do you test whether two segments intersect without division?
**A:** Check that each segment's endpoints lie on opposite sides of the other segment's line using orientation signs, and handle zero orientations with a bounding box check.

**Q:** How do you compute the intersection point of two lines?
**A:** Write both as a x plus b y equals c, compute the determinant, and if it is nonzero the point is given by Cramer's rule; a zero determinant means parallel.

**Q:** How can many segments be tested efficiently?
**A:** A sweep line such as Bentley-Ottmann reports all k intersections among n segments in O((n plus k) log n) instead of checking all pairs.

## summary
Segment intersection uses four orientation tests and special cases for collinear touching, and the crossing point comes from a determinant formula. For many segments, sweep line methods avoid quadratic work.

## codenote
The Python sample covers the cases and the circle. The JavaScript sample counts crossings.

## code
### python
```python
from fractions import Fraction
from math import sqrt

def orient(p, q, r):
    v = (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])
    return (v > 0) - (v < 0)

def on_segment(p, q, r):
    return min(p[0], q[0]) <= r[0] <= max(p[0], q[0]) and min(p[1], q[1]) <= r[1] <= max(p[1], q[1])

def segments_intersect(p1, p2, q1, q2):
    o1, o2 = orient(p1, p2, q1), orient(p1, p2, q2)
    o3, o4 = orient(q1, q2, p1), orient(q1, q2, p2)
    if o1 != o2 and o3 != o4:
        return True
    return ((o1 == 0 and on_segment(p1, p2, q1)) or (o2 == 0 and on_segment(p1, p2, q2))
            or (o3 == 0 and on_segment(q1, q2, p1)) or (o4 == 0 and on_segment(q1, q2, p2)))

cases = {
    "cross": ((0, 0), (4, 4), (0, 4), (4, 0)),
    "touch": ((0, 0), (2, 2), (2, 2), (4, 0)),
    "overlap": ((0, 0), (4, 0), (2, 0), (6, 0)),
    "disjoint": ((0, 0), (1, 0), (2, 0), (3, 0)),
    "parallel": ((0, 0), (4, 0), (0, 1), (4, 1)),
}
print({name: segments_intersect(*pts) for name, pts in cases.items()})

def line_point(p1, p2, q1, q2):
    a1, b1 = p2[1] - p1[1], p1[0] - p2[0]
    c1 = a1 * p1[0] + b1 * p1[1]
    a2, b2 = q2[1] - q1[1], q1[0] - q2[0]
    c2 = a2 * q1[0] + b2 * q1[1]
    d = a1 * b2 - a2 * b1
    if d == 0:
        return None
    return Fraction(c1 * b2 - c2 * b1, d), Fraction(a1 * c2 - a2 * c1, d)

print(line_point((0, 0), (4, 4), (0, 4), (4, 0)), line_point((0, 0), (3, 1), (0, 2), (1, 0)))

def line_circle(p, q, center, radius):
    dx, dy = q[0] - p[0], q[1] - p[1]
    fx, fy = p[0] - center[0], p[1] - center[1]
    a, b, c = dx * dx + dy * dy, 2 * (fx * dx + fy * dy), fx * fx + fy * fy - radius * radius
    disc = b * b - 4 * a * c
    return 2 if disc > 0 else 1 if disc == 0 else 0

print(line_circle((-5, 0), (5, 0), (0, 0), 3), line_circle((-5, 3), (5, 3), (0, 0), 3), line_circle((-5, 4), (5, 4), (0, 0), 3))
```
Output:
```text
{'cross': True, 'touch': True, 'overlap': True, 'disjoint': False, 'parallel': False}
(Fraction(2, 1), Fraction(2, 1)) (Fraction(6, 7), Fraction(2, 7))
2 1 0
```
### javascript
```javascript
function seeded(seed) {
  let s = seed;
  return () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;
}
const rand = seeded(42);
const segments = Array.from({ length: 40 }, () => [[Math.floor(rand() * 100), Math.floor(rand() * 100)], [Math.floor(rand() * 100), Math.floor(rand() * 100)]]);

const orient = (p, q, r) => Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]));
const crosses = ([p1, p2], [q1, q2]) => orient(p1, p2, q1) * orient(p1, p2, q2) < 0 && orient(q1, q2, p1) * orient(q1, q2, p2) < 0;

function parametric([p, p2], [q, q2]) {
  const r = [p2[0] - p[0], p2[1] - p[1]];
  const s = [q2[0] - q[0], q2[1] - q[1]];
  const denom = r[0] * s[1] - r[1] * s[0];
  if (denom === 0) return false;
  const t = ((q[0] - p[0]) * s[1] - (q[1] - p[1]) * s[0]) / denom;
  const u = ((q[0] - p[0]) * r[1] - (q[1] - p[1]) * r[0]) / denom;
  return t > 0 && t < 1 && u > 0 && u < 1;
}

let byOrientation = 0;
let byParametric = 0;
for (let i = 0; i < segments.length; i++) {
  for (let j = i + 1; j < segments.length; j++) {
    byOrientation += crosses(segments[i], segments[j]) ? 1 : 0;
    byParametric += parametric(segments[i], segments[j]) ? 1 : 0;
  }
}
console.log(byOrientation, byParametric, byOrientation === byParametric);
```
Output:
```text
194 194 true
```

## quiz
1. What does a zero determinant mean for two lines?
   - [ ] They are perpendicular
   - [x] They are parallel or coincide
   - [ ] They meet at the origin
   - [ ] They are vertical
   > No unique intersection point exists.
2. When do two segments properly cross?
   - [ ] When their lengths are equal
   - [x] When each segment's endpoints lie on opposite sides of the other's line
   - [ ] When they share a slope
   - [ ] When one is longer
   > Both orientation sign pairs must differ.
3. Why check bounding boxes in some cases?
   - [ ] To speed up sorting
   - [x] To decide whether a collinear endpoint lies within the other segment
   - [ ] To compute the angle
   - [ ] To avoid integers
   > Collinear points need a betweenness check.
4. How many intersections can a line and a circle have?
   - [ ] Exactly one
   - [x] Zero, one or two
   - [ ] Always two
   - [ ] Infinitely many
   > The quadratic discriminant decides.

# Closest Pair Geometry
kind: algorithm
time: O(n log n) with divide and conquer or a sweep line, compared with O(n²) for checking all pairs; randomized grid methods run in expected O(n).
space: O(n) for the sorted copies and the strip.

## intro
Given thousands of points, which two are nearest to each other? Checking all pairs takes quadratic time. A divide and conquer algorithm splits the points by a vertical line, finds the best pair on each side and then looks only in a narrow strip around the dividing line, where a geometric packing argument shows that each point needs to be compared with just a handful of neighbours.

## theory
Problem: find the minimum Euclidean distance between two distinct points among n points in the plane. Brute force compares n(n−1)/2 pairs.

Divide and conquer algorithm:

- Sort the points by x once (and keep a copy sorted by y)
- Split at the median x into left and right halves; recursively find the closest distances `dl` and `dr` and let `d = min(dl, dr)`
- The closest pair that crosses the dividing line has both points within distance d of the line, so collect the points in the vertical strip of width 2d around the line
- Sort the strip by y (or merge the y-sorted halves) and compare each strip point with the following points while their y difference is less than d
- The answer is the smaller of d and the best strip pair
- Base case: for 3 or fewer points use brute force

Why only a constant number of comparisons: for a strip point p, all candidates have y within d above p and x within d of the line, forming a d by 2d rectangle. Because points in each half are at least d apart, at most 6 points can lie in that rectangle (a packing argument with eight d/2 by d/2 cells holding at most one point each), usually quoted as at most 7 following points. So the strip step is linear.

Complexity: the recurrence is `T(n) = 2T(n/2) + O(n)` when the y-order is maintained by merging, giving O(n log n). If the strip is re-sorted every time, `T(n) = 2T(n/2) + O(n log n)` gives O(n log² n), still acceptable for n up to 10^5.

Example: points (2, 3), (12, 30), (40, 50), (5, 1), (12, 10), (3, 4). Brute force finds the closest pair (2, 3) and (3, 4) at distance sqrt(2) ≈ 1.4142.

Alternative methods:

- Sweep line: process points by increasing x and keep a balanced set (ordered by y) of points within distance d of the current x; for each new point, query the set for points with y within d; O(n log n)
- Randomised grid: put the points in a hash grid with cell size equal to the current best distance and rebuild when it shrinks; expected O(n) (Rabin, Khuller and Matias)
- Spatial structures: k-d trees give nearest neighbour queries in O(log n) average per query
- Nearest neighbour for many query points, k nearest neighbours and all-nearest-neighbour via Voronoi diagrams and Delaunay triangulation, from which the closest pair is an edge

Variants: closest pair in 3D and higher dimensions (the packing constant grows), farthest pair (rotating calipers on the convex hull in O(n log n)), closest pair between two sets and the minimum distance with other metrics (Manhattan).

Applications: collision detection, air traffic control (minimum separation between aircraft), clustering (single-link merging uses the closest pair), geographic proximity, molecular simulation and detecting duplicates in noisy data.

Implementation notes: use squared distances to avoid square roots and floating point error with integers; handle duplicate points (answer 0); sort by x once at the start and pass the y-sorted lists to avoid repeated sorting.

Pitfalls: looping over all points in the strip pairs (becomes quadratic), using the strip width d instead of 2d, wrong base case sizes, treating equal x values inconsistently when splitting, and floating point rounding in comparisons with d.

Testing: compare with brute force on random inputs, include duplicates, collinear points and points sharing x coordinates.

## explain
1. Sort the points by x.
2. Split them in two halves and solve each half recursively.
3. Let d be the smaller of the two best distances.
4. Gather points within d of the dividing line into a strip sorted by y.
5. Compare each strip point only with later points whose y difference is below d.
6. Return the smallest distance found.

## example
The Python program finds the closest pair for the six sample points with brute force and divide and conquer (squared distance 2), checks both approaches agree on 100 random sets, and prints how many pairs brute force would examine for 2000 points (1,999,000). The JavaScript program uses a simplified sweep over x that trims the window by the best distance and reports the squared distance 2 with only 2 distance checks.

## real
Air traffic software, molecular simulations and clustering routines look for nearest neighbours constantly.

## pros
- Beats the quadratic brute force
- The strip argument bounds the work per point
- Extends to other nearest neighbour methods

## cons
- Trickier than brute force to implement correctly
- Needs careful handling of duplicates and ties
- Dimension growth increases constants

## uses
- Collision and separation checks
- Single-link clustering
- Detecting near-duplicate points
- Proximity queries

## mistakes
- Comparing all pairs inside the strip
- Using the wrong strip width
- Re-sorting at every level without noticing the cost
- Ignoring duplicate points

## interview
**Q:** How does the divide and conquer closest pair algorithm achieve n log n?
**A:** It solves both halves, then only checks points within the best distance of the dividing line, and a packing argument limits each strip point to a constant number of comparisons, giving the recurrence T(n) = 2T(n/2) + O(n).

**Q:** Why is the strip comparison constant per point?
**A:** Points in each half are at least d apart, so a d by 2d rectangle can hold only a handful of them.

**Q:** What alternative runs in expected linear time?
**A:** A randomised grid algorithm that hashes points into cells of the current best distance and rebuilds the grid when the distance decreases.

## summary
The closest pair of n points is found in O(n log n) by splitting at the median, solving recursively and scanning a strip of width 2d where a packing argument limits comparisons. Sweep line and grid methods offer alternatives.

## codenote
The Python sample implements and verifies divide and conquer. The JavaScript sample uses a sweep.

## code
### python
```python
import random
from itertools import combinations

def d2(a, b):
    return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2

def brute(points):
    return min(d2(a, b) for a, b in combinations(points, 2))

def closest(points):
    px = sorted(points)
    return rec(px)

def rec(px):
    n = len(px)
    if n <= 3:
        return brute(px)
    mid = n // 2
    midx = px[mid][0]
    best = min(rec(px[:mid]), rec(px[mid:]))
    strip = sorted((p for p in px if (p[0] - midx) ** 2 < best), key=lambda p: p[1])
    for i, p in enumerate(strip):
        for q in strip[i + 1:i + 8]:
            if (q[1] - p[1]) ** 2 >= best:
                break
            best = min(best, d2(p, q))
    return best

sample = [(2, 3), (12, 30), (40, 50), (5, 1), (12, 10), (3, 4)]
print(brute(sample), closest(sample))

rng = random.Random(9)
ok = True
for _ in range(100):
    cloud = list({(rng.randint(0, 200), rng.randint(0, 200)) for _ in range(rng.randint(2, 60))})
    if len(cloud) >= 2 and brute(cloud) != closest(cloud):
        ok = False
print(ok, 2000 * 1999 // 2)
```
Output:
```text
2 2
True 1999000
```
### javascript
```javascript
// Simplified sweep: the window is trimmed by x only, so it is not worst-case O(n log n)
function closestSweep(points) {
  const pts = [...points].sort((a, b) => a[0] - b[0]);
  let best = Infinity;
  let left = 0;
  let checks = 0;
  for (let i = 0; i < pts.length; i++) {
    while (left < i && (pts[i][0] - pts[left][0]) ** 2 >= best) left++;
    for (let j = left; j < i; j++) {
      checks++;
      const d = (pts[i][0] - pts[j][0]) ** 2 + (pts[i][1] - pts[j][1]) ** 2;
      if (d < best) best = d;
    }
  }
  return [best, checks];
}

console.log(closestSweep([[2, 3], [12, 30], [40, 50], [5, 1], [12, 10], [3, 4]]));
```
Output:
```text
[ 2, 2 ]
```

## quiz
1. What is the brute force cost of the closest pair of n points?
   - [ ] O(n)
   - [x] O(n squared)
   - [ ] O(log n)
   - [ ] O(n log n)
   > Every pair of points is compared.
2. Where must a crossing closest pair lie?
   - [ ] Anywhere in the plane
   - [x] Within distance d of the dividing line on both sides
   - [ ] Exactly on the line
   - [ ] At the median point only
   > Otherwise their distance would already exceed d.
3. Why is the strip scan linear?
   - [ ] The strip has one point
   - [x] A packing argument limits the neighbours checked per point to a constant
   - [ ] The points are sorted by x
   - [ ] Distances are integers
   > Points in each half are at least d apart.
4. Which method gives expected linear time?
   - [ ] Brute force
   - [x] A randomised grid with cell size equal to the current best distance
   - [ ] Sorting only
   - [ ] Binary search
   > Rebuilding the grid when the distance shrinks keeps the cost low.

# Sweep Line Algorithms
kind: algorithm
time: O(n log n) for the sort of events plus O(log n) per update in the active structure, so common sweeps such as interval overlap or rectangle union run in O(n log n); reporting k intersections costs O((n + k) log n).
space: O(n) for events and the active set.

## intro
Imagine a vertical line sliding from left to right across a drawing. At each moment it touches only a few shapes, and things happen only at special positions called events: a segment starts, a segment ends, two segments cross. Sweeping turns a two-dimensional problem into a sequence of one-dimensional updates, which is why a long list of geometry problems become sorting plus a balanced tree.

## theory
Pattern:

- Convert the input into events, each with a position along the sweep axis, a type and the object involved
- Sort events by position, resolving ties with a fixed rule (for example starts before ends when touching counts as overlapping)
- Process events in order while maintaining the active set: a data structure holding the objects intersected by the sweep line
- Query or update the structure at each event to collect the answer

Simplest case, interval overlap: given n intervals, find the maximum number of simultaneous intervals. Create +1 events at starts and −1 events at ends, sort, and track the running count. For the intervals [1,4], [2,6], [5,8], [7,9] the maximum overlap is 2. The meeting rooms problem uses exactly this: the maximum overlap is the number of rooms needed. Merging intervals and finding gaps use the same sort-and-sweep idea.

Skyline problem: buildings (left, right, height) give start and end events; keep a max-heap of active heights; whenever the maximum changes after processing an event, output a key point. Complexity O(n log n).

Union area of rectangles: sweep over x; the active structure is a segment tree over compressed y coordinates storing how much of the y axis is covered. Each event adds or removes a y-interval, and the covered length times the x-gap to the next event adds to the area. Total O(n log n). Two rectangles [0,2]×[0,2] and [1,3]×[1,3] have union area 4 + 4 − 1 = 7.

Closest pair by sweep: keep points within the current best distance of the sweep line in an ordered set by y (see the closest pair lesson).

Segment intersection (Bentley-Ottmann): sweep over x, keep the active segments ordered by their y at the sweep line in a balanced tree. Events are segment endpoints and intersection points. Only neighbouring segments in the order can intersect next, so check new neighbours on insertion, deletion and swap. Runs in O((n + k) log n) for k intersections, better than O(n²) when k is small. The shorter version, deciding whether any two segments intersect, is Shamos-Hoey in O(n log n).

Other uses:

- Counting points in rectangles offline: sort queries and points by x and use a Fenwick tree on y
- Counting inversions and pairs with dominance relations
- Voronoi diagrams by Fortune's algorithm with a beach line
- Polygon triangulation and trapezoidal decomposition
- Area of union of circles or polygons, perimeter of union
- Line sweep with angular order: rotate a ray around a point to count visible points or find the minimum enclosing angle

Event ordering details: at equal coordinates the order of insertions, removals and queries matters. Decide whether touching intervals overlap; process all insertions at the coordinate before queries if closed intervals are used, and removals before insertions for half-open intervals. Wrong tie order gives off-by-one answers.

Coordinate compression: when only the relative order matters, map the distinct coordinates to 0..m−1 so that arrays and segment trees can index them.

Applications: calendar and meeting room scheduling, computing areas of map overlays, collision detection in games, VLSI layout checks (design rule violations), skyline rendering and counting queries over 2D point sets.

Pitfalls: wrong tie-breaking between event types, forgetting to compress coordinates, using a data structure without the needed ordered operations, floating point comparisons in the active set ordering for segments, and assuming no vertical or coincident segments.

Testing: compare against a quadratic brute force on random small inputs, with many equal coordinates to stress tie handling.

## explain
1. Turn the objects into start and end events along one axis.
2. Sort the events with a deliberate tie-breaking rule.
3. Sweep through them, updating the active set at each event.
4. Query the active set for the quantity of interest.
5. Compress coordinates if a tree or array is indexed by them.
6. Check results against a brute force on small inputs.

## example
The Python program finds the maximum number of overlapping intervals and the rooms needed for a meeting schedule, merges overlapping intervals, computes the union area of rectangles (7 for the two squares) with a simple sweep, and confirms the union area by counting unit cells. The JavaScript program computes the skyline key points for a classic set of buildings.

## real
Calendar software finds double bookings, GIS tools compute union areas of land parcels, and chip design tools run sweeps to check layouts.

## pros
- Reduces 2D problems to ordered 1D updates
- Typically O(n log n)
- A single pattern covers many problems

## cons
- Tie-breaking mistakes are easy
- Needs an ordered or tree-based active structure
- Intersection sweeps are intricate

## uses
- Meeting rooms and interval overlap
- Skyline and rectangle union area
- Detecting segment intersections
- Offline 2D counting queries

## mistakes
- Using the wrong order for events at equal coordinates
- Skipping coordinate compression for tree indexing
- Assuming no vertical segments
- Comparing floating point keys in the active set directly

## interview
**Q:** What are the main steps of a sweep line algorithm?
**A:** Convert the shapes into events along an axis, sort them, move through the events while maintaining the set of objects the line currently touches, and answer queries from that set.

**Q:** How many meeting rooms are needed for a list of meetings?
**A:** Sweep the sorted start and end times with a counter and take the maximum number of simultaneous meetings, which runs in O(n log n).

**Q:** Why does Bentley-Ottmann only compare neighbours?
**A:** Segments that will intersect next must be adjacent in the vertical order at some moment, so checks happen only when segments become neighbours.

## summary
Sweep line algorithms sort events along an axis and maintain an active set, solving interval overlap, skylines, rectangle unions and segment intersections in about O(n log n). Care with ties and coordinate compression decides correctness.

## codenote
The Python sample covers intervals and rectangle area. The JavaScript sample builds a skyline.

## code
### python
```python
def max_overlap(intervals):
    events = sorted([(s, 1) for s, e in intervals] + [(e, -1) for s, e in intervals])
    best = count = 0
    for _, delta in events:
        count += delta
        best = max(best, count)
    return best

meetings = [(1, 4), (2, 6), (5, 8), (7, 9)]
print(max_overlap(meetings), max_overlap([(0, 5), (5, 10)]))

def merge(intervals):
    out = []
    for s, e in sorted(intervals):
        if out and s <= out[-1][1]:
            out[-1][1] = max(out[-1][1], e)
        else:
            out.append([s, e])
    return out

print(merge([(1, 3), (2, 6), (8, 10), (9, 12), (15, 18)]))

def union_area(rects):
    xs = sorted({x for x1, y1, x2, y2 in rects for x in (x1, x2)})
    total = 0
    for left, right in zip(xs, xs[1:]):
        covering = sorted((y1, y2) for x1, y1, x2, y2 in rects if x1 <= left and right <= x2)
        covered, end = 0, None
        for y1, y2 in covering:
            if end is None or y1 > end:
                covered += y2 - y1
                end = y2
            elif y2 > end:
                covered += y2 - end
                end = y2
        total += covered * (right - left)
    return total

print(union_area([(0, 0, 2, 2), (1, 1, 3, 3)]), union_area([(0, 0, 4, 4), (1, 1, 2, 2)]))
cells = {(x, y) for x1, y1, x2, y2 in [(0, 0, 2, 2), (1, 1, 3, 3)] for x in range(x1, x2) for y in range(y1, y2)}
print(len(cells))
```
Output:
```text
2 1
[[1, 6], [8, 12], [15, 18]]
7 16
7
```
### javascript
```javascript
function skyline(buildings) {
  const events = [];
  for (const [l, r, h] of buildings) {
    events.push([l, -h, r]);
    events.push([r, 0, 0]);
  }
  events.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const active = [{ h: 0, r: Infinity }];
  const result = [];
  for (const [x, negH, r] of events) {
    if (negH !== 0) active.push({ h: -negH, r });
    while (active.length > 1 && active.some((a) => a.r <= x)) {
      active.splice(active.findIndex((a) => a.r <= x), 1);
    }
    const height = Math.max(...active.map((a) => a.h));
    if (!result.length || result[result.length - 1][1] !== height) result.push([x, height]);
  }
  return result;
}

console.log(JSON.stringify(skyline([[2, 9, 10], [3, 7, 15], [5, 12, 12], [15, 20, 10], [19, 24, 8]])));
```
Output:
```text
[[2,10],[3,15],[7,12],[12,0],[15,10],[20,8],[24,0]]
```

## quiz
1. What does the sweep line maintain between events?
   - [ ] The sorted input only
   - [x] The set of objects currently crossed by the line
   - [ ] A copy of the final answer
   - [ ] A random sample
   > The active set changes only at events.
2. How are meeting rooms needed computed?
   - [ ] By counting meetings
   - [x] By the maximum number of overlapping intervals during the sweep
   - [ ] By the shortest meeting
   - [ ] By the total time
   > Overlap at the busiest moment equals the rooms required.
3. Why does tie order of events matter?
   - [ ] It does not matter
   - [x] It decides whether touching intervals count as overlapping
   - [ ] It changes the sort algorithm
   - [ ] It affects only speed
   > Starts and ends at the same coordinate must follow a deliberate rule.
4. What data structure supports the rectangle union sweep?
   - [ ] A stack
   - [x] A segment tree over compressed y coordinates
   - [ ] A queue
   - [ ] A hash set
   > It tracks how much of the y axis is covered.

# Advanced Math Interview Topics
kind: concept
time: Not an algorithmic topic — this lesson collects question types. The typical solutions run in O(log n) for gcd, power and bit tricks, O(sqrt n) for factoring, and O(n) for single-pass counting.
space: Not an algorithmic topic — most interview math problems need O(1) extra space if solved with formulas and bit operations.

## intro
Interviewers like arithmetic puzzles because they test reasoning more than memorised code: counting trailing zeros of a factorial, adding numbers without a plus sign, finding the missing number, checking whether a number is a power of two or reversing digits without overflow. Each has a short elegant solution, and recognising the underlying fact is the skill to practise.

## theory
Frequent problem families and their key ideas:

- Trailing zeros of n!: each zero comes from a factor pair 2 and 5, and 2s are abundant, so count the factors of 5: `n/5 + n/25 + n/125 + ...`. For 100! the count is 20 + 4 = 24
- Power of two: a positive integer is a power of two exactly when `n & (n − 1) == 0`; power of four adds a mask check of the even bit positions; power of three can be tested by `1162261467 % n == 0` for 32-bit n (3^19 is the largest power of three in 32-bit range)
- Count set bits: Brian Kernighan's loop `n &= n − 1` runs once per set bit
- Missing number in 0..n: the sum formula n(n+1)/2 minus the array sum, or the XOR of all indices and values
- Single number among pairs: XOR of all values cancels equal pairs; for triples count bits modulo 3
- Add without plus: `sum = a ^ b`, `carry = (a & b) << 1`, repeat until the carry is zero
- Reverse integer with overflow check: pop digits with `% 10` and `// 10`, compare against limits before multiplying
- Palindrome number: reverse half of the digits and compare
- Integer square root by binary search or Newton's method: `x = (x + n/x)/2` converges quadratically
- Pow(x, n): fast exponentiation with negative exponents handled by inverting
- Happy numbers and cycles: detect a cycle with Floyd's tortoise and hare or a set
- Fizz buzz variants and digit sums: modular arithmetic; digital root `1 + (n − 1) % 9` for n > 0
- Excel column numbers: base-26 with a shift by one (no zero digit)
- Roman numerals and base conversion: greedy subtraction tables and repeated division
- Gray code: `i ^ (i >> 1)` produces a sequence where neighbours differ by one bit
- Counting primes below n: sieve of Eratosthenes
- Ugly numbers and nth super ugly number: DP with pointers or heaps
- Perfect, abundant and amicable numbers: divisor sums up to the square root
- Pigeonhole and parity arguments: duplicate detection, impossibility proofs (a chessboard missing two opposite corners cannot be tiled by dominoes)
- Probability and expectation questions: coupon collector (expected n·H(n) draws), birthday paradox (23 people give more than 50 percent), reservoir sampling, shuffling fairly with Fisher-Yates
- Geometry puzzles: the number of regions a line cuts, the angle between clock hands: `|30h − 5.5m|` degrees, area of overlapping rectangles

Thinking process: restate the problem with small examples, look for an invariant or a formula, write a brute force, then derive the efficient method. State complexity and edge cases: zero, negative numbers, the minimum 32-bit integer (its absolute value overflows), very large inputs.

Overflow awareness: in languages with fixed-width integers, `abs(INT_MIN)` and `−INT_MIN` overflow, `a + b` can overflow, and the midpoint `(lo + hi) / 2` overflows (use `lo + (hi − lo) / 2`). Python has big integers but interviews often ask for the fixed-width behaviour.

Related lessons: modular arithmetic and fast exponentiation, gcd, sieves, combinatorics and bit manipulation.

Pitfalls: ignoring negative inputs, off-by-one in counting formulas, relying on floating point for exact integer results (use integer square root), forgetting that integer division rounds differently in different languages, and failing to test boundary values such as 0, 1 and the maximum input.

Testing: compare each trick with a straightforward loop on a range of inputs, and include negative numbers and boundaries.

## explain
1. Restate the puzzle and solve small cases by hand.
2. Search for an invariant, a bit trick or a closed formula.
3. Write a slow, obviously correct version.
4. Implement the fast version and compare on many inputs.
5. State time and space and name the edge cases.
6. Check overflow behaviour for the target language.

## example
The Python program implements trailing zeros of a factorial (24 for 100), the power of two test, Kernighan's bit count, the XOR trick for a missing number, addition with bit operations, the digital root and the clock angle, and checks each against a straightforward method over a range.

## real
These questions appear in technical screens because they show whether a candidate can find a clean invariant rather than loop blindly.

## pros
- Short solutions that reward insight
- Bit and formula tricks run in constant or logarithmic time
- The same patterns recur across problems

## cons
- Easy to forget edge cases
- Cleverness without a brute force check is risky
- Behaviour differs between languages and integer widths

## uses
- Technical screening problems
- Low-level optimisation with bit tricks
- Counting and checking number properties
- Validating formulas against brute force

## mistakes
- Forgetting the minimum integer edge case
- Trusting a trick without testing it
- Using floating point for exact square roots
- Overlooking negative inputs

## interview
**Q:** How do you count the trailing zeros of n factorial?
**A:** Count the factors of 5 in the numbers up to n, summing n divided by 5, 25, 125 and so on, because factors of 2 are always more plentiful.

**Q:** How do you check that a number is a power of two?
**A:** A positive n is a power of two exactly when n AND n minus 1 equals zero, since a power of two has a single set bit.

**Q:** How do you add two integers without using the plus operator?
**A:** XOR gives the sum without carries and AND shifted left gives the carries; repeat with those two values until the carry becomes zero.

## summary
Advanced math interview questions reward recognising an invariant: counting factors of five, single-bit tests, XOR cancellation, carry propagation and digital roots. Verify each trick with a brute force and respect integer limits.

## codenote
The Python sample implements and checks several classic tricks.

## code
### python
```python
def trailing_zeros(n):
    count, power = 0, 5
    while power <= n:
        count += n // power
        power *= 5
    return count

def factorial_zeros(n):
    f = 1
    for i in range(2, n + 1):
        f *= i
    return len(str(f)) - len(str(f).rstrip("0"))

print(trailing_zeros(100), factorial_zeros(100), all(trailing_zeros(n) == factorial_zeros(n) for n in range(1, 200)))

is_pow2 = lambda n: n > 0 and n & (n - 1) == 0
print([n for n in range(1, 40) if is_pow2(n)])

def popcount(n):
    count = 0
    while n:
        n &= n - 1
        count += 1
    return count

print(popcount(255), popcount(1024), all(popcount(n) == bin(n).count("1") for n in range(2000)))
values = [0, 1, 2, 4, 5, 6, 3, 8, 7]
missing = 0
for i, v in enumerate(values):
    missing ^= i ^ v
missing ^= len(values)
print(missing, 9 * 10 // 2 - sum(values))

def add(a, b):
    mask = 0xFFFFFFFF
    while b:
        a, b = (a ^ b) & mask, ((a & b) << 1) & mask
    return a if a < 0x80000000 else ~(a ^ mask)

print(add(17, 25), add(-7, 3), all(add(a, b) == a + b for a in range(-20, 20) for b in range(-20, 20)))
digital_root = lambda n: 0 if n == 0 else 1 + (n - 1) % 9
print(digital_root(38), digital_root(99), abs(30 * 3 - 5.5 * 15))
```
Output:
```text
24 24 True
[1, 2, 4, 8, 16, 32]
8 1 True
9 9
42 -4 True
2 9 7.5
```

## quiz
1. How many trailing zeros does 100 factorial have?
   - [ ] 20
   - [x] 24
   - [ ] 25
   - [ ] 10
   > 20 factors from multiples of 5 plus 4 from multiples of 25.
2. What test shows a positive integer is a power of two?
   - [ ] n modulo 2 equals 0
   - [x] n AND n minus 1 equals 0
   - [ ] n is prime
   - [ ] n divided by 3 is whole
   > A power of two has exactly one set bit.
3. How does XOR find a single unpaired value?
   - [ ] It sorts the array
   - [x] Equal pairs cancel to zero
   - [ ] It adds the values
   - [ ] It multiplies them
   > The XOR of a value with itself is zero.
4. What is the carry in addition without plus?
   - [ ] a XOR b
   - [x] a AND b shifted left by one
   - [ ] a OR b
   - [ ] a minus b
   > The XOR gives the sum bits without carries.
