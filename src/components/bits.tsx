import type { Lesson, Level } from '../engine/types'
import { CATS, LEVELS } from '../i18n'
import { useApp } from '../store'

export function LevelBadge({ level }: { level: Level }) {
  const { tr } = useApp()
  return <span className={'badge lv-' + level}>{tr(LEVELS[level].name)}</span>
}

/** Syllabus difficulty coefficient as 【X】, matching the syllabus notation. */
export function Diff({ d }: { d: number }) {
  const { ui } = useApp()
  return <span className="diff" title={`${ui('difficulty')} ${d}/10`}>【{d}】</span>
}

export function LessonCard({ lesson }: { lesson: Lesson }) {
  const { tr, p } = useApp()
  return (
    <a className={'lesson-card lv-' + lesson.level + (p.done[lesson.id] ? ' done' : '')} href={'#/learn/' + lesson.id}>
      <div className="lc-top">
        <LevelBadge level={lesson.level} />
        <span className="lc-cat">{tr(CATS[lesson.cat])}</span>
        <Diff d={lesson.diff} />
        {p.fav[lesson.id] && <span className="lc-star" aria-hidden="true">★</span>}
        {p.done[lesson.id] && <span className="lc-check" aria-hidden="true">✓</span>}
      </div>
      <h3>{tr(lesson.title)}</h3>
      <p>{tr(lesson.blurb)}</p>
      <div className="lc-foot"><code>{lesson.time}</code></div>
    </a>
  )
}
