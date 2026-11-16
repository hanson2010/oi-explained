import { describe, expect, it } from 'vitest'
import { sanitize } from '../src/store'

describe('sanitize', () => {
  it('reads a version 1 profile, which has no quiz, solved or review', () => {
    expect(sanitize({ lang: 'zh', theme: 'dark', name: 'Li', done: { kmp: 5 }, fav: { kmp: true }, last: 'kmp' }))
      .toEqual({ lang: 'zh', theme: 'dark', name: 'Li', done: { kmp: 5 }, fav: { kmp: true }, last: 'kmp' })
  })
  it('keeps well-formed progress of every kind', () => {
    const p = { done: { a: 1 }, fav: { a: true }, quiz: { a: { right: 2, total: 3, at: 9 } }, solved: { 'luogu:P1001': 7 }, review: { a: [1, 2] } }
    expect(sanitize(p)).toEqual(p)
  })
  it('drops what is malformed and keeps the rest', () => {
    expect(sanitize({
      lang: 'fr', theme: 3, name: 'x'.repeat(100),
      done: { a: 1, b: 'yes' }, fav: { a: 0 },
      quiz: { a: { right: 1, total: 2, at: 3 }, b: { right: 5, total: 2, at: 3 }, c: { right: 1 }, d: null, e: { right: -1, total: 2, at: 3 } },
      solved: { x: 1, y: '2' }, review: { a: [1, 2], b: [1, 'x'], c: 5 },
    })).toEqual({ name: 'x'.repeat(40), done: { a: 1 }, fav: { a: true }, quiz: { a: { right: 1, total: 2, at: 3 } }, solved: { x: 1 }, review: { a: [1, 2] } })
  })
  it('survives anything that is not a profile', () => {
    for (const x of [null, undefined, 7, 'text', [], { quiz: 'no', solved: 4, review: [] }]) expect(sanitize(x)).toEqual({})
  })
})
