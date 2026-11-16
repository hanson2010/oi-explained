import type { L } from '../../engine/types'
import type { Prose } from '../extras'

/** The problem each lesson solves, why the method works, and common mistakes. */
export const TEXT: Record<string, Prose> = {
  gcd: {
    problem: ['Find the greatest common divisor of two non-negative integers a and b.', '求两个非负整数 a 和 b 的最大公约数。'],
    why: ['Trying every candidate divisor is far too slow for numbers near 10¹⁸. Euclid\'s observation: if a number divides both a and b, it also divides a − b, and conversely anything dividing b and a − b divides a. So the pair (a, b) and the pair (b, a − b) have exactly the same common divisors, and in particular the same greatest one. Subtracting b repeatedly until the result is below b is the same as taking the remainder a mod b, so (a, b) can be replaced by (b, a mod b) in one step. The numbers shrink quickly — after two steps the larger one has at least halved — and when the second number reaches 0, the first is the answer, since everything divides 0.', '逐个尝试可能的约数，对于接近 10¹⁸ 的数来说太慢了。欧几里得的观察是：如果一个数同时整除 a 和 b，它也整除 a − b；反过来，整除 b 和 a − b 的数也整除 a。所以数对 (a, b) 和数对 (b, a − b) 的公约数完全相同，最大的那个自然也相同。不断减去 b 直到结果小于 b，就等于取余数 a mod b，所以一步就能把 (a, b) 换成 (b, a mod b)。数字缩小得很快——每两步，较大的数至少减半——当第二个数变为 0 时，第一个数就是答案，因为任何数都整除 0。'],
    pitfalls: [
      ['gcd(0, 0) is 0 by convention; make sure nothing divides by zero.', '按约定 gcd(0, 0) = 0；要确保不会出现除以零。'],
      ['For lcm, compute a / gcd × b, not a × b / gcd, which overflows.', '求最小公倍数时要写成 a / gcd × b，而不是会溢出的 a × b / gcd。'],
      ['With negative inputs the result can be negative; take absolute values first.', '输入为负数时结果可能为负；应先取绝对值。'],
    ],
  },
  exgcd: {
    problem: ['Given positive integers a and b, find integers x and y such that a·x + b·y = gcd(a, b).', '给定正整数 a 和 b，求整数 x 和 y，使得 a·x + b·y = gcd(a, b)。'],
    why: ['Euclid\'s algorithm reduces (a, b) to (b, a mod b) until the second number is 0. At the bottom the equation is trivial: g·1 + 0·0 = g. Now climb back up. Suppose the smaller problem has been solved: b·x′ + (a mod b)·y′ = g. Replace a mod b by a − ⌊a/b⌋·b and collect the terms with a and with b: a·y′ + b·(x′ − ⌊a/b⌋·y′) = g. So x = y′ and y = x′ − ⌊a/b⌋·y′ solve the larger problem. Each level of the recursion applies this substitution once on its way back. The result is far more useful than it looks: solving a·x ≡ 1 (mod m) — the modular inverse — is exactly finding x with a·x + m·y = 1, and linear congruences and the Chinese remainder theorem are built on the same step.', '欧几里得算法把 (a, b) 不断化为 (b, a mod b)，直到第二个数为 0。在最底层，方程是显然的：g·1 + 0·0 = g。现在往回走。假设较小的问题已经解出：b·x′ + (a mod b)·y′ = g。把 a mod b 换成 a − ⌊a/b⌋·b，再把含 a 的项和含 b 的项分别合并：a·y′ + b·(x′ − ⌊a/b⌋·y′) = g。所以 x = y′、y = x′ − ⌊a/b⌋·y′ 就是较大问题的解。递归的每一层在返回时做一次这样的代换。这个结果比看上去有用得多：解 a·x ≡ 1 (mod m)——也就是求模逆元——正是求满足 a·x + m·y = 1 的 x；线性同余方程和中国剩余定理也都建立在这一步之上。'],
    pitfalls: [
      ['The x returned may be negative; for an inverse normalise with (x % m + m) % m.', '返回的 x 可能为负；求逆元时要用 (x % m + m) % m 调整。'],
      ['An inverse exists only when gcd(a, m) = 1 — check g before using x.', '只有当 gcd(a, m) = 1 时逆元才存在——使用 x 之前要检查 g。'],
      ['a·x + b·y = c is solvable only if g divides c; then scale the solution by c / g.', 'a·x + b·y = c 只有在 g 整除 c 时才有解；有解时把解乘以 c / g。'],
    ],
  },
  sieve: {
    problem: ['Count the prime numbers that do not exceed n, for n up to ten million.', '求不超过 n 的素数个数，n 可达一千万。'],
    why: ['Testing each number separately by trial division costs about n√n. A sieve works the other way round: instead of asking of each number "is it prime?", it lets each prime announce its multiples. Go through the numbers from 2 upward. When you arrive at a number that nobody has crossed out, it has no smaller prime factor, so it is prime — and all its multiples are composite, so cross them out. A composite number is always crossed out before you reach it, by its smallest prime factor. Crossing out can start at p², because any smaller multiple k·p with k < p has a prime factor smaller than p and was crossed out earlier. The total work, n/2 + n/3 + n/5 + …, grows only as n log log n.', '对每个数分别用试除法判断，代价约为 n√n。筛法反过来做：不是问每个数“你是素数吗”，而是让每个素数去标出它的倍数。从 2 开始依次考察每个数。走到一个没有被划掉的数时，它没有更小的素因子，所以是素数——而它的所有倍数都是合数，把它们划掉。合数总会在走到它之前，被它的最小素因子划掉。划的时候可以从 p² 开始，因为更小的倍数 k·p（k < p）含有比 p 小的素因子，早就被划掉了。总工作量 n/2 + n/3 + n/5 + … 的增长速度只有 n log log n。'],
    pitfalls: [
      ['i × i overflows int when i exceeds about 46 000; compute it in long long.', 'i 超过约 46000 时 i × i 会超出 int；要用 long long 计算。'],
      ['0 and 1 are not prime.', '0 和 1 不是素数。'],
      ['A bool array of 10⁸ entries is 100 MB — check the memory limit, or use a bitset.', '10⁸ 个元素的 bool 数组有 100 MB——注意内存限制，或者使用 bitset。'],
    ],
  },
  'linear-sieve': {
    problem: ['Count the prime numbers that do not exceed n, crossing out every composite number exactly once.', '求不超过 n 的素数个数，并且做到每个合数恰好只被划掉一次。'],
    why: ['In the sieve of Eratosthenes a number with several prime factors is crossed out once for each of them. To cross out every composite exactly once, decide in advance who is responsible for it: its smallest prime factor. Write a composite m as p × i, where p is its smallest prime factor. Then i has no prime factor smaller than p. The linear sieve generates exactly these products: for every i it multiplies i by the primes p = 2, 3, 5, … in increasing order and stops right after the first p that divides i. Up to and including that point, p is no larger than the smallest prime factor of i, so p really is the smallest prime factor of p × i. Beyond it, i already contains a smaller prime, so the product belongs to someone else.', '在埃氏筛中，一个有多个素因子的数会被每个素因子各划一次。要让每个合数恰好被划一次，就事先规定由谁负责：它的最小素因子。把合数 m 写成 p × i，其中 p 是它的最小素因子。那么 i 没有比 p 更小的素因子。线性筛恰好生成这样的乘积：对每个 i，按从小到大的顺序用素数 p = 2、3、5……去乘 i，并在第一个整除 i 的 p 之后立刻停止。在此之前（包括这一个），p 不超过 i 的最小素因子，所以 p 确实是 p × i 的最小素因子。再往后，i 中已经含有更小的素数，那些乘积应由别人负责。'],
    pitfalls: [
      ['Putting the break before the crossing-out line skips composites such as 4 = 2 × 2.', '把 break 放在划掉的那一行之前，会漏掉像 4 = 2 × 2 这样的合数。'],
      ['The inner loop runs for every i, prime or not.', '内层循环对每个 i 都要执行，无论它是不是素数。'],
      ['i × prime[k] can overflow int near the limit; compare using long long.', 'i × prime[k] 在接近上限时可能超出 int；比较时要用 long long。'],
    ],
  },
  pascal: {
    problem: ['Print row n of Pascal\'s triangle — the numbers C(n, 0), C(n, 1), …, C(n, n) — modulo 1 000 000 007.', '输出杨辉三角的第 n 行——即 C(n, 0)、C(n, 1)、…、C(n, n)——对 1 000 000 007 取模。'],
    why: ['C(n, k) is the number of ways to choose k items out of n. The formula with factorials overflows almost immediately and needs division, which does not mix with remainders. Counting gives a better route. Single out one item. Selections of k items split into two kinds: those that contain it — choose the other k − 1 from the remaining n − 1 — and those that do not — choose all k from the remaining n − 1. The two kinds do not overlap, so C(n, k) = C(n − 1, k − 1) + C(n − 1, k). Each number is the sum of the two above it, only additions are needed, and a remainder can be taken after each. This is a recurrence: later values are obtained from earlier ones by a fixed rule, starting from the known edges C(n, 0) = C(n, n) = 1.', 'C(n, k) 是从 n 个物品中选 k 个的方案数。用阶乘的公式几乎立刻就会溢出，而且需要除法，而除法与取模不能直接混用。从计数的角度有更好的办法。单独看某一个物品。选 k 个物品的方案分成两类：包含它的——再从其余 n − 1 个中选 k − 1 个；不包含它的——从其余 n − 1 个中选满 k 个。两类互不重叠，所以 C(n, k) = C(n − 1, k − 1) + C(n − 1, k)。每个数等于它上方两个数之和，只需要加法，每次加完都可以取模。这就是递推：从已知的边界 C(n, 0) = C(n, n) = 1 出发，按固定的规则由前面的值得到后面的值。'],
    pitfalls: [
      ['Without a modulus the values overflow long long from about row 67.', '不取模的话，大约从第 67 行开始就会超出 long long。'],
      ['The table needs O(n²) memory; a single query for large n is better served by factorials and modular inverses.', '这张表需要 O(n²) 的空间；n 很大而只查询一个值时，用阶乘加逆元更合适。'],
      ['C(i, j) for j > i must be 0, or the right edge of the triangle comes out wrong.', 'j > i 时 C(i, j) 必须为 0，否则三角形的右边界会算错。'],
    ],
  },
  gauss: {
    problem: ['Solve a system of n linear equations in n unknowns, or report that it has no unique solution.', '解一个含 n 个未知数、n 个方程的线性方程组，或报告它没有唯一解。'],
    why: ['The solutions of a system do not change if you swap two equations, multiply an equation by a non-zero number, or add a multiple of one equation to another. Elimination uses these moves to remove one unknown at a time. Pick an equation in which x₁ has a non-zero coefficient, scale it so that the coefficient is 1, and subtract suitable multiples of it from every other equation so that x₁ disappears from them. Now x₁ appears in exactly one equation. Do the same for x₂ using a different equation, and so on. In the end each equation contains a single unknown with coefficient 1, and its right-hand side is the value of that unknown. If at some stage no remaining equation has a non-zero coefficient for the current unknown, that unknown is not pinned down — the system has no solution or infinitely many.', '交换两个方程、把一个方程乘以非零的数、或者把一个方程的倍数加到另一个方程上，都不会改变方程组的解。消元法就用这些操作，每次消去一个未知数。选一个 x₁ 的系数不为零的方程，把它缩放到系数为 1，再从其余每个方程中减去它的适当倍数，使 x₁ 从那些方程中消失。现在 x₁ 只出现在一个方程里。然后用另一个方程对 x₂ 做同样的事，依此类推。最后每个方程只含一个系数为 1 的未知数，方程右边就是它的值。如果在某一步，剩下的方程中当前未知数的系数全为零，这个未知数就无法确定——方程组要么无解，要么有无穷多解。'],
    pitfalls: [
      ['Comparing a floating-point pivot with == 0 instead of with a small epsilon.', '用 == 0 而不是一个很小的 eps 来判断浮点数主元是否为零。'],
      ['Not choosing the largest pivot lets rounding errors grow until the answer is useless.', '不选绝对值最大的主元，舍入误差会不断放大，直到答案毫无意义。'],
      ['Updating a row from left to right destroys the multiplier before it has been used.', '从左到右更新一行，会在乘数用完之前就把它改掉。'],
    ],
  },
  'nim-sg': {
    problem: ['There are several piles of stones and a fixed list of allowed amounts. Two players alternate; a move removes an allowed amount from one pile. The player who cannot move loses. With perfect play, does the first player win?', '有若干堆石子和一张固定的“允许取走的数量”清单。两人轮流行动，每次从某一堆中取走清单上的某个数量。无法行动的一方输。双方都采取最优策略时，先手能赢吗？'],
    why: ['For a single pile, classify positions backwards: a position is losing if every move leads to a winning position (or there is no move), and winning if some move leads to a losing one. With several piles that is not enough — knowing that each pile alone is "winning" says nothing about the combination. The Sprague–Grundy function carries the missing information. Define the value of a position as the smallest non-negative integer that is not the value of any position reachable in one move (the mex). A position with value g then behaves, inside a sum of games, exactly like a Nim pile of g stones: you can move to every smaller value, and moves to larger values can be answered by moving back. For Nim itself the rule is that the player to move loses exactly when the XOR of the pile sizes is 0, so XOR the values of all piles.', '对于单独一堆，可以倒着给局面分类：如果每一步都走到必胜局面（或者根本无路可走），这个局面就是必败的；如果存在一步能走到必败局面，它就是必胜的。但有多堆时这还不够——只知道每一堆单独都是“必胜”，对它们的组合什么也说明不了。Sprague–Grundy 函数补上了缺失的信息。把一个局面的值定义为：不等于任何一步可达局面的值的最小非负整数（mex）。那么值为 g 的局面，在若干游戏之和中的表现就完全等同于一堆 g 个石子的 Nim：你可以走到每个更小的值，而走到更大值的着法可以被对手再走回来抵消。对于 Nim 本身，规则是：当且仅当各堆石子数的异或为 0 时，轮到行动的一方必败。所以把所有堆的 SG 值异或起来即可。'],
    pitfalls: [
      ['Combining piles with + or with "any pile is winning" instead of XOR.', '用加法或“只要有一堆必胜”来合并各堆，而不是用异或。'],
      ['The mex is the smallest missing value, not the maximum plus one.', 'mex 是最小的未出现的值，而不是最大值加一。'],
      ['The theory covers games where the player unable to move loses; "last move loses" variants need separate care.', '这套理论适用于“无法行动者输”的游戏；“取走最后一个者输”的变体需要另外处理。'],
    ],
  },
  'convex-hull': {
    problem: ['Given n points in the plane, find their convex hull — the smallest convex polygon containing all of them. Print its number of vertices and twice its area.', '给定平面上的 n 个点，求它们的凸包——包含所有点的最小凸多边形。输出凸包的顶点数和面积的两倍。'],
    why: ['Picture a rubber band stretched around nails at the points: where it rests is the hull. Walking around it anticlockwise you only ever turn left. That gives a local test. For three consecutive points a, b, c, the cross product of b − a and c − a is positive for a left turn and negative for a right turn. Sort the points from left to right and add them one by one to a stack. If the newest point makes the last two stack points turn right (or go straight), the middle point lies inside the hull — remove it and test again. One sweep from left to right builds the lower boundary; a second sweep from right to left builds the upper boundary. Every point is pushed once per sweep and popped at most once, so after sorting the work is linear.', '想象一根橡皮筋套在钉在这些点上的钉子外面：它停留的位置就是凸包。沿着它逆时针走，你始终只会向左拐。这就给出了一个局部的判断方法。对于连续的三个点 a、b、c，b − a 与 c − a 的叉积为正表示左拐，为负表示右拐。把点从左到右排序，逐个加入一个栈。如果最新的点使栈顶的两个点形成右拐（或者共线直行），中间那个点就在凸包内部——把它删掉，再重新检查。从左到右扫一遍得到下边界；再从右到左扫一遍得到上边界。每个点在每次扫描中只入栈一次、至多出栈一次，所以排序之后的工作是线性的。'],
    pitfalls: [
      ['Cross products of coordinates up to 10⁹ overflow int; use long long.', '坐标达到 10⁹ 时叉积会超出 int；要用 long long。'],
      ['Using < instead of <= keeps collinear points on the hull — decide which the problem wants.', '把 <= 写成 < 会把共线的点也保留在凸包上——要看题目需要哪一种。'],
      ['Duplicate points and inputs with all points on one line need care.', '重复的点、所有点共线的输入需要特别小心。'],
    ],
  },
  prufer: {
    problem: ['Given a tree whose n vertices are labelled 1 to n, compute its Prüfer sequence.', '给定一棵 n 个顶点、编号为 1 到 n 的树，求它的 Prüfer 序列。'],
    why: ['The procedure dismantles the tree leaf by leaf. Remove the leaf with the smallest label and write down the vertex it was attached to; repeat until two vertices remain. Each removal records one edge, so n − 2 numbers are written. The sequence loses no information: the vertices that never appear in it are exactly the leaves, so the smallest of them must have been the first leaf removed, and the first number says where it was attached — and the same reasoning applies to the rest. Hence every tree gives a different sequence, and every sequence of n − 2 labels comes from some tree. Counting sequences is easy: n choices in each of n − 2 positions. That proves Cayley\'s formula, nⁿ⁻² labelled trees, and makes Prüfer sequences a standard tool for counting trees with given degrees.', '这个过程把树一片叶子一片叶子地拆掉。删去编号最小的叶子，并写下它所连接的那个顶点；重复直到只剩两个顶点。每次删除记录下一条边，所以一共写下 n − 2 个数。这个序列没有丢失任何信息：从未在序列中出现的顶点恰好就是叶子，所以其中编号最小的一定是第一个被删的叶子，而序列的第一个数说明了它连在哪里——对剩下的部分可以同样推理。因此不同的树给出不同的序列，而每个长度为 n − 2 的编号序列都对应某一棵树。数序列很容易：n − 2 个位置每个有 n 种选择。这就证明了 Cayley 公式——有标号树共 nⁿ⁻² 棵，也使 Prüfer 序列成为统计给定度数的树的标准工具。'],
    pitfalls: [
      ['For n ≤ 2 the sequence is empty; do not loop a negative number of times.', 'n ≤ 2 时序列为空；不要让循环执行负数次。'],
      ['A vertex becomes a leaf when its degree drops to 1, not 0.', '顶点的度数降到 1（而不是 0）时就变成了叶子。'],
      ['The heap version is O(n log n); a pointer-based version achieves O(n).', '用堆的写法是 O(n log n)；用指针扫描的写法可以做到 O(n)。'],
    ],
  },
  'prime-factor': {
    problem: ['Write an integer n as a product of prime numbers.', '把整数 n 写成若干个质数的乘积。'],
    why: ['The fundamental theorem of arithmetic says the product exists and is unique, so the task is only to find it. Trial division does that from the small end. Try 2: as long as it divides n, record a factor 2 and divide it out. Then 3, then 4, and so on. It looks as if composite numbers such as 4 or 6 could be recorded by mistake, but they never divide: by the time p is reached, every prime below p has been removed from n completely, and a composite p is built from exactly those primes. The second idea is when to stop. Factors come in pairs — if d divides n, so does n / d — and one of the pair is at most √n. So if no p with p · p ≤ n divides n, then n has no factor other than 1 and itself: it is prime, and it is the last factor. Since n shrinks with every division, this stopping point usually arrives far sooner than the square root of the original number.', '算术基本定理告诉我们，这样的乘积存在且唯一，所以任务只是把它找出来。试除法从小的一端做起。先试 2：只要它能整除 n，就记下一个因数 2 并把它除掉。然后试 3，再试 4，依此类推。看起来 4、6 这样的合数可能被误记为因数，但它们永远不会整除 n：试到 p 时，所有小于 p 的质数都已经从 n 中除尽了，而合数 p 恰恰是由这些质数乘出来的。第二个要点是什么时候停。因数是成对出现的——若 d 整除 n，则 n / d 也整除 n——每一对中总有一个不超过 √n。所以如果没有满足 p · p ≤ n 的 p 能整除 n，n 就只有 1 和它本身两个因数：它是质数，也就是最后一个质因数。由于每除一次 n 都会变小，这个停止点通常比原数的平方根来得早得多。'],
    pitfalls: [
      ['Using "if" instead of "while" misses repeated factors: 12 would come out as 2 · 3.', '把 while 写成 if 会漏掉重复的质因数：12 会被分解成 2 · 3。'],
      ['Forgetting the final "if (n > 1)" drops the largest prime factor, e.g. the 7 in 14.', '忘记最后的 “if (n > 1)” 会丢掉最大的质因数，例如 14 中的 7。'],
      ['Writing p * p <= n with int p overflows for n near 10¹⁴. Use long long.', 'p 用 int 时，p * p <= n 在 n 接近 10¹⁴ 时会溢出。要用 long long。'],
      ['Looping p all the way to n is correct but takes n steps instead of √n.', '让 p 一直循环到 n 是对的，但需要 n 步而不是 √n 步。'],
    ],
  },
}

