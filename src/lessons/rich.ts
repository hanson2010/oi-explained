import type { Card, FlowNode, L, Tones, Variant } from '../engine/types'
import { arr, grid, gt, need, reader, span, tn, vars } from '../engine/h'
import { FIRST } from './first'
import { BASIC } from './stories/basic'
import { DP } from './stories/dp'
import { DS } from './stories/ds'
import { GRAPH1 } from './stories/graph1'
import { GRAPH2 } from './stories/graph2'
import { MATH } from './stories/math'
import { SEARCH } from './stories/search'
import { SORT } from './stories/sort'
import { STRING } from './stories/string'

const cpp = String.raw

/**
 * Hand-written extras for a lesson:
 * - story: the Ideas tab as an illustrated sequence (starting point → insight → method → payoff);
 * - flow:  a flowchart whose nodes light up during the animation;
 * - first: the version to learn first — the same method before an optimisation (not an unrelated brute force) —
 *          to read, animate and compare with the lesson's own version (named by `label`). See specs/earlier-versions.md.
 */
export interface Extras { story?: Card[]; flow?: FlowNode[]; first?: Variant; label?: L }

/** The first lessons written; two of them also have a version to learn first. The stories and flowcharts of all the others are in ./stories. */
const FULL: Record<string, Extras> = {
  'binary-search': {
    story: [
      { kind: 'naive', title: ['Start simple: check them one by one', '先从最简单的做起：一个一个看'],
        body: ['Walk from the left and stop at the first element that is ≥ x. It is obviously correct — and in the worst case it looks at **all n elements**. A million numbers, a million comparisons.', '从左往右走，遇到第一个 ≥ x 的元素就停下。这显然是对的——但最坏情况下要看遍**全部 n 个元素**。一百万个数，就要比较一百万次。'],
        fig: () => [arr('a   (x = 23)', [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], tn({ dim: span(0, 3), cmp: 4 }), { i: 4 })] },
      { kind: 'insight', title: ['Sorted order makes one comparison worth half the array', '有序，让一次比较抵得上半个数组'],
        body: ['Look at the **middle** instead. If `a[mid] ≥ x`, then ==everything to its right is ≥ x as well== — so the first such element is at mid or to its left. If `a[mid] < x`, then ==mid and everything to its left is too small==. Either way, __half of the candidates vanish__ after a single comparison.', '改成看**中间**的元素。如果 `a[mid] ≥ x`，那么==它右边的元素也都 ≥ x==——所以第一个满足条件的元素在 mid 或者它的左边。如果 `a[mid] < x`，那么 ==mid 和它左边的元素都太小==。无论哪种情况，一次比较之后__一半的候选都消失了__。'],
        fig: () => [arr('a   (x = 23):  a[mid] = 16 < 23, so the left half is out', [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], tn({ dim: span(0, 3), bad: 4, ok: span(5, 9) }), { mid: 4 })] },
      { kind: 'how', title: ['Keep an interval that must contain the answer', '维护一个一定包含答案的区间'],
        body: ['Two pointers `l` and `r` fence in the candidates. When `a[mid]` qualifies, __keep it__: `r = mid`. When it is too small, __throw it away__: `l = mid + 1`. Repeat until the fence closes on a single position — that is the answer.', '用两个指针 `l` 和 `r` 把候选位置圈起来。`a[mid]` 满足条件时__要保留它__：`r = mid`。它太小时__直接丢掉__：`l = mid + 1`。不断重复，直到区间缩成一个位置——那就是答案。'],
        fig: () => [arr('a   (x = 23)', [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], tn({ dim: [...span(0, 4), 8, 9], act: 7 }), { l: 5, mid: 7, r: 10 })] },
      { kind: 'result', title: ['Twenty questions for a million numbers', '一百万个数，只要问二十次'],
        body: ['n → n/2 → n/4 → … → 1 takes only **log₂ n** steps. And the idea is bigger than arrays: whenever a yes/no test flips from "no" to "yes" exactly once as the answer grows, you can ==binary search on the answer== itself.', 'n → n/2 → n/4 → … → 1 只需要 **log₂ n** 步。而且这个思想不限于数组：只要某个“是/否”的判定随着答案增大恰好从“否”翻转为“是”一次，就可以直接==二分答案==。'],
        fig: () => [grid('how many comparisons?', [['10', '1 000', '1 000 000', '1 000 000 000'], [10, '1 000', '1 000 000', '1 000 000 000'], [4, 10, 20, 30]], gt({ bad: span(0, 3).map(c => [1, c] as [number, number]), ok: span(0, 3).map(c => [2, c] as [number, number]) }), { rows: ['n', 'one by one', 'binary search'] })] },
    ],
    flow: [
      { id: 'init', kind: 'start', text: ['l = 0, r = n', 'l = 0，r = n'] },
      { id: 'loop', kind: 'test', text: ['l < r ?', 'l < r ？'], no: 'done' },
      { id: 'mid', text: ['mid = (l + r) / 2', 'mid = (l + r) / 2'] },
      { id: 'cmp', kind: 'test', text: ['a[mid] ≥ x ?', 'a[mid] ≥ x ？'], yes: 'left', no: 'right', on: [] },
      { id: 'left', text: ['r = mid   (keep mid)', 'r = mid（保留 mid）'], next: 'loop' },
      { id: 'right', text: ['l = mid + 1   (drop mid)', 'l = mid + 1（丢掉 mid）'], next: 'loop' },
      { id: 'done', kind: 'end', text: ['answer = l', '答案 = l'] },
    ],
  },

  'prefix-sum': {
    story: [
      { kind: 'naive', title: ['Start simple: add them up every time', '先从最简单的做起：每次都加一遍'],
        body: ['For each query walk from l to r and add. One query can touch **n elements**, so q queries cost up to **n × q** additions — with n = q = 10⁵ that is ten billion.', '对每个询问，从 l 走到 r 逐个相加。一个询问可能要加 **n 个元素**，q 个询问最多就是 **n × q** 次加法——n = q = 10⁵ 时是一百亿次。'],
        fig: () => [arr('a   — query (3, 7): five additions', [0, 4, 1, 7, 2, 9, 3, 5, 8], tn({ dim: 0, cmp: span(3, 7) }), { l: 3, r: 7 }, { base: 0 })] },
      { kind: 'insight', title: ['A range is the difference of two prefixes', '一个区间，就是两个前缀相减'],
        body: ['The sum of positions 1..r contains the sum of positions 1..l−1 **plus exactly the part we want**. So ==sum(l..r) = prefix(r) − prefix(l−1)==: the common beginning cancels out.', '位置 1..r 的和，等于位置 1..l−1 的和**再加上我们要的那一段**。所以 ==sum(l..r) = prefix(r) − prefix(l−1)==：公共的开头互相抵消了。'],
        fig: () => [
          arr('prefix(7)', [4, 1, 7, 2, 9, 3, 5, 8], tn({ ok: span(0, 6), dim: 7 }), undefined, { base: 1 }),
          arr('prefix(2)', [4, 1, 7, 2, 9, 3, 5, 8], tn({ bad: [0, 1], dim: span(2, 7) }), undefined, { base: 1 }),
          arr('what is left: sum(3..7)', [4, 1, 7, 2, 9, 3, 5, 8], tn({ dim: [0, 1, 7], act: span(2, 6) }), undefined, { base: 1 }),
        ] },
      { kind: 'how', title: ['Build every prefix in a single pass', '扫一遍，算出所有前缀'],
        body: ['There are only n + 1 prefixes, and each one is __the previous one plus one element__: `s[i] = s[i−1] + a[i]`, starting from `s[0] = 0`. That zero is not decoration — it makes l = 1 work without a special case.', '前缀一共只有 n + 1 个，而且每个都是__前一个再加一个元素__：`s[i] = s[i−1] + a[i]`，从 `s[0] = 0` 开始。这个 0 不是摆设——有了它，l = 1 时也不用特判。'],
        fig: () => [arr('a', [0, 4, 1, 7, 2, 9, 3, 5, 8], tn({ dim: 0, act: 5 })), arr('s', [0, 4, 5, 12, 14, 23, 26, 31, 39], tn({ cmp: 4, ok: 5 }))] },
      { kind: 'result', title: ['Pay once, then every answer is one subtraction', '只付一次代价，之后每次回答只要一次减法'],
        body: ['O(n) to build, **O(1) per query**, however long the range. The same trade — precompute, then combine — returns in 2-D prefix sums, in difference arrays (its inverse) and on trees.', '预处理 O(n)，之后**每次询问 O(1)**，与区间多长无关。同样的套路——先预处理、再组合——还会出现在二维前缀和、差分（它的逆运算）以及树上。'],
        fig: () => [arr('s   — query (3, 7) = s[7] − s[2] = 31 − 5 = 26', [0, 4, 5, 12, 14, 23, 26, 31, 39], tn({ bad: 2, ok: 7 }), { 'l-1': 2, r: 7 })] },
    ],
    flow: [
      { id: 'read', kind: 'start', text: ['read n, q;  s[0] = 0', '读入 n、q；s[0] = 0'] },
      { id: 'build', text: ['for i = 1..n:  s[i] = s[i−1] + a[i]', '对 i = 1..n：s[i] = s[i−1] + a[i]'] },
      { id: 'more', kind: 'test', text: ['another query (l, r) ?', '还有询问 (l, r) ？'], no: 'end', on: [] },
      { id: 'query', text: ['print s[r] − s[l−1]', '输出 s[r] − s[l−1]'], next: 'more' },
      { id: 'end', kind: 'end', text: ['done', '结束'] },
    ],
  },

  'fast-pow': {
    story: [
      { kind: 'naive', title: ['Start simple: multiply b times', '先从最简单的做起：乘 b 次'],
        body: ['`res = res × a`, repeated b times. Fine for b = 10. For **b = 10¹⁸**, at a billion multiplications per second, it would take about __thirty years__.', '`res = res × a`，重复 b 次。b = 10 时没问题。但当 **b = 10¹⁸** 时，即使每秒乘十亿次，也要大约__三十年__。'],
        fig: () => [arr('a¹ → a² → a³ → a⁴ → …  one step at a time', ['a¹', 'a²', 'a³', 'a⁴', 'a⁵', 'a⁶', '…'], tn({ cmp: span(0, 5), dim: 6 }))] },
      { kind: 'insight', title: ['Squaring doubles the exponent', '平方一次，指数翻倍'],
        body: ['From a you get a², then a⁴, a⁸, a¹⁶ … Each squaring ==doubles how far you have come==. After only **60 squarings** the exponent is already above 10¹⁸.', '从 a 得到 a²，再得到 a⁴、a⁸、a¹⁶……每平方一次，==走过的路程就翻一倍==。只要 **60 次平方**，指数就超过 10¹⁸ 了。'],
        fig: () => [arr('squaring: every step doubles the exponent', ['a¹', 'a²', 'a⁴', 'a⁸', 'a¹⁶', 'a³²', '…'], tn({ ok: span(0, 5), dim: 6 }))] },
      { kind: 'how', title: ['First as a recursion: halve the exponent', '先写成递归：把指数折半'],
        body: ['`aᵇ = (a^(b/2))²`, times one more a when b is odd. A function that calls itself with b / 2 reaches 0 after about log₂ b levels — already fast. Its only cost is the ==stack of pending calls==, one per level.', '`aᵇ = (a^(b/2))²`，b 为奇数时再多乘一个 a。函数用 b / 2 调用自己，大约 log₂ b 层之后就到 0——这已经很快了。它唯一的代价是==一层层尚未返回的调用所占的栈==，每层一个。'],
        fig: () => [arr('a¹³: the exponents on the way down — and each level squares on the way back', [13, 6, 3, 1, 0], tn({ act: 0, cmp: span(1, 3), dim: 4 }))] },
      { kind: 'how', title: ['Then without the stack: the binary digits of b say which squares to use', '再去掉栈：b 的二进制位决定用哪些平方项'],
        body: ['Every number is a sum of powers of two. 13 = 8 + 4 + 1 = `1101₂`, so ==a¹³ = a⁸ · a⁴ · a¹==. Walk the bits of b from the lowest: __if the bit is 1, multiply the current square into the answer__; then square again for the next bit.', '任何数都是若干 2 的幂之和。13 = 8 + 4 + 1 = `1101₂`，所以 ==a¹³ = a⁸ · a⁴ · a¹==。从最低位开始扫描 b 的每一位：__这一位是 1，就把当前的平方项乘进答案__；然后再平方，为下一位做准备。'],
        fig: () => [grid('b = 13', [[1, 1, 0, 1], ['a⁸', 'a⁴', 'a²', 'a¹'], ['✓', '✓', '', '✓']], gt({ ok: [[0, 0], [0, 1], [0, 3], [1, 0], [1, 1], [1, 3]], dim: [[0, 2], [1, 2]] }), { rows: ['bit', 'square', 'use it?'], cols: ['8', '4', '2', '1'] })] },
      { kind: 'result', title: ['One step per bit — and take the remainder as you go', '每个二进制位一步——并且边乘边取模'],
        body: ['About **log₂ b** steps: 60 instead of 10¹⁸. Reducing modulo m after every multiplication keeps the numbers small, and it is safe because (x · y) mod m only depends on x mod m and y mod m. The same ==doubling== idea builds sparse tables and binary-lifting ancestors.', '大约 **log₂ b** 步：60 步，而不是 10¹⁸ 步。每次乘法后都对 m 取模，让数值保持很小；这样做是安全的，因为 (x · y) mod m 只取决于 x mod m 和 y mod m。同样的==倍增==思想还用来构造 ST 表和倍增祖先表。'] },
    ],
    flow: [
      { id: 'init', kind: 'start', text: ['res = 1,  a = a mod m', 'res = 1，a = a mod m'] },
      { id: 'loop', kind: 'test', text: ['b > 0 ?', 'b > 0 ？'], no: 'done', on: [] },
      { id: 'bit', kind: 'test', text: ['lowest bit of b is 1 ?', 'b 的最低位是 1 ？'], yes: 'mul', no: 'sq', on: [] },
      { id: 'mul', text: ['res = res × a mod m', 'res = res × a mod m'] },
      { id: 'sq', text: ['a = a × a mod m;  b = b / 2', 'a = a × a mod m；b = b / 2'], next: 'loop' },
      { id: 'done', kind: 'end', text: ['answer = res', '答案 = res'] },
    ],
  },

  'monotonic-queue': {
    story: [
      { kind: 'naive', title: ['Start simple: rescan every window', '先从最简单的做起：每个窗口重新扫一遍'],
        body: ['For each of the n − k + 1 windows, look at all k elements and take the largest. That is about **n × k** comparisons — and neighbouring windows share k − 1 elements, so almost all of that work is repeated.', '对 n − k + 1 个窗口中的每一个，都把 k 个元素看一遍取最大值。这大约是 **n × k** 次比较——而相邻的两个窗口有 k − 1 个元素是相同的，所以几乎全是重复劳动。'],
        fig: () => [arr('a   (k = 4): the next window repeats three of the four comparisons', [3, 1, 4, 1, 5, 9, 2, 6], tn({ dim: [0, 5, 6, 7], cmp: span(1, 4) }), undefined, { bars: true })] },
      { kind: 'insight', title: ['A newer, larger element makes older smaller ones useless', '更新、更大的元素，让更旧、更小的元素彻底没用'],
        body: ['Take two elements in the window, an older one and a newer one that is __at least as large__. The older one leaves the window first — and until then the newer one is also there and is no smaller. So the older one ==can never again be the maximum==. Throw it away now.', '看窗口中的两个元素：一个较旧，另一个较新而且__不比它小__。较旧的那个会先离开窗口——在那之前，较新的元素也在窗口里，并且不比它小。所以较旧的元素==再也不可能成为最大值==，现在就可以扔掉。'],
        fig: () => [arr('a: once 5 arrives, the 1, 4, 1 before it can never win again', [3, 1, 4, 1, 5, 9, 2, 6], tn({ dim: [0, 5, 6, 7], bad: [1, 2, 3], ok: 4 }), { i: 4 }, { bars: true })] },
      { kind: 'how', title: ['What survives is a decreasing line of candidates', '留下来的，是一列递减的候选者'],
        body: ['After throwing those away, the survivors are __decreasing from oldest to newest__, so the **oldest survivor is the maximum**. Each new element enters at the back, first popping everything it dominates. An element leaves at the front when it slides out of the window. Store ==indices, not values==, so you can tell when that happens.', '把那些元素扔掉之后，剩下的候选者__从旧到新是递减的__，所以**最旧的那个就是最大值**。每个新元素从队尾进入，进入前先把被它压制的元素全部弹出。队首的元素滑出窗口时，从队首离开。队列里要存==下标而不是值==，这样才能判断它何时过期。'],
        fig: () => [arr('a   (k = 4, i = 7)', [3, 1, 4, 1, 5, 9, 2, 6], tn({ dim: span(0, 3), ok: 5, cmp: 7, bad: [4, 6] }), { i: 7 }, { bars: true }), arr('deque of indices (front → back)', [5, 7], tn({ ok: 0, cmp: 1 }))] },
      { kind: 'result', title: ['Everyone enters once and leaves once', '每个元素只进一次、只出一次'],
        body: ['A pop can only remove something that was pushed, and each index is pushed exactly once. So the total work is **O(n)** — no matter how large k is. The same deque speeds up DP transitions that take a max or min over a sliding range.', '弹出的一定是曾经压入的元素，而每个下标恰好只压入一次。所以总工作量是 **O(n)**——无论 k 有多大。同样的队列还能优化“在滑动区间内取最大值或最小值”的 DP 转移。'] },
    ],
    flow: [
      { id: 'next', kind: 'test', text: ['next index i < n ?', '下一个下标 i < n ？'], no: 'end', on: [] },
      { id: 'exp', kind: 'test', text: ['front index ≤ i − k ?', '队首下标 ≤ i − k ？'], yes: 'expire', no: 'dom', on: [] },
      { id: 'expire', text: ['pop the front (it left the window)', '弹出队首（它已滑出窗口）'] },
      { id: 'dom', kind: 'test', text: ['a[back] ≤ a[i] ?', 'a[队尾] ≤ a[i] ？'], yes: 'popback', no: 'push', on: [] },
      { id: 'popback', text: ['pop the back (it can never win)', '弹出队尾（它不可能再成为最大值）'], next: 'dom' },
      { id: 'push', text: ['push i at the back', '把 i 加入队尾'] },
      { id: 'win', kind: 'test', text: ['i ≥ k − 1 ?', 'i ≥ k − 1 ？'], yes: 'out', no: 'next', on: [] },
      { id: 'out', text: ['output a[front]', '输出 a[队首]'], next: 'next' },
      { id: 'end', kind: 'end', text: ['done', '结束'] },
    ],
  },

  kmp: {
    story: [
      { kind: 'naive', title: ['Start simple: after a mismatch, go back and start over', '先从最简单的做起：失配后退回去，从头再比'],
        body: ['Compare `s[i]` with `p[j]` and advance both while they agree. After a mismatch, move the text pointer __back__ to one position after where this attempt began and set j to 0 — re-reading text you have already seen. On inputs like `aaaa…ab` that is n × m comparisons.', '比较 `s[i]` 和 `p[j]`，相同就一起前进。一旦失配，就把文本指针__退回__到本次尝试起点的下一个位置，并把 j 置为 0——重新读一遍已经看过的文本。遇到 `aaaa…ab` 这样的数据，就要比较 n × m 次。'],
        fig: () => [arr('text', [...'aaaaaab'], tn({ ok: span(0, 2), bad: 3 }), { 'new i': 1, i: 3 }), arr('pattern "aaab": three matches, then a mismatch — i goes back to 1 and all three are compared again', ['a', 'a', 'a', 'b', '', '', ''], tn({ ok: span(0, 2), bad: 3 }), { j: 3 }, { base: -1 })] },
      { kind: 'insight', title: ['You already know the text you just matched', '刚刚匹配过的那段文本，你其实已经知道了'],
        body: ['If the first j characters of the pattern matched, those j text characters ==are the pattern\'s own first j characters==. So everything needed to decide where the pattern could match next is __inside the pattern itself__ — the text does not have to be read again.', '如果模式串的前 j 个字符已经匹配，那么这 j 个文本字符==就是模式串自己的前 j 个字符==。所以判断模式串下一次可能在哪里匹配所需要的全部信息，都__在模式串内部__——根本不必重读文本。'],
        fig: () => [arr('text', [...'abababc'], tn({ ok: span(0, 3), bad: 4 }), { i: 4 }), arr('pattern "ababc": "abab" matched, so the text there is "abab" too', [...'ababc', '', ''], tn({ ok: span(0, 3), bad: 4 }), { j: 4 }, { base: -1 })] },
      { kind: 'how', title: ['Slide to the longest border', '滑到最长的 border'],
        body: ['The pattern can only match again where ==its beginning lines up with the end of what was matched==. A string that is both a proper prefix and a suffix is called a **border**. "abab" has the border "ab", so slide the pattern until its "ab" sits under the text\'s last "ab" — and __keep comparing from where you were__.', '模式串要想再次匹配，必须让==它的开头与已匹配部分的结尾重合==。既是真前缀、又是后缀的子串叫做 **border**。“abab” 的 border 是 “ab”，所以把模式串滑到让它的 “ab” 对准文本中最后的 “ab”——然后__从原来的位置接着比__。'],
        fig: () => [arr('text', [...'abababc'], tn({ vis: [0, 1], ok: [2, 3], cmp: 4 }), { i: 4 }), arr('pattern, shifted by two: the border "ab" is kept, j = 2', ['', '', ...'ababc'], tn({ ok: [2, 3], cmp: 4 }), { j: 4 }, { base: -1 })] },
      { kind: 'how', title: ['Prepare the borders once, from the pattern alone', '只用模式串，把所有 border 预先算好'],
        body: ['`nxt[i]` = length of the longest border of the first i + 1 characters. It is computed by ==matching the pattern against itself== with exactly the same fall-back loop — the algorithm bootstraps itself.', '`nxt[i]` = 模式串前 i + 1 个字符的最长 border 长度。它的求法是==让模式串与自己匹配==，用的就是同一个回退循环——算法自己把自己“拉”了起来。'],
        fig: () => [arr('pattern', [...'ababc']), arr('nxt', [0, 0, 1, 2, 0], tn({ ok: [2, 3] }))] },
      { kind: 'result', title: ['The text pointer never moves back', '文本指针永不回退'],
        body: ['j grows by at most one per text character and every fall-back shrinks it, so there can be at most n fall-backs in total: **O(n + m)**, on any input.', 'j 每读一个文本字符至多加一，而每次回退都会让它变小，所以回退的总次数不超过 n：任何数据下都是 **O(n + m)**。'] },
    ],
    flow: [
      { id: 'pre', kind: 'start', text: ['build nxt[] from the pattern;  i = 0, j = 0', '由模式串求出 nxt[]；i = 0，j = 0'], on: ['pfail', 'pset'] },
      { id: 'loop', kind: 'test', text: ['i < n ?', 'i < n ？'], no: 'end', on: [] },
      { id: 'mis', kind: 'test', text: ['j > 0 and s[i] ≠ p[j] ?', 'j > 0 且 s[i] ≠ p[j] ？'], yes: 'fail', no: 'ext', on: [] },
      { id: 'fail', text: ['j = nxt[j − 1]   (slide to the border)', 'j = nxt[j − 1]（滑到 border）'], next: 'mis' },
      { id: 'ext', text: ['if s[i] = p[j]:  j++', '若 s[i] = p[j]：j++'] },
      { id: 'full', kind: 'test', text: ['j = m ?', 'j = m ？'], yes: 'found', no: 'inc', on: [] },
      { id: 'found', text: ['report a match;  j = nxt[j − 1]', '报告一次匹配；j = nxt[j − 1]'] },
      { id: 'inc', text: ['i++', 'i++'], next: 'loop', on: [] },
      { id: 'end', kind: 'end', text: ['done', '结束'] },
    ],
    label: ['KMP', 'KMP'],
    first: {
      label: ['Restart after a mismatch', '失配后从头再来'],
      blurb: ['One loop with two pointers: i in the text, j in the pattern. Equal characters advance both. After a mismatch the text pointer __goes back__ to one position after where this attempt began, and j returns to 0 — everything just learned about the text is thrown away.', '一个循环，两个指针：i 指向文本，j 指向模式串。字符相同，两个指针一起前进。一旦失配，文本指针就__退回__到本次尝试起点的下一个位置，j 回到 0——刚刚从文本中得到的信息全部丢掉。'],
      time: 'O(n · m)', space: 'O(1)', maxN: 10000,
      code: cpp`#include <bits/stdc++.h>
using namespace std;

char s[1000005], p[1000005];

int main() {
    scanf("%s%s", s, p);
    int n = strlen(s), m = strlen(p);
    int i = 0, j = 0;
    while (i < n) {
        if (s[i] == p[j]) {
            i++; j++;  //@match
            if (j == m) {
                printf("%d ", i - m + 1);  //@found
                i = i - j + 1; j = 0;
            }
        } else {
            i = i - j + 1;  //@back
            j = 0;
        }
    }
}`,
      notes: [
        ['match', ['The same comparison as in KMP: s[i] against p[j].', '与 KMP 中完全相同的比较：s[i] 对 p[j]。']],
        ['back', ['The line KMP replaces. i moves back by j − 1 characters that were already read; KMP keeps i where it is and sets j = nxt[j − 1] instead.', 'KMP 要替换的就是这一行。i 向后退了 j − 1 个已经读过的字符；KMP 则让 i 留在原地，只把 j 改为 nxt[j − 1]。']],
        ['found', ['After a full match the search also restarts one position further.', '完整匹配之后，同样从下一个位置重新开始。']],
      ],
      run(inp, t) {
        const rd = reader(inp), s = rd.str(), p = rd.str(), n = s.length, m = p.length, out: number[] = [], S = s.split('')
        let count = 0, i = 0, j = 0
        // The pattern is drawn under the text, starting where the current attempt began.
        const under = (st: number, tone: Tones) => { const v: string[] = new Array(Math.max(n, st + m)).fill(''); for (let k = 0; k < m; k++) v[st + k] = p[k]; return arr('p (aligned)', v, Object.fromEntries(Object.entries(tone).map(([k, x]) => [st + +k, x])), undefined, { base: -1 }) }
        while (i < n) {
          const st = i - j, ii = i, jj = j, c = ++count
          if (s[i] === p[j]) {
            i++; j++
            t.s('match', () => [[`s[${ii}] = p[${jj}] = '${s[ii]}': both pointers advance.`, `s[${ii}] = p[${jj}] = '${s[ii]}'：两个指针一起前进。`], arr('s', S, tn({ vis: span(st, ii - 1), ok: ii }), { i: ii }), under(st, tn({ ok: span(0, jj) })), vars({ j: jj, comparisons: c })])
            if (j === m) {
              out.push(i - m + 1)
              t.s('found', () => [[`Full match at position ${st + 1}. Restart at text position ${st + 1}.`, `在位置 ${st + 1} 完整匹配。从文本位置 ${st + 1} 重新开始。`], arr('s', S, tn({ ok: span(st, st + m - 1) })), under(st, tn({ ok: span(0, m - 1) })), arr('found at', out)])
              i = i - j + 1; j = 0
            }
          } else {
            i = i - j + 1; j = 0
            const ni = i
            t.s('back', () => [[`s[${ii}] = '${s[ii]}' ≠ p[${jj}] = '${p[jj]}': i goes back from ${ii} to ${ni}, j to 0.`, `s[${ii}] = '${s[ii]}' ≠ p[${jj}] = '${p[jj]}'：i 从 ${ii} 退回到 ${ni}，j 回到 0。`], arr('s', S, tn({ vis: span(st, ii - 1), bad: ii }), { i: ii, 'new i': ni }), under(st, tn({ ok: span(0, jj - 1), bad: jj })), vars({ j: jj, comparisons: c })])
          }
        }
        t.out(out.join(' '))
      },
    },
  },

  sieve: {
    story: [
      { kind: 'naive', title: ['Start simple: ask every number "are you prime?"', '先从最简单的做起：逐个问“你是素数吗？”'],
        body: ['For each x try the divisors 2, 3, 4, … up to √x. A single test is cheap, but doing it for **every** number up to n costs about n·√n — and each test starts from nothing, learning nothing from the numbers before it.', '对每个 x，用 2、3、4……一直到 √x 去试除。单独一次判断并不贵，但对不超过 n 的**每个**数都做一遍，总代价约为 n·√n——而且每次判断都从零开始，没有利用之前的数得到的任何信息。'],
        fig: () => [grid('is 29 prime?  try 2, 3, 4, 5 …', [[2, 3, 4, 5], ['29 mod 2 = 1', '29 mod 3 = 2', '29 mod 4 = 1', '29 mod 5 = 4']], gt({ cmp: span(0, 3).map(c => [1, c] as [number, number]) }), { rows: ['divisor', 'remainder'] })] },
      { kind: 'insight', title: ['Flip the question: let each prime cross out its multiples', '把问题反过来：让每个素数去划掉它的倍数'],
        body: ['Instead of testing numbers, __generate the composites__. Every multiple of 2 is composite; every multiple of 3; every multiple of 5. Whatever is ==never crossed out== has no smaller prime factor — so it must be prime.', '不去检验每个数，而是__直接生成合数__。2 的倍数都是合数；3 的倍数也是；5 的倍数也是。==始终没有被划掉==的数没有更小的素因子——所以它一定是素数。'],
        fig: () => [grid('multiples of 2 are gone; multiples of 3 go next', [[2, 3, 4, 5, 6, 7, 8, 9, 10], [11, 12, 13, 14, 15, 16, 17, 18, 19]], gt({ ok: [[0, 0]], act: [[0, 1]], dim: [[0, 2], [0, 4], [0, 6], [0, 8], [1, 1], [1, 3], [1, 5], [1, 7]], bad: [[0, 7], [1, 4]] }), { sq: true })] },
      { kind: 'how', title: ['Walk upward: whoever is still standing is prime', '从小到大走：还站着的就是素数'],
        body: ['Go through 2, 3, 4, … in order. A composite number is always crossed out ==before you reach it==, by its smallest prime factor. So when you arrive at an unmarked number, declare it prime and cross out its multiples.', '按 2、3、4……的顺序依次考察。合数总会==在你走到它之前==，被它的最小素因子划掉。所以走到一个没有标记的数时，就宣布它是素数，然后划掉它的倍数。'] },
      { kind: 'how', title: ['Start crossing at p²', '从 p² 开始划'],
        body: ['A smaller multiple k·p with k < p has a prime factor below p, so it is __already gone__. For p = 5: 10, 15 and 20 were removed by 2 and 3 — the first new one is ==25 = 5²==.', '更小的倍数 k·p（k < p）含有比 p 小的素因子，所以__早就被划掉了__。以 p = 5 为例：10、15、20 已经被 2 和 3 划掉——第一个新的是 ==25 = 5²==。'],
        fig: () => [arr('multiples of 5', [5, 10, 15, 20, 25, 30, 35], tn({ ok: 0, dim: [1, 2, 3, 5], act: 4, bad: 6 }), { 'start here': 4 }, { base: -1 })] },
      { kind: 'result', title: ['Almost linear', '几乎是线性的'],
        body: ['The crossing-out costs n/2 + n/3 + n/5 + n/7 + … which grows only like **n · log log n**. For n = 10⁷ that is a few tens of millions of steps, against billions for trial division. The linear sieve in the next lesson removes even the repeated crossings.', '划掉倍数的总代价是 n/2 + n/3 + n/5 + n/7 + …，增长速度只有 **n · log log n**。n = 10⁷ 时是几千万步，而试除法要几十亿步。下一课的线性筛连重复划掉的部分也省去了。'] },
    ],
    flow: [
      { id: 'init', kind: 'start', text: ['i = 2;  nothing crossed out', 'i = 2；所有数都未划掉'], on: [] },
      { id: 'loop', kind: 'test', text: ['i ≤ n ?', 'i ≤ n ？'], no: 'done', on: [] },
      { id: 'marked', kind: 'test', text: ['is i crossed out ?', 'i 被划掉了吗？'], yes: 'inc', no: 'prime', on: [] },
      { id: 'prime', text: ['i is prime: count it', 'i 是素数：计数加一'] },
      { id: 'cross', text: ['cross out i², i² + i, i² + 2i, …', '划掉 i²、i² + i、i² + 2i……'] },
      { id: 'inc', text: ['i++', 'i++'], next: 'loop', on: [] },
      { id: 'done', kind: 'end', text: ['print the count', '输出个数'] },
    ],
  },

  // Here the first version is not brute force: it is the same DP in its natural 2-D form.
  knapsack: {
    story: [
      { kind: 'naive', title: ['Start with the full table', '先把整张表写出来'],
        body: ['Let `f[i][j]` be the best value using **only the first i items** with capacity j. Item i is either left out — `f[i−1][j]` — or put in — `f[i−1][j−w] + v`. Take the larger. Each cell needs just ==two cells of the row above==.', '设 `f[i][j]` 表示**只考虑前 i 件物品**、容量为 j 时的最大价值。第 i 件物品要么不选——`f[i−1][j]`，要么选——`f[i−1][j−w] + v`，取较大者。每个格子只需要==上一行的两个格子==。'],
        fig: () => [grid('f[i][j]:  f[2][5] = max( f[1][5],  f[1][2] + 4 ) = 7', [[0, 0, 0, 0, 0, 0], [0, 0, 3, 3, 3, 3], [0, 0, 3, 4, 4, 7], ['', '', '', '', '', '']], gt({ cmp: [[1, 5], [1, 2]], act: [[2, 5]] }), { rows: ['no items', '1: w=2 v=3', '2: w=3 v=4', '3: w=1 v=2'], cols: span(0, 5) })] },
      { kind: 'insight', title: ['Only the previous row is ever read', '用到的永远只有上一行'],
        body: ['Row i looks at row i − 1 and __nothing older__. Once row i is complete, row i − 1 is dead weight. So why keep n rows? ==One row is enough== — if we can overwrite it without destroying a value we still need.', '第 i 行只看第 i − 1 行，__更早的行再也用不到__。第 i 行算完之后，第 i − 1 行就成了累赘。那为什么要保留 n 行？==一行就够了==——只要覆盖的时候别把还要用的值冲掉。'],
        fig: () => [grid('filling row 2: only row 1 is needed', [[0, 0, 0, 0, 0, 0], [0, 0, 3, 3, 3, 3], [0, 0, 3, 4, '', ''], ['', '', '', '', '', '']], gt({ dim: span(0, 5).map(c => [0, c] as [number, number]), ok: span(0, 5).map(c => [1, c] as [number, number]), act: span(0, 3).map(c => [2, c] as [number, number]) }), { rows: ['no items', '1: w=2 v=3', '2: w=3 v=4', '3: w=1 v=2'], cols: span(0, 5) })] },
      { kind: 'how', title: ['Overwrite from right to left', '从右往左覆盖'],
        body: ['`f[j]` needs the old `f[j−w]`, which lies __to its left__. Sweep j from W **down** to w: everything left of j is ==still the old row==, so the item is counted at most once. Sweep upwards and `f[j−w]` would already contain this item — it could be taken twice (that is the unbounded knapsack).', '`f[j]` 需要旧的 `f[j−w]`，而它在__左边__。让 j 从 W **递减**到 w：j 左边的格子==仍然是上一行的值==，所以每件物品最多算一次。如果从小到大扫，`f[j−w]` 已经包含了这件物品——它就可能被选两次（那正是完全背包）。'],
        fig: () => [arr('f[j] while adding item 2 (w=3, v=4):  right of j = new row,  left of j = old row', [0, 0, 3, 3, 3, 7], tn({ ok: 5, act: 4, cmp: 1 }), { j: 4, 'j-w': 1 })] },
      { kind: 'result', title: ['Same answer, a fraction of the memory', '答案不变，内存只剩零头'],
        body: ['The number of steps is unchanged — n · W either way. But memory falls from **n · W** cells to **W**, which often decides between "Memory Limit Exceeded" and "Accepted". The same ==rolling array== trick works for every DP whose row depends only on the previous one.', '步数没有变——都是 n · W。但内存从 **n · W** 个格子降到 **W** 个，这常常就是“内存超限”和“通过”的区别。凡是每一行只依赖上一行的 DP，都可以用同样的==滚动数组==技巧。'],
        fig: () => [grid('memory (8 bytes per cell)', [['≈ 8 MB', '≈ 800 MB'], ['≈ 80 KB', '≈ 800 KB']], gt({ bad: [[0, 0], [0, 1]], ok: [[1, 0], [1, 1]] }), { rows: ['2-D table', 'one row'], cols: ['n = 100, W = 10 000', 'n = 1 000, W = 100 000'] })] },
    ],
    flow: [
      { id: 'read', kind: 'start', text: ['read n, W;  f[0..W] = 0', '读入 n、W；f[0..W] = 0'], on: [] },
      { id: 'more', kind: 'test', text: ['another item?', '还有物品吗？'], no: 'done', on: [] },
      { id: 'item', text: ['read w, v;  j = W', '读入 w、v；j = W'] },
      { id: 'fit', kind: 'test', text: ['j ≥ w ?', 'j ≥ w ？'], no: 'more', on: [] },
      { id: 'try', text: ['f[j] = max(f[j], f[j−w] + v);  j = j − 1', 'f[j] = max(f[j], f[j−w] + v)；j = j − 1'], next: 'fit' },
      { id: 'done', kind: 'end', text: ['answer = f[W]', '答案 = f[W]'] },
    ],
    label: ['One rolling row', '一维滚动数组'],
    first: {
      label: ['2-D table', '二维表'],
      blurb: ['The DP exactly as it is defined: one row per item, one column per capacity. Easy to get right and easy to check by hand — but it stores n · W cells although only the previous row is ever read.', '完全按定义写出的 DP：每件物品一行，每种容量一列。容易写对，也容易手算验证——但它存了 n · W 个格子，而真正用到的永远只有上一行。'],
      time: 'O(n · W)', space: 'O(n · W)',
      code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, W, w[3005], v[3005];
long long f[3005][3005];

int main() {
    scanf("%d%d", &n, &W);
    for (int i = 1; i <= n; i++) scanf("%d%d", &w[i], &v[i]);
    for (int i = 1; i <= n; i++)  //@item
        for (int j = 0; j <= W; j++) {
            f[i][j] = f[i - 1][j];  //@skip
            if (j >= w[i]) f[i][j] = max(f[i][j], f[i - 1][j - w[i]] + v[i]);  //@take
        }
    printf("%lld\n", f[n][W]);  //@done
}`,
      notes: [
        ['item', ['Row 0 (no items) is all zeros because f is a global array.', '第 0 行（没有物品）全为 0，因为 f 是全局数组。']],
        ['skip', ['Leaving item i out is always possible: copy the cell above.', '不选第 i 件物品总是可行的：照抄正上方的格子。']],
        ['take', ['Putting it in needs room for w[i]; the rest of the capacity is filled from the row above, so the item is used once.', '选它需要先放得下 w[i]；剩余容量取上一行的结果，所以这件物品只用一次。']],
        ['done', ['With n = W = 3000 this table already takes 72 MB.', '当 n = W = 3000 时，这张表已经要占 72 MB。']],
      ],
      run(inp, t) {
        const rd = reader(inp), n = rd.int(), W = rd.int(), w = [0], v = [0]
        need(n >= 0 && W >= 0 && (n + 1) * (W + 1) <= 2e7, 'The table (n + 1) × (W + 1) must not exceed 20,000,000 cells.', '表格 (n + 1) × (W + 1) 不能超过 20,000,000 个格子。')
        for (let i = 1; i <= n; i++) { w.push(rd.int()); v.push(rd.int()); need(w[i] >= 1, 'Weights must be positive.', '重量必须为正。') }
        const f = span(0, n).map(() => new Array<number>(W + 1).fill(0))
        const rows = span(0, n).map(i => (i ? `${i}: w=${w[i]} v=${v[i]}` : '—')), cols = span(0, W)
        // Cells that are not computed yet are shown empty.
        const view = (i: number, j: number, tone: Parameters<typeof gt>[0]) =>
          grid('f[i][j]  (row = items used, column = capacity)', f.map((row, r) => (r < i ? row : row.map((x, c) => (r === i && c <= j ? x : '')))), gt(tone), { rows, cols })
        for (let i = 1; i <= n; i++) {
          t.s('item', () => [[`Row ${i}: item with weight ${w[i]} and value ${v[i]}.`, `第 ${i} 行：重量 ${w[i]}、价值 ${v[i]} 的物品。`], view(i, -1, {}), vars({ i, w: w[i], v: v[i] })])
          for (let j = 0; j <= W; j++) {
            const skip = f[i - 1][j], fits = j >= w[i], take = fits ? f[i - 1][j - w[i]] + v[i] : 0
            f[i][j] = fits && take > skip ? take : skip
            if (fits) t.s('take', () => [[`f[${i}][${j}]: skip → ${skip}; take → f[${i - 1}][${j - w[i]}] + ${v[i]} = ${take}. ${take > skip ? 'Take it.' : 'Keep ' + skip + '.'}`, `f[${i}][${j}]：不选 → ${skip}；选 → f[${i - 1}][${j - w[i]}] + ${v[i]} = ${take}。${take > skip ? '选它。' : '保持 ' + skip + '。'}`],
              view(i, j, { cmp: [[i - 1, j], [i - 1, j - w[i]]], [take > skip ? 'act' : 'vis']: [[i, j]] }), vars({ i, w: w[i], v: v[i] })])
            else t.s('skip', () => [[`f[${i}][${j}]: capacity ${j} cannot hold weight ${w[i]}, copy ${skip} from above.`, `f[${i}][${j}]：容量 ${j} 放不下重量 ${w[i]}，照抄上方的 ${skip}。`],
              view(i, j, { cmp: [[i - 1, j]], vis: [[i, j]] }), vars({ i, w: w[i], v: v[i] })])
          }
        }
        t.s('done', () => [[`Best value with capacity ${W}: ${f[n][W]}.`, `容量为 ${W} 时的最大价值：${f[n][W]}。`], view(n, W, { ok: [[n, W]] }), vars({ answer: f[n][W] })])
        t.out(f[n][W])
      },
    },
  },
}

const STORIES: Record<string, Extras> = { ...BASIC, ...SORT, ...DS, ...SEARCH, ...DP, ...GRAPH1, ...GRAPH2, ...STRING, ...MATH, ...FULL }

export const RICH: Record<string, Extras> = Object.fromEntries(Object.entries(STORIES).map(([id, x]) => [id, { ...x, ...FIRST[id] }]))
