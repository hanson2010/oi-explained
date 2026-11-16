import { arr, graph, grid, gt, layoutTree, span, tn } from '../../engine/h'
import type { Extras } from '../extras'
import { at, col, ed, row } from '../story-util'

/** Points A–G of the convex-hull story (y grows upward in the story, downward on screen). */
const PTS: [number, number][] = [[0, 1], [1, 0], [3, 0], [4, 2], [2, 3], [2, 1], [1, 1]]
const PT_POS = at(PTS.map(([x, y]) => [x, 3 - y] as const))
const PT_LABEL = [...'ABCDEFG']

/** The tree 5-2, 2-6, 6-3, 6-1, 1-4 of the Prüfer story, drawn from vertex 6. */
const PRUFER_ES: [number, number][] = [[4, 1], [1, 5], [5, 2], [5, 0], [0, 3]]

export const MATH: Record<string, Extras> = {
  gcd: {
    story: [
      { kind: 'naive', title: ['Start with subtraction', '先从减法开始'],
        body: ['Trying every candidate divisor is hopeless for numbers near 10¹⁸. But notice: if d divides both a and b, it also divides a − b; and anything dividing b and a − b divides a. So the pairs (a, b) and (a − b, b) have ==exactly the same common divisors==. Keep replacing the larger number by the difference until one of them is 0 — the other is the answer.', '对接近 10¹⁸ 的数，逐个尝试约数是没有希望的。但请注意：如果 d 同时整除 a 和 b，它也整除 a − b；反过来，能整除 b 和 a − b 的数也整除 a。所以 (a, b) 与 (a − b, b) 这两对数的==公约数完全相同==。不断把较大的数换成两数之差，直到其中一个变成 0——另一个就是答案。'],
        fig: () => [grid('gcd(60, 9) by subtraction: 9 is subtracted six times before anything else happens', [[60, 51, 42, 33, 24, 15, 6], [9, 9, 9, 9, 9, 9, 9]], gt({ cmp: row(0, 0, 5), ok: [[0, 6]] }), { rows: ['a', 'b'] })] },
      { kind: 'insight', title: ['Many subtractions are one remainder', '许多次减法，其实就是一次取余'],
        body: ['Subtracting b as often as it fits leaves exactly `a mod b`. So do all of those steps at once: replace (a, b) by ==(b, a mod b)==. The common divisors still do not change, but the numbers now shrink by division instead of by subtraction.', '把 b 能减多少次就减多少次，剩下的恰好是 `a mod b`。所以把这些步骤一次做完：把 (a, b) 换成 ==(b, a mod b)==。公约数仍然不变，但现在数是靠除法而不是靠减法变小的。'],
        fig: () => [grid('gcd(60, 9)', [[60, 9, 6, 3], [9, 6, 3, 0], [6, 3, 0, '']], gt({ cmp: row(2, 0, 2), ok: [[0, 3]], dim: [[1, 3]] }), { rows: ['a', 'b', 'a mod b'], cols: ['step 1', 'step 2', 'step 3', 'b = 0: answer 3'] })] },
      { kind: 'how', title: ['Repeat until the second number is 0', '重复到第二个数变成 0'],
        body: ['`while (b) { r = a % b; a = b; b = r; }`. Everything divides 0, so gcd(a, 0) = a: when b reaches 0, the answer is a. If a < b at the start, the first step simply swaps them.', '`while (b) { r = a % b; a = b; b = r; }`。任何数都整除 0，所以 gcd(a, 0) = a：b 变成 0 时，答案就是 a。如果一开始 a < b，第一步只是把它们交换了一下。'] },
      { kind: 'result', title: ['The numbers at least halve every two steps', '每两步，数至少减半'],
        body: ['A remainder is smaller than half of the number it was taken from, so after two steps the larger number has at least halved: **O(log min(a, b))** — about 90 steps at most for 64-bit numbers. The least common multiple follows as `a / gcd(a, b) × b` (divide first to avoid overflow).', '余数一定小于被除数的一半，所以每过两步，较大的数至少减半：**O(log min(a, b))**——对 64 位整数最多大约 90 步。最小公倍数也随之得到：`a / gcd(a, b) × b`（先除后乘，避免溢出）。'] },
    ],
    flow: [
      { id: 'read', kind: 'start', text: ['read a, b', '读入 a、b'], on: [] },
      { id: 'loop', kind: 'test', text: ['b ≠ 0 ?', 'b ≠ 0 ？'], no: 'done', on: [] },
      { id: 'mod', text: ['r = a mod b;   a = b;   b = r', 'r = a mod b；a = b；b = r'], next: 'loop' },
      { id: 'done', kind: 'end', text: ['print a', '输出 a'] },
    ],
  },

  'linear-sieve': {
    story: [
      { kind: 'naive', title: ['Start from the sieve of Eratosthenes', '从埃氏筛出发'],
        body: ['It crosses out the multiples of every prime — so a number with several prime factors is crossed out **several times**: 30 by 2, by 3 and by 5. That repeated work is the log log n factor.', '它把每个素数的倍数都划掉——于是有多个素因子的数会被划掉**好几次**：30 被 2 划一次，被 3 划一次，被 5 再划一次。这些重复劳动就是那个 log log n 因子的来源。'],
        fig: () => [arr('30 is crossed out three times', ['2 × 15', '3 × 10', '5 × 6'], tn({ ok: 0, bad: [1, 2] }))] },
      { kind: 'insight', title: ['Make one prime responsible: the smallest prime factor', '只让一个素数负责：最小的素因子'],
        body: ['Write a composite m as `p × i` with p its ==smallest prime factor==. Then i has no prime factor smaller than p. If we generate exactly these products — and no others — every composite is crossed out exactly once.', '把合数 m 写成 `p × i`，其中 p 是它==最小的素因子==。那么 i 没有比 p 更小的素因子。如果我们恰好生成这样的乘积——不多也不少——每个合数就恰好被划掉一次。'] },
      { kind: 'how', title: ['Multiply i by the primes in order, and stop when one divides i', '让 i 依次乘上各个素数，遇到能整除 i 的就停'],
        body: ['For every i (prime or not), go through the primes found so far, smallest first, and cross out `i × p`. ==Stop right after the first p that divides i==: up to that point p is no larger than i\'s smallest prime factor, so p really is the smallest prime factor of i × p. Beyond it, i × q would contain the smaller prime p — that product belongs to another i.', '对每个 i（无论是不是素数），从小到大遍历已经找到的素数，划掉 `i × p`。==遇到第一个能整除 i 的 p，划完就停==：在此之前，p 都不超过 i 的最小素因子，所以 p 确实是 i × p 的最小素因子。再往后，i × q 里会含有更小的素数 p——那个乘积该由别的 i 来负责。'],
        fig: () => [grid('which products each i crosses out', [['8 — stop: 2 divides 4', '—', '—'], [10, 15, '25 — stop'], ['12 — stop: 2 divides 6', '—', '—']], gt({ ok: [[0, 0], [1, 0], [1, 1], [1, 2], [2, 0]], dim: [[0, 1], [0, 2], [2, 1], [2, 2]] }), { rows: ['i = 4', 'i = 5', 'i = 6'], cols: ['× 2', '× 3', '× 5'] })] },
      { kind: 'result', title: ['Every composite exactly once', '每个合数恰好一次'],
        body: ['n numbers, each crossed out at most once: **O(n)**. The sieve also knows the smallest prime factor of every number, which factorises any m ≤ n in O(log m), and the same loop computes Euler\'s φ, the Möbius function and other multiplicative functions on the way.', 'n 个数，每个最多被划一次：**O(n)**。这个筛法还顺便知道了每个数的最小素因子，用它可以在 O(log m) 内分解任何 m ≤ n；同一个循环还能顺带算出欧拉函数 φ、莫比乌斯函数等积性函数。'] },
    ],
    flow: [
      { id: 'init', kind: 'start', text: ['i = 2', 'i = 2'], on: [] },
      { id: 'loop', kind: 'test', text: ['i ≤ n ?', 'i ≤ n ？'], no: 'done', on: [] },
      { id: 'prime', text: ['if i is not crossed out: it is prime, append it to the list', '若 i 没有被划掉：它是素数，加入素数表'] },
      { id: 'next', kind: 'test', text: ['another prime p in the list with i × p ≤ n ?', '表中还有满足 i × p ≤ n 的素数 p ？'], no: 'inc', on: [] },
      { id: 'cross', text: ['cross out i × p', '划掉 i × p'] },
      { id: 'stop', kind: 'test', text: ['does p divide i ?', 'p 整除 i ？'], yes: 'inc', no: 'next' },
      { id: 'inc', text: ['i++', 'i++'], next: 'loop', on: [] },
      { id: 'done', kind: 'end', text: ['print the number of primes', '输出素数的个数'] },
    ],
  },

  pascal: {
    story: [
      { kind: 'naive', title: ['Start with the formula', '先看公式'],
        body: ['C(n, k) = n! / (k! · (n − k)!). But 21! already overflows a 64-bit integer, and the answer is wanted modulo a prime — where plain __division__ does not work. The formula is fine on paper and awkward in a program.', 'C(n, k) = n! / (k! · (n − k)!)。可是 21! 就已经超出 64 位整数的范围了，而且答案要对一个素数取模——在取模意义下不能直接做__除法__。这个公式写在纸上很好，放进程序里却很别扭。'] },
      { kind: 'insight', title: ['Single out one item: it is chosen, or it is not', '单独看一件物品：要么选它，要么不选'],
        body: ['Selections of k items out of n split into two kinds. Those that ==contain== the last item choose the other k − 1 from the remaining n − 1. Those that ==do not== choose all k from the remaining n − 1. The kinds do not overlap, so `C(n, k) = C(n−1, k−1) + C(n−1, k)` — additions only.', '从 n 件物品中选 k 件的方案分成两类。==包含==最后一件物品的方案，要从其余 n − 1 件中再选 k − 1 件。==不包含==它的方案，要从其余 n − 1 件中选满 k 件。两类互不重叠，所以 `C(n, k) = C(n−1, k−1) + C(n−1, k)`——只需要加法。'] },
      { kind: 'how', title: ['Each number is the sum of the two above it', '每个数等于它上方两个数之和'],
        body: ['Fill a triangle row by row. The edges are 1 — there is one way to choose nothing and one way to choose everything. Every inner entry adds its upper-left and upper neighbours, and the remainder can be taken after every addition.', '一行一行地填这个三角形。两条边上都是 1——什么都不选只有一种方案，全选也只有一种方案。内部的每个数等于它左上方和正上方的两个数相加，每次加完都可以取模。'],
        fig: () => [grid('C(5, 2) = C(4, 1) + C(4, 2) = 4 + 6 = 10', [[1, '', '', '', '', ''], [1, 1, '', '', '', ''], [1, 2, 1, '', '', ''], [1, 3, 3, 1, '', ''], [1, 4, 6, 4, 1, ''], [1, 5, 10, 10, 5, 1]], gt({ dim: col(0, 0, 5), cmp: [[4, 1], [4, 2]], act: [[5, 2]] }), { rows: span(0, 5).map(i => 'n = ' + i), cols: span(0, 5).map(i => 'k = ' + i) })] },
      { kind: 'result', title: ['A recurrence: later values from earlier ones', '递推：由前面的值得到后面的值'],
        body: ['**O(n²)** additions give every C(i, j) up to n, under any modulus. Row n is also the coefficients of (a + b)ⁿ. For a few values with n up to 10⁶ or more, precompute factorials and their modular inverses instead — the triangle would be too big.', '**O(n²)** 次加法就能得到 n 以内的所有 C(i, j)，对任何模数都适用。第 n 行同时也是 (a + b)ⁿ 展开式的各项系数。如果 n 达到 10⁶ 以上而只需要少数几个值，应改为预处理阶乘及其逆元——那时整个三角形就太大了。'] },
    ],
    flow: [
      { id: 'init', kind: 'start', text: ['i = 0', 'i = 0'], on: [] },
      { id: 'loop', kind: 'test', text: ['i ≤ n ?', 'i ≤ n ？'], no: 'done', on: [] },
      { id: 'edge', text: ['c[i][0] = 1', 'c[i][0] = 1'] },
      { id: 'add', text: ['for j = 1 … i:   c[i][j] = (c[i−1][j−1] + c[i−1][j]) mod M;    i++', '对 j = 1 … i：c[i][j] = (c[i−1][j−1] + c[i−1][j]) mod M；i++'], next: 'loop' },
      { id: 'done', kind: 'end', text: ['print row n', '输出第 n 行'] },
    ],
  },

  exgcd: {
    story: [
      { kind: 'naive', title: ['Start simple: search for x and y', '先从最简单的做起：搜索 x 和 y'],
        body: ['For 60x + 9y = 3 you could try x = 0, ±1, ±2, … and check whether y comes out as an integer. There is no bound on how far to search, and for large a and b it never ends.', '对于 60x + 9y = 3，可以试 x = 0、±1、±2……再看 y 是不是整数。可是搜索范围没有上限，a 和 b 很大时根本搜不完。'] },
      { kind: 'insight', title: ['Euclid\'s algorithm already contains the answer', '欧几里得算法里已经藏着答案'],
        body: ['Euclid reduces (a, b) to (b, a mod b) until b = 0. At the bottom the equation is trivial: `g · 1 + 0 · 0 = g`. And each step up is only a __substitution__: if the smaller problem is solved, the larger one is too. So ==solve at the bottom and carry the solution back up==.', '欧几里得算法把 (a, b) 不断化为 (b, a mod b)，直到 b = 0。在最底层，方程是显然成立的：`g · 1 + 0 · 0 = g`。而每往上一层，只是做一次__代换__：小问题解决了，大问题也就解决了。所以==在最底层求解，再把解一层层带回来==。'] },
      { kind: 'how', title: ['One substitution per level', '每一层做一次代换'],
        body: ['Suppose `b·x′ + (a mod b)·y′ = g`. Replace `a mod b` by `a − ⌊a/b⌋·b` and collect the terms with a and with b: `a·y′ + b·(x′ − ⌊a/b⌋·y′) = g`. So ==x = y′== and ==y = x′ − ⌊a/b⌋ · y′==.', '假设 `b·x′ + (a mod b)·y′ = g`。把 `a mod b` 换成 `a − ⌊a/b⌋·b`，再按 a 和 b 合并同类项：`a·y′ + b·(x′ − ⌊a/b⌋·y′) = g`。所以 ==x = y′==，==y = x′ − ⌊a/b⌋ · y′==。'],
        fig: () => [grid('a = 60, b = 9: read the table from the bottom row up', [[60, 9, 6, -1, 7, '60·(−1) + 9·7 = 3'], [9, 6, 1, 1, -1, '9·1 + 6·(−1) = 3'], [6, 3, 2, 0, 1, '6·0 + 3·1 = 3'], [3, 0, '', 1, 0, '3·1 + 0·0 = 3']], gt({ ok: [[0, 3], [0, 4]], cmp: [[3, 3], [3, 4]], dim: col(2, 0, 3) }), { rows: ['level 1', 'level 2', 'level 3', 'bottom'], cols: ['a', 'b', '⌊a / b⌋', 'x', 'y', 'check'] })] },
      { kind: 'result', title: ['The key to modular division', '模意义下做除法的钥匙'],
        body: ['Same cost as Euclid: **O(log min(a, b))**. Its main use: if gcd(a, m) = 1, then `a·x + m·y = 1` says that x is the ==inverse of a modulo m==. By Bézout, `a·x + b·y = c` is solvable exactly when gcd(a, b) divides c, and from one solution all others follow by adding multiples of b/g to x. The Chinese remainder theorem is built on the same step.', '代价与欧几里得算法相同：**O(log min(a, b))**。它最主要的用途：如果 gcd(a, m) = 1，那么 `a·x + m·y = 1` 就说明 x 是 ==a 在模 m 意义下的逆元==。根据裴蜀定理，`a·x + b·y = c` 有解当且仅当 gcd(a, b) 整除 c；由一组解出发，给 x 加上 b/g 的倍数就能得到所有的解。中国剩余定理也是建立在这一步之上的。'] },
    ],
    flow: [
      { id: 'call', kind: 'start', text: ['exgcd(a, b)', 'exgcd(a, b)'], on: [] },
      { id: 'base', kind: 'test', text: ['b = 0 ?   (then x = 1, y = 0, g = a)', 'b = 0 ？（则 x = 1，y = 0，g = a）'], yes: 'done' },
      { id: 'down', text: ['solve the smaller problem:   (x′, y′) = exgcd(b, a mod b)', '求解更小的问题：(x′, y′) = exgcd(b, a mod b)'] },
      { id: 'up', text: ['x = y′;    y = x′ − ⌊a / b⌋ · y′', 'x = y′；y = x′ − ⌊a / b⌋ · y′'] },
      { id: 'done', kind: 'end', text: ['return g   (at the top: print x, y, g)', '返回 g（最外层：输出 x、y、g）'] },
    ],
  },

  gauss: {
    story: [
      { kind: 'naive', title: ['Start with substitution by hand', '先看手算时的代入法'],
        body: ['Solve one equation for x, substitute it into the others, repeat. It works for two unknowns; with a hundred it becomes a tangle of expressions. A program needs the same idea as a __uniform operation on numbers__.', '从一个方程里解出 x，代入其余的方程，重复下去。两个未知数时可以这样做；一百个未知数时就成了一团乱麻。程序需要的是同样的思想，但要表现为__对数字的统一操作__。'] },
      { kind: 'insight', title: ['Three moves that never change the solutions', '三种永远不改变解的操作'],
        body: ['Write only the coefficients, as a table with the right-hand sides in the last column. You may ==swap two rows==, ==multiply a row by a non-zero number==, or ==add a multiple of one row to another== — the solutions stay the same. Use these moves until each unknown appears in exactly one row, with coefficient 1.', '只把系数写下来，排成一张表，最后一列是等号右边的数。你可以==交换两行==、==把一行乘以一个非零的数==，或者==把一行的若干倍加到另一行上==——方程组的解都不会变。用这些操作一直做到每个未知数只出现在一行里，并且系数为 1。'],
        fig: () => [grid('x + 2y = 5,   3x + 4y = 11', [[1, 2, 5], [3, 4, 11]], gt({ cmp: col(2, 0, 1) }), { cols: ['x', 'y', '='] })] },
      { kind: 'how', title: ['Column by column: pick a pivot, scale it, clear the rest', '一列一列地做：选主元、化为 1、把其余的消掉'],
        body: ['For column c: among the rows not yet used, take the one with the ==largest absolute value== in this column (dividing by a tiny number magnifies rounding errors) and swap it into place. Divide that row by its pivot. Then subtract the right multiple of it from __every other row__, so the column becomes zero everywhere else.', '处理第 c 列：在还没用过的行里，选这一列==绝对值最大==的那一行（除以很小的数会放大舍入误差），把它换到当前位置。把这一行除以主元。然后从__其余每一行__中减去它的适当倍数，使这一列的其他位置都变成 0。'],
        fig: () => [grid('after column x: the row with 3 was chosen, scaled, and subtracted from the other', [[1, '1.33', '3.67'], [0, '0.67', '1.33']], gt({ ok: col(0, 0, 1), act: [[1, 1]] }), { cols: ['x', 'y', '='] }), grid('after column y: x = 1, y = 2', [[1, 0, 1], [0, 1, 2]], gt({ ok: col(2, 0, 1), dim: [[0, 1], [1, 0]] }), { cols: ['x', 'y', '='] })] },
      { kind: 'result', title: ['The answer appears in the last column', '答案出现在最后一列'],
        body: ['n columns, each clearing n rows of n numbers: **O(n³)**. If some column has no non-zero pivot left, that unknown is not pinned down — no solution or infinitely many. The same procedure computes determinants and matrix inverses, works modulo a prime (divide by multiplying with the inverse), and with xor instead of subtraction it solves systems over bits.', 'n 列，每列要消去 n 行、每行 n 个数：**O(n³)**。如果某一列找不到非零的主元，说明这个未知数无法确定——方程组无解或有无穷多解。同样的过程还能求行列式和逆矩阵，也可以在模素数意义下进行（除法改为乘以逆元）；把减法换成异或，就能解二进制位上的方程组。'] },
    ],
    flow: [
      { id: 'init', kind: 'start', text: ['column c = 0', '列 c = 0'], on: [] },
      { id: 'loop', kind: 'test', text: ['c < n ?', 'c < n ？'], no: 'done', on: [] },
      { id: 'find', text: ['p = the row from c downward with the largest |a[p][c]|', 'p = 从第 c 行往下 |a[p][c]| 最大的那一行'], on: [] },
      { id: 'none', kind: 'test', text: ['is a[p][c] zero ?', 'a[p][c] 为 0 ？'], yes: 'fail', no: 'pivot' },
      { id: 'pivot', text: ['swap row p into position c', '把第 p 行换到第 c 行'] },
      { id: 'norm', text: ['divide row c by a[c][c]', '把第 c 行除以 a[c][c]'] },
      { id: 'elim', text: ['subtract a[i][c] × row c from every other row i;    c++', '从其余每一行 i 减去 a[i][c] × 第 c 行；c++'], next: 'loop' },
      { id: 'fail', kind: 'end', text: ['print "No Solution"', '输出 "No Solution"'], on: ['none'] },
      { id: 'done', kind: 'end', text: ['print the last column', '输出最后一列'] },
    ],
  },

  'convex-hull': {
    story: [
      { kind: 'naive', title: ['Start simple: test every pair of points', '先从最简单的做起：检查每一对点'],
        body: ['Two points form a hull edge exactly when all other points lie on one side of the line through them. Checking every pair against every other point is **O(n³)**.', '两个点构成凸包的一条边，当且仅当其余所有点都在过这两点的直线的同一侧。对每一对点都检查其余所有点，是 **O(n³)**。'] },
      { kind: 'insight', title: ['Walking around the hull, you only ever turn left', '绕着凸包走，永远只向左拐'],
        body: ['Picture a rubber band around nails. Going round it anticlockwise, every corner is a __left turn__. And a turn can be tested locally: for three points a, b, c the cross product `(b − a) × (c − a)` is ==positive for a left turn==, negative for a right turn, zero on a straight line.', '想象一根橡皮筋套在一圈钉子上。逆时针绕它走一圈，每个拐角都是__向左拐__。而拐弯的方向可以局部判断：对于三个点 a、b、c，叉积 `(b − a) × (c − a)` ==为正表示向左拐==，为负表示向右拐，为零表示三点共线。'],
        fig: () => [graph(PT_POS, ed([[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]]), { name: 'the hull A → B → C → D → E; F and G are inside', label: PT_LABEL, tone: tn({ ok: span(0, 4), dim: [5, 6] }), et: tn({ ok: span(0, 4) }) })] },
      { kind: 'how', title: ['Sweep from left to right with a stack', '用一个栈从左到右扫一遍'],
        body: ['Sort the points by x (then y) and add them one by one. Before pushing a point: while the last two stack points and the new one ==do not make a left turn==, the middle point is inside the hull — __pop__ it and test again. That builds the lower boundary. A second sweep from right to left, with the same rule, builds the upper boundary.', '把点按 x（再按 y）排序，然后一个一个加入。压入新点之前：只要栈顶的两个点与新点==不构成向左拐==，中间那个点就在凸包内部——把它__弹出__，再检查一次。这样得到下凸壳。再从右到左按同样的规则扫一遍，就得到上凸壳。'],
        fig: () => [graph(PT_POS, [...ed([[0, 1], [1, 5], [5, 4]]), { u: 1, v: 2, dash: true }], { name: 'stack A, B, F, E when C arrives: B → F → C turns right, so E and F are popped', label: PT_LABEL, tone: tn({ ok: [0, 1], bad: [4, 5], act: 2, dim: [3, 6] }), et: tn({ ok: 0, bad: [1, 2], act: 3 }) })] },
      { kind: 'result', title: ['After sorting, linear', '排序之后是线性的'],
        body: ['Each point is pushed once per sweep and popped at most once, so the sweeps are O(n) and the sort dominates: **O(n log n)**. Using `≤ 0` in the test drops points that lie on an edge. The hull is the starting point for the farthest pair of points (rotating calipers), for areas (sum of cross products) and for many optimisation tricks.', '每个点在每趟扫描中只入栈一次、最多出栈一次，所以扫描是 O(n)，主要代价在排序：**O(n log n)**。判断时用 `≤ 0` 可以去掉位于边上的点。凸包是许多问题的起点：最远点对（旋转卡壳）、面积（叉积之和），以及不少优化技巧。'] },
    ],
    flow: [
      { id: 'sort', kind: 'start', text: ['sort the points by x, then y;  remove duplicates', '把点按 x、再按 y 排序；去掉重复的点'] },
      { id: 'lower', kind: 'test', text: ['lower hull: another point p, left to right ?', '下凸壳：从左到右还有点 p ？'], no: 'upper', on: [] },
      { id: 'pop', text: ['while the last two hull points and p do not turn left:  pop', '只要栈顶两点与 p 不构成向左拐：弹出'] },
      { id: 'push', text: ['push p', '压入 p'], next: 'lower' },
      { id: 'upper', kind: 'test', text: ['upper hull: another point p, right to left ?', '上凸壳：从右到左还有点 p ？'], no: 'done', on: [] },
      { id: 'upop', text: ['while they do not turn left:  pop   (never into the lower hull)', '只要不构成向左拐：弹出（不能弹到下凸壳里）'] },
      { id: 'upush', text: ['push p', '压入 p'], next: 'upper' },
      { id: 'done', kind: 'end', text: ['print the number of vertices and twice the area', '输出顶点数和面积的两倍'] },
    ],
  },

  'nim-sg': {
    story: [
      { kind: 'naive', title: ['Start with one pile: label positions as winning or losing', '先看一堆：给每个局面标上必胜或必败'],
        body: ['Work backwards: a position is __losing__ if every move leads to a winning position (or there is no move), and __winning__ if some move leads to a losing one. That settles a single pile. But with several piles it is not enough: two piles that are each "winning" on their own may be losing together.', '倒着推：如果每一步都只能走到必胜局面（或者根本无路可走），这个局面就是__必败__的；如果有一步能走到必败局面，它就是__必胜__的。一堆的情况这样就解决了。但有多堆时这还不够：两堆各自“必胜”，合在一起却可能是必败。'],
        fig: () => [arr('one pile, allowed moves: take 2 or 3.   W = the player to move wins', ['L', 'L', 'W', 'W', 'W', 'L', 'L'], tn({ bad: [0, 1, 5, 6], ok: [2, 3, 4] }))] },
      { kind: 'insight', title: ['Give every position a number, not just a label', '给每个局面一个数，而不只是一个标签'],
        body: ['Define `SG(x)` as the **mex** of the SG values of all positions reachable in one move — the smallest non-negative integer that does not occur among them. SG = 0 means losing. A position with value g ==behaves exactly like a Nim pile of g stones==: every smaller value can be reached, and a move to a larger value can be answered by moving back.', '定义 `SG(x)` 为一步能到达的所有局面的 SG 值的 **mex**——也就是没有在其中出现的最小非负整数。SG = 0 表示必败。SG 值为 g 的局面，==表现得和一堆 g 颗石子的 Nim 完全一样==：所有更小的值都能到达；而走到更大的值，对手可以再走回来。'],
        fig: () => [arr('SG(x) for the moves {2, 3}:   SG(4) = mex{SG(2), SG(1)} = mex{1, 0} = 2', [0, 0, 1, 1, 2, 0, 0], tn({ bad: [0, 1, 5, 6], cmp: [1, 2], act: 4 }))] },
      { kind: 'how', title: ['Independent games combine by XOR', '相互独立的游戏用异或合并'],
        body: ['In Nim the player to move loses exactly when the ==XOR of the pile sizes is 0==: from a non-zero XOR there is always a move to zero, and from zero every move leads to non-zero. By the Sprague–Grundy theorem every independent game counts as one Nim pile of size SG — so compute SG for each pile and XOR them.', '在 Nim 游戏中，轮到走的一方必败，当且仅当==各堆石子数的异或为 0==：异或非零时总有一步能走到零，而异或为零时每一步都会走到非零。根据 Sprague–Grundy 定理，每个独立的游戏都相当于一堆大小为 SG 值的 Nim 石子——所以算出每一堆的 SG 值，再全部异或起来。'],
        fig: () => [grid('piles 6, 1, 4 with moves {2, 3}:   0 xor 0 xor 2 = 2 ≠ 0  →  First wins', [[6, 1, 4], [0, 0, 2]], gt({ dim: [[1, 0], [1, 1]], ok: [[1, 2]] }), { rows: ['pile', 'SG'] })] },
      { kind: 'result', title: ['A table and one XOR', '一张表，加一次异或'],
        body: ['SG values up to the largest pile cost **O(max × moves)**, then one XOR per pile. Without the theorem the state space would be the product of all pile sizes. Classic Nim is the special case SG(x) = x. The hard part of a game problem is usually to ==see the independent sub-games==.', '算出到最大那堆为止的 SG 值，代价是 **O(最大堆 × 可取数的种数)**，之后每堆只需一次异或。如果没有这个定理，状态空间就是各堆大小的乘积。经典 Nim 是 SG(x) = x 的特例。博弈题的难点通常在于==看出那些相互独立的子游戏==。'] },
    ],
    flow: [
      { id: 'init', kind: 'start', text: ['sg[0] = 0;   x = 1', 'sg[0] = 0；x = 1'], on: [] },
      { id: 'loop', kind: 'test', text: ['x ≤ largest pile ?', 'x ≤ 最大的那堆？'], no: 'xor', on: [] },
      { id: 'mex', text: ['sg[x] = mex of sg[x − t] over the allowed amounts t;    x++', 'sg[x] = 所有允许的 t 对应的 sg[x − t] 的 mex；x++'], next: 'loop' },
      { id: 'xor', text: ['res = XOR of sg[pile] over all piles', 'res = 所有堆的 sg[pile] 的异或'] },
      { id: 'done', kind: 'end', text: ['print First if res ≠ 0, otherwise Second', 'res ≠ 0 输出 First，否则输出 Second'] },
    ],
  },

  prufer: {
    story: [
      { kind: 'naive', title: ['Start with the question: how do you write down a tree?', '先想一个问题：怎样把一棵树写下来？'],
        body: ['A list of its n − 1 edges works, but the same tree can be listed in many ways, and not every list of pairs is a tree. That makes simple questions hard — for instance: **how many** different trees are there on n labelled vertices?', '把它的 n − 1 条边列出来当然可以，但同一棵树有很多种列法，而且并非随便一组点对都是一棵树。这让一些简单的问题变得很难——比如：n 个有标号的顶点一共能构成**多少棵**不同的树？'] },
      { kind: 'insight', title: ['Dismantle the tree leaf by leaf, smallest label first', '把树一片叶子一片叶子地拆掉，编号最小的先拆'],
        body: ['Remove the leaf with the ==smallest label== and write down the vertex it was attached to. Repeat until two vertices remain: n − 2 numbers. Nothing is lost: the labels that never appear are exactly the leaves, so the smallest of them must have been removed first, and the first number says where it hung — and so on. ==Every sequence of n − 2 labels is the code of exactly one tree.==', '删去==编号最小==的叶子，并写下它原来连着的那个顶点。重复到只剩两个顶点为止：一共写下 n − 2 个数。信息一点没丢：序列里从未出现的编号恰好就是叶子，所以其中最小的一定是最先被删的，而第一个数说明了它原来挂在哪里——依此类推。==每个由 n − 2 个编号组成的序列，都恰好是一棵树的编码。=='],
        fig: () => [graph(layoutTree(6, PRUFER_ES, 5), ed(PRUFER_ES), { name: 'the leaves are 3, 4 and 5: vertex 3 goes first', tone: tn({ ok: [3, 4], act: 2 }) }), grid('Prüfer sequence: 6 1 6 2   (vertices 2 and 6 remain)', [[3, 4, 1, 5], [6, 1, 6, 2]], gt({ cmp: row(0, 0, 3), ok: row(1, 0, 3) }), { rows: ['smallest leaf', 'write its neighbour'], cols: ['step 1', 'step 2', 'step 3', 'step 4'] })] },
      { kind: 'how', title: ['Degrees and a min-heap of leaves', '度数，加上一个存叶子的小根堆'],
        body: ['Keep the degree of every vertex and a __min-heap__ of the current leaves. Pop the smallest leaf u, write its only remaining neighbour v, and decrease `deg[v]`; if v has ==become a leaf==, push it.', '维护每个顶点的度数，以及存放当前所有叶子的__小根堆__。取出最小的叶子 u，写下它唯一剩下的邻居 v，并把 `deg[v]` 减一；如果 v ==变成了叶子==，就把它放进堆里。'] },
      { kind: 'result', title: ['Counting trees becomes counting sequences', '数树变成了数序列'],
        body: ['**O(n log n)** with the heap (O(n) with a moving pointer). A vertex of degree d appears exactly d − 1 times. And since trees and sequences correspond one to one, there are n choices for each of n − 2 positions: ==nⁿ⁻² labelled trees== — Cayley\'s formula. Trees with prescribed degrees are counted the same way.', '用堆是 **O(n log n)**（用一个移动的指针可以做到 O(n)）。度数为 d 的顶点恰好出现 d − 1 次。又因为树与序列一一对应，n − 2 个位置每个都有 n 种选择：==共有 nⁿ⁻² 棵有标号的树==——这就是 Cayley 公式。给定各顶点度数的树，也可以用同样的方法计数。'] },
    ],
    flow: [
      { id: 'init', kind: 'start', text: ['count degrees;  put every leaf into a min-heap', '统计度数；把所有叶子放入小根堆'] },
      { id: 'loop', kind: 'test', text: ['fewer than n − 2 numbers written ?', '写下的数还不足 n − 2 个？'], no: 'end', on: [] },
      { id: 'leaf', text: ['pop the smallest leaf u;  write its only remaining neighbour v', '取出最小的叶子 u；写下它唯一剩下的邻居 v'] },
      { id: 'newleaf', text: ['remove u;  if v has become a leaf, push it', '删去 u；若 v 变成了叶子，放入堆'], next: 'loop' },
      { id: 'end', kind: 'end', text: ['done: two vertices remain', '结束：还剩两个顶点'], on: [] },
    ],
  },
  sieve: {
    story: [
      { kind: 'naive', title: ['Start simple: ask every number "are you prime?"', '先从最简单的做起：逐个问“你是素数吗？”'],
        body: ['For each x try the divisors 2, 3, 4, … up to √x. A single test is cheap, but doing it for **every** number up to n costs about n·√n — and each test starts from nothing, learning nothing from the numbers before it.', '对每个 x，用 2、3、4……一直到 √x 去试除。单独一次判断并不贵，但对不超过 n 的**每个**数都做一遍，总代价约为 n·√n——而且每次判断都从零开始，没有利用之前的数得到的任何信息。'],
        fig: () => [grid('is 29 prime?  try 2, 3, 4, 5 …', [[2, 3, 4, 5], ['29 mod 2 = 1', '29 mod 3 = 2', '29 mod 4 = 1', '29 mod 5 = 4']], gt({ cmp: span(0, 3).map(c => [1, c] as [number, number]) }), { rows: ['divisor', 'remainder'] })] },
      { kind: 'insight', title: ['Flip the question: let each prime cross out its multiples', '把问题反过来：让每个素数去划掉它的倍数'],
        body: ['Instead of testing numbers, __generate the composites__. Every multiple of 2 is composite; every multiple of 3; every multiple of 5. Whatever is ==never crossed out== has no smaller prime factor — so it must be prime.', '不去检验每个数，而是__直接生成合数__。2 的倍数都是合数；3 的倍数也是；5 的倍数也是。==始终没有被划掉==的数没有更小的素因子——所以它一定是素数。'],
        fig: () => [grid('multiples of 2 are gone; multiples of 3 go next', [[2, 3, 4, 5, 6, 7, 8, 9, 10], [11, 12, 13, 14, 15, 16, 17, 18, 19]], gt({ ok: [[0, 0]], act: [[0, 1]], dim: [[0, 2], [0, 4], [0, 6], [0, 8], [1, 1], [1, 3], [1, 5], [1, 7]], bad: [[0, 7], [1, 4]] }), { sq: true })] },
      { kind: 'how', title: ['Walk upward: whoever is still standing is prime', '从小到大走：还站着的就是素数'],
        body: ['Go through 2, 3, 4, … in order. A composite number is always crossed out ==before you reach it==, by its smallest prime factor. So when you arrive at an unmarked number, declare it prime and cross out its multiples.', '按 2、3、4……的顺序依次考察。合数总会==在你走到它之前==，被它的最小素因子划掉。所以走到一个没有标记的数时，就宣布它是素数，然后划掉它的倍数。'] },
      { kind: 'how', title: ['Start crossing at p²', '从 p² 开始划'],
        body: ['A smaller multiple k·p with k < p has a prime factor below p, so it is __already gone__. For p = 5: 10, 15 and 20 were removed by 2 and 3 — the first new one is ==25 = 5²==.', '更小的倍数 k·p（k < p）含有比 p 小的素因子，所以__早就被划掉了__。以 p = 5 为例：10、15、20 已经被 2 和 3 划掉——第一个新的是 ==25 = 5²==。'],
        fig: () => [arr('multiples of 5', [5, 10, 15, 20, 25, 30, 35], tn({ ok: 0, dim: [1, 2, 3, 5], act: 4, bad: 6 }), { 'start here': 4 }, { base: -1 })] },
      { kind: 'result', title: ['Almost linear', '几乎是线性的'],
        body: ['The crossing-out costs n/2 + n/3 + n/5 + n/7 + … which grows only like **n · log log n**. For n = 10⁷ that is a few tens of millions of steps, against billions for trial division. The linear sieve in the next lesson removes even the repeated crossings.', '划掉倍数的总代价是 n/2 + n/3 + n/5 + n/7 + …，增长速度只有 **n · log log n**。n = 10⁷ 时是几千万步，而试除法要几十亿步。下一课的线性筛连重复划掉的部分也省去了。'] },
    ],
    flow: [
      { id: 'init', kind: 'start', text: ['i = 2;  nothing crossed out', 'i = 2；所有数都未划掉'], on: [] },
      { id: 'loop', kind: 'test', text: ['i ≤ n ?', 'i ≤ n ？'], no: 'done', on: [] },
      { id: 'marked', kind: 'test', text: ['is i crossed out ?', 'i 被划掉了吗？'], yes: 'inc', no: 'prime', on: [] },
      { id: 'prime', text: ['i is prime: count it', 'i 是素数：计数加一'] },
      { id: 'cross', text: ['cross out i², i² + i, i² + 2i, …', '划掉 i²、i² + i、i² + 2i……'] },
      { id: 'inc', text: ['i++', 'i++'], next: 'loop', on: [] },
      { id: 'done', kind: 'end', text: ['print the count', '输出个数'] },
    ],
  },

  'prime-factor': {
    story: [
      { kind: 'term', title: ['The fundamental theorem of arithmetic', '算术基本定理'],
        body: ['A **prime** is an integer above 1 whose only divisors are 1 and itself: 2, 3, 5, 7, 11, … Every other integer above 1 is **composite**. The theorem: every integer above 1 can be written as a product of primes, and ==in only one way== apart from the order of the factors. 360 is 2 · 2 · 2 · 3 · 3 · 5 and nothing else. The primes are the atoms of multiplication — which is why so many questions about a number (its divisors, its gcd with another number) become easy once it is factorised.', '**质数**是大于 1 且只能被 1 和它本身整除的整数：2、3、5、7、11……其余大于 1 的整数都是**合数**。定理说：每个大于 1 的整数都能写成质数的乘积，而且不计因数的顺序时==写法只有一种==。360 就是 2 · 2 · 2 · 3 · 3 · 5，没有别的写法。质数是乘法世界里的原子——所以一旦把一个数分解了，许多关于它的问题（有哪些约数、与另一个数的最大公约数）都变得容易。'],
        fig: () => [arr('360 =', [2, 2, 2, 3, 3, 5], tn({ ok: [0, 1, 2], cmp: [3, 4], act: 5 }))] },
      { kind: 'naive', title: ['Start simple: try every number below n', '先从最简单的做起：试遍小于 n 的每个数'],
        body: ['For p = 2, 3, 4, … up to n: while p divides n, record p and divide. It works, but for a prime n near 10¹⁴ the loop runs **10¹⁴ times**. And it seems to need a test "is p prime?" before recording p.', '让 p = 2, 3, 4, … 一直到 n：只要 p 能整除 n，就记下 p 并除掉。这样是对的，但当 n 是接近 10¹⁴ 的质数时，循环要跑 **10¹⁴ 次**。而且看起来在记下 p 之前，还得先判断“p 是不是质数”。'] },
      { kind: 'insight', title: ['Composites never divide — and factors come in pairs', '合数永远除不进——而且因数成对出现'],
        body: ['When the loop reaches p, every smaller prime has been ==divided out completely==. A composite p is a product of smaller primes, so it cannot divide what is left: no primality test is needed. And if n = a · b, the smaller of a and b is at most √n. So if nothing up to √n divides n, ==n itself is prime==.', '循环走到 p 时，所有更小的质数都已经被==除得干干净净==。合数 p 是更小的质数的乘积，所以它不可能整除剩下的数：根本不需要判断质数。另外，若 n = a · b，a 和 b 中较小的那个不超过 √n。所以如果直到 √n 都没有数能整除 n，==n 本身就是质数==。'],
        fig: () => [grid('factor pairs of 36: the smaller one never exceeds √36 = 6', [[1, 2, 3, 4, 6], [36, 18, 12, 9, 6]], gt({ ok: row(0, 0, 4) }), { rows: ['a ≤ 6', 'b = 36 / a'] })] },
      { kind: 'how', title: ['Divide out, move on, stop at p · p > n', '除尽，往下试，到 p · p > n 就停'],
        body: ['Loop `p` from 2 while `p · p ≤ n`. Inside, `while (n % p == 0)` prints p and divides — a __while__, because a prime can occur several times. The bound uses the ==current== n, which shrinks with every division, so the loop often ends long before the square root of the original number. Afterwards, if n > 1, it is the last prime factor.', '让 `p` 从 2 开始，只要 `p · p ≤ n` 就继续。循环内用 `while (n % p == 0)` 输出 p 并除掉——必须是 __while__，因为一个质数可能出现多次。上界用的是==当前的== n，它每除一次都会变小，所以循环往往远在原数的平方根之前就结束了。结束后如果 n > 1，它就是最后一个质因数。'],
        fig: () => [grid('factorising 360', [[360, 180, 90, 45, 15, 5], [2, 2, 2, 3, 3, '5 is left: 3 · 3 > 5'], [180, 90, 45, 15, 5, '']], gt({ act: row(1, 0, 4), ok: [[1, 5]] }), { rows: ['n', 'divide by', 'leaves'] })] },
      { kind: 'result', title: ['√n steps instead of n', '从 n 步降到 √n 步'],
        body: ['At most **√n** trial divisions: ten million for n = 10¹⁴ instead of a hundred million million. For many numbers below a limit, sieve the primes first and divide by those only. For numbers with hundreds of digits no fast method is known — a fact that modern cryptography depends on.', '最多 **√n** 次试除：n = 10¹⁴ 时是一千万次，而不是一百万亿次。如果要分解某个范围内的许多数，可以先筛出质数，只用质数去试除。而对于几百位的数，目前还没有已知的快速方法——现代密码学正是建立在这个事实之上。'] },
    ],
    flow: [
      { id: 'init', kind: 'start', text: ['p = 2', 'p = 2'], on: [] },
      { id: 'try', kind: 'test', text: ['p · p ≤ n ?', 'p · p ≤ n ？'], no: 'last' },
      { id: 'div', kind: 'test', text: ['p divides n ?', 'p 整除 n ？'], no: 'inc', on: [] },
      { id: 'take', text: ['print p;   n = n / p', '输出 p；n = n / p'], next: 'div' },
      { id: 'inc', text: ['p = p + 1', 'p = p + 1'], next: 'try', on: [] },
      { id: 'last', kind: 'end', text: ['if n > 1, print n: it is prime', '若 n > 1，输出 n：它是质数'] },
    ],
  },
}
