import { arr, grid, gt, span, tn } from '../../engine/h'
import type { Extras } from '../extras'
import { col, row } from '../story-util'

const SQ = { sq: true } as const
type Cells = [number, number][]

/** The maze of the BFS story, with the distance of every cell from the top-left corner. */
const MAZE: (number | string)[][] = [[0, 1, '#', 5, 6], [1, 2, 3, 4, 5], [2, 3, 4, '#', 6], ['#', '#', 5, '#', 7], ['', '', '#', '#', 8]]
const where = (f: (v: number | string) => boolean): Cells => MAZE.flatMap((r, i) => r.flatMap((v, j): Cells => (f(v) ? [[i, j]] : [])))
const WALLS = where(v => v === '#')

const ISLANDS = ['##..#', '#...#', '..#..', '.##..']
const land = (label: (id: number) => number | string) => {
  const id = [[1, 1, 0, 0, 2], [1, 0, 0, 0, 2], [0, 0, 3, 0, 0], [0, 3, 3, 0, 0]]
  return ISLANDS.map((r, i) => [...r].map((ch, j) => (ch === '#' ? label(id[i][j]) : '')))
}
const ISLAND = (k: number): Cells => [[[0, 0], [0, 1], [1, 0]], [[0, 4], [1, 4]], [[2, 2], [3, 1], [3, 2]]][k - 1] as Cells
const WATER: Cells = ISLANDS.flatMap((r, i) => [...r].flatMap((ch, j): Cells => (ch === '.' ? [[i, j]] : [])))

