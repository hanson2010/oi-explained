import type { L } from '../../engine/types'
import type { Prose } from '../extras'

/** The problem each lesson solves, why the method works, and common mistakes. */
export const TEXT: Record<string, Prose> = {
  'binary-search': {
    problem: ['You are given n integers in non-decreasing order and a value x. Find the position of the first element that is greater than or equal to x.', '给定 n 个按不降顺序排列的整数和一个值 x，求第一个大于等于 x 的元素的位置。'],
    why: ['Scanning from the left costs up to n comparisons. Sortedness lets one comparison say much more: if a[mid] ≥ x, every element to the right of mid is also ≥ x, so the first such element cannot be to the right; if a[mid] < x, mid and everything before it are too small. Either way half of the candidates disappear. Starting from n candidates, halving reaches a single one after about log₂ n steps — 20 steps for a million elements. The idea is not limited to arrays: whenever a yes/no condition switches from "no" to "yes" exactly once as the answer grows, you can binary search for the switching point.', '从左到右扫描最多需要 n 次比较。而有序性让一次比较能说明更多：若 a[mid] ≥ x，mid 右边的元素也都 ≥ x，所以第一个满足条件的元素不可能在右边；若 a[mid] < x，mid 及其左边都太小。无论哪种情况，候选都少了一半。从 n 个候选开始不断折半，大约 log₂ n 步后只剩一个——一百万个元素只需 20 步。这个思想不限于数组：只要某个“是/否”条件随着答案增大恰好从“否”变为“是”一次，就可以二分找出这个分界点。'],
    pitfalls: [
      ['Writing r = mid − 1 in the "≥" branch throws away mid, which may be the answer.', '在 “≥” 分支写成 r = mid − 1 会把 mid 丢掉，而它可能正是答案。'],
      ['Writing l = mid (instead of mid + 1) can loop forever when r = l + 1.', '把 l = mid + 1 写成 l = mid，在 r = l + 1 时会死循环。'],
      ['The array must be sorted; binary search on unsorted data silently gives nonsense.', '数组必须有序；对无序数据二分不会报错，但结果毫无意义。'],
    ],
  },
  'prefix-sum': {
    problem: ['Given n numbers and q queries, each asking for the sum of the elements from position l to position r, answer every query.', '给定 n 个数和 q 个询问，每个询问求第 l 个到第 r 个元素之和，回答所有询问。'],
    why: ['Adding the elements of each query one by one costs O(n) per query, O(n · q) in total — too slow when both are large. The observation is that a range is the difference of two prefixes: the sum of positions 1..r minus the sum of positions 1..l−1 leaves exactly positions l..r. There are only n + 1 prefixes, and each is the previous one plus one element, so all of them can be computed in a single pass. After that, any query is one subtraction. You pay O(n) once and O(1) per query.', '对每个询问逐个相加，单次是 O(n)，总共 O(n · q)——两者都很大时太慢。关键的观察是：一个区间等于两个前缀之差——位置 1..r 的和减去位置 1..l−1 的和，剩下的恰好是 l..r。前缀一共只有 n + 1 个，而且每个都等于前一个再加一个元素，所以扫一遍就能全部算出。之后任何询问都只是一次减法：预处理 O(n)，每次查询 O(1)。'],
    pitfalls: [
      ['Subtracting s[l] instead of s[l − 1] drops a[l] from the answer.', '减去 s[l] 而不是 s[l − 1]，会把 a[l] 漏掉。'],
      ['Sums overflow int quickly: 10⁵ values of 10⁹ need long long.', '和很容易超出 int：10⁵ 个 10⁹ 级别的数必须用 long long。'],
      ['Prefix sums are for static data. If elements change between queries, use a Fenwick tree.', '前缀和适用于静态数据。如果询问之间元素会被修改，应使用树状数组。'],
    ],
  },
  difference: {
    problem: ['Given n numbers and q operations, each adding v to every element from position l to position r, print the array after all operations.', '给定 n 个数和 q 个操作，每个操作把第 l 个到第 r 个元素都加上 v，输出所有操作结束后的数组。'],
    why: ['Updating a range element by element costs O(n) per operation. Look instead at the differences between neighbours, d[i] = a[i] − a[i−1]. Adding v to a whole range leaves the differences inside the range untouched, because both neighbours rise together. Only two differences change: at l, where the range begins (d[l] grows by v), and just after r, where it ends (d[r+1] shrinks by v). So every operation becomes two assignments. At the end, a prefix sum of d rebuilds the array, because a[i] = d[1] + d[2] + … + d[i].', '逐个元素修改，每次操作是 O(n)。换个角度看相邻元素的差 d[i] = a[i] − a[i−1]：给整个区间加 v 时，区间内部的差不变，因为相邻两项一起增加。只有两个差发生变化：区间开始处 l（d[l] 增加 v）和区间结束之后的 r + 1（d[r+1] 减少 v）。于是每次操作只需两次赋值。最后对 d 求一遍前缀和就还原出数组，因为 a[i] = d[1] + d[2] + … + d[i]。'],
    pitfalls: [
      ['d needs n + 2 cells: an update with r = n writes to d[n + 1].', 'd 要开到 n + 2：r = n 的修改会写到 d[n + 1]。'],
      ['Forgetting the final prefix-sum pass prints the differences instead of the values.', '忘记最后的前缀和，输出的就是差分而不是原数组。'],
      ['It answers queries only after all updates. For interleaved updates and queries you need a Fenwick or segment tree.', '它只适合“先全部修改、再查询”。修改与查询交替出现时需要树状数组或线段树。'],
    ],
  },
  'fast-pow': {
    problem: ['Given a, b and m, compute a to the power b, modulo m, where b can be as large as 10¹⁸.', '给定 a、b 和 m，计算 a 的 b 次方对 m 取模的结果，其中 b 可以大到 10¹⁸。'],
    why: ['Multiplying by a, b times, is hopeless for b = 10¹⁸. But squaring doubles the exponent: a, a², a⁴, a⁸, … Sixty squarings already reach an exponent above 10¹⁸. Any b is a sum of powers of two — its binary representation — so aᵇ is the product of the corresponding squares. For example b = 13 = 1101₂ gives a¹³ = a⁸ · a⁴ · a¹. The loop walks the bits of b from the lowest: it multiplies the current square into the result when the bit is 1, then squares again. Taking the remainder after every multiplication keeps all numbers below m², and (x · y) mod m only depends on x mod m and y mod m, so the result is unchanged.', '把 a 连乘 b 次，在 b = 10¹⁸ 时完全不可行。但平方能让指数翻倍：a、a²、a⁴、a⁸……平方六十次，指数就超过 10¹⁸ 了。任何 b 都能写成若干 2 的幂之和——也就是它的二进制表示——所以 aᵇ 等于对应那些平方项的乘积。例如 b = 13 = 1101₂，a¹³ = a⁸ · a⁴ · a¹。循环从最低位开始扫描 b：该位为 1 就把当前的平方项乘进答案，然后再平方。每次乘法后取模，使所有数保持在 m² 以内；而 (x · y) mod m 只取决于 x mod m 和 y mod m，所以结果不变。'],
    pitfalls: [
      ['If m is close to 10¹⁸ the product overflows long long; use __int128 or a slower "multiply by doubling".', '若 m 接近 10¹⁸，乘积会超出 long long；要用 __int128 或“龟速乘”。'],
      ['Reduce a modulo m before the loop, or the very first multiplication may overflow.', '循环之前先让 a 对 m 取模，否则第一次乘法就可能溢出。'],
      ['Initialise the result to 1 % m, not 1: with m = 1 the answer is 0.', '结果的初值应是 1 % m 而不是 1：m = 1 时答案是 0。'],
    ],
  },
  hanoi: {
    problem: ['Three pegs A, B, C hold n disks of different sizes, all on A with the largest at the bottom. Move the whole stack to C, one disk at a time, never placing a larger disk on a smaller one. Print the moves.', '有三根柱子 A、B、C 和 n 个大小不同的盘子，开始时全部在 A 上，大的在下。每次只能移动一个盘子，且大盘不能压在小盘上。把整摞盘子移到 C，输出每一步移动。'],
    why: ['The largest disk can only move when all n − 1 smaller disks sit together on the spare peg. So the plan is forced: move the n − 1 smaller disks from A to B, move the largest from A to C, then move the n − 1 disks from B to C. The first and last steps are the same problem with one disk fewer and the pegs renamed — that is the recursion. You do not need to see how the smaller problem is solved; you only need to trust that the function does what it promises, and to make sure the problem shrinks until n = 0, where nothing needs doing. The number of moves doubles (plus one) with every extra disk: 2ⁿ − 1.', '最大的盘子要移动，必须等其余 n − 1 个小盘子全部叠在辅助柱上。所以方案是唯一确定的：先把 n − 1 个小盘子从 A 移到 B，再把最大的盘子从 A 移到 C，最后把 n − 1 个盘子从 B 移到 C。第一步和最后一步是同一个问题，只是盘子少了一个、柱子换了名字——这就是递归。你不必看清更小的问题具体怎么解，只需相信函数能完成它所承诺的事，并保证问题不断缩小，直到 n = 0 时无事可做。每多一个盘子，移动次数翻倍再加一：共 2ⁿ − 1 步。'],
    pitfalls: [
      ['Without the base case the recursion never stops and the stack overflows.', '没有递归边界，递归永不停止，最终栈溢出。'],
      ['The roles of the pegs change in each call; mixing up "via" and "to" gives illegal moves.', '每次调用中柱子的角色都不同；把“辅助柱”和“目标柱”弄混会产生非法移动。'],
      ['The output is exponential: n = 30 already means a billion lines.', '输出量是指数级的：n = 30 就有十亿行。'],
    ],
  },
  'bignum-add': {
    problem: ['Add two non-negative integers that may have hundreds of thousands of digits — far beyond what long long can hold.', '把两个可能有几十万位的非负整数相加——远远超出 long long 的范围。'],
    why: ['This is the column addition you learned at school, written as a loop. Each number is stored as an array with one decimal digit per cell. The digits are stored in reverse — ones first — for two reasons: digits of equal weight then share the same index in both numbers, and if the result gains a digit (as in 99 + 1) it is appended at the end rather than inserted at the front. In each column the sum of two digits and a carry is at most 9 + 9 + 1 = 19, so the digit to write is sum % 10 and the carry is 0 or 1.', '这就是小学学的列竖式加法，只不过写成了循环。每个数用数组保存，每格一位十进制数字。倒序存储（个位在前）有两个原因：权值相同的数位在两个数中下标相同；结果如果多出一位（比如 99 + 1），只需在末尾追加，而不用在开头插入。每一位上两个数字加进位最多是 9 + 9 + 1 = 19，所以写下 sum % 10，进位为 0 或 1。'],
    pitfalls: [
      ['Stopping when the longer number ends loses a final carry: 999 + 1 would print 000.', '在较长的数结束时就停止会丢掉最后的进位：999 + 1 会输出 000。'],
      ['Read the numbers as strings — reading into an integer type overflows before you start.', '要用字符串读入——用整数类型读入的话还没开始就溢出了。'],
      ['Remember to print from the highest index down.', '输出时记得从最高下标往回输出。'],
    ],
  },
  'bignum-mul': {
    problem: ['Multiply two non-negative integers that have up to a few thousand digits each.', '把两个各有至多几千位的非负整数相乘。'],
    why: ['Long multiplication on paper produces one shifted row per digit of the second number and then adds the rows. The array version skips the rows: digit i of a (worth 10ⁱ) times digit j of b (worth 10ʲ) is worth 10^(i+j), so the product simply goes into cell i + j. Cells may hold values far above 9 while products accumulate — that is fine, they are just numbers. A single pass at the end converts each cell to one digit by pushing the excess into the next cell. The result of an n-digit by m-digit multiplication has at most n + m digits.', '笔算乘法为第二个数的每一位写出一行错位的部分积，最后把各行相加。数组写法省去了这些行：a 的第 i 位（权值 10ⁱ）乘 b 的第 j 位（权值 10ʲ），权值是 10^(i+j)，所以乘积直接累加到第 i + j 格。累加过程中格子里的值可以远大于 9——没关系，它们只是数字。最后一遍把每格多出来的部分推给下一格，化成一位数字。n 位数乘 m 位数，结果至多 n + m 位。'],
    pitfalls: [
      ['Forgetting to strip leading zeros prints 0006 instead of 6 — but keep one digit when the answer is 0.', '忘记去掉前导零会输出 0006 而不是 6——但答案为 0 时要保留一位。'],
      ['With very long numbers a cell can exceed int before carrying; carry inside the loop or use long long.', '数字非常长时，进位之前某一格可能超出 int；可以在循环内进位，或改用 long long。'],
      ['The result array must have n + m cells, not max(n, m).', '结果数组要开 n + m 位，而不是 max(n, m)。'],
    ],
  },
  'base-conversion': {
    problem: ['Convert a decimal integer n to base k (2 ≤ k ≤ 16), using the letters A–F for the digits 10–15.', '把十进制整数 n 转换成 k 进制（2 ≤ k ≤ 16），用字母 A–F 表示 10–15。'],
    why: ['In base k a number is d₀ + d₁·k + d₂·k² + … with every digit between 0 and k − 1. Dividing by k splits it neatly: the remainder is d₀, because every other term is a multiple of k, and the quotient is d₁ + d₂·k + …, the same number with its lowest digit removed. Repeating the division therefore peels off the digits one by one, lowest first — which is why they must be reversed at the end. The method stops when the quotient reaches 0.', '在 k 进制下，一个数等于 d₀ + d₁·k + d₂·k² + …，每一位都在 0 到 k − 1 之间。除以 k 恰好把它拆开：余数是 d₀，因为其余各项都是 k 的倍数；商是 d₁ + d₂·k + …，也就是去掉最低位后的数。因此反复做除法，就把各位数字从低到高逐个剥离出来——所以最后要倒序。当商变为 0 时结束。'],
    pitfalls: [
      ['n = 0 never enters the loop: handle it separately or nothing is printed.', 'n = 0 根本不会进入循环：要单独处理，否则什么都不输出。'],
      ['Printing the remainders in the order found gives the digits backwards.', '按得到的顺序输出余数，数字就是反的。'],
      ['For negative n the % operator in C++ gives negative remainders; convert the absolute value.', 'n 为负数时 C++ 的 % 会得到负的余数；应先对绝对值进行转换。'],
    ],
  },
  enumeration: {
    problem: ['A rooster costs 5 coins, a hen costs 3 coins, and three chicks cost 1 coin. Buy exactly n birds with exactly n coins. List every way to do it.', '公鸡 5 文钱一只，母鸡 3 文钱一只，小鸡 1 文钱三只。用恰好 n 文钱买恰好 n 只鸡，列出所有买法。'],
    why: ['There is no formula to reach for, and none is needed: the numbers are small enough to try every possibility. That is enumeration, and it is the first method to consider for any problem. What makes it work in practice is keeping the number of candidates down. Three unknowns suggest three nested loops, about n³ candidates. But the birds must add up to n, so once x and y are chosen there is exactly one z worth looking at, n − x − y: the third loop disappears and n² candidates remain. The loop bounds shrink the set further: x roosters already cost 5x coins, so x never needs to exceed n / 5, and likewise for y. What is left is tested against the remaining condition, the total cost.', '这里没有现成的公式，也不需要公式：数据范围足够小，把所有可能都试一遍就行。这就是枚举，它是拿到任何题目时首先应该考虑的方法。枚举能否实用，关键在于控制候选解的个数。三个未知数让人想到三重循环，大约 n³ 个候选解。但鸡的总数必须是 n，所以选定 x 和 y 之后，值得考虑的 z 只有一个：n − x − y。第三层循环就这样消失了，只剩 n² 个候选解。循环的上界还能进一步缩小范围：x 只公鸡已经要花 5x 文，所以 x 不必超过 n / 5，y 也是同理。剩下的候选解再用另一个条件——总花费——来检验。'],
    pitfalls: [
      ['Testing z / 3 without first checking z % 3 == 0 accepts impossible purchases: integer division silently rounds down.', '不先判断 z % 3 == 0 就使用 z / 3，会接受不可能的买法：整数除法会悄悄向下取整。'],
      ['Before enumerating, estimate the number of candidates. About 10⁸ simple steps per second is a safe budget.', '枚举之前先估算候选解的个数。每秒大约 10⁸ 次简单运算是比较稳妥的预算。'],
      ['Three loops are correct but waste a factor of n. Look for a quantity that the others determine.', '三重循环是对的，但白白多了 n 倍的工作量。要找找有没有能被其他量确定的量。'],
    ],
  },
  simulation: {
    problem: ['n people stand in a circle and count off 1, 2, …, m. Whoever says m leaves the circle, and the next person starts again from 1. In what order do they leave?', 'n 个人围成一圈，从 1 开始依次报数，报到 m 的人出圈，下一个人重新从 1 开始报。求出圈的顺序。'],
    why: ['The statement already is the algorithm: it describes a process step by step, and the program only has to carry it out faithfully. This is simulation. The work lies in choosing variables that describe the situation completely. Here two things matter at every moment: who is still in the circle, and who spoke last. An array of flags records the first, one integer the second. Moving to the next person is p % n + 1, which wraps from n back to 1. People who have left are skipped — they keep their place in the array but no longer say a number. Simulation problems are rarely hard to understand; they are hard to get exactly right, because every detail of the statement becomes a line of code.', '题目本身就是算法：它一步一步地描述了一个过程，程序只需要老老实实地照做。这就是模拟。真正要动脑筋的是选择变量，让它们能完整地描述当前的局面。这里每个时刻有两件事重要：谁还在圈里，以及上一个报数的是谁。前者用一个标记数组记录，后者用一个整数记录。走到下一个人是 p % n + 1，它能从 n 绕回 1。已经出圈的人会被跳过——他们在数组里的位置还在，只是不再报数。模拟题很少难在理解上，而是难在写得完全正确，因为题目中的每个细节都会变成一行代码。'],
    pitfalls: [
      ['Writing p = (p + 1) % n gives positions 0 … n − 1; mixing that with people numbered from 1 is the classic off-by-one.', '写成 p = (p + 1) % n 得到的是 0 … n − 1；把它和从 1 开始的编号混用，是最典型的差一错误。'],
      ['Counting people who have already left: the count must advance only for those still in the circle.', '把已经出圈的人也算进报数：只有还在圈里的人才能让报数加一。'],
      ['Simulating step by step is too slow when n and m are both large; then you need a formula or a data structure.', 'n 和 m 都很大时，一步一步地模拟会太慢；那时需要公式或数据结构。'],
    ],
  },
  'bignum-sub': {
    problem: ['Subtract one non-negative integer from another. Both may have hundreds of thousands of digits, and the result may be negative.', '计算两个非负整数的差。两个数都可能有几十万位，结果可能为负。'],
    why: ['Column subtraction works from the lowest digit upward, like addition, so the same reversed digit array is used. In each column subtract the digit of b and any borrow from the digit of a. If the result is negative, add 10 and borrow 1 from the next column — that column then has one less to give. A borrow can always be repaid only if the number on top is the larger one, so the program compares first: more digits means larger, and with equal lengths the first difference from the top decides. When a is smaller, it computes b − a and prints a minus sign. Unlike addition, the result can lose digits, even all but one, so leading zeros are removed at the end.', '竖式减法和加法一样从最低位算起，所以沿用同样的倒序数字数组。每一位用 a 的数字减去 b 的数字和借位。如果结果为负，就加上 10，并向高一位借 1——高一位能用的就少了 1。只有被减数较大时，借位才一定还得上，所以程序要先比较大小：位数多的更大；位数相同时，从高位起第一个不同的数字决定大小。a 较小时，就计算 b − a 并输出负号。与加法不同，结果的位数可能减少，甚至只剩一位，所以最后要去掉前导零。'],
    pitfalls: [
      ['Subtracting the larger from the smaller leaves a borrow at the top and prints garbage. Compare and swap first.', '用小数减大数，最高位会留下一个还不上的借位，输出毫无意义。要先比较并交换。'],
      ['Comparing the two strings with < compares them as text: "9" comes after "10". Compare lengths first.', '直接用 < 比较两个字符串是按字典序比的："9" 会排在 "10" 后面。要先比较长度。'],
      ['Stripping every zero turns the answer 0 into an empty line. Keep at least one digit.', '把 0 全部去掉会让答案 0 变成空行。至少要保留一位。'],
    ],
  },
  'bignum-div': {
    problem: ['Divide a non-negative integer with up to hundreds of thousands of digits by an ordinary integer b. Print the quotient and the remainder.', '把一个可能有几十万位的非负整数除以一个普通整数 b，输出商和余数。'],
    why: ['Long division on paper goes from the highest digit down, carrying a remainder. At each step you bring down the next digit: the remainder r, which is worth ten times as much in the new column, becomes r · 10 + digit. Dividing that by b gives the next digit of the quotient, and what is left over is the new remainder. Because the remainder is always less than b, the number being divided is less than 10 · b, so each quotient digit is a single digit 0 … 9 and all the arithmetic fits in a 64-bit integer. One pass over the digits gives the whole quotient, and the final remainder is the remainder of the division. Since the work starts at the top, the digits are processed in the order they were read — no reversing.', '纸上的竖式除法从最高位往低位做，并且一路带着余数。每一步落下下一位数字：余数 r 在新的一位上相当于原来的十倍，于是变成 r · 10 + 这一位。用它除以 b，得到商的下一位，剩下的就是新的余数。由于余数始终小于 b，被除的数小于 10 · b，所以商的每一位都是 0 … 9 中的一个数字，所有运算都在 64 位整数范围内。把各位数字扫一遍就得到整个商，最后的余数就是除法的余数。因为从最高位开始算，所以按读入的顺序处理即可——不需要倒序。'],
    pitfalls: [
      ['Using int for r overflows: r · 10 can reach 10¹⁰ when b is close to 10⁹.', 'r 用 int 会溢出：b 接近 10⁹ 时，r · 10 可达 10¹⁰。'],
      ['The quotient has as many digits as a, so it starts with zeros (0123). Skip them, but print 0 when the quotient is 0.', '商的位数与 a 相同，所以开头会有 0（如 0123）。要跳过它们，但商为 0 时仍要输出 0。'],
      ['This only works when the divisor fits in a built-in type. Dividing by another huge number needs a different method.', '这个方法只适用于除数是内置整数类型的情况。除以另一个大整数需要别的方法。'],
    ],
  },
}

