import type { GEdge } from '../../engine/types'
import { arr, graph, grid, gt, layoutBin, layoutForest, span, tn } from '../../engine/h'
import type { Extras } from '../extras'
import { at, col, ed, heapTree, row } from '../story-util'

/** A binary tree from child maps (node → child), laid out by in-order rank. */
const bin = (n: number, lc: Record<number, number>, rc: Record<number, number>, root = 0) => {
  const edges: GEdge[] = []
  for (let u = 0; u < n; u++) for (const c of [lc[u], rc[u]]) if (c !== undefined) edges.push({ u, v: c })
  return { pos: layoutBin(root, i => lc[i] ?? -1, i => rc[i] ?? -1), edges }
}

/** A forest from parent[] (−1 = root), edges drawn child → parent when dir is set. */
const forest = (par: number[], dir = false) => ({
  pos: layoutForest(par),
  edges: par.flatMap((p, i): GEdge[] => (p < 0 ? [] : [dir ? { u: i, v: p, dir } : { u: p, v: i }])),
})

const TRAV = bin(6, { 0: 1, 1: 3 }, { 0: 2, 1: 4, 2: 5 })
const BST = bin(6, { 0: 1, 2: 3 }, { 0: 4, 1: 2, 2: 5 })
const TRIE = forest([-1, 0, 1, 2, 3, 0, 5, 6, 7])
const TRIE_LABEL = ['·', 'a', 'b', 'c', 'b', 'b', 'b', 'a', 'b']
const TRIE_CNT = ['', 3, 3, 2, 1, 1, 1, 1, 1]
const SEG = heapTree(7)
const SEG_LABEL = ['1–4', '1–2', '3–4', '1', '2', '3', '4']

