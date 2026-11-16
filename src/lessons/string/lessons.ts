import type { GEdge, Lesson, Rng, Tone, Tones } from '../../engine/types'
import { arr, graph, grid, gt, layoutForest, need, reader, span, tn, vars } from '../../engine/h'

const cpp = String.raw
const rndStr = (n: number, r: Rng, alpha: string) => Array.from({ length: n }, () => r.pick([...alpha])).join('')
const lower = (s: string) => need(/^[a-z]+$/.test(s), 'Strings must be lowercase letters.', '字符串只能由小写字母组成。')

const kmp: Lesson = {
  id: 'kmp', title: ['KMP string matching', 'KMP 字符串匹配'], level: 'S', cat: 'string', diff: 6,
  blurb: ['On a mismatch, slide the pattern to its longest border instead of starting over — the text pointer never moves back.', '失配时不从头再来，而是把模式串滑到它的最长 border 处——文本指针永不回退。'],
  ideas: [
    ['A border of a string is a proper prefix that is also a suffix. nxt[i] = length of the longest border of p[0..i].', '字符串的 border 是既是真前缀又是后缀的子串。nxt[i] = p[0..i] 的最长 border 长度。'],
    ['If j characters matched and the next one fails, the last nxt[j−1] matched characters are also a prefix of p — keep them.', '已经匹配了 j 个字符而下一个失配时，已匹配部分的最后 nxt[j−1] 个字符同时是 p 的前缀——把它们保留下来。'],
    ['So set j = nxt[j−1] and retry, never re-reading the text.', '于是令 j = nxt[j−1] 再试，完全不用重读文本。'],
    ['nxt itself is computed by matching the pattern against itself with the same loop.', 'nxt 本身也是用同样的循环，让模式串与自己匹配求出来的。'],
    ['j rises by at most 1 per character and each fallback lowers it, so the total work is O(n + m).', 'j 每个字符至多加 1，而每次回退都会让它减小，所以总工作量是 O(n + m)。'],
  ],
  time: 'O(n + m)', space: 'O(m)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

char s[1000005], p[1000005];
int nxt[1000005];

int main() {
    scanf("%s%s", s, p);
    int n = strlen(s), m = strlen(p);
    for (int i = 1, j = 0; i < m; i++) {
        while (j && p[i] != p[j]) j = nxt[j - 1];  //@pfail
        if (p[i] == p[j]) j++;
        nxt[i] = j;  //@pset
    }
    for (int i = 0, j = 0; i < n; i++) {
        while (j && s[i] != p[j]) j = nxt[j - 1];  //@fail
        if (s[i] == p[j]) j++;  //@ext
        if (j == m) {
            printf("%d ", i - m + 2);  //@found
            j = nxt[j - 1];
        }
    }
}`,
  notes: [
    ['pfail', ['The border of a border is the next shorter border — that is why following nxt enumerates all of them.', 'border 的 border 是下一个更短的 border——所以沿着 nxt 跳就能枚举全部 border。']],
    ['pset', ['j is the longest border of p[0..i].', 'j 就是 p[0..i] 的最长 border 长度。']],
    ['fail', ['Same fallback as in the preprocessing, but comparing against the text.', '与预处理中相同的回退，只是这里与文本比较。']],
    ['found', ['After a full match fall back as well, so overlapping occurrences are found.', '完整匹配之后同样要回退，这样才能找到互相重叠的出现位置。']],
  ],
  input: ['The text, then the pattern (lowercase). Prints every 1-based position where the pattern occurs. (n is the text length.)', '文本串，然后是模式串（小写字母）。输出模式串每次出现的起始位置（从 1 开始）。（n 为文本长度。）'],
  sizes: [10, 14, 18], lab: [10, 1000, 10000, 100000, 1000000],
  gen(n, r) {
    if (n > 30) {
      // Large data is adversarial for brute force: long runs of 'a' in the text, and a pattern "aaa…ab".
      const m = Math.floor(n / 20)
      return `${Array.from({ length: n }, () => (r.next() < 0.5 / m ? 'b' : 'a')).join('')}\n${'a'.repeat(m - 1)}b\n`
    }
    const m = Math.max(1, Math.min(n, r.int(3, 4))), s = rndStr(n, r, 'ab')
    const at = r.int(0, n - m)
    return `${s}\n${r.next() < 0.8 ? s.slice(at, at + m) : rndStr(m, r, 'ab')}\n`
  },
  run(inp, t) {
    const rd = reader(inp), s = rd.str(), p = rd.str(), n = s.length, m = p.length, nxt = new Int32Array(m), out: number[] = []
    lower(s); lower(p)
    const P = p.split(''), S = s.split('')
    const shown = (upto: number) => Array.from(nxt, (x, i) => (i <= upto ? x : ''))
    for (let i = 1, j = 0; i < m; i++) {
      while (j && p[i] !== p[j]) {
        const old = j
        j = nxt[j - 1]
        t.s('pfail', () => [[`Build nxt: p[${i}] = '${p[i]}' ≠ p[${old}] = '${p[old]}' — fall back to border length ${j}.`, `求 nxt：p[${i}] = '${p[i]}' ≠ p[${old}] = '${p[old]}'——回退到 border 长度 ${j}。`], arr('p', P, tn({ ok: span(0, j - 1), act: i, bad: old }), { i, j }), arr('nxt', shown(i - 1))])
      }
      if (p[i] === p[j]) j++
      nxt[i] = j
      t.s('pset', () => [[`nxt[${i}] = ${j}: "${p.slice(0, i + 1)}" has border "${p.slice(0, j)}".`, `nxt[${i}] = ${j}：“${p.slice(0, i + 1)}” 的最长 border 是 “${p.slice(0, j)}”。`], arr('p', P, tn({ ok: span(0, j - 1), cmp: span(i - j + 1, i) }), { i }), arr('nxt', shown(i), tn({ act: i }))])
    }
    // The pattern is drawn under the text, shifted so that p[j] sits below s[i].
    const align = (i: number, j: number, tone: Tones) => { const off = i - j, v: string[] = new Array(Math.max(n, off + m)).fill(''); P.forEach((c, k) => { v[off + k] = c }); const tn2: Tones = {}; for (const k in tone) tn2[off + +k] = tone[k]; return arr('p (aligned)', v, tn2, undefined, { base: -1 }) }
    for (let i = 0, j = 0; i < n; i++) {
      while (j && s[i] !== p[j]) {
        const old = j
        t.ask(() => {
          const c = [...new Set([0, nxt[old - 1], old - 1])].sort((x, y) => x - y)
          return c.length < 2 ? undefined : [[`Mismatch: s[${i}] = '${s[i]}' but p[${old}] = '${p[old]}', with ${old} characters matched. What does j become?`, `失配：s[${i}] = '${s[i]}'，而 p[${old}] = '${p[old]}'，此前已匹配 ${old} 个字符。j 变成多少？`], c.map(x => [`j = ${x}`, `j = ${x}`] as const), c.indexOf(nxt[old - 1])]
        })
        j = nxt[j - 1]
        t.s('fail', () => [[`s[${i}] = '${s[i]}' ≠ p[${old}] = '${p[old]}': keep the border of length ${j}, slide the pattern.`, `s[${i}] = '${s[i]}' ≠ p[${old}] = '${p[old]}'：保留长度为 ${j} 的 border，滑动模式串。`], arr('s', S, tn({ vis: span(i - j, i - 1), bad: i }), { i }), align(i, j, tn({ ok: span(0, j - 1), act: j })), arr('nxt', Array.from(nxt), tn({ act: old - 1 }))])
      }
      const hit = s[i] === p[j]
      if (hit) j++
      const jj = j
      t.s('ext', () => [hit ? [`s[${i}] = '${s[i]}' matches: ${jj} character(s) matched.`, `s[${i}] = '${s[i]}' 匹配：已匹配 ${jj} 个字符。`] : [`s[${i}] = '${s[i]}' ≠ p[0]: move on.`, `s[${i}] = '${s[i]}' ≠ p[0]：继续。`], arr('s', S, tn({ vis: span(i - jj + 1, i - 1), [hit ? 'ok' : 'bad']: i }), { i }), align(i + 1, jj, tn({ ok: span(0, jj - 1) })), vars({ j: jj })])
      if (j === m) {
        out.push(i - m + 2)
        t.s('found', () => [[`Full match at position ${i - m + 2}. Fall back to nxt[${m - 1}] = ${nxt[m - 1]} and continue.`, `在位置 ${i - m + 2} 完整匹配。回退到 nxt[${m - 1}] = ${nxt[m - 1]} 并继续。`], arr('s', S, tn({ ok: span(i - m + 1, i) }), { i }), align(i + 1, m, tn({ ok: span(0, m - 1) })), arr('found at', out)])
        j = nxt[j - 1]
      }
    }
    t.out(out.join(' '))
  },
}

const manacher: Lesson = {
  id: 'manacher', title: ["Manacher's algorithm", 'Manacher 算法'], level: 'S', cat: 'string', diff: 7,
  blurb: ['Find the longest palindrome around every centre in linear time by reusing the mirror image inside the rightmost known palindrome.', '利用“已知最靠右的回文串”内部的对称性，线性地求出以每个位置为中心的最长回文。'],
  ideas: [
    ['Insert # between characters so every palindrome, odd or even, has a single centre cell.', '在字符之间插入 #，这样无论奇偶长度，每个回文串都有唯一的中心格子。'],
    ['p[i] = radius of the longest palindrome centred at i in the padded string = its length in the original.', 'p[i] = 填充串中以 i 为中心的最长回文半径 = 它在原串中的长度。'],
    ['Keep the palindrome [c − p[c], c + p[c]] that reaches furthest right, to r.', '维护右端点最靠右的那个回文串 [c − p[c], c + p[c]]，右端点记为 r。'],
    ['If i < r, its mirror 2c − i lies inside that palindrome, so p[i] ≥ min(p[mirror], r − i) for free.', '若 i < r，它的对称点 2c − i 也在这个回文串内，于是直接得到 p[i] ≥ min(p[对称点], r − i)。'],
    ['Only expansion past r costs anything, and r only moves right: O(n) in total.', '只有越过 r 的扩展才需要真正比较，而 r 只会向右移动：总共 O(n)。'],
  ],
  time: 'O(n)', space: 'O(n)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int p[2000005];

int main() {
    string s, t = "^#";
    cin >> s;
    for (char ch : s) { t += ch; t += '#'; }
    t += '$';  //@pad
    int n = t.size(), ans = 0;
    for (int i = 1, c = 0, r = 0; i < n - 1; i++) {
        p[i] = i < r ? min(p[2 * c - i], r - i) : 0;  //@mirror
        while (t[i + p[i] + 1] == t[i - p[i] - 1]) p[i]++;  //@expand
        if (i + p[i] > r) c = i, r = i + p[i];  //@box
        ans = max(ans, p[i]);
    }
    printf("%d\n", ans);  //@done
}`,
  notes: [
    ['pad', ['^ and $ are sentinels that match nothing, so the expansion loop needs no bounds check.', '^ 和 $ 是不与任何字符相等的哨兵，这样扩展循环无需判断越界。']],
    ['mirror', ['Capped at r − i because nothing is known beyond r.', '要与 r − i 取较小值，因为 r 之外的情况尚不知道。']],
    ['expand', ['Each successful comparison pushes r to the right, which bounds the total work.', '每次成功的比较都会把 r 向右推，由此限制了总工作量。']],
  ],
  input: ['A lowercase string. Prints the length of its longest palindromic substring.', '一个小写字母串。输出它的最长回文子串的长度。'],
  sizes: [5, 7, 9], lab: [10, 1000, 100000, 500000],
  gen: (n, r) => rndStr(n, r, n <= 30 ? 'ab' : 'abc') + '\n',
  run(inp, t) {
    const s = reader(inp).str()
    lower(s)
    const T = ['^', '#'], n0 = s.length
    for (const ch of s) T.push(ch, '#')
    T.push('$')
    const n = T.length, p = new Int32Array(n)
    let ans = 0, c = 0, r = 0, best = 1
    const view = (i: number, hi: Tones = {}) => [arr('t (padded)', T, { ...tn({ dim: [0, n - 1], vis: span(Math.max(1, c - p[c]), r) }), ...hi }, { i, ...(r ? { c, r } : {}) }), arr('p', Array.from(p, (x, k) => (k >= 1 && k <= i ? x : '')), tn({ act: i }))] as const
    t.s('pad', () => [[`Pad "${s.length > 20 ? s.slice(0, 20) + '…' : s}" with # between characters and sentinels at both ends.`, `在 “${s.length > 20 ? s.slice(0, 20) + '…' : s}” 的字符之间插入 #，两端加上哨兵。`], arr('t (padded)', T, tn({ dim: [0, n - 1] }))])
    for (let i = 1; i < n - 1; i++) {
      const inside = i < r, m = 2 * c - i
      p[i] = inside ? Math.min(p[m], r - i) : 0
      t.s('mirror', () => [inside ? [`i = ${i} lies inside the box (r = ${r}); its mirror is ${m}: p[${i}] ≥ min(p[${m}] = ${p[m]}, r − i = ${r - i}) = ${p[i]}.`, `i = ${i} 在盒子内（r = ${r}）；对称点是 ${m}：p[${i}] ≥ min(p[${m}] = ${p[m]}, r − i = ${r - i}) = ${p[i]}。`] : [`i = ${i} is outside the box (r = ${r}): start from p[${i}] = 0.`, `i = ${i} 在盒子之外（r = ${r}）：从 p[${i}] = 0 开始。`], ...view(i, inside ? { [m]: 'cmp', [i]: 'act' } : { [i]: 'act' })])
      while (T[i + p[i] + 1] === T[i - p[i] - 1]) {
        p[i]++
        t.s('expand', () => [[`t[${i + p[i]}] = t[${i - p[i]}] = '${T[i + p[i]]}': expand to p[${i}] = ${p[i]}.`, `t[${i + p[i]}] = t[${i - p[i]}] = '${T[i + p[i]]}'：扩展到 p[${i}] = ${p[i]}。`], ...view(i, { ...tn({ ok: span(i - p[i], i + p[i]) }), [i]: 'act' })])
      }
      if (i + p[i] > r) {
        c = i; r = i + p[i]
        t.s('box', () => [[`This palindrome reaches further right: the box is now centred at ${c} with r = ${r}.`, `这个回文串的右端更靠右：盒子更新为中心 ${c}、右端 r = ${r}。`], ...view(i, { [i]: 'act' })])
      }
      if (p[i] > ans) { ans = p[i]; best = i }
    }
    t.s('done', () => [[`Longest palindrome has length ${ans}${n0 <= 40 ? `: "${T.slice(best - ans, best + ans + 1).filter(x => x !== '#').join('')}"` : ''}.`, `最长回文子串长度为 ${ans}${n0 <= 40 ? `：“${T.slice(best - ans, best + ans + 1).filter(x => x !== '#').join('')}”` : ''}。`], arr('t (padded)', T, tn({ dim: [0, n - 1], ok: span(best - ans, best + ans) })), arr('p', Array.from(p), tn({ ok: best })), vars({ answer: ans })])
    t.out(ans)
  },
}

