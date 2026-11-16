import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useApp } from '../store'

/** Splits lesson code into display lines and a tag → line-index map (strips the trailing `//@tag` markers). */
export function parseCode(code: string) {
  const tags: Record<string, number> = {}
  const lines = code.split('\n').map((ln, i) => {
    const m = ln.match(/\s*\/\/@(\w+)\s*$/)
    if (!m) return ln
    tags[m[1]] = i
    return ln.slice(0, m.index)
  })
  return { lines, tags }
}

const KW = 'if|else|for|while|do|return|break|continue|struct|class|using|namespace|const|static|void|auto|template|typename|typedef|switch|case|default|public|private|new|delete|true|false|sizeof|operator|inline|nullptr'
const TY = 'int|long|char|bool|double|float|unsigned|size_t|string|vector|pair|queue|deque|stack|priority_queue|set|map|array|greater|tuple|bitset'
const RE = new RegExp(String.raw`(//.*$)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(^\s*#\s*\w+(?:\s*<[^>]*>)?)|\b(\d+(?:\.\d+)?[a-zA-Z]*)\b|\b(${KW})\b|\b(${TY})\b`, 'g')
const CLS = ['', 'c-com', 'c-str', 'c-pre', 'c-num', 'c-kw', 'c-ty']

function highlight(line: string): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0, k = 0
  for (const m of line.matchAll(RE)) {
    if (m.index > last) out.push(line.slice(last, m.index))
    const g = m.slice(1).findIndex(x => x !== undefined) + 1
    out.push(<span key={k++} className={CLS[g]}>{m[0]}</span>)
    last = m.index + m[0].length
  }
  if (last < line.length) out.push(line.slice(last))
  return out
}

interface Props {
  lines: string[]
  /** Line index to highlight and keep in view. */
  active?: number
  /** Line index → badge shown in the gutter (note numbers). */
  marks?: Record<number, number>
  /** Line index emphasised softly. */
  hover?: number
  /** Line index → explanation shown as a comment above that line. */
  comments?: Record<number, string>
  /** Called with the line the pointer is on, or undefined when it leaves. */
  onHover?(line: number | undefined): void
  /** Makes lines clickable (the "find the bug" exercise). */
  onPick?(line: number): void
  /** Line index → verdict on a line that was picked. */
  picked?: Record<number, 'ok' | 'bad'>
}

/** The listing as plain text, with each explanation as a `//` comment above its line. */
export function withComments(lines: string[], comments: Record<number, string>) {
  return lines.flatMap((ln, i) => (comments[i] ? [ln.match(/^\s*/)![0] + '// ' + comments[i], ln] : [ln])).join('\n') + '\n'
}

/** Copies the text it is given (evaluated on click) to the clipboard. */
export function CopyButton({ text, className }: { text(): string; className?: string }) {
  const { ui } = useApp()
  const [copied, setCopied] = useState(false)
  const copy = () => navigator.clipboard?.writeText(text()).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) })
  return <button className={className} onClick={copy}>{copied ? '✓ ' + ui('copied') : ui('copy')}</button>
}

export function Code({ lines, active, marks, hover, comments, onHover, onPick, picked }: Props) {
  const html = useMemo(() => lines.map(highlight), [lines])
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = box.current?.querySelector<HTMLElement>('.ln.on')
    const b = box.current
    if (!el || !b) return
    // Scroll inside the code box only; never move the page.
    const top = el.offsetTop // .code is position: relative
    if (top < b.scrollTop + 20 || top > b.scrollTop + b.clientHeight - 40) b.scrollTo({ top: top - b.clientHeight / 2, behavior: 'smooth' })
  }, [active])
  return (
    <div className={'code' + (onPick ? ' pickable' : '')} ref={box}>
      {html.map((h, i) => (
        <div key={i} onMouseEnter={onHover && (() => onHover(i))} onMouseLeave={onHover && (() => onHover(undefined))}>
          {comments?.[i] && (
            <div className={'ln note' + (i === hover ? ' hov' : '')}>
              <span className="no" />
              <code className="c-com" style={{ paddingLeft: lines[i].match(/^\s*/)![0].length + 'ch' }}>// {comments[i]}</code>
            </div>
          )}
          <div className={'ln' + (i === active ? ' on' : '') + (i === hover ? ' hov' : '') + (picked?.[i] ? ' pick-' + picked[i] : '')}
            {...(onPick && lines[i].trim() ? { role: 'button', tabIndex: 0, onClick: () => onPick(i), onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter') onPick(i) } } : {})}>
            <span className="no">{picked?.[i] ? <b>{picked[i] === 'ok' ? '✓' : '✗'}</b> : marks?.[i] ? <b>{marks[i]}</b> : i + 1}</span>
            <code>{h.length ? h : ' '}</code>
          </div>
        </div>
      ))}
    </div>
  )
}
