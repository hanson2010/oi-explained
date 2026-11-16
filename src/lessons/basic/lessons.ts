import { Lesson } from '../../engine/types'
import { arr, grid, gt, need, reader, span, tn, vars } from '../../engine/h'

const cpp = String.raw

const binarySearch: Lesson = {
  id: 'binary-search', title: ['Binary search', '二分查找'], level: 'J', cat: 'basic', diff: 4,
  blurb: ['Halve a sorted range until the first element ≥ x is cornered.', '在有序序列中不断折半，找到第一个 ≥ x 的位置。'],
  ideas: [
    ['Keep an interval [l, r] that is guaranteed to contain the answer.', '维护一个一定包含答案的区间 [l, r]。'],
    ['Look at the middle: if a[mid] ≥ x the answer is mid or to its left, otherwise strictly to its right.', '看中点：若 a[mid] ≥ x，答案在 mid 或其左侧；否则一定在右侧。'],
    ['Each probe discards half of the candidates, so about log₂ n probes suffice.', '每次比较排除一半候选，只需约 log₂ n 次。'],
    ['The same template solves "binary search on the answer" whenever the predicate is monotone.', '只要判定条件具有单调性，同一模板就能用于“二分答案”。'],
  ],
  time: 'O(log n)', space: 'O(1)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, x, a[1000005];

int main() {
    scanf("%d%d", &n, &x);
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    int l = 0, r = n;  //@init
    while (l < r) {  //@loop
        int mid = (l + r) / 2;  //@mid
        if (a[mid] >= x) r = mid;  //@left
        else l = mid + 1;  //@right
    }
    printf("%d\n", l + 1);  //@done
}`,
  notes: [
    ['init', ['r starts at n, one past the end: "no element is ≥ x" is a legal answer.', 'r 初值取 n（越过末尾一位）：“不存在 ≥ x 的元素”也是合法答案。']],
    ['mid', ['Rounding down keeps mid < r, so the interval always shrinks.', '向下取整保证 mid < r，区间必然缩小。']],
    ['left', ['a[mid] qualifies, so keep it: r = mid, not mid − 1.', 'a[mid] 满足条件，必须保留：r = mid 而不是 mid − 1。']],
    ['right', ['a[mid] is too small, so drop it together with everything on its left.', 'a[mid] 太小，连同左侧一起丢弃。']],
  ],
  input: ['n x, then n integers in non-decreasing order. Prints the 1-based position of the first element ≥ x (n + 1 if none).', 'n x，随后是 n 个不降的整数。输出第一个 ≥ x 的元素的位置（从 1 开始；不存在则输出 n + 1）。'],
  sizes: [8, 14, 24], lab: [10, 1000, 100000, 1000000],
  gen(n, r) {
    const a = r.ints(n, 1, n * 3).sort((p, q) => p - q)
    return `${n} ${r.next() < 0.85 ? r.pick(a) + r.int(-1, 1) : n * 3 + 1}\n${a.join(' ')}\n`
  },
  run(inp, t) {
    const rd = reader(inp), n = rd.int(), x = rd.int(), a = rd.ints(n)
    for (let i = 1; i < n; i++) need(a[i - 1] <= a[i], 'The array must be sorted.', '数组必须有序。')
    let l = 0, r = n
    const view = (mid?: number) => {
      const tone = tn({ dim: [...span(0, l - 1), ...span(r + 1, n - 1)] })
      if (mid !== undefined) tone[mid] = 'act'
      return arr('a', a, tone, mid === undefined ? { l, r } : { l, r, mid })
    }
    t.s('init', () => [[`The answer is somewhere in [${l}, ${r}].`, `答案位于 [${l}, ${r}] 之中。`], view(), vars({ x })])
    while (l < r) {
      const mid = (l + r) >> 1
      t.s('mid', () => [[`Probe the middle: a[${mid}] = ${a[mid]}.`, `查看中点：a[${mid}] = ${a[mid]}。`], view(mid), vars({ x })])
      t.ask(() => [[`a[${mid}] = ${a[mid]} and x = ${x}. Where can the answer still be?`, `a[${mid}] = ${a[mid]}，x = ${x}。答案还可能在哪里？`], [['at mid or to its left', '在 mid 或它的左边'], ['to the right of mid', '在 mid 的右边']], a[mid] >= x ? 0 : 1])
      if (a[mid] >= x) {
        r = mid
        t.s('left', () => [[`${a[mid]} ≥ ${x}: the answer is at ${mid} or further left, so r = ${mid}.`, `${a[mid]} ≥ ${x}：答案在 ${mid} 或更左，令 r = ${mid}。`], view(), vars({ x })])
      } else {
        l = mid + 1
        t.s('right', () => [[`${a[mid]} < ${x}: everything up to ${mid} is too small, so l = ${mid + 1}.`, `${a[mid]} < ${x}：${mid} 及左侧都太小，令 l = ${mid + 1}。`], view(), vars({ x })])
      }
    }
    t.s('done', () => [
      l < n ? [`l = r = ${l}: a[${l}] = ${a[l]} is the first element ≥ ${x}.`, `l = r = ${l}：a[${l}] = ${a[l]} 是第一个 ≥ ${x} 的元素。`]
        : [`l = r = n: no element is ≥ ${x}.`, `l = r = n：不存在 ≥ ${x} 的元素。`],
      arr('a', a, l < n ? tn({ ok: l }) : tn({ dim: span(0, n - 1) })), vars({ x, answer: l + 1 })])
    t.out(l + 1)
  },
}

const prefixSum: Lesson = {
  id: 'prefix-sum', title: ['Prefix sums', '前缀和'], level: 'J', cat: 'basic', diff: 3,
  blurb: ['Precompute running totals once; answer any range-sum query with one subtraction.', '预处理一次累加和，之后每个区间和查询只需一次减法。'],
  ideas: [
    ['s[i] = a[1] + … + a[i], built left to right with s[i] = s[i−1] + a[i].', 's[i] = a[1] + … + a[i]，由 s[i] = s[i−1] + a[i] 从左到右递推。'],
    ['sum(l..r) = s[r] − s[l−1]: the two prefixes share everything before l, which cancels.', 'sum(l..r) = s[r] − s[l−1]：两个前缀在 l 之前的部分互相抵消。'],
    ['Use 1-based indices with s[0] = 0 so l = 1 needs no special case.', '下标从 1 开始并令 s[0] = 0，l = 1 时无需特判。'],
  ],
  time: 'O(n + q)', space: 'O(n)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, q;
long long s[1000005];

int main() {
    scanf("%d%d", &n, &q);
    for (int i = 1; i <= n; i++) {
        int x; scanf("%d", &x);
        s[i] = s[i - 1] + x;  //@build
    }
    while (q--) {
        int l, r; scanf("%d%d", &l, &r);
        printf("%lld\n", s[r] - s[l - 1]);  //@query
    }
}`,
  notes: [
    ['build', ['Each prefix reuses the previous one, so the whole table costs O(n).', '每个前缀都复用前一个，整张表只需 O(n)。']],
    ['query', ['O(1) per query, however long the range is. Sums can exceed int, hence long long.', '无论区间多长，查询都是 O(1)。和可能超过 int，所以用 long long。']],
  ],
  input: ['n q, the n numbers, then q lines "l r" (1-based, inclusive).', 'n q，n 个数，随后 q 行 “l r”（从 1 开始，闭区间）。'],
  sizes: [6, 10, 16], lab: [10, 1000, 100000, 500000],
  gen(n, r) {
    const q = n <= 30 ? 3 : n
    let s = `${n} ${q}\n${r.ints(n, 1, 9).join(' ')}\n`
    for (let i = 0; i < q; i++) { const l = r.int(1, n), h = r.int(l, n); s += `${l} ${h}\n` }
    return s
  },
  run(inp, t) {
    const rd = reader(inp), n = rd.int(), q = rd.int(), a = [0, ...rd.ints(n)], s = new Array<number>(n + 1).fill(0), out: number[] = []
    for (let i = 1; i <= n; i++) {
      s[i] = s[i - 1] + a[i]
      t.s('build', () => [[`s[${i}] = s[${i - 1}] + a[${i}] = ${s[i - 1]} + ${a[i]} = ${s[i]}`, `s[${i}] = s[${i - 1}] + a[${i}] = ${s[i - 1]} + ${a[i]} = ${s[i]}`],
        arr('a', a, tn({ act: i, dim: 0 })), arr('s', s, tn({ ok: i, cmp: i - 1, dim: span(i + 1, n) }))])
    }
    for (let k = 0; k < q; k++) {
      const l = rd.int(), r = rd.int()
      need(1 <= l && l <= r && r <= n, 'Queries need 1 ≤ l ≤ r ≤ n.', '查询须满足 1 ≤ l ≤ r ≤ n。')
      t.ask(() => {
        const idx = [...new Set([l - 1, l, r - 1])].sort((p, q) => p - q)
        return [[`The sum of a[${l}..${r}] is s[${r}] minus which entry?`, `a[${l}..${r}] 的和等于 s[${r}] 减去哪一项？`], idx.map(k => [`s[${k}]`, `s[${k}]`] as const), idx.indexOf(l - 1)]
      })
      out.push(s[r] - s[l - 1])
      t.s('query', () => [[`sum(${l}..${r}) = s[${r}] − s[${l - 1}] = ${s[r]} − ${s[l - 1]} = ${s[r] - s[l - 1]}`, `sum(${l}..${r}) = s[${r}] − s[${l - 1}] = ${s[r]} − ${s[l - 1]} = ${s[r] - s[l - 1]}`],
        arr('a', a, tn({ dim: 0, ok: span(l, r) })), arr('s', s, tn({ act: r, bad: l - 1 }), { r, 'l-1': l - 1 }), vars({ l, r, sum: s[r] - s[l - 1] })])
    }
    t.out(out.join('\n'))
  },
}

