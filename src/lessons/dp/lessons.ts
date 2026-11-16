import type { Lesson, Tone, Tones } from '../../engine/types'
import { adjOf, arr, genTree, graph, grid, gt, INF, inf, layoutTree, need, parentsOf, reader, span, tn, toEdges, vars, type E } from '../../engine/h'

const cpp = String.raw

const lis: Lesson = {
  id: 'lis', title: ['Longest increasing subsequence', '最长上升子序列'], level: 'J', cat: 'dp', diff: 4,
  blurb: ['A first dynamic programme: the best subsequence ending at i extends the best one ending at some earlier, smaller element.', '动态规划入门：以 i 结尾的最优子序列，一定是接在某个更靠前、更小的元素的最优子序列后面。'],
  ideas: [
    ['State: f[i] = length of the longest increasing subsequence that ends exactly at a[i].', '状态：f[i] = 恰好以 a[i] 结尾的最长上升子序列的长度。'],
    ['Transition: f[i] = 1 + max f[j] over all j < i with a[j] < a[i] (or just 1 if there is none).', '转移：f[i] = 1 + max f[j]，其中 j < i 且 a[j] < a[i]（若不存在这样的 j，则为 1）。'],
    ['Order: left to right, so every f[j] is ready when f[i] needs it.', '顺序：从左到右，保证计算 f[i] 时所有 f[j] 都已算好。'],
    ['Answer: the maximum of all f[i] — the subsequence may end anywhere.', '答案：所有 f[i] 的最大值——子序列可以在任何位置结束。'],
    ['The three ingredients of DP — state, transition, order — are all here. (A binary-search variant runs in O(n log n).)', 'DP 的三要素——状态、转移、顺序——都在这里了。（借助二分查找可以优化到 O(n log n)。）'],
  ],
  time: 'O(n²)', space: 'O(n)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, a[5005], f[5005];

int main() {
    scanf("%d", &n);
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    int ans = 0;
    for (int i = 0; i < n; i++) {
        f[i] = 1;  //@init
        for (int j = 0; j < i; j++)
            if (a[j] < a[i]) f[i] = max(f[i], f[j] + 1);  //@try
        ans = max(ans, f[i]);  //@fix
    }
    printf("%d\n", ans);  //@done
}`,
  notes: [
    ['init', ['a[i] alone is an increasing subsequence of length 1.', 'a[i] 自己就是一个长度为 1 的上升子序列。']],
    ['try', ['Strict < gives a strictly increasing subsequence; use <= for non-decreasing.', '严格的 < 对应严格上升；若要求不下降则改用 <=。']],
    ['fix', ['f[i] is final once all earlier positions have been tried.', '尝试完所有更靠前的位置后，f[i] 就确定了。']],
  ],
  input: ['n, then n integers. Prints the length of the longest strictly increasing subsequence.', 'n，随后 n 个整数。输出最长严格上升子序列的长度。'],
  sizes: [6, 8, 10], lab: [10, 100, 1000, 3000],
  gen: (n, r) => `${n}\n${r.ints(n, 1, n <= 40 ? 20 : 1000000).join(' ')}\n`,
  broken: {
    from: 'if (a[j] < a[i])', to: 'if (a[j] <= a[i])',
    why: ['With `<=` an element may follow an __equal__ one, so the program finds the longest non-decreasing subsequence. For 3 3 3 it answers 3, but a strictly increasing subsequence cannot contain the same value twice: the answer is 1. The two problems differ by a single character, and the statement decides which one is asked.', '用 `<=` 的话，一个元素可以接在与它__相等__的元素后面，于是程序求出的是最长不下降子序列。对 3 3 3 它回答 3，但严格上升的子序列里不能有两个相同的值：正确答案是 1。这两个问题只差一个字符，到底求哪一个要看题目怎么说。'],
  },
  run(inp, t, bug = false) {
    const rd = reader(inp), n = rd.int(), a = rd.ints(n), f = new Array<number>(n).fill(0), from = new Array<number>(n).fill(-1)
    let ans = 0, best = -1
    for (let i = 0; i < n; i++) {
      f[i] = 1
      t.s('init', () => [[`f[${i}] starts at 1: ${a[i]} on its own.`, `f[${i}] 初值为 1：只有 ${a[i]} 自己。`], arr('a', a, tn({ dim: span(i + 1, n - 1), act: i }), { i }), arr('f', f, tn({ dim: span(i + 1, n - 1), act: i }))])
      for (let j = 0; j < i; j++) {
        const ok = bug ? a[j] <= a[i] : a[j] < a[i], lt = bug ? '≤' : '<', ge = bug ? '>' : '≥', better = ok && f[j] + 1 > f[i]
        if (better) { f[i] = f[j] + 1; from[i] = j }
        t.s('try', () => [[ok ? `a[${j}] = ${a[j]} ${lt} ${a[i]}: can extend, f[${j}] + 1 = ${f[j] + 1}${better ? ' — new best.' : ', no improvement.'}` : `a[${j}] = ${a[j]} ${ge} ${a[i]}: cannot come before ${a[i]}.`, ok ? `a[${j}] = ${a[j]} ${lt} ${a[i]}：可以接上，f[${j}] + 1 = ${f[j] + 1}${better ? '——更优。' : '，没有更优。'}` : `a[${j}] = ${a[j]} ${ge} ${a[i]}：不能排在 ${a[i]} 前面。`],
          arr('a', a, tn({ dim: span(i + 1, n - 1), act: i, [ok ? 'cmp' : 'bad']: j }), { i, j }), arr('f', f, tn({ dim: span(i + 1, n - 1), act: i, cmp: j }))])
      }
      if (f[i] > ans) { ans = f[i]; best = i }
      t.s('fix', () => [[`f[${i}] = ${f[i]}. Best so far: ${ans}.`, `f[${i}] = ${f[i]}。目前最优：${ans}。`], arr('a', a, tn({ dim: span(i + 1, n - 1), ok: i })), arr('f', f, tn({ dim: span(i + 1, n - 1), ok: i })), vars({ answer: ans })])
    }
    t.s('done', () => {
      const path: number[] = []
      for (let x = best; x >= 0; x = from[x]) path.push(x)
      return [[`Answer ${ans}, e.g. ${path.reverse().map(x => a[x]).join(bug ? ' ≤ ' : ' < ')}.`, `答案为 ${ans}，例如 ${path.map(x => a[x]).join(bug ? ' ≤ ' : ' < ')}。`], arr('a', a, tn({ ok: path })), arr('f', f, tn({ ok: path })), vars({ answer: ans })]
    })
    t.out(ans)
  },
}

const knapsack: Lesson = {
  id: 'knapsack', title: ['0/1 knapsack', '0/1 背包'], level: 'J', cat: 'dp', diff: 5,
  blurb: ['Each item is taken or left. One array indexed by capacity is enough — as long as you sweep it from right to left.', '每件物品要么选要么不选。只用一个按容量下标的数组就够了——只要从右往左扫。'],
  ideas: [
    ['State: f[j] = the best value achievable with capacity j using the items seen so far.', '状态：f[j] = 只考虑目前见过的物品时，容量为 j 能得到的最大价值。'],
    ['For an item (w, v): either skip it (f[j] unchanged) or take it (f[j − w] + v).', '对于物品 (w, v)：要么不选（f[j] 不变），要么选（f[j − w] + v）。'],
    ['Sweep j downwards: then f[j − w] still describes the state before this item, so the item is used at most once.', 'j 从大到小扫描：这样 f[j − w] 仍是加入本物品之前的状态，保证每件物品至多用一次。'],
    ['Sweeping upwards instead would reuse the item — that is exactly the unbounded knapsack.', '如果改成从小到大扫，物品就会被重复使用——那正是完全背包。'],
  ],
  time: 'O(n · W)', space: 'O(W)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, W;
long long f[100005];

int main() {
    scanf("%d%d", &n, &W);
    for (int i = 1; i <= n; i++) {
        int w, v; scanf("%d%d", &w, &v);  //@item
        for (int j = W; j >= w; j--)
            f[j] = max(f[j], f[j - w] + v);  //@try
    }
    printf("%lld\n", f[W]);  //@done
}`,
  notes: [
    ['item', ['Items can be processed as they are read; nothing but f needs storing.', '物品可以边读边处理；除了 f 之外什么都不用存。']],
    ['try', ['j ≥ w: the item must fit. The loop direction is the whole trick.', 'j ≥ w：物品必须放得下。循环方向就是全部的关键。']],
    ['done', ['f[W] is "capacity at most W", because f starts as all zeros.', '由于 f 初值全为 0，f[W] 表示“容量不超过 W”时的最优值。']],
  ],
  input: ['n W, then n lines "w v": weight and value. Prints the maximum total value with total weight ≤ W.', 'n W，随后 n 行 “w v”：重量和价值。输出总重量不超过 W 时的最大总价值。'],
  sizes: [3, 4, 5], lab: [10, 100, 1000, 3000],
  gen: (n, r) => { const W = n <= 30 ? 2 * n + 2 : n; return `${n} ${W}\n` + span(1, n).map(() => `${r.int(1, Math.max(1, Math.min(W, n <= 30 ? 5 : 50)))} ${r.int(1, 9)}`).join('\n') + '\n' },
  broken: {
    from: 'for (int j = W; j >= w; j--)', to: 'for (int j = w; j <= W; j++)',
    why: ['Sweeping j upward, `f[j - w]` has __already been updated for this same item__ when it is read. So the item can be added on top of itself, again and again: this is the unbounded knapsack, where every item may be used any number of times. Sweeping downward reads `f[j - w]` before this round touches it — the value from the previous items only — and that is what keeps each item to one use.', '让 j 从小到大循环时，读到的 `f[j - w]` __已经被同一件物品更新过__。于是这件物品可以叠加在它自己上面，一次又一次：这变成了完全背包，每件物品可以用任意多次。从大到小循环时，读到的 `f[j - w]` 还没有被这一轮改动——它只包含前面的物品——这正是保证每件物品只用一次的原因。'],
  },
  run(inp, t, bug = false) {
    const rd = reader(inp), n = rd.int(), W = rd.int(), f = new Array<number>(W + 1).fill(0)
    need(n >= 0 && W >= 0 && W <= 2e6, 'W must be between 0 and 2,000,000.', 'W 须在 0 到 2,000,000 之间。')
    for (let i = 1; i <= n; i++) {
      const w = rd.int(), v = rd.int()
      need(w >= 1, 'Weights must be positive.', '重量必须为正。')
      t.s('item', () => [[`Item ${i}: weight ${w}, value ${v}.`, `第 ${i} 件物品：重量 ${w}，价值 ${v}。`], arr('f[j] (j = capacity)', f), vars({ item: i, w, v })])
      for (let j = bug ? w : W; bug ? j <= W : j >= w; j += bug ? 1 : -1) {
        const take = f[j - w] + v, old = f[j], better = take > old
        if (!bug && j === W && take !== old) t.ask(() => [[`Item ${i} at capacity ${j}: f[${j}] = ${old}, f[${j - w}] = ${f[j - w]}, value ${v}. What is f[${j}] afterwards?`, `第 ${i} 件物品，容量 ${j}：f[${j}] = ${old}，f[${j - w}] = ${f[j - w]}，价值 ${v}。之后 f[${j}] 是多少？`], [[String(Math.min(old, take)), String(Math.min(old, take))], [String(Math.max(old, take)), String(Math.max(old, take))]], 1])
        if (better) f[j] = take
        t.s('try', () => [[`j = ${j}: skip → ${old}; take → f[${j - w}] + ${v} = ${take}. ${better ? 'Take it.' : 'Keep ' + old + '.'}`, `j = ${j}：不选 → ${old}；选 → f[${j - w}] + ${v} = ${take}。${better ? '选它。' : '保持 ' + old + '。'}`],
          arr('f[j] (j = capacity)', f, tn({ ok: bug ? span(w, j - 1) : span(j + 1, W), cmp: j - w, [better ? 'act' : 'vis']: j }), { j, 'j-w': j - w }), vars({ item: i, w, v })])
      }
    }
    t.s('done', () => [[`Best value with capacity ${W}: ${f[W]}.`, `容量为 ${W} 时的最大价值：${f[W]}。`], arr('f[j] (j = capacity)', f, tn({ ok: W })), vars({ answer: f[W] })])
    t.out(f[W])
  },
}

