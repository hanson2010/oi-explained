import type { GEdge, Lesson, Rng, Tone, Tones } from '../../engine/types'
import { arr, graph, grid, gt, Heap, layoutBin, layoutForest, need, reader, span, tn, vars } from '../../engine/h'

const cpp = String.raw

const stack: Lesson = {
  id: 'stack', title: ['Stack: bracket matching', '栈：括号匹配'], level: 'J', cat: 'ds', diff: 3,
  blurb: ['Last in, first out. Push every opening bracket; each closing bracket must match the one on top.', '后进先出。左括号入栈；每个右括号必须与栈顶的左括号配对。'],
  ideas: [
    ['A stack only allows push and pop at one end — the top.', '栈只允许在一端（栈顶）进行入栈和出栈。'],
    ['The most recent unmatched opening bracket is exactly the one a closing bracket must pair with — that is LIFO.', '右括号要配对的，恰好是最近一个尚未匹配的左括号——这正是后进先出。'],
    ['Three ways to fail: a closing bracket on an empty stack, a mismatched pair, or leftovers at the end.', '三种失败情况：栈空时遇到右括号、括号种类不匹配、结束时栈里还有剩余。'],
  ],
  time: 'O(n)', space: 'O(n)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int main() {
    string s;
    cin >> s;
    stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '[' || c == '{') {
            st.push(c);  //@push
        } else {
            if (st.empty()) { puts("No"); return 0; }  //@empty
            char o = st.top(); st.pop();
            if ((o == '(' && c != ')') || (o == '[' && c != ']') || (o == '{' && c != '}')) {
                puts("No"); return 0;  //@bad
            }  //@pop
        }
    }
    puts(st.empty() ? "Yes" : "No");  //@done
}`,
  notes: [
    ['push', ['An opening bracket waits on the stack for its partner.', '左括号进栈，等待它的搭档。']],
    ['empty', ['Always check for an empty stack before reading the top.', '读取栈顶之前一定要先判断栈是否为空。']],
    ['done', ['Anything left on the stack is an opening bracket that never closed.', '栈里剩下的都是没有闭合的左括号。']],
  ],
  input: ['A string of the characters ( ) [ ] { }. Prints Yes if it is balanced, otherwise No.', '由 ( ) [ ] { } 组成的字符串。括号匹配输出 Yes，否则输出 No。'],
  sizes: [6, 10, 16], lab: [10, 1000, 100000, 1000000],
  gen(n, r) {
    const open = '([{', close = ')]}', st: number[] = []
    let s = ''
    for (let i = 0; i < n; i++) {
      const left = n - i
      if (st.length && (st.length >= left || r.next() < 0.45)) s += close[st.pop()!]
      else if (left > 1) { const k = r.int(0, 2); st.push(k); s += open[k] } else s += ')'
    }
    if (n > 2 && r.next() < 0.3) { const i = r.int(0, n - 1); s = s.slice(0, i) + r.pick([...'()[]{}']) + s.slice(i + 1) }
    return s + '\n'
  },
  run(inp, t) {
    const s = reader(inp).str(), st: string[] = [], pair: Record<string, string> = { '(': ')', '[': ']', '{': '}' }
    need(/^[()[\]{}]+$/.test(s), 'Only the characters ()[]{} are allowed.', '只允许字符 ()[]{}。')
    const chars = s.split('')
    const view = (i: number, tone: Tone) => [arr('s', chars, tn({ dim: span(0, i - 1), [tone]: i }), { i }), arr('stack (top on the right)', st.length ? st : ['—'], st.length ? tn({ cmp: st.length - 1 }) : {})] as const
    for (let i = 0; i < chars.length; i++) {
      const c = chars[i]
      if (c in pair) { st.push(c); t.s('push', () => [[`'${c}' opens: push it.`, `'${c}' 是左括号：入栈。`], ...view(i, 'act')]); continue }
      if (!st.length) { t.s('empty', () => [[`'${c}' closes, but the stack is empty: No.`, `'${c}' 是右括号，但栈为空：No。`], ...view(i, 'bad')]); t.out('No'); return }
      const o = st.pop()!
      if (pair[o] !== c) { t.s('bad', () => [[`'${c}' does not close '${o}': No.`, `'${c}' 无法与 '${o}' 配对：No。`], ...view(i, 'bad')]); t.out('No'); return }
      t.s('pop', () => [[`'${c}' matches the top '${o}': pop.`, `'${c}' 与栈顶 '${o}' 匹配：出栈。`], ...view(i, 'ok')])
    }
    t.s('done', () => [st.length ? [`${st.length} bracket(s) never closed: No.`, `还有 ${st.length} 个括号没有闭合：No。`] : ['The stack is empty at the end: Yes.', '结束时栈为空：Yes。'], arr('s', chars, tn({ [st.length ? 'bad' : 'ok']: span(0, chars.length - 1) })), arr('stack', st.length ? st : ['—'])])
    t.out(st.length ? 'No' : 'Yes')
  },
}

function readBin(inp: string) {
  const rd = reader(inp), n = rd.int(), l = [0], r = [0], par = new Array<number>(n + 1).fill(0)
  need(n >= 1, 'n must be at least 1.', 'n 至少为 1。')
  for (let i = 1; i <= n; i++) {
    l.push(rd.int()); r.push(rd.int())
    for (const c of [l[i], r[i]]) {
      need(c >= 0 && c <= n && c !== 1 && (c === 0 || !par[c]), `Node ${i} has an invalid child.`, `结点 ${i} 的孩子不合法。`)
      if (c) par[c] = i
    }
  }
  for (let i = 2; i <= n; i++) need(par[i] > 0, `Node ${i} is not attached to the tree.`, `结点 ${i} 没有接在树上。`)
  return { n, l, r }
}
function genBin(n: number, rg: Rng) {
  const l = new Array<number>(n + 1).fill(0), r = new Array<number>(n + 1).fill(0), slots: number[] = [1, -1]
  for (let i = 2; i <= n; i++) {
    const k = rg.int(0, slots.length - 1), s = slots[k]
    slots[k] = slots[slots.length - 1]; slots.pop()
    if (s > 0) l[s] = i; else r[-s] = i
    slots.push(i, -i)
  }
  return `${n}\n` + span(1, n).map(i => `${l[i]} ${r[i]}`).join('\n') + '\n'
}

const traversal: Lesson = {
  id: 'bt-traversal', title: ['Binary tree traversals', '二叉树的遍历'], level: 'J', cat: 'ds', diff: 4,
  blurb: ['Pre-, in- and post-order differ only in when the root is visited relative to its two subtrees.', '前序、中序、后序的区别只在于：相对于左右子树，根在什么时候被访问。'],
  ideas: [
    ['Store the tree with two arrays: l[u] and r[u] are the children of u (0 = none).', '用两个数组存树：l[u]、r[u] 是 u 的左右孩子（0 表示没有）。'],
    ['Pre-order: root, left, right. In-order: left, root, right. Post-order: left, right, root.', '前序：根、左、右。中序：左、根、右。后序：左、右、根。'],
    ['Each is the same recursion with the "visit" line in a different place.', '三者是同一个递归，只是“访问”这一行放的位置不同。'],
    ['Pre-order (or post-order) together with in-order determines the tree uniquely.', '前序（或后序）加上中序可以唯一确定一棵二叉树。'],
  ],
  time: 'O(n)', space: 'O(h)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, l[1000005], r[1000005];

void pre(int u) {
    if (!u) return;
    printf("%d ", u);  //@pre
    pre(l[u]); pre(r[u]);
}

void in(int u) {
    if (!u) return;
    in(l[u]);
    printf("%d ", u);  //@in
    in(r[u]);
}

void post(int u) {
    if (!u) return;
    post(l[u]); post(r[u]);
    printf("%d ", u);  //@post
}

int main() {
    scanf("%d", &n);
    for (int i = 1; i <= n; i++) scanf("%d%d", &l[i], &r[i]);
    pre(1); puts("");
    in(1); puts("");
    post(1); puts("");
}`,
  notes: [
    ['pre', ['Visit before descending: a node is printed before everything below it.', '先访问再递归：结点在它的所有后代之前输出。']],
    ['in', ['Visit between the subtrees: on a binary search tree this prints the keys in sorted order.', '在两棵子树之间访问：对二叉搜索树，这样输出的键值恰好有序。']],
    ['post', ['Visit after both subtrees: children are always printed before their parent.', '两棵子树都处理完才访问：孩子总在父亲之前输出。']],
  ],
  input: ['n, then n lines "l r": the left and right child of node i (0 = none). The root is node 1. Prints the three orders.', 'n，随后 n 行 “l r”：结点 i 的左右孩子（0 表示没有）。根为 1 号结点。输出三种遍历序。'],
  sizes: [5, 7, 10], lab: [10, 1000, 100000, 300000],
  gen: genBin,
  run(inp, t) {
    const { n, l, r } = readBin(inp)
    const pos = t.on ? layoutBin(1, i => l[i] || -1, i => r[i] || -1) : []
    const es: GEdge[] = []
    for (let i = 1; i <= n; i++) for (const c of [l[i], r[i]]) if (c) es.push({ u: i, v: c })
    const lines: string[] = []
    const names = { pre: ['Pre-order', '前序'], in: ['In-order', '中序'], post: ['Post-order', '后序'] } as const
    for (const mode of ['pre', 'in', 'post'] as const) {
      const out: number[] = [], seen: Tones = {}
      const visit = (u: number) => {
        out.push(u); seen[u] = 'ok'
        t.s(mode, () => [[`${names[mode][0]}: visit ${u}.`, `${names[mode][1]}：访问 ${u}。`], graph(pos, es, { base: 0, tone: { ...seen, [u]: 'act' } }), arr(names[mode][0].toLowerCase(), out, tn({ act: out.length - 1 }))])
      }
      // Explicit stack, so deep trees cannot overflow the call stack.
      const st: [number, number][] = [[1, 0]]
      while (st.length) {
        const top = st[st.length - 1], u = top[0]
        if (!u) { st.pop(); continue }
        if (top[1] === 0) { if (mode === 'pre') visit(u); top[1] = 1; st.push([l[u], 0]) }
        else if (top[1] === 1) { if (mode === 'in') visit(u); top[1] = 2; st.push([r[u], 0]) }
        else { if (mode === 'post') visit(u); st.pop() }
      }
      lines.push(out.join(' '))
    }
    t.out(lines.join('\n'))
  },
}

