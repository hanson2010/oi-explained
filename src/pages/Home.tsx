import { useEffect, useMemo, useState } from 'react'
import { LessonCard } from '../components/bits'
import { trace } from '../components/Player'
import { Stage } from '../components/Stage'
import { SECTION_COUNT } from '../data/syllabus'
import type { Cat, Level } from '../engine/types'
import { CATS, LEVELS } from '../i18n'
import { useLesson } from '../lessons/load'
import { META, META_BY_ID } from '../lessons/meta'
import { dueNow } from '../review'
import { setQuery, useApp } from '../store'

const DEMO = 'quick-sort'

/** A looping preview of a real lesson trace. The lesson is downloaded after the page has rendered; until then the card shows its title. */
function HeroDemo() {
  const { tr } = useApp()
  const meta = META_BY_ID.get(DEMO)!, { lesson } = useLesson(DEMO)
  const steps = useMemo(() => (lesson ? trace(lesson, '9\n5 2 8 1 9 4 7 3 6\n', '').steps : []), [lesson])
  const [i, setI] = useState(0)
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || steps.length < 2) return
    const id = setInterval(() => setI(x => (x + 1) % (steps.length + 4)), 700)
    return () => clearInterval(id)
  }, [steps])
  const s = steps[Math.min(i, steps.length - 1)]
  const pick = (st: (typeof steps)[number]) => st.views.filter(v => v.k !== 'vars').slice(0, 1)
  // Every frame is also laid out invisibly in the same grid cell, so the card is as tall as its tallest frame and never jumps.
  const ghosts = useMemo(() => ({
    views: steps.map((st, k) => <div key={k} className="ghost" aria-hidden="true"><Stage views={pick(st)} /></div>),
    msgs: steps.map((st, k) => <div key={k} className="ghost" aria-hidden="true">{tr(st.msg)}</div>),
  }), [steps, tr])
  return (
    <a className={'hero-demo card' + (s ? '' : ' loading')} href={'#/learn/' + DEMO}>
      <div className="hero-demo-title">{tr(meta.title)} <span>→</span></div>
      {s && <>
        <div className="hero-fit">{ghosts.views}<div><Stage views={pick(s)} /></div></div>
        <div className="hero-fit hero-demo-msg">{ghosts.msgs}<div>{tr(s.msg)}</div></div>
      </>}
    </a>
  )
}

/** The filters live in the URL, so a filtered list can be linked to and is still there after Back. */
export function Home({ query }: { query: URLSearchParams }) {
  const { ui, tr, p } = useApp()
  const lv = query.get('level') ?? '', ct = query.get('cat') ?? ''
  const level: Level | '' = lv in LEVELS ? (lv as Level) : '', cat: Cat | '' = ct in CATS ? (ct as Cat) : '', fav = query.get('fav') === '1'
  const setLevel = (x: Level | '') => setQuery({ level: x }), setCat = (x: Cat | '') => setQuery({ cat: x }), setFav = (x: boolean) => setQuery({ fav: x ? '1' : '' })
  // Typing updates the list at once and the URL a moment later.
  const [q, setQ] = useState(query.get('q') ?? '')
  useEffect(() => {
    if (q === (query.get('q') ?? '')) return
    const id = setTimeout(() => setQuery({ q }), 300)
    return () => clearTimeout(id)
  }, [q])
  const filtered = !!(q.trim() || level || cat || fav)
  const clear = () => { setQ(''); setQuery({ q: '', level: '', cat: '', fav: '' }) }

  const doneCount = META.filter(l => p.done[l.id]).length
  const dueCount = dueNow(p, Date.now(), META.map(l => l.id)).length
  const nextUp = (p.last && !p.done[p.last] && META_BY_ID.get(p.last)) || META.find(l => !p.done[l.id]) || META[0]
  const needle = q.trim().toLowerCase()
  const list = META.filter(l =>
    (!level || l.level === level) && (!cat || l.cat === cat) && (!fav || p.fav[l.id]) &&
    (!needle || (l.title[0] + ' ' + l.title[1] + ' ' + l.blurb[0] + ' ' + l.blurb[1] + ' ' + l.id).toLowerCase().includes(needle)))
  const cats = (Object.keys(CATS) as Cat[]).filter(c => META.some(l => l.cat === c))

  return (
    <>
      <section className="hero">
        <div>
          <h1>{ui('heroTitle')}</h1>
          <p className="lede">{ui('heroSub')}</p>
          <div className="row">
            <a className="btn primary big" href={'#/learn/' + nextUp.id}>{doneCount || p.last ? ui('resume') : ui('start')}: {tr(nextUp.title)}</a>
            <a className="btn big" href="#/syllabus">{ui('browse')}</a>
            {dueCount > 0 && <a className="btn big" href="#/profile">{ui('reviewTitle')} ({dueCount})</a>}
          </div>
          <div className="stats">
            <span><b>{META.length}</b> {ui('lessons')}</span>
            <span><b>{SECTION_COUNT}</b> {ui('points')}</span>
            <span><b>{doneCount}</b> {ui('learned')}</span>
          </div>
        </div>
        <HeroDemo />
      </section>

      <section className="levels">
        {(Object.keys(LEVELS) as Level[]).map(lv => {
          const all = META.filter(l => l.level === lv), d = all.filter(l => p.done[l.id]).length
          return (
            <button key={lv} className={'level-card lv-' + lv + (level === lv ? ' on' : '')} onClick={() => setLevel(level === lv ? '' : lv)} aria-pressed={level === lv}>
              <span className="level-name">{tr(LEVELS[lv].name)}</span>
              <span className="level-contest">{tr(LEVELS[lv].contest)}</span>
              <span className="meter"><i style={{ width: (all.length ? (100 * d) / all.length : 0) + '%' }} /></span>
              <span className="level-count">{d} / {all.length} {ui('learned')}</span>
            </button>
          )
        })}
      </section>

      <section className="filters">
        <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder={ui('search')} aria-label={ui('search')} />
        <div className="chips">
          <button className={!cat ? 'on' : ''} aria-pressed={!cat} onClick={() => setCat('')}>{ui('all')}</button>
          {cats.map(c => <button key={c} className={cat === c ? 'on' : ''} aria-pressed={cat === c} onClick={() => setCat(cat === c ? '' : c)}>{tr(CATS[c])}</button>)}
          <button className={fav ? 'on' : ''} onClick={() => setFav(!fav)}>★ {ui('favOnly')}</button>
        </div>
        {filtered && <span className="filter-state"><span className="muted small">{list.length} {ui('shown')}</span><button className="ghost" onClick={clear}>✕ {ui('clearFilters')}</button></span>}
      </section>

      {list.length ? <section className="lesson-grid">{list.map(l => <LessonCard key={l.id} lesson={l} />)}</section> : <p className="empty">{ui('none')}</p>}
    </>
  )
}
