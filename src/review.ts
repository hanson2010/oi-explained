import type { Profile } from './store'

const DAY = 86400000
/** A lesson is reviewed 1, 7 and 30 days after the previous time it was learned or reviewed; after three reviews it is settled. */
export const INTERVALS = [1, 7, 30]

/** When the lesson is next due for review, or undefined if it is not learned or needs no further review. */
export function dueAt(p: Pick<Profile, 'done' | 'review'>, id: string): number | undefined {
  const learned = p.done[id]
  if (!learned) return undefined
  // Reviews from before the lesson was (re)marked as learned do not count.
  const reviews = (p.review[id] ?? []).filter(t => t >= learned).sort((a, b) => a - b)
  if (reviews.length >= INTERVALS.length) return undefined
  return (reviews[reviews.length - 1] ?? learned) + INTERVALS[reviews.length] * DAY
}

/** Ids of the lessons due for review now, the longest overdue first. Only ids in `known` count, so removed lessons drop out. */
export function dueNow(p: Pick<Profile, 'done' | 'review'>, now: number, known: Iterable<string>): string[] {
  const due: [string, number][] = []
  for (const id of known) { const at = dueAt(p, id); if (at !== undefined && at <= now) due.push([id, at]) }
  return due.sort((a, b) => a[1] - b[1]).map(x => x[0])
}

/** How many reviews of this lesson have been done since it was learned, and how many there are in all. */
export const reviewStage = (p: Pick<Profile, 'done' | 'review'>, id: string) =>
  ({ done: (p.review[id] ?? []).filter(t => t >= (p.done[id] ?? Infinity)).length, of: INTERVALS.length })