const huffman: Lesson = {
  id: 'huffman', title: ['Huffman tree', '哈夫曼树'], level: 'J', cat: 'ds', diff: 4,
  blurb: ['Greedily merge the two lightest trees until one remains: frequent symbols end up near the root.', '贪心地反复合并权值最小的两棵树，直到只剩一棵：出现越频繁的符号离根越近。'],
  ideas: [
    ['Goal: a binary tree whose leaves are the symbols, minimising Σ weight × depth (the weighted path length).', '目标：以各符号为叶子的二叉树，使 Σ 权值 × 深度（带权路径长度 WPL）最小。'],
    ['Greedy choice: the two smallest weights can always be made siblings at the deepest level.', '贪心选择：权值最小的两个结点总可以作为最深层的一对兄弟。'],
    ['Merge them into a node whose weight is their sum, and repeat. A min-heap finds the two smallest quickly.', '把它们合并成一个权值为两者之和的结点，如此反复。用小根堆快速取出最小的两个。'],
    ['Each merge adds its sum to the answer: every leaf below gets one level deeper.', '每次合并把和累加进答案：因为它下面的每个叶子都加深了一层。'],
    ['Reading 0 for left and 1 for right gives a prefix-free code — Huffman coding.', '左分支记 0、右分支记 1，就得到一套前缀码——哈夫曼编码。'],
  ],
  time: 'O(n log n)', space: 'O(n)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int main() {
    int n; scanf("%d", &n);
    priority_queue<long long, vector<long long>, greater<long long>> q;
    for (int i = 0; i < n; i++) {
        long long w; scanf("%lld", &w);
        q.push(w);  //@init
    }
    long long ans = 0;
    while (q.size() > 1) {
        long long a = q.top(); q.pop();
        long long b = q.top(); q.pop();  //@pick
        ans += a + b;
        q.push(a + b);  //@merge
    }
    printf("%lld\n", ans);  //@done
}`,
  notes: [
    ['init', ['greater<> turns priority_queue into a min-heap.', 'greater<> 把 priority_queue 变成小根堆。']],
    ['pick', ['Two pops give the two lightest remaining trees.', '连续两次弹出，得到当前最轻的两棵树。']],
    ['merge', ['The merged tree goes back into the heap and competes like any other.', '合并后的树放回堆里，与其他树一视同仁。']],
  ],
  input: ['n, then n positive weights. Prints the minimum weighted path length.', 'n，随后 n 个正整数权值。输出最小带权路径长度。'],
  sizes: [4, 6, 8], lab: [10, 1000, 100000, 300000],
  gen: (n, r) => `${n}\n${r.ints(n, 1, n <= 40 ? 30 : 100000).join(' ')}\n`,
  run(inp, t) {
    const rd = reader(inp), n = rd.int(), w = rd.ints(n), par = new Array<number>(Math.max(1, 2 * n - 1)).fill(-2)
    need(n >= 1 && w.every(x => x > 0), 'Weights must be positive.', '权值必须为正。')
    const q = new Heap<[number, number]>((a, b) => a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]))
    const es: GEdge[] = []
    w.forEach((x, i) => { q.push([x, i]); par[i] = -1 })
    const view = (tone: Tones) => graph(layoutForest(par), es, { label: w, tone })
    t.s('init', () => [[`${n} single-node trees go into the min-heap.`, `${n} 棵单结点树进入小根堆。`], view({}), vars({ answer: 0 })])
    let ans = 0, id = n
    while (q.size > 1) {
      const a = q.pop(), b = q.pop()
      t.s('pick', () => [[`The two lightest trees weigh ${a[0]} and ${b[0]}.`, `最轻的两棵树权值为 ${a[0]} 和 ${b[0]}。`], view(tn({ act: [a[1], b[1]] })), vars({ answer: ans })])
      ans += a[0] + b[0]
      w.push(a[0] + b[0]); par[id] = -1; par[a[1]] = id; par[b[1]] = id
      es.push({ u: id, v: a[1] }, { u: id, v: b[1] })
      q.push([a[0] + b[0], id])
      const me = id++
      t.s('merge', () => [[`Merge them under a new node of weight ${a[0] + b[0]}; answer += ${a[0] + b[0]}.`, `合并为权值 ${a[0] + b[0]} 的新结点；答案 += ${a[0] + b[0]}。`], view(tn({ ok: me, cmp: [a[1], b[1]] })), vars({ answer: ans })])
    }
    t.s('done', () => [[`One tree remains. Weighted path length = ${ans}.`, `只剩一棵树。带权路径长度 = ${ans}。`], view(tn({ ok: span(0, n - 1) })), vars({ answer: ans })])
    t.out(ans)
  },
}

/** Edges and positions of a binary tree stored in lc/rc arrays (0 = no child). */
function binView(roots: number[], lc: number[], rc: number[], label: readonly (string | number)[], o: { tone?: Tones; sub?: (string | number | undefined)[]; name?: string } = {}) {
  const pos = layoutBin(roots, i => lc[i] || -1, i => rc[i] || -1), es: GEdge[] = []
  for (let i = 1; i < pos.length; i++) if (pos[i]) for (const c of [lc[i], rc[i]]) if (c) es.push({ u: i, v: c })
  return graph(pos, es, { label, ...o })
}

const bst: Lesson = {
  id: 'bst', title: ['Binary search tree', '二叉搜索树'], level: 'J', cat: 'ds', diff: 4,
  blurb: ['Smaller keys go left, larger keys go right — so one comparison per level finds any key.', '小的往左、大的往右——每层只需比较一次就能定位任意键值。'],
  ideas: [
    ['Invariant: every key in the left subtree < the node < every key in the right subtree.', '性质：左子树所有键值 < 结点 < 右子树所有键值。'],
    ['Insert by walking down from the root and attaching the key where the walk falls off the tree.', '插入时从根往下走，在走出树的位置挂上新结点。'],
    ['An in-order traversal prints the keys in ascending order.', '中序遍历恰好按升序输出所有键值。'],
    ['Cost is the height: O(log n) on random data but O(n) if the keys arrive sorted — the motivation for balanced trees.', '代价取决于树高：随机数据下为 O(log n)，但键值有序到达时退化为 O(n)——这正是平衡树的动机。'],
  ],
  time: 'O(h) per insert', space: 'O(n)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, root, cnt, key[1000005], lc[1000005], rc[1000005];

void insert(int &u, int x) {
    if (!u) { u = ++cnt; key[u] = x; return; }  //@new
    if (x < key[u]) insert(lc[u], x);  //@left
    else if (x > key[u]) insert(rc[u], x);  //@right
}

void inorder(int u) {
    if (!u) return;
    inorder(lc[u]);
    printf("%d ", key[u]);  //@visit
    inorder(rc[u]);
}

int main() {
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        int x; scanf("%d", &x);
        insert(root, x);
    }
    inorder(root);
}`,
  notes: [
    ['new', ['int &u is a reference to the parent\'s child slot, so assigning u links the new node in.', 'int &u 是对父结点孩子指针的引用，给 u 赋值就把新结点接上了。']],
    ['left', ['Everything smaller than key[u] lives in the left subtree.', '所有比 key[u] 小的键值都在左子树。']],
    ['right', ['Equal keys match neither branch and are ignored.', '相等的键值两个分支都不进入，被忽略。']],
    ['visit', ['Left subtree, node, right subtree: ascending order.', '左子树、结点、右子树：升序。']],
  ],
  input: ['n, then n integers to insert in order. Prints the distinct keys in ascending order.', 'n，随后按顺序插入的 n 个整数。按升序输出互不相同的键值。'],
  sizes: [6, 8, 11], lab: [10, 1000, 100000, 300000],
  gen: (n, r) => `${n}\n${r.shuffle(span(1, n).map(i => i * 3 + r.int(0, 2))).join(' ')}\n`,
  run(inp, t) {
    const rd = reader(inp), n = rd.int(), xs = rd.ints(n), key = [0], lc = [0], rc = [0]
    let root = 0
    const view = (tone: Tones) => (root ? binView([root], lc, rc, key, { tone }) : null)
    for (const x of xs) {
      let u = root, p = 0
      const path: number[] = []
      while (u && key[u] !== x) {
        path.push(u)
        const cur = u, left = x < key[u]
        t.s(left ? 'left' : 'right', () => [[`${x} ${left ? '<' : '>'} ${key[cur]}: go ${left ? 'left' : 'right'}.`, `${x} ${left ? '<' : '>'} ${key[cur]}：往${left ? '左' : '右'}走。`], view(tn({ vis: path, act: cur })), vars({ x })])
        p = u; u = left ? lc[u] : rc[u]
      }
      if (u) { const cur = u; t.s('right', () => [[`${x} is already in the tree: nothing to do.`, `${x} 已在树中：无需插入。`], view(tn({ vis: path, cmp: cur })), vars({ x })]); continue }
      key.push(x); lc.push(0); rc.push(0)
      const me = key.length - 1
      if (!p) root = me; else if (x < key[p]) lc[p] = me; else rc[p] = me
      t.s('new', () => [[p ? `Empty spot: ${x} becomes the ${x < key[p] ? 'left' : 'right'} child of ${key[p]}.` : `The tree is empty: ${x} becomes the root.`, p ? `空位：${x} 成为 ${key[p]} 的${x < key[p] ? '左' : '右'}孩子。` : `树为空：${x} 成为根。`], view(tn({ vis: path, ok: me })), vars({ x })])
    }
    const out: number[] = [], st: number[] = [], seen: Tones = {}
    for (let u = root; u || st.length;) {
      while (u) { st.push(u); u = lc[u] }
      u = st.pop()!
      out.push(key[u]); seen[u] = 'ok'
      const cur = u
      t.s('visit', () => [[`In-order visit: ${key[cur]}.`, `中序访问：${key[cur]}。`], view({ ...seen, [cur]: 'act' }), arr('in-order', out, tn({ act: out.length - 1 }))])
      u = rc[u]
    }
    t.out(out.join(' '))
  },
}

