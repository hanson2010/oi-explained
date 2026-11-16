import type { L, Tones, Variant } from '../../engine/types'
import { arr, need, reader, span, tn, vars } from '../../engine/h'

const cpp = String.raw

/**
 * Versions to learn first: the lesson's own method before one optimisation.
 * `label` names the lesson's own version next to it. The rule and the list are in specs/earlier-versions.md.
 */
export const FIRST: Record<string, { first: Variant; label: L }> = {
  manacher: {
    label: ['Start from the mirror', '从镜像值出发'],
    first: {
      label: ['Expand from zero', '从零开始扩展'],
      blurb: ['The padded string already gives every palindrome a single centre. Here each centre starts with radius 0 and expands character by character, learning nothing from the centres before it: O(n²) on strings like aaaa…a.', '填充后的字符串已经让每个回文串都有唯一的中心。在这个版本里，每个中心都从半径 0 开始逐个字符扩展，完全不利用之前的中心得到的信息：遇到 aaaa…a 这样的串就是 O(n²)。'],
      time: 'O(n²)', space: 'O(n)', maxN: 500000,
      code: cpp`#include <bits/stdc++.h>
using namespace std;

int p[2000005];

int main() {
    string s, t = "^#";
    cin >> s;
    for (char ch : s) { t += ch; t += '#'; }
    t += '$';  //@pad
    int n = t.size(), ans = 0;
    for (int i = 1; i < n - 1; i++) {
        p[i] = 0;  //@center
        while (t[i + p[i] + 1] == t[i - p[i] - 1]) p[i]++;  //@expand
        ans = max(ans, p[i]);
    }
    printf("%d\n", ans);  //@done
}`,
      notes: [
        ['pad', ['The sentinels ^ and $ differ from everything, so the expansion stops at the ends without a bounds check.', '哨兵 ^ 和 $ 与任何字符都不同，所以扩展到两端会自动停下，不需要判断越界。']],
        ['center', ['The line to improve: inside a known palindrome, the mirror position already says how far this one reaches.', '需要改进的就是这一行：在一个已知的回文串内部，镜像位置早就说明了这里至少能扩展多远。']],
      ],
      run(inp, t) {
        const s = reader(inp).str()
        need(/^[a-z]+$/.test(s), 'Strings must be lowercase letters.', '字符串只能由小写字母组成。')
        const T = ['^', '#']
        for (const ch of s) T.push(ch, '#')
        T.push('$')
        const n = T.length, p = new Int32Array(n)
        let ans = 0, cmps = 0
        const view = (i: number, hi: Tones = {}) => [arr('t (padded)', T, { ...tn({ dim: [0, n - 1] }), ...hi }, { i }), arr('p', Array.from(p, (x, k) => (k >= 1 && k <= i ? x : '')), tn({ act: i })), vars({ comparisons: cmps })] as const
        t.s('pad', () => [['Pad with # between characters and sentinels at both ends.', '在字符之间插入 #，两端加上哨兵。'], ...view(0)])
        for (let i = 1; i < n - 1; i++) {
          t.s('center', () => [[`Centre ${i}: start from radius 0.`, `中心 ${i}：从半径 0 开始。`], ...view(i, { [i]: 'act' })])
          for (;;) {
            cmps++
            if (T[i + p[i] + 1] !== T[i - p[i] - 1]) break
            p[i]++
            const r = p[i]
            t.s('expand', () => [[`t[${i + r}] = t[${i - r}] = '${T[i + r]}': radius ${r}.`, `t[${i + r}] = t[${i - r}] = '${T[i + r]}'：半径为 ${r}。`], ...view(i, tn({ cmp: span(i - r, i + r), act: i }))])
          }
          t.tick()
          if (p[i] > ans) ans = p[i]
        }
        t.s('done', () => [[`Longest palindrome has length ${ans}, after ${cmps} comparisons.`, `最长回文子串的长度为 ${ans}，共比较了 ${cmps} 次。`], ...view(n - 2), vars({ answer: ans })])
        t.out(ans)
      },
    },
  },
  'z-function': {
    label: ['Start from the Z-box', '从 Z-box 出发'],
    first: {
      label: ['Compare from zero', '从零开始比较'],
      blurb: ['For every position compare s[i..] with the beginning of s, character by character, starting from nothing. Positions inside a long match repeat comparisons whose outcome is already known.', '对每个位置，都把 s[i..] 与 s 的开头从零开始逐个字符比较。处在一段长匹配内部的位置，会重复做那些结果早已知道的比较。'],
      time: 'O(n²)', space: 'O(n)', maxN: 1000000,
      code: cpp`#include <bits/stdc++.h>
using namespace std;

char s[1000005];
int z[1000005];

int main() {
    scanf("%s", s);
    int n = strlen(s);
    z[0] = n;
    for (int i = 1; i < n; i++) {
        z[i] = 0;  //@start
        while (i + z[i] < n && s[z[i]] == s[i + z[i]]) z[i]++;  //@expand
    }
    for (int i = 0; i < n; i++) printf("%d ", z[i]);
}`,
      notes: [
        ['start', ['The line to improve: if i lies inside an earlier match, part of the answer is already known.', '需要改进的就是这一行：如果 i 落在之前的某段匹配内部，答案的一部分其实已经知道了。']],
        ['expand', ['On aaaa…a position i matches n − i characters: about n²/2 comparisons in total.', '遇到 aaaa…a，位置 i 要匹配 n − i 个字符：总共约 n²/2 次比较。']],
      ],
      run(inp, t) {
        const s = reader(inp).str(), n = s.length, z = new Int32Array(n), S = s.split('')
        need(/^[a-z]+$/.test(s), 'Strings must be lowercase letters.', '字符串只能由小写字母组成。')
        z[0] = n
        let cmps = 0
        const view = (i: number, hi: Tones = {}) => [arr('s', S, hi, { i }), arr('z', Array.from(z, (x, k) => (k <= i ? x : '')), tn({ act: i })), vars({ comparisons: cmps })] as const
        for (let i = 1; i < n; i++) {
          t.s('start', () => [[`i = ${i}: start comparing from scratch.`, `i = ${i}：从头开始比较。`], ...view(i, { [i]: 'act' })])
          while (i + z[i] < n) {
            cmps++
            if (s[z[i]] !== s[i + z[i]]) break
            z[i]++
            const k = z[i]
            t.s('expand', () => [[`s[${k - 1}] = s[${i + k - 1}] = '${s[k - 1]}': z[${i}] = ${k}.`, `s[${k - 1}] = s[${i + k - 1}] = '${s[k - 1]}'：z[${i}] = ${k}。`], ...view(i, tn({ cmp: span(0, k - 1), ok: span(i, i + k - 1) }))])
          }
        }
        t.out(Array.from(z).join(' '))
      },
    },
  },
}
