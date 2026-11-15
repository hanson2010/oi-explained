import type { ArrV, GEdge, GraphV, GridV, Rng, Tone, Tones, VarsV } from './types'

/* ---------- view builders (all of them snapshot their arguments) ---------- */

export const arr = (name: string, v: readonly (number | string)[], tone?: Tones, ptr?: Record<string, number>, o?: Partial<ArrV>): ArrV =>
  ({ k: 'arr', name, v: v.slice(), tone, ptr, ...o })

/** tn({ act: 3, ok: [0, 1] }) → per-index tones. Later keys win. */
export function tn(spec: Partial<Record<Tone, number | readonly number[]>>): Tones {
  const t: Tones = {}
  for (const k in spec) {
    const v = spec[k as Tone]!
    if (typeof v === 'number') t[v] = k as Tone
    else for (const i of v) t[i] = k as Tone
  }
  return t
}

/** Inclusive integer range. */
export const span = (a: number, b: number) => { const r: number[] = []; for (let i = a; i <= b; i++) r.push(i); return r }

export const vars = (o: Record<string, string | number | boolean>): VarsV =>
  ({ k: 'vars', items: Object.entries(o).map(([k, v]) => [k, typeof v === 'boolean' ? String(v) : v]) })

export const grid = (name: string, cells: readonly (readonly (string | number)[])[], tone?: Record<string, Tone>, o?: Partial<GridV>): GridV =>
  ({ k: 'grid', name, cells: cells.map(r => r.slice()), tone, ...o })

/** gt({ act: [[1, 2]], ok: [[0, 0], [0, 1]] }) → per-cell tones. */
export function gt(spec: Partial<Record<Tone, readonly (readonly [number, number])[]>>): Record<string, Tone> {
  const t: Record<string, Tone> = {}
  for (const k in spec) for (const [r, c] of spec[k as Tone]!) t[r + ',' + c] = k as Tone
  return t
}

export const INF = 1e9
export const inf = (x: number) => (x >= INF ? '∞' : x)

/* ---------- input ---------- */

export function reader(inp: string) {
  const tk = inp.split(/\s+/).filter(Boolean)
  let p = 0
  const str = () => {
    if (p >= tk.length) throw new Error('Input ended too early. / 输入数据不足。')
    return tk[p++]
  }
  const int = () => {
    const s = str(), x = Number(s)
    if (!Number.isFinite(x)) throw new Error(`"${s}" is not a number. / “${s}” 不是数字。`)
    return x
  }
  return { str, int, ints: (n: number) => Array.from({ length: n }, int) }
}

export function need(ok: boolean, en: string, zh: string): asserts ok {
  if (!ok) throw new Error(`${en} / ${zh}`)
}

/* ---------- graphs ---------- */

export interface P { x: number; y: number }
export type E = [u: number, v: number, w: number]

/** Reads "n m" then m lines "u v [w]" (1-indexed) into 0-indexed edges. */
export function readGraph(inp: string, weighted = false) {
  const rd = reader(inp)
  const n = rd.int(), m = rd.int()
  need(n >= 1 && m >= 0, 'n must be at least 1.', 'n 至少为 1。')
  const es: E[] = []
  for (let i = 0; i < m; i++) {
    const u = rd.int() - 1, v = rd.int() - 1, w = weighted ? rd.int() : 1
    need(u >= 0 && u < n && v >= 0 && v < n, `Vertex out of range on edge ${i + 1}.`, `第 ${i + 1} 条边的顶点编号越界。`)
    es.push([u, v, w])
  }
  return { n, m, es, rd }
}

/** Adjacency lists of [neighbour, weight, edge index]. */
export function adjOf(n: number, es: readonly E[], directed = false) {
  const g: [number, number, number][][] = Array.from({ length: n }, () => [])
  es.forEach(([u, v, w], i) => { g[u].push([v, w, i]); if (!directed) g[v].push([u, w, i]) })
  return g
}

