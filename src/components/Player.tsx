import { useEffect, useMemo, useState } from 'react'
import { Rng, TooLong, Tracer, type Lesson, type Step } from '../engine/types'
import { useApp } from '../store'
import { Code, CopyButton, parseCode } from './Code'
import { Flow } from './Flow'
import { Stage } from './Stage'

type Result = { steps: Step[]; output: string; error?: string }

export function trace(lesson: Lesson, input: string, tooLong: string): Result {
  const t = new Tracer(true)
  try {
    lesson.run(input, t)
    return { steps: t.steps, output: t.output }
  } catch (e) {
    return { steps: [], output: '', error: e instanceof TooLong ? tooLong : e instanceof Error ? e.message : String(e) }
  }
}

const SPEEDS = [0.5, 1, 2, 4]

/** `start` is the 1-based step to open on (from the URL: #/learn/<id>/viz/<step>). */
export function Player({ lesson, start = 0 }: { lesson: Lesson; start?: number }) {
  const { ui, tr, p } = useApp()
  const [size, setSize] = useState(0)
  const [seed, setSeed] = useState(1)
  const [draft, setDraft] = useState(() => lesson.gen(lesson.sizes[0], new Rng(1)))
  const [input, setInput] = useState(draft)
  const [i, setI] = useState(Math.max(0, start - 1))
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [panel, setPanel] = useState<'code' | 'flow'>('code')

  const { lines, tags } = useMemo(() => parseCode(lesson.code), [lesson])
  const res = useMemo(() => trace(lesson, input, ui('tooLong')), [lesson, input, p.lang])
  const n = res.steps.length
  const cur = res.steps[Math.min(i, n - 1)]
  // A step number from the URL or a shorter new input can leave i past the end.
  useEffect(() => { if (n && i > n - 1) setI(n - 1) }, [i, n])

  const regen = (sz: number, sd: number) => {
    const s = lesson.gen(lesson.sizes[sz], new Rng(sd))
    setSize(sz); setSeed(sd); setDraft(s); setInput(s); setI(0); setPlaying(false)
  }

  useEffect(() => {
    if (!playing) return
    if (i >= n - 1) { setPlaying(false); return }
    const id = setTimeout(() => setI(x => x + 1), 850 / speed)
    return () => clearTimeout(id)
  }, [playing, i, n, speed])

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT' || el.tagName === 'SELECT' || e.ctrlKey || e.metaKey || e.altKey) return
      if (e.key === ' ') { e.preventDefault(); toggle() }
      else if (e.key === 'ArrowRight') { setPlaying(false); setI(x => Math.min(n - 1, x + 1)) }
      else if (e.key === 'ArrowLeft') { setPlaying(false); setI(x => Math.max(0, x - 1)) }
    }
    addEventListener('keydown', on)
    return () => removeEventListener('keydown', on)
  })

  const toggle = () => {
    if (!n) return
    if (!playing && i >= n - 1) setI(0)
    setPlaying(x => !x)
  }
  const go = (x: number) => { setPlaying(false); setI(Math.max(0, Math.min(n - 1, x))) }

  return (
    <div className="player">
      <div className="player-main">
      <section className="card stage-card">
        {res.error ? <div className="error">{res.error}</div> : cur && (
          <>
            <div className="msg" aria-live="polite"><span className="msg-no">{Math.min(i, n - 1) + 1}</span>{tr(cur.msg)}</div>
            <Stage views={cur.views} />
          </>
        )}
        <div className="controls">
          <button className="icon" onClick={() => go(0)} disabled={!n} aria-label="first">⏮</button>
          <button className="icon" onClick={() => go(i - 1)} disabled={!n} aria-label="back">◀</button>
          <button className="primary play" onClick={toggle} disabled={!n}>{playing ? '❚❚ ' + ui('pause') : '▶ ' + ui('play')}</button>
          <button className="icon" onClick={() => go(i + 1)} disabled={!n} aria-label="forward">▶</button>
          <button className="icon" onClick={() => go(n - 1)} disabled={!n} aria-label="last">⏭</button>
          <input className="scrub" type="range" min={0} max={Math.max(0, n - 1)} value={Math.min(i, Math.max(0, n - 1))} onChange={e => go(+e.target.value)} aria-label={ui('step')} />
          <span className="count">{n ? Math.min(i, n - 1) + 1 : 0} / {n}</span>
          <label className="speed">{ui('speed')}
            <select value={speed} onChange={e => setSpeed(+e.target.value)}>{SPEEDS.map(s => <option key={s} value={s}>{s}×</option>)}</select>
          </label>
        </div>
        <div className="hint">{ui('keys')}</div>
      </section>

      <section className="card input-card">
        <div className="row">
          <h3>{ui('input')}</h3>
          <div className="seg">
            {(['small', 'medium', 'large'] as const).map((k, j) => (
              <button key={k} className={size === j && draft === input ? 'on' : ''} onClick={() => regen(j, seed)}>{ui(k)} · n={lesson.sizes[j]}</button>
            ))}
          </div>
          <button onClick={() => regen(size, seed + 1)}>🎲 {ui('shuffle')}</button>
        </div>
        <p className="muted">{ui('inputFmt')}: {tr(lesson.input)}</p>
        <div className="io">
          <div>
            <textarea value={draft} onChange={e => setDraft(e.target.value)} spellCheck={false} rows={6} aria-label={ui('input')} />
            <div className="row">
              <button className="primary" disabled={draft === input} onClick={() => { setInput(draft); setI(0); setPlaying(false) }}>{ui('apply')}</button>
              {draft !== input && <span className="muted">{ui('edited')}</span>}
            </div>
          </div>
          <div>
            <div className="out-label">{ui('output')}</div>
            <pre className="out">{res.output.length > 600 ? res.output.slice(0, 600) + '\n…' : res.output}</pre>
          </div>
        </div>
      </section>
      </div>

      <div className="side-panel">
        {lesson.flow && (
          <div className="seg panel-switch">
            <button className={panel === 'code' ? 'on' : ''} onClick={() => setPanel('code')}>{ui('panelCode')}</button>
            <button className={panel === 'flow' ? 'on' : ''} onClick={() => setPanel('flow')}>{ui('panelFlow')}</button>
          </div>
        )}
        {lesson.flow && panel === 'flow'
          ? <section className="card flow-card"><Flow nodes={lesson.flow} active={cur?.tag} /></section>
          : <section className="card code-card"><CopyButton className="copy" text={() => lines.join('\n') + '\n'} /><Code lines={lines} active={cur ? tags[cur.tag] : undefined} /></section>}
      </div>
    </div>
  )
}
