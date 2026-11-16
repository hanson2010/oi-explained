import { useEffect, useMemo, useRef, useState } from 'react'
import { Diff, LevelBadge } from '../components/bits'
import { Code, CopyButton, parseCode, withComments } from '../components/Code'
import { Fix } from '../components/Fix'
import { Flow } from '../components/Flow'
import { Lab } from '../components/Lab'
import { Player } from '../components/Player'
import { Rich } from '../components/Rich'
import { Stage } from '../components/Stage'
import { Rng, Tracer, type Card, type Lesson, type Variant } from '../engine/types'
import { CATS } from '../i18n'
import type { Meta } from '../lessons/extras'
import { leadsTo, META, META_BY_ID } from '../lessons/meta'
import { href, isRevisit, useApp } from '../store'

/** Learning order: what is asked, how to think about it, the program, watching it run, scaling it up — and, where there is one, a broken version to repair. */
const ALL_TABS = ['problem', 'idea', 'code', 'viz', 'lab', 'fix'] as const
type Tab = (typeof ALL_TABS)[number]
const TAB_KEY = { problem: 'tabProblem', idea: 'tabIdea', code: 'tabCode', viz: 'tabViz', lab: 'tabLab', fix: 'tabFix' } as const
const KIND_KEY = { term: 'kindTerm', naive: 'kindNaive', insight: 'kindInsight', how: 'kindHow', result: 'kindResult' } as const

function ProblemTab({ lesson }: { lesson: Lesson }) {
  const { ui, tr } = useApp()
  const sample = useMemo(() => {
    const input = lesson.gen(lesson.sizes[0], new Rng(1)), t = new Tracer(false)
    try { lesson.run(input, t) } catch { /* the sample is generated, so this cannot happen; show the input anyway */ }
    return { input, output: t.output }
  }, [lesson])
  return (
    <div className="split">
      <section className="prose">
        <h3>{ui('task')}</h3>
        <p className="statement">{tr(lesson.problem!)}</p>
        {lesson.real && <div className="real"><h3>{ui('realTitle')}</h3><p><Rich text={tr(lesson.real)} /></p></div>}
        <h3>{ui('inputFmt')}</h3>
        <p>{tr(lesson.input)}</p>
      </section>
      <aside className="samples">
        <div><h3>{ui('sampleIn')}</h3><pre className="out">{sample.input}</pre></div>
        <div><h3>{ui('sampleOut')}</h3><pre className="out">{sample.output || ' '}</pre></div>
      </aside>
    </div>
  )
}

function IdeaTab({ lesson }: { lesson: Lesson }) {
  const { ui, tr } = useApp()
  // Lessons without a hand-written story still get one: the explanation, then each key idea as a step.
  const story: Card[] = lesson.story ?? [{ kind: 'insight', body: lesson.why! }, ...lesson.ideas.map((body): Card => ({ kind: 'how', body }))]
  return (
    <div className="split">
      <ol className="story">
        {story.map((c, i) => (
          <li key={i} className={'beat k-' + c.kind}>
            <span className="beat-no">{i + 1}</span>
            <div className="beat-body">
              <span className="beat-kind">{ui(KIND_KEY[c.kind])}</span>
              {c.title && <h3>{tr(c.title)}</h3>}
              <p><Rich text={tr(c.body)} /></p>
              {c.fig && <div className="beat-fig"><Stage views={c.fig()} /></div>}
            </div>
          </li>
        ))}
      </ol>
      <aside className="side">
        {lesson.flow && (
          <div className="card">
            <h3>{ui('flowTitle')}</h3>
            <Flow nodes={lesson.flow} />
            <p className="muted small">{ui('flowHint')}</p>
          </div>
        )}
        <div className="card">
          <h3>{ui('complexity')}</h3>
          <table className="cx">
            <thead><tr><th /><th>{ui('time')}</th><th>{ui('space')}</th></tr></thead>
            <tbody>
              {lesson.first && <tr className="naive"><th>{tr(lesson.first.label)}</th><td><code>{lesson.first.time}</code></td><td><code>{lesson.first.space}</code></td></tr>}
              <tr className="best"><th>{lesson.first ? tr(lesson.label ?? lesson.title) : ''}</th><td><code>{lesson.time}</code></td><td><code>{lesson.space}</code></td></tr>
            </tbody>
          </table>
          {lesson.first?.maxN && <a className="btn" href={`#/learn/${lesson.id}/lab`}>{ui('raceThem')} →</a>}
        </div>
        <div>
          <h3>{ui('pitfalls')}</h3>
          <ul className="pitfalls">{lesson.pitfalls!.map((x, i) => <li key={i}><Rich text={tr(x)} /></li>)}</ul>
        </div>
      </aside>
    </div>
  )
}

