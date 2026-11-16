# Earlier versions: design

Status: the 13 proposed versions and the 0/1 knapsack are implemented (`src/lessons/first.ts`, and `src/lessons/rich.ts` for KMP and the knapsack). The second tier is not.

## Rule

A lesson gets an earlier version (`first` in `src/lessons/rich.ts`) only when its program is **the same method before one optimisation**: you can get from version 1 to version 2 by a small, nameable edit, as the knapsack goes from a 2-D table to one row.

A brute force that shares no code with the method does not qualify. Its idea is already told by the first card of the Ideas story, and reading a second, unrelated program does not help with the first.

## The original seven

| Lesson | Earlier version | Verdict |
|---|---|---|
| 0/1 knapsack | 2-D table | Keep. Same DP; version 2 drops a dimension and reverses a loop. |
| KMP | Try every position | Kept and rewritten as one `i`/`j` loop (see below). The matching loop is the same; only the reaction to a mismatch changes. |
| Binary search | Linear scan | Removed. Nothing of the scan survives in the method. |
| Prefix sums | Add up every query | Removed. Different program; the method is a precomputation. |
| Fast exponentiation | Multiply b times | Removed. Replaced by a real earlier form below. |
| Monotonic queue | Rescan every window | Removed. No shared structure. |
| Sieve of Eratosthenes | Trial division | Removed. Testing numbers versus generating composites. |

## Proposed

Each row is one edit away from the lesson's listing and prints the same output for every input.

| Lesson | Version 1 | The edit that gives version 2 | Cost 1 → 2 | Race in the lab |
|---|---|---|---|---|
| KMP | One loop with `i`, `j`; on a mismatch `i = i − j + 1; j = 0` | Replace that line by `j = nxt[j − 1]`; `i` never moves back | O(n · m) → O(n + m) | yes |
| Euclidean algorithm | Subtract the smaller from the larger | Replace repeated subtraction by `%` | O(max / min) → O(log) | yes, few digits only |
| Fast exponentiation | Recursive halving: `pow(a, b) = pow(a, b / 2)²` (× a if b is odd) | Walk the bits of b in a loop instead of recursing | space O(log b) → O(1) | no |
| Disjoint set union | `find` walks to the root and changes nothing | Add `fa[x] = find(fa[x])` | O(n) → O(α(n)) per operation | yes |
| Segment tree | No tags: a range update descends to every leaf in the range | At a fully covered node update the sum, leave a tag, stop | O(n) → O(log n) per update | yes |
| Dijkstra | Array scan for the closest unsettled vertex | Replace the scan by a min-heap | O(n²) → O(m log m) | yes |
| Prim | Array scan for the lightest crossing edge | Replace the scan by a min-heap | O(n²) → O(m log m) | yes |
| Bellman-Ford & SPFA | Bellman-Ford: relax all edges, round after round, until a round changes nothing | Keep a queue of the vertices whose distance just decreased | fewer relaxations, same worst case | yes |
| Floyd-Warshall | 3-D table `d[k][i][j]` | Drop the `k` dimension and update in place | space O(n³) → O(n²) | no |
| A* | `h` returns 0 (this is Dijkstra) | Return the Manhattan distance | fewer cells expanded, same worst case | yes |
| LCA by binary lifting | Level the depths, then climb one parent at a time | Jump by powers of two with the `up` table | O(n) → O(log n) per query | yes |
| Manacher | Padded string, every `p[i]` starts at 0 | Start from `min(p[2c − i], r − i)` | O(n²) → O(n) | yes |

As built: every row except fast exponentiation and Floyd is raced in the data lab. Union-find and LCA are raced on the ordinary random data; the gap is real there (about 40× and 5× at the largest size), so no adversarial generator was added.
| Z-function | Every `z[i]` starts at 0 | Start from `min(z[i − l], r − i)` | O(n²) → O(n) | yes |

### Second tier

Valid under the rule, lower value. Implement only if the first group reads well.

| Lesson | Version 1 | Why second tier |
|---|---|---|
| Huffman tree | Scan the array for the two smallest weights | Same lesson as Dijkstra's "scan → heap"; one such pair is enough. |
| N queens | Test a square by scanning the queens already placed | The edit (three boolean arrays) is small and already a story card. |
| Dinic | One augmenting path per DFS, no levels | Version 1 is a second full flow program. |
| Quicksort | Pivot = first element | Only differs on sorted input, which the generator does not produce. |

### No earlier version

All remaining lessons. Typical reasons:

- The lesson is already the simplest form: base conversion, the three O(n²) sorts, counting sort, stack, traversals, BFS, DFS, flood fill, LIS, LCS, interval DP, Pascal's triangle, high-precision arithmetic, Hanoi.
- The only earlier form is an unrelated brute force: binary search, prefix sums, difference array, monotonic queue, sparse table, Fenwick tree, trie, sieve, merge sort, radix sort, tree diameter, topological sort, bipartite check, Tarjan, cut vertices, Hungarian, suffix array, convex hull, Nim, Prüfer, bitmask DP, tree DP, Kruskal, Gauss, extended Euclid.
- The earlier form is another lesson, which should be linked instead: BST → Treap, sieve → linear sieve, heap sort → leftist heap, LCA → heavy-light decomposition, KMP → Aho–Corasick.

## Constraints for the implementation

- **Same output.** `tests/lessons.test.ts` compares the two versions token by token on every animation size and on lab sizes up to `maxN`. All versions above are deterministic and print the same values.
- **Zero operands.** The subtraction form of Euclid must stop when either number is 0 and print `a + b`.
- **`maxN`.** Set it only where the two versions do different amounts of work. Choose the largest lab size at which version 1 stays under about 10⁷ counted steps, so the test and the lab stay well inside their time limits. Leave it out for fast exponentiation and Floyd (same work, different memory).
- **Animation length.** Version 1 must stay under the player's 3000-step limit on all three animation sizes; check Euclid, Bellman-Ford, the tagless segment tree and the scans.
- **Floyd memory.** The 3-D table is (n + 1) · n² cells; reject inputs above a cell limit, as the 2-D knapsack does.

## Changes outside the lesson data

- **Variant switch.** Done: `Variant.gain` is shown in place of the complexity when both versions read the same (A*, Bellman-Ford/SPFA).
- **Stories.** Done where the first card described something other than version 1: Euclid, fast exponentiation, KMP.
- **Links between lessons.** Still open: the third group under "No earlier version" needs the planned lesson-to-lesson links, not a variant.

## Order of work

1. KMP rewrite, Manacher, Z-function, Euclid: one-line edits, no UI change.
2. Union-find, segment tree, LCA, Dijkstra, Prim.
3. Fast exponentiation, Floyd (space only).
4. A*, Bellman-Ford/SPFA, after the `gain` label exists.
