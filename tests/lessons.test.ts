import { describe, expect, it } from 'vitest'
import { parseCode } from '../src/components/Code'
import { bugLine, failingInput } from '../src/components/Fix'
import { lessonsOf, SYLLABUS } from '../src/data/syllabus'
import { brokenCode, Rng, Tracer } from '../src/engine/types'
import { BY_ID, LESSONS, metaOf } from '../src/lessons/all'
import { META } from '../src/lessons/meta'
import { JUDGES, practiceKey } from '../src/practice'
import { ORACLES } from './oracles'

const run = (id: string, input: string, on: boolean) => {
  const t = new Tracer(on, 1e9)
  BY_ID.get(id)!.run(input, t)
  return t
}

it('has an up-to-date lesson index (run `npm run gen` if this fails)', () => {
  expect(META).toEqual(metaOf(LESSONS))
})

describe('links between lessons', () => {
  const at = new Map(LESSONS.map((l, i) => [l.id, i]))
  it('name existing lessons, never the lesson itself, without repeats', () => {
    for (const l of LESSONS) {
      const needs = l.needs ?? []
      expect(needs.filter(id => !BY_ID.has(id) || id === l.id), l.id).toEqual([])
      expect(new Set(needs).size, l.id).toBe(needs.length)
    }
  })
  it('put every prerequisite earlier in the learning path', () => {
    expect(LESSONS.flatMap(l => (l.needs ?? []).filter(id => at.get(id)! > at.get(l.id)!).map(id => `${l.id} needs ${id}`))).toEqual([])
  })
  it('do not send a learner up a level', () => {
    const rank = { J: 0, S: 1, N: 2 }
    expect(LESSONS.flatMap(l => (l.needs ?? []).filter(id => rank[BY_ID.get(id)!.level] > rank[l.level]).map(id => `${l.id} (${l.level}) needs ${id}`))).toEqual([])
  })
})

describe('practice problems', () => {
  const all = LESSONS.flatMap(l => (l.practice ?? []).map(x => ({ lesson: l.id, ...x })))
  it('have ids in the format of their judge and a title that starts with the problem number', () => {
    const numbered = (x: (typeof all)[number]) => x.judge === 'acwing' ? /^[1-9]\d*\. \S/.test(x.title) : x.title.startsWith(x.id + (x.judge === 'cf' ? '. ' : ' '))
    expect(all.filter(x => !JUDGES[x.judge]?.format.test(x.id) || !numbered(x)).map(x => `${x.lesson}: ${x.judge} ${x.id}`)).toEqual([])
  })
  it('cover every lesson', () => {
    expect(LESSONS.filter(l => !l.practice).map(l => l.id)).toEqual([])
  })
  it('are listed one to five times per lesson, without repeats, grouped by judge in order', () => {
    const order = Object.keys(JUDGES)
    for (const l of LESSONS.filter(l => l.practice)) {
      const ps = l.practice!, judges = ps.map(x => order.indexOf(x.judge))
      expect(ps.length, l.id).toBeGreaterThanOrEqual(1)
      expect(ps.length, l.id).toBeLessThanOrEqual(5)
      expect(new Set(ps.map(practiceKey)).size, l.id).toBe(ps.length)
      expect(judges, l.id).toEqual(judges.slice().sort((a, b) => a - b))
    }
  })
  it('have the same title wherever they are listed', () => {
    const title = new Map<string, string>()
    for (const x of all) {
      const k = practiceKey(x)
      expect(title.get(k) ?? x.title, `${x.lesson}: ${k}`).toBe(x.title)
      title.set(k, x.title)
    }
  })
})

