import type { Lesson, Rng, Tone, Tones } from '../engine/types'
import { adjOf, arr, fmtGraph, genGraph, genTree, graph, grid, gt, Heap, INF, inf, layoutGraph, layoutTree, need, parentsOf, readGraph, span, tn, toEdges, vars, type E, type P } from '../engine/h'

const cpp = String.raw
const edgesFor = (n: number) => (n <= 30 ? n + (n >> 1) : 2 * n)
const genW = (n: number, r: Rng) => fmtGraph(n, genGraph(n, edgesFor(n), r).map(([u, v]) => [u, v, r.int(1, 9)]))
const genU = (n: number, r: Rng) => fmtGraph(n, genGraph(n, edgesFor(n), r))
export const lay = (on: boolean, n: number, es: readonly E[]): P[] => (on ? layoutGraph(n, es) : [])
const PAL: Tone[] = ['ok', 'alt', 'cmp', 'vis', 'bad', 'act']
const NM: Lesson['input'] = ['n m, then m lines "u v": an undirected edge.', 'n m，随后 m 行 “u v”：一条无向边。']
const NMW: Lesson['input'] = ['n m, then m lines "u v w": an undirected edge of weight w.', 'n m，随后 m 行 “u v w”：一条权值为 w 的无向边。']

const gdfs: Lesson = {
  id: 'graph-dfs', title: ['Depth-first traversal', '图的深度优先遍历'], level: 'J', cat: 'graph', diff: 4,
  blurb: ['Follow one edge as deep as it goes, and only come back when there is nowhere new to go.', '沿着一条边一直走到底，直到没有新顶点可去时才回头。'],
  ideas: [
    ['Adjacency list: g[u] holds the neighbours of u — O(n + m) memory instead of the O(n²) of a matrix.', '邻接表：g[u] 保存 u 的所有邻居——只占 O(n + m) 空间，而邻接矩阵要 O(n²)。'],
    ['Mark a vertex when you enter it, so cycles cannot trap you.', '进入顶点时立刻打标记，这样就不会在环里打转。'],
    ['Recursion does the backtracking for you: returning from dfs(v) resumes the scan of u\'s neighbours.', '递归自动完成回溯：从 dfs(v) 返回后，继续扫描 u 的其余邻居。'],
    ['Every vertex is entered once and every edge is looked at twice: O(n + m).', '每个顶点进入一次，每条边被查看两次：O(n + m)。'],
  ],
  time: 'O(n + m)', space: 'O(n + m)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, m;
vector<int> g[300005];
bool vis[300005];

void dfs(int u) {
    vis[u] = true;
    printf("%d ", u);  //@visit
    for (int v : g[u]) {
        if (vis[v]) continue;  //@skip
        dfs(v);  //@go
    }
}  //@back

int main() {
    scanf("%d%d", &n, &m);
    for (int i = 0; i < m; i++) {
        int u, v; scanf("%d%d", &u, &v);
        g[u].push_back(v); g[v].push_back(u);
    }
    dfs(1);
}`,
  notes: [
    ['visit', ['Marking before the loop is what prevents infinite recursion.', '在循环之前打标记，才能避免无限递归。']],
    ['skip', ['An edge to a visited vertex closes a cycle (or leads back to the parent).', '指向已访问顶点的边构成了环（或者是回到父亲的边）。']],
    ['back', ['All neighbours handled: return to whoever called us.', '所有邻居处理完毕：返回到调用者。']],
  ],
  input: [NM[0] + ' Prints the vertices reachable from 1 in DFS order.', NM[1] + ' 按 DFS 序输出从 1 可达的顶点。'],
  sizes: [6, 8, 10], lab: [10, 1000, 100000, 300000],
  gen: genU,
  run(inp, t) {
    const { n, es } = readGraph(inp), g = adjOf(n, es), pos = lay(t.on, n, es), ed = toEdges(es)
    const vis = new Uint8Array(n), it = new Int32Array(n), out: number[] = [], st = [0], tone: Tones = {}, et: Tones = {}
    const view = () => [graph(pos, ed, { tone: { ...tone, [st[st.length - 1]]: 'act' }, et }), arr('recursion stack', st.map(x => x + 1)), arr('output', out)] as const
    vis[0] = 1; out.push(1); tone[0] = 'vis'
    t.s('visit', () => [['Start at vertex 1.', '从顶点 1 出发。'], ...view()])
    while (st.length) {
      const u = st[st.length - 1]
      if (it[u] === g[u].length) {
        st.pop(); tone[u] = 'ok'
        if (st.length) t.s('back', () => [[`${u + 1} has no unvisited neighbour left: return to ${st[st.length - 1] + 1}.`, `${u + 1} 没有未访问的邻居了：返回 ${st[st.length - 1] + 1}。`], ...view()])
        continue
      }
      const [v, , e] = g[u][it[u]++]
      if (vis[v]) { t.s('skip', () => [[`${u + 1} → ${v + 1}: already visited, skip.`, `${u + 1} → ${v + 1}：已访问，跳过。`], graph(pos, ed, { tone: { ...tone, [u]: 'act', [v]: 'cmp' }, et: { ...et, [e]: et[e] ?? 'bad' } }), arr('recursion stack', st.map(x => x + 1)), arr('output', out)]); continue }
      vis[v] = 1; out.push(v + 1); tone[v] = 'vis'; et[e] = 'ok'; st.push(v)
      t.s('visit', () => [[`${u + 1} → ${v + 1}: new vertex, go deeper.`, `${u + 1} → ${v + 1}：新顶点，继续深入。`], ...view()])
    }
    t.out(out.join(' '))
  },
}

const gbfs: Lesson = {
  id: 'graph-bfs', title: ['Breadth-first traversal', '图的广度优先遍历'], level: 'J', cat: 'graph', diff: 4,
  blurb: ['Visit all neighbours first, then their neighbours: vertices come out in order of distance from the start.', '先访问所有邻居，再访问邻居的邻居：顶点按到起点的距离由近到远被访问。'],
  ideas: [
    ['Use a queue instead of recursion: take a vertex from the front, append its unvisited neighbours at the back.', '用队列代替递归：从队首取出顶点，把它未访问的邻居加到队尾。'],
    ['The queue always holds vertices of at most two consecutive distances, nearest first.', '队列中任何时刻只有至多两种相邻的距离，近的在前。'],
    ['Hence dist[v] = dist[u] + 1 at discovery is the shortest number of edges from the start.', '因此发现 v 时令 dist[v] = dist[u] + 1，得到的就是从起点出发的最少边数。'],
  ],
  time: 'O(n + m)', space: 'O(n + m)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, m, d[300005];
vector<int> g[300005];

int main() {
    scanf("%d%d", &n, &m);
    for (int i = 0; i < m; i++) {
        int u, v; scanf("%d%d", &u, &v);
        g[u].push_back(v); g[v].push_back(u);
    }
    memset(d, -1, sizeof d);
    queue<int> q;
    q.push(1); d[1] = 0;  //@start
    while (!q.empty()) {
        int u = q.front(); q.pop();
        printf("%d ", u);  //@pop
        for (int v : g[u])
            if (d[v] == -1) {
                d[v] = d[u] + 1;  //@push
                q.push(v);
            }
    }
}`,
  notes: [
    ['start', ['d = −1 means "not discovered".', 'd = −1 表示“尚未发现”。']],
    ['pop', ['Vertices leave the queue in non-decreasing order of distance.', '顶点按距离不降的顺序出队。']],
    ['push', ['Set the distance when pushing, so each vertex enters the queue once.', '入队时就确定距离，保证每个顶点只入队一次。']],
  ],
  input: [NM[0] + ' Prints the vertices reachable from 1 in BFS order.', NM[1] + ' 按 BFS 序输出从 1 可达的顶点。'],
  sizes: [6, 8, 10], lab: [10, 1000, 100000, 300000],
  gen: genU,
  run(inp, t) {
    const { n, es } = readGraph(inp), g = adjOf(n, es), pos = lay(t.on, n, es), ed = toEdges(es)
    const d = new Int32Array(n).fill(-1), q = [0], out: number[] = [], tone: Tones = { 0: 'cmp' }, et: Tones = {}
    const view = (h: number, cur: number) => [graph(pos, ed, { tone: { ...tone, [cur]: 'act' }, et, sub: Array.from(d, x => (x < 0 ? undefined : x)), name: 'caption = distance from vertex 1' }), arr('queue', q.slice(h).map(x => x + 1)), arr('output', out)] as const
    d[0] = 0
    t.s('start', () => [['Push vertex 1 with distance 0.', '顶点 1 入队，距离为 0。'], ...view(0, 0)])
    for (let h = 0; h < q.length; h++) {
      const u = q[h]
      out.push(u + 1); tone[u] = 'ok'
      t.s('pop', () => [[`Pop ${u + 1} (distance ${d[u]}).`, `取出 ${u + 1}（距离 ${d[u]}）。`], ...view(h + 1, u)])
      for (const [v, , e] of g[u]) if (d[v] === -1) {
        d[v] = d[u] + 1; q.push(v); tone[v] = 'cmp'; et[e] = 'ok'
        t.s('push', () => [[`${u + 1} → ${v + 1}: new, distance ${d[v]}, push.`, `${u + 1} → ${v + 1}：新顶点，距离 ${d[v]}，入队。`], ...view(h + 1, u)])
      }
    }
    t.out(out.join(' '))
  },
}

