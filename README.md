# OI Explained

A web app for learners of competitive programming (OI). It covers 69 algorithms and data structures from the CCF NOI syllabus (2025 edition), from CSP-J to NOI level. The interface is available in English and Simplified Chinese.

Each lesson has five tabs:

1. **Problem** – the task, a real-world example, the input format and a sample.
2. **Ideas** – the reasoning as a sequence of steps, complexity and common pitfalls.
3. **Code walkthrough** – a complete C++17 program with the explanations as comments (they can be hidden, and are included when copying).
4. **Animation** – the algorithm running step by step on small test data, with the current code line highlighted. The data can be regenerated in three sizes or edited by hand.
5. **Data lab** – runs the algorithm on generated data of increasing size, charts the amount of work, and downloads each test case as `.in` / `.out` files.

Seven lessons (binary search, prefix sums, fast exponentiation, monotonic queue, KMP, sieve of Eratosthenes, 0/1 knapsack) additionally have illustrated ideas, a flowchart shown beside the code and followed by the animation, and an earlier version of the program to learn first: a brute-force one, or for the knapsack the 2-D table before it is reduced to one row. Both versions can be read and animated; the brute-force ones are also compared with the efficient method in the data lab.

The Syllabus page lists every syllabus point with its difficulty coefficient and links the points that have a lesson. The Profile page tracks learned and starred lessons; it is stored in the browser's local storage only and can be exported and imported as JSON.

## Run

Requires Node.js 22 or later.

```
npm install
npm run dev
```

Open the address that is printed (http://localhost:5173 by default).

`npm run build` writes a static site to `dist/`. It needs no server-side code and can be hosted from any path.

## Keyboard

In the Animation tab: `Space` plays or pauses, `←` / `→` step backward or forward.

## Tests

`npm test` runs every lesson on generated data and compares its output with an independent brute-force solution.

To also compile every C++ listing and compare its output with the animation, set `GXX` to a g++ executable:

```
GXX=/usr/bin/g++ npm test
```

## Planned

- Illustrated ideas and a flowchart for the remaining 62 lessons.
- Lessons for the syllabus points that have none yet.
- Predict the next step: the animation pauses at a decision and asks what happens next.
- A broken version to fix: a common pitfall as real code, animated until it goes wrong.
- Links between lessons that build on each other (e.g. sieve → linear sieve).
- Practice problems for each lesson.

## Syllabus

`specs/NOI_Syllabus_Edition_2025.md` is a transcription of the syllabus PDF published by CCF. The syllabus is © CCF and may not be redistributed or used commercially without CCF's permission.
