import { useState } from 'react'
import { Rng, Tracer, type Lesson } from '../engine/types'
import { useApp } from '../store'

interface Run { steps: number; ms: number }
interface Row { n: number; main?: Run; naive?: Run | 'slow'; input?: string; output?: string; error?: string; skipped?: boolean }

const inputFor = (lesson: Lesson, n: number) => lesson.gen(n, new Rng(n * 7919 + 13))

/** Runs one implementation on the input without recording steps. */
function time(run: Lesson['run'], input: string) {
  const t = new Tracer(false), t0 = performance.now()
  run(input, t)
  return { steps: t.count, ms: performance.now() - t0, output: t.output }
}

/** Measures the lesson (and its first version, where the two are raced and it is fast enough) on generated data of magnitude n. */
export function measure(lesson: Lesson, n: number): Row {
  const input = inputFor(lesson, n)
  try {
    const { output, ...main } = time(lesson.run, input)
    const row: Row = { n, main, input, output }
    const v = lesson.first
    if (v?.maxN) row.naive = n > v.maxN ? 'slow' : (({ steps, ms }) => ({ steps, ms }))(time(v.run, input))
    return row
  } catch (e) {
    return { n, input, error: e instanceof Error ? e.message : String(e) }
  }
}

function save(name: string, text: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }))
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

const fmt = (x: number) => x.toLocaleString('en-US')
const mult = (x: number) => '×' + (x >= 100 ? Math.round(x).toLocaleString('en-US') : x >= 10 ? x.toFixed(1) : x.toFixed(2))
const ms = (x: number) => (x < 10 ? x.toFixed(2) : String(Math.round(x)))
const done = (r?: Run | 'slow'): r is Run => !!r && r !== 'slow'

function Chart({ rows, names }: { rows: Row[]; names?: [string, string] }) {
  const series = [
    { cls: 'best', pts: rows.filter(r => r.main).map(r => ({ n: r.n, v: r.main!.steps })) },
    { cls: 'naive', pts: rows.filter(r => done(r.naive)).map(r => ({ n: r.n, v: (r.naive as Run).steps })) },
  ].filter(s => s.pts.length)
  const all = series.flatMap(s => s.pts)
  if (all.length < 2) return null
  const W = 560, H = 280, L = 56, B = 34, T = 14, R = 20
  const lg = (v: number) => Math.log10(Math.max(1, v))
  const x0 = Math.floor(Math.min(...all.map(p => lg(p.n)))), x1 = Math.max(x0 + 1, Math.ceil(Math.max(...all.map(p => lg(p.n)))))
  const y0 = Math.floor(Math.min(...all.map(p => lg(p.v)))), y1 = Math.max(y0 + 1, Math.ceil(Math.max(...all.map(p => lg(p.v)))))
  const X = (v: number) => L + ((lg(v) - x0) / (x1 - x0)) * (W - L - R), Y = (v: number) => H - B - ((lg(v) - y0) / (y1 - y0)) * (H - B - T)
  const ticks = (a: number, b: number) => { const s = Math.ceil((b - a) / 6), r = []; for (let v = a; v <= b; v += s) r.push(v); return r }
  const pow = (v: number) => (v < 4 ? String(10 ** v) : '10^' + v)
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img">
      {ticks(x0, x1).map(v => <g key={'x' + v}><line x1={X(10 ** v)} x2={X(10 ** v)} y1={T} y2={H - B} className="gridline" /><text x={X(10 ** v)} y={H - B + 16} textAnchor="middle">{pow(v)}</text></g>)}
      {ticks(y0, y1).map(v => <g key={'y' + v}><line x1={L} x2={W - R} y1={Y(10 ** v)} y2={Y(10 ** v)} className="gridline" /><text x={L - 8} y={Y(10 ** v) + 4} textAnchor="end">{pow(v)}</text></g>)}
      {series.map(s => (
        <g key={s.cls} className={'series-' + s.cls}>
          <polyline className="series" points={s.pts.map(p => `${X(p.n)},${Y(p.v)}`).join(' ')} />
          {s.pts.map(p => <circle key={p.n} className="dot" cx={X(p.n)} cy={Y(p.v)} r={4.5}><title>{`n = ${fmt(p.n)}: ${fmt(p.v)}`}</title></circle>)}
          {names && <text className="series-name" x={X(s.pts[s.pts.length - 1].n) - 8} y={Y(s.pts[s.pts.length - 1].v) + (s.cls === 'naive' ? -10 : 18)} textAnchor="end">{names[s.cls === 'naive' ? 0 : 1]}</text>}
        </g>
      ))}
      <text x={W - R} y={H - 4} textAnchor="end" className="axis">n</text>
    </svg>
  )
}