const dijkstra: Lesson = {
  id: 'dijkstra', title: ["Dijkstra's shortest paths", 'Dijkstra 最短路'], level: 'S', cat: 'graph', diff: 6,
  blurb: ['Repeatedly settle the closest unsettled vertex and relax its edges. Needs non-negative weights.', '反复取出距离最小的未确定顶点，并松弛它的出边。要求边权非负。'],
  ideas: [
    ['d[v] is the best distance found so far; it only ever decreases.', 'd[v] 是目前找到的最短距离，只会减小。'],
    ['Greedy step: the unsettled vertex with the smallest d is final — any other route would pass through a vertex that is already at least as far.', '贪心：未确定顶点中 d 最小的那个已经是最终值——任何其他路线都要先经过一个不比它近的顶点。'],
    ['That argument breaks with negative edges, which is why Dijkstra forbids them.', '有负权边时这个论证不成立，所以 Dijkstra 不能处理负权。'],
    ['Relaxing edge (u, v, w): if d[u] + w < d[v], update d[v] and push it into the heap.', '松弛边 (u, v, w)：若 d[u] + w < d[v]，更新 d[v] 并把它压入堆。'],
    ['The heap may hold outdated entries for a vertex; skip them when popped.', '堆里可能留有某个顶点的过期记录，弹出时跳过即可。'],
  ],
  time: 'O(m log m)', space: 'O(n + m)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

typedef pair<long long, int> P;
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
    priority_queue<P, vector<P>, greater<P>> pq;
    d[1] = 0; pq.push({0, 1});  //@init
    while (!pq.empty()) {
        auto [du, u] = pq.top(); pq.pop();
        if (done[u]) continue;  //@stale
        done[u] = true;  //@settle
        for (auto [v, w] : g[u])
            if (du + w < d[v]) {
                d[v] = du + w;  //@relax
                pq.push({d[v], v});
            }
    }
    for (int i = 1; i <= n; i++) printf("%lld ", d[i] > 1e18 ? -1 : d[i]);  //@done
}`,
  notes: [
    ['init', ['greater<P> makes a min-heap ordered by distance.', 'greater<P> 让堆按距离从小到大弹出。']],
    ['stale', ['This vertex was already settled through a shorter entry.', '这个顶点已经通过更短的记录确定过了。']],
    ['settle', ['du is now the true shortest distance of u.', '此时 du 就是 u 的真实最短距离。']],
    ['relax', ['Push a new entry rather than updating the old one — std::priority_queue has no decrease-key.', '直接压入新记录而不是修改旧记录——std::priority_queue 不支持减小键值。']],
  ],
  input: [NMW[0] + ' Prints the shortest distance from vertex 1 to every vertex (−1 if unreachable).', NMW[1] + ' 输出从顶点 1 到每个顶点的最短距离（不可达输出 −1）。'],
  sizes: [5, 7, 9], lab: [10, 1000, 100000, 200000],
  gen: genW,
  run(inp, t) {
    const { n, es } = readGraph(inp, true), g = adjOf(n, es), pos = lay(t.on, n, es), ed = toEdges(es, true)
    for (const e of es) need(e[2] >= 0, 'Dijkstra needs non-negative weights.', 'Dijkstra 要求边权非负。')
    const d = new Array<number>(n).fill(INF), done = new Uint8Array(n), from = new Int32Array(n).fill(-1)
    const pq = new Heap<[number, number]>((a, b) => a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]))
    const view = (cur: number, hi: Tones = {}, ehi: Tones = {}) => {
      const tone: Tones = {}, et: Tones = {}
      for (let i = 0; i < n; i++) { if (done[i]) tone[i] = 'ok'; else if (d[i] < INF) tone[i] = 'cmp'; if (from[i] >= 0) et[from[i]] = done[i] ? 'ok' : 'cmp' }
      if (cur >= 0) tone[cur] = 'act'
      return [graph(pos, ed, { tone: { ...tone, ...hi }, et: { ...et, ...ehi }, sub: d.map(inf), name: 'caption = d[v]' }), arr('heap (distance:vertex)', pq.a.slice().sort((a, b) => a[0] - b[0]).slice(0, 12).map(x => `${x[0]}:${x[1] + 1}`))] as const
    }
    d[0] = 0; pq.push([0, 0])
    t.s('init', () => [['d[1] = 0, everything else ∞.', 'd[1] = 0，其余为 ∞。'], ...view(-1)])
    while (pq.size) {
      const [du, u] = pq.pop()
      if (done[u]) { t.s('stale', () => [[`Pop (${du}, ${u + 1}): vertex ${u + 1} is already settled — skip.`, `弹出 (${du}, ${u + 1})：顶点 ${u + 1} 已确定——跳过。`], ...view(-1, { [u]: 'dim' })]); continue }
      done[u] = 1
      t.s('settle', () => [[`Pop (${du}, ${u + 1}): the smallest distance, so d[${u + 1}] = ${du} is final.`, `弹出 (${du}, ${u + 1})：距离最小，d[${u + 1}] = ${du} 已确定。`], ...view(u)])
      for (const [v, w, e] of g[u]) if (du + w < d[v]) {
        const old = d[v]
        d[v] = du + w; from[v] = e; pq.push([d[v], v])
        t.s('relax', () => [[`Relax ${u + 1} → ${v + 1}: ${du} + ${w} = ${d[v]} < ${inf(old)}, update d[${v + 1}].`, `松弛 ${u + 1} → ${v + 1}：${du} + ${w} = ${d[v]} < ${inf(old)}，更新 d[${v + 1}]。`], ...view(u, { [v]: 'alt' }, { [e]: 'act' })])
      }
    }
    t.s('done', () => [['The heap is empty: all distances are final.', '堆已空：所有距离都已确定。'], ...view(-1)])
    t.out(d.map(x => (x >= INF ? -1 : x)).join(' '))
  },
}

const spfa: Lesson = {
  id: 'spfa', title: ['Bellman-Ford & SPFA', 'Bellman-Ford 与 SPFA'], level: 'S', cat: 'graph', diff: 6,
  blurb: ['Relax edges until nothing changes — correct even with negative weights. SPFA only re-relaxes from vertices whose distance just improved.', '不断松弛直到没有变化——有负权边也正确。SPFA 只从距离刚被改进的顶点出发重新松弛。'],
  ideas: [
    ['Bellman-Ford: relax all m edges, n − 1 times. A shortest path has at most n − 1 edges, so that is enough.', 'Bellman-Ford：把全部 m 条边松弛 n − 1 轮。最短路至多 n − 1 条边，所以足够了。'],
    ['SPFA is the queue-based version: an edge out of u can only help if d[u] changed since last time.', 'SPFA 是它的队列优化：只有 d[u] 发生过变化，u 的出边才可能带来改进。'],
    ['Keep an "in queue" flag so a vertex is not queued twice at once.', '用“是否在队列中”的标记，避免同一顶点同时在队列里出现两次。'],
    ['A vertex entering the queue n times reveals a negative cycle.', '某个顶点入队达到 n 次，说明存在负环。'],
    ['Worst case is still O(n · m); on non-negative graphs prefer Dijkstra.', '最坏情况仍是 O(n · m)；边权非负时应优先使用 Dijkstra。'],
  ],
  time: 'O(n · m) worst case', space: 'O(n + m)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, m;
vector<pair<int, int>> g[300005];
long long d[300005];
bool inq[300005];

int main() {
    scanf("%d%d", &n, &m);
    for (int i = 0; i < m; i++) {
        int u, v, w; scanf("%d%d%d", &u, &v, &w);
        g[u].push_back({v, w});
    }
    memset(d, 0x3f, sizeof d);
    queue<int> q;
    d[1] = 0; q.push(1); inq[1] = true;  //@init
    while (!q.empty()) {
        int u = q.front(); q.pop();
        inq[u] = false;  //@pop
        for (auto [v, w] : g[u])
            if (d[u] + w < d[v]) {
                d[v] = d[u] + w;  //@relax
                if (!inq[v]) q.push(v), inq[v] = true;
            }
    }
    for (int i = 1; i <= n; i++) {
        if (d[i] > 1e18) printf("inf ");
        else printf("%lld ", d[i]);  //@done
    }
}`,
  notes: [
    ['pop', ['Clear the flag on leaving: the vertex may need to enter again later.', '出队时清除标记：这个顶点之后可能还要再次入队。']],
    ['relax', ['Unlike Dijkstra, a distance here can be improved several times.', '与 Dijkstra 不同，这里一个顶点的距离可能被多次改进。']],
  ],
  input: ['n m, then m lines "u v w": a directed edge u → v of weight w (may be negative; no negative cycles). Prints the distances from vertex 1 ("inf" if unreachable).', 'n m，随后 m 行 “u v w”：一条权值为 w 的有向边 u → v（可以为负；无负环）。输出从顶点 1 出发的最短距离（不可达输出 “inf”）。'],
  sizes: [5, 6, 8], lab: [10, 1000, 30000, 100000],
  gen(n, r) {
    // Weights w + p[u] − p[v] with w ≥ 1: every cycle keeps its positive total, so no negative cycle.
    const p = r.ints(n, 0, 5)
    return fmtGraph(n, genGraph(n, edgesFor(n), r).map(([u, v], i) => { const [a, b] = i < n - 1 || r.next() < 0.5 ? [u, v] : [v, u]; return [a, b, r.int(1, 8) + p[a] - p[b]] }))
  },
  run(inp, t) {
    const { n, es } = readGraph(inp, true), g = adjOf(n, es, true), pos = lay(t.on, n, es), ed = toEdges(es, true, true)
    const d = new Array<number>(n).fill(INF), inq = new Uint8Array(n), cnt = new Int32Array(n), q = [0]
    let h = 0
    const view = (cur: number, hi: Tones = {}, ehi: Tones = {}) => {
      const tone: Tones = {}
      for (let i = 0; i < n; i++) if (inq[i]) tone[i] = 'cmp'
      if (cur >= 0) tone[cur] = 'act'
      return [graph(pos, ed, { tone: { ...tone, ...hi }, et: ehi, sub: d.map(inf), name: 'caption = d[v]' }), arr('queue', q.slice(h, h + 14).map(x => x + 1))] as const
    }
    d[0] = 0; inq[0] = 1
    t.s('init', () => [['d[1] = 0; push vertex 1.', 'd[1] = 0；顶点 1 入队。'], ...view(-1)])
    while (h < q.length) {
      const u = q[h++]
      inq[u] = 0
      t.s('pop', () => [[`Pop ${u + 1} (d = ${d[u]}) and try its outgoing edges.`, `取出 ${u + 1}（d = ${d[u]}），尝试它的出边。`], ...view(u)])
      for (const [v, w, e] of g[u]) if (d[u] + w < d[v]) {
        const old = d[v], push = !inq[v]
        d[v] = d[u] + w
        if (push) { q.push(v); inq[v] = 1; need(++cnt[v] <= n, 'Negative cycle detected.', '检测到负环。') }
        t.s('relax', () => [[`${u + 1} → ${v + 1}: ${d[u]} + (${w}) = ${d[v]} < ${inf(old)}. Update${push ? ' and push ' + (v + 1) : ' (already queued)'}.`, `${u + 1} → ${v + 1}：${d[u]} + (${w}) = ${d[v]} < ${inf(old)}。更新${push ? '并让 ' + (v + 1) + ' 入队' : '（已在队列中）'}。`], ...view(u, { [v]: 'alt' }, { [e]: 'act' })])
      }
    }
    t.s('done', () => [['The queue is empty: no edge can improve anything.', '队列已空：没有任何边还能带来改进。'], ...view(-1, tn({ ok: span(0, n - 1).filter(i => d[i] < INF) }))])
    t.out(d.map(x => (x >= INF ? 'inf' : x)).join(' '))
  },
}

