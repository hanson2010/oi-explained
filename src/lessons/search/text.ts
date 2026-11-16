import type { L } from '../../engine/types'
import type { Prose } from '../extras'

/** The problem each lesson solves, why the method works, and common mistakes. */
export const TEXT: Record<string, Prose> = {
  'n-queens': {
    problem: ['Place n queens on an n × n chessboard so that no two attack each other (no shared row, column or diagonal). Count the number of ways.', '在 n × n 的棋盘上放置 n 个皇后，使它们互不攻击（任意两个不在同一行、同一列或同一条对角线上）。求方案数。'],
    why: ['Every row must contain exactly one queen, so decide the rows one after another: for row r try each column, and for each column that is not attacked, place the queen and continue with row r + 1. When all columns of a row have been tried, return and let the previous row try its next column. This is depth-first search with backtracking — a systematic walk through a tree of partial placements. Checking attacks immediately is what makes it feasible: the moment a square is attacked, the whole subtree of boards built on top of it is skipped. Without that pruning there would be nⁿ boards to examine.', '每一行必须恰好有一个皇后，所以逐行决定：对第 r 行尝试每一列，只要该列不被攻击，就放下皇后并继续处理第 r + 1 行。当一行的所有列都试过后，返回上一行，让它尝试下一列。这就是带回溯的深度优先搜索——系统地遍历“部分摆放方案”构成的树。立刻检查冲突是它可行的关键：一旦某个格子被攻击，建立在它之上的整棵子树都被跳过。如果没有这种剪枝，就要检查 nⁿ 种棋盘。'],
    pitfalls: [
      ['Forgetting to clear the three marks after the recursive call leaves the board "dirty" for later branches.', '递归返回后忘记清除三个标记，会让后面的分支看到“脏”的棋盘。'],
      ['r − c can be negative; add n before using it as an index.', 'r − c 可能为负；用作下标前要加上 n。'],
      ['The diagonal arrays need 2n cells, not n.', '对角线数组要开 2n 而不是 n。'],
    ],
  },
  'bfs-maze': {
    problem: ['In a grid of free cells and walls, find the minimum number of moves (up, down, left, right) from the top-left cell to the bottom-right cell.', '在由空地和墙组成的网格中，求从左上角走到右下角最少需要多少步（每步上、下、左、右移动一格）。'],
    why: ['Imagine pouring water on the start cell: after one second it has reached all cells one step away, after two seconds all cells two steps away. Breadth-first search simulates exactly this, using a queue. Cells are taken from the front of the queue and their undiscovered neighbours are added at the back, so cells are processed in the order they were discovered — all cells at distance d before any at distance d + 1. Consequently the first time a cell is discovered, it has been reached by a shortest route, and its distance never needs to be revised. Depth-first search would also find a route, but not necessarily a shortest one.', '想象把水倒在起点：一秒后水到达所有距离为 1 的格子，两秒后到达所有距离为 2 的格子。广度优先搜索借助队列精确地模拟这个过程。从队首取出格子，把它尚未发现的邻居加到队尾，于是格子按被发现的顺序处理——所有距离为 d 的格子都排在距离为 d + 1 的格子之前。因此一个格子第一次被发现时，走的就是最短路线，它的距离以后不需要再修改。深度优先搜索也能找到一条路，但不一定最短。'],
    pitfalls: [
      ['Marking a cell as visited only when it is popped lets it be pushed many times — slow and memory-hungry.', '出队时才标记已访问，会让同一个格子多次入队——又慢又占内存。'],
      ['Check the bounds before reading the grid cell, not after.', '先判断是否越界，再访问网格，而不是反过来。'],
      ['BFS gives shortest paths only when every move costs the same; with weights use Dijkstra.', '只有每一步代价相同时 BFS 才给出最短路；带权时要用 Dijkstra。'],
    ],
  },
  'flood-fill': {
    problem: ['A grid consists of land (#) and water (.). Two land cells belong to the same island if they are adjacent horizontally or vertically. Count the islands.', '网格由陆地（#）和水（.）组成。上下左右相邻的陆地属于同一座岛。求岛屿的数量。'],
    why: ['An island is a connected region. Pick any land cell that has not been labelled yet: it belongs to an island you have not counted, so count one. Then label the entire island so that it is never counted again — spread from that cell to its land neighbours, from them to their neighbours, and so on, exactly like paint flooding a region. When the spreading stops, every cell of that island carries the label. Continue scanning the grid for the next unlabelled land cell. Each cell is labelled once and examined a constant number of times, so the whole grid is processed in time proportional to its size.', '一座岛就是一个连通区域。任取一个尚未标记的陆地格子：它属于一座还没数过的岛，于是计数加一。接着把整座岛都标记上，保证它不会被再数一次——从这个格子扩散到相邻的陆地，再扩散到它们的邻居，如此继续，就像油漆漫过一片区域。扩散停止时，这座岛的每个格子都带上了标记。然后继续扫描网格，寻找下一个未标记的陆地格子。每个格子只被标记一次、被查看常数次，所以整张网格的处理时间与其大小成正比。'],
    pitfalls: [
      ['A recursive fill on a 1000 × 1000 grid can recurse a million levels deep and crash; use a queue or an explicit stack.', '在 1000 × 1000 的网格上用递归填充，递归深度可达一百万层而崩溃；应使用队列或显式的栈。'],
      ['Be clear whether diagonal neighbours count (8-connectivity) — it changes the answer.', '要弄清对角相邻是否算连通（八连通）——这会改变答案。'],
      ['Label a cell when it is added to the queue, not when it is removed.', '格子入队时就打标记，而不是出队时。'],
    ],
  },
  'a-star': {
    problem: ['In a grid with walls, find the minimum number of moves from the top-left cell to the bottom-right cell, exploring as few cells as possible.', '在有墙的网格中，求从左上角到右下角的最少步数，并尽量少探索格子。'],
    why: ['BFS explores in every direction equally, including directly away from the target. A* adds a sense of direction. For each discovered cell it knows g, the distance travelled so far, and estimates h, the distance still to go; it always expands the cell with the smallest f = g + h, the most promising total. The estimate must be optimistic — never larger than the true remaining distance. Then a cell whose f exceeds the true answer can never be needed before the target is reached, so the first time the target is expanded its distance is optimal. On a grid with 4-directional moves the Manhattan distance is such an estimate: walls can only lengthen the way. With h = 0 everywhere, A* degenerates into Dijkstra.', 'BFS 向各个方向均匀地探索，包括背离终点的方向。A* 为搜索加上了方向感。对每个已发现的格子，它知道已走的距离 g，并估计还需要走的距离 h；每次扩展 f = g + h 最小的格子，也就是总路程最有希望的那个。估计必须是乐观的——不能超过真实的剩余距离。这样，f 超过真实答案的格子在到达终点之前永远不会被需要，所以终点第一次被扩展时，它的距离就是最优的。在四方向移动的网格上，曼哈顿距离正是这样的估计：墙只会让路变长。如果处处 h = 0，A* 就退化成 Dijkstra。'],
    pitfalls: [
      ['An estimate that can overestimate (e.g. 2 × Manhattan) may return a path that is not shortest.', '可能高估的估计（例如 2 × 曼哈顿距离）会导致找到的不是最短路。'],
      ['Outdated heap entries must be skipped, exactly as in Dijkstra.', '过期的堆元素必须跳过，与 Dijkstra 完全一样。'],
      ['In the worst case (a maze full of dead ends) A* still explores everything.', '在最坏情况下（到处是死胡同的迷宫），A* 仍然要探索全部格子。'],
    ],
  },
  permutations: {
    problem: ['Print every way to arrange the numbers 1 … n in a row, in dictionary order.', '按字典序输出把 1 … n 排成一行的所有方法。'],
    why: ['For a fixed small n you could write n nested loops, but the number of loops would depend on the input. Recursion provides "a loop inside a loop, n deep". The function dfs(k) is responsible for position k: it tries each number that is still free, places it, and calls dfs(k + 1) to deal with the remaining positions. When all n positions are filled, a permutation is complete and is printed. The step that makes this a search is what happens after the call returns: the number just placed is marked free again. Without that, the first complete permutation would use up all the numbers and nothing else could ever be placed. Placing, exploring, and undoing — backtracking — walks through a tree whose leaves are exactly the n! permutations, and because the numbers are tried in increasing order, the leaves are reached in dictionary order.', '如果 n 是一个固定的小数，可以写 n 重循环，但循环的层数不能由输入决定。递归正好提供了“循环套循环，一共 n 层”。函数 dfs(k) 负责第 k 个位置：它依次尝试每个还没用过的数，放上去，再调用 dfs(k + 1) 处理剩下的位置。n 个位置都填好时，一个排列就完成了，把它输出。让这个过程成为“搜索”的关键在于递归返回之后做的事：把刚才放上去的数重新标记为可用。如果不这样做，第一个完整的排列就会把所有数用光，之后什么都放不了。放置、探索、撤销——也就是回溯——走遍了一棵树，树的叶子正好是 n! 个排列；又因为各个数是从小到大尝试的，叶子被访问的顺序就是字典序。'],
    pitfalls: [
      ['Forgetting used[x] = false after the recursive call: only the first permutation is printed.', '递归调用之后忘记写 used[x] = false：只会输出第一个排列。'],
      ['n! grows explosively: 10! is 3.6 million, 13! is over 6 billion. Check n before generating all permutations.', 'n! 增长得极快：10! 是 360 万，13! 超过 60 亿。生成全排列之前先看看 n 有多大。'],
      ['Printing inside the loop instead of at k > n outputs unfinished arrangements.', '在循环里而不是在 k > n 时输出，会把还没填完的排列也输出来。'],
    ],
  },
  'memo-search': {
    problem: ['A grid gives the height of each cell of a ski slope. From any cell you may slide to a neighbouring cell (up, down, left or right) that is strictly lower. How many cells does the longest possible run visit?', '一个网格给出滑雪场每个格子的高度。从任意格子出发，可以滑向上下左右相邻且严格更低的格子。最长的路线能经过多少个格子？'],
    why: ['Ask one question of each cell: how long is the best run that starts here? The answer is 1 for the cell itself, plus the best answer among its lower neighbours — a recursive definition, and a recursive function follows it line by line. Written plainly, though, that function is disastrously slow: a cell that lies below many others is reached along many different paths, and the function works its answer out again each time. The remedy uses one observation: the answer for a cell depends only on the cell, never on the route by which the search arrived. So the first time it is computed, write it into a table; every later call returns the table entry at once. Now each cell is solved exactly once, and the total work is the number of cells times four. This is dynamic programming in disguise. A bottom-up DP would have to process the cells from the lowest to the highest; the recursion visits them in a workable order without being told.', '对每个格子问同一个问题：从这里出发，最长能滑多远？答案是它自己这 1 格，加上所有更低的邻居中最好的答案——这是一个递归的定义，递归函数照着它一行一行写出来即可。但是直接这样写，函数会慢得离谱：一个位于许多格子下方的格子，会沿着许多不同的路径被到达，而函数每次都要把它的答案重算一遍。补救的办法只用到一个观察：一个格子的答案只取决于这个格子本身，与搜索是从哪条路走到这里的无关。所以第一次算出来时，把它写进一张表；以后每次调用都直接返回表里的值。这样每个格子恰好只求解一次，总工作量是格子数乘以四。这其实就是换了一种写法的动态规划。自底向上的 DP 必须按高度从低到高处理格子；而递归不需要别人告诉它，就能按一个可行的顺序访问它们。'],
    pitfalls: [
      ['The stored value must depend only on the arguments. If the answer also depends on the path so far or on a global variable, memoising gives wrong results.', '存下来的值必须只取决于函数的参数。如果答案还与走过的路径或某个全局变量有关，记忆化就会得到错误的结果。'],
      ['Choose an "unknown" marker that is not a possible answer. Here 0 works because every answer is at least 1; when 0 is a valid answer, use −1.', '“未知”的标记必须是一个不可能出现的答案。这里可以用 0，因为每个答案至少是 1；如果 0 也是合法答案，就用 −1。'],
      ['With equal heights allowed (≥ instead of >), two cells could call each other forever. The strict comparison is what makes the recursion end.', '如果允许高度相等（把 > 写成 ≥），两个格子就可能无休止地互相调用。正是严格的比较保证了递归会结束。'],
      ['The recursion can be as deep as the longest run. On a very large grid, check the stack limit.', '递归深度可能与最长路线一样长。网格很大时要注意栈空间限制。'],
    ],
  },
  'bidir-bfs': {
    problem: ['In a grid of free cells and walls, find the fewest moves from the top-left to the bottom-right cell — knowing both where you start and where you want to end.', '在一个由空地和墙组成的网格中，求从左上角到右下角的最少步数——起点和终点都是已知的。'],
    why: ['An ordinary breadth-first search spreads out from the start like a ripple and stops when the ripple touches the target. Everything inside the ripple has been visited, and its size grows quickly with the radius: on an open grid like the square of the distance, in a puzzle where each state has b successors like b to the power of the distance. When the target is known too, start a second ripple from it. The two meet after each has travelled only about half the distance, and two half-size ripples cover much less than one full-size one — for the puzzle, 2 · b^(d/2) states instead of b^d. The program keeps two distance arrays and two frontiers. In each round it expands the smaller frontier by one complete layer. When a cell that is new for one side has already been reached by the other, the two distances add up to the length of a path through that cell. The layer is finished before stopping and the smallest such sum is kept, because the first meeting found within a layer need not be the best one.', '普通的广搜像水波一样从起点向外扩散，波纹碰到终点时停止。波纹内部的所有状态都被访问过，而它的大小随半径增长得很快：在开阔的网格上与距离的平方成正比；在每个状态有 b 个后继的智力题中，则是 b 的距离次方。既然终点也是已知的，就从终点再放出一圈波纹。两圈波纹各走大约一半的距离就会相遇，而两个半径减半的波纹覆盖的范围比一个完整的波纹小得多——对于智力题，是 2 · b^(d/2) 个状态，而不是 b^d 个。程序保存两个距离数组和两个当前层。每一轮把较小的那一层完整地向外扩展一步。当一边新到达的格子已经被另一边到达过，两个距离相加就是经过这个格子的一条路径的长度。要把这一层扩展完再停，并保留其中最小的和，因为一层之内最先发现的相遇点不一定是最好的。'],
    pitfalls: [
      ['Stopping at the very first meeting inside a layer can give an answer that is one too long. Finish the layer and take the minimum.', '在一层之内刚一相遇就停，答案可能会多 1。要把这一层扩展完，取最小值。'],
      ['One visited array for both sides cannot tell "seen by my own side" from "seen by the other side". Keep two.', '两边共用一个访问数组，就分不清“被自己这边访问过”和“被另一边访问过”。要用两个数组。'],
      ['If either frontier becomes empty, there is no path — do not wait for both.', '只要有一边的当前层为空，就说明没有路径——不必等两边都为空。'],
      ['It needs moves that can be reversed. If moves are one-way, the search from the target must follow them backwards.', '它要求移动是可逆的。如果移动是单向的，从终点出发的搜索必须沿着反方向走。'],
    ],
  },
  iddfs: {
    problem: ['Starting from 1, each step adds the current number to itself or to an earlier number of the sequence. What is the smallest number of steps that produces n? (1, 2, 4, 5 reaches 5 in three steps.)', '从 1 开始，每一步把当前的数加上它自己或序列中更早的某个数。最少几步能得到 n？（1, 2, 4, 5 用三步得到 5。）'],
    why: ['The shortest answer is wanted, which suggests breadth-first search — but a state here is a whole sequence, and the number of sequences of each length explodes: there is no room to store a layer. Depth-first search needs only the current sequence, but left alone it will happily add 1 again and again and find a very long chain first. Iterative deepening combines the two. Run a depth-first search that is forbidden to make more than `limit` steps. Try limit 0, then 1, then 2, and so on. The first limit for which the search succeeds is by construction the smallest number of steps. The repeated work looks wasteful but is not: each level of the search tree is several times larger than the one before, so all the earlier rounds together cost less than the last one. Knowing the limit also allows a sharp cut. The largest number can at most double per step, so if doubling it in every remaining step still falls short of n, the branch is dead and is abandoned immediately.', '题目要的是最短的答案，这让人想到广搜——但这里的一个状态是一整条序列，每种长度的序列数量都会爆炸式增长：根本没有空间存下一层。深搜只需要保存当前这一条序列，但如果放任不管，它会乐此不疲地一次次加 1，先找到一条很长的链。迭代加深把两者结合起来。让深搜不得超过 `limit` 步，依次尝试 limit = 0、1、2……第一个能搜到解的限制，按构造就是最少的步数。重复搜索看起来浪费，其实不然：搜索树的每一层都比上一层大好几倍，所以前面所有轮次加起来还不如最后一轮的代价大。知道了深度限制，还可以做一个很强的剪枝：最大的数每一步最多翻倍，所以如果剩下的每一步都翻倍仍然到不了 n，这个分支就没有希望，立刻放弃。'],
    pitfalls: [
      ['Without the depth test the search dives down the first branch (1, 2, 3, 4, …) and returns a chain far from the shortest.', '如果没有深度限制，搜索会沿着第一个分支（1, 2, 3, 4, …）一路走下去，返回一条远不是最短的链。'],
      ['Forgetting the pruning test still gives correct answers, but the running time explodes a few limits earlier.', '忘记剪枝仍然能得到正确答案，但运行时间会早好几层就爆炸。'],
      ['Shifting an int by the remaining depth can overflow. Convert to long long before shifting.', '把 int 左移剩余的层数可能溢出。移位之前要先转成 long long。'],
      ['Iterative deepening pays off only when the tree grows quickly with depth. On a search space that grows slowly, the repeats cost real time.', '只有搜索树随深度迅速增长时，迭代加深才划算。如果搜索空间增长缓慢，重复搜索的代价就不能忽略了。'],
    ],
  },
}

