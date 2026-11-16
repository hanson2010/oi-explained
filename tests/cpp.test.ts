/**
 * Compiles every lesson's C++ listing and checks that it prints what the animation computes.
 * Opt-in: set the GXX environment variable to a g++ executable.
 */
import { execFile } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parseCode } from '../src/components/Code'
import { Rng, Tracer } from '../src/engine/types'
import { LESSONS } from '../src/lessons'

const GXX = process.env.GXX
const dir = GXX ? mkdtempSync(join(tmpdir(), 'oi-cpp-')) : ''
// MinGW needs its own bin directory on PATH to find its DLLs, both to compile and to run.
const env = GXX ? { ...process.env, PATH: dirname(GXX) + (process.platform === 'win32' ? ';' : ':') + process.env.PATH } : process.env

const exec = (file: string, args: string[], input?: string) =>
  new Promise<{ code: number | string | null; stdout: string; stderr: string }>(resolve => {
    const p = execFile(file, args, { env, maxBuffer: 1 << 28, timeout: 120000 }, (err, stdout, stderr) =>
      resolve({ code: err ? (err.code ?? 'error') : 0, stdout, stderr }))
    p.stdin!.on('error', () => { /* the program exited before reading all input; the exit code reports it */ })
    if (input !== undefined) p.stdin!.end(input)
  })

// Deeply recursive listings need more than the default 1 MB stack of Windows executables.
const STACK = process.platform === 'win32' ? ['-Wl,--stack,268435456'] : []

/** Compiler output without the unused-scanf-result warnings, their source excerpts and the "In function" headers. */
const warnings = (stderr: string) => stderr.split('\n').filter(l => !/ignoring return value|: In function |^\s*\d*\s*\|/.test(l)).join('\n').trim()

const toks = (s: string) => s.split(/\s+/).filter(Boolean)
/** Tokens must match; numbers with a decimal point may differ in the sign of zero. */
const sameOutput = (a: string, b: string) => {
  const x = toks(a), y = toks(b)
  return x.length === y.length && x.every((t, i) => t === y[i] || (/\.\d/.test(t) && Number(t) === Number(y[i])))
}

describe.skipIf(!GXX).concurrent('C++ listings', () => {
  it.each(LESSONS.map(l => [l.id, l] as const))('%s', async (id, lesson) => {
    const src = join(dir, id + '.cpp'), exe = join(dir, id + '.exe')
    writeFileSync(src, parseCode(lesson.code).lines.join('\n') + '\n')
    const c = await exec(GXX!, ['-std=c++17', '-O2', '-Wall', '-Wextra', ...STACK, '-o', exe, src])
    expect(c.code, c.stderr).toBe(0)
    expect(warnings(c.stderr), 'compiler warnings').toBe('')
    const cases = [...lesson.sizes.flatMap(n => [1, 2, 3].map(seed => lesson.gen(n, new Rng(seed)))), lesson.gen(lesson.lab[1], new Rng(5)), lesson.gen(lesson.lab[lesson.lab.length - 1], new Rng(6))]
    for (const input of cases) {
      const t = new Tracer(false)
      lesson.run(input, t)
      const r = await exec(exe, [], input)
      expect(r.code, `exit code on\n${input.slice(0, 300)}`).toBe(0)
      expect(sameOutput(r.stdout, t.output), `input:\n${input.slice(0, 400)}\nC++:\n${r.stdout.slice(0, 300)}\nanimation:\n${t.output.slice(0, 300)}`).toBe(true)
    }
    if (!lesson.first) return
    // The first version's listing must compile too and agree with the lesson on every size it is allowed to run.
    const nsrc = join(dir, id + '.naive.cpp'), nexe = join(dir, id + '.naive.exe')
    writeFileSync(nsrc, parseCode(lesson.first.code).lines.join('\n') + '\n')
    const nc = await exec(GXX!, ['-std=c++17', '-O2', '-Wall', '-Wextra', '-o', nexe, nsrc])
    expect(nc.code, nc.stderr).toBe(0)
    expect(warnings(nc.stderr), 'compiler warnings (brute force)').toBe('')
    for (const n of [...lesson.sizes, ...lesson.lab.filter(x => x <= (lesson.first!.maxN ?? Infinity))]) {
      const input = lesson.gen(n, new Rng(9)), t = new Tracer(false)
      lesson.run(input, t)
      const r = await exec(nexe, [], input)
      expect(r.code, `brute force exit code, n=${n}`).toBe(0)
      expect(sameOutput(r.stdout, t.output), `brute force differs, n=${n}`).toBe(true)
    }
  }, 600000)
})
