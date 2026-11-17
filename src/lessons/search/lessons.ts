import type { Lesson, Rng, Tone } from '../../engine/types'
import { arr, grid, Heap, need, reader, span, tn, vars } from '../../engine/h'

const cpp = String.raw
const DX = [-1, 0, 1, 0], DY = [0, 1, 0, -1]

export function readGrid(inp: string) {
  const rd = reader(inp), n = rd.int(), m = rd.int()
  need(n >= 1 && m >= 1, 'The grid needs at least one row and one column.', '网格至少要有一行一列。')
  const g: string[] = []
  for (let i = 0; i < n; i++) {
    const s = rd.str()
    need(s.length === m && /^[.#]+$/.test(s), `Row ${i + 1} must be ${m} characters of '.' or '#'.`, `第 ${i + 1} 行须为 ${m} 个 '.' 或 '#'。`)
    g.push(s)
  }
  return { n, m, g }
}
const genMaze = (n: number, r: Rng, wall = 0.25) => {
  const rows = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => ((i === 0 && j === 0) || (i === n - 1 && j === n - 1) || r.next() >= wall ? '.' : '#')).join(''))
  return `${n} ${n}\n${rows.join('\n')}\n`
}

const queens: Lesson = {
  id: 'n-queens', title: ['DFS & pruning: N queens', '深度优先搜索与剪枝：N 皇后'], level: 'J', cat: 'search', diff: 5,
  needs: ['permutations'],
  blurb: ['Place one queen per row, back up as soon as a choice is attacked, and count every full board.', '每行放一个皇后，一旦发现冲突立刻回溯，统计所有放满的方案。'],
  ideas: [
    ['Depth-first search explores one choice as far as possible, then undoes it and tries the next (backtracking).', '深度优先搜索沿一个选择走到底，然后撤销它，再尝试下一个（回溯）。'],
    ['State: the current row. Choices: the column for that row.', '状态：当前行。选择：这一行皇后所在的列。'],
    ['Three boolean arrays answer "is this square attacked?" in O(1): column c, diagonal r + c, anti-diagonal r − c.', '三个布尔数组 O(1) 回答“这个格子是否被攻击”：列 c、对角线 r + c、反对角线 r − c。'],
    ['Pruning: rejecting an attacked square cuts off the entire subtree below it.', '剪枝：拒绝一个被攻击的格子，就砍掉了它下面的整棵搜索子树。'],
    ['Always restore the state after the recursive call returns.', '递归返回后一定要恢复现场。'],
  ],
  time: 'O(n!)', space: 'O(n)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, ans;
bool col[32], d1[64], d2[64];

void dfs(int r) {
    if (r == n) { ans++; return; }  //@found
    for (int c = 0; c < n; c++) {
        if (col[c] || d1[r + c] || d2[r - c + n]) continue;  //@prune
        col[c] = d1[r + c] = d2[r - c + n] = true;  //@place
        dfs(r + 1);
        col[c] = d1[r + c] = d2[r - c + n] = false;  //@undo
    }
}

int main() {
    scanf("%d", &n);
    dfs(0);
    printf("%d\n", ans);
}`,
  notes: [
    ['found', ['All n rows are filled without conflict: one solution.', '所有 n 行都无冲突地放好了：得到一个解。']],
    ['prune', ['r + c is constant along one diagonal, r − c along the other (+n keeps the index non-negative).', '同一条对角线上 r + c 相同，另一方向上 r − c 相同（加 n 使下标非负）。']],
    ['undo', ['Backtrack: the arrays must look exactly as before this choice.', '回溯：数组必须恢复到做出这个选择之前的样子。']],
  ],
  input: ['n — board size. Prints the number of ways to place n non-attacking queens.', 'n —— 棋盘大小。输出放置 n 个互不攻击的皇后的方案数。'],
  sizes: [4, 5, 6], lab: [4, 6, 8, 10, 11],
  gen: n => `${n}\n`,
  broken: {
    from: 'col[c] = d1[r + c] = d2[r - c + n] = false;', to: 'col[c] = d1[r + c] = false;',
    why: ['Backtracking must leave the arrays __exactly__ as they were before the queen was placed. This undo clears the column and one diagonal but forgets the other, so the anti-diagonal stays marked as attacked after the queen is gone. Squares on it are then rejected for no reason, and solutions are missed.', '回溯必须把数组恢复到放这个皇后之前的__原样__。这里的撤销清除了列和一条对角线，却忘了另一条，于是皇后拿走之后，那条反对角线仍然被标记为受攻击。之后它上面的格子会被无缘无故地拒绝，一些解就漏掉了。'],
  },
  run(inp, t, bug = false) {
    const n = reader(inp).int()
    need(n >= 1 && n <= 13, 'n must be between 1 and 13.', 'n 须在 1 到 13 之间。')
    const col = new Array<boolean>(n).fill(false), d1 = new Array<boolean>(2 * n).fill(false), d2 = new Array<boolean>(2 * n + 1).fill(false), pos: number[] = []
    let ans = 0
    const board = (r: number, c: number, tone: Tone) => {
      const cells = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (pos[i] === j && i < pos.length ? '♛' : '')))
      const tones: Record<string, Tone> = {}
      for (let i = 0; i < pos.length; i++) tones[i + ',' + pos[i]] = 'ok'
      if (r < n) tones[r + ',' + c] = tone
      return grid('board', cells, tones, { sq: true })
    }
    const dfs = (r: number) => {
      if (r === n) { ans++; t.s('found', () => [[`All ${n} queens placed: solution #${ans}.`, `${n} 个皇后全部放好：第 ${ans} 个解。`], board(n, 0, 'ok'), vars({ solutions: ans })]); return }
      for (let c = 0; c < n; c++) {
        if (!bug && r > 0) t.ask(() => [[`Row ${r}, column ${c}: can a queen go here?`, `第 ${r} 行第 ${c} 列：这里能放皇后吗？`], [['yes', '能'], ['no, it is attacked', '不能，它受到攻击']], col[c] || d1[r + c] || d2[r - c + n] ? 1 : 0])
        if (col[c] || d1[r + c] || d2[r - c + n]) {
          t.s('prune', () => [[`Row ${r}, column ${c} is attacked (${col[c] ? 'same column' : 'same diagonal'}): skip.`, `第 ${r} 行第 ${c} 列被攻击（${col[c] ? '同列' : '同一对角线'}）：跳过。`], board(r, c, 'bad'), vars({ solutions: ans })])
          continue
        }
        col[c] = d1[r + c] = d2[r - c + n] = true; pos.push(c)
        t.s('place', () => [[`Row ${r}: place a queen in column ${c}, go to row ${r + 1}.`, `第 ${r} 行：在第 ${c} 列放皇后，进入第 ${r + 1} 行。`], board(r, c, 'act'), vars({ solutions: ans })])
        dfs(r + 1)
        col[c] = d1[r + c] = false; if (!bug) d2[r - c + n] = false
        pos.pop()
        t.s('undo', () => [[`Backtrack: remove the queen at row ${r}, column ${c}.`, `回溯：拿走第 ${r} 行第 ${c} 列的皇后。`], board(r, c, 'cmp'), vars({ solutions: ans })])
      }
    }
    dfs(0)
    t.out(ans)
  },
}

