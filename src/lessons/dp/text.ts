import type { L } from '../../engine/types'
import type { Prose } from '../extras'

/** The problem each lesson solves, why the method works, and common mistakes. */
export const TEXT: Record<string, Prose> = {
  lis: {
    problem: ['Given a sequence of n integers, find the length of its longest strictly increasing subsequence (elements need not be adjacent, but must keep their order).', '给定 n 个整数的序列，求它的最长严格上升子序列的长度（元素不必相邻，但要保持原有顺序）。'],
    why: ['There are 2ⁿ subsequences, so listing them is out of the question. Dynamic programming replaces "all subsequences" by a small number of well-chosen sub-questions. Ask: what is the longest increasing subsequence that ends exactly at position i? Call it f[i]. Such a subsequence is a[i] alone, or an increasing subsequence ending at some earlier, smaller element j followed by a[i] — and to be longest, the part before a[i] must itself be the longest one ending at j. This "optimal substructure" is what makes DP valid. So f[i] is one more than the largest f[j] among the allowed j. Each answer is computed once, from answers computed earlier, and the overall result is the best f[i].', '子序列共有 2ⁿ 个，逐个列举是不可能的。动态规划用少量精心选择的子问题来代替“所有子序列”。考虑这样的问题：恰好以第 i 个位置结尾的最长上升子序列有多长？记为 f[i]。这样的子序列要么只有 a[i] 自己，要么是以某个更靠前、更小的元素 j 结尾的上升子序列再接上 a[i]——并且要想最长，a[i] 之前的部分本身必须是以 j 结尾的最长的那个。正是这种“最优子结构”保证了 DP 的正确性。所以 f[i] 等于所有合法的 j 中最大的 f[j] 再加一。每个答案只计算一次，并且只用到更早算出的答案；最终结果是所有 f[i] 中最大的。'],
    pitfalls: [
      ['The answer is the maximum of all f[i], not f[n − 1].', '答案是所有 f[i] 的最大值，而不是 f[n − 1]。'],
      ['Decide between strictly increasing (<) and non-decreasing (<=) — they give different answers.', '要分清严格上升（<）和不下降（<=）——两者答案不同。'],
      ['O(n²) is too slow for n = 10⁵; the binary-search version is O(n log n).', 'n = 10⁵ 时 O(n²) 太慢；用二分查找的写法是 O(n log n)。'],
    ],
  },
  knapsack: {
    problem: ['There are n items, each with a weight and a value, and a knapsack that holds a total weight of at most W. Each item is taken whole or not at all. Maximise the total value.', '有 n 件物品，每件有重量和价值，背包最多能装总重量 W。每件物品要么整个装入，要么不装。求最大总价值。'],
    why: ['Greedy by value or by value-per-weight fails, because one awkward item can waste capacity. Instead consider the items one at a time and remember, for every capacity j from 0 to W, the best value achievable with the items considered so far. When a new item (w, v) arrives, the best for capacity j is the better of two options: leave it out, keeping the old f[j]; or take it, which leaves capacity j − w for the earlier items, giving f[j − w] + v. Using one array, the order of j matters. Going from W downward, f[j − w] has not been touched in this round and still describes the situation without the new item, so the item is counted at most once. Going upward would let an item build on a value that already includes itself.', '按价值或按“性价比”贪心都是错的，因为一件不合适的物品可能浪费容量。正确的做法是逐件考虑物品，并对 0 到 W 的每个容量 j，记住只用目前考虑过的物品所能得到的最大价值。当新物品 (w, v) 到来时，容量 j 的最优值是两种选择中较好的一个：不选它，保持原来的 f[j]；或者选它，这样留给之前物品的容量是 j − w，得到 f[j − w] + v。只用一个数组时，j 的枚举顺序很关键。从 W 往下枚举时，f[j − w] 在这一轮中还没有被改动，仍然表示不含新物品时的情况，所以这件物品至多被计入一次。如果从小到大枚举，物品就可能建立在一个已经包含了它自己的值之上。'],
    pitfalls: [
      ['Looping j upward turns it into the unbounded knapsack (each item usable many times).', 'j 从小到大循环，就变成了完全背包（每件物品可以用多次）。'],
      ['The inner loop must stop at j = w; below that the item does not fit.', '内层循环要在 j = w 处停止；再小物品就放不下了。'],
      ['If the knapsack must be filled exactly, initialise f[0] = 0 and all other f[j] to −∞.', '如果要求恰好装满，应初始化 f[0] = 0，其余 f[j] 为 −∞。'],
    ],
  },
  'interval-dp': {
    problem: ['n piles of stones lie in a row. Merging two adjacent piles costs the total number of stones in them. Merge all piles into one at the smallest total cost.', 'n 堆石子排成一行。合并相邻的两堆，代价是这两堆石子的总数。把所有石子合并成一堆，求最小总代价。'],
    why: ['Always merging the two smallest adjacent piles looks tempting but is wrong — the piles must stay in order, which Huffman\'s argument does not allow for. Think instead about the very last merge. Whatever happened before, the last merge joins a pile made from stones l..k with a pile made from stones k+1..r, and it costs the total of l..r, independent of k. Before that, the two halves were merged separately and independently, each as cheaply as possible. So the best cost for l..r is the best choice of k of cost(l..k) + cost(k+1..r), plus the sum of l..r. The sub-problems are intervals, and a longer interval depends only on shorter ones; computing in order of increasing length guarantees everything needed is ready.', '每次合并最小的两堆相邻石子看似诱人，却是错的——石子堆必须保持顺序，哈夫曼的论证在这里不适用。不如考虑最后一次合并。无论之前发生了什么，最后一次合并都是把由 l..k 的石子组成的一堆，与由 k+1..r 的石子组成的一堆合起来，代价是 l..r 的石子总数，与 k 无关。在此之前，两部分是各自独立地合并的，并且各自都要尽可能省。所以 l..r 的最小代价，是在所有 k 中取 cost(l..k) + cost(k+1..r) 的最小值，再加上 l..r 的总和。子问题是区间，较长的区间只依赖于较短的区间；按长度从小到大计算，就能保证需要的值都已算好。'],
    pitfalls: [
      ['Looping l and r directly (instead of by length) uses values that are not computed yet.', '直接循环 l 和 r（而不是按长度枚举）会用到尚未计算的值。'],
      ['Initialise f[l][r] to infinity before taking minima, but f[i][i] to 0.', '取最小值之前要把 f[l][r] 初始化为无穷大，但 f[i][i] 为 0。'],
      ['O(n³) limits n to a few hundred.', 'O(n³) 的复杂度使 n 只能到几百。'],
    ],
  },
  lcs: {
    problem: ['Given two strings, find the length of their longest common subsequence — the longest sequence of characters that appears in both, in the same order but not necessarily contiguously.', '给定两个字符串，求它们的最长公共子序列的长度——在两个串中都按相同顺序出现（不要求连续）的最长字符序列。'],
    why: ['Compare the last characters of the two strings. If they are equal, some longest common subsequence ends with that character matched in both strings: if an optimal solution matched it differently or not at all, re-pairing these two last characters would never make it shorter. So remove both characters and add one to the answer for the shorter strings. If they differ, they cannot both be the final matched pair, so at least one of them is unused; drop one or the other and keep the better result. Both cases reduce the problem to prefixes of the two strings, which gives a table f[i][j] over all pairs of prefix lengths. Each cell needs only the cells above, to the left, and diagonally above-left.', '比较两个字符串的最后一个字符。如果相同，一定存在一个最长公共子序列以这个字符结尾，并且恰好由这两个位置配对：如果某个最优解用别的方式配对了它们或者根本没有用到，改成让这两个末尾字符配对，长度也不会变短。所以去掉这两个字符，答案等于更短的两个串的答案加一。如果不同，它们不可能同时作为最后一对匹配的字符，所以至少有一个没有用到；丢掉其中一个，取结果较好的那种。两种情况都把问题化为两个串的前缀上的问题，于是得到一张对所有前缀长度组合的表 f[i][j]。每个格子只需要它上方、左方和左上方的格子。'],
    pitfalls: [
      ['With 0-based strings, f[i][j] refers to characters a[i − 1] and b[j − 1].', '字符串下标从 0 开始时，f[i][j] 对应的字符是 a[i − 1] 和 b[j − 1]。'],
      ['An n × m int table for n = m = 10⁴ is 400 MB; keep only two rows if just the length is needed.', 'n = m = 10⁴ 时 n × m 的 int 表有 400 MB；如果只需要长度，只保留两行即可。'],
      ['Subsequence is not substring: the characters need not be adjacent.', '子序列不是子串：字符不必相邻。'],
    ],
  },
  'tree-dp': {
    problem: ['Every vertex of a tree has a weight. Choose a set of vertices with the largest total weight such that no two chosen vertices are joined by an edge.', '树的每个顶点都有一个权值。选出一些顶点，使任意两个被选的顶点之间没有边相连，并且权值之和最大。'],
    why: ['On a tree, removing a vertex separates its subtrees from each other and from the rest; the only thing a subtree needs to tell its parent is what happened at its own root. So compute two numbers for every vertex u: the best total within u\'s subtree if u is chosen, and the best if u is not chosen. If u is chosen, none of its children may be chosen, so add each child\'s "not chosen" value to u\'s weight. If u is not chosen, each child is free to be chosen or not, so add the larger of the child\'s two values. The children\'s numbers must be known first, which a post-order traversal ensures. The answer is the better of the root\'s two numbers. This pattern — one small table per vertex, combined from the children — is tree DP.', '在树上，去掉一个顶点会把它的各棵子树彼此分开，也与树的其余部分分开；一棵子树只需要告诉父亲：它自己的根是怎么处理的。所以为每个顶点 u 计算两个数：选 u 时 u 的子树内的最优总和，以及不选 u 时的最优总和。如果选了 u，它的孩子都不能选，所以在 u 的权值上加上每个孩子“不选”的值。如果不选 u，每个孩子可选可不选，所以加上孩子两个值中较大的那个。必须先知道孩子的结果，后序遍历正好保证了这一点。答案是根的两个数中较大的那个。这种模式——每个顶点一张小表，由孩子的表合并得到——就是树形 DP。'],
    pitfalls: [
      ['Forgetting to skip the parent in the adjacency list sends the DFS back up forever.', '遍历邻接表时忘记跳过父亲，DFS 会无限地往回走。'],
      ['Using the child\'s values before the recursive call on that child has returned.', '在对孩子的递归调用返回之前就使用了它的值。'],
      ['When u is not chosen, a child is not forced to be chosen — take the maximum, not f[v][1].', '不选 u 时，孩子并不是必须被选——要取最大值，而不是直接用 f[v][1]。'],
    ],
  },
  'bitmask-dp': {
    problem: ['Given the distances between n cities (n ≤ 17), find the shortest tour that starts at city 0, visits every other city exactly once and returns to city 0.', '给定 n 个城市（n ≤ 17）两两之间的距离，求从城市 0 出发、经过其余每个城市恰好一次、最后回到城市 0 的最短回路。'],
    why: ['Trying all orders means (n − 1)! tours — about 2 × 10¹³ for n = 17. But many orders share work. Suppose you have visited some set of cities and are standing in city i. How you should continue depends only on that set and on i, not on the order in which the set was visited. So it is enough to know, for each (set, last city), the shortest way to get there. There are 2ⁿ sets and n last cities, about two million states for n = 17. A set of small integers fits naturally into the bits of one integer, which can be used directly as an array index, and set operations become bit operations. Extending a route by one unvisited city gives the transition; a final edge back to city 0 closes the tour.', '枚举所有顺序意味着 (n − 1)! 条回路——n = 17 时约为 2 × 10¹³。但许多顺序之间有大量重复的工作。假设你已经访问了某个城市集合，现在位于城市 i。接下来应该怎么走，只取决于这个集合和 i，而与集合内的访问顺序无关。所以只需要知道：对每个（集合，最后所在的城市），到达它的最短路程是多少。集合有 2ⁿ 个，最后的城市有 n 种，n = 17 时约两百万个状态。一个由小整数构成的集合可以很自然地存进一个整数的二进制位里，直接用作数组下标，集合运算也就变成了位运算。把路线延伸到一个未访问的城市就是转移；最后加上回到城市 0 的边，回路就闭合了。'],
    pitfalls: [
      ['Operator precedence: write (S >> j) & 1 with parentheses; S & 1 << j == 0 does not mean what it looks like.', '运算符优先级：要写成带括号的 (S >> j) & 1；S & 1 << j == 0 的含义并不是看上去那样。'],
      ['Memory is 2ⁿ × n: fine for n = 17, impossible for n = 25.', '空间是 2ⁿ × n：n = 17 没问题，n = 25 就不可能了。'],
      ['Forgetting the edge back to the start gives the shortest path, not the shortest tour.', '忘记加上回到起点的边，求出的是最短路径而不是最短回路。'],
    ],
  },
  'expect-dp': {
    problem: ['In a road network without cycles, a walker starts at junction 1 and at every junction picks one of the outgoing roads at random, each equally likely, until junction n is reached. What is the expected total length walked?', '在一个没有环的道路网中，一个人从路口 1 出发，在每个路口等概率地随机选一条出去的路，直到到达路口 n。他走过的总长度的期望是多少？'],
    why: ['The expectation of a random quantity is its average weighted by probability. Listing all routes with their probabilities would work in principle, but there can be exponentially many routes. Instead ask the same question at every junction: let f[u] be the expected length still to walk when standing at u. At the target, f[n] = 0. Anywhere else, the walker first chooses a road. Given that the road u → v of length w was chosen, the rest of the walk has expected length w + f[v] — nothing about the past matters. Averaging over the choice gives f[u] = (1 / deg(u)) · Σ (w + f[v]). This step, splitting an expectation by the first decision, is the law of total expectation, and it is what makes expectations fit dynamic programming so well: only the average needs to be carried, not the whole distribution. The values must be computed so that every f[v] is ready before f[u] needs it, which means from the target backwards, in reverse topological order. The program does this with the reversed edges and a counter per vertex: a vertex is finished when all its outgoing edges have been accounted for. The true answer is a fraction, so the problem asks for it modulo a prime; dividing by deg(u) then means multiplying by its modular inverse.', '随机量的期望是它按概率加权的平均值。把所有路线连同它们的概率都列出来，原则上可行，但路线可能有指数级那么多。换个办法，在每个路口都问同一个问题：设 f[u] 表示站在 u 时还要走的期望长度。在终点，f[n] = 0。在其他地方，行人先要选一条路。假如选中的是长度为 w 的路 u → v，那么剩下的路程的期望长度就是 w + f[v]——过去怎么走来的毫无影响。对这次选择取平均，得到 f[u] = (1 / deg(u)) · Σ (w + f[v])。这一步——按第一次决定把期望拆开——就是全期望公式，也正是期望特别适合做动态规划的原因：只需要传递平均值，不需要传递整个分布。计算时要保证 f[u] 用到的每个 f[v] 都已经算好，也就是从终点往回算，按逆拓扑序进行。程序用反向边加上每个顶点的一个计数器来实现：一个顶点的所有出边都处理完时，它就完成了。真正的答案是一个分数，所以题目要求对一个质数取模；这时除以 deg(u) 就是乘以它的乘法逆元。'],
    pitfalls: [
      ['Expectations of this kind are computed backwards from the end. Going forwards from the start needs the probability of reaching each vertex as well.', '这类期望要从终点往回算。如果从起点往后推，还需要同时知道到达每个顶点的概率。'],
      ['Dividing with / on remainders is wrong. Under a modulus every division is a multiplication by an inverse.', '直接对余数用 / 做除法是错的。在模意义下，每一次除法都要换成乘以逆元。'],
      ['On a graph with cycles the equations refer to each other and cannot be evaluated in order: they form a linear system for Gaussian elimination.', '如果图里有环，这些方程会互相引用，无法按顺序求值：它们构成一个线性方程组，要用高斯消元来解。'],
      ['The expected value of a product is not the product of expected values, unless the quantities are independent. Sums are always safe.', '乘积的期望不等于期望的乘积，除非两个量相互独立。和的期望则总是等于期望的和。'],
    ],
  },
}

