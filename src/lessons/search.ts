import type { Lesson, Rng, Tone } from '../engine/types'
import { arr, grid, Heap, need, reader, tn, vars } from '../engine/h'

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
  run(inp, t) {
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
        if (col[c] || d1[r + c] || d2[r - c + n]) {
          t.s('prune', () => [[`Row ${r}, column ${c} is attacked (${col[c] ? 'same column' : 'same diagonal'}): skip.`, `第 ${r} 行第 ${c} 列被攻击（${col[c] ? '同列' : '同一对角线'}）：跳过。`], board(r, c, 'bad'), vars({ solutions: ans })])
          continue
        }
        col[c] = d1[r + c] = d2[r - c + n] = true; pos.push(c)
        t.s('place', () => [[`Row ${r}: place a queen in column ${c}, go to row ${r + 1}.`, `第 ${r} 行：在第 ${c} 列放皇后，进入第 ${r + 1} 行。`], board(r, c, 'act'), vars({ solutions: ans })])
        dfs(r + 1)
        col[c] = d1[r + c] = d2[r - c + n] = false; pos.pop()
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
  run(inp, t) {
    const { n, m, g } = readGrid(inp)
    need(g[0][0] === '.' && g[n - 1][m - 1] === '.', 'Start and target cells must be free.', '起点和终点必须是空地。')
    const d = new Int32Array(n * m).fill(-1), q = [0]
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
      t.s('pop', () => [[`Pop (${x}, ${y}) at distance ${d[cur]}.`, `取出 (${x}, ${y})，距离 ${d[cur]}。`], ...view(cur, -1, h + 1)])
      for (let k = 0; k < 4; k++) {
        const nx = x + DX[k], ny = y + DY[k], id = nx * m + ny
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
  run(inp, t) {
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
          id[c] = cnt; q.push(c)
          t.s('fill', () => [[`Spread from (${x}, ${y}) to (${nx}, ${ny}).`, `从 (${x}, ${y}) 扩散到 (${nx}, ${ny})。`], view(c), vars({ regions: cnt })])
        }
      }
    }
    t.s('done', () => [[`The scan is complete: ${cnt} region(s).`, `扫描结束：共 ${cnt} 个连通块。`], view(-1), vars({ regions: cnt })])
    t.out(cnt)
  },
}

const astar: Lesson = {
  id: 'a-star', title: ['Heuristic search: A*', '启发式搜索：A*'], level: 'S', cat: 'search', diff: 7,
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
  run(inp, t) {
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
      if (f > d[cur] + h(cur)) continue
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
      return [ans >= 0 ? [`Target reached in ${ans} moves after expanding ${expanded} of ${n * m} cells.`, `到达终点，共 ${ans} 步；只扩展了 ${n * m} 个格子中的 ${expanded} 个。`] : ['The frontier is empty: the target is unreachable.', '待扩展集合已空：终点不可达。'], view(-1, -1, path), vars({ expanded })]
    })
    t.out(ans)
  },
}

export default [queens, bfs, flood, astar]
