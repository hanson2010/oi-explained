import type { Practice } from '../../engine/types'

/** Problems on online judges for each lesson, easiest first within a judge. Titles are checked with `npm run check:practice`. */
export const PRACTICE: Record<string, Practice[]> = {
  kmp: [
    { judge: 'acwing', id: '833', title: '831. KMP字符串' },
    { judge: 'acwing', id: '143', title: '141. 周期' },
    { judge: 'luogu', id: 'P3375', title: 'P3375 【模板】KMP' },
    { judge: 'luogu', id: 'P4391', title: 'P4391 [BalticOI 2009] Radio Transmission 无线传输' },
    { judge: 'cf', id: '126B', title: '126B. Password' },
  ],
  'string-hash': [
    { judge: 'acwing', id: '843', title: '841. 字符串哈希' },
    { judge: 'acwing', id: '140', title: '138. 兔子与兔子' },
    { judge: 'luogu', id: 'P3370', title: 'P3370 【模板】字符串哈希' },
    { judge: 'luogu', id: 'P4503', title: 'P4503 [CTSC2014] 企鹅 QQ' },
    { judge: 'cf', id: '271D', title: '271D. Good Substrings' },
  ],
  manacher: [
    { judge: 'acwing', id: '3190', title: '3188. manacher算法' },
    { judge: 'acwing', id: '141', title: '139. 回文子串的最大长度' },
    { judge: 'luogu', id: 'P3805', title: 'P3805 【模板】Manacher' },
    { judge: 'cf', id: '1326D2', title: '1326D2. Prefix-Suffix Palindrome (Hard version)' },
  ],
  'z-function': [
    { judge: 'luogu', id: 'P5410', title: 'P5410 【模板】扩展 KMP / exKMP（Z 函数）' },
    { judge: 'cf', id: '432D', title: '432D. Prefixes and Suffixes' },
  ],
  'ac-automaton': [
    { judge: 'acwing', id: '1284', title: '1282. 搜索关键词' },
    { judge: 'luogu', id: 'P3808', title: 'P3808 AC 自动机（简单版）' },
    { judge: 'luogu', id: 'P3796', title: 'P3796 AC 自动机（简单版 II）' },
    { judge: 'luogu', id: 'P5357', title: 'P5357 【模板】AC 自动机' },
    { judge: 'cf', id: '1202E', title: '1202E. You Are Given Some Strings...' },
  ],
  'suffix-array': [
    { judge: 'acwing', id: '2717', title: '2715. 后缀数组' },
    { judge: 'acwing', id: '142', title: '140. 后缀数组' },
    { judge: 'luogu', id: 'P3809', title: 'P3809 【模板】后缀排序（SA）' },
  ],
  sam: [
    { judge: 'acwing', id: '2768', title: '2766. 后缀自动机' },
    { judge: 'luogu', id: 'P2408', title: 'P2408 不同子串个数' },
    { judge: 'luogu', id: 'P3804', title: 'P3804 【模板】后缀自动机（SAM）' },
  ],
}