const difference: Lesson = {
  id: 'difference', title: ['Difference array', '差分'], level: 'J', cat: 'basic', diff: 4,
  needs: ['prefix-sum'],
  blurb: ['Turn "add v to a whole range" into two point updates, then rebuild with a prefix sum.', '把“区间整体加 v”变成两次单点修改，最后用前缀和还原。'],
  ideas: [
    ['Store d[i] = a[i] − a[i−1]; the prefix sum of d gives a back.', '保存 d[i] = a[i] − a[i−1]；对 d 求前缀和就得到 a。'],
    ['Adding v to a[l..r] only changes two differences: d[l] += v and d[r+1] −= v.', '给 a[l..r] 加 v 只改变两个差分：d[l] += v，d[r+1] −= v。'],
    ['Difference and prefix sum are inverse operations — a pattern that reappears on trees and grids.', '差分与前缀和互为逆运算——这个思想在树上、二维上都会再次出现。'],
  ],
  time: 'O(n + q)', space: 'O(n)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, q;
long long a[1000005], d[1000005];

int main() {
    scanf("%d%d", &n, &q);
    for (int i = 1; i <= n; i++) {
        scanf("%lld", &a[i]);
        d[i] = a[i] - a[i - 1];  //@build
    }
    while (q--) {
        int l, r, v; scanf("%d%d%d", &l, &r, &v);
        d[l] += v;  //@addl
        d[r + 1] -= v;  //@addr
    }
    for (int i = 1; i <= n; i++) {
        a[i] = a[i - 1] + d[i];  //@restore
        printf("%lld ", a[i]);
    }
}`,
  notes: [
    ['build', ['d records how much each element differs from its left neighbour.', 'd 记录每个元素与左邻居的差。']],
    ['addl', ['From l onward every restored value rises by v.', '从 l 开始，还原出的每个值都会增加 v。']],
    ['addr', ['Cancel the rise right after r. d needs one spare cell at n + 1.', '在 r 之后把增量抵消。d 要多开一格到 n + 1。']],
    ['restore', ['One prefix-sum pass applies all q updates at once.', '一遍前缀和就同时应用了全部 q 次修改。']],
  ],
  input: ['n q, the n numbers, then q lines "l r v": add v to a[l..r]. Prints the final array.', 'n q，n 个数，随后 q 行 “l r v”：给 a[l..r] 加 v。输出最终数组。'],
  sizes: [6, 10, 16], lab: [10, 1000, 100000, 500000],
  gen(n, r) {
    const q = n <= 30 ? 3 : n
    let s = `${n} ${q}\n${r.ints(n, 1, 9).join(' ')}\n`
    for (let i = 0; i < q; i++) { const l = r.int(1, n), h = r.int(l, n); s += `${l} ${h} ${r.int(1, 5)}\n` }
    return s
  },
  run(inp, t) {
    const rd = reader(inp), n = rd.int(), q = rd.int(), a = [0, ...rd.ints(n)], d = new Array<number>(n + 2).fill(0)
    for (let i = 1; i <= n; i++) {
      d[i] = a[i] - a[i - 1]
      t.s('build', () => [[`d[${i}] = a[${i}] − a[${i - 1}] = ${d[i]}`, `d[${i}] = a[${i}] − a[${i - 1}] = ${d[i]}`],
        arr('a', a, tn({ act: i, cmp: i - 1 })), arr('d', d, tn({ ok: i, dim: span(i + 1, n + 1) }))])
    }
    for (let k = 0; k < q; k++) {
      const l = rd.int(), r = rd.int(), v = rd.int()
      need(1 <= l && l <= r && r <= n, 'Updates need 1 ≤ l ≤ r ≤ n.', '修改须满足 1 ≤ l ≤ r ≤ n。')
      d[l] += v
      t.s('addl', () => [[`Add ${v} to [${l}, ${r}]: first d[${l}] += ${v}.`, `区间 [${l}, ${r}] 加 ${v}：先令 d[${l}] += ${v}。`],
        arr('a (before updates)', a, tn({ vis: span(l, r) })), arr('d', d, tn({ act: l }), { l }), vars({ l, r, v })])
      d[r + 1] -= v
      t.s('addr', () => [[`Then d[${r + 1}] −= ${v} so the increase stops after ${r}.`, `再令 d[${r + 1}] −= ${v}，使增量在 ${r} 之后停止。`],
        arr('a (before updates)', a, tn({ vis: span(l, r) })), arr('d', d, tn({ ok: l, act: r + 1 }), { l, 'r+1': r + 1 }), vars({ l, r, v })])
    }
    for (let i = 1; i <= n; i++) {
      a[i] = a[i - 1] + d[i]
      t.s('restore', () => [[`a[${i}] = a[${i - 1}] + d[${i}] = ${a[i]}`, `a[${i}] = a[${i - 1}] + d[${i}] = ${a[i]}`],
        arr('a', a, tn({ ok: span(1, i), dim: span(i + 1, n) })), arr('d', d, tn({ act: i }))])
    }
    t.out(a.slice(1).join(' '))
  },
}

const fastPow: Lesson = {
  id: 'fast-pow', title: ['Fast exponentiation', '快速幂（倍增）'], level: 'J', cat: 'basic', diff: 4,
  blurb: ['Compute aᵇ mod m by squaring: one step per binary digit of b.', '用反复平方计算 aᵇ mod m：b 的每个二进制位只需一步。'],
  ideas: [
    ['Doubling: from a¹ get a², a⁴, a⁸, … by squaring — k squarings reach an exponent of 2ᵏ.', '倍增：由 a¹ 平方得到 a²、a⁴、a⁸……k 次平方就到达指数 2ᵏ。'],
    ['Write b in binary; aᵇ is the product of the a^(2ᵏ) whose bit k is 1.', '把 b 写成二进制，aᵇ 等于所有为 1 的位对应的 a^(2ᵏ) 之积。'],
    ['Reduce mod m after every multiplication to keep numbers small.', '每次乘法后都取模，避免数值溢出。'],
    ['The same doubling idea powers sparse tables and binary-lifting LCA.', '同样的倍增思想也用于 ST 表和倍增求 LCA。'],
  ],
  time: 'O(log b)', space: 'O(1)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int main() {
    long long a, b, m;
    scanf("%lld%lld%lld", &a, &b, &m);
    long long res = 1 % m;  //@init
    a %= m;
    while (b > 0) {
        if (b & 1) res = res * a % m;  //@mul
        a = a * a % m;  //@sq
        b >>= 1;
    }
    printf("%lld\n", res);  //@done
}`,
  notes: [
    ['init', ['1 % m handles the corner case m = 1.', '1 % m 处理了 m = 1 的特殊情况。']],
    ['mul', ['The lowest bit of b is 1, so this power of a belongs in the answer.', 'b 的最低位为 1，当前这一项 a 的幂要乘进答案。']],
    ['sq', ['Squaring moves a from a^(2ᵏ) to a^(2ᵏ⁺¹). With m < 2³¹ the product fits in long long.', '平方把 a 从 a^(2ᵏ) 变成 a^(2ᵏ⁺¹)。m < 2³¹ 时乘积不会超出 long long。']],
  ],
  input: ['a b m — prints aᵇ mod m. (In the generator, n is the number of bits of b.)', 'a b m —— 输出 aᵇ mod m。（生成器中 n 表示 b 的二进制位数。）'],
  sizes: [4, 8, 16], lab: [4, 8, 16, 32, 50],
  gen(n, r) {
    let b = 1n
    for (let i = 1; i < n; i++) b = b * 2n + BigInt(r.int(0, 1))
    return `${r.int(2, 9)} ${b} ${n <= 20 ? 1000 : 1000000007}\n`
  },
  run(inp, t) {
    const tk = inp.split(/\s+/).filter(Boolean)
    need(tk.length >= 3 && tk.slice(0, 3).every(s => /^\d+$/.test(s)), 'Expected three non-negative integers.', '需要三个非负整数。')
    let a = BigInt(tk[0]), b = BigInt(tk[1])
    const m = BigInt(tk[2])
    need(m > 0n, 'm must be positive.', 'm 必须为正。')
    const bits = b.toString(2).split('').map(Number), n = bits.length
    let res = 1n % m, k = 0
    a %= m
    const view = (tone: 'act' | 'cmp') => arr('b in binary (bit k is at the right end)', bits, tn({ dim: span(n - k, n - 1), [tone]: n - 1 - k }), undefined, { base: 0 })
    t.s('init', () => [[`Start with res = ${res}; scan the bits of b from the lowest.`, `初始 res = ${res}；从最低位开始扫描 b 的二进制位。`], view('cmp'), vars({ a: String(a), res: String(res) })])
    while (b > 0n) {
      if (b & 1n) {
        const old = res
        res = (res * a) % m
        t.s('mul', () => [[`Bit ${k} is 1: res = ${old} × ${a} mod ${m} = ${res}.`, `第 ${k} 位是 1：res = ${old} × ${a} mod ${m} = ${res}。`], view('act'), vars({ 'a^(2^k)': String(a), res: String(res), k })])
      }
      const old = a
      a = (a * a) % m
      t.s('sq', () => [[`Square: a = ${old}² mod ${m} = ${a}, ready for bit ${k + 1}.`, `平方：a = ${old}² mod ${m} = ${a}，为第 ${k + 1} 位做准备。`], view('cmp'), vars({ 'a^(2^k)': String(a), res: String(res), k: k + 1 })])
      b >>= 1n; k++
    }
    t.s('done', () => [[`All bits used: the answer is ${res}.`, `所有位处理完毕：答案是 ${res}。`], arr('b in binary', bits, tn({ dim: span(0, n - 1) })), vars({ answer: String(res) })])
    t.out(res)
  },
}

