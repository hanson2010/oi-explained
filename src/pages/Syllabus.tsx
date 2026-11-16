import { Diff } from '../components/bits'
import { SYLLABUS, type Item } from '../data/syllabus'
import type { Level } from '../engine/types'
import { LEVELS } from '../i18n'
import { BY_ID } from '../lessons'
import { replaceRoute, setQuery, useApp } from '../store'

/** The level is part of the address ("#/syllabus/S") and the filter a query parameter, so both survive Back and can be linked to. */
export function SyllabusPage({ level: lvl, query }: { level?: string; query: URLSearchParams }) {
  const { ui, tr, p } = useApp()
  const level: Level = SYLLABUS.some(l => l.id === lvl) ? (lvl as Level) : 'J', only = query.get('covered') === '1'
  const setLevel = (x: Level) => replaceRoute('syllabus/' + x, query), setOnly = (x: boolean) => setQuery({ covered: x ? '1' : '' })
  const lv = SYLLABUS.find(l => l.id === level)!
  const zh = p.lang === 'zh'
  const count = (l: (typeof SYLLABUS)[number]) => {
    let all = 0, cov = 0
    for (const s of l.sections) for (const g of s.groups) for (const it of g.items) { all++; if (it[3]?.length) cov++ }
    return { all, cov }
  }

  const row = (it: Item, k: number) => {
    const ls = (it[3] ?? []).map(id => BY_ID.get(id)).filter(x => !!x)
    if (only && !ls.length) return null
    return (
      <li key={k} className={ls.length ? 'has' : ''}>
        <Diff d={it[0]} />
        <span className="syl-name">{zh ? it[1] : it[2]}{!zh && <small lang="zh-CN">{it[1]}</small>}</span>
        <span className="syl-links">
          {ls.map(l => <a key={l.id} className={p.done[l.id] ? 'done' : ''} href={'#/learn/' + l.id}>{p.done[l.id] ? '✓ ' : '▶ '}{tr(l.title)}</a>)}
        </span>
      </li>
    )
  }

  return (
    <div className="syllabus">
      <h1>{ui('navSyllabus')}</h1>
      <p className="lede">{ui('sylIntro')}</p>
      <div className="row">
        <div className="seg big">
          {SYLLABUS.map(l => {
            const c = count(l)
            return <button key={l.id} className={(level === l.id ? 'on ' : '') + 'lv-' + l.id} aria-pressed={level === l.id} onClick={() => setLevel(l.id)}>{l.no} {tr(LEVELS[l.id].name)} <small>{c.cov}/{c.all} {ui('covered')}</small></button>
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
