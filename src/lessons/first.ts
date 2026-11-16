import type { GEdge, L, Tone, Tones, Variant } from '../engine/types'
import { adjOf, arr, graph, grid, gt, Heap, INF, inf, layoutBin, layoutForest, need, reader, readGraph, span, tn, toEdges, vars } from '../engine/h'
import { lay, readTreeQ } from './graph'
import { readGrid } from './search'

const cpp = String.raw

/**
 * Versions to learn first: the lesson's own method before one optimisation.
 * `label` names the lesson's own version next to it. The rule and the list are in specs/earlier-versions.md.
 */
export const FIRST: Record<string, { first: Variant; label: L }> = {
  gcd: {
    label: ['Remainder', '取余数'],
    first: {
      label: ['Repeated subtraction', '反复相减'],
      blurb: ['Replace the larger number by the difference, again and again. The common divisors never change — but when one number is much larger than the other, the same subtraction is repeated many times.', '不断把较大的数换成两数之差。公约数始终不变——但当一个数比另一个大得多时，同样的减法要重复很多次。'],
      time: 'O(max(a, b))', space: 'O(1)', maxN: 15,
      code: cpp`#include <bits/stdc++.h>
using namespace std;

int main() {
    long long a, b;
    scanf("%lld%lld", &a, &b);
    while (a && b) {
        if (a >= b) a -= b;  //@suba
        else b -= a;  //@subb
    }
    printf("%lld\n", a + b);  //@done
}`,
      notes: [
        ['suba', ['Subtracting b from a keeps every common divisor. If a is still not below b, the next round subtracts b again — all of those rounds together are one a mod b.', '从 a 中减去 b 不会改变任何公约数。如果 a 仍然不小于 b，下一轮还要再减一次 b——这些轮次合起来，就是一次 a mod b。']],
        ['done', ['One of the two is 0 now, so the sum is the other one: the gcd.', '此时两数之一为 0，所以它们的和就是另一个数：即最大公约数。']],
      ],
      run(inp, t) {
        const rd = reader(inp)
        let a = rd.int(), b = rd.int(), k = 0
        need(Number.isSafeInteger(a) && Number.isSafeInteger(b) && a >= 0 && b >= 0, 'Expected two non-negative integers below 2^53.', '需要两个小于 2^53 的非负整数。')
        while (a && b) {
          const onA = a >= b, oa = a, ob = b
          if (onA) a -= b; else b -= a
          k++
          const kk = k, na = a, nb = b
          t.s(onA ? 'suba' : 'subb', () => [onA ? [`${oa} ≥ ${ob}: a = ${oa} − ${ob} = ${na}.`, `${oa} ≥ ${ob}：a = ${oa} − ${ob} = ${na}。`] : [`${oa} < ${ob}: b = ${ob} − ${oa} = ${nb}.`, `${oa} < ${ob}：b = ${ob} − ${oa} = ${nb}。`], arr('a, b', [na, nb], tn({ act: onA ? 0 : 1 })), vars({ subtractions: kk })])
        }
        const g = a + b
        t.s('done', () => [[`One number is 0 after ${k} subtraction(s): the gcd is ${g}.`, `经过 ${k} 次减法后有一个数变为 0：最大公约数是 ${g}。`], arr('a, b', [a, b], tn({ ok: a ? 0 : 1 })), vars({ gcd: g })])
        t.out(g)
      },
    },
  },

  'fast-pow': {
    label: ['Loop over the bits', '按二进制位循环'],
    first: {
      label: ['Recursive halving', '递归折半'],
      blurb: ['aᵇ is the square of a^(b/2), times one more a when b is odd. The recursion halves b at every level — already log b multiplications — but it needs a stack as deep as b has bits.', 'aᵇ 等于 a^(b/2) 的平方，b 为奇数时再多乘一个 a。递归每深入一层，b 就减半——乘法次数已经是 log b——但它需要一个与 b 的二进制位数一样深的栈。'],
      time: 'O(log b)', space: 'O(log b)',
      code: cpp`#include <bits/stdc++.h>
using namespace std;

long long m;

long long power(long long a, long long b) {
    if (b == 0) return 1 % m;  //@base
    long long h = power(a, b / 2);  //@half
    h = h * h % m;  //@sq
    if (b & 1) h = h * a % m;  //@mul
    return h;
}

int main() {
    long long a, b;
    scanf("%lld%lld%lld", &a, &b, &m);
    printf("%lld\n", power(a % m, b));  //@done
}`,
      notes: [
        ['half', ['The same problem with half the exponent. Going down, the exponents are b with its lowest bits removed one by one.', '指数减半的同一个问题。一路向下，指数依次是 b 去掉最低一位、两位……之后的数。']],
        ['sq', ['Squaring the half-result doubles the exponent.', '把一半的结果平方，指数就翻倍。']],
        ['mul', ['An odd b has one a left over after halving.', 'b 为奇数时，折半之后还剩下一个 a。']],
      ],
      run(inp, t) {
        const tk = inp.split(/\s+/).filter(Boolean)
        need(tk.length >= 3 && tk.slice(0, 3).every(s => /^\d+$/.test(s)), 'Expected three non-negative integers.', '需要三个非负整数。')
        const m = BigInt(tk[2]), b0 = BigInt(tk[1])
        need(m > 0n, 'm must be positive.', 'm 必须为正。')
        const a = BigInt(tk[0]) % m, levels: bigint[] = []
        for (let b = b0; ; b /= 2n) { levels.push(b); if (b === 0n) break }
        const view = (k: number, done: number) => arr('exponent at each level of the recursion', levels.map(String), tn({ ok: span(done, levels.length - 1), act: k }))
        for (let k = 1; k < levels.length; k++) t.s('half', () => [[`power(a, ${levels[k - 1]}) needs power(a, ${levels[k]}) first.`, `power(a, ${levels[k - 1]}) 需要先算出 power(a, ${levels[k]})。`], view(k, levels.length), vars({ depth: k })])
        let h = 1n % m
        t.s('base', () => [[`Exponent 0: the answer is 1 mod m = ${h}.`, `指数为 0：答案是 1 mod m = ${h}。`], view(levels.length - 1, levels.length - 1), vars({ h: String(h) })])
        for (let k = levels.length - 2; k >= 0; k--) {
          const b = levels[k], old = h
          h = (h * h) % m
          const sq = h
          t.s('sq', () => [[`Back at exponent ${b}: ${old}² mod ${m} = ${sq}.`, `回到指数 ${b}：${old}² mod ${m} = ${sq}。`], view(k, k + 1), vars({ h: String(sq) })])
          if (b & 1n) {
            h = (h * a) % m
            const r = h
            t.s('mul', () => [[`${b} is odd: one more factor, ${sq} × ${a} mod ${m} = ${r}.`, `${b} 是奇数：再乘一个 a，${sq} × ${a} mod ${m} = ${r}。`], view(k, k), vars({ h: String(r) })])
          }
        }
        t.s('done', () => [[`Result: ${h}. The recursion was ${levels.length - 1} level(s) deep.`, `结果：${h}。递归深度为 ${levels.length - 1} 层。`], view(0, 0), vars({ answer: String(h) })])
        t.out(h)
      },
    },
  },

  dsu: {
    label: ['Path compression', '路径压缩'],
    first: {
      label: ['Plain find', '朴素查找'],
      blurb: ['find walks up to the root and leaves the tree as it is. Correct, and merging is still one assignment — but nothing stops the trees from growing into long chains that are walked again on every query.', 'find 一路走到根，树的形状保持原样。结果正确，合并也仍然只是一次赋值——但没有任何措施阻止树长成长链，而每次查询都要把这条链重新走一遍。'],
      time: 'O(n) per operation', space: 'O(n)', maxN: 100000,
      code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, m, fa[1000005];

int find(int x) {
    while (fa[x] != x) x = fa[x];  //@find
    return x;
}

int main() {
    scanf("%d%d", &n, &m);
    for (int i = 1; i <= n; i++) fa[i] = i;  //@init
    while (m--) {
        int op, x, y; scanf("%d%d%d", &op, &x, &y);
        if (op == 1) fa[find(x)] = find(y);  //@union
        else puts(find(x) == find(y) ? "Y" : "N");  //@query
    }
}`,
      notes: [
        ['find', ['The walk costs the depth of x, and the next find from the same x pays it again.', '这一趟的代价是 x 的深度，而下次再从同一个 x 查找时还要再付一次。']],
        ['union', ['Link root to root — never x to y directly.', '必须把根连到根——不能直接连 x 和 y。']],
      ],
      run(inp, t) {
        const rd = reader(inp), n = rd.int(), m = rd.int(), fa = span(0, n), out: string[] = []
        const view = (tone: Tones) => {
          const par = fa.map((p, i) => (i === 0 ? -2 : p === i ? -1 : p)), es: GEdge[] = []
          for (let i = 1; i <= n; i++) if (fa[i] !== i) es.push({ u: fa[i], v: i })
          return [graph(layoutForest(par), es, { base: 0, tone }), arr('fa', fa, { ...tone, 0: 'dim' })] as const
        }
        const find = (x: number) => {
          const path = [x]
          while (fa[path[path.length - 1]] !== path[path.length - 1]) path.push(fa[path[path.length - 1]])
          const root = path[path.length - 1]
          t.tick(path.length - 1)
          t.s('find', () => [path.length > 1 ? [`find(${x}): climb ${path.join(' → ')} — ${path.length - 1} step(s), and the tree stays as it is.`, `find(${x})：沿 ${path.join(' → ')} 向上——走了 ${path.length - 1} 步，树保持原样。`] : [`find(${x}): it is a root.`, `find(${x})：它自己就是根。`], ...view(tn({ vis: path, act: x, ok: root }))])
          return root
        }
        t.s('init', () => [[`${n} elements, each its own set.`, `${n} 个元素，各自为一个集合。`], ...view({})])
        for (let i = 0; i < m; i++) {
          const op = rd.int(), x = rd.int(), y = rd.int()
          need((op === 1 || op === 2) && x >= 1 && x <= n && y >= 1 && y <= n, `Operation ${i + 1} is invalid.`, `第 ${i + 1} 个操作不合法。`)
          const a = find(x), b = find(y)
          if (op === 1) {
            fa[a] = b
            t.s('union', () => [a === b ? [`union(${x}, ${y}): both already have root ${a}.`, `union(${x}, ${y})：两者的根都是 ${a}，已在同一集合。`] : [`union(${x}, ${y}): hang root ${a} under root ${b}.`, `union(${x}, ${y})：把根 ${a} 挂到根 ${b} 下面。`], ...view(tn({ act: a, ok: b }))])
          } else {
            out.push(a === b ? 'Y' : 'N')
            t.s('query', () => [[`Same set? Roots ${a} and ${b}: ${a === b ? 'Y' : 'N'}.`, `是否同一集合？根分别是 ${a} 和 ${b}：${a === b ? 'Y' : 'N'}。`], ...view(tn({ cmp: [x, y], [a === b ? 'ok' : 'bad']: [a, b] }))])
          }
        }
        t.out(out.join('\n'))
      },
    },
  },

  'segment-tree': {
    label: ['Lazy tags', '懒标记'],
    first: {
      label: ['No tags', '不带标记'],
      blurb: ['The same tree of sums, and the same query. But a range update walks down to every leaf of the range and recomputes all the nodes above them: O(n) for a long range.', '同样是一棵存区间和的树，查询也完全一样。但区间修改要一直走到区间内的每个叶子，再把它们上方的结点全部重新计算：区间很长时就是 O(n)。'],
      time: 'O(n) per update', space: 'O(4n)', maxN: 1000,
      code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, q;
long long sum[800005];

void up(int p) { sum[p] = sum[2 * p] + sum[2 * p + 1]; }

void build(int p, int l, int r) {
    if (l == r) { scanf("%lld", &sum[p]); return; }
    int mid = (l + r) / 2;
    build(2 * p, l, mid); build(2 * p + 1, mid + 1, r);
    up(p);  //@build
}

void update(int p, int l, int r, int x, int y, long long v) {
    if (l == r) { sum[p] += v; return; }  //@leaf
    int mid = (l + r) / 2;
    if (x <= mid) update(2 * p, l, mid, x, y, v);
    if (y > mid) update(2 * p + 1, mid + 1, r, x, y, v);
    up(p);  //@up
}

long long query(int p, int l, int r, int x, int y) {
    if (x <= l && r <= y) return sum[p];  //@hit
    int mid = (l + r) / 2;
    long long s = 0;
    if (x <= mid) s += query(2 * p, l, mid, x, y);
    if (y > mid) s += query(2 * p + 1, mid + 1, r, x, y);
    return s;
}

int main() {
    scanf("%d%d", &n, &q);
    build(1, 1, n);
    while (q--) {
        int op, x, y; scanf("%d%d%d", &op, &x, &y);
        if (op == 1) { long long v; scanf("%lld", &v); update(1, 1, n, x, y, v); }
        else printf("%lld\n", query(1, 1, n, x, y));  //@ans
    }
}`,
      notes: [
        ['leaf', ['The update stops only at single elements, even when a whole subtree lies inside the range.', '修改只在单个元素处才停下，即使整棵子树都落在修改区间内也是如此。']],
        ['up', ['Every node above a changed leaf is recomputed.', '被修改的叶子上方的每个结点都要重新计算。']],
        ['hit', ['A query can already stop at a node that lies completely inside the range — the update should learn the same trick.', '查询已经可以在完全落在区间内的结点处停下——修改也应该学会这一招。']],
      ],
      run(inp, t) {
        const rd = reader(inp), n = rd.int(), q = rd.int(), sum = new Array<number>(4 * n).fill(0), out: number[] = []
        need(n >= 1, 'n must be at least 1.', 'n 至少为 1。')
        const L: number[] = [], R: number[] = [], es: GEdge[] = []
        const shape = (p: number, l: number, r: number) => { L[p] = l; R[p] = r; if (l < r) { const m = (l + r) >> 1; shape(2 * p, l, m); shape(2 * p + 1, m + 1, r); es.push({ u: p, v: 2 * p }, { u: p, v: 2 * p + 1 }) } }
        let pos: ReturnType<typeof layoutBin> = []
        if (t.on) { shape(1, 1, n); pos = layoutBin(1, i => (L[i] < R[i] ? 2 * i : -1), i => (L[i] < R[i] ? 2 * i + 1 : -1)) }
        const view = (tone: Tones) => graph(pos, es, { label: sum, tone, sub: pos.map((_, p) => (L[p] === undefined ? undefined : L[p] === R[p] ? String(L[p]) : L[p] + '–' + R[p])), name: 'node = sum; caption = range' })
        const build = (p: number, l: number, r: number) => {
          if (l === r) { sum[p] = rd.int(); return }
          const m = (l + r) >> 1
          build(2 * p, l, m); build(2 * p + 1, m + 1, r)
          sum[p] = sum[2 * p] + sum[2 * p + 1]
          t.s('build', () => [[`Build [${l}, ${r}]: ${sum[2 * p]} + ${sum[2 * p + 1]} = ${sum[p]}.`, `建树 [${l}, ${r}]：${sum[2 * p]} + ${sum[2 * p + 1]} = ${sum[p]}。`], view(tn({ act: p, cmp: [2 * p, 2 * p + 1] }))])
        }
        const touched: number[] = []
        const update = (p: number, l: number, r: number, x: number, y: number, v: number) => {
          if (l === r) { sum[p] += v; touched.push(p); t.s('leaf', () => [[`Leaf ${l}: add ${v}, now ${sum[p]}.`, `叶子 ${l}：加上 ${v}，变为 ${sum[p]}。`], view(tn({ vis: touched, act: p }))]); return }
          const m = (l + r) >> 1
          if (x <= m) update(2 * p, l, m, x, y, v)
          if (y > m) update(2 * p + 1, m + 1, r, x, y, v)
          sum[p] = sum[2 * p] + sum[2 * p + 1]
          touched.push(p)
          t.s('up', () => [[`Back at [${l}, ${r}]: recompute ${sum[2 * p]} + ${sum[2 * p + 1]} = ${sum[p]}.`, `回到 [${l}, ${r}]：重新计算 ${sum[2 * p]} + ${sum[2 * p + 1]} = ${sum[p]}。`], view(tn({ vis: touched, act: p }))])
        }
        const hits: number[] = []
        const query = (p: number, l: number, r: number, x: number, y: number): number => {
          if (x <= l && r <= y) { hits.push(p); t.s('hit', () => [[`[${l}, ${r}] lies inside [${x}, ${y}]: take its sum ${sum[p]}.`, `[${l}, ${r}] 完全在 [${x}, ${y}] 内：取它的和 ${sum[p]}。`], view(tn({ ok: hits }))]); return sum[p] }
          const m = (l + r) >> 1
          return (x <= m ? query(2 * p, l, m, x, y) : 0) + (y > m ? query(2 * p + 1, m + 1, r, x, y) : 0)
        }
        build(1, 1, n)
        for (let k = 0; k < q; k++) {
          const op = rd.int(), x = rd.int(), y = rd.int()
          need((op === 1 || op === 2) && 1 <= x && x <= y && y <= n, `Operation ${k + 1} is invalid.`, `第 ${k + 1} 个操作不合法。`)
          if (op === 1) { touched.length = 0; update(1, 1, n, x, y, rd.int()) }
          else {
            hits.length = 0
            const ans = query(1, 1, n, x, y)
            out.push(ans)
            t.s('ans', () => [[`sum(${x}..${y}) = ${ans}, assembled from ${hits.length} node(s).`, `sum(${x}..${y}) = ${ans}，由 ${hits.length} 个结点拼成。`], view(tn({ ok: hits })), vars({ answer: ans })])
          }
        }
        t.out(out.join('\n'))
      },
    },
  },

  dijkstra: {
    label: ['Min-heap', '小根堆'],
    first: {
      label: ['Array scan', '扫描数组'],
      blurb: ['The same greedy step — settle the closest unsettled vertex, relax its edges — but the closest vertex is found by looking at all n of them. That is n scans of n vertices, whatever the number of edges.', '同样的贪心步骤——确定最近的未确定顶点，松弛它的边——只是“最近的顶点”要把 n 个顶点全看一遍才能找到。无论有多少条边，都要扫描 n 次、每次 n 个顶点。'],
      time: 'O(n² + m)', space: 'O(n + m)', maxN: 1000,
      code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, m;
vector<pair<int, int>> g[300005];
long long d[300005];
bool done[300005];

int main() {
    scanf("%d%d", &n, &m);
    for (int i = 0; i < m; i++) {
        int u, v, w; scanf("%d%d%d", &u, &v, &w);
        g[u].push_back({v, w}); g[v].push_back({u, w});
    }
    memset(d, 0x3f, sizeof d);
    d[1] = 0;  //@init
    for (int k = 0; k < n; k++) {
        int u = 0;
        for (int i = 1; i <= n; i++)
            if (!done[i] && (!u || d[i] < d[u])) u = i;  //@scan
        if (d[u] > 1e18) break;
        done[u] = true;  //@settle
        for (auto [v, w] : g[u])
            if (d[u] + w < d[v]) d[v] = d[u] + w;  //@relax
    }
    for (int i = 1; i <= n; i++) printf("%lld ", d[i] > 1e18 ? -1 : d[i]);  //@done
}`,
      notes: [
        ['scan', ['n comparisons to find one vertex. A heap would hand it over in O(log n).', '为了找出一个顶点要比较 n 次。换成堆，O(log n) 就能取到。']],
        ['settle', ['Exactly the argument of the lesson: nothing unsettled is closer, so this distance is final.', '与本课的论证完全相同：没有更近的未确定顶点，所以这个距离是最终值。']],
        ['relax', ['No heap to update: the new distance simply waits in d[] for a later scan.', '不需要维护堆：新的距离就放在 d[] 里，等之后的扫描来发现。']],
      ],
      run(inp, t) {
        const { n, es } = readGraph(inp, true), g = adjOf(n, es), pos = lay(t.on, n, es), ed = toEdges(es, true)
        for (const e of es) need(e[2] >= 0, 'Dijkstra needs non-negative weights.', 'Dijkstra 要求边权非负。')
        const d = new Array<number>(n).fill(INF), done = new Uint8Array(n), from = new Int32Array(n).fill(-1)
        const view = (cur: number, hi: Tones = {}, ehi: Tones = {}) => {
          const tone: Tones = {}, et: Tones = {}
          for (let i = 0; i < n; i++) { if (done[i]) tone[i] = 'ok'; else if (d[i] < INF) tone[i] = 'cmp'; if (from[i] >= 0) et[from[i]] = done[i] ? 'ok' : 'cmp' }
          if (cur >= 0) tone[cur] = 'act'
          return [graph(pos, ed, { tone: { ...tone, ...hi }, et: { ...et, ...ehi }, sub: d.map(inf), name: 'caption = d[v]' }), arr('d', d.map(inf), tn({ ok: span(0, n - 1).filter(i => done[i]), act: cur }), undefined, { base: 1 })] as const
        }
        d[0] = 0
        t.s('init', () => [['d[1] = 0, everything else ∞.', 'd[1] = 0，其余为 ∞。'], ...view(-1)])
        for (let k = 0; k < n; k++) {
          let u = -1
          for (let i = 0; i < n; i++) if (!done[i] && (u < 0 || d[i] < d[u])) u = i
          t.tick(n - 1)
          if (d[u] >= INF) break
          const uu = u
          t.s('scan', () => [[`Scan all ${n} vertices: the closest unsettled one is ${uu + 1} with d = ${d[uu]}.`, `扫描全部 ${n} 个顶点：最近的未确定顶点是 ${uu + 1}，d = ${d[uu]}。`], ...view(uu)])
          done[u] = 1
          t.s('settle', () => [[`d[${uu + 1}] = ${d[uu]} is final.`, `d[${uu + 1}] = ${d[uu]} 已确定。`], ...view(uu)])
          for (const [v, w, e] of g[u]) if (d[u] + w < d[v]) {
            const old = d[v]
            d[v] = d[u] + w; from[v] = e
            t.s('relax', () => [[`Relax ${uu + 1} → ${v + 1}: ${d[uu]} + ${w} = ${d[v]} < ${inf(old)}, update d[${v + 1}].`, `松弛 ${uu + 1} → ${v + 1}：${d[uu]} + ${w} = ${d[v]} < ${inf(old)}，更新 d[${v + 1}]。`], ...view(uu, { [v]: 'alt' }, { [e]: 'act' })])
          }
        }
        t.s('done', () => [['Every reachable vertex is settled.', '所有可达的顶点都已确定。'], ...view(-1)])
        t.out(d.map(x => (x >= INF ? -1 : x)).join(' '))
      },
    },
  },

  prim: {
    label: ['Min-heap', '小根堆'],
    first: {
      label: ['Array scan', '扫描数组'],
      blurb: ['For every vertex outside the tree keep best[v], the lightest edge that joins it to the tree. Each round scans all vertices for the smallest best[v], adds that vertex, and updates its neighbours. Simple, and O(n²) whatever the number of edges.', '对树外的每个顶点维护 best[v]——把它连到树上的最轻的边。每一轮扫描所有顶点，找出 best[v] 最小的那个，把它加入树，再更新它的邻居。很简单，但无论有多少条边都是 O(n²)。'],
      time: 'O(n² + m)', space: 'O(n + m)', maxN: 1000,
      code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, m, best[300005];
vector<pair<int, int>> g[300005];
bool in[300005];

int main() {
    scanf("%d%d", &n, &m);
    for (int i = 0; i < m; i++) {
        int u, v, w; scanf("%d%d%d", &u, &v, &w);
        g[u].push_back({v, w}); g[v].push_back({u, w});
    }
    memset(best, 0x3f, sizeof best);
    best[1] = 0;  //@init
    long long total = 0;
    for (int k = 0; k < n; k++) {
        int u = 0;
        for (int i = 1; i <= n; i++)
            if (!in[i] && (!u || best[i] < best[u])) u = i;  //@scan
        in[u] = true; total += best[u];  //@add
        for (auto [v, c] : g[u])
            if (!in[v] && c < best[v]) best[v] = c;  //@update
    }
    printf("%lld\n", total);  //@done
}`,
      notes: [
        ['scan', ['The lightest edge leaving the tree is found by looking at every vertex.', '要找到离开树的最轻的边，得把每个顶点都看一遍。']],
        ['update', ['Only the lightest edge into each outside vertex matters, so one number per vertex is enough.', '对树外的每个顶点，只有连向它的最轻的那条边要紧，所以每个顶点记一个数就够了。']],
      ],
      run(inp, t) {
        const { n, es } = readGraph(inp, true), g = adjOf(n, es), pos = lay(t.on, n, es), ed = toEdges(es, true)
        const inT = new Uint8Array(n), best = new Array<number>(n).fill(INF), via = new Int32Array(n).fill(-1), et: Tones = {}
        let total = 0
        const view = (hi: Tones = {}, ehi: Tones = {}) => [graph(pos, ed, { tone: { ...tn({ ok: span(0, n - 1).filter(i => inT[i]) }), ...hi }, et: { ...et, ...ehi } }), arr('best (lightest edge into the tree)', best.map((x, i) => (inT[i] ? '✓' : inf(x))), hi, undefined, { base: 1 }), vars({ total })] as const
        best[0] = 0
        t.s('init', () => [['Start the tree at vertex 1.', '从顶点 1 开始建树。'], ...view()])
        for (let k = 0; k < n; k++) {
          let u = -1
          for (let i = 0; i < n; i++) if (!inT[i] && (u < 0 || best[i] < best[u])) u = i
          t.tick(n - 1)
          need(best[u] < INF, 'The graph must be connected.', '图必须连通。')
          const uu = u, w = best[u]
          t.s('scan', () => [[`Scan all ${n} vertices: the smallest best is ${w}, at vertex ${uu + 1}.`, `扫描全部 ${n} 个顶点：best 最小的是顶点 ${uu + 1}，值为 ${w}。`], ...view({ [uu]: 'act' }, via[uu] >= 0 ? { [via[uu]]: 'act' } : {})])
          inT[u] = 1; total += w
          if (via[u] >= 0) et[via[u]] = 'ok'
          t.s('add', () => [[`Add vertex ${uu + 1}; total = ${total}.`, `加入顶点 ${uu + 1}；total = ${total}。`], ...view({ [uu]: 'act' })])
          for (const [v, c, id] of g[u]) if (!inT[v] && c < best[v]) {
            const old = best[v]
            best[v] = c; via[v] = id
            t.s('update', () => [[`Edge ${uu + 1} – ${v + 1} (weight ${c}) is lighter than ${inf(old)}: best[${v + 1}] = ${c}.`, `边 ${uu + 1} – ${v + 1}（权值 ${c}）比 ${inf(old)} 更轻：best[${v + 1}] = ${c}。`], ...view({ [uu]: 'act', [v]: 'cmp' }, { [id]: 'cmp' })])
          }
        }
        t.s('done', () => [[`Minimum spanning tree weight: ${total}.`, `最小生成树权值：${total}。`], ...view()])
        t.out(total)
      },
    },
  },

  spfa: {
    label: ['SPFA: queue', 'SPFA：队列'],
    first: {
      label: ['Bellman-Ford: rounds', 'Bellman-Ford：逐轮松弛'],
      blurb: ['Relax every edge, round after round, and stop when a whole round changes nothing. Always correct without negative cycles — but most relaxations in a round try edges whose start has not changed since the last round.', '一轮一轮地松弛所有的边，直到某一轮什么都没有改变为止。只要没有负环就一定正确——但一轮中的大多数松弛，尝试的都是起点自上一轮以来没有变化的边。'],
      time: 'O(n · m)', space: 'O(n + m)', maxN: 100000,
      gain: ['only edges that can help', '只尝试可能有用的边'],
      code: cpp`#include <bits/stdc++.h>
using namespace std;

const long long INF = 4e18;
int n, m, eu[600005], ev[600005], ew[600005];
long long d[300005];

int main() {
    scanf("%d%d", &n, &m);
    for (int i = 0; i < m; i++) scanf("%d%d%d", &eu[i], &ev[i], &ew[i]);
    for (int i = 1; i <= n; i++) d[i] = INF;
    d[1] = 0;  //@init
    for (int round = 1; round <= n; round++) {
        bool changed = false;  //@round
        for (int i = 0; i < m; i++)
            if (d[eu[i]] != INF && d[eu[i]] + ew[i] < d[ev[i]]) {
                d[ev[i]] = d[eu[i]] + ew[i];  //@relax
                changed = true;
            }
        if (!changed) break;  //@stop
    }
    for (int i = 1; i <= n; i++) {
        if (d[i] == INF) printf("inf ");
        else printf("%lld ", d[i]);  //@done
    }
}`,
      notes: [
        ['round', ['After round k every shortest path with at most k edges is correct, so n − 1 rounds always suffice.', '第 k 轮之后，所有边数不超过 k 的最短路都已正确，所以 n − 1 轮一定足够。']],
        ['relax', ['All m edges are tried in every round, although an edge can only help if the distance of its start has just decreased.', '每一轮都要尝试全部 m 条边，尽管只有起点的距离刚刚变小的边才可能有用。']],
        ['stop', ['A round without any change proves that no edge can be relaxed any more.', '如果一整轮都没有变化，就说明再也没有边可以松弛了。']],
      ],
      run(inp, t) {
        const { n, m, es } = readGraph(inp, true), pos = lay(t.on, n, es), ed = toEdges(es, true, true)
        const d = new Array<number>(n).fill(INF)
        const view = (hi: Tones = {}, ehi: Tones = {}) => graph(pos, ed, { tone: { ...tn({ cmp: span(0, n - 1).filter(i => d[i] < INF) }), ...hi }, et: ehi, sub: d.map(inf), name: 'caption = d[v]' })
        d[0] = 0
        t.s('init', () => [['d[1] = 0, everything else ∞.', 'd[1] = 0，其余为 ∞。'], view()])
        for (let round = 1; round <= n; round++) {
          let changed = 0
          t.s('round', () => [[`Round ${round}: try all ${m} edges.`, `第 ${round} 轮：尝试全部 ${m} 条边。`], view(), vars({ round })])
          t.tick(m)
          es.forEach(([u, v, w], e) => {
            if (d[u] >= INF || d[u] + w >= d[v]) return
            const old = d[v]
            d[v] = d[u] + w; changed++
            t.s('relax', () => [[`${u + 1} → ${v + 1}: ${d[u]} + (${w}) = ${d[v]} < ${inf(old)}. Update.`, `${u + 1} → ${v + 1}：${d[u]} + (${w}) = ${d[v]} < ${inf(old)}。更新。`], view({ [u]: 'act', [v]: 'alt' }, { [e]: 'act' }), vars({ round })])
          })
          need(round < n || !changed, 'Negative cycle detected.', '检测到负环。')
          if (!changed) { t.s('stop', () => [[`Round ${round} changed nothing: all distances are final.`, `第 ${round} 轮没有任何变化：所有距离都已确定。`], view(tn({ ok: span(0, n - 1).filter(i => d[i] < INF) })), vars({ rounds: round })]); break }
        }
        t.out(d.map(x => (x >= INF ? 'inf' : x)).join(' '))
      },
    },
  },

  floyd: {
    label: ['One matrix, in place', '一个矩阵，原地更新'],
    first: {
      label: ['3-D table', '三维表'],
      blurb: ['The DP exactly as it is defined: d[k][i][j] is the shortest path from i to j whose intermediate stops are all among vertices 1..k. Layer k is computed from layer k − 1 — and nothing older is ever read, yet all n + 1 layers are stored.', '完全按定义写出的 DP：d[k][i][j] 表示从 i 到 j、中转点只能取自顶点 1..k 的最短路。第 k 层由第 k − 1 层算出——更早的层再也不会被读取，却把全部 n + 1 层都存了下来。'],
      time: 'O(n³)', space: 'O(n³)',
      code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, m;
long long d[205][205][205];

int main() {
    scanf("%d%d", &n, &m);
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= n; j++) d[0][i][j] = i == j ? 0 : (long long)4e18;
    for (int i = 0; i < m; i++) {
        int u, v; long long w; scanf("%d%d%lld", &u, &v, &w);
        d[0][u][v] = min(d[0][u][v], w); d[0][v][u] = min(d[0][v][u], w);  //@init
    }
    for (int k = 1; k <= n; k++)  //@pivot
        for (int i = 1; i <= n; i++)
            for (int j = 1; j <= n; j++) {
                d[k][i][j] = d[k - 1][i][j];  //@keep
                if (d[k - 1][i][k] < 4e18 && d[k - 1][k][j] < 4e18)
                    d[k][i][j] = min(d[k][i][j], d[k - 1][i][k] + d[k - 1][k][j]);  //@relax
            }
    for (int i = 1; i <= n; i++, puts(""))
        for (int j = 1; j <= n; j++) printf("%lld ", d[n][i][j] > 1e18 ? -1 : d[n][i][j]);
}`,
      notes: [
        ['pivot', ['k is the stage of the DP: layer k allows one more vertex as an intermediate stop.', 'k 是 DP 的阶段：第 k 层多允许一个顶点作为中转点。']],
        ['keep', ['Not passing through k is always possible: copy the cell from the layer below.', '不经过 k 总是可行的：照抄下一层的同一个格子。']],
        ['relax', ['Row k and column k do not change from layer k − 1 to layer k (d[k][k] = 0) — which is why one matrix updated in place gives the same result.', '第 k 行和第 k 列从第 k − 1 层到第 k 层不会变化（d[k][k] = 0）——这正是只用一个矩阵原地更新也能得到相同结果的原因。']],
      ],
      run(inp, t) {
        const { n, es } = readGraph(inp, true)
        need(n <= 200, 'The 3-D table allows at most 200 vertices.', '三维表最多支持 200 个顶点。')
        let prev: number[][] = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : INF)))
        for (const [u, v, w] of es) { prev[u][v] = Math.min(prev[u][v], w); prev[v][u] = Math.min(prev[v][u], w) }
        const hd = span(1, n)
        const view = (k: number, layer: number[][], tone: Record<string, Tone>, upto = n * n) => grid(`layer d[${k}]`, layer.map((r, i) => r.map((x, j) => (i * n + j < upto ? inf(x) : ''))), tone, { rows: hd, cols: hd })
        const cells = (k: number) => vars({ layer: k, 'cells stored': (k + 1) * n * n })
        t.s('init', () => [['Layer 0: only direct edges.', '第 0 层：只有直接相连的边。'], view(0, prev, {}), cells(0)])
        for (let k = 0; k < n; k++) {
          const cur = prev.map(r => r.slice()), old = prev
          t.s('pivot', () => [[`Layer ${k + 1}: vertex ${k + 1} is now allowed as a stop. Start from a copy of layer ${k}.`, `第 ${k + 1} 层：现在允许经过顶点 ${k + 1} 中转。先照抄第 ${k} 层。`], view(k, old, gt({ vis: span(0, n - 1).flatMap(x => [[k, x], [x, k]] as [number, number][]) })), cells(k + 1)])
          for (let i = 0; i < n; i++) {
            if (i === k || old[i][k] >= INF) continue
            for (let j = 0; j < n; j++) {
              if (j === k || j === i || old[k][j] >= INF) continue
              const via = old[i][k] + old[k][j], was = old[i][j], better = via < was
              if (better) cur[i][j] = via
              t.s('relax', () => [[`d[${k + 1}][${i + 1}][${j + 1}]: ${old[i][k]} + ${old[k][j]} = ${via} ${better ? '<' : '≥'} ${inf(was)}${better ? ' — improved.' : ': keep it.'}`, `d[${k + 1}][${i + 1}][${j + 1}]：${old[i][k]} + ${old[k][j]} = ${via} ${better ? '<' : '≥'} ${inf(was)}${better ? '——更优。' : '：保持不变。'}`], view(k, old, gt({ cmp: [[i, k], [k, j]] })), view(k + 1, cur, gt({ [better ? 'act' : 'vis']: [[i, j]] }), i * n + j + 1), cells(k + 1)])
            }
          }
          prev = cur
        }
        t.out(prev.map(r => r.map(x => (x >= INF ? -1 : x)).join(' ')).join('\n'))
      },
    },
  },

  'a-star': {
    label: ['A*: Manhattan distance', 'A*：曼哈顿距离'],
    first: {
      label: ['h = 0: Dijkstra', 'h = 0：Dijkstra'],
      blurb: ['The same program with an estimate that knows nothing: h returns 0, so cells are expanded purely by the distance walked — in every direction, including away from the target. The answer is the same; the number of expanded cells is not.', '同一个程序，只是估计函数一无所知：h 返回 0，于是格子完全按已走的距离扩展——朝所有方向，包括背离终点的方向。答案相同，扩展的格子数却不同。'],
      time: 'O(n · m · log(n · m))', space: 'O(n · m)', maxN: 700,
      gain: ['fewer cells expanded', '扩展的格子更少'],
      code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, m, d[1005][1005];
char g[1005][1005];
int dx[] = {-1, 0, 1, 0}, dy[] = {0, 1, 0, -1};

int h(int, int) { return 0; }  //@h

int main() {
    scanf("%d%d", &n, &m);
    for (int i = 0; i < n; i++) scanf("%s", g[i]);
    memset(d, 0x3f, sizeof d);
    priority_queue<array<int, 3>, vector<array<int, 3>>, greater<>> pq;
    d[0][0] = 0; pq.push({h(0, 0), 0, 0});  //@start
    while (!pq.empty()) {
        auto [f, x, y] = pq.top(); pq.pop();
        if (f > d[x][y] + h(x, y)) continue;
        if (x == n - 1 && y == m - 1) break;  //@pop
        for (int k = 0; k < 4; k++) {
            int nx = x + dx[k], ny = y + dy[k];
            if (nx < 0 || ny < 0 || nx >= n || ny >= m || g[nx][ny] == '#') continue;
            if (d[x][y] + 1 < d[nx][ny]) {
                d[nx][ny] = d[x][y] + 1;  //@relax
                pq.push({d[nx][ny] + h(nx, ny), nx, ny});
            }
        }
    }
    printf("%d\n", d[n - 1][m - 1] > 1e9 ? -1 : d[n - 1][m - 1]);  //@done
}`,
      notes: [
        ['h', ['The only line that differs. An estimate of 0 never overestimates, so the answer is still optimal — it just gives no direction.', '唯一不同的一行。估计值 0 永远不会高估，所以答案仍然最优——只是它不提供任何方向。']],
        ['pop', ['With h = 0 the key is the distance walked: cells leave the queue in rings around the start.', 'h = 0 时，排序的依据就是已走的距离：格子围着起点一圈一圈地出队。']],
      ],
      run(inp, t) {
        const { n, m, g } = readGrid(inp)
        need(g[0][0] === '.' && g[n - 1][m - 1] === '.', 'Start and target cells must be free.', '起点和终点必须是空地。')
        const BIG = 1e9, d = new Int32Array(n * m).fill(BIG), par = new Int32Array(n * m).fill(-1), closed = new Uint8Array(n * m)
        const pq = new Heap<[number, number]>((a, b) => a[0] < b[0] || (a[0] === b[0] && a[1] > b[1]))
        const DX = [-1, 0, 1, 0], DY = [0, 1, 0, -1]
        let expanded = 0
        const view = (cur: number, nw = -1, path: number[] = []) => {
          const tones: Record<string, Tone> = {}
          const cells = g.map((row, i) => row.split('').map((ch, j) => {
            const id = i * m + j
            if (ch === '#') { tones[i + ',' + j] = 'dim'; return '▓' }
            if (d[id] < BIG) tones[i + ',' + j] = closed[id] ? 'vis' : 'cmp'
            return d[id] < BIG ? d[id] : ''
          }))
          for (const p of path) tones[Math.floor(p / m) + ',' + (p % m)] = 'ok'
          if (cur >= 0) tones[Math.floor(cur / m) + ',' + (cur % m)] = 'act'
          if (nw >= 0) tones[Math.floor(nw / m) + ',' + (nw % m)] = 'ok'
          return grid('f = g + 0 of every discovered cell', cells, tones, { sq: true })
        }
        d[0] = 0; pq.push([0, 0])
        t.s('start', () => [['Start: g = 0, and h is 0 everywhere, so f = 0.', '起点：g = 0，而 h 处处为 0，所以 f = 0。'], view(0)])
        while (pq.size) {
          const [f, cur] = pq.pop()
          if (f > d[cur]) continue
          closed[cur] = 1; expanded++
          const x = Math.floor(cur / m), y = cur % m, e = expanded
          t.s('pop', () => [[`Pop (${x}, ${y}): f = g = ${f} is the smallest — no preference for any direction.`, `取出 (${x}, ${y})：f = g = ${f} 最小——对任何方向都没有偏好。`], view(cur), vars({ expanded: e })])
          if (cur === n * m - 1) break
          for (let k = 0; k < 4; k++) {
            const nx = x + DX[k], ny = y + DY[k], id = nx * m + ny
            if (nx < 0 || ny < 0 || nx >= n || ny >= m || g[nx][ny] === '#' || d[cur] + 1 >= d[id]) continue
            d[id] = d[cur] + 1; par[id] = cur; pq.push([d[id], id])
            t.s('relax', () => [[`(${nx}, ${ny}): g = ${d[id]}, so f = ${d[id]}.`, `(${nx}, ${ny})：g = ${d[id]}，所以 f = ${d[id]}。`], view(cur, id), vars({ expanded: e })])
          }
        }
        const ans = d[n * m - 1] < BIG ? d[n * m - 1] : -1
        t.s('done', () => {
          const path: number[] = []
          if (ans >= 0) for (let p = n * m - 1; p >= 0; p = par[p]) path.push(p)
          return [ans >= 0 ? [`Target reached in ${ans} moves after expanding ${expanded} of ${n * m} cells.`, `到达终点，共 ${ans} 步；扩展了 ${n * m} 个格子中的 ${expanded} 个。`] : ['The queue is empty: the target cannot be reached.', '队列已空：无法到达终点。'], view(-1, -1, path), vars({ expanded, answer: ans })]
        })
        t.out(ans)
      },
    },
  },

  lca: {
    label: ['Binary lifting', '倍增'],
    first: {
      label: ['One step at a time', '一步一步往上爬'],
      blurb: ['The same two phases: bring both vertices to the same depth, then climb together until they meet. Every move goes to the parent — one level — so a query costs the depth of the tree.', '同样分两个阶段：先把两个顶点调到同一深度，再一起往上爬，直到相遇。每一步都只走到父亲——只上升一层——所以一次询问的代价是树的深度。'],
      time: 'O(n) per query', space: 'O(n)', maxN: 200000,
      code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, q, dep[300005], fa[300005];
vector<int> g[300005];

void dfs(int u, int p) {
    fa[u] = p; dep[u] = dep[p] + 1;  //@dfs
    for (int v : g[u]) if (v != p) dfs(v, u);
}

int lca(int u, int v) {
    if (dep[u] < dep[v]) swap(u, v);
    while (dep[u] > dep[v]) u = fa[u];  //@lift
    while (u != v) {
        u = fa[u]; v = fa[v];  //@climb
    }
    return u;  //@ans
}

int main() {
    scanf("%d%d", &n, &q);
    for (int i = 1; i < n; i++) {
        int u, v; scanf("%d%d", &u, &v);
        g[u].push_back(v); g[v].push_back(u);
    }
    dfs(1, 0);
    while (q--) {
        int u, v; scanf("%d%d", &u, &v);
        printf("%d\n", lca(u, v));
    }
}`,
      notes: [
        ['lift', ['One level per step. The depth difference can be n − 1 on a chain.', '每一步只上升一层。在一条链上，深度差可以达到 n − 1。']],
        ['climb', ['At equal depth the two vertices meet exactly at their lowest common ancestor.', '深度相同时，两个顶点恰好在它们的最近公共祖先处相遇。']],
      ],
      run(inp, t) {
        const { n, qs, par, order, pos, ed } = readTreeQ(inp, t.on)
        const dep = new Int32Array(n), out: number[] = []
        const view = (tone: Tones, caption = false) => graph(pos, ed, { tone, sub: caption ? Array.from(dep) : undefined, name: caption ? 'caption = depth' : undefined })
        for (const v of order) {
          dep[v] = par[v] < 0 ? 1 : dep[par[v]] + 1
          t.s('dfs', () => [[`Vertex ${v + 1}: depth ${dep[v]}${par[v] < 0 ? ' (the root).' : `, parent ${par[v] + 1}.`}`, `顶点 ${v + 1}：深度 ${dep[v]}${par[v] < 0 ? '（根）。' : `，父亲是 ${par[v] + 1}。`}`], view(tn({ act: v }), true)])
        }
        for (const [a, b] of qs) {
          let u = a, v = b, steps = 0
          if (dep[u] < dep[v]) [u, v] = [v, u]
          const q0 = `lca(${a + 1}, ${b + 1})`
          while (dep[u] > dep[v]) {
            const from = u
            u = par[u]; steps++
            const uu = u, vv = v
            t.s('lift', () => [[`${q0}: ${from + 1} is deeper, move it up to ${uu + 1}.`, `${q0}：${from + 1} 更深，把它上移到 ${uu + 1}。`], view(tn({ vis: from, act: uu, cmp: vv }), true)])
          }
          while (u !== v) {
            const fu = u, fv = v
            u = par[u]; v = par[v]; steps++
            const uu = u, vv = v
            t.s('climb', () => [[`${q0}: still different, both go up: ${fu + 1} → ${uu + 1}, ${fv + 1} → ${vv + 1}.`, `${q0}：仍然不同，一起上移：${fu + 1} → ${uu + 1}，${fv + 1} → ${vv + 1}。`], view(tn({ vis: [fu, fv], act: uu, cmp: vv }))])
          }
          out.push(u + 1)
          const ans = u, s = steps
          t.s('ans', () => [[`${q0} = ${ans + 1}, after ${s} step(s).`, `${q0} = ${ans + 1}，共走了 ${s} 步。`], view(tn({ cmp: [a, b], ok: ans }))])
        }
        t.out(out.join('\n'))
      },
    },
  },

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
