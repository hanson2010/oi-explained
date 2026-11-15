import { useEffect, useMemo, useState } from 'react'
import { LessonCard } from '../components/bits'
import { trace } from '../components/Player'
import { Stage } from '../components/Stage'
import { SECTION_COUNT } from '../data/syllabus'
import { Rng, type Cat, type Level } from '../engine/types'
import { CATS, LEVELS } from '../i18n'
import { BY_ID, LESSONS } from '../lessons'
import { useApp } from '../store'

/** A looping preview of a real lesson trace. */
function HeroDemo() {
  const { tr } = useApp()
  const lesson = BY_ID.get('quick-sort') ?? LESSONS[0]
  const steps = useMemo(() => trace(lesson, lesson.id === 'quick-sort' ? '9\n5 2 8 1 9 4 7 3 6\n' : lesson.gen(lesson.sizes[0], new Rng(7)), '').steps, [lesson])
  const [i, setI] = useState(0)
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || steps.length < 2) return
    const id = setInterval(() => setI(x => (x + 1) % (steps.length + 4)), 700)
    return () => clearInterval(id)
  }, [steps])
  const s = steps[Math.min(i, steps.length - 1)]
  if (!s) return null
  return (
    <a className="hero-demo card" href={'#/learn/' + lesson.id}>
      <div className="hero-demo-title">{tr(lesson.title)} <span>→</span></div>
      <Stage views={s.views.filter(v => v.k !== 'vars').slice(0, 1)} />
      <div className="hero-demo-msg">{tr(s.msg)}</div>
    </a>
  )
}

export function Home() {
  const { ui, tr, p } = useApp()
  const [q, setQ] = useState('')
  const [level, setLevel] = useState<Level | ''>('')
  const [cat, setCat] = useState<Cat | ''>('')
  const [fav, setFav] = useState(false)

  const doneCount = LESSONS.filter(l => p.done[l.id]).length
  const nextUp = (p.last && !p.done[p.last] && BY_ID.get(p.last)) || LESSONS.find(l => !p.done[l.id]) || LESSONS[0]
  const needle = q.trim().toLowerCase()
  const list = LESSONS.filter(l =>
    (!level || l.level === level) && (!cat || l.cat === cat) && (!fav || p.fav[l.id]) &&
    (!needle || (l.title[0] + ' ' + l.title[1] + ' ' + l.blurb[0] + ' ' + l.blurb[1] + ' ' + l.id).toLowerCase().includes(needle)))
  const cats = (Object.keys(CATS) as Cat[]).filter(c => LESSONS.some(l => l.cat === c))

  return (
    <>
      <section className="hero">
        <div>
          <h1>{ui('heroTitle')}</h1>
          <p className="lede">{ui('heroSub')}</p>
          <div className="row">
            <a className="btn primary big" href={'#/learn/' + nextUp.id}>{doneCount || p.last ? ui('resume') : ui('start')}: {tr(nextUp.title)}</a>
            <a className="btn big" href="#/syllabus">{ui('browse')}</a>
          </div>
          <div className="stats">
            <span><b>{LESSONS.length}</b> {ui('lessons')}</span>
            <span><b>{SECTION_COUNT}</b> {ui('points')}</span>
            <span><b>{doneCount}</b> {ui('learned')}</span>
          </div>
        </div>
        <HeroDemo />
      </section>

      <section className="levels">
        {(Object.keys(LEVELS) as Level[]).map(lv => {
          const all = LESSONS.filter(l => l.level === lv), d = all.filter(l => p.done[l.id]).length
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
          <button className={!cat ? 'on' : ''} onClick={() => setCat('')}>{ui('all')}</button>
          {cats.map(c => <button key={c} className={cat === c ? 'on' : ''} onClick={() => setCat(cat === c ? '' : c)}>{tr(CATS[c])}</button>)}
          <button className={fav ? 'on' : ''} onClick={() => setFav(!fav)}>★ {ui('favOnly')}</button>
        </div>
      </section>

      {list.length ? <section className="lesson-grid">{list.map(l => <LessonCard key={l.id} lesson={l} />)}</section> : <p className="empty">{ui('none')}</p>}
    </>
  )
}
