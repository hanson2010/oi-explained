import type { FlowNode } from '../engine/types'
import { useApp } from '../store'

const W = 250, GAP = 30, LANE = 18, SIDE = 26

/** Rough number of text lines a label needs inside a node (CJK glyphs count double). */
function lines(s: string) {
  let w = 0
  for (const ch of s) w += ch.charCodeAt(0) > 0x2e7f ? 2 : 1
  return Math.max(1, Math.ceil(w / 30))
}

interface Edge { from: number; to: number; label?: string }

/**
 * A top-to-bottom flowchart. Edges to the following node are straight arrows;
 * jumps back run down the left side and jumps forward down the right side.
 */
export function Flow({ nodes, active }: { nodes: FlowNode[]; active?: string }) {
  const { tr, p } = useApp()
  const yes = p.lang === 'zh' ? '是' : 'yes', no = p.lang === 'zh' ? '否' : 'no'
  const at = new Map(nodes.map((n, i) => [n.id, i]))
  const text = nodes.map(n => tr(n.text))
  const h = nodes.map((n, i) => (n.kind === 'test' ? 26 : 18) + lines(text[i]) * 19)
  const y: number[] = []
  nodes.reduce((acc, _, i) => { y[i] = acc; return acc + h[i] + GAP }, 8)

  const edges: Edge[] = []
  nodes.forEach((n, i) => {
    if (n.kind === 'end') return
    const follow = i + 1 < nodes.length ? i + 1 : undefined
    const add = (id: string | undefined, label?: string) => { const to = id === undefined ? follow : at.get(id); if (to !== undefined) edges.push({ from: i, to, label }) }
    if (n.kind === 'test') { add(n.yes, yes); add(n.no, no) } else add(n.next)
  })
  // Longer jumps take outer lanes so that arcs nest instead of crossing.
  const side = (e: Edge) => (e.to === e.from + 1 ? 0 : e.to <= e.from ? -1 : 1)
  const lane = new Map<Edge, number>()
  for (const s of [-1, 1]) edges.filter(e => side(e) === s).sort((a, b) => Math.abs(a.to - a.from) - Math.abs(b.to - b.from)).forEach((e, k) => lane.set(e, k))
  const lanes = (s: number) => edges.filter(e => side(e) === s).length
  const left = SIDE + lanes(-1) * LANE + 8, cx = left + W / 2
  const width = left + W + SIDE + lanes(1) * LANE + 8, height = y[nodes.length - 1] + h[nodes.length - 1] + 10

  return (
    <svg className="flow" viewBox={`0 0 ${width} ${height}`} style={{ maxWidth: width * 1.25 }} role="img">
      <defs>
        <marker id="flow-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 10 5 0 10z" className="flow-head" /></marker>
      </defs>
      {edges.map((e, k) => {
        const s = side(e)
        if (s === 0) {
          const y1 = y[e.from] + h[e.from], y2 = y[e.to]
          return <g key={k}><path className="flow-edge" d={`M${cx} ${y1}V${y2}`} markerEnd="url(#flow-arrow)" />{e.label && <text className="flow-label" x={cx + 8} y={(y1 + y2) / 2 + 4}>{e.label}</text>}</g>
        }
        const x0 = cx + (s * W) / 2, x1 = x0 + s * (SIDE + lane.get(e)! * LANE), ya = y[e.from] + h[e.from] / 2, yb = y[e.to] + h[e.to] / 2 + (s < 0 ? 0 : -6)
        return (
          <g key={k}>
            <path className="flow-edge" d={`M${x0} ${ya}H${x1}V${yb}H${x0}`} markerEnd="url(#flow-arrow)" />
            {e.label && <text className="flow-label" x={x0 + s * 6} y={ya - 5} textAnchor={s < 0 ? 'end' : 'start'}>{e.label}</text>}
          </g>
        )
      })}
      {nodes.map((n, i) => {
        const on = active !== undefined && (n.on ?? [n.id]).includes(active)
        const x = cx - W / 2, k = n.kind ?? 'step'
        return (
          <g key={n.id} className={`flow-node k-${k}${on ? ' on' : ''}`}>
            {k === 'test'
              ? <polygon points={`${x + 16},${y[i]} ${x + W - 16},${y[i]} ${x + W},${y[i] + h[i] / 2} ${x + W - 16},${y[i] + h[i]} ${x + 16},${y[i] + h[i]} ${x},${y[i] + h[i] / 2}`} />
              : <rect x={x} y={y[i]} width={W} height={h[i]} rx={k === 'step' ? 8 : h[i] / 2} />}
            <foreignObject x={x + 14} y={y[i]} width={W - 28} height={h[i]}><div className="flow-text">{text[i]}</div></foreignObject>
          </g>
        )
      })}
    </svg>
  )
}
