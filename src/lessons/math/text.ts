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
  'mod-inverse': {
    problem: ['Compute a ÷ b modulo a prime p: the number x in 0 … p − 1 with b · x ≡ a (mod p).', '计算 a ÷ b 在质数 p 模意义下的值：即 0 … p − 1 中满足 b · x ≡ a (mod p) 的数 x。'],
    why: ['Working modulo p means keeping only remainders. Sums, differences and products of remainders give the right remainder of the true result, but a quotient does not: the remainder of a tells you nothing about the remainder of a / b. Division has to be rebuilt from multiplication. The inverse of b is a number b⁻¹ whose product with b leaves remainder 1; multiplying by it undoes a multiplication by b, which is exactly what dividing means. When p is prime, every b that is not a multiple of p has such an inverse, and Fermat\'s little theorem names it. The theorem says b^(p − 1) ≡ 1 (mod p). Write the left side as b · b^(p − 2): then b^(p − 2) is a number that multiplied by b gives 1 — the inverse. Computing a power with an exponent near 10⁹ sounds expensive, but fast exponentiation needs only about thirty squarings. So a / b is a · b^(p − 2), with the remainder taken after every multiplication.', '在模 p 的意义下运算，就是只保留余数。余数的和、差、积都能给出真实结果的正确余数，但商不行：知道 a 的余数，并不能知道 a / b 的余数。除法必须用乘法重新建立起来。b 的逆元是这样一个数 b⁻¹：它与 b 的乘积余 1；乘以它正好抵消一次乘以 b，而这正是“除以 b”的含义。当 p 是质数时，每个不是 p 的倍数的 b 都有这样的逆元，费马小定理直接给出了它。定理说 b^(p − 1) ≡ 1 (mod p)。把左边写成 b · b^(p − 2)：那么 b^(p − 2) 就是一个与 b 相乘得 1 的数——也就是逆元。指数接近 10⁹ 的幂听起来代价很大，但快速幂只需要大约三十次平方。所以 a / b 就是 a · b^(p − 2)，每乘一次都取一次模。'],
    pitfalls: [
      ['Fermat\'s theorem needs a prime modulus. For a composite m use the extended Euclidean algorithm, or Euler\'s theorem with φ(m).', '费马小定理要求模数是质数。模数 m 是合数时，要用扩展欧几里得算法，或者用带 φ(m) 的欧拉定理。'],
      ['A multiple of p has no inverse: there is no division by 0, in any modulus.', 'p 的倍数没有逆元：任何模数下都不能除以 0。'],
      ['Reduce a before multiplying: a · inv overflows when a is not already below p.', '相乘之前要先对 a 取模：如果 a 不小于 p，a · inv 会溢出。'],
      ['(a / b) mod p computed with integer division first is simply wrong, even when b divides a exactly — unless a itself was never reduced.', '先做整数除法再取模得到的 (a / b) mod p 是错的，哪怕 b 恰好整除 a——除非 a 本身从未取过模。'],
    ],
  },
  crt: {
    problem: ['A number leaves remainder 2 when divided by 3, remainder 3 when divided by 5, and remainder 2 when divided by 7. What is the number? In general: given several pairwise coprime moduli and a remainder for each, find the smallest number with all those remainders.', '有一个数，除以 3 余 2，除以 5 余 3，除以 7 余 2。这个数是多少？一般地：给定若干个两两互质的模数和对应的余数，求满足所有这些余数的最小的数。'],
    why: ['The Chinese remainder theorem promises that the answer exists and is unique below the product of the moduli. The proof is also the algorithm: satisfy the conditions one after another. Suppose x already has the right remainders for the first few moduli, whose product is M. Adding any multiple of M changes none of those remainders, so the numbers x, x + M, x + 2M, … are all still fine. Among them, pick the one that also satisfies the next condition, x + M · t ≡ r (mod m). Rearranged, M · t ≡ r − x (mod m): a division by M modulo m. Since M shares no factor with m, it has an inverse modulo m, and t = (r − x) · M⁻¹ mod m. The modulus m is in general not prime, so the inverse is taken from the extended Euclidean algorithm. After the step, x fits one more condition and M has grown by the factor m. When all conditions are used, x is the smallest solution, and the others are x plus multiples of the full product.', '中国剩余定理保证：答案存在，并且在小于各模数之积的范围内是唯一的。它的证明同时也是算法：一个接一个地满足条件。假设 x 对前几个模数已经有了正确的余数，这些模数的乘积是 M。给 x 加上 M 的任意倍数，都不会改变这些余数，所以 x、x + M、x + 2M……仍然都满足。从中挑出同时满足下一个条件的那一个：x + M · t ≡ r (mod m)。移项得 M · t ≡ r − x (mod m)：这是在模 m 意义下除以 M。因为 M 与 m 没有公因子，M 在模 m 下有逆元，于是 t = (r − x) · M⁻¹ mod m。模数 m 一般不是质数，所以逆元要用扩展欧几里得算法来求。这一步之后，x 多满足了一个条件，M 也多乘了一个因子 m。所有条件都用完时，x 就是最小的解，其余的解是 x 加上全部模数之积的倍数。'],
    pitfalls: [
      ['(r − x) can be negative, and so can the inverse returned by exgcd. Normalise with (… % m + m) % m.', '(r − x) 可能是负数，exgcd 返回的逆元也可能是负数。要用 (… % m + m) % m 规范化。'],
      ['Multiplying before reducing overflows. Reduce both factors modulo m first; for moduli near 10⁹ and beyond, a product can still need 128-bit arithmetic.', '不先取模就相乘会溢出。要把两个因子都先对 m 取模；模数接近 10⁹ 或更大时，乘积仍可能需要 128 位运算。'],
      ['The method assumes coprime moduli. If they share factors, a solution may not exist at all; the general case divides by the gcd first.', '这个方法假定模数两两互质。如果它们有公因子，解可能根本不存在；一般情况要先除以最大公约数。'],
      ['The product of the moduli must fit in the integer type — it grows very quickly.', '模数的乘积必须在整数类型的范围内——它增长得非常快。'],
    ],
  },
  'binomial-mod': {
    problem: ['Answer many questions "how many ways are there to choose k things out of n?" modulo a prime p, for n up to a million.', '回答许多个“从 n 个东西里选 k 个有多少种方法？”的询问，结果对质数 p 取模，n 最大到一百万。'],
    why: ['Pascal\'s triangle would need a table with n² entries — a million million of them. The closed formula C(n, k) = n! / (k! · (n − k)!) needs only factorials, and there are just n + 1 of those. The obstacle is the division, which does not work on remainders. But modulo a prime, dividing by k! is multiplying by the inverse of k!, so the formula becomes fact[n] · inv[k] · inv[n − k]. The factorials are built upward, each from the one before. Their inverses could each be computed by a fast exponentiation, which would cost n times log p. There is a much cheaper way: compute only the inverse of the largest factorial, and then walk downward. Since i! = (i − 1)! · i, we have 1 / (i − 1)! = (1 / i!) · i — one multiplication per step. After this linear preparation, every question is answered with two multiplications.', '杨辉三角需要一张 n² 大小的表——那是一万亿个数。而公式 C(n, k) = n! / (k! · (n − k)!) 只用到阶乘，阶乘一共只有 n + 1 个。障碍在于除法，它对余数不成立。但在质数模下，除以 k! 就是乘以 k! 的逆元，于是公式变成 fact[n] · inv[k] · inv[n − k]。阶乘从小到大依次算出，每个都由前一个得到。它们的逆元当然可以各用一次快速幂来求，但那要花 n 乘以 log p 的时间。有一个便宜得多的办法：只求最大的那个阶乘的逆元，然后从大到小往回推。因为 i! = (i − 1)! · i，所以 1 / (i − 1)! = (1 / i!) · i——每一步只要一次乘法。经过这样线性时间的预处理，每个询问只需两次乘法。'],
    pitfalls: [
      ['If n can reach p, then n! ≡ 0 (mod p) and has no inverse. This method needs n < p; beyond that use Lucas\' theorem.', '如果 n 能达到 p，那么 n! ≡ 0 (mod p)，它没有逆元。这个方法要求 n < p；超出时要用卢卡斯定理。'],
      ['Forgetting the case k > n (or k < 0) reads outside the array. The answer there is 0.', '忘记处理 k > n（或 k < 0）的情况会访问到数组之外。这时答案是 0。'],
      ['Three numbers below p multiplied without reducing in between overflow long long. Take the remainder after each product.', '三个小于 p 的数连乘而中间不取模，会超出 long long。每乘一次都要取模。'],
      ['Computing each inverse factorial by its own exponentiation works, but costs a factor of log p for nothing.', '每个阶乘的逆元都单独用一次快速幂去求也可以，但白白多花了 log p 倍的时间。'],
    ],
  },
  'incl-excl': {
    problem: ['How many of the numbers 1 … n are divisible by at least one of k given primes?', '在 1 … n 中，有多少个数至少能被给定的 k 个质数中的一个整除？'],
    why: ['Counting the multiples of each prime separately is easy — there are ⌊n / p⌋ of them — but the sets overlap, and a number divisible by two of the primes is counted twice. Subtracting the numbers divisible by each pair repairs that, but goes too far for numbers divisible by three primes: they were added three times, then subtracted three times, and are now missing; so they are added back. The pattern continues, alternating in sign. This is the inclusion–exclusion principle: the size of a union is the sum of the single sets, minus the pairwise intersections, plus the triple intersections, and so on. It is correct because of how often each element ends up being counted: an element lying in exactly j of the sets is counted C(j, 1) − C(j, 2) + C(j, 3) − … times, and that alternating sum is exactly 1. Here an intersection is simple: a number is divisible by several different primes exactly when it is divisible by their product, so the count is ⌊n / product⌋. The program walks through all 2ᵏ − 1 non-empty groups of primes, each written as a bitmask.', '分别数出每个质数的倍数很容易——有 ⌊n / p⌋ 个——但这些集合是重叠的，能被其中两个质数整除的数被算了两次。减去能被每一对质数同时整除的数可以修正这一点，但对能被三个质数整除的数又减过了头：它们先被加了三次，又被减了三次，现在一次也没算；所以还要再加回来。这个规律一直延续下去，符号交替变化。这就是容斥原理：并集的大小等于各个集合的大小之和，减去两两的交，加上三个的交，依此类推。它之所以正确，要看每个元素最终被算了几次：一个恰好属于 j 个集合的元素，被算了 C(j, 1) − C(j, 2) + C(j, 3) − … 次，而这个交错和恰好等于 1。这里的交集很简单：一个数能同时被几个不同的质数整除，当且仅当它能被它们的乘积整除，所以个数是 ⌊n / 乘积⌋。程序遍历这些质数的全部 2ᵏ − 1 个非空组合，每个组合用一个二进制掩码表示。'],
    pitfalls: [
      ['The product of many primes overflows long long long before the loop ends. Stop as soon as it would exceed n.', '许多质数的乘积早在循环结束之前就会超出 long long。一旦它将要超过 n 就应停下。'],
      ['Getting the sign backwards (adding the even groups) gives minus the right answer plus n.', '把符号弄反（偶数个的组合取加号），得到的是“n 减去正确答案”的相反数之类的错误结果。'],
      ['With numbers that are not coprime, the intersection is the multiples of their least common multiple, not of their product.', '如果这些数不互质，交集是它们最小公倍数的倍数，而不是乘积的倍数。'],
      ['2ᵏ terms: 20 conditions are fine, 40 are not.', '共 2ᵏ 项：20 个条件没问题，40 个就不行了。'],
    ],
  },
  'matrix-power': {
    problem: ['Compute the Fibonacci number F(n) modulo 1 000 000 007 for n as large as 10¹⁵.', '计算斐波那契数 F(n) 对 1 000 000 007 取模的值，n 最大可达 10¹⁵。'],
    why: ['The loop F(i) = F(i − 1) + F(i − 2) takes n steps, and 10¹⁵ steps are out of reach. Look at what one step does to the pair of the two latest values: (F(n + 1), F(n)) becomes (F(n + 1) + F(n), F(n + 1)). Each new entry is a fixed sum of multiples of the old entries. A rule of that shape is exactly what a matrix expresses: the new pair is the matrix [[1, 1], [1, 0]] times the old pair. Applying the rule n times is multiplying by that matrix n times, and because matrix multiplication is associative, the n multiplications can be grouped first into a single matrix, the n-th power. Powers are what fast exponentiation is for: square repeatedly and multiply together the squares that the binary digits of n select. Nothing in that method requires numbers — only an associative product and a "one", which here is the identity matrix. So about fifty products of 2 × 2 matrices replace 10¹⁵ additions. The same idea handles any recurrence in which each term is a fixed linear combination of a few earlier ones.', '循环 F(i) = F(i − 1) + F(i − 2) 需要 n 步，而 10¹⁵ 步是不可能完成的。看看每一步对最近两个值组成的数对做了什么：(F(n + 1), F(n)) 变成 (F(n + 1) + F(n), F(n + 1))。每个新的分量都是旧分量的固定倍数之和。这种形式的规则正是矩阵所表达的：新的数对等于矩阵 [[1, 1], [1, 0]] 乘以旧的数对。把规则作用 n 次，就是乘上这个矩阵 n 次；而矩阵乘法满足结合律，所以可以先把这 n 次乘法合并成一个矩阵，也就是它的 n 次幂。求幂正是快速幂的用武之地：反复平方，再把 n 的二进制位所选中的那些平方乘起来。这个方法并不要求操作的对象是数——只需要一个满足结合律的乘法，以及一个“1”，在这里就是单位矩阵。于是大约五十次 2 × 2 矩阵的乘法就取代了 10¹⁵ 次加法。任何“每一项都是前面若干项的固定线性组合”的递推，都可以用同样的办法处理。'],
    pitfalls: [
      ['Starting res as the zero matrix instead of the identity makes every product zero.', '把 res 的初值设成零矩阵而不是单位矩阵，所有的乘积都会是零。'],
      ['Matrix multiplication is not commutative. Here every factor is a power of the same matrix, so the order happens not to matter — in general it does.', '矩阵乘法不满足交换律。这里所有的因子都是同一个矩阵的幂，所以顺序恰好无所谓——一般情况下顺序是有影响的。'],
      ['Writing the result of a product into one of its own operands while it is still being read corrupts it. Compute into a fresh matrix.', '把乘积直接写进还在被读取的那个操作数里，会把它破坏掉。要写到一个新的矩阵里。'],
      ['A k × k matrix product costs k³ operations: fine for k up to about 100, not for thousands.', 'k × k 矩阵相乘需要 k³ 次运算：k 在 100 左右没有问题，上千就不行了。'],
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
  'mod-inverse': ['Every **https** connection and every contactless card payment does arithmetic modulo a huge prime, and "dividing" there means multiplying by an inverse found exactly like this. A digital signature cannot be created or checked without one.', '每一次 **https** 连接、每一笔刷卡支付，都在某个巨大质数的模意义下做运算，其中的“除法”就是乘以用这种方法求出的逆元。没有它，数字签名既无法生成，也无法验证。'],
  crt: ['Sun Zi posed the puzzle about 1 500 years ago as a way of **counting soldiers**: line them up in rows of 3, of 5 and of 7, note how many are left over each time, and you know the total without counting everyone. Today RSA decryption uses the same theorem to work with two half-size numbers instead of one huge one, about four times faster.', '大约 1500 年前，孙子提出这个问题是为了**点兵**：让士兵分别按 3 人、5 人、7 人一排列队，记下每次剩余的人数，不用逐个清点就能知道总数。今天，RSA 解密利用同一个定理，把一个巨大的数拆成两个一半长的数来计算，速度大约快四倍。'],
  'binomial-mod': ['The chance of winning a **lottery** that draws 6 numbers out of 49 is 1 in C(49, 6) = 13 983 816. Card-game odds, the number of possible committees, and the error-correcting codes that keep a scratched disc readable are all counted with binomial coefficients — often very large ones, which is why contests ask for them modulo a prime.', '从 49 个号码中开出 6 个的**彩票**，中头奖的概率是 C(49, 6) = 13 983 816 分之一。牌局中的概率、可能的委员会数目、让划伤的光盘仍然可读的纠错码，都要用组合数来计算——而且常常是非常大的组合数，所以竞赛题总是要求对一个质数取模。'],
  'incl-excl': ['A **survey** finds that 60 people speak English, 40 speak French and 25 speak both. How many speak at least one? Not 100, but 60 + 40 − 25 = 75. A database does the same arithmetic when it estimates how many rows match "A or B or C" without reading them.', '一项**调查**发现 60 人会英语，40 人会法语，25 人两种都会。至少会其中一种的有多少人？不是 100，而是 60 + 40 − 25 = 75。数据库在不读取数据的情况下估计有多少行满足“A 或 B 或 C”时，做的是同样的算术。'],
  'matrix-power': ['A **3-D game** moves, turns and scales every object by multiplying its points with a matrix, and combines a thousand such moves into one by multiplying the matrices first. Population forecasts, the long-run behaviour of a random web surfer (the idea behind PageRank) and interest compounding over many periods are all high powers of a matrix.', '**三维游戏**通过让物体上的点与矩阵相乘来实现移动、旋转和缩放，并且把上千次这样的变换先乘成一个矩阵再使用。人口预测、随机浏览网页者的长期行为（PageRank 背后的思想）、多期复利，本质上都是矩阵的高次幂。'],
}
