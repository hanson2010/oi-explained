import type { GEdge } from '../../engine/types'
import { arr, graph, grid, gt, layoutForest, span, tn } from '../../engine/h'
import type { Extras } from '../rich'
import { row } from './util'

const PAD = [...'#a#b#a#c#a#b#a#']

/** Trie of he, she, his, hers, with four of its fail links drawn dashed. */
const AC_PAR = [-1, 0, 1, 2, 3, 1, 5, 0, 7, 8]
const AC_EDGES: GEdge[] = [
  ...AC_PAR.flatMap((p, i): GEdge[] => (p < 0 ? [] : [{ u: p, v: i }])),
  ...([[9, 2], [8, 1], [4, 7], [6, 7]] as const).map(([u, v]): GEdge => ({ u, v, dir: true, dash: true, tone: 'act' })),
]
const AC_LABEL = ['·', 'h', 'e', 'r', 's', 'i', 's', 's', 'h', 'e']

export const STRING: Record<string, Extras> = {
  manacher: {
    story: [
      { kind: 'naive', title: ['Start simple: expand around every centre', '先从最简单的做起：从每个中心向两边扩展'],
        body: ['Pick a centre and compare outward, one pair of characters at a time. On a string like `aaaa…a` every centre expands almost to the ends: **O(n²)**. And there are two kinds of centres — a character (odd length) or a gap between two characters (even length).', '选一个中心，向两边一对一对地比较字符。遇到 `aaaa…a` 这样的串，每个中心几乎都要扩展到两端：**O(n²)**。而且中心有两种——一个字符（奇数长度）或两个字符之间的缝隙（偶数长度）。'] },
      { kind: 'how', title: ['Pad with # so every palindrome has one centre cell', '插入 #，让每个回文串都有一个中心格子'],
        body: ['Insert a separator between all characters (and at both ends). Now every palindrome, odd or even, is centred __on a cell__, and its radius `p[i]` in the padded string equals its ==length in the original==.', '在所有字符之间（以及两端）插入一个分隔符。这样无论奇偶，每个回文串都以__某个格子__为中心，而且它在新串中的半径 `p[i]` 恰好等于它在==原串中的长度==。'],
        fig: () => [arr('"abba" padded: the centre is the # in the middle', [...'#a#b#b#a#'], tn({ ok: 4, cmp: [...span(0, 3), ...span(5, 8)] }), { i: 4 }), arr('p — radius 4 = length of "abba"', [0, 1, 0, 1, 4, 1, 0, 1, 0], tn({ ok: 4 }))] },
      { kind: 'insight', title: ['Inside a palindrome, the right half mirrors the left', '在一个回文串内部，右半边是左半边的镜像'],
        body: ['Keep the palindrome that reaches furthest right: centre c, right end r. For a new centre i inside it, look at its mirror `2c − i`. Whatever surrounds the mirror is ==repeated around i in reverse==, as far as the big palindrome reaches. So `p[i] ≥ min(p[mirror], r − i)` — known without a single comparison.', '维护向右延伸得最远的那个回文串：中心 c，右端 r。对于它内部的新中心 i，看它的镜像位置 `2c − i`。在大回文串的范围内，镜像周围的字符会==反着在 i 的周围重现==。所以 `p[i] ≥ min(p[镜像], r − i)`——一次比较都不用就知道了。'],
        fig: () => [arr('"abacaba" padded:  c = 7, r = 14.   i = 11 mirrors position 3', PAD, tn({ ok: 7, cmp: 3, act: 11 }), { mirror: 3, c: 7, i: 11, r: 14 }), arr('p:  p[3] = 3 and r − i = 3, so p[11] ≥ 3 for free', [0, 1, 0, 3, 0, 1, 0, 7, 0, 1, 0, 3, '', '', ''], tn({ cmp: 3, ok: 7, act: 11 }))] },
      { kind: 'how', title: ['Compare only beyond r', '只在 r 的右边才真正比较'],
        body: ['Start `p[i]` from that free value, then expand character by character as usual. A comparison can only succeed past r — inside, everything is already known — and when it does, ==r moves right==. Then make i the new c if its palindrome reaches further.', '让 `p[i]` 从这个白得的值开始，然后照常逐个字符向外扩展。比较只有在 r 的右边才可能成功——r 以内的一切都已经知道了——而每成功一次，==r 就向右移动==。如果 i 的回文串延伸得更远，就让 i 成为新的 c。'] },
      { kind: 'result', title: ['r only moves right', 'r 只会向右移动'],
        body: ['Every successful comparison pushes r one step right, and r can do that at most n times; every centre has at most one failed comparison: **O(n)**. The largest `p[i]` is the answer, and the sum of ⌈p[i] / 2⌉ counts all palindromic substrings.', '每次成功的比较都把 r 向右推一步，而 r 最多只能推 n 次；每个中心最多只有一次失败的比较：**O(n)**。最大的 `p[i]` 就是答案；把所有 ⌈p[i] / 2⌉ 加起来，就是回文子串的总数。'] },
    ],
    flow: [
      { id: 'pad', kind: 'start', text: ['pad:  t = ^ # s₁ # s₂ # … # $;   c = r = 0', '填充：t = ^ # s₁ # s₂ # … # $；c = r = 0'] },
      { id: 'loop', kind: 'test', text: ['another centre i ?', '还有中心 i ？'], no: 'done', on: [] },
      { id: 'mirror', text: ['p[i] = min(p[2c − i], r − i)  if i < r,  otherwise 0', '若 i < r：p[i] = min(p[2c − i], r − i)，否则为 0'] },
      { id: 'eq', kind: 'test', text: ['the two characters just outside radius p[i] are equal ?', '半径 p[i] 之外紧邻的两个字符相同？'], no: 'box', on: [] },
      { id: 'expand', text: ['p[i]++', 'p[i]++'], next: 'eq' },
      { id: 'box', text: ['if i + p[i] > r:   c = i,  r = i + p[i]', '若 i + p[i] > r：c = i，r = i + p[i]'], next: 'loop' },
      { id: 'done', kind: 'end', text: ['print the largest p[i]', '输出最大的 p[i]'] },
    ],
  },

  'z-function': {
    story: [
      { kind: 'naive', title: ['Start simple: compare from scratch at every position', '先从最简单的做起：每个位置都从头比较'],
        body: ['For each i compare `s[i..]` with `s[0..]` character by character until they differ. On `aaaa…a` position i matches n − i characters: **O(n²)** in total — and each position learns nothing from the ones before it.', '对每个 i，把 `s[i..]` 与 `s[0..]` 逐个字符比较，直到出现不同。遇到 `aaaa…a`，位置 i 要匹配 n − i 个字符：总共 **O(n²)**——而且每个位置都没有从之前的位置学到任何东西。'] },
      { kind: 'insight', title: ['A match is a copy of the beginning', '一段匹配，就是开头部分的一份拷贝'],
        body: ['Remember the match that reaches furthest right: the **Z-box** [l, r), with `s[l..r) = s[0..r−l)`. Inside the box the string ==is a copy of its own beginning==. So what follows a position i in the box looks exactly like what follows position `i − l` near the start — and `z[i − l]` is already known.', '记住向右延伸得最远的那段匹配：**Z-box** [l, r)，满足 `s[l..r) = s[0..r−l)`。在这个盒子里，字符串==就是它自己开头部分的拷贝==。所以盒子里位置 i 之后的内容，与开头附近位置 `i − l` 之后的内容一模一样——而 `z[i − l]` 早就算好了。'],
        fig: () => [arr('s: the box [3, 8) is a copy of s[0..5).   i = 6 corresponds to i − l = 3', [...'abbabbab'], tn({ cmp: span(0, 4), ok: span(5, 7), act: 6 }), { 'i-l': 3, l: 3, i: 6 }), arr('z:  z[3] = 5, but only r − i = 2 characters are certain, so z[6] starts at 2', [8, 0, 0, 5, 0, 0, 2, ''], tn({ cmp: 3, act: 6 }))] },
      { kind: 'how', title: ['Take what is certain, then extend', '先拿走确定的部分，再继续扩展'],
        body: ['If i is inside the box: `z[i] = min(z[i − l], r − i)` — the copy is only guaranteed ==up to the end of the box==. Then compare onward as usual. If the match now ends beyond r, this becomes the new box.', '如果 i 在盒子里：`z[i] = min(z[i − l], r − i)`——拷贝只在==盒子结束之前==有保证。然后照常继续向后比较。如果这段匹配的结尾超过了 r，它就成为新的盒子。'] },
      { kind: 'result', title: ['Linear, and a second road to pattern matching', '线性，也是字符串匹配的另一条路'],
        body: ['A comparison either fails (once per position) or pushes r to the right (at most n times): **O(n)**. To find a pattern p in a text t, compute Z of `p + "#" + t` and look for the value |p|. Z-values and KMP\'s border table carry the same information in two shapes.', '一次比较要么失败（每个位置只有一次），要么把 r 向右推（最多 n 次）：**O(n)**。要在文本 t 中查找模式 p，就对 `p + "#" + t` 求 Z 函数，再找值等于 |p| 的位置。Z 函数与 KMP 的 border 数组包含的是同样的信息，只是形式不同。'] },
    ],
    flow: [
      { id: 'init', kind: 'start', text: ['z[0] = n;   l = r = 0;   i = 1', 'z[0] = n；l = r = 0；i = 1'], on: [] },
      { id: 'loop', kind: 'test', text: ['i < n ?', 'i < n ？'], no: 'end', on: [] },
      { id: 'reuse', text: ['if i < r:   z[i] = min(z[i − l], r − i)', '若 i < r：z[i] = min(z[i − l], r − i)'] },
      { id: 'eq', kind: 'test', text: ['s[z[i]] = s[i + z[i]] ?   (still inside s)', 's[z[i]] = s[i + z[i]] ？（且未越界）'], no: 'box', on: [] },
      { id: 'expand', text: ['z[i]++', 'z[i]++'], next: 'eq' },
      { id: 'box', text: ['if i + z[i] > r:   l = i,  r = i + z[i];    i++', '若 i + z[i] > r：l = i，r = i + z[i]；i++'], next: 'loop' },
      { id: 'end', kind: 'end', text: ['print z[]', '输出 z[]'], on: [] },
    ],
  },

  'ac-automaton': {
    story: [
      { kind: 'naive', title: ['Start simple: one KMP per pattern', '先从最简单的做起：每个模式串跑一次 KMP'],
        body: ['Each run reads the whole text, so k patterns cost **k × |text|**. With ten thousand keywords and a long text that is far too much — and the patterns have a lot in common that is never shared.', '每跑一次都要把整个文本读一遍，所以 k 个模式串的代价是 **k × |文本|**。一万个关键词加上一篇长文本，这就太多了——而且模式串之间有大量共同之处，却完全没有被利用。'] },
      { kind: 'insight', title: ['Walk a trie of all patterns — and never start over', '在所有模式串的 Trie 上行走——并且永不从头再来'],
        body: ['Put all patterns into one trie; reading the text is walking down it. When the walk cannot continue, do what KMP does: fall back to the ==longest proper suffix of what was read that is still a path in the trie==. That target is the node\'s **fail link** — KMP\'s border, but across all patterns at once.', '把所有模式串放进同一棵 Trie；读文本就是在 Trie 上往下走。当走不下去时，像 KMP 那样处理：退到==已读内容的最长真后缀中、仍然是 Trie 中一条路径的那个==。这个目标就是该结点的**失配指针（fail）**——也就是 KMP 的 border，只不过是同时针对所有模式串。'],
        fig: () => [graph(layoutForest(AC_PAR), AC_EDGES, { name: 'he, she, his, hers.   Dashed: fail links, e.g. "she" → "he", "hers" → "s"', label: AC_LABEL, tone: tn({ dim: 0, ok: [2, 4, 6, 9] }) })] },
      { kind: 'how', title: ['Build the fail links level by level', '一层一层地求出失配指针'],
        body: ['A fail link always points to a shallower node, so a __BFS__ has everything ready: the fail of the child reached by letter c from u is `ch[fail[u]][c]`. Two refinements make the search a plain loop: ==missing edges are filled in== with `ch[fail[u]][c]`, so a text character is always one table lookup; and each node\'s count ==absorbs the count of its fail node==, because every pattern ending there ends here too.', '失配指针总是指向更浅的结点，所以用 __BFS__ 时需要的信息都已准备好：u 经字母 c 到达的孩子，它的 fail 就是 `ch[fail[u]][c]`。再做两处改进，匹配就变成了一个简单的循环：用 `ch[fail[u]][c]` ==补全缺失的边==，这样每读一个文本字符都只需查一次表；让每个结点的计数==加上它 fail 结点的计数==，因为在那里结束的模式串也都在这里结束。'] },
      { kind: 'result', title: ['One pass over the text for all patterns', '只扫一遍文本，匹配所有模式串'],
        body: ['Building costs O(Σ|p| × 26); the search is **O(|text|)**, however many patterns there are. This is the engine of keyword filters and multi-pattern search, and its states are a ready-made basis for DP ("count the strings that avoid all patterns").', '构建的代价是 O(Σ|p| × 26)；匹配是 **O(|文本|)**，与模式串的个数无关。关键词过滤和多模式搜索用的就是它；它的状态还可以直接用来做 DP（例如“统计不包含任何模式串的字符串个数”）。'] },
    ],
    flow: [
      { id: 'ins', kind: 'start', text: ['insert every pattern into a trie', '把每个模式串插入 Trie'] },
      { id: 'end', text: ['cnt[last node of the pattern]++', 'cnt[模式串的末尾结点]++'] },
      { id: 'fail', text: ['BFS by depth:  cnt[u] += cnt[fail[u]];  set the fail of each child, fill in missing edges', '按深度 BFS：cnt[u] += cnt[fail[u]]；求出孩子的 fail，补全缺失的边'] },
      { id: 'more', kind: 'test', text: ['another text character c ?', '还有文本字符 c ？'], no: 'done', on: [] },
      { id: 'walk', text: ['u = ch[u][c];   ans += cnt[u]', 'u = ch[u][c]；ans += cnt[u]'], next: 'more' },
      { id: 'done', kind: 'end', text: ['print ans', '输出 ans'] },
    ],
  },

  'suffix-array': {
    story: [
      { kind: 'naive', title: ['Start simple: sort the suffixes as strings', '先从最简单的做起：把后缀当作字符串来排序'],
        body: ['A sort makes about n log n comparisons, and comparing two suffixes character by character can take **O(n)** — on `aaaa…a` it always does. That is n² log n. The suffixes are not independent strings, though: each one is the tail of another.', '排序大约需要 n log n 次比较，而逐个字符比较两个后缀可能要 **O(n)**——在 `aaaa…a` 上每次都是如此。总共就是 n² log n。不过这些后缀并不是互不相干的字符串：每一个都是另一个的尾部。'] },
      { kind: 'insight', title: ['2k characters = two blocks of k whose ranks you already know', '2k 个字符 = 两段各 k 个字符，而它们的排名已经知道了'],
        body: ['Suppose every suffix has a rank by its first k characters. The first 2k characters of the suffix at i are its first k characters followed by ==the first k characters of the suffix at i + k== — and that is a suffix too, with a known rank. So comparing by 2k characters means comparing the pairs `(rk[i], rk[i + k])`: two integer comparisons.', '假设每个后缀都已按前 k 个字符排好了名次。位置 i 的后缀的前 2k 个字符，就是它的前 k 个字符再接上==位置 i + k 的后缀的前 k 个字符==——而那也是一个后缀，名次已知。所以按前 2k 个字符比较，就是比较二元组 `(rk[i], rk[i + k])`：只需两次整数比较。'],
        fig: () => [grid('banana', [[...'banana'], [1, 0, 2, 0, 2, 0], ['1, 0', '0, 2', '2, 0', '0, 2', '2, 0', '0, −'], [2, 1, 3, 1, 3, 0], ['2, 3', '1, 1', '3, 3', '1, 0', '3, −', '0, −'], [3, 2, 5, 1, 4, 0]].map(r => [...r]), gt({ cmp: row(2, 0, 5), alt: row(4, 0, 5), ok: row(5, 0, 5), dim: row(0, 0, 5) }), { rows: ['suffix starts with', 'rank by 1 character', 'pair (rk[i], rk[i+1])', 'rank by 2 characters', 'pair (rk[i], rk[i+2])', 'rank by 4 characters'], cols: span(0, 5) })] },
      { kind: 'how', title: ['Sort by pairs, re-rank, double', '按二元组排序，重新编号，长度翻倍'],
        body: ['Start with k = 1 and the characters themselves as ranks. Sort the suffixes by their pairs; walk the sorted order and give ==equal pairs the same rank==; double k. A suffix shorter than i + k uses −1 as its second half, so it sorts first. Stop as soon as all ranks are different — the order is final.', '从 k = 1 开始，把字符本身当作名次。按二元组给后缀排序；顺着排好的顺序走一遍，==相同的二元组得到相同的名次==；然后把 k 翻倍。如果后缀长度不到 i + k，就用 −1 作为后半部分，这样它会排在前面。一旦所有名次互不相同，顺序就最终确定了，可以停止。'],
        fig: () => [arr('suffix array of "banana": a, ana, anana, banana, na, nana', [5, 3, 1, 0, 4, 2], tn({ ok: span(0, 5) }))] },
      { kind: 'result', title: ['log n rounds', 'log n 轮'],
        body: ['k doubles each round, so there are at most log n rounds of sorting: **O(n log² n)**, or O(n log n) with radix sort. Together with the height array (the common prefix of neighbouring suffixes) the suffix array answers questions about ==all substrings at once==: how many are distinct, which is the longest repeated one, where a pattern occurs.', 'k 每轮翻倍，所以最多排序 log n 轮：**O(n log² n)**，用基数排序则是 O(n log n)。再配合 height 数组（排名相邻的后缀的最长公共前缀），后缀数组可以==一次性回答关于所有子串的问题==：有多少个不同的子串、最长的重复子串是哪个、某个模式串出现在哪里。'] },
    ],
    flow: [
      { id: 'init', kind: 'start', text: ['sa[i] = i;   rk[i] = s[i];   k = 1', 'sa[i] = i；rk[i] = s[i]；k = 1'] },
      { id: 'sort', text: ['sort the suffixes by the pair (rk[i], rk[i + k])', '按二元组 (rk[i], rk[i + k]) 给后缀排序'] },
      { id: 'rank', text: ['new ranks along the sorted order: equal pairs share a rank', '沿排好的顺序重新编号：相同的二元组名次相同'] },
      { id: 'done', kind: 'test', text: ['are all ranks different ?', '所有名次都互不相同？'], yes: 'end', no: 'dbl' },
      { id: 'dbl', text: ['k = 2k', 'k = 2k'], next: 'sort', on: [] },
      { id: 'end', kind: 'end', text: ['print sa', '输出 sa'], on: [] },
    ],
  },
}
