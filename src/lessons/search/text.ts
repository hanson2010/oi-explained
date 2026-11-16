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
}

/** Where each problem shows up outside contests, shown on the Problem tab. Same inline markup as the Ideas story. */
export const REAL: Record<string, L> = {
  'n-queens': ['Building a **school timetable**: place one lesson at a time, and step back as soon as a teacher or a room is double-booked. Sudoku solvers and chip-layout tools search by the same try–check–undo rhythm.', '排**课程表**：一次安排一节课，一旦发现某位老师或某间教室冲突就退回去重排。数独求解器和芯片布线工具都是按“尝试—检查—撤销”的节奏搜索的。'],
  'bfs-maze': ['A **robot vacuum** or a game character finding the shortest way through rooms and corridors. With every step costing the same, exploring outward ring by ring reaches each place first by a shortest route.', '**扫地机器人**或游戏角色在房间和走廊里找最短路线。当每一步代价相同时，一圈一圈向外探索，第一次到达某处走的一定是最短路线。'],
  'flood-fill': ['The **paint bucket** in a drawing program fills the connected area you clicked on. Minesweeper opens a whole empty region with one click, and satellite-image software counts lakes, with the same routine.', '画图软件里的**油漆桶**会填满你点击的那片连通区域。扫雷里点一下就翻开一整片空白、卫星图像软件统计湖泊的个数，用的都是同一个过程。'],
  'a-star': ['Navigation apps and almost every **video game** route their units with A*: knowing roughly where the goal lies lets the search head towards it instead of spreading out in every direction.', '导航软件和几乎所有**电子游戏**都用 A* 给单位寻路：知道目标大致在哪个方向，搜索就可以朝它前进，而不是向四面八方铺开。'],
}
