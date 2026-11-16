/** Localised text: [English, 简体中文]. */
export type L = readonly [en: string, zh: string]

/** Semantic highlight colours shared by every view. */
export type Tone = 'act' | 'cmp' | 'ok' | 'bad' | 'dim' | 'alt' | 'vis'
export type Tones = Record<number, Tone | undefined>

export interface ArrV {
  k: 'arr'
  name?: string
  v: (number | string)[]
  tone?: Tones
  /** Named pointers under cells, e.g. { i: 2, j: 5 }. */
  ptr?: Record<string, number>
  /** Draw values as bars (sorting). */
  bars?: boolean
  /** Stable identity per element so swaps animate. */
  ids?: number[]
  /** Index shown under the first cell (default 0). */
  base?: number
}
export interface GNode { id: number; x: number; y: number; label: string; tone?: Tone; sub?: string }
export interface GEdge { u: number; v: number; w?: string | number; tone?: Tone; dir?: boolean; dash?: boolean }
export interface GraphV { k: 'graph'; name?: string; nodes: GNode[]; edges: GEdge[]; small?: boolean }
export interface GridV {
  k: 'grid'
  name?: string
  cells: (string | number)[][]
  /** Keyed by "row,col". */
  tone?: Record<string, Tone>
  rows?: (string | number)[]
  cols?: (string | number)[]
  /** Square cells (boards, mazes). */
  sq?: boolean
}
export interface VarsV { k: 'vars'; items: [string, string | number][] }
export type View = ArrV | GraphV | GridV | VarsV

export interface Step { tag: string; msg: L; views: View[] }

export type Level = 'J' | 'S' | 'N'
export type Cat = 'basic' | 'sort' | 'search' | 'ds' | 'graph' | 'dp' | 'string' | 'math'

/**
 * One beat of the Ideas story. Text may use inline markup:
 * **strong**, ==highlight==, __underline__ and `code`.
 */
export interface Card {
  /** naive = the obvious first attempt; insight = the observation that unlocks the method; how = a step of the method; result = what you gain. */
  kind: 'naive' | 'insight' | 'how' | 'result'
  title?: L
  body: L
  /** A static diagram, drawn with the same views as the animation. */
  fig?: () => View[]
}

/** A flowchart node. Nodes are listed top to bottom; by default each one continues to the node after it. */
export interface FlowNode {
  id: string
  kind?: 'start' | 'test' | 'end'
  text: L
  /** Where to go next, if not the following node. For a test: the "yes" and "no" targets (default: the following node). */
  next?: string
  yes?: string
  no?: string
  /** Animation step tags that light this node up (default: its id). */
  on?: string[]
}

/**
 * The version of a lesson to learn first: the same method before one optimisation
 * (e.g. the 2-D table of a DP before it is rolled into one row).
 */
export interface Variant {
  /** Short name, e.g. "Linear scan" or "2-D table". */
  label: L
  /** What this version does and what is unsatisfying about it. */
  blurb: L
  time: string
  space: string
  code: string
  notes: [tag: string, text: L][]
  /** Largest magnitude the data lab races it on. Leave out when both versions do the same amount of work. */
  maxN?: number
  /** What the lesson's own version gains, for when the complexities of the two versions read the same. */
  gain?: L
  run(inp: string, t: Tracer): void
}

export interface Lesson {
  id: string
  title: L
  level: Level
  cat: Cat
  /** Syllabus difficulty coefficient, 1–10. */
  diff: number
  blurb: L
  /** Key ideas, shown as a numbered list. */
  ideas: L[]
  /** Prose from lessons/text.ts, attached in lessons/index.ts. */
  problem?: L
  why?: L
  pitfalls?: L[]
  /** Where the problem shows up outside contests, from lessons/real.ts. */
  real?: L
  /** Hand-written extras from lessons/rich.ts: an illustrated story, a flowchart, a version to learn first. */
  story?: Card[]
  flow?: FlowNode[]
  first?: Variant
  /** Name of the lesson's own version when there is a `first` one, e.g. "Binary search". */
  label?: L
  time: string
  space: string
  /** Complete C++ program. A trailing `//@tag` marks the line a step refers to. */
  code: string
  /** Explanations attached to tagged lines. */
  notes: [tag: string, text: L][]
  /** Input format of the program above. */
  input: L
  /** Generates a test case of magnitude n in that format. */
  gen(n: number, r: Rng): string
  /** Three magnitudes that animate well. */
  sizes: [number, number, number]
  /** Magnitudes for the data lab. */
  lab: number[]
  /** Runs the algorithm on the input text, emitting steps. */
  run(inp: string, t: Tracer): void
}

export class TooLong extends Error {}

/** Records what the algorithm does. With `on = false` it only counts steps, so the same code runs on large data. */
export class Tracer {
  steps: Step[] = []
  count = 0
  output = ''
  constructor(public on: boolean, private limit = 3000) {}
  s(tag: string, f: () => [L, ...(View | false | null | undefined)[]]) {
    this.count++
    if (!this.on) return
    if (this.steps.length >= this.limit) throw new TooLong()
    const [msg, ...views] = f()
    this.steps.push({ tag, msg, views: views.filter(Boolean) as View[] })
  }
  /** Counts work that is too fine-grained to show as a step (e.g. comparisons inside a sort). */
  tick(k = 1) { this.count += k }
  out(v: unknown) { this.output = String(v) }
}

/** Deterministic PRNG (mulberry32). */
export class Rng {
  constructor(private a: number) {}
  next() {
    let t = (this.a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  /** Integer in [lo, hi]. */
  int(lo: number, hi: number) { return lo + Math.floor(this.next() * (hi - lo + 1)) }
  pick<T>(a: readonly T[]): T { return a[this.int(0, a.length - 1)] }
  shuffle<T>(a: T[]): T[] {
    for (let i = a.length - 1; i > 0; i--) { const j = this.int(0, i); [a[i], a[j]] = [a[j], a[i]] }
    return a
  }
  ints(n: number, lo: number, hi: number) { return Array.from({ length: n }, () => this.int(lo, hi)) }
}