const hanoi: Lesson = {
  id: 'hanoi', title: ['Recursion: Tower of Hanoi', '递归：汉诺塔'], level: 'J', cat: 'basic', diff: 4,
  blurb: ['Move n disks by trusting the recursion to move n − 1 of them.', '相信递归能搬动 n − 1 个盘子，从而搬动 n 个盘子。'],
  ideas: [
    ['To move n disks A→C: move the top n − 1 to B, move the largest to C, move the n − 1 from B to C.', '把 n 个盘子从 A 移到 C：先把上面 n − 1 个移到 B，再把最大的移到 C，最后把 n − 1 个从 B 移到 C。'],
    ['A recursive function needs a base case (n = 0: nothing to do) and a step that shrinks the problem.', '递归函数需要边界（n = 0 时什么都不做）和让问题变小的递推步骤。'],
    ['Moves: T(n) = 2·T(n−1) + 1 = 2ⁿ − 1 — exponential, which the data lab makes visible.', '移动次数 T(n) = 2·T(n−1) + 1 = 2ⁿ − 1，是指数级——在数据实验中可以直观看到。'],
  ],
  time: 'O(2ⁿ)', space: 'O(n)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

void hanoi(int n, char from, char via, char to) {
    if (n == 0) return;
    hanoi(n - 1, from, to, via);  //@first
    printf("%c->%c\n", from, to);  //@move
    hanoi(n - 1, via, from, to);  //@second
}

int main() {
    int n; scanf("%d", &n);
    hanoi(n, 'A', 'B', 'C');
}`,
  notes: [
    ['first', ['Clear the way: the n − 1 smaller disks go to the spare peg (roles of via/to swap).', '先让路：把较小的 n − 1 个盘子移到辅助柱（via 与 to 角色互换）。']],
    ['move', ['Now disk n is free and its target is empty of smaller disks.', '此时第 n 个盘子可以移动，目标柱上也没有更小的盘子。']],
    ['second', ['Bring the n − 1 disks back on top of disk n.', '再把 n − 1 个盘子移回到第 n 个盘子上面。']],
  ],
  input: ['n — the number of disks. Prints every move.', 'n —— 盘子数量。输出每一步移动。'],
  sizes: [3, 4, 5], lab: [4, 8, 12, 16, 20],
  gen: n => `${n}\n`,
  run(inp, t) {
    const n = reader(inp).int()
    need(n >= 0 && n <= 24, 'n must be between 0 and 24.', 'n 须在 0 到 24 之间。')
    const peg: Record<string, number[]> = { A: span(1, n).reverse(), B: [], C: [] }, out: string[] = []
    const show = (hi?: string) => ['A', 'B', 'C'].map(p => arr(`peg ${p} (bottom → top)`, peg[p].length ? peg[p] : ['—'], p === hi && peg[p].length ? tn({ ok: peg[p].length - 1 }) : {}))
    t.s('first', () => [[`Goal: move ${n} disks from A to C.`, `目标：把 ${n} 个盘子从 A 移到 C。`], ...show()])
    const go = (k: number, from: string, via: string, to: string) => {
      if (k === 0) return
      go(k - 1, from, to, via)
      peg[to].push(peg[from].pop()!)
      out.push(`${from}->${to}`)
      t.s('move', () => [[`Move disk ${k} from ${from} to ${to} (move #${out.length}).`, `把 ${k} 号盘从 ${from} 移到 ${to}（第 ${out.length} 步）。`], ...show(to), vars({ moves: out.length })])
      go(k - 1, via, from, to)
    }
    go(n, 'A', 'B', 'C')
    t.out(out.join('\n'))
  },
}

const digitsOf = (s: string) => { need(/^\d+$/.test(s), 'Expected a non-negative integer.', '需要非负整数。'); return s.replace(/^0+(?=\d)/, '').split('').reverse().map(Number) }
const rndNum = (n: number, r: { int(a: number, b: number): number }) => String(r.int(1, 9)) + Array.from({ length: n - 1 }, () => r.int(0, 9)).join('')
/** Shows a little-endian digit array with the most significant digit on the left. */
const big = (name: string, d: number[], len: number, hi: Record<number, 'act' | 'ok' | 'cmp'> = {}) => {
  const v: (number | string)[] = [], tone: Record<number, 'act' | 'ok' | 'cmp' | 'dim'> = {}
  for (let p = len - 1; p >= 0; p--) { v.push(p < d.length ? d[p] : ''); if (hi[p]) tone[len - 1 - p] = hi[p] }
  return arr(name, v, tone, undefined, { base: -1 })
}

