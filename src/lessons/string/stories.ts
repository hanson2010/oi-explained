import type { GEdge, Tones } from '../../engine/types'
import { arr, graph, grid, gt, layoutForest, reader, span, tn, vars } from '../../engine/h'
import type { Extras } from '../extras'
import { col, row } from '../story-util'

const PAD = [...'#a#b#a#c#a#b#a#']

/** Trie of he, she, his, hers, with four of its fail links drawn dashed. */
const AC_PAR = [-1, 0, 1, 2, 3, 1, 5, 0, 7, 8]
const AC_EDGES: GEdge[] = [
  ...AC_PAR.flatMap((p, i): GEdge[] => (p < 0 ? [] : [{ u: p, v: i }])),
  ...([[9, 2], [8, 1], [4, 7], [6, 7]] as const).map(([u, v]): GEdge => ({ u, v, dir: true, dash: true, tone: 'act' })),
]
const AC_LABEL = ['·', 'h', 'e', 'r', 's', 'i', 's', 's', 'h', 'e']

const cpp = String.raw

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

  'string-hash': {
    story: [
      { kind: 'naive', title: ['Start simple: compare letter by letter', '先从最简单的做起：逐个字母比较'],
        body: ['To decide whether two substrings are equal, walk along both and compare. That costs their length — and with a hundred thousand questions about substrings a hundred thousand letters long, **10¹⁰ comparisons**.', '要判断两个子串是否相等，可以同时沿着两者往后走，逐个比较。代价是子串的长度——如果有十万个询问，每个子串又有十万个字母，就是 **10¹⁰ 次比较**。'] },
      { kind: 'term', title: ['A hash function for strings', '字符串的哈希函数'],
        body: ['A hash function sums an object up in one number. For a string, read it as a ==number in base B== whose digits are the characters: `hash("abc") = a · B² + b · B + c`, with each letter standing for its character code. Take B larger than any character code — 131 is a common choice — and keep only the remainder modulo some M, here 2⁶⁴. Equal strings always get equal hashes. Two different strings can collide, but for a good B and a large M that happens about once in M tries.', '哈希函数把一个对象概括成一个数。对于字符串，把它读成一个 ==B 进制的数==，各位数字就是各个字符：`hash("abc") = a · B² + b · B + c`，其中每个字母代表它的字符编码。B 要取得比任何字符编码都大——131 是常见的选择——并且只保留模某个 M 的余数，这里是 2⁶⁴。相同的字符串哈希值一定相同。两个不同的字符串可能冲突，但只要 B 选得好、M 足够大，这大约每 M 次才发生一次。'],
        fig: () => [grid('in base 10, with digits as "letters": the string 4 7 2 is the number 472', [[4, 7, 2], ['4 · 10²', '7 · 10', '2']], gt({ cmp: row(0, 0, 2) }), { rows: ['string', 'worth'] })] },
      { kind: 'insight', title: ['A substring is a difference of two prefixes', '子串是两个前缀之差'],
        body: ['Think in base 10. From the prefixes of `3 1 4 7 2 9` — 3, 31, 314, 3147, 31472 — how do you get the piece `4 7 2`? Take 31472 and remove the 31 in front. But 31 stands three places to the left, so it is worth 31 000: ==31472 − 31 · 10³ = 472==. It is the prefix-sum idea, with a shift.', '用十进制想一想。已知 `3 1 4 7 2 9` 的各个前缀——3、31、314、3147、31472——怎样得到 `4 7 2` 这一段？取 31472，去掉前面的 31。但 31 在它左边三位的地方，实际代表 31 000：==31472 − 31 · 10³ = 472==。这就是前缀和的思想，只是多了一次移位。'],
        fig: () => [grid('prefixes of 3 1 4 7 2 9', [[3, 1, 4, 7, 2, 9], [3, 31, 314, 3147, 31472, 314729]], gt({ ok: [[0, 2], [0, 3], [0, 4]], bad: [[1, 1]], act: [[1, 4]] }), { rows: ['s', 'h'], cols: [1, 2, 3, 4, 5, 6] })] },
      { kind: 'how', title: ['Prefix hashes and powers of B', '前缀哈希与 B 的幂'],
        body: ['Build `h[i] = h[i − 1] · B + s[i]` and `pw[i] = pw[i − 1] · B` in one pass. Then `hash(l, r) = h[r] − h[l − 1] · pw[r − l + 1]`. Use `unsigned long long` and let it overflow: the machine keeps exactly the remainder modulo 2⁶⁴, and a subtraction that goes "below zero" wraps round to the right value.', '一遍扫描算出 `h[i] = h[i − 1] · B + s[i]` 和 `pw[i] = pw[i − 1] · B`。于是 `hash(l, r) = h[r] − h[l − 1] · pw[r − l + 1]`。用 `unsigned long long` 并任其溢出：机器保留的正好是模 2⁶⁴ 的余数，减法“减成负数”时也会绕回到正确的值。'] },
      { kind: 'result', title: ['Any two substrings compared in one step', '任意两个子串，一步比较'],
        body: ['**O(n)** to prepare, **O(1)** per question. With this tool many string problems become simple: find a pattern (compare one hash per position), find the longest repeated substring (binary search on the length), test for palindromes (hash the reversed string too). The answer is ==correct with overwhelming probability==, not with certainty.', '预处理 **O(n)**，每个询问 **O(1)**。有了这个工具，许多字符串问题都变得简单：查找模式串（每个位置比较一个哈希值）、求最长重复子串（对长度二分）、判断回文（把反转后的串也做哈希）。它的答案是==以压倒性的概率正确==，而不是绝对正确。'] },
    ],
    flow: [
      { id: 'init', kind: 'start', text: ['h[0] = 0;   pw[0] = 1', 'h[0] = 0；pw[0] = 1'], on: [] },
      { id: 'build', text: ['for i = 1 … n:   h[i] = h[i−1] · B + s[i];   pw[i] = pw[i−1] · B', '对 i = 1 … n：h[i] = h[i−1] · B + s[i]；pw[i] = pw[i−1] · B'] },
      { id: 'len', kind: 'test', text: ['next question:   equal lengths ?', '下一个询问：长度相等 ？'], no: 'query', on: [] },
      { id: 'get', text: ['hash(l, r) = h[r] − h[l−1] · pw[r − l + 1]   for both substrings', '对两个子串分别计算 hash(l, r) = h[r] − h[l−1] · pw[r − l + 1]'] },
      { id: 'query', kind: 'end', text: ['print Y if the lengths and the hashes agree, otherwise N', '长度和哈希值都相同则输出 Y，否则输出 N'] },
    ],
  },

  sam: {
    story: [
      { kind: 'term', title: ['Finite automata', '有限自动机'],
        body: ['A **finite automaton** is a machine with a finite number of **states** and, for each state and each letter, at most one **transition** to another state. It reads a string letter by letter from a start state; some states are marked as **accepting**. The automaton recognises exactly the strings that lead it to an accepting state. You have met several already: a ==trie== is an automaton that accepts a set of words; ==KMP== walks an automaton whose state is "how much of the pattern is matched"; the ==AC automaton== does the same for many patterns. The suffix automaton is the smallest automaton that accepts all suffixes of a string — and every path from the start, accepting or not, spells one of its substrings.', '**有限自动机**是这样一台机器：它有有限个**状态**，对每个状态和每个字母，至多有一个通向另一个状态的**转移**。它从起始状态出发，一个字母一个字母地读入字符串；其中一些状态被标记为**接受状态**。自动机识别的恰好是那些能把它带到接受状态的字符串。你其实已经见过好几种了：==字典树==是接受一组单词的自动机；==KMP== 是在一个自动机上行走，它的状态是“模式串已经匹配了多少”；==AC 自动机==对多个模式串做同样的事。后缀自动机是接受一个字符串所有后缀的最小的自动机——而且从起始状态出发的每一条路径，无论是否到达接受状态，拼出来的都是它的一个子串。'] },
      { kind: 'naive', title: ['Start simple: put every substring in a set', '先从最简单的做起：把每个子串放进集合'],
        body: ['Take all n² / 2 substrings and insert them into a set, or all n suffixes into a trie. Either way the size is **quadratic**: for a string of 10⁵ letters, billions of characters.', '取出全部 n² / 2 个子串放进一个集合，或者把 n 个后缀都插入一棵字典树。无论哪种做法，规模都是**平方级**的：10⁵ 个字母的字符串，要处理几十亿个字符。'],
        fig: () => [grid('the substrings of "abab", by where they end', [['a', '1, 3'], ['b', '2, 4'], ['ab', '2, 4'], ['ba', '3'], ['aba', '3'], ['bab', '4'], ['abab', '4']], gt({ cmp: [[1, 1], [2, 1]], alt: [[3, 1], [4, 1]], ok: [[5, 1], [6, 1]] }), { cols: ['substring', 'end positions'] })] },
      { kind: 'insight', title: ['Substrings that end in the same places are one state', '结束位置相同的子串是同一个状态'],
        body: ['Group substrings by their ==set of end positions==. In the table, "b" and "ab" always end together; so do "ba" and "aba"; so do "bab" and "abab". Whatever can follow one member of a group can follow all of them — so one state is enough for the whole group. The members of a group are suffixes of each other with consecutive lengths; `len` is the longest.', '把子串按==结束位置的集合==分组。在上面的表里，“b” 和 “ab” 总是一起结束；“ba” 和 “aba” 也是；“bab” 和 “abab” 也是。同一组里的任何一个串后面能接什么，其他的串后面也都能接——所以整组只需要一个状态。同一组的成员互为后缀，长度连续；`len` 是其中最长的那个的长度。'] },
      { kind: 'how', title: ['Suffix links, and three cases when a letter is added', '后缀链接，以及添加一个字母时的三种情况'],
        body: ['Dropping letters from the front of a state\'s strings eventually reaches a string with __more__ end positions: its state is the **suffix link**. To append c: make a state `cur` for the whole string; climb the links from the previous last state, giving every state without a c-transition one to `cur`. ==Fell off the top==: link `cur` to the root. ==Stopped at p with p –c→ q and len[q] = len[p] + 1==: link `cur` to q. ==Otherwise==: clone q with length len[p] + 1, redirect the transitions that pointed to q, and link both q and `cur` to the clone.', '从一个状态里的串的前面不断去掉字母，最终会得到一个结束位置__更多__的串：它所在的状态就是**后缀链接**。添加字符 c 时：为整个串新建状态 `cur`；从之前的最后一个状态出发沿链接往上爬，给每个没有 c 转移的状态添上一个通向 `cur` 的转移。==爬过了顶==：把 `cur` 的链接指向根。==停在 p，且 p –c→ q 满足 len[q] = len[p] + 1==：把 `cur` 的链接指向 q。==否则==：克隆 q，长度设为 len[p] + 1，把原来指向 q 的转移改指向克隆体，并让 q 和 `cur` 的链接都指向克隆体。'] },
      { kind: 'result', title: ['All substrings, in linear size', '线性的大小，装下所有子串'],
        body: ['Fewer than **2n states** and 3n transitions, built in linear time. State v contains `len[v] − len[link[v]]` substrings, so their sum is the number of different substrings. The same structure answers: does t occur in s (walk it), how often (sizes of end-position sets), the longest common substring of two strings, the k-th smallest substring.', '状态少于 **2n 个**，转移少于 3n 条，线性时间即可建成。状态 v 包含 `len[v] − len[link[v]]` 个子串，把它们加起来就是不同子串的个数。同一个结构还能回答：t 是否在 s 中出现（沿着它走一遍）、出现了多少次（结束位置集合的大小）、两个串的最长公共子串、字典序第 k 小的子串。'],
        fig: () => [grid('"abab": 3 + 2 + 2 = 7 different substrings', [['a', 1, 0, 1], ['ab, b', 2, 0, 2], ['aba, ba', 3, 1, 2], ['abab, bab', 4, 2, 2]], gt({ ok: col(3, 0, 3) }), { cols: ['strings of the state', 'len', 'len of its link', 'count'] })] },
    ],
    flow: [
      { id: 'new', kind: 'start', text: ['next letter c:   cur = new state,   len = len[last] + 1', '下一个字母 c：cur = 新状态，len = len[last] + 1'] },
      { id: 'walk', text: ['p = last;   while p has no c-transition:   add p –c→ cur,   p = link[p]', 'p = last；只要 p 没有 c 转移：添加 p –c→ cur，p = link[p]'] },
      { id: 'root', kind: 'test', text: ['p fell off the root ?   link[cur] = root', 'p 爬过了根 ？link[cur] = 根'], yes: 'last', no: 'direct' },
      { id: 'direct', kind: 'test', text: ['q = target of p –c→;   len[q] = len[p] + 1 ?   link[cur] = q', 'q = p –c→ 的目标；len[q] = len[p] + 1 ？link[cur] = q'], yes: 'last', no: 'clone' },
      { id: 'clone', text: ['clone q with len[p] + 1;   redirect transitions;   link[q] = link[cur] = clone', '克隆 q，长度为 len[p] + 1；修改转移；link[q] = link[cur] = 克隆体'] },
      { id: 'last', text: ['last = cur', 'last = cur'], next: 'new', on: [] },
      { id: 'count', text: ['answer = Σ (len[v] − len[link[v]])', '答案 = Σ (len[v] − len[link[v]])'] },
      { id: 'done', kind: 'end', text: ['print the answer', '输出答案'] },
    ],
  },
}
