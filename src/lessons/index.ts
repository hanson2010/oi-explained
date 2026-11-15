import type { Cat, Lesson, Level } from '../engine/types'
import basic from './basic'
import dp from './dp'
import ds from './ds'
import math from './math'
import string from './string'
import { TEXT } from './text'
import graph from './graph'
import { REAL } from './real'
import { RICH } from './rich'
import search from './search'
import sort from './sort'

const LEVEL_ORDER: Record<Level, number> = { J: 0, S: 1, N: 2 }
const CAT_ORDER: Cat[] = ['basic', 'sort', 'search', 'ds', 'graph', 'dp', 'string', 'math']

/** All lessons, ordered as a learning path: by level, then difficulty, then topic. */
export const LESSONS: Lesson[] = [...basic, ...sort, ...search, ...ds, ...graph, ...dp, ...string, ...math]
  .map((l, i) => ({ l, i }))
  .sort((a, b) => LEVEL_ORDER[a.l.level] - LEVEL_ORDER[b.l.level] || a.l.diff - b.l.diff || CAT_ORDER.indexOf(a.l.cat) - CAT_ORDER.indexOf(b.l.cat) || a.i - b.i)
  .map(x => ({ ...x.l, ...TEXT[x.l.id], real: REAL[x.l.id], ...RICH[x.l.id] }))

export const BY_ID = new Map(LESSONS.map(l => [l.id, l]))
