import { graph, grid, gt, tn } from '../../engine/h'
import type { Extras } from '../extras'
import { at, col, ed, row } from '../story-util'

/** A small unweighted graph: a 4-cycle 1-2-4-3 with a tail 4-5. */
const U_POS = at([[1, 0], [0, 1], [2, 1], [1, 2], [1, 3]])
const U_ES = ed([[0, 1], [0, 2], [1, 3], [2, 3], [3, 4]])

/** The weighted graph used by the shortest-path and spanning-tree stories. */
const W_POS = at([[0, 1], [1, 0], [1, 2], [2, 2], [2, 0]])
const W_ES = ed([[0, 1, 2], [0, 2, 4], [2, 3, 3], [3, 4, 2], [2, 4, 5], [1, 4, 1], [1, 3, 4]])

const DAG_POS = at([[0, 0], [0, 2], [1, 1], [2, 1], [1, 3]])
const DAG_ES = ed([[0, 2], [1, 2], [2, 3], [1, 4]], true)

const FLOYD = { rows: [1, 2, 3, 4], cols: [1, 2, 3, 4], sq: true }

export const GRAPH1: Record<string, Extras> = {
  'graph-dfs': {
    story: [
      { kind: 'naive', title: ['Start simple: just keep walking', '先从最简单的做起：一直往前走'],
        body: ['Go from a vertex to a neighbour, then to one of its neighbours, and so on. On a graph with a cycle you can walk in circles forever — and still miss a side branch. Two things are missing: a way to know __where you have been__, and a way to __come back__ to branches you passed.', '从一个顶点走到一个邻居，再走到它的某个邻居，如此继续。只要图里有环，你就可能永远兜圈子——同时还漏掉某条岔路。缺少的是两样东西：知道__自己去过哪里__的办法，以及__回到__路过的岔路口的办法。'],
        fig: () => [graph(U_POS, U_ES, { name: '1 → 2 → 4 → 3 → 1 → 2 → …  and vertex 5 is never seen', tone: tn({ bad: [0, 1, 2, 3], dim: 4 }) })] },
      { kind: 'insight', title: ['Chalk marks and a ball of string', '粉笔记号和一团线'],
        body: ['Mark every vertex ==the moment you enter it== and never enter a marked vertex again: cycles can no longer trap you. Unroll a string as you go; when every neighbour of the current vertex is marked, follow the string back one step and try the next neighbour there. In a program, __the recursion stack is the string__.', '每个顶点==一进入就做上记号==，有记号的顶点不再进入：环就困不住你了。一边走一边放线；当当前顶点的所有邻居都有记号时，顺着线退回一步，在那里尝试下一个邻居。在程序里，__递归栈就是那根线__。'] },
      { kind: 'how', title: ['Go as deep as possible, then back up', '尽可能往深处走，然后退回来'],
        body: ['`dfs(u)`: mark u, then for each neighbour v in the adjacency list `g[u]`: if v is unmarked, call `dfs(v)`. When the call returns, the loop simply continues with the next neighbour. The edges along which new vertices were discovered form the ==DFS tree==.', '`dfs(u)`：给 u 做记号，然后依次查看邻接表 `g[u]` 中的每个邻居 v：如果 v 没有记号，就调用 `dfs(v)`。调用返回后，循环自然接着查看下一个邻居。发现新顶点时所走过的边构成了 ==DFS 树==。'],
        fig: () => [graph(U_POS, U_ES, { name: 'beside each vertex: the order of the first visit.  Edge 1–3 found nothing new', sub: [1, 2, 4, 3, 5], et: tn({ ok: [0, 2, 3, 4], dim: 1 }), tone: tn({ ok: [0, 1, 2, 3, 4] }) })] },
      { kind: 'result', title: ['Every vertex once, every edge twice', '每个顶点一次，每条边两次'],
        body: ['Each vertex is entered once and each edge is looked at from both ends: **O(n + m)**. DFS does not find shortest paths — but its tree is the skeleton of cycle detection, topological order, bridges and cut vertices, and strongly connected components.', '每个顶点只进入一次，每条边从两端各看一次：**O(n + m)**。DFS 找不到最短路——但它的搜索树是许多算法的骨架：判环、拓扑序、割点与割边、强连通分量。'] },
    ],
    flow: [
      { id: 'call', kind: 'start', text: ['dfs(u)', 'dfs(u)'], on: [] },
      { id: 'visit', text: ['mark u as visited;  print u', '标记 u 已访问；输出 u'] },
      { id: 'more', kind: 'test', text: ['another neighbour v of u ?', 'u 还有邻居 v ？'], no: 'back', on: [] },
      { id: 'skip', kind: 'test', text: ['is v already visited ?', 'v 已访问过？'], yes: 'more', no: 'go' },
      { id: 'go', text: ['dfs(v)', 'dfs(v)'], next: 'more' },
      { id: 'back', kind: 'end', text: ['return to the caller', '返回调用者'] },
    ],
  },

  'graph-bfs': {
    story: [
      { kind: 'naive', title: ['Start from DFS: it reaches everything, but by odd routes', '从 DFS 出发：它能到达所有顶点，但走的路很绕'],
        body: ['Depth-first search dives as deep as it can, so it may reach a vertex right next to the start only after a long detour. It tells you __that__ a vertex is reachable, not how far away it is.', '深度优先搜索会尽量往深处钻，所以紧挨着起点的顶点，可能要绕一大圈才被访问到。它能告诉你某个顶点__可以到达__，却说不出它离起点有多远。'],
        fig: () => [graph(U_POS, U_ES, { name: 'DFS reaches vertex 3 as 1 → 2 → 4 → 3, although 1–3 is an edge', et: tn({ bad: [0, 2, 3], ok: 1 }), tone: tn({ act: 0, cmp: 2 }) })] },
      { kind: 'insight', title: ['Visit in rings around the start', '围着起点一圈一圈地访问'],
        body: ['First the start, then everything one edge away, then everything two edges away. If vertices are discovered ==in order of their distance==, then the moment a vertex is discovered its distance is already the smallest possible.', '先是起点，然后是所有距离一条边的顶点，再是所有距离两条边的顶点。如果顶点是==按距离从小到大==被发现的，那么一个顶点被发现的那一刻，它的距离就已经是最小的了。'],
        fig: () => [graph(U_POS, U_ES, { name: 'beside each vertex: its distance from vertex 1', sub: [0, 1, 1, 2, 3], tone: tn({ act: 0, ok: [1, 2], cmp: 3, alt: 4 }) })] },
      { kind: 'how', title: ['A queue produces the rings', '队列自然产生这样的一圈一圈'],
        body: ['Take a vertex u from the __front__ of the queue; every neighbour without a distance gets `d[v] = d[u] + 1` and joins at the __back__. New vertices wait behind everything discovered earlier, so the queue always holds vertices of at most two consecutive distances, nearest first. ==Set d when pushing==, so nobody is queued twice.', '从队__首__取出顶点 u；每个还没有距离的邻居 v 得到 `d[v] = d[u] + 1`，并排到队__尾__。新顶点排在所有更早发现的顶点后面，所以队列里始终最多只有相邻两种距离的顶点，而且近的在前。==入队时就设置 d==，这样谁都不会被重复入队。'] },
      { kind: 'result', title: ['Shortest paths when every edge counts the same', '每条边都同样长时的最短路'],
        body: ['**O(n + m)**, and `d[v]` is the fewest edges from the start to v. That is a shortest path as long as ==all edges have the same length==. With weights you need Dijkstra; with weights 0 and 1 only, a double-ended queue is enough.', '**O(n + m)**，而且 `d[v]` 就是从起点到 v 最少经过的边数。只要==所有边的长度都相同==，这就是最短路。有边权时要用 Dijkstra；边权只有 0 和 1 时，用双端队列就够了。'] },
    ],
    flow: [
      { id: 'start', kind: 'start', text: ['push vertex 1;  d[1] = 0', '顶点 1 入队；d[1] = 0'] },
      { id: 'loop', kind: 'test', text: ['is the queue empty ?', '队列为空？'], yes: 'end', on: [] },
      { id: 'pop', text: ['pop the front vertex u;  print it', '取出队首顶点 u；输出它'] },
      { id: 'nb', kind: 'test', text: ['another neighbour v without a distance ?', '还有没有距离的邻居 v ？'], no: 'loop', on: [] },
      { id: 'push', text: ['d[v] = d[u] + 1;  push v', 'd[v] = d[u] + 1；v 入队'], next: 'nb' },
      { id: 'end', kind: 'end', text: ['done', '结束'], on: [] },
    ],
  },

  dijkstra: {
    story: [
      { kind: 'naive', title: ['Start from BFS: fewest edges is not shortest', '从 BFS 出发：边数最少不等于路程最短'],
        body: ['BFS counts edges. Once edges have lengths, a route with more edges can be shorter: from 1 to 4, the two-edge route 1 – 2 – 4 costs 2 + 4 = 6, the three-edge route 1 – 2 – 5 – 4 only 2 + 1 + 2 = **5**.', 'BFS 数的是边的条数。一旦边有了长度，边数更多的路线反而可能更短：从 1 到 4，两条边的路线 1 – 2 – 4 长度是 2 + 4 = 6，而三条边的路线 1 – 2 – 5 – 4 只有 2 + 1 + 2 = **5**。'],
        fig: () => [graph(W_POS, W_ES, { et: tn({ ok: [0, 5, 3], bad: 6 }), tone: tn({ act: 0, cmp: 3 }) })] },
      { kind: 'insight', title: ['The closest unfinished vertex can never get closer', '最近的未确定顶点，不可能再变近了'],
        body: ['Keep for every vertex the best distance found so far. Look at the unfinished vertex u with the ==smallest== such distance. Any other route to u would first have to pass through another unfinished vertex — which is at least as far away — and then add more __non-negative__ length. So u\'s distance is final.', '为每个顶点记录目前找到的最短距离。看未确定的顶点中这个距离==最小==的那个 u。任何别的通往 u 的路线，都得先经过另一个未确定的顶点——它至少和 u 一样远——之后还要再加上__非负__的长度。所以 u 的距离已经是最终值。'] },
      { kind: 'how', title: ['Settle the closest, relax its edges, repeat', '确定最近的，松弛它的边，重复'],
        body: ['Pop the closest vertex from a __min-heap__ and settle it. For each edge (u, v, w): if `d[u] + w < d[v]`, a better route to v has been found — update `d[v]` and push it. The heap may still contain older, worse entries for v; when one of those is popped later, ==skip it==.', '从__小根堆__中取出最近的顶点并把它确定下来。对它的每条边 (u, v, w)：如果 `d[u] + w < d[v]`，说明找到了通往 v 的更好路线——更新 `d[v]` 并把它放进堆里。堆里可能还留着 v 的更旧、更差的记录；之后取出它们时，==直接跳过==。'],
        fig: () => [graph(W_POS, W_ES, { name: 'beside each vertex: its final distance from vertex 1', sub: [0, 2, 4, 5, 3], et: tn({ ok: [0, 1, 5, 3], dim: [2, 4, 6] }), tone: tn({ ok: [0, 1, 2, 3, 4] }) })] },
      { kind: 'result', title: ['Fast — as long as no edge is negative', '很快——只要没有负权边'],
        body: ['Every edge pushes at most one heap entry: **O(m log m)**. The whole argument rests on "going further never makes a route shorter". With a ==negative edge== that is false, and a settled vertex could later be improved — use Bellman-Ford or SPFA there.', '每条边最多往堆里放一条记录：**O(m log m)**。整个论证都建立在“越走越远，路线不会变短”之上。有==负权边==时这句话不成立，已经确定的顶点之后还可能被改进——那种情况要用 Bellman-Ford 或 SPFA。'] },
    ],
    flow: [
      { id: 'init', kind: 'start', text: ['d[1] = 0, all others ∞;  push (0, 1)', 'd[1] = 0，其余为 ∞；把 (0, 1) 放入堆'] },
      { id: 'loop', kind: 'test', text: ['is the heap empty ?', '堆为空？'], yes: 'done', on: [] },
      { id: 'stale', kind: 'test', text: ['pop the smallest (d, u):  is u already settled ?', '取出最小的 (d, u)：u 已经确定了？'], yes: 'loop', no: 'settle' },
      { id: 'settle', text: ['settle u: its distance is final', '确定 u：它的距离是最终值'] },
      { id: 'relax', text: ['each edge (u, v, w) with d[u] + w < d[v]:  update d[v], push it', '每条满足 d[u] + w < d[v] 的边 (u, v, w)：更新 d[v] 并入堆'], next: 'loop' },
      { id: 'done', kind: 'end', text: ['print d[]', '输出 d[]'] },
    ],
  },

  spfa: {
    story: [
      { kind: 'naive', title: ['Start from Dijkstra — and one negative edge', '从 Dijkstra 出发——加上一条负权边'],
        body: ['Dijkstra settles vertex 2 at distance 2, the closest. But the route 1 → 3 → 2 costs 3 + (−2) = **1**. "The closest unfinished vertex is final" is simply false when a later edge can pay you back.', 'Dijkstra 会把顶点 2 确定为距离 2，因为它最近。可是路线 1 → 3 → 2 的长度是 3 + (−2) = **1**。当后面的边能“倒找钱”时，“最近的未确定顶点已是最终值”这句话根本不成立。'],
        fig: () => [graph(at([[0, 0], [2, 0], [1, 1]]), ed([[0, 1, 2], [0, 2, 3], [2, 1, -2]], true), { et: tn({ bad: 0, ok: [1, 2] }), sub: [0, '2 ?', 3], tone: tn({ act: 0, bad: 1 }) })] },
      { kind: 'insight', title: ['Fall back on what is always true', '退回到永远成立的事实上'],
        body: ['Relaxing an edge never makes a distance wrong, and if ==no edge can be relaxed any more==, all distances are shortest. So just relax every edge, round after round (Bellman-Ford). After round k every shortest path with at most k edges is correct, and a shortest path has at most n − 1 edges — so n − 1 rounds always suffice.', '松弛一条边永远不会让距离变错；而如果==再也没有边可以松弛==，所有距离就都是最短的。所以干脆一轮一轮地松弛所有的边（Bellman-Ford）。第 k 轮之后，所有边数不超过 k 的最短路都已正确，而最短路最多只有 n − 1 条边——所以 n − 1 轮一定够。'] },
      { kind: 'how', title: ['Only retry edges whose start just improved', '只重试起点刚被改进过的边'],
        body: ['Most of those relaxations do nothing: an edge u → v can only help if `d[u]` has decreased since it was last tried. SPFA keeps a ==queue of exactly those vertices==. Pop u, relax its edges; whenever some `d[v]` decreases, push v — unless it is waiting in the queue already (the `inq` flag).', '那些松弛大多是白做的：只有当 `d[u]` 自上次尝试以来变小了，边 u → v 才可能有用。SPFA 维护一个==恰好由这些顶点组成的队列==。取出 u，松弛它的边；一旦某个 `d[v]` 变小，就把 v 入队——除非它已经在队列里等着了（用 `inq` 标记）。'] },
      { kind: 'result', title: ['Handles negative edges; the worst case stays bad', '能处理负权边；最坏情况依然很差'],
        body: ['Often fast in practice, but specially built inputs force **O(n · m)**. A vertex that enters the queue n times reveals a ==negative cycle==, on which "shortest" has no meaning. When all weights are non-negative, use Dijkstra — it cannot be slowed down that way.', '实际运行往往很快，但特意构造的数据可以把它卡到 **O(n · m)**。如果某个顶点入队达到 n 次，就说明存在==负环==，此时“最短路”没有意义。所有边权非负时请用 Dijkstra——它不会被这样卡住。'] },
    ],
    flow: [
      { id: 'init', kind: 'start', text: ['d[1] = 0, all others ∞;  push 1', 'd[1] = 0，其余为 ∞；1 入队'] },
      { id: 'loop', kind: 'test', text: ['is the queue empty ?', '队列为空？'], yes: 'done', on: [] },
      { id: 'pop', text: ['pop u;  it is no longer in the queue', '取出 u；它不在队列里了'] },
      { id: 'e', kind: 'test', text: ['another edge (u, v, w) with d[u] + w < d[v] ?', '还有满足 d[u] + w < d[v] 的边 (u, v, w) ？'], no: 'loop', on: [] },
      { id: 'relax', text: ['d[v] = d[u] + w;  push v unless it is already queued', 'd[v] = d[u] + w；v 不在队列中就入队'], next: 'e' },
      { id: 'done', kind: 'end', text: ['print d[]', '输出 d[]'] },
    ],
  },

  floyd: {
    story: [
      { kind: 'naive', title: ['Start simple: one search from every vertex', '先从最简单的做起：从每个顶点各搜一次'],
        body: ['Running Dijkstra n times answers all pairs — with a heap, an adjacency list, and no negative edges allowed. For a graph of a few hundred vertices given as a matrix, there is something much shorter.', '跑 n 次 Dijkstra 可以回答所有点对——需要堆、邻接表，而且不能有负权边。对于只有几百个顶点、以矩阵给出的图，有一个短得多的办法。'] },
      { kind: 'insight', title: ['Allow intermediate stops one vertex at a time', '一次只多允许一个中转点'],
        body: ['Ask an easier question: the shortest path from i to j ==using only vertices 1..k as stops in between==. For k = 0 it is the direct edge. When vertex k becomes allowed, a path either still avoids k — the old answer — or passes through k once, splitting into i → k and k → j, both of which use only stops below k.', '问一个更容易的问题：从 i 到 j、==途中只允许经过顶点 1..k== 的最短路。k = 0 时就是直接相连的边。当顶点 k 被允许之后，一条路径要么仍然不经过 k——答案不变——要么恰好经过 k 一次，分成 i → k 和 k → j 两段，而这两段都只用编号小于 k 的中转点。'],
        fig: () => [graph(at([[0, 1], [1, 0], [2, 1]]), ed([[0, 2, 9], [0, 1, 2], [1, 2, 3]]), { name: 'd[i][j] = 9, but d[i][k] + d[k][j] = 5', label: ['i', 'k', 'j'], et: tn({ bad: 0, ok: [1, 2] }), tone: tn({ act: 1 }) })] },
      { kind: 'how', title: ['Three loops, with k outermost', '三重循环，k 在最外层'],
        body: ['`d[i][j] = min(d[i][j], d[i][k] + d[k][j])` for every i and j, for k = 1 … n. The same matrix can be updated in place. ==k must be the outermost loop==: it is the stage of the DP — "all pairs are correct for stops 1..k" has to hold before k + 1 begins.', '对 k = 1 … n，对每一对 i、j，执行 `d[i][j] = min(d[i][j], d[i][k] + d[k][j])`。可以直接在同一个矩阵上原地更新。==k 必须放在最外层循环==：它是 DP 的阶段——必须先保证“只用 1..k 作中转时所有点对都正确”，才能开始 k + 1。'],
        fig: () => [grid('edges only', [[0, 4, 3, 5], [4, 0, 1, '∞'], [3, 1, 0, 2], [5, '∞', 2, 0]], gt({ bad: [[1, 3], [3, 1]], dim: [[0, 0], [1, 1], [2, 2], [3, 3]] }), FLOYD), grid('after all k:  2 → 3 → 4 costs 1 + 2 = 3', [[0, 4, 3, 5], [4, 0, 1, 3], [3, 1, 0, 2], [5, 3, 2, 0]], gt({ ok: [[1, 3], [3, 1]], cmp: [[1, 2], [2, 3]], dim: [[0, 0], [1, 1], [2, 2], [3, 3]] }), FLOYD)] },
      { kind: 'result', title: ['Five lines for all pairs', '五行代码解决所有点对'],
        body: ['**O(n³)** — fine for n up to a few hundred, hopeless for 10⁵. Negative edges are no problem (a negative `d[i][i]` at the end reveals a negative cycle). With "or" and "and" instead of "min" and "+", the same loops compute which vertices can reach which.', '**O(n³)**——n 在几百以内没问题，到 10⁵ 就完全不行了。负权边不成问题（如果最后某个 `d[i][i]` 为负，说明有负环）。把 “min” 和 “+” 换成“或”和“与”，同样的循环就能求出哪些顶点可以到达哪些顶点。'] },
    ],
    flow: [
      { id: 'init', kind: 'start', text: ['d[i][i] = 0;  d[u][v] = w for every edge;  the rest ∞', 'd[i][i] = 0；每条边 d[u][v] = w；其余为 ∞'] },
      { id: 'kloop', kind: 'test', text: ['another vertex k = 1 … n ?', '还有顶点 k = 1 … n ？'], no: 'end', on: [] },
      { id: 'pivot', text: ['allow k as an intermediate stop', '允许 k 作为中转点'] },
      { id: 'pair', kind: 'test', text: ['another pair (i, j) with d[i][k] + d[k][j] < d[i][j] ?', '还有满足 d[i][k] + d[k][j] < d[i][j] 的 (i, j) ？'], no: 'kloop', on: [] },
      { id: 'relax', text: ['d[i][j] = d[i][k] + d[k][j]', 'd[i][j] = d[i][k] + d[k][j]'], next: 'pair' },
      { id: 'end', kind: 'end', text: ['print the matrix', '输出矩阵'], on: [] },
    ],
  },

  prim: {
    story: [
      { kind: 'naive', title: ['Start simple: compare all spanning trees', '先从最简单的做起：比较所有生成树'],
        body: ['A spanning tree connects all n vertices with n − 1 edges. A complete graph on n vertices has **nⁿ⁻²** of them — a hundred million for n = 10. We need a rule that says which edge to take without looking at whole trees.', '生成树用 n − 1 条边连通全部 n 个顶点。n 个顶点的完全图有 **nⁿ⁻²** 棵生成树——n = 10 时就是一亿棵。我们需要一条规则，不用考察整棵树就能决定该选哪条边。'] },
      { kind: 'insight', title: ['The lightest edge leaving the tree is always safe', '离开当前这棵树的最轻的边，总是可以放心选'],
        body: ['Split the vertices into "inside the tree so far" and "outside". Take the ==lightest edge that crosses== between them. Suppose some spanning tree does not use it: adding it creates a cycle, and that cycle must cross the split a second time through an edge that is at least as heavy. Swap the two — still connected, not heavier. So the lightest crossing edge never hurts.', '把顶点分成“已在树中”和“还在树外”两部分。取==横跨这两部分的最轻的边==。假设某棵生成树没用它：把它加进去会形成一个环，而这个环一定还通过另一条边再次跨过这条分界线，那条边至少一样重。把两条边对调——图依然连通，总权值不会增加。所以选最轻的跨越边永远不吃亏。'],
        fig: () => [graph(W_POS, W_ES, { name: 'tree so far: {1, 2}.  Crossing edges weigh 4, 1 and 4 — take the 1', et: tn({ ok: 0, act: 5, cmp: [1, 6], dim: [2, 3, 4] }), tone: tn({ ok: [0, 1] }) })] },
      { kind: 'how', title: ['Grow one tree, with a heap of candidate edges', '让一棵树不断长大，用堆存放候选边'],
        body: ['Start from vertex 1. When a vertex joins the tree, push all its edges to outside vertices into a __min-heap__ keyed by weight. Pop the lightest: if its far end is ==already inside==, discard it; otherwise add that vertex and its weight. Structurally this is Dijkstra with "edge weight" in place of "distance so far".', '从顶点 1 开始。每当一个顶点加入树，就把它连向树外顶点的所有边放进按权值排序的__小根堆__。取出最轻的：如果它另一端==已经在树里==，丢掉；否则把那个顶点加入树，并累加这条边的权值。从结构上看，这就是把“目前的距离”换成“边权”的 Dijkstra。'],
        fig: () => [graph(W_POS, W_ES, { name: 'minimum spanning tree: 2 + 1 + 2 + 3 = 8', et: tn({ ok: [0, 5, 3, 2], dim: [1, 4, 6] }), tone: tn({ ok: [0, 1, 2, 3, 4] }) })] },
      { kind: 'result', title: ['n − 1 safe choices in a row', '连续 n − 1 次安全的选择'],
        body: ['Every edge enters the heap at most twice: **O(m log m)**. On dense graphs an array-based version in O(n²) is even simpler. Kruskal reaches the same tree from the other side — sorting all edges and joining components.', '每条边最多入堆两次：**O(m log m)**。在稠密图上，用数组实现的 O(n²) 版本更简单。Kruskal 从另一个方向得到同样的树——把所有边排序，然后不断合并连通块。'] },
    ],
    flow: [
      { id: 'init', kind: 'start', text: ['push (0, vertex 1);  total = 0', '把 (0, 顶点 1) 放入堆；total = 0'] },
      { id: 'loop', kind: 'test', text: ['is the heap empty ?', '堆为空？'], yes: 'done', on: [] },
      { id: 'stale', kind: 'test', text: ['pop the lightest (w, u):  is u already in the tree ?', '取出最轻的 (w, u)：u 已在树中？'], yes: 'loop', no: 'add' },
      { id: 'add', text: ['add u to the tree;  total += w', '把 u 加入树；total += w'] },
      { id: 'push', text: ['push (c, v) for each edge to a vertex v outside the tree', '对每条连向树外顶点 v 的边，把 (c, v) 入堆'], next: 'loop' },
      { id: 'done', kind: 'end', text: ['print total', '输出 total'] },
    ],
  },

  kruskal: {
    story: [
      { kind: 'naive', title: ['Start greedy: cheapest edges first', '先贪心：最便宜的边优先'],
        body: ['The lightest edge of the whole graph surely belongs in the tree, then the next lightest, and so on. The danger is an edge whose two ends are __already connected__ by cheaper edges: it would close a cycle and connect nothing new.', '全图最轻的边肯定应该在树里，然后是第二轻的，依此类推。危险在于：有的边的两个端点__早已被更便宜的边连通__，选它只会形成环，连不上任何新东西。'] },
      { kind: 'insight', title: ['An edge between two components is safe; one inside a component is useless', '连接两个连通块的边可以放心选；连通块内部的边没有用'],
        body: ['Look at edges from lightest to heaviest. If an edge joins two ==different components==, it is the lightest edge leaving either of them — every lighter edge was examined already and lies inside a component — so by the cut property it is safe. If both ends are in the ==same component==, skip it.', '按从轻到重的顺序考察每条边。如果一条边连接两个==不同的连通块==，它就是离开其中任一连通块的最轻的边——所有更轻的边都已考察过，并且都在某个连通块内部——所以根据割性质，选它是安全的。如果两个端点在==同一个连通块==里，就跳过。'],
        fig: () => [grid('edges sorted by weight', [['2 – 5', '1 – 2', '4 – 5', '3 – 4', '1 – 3', '2 – 4', '3 – 5'], [1, 2, 2, 3, 4, 4, 5], ['take', 'take', 'take', 'take', 'skip', 'skip', 'skip']], gt({ ok: [...row(0, 0, 3), ...row(2, 0, 3)], dim: [...col(4, 0, 2), ...col(5, 0, 2), ...col(6, 0, 2)] }), { rows: ['edge', 'weight', 'decision'] })] },
      { kind: 'how', title: ['"Already connected?" is a job for a disjoint-set union', '“已经连通了吗”正是并查集的工作'],
        body: ['Sort the edges. For each one, `find` the sets of its two ends: equal — skip; different — take the edge and `union` the sets. After n − 1 accepted edges everything is connected.', '把边排序。对每条边，用 `find` 查出两个端点所在的集合：相同——跳过；不同——选这条边，并用 `union` 合并两个集合。选满 n − 1 条边后，整个图就连通了。'],
        fig: () => [graph(W_POS, W_ES, { name: 'the four accepted edges: 1 + 2 + 2 + 3 = 8', et: tn({ ok: [5, 0, 3, 2], dim: [1, 4, 6] }), tone: tn({ ok: [0, 1, 2, 3, 4] }) })] },
      { kind: 'result', title: ['Sorting is the whole cost', '全部代价就是排序'],
        body: ['**O(m log m)** for the sort; the set operations are practically free. Kruskal is the shorter program when the edges come as a list, and it handles a disconnected graph gracefully (it produces a spanning forest). Prim is the better fit for dense graphs.', '排序是 **O(m log m)**；并查集的操作几乎不花时间。当边以列表形式给出时，Kruskal 的程序更短，而且对不连通的图也能自然处理（得到一个生成森林）。稠密图则更适合用 Prim。'] },
    ],
    flow: [
      { id: 'sort', kind: 'start', text: ['sort the edges by weight;  every vertex is its own set', '把边按权值排序；每个顶点各自一个集合'] },
      { id: 'loop', kind: 'test', text: ['another edge (u, v, w), lightest first ?', '按从轻到重，还有边 (u, v, w) ？'], no: 'done', on: [] },
      { id: 'skip', kind: 'test', text: ['are u and v already in the same set ?', 'u 和 v 已在同一集合？'], yes: 'loop', no: 'take' },
      { id: 'take', text: ['merge the two sets;  total += w', '合并两个集合；total += w'], next: 'loop' },
      { id: 'done', kind: 'end', text: ['print total', '输出 total'] },
    ],
  },

  'topo-sort': {
    story: [
      { kind: 'naive', title: ['Start simple: who can go first?', '先从最简单的做起：谁可以排第一？'],
        body: ['Trying all n! orders and checking each is hopeless. Think locally instead: which vertex could be placed __right now__? One that nothing has to precede.', '枚举全部 n! 种顺序再逐一检查是不可能的。换个角度，只看眼前：哪个顶点__现在就可以__放下？一个没有任何前置要求的顶点。'] },
      { kind: 'insight', title: ['In-degree 0 means "ready"', '入度为 0 就表示“可以开始了”'],
        body: ['A vertex ==with no incoming edges== depends on nothing: place it. Its outgoing edges are now satisfied whatever comes later, so forget them — and that may leave other vertices with no unsatisfied incoming edge. They are ready next.', '==没有入边==的顶点不依赖任何东西：把它放下。无论后面怎么排，它的出边都已经得到满足，所以可以不再考虑这些边——这可能让另一些顶点也不再有未满足的入边。接下来就轮到它们。'],
        fig: () => [graph(DAG_POS, DAG_ES, { name: 'beside each vertex: its in-degree.  Vertices 1 and 2 are ready', sub: [0, 0, 2, 1, 1], tone: tn({ ok: [0, 1] }) })] },
      { kind: 'how', title: ['Count instead of deleting', '用计数代替删边'],
        body: ['Keep `deg[v]`, the number of incoming edges not yet satisfied, and a __queue__ of ready vertices. Pop u, append it to the order, and decrease `deg[v]` for every edge u → v; whoever ==reaches 0== joins the queue. (This is Kahn\'s algorithm.)', '维护 `deg[v]`——尚未满足的入边条数，以及一个存放“就绪”顶点的__队列__。取出 u，把它接到顺序的末尾，并对每条边 u → v 把 `deg[v]` 减一；==减到 0== 的顶点入队。（这就是 Kahn 算法。）'],
        fig: () => [graph(DAG_POS, DAG_ES, { name: 'after placing 1 and 2: vertices 3 and 5 have become ready', sub: ['', '', 0, 1, 0], et: tn({ dim: [0, 1, 3] }), tone: tn({ dim: [0, 1], ok: [2, 4] }) })] },
      { kind: 'result', title: ['An order — or a proof that none exists', '得到一个顺序——或者证明它不存在'],
        body: ['**O(n + m)**. If the graph has a cycle, the vertices on it wait for each other forever, so ==fewer than n vertices come out== — that is the cycle test. And whenever a problem lives on a directed acyclic graph (longest path, counting paths, scheduling), DP is done in exactly this order.', '**O(n + m)**。如果图中有环，环上的顶点会永远互相等待，于是==输出的顶点少于 n 个==——这就是判环的方法。而凡是定义在有向无环图上的问题（最长路、路径计数、任务调度），DP 都按这个顺序进行。'] },
    ],
    flow: [
      { id: 'init', kind: 'start', text: ['count in-degrees;  push every vertex with in-degree 0', '统计入度；所有入度为 0 的顶点入队'] },
      { id: 'loop', kind: 'test', text: ['is the queue empty ?', '队列为空？'], yes: 'check', on: [] },
      { id: 'pop', text: ['pop u;  append it to the order', '取出 u；把它接到顺序末尾'] },
      { id: 'dec', text: ['each edge u → v:  deg[v]−−;  push v if it reached 0', '每条边 u → v：deg[v]−−；减到 0 则 v 入队'], next: 'loop' },
      { id: 'check', kind: 'test', text: ['did all n vertices come out ?', 'n 个顶点都输出了？'], yes: 'done', no: 'cycle', on: [] },
      { id: 'cycle', kind: 'end', text: ['print −1: there is a cycle', '输出 −1：存在环'] },
      { id: 'done', kind: 'end', text: ['print the order', '输出这个顺序'] },
    ],
  },
}
