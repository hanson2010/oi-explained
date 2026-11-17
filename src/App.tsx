import { useEffect, useRef } from 'react'
import { Jump } from './components/Jump'
import { useLesson } from './lessons/load'
import { META_BY_ID } from './lessons/meta'
import { Home } from './pages/Home'
import { LessonPage } from './pages/LessonPage'
import { ProfilePage } from './pages/Profile'
import { SyllabusPage } from './pages/Syllabus'
import { useApp, useRoute } from './store'

/** A lesson's category is downloaded the first time one of its lessons is opened. */
function LessonRoute({ id, tab, step, review }: { id: string; tab?: string; step?: string; review: boolean }) {
  const { ui } = useApp()
  const { lesson, error } = useLesson(id)
  if (lesson) return <LessonPage lesson={lesson} tab={tab} step={step} review={review} />
  if (error) return <div className="empty"><p>{ui('loadFailed')}</p><button className="btn primary" onClick={() => location.reload()}>{ui('retry')}</button></div>
  return <div className="empty" aria-busy="true"><p className="muted">{ui('loading')}</p></div>
}

export function App() {
  const { p, set, ui, tr } = useApp()
  const { path, query } = useRoute()
  const page = path[0] ?? ''
  const lesson = page === 'learn' ? META_BY_ID.get(path[1] ?? '') : undefined
  const name = lesson ? tr(lesson.title) : page === '' ? '' : page === 'syllabus' ? ui('navSyllabus') : page === 'profile' ? ui('navProfile') : ui('notFound')

  // Sticky parts of a page (lesson tabs, side panels) sit below the header, whatever its height is.
  const top = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = top.current!, fit = () => document.documentElement.style.setProperty('--top-h', el.offsetHeight + 'px')
    const ro = new ResizeObserver(fit)
    ro.observe(el); fit()
    return () => ro.disconnect()
  }, [])
  useEffect(() => { document.title = (name ? name + ' · ' : '') + ui('brand') }, [name, p.lang])

  const link = (to: string, on: boolean, label: string) => <a href={'#/' + to} className={on ? 'on' : ''} aria-current={on ? 'page' : undefined}>{label}</a>
  return (
    <>
      <header className="top" ref={top}>
        <a className="brand" href="#/">
          <img src={import.meta.env.BASE_URL + 'favicon.svg'} width="30" height="30" alt="" />
          <span>{ui('brand')}</span>
        </a>
        <nav>
          {link('', page === '' || page === 'learn', ui('navLearn'))}
          {link('syllabus', page === 'syllabus', ui('navSyllabus'))}
          {link('profile', page === 'profile', ui('navProfile'))}
        </nav>
        <Jump current={lesson?.id} />
        <div className="tools">
          <button className="ghost" onClick={() => set({ lang: p.lang === 'zh' ? 'en' : 'zh' })} aria-label={ui('language')}>{p.lang === 'zh' ? 'EN' : '中文'}</button>
          <button className="ghost" onClick={() => set({ theme: p.theme === 'dark' ? 'light' : 'dark' })} aria-label={ui('theme')}>{p.theme === 'dark' ? '☀' : '☾'}</button>
        </div>
      </header>
      <main>
        {page === '' ? <Home query={query} />
          : page === 'syllabus' ? <SyllabusPage level={path[1]} query={query} />
          : page === 'profile' ? <ProfilePage />
          : lesson ? <LessonRoute key={lesson.id} id={lesson.id} tab={path[2]} step={path[3]} review={query.get('review') === '1'} />
          : <div className="empty"><p>{ui('notFound')}</p><a className="btn primary" href="#/">{ui('home')}</a></div>}
      </main>
      <footer className="foot">{ui('footer')}</footer>
    </>
  )
}