const floyd: Lesson = {
  id: 'floyd', title: ['Floyd-Warshall', 'Floyd-Warshall 算法'], level: 'S', cat: 'graph', diff: 6,
  blurb: ['All-pairs shortest paths by dynamic programming: allow one more intermediate vertex at a time.', '用动态规划求所有点对的最短路：每次多允许一个中转顶点。'],
  ideas: [
    ['Store the graph as an adjacency matrix d[i][j] (∞ if no edge, 0 on the diagonal).', '用邻接矩阵 d[i][j] 存图（无边为 ∞，对角线为 0）。'],
    ['After round k, d[i][j] is the shortest path from i to j using only vertices 1..k in between.', '第 k 轮之后，d[i][j] 是只允许经过 1..k 作为中转点时 i 到 j 的最短路。'],
    ['Transition: either avoid k, or go i → k → j: d[i][j] = min(d[i][j], d[i][k] + d[k][j]).', '转移：要么不经过 k，要么走 i → k → j：d[i][j] = min(d[i][j], d[i][k] + d[k][j])。'],
    ['k must be the outermost loop — it is the DP stage.', 'k 必须放在最外层循环——它是 DP 的阶段。'],
    ['Handles negative edges (no negative cycles); only practical for n up to a few hundred.', '可以处理负权边（无负环）；只适用于 n 不超过几百的图。'],
  ],
  time: 'O(n³)', space: 'O(n²)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, m;
long long d[505][505];

int main() {
    scanf("%d%d", &n, &m);
    memset(d, 0x3f, sizeof d);
    for (int i = 1; i <= n; i++) d[i][i] = 0;
    for (int i = 0; i < m; i++) {
        int u, v; long long w; scanf("%d%d%lld", &u, &v, &w);
        d[u][v] = min(d[u][v], w); d[v][u] = min(d[v][u], w);  //@init
    }
    for (int k = 1; k <= n; k++)  //@pivot
        for (int i = 1; i <= n; i++)
            for (int j = 1; j <= n; j++)
                if (d[i][k] + d[k][j] < d[i][j])
                    d[i][j] = d[i][k] + d[k][j];  //@relax
    for (int i = 1; i <= n; i++, puts(""))
        for (int j = 1; j <= n; j++) printf("%lld ", d[i][j] > 1e18 ? -1 : d[i][j]);
}`,
  notes: [
    ['init', ['min() keeps the lightest of parallel edges.', '用 min() 在重边中保留最轻的一条。']],
    ['pivot', ['The intermediate vertex goes outermost; swapping the loops gives wrong answers.', '中转点放在最外层；循环顺序换了答案就错了。']],
    ['relax', ['Row k and column k do not change during round k, so updating in place is safe.', '第 k 轮中第 k 行和第 k 列不会改变，所以原地更新是安全的。']],
  ],
  input: [NMW[0] + ' Prints the n × n matrix of shortest distances (−1 if unreachable).', NMW[1] + ' 输出 n × n 的最短距离矩阵（不可达输出 −1）。'],
  sizes: [4, 5, 6], lab: [10, 50, 100, 200],
  gen: (n, r) => fmtGraph(n, genGraph(n, n + 1, r).map(([u, v]) => [u, v, r.int(1, 9)])),
  run(inp, t) {
    const { n, es } = readGraph(inp, true)
    need(n <= 500, 'n must be at most 500.', 'n 不能超过 500。')
    const d: number[][] = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : INF)))
    for (const [u, v, w] of es) { d[u][v] = Math.min(d[u][v], w); d[v][u] = Math.min(d[v][u], w) }
    const hd = span(1, n)
    const view = (tone: Record<string, Tone>) => grid('d[i][j]', d.map(r => r.map(inf)), tone, { rows: hd, cols: hd })
    const line = (k: number) => span(0, n - 1).flatMap(x => [[k, x], [x, k]] as [number, number][])
    t.s('init', () => [['Start from the adjacency matrix: only direct edges.', '从邻接矩阵开始：只有直接相连的边。'], view({})])
    for (let k = 0; k < n; k++) {
      t.s('pivot', () => [[`Round k = ${k + 1}: may paths now pass through vertex ${k + 1}?`, `第 k = ${k + 1} 轮：现在允许经过顶点 ${k + 1} 中转。`], view(gt({ vis: line(k) })), vars({ k: k + 1 })])
      for (let i = 0; i < n; i++) {
        if (i === k || d[i][k] >= INF) continue
        for (let j = 0; j < n; j++) {
          if (j === k || j === i || d[k][j] >= INF) continue
          const via = d[i][k] + d[k][j], old = d[i][j], better = via < old
          if (better) d[i][j] = via
          t.s('relax', () => [[`${i + 1} → ${k + 1} → ${j + 1}: ${d[i][k]} + ${d[k][j]} = ${via} ${better ? '<' : '≥'} ${inf(old)}${better ? ' — improved.' : '.'}`, `${i + 1} → ${k + 1} → ${j + 1}：${d[i][k]} + ${d[k][j]} = ${via} ${better ? '<' : '≥'} ${inf(old)}${better ? '——更新。' : '。'}`], view({ ...gt({ vis: line(k) }), ...gt({ cmp: [[i, k], [k, j]], [better ? 'ok' : 'act']: [[i, j]] }) }), vars({ k: k + 1, i: i + 1, j: j + 1 })])
        }
      }
    }
    t.out(d.map(r => r.map(x => (x >= INF ? -1 : x)).join(' ')).join('\n'))
  },
}

const prim: Lesson = {
  id: 'prim', title: ["Prim's minimum spanning tree", 'Prim 最小生成树'], level: 'S', cat: 'graph', diff: 6,
  blurb: ['Grow one tree from a start vertex, always adding the cheapest edge that leaves it.', '从一个起点开始让一棵树不断生长，每次加入离开这棵树的最便宜的边。'],
  ideas: [
    ['A spanning tree connects all n vertices with n − 1 edges; we want the smallest total weight.', '生成树用 n − 1 条边连通全部 n 个顶点；我们要总权值最小的那棵。'],
    ['Cut property: the lightest edge crossing between the tree and the rest is always safe to add.', '切割性质：横跨“树内”与“树外”的最轻的边一定可以安全地加入。'],
    ['Keep the candidate edges in a min-heap keyed by weight; discard entries whose endpoint already joined.', '把候选边按权值放进小根堆；端点已经在树里的记录直接丢弃。'],
    ['Structurally it is Dijkstra with "edge weight" in place of "distance so far".', '结构上它就是把“当前距离”换成“边权”的 Dijkstra。'],
  ],
  time: 'O(m log m)', space: 'O(n + m)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

typedef pair<int, int> P;
int n, m;
vector<P> g[300005];
bool in[300005];

int main() {
    scanf("%d%d", &n, &m);
    for (int i = 0; i < m; i++) {
        int u, v, w; scanf("%d%d%d", &u, &v, &w);
        g[u].push_back({v, w}); g[v].push_back({u, w});
    }
    priority_queue<P, vector<P>, greater<P>> pq;
    pq.push({0, 1});  //@init
    long long total = 0;
    while (!pq.empty()) {
        auto [w, u] = pq.top(); pq.pop();
        if (in[u]) continue;  //@stale
        in[u] = true; total += w;  //@add
        for (auto [v, c] : g[u])
            if (!in[v]) pq.push({c, v});  //@push
    }
    printf("%lld\n", total);  //@done
}`,
  notes: [
    ['init', ['A fake edge of weight 0 brings the start vertex in.', '用一条权值为 0 的虚拟边把起点带进来。']],
    ['stale', ['Both endpoints are inside the tree: this edge would close a cycle.', '两个端点都已在树内：这条边会成环。']],
    ['add', ['The lightest edge leaving the tree — safe by the cut property.', '离开这棵树的最轻的边——由切割性质可知它是安全的。']],
  ],
  input: [NMW[0] + ' The graph is connected. Prints the weight of a minimum spanning tree.', NMW[1] + ' 图连通。输出最小生成树的权值。'],
  sizes: [5, 7, 9], lab: [10, 1000, 100000, 200000],
  gen: genW,
  run(inp, t) {
    const { n, es } = readGraph(inp, true), g = adjOf(n, es), pos = lay(t.on, n, es), ed = toEdges(es, true)
    const inT = new Uint8Array(n), et: Tones = {}
    const pq = new Heap<[number, number, number]>((a, b) => a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]))
    let total = 0
    const view = (hi: Tones = {}, ehi: Tones = {}) => [graph(pos, ed, { tone: { ...tn({ ok: span(0, n - 1).filter(i => inT[i]) }), ...hi }, et: { ...et, ...ehi } }), arr('heap (weight→vertex)', pq.a.slice().sort((a, b) => a[0] - b[0]).slice(0, 12).map(x => `${x[0]}→${x[1] + 1}`)), vars({ total })] as const
    pq.push([0, 0, -1])
    t.s('init', () => [['Start the tree at vertex 1.', '从顶点 1 开始建树。'], ...view()])
    while (pq.size) {
      const [w, u, e] = pq.pop()
      if (inT[u]) { t.s('stale', () => [[`Edge of weight ${w} to ${u + 1}: ${u + 1} is already in the tree — skip.`, `权值 ${w}、通向 ${u + 1} 的边：${u + 1} 已在树内——跳过。`], ...view({ [u]: 'cmp' }, e >= 0 ? { [e]: 'bad' } : {})]); continue }
      inT[u] = 1; total += w
      if (e >= 0) et[e] = 'ok'
      t.s('add', () => [e >= 0 ? [`Lightest edge leaving the tree has weight ${w}: add vertex ${u + 1}.`, `离开树的最轻的边权值为 ${w}：加入顶点 ${u + 1}。`] : ['Vertex 1 joins the tree.', '顶点 1 加入树。'], ...view({ [u]: 'act' })])
      for (const [v, c, id] of g[u]) if (!inT[v]) {
        pq.push([c, v, id])
        t.s('push', () => [[`Candidate edge ${u + 1} – ${v + 1} (weight ${c}) enters the heap.`, `候选边 ${u + 1} – ${v + 1}（权值 ${c}）进入堆。`], ...view({ [u]: 'act', [v]: 'cmp' }, { [id]: 'cmp' })])
      }
    }
    t.s('done', () => [[`Minimum spanning tree weight: ${total}.`, `最小生成树权值：${total}。`], ...view()])
    t.out(total)
  },
}

const kruskal: Lesson = {
  id: 'kruskal', title: ["Kruskal's minimum spanning tree", 'Kruskal 最小生成树'], level: 'S', cat: 'graph', diff: 6,
  blurb: ['Sort the edges by weight and add each one unless it would close a cycle — a union-find tells you instantly.', '把边按权值排序，逐条加入，会成环的就跳过——并查集可以瞬间判断。'],
  ideas: [
    ['Consider edges from lightest to heaviest.', '按从轻到重的顺序考虑每条边。'],
    ['An edge whose endpoints are already connected would create a cycle: skip it.', '如果一条边的两个端点已经连通，加入它就会成环：跳过。'],
    ['Otherwise it is the lightest edge between two components — safe by the cut property — so take it and merge them.', '否则它是连接两个连通块的最轻的边——由切割性质可知安全——选中它并合并两个连通块。'],
    ['Stop after n − 1 edges. Sorting dominates: O(m log m).', '选满 n − 1 条边即可停止。排序是主要开销：O(m log m)。'],
  ],
  time: 'O(m log m)', space: 'O(n + m)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

struct Edge { int u, v, w; } e[600005];

int n, m, fa[300005];

int find(int x) { return fa[x] == x ? x : fa[x] = find(fa[x]); }

int main() {
    scanf("%d%d", &n, &m);
    for (int i = 0; i < m; i++) scanf("%d%d%d", &e[i].u, &e[i].v, &e[i].w);
    sort(e, e + m, [](const Edge &a, const Edge &b) { return a.w < b.w; });  //@sort
    for (int i = 1; i <= n; i++) fa[i] = i;
    long long total = 0;
    for (int i = 0; i < m; i++) {
        int a = find(e[i].u), b = find(e[i].v);
        if (a == b) continue;  //@skip
        fa[a] = b;
        total += e[i].w;  //@take
    }
    printf("%lld\n", total);  //@done
}`,
  notes: [
    ['sort', ['A lambda comparator sorts the structs by weight.', '用 lambda 比较函数按权值给结构体排序。']],
    ['skip', ['Same root means already connected: the edge would close a cycle.', '根相同说明已经连通：这条边会成环。']],
    ['take', ['Merging the two sets records that the components are now one.', '合并两个集合，表示两个连通块已经合二为一。']],
  ],
  input: [NMW[0] + ' The graph is connected. Prints the weight of a minimum spanning tree.', NMW[1] + ' 图连通。输出最小生成树的权值。'],
  sizes: [5, 7, 9], lab: [10, 1000, 100000, 200000],
  gen: genW,
  run(inp, t) {
    const { n, m, es } = readGraph(inp, true), pos = lay(t.on, n, es), ed = toEdges(es, true)
    const ord = span(0, m - 1).sort((a, b) => es[a][2] - es[b][2] || a - b), fa = span(0, n - 1), et: Tones = {}
    const find = (x: number) => { let r = x; while (fa[r] !== r) r = fa[r]; while (fa[x] !== r) { const nx = fa[x]; fa[x] = r; x = nx } return r }
    let total = 0, taken = 0
    const list = (k: number) => arr('edges by weight', ord.slice(0, 16).map(i => `${es[i][0] + 1}-${es[i][1] + 1}:${es[i][2]}`), tn({ dim: span(0, k - 1), act: k }))
    const comp = () => { const tone: Tones = {}, id = new Map<number, number>(); for (let i = 0; i < n; i++) { const r = find(i); if (!id.has(r)) id.set(r, id.size); tone[i] = PAL[id.get(r)! % PAL.length] } return tone }
    t.s('sort', () => [[`Sort the ${m} edges by weight.`, `把 ${m} 条边按权值排序。`], graph(pos, ed), list(-1)])
    for (let k = 0; k < m; k++) {
      const [u, v, w] = es[ord[k]], a = find(u), b = find(v)
      if (a === b) { et[ord[k]] = 'dim'; t.s('skip', () => [[`Edge ${u + 1} – ${v + 1} (${w}): both ends are already connected — skip.`, `边 ${u + 1} – ${v + 1}（${w}）：两端已经连通——跳过。`], graph(pos, ed, { tone: comp(), et: { ...et, [ord[k]]: 'bad' }, name: 'colour = component' }), list(k), vars({ total })]); continue }
      fa[a] = b; total += w; taken++; et[ord[k]] = 'ok'
      t.s('take', () => [[`Edge ${u + 1} – ${v + 1} (${w}) joins two components: take it.`, `边 ${u + 1} – ${v + 1}（${w}）连接两个连通块：选中。`], graph(pos, ed, { tone: comp(), et, name: 'colour = component' }), list(k), vars({ total, edges: taken })])
    }
    t.s('done', () => [[`Minimum spanning tree weight: ${total}.`, `最小生成树权值：${total}。`], graph(pos, ed, { tone: tn({ ok: span(0, n - 1) }), et }), vars({ total })])
    t.out(total)
  },
}

const topo: Lesson = {
  id: 'topo-sort', title: ['Topological sort', '拓扑排序'], level: 'S', cat: 'graph', diff: 6,
  blurb: ['Order the vertices of a DAG so every edge points forward: repeatedly remove a vertex with no incoming edges.', '给有向无环图的顶点排序，使每条边都从前指向后：不断删去入度为 0 的顶点。'],
  ideas: [
    ['A vertex with in-degree 0 depends on nothing, so it can go first.', '入度为 0 的顶点不依赖任何其他顶点，可以排在最前面。'],
    ['Removing it lowers the in-degree of its successors; any that hit 0 become available.', '删去它会让后继顶点的入度减少；入度变为 0 的顶点随即可用。'],
    ['A queue of available vertices makes this O(n + m) (Kahn\'s algorithm).', '用队列保存可用顶点，整个过程 O(n + m)（Kahn 算法）。'],
    ['If fewer than n vertices come out, the rest are stuck on a cycle: the graph is not a DAG.', '如果输出的顶点少于 n 个，剩下的都卡在环上：这个图不是 DAG。'],
    ['DP on a DAG is done in exactly this order.', 'DAG 上的动态规划正是按这个顺序进行的。'],
  ],
  time: 'O(n + m)', space: 'O(n + m)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, m, deg[300005];
vector<int> g[300005], order;

int main() {
    scanf("%d%d", &n, &m);
    for (int i = 0; i < m; i++) {
        int u, v; scanf("%d%d", &u, &v);
        g[u].push_back(v); deg[v]++;
    }
    queue<int> q;
    for (int i = 1; i <= n; i++) if (!deg[i]) q.push(i);  //@init
    while (!q.empty()) {
        int u = q.front(); q.pop();
        order.push_back(u);  //@pop
        for (int v : g[u])
            if (--deg[v] == 0) q.push(v);  //@dec
    }
    if ((int)order.size() < n) puts("-1");  //@cycle
    else for (int u : order) printf("%d ", u);  //@done
}`,
  notes: [
    ['init', ['Every DAG has at least one vertex without incoming edges.', '任何 DAG 都至少有一个入度为 0 的顶点。']],
    ['dec', ['"Remove" u by decrementing; no edge is actually deleted.', '通过减小入度来“删除” u；并没有真的删边。']],
    ['cycle', ['Vertices on a cycle never reach in-degree 0.', '环上的顶点入度永远不会降到 0。']],
  ],
  input: ['n m, then m lines "u v": a directed edge u → v. Prints a topological order, or −1 if there is a cycle.', 'n m，随后 m 行 “u v”：一条有向边 u → v。输出一个拓扑序；若有环输出 −1。'],
  sizes: [6, 8, 10], lab: [10, 1000, 100000, 300000],
  gen(n, r) {
    const perm = r.shuffle(span(0, n - 1))
    return fmtGraph(n, genGraph(n, edgesFor(n), r).map(([u, v]) => [perm[u], perm[v]]))
  },
  run(inp, t) {
    const { n, es } = readGraph(inp), g = adjOf(n, es, true), pos = lay(t.on, n, es), ed = toEdges(es, false, true)
    const deg = new Int32Array(n), q: number[] = [], out: number[] = [], et: Tones = {}, tone: Tones = {}
    for (const e of es) deg[e[1]]++
    const view = (h: number, hi: Tones = {}) => [graph(pos, ed, { tone: { ...tone, ...hi }, et, sub: Array.from(deg), name: 'caption = in-degree' }), arr('queue', q.slice(h).map(x => x + 1)), arr('order', out)] as const
    for (let i = 0; i < n; i++) if (!deg[i]) { q.push(i); tone[i] = 'cmp' }
    t.s('init', () => [[`Vertices with in-degree 0 start in the queue: ${q.map(x => x + 1).join(', ') || 'none'}.`, `入度为 0 的顶点先入队：${q.map(x => x + 1).join('、') || '无'}。`], ...view(0)])
    for (let h = 0; h < q.length; h++) {
      const u = q[h]
      out.push(u + 1); tone[u] = 'ok'
      t.s('pop', () => [[`Output ${u + 1} and remove its outgoing edges.`, `输出 ${u + 1}，并删去它的出边。`], ...view(h + 1, { [u]: 'act' })])
      for (const [v, , e] of g[u]) {
        et[e] = 'dim'
        const zero = --deg[v] === 0
        if (zero) { q.push(v); tone[v] = 'cmp' }
        t.s('dec', () => [[`${u + 1} → ${v + 1}: in-degree of ${v + 1} drops to ${deg[v]}${zero ? ' — push it.' : '.'}`, `${u + 1} → ${v + 1}：${v + 1} 的入度降为 ${deg[v]}${zero ? '——入队。' : '。'}`], ...view(h + 1, { [u]: 'act', [v]: zero ? 'cmp' : 'alt' })])
      }
    }
    if (out.length < n) { t.s('cycle', () => [[`Only ${out.length} of ${n} vertices came out: the rest lie on a cycle.`, `${n} 个顶点只输出了 ${out.length} 个：其余顶点在环上。`], ...view(q.length, tn({ bad: span(0, n - 1).filter(i => deg[i] > 0) }))]); t.out(-1); return }
    t.s('done', () => [['All vertices are ordered: every edge points forward.', '所有顶点都已排好：每条边都从前指向后。'], ...view(q.length)])
    t.out(out.join(' '))
  },
}

