# OI Explained

A web app for learners of competitive programming (OI). It covers 101 algorithms and data structures from the CCF NOI syllabus (2025 edition), from CSP-J to NOI level. The interface is available in English and Simplified Chinese.

Each lesson has seven tabs:

1. **Problem** – the task, a real-world example, the input format and a sample.
2. **Ideas** – the reasoning as an illustrated sequence of steps, a flowchart, complexity and common pitfalls.
3. **Code walkthrough** – a complete C++17 program with the explanations as comments (they can be hidden, and are included when copying).
4. **Animation** – the algorithm running step by step on small test data, with the current code line highlighted. The data can be regenerated in three sizes or edited by hand.
5. **Data lab** – runs the algorithm on generated data of increasing size, charts the amount of work, and downloads each test case as `.in` / `.out` files.
6. **Find the bug** – the lesson's program with one common mistake put back in, shown on an input where it prints the wrong answer. Step through it and click the line you think is wrong; the explanation appears once it is found.
7. **Practice** – one to five problems on AcWing, Luogu and Codeforces that the lesson's method solves, each with a box to tick once you have solved it. The Profile page counts the ticks.

The flowchart is also shown beside the code and is followed by the animation.

59 lessons can also quiz you: switch on "Ask me first" in the Animation tab and the player stops before a decision, asks what will happen, and then plays the step as the explanation. The Profile page counts the right answers.

Sixteen lessons additionally have an earlier version of the program to learn first: the same method before one optimisation, such as the knapsack's 2-D table before it is reduced to one row, Dijkstra with an array scan before the heap, or a segment tree before lazy tags. Both versions can be read and animated, and most pairs are raced in the data lab. `specs/earlier-versions.md` lists them and the rule for choosing them.

A lesson names the lessons to learn first and shows the ones it leads to; the learning path on the home page never puts a lesson before its prerequisites.

The Syllabus page lists every syllabus point with its difficulty coefficient and links the points that have a lesson. Points with a lesson to come are marked as planned; points outside what the site teaches (such as the C++ language itself) are greyed. A learned lesson comes back for review 1, 7 and 30 days later: the Profile page lists what is due, and a review is the lesson's animation played to the end on new data, with its questions switched on.

The Profile page tracks learned and starred lessons, quiz answers, solved practice problems and reviews; it is stored in the browser's local storage only and can be exported and imported as JSON.

## Run

Requires Node.js 22 or later.

```
npm install
npm run dev
```

Open the address that is printed (http://localhost:5173 by default).

`npm run build` writes a static site to `dist/`. It needs no server-side code and can be hosted from any path. Each category of lessons is a separate file that is downloaded when one of its lessons is opened.

## Keyboard

On any page: `/` or `Ctrl`+`K` opens the lesson search.

In the Animation tab: `Space` plays or pauses, `←` / `→` step backward or forward.

## Tests

`npm test` runs every lesson on generated data and compares its output with an independent brute-force solution.

To also compile every C++ listing (including the broken versions) and compare its output with the animation, set `GXX` to a g++ executable (on Linux raise the stack limit first, `ulimit -s unlimited`, for the deeply recursive listings):

```
GXX=/usr/bin/g++ npm test
```

`npm run check:practice` opens every practice link and compares the title on the judge's page with the one listed. It needs access to the three sites and is not run in CI. `npm run check:practice -- luogu cf` checks only those judges. AcWing shows problems only when logged in, and course problems only to accounts with the course: export your browser's cookies for www.acwing.com as a JSON array of `{ name, value, domain }` to `cookies/www.acwing.com_cookies.json`; further accounts go in files named `cookies/www.acwing.com_cookies_2.json` and so on, and each problem is tried with one account after another. Git ignores that folder. AcWing refuses pages when asked too often, and its administrators freeze accounts used for fast automated requests, so the checker sends at most one AcWing request a minute (`ACWING_DELAY` can only make it slower) and stops checking AcWing at the first refusal; `--from acwing:<id>` resumes from the problem it names. A full AcWing run takes about two and a half hours.

GitHub Actions runs the build and all tests, including the C++ checks, on every push (`.github/workflows/ci.yml`).

## Adding a lesson

`specs/lesson-authoring.md` says where each part of a lesson goes and what to check before merging. After adding a lesson or changing its title, level, difficulty, blurb or time, run `npm run gen` to rebuild the lesson index (`src/lessons/meta.ts`).

## Planned

`specs/roadmap.md` has the full plan, in order. Next are lessons for the syllabus points that have none yet.

## Syllabus

`specs/NOI_Syllabus_Edition_2025.md` is a transcription of the syllabus PDF published by CCF. The syllabus is © CCF and may not be redistributed or used commercially without CCF's permission.
