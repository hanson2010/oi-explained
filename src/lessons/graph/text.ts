import type { L } from '../../engine/types'
import type { Prose } from '../extras'

/** The problem each lesson solves, why the method works, and common mistakes. */
export const TEXT: Record<string, Prose> = {
  'graph-dfs': {
    problem: ['Given an undirected graph, start at vertex 1 and visit every reachable vertex by depth-first search. Print the vertices in the order they are first visited.', '给定一个无向图，从顶点 1 出发，用深度优先搜索访问所有可达的顶点。按首次访问的顺序输出顶点。'],
    why: ['Depth-first search explores like someone walking through a maze with a ball of string: go to an unvisited neighbour, then to one of its unvisited neighbours, and keep going; when every neighbour of the current vertex has been seen, follow the string back one step and try the next neighbour there. The recursion stack is the string. Marking a vertex as visited the moment you enter it guarantees that each vertex is entered once, even though the graph may contain cycles. The edges along which new vertices were discovered form a tree, the DFS tree; a great many graph algorithms — connectivity, cycle detection, bridges, strongly connected components — are DFS plus some bookkeeping on that tree.', '深度优先搜索像是拿着一团线走迷宫：走到一个未访问的邻居，再走到它的一个未访问的邻居，一直走下去；当当前顶点的所有邻居都已访问过，就沿着线退回一步，在那里尝试下一个邻居。递归栈就是那团线。进入顶点的那一刻就打上访问标记，保证每个顶点只进入一次，即使图中有环。发现新顶点时所走的那些边构成一棵树，称为 DFS 树；大量图论算法——连通性、判环、割边、强连通分量——都是 DFS 再加上在这棵树上做的一些记录。'],
    pitfalls: [
      ['For an undirected graph add the edge in both directions.', '无向图的每条边要在两个方向上都加入。'],
      ['The order of visits depends on the order of the adjacency lists.', '访问顺序取决于邻接表中的顺序。'],
      ['A graph that is one long path makes the recursion as deep as n.', '如果图是一条长链，递归深度会达到 n。'],
    ],
  },
  'graph-bfs': {
    problem: ['Given an undirected graph, start at vertex 1 and visit every reachable vertex by breadth-first search. Print the vertices in the order they are visited.', '给定一个无向图，从顶点 1 出发，用广度优先搜索访问所有可达的顶点。按访问顺序输出顶点。'],
    why: ['Breadth-first search visits vertices in rings around the start: first the start itself, then everything one edge away, then everything two edges away. The queue enforces this order. A vertex taken from the front adds its undiscovered neighbours at the back, so they wait behind all vertices that were discovered earlier — and those are at the same distance or one closer. That is why the distance assigned when a vertex is discovered, one more than the distance of the vertex that discovered it, is the smallest possible number of edges. BFS is therefore the shortest-path algorithm for graphs whose edges all have the same length.', '广度优先搜索以起点为中心一圈一圈地访问顶点：先是起点本身，然后是距离一条边的所有顶点，再是距离两条边的所有顶点。队列保证了这个顺序。从队首取出的顶点把它未发现的邻居加到队尾，这些邻居排在所有更早被发现的顶点之后——而那些顶点的距离要么相同，要么少一。所以顶点被发现时得到的距离（比发现它的顶点多一）就是最少的边数。因此在所有边长度相同的图上，BFS 就是最短路算法。'],
    pitfalls: [
      ['Set the distance (the visited mark) when pushing, not when popping.', '入队时就设置距离（即访问标记），而不是出队时。'],
      ['Using the distance array as the visited mark requires initialising it to −1, not 0.', '用距离数组兼作访问标记时，初值要设为 −1 而不是 0。'],
      ['If the graph is disconnected, vertices outside the start\'s component are never visited.', '如果图不连通，起点所在连通块以外的顶点不会被访问。'],
    ],
  },
  dijkstra: {
    problem: ['Given an undirected graph with non-negative edge weights, find the shortest distance from vertex 1 to every vertex.', '给定一个边权非负的无向图，求从顶点 1 到每个顶点的最短距离。'],
    why: ['Keep for every vertex the best distance found so far. Among the vertices not yet finished, consider the one with the smallest such distance, u. Could a different route to u be shorter? Any other route must leave the finished set through some other unfinished vertex first, and that vertex is already at least as far away as u; the remaining edges of the route only add non-negative length. So u\'s distance is final. Finish u and use it to improve its neighbours ("relax" its edges), then repeat. A min-heap finds the closest unfinished vertex quickly. The argument relies on edges never having negative weight — with a negative edge, a longer-looking detour could turn out cheaper later.', '为每个顶点记录目前找到的最短距离。在尚未确定的顶点中，考虑距离最小的那个 u。有没有可能存在另一条到 u 的更短的路线？任何其他路线都必须先经过另一个尚未确定的顶点才能离开已确定的集合，而那个顶点的距离已经不小于 u；路线上剩下的边只会再加上非负的长度。所以 u 的距离已是最终值。把 u 确定下来，用它去改进邻居（“松弛”它的边），然后重复。小根堆可以快速找出最近的未确定顶点。这个论证依赖于边权不为负——如果有负权边，一条看起来更长的绕路之后可能反而更便宜。'],
    pitfalls: [
      ['It is wrong with negative edges; use Bellman-Ford / SPFA there.', '有负权边时它是错的；那时要用 Bellman-Ford / SPFA。'],
      ['Forgetting to skip outdated heap entries can make it far slower.', '忘记跳过堆中过期的记录，会让算法慢很多。'],
      ['Distances may exceed int: use long long and a large enough "infinity".', '距离可能超出 int：要用 long long，并取足够大的“无穷大”。'],
      ['The default priority_queue is a max-heap; without greater<> you pop the farthest vertex.', 'priority_queue 默认是大根堆；不写 greater<> 弹出的就是最远的顶点。'],
    ],
  },
  spfa: {
    problem: ['Given a directed graph whose edge weights may be negative (but with no negative cycle), find the shortest distance from vertex 1 to every vertex.', '给定一个边权可能为负（但没有负环）的有向图，求从顶点 1 到每个顶点的最短距离。'],
    why: ['With negative edges Dijkstra\'s "closest vertex is final" argument fails, so fall back on a weaker but always valid fact: relaxing an edge never makes a distance wrong, and if no edge can be relaxed any more, all distances are shortest. Bellman-Ford simply relaxes every edge, round after round. After round k every shortest path with at most k edges is correct, and a shortest path never needs more than n − 1 edges, so n − 1 rounds suffice. Most of those relaxations achieve nothing, though: an edge u → v can only help if d[u] has decreased since it was last tried. SPFA keeps a queue of exactly those vertices whose distance has just decreased and relaxes only their edges.', '有负权边时，Dijkstra “最近的顶点已确定”的论证不再成立，所以退回到一个较弱但永远成立的事实：松弛一条边不会让距离变错，而如果没有任何边还能松弛，所有距离就都是最短的。Bellman-Ford 就是一轮又一轮地松弛所有的边。第 k 轮之后，所有至多 k 条边的最短路都已正确；而最短路不会超过 n − 1 条边，所以 n − 1 轮就够了。不过其中大多数松弛是徒劳的：边 u → v 只有在 d[u] 自上次尝试以来减小过，才可能带来改进。SPFA 用队列保存那些距离刚刚减小的顶点，只松弛它们的出边。'],
    pitfalls: [
      ['On adversarial inputs SPFA is as slow as Bellman-Ford, O(n · m); never use it when weights are non-negative.', '在特殊构造的数据上 SPFA 和 Bellman-Ford 一样慢，是 O(n · m)；边权非负时不要用它。'],
      ['A negative cycle makes it loop forever unless you count how often each vertex is queued.', '存在负环时会无限循环，除非统计每个顶点的入队次数。'],
      ['Forgetting to clear the in-queue flag when a vertex leaves the queue.', '顶点出队时忘记清除“在队列中”的标记。'],
    ],
  },
  floyd: {
    problem: ['Given a weighted undirected graph with up to a few hundred vertices, find the shortest distance between every pair of vertices.', '给定一个至多几百个顶点的带权无向图，求每一对顶点之间的最短距离。'],
    why: ['Define a sequence of easier questions: what is the shortest path from i to j if only vertices 1..k may be used as intermediate stops? For k = 0 the answer is the direct edge. Going from k − 1 to k, a path either does not use vertex k — then the old answer stands — or it passes through k exactly once, splitting into a path from i to k and a path from k to j, both using only vertices below k. So the new answer is the smaller of d[i][j] and d[i][k] + d[k][j]. After k has run through all n vertices, every vertex is allowed and the table holds the true shortest distances. Three nested loops, and remarkably the same array can be updated in place.', '定义一系列更容易的问题：如果只允许用 1..k 号顶点作为中转点，从 i 到 j 的最短路是多少？k = 0 时答案就是直接相连的边。从 k − 1 到 k，一条路径要么不经过顶点 k——那么原来的答案不变——要么恰好经过 k 一次，被分成从 i 到 k 和从 k 到 j 的两段，而这两段都只用到编号小于 k 的顶点。所以新的答案是 d[i][j] 和 d[i][k] + d[k][j] 中较小的那个。当 k 取遍全部 n 个顶点后，所有顶点都允许中转，表中就是真正的最短距离。三重循环即可，而且可以直接在同一个数组上原地更新。'],
    pitfalls: [
      ['The intermediate vertex k must be the outermost loop.', '中转点 k 必须在最外层循环。'],
      ['"Infinity + infinity" must not overflow: use 0x3f3f3f3f-style values, not INT_MAX.', '“无穷大 + 无穷大”不能溢出：要用 0x3f3f3f3f 这类值，而不是 INT_MAX。'],
      ['Initialise d[i][i] = 0 and keep the smallest of parallel edges.', '要初始化 d[i][i] = 0，并在重边中保留最小的一条。'],
    ],
  },
  prim: {
    problem: ['Given a connected weighted undirected graph, choose n − 1 edges that connect all vertices with the smallest possible total weight (a minimum spanning tree). Print that weight.', '给定一个连通的带权无向图，选出 n − 1 条边连通所有顶点，并使总权值最小（最小生成树）。输出这个权值。'],
    why: ['Start with a tree consisting of one vertex and grow it. At any moment the vertices are divided into those inside the tree and those outside, and some edges cross between the two groups. The lightest crossing edge is always safe to add: take any spanning tree that does not use it; adding it creates a cycle, and that cycle must cross the division a second time through some other edge that is at least as heavy; replacing that edge by the lighter one keeps everything connected and does not increase the weight. So repeatedly add the lightest edge leaving the tree. A min-heap of candidate edges makes each step fast; entries whose far end has meanwhile joined the tree are simply discarded.', '从只有一个顶点的树开始，让它逐渐生长。任何时刻，顶点被分成树内和树外两部分，有一些边横跨这两部分。其中最轻的横跨边总是可以安全地加入：任取一棵没有用到它的生成树，把它加进去会形成一个环，而这个环必然通过另一条至少同样重的边再次横跨这个划分；用较轻的边换掉那一条，图仍然连通，权值也不会增加。所以不断加入离开这棵树的最轻的边即可。用小根堆保存候选边能让每一步都很快；另一端已经进入树内的记录直接丢弃。'],
    pitfalls: [
      ['Pushing the accumulated distance (as in Dijkstra) instead of the edge weight computes shortest paths, not a spanning tree.', '像 Dijkstra 那样把累计距离（而不是边权）压入堆，求出的是最短路而不是生成树。'],
      ['If the graph is disconnected the loop ends early; check that all n vertices joined.', '如果图不连通，循环会提前结束；要检查是否 n 个顶点都已加入。'],
      ['For dense graphs the O(n²) array version without a heap is faster.', '对于稠密图，不用堆的 O(n²) 数组写法更快。'],
    ],
  },
  kruskal: {
    problem: ['Given a connected weighted undirected graph, find the total weight of a minimum spanning tree.', '给定一个连通的带权无向图，求最小生成树的总权值。'],
    why: ['Sort the edges from lightest to heaviest and decide on each one in turn. If its two endpoints are already connected by the edges chosen so far, adding it would create a cycle, and a cycle is never needed for connectivity — skip it. Otherwise the edge joins two separate components, and it is the lightest edge that leaves either of them (every lighter edge has already been examined and lies inside a component), so by the cut property it is safe to take. After n − 1 accepted edges everything is connected. The only non-trivial question, "are these two vertices already connected?", is exactly what a disjoint-set union answers in near-constant time.', '把边按从轻到重排序，依次决定每一条边的取舍。如果它的两个端点已经被之前选中的边连通，加入它就会成环，而保持连通永远不需要环——跳过。否则这条边连接了两个不同的连通块，并且它是离开其中任何一个连通块的最轻的边（所有更轻的边都已检查过，都在某个连通块内部），所以由切割性质可知选它是安全的。选满 n − 1 条边后，所有顶点就连通了。唯一不平凡的问题——“这两个顶点是否已经连通？”——正是并查集能在近乎常数时间内回答的。'],
    pitfalls: [
      ['Merging x and y directly instead of their roots breaks the union-find.', '直接合并 x 和 y 而不是它们的根，会把并查集弄坏。'],
      ['The edge array must hold m edges, not n.', '边数组要能存下 m 条边，而不是 n 条。'],
      ['If fewer than n − 1 edges are accepted, the graph is disconnected and no spanning tree exists.', '如果选中的边少于 n − 1 条，说明图不连通，不存在生成树。'],
    ],
  },
  'topo-sort': {
    problem: ['Given a directed graph where an edge u → v means "u must come before v", print an order of all vertices that respects every edge, or report that none exists.', '给定一个有向图，边 u → v 表示“u 必须排在 v 之前”。输出一个满足所有边的顶点顺序，或报告不存在这样的顺序。'],
    why: ['Which vertex can be placed first? One that nothing must precede — a vertex with no incoming edges. Place it. Its outgoing edges are now satisfied whatever comes later, so they can be ignored, which may free further vertices. Repeating this produces a valid order. Instead of deleting edges, keep for each vertex the number of unsatisfied incoming edges and decrease it; vertices whose count reaches zero wait in a queue. If the graph contains a cycle, the vertices on it wait for each other forever and never reach zero, so the output is shorter than n — which is also how cycles are detected. Many problems on directed acyclic graphs, such as longest paths, are solved by processing vertices in this order.', '哪个顶点可以排在最前面？没有任何顶点必须排在它之前的那个——也就是入度为零的顶点。把它放好。它的出边此后无论如何都已满足，可以不再考虑，这又可能让其他顶点变得可用。重复这个过程就得到一个合法的顺序。不必真的删边，只需为每个顶点记录尚未满足的入边数并不断减少；数量变为零的顶点进入队列等待。如果图中有环，环上的顶点互相等待，入度永远不会变为零，于是输出的顶点少于 n 个——这也正是判环的方法。有向无环图上的许多问题（例如最长路）都是按这个顺序处理顶点来求解的。'],
    pitfalls: [
      ['Forgetting the final size check: on a cyclic graph you would print a partial order as if it were valid.', '忘记最后检查个数：在有环的图上会把不完整的顺序当作合法结果输出。'],
      ['The order is usually not unique; a checker must accept any valid one.', '拓扑序通常不唯一；评测时任何合法的顺序都应被接受。'],
      ['For the lexicographically smallest order replace the queue by a min-heap.', '若要求字典序最小的拓扑序，把队列换成小根堆。'],
    ],
  },
  bipartite: {
    problem: ['Decide whether the vertices of an undirected graph can be split into two groups so that every edge joins vertices from different groups.', '判断一个无向图的顶点能否分成两组，使得每条边连接的两个顶点都不在同一组。'],
    why: ['Call the two groups colours. Once one vertex of a connected component has a colour, everything else is forced: its neighbours must have the other colour, their neighbours the first colour again, and so on. So just carry out this forced colouring with a BFS and watch for a contradiction — an edge whose two ends received the same colour. If that happens, the two ends were reached from the start by paths whose lengths have the same parity, and together with the edge they close a cycle of odd length; a cycle of odd length can never be 2-coloured, so no split exists. If no contradiction appears in any component, the colouring itself is the split.', '把两组称为两种颜色。连通块中只要有一个顶点确定了颜色，其余的就都被迫确定了：它的邻居必须是另一种颜色，邻居的邻居又是第一种颜色，如此继续。所以只需用 BFS 执行这种“被迫的”染色，并留意矛盾——某条边的两端被染成了同一种颜色。如果发生这种情况，这两个端点从起点出发的路径长度奇偶性相同，加上这条边就构成一个奇数长度的环；奇环不可能二染色，所以不存在这样的分组。如果所有连通块都没有出现矛盾，染色的结果本身就是所求的分组。'],
    pitfalls: [
      ['Starting the search only from vertex 1 misses other components.', '只从顶点 1 开始搜索，会漏掉其他连通块。'],
      ['A self-loop makes a graph non-bipartite immediately.', '自环会让图直接成为非二分图。'],
      ['Use three states (uncoloured, colour 1, colour 2), not a boolean.', '要用三种状态（未染色、颜色 1、颜色 2），而不是布尔值。'],
    ],
  },
  'tarjan-scc': {
    problem: ['In a directed graph, a strongly connected component is a largest possible set of vertices in which every vertex can reach every other. Count the components.', '在有向图中，强连通分量是一个极大的顶点集合，其中任意两个顶点互相可达。求强连通分量的个数。'],
    why: ['Run a DFS and number the vertices in order of first visit (dfn). Within one component, the vertex visited first is an ancestor in the DFS tree of all the others — call it the root of the component. The task is to recognise roots. For each vertex compute low: the smallest dfn that can be reached from its subtree by tree edges followed by at most one edge to a vertex that is still "open" (on the stack). If low[u] < dfn[u], something below u reaches an earlier open vertex, which in turn reaches u, so u belongs to a component rooted higher up. If low[u] = dfn[u], nothing below u escapes upward: u is a root, and the vertices pushed on the stack since u are exactly its component — pop them. Vertices already popped are in finished components and must be ignored.', '做一次 DFS，按首次访问的顺序给顶点编号（dfn）。在同一个分量中，最先被访问的顶点是其余所有顶点在 DFS 树上的祖先——称它为这个分量的根。任务就是识别出这些根。对每个顶点计算 low：从它的子树出发，先走树边，再至多走一条指向仍然“开放”（在栈中）的顶点的边，所能到达的最小 dfn。如果 low[u] < dfn[u]，说明 u 下面有顶点能到达更早的开放顶点，而后者又能到达 u，所以 u 属于根在更高处的某个分量。如果 low[u] = dfn[u]，说明 u 下面没有任何顶点能向上逃出去：u 是一个根，自 u 入栈以来压入栈中的顶点恰好就是它的分量——把它们弹出。已经弹出的顶点属于已完成的分量，必须忽略。'],
    pitfalls: [
      ['Updating low through a vertex that is no longer on the stack merges separate components.', '通过已经不在栈中的顶点更新 low，会把不同的分量错误地合并。'],
      ['The outer loop must start a DFS from every unvisited vertex, not just vertex 1.', '外层循环要从每个未访问的顶点开始 DFS，而不只是顶点 1。'],
      ['Deep recursion: a path of 10⁵ vertices needs a large stack.', '递归很深：一条 10⁵ 个顶点的链需要很大的栈空间。'],
    ],
  },
  'cut-bridge': {
    problem: ['In an undirected graph, a cut vertex (bridge) is a vertex (edge) whose removal increases the number of connected components. Count the cut vertices and the bridges.', '在无向图中，如果删除某个顶点（某条边）会使连通块数增加，它就称为割点（割边）。求割点数和割边数。'],
    why: ['Removing a vertex or edge and re-checking connectivity each time is O(n · m). One DFS is enough. In the DFS tree of an undirected graph every non-tree edge connects a vertex to one of its ancestors (a back edge). Let low[v] be the highest point — smallest dfn — that the subtree of v can reach using such back edges. Consider a tree edge from u down to v. If low[v] > dfn[u], the subtree of v has no back edge reaching u or above, so the tree edge is its only connection to the rest: a bridge. If low[v] ≥ dfn[u], the subtree cannot get strictly above u, so deleting u separates it: u is a cut vertex. The root has nothing above it, so that test is meaningless there; instead the root is a cut vertex exactly when it has two or more children in the DFS tree.', '每次删掉一个顶点或一条边再重新检查连通性，是 O(n · m)。其实一次 DFS 就够了。在无向图的 DFS 树中，每条非树边都连接一个顶点和它的某个祖先（返祖边）。设 low[v] 为 v 的子树借助这些返祖边所能到达的最高位置——即最小的 dfn。考虑一条从 u 向下到 v 的树边。如果 low[v] > dfn[u]，v 的子树没有任何返祖边能到达 u 或更高的地方，这条树边就是它与外界的唯一联系：它是割边。如果 low[v] ≥ dfn[u]，这棵子树无法到达严格高于 u 的地方，所以删掉 u 就会把它分离出去：u 是割点。根的上方什么也没有，这个判据对根没有意义；根是割点，当且仅当它在 DFS 树中有两个或更多孩子。'],
    pitfalls: [
      ['Skipping "the parent vertex" instead of "the edge we came by" is wrong when there are parallel edges.', '跳过“父顶点”而不是“来时的那条边”，在有重边时是错的。'],
      ['Bridge uses >, cut vertex uses ≥ — mixing them up is the classic mistake.', '割边用 >，割点用 ≥——弄混它们是最经典的错误。'],
      ['Count each cut vertex once, even if several children satisfy the condition.', '即使有多个孩子满足条件，每个割点也只能计一次。'],
    ],
  },
  lca: {
    problem: ['Given a rooted tree and q pairs of vertices, find for each pair their lowest common ancestor — the deepest vertex that is an ancestor of both.', '给定一棵有根树和 q 对顶点，对每一对求它们的最近公共祖先——同时是两者祖先的最深的顶点。'],
    why: ['The naive method raises the deeper vertex to the depth of the other and then moves both up one step at a time until they meet — O(n) per query on a deep tree. Speed it up by taking big jumps. Store for every vertex its ancestor 1, 2, 4, 8, … levels up; the 2ʲ-th ancestor is the 2ʲ⁻¹-th ancestor of the 2ʲ⁻¹-th ancestor, so the table fills quickly. Levelling the depths is then a matter of jumping by the binary digits of the difference. For the second phase use monotonicity: jumping k levels from both vertices lands on the same vertex exactly when k is at least the distance to the LCA. So try the jumps from largest to smallest and take a jump only if the two landing vertices differ. The vertices end up directly below the LCA.', '朴素的做法是先把较深的顶点提升到与另一个相同的深度，然后两个顶点一起每次向上走一步直到相遇——在很深的树上每次询问是 O(n)。通过大步跳跃可以加速。为每个顶点保存它向上 1、2、4、8……层的祖先；第 2ʲ 级祖先就是第 2ʲ⁻¹ 级祖先的第 2ʲ⁻¹ 级祖先，所以这张表很快就能填好。对齐深度只需按深度差的二进制位来跳。第二阶段利用单调性：两个顶点同时向上跳 k 层会落在同一个顶点上，当且仅当 k 不小于到 LCA 的距离。所以从大到小尝试各种跳跃，只有当两个落点不同时才真的跳。最后两个顶点会停在 LCA 的正下方。'],
    pitfalls: [
      ['The loop over j must run from large to small in both phases.', '两个阶段中 j 的循环都必须从大到小。'],
      ['Returning u instead of its parent after the second phase.', '第二阶段结束后返回了 u，而不是它的父亲。'],
      ['Forgetting the case where one vertex is an ancestor of the other.', '忘记处理其中一个顶点本身就是另一个的祖先的情况。'],
      ['The table height must cover log₂ n: 20 levels handle a million vertices.', '表的层数要覆盖 log₂ n：20 层可以应付一百万个顶点。'],
    ],
  },
  'tree-diameter': {
    problem: ['Find the diameter of a tree: the number of edges on the longest path between any two vertices.', '求树的直径：任意两个顶点之间最长路径上的边数。'],
    why: ['Trying every pair of vertices is O(n²). Two searches are enough because of one fact: starting from any vertex s, the vertex u farthest from s is an endpoint of some diameter. Sketch of why: take a true diameter from a to b. The path from s towards u must leave the diameter somewhere, and since u is at least as far from s as a or b is, swapping the corresponding end of the diameter for u cannot make it shorter. Once one endpoint is known, the other is simply the vertex farthest from it. In a tree, distances from one vertex are found by a single BFS or DFS, since there is exactly one path between any two vertices.', '枚举每一对顶点是 O(n²)。只需两次搜索就够了，原因是这样一个事实：从任意顶点 s 出发，离 s 最远的顶点 u 一定是某条直径的端点。大致的理由：取一条真正的直径 a 到 b。从 s 走向 u 的路径总要在某处离开这条直径，而 u 到 s 的距离不小于 a 或 b 到 s 的距离，所以把直径相应的一端换成 u，长度不会变短。一旦知道了一个端点，另一个端点就是离它最远的顶点。在树上，从一个顶点出发的所有距离只需一次 BFS 或 DFS 即可求出，因为任意两点之间恰好只有一条路径。'],
    pitfalls: [
      ['The two-search method fails when edge weights can be negative; use tree DP then.', '边权可能为负时，两次搜索的方法是错的；那时要用树形 DP。'],
      ['The distance array must be reset before the second search.', '第二次搜索之前要把距离数组重新初始化。'],
      ['A tree with one vertex has diameter 0.', '只有一个顶点的树，直径为 0。'],
    ],
  },
  hld: {
    problem: ['Given a rooted tree and q pairs of vertices, find the lowest common ancestor of each pair using heavy-light decomposition.', '给定一棵有根树和 q 对顶点，用树链剖分求每一对顶点的最近公共祖先。'],
    why: ['Many tree problems ask about paths, while our best tools — prefix sums, segment trees — work on arrays. Heavy-light decomposition cuts the tree into vertical chains so that every chain is a contiguous piece of one array and every path consists of only a few pieces. At each vertex call the child with the largest subtree heavy and the others light. Stepping down to a light child at least halves the size of the subtree you are in, so on the way from the root to any vertex there are at most log n light edges — and hence at most log n + 1 chains. To process a path, repeatedly take the endpoint whose chain starts deeper, handle the part of the path on that chain in one go, and jump to the parent of the chain\'s top. When both endpoints are on the same chain, the shallower one is the LCA.', '很多树上的问题问的是路径，而我们最好用的工具——前缀和、线段树——都是针对数组的。树链剖分把树切成若干条竖直的链，使每条链都是同一个数组中连续的一段，并且每条路径只由少数几段组成。在每个顶点处，把子树最大的孩子称为重儿子，其余的称为轻儿子。每走到一个轻儿子，所在子树的大小至少减半，所以从根到任何顶点的路上至多有 log n 条轻边——也就至多 log n + 1 条链。处理一条路径时，反复选取链顶更深的那个端点，一次性处理路径在这条链上的部分，然后跳到链顶的父亲。当两个端点位于同一条链上时，较浅的那个就是 LCA。'],
    pitfalls: [
      ['Comparing the depths of the two vertices instead of the depths of their chain tops.', '比较的是两个顶点自身的深度，而不是它们链顶的深度。'],
      ['Visiting a light child before the heavy child breaks the contiguity of chains in dfn order.', '先访问轻儿子再访问重儿子，会破坏链在 dfn 序中的连续性。'],
      ['Two DFS passes are required: sizes first, chains second.', '需要两遍 DFS：先求子树大小，再划分链。'],
    ],
  },
  dinic: {
    problem: ['A directed graph has a capacity on every edge. Find the largest amount of flow that can be sent from vertex 1 (the source) to vertex n (the sink) without exceeding any capacity.', '有向图的每条边都有一个容量。求在不超过任何边的容量的前提下，从顶点 1（源点）到顶点 n（汇点）最多能输送多少流量。'],
    why: ['The obvious approach — keep finding a path with spare capacity and push flow along it — can paint itself into a corner: an early path may use an edge in a way that blocks better combinations. The fix is the residual graph. Whenever flow is sent along an edge, add the same amount of capacity to a reverse edge. Sending flow along the reverse edge later means cancelling part of the earlier decision. With reverse edges, the flow is maximum exactly when no source-to-sink path with spare capacity remains (the max-flow min-cut theorem). Dinic\'s algorithm organises the search for such paths: a BFS layers the vertices by distance from the source, and a DFS only pushes flow from each layer to the next, which finds many shortest augmenting paths per phase. Each phase increases the distance to the sink, so there are at most n phases.', '最直接的做法——不断找一条还有剩余容量的路径并沿它推流——可能把自己逼进死角：较早的一条路径占用某条边的方式，可能阻碍了更好的组合。解决办法是残量网络。每当沿一条边送出流量，就给它的反向边增加同样多的容量。之后沿反向边送流，就相当于撤销先前决定的一部分。有了反向边，当且仅当不再存在从源点到汇点的、有剩余容量的路径时，流达到最大（最大流最小割定理）。Dinic 算法把寻找这种路径的过程组织起来：BFS 按到源点的距离给顶点分层，DFS 只把流量从一层推向下一层，这样每个阶段能找到许多条最短的增广路。每个阶段都会使到汇点的距离增大，所以至多有 n 个阶段。'],
    pitfalls: [
      ['Edges must be stored in pairs starting at an even index so that id ^ 1 is the reverse edge.', '边必须从偶数下标开始成对存储，这样 id ^ 1 才是反向边。'],
      ['Forgetting to reset the current-arc array before each phase.', '每个阶段开始前忘记重置当前弧数组。'],
      ['Without the current-arc optimisation the DFS retries dead edges and becomes far slower.', '没有当前弧优化，DFS 会反复尝试已经走不通的边，慢很多。'],
      ['The total flow may exceed int; accumulate it in long long.', '总流量可能超出 int；要用 long long 累加。'],
    ],
  },
  hungarian: {
    problem: ['A bipartite graph has nl vertices on the left and nr on the right; an edge means that pair may be matched. Each vertex may be matched at most once. Find the largest possible number of matched pairs.', '二分图左边有 nl 个顶点，右边有 nr 个顶点；一条边表示这两个顶点可以配对。每个顶点最多配对一次。求最多能配成多少对。'],
    why: ['Greedy matching can get stuck: a left vertex may find all its partners taken although a larger matching exists. The remedy is to let earlier choices be revised. Left vertex u looks at a partner v. If v is free, take it. If v is taken by w, ask w to find a different partner — recursively, by the same procedure; if w succeeds, v becomes free for u. A successful chain of such requests is an augmenting path: it alternates between edges not in the matching and edges in it, and starts and ends at unmatched vertices. Swapping the roles of its edges increases the matching by one and keeps everyone on the path matched. A matching is maximum precisely when no augmenting path exists, so trying each left vertex once is enough.', '贪心地配对可能卡住：某个左部点发现它的所有对象都已被占用，但其实存在更大的匹配。补救的办法是允许修改之前的选择。左部点 u 考察一个对象 v。如果 v 空闲，就选它。如果 v 已被 w 占用，就请 w 另找一个对象——递归地使用同样的过程；如果 w 成功了，v 就空出来给 u。这样一串成功的请求就是一条增广路：它在非匹配边和匹配边之间交替，并且起点和终点都是未匹配的顶点。把这条路上的边的角色互换，匹配数增加一，路上原本已匹配的顶点仍然保持匹配。当且仅当不存在增广路时，匹配是最大的；所以对每个左部点尝试一次就够了。'],
    pitfalls: [
      ['The visited array must be cleared before each left vertex, not once at the start.', 'vis 数组要在每个左部点开始前清空，而不是只在最开始清空一次。'],
      ['Marking v as visited after the recursive call (instead of before) can recurse forever.', '在递归调用之后（而不是之前）才标记 v 已访问，可能导致无限递归。'],
      ['It is O(n · m); for very large graphs use Hopcroft–Karp or a flow algorithm.', '复杂度是 O(n · m)；图非常大时应使用 Hopcroft–Karp 或网络流。'],
    ],
  },
  'euler-path': {
    problem: ['Can a drawing made of points and lines be traced in one stroke, going over every line exactly once? If so, give the order in which the points are visited.', '一幅由点和线组成的图，能不能一笔画成，每条线恰好经过一次？如果能，给出经过各个点的顺序。'],
    why: ['Whether a single stroke exists is decided by counting. Passing through a vertex uses two of its edges, one to arrive and one to leave, so every vertex except the first and the last of the walk must have even degree. A connected graph therefore has such a walk exactly when it has zero odd vertices (the walk is a closed circuit) or two (it runs from one to the other). Finding the walk is the subtle part. Simply walking along unused edges gets stuck too early: you return to a vertex with no free edge while other parts of the graph are still untouched. Hierholzer\'s method fixes this without ever searching again. Walk as far as possible; when stuck at a vertex, write it down and step back along the walk. On the way back, any vertex that still has a free edge sets off on a new side tour, which must eventually return to it. Because vertices are written down only when they are completely finished, each side tour is recorded in exactly the right place, and the list, read backwards, is the Euler path.', '能否一笔画成，数一数就知道。经过一个顶点一次要用掉它的两条边，一条进、一条出，所以除了路线的起点和终点，每个顶点的度都必须是偶数。因此一个连通图存在这样的路线，当且仅当奇度顶点有 0 个（路线是一个回路）或 2 个（从其中一个走到另一个）。真正微妙的是把路线找出来。只是沿着没用过的边往前走，会过早地卡住：你回到一个已经没有空闲边的顶点，而图的其他部分还没有走到。Hierholzer 的方法不需要重新搜索就解决了这个问题。尽量往前走；在某个顶点卡住时，把它记下来，沿着来路退回一步。回退途中，只要某个顶点还有空闲的边，就从它出发走一段新的支线，这段支线最终一定会回到它。由于顶点只在彻底走完时才被记下，每段支线都恰好记录在正确的位置，把这个列表倒过来读就是欧拉路径。'],
    pitfalls: [
      ['Checking degrees is not enough: the edges must also be connected. Compare the length of the result with m + 1.', '只检查度数是不够的：所有的边还必须连通。要把结果的长度与 m + 1 比较。'],
      ['With two odd vertices, the walk must start at one of them. Starting anywhere else gets stuck for good.', '有两个奇度顶点时，必须从其中一个出发。从别处出发会彻底卡住。'],
      ['Re-scanning the whole adjacency list of a vertex on every visit makes the method quadratic. Keep a position cur[u] per vertex.', '每次到达一个顶点都把它的邻接表从头扫一遍，会让算法退化成平方级。要为每个顶点记录读到的位置 cur[u]。'],
      ['An undirected edge sits in two adjacency lists. Mark it by its edge number, or it will be walked twice.', '一条无向边同时在两个邻接表里。要按边的编号标记，否则它会被走两遍。'],
    ],
  },
  'second-shortest': {
    problem: ['Roads connect n junctions. Find the length of the shortest route from junction 1 to junction n that is strictly longer than the shortest one. A route may use a road more than once.', '有 n 个路口，由若干条道路相连。求从路口 1 到路口 n 的路线中，严格长于最短路的那些里最短的一条的长度。同一条道路可以经过多次。'],
    why: ['Dijkstra\'s algorithm keeps one number per vertex, and that is one too few here. Think about where the second-shortest route to v comes from: it reaches some neighbour u and then takes the edge u → v. Its part up to u need not be shortest — but it is either a shortest or a second-shortest route to u, because any longer route to u could be replaced by a better one and still give a valid, shorter candidate. So two numbers per vertex are enough: d1, the shortest distance, and d2, the smallest distance strictly greater than d1. Both kinds go into the heap, and both are extended along the edges when they are popped. A new candidate that beats d1 takes its place, and the value it pushed out is not thrown away: it may be the new d2. A candidate strictly between d1 and d2 becomes d2. The heap still hands out distances in increasing order, so each of the two values of a vertex is final when it is popped.', 'Dijkstra 算法为每个顶点保存一个数，在这里少了一个。想想到 v 的次短路线是怎么来的：它先到达某个邻居 u，再走边 u → v。它到 u 的那一段不一定是最短的——但一定是到 u 的最短路或次短路，因为如果到 u 的那一段更长，就可以换成更好的一段，仍然得到一条合法且更短的候选路线。所以每个顶点保存两个数就够了：d1 是最短距离，d2 是严格大于 d1 的距离中最小的。这两种距离都要放进堆里，取出时都要沿着边继续延伸。一个新的候选值如果比 d1 小，就取代 d1，而被挤掉的那个值并不丢弃：它可能成为新的 d2。严格介于 d1 和 d2 之间的候选值则成为 d2。堆仍然按从小到大的顺序交出距离，所以一个顶点的两个值在被取出时就已经确定了。'],
    pitfalls: [
      ['Skipping a popped entry when du > d1[u], as in plain Dijkstra, throws away every second-shortest distance.', '像普通 Dijkstra 那样在 du > d1[u] 时跳过，会把所有的次短距离都丢掉。'],
      ['When d1 improves, the old d1 must be offered to d2. Forgetting this loses the answer whenever the two best routes arrive in the "wrong" order.', 'd1 被更新时，原来的 d1 必须交给 d2 去比较。忘了这一点，只要两条最好的路线到达的先后顺序“不巧”，答案就会丢失。'],
      ['Decide whether "second" means strictly longer. If equal lengths count, the test nd > d1[v] must become nd >= d1[v] — and the counting changes.', '要想清楚“次短”是否要求严格更长。如果长度相等也算，判断 nd > d1[v] 就得改成 nd >= d1[v]——含义也随之改变。'],
      ['Here a route may repeat roads. If every vertex may be used only once, the problem is much harder and this method does not apply.', '这里的路线可以重复经过道路。如果要求每个顶点只能经过一次，问题就难得多，这个方法不再适用。'],
    ],
  },
  'two-sat': {
    problem: ['There are n yes/no decisions and m conditions, each of the form "decision i is a, or decision j is b". Find a way to make all decisions so that every condition holds, or report that it cannot be done.', '有 n 个“是/否”的决定和 m 个条件，每个条件形如“第 i 个决定是 a，或者第 j 个决定是 b”。求一种做出所有决定的方式，使每个条件都成立；或者报告这是不可能的。'],
    why: ['With three options per condition this problem is among the hardest known; with two it is solved in linear time, and the reason is that a two-option condition can be rewritten as implications. "A or B" says exactly: if A is false then B is true, and if B is false then A is true. Build a graph with one vertex for each literal — "xᵢ is true" and "xᵢ is false" for every variable — and one edge per implication. Following edges means following forced consequences: if a literal is chosen, everything reachable from it must be chosen too. Literals inside one strongly connected component can reach each other, so they stand or fall together. This already gives a necessary condition: if a variable\'s two literals are in the same component, choosing either forces the other, and there is no solution. Surprisingly, that is also sufficient. Contract each component to a point; the result is a graph without cycles, and it is symmetric: wherever A implies B, not-B implies not-A. For every variable take the literal whose component is later in topological order. A chosen literal can only imply literals that are later still, and by the symmetry none of those can be a rejected one. Tarjan\'s algorithm numbers the components in reverse topological order as it finds them, so "later" simply means "smaller number".', '如果每个条件有三个选项，这个问题属于已知最难的那一类；而只有两个选项时，它可以在线性时间内解决，原因在于两个选项的条件可以改写成推导关系。“A 或 B”恰好是说：A 为假时 B 为真，B 为假时 A 为真。建一张图：每个文字——每个变量的“xᵢ 为真”和“xᵢ 为假”——是一个顶点，每条推导关系是一条边。沿着边走就是沿着“必然的后果”走：选了某个文字，从它能到达的所有文字也都必须选。同一个强连通分量里的文字可以互相到达，所以它们同进同退。由此立刻得到一个必要条件：如果某个变量的两个文字在同一个分量里，选哪一个都会推出另一个，于是无解。出人意料的是，这个条件也是充分的。把每个分量缩成一个点，得到的图没有环，而且具有对称性：只要 A 能推出 B，非 B 就能推出非 A。对每个变量，取所在分量在拓扑序中更靠后的那个文字。被选中的文字只能推出更靠后的文字，而根据对称性，那些文字不可能是被舍弃的。Tarjan 算法在找到分量时给它们的编号恰好是逆拓扑序，所以“更靠后”就是“编号更小”。'],
    pitfalls: [
      ['Adding only one of the two implications loses half of the condition. Every condition gives two edges.', '只连两条推导关系中的一条，就丢掉了条件的一半。每个条件都对应两条边。'],
      ['The comparison direction depends on how components are numbered. With Tarjan, smaller means later in topological order; with Kosaraju it is the opposite.', '比较的方向取决于分量的编号方式。用 Tarjan 时，编号小表示拓扑序靠后；用 Kosaraju 时正好相反。'],
      ['"xᵢ must be true" is the condition "xᵢ or xᵢ": one edge from ¬xᵢ to xᵢ.', '“xᵢ 必须为真”就是条件“xᵢ 或 xᵢ”：从 ¬xᵢ 向 xᵢ 连一条边。'],
      ['The graph has 2n vertices and 2m edges: size the arrays accordingly.', '图有 2n 个顶点和 2m 条边：数组要按这个大小来开。'],
    ],
  },
  km: {
    problem: ['n workers and n jobs: giving job j to worker i is worth w[i][j]. Assign every worker a different job so that the total worth is as large as possible.', 'n 个工人和 n 项工作：把工作 j 交给工人 i 的价值是 w[i][j]。给每个工人分配互不相同的一项工作，使总价值尽可能大。'],
    why: ['There are n! assignments, and taking the largest weights greedily fails: the best job for one worker may be the only good job for another. The Kuhn–Munkres algorithm replaces the search over assignments by a search over prices. Give every worker i a number u[i] and every job j a number v[j] — their labels — such that u[i] + v[j] is at least w[i][j] for every pair. Then any assignment whatever is worth at most the sum of all labels, since each of its edges is covered by the two labels at its ends and every label is used exactly once. So the label sum is an upper bound, and an assignment that uses only edges where u[i] + v[j] equals w[i][j] exactly — tight edges — reaches the bound and must be optimal. The algorithm therefore looks for a perfect matching among tight edges, with augmenting paths as in the Hungarian algorithm. When the search for the current worker is stuck, no tight edge leaves the set of workers and jobs it has reached. Among the edges that do leave it, from a reached worker to an unreached job, take the smallest slack u + v − w and call it delta. Lower the labels of all reached workers by delta and raise those of all reached jobs by delta. Edges inside the reached set keep their sums, so the tree stays tight; no label sum falls below a weight, because delta was the smallest slack; and the edge that had that slack is now tight, so the search can continue. Each worker is placed after at most n such steps of n operations each, giving n³ in total.', '分配方案有 n! 种，而贪心地每次取最大的权值是行不通的：对某个工人最好的工作，可能是另一个工人唯一合适的工作。KM 算法把“在方案中搜索”换成了“在价格中搜索”。给每个工人 i 一个数 u[i]，给每项工作 j 一个数 v[j]——称为顶标——使得每一对都满足 u[i] + v[j] 不小于 w[i][j]。这样，任何一种分配方案的价值都不超过所有顶标之和，因为方案中的每条边都被它两端的顶标盖住，而每个顶标恰好用了一次。所以顶标之和是一个上界；如果一个方案只用到 u[i] + v[j] 恰好等于 w[i][j] 的边——相等边——它就达到了这个上界，必然是最优的。于是算法在相等边中寻找完美匹配，方法和匈牙利算法一样是找增广路。当为当前工人进行的搜索卡住时，说明已到达的工人和工作构成的集合没有相等边伸出去。在确实伸出去的边——从已到达的工人连向未到达的工作——当中，取最小的松弛量 u + v − w，记作 delta。把所有已到达的工人的顶标减去 delta，把所有已到达的工作的顶标加上 delta。集合内部的边两端之和不变，所以搜索树里的边仍然是相等边；因为 delta 是最小的松弛量，任何一对顶标之和都不会降到权值以下；而原来松弛量最小的那条边现在成了相等边，搜索可以继续。每个工人至多经过 n 次这样的步骤就能安排好，每次步骤 n 次运算，总共 n³。'],
    pitfalls: [
      ['The simple version that restarts the search after every relabelling is O(n⁴). Keeping the smallest slack per job (minv) is what makes it O(n³).', '每次修改顶标之后都重新搜索的简单写法是 O(n⁴)。为每项工作保存最小松弛量（minv）才能做到 O(n³)。'],
      ['It finds a perfect matching. If some pairs are forbidden, give them a very negative weight — and check afterwards that none was used.', '它求的是完美匹配。如果某些配对是不允许的，要给它们一个非常小的负权值——并在最后检查有没有用到它们。'],
      ['With different numbers of workers and jobs, pad the smaller side with dummy rows or columns of weight 0.', '工人数和工作数不相等时，要用权值为 0 的虚拟行或虚拟列把较小的一边补齐。'],
      ['For the cheapest assignment instead of the most valuable, negate all weights.', '如果要求的是代价最小而不是价值最大的分配，把所有权值取相反数即可。'],
    ],
  },
}

