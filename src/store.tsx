import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
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
  /** lesson id → answers to "predict the next step" questions: how many were right, how many in all, and when the last one was given */
  quiz: Record<string, { right: number; total: number; at: number }>
  /** practice problem ("judge:id") → timestamp when ticked as solved */
  solved: Record<string, number>
  /** lesson id → timestamps of reviews */
  review: Record<string, number[]>
}

/** The part of a profile that export, import and reset deal with. */
export const PROGRESS = ['done', 'fav', 'quiz', 'solved', 'review'] as const

const KEY = 'oi-explained:v1'

function load(): Profile {
  const base: Profile = {
    lang: typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en',
    theme: typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
    name: '', done: {}, fav: {}, quiz: {}, solved: {}, review: {},
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
  const count = (v: unknown) => typeof v === 'number' && Number.isFinite(v) && v >= 0
  if (o.quiz && typeof o.quiz === 'object' && !Array.isArray(o.quiz)) p.quiz = Object.fromEntries(Object.entries(o.quiz as Record<string, Record<string, unknown>>)
    .filter(([, v]) => v && typeof v === 'object' && count(v.right) && count(v.total) && count(v.at) && (v.right as number) <= (v.total as number))
    .map(([k, v]) => [k, { right: v.right as number, total: v.total as number, at: v.at as number }]))
  if (o.solved && typeof o.solved === 'object' && !Array.isArray(o.solved)) p.solved = Object.fromEntries(Object.entries(o.solved).filter(([, v]) => count(v))) as Record<string, number>
  if (o.review && typeof o.review === 'object' && !Array.isArray(o.review)) p.review = Object.fromEntries(Object.entries(o.review).filter(([, v]) => Array.isArray(v) && v.every(count))) as Record<string, number[]>
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
  /** Records one answer to a "predict the next step" question. */
  answerQuiz(id: string, right: boolean): void
  /** Records that the lesson was reviewed now. */
  markReviewed(id: string): void
  /** Ticks or unticks a practice problem ("judge:id") as solved. */
  toggleSolved(key: string): void
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
      // Unmarking a lesson also forgets its reviews: learning it again starts the schedule afresh.
      toggleDone: id => setP(o => { const done = { ...o.done }, review = { ...o.review }; if (done[id]) { delete done[id]; delete review[id] } else done[id] = Date.now(); return { ...o, done, review } }),
      markReviewed: id => setP(o => ({ ...o, review: { ...o.review, [id]: [...(o.review[id] ?? []), Date.now()] } })),
      toggleSolved: key => setP(o => { const solved = { ...o.solved }; if (solved[key]) delete solved[key]; else solved[key] = Date.now(); return { ...o, solved } }),
      toggleFav: id => setP(o => { const fav = { ...o.fav }; if (fav[id]) delete fav[id]; else fav[id] = true; return { ...o, fav } }),
      answerQuiz: (id, right) => setP(o => { const q = o.quiz[id] ?? { right: 0, total: 0, at: 0 }; return { ...o, quiz: { ...o.quiz, [id]: { right: q.right + (right ? 1 : 0), total: q.total + 1, at: Date.now() } } } }),
    }
  }, [p, set])
  return <C.Provider value={value}>{children}</C.Provider>
}

export interface Route { path: string[]; query: URLSearchParams }

const safe = (x: string) => { try { return decodeURIComponent(x) } catch { return x } }
const parse = (): Route => {
  const [path, query = ''] = location.hash.replace(/^#\/?/, '').split('?')
  return { path: path.split('/').filter(Boolean).map(safe), query: new URLSearchParams(query) }
}
/** What counts as "the same page" for scrolling: tabs of one lesson and levels of the syllabus share a page. */
const pageOf = (r: Route) => (r.path[0] === 'learn' ? 'learn/' + r.path[1] : r.path[0] ?? '')

export const href = (path: string, query?: URLSearchParams | Record<string, string | undefined>) => {
  const q = query instanceof URLSearchParams ? query : new URLSearchParams(Object.entries(query ?? {}).filter((e): e is [string, string] => !!e[1]))
  const qs = q.toString()
  return '#/' + path + (qs ? '?' + qs : '')
}

/** Changes query parameters of the current page in place: filters belong in the URL, not in the history. */
export function setQuery(patch: Record<string, string | undefined>) {
  const { path, query } = parse()
  for (const [k, v] of Object.entries(patch)) if (v) query.set(k, v); else query.delete(k)
  replaceRoute(path.map(encodeURIComponent).join('/'), query)
}

/** Shows another view of the same page (a syllabus level, a filter) without adding a history entry. */
export function replaceRoute(path: string, query?: URLSearchParams | Record<string, string | undefined>) {
  // Browsers limit how often the URL may be rewritten; the view still updates if that limit is hit.
  try { history.replaceState(history.state, '', href(path, query)) } catch { return }
  dispatchEvent(new Event('routechange'))
}

const SCROLL_KEY = 'oi-explained-scroll', KEEP = 60
let revisit = false
/** Whether the page now shown was reached with Back or Forward (its scroll position is then being restored). */
export const isRevisit = () => revisit

/**
 * Minimal hash router: "#/learn/kmp/code?x=1" → { path: ["learn", "kmp", "code"], query }.
 * A new page opens at the top; Back and Forward return to where the page was left; moving within a page keeps the position.
 */
export function useRoute(): Route {
  const [r, setR] = useState(parse)
  const pending = useRef<number | null>(null)
  useEffect(() => {
    let pos: Record<string, number> = {}
    try { pos = JSON.parse(sessionStorage.getItem(SCROLL_KEY) ?? '{}') } catch { /* ignore */ }
    const fresh = () => { const k = Date.now().toString(36) + Math.random().toString(36).slice(2, 6); history.replaceState({ k }, ''); return k }
    history.scrollRestoration = 'manual'
    // Each history entry gets a key; an entry that already has one is being revisited.
    let cur: string = history.state?.k ?? fresh(), page = pageOf(parse()), raf = 0
    if (pos[cur]) scrollTo(0, pos[cur])
    const save = () => {
      pos[cur] = scrollY
      const keys = Object.keys(pos)
      for (const k of keys.slice(0, Math.max(0, keys.length - KEEP))) delete pos[k]
      try { sessionStorage.setItem(SCROLL_KEY, JSON.stringify(pos)) } catch { /* ignore */ }
    }
    // Following a link to the address already shown replaces the entry and drops its key without any event: check on use.
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { cur = history.state?.k ?? fresh(); save() }) }
    const onHash = () => {
      const next = parse(), k: string | undefined = history.state?.k
      // The page being left is still on screen: record where it was.
      cancelAnimationFrame(raf); save()
      revisit = !!k
      if (k) { cur = k; pending.current = pos[k] ?? 0 } else { cur = fresh(); pending.current = pageOf(next) === page ? null : 0 }
      page = pageOf(next)
      setR(next)
    }
    const onQuery = () => setR(parse())
    addEventListener('hashchange', onHash); addEventListener('routechange', onQuery); addEventListener('scroll', onScroll, { passive: true })
    return () => { removeEventListener('hashchange', onHash); removeEventListener('routechange', onQuery); removeEventListener('scroll', onScroll) }
  }, [])
  // Runs after the new page is in the DOM, so a restored position is not clamped by the old page's height.
  useLayoutEffect(() => {
    if (pending.current !== null) scrollTo(0, pending.current)
    pending.current = null
  }, [r])
  return r
}
