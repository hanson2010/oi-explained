import type { ReactNode } from 'react'

const RE = /(\*\*.+?\*\*|==.+?==|__.+?__|`.+?`)/g

/** Renders inline markup: **strong**, ==highlight==, __underline__, `code`. */
export function Rich({ text }: { text: string }) {
  const out: ReactNode[] = text.split(RE).map((part, i) => {
    if (i % 2 === 0) return part
    const inner = part.startsWith('`') ? part.slice(1, -1) : part.slice(2, -2)
    return part.startsWith('**') ? <strong key={i}>{inner}</strong>
      : part.startsWith('==') ? <mark key={i}>{inner}</mark>
      : part.startsWith('__') ? <u key={i}>{inner}</u>
      : <code key={i}>{inner}</code>
  })
  return <>{out}</>
}
