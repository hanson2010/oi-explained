/**
 * Independent reference checks. Each one re-derives the answer by brute force
 * (or verifies a certificate) without sharing code with the lesson.
 */
export interface Oracle { check(input: string, output: string): true | string; min?: number; max?: number }

const nums = (s: string) => s.split(/\s+/).filter(Boolean).map(Number)
const toks = (s: string) => s.split(/\s+/).filter(Boolean)
const same = (want: unknown, got: string): true | string => {
  const w = Array.isArray(want) ? want.join(' ') : String(want)
  return toks(w).join(' ') === toks(got).join(' ') ? true : `expected ${w}`
}
const sorted = (skip: number): Oracle => ({ check: (i, o) => same(nums(i).slice(skip).sort((a, b) => a - b), o) })

export const ORACLES: Record<string, Oracle | undefined> = {
  'linked-list': { max: 60, check(i, o) {
    const d = nums(i), n = d[0], q = d[1], list = Array.from({ length: n }, (_, k) => k + 1)
    let p = 2
    for (let k = 0; k < q; k++) {
      const op = d[p], x = d[p + 1]
      list.splice(list.indexOf(x), 1)
      if (op === 1) { const y = d[p + 2]; list.splice(y === 0 ? 0 : list.indexOf(y) + 1, 0, x); p += 3 } else p += 2
    }
    return same(list, o)
  } },
  'prime-factor': { max: 9, check(i, o) {
    const n = nums(i)[0], fs = nums(o)
    const prime = (x: number) => { if (x < 2) return false; for (let d = 2; d * d <= x; d++) if (x % d === 0) return false; return true }
    if (!fs.length || !fs.every(prime)) return 'every printed number must be prime'
    if (fs.some((f, k) => k > 0 && fs[k - 1] > f)) return 'factors must be in non-decreasing order'
    return fs.reduce((a, b) => a * b, 1) === n ? true : `the product is not ${n}`
  } },
  permutations: { max: 7, check(i, o) {
    const n = nums(i)[0], a = Array.from({ length: n }, (_, k) => k + 1), res: number[] = []
    for (;;) {
      res.push(...a)
      let k = n - 2
      while (k >= 0 && a[k] > a[k + 1]) k--
      if (k < 0) break
      let j = n - 1
      while (a[j] < a[k]) j--
      ;[a[k], a[j]] = [a[j], a[k]]
      a.splice(k + 1, n, ...a.slice(k + 1).reverse())
    }
    return same(res, o)
  } },
  enumeration: { max: 60, check(i, o) {
    const n = nums(i)[0], res: number[] = []
    let cnt = 0
    for (let x = 0; x <= n; x++) for (let y = 0; x + y <= n; y++) { const z = n - x - y; if (15 * x + 9 * y + z === 3 * n) { res.push(x, y, z); cnt++ } }
    return same([...res, cnt], o)
  } },
  simulation: { max: 60, check(i, o) {
    const [n, m] = nums(i), ring = Array.from({ length: n }, (_, k) => k + 1), res: number[] = []
    let at = 0
    while (ring.length) { at = (at + m - 1) % ring.length; res.push(ring.splice(at, 1)[0]) }
    return same(res, o)
  } },
  'bignum-sub': { check: (i, o) => { const [a, b] = toks(i).map(BigInt); return same(a - b, o) } },
  'bignum-div': { check: (i, o) => { const [a, b] = toks(i).map(BigInt); return same([a / b, a % b], o) } },
  'binary-search': { check(i, o) { const [n, x, ...a] = nums(i); const k = a.findIndex(v => v >= x); return same(k < 0 ? n + 1 : k + 1, o) } },
  'prefix-sum': { check(i, o) {
    const d = nums(i), n = d[0], q = d[1], a = d.slice(2, 2 + n), res: number[] = []
    for (let k = 0; k < q; k++) { const l = d[2 + n + 2 * k], r = d[3 + n + 2 * k]; let s = 0; for (let j = l; j <= r; j++) s += a[j - 1]; res.push(s) }
    return same(res, o)
  } },
  difference: { check(i, o) {
    const d = nums(i), n = d[0], q = d[1], a = d.slice(2, 2 + n)
    for (let k = 0; k < q; k++) { const [l, r, v] = d.slice(2 + n + 3 * k); for (let j = l; j <= r; j++) a[j - 1] += v }
    return same(a, o)
  } },
  'fast-pow': { max: 16, check(i, o) { const [a, b, m] = toks(i).map(BigInt); let r = 1n % m; for (let k = 0n; k < b; k++) r = (r * a) % m; return same(r, o) } },
  hanoi: { max: 10, check(i, o) {
    const n = nums(i)[0], peg: Record<string, number[]> = { A: [], B: [], C: [] }
    for (let k = n; k >= 1; k--) peg.A.push(k)
    const moves = toks(o)
    if (moves.length !== 2 ** n - 1) return `expected ${2 ** n - 1} moves`
    for (const m of moves) {
      const [f, to] = m.split('->'), d = peg[f]?.pop()
      if (d === undefined || !peg[to] || (peg[to].length && peg[to][peg[to].length - 1] < d)) return `illegal move ${m}`
      peg[to].push(d)
    }
    return peg.C.length === n ? true : 'disks did not end on C'
  } },
  'bignum-add': { check: (i, o) => { const [a, b] = toks(i).map(BigInt); return same(a + b, o) } },
  'bignum-mul': { check: (i, o) => { const [a, b] = toks(i).map(BigInt); return same(a * b, o) } },
  'base-conversion': { max: 15, check: (i, o) => { const [n, k] = nums(i); return same(n.toString(k).toUpperCase(), o) } },
  'bubble-sort': sorted(1), 'selection-sort': sorted(1), 'insertion-sort': sorted(1), 'counting-sort': sorted(2),
  'merge-sort': sorted(1), 'quick-sort': sorted(1), 'heap-sort': sorted(1), 'radix-sort': sorted(1),

  'n-queens': { max: 11, check: (i, o) => same([1, 0, 0, 2, 10, 4, 40, 92, 352, 724, 2680][nums(i)[0] - 1], o) },
  'bfs-maze': { max: 30, check: (i, o) => same(gridDist(i), o) },
  'a-star': { max: 30, check: (i, o) => same(gridDist(i), o) },
  'flood-fill': { max: 30, check(i, o) {
    // Label propagation: every land cell takes the smallest label among itself and its neighbours until stable.
    const [n, m, ...rows] = toks(i), N = +n, M = +m, lab = rows.map((r, x) => [...r].map((c, y) => (c === '#' ? x * M + y : -1)))
    for (let ch = true; ch;) {
      ch = false
      for (let x = 0; x < N; x++) for (let y = 0; y < M; y++) if (lab[x][y] >= 0)
        for (const [a, b] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) if (lab[a]?.[b] >= 0 && lab[a][b] < lab[x][y]) { lab[x][y] = lab[a][b]; ch = true }
    }
    return same(new Set(lab.flat().filter(v => v >= 0)).size, o)
  } },

  stack: { check(i, o) { let s = toks(i)[0]; for (let p = ''; p !== s;) { p = s; s = s.replace(/\(\)|\[\]|\{\}/g, '') } return same(s ? 'No' : 'Yes', o) } },
  'bt-traversal': { max: 60, check(i, o) {
    const d = nums(i), l = (u: number) => d[2 * u - 1], r = (u: number) => d[2 * u]
    const go = (u: number, k: number): number[] => (u ? [...(k === 0 ? [u] : []), ...go(l(u), k), ...(k === 1 ? [u] : []), ...go(r(u), k), ...(k === 2 ? [u] : [])] : [])
    return same([0, 1, 2].flatMap(k => go(1, k)), o)
  } },
  huffman: { max: 60, check(i, o) { const w = nums(i).slice(1); let ans = 0; while (w.length > 1) { w.sort((a, b) => a - b); const s = w.shift()! + w.shift()!; ans += s; w.push(s) } return same(ans, o) } },
  bst: { check: (i, o) => same([...new Set(nums(i).slice(1))].sort((a, b) => a - b), o) },
  treap: { check: (i, o) => same([...new Set(nums(i).slice(1))].sort((a, b) => a - b), o) },
  'leftist-heap': sorted(1),
  'monotonic-queue': { check(i, o) { const [n, k, ...a] = nums(i), res = []; for (let s = 0; s + k <= n; s++) res.push(Math.max(...a.slice(s, s + k))); return same(res, o) } },
  'sparse-table': { check(i, o) {
    const d = nums(i), n = d[0], q = d[1], a = d.slice(2, 2 + n), res = []
    for (let k = 0; k < q; k++) res.push(Math.max(...a.slice(d[2 + n + 2 * k] - 1, d[3 + n + 2 * k])))
    return same(res, o)
  } },
  dsu: { check(i, o) {
    const d = nums(i), n = d[0], m = d[1], id = Array.from({ length: n + 1 }, (_, k) => k), res: string[] = []
    for (let k = 0; k < m; k++) {
      const [op, x, y] = d.slice(2 + 3 * k)
      if (op === 1) { const from = id[x], to = id[y]; for (let v = 1; v <= n; v++) if (id[v] === from) id[v] = to } else res.push(id[x] === id[y] ? 'Y' : 'N')
    }
    return same(res, o)
  } },
  fenwick: { check(i, o) {
    const d = nums(i), n = d[0], q = d[1], a = d.slice(2, 2 + n), res: number[] = []
    for (let k = 0; k < q; k++) {
      const [op, x, y] = d.slice(2 + n + 3 * k)
      if (op === 1) a[x - 1] += y; else res.push(a.slice(x - 1, y).reduce((s, v) => s + v, 0))
    }
    return same(res, o)
  } },
  'segment-tree': { check: rangeAdd }, 'sqrt-decomposition': { check: rangeAdd },
  'graph-dfs': { max: 60, check(i, o) {
    const { n, g } = und(i), seen = new Set<number>(), out: number[] = []
    const go = (u: number) => { seen.add(u); out.push(u); for (const v of g[u]) if (!seen.has(v)) go(v) }
    go(1)
    return n ? same(out, o) : true
  } },
  'graph-bfs': { max: 60, check(i, o) {
    const { g } = und(i), seen = new Set([1]), out: number[] = []
    for (let layer = [1]; layer.length;) { const nx: number[] = []; for (const u of layer) { out.push(u); for (const v of g[u]) if (!seen.has(v)) { seen.add(v); nx.push(v) } } layer = nx }
    return same(out, o)
  } },
  dijkstra: { max: 60, check: (i, o) => { const { n, es } = edges(i, 3); return same(bellman(n, [...es, ...es.map(([u, v, w]) => [v, u, w])], 1).slice(1).map(x => (x === Infinity ? -1 : x)), o) } },
  spfa: { max: 60, check: (i, o) => { const { n, es } = edges(i, 3); return same(bellman(n, es, 1).slice(1).map(x => (x === Infinity ? 'inf' : x)), o) } },
  floyd: { max: 30, check(i, o) {
    const { n, es } = edges(i, 3), both = [...es, ...es.map(([u, v, w]) => [v, u, w])], res: number[] = []
    for (let s = 1; s <= n; s++) res.push(...bellman(n, both, s).slice(1).map(x => (x === Infinity ? -1 : x)))
    return same(res, o)
  } },
  prim: { max: 9, check: (i, o) => same(bruteMst(i), o) },
  kruskal: { max: 9, check: (i, o) => same(bruteMst(i), o) },
  'topo-sort': { check(i, o) {
    const { n, es } = edges(i, 2), ord = nums(o), at = new Map(ord.map((v, k) => [v, k]))
    if (ord.length !== n || at.size !== n || ord.some(v => v < 1 || v > n)) return 'not a permutation of the vertices'
    const bad = es.find(([u, v]) => at.get(u)! > at.get(v)!)
    return bad ? `edge ${bad[0]} -> ${bad[1]} points backwards` : true
  } },
  bipartite: { max: 12, check(i, o) {
    const { n, es } = edges(i, 2)
    let ok = false
    for (let mask = 0; mask < 1 << n && !ok; mask++) ok = es.every(([u, v]) => ((mask >> (u - 1)) & 1) !== ((mask >> (v - 1)) & 1))
    return same(ok ? 'Yes' : 'No', o)
  } },
  'tarjan-scc': { max: 40, check(i, o) {
    const { n, es } = edges(i, 2), r = Array.from({ length: n + 1 }, (_, a) => Array.from({ length: n + 1 }, (_, b) => a === b))
    for (const [u, v] of es) r[u][v] = true
    for (let k = 1; k <= n; k++) for (let a = 1; a <= n; a++) if (r[a][k]) for (let b = 1; b <= n; b++) if (r[k][b]) r[a][b] = true
    let cnt = 0
    for (let a = 1; a <= n; a++) { let first = true; for (let b = 1; b < a; b++) if (r[a][b] && r[b][a]) first = false; if (first) cnt++ }
    return same(cnt, o)
  } },
  'cut-bridge': { max: 30, check(i, o) {
    const { n, es } = edges(i, 2)
    const comps = (skipV: number, skipE: number) => {
      const id = Array.from({ length: n + 1 }, (_, k) => k)
      for (let ch = true; ch;) { ch = false; es.forEach(([u, v], k) => { if (k !== skipE && u !== skipV && v !== skipV && id[u] !== id[v]) { id[u] = id[v] = Math.min(id[u], id[v]); ch = true } }) }
      return new Set(id.slice(1).filter((_, k) => k + 1 !== skipV)).size
    }
    const base = comps(0, -1)
    let cuts = 0, bridges = 0
    for (let v = 1; v <= n; v++) if (comps(v, -1) > base - (es.some(e => e.includes(v)) ? 0 : 1)) cuts++
    for (let e = 0; e < es.length; e++) if (comps(0, e) > base) bridges++
    return same([cuts, bridges], o)
  } },
  lca: { max: 60, check: naiveLca }, hld: { max: 60, check: naiveLca },
  'tree-diameter': { max: 60, check(i, o) {
    const d = nums(i), n = d[0], es = Array.from({ length: n - 1 }, (_, k) => [d[1 + 2 * k], d[2 + 2 * k], 1])
    let best = 0
    for (let s = 1; s <= n; s++) best = Math.max(best, ...bellman(n, [...es, ...es.map(([u, v, w]) => [v, u, w])], s).slice(1))
    return same(best, o)
  } },
  dinic: { max: 10, check(i, o) {
    // Max-flow = min-cut: try every set containing the source but not the sink.
    const { n, es } = edges(i, 3)
    if (n === 1) return same(0, o)
    let best = Infinity
    for (let mask = 0; mask < 1 << n; mask++) if ((mask & 1) && !((mask >> (n - 1)) & 1)) best = Math.min(best, es.reduce((s, [u, v, c]) => s + (((mask >> (u - 1)) & 1) && !((mask >> (v - 1)) & 1) ? c : 0), 0))
    return same(best, o)
  } },
  hungarian: { max: 8, check(i, o) {
    const [nl, nr, m, ...r] = nums(i), adj = Array.from({ length: nl + 1 }, () => 0)
    for (let k = 0; k < m; k++) adj[r[2 * k]] |= 1 << (r[2 * k + 1] - 1)
    let dp = new Map<number, number>([[0, 0]])
    for (let u = 1; u <= nl; u++) {
      const nx = new Map(dp)
      for (const [mask, c] of dp) for (let v = 0; v < nr; v++) if ((adj[u] >> v) & 1 && !((mask >> v) & 1)) nx.set(mask | (1 << v), Math.max(nx.get(mask | (1 << v)) ?? 0, c + 1))
      dp = nx
    }
    return same(Math.max(...dp.values()), o)
  } },
  lis: { max: 14, check(i, o) {
    const a = nums(i).slice(1)
    let best = 0
    for (let mask = 1; mask < 1 << a.length; mask++) { const s = a.filter((_, k) => (mask >> k) & 1); if (s.every((v, k) => k === 0 || s[k - 1] < v)) best = Math.max(best, s.length) }
    return same(best, o)
  } },
  knapsack: { max: 12, check(i, o) {
    const [n, W, ...r] = nums(i)
    let best = 0
    for (let mask = 0; mask < 1 << n; mask++) { let w = 0, v = 0; for (let k = 0; k < n; k++) if ((mask >> k) & 1) { w += r[2 * k]; v += r[2 * k + 1] } if (w <= W) best = Math.max(best, v) }
    return same(best, o)
  } },
  'interval-dp': { max: 7, check(i, o) {
    // Try every order of merging adjacent piles.
    const go = (a: number[]): number => (a.length === 1 ? 0 : Math.min(...a.slice(1).map((_, k) => a[k] + a[k + 1] + go([...a.slice(0, k), a[k] + a[k + 1], ...a.slice(k + 2)]))))
    return same(go(nums(i).slice(1)), o)
  } },
  lcs: { max: 12, check(i, o) {
    const [a, b] = toks(i)
    let best = 0
    for (let mask = 0; mask < 1 << a.length; mask++) {
      const s = [...a].filter((_, k) => (mask >> k) & 1)
      let p = 0
      for (const ch of b) if (p < s.length && s[p] === ch) p++
      if (p === s.length) best = Math.max(best, s.length)
    }
    return same(best, o)
  } },
  'tree-dp': { max: 14, check(i, o) {
    const d = nums(i), n = d[0], w = d.slice(1, 1 + n), es = Array.from({ length: n - 1 }, (_, k) => [d[1 + n + 2 * k] - 1, d[2 + n + 2 * k] - 1])
    let best = 0
    for (let mask = 0; mask < 1 << n; mask++) if (es.every(([u, v]) => !((mask >> u) & 1 && (mask >> v) & 1))) best = Math.max(best, w.reduce((s, x, k) => s + ((mask >> k) & 1 ? x : 0), 0))
    return same(best, o)
  } },
  'bitmask-dp': { max: 8, check(i, o) {
    const [n, ...r] = nums(i), d = (a: number, b: number) => r[a * n + b]
    let best = Infinity
    const go = (at: number, used: number, cost: number) => { if (used === (1 << n) - 1) { best = Math.min(best, cost + d(at, 0)); return } for (let j = 0; j < n; j++) if (!((used >> j) & 1)) go(j, used | (1 << j), cost + d(at, j)) }
    go(0, 1, 0)
    return same(best, o)
  } },

  kmp: { max: 200, check(i, o) { const [s, p] = toks(i), res: number[] = []; for (let k = 0; k + p.length <= s.length; k++) if (s.startsWith(p, k)) res.push(k + 1); return same(res, o) } },
  manacher: { max: 60, check(i, o) {
    const s = toks(i)[0]
    let best = 0
    for (let a = 0; a < s.length; a++) for (let b = a + 1; b <= s.length; b++) { const x = s.slice(a, b); if (x === [...x].reverse().join('')) best = Math.max(best, x.length) }
    return same(best, o)
  } },
  'z-function': { max: 200, check(i, o) { const s = toks(i)[0]; return same([...s].map((_, k) => { let z = 0; while (k + z < s.length && s[z] === s[k + z]) z++; return z }), o) } },
  'ac-automaton': { max: 60, check(i, o) {
    const [n, ...r] = toks(i), text = r[+n]
    let total = 0
    for (const p of r.slice(0, +n)) for (let k = 0; k + p.length <= text.length; k++) if (text.startsWith(p, k)) total++
    return same(total, o)
  } },
  'suffix-array': { max: 200, check(i, o) { const s = toks(i)[0]; return same([...s].map((_, k) => k).sort((a, b) => (s.slice(a) < s.slice(b) ? -1 : 1)).map(k => k + 1), o) } },

  gcd: { max: 5, check(i, o) { const [a, b] = nums(i); let g = Math.max(a, b); while (g > 1 && (a % g || b % g)) g--; return same(g, o) } },
  exgcd: { check(i, o) {
    const [a, b] = toks(i).map(BigInt), [x, y, g] = toks(o).map(BigInt)
    if (a * x + b * y !== g) return 'a*x + b*y != g'
    if (g <= 0n || a % g !== 0n || b % g !== 0n) return 'g is not a common divisor'
    // g is a positive common divisor and an integer combination of a and b, hence the greatest one.
    return true
  } },
  sieve: { max: 5000, check: (i, o) => same(countPrimes(nums(i)[0]), o) },
  'linear-sieve': { max: 5000, check: (i, o) => same(countPrimes(nums(i)[0]), o) },
  pascal: { max: 100, check(i, o) {
    const n = nums(i)[0], fact = (k: number) => { let f = 1n; for (let x = 2n; x <= BigInt(k); x++) f *= x; return f }
    return same(Array.from({ length: n + 1 }, (_, k) => (fact(n) / fact(k) / fact(n - k)) % 1000000007n), o)
  } },
  gauss: { max: 6, check(i, o) {
    const [n, ...r] = nums(i), a = Array.from({ length: n }, (_, k) => r.slice(k * (n + 1), (k + 1) * (n + 1)))
    const det = (m: number[][]): number => (m.length === 1 ? m[0][0] : m[0].reduce((s, v, j) => s + (j % 2 ? -1 : 1) * v * det(m.slice(1).map(row => row.filter((_, c) => c !== j))), 0))
    const singular = det(a.map(row => row.slice(0, n))) === 0
    if (o.includes('No')) return singular ? true : 'the system has a unique solution'
    if (singular) return 'expected No Solution'
    const x = nums(o)
    // The answer is rounded to 2 decimals, so allow the residual that rounding can cause.
    const bad = a.find(row => Math.abs(row.slice(0, n).reduce((s, v, j) => s + v * x[j], 0) - row[n]) > 0.005 * row.slice(0, n).reduce((s, v) => s + Math.abs(v), 0) + 1e-6)
    return bad ? 'A·x differs from b' : true
  } },
  'nim-sg': { max: 12, check(i, o) {
    const d = nums(i), m = d[0], mv = d.slice(1, 1 + m), piles = d.slice(2 + m, 2 + m + d[1 + m]), memo = new Map<string, boolean>()
    const win = (p: number[]): boolean => {
      const key = p.join(',')
      if (!memo.has(key)) memo.set(key, p.some((x, k) => mv.some(t => x >= t && !win(p.map((y, j) => (j === k ? y - t : y))))))
      return memo.get(key)!
    }
    return same(win(piles) ? 'First' : 'Second', o)
  } },
  'convex-hull': { max: 14, check(i, o) {
    const d = nums(i), pts = [...new Set(Array.from({ length: d[0] }, (_, k) => d[1 + 2 * k] + ',' + d[2 + 2 * k]))].map(s => s.split(',').map(Number))
    const cr = (a: number[], b: number[], c: number[]) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
    const between = (a: number[], b: number[], p: number[]) => cr(a, b, p) === 0 && Math.min(a[0], b[0]) <= p[0] && p[0] <= Math.max(a[0], b[0]) && Math.min(a[1], b[1]) <= p[1] && p[1] <= Math.max(a[1], b[1])
    // A point is a hull vertex unless it lies on a segment or in a triangle spanned by other points.
    const vertex = pts.filter(p => {
      const rest = pts.filter(q => q !== p)
      for (const a of rest) for (const b of rest) { if (a !== b && between(a, b, p)) return false; for (const c of rest) { const s = [cr(a, b, p), cr(b, c, p), cr(c, a, p)]; if (cr(a, b, c) !== 0 && (s.every(v => v >= 0) || s.every(v => v <= 0))) return false } }
      return true
    })
    const cx = vertex.reduce((s, p) => s + p[0], 0) / vertex.length, cy = vertex.reduce((s, p) => s + p[1], 0) / vertex.length
    vertex.sort((a, b) => Math.atan2(a[1] - cy, a[0] - cx) - Math.atan2(b[1] - cy, b[0] - cx))
    const area2 = vertex.length < 3 ? 0 : Math.abs(vertex.reduce((s, p, k) => { const q = vertex[(k + 1) % vertex.length]; return s + p[0] * q[1] - p[1] * q[0] }, 0))
    return same([vertex.length, area2], o)
  } },
  prufer: { max: 60, check(i, o) {
    const d = nums(i), n = d[0], adj = Array.from({ length: n + 1 }, () => new Set<number>()), res: number[] = []
    for (let k = 0; k < n - 1; k++) { adj[d[1 + 2 * k]].add(d[2 + 2 * k]); adj[d[2 + 2 * k]].add(d[1 + 2 * k]) }
    for (let k = 0; k < n - 2; k++) { let u = 1; while (adj[u].size !== 1) u++; const v = [...adj[u]][0]; res.push(v); adj[u].clear(); adj[v].delete(u) }
    return same(res, o)
  } },
  trie: { check(i, o) { const [n, q, ...w] = toks(i), words = w.slice(0, +n); return same(w.slice(+n, +n + +q).map(s => words.filter(x => x.startsWith(s)).length), o) } },
}