/** Where each problem shows up outside contests, shown on the Problem tab. Same inline markup as the Ideas story. */
export const REAL: Record<string, L> = {
  gcd: ['**Reducing a fraction**: 1920 × 1080 becomes the aspect ratio 16 : 9 after dividing by the gcd, 120. Two gears with 12 and 18 teeth return to their starting position after lcm(12, 18) = 36 teeth.', '**约分**：1920 × 1080 除以最大公约数 120，就得到宽高比 16 : 9。齿数为 12 和 18 的两个齿轮，转过 lcm(12, 18) = 36 个齿之后回到初始位置。'],
  exgcd: ['The classic **water-jug puzzle**: measure exactly 4 litres with a 3-litre and a 5-litre jug. It also produces the private key of **RSA**, which is a modular inverse.', '经典的**倒水问题**：用 3 升和 5 升的两个水壶量出恰好 4 升水。**RSA** 的私钥是一个模逆元，也是用它算出来的。'],
  sieve: ['**Hash tables** like a prime number of buckets, and cryptography needs primes all the time. When you need all of them up to some limit, striking out multiples is far faster than testing numbers one by one.', '**哈希表**喜欢用素数个桶，密码学更是离不开素数。当你需要某个范围内的全部素数时，划掉倍数比一个一个地判断快得多。'],
  'linear-sieve': ['Preparing a **table of smallest prime factors** once lets a program factorise millions of numbers instantly — the basis for computing Euler\'s φ and other number-theoretic functions for every n at once.', '预先算好一张**最小质因子表**，程序就能瞬间分解几百万个数——这也是一次性求出所有 n 的欧拉函数 φ 等数论函数的基础。'],
  pascal: ['**Lottery odds**: choosing 6 numbers out of 49 can be done in C(49, 6) = 13 983 816 ways. Counting poker hands, committees or shortest routes on a street grid all come down to the same table.', '**彩票中奖概率**：从 49 个数里选 6 个，共有 C(49, 6) = 13 983 816 种选法。数扑克牌型、选委员会、数街道网格上的最短路线，最后都归结到同一张表。'],
  gauss: ['**Balancing a chemical equation**, finding the currents in an electrical circuit, or fitting a curve through measured points: each is a system of linear equations, solved by eliminating one unknown at a time.', '**配平化学方程式**、求电路中各支路的电流、用曲线拟合测量数据：它们都是线性方程组，都是通过每次消去一个未知数解出来的。'],
  'nim-sg': ['Taking **matches from piles** against a friend: with the XOR rule you know from the first move whether you can force a win. The SG function extends this to any game where the player unable to move loses.', '和朋友玩**取火柴**游戏：掌握了异或规则，第一步之前你就知道自己能不能必胜。SG 函数把这个结论推广到一切“无法行动者输”的游戏。'],
  'convex-hull': ['Stretch a **rubber band** around nails on a board: it snaps to the convex hull. Games use hulls for fast collision checks, and a farmer for the shortest fence around all the trees.', '用一根**橡皮筋**套住木板上的钉子：它绷紧后的形状就是凸包。游戏用凸包快速判断碰撞，农场主用它求围住所有树的最短篱笆。'],
  prufer: ['**Storing or sending a labelled tree** — a network layout, say — as just n − 2 numbers. Because every sequence gives exactly one tree, it is also the simplest way to generate a uniformly random tree as test data.', '只用 n − 2 个数就能**存储或传输一棵带标号的树**（比如一个网络的拓扑）。由于每个序列恰好对应一棵树，它也是生成均匀随机树作为测试数据的最简单方法。'],
  'prime-factor': ['**RSA encryption**, which protects most connections on the Internet, rests on one fact: multiplying two 300-digit primes takes a moment, but nobody knows how to factor the product back in less than billions of years. Trial division is where every attack starts — and why it fails.', '保护着互联网上大多数连接的 **RSA 加密**依赖于一个事实：把两个 300 位的质数相乘只需一瞬间，但要把乘积重新分解，目前已知的方法都需要几十亿年。试除法是所有攻击的起点——也正说明了攻击为什么行不通。'],
}