const bigAdd: Lesson = {
  id: 'bignum-add', title: ['High-precision addition', '高精度加法'], level: 'J', cat: 'basic', diff: 4,
  blurb: ['Add numbers with thousands of digits the way you do on paper: column by column with a carry.', '像列竖式一样逐位相加并进位，处理成千上万位的大整数。'],
  ideas: [
    ['Built-in integers stop at about 19 digits, so store one decimal digit per array cell.', '内置整数最多约 19 位，因此用数组每格存一位十进制数字。'],
    ['Store digits reversed (lowest first) so that position i of both numbers lines up and the result can grow at the end.', '倒序存储（低位在前），两个数的第 i 位自然对齐，结果也能在末尾增长。'],
    ['Per column: sum = a[i] + b[i] + carry; write sum % 10, carry sum / 10.', '每一位：sum = a[i] + b[i] + 进位；写下 sum % 10，进位 sum / 10。'],
  ],
  time: 'O(n)', space: 'O(n)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int main() {
    string s, t;
    cin >> s >> t;
    vector<int> a, b, c;
    for (int i = s.size() - 1; i >= 0; i--) a.push_back(s[i] - '0');  //@rev
    for (int i = t.size() - 1; i >= 0; i--) b.push_back(t[i] - '0');
    int carry = 0;
    for (size_t i = 0; i < max(a.size(), b.size()) || carry; i++) {
        int sum = carry;
        if (i < a.size()) sum += a[i];
        if (i < b.size()) sum += b[i];
        c.push_back(sum % 10);  //@digit
        carry = sum / 10;
    }
    for (int i = c.size() - 1; i >= 0; i--) printf("%d", c[i]);  //@done
}`,
  notes: [
    ['rev', ['Read as strings, then reverse into digit arrays: index 0 is the ones place.', '以字符串读入，再倒序存成数字数组：下标 0 是个位。']],
    ['digit', ['The loop also runs once more while a carry remains — that is how 99 + 1 gains a digit.', '只要还有进位循环就继续——99 + 1 正是这样多出一位的。']],
    ['done', ['Print from the highest index down to restore the usual order.', '从最高下标往回输出，恢复正常书写顺序。']],
  ],
  input: ['Two non-negative integers, one per line. (n is the number of digits.)', '两个非负整数，每行一个。（n 为位数。）'],
  sizes: [4, 8, 14], lab: [10, 1000, 100000, 500000],
  gen: (n, r) => `${rndNum(n, r)}\n${rndNum(Math.max(1, n - r.int(0, Math.min(2, n - 1))), r)}\n`,
  run(inp, t) {
    const rd = reader(inp), a = digitsOf(rd.str()), b = digitsOf(rd.str()), c: number[] = []
    const len = Math.max(a.length, b.length) + 1
    t.s('rev', () => [['Line the numbers up at the ones place (stored low digit first).', '两个数在个位对齐（内部按低位在前存储）。'], big('a', a, len), big('b', b, len), big('c', c, len)])
    let carry = 0
    for (let i = 0; i < Math.max(a.length, b.length) || carry; i++) {
      const sum = carry + (a[i] ?? 0) + (b[i] ?? 0), old = carry
      c.push(sum % 10); carry = Math.floor(sum / 10)
      t.s('digit', () => [[`Column ${i}: ${a[i] ?? 0} + ${b[i] ?? 0} + carry ${old} = ${sum} → write ${sum % 10}, carry ${carry}.`, `第 ${i} 位：${a[i] ?? 0} + ${b[i] ?? 0} + 进位 ${old} = ${sum} → 写 ${sum % 10}，进位 ${carry}。`],
        big('a', a, len, { [i]: 'cmp' }), big('b', b, len, { [i]: 'cmp' }), big('c', c, len, { [i]: 'act' }), vars({ sum, carry })])
    }
    const res = c.slice().reverse().join('')
    t.s('done', () => [[`Result: ${res.length > 40 ? res.slice(0, 40) + '…' : res}`, `结果：${res.length > 40 ? res.slice(0, 40) + '…' : res}`], big('a', a, len), big('b', b, len), big('c', c, len, Object.fromEntries(c.map((_, i) => [i, 'ok' as const])))])
    t.out(res)
  },
}

const bigMul: Lesson = {
  id: 'bignum-mul', title: ['High-precision multiplication', '高精度乘法'], level: 'J', cat: 'basic', diff: 4,
  needs: ['bignum-add'],
  blurb: ['Every digit pair a[i]·b[j] lands in column i + j; settle the carries afterwards.', '每一对数字 a[i]·b[j] 都累加到第 i + j 位，最后统一处理进位。'],
  ideas: [
    ['Digit i of a is worth 10ⁱ and digit j of b is worth 10ʲ, so their product belongs to 10^(i+j).', 'a 的第 i 位权值为 10ⁱ，b 的第 j 位为 10ʲ，乘积的权值就是 10^(i+j)。'],
    ['Accumulate all products first — cells may temporarily hold values above 9.', '先把所有乘积累加进去——格子里的值可以暂时大于 9。'],
    ['One final pass pushes carries upward; then strip leading zeros.', '最后一遍把进位向高位推，再去掉前导零。'],
  ],
  time: 'O(n · m)', space: 'O(n + m)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int main() {
    string s, t;
    cin >> s >> t;
    int n = s.size(), m = t.size();
    vector<int> a(n), b(m), c(n + m, 0);
    for (int i = 0; i < n; i++) a[i] = s[n - 1 - i] - '0';
    for (int i = 0; i < m; i++) b[i] = t[m - 1 - i] - '0';
    for (int i = 0; i < n; i++)
        for (int j = 0; j < m; j++)
            c[i + j] += a[i] * b[j];  //@acc
    for (int i = 0; i + 1 < n + m; i++) {
        c[i + 1] += c[i] / 10;  //@carry
        c[i] %= 10;
    }
    int top = n + m - 1;
    while (top > 0 && c[top] == 0) top--;  //@strip
    for (int i = top; i >= 0; i--) printf("%d", c[i]);
}`,
  notes: [
    ['acc', ['An n-digit times an m-digit number has at most n + m digits, so c has that size.', 'n 位数乘 m 位数最多 n + m 位，所以 c 开这么大。']],
    ['carry', ['Carrying once at the end is simpler than carrying inside the double loop. Each cell stays below 81·min(n, m), safely inside int.', '最后统一进位比在双重循环中进位更简单。每格不超过 81·min(n, m)，不会超出 int。']],
    ['strip', ['Keep at least one digit so that 0 prints as "0".', '至少保留一位，使 0 能输出为 “0”。']],
  ],
  input: ['Two non-negative integers, one per line. (n is the number of digits.)', '两个非负整数，每行一个。（n 为位数。）'],
  sizes: [2, 3, 4], lab: [10, 100, 1000, 3000],
  gen: (n, r) => `${rndNum(n, r)}\n${rndNum(n, r)}\n`,
  run(inp, t) {
    const rd = reader(inp), a = digitsOf(rd.str()), b = digitsOf(rd.str()), n = a.length, m = b.length
    const c = new Array<number>(n + m).fill(0), len = n + m
    for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) {
      c[i + j] += a[i] * b[j]
      t.s('acc', () => [[`a[${i}] × b[${j}] = ${a[i]} × ${b[j]} = ${a[i] * b[j]} goes to column ${i + j}.`, `a[${i}] × b[${j}] = ${a[i]} × ${b[j]} = ${a[i] * b[j]}，累加到第 ${i + j} 位。`],
        big('a', a, len, { [i]: 'cmp' }), big('b', b, len, { [j]: 'cmp' }), big('c (before carrying)', c, len, { [i + j]: 'act' })])
    }
    for (let i = 0; i + 1 < len; i++) {
      const old = c[i]
      c[i + 1] += Math.floor(c[i] / 10); c[i] %= 10
      t.s('carry', () => [[`Column ${i} holds ${old}: keep ${c[i]}, carry ${Math.floor(old / 10)}.`, `第 ${i} 位是 ${old}：保留 ${c[i]}，进位 ${Math.floor(old / 10)}。`],
        big('a', a, len), big('b', b, len), big('c', c, len, { [i]: 'ok', [i + 1]: 'act' })])
    }
    let top = len - 1
    while (top > 0 && c[top] === 0) top--
    const res = c.slice(0, top + 1).reverse().join('')
    t.s('strip', () => [[`Drop leading zeros: ${res.length > 40 ? res.slice(0, 40) + '…' : res}`, `去掉前导零：${res.length > 40 ? res.slice(0, 40) + '…' : res}`], big('c', c.slice(0, top + 1), len, Object.fromEntries(span(0, top).map(i => [i, 'ok' as const])))])
    t.out(res)
  },
}

