import { Diff } from '../components/bits'
import { coverage, lessonsOf, SYLLABUS, type Item } from '../data/syllabus'
import type { Level } from '../engine/types'
import { LEVELS } from '../i18n'
import { META_BY_ID } from '../lessons/meta'
import { replaceRoute, setQuery, useApp } from '../store'

const OUT_KEY = { env: 'outEnv', lang: 'outLang', school: 'outSchool', theory: 'outTheory' } as const

/** The level is part of the address ("#/syllabus/S") and the filter a query parameter, so both survive Back and can be linked to. */
export function SyllabusPage({ level: lvl, query }: { level?: string; query: URLSearchParams }) {
  const { ui, tr, p } = useApp()
  const level: Level = SYLLABUS.some(l => l.id === lvl) ? (lvl as Level) : 'J', only = query.get('covered') === '1'
  const setLevel = (x: Level) => replaceRoute('syllabus/' + x, query), setOnly = (x: boolean) => setQuery({ covered: x ? '1' : '' })
  const lv = SYLLABUS.find(l => l.id === level)!
  const zh = p.lang === 'zh'
  const row = (it: Item, k: number) => {
    const ls = lessonsOf(it).map(id => META_BY_ID.get(id)).filter(x => !!x), st = it[3]
    if (only && !ls.length) return null
    return (
      <li key={k} className={ls.length ? 'has' : st === 'planned' ? 'planned' : 'skip'}>
        <Diff d={it[0]} />
        <span className="syl-name">{zh ? it[1] : it[2]}{!zh && <small lang="zh-CN">{it[1]}</small>}</span>
        <span className="syl-links">
          {ls.map(l => <a key={l.id} className={p.done[l.id] ? 'done' : ''} href={'#/learn/' + l.id}>{p.done[l.id] ? '✓ ' : '▶ '}{tr(l.title)}</a>)}
          {st === 'planned' ? <span className="syl-tag">{ui('sylPlanned')}</span> : typeof st === 'string' && <span className="syl-tag off">{ui(OUT_KEY[st])}</span>}
        </span>
      </li>
    )
  }

  return (
    <div className="syllabus">
      <h1>{ui('navSyllabus')}</h1>
      <p className="lede">{ui('sylIntro')}</p>
      <p className="muted small">{ui('sylScope')}</p>
      <div className="row">
        <div className="seg big">
          {SYLLABUS.map(l => {
            const c = coverage(l)
            return <button key={l.id} className={(level === l.id ? 'on ' : '') + 'lv-' + l.id} aria-pressed={level === l.id} onClick={() => setLevel(l.id)}>{l.no} {tr(LEVELS[l.id].name)} <small>{c.covered}/{c.wanted} {ui('covered')}</small></button>
          })}
        </div>
        <label className="check"><input type="checkbox" checked={only} onChange={e => setOnly(e.target.checked)} /> {ui('sylOnly')}</label>
      </div>
      {lv.sections.map(s => {
        const groups = s.groups.map((g, gi) => ({ g, gi, rows: g.items.map(row).filter(Boolean) })).filter(x => x.rows.length)
        if (!groups.length) return null
        return (
          <section key={s.no} className={'syl-section lv-' + level}>
            <h2><span>{s.no}</span> {zh ? s.zh : s.en}</h2>
            <div className="syl-groups">
              {groups.map(({ g, gi, rows }) => (
                <div key={gi} className="syl-group">
                  {g.zh && <h3>{gi + 1}. {zh ? g.zh : g.en}</h3>}
                  <ul>{rows}</ul>
                </div>
              ))}
            </div>
          </section>
        )
      })}
      <p className="muted small">{ui('sylSource')}</p>
    </div>
  )
}
