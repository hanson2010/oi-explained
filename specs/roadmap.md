# Roadmap

Status on 2026-11-16: 69 lessons, 14 with an earlier version. `npm test` passes (432 tests; the 124 C++ checks run when `GXX` is set). `npm run build` passes, with one 1.05 MB JavaScript chunk.

Syllabus coverage, counting the points that link to at least one lesson:

| Level | Covered | Total |
|---|---|---|
| CSP-J (2.1) | 37 | 116 |
| CSP-S (2.2) | 43 | 94 |
| NOI (2.3) | 14 | 67 |

Those totals include many points that are not algorithms (operating systems, NOI history, C++ syntax, information theory). The raw ratio says little until those points are marked out of scope (see 0.3).

The work is in four phases. Phase 0 is short and makes everything after it cheaper. Phases 1 and 2 can then run side by side.

---

## Phase 0: groundwork

Do this before adding lessons. Every new lesson makes these harder to retrofit.

### 0.1 Continuous integration

There is no CI. Add a GitHub Actions workflow that runs, on every push and pull request:

- `npm ci`, `npm run build` (this includes `tsc --noEmit`)
- `ulimit -s unlimited && GXX=g++ npm test`, so the C++ listings are compiled and compared with the animations on every change and not only on machines where someone remembered to set `GXX`

The suite takes about a minute without `GXX`, so no sharding is needed yet.

The site is built and hosted by Cloudflare Pages, so CI only checks; it does not deploy. Cloudflare's build should keep running `npm run build`, which type-checks before bundling. Cloudflare Pages also builds a preview for each branch, which is a good place to review a new lesson before merging.

### 0.2 Split the bundle

Every lesson's code, story and generator is in the one 1.05 MB chunk, which loads before the home page can render. Load each category file (`src/lessons/{basic,sort,…}.ts` plus its `stories/` file) with `import()` when a lesson in it is opened. Home, Syllabus and search need only a small index (id, title, level, cat, diff, blurb), so split that out of `Lesson` into its own module.

Target: the first page loads under 250 KB of JavaScript, and the per-category chunks stay under 200 KB each, so that lesson count can double without slowing the site.

### 0.3 Mark syllabus points out of scope

Add a fourth state to `Item` in `src/data/syllabus.ts`: has a lesson, planned, or out of scope (with a one-word reason: `env`, `lang`, `theory`). Show the out-of-scope points greyed on the Syllabus page and leave them out of the coverage ratio. Add a test that every point is in exactly one state, so a new point in a future syllabus edition cannot be forgotten.

This turns the coverage number into a real progress measure for Phase 1.

### 0.4 Lesson authoring guide

Adding lessons is the main way the project grows, and the conventions live only in the code today. Write `specs/lesson-authoring.md`:

- the `Lesson` fields and which are required (the tests already enforce most of them)
- `//@tag` lines, how steps, notes and flowchart nodes refer to them
- writing the oracle in `tests/oracles.ts` independently of the lesson
- the Ideas story card kinds (`naive`, `insight`, `how`, `result`) and the rule for earlier versions (already in `earlier-versions.md`; link it)
- the bilingual text rule: both languages written, not machine-translated word for word
- a checklist: build passes, `GXX=g++ npm test` passes, all three animation sizes look right, the lab chart shows the expected curve

### 0.5 Licence

The repository has no LICENSE file, so by default nobody may reuse or contribute to it. Choose one for the code and, separately, for the lesson text (for example MIT for code and CC BY-SA 4.0 for text). The CCF syllabus transcription keeps its existing notice.

---

## Phase 1: fill the syllabus

Lessons are listed in the order they should be written: the most-tested points at each level first, and points that reuse an existing view (`arr`, `graph`, `grid`, `vars`) before those that need a new one.

### CSP-J (8 lessons)

| Lesson | Syllabus point | Notes |
|---|---|---|
| Enumeration | 2.1.4 [1] | Counting solutions with nested loops, then pruning the range. Good first lesson; links to N queens. |
| Simulation | 2.1.4 [1] | A queue-of-people or clock problem. Uses `arr` and `vars`. |
| Linked list | 2.1.3 [3] | Array-based `nxt`/`pre`, insertion and deletion. Earlier version: singly linked; lesson: doubly. |
| High-precision subtraction | 2.1.4 [4] | Pair with the existing addition; same `arr` layout. |
| High-precision ÷ small number | 2.1.4 [4] | Quotient and remainder, digit by digit from the top. |
| Prime factorisation | 2.1.5 [3] | Trial division up to √n. Links forward to the sieve. |
| Binary trees | 2.1.3 [3–4] | Array storage, complete binary trees, node counts. Can extend `bt-traversal` instead if that reads better. |
| Permutations and combinations | 2.1.5 [2–4] | Next permutation and generating combinations, with the counting rules beside them. |

### CSP-S (14 lessons)