const bipartite: Lesson = {
  id: 'bipartite', title: ['Bipartite check', '二分图的判定'], level: 'S', cat: 'graph', diff: 6,
  blurb: ['Try to 2-colour the graph with BFS; an edge between two vertices of the same colour is an odd cycle.', '用 BFS 尝试对图进行二染色；一旦出现两端同色的边，就找到了奇环。'],
  ideas: [
    ['A graph is bipartite if its vertices split into two groups with every edge going between the groups.', '如果能把顶点分成两组，使每条边都连接不同的组，这个图就是二分图。'],
    ['Equivalent: the vertices can be coloured with two colours so that neighbours differ.', '等价说法：可以用两种颜色给顶点染色，使相邻顶点颜色不同。'],
    ['Colour a start vertex, then give every neighbour the opposite colour — the choice is forced.', '先给起点染色，然后把每个邻居染成相反的颜色——没有别的选择。'],
    ['A conflict means an odd cycle, and a graph is bipartite exactly when it has none.', '发生冲突意味着存在奇环；一个图是二分图当且仅当它没有奇环。'],
    ['Remember to start a new search in every connected component.', '别忘了对每个连通块都要重新开始一次搜索。'],
  ],
  time: 'O(n + m)', space: 'O(n + m)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, m, col[300005];
vector<int> g[300005];

int main() {
    scanf("%d%d", &n, &m);
    for (int i = 0; i < m; i++) {
        int u, v; scanf("%d%d", &u, &v);
        g[u].push_back(v); g[v].push_back(u);
    }
    for (int s = 1; s <= n; s++) {
        if (col[s]) continue;
        queue<int> q;
        q.push(s); col[s] = 1;  //@seed
        while (!q.empty()) {
            int u = q.front(); q.pop();
            for (int v : g[u]) {
                if (!col[v]) {
                    col[v] = 3 - col[u];  //@color
                    q.push(v);
                } else if (col[v] == col[u]) {
                    puts("No");  //@conflict
                    return 0;
                }
            }
        }
    }
    puts("Yes");  //@done
}`,
  notes: [
    ['seed', ['An uncoloured vertex starts a new component; its colour is arbitrary.', '未染色的顶点代表一个新的连通块；它的颜色可以任意选。']],
    ['color', ['3 − c flips between colours 1 and 2.', '3 − c 在颜色 1 和 2 之间翻转。']],
    ['conflict', ['Two neighbours with the same colour: the two paths back to the seed form an odd cycle.', '相邻两点同色：它们各自回到起点的路径拼成一个奇环。']],
  ],
  input: [NM[0] + ' Prints Yes if the graph is bipartite, otherwise No.', NM[1] + ' 是二分图输出 Yes，否则输出 No。'],
  sizes: [6, 8, 10], lab: [10, 1000, 100000, 300000],
  gen(n, r) {
    if (r.next() < 0.4) return genU(n, r)
    const side = r.ints(n, 0, 1), seen = new Set<number>(), es: number[][] = []
    for (let k = 0; k < edgesFor(n) * 4 && es.length < edgesFor(n) - 1; k++) {
      const u = r.int(0, n - 1), v = Math.min(n - 1, Math.max(0, u + r.int(-3, 3)))
      if (side[u] === side[v] || seen.has(Math.min(u, v) * n + Math.max(u, v))) continue
      seen.add(Math.min(u, v) * n + Math.max(u, v)); es.push([u, v])
    }
    return fmtGraph(n, es)
  },
  run(inp, t) {
    const { n, es } = readGraph(inp), g = adjOf(n, es), pos = lay(t.on, n, es), ed = toEdges(es)
    const col = new Uint8Array(n), et: Tones = {}
    const view = (hi: Tones = {}, ehi: Tones = {}) => { const tone: Tones = {}; for (let i = 0; i < n; i++) if (col[i]) tone[i] = col[i] === 1 ? 'cmp' : 'alt'; return graph(pos, ed, { tone: { ...tone, ...hi }, et: { ...et, ...ehi } }) }
    for (let s = 0; s < n; s++) {
      if (col[s]) continue
      const q = [s]
      col[s] = 1
      t.s('seed', () => [[`Vertex ${s + 1} is uncoloured: start a component, colour it blue.`, `顶点 ${s + 1} 尚未染色：开始一个新连通块，染成蓝色。`], view({ [s]: 'act' })])
      for (let h = 0; h < q.length; h++) {
        const u = q[h]
        for (const [v, , e] of g[u]) {
          if (!col[v]) {
            col[v] = 3 - col[u]; q.push(v); et[e] = 'ok'
            t.s('color', () => [[`${u + 1} – ${v + 1}: give ${v + 1} the opposite colour.`, `${u + 1} – ${v + 1}：把 ${v + 1} 染成相反的颜色。`], view()])
          } else if (col[v] === col[u]) {
            t.s('conflict', () => [[`${u + 1} and ${v + 1} are neighbours with the same colour: an odd cycle. Not bipartite.`, `${u + 1} 和 ${v + 1} 相邻却同色：存在奇环，不是二分图。`], view({ [u]: 'bad', [v]: 'bad' }, { [e]: 'bad' })])
            t.out('No'); return
          }
        }
      }
    }
    t.s('done', () => [['Every edge joins two different colours: bipartite.', '每条边都连接两种不同的颜色：是二分图。'], view()])
    t.out('Yes')
  },
}

const tarjan: Lesson = {
  id: 'tarjan-scc', title: ['Strongly connected components (Tarjan)', '强连通分量（Tarjan）'], level: 'S', cat: 'graph', diff: 7,
  blurb: ['One DFS with a stack: a vertex whose low-link equals its own index is the root of a component, and everything above it on the stack belongs to it.', '一次带栈的 DFS：若某顶点的 low 等于自己的 dfn，它就是一个分量的根，栈中在它之上的顶点都属于这个分量。'],
  ideas: [
    ['Strongly connected: every vertex can reach every other. Components partition the graph; contracting them leaves a DAG.', '强连通：任意两点互相可达。强连通分量把图划分开；把每个分量缩成一点后得到 DAG。'],
    ['dfn[u] = order of first visit. low[u] = the smallest dfn reachable from u\'s subtree through at most one non-tree edge to a vertex still on the stack.', 'dfn[u] = 首次访问的时间戳。low[u] = 从 u 的子树出发，至多经过一条指向栈中顶点的非树边，所能到达的最小 dfn。'],
    ['Tree edge u → v: after returning, low[u] = min(low[u], low[v]).', '树边 u → v：返回后 low[u] = min(low[u], low[v])。'],
    ['Edge to a vertex on the stack: low[u] = min(low[u], dfn[v]). Edges to finished components are ignored.', '指向栈中顶点的边：low[u] = min(low[u], dfn[v])。指向已完成分量的边不予理会。'],
    ['If low[u] == dfn[u], nothing in u\'s subtree escapes above u: pop the stack down to u — that is one component.', '若 low[u] == dfn[u]，u 的子树无法逃到 u 之上：把栈弹到 u 为止——这就是一个分量。'],
  ],
  time: 'O(n + m)', space: 'O(n + m)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, m, dfn[300005], low[300005], id[300005], st[300005], tp, idx, scc;
bool in[300005];
vector<int> g[300005];

void tarjan(int u) {
    dfn[u] = low[u] = ++idx;
    st[++tp] = u; in[u] = true;  //@visit
    for (int v : g[u]) {
        if (!dfn[v]) {
            tarjan(v);
            low[u] = min(low[u], low[v]);  //@tree
        } else if (in[v]) {
            low[u] = min(low[u], dfn[v]);  //@back
        }
    }
    if (low[u] == dfn[u]) {
        scc++;
        int v;
        do { v = st[tp--]; in[v] = false; id[v] = scc; } while (v != u);  //@pop
    }
}

int main() {
    scanf("%d%d", &n, &m);
    for (int i = 0; i < m; i++) {
        int u, v; scanf("%d%d", &u, &v);
        g[u].push_back(v);
    }
    for (int i = 1; i <= n; i++) if (!dfn[i]) tarjan(i);
    printf("%d\n", scc);  //@done
}`,
  notes: [
    ['visit', ['Every vertex goes on the stack when first seen and leaves only as part of a finished component.', '每个顶点首次访问时入栈，只有作为某个完成的分量的一部分时才出栈。']],
    ['tree', ['Whatever the child can reach, the parent can reach through it.', '孩子能到达的地方，父亲通过孩子也能到达。']],
    ['back', ['Only vertices still on the stack count; a vertex already popped belongs to another component.', '只有仍在栈中的顶点才算数；已出栈的顶点属于别的分量。']],
    ['pop', ['u is the first-visited vertex of its component; everything above it on the stack is the rest.', 'u 是它所在分量中最先被访问的顶点；栈中在它之上的就是分量的其余顶点。']],
  ],
  input: ['n m, then m lines "u v": a directed edge u → v. Prints the number of strongly connected components.', 'n m，随后 m 行 “u v”：一条有向边 u → v。输出强连通分量的个数。'],
  sizes: [5, 7, 9], lab: [10, 1000, 100000, 300000],
  gen: (n, r) => fmtGraph(n, genGraph(n, edgesFor(n), r).map(([u, v]) => (r.next() < 0.6 ? [u, v] : [v, u]))),
  run(inp, t) {
    const { n, es } = readGraph(inp), g = adjOf(n, es, true), pos = lay(t.on, n, es), ed = toEdges(es, false, true)
    const dfn = new Int32Array(n), low = new Int32Array(n), id = new Int32Array(n), onst = new Uint8Array(n), it = new Int32Array(n), st: number[] = [], et: Tones = {}
    let idx = 0, scc = 0
    const view = (hi: Tones = {}, ehi: Tones = {}) => {
      const tone: Tones = {}
      for (let i = 0; i < n; i++) if (id[i]) tone[i] = PAL[(id[i] - 1) % 4]; else if (onst[i]) tone[i] = 'act'
      return [graph(pos, ed, { tone: { ...tone, ...hi }, et: { ...et, ...ehi }, sub: Array.from(dfn, (d, i) => (d ? `${d}/${low[i]}` : undefined)), name: 'caption = dfn/low' }), arr('stack', st.map(x => x + 1)), vars({ scc })] as const
    }
    for (let s = 0; s < n; s++) {
      if (dfn[s]) continue
      const call = [s]
      dfn[s] = low[s] = ++idx; st.push(s); onst[s] = 1
      t.s('visit', () => [[`Visit ${s + 1}: dfn = low = ${dfn[s]}, push it.`, `访问 ${s + 1}：dfn = low = ${dfn[s]}，入栈。`], ...view()])
      while (call.length) {
        const u = call[call.length - 1]
        if (it[u] < g[u].length) {
          const [v, , e] = g[u][it[u]++]
          if (!dfn[v]) {
            dfn[v] = low[v] = ++idx; st.push(v); onst[v] = 1; call.push(v); et[e] = 'ok'
            t.s('visit', () => [[`Tree edge ${u + 1} → ${v + 1}: dfn = low = ${dfn[v]}, push it.`, `树边 ${u + 1} → ${v + 1}：dfn = low = ${dfn[v]}，入栈。`], ...view()])
          } else if (onst[v]) {
            low[u] = Math.min(low[u], dfn[v])
            t.s('back', () => [[`${u + 1} → ${v + 1} reaches a vertex on the stack: low[${u + 1}] = min(low, dfn[${v + 1}]) = ${low[u]}.`, `${u + 1} → ${v + 1} 指向栈中的顶点：low[${u + 1}] = min(low, dfn[${v + 1}]) = ${low[u]}。`], ...view({ [v]: 'cmp' }, { [e]: 'cmp' })])
          }
          continue
        }
        call.pop()
        if (low[u] === dfn[u]) {
          scc++
          const members: number[] = []
          for (let v = -1; v !== u;) { v = st.pop()!; onst[v] = 0; id[v] = scc; members.push(v + 1) }
          t.s('pop', () => [[`low[${u + 1}] = dfn[${u + 1}]: pop component {${members.join(', ')}}.`, `low[${u + 1}] = dfn[${u + 1}]：弹出一个分量 {${members.join(', ')}}。`], ...view()])
        }
        if (call.length) {
          const p = call[call.length - 1]
          low[p] = Math.min(low[p], low[u])
          t.s('tree', () => [[`Back in ${p + 1}: low[${p + 1}] = min(low[${p + 1}], low[${u + 1}]) = ${low[p]}.`, `回到 ${p + 1}：low[${p + 1}] = min(low[${p + 1}], low[${u + 1}]) = ${low[p]}。`], ...view({ [p]: 'cmp' })])
        }
      }
    }
    t.s('done', () => [[`${scc} strongly connected component(s).`, `共 ${scc} 个强连通分量。`], ...view()])
    t.out(scc)
  },
}

