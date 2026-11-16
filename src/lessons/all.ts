/**
 * Every lesson, loaded at once. For the tests and scripts only:
 * the app imports meta.ts for lists and load.ts for one category at a time, so that a page does not download all lessons.
 */
import type { Lesson } from '../engine/types'
import basic from './basic'
import dp from './dp'
import ds from './ds'
import type { Meta } from './extras'
import graph from './graph'
import math from './math'
import { inOrder } from './order'
import search from './search'
import sort from './sort'
import string from './string'

/** All lessons in learning order. */
export const LESSONS: Lesson[] = inOrder([...basic, ...sort, ...search, ...ds, ...graph, ...dp, ...string, ...math])

export const BY_ID = new Map(LESSONS.map(l => [l.id, l]))

/** What meta.ts must contain. */
export const metaOf = (ls: Lesson[]): Meta[] => ls.map(({ id, title, level, cat, diff, blurb, time, needs }) => ({ id, title, level, cat, diff, blurb, time, ...(needs?.length ? { needs } : {}) }))
