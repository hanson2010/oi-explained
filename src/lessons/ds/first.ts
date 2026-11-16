import type { GEdge, L, Tones, Variant } from '../../engine/types'
import { arr, graph, layoutBin, layoutForest, need, reader, span, tn, vars } from '../../engine/h'

const cpp = String.raw

/**
 * Versions to learn first: the lesson's own method before one optimisation.
 * `label` names the lesson's own version next to it. The rule and the list are in specs/earlier-versions.md.
 */
export const FIRST: Record<string, { first: Variant; label: L }> = {
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
}
