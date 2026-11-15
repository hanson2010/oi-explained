import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { L } from './engine/types'
import { UI, type UIKey } from './i18n'

export interface Profile {
  lang: 'en' | 'zh'
  theme: 'light' | 'dark'
  name: string
  /** lesson id → timestamp when marked as learned */
  done: Record<string, number>
  fav: Record<string, true>
  last?: string
}

const KEY = 'oi-explained:v1'

function load(): Profile {
  const base: Profile = {
    lang: typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en',
    theme: typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
    name: '', done: {}, fav: {},
  }
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...base, ...sanitize(JSON.parse(raw)) }
  } catch { /* storage unavailable or corrupt: start fresh */ }
  return base
}

/** Keeps only well-formed fields, so imported or stale data cannot break the app. */
export function sanitize(x: unknown): Partial<Profile> {
  const o = (x && typeof x === 'object' ? x : {}) as Record<string, unknown>, p: Partial<Profile> = {}
  if (o.lang === 'en' || o.lang === 'zh') p.lang = o.lang
  if (o.theme === 'light' || o.theme === 'dark') p.theme = o.theme
  if (typeof o.name === 'string') p.name = o.name.slice(0, 40)
  if (typeof o.last === 'string') p.last = o.last
  if (o.done && typeof o.done === 'object') p.done = Object.fromEntries(Object.entries(o.done).filter(([, v]) => typeof v === 'number')) as Record<string, number>
  if (o.fav && typeof o.fav === 'object') p.fav = Object.fromEntries(Object.keys(o.fav).map(k => [k, true as const]))
  return p
}

interface Ctx {
  p: Profile
  set(patch: Partial<Profile>): void
  /** Picks the current language from a localised pair. */
  tr(l: L): string
  ui(k: UIKey): string
  toggleDone(id: string): void
  toggleFav(id: string): void
}

const C = createContext<Ctx>(null!)
export const useApp = () => useContext(C)

export function AppProvider({ children }: { children: ReactNode }) {
  const [p, setP] = useState(load)
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(p)) } catch { /* ignore */ }
    document.documentElement.dataset.theme = p.theme
    document.documentElement.lang = p.lang === 'zh' ? 'zh-CN' : 'en'
  }, [p])
  const set = useCallback((patch: Partial<Profile>) => setP(o => ({ ...o, ...patch })), [])
  const value = useMemo<Ctx>(() => {
    const i = p.lang === 'zh' ? 1 : 0
    return {
      p, set,
      tr: l => l[i],
      ui: k => UI[k][i],
      toggleDone: id => setP(o => { const done = { ...o.done }; if (done[id]) delete done[id]; else done[id] = Date.now(); return { ...o, done } }),
      toggleFav: id => setP(o => { const fav = { ...o.fav }; if (fav[id]) delete fav[id]; else fav[id] = true; return { ...o, fav } }),
    }
  }, [p, set])
  return <C.Provider value={value}>{children}</C.Provider>
}

/** Minimal hash router: "#/learn/kmp" → ["learn", "kmp"]. */
export function useRoute(): string[] {
  const read = () => location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent)
  const [r, setR] = useState(read)
  useEffect(() => {
    const on = () => { setR(read()); window.scrollTo(0, 0) }
    addEventListener('hashchange', on)
    return () => removeEventListener('hashchange', on)
  }, [])
  return r
}