function countPrimes(n: number) {
  let c = 0
  for (let x = 2; x <= n; x++) { let p = true; for (let d = 2; d * d <= x; d++) if (x % d === 0) { p = false; break } if (p) c++ }
  return c
}
/** "n m" followed by m edges of `width` numbers each (1-indexed). */
function edges(i: string, width: number) {
  const d = nums(i), n = d[0], m = d[1]
  return { n, es: Array.from({ length: m }, (_, k) => d.slice(2 + width * k, 2 + width * (k + 1))) }
}
function und(i: string) {
  const { n, es } = edges(i, 2), g: number[][] = Array.from({ length: n + 1 }, () => [])
  for (const [u, v] of es) { g[u].push(v); g[v].push(u) }
  return { n, g }
}
/** Bellman-Ford over directed edges [u, v, w]; unreachable = Infinity. */
function bellman(n: number, es: number[][], s: number) {
  const d = new Array<number>(n + 1).fill(Infinity)
  d[s] = 0
  for (let r = 0; r < n; r++) for (const [u, v, w] of es) if (d[u] + w < d[v]) d[v] = d[u] + w
  return d
}
/** Cheapest set of n − 1 edges that connects everything, by trying every subset. */
function bruteMst(i: string) {
  const { n, es } = edges(i, 3)
  let best = Infinity
  for (let mask = 0; mask < 1 << es.length; mask++) {
    const pick = es.filter((_, k) => (mask >> k) & 1)
    if (pick.length !== n - 1) continue
    const id = Array.from({ length: n + 1 }, (_, k) => k)
    for (let ch = true; ch;) { ch = false; for (const [u, v] of pick) if (id[u] !== id[v]) { id[u] = id[v] = Math.min(id[u], id[v]); ch = true } }
    if (new Set(id.slice(1)).size === 1) best = Math.min(best, pick.reduce((s, e) => s + e[2], 0))
  }
  return best
}
/** LCA by collecting the ancestors of u and climbing from v. */
function naiveLca(i: string, o: string) {
  const d = nums(i), n = d[0], q = d[1], g: number[][] = Array.from({ length: n + 1 }, () => [])
  for (let k = 0; k < n - 1; k++) { g[d[2 + 2 * k]].push(d[3 + 2 * k]); g[d[3 + 2 * k]].push(d[2 + 2 * k]) }
  const par = new Array<number>(n + 1).fill(-1)
  par[1] = 0
  for (const st = [1]; st.length;) { const u = st.pop()!; for (const v of g[u]) if (par[v] < 0) { par[v] = u; st.push(v) } }
  const res: number[] = []
  for (let k = 0; k < q; k++) {
    const anc = new Set<number>()
    for (let u = d[2 * n + 2 * k]; u; u = par[u]) anc.add(u)
    let v = d[2 * n + 1 + 2 * k]
    while (!anc.has(v)) v = par[v]
    res.push(v)
  }
  return same(res, o)
}