const cutBridge: Lesson = {
  id: 'cut-bridge', title: ['Cut vertices and bridges', '割点与割边'], level: 'S', cat: 'graph', diff: 7,
  blurb: ['Use dfn and low on an undirected graph: a child subtree that cannot climb above its parent is cut off when the parent (or the edge) is removed.', '在无向图上用 dfn 和 low：如果某棵子树爬不到父亲之上，删掉父亲（或那条边）它就会被断开。'],
  ideas: [
    ['A cut vertex (bridge) is a vertex (edge) whose removal disconnects the graph.', '割点（割边）是删除后会使图不再连通的顶点（边）。'],
    ['low[v] = the smallest dfn that v\'s subtree can reach using at most one back edge.', 'low[v] = v 的子树至多经过一条返祖边所能到达的最小 dfn。'],
    ['Tree edge u – v is a bridge when low[v] > dfn[u]: the subtree cannot even get back to u.', '树边 u – v 是割边，当且仅当 low[v] > dfn[u]：子树连 u 都回不去。'],
    ['Non-root u is a cut vertex when some child has low[v] ≥ dfn[u]: that subtree cannot get above u.', '非根顶点 u 是割点，当且仅当存在孩子 v 满足 low[v] ≥ dfn[u]：那棵子树越不过 u。'],
    ['The root is a cut vertex exactly when it has two or more DFS children.', '根是割点，当且仅当它在 DFS 树中有两个或更多孩子。'],
  ],
  time: 'O(n + m)', space: 'O(n + m)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, m, dfn[300005], low[300005], idx, bridges;
bool cut[300005];
vector<pair<int, int>> g[300005];

void dfs(int u, int pe) {
    dfn[u] = low[u] = ++idx;  //@visit
    int child = 0;
    for (auto [v, e] : g[u]) {
        if (e == pe) continue;
        if (!dfn[v]) {
            child++;
            dfs(v, e);
            low[u] = min(low[u], low[v]);  //@tree
            if (low[v] > dfn[u]) bridges++;  //@bridge
            if (pe != -1 && low[v] >= dfn[u]) cut[u] = true;  //@cut
        } else {
            low[u] = min(low[u], dfn[v]);  //@back
        }
    }
    if (pe == -1 && child >= 2) cut[u] = true;  //@root
}

int main() {
    scanf("%d%d", &n, &m);
    for (int i = 0; i < m; i++) {
        int u, v; scanf("%d%d", &u, &v);
        g[u].push_back({v, i}); g[v].push_back({u, i});
    }
    for (int i = 1; i <= n; i++) if (!dfn[i]) dfs(i, -1);
    int cuts = 0;
    for (int i = 1; i <= n; i++) cuts += cut[i];
    printf("%d %d\n", cuts, bridges);  //@done
}`,
  notes: [
    ['visit', ['pe is the index of the edge we arrived by; skipping it by index (not by parent vertex) handles parallel edges correctly.', 'pe 是进入本顶点所走的那条边的编号；按边编号（而不是父顶点）跳过，才能正确处理重边。']],
    ['bridge', ['Strictly greater: the subtree has no back edge reaching u or above.', '严格大于：子树没有任何返祖边能到达 u 或更高处。']],
    ['cut', ['Greater or equal: reaching u itself does not help once u is deleted.', '大于等于：u 被删掉后，能回到 u 本身也无济于事。']],
    ['root', ['The root has no ancestor, so the low test does not apply to it.', '根没有祖先，所以 low 的判据对它不适用。']],
  ],
  input: [NM[0] + ' Prints the number of cut vertices and the number of bridges.', NM[1] + ' 输出割点数和割边数。'],
  sizes: [6, 8, 10], lab: [10, 1000, 100000, 300000],
  gen: (n, r) => fmtGraph(n, genGraph(n, n <= 30 ? n + 1 : n + (n >> 2), r)),
  run(inp, t) {
    const { n, es } = readGraph(inp), g = adjOf(n, es), pos = lay(t.on, n, es), ed = toEdges(es)
    const dfn = new Int32Array(n), low = new Int32Array(n), it = new Int32Array(n), pe = new Int32Array(n).fill(-1), child = new Int32Array(n), cut = new Uint8Array(n), et: Tones = {}
    let idx = 0, bridges = 0
    const view = (hi: Tones = {}, ehi: Tones = {}) => {
      const tone: Tones = {}
      for (let i = 0; i < n; i++) if (cut[i]) tone[i] = 'bad'; else if (dfn[i]) tone[i] = 'vis'
      return [graph(pos, ed, { tone: { ...tone, ...hi }, et: { ...et, ...ehi }, sub: Array.from(dfn, (d, i) => (d ? `${d}/${low[i]}` : undefined)), name: 'caption = dfn/low; red = cut vertex / bridge' }), vars({ 'cut vertices': cut.reduce((s, x) => s + x, 0), bridges })] as const
    }
    for (let s = 0; s < n; s++) {
      if (dfn[s]) continue
      const call = [s]
      dfn[s] = low[s] = ++idx
      t.s('visit', () => [[`Root ${s + 1}: dfn = low = ${dfn[s]}.`, `根 ${s + 1}：dfn = low = ${dfn[s]}。`], ...view({ [s]: 'act' })])
      while (call.length) {
        const u = call[call.length - 1]
        if (it[u] < g[u].length) {
          const [v, , e] = g[u][it[u]++]
          if (e === pe[u]) continue
          if (!dfn[v]) {
            child[u]++; pe[v] = e; dfn[v] = low[v] = ++idx; call.push(v); et[e] = 'ok'
            t.s('visit', () => [[`Tree edge ${u + 1} – ${v + 1}: dfn = low = ${dfn[v]}.`, `树边 ${u + 1} – ${v + 1}：dfn = low = ${dfn[v]}。`], ...view({ [v]: 'act' })])
          } else {
            low[u] = Math.min(low[u], dfn[v])
            t.s('back', () => [[`Back edge ${u + 1} – ${v + 1}: low[${u + 1}] = min(low, dfn[${v + 1}]) = ${low[u]}.`, `返祖边 ${u + 1} – ${v + 1}：low[${u + 1}] = min(low, dfn[${v + 1}]) = ${low[u]}。`], ...view({ [u]: 'act', [v]: 'cmp' }, { [e]: et[e] ?? 'cmp' })])
          }
          continue
        }
        call.pop()
        if (!call.length) {
          if (child[u] >= 2) { cut[u] = 1; t.s('root', () => [[`Root ${u + 1} has ${child[u]} DFS children: it is a cut vertex.`, `根 ${u + 1} 有 ${child[u]} 个 DFS 孩子：它是割点。`], ...view()]) }
          continue
        }
        const p = call[call.length - 1], e = pe[u]
        low[p] = Math.min(low[p], low[u])
        if (low[u] > dfn[p]) {
          bridges++; et[e] = 'bad'
          if (pe[p] !== -1) cut[p] = 1
          t.s('bridge', () => [[`low[${u + 1}] = ${low[u]} > dfn[${p + 1}] = ${dfn[p]}: edge ${p + 1} – ${u + 1} is a bridge.`, `low[${u + 1}] = ${low[u]} > dfn[${p + 1}] = ${dfn[p]}：边 ${p + 1} – ${u + 1} 是割边。`], ...view({ [u]: 'cmp' })])
        } else if (pe[p] !== -1 && low[u] >= dfn[p]) {
          cut[p] = 1
          t.s('cut', () => [[`low[${u + 1}] = ${low[u]} ≥ dfn[${p + 1}] = ${dfn[p]}: removing ${p + 1} cuts off the subtree of ${u + 1}.`, `low[${u + 1}] = ${low[u]} ≥ dfn[${p + 1}] = ${dfn[p]}：删掉 ${p + 1} 会把 ${u + 1} 的子树断开。`], ...view({ [u]: 'cmp' })])
        } else {
          t.s('tree', () => [[`Back in ${p + 1}: low[${p + 1}] = min(low[${p + 1}], low[${u + 1}]) = ${low[p]}.`, `回到 ${p + 1}：low[${p + 1}] = min(low[${p + 1}], low[${u + 1}]) = ${low[p]}。`], ...view({ [p]: 'act', [u]: 'cmp' })])
        }
      }
    }
    const cuts = cut.reduce((s, x) => s + x, 0)
    t.s('done', () => [[`${cuts} cut vertex/vertices and ${bridges} bridge(s).`, `共 ${cuts} 个割点、${bridges} 条割边。`], ...view()])
    t.out(`${cuts} ${bridges}`)
  },
}

/** Reads "n q", n − 1 tree edges and q vertex pairs. Returns BFS order and parents (root 0). */
export function readTreeQ(inp: string, on: boolean) {
  const rd0 = inp.split(/\s+/).filter(Boolean).map(Number), n = rd0[0], q = rd0[1]
  need(n >= 1 && q >= 0 && rd0.length >= 2 + 2 * (n - 1) + 2 * q && rd0.every(Number.isFinite), 'Expected "n q", n − 1 edges and q queries.', '需要 “n q”、n − 1 条边和 q 个询问。')
  const es: E[] = []
  for (let i = 0; i < n - 1; i++) { const u = rd0[2 + 2 * i] - 1, v = rd0[3 + 2 * i] - 1; need(u >= 0 && u < n && v >= 0 && v < n, 'Vertex out of range.', '顶点编号越界。'); es.push([u, v, 1]) }
  const qs: [number, number][] = []
  for (let i = 0; i < q; i++) { const u = rd0[2 * n + 2 * i] - 1, v = rd0[2 * n + 1 + 2 * i] - 1; need(u >= 0 && u < n && v >= 0 && v < n, 'Vertex out of range.', '顶点编号越界。'); qs.push([u, v]) }
  const g = adjOf(n, es), par = parentsOf(n, es, 0)
  need(par.every(p => p !== -2), 'The edges must form a tree.', '这些边必须构成一棵树。')
  const order = [0]
  for (let h = 0; h < order.length; h++) for (const [v] of g[order[h]]) if (v !== par[order[h]]) order.push(v)
  return { n, es, qs, g, par, order, pos: on ? layoutTree(n, es, 0) : [], ed: toEdges(es) }
}
const genTreeQ = (n: number, r: Rng) => {
  const q = n <= 30 ? 3 : n
  return `${n} ${q}\n` + genTree(n, r).map(([u, v]) => `${u + 1} ${v + 1}`).join('\n') + (n > 1 ? '\n' : '') + Array.from({ length: q }, () => `${r.int(1, n)} ${r.int(1, n)}`).join('\n') + '\n'
}
const TREEQ: Lesson['input'] = ['n q, then n − 1 tree edges "u v", then q queries "u v". The root is vertex 1. Prints the LCA of each query.', 'n q，随后 n − 1 条树边 “u v”，再是 q 个询问 “u v”。根为顶点 1。输出每个询问的最近公共祖先。']

const lca: Lesson = {
  id: 'lca', title: ['LCA by binary lifting', '倍增求最近公共祖先'], level: 'S', cat: 'graph', diff: 6,
  blurb: ['Store every 2ʲ-th ancestor. Lift the deeper vertex level, then make both jump as far as possible without meeting.', '预存每个顶点的第 2ʲ 级祖先。先把较深的点提到同一深度，再让两点一起尽量往上跳而不相遇。'],
  ideas: [
    ['up[j][u] = the 2ʲ-th ancestor of u. Doubling: up[j][u] = up[j−1][ up[j−1][u] ].', 'up[j][u] = u 的第 2ʲ 级祖先。倍增：up[j][u] = up[j−1][ up[j−1][u] ]。'],
    ['Any jump of k levels is a few power-of-two jumps — the binary digits of k.', '向上跳 k 层可以拆成若干次 2 的幂次跳跃——对应 k 的二进制位。'],
    ['Step 1: lift the deeper vertex to the depth of the other.', '第一步：把较深的顶点提升到与另一个相同的深度。'],
    ['Step 2: from the largest j down, jump both whenever their 2ʲ-th ancestors differ. They stop just below the LCA.', '第二步：j 从大到小，只要两者的第 2ʲ 级祖先不同就一起跳。最终它们停在 LCA 的正下方。'],
    ['The same table answers k-th ancestor queries and, with extra values stored, path maximum or sum.', '同一张表还能回答第 k 级祖先；若附带存储信息，也能求路径最大值或路径和。'],
  ],
  time: 'O((n + q) log n)', space: 'O(n log n)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, q, dep[300005], up[20][300005];
vector<int> g[300005];

void dfs(int u, int p) {
    up[0][u] = p; dep[u] = dep[p] + 1;
    for (int j = 1; j < 20; j++) up[j][u] = up[j - 1][up[j - 1][u]];  //@dfs
    for (int v : g[u]) if (v != p) dfs(v, u);
}

int lca(int u, int v) {
    if (dep[u] < dep[v]) swap(u, v);
    for (int j = 19; j >= 0; j--)
        if (dep[up[j][u]] >= dep[v]) u = up[j][u];  //@lift
    if (u == v) return u;  //@same
    for (int j = 19; j >= 0; j--)
        if (up[j][u] != up[j][v]) u = up[j][u], v = up[j][v];  //@jump
    return up[0][u];  //@ans
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
    ['dfs', ['The parent\'s row is complete before the child\'s is filled. Vertex 0 is a sentinel above the root with depth 0.', '填孩子这一行时，父亲那一行已经填好。0 号是根上方的哨兵，深度为 0。']],
    ['lift', ['Jumps that would overshoot land on the sentinel (depth 0) and are rejected.', '跳过头会落到哨兵（深度 0）上，于是被拒绝。']],
    ['same', ['v was an ancestor of u.', 'v 本来就是 u 的祖先。']],
    ['jump', ['Never jump onto a common ancestor — only to just below the lowest one.', '绝不跳到公共祖先上——只跳到最低的那个公共祖先的正下方。']],
  ],
  input: TREEQ, sizes: [7, 10, 14], lab: [10, 1000, 100000, 200000],
  gen: genTreeQ,
  run(inp, t) {
    const { n, qs, par, order, pos, ed } = readTreeQ(inp, t.on)
    let LOG = 1
    while (1 << LOG < n) LOG++
    // Vertices are shifted by one so that index 0 is the sentinel above the root.
    const dep = new Int32Array(n + 1), up = Array.from({ length: LOG + 1 }, () => new Int32Array(n + 1)), out: number[] = []
    const view = (tone: Tones, caption = false) => graph(pos, ed, { tone, sub: caption ? Array.from(dep.subarray(1)) : undefined, name: caption ? 'caption = depth' : undefined })
    for (const v of order) {
      const u = v + 1
      up[0][u] = par[v] + 1; dep[u] = dep[up[0][u]] + 1
      for (let j = 1; j <= LOG; j++) up[j][u] = up[j - 1][up[j - 1][u]]
      t.s('dfs', () => [[`Vertex ${u}: depth ${dep[u]}; ancestors at 1, 2, 4… levels: ${up.map(r => r[u]).filter(Boolean).join(', ') || 'none'}.`, `顶点 ${u}：深度 ${dep[u]}；第 1、2、4…级祖先：${up.map(r => r[u]).filter(Boolean).join('、') || '无'}。`], view(tn({ ok: up.map(r => r[u] - 1).filter(x => x >= 0), act: v }), true)])
    }
    for (const [a, b] of qs) {
      let u = a + 1, v = b + 1
      if (dep[u] < dep[v]) [u, v] = [v, u]
      const q0 = `lca(${a + 1}, ${b + 1})`
      for (let j = LOG; j >= 0; j--) if (dep[up[j][u]] >= dep[v]) {
        const from = u
        u = up[j][u]
        t.s('lift', () => [[`${q0}: lift ${from} by 2^${j} = ${1 << j} to ${u} (target depth ${dep[v]}).`, `${q0}：把 ${from} 向上跳 2^${j} = ${1 << j} 层到 ${u}（目标深度 ${dep[v]}）。`], view(tn({ vis: from - 1, act: u - 1, cmp: v - 1 }), true)])
      }
      if (u === v) { out.push(u); t.s('same', () => [[`${q0}: both are now at ${u} — it is the LCA.`, `${q0}：两者在 ${u} 相遇——它就是 LCA。`], view(tn({ ok: u - 1 }))]); continue }
      for (let j = LOG; j >= 0; j--) if (up[j][u] !== up[j][v]) {
        const fu = u, fv = v
        u = up[j][u]; v = up[j][v]
        t.s('jump', () => [[`${q0}: the 2^${j}-th ancestors differ, so jump both: ${fu} → ${u}, ${fv} → ${v}.`, `${q0}：第 2^${j} 级祖先不同，一起跳：${fu} → ${u}，${fv} → ${v}。`], view(tn({ vis: [fu - 1, fv - 1], act: u - 1, cmp: v - 1 }))])
      }
      const ans = up[0][u]
      out.push(ans)
      t.s('ans', () => [[`${q0}: ${u} and ${v} sit just below the LCA, their parent ${ans}.`, `${q0}：${u} 和 ${v} 就在 LCA 的正下方，答案是它们的父亲 ${ans}。`], view(tn({ act: u - 1, cmp: v - 1, ok: ans - 1 }))])
    }
    t.out(out.join('\n'))
  },
}

const diameter: Lesson = {
  id: 'tree-diameter', title: ['Tree diameter', '树的直径'], level: 'S', cat: 'graph', diff: 6,
  blurb: ['Two searches: the farthest vertex from anywhere is one end of a diameter; the farthest vertex from that end is the other.', '两次搜索：从任意点出发最远的点一定是直径的一端；从这一端出发最远的点就是另一端。'],
  ideas: [
    ['The diameter is the longest path between two vertices of the tree.', '直径是树上两点之间最长的路径。'],
    ['Search from any vertex s and take the farthest vertex u.', '从任意顶点 s 出发搜索，取最远的顶点 u。'],
    ['Claim: u is an endpoint of some diameter. (Otherwise swapping an end of the real diameter for u would make it longer.)', '结论：u 一定是某条直径的端点。（否则把真正直径的一端换成 u，路径只会更长。）'],
    ['Search again from u; the farthest vertex v gives the diameter length d[v].', '再从 u 出发搜索一次；最远的顶点 v 给出直径长度 d[v]。'],
    ['The two-search trick needs non-negative edge weights; with negative weights use tree DP instead.', '两次搜索的做法要求边权非负；有负权时要改用树形 DP。'],
  ],
  time: 'O(n)', space: 'O(n)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, d[300005];
vector<int> g[300005];

int bfs(int s) {
    fill(d, d + n + 1, -1);
    queue<int> q;
    q.push(s); d[s] = 0;
    int far = s;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        if (d[u] > d[far]) far = u;  //@visit
        for (int v : g[u])
            if (d[v] < 0) d[v] = d[u] + 1, q.push(v);
    }
    return far;
}

int main() {
    scanf("%d", &n);
    for (int i = 1; i < n; i++) {
        int u, v; scanf("%d%d", &u, &v);
        g[u].push_back(v); g[v].push_back(u);
    }
    int u = bfs(1);  //@first
    int v = bfs(u);  //@second
    printf("%d\n", d[v]);  //@done
}`,
  notes: [
    ['visit', ['Track the farthest vertex while the search runs.', '搜索过程中顺便记录最远的顶点。']],
    ['first', ['The start is arbitrary; vertex 1 is as good as any.', '起点是任意的，用 1 号顶点就行。']],
    ['second', ['After this call d[] holds distances from u, so d[v] is the diameter.', '这次调用之后 d[] 是到 u 的距离，所以 d[v] 就是直径。']],
  ],
  input: ['n, then n − 1 tree edges "u v". Prints the number of edges on a longest path.', 'n，随后 n − 1 条树边 “u v”。输出最长路径上的边数。'],
  sizes: [7, 10, 14], lab: [10, 1000, 100000, 300000],
  gen: (n, r) => `${n}\n` + genTree(n, r).map(([u, v]) => `${u + 1} ${v + 1}`).join('\n') + '\n',
  run(inp, t) {
    const tk = inp.split(/\s+/).filter(Boolean).map(Number), n = tk[0]
    need(n >= 1 && tk.length >= 2 * n - 1 && tk.every(Number.isFinite), 'Expected n and n − 1 edges.', '需要 n 和 n − 1 条边。')
    const es = span(0, n - 2).map((i): E => [tk[1 + 2 * i] - 1, tk[2 + 2 * i] - 1, 1])
    for (const [u, v] of es) need(u >= 0 && u < n && v >= 0 && v < n, 'Vertex out of range.', '顶点编号越界。')
    need(parentsOf(n, es, 0).every(p => p !== -2), 'The edges must form a tree.', '这些边必须构成一棵树。')
    const g = adjOf(n, es), pos = t.on ? layoutTree(n, es, 0) : [], ed = toEdges(es), d = new Int32Array(n), from = new Int32Array(n)
    const bfs = (s: number, pass: number) => {
      d.fill(-1); d[s] = 0; from[s] = -1
      const q = [s]
      let far = s
      for (let h = 0; h < q.length; h++) {
        const u = q[h]
        if (d[u] > d[far]) far = u
        t.s('visit', () => [[`Search ${pass} from ${s + 1}: vertex ${u + 1} is at distance ${d[u]}; farthest so far is ${far + 1}.`, `第 ${pass} 次搜索（起点 ${s + 1}）：顶点 ${u + 1} 距离为 ${d[u]}；目前最远的是 ${far + 1}。`], graph(pos, ed, { tone: tn({ vis: q.slice(0, h + 1), cmp: s, act: u, ok: far }), sub: Array.from(d, x => (x < 0 ? undefined : x)), name: `caption = distance from ${s + 1}` })])
        for (const [v] of g[u]) if (d[v] < 0) { d[v] = d[u] + 1; from[v] = u; q.push(v) }
      }
      return far
    }
    const u = bfs(0, 1)
    t.s('first', () => [[`Farthest from 1 is ${u + 1}: it is one end of a diameter.`, `离 1 最远的是 ${u + 1}：它是直径的一个端点。`], graph(pos, ed, { tone: tn({ ok: u }) })])
    const v = bfs(u, 2)
    t.s('second', () => [[`Farthest from ${u + 1} is ${v + 1}: the other end.`, `离 ${u + 1} 最远的是 ${v + 1}：另一个端点。`], graph(pos, ed, { tone: tn({ ok: [u, v] }) })])
    t.s('done', () => {
      const path: number[] = [], on = new Set<number>()
      for (let x = v; x >= 0; x = from[x]) { path.push(x); on.add(x) }
      return [[`Diameter = ${d[v]} edges, along ${path.map(x => x + 1).join(' – ')}.`, `直径 = ${d[v]} 条边，路径为 ${path.map(x => x + 1).join(' – ')}。`], graph(pos, ed, { tone: tn({ ok: path }), et: Object.fromEntries(es.map((e, i) => [i, on.has(e[0]) && on.has(e[1]) ? 'ok' as const : undefined])) }), vars({ diameter: d[v] })]
    })
    t.out(d[v])
  },
}