/** Chooses between the version to learn first and the lesson's own version. */
function VariantSwitch({ lesson, first, set }: { lesson: Lesson; first: boolean; set(v: boolean): void }) {
  const { tr } = useApp()
  const v = lesson.first
  if (!v) return null
  // Show the measure in which the two versions differ, or what is gained when both read the same.
  const key = v.time === lesson.time ? 'space' : 'time'
  return (
    <div className="variant">
      <button className={first ? 'on naive' : 'naive'} onClick={() => set(true)}><b>1</b>{tr(v.label)}{!v.gain && <code>{v[key]}</code>}</button>
      <span aria-hidden="true">→</span>
      <button className={first ? 'best' : 'on best'} onClick={() => set(false)}><b>2</b>{tr(lesson.label ?? lesson.title)}<code>{v.gain ? tr(v.gain) : lesson[key]}</code></button>
    </div>
  )
}

/** The program with its explanations as comments; beside it the flowchart, or what this version is about. */
function CodeTab({ lesson, variant }: { lesson: Lesson; variant?: Variant }) {
  const { ui, tr } = useApp()
  const { lines, tags } = useMemo(() => parseCode(lesson.code), [lesson])
  const [hover, setHover] = useState<number>()
  const [show, setShow] = useState(true)
  const comments = Object.fromEntries(lesson.notes.filter(([tag]) => tag in tags).map(([tag, text]) => [tags[tag], tr(text)]))
  const tagAt = Object.fromEntries(Object.entries(tags).map(([tag, i]) => [i, tag]))
  return (
    <div className="split">
      <section className="card code-card tall">
        <div className="code-tools">
          <label><input type="checkbox" checked={show} onChange={e => setShow(e.target.checked)} /> {ui('comments')}</label>
          <CopyButton text={() => (show ? withComments(lines, comments) : lines.join('\n') + '\n')} />
        </div>
        <Code lines={lines} comments={show ? comments : undefined} hover={hover} onHover={setHover} />
      </section>
      <aside className="side">
        {variant && (
          <div className="card">
            <h3>{ui('thisVersion')}: {tr(variant.label)}</h3>
            <p><Rich text={tr(variant.blurb)} /></p>
            <p className="row"><span className="chip">{ui('time')} <code>{variant.time}</code></span><span className="chip">{ui('space')} <code>{variant.space}</code></span></p>
          </div>
        )}
        {lesson.flow ? (
          <div className="card">
            <h3>{ui('flowTitle')}</h3>
            <Flow nodes={lesson.flow} active={hover === undefined ? undefined : tagAt[hover]} />
            <p className="muted small">{ui('codeFlowHint')}</p>
          </div>
        ) : !variant && (
          <div>
            <h3>{ui('keyIdeas')}</h3>
            <ol className="recap">{lesson.ideas.map((x, i) => <li key={i}><Rich text={tr(x)} /></li>)}</ol>
          </div>
        )}
      </aside>
    </div>
  )
}

