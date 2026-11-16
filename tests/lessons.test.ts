import { describe, expect, it } from 'vitest'
import { parseCode } from '../src/components/Code'
import { SYLLABUS } from '../src/data/syllabus'
import { Rng, Tracer } from '../src/engine/types'
import { BY_ID, LESSONS } from '../src/lessons'
import { ORACLES } from './oracles'

const run = (id: string, input: string, on: boolean) => {
  const t = new Tracer(on, 1e9)
  BY_ID.get(id)!.run(input, t)
  return t
}

describe('syllabus', () => {
  const refs = SYLLABUS.flatMap(l => l.sections.flatMap(s => s.groups.flatMap(g => g.items.flatMap(it => it[3] ?? []))))
  it('links only to existing lessons', () => {
    expect(refs.filter(id => !BY_ID.has(id))).toEqual([])
  })
  it('links to every lesson', () => {
    expect(LESSONS.map(l => l.id).filter(id => !refs.includes(id))).toEqual([])
  })
  it('has unique lesson ids', () => {
    expect(new Set(LESSONS.map(l => l.id)).size).toBe(LESSONS.length)
  })
})

describe.each(LESSONS.map(l => [l.id, l] as const))('%s', (id, lesson) => {
  const { tags } = parseCode(lesson.code)

  it('has a problem statement, a real-world example, an explanation and pitfalls in both languages', () => {
    for (const l of [lesson.problem, lesson.why, lesson.real, ...(lesson.pitfalls ?? []), ...lesson.ideas]) { expect(l?.[0]).toBeTruthy(); expect(l?.[1]).toBeTruthy() }
    expect(lesson.pitfalls?.length).toBeGreaterThanOrEqual(2)
  })

  it('has notes that point at tagged lines', () => {
    expect(lesson.notes.map(n => n[0]).filter(tag => !(tag in tags))).toEqual([])
    expect(lesson.notes.length).toBeGreaterThan(0)
  })

  it('animates all three sizes with steps that map to code lines', () => {
    for (const n of lesson.sizes) for (let seed = 1; seed <= 6; seed++) {
      const input = lesson.gen(n, new Rng(seed)), t = run(id, input, true)
      expect(t.steps.length, `n=${n} seed=${seed}`).toBeGreaterThan(0)
      expect(t.steps.length, `n=${n} seed=${seed} is too long to watch`).toBeLessThanOrEqual(1500)
      expect([...new Set(t.steps.map(s => s.tag))].filter(tag => !(tag in tags)), 'unknown step tags').toEqual([])
      for (const s of t.steps) { expect(s.msg[0]).toBeTruthy(); expect(s.msg[1]).toBeTruthy() }
      // Recording steps must not change what the algorithm computes.
      expect(run(id, input, false).output).toBe(t.output)
    }
  })

  it('runs the data-lab sizes within budget', () => {
    for (const n of lesson.lab) {
      const t0 = performance.now()
      run(id, lesson.gen(n, new Rng(n * 7919 + 13)), false)
      expect(performance.now() - t0, `n=${n}`).toBeLessThan(6000)
    }
  })

  it('has a complete story and a flowchart that matches the animation', () => {
    expect(lesson.story!.length).toBeGreaterThanOrEqual(4)
    for (const c of lesson.story!) { expect(c.body[0]).toBeTruthy(); expect(c.body[1]).toBeTruthy(); c.fig?.() }
    const ids = lesson.flow!.map(n => n.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const n of lesson.flow!) for (const to of [n.next, n.yes, n.no]) if (to !== undefined) expect(ids, `flow target ${to}`).toContain(to)
    // Every flow trigger is a real code tag, and every step of the animation lights up some node.
    const triggers = lesson.flow!.flatMap(n => n.on ?? [n.id])
    expect(Object.keys(tags).filter(tag => !triggers.includes(tag)), 'tagged lines without a flow node').toEqual([])
    expect(lesson.flow!.flatMap(n => n.on ?? []).filter(tag => !(tag in tags)), 'unknown tags in "on"').toEqual([])
    const used = new Set(run(id, lesson.gen(lesson.sizes[1], new Rng(3)), true).steps.map(s => s.tag))
    expect([...used].filter(tag => !triggers.includes(tag)), 'steps without a flow node').toEqual([])
  })

  it.skipIf(!lesson.first)('has a first version that agrees with the lesson', () => {
    const naive = lesson.first!, ntags = parseCode(naive.code).tags
    for (const l of [naive.label, naive.blurb, lesson.label]) { expect(l?.[0]).toBeTruthy(); expect(l?.[1]).toBeTruthy() }
    expect(naive.notes.map(n => n[0]).filter(tag => !(tag in ntags))).toEqual([])
    const t = new Tracer(true, 1e9)
    naive.run(lesson.gen(lesson.sizes[0], new Rng(1)), t)
    expect(t.steps.length).toBeGreaterThan(0)
    expect([...new Set(t.steps.map(s => s.tag))].filter(tag => !(tag in ntags)), 'unknown step tags').toEqual([])
    for (const n of [...lesson.sizes, ...lesson.lab.filter(x => x <= (naive.maxN ?? Infinity))]) for (let seed = 1; seed <= (n > 100 ? 1 : 8); seed++) {
      const input = lesson.gen(n, new Rng(seed * 17 + n)), a = new Tracer(false), b = new Tracer(false)
      lesson.run(input, a); naive.run(input, b)
      expect(b.output, `n=${n} seed=${seed}\n${input.slice(0, 300)}`).toBe(a.output)
    }
  })

  const oracle = ORACLES[id]
  it.skipIf(!oracle)('matches an independent reference solution', () => {
    const ns = [...lesson.sizes, 1, 2, 3, 5, 30, 60].filter(n => n >= (oracle!.min ?? 1) && n <= (oracle!.max ?? 1e9))
    for (const n of ns) for (let seed = 1; seed <= 25; seed++) {
      const input = lesson.gen(n, new Rng(seed * 31 + n))
      const got = run(id, input, false).output
      const verdict = oracle!.check(input, got)
      expect(verdict === true ? '' : `${verdict}\n--- input ---\n${input}\n--- output ---\n${got}`).toBe('')
    }
  })
})

it('every lesson has an oracle', () => {
  expect(LESSONS.map(l => l.id).filter(id => !ORACLES[id])).toEqual([])
})