const interval: Lesson = {
  id: 'interval-dp', title: ['Interval DP: merging stones', '区间 DP：石子合并'], level: 'J', cat: 'dp', diff: 5,
  blurb: ['Solve every interval from short to long; the last merge of an interval splits it into two smaller, already solved ones.', '按长度从短到长求解每个区间；一个区间的最后一次合并把它分成两个已经解决的更小区间。'],
  ideas: [
    ['Merging two adjacent piles costs their combined size; minimise the total cost of merging everything.', '合并相邻两堆的代价是它们的总石子数；要求把所有石子并成一堆的最小总代价。'],
    ['State: f[l][r] = minimum cost to merge piles l..r into one.', '状态：f[l][r] = 把第 l..r 堆合并成一堆的最小代价。'],
    ['Think about the last merge: it joins l..k and k+1..r, and costs sum(l..r) whatever k is.', '考虑最后一次合并：它把 l..k 和 k+1..r 合起来，无论 k 取何值，代价都是 sum(l..r)。'],
    ['f[l][r] = min over k of f[l][k] + f[k+1][r], plus sum(l..r) from prefix sums.', 'f[l][r] = 对所有 k 取 f[l][k] + f[k+1][r] 的最小值，再加上用前缀和求出的 sum(l..r)。'],
    ['Enumerate by length first, so shorter intervals are finished before longer ones need them.', '先枚举区间长度，保证较短的区间先算完，供较长的区间使用。'],
  ],
  time: 'O(n³)', space: 'O(n²)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n;
long long s[305], f[305][305];

int main() {
    scanf("%d", &n);
    for (int i = 1; i <= n; i++) {
        int x; scanf("%d", &x);
        s[i] = s[i - 1] + x;
    }
    for (int len = 2; len <= n; len++)
        for (int l = 1; l + len - 1 <= n; l++) {
            int r = l + len - 1;
            f[l][r] = LLONG_MAX;  //@range
            for (int k = l; k < r; k++)
                f[l][r] = min(f[l][r], f[l][k] + f[k + 1][r] + s[r] - s[l - 1]);  //@split
        }
    printf("%lld\n", f[1][n]);  //@done
}`,
  notes: [
    ['range', ['Intervals of length 1 cost nothing: f[i][i] = 0 (globals start at zero).', '长度为 1 的区间代价为 0：f[i][i] = 0（全局数组初值为零）。']],
    ['split', ['k is where the last merge happens. Both halves are shorter, so they are already known.', 'k 是最后一次合并的位置。两半都更短，所以已经算好。']],
  ],
  input: ['n, then the n pile sizes. Prints the minimum total cost of merging adjacent piles into one.', 'n，随后 n 堆石子的数量。输出把相邻石子堆合并成一堆的最小总代价。'],
  sizes: [4, 5, 6], lab: [10, 50, 100, 200, 300],
  gen: (n, r) => `${n}\n${r.ints(n, 1, 9).join(' ')}\n`,
  run(inp, t) {
    const rd = reader(inp), n = rd.int(), a = [0, ...rd.ints(n)], s = [0]
    need(n >= 1 && n <= 400, 'n must be between 1 and 400.', 'n 须在 1 到 400 之间。')
    for (let i = 1; i <= n; i++) s.push(s[i - 1] + a[i])
    const f = Array.from({ length: n + 2 }, () => new Float64Array(n + 2)), hd = span(1, n)
    const view = (len: number, l: number, tone: Record<string, Tone>) => grid('f[l][r]', hd.map(i => hd.map(j => (j < i ? '' : j - i + 1 < len || (j - i + 1 === len && i <= l) ? inf(f[i][j]) : '·'))), tone, { rows: hd.map(i => 'l=' + i), cols: hd.map(i => 'r=' + i) })
    for (let len = 2; len <= n; len++) for (let l = 1; l + len - 1 <= n; l++) {
      const r = l + len - 1, sum = s[r] - s[l - 1]
      f[l][r] = INF
      t.s('range', () => [[`Interval [${l}, ${r}] (length ${len}); merging it last costs sum = ${sum}.`, `区间 [${l}, ${r}]（长度 ${len}）；最后一次合并的代价是 sum = ${sum}。`], arr('piles', a, tn({ dim: 0, act: span(l, r) })), view(len, l, gt({ act: [[l - 1, r - 1]] }))])
      for (let k = l; k < r; k++) {
        const c = f[l][k] + f[k + 1][r] + sum, better = c < f[l][r]
        if (better) f[l][r] = c
        t.s('split', () => [[`Split at k = ${k}: f[${l}][${k}] + f[${k + 1}][${r}] + ${sum} = ${f[l][k]} + ${f[k + 1][r]} + ${sum} = ${c}${better ? ' — best so far.' : '.'}`, `在 k = ${k} 处分开：f[${l}][${k}] + f[${k + 1}][${r}] + ${sum} = ${f[l][k]} + ${f[k + 1][r]} + ${sum} = ${c}${better ? '——目前最优。' : '。'}`],
          arr('piles', a, tn({ dim: 0, cmp: span(l, k), alt: span(k + 1, r) })), view(len, l, gt({ cmp: [[l - 1, k - 1]], alt: [[k, r - 1]], act: [[l - 1, r - 1]] }))])
      }
    }
    t.s('done', () => [[`Minimum total cost: ${f[1][n]}.`, `最小总代价：${f[1][n]}。`], arr('piles', a, tn({ dim: 0 })), view(n + 1, n, gt({ ok: [[0, n - 1]] })), vars({ answer: f[1][n] })])
    t.out(f[1][n])
  },
}

const lcs: Lesson = {
  id: 'lcs', title: ['Longest common subsequence', '最长公共子序列'], level: 'S', cat: 'dp', diff: 6,
  needs: ['lis'],
  blurb: ['A two-dimensional DP over prefixes: match the last characters if they agree, otherwise drop one of them.', '在两个前缀上做二维 DP：末尾字符相同就配对，否则丢掉其中一个。'],
  ideas: [
    ['State: f[i][j] = LCS length of the first i characters of a and the first j of b.', '状态：f[i][j] = a 的前 i 个字符与 b 的前 j 个字符的 LCS 长度。'],
    ['If a[i] = b[j], pairing them is always optimal: f[i][j] = f[i−1][j−1] + 1.', '若 a[i] = b[j]，把它们配对总是最优的：f[i][j] = f[i−1][j−1] + 1。'],
    ['Otherwise at least one of the two is unused: f[i][j] = max(f[i−1][j], f[i][j−1]).', '否则两者至少有一个用不上：f[i][j] = max(f[i−1][j], f[i][j−1])。'],
    ['Row 0 and column 0 are zero — an empty prefix has nothing in common with anything.', '第 0 行和第 0 列为 0——空前缀与任何串都没有公共部分。'],
    ['Each cell depends only on its upper, left and upper-left neighbours, so fill row by row.', '每个格子只依赖上方、左方和左上方的格子，所以逐行填表。'],
  ],
  time: 'O(n · m)', space: 'O(n · m)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

char a[2005], b[2005];
int f[2005][2005];

int main() {
    scanf("%s%s", a + 1, b + 1);
    int n = strlen(a + 1), m = strlen(b + 1);
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= m; j++) {
            if (a[i] == b[j]) f[i][j] = f[i - 1][j - 1] + 1;  //@match
            else f[i][j] = max(f[i - 1][j], f[i][j - 1]);  //@skip
        }
    printf("%d\n", f[n][m]);  //@done
}`,
  notes: [
    ['match', ['Reading at a + 1 makes the strings 1-based, so row and column 0 are the empty prefixes.', '从 a + 1 开始读入让字符串下标从 1 开始，第 0 行和第 0 列就对应空前缀。']],
    ['skip', ['Drop the last character of a, or the last of b — whichever leaves more.', '丢掉 a 的最后一个字符，或者 b 的最后一个字符——取结果更大的那个。']],
  ],
  input: ['Two strings, one per line. Prints the length of their longest common subsequence. (n is the length of each.)', '两个字符串，每行一个。输出它们的最长公共子序列的长度。（n 为每个串的长度。）'],
  sizes: [4, 5, 7], lab: [10, 100, 1000, 2000],
  gen: (n, r) => { const s = () => Array.from({ length: n }, () => r.pick([...'ABCD'])).join(''); return `${s()}\n${s()}\n` },
  run(inp, t) {
    const rd = reader(inp), a = rd.str(), b = rd.str(), n = a.length, m = b.length
    need(n * m <= 3e7, 'The strings are too long for an n × m table.', '字符串太长，放不下 n × m 的表。')
    const f = Array.from({ length: n + 1 }, () => new Int32Array(m + 1))
    const view = (i: number, j: number, tone: Record<string, Tone>) => grid('f[i][j]', f.map((row, x) => Array.from(row, (v, y) => (x < i || (x === i && y <= j) || x === 0 || y === 0 ? v : ''))), tone, { rows: ['∅', ...a], cols: ['∅', ...b] })
    for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) {
      if (a[i - 1] === b[j - 1]) {
        f[i][j] = f[i - 1][j - 1] + 1
        t.s('match', () => [[`a[${i}] = b[${j}] = '${a[i - 1]}': f[${i}][${j}] = f[${i - 1}][${j - 1}] + 1 = ${f[i][j]}.`, `a[${i}] = b[${j}] = '${a[i - 1]}'：f[${i}][${j}] = f[${i - 1}][${j - 1}] + 1 = ${f[i][j]}。`], view(i, j, gt({ cmp: [[i - 1, j - 1]], ok: [[i, j]] }))])
      } else {
        f[i][j] = Math.max(f[i - 1][j], f[i][j - 1])
        t.s('skip', () => [[`'${a[i - 1]}' ≠ '${b[j - 1]}': f[${i}][${j}] = max(${f[i - 1][j]}, ${f[i][j - 1]}) = ${f[i][j]}.`, `'${a[i - 1]}' ≠ '${b[j - 1]}'：f[${i}][${j}] = max(${f[i - 1][j]}, ${f[i][j - 1]}) = ${f[i][j]}。`], view(i, j, gt({ cmp: [[i - 1, j], [i, j - 1]], act: [[i, j]] }))])
      }
    }
    t.s('done', () => {
      // Walk back from the corner to recover one common subsequence.
      const cells: [number, number][] = [], pick: string[] = []
      for (let i = n, j = m; i > 0 && j > 0;) {
        if (a[i - 1] === b[j - 1]) { cells.push([i, j]); pick.push(a[i - 1]); i--; j-- } else if (f[i - 1][j] >= f[i][j - 1]) i--; else j--
      }
      return [[`LCS length ${f[n][m]}${pick.length ? `, e.g. "${pick.reverse().join('')}"` : ''}.`, `LCS 长度为 ${f[n][m]}${pick.length ? `，例如 "${pick.join('')}"` : ''}。`], view(n, m, gt({ ok: cells })), vars({ answer: f[n][m] })]
    })
    t.out(f[n][m])
  },
}