const hld: Lesson = {
  id: 'hld', title: ['Heavy-light decomposition', '树链剖分'], level: 'N', cat: 'graph', diff: 8,
  blurb: ['Split the tree into heavy chains so that any root path crosses only O(log n) of them — then a path becomes a few array segments.', '把树剖成若干条重链，使任意一条到根的路径只跨过 O(log n) 条链——于是路径就变成了数组上的几段区间。'],
  ideas: [
    ['Heavy child: the child with the largest subtree. The edge to it is heavy, all others are light.', '重儿子：子树最大的那个孩子。连向它的边是重边，其余是轻边。'],
    ['Going down a light edge at least halves the subtree size, so a root path has at most log n light edges.', '每走一条轻边，子树大小至少减半，所以到根的路径上至多有 log n 条轻边。'],
    ['Heavy edges link up into chains; top[u] is the highest vertex of u\'s chain.', '重边首尾相连形成重链；top[u] 是 u 所在重链的顶端。'],
    ['Visit heavy children first: each chain gets consecutive dfn numbers, ready for a segment tree.', '优先遍历重儿子：每条重链的 dfn 连续，可以直接套线段树。'],
    ['LCA or path queries: while the chains differ, move the vertex whose chain top is deeper up to the parent of that top.', '求 LCA 或做路径查询：两点不在同一条链时，让链顶更深的那个点跳到链顶的父亲。'],
  ],
  time: 'O(n + q log n)', space: 'O(n)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, q, fa[300005], dep[300005], sz[300005], son[300005], top[300005], dfn[300005], cnt;
vector<int> g[300005];

void dfs1(int u, int p) {
    fa[u] = p; dep[u] = dep[p] + 1; sz[u] = 1;
    for (int v : g[u]) if (v != p) {
        dfs1(v, u);
        sz[u] += sz[v];
        if (sz[v] > sz[son[u]]) son[u] = v;
    }  //@size
}

void dfs2(int u, int t) {
    top[u] = t; dfn[u] = ++cnt;  //@chain
    if (son[u]) dfs2(son[u], t);
    for (int v : g[u])
        if (v != fa[u] && v != son[u]) dfs2(v, v);
}

int lca(int u, int v) {
    while (top[u] != top[v]) {
        if (dep[top[u]] < dep[top[v]]) swap(u, v);
        u = fa[top[u]];  //@jump
    }
    return dep[u] < dep[v] ? u : v;  //@ans
}

int main() {
    scanf("%d%d", &n, &q);
    for (int i = 1; i < n; i++) {
        int u, v; scanf("%d%d", &u, &v);
        g[u].push_back(v); g[v].push_back(u);
    }
    dfs1(1, 0); dfs2(1, 1);
    while (q--) {
        int u, v; scanf("%d%d", &u, &v);
        printf("%d\n", lca(u, v));
    }
}`,
  notes: [
    ['size', ['First pass: subtree sizes and the heavy child (sz[0] = 0, so the first child always qualifies).', '第一遍：求子树大小和重儿子（sz[0] = 0，所以第一个孩子一定会被选上）。']],
    ['chain', ['Second pass: the heavy child inherits the chain top; every light child starts a chain of its own.', '第二遍：重儿子继承链顶；每个轻儿子自己开一条新链。']],
    ['jump', ['Move the vertex with the deeper chain top — moving the other could jump past the LCA.', '跳链顶更深的那个点——跳另一个可能会越过 LCA。']],
    ['ans', ['On the same chain the shallower vertex is the LCA.', '在同一条链上时，深度较小的那个点就是 LCA。']],
  ],
  input: TREEQ, sizes: [8, 11, 14], lab: [10, 1000, 100000, 200000],
  gen: genTreeQ,
  run(inp, t) {
    const { n, es, qs, g, par, order, pos, ed } = readTreeQ(inp, t.on)
    const dep = new Int32Array(n), sz = new Int32Array(n).fill(1), son = new Int32Array(n).fill(-1), top = new Int32Array(n).fill(-1), dfn = new Int32Array(n), out: number[] = []
    const heavy = () => Object.fromEntries(es.map((e, i) => [i, son[e[0]] === e[1] || son[e[1]] === e[0] ? 'ok' as const : 'dim' as const]))
    const chains = () => { const tone: Tones = {}, id = new Map<number, number>(); for (const v of order) if (top[v] >= 0) { if (!id.has(top[v])) id.set(top[v], id.size); tone[v] = PAL[id.get(top[v])! % 4] } return tone }
    for (const v of order) if (par[v] >= 0) dep[v] = dep[par[v]] + 1
    for (let k = n - 1; k >= 0; k--) {
      const u = order[k]
      for (const [v] of g[u]) if (v !== par[u]) { sz[u] += sz[v]; if (son[u] < 0 || sz[v] > sz[son[u]]) son[u] = v }
      t.s('size', () => [[son[u] >= 0 ? `Vertex ${u + 1}: subtree size ${sz[u]}, heavy child ${son[u] + 1}.` : `Vertex ${u + 1} is a leaf: size 1.`, son[u] >= 0 ? `顶点 ${u + 1}：子树大小 ${sz[u]}，重儿子是 ${son[u] + 1}。` : `顶点 ${u + 1} 是叶子：大小为 1。`], graph(pos, ed, { tone: tn({ act: u, ...(son[u] >= 0 ? { ok: son[u] } : {}) }), et: heavy(), sub: Array.from(sz, (s, i) => (order.indexOf(i) >= k ? s : undefined)), name: 'caption = subtree size; thick = heavy edge' })])
    }
    let cnt = 0
    const st: [number, number][] = [[0, 0]]
    while (st.length) {
      const [u, tp] = st.pop()!
      top[u] = tp; dfn[u] = ++cnt
      t.s('chain', () => [[u === tp ? `Vertex ${u + 1} starts a new chain: dfn ${dfn[u]}.` : `Vertex ${u + 1} continues the chain of ${tp + 1}: dfn ${dfn[u]}.`, u === tp ? `顶点 ${u + 1} 开启一条新链：dfn ${dfn[u]}。` : `顶点 ${u + 1} 延续 ${tp + 1} 的链：dfn ${dfn[u]}。`], graph(pos, ed, { tone: { ...chains(), [u]: 'act' }, et: heavy(), sub: Array.from(dfn, x => x || undefined), name: 'colour = chain; caption = dfn' })])
      // Light children are pushed in reverse so they pop in adjacency order, after the heavy child.
      for (let k = g[u].length - 1; k >= 0; k--) { const v = g[u][k][0]; if (v !== par[u] && v !== son[u]) st.push([v, v]) }
      if (son[u] >= 0) st.push([son[u], tp])
    }
    for (const [a, b] of qs) {
      let u = a, v = b
      while (top[u] !== top[v]) {
        if (dep[top[u]] < dep[top[v]]) [u, v] = [v, u]
        const from = u
        u = par[top[u]]
        t.s('jump', () => [[`lca(${a + 1}, ${b + 1}): chains differ; ${from + 1}'s chain top ${top[from] + 1} is deeper, jump to its parent ${u + 1}.`, `lca(${a + 1}, ${b + 1})：不在同一条链；${from + 1} 的链顶 ${top[from] + 1} 更深，跳到链顶的父亲 ${u + 1}。`], graph(pos, ed, { tone: { ...chains(), [from]: 'bad', [u]: 'act', [v]: 'act' }, et: heavy(), name: 'colour = chain' })])
      }
      const ans = dep[u] < dep[v] ? u : v
      out.push(ans + 1)
      t.s('ans', () => [[`lca(${a + 1}, ${b + 1}): ${u + 1} and ${v + 1} share a chain; the shallower one, ${ans + 1}, is the LCA.`, `lca(${a + 1}, ${b + 1})：${u + 1} 和 ${v + 1} 在同一条链上；较浅的 ${ans + 1} 就是 LCA。`], graph(pos, ed, { tone: { ...chains(), [u]: 'act', [v]: 'act', [ans]: 'bad' }, et: heavy(), name: 'colour = chain' })])
    }
    t.out(out.join('\n'))
  },
}

