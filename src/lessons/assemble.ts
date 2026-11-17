import type { L, Lesson, Practice } from '../engine/types'
import type { Extras, Prose } from './extras'

/** Joins the parts of a category's lessons, which are written in separate files, by lesson id. */
export const assemble = (
  lessons: Lesson[], text: Record<string, Prose>, real: Record<string, L>, stories: Record<string, Extras>, first: Record<string, Extras> = {},
  practice: Record<string, Practice[]> = {},
): Lesson[] => lessons.map(l => ({ ...l, ...text[l.id], real: real[l.id], ...stories[l.id], ...first[l.id], practice: practice[l.id] }))
