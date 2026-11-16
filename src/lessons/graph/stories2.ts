import { graph, grid, gt, layoutTree, tn } from '../../engine/h'
import type { Extras } from '../extras'
import { at, ed } from '../story-util'

/** The tree 1-2, 1-3, 3-4, 4-5, 5-6, 4-7, rooted at 1. */
const T7: [number, number][] = [[0, 1], [0, 2], [2, 3], [3, 4], [4, 5], [3, 6]]
const T7_POS = layoutTree(7, T7)
/** The same tree with vertex 8 below 6. */
const T8: [number, number][] = [...T7, [5, 7]]

/** Directed: the cycle 1 → 2 → 3 → 1, an edge 3 → 4, and the cycle 4 ⇄ 5. */
const SCC_POS = at([[0, 1], [1, 0], [1, 2], [2.5, 2], [3.5, 1]])
const SCC_ES = ed([[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 3]], true)

/** Undirected: the triangle 1-2-3 with a tail 3-4-5. */
const CUT_POS = at([[0, 0], [0, 2], [1, 1], [2, 1], [3, 1]])
const CUT_ES = ed([[0, 1], [1, 2], [2, 0], [2, 3], [3, 4]])

/** Flow network s → a, s → b, a → b, a → t, b → t, every capacity 1. */
const NET_POS = at([[0, 1], [1, 0], [1, 2], [2, 1]])
const NET_LABEL = ['s', 'a', 'b', 't']
const NET_ES = ed([[0, 1, 1], [0, 2, 1], [1, 2, 1], [1, 3, 1], [2, 3, 1]], true)

const BI_POS = at([[0, 0], [0, 1], [1, 0], [1, 1]])
const BI_LABEL = ['L1', 'L2', 'R1', 'R2']
const BI_ES = ed([[0, 2], [0, 3], [1, 2]])