/** Where each problem shows up outside contests, shown on the Problem tab. Same inline markup as the Ideas story. */
export const REAL: Record<string, L> = {
  lis: ['On a chart of **daily temperatures or prices**, the longest rising trend that skips the dips. The card game patience (solitaire) plays out this algorithm with piles of cards, and the "patience diff" of version-control tools is built on it.', '在**每日气温或价格**的曲线上，跳过回落之后最长的上升趋势。纸牌游戏“接龙”用一堆堆牌演示的正是这个算法，版本控制工具里的 “patience diff” 也建立在它之上。'],
  knapsack: ['**Packing a suitcase** under the airline weight limit so that what you take is worth the most. Investors choose projects under a budget, and a cargo ship chooses containers, with the same decision: take it or leave it.', '在航空公司的限重之内**装行李箱**，让带走的东西总价值最大。投资人在预算内挑选项目、货轮挑选集装箱，面对的是同一个决定：拿，还是不拿。'],
  'interval-dp': ['Multiplying a **chain of matrices** in the cheapest order, or merging many sorted files two neighbours at a time: the total cost depends heavily on the order, and trying every order is hopeless.', '以最省的顺序计算**一连串矩阵的乘积**，或者每次合并相邻的两个有序文件：总代价与顺序关系极大，而枚举所有顺序是不可能的。'],
  lcs: ['`diff` and **`git`** show what changed between two versions of a file by finding the longest sequence of lines they share. Biologists compare DNA sequences the same way.', '`diff` 和 **`git`** 通过找出两个版本共有的最长行序列，来显示文件改了什么。生物学家也是用同样的方法比较 DNA 序列。'],
  'tree-dp': ['A **company party** where nobody wants to sit with their direct boss: who should be invited to make it the most fun? Placing guards or wireless transmitters on a tree-shaped network is the same kind of problem.', '**公司聚会**上，谁都不想和自己的直属上司同桌：应该邀请哪些人，才能让气氛最好？在树形网络上布置警卫或无线发射器，是同一类问题。'],
  'bitmask-dp': ['A **delivery van** visiting a dozen addresses and returning to the depot by the shortest tour. Drilling holes in a circuit board and planning a telescope\'s night of observations are the same travelling-salesman problem.', '**快递车**要跑遍十几个地址再回到站点，走哪条路线最短？给电路板钻孔、安排望远镜一夜的观测顺序，都是同一个旅行商问题。'],
  'expect-dp': ['An **insurance company** prices a policy by its expected payout; a board-game designer checks that a game lasts about half an hour on average; a network engineer estimates the average delay of a packet that is routed at random. All three compute an expectation step by step, backwards from the end, without ever listing every possible course of events.', '**保险公司**按期望赔付额给保单定价；桌游设计师要检验一局游戏平均大约持续半小时；网络工程师估算随机路由的数据包的平均延迟。这三件事都是从结局往回、一步一步地计算期望，而不需要把每一种可能的经过都列出来。'],
}