export const DS: Record<string, Extras> = {
  stack: {
    story: [
      { kind: 'naive', title: ['Start simple: count the brackets', '先从最简单的做起：数括号'],
        body: ['Count the opening and closing brackets of each kind and compare. `( ]` is caught — but `( [ ) ]` passes, although its pairs **cross each other**. Counting knows how many brackets are open, not __which one__ has to be closed next.', '分别数出每种括号的左括号和右括号个数，再比较。`( ]` 能被查出来——但 `( [ ) ]` 却能通过，尽管它的两对括号**互相交叉**。计数只知道有多少括号还开着，却不知道接下来必须关闭的是__哪一个__。'],
        fig: () => [arr('one "(", one ")", one "[", one "]" — and still wrong', ['(', '[', ')', ']'], tn({ bad: [1, 2] }))] },
      { kind: 'insight', title: ['A closing bracket must close the most recent open one', '右括号必须关闭最近打开的那个括号'],
        body: ['Closing anything older would leave the newer bracket open __inside__ a pair that is already finished — a crossing. So only one opening bracket matters at any moment: ==the last one that is still open==. Last in, first out: that is a **stack**.', '如果关闭的是更早的括号，那个更晚打开的括号就会留在一对已经结束的括号__内部__——这就是交叉。所以任何时刻只有一个左括号是要紧的：==最后一个还没关闭的==。后进先出：这正是**栈**。'] },
      { kind: 'how', title: ['Push the openers, pop to check', '左括号入栈，遇到右括号出栈检查'],
        body: ['Read left to right. An opening bracket cannot be judged yet: __push__ it. A closing bracket __pops__ the top, and the two must be of the same kind. There are exactly ==three ways to fail==: a closing bracket when the stack is empty, a pair of different kinds, or brackets left on the stack at the end.', '从左往右读。左括号现在还无法判断：先__入栈__。遇到右括号就__弹出__栈顶，两者必须是同一种括号。失败的情况==恰好有三种==：遇到右括号时栈是空的；弹出的括号种类不同；读完之后栈里还有剩余。'],
        fig: () => [arr('s', ['{', '[', '(', ')', ']', '}'], tn({ vis: span(0, 2), act: 3 }), { i: 3 }), arr('stack (top on the right): ")" meets "(" — same kind, pop', ['{', '[', '('], tn({ cmp: 2 }), { top: 2 })] },
      { kind: 'result', title: ['One pass, and a pattern that keeps coming back', '扫一遍，而且这个模式会反复出现'],
        body: ['Each character is pushed or popped once: **O(n)**. "Remember unfinished things, resume the newest first" is everywhere: function calls, expression evaluation, undo, depth-first search — and the monotonic stack.', '每个字符只入栈或出栈一次：**O(n)**。“先记下没做完的事，回头先处理最新的那件”这个模式无处不在：函数调用、表达式求值、撤销操作、深度优先搜索——还有单调栈。'] },
    ],
    flow: [
      { id: 'next', kind: 'test', text: ['another character c ?', '还有字符 c ？'], no: 'done', on: [] },
      { id: 'open', kind: 'test', text: ['is c an opening bracket ?', 'c 是左括号？'], no: 'isempty', on: [] },
      { id: 'push', text: ['push c', 'c 入栈'], next: 'next' },
      { id: 'isempty', kind: 'test', text: ['is the stack empty ?', '栈是空的？'], yes: 'bad', no: 'pop', on: [] },
      { id: 'pop', kind: 'test', text: ['pop the top: same kind as c ?', '弹出栈顶：与 c 是同一种括号？'], yes: 'next', no: 'bad' },
      { id: 'bad', kind: 'end', text: ['print No', '输出 No'], on: ['empty', 'bad'] },
      { id: 'done', kind: 'end', text: ['print Yes if the stack is empty, otherwise No', '栈为空则输出 Yes，否则输出 No'] },
    ],
  },

  'bt-traversal': {
    story: [
      { kind: 'term', title: ['The words for trees', '关于树的几个词'],
        body: ['A **tree** is n nodes joined by n − 1 edges so that there is ==exactly one path== between any two of them. Choose one node as the **root** and every other node gets one **parent**, the next node on its path to the root; the nodes below it are its **children**. A node without children is a **leaf**. The **depth** of a node is the number of edges from the root to it, and the **height** of the tree is the largest depth. A node together with everything below it is a **subtree**. In a **binary tree** each node has at most two children, and they are told apart: a __left__ child and a __right__ child. To store a binary tree, keep two arrays, `l[u]` and `r[u]`, with 0 for "no child" — as this lesson does. A general tree stores a list of children for each node, or just the parent of each node.', '**树**由 n 个结点和 n − 1 条边组成，任意两个结点之间==恰好有一条路径==。选定一个结点作为**根**，其他每个结点就有了唯一的**父结点**——它通往根的路径上的下一个结点；它下面相邻的结点是它的**子结点**。没有子结点的结点叫**叶子**。结点的**深度**是从根到它经过的边数，树的**高度**是最大的深度。一个结点连同它下面的所有结点构成一棵**子树**。**二叉树**中每个结点至多有两个子结点，而且要区分__左__儿子和__右__儿子。存储二叉树时用两个数组 `l[u]` 和 `r[u]`，0 表示没有这个儿子——本课就是这样做的。一般的树则为每个结点保存一个子结点列表，或者只记录每个结点的父结点。'],
        fig: () => [graph(TRAV.pos, TRAV.edges, { name: 'root 1 · leaves 4, 5, 6 · height 2 · the subtree of 2 is {2, 4, 5}', tone: tn({ act: 0, ok: [3, 4, 5], cmp: 1 }), sub: ['depth 0', 'depth 1', 'depth 1', 'depth 2', 'depth 2', 'depth 2'] })] },
      { kind: 'naive', title: ['Start with the problem: a tree has no "next"', '先看问题所在：树没有“下一个”'],
        body: ['An array is visited from left to right — there is nothing to decide. A tree **branches**: after the root you can go left or right, and whichever you choose, you must come back later for the other side. What order is "the" order?', '数组从左到右访问就行，没什么可选的。树却会**分叉**：访问完根之后可以往左也可以往右，而无论选了哪边，之后都得回来处理另一边。那么“顺序”到底指什么？'],
        fig: () => [graph(TRAV.pos, TRAV.edges, { tone: tn({ act: 0, cmp: [1, 2] }) })] },
      { kind: 'insight', title: ['Follow the shape of the definition', '顺着定义的形状走'],
        body: ['A binary tree is a root plus a left subtree plus a right subtree — and ==each subtree is again a binary tree==. So traverse it the same way: handle the root, traverse the left subtree, traverse the right subtree, each by the same function. The empty tree is the base case.', '一棵二叉树就是一个根，加上左子树和右子树——而==每棵子树本身又是一棵二叉树==。所以遍历也照这个样子来：处理根，遍历左子树，遍历右子树，后两件事都交给同一个函数。空树就是递归的出口。'] },
      { kind: 'how', title: ['The only freedom: when to handle the root', '唯一可选的：什么时候处理根'],
        body: ['Left always comes before right. The root can be handled __before both__ (pre-order), __between them__ (in-order) or __after both__ (post-order). It is ==the same recursion with one line in a different place==.', '左子树总是先于右子树。根可以放在__两者之前__处理（先序）、__两者之间__处理（中序），或者__两者之后__处理（后序）。这是==同一个递归，只是有一行代码放的位置不同==。'],
        fig: () => [graph(TRAV.pos, TRAV.edges, { tone: tn({ act: 0 }) }), grid('where the root (1) appears', [[1, 2, 4, 5, 3, 6], [4, 2, 5, 1, 3, 6], [4, 5, 2, 6, 3, 1]], gt({ act: [[0, 0], [1, 3], [2, 5]] }), { rows: ['pre-order', 'in-order', 'post-order'] })] },
      { kind: 'result', title: ['Each order has its own use', '每种顺序各有用处'],
        body: ['Every node is handled once: **O(n)**, with a recursion depth equal to the height. Pre-order lists ==ancestors before descendants==; post-order lists ==children before parents== — exactly what tree DP needs; in-order on a search tree lists the keys ==in sorted order==. Pre-order (or post-order) together with in-order determines the tree uniquely.', '每个结点只处理一次：**O(n)**，递归深度等于树高。先序==先列祖先、后列后代==；后序==先列孩子、后列父亲==——这正是树形 DP 需要的顺序；对搜索树做中序遍历，得到的键值是==从小到大==的。先序（或后序）加上中序，可以唯一确定一棵二叉树。'] },
    ],
    flow: [
      { id: 'call', kind: 'start', text: ['traverse(u)', 'traverse(u)'], on: [] },
      { id: 'base', kind: 'test', text: ['is u empty ?', 'u 为空？'], yes: 'ret', on: [] },
      { id: 'pre', text: ['pre-order prints u here', '先序在这里输出 u'] },
      { id: 'l', text: ['traverse(left child of u)', 'traverse(u 的左孩子)'], on: [] },
      { id: 'in', text: ['in-order prints u here', '中序在这里输出 u'] },
      { id: 'r', text: ['traverse(right child of u)', 'traverse(u 的右孩子)'], on: [] },
      { id: 'post', text: ['post-order prints u here', '后序在这里输出 u'] },
      { id: 'ret', kind: 'end', text: ['return', '返回'], on: [] },
    ],
  },

  huffman: {
    story: [
      { kind: 'naive', title: ['Start simple: a balanced tree', '先从最简单的做起：一棵平衡的树'],
        body: ['Put all leaves at the same depth. With weights 1, 16, 19, 30 the cost is 2 × (1 + 16 + 19 + 30) = **132**. But the leaf of weight 30 pays for two levels just like the leaf of weight 1 — depth is being spent where it is most expensive.', '让所有叶子都在同一深度。权值为 1、16、19、30 时，代价是 2 × (1 + 16 + 19 + 30) = **132**。可是权值 30 的叶子和权值 1 的叶子一样要付两层的代价——深度被花在了最贵的地方。'],
        fig: () => [graph(at([[1.5, 0], [0.5, 1], [2.5, 1], [0, 2], [1, 2], [2, 2], [3, 2]]), ed([[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]]), { name: 'every leaf at depth 2: cost 132', label: ['', '', '', 1, 16, 19, 30], tone: tn({ dim: [0, 1, 2], bad: 6 }) })] },
      { kind: 'insight', title: ['The two lightest leaves can be deepest — and siblings', '最轻的两个叶子可以放在最深处——并且互为兄弟'],
        body: ['If a heavier leaf were deeper than a lighter one, swapping the two would not increase the cost. So in some optimal tree the ==two smallest weights are siblings at the deepest level==. Now glue them together: their parent behaves like a single leaf whose weight is their sum. The problem is the same, __with one leaf fewer__.', '如果一个较重的叶子比一个较轻的叶子更深，把它们对调，代价不会增加。所以一定存在一棵最优树，其中==最小的两个权值是最深一层的兄弟==。现在把它们粘在一起：它们的父结点就相当于一个权值为两者之和的叶子。问题没变，只是__少了一个叶子__。'] },
      { kind: 'how', title: ['Take the two smallest, merge, put the sum back', '取最小的两个，合并，把和放回去'],
        body: ['A __min-heap__ delivers the two smallest weights. Merge them and push the sum; repeat until one weight is left. Each merge pushes every leaf beneath it one level deeper, which adds ==exactly the merged sum== to the cost — so the answer is simply the total of all merge sums.', '用__小根堆__取出最小的两个权值。把它们合并，再把和放回堆里；重复到只剩一个权值为止。每次合并都会让它下面的所有叶子深一层，代价恰好增加==这次合并的和==——所以答案就是所有合并之和的总和。'],
        fig: () => [graph(at([[2.5, 0], [1.5, 1], [3.5, 1], [0.5, 2], [2.5, 2], [0, 3], [1, 3]]), ed([[0, 1], [0, 2], [1, 3], [1, 4], [3, 5], [3, 6]]), { name: 'merges: 1 + 16 = 17,  17 + 19 = 36,  36 + 30 = 66   →   cost 17 + 36 + 66 = 119', label: [66, 36, 30, 17, 19, 1, 16], tone: tn({ cmp: [0, 1, 3], ok: 2 }) })] },
      { kind: 'result', title: ['Optimal, in n − 1 merges', 'n − 1 次合并，得到最优解'],
        body: ['n − 1 merges with a heap: **O(n log n)**. Read 0 for "left" and 1 for "right" and every leaf gets a code word; no code is a prefix of another, and frequent symbols get short codes. That is ==Huffman coding==, used inside ZIP, PNG and JPEG.', '用堆做 n − 1 次合并：**O(n log n)**。把“向左”记为 0、“向右”记为 1，每个叶子就得到一个码字；任何码字都不是另一个码字的前缀，而且出现越频繁的符号码字越短。这就是==哈夫曼编码==，ZIP、PNG、JPEG 里都用到了它。'] },
    ],
    flow: [
      { id: 'init', kind: 'start', text: ['push every weight into a min-heap;  ans = 0', '把所有权值放入小根堆；ans = 0'] },
      { id: 'loop', kind: 'test', text: ['more than one weight in the heap ?', '堆里不止一个权值？'], no: 'done', on: [] },
      { id: 'pick', text: ['pop the two smallest:  a and b', '弹出最小的两个：a 和 b'] },
      { id: 'merge', text: ['ans += a + b;  push a + b', 'ans += a + b；把 a + b 放回堆'], next: 'loop' },
      { id: 'done', kind: 'end', text: ['print ans', '输出 ans'] },
    ],
  },

  bst: {
    story: [
      { kind: 'naive', title: ['Start with a sorted array', '先从有序数组说起'],
        body: ['Binary search finds a key in a sorted array in log n steps. But **inserting** a key means shifting everything after it: O(n). A linked list inserts in O(1) — and cannot be binary searched. We want both.', '在有序数组里，二分查找只要 log n 步就能找到一个键值。但**插入**一个键值要把它后面的元素全部后移：O(n)。链表可以 O(1) 插入——却没法二分。我们想两样都要。'],
        fig: () => [arr('insert 6: four elements must move', [4, 10, 14, 17, 18, ''], tn({ ok: 0, bad: span(1, 4) }))] },
      { kind: 'insight', title: ['Build the binary search into the links', '把二分查找做进链接里'],
        body: ['Keep one rule at every node: ==everything in the left subtree is smaller, everything in the right subtree is larger==. Then one comparison at a node tells you which subtree could hold the key — exactly like looking at the middle of a sorted array — and the "middle" of each half is simply the child.', '在每个结点上都保持一条规则：==左子树里的键值都比它小，右子树里的都比它大==。这样在一个结点上比较一次，就知道键值只可能在哪棵子树里——和看有序数组的中间元素一模一样——而每一半的“中间元素”就是对应的孩子。'],
        fig: () => [graph(BST.pos, BST.edges, { name: 'searching 14: 14 < 17 go left, 14 > 4 go right, 14 > 10 go right', label: [17, 4, 10, 6, 18, 14], tone: tn({ cmp: [0, 1, 2], ok: 5 }) })] },
      { kind: 'how', title: ['Insert where the search falls off the tree', '在查找“走出”树的地方插入'],
        body: ['Search for the new key. If it is not there, the walk ends at an __empty child__ — and that is the only place where the key can go without breaking the rule. Printing left subtree, node, right subtree (in-order) lists all keys ==in ascending order==.', '先查找这个新的键值。如果它不在树里，查找会停在一个__空的孩子位置__——那正是唯一能放下它而又不破坏规则的地方。按“左子树、结点、右子树”的顺序输出（中序遍历），就能==从小到大==列出所有键值。'],
        fig: () => [arr('in-order walk', [4, 6, 10, 14, 17, 18], tn({ ok: span(0, 5) }))] },
      { kind: 'result', title: ['As fast as the tree is shallow', '树有多浅，它就有多快'],
        body: ['Every operation walks one path: **O(height)**. Keys in random order give a height around log n. Keys in ==sorted order== always go to the right of the previous one: the tree becomes a chain of height n. Balanced trees — the Treap lesson, or `std::set` — exist to prevent exactly that.', '每个操作都只走一条路径：**O(树高)**。键值随机到来时，树高大约是 log n。键值==按顺序==到来时，每个都接在前一个的右边：树退化成一条高为 n 的链。平衡树——Treap 那一课，或者 `std::set`——就是为了防止这种情况。'],
        fig: () => { const c = bin(5, {}, { 0: 1, 1: 2, 2: 3, 3: 4 }); return [graph(c.pos, c.edges, { name: 'inserting 1, 2, 3, 4, 5', tone: tn({ bad: span(0, 4) }), small: false })] } },
    ],
    flow: [
      { id: 'more', kind: 'test', text: ['another key x ?   (start at the root)', '还有键值 x ？（从根出发）'], no: 'visit', on: [] },
      { id: 'nul', kind: 'test', text: ['is the current spot empty ?', '当前位置为空？'], no: 'lt', on: [] },
      { id: 'new', text: ['create a node with key x here', '在这里新建键值为 x 的结点'], next: 'more' },
      { id: 'lt', kind: 'test', text: ['x < key here ?', 'x < 这里的键值？'], yes: 'left', no: 'right', on: [] },
      { id: 'left', text: ['go to the left child', '走向左孩子'], next: 'nul' },
      { id: 'right', text: ['x > key: go to the right child   (x = key: nothing to do)', 'x > 键值：走向右孩子（相等：无需插入）'], next: 'nul' },
      { id: 'visit', kind: 'end', text: ['in-order walk: print the keys', '中序遍历：输出所有键值'] },
    ],
  },

  'sparse-table': {
    story: [
      { kind: 'naive', title: ['Start simple: scan every query, or store every answer', '先从最简单的做起：每次扫描，或者存下所有答案'],
        body: ['Scanning costs O(n) per query. Precomputing the maximum of **every** range gives O(1) queries — but there are about n²/2 ranges; for n = 10⁵ that is five billion numbers. One extreme is too slow, the other too big.', '每次询问都扫描一遍，是 O(n)。把**每个**区间的最大值都预先算好，询问就是 O(1)——但区间大约有 n²/2 个；n = 10⁵ 时就是五十亿个数。一头太慢，另一头太大。'] },
      { kind: 'insight', title: ['Store only the ranges whose length is a power of two', '只存长度为 2 的幂的区间'],
        body: ['`st[j][i]` = maximum of the 2ʲ elements starting at i. There are only **n log n** of these, and each is ==two blocks of half the length, side by side==: `st[j][i] = max(st[j−1][i], st[j−1][i + 2ʲ⁻¹])`. Level by level, the table builds itself.', '`st[j][i]` = 从 i 开始的 2ʲ 个元素的最大值。这样的区间只有 **n log n** 个，而且每个都是==两个长度减半的块并排拼成的==：`st[j][i] = max(st[j−1][i], st[j−1][i + 2ʲ⁻¹])`。一层一层往上，表就自己建起来了。'],
        fig: () => [grid('st[2][1] = max(st[1][1], st[1][3])', [[32, 1, 27, 50, 49, 15], [32, 27, 50, 50, 49, ''], [50, 50, 50, '', '', '']], gt({ cmp: [[1, 0], [1, 2]], act: [[2, 0]] }), { rows: ['j = 0  (length 1)', 'j = 1  (length 2)', 'j = 2  (length 4)'], cols: span(1, 6) })] },
      { kind: 'how', title: ['Two overlapping blocks cover any range', '两个互相重叠的块能盖住任何区间'],
        body: ['For a query [l, r] take the largest power of two that fits: `k = ⌊log₂(r − l + 1)⌋`. One block of length 2ᵏ ==starting at l== and one ==ending at r== cover the whole range, because together they are longer than it. They overlap in the middle — and for a maximum, looking at an element twice changes nothing.', '对询问 [l, r]，取不超过区间长度的最大的 2 的幂：`k = ⌊log₂(r − l + 1)⌋`。一个==从 l 开始==、一个==到 r 结束==、长度都是 2ᵏ 的块，合起来能盖住整个区间，因为它们的总长度超过了区间长度。它们在中间重叠——但对最大值来说，一个元素看两遍没有任何影响。'],
        fig: () => [
          arr('query (2, 6), k = 2: the block starting at l …', [32, 1, 27, 50, 49, 15], tn({ dim: [0, 5], cmp: span(1, 4) }), { l: 1 }, { base: 1 }),
          arr('… and the block ending at r', [32, 1, 27, 50, 49, 15], tn({ dim: [0, 1], alt: span(2, 5) }), { r: 5 }, { base: 1 }),
        ] },
      { kind: 'result', title: ['Two lookups per query — for the right kind of question', '每次询问查两次表——但问题得合适'],
        body: ['O(n log n) to build, **O(1) per query**. The overlap is only harmless for operations where repeating an element changes nothing — ==max, min, gcd==. Sums would count the overlap twice. And the array must never change: with updates, use a segment tree.', '建表 O(n log n)，**每次询问 O(1)**。重叠之所以无害，是因为这类运算里一个元素重复出现不影响结果——==max、min、gcd==。求和就会把重叠部分算两次。另外数组必须不变：有修改时要用线段树。'] },
    ],
    flow: [
      { id: 'base', kind: 'start', text: ['st[0][i] = a[i]', 'st[0][i] = a[i]'] },
      { id: 'build', text: ['for j = 1, 2, …:  st[j][i] = max of its two halves in st[j−1]', '对 j = 1, 2, …：st[j][i] = st[j−1] 中两个半块的最大值'] },
      { id: 'more', kind: 'test', text: ['another query (l, r) ?', '还有询问 (l, r) ？'], no: 'end', on: [] },
      { id: 'k', text: ['k = ⌊log₂(r − l + 1)⌋', 'k = ⌊log₂(r − l + 1)⌋'], on: ['query'] },
      { id: 'query', text: ['print max(st[k][l], st[k][r − 2ᵏ + 1])', '输出 max(st[k][l], st[k][r − 2ᵏ + 1])'], next: 'more' },
      { id: 'end', kind: 'end', text: ['done', '结束'], on: [] },
    ],
  },

  dsu: {
    story: [
      { kind: 'naive', title: ['Start simple: give every element a set label', '先从最简单的做起：给每个元素贴上集合编号'],
        body: ['"Same set?" is then one comparison. But **merging** two sets means relabelling every element of one of them — up to n writes per merge, n² in total.', '这样“是否在同一集合”只要比较一次。但**合并**两个集合，就得把其中一个集合的每个元素都重新贴标签——每次合并最多 n 次写入，总共 n²。'],
        fig: () => [arr('set label of each element — merging sets 1 and 2 rewrites three cells', [1, 2, 1, 4, 2, 2], tn({ bad: [1, 4, 5], dim: 3 }), undefined, { base: 1 })] },
      { kind: 'insight', title: ['Let elements point to each other instead', '改成让元素互相指向'],
        body: ['Give each element a **parent pointer**. Following the pointers leads to a root, the representative of the set; a root points to itself. Two elements are in the same set exactly when they reach ==the same root==. And merging becomes a __single assignment__: make one root point to the other.', '给每个元素一个**父指针**。顺着指针一路走会到达根，也就是这个集合的代表；根指向它自己。两个元素在同一集合，当且仅当它们走到==同一个根==。而合并变成了__一次赋值__：让一个根指向另一个根。'],
        fig: () => { const f = forest([-1, 0, 0, -1, 3, 3], true); return [graph(f.pos, f.edges, { name: 'two sets; merging them = one new pointer from root 4 to root 1', tone: tn({ ok: [0, 3] }) })] } },
      { kind: 'how', title: ['Path compression: flatten while you search', '路径压缩：边查找边压扁'],
        body: ['The danger is long chains of pointers. So after `find(x)` has reached the root, ==point every element on the path straight at it==: `fa[x] = find(fa[x])`. The next search from any of them takes one step. The trees flatten themselves as a side effect of being used.', '危险在于指针连成长链。所以 `find(x)` 找到根之后，==把路径上的每个元素都直接指向根==：`fa[x] = find(fa[x])`。下次从其中任何一个元素出发查找，都只要一步。树在被使用的过程中顺带把自己压扁了。'],
        fig: () => { const a = forest([-1, 0, 1, 2], true), b = forest([-1, 0, 0, 0], true); return [graph(a.pos, a.edges, { name: 'before find(4)', tone: tn({ ok: 0, cmp: [1, 2, 3] }), small: false }), graph(b.pos, b.edges, { name: 'after find(4): everyone on the path points at the root', tone: tn({ ok: 0 }) })] } },
      { kind: 'result', title: ['Practically constant time', '几乎是常数时间'],
        body: ['With path compression (plus attaching the smaller tree under the larger), m operations cost **O(m · α(n))**, where α is at most 4 for any imaginable n. It is the engine of Kruskal\'s algorithm and of every "are these connected yet?" problem. One limit: sets can be merged, ==never split==.', '使用路径压缩（再加上把小树接到大树下面），m 次操作的代价是 **O(m · α(n))**，对任何能想到的 n，α 都不超过 4。它是 Kruskal 算法的核心，也用在所有“这些点连通了吗”的问题里。有一个限制：集合只能合并，==不能拆开==。'] },
      { kind: 'term', title: ['What the sets are: equivalence classes', '这些集合是什么：等价类'],
        body: ['A relation ~ is an **equivalence relation** when it is __reflexive__ (a ~ a), __symmetric__ (a ~ b gives b ~ a) and __transitive__ (a ~ b and b ~ c give a ~ c). "Is connected to", "has the same remainder mod m" and "is in the same team as" are all of this kind. Such a relation ==splits the elements into groups that do not overlap==, the **equivalence classes**: everything in a class is related to everything else in it, and to nothing outside. A disjoint set union stores exactly these classes. `union(x, y)` records the new fact x ~ y, and transitivity is why the two __whole__ classes must merge.', '如果关系 ~ 满足__自反性__（a ~ a）、__对称性__（a ~ b 则 b ~ a）和__传递性__（a ~ b 且 b ~ c 则 a ~ c），它就是一个**等价关系**。“连通”“模 m 同余”“在同一个队里”都是这样的关系。等价关系会把所有元素==划分成互不相交的若干组==，称为**等价类**：同一类中的元素两两相关，与类外的元素都不相关。并查集保存的正是这些等价类。`union(x, y)` 记录了一条新事实 x ~ y，而由于传递性，两个类必须__整个__合并。'],
        fig: () => [arr('"same remainder mod 3" splits 1 … 9 into three classes', [1, 2, 3, 4, 5, 6, 7, 8, 9], tn({ act: [0, 3, 6], cmp: [1, 4, 7], ok: [2, 5, 8] }), undefined, { base: 1 })] },
    ],
    flow: [
      { id: 'init', kind: 'start', text: ['fa[i] = i  for every i', '对每个 i：fa[i] = i'] },
      { id: 'more', kind: 'test', text: ['another operation (op, x, y) ?', '还有操作 (op, x, y) ？'], no: 'end', on: [] },
      { id: 'find', text: ['find the roots of x and y, compressing the paths', '查找 x 和 y 的根，同时压缩路径'] },
      { id: 'op', kind: 'test', text: ['op = 1   (merge) ?', 'op = 1（合并）？'], no: 'query', on: [] },
      { id: 'union', text: ['fa[root of x] = root of y', 'fa[x 的根] = y 的根'], next: 'more' },
      { id: 'query', text: ['print Y if the roots are equal, otherwise N', '两个根相同输出 Y，否则输出 N'], next: 'more' },
      { id: 'end', kind: 'end', text: ['done', '结束'], on: [] },
    ],
  },

  fenwick: {
    story: [
      { kind: 'naive', title: ['Start with two arrays that each do half the job', '先看两种各能做好一半的数组'],
        body: ['A plain array updates an element in O(1) but needs O(n) for a sum. A prefix-sum array answers sums in O(1) but one update changes up to n prefixes. With many updates __and__ many sums mixed, both end up at n × q.', '普通数组修改一个元素是 O(1)，求和却要 O(n)。前缀和数组求和是 O(1)，但修改一个元素最多要改 n 个前缀。当修改__和__求和大量交替出现时，两者都是 n × q。'],
        fig: () => [grid('cost per operation', [['O(1)', 'O(n)'], ['O(n)', 'O(1)'], ['O(log n)', 'O(log n)']], gt({ ok: [[0, 0], [1, 1], [2, 0], [2, 1]], bad: [[0, 1], [1, 0]] }), { rows: ['plain array', 'prefix sums', 'Fenwick tree'], cols: ['update', 'range sum'] })] },
      { kind: 'insight', title: ['Store blocks whose length is the lowest set bit', '存一些块，块长就是下标的最低位 1'],
        body: ['`lowbit(i) = i & −i` is the lowest 1-bit of i: lowbit(6 = 110₂) = 2. Let ==c[i] hold the sum of the lowbit(i) elements ending at i==. Odd cells hold one element, c[2] and c[6] two, c[4] four, c[8] eight: blocks of every size, interleaved.', '`lowbit(i) = i & −i` 是 i 的二进制最低位的 1：lowbit(6 = 110₂) = 2。让 ==c[i] 存以 i 结尾的 lowbit(i) 个元素之和==。奇数下标的格子存一个元素，c[2] 和 c[6] 存两个，c[4] 存四个，c[8] 存八个：各种大小的块交错在一起。'],
        fig: () => [grid('which elements each c[i] covers', [['', '', '', '', '', '', '', 'c[8]'], ['', '', '', 'c[4]', '', '', '', ''], ['', 'c[2]', '', '', '', 'c[6]', '', ''], ['c[1]', '', 'c[3]', '', 'c[5]', '', 'c[7]', '']], gt({ ok: row(0, 0, 7), cmp: [...row(1, 0, 3), ...row(2, 4, 5)], alt: row(2, 0, 1), vis: [[3, 0], [3, 2], [3, 4], [3, 6]] }), { cols: span(1, 8) })] },
      { kind: 'how', title: ['Sums walk down the bits, updates walk up', '求和顺着二进制位往下走，修改往上走'],
        body: ['A prefix 1..i splits into blocks along the binary digits of i: take `c[i]`, then ==remove the lowest bit== and repeat. 7 → 6 → 4 → 0. An update at i must fix every block that contains i: ==add the lowest bit== and repeat. 3 → 4 → 8. Both loops run at most log n times.', '前缀 1..i 可以按 i 的二进制位拆成若干块：取 `c[i]`，然后==去掉最低位的 1==，重复。7 → 6 → 4 → 0。修改位置 i 时，要更新所有包含 i 的块：==加上最低位的 1==，重复。3 → 4 → 8。两个循环都最多执行 log n 次。'],
        fig: () => { const c = span(1, 8).map(i => `c[${i}]`); return [arr('sum(7) = c[7] + c[6] + c[4]', c, tn({ ok: [6, 5, 3] }), { i: 6 }, { base: 1 }), arr('add at 3: c[3], c[4], c[8] change', c, tn({ act: [2, 3, 7] }), { i: 2 }, { base: 1 })] } },
      { kind: 'result', title: ['One array, two tiny loops', '一个数组，两个很短的循环'],
        body: ['**O(log n)** for both operations, and a range sum is `sum(r) − sum(l − 1)`. It is far shorter than a segment tree and very fast. The limit: it relies on ==subtraction== to turn prefixes into ranges, so it suits sums (and xor), not range maximum.', '两种操作都是 **O(log n)**，区间和就是 `sum(r) − sum(l − 1)`。它比线段树短得多，而且非常快。局限在于：它靠==相减==把前缀变成区间，所以适合求和（以及异或），不适合区间最大值。'] },
    ],
    flow: [
      { id: 'init', kind: 'start', text: ['c[] = 0;  each a[i] is added like an update', 'c[] = 0；每个 a[i] 都当作一次修改加入'], on: [] },
      { id: 'more', kind: 'test', text: ['another operation ?', '还有操作？'], no: 'end', on: [] },
      { id: 'kind', kind: 'test', text: ['is it "add v at position i" ?', '是“在位置 i 加上 v”？'], no: 'sum', on: [] },
      { id: 'add', text: ['while i ≤ n:  c[i] += v;  i += lowbit(i)', '当 i ≤ n：c[i] += v；i += lowbit(i)'], next: 'more' },
      { id: 'sum', text: ['prefix(i):  while i > 0:  s += c[i];  i −= lowbit(i)', 'prefix(i)：当 i > 0：s += c[i]；i −= lowbit(i)'] },
      { id: 'ans', text: ['print prefix(r) − prefix(l − 1)', '输出 prefix(r) − prefix(l − 1)'], next: 'more' },
      { id: 'end', kind: 'end', text: ['done', '结束'], on: [] },
    ],
  },

  'segment-tree': {
    story: [
      { kind: 'naive', title: ['Start simple: touch every element of the range', '先从最简单的做起：把区间里的元素逐个处理'],
        body: ['Adding v to a[l..r] one element at a time is O(n); so is summing a[l..r]. A difference array makes the updates cheap but the sums expensive, prefix sums the other way round. Here ==both are ranges and they are mixed==.', '把 v 逐个加到 a[l..r] 上是 O(n)；对 a[l..r] 求和也是 O(n)。差分让修改变便宜，却让求和变贵；前缀和则反过来。而这里==两种操作都针对区间，而且交替出现==。'] },
      { kind: 'insight', title: ['A tree of intervals: any range is a few whole nodes', '一棵区间构成的树：任何区间都是少数几个完整结点'],
        body: ['The root is responsible for the whole array, its children for the two halves, down to single elements. Each node stores the ==sum of its interval==. Any range [l, r] can be assembled from **O(log n)** nodes that lie completely inside it — so a query just adds a handful of stored sums.', '根负责整个数组，它的两个孩子各负责一半，一直分到单个元素。每个结点存==它所负责区间的和==。任何区间 [l, r] 都可以由 **O(log n)** 个完全落在其中的结点拼成——所以查询只需把几个存好的和加起来。'],
        fig: () => [graph(SEG.pos, SEG.edges, { name: 'a = 6 1 5 9.   sum(2..4) = node "2" + node "3–4" = 1 + 14', label: SEG_LABEL, sub: [21, 7, 14, 6, 1, 5, 9], tone: tn({ cmp: [0, 1], ok: [4, 2] }) })] },
      { kind: 'how', title: ['Lazy tag: fix the node, owe the rest', '懒标记：先改好这个结点，剩下的先欠着'],
        body: ['An update would have to change every node below those O(log n) nodes — too many. Instead, at a node completely inside the range: add `v × length` to its sum, write down a **tag** "v still has to be added to everything below", and ==stop==. The node itself is correct; its descendants are stale, but nobody is looking at them.', '修改本来要把这 O(log n) 个结点下面的所有结点都改一遍——太多了。换个做法：在完全落在修改区间内的结点上，把它的和加上 `v × 区间长度`，记下一个**标记**“下面的所有元素还欠着一个 v”，然后==停下==。这个结点本身是对的；它的后代是过时的，但此刻没有人去看它们。'],
        fig: () => [graph(SEG.pos, SEG.edges, { name: 'add 3 to positions 3..4: one node updated and tagged, its leaves untouched', label: SEG_LABEL, sub: [27, 7, '20  tag +3', 6, 1, 5, 9], tone: tn({ cmp: 0, act: 2, dim: [5, 6] }) })] },
      { kind: 'how', title: ['Pay the debt only when you go below', '只有往下走的时候才还债'],
        body: ['Whenever an operation has to enter the children of a tagged node, first __push the tag down__ one level: apply it to both children, clear it here. On the way back from an update, __recompute the node__ from its children. Tags therefore travel downward only as far as someone actually needs.', '当某个操作必须进入带标记结点的孩子时，先把标记__下传__一层：作用到两个孩子上，再把这里的标记清空。修改操作返回时，用两个孩子的值__重新计算这个结点__。于是标记只会下传到真正有人需要的深度。'] },
      { kind: 'result', title: ['Everything on ranges in O(log n)', '区间上的各种操作都是 O(log n)'],
        body: ['Range update and range query both visit about 4 log n nodes: **O(log n)**. The same skeleton handles max, min, assignment, gcd — anything where two halves can be ==combined== and a pending change can be ==applied to a whole node at once==. Allocate 4n nodes.', '区间修改和区间查询都只访问大约 4 log n 个结点：**O(log n)**。同一个框架还能处理最大值、最小值、区间赋值、gcd——只要两个半区间的结果可以==合并==，并且待处理的修改可以==一次作用到整个结点==上。结点数组要开 4n。'] },
    ],
    flow: [
      { id: 'build', kind: 'start', text: ['build: every node = sum of its two children', '建树：每个结点 = 两个孩子之和'] },
      { id: 'visit', text: ['an operation on [x, y] arrives at node p', '针对 [x, y] 的操作到达结点 p'], on: [] },
      { id: 'inside', kind: 'test', text: ['is the interval of p completely inside [x, y] ?', 'p 的区间完全落在 [x, y] 内？'], yes: 'whole', no: 'down', on: [] },
      { id: 'down', text: ['push the tag of p down to its children', '把 p 的标记下传给两个孩子'] },
      { id: 'rec', text: ['visit the children that overlap [x, y]', '访问与 [x, y] 有交集的孩子'], on: [] },
      { id: 'up', text: ['after an update:  sum[p] = sum of its children', '修改之后：sum[p] = 两个孩子之和'], next: 'ans' },
      { id: 'whole', text: ['update: add to sum[p] and tag[p].   query: take sum[p]', '修改：加到 sum[p] 和 tag[p] 上。查询：取 sum[p]'], on: ['cover', 'hit'] },
      { id: 'ans', kind: 'end', text: ['back at the root: a query prints its total', '回到根：查询输出累加的结果'] },
    ],
  },

  trie: {
    story: [
      { kind: 'naive', title: ['Start simple: compare the query with every word', '先从最简单的做起：把询问和每个单词比较'],
        body: ['For each query, check every word to see whether it begins with the query. That is **n × q** string comparisons — and words with the same beginning are compared letter by letter again and again.', '对每个询问，检查每个单词是不是以它开头。这是 **n × q** 次字符串比较——而开头相同的单词，被一个字母一个字母地反复比较。'] },
      { kind: 'insight', title: ['Store common beginnings only once', '相同的开头只存一份'],
        body: ['Build a tree in which the root is the empty string and ==each edge adds one letter==. Every node then stands for a prefix, and words that begin the same way share the same path. All words that start with a prefix pass through __the node of that prefix__.', '建一棵树：根表示空串，==每条边添加一个字母==。于是每个结点都代表一个前缀，开头相同的单词共用同一条路径。所有以某个前缀开头的单词，都会经过__这个前缀对应的结点__。'],
        fig: () => [graph(TRIE.pos, TRIE.edges, { name: 'abc, abcb, bbab, ab — the number beside a node: words passing through it', label: TRIE_LABEL, sub: TRIE_CNT, tone: tn({ dim: 0 }) })] },
      { kind: 'how', title: ['Count on the way in, read the counter on the way out', '插入时沿途计数，查询时读出计数'],
        body: ['To insert a word, walk it letter by letter from the root, __creating__ missing nodes, and add 1 to the counter of every node you step on. To answer a query, walk it the same way: if a letter has no child, ==no word has this prefix==; otherwise the answer is the counter of the node where you end.', '插入一个单词时，从根出发一个字母一个字母地走，缺少的结点就__新建__，并把踩到的每个结点的计数器加 1。回答询问时也这样走：如果某个字母没有对应的孩子，说明==没有单词以它为前缀==；否则答案就是最后停在的那个结点的计数器。'],
        fig: () => [graph(TRIE.pos, TRIE.edges, { name: 'query "ab": walk a, b — three words pass through this node', label: TRIE_LABEL, sub: TRIE_CNT, tone: tn({ dim: [0, 5, 6, 7, 8], cmp: 1, ok: 2 }) })] },
      { kind: 'result', title: ['Cost depends on the query, not on the dictionary', '代价取决于询问的长度，而不是词典的大小'],
        body: ['Insert and lookup take **O(length)**, however many words are stored. The price is memory: 26 child slots per node. The same structure over the bits of numbers (a 0/1 trie) finds maximum xor, and with failure links it becomes the Aho–Corasick automaton.', '插入和查询都是 **O(字符串长度)**，与存了多少单词无关。代价是内存：每个结点要 26 个孩子的位置。把同样的结构建在数的二进制位上（0/1 Trie）可以求最大异或；加上失配指针，它就成了 AC 自动机。'] },
    ],
    flow: [
      { id: 'w', kind: 'test', text: ['another word to insert ?   (start at the root)', '还有要插入的单词？（从根出发）'], no: 'q', on: [] },
      { id: 'new', text: ['for each letter: create the child if it is missing', '对每个字母：没有对应的孩子就新建'] },
      { id: 'ins', text: ['step into the child;  its counter++', '走到这个孩子；它的计数器加 1'], next: 'w' },
      { id: 'q', kind: 'test', text: ['another query ?   (start at the root)', '还有询问？（从根出发）'], no: 'end', on: [] },
      { id: 'walk', text: ['follow the letters of the query', '顺着询问的字母往下走'] },
      { id: 'miss', text: ['a letter has no child: stop, the answer is 0', '某个字母没有孩子：停下，答案为 0'] },
      { id: 'ans', text: ['print the counter of the node reached   (or 0)', '输出到达结点的计数器（或 0）'], next: 'q' },
      { id: 'end', kind: 'end', text: ['done', '结束'], on: [] },
    ],
  },

  treap: {
    story: [
      { kind: 'naive', title: ['Start with a plain search tree and sorted input', '先看普通的搜索树遇上有序的输入'],
        body: ['Insert 3, 4, 7, 9, 11 into an ordinary binary search tree: every key goes to the right of the previous one. The "tree" is a **chain**, and each operation costs O(n) instead of O(log n).', '把 3、4、7、9、11 依次插入普通的二叉搜索树：每个键值都接在前一个的右边。这棵“树”成了一条**链**，每个操作的代价是 O(n) 而不是 O(log n)。'],
        fig: () => { const c = bin(5, {}, { 0: 1, 1: 2, 2: 3, 3: 4 }); return [graph(c.pos, c.edges, { label: [3, 4, 7, 9, 11], tone: tn({ bad: span(0, 4) }) })] } },
      { kind: 'insight', title: ['Random order is good — so pretend the order was random', '随机顺序很好——那就假装顺序是随机的'],
        body: ['Keys inserted in random order give a shallow tree with overwhelming probability. We cannot choose the input order, but we can ==make the shape independent of it==: give every node a **random priority** and demand heap order on the priorities (parent ≥ child) on top of search-tree order on the keys. Those two rules fix the shape completely — it is the tree you would get by inserting the keys in order of priority.', '键值按随机顺序插入时，树几乎一定很浅。输入顺序我们无法选择，但可以==让树的形状与输入顺序无关==：给每个结点一个**随机优先级**，在键值满足搜索树性质的同时，要求优先级满足堆性质（父 ≥ 子）。这两条规则完全确定了树的形状——它就是按优先级顺序插入这些键值所得到的树。'] },
      { kind: 'how', title: ['A rotation moves a child above its parent, keeping the order', '旋转：把孩子转到父亲上面，顺序保持不变'],
        body: ['Insert as in an ordinary search tree — the new node becomes a leaf. If its priority beats its parent\'s, __rotate__ it one level up, and repeat. A rotation changes who is the parent, but the ==left-to-right order of the keys stays exactly the same==, so the search-tree rule survives.', '先像普通搜索树那样插入——新结点成为叶子。如果它的优先级比父亲的高，就把它__旋转__上去一层，然后重复。旋转改变的只是谁是父亲，而==键值从左到右的顺序完全不变==，所以搜索树的性质得以保持。'],
        fig: () => { const a = bin(5, { 0: 1, 2: 3 }, { 0: 2, 2: 4 }), b = bin(5, { 2: 0, 0: 1 }, { 2: 4, 0: 3 }, 2), label = [5, 3, 8, 6, 9]; return [graph(a.pos, a.edges, { name: 'before: 8 has a higher priority than its parent 5', label, tone: tn({ cmp: 0, act: 2 }) }), graph(b.pos, b.edges, { name: 'after the left rotation: in-order is still 3 5 6 8 9', label, tone: tn({ cmp: 0, act: 2, vis: 3 }) })] } },
      { kind: 'result', title: ['Balanced on average, whatever the input', '无论输入如何，平均都是平衡的'],
        body: ['The expected height is **O(log n)** for every input order, because the shape depends only on the random priorities. Insert, delete, k-th smallest, rank — all in expected O(log n). It is the shortest balanced tree to write, and the split/merge variant (FHQ Treap) needs no rotations at all.', '无论输入顺序怎样，期望树高都是 **O(log n)**，因为树的形状只取决于随机的优先级。插入、删除、第 k 小、排名——期望都是 O(log n)。它是写起来最短的平衡树，而它的分裂/合并版本（FHQ Treap）甚至完全不需要旋转。'] },
    ],
    flow: [
      { id: 'more', kind: 'test', text: ['another key x ?   (start at the root)', '还有键值 x ？（从根出发）'], no: 'visit', on: [] },
      { id: 'nul', kind: 'test', text: ['is the current spot empty ?', '当前位置为空？'], no: 'down', on: [] },
      { id: 'new', text: ['new node: key x, random priority', '新建结点：键值 x，随机优先级'], next: 'back' },
      { id: 'down', text: ['go into the left (x < key) or right (x > key) child', '进入左孩子（x < 键值）或右孩子（x > 键值）'], next: 'nul' },
      { id: 'back', kind: 'test', text: ['returning upward: child priority > parent priority ?', '向上返回：孩子的优先级 > 父亲的优先级？'], no: 'more', on: [] },
      { id: 'rot', text: ['rotate the child above its parent', '把孩子旋转到父亲上面'], next: 'back', on: ['rotR', 'rotL'] },
      { id: 'visit', kind: 'end', text: ['in-order walk: print the keys', '中序遍历：输出所有键值'] },
    ],
  },

  'sqrt-decomposition': {
    story: [
      { kind: 'naive', title: ['Start simple: one element at a time', '先从最简单的做起：一个元素一个元素地处理'],
        body: ['Both operations walk from l to r: **O(n)** each. Every element is handled on its own, although most of a long range could be described much more briefly.', '两种操作都要从 l 走到 r：每次 **O(n)**。每个元素都被单独处理，尽管一个长区间的大部分本可以用简短得多的方式来描述。'] },
      { kind: 'insight', title: ['Cut the array into blocks and keep a summary of each', '把数组切成若干块，每块留一份摘要'],
        body: ['Any range is then ==some whole blocks in the middle and at most two incomplete blocks at the ends==. A whole block is handled through its summary in O(1); only the loose ends are handled element by element.', '于是任何区间都是==中间的若干个整块，加上两端最多两个不完整的块==。整块通过摘要 O(1) 处理；只有两端零散的部分才逐个元素处理。'],
        fig: () => [arr('range 2..8 with blocks of 3: two loose elements, one whole block, two loose elements', [6, 1, 5, 9, 9, 3, 6, 7, 4], tn({ dim: [0, 8], cmp: [1, 2, 6, 7], ok: [3, 4, 5] }), { l: 1, r: 7 }, { base: 1 }), arr('sum of each block', [12, 21, 17], tn({ ok: 1 }))] },
      { kind: 'how', title: ['A sum and an "add to everyone" tag per block', '每块一个和，再加一个“全体加”标记'],
        body: ['Update: loose elements get v directly (and their block sum grows by v); a whole block only gets `tag += v`. Query: a loose element is worth `a[i] + tag[block]`; a whole block is worth `sum + tag × B`. It is a lazy tag — on a tree with only two levels.', '修改：零散元素直接加上 v（所在块的和也加 v）；整块只需 `tag += v`。查询：零散元素的值是 `a[i] + tag[所在块]`；整块的值是 `sum + tag × B`。这就是懒标记——只不过树只有两层。'] },
      { kind: 'insight', title: ['Choose the block size that balances the two costs', '选一个让两种代价相等的块长'],
        body: ['With block size B an operation touches at most n/B whole blocks and 2B loose elements. Large blocks make the ends expensive, small blocks make the middle expensive. The sum `n/B + 2B` is smallest when the two parts are equal: ==B ≈ √n==.', '块长为 B 时，一次操作最多涉及 n/B 个整块和 2B 个零散元素。块太大，两端就贵；块太小，中间就贵。两部分相等时，`n/B + 2B` 最小：==B ≈ √n==。'],
        fig: () => [grid('n = 100 000: worst-case work per operation', [['10 000', 316, 10], [20, 632, '20 000'], ['10 020', 948, '20 010']], gt({ bad: [[2, 0], [2, 2]], ok: [[2, 1]] }), { rows: ['whole blocks  n / B', 'loose elements  2B', 'total'], cols: ['B = 10', 'B = 316', 'B = 10 000'] })] },
      { kind: 'result', title: ['Slower than a tree, but far more flexible', '比树慢，但灵活得多'],
        body: ['**O(√n)** per operation — about 300 steps for n = 10⁵, against 17 for a segment tree. Its strength is that a block can keep ==any== summary: a sorted copy, a frequency table, a small data structure. When two halves do not combine neatly, blocks still work. The same balancing argument powers Mo\'s algorithm.', '每次操作 **O(√n)**——n = 10⁵ 时约 300 步，而线段树是 17 步。它的长处在于一个块可以保存==任何形式==的摘要：排好序的副本、频次表、一个小的数据结构。当两个半区间的信息无法简洁地合并时，分块照样能用。莫队算法靠的也是同样的平衡思想。'] },
    ],
    flow: [
      { id: 'init', kind: 'start', text: ['B = √n;  block of i = i / B;  sum of every block', 'B = √n；i 所在块 = i / B；求出每块的和'] },
      { id: 'more', kind: 'test', text: ['another operation on [l, r] ?', '还有针对 [l, r] 的操作？'], no: 'end', on: [] },
      { id: 'part', text: ['incomplete blocks at both ends: element by element', '两端不完整的块：逐个元素处理'], on: ['part', 'qpart'] },
      { id: 'whole', text: ['whole blocks between them: tag += v   (query: sum + tag × B)', '中间的整块：tag += v（查询：sum + tag × B）'], on: ['whole', 'qwhole'] },
      { id: 'ans', text: ['a query prints its total', '查询输出累加的结果'], next: 'more' },
      { id: 'end', kind: 'end', text: ['done', '结束'], on: [] },
    ],
  },

  'leftist-heap': {
    story: [
      { kind: 'naive', title: ['Start with a binary heap — and two of them', '先看二叉堆——当你有两个堆的时候'],
        body: ['A binary heap in an array pushes and pops in O(log n). But **merging** two such heaps means inserting the elements of one into the other, or rebuilding: O(n). When heaps must be united again and again, that is the bottleneck.', '数组实现的二叉堆，push 和 pop 都是 O(log n)。但要**合并**两个这样的堆，只能把一个堆的元素逐个插入另一个，或者整体重建：O(n)。当堆需要一次次合并时，这就成了瓶颈。'] },
      { kind: 'insight', title: ['Make the tree lopsided on purpose', '故意把树做成偏的'],
        body: ['Use a heap-ordered binary tree with pointers, and define `dist(u)` = length of the shortest path from u down to a missing child. Demand ==dist(left) ≥ dist(right)== at every node. Then the path that always goes right is the shortest way down — at most **log₂(n + 1)** nodes — however deep the left side grows.', '用带指针的、满足堆序的二叉树，并定义 `dist(u)` = 从 u 往下走到一个缺失孩子的最短路径长度。要求每个结点都满足 ==dist(左) ≥ dist(右)==。这样，一直向右走的那条路径就是往下最短的路——最多 **log₂(n + 1)** 个结点——无论左边长得多深。'],
        fig: () => { const t = bin(5, { 0: 1, 1: 3 }, { 0: 2, 1: 4 }); return [graph(t.pos, t.edges, { name: 'beside each node: dist.  The right spine 1 → 32 is short', label: [1, 27, 32, 50, 49], sub: [2, 2, 1, 1, 1], tone: tn({ ok: [0, 2] }) })] } },
      { kind: 'how', title: ['Merge along the right spines only', '只沿着右链合并'],
        body: ['`merge(x, y)`: the smaller root stays on top; ==merge the other heap into its right child==, recursively. On the way back, if the right child has become deeper than the left one, __swap the two children__, and set `dist = dist(right) + 1`. Only the two short right spines are ever walked.', '`merge(x, y)`：根较小的留在上面；==把另一个堆合并到它的右孩子里==，递归进行。返回时，如果右孩子变得比左孩子更“深”，就__交换两个孩子__，并令 `dist = dist(右) + 1`。整个过程只会走两条很短的右链。'] },
      { kind: 'result', title: ['Everything is a merge', '一切操作都是合并'],
        body: ['Merge costs **O(log n)**. Push is a merge with a one-node heap; pop removes the root and merges its two subtrees. Together with a disjoint-set union this lets you maintain many heaps that keep being ==united== — and since nodes are never moved, only relinked, the structure is easy to make persistent.', '合并的代价是 **O(log n)**。push 就是与只有一个结点的堆合并；pop 就是去掉根，再合并它的两棵子树。配合并查集，就能维护许多不断==合并==的堆——而且结点从不移动，只改指针，所以很容易做成可持久化的。'] },
    ],
    flow: [
      { id: 'op', kind: 'start', text: ['push: merge(root, new node).   pop: print the root, merge(its two children)', 'push：merge(根, 新结点)。pop：输出根，merge(它的两个孩子)'], on: ['push', 'pop'] },
      { id: 'base', kind: 'test', text: ['merge(x, y): is one of them empty ?', 'merge(x, y)：其中一个为空？'], yes: 'ret' },
      { id: 'root', text: ['let x be the one with the smaller root', '让 x 成为根较小的那个'] },
      { id: 'rec', text: ['right child of x = merge(right child of x, y)', 'x 的右孩子 = merge(x 的右孩子, y)'] },
      { id: 'swap', text: ['if dist(left) < dist(right): swap the children of x', '若 dist(左) < dist(右)：交换 x 的两个孩子'] },
      { id: 'dist', text: ['dist(x) = dist(right child) + 1', 'dist(x) = dist(右孩子) + 1'] },
      { id: 'ret', kind: 'end', text: ['return the root of the merged heap', '返回合并后堆的根'], on: [] },
    ],
  },
  'monotonic-queue': {
    story: [
      { kind: 'naive', title: ['Start simple: rescan every window', '先从最简单的做起：每个窗口重新扫一遍'],
        body: ['For each of the n − k + 1 windows, look at all k elements and take the largest. That is about **n × k** comparisons — and neighbouring windows share k − 1 elements, so almost all of that work is repeated.', '对 n − k + 1 个窗口中的每一个，都把 k 个元素看一遍取最大值。这大约是 **n × k** 次比较——而相邻的两个窗口有 k − 1 个元素是相同的，所以几乎全是重复劳动。'],
        fig: () => [arr('a   (k = 4): the next window repeats three of the four comparisons', [3, 1, 4, 1, 5, 9, 2, 6], tn({ dim: [0, 5, 6, 7], cmp: span(1, 4) }), undefined, { bars: true })] },
      { kind: 'insight', title: ['A newer, larger element makes older smaller ones useless', '更新、更大的元素，让更旧、更小的元素彻底没用'],
        body: ['Take two elements in the window, an older one and a newer one that is __at least as large__. The older one leaves the window first — and until then the newer one is also there and is no smaller. So the older one ==can never again be the maximum==. Throw it away now.', '看窗口中的两个元素：一个较旧，另一个较新而且__不比它小__。较旧的那个会先离开窗口——在那之前，较新的元素也在窗口里，并且不比它小。所以较旧的元素==再也不可能成为最大值==，现在就可以扔掉。'],
        fig: () => [arr('a: once 5 arrives, the 1, 4, 1 before it can never win again', [3, 1, 4, 1, 5, 9, 2, 6], tn({ dim: [0, 5, 6, 7], bad: [1, 2, 3], ok: 4 }), { i: 4 }, { bars: true })] },
      { kind: 'how', title: ['What survives is a decreasing line of candidates', '留下来的，是一列递减的候选者'],
        body: ['After throwing those away, the survivors are __decreasing from oldest to newest__, so the **oldest survivor is the maximum**. Each new element enters at the back, first popping everything it dominates. An element leaves at the front when it slides out of the window. Store ==indices, not values==, so you can tell when that happens.', '把那些元素扔掉之后，剩下的候选者__从旧到新是递减的__，所以**最旧的那个就是最大值**。每个新元素从队尾进入，进入前先把被它压制的元素全部弹出。队首的元素滑出窗口时，从队首离开。队列里要存==下标而不是值==，这样才能判断它何时过期。'],
        fig: () => [arr('a   (k = 4, i = 7)', [3, 1, 4, 1, 5, 9, 2, 6], tn({ dim: span(0, 3), ok: 5, cmp: 7, bad: [4, 6] }), { i: 7 }, { bars: true }), arr('deque of indices (front → back)', [5, 7], tn({ ok: 0, cmp: 1 }))] },
      { kind: 'result', title: ['Everyone enters once and leaves once', '每个元素只进一次、只出一次'],
        body: ['A pop can only remove something that was pushed, and each index is pushed exactly once. So the total work is **O(n)** — no matter how large k is. The same deque speeds up DP transitions that take a max or min over a sliding range.', '弹出的一定是曾经压入的元素，而每个下标恰好只压入一次。所以总工作量是 **O(n)**——无论 k 有多大。同样的队列还能优化“在滑动区间内取最大值或最小值”的 DP 转移。'] },
    ],
    flow: [
      { id: 'next', kind: 'test', text: ['next index i < n ?', '下一个下标 i < n ？'], no: 'end', on: [] },
      { id: 'exp', kind: 'test', text: ['front index ≤ i − k ?', '队首下标 ≤ i − k ？'], yes: 'expire', no: 'dom', on: [] },
      { id: 'expire', text: ['pop the front (it left the window)', '弹出队首（它已滑出窗口）'] },
      { id: 'dom', kind: 'test', text: ['a[back] ≤ a[i] ?', 'a[队尾] ≤ a[i] ？'], yes: 'popback', no: 'push', on: [] },
      { id: 'popback', text: ['pop the back (it can never win)', '弹出队尾（它不可能再成为最大值）'], next: 'dom' },
      { id: 'push', text: ['push i at the back', '把 i 加入队尾'] },
      { id: 'win', kind: 'test', text: ['i ≥ k − 1 ?', 'i ≥ k − 1 ？'], yes: 'out', no: 'next', on: [] },
      { id: 'out', text: ['output a[front]', '输出 a[队首]'], next: 'next' },
      { id: 'end', kind: 'end', text: ['done', '结束'] },
    ],
  },

  'linked-list': {
    story: [
      { kind: 'naive', title: ['Start with an array', '先用数组试试'],
        body: ['Keep the sequence in an array and remove an element from the middle. The hole must be closed: **every element behind it moves one place**. Inserting is the same in reverse. With n elements and n operations that is up to n² moves.', '把序列存在数组里，然后删掉中间的一个元素。空位必须补上：**它后面的每个元素都要前移一格**。插入则正好反过来。n 个元素、n 次操作，最多要移动 n² 次。'],
        fig: () => [arr('remove 2: everything behind it shifts', [1, 2, 3, 4, 5, 6], tn({ bad: 1, act: [2, 3, 4, 5] }), undefined, { base: 1 })] },
      { kind: 'insight', title: ['Store the order, not the positions', '保存顺序，而不是位置'],
        body: ['Let each element remember ==who comes next and who comes before==. The sequence is then whatever you meet by following the links. Positions no longer exist, so nothing ever has to shift: changing the order means __changing a few links__.', '让每个元素记住==谁在它后面、谁在它前面==。沿着指针依次遇到的元素就是整个序列。位置不存在了，自然也就没有什么需要挪动：改变顺序只是__改几个指针__。'],
        fig: () => [grid('the list 1, 2, 3, 4 with a sentinel 0', [[1, 2, 3, 4, 0], [4, 0, 1, 2, 3]], gt({ vis: [[0, 0], [1, 0]] }), { rows: ['nxt', 'pre'], cols: [0, 1, 2, 3, 4] })] },
      { kind: 'term', title: ['Singly, doubly, circular', '单链表、双向链表、循环链表'],
        body: ['A **singly linked** list keeps only `nxt`: you can walk forward, but to remove x you must first find the element before it — a walk from the head. A **doubly linked** list adds `pre`, so both neighbours of x are at hand and removal takes constant time. In a **circular** list the last element points back to the first. Here an extra node 0, the __sentinel__, stands between the last and the first element: the list is circular through it, and the two ends stop being special.', '**单链表**只保存 `nxt`：可以向后走，但要删除 x，必须先找到它前面的元素——得从表头走过来。**双向链表**再加上 `pre`，x 的两个邻居随时可得，删除只需常数时间。**循环链表**中，最后一个元素指回第一个。这里额外增加一个 0 号结点作为__哨兵__，它站在最后一个和第一个元素之间：链表通过它连成了环，两端也就不再特殊。'] },
      { kind: 'how', title: ['Two links to remove, four to insert', '删除改两个指针，插入改四个'],
        body: ['**Remove x**: `nxt[pre[x]] = nxt[x]` and `pre[nxt[x]] = pre[x]` — the neighbours now skip x. **Insert x after y**: first x learns its neighbours, `nxt[x] = nxt[y]`, `pre[x] = y`; then they learn about x, `pre[nxt[y]] = x`, `nxt[y] = x`. ==Change nxt[y] last==: until then it is the only way to reach the old successor.', '**删除 x**：`nxt[pre[x]] = nxt[x]`，`pre[nxt[x]] = pre[x]`——两个邻居从此跳过 x。**把 x 插到 y 后面**：先让 x 认识它的邻居，`nxt[x] = nxt[y]`，`pre[x] = y`；再让邻居认识 x，`pre[nxt[y]] = x`，`nxt[y] = x`。==nxt[y] 要最后改==：在那之前，它是找到 y 原来后继的唯一途径。'],
        fig: () => [grid('remove 2 from 1, 2, 3, 4: only the links of 1 and 3 change', [[1, 3, 3, 4, 0], [4, 0, 1, 1, 3]], gt({ act: [[0, 1], [1, 3]], dim: [[0, 2], [1, 2]] }), { rows: ['nxt', 'pre'], cols: [0, 1, 2, 3, 4] })] },
      { kind: 'result', title: ['Constant time anywhere — if you are already there', '任何位置都是常数时间——前提是你已经在那里'],
        body: ['Insertion and removal cost **O(1)** wherever they happen. What a list cannot do is jump: reaching the k-th element takes k steps. So lists suit problems where you ==hold the element== you want to move — queues of people, undo histories, the adjacency lists of a graph — and arrays suit problems that ask for positions.', '无论在哪里，插入和删除都是 **O(1)**。链表做不到的是跳跃：到达第 k 个元素要走 k 步。所以链表适合==手里已经有那个元素==的问题——排队、撤销记录、图的邻接表——而需要按位置访问的问题适合数组。'] },
    ],
    flow: [
      { id: 'init', kind: 'start', text: ['link 0 → 1 → 2 → … → n → 0', '连成 0 → 1 → 2 → … → n → 0'] },
      { id: 'more', kind: 'test', text: ['operations left ?', '还有操作 ？'], no: 'done', on: [] },
      { id: 'cut', text: ['cut x:   nxt[pre[x]] = nxt[x];   pre[nxt[x]] = pre[x]', '取出 x：nxt[pre[x]] = nxt[x]；pre[nxt[x]] = pre[x]'] },
      { id: 'op', kind: 'test', text: ['is it "move x after y" ?', '是“把 x 移到 y 后面”吗 ？'], no: 'more', on: [] },
      { id: 'own', text: ['nxt[x] = nxt[y];   pre[x] = y', 'nxt[x] = nxt[y]；pre[x] = y'] },
      { id: 'in', text: ['pre[nxt[y]] = x;   nxt[y] = x', 'pre[nxt[y]] = x；nxt[y] = x'], next: 'more' },
      { id: 'done', kind: 'end', text: ['print by following nxt from 0 back to 0', '从 0 出发沿 nxt 走回 0，依次输出'] },
    ],
  },

  'sweep-line': {
    story: [
      { kind: 'naive', title: ['Start simple: add up the areas', '先从最简单的做起：把面积加起来'],
        body: ['Two rectangles of area 12 and 9 that overlap in a 2 × 2 square cover 12 + 9 − 4 = 17, not 21. With many rectangles you would have to correct for every pair, then every triple, … Or paint every unit square of the plane — but coordinates go up to a million.', '面积为 12 和 9 的两个矩形如果有一块 2 × 2 的重叠，它们覆盖的是 12 + 9 − 4 = 17，而不是 21。矩形多了以后，要修正每两个的重叠，再修正每三个的……或者把平面上的每个单位方格都涂一遍——可坐标最大有一百万。'],
        fig: () => [grid('two rectangles: the number in each square says how many cover it', [['', '', 1, 1, 1], [1, 1, 2, 2, 1], [1, 1, 2, 2, 1], [1, 1, 1, 1, '']], gt({ vis: [[0, 2], [0, 3], [0, 4], [1, 0], [1, 1], [1, 4], [2, 0], [2, 1], [2, 4], [3, 0], [3, 1], [3, 2], [3, 3]], bad: [[1, 2], [1, 3], [2, 2], [2, 3]] }), { sq: true })] },
      { kind: 'insight', title: ['Between two edges, nothing changes', '在两条边之间，什么都不变'],
        body: ['Slide a vertical line from left to right. What it crosses changes ==only at a left or a right edge== of some rectangle. So cut the plane into vertical strips at those x-coordinates: inside a strip the covered height is constant, and the strip contributes `height × width`.', '让一条竖直线从左向右滑动。它穿过的东西==只在某个矩形的左边或右边处==发生变化。所以按这些 x 坐标把平面切成一条条竖直的带：在一条带内部，被覆盖的高度是不变的，这条带贡献的面积就是 `高度 × 宽度`。'],
        fig: () => [grid('strips between the edges at x = 0, 2, 4, 5', [['', '', 1, 1, 1], [1, 1, 2, 2, 1], [1, 1, 2, 2, 1], [1, 1, 1, 1, '']], gt({ cmp: col(0, 1, 3).concat(col(1, 1, 3)), act: col(2, 0, 3).concat(col(3, 0, 3)), alt: col(4, 0, 2) }), { sq: true, cols: [0, 1, 2, 3, 4] })] },
      { kind: 'how', title: ['Edges are events: +1 on the left, −1 on the right', '边就是事件：左边 +1，右边 −1'],
        body: ['Compress the y-coordinates and keep a ==cover count for each y-interval==. Sort all edges by x. For each one, first add `covered height × (x − previous x)` to the area — the strip just crossed — then apply the edge: a left edge adds 1 to the intervals of its rectangle, a right edge subtracts 1. An interval is covered while its count is positive.', '把 y 坐标离散化，为==每个 y 小区间保存一个覆盖次数==。把所有的边按 x 排序。对每条边，先把 `被覆盖的高度 × (x − 上一个 x)` 加到面积里——这是刚扫过的那条带——再处理这条边：左边让它的矩形所占的小区间加 1，右边让它们减 1。计数为正的小区间就是被覆盖的。'] },
      { kind: 'result', title: ['A 2-D problem becomes a row of 1-D problems', '二维问题变成一排一维问题'],
        body: ['2n events, each scanning at most 2n intervals: **O(n²)** — fine for a few thousand rectangles and independent of how large the coordinates are. Replace the scan by a ==segment tree== over the y-intervals and each event costs O(log n): **O(n log n)**, the standard contest solution. The sweeping idea itself reappears everywhere: closest pair of points, segment intersections, skyline problems.', '共 2n 个事件，每个事件最多扫描 2n 个小区间：**O(n²)**——几千个矩形没有问题，而且与坐标的大小无关。把这次扫描换成 y 小区间上的==线段树==，每个事件只需 O(log n)：**O(n log n)**，这是竞赛中的标准解法。扫描线的思想本身随处可见：最近点对、线段求交、天际线问题。'] },
    ],
    flow: [
      { id: 'ys', kind: 'start', text: ['sort and deduplicate the y-coordinates', '把 y 坐标排序并去重'] },
      { id: 'sort', text: ['make two events per rectangle;   sort them by x', '每个矩形生成两个事件；按 x 排序'] },
      { id: 'loop', kind: 'test', text: ['events left ?', '还有事件 ？'], no: 'done', on: [] },
      { id: 'strip', text: ['area += (covered height) × (x − last);   last = x', 'area += 被覆盖的高度 × (x − last)；last = x'] },
      { id: 'apply', text: ['add +1 or −1 to the y-intervals of the edge', '给这条边对应的 y 小区间加上 +1 或 −1'], next: 'loop' },
      { id: 'done', kind: 'end', text: ['print area', '输出 area'] },
    ],
  },
}