const monoQueue: Lesson = {
  id: 'monotonic-queue', title: ['Monotonic queue: sliding window maximum', '单调队列：滑动窗口最大值'], level: 'S', cat: 'ds', diff: 5,
  blurb: ['Keep only the candidates that can still become a maximum; the answer is always at the front.', '只保留仍有可能成为最大值的候选者；答案永远在队首。'],
  ideas: [
    ['If a[i] ≥ a[j] and i > j, then j can never again be the window maximum: i is larger and stays longer.', '若 a[i] ≥ a[j] 且 i > j，那么 j 再也不可能是窗口最大值：i 更大，而且留得更久。'],
    ['So before pushing i, pop every index at the back whose value is ≤ a[i]. The values in the deque stay decreasing.', '所以在 i 入队前，把队尾所有值 ≤ a[i] 的下标弹出。队列中的值保持递减。'],
    ['Pop the front once it slides out of the window (index ≤ i − k).', '队首滑出窗口（下标 ≤ i − k）时把它弹出。'],
    ['Every index is pushed once and popped at most once: O(n) in total, no matter how large k is.', '每个下标入队一次、出队至多一次：无论 k 多大，总共 O(n)。'],
    ['The same structure speeds up DP transitions of the form f[i] = max(f[j]) + c over a sliding range of j.', '同样的结构可以优化形如 f[i] = max(f[j]) + c（j 在滑动区间内）的 DP 转移。'],
  ],
  time: 'O(n)', space: 'O(k)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, k, a[1000005];

int main() {
    scanf("%d%d", &n, &k);
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    deque<int> q;  // indices, values decreasing
    for (int i = 0; i < n; i++) {
        if (!q.empty() && q.front() <= i - k) q.pop_front();  //@expire
        while (!q.empty() && a[q.back()] <= a[i]) q.pop_back();  //@popback
        q.push_back(i);  //@push
        if (i >= k - 1) printf("%d ", a[q.front()]);  //@out
    }
}`,
  notes: [
    ['expire', ['Store indices, not values — otherwise you cannot tell when an element leaves the window.', '队列里存下标而不是值——否则无法判断元素何时离开窗口。']],
    ['popback', ['These elements are dominated by a[i]: smaller (or equal) and older.', '这些元素被 a[i] “支配”：值更小（或相等）而且更旧。']],
    ['out', ['The front is the largest value still inside the window.', '队首是窗口内最大的值。']],
  ],
  input: ['n k, then n integers. Prints the maximum of every window of length k.', 'n k，随后 n 个整数。输出每个长度为 k 的窗口中的最大值。'],
  sizes: [7, 10, 14], lab: [10, 1000, 100000, 1000000],
  gen: (n, r) => `${n} ${Math.max(1, Math.min(n, n <= 40 ? 3 : Math.floor(n / 10)))}\n${r.ints(n, 1, n <= 40 ? 30 : 1000000).join(' ')}\n`,
  run(inp, t) {
    const rd = reader(inp), n = rd.int(), k = rd.int(), a = rd.ints(n), q: number[] = [], out: number[] = []
    need(k >= 1 && k <= n, 'k must satisfy 1 ≤ k ≤ n.', 'k 须满足 1 ≤ k ≤ n。')
    let h = 0
    const view = (i: number, hi: Tones = {}) => [
      arr('a', a, { ...tn({ dim: [...span(0, i - k), ...span(i + 1, n - 1)], cmp: q.slice(h) }), ...hi }, { i }, { bars: true }),
      arr('deque (indices; front on the left)', q.length > h ? q.slice(h) : ['—']), arr('output', out.length ? out : ['—']),
    ] as const
    for (let i = 0; i < n; i++) {
      if (q.length > h && q[h] <= i - k) { const x = q[h++]; t.s('expire', () => [[`Index ${x} has left the window: pop the front.`, `下标 ${x} 已滑出窗口：弹出队首。`], ...view(i, { [x]: 'bad' })]) }
      while (q.length > h && a[q[q.length - 1]] <= a[i]) { const x = q.pop()!; t.s('popback', () => [[`a[${x}] = ${a[x]} ≤ a[${i}] = ${a[i]}: it can never be a maximum again, pop the back.`, `a[${x}] = ${a[x]} ≤ a[${i}] = ${a[i]}：它不可能再成为最大值，弹出队尾。`], ...view(i, { [x]: 'bad', [i]: 'act' })]) }
      q.push(i)
      t.s('push', () => [[`Push index ${i}.`, `下标 ${i} 入队。`], ...view(i, { [i]: 'act' })])
      if (i >= k - 1) { out.push(a[q[h]]); t.s('out', () => [[`Window [${i - k + 1}, ${i}]: the maximum is a[${q[h]}] = ${a[q[h]]}.`, `窗口 [${i - k + 1}, ${i}]：最大值是 a[${q[h]}] = ${a[q[h]]}。`], ...view(i, { [q[h]]: 'ok' })]) }
    }
    t.out(out.join(' '))
  },
}

const sparse: Lesson = {
  id: 'sparse-table', title: ['Sparse table (ST)', 'ST 表'], level: 'S', cat: 'ds', diff: 6,
  blurb: ['Precompute the maximum of every power-of-two block, then cover any range with two overlapping blocks.', '预处理每个长度为 2 的幂的区间的最大值，任意区间都能被两个可重叠的块覆盖。'],
  ideas: [
    ['st[j][i] = max of the 2ʲ elements starting at i.', 'st[j][i] = 从 i 开始连续 2ʲ 个元素的最大值。'],
    ['Doubling: a block of length 2ʲ is two blocks of length 2ʲ⁻¹ side by side.', '倍增：长度 2ʲ 的块由两个长度 2ʲ⁻¹ 的块拼成。'],
    ['Query [l, r]: take k = ⌊log₂(r − l + 1)⌋. The blocks starting at l and ending at r, each of length 2ᵏ, cover the range.', '查询 [l, r]：取 k = ⌊log₂(r − l + 1)⌋。从 l 开始和到 r 结束的两个长为 2ᵏ 的块覆盖整个区间。'],
    ['They overlap — harmless for max, min, gcd (idempotent operations), but wrong for sums.', '两块会重叠——对 max、min、gcd 这类可重复贡献的运算没有影响，但不能用于求和。'],
    ['O(n log n) to build, O(1) per query, no updates.', '预处理 O(n log n)，查询 O(1)，不支持修改。'],
  ],
  time: 'O(n log n) + O(1) per query', space: 'O(n log n)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, q, st[20][300005], lg[300005];

int main() {
    scanf("%d%d", &n, &q);
    for (int i = 1; i <= n; i++) scanf("%d", &st[0][i]);  //@base
    for (int i = 2; i <= n; i++) lg[i] = lg[i / 2] + 1;
    for (int j = 1; (1 << j) <= n; j++)
        for (int i = 1; i + (1 << j) - 1 <= n; i++)
            st[j][i] = max(st[j - 1][i], st[j - 1][i + (1 << (j - 1))]);  //@build
    while (q--) {
        int l, r; scanf("%d%d", &l, &r);
        int k = lg[r - l + 1];
        printf("%d\n", max(st[k][l], st[k][r - (1 << k) + 1]));  //@query
    }
}`,
  notes: [
    ['base', ['Blocks of length 2⁰ = 1 are the elements themselves.', '长度为 2⁰ = 1 的块就是元素本身。']],
    ['build', ['The right half starts 2ʲ⁻¹ positions later.', '右半块从 2ʲ⁻¹ 个位置之后开始。']],
    ['query', ['lg[] is precomputed so the query has no loop at all.', 'lg[] 预先算好，查询里完全没有循环。']],
  ],
  input: ['n q, the n numbers, then q lines "l r". Prints the maximum of a[l..r].', 'n q，n 个数，随后 q 行 “l r”。输出 a[l..r] 的最大值。'],
  sizes: [6, 8, 12], lab: [10, 1000, 100000, 300000],
  gen(n, r) {
    const q = n <= 30 ? 3 : n
    let s = `${n} ${q}\n${r.ints(n, 1, n <= 40 ? 50 : 1000000).join(' ')}\n`
    for (let i = 0; i < q; i++) { const l = r.int(1, n), h = r.int(l, n); s += `${l} ${h}\n` }
    return s
  },
  run(inp, t) {
    const rd = reader(inp), n = rd.int(), q = rd.int(), st: Int32Array[] = [Int32Array.from([0, ...rd.ints(n)])], out: number[] = []
    const lg = new Int32Array(n + 1)
    for (let i = 2; i <= n; i++) lg[i] = lg[i >> 1] + 1
    const view = (tone: Record<string, Tone>, upto = [99, 0]) => grid('st[j][i]', st.map((row, j) => span(1, n).map(i => (i + (1 << j) - 1 <= n && (j < upto[0] || (j === upto[0] && i <= upto[1])) ? row[i] : ''))), tone, { rows: st.map((_, j) => `j=${j} (len ${1 << j})`), cols: span(1, n) })
    t.s('base', () => [['Row 0 holds the elements: blocks of length 1.', '第 0 行就是原数组：长度为 1 的块。'], view(gt({ ok: span(0, n - 1).map(i => [0, i] as const) }))])
    for (let j = 1; 1 << j <= n; j++) {
      st.push(new Int32Array(n + 1))
      for (let i = 1; i + (1 << j) - 1 <= n; i++) {
        const h = 1 << (j - 1)
        st[j][i] = Math.max(st[j - 1][i], st[j - 1][i + h])
        t.s('build', () => [[`st[${j}][${i}] = max(st[${j - 1}][${i}], st[${j - 1}][${i + h}]) = max(${st[j - 1][i]}, ${st[j - 1][i + h]}) = ${st[j][i]}`, `st[${j}][${i}] = max(st[${j - 1}][${i}], st[${j - 1}][${i + h}]) = max(${st[j - 1][i]}, ${st[j - 1][i + h]}) = ${st[j][i]}`], view(gt({ cmp: [[j - 1, i - 1], [j - 1, i + h - 1]], act: [[j, i - 1]] }), [j, i])])
      }
    }
    for (let c = 0; c < q; c++) {
      const l = rd.int(), r = rd.int()
      need(1 <= l && l <= r && r <= n, 'Queries need 1 ≤ l ≤ r ≤ n.', '查询须满足 1 ≤ l ≤ r ≤ n。')
      const k = lg[r - l + 1], b = r - (1 << k) + 1, ans = Math.max(st[k][l], st[k][b])
      out.push(ans)
      t.s('query', () => [[`Query [${l}, ${r}]: length ${r - l + 1}, k = ${k}. Blocks [${l}, ${l + (1 << k) - 1}] and [${b}, ${r}] → max(${st[k][l]}, ${st[k][b]}) = ${ans}.`, `查询 [${l}, ${r}]：长度 ${r - l + 1}，k = ${k}。两个块 [${l}, ${l + (1 << k) - 1}] 和 [${b}, ${r}] → max(${st[k][l]}, ${st[k][b]}) = ${ans}。`],
        arr('a', Array.from(st[0].subarray(1)), tn({ cmp: span(l - 1, l + (1 << k) - 2), alt: span(b - 1, r - 1), ...(b <= l + (1 << k) - 1 ? { ok: span(b - 1, l + (1 << k) - 2) } : {}) }), { l: l - 1, r: r - 1 }, { base: 1 }),
        view(gt({ cmp: [[k, l - 1]], alt: [[k, b - 1]] })), vars({ k, answer: ans })])
    }
    t.out(out.join('\n'))
  },
}