const treeDp: Lesson = {
  id: 'tree-dp', title: ['Tree DP: maximum independent set', '树形 DP：没有上司的舞会'], level: 'S', cat: 'dp', diff: 6,
  needs: ['graph-dfs'],
  blurb: ['Pick vertices of maximum total weight with no two adjacent. Each subtree reports two numbers: its best with and without its root.', '选出总权值最大的一组互不相邻的顶点。每棵子树向上汇报两个数：选根和不选根时的最优值。'],
  ideas: [
    ['On a tree, a subtree interacts with the rest only through its root — so the root\'s choice is the state.', '在树上，子树只通过它的根与外界发生关系——所以根的选择就是状态。'],
    ['f[u][1] = best for u\'s subtree with u chosen; f[u][0] = best with u not chosen.', 'f[u][1] = 选 u 时子树的最优值；f[u][0] = 不选 u 时子树的最优值。'],
    ['If u is chosen, no child may be: f[u][1] = w[u] + Σ f[v][0].', '选了 u，孩子就都不能选：f[u][1] = w[u] + Σ f[v][0]。'],
    ['If u is not chosen, each child is free: f[u][0] = Σ max(f[v][0], f[v][1]).', '不选 u，每个孩子可以自由决定：f[u][0] = Σ max(f[v][0], f[v][1])。'],
    ['Compute children before parents — a post-order DFS does exactly that.', '先算孩子再算父亲——后序 DFS 正好如此。'],
  ],
  time: 'O(n)', space: 'O(n)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, w[300005];
long long f[300005][2];
vector<int> g[300005];

void dfs(int u, int p) {
    f[u][1] = w[u];  //@init
    for (int v : g[u]) {
        if (v == p) continue;
        dfs(v, u);
        f[u][0] += max(f[v][0], f[v][1]);
        f[u][1] += f[v][0];  //@child
    }
}

int main() {
    scanf("%d", &n);
    for (int i = 1; i <= n; i++) scanf("%d", &w[i]);
    for (int i = 1; i < n; i++) {
        int u, v; scanf("%d%d", &u, &v);
        g[u].push_back(v); g[v].push_back(u);
    }
    dfs(1, 0);
    printf("%lld\n", max(f[1][0], f[1][1]));  //@done
}`,
  notes: [
    ['init', ['Choosing u earns its own weight; not choosing it starts from 0.', '选 u 先得到它自己的权值；不选则从 0 开始。']],
    ['child', ['Both lines use the child\'s finished values — the recursion has already returned.', '这两行用的都是孩子已经算好的值——递归已经返回。']],
  ],
  input: ['n, the n weights, then n − 1 tree edges "u v". Prints the maximum total weight of pairwise non-adjacent vertices.', 'n，n 个权值，随后 n − 1 条树边 “u v”。输出互不相邻的顶点的最大权值和。'],
  sizes: [6, 8, 11], lab: [10, 1000, 100000, 300000],
  gen: (n, r) => `${n}\n${r.ints(n, 1, 9).join(' ')}\n` + genTree(n, r).map(([u, v]) => `${u + 1} ${v + 1}`).join('\n') + '\n',
  run(inp, t) {
    const rd = reader(inp), n = rd.int(), w = rd.ints(n), es: E[] = []
    for (let i = 0; i < n - 1; i++) { const u = rd.int() - 1, v = rd.int() - 1; need(u >= 0 && u < n && v >= 0 && v < n, 'Vertex out of range.', '顶点编号越界。'); es.push([u, v, 1]) }
    const par = parentsOf(n, es, 0), g = adjOf(n, es)
    need(par.every(p => p !== -2), 'The edges must form a tree.', '这些边必须构成一棵树。')
    const pos = t.on ? layoutTree(n, es, 0) : [], ed = toEdges(es), f0 = new Array<number>(n).fill(0), f1 = new Array<number>(n).fill(0), ready = new Uint8Array(n), order = [0]
    for (let h = 0; h < order.length; h++) for (const [v] of g[order[h]]) if (v !== par[order[h]]) order.push(v)
    const view = (tone: Tones) => graph(pos, ed, { label: w, tone, sub: f0.map((x, i) => (ready[i] ? `${x}/${f1[i]}` : undefined)), name: 'node = weight; caption = f[u][0] / f[u][1]' })
    // Reverse BFS order visits every child before its parent, like the post-order DFS in the code.
    for (let k = n - 1; k >= 0; k--) {
      const u = order[k]
      f1[u] = w[u]; ready[u] = 1
      t.s('init', () => [[`Vertex ${u + 1}: f[${u + 1}][1] starts at its weight ${w[u]}, f[${u + 1}][0] at 0.`, `顶点 ${u + 1}：f[${u + 1}][1] 初值为权值 ${w[u]}，f[${u + 1}][0] 初值为 0。`], view(tn({ act: u }))])
      for (const [v] of g[u]) if (v !== par[u]) {
        f0[u] += Math.max(f0[v], f1[v]); f1[u] += f0[v]
        t.s('child', () => [[`Child ${v + 1} (${f0[v]}/${f1[v]}): f[${u + 1}][0] += max = ${Math.max(f0[v], f1[v])}; f[${u + 1}][1] += f[${v + 1}][0] = ${f0[v]}.`, `孩子 ${v + 1}（${f0[v]}/${f1[v]}）：f[${u + 1}][0] += max = ${Math.max(f0[v], f1[v])}；f[${u + 1}][1] += f[${v + 1}][0] = ${f0[v]}。`], view(tn({ act: u, cmp: v }))])
      }
    }
    const ans = Math.max(f0[0], f1[0])
    t.s('done', () => {
      const pick: number[] = [], st: [number, boolean][] = [[0, f1[0] > f0[0]]]
      while (st.length) { const [u, take] = st.pop()!; if (take) pick.push(u); for (const [v] of g[u]) if (v !== par[u]) st.push([v, !take && f1[v] > f0[v]]) }
      return [[`Answer max(${f0[0]}, ${f1[0]}) = ${ans}; one optimal choice is highlighted.`, `答案 max(${f0[0]}, ${f1[0]}) = ${ans}；图中标出了一种最优选法。`], view(tn({ ok: pick })), vars({ answer: ans })]
    })
    t.out(ans)
  },
}

const bitmask: Lesson = {
  id: 'bitmask-dp', title: ['Bitmask DP: travelling salesman', '状态压缩 DP：旅行商问题'], level: 'S', cat: 'dp', diff: 7,
  blurb: ['Encode the set of visited cities in the bits of one integer, and let that integer be part of the DP state.', '用一个整数的二进制位表示已访问城市的集合，并把这个整数作为 DP 状态的一部分。'],
  ideas: [
    ['Trying all n! orders is hopeless; but the future only depends on which cities were visited and where you are now.', '枚举全部 n! 种顺序不可行；但未来只取决于“访问过哪些城市”和“现在在哪里”。'],
    ['State: f[S][i] = shortest route that starts at city 0, visits exactly the set S, and ends at i.', '状态：f[S][i] = 从城市 0 出发、恰好访问过集合 S、当前位于 i 的最短路线。'],
    ['S is a bitmask: bit k is 1 when city k has been visited. S | (1 << j) adds j; (S >> j) & 1 tests it.', 'S 是位掩码：第 k 位为 1 表示城市 k 已访问。S | (1 << j) 加入 j；(S >> j) & 1 判断 j 是否在其中。'],
    ['Transition: from (S, i) go to an unvisited j: f[S | 1<<j][j] = min(…, f[S][i] + d[i][j]).', '转移：从 (S, i) 走到未访问的 j：f[S | 1<<j][j] = min(…, f[S][i] + d[i][j])。'],
    ['Adding a city makes S larger, so increasing order of S is a valid order of computation.', '加入城市会让 S 变大，所以按 S 从小到大就是合法的计算顺序。'],
  ],
  time: 'O(2ⁿ · n²)', space: 'O(2ⁿ · n)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, d[20][20], f[1 << 17][17];

int main() {
    scanf("%d", &n);
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++) scanf("%d", &d[i][j]);
    memset(f, 0x3f, sizeof f);
    f[1][0] = 0;  //@init
    for (int S = 1; S < (1 << n); S++)
        for (int i = 0; i < n; i++) {
            if (!((S >> i) & 1) || f[S][i] > 1e9) continue;
            for (int j = 0; j < n; j++) {
                if ((S >> j) & 1) continue;
                int T = S | (1 << j);
                f[T][j] = min(f[T][j], f[S][i] + d[i][j]);  //@go
            }
        }
    int ans = 1e9;
    for (int i = 0; i < n; i++) ans = min(ans, f[(1 << n) - 1][i] + d[i][0]);  //@close
    printf("%d\n", ans);
}`,
  notes: [
    ['init', ['Only city 0 visited (mask 1), standing at city 0, distance 0.', '只访问过城市 0（掩码为 1），位于城市 0，距离为 0。']],
    ['go', ['"Push" style: a finished state updates the states it leads to.', '“刷表”写法：用已经确定的状态去更新它能到达的状态。']],
    ['close', ['All cities visited; add the edge back to city 0 to close the tour.', '所有城市都已访问；加上回到城市 0 的那条边，形成回路。']],
  ],
  input: ['n, then the n × n distance matrix. Prints the length of the shortest tour that starts at city 0, visits every city once and returns.', 'n，随后是 n × n 的距离矩阵。输出从城市 0 出发、经过每个城市恰好一次并回到起点的最短回路长度。'],
  sizes: [3, 4, 5], lab: [4, 8, 12, 14, 16],
  gen(n, r) {
    const d = Array.from({ length: n }, () => new Array<number>(n).fill(0))
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) d[i][j] = d[j][i] = r.int(1, 9)
    return `${n}\n${d.map(x => x.join(' ')).join('\n')}\n`
  },
  run(inp, t) {
    const rd = reader(inp), n = rd.int()
    need(n >= 1 && n <= 17, 'n must be between 1 and 17.', 'n 须在 1 到 17 之间。')
    const d = Array.from({ length: n }, () => rd.ints(n)), full = (1 << n) - 1, f = new Int32Array((full + 1) * n).fill(INF)
    const bin = (S: number) => S.toString(2).padStart(n, '0')
    // Only masks containing city 0 are reachable; show just those rows.
    const rows = span(1, full).filter(S => S & 1)
    const view = (tone: Record<string, Tone>) => grid('f[S][i] — S in binary, city 0 is the rightmost bit', rows.map(S => span(0, n - 1).map(i => inf(f[S * n + i]))), tone, { rows: rows.map(bin), cols: span(0, n - 1).map(i => 'i=' + i) })
    const at = (S: number, i: number): [number, number] => [rows.indexOf(S), i]
    f[1 * n] = 0
    t.s('init', () => [['Start: only city 0 visited, standing at city 0.', '起点：只访问过城市 0，位于城市 0。'], view(gt({ ok: [at(1, 0)] }))])
    for (let S = 1; S <= full; S++) for (let i = 0; i < n; i++) {
      if (!((S >> i) & 1) || f[S * n + i] >= INF) continue
      for (let j = 0; j < n; j++) {
        if ((S >> j) & 1) continue
        const T = S | (1 << j), c = f[S * n + i] + d[i][j], better = c < f[T * n + j]
        if (better) f[T * n + j] = c
        t.s('go', () => [[`From S = ${bin(S)} at city ${i}, go to city ${j}: ${f[S * n + i]} + ${d[i][j]} = ${c}${better ? ' — improves' : ' — no better than'} f[${bin(T)}][${j}].`, `从 S = ${bin(S)}、位于城市 ${i}，走到城市 ${j}：${f[S * n + i]} + ${d[i][j]} = ${c}${better ? '——更新' : '——不优于'} f[${bin(T)}][${j}]。`], view(gt({ cmp: [at(S, i)], [better ? 'act' : 'vis']: [at(T, j)] }))])
      }
    }
    let ans = INF, last = 0
    for (let i = 0; i < n; i++) if (f[full * n + i] + d[i][0] < ans) { ans = f[full * n + i] + d[i][0]; last = i }
    t.s('close', () => [[`All cities visited. Best closing edge is from city ${last}: ${f[full * n + last]} + ${d[last][0]} = ${ans}.`, `所有城市都已访问。最优的收尾是从城市 ${last} 返回：${f[full * n + last]} + ${d[last][0]} = ${ans}。`], view(gt({ cmp: span(0, n - 1).map(i => at(full, i)), ok: [at(full, last)] })), vars({ answer: ans })])
    t.out(ans)
  },
}

export default [lis, knapsack, interval, lcs, treeDp, bitmask]
