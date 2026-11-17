import type { Practice } from './engine/types'

/** The online judges that practice problems link to, in the order a lesson lists them. */
export const JUDGES: Record<Practice['judge'], { name: string; url(id: string): string; format: RegExp }> = {
  acwing: { name: 'AcWing', url: id => `https://www.acwing.com/problem/content/${id}/`, format: /^[1-9]\d{0,4}$/ },
  luogu: { name: 'Luogu', url: id => `https://www.luogu.com.cn/problem/${id}`, format: /^[PB][1-9]\d{3,4}$/ },
  cf: { name: 'Codeforces', url: id => `https://codeforces.com/problemset/problem/${id.match(/^\d+/)![0]}/${id.replace(/^\d+/, '')}`, format: /^[1-9]\d{0,4}[A-Z]\d?$/ },
}

/** The key of a problem in the profile's `solved`. */
export const practiceKey = (x: Practice) => `${x.judge}:${x.id}`
