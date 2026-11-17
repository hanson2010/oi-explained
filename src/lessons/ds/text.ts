import type { L } from '../../engine/types'
import type { Prose } from '../extras'

/** The problem each lesson solves, why the method works, and common mistakes. */
export const TEXT: Record<string, Prose> = {
  stack: {
    problem: ['Given a string of brackets ( ) [ ] { }, decide whether it is balanced: every opening bracket is closed by a bracket of the same kind, in the correct nested order.', '给定一个由 ( ) [ ] { } 组成的字符串，判断它是否匹配：每个左括号都被同种的右括号闭合，并且嵌套顺序正确。'],
    why: ['Read the string from left to right. An opening bracket cannot be judged yet — remember it. A closing bracket must close the most recent opening bracket that is still open; any older one would mean two pairs crossing each other, like ( [ ) ]. "Most recent still open" is exactly what a stack gives you: the last thing pushed is the first thing popped. So push opening brackets, and for each closing bracket pop one and check that the kinds agree. The string is balanced if no check fails, the stack is never empty when a pop is needed, and the stack is empty at the end.', '从左到右读字符串。左括号暂时无法判断——先记下来。右括号必须闭合“最近的、仍未闭合的”那个左括号；如果闭合的是更早的，就意味着两对括号交叉了，比如 ( [ ) ]。“最近且仍未闭合”正是栈所提供的：最后压入的最先弹出。所以左括号入栈；遇到右括号就弹出一个，并检查种类是否相同。如果没有检查失败、需要弹出时栈不为空、并且结束时栈为空，这个字符串就是匹配的。'],
    pitfalls: [
      ['Calling top() or pop() on an empty stack is undefined behaviour — test empty() first.', '对空栈调用 top() 或 pop() 是未定义行为——要先判断 empty()。'],
      ['Counting opening and closing brackets is not enough: "(]" and ")(" have equal counts.', '只统计左右括号的数量是不够的：“(]” 和 “)(” 数量也相等。'],
      ['Forgetting the final emptiness check accepts "((".', '忘记最后检查栈是否为空，会把 “((” 判为合法。'],
    ],
  },
  'bt-traversal': {
    problem: ['A binary tree with n nodes is given by the left and right child of each node. Print its pre-order, in-order and post-order traversals.', '给出一棵 n 个结点的二叉树（每个结点的左孩子和右孩子），输出它的前序、中序和后序遍历。'],
    why: ['A binary tree is defined recursively: a root with a left subtree and a right subtree, each of which is again a binary tree (possibly empty). A traversal follows the same shape: handle the root, traverse the left subtree, traverse the right subtree. The only freedom is when the root is handled relative to the two recursive calls — before both (pre-order), between them (in-order) or after both (post-order). The left subtree is always finished before the right one starts. That single choice determines properties that matter later: pre-order lists ancestors before descendants, post-order lists children before parents (useful for tree DP), and in-order on a search tree lists the keys in sorted order.', '二叉树是递归定义的：一个根，加上左子树和右子树，而它们各自又是二叉树（可能为空）。遍历遵循同样的结构：处理根、遍历左子树、遍历右子树。唯一可以选择的是根相对于两次递归调用的位置——在两者之前（前序）、之间（中序）还是之后（后序）。左子树总是在右子树开始之前处理完。这一个选择决定了以后很重要的性质：前序中祖先排在后代之前；后序中孩子排在父亲之前（树形 DP 正需要这个顺序）；对二叉搜索树做中序遍历，会按顺序输出键值。'],
    pitfalls: [
      ['Without the "empty node" check the recursion follows child 0 forever.', '没有“空结点”的判断，递归会沿着 0 号孩子无限进行下去。'],
      ['On a degenerate tree (a chain of 10⁵ nodes) the recursion depth is 10⁵ — mind the stack limit.', '在退化的树（10⁵ 个结点连成一条链）上，递归深度达 10⁵——注意栈空间限制。'],
      ['Pre-order plus post-order does not determine the tree uniquely; in-order is needed.', '只有前序和后序不能唯一确定一棵树；必须有中序。'],
    ],
  },
  huffman: {
    problem: ['Given n weights, build a binary tree with one leaf per weight that minimises the sum of weight × depth over all leaves. Print that minimum.', '给定 n 个权值，构造一棵以它们为叶子的二叉树，使所有叶子的“权值 × 深度”之和最小。输出这个最小值。'],
    why: ['Depth is expensive, so heavy leaves should be shallow and light leaves deep. In an optimal tree the two lightest leaves can always be arranged as siblings at the deepest level: if a heavier leaf were deeper than a lighter one, swapping them would not increase the cost. Once those two are siblings, treat their parent as a single leaf whose weight is their sum — the problem is the same with one leaf fewer. Repeating this gives the algorithm: take the two smallest, merge, put the sum back. Each merge pushes every leaf beneath it one level deeper, which adds exactly the merged sum to the cost, so the answer is the total of all merge sums. A min-heap delivers the two smallest in O(log n).', '深度是有代价的，所以重的叶子应该浅、轻的叶子应该深。在最优的树中，最轻的两个叶子总可以安排成最深层的一对兄弟：如果某个较重的叶子比较轻的叶子更深，交换它们不会使代价增加。一旦这两个叶子成为兄弟，就可以把它们的父亲看作一个权值为两者之和的叶子——问题不变，只是叶子少了一个。如此重复就得到算法：取出最小的两个，合并，把和放回去。每次合并会让它下方的所有叶子加深一层，代价恰好增加合并得到的和，所以答案就是所有合并之和的总和。用小根堆可以在 O(log n) 内取出最小的两个。'],
    pitfalls: [
      ['priority_queue is a max-heap by default; forgetting greater<> merges the two largest.', 'priority_queue 默认是大根堆；忘了写 greater<> 就变成合并最大的两个。'],
      ['Sums grow fast — use long long.', '和增长得很快——要用 long long。'],
      ['Sorting once and merging neighbours is wrong: a merged sum may no longer be among the smallest.', '只排一次序然后依次合并相邻的两个是错的：合并出的和可能已经不是最小的了。'],
    ],
  },
  bst: {
    problem: ['Insert n keys one by one into an initially empty binary search tree, then print the keys in ascending order.', '把 n 个键值依次插入一棵初始为空的二叉搜索树，然后按升序输出所有键值。'],
    why: ['A binary search tree keeps one rule at every node: all keys in the left subtree are smaller, all keys in the right subtree are larger. This rule turns the tree into a decision procedure. To locate a key, compare it with the root and you immediately know which subtree could contain it; repeat there. Inserting follows the same path and attaches the new key where the path leaves the tree, which preserves the rule. Printing the left subtree, then the node, then the right subtree visits the keys in increasing order. Every operation costs the height of the tree — about log₂ n when keys arrive in random order, but n when they arrive sorted, because then every key goes to the right of the previous one.', '二叉搜索树在每个结点上都保持一条规则：左子树的所有键值都更小，右子树的所有键值都更大。这条规则把树变成了一个判定过程。要定位一个键值，把它与根比较，立刻就知道它只可能在哪棵子树里；到那里再重复。插入沿着同样的路径走，在走出树的位置挂上新键值，规则依然成立。先输出左子树、再输出结点、最后输出右子树，就按升序访问了所有键值。每个操作的代价是树的高度——键值随机到达时约为 log₂ n，但如果键值有序到达，每个键值都接在前一个的右边，高度就是 n。'],
    pitfalls: [
      ['Passing the node index by value instead of by reference: the new node is never linked to its parent.', '结点下标按值传递而不是按引用传递：新结点永远接不到父结点上。'],
      ['Sorted input makes a plain BST O(n²) overall; real solutions use a balanced tree or std::set.', '有序的输入会让普通 BST 整体退化为 O(n²)；实战中要用平衡树或 std::set。'],
      ['Decide what to do with equal keys (ignore, count, or always go right) and do it consistently.', '要想清楚相等的键值怎么处理（忽略、计数或一律往右），并保持一致。'],
    ],
  },
  'monotonic-queue': {
    problem: ['Given n numbers and a window length k, print the maximum of every k consecutive elements as the window slides from left to right.', '给定 n 个数和窗口长度 k，窗口从左向右滑动，输出每个长度为 k 的窗口中的最大值。'],
    why: ['Recomputing each window from scratch costs O(n · k). The saving comes from noticing that some elements are useless. Suppose a newer element is at least as large as an older one. The older one will leave the window first, and until then the newer one is in the window too and is no smaller — so the older one can never again be the maximum. Discard it. What remains is a list of candidates whose values strictly decrease from oldest to newest, and the oldest surviving candidate is the current maximum. New elements enter at the back after removing dominated ones; expired elements leave at the front. Each index enters once and leaves once, so the total cost is O(n) regardless of k.', '每个窗口都从头计算，代价是 O(n · k)。优化来自这样的观察：有些元素是没用的。假设一个较新的元素不小于某个较旧的元素。较旧的那个会先离开窗口，而在那之前较新的元素也在窗口里，并且不比它小——所以较旧的元素再也不可能成为最大值，可以直接丢掉。剩下的是一列候选者，它们的值从旧到新严格递减，最旧的那个候选者就是当前最大值。新元素先把被它“支配”的元素从队尾删掉，再从队尾进入；过期的元素从队首离开。每个下标只进一次、出一次，所以无论 k 多大，总代价都是 O(n)。'],
    pitfalls: [
      ['Storing values instead of indices: you can no longer tell when the front has left the window.', '队列中存值而不存下标：就无法判断队首何时离开了窗口。'],
      ['Expiry test off by one: the window ending at i covers indices i − k + 1 … i.', '过期判断差一：以 i 结尾的窗口覆盖下标 i − k + 1 … i。'],
      ['For window minima flip the comparison; do not just negate the output.', '求窗口最小值时要把比较方向反过来；不要只是把输出取反。'],
    ],
  },
  'sparse-table': {
    problem: ['Given n numbers that never change and q queries, each asking for the maximum of the elements from position l to r, answer every query in constant time.', '给定 n 个不会改变的数和 q 个询问，每个询问求第 l 个到第 r 个元素的最大值，要求每次询问 O(1) 回答。'],
    why: ['Precomputing the answer for all n² ranges is too much. Precompute only the ranges whose length is a power of two: for each start i and each j, the maximum of the 2ʲ elements beginning at i. There are n log n of them, and each is the maximum of two already computed halves of length 2ʲ⁻¹. Now take any query [l, r] of length len and let 2ᵏ be the largest power of two not exceeding len. One block of length 2ᵏ starting at l and another ending at r together cover the whole range, because 2 · 2ᵏ > len. They overlap in the middle, but taking a maximum twice over some elements does no harm. So two table lookups answer the query.', '预处理全部 n² 个区间的答案太多了。只预处理长度是 2 的幂的区间：对每个起点 i 和每个 j，求从 i 开始的 2ʲ 个元素的最大值。这样的区间只有 n log n 个，而且每个都等于两个已经算好的、长度为 2ʲ⁻¹ 的半区间的最大值。现在任取一个长度为 len 的询问 [l, r]，设 2ᵏ 是不超过 len 的最大的 2 的幂。一个从 l 开始、长为 2ᵏ 的块，和另一个到 r 结束、长为 2ᵏ 的块，合起来就覆盖了整个区间，因为 2 · 2ᵏ > len。它们在中间重叠，但对某些元素重复取最大值并没有坏处。于是查两次表就回答了询问。'],
    pitfalls: [
      ['It works for max, min, gcd, and, or — not for sum: the overlap would count elements twice.', '它适用于 max、min、gcd、按位与、按位或——但不适用于求和：重叠部分会被重复计算。'],
      ['Computing log2 with floating point can be off by one; precompute an integer lg[] table.', '用浮点数计算 log2 可能差一；应预处理整数的 lg[] 表。'],
      ['The table cannot be updated; if values change, use a segment tree.', 'ST 表不支持修改；如果数值会变，要用线段树。'],
    ],
  },
  dsu: {
    problem: ['There are n elements, each initially in its own set. Process operations of two kinds: merge the sets containing x and y; or ask whether x and y are in the same set.', '有 n 个元素，初始时各自在一个集合中。处理两种操作：合并 x 和 y 所在的集合；或询问 x 和 y 是否在同一个集合。'],
    why: ['Give every set a representative, and let every element point (directly or through others) to it. Each set then forms a tree whose root is the representative. Two elements are in the same set exactly when following the pointers from each leads to the same root. Merging two sets is a single assignment: make one root point to the other. The danger is long chains, which make "follow the pointers" slow. Path compression removes them as a side effect of searching: once the root has been found, every element on the path is re-pointed straight at it. After that, searches from any of those elements take one step. The amortised cost per operation becomes practically constant.', '给每个集合选一个代表，让每个元素（直接或间接地）指向它。每个集合于是构成一棵树，树根就是代表。两个元素在同一集合，当且仅当沿着指针走最终到达同一个根。合并两个集合只需要一次赋值：让一个根指向另一个根。危险在于长链，它会让“沿指针走”变慢。路径压缩在查找的同时顺便消除长链：找到根之后，把路径上的每个元素都直接指向根。此后从这些元素出发的查找都只需一步。每次操作的均摊代价因此几乎是常数。'],
    pitfalls: [
      ['Writing fa[x] = y instead of fa[find(x)] = find(y) detaches x from the rest of its set.', '把 fa[find(x)] = find(y) 写成 fa[x] = y，会把 x 从它原来的集合里拆出来。'],
      ['Forgetting to initialise fa[i] = i: everything starts in set 0.', '忘记初始化 fa[i] = i：所有元素一开始都在 0 号集合里。'],
      ['A DSU can merge but not split; "undo" needs a different technique.', '并查集只能合并不能拆分；需要“撤销”时要用别的技巧。'],
    ],
  },
  fenwick: {
    problem: ['Maintain an array under two operations: add v to the element at position i; and report the sum of the elements from position l to r.', '维护一个数组，支持两种操作：给第 i 个元素加上 v；查询第 l 个到第 r 个元素之和。'],
    why: ['A plain array updates in O(1) but sums in O(n); a prefix-sum array sums in O(1) but updates in O(n). The Fenwick tree balances the two at O(log n) each. Cell c[i] stores the sum of a block of elements ending at i whose length is lowbit(i), the lowest set bit of i. Then any prefix 1..i splits into blocks following the binary digits of i: take c[i], remove the lowest bit of i, take the next block, and so on — at most log n blocks. In the other direction, the blocks that contain position i are found by repeatedly adding the lowest bit, again at most log n of them, and those are the cells an update must change. The whole structure is one array and two three-line loops.', '普通数组修改是 O(1)，求和却是 O(n)；前缀和数组求和是 O(1)，修改却是 O(n)。树状数组在两者之间取得平衡，都是 O(log n)。c[i] 保存以 i 结尾、长度为 lowbit(i)（i 的最低位的 1）的一段元素之和。于是任何前缀 1..i 都能按 i 的二进制位拆成若干段：取 c[i]，去掉 i 的最低位，再取下一段，如此继续——最多 log n 段。反过来，包含位置 i 的那些段可以通过不断加上最低位找到，同样最多 log n 个，它们就是修改时需要更新的格子。整个结构只是一个数组和两个三行的循环。'],
    pitfalls: [
      ['Indices must start at 1: lowbit(0) = 0 makes the update loop run forever.', '下标必须从 1 开始：lowbit(0) = 0 会让修改的循环永不结束。'],
      ['The update loop bound is the array size n, not the value being added.', '修改循环的上界是数组大小 n，而不是所加的值。'],
      ['A range sum needs sum(r) − sum(l − 1), not sum(l).', '区间和是 sum(r) − sum(l − 1)，不是减 sum(l)。'],
    ],
  },
  'segment-tree': {
    problem: ['Maintain an array under two operations: add v to every element from position l to r; and report the sum of the elements from position l to r.', '维护一个数组，支持两种操作：给第 l 个到第 r 个元素都加上 v；查询第 l 个到第 r 个元素之和。'],
    why: ['Build a binary tree over the positions: the root is responsible for the whole array, its children for the two halves, and so on down to single elements. Each node stores the sum of its interval. Any range [l, r] can be assembled from O(log n) nodes that lie completely inside it, so a query adds up a handful of stored sums. A range update would have to change every node below those — too many. The lazy tag avoids that: at a node completely inside the update range, fix its own sum (add v times its length), write down "v still has to be added to everything below", and return. The debt is paid later, one level at a time, only when some operation actually needs to enter that node\'s children.', '在位置上建一棵二叉树：根负责整个数组，它的两个孩子各负责一半，依此类推直到单个元素。每个结点保存它所负责区间的和。任意区间 [l, r] 都能由 O(log n) 个完全落在其中的结点拼成，所以查询只需把几个已存的和加起来。但区间修改需要改动这些结点下面的所有结点——太多了。懒标记避免了这一点：在完全落入修改区间的结点处，更新它自己的和（加上 v 乘以区间长度），记下“下面的结点还欠着加 v”，然后直接返回。这笔账以后再还，而且每次只下传一层——只有当某个操作确实需要进入该结点的孩子时才下传。'],
    pitfalls: [
      ['The arrays need 4n cells, not 2n.', '数组要开 4n，而不是 2n。'],
      ['Forgetting to push the tag down before descending — in update and in query — gives wrong sums.', '往下走之前忘记下传标记——修改和查询都要下传——会得到错误的和。'],
      ['Forgetting to recompute the node from its children on the way back.', '回溯时忘记用孩子重新计算本结点。'],
      ['The tag changes the sum by v × (length of the interval), not by v.', '标记对和的影响是 v ×（区间长度），而不是 v。'],
    ],
  },
  trie: {
    problem: ['Given n words and q queries, tell for each query how many of the words begin with it.', '给定 n 个单词和 q 个查询串，对每个查询串回答有多少个单词以它开头。'],
    why: ['Comparing each query against every word is far too slow. A trie stores the words so that common beginnings are stored only once: the root stands for the empty string, and each edge adds one letter, so every node is a prefix of at least one word. All words that begin with a given prefix pass through the node of that prefix. If every node counts how many inserted words passed through it, the answer to a query is simply the counter of the node reached by spelling out the query — or zero if the path does not exist. Insertion and lookup both take time proportional to the length of the string, however many words are stored.', '把每个查询与每个单词逐一比较太慢了。字典树把单词存成这样的形式：公共的开头只存一份。根代表空串，每条边添加一个字母，所以每个结点都是至少一个单词的前缀。所有以某个前缀开头的单词都会经过这个前缀对应的结点。如果每个结点统计有多少个插入的单词经过了它，那么查询的答案就是按查询串走到的结点上的计数——如果路径不存在则为零。插入和查询的时间都与字符串长度成正比，与已存入多少单词无关。'],
    pitfalls: [
      ['The node array must be sized by the total number of letters, not by the number of words.', '结点数组的大小要按字符总数来开，而不是按单词个数。'],
      ['Node 0 is both the root and "no child"; that is safe only because no edge ever leads back to the root.', '0 号结点既是根又表示“没有孩子”；这之所以安全，只是因为没有任何边会指回根。'],
      ['To count whole words rather than prefixes, keep a separate end-of-word counter.', '若要统计完整的单词而不是前缀，需要另外维护一个“单词结束”的计数。'],
    ],
  },
  treap: {
    problem: ['Insert n keys into a search tree that stays balanced even when the keys arrive in sorted order, then print them in ascending order.', '把 n 个键值插入一棵即使键值有序到达也能保持平衡的搜索树，然后按升序输出。'],
    why: ['A binary search tree built from keys in random order is shallow with overwhelming probability; the trouble is that the input order is not ours to choose. A treap makes the shape independent of the input order. Each node receives a random priority, and the tree must satisfy two rules at once: search-tree order on the keys and heap order on the priorities. Those two rules determine the shape completely — it is the tree you would get by inserting the keys in decreasing order of priority, which is a random order. To keep both rules, insert as in an ordinary search tree and then rotate the new node upward while its priority beats its parent\'s. A rotation changes which node is the parent but not the left-to-right order of the keys.', '按随机顺序插入键值建成的二叉搜索树，以极大的概率是很浅的；麻烦在于输入的顺序由不得我们选择。Treap 让树的形态与输入顺序无关。每个结点得到一个随机的优先级，树必须同时满足两条规则：键值满足搜索树的顺序，优先级满足堆的顺序。这两条规则完全确定了树的形态——它就是按优先级从大到小的顺序插入键值所得到的树，而这是一个随机的顺序。为了同时维持两条规则，先按普通搜索树的方式插入，然后只要新结点的优先级高于父亲，就把它往上旋转。旋转改变的是谁做父亲，而不改变键值从左到右的顺序。'],
    pitfalls: [
      ['Mixing up the two rotations: a left child rises by a right rotation and vice versa.', '把两种旋转弄混：左孩子要靠右旋上升，右孩子靠左旋上升。'],
      ['The rotation functions must take the node by reference, or the parent keeps pointing at the old root of the subtree.', '旋转函数必须按引用接收结点，否则父结点仍然指向子树原来的根。'],
      ['On some platforms rand() returns at most 32767; with many nodes, priorities collide and balance suffers.', '在某些平台上 rand() 最大只有 32767；结点很多时优先级大量重复，平衡性变差。'],
    ],
  },
  'sqrt-decomposition': {
    problem: ['Maintain an array under two operations: add v to every element from position l to r; and report the sum of the elements from position l to r.', '维护一个数组，支持两种操作：给第 l 个到第 r 个元素都加上 v；查询第 l 个到第 r 个元素之和。'],
    why: ['Handling every element separately is O(n) per operation. Group the positions into consecutive blocks and keep one summary per block. A range then consists of some whole blocks in the middle and at most two incomplete blocks at the ends. A whole block is handled through its summary in O(1); an incomplete block is handled element by element. With blocks of size B there are at most n/B whole blocks and at most 2B loose elements, so the cost per operation is about n/B + 2B. That is smallest when the two terms are equal, B ≈ √n, giving O(√n). This balancing argument is the real lesson: split the work into two kinds and choose the parameter that makes them cost the same.', '每个元素单独处理，每次操作是 O(n)。把位置按顺序分成若干连续的块，每块维护一份汇总信息。一个区间于是由中间的若干整块和两端至多两个不完整的块组成。整块通过汇总信息 O(1) 处理；不完整的块逐个元素处理。块长为 B 时，整块至多 n/B 个，零散元素至多 2B 个，所以每次操作的代价约为 n/B + 2B。当两项相等，即 B ≈ √n 时最小，得到 O(√n)。这种平衡的思想才是真正要学的东西：把工作分成两类，选一个参数让它们的代价相等。'],
    pitfalls: [
      ['When l and r fall in the same block, the "left end" and "right end" loops must not both run.', '当 l 和 r 落在同一块时，“左端”和“右端”两个循环不能都执行。'],
      ['A query on loose elements must add the block\'s tag to each element.', '查询零散元素时，每个元素都要加上所在块的标记。'],
      ['The last block may be shorter than B.', '最后一块可能不足 B 个元素。'],
    ],
  },
  'leftist-heap': {
    problem: ['Push n numbers into a heap one at a time and then pop them all in ascending order, using a heap in which two heaps can be merged in O(log n).', '把 n 个数逐个插入堆，再按升序全部弹出；要求使用一种能在 O(log n) 内合并两个堆的堆。'],
    why: ['A binary heap in an array cannot be merged with another one faster than rebuilding. A leftist heap is a heap-ordered binary tree that is deliberately lopsided: at every node the left subtree is the "deeper" one, measured by dist — the length of the shortest downward path to a missing child. That makes the path that always goes right the shortest way down, and so at most log(n + 1) nodes long. Merging works only along those short right paths: keep the smaller of the two roots on top and merge the other heap into its right subtree, recursively. On the way back, if a right subtree has become deeper than the left one, swap the two children. Pushing is merging with a one-node heap; popping is merging the root\'s two subtrees.', '用数组存储的二叉堆无法比重建更快地与另一个堆合并。左偏树是一棵满足堆序的二叉树，并且故意长得“偏”：在每个结点处，左子树是“更深”的那一个，这里的深度用 dist 衡量——向下走到空结点的最短路径长度。这样一来，一直往右走的路径就是向下最短的路，所以至多 log(n + 1) 个结点。合并只沿着这些很短的右链进行：两个根中较小的留在上面，把另一个堆递归地合并进它的右子树。回溯时，如果右子树变得比左子树更深，就交换两个孩子。插入就是与单结点的堆合并；弹出就是合并根的两棵子树。'],
    pitfalls: [
      ['dist of an empty tree must be 0 (and of a single node 1), or the swap test misfires.', '空树的 dist 必须为 0（单个结点为 1），否则交换的判断会出错。'],
      ['Forgetting to update dist after the possible swap.', '可能交换之后忘记更新 dist。'],
      ['A leftist heap is not balanced: its left spine can be n long. Only merge along the right.', '左偏树并不平衡：它的左链可能长达 n。只能沿右链合并。'],
    ],
  },
  'linked-list': {
    problem: ['Keep a sequence of elements while elements are removed and moved to other places, each operation in constant time. Print the sequence at the end.', '维护一个元素序列，其间不断有元素被删除或被移到别处，每个操作都要在常数时间内完成。最后输出这个序列。'],
    why: ['In an array, order is position: taking an element out of the middle leaves a hole, and everything behind it must move up — up to n steps. A linked list stores order differently. Each element records who comes after it and who comes before it, and the sequence is whatever you get by following those links. Then removing x needs no shifting at all: its predecessor is told to point past it, and its successor to point back past it. Inserting x after y is the reverse: x takes y and the old successor of y as neighbours, and those two are told about x. Either way only the few elements involved are touched. The price is that there is no "element number k" any more: to reach a place you must walk there, or already hold the element. Here the elements are the numbers 1 … n, so two arrays indexed by the element are the whole structure.', '在数组里，顺序就是位置：从中间取走一个元素会留下一个空位，后面的元素都要往前挪——最多 n 步。链表用另一种方式保存顺序。每个元素记下谁在它后面、谁在它前面，沿着这些指针走出来的就是整个序列。这样删除 x 完全不需要挪动：让它的前驱绕过它指向后面，让它的后继绕过它指向前面。把 x 插到 y 后面则正好相反：x 把 y 和 y 原来的后继当作邻居，再告诉这两个邻居有了 x。两种操作都只碰到相关的几个元素。代价是不再有“第 k 个元素”这种说法：要到达某个位置只能走过去，或者手里已经有那个元素。这里的元素就是数 1 … n，所以两个以元素为下标的数组就是整个数据结构。'],
    pitfalls: [
      ['Changing nxt[y] before reading it loses the old successor of y. Set the links of the new element first.', '还没用到 nxt[y] 就把它改掉，会丢失 y 原来的后继。要先设置新元素自己的指针。'],
      ['Without a sentinel, the first and the last element need special cases in every operation.', '如果没有哨兵，每个操作都要对第一个和最后一个元素进行特判。'],
      ['A linked list cannot jump to the k-th element: that costs k steps. Use an array when you need positions.', '链表无法直接跳到第 k 个元素：那需要走 k 步。需要按位置访问时应使用数组。'],
    ],
  },
  'sweep-line': {
    problem: ['n rectangles with sides parallel to the axes are drawn on a plane; they may overlap. What is the total area they cover?', '平面上画有 n 个边与坐标轴平行的矩形，它们可以互相重叠。它们一共覆盖了多大的面积？'],
    why: ['Adding the areas counts overlaps twice, and correcting for every pair, triple and so on is hopeless. Instead, turn the two-dimensional question into a sequence of one-dimensional ones. Imagine a vertical line sliding from left to right. At any moment it cuts the rectangles in some set of y-intervals, and the total length of those intervals is the "covered height". That height changes only when the line reaches a left edge, where a rectangle starts, or a right edge, where one ends. Between two consecutive such events the picture under the line is constant, so the area of that strip is exactly the covered height times the width of the strip. The program therefore sorts the edges by x and processes them in order: first it adds the area of the strip that has just been crossed, then it updates the cover. The cover is stored as a count per elementary y-interval — the pieces between neighbouring y-coordinates after compression — because a rectangle always covers a whole number of those pieces. A left edge adds one to its pieces, a right edge takes one away, and a piece counts as covered while its number is positive.', '把面积直接相加会把重叠部分算两次，而要逐一修正每两个、每三个矩形的重叠是没有指望的。换个办法：把二维的问题变成一连串一维的问题。想象一条竖直线从左向右滑动。任何时刻，它被矩形截出若干段 y 区间，这些区间的总长度就是“被覆盖的高度”。这个高度只有在线到达某个矩形的左边（矩形开始）或右边（矩形结束）时才会改变。在相邻两个这样的事件之间，线下面的情况保持不变，所以这一条带的面积恰好是 被覆盖的高度 × 带的宽度。于是程序把所有的边按 x 排序并依次处理：先加上刚刚扫过的那条带的面积，再更新覆盖情况。覆盖情况按“小区间”保存——也就是离散化之后相邻两个 y 坐标之间的那些段——因为一个矩形覆盖的总是整数个这样的段。左边让它的那些段加一，右边让它们减一，计数为正的段就是被覆盖的。'],
    pitfalls: [
      ['Updating the counts before adding the strip uses the new cover for the old strip. Add the area first.', '先更新覆盖次数、再累加面积，就会用新的覆盖情况去算旧的那条带。要先加面积。'],
      ['cnt belongs to intervals, not to points: k coordinates give k − 1 intervals, and the range [lo, hi) leaves hi out.', 'cnt 对应的是区间而不是点：k 个坐标只有 k − 1 个区间，范围 [lo, hi) 不包含 hi。'],
      ['The area can exceed int: 10⁶ × 10⁶ = 10¹². Use long long.', '面积可能超出 int：10⁶ × 10⁶ = 10¹²。要用 long long。'],
      ['Recomputing the covered height in a loop costs O(n) per event. For n = 10⁵ rectangles, keep the counts in a segment tree that stores the covered length of each node.', '每个事件都用循环重新计算被覆盖的高度，代价是 O(n)。n = 10⁵ 个矩形时，要用线段树维护覆盖次数，并在每个结点保存被覆盖的长度。'],
    ],
  },
  'hash-table': {
    problem: ['Numbers as large as a billion arrive one at a time. In between come questions: has this number been seen before? Answer each at once.', '一个个最大可达十亿的数陆续到来。其间穿插着询问：这个数之前出现过吗？每个询问都要立刻回答。'],
    why: ['An array indexed by the number itself would answer in one step, but it would need a billion cells. A sorted structure answers in log n steps. A hash table gets close to the one-step answer with memory proportional to the number of keys. The trick is to compress the key into a small index with a simple function — here the remainder x mod M — and to store the key in the bucket with that index. To look a key up, compute the same remainder and look only in that bucket. Two different keys can have the same remainder; that is a collision, and by the pigeonhole principle it must happen as soon as there are more keys than buckets (and in practice much earlier). Chaining deals with it plainly: every bucket holds a short linked list of all the keys that landed there, and a search walks that list comparing the real keys. If M is about as large as the number of keys, and the function spreads them evenly, the lists have about one element each.', '以数本身为下标的数组一步就能回答，但需要十亿个格子。有序的数据结构需要 log n 步。哈希表用与关键字个数成正比的内存，做到了接近一步回答。诀窍是用一个简单的函数把关键字压缩成一个小的下标——这里是余数 x mod M——再把关键字存进这个下标对应的桶里。查找时把同样的余数再算一遍，只看那一个桶。两个不同的关键字可能有相同的余数，这叫冲突；由抽屉原理，只要关键字比桶多就必然发生（实际上会发生得更早）。拉链法的处理很直接：每个桶里是一条短短的链表，保存所有落到这里的关键字，查找时沿着这条链逐个比较真正的关键字。如果 M 与关键字的个数差不多大，并且哈希函数把它们散布得足够均匀，每条链平均只有一个元素。'],
    pitfalls: [
      ['Comparing only the bucket numbers reports a key as present when a different key collided with it. Always compare the keys.', '只比较桶的编号，会把与之冲突的另一个关键字误判为它本身。一定要比较关键字。'],
      ['A negative x gives a negative remainder in C++. Use (x % M + M) % M when keys can be negative.', '在 C++ 中，负数 x 的余数是负的。关键字可能为负时要写 (x % M + M) % M。'],
      ['M = 1000 or a power of two keeps only the last digits or bits of the key; patterned data then piles up in a few buckets. Choose a prime.', 'M 取 1000 或 2 的幂时，只用到了关键字的末几位数字或二进制位；有规律的数据会挤在少数几个桶里。应当取质数。'],
      ['In the worst case every key lands in one bucket and each operation costs O(n). Contest data is sometimes built to do exactly that to a known hash function.', '最坏情况下所有关键字都落在同一个桶里，每次操作要 O(n)。竞赛数据有时会专门针对某个已知的哈希函数构造这种情况。'],
    ],
  },
  'persistent-seg': {
    problem: ['Given an array, answer many questions of the form: what is the k-th smallest number among a[l], …, a[r]?', '给定一个数组，回答许多个这样的询问：a[l], …, a[r] 中第 k 小的数是多少？'],
    why: ['Sorting the range for every question costs far too much. Suppose instead there were a counting segment tree over the values of exactly the elements a[l..r]: a node covering some range of values would know how many of the elements lie in it. Then the k-th smallest is found by one walk from the root: if the left half holds at least k elements the answer is there, otherwise it is on the right and is number k minus that count. Such a tree cannot be built for every range — but it can be obtained by subtraction. Insert the elements one by one into a counting tree and keep every intermediate tree; call the tree after i insertions version i. The counts of version r minus the counts of version l − 1 are the counts of a[l..r], at every node, because all versions have the same shape. Keeping n whole trees would need n² memory. But an insertion changes the counts along one root-to-leaf path only. So a new version consists of log n new nodes, one per level, each pointing to one new child and to one child that still belongs to the old version. All versions together use n log n nodes. This idea — never modify, copy the path — is called persistence.', '每个询问都把区间排一遍序，代价太大了。假设有一棵计数线段树，恰好只统计了 a[l..r] 这些元素的数值：每个结点管一段数值范围，并且知道有多少个元素落在其中。那么从根往下走一趟就能找到第 k 小：如果左半边至少有 k 个元素，答案就在左边；否则在右边，并且是那里的第“k 减去左边个数”小。不可能为每个区间都建这样一棵树——但可以用减法得到它。把元素一个个插入一棵计数线段树，并保留每一步之后的树；插入 i 个元素之后的树叫做第 i 个版本。由于所有版本的形状完全相同，第 r 个版本的计数减去第 l − 1 个版本的计数，在每个结点上都恰好是 a[l..r] 的计数。保存 n 棵完整的树需要 n² 的空间。但是一次插入只改变从根到某个叶子的一条路径上的计数。所以一个新版本只由 log n 个新结点组成，每层一个，每个新结点指向一个新的儿子和一个仍属于旧版本的儿子。所有版本加起来只用 n log n 个结点。这种“从不修改，只复制路径”的思想叫做可持久化。'],
    pitfalls: [
      ['The node arrays need about n · (log₂ n + 2) cells, not 4n as for an ordinary segment tree.', '结点数组大约要开 n · (log₂ n + 2) 的大小，而不是普通线段树的 4n。'],
      ['Modifying the old node in place destroys every version that shares it. Always create the new node first and copy into it.', '直接修改旧结点会破坏所有共用它的版本。一定要先新建结点，再把内容复制进去。'],
      ['Subtract version l − 1, not version l: version l already contains a[l].', '要减去的是第 l − 1 个版本，而不是第 l 个：第 l 个版本已经包含了 a[l]。'],
      ['The tree is indexed by value, so compress the values first — and translate the rank found back into a value.', '这棵树以数值为下标，所以要先离散化——并且要把找到的排名再翻译回数值。'],
    ],
  },
  cdq: {
    problem: ['Each of n points has three coordinates a, b and c. Count the pairs of points in which one point is smaller than the other in all three.', 'n 个点，每个点有三个坐标 a、b、c。统计有多少对点，其中一个点的三个坐标都比另一个点小。'],
    why: ['With one coordinate the question is trivial after sorting. With two it is the inversion-counting problem: sort by a, then count with a Fenwick tree or with merge sort. The third coordinate needs one more tool, and the answer is to use both of the previous ones together. Sort by a and split the sorted sequence in half. A pair lies either inside the left half, or inside the right half, or has its smaller-a point on the left and the other on the right. The first two kinds are the same problem on half the data: recurse. For the third kind the a-condition holds automatically, because everything on the left has a smaller a than everything on the right — so a can be forgotten, and the points inside each half may be reordered freely. Reorder each half by b. Now sweep through the right half in increasing b, and before handling a right point, push into a Fenwick tree the c of every left point whose b is smaller. The tree then contains exactly the left points that beat this right point in a and b; a prefix query on c counts those that beat it in c too. The reordering by b comes for free if the recursion returns its halves sorted by b and merges them, exactly as merge sort does. Every level of the recursion handles each point once with one Fenwick operation, giving n log² n. The method works because all the questions are known in advance: it is an offline algorithm.', '只有一维时，排序之后问题就解决了。有两维时，它就是逆序对问题：按 a 排序，再用树状数组或归并排序统计。第三维还需要一件工具，而答案是把前面两种工具合在一起用。按 a 排序，把排好的序列从中间分成两半。一对点要么都在左半，要么都在右半，要么 a 较小的在左半、另一个在右半。前两种情况是数据量减半的同一个问题：递归解决。对第三种情况，a 的条件自动成立，因为左半所有点的 a 都小于右半所有点的 a——于是可以忘掉 a，两半内部的点也可以随意重排。把每一半按 b 重新排序。然后按 b 从小到大扫描右半，在处理右半的某个点之前，先把所有 b 比它小的左半的点的 c 放进树状数组。这时树状数组里恰好是在 a 和 b 上都比它小的左半的点；再对 c 做一次前缀查询，就数出了其中 c 也更小的。如果让递归在返回时把自己负责的部分按 b 排好，再像归并排序那样合并，“按 b 重排”就不需要额外的代价。递归的每一层对每个点只做一次树状数组操作，总共 n log² n。这个方法之所以可行，是因为所有的询问都事先已知：它是一种离线算法。'],
    pitfalls: [
      ['Clearing the Fenwick tree with a loop over all n cells in every call makes the whole thing n² again. Undo only what was inserted.', '每次调用都用循环把树状数组的 n 个格子全部清零，整体又会退化成 n²。只撤销插入过的那些。'],
      ['With equal coordinates the half-split no longer guarantees aᵢ < aⱼ. Identical points must be merged first, and ties in a need care in the sort order.', '如果坐标可以相等，从中间分开就不再保证 aᵢ < aⱼ。完全相同的点要先合并，a 相等时的排序顺序也要小心处理。'],
      ['Only left points may be inserted and only right points may ask: mixing them counts pairs inside one half twice.', '只有左半的点可以插入，只有右半的点可以查询：混在一起会把同一半内部的数对重复统计。'],
      ['It is offline: all points must be known before the first answer. If answers are needed immediately, a nested data structure is required.', '它是离线的：在给出第一个答案之前就必须知道所有的点。如果必须即时回答，就需要树套树这样的数据结构。'],
    ],
  },
}

