import { useEffect, useMemo, useRef, useState } from 'react'
import { CATS } from '../i18n'
import { META } from '../lessons/meta'
import { useApp } from '../store'
import { LevelBadge } from './bits'

/** Search box over all lessons, opened from the header, with "/" or with Ctrl/⌘ + K. */
export function Jump({ current }: { current?: string }) {
  const { ui, tr, p } = useApp()
  const dlg = useRef<HTMLDialogElement>(null), list = useRef<HTMLUListElement>(null)
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement, typing = el.tagName === 'TEXTAREA' || el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.isContentEditable
      if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey)) { e.preventDefault(); setOpen(true) }
    }
    addEventListener('keydown', on)
    return () => removeEventListener('keydown', on)
  }, [])
  useEffect(() => {
    const d = dlg.current
    if (!d) return
    if (open && !d.open) { setQ(''); setSel(0); d.showModal() } else if (!open && d.open) d.close()
  }, [open])

  const needle = q.trim().toLowerCase()
  const hits = useMemo(() => {
    if (!needle) return META
    const words = needle.split(/\s+/)
    const score = (l: (typeof META)[number]) => {
      const titles = (l.title[0] + ' ' + l.title[1] + ' ' + l.id).toLowerCase(), rest = (CATS[l.cat].join(' ') + ' ' + l.blurb.join(' ')).toLowerCase()
      let s = 0
      for (const w of words) { if (titles.includes(w)) s += titles.startsWith(w) ? 3 : 2; else if (rest.includes(w)) s += 1; else return 0 }
      return s
    }
    return META.map((l, i) => ({ l, i, s: score(l) })).filter(x => x.s).sort((a, b) => b.s - a.s || a.i - b.i).map(x => x.l)
  }, [needle])
  const at = Math.min(sel, hits.length - 1)
  useEffect(() => { list.current?.querySelector('.on')?.scrollIntoView({ block: 'nearest' }) }, [at, open])

  const go = (id: string) => { setOpen(false); location.hash = '#/learn/' + id }
  const key = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel(Math.min(hits.length - 1, at + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(Math.max(0, at - 1)) }
    else if (e.key === 'Enter' && hits[at]) { e.preventDefault(); go(hits[at].id) }
  }

  return (
    <>
      <button className="jump-open" onClick={() => setOpen(true)} aria-label={ui('jump')} aria-keyshortcuts="/ Control+K">
        <span aria-hidden="true">⌕</span><span className="jump-label">{ui('jump')}</span><kbd>/</kbd>
      </button>
      <dialog ref={dlg} className="jump" aria-label={ui('jump')} onClose={() => setOpen(false)} onClick={e => { if (e.target === dlg.current) setOpen(false) }}>
        {open && (
          <div className="jump-box">
            <input type="search" autoFocus value={q} onChange={e => { setQ(e.target.value); setSel(0) }} onKeyDown={key} placeholder={ui('jumpPh')} aria-label={ui('jump')} role="combobox" aria-expanded="true" aria-controls="jump-list" aria-activedescendant={hits[at] ? 'jump-' + hits[at].id : undefined} />
            {hits.length ? (
              <ul ref={list} id="jump-list" role="listbox">
                {hits.map((l, i) => (
                  <li key={l.id} id={'jump-' + l.id} role="option" aria-selected={i === at} className={(i === at ? 'on ' : '') + 'lv-' + l.level} onMouseMove={() => setSel(i)} onClick={() => go(l.id)}>
                    <span className="jump-mark">{p.done[l.id] ? '✓' : l.id === current ? '●' : ''}</span>
                    <span className="jump-title">{tr(l.title)}</span>
                    <span className="jump-cat">{tr(CATS[l.cat])}</span>
                    <LevelBadge level={l.level} />
                  </li>
                ))}
              </ul>
            ) : <p className="muted jump-none">{ui('jumpNone')}</p>}
            <p className="jump-keys">{ui('jumpKeys')}</p>
          </div>
        )}
      </dialog>
    </>
  )
}
