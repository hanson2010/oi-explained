# Roadmap

Revised 2026-11-16 after a review against the code. The audience is self-learners. Outside contributions are not accepted for now. The site is built and hosted by Cloudflare (Workers Builds, `wrangler.jsonc`).

## Where the project stands

- 83 lessons: 35 CSP-J, 37 CSP-S, 11 NOI. 16 have an earlier version.
- Milestones 0.2, 0.3 and 0.4 are done.
- A lesson costs about 150 lines on average, counting its program, story, text and oracle.

Syllabus points with a lesson, out of the points that should have one:

| Level | With lessons | Wanted | Out of scope |
|---|---|---|---|
| CSP-J | 54 | 54 | 62 |
| CSP-S | 56 | 78 | 16 |
| NOI | 14 | 59 | 8 |

Out of scope are computer basics, the C++ language itself, school mathematics, and concepts with no program to animate. The Syllabus page shows them greyed with the reason.

## Principles

1. A point gets a lesson only if there is a program to animate. A theorem or a definition is taught as a story card inside the lesson that uses it, and the syllabus point links there.
2. Every new lesson passes the existing tests: oracle, C++ listing, story, flowchart, both languages.
3. A learning feature ships on about ten lessons first. It is rolled out to the rest only after it has proved useful.
4. No server. Progress stays in the browser.

## Not planned

- Accounts, sync or any server-side code.
- Running the learner's own code, or an online judge.
- Classroom features (assignments, teacher views).
- Lessons for the environment and C++ syntax sections of the syllabus.
- Languages other than C++ for listings, or a third interface language.

---

## Milestone 0.2: groundwork (done)

- **Continuous integration.** `.github/workflows/ci.yml` builds, then runs the tests with the C++ checks on, for every push and pull request. Cloudflare still builds and deploys.
- **Syllabus states.** Every point in `src/data/syllabus.ts` is in one state: lessons, `planned`, or out of scope with a reason. A test enforces it. Seven definition points were linked to lessons whose story already teaches them.
- **Authoring checklist.** `specs/lesson-authoring.md`.
- **Bundle split.** Each category is a folder under `src/lessons/` and a separate download. The first page loads 141 KB of JavaScript gzipped (it was 395 KB); the largest category, graphs, is 72 KB. Lists and search use a generated index, `src/lessons/meta.ts` (`npm run gen`).

---

## Milestone 0.3: lesson links and the CSP-J gaps (done)

- **Links between lessons.** `needs` on a lesson lists its direct prerequisites. The lesson page shows "Learn first" and "Leads to". The learning path is still ordered by level, difficulty and topic, except that a lesson never comes before one it needs; this moved one existing lesson. Tests check that the ids exist, that prerequisites come earlier, and that none is at a higher level.
- **Background cards.** A new card kind, `term`, holds definitions and theorems. Three were added: tree terms (`bt-traversal`), graph terms (`graph-dfs`), equivalence classes (`dsu`).
- **Seven CSP-J lessons**: enumeration (with a three-loop earlier version), simulation, linked list, high-precision subtraction, high-precision ÷ small number, prime factorisation, permutations by backtracking. CSP-J now has a lesson for all 54 points in scope.

Changed from the plan: the linked list has no singly linked earlier version (the story explains the difference instead), and the permutations lesson generates permutations only; combinations are a card that points to Pascal's triangle.

---

## Milestone 0.4: predict the next step, and CSP-S search and graphs (done)

- **Profile version 2.** The saved profile also holds quiz answers, solved practice problems and review dates. Old profiles are read as they are. Export, import and reset cover the new fields, and `sanitize` has tests.
- **Predict the next step.** A lesson's `run` calls `t.ask(...)` just before the step that reveals the answer; it costs nothing when steps are not recorded. With "Ask me first" switched on, the player stops before such a step and shows two to four options. Ten lessons ask questions: binary search, prefix sums, 0/1 knapsack, merge sort, monotonic queue, union-find, BFS on a maze, Dijkstra, Kruskal and KMP. A question is skipped when the answer would be a tie.
- **Seven CSP-S lessons**: memoised search (with the plain recursion as an earlier version), coordinate compression, Euler path, second-shortest path, bidirectional BFS, iterative deepening, sweep line.

Changed from the plan: prefix sums and merge sort ask questions in place of quicksort and topological sort, whose decisions were not crisp enough. The sweep line keeps its cover counts in a plain array, O(n²); the story says where a segment tree makes it O(n log n). Bidirectional BFS has no earlier version; it names the one-ended BFS lesson as a prerequisite.

---

## Milestone 0.5: a broken version to fix, and CSP-S hashing and mathematics

### A broken version to fix

The first draft said the animation would run "until the output differs". A lesson prints its output once, at the end, so there is no such moment. Revised design:

- `broken?: { code: string; bugTag: string; why: L; run(inp, t): void }`: the lesson's listing with one pitfall put back in.
- The page finds a small input on which the broken version prints the wrong answer, and shows input, expected output and actual output.
- The learner animates the broken version on that input and clicks the line they think is wrong. `bugTag` and `why` are the answer.

Rules, enforced by tests:

- The listing differs from the correct one in a single region.
- It prints a wrong answer for at least one of the first 50 seeds at the smallest size.
- It always terminates, within a step cap. A bug that loops forever is not allowed.
- Its behaviour is defined in C++: no out-of-range reads and no overflow. The C++ test can then compile it and compare it with the broken animation.

