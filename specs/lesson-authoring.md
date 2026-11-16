# Writing a lesson

A checklist for adding or changing a lesson. The tests enforce most of it; this page says where things go and what the tests cannot see.

## Where a lesson lives

Each category has a folder in `src/lessons/` (`basic`, `sort`, `search`, `ds`, `graph`, `dp`, `string`, `math`). A lesson is spread over the files of its category's folder and joined by its `id`:

| File | Holds | Type |
|---|---|---|
| `lessons.ts` | The lesson object: `id`, titles, level, difficulty, `needs` (direct prerequisites), `blurb`, `ideas`, complexity, the C++ listing, `notes`, input format, `gen`, `sizes`, `lab`, `run`. Add it to the default export at the bottom. | `Lesson` |
| `text.ts` | `TEXT[id]`: `problem`, `why`, `pitfalls` (two or more). `REAL[id]`: where the problem shows up outside contests. | `Prose`, `L` |
| `stories.ts` | `story` (four or more cards) and `flow` (the flowchart). | `Extras` |
| `first.ts` | Optional: the earlier version and the `label` of the lesson's own version. | `Variant` |
| `index.ts` | Joins the files. Change it only when a category gets its first `first.ts`. | |

Outside the folder:

- `tests/oracles.ts`: an independent check of the lesson's output.
- `src/data/syllabus.ts`: put the lesson's `id` on the syllabus points it covers, replacing `'planned'`.
- `src/lessons/meta.ts`: generated. Run `npm run gen` after adding a lesson or changing its title, level, category, difficulty, blurb or time.

A new category also needs an entry in `load.ts`, `all.ts` and `order.ts`, in `Cat` in `src/engine/types.ts`, and in `CATS` in `src/i18n.ts`.

## The program and its animation

- `code` is a complete C++17 program that reads standard input and compiles without warnings under `-Wall -Wextra`.
- A trailing `//@tag` on a line names it. Steps, notes and flowchart nodes refer to lines by tag.
- `run(inp, t)` is the same algorithm in TypeScript. It calls `t.s(tag, () => [message, ...views])` at each step worth showing and `t.out(answer)` once at the end. The output must match the C++ program's token for token.
- Build views only inside the function passed to `t.s`. The data lab runs `run` with recording off on large data, and anything built outside that function costs time there.
- `t.ask(() => [question, options, answer])`, called just before a `t.s`, makes the player quiz the learner about that step. Give two to four options that differ, computed from the data; return `undefined` when the answer would be a tie or obvious.
- Use `t.tick()` for work too fine to show as a step, so the lab's operation count stays honest.
- Check the input with `need(condition, english, chinese)`. Learners edit the input by hand.
- `gen(n, r)` produces a valid input of magnitude `n` from the seeded generator `r` only; never use `Math.random`.
- `sizes` are three magnitudes that animate well: at most 1500 steps each. `lab` are the magnitudes for the data lab: each must run in under 6 seconds.

## The story

Cards are of five kinds. `term` holds words, definitions or a theorem the lesson relies on, and can stand anywhere. The other four usually come in this order: `naive` (the obvious first attempt and what is wrong with it), `insight` (the observation that unlocks the method), `how` (a step of the method), `result` (what is gained, with the cost). A card can carry a figure drawn with the same views as the animation.

A definition or a theorem the lesson relies on gets a card here. A syllabus point may link to the lesson only if a card or the `why` text really explains it.

Every code tag needs a flowchart node, either through the node's `id` or its `on` list.

## An earlier version

Only when the program is the same method before one optimisation. The rule and the list are in `earlier-versions.md`. Set `maxN` if it is too slow for the larger lab sizes.

## A broken version

Optional: `broken: { from, to, why }` in `lessons.ts`. `from` is a piece of the listing that occurs exactly once, `to` replaces it, and the change stays within one line. `run(inp, t, bug = false)` then implements both: with `bug` it does what the broken listing does, describes each step neutrally (it must not give the mistake away), and asks no questions. Choose a mistake that prints a wrong answer on small inputs, always terminates, and is defined behaviour in C++ — no out-of-range access, no overflow — because the tests compile the broken listing and compare it with the broken animation. A mistake that only makes the program slow does not qualify.

## The oracle

Write it without looking at `run`: a brute force, or a check of the answer's properties (for example, that a printed matching is valid and of maximum size). Use `min` and `max` to limit the sizes it runs on.

## Two languages

Every text is a pair `[English, 简体中文]`. Write each for its reader; do not translate word for word. Use the terms the Chinese syllabus uses.

## Before merging

1. `npm run gen`
2. `npm run build`
3. `ulimit -s unlimited && GXX=g++ npm test` (CI runs the same)
4. In the browser (`npm run dev`), for the new lesson:
   - all three animation sizes read well, and the highlighted code line follows the message
   - the flowchart lights up with the animation
   - the lab chart has the shape the complexity predicts
   - both languages, both themes
5. The syllabus point links to the lesson.
