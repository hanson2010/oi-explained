import { BY_ID } from './lessons'
import { Home } from './pages/Home'
import { LessonPage } from './pages/LessonPage'
import { ProfilePage } from './pages/Profile'
import { SyllabusPage } from './pages/Syllabus'
import { useApp, useRoute } from './store'

export function App() {
  const { p, set, ui } = useApp()
  const route = useRoute()
  const page = route[0] ?? ''
  const lesson = page === 'learn' ? BY_ID.get(route[1] ?? '') : undefined

  return (
    <>
      <header className="top">
        <a className="brand" href="#/">
          <img src={import.meta.env.BASE_URL + 'favicon.svg'} width="30" height="30" alt="" />
          <span>{ui('brand')}</span>
        </a>
        <nav>
          <a href="#/" className={page === '' || page === 'learn' ? 'on' : ''}>{ui('navLearn')}</a>
          <a href="#/syllabus" className={page === 'syllabus' ? 'on' : ''}>{ui('navSyllabus')}</a>
          <a href="#/profile" className={page === 'profile' ? 'on' : ''}>{ui('navProfile')}</a>
        </nav>
        <div className="tools">
          <button className="ghost" onClick={() => set({ lang: p.lang === 'zh' ? 'en' : 'zh' })} aria-label={ui('language')}>{p.lang === 'zh' ? 'EN' : '中文'}</button>
          <button className="ghost" onClick={() => set({ theme: p.theme === 'dark' ? 'light' : 'dark' })} aria-label={ui('theme')}>{p.theme === 'dark' ? '☀' : '☾'}</button>
        </div>
      </header>
      <main>
        {page === '' ? <Home />
          : page === 'syllabus' ? <SyllabusPage />
          : page === 'profile' ? <ProfilePage />
          : lesson ? <LessonPage key={lesson.id} lesson={lesson} tab={route[2]} step={route[3]} />
          : <div className="empty"><p>{ui('notFound')}</p><a className="btn primary" href="#/">{ui('home')}</a></div>}
      </main>
      <footer className="foot">{ui('footer')}</footer>
    </>
  )
}