const bfs: Lesson = {
  id: 'bfs-maze', title: ['BFS: shortest path in a maze', '广度优先搜索：迷宫最短路'], level: 'J', cat: 'search', diff: 5,
  blurb: ['Explore in rings of equal distance using a queue; the first time a cell is reached is the shortest way there.', '借助队列一圈一圈地向外扩展；第一次到达某个格子时走的就是最短路。'],
  ideas: [
    ['A queue is first-in, first-out: cells leave in the order they were discovered.', '队列先进先出：格子按被发现的顺序出队。'],
    ['So all cells at distance d are processed before any cell at distance d + 1.', '因此距离为 d 的格子全部处理完，才轮到距离为 d + 1 的格子。'],
    ['Mark a cell when it is pushed, not when it is popped — otherwise it can enter the queue many times.', '入队时就标记，而不是出队时——否则同一个格子可能多次入队。'],
    ['Every cell is pushed at most once: O(n · m) for the whole grid.', '每个格子至多入队一次：整张网格 O(n · m)。'],
  ],
  time: 'O(n · m)', space: 'O(n · m)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, m, d[1005][1005];
char g[1005][1005];
int dx[] = {-1, 0, 1, 0}, dy[] = {0, 1, 0, -1};

int main() {
    scanf("%d%d", &n, &m);
    for (int i = 0; i < n; i++) scanf("%s", g[i]);
    memset(d, -1, sizeof d);
    queue<pair<int, int>> q;
    q.push({0, 0}); d[0][0] = 0;  //@start
    while (!q.empty()) {
        auto [x, y] = q.front(); q.pop();  //@pop
        for (int k = 0; k < 4; k++) {
            int nx = x + dx[k], ny = y + dy[k];
            if (nx < 0 || ny < 0 || nx >= n || ny >= m) continue;
            if (g[nx][ny] == '#' || d[nx][ny] != -1) continue;
            d[nx][ny] = d[x][y] + 1;  //@push
            q.push({nx, ny});
        }
    }
    printf("%d\n", d[n - 1][m - 1]);  //@done
}`,
  notes: [
    ['start', ['d doubles as the visited flag: −1 means "not reached yet".', 'd 同时充当访问标记：−1 表示“尚未到达”。']],
    ['pop', ['The front of the queue is always a cell with the smallest distance among those waiting.', '队首永远是等待中的格子里距离最小的那个。']],
    ['push', ['Distance is fixed at discovery; it can never be improved later.', '距离在发现时就确定了，之后不可能再被改进。']],
    ['done', ['Still −1 here means the target is unreachable.', '如果这里仍是 −1，说明终点不可达。']],
  ],
  input: ["n m, then n rows of '.' (free) and '#' (wall). Prints the fewest moves from the top-left to the bottom-right cell, or −1.", "n m，随后 n 行由 '.'（空地）和 '#'（墙）组成。输出从左上角到右下角的最少步数，无法到达输出 −1。"],
  sizes: [5, 7, 9], lab: [10, 100, 300, 1000],
  gen: (n, r) => genMaze(n, r),
  broken: {
    from: 'int dx[] = {-1, 0, 1, 0}', to: 'int dx[] = {-1, 0, -1, 0}',
    why: ['dx and dy are read in pairs: (−1, 0) up, (0, 1) right, (1, 0) down, (0, −1) left. With the third dx changed to −1, the third pair is (−1, 0), up once more, so __no move ever goes down__. The search spreads along the top row and never reaches the bottom of the maze: the program prints −1.', 'dx 和 dy 要成对地看：(−1, 0) 向上，(0, 1) 向右，(1, 0) 向下，(0, −1) 向左。第三个 dx 改成 −1 之后，第三对变成 (−1, 0)，又是向上，于是__从来不会向下走__。搜索只能沿着第一行扩展，永远到不了迷宫的底部：程序输出 −1。'],
  },
  run(inp, t, bug = false) {
    const { n, m, g } = readGrid(inp)
    need(g[0][0] === '.' && g[n - 1][m - 1] === '.', 'Start and target cells must be free.', '起点和终点必须是空地。')
    const d = new Int32Array(n * m).fill(-1), q = [0], dx = bug ? [-1, 0, -1, 0] : DX
    d[0] = 0
    const view = (cur: number, nw = -1, h = 0) => {
      const tones: Record<string, Tone> = {}
      const cells = g.map((row, i) => row.split('').map((ch, j) => {
        const id = i * m + j
        if (ch === '#') { tones[i + ',' + j] = 'dim'; return '▓' }
        if (d[id] >= 0) tones[i + ',' + j] = 'vis'
        return d[id] >= 0 ? d[id] : ''
      }))
      for (let k = h; k < q.length; k++) tones[Math.floor(q[k] / m) + ',' + (q[k] % m)] = 'cmp'
      if (cur >= 0) tones[Math.floor(cur / m) + ',' + (cur % m)] = 'act'
      if (nw >= 0) tones[Math.floor(nw / m) + ',' + (nw % m)] = 'ok'
      return [grid('distance from the start', cells, tones, { sq: true }), arr('queue', q.slice(h, h + 14).map(x => `${Math.floor(x / m)},${x % m}`))] as const
    }
    t.s('start', () => [['Push the start cell with distance 0.', '起点入队，距离为 0。'], ...view(-1)])
    for (let h = 0; h < q.length; h++) {
      const cur = q[h], x = Math.floor(cur / m), y = cur % m
      if (h % 3 === 1 && !bug) t.ask(() => {
        let c = 0
        for (let k = 0; k < 4; k++) { const nx = x + DX[k], ny = y + DY[k]; if (nx >= 0 && ny >= 0 && nx < n && ny < m && g[nx][ny] !== '#' && d[nx * m + ny] === -1) c++ }
        return c > 3 ? undefined : [[`(${x}, ${y}) is at the front of the queue. How many new cells will it push?`, `队首是 (${x}, ${y})。它会让几个新格子入队？`], [0, 1, 2, 3].map(v => [String(v), String(v)] as const), c]
      })
      t.s('pop', () => [[`Pop (${x}, ${y}) at distance ${d[cur]}.`, `取出 (${x}, ${y})，距离 ${d[cur]}。`], ...view(cur, -1, h + 1)])
      for (let k = 0; k < 4; k++) {
        const nx = x + dx[k], ny = y + DY[k], id = nx * m + ny
        if (nx < 0 || ny < 0 || nx >= n || ny >= m || g[nx][ny] === '#' || d[id] !== -1) continue
        d[id] = d[cur] + 1; q.push(id)
        t.s('push', () => [[`(${nx}, ${ny}) is new: distance ${d[id]}, push it.`, `(${nx}, ${ny}) 是新格子：距离 ${d[id]}，入队。`], ...view(cur, id, h + 1)])
      }
    }
    const ans = d[n * m - 1]
    t.s('done', () => [ans >= 0 ? [`The queue is empty. Shortest path to the target: ${ans} moves.`, `队列已空。到终点的最短路为 ${ans} 步。`] : ['The queue is empty and the target was never reached: −1.', '队列已空，终点始终没有到达：−1。'], ...view(-1, ans >= 0 ? n * m - 1 : -1, q.length)])
    t.out(ans)
  },
}

const flood: Lesson = {
  id: 'flood-fill', title: ['Flood fill', '泛洪算法（Flood Fill）'], level: 'J', cat: 'search', diff: 5,
  needs: ['bfs-maze'],
  blurb: ['Start from an unlabelled cell and spread to every connected neighbour — one fill per connected region.', '从一个未标记的格子出发，向所有相连的邻居扩散——每次填充得到一个连通块。'],
  ideas: [
    ['Scan the grid; whenever you meet an unlabelled land cell, you have found a new region.', '扫描网格；每遇到一个未标记的陆地格子，就发现了一个新的连通块。'],
    ['Fill from that seed with BFS (or DFS), giving every reached cell the same label.', '从这个种子出发做 BFS（或 DFS），给所有到达的格子打上同一个标号。'],
    ['Labelled cells are never revisited, so the whole grid costs O(n · m) no matter how many regions there are.', '已标记的格子不会再被访问，所以无论有多少连通块，总复杂度都是 O(n · m)。'],
  ],
  time: 'O(n · m)', space: 'O(n · m)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, m, id[1005][1005], cnt;
char g[1005][1005];
int dx[] = {-1, 0, 1, 0}, dy[] = {0, 1, 0, -1};

int main() {
    scanf("%d%d", &n, &m);
    for (int i = 0; i < n; i++) scanf("%s", g[i]);
    for (int i = 0; i < n; i++)
        for (int j = 0; j < m; j++) {
            if (g[i][j] != '#' || id[i][j]) continue;
            queue<pair<int, int>> q;
            q.push({i, j}); id[i][j] = ++cnt;  //@seed
            while (!q.empty()) {
                auto [x, y] = q.front(); q.pop();
                for (int k = 0; k < 4; k++) {
                    int nx = x + dx[k], ny = y + dy[k];
                    if (nx < 0 || ny < 0 || nx >= n || ny >= m) continue;
                    if (g[nx][ny] != '#' || id[nx][ny]) continue;
                    id[nx][ny] = cnt;  //@fill
                    q.push({nx, ny});
                }
            }
        }
    printf("%d\n", cnt);  //@done
}`,
  notes: [
    ['seed', ['A new seed means a new region, so the counter goes up here and only here.', '新的种子意味着新的连通块，计数器只在这里增加。']],
    ['fill', ['The label doubles as the visited mark.', '标号同时充当访问标记。']],
  ],
  input: ["n m, then n rows of '#' (land) and '.' (water). Prints the number of 4-connected land regions.", "n m，随后 n 行由 '#'（陆地）和 '.'（水）组成。输出四连通的陆地连通块个数。"],
  sizes: [5, 7, 9], lab: [10, 100, 300, 1000],
  gen: (n, r) => { const s = genMaze(n, r, 0.5).split('\n'); return s.join('\n') },
  broken: {
    from: 'id[nx][ny] = cnt;', to: 'id[nx][ny] = ++cnt;',
    why: ['A region is counted once, when its seed is found; the cells reached from the seed belong to __the same__ region and must get the same label. `++cnt` gives every cell reached by the fill a new label, so cnt ends up counting land cells rather than regions.', '一个连通块只在找到它的种子时计数一次；从种子扩散到的格子属于__同一个__连通块，必须得到相同的标号。`++cnt` 让填充到的每个格子都得到一个新标号，于是 cnt 最终数的是陆地格子数，而不是连通块数。'],
  },
  run(inp, t, bug = false) {
    const { n, m, g } = readGrid(inp)
    const id = new Int32Array(n * m)
    let cnt = 0
    const PAL: Tone[] = ['ok', 'cmp', 'alt', 'vis', 'bad']
    const view = (cur: number) => {
      const tones: Record<string, Tone> = {}
      const cells = g.map((row, i) => row.split('').map((ch, j) => {
        const v = id[i * m + j]
        if (v) tones[i + ',' + j] = PAL[(v - 1) % PAL.length]
        return ch === '#' ? (v || '#') : ''
      }))
      if (cur >= 0) tones[Math.floor(cur / m) + ',' + (cur % m)] = 'act'
      return grid('region labels', cells, tones, { sq: true })
    }
    for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) {
      if (g[i][j] !== '#' || id[i * m + j]) continue
      const q = [i * m + j]
      id[i * m + j] = ++cnt
      t.s('seed', () => [[`(${i}, ${j}) is unlabelled land: start region ${cnt}.`, `(${i}, ${j}) 是未标记的陆地：开始第 ${cnt} 个连通块。`], view(i * m + j), vars({ regions: cnt })])
      for (let h = 0; h < q.length; h++) {
        const x = Math.floor(q[h] / m), y = q[h] % m
        for (let k = 0; k < 4; k++) {
          const nx = x + DX[k], ny = y + DY[k], c = nx * m + ny
          if (nx < 0 || ny < 0 || nx >= n || ny >= m || g[nx][ny] !== '#' || id[c]) continue
          id[c] = bug ? ++cnt : cnt; q.push(c)
          const label = id[c]
          t.s('fill', () => [[`Spread from (${x}, ${y}) to (${nx}, ${ny}): label ${label}.`, `从 (${x}, ${y}) 扩散到 (${nx}, ${ny})：标号 ${label}。`], view(c), vars({ cnt: label })])
        }
      }
    }
    t.s('done', () => [bug ? [`The scan is complete: cnt = ${cnt}.`, `扫描结束：cnt = ${cnt}。`] : [`The scan is complete: ${cnt} region(s).`, `扫描结束：共 ${cnt} 个连通块。`], view(-1), vars({ regions: cnt })])
    t.out(cnt)
  },
}