const zfn: Lesson = {
  id: 'z-function', title: ['Extended KMP (Z-function)', '扩展 KMP（Z 函数）'], level: 'N', cat: 'string', diff: 8,
  needs: ['kmp'],
  blurb: ['z[i] is how far the suffix starting at i agrees with the whole string. A sliding "Z-box" lets each value start from what is already known.', 'z[i] 表示从 i 开始的后缀与整个串能匹配多长。借助滑动的“Z 盒子”，每个值都可以从已知信息出发。'],
  ideas: [
    ['z[i] = length of the longest common prefix of s and s[i..].', 'z[i] = s 与 s[i..] 的最长公共前缀长度。'],
    ['Z-box [l, r): the match found so far that ends furthest right, i.e. s[l..r) = s[0..r−l).', 'Z 盒子 [l, r)：目前找到的右端最靠右的一段匹配，即 s[l..r) = s[0..r−l)。'],
    ['For i inside the box, s[i..r) equals s[i−l..r−l), so z[i] ≥ min(z[i − l], r − i).', '当 i 在盒子内时，s[i..r) 与 s[i−l..r−l) 相同，所以 z[i] ≥ min(z[i − l], r − i)。'],
    ['Then extend by direct comparison and move the box if the match goes past r.', '然后直接比较继续扩展；如果匹配越过了 r，就更新盒子。'],
    ['To match a pattern p in a text t, compute Z of p + "#" + t and look for z[i] = |p|.', '要在文本 t 中匹配模式 p，只需求 p + "#" + t 的 Z 函数，找 z[i] = |p| 的位置。'],
  ],
  time: 'O(n)', space: 'O(n)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

char s[1000005];
int z[1000005];

int main() {
    scanf("%s", s);
    int n = strlen(s);
    z[0] = n;
    for (int i = 1, l = 0, r = 0; i < n; i++) {
        if (i < r) z[i] = min(z[i - l], r - i);  //@reuse
        while (i + z[i] < n && s[z[i]] == s[i + z[i]]) z[i]++;  //@expand
        if (i + z[i] > r) l = i, r = i + z[i];  //@box
    }
    for (int i = 0; i < n; i++) printf("%d ", z[i]);
}`,
  notes: [
    ['reuse', ['i − l is the position inside the prefix that corresponds to i inside the box.', 'i − l 是盒子内的 i 在前缀中对应的位置。']],
    ['expand', ['If the copied value stopped short of r this loop ends immediately.', '如果复制来的值没有顶到 r，这个循环会立刻结束。']],
    ['box', ['r never decreases, and every successful comparison in the loop above increases it.', 'r 从不减小，而上面循环中每次成功的比较都会让它增大。']],
  ],
  input: ['A lowercase string. Prints z[0..n−1] (with z[0] = n).', '一个小写字母串。输出 z[0..n−1]（其中 z[0] = n）。'],
  sizes: [8, 11, 14], lab: [10, 1000, 100000, 1000000],
  gen(n, r) {
    // Repeating a short block gives long matches, which is where the Z-box earns its keep.
    const blk = rndStr(Math.max(1, Math.min(n, r.int(2, 4))), r, 'ab')
    return Array.from({ length: n }, (_, i) => (r.next() < 0.12 ? r.pick([...'ab']) : blk[i % blk.length])).join('') + '\n'
  },
  run(inp, t) {
    const s = reader(inp).str(), n = s.length, z = new Int32Array(n), S = s.split('')
    lower(s)
    z[0] = n
    let l = 0, r = 0
    const view = (i: number, hi: Tones = {}) => [arr('s', S, { ...tn({ vis: span(l, r - 1) }), ...hi }, r ? { i, l, 'r-1': r - 1 } : { i }), arr('z', Array.from(z, (x, k) => (k <= i ? x : '')), tn({ act: i }))] as const
    for (let i = 1; i < n; i++) {
      if (i < r) {
        z[i] = Math.min(z[i - l], r - i)
        t.s('reuse', () => [[`i = ${i} is inside the box [${l}, ${r}): copy min(z[${i - l}] = ${z[i - l]}, r − i = ${r - i}) = ${z[i]}.`, `i = ${i} 在盒子 [${l}, ${r}) 内：直接取 min(z[${i - l}] = ${z[i - l]}, r − i = ${r - i}) = ${z[i]}。`], ...view(i, { [i - l]: 'cmp', [i]: 'act' })])
      } else t.s('reuse', () => [[`i = ${i} is outside the box: start comparing from scratch.`, `i = ${i} 在盒子之外：从头开始比较。`], ...view(i, { [i]: 'act' })])
      while (i + z[i] < n && s[z[i]] === s[i + z[i]]) {
        z[i]++
        t.s('expand', () => [[`s[${z[i] - 1}] = s[${i + z[i] - 1}] = '${s[z[i] - 1]}': z[${i}] = ${z[i]}.`, `s[${z[i] - 1}] = s[${i + z[i] - 1}] = '${s[z[i] - 1]}'：z[${i}] = ${z[i]}。`], ...view(i, tn({ cmp: span(0, z[i] - 1), ok: span(i, i + z[i] - 1) }))])
      }
      if (i + z[i] > r) {
        l = i; r = i + z[i]
        t.s('box', () => [[`The match reaches further right: the box becomes [${l}, ${r}).`, `匹配的右端更靠右：盒子更新为 [${l}, ${r})。`], ...view(i, { [i]: 'act' })])
      }
    }
    if (n <= 1) t.s('box', () => [['A single character: z[0] = n.', '只有一个字符：z[0] = n。'], arr('s', S), arr('z', Array.from(z))])
    t.out(Array.from(z).join(' '))
  },
}

const ac: Lesson = {
  id: 'ac-automaton', title: ['Aho–Corasick automaton', 'AC 自动机'], level: 'N', cat: 'string', diff: 8,
  needs: ['kmp', 'trie'],
  blurb: ['A trie of all patterns plus KMP-style failure links: one pass over the text finds every occurrence of every pattern.', '所有模式串的字典树，加上类似 KMP 的失配指针：扫一遍文本就能找出每个模式串的每次出现。'],
  ideas: [
    ['Build a trie of the patterns: each node is a prefix of some pattern — a state of a finite automaton.', '把所有模式串建成字典树：每个结点是某个模式串的前缀——也就是有穷自动机的一个状态。'],
    ['fail[u] = the node of the longest proper suffix of u\'s string that is also in the trie.', 'fail[u] = u 所代表的串的最长真后缀中，同时也是字典树上结点的那一个。'],
    ['Compute fail by BFS: the fail of child ch(u, c) is ch(fail[u], c) — shallower nodes are ready first.', '用 BFS 求 fail：孩子 ch(u, c) 的 fail 是 ch(fail[u], c)——较浅的结点先算好。'],
    ['Fill in missing edges with ch(u, c) = ch(fail[u], c). Now reading a text character is a single table lookup.', '把缺失的边补成 ch(u, c) = ch(fail[u], c)。这样读一个文本字符只需查一次表。'],
    ['A state also matches every pattern ending at its fail ancestors, so accumulate counts along fail in BFS order.', '到达一个状态时，它 fail 链上的模式串也同时匹配，所以按 BFS 顺序沿 fail 累加计数。'],
  ],
  time: 'O(Σ|p| · 26 + |t|)', space: 'O(Σ|p| · 26)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, ch[300005][26], fail[300005], cnt[300005], tot;
char s[1000005];

int main() {
    scanf("%d", &n);
    for (int k = 0; k < n; k++) {
        scanf("%s", s);
        int u = 0;
        for (int i = 0; s[i]; i++) {
            int c = s[i] - 'a';
            if (!ch[u][c]) ch[u][c] = ++tot;
            u = ch[u][c];  //@ins
        }
        cnt[u]++;  //@end
    }
    queue<int> q;
    for (int c = 0; c < 26; c++) if (ch[0][c]) q.push(ch[0][c]);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        cnt[u] += cnt[fail[u]];  //@fail
        for (int c = 0; c < 26; c++) {
            int &v = ch[u][c];
            if (v) fail[v] = ch[fail[u]][c], q.push(v);
            else v = ch[fail[u]][c];
        }
    }
    scanf("%s", s);
    long long ans = 0;
    for (int i = 0, u = 0; s[i]; i++) {
        u = ch[u][s[i] - 'a'];
        ans += cnt[u];  //@walk
    }
    printf("%lld\n", ans);  //@done
}`,
  notes: [
    ['end', ['Mark the node where a pattern ends; identical patterns add up.', '在模式串结束的结点上打标记；相同的模式串会累加。']],
    ['fail', ['fail[u] is shallower than u, so its count is already complete when u leaves the queue.', 'fail[u] 比 u 浅，所以 u 出队时它的计数已经累加完毕。']],
    ['walk', ['cnt[u] is the number of patterns that end at this text position.', 'cnt[u] 就是在文本的这个位置结束的模式串个数。']],
  ],
  input: ['n, then n lowercase patterns, then the text. Prints the total number of occurrences of all patterns in the text.', 'n，随后 n 个小写模式串，最后是文本串。输出所有模式串在文本中出现的总次数。'],
  sizes: [3, 4, 5], lab: [10, 1000, 20000, 50000],
  gen(n, r) {
    const big = n > 30, alpha = big ? 'abc' : 'ab'
    return `${n}\n${Array.from({ length: n }, () => rndStr(big ? r.int(1, 6) : r.int(1, 3), r, alpha)).join('\n')}\n${rndStr(big ? n * 10 : n + 6, r, alpha)}\n`
  },
  run(inp, t) {
    const rd = reader(inp), n = rd.int(), pats = Array.from({ length: n }, rd.str), text = rd.str()
    pats.forEach(lower); lower(text)
    const cap = pats.reduce((s, p) => s + p.length, 1), ch = new Int32Array(cap * 26), fail = new Int32Array(cap), cnt = new Int32Array(cap), par = [-1], letter = ['·'], tree: GEdge[] = []
    let tot = 0
    const view = (tone: Tones, links = true) => {
      const es = links ? [...tree, ...span(1, tot).filter(u => fail[u]).map(u => ({ u, v: fail[u], dir: true, dash: true, tone: 'alt' as const }))] : tree
      return graph(layoutForest(par), es, { label: letter, tone, sub: Array.from(cnt.subarray(0, tot + 1), x => x || undefined), name: 'caption = patterns matched in this state; dashed = fail link' })
    }
    for (const p of pats) {
      let u = 0
      const path = [0]
      for (let i = 0; i < p.length; i++) {
        const c = p.charCodeAt(i) - 97
        if (!ch[u * 26 + c]) { ch[u * 26 + c] = ++tot; par.push(u); letter.push(p[i]); tree.push({ u, v: tot }) }
        u = ch[u * 26 + c]; path.push(u)
        t.s('ins', () => [[`Insert "${p}": letter '${p[i]}'.`, `插入 "${p}"：字母 '${p[i]}'。`], view(tn({ vis: path, act: path[path.length - 1] }), false)])
      }
      cnt[u]++
      t.s('end', () => [[`"${p}" ends here.`, `"${p}" 在这里结束。`], view(tn({ vis: path, ok: u }), false)])
    }
    const q: number[] = []
    for (let c = 0; c < 26; c++) if (ch[c]) q.push(ch[c])
    for (let h = 0; h < q.length; h++) {
      const u = q[h]
      cnt[u] += cnt[fail[u]]
      t.s('fail', () => [[`BFS: node '${letter[u]}' has fail → ${fail[u] ? `'${letter[fail[u]]}'` : 'root'}; it now reports ${cnt[u]} pattern(s).`, `BFS：结点 '${letter[u]}' 的 fail → ${fail[u] ? `'${letter[fail[u]]}'` : '根'}；它现在对应 ${cnt[u]} 个模式串。`], view(tn({ ok: q.slice(0, h), act: u, cmp: fail[u] }))])
      for (let c = 0; c < 26; c++) {
        const v = ch[u * 26 + c]
        if (v) { fail[v] = ch[fail[u] * 26 + c]; q.push(v) } else ch[u * 26 + c] = ch[fail[u] * 26 + c]
      }
    }
    let ans = 0, u = 0
    const T = text.split('')
    for (let i = 0; i < text.length; i++) {
      u = ch[u * 26 + text.charCodeAt(i) - 97]; ans += cnt[u]
      const cur = u, total = ans
      t.s('walk', () => [[`Read '${text[i]}': state '${letter[cur]}'${cnt[cur] ? ` — ${cnt[cur]} pattern(s) end here` : ''}. Total ${total}.`, `读入 '${text[i]}'：到达状态 '${letter[cur]}'${cnt[cur] ? `——有 ${cnt[cur]} 个模式串在此结束` : ''}。累计 ${total}。`], view(tn({ [cnt[cur] ? 'ok' : 'act']: cur })), arr('text', T.slice(0, 40), tn({ dim: span(0, i - 1), act: i })), vars({ total })])
    }
    t.s('done', () => [[`Total occurrences: ${ans}.`, `总出现次数：${ans}。`], view({}), vars({ total: ans })])
    t.out(ans)
  },
}

