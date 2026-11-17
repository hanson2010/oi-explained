import { describe, expect, it } from 'vitest'
import { dueAt, dueNow, reviewStage } from '../src/review'

const DAY = 86400000

describe('review schedule', () => {
  it('has nothing for a lesson that is not learned', () => {
    expect(dueAt({ done: {}, review: { a: [5] } }, 'a')).toBeUndefined()
  })
  it('asks for reviews 1, 7 and 30 days after the previous event, then stops', () => {
    const t = 1000
    expect(dueAt({ done: { a: t }, review: {} }, 'a')).toBe(t + DAY)
    expect(dueAt({ done: { a: t }, review: { a: [t + 2 * DAY] } }, 'a')).toBe(t + 9 * DAY)
    expect(dueAt({ done: { a: t }, review: { a: [t + 2 * DAY, t + 10 * DAY] } }, 'a')).toBe(t + 40 * DAY)
    expect(dueAt({ done: { a: t }, review: { a: [t + 2 * DAY, t + 10 * DAY, t + 50 * DAY] } }, 'a')).toBeUndefined()
  })
  it('ignores reviews from before the lesson was learned again', () => {
    const p = { done: { a: 100 * DAY }, review: { a: [3 * DAY, 20 * DAY] } }
    expect(dueAt(p, 'a')).toBe(101 * DAY)
    expect(reviewStage(p, 'a')).toEqual({ done: 0, of: 3 })
  })
  it('lists what is due now, the longest overdue first, and only known lessons', () => {
    const p = { done: { a: 1, b: 5 * DAY, c: 9 * DAY, gone: 1 }, review: { a: [1 * DAY] } }
    // At day 10: a is due since day 8, b since day 6, c since day 10; "gone" is not a lesson any more.
    expect(dueNow(p, 10 * DAY, ['a', 'b', 'c', 'd'])).toEqual(['b', 'a', 'c'])
    expect(dueNow(p, 5.5 * DAY, ['a', 'b', 'c'])).toEqual([])
  })
})
