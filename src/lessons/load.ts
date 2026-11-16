import { useEffect, useState } from 'react'
import type { Cat, Lesson } from '../engine/types'
import { META_BY_ID } from './meta'

/** One chunk of JavaScript per category, downloaded when a lesson in it is first opened. */
const LOADERS: Record<Cat, () => Promise<{ default: Lesson[] }>> = {
  basic: () => import('./basic'),
  sort: () => import('./sort'),
  search: () => import('./search'),
  ds: () => import('./ds'),
  graph: () => import('./graph'),
  dp: () => import('./dp'),
  string: () => import('./string'),
  math: () => import('./math'),
}

const loaded = new Map<string, Lesson>()
const pending = new Map<Cat, Promise<void>>()

function loadCat(cat: Cat): Promise<void> {
  let p = pending.get(cat)
  if (!p) {
    p = LOADERS[cat]().then(m => { for (const l of m.default) loaded.set(l.id, l) })
    pending.set(cat, p)
  }
  return p
}

/**
 * The lesson with this id once its category has been downloaded. The id must be in meta.ts.
 * A failed download is reported and not retried here: browsers remember a failed import, and after a new deployment
 * the old file no longer exists, so the way to recover is to reload the page.
 */
export function useLesson(id: string): { lesson?: Lesson; error: boolean } {
  const [, bump] = useState(0)
  const [error, setError] = useState(false)
  const lesson = loaded.get(id), cat = META_BY_ID.get(id)?.cat
  useEffect(() => {
    if (lesson || !cat) return
    let live = true
    loadCat(cat).then(() => { if (live) bump(x => x + 1) }, () => { if (live) setError(true) })
    return () => { live = false }
  }, [id, cat])
  return { lesson, error: !lesson && error }
}