const DIG = '0123456789ABCDEF'
const baseConv: Lesson = {
  id: 'base-conversion', title: ['Base conversion', '进制转换'], level: 'J', cat: 'basic', diff: 1,
  blurb: ['Divide by the base repeatedly; the remainders, read backwards, are the digits.', '反复除以基数，把余数倒着读就是各位数字（除 k 取余法）。'],
  ideas: [
    ['n mod k is the lowest base-k digit; n / k is the number with that digit removed.', 'n mod k 是 k 进制下的最低位；n / k 是去掉这一位后的数。'],
    ['Digits come out lowest first, so reverse them at the end.', '数字按从低到高的顺序产生，所以最后要倒序输出。'],
    ['Going back is the reverse process: value = value × k + digit, from the highest digit down.', '反向转换是逆过程：从最高位起 value = value × k + digit。'],
  ],
  time: 'O(log n)', space: 'O(log n)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int main() {
    long long n; int k;
    scanf("%lld%d", &n, &k);
    string digits = "0123456789ABCDEF", res;
    if (n == 0) res = "0";
    while (n > 0) {
        res += digits[n % k];  //@digit
        n /= k;  //@div
    }
    reverse(res.begin(), res.end());  //@rev
    cout << res << endl;
}`,
  notes: [
    ['digit', ['Indexing a string of digit characters handles bases above 10 (A = 10 … F = 15).', '用数字字符表下标取值，自然支持 10 以上的进制（A = 10 … F = 15）。']],
    ['div', ['Integer division throws away the digit just extracted.', '整除把刚取出的这一位丢掉。']],
    ['rev', ['The first remainder is the last digit.', '最先得到的余数是最低位。']],
  ],
  input: ['n k — prints the decimal number n in base k (2 ≤ k ≤ 16). (In the generator, n is the number of decimal digits.)', 'n k —— 把十进制数 n 转换为 k 进制（2 ≤ k ≤ 16）。（生成器中 n 表示十进制位数。）'],
  sizes: [2, 4, 7], lab: [3, 6, 9, 12, 15],
  gen: (n, r) => `${rndNum(Math.min(n, 15), r)} ${r.pick([2, 2, 8, 16, 3])}\n`,
  run(inp, t) {
    const rd = reader(inp)
    let n = rd.int()
    const k = rd.int(), res: string[] = []
    need(Number.isSafeInteger(n) && n >= 0, 'n must be a non-negative integer below 2^53.', 'n 须为小于 2^53 的非负整数。')
    need(k >= 2 && k <= 16, 'The base must be between 2 and 16.', '进制须在 2 到 16 之间。')
    if (n === 0) res.push('0')
    while (n > 0) {
      const d = n % k
      res.push(DIG[d])
      t.s('digit', () => [[`${n} mod ${k} = ${d} → next digit is ${DIG[d]}.`, `${n} mod ${k} = ${d} → 下一位是 ${DIG[d]}。`], arr('remainders (lowest digit first)', res, tn({ act: res.length - 1 })), vars({ n, k })])
      const old = n
      n = Math.floor(n / k)
      t.s('div', () => [[`${old} / ${k} = ${n}.`, `${old} / ${k} = ${n}。`], arr('remainders (lowest digit first)', res), vars({ n, k })])
    }
    res.reverse()
    t.s('rev', () => [[`Read the remainders backwards: ${res.join('')}.`, `把余数倒过来读：${res.join('')}。`], arr(`base ${k}`, res, tn({ ok: span(0, res.length - 1) }))])
    t.out(res.join(''))
  },
}

/** Hundred fowls: x roosters at 5 coins, y hens at 3, z chicks at three for 1 — n birds for n coins. */
const fowlsView = (n: number, x: number, y: number | undefined, sols: number[][]) => {
  const top = Math.floor((n - 5 * x) / 3), hit = sols.filter(s => s[0] === x).map(s => s[1])
  return [
    arr(`y: hens tried with x = ${x} roosters`, span(0, top), tn({ vis: y === undefined ? [] : span(0, y - 1), ok: hit, ...(y === undefined ? {} : { act: y }) }), y === undefined ? undefined : { y }, { base: 0 }),
    sols.length > 0 && grid('solutions', sols, gt({ ok: sols.flatMap((_, i) => [[i, 0], [i, 1], [i, 2]] as [number, number][]) }), { cols: ['roosters', 'hens', 'chicks'] }),
  ] as const
}
const enumeration: Lesson = {
  id: 'enumeration', title: ['Enumeration: a hundred fowls', '枚举：百钱买百鸡'], level: 'J', cat: 'basic', diff: 1,
  blurb: ['Try every candidate and keep the ones that pass the test — after shrinking the set of candidates as far as you can.', '把所有可能的情况都试一遍，留下通过检验的——但先要尽量缩小需要尝试的范围。'],
  ideas: [
    ['Enumeration needs three things: what a candidate is, the range each part can take, and a test that recognises an answer.', '枚举需要三样东西：候选解是什么、每个部分的取值范围、以及判断候选解是否正确的条件。'],
    ['The cost is the number of candidates, so every loop you can remove or shorten pays off directly.', '代价就是候选解的个数，所以每去掉或缩短一层循环，都会直接见效。'],
    ['A value that is fixed by the others should be computed, not looped over: here z = n − x − y.', '能由其他量确定的量应当直接算出来，而不是再套一层循环：这里 z = n − x − y。'],
    ['A loop can stop as soon as its candidates stop making sense: x roosters cost 5x, so 5x ≤ n.', '一旦候选值不再合理，循环就可以停下：x 只公鸡要花 5x 文，所以 5x ≤ n。'],
  ],
  time: 'O(n²)', space: 'O(1)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, cnt = 0;
    scanf("%d", &n);
    for (int x = 0; 5 * x <= n; x++) {  //@x
        for (int y = 0; 5 * x + 3 * y <= n; y++) {
            int z = n - x - y;  //@z
            if (z % 3 == 0 && 5 * x + 3 * y + z / 3 == n) {  //@check
                printf("%d %d %d\n", x, y, z);  //@found
                cnt++;
            }
        }
    }
    printf("%d\n", cnt);  //@done
}`,
  notes: [
    ['x', ['Roosters alone must not cost more than n coins, so x stops at n / 5.', '光是公鸡就不能超过 n 文，所以 x 最多到 n / 5。']],
    ['z', ['The number of birds is fixed, so z is not a choice: no third loop.', '鸡的总数是固定的，所以 z 没有选择的余地：不需要第三层循环。']],
    ['check', ['Chicks are sold in threes, so z must be a multiple of 3 before z / 3 means anything.', '小鸡三只一卖，所以必须先保证 z 是 3 的倍数，z / 3 才有意义。']],
  ],
  input: ['n — buy exactly n birds for exactly n coins. A rooster costs 5, a hen 3, and three chicks cost 1. Prints every solution "roosters hens chicks", then the number of solutions.', 'n —— 用恰好 n 文钱买恰好 n 只鸡。公鸡 5 文一只，母鸡 3 文一只，小鸡 1 文三只。输出所有方案“公鸡 母鸡 小鸡”，最后输出方案数。'],
  sizes: [20, 30, 40], lab: [30, 100, 300, 1000, 3000],
  gen: n => `${n}\n`,
  run(inp, t) {
    const n = reader(inp).int(), sols: number[][] = []
    need(Number.isInteger(n) && n >= 1 && n <= 100000, 'n must be between 1 and 100,000.', 'n 须在 1 到 100,000 之间。')
    for (let x = 0; 5 * x <= n; x++) {
      t.s('x', () => [[`Fix x = ${x} roosters: ${5 * x} coins spent, ${n - 5 * x} left for hens and chicks.`, `固定 x = ${x} 只公鸡：花掉 ${5 * x} 文，还剩 ${n - 5 * x} 文买母鸡和小鸡。`], ...fowlsView(n, x, undefined, sols), vars({ x })])
      for (let y = 0; 5 * x + 3 * y <= n; y++) {
        const z = n - x - y, cost = 5 * x + 3 * y + z / 3, ok = z % 3 === 0 && cost === n
        if (ok) sols.push([x, y, z])
        t.s(ok ? 'found' : 'check', () => [
          z % 3 !== 0 ? [`y = ${y}: z = ${n} − ${x} − ${y} = ${z} chicks, not a multiple of 3. Reject.`, `y = ${y}：z = ${n} − ${x} − ${y} = ${z} 只小鸡，不是 3 的倍数。舍去。`]
            : ok ? [`y = ${y}: z = ${z}. Cost ${5 * x} + ${3 * y} + ${z / 3} = ${n}. A solution!`, `y = ${y}：z = ${z}。花费 ${5 * x} + ${3 * y} + ${z / 3} = ${n}。找到一组解！`]
            : [`y = ${y}: z = ${z}. Cost ${5 * x} + ${3 * y} + ${z / 3} = ${cost}, not ${n}. Reject.`, `y = ${y}：z = ${z}。花费 ${5 * x} + ${3 * y} + ${z / 3} = ${cost}，不等于 ${n}。舍去。`],
          ...fowlsView(n, x, y, sols), vars({ x, y, z })])
      }
    }
    t.s('done', () => [[`Every candidate tried: ${sols.length} solution${sols.length === 1 ? '' : 's'}.`, `所有候选都试过了：共 ${sols.length} 组解。`], sols.length > 0 && grid('solutions', sols, undefined, { cols: ['roosters', 'hens', 'chicks'] }), vars({ answer: sols.length })])
    t.out([...sols.map(s => s.join(' ')), sols.length].join('\n'))
  },
}

