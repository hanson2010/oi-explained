import type { L, Tone, Variant } from '../../engine/types'
import { grid, Heap, need, vars } from '../../engine/h'
import { readGrid } from './lessons'

const cpp = String.raw

/**
 * Versions to learn first: the lesson's own method before one optimisation.
 * `label` names the lesson's own version next to it. The rule and the list are in specs/earlier-versions.md.
 */
export const FIRST: Record<string, { first: Variant; label: L }> = {
  'a-star': {
    label: ['A*: Manhattan distance', 'A*：曼哈顿距离'],
    first: {
      label: ['h = 0: Dijkstra', 'h = 0：Dijkstra'],
      blurb: ['The same program with an estimate that knows nothing: h returns 0, so cells are expanded purely by the distance walked — in every direction, including away from the target. The answer is the same; the number of expanded cells is not.', '同一个程序，只是估计函数一无所知：h 返回 0，于是格子完全按已走的距离扩展——朝所有方向，包括背离终点的方向。答案相同，扩展的格子数却不同。'],
      time: 'O(n · m · log(n · m))', space: 'O(n · m)', maxN: 700,
      gain: ['fewer cells expanded', '扩展的格子更少'],
      code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, m, d[1005][1005];
char g[1005][1005];
int dx[] = {-1, 0, 1, 0}, dy[] = {0, 1, 0, -1};

int h(int, int) { return 0; }  //@h

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
        ['h', ['The only line that differs. An estimate of 0 never overestimates, so the answer is still optimal — it just gives no direction.', '唯一不同的一行。估计值 0 永远不会高估，所以答案仍然最优——只是它不提供任何方向。']],
        ['pop', ['With h = 0 the key is the distance walked: cells leave the queue in rings around the start.', 'h = 0 时，排序的依据就是已走的距离：格子围着起点一圈一圈地出队。']],
      ],
      run(inp, t) {
        const { n, m, g } = readGrid(inp)
        need(g[0][0] === '.' && g[n - 1][m - 1] === '.', 'Start and target cells must be free.', '起点和终点必须是空地。')
        const BIG = 1e9, d = new Int32Array(n * m).fill(BIG), par = new Int32Array(n * m).fill(-1), closed = new Uint8Array(n * m)
        const pq = new Heap<[number, number]>((a, b) => a[0] < b[0] || (a[0] === b[0] && a[1] > b[1]))
        const DX = [-1, 0, 1, 0], DY = [0, 1, 0, -1]
        let expanded = 0
        const view = (cur: number, nw = -1, path: number[] = []) => {
          const tones: Record<string, Tone> = {}
          const cells = g.map((row, i) => row.split('').map((ch, j) => {
            const id = i * m + j
            if (ch === '#') { tones[i + ',' + j] = 'dim'; return '▓' }
            if (d[id] < BIG) tones[i + ',' + j] = closed[id] ? 'vis' : 'cmp'
            return d[id] < BIG ? d[id] : ''
          }))
          for (const p of path) tones[Math.floor(p / m) + ',' + (p % m)] = 'ok'
          if (cur >= 0) tones[Math.floor(cur / m) + ',' + (cur % m)] = 'act'
          if (nw >= 0) tones[Math.floor(nw / m) + ',' + (nw % m)] = 'ok'
          return grid('f = g + 0 of every discovered cell', cells, tones, { sq: true })
        }
        d[0] = 0; pq.push([0, 0])
        t.s('start', () => [['Start: g = 0, and h is 0 everywhere, so f = 0.', '起点：g = 0，而 h 处处为 0，所以 f = 0。'], view(0)])
        while (pq.size) {
          const [f, cur] = pq.pop()
          if (f > d[cur]) continue
          closed[cur] = 1; expanded++
          const x = Math.floor(cur / m), y = cur % m, e = expanded
          t.s('pop', () => [[`Pop (${x}, ${y}): f = g = ${f} is the smallest — no preference for any direction.`, `取出 (${x}, ${y})：f = g = ${f} 最小——对任何方向都没有偏好。`], view(cur), vars({ expanded: e })])
          if (cur === n * m - 1) break
          for (let k = 0; k < 4; k++) {
            const nx = x + DX[k], ny = y + DY[k], id = nx * m + ny
            if (nx < 0 || ny < 0 || nx >= n || ny >= m || g[nx][ny] === '#' || d[cur] + 1 >= d[id]) continue
            d[id] = d[cur] + 1; par[id] = cur; pq.push([d[id], id])
            t.s('relax', () => [[`(${nx}, ${ny}): g = ${d[id]}, so f = ${d[id]}.`, `(${nx}, ${ny})：g = ${d[id]}，所以 f = ${d[id]}。`], view(cur, id), vars({ expanded: e })])
          }
        }
        const ans = d[n * m - 1] < BIG ? d[n * m - 1] : -1
        t.s('done', () => {
          const path: number[] = []
          if (ans >= 0) for (let p = n * m - 1; p >= 0; p = par[p]) path.push(p)
          return [ans >= 0 ? [`Target reached in ${ans} moves after expanding ${expanded} of ${n * m} cells.`, `到达终点，共 ${ans} 步；扩展了 ${n * m} 个格子中的 ${expanded} 个。`] : ['The queue is empty: the target cannot be reached.', '队列已空：无法到达终点。'], view(-1, -1, path), vars({ expanded, answer: ans })]
        })
        t.out(ans)
      },
    },
  },
}