const dsu: Lesson = {
  id: 'dsu', title: ['Disjoint set union', '并查集'], level: 'S', cat: 'ds', diff: 6,
  blurb: ['Each set is a tree whose root names it. Union links two roots; find climbs to the root and flattens the path behind it.', '每个集合是一棵树，根就是集合的代表。合并是把两个根连起来；查找是爬到根，并顺手把路径压扁。'],
  ideas: [
    ['fa[x] is the parent of x; a root is its own parent.', 'fa[x] 是 x 的父亲；根的父亲是它自己。'],
    ['find(x): follow parents to the root. Two elements are in the same set exactly when their roots are equal.', 'find(x)：沿父亲一路走到根。两个元素在同一集合，当且仅当它们的根相同。'],
    ['union(x, y): make one root the child of the other.', 'union(x, y)：让一个根成为另一个根的孩子。'],
    ['Path compression: after finding the root, point every node on the path straight at it. Later finds are nearly O(1).', '路径压缩：找到根之后，把路径上的每个结点直接指向根。之后的查找几乎是 O(1)。'],
  ],
  time: 'O(α(n)) amortised per operation', space: 'O(n)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, m, fa[1000005];

int find(int x) {
    return fa[x] == x ? x : fa[x] = find(fa[x]);  //@find
}

int main() {
    scanf("%d%d", &n, &m);
    for (int i = 1; i <= n; i++) fa[i] = i;  //@init
    while (m--) {
        int op, x, y; scanf("%d%d%d", &op, &x, &y);
        if (op == 1) fa[find(x)] = find(y);  //@union
        else puts(find(x) == find(y) ? "Y" : "N");  //@query
    }
}`,
  notes: [
    ['find', ['The assignment inside the return is the whole of path compression.', 'return 里的这个赋值就是路径压缩的全部。']],
    ['init', ['At first every element is alone in its own set.', '一开始每个元素独自构成一个集合。']],
    ['union', ['Link root to root — never x to y directly, or the trees break apart.', '必须把根连到根——不能直接连 x 和 y，否则会把树拆散。']],
  ],
  input: ['n m, then m lines "op x y": op 1 merges the sets of x and y, op 2 asks whether they are in the same set (Y / N).', 'n m，随后 m 行 “op x y”：op 为 1 时合并 x 和 y 所在的集合，为 2 时询问它们是否在同一集合（Y / N）。'],
  sizes: [6, 8, 10], lab: [10, 1000, 100000, 500000],
  gen(n, r) {
    const m = n <= 30 ? n : n
    let s = `${n} ${m}\n`
    for (let i = 0; i < m; i++) s += `${r.next() < 0.65 ? 1 : 2} ${r.int(1, n)} ${r.int(1, n)}\n`
    return s
  },
  run(inp, t) {
    const rd = reader(inp), n = rd.int(), m = rd.int(), fa = span(0, n), out: string[] = []
    const view = (tone: Tones) => {
      const par = fa.map((p, i) => (i === 0 ? -2 : p === i ? -1 : p)), es: GEdge[] = []
      for (let i = 1; i <= n; i++) if (fa[i] !== i) es.push({ u: fa[i], v: i })
      return [graph(layoutForest(par), es, { base: 0, tone }), arr('fa', fa, { ...tone, 0: 'dim' })] as const
    }
    const find = (x: number) => {
      const path = [x]
      while (fa[path[path.length - 1]] !== path[path.length - 1]) path.push(fa[path[path.length - 1]])
      const root = path[path.length - 1]
      for (const v of path) fa[v] = root
      t.s('find', () => [path.length > 2 ? [`find(${x}): climb ${path.join(' → ')}, then point them all at root ${root}.`, `find(${x})：沿 ${path.join(' → ')} 向上，再把它们都直接指向根 ${root}。`] : [`find(${x}): the root is ${root}.`, `find(${x})：根是 ${root}。`], ...view(tn({ vis: path, act: x, ok: root }))])
      return root
    }
    t.s('init', () => [[`${n} elements, each its own set.`, `${n} 个元素，各自为一个集合。`], ...view({})])
    for (let i = 0; i < m; i++) {
      const op = rd.int(), x = rd.int(), y = rd.int()
      need((op === 1 || op === 2) && x >= 1 && x <= n && y >= 1 && y <= n, `Operation ${i + 1} is invalid.`, `第 ${i + 1} 个操作不合法。`)
      const a = find(x), b = find(y)
      if (op === 1) {
        fa[a] = b
        t.s('union', () => [a === b ? [`union(${x}, ${y}): both already have root ${a}.`, `union(${x}, ${y})：两者的根都是 ${a}，已在同一集合。`] : [`union(${x}, ${y}): hang root ${a} under root ${b}.`, `union(${x}, ${y})：把根 ${a} 挂到根 ${b} 下面。`], ...view(tn({ act: a, ok: b }))])
      } else {
        out.push(a === b ? 'Y' : 'N')
        t.s('query', () => [[`Same set? Roots ${a} and ${b}: ${a === b ? 'Y' : 'N'}.`, `是否同一集合？根分别是 ${a} 和 ${b}：${a === b ? 'Y' : 'N'}。`], ...view(tn({ cmp: [x, y], [a === b ? 'ok' : 'bad']: [a, b] }))])
      }
    }
    t.out(out.join('\n'))
  },
}

const genRange = (point: boolean) => (n: number, r: Rng) => {
  const q = n <= 30 ? 4 : n
  let s = `${n} ${q}\n${r.ints(n, 1, 9).join(' ')}\n`
  for (let i = 0; i < q; i++) {
    const l = r.int(1, n), h = r.int(l, n)
    s += i % 2 === 0 ? (point ? `1 ${l} ${r.int(1, 9)}\n` : `1 ${l} ${h} ${r.int(1, 5)}\n`) : `2 ${l} ${h}\n`
  }
  return s
}

const fenwick: Lesson = {
  id: 'fenwick', title: ['Fenwick tree (BIT)', '树状数组'], level: 'S', cat: 'ds', diff: 6,
  blurb: ['c[i] stores the sum of the lowbit(i) elements ending at i, so point updates and prefix sums both take O(log n).', 'c[i] 保存以 i 结尾的 lowbit(i) 个元素之和，于是单点修改和前缀查询都只需 O(log n)。'],
  ideas: [
    ['lowbit(i) = i & −i is the lowest set bit of i, e.g. lowbit(12 = 1100₂) = 4.', 'lowbit(i) = i & −i 是 i 最低位的 1 所代表的值，例如 lowbit(12 = 1100₂) = 4。'],
    ['c[i] covers the range (i − lowbit(i), i].', 'c[i] 管辖区间 (i − lowbit(i), i]。'],
    ['Prefix sum of i: add c[i], then jump to i − lowbit(i) — peeling off one bit at a time.', '求 i 的前缀和：加上 c[i]，再跳到 i − lowbit(i)——每次剥掉一个二进制位。'],
    ['Update position i: every c that covers i is reached by jumping to i + lowbit(i).', '修改位置 i：所有管辖 i 的 c 都可以通过不断跳到 i + lowbit(i) 找到。'],
    ['Range sum = prefix(r) − prefix(l − 1). Far shorter than a segment tree when that is all you need.', '区间和 = prefix(r) − prefix(l − 1)。只需要这些功能时，代码比线段树短得多。'],
  ],
  time: 'O(log n) per operation', space: 'O(n)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, q;
long long c[1000005];

void add(int i, long long v) {
    for (; i <= n; i += i & -i) c[i] += v;  //@add
}

long long sum(int i) {
    long long s = 0;
    for (; i > 0; i -= i & -i) s += c[i];  //@sum
    return s;
}

int main() {
    scanf("%d%d", &n, &q);
    for (int i = 1; i <= n; i++) {
        int x; scanf("%d", &x);
        add(i, x);
    }
    while (q--) {
        int op, x, y; scanf("%d%d%d", &op, &x, &y);
        if (op == 1) add(x, y);
        else printf("%lld\n", sum(y) - sum(x - 1));  //@ans
    }
}`,
  notes: [
    ['add', ['i += lowbit(i) moves to the next, larger block that contains position i.', 'i += lowbit(i) 跳到下一个包含位置 i 的更大的块。']],
    ['sum', ['i −= lowbit(i) moves to the block that ends right before the current one starts.', 'i −= lowbit(i) 跳到恰好在当前块之前结束的那个块。']],
    ['ans', ['Two prefix sums give any range sum.', '两个前缀和相减得到任意区间和。']],
  ],
  input: ['n q, the n numbers, then q lines: "1 i v" adds v to a[i]; "2 l r" prints the sum of a[l..r].', 'n q，n 个数，随后 q 行：“1 i v” 给 a[i] 加 v；“2 l r” 输出 a[l..r] 的和。'],
  sizes: [6, 8, 12], lab: [10, 1000, 100000, 300000],
  gen: genRange(true),
  run(inp, t) {
    const rd = reader(inp), n = rd.int(), q = rd.int(), a = new Array<number>(n + 1).fill(0), c = new Array<number>(n + 1).fill(0), out: number[] = []
    const bin = (i: number) => i.toString(2).padStart(n.toString(2).length, '0')
    const cover = (i: number) => span(i - (i & -i) + 1, i)
    const add = (i: number, v: number) => {
      a[i] += v
      for (const i0 = i; i <= n; i += i & -i) {
        c[i] += v
        const k = i
        t.s('add', () => [[`add(${i0}, ${v}): c[${k}] covers (${k - (k & -k)}, ${k}] → c[${k}] = ${c[k]}. Next: ${k} + lowbit ${k & -k} = ${k + (k & -k)}.`, `add(${i0}, ${v})：c[${k}] 管辖 (${k - (k & -k)}, ${k}] → c[${k}] = ${c[k]}。下一个：${k} + lowbit ${k & -k} = ${k + (k & -k)}。`],
          arr('a', a, tn({ dim: 0, vis: cover(k), act: i0 })), arr('c', c, tn({ dim: 0, act: k })), vars({ i: `${k} = ${bin(k)}₂`, lowbit: k & -k })])
      }
    }
    const sum = (i: number) => {
      let s = 0
      const used: number[] = [], i0 = i
      for (; i > 0; i -= i & -i) {
        s += c[i]; used.push(i)
        const k = i, ss = s
        t.s('sum', () => [[`sum(${i0}): take c[${k}] = ${c[k]} for (${k - (k & -k)}, ${k}]; running total ${ss}. Next: ${k} − lowbit ${k & -k} = ${k - (k & -k)}.`, `sum(${i0})：取 c[${k}] = ${c[k]}，对应 (${k - (k & -k)}, ${k}]；累计 ${ss}。下一个：${k} − lowbit ${k & -k} = ${k - (k & -k)}。`],
          arr('a', a, tn({ dim: 0, ok: span(k + 1, i0), vis: cover(k) })), arr('c', c, tn({ dim: 0, ok: used, act: k })), vars({ i: `${k} = ${bin(k)}₂`, lowbit: k & -k, s: ss })])
      }
      return s
    }
    for (let i = 1; i <= n; i++) add(i, rd.int())
    for (let k = 0; k < q; k++) {
      const op = rd.int(), x = rd.int(), y = rd.int()
      if (op === 1) { need(x >= 1 && x <= n, 'Index out of range.', '下标越界。'); add(x, y) } else {
        need(op === 2 && 1 <= x && x <= y && y <= n, `Operation ${k + 1} is invalid.`, `第 ${k + 1} 个操作不合法。`)
        const ans = sum(y) - sum(x - 1)
        out.push(ans)
        t.s('ans', () => [[`sum(${x}..${y}) = sum(${y}) − sum(${x - 1}) = ${ans}.`, `sum(${x}..${y}) = sum(${y}) − sum(${x - 1}) = ${ans}。`], arr('a', a, tn({ dim: 0, ok: span(x, y) })), arr('c', c, tn({ dim: 0 })), vars({ answer: ans })])
      }
    }
    t.out(out.join('\n'))
  },
}