const dinic: Lesson = {
  id: 'dinic', title: ['Maximum flow (Dinic)', '网络流：Dinic 最大流'], level: 'N', cat: 'graph', diff: 8,
  blurb: ['Layer the residual graph by BFS, push flow along level-increasing paths by DFS, and repeat until the sink is unreachable.', '用 BFS 给残量网络分层，用 DFS 沿层数递增的路径推流，重复直到汇点不可达。'],
  ideas: [
    ['Each edge has a capacity; flow leaves the source, is conserved at every other vertex, and arrives at the sink.', '每条边有容量；流量从源点出发，在其余顶点守恒，最终到达汇点。'],
    ['Residual graph: an edge with spare capacity can carry more, and every edge with flow has a reverse edge that can cancel it.', '残量网络：还有剩余容量的边可以继续走；每条有流量的边都有一条反向边，可以把流“退回去”。'],
    ['Reverse edges let the algorithm undo an earlier bad choice — without them greedy pushing gets stuck.', '反向边让算法有机会撤销之前不好的选择——没有它，贪心推流会卡住。'],
    ['Dinic: BFS assigns each vertex its distance from the source; DFS only follows edges that go exactly one level deeper.', 'Dinic：BFS 求出每个顶点到源点的距离；DFS 只走恰好深一层的边。'],
    ['The current-arc pointer skips edges that are already useless in this phase. At most n phases are needed.', '当前弧指针跳过本阶段中已经无用的边。最多需要 n 个阶段。'],
  ],
  time: 'O(n² · m)', space: 'O(n + m)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

struct E { int to, cap; };

int n, m, lv[5005], cur[5005];
vector<E> es;
vector<int> g[5005];

void add(int u, int v, int c) {
    g[u].push_back(es.size()); es.push_back({v, c});
    g[v].push_back(es.size()); es.push_back({u, 0});  //@add
}

bool bfs() {
    fill(lv, lv + n + 1, -1);
    queue<int> q;
    q.push(1); lv[1] = 0;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int id : g[u])
            if (es[id].cap > 0 && lv[es[id].to] < 0) lv[es[id].to] = lv[u] + 1, q.push(es[id].to);
    }
    return lv[n] >= 0;  //@bfs
}

int dfs(int u, int f) {
    if (u == n) return f;  //@aug
    for (int &i = cur[u]; i < (int)g[u].size(); i++) {
        int id = g[u][i];
        if (es[id].cap > 0 && lv[es[id].to] == lv[u] + 1) {
            int d = dfs(es[id].to, min(f, es[id].cap));
            if (d > 0) {
                es[id].cap -= d; es[id ^ 1].cap += d;  //@push
                return d;
            }
        }
    }
    return 0;
}

