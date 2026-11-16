import type { Cat, Lesson, Level } from '../engine/types'

export const CAT_ORDER: Cat[] = ['basic', 'sort', 'search', 'ds', 'graph', 'dp', 'string', 'math']
const LEVEL_ORDER: Record<Level, number> = { J: 0, S: 1, N: 2 }

/** The learning path: by level, then difficulty, then topic, then the order within the category's file. */
export const inOrder = <T extends Pick<Lesson, 'level' | 'diff' | 'cat'>>(lessons: T[]): T[] => lessons
  .map((l, i) => ({ l, i }))
  .sort((a, b) => LEVEL_ORDER[a.l.level] - LEVEL_ORDER[b.l.level] || a.l.diff - b.l.diff || CAT_ORDER.indexOf(a.l.cat) - CAT_ORDER.indexOf(b.l.cat) || a.i - b.i)
  .map(x => x.l)
