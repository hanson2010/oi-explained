// Fetches every practice problem and compares the title on the judge with the one listed (npm run check:practice).
// The judges are outside sites, so this is run by hand, not in CI. Name judges to check only those, and resume
// from a given problem with --from:
//   npm run check:practice -- luogu cf
//   npm run check:practice -- acwing --from acwing:851
//
// AcWing shows problems only to logged-in users, and problems that belong to a course only to accounts that have the course.
// Export the browser's cookies for www.acwing.com as JSON (an array of { name, value, domain }) into the cookies folder,
// one file per account, named www.acwing.com_cookies*.json; each problem is tried with one account after another.
// ACWING_COOKIES may instead list the files, separated by the system's path separator.
// The cookies folder is ignored by git. The cookies are sent only to https://www.acwing.com and are never printed.
//
// AcWing refuses pages (a redirect to /403/) when asked too often, and its administrators have frozen accounts whose
// cookies were used for fast automated requests. So its pages are fetched very slowly: at most one request a minute.
// ACWING_DELAY can only make that slower. The first refusal stops all AcWing checks; the summary names the problem
// to resume from.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { delimiter, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const AGENT = 'Mozilla/5.0 (compatible; oi-explained practice link checker)'
const ACWING_DELAY = 1000 * Math.max(60, Number(process.env.ACWING_DELAY) || 60), LUOGU_DELAY = 1000
const sleep = ms => new Promise(r => setTimeout(r, ms))
const decode = s => s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
const titleOf = html => decode(html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? '').trim()

/** One cookie header per AcWing account. */
function acwingAccounts() {
  const dir = fileURLToPath(new URL('../cookies/', import.meta.url))
  const files = process.env.ACWING_COOKIES ? process.env.ACWING_COOKIES.split(delimiter).filter(Boolean)
    : existsSync(dir) ? readdirSync(dir).filter(f => /^www\.acwing\.com_cookies.*\.json$/.test(f)).sort().map(f => join(dir, f)) : []
  const now = Date.now() / 1000
  return files.map(file => {
    const jar = JSON.parse(readFileSync(file, 'utf8'))
    const ok = (Array.isArray(jar) ? jar : []).filter(c => typeof c?.name === 'string' && typeof c?.value === 'string' && /(^|\.)acwing\.com$/.test(String(c.domain ?? '').replace(/^\./, '')))
    const name = file.split(/[\\/]/).pop()
    if (ok.some(c => c.expirationDate && c.expirationDate < now)) console.warn(`${name}: some cookies have expired; log in again and export them anew.`)
    return { name, cookie: ok.map(c => `${c.name}=${c.value}`).join('; ') }
  })
}

/** Follows redirects within one host by hand, keeping the cookies it sets (Luogu answers the first request with a cookie and a redirect). */
async function get(url, cookie = '') {
  const host = new URL(url).host
  const jar = new Map(cookie ? cookie.split('; ').map(c => [c.slice(0, c.indexOf('=')), c]) : [])
  for (let hop = 0; hop < 5; hop++) {
    const r = await fetch(url, { redirect: 'manual', headers: { 'user-agent': AGENT, cookie: [...jar.values()].join('; ') } })
    for (const c of r.headers.getSetCookie()) { const kv = c.split(';')[0]; jar.set(kv.slice(0, kv.indexOf('=')), kv) }
    if (r.status < 300 || r.status >= 400) return { status: r.status, html: await r.text() }
    const next = new URL(r.headers.get('location') ?? '', url)
    if (next.host !== host || next.protocol !== 'https:') return { status: r.status, html: '', moved: next.pathname }
    // AcWing sends refused requests to its own /403/ page or to the course page; report those instead of following them.
    if (host === 'www.acwing.com' && !next.pathname.startsWith('/problem/')) return { status: r.status, html: '', moved: next.pathname }
    url = next.href
  }
  return { status: 0, html: '' }
}

let throttled = false
let acwingRequests = 0
/** The title of an AcWing problem, trying every account; undefined once AcWing refuses requests. */
async function acwing(url, accounts) {
  const seen = []
  for (const a of accounts) {
    await sleep(ACWING_DELAY)
    const r = await get(url, a.cookie)
    acwingRequests++
    if (r.moved?.startsWith('/403')) { throttled = true; return undefined }
    const t = r.status === 200 ? titleOf(r.html).replace(/\s*-\s*AcWing题库$/, '') : ''
    if (t && !/^登录/.test(t)) return t
    seen.push(`${a.name}: ${r.moved?.startsWith('/activity') ? 'needs the course at ' + r.moved : t ? 'not logged in' : 'HTTP ' + r.status}`)
  }
  return `(${seen.join('; ') || 'no cookies: see the top of this script'})`
}

const server = await createServer({ configFile: false, server: { middlewareMode: true, ws: false }, appType: 'custom', logLevel: 'error', optimizeDeps: { noDiscovery: true } })
let LESSONS, JUDGES
try {
  ;({ LESSONS } = await server.ssrLoadModule('/src/lessons/all.ts'))
  ;({ JUDGES } = await server.ssrLoadModule('/src/practice.ts'))
} finally {
  await server.close()
}

const args = process.argv.slice(2), fromAt = args.indexOf('--from'), from = fromAt >= 0 ? args[fromAt + 1] : undefined
const only = args.filter((a, i) => i !== fromAt && i !== fromAt + 1)
const problems = new Map()
for (const l of LESSONS) for (const x of l.practice ?? []) if (!only.length || only.includes(x.judge)) problems.set(`${x.judge}:${x.id}`, x)
if (from) {
  const keys = [...problems.keys()], at = keys.indexOf(from)
  if (at < 0) { console.error(`--from ${from}: no such problem among those checked.`); process.exit(2) }
  for (const k of keys.slice(0, at)) problems.delete(k)
}

const accounts = problems.size && [...problems.values()].some(x => x.judge === 'acwing') ? acwingAccounts() : []
let cf
const failed = [], unchecked = []
for (const [key, x] of problems) {
  const url = JUDGES[x.judge].url(x.id)
  if (x.judge === 'acwing' && throttled) { unchecked.push(key); continue }
  let found
  try {
    if (x.judge === 'cf') {
      if (!cf) {
        const r = await fetch('https://codeforces.com/api/problemset.problems', { headers: { 'user-agent': AGENT } }).then(r => r.json())
        if (r.status !== 'OK') throw new Error('Codeforces API: ' + r.comment)
        cf = new Map(r.result.problems.map(p => [`${p.contestId}${p.index}`, `${p.contestId}${p.index}. ${p.name}`]))
      }
      found = cf.get(x.id) ?? '(no such problem)'
    } else if (x.judge === 'acwing') {
      found = await acwing(url, accounts)
      if (found === undefined) { unchecked.push(key); console.log(`AcWing refused request ${acwingRequests} (at ${key}); no more AcWing requests are sent. Resume later with --from ${key}.`); continue }
    } else {
      await sleep(LUOGU_DELAY)
      const r = await get(url)
      found = r.status === 200 ? titleOf(r.html).replace(/\s*-\s*洛谷$/, '') : `(HTTP ${r.status})`
    }
  } catch (e) {
    found = `(${e.message})`
  }
  const ok = found === x.title
  if (!ok) failed.push(key)
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${key.padEnd(14)} ${x.title}${ok ? '' : `\n     page says: ${found}\n     ${url}`}`)
}
console.log(`\n${problems.size} problems: ${problems.size - failed.length - unchecked.length} ok, ${failed.length} failed, ${unchecked.length} not checked.`)
process.exitCode = failed.length || unchecked.length ? 1 : 0