/** Shortest 4-connected path from the top-left to the bottom-right cell by repeated relaxation (no queue). */
function gridDist(i: string) {
  const [n, m, ...rows] = toks(i), N = +n, M = +m, d = rows.map(r => [...r].map(() => Infinity))
  d[0][0] = 0
  for (let ch = true; ch;) {
    ch = false
    for (let x = 0; x < N; x++) for (let y = 0; y < M; y++) if (rows[x][y] === '.')
      for (const [a, b] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) if (d[a]?.[b] + 1 < d[x][y]) { d[x][y] = d[a][b] + 1; ch = true }
  }
  return Number.isFinite(d[N - 1][M - 1]) ? d[N - 1][M - 1] : -1
}

/** Range add / range sum, done element by element. */
function rangeAdd(i: string, o: string) {
  const d = nums(i), n = d[0], q = d[1], a = d.slice(2, 2 + n), res: number[] = []
  let p = 2 + n
  for (let k = 0; k < q; k++) {
    const op = d[p], l = d[p + 1], r = d[p + 2]
    if (op === 1) { for (let j = l; j <= r; j++) a[j - 1] += d[p + 3]; p += 4 } else { res.push(a.slice(l - 1, r).reduce((s, v) => s + v, 0)); p += 3 }
  }
  return same(res, o)
}