export function Lab({ lesson }: { lesson: Lesson }) {
  const { ui, tr } = useApp()
  const [rows, setRows] = useState<Row[]>(lesson.lab.map(n => ({ n })))
  const [busy, setBusy] = useState(false)
  const two = !!lesson.first?.maxN
  const nameA = two ? tr(lesson.first!.label) : '', nameB = tr(lesson.label ?? lesson.title)

  const run = async () => {
    setBusy(true)
    const out: Row[] = lesson.lab.map(n => ({ n }))
    setRows(out)
    let slow = false
    for (let k = 0; k < out.length; k++) {
      await new Promise(r => setTimeout(r, 30)) // let the table repaint between sizes
      out[k] = slow ? { n: out[k].n, skipped: true } : measure(lesson, out[k].n)
      if ((out[k].main?.ms ?? 0) > 4000) slow = true
      setRows(out.slice())
    }
    setBusy(false)
  }

  return (
    <div className="lab">
      <p className="prose">{ui('labIntro')}</p>
      <div className="row">
        <button className="primary" onClick={run} disabled={busy}>{busy ? ui('labRunning') : '▶ ' + ui('labRun')}</button>
        {two && <span className="chip naive">{nameA} <code>{lesson.first!.time}</code></span>}
        <span className="chip best">{two ? nameB : ui('time')} <code>{lesson.time}</code></span>
      </div>
      <div className="split lab-grid">
        <div className="arr-scroll">
          <table className="lab-table">
            <thead>
              <tr>
                <th>{ui('labN')}</th>
                {two && <th className="naive">{nameA}</th>}
                <th className="best">{two ? nameB : ui('labSteps')}</th>
                <th>{two ? ui('labSpeedup') : ui('labGrowth')}</th>
                <th>{ui('labMs')}</th>
                <th>{ui('labData')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, k) => {
                const prev = rows[k - 1], span = two ? 4 : 3
                return (
                  <tr key={r.n}>
                    <td>{fmt(r.n)}</td>
                    {r.error ? <td colSpan={span} className="bad">{r.error}</td> : r.skipped ? <td colSpan={span} className="muted">{ui('labSkipped')}</td> : <>
                      {two && <td className="naive">{done(r.naive) ? fmt(r.naive.steps) : r.naive === 'slow' ? <span className="muted">{ui('labTooSlow')}</span> : '—'}</td>}
                      <td className="best">{r.main ? fmt(r.main.steps) : '—'}</td>
                      <td className="muted">{two
                        ? (done(r.naive) && r.main ? mult(r.naive.steps / Math.max(1, r.main.steps)) : '—')
                        : (r.main && prev?.main ? `n ${mult(r.n / prev.n)} → ${mult(r.main.steps / prev.main.steps)}` : '—')}</td>
                      <td>{r.main ? (two && done(r.naive) ? `${ms(r.naive.ms)} / ${ms(r.main.ms)}` : ms(r.main.ms)) : '—'}</td>
                    </>}
                    <td>
                      <button className="link" onClick={() => save(`${lesson.id}-${r.n}.in`, r.input ?? inputFor(lesson, r.n))}>.in</button>
                      {r.output !== undefined && <button className="link" onClick={() => save(`${lesson.id}-${r.n}.out`, r.output! + '\n')}>.out</button>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <p className="muted small">{two ? '' : ui('labGrowthHint') + ' '}{ui('labTimeNote')}</p>
        </div>
        <figure>
          <Chart rows={rows} names={two ? [nameA, nameB] : undefined} />
          {rows.filter(r => r.main).length >= 2 && <figcaption className="muted small">{ui('labChart')}</figcaption>}
        </figure>
      </div>
    </div>
  )
}