const segtree: Lesson = {
  id: 'segment-tree', title: ['Segment tree with lazy tags', '线段树（懒标记）'], level: 'S', cat: 'ds', diff: 6,
  blurb: ['Each node stores the sum of an interval. Range updates stop at fully covered nodes and leave a tag to be pushed down later.', '每个结点保存一个区间的和。区间修改在被完全覆盖的结点处停下，留下标记，以后需要时再下传。'],
  ideas: [
    ['Node p covers [l, r]; its children 2p and 2p + 1 cover the two halves.', '结点 p 管辖 [l, r]；孩子 2p 和 2p + 1 各管辖一半。'],
    ['Any range breaks into O(log n) nodes that are fully inside it.', '任意区间都能拆成 O(log n) 个被它完全包含的结点。'],
    ['Lazy tag: when an update covers a node entirely, update its sum, record "add v to everything below" and stop.', '懒标记：当修改完全覆盖某个结点时，更新它的和，记下“下面全部加 v”，然后停止。'],
    ['Push the tag down to the children only when an operation needs to go below that node.', '只有当某次操作需要进入该结点下方时，才把标记下传给孩子。'],
    ['After returning from the children, recompute the node from them (push-up).', '从孩子返回后，用孩子重新计算本结点（上传）。'],
  ],
  time: 'O(log n) per operation', space: 'O(4n)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, q;
long long sum[800005], tag[800005];

void up(int p) { sum[p] = sum[2 * p] + sum[2 * p + 1]; }

void apply(int p, int l, int r, long long v) {
    sum[p] += v * (r - l + 1);
    tag[p] += v;
}

void down(int p, int l, int r) {
    if (!tag[p]) return;
    int mid = (l + r) / 2;
    apply(2 * p, l, mid, tag[p]);  //@down
    apply(2 * p + 1, mid + 1, r, tag[p]);
    tag[p] = 0;
}

void build(int p, int l, int r) {
    if (l == r) { scanf("%lld", &sum[p]); return; }
    int mid = (l + r) / 2;
    build(2 * p, l, mid); build(2 * p + 1, mid + 1, r);
    up(p);  //@build
}

void update(int p, int l, int r, int x, int y, long long v) {
    if (x <= l && r <= y) { apply(p, l, r, v); return; }  //@cover
    down(p, l, r);
    int mid = (l + r) / 2;
    if (x <= mid) update(2 * p, l, mid, x, y, v);
    if (y > mid) update(2 * p + 1, mid + 1, r, x, y, v);
    up(p);  //@up
}

long long query(int p, int l, int r, int x, int y) {
    if (x <= l && r <= y) return sum[p];  //@hit
    down(p, l, r);
    int mid = (l + r) / 2;
    long long s = 0;
    if (x <= mid) s += query(2 * p, l, mid, x, y);
    if (y > mid) s += query(2 * p + 1, mid + 1, r, x, y);
    return s;
}

int main() {
    scanf("%d%d", &n, &q);
    build(1, 1, n);
    while (q--) {
        int op, x, y; scanf("%d%d%d", &op, &x, &y);
        if (op == 1) { long long v; scanf("%lld", &v); update(1, 1, n, x, y, v); }
        else printf("%lld\n", query(1, 1, n, x, y));  //@ans
    }
}`,
  notes: [
    ['down', ['A tag means: my own sum is already correct, my children are not yet.', '标记的含义：我自己的和已经是对的，但孩子们还没更新。']],
    ['cover', ['Fully covered: every one of the r − l + 1 elements gains v. No need to go deeper.', '完全覆盖：r − l + 1 个元素每个都加 v，不必再往下走。']],
    ['up', ['Children changed, so the parent is recomputed on the way back.', '孩子变了，返回时要重新计算父结点。']],
    ['hit', ['The stored sum is trustworthy because tags above it were pushed down on the way here.', '这里的和是可信的，因为上方的标记在走到这里的路上已经下传。']],
  ],
  input: ['n q, the n numbers, then q lines: "1 l r v" adds v to a[l..r]; "2 l r" prints the sum of a[l..r].', 'n q，n 个数，随后 q 行：“1 l r v” 给 a[l..r] 加 v；“2 l r” 输出 a[l..r] 的和。'],
  sizes: [4, 6, 8], lab: [10, 1000, 100000, 200000],
  gen: genRange(false),
  run(inp, t) {
    const rd = reader(inp), n = rd.int(), q = rd.int(), sum = new Array<number>(4 * n).fill(0), tag = new Array<number>(4 * n).fill(0), out: number[] = []
    need(n >= 1, 'n must be at least 1.', 'n 至少为 1。')
    const L: number[] = [], R: number[] = [], es: GEdge[] = []
    const shape = (p: number, l: number, r: number) => { L[p] = l; R[p] = r; if (l < r) { const m = (l + r) >> 1; shape(2 * p, l, m); shape(2 * p + 1, m + 1, r); es.push({ u: p, v: 2 * p }, { u: p, v: 2 * p + 1 }) } }
    let pos: ReturnType<typeof layoutBin> = []
    if (t.on) { shape(1, 1, n); pos = layoutBin(1, i => (L[i] < R[i] ? 2 * i : -1), i => (L[i] < R[i] ? 2 * i + 1 : -1)) }
    const view = (tone: Tones) => graph(pos, es, { label: sum, tone, sub: pos.map((_, p) => (L[p] === undefined ? undefined : `${L[p] === R[p] ? L[p] : L[p] + '–' + R[p]}${tag[p] ? '  +' + tag[p] : ''}`)), name: 'node = sum; caption = range, + lazy tag' })
    const apply = (p: number, l: number, r: number, v: number) => { sum[p] += v * (r - l + 1); tag[p] += v }
    const down = (p: number, l: number, r: number) => {
      if (!tag[p]) return
      const m = (l + r) >> 1, v = tag[p]
      apply(2 * p, l, m, v); apply(2 * p + 1, m + 1, r, v); tag[p] = 0
      t.s('down', () => [[`Push the tag +${v} of [${l}, ${r}] down to both children.`, `把 [${l}, ${r}] 上的标记 +${v} 下传给两个孩子。`], view(tn({ cmp: p, act: [2 * p, 2 * p + 1] }))])
    }
    const build = (p: number, l: number, r: number) => {
      if (l === r) { sum[p] = rd.int(); return }
      const m = (l + r) >> 1
      build(2 * p, l, m); build(2 * p + 1, m + 1, r)
      sum[p] = sum[2 * p] + sum[2 * p + 1]
      t.s('build', () => [[`Build [${l}, ${r}]: ${sum[2 * p]} + ${sum[2 * p + 1]} = ${sum[p]}.`, `建树 [${l}, ${r}]：${sum[2 * p]} + ${sum[2 * p + 1]} = ${sum[p]}。`], view(tn({ act: p, cmp: [2 * p, 2 * p + 1] }))])
    }
    const update = (p: number, l: number, r: number, x: number, y: number, v: number) => {
      if (x <= l && r <= y) { apply(p, l, r, v); t.s('cover', () => [[`[${l}, ${r}] lies inside [${x}, ${y}]: sum += ${v} × ${r - l + 1}, leave tag +${v}.`, `[${l}, ${r}] 完全在 [${x}, ${y}] 内：sum += ${v} × ${r - l + 1}，留下标记 +${v}。`], view(tn({ ok: p }))]); return }
      down(p, l, r)
      const m = (l + r) >> 1
      if (x <= m) update(2 * p, l, m, x, y, v)
      if (y > m) update(2 * p + 1, m + 1, r, x, y, v)
      sum[p] = sum[2 * p] + sum[2 * p + 1]
      t.s('up', () => [[`Back at [${l}, ${r}]: recompute ${sum[2 * p]} + ${sum[2 * p + 1]} = ${sum[p]}.`, `回到 [${l}, ${r}]：重新计算 ${sum[2 * p]} + ${sum[2 * p + 1]} = ${sum[p]}。`], view(tn({ act: p, cmp: [2 * p, 2 * p + 1] }))])
    }
    const hits: number[] = []
    const query = (p: number, l: number, r: number, x: number, y: number): number => {
      if (x <= l && r <= y) { hits.push(p); t.s('hit', () => [[`[${l}, ${r}] lies inside [${x}, ${y}]: take its sum ${sum[p]}.`, `[${l}, ${r}] 完全在 [${x}, ${y}] 内：取它的和 ${sum[p]}。`], view(tn({ ok: hits }))]); return sum[p] }
      down(p, l, r)
      const m = (l + r) >> 1
      return (x <= m ? query(2 * p, l, m, x, y) : 0) + (y > m ? query(2 * p + 1, m + 1, r, x, y) : 0)
    }
    build(1, 1, n)
    for (let k = 0; k < q; k++) {
      const op = rd.int(), x = rd.int(), y = rd.int()
      need((op === 1 || op === 2) && 1 <= x && x <= y && y <= n, `Operation ${k + 1} is invalid.`, `第 ${k + 1} 个操作不合法。`)
      if (op === 1) update(1, 1, n, x, y, rd.int())
      else {
        hits.length = 0
        const ans = query(1, 1, n, x, y)
        out.push(ans)
        t.s('ans', () => [[`sum(${x}..${y}) = ${ans}, assembled from ${hits.length} node(s).`, `sum(${x}..${y}) = ${ans}，由 ${hits.length} 个结点拼成。`], view(tn({ ok: hits })), vars({ answer: ans })])
      }
    }
    t.out(out.join('\n'))
  },
}

const trie: Lesson = {
  id: 'trie', title: ['Trie', '字典树（Trie）'], level: 'S', cat: 'ds', diff: 6,
  blurb: ['A tree whose edges are letters: words that share a prefix share a path from the root.', '边上标着字母的树：拥有公共前缀的单词共用从根出发的一段路径。'],
  ideas: [
    ['Each node stands for a prefix; following edge c from a node appends the letter c.', '每个结点代表一个前缀；从某结点沿字母 c 的边走，就是在前缀后面接上 c。'],
    ['Insert: walk the word letter by letter, creating missing nodes.', '插入：逐个字母往下走，缺少的结点就新建。'],
    ['Keep a counter on each node: how many words pass through it = how many words have this prefix.', '每个结点上维护一个计数：经过它的单词数 = 以该前缀开头的单词数。'],
    ['Lookup costs the length of the query, independent of how many words are stored.', '查询代价只与查询串长度有关，与已存入多少单词无关。'],
  ],
  time: 'O(total length)', space: 'O(total length × 26)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, q, ch[1000005][26], cnt[1000005], tot;
char s[1000005];

int main() {
    scanf("%d%d", &n, &q);
    while (n--) {
        scanf("%s", s);
        int u = 0;
        for (int i = 0; s[i]; i++) {
            int c = s[i] - 'a';
            if (!ch[u][c]) ch[u][c] = ++tot;  //@new
            u = ch[u][c];
            cnt[u]++;  //@ins
        }
    }
    while (q--) {
        scanf("%s", s);
        int u = 0, ans = 0;
        for (int i = 0; s[i]; i++) {
            u = ch[u][s[i] - 'a'];  //@walk
            if (!u) break;  //@miss
        }
        if (u) ans = cnt[u];
        printf("%d\n", ans);  //@ans
    }
}`,
  notes: [
    ['new', ['Node 0 is the root (the empty prefix); 0 in ch also means "no edge", which is safe because nothing points back to the root.', '0 号结点是根（空前缀）；ch 中的 0 同时表示“没有这条边”，因为没有边会指回根，所以不冲突。']],
    ['ins', ['cnt[u] counts the words whose path passes through u.', 'cnt[u] 统计路径经过 u 的单词数。']],
    ['miss', ['Falling off the trie means no stored word has this prefix.', '走出字典树说明没有任何单词以它为前缀。']],
  ],
  input: ['n q, then n lowercase words, then q lowercase queries. For each query prints how many words start with it.', 'n q，随后 n 个小写单词，再是 q 个小写查询串。对每个查询输出有多少个单词以它开头。'],
  sizes: [4, 6, 8], lab: [10, 1000, 20000, 50000],
  gen(n, r) {
    const big = n > 30, word = () => Array.from({ length: big ? r.int(1, 8) : r.int(2, 4) }, () => r.pick(big ? [...'abcdef'] : [...'abc'])).join('')
    const q = big ? n : 3, ws = Array.from({ length: n }, word)
    return `${n} ${q}\n${ws.join('\n')}\n${Array.from({ length: q }, () => { const w = r.next() < 0.75 ? r.pick(ws) : word(); return w.slice(0, r.int(1, w.length)) }).join('\n')}\n`
  },
  run(inp, t) {
    const rd = reader(inp), n = rd.int(), q = rd.int(), words = Array.from({ length: n }, rd.str)
    for (const w of words) need(/^[a-z]+$/.test(w), 'Words must be lowercase letters.', '单词只能由小写字母组成。')
    const cap = words.reduce((s, w) => s + w.length, 1), ch = new Int32Array(cap * 26), cnt = new Int32Array(cap), par = [-1], letter = ['·'], es: GEdge[] = [], out: number[] = []
    let tot = 0
    const view = (tone: Tones) => graph(layoutForest(par), es, { label: letter, tone, sub: par.map((_, i) => (i ? cnt[i] : undefined)), name: 'caption = number of words through the node' })
    for (const w of words) {
      let u = 0
      const path = [0]
      for (let i = 0; i < w.length; i++) {
        const c = w.charCodeAt(i) - 97, fresh = !ch[u * 26 + c]
        if (fresh) { ch[u * 26 + c] = ++tot; par.push(u); letter.push(w[i]); es.push({ u, v: tot }) }
        u = ch[u * 26 + c]; cnt[u]++; path.push(u)
        const cur = u
        t.s(fresh ? 'new' : 'ins', () => [[`Insert "${w}": ${fresh ? 'create' : 'follow'} edge '${w[i]}'.`, `插入 "${w}"：${fresh ? '新建' : '沿用'}字母 '${w[i]}' 的边。`], view(tn({ vis: path, [fresh ? 'ok' : 'act']: cur })), arr('word', w.split(''), tn({ act: i }))])
      }
    }
    for (let k = 0; k < q; k++) {
      const s = rd.str()
      let u = 0, ok = true
      const path = [0]
      for (let i = 0; i < s.length; i++) {
        const c = s.charCodeAt(i) - 97
        need(c >= 0 && c < 26, 'Queries must be lowercase letters.', '查询串只能由小写字母组成。')
        const nx = ch[u * 26 + c]
        if (!nx) { ok = false; t.s('miss', () => [[`Query "${s}": no edge '${s[i]}' here — no word has this prefix.`, `查询 "${s}"：这里没有 '${s[i]}' 的边——没有单词以它为前缀。`], view(tn({ vis: path, bad: path[path.length - 1] })), arr('query', s.split(''), tn({ bad: i }))]); break }
        u = nx; path.push(u)
        t.s('walk', () => [[`Query "${s}": follow '${s[i]}'.`, `查询 "${s}"：沿 '${s[i]}' 往下走。`], view(tn({ vis: path, act: nx })), arr('query', s.split(''), tn({ act: i }))])
      }
      const ans = ok ? cnt[u] : 0
      out.push(ans)
      t.s('ans', () => [[`${ans} word(s) start with "${s}".`, `有 ${ans} 个单词以 "${s}" 开头。`], view(ok ? tn({ vis: path, ok: u }) : {}), vars({ answer: ans })])
    }
    t.out(out.join('\n'))
  },
}

