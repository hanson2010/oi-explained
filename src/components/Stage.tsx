import type { ArrV, GraphV, GridV, VarsV, View } from '../engine/types'

function ArrView({ a }: { a: ArrV }) {
  const n = a.v.length
  const longest = a.v.reduce<number>((m, x) => Math.max(m, String(x).length), 1)
  const w = Math.max(n <= 10 ? 46 : n <= 16 ? 38 : n <= 24 ? 31 : 26, longest * 9 + 14)
  const max = a.bars ? Math.max(1, ...a.v.map(x => Math.abs(Number(x)) || 0)) : 1
  const ptrs: string[][] = Array.from({ length: n }, () => [])
  if (a.ptr) for (const [name, i] of Object.entries(a.ptr)) if (i >= 0 && i < n) ptrs[i].push(name)
  const hasPtr = !!a.ptr && Object.keys(a.ptr).length > 0
  return (
    <div className="view">
      {a.name && <div className="view-name">{a.name}</div>}
      <div className="arr-scroll">
        <div style={{ width: n * w }}>
          <div className={'arr-cells' + (a.bars ? ' bars' : '')}>
            {a.v.map((x, i) => (
              <div key={a.ids ? a.ids[i] : i} className={'cell t-' + (a.tone?.[i] ?? 'none')} style={{ width: w, transform: `translateX(${i * w}px)` }}>
                {a.bars
                  ? <><span className="bar-num">{x}</span><span className="bar" style={{ height: 10 + (96 * Math.abs(Number(x) || 0)) / max }} /></>
                  : <span className="box">{x}</span>}
              </div>
            ))}
          </div>
          <div className="arr-idx">
            {a.v.map((_, i) => <span key={i} style={{ width: w }}>{i + (a.base ?? 0) < 0 ? '' : i + (a.base ?? 0)}</span>)}
          </div>
          {hasPtr && (
            <div className="arr-ptr">
              {ptrs.map((p, i) => <span key={i} style={{ width: w }}>{p.length > 0 && <><i>▲</i>{p.join(',')}</>}</span>)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const GW = 640, GH = 380

function GraphView({ g }: { g: GraphV }) {
  const r = g.small ? 6 : g.nodes.length > 14 ? 14 : 17
  const pad = g.small ? 24 : 38
  const at = new Map(g.nodes.map(nd => [nd.id, { x: pad + nd.x * (GW - 2 * pad), y: pad + nd.y * (GH - 2 * pad) }]))
  const both = new Set(g.edges.filter(e => e.dir).map(e => e.u + '>' + e.v))
  return (
    <div className="view">
      {g.name && <div className="view-name">{g.name}</div>}
      <svg className="graph" viewBox={`0 0 ${GW} ${GH}`} role="img">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 10 5 0 10z" fill="context-stroke" />
          </marker>
        </defs>
        {g.edges.map((e, i) => {
          const a = at.get(e.u), b = at.get(e.v)
          if (!a || !b || e.u === e.v) return null
          const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len
          const off = e.dir && both.has(e.v + '>' + e.u) ? 6 : 0
          const ox = -uy * off, oy = ux * off
          const x1 = a.x + ux * r + ox, y1 = a.y + uy * r + oy, x2 = b.x - ux * (r + (e.dir ? 2 : 0)) + ox, y2 = b.y - uy * (r + (e.dir ? 2 : 0)) + oy
          const side = off ? 1 : (ux >= 0 ? 1 : -1)
          return (
            <g key={i} className={'edge t-' + (e.tone ?? 'none')}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} strokeDasharray={e.dash ? '5 5' : undefined} markerEnd={e.dir ? 'url(#arrow)' : undefined} />
              {e.w !== undefined && <text x={(x1 + x2) / 2 - uy * 11 * side} y={(y1 + y2) / 2 + ux * 11 * side} className="edge-w">{e.w}</text>}
            </g>
          )
        })}
        {g.nodes.map(nd => {
          const p = at.get(nd.id)!
          return (
            <g key={nd.id} className={'node t-' + (nd.tone ?? 'none')}>
              <circle cx={p.x} cy={p.y} r={r} />
              {!g.small && <text x={p.x} y={p.y} className="node-label">{nd.label}</text>}
              {nd.sub !== undefined && <text x={p.x + r + 2} y={p.y - r + 1} className="node-sub">{nd.sub}</text>}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function GridView({ g }: { g: GridV }) {
  return (
    <div className="view">
      {g.name && <div className="view-name">{g.name}</div>}
      <div className="arr-scroll">
        <table className={'grid' + (g.sq ? ' sq' : '')}>
          {g.cols && <thead><tr>{g.rows && <th />}{g.cols.map((c, i) => <th key={i}>{c}</th>)}</tr></thead>}
          <tbody>
            {g.cells.map((row, i) => (
              <tr key={i}>
                {g.rows && <th>{g.rows[i]}</th>}
                {row.map((c, j) => <td key={j} className={'t-' + (g.tone?.[i + ',' + j] ?? 'none')}>{c}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function VarsView({ v }: { v: VarsV }) {
  return (
    <div className="view vars">
      {v.items.map(([k, x]) => <span key={k} className="var"><b>{k}</b>{String(x)}</span>)}
    </div>
  )
}

export function Stage({ views }: { views: View[] }) {
  return (
    <div className="stage">
      {views.map((v, i) =>
        v.k === 'arr' ? <ArrView key={i} a={v} /> : v.k === 'graph' ? <GraphView key={i} g={v} /> : v.k === 'grid' ? <GridView key={i} g={v} /> : <VarsView key={i} v={v} />)}
    </div>
  )
}