| Lesson | Syllabus point | Notes |
|---|---|---|
| Hash table | 2.2.3 [5–6] | Number hashing, chaining versus open addressing; the animation shows a collision. |
| String hashing | 2.2.3 [6] | Polynomial rolling hash; race against naive comparison in the lab. |
| Memoised search | 2.2.4 [6] | Earlier version: the same recursion without the memo. Fits the earlier-version rule exactly. |
| Coordinate compression | 2.2.4 [6] | Short; sort, unique, `lower_bound`. Link from Fenwick and segment tree. |
| Euler path and circuit | 2.2.3 [6], 2.2.4 [6] | Hierholzer. Uses `graph`. |
| Second-shortest path | 2.2.4 [7] | Dijkstra with two distances per vertex; links back to Dijkstra. |
| Iterative deepening | 2.2.4 [7] | Pair with bidirectional BFS in the same lesson or as two. |
| Bidirectional BFS | 2.2.4 [7] | Two frontiers on a `grid`. |
| Sweep line | 2.2.4 [7] | Rectangle union area with a segment tree; needs coordinate compression first. |
| Modular inverse (Fermat, Euler) | 2.2.5 [7] | Totient, Fermat's little theorem, inverse by fast power; links to `exgcd`. |
| Chinese remainder theorem | 2.2.5 [7] | Uses `exgcd`. |
| Binomial coefficients mod p | 2.2.5 [6] | Factorials and inverse factorials; complements `pascal`. |
| Inclusion–exclusion | 2.2.5 [7] | Counting with bitmask subsets; links to `bitmask-dp`. |
| Matrix multiplication and fast matrix power | 2.2.5 [5–6] | Fibonacci in O(log n). Earlier version: the linear recurrence loop. |

Catalan numbers and derangements can be stories inside the binomial lesson rather than lessons of their own.

### NOI (10 lessons, in priority order)

| Lesson | Syllabus point | Notes |
|---|---|---|
| Persistent segment tree | 2.3.2 [8] | k-th smallest in a range. Reuses the segment tree view with version roots. |
| 2-SAT | 2.3.3 [8] | Builds on `tarjan-scc`. |
| Linear (XOR) basis | 2.3.4 [9] | Small; `arr` of binary rows. |
| Baby-step giant-step | 2.3.4 [8] | Uses the new hash table lesson. |
| Möbius inversion | 2.3.4 [9] | Builds on `linear-sieve`. |
| Determinant | 2.3.4 [9] | Gaussian elimination mod p; links to `gauss`. |
| Offline divide and conquer (CDQ) | 2.3.3 [8–9] | 3-D partial order. |
| Suffix automaton | 2.3.3 [10] | Needs a new automaton view (states and transitions); `graph` may be enough. |
| Fast Fourier transform | 2.3.4 [10] | Hardest to animate well; consider NTT for exact output that the oracle can check. |
| Kuhn–Munkres | 2.3.3 [10] | Builds on `hungarian`. |

Deliberately left for later: link-cut tree, k-d tree, tree of trees, binomial heap, general matching, simplex, half-plane intersection. Each is a large lesson with a small audience.

### Second-tier earlier versions

`specs/earlier-versions.md` lists four (Huffman, N queens, Dinic, quicksort). Do them only when a lesson in the table above is blocked; the new lessons add more value.

---

## Phase 2: learning features

These are the "Planned" items from the README, with a data-model sketch for each. All are optional fields on `Lesson`, so they can ship for a few lessons first.

### 2.1 Links between lessons

`needs?: string[]` and the reverse, computed. Show "Learn first" and "Leads to" on the lesson page, and draw the graph on the Home page as a learning path. Add a test that every id exists and the graph has no cycles. Do this first in Phase 2: it is small, every Phase 1 lesson should set it, and the tables above already name most of the links.

### 2.2 Predict the next step

`predict?: { tag: string; question: L; options: L[]; answer: (step: Step) => number }[]`. When the player reaches a step with that tag, it pauses and asks. The answer is computed from the next step's views, so it stays right when the data is regenerated. Start with 10 lessons where the decision is crisp: binary search (go left or right), Dijkstra (which vertex next), KMP (where `j` falls back to), union-find, quicksort partition.

Track answers in the Profile (correct/total per lesson), stored locally like the rest of the profile.

### 2.3 A broken version to fix

Reuse `Variant` as `broken?: Variant & { bug: L; fixTag: string }`: one of the lesson's existing pitfalls as real code. The animation runs until the output differs from the correct version, then highlights the line. The test suite checks that the broken version really fails on some generated input and that the diff from the correct listing is a single region.

Start with pitfalls that are already listed in `text.ts`: binary search off-by-one, knapsack inner loop in the wrong direction, Dijkstra with negative edges, the missing `fa[x] =` in union-find.

### 2.4 Practice problems

`practice?: { judge: 'luogu' | 'cf' | 'atcoder' | 'loj'; id: string; title: L; diff?: number }[]`, rendered as links. Never copy problem statements (copyright). Three to five problems per lesson, easiest first. Let the Profile mark them solved.

### 2.5 Review

Use the "learned" date in the Profile to suggest lessons to revisit after 1, 7 and 30 days, with the prediction quiz as the review. No server needed.

---

## Phase 3: polish and reach

Lower priority; pick up between lessons.

- **Offline**: a service worker so the site works without a network (useful in classrooms and contest training camps).
- **Deep links**: put the tab and the animation step in the URL, so a teacher can share "step 37 of Dijkstra".
- **Accessibility**: announce each step's message to screen readers (`aria-live`), respect `prefers-reduced-motion`, check colour contrast of the tones in both themes.
- **Phone layout**: the code-plus-flowchart view and the lab chart at 375 px wide.
- **Browser smoke test**: a Playwright test that opens every lesson, plays the animation to the end and runs the lab, catching rendering errors the logic tests cannot.

---

## Order of work

1. Phase 0 (CI, bundle split, out-of-scope marking, authoring guide, licence): about one week.
2. 2.1 lesson links, since every new lesson should set them.
3. Phase 1 lessons, CSP-J and CSP-S first. In parallel, 2.2 and 2.3 on a handful of existing lessons, to validate the designs before rolling them out.
4. NOI lessons, 2.4, 2.5 and Phase 3 as time allows.

## Open questions

- Who is the main audience: self-learners or teachers using it in class? Teachers raise the priority of deep links, offline use and practice lists.
- Will outside contributions be accepted? If so, the licence and authoring guide move to the very top.