/** Where each problem shows up outside contests, shown on the Problem tab. Same inline markup as the Ideas story. */
export const REAL: Record<string, L> = {
  stack: ['Your editor **underlines an unmatched bracket** as you type, and a compiler rejects `( [ ) ]`. The same stack powers the Undo button and the Back button of a browser: the last thing in is the first thing out.', '你写代码时，编辑器会给**没配对的括号**画上波浪线，编译器也会拒绝 `( [ ) ]`。撤销键和浏览器的后退键靠的是同一个栈：最后进去的最先出来。'],
  'bt-traversal': ['A **folder tree** on disk: listing a folder before its contents is a pre-order walk; computing folder sizes needs the contents first, a post-order walk. A calculator evaluates `(1 + 2) × 3` by a post-order walk of its expression tree.', '磁盘上的**文件夹树**：先列出文件夹再列出里面的内容，是先序遍历；统计文件夹大小要先算里面的内容，是后序遍历。计算器计算 `(1 + 2) × 3`，就是对表达式树做后序遍历。'],
  huffman: ['Every **ZIP file, PNG image and JPEG photo** contains Huffman codes: frequent symbols get short bit strings and rare ones long, which is where a good part of the compression comes from.', '每一个 **ZIP 压缩包、PNG 图片和 JPEG 照片**里都有哈夫曼编码：常见的符号用短的比特串，少见的用长的，压缩效果有相当一部分来自这里。'],
  bst: ['A **contacts list** that stays sorted while names are added and removed. `std::set` and `std::map` are binary search trees (kept balanced), and so are the indexes that let a database find a row without scanning the table.', '一份在不断增删的同时始终保持有序的**通讯录**。`std::set` 和 `std::map` 就是（保持平衡的）二叉搜索树，数据库不用扫全表就能找到一行，靠的索引也是这类结构。'],
  'monotonic-queue': ['A stock app showing the **highest price of the last 30 minutes**, updated every second. Recomputing over the whole window each time would waste almost all the work; the monotonic queue keeps only the prices that can still become the maximum.', '股票软件显示**最近 30 分钟的最高价**，每秒更新一次。如果每次都把整个窗口重算一遍，几乎所有工作都是浪费；单调队列只保留那些还有可能成为最大值的价格。'],
  'sparse-table': ['A weather archive that never changes: "what was the **coldest day between two dates**?" asked millions of times. Preparing the answers for all power-of-two ranges once makes each question instant.', '一份不再变化的气象档案：“**两个日期之间最冷的是哪一天**？”这样的问题要问几百万次。先把所有长度为 2 的幂的区间的答案备好，之后每个问题都能立刻回答。'],
  dsu: ['A **social network** deciding whether two people are connected through friends of friends as friendships keep being added. Image software uses it to label connected regions, and Kruskal\'s algorithm to avoid cycles.', '**社交网络**在好友关系不断增加的同时，要判断两个人能否通过“朋友的朋友”联系上。图像软件用它给连通区域编号，Kruskal 算法用它避免成环。'],
  fenwick: ['A live **leaderboard**: scores change all the time, and you want "how many players are below me?" at once. A plain prefix-sum array would have to be rebuilt after each change; the Fenwick tree updates in a handful of steps.', '实时**排行榜**：分数随时在变，而你想马上知道“有多少玩家排在我后面”。普通的前缀和数组每次修改后都要重建，树状数组只需几步就能更新。'],
  'segment-tree': ['A **hotel chain**: a group booking adds guests to every night from l to r, and the manager keeps asking for the total number of guest-nights between two dates. Range changes and range questions, both in logarithmic time.', '**连锁酒店**：一个团体预订会让第 l 晚到第 r 晚每晚都增加若干客人，而经理不断询问两个日期之间的总入住人次。区间修改和区间询问，都只需对数时间。'],
  trie: ['**Autocomplete** in a search box or on a phone keyboard: after you type "alg", every word below that node of the tree is a suggestion. Routers pick the route for an IP address by walking a trie of prefixes.', '搜索框和手机键盘的**自动补全**：输入 “alg” 之后，树上这个结点下面的所有单词都是候选。路由器为 IP 地址选路，也是沿着一棵前缀树往下走。'],
  treap: ['An **online game ranking** where players join, leave and change score, and anyone may ask "who is in 1000th place?" or "what is my rank?". A balanced tree answers both while staying sorted.', '**网络游戏排名**：玩家不断加入、离开、改变分数，而且随时有人问“第 1000 名是谁”“我排第几”。平衡树在保持有序的同时能回答这两类问题。'],
  'sqrt-decomposition': ['A big library does not keep one endless shelf: books are grouped into **sections**. To count something across a range you take whole sections by their summary and look at single books only at the two ends.', '大图书馆不会只有一个无限长的书架：书被分到一个个**分区**里。要统计一个范围内的东西，中间的整块分区直接用汇总结果，只有两端才需要一本一本地看。'],
  'leftist-heap': ['Two hospitals **merge their waiting lists**, or two task queues are combined when a server goes offline. An ordinary binary heap would have to be rebuilt; a leftist heap merges in logarithmic time.', '两家医院**合并候诊名单**，或者一台服务器下线时把它的任务队列并入另一台。普通的二叉堆只能重建，左偏树可以在对数时间内合并。'],
  'linked-list': ['The **undo history** of an editor and the list of open tabs in a browser are linked lists: items are inserted and removed in the middle all the time, and nobody asks for "item number 3 172". A music player\'s "play next" is one insertion after the current song.', '编辑器的**撤销记录**和浏览器的标签页列表都是链表：元素随时在中间插入和删除，没有人会去问“第 3 172 项”是什么。音乐播放器的“下一首播放”就是在当前歌曲后面做一次插入。'],
  'sweep-line': ['A **chip designer** must know how much of the silicon is covered by metal, and a mapping service how much land a set of overlapping satellite photos shows. Both are unions of millions of rectangles, and both are computed by sweeping a line across them. A flatbed scanner works the same way: one line at a time.', '**芯片设计者**要知道硅片上有多大面积被金属覆盖，地图服务要知道一批互相重叠的卫星照片一共拍到了多大的地面。这两者都是上百万个矩形的并集，都是让一条线扫过它们来计算的。平板扫描仪的工作方式也一样：一次只看一条线。'],
  'hash-table': ['A **cloakroom** hangs your coat on the hook whose number is printed on your ticket: nobody searches all the coats. Python\'s `dict`, JavaScript\'s objects and C++\'s `unordered_map` are hash tables, and so is the index a database uses to find one account among a hundred million.', '**衣帽间**把你的外套挂在号码牌对应的挂钩上：取衣服时没有人会把所有外套翻一遍。Python 的 `dict`、JavaScript 的对象、C++ 的 `unordered_map` 都是哈希表；数据库从一亿个账户里找出某一个所用的索引也是。'],
  'persistent-seg': ['**Git** keeps every version of a project without copying the whole project each time: a new commit stores only the files and folders that changed and points to the old ones for the rest. A text editor\'s unlimited undo and a database\'s "show me the table as it was yesterday" rest on the same sharing.', '**Git** 保存了项目的每一个版本，却不必每次都把整个项目复制一遍：新的提交只保存发生变化的文件和目录，其余的直接指向旧版本。文本编辑器的无限次撤销、数据库的“查看昨天这张表的样子”，依靠的都是同样的共享方式。'],
  cdq: ['A shop wants to know, for each product, how many others are **cheaper, better rated and more recent** at once. A recruiter comparing candidates on three scores, or a game ranking players who beat others in every statistic, asks the same three-way question — and with millions of items, comparing every pair is out of the question.', '一家网店想知道，对于每件商品，有多少件别的商品同时**更便宜、评分更高、上架更新**。招聘时按三项成绩比较候选人、游戏里统计在每一项数据上都压过别人的玩家，问的都是同样的三维比较问题——当物品有上百万件时，逐对比较是不可能的。'],
}
