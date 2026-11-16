import type { Card, FlowNode, L, Lesson, Variant } from '../engine/types'

/** Prose of a lesson (`text.ts` of its category): the problem it solves, why the method works, and common mistakes. */
export interface Prose { problem: L; why: L; pitfalls: L[] }

/**
 * Hand-written extras of a lesson (`stories.ts` and `first.ts` of its category):
 * - story: the Ideas tab as an illustrated sequence (starting point → insight → method → payoff);
 * - flow:  a flowchart whose nodes light up during the animation;
 * - first: the version to learn first — the same method before an optimisation (not an unrelated brute force) —
 *          to read, animate and compare with the lesson's own version (named by `label`). See specs/earlier-versions.md.
 */
export interface Extras { story?: Card[]; flow?: FlowNode[]; first?: Variant; label?: L }

/** What the lists and the search show of a lesson, available before the lesson itself is loaded. Generated into meta.ts. */
export type Meta = Pick<Lesson, 'id' | 'title' | 'level' | 'cat' | 'diff' | 'blurb' | 'time' | 'needs'>