export function LessonPage({ lesson, tab, step }: { lesson: Lesson; tab?: string; step?: string }) {
  const { ui, tr, p, set, toggleDone, toggleFav } = useApp()
  const TABS = ALL_TABS.filter(t => t !== 'fix' || lesson.broken)
  const cur: Tab = (TABS as readonly string[]).includes(tab ?? '') ? (tab as Tab) : 'problem'
  const idx = META.findIndex(m => m.id === lesson.id), prev = META[idx - 1], next = META[idx + 1]
  const after = TABS[TABS.indexOf(cur) + 1]
  // Lessons with two versions open on the first one: that is the order to learn them in.
  const [first, setFirst] = useState(!!lesson.first)
  // The first version is the same lesson with another program behind it.
  const shown = useMemo<Lesson>(() => (first && lesson.first ? { ...lesson, ...lesson.first, flow: undefined } : lesson), [lesson, first])

  useEffect(() => { set({ last: lesson.id }) }, [lesson])

  // The tab bar stays in view. After a tab change deep in the page, go back to where the new tab's content begins.
  const mark = useRef<HTMLDivElement>(null), shownTab = useRef(cur)
  useEffect(() => {
    if (shownTab.current === cur || !mark.current) return
    shownTab.current = cur
    if (isRevisit()) return
    const start = mark.current.getBoundingClientRect().top + scrollY - (document.querySelector<HTMLElement>('.top')?.offsetHeight ?? 0)
    if (scrollY > start) scrollTo(0, start)
  }, [cur])
  const hop = (l: Meta | undefined, label: string, sign: string) => l
    ? <a href={'#/learn/' + l.id} title={`${label}: ${tr(l.title)}`} aria-label={`${label}: ${tr(l.title)}`}>{sign}</a>
    : <span aria-hidden="true">{sign}</span>

  const links = (label: string, ls: Meta[]) => ls.length > 0 && (
    <p className="rel"><span>{label}</span>{ls.map(l => <a key={l.id} className={p.done[l.id] ? 'done' : ''} href={'#/learn/' + l.id}>{p.done[l.id] ? '✓ ' : ''}{tr(l.title)}</a>)}</p>
  )

  return (
    <article className={'lesson lv-' + lesson.level}>
      <header className="lesson-head">
        <div>
          <div className="crumbs">
            <span><a href="#/">{ui('navLearn')}</a> / <a href={href('', { cat: lesson.cat })}>{tr(CATS[lesson.cat])}</a> <a className="plain" href={href('', { level: lesson.level })}><LevelBadge level={lesson.level} /></a> <Diff d={lesson.diff} /></span>
            <span className="mini-pager">{hop(prev, ui("prev"), "‹")}<span>{idx + 1} / {META.length}</span>{hop(next, ui("next"), "›")}</span>
          </div>
          <h1>{tr(lesson.title)}</h1>
          <p className="lede">{tr(lesson.blurb)}</p>
          {links(ui('needsTitle'), (lesson.needs ?? []).map(id => META_BY_ID.get(id)).filter(x => !!x))}
          {links(ui('leadsTitle'), leadsTo(lesson.id))}
        </div>
        <div className="row actions">
          <span className="chip">{ui('time')} <code>{lesson.time}</code></span>
          <span className="chip">{ui('space')} <code>{lesson.space}</code></span>
          <button className={p.fav[lesson.id] ? 'on' : ''} onClick={() => toggleFav(lesson.id)} aria-pressed={!!p.fav[lesson.id]}>{p.fav[lesson.id] ? '★ ' + ui('starred') : '☆ ' + ui('star')}</button>
          <button className={p.done[lesson.id] ? 'done-btn on' : 'done-btn'} onClick={() => toggleDone(lesson.id)} aria-pressed={!!p.done[lesson.id]}>{p.done[lesson.id] ? '✓ ' + ui('done') : ui('markDone')}</button>
        </div>
      </header>

      <div ref={mark} />
      <div className="tabs" role="tablist">
        {TABS.map((t, i) => <a key={t} role="tab" aria-selected={cur === t} className={cur === t ? 'on' : ''} href={`#/learn/${lesson.id}/${t}`}><span>{i + 1}</span>{ui(TAB_KEY[t])}</a>)}
      </div>

      {cur === 'problem' && <ProblemTab lesson={lesson} />}
      {cur === 'idea' && <IdeaTab lesson={lesson} />}
      {(cur === 'code' || cur === 'viz') && <VariantSwitch lesson={lesson} first={first} set={setFirst} />}
      {cur === 'code' && <CodeTab key={first ? 'first' : 'main'} lesson={shown} variant={first ? lesson.first : undefined} />}
      {cur === 'viz' && <Player key={first ? 'first' : 'main'} lesson={shown} start={Number(step) || 0} />}
      {cur === 'lab' && <Lab lesson={lesson} />}
      {cur === 'fix' && <Fix lesson={lesson} />}

      <p className="next-tab">
        {after ? <a className="btn primary" href={`#/learn/${lesson.id}/${after}`}>{ui('nextTab')}: {ui(TAB_KEY[after])} →</a>
          : next ? <a className="btn primary" href={'#/learn/' + next.id}>{ui('nextLesson')}: {tr(next.title)} →</a>
          : <a className="btn primary" href="#/">{ui('allLessons')} →</a>}
      </p>

      <nav className="pager">
        {prev ? <a href={'#/learn/' + prev.id}><small>← {ui('prev')}</small>{tr(prev.title)}</a> : <span />}
        {next ? <a className="right" href={'#/learn/' + next.id}><small>{ui('next')} →</small>{tr(next.title)}</a> : <span />}
      </nav>
    </article>
  )
}
