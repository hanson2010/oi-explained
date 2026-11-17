# Roadmap

Revised 2026-11-16 after a review against the code. The audience is self-learners. Outside contributions are not accepted for now. The site is built and hosted by Cloudflare (Workers Builds, `wrangler.jsonc`).

## Where the project stands

- 90 lessons: 35 CSP-J, 44 CSP-S, 11 NOI. 16 have an earlier version, 10 ask questions, 5 have a broken version to fix.
- Milestones 0.2 to 0.6 are done. Next is 0.7, the NOI lessons, then 0.8, practice problems.
- A lesson costs about 150 lines on average, counting its program, story, text and oracle.

Syllabus points with a lesson, out of the points that should have one:

| Level | With lessons | Wanted | Out of scope |
|---|---|---|---|
| CSP-J | 54 | 54 | 62 |
| CSP-S | 75 | 78 | 16 |
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

## Milestone 0.5: a broken version to fix, and CSP-S hashing and mathematics (done)

- **Find the bug.** A lesson can carry `broken`: one change within one line of its listing, and a `run` that accepts `bug = true`. The lesson page then has a sixth tab. It finds a small input on which the broken program prints the wrong answer, shows the correct output beside the program's own, and lets the learner step through and click the line they think is wrong. Tests check that exactly one line differs, that some small input gives a wrong answer, that it always stops, and that the compiled broken listing behaves exactly like the broken animation.
- **Five broken versions**: binary search (`r = mid - 1`), prefix sums (`s[l]` for `s[l - 1]`), 0/1 knapsack (inner loop upward), longest increasing subsequence (`<=` for `<`), union-find (`fa[x] = find(y)`).
- **Seven CSP-S lessons**: hash table, string hashing, modular inverse, Chinese remainder theorem, binomial coefficients mod p, inclusion–exclusion, fast matrix power. Between them they carry background cards for 16 more syllabus points, from congruences to special matrices.

Changed from the plan: longest increasing subsequence replaced BFS among the broken versions, because marking a cell late makes BFS slow, not wrong. The union-find mistake links x itself instead of dropping path compression, for the same reason. The pigeonhole principle is taught in the hash table lesson, where it explains why collisions are unavoidable. String hashing and matrix power have no earlier version: nothing fits the rule.

CSP-S now has a lesson for 75 of its 78 points in scope; the other three are deferred below.

---

## Milestone 0.6: review (done)

A learned lesson is due for review 1, 7 and 30 days after it was learned or last reviewed, then settled. The home page and the Profile page show what is due. A review opens the animation on new data at the middle size, with the questions on where the lesson has them; reaching the last step records it. Unmarking a lesson as learned forgets its reviews.

Practice problems were planned for this milestone and moved to 0.8.

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

## Milestone 0.8: practice problems

Links from each lesson to problems on online judges that use it, on three sites, in this order: **AcWing**, **Luogu**, **Codeforces**.

- `practice?: { judge: 'acwing' | 'luogu' | 'cf'; id: string; title: string }[]` on a lesson, kept in a `practice.ts` per category. `title` is the problem's own title in the judge's language. Statements are never copied.
- A Practice tab on the lesson page lists the links, each with a box to tick when solved. Ticks go to `solved` in the profile, which already has the field, and the Profile page counts them.
- One to five problems per lesson: only problems that clearly fit, easiest first within a judge.
- `npm run check:practice`: a script that fetches every link and compares the page with the title listed. The judges are outside sites, so it is run by hand from a machine that can reach them, not in CI. Every link must pass it before the milestone is done.
- Tests check the id format per judge, that a lesson has no repeats, and that a problem has the same title wherever it is listed.

A first version was built during 0.6 with Luogu, LibreOJ and AtCoder, and withdrawn before merging: its links were written from memory in an environment that could not reach the judges, and none was verified. The Luogu part of that list is kept as a starting point in `specs/practice-draft.txt`; treat every line as unverified. AcWing and Codeforces problems are still to be chosen.

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
| 0.5 (done) | Broken versions | 7 CSP-S | 90 |
| 0.6 (done) | Review | – | 90 |
| 0.7 | – | 11 NOI | 101 |
| 0.8 | Practice links (AcWing, Luogu, Codeforces), link checker | – | 101 |
