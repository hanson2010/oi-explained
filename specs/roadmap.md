# Roadmap

Revised 2026-11-16 after a review against the code. The audience is self-learners. Outside contributions are not accepted for now. The site is built and hosted by Cloudflare (Workers Builds, `wrangler.jsonc`).

## Where the project stands

- 69 lessons: 28 CSP-J, 30 CSP-S, 11 NOI. 14 have an earlier version.
- `npm test` passes. With `GXX` set, all 69 C++ listings compile and agree with the animations (g++ 13, 73 seconds for the whole suite).
- The site is one JavaScript file: 1.05 MB, 395 KB gzipped.
- A lesson costs about 150 lines on average, counting its program, story, text and oracle.

Syllabus points that link to a lesson, by section:

| Section | CSP-J | CSP-S | NOI |
|---|---|---|---|
| Environment and basics | 0 / 12 | 0 / 5 | – |
| C++ programming | 1 / 43 | 0 / 9 | 0 / 1 |
| Data structures | 9 / 15 | 14 / 22 | 2 / 10 |
| Algorithms | 22 / 29 | 24 / 33 | 7 / 21 |
| Mathematics and others | 5 / 17 | 5 / 25 | 5 / 35 |

What this shows:

- Data structures and algorithms at CSP-J and CSP-S are 70% covered (69 of 99 points). Several of the missing points are definitions that an existing lesson already teaches.
- The real gaps are mathematics at every level (15 of 77) and everything at NOI level.
- The environment and C++ sections are not what this site teaches. They should not count against coverage.

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

## Milestone 0.2: groundwork

In this order. The first two are small and everything later relies on them.

### A. Continuous integration

A GitHub Actions workflow on every push and pull request:

- `npm ci`, then `npm run build` (which type-checks)
- `ulimit -s unlimited && GXX=g++ npm test`

CI only checks. Cloudflare keeps building and deploying.

Done when: a pull request with a failing test shows a red check.

### B. Sort every uncovered syllabus point

Give `Item` in `src/data/syllabus.ts` a disposition beside its lesson list. Every point is in exactly one state:

| State | Meaning | Syllabus page |
|---|---|---|
| lesson | Links to one or more lessons (as today) | Link |
| planned | A lesson in this roadmap will cover it | "Planned" label |
| out | Not taught here, with a reason: `env`, `lang`, `school` (school mathematics), `theory` | Greyed |

Coverage is then lessons ÷ (lessons + planned). Out-of-scope points leave the ratio.

Part of this step is linking definition points to lessons that already teach them. Candidates are below. Link one only if the lesson's story really explains the point; otherwise add a story card first.

| Point | Candidate lesson |
|---|---|
| Trees: definition and terminology; representing trees | `bt-traversal` |
| Binary trees and complete binary trees: definition and properties | `bt-traversal`, `heap-sort` |
| Graphs: definition and terminology; sparse graphs | `graph-dfs` |
| Basic concepts of sorting (stability, in place) | `bubble-sort`, `merge-sort` |
| Divisibility, primes, composites | `sieve` |
| Modular arithmetic and remainders | `fast-pow` |
| Time and space complexity analysis | The data lab teaches this in every lesson. Link to one lesson whose story derives its cost step by step, or mark as taught throughout. |

Done when: a test asserts every point has exactly one state, and the Syllabus page shows the new ratio.

### C. Authoring checklist

`specs/lesson-authoring.md`, one page, for the maintainer and for Claude sessions:

- the `Lesson` fields, and the split across `<cat>.ts`, `text.ts`, `real.ts`, `rich.ts` and `stories/`
- `//@tag` lines and how steps, notes and flowchart nodes refer to them
- the oracle in `tests/oracles.ts` is written independently of the lesson
- story card kinds, and the earlier-version rule (link `earlier-versions.md`)
- both languages are written, not translated word for word
- before merging: `GXX=g++ npm test` passes, all three animation sizes look right, the lab chart shows the expected curve, the syllabus point is linked

### D. Split the bundle

Less urgent than the first draft said: the download is 395 KB gzipped, not 1 MB. It grows with every lesson, though, so do it before the lesson count passes about 90.

- Move what Home, Syllabus, Profile and search need (id, title, level, cat, diff, blurb) into a small index module.
- Load each category's lessons, text and stories with `import()` when a lesson in it is opened.

Done when: the first page loads under 150 KB gzipped, and no category chunk exceeds 120 KB gzipped.

---

## Milestone 0.3: lesson links and the CSP-J gaps

### Links between lessons

`needs?: string[]` on `Lesson`. The lesson page shows "Learn first" and "Leads to". The Home page shows the learning path.

