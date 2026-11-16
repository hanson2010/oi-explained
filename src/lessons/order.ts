import type { Cat, Lesson, Level } from '../engine/types'

export const CAT_ORDER: Cat[] = ['basic', 'sort', 'search', 'ds', 'graph', 'dp', 'string', 'math']
const LEVEL_ORDER: Record<Level, number> = { J: 0, S: 1, N: 2 }

/**
 * The learning path: by level, then difficulty, then topic, then the order within the category's file —
 * except that a lesson never comes before one it `needs`. Among the lessons whose prerequisites are all placed,
 * the one that is earliest by the rule above goes next.
 */
export const inOrder = <T extends Pick<Lesson, 'id' | 'level' | 'diff' | 'cat' | 'needs'>>(lessons: T[]): T[] => {
  const ranked = lessons
    .map((l, i) => ({ l, i }))
    .sort((a, b) => LEVEL_ORDER[a.l.level] - LEVEL_ORDER[b.l.level] || a.l.diff - b.l.diff || CAT_ORDER.indexOf(a.l.cat) - CAT_ORDER.indexOf(b.l.cat) || a.i - b.i)
    .map(x => x.l)
  const out: T[] = [], placed = new Set<string>(), known = new Set(lessons.map(l => l.id))
  while (out.length < ranked.length) {
    const next = ranked.find(l => !placed.has(l.id) && (l.needs ?? []).every(id => placed.has(id) || !known.has(id)))
    if (!next) throw new Error('Lessons need each other in a cycle: ' + ranked.filter(l => !placed.has(l.id)).map(l => l.id).join(', '))
    out.push(next); placed.add(next.id)
  }
  return out
}
