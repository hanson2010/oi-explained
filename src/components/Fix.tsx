import { useMemo, useState } from 'react'
import { brokenCode, Rng, Tracer, type Lesson } from '../engine/types'
import { useApp } from '../store'
import { parseCode } from './Code'
import { Player } from './Player'
import { Rich } from './Rich'

const out = (lesson: Lesson, input: string, bug: boolean) => {
  const t = new Tracer(false)
  try { lesson.run(input, t, bug) } catch { return '' }
  return t.output
}
const same = (a: string, b: string) => a.split(/\s+/).filter(Boolean).join(' ') === b.split(/\s+/).filter(Boolean).join(' ')

/** The first small generated input on which the broken version prints a wrong answer. The tests guarantee there is one among these seeds. */
export function failingInput(lesson: Lesson): string | undefined {
  for (let seed = 1; seed <= 50; seed++) {
    const input = lesson.gen(lesson.sizes[0], new Rng(seed))
    if (!same(out(lesson, input, false), out(lesson, input, true))) return input
  }
}

/** The line of the listing that the broken version changes. */
export function bugLine(lesson: Lesson): number {
  const a = lesson.code.split('\n'), b = brokenCode(lesson).split('\n')
  return a.findIndex((ln, i) => ln !== b[i])
}

/** "Find the bug": the lesson's program with one mistake, run on an input where it fails. The learner clicks the line that is wrong. */
export function Fix({ lesson }: { lesson: Lesson }) {
  const { ui, tr } = useApp()
  const input = useMemo(() => failingInput(lesson), [lesson])
  const bug = useMemo(() => bugLine(lesson), [lesson])
  // The same lesson with the broken program behind it. No flowchart: it describes the correct method.
  const shown = useMemo<Lesson>(() => ({ ...lesson, code: brokenCode(lesson), run: (inp, t) => lesson.run(inp, t, true), flow: undefined, first: undefined }), [lesson])
  const good = useMemo(() => parseCode(lesson.code).lines[bug], [lesson, bug])
  const [picked, setPicked] = useState<Record<number, 'ok' | 'bad'>>({})
  const found = picked[bug] === 'ok', misses = Object.values(picked).filter(v => v === 'bad').length
  const pick = (line: number) => { if (!found) setPicked(p => ({ ...p, [line]: line === bug ? 'ok' : 'bad' })) }

  return (
    <div className="fix">
      <section className={'card fix-brief' + (found ? ' found' : '')}>
        {found ? (
          <>
            <h3>✓ {ui('fixFound')}{misses > 0 && <small> · {misses} {ui('fixMisses')}</small>}</h3>
            <p><Rich text={tr(lesson.broken!.why)} /></p>
            <p className="fix-lines"><span>{ui('fixCorrect')}</span><code>{good.trim()}</code></p>
          </>
        ) : (
          <>
            <h3>{ui('fixTitle')}</h3>
            <p>{ui('fixIntro')}</p>
            <p className="row">
              {misses > 0 && <span className="muted">{misses} {ui('fixMisses')}</span>}
              <button onClick={() => setPicked(p => ({ ...p, [bug]: 'ok' }))}>{ui('fixShow')}</button>
            </p>
          </>
        )}
      </section>
      <Player lesson={shown} initial={input} expect={inp => out(lesson, inp, false)} pick={{ on: pick, picked }} />
    </div>
  )
}