Start with: knapsack inner loop running upward, prefix sum subtracting `s[l]` instead of `s[l − 1]`, union-find without `fa[x] =`, binary search returning the wrong boundary, BFS marking a cell visited when it is popped.

Pitfalls about input the method cannot handle (Dijkstra with negative edges) are a different feature. Leave them as text.

### CSP-S lessons: hashing and mathematics (7)

| Lesson | Syllabus point | Cards it carries |
|---|---|---|
| Hash table | 2.2.3 [5–6] | Hash functions for numbers, collision handling |
| String hashing | 2.2.3 [6] | Raced against direct comparison in the lab |
| Modular inverse | 2.2.5 [5–7] | Congruences, Fermat's little theorem, Euler's theorem and totient, Wilson's theorem |
| Chinese remainder theorem | 2.2.5 [7] | Needs `exgcd` |
| Binomial coefficients mod p | 2.2.5 [6] | Binomial theorem, multiset permutations and combinations, Catalan numbers |
| Inclusion–exclusion | 2.2.5 [7] | Derangements, pigeonhole principle. Needs `bitmask-dp` |
| Fast matrix power | 2.2.5 [5–6] | Vectors, matrix operations, special matrices. Earlier version: the linear loop |

Done when: CSP-S has no planned points left, apart from the three deferred below.

---

## Milestone 0.6: practice and review

### Practice problems

`practice?: { judge: 'luogu' | 'cf' | 'atcoder' | 'loj'; id: string; title: L; diff?: number }[]`, shown as links, easiest first, three to five per lesson. Problem statements are never copied. The learner ticks a problem as solved; it is stored in `solved`.

A test checks the format of each id. Links can still go stale, so check them by script from time to time, not in CI.

### Review

The Profile page lists lessons due for review 1, 7 and 30 days after they were marked learned. Reviewing means doing the lesson's quiz on fresh data. Lessons without a quiz are reviewed by replaying the animation. Timestamps go in `review`.

Do this only after the quiz has reached most lessons, or the review list will be mostly replays.

---

## Milestone 0.7 onward: NOI

In priority order. Each needs lessons that exist by then.

| Lesson | Syllabus point | Needs |
|---|---|---|
| Persistent segment tree | 2.3.2 [8] | `segment-tree` |
| 2-SAT | 2.3.3 [8] | `tarjan-scc` |
| Linear (XOR) basis | 2.3.4 [9] | – |
| Baby-step giant-step | 2.3.4 [8] | Hash table, modular inverse |
| Expectation DP | 2.3.4 [8–9] | Carries the probability points as cards |
| Determinant | 2.3.4 [9] | `gauss`, modular inverse |
| Möbius inversion | 2.3.4 [9] | `linear-sieve`. Carries Dirichlet convolution |
| Offline divide and conquer (CDQ) | 2.3.3 [8–9] | `merge-sort`, `fenwick` |
| Number-theoretic transform | 2.3.4 [10] | Covers the FFT point with exact output the oracle can check |
| Suffix automaton | 2.3.3 [10] | May need a new view for states and transitions |
| Kuhn–Munkres | 2.3.3 [10] | `hungarian` |

## Deferred

Valid syllabus points, each a large lesson for a small audience or a weak fit for animation. They stay "planned" on the Syllabus page with no date.

- CSP-S: Cartesian tree, double-ended stack, left-child right-sibling representation.
- NOI data structures: link-cut tree, k-d tree, tree of trees, binomial heap, virtual tree, unrolled linked list.
- NOI algorithms: minimum arborescence, general matching, suffix tree, unicyclic graphs, the simplex method, half-plane intersection.
- NOI mathematics: primitive roots, quadratic residues, groups, Burnside and Pólya, generating functions, Stirling numbers, polynomial calculus, inverse matrices, vector spaces, area of general figures.
- NOI, other: other persistent structures, finite automata, dominating, independent and covering sets.
- The four second-tier earlier versions in `earlier-versions.md`.

## Polish, between milestones

- Offline use through a service worker, caching the per-category files.
- Phone layout. There is one 900 px breakpoint today; check the code-beside-flowchart view and the lab chart at 375 px.
- A Playwright smoke test that opens every lesson, plays the animation to the end and runs the lab. It catches rendering errors the logic tests cannot see.
- Colour contrast of the seven tones in both themes.
- A licence. Low priority while contributions are closed.

Already in place, so removed from the plan: links to a tab and an animation step, screen-reader announcement of each step, reduced motion.

## Risks

- **Two languages.** Every lesson, card, quiz question and bug explanation is written twice. This is the largest cost of each milestone; count it when sizing one.
- **Animation length.** The tests cap an animation at 1500 steps. NOI lessons such as the suffix automaton or CDQ may need very small data or coarser steps to fit.
- **Quiz quality.** A question that is obvious or ambiguous is worse than none. Hence ten lessons first.
- **Practice links** depend on outside sites.

## Summary of the order

| Milestone | Engineering | Lessons | Total lessons |
|---|---|---|---|
| 0.2 (done) | CI, syllabus states, authoring checklist, bundle split | – | 69 |
| 0.3 (done) | Lesson links, three definition cards | 7 CSP-J | 76 |
| 0.4 (done) | Profile v2, predict the next step | 7 CSP-S | 83 |
| 0.5 | Broken versions | 7 CSP-S | 90 |
| 0.6 | Practice links, review | – | 90 |
| 0.7+ | – | 11 NOI | 101 |
