import type { L, Tone, Tones, Variant } from '../../engine/types'
import { adjOf, arr, graph, grid, gt, INF, inf, need, readGraph, span, tn, toEdges, vars } from '../../engine/h'
import { lay, readTreeQ } from './lessons'

const cpp = String.raw

/**
 * Versions to learn first: the lesson's own method before one optimisation.
 * `label` names the lesson's own version next to it. The rule and the list are in specs/earlier-versions.md.
 */
export const FIRST: Record<string, { first: Variant; label: L }> = {
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
}
