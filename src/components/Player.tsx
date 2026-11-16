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

interface PlayerProps {
  lesson: Lesson
  /** The 1-based step to open on (from the URL: #/learn/<id>/viz/<step>). */
  start?: number
  /** The input to open on, instead of the first generated one. */
  initial?: string
  /** The correct output for an input, shown beside the program's own (the "find the bug" exercise). */
  expect?(input: string): string
  /** Makes the code lines clickable, with a verdict on those already picked. */
  pick?: { on(line: number): void; picked: Record<number, 'ok' | 'bad'> }
}

export function Player({ lesson, start = 0, initial, expect, pick }: PlayerProps) {
  const { ui, tr, p, answerQuiz } = useApp()
  const [size, setSize] = useState(0)
  const [seed, setSeed] = useState(1)
  const [draft, setDraft] = useState(() => initial ?? lesson.gen(lesson.sizes[0], new Rng(1)))
  const [input, setInput] = useState(draft)
  const [i, setI] = useState(Math.max(0, start - 1))
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [panel, setPanel] = useState<'code' | 'flow'>('code')
  // "Predict the next step": with the quiz on, the player stops before a step that carries a question.
  const [quiz, setQuiz] = useState(false)
  const [asking, setAsking] = useState<number | null>(null)
  const [answered, setAnswered] = useState<Record<number, number>>({})

  const { lines, tags } = useMemo(() => parseCode(lesson.code), [lesson])
  const res = useMemo(() => trace(lesson, input, ui('tooLong')), [lesson, input, p.lang])
  const n = res.steps.length
  const want = useMemo(() => (expect && !res.error ? expect(input) : undefined), [expect, input, res.error])
  const clip = (s: string) => (s.length > 600 ? s.slice(0, 600) + '\n…' : s)
  const sameOut = (a: string, b: string) => a.split(/\s+/).filter(Boolean).join(' ') === b.split(/\s+/).filter(Boolean).join(' ')
  const cur = res.steps[Math.min(i, n - 1)]
  const questions = useMemo(() => res.steps.filter(s => s.ask).length, [res])
  useEffect(() => { setAnswered({}); setAsking(null) }, [res])
  /** One step forward, unless the quiz has a question about that step first. */
  const forward = () => {
    const to = Math.min(n - 1, i + 1)
    if (quiz && to > i && res.steps[to].ask && answered[to] === undefined) { setPlaying(false); setAsking(to) } else setI(to)
  }
  const answer = (k: number) => {
    if (asking === null) return
    const a = res.steps[asking].ask!
    setAnswered(x => ({ ...x, [asking]: k })); answerQuiz(lesson.id, k === a.answer)
    setI(asking); setAsking(null)
  }
  const pending = asking === null ? undefined : res.steps[asking]?.ask
  const verdict = cur?.ask && answered[Math.min(i, n - 1)] !== undefined ? { right: answered[Math.min(i, n - 1)] === cur.ask.answer, was: cur.ask.options[cur.ask.answer] } : undefined
  // A step number from the URL or a shorter new input can leave i past the end.
  useEffect(() => { if (n && i > n - 1) setI(n - 1) }, [i, n])

  const regen = (sz: number, sd: number) => {
    const s = lesson.gen(lesson.sizes[sz], new Rng(sd))
    setSize(sz); setSeed(sd); setDraft(s); setInput(s); setI(0); setPlaying(false); setAsking(null)
  }

  useEffect(() => {
    if (!playing) return
    if (i >= n - 1) { setPlaying(false); return }
    const id = setTimeout(forward, 850 / speed)
    return () => clearTimeout(id)
  }, [playing, i, n, speed])

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT' || el.tagName === 'SELECT' || e.ctrlKey || e.metaKey || e.altKey) return
      if (e.key === ' ') { e.preventDefault(); toggle() }
      else if (e.key === 'ArrowRight') { setPlaying(false); if (asking === null) forward() }
      else if (e.key === 'ArrowLeft') { setPlaying(false); setAsking(null); setI(x => Math.max(0, x - 1)) }
    }
    addEventListener('keydown', on)
    return () => removeEventListener('keydown', on)
  })

  const toggle = () => {
    if (!n || asking !== null) return
    if (!playing && i >= n - 1) setI(0)
    setPlaying(x => !x)
  }
  const go = (x: number) => { setPlaying(false); setAsking(null); setI(Math.max(0, Math.min(n - 1, x))) }

  return (
    <div className="player">
      <div className="player-main">
      <section className="card stage-card">
        {res.error ? <div className="error">{res.error}</div> : cur && (
          <>
            <div className="msg" aria-live="polite"><span className="msg-no">{Math.min(i, n - 1) + 1}</span>{tr(cur.msg)}</div>
            {verdict && asking === null && <div className={'ask-verdict ' + (verdict.right ? 'ok' : 'bad')}>{verdict.right ? '✓ ' + ui('quizRight') : '✗ ' + ui('quizWrong') + ' ' + tr(verdict.was)}</div>}
            <Stage views={cur.views} />
            {pending && (
              <div className="ask" role="group" aria-label={ui('quiz')}>
                <p><b>{ui('quizAsk')}</b> {tr(pending.q)}</p>
                <div className="row">{pending.options.map((o, k) => <button key={k} onClick={() => answer(k)}>{tr(o)}</button>)}</div>
              </div>
            )}
          </>
        )}
        <div className="controls">
          <button className="icon" onClick={() => go(0)} disabled={!n} aria-label="first">⏮</button>
          <button className="icon" onClick={() => go(i - 1)} disabled={!n} aria-label="back">◀</button>
          <button className="primary play" onClick={toggle} disabled={!n}>{playing ? '❚❚ ' + ui('pause') : '▶ ' + ui('play')}</button>
          <button className="icon" onClick={() => { setPlaying(false); if (asking === null) forward() }} disabled={!n} aria-label="forward">▶</button>
          <button className="icon" onClick={() => go(n - 1)} disabled={!n} aria-label="last">⏭</button>
          <input className="scrub" type="range" min={0} max={Math.max(0, n - 1)} value={Math.min(i, Math.max(0, n - 1))} onChange={e => go(+e.target.value)} aria-label={ui('step')} />
          <span className="count">{n ? Math.min(i, n - 1) + 1 : 0} / {n}</span>
          {questions > 0 && <label className="check quiz-switch"><input type="checkbox" checked={quiz} onChange={e => { setQuiz(e.target.checked); setAsking(null) }} /> {ui('quiz')} <small>({questions})</small></label>}
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
              <button key={k} className={size === j && draft === input && draft !== initial ? 'on' : ''} onClick={() => regen(j, seed)}>{ui(k)} · n={lesson.sizes[j]}</button>
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
            <div className="out-label">{ui('output')}{want !== undefined && <b className={sameOut(want, res.output) ? 'verdict ok' : 'verdict bad'}>{sameOut(want, res.output) ? ui('outRight') : ui('outWrong')}</b>}</div>
            <pre className="out">{clip(res.output)}</pre>
            {want !== undefined && <><div className="out-label">{ui('expected')}</div><pre className="out">{clip(want)}</pre></>}
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
          : <section className="card code-card">{!pick && <CopyButton className="copy" text={() => lines.join('\n') + '\n'} />}<Code lines={lines} active={cur ? tags[cur.tag] : undefined} onPick={pick?.on} picked={pick?.picked} /></section>}
      </div>
    </div>
  )
}
