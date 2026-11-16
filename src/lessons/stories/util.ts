import type { GEdge } from '../../engine/types'
import { layoutBin, type P } from '../../engine/h'

/** Cells (r, a) … (r, b) of a grid, for gt(). */
export const row = (r: number, a: number, b: number): [number, number][] => {
  const c: [number, number][] = []
  for (let i = a; i <= b; i++) c.push([r, i])
  return c
}

/** Cells (a, c) … (b, c) of a grid, for gt(). */
export const col = (c: number, a: number, b: number): [number, number][] => {
  const r: [number, number][] = []
  for (let i = a; i <= b; i++) r.push([i, c])
  return r
}

/** Undirected edges from [u, v] or [u, v, w] tuples (0-indexed). */
export const ed = (es: readonly (readonly [number, number, (number | string)?])[], dir = false): GEdge[] =>
  es.map(([u, v, w]) => ({ u, v, w, dir }))

/** Hand-placed node positions on a small grid: "x,y" pairs scaled to the unit square. */
export const at = (pts: readonly (readonly [number, number])[]): P[] => {
  const mx = Math.max(1, ...pts.map(p => p[0])), my = Math.max(1, ...pts.map(p => p[1]))
  return pts.map(([x, y]) => ({ x: x / mx, y: y / my }))
}

/** A complete binary tree of n nodes stored in an array (children of i: 2i + 1 and 2i + 2). */
export const heapTree = (n: number) => ({
  pos: layoutBin(0, i => (2 * i + 1 < n ? 2 * i + 1 : -1), i => (2 * i + 2 < n ? 2 * i + 2 : -1)),
  edges: Array.from({ length: n - 1 }, (_, k): GEdge => ({ u: k >> 1, v: k + 1 })),
})