const simulation: Lesson = {
  id: 'simulation', title: ['Simulation: counting out', '模拟：约瑟夫问题'], level: 'J', cat: 'basic', diff: 1,
  blurb: ['Do exactly what the statement says, step by step, with variables that mirror the situation.', '题目怎么说，程序就怎么一步一步地做，用变量如实记录当前的局面。'],
  ideas: [
    ['Simulation has no trick: the program acts out the process described in the statement.', '模拟没有技巧：程序把题目描述的过程原样演一遍。'],
    ['First decide what the state is — here, who is still in the circle and who spoke last.', '先确定要记录哪些状态——这里是谁还在圈里，以及上一个报数的是谁。'],
    ['Moving round a circle is p = p % n + 1: after person n comes person 1.', '在圈上前进一位就是 p = p % n + 1：n 号的下一个是 1 号。'],
    ['People who have left stay in the array, marked as gone, and are skipped when counting.', '已经出圈的人仍留在数组里，只是打上标记，报数时跳过。'],
  ],
  time: 'O(n · m · log n)', space: 'O(n)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, m;
bool gone[100005];

int main() {
    scanf("%d%d", &n, &m);
    int p = 0;
    for (int left = n; left > 0; left--) {
        int said = 0;
        while (said < m) {
            p = p % n + 1;  //@next
            if (!gone[p]) said++;  //@count
        }
        gone[p] = true;  //@leave
        printf("%d ", p);
    }
}  //@done`,
  notes: [
    ['next', ['p % n + 1 turns n into 1 and every other p into p + 1.', 'p % n + 1 把 n 变成 1，其余的 p 变成 p + 1。']],
    ['count', ['Only people still in the circle say a number.', '只有还在圈里的人才报数。']],
    ['leave', ['p is not reset: the next count starts from the neighbour of the person who just left.', 'p 不用重置：下一轮从刚出圈的人的下一位开始报数。']],
  ],
  input: ['n m — n people numbered 1 … n stand in a circle and count 1, 2, …, m; whoever says m leaves, and counting restarts at 1 with the next person. Prints the order in which they leave.', 'n m —— 编号 1 … n 的 n 个人围成一圈，从 1 开始报数，报到 m 的人出圈，下一个人重新从 1 开始报。输出出圈的顺序。'],
  sizes: [5, 8, 12], lab: [10, 100, 1000, 5000],
  gen: (n, r) => `${n} ${n <= 30 ? r.int(2, 4) : r.int(2, 9)}\n`,
  run(inp, t) {
    const rd = reader(inp), n = rd.int(), m = rd.int()
    need(Number.isInteger(n) && n >= 1 && n <= 100000 && Number.isInteger(m) && m >= 1, 'Need 1 ≤ n ≤ 100,000 and m ≥ 1.', '需要 1 ≤ n ≤ 100,000 且 m ≥ 1。')
    const gone = new Array<boolean>(n + 1).fill(false), order: number[] = []
    const circle = (p: number, tone: 'act' | 'bad') => arr('circle (after the last person comes person 1 again)', span(1, n), tn({ dim: span(1, n).filter(i => gone[i]).map(i => i - 1), [tone]: p - 1 }), { p: p - 1 }, { base: 1 })
    let p = 0
    for (let left = n; left > 0; left--) {
      let said = 0
      while (said < m) {
        p = p % n + 1
        if (gone[p]) { t.tick(); continue }
        said++
        const k = said, q = p
        t.s('count', () => [[`Person ${q} says ${k}.`, `${q} 号报 ${k}。`], circle(q, 'act'), arr('leaving order', order), vars({ said: k, m })])
      }
      gone[p] = true; order.push(p)
      const q = p
      t.s('leave', () => [[`${q} said ${m} and leaves. ${left - 1} left.`, `${q} 号报到 ${m}，出圈。还剩 ${left - 1} 人。`], circle(q, 'bad'), arr('leaving order', order, tn({ ok: order.length - 1 })), vars({ left: left - 1 })])
    }
    t.s('done', () => [[`Everyone has left. The last one out is ${order[n - 1]}.`, `所有人都已出圈。最后一个出圈的是 ${order[n - 1]} 号。`], arr('leaving order', order, tn({ ok: n - 1 }))])
    t.out(order.join(' '))
  },
}