Tests: every id exists; there are no cycles; a prerequisite never comes after its dependant in the Home page order. That last test checks the existing ordering (level, then difficulty, then topic) against real dependencies and will probably find a few lessons to move.

Set `needs` for all 69 existing lessons in this milestone. Every lesson added later sets it from the start.

### CSP-J lessons (7)

| Lesson | Syllabus point | Notes |
|---|---|---|
| Enumeration | 2.1.4 [1] | Nested loops, then narrowing the range. Leads to N queens. |
| Simulation | 2.1.4 [1] | A circle-of-people problem. `arr` and `vars`. |
| Linked list | 2.1.3 [3] | Array-based. Earlier version: singly linked; the lesson: doubly linked. |
| High-precision subtraction | 2.1.4 [4] | Same layout as the existing addition. |
| High-precision ÷ small number | 2.1.4 [4] | Digit by digit from the top. |
| Prime factorisation | 2.1.5 [3] | Trial division to √n. Carries the fundamental theorem of arithmetic as a card. Leads to the sieve. |
| Permutations and combinations | 2.1.5 [2–4] | Next permutation, generating combinations. Carries the rules of sum and product as cards. |

Done when: CSP-J data structures and algorithms have no planned points left.

---

## Milestone 0.4: predict the next step, and CSP-S search and graphs

### Profile version 2 (needed first)

The profile stores only `done` and `fav`. `sanitize` drops every other field, and export writes only those two. The features below all store something, so extend the profile once:

- `quiz: Record<lessonId, { right: number; total: number; at: number }>`
- `solved: Record<problemKey, number>` (for practice links, milestone 0.6)
- `review: Record<lessonId, number[]>` (review timestamps, milestone 0.6)

Read the old `oi-explained:v1` data as it is; the new fields default to empty. Export, import and reset cover the new fields. Add a unit test for `sanitize`, which has none today.

### Predict the next step

The first draft had static options and an answer computed from the next step's views. That does not work: for "which vertex is settled next?" the options depend on the data, and reading the answer back out of drawing data is fragile.

Revised design: the lesson's `run` asks the question itself, where the algorithm's state is at hand.

```ts
t.ask(() => ({ q: L, options: L[], answer: number }))   // just before the step that reveals it
```

- `Tracer.ask` attaches the question to the next recorded step (`Step.ask`). With `on = false` it does nothing, so the lab is unaffected.
- The player gets a "Quiz" switch. When on, it stops before a step that has a question, shows the options, then plays the step as the explanation.
- Results go to `quiz` in the profile.
- Tests: two to four options, answer in range, both languages present, and the output and step tags are identical with questions on or off.

First ten lessons, chosen for a crisp decision: binary search (left or right half), Dijkstra (next vertex), KMP (where `j` falls back), union-find (new root), quicksort (pivot's final place), BFS on a maze (next cell), 0/1 knapsack (take or skip), topological sort (next vertex), monotonic queue (what is popped), Kruskal (accept or reject the edge).

### CSP-S lessons: search and graphs (7)

| Lesson | Syllabus point | Notes |
|---|---|---|
| Memoised search | 2.2.4 [6] | Earlier version: the same recursion without the memo. |
| Coordinate compression | 2.2.4 [6] | Sort, unique, `lower_bound`. Needed by sweep line. |
| Euler path and circuit | 2.2.3 [6], 2.2.4 [6] | Hierholzer. |
| Second-shortest path | 2.2.4 [7] | Dijkstra with two distances per vertex. |
| Bidirectional BFS | 2.2.4 [7] | Two frontiers on a `grid`. Earlier version: one-ended BFS. |
| Iterative deepening | 2.2.4 [7] | Its own lesson; the depth limit is the thing to animate. |
| Sweep line | 2.2.4 [7] | Area of a union of rectangles. Needs coordinate compression and the segment tree. |

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
- NOI mathematics: primitive roots, quadratic residues, groups, Burnside and Pólya, generating functions, Stirling numbers, polynomial calculus.
- The four second-tier earlier versions in `earlier-versions.md`.

## Polish, between milestones

- Offline use through a service worker. Simpler after the bundle split, since the chunks are what it caches.
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
| 0.2 | CI, syllabus states, authoring checklist, bundle split | – | 69 |
| 0.3 | Lesson links | 7 CSP-J | 76 |
| 0.4 | Profile v2, predict the next step | 7 CSP-S | 83 |
| 0.5 | Broken versions | 7 CSP-S | 90 |
| 0.6 | Practice links, review | – | 90 |
| 0.7+ | – | 11 NOI | 101 |
