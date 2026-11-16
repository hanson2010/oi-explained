import { arr, graph, grid, gt, layoutTree, need, reader, span, tn, vars } from '../../engine/h'
import type { Extras } from '../extras'
import { at, col, ed, row } from '../story-util'

const LIS_A = [3, 1, 4, 1, 5, 9, 2, 6]
const STONES = { rows: ['l = 1', 'l = 2', 'l = 3', 'l = 4'], cols: ['r = 1', 'r = 2', 'r = 3', 'r = 4'] }
const LCS = { rows: ['', 'C', 'A', 'C', 'D'], cols: ['', 'D', 'B', 'C', 'C'] }
const TREE_ES: [number, number][] = [[0, 1], [1, 2], [1, 3], [3, 4], [3, 5]]

const cpp = String.raw

export const DP: Record<string, Extras> = {
  lis: {
    story: [
      { kind: 'naive', title: ['Start simple: try every subsequence', '先从最简单的做起：枚举每个子序列'],
        body: ['Each element is either kept or dropped, so there are **2ⁿ** subsequences. For n = 50 that is a million billion — and most of them share long common beginnings that are examined again and again.', '每个元素要么保留、要么丢掉，所以一共有 **2ⁿ** 个子序列。n = 50 时就是一千万亿个——而且其中大多数有很长的相同开头，被一遍又一遍地重复检查。'] },
      { kind: 'insight', title: ['Ask a sharper question: the longest one ending exactly here', '把问题问得更具体：恰好在这里结束的最长的那个'],
        body: ['Let `f[i]` be the length of the longest increasing subsequence that ==ends at a[i]==. Such a subsequence is a[i] alone, or one that ends at some earlier, smaller a[j] with a[i] appended. And the part before a[i] must itself be the __longest__ one ending at j — otherwise swap in a longer one. So only one number per position has to be remembered.', '设 `f[i]` 为==以 a[i] 结尾==的最长上升子序列的长度。这样的子序列要么只有 a[i] 自己，要么是某个以更靠前、更小的 a[j] 结尾的子序列再接上 a[i]。而 a[i] 之前的那部分，本身必须是以 j 结尾的__最长__的那个——否则换成更长的就更优。所以每个位置只需要记住一个数。'],
        fig: () => [arr('a: which earlier elements are smaller than a[4] = 5 ?', LIS_A, tn({ cmp: span(0, 3), act: 4, dim: span(5, 7) }), { i: 4 }), arr('f: the best of them is f[2] = 2, so f[4] = 3', [1, 1, 2, 1, 3, '', '', ''], tn({ ok: 2, act: 4 }), { j: 2 })] },
      { kind: 'how', title: ['State, transition, order, answer', '状态、转移、顺序、答案'],
        body: ['**State**: f[i]. **Transition**: `f[i] = 1 + max f[j]` over all j < i with a[j] < a[i] (just 1 if there is none). **Order**: left to right, so every f[j] is ready when f[i] needs it. **Answer**: the largest f[i] — the subsequence may end anywhere.', '**状态**：f[i]。**转移**：`f[i] = 1 + max f[j]`，其中 j < i 且 a[j] < a[i]（没有这样的 j 就是 1）。**顺序**：从左到右，这样计算 f[i] 时所有 f[j] 都已算好。**答案**：最大的 f[i]——子序列可以在任何位置结束。'],
        fig: () => [arr('a', LIS_A, tn({ ok: [1, 2, 4, 5] })), arr('f — the answer is the maximum, 4  (for example 1, 4, 5, 9)', [1, 1, 2, 1, 3, 4, 2, 4], tn({ ok: [5, 7] }))] },
      { kind: 'result', title: ['From 2ⁿ to n²', '从 2ⁿ 降到 n²'],
        body: ['n states, each computed from at most n earlier ones: **O(n²)**. This is dynamic programming in miniature: replace "all possibilities" by a few ==sub-questions whose answers build on each other==. (Keeping, for every length, the smallest possible last element and binary searching in it brings LIS down to O(n log n).)', 'n 个状态，每个最多由前面 n 个状态算出：**O(n²)**。这就是动态规划的缩影：把“所有可能”换成少数几个==答案可以层层递推的子问题==。（如果对每种长度都记下可能的最小结尾元素，并在其中二分，LIS 还能降到 O(n log n)。）'] },
    ],
    flow: [
      { id: 'start', kind: 'start', text: ['i = 0;  ans = 0', 'i = 0；ans = 0'], on: [] },
      { id: 'loop', kind: 'test', text: ['i < n ?', 'i < n ？'], no: 'done', on: [] },
      { id: 'init', text: ['f[i] = 1   (a[i] on its own)', 'f[i] = 1（只有 a[i] 自己）'] },
      { id: 'try', text: ['for each j < i with a[j] < a[i]:  f[i] = max(f[i], f[j] + 1)', '对每个 j < i 且 a[j] < a[i]：f[i] = max(f[i], f[j] + 1)'] },
      { id: 'fix', text: ['ans = max(ans, f[i]);  i++', 'ans = max(ans, f[i])；i++'], next: 'loop' },
      { id: 'done', kind: 'end', text: ['print ans', '输出 ans'] },
    ],
  },

  'interval-dp': {
    story: [
      { kind: 'naive', title: ['Start simple: always merge the cheapest neighbours', '先从最简单的做起：总是合并最便宜的相邻两堆'],
        body: ['It worked for Huffman trees — but there any two piles could be merged. Here only __neighbours__ can, and the greedy choice goes wrong: with piles 6 4 4 6 it merges the two 4s first and pays 42, while pairing each 4 with its outer neighbour costs only **40**.', '这在哈夫曼树里是对的——但那里任意两堆都可以合并。这里只能合并__相邻__的两堆，贪心就会出错：石子为 6 4 4 6 时，贪心先合并两个 4，总代价是 42；而让每个 4 与它外侧的邻居合并，只要 **40**。'],
        fig: () => [grid('piles 6 4 4 6', [['4 + 4 = 8', '6 + 8 = 14', '14 + 6 = 20', 42], ['6 + 4 = 10', '4 + 6 = 10', '10 + 10 = 20', 40]], gt({ bad: [[0, 3]], ok: [[1, 3]] }), { rows: ['greedy', 'optimal'], cols: ['merge 1', 'merge 2', 'merge 3', 'total'] })] },
      { kind: 'insight', title: ['Think about the last merge', '想一想最后一次合并'],
        body: ['Whatever happened before, the final merge joins a pile made of stones l..k with a pile made of stones k+1..r. It costs ==sum(l..r), whatever k is==. And before it, the two sides were merged __independently__, each as cheaply as possible. So an interval is solved by trying every split point k.', '不管之前怎么合并，最后一次合并一定是把由 l..k 的石子合成的一堆，与由 k+1..r 的石子合成的一堆合起来。它的代价是 ==sum(l..r)，与 k 无关==。而在此之前，两边是__各自独立__合并的，各自都应取最小代价。所以解决一个区间的办法就是枚举每个分割点 k。'],
        fig: () => [arr('piles 1..4: the last merge for k = 2 joins [1..2] and [3..4] and costs 6 + 1 + 5 + 9 = 21', [6, 1, 5, 9], tn({ cmp: [0, 1], alt: [2, 3] }), { k: 1 }, { base: 1 })] },
      { kind: 'how', title: ['Short intervals first', '先算短的区间'],
        body: ['`f[l][r]` = cheapest way to merge piles l..r into one. `f[l][r] = min over k of f[l][k] + f[k+1][r]`, plus `sum(l..r)` from prefix sums. Both parts are __shorter__ than [l, r], so loop over the ==length== first: when a length is being computed, all shorter intervals are finished.', '`f[l][r]` = 把第 l..r 堆合并成一堆的最小代价。`f[l][r] = 对所有 k 取 f[l][k] + f[k+1][r] 的最小值`，再加上用前缀和求出的 `sum(l..r)`。两部分都比 [l, r] __短__，所以最外层要枚举==区间长度==：计算某个长度时，所有更短的区间都已算好。'],
        fig: () => [grid('piles 6 1 5 9:  f[1][4] = min(0 + 21,  7 + 14,  18 + 0) + 21 = 39', [[0, 7, 18, 39], ['', 0, 6, 21], ['', '', 0, 14], ['', '', '', 0]], gt({ dim: [[0, 0], [1, 1], [2, 2], [3, 3]], cmp: [[0, 2], [3, 3]], act: [[0, 3]] }), STONES)] },
      { kind: 'result', title: ['A pattern for anything that is merged or split in a row', '凡是在一排上合并或拆分的问题，都是这个模式'],
        body: ['About n²/2 intervals, up to n split points each: **O(n³)**, fine for n up to a few hundred. The same "state = interval, try every split, shorter first" solves matrix-chain multiplication, optimal bracketing and palindrome problems. For piles in a circle, write the row twice and take the best window of length n.', '大约 n²/2 个区间，每个最多 n 个分割点：**O(n³)**，n 在几百以内没有问题。同样的“状态 = 区间，枚举分割点，先短后长”还能解决矩阵链乘、最优加括号和回文类问题。如果石子围成一圈，把这一排复制一遍接在后面，再取长度为 n 的最优窗口即可。'] },
    ],
    flow: [
      { id: 'start', kind: 'start', text: ['prefix sums s[];  f[i][i] = 0;  len = 2', '前缀和 s[]；f[i][i] = 0；len = 2'], on: [] },
      { id: 'loop', kind: 'test', text: ['len ≤ n ?', 'len ≤ n ？'], no: 'done', on: [] },
      { id: 'range', text: ['for each l:  r = l + len − 1;  f[l][r] = ∞', '对每个 l：r = l + len − 1；f[l][r] = ∞'] },
      { id: 'split', text: ['for k = l … r − 1:  f[l][r] = min(f[l][r], f[l][k] + f[k+1][r] + sum(l..r))', '对 k = l … r − 1：f[l][r] = min(f[l][r], f[l][k] + f[k+1][r] + sum(l..r))'] },
      { id: 'inc', text: ['len++', 'len++'], next: 'loop', on: [] },
      { id: 'done', kind: 'end', text: ['print f[1][n]', '输出 f[1][n]'] },
    ],
  },

  lcs: {
    story: [
      { kind: 'naive', title: ['Start simple: test every subsequence of one string', '先从最简单的做起：枚举一个串的所有子序列'],
        body: ['Generate each of the **2ⁿ** subsequences of a and check whether it also occurs in b. Hopeless beyond a few dozen characters.', '生成 a 的全部 **2ⁿ** 个子序列，逐个检查它是否也是 b 的子序列。超过几十个字符就完全不可行了。'] },
      { kind: 'insight', title: ['Look only at the last characters', '只看最后一个字符'],
        body: ['If the last characters are ==equal==, pair them: some best solution ends with exactly this pair, so remove both and add 1. If they ==differ==, they cannot both be the final matched pair — at least one of them is unused. Drop one or the other and keep the better result. Either way the problem shrinks to __prefixes__ of the two strings.', '如果两个串的最后一个字符==相同==，就把它们配成一对：一定存在以这一对结尾的最优解，所以把两个字符都去掉，答案加 1。如果它们==不同==，它们不可能同时作为最后的匹配——至少有一个没被用到。去掉其中一个，取两种结果中较好的。无论哪种情况，问题都缩小成了两个串的__前缀__。'],
        fig: () => [grid('the two cases for the last characters', [['…C', '…C', 'pair them:  1 + LCS of both prefixes'], ['…C', '…D', 'drop the C, or drop the D:  take the better']], gt({ ok: [[0, 0], [0, 1]], bad: [[1, 0], [1, 1]] }), { cols: ['a ends with', 'b ends with', 'then'] })] },
      { kind: 'how', title: ['A table over all pairs of prefixes', '一张覆盖所有前缀组合的表'],
        body: ['`f[i][j]` = LCS of the first i characters of a and the first j of b. Equal: `f[i−1][j−1] + 1`. Different: `max(f[i−1][j], f[i][j−1])`. Row 0 and column 0 are zero — an empty prefix has nothing in common with anything. Each cell needs only its ==upper, left and upper-left== neighbours, so fill row by row.', '`f[i][j]` = a 的前 i 个字符与 b 的前 j 个字符的 LCS 长度。相同：`f[i−1][j−1] + 1`。不同：`max(f[i−1][j], f[i][j−1])`。第 0 行和第 0 列全为 0——空前缀与任何串都没有公共部分。每个格子只需要它的==上方、左方和左上方==的格子，所以逐行填表。'],
        fig: () => [grid('a = CACD (rows), b = DBCC (columns):  a[3] = b[4] = C, so f[3][4] = f[2][3] + 1 = 2', [[0, 0, 0, 0, 0], [0, 0, 0, 1, 1], [0, 0, 0, 1, 1], [0, 0, 0, 1, 2], [0, 1, 1, 1, 2]], gt({ dim: [...row(0, 0, 4), ...col(0, 1, 4)], cmp: [[2, 3]], act: [[3, 4]], ok: [[4, 4]] }), LCS)] },
      { kind: 'result', title: ['n × m cells, and a family of relatives', 'n × m 个格子，以及一大家子亲戚'],
        body: ['**O(n · m)** time; two rows are enough if only the length is needed. Walking back from the last cell along the choices recovers the subsequence itself. Edit distance, sequence alignment and the `diff` tool all fill ==the same table with slightly different rules==.', '时间 **O(n · m)**；如果只要长度，保留两行就够了。从最后一个格子沿着当初的选择往回走，可以还原出这个子序列本身。编辑距离、序列比对和 `diff` 工具，填的都是==同一张表，只是规则略有不同==。'] },
    ],
    flow: [
      { id: 'start', kind: 'start', text: ['row 0 and column 0 are all 0', '第 0 行和第 0 列全为 0'], on: [] },
      { id: 'loop', kind: 'test', text: ['another cell (i, j), row by row ?', '按行还有下一个格子 (i, j) ？'], no: 'done', on: [] },
      { id: 'eq', kind: 'test', text: ['a[i] = b[j] ?', 'a[i] = b[j] ？'], yes: 'match', no: 'skip', on: [] },
      { id: 'match', text: ['f[i][j] = f[i−1][j−1] + 1', 'f[i][j] = f[i−1][j−1] + 1'], next: 'loop' },
      { id: 'skip', text: ['f[i][j] = max(f[i−1][j], f[i][j−1])', 'f[i][j] = max(f[i−1][j], f[i][j−1])'], next: 'loop' },
      { id: 'done', kind: 'end', text: ['print f[n][m]', '输出 f[n][m]'] },
    ],
  },

  'tree-dp': {
    story: [
      { kind: 'naive', title: ['Start simple: take the heaviest vertices first', '先从最简单的做起：先选权值最大的点'],
        body: ['Greedy fails already on three vertices in a line with weights 5 – 6 – 5: taking the 6 blocks both neighbours, while the two 5s together give **10**. And trying all 2ⁿ subsets is out of the question.', '贪心在三个点连成一条线、权值为 5 – 6 – 5 时就已经错了：选了 6，两个邻居都不能选；而两个 5 加起来是 **10**。枚举全部 2ⁿ 个子集更是不可能。'],
        fig: () => [graph(at([[0, 0], [1, 0], [2, 0]]), ed([[0, 1], [1, 2]]), { name: 'greedy takes the 6 and gets 6; the best is 5 + 5 = 10', label: [5, 6, 5], tone: tn({ ok: [0, 2], bad: 1 }) })] },
      { kind: 'insight', title: ['A subtree talks to the rest only through its root', '一棵子树只通过它的根与外界打交道'],
        body: ['The only edge leaving the subtree of u is the one from u to its parent. So the parent needs to know just one thing about the whole subtree: ==was u chosen or not?== Keep two numbers per vertex: `f[u][1]`, the best total inside u\'s subtree if u is chosen, and `f[u][0]`, the best if it is not.', '离开 u 的子树的边只有一条，就是 u 连向父亲的那条。所以对于整棵子树，父亲只需要知道一件事：==u 选了还是没选？==每个点保存两个数：`f[u][1]`，选 u 时 u 的子树内的最大总和；`f[u][0]`，不选 u 时的最大总和。'] },
      { kind: 'how', title: ['Combine the children, children first', '合并孩子的结果，先算孩子'],
        body: ['If u is chosen, no child may be: `f[u][1] = w[u] + Σ f[v][0]`. If u is not chosen, every child is free to do whatever is better: `f[u][0] = Σ max(f[v][0], f[v][1])`. A depth-first search that computes a vertex __after__ its children (post-order) has everything ready.', '如果选了 u，孩子就都不能选：`f[u][1] = w[u] + Σ f[v][0]`。如果不选 u，每个孩子可以自由选择较优的方案：`f[u][0] = Σ max(f[v][0], f[v][1])`。用深度优先搜索，在处理完孩子__之后__再计算当前点（后序），需要的值就都准备好了。'],
        fig: () => [graph(layoutTree(6, TREE_ES), ed(TREE_ES), { name: 'weights 6 1 5 9 9 3 — beside each vertex: f[u][0] / f[u][1].   Best: 23 = vertices 1, 3, 5, 6', sub: ['17 / 23', '17 / 13', '0 / 5', '12 / 9', '0 / 9', '0 / 3'], tone: tn({ ok: [0, 2, 4, 5] }) })] },
      { kind: 'result', title: ['One small table per vertex', '每个点一张小表'],
        body: ['Every edge is used once: **O(n)**. The recipe — decide what a subtree must report about its root, then combine the children\'s reports — is ==tree DP==. It also gives the tree diameter, minimum vertex cover and dominating set, subtree sizes, and knapsacks on trees.', '每条边只用一次：**O(n)**。这个套路——先想清楚一棵子树需要向上汇报关于根的哪些信息，再把孩子们的汇报合并起来——就是==树形 DP==。树的直径、最小点覆盖、最小支配集、子树大小、树上背包，都可以这样做。'] },
    ],
    flow: [
      { id: 'call', kind: 'start', text: ['dfs(u, parent)', 'dfs(u, parent)'], on: [] },
      { id: 'init', text: ['f[u][1] = w[u];  f[u][0] = 0', 'f[u][1] = w[u]；f[u][0] = 0'] },
      { id: 'more', kind: 'test', text: ['another child v of u ?', 'u 还有孩子 v ？'], no: 'done', on: [] },
      { id: 'rec', text: ['dfs(v, u)   (finish the child first)', 'dfs(v, u)（先把孩子算完）'], on: [] },
      { id: 'child', text: ['f[u][0] += max(f[v][0], f[v][1]);  f[u][1] += f[v][0]', 'f[u][0] += max(f[v][0], f[v][1])；f[u][1] += f[v][0]'], next: 'more' },
      { id: 'done', kind: 'end', text: ['return   (at the root: print max(f[1][0], f[1][1]))', '返回（在根处：输出 max(f[1][0], f[1][1])）'] },
    ],
  },

  'bitmask-dp': {
    story: [
      { kind: 'naive', title: ['Start simple: try every order', '先从最简单的做起：枚举所有访问顺序'],
        body: ['Fix city 0 as the start and try every order of the others: **(n − 1)!** tours. For n = 17 that is about 2 × 10¹³ — and countless tours share the same beginning or the same ending.', '把城市 0 固定为起点，枚举其余城市的所有排列：共 **(n − 1)!** 条路线。n = 17 时大约是 2 × 10¹³——而无数条路线有着相同的开头或相同的结尾。'] },
      { kind: 'insight', title: ['The future does not care about the order of the past', '未来不关心过去的顺序'],
        body: ['Suppose you have visited some set of cities and stand in city i. How to continue best depends only on ==which cities are visited and where you are== — not on the order in which you visited them. So of all partial routes with the same (set, last city), only the __shortest__ needs to be kept.', '假设你已经访问了某个城市集合，现在站在城市 i。接下来怎样走最优，只取决于==哪些城市已经访问过、你现在在哪里==——与访问它们的先后顺序无关。所以在（集合、最后一个城市）相同的所有部分路线中，只需要保留__最短__的那一条。'],
        fig: () => [grid('two partial routes, one state: only the shorter one can lead to the best tour', [['0 → 1 → 2 → 3', '{0, 1, 2, 3}', 3, 12], ['0 → 2 → 1 → 3', '{0, 1, 2, 3}', 3, 9]], gt({ bad: [[0, 3]], ok: [[1, 3]], cmp: [...col(1, 0, 1), ...col(2, 0, 1)] }), { cols: ['route so far', 'visited', 'now at', 'length'] })] },
      { kind: 'how', title: ['A set of cities is the bits of one integer', '城市集合就是一个整数的二进制位'],
        body: ['Bit k of S is 1 when city k has been visited, so a set is an ==array index==. `(S >> j) & 1` tests membership, `S | (1 << j)` adds city j. `f[S][i]` = shortest route from city 0 that visits exactly S and ends at i. From (S, i) go to any unvisited j: `f[S | 1<<j][j] = min(…, f[S][i] + d[i][j])`. Adding a city makes S larger, so increasing S is a valid order.', 'S 的第 k 位为 1 表示城市 k 已经访问过，于是集合可以直接当作==数组下标==。`(S >> j) & 1` 判断是否在集合中，`S | (1 << j)` 把城市 j 加入集合。`f[S][i]` = 从城市 0 出发、恰好访问了集合 S、最后停在 i 的最短路线。从 (S, i) 走到任意一个未访问的 j：`f[S | 1<<j][j] = min(…, f[S][i] + d[i][j])`。加入一个城市会让 S 变大，所以按 S 从小到大计算就是合法的顺序。'],
        fig: () => [grid('S = 01011₂ = 11: cities 0, 1 and 3 are visited', [[0, 1, 0, 1, 1], ['', '✓', '', '✓', '✓']], gt({ ok: [[0, 1], [0, 3], [0, 4], [1, 1], [1, 3], [1, 4]], dim: [[0, 0], [0, 2]] }), { rows: ['bit', 'visited'], cols: ['city 4', 'city 3', 'city 2', 'city 1', 'city 0'] })] },
      { kind: 'result', title: ['Exponential, but a much smaller exponential', '仍是指数级，但小得多'],
        body: ['2ⁿ sets × n last cities × n next cities: **O(2ⁿ · n²)** — 38 million steps for n = 17 instead of 2 × 10¹³. Whenever n is at most about 20 and the state is "which items have been used", think ==bitmask DP==.', '2ⁿ 个集合 × n 个末尾城市 × n 个下一个城市：**O(2ⁿ · n²)**——n = 17 时是三千八百万步，而不是 2 × 10¹³。只要 n 不超过 20 左右，并且状态是“哪些元素已经用过”，就该想到==状态压缩 DP==。'],
        fig: () => [grid('steps', [['362 880', '≈ 2.1 × 10¹³', '≈ 1.2 × 10¹⁷'], ['102 400', '≈ 3.8 × 10⁷', '≈ 4.2 × 10⁸']], gt({ bad: [[0, 1], [0, 2]], ok: row(1, 0, 2) }), { rows: ['(n − 1)!', '2ⁿ · n²'], cols: ['n = 10', 'n = 17', 'n = 20'] })] },
    ],
    flow: [
      { id: 'init', kind: 'start', text: ['f[{0}][0] = 0;  every other state = ∞', 'f[{0}][0] = 0；其余状态 = ∞'] },
      { id: 'loop', kind: 'test', text: ['another reachable state (S, i), S increasing ?', '按 S 递增，还有可达状态 (S, i) ？'], no: 'close', on: [] },
      { id: 'next', kind: 'test', text: ['another city j that is not in S ?', '还有不在 S 中的城市 j ？'], no: 'loop', on: [] },
      { id: 'go', text: ['f[S ∪ {j}][j] = min(itself, f[S][i] + d[i][j])', 'f[S ∪ {j}][j] = min(自身, f[S][i] + d[i][j])'], next: 'next' },
      { id: 'close', kind: 'end', text: ['answer = min over i of  f[all][i] + d[i][0]', '答案 = 对所有 i 取 f[全集][i] + d[i][0] 的最小值'] },
    ],
  },
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