const astar: Lesson = {
  id: 'a-star', title: ['Heuristic search: A*', '启发式搜索：A*'], level: 'S', cat: 'search', diff: 7,
  needs: ['bfs-maze', 'dijkstra'],
  blurb: ['Order the frontier by distance so far plus an optimistic estimate of what remains, and head for the target.', '按“已走距离 + 对剩余距离的乐观估计”给待扩展结点排序，朝着终点搜索。'],
  ideas: [
    ['BFS expands in all directions. A* prefers cells that look closer to the target.', 'BFS 向四面八方扩展；A* 优先扩展看起来离终点更近的格子。'],
    ['f = g + h: g is the distance walked, h estimates the distance still to go.', 'f = g + h：g 是已经走过的距离，h 是对剩余距离的估计。'],
    ['If h never overestimates (it is admissible), the first time the target is popped its distance is optimal.', '只要 h 从不高估（可采纳），终点第一次出堆时得到的距离就是最优的。'],
    ['On a 4-connected grid the Manhattan distance |dx| + |dy| is admissible. With h = 0, A* is exactly Dijkstra.', '在四连通网格上，曼哈顿距离 |dx| + |dy| 是可采纳的。当 h = 0 时，A* 就是 Dijkstra。'],
  ],
  time: 'O(n · m · log(n · m))', space: 'O(n · m)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, m, d[1005][1005];
char g[1005][1005];
int dx[] = {-1, 0, 1, 0}, dy[] = {0, 1, 0, -1};

int h(int x, int y) { return (n - 1 - x) + (m - 1 - y); }  //@h

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
    ['h', ['Manhattan distance to the bottom-right corner: walls can only make the true distance longer.', '到右下角的曼哈顿距离：墙只会让真实距离更长。']],
    ['start', ['The heap is keyed by f, smallest first.', '堆按 f 排序，小的先出。']],
    ['pop', ['Stale entries are skipped; reaching the target ends the search early.', '过期的堆元素被跳过；一旦到达终点就提前结束。']],
    ['relax', ['Same relaxation as Dijkstra — only the heap key differs.', '松弛操作与 Dijkstra 相同——区别只在堆的键值。']],
  ],
  input: ["n m, then n rows of '.' and '#'. Prints the fewest moves from the top-left to the bottom-right cell, or −1.", "n m，随后 n 行 '.' 和 '#'。输出从左上角到右下角的最少步数，无法到达输出 −1。"],
  sizes: [6, 8, 10], lab: [10, 100, 300, 700],
  gen: (n, r) => genMaze(n, r, 0.2),
  broken: {
    from: 'if (f > d[x][y] + h(x, y)) continue;', to: 'if (f >= d[x][y] + h(x, y)) continue;',
    why: ['The heap can hold an old entry for a cell whose g has since improved; such an entry has f __larger__ than the cell\'s current g + h, and only those may be skipped. An entry that is up to date has f exactly equal to g + h. With `>=` it is skipped as well — starting with the start cell itself — so nothing is ever expanded and the program prints −1.', '堆里可能留着某个格子的旧元素，而这个格子的 g 后来变小了；这样的元素的 f __大于__格子当前的 g + h，只有它们才可以跳过。最新的元素的 f 恰好等于 g + h。写成 `>=` 后它们也被跳过了——第一个就是起点本身——于是一个格子都没有扩展，程序输出 −1。'],
  },
  run(inp, t, bug = false) {
    const { n, m, g } = readGrid(inp)
    need(g[0][0] === '.' && g[n - 1][m - 1] === '.', 'Start and target cells must be free.', '起点和终点必须是空地。')
    const BIG = 1e9, d = new Int32Array(n * m).fill(BIG), par = new Int32Array(n * m).fill(-1), closed = new Uint8Array(n * m)
    const h = (id: number) => n - 1 - Math.floor(id / m) + (m - 1 - (id % m))
    const pq = new Heap<[number, number]>((a, b) => a[0] < b[0] || (a[0] === b[0] && a[1] > b[1]))
    let expanded = 0
    const view = (cur: number, nw = -1, path: number[] = []) => {
      const tones: Record<string, Tone> = {}
      const cells = g.map((row, i) => row.split('').map((ch, j) => {
        const id = i * m + j
        if (ch === '#') { tones[i + ',' + j] = 'dim'; return '▓' }
        if (d[id] < BIG) tones[i + ',' + j] = closed[id] ? 'vis' : 'cmp'
        return d[id] < BIG ? d[id] + h(id) : ''
      }))
      for (const p of path) tones[Math.floor(p / m) + ',' + (p % m)] = 'ok'
      if (cur >= 0) tones[Math.floor(cur / m) + ',' + (cur % m)] = 'act'
      if (nw >= 0) tones[Math.floor(nw / m) + ',' + (nw % m)] = 'ok'
      return grid('f = g + h of every discovered cell', cells, tones, { sq: true })
    }
    d[0] = 0; pq.push([h(0), 0])
    t.s('start', () => [[`Start: g = 0, h = ${h(0)}, so f = ${h(0)}.`, `起点：g = 0，h = ${h(0)}，所以 f = ${h(0)}。`], view(0)])
    while (pq.size) {
      const [f, cur] = pq.pop()
      if (bug ? f >= d[cur] + h(cur) : f > d[cur] + h(cur)) {
        if (bug) { const x = Math.floor(cur / m), y = cur % m; t.s('pop', () => [[`Pop (${x}, ${y}) with f = ${f}: g + h = ${d[cur] + h(cur)}, so the entry is skipped.`, `取出 (${x}, ${y})，f = ${f}：g + h = ${d[cur] + h(cur)}，于是跳过这个元素。`], view(cur), vars({ expanded })]) }
        continue
      }
      closed[cur] = 1; expanded++
      const x = Math.floor(cur / m), y = cur % m
      t.s('pop', () => [[`Pop (${x}, ${y}): g = ${d[cur]}, h = ${h(cur)}, f = ${f} is the smallest.`, `取出 (${x}, ${y})：g = ${d[cur]}，h = ${h(cur)}，f = ${f} 最小。`], view(cur), vars({ expanded })])
      if (cur === n * m - 1) break
      for (let k = 0; k < 4; k++) {
        const nx = x + DX[k], ny = y + DY[k], id = nx * m + ny
        if (nx < 0 || ny < 0 || nx >= n || ny >= m || g[nx][ny] === '#' || d[cur] + 1 >= d[id]) continue
        d[id] = d[cur] + 1; par[id] = cur; pq.push([d[id] + h(id), id])
        t.s('relax', () => [[`(${nx}, ${ny}): g = ${d[id]}, h = ${h(id)} → f = ${d[id] + h(id)}.`, `(${nx}, ${ny})：g = ${d[id]}，h = ${h(id)} → f = ${d[id] + h(id)}。`], view(cur, id), vars({ expanded })])
      }
    }
    const ans = d[n * m - 1] < BIG ? d[n * m - 1] : -1
    t.s('done', () => {
      const path: number[] = []
      if (ans >= 0) for (let p = n * m - 1; p >= 0; p = par[p]) path.push(p)
      return [ans >= 0 ? (bug ? [`Target popped with g = ${ans} after expanding ${expanded} of ${n * m} cells.`, `终点出堆时 g = ${ans}；扩展了 ${n * m} 个格子中的 ${expanded} 个。`] : [`Target reached in ${ans} moves after expanding ${expanded} of ${n * m} cells.`, `到达终点，共 ${ans} 步；只扩展了 ${n * m} 个格子中的 ${expanded} 个。`]) : ['The frontier is empty: the target is unreachable.', '待扩展集合已空：终点不可达。'], view(-1, -1, path), vars({ expanded })]
    })
    t.out(ans)
  },
}