const treap: Lesson = {
  id: 'treap', title: ['Balanced tree: Treap', '平衡树：Treap'], level: 'S', cat: 'ds', diff: 8,
  blurb: ['A binary search tree on keys that is also a heap on random priorities — rotations keep it balanced without thinking.', '键值满足二叉搜索树性质、随机优先级满足堆性质的树——靠旋转自动保持平衡。'],
  ideas: [
    ['A plain BST degenerates into a chain when keys arrive in sorted order.', '普通二叉搜索树在键值按顺序到达时会退化成一条链。'],
    ['Give every node a random priority and demand: parent priority ≥ child priority.', '给每个结点一个随机优先级，并要求：父结点优先级 ≥ 子结点优先级。'],
    ['Insert as in a BST, then rotate the new node upward while it beats its parent.', '先按 BST 的方式插入，再在新结点优先级高于父亲时把它旋转上去。'],
    ['A rotation swaps a parent and child while preserving the in-order sequence — the BST property survives.', '旋转交换父子关系，但保持中序序列不变——BST 性质不受影响。'],
    ['The shape is the same as if keys had been inserted in priority order, i.e. in random order: expected height O(log n).', '最终形态等同于按优先级顺序（即随机顺序）插入：期望树高 O(log n)。'],
  ],
  time: 'O(log n) expected per insert', space: 'O(n)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, root, cnt, key[1000005], pri[1000005], lc[1000005], rc[1000005];

void rotR(int &u) { int v = lc[u]; lc[u] = rc[v]; rc[v] = u; u = v; }

void rotL(int &u) { int v = rc[u]; rc[u] = lc[v]; lc[v] = u; u = v; }

void insert(int &u, int x) {
    if (!u) { u = ++cnt; key[u] = x; pri[u] = rand(); return; }  //@new
    if (x == key[u]) return;
    if (x < key[u]) {
        insert(lc[u], x);  //@down
        if (pri[lc[u]] > pri[u]) rotR(u);  //@rotR
    } else {
        insert(rc[u], x);
        if (pri[rc[u]] > pri[u]) rotL(u);  //@rotL
    }
}

void inorder(int u) {
    if (!u) return;
    inorder(lc[u]); printf("%d ", key[u]); inorder(rc[u]);  //@visit
}

int main() {
    scanf("%d", &n);
    for (int i = 0; i < n; i++) { int x; scanf("%d", &x); insert(root, x); }
    inorder(root);
}`,
  notes: [
    ['new', ['The priority is drawn once and never changes.', '优先级只在创建时随机一次，之后不再改变。']],
    ['rotR', ['Right rotation: the left child rises, u becomes its right child, and the child\'s old right subtree moves under u.', '右旋：左孩子上升，u 成为它的右孩子，左孩子原来的右子树改挂到 u 下面。']],
    ['rotL', ['The mirror image for a right child.', '右孩子的情况完全对称。']],
    ['visit', ['Rotations never change the in-order sequence, so the keys still come out sorted.', '旋转不改变中序序列，所以键值仍按升序输出。']],
  ],
  input: ['n, then n integers to insert in order. Prints the distinct keys in ascending order.', 'n，随后按顺序插入的 n 个整数。按升序输出互不相同的键值。'],
  sizes: [5, 7, 10], lab: [10, 1000, 100000, 300000],
  gen: (n, r) => `${n}\n${span(1, n).map(i => i * 2 + (n > 30 ? 0 : r.int(0, 1))).join(' ')}\n`,
  run(inp, t) {
    const rd = reader(inp), n = rd.int(), xs = rd.ints(n), key = [0], pri = [-1], lc = [0], rc = [0]
    let root = 0, seed = 12345
    // Two-digit priorities read well in the animation; large inputs need the full range to avoid ties.
    const rand = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) % (t.on ? 100 : 0x7fffffff)
    const view = (tone: Tones) => (root ? binView([root], lc, rc, key, { tone, sub: pri, name: 'node = key; caption = priority' }) : null)
    // link(p, left, v): make v the left/right child of p (p = 0 means v is the root).
    const link = (p: number, left: boolean, v: number) => { if (!p) root = v; else if (left) lc[p] = v; else rc[p] = v }
    const ins = (u: number, x: number, p: number, left: boolean): void => {
      if (!u) {
        key.push(x); pri.push(rand()); lc.push(0); rc.push(0)
        const me = key.length - 1
        link(p, left, me)
        t.s('new', () => [[`Insert ${x} as a leaf with random priority ${pri[me]}.`, `把 ${x} 作为叶子插入，随机优先级为 ${pri[me]}。`], view(tn({ ok: me }))])
        return
      }
      if (x === key[u]) return
      const goLeft = x < key[u]
      t.s('down', () => [[`${x} ${goLeft ? '<' : '>'} ${key[u]}: go ${goLeft ? 'left' : 'right'}.`, `${x} ${goLeft ? '<' : '>'} ${key[u]}：往${goLeft ? '左' : '右'}走。`], view(tn({ act: u }))])
      ins(goLeft ? lc[u] : rc[u], x, u, goLeft)
      const v = goLeft ? lc[u] : rc[u]
      if (pri[v] <= pri[u]) return
      if (goLeft) { lc[u] = rc[v]; rc[v] = u } else { rc[u] = lc[v]; lc[v] = u }
      link(p, left, v)
      t.s(goLeft ? 'rotR' : 'rotL', () => [[`Priority ${pri[v]} of ${key[v]} beats ${pri[u]} of ${key[u]}: rotate ${goLeft ? 'right' : 'left'}, ${key[v]} moves up.`, `${key[v]} 的优先级 ${pri[v]} 大于 ${key[u]} 的 ${pri[u]}：${goLeft ? '右' : '左'}旋，${key[v]} 上升。`], view(tn({ ok: v, cmp: u }))])
    }
    for (const x of xs) ins(root, x, 0, true)
    const out: number[] = [], st: number[] = []
    for (let u = root; u || st.length;) { while (u) { st.push(u); u = lc[u] } u = st.pop()!; out.push(key[u]); u = rc[u] }
    t.s('visit', () => [[`In-order traversal gives the keys in sorted order: ${out.slice(0, 12).join(' ')}${out.length > 12 ? ' …' : ''}`, `中序遍历按升序给出所有键值：${out.slice(0, 12).join(' ')}${out.length > 12 ? ' …' : ''}`], view(tn({ ok: span(1, key.length - 1) }))])
    t.out(out.join(' '))
  },
}

const sqrtDec: Lesson = {
  id: 'sqrt-decomposition', title: ['Square-root decomposition', '分块'], level: 'N', cat: 'ds', diff: 8,
  blurb: ['Cut the array into blocks of about √n: handle whole blocks with one number, and the ragged ends element by element.', '把数组切成大小约 √n 的块：整块用一个数处理，两端零散的部分逐个处理。'],
  ideas: [
    ['Per block keep its sum and an "add to everyone" tag.', '每块维护块内和，以及一个“整块都加”的标记。'],
    ['A range [l, r] is: a partial block on the left, some whole blocks, a partial block on the right.', '区间 [l, r] 由三部分组成：左边不完整的块、中间若干整块、右边不完整的块。'],
    ['Whole blocks: touch only the tag — O(1) each, at most √n of them.', '整块：只动标记——每块 O(1)，最多 √n 块。'],
    ['Partial blocks: touch elements one by one — at most 2√n of them.', '零散部分：逐个元素处理——最多 2√n 个。'],
    ['Balancing the two costs gives block size √n. Slower than a segment tree, but it copes with operations that do not combine neatly.', '让两部分代价平衡，得到块长 √n。它比线段树慢，但能处理那些不易合并的操作。'],
  ],
  time: 'O(√n) per operation', space: 'O(n)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, q, B, bl[100005];
long long a[100005], sum[505], tag[505];

void update(int l, int r, long long v) {
    for (int i = l; i <= r && bl[i] == bl[l]; i++) a[i] += v, sum[bl[i]] += v;  //@part
    if (bl[l] == bl[r]) return;
    for (int i = r; bl[i] == bl[r]; i--) a[i] += v, sum[bl[i]] += v;
    for (int b = bl[l] + 1; b < bl[r]; b++) tag[b] += v;  //@whole
}

long long query(int l, int r) {
    long long s = 0;
    for (int i = l; i <= r && bl[i] == bl[l]; i++) s += a[i] + tag[bl[i]];  //@qpart
    if (bl[l] == bl[r]) return s;
    for (int i = r; bl[i] == bl[r]; i--) s += a[i] + tag[bl[i]];
    for (int b = bl[l] + 1; b < bl[r]; b++) s += sum[b] + tag[b] * B;  //@qwhole
    return s;
}

int main() {
    scanf("%d%d", &n, &q);
    B = max(1, (int)sqrt(n));
    for (int i = 0; i < n; i++) {
        scanf("%lld", &a[i]);
        bl[i] = i / B; sum[bl[i]] += a[i];  //@init
    }
    while (q--) {
        int op, l, r; scanf("%d%d%d", &op, &l, &r); l--; r--;
        if (op == 1) { long long v; scanf("%lld", &v); update(l, r, v); }
        else printf("%lld\n", query(l, r));  //@ans
    }
}`,
  notes: [
    ['part', ['Ragged end: change the elements themselves and keep the block sum in step.', '零散部分：直接修改元素本身，同时同步更新块内和。']],
    ['whole', ['A whole block is updated by a single addition to its tag.', '整块只需给标记加一次。']],
    ['qwhole', ['Middle blocks are full blocks, so the tag contributes tag × B.', '中间的块都是完整的，所以标记贡献 tag × B。']],
    ['init', ['bl[i] = i / B is the block of position i (0-based).', 'bl[i] = i / B 是位置 i 所在的块（下标从 0 开始）。']],
  ],
  input: ['n q, the n numbers, then q lines: "1 l r v" adds v to a[l..r]; "2 l r" prints the sum of a[l..r].', 'n q，n 个数，随后 q 行：“1 l r v” 给 a[l..r] 加 v；“2 l r” 输出 a[l..r] 的和。'],
  sizes: [9, 12, 16], lab: [10, 100, 1000, 10000, 40000],
  gen: genRange(false),
  run(inp, t) {
    const rd = reader(inp), n = rd.int(), q = rd.int(), a = rd.ints(n), B = Math.max(1, Math.floor(Math.sqrt(n))), nb = Math.floor((n - 1) / B) + 1
    const bl = (i: number) => Math.floor(i / B), sum = new Array<number>(nb).fill(0), tag = new Array<number>(nb).fill(0), out: number[] = []
    a.forEach((x, i) => { sum[bl(i)] += x })
    const blockTone = (hi: Tones = {}) => { const tone: Tones = {}; for (let i = 0; i < n; i++) if (bl(i) % 2) tone[i] = 'vis'; return { ...tone, ...hi } }
    const view = (hi: Tones, bhi: Tones = {}) => [arr(`a (blocks of ${B})`, a, blockTone(hi)), arr('sum per block', sum, bhi), arr('tag per block', tag, bhi)] as const
    t.s('init', () => [[`n = ${n}: block size B = ${B}, ${nb} block(s).`, `n = ${n}：块长 B = ${B}，共 ${nb} 块。`], ...view({})])
    const ends = (l: number, r: number) => { const idx: number[] = []; for (let i = l; i <= r && bl(i) === bl(l); i++) idx.push(i); if (bl(l) !== bl(r)) for (let i = r; bl(i) === bl(r); i--) idx.push(i); return idx }
    for (let k = 0; k < q; k++) {
      const op = rd.int(), l = rd.int() - 1, r = rd.int() - 1
      need((op === 1 || op === 2) && 0 <= l && l <= r && r < n, `Operation ${k + 1} is invalid.`, `第 ${k + 1} 个操作不合法。`)
      const part = ends(l, r), mid = span(bl(l) + 1, bl(r) - 1)
      if (op === 1) {
        const v = rd.int()
        for (const i of part) { a[i] += v; sum[bl(i)] += v; t.s('part', () => [[`Add ${v} to [${l + 1}, ${r + 1}] — ragged end: a[${i + 1}] += ${v}.`, `区间 [${l + 1}, ${r + 1}] 加 ${v}——零散部分：a[${i + 1}] += ${v}。`], ...view(tn({ cmp: span(l, r), act: i }), tn({ act: bl(i) }))]) }
        for (const b of mid) { tag[b] += v; t.s('whole', () => [[`Block ${b} is fully covered: tag[${b}] += ${v}.`, `第 ${b} 块被完全覆盖：tag[${b}] += ${v}。`], ...view(tn({ cmp: span(l, r), ok: span(b * B, b * B + B - 1) }), tn({ ok: b }))]) }
      } else {
        let s = 0
        for (const i of part) { s += a[i] + tag[bl(i)]; const ss = s; t.s('qpart', () => [[`Sum [${l + 1}, ${r + 1}] — ragged end: a[${i + 1}] + tag = ${a[i] + tag[bl(i)]}; total ${ss}.`, `求和 [${l + 1}, ${r + 1}]——零散部分：a[${i + 1}] + 标记 = ${a[i] + tag[bl(i)]}；累计 ${ss}。`], ...view(tn({ cmp: span(l, r), act: i }), tn({ act: bl(i) })), vars({ s: ss })]) }
        for (const b of mid) { s += sum[b] + tag[b] * B; const ss = s; t.s('qwhole', () => [[`Whole block ${b}: sum ${sum[b]} + tag ${tag[b]} × ${B}; total ${ss}.`, `整块 ${b}：和 ${sum[b]} + 标记 ${tag[b]} × ${B}；累计 ${ss}。`], ...view(tn({ cmp: span(l, r), ok: span(b * B, b * B + B - 1) }), tn({ ok: b })), vars({ s: ss })]) }
        out.push(s)
        t.s('ans', () => [[`sum(${l + 1}..${r + 1}) = ${s}.`, `sum(${l + 1}..${r + 1}) = ${s}。`], ...view(tn({ ok: span(l, r) })), vars({ answer: s })])
      }
    }
    t.out(out.join('\n'))
  },
}