const bigSub: Lesson = {
  id: 'bignum-sub', title: ['High-precision subtraction', '高精度减法'], level: 'J', cat: 'basic', diff: 4,
  needs: ['bignum-add'],
  blurb: ['Column subtraction with a borrow — after making sure the larger number is on top.', '带借位的竖式减法——但要先保证被减数不小于减数。'],
  ideas: [
    ['Same layout as addition: one digit per cell, lowest digit first.', '存储方式与加法相同：每格一位，低位在前。'],
    ['Compare first. If a < b, compute b − a and print a minus sign: the loop only works with the larger number on top.', '先比较大小。若 a < b，就计算 b − a 并输出负号：下面的循环只在被减数较大时才正确。'],
    ['Per column: d = a[i] − borrow − b[i]. If d < 0, add 10 and borrow 1 from the next column.', '每一位：d = a[i] − 借位 − b[i]。若 d < 0，就加上 10，并向高一位借 1。'],
    ['The result can be much shorter than a (1000 − 999 = 1): strip leading zeros, but keep one digit.', '结果可能比 a 短得多（1000 − 999 = 1）：要去掉前导零，但至少保留一位。'],
  ],
  time: 'O(n)', space: 'O(n)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

// Is a < b? Both are stored lowest digit first, without leading zeros.
bool smaller(const vector<int>& a, const vector<int>& b) {
    if (a.size() != b.size()) return a.size() < b.size();
    for (int i = a.size() - 1; i >= 0; i--)
        if (a[i] != b[i]) return a[i] < b[i];
    return false;
}

int main() {
    string s, t;
    cin >> s >> t;
    vector<int> a, b, c;
    for (int i = s.size() - 1; i >= 0; i--) a.push_back(s[i] - '0');
    for (int i = t.size() - 1; i >= 0; i--) b.push_back(t[i] - '0');
    if (smaller(a, b)) { swap(a, b); printf("-"); }  //@swap
    int borrow = 0;
    for (size_t i = 0; i < a.size(); i++) {
        int d = a[i] - borrow - (i < b.size() ? b[i] : 0);  //@digit
        borrow = d < 0 ? 1 : 0;
        c.push_back(d < 0 ? d + 10 : d);
    }
    while (c.size() > 1 && c.back() == 0) c.pop_back();  //@strip
    for (int i = c.size() - 1; i >= 0; i--) printf("%d", c[i]);  //@done
}`,
  notes: [
    ['swap', ['A longer number is larger; with equal lengths the first differing digit from the top decides.', '位数多的数更大；位数相同时，从高位起第一个不同的数字决定大小。']],
    ['digit', ['d is at least 0 − 1 − 9 = −10, so adding 10 once is always enough.', 'd 最小是 0 − 1 − 9 = −10，所以加一次 10 就一定够了。']],
    ['strip', ['size() > 1 keeps the single digit of the answer 0.', 'size() > 1 保证答案为 0 时仍保留一位。']],
  ],
  input: ['Two non-negative integers without leading zeros, one per line. Prints the first minus the second. (n is the number of digits.)', '两个没有前导零的非负整数，每行一个。输出第一个数减第二个数的差。（n 为位数。）'],
  sizes: [4, 8, 14], lab: [10, 1000, 100000, 500000],
  gen(n, r) {
    // One time in four the two numbers share their leading digits, so that the difference loses digits.
    const x = rndNum(n, r), k = r.int(0, 3), y = k === 0 && n >= 3 ? x.slice(0, n - 2) + rndNum(2, r) : rndNum(Math.max(1, n - Math.max(0, k - 1)), r)
    return r.int(0, 2) === 0 ? `${y}\n${x}\n` : `${x}\n${y}\n`
  },
  run(inp, t) {
    const rd = reader(inp)
    let a = digitsOf(rd.str()), b = digitsOf(rd.str())
    const c: number[] = [], len = Math.max(a.length, b.length)
    const less = a.length !== b.length ? a.length < b.length : (() => { for (let i = a.length - 1; i >= 0; i--) if (a[i] !== b[i]) return a[i] < b[i]; return false })()
    if (less) [a, b] = [b, a]
    t.s('swap', () => [less ? ['The first number is smaller: swap them and remember the minus sign.', '第一个数较小：交换两数，并记下负号。'] : ['The first number is not smaller: subtract directly.', '第一个数不小于第二个数：直接相减。'], big('a', a, len), big('b', b, len), vars({ sign: less ? '−' : '+' })])
    let borrow = 0
    for (let i = 0; i < a.length; i++) {
      const old = borrow, d = a[i] - borrow - (b[i] ?? 0)
      borrow = d < 0 ? 1 : 0
      c.push(d < 0 ? d + 10 : d)
      t.s('digit', () => [[`Column ${i}: ${a[i]} − borrow ${old} − ${b[i] ?? 0} = ${d}${d < 0 ? ` → write ${d + 10}, borrow 1` : ' → write it, no borrow'}.`, `第 ${i} 位：${a[i]} − 借位 ${old} − ${b[i] ?? 0} = ${d}${d < 0 ? ` → 写 ${d + 10}，向高位借 1` : ' → 直接写下，不借位'}。`],
        big('a', a, len, { [i]: 'cmp' }), big('b', b, len, { [i]: 'cmp' }), big('c', c, len, { [i]: 'act' }), vars({ d, borrow })])
    }
    const before = c.length
    while (c.length > 1 && c[c.length - 1] === 0) c.pop()
    t.s('strip', () => [before === c.length ? ['No leading zeros to remove.', '没有需要去掉的前导零。'] : [`Remove ${before - c.length} leading zero${before - c.length === 1 ? '' : 's'}.`, `去掉 ${before - c.length} 个前导零。`], big('a', a, len), big('b', b, len), big('c', c, len)])
    const res = (less ? '-' : '') + c.slice().reverse().join('')
    t.s('done', () => [[`Result: ${res.length > 40 ? res.slice(0, 40) + '…' : res}`, `结果：${res.length > 40 ? res.slice(0, 40) + '…' : res}`], big('a', a, len), big('b', b, len), big('c', c, len, Object.fromEntries(c.map((_, i) => [i, 'ok' as const])))])
    t.out(res)
  },
}

const bigDiv: Lesson = {
  id: 'bignum-div', title: ['High-precision ÷ a small number', '高精度除以单精度'], level: 'J', cat: 'basic', diff: 4,
  needs: ['bignum-add'],
  blurb: ['Long division: bring down one digit at a time and carry the remainder to the next step.', '竖式除法：每次落下一位数字，把余数带到下一步。'],
  ideas: [
    ['Division starts at the top digit, the opposite of addition and subtraction — so read the digits in the order they are written.', '除法从最高位开始，与加法和减法相反——所以按书写顺序处理各位数字即可。'],
    ['Keep one number, the remainder so far. Bringing down a digit turns it into r · 10 + digit.', '只需记住一个数：到目前为止的余数。落下一位数字后，它变成 r · 10 + 这一位。'],
    ['The next quotient digit is r / b and the new remainder is r % b. Because r < b before the step, the digit is at most 9.', '下一位商是 r / b，新的余数是 r % b。因为这一步之前 r < b，所以商的这一位不会超过 9。'],
    ['The remainder is always below b, so r · 10 + 9 fits in long long whenever b fits in int.', '余数始终小于 b，所以只要 b 在 int 范围内，r · 10 + 9 就不会超出 long long。'],
  ],
  time: 'O(n)', space: 'O(n)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int main() {
    string s;
    long long b;
    cin >> s >> b;
    vector<int> q;
    long long r = 0;
    for (char ch : s) {
        r = r * 10 + (ch - '0');  //@bring
        q.push_back(r / b);  //@digit
        r %= b;
    }
    size_t k = 0;
    while (k + 1 < q.size() && q[k] == 0) k++;  //@strip
    for (; k < q.size(); k++) printf("%d", q[k]);
    printf("\n%lld\n", r);  //@done
}`,
  notes: [
    ['bring', ['"Bringing down" a digit: the old remainder moves one place to the left.', '“落下”一位数字：原来的余数向左移了一位。']],
    ['digit', ['r was below b, so r · 10 + digit is below 10 · b and the quotient digit is 0 … 9.', 'r 原来小于 b，所以 r · 10 + 这一位小于 10 · b，商的这一位在 0 到 9 之间。']],
    ['strip', ['The quotient has one digit per digit of a, so it usually starts with zeros. Keep the last one.', '商的位数与 a 相同，所以开头通常有若干个 0。要保留最后一位。']],
  ],
  input: ['A non-negative integer a with up to hundreds of thousands of digits, then b (1 ≤ b ≤ 10⁹). Prints the quotient and the remainder. (n is the number of digits of a.)', '一个可能有几十万位的非负整数 a，随后是 b（1 ≤ b ≤ 10⁹）。输出商和余数。（n 为 a 的位数。）'],
  sizes: [4, 7, 12], lab: [10, 1000, 100000, 500000],
  gen: (n, r) => `${rndNum(n, r)}\n${n <= 30 ? r.int(2, r.int(0, 1) ? 9 : 99) : r.int(2, 1000000000)}\n`,
  run(inp, t) {
    const rd = reader(inp), s = rd.str(), b = rd.int()
    need(/^\d+$/.test(s), 'Expected a non-negative integer.', '需要非负整数。')
    need(Number.isInteger(b) && b >= 1 && b <= 1e9, 'b must be between 1 and 1,000,000,000.', 'b 须在 1 到 1,000,000,000 之间。')
    const a = s.split('').map(Number), n = a.length, q: number[] = []
    let r = 0
    for (let i = 0; i < n; i++) {
      const old = r, cur = r * 10 + a[i], d = Math.floor(cur / b)
      q.push(d); r = cur % b
      const rem = r
      t.s('digit', () => [[`Bring down ${a[i]}: ${old} · 10 + ${a[i]} = ${cur}. ${cur} ÷ ${b} = ${d}, remainder ${rem}.`, `落下 ${a[i]}：${old} · 10 + ${a[i]} = ${cur}。${cur} ÷ ${b} = ${d}，余 ${rem}。`],
        arr('a', a, tn({ dim: span(0, i - 1), act: i })), arr('quotient', [...q, ...new Array<string>(n - q.length).fill('')], tn({ ok: i })), vars({ b, r: rem })])
    }
    let k = 0
    while (k + 1 < n && q[k] === 0) k++
    const lead = k, res = q.slice(k).join('')
    t.s('strip', () => [lead ? [`Skip ${lead} leading zero${lead === 1 ? '' : 's'} of the quotient.`, `跳过商开头的 ${lead} 个 0。`] : ['The quotient has no leading zeros.', '商没有前导零。'], arr('a', a), arr('quotient', q, tn({ dim: span(0, lead - 1) })), vars({ b, r })])
    t.s('done', () => [[`Quotient ${res.length > 40 ? res.slice(0, 40) + '…' : res}, remainder ${r}.`, `商为 ${res.length > 40 ? res.slice(0, 40) + '…' : res}，余数为 ${r}。`], arr('a', a), arr('quotient', q, tn({ dim: span(0, lead - 1), ok: span(lead, n - 1) })), vars({ b, remainder: r })])
    t.out(res + '\n' + r)
  },
}