/** Where each problem shows up outside contests, shown on the Problem tab. Same inline markup as the Ideas story. */
export const REAL: Record<string, L> = {
  'graph-dfs': ['Exploring a **cave system** with a ball of string: go as deep as you can, and when stuck follow the string back to the last junction. Web crawlers and garbage collectors ("which objects are still reachable?") walk graphs this way.', '带着一团线探索**洞穴**：能往深处走就一直走，走不通就顺着线退回上一个岔路口。网络爬虫和垃圾回收器（“哪些对象还能被访问到？”）都是这样遍历图的。'],
  'graph-bfs': ['"**Six degrees of separation**": how many handshakes are you from anyone else? A social network finds "people you may know" by looking at everyone one step away, then two steps, and so on.', '“**六度分隔**”：你和世界上任何一个人之间隔着几次握手？社交网络寻找“你可能认识的人”，就是先看距离一步的人，再看两步的人，依此类推。'],
  dijkstra: ['Every **navigation app**: roads are edges, travel times are weights, and you ask for the fastest route. The internet routes your data with the same algorithm (the OSPF protocol).', '所有的**导航软件**：道路是边，行驶时间是边权，你要的是最快的路线。互联网也用同一个算法为你的数据选路（OSPF 协议）。'],
  spfa: ['**Currency exchange**: if changing money around a loop of currencies ends with more than you started with, there is a "negative cycle" — an arbitrage opportunity. Bellman–Ford is the standard way to detect it.', '**货币兑换**：如果沿着一圈货币换下来，手里的钱比开始时还多，就存在一个“负环”——也就是套利机会。Bellman–Ford 是检测它的标准方法。'],
  floyd: ['The **distance chart** in a road atlas, giving the distance between every pair of cities. With a few hundred places, three nested loops fill in the whole table — and tell you which places can reach which.', '公路地图册里的**里程表**，给出每两个城市之间的距离。只有几百个地点时，三重循环就能填满整张表——还能顺便知道哪些地方互相可达。'],
  prim: ['Laying **water pipes or fibre** to connect every house in a new district with as little digging as possible: start from one house and keep adding the cheapest connection to a house not yet reached.', '给新建小区铺设**水管或光纤**，要让每户都连通并且挖沟最少：从一户出发，不断添加通往尚未连通住户的最便宜的那条线路。'],
  kruskal: ['Planning a **power grid** between towns from a price list of possible lines: go through the list from cheapest to dearest and build a line unless the two towns are already connected. Clustering algorithms group data the same way.', '根据一份备选线路的报价单，规划城镇之间的**电网**：从最便宜的线路看起，只要两端的城镇还没连通就修。聚类算法也是用同样的方式给数据分组。'],
  'topo-sort': ['**Course prerequisites**: in which order can you take the courses so that every requirement comes first? `make`, `npm` and spreadsheets order compilation steps, package installs and cell updates this way.', '**课程的先修关系**：按什么顺序选课，才能保证每门课的先修课都排在它前面？`make`、`npm` 和电子表格就是这样安排编译步骤、软件包安装和单元格计算的顺序的。'],
  bipartite: ['Can a class be split into **two teams** so that no two pupils who quarrel are on the same team? The same test decides whether a map of constraints can be coloured with two colours, and precedes every matching problem.', '能不能把一个班分成**两队**，使得互相有矛盾的两个同学不在同一队？同样的判定可以决定一张约束图能否用两种颜色染色，也是所有匹配问题的前提。'],
  'tarjan-scc': ['In a city of **one-way streets**, which districts can you drive around in and return to where you started? Compilers use the same components to find groups of functions that call each other recursively.', '在一座全是**单行道**的城市里，哪些街区能让你开车绕一圈回到出发点？编译器用同样的连通分量找出互相递归调用的函数组。'],
  'cut-bridge': ['Which single **router or cable**, if it fails, cuts part of a network off? Which one bridge isolates an island when it closes? Network engineers look for exactly these weak points.', '哪一台**路由器或哪一根网线**坏掉会让一部分网络断开？哪一座桥封闭会让小岛与外界隔绝？网络工程师要找的正是这些薄弱点。'],
  lca: ['In a **family tree**: who is the closest common ancestor of two people? In a company chart: who is the lowest manager above both employees? `git merge` starts by finding the common ancestor of two branches.', '在**家谱**里：两个人最近的共同祖先是谁？在公司的组织架构里：同时管着两名员工的最低一级主管是谁？`git merge` 的第一步就是找两个分支的共同祖先。'],
  'tree-diameter': ['In a tree-shaped **computer network**, the diameter is the worst delay between any two machines. Putting the main server at its midpoint minimises the longest distance to anyone.', '在树形的**计算机网络**中，直径就是任意两台机器之间最坏的延迟。把主服务器放在直径的中点，可以让它到最远机器的距离最小。'],
  hld: ['A tree-shaped **road or pipe network** where you repeatedly ask for the total toll, or raise the price, along the route between two towns. Cutting the tree into chains turns each route into a few array ranges.', '树形的**公路网或管网**，需要反复询问两个城镇之间路线上的总收费，或者给沿途统一涨价。把树剖成若干条链之后，每条路线就变成了数组上的几段区间。'],
  dinic: ['How many **cars per hour** can get from the city centre to the airport when every road has a capacity? The same model sizes pipelines and data networks, and schedules airline crews.', '每条道路都有通行能力，每小时最多能有多少**车辆**从市中心开到机场？同样的模型也用来设计输油管道和数据网络，以及给航班安排机组。'],
  hungarian: ['Assigning **workers to jobs** each is qualified for, students to dormitory rooms, or drivers to ride requests, so that as many as possible are matched.', '把**工人分配到**各自能胜任的岗位，把学生分配到宿舍，把司机分配给乘车请求，并让匹配成功的数量尽可能多。'],
  'euler-path': ['A **snow plough** or a postal worker should cover every street of a district once and not twice. City planners use exactly this test — count the junctions where an odd number of streets meet — and add as few repeated streets as possible to make the tour work.', '**扫雪车**或邮递员应当把一个街区的每条街道走一遍，而不是两遍。城市规划者用的正是这个判别法——数一数有奇数条街道交汇的路口——然后补上尽量少的重复路段，使整条路线可行。'],
  'second-shortest': ['A **navigation app** offers "alternative route: 4 minutes longer". The best route may be jammed or closed, so it also computes the next best — and a data network does the same to have a backup path ready when a cable fails.', '**导航软件**会提示“备选路线：多 4 分钟”。最佳路线可能堵车或封路，所以它还要算出次优的路线——数据网络也是如此，以便在线路故障时有备用路径可用。'],
  'two-sat': ['Placing **labels on a map** is 2-SAT: each town name goes either above or below its dot, and two names must not overlap. So is checking a set of software settings where each rule says "feature A off, or feature B on". The problem looks like logic and is solved by walking a graph.', '在**地图上放置地名**就是 2-SAT：每个地名要么放在圆点上方，要么放在下方，而两个地名不能重叠。检查一组软件配置是否自相矛盾也是如此，其中每条规则形如“关闭功能 A，或者开启功能 B”。这个问题看起来属于逻辑，却是靠在图上行走来解决的。'],
  km: ['A **ride-hailing service** assigning drivers to passengers, a hospital matching surgeons to operations, or a tracker deciding which dot on this radar frame is which aircraft from the last one: each is an assignment problem with a cost table, solved this way millions of times a day.', '**网约车平台**把司机分配给乘客，医院把外科医生安排给手术，雷达跟踪系统判断这一帧上的每个光点对应上一帧的哪架飞机：这些都是带有代价表的分配问题，每天要用这种方法求解上百万次。'],
}