const sa: Lesson = {
  id: 'suffix-array', title: ['Suffix array (doubling)', '后缀数组（倍增）'], level: 'N', cat: 'string', diff: 8,
  needs: ['radix-sort'],
  blurb: ['Sort all suffixes by their first 1, 2, 4, 8… characters. Each round reuses the previous ranks, so a comparison stays O(1).', '把所有后缀依次按前 1、2、4、8……个字符排序。每一轮都复用上一轮的排名，比较始终是 O(1)。'],
  ideas: [
    ['sa[k] = starting index of the k-th smallest suffix; rk[i] = rank of the suffix starting at i.', 'sa[k] = 第 k 小的后缀的起始下标；rk[i] = 从 i 开始的后缀的排名。'],
    ['Sorting whole suffixes by direct comparison is too slow: one comparison may cost O(n).', '直接比较整个后缀来排序太慢：一次比较可能就要 O(n)。'],
    ['Doubling: if ranks by the first k characters are known, the first 2k characters of suffix i are the pair (rk[i], rk[i + k]).', '倍增：若已知按前 k 个字符的排名，那么后缀 i 的前 2k 个字符就等价于二元组 (rk[i], rk[i + k])。'],
    ['Sort by those pairs, re-rank (equal pairs share a rank), double k.', '按这些二元组排序，重新编排名（相同的二元组排名相同），然后 k 翻倍。'],
    ['Stop as soon as all ranks are distinct — at most log n rounds.', '一旦所有排名互不相同就停止——至多 log n 轮。'],
  ],
  time: 'O(n log² n)', space: 'O(n)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

char s[100005];
int n, sa[100005], rk[100005], tmp[100005];

int main() {
    scanf("%s", s);
    n = strlen(s);
    for (int i = 0; i < n; i++) sa[i] = i, rk[i] = s[i];  //@init
    for (int k = 1;; k <<= 1) {
        auto cmp = [&](int a, int b) {
            if (rk[a] != rk[b]) return rk[a] < rk[b];
            int ra = a + k < n ? rk[a + k] : -1, rb = b + k < n ? rk[b + k] : -1;
            return ra < rb;
        };
        sort(sa, sa + n, cmp);  //@sort
        tmp[sa[0]] = 0;
        for (int i = 1; i < n; i++) tmp[sa[i]] = tmp[sa[i - 1]] + cmp(sa[i - 1], sa[i]);  //@rank
        copy(tmp, tmp + n, rk);
        if (rk[sa[n - 1]] == n - 1) break;  //@done
    }
    for (int i = 0; i < n; i++) printf("%d ", sa[i] + 1);
}`,
  notes: [
    ['init', ['Round 0: the rank of a suffix by its first character is just the character code.', '第 0 轮：按首字符的排名就是字符编码本身。']],
    ['sort', ['A suffix shorter than k characters gets −1 as its second key, so it sorts first.', '长度不足 k 的后缀第二关键字取 −1，因此排在前面。']],
    ['rank', ['cmp(a, b) is 1 exactly when the two neighbours differ, which starts a new rank.', '当相邻两个后缀不同时 cmp(a, b) 为 1，于是排名加一。']],
    ['done', ['The largest rank being n − 1 means all n ranks are distinct.', '最大排名为 n − 1，说明 n 个排名互不相同。']],
  ],
  input: ['A lowercase string. Prints the suffix array (1-based starting positions in sorted order).', '一个小写字母串。输出后缀数组（按字典序排列的各后缀起始位置，从 1 开始）。'],
  sizes: [5, 7, 9], lab: [10, 1000, 20000, 100000],
  gen: (n, r) => rndStr(n, r, n <= 30 ? 'ab' : 'abc') + '\n',
  run(inp, t) {
    const s = reader(inp).str(), n = s.length
    lower(s)
    const sa = span(0, n - 1), tmp = new Int32Array(n)
    let rk = Int32Array.from(sa, i => s.charCodeAt(i) - 96)
    const table = (k: number, tone: Record<string, Tone>) => grid(`suffixes ordered by their first ${k} character(s)`, sa.map(i => [i + 1, rk[i], s.slice(i, i + k) + (i + k < n ? '·' + s.slice(i + k, i + k + 6) : '')]), tone, { cols: ['start', 'rank', 'suffix'] })
    t.s('init', () => [['Start: rank every suffix by its first character.', '开始：按首字符给每个后缀排名。'], table(1, {})])
    for (let k = 1; ; k <<= 1) {
      const key = (a: number) => (a + k < n ? rk[a + k] : -1)
      const cmp = (a: number, b: number) => { t.tick(); return rk[a] - rk[b] || key(a) - key(b) }
      sa.sort(cmp)
      t.s('sort', () => [[`k = ${k}: sort by the pair (rk[i], rk[i + ${k}]) — that is, by the first ${2 * k} characters.`, `k = ${k}：按二元组 (rk[i], rk[i + ${k}]) 排序——也就是按前 ${2 * k} 个字符排序。`], grid(`sorted by (rk[i], rk[i + ${k}])`, sa.map(i => [i + 1, `(${rk[i]}, ${key(i)})`, s.slice(i, i + 2 * k)]), {}, { cols: ['start', 'key pair', `first ${2 * k}`] })])
      tmp[sa[0]] = 0
      for (let i = 1; i < n; i++) tmp[sa[i]] = tmp[sa[i - 1]] + (cmp(sa[i - 1], sa[i]) < 0 ? 1 : 0)
      rk = Int32Array.from(tmp)
      const distinct = rk[sa[n - 1]] === n - 1
      t.s('rank', () => [[`New ranks by the first ${2 * k} characters${distinct ? ' — all distinct.' : '; ties remain, so double k.'}`, `按前 ${2 * k} 个字符重新排名${distinct ? '——已全部不同。' : '；仍有并列，k 翻倍。'}`], table(2 * k, gt({ bad: span(1, n - 1).filter(i => rk[sa[i]] === rk[sa[i - 1]]).flatMap(i => [[i, 1], [i - 1, 1]] as [number, number][]) }))])
      if (distinct) break
    }
    t.s('done', () => [[`Suffix array: ${sa.slice(0, 20).map(i => i + 1).join(' ')}${n > 20 ? ' …' : ''}`, `后缀数组：${sa.slice(0, 20).map(i => i + 1).join(' ')}${n > 20 ? ' …' : ''}`], grid('all suffixes in sorted order', sa.slice(0, 30).map(i => [i + 1, s.slice(i, i + 24)]), gt({ ok: span(0, Math.min(n, 30) - 1).map(i => [i, 0] as [number, number]) }), { cols: ['start', 'suffix'] }), vars({ n })])
    t.out(sa.map(i => i + 1).join(' '))
  },
}

const hex6 = (x: bigint) => '…' + x.toString(16).padStart(16, '0').slice(-6)
const stringHash: Lesson = {
  id: 'string-hash', title: ['String hashing', '字符串哈希'], level: 'S', cat: 'string', diff: 6,
  needs: ['prefix-sum', 'hash-table'],
  blurb: ['Read a string as a number in base 131. Prefix hashes then give the hash of any substring with one subtraction — and comparing two substrings becomes comparing two numbers.', '把字符串看成一个 131 进制的数。有了前缀哈希，任意子串的哈希值只需一次减法——比较两个子串就变成了比较两个数。'],
  ideas: [
    ['Comparing two substrings character by character costs their length. Comparing two numbers costs one step.', '逐个字符比较两个子串，代价是它们的长度。比较两个数只要一步。'],
    ['The hash of a string is its value as a number written in base B, with the characters as digits.', '字符串的哈希值就是把它看成 B 进制数时的数值，每个字符是一位数字。'],
    ['h[i], the hash of the first i characters, satisfies h[i] = h[i − 1] · B + s[i].', 'h[i] 是前 i 个字符的哈希值，满足 h[i] = h[i − 1] · B + s[i]。'],
    ['The hash of s[l..r] is h[r] − h[l − 1] · B^(r − l + 1): remove the prefix, shifted to line up.', 's[l..r] 的哈希值是 h[r] − h[l − 1] · B^(r − l + 1)：把前缀左移对齐后减掉。'],
    ['All arithmetic is done in unsigned 64-bit integers, which silently keep only the remainder modulo 2⁶⁴.', '所有运算都用无符号 64 位整数，它会自动只保留模 2⁶⁴ 的余数。'],
  ],
  time: 'O(n + q)', space: 'O(n)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

typedef unsigned long long ull;
const ull B = 131;
char s[1000005];
ull h[1000005], pw[1000005];
int n, q;

ull get(int l, int r) {  // hash of s[l..r]
    return h[r] - h[l - 1] * pw[r - l + 1];  //@get
}

int main() {
    scanf("%s%d", s + 1, &q);
    n = strlen(s + 1);
    pw[0] = 1;
    for (int i = 1; i <= n; i++) {
        h[i] = h[i - 1] * B + s[i];  //@build
        pw[i] = pw[i - 1] * B;
    }
    while (q--) {
        int a, b, c, d; scanf("%d%d%d%d", &a, &b, &c, &d);
        puts(b - a == d - c && get(a, b) == get(c, d) ? "Y" : "N");  //@query
    }
}`,
  notes: [
    ['get', ['h[l − 1] is multiplied by B once for every character of the substring, so that its digits line up with the front of h[r].', 'h[l − 1] 要乘上与子串长度相同个数的 B，这样它的各位才能与 h[r] 的高位对齐。']],
    ['build', ['Appending a character: shift everything one place to the left and add the new digit.', '在末尾添一个字符：原来的各位整体左移一位，再加上新的一位。']],
    ['query', ['Different lengths can never be equal strings, so they are ruled out before the hashes are compared.', '长度不同的串不可能相等，所以在比较哈希值之前就先排除。']],
  ],
  input: ['A string of lowercase letters, then q, then q lines "l1 r1 l2 r2" (positions from 1). For each line prints Y if s[l1..r1] and s[l2..r2] are the same string, otherwise N.', '一个由小写字母组成的字符串，然后是 q，随后 q 行 “l1 r1 l2 r2”（位置从 1 开始）。对每一行，若 s[l1..r1] 与 s[l2..r2] 是相同的字符串则输出 Y，否则输出 N。'],
  sizes: [8, 10, 12], lab: [10, 1000, 100000, 500000],
  gen(n, r) {
    // A short block repeated, with a few changed letters: equal and almost-equal substrings are both common.
    const k = n <= 30 ? r.int(2, 3) : r.int(3, 40), block = rndStr(k, r, n <= 30 ? 'ab' : 'abc'), q = n <= 30 ? 3 : n
    const s = Array.from({ length: n }, (_, i) => (r.int(0, 11) === 0 ? r.pick([...'abc']) : block[i % k])).join('')
    let out = `${s}\n${q}\n`
    for (let i = 0; i < q; i++) {
      const len = r.int(1, Math.max(1, Math.min(n - k, n <= 30 ? 4 : 200))), l1 = r.int(1, n - len + 1)
      const shift = r.int(0, 3) ? k * r.int(1, Math.max(1, Math.floor((n - len) / k))) : r.int(1, n)
      const l2 = ((l1 - 1 + shift) % (n - len + 1)) + 1
      out += `${l1} ${l1 + len - 1} ${l2} ${l2 + len - (r.int(0, 9) === 0 && l2 + len <= n ? 0 : 1)}\n`
    }
    return out
  },
  run(inp, t) {
    const rd = reader(inp), s = rd.str(), q = rd.int(), n = s.length
    lower(s)
    const S = s.split(''), B = 131n, h = new BigUint64Array(n + 1), pw = new BigUint64Array(n + 1), out: string[] = []
    pw[0] = 1n
    for (let i = 1; i <= n; i++) {
      h[i] = h[i - 1] * B + BigInt(s.charCodeAt(i - 1)); pw[i] = pw[i - 1] * B
      t.s('build', () => [[`h[${i}] = h[${i - 1}] · 131 + '${s[i - 1]}' (${s.charCodeAt(i - 1)}): the hash of "${s.slice(0, i)}".`, `h[${i}] = h[${i - 1}] · 131 + '${s[i - 1]}'（${s.charCodeAt(i - 1)}）：这是 “${s.slice(0, i)}” 的哈希值。`], arr('s', S, tn({ ok: span(0, i - 2), act: i - 1 }), undefined, { base: 1 }), vars({ [`h[${i}]`]: hex6(h[i]) })])
    }
    const get = (l: number, r: number) => BigInt.asUintN(64, h[r] - h[l - 1] * pw[r - l + 1])
    for (let k = 0; k < q; k++) {
      const [a, b, c, d] = rd.ints(4)
      need(1 <= a && a <= b && b <= n && 1 <= c && c <= d && d <= n, `Question ${k + 1} needs 1 ≤ l ≤ r ≤ ${n} for both substrings.`, `第 ${k + 1} 个询问的两个子串都须满足 1 ≤ l ≤ r ≤ ${n}。`)
      const marks = () => tn({ cmp: span(a - 1, b - 1), alt: span(c - 1, d - 1) })
      if (b - a !== d - c) {
        out.push('N')
        t.s('query', () => [[`"${s.slice(a - 1, b)}" and "${s.slice(c - 1, d)}" have different lengths: N.`, `“${s.slice(a - 1, b)}” 与 “${s.slice(c - 1, d)}” 长度不同：N。`], arr('s', S, marks(), undefined, { base: 1 }), arr('answers', out)])
        continue
      }
      const x = get(a, b), y = get(c, d)
      t.s('get', () => [[`Hash of s[${a}..${b}] = h[${b}] − h[${a - 1}] · 131^${b - a + 1}, and likewise for s[${c}..${d}].`, `s[${a}..${b}] 的哈希值 = h[${b}] − h[${a - 1}] · 131^${b - a + 1}，s[${c}..${d}] 同理。`], arr('s', S, marks(), undefined, { base: 1 }), vars({ [`"${s.slice(a - 1, b)}"`]: hex6(x), [`"${s.slice(c - 1, d)}" `]: hex6(y) })])
      out.push(x === y ? 'Y' : 'N')
      t.s('query', () => [x === y ? ['The two hashes are equal: the substrings are the same. Y.', '两个哈希值相等：这两个子串相同。Y。'] : ['The two hashes differ: the substrings differ. N.', '两个哈希值不同：这两个子串不同。N。'], arr('s', S, tn({ [x === y ? 'ok' : 'bad']: [...span(a - 1, b - 1), ...span(c - 1, d - 1)] }), undefined, { base: 1 }), arr('answers', out)])
    }
    t.out(out.join('\n'))
  },
}

export default [kmp, manacher, zfn, ac, sa, stringHash]