const coordCompress: Lesson = {
  id: 'coord-compress', title: ['Coordinate compression', '离散化'], level: 'S', cat: 'basic', diff: 6,
  needs: ['binary-search'],
  blurb: ['Replace huge values by their ranks: sort, remove duplicates, and look each value up by binary search.', '用排名代替巨大的数值：排序、去重，再用二分查找确定每个数的位置。'],
  ideas: [
    ['Many algorithms use values as array indices. That fails when the values go up to 10⁹ but there are only 10⁵ of them.', '很多算法要把数值当作数组下标。当数值高达 10⁹、而总共只有 10⁵ 个数时，这就行不通了。'],
    ['Often only the order of the values matters, not their size. Then each value can be replaced by its rank.', '很多时候只有数值之间的大小关系有用，具体多大并不重要。这时可以用排名来代替每个数。'],
    ['Copy the values, sort the copy, and delete duplicates: position k of the result holds the k-th smallest distinct value.', '把数值复制一份，排序后去重：结果的第 k 个位置就是第 k 小的不同的值。'],
    ['The rank of a value is its position in that array, found by binary search.', '一个数的排名就是它在这个数组中的位置，用二分查找得到。'],
    ['Keep the sorted array: it translates a rank back into the original value.', '保留这个有序数组：它能把排名再翻译回原来的值。'],
  ],
  time: 'O(n log n)', space: 'O(n)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, a[300005], b[300005];

int main() {
    scanf("%d", &n);
    for (int i = 0; i < n; i++) { scanf("%d", &a[i]); b[i] = a[i]; }
    sort(b, b + n);  //@sort
    int k = unique(b, b + n) - b;  //@uniq
    for (int i = 0; i < n; i++)
        printf("%d ", int(lower_bound(b, b + k, a[i]) - b) + 1);  //@map
    puts("");  //@done
}`,
  notes: [
    ['sort', ['Sort a copy: the original order of a is still needed.', '对副本排序：a 原来的顺序之后还要用。']],
    ['uniq', ['unique moves the distinct values to the front and returns where they end.', 'unique 把不同的值移到前面，并返回它们结束的位置。']],
    ['map', ['lower_bound finds the value in the sorted array; its position, counted from 1, is the rank.', 'lower_bound 在有序数组中找到这个值；它的位置（从 1 数起）就是排名。']],
  ],
  input: ['n, then n integers up to 10⁹. Prints each value replaced by its rank among the distinct values (the smallest gets 1; equal values get equal ranks).', 'n，随后 n 个不超过 10⁹ 的整数。把每个数替换成它在所有不同的值中的排名后输出（最小的为 1；相等的数排名相同）。'],
  sizes: [6, 8, 12], lab: [10, 1000, 100000, 300000],
  gen(n, r) {
    const pool = r.ints(Math.max(2, Math.ceil(n * 0.7)), 1, n <= 30 ? 999 : 1000000000)
    return `${n}\n${span(1, n).map(() => r.pick(pool)).join(' ')}\n`
  },
  run(inp, t) {
    const rd = reader(inp), n = rd.int(), a = rd.ints(n)
    const b = a.slice().sort((x, y) => x - y)
    t.tick(Math.ceil(n * Math.log2(Math.max(2, n))))
    t.s('sort', () => [['Sort a copy of the values.', '把数值复制一份并排序。'], arr('a', a), arr('b (sorted copy)', b)])
    const u: number[] = []
    for (const x of b) if (!u.length || u[u.length - 1] !== x) u.push(x)
    t.s('uniq', () => [[`Remove duplicates: ${u.length} distinct value${u.length === 1 ? '' : 's'} remain. Position k holds the k-th smallest.`, `去重：剩下 ${u.length} 个不同的值。第 k 个位置就是第 k 小的值。`], arr('a', a), arr('b (distinct, sorted)', u, tn({ ok: span(0, u.length - 1) }), undefined, { base: 1 })])
    const out: number[] = []
    for (let i = 0; i < n; i++) {
      let lo = 0, hi = u.length
      while (lo < hi) { const mid = (lo + hi) >> 1; t.tick(); if (u[mid] >= a[i]) hi = mid; else lo = mid + 1 }
      out.push(lo + 1)
      const pos = lo
      t.s('map', () => [[`a[${i}] = ${a[i]}: binary search finds it at position ${pos + 1} of b, so its rank is ${pos + 1}.`, `a[${i}] = ${a[i]}：二分查找发现它在 b 的第 ${pos + 1} 个位置，所以排名是 ${pos + 1}。`], arr('a', a, tn({ dim: span(0, i - 1), act: i })), arr('b (distinct, sorted)', u, tn({ ok: pos }), undefined, { base: 1 }), arr('ranks', [...out, ...new Array<string>(n - out.length).fill('')], tn({ act: i }))])
    }
    t.s('done', () => [[`Values up to ${Math.max(...u)} have become ranks 1 … ${u.length}, and every comparison between two of them is unchanged.`, `最大为 ${Math.max(...u)} 的数值变成了 1 … ${u.length} 的排名，而任意两个数之间的大小关系都没有变。`], arr('a', a), arr('ranks', out, tn({ ok: span(0, n - 1) }))])
    t.out(out.join(' '))
  },
}

export default [binarySearch, prefixSum, difference, fastPow, hanoi, bigAdd, bigMul, baseConv, enumeration, simulation, bigSub, bigDiv, coordCompress]