const permutations: Lesson = {
  id: 'permutations', title: ['All permutations by backtracking', '全排列（回溯）'], level: 'J', cat: 'search', diff: 4,
  needs: ['hanoi'],
  blurb: ['Fill the positions one by one with a number that is still free; when you come back, free it again and try the next.', '一个位置一个位置地填上还没用过的数；返回时把它释放，再试下一个。'],
  ideas: [
    ['A permutation is an arrangement of n different things in a row. There are n! of them.', '排列就是把 n 个不同的东西排成一行。一共有 n! 种。'],
    ['Build it position by position: position k can take any number not used in positions 1 … k − 1.', '一个位置一个位置地构造：第 k 个位置可以放任何没有在前 k − 1 个位置用过的数。'],
    ['used[x] remembers which numbers are taken. After the recursive call returns, clear it: that is backtracking.', 'used[x] 记录哪些数已被占用。递归调用返回后要把它清除：这就是回溯。'],
    ['Trying the numbers in increasing order produces the permutations in dictionary order.', '按从小到大的顺序尝试各个数，得到的排列就是字典序的。'],
  ],
  time: 'O(n · n!)', space: 'O(n)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, a[12];
bool used[12];

void dfs(int k) {  // choose the number for position k
    if (k > n) {
        for (int i = 1; i <= n; i++) printf("%d ", a[i]);  //@print
        puts("");
        return;
    }
    for (int x = 1; x <= n; x++) {
        if (used[x]) continue;  //@skip
        a[k] = x; used[x] = true;  //@put
        dfs(k + 1);
        used[x] = false;  //@undo
    }
}

int main() {
    scanf("%d", &n);
    dfs(1);
}`,
  notes: [
    ['print', ['All n positions are filled: one complete permutation.', 'n 个位置都填好了：得到一个完整的排列。']],
    ['skip', ['x already stands in an earlier position.', 'x 已经放在前面的某个位置上了。']],
    ['put', ['Position k is decided; the recursion decides the rest.', '第 k 个位置确定了；剩下的交给递归。']],
    ['undo', ['Give x back, so that later choices for position k can use it further on.', '把 x 还回去，这样第 k 个位置换成别的数之后，后面的位置还能用它。']],
  ],
  input: ['n (1 ≤ n ≤ 9). Prints every permutation of 1 … n, one per line, in dictionary order.', 'n（1 ≤ n ≤ 9）。按字典序输出 1 … n 的所有排列，每行一个。'],
  sizes: [2, 3, 4], lab: [3, 5, 7, 8],
  gen: n => `${n}\n`,
  broken: {
    from: 'used[x] = false;  //@undo', to: 'used[k] = false;  //@undo',
    why: ['used is indexed by __number__, not by position: the number x that was put at position k is the one to give back. `used[k]` frees whichever number happens to equal the position instead, so x stays taken for good while another number becomes free although it is still in the row: permutations go missing and others repeat a number.', 'used 的下标是__数__而不是位置：要归还的是放在第 k 个位置上的那个数 x。`used[k]` 释放的却是恰好等于位置编号的那个数，于是 x 永远被占着，而另一个仍在排列中的数却变成了“空闲”：一些排列消失了，另一些排列里出现了重复的数。'],
  },
  run(inp, t, bug = false) {
    const n = reader(inp).int()
    need(Number.isInteger(n) && n >= 1 && n <= 9, 'n must be between 1 and 9.', 'n 须在 1 到 9 之间。')
    const a = new Array<number>(n + 1).fill(0), used = new Array<boolean>(n + 1).fill(false), out: string[] = []
    const view = (k: number, tone: 'act' | 'ok' | 'bad') => [
      arr('a: the permutation being built', a.slice(1).map((v, i) => (i < k ? v : '')), tn({ [tone]: tone === 'ok' ? span(0, n - 1) : k - 1 }), tone === 'ok' ? undefined : { k: k - 1 }, { base: 1 }),
      arr('still free', span(1, n).map(x => (used[x] ? '' : x)), tn({ dim: span(1, n).filter(x => used[x]).map(x => x - 1) }), undefined, { base: 1 }),
    ] as const
    const dfs = (k: number) => {
      if (k > n) {
        out.push(a.slice(1).join(' '))
        t.s('print', () => [[`All ${n} positions filled: permutation number ${out.length}.`, `${n} 个位置都填好了：这是第 ${out.length} 个排列。`], ...view(n, 'ok'), vars({ found: out.length })])
        return
      }
      for (let x = 1; x <= n; x++) {
        if (used[x]) { t.tick(); continue }
        if (!bug && (k > 1 || x > 1)) t.ask(() => {
          const free = span(1, n).filter(v => !used[v])
          return free.length < 2 || free.length > 4 ? undefined : [[`Position ${k}: which number is put here now?`, `第 ${k} 个位置：现在放哪个数？`], free.map(v => [String(v), String(v)] as const), free.indexOf(x)]
        })
        a[k] = x; used[x] = true
        t.s('put', () => [[`Position ${k}: put ${x}.`, `第 ${k} 个位置：放 ${x}。`], ...view(k, 'act'), vars({ k, x, found: out.length })])
        dfs(k + 1)
        used[bug ? k : x] = false
        const freed = bug ? k : x
        t.s('undo', () => [bug ? [`Back at position ${k}: used[${freed}] = false.`, `回到第 ${k} 个位置：used[${freed}] = false。`] : [`Back at position ${k}: take ${x} out again and try the next number.`, `回到第 ${k} 个位置：把 ${x} 拿出来，试下一个数。`], ...view(k, 'bad'), vars({ k, x, found: out.length })])
      }
    }
    dfs(1)
    t.out(out.join('\n'))
  },
}

/** Longest downhill run on a grid of heights, with or without remembering the answers of cells already solved. */
export const skiRun = (memo: boolean): Lesson['run'] => (inp, t, bug = false) => {
  const rd = reader(inp), n = rd.int(), m = rd.int()
  need(Number.isInteger(n) && Number.isInteger(m) && n >= 1 && m >= 1 && n * m <= 250000, 'The grid needs between 1 and 250,000 cells.', '网格的格子数须在 1 到 250,000 之间。')
  const h = Array.from({ length: n }, () => rd.ints(m)), f = Array.from({ length: n }, () => new Int32Array(m)), path: number[] = []
  let calls = 0
  const view = (x: number, y: number, tone: Tone) => {
    const tones: Record<string, Tone> = {}
    if (memo) for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) if (f[i][j]) tones[i + ',' + j] = 'ok'
    for (const id of path) tones[Math.floor(id / m) + ',' + (id % m)] = 'cmp'
    tones[x + ',' + y] = tone
    return [grid('height', h, tones, { sq: true }), memo ? grid('f: longest run starting here', f.map(row => Array.from(row, v => v || '')), { [x + ',' + y]: tone }, { sq: true }) : vars({ calls })] as const
  }
  const dfs = (x: number, y: number, top: boolean): number => {
    if (memo && !top && !bug) t.ask(() => [[`dfs(${x}, ${y}) is called. What does it do?`, `调用 dfs(${x}, ${y})。它会做什么？`], [['return the stored answer at once', '直接返回存好的答案'], ['search from this cell', '从这个格子开始搜索']], f[x][y] ? 0 : 1])
    if (memo && f[x][y]) {
      if (top) t.tick(); else t.s('hit', () => [[`(${x}, ${y}) was solved before: f = ${f[x][y]}, no need to search again.`, `(${x}, ${y}) 之前已经算过：f = ${f[x][y]}，不必再搜。`], ...view(x, y, 'alt')])
      return f[x][y]
    }
    calls++
    t.s('enter', () => [[`Search from (${x}, ${y}), height ${h[x][y]}.`, `从 (${x}, ${y}) 开始搜索，高度 ${h[x][y]}。`], ...view(x, y, 'act')])
    path.push(x * m + y)
    let best = bug ? 0 : 1
    for (let k = 0; k < 4; k++) {
      const nx = x + DX[k], ny = y + DY[k]
      if (nx < 0 || ny < 0 || nx >= n || ny >= m || h[nx][ny] >= h[x][y]) continue
      best = Math.max(best, dfs(nx, ny, false) + 1)
    }
    path.pop()
    if (memo) f[x][y] = best
    t.s(memo ? 'set' : 'ret', () => [memo ? [`All lower neighbours of (${x}, ${y}) are done: f = ${best}. Remember it.`, `(${x}, ${y}) 的所有更低的邻居都处理完了：f = ${best}。把它记下来。`] : [`(${x}, ${y}) returns ${best} — and forgets it.`, `(${x}, ${y}) 返回 ${best}——然后就忘了。`], ...view(x, y, 'ok')])
    return best
  }
  let ans = 0
  for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) ans = Math.max(ans, dfs(i, j, true))
  t.s('done', () => [[`The longest downhill run has ${ans} cells.`, `最长的下坡路线经过 ${ans} 个格子。`], grid('height', h, undefined, { sq: true }), memo ? grid('f: longest run starting here', f.map(row => Array.from(row)), Object.fromEntries(f.flatMap((row, i) => Array.from(row, (v, j) => [i + ',' + j, v === ans ? 'ok' : undefined] as const)).filter(e => e[1])) as Record<string, Tone>, { sq: true }) : vars({ calls, answer: ans })])
  t.out(ans)
}

const memoSearch: Lesson = {
  id: 'memo-search', title: ['Memoised search', '记忆化搜索'], level: 'S', cat: 'search', diff: 6,
  needs: ['flood-fill'],
  blurb: ['A recursive search that writes down every answer it computes, so no question is ever worked out twice.', '在递归搜索时把每个算出的答案记下来，同一个问题绝不算第二遍。'],
  ideas: [
    ['dfs(x, y) answers one question: how long is the best downhill run that starts here?', 'dfs(x, y) 回答一个问题：从这里出发，最长能滑多远？'],
    ['The answer depends only on (x, y) — not on how the search got there. So it can be stored and reused.', '答案只取决于 (x, y)——与搜索是怎么走到这里的无关。所以可以把它存起来反复使用。'],
    ['f[x][y] = 0 means "not computed yet". The first line of dfs returns a stored answer at once.', 'f[x][y] = 0 表示“还没算过”。dfs 的第一行就是直接返回已经存好的答案。'],
    ['Every cell is solved once and looks at four neighbours: the exponential search becomes O(n · m).', '每个格子只求解一次，每次看四个邻居：指数级的搜索变成了 O(n · m)。'],
    ['This is dynamic programming written as a recursion: the recursion finds the right order of evaluation by itself.', '这就是写成递归形式的动态规划：计算顺序由递归自己安排。'],
  ],
  time: 'O(n · m)', space: 'O(n · m)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, m, h[505][505], f[505][505];
int dx[] = {-1, 0, 1, 0}, dy[] = {0, 1, 0, -1};

int dfs(int x, int y) {  // longest downhill run starting at (x, y)
    if (f[x][y]) return f[x][y];  //@hit
    int best = 1;  //@enter
    for (int k = 0; k < 4; k++) {
        int nx = x + dx[k], ny = y + dy[k];
        if (nx < 0 || ny < 0 || nx >= n || ny >= m || h[nx][ny] >= h[x][y]) continue;
        best = max(best, dfs(nx, ny) + 1);
    }
    return f[x][y] = best;  //@set
}

int main() {
    scanf("%d%d", &n, &m);
    for (int i = 0; i < n; i++)
        for (int j = 0; j < m; j++) scanf("%d", &h[i][j]);
    int ans = 0;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < m; j++) ans = max(ans, dfs(i, j));
    printf("%d\n", ans);  //@done
}`,
  notes: [
    ['hit', ['Every answer is at least 1, so 0 can stand for "unknown".', '每个答案至少是 1，所以可以用 0 表示“未知”。']],
    ['enter', ['The cell on its own is a run of length 1.', '只有这一个格子时，路线长度为 1。']],
    ['set', ['Store the answer and return it in one statement.', '在一条语句里既保存答案又返回它。']],
    ['done', ['The run may start anywhere, so every cell is tried as a start. Solved cells answer immediately.', '路线可以从任何格子出发，所以每个格子都要作为起点试一次。已经求解过的格子会立刻给出答案。']],
  ],
  input: ['n m, then n rows of m heights. A run moves to a neighbouring cell (up, down, left, right) that is strictly lower. Prints the number of cells on the longest run.', 'n m，随后 n 行，每行 m 个高度。每一步只能滑到上下左右相邻且严格更低的格子。输出最长路线经过的格子数。'],
  sizes: [3, 4, 5], lab: [4, 8, 12, 100, 300],
  gen: (n, r) => `${n} ${n}\n` + span(0, n - 1).map(i => span(0, n - 1).map(j => 2 * (2 * n - 2 - i - j) + r.int(0, 3) + 1).join(' ')).join('\n') + '\n',
  broken: {
    from: 'int best = 1;  //@enter', to: 'int best = 0;  //@enter',
    why: ['A run that starts at (x, y) contains (x, y) itself, so even a cell with no lower neighbour has an answer of __1__, not 0. Starting from 0 makes every answer one too small — and worse, 0 is also the mark for "not computed yet", so the bottom cells are searched again every time they are reached.', '从 (x, y) 出发的路线包含 (x, y) 本身，所以即使一个格子没有更低的邻居，它的答案也是 __1__ 而不是 0。从 0 开始会让每个答案都小 1——更糟的是，0 同时也是“还没算过”的标记，于是最低处的格子每次被走到都要重新搜索一遍。'],
  },
  run: skiRun(true),
}