export const toEdges = (es: readonly E[], weighted = false, dir = false): GEdge[] =>
  es.map(([u, v, w]) => ({ u, v, w: weighted ? w : undefined, dir }))

function fit(p: P[]): P[] {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity
  for (const q of p) if (q) { x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x); y0 = Math.min(y0, q.y); y1 = Math.max(y1, q.y) }
  return p.map(q => q && ({ x: x1 > x0 ? (q.x - x0) / (x1 - x0) : 0.5, y: y1 > y0 ? (q.y - y0) / (y1 - y0) : 0.5 }))
}

/** Deterministic force-directed layout, normalised to the unit square. */
export function layoutGraph(n: number, es: readonly (readonly [number, number, ...unknown[]])[]): P[] {
  const p: P[] = Array.from({ length: n }, (_, i) => ({ x: Math.cos((2 * Math.PI * i) / n - 2.2), y: Math.sin((2 * Math.PI * i) / n - 2.2) }))
  if (n <= 3) return fit(p)
  const k = 1.7 / Math.sqrt(n), IT = 260
  for (let it = 0; it < IT; it++) {
    const d = p.map(() => ({ x: 0, y: 0 }))
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const dx = p[i].x - p[j].x, dy = p[i].y - p[j].y, r = Math.max(Math.hypot(dx, dy), 0.02), f = (k * k) / r / r
      d[i].x += dx * f; d[i].y += dy * f; d[j].x -= dx * f; d[j].y -= dy * f
    }
    for (const [u, v] of es) {
      if (u === v) continue
      const dx = p[u].x - p[v].x, dy = p[u].y - p[v].y, f = Math.hypot(dx, dy) / k
      d[u].x -= dx * f; d[u].y -= dy * f; d[v].x += dx * f; d[v].y += dy * f
    }
    const temp = 0.25 * (1 - it / IT) + 0.005
    for (let i = 0; i < n; i++) {
      d[i].x -= p[i].x * 0.4; d[i].y -= p[i].y * 0.4
      const r = Math.hypot(d[i].x, d[i].y) || 1, s = Math.min(r, temp) / r
      p[i].x += d[i].x * s; p[i].y += d[i].y * s
    }
  }
  return fit(p)
}

/** Tidy layout of a forest given parent[] (root: -1 or itself). Absent nodes: parent = -2. */
export function layoutForest(parent: readonly number[]): P[] {
  const n = parent.length, ch: number[][] = Array.from({ length: n }, () => [])
  const roots: number[] = []
  for (let i = 0; i < n; i++) {
    if (parent[i] === -2) continue
    if (parent[i] < 0 || parent[i] === i) roots.push(i); else ch[parent[i]].push(i)
  }
  const p: P[] = []
  let leaf = 0
  const go = (u: number, d: number) => {
    if (!ch[u].length) { p[u] = { x: leaf++, y: d }; return }
    for (const c of ch[u]) go(c, d + 1)
    p[u] = { x: (p[ch[u][0]].x + p[ch[u][ch[u].length - 1]].x) / 2, y: d }
  }
  for (const r of roots) { go(r, 0); leaf += 0.4 }
  return fit(p)
}

/** Tidy layout of the tree with the given undirected edges, rooted at root. */
export function layoutTree(n: number, es: readonly (readonly [number, number, ...unknown[]])[], root = 0): P[] {
  return layoutForest(parentsOf(n, es, root))
}

export function parentsOf(n: number, es: readonly (readonly [number, number, ...unknown[]])[], root = 0): number[] {
  const g: number[][] = Array.from({ length: n }, () => [])
  for (const [u, v] of es) { g[u].push(v); g[v].push(u) }
  const par = new Array<number>(n).fill(-2), q = [root]
  par[root] = -1
  for (let h = 0; h < q.length; h++) for (const v of g[q[h]]) if (par[v] === -2) { par[v] = q[h]; q.push(v) }
  return par
}