int main() {
    scanf("%d%d", &n, &m);
    for (int i = 0; i < m; i++) {
        int u, v, c; scanf("%d%d%d", &u, &v, &c);
        add(u, v, c);
    }
    long long flow = 0;
    while (bfs()) {
        fill(cur, cur + n + 1, 0);
        while (int f = dfs(1, INT_MAX)) flow += f;
    }
    printf("%lld\n", flow);  //@done
}`,
  notes: [
    ['add', ['Edges are stored in pairs, so id ^ 1 is always the reverse edge.', '边成对存储，所以 id ^ 1 永远是反向边。']],
    ['bfs', ['Only edges with remaining capacity count. If the sink has no level, the flow is maximum.', '只考虑还有剩余容量的边。如果汇点没有层号，当前流已是最大流。']],
    ['aug', ['f is the bottleneck of the path that led here.', 'f 是走到这里的这条路径上的瓶颈容量。']],
    ['push', ['Use up capacity forwards, give it back on the reverse edge.', '正向边消耗容量，反向边增加等量容量。']],
  ],
  input: ['n m, then m lines "u v c": a directed edge u → v with capacity c. Prints the maximum flow from vertex 1 to vertex n (n ≥ 2).', 'n m，随后 m 行 “u v c”：一条容量为 c 的有向边 u → v。输出从顶点 1 到顶点 n 的最大流（n ≥ 2）。'],
  sizes: [5, 6, 8], lab: [10, 100, 1000, 3000],
  gen: (n, r) => fmtGraph(Math.max(2, n), genGraph(Math.max(2, n), edgesFor(n), r).map(([u, v]) => [u, v, r.int(1, 9)])),
  run(inp, t) {
    const { n, m, es: raw } = readGraph(inp, true)
    need(n >= 2, 'n must be at least 2 (the source and the sink differ).', 'n 至少为 2（源点和汇点不同）。')
    for (const e of raw) need(e[2] >= 0, 'Capacities must be non-negative.', '容量必须非负。')
    const to: number[] = [], cap: number[] = [], g: number[][] = Array.from({ length: n }, () => [])
    for (const [u, v, c] of raw) { g[u].push(to.length); to.push(v); cap.push(c); g[v].push(to.length); to.push(u); cap.push(0) }
    const pos = lay(t.on, n, raw), lv = new Int32Array(n), cur = new Int32Array(n), S = 0, T = n - 1, path: number[] = []
    const view = (hi: Tones = {}, ehi: Tones = {}, levels = true) => graph(pos, raw.map(([u, v, c], i) => ({ u, v, dir: true, w: `${c - cap[2 * i]}/${c}`, tone: cap[2 * i] === 0 ? 'dim' as const : undefined })), { tone: { [S]: 'cmp', [T]: 'cmp', ...hi }, et: ehi, sub: levels ? Array.from(lv, x => (x < 0 ? '×' : 'L' + x)) : undefined, name: 'edge = flow/capacity; caption = BFS level' })
    const bfs = () => {
      lv.fill(-1); lv[S] = 0
      const q = [S]
      for (let h = 0; h < q.length; h++) for (const id of g[q[h]]) if (cap[id] > 0 && lv[to[id]] < 0) { lv[to[id]] = lv[q[h]] + 1; q.push(to[id]) }
      return lv[T] >= 0
    }
    const dfs = (u: number, f: number): number => {
      if (u === T) {
        t.s('aug', () => [[`Found a path to the sink with bottleneck ${f}: ${[S, ...path.map(id => to[id])].map(x => x + 1).join(' → ')}.`, `找到一条到汇点的路径，瓶颈为 ${f}：${[S, ...path.map(id => to[id])].map(x => x + 1).join(' → ')}。`], view(tn({ act: [S, ...path.map(id => to[id])] }), Object.fromEntries(path.filter(id => id % 2 === 0).map(id => [id >> 1, 'act' as const])))])
        return f
      }
      for (; cur[u] < g[u].length; cur[u]++) {
        const id = g[u][cur[u]]
        if (cap[id] > 0 && lv[to[id]] === lv[u] + 1) {
          path.push(id)
          const d = dfs(to[id], Math.min(f, cap[id]))
          path.pop()
          if (d > 0) { cap[id] -= d; cap[id ^ 1] += d; return d }
        }
      }
      return 0
    }
    let flow = 0, phase = 0
    while (bfs()) {
      phase++
      t.s('bfs', () => [[`Phase ${phase}: BFS levels on edges with spare capacity; the sink is at level ${lv[T]}.`, `第 ${phase} 阶段：在有剩余容量的边上 BFS 分层；汇点在第 ${lv[T]} 层。`], view(), vars({ flow })])
      cur.fill(0)
      for (let f; (f = dfs(S, INF)) > 0;) {
        flow += f
        const got = f
        t.s('push', () => [[`Push ${got} unit(s) along it. Total flow: ${flow}.`, `沿这条路径推 ${got} 单位流量。总流量：${flow}。`], view(), vars({ flow })])
      }
    }
    t.s('done', () => [[`The sink is no longer reachable in the residual graph: maximum flow = ${flow}.`, `残量网络中汇点已不可达：最大流 = ${flow}。`], view({}, {}, true), vars({ flow, edges: m })])
    t.out(flow)
  },
}

const hungarian: Lesson = {
  id: 'hungarian', title: ['Bipartite matching (Hungarian algorithm)', '二分图最大匹配（匈牙利算法）'], level: 'N', cat: 'graph', diff: 8,
  blurb: ['For each left vertex look for an augmenting path: take a free partner, or ask the current owner of a partner to move elsewhere.', '为每个左部点寻找增广路：要么找到空闲的右部点，要么请占用者“让一让”，换到别处去。'],
  ideas: [
    ['A matching is a set of edges with no shared endpoints; we want as many as possible.', '匹配是一组没有公共端点的边；我们要让匹配的边尽量多。'],
    ['Augmenting path: starts at an unmatched left vertex, alternates unmatched / matched edges, ends at an unmatched right vertex.', '增广路：从未匹配的左部点出发，非匹配边和匹配边交替出现，终止于未匹配的右部点。'],
    ['Flipping every edge on that path increases the matching by one.', '把这条路上的边全部取反，匹配数就增加 1。'],
    ['dfs(u): for each neighbour v not yet tried in this round — if v is free, or its owner can be rematched by dfs(owner), give v to u.', 'dfs(u)：对本轮尚未尝试过的每个邻居 v——若 v 空闲，或 v 的占用者能通过 dfs 另找到对象，就把 v 配给 u。'],
    ['Berge\'s theorem: a matching is maximum exactly when no augmenting path exists.', 'Berge 定理：匹配是最大匹配，当且仅当不存在增广路。'],
  ],
  time: 'O(n · m)', space: 'O(n + m)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int nl, nr, m, match[5005];
bool vis[5005];
vector<int> g[5005];

bool dfs(int u) {
    for (int v : g[u]) {
        if (vis[v]) continue;
        vis[v] = true;  //@try
        if (!match[v] || dfs(match[v])) {  //@kick
            match[v] = u;  //@match
            return true;
        }
    }
    return false;  //@fail
}

int main() {
    scanf("%d%d%d", &nl, &nr, &m);
    for (int i = 0; i < m; i++) {
        int u, v; scanf("%d%d", &u, &v);
        g[u].push_back(v);
    }
    int ans = 0;
    for (int u = 1; u <= nl; u++) {
        fill(vis, vis + nr + 1, false);  //@start
        if (dfs(u)) ans++;
    }
    printf("%d\n", ans);  //@done
}`,
  notes: [
    ['try', ['vis marks right vertices already examined in this round, so the search never loops.', 'vis 标记本轮已经考察过的右部点，保证搜索不会兜圈子。']],
    ['kick', ['If v is taken, recursively ask its owner to find a different partner.', '如果 v 已被占用，就递归地让占用者去另找一个对象。']],
    ['match', ['On the way back every vertex on the augmenting path gets its new partner.', '回溯时，增广路上的每个点都换上了新的匹配对象。']],
    ['start', ['vis is reset for every left vertex — each one gets a fresh search.', '每个左部点开始前都要清空 vis——每次都是一轮新的搜索。']],
  ],
  input: ['nl nr m, then m lines "u v": left vertex u (1..nl) may be matched with right vertex v (1..nr). Prints the size of a maximum matching.', 'nl nr m，随后 m 行 “u v”：左部点 u（1..nl）可以与右部点 v（1..nr）匹配。输出最大匹配数。'],
  sizes: [4, 5, 6], lab: [10, 100, 1000, 3000],
  gen(n, r) {
    const seen = new Set<number>(), es: string[] = []
    for (let k = 0; k < n * 8 && es.length < 2 * n; k++) {
      const u = r.int(1, n), v = Math.min(n, Math.max(1, (n <= 30 ? r.int(1, Math.max(1, n - 1)) : u + r.int(-3, 3))))
      if (!seen.has(u * (n + 1) + v)) { seen.add(u * (n + 1) + v); es.push(`${u} ${v}`) }
    }
    return `${n} ${n} ${es.length}\n${es.join('\n')}\n`
  },
  run(inp, t) {
    const tk = inp.split(/\s+/).filter(Boolean).map(Number), [nl, nr, m] = tk
    need(nl >= 1 && nr >= 1 && m >= 0 && tk.length >= 3 + 2 * m && tk.every(Number.isFinite), 'Expected "nl nr m" and m edges.', '需要 “nl nr m” 和 m 条边。')
    const g: [number, number][][] = Array.from({ length: nl }, () => []), ed: { u: number; v: number }[] = []
    for (let i = 0; i < m; i++) {
      const u = tk[3 + 2 * i] - 1, v = tk[4 + 2 * i] - 1
      need(u >= 0 && u < nl && v >= 0 && v < nr, `Edge ${i + 1} is out of range.`, `第 ${i + 1} 条边越界。`)
      g[u].push([v, i]); ed.push({ u, v: nl + v })
    }
    const pos: P[] = t.on ? [...span(0, nl - 1).map(i => ({ x: 0.15, y: nl > 1 ? i / (nl - 1) : 0.5 })), ...span(0, nr - 1).map(i => ({ x: 0.85, y: nr > 1 ? i / (nr - 1) : 0.5 }))] : []
    const label = [...span(1, nl).map(i => 'L' + i), ...span(1, nr).map(i => 'R' + i)]
    const match = new Int32Array(nr).fill(-1), me = new Int32Array(nr).fill(-1), vis = new Uint8Array(nr)
    let ans = 0
    const view = (hi: Tones = {}, ehi: Tones = {}) => {
      const tone: Tones = {}, et: Tones = {}
      for (let v = 0; v < nr; v++) { if (match[v] >= 0) { tone[nl + v] = 'ok'; tone[match[v]] = 'ok'; et[me[v]] = 'ok' } else if (vis[v]) tone[nl + v] = 'vis' }
      return [graph(pos, ed, { label, tone: { ...tone, ...hi }, et: { ...et, ...ehi } }), vars({ matched: ans })] as const
    }
    const dfs = (u: number): boolean => {
      for (const [v, e] of g[u]) {
        if (vis[v]) continue
        vis[v] = 1
        t.s('try', () => [[`L${u + 1} tries R${v + 1}.`, `L${u + 1} 尝试 R${v + 1}。`], ...view({ [u]: 'act', [nl + v]: 'cmp' }, { [e]: 'act' })])
        const owner = match[v]
        if (owner >= 0) t.s('kick', () => [[`R${v + 1} is taken by L${owner + 1}: can L${owner + 1} move elsewhere?`, `R${v + 1} 已被 L${owner + 1} 占用：L${owner + 1} 能换到别处吗？`], ...view({ [u]: 'act', [nl + v]: 'cmp', [owner]: 'alt' }, { [e]: 'act' })])
        if (owner < 0 || dfs(owner)) {
          match[v] = u; me[v] = e
          t.s('match', () => [[`Match L${u + 1} with R${v + 1}.`, `L${u + 1} 与 R${v + 1} 匹配。`], ...view({ [u]: 'act', [nl + v]: 'act' })])
          return true
        }
      }
      t.s('fail', () => [[`L${u + 1} has no option left.`, `L${u + 1} 已无路可走。`], ...view({ [u]: 'bad' })])
      return false
    }
    for (let u = 0; u < nl; u++) {
      vis.fill(0)
      t.s('start', () => [[`Round ${u + 1}: look for an augmenting path from L${u + 1}.`, `第 ${u + 1} 轮：从 L${u + 1} 出发寻找增广路。`], ...view({ [u]: 'act' })])
      if (dfs(u)) ans++
    }
    vis.fill(0)
    t.s('done', () => [[`No augmenting path remains: maximum matching = ${ans}.`, `不存在增广路了：最大匹配 = ${ans}。`], ...view()])
    t.out(ans)
  },
}

export default [gdfs, gbfs, dijkstra, spfa, floyd, prim, kruskal, topo, bipartite, tarjan, cutBridge, lca, diameter, hld, dinic, hungarian]