/** Where each problem shows up outside contests, shown on the Problem tab. Same inline markup as the Ideas story. */
export const REAL: Record<string, L> = {
  'binary-search': ['Looking up a word in a paper dictionary: you open it near the middle, see whether your word comes earlier or later, and discard half the book. **Databases** find a record among billions the same way, and `git bisect` finds the commit that introduced a bug.', '查纸质词典：翻到中间，看要找的词在前还是在后，然后丢掉半本书。**数据库**在几十亿条记录里找一条用的是同样的办法，`git bisect` 也是这样找出引入 bug 的那次提交。'],
  'prefix-sum': ['A car\'s **odometer** is a prefix sum: to know how far you drove between Tuesday and Friday, subtract two readings instead of adding up every trip. Sales dashboards answer "revenue from day l to day r" the same way.', '汽车的**里程表**就是前缀和：想知道周二到周五开了多远，把两次读数相减即可，不必把每一段路加起来。销售报表回答“第 l 天到第 r 天的收入”也是这样做的。'],
  difference: ['A hotel takes thousands of **bookings**, each occupying a room count from day l to day r. Marking only "+1 on arrival day, −1 after departure" and summing once at the end gives the occupancy of every day.', '酒店收到成千上万个**预订**，每个预订从第 l 天住到第 r 天。只在“入住那天 +1、退房之后 −1”做标记，最后统一累加一遍，就得到每一天的入住人数。'],
  'fast-pow': ['Every time your browser opens an **https** page, RSA or Diffie–Hellman raises a number to a power with hundreds of digits, modulo another huge number. Without repeated squaring, one such handshake would outlast the universe.', '浏览器每次打开 **https** 网页，RSA 或 Diffie–Hellman 都要计算一个数的几百位次幂再取模。如果没有反复平方，一次握手的时间比宇宙的寿命还长。'],
  hanoi: ['**Rotating backup tapes** follows the Tower of Hanoi pattern: tape 1 every other day, tape 2 every fourth day, and so on, so that old and recent backups both exist. More broadly, it is the model for any task that is solved by solving smaller copies of itself.', '**备份磁带轮换**方案用的就是汉诺塔的规律：1 号带隔天用一次，2 号带每四天用一次，以此类推，这样新旧备份都能保留。更一般地说，它是一切“把问题化为更小的同类问题”的范本。'],
  'bignum-add': ['A 64-bit integer holds about 19 digits. **Cryptographic keys** have more than 600, and bank ledgers or scientific constants must not lose a single digit — so the computer adds digit by digit with carries, exactly as you do on paper.', '64 位整数只能存大约 19 位十进制数。**密码学密钥**有 600 多位，银行账目和科学常数也一位都不能丢——于是计算机像你列竖式一样，一位一位地加并处理进位。'],
  'bignum-mul': ['World records for the **digits of π** and the search for huge prime numbers both rest on multiplying numbers with millions of digits. The schoolbook method here is the starting point; faster ones (Karatsuba, FFT) refine the same layout.', '计算 **π 的小数位**的世界纪录、寻找巨大的素数，都建立在几百万位数的乘法之上。这里的竖式乘法是起点，更快的方法（Karatsuba、FFT）都是在同样的格局上改进。'],
  'base-conversion': ['The colour `#FF8800` on a web page is three numbers written in **base 16**; file permissions like `755` are base 8; and every number in memory is base 2. Converting between them is daily work for a programmer.', '网页上的颜色 `#FF8800` 是三个用 **16 进制**写出的数；文件权限 `755` 是 8 进制；内存里的每个数都是 2 进制。在它们之间转换是程序员的日常。'],
  enumeration: ['A **combination lock** with three dials has only 1 000 settings: trying them all takes minutes. A password cracker does the same with every short password — which is why the best defence is to make the number of candidates astronomically large.', '三位数的**密码锁**只有 1 000 种组合：全部试一遍只要几分钟。密码破解程序对所有短密码做的也是同一件事——所以最好的防御就是让候选的数量大到天文数字。'],
  simulation: ['A **weather forecast** is a simulation: the computer advances the state of the atmosphere a few minutes at a time, following the laws of physics. Games, traffic planners and flight simulators all work this way: store the state, apply the rules, repeat.', '**天气预报**就是模拟：计算机按照物理规律，把大气的状态每次向前推进几分钟。游戏、交通规划和飞行模拟器都是这样工作的：保存状态，应用规则，不断重复。'],
  'bignum-sub': ['A **bank** must know a balance to the last cent however large it grows, and checking a digital signature subtracts numbers hundreds of digits long. Rounding is not an option, so the subtraction is done digit by digit.', '**银行**的账户余额无论多大都必须精确到分，验证数字签名时也要对几百位的数做减法。不能四舍五入，所以减法只能一位一位地做。'],
  'bignum-div': ['Checking whether a huge number is divisible by a small prime — the first step in **testing a candidate key** for encryption — is exactly this: sweep the digits once, keeping only the remainder.', '判断一个巨大的数能否被某个小素数整除——**检验加密密钥候选数**的第一步——正是这样做的：把各位数字扫一遍，只保留余数。'],
}