export const SEARCH: Record<string, Extras> = {
  'n-queens': {
    story: [
      { kind: 'naive', title: ['Start simple: generate every board, then check it', '先从最简单的做起：生成每一种摆法，再检查'],
        body: ['Each row needs exactly one queen, so a board is one column choice per row: **nⁿ** boards — 16 million for n = 8, and each one still has to be checked. Almost all of them are doomed after the first two rows, yet they are built to the end.', '每一行恰好要放一个皇后，所以一种摆法就是每行选一列：共 **nⁿ** 种——n = 8 时是一千六百万种，而且每一种还要检查。其中绝大多数在前两行就已经注定失败，却还是被摆到了最后。'] },
      { kind: 'insight', title: ['Check while you build: one bad square kills a whole family', '边摆边查：一个坏格子否决一整族摆法'],
        body: ['Decide the rows one after another and test each queen __the moment it is placed__. If it is attacked, ==every board that would be built on top of this partial placement is skipped at once== — thousands of boards rejected by one test. That is **pruning**.', '一行一行地决定，每放一个皇后__立刻__检查。如果它被攻击，==建立在这个局部摆法之上的所有摆法都被一次跳过==——一次检查就否决了成千上万种摆法。这就是**剪枝**。'],
        fig: () => [grid('row 1: columns 0 and 1 are attacked — nothing below them is ever built', [['Q', '', '', ''], ['×', '×', '?', ''], ['', '', '', ''], ['', '', '', '']], gt({ ok: [[0, 0]], bad: [[1, 0], [1, 1]], act: [[1, 2]], dim: [...row(2, 0, 3), ...row(3, 0, 3)] }), SQ)] },
      { kind: 'how', title: ['Place, go deeper, take it back', '放下，往深处走，再拿回来'],
        body: ['`dfs(r)` tries every column of row r. For a free square: __place__ the queen, call `dfs(r + 1)`, then __remove__ it again so that the next column starts from a clean state. When r reaches n, every row has a queen: count one solution. Going back to try the next choice is **backtracking**.', '`dfs(r)` 尝试第 r 行的每一列。遇到没被攻击的格子：__放下__皇后，调用 `dfs(r + 1)`，然后把它__拿走__，让下一列从干净的状态开始。当 r 到达 n 时，每一行都有了皇后：解的个数加一。退回去尝试下一个选择，就是**回溯**。'],
        fig: () => [grid('one of the two solutions for n = 4', [['', 'Q', '', ''], ['', '', '', 'Q'], ['Q', '', '', ''], ['', '', 'Q', '']], gt({ ok: [[0, 1], [1, 3], [2, 0], [3, 2]] }), SQ)] },
      { kind: 'how', title: ['"Is this square attacked?" in one step', '一步回答“这个格子被攻击了吗”'],
        body: ['Rows are safe by construction. A column is identified by c. All squares on one diagonal share the same ==r + c==, and all squares on one anti-diagonal the same ==r − c==. Three boolean arrays indexed by those numbers answer the question without looking at the board.', '行不会冲突，这是摆法本身保证的。列由 c 标识。同一条对角线上的格子 ==r + c== 相同，同一条反对角线上的格子 ==r − c== 相同。用这三个数作下标的三个布尔数组，不用看棋盘就能回答这个问题。'],
        fig: () => [grid('r + c: equal numbers lie on one diagonal', [[0, 1, 2, 3], [1, 2, 3, 4], [2, 3, 4, 5], [3, 4, 5, 6]], gt({ cmp: [[0, 3], [1, 2], [2, 1], [3, 0]] }), { ...SQ, rows: ['r=0', 'r=1', 'r=2', 'r=3'] })] },
      { kind: 'result', title: ['Still exponential — but a tiny corner of it', '仍然是指数级——但只是其中很小的一角'],
        body: ['For n = 8 the search places about two thousand partial boards instead of examining 16 million complete ones. The pattern — ==choose, recurse, undo, and prune as early as possible== — is the template for every backtracking search: permutations, subsets, Sudoku, puzzles.', 'n = 8 时，搜索只摆出大约两千个局部棋盘，而不是检查一千六百万个完整棋盘。这个模式——==选择、递归、撤销，并且尽早剪枝==——是所有回溯搜索的模板：全排列、子集、数独、各种谜题。'] },
    ],
    flow: [
      { id: 'call', kind: 'start', text: ['dfs(r):  choose a column for row r', 'dfs(r)：为第 r 行选一列'], on: [] },
      { id: 'full', kind: 'test', text: ['r = n ?   (every row has a queen)', 'r = n ？（每行都有皇后了）'], no: 'nextc', on: [] },
      { id: 'found', text: ['count one solution', '解的个数加一'], next: 'ret' },
      { id: 'nextc', kind: 'test', text: ['another column c to try ?', '还有要尝试的列 c ？'], no: 'ret', on: [] },
      { id: 'prune', kind: 'test', text: ['is square (r, c) attacked ?', '格子 (r, c) 被攻击？'], yes: 'nextc', no: 'place' },
      { id: 'place', text: ['mark column and both diagonals;  dfs(r + 1)', '标记这一列和两条对角线；dfs(r + 1)'] },
      { id: 'undo', text: ['unmark them', '撤销标记'], next: 'nextc' },
      { id: 'ret', kind: 'end', text: ['return to the previous row', '返回上一行'], on: [] },
    ],
  },

  'bfs-maze': {
    story: [
      { kind: 'naive', title: ['Start simple: follow one path as far as it goes', '先从最简单的做起：沿一条路一直走到头'],
        body: ['Depth-first search walks until it is stuck, then backs up. It will find **a** route to the exit — but possibly a long detour, and nothing tells you whether a shorter one exists. Trying all routes to compare them is exponential.', '深度优先搜索一直走到走不动，再退回来。它能找到**一条**通往出口的路——但可能绕了很远，而且没有任何信息告诉你是否存在更短的路。把所有路线都试一遍再比较，则是指数级的。'] },
      { kind: 'insight', title: ['Spread like water: one step further in every direction', '像水一样扩散：每次向所有方向前进一步'],
        body: ['Pour water on the start. After one second it has reached every cell one step away, after two seconds every cell two steps away. Cells are reached ==in order of their distance==, so the first time the water touches a cell, it came by a __shortest__ route — that distance never needs to be corrected.', '在起点倒水。一秒后水到达所有距离为 1 的格子，两秒后到达所有距离为 2 的格子。格子是==按距离从小到大==被到达的，所以水第一次碰到某个格子时，走的一定是__最短__的路——这个距离以后永远不需要修正。'],
        fig: () => [grid('after three seconds: the wave front is the cells at distance 3', MAZE.map(r => r.map(v => (typeof v === 'number' && v > 3 ? '' : v))), gt({ dim: WALLS, vis: where(v => typeof v === 'number' && v < 3), act: where(v => v === 3) }), SQ)] },
      { kind: 'how', title: ['A queue keeps the wave in order', '队列让波前保持顺序'],
        body: ['Take a cell from the __front__ of the queue; give each free, unreached neighbour the distance `d + 1` and add it at the __back__. First in, first out means all cells at distance d leave the queue before any cell at distance d + 1. ==Record the distance when a cell is pushed==, not when it is popped — otherwise it can be pushed several times.', '从队__首__取出一个格子；把它每个可走且尚未到达的邻居的距离设为 `d + 1`，并加到队__尾__。先进先出保证了：所有距离为 d 的格子都在距离为 d + 1 的格子之前出队。==距离要在入队时就记下==，而不是出队时——否则同一个格子可能被多次入队。'],
        fig: () => [grid('distance of every cell from the top-left corner', MAZE, gt({ dim: WALLS, ok: [[4, 4]], act: [[0, 0]] }), SQ)] },
      { kind: 'result', title: ['Every cell once', '每个格子只处理一次'],
        body: ['Each cell is pushed at most once and looks at four neighbours: **O(n · m)**. BFS gives shortest paths whenever ==every move costs the same==. With different costs the wave no longer advances evenly — that is what Dijkstra\'s algorithm is for.', '每个格子最多入队一次，每次查看四个邻居：**O(n · m)**。只要==每一步的代价都相同==，BFS 得到的就是最短路。如果代价各不相同，波前就不再均匀推进——那是 Dijkstra 算法要解决的问题。'] },
    ],
    flow: [
      { id: 'start', kind: 'start', text: ['push the start cell;  its distance is 0', '起点入队；它的距离为 0'] },
      { id: 'loop', kind: 'test', text: ['is the queue empty ?', '队列为空？'], yes: 'done', on: [] },
      { id: 'pop', text: ['pop the front cell (x, y)', '取出队首格子 (x, y)'] },
      { id: 'nb', kind: 'test', text: ['another neighbour that is free and not reached yet ?', '还有可走且未到达的邻居？'], no: 'loop', on: [] },
      { id: 'push', text: ['d[neighbour] = d[x][y] + 1;  push it', 'd[邻居] = d[x][y] + 1；邻居入队'], next: 'nb' },
      { id: 'done', kind: 'end', text: ['print d of the target   (−1 if never reached)', '输出终点的 d（始终未到达则为 −1）'] },
    ],
  },

  'flood-fill': {
    story: [
      { kind: 'naive', title: ['Start with what makes it hard: an island is many cells', '先看难点：一个岛由很多格子组成'],
        body: ['Counting land cells is easy, but that gives the total area, not the number of islands. Each island must be counted **exactly once**, whichever of its cells you happen to meet first — and you meet the others later.', '数陆地格子很容易，但那得到的是总面积，而不是岛的个数。每个岛必须**恰好被数一次**，不管你最先碰到的是它的哪个格子——它的其他格子之后还会被碰到。'],
        fig: () => [grid('eight land cells — how many islands?', land(() => '#'), gt({ dim: WATER, cmp: [...ISLAND(1), ...ISLAND(2), ...ISLAND(3)] }), SQ)] },
      { kind: 'insight', title: ['Count an island when you first meet it — then paint all of it', '第一次碰到一个岛就计数——然后把它整个涂上颜色'],
        body: ['Scan the grid. An ==unlabelled land cell== belongs to an island that has not been counted: count it. Then immediately label the __entire__ island, so that none of its other cells can trigger a second count.', '扫描整个网格。一个==还没有标号的陆地格子==属于一个尚未计数的岛：计数加一。然后立刻给__整个__岛标上号，这样它的其他格子就不会再引起第二次计数。'],
        fig: () => [grid('island 1 is painted; the scan has just met the first cell of island 2', land(id => (id === 1 ? 1 : '#')), gt({ dim: WATER, ok: ISLAND(1), act: [[0, 4]], cmp: [[1, 4], ...ISLAND(3)] }), SQ)] },
      { kind: 'how', title: ['Painting is a BFS from the seed', '涂色就是从种子出发的一次 BFS'],
        body: ['Push the seed cell; repeatedly pop a cell and give its unlabelled land neighbours the same label, pushing them too. The paint spreads to exactly the cells connected to the seed and stops at water. Then the scan continues from where it was.', '把种子格子入队；不断取出一个格子，把它尚未标号的陆地邻居标上同样的号，并让它们也入队。颜色恰好扩散到与种子连通的所有格子，遇到水就停下。然后扫描从原来的位置继续。'],
        fig: () => [grid('all three islands labelled', land(id => id), gt({ dim: WATER, ok: ISLAND(1), cmp: ISLAND(2), alt: ISLAND(3) }), SQ)] },
      { kind: 'result', title: ['Linear, however many regions there are', '无论有多少个区域，都是线性的'],
        body: ['Every cell is labelled once and looked at a constant number of times: **O(n · m)**. This is how you count ==connected components== — on a grid here, on any graph with the same idea — and it is what the paint-bucket tool of a drawing program does.', '每个格子只标号一次，被查看的次数是常数：**O(n · m)**。这就是统计==连通块==的方法——这里是在网格上，同样的思路适用于任何图——绘图软件里的“油漆桶”工具做的也是这件事。'] },
    ],
    flow: [
      { id: 'scan', kind: 'test', text: ['another cell in scanning order ?', '按扫描顺序还有格子？'], no: 'done', on: [] },
      { id: 'isnew', kind: 'test', text: ['is it land without a label ?', '它是还没有标号的陆地？'], no: 'scan', on: [] },
      { id: 'seed', text: ['new island:  cnt++;  label the cell and push it', '新的岛：cnt++；给它标号并入队'] },
      { id: 'q', kind: 'test', text: ['is the queue empty ?', '队列为空？'], yes: 'scan', on: [] },
      { id: 'fill', text: ['pop a cell;  label and push its unlabelled land neighbours', '取出一个格子；给未标号的陆地邻居标号并入队'], next: 'q' },
      { id: 'done', kind: 'end', text: ['print cnt', '输出 cnt'] },
    ],
  },

  'a-star': {
    story: [
      { kind: 'naive', title: ['Start from BFS: it has no sense of direction', '从 BFS 出发：它没有方向感'],
        body: ['BFS and Dijkstra expand evenly in all directions — including __straight away from the target__. To reach a target 20 steps away they explore the whole region within 20 steps, although you can see at a glance which way to go.', 'BFS 和 Dijkstra 向所有方向均匀扩展——包括__背离目标__的方向。为了到达 20 步之外的目标，它们会把 20 步以内的整个区域都探索一遍，尽管你一眼就能看出该往哪边走。'] },
      { kind: 'insight', title: ['Rank cells by distance walked plus distance still to go', '按“已走的距离 + 估计还要走的距离”给格子排序'],
        body: ['For every discovered cell we know `g`, the distance walked so far. Add an estimate `h` of the distance that remains, and always expand the cell with the smallest ==f = g + h== — the most promising total. Cells in the wrong direction have a large h and wait in the queue, mostly forever.', '对每个已发现的格子，我们知道 `g`，即到目前为止走过的距离。再加上对剩余距离的估计 `h`，每次扩展 ==f = g + h== 最小的格子——也就是总路程最有希望的那个。方向不对的格子 h 很大，只能在队列里等着，多半永远轮不到。'],
        fig: () => [grid('h = Manhattan distance to the target (bottom-right)', [[5, 4, 3, 2], [4, 3, 2, 1], [3, 2, 1, 0]], gt({ act: [[0, 0]], ok: [[2, 3]], cmp: [...row(2, 0, 2), ...col(3, 0, 1)] }), SQ)] },
      { kind: 'insight', title: ['The estimate must be optimistic', '估计值必须是乐观的'],
        body: ['If h ==never overestimates== the true remaining distance, then a cell whose f is larger than the true answer can never be needed before the target is reached. So the first time the target is popped, its distance is optimal. On a 4-directional grid the Manhattan distance `|dx| + |dy|` qualifies: walls can only make the way longer.', '如果 h ==从不高估==真实的剩余距离，那么 f 大于真实答案的格子，在到达目标之前绝不会被用到。所以目标第一次出队时，它的距离就是最优的。在四方向移动的网格上，曼哈顿距离 `|dx| + |dy|` 满足这个条件：墙只会让路变得更长。'] },
      { kind: 'how', title: ['Dijkstra with a different key', '换了排序关键字的 Dijkstra'],
        body: ['Keep a priority queue ordered by f. Pop the smallest; skip it if a better route to that cell was found in the meantime; stop when it is the target. Otherwise relax its neighbours: if `d + 1` improves a neighbour, record it and push the neighbour with `f = d + 1 + h`.', '维护一个按 f 排序的优先队列。取出最小的；如果在此期间已经找到了到该格子更好的路线，就跳过它；如果它是目标，就停止。否则松弛它的邻居：如果 `d + 1` 比邻居当前的距离更优，就更新，并以 `f = d + 1 + h` 把邻居入队。'] },
      { kind: 'result', title: ['Same answer as Dijkstra, far fewer cells', '答案与 Dijkstra 相同，探索的格子少得多'],
        body: ['The worst case is unchanged, but in open terrain A* walks almost straight to the target. With `h = 0` it ==is== Dijkstra; the closer h is to the truth, the less is explored. An h that overestimates is faster still — and may return a wrong answer.', '最坏情况没有改变，但在开阔的地形上，A* 几乎是直奔目标。当 `h = 0` 时，它==就是== Dijkstra；h 越接近真实值，探索的范围越小。如果 h 高估了，速度会更快——但可能得到错误的答案。'] },
    ],
    flow: [
      { id: 'start', kind: 'start', text: ['d[start] = 0;  push the start with f = h(start)', 'd[起点] = 0；以 f = h(起点) 把起点入队'], on: ['start', 'h'] },
      { id: 'loop', kind: 'test', text: ['is the queue empty ?', '队列为空？'], yes: 'done', on: [] },
      { id: 'pop', kind: 'test', text: ['pop the smallest f  (skip stale entries):  is it the target ?', '取出 f 最小的（跳过过期项）：它是终点？'], yes: 'done', no: 'nb' },
      { id: 'nb', kind: 'test', text: ['another free neighbour that d + 1 improves ?', '还有能被 d + 1 改进的可走邻居？'], no: 'loop', on: [] },
      { id: 'relax', text: ['d[neighbour] = d + 1;  push it with f = d + 1 + h', 'd[邻居] = d + 1；以 f = d + 1 + h 入队'], next: 'nb' },
      { id: 'done', kind: 'end', text: ['print d of the target   (−1 if unreachable)', '输出终点的 d（无法到达则为 −1）'] },
    ],
  },

  permutations: {
    story: [
      { kind: 'term', title: ['Counting choices: the rules of product and sum', '数一数有多少种选择：乘法原理与加法原理'],
        body: ['**Rule of product**: if a task is done in steps, with a ways for the first step and b ways for the second whatever the first was, there are ==a · b== ways in all. **Rule of sum**: if a task is done __either__ in one of a ways __or__ in one of b other ways, there are ==a + b==. Arranging n different things in a row is a task in n steps: n choices for the first place, n − 1 for the second, … so there are `n · (n − 1) · … · 1 = n!` **permutations**. Stopping after k places gives `n · (n − 1) · … · (n − k + 1)` arrangements of k out of n; if the order of those k does not matter, divide by k! to get the number of **combinations**, C(n, k).', '**乘法原理**：一件事分几步完成，第一步有 a 种方法，无论第一步怎么做，第二步都有 b 种方法，那么一共有 ==a · b== 种方法。**加法原理**：一件事__要么__用 a 种方法中的一种完成，__要么__用另外 b 种方法中的一种完成，那么一共有 ==a + b== 种方法。把 n 个不同的东西排成一行是一件分 n 步完成的事：第一个位置有 n 种选择，第二个有 n − 1 种……所以共有 `n · (n − 1) · … · 1 = n!` 种**排列**。只排 k 个位置就停下，得到从 n 个中取 k 个的排列数 `n · (n − 1) · … · (n − k + 1)`；如果这 k 个的顺序无关紧要，再除以 k!，就是**组合**数 C(n, k)。'],
        fig: () => [grid('arranging 1, 2, 3', [[3, 2, 1, '3 · 2 · 1 = 6']], gt({ cmp: row(0, 0, 2), ok: [[0, 3]] }), { cols: ['choices for place 1', 'place 2', 'place 3', 'permutations'] })] },
      { kind: 'naive', title: ['Start simple: one loop per position', '先从最简单的做起：每个位置一重循环'],
        body: ['For n = 3, three nested loops over 1 … 3, printing when the three values are all different. But the program must work for any n — and ==you cannot write "n nested loops"== when n is read from the input.', 'n = 3 时，写三重循环，每层从 1 到 3，三个值互不相同时输出。但程序要对任意的 n 都能用——而 n 是从输入读入的，==写不出“n 重循环”==。'] },
      { kind: 'insight', title: ['Recursion is a loop nest of any depth', '递归就是任意层数的循环嵌套'],
        body: ['Let `dfs(k)` choose the number for position k and then call `dfs(k + 1)`. Each call contains one loop, and the calls nest n deep by themselves. To avoid repeats, keep `used[x]`: ==a number may be placed only if no earlier position holds it==.', '让 `dfs(k)` 为第 k 个位置选一个数，然后调用 `dfs(k + 1)`。每次调用里有一重循环，调用自己就嵌套了 n 层。为了避免重复，用 `used[x]` 记录：==只有前面的位置都没用过的数才能放==。'],
        fig: () => [arr('a = 2 1 ?  —  position 3 may only take what is still free', [2, 1, ''], tn({ ok: [0, 1], act: 2 }), { k: 2 }, { base: 1 }), arr('still free', ['', '', 3], tn({ dim: [0, 1], ok: 2 }), undefined, { base: 1 })] },
      { kind: 'how', title: ['Put it down, explore, pick it up again', '放下，探索，再拿起来'],
        body: ['Inside the loop: `a[k] = x; used[x] = true;` then `dfs(k + 1)`, then ==`used[x] = false`==. The last line is the heart of **backtracking**: when the call returns, everything that starts with this choice has been printed, so x is released and the loop moves on to the next candidate. When k passes n, the array holds a complete permutation.', '循环里依次是：`a[k] = x; used[x] = true;`，然后 `dfs(k + 1)`，然后 ==`used[x] = false`==。最后这一行是**回溯**的核心：调用返回时，以这个选择开头的所有排列都已经输出，于是释放 x，循环继续尝试下一个候选。当 k 超过 n 时，数组里就是一个完整的排列。'] },
      { kind: 'result', title: ['Every permutation once, in dictionary order', '每个排列恰好一次，按字典序'],
        body: ['The calls form a tree with **n!** leaves, one per permutation, reached in dictionary order because smaller numbers are tried first. That is 24 for n = 4 and 362 880 for n = 9: fine for small n, hopeless beyond about 11. The same skeleton — ==choose, recurse, undo== — solves N queens, subsets, and most puzzles.', '所有调用构成一棵树，它有 **n!** 片叶子，每片对应一个排列；因为先试较小的数，叶子按字典序被访问。n = 4 时是 24 个，n = 9 时是 362 880 个：n 较小时没问题，超过 11 左右就不现实了。同样的骨架——==选择、递归、撤销==——还能解决 N 皇后、子集枚举和大多数智力题。'],
        fig: () => [grid('n = 3', [['1 2 3', '1 3 2', '2 1 3', '2 3 1', '3 1 2', '3 2 1']], gt({ ok: row(0, 0, 5) }), { cols: [1, 2, 3, 4, 5, 6] })] },
    ],
    flow: [
      { id: 'call', kind: 'start', text: ['dfs(k)', 'dfs(k)'], on: [] },
      { id: 'full', kind: 'test', text: ['k > n ?', 'k > n ？'], yes: 'print', no: 'skip', on: [] },
      { id: 'print', text: ['print a[1 … n];   return', '输出 a[1 … n]；返回'], next: 'ret' },
      { id: 'skip', kind: 'test', text: ['next x in 1 … n that is not used ?', '1 … n 中还有没用过的 x ？'], no: 'ret' },
      { id: 'put', text: ['a[k] = x;   used[x] = true;   dfs(k + 1)', 'a[k] = x；used[x] = true；dfs(k + 1)'] },
      { id: 'undo', text: ['used[x] = false', 'used[x] = false'], next: 'skip' },
      { id: 'ret', kind: 'end', text: ['return', '返回'], on: [] },
    ],
  },

  'memo-search': {
    story: [
      { kind: 'naive', title: ['Start simple: let the recursion follow the definition', '先从最简单的做起：让递归照着定义写'],
        body: ['The longest run from a cell is the cell itself plus the longest run from its best lower neighbour. As a function: `dfs(x, y) = 1 + max dfs(lower neighbour)`. It is correct. But the cell at the bottom of a slope is reached along **every path that leads down to it**, and each time the function solves it afresh.', '从一个格子出发的最长路线，等于它自己加上从最好的那个更低的邻居出发的最长路线。写成函数就是 `dfs(x, y) = 1 + max dfs(更低的邻居)`。它是对的。但是坡底的格子会沿着**每一条通向它的路径**被到达，而函数每次都把它重新求解一遍。'],
        fig: () => [grid('how many paths lead from the top-left corner to each cell of a slope', [[1, 1, 1, 1], [1, 2, 3, 4], [1, 3, 6, 10], [1, 4, 10, 20]], gt({ bad: [[3, 3]], cmp: [[2, 3], [3, 2]] }), { sq: true })] },
      { kind: 'insight', title: ['The answer for a cell never changes', '一个格子的答案永远不变'],
        body: ['`dfs(x, y)` depends ==only on (x, y)==. It does not matter which path the search took to get there, or how many times it is asked. A question with a fixed answer should be answered once: __write the answer down__ the first time, and look it up ever after.', '`dfs(x, y)` ==只取决于 (x, y)==。搜索是沿哪条路走到这里的、它被问了多少次，都没有关系。一个答案固定不变的问题只应该回答一次：第一次算出来就__把答案记下来__，以后直接查。'] },
      { kind: 'how', title: ['One table, two extra lines', '一张表，多写两行'],
        body: ['Add an array `f`, all zeros. At the top of the function: `if (f[x][y]) return f[x][y];`. At the bottom: `return f[x][y] = best;`. Nothing else changes. The recursion still decides what to compute; the table makes sure each thing is computed ==once==.', '增加一个全为 0 的数组 `f`。函数开头加一句：`if (f[x][y]) return f[x][y];`。结尾改成：`return f[x][y] = best;`。其余都不用动。算什么仍然由递归决定；这张表保证每样东西只算==一次==。'],
        fig: () => [grid('height', [[9, 7, 6], [8, 4, 5], [3, 2, 1]], gt({ act: [[0, 0]], cmp: [[1, 0], [0, 1]] }), { sq: true }), grid('f, once every cell is solved', [[5, 4, 3], [4, 3, 2], [3, 2, 1]], gt({ ok: [[0, 0]] }), { sq: true })] },
      { kind: 'result', title: ['Every cell solved once', '每个格子只求解一次'],
        body: ['Each of the n · m cells is computed once and looks at four neighbours: **O(n · m)** instead of exponential. This is ==dynamic programming written top-down==: `f` is the DP table, and the recursion spares you from working out the order in which to fill it. Whenever a recursive function is called again and again with the same arguments, give it a memo.', 'n · m 个格子各计算一次，每次看四个邻居：**O(n · m)**，而不再是指数级。这就是==自顶向下写的动态规划==：`f` 就是 DP 表，而递归替你省去了安排填表顺序的工夫。只要一个递归函数会被相同的参数反复调用，就给它加上记忆。'] },
    ],
    flow: [
      { id: 'call', kind: 'start', text: ['dfs(x, y)', 'dfs(x, y)'], on: [] },
      { id: 'hit', kind: 'test', text: ['f[x][y] already known ?   then return it', 'f[x][y] 已经算过 ？是则直接返回'], yes: 'ret' },
      { id: 'enter', text: ['best = 1', 'best = 1'] },
      { id: 'nb', text: ['for each strictly lower neighbour:   best = max(best, dfs(neighbour) + 1)', '对每个严格更低的邻居：best = max(best, dfs(邻居) + 1)'], on: [] },
      { id: 'set', text: ['f[x][y] = best', 'f[x][y] = best'] },
      { id: 'ret', kind: 'end', text: ['return f[x][y];   the answer is the largest over all cells', '返回 f[x][y]；答案是所有格子中的最大值'], on: ['done'] },
    ],
  },

  'bidir-bfs': {
    story: [
      { kind: 'naive', title: ['Start with one search from the start', '先看只从起点出发的搜索'],
        body: ['Breadth-first search reaches the target only after visiting ==everything that is closer==. On an open grid that is about d² cells for a target at distance d; in a puzzle where every state has b successors it is about **bᵈ** states.', '广搜要先访问==所有更近的状态==，才能到达终点。在开阔的网格上，距离为 d 的终点意味着大约 d² 个格子；在每个状态有 b 个后继的智力题里，则大约是 **bᵈ** 个状态。'],
        fig: () => [grid('states visited when every state has 3 successors', [[10, 20, 30], ['59 049', '≈ 3.5 × 10⁹', '≈ 2 × 10¹⁴']], gt({ bad: [[1, 1], [1, 2]] }), { rows: ['distance d', '3ᵈ'] })] },
      { kind: 'insight', title: ['You know where you are going — search from there too', '终点是已知的——那就从终点也搜'],
        body: ['Grow a second search from the target. The two meet when each has covered about ==half the distance==, and two small searches are much cheaper than one big one: `2 · b^(d/2)` instead of `bᵈ`. For b = 3 and d = 20 that is about 118 000 states instead of 3.5 billion.', '从终点再展开一个搜索。两边各走大约==一半的距离==就会相遇，而两个小搜索比一个大搜索便宜得多：`2 · b^(d/2)` 对 `bᵈ`。b = 3、d = 20 时，大约是 11.8 万个状态对 35 亿个。'],
        fig: () => [grid('one search to distance 6, or two searches to distance 3', [[6, 5, 4, 3, 4, 5, 6], ['3', '2', '1', '0|0', '1', '2', '3']], gt({ bad: row(0, 0, 6), cmp: row(1, 0, 2), alt: row(1, 4, 6), ok: [[1, 3]] }), { rows: ['one-sided', 'two-sided'] })] },
      { kind: 'how', title: ['Two frontiers; expand the smaller, a whole layer at a time', '两个当前层；每次把较小的一层整层扩展'],
        body: ['Keep `d[0]` (from the start) and `d[1]` (from the target), each with its current layer. In each round take the side whose layer is smaller and move it one step outward. If a newly reached cell ==already has a distance from the other side==, a full path runs through it, of length `d[0] + d[1]`.', '保存 `d[0]`（到起点的距离）和 `d[1]`（到终点的距离），以及两边各自的当前层。每一轮选当前层较小的一边，向外走一步。如果新到达的格子==已经有了另一边的距离==，就有一条完整的路径经过它，长度为 `d[0] + d[1]`。'] },
      { kind: 'result', title: ['Meet in the middle — carefully', '在中间相遇——但要小心'],
        body: ['Finish the layer in which the first meeting happens and keep the ==smallest sum==: another cell of the same layer may give a path one shorter. On a grid the saving is modest; on problems with a large branching factor — sliding puzzles, word ladders, "8 numbers" — it turns the impossible into milliseconds. The idea is called **meet in the middle**.', '要把发生第一次相遇的那一层扩展完，并保留==最小的和==：同一层的另一个格子可能给出短一步的路径。在网格上节省的不算多；但在分支很多的问题上——滑块拼图、单词接龙、八数码——它能把不可能变成几毫秒。这种思想叫做**折半搜索（meet in the middle）**。'] },
    ],
    flow: [
      { id: 'start', kind: 'start', text: ['frontier 0 = {start},   frontier 1 = {target}', '当前层 0 = {起点}，当前层 1 = {终点}'] },
      { id: 'loop', kind: 'test', text: ['no meeting yet, and both frontiers non-empty ?', '尚未相遇，且两个当前层都非空 ？'], no: 'done', on: [] },
      { id: 'side', text: ['s = the side with the smaller frontier', 's = 当前层较小的一边'] },
      { id: 'grow', text: ['for every new neighbour of the layer:   d[s] = d[s][cur] + 1', '对这一层的每个新邻居：d[s] = d[s][cur] + 1'] },
      { id: 'meet', text: ['reached by the other side too ?   best = min(best, d[0] + d[1])', '另一边也到过 ？best = min(best, d[0] + d[1])'], next: 'loop' },
      { id: 'done', kind: 'end', text: ['print best  (−1 if the searches never met)', '输出 best（始终没有相遇则为 −1）'] },
    ],
  },

  iddfs: {
    story: [
      { kind: 'naive', title: ['Start with the two searches you know', '先看已经学过的两种搜索'],
        body: ['**Breadth-first** finds the shortest chain, but a state is a whole sequence and each layer holds enormously more of them than the last — memory runs out. **Depth-first** stores one sequence, but dives: 1, 2, 3, 4, 5, … reaches n in n − 1 steps, nowhere near the shortest.', '**广搜**能找到最短的链，但这里一个状态是一整条序列，每一层的序列数量都比上一层多得多——内存不够。**深搜**只保存一条序列，但它会一头扎下去：1, 2, 3, 4, 5, … 用 n − 1 步得到 n，离最短差得很远。'],
        fig: () => [arr('depth-first without a limit: 14 additions for 15', span(1, 15), tn({ bad: span(0, 14) }), undefined, { base: 0 })] },
      { kind: 'insight', title: ['Give depth-first search a leash, and lengthen it step by step', '给深搜拴上绳子，再一点点放长'],
        body: ['Search depth-first but ==never deeper than a limit==. If nothing is found, add one to the limit and start over. The first limit that succeeds is the smallest possible — the guarantee of breadth-first search, at the memory cost of a single path.', '照常深搜，但==绝不超过深度限制==。如果什么都没找到，就把限制加一，从头再搜。第一个成功的限制就是最小的——这是广搜才有的保证，而内存只需要保存一条路径。'] },
      { kind: 'how', title: ['The limit makes pruning possible', '有了限制才能剪枝'],
        body: ['With `limit − k` steps left, the largest number can at most double each time. If `a[k] · 2^(limit − k) < n`, ==no continuation can reach n== — cut the branch at once. Try the larger partners first: big steps reach n sooner.', '还剩 `limit − k` 步时，最大的数每一步最多翻倍。如果 `a[k] · 2^(limit − k) < n`，==无论怎么接下去都到不了 n==——立刻剪掉这个分支。先试较大的加数：步子大，才能更快到达 n。'],
        fig: () => [arr('n = 15, limit 4:  after 1, 2, 3 only two steps are left, and 3 · 2 · 2 = 12 < 15', [1, 2, 3, '', ''], tn({ bad: 2 }), undefined, { base: 0 })] },
      { kind: 'result', title: ['The repeats cost almost nothing', '重复搜索几乎不花代价'],
        body: ['Each round repeats all the earlier ones — but a search tree grows geometrically, so ==the last round outweighs all the others together==. For 15 the answer is 5: `1, 2, 3, 6, 12, 15`. When the limit is combined with an estimate of the remaining distance, the method is called **IDA\***.', '每一轮都会重复之前所有轮次的工作——但搜索树按几何级数增长，所以==最后一轮比前面所有轮次加起来还重==。15 的答案是 5：`1, 2, 3, 6, 12, 15`。如果把深度限制和对剩余距离的估计结合起来，这种方法就叫 **IDA\***。'],
        fig: () => [arr('a shortest chain for 15: five additions', [1, 2, 3, 6, 12, 15], tn({ ok: span(0, 5) }), undefined, { base: 0 })] },
    ],
    flow: [
      { id: 'deeper', kind: 'start', text: ['limit = 0, 1, 2, …   until dfs(0) succeeds', 'limit = 0, 1, 2, …，直到 dfs(0) 成功'] },
      { id: 'goal', kind: 'test', text: ['dfs(k):   a[k] = n ?   → found', 'dfs(k)：a[k] = n ？→ 找到'], yes: 'done' },
      { id: 'deep', kind: 'test', text: ['k = limit ?   → fail', 'k = limit ？→ 失败'], yes: 'back' },
      { id: 'prune', kind: 'test', text: ['a[k] · 2^(limit − k) < n ?   → fail', 'a[k] · 2^(limit − k) < n ？→ 失败'], yes: 'back' },
      { id: 'try', text: ['for i = k … 0:   a[k+1] = a[k] + a[i];   dfs(k + 1)', '对 i = k … 0：a[k+1] = a[k] + a[i]；dfs(k + 1)'] },
      { id: 'back', text: ['nothing worked: return to the caller', '都不行：返回上一层'], next: 'deeper' },
      { id: 'done', kind: 'end', text: ['print limit and the chain', '输出 limit 和加法链'] },
    ],
  },
}