describe('syllabus', () => {
  const items = SYLLABUS.flatMap(l => l.sections.flatMap(s => s.groups.flatMap(g => g.items)))
  const refs = items.flatMap(lessonsOf)
  it('puts every point in exactly one state: lessons, planned, or out of scope with a reason', () => {
    const bad = items.filter(it => (Array.isArray(it[3]) ? it[3].length === 0 : !['planned', 'env', 'lang', 'school', 'theory'].includes(it[3])))
    expect(bad.map(it => it[2])).toEqual([])
  })
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

  it('asks well-formed questions, if any', () => {
    for (const n of lesson.sizes) for (let seed = 1; seed <= 6; seed++) {
      const t = run(id, lesson.gen(n, new Rng(seed)), true)
      expect(t.steps[0].ask, 'the first step has nothing before it to predict from').toBeUndefined()
      for (const q of t.steps.flatMap(s => s.ask ?? [])) {
        expect(q.q[0] && q.q[1], 'question in both languages').toBeTruthy()
        expect(q.options.length).toBeGreaterThanOrEqual(2)
        expect(q.options.length).toBeLessThanOrEqual(4)
        expect(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length, `answer ${q.answer}`).toBe(true)
        for (const k of [0, 1] as const) { expect(q.options.every(o => o[k])).toBe(true); expect(new Set(q.options.map(o => o[k])).size, 'options differ').toBe(q.options.length) }
      }
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

  it.skipIf(!lesson.broken)('has a broken version with one wrong line that gives wrong answers and always stops', () => {
    const b = lesson.broken!, code = brokenCode(lesson)
    expect(lesson.code.split(b.from).length, '`from` occurs exactly once').toBe(2)
    const good = lesson.code.split('\n'), bad = code.split('\n')
    expect(bad.length).toBe(good.length)
    expect(good.filter((ln, k) => ln !== bad[k]).length, 'exactly one line differs').toBe(1)
    expect(parseCode(code).tags).toEqual(tags)
    expect(b.why[0] && b.why[1]).toBeTruthy()
    let wrong = 0
    for (const n of lesson.sizes) for (let seed = 1; seed <= 50; seed++) {
      const input = lesson.gen(n, new Rng(seed)), t = new Tracer(true, 20000)
      lesson.run(input, t, true) // throws if it runs away
      expect([...new Set(t.steps.map(s => s.tag))].filter(tag => !(tag in tags)), 'unknown step tags').toEqual([])
      for (const s of t.steps) { expect(s.msg[0] && s.msg[1]).toBeTruthy(); expect(s.ask, 'no questions in the broken version').toBeUndefined() }
      if (n === lesson.sizes[0] && t.output !== run(id, input, false).output) wrong++
    }
    expect(wrong, 'seeds 1–50 at the smallest size on which the output is wrong').toBeGreaterThan(0)
    expect(failingInput(lesson)).toBeTruthy()
    expect(bugLine(lesson)).toBeGreaterThanOrEqual(0)
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

it('has "predict the next step" questions in the lessons chosen for them', () => {
  // The others make no decision worth predicting: their steps are single comparisons or arithmetic.
  const QUIZ = ['simulation', 'prefix-sum', 'stack', 'gcd', 'prime-factor', 'binary-search', 'difference', 'hanoi', 'bignum-add', 'bignum-mul', 'bignum-div', 'permutations', 'bt-traversal', 'huffman', 'graph-dfs', 'lis', 'sieve', 'n-queens', 'bfs-maze', 'graph-bfs', 'knapsack', 'merge-sort', 'quick-sort', 'monotonic-queue', 'coord-compress', 'heap-sort', 'radix-sort', 'memo-search', 'sparse-table', 'dsu', 'fenwick', 'segment-tree', 'trie', 'dijkstra', 'prim', 'kruskal', 'tree-diameter', 'lcs', 'tree-dp', 'kmp', 'string-hash', 'tarjan-scc', 'cut-bridge', 'second-shortest', 'manacher', 'exgcd', 'gauss', 'binomial-mod', 'incl-excl', 'treap', 'leftist-heap', 'persistent-seg', 'hld', 'z-function', 'expect-dp', 'nim-sg', 'prufer', 'xor-basis', 'mobius']
  const none = QUIZ.filter(id => { const l = BY_ID.get(id)!; return [1, 2, 3].every(seed => !run(id, l.gen(l.sizes[1], new Rng(seed)), true).steps.some(s => s.ask)) })
  expect(none).toEqual([])
})

it('has a broken version in every lesson', () => {
  expect(LESSONS.filter(l => !l.broken).map(l => l.id)).toEqual([])
})

it('every lesson has an oracle', () => {
  expect(LESSONS.map(l => l.id).filter(id => !ORACLES[id])).toEqual([])
})