/** Layout of a binary tree: x = in-order rank, y = depth. lc/rc return a negative id for "no child". */
export function layoutBin(root: number | readonly number[], lc: (i: number) => number, rc: (i: number) => number): P[] {
  const p: P[] = []
  let k = 0
  const go = (u: number, d: number) => {
    if (u < 0 || p[u]) return
    go(lc(u), d + 1); p[u] = { x: k++, y: d }; go(rc(u), d + 1)
  }
  for (const r of typeof root === 'number' ? [root] : root) { go(r, 0); k += 0.5 }
  return fit(p)
}

interface GOpt {
  name?: string
  tone?: Tones
  /** Tone per edge index. */
  et?: Tones
  /** Small caption next to each node (distance, dfn, …). */
  sub?: readonly (string | number | undefined)[]
  label?: readonly (string | number | undefined)[]
  /** Added to node ids to form default labels (default 1: OI-style numbering). */
  base?: number
  small?: boolean
}

export function graph(pos: readonly (P | undefined)[], edges: readonly GEdge[], o: GOpt = {}): GraphV {
  const nodes = []
  for (let i = 0; i < pos.length; i++) {
    const q = pos[i]
    if (!q) continue
    const sub = o.sub?.[i]
    nodes.push({ id: i, x: q.x, y: q.y, label: String(o.label?.[i] ?? i + (o.base ?? 1)), tone: o.tone?.[i], sub: sub === undefined ? undefined : String(sub) })
  }
  return {
    k: 'graph', name: o.name, small: o.small, nodes,
    edges: edges.map((e, i) => ({ ...e, tone: o.et?.[i] ?? e.tone })).filter(e => pos[e.u] && pos[e.v]),
  }
}

/** Binary min-heap ordered by `less` — the stand-in for std::priority_queue. */
export class Heap<T> {
  a: T[] = []
  constructor(private less: (x: T, y: T) => boolean) {}
  get size() { return this.a.length }
  push(x: T) {
    const a = this.a
    let i = a.push(x) - 1
    while (i > 0) { const p = (i - 1) >> 1; if (!this.less(a[i], a[p])) break; [a[i], a[p]] = [a[p], a[i]]; i = p }
  }
  pop(): T {
    const a = this.a, top = a[0], last = a.pop()!
    if (a.length) {
      a[0] = last
      for (let i = 0; ;) {
        let c = 2 * i + 1
        if (c >= a.length) break
        if (c + 1 < a.length && this.less(a[c + 1], a[c])) c++
        if (!this.less(a[c], a[i])) break
        [a[i], a[c]] = [a[c], a[i]]; i = c
      }
    }
    return top
  }
}

/* ---------- generators ---------- */

/** Random tree on 0..n-1 with parent < child, as [parent, child] pairs. */
export function genTree(n: number, r: Rng): [number, number][] {
  const es: [number, number][] = []
  for (let i = 1; i < n; i++) es.push([r.int(Math.floor((i - 1) / 2), i - 1), i])
  return es
}

/** Connected simple graph with about m edges; extra edges join nearby ids so drawings stay readable. */
export function genGraph(n: number, m: number, r: Rng): [number, number][] {
  const es = genTree(n, r), seen = new Set(es.map(([u, v]) => u * n + v))
  for (let tries = 0; es.length < m && tries < m * 6; tries++) {
    const u = r.int(0, n - 2), v = Math.min(n - 1, u + r.int(1, 4))
    if (u === v || seen.has(u * n + v)) continue
    seen.add(u * n + v); es.push([u, v])
  }
  return es
}

export const fmtGraph = (n: number, es: readonly (readonly number[])[], tail = '') =>
  `${n} ${es.length}\n` + es.map(e => [e[0] + 1, e[1] + 1, ...e.slice(2)].join(' ')).join('\n') + (tail ? '\n' + tail : '') + '\n'