/** Where each problem shows up outside contests, shown on the Problem tab. Same inline markup as the Ideas story. */
export const REAL: Record<string, L> = {
  'n-queens': ['Building a **school timetable**: place one lesson at a time, and step back as soon as a teacher or a room is double-booked. Sudoku solvers and chip-layout tools search by the same try–check–undo rhythm.', '排**课程表**：一次安排一节课，一旦发现某位老师或某间教室冲突就退回去重排。数独求解器和芯片布线工具都是按“尝试—检查—撤销”的节奏搜索的。'],
  'bfs-maze': ['A **robot vacuum** or a game character finding the shortest way through rooms and corridors. With every step costing the same, exploring outward ring by ring reaches each place first by a shortest route.', '**扫地机器人**或游戏角色在房间和走廊里找最短路线。当每一步代价相同时，一圈一圈向外探索，第一次到达某处走的一定是最短路线。'],
  'flood-fill': ['The **paint bucket** in a drawing program fills the connected area you clicked on. Minesweeper opens a whole empty region with one click, and satellite-image software counts lakes, with the same routine.', '画图软件里的**油漆桶**会填满你点击的那片连通区域。扫雷里点一下就翻开一整片空白、卫星图像软件统计湖泊的个数，用的都是同一个过程。'],
  'a-star': ['Navigation apps and almost every **video game** route their units with A*: knowing roughly where the goal lies lets the search head towards it instead of spreading out in every direction.', '导航软件和几乎所有**电子游戏**都用 A* 给单位寻路：知道目标大致在哪个方向，搜索就可以朝它前进，而不是向四面八方铺开。'],
  permutations: ['A **delivery driver** with 8 stops has 8! = 40 320 possible orders to visit them. A route planner can simply try them all; with 20 stops there are more orders than seconds since the universe began, and smarter methods are needed. Seating plans, timetables and anagram solvers begin the same way.', '一位要送 8 个地点的**快递员**有 8! = 40 320 种访问顺序。路线规划程序可以直接全部试一遍；而 20 个地点的顺序数比宇宙诞生以来的秒数还多，就必须用更聪明的方法了。排座位、排课表、解字谜也都是从这里起步的。'],
  'memo-search': ['A **spreadsheet** recalculates only the cells whose inputs changed and reuses every other result — the same idea. Web browsers, compilers and navigation apps all keep a cache of answers to questions they have already been asked.', '**电子表格**只重新计算输入发生变化的单元格，其他结果全部复用——这是同一个思想。浏览器、编译器和导航软件都会把回答过的问题的答案缓存起来。'],
  'bidir-bfs': ['"**Six degrees of separation**": to check whether two people are linked through a chain of friends, a social network does not explore outward from one person to millions of others. It grows a small circle of friends around each of the two and looks for a person in both.', '“**六度分隔**”：要判断两个人是否通过一串朋友相连，社交网络不会从其中一人出发向外探索上百万人。它在两个人身边各展开一小圈朋友，然后看有没有人同时出现在两个圈子里。'],
  iddfs: ['**Chess programs** search this way: look 1 move ahead, then 2, then 3, … and play the best move found when the clock runs out. Each round is cheap compared with the next one, and the program always has a complete answer ready.', '**国际象棋程序**就是这样搜索的：先看 1 步，再看 2 步、3 步……时间用完时，就走目前找到的最好的一步。每一轮与下一轮相比都很便宜，而且程序手里始终有一个完整的答案。'],
}
