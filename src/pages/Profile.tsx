import { useRef, useState } from 'react'
import { LessonCard } from '../components/bits'
import type { Cat, Level } from '../engine/types'
import { CATS, LEVELS } from '../i18n'
import { META } from '../lessons/meta'
import { sanitize, useApp } from '../store'

export function ProfilePage() {
  const { ui, tr, p, set } = useApp()
  const file = useRef<HTMLInputElement>(null)
  const [err, setErr] = useState('')
  const done = META.filter(l => p.done[l.id])
  const recent = done.slice().sort((a, b) => p.done[b.id] - p.done[a.id]).slice(0, 6)
  const starred = META.filter(l => p.fav[l.id])
  const pct = META.length ? Math.round((100 * done.length) / META.length) : 0

  const exportP = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([JSON.stringify({ name: p.name, done: p.done, fav: p.fav }, null, 2)], { type: 'application/json' }))
    a.download = 'oi-explained-progress.json'
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }
  const importP = async (f?: File) => {
    if (!f) return
    try {
      const s = sanitize(JSON.parse(await f.text()))
      if (!s.done && !s.fav) throw new Error()
      set({ done: { ...p.done, ...s.done }, fav: { ...p.fav, ...s.fav }, name: p.name || s.name || '' })
      setErr('')
    } catch { setErr(ui('importBad')) }
    if (file.current) file.current.value = ''
  }

  const bars = <K extends string>(keys: K[], of: (k: K) => typeof META, label: (k: K) => string, cls: (k: K) => string) =>
    keys.map(k => {
      const all = of(k), d = all.filter(l => p.done[l.id]).length
      if (!all.length) return null
      return <div key={k} className={'prog ' + cls(k)}><span>{label(k)}</span><span className="meter"><i style={{ width: (100 * d) / all.length + '%' }} /></span><span className="num">{d}/{all.length}</span></div>
    })

  return (
    <div className="profile">
      <h1>{p.name ? `${ui('hello')}, ${p.name}` : ui('profTitle')}</h1>
      <p className="muted">{ui('profNote')}</p>
      <div className="profile-grid">
        <section className="card">
          <div className="ring" style={{ ['--pct' as string]: pct }}><b>{pct}%</b><span>{done.length} / {META.length}</span></div>
          {bars(Object.keys(LEVELS) as Level[], k => META.filter(l => l.level === k), k => tr(LEVELS[k].name), k => 'lv-' + k)}
        </section>
        <section className="card">
          {bars(Object.keys(CATS) as Cat[], k => META.filter(l => l.cat === k), k => tr(CATS[k]), () => '')}
        </section>
        <section className="card settings">
          <label>{ui('nickname')}<input value={p.name} maxLength={40} placeholder={ui('nicknamePh')} onChange={e => set({ name: e.target.value })} /></label>
          <label>{ui('language')}
            <div className="seg"><button className={p.lang === 'en' ? 'on' : ''} onClick={() => set({ lang: 'en' })}>English</button><button className={p.lang === 'zh' ? 'on' : ''} onClick={() => set({ lang: 'zh' })}>简体中文</button></div>
          </label>
          <label>{ui('theme')}
            <div className="seg"><button className={p.theme === 'light' ? 'on' : ''} onClick={() => set({ theme: 'light' })}>{ui('light')}</button><button className={p.theme === 'dark' ? 'on' : ''} onClick={() => set({ theme: 'dark' })}>{ui('dark')}</button></div>
          </label>
          <div className="row">
            <button onClick={exportP}>{ui('exportP')}</button>
            <button onClick={() => file.current?.click()}>{ui('importP')}</button>
            <input ref={file} type="file" accept="application/json,.json" hidden onChange={e => importP(e.target.files?.[0])} />
            <button className="danger" onClick={() => { if (confirm(ui('resetAsk'))) set({ done: {}, fav: {}, last: undefined }) }}>{ui('resetP')}</button>
          </div>
          {err && <p className="bad">{err}</p>}
        </section>
      </div>
      {recent.length > 0 && <><h2>{ui('recent')}</h2><section className="lesson-grid">{recent.map(l => <LessonCard key={l.id} lesson={l} />)}</section></>}
      {starred.length > 0 && <><h2>★ {ui('favOnly')}</h2><section className="lesson-grid">{starred.map(l => <LessonCard key={l.id} lesson={l} />)}</section></>}
    </div>
  )
}