const bidirBfs: Lesson = {
  id: 'bidir-bfs', title: ['Bidirectional BFS', '双向广搜'], level: 'S', cat: 'search', diff: 7,
  needs: ['bfs-maze'],
  blurb: ['Search from the start and from the target at once, and stop when the two searches meet in the middle.', '从起点和终点同时开始搜索，两边在中间相遇时就停下。'],
  ideas: [
    ['A breadth-first search visits everything within distance d before it reaches distance d. That set grows fast with d.', '广搜在到达距离 d 之前，要先访问距离小于 d 的所有状态。这个集合随 d 增长得很快。'],
    ['Two searches of depth d / 2 visit far fewer states than one search of depth d.', '两次深度为 d / 2 的搜索访问的状态，比一次深度为 d 的搜索少得多。'],
    ['Keep a distance array and a frontier for each side. Always expand the smaller frontier, one whole layer at a time.', '两边各有一个距离数组和一个当前层。每次扩展较小的那一层，并且一次扩展完整的一层。'],
    ['When a new cell of one side has already been reached by the other, a path through it has length d₀ + d₁.', '当一边新到达的格子已经被另一边到达过，经过这个格子的路径长度就是 d₀ + d₁。'],
    ['Finish the layer before stopping, and keep the smallest sum found in it.', '要把这一层扩展完再停，并取这一层中找到的最小的和。'],
  ],
  time: 'O(n · m)', space: 'O(n · m)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, m, d[2][1000005];
char g[1005][1005];
int dx[] = {-1, 0, 1, 0}, dy[] = {0, 1, 0, -1};

int main() {
    scanf("%d%d", &n, &m);
    for (int i = 0; i < n; i++) scanf("%s", g[i]);
    memset(d, -1, sizeof d);
    vector<int> f[2] = {{0}, {n * m - 1}};
    d[0][0] = d[1][n * m - 1] = 0;  //@start
    int best = n * m == 1 ? 0 : -1;
    while (best < 0 && !f[0].empty() && !f[1].empty()) {
        int s = f[0].size() <= f[1].size() ? 0 : 1;  //@side
        vector<int> nf;
        for (int cur : f[s]) {
            for (int k = 0; k < 4; k++) {
                int x = cur / m + dx[k], y = cur % m + dy[k], id = x * m + y;
                if (x < 0 || y < 0 || x >= n || y >= m || g[x][y] == '#' || d[s][id] != -1) continue;
                d[s][id] = d[s][cur] + 1;  //@grow
                nf.push_back(id);
                if (d[s ^ 1][id] != -1 && (best < 0 || d[0][id] + d[1][id] < best))
                    best = d[0][id] + d[1][id];  //@meet
            }
        }
        f[s] = nf;
    }
    printf("%d\n", best);  //@done
}`,
  notes: [
    ['start', ['d[0] holds distances from the start, d[1] distances from the target.', 'd[0] 保存到起点的距离，d[1] 保存到终点的距离。']],
    ['side', ['Expanding the smaller frontier keeps the two searches balanced.', '扩展较小的那一层，可以让两边的搜索保持均衡。']],
    ['meet', ['The other side has been here: start → this cell → target is a complete path.', '另一边已经到过这里：起点 → 这个格子 → 终点 构成一条完整的路径。']],
    ['done', ['If one frontier empties first, that side is walled in and there is no path.', '如果某一边的当前层先变空，说明它被墙围住了，路径不存在。']],
  ],
  input: ["n m, then n rows of '.' (free) and '#' (wall). Prints the fewest moves from the top-left to the bottom-right cell, or −1.", "n m，随后 n 行由 '.'（空地）和 '#'（墙）组成。输出从左上角到右下角的最少步数，无法到达输出 −1。"],
  sizes: [5, 7, 9], lab: [10, 100, 300, 1000],
  gen: (n, r) => genMaze(n, r),
  broken: {
    from: 'best = d[0][id] + d[1][id];  //@meet', to: 'best = d[0][id] + d[1][id] + 1;  //@meet',
    why: ['d[0][id] counts the moves from the start __to__ the meeting cell, and d[1][id] the moves from that cell to the target. The cell is the end of one half and the start of the other, so the two halves join there without any extra move. Adding 1 counts a move that is not made: every answer comes out one too long.', 'd[0][id] 是从起点__到__相遇格的步数，d[1][id] 是从这个格子到终点的步数。相遇格既是前半段的终点，又是后半段的起点，两段在这里直接接上，中间没有多出的一步。加 1 就多算了一步并不存在的移动：每个答案都多了 1。'],
  },
  run(inp, t, bug = false) {
    const { n, m, g } = readGrid(inp)
    need(g[0][0] === '.' && g[n - 1][m - 1] === '.', 'Start and target cells must be free.', '起点和终点必须是空地。')
    const d = [new Int32Array(n * m).fill(-1), new Int32Array(n * m).fill(-1)]
    let f: number[][] = [[0], [n * m - 1]]
    d[0][0] = 0; d[1][n * m - 1] = 0
    const view = (hi: Record<number, Tone> = {}) => {
      const tones: Record<string, Tone> = {}
      const cells = g.map((row, i) => row.split('').map((ch, j) => {
        const id = i * m + j, key = i + ',' + j
        if (ch === '#') { tones[key] = 'dim'; return '▓' }
        if (d[0][id] >= 0) tones[key] = 'cmp'
        if (d[1][id] >= 0) tones[key] = 'alt'
        if (hi[id]) tones[key] = hi[id]
        return d[0][id] >= 0 && d[1][id] >= 0 ? `${d[0][id]}+${d[1][id]}` : d[0][id] >= 0 ? d[0][id] : d[1][id] >= 0 ? d[1][id] : ''
      }))
      return grid('distance from the start (blue) or from the target (purple)', cells, tones, { sq: true })
    }
    const sizes = () => vars({ 'start frontier': f[0].length, 'target frontier': f[1].length })
    t.s('start', () => [['Two searches: one from the start, one from the target, each at distance 0.', '两个搜索：一个从起点出发，一个从终点出发，距离都是 0。'], view({ 0: 'act', [n * m - 1]: 'act' }), sizes()])
    let best = n * m === 1 ? 0 : -1
    while (best < 0 && f[0].length && f[1].length) {
      const s = f[0].length <= f[1].length ? 0 : 1, nf: number[] = [], layer = f[s]
      t.s('side', () => [[`The ${s ? 'target' : 'start'} side has the smaller frontier (${f[s].length} against ${f[s ^ 1].length}): expand its whole layer.`, `${s ? '终点' : '起点'}一侧的当前层更小（${f[s].length} 对 ${f[s ^ 1].length}）：把它整层扩展一步。`], view(Object.fromEntries(layer.map(id => [id, 'act' as Tone]))), sizes()])
      for (const cur of layer) for (let k = 0; k < 4; k++) {
        const x = Math.floor(cur / m) + DX[k], y = (cur % m) + DY[k], id = x * m + y
        if (x < 0 || y < 0 || x >= n || y >= m || g[x][y] === '#' || d[s][id] !== -1) { t.tick(); continue }
        d[s][id] = d[s][cur] + 1
        nf.push(id)
        const other = d[s ^ 1][id], sum = d[0][id] + d[1][id]
        if (other !== -1 && (best < 0 || sum < best)) {
          best = bug ? sum + 1 : sum
          const b = best
          t.s('meet', () => [bug ? [`(${x}, ${y}) was already reached from the other side: best = ${d[0][id]} + ${d[1][id]} + 1 = ${b}.`, `(${x}, ${y}) 已经被另一边到达过：best = ${d[0][id]} + ${d[1][id]} + 1 = ${b}。`] : [`(${x}, ${y}) was already reached from the other side: ${d[0][id]} + ${d[1][id]} = ${sum} moves.`, `(${x}, ${y}) 已经被另一边到达过：${d[0][id]} + ${d[1][id]} = ${sum} 步。`], view({ [id]: 'ok' }), vars({ best: b })])
        } else t.s('grow', () => [[`(${x}, ${y}) is new for the ${s ? 'target' : 'start'} side: distance ${d[s][id]}.`, `(${x}, ${y}) 是${s ? '终点' : '起点'}一侧的新格子：距离 ${d[s][id]}。`], view({ [id]: 'act' })])
      }
      f = s ? [f[0], nf] : [nf, f[1]]
    }
    const res = best
    t.s('done', () => [res >= 0 ? (bug ? [`The searches met: the program prints ${res}.`, `两边相遇了：程序输出 ${res}。`] : [`The searches met: the shortest path has ${res} moves.`, `两边相遇了：最短路为 ${res} 步。`]) : ['One side ran out of cells before the two met: −1.', '两边还没相遇，其中一边就无路可走了：−1。'], view(), vars({ answer: res })])
    t.out(res)
  },
}

const iddfs: Lesson = {
  id: 'iddfs', title: ['Iterative deepening: addition chains', '迭代加深搜索：加法链'], level: 'S', cat: 'search', diff: 7,
  needs: ['permutations'],
  blurb: ['Depth-first search with a depth limit, repeated with limit 0, 1, 2, … — the first limit that succeeds is the shortest answer.', '带深度限制的深搜，限制依次取 0、1、2……第一个能搜到解的限制就是最短的答案。'],
  ideas: [
    ['Depth-first search uses little memory but may dive far past the shortest solution. Breadth-first search finds the shortest but must store whole layers.', '深搜占用内存少，但可能一头扎得很深，错过最短的解。广搜能找到最短解，却要保存整层的状态。'],
    ['Iterative deepening runs a depth-first search that refuses to go deeper than a limit, and raises the limit by one each time it fails.', '迭代加深让深搜拒绝超过某个深度限制，每失败一次就把限制加一。'],
    ['The first limit that succeeds is the smallest possible depth — the guarantee of BFS with the memory of DFS.', '第一个成功的限制就是可能的最小深度——既有广搜的保证，又只用深搜的内存。'],
    ['Repeating the shallow levels is cheap: the last level dominates, because the tree grows geometrically.', '重复搜索较浅的层代价很小：因为搜索树按几何级数增长，最后一层占了绝大部分。'],
    ['The limit also gives a strong pruning test: if even doubling every remaining step cannot reach n, give up.', '深度限制还带来一个有力的剪枝：如果剩下的每一步都翻倍也到不了 n，就立刻放弃。'],
  ],
  time: 'exponential in the answer', space: 'O(answer)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, limit, a[64];

bool dfs(int k) {  // a[0..k] is chosen and increasing
    if (a[k] == n) return true;  //@goal
    if (k == limit) return false;  //@deep
    if (((long long)a[k] << (limit - k)) < n) return false;  //@prune
    for (int i = k; i >= 0; i--) {
        a[k + 1] = a[k] + a[i];  //@try
        if (a[k + 1] <= n && dfs(k + 1)) return true;
    }
    return false;  //@back
}

int main() {
    scanf("%d", &n);
    a[0] = 1;
    while (!dfs(0)) limit++;  //@deeper
    printf("%d\n", limit);
    for (int i = 0; i <= limit; i++) printf("%d ", a[i]);  //@done
}`,
  notes: [
    ['deep', ['The limit is reached without finding n: this branch is abandoned.', '已经到达深度限制却还没得到 n：放弃这个分支。']],
    ['prune', ['The largest number can at most double with each step. If that is not enough, no choice below can succeed.', '最大的数每一步最多翻倍。如果这样都不够，下面无论怎么选都不可能成功。']],
    ['try', ['The new number is the largest so far plus an earlier one; larger partners are tried first.', '新的数等于当前最大的数加上前面的某个数；先试较大的加数。']],
    ['deeper', ['No chain with this many additions exists. Allow one more.', '不存在只用这么多次加法的加法链。再多允许一次。']],
  ],
  input: ['n (1 ≤ n ≤ 5000). An addition chain starts with 1, and every later number is the sum of the previous number and one of the numbers before or equal to it. Prints the fewest additions that reach n, then one such chain.', 'n（1 ≤ n ≤ 5000）。加法链从 1 开始，后面的每个数都等于前一个数加上它之前（含它自己）的某个数。输出得到 n 所需的最少加法次数，以及一条这样的加法链。'],
  sizes: [7, 11, 15], lab: [10, 30, 100, 300, 1000, 3000],
  gen: n => `${n}\n`,
  broken: {
    from: 'printf("%d\\n", limit);', to: 'printf("%d\\n", limit + 1);',
    why: ['The question asks for the number of __additions__. The chain a[0..limit] holds limit + 1 numbers, but the first of them, 1, is given for free; each addition adds one number. So the count of additions is limit, and printing limit + 1 counts the numbers in the chain instead.', '题目问的是__加法__的次数。链 a[0..limit] 中有 limit + 1 个数，但第一个数 1 是白给的；每做一次加法才多出一个数。所以加法次数是 limit，输出 limit + 1 数的是链中数的个数。'],
  },
  run(inp, t, bug = false) {
    const n = reader(inp).int()
    need(Number.isInteger(n) && n >= 1 && n <= 5000, 'n must be between 1 and 5,000.', 'n 须在 1 到 5,000 之间。')
    const a = [1]
    let limit = 0
    const chain = (k: number, tone: Tone) => arr(`chain (limit: ${limit} addition${limit === 1 ? '' : 's'})`, [...a.slice(0, k + 1), ...new Array<string>(Math.max(0, limit - k)).fill('')], tn({ [tone]: k }), undefined, { base: 0 })
    const dfs = (k: number): boolean => {
      if (a[k] === n) { t.s('goal', () => [[`${a[k]} = n: a chain with ${k} addition${k === 1 ? '' : 's'}.`, `${a[k]} = n：得到一条用了 ${k} 次加法的加法链。`], chain(k, 'ok'), vars({ n, limit })]); return true }
      if (k === limit) { t.s('deep', () => [[`Limit reached at ${a[k]} ≠ ${n}: back.`, `到达深度限制，${a[k]} ≠ ${n}：返回。`], chain(k, 'bad'), vars({ n, limit })]); return false }
      const top = a[k] * 2 ** (limit - k)
      if (top < n) { t.s('prune', () => [[`${a[k]} doubled ${limit - k} more time${limit - k === 1 ? '' : 's'} gives ${top} < ${n}: hopeless, prune.`, `${a[k]} 再翻倍 ${limit - k} 次也只有 ${top} < ${n}：不可能成功，剪枝。`], chain(k, 'bad'), vars({ n, limit })]); return false }
      for (let i = k; i >= 0; i--) {
        a[k + 1] = a[k] + a[i]
        if (a[k + 1] > n) { t.tick(); continue }
        t.s('try', () => [[`Step ${k + 1}: ${a[k]} + ${a[i]} = ${a[k + 1]}.`, `第 ${k + 1} 步：${a[k]} + ${a[i]} = ${a[k + 1]}。`], chain(k + 1, 'act'), vars({ n, limit })])
        if (dfs(k + 1)) return true
      }
      return false
    }
    for (;;) {
      t.s('deeper', () => [[`Search with at most ${limit} addition${limit === 1 ? '' : 's'}.`, `搜索最多用 ${limit} 次加法的方案。`], chain(0, 'cmp'), vars({ n, limit })])
      if (dfs(0)) break
      limit++
    }
    const res = a.slice(0, limit + 1)
    t.s('done', () => [bug ? [`The search succeeded with limit ${limit}: the program prints ${limit + 1} and the chain.`, `在限制为 ${limit} 时搜索成功：程序输出 ${limit + 1} 和这条链。`] : [`Shortest chain: ${limit} addition${limit === 1 ? '' : 's'}.`, `最短的加法链用了 ${limit} 次加法。`], arr('chain', res, tn({ ok: span(0, limit) }), undefined, { base: 0 }), vars({ answer: limit })])
    t.out((bug ? limit + 1 : limit) + '\n' + res.join(' '))
  },
}

export default [queens, bfs, flood, astar, permutations, memoSearch, bidirBfs, iddfs]
