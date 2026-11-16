# OI Explained

A web app for learners of competitive programming (OI). It covers 69 algorithms and data structures from the CCF NOI syllabus (2025 edition), from CSP-J to NOI level. The interface is available in English and Simplified Chinese.

Each lesson has five tabs:

1. **Problem** – the task, a real-world example, the input format and a sample.
2. **Ideas** – the reasoning as an illustrated sequence of steps, a flowchart, complexity and common pitfalls.
3. **Code walkthrough** – a complete C++17 program with the explanations as comments (they can be hidden, and are included when copying).
4. **Animation** – the algorithm running step by step on small test data, with the current code line highlighted. The data can be regenerated in three sizes or edited by hand.
5. **Data lab** – runs the algorithm on generated data of increasing size, charts the amount of work, and downloads each test case as `.in` / `.out` files.

The flowchart is also shown beside the code and is followed by the animation.

Fourteen lessons additionally have an earlier version of the program to learn first: the same method before one optimisation, such as the knapsack's 2-D table before it is reduced to one row, Dijkstra with an array scan before the heap, or a segment tree before lazy tags. Both versions can be read and animated, and most pairs are raced in the data lab. `specs/earlier-versions.md` lists them and the rule for choosing them.

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

On any page: `/` or `Ctrl`+`K` opens the lesson search.

In the Animation tab: `Space` plays or pauses, `←` / `→` step backward or forward.

## Tests

`npm test` runs every lesson on generated data and compares its output with an independent brute-force solution.

To also compile every C++ listing and compare its output with the animation, set `GXX` to a g++ executable (on Linux raise the stack limit first, `ulimit -s unlimited`, for the deeply recursive listings):

```
GXX=/usr/bin/g++ npm test
```

## Planned

- Lessons for the syllabus points that have none yet.
- Predict the next step: the animation pauses at a decision and asks what happens next.
- A broken version to fix: a common pitfall as real code, animated until it goes wrong.
- Links between lessons that build on each other (e.g. sieve → linear sieve).
- Practice problems for each lesson.

## Syllabus

`specs/NOI_Syllabus_Edition_2025.md` is a transcription of the syllabus PDF published by CCF. The syllabus is © CCF and may not be redistributed or used commercially without CCF's permission.