const leftist: Lesson = {
  id: 'leftist-heap', title: ['Leftist heap', '左偏树'], level: 'N', cat: 'ds', diff: 8,
  blurb: ['A heap that merges in O(log n): always merge down the short right spine, and swap children to keep it short.', '能在 O(log n) 内合并的堆：总是沿着很短的右链合并，并通过交换左右孩子保持右链短。'],
  ideas: [
    ['dist(u) = length of the shortest path from u down to a missing child. Leftist rule: dist(left) ≥ dist(right).', 'dist(u) = 从 u 向下走到空结点的最短路径长度。左偏性质：dist(左孩子) ≥ dist(右孩子)。'],
    ['So the right spine is the shortest way down — at most log₂(n + 1) nodes.', '因此右链就是向下最短的路——最多 log₂(n + 1) 个结点。'],
    ['merge(x, y): the smaller root wins; merge the other heap into its right child; then swap children if the rule broke.', 'merge(x, y)：根较小者胜出；把另一个堆合并进它的右子树；若破坏了左偏性质就交换左右孩子。'],
    ['Everything else is a merge: push = merge with a single node, pop = merge the two children of the root.', '其他操作都是合并：插入 = 与单结点合并，弹出 = 合并根的两个孩子。'],
  ],
  time: 'O(log n) per merge', space: 'O(n)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, val[1000005], lc[1000005], rc[1000005], dist[1000005];

int merge(int x, int y) {
    if (!x || !y) return x + y;  //@base
    if (val[x] > val[y]) swap(x, y);  //@root
    rc[x] = merge(rc[x], y);  //@rec
    if (dist[lc[x]] < dist[rc[x]]) swap(lc[x], rc[x]);  //@swap
    dist[x] = dist[rc[x]] + 1;  //@dist
    return x;
}

int main() {
    scanf("%d", &n);
    int root = 0;
    for (int i = 1; i <= n; i++) {
        scanf("%d", &val[i]);
        dist[i] = 1;
        root = merge(root, i);  //@push
    }
    while (root) {
        printf("%d ", val[root]);
        root = merge(lc[root], rc[root]);  //@pop
    }
}`,
  notes: [
    ['base', ['One side is empty: the answer is the other one (x + y works because one of them is 0).', '有一边为空：结果就是另一边（其中一个为 0，所以可以写成 x + y）。']],
    ['root', ['After the swap, x has the smaller root and stays on top.', '交换后 x 的根更小，留在上面。']],
    ['swap', ['dist[0] = 0, so a missing left child also triggers the swap.', 'dist[0] = 0，所以左孩子为空时也会触发交换。']],
    ['dist', ['The right child now has the smaller dist, by the leftist rule.', '根据左偏性质，此时右孩子的 dist 较小。']],
  ],
  input: ['n, then n integers. They are pushed one by one, then popped until empty (printing them in ascending order).', 'n，随后 n 个整数。逐个插入堆，再逐个弹出直到堆空（按升序输出）。'],
  sizes: [5, 7, 9], lab: [10, 1000, 100000, 300000],
  gen: (n, r) => `${n}\n${r.ints(n, 1, n <= 40 ? 50 : 1000000).join(' ')}\n`,
  run(inp, t) {
    const rd = reader(inp), n = rd.int(), val = [0, ...rd.ints(n)], lc = new Array<number>(n + 1).fill(0), rc = new Array<number>(n + 1).fill(0), dist = new Array<number>(n + 1).fill(0), out: number[] = []
    let alive: number[] = []
    const view = (tone: Tones) => {
      const child = new Set<number>()
      for (const u of alive) { if (lc[u]) child.add(lc[u]); if (rc[u]) child.add(rc[u]) }
      const roots = alive.filter(u => !child.has(u))
      return roots.length ? binView(roots, lc, rc, val, { tone, sub: dist, name: 'node = value; caption = dist' }) : null
    }
    const merge = (x: number, y: number): number => {
      if (!x || !y) { t.s('base', () => [[`One side is empty: return ${x + y ? 'the heap rooted at ' + val[x + y] : 'nothing'}.`, `有一边为空：返回${x + y ? '以 ' + val[x + y] + ' 为根的堆' : '空'}。`], view(x + y ? tn({ ok: x + y }) : {})]); return x + y }
      if (val[x] > val[y]) [x, y] = [y, x]
      t.s('root', () => [[`Merge heaps rooted at ${val[x]} and ${val[y]}: ${val[x]} is smaller and stays on top.`, `合并以 ${val[x]} 和 ${val[y]} 为根的堆：${val[x]} 更小，留在上面。`], view(tn({ ok: x, cmp: y }))])
      t.s('rec', () => [[`Merge ${val[y]} into the right subtree of ${val[x]}.`, `把 ${val[y]} 合并进 ${val[x]} 的右子树。`], view(tn({ ok: x, cmp: y, act: rc[x] || x }))])
      rc[x] = merge(rc[x], y)
      if (dist[lc[x]] < dist[rc[x]]) {
        [lc[x], rc[x]] = [rc[x], lc[x]]
        t.s('swap', () => [[`At ${val[x]}: dist(left) < dist(right) — swap the children.`, `在 ${val[x]} 处：dist(左) < dist(右)——交换左右孩子。`], view(tn({ act: x, cmp: [lc[x], rc[x]].filter(Boolean) }))])
      }
      dist[x] = dist[rc[x]] + 1
      t.s('dist', () => [[`dist(${val[x]}) = dist(right) + 1 = ${dist[x]}.`, `dist(${val[x]}) = dist(右孩子) + 1 = ${dist[x]}。`], view(tn({ ok: x }))])
      return x
    }
    let root = 0
    for (let i = 1; i <= n; i++) {
      dist[i] = 1; if (t.on) alive.push(i)
      t.s('push', () => [[`Push ${val[i]}: merge the heap with this single node.`, `插入 ${val[i]}：把堆与这个单结点合并。`], view(tn({ act: i }))])
      root = merge(root, i)
    }
    while (root) {
      const top = root
      out.push(val[top])
      if (t.on) alive = alive.filter(u => u !== top)
      t.s('pop', () => [[`Pop the minimum ${val[top]}: merge its two subtrees.`, `弹出最小值 ${val[top]}：合并它的两棵子树。`], view(tn({ act: [lc[top], rc[top]].filter(Boolean) })), arr('output', out, tn({ ok: out.length - 1 }))])
      root = merge(lc[top], rc[top])
    }
    t.out(out.join(' '))
  },
}

export default [stack, traversal, huffman, bst, monoQueue, sparse, dsu, fenwick, segtree, trie, treap, sqrtDec, leftist]