export const GRAPH2: Record<string, Extras> = {
  bipartite: {
    story: [
      { kind: 'naive', title: ['Start simple: try every way to split', '先从最简单的做起：枚举每一种分法'],
        body: ['Each vertex goes into group A or group B: **2ⁿ** splits to test. Yet most of that freedom is an illusion — the edges leave almost no choice.', '每个顶点要么进 A 组、要么进 B 组：要检查 **2ⁿ** 种分法。然而这些“自由”大多是假象——有了边的约束，几乎没有选择的余地。'] },
      { kind: 'insight', title: ['Colour one vertex and everything else is forced', '给一个顶点染色，其余的就都被确定了'],
        body: ['Call the groups colours. Once a vertex has a colour, ==its neighbours must have the other one==, their neighbours the first one again, and so on through the whole connected component. There is nothing to search: just carry out the forced colouring and see whether it runs into a contradiction.', '把两个组叫做两种颜色。一个顶点的颜色一旦确定，==它的邻居就必须是另一种颜色==，邻居的邻居又必须是第一种颜色，这样一直传遍整个连通块。根本不需要搜索：只要把这种被迫的染色进行到底，看它会不会遇到矛盾。'],
        fig: () => [graph(at([[0, 0], [1, 0], [1, 1], [0, 1]]), ed([[0, 1], [1, 2], [2, 3], [3, 0]]), { name: 'an even cycle: the colours alternate all the way round', tone: tn({ cmp: [0, 2], alt: [1, 3] }) })] },
      { kind: 'how', title: ['A BFS that colours, and watches for a clash', '边染色边检查冲突的 BFS'],
        body: ['Give the start colour 1 and push it. Pop u; an uncoloured neighbour gets `3 − col[u]` and is pushed; a neighbour with ==the same colour as u== is a contradiction — answer No. A clash means the two ends were reached by paths of the same parity, which together with the edge close a cycle of __odd__ length.', '把起点染成颜色 1 并入队。取出 u；还没染色的邻居染成 `3 − col[u]` 并入队；如果某个邻居==与 u 颜色相同==，就是矛盾——答案为 No。出现冲突说明这两个端点是通过奇偶性相同的两条路径到达的，它们与这条边一起围成一个__奇数__长度的环。'],
        fig: () => [graph(at([[1, 0], [0, 1], [2, 1]]), ed([[0, 1], [0, 2], [1, 2]]), { name: 'an odd cycle: 2 and 3 are both forced to differ from 1 — and are joined by an edge', et: tn({ bad: 2 }), tone: tn({ cmp: 0, bad: [1, 2] }) })] },
      { kind: 'result', title: ['Bipartite exactly when there is no odd cycle', '是二分图，当且仅当没有奇环'],
        body: ['One BFS per component: **O(n + m)**. Do not forget to start a new search in ==every component==. The colouring itself is the split, and it is the first step before bipartite matching.', '每个连通块做一次 BFS：**O(n + m)**。别忘了==每个连通块==都要重新开始一次搜索。染色的结果本身就是分组方案，它也是做二分图匹配之前的第一步。'] },
    ],
    flow: [
      { id: 's', kind: 'test', text: ['another vertex s without a colour ?', '还有未染色的顶点 s ？'], no: 'done', on: [] },
      { id: 'seed', text: ['colour s with 1;  push it', '把 s 染成 1；入队'] },
      { id: 'edge', kind: 'test', text: ['another edge (u, v) from a queued vertex u ?', '队列中的顶点 u 还有边 (u, v) ？'], no: 's', on: [] },
      { id: 'color', text: ['v has no colour:  give it the opposite of u, push it', 'v 未染色：染成与 u 相反的颜色，入队'] },
      { id: 'same', kind: 'test', text: ['do u and v have the same colour ?', 'u 和 v 颜色相同？'], yes: 'conflict', no: 'edge', on: [] },
      { id: 'conflict', kind: 'end', text: ['print No   (an odd cycle)', '输出 No（存在奇环）'] },
      { id: 'done', kind: 'end', text: ['print Yes', '输出 Yes'] },
    ],
  },

  lca: {
    story: [
      { kind: 'naive', title: ['Start simple: climb one step at a time', '先从最简单的做起：一步一步往上爬'],
        body: ['Raise the deeper vertex to the depth of the other, then move both up together until they meet. Correct — but on a tree that is one long chain, a single query climbs **n steps**.', '先把较深的顶点提到与另一个同样的深度，然后两个顶点一起往上走，直到相遇。这是对的——但如果树是一条长链，一次询问就要爬 **n 步**。'],
        fig: () => [graph(T7_POS, ed(T7), { name: 'LCA(6, 7): lift 6 to the depth of 7, then both climb to 4', tone: tn({ act: [5, 6], cmp: 4, ok: 3 }) })] },
      { kind: 'insight', title: ['Jump by powers of two', '按 2 的幂往上跳'],
        body: ['Store for every vertex its ancestor 1, 2, 4, 8, … levels up: `up[j][u]` is the 2ʲ-th ancestor. The table fills itself by ==doubling==: jumping 2ʲ is jumping 2ʲ⁻¹ twice, `up[j][u] = up[j−1][ up[j−1][u] ]`. Any climb of k levels is then a few jumps — one per 1-bit of k.', '为每个顶点保存它往上 1、2、4、8……层的祖先：`up[j][u]` 是它的第 2ʲ 个祖先。这张表可以靠==倍增==自己填出来：跳 2ʲ 层就是连跳两次 2ʲ⁻¹ 层，`up[j][u] = up[j−1][ up[j−1][u] ]`。于是向上爬 k 层只需要几次跳跃——k 的二进制里每个 1 跳一次。'],
        fig: () => [grid('ancestors of vertex 6 in the tree above', [[5, 4, 1]], gt({ ok: [[0, 0], [0, 1], [0, 2]] }), { rows: ['up[j][6]'], cols: ['j = 0  (1 up)', 'j = 1  (2 up)', 'j = 2  (4 up)'] })] },
      { kind: 'how', title: ['Level the depths, then jump while the ancestors differ', '先调到同一深度，再在祖先不同时一起跳'],
        body: ['**Step 1**: lift the deeper vertex by the binary digits of the depth difference. If the two now coincide, that is the answer. **Step 2**: for j from large to small, if `up[j][u] ≠ up[j][v]`, jump both. A jump that would land on a common ancestor is ==never taken==, so both end up __directly below__ the LCA: the answer is `up[0][u]`.', '**第一步**：按深度差的二进制位，把较深的顶点提上来。如果此时两个顶点重合，它就是答案。**第二步**：j 从大到小，如果 `up[j][u] ≠ up[j][v]`，两个顶点就一起跳。会落到公共祖先上的跳跃==一律不跳==，所以最后两个顶点都停在 LCA 的__正下方__：答案就是 `up[0][u]`。'] },
      { kind: 'result', title: ['log n per query', '每次询问 log n'],
        body: ['O(n log n) to build the table, **O(log n) per query**. The same table gives the k-th ancestor, and with a second value stored per jump, the maximum or sum along a path. The distance between two vertices is `dep[u] + dep[v] − 2 · dep[lca]`.', '建表 O(n log n)，**每次询问 O(log n)**。同一张表还能求第 k 个祖先；如果每次跳跃再多存一个值，还能求路径上的最大值或和。两个顶点之间的距离是 `dep[u] + dep[v] − 2 · dep[lca]`。'] },
    ],
    flow: [
      { id: 'dfs', kind: 'start', text: ['dfs: depths, and up[j][u] = up[j−1][ up[j−1][u] ]', 'dfs：求深度，以及 up[j][u] = up[j−1][ up[j−1][u] ]'] },
      { id: 'q', kind: 'test', text: ['another query (u, v) ?   (let u be the deeper one)', '还有询问 (u, v) ？（令 u 为较深的那个）'], no: 'end', on: [] },
      { id: 'lift', text: ['j from large to small:  lift u by 2ʲ while it stays at least as deep as v', 'j 从大到小：只要 u 不会比 v 浅，就把 u 上提 2ʲ 层'] },
      { id: 'same', kind: 'test', text: ['u = v ?   (then u is the LCA)', 'u = v ？（那么 u 就是 LCA）'], yes: 'q', no: 'jump' },
      { id: 'jump', text: ['j from large to small:  if up[j][u] ≠ up[j][v], jump both', 'j 从大到小：若 up[j][u] ≠ up[j][v]，两者一起跳'] },
      { id: 'ans', text: ['the LCA is the parent of u', 'LCA 就是 u 的父亲'], next: 'q' },
      { id: 'end', kind: 'end', text: ['done', '结束'], on: [] },
    ],
  },

  'tree-diameter': {
    story: [
      { kind: 'naive', title: ['Start simple: measure from every vertex', '先从最简单的做起：从每个顶点各量一次'],
        body: ['In a tree, one BFS gives the distances from a vertex to all others. Doing that from every vertex and keeping the largest distance is **O(n²)** — too slow for 10⁵ vertices.', '在树上，做一次 BFS 就能得到一个顶点到其他所有顶点的距离。从每个顶点都做一次，再取最大的距离，是 **O(n²)**——对 10⁵ 个顶点来说太慢了。'] },
      { kind: 'insight', title: ['The farthest vertex from anywhere is an end of a diameter', '从任何一点出发，最远的顶点都是某条直径的端点'],
        body: ['Start at any vertex s and let u be the vertex farthest from it. Claim: ==u is an endpoint of some longest path==. Take a real diameter a – b: the path from s to u must leave it somewhere, and since u is at least as far from s as a or b is, replacing the corresponding end by u cannot make the path shorter.', '从任意顶点 s 出发，设 u 是离它最远的顶点。结论：==u 是某条最长路径的一个端点==。取一条真正的直径 a – b：从 s 到 u 的路径总要在某处离开它，而 u 离 s 至少和 a、b 一样远，所以把直径相应的那一端换成 u，路径不会变短。'],
        fig: () => [graph(T7_POS, ed(T7), { name: 'distances from vertex 1: the farthest vertex is 6', sub: [0, 1, 1, 2, 3, 4, 3], tone: tn({ act: 0, ok: 5 }) })] },
      { kind: 'how', title: ['Search twice', '搜两次'],
        body: ['BFS from vertex 1 and take the farthest vertex u. BFS again __from u__ and take the farthest vertex v. Now one end is known to be right, so the other is simply the farthest from it: `d[v]` is the diameter.', '从顶点 1 做 BFS，取最远的顶点 u。再__从 u 出发__做一次 BFS，取最远的顶点 v。既然已经知道一端是对的，另一端自然就是离它最远的顶点：`d[v]` 就是直径。'],
        fig: () => [graph(T7_POS, ed(T7), { name: 'distances from vertex 6: the farthest vertex is 2 — the diameter is 5', sub: [4, 5, 3, 2, 1, 0, 3], et: tn({ ok: [0, 1, 2, 3, 4], dim: 5 }), tone: tn({ ok: [0, 1, 2, 3, 4, 5], dim: 6 }) })] },
      { kind: 'result', title: ['Two passes instead of n', '两遍代替 n 遍'],
        body: ['**O(n)**. The argument needs ==non-negative edge weights==; with negative weights use tree DP instead (at every vertex, add its two longest downward chains). The middle of a diameter is the centre of the tree — the best place for a root or a meeting point.', '**O(n)**。这个论证要求==边权非负==；有负权时要改用树形 DP（在每个顶点把它向下最长的两条链加起来）。直径的中点就是树的中心——最适合作为根或集合地点的位置。'] },
    ],
    flow: [
      { id: 'bfs1', kind: 'start', text: ['BFS from vertex 1', '从顶点 1 开始 BFS'], on: [] },
      { id: 'visit', text: ['pop a vertex:  farther than the farthest so far ?  remember it', '取出一个顶点：比目前最远的还远？记下它'] },
      { id: 'first', text: ['u = the farthest vertex.   BFS again, from u', 'u = 最远的顶点。再从 u 开始做一次 BFS'] },
      { id: 'second', text: ['v = the farthest vertex from u', 'v = 离 u 最远的顶点'] },
      { id: 'done', kind: 'end', text: ['print d[v]', '输出 d[v]'] },
    ],
  },

  'tarjan-scc': {
    story: [
      { kind: 'naive', title: ['Start simple: test every pair', '先从最简单的做起：检查每一对顶点'],
        body: ['u and v are in the same component when u reaches v __and__ v reaches u. One search per vertex gives all of that in **O(n · (n + m))** — far too slow for large graphs.', '当 u 能到达 v、__并且__ v 也能到达 u 时，它们在同一个分量里。从每个顶点各搜一次就能得到所有这些信息，代价是 **O(n · (n + m))**——对大图来说太慢了。'] },
      { kind: 'insight', title: ['In one DFS, every component hangs below its first vertex', '在一次 DFS 中，每个分量都挂在它最先被访问的顶点下面'],
        body: ['Number the vertices in order of first visit (`dfn`). The vertex of a component that is visited first — its **root** — is an ancestor in the DFS tree of all the others, and they are all visited before the root is finished. So the task shrinks to ==recognising roots==.', '按第一次访问的顺序给顶点编号（`dfn`）。一个分量中最先被访问的顶点——它的**根**——在 DFS 树里是其余顶点的祖先，而且这些顶点都在根的访问结束之前被访问完。于是任务就变成了==认出哪些顶点是根==。'],
        fig: () => [graph(SCC_POS, SCC_ES, { name: 'beside each vertex: dfn / low.   Roots (dfn = low): 1 and 4', sub: ['1 / 1', '2 / 1', '3 / 1', '4 / 4', '5 / 4'], tone: tn({ cmp: [0, 1, 2], alt: [3, 4] }) })] },
      { kind: 'how', title: ['low: how far up can the subtree escape?', 'low：这棵子树最高能“逃”到哪里？'],
        body: ['Keep a stack of visited vertices whose component is not finished. `low[u]` = the smallest dfn reachable from u\'s subtree. After a tree edge u → v: `low[u] = min(low[u], low[v])`. For an edge to a vertex ==still on the stack==: `low[u] = min(low[u], dfn[v])`. Edges into finished components are ignored. If in the end `low[u] = dfn[u]`, nothing below u escapes above it: u is a root — __pop the stack down to u__, that is one component.', '用一个栈保存已访问、但所在分量尚未完成的顶点。`low[u]` = 从 u 的子树出发能到达的最小 dfn。走完树边 u → v 之后：`low[u] = min(low[u], low[v])`。遇到指向==仍在栈中==的顶点的边：`low[u] = min(low[u], dfn[v])`。指向已完成分量的边不予理会。如果最后 `low[u] = dfn[u]`，说明 u 下面没有任何顶点能逃到 u 的上方：u 是一个根——__把栈一直弹到 u__，弹出的就是一个分量。'] },
      { kind: 'result', title: ['One DFS for all components', '一次 DFS 得到所有分量'],
        body: ['**O(n + m)**. Contract every component to a single vertex and what remains has no cycles — a ==DAG==, on which topological order and DP work. That step is the heart of 2-SAT and of many "reachability" problems.', '**O(n + m)**。把每个分量缩成一个点，剩下的图就没有环了——是一个 ==DAG==，可以在上面做拓扑排序和 DP。这一步是 2-SAT 以及许多“可达性”问题的核心。'] },
    ],
    flow: [
      { id: 'call', kind: 'start', text: ['tarjan(u)', 'tarjan(u)'], on: [] },
      { id: 'visit', text: ['dfn[u] = low[u] = next number;  push u on the stack', 'dfn[u] = low[u] = 下一个编号；u 入栈'] },
      { id: 'e', kind: 'test', text: ['another edge u → v ?', '还有边 u → v ？'], no: 'isroot', on: [] },
      { id: 'new', kind: 'test', text: ['is v unvisited ?', 'v 未访问过？'], no: 'back', on: [] },
      { id: 'tree', text: ['tarjan(v);  low[u] = min(low[u], low[v])', 'tarjan(v)；low[u] = min(low[u], low[v])'], next: 'e' },
      { id: 'back', text: ['if v is on the stack:  low[u] = min(low[u], dfn[v])', '若 v 在栈中：low[u] = min(low[u], dfn[v])'], next: 'e' },
      { id: 'isroot', kind: 'test', text: ['low[u] = dfn[u] ?', 'low[u] = dfn[u] ？'], no: 'done', on: [] },
      { id: 'pop', text: ['pop the stack down to u: one component', '把栈弹到 u 为止：得到一个分量'] },
      { id: 'done', kind: 'end', text: ['return   (at the very end: print the count)', '返回（全部结束后：输出分量个数）'] },
    ],
  },

  'cut-bridge': {
    story: [
      { kind: 'naive', title: ['Start simple: delete it and look', '先从最简单的做起：删掉再看'],
        body: ['Remove one vertex (or edge), check whether the graph is still connected, put it back, try the next. Each check is a full traversal: **O(n · (n + m))** in total.', '删掉一个顶点（或一条边），检查图是否仍然连通，再把它放回去，接着试下一个。每次检查都是一次完整的遍历：总共 **O(n · (n + m))**。'] },
      { kind: 'insight', title: ['In a DFS tree, the only shortcuts lead upward', '在 DFS 树里，捷径只会通向上方'],
        body: ['In an undirected graph, every non-tree edge joins a vertex to one of its ==ancestors== (a back edge) — never two different branches. So whether a subtree stays attached after something above it is removed depends on one number: `low[v]`, the smallest dfn that v\'s subtree can reach using a back edge.', '在无向图里，每条非树边都把一个顶点与它的某个==祖先==相连（返祖边）——绝不会连接两个不同的分支。所以，当上方的某个东西被删掉后，一棵子树是否还连着，只取决于一个数：`low[v]`，即 v 的子树通过返祖边能到达的最小 dfn。'],
        fig: () => [graph(CUT_POS, CUT_ES, { name: 'beside each vertex: dfn / low.   Bridges: 3–4 and 4–5.   Cut vertices: 3 and 4', sub: ['1 / 1', '2 / 1', '3 / 1', '4 / 4', '5 / 5'], et: tn({ bad: [3, 4] }), tone: tn({ act: [2, 3] }) })] },
      { kind: 'how', title: ['Two comparisons on every tree edge', '在每条树边上做两次比较'],
        body: ['For a tree edge from u down to v: if ==low[v] > dfn[u]==, the subtree cannot even get back to u — the edge is its only link, a **bridge**. If ==low[v] ≥ dfn[u]==, the subtree cannot get strictly above u — removing u cuts it off, so u is a **cut vertex**. The root has nothing above it, so it is a cut vertex exactly when it has two or more DFS children.', '对于从 u 向下到 v 的树边：如果 ==low[v] > dfn[u]==，这棵子树连 u 都回不去——这条边是它唯一的联系，是一座**桥（割边）**。如果 ==low[v] ≥ dfn[u]==，这棵子树到不了严格高于 u 的地方——删掉 u 它就被隔开了，所以 u 是**割点**。根的上方什么都没有，所以根是割点当且仅当它在 DFS 树中有两个或更多孩子。'] },
      { kind: 'result', title: ['All weak points in one pass', '一遍找出所有薄弱点'],
        body: ['**O(n + m)**. Skip the edge you arrived by, not the parent vertex — otherwise a doubled edge is mistaken for a bridge. Removing the bridges leaves the 2-edge-connected components; the same low values also yield the biconnected components.', '**O(n + m)**。要跳过的是“来时的那条边”，而不是父顶点——否则重边会被误判成桥。把桥删掉，剩下的就是边双连通分量；同样的 low 值还能求出点双连通分量。'] },
    ],
    flow: [
      { id: 'visit', kind: 'start', text: ['dfs(u):  dfn[u] = low[u] = next number', 'dfs(u)：dfn[u] = low[u] = 下一个编号'] },
      { id: 'e', kind: 'test', text: ['another edge u – v, other than the one we came by ?', '除了来时的那条边，还有边 u – v ？'], no: 'root', on: [] },
      { id: 'new', kind: 'test', text: ['is v unvisited ?', 'v 未访问过？'], no: 'back', on: [] },
      { id: 'tree', text: ['dfs(v);  low[u] = min(low[u], low[v])', 'dfs(v)；low[u] = min(low[u], low[v])'] },
      { id: 'bridge', text: ['low[v] > dfn[u]:  the edge is a bridge', 'low[v] > dfn[u]：这条边是桥'] },
      { id: 'cut', text: ['low[v] ≥ dfn[u], u not the root:  u is a cut vertex', 'low[v] ≥ dfn[u] 且 u 不是根：u 是割点'], next: 'e' },
      { id: 'back', text: ['low[u] = min(low[u], dfn[v])', 'low[u] = min(low[u], dfn[v])'], next: 'e' },
      { id: 'root', text: ['the root is a cut vertex if it has ≥ 2 DFS children', '根若有 ≥ 2 个 DFS 孩子，则是割点'] },
      { id: 'done', kind: 'end', text: ['return   (at the very end: print both counts)', '返回（全部结束后：输出两个个数）'] },
    ],
  },

  hld: {
    story: [
      { kind: 'naive', title: ['Start with the mismatch: paths on a tree, tools for arrays', '先看矛盾所在：问题在树的路径上，工具却是给数组用的'],
        body: ['Climbing a path edge by edge costs O(n) per query. Our fast tools — prefix sums, segment trees — work on **contiguous pieces of an array**, and a path in a tree is nothing of the kind.', '沿着路径一条边一条边地爬，每次询问是 O(n)。而我们那些快的工具——前缀和、线段树——处理的是**数组中连续的一段**，树上的路径根本不是这种东西。'] },
      { kind: 'insight', title: ['Follow the biggest subtree, and light edges become rare', '总是跟着最大的子树走，轻边就会很少'],
        body: ['At each vertex call the child with the ==largest subtree== heavy, the others light. Stepping down a __light__ edge lands in a subtree at most half as large — so on the way from the root to any vertex there are at most **log n** light edges. Heavy edges link up into chains, and any root path touches at most log n + 1 chains.', '在每个顶点，把==子树最大==的孩子叫做重儿子，其余的叫轻儿子。沿__轻__边往下走一步，所在子树的大小至少减半——所以从根到任何顶点的路上，轻边最多只有 **log n** 条。重边首尾相连成链，任何一条从根出发的路径最多只经过 log n + 1 条链。'],
        fig: () => [graph(layoutTree(8, T8), ed(T8), { name: 'beside each vertex: subtree size.   Heavy chain 1–3–4–5–6–8;  2 and 7 hang on light edges', sub: [8, 1, 6, 5, 3, 2, 1, 1], et: tn({ ok: [1, 2, 3, 4, 6], dim: [0, 5] }), tone: tn({ ok: [0, 2, 3, 4, 5, 7] }) })] },
      { kind: 'how', title: ['Two DFS passes, then hop from chain to chain', '两遍 DFS，然后一条链一条链地跳'],
        body: ['Pass 1 computes sizes and heavy children. Pass 2 assigns `top[u]`, the highest vertex of u\'s chain, and numbers the vertices __heavy child first__ — so ==every chain is a contiguous range of numbers==. For two vertices: while their tops differ, take the one whose top is deeper and jump to the parent of that top. Once they share a chain, the shallower one is the LCA.', '第一遍求出子树大小和重儿子。第二遍求出 `top[u]`（u 所在链的最高顶点），并且__先走重儿子__地给顶点编号——于是==每条链都是一段连续的编号==。对于两个顶点：只要它们的 top 不同，就取 top 较深的那个，跳到它的 top 的父亲。一旦两者在同一条链上，较浅的那个就是 LCA。'] },
      { kind: 'result', title: ['A path becomes a few array ranges', '一条路径变成数组上的几段区间'],
        body: ['Each hop handles a whole chain: **O(log n)** hops per query. And because each chain is a contiguous range, a segment tree over the numbering answers path sums, maxima or updates in O(log² n) — and a whole subtree is one range too.', '每跳一次处理一整条链：每次询问跳 **O(log n)** 次。又因为每条链都是连续的一段编号，在这个编号上建一棵线段树，就能以 O(log² n) 处理路径求和、求最大值或修改——而一整棵子树也是一段连续的区间。'] },
    ],
    flow: [
      { id: 'size', kind: 'start', text: ['dfs 1: subtree sizes;  heavy child = the largest subtree', '第一遍 dfs：子树大小；重儿子 = 子树最大的孩子'] },
      { id: 'chain', text: ['dfs 2: top[u] and dfn[u], heavy child first', '第二遍 dfs：求 top[u] 和 dfn[u]，先走重儿子'] },
      { id: 'q', kind: 'test', text: ['another query (u, v) ?', '还有询问 (u, v) ？'], no: 'end', on: [] },
      { id: 'diff', kind: 'test', text: ['top[u] ≠ top[v] ?', 'top[u] ≠ top[v] ？'], no: 'ans', on: [] },
      { id: 'jump', text: ['the one whose chain top is deeper:  u = fa[top[u]]', 'top 较深的那个：u = fa[top[u]]'], next: 'diff' },
      { id: 'ans', text: ['same chain: the shallower vertex is the LCA', '在同一条链上：较浅的顶点就是 LCA'], next: 'q' },
      { id: 'end', kind: 'end', text: ['done', '结束'], on: [] },
    ],
  },

  dinic: {
    story: [
      { kind: 'naive', title: ['Start simple: push along any path that still has room', '先从最简单的做起：沿任意一条还有余量的路径推流'],
        body: ['Find a path from source to sink with spare capacity, send flow along it, repeat. It can paint itself into a corner: if the first path is s → a → b → t, both edges out of s lead nowhere any more and the flow stops at 1 — although **2** is possible.', '找一条从源点到汇点、还有剩余容量的路径，沿着它送流，重复。这样做可能把自己逼进死角：如果第一条路径选了 s → a → b → t，从 s 出发的两条边就都走不通了，流量停在 1——而实际上可以达到 **2**。'],
        fig: () => [graph(NET_POS, NET_ES, { name: 'every capacity is 1.  After s → a → b → t no other path is left', label: NET_LABEL, et: tn({ bad: [0, 2, 4] }), tone: tn({ act: [0, 3] }) })] },
      { kind: 'insight', title: ['Let later paths cancel earlier decisions', '让后来的路径可以撤销先前的决定'],
        body: ['Whenever flow is sent along an edge, add the same amount of capacity to a ==reverse edge==. Using the reverse edge later means "send that flow back" — undoing part of an earlier choice. Now s → b → a → t exists: it cancels the unit on a → b, and the result is two clean paths. With reverse edges, the flow is maximum exactly when no path with spare capacity remains.', '每当沿一条边送出流量，就给它的==反向边==增加同样多的容量。以后走反向边，意思是“把那些流量退回去”——撤销先前的一部分选择。现在 s → b → a → t 这条路就存在了：它抵消了 a → b 上的那一个单位，最终得到两条互不干扰的路径。有了反向边，当且仅当不再存在有剩余容量的路径时，流量达到最大。'],
        fig: () => [graph(NET_POS, [...NET_ES.slice(0, 2), { u: 2, v: 1, w: 1, dir: true, dash: true }, ...NET_ES.slice(3)], { name: 'the reverse edge b ⇢ a opens the path s → b → a → t:  total flow 2', label: NET_LABEL, et: tn({ ok: [1, 2, 3], dim: [0, 4] }), tone: tn({ act: [0, 3] }) })] },
      { kind: 'how', title: ['Dinic: layer the graph, then push only forward', 'Dinic：先分层，再只往前推'],
        body: ['A **BFS** gives every vertex its level — its distance from the source along edges with spare capacity. A **DFS** then pushes flow only along edges that go ==exactly one level deeper==, finding many shortest paths in one phase; a "current edge" pointer per vertex skips edges that are already useless. When the DFS finds nothing more, run the BFS again.', '用一次 **BFS** 给每个顶点定出层次——沿着有剩余容量的边，它离源点的距离。然后 **DFS** 只沿着==恰好通向下一层==的边推流，在一个阶段里找出许多条最短路径；每个顶点有一个“当前弧”指针，用来跳过已经没用的边。DFS 再也推不动时，重新做一次 BFS。'] },
      { kind: 'result', title: ['At most n phases', '最多 n 个阶段'],
        body: ['Each phase makes the sink strictly farther from the source, so there are at most n phases: **O(n² · m)** in the worst case and far faster in practice (O(m √n) for matching-like networks). The hard part of a flow problem is rarely the algorithm — it is ==seeing the network== in the problem. Max flow also equals the minimum cut.', '每个阶段都会让汇点离源点严格变远，所以最多 n 个阶段：最坏情况 **O(n² · m)**，实际要快得多（对匹配这类网络是 O(m √n)）。网络流问题的难点很少在算法本身——而在于从题目里==看出这张网络==。此外，最大流等于最小割。'] },
    ],
    flow: [
      { id: 'add', kind: 'start', text: ['every edge gets a reverse edge of capacity 0', '给每条边配一条容量为 0 的反向边'] },
      { id: 'bfs', kind: 'test', text: ['BFS levels from the source:  is the sink reachable ?', '从源点 BFS 分层：汇点可达？'], no: 'done' },
      { id: 'dfs', text: ['DFS from the source: only to the next level, only with spare capacity', '从源点 DFS：只走向下一层，只走有余量的边'], on: [] },
      { id: 'aug', kind: 'test', text: ['did it reach the sink ?', '到达汇点了？'], yes: 'push', no: 'bfs' },
      { id: 'push', text: ['along the path:  capacity −= d,  reverse capacity += d;  flow += d', '沿这条路径：容量 −= d，反向容量 += d；flow += d'], next: 'dfs' },
      { id: 'done', kind: 'end', text: ['print flow', '输出 flow'] },
    ],
  },

  hungarian: {
    story: [
      { kind: 'naive', title: ['Start simple: everyone grabs the first free partner', '先从最简单的做起：每个人都选第一个空闲的对象'],
        body: ['Go through the left vertices and match each with the first free neighbour. It gets stuck: L1 takes R1, and L2 — whose __only__ option is R1 — stays alone, although matching L1 with R2 would satisfy both.', '依次处理左边的每个顶点，让它与第一个空闲的邻居匹配。这样会卡住：L1 占了 R1，而__唯一__选择就是 R1 的 L2 只能落单——尽管让 L1 与 R2 匹配就能两全其美。'],
        fig: () => [graph(BI_POS, BI_ES, { name: 'greedy: L1 – R1 is taken, L2 finds nothing', label: BI_LABEL, et: tn({ ok: 0, bad: 2 }), tone: tn({ bad: 1 }) })] },
      { kind: 'insight', title: ['Ask the current owner to move', '请现在的“主人”让一让'],
        body: ['If the partner v that u wants is taken by w, ask w to ==find a different partner== — by the very same procedure. If w succeeds, v is free for u. A successful chain of such requests is an **augmenting path**: it starts and ends at unmatched vertices and alternates between edges outside and inside the matching. Flip every edge on it and the matching grows by one.', '如果 u 想要的对象 v 已经被 w 占了，就请 w ==另找一个对象==——用的是完全相同的办法。如果 w 成功了，v 就空出来给 u。这样一连串成功的请求就是一条**增广路**：它的起点和终点都是未匹配的顶点，并且在非匹配边与匹配边之间交替。把路径上每条边的状态翻转，匹配数就增加一。'],
        fig: () => [graph(BI_POS, BI_ES, { name: 'augmenting path L2 – R1 – L1 – R2: after the flip both are matched', label: BI_LABEL, et: tn({ dim: 0, ok: [1, 2] }), tone: tn({ ok: [0, 1, 2, 3] }) })] },
      { kind: 'how', title: ['A DFS per left vertex', '对每个左边的顶点做一次 DFS'],
        body: ['`dfs(u)`: for each neighbour v not yet tried __in this round__: mark it tried; if v is free, or `dfs(match[v])` succeeds, set `match[v] = u` and report success. The "tried" marks are cleared before each left vertex starts, and within a round they keep the search from asking the same right vertex twice.', '`dfs(u)`：对__本轮__还没试过的每个邻居 v：先标记为已试；如果 v 空闲，或者 `dfs(match[v])` 成功，就令 `match[v] = u` 并返回成功。每个左边的顶点开始之前都要清空“已试”标记；在同一轮里，这些标记保证不会两次去问同一个右边的顶点。'] },
      { kind: 'result', title: ['Maximum when no augmenting path is left', '没有增广路时，匹配就是最大的'],
        body: ['Berge\'s theorem says a matching is maximum ==exactly when no augmenting path exists==, so trying each left vertex once is enough: **O(n · m)**. For large graphs Hopcroft–Karp (or Dinic on the matching network) is faster. Bonus: in a bipartite graph the maximum matching equals the minimum vertex cover.', 'Berge 定理说：一个匹配是最大匹配，==当且仅当不存在增广路==。所以每个左边的顶点各试一次就够了：**O(n · m)**。对大图，Hopcroft–Karp（或在匹配网络上跑 Dinic）更快。附带一个结论：在二分图中，最大匹配数等于最小点覆盖数。'] },
    ],
    flow: [
      { id: 'start', kind: 'test', text: ['another left vertex u ?   (clear the "tried" marks)', '还有左边的顶点 u ？（清空“已试”标记）'], no: 'done' },
      { id: 'try', kind: 'test', text: ['dfs(u):  another neighbour v not tried in this round ?', 'dfs(u)：还有本轮没试过的邻居 v ？'], no: 'fail' },
      { id: 'kick', kind: 'test', text: ['is v free — or can its owner find another partner ?', 'v 空闲——或者它的主人能另找对象？'], no: 'try' },
      { id: 'match', text: ['match[v] = u;  report success', 'match[v] = u；返回成功'], next: 'start' },
      { id: 'fail', text: ['no partner for u:  report failure', 'u 找不到对象：返回失败'], next: 'start' },
      { id: 'done', kind: 'end', text: ['print the number of matched pairs', '输出匹配的对数'] },
    ],
  },
}
