import type { L } from '../engine/types'

/** Prose for each lesson: the problem it solves, why the method works, and common mistakes. */
export interface Prose { problem: L; why: L; pitfalls: L[] }

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
  'bubble-sort': {
    problem: ['Sort n integers into ascending order.', '把 n 个整数按升序排序。'],
    why: ['An array is sorted exactly when no neighbour pair is out of order. Bubble sort fixes such pairs directly. During one left-to-right pass, the largest value met so far is carried along by every swap, so at the end of the pass the largest value of the unsorted part is in its final place. The next pass can therefore stop one position earlier. After n − 1 passes everything is in place. Each swap removes exactly one inversion (a pair in the wrong order), so the number of swaps equals the number of inversions — up to n(n − 1)/2.', '数组有序，当且仅当不存在逆序的相邻元素。冒泡排序就直接修正这样的相邻对。在一趟从左到右的扫描中，目前遇到的最大值会随着每次交换被一路带着走，所以一趟结束时，未排序部分的最大值已经到了它的最终位置。下一趟因此可以少扫一个位置。n − 1 趟之后全部就位。每次交换恰好消除一个逆序对，所以交换次数等于逆序对数——最多 n(n − 1)/2。'],
    pitfalls: [
      ['Letting j run to n − 1 reads a[n], one past the end.', '让 j 跑到 n − 1 会访问 a[n]，越界一位。'],
      ['Using >= instead of > swaps equal elements and loses stability.', '把 > 写成 >= 会交换相等的元素，失去稳定性。'],
      ['O(n²) is fine for n up to a few thousand, not for 10⁵; use sort() there.', 'O(n²) 只适合 n 为几千的规模，10⁵ 就不行了；那时请用 sort()。'],
    ],
  },
  'selection-sort': {
    problem: ['Sort n integers into ascending order.', '把 n 个整数按升序排序。'],
    why: ['The smallest element belongs in position 0, the second smallest in position 1, and so on. Selection sort does exactly that: in round i it finds the minimum of the part that is not yet sorted and swaps it into position i. After the swap, positions 0..i hold the i + 1 smallest values in order, and they are never touched again. Finding the minimum requires looking at every remaining element, so the number of comparisons is the same — n(n − 1)/2 — whatever the input looks like.', '最小的元素应该在位置 0，第二小的在位置 1，依此类推。选择排序正是这么做的：第 i 轮在尚未排序的部分中找出最小值，把它交换到位置 i。交换之后，位置 0..i 上依次是最小的 i + 1 个值，之后不再被改动。找最小值必须看遍所有剩余元素，所以无论输入如何，比较次数都是 n(n − 1)/2。'],
    pitfalls: [
      ['Swapping inside the inner loop (instead of remembering the index) still sorts, but does many needless swaps.', '在内层循环里直接交换（而不是只记下标）也能排好，但会做大量无谓的交换。'],
      ['It is not stable: 5a 5b 3 becomes 3 5b 5a.', '它不稳定：5a 5b 3 会变成 3 5b 5a。'],
      ['Unlike bubble and insertion sort, it gains nothing from input that is already nearly sorted.', '与冒泡、插入排序不同，输入基本有序时它也不会变快。'],
    ],
  },
  'insertion-sort': {
    problem: ['Sort n integers into ascending order.', '把 n 个整数按升序排序。'],
    why: ['Think of picking up playing cards one at a time. The cards already in your hand are sorted; you slide the new card leftward past every card that is larger, and stop at the first one that is not. The array version keeps a[0..i−1] sorted, lifts out a[i], shifts the larger elements one step right to open a gap, and drops the value into it. An element moves left exactly once for each larger element before it, so the total work equals the number of inversions: tiny when the input is almost sorted, about n²/4 on random data.', '想象一张一张地摸扑克牌。手里的牌已经有序；把新牌向左滑过所有比它大的牌，停在第一张不比它大的牌后面。数组写法保持 a[0..i−1] 有序，取出 a[i]，把比它大的元素依次右移一格腾出空位，再把它放进去。一个元素向左移动的次数，恰好等于它前面比它大的元素个数，所以总工作量等于逆序对数：输入基本有序时极小，随机数据约为 n²/4。'],
    pitfalls: [
      ['Testing a[j] > x before j >= 0 reads a[−1].', '先判断 a[j] > x 再判断 j >= 0，会访问 a[−1]。'],
      ['Forgetting to save a[i] in x: the first shift overwrites it.', '忘记用 x 保存 a[i]：第一次移动就把它覆盖了。'],
      ['Using >= in the comparison makes equal elements jump over each other (unstable).', '比较时用 >= 会让相等的元素互相越过（不稳定）。'],
    ],
  },
  'counting-sort': {
    problem: ['Sort n integers that all lie between 0 and k, where k is small.', '给 n 个范围在 0 到 k 之间的整数排序，其中 k 较小。'],
    why: ['Comparison-based sorting cannot beat O(n log n), but that limit only applies if comparing is all you do. When the values come from a small range you can use a value as an array index. One pass counts how many times each value occurs; a second pass walks the possible values in increasing order and writes each one as many times as it was counted. No two elements are ever compared. The cost is O(n) for counting plus O(k) for walking the range, so it wins whenever k is not much larger than n.', '基于比较的排序不可能快于 O(n log n)，但这个下界只在“只能比较”时成立。当数值来自一个较小的范围时，可以把数值本身当作数组下标。第一遍统计每个值出现了多少次；第二遍按从小到大的顺序遍历所有可能的值，每个值出现几次就输出几次。整个过程没有任何两个元素被比较。代价是统计的 O(n) 加上遍历值域的 O(k)，所以只要 k 不比 n 大太多，它就更快。'],
    pitfalls: [
      ['The count array needs k + 1 cells (values 0..k).', '计数数组要开 k + 1 格（值为 0..k）。'],
      ['Negative values need an offset; huge ranges need compression or a different sort.', '有负数时要加偏移量；值域巨大时要先离散化或换一种排序。'],
      ['This simple form only outputs keys. To sort records by key (stably), use prefix sums of the counts as in radix sort.', '这种简单写法只能输出关键字本身。若要按关键字（稳定地）排序记录，需要像基数排序那样对计数求前缀和。'],
    ],
  },
  'merge-sort': {
    problem: ['Sort n integers into ascending order, for n up to a million.', '把 n 个整数按升序排序，n 可达一百万。'],
    why: ['Merging two sorted lists into one is easy: the smallest remaining element is always at the front of one of them, so compare the two fronts and take the smaller — one pass, linear time. Merge sort builds on that. To sort a range, sort its left half, sort its right half (both by the same method), and merge. The recursion stops at ranges of one element, which are already sorted. Each level of the recursion handles every element once during merging, and halving n repeatedly gives log₂ n levels, so the total is n log n in every case — there is no bad input.', '把两个有序序列合并成一个很容易：剩余的最小元素一定在其中某个序列的开头，所以比较两个队首、取较小的即可——扫一遍，线性时间。归并排序就建立在这之上。要排序一个区间，先排好左半、再排好右半（都用同样的方法），然后合并。递归到只剩一个元素时停止，因为它已经有序。递归的每一层在合并时把每个元素处理一次，而不断折半共有 log₂ n 层，所以任何情况下总量都是 n log n——不存在坏数据。'],
    pitfalls: [
      ['Declaring the temporary array inside the recursive function blows the stack; make it global.', '把临时数组定义在递归函数内部会爆栈；应定义为全局数组。'],
      ['Using < instead of <= when taking from the left breaks stability.', '从左段取数时把 <= 写成 < 会破坏稳定性。'],
      ['Forgetting to copy tmp back leaves the original array unsorted.', '忘记把 tmp 拷回去，原数组就没有被排序。'],
    ],
  },
  'quick-sort': {
    problem: ['Sort n integers into ascending order, for n up to a million.', '把 n 个整数按升序排序，n 可达一百万。'],
    why: ['Choose one value, the pivot, and rearrange the range so that everything on the left is ≤ pivot and everything on the right is ≥ pivot. No element of the left part will ever need to cross to the right part, so the two parts can be sorted independently — by the same method. The partition uses two pointers walking toward each other: i stops at an element that is too large for the left side, j stops at one that is too small for the right side, and swapping them fixes both at once. If the pivot splits the range roughly in half each time, there are about log n levels of O(n) work. A pivot that is always the smallest or largest element gives n levels instead, hence the O(n²) worst case.', '选一个值作为基准，重新排列区间，使左边的元素都 ≤ 基准、右边的都 ≥ 基准。左边的元素今后不需要再跨到右边，所以两部分可以各自独立排序——用同样的方法。划分使用两个相向而行的指针：i 停在对左侧来说太大的元素上，j 停在对右侧来说太小的元素上，交换它们就同时修正了两者。如果基准每次都把区间大致对半分，就有约 log n 层、每层 O(n) 的工作量。如果基准总是最小或最大的元素，就会有 n 层，这就是最坏情况 O(n²) 的由来。'],
    pitfalls: [
      ['Always taking the first element as pivot is O(n²) on sorted input — a classic way to time out.', '总是取第一个元素作基准，遇到有序数据就是 O(n²)——超时的经典原因。'],
      ['Using ≤ / ≥ in the two inner scans lets the pointers run out of the range.', '两个内层扫描用 ≤ / ≥ 会让指针跑出区间。'],
      ['Recursing on [l, i] and [j, r] instead of [l, j] and [i, r] can recurse forever.', '把递归区间写成 [l, i] 和 [j, r]（而不是 [l, j] 和 [i, r]）可能无限递归。'],
    ],
  },
  'heap-sort': {
    problem: ['Sort n integers into ascending order using a binary heap.', '用二叉堆把 n 个整数按升序排序。'],
    why: ['A max-heap is a complete binary tree in which every node is at least as large as its children, so the maximum is always at the root. Because the tree is complete it fits in an array with no pointers: node i has children 2i and 2i + 1. If only the root violates the rule, "sifting down" repairs the heap: swap the root with its larger child and repeat one level lower — at most log n steps. Heap sort first turns the array into a heap, then repeatedly swaps the root (the maximum) with the last element of the heap, shrinks the heap by one, and sifts the new root down. The sorted values accumulate at the end of the same array, so no extra memory is needed.', '大根堆是一棵完全二叉树，每个结点都不小于它的孩子，所以最大值永远在根。因为是完全二叉树，它可以不用指针直接存进数组：结点 i 的孩子是 2i 和 2i + 1。如果只有根违反了规则，“下沉”就能修复：把根与较大的孩子交换，再到下一层重复——最多 log n 步。堆排序先把数组建成堆，然后反复把堆顶（最大值）与堆的最后一个元素交换、堆大小减一、让新的堆顶下沉。排好序的值就积累在同一个数组的末尾，不需要额外空间。'],
    pitfalls: [
      ['Comparing with only the left child (forgetting the right one) breaks the heap.', '只与左孩子比较（忘了右孩子）会破坏堆的性质。'],
      ['With 0-based arrays the children are 2i + 1 and 2i + 2; mixing the two conventions is a common bug.', '下标从 0 开始时孩子是 2i + 1 和 2i + 2；两种约定混用是常见错误。'],
      ['Building the heap by sifting from the top down (i = 1 to n/2) is wrong; go from n/2 down to 1.', '建堆时从上往下（i 从 1 到 n/2）下沉是错的；应从 n/2 倒着到 1。'],
    ],
  },
  'radix-sort': {
    problem: ['Sort n non-negative integers without comparing them to each other.', '在不做两两比较的前提下，给 n 个非负整数排序。'],
    why: ['Sorting by the most significant digit first seems natural, but then each bucket must be sorted separately. Radix sort goes the other way: sort by the ones digit, then by the tens digit, and so on. The trick is stability. When two numbers have the same tens digit, a stable pass leaves them in the order produced by the previous pass — that is, ordered by their ones digit. So after the pass on digit d the numbers are correctly ordered by their last d digits, and after the last pass they are fully sorted. Each pass is a counting sort over ten buckets, costing O(n + 10).', '先按最高位排序看似自然，但那样每个桶还得单独再排。基数排序反其道而行：先按个位排，再按十位排，依此类推。关键在于稳定性。当两个数的十位相同时，稳定的一趟会保持它们在上一趟得到的顺序——也就是按个位排好的顺序。所以处理完第 d 位之后，所有数已经按最低 d 位正确排序；最后一趟结束时就完全有序。每一趟都是十个桶的计数排序，代价 O(n + 10)。'],
    pitfalls: [
      ['Filling the output array front to back in the placing step destroys stability and the result is wrong.', '放置元素时从前往后填会破坏稳定性，结果是错的。'],
      ['The loop over digit weights must not overflow: e × 10 exceeds int for 10-digit numbers.', '位权的循环变量不能溢出：十位数时 e × 10 会超出 int。'],
      ['Negative numbers need separate handling (e.g. add an offset first).', '负数需要单独处理（例如先加上一个偏移量）。'],
    ],
  },
  'n-queens': {
    problem: ['Place n queens on an n × n chessboard so that no two attack each other (no shared row, column or diagonal). Count the number of ways.', '在 n × n 的棋盘上放置 n 个皇后，使它们互不攻击（任意两个不在同一行、同一列或同一条对角线上）。求方案数。'],
    why: ['Every row must contain exactly one queen, so decide the rows one after another: for row r try each column, and for each column that is not attacked, place the queen and continue with row r + 1. When all columns of a row have been tried, return and let the previous row try its next column. This is depth-first search with backtracking — a systematic walk through a tree of partial placements. Checking attacks immediately is what makes it feasible: the moment a square is attacked, the whole subtree of boards built on top of it is skipped. Without that pruning there would be nⁿ boards to examine.', '每一行必须恰好有一个皇后，所以逐行决定：对第 r 行尝试每一列，只要该列不被攻击，就放下皇后并继续处理第 r + 1 行。当一行的所有列都试过后，返回上一行，让它尝试下一列。这就是带回溯的深度优先搜索——系统地遍历“部分摆放方案”构成的树。立刻检查冲突是它可行的关键：一旦某个格子被攻击，建立在它之上的整棵子树都被跳过。如果没有这种剪枝，就要检查 nⁿ 种棋盘。'],
    pitfalls: [
      ['Forgetting to clear the three marks after the recursive call leaves the board "dirty" for later branches.', '递归返回后忘记清除三个标记，会让后面的分支看到“脏”的棋盘。'],
      ['r − c can be negative; add n before using it as an index.', 'r − c 可能为负；用作下标前要加上 n。'],
      ['The diagonal arrays need 2n cells, not n.', '对角线数组要开 2n 而不是 n。'],
    ],
  },
  'bfs-maze': {
    problem: ['In a grid of free cells and walls, find the minimum number of moves (up, down, left, right) from the top-left cell to the bottom-right cell.', '在由空地和墙组成的网格中，求从左上角走到右下角最少需要多少步（每步上、下、左、右移动一格）。'],
    why: ['Imagine pouring water on the start cell: after one second it has reached all cells one step away, after two seconds all cells two steps away. Breadth-first search simulates exactly this, using a queue. Cells are taken from the front of the queue and their undiscovered neighbours are added at the back, so cells are processed in the order they were discovered — all cells at distance d before any at distance d + 1. Consequently the first time a cell is discovered, it has been reached by a shortest route, and its distance never needs to be revised. Depth-first search would also find a route, but not necessarily a shortest one.', '想象把水倒在起点：一秒后水到达所有距离为 1 的格子，两秒后到达所有距离为 2 的格子。广度优先搜索借助队列精确地模拟这个过程。从队首取出格子，把它尚未发现的邻居加到队尾，于是格子按被发现的顺序处理——所有距离为 d 的格子都排在距离为 d + 1 的格子之前。因此一个格子第一次被发现时，走的就是最短路线，它的距离以后不需要再修改。深度优先搜索也能找到一条路，但不一定最短。'],
    pitfalls: [
      ['Marking a cell as visited only when it is popped lets it be pushed many times — slow and memory-hungry.', '出队时才标记已访问，会让同一个格子多次入队——又慢又占内存。'],
      ['Check the bounds before reading the grid cell, not after.', '先判断是否越界，再访问网格，而不是反过来。'],
      ['BFS gives shortest paths only when every move costs the same; with weights use Dijkstra.', '只有每一步代价相同时 BFS 才给出最短路；带权时要用 Dijkstra。'],
    ],
  },
  'flood-fill': {
    problem: ['A grid consists of land (#) and water (.). Two land cells belong to the same island if they are adjacent horizontally or vertically. Count the islands.', '网格由陆地（#）和水（.）组成。上下左右相邻的陆地属于同一座岛。求岛屿的数量。'],
    why: ['An island is a connected region. Pick any land cell that has not been labelled yet: it belongs to an island you have not counted, so count one. Then label the entire island so that it is never counted again — spread from that cell to its land neighbours, from them to their neighbours, and so on, exactly like paint flooding a region. When the spreading stops, every cell of that island carries the label. Continue scanning the grid for the next unlabelled land cell. Each cell is labelled once and examined a constant number of times, so the whole grid is processed in time proportional to its size.', '一座岛就是一个连通区域。任取一个尚未标记的陆地格子：它属于一座还没数过的岛，于是计数加一。接着把整座岛都标记上，保证它不会被再数一次——从这个格子扩散到相邻的陆地，再扩散到它们的邻居，如此继续，就像油漆漫过一片区域。扩散停止时，这座岛的每个格子都带上了标记。然后继续扫描网格，寻找下一个未标记的陆地格子。每个格子只被标记一次、被查看常数次，所以整张网格的处理时间与其大小成正比。'],
    pitfalls: [
      ['A recursive fill on a 1000 × 1000 grid can recurse a million levels deep and crash; use a queue or an explicit stack.', '在 1000 × 1000 的网格上用递归填充，递归深度可达一百万层而崩溃；应使用队列或显式的栈。'],
      ['Be clear whether diagonal neighbours count (8-connectivity) — it changes the answer.', '要弄清对角相邻是否算连通（八连通）——这会改变答案。'],
      ['Label a cell when it is added to the queue, not when it is removed.', '格子入队时就打标记，而不是出队时。'],
    ],
  },
  'a-star': {
    problem: ['In a grid with walls, find the minimum number of moves from the top-left cell to the bottom-right cell, exploring as few cells as possible.', '在有墙的网格中，求从左上角到右下角的最少步数，并尽量少探索格子。'],
    why: ['BFS explores in every direction equally, including directly away from the target. A* adds a sense of direction. For each discovered cell it knows g, the distance travelled so far, and estimates h, the distance still to go; it always expands the cell with the smallest f = g + h, the most promising total. The estimate must be optimistic — never larger than the true remaining distance. Then a cell whose f exceeds the true answer can never be needed before the target is reached, so the first time the target is expanded its distance is optimal. On a grid with 4-directional moves the Manhattan distance is such an estimate: walls can only lengthen the way. With h = 0 everywhere, A* degenerates into Dijkstra.', 'BFS 向各个方向均匀地探索，包括背离终点的方向。A* 为搜索加上了方向感。对每个已发现的格子，它知道已走的距离 g，并估计还需要走的距离 h；每次扩展 f = g + h 最小的格子，也就是总路程最有希望的那个。估计必须是乐观的——不能超过真实的剩余距离。这样，f 超过真实答案的格子在到达终点之前永远不会被需要，所以终点第一次被扩展时，它的距离就是最优的。在四方向移动的网格上，曼哈顿距离正是这样的估计：墙只会让路变长。如果处处 h = 0，A* 就退化成 Dijkstra。'],
    pitfalls: [
      ['An estimate that can overestimate (e.g. 2 × Manhattan) may return a path that is not shortest.', '可能高估的估计（例如 2 × 曼哈顿距离）会导致找到的不是最短路。'],
      ['Outdated heap entries must be skipped, exactly as in Dijkstra.', '过期的堆元素必须跳过，与 Dijkstra 完全一样。'],
      ['In the worst case (a maze full of dead ends) A* still explores everything.', '在最坏情况下（到处是死胡同的迷宫），A* 仍然要探索全部格子。'],
    ],
  },
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
  'graph-dfs': {
    problem: ['Given an undirected graph, start at vertex 1 and visit every reachable vertex by depth-first search. Print the vertices in the order they are first visited.', '给定一个无向图，从顶点 1 出发，用深度优先搜索访问所有可达的顶点。按首次访问的顺序输出顶点。'],
    why: ['Depth-first search explores like someone walking through a maze with a ball of string: go to an unvisited neighbour, then to one of its unvisited neighbours, and keep going; when every neighbour of the current vertex has been seen, follow the string back one step and try the next neighbour there. The recursion stack is the string. Marking a vertex as visited the moment you enter it guarantees that each vertex is entered once, even though the graph may contain cycles. The edges along which new vertices were discovered form a tree, the DFS tree; a great many graph algorithms — connectivity, cycle detection, bridges, strongly connected components — are DFS plus some bookkeeping on that tree.', '深度优先搜索像是拿着一团线走迷宫：走到一个未访问的邻居，再走到它的一个未访问的邻居，一直走下去；当当前顶点的所有邻居都已访问过，就沿着线退回一步，在那里尝试下一个邻居。递归栈就是那团线。进入顶点的那一刻就打上访问标记，保证每个顶点只进入一次，即使图中有环。发现新顶点时所走的那些边构成一棵树，称为 DFS 树；大量图论算法——连通性、判环、割边、强连通分量——都是 DFS 再加上在这棵树上做的一些记录。'],
    pitfalls: [
      ['For an undirected graph add the edge in both directions.', '无向图的每条边要在两个方向上都加入。'],
      ['The order of visits depends on the order of the adjacency lists.', '访问顺序取决于邻接表中的顺序。'],
      ['A graph that is one long path makes the recursion as deep as n.', '如果图是一条长链，递归深度会达到 n。'],
    ],
  },
  'graph-bfs': {
    problem: ['Given an undirected graph, start at vertex 1 and visit every reachable vertex by breadth-first search. Print the vertices in the order they are visited.', '给定一个无向图，从顶点 1 出发，用广度优先搜索访问所有可达的顶点。按访问顺序输出顶点。'],
    why: ['Breadth-first search visits vertices in rings around the start: first the start itself, then everything one edge away, then everything two edges away. The queue enforces this order. A vertex taken from the front adds its undiscovered neighbours at the back, so they wait behind all vertices that were discovered earlier — and those are at the same distance or one closer. That is why the distance assigned when a vertex is discovered, one more than the distance of the vertex that discovered it, is the smallest possible number of edges. BFS is therefore the shortest-path algorithm for graphs whose edges all have the same length.', '广度优先搜索以起点为中心一圈一圈地访问顶点：先是起点本身，然后是距离一条边的所有顶点，再是距离两条边的所有顶点。队列保证了这个顺序。从队首取出的顶点把它未发现的邻居加到队尾，这些邻居排在所有更早被发现的顶点之后——而那些顶点的距离要么相同，要么少一。所以顶点被发现时得到的距离（比发现它的顶点多一）就是最少的边数。因此在所有边长度相同的图上，BFS 就是最短路算法。'],
    pitfalls: [
      ['Set the distance (the visited mark) when pushing, not when popping.', '入队时就设置距离（即访问标记），而不是出队时。'],
      ['Using the distance array as the visited mark requires initialising it to −1, not 0.', '用距离数组兼作访问标记时，初值要设为 −1 而不是 0。'],
      ['If the graph is disconnected, vertices outside the start\'s component are never visited.', '如果图不连通，起点所在连通块以外的顶点不会被访问。'],
    ],
  },
  dijkstra: {
    problem: ['Given an undirected graph with non-negative edge weights, find the shortest distance from vertex 1 to every vertex.', '给定一个边权非负的无向图，求从顶点 1 到每个顶点的最短距离。'],
    why: ['Keep for every vertex the best distance found so far. Among the vertices not yet finished, consider the one with the smallest such distance, u. Could a different route to u be shorter? Any other route must leave the finished set through some other unfinished vertex first, and that vertex is already at least as far away as u; the remaining edges of the route only add non-negative length. So u\'s distance is final. Finish u and use it to improve its neighbours ("relax" its edges), then repeat. A min-heap finds the closest unfinished vertex quickly. The argument relies on edges never having negative weight — with a negative edge, a longer-looking detour could turn out cheaper later.', '为每个顶点记录目前找到的最短距离。在尚未确定的顶点中，考虑距离最小的那个 u。有没有可能存在另一条到 u 的更短的路线？任何其他路线都必须先经过另一个尚未确定的顶点才能离开已确定的集合，而那个顶点的距离已经不小于 u；路线上剩下的边只会再加上非负的长度。所以 u 的距离已是最终值。把 u 确定下来，用它去改进邻居（“松弛”它的边），然后重复。小根堆可以快速找出最近的未确定顶点。这个论证依赖于边权不为负——如果有负权边，一条看起来更长的绕路之后可能反而更便宜。'],
    pitfalls: [
      ['It is wrong with negative edges; use Bellman-Ford / SPFA there.', '有负权边时它是错的；那时要用 Bellman-Ford / SPFA。'],
      ['Forgetting to skip outdated heap entries can make it far slower.', '忘记跳过堆中过期的记录，会让算法慢很多。'],
      ['Distances may exceed int: use long long and a large enough "infinity".', '距离可能超出 int：要用 long long，并取足够大的“无穷大”。'],
      ['The default priority_queue is a max-heap; without greater<> you pop the farthest vertex.', 'priority_queue 默认是大根堆；不写 greater<> 弹出的就是最远的顶点。'],
    ],
  },
  spfa: {
    problem: ['Given a directed graph whose edge weights may be negative (but with no negative cycle), find the shortest distance from vertex 1 to every vertex.', '给定一个边权可能为负（但没有负环）的有向图，求从顶点 1 到每个顶点的最短距离。'],
    why: ['With negative edges Dijkstra\'s "closest vertex is final" argument fails, so fall back on a weaker but always valid fact: relaxing an edge never makes a distance wrong, and if no edge can be relaxed any more, all distances are shortest. Bellman-Ford simply relaxes every edge, round after round. After round k every shortest path with at most k edges is correct, and a shortest path never needs more than n − 1 edges, so n − 1 rounds suffice. Most of those relaxations achieve nothing, though: an edge u → v can only help if d[u] has decreased since it was last tried. SPFA keeps a queue of exactly those vertices whose distance has just decreased and relaxes only their edges.', '有负权边时，Dijkstra “最近的顶点已确定”的论证不再成立，所以退回到一个较弱但永远成立的事实：松弛一条边不会让距离变错，而如果没有任何边还能松弛，所有距离就都是最短的。Bellman-Ford 就是一轮又一轮地松弛所有的边。第 k 轮之后，所有至多 k 条边的最短路都已正确；而最短路不会超过 n − 1 条边，所以 n − 1 轮就够了。不过其中大多数松弛是徒劳的：边 u → v 只有在 d[u] 自上次尝试以来减小过，才可能带来改进。SPFA 用队列保存那些距离刚刚减小的顶点，只松弛它们的出边。'],
    pitfalls: [
      ['On adversarial inputs SPFA is as slow as Bellman-Ford, O(n · m); never use it when weights are non-negative.', '在特殊构造的数据上 SPFA 和 Bellman-Ford 一样慢，是 O(n · m)；边权非负时不要用它。'],
      ['A negative cycle makes it loop forever unless you count how often each vertex is queued.', '存在负环时会无限循环，除非统计每个顶点的入队次数。'],
      ['Forgetting to clear the in-queue flag when a vertex leaves the queue.', '顶点出队时忘记清除“在队列中”的标记。'],
    ],
  },
  floyd: {
    problem: ['Given a weighted undirected graph with up to a few hundred vertices, find the shortest distance between every pair of vertices.', '给定一个至多几百个顶点的带权无向图，求每一对顶点之间的最短距离。'],
    why: ['Define a sequence of easier questions: what is the shortest path from i to j if only vertices 1..k may be used as intermediate stops? For k = 0 the answer is the direct edge. Going from k − 1 to k, a path either does not use vertex k — then the old answer stands — or it passes through k exactly once, splitting into a path from i to k and a path from k to j, both using only vertices below k. So the new answer is the smaller of d[i][j] and d[i][k] + d[k][j]. After k has run through all n vertices, every vertex is allowed and the table holds the true shortest distances. Three nested loops, and remarkably the same array can be updated in place.', '定义一系列更容易的问题：如果只允许用 1..k 号顶点作为中转点，从 i 到 j 的最短路是多少？k = 0 时答案就是直接相连的边。从 k − 1 到 k，一条路径要么不经过顶点 k——那么原来的答案不变——要么恰好经过 k 一次，被分成从 i 到 k 和从 k 到 j 的两段，而这两段都只用到编号小于 k 的顶点。所以新的答案是 d[i][j] 和 d[i][k] + d[k][j] 中较小的那个。当 k 取遍全部 n 个顶点后，所有顶点都允许中转，表中就是真正的最短距离。三重循环即可，而且可以直接在同一个数组上原地更新。'],
    pitfalls: [
      ['The intermediate vertex k must be the outermost loop.', '中转点 k 必须在最外层循环。'],
      ['"Infinity + infinity" must not overflow: use 0x3f3f3f3f-style values, not INT_MAX.', '“无穷大 + 无穷大”不能溢出：要用 0x3f3f3f3f 这类值，而不是 INT_MAX。'],
      ['Initialise d[i][i] = 0 and keep the smallest of parallel edges.', '要初始化 d[i][i] = 0，并在重边中保留最小的一条。'],
    ],
  },
  prim: {
    problem: ['Given a connected weighted undirected graph, choose n − 1 edges that connect all vertices with the smallest possible total weight (a minimum spanning tree). Print that weight.', '给定一个连通的带权无向图，选出 n − 1 条边连通所有顶点，并使总权值最小（最小生成树）。输出这个权值。'],
    why: ['Start with a tree consisting of one vertex and grow it. At any moment the vertices are divided into those inside the tree and those outside, and some edges cross between the two groups. The lightest crossing edge is always safe to add: take any spanning tree that does not use it; adding it creates a cycle, and that cycle must cross the division a second time through some other edge that is at least as heavy; replacing that edge by the lighter one keeps everything connected and does not increase the weight. So repeatedly add the lightest edge leaving the tree. A min-heap of candidate edges makes each step fast; entries whose far end has meanwhile joined the tree are simply discarded.', '从只有一个顶点的树开始，让它逐渐生长。任何时刻，顶点被分成树内和树外两部分，有一些边横跨这两部分。其中最轻的横跨边总是可以安全地加入：任取一棵没有用到它的生成树，把它加进去会形成一个环，而这个环必然通过另一条至少同样重的边再次横跨这个划分；用较轻的边换掉那一条，图仍然连通，权值也不会增加。所以不断加入离开这棵树的最轻的边即可。用小根堆保存候选边能让每一步都很快；另一端已经进入树内的记录直接丢弃。'],
    pitfalls: [
      ['Pushing the accumulated distance (as in Dijkstra) instead of the edge weight computes shortest paths, not a spanning tree.', '像 Dijkstra 那样把累计距离（而不是边权）压入堆，求出的是最短路而不是生成树。'],
      ['If the graph is disconnected the loop ends early; check that all n vertices joined.', '如果图不连通，循环会提前结束；要检查是否 n 个顶点都已加入。'],
      ['For dense graphs the O(n²) array version without a heap is faster.', '对于稠密图，不用堆的 O(n²) 数组写法更快。'],
    ],
  },
  kruskal: {
    problem: ['Given a connected weighted undirected graph, find the total weight of a minimum spanning tree.', '给定一个连通的带权无向图，求最小生成树的总权值。'],
    why: ['Sort the edges from lightest to heaviest and decide on each one in turn. If its two endpoints are already connected by the edges chosen so far, adding it would create a cycle, and a cycle is never needed for connectivity — skip it. Otherwise the edge joins two separate components, and it is the lightest edge that leaves either of them (every lighter edge has already been examined and lies inside a component), so by the cut property it is safe to take. After n − 1 accepted edges everything is connected. The only non-trivial question, "are these two vertices already connected?", is exactly what a disjoint-set union answers in near-constant time.', '把边按从轻到重排序，依次决定每一条边的取舍。如果它的两个端点已经被之前选中的边连通，加入它就会成环，而保持连通永远不需要环——跳过。否则这条边连接了两个不同的连通块，并且它是离开其中任何一个连通块的最轻的边（所有更轻的边都已检查过，都在某个连通块内部），所以由切割性质可知选它是安全的。选满 n − 1 条边后，所有顶点就连通了。唯一不平凡的问题——“这两个顶点是否已经连通？”——正是并查集能在近乎常数时间内回答的。'],
    pitfalls: [
      ['Merging x and y directly instead of their roots breaks the union-find.', '直接合并 x 和 y 而不是它们的根，会把并查集弄坏。'],
      ['The edge array must hold m edges, not n.', '边数组要能存下 m 条边，而不是 n 条。'],
      ['If fewer than n − 1 edges are accepted, the graph is disconnected and no spanning tree exists.', '如果选中的边少于 n − 1 条，说明图不连通，不存在生成树。'],
    ],
  },
  'topo-sort': {
    problem: ['Given a directed graph where an edge u → v means "u must come before v", print an order of all vertices that respects every edge, or report that none exists.', '给定一个有向图，边 u → v 表示“u 必须排在 v 之前”。输出一个满足所有边的顶点顺序，或报告不存在这样的顺序。'],
    why: ['Which vertex can be placed first? One that nothing must precede — a vertex with no incoming edges. Place it. Its outgoing edges are now satisfied whatever comes later, so they can be ignored, which may free further vertices. Repeating this produces a valid order. Instead of deleting edges, keep for each vertex the number of unsatisfied incoming edges and decrease it; vertices whose count reaches zero wait in a queue. If the graph contains a cycle, the vertices on it wait for each other forever and never reach zero, so the output is shorter than n — which is also how cycles are detected. Many problems on directed acyclic graphs, such as longest paths, are solved by processing vertices in this order.', '哪个顶点可以排在最前面？没有任何顶点必须排在它之前的那个——也就是入度为零的顶点。把它放好。它的出边此后无论如何都已满足，可以不再考虑，这又可能让其他顶点变得可用。重复这个过程就得到一个合法的顺序。不必真的删边，只需为每个顶点记录尚未满足的入边数并不断减少；数量变为零的顶点进入队列等待。如果图中有环，环上的顶点互相等待，入度永远不会变为零，于是输出的顶点少于 n 个——这也正是判环的方法。有向无环图上的许多问题（例如最长路）都是按这个顺序处理顶点来求解的。'],
    pitfalls: [
      ['Forgetting the final size check: on a cyclic graph you would print a partial order as if it were valid.', '忘记最后检查个数：在有环的图上会把不完整的顺序当作合法结果输出。'],
      ['The order is usually not unique; a checker must accept any valid one.', '拓扑序通常不唯一；评测时任何合法的顺序都应被接受。'],
      ['For the lexicographically smallest order replace the queue by a min-heap.', '若要求字典序最小的拓扑序，把队列换成小根堆。'],
    ],
  },
  bipartite: {
    problem: ['Decide whether the vertices of an undirected graph can be split into two groups so that every edge joins vertices from different groups.', '判断一个无向图的顶点能否分成两组，使得每条边连接的两个顶点都不在同一组。'],
    why: ['Call the two groups colours. Once one vertex of a connected component has a colour, everything else is forced: its neighbours must have the other colour, their neighbours the first colour again, and so on. So just carry out this forced colouring with a BFS and watch for a contradiction — an edge whose two ends received the same colour. If that happens, the two ends were reached from the start by paths whose lengths have the same parity, and together with the edge they close a cycle of odd length; a cycle of odd length can never be 2-coloured, so no split exists. If no contradiction appears in any component, the colouring itself is the split.', '把两组称为两种颜色。连通块中只要有一个顶点确定了颜色，其余的就都被迫确定了：它的邻居必须是另一种颜色，邻居的邻居又是第一种颜色，如此继续。所以只需用 BFS 执行这种“被迫的”染色，并留意矛盾——某条边的两端被染成了同一种颜色。如果发生这种情况，这两个端点从起点出发的路径长度奇偶性相同，加上这条边就构成一个奇数长度的环；奇环不可能二染色，所以不存在这样的分组。如果所有连通块都没有出现矛盾，染色的结果本身就是所求的分组。'],
    pitfalls: [
      ['Starting the search only from vertex 1 misses other components.', '只从顶点 1 开始搜索，会漏掉其他连通块。'],
      ['A self-loop makes a graph non-bipartite immediately.', '自环会让图直接成为非二分图。'],
      ['Use three states (uncoloured, colour 1, colour 2), not a boolean.', '要用三种状态（未染色、颜色 1、颜色 2），而不是布尔值。'],
    ],
  },
  'tarjan-scc': {
    problem: ['In a directed graph, a strongly connected component is a largest possible set of vertices in which every vertex can reach every other. Count the components.', '在有向图中，强连通分量是一个极大的顶点集合，其中任意两个顶点互相可达。求强连通分量的个数。'],
    why: ['Run a DFS and number the vertices in order of first visit (dfn). Within one component, the vertex visited first is an ancestor in the DFS tree of all the others — call it the root of the component. The task is to recognise roots. For each vertex compute low: the smallest dfn that can be reached from its subtree by tree edges followed by at most one edge to a vertex that is still "open" (on the stack). If low[u] < dfn[u], something below u reaches an earlier open vertex, which in turn reaches u, so u belongs to a component rooted higher up. If low[u] = dfn[u], nothing below u escapes upward: u is a root, and the vertices pushed on the stack since u are exactly its component — pop them. Vertices already popped are in finished components and must be ignored.', '做一次 DFS，按首次访问的顺序给顶点编号（dfn）。在同一个分量中，最先被访问的顶点是其余所有顶点在 DFS 树上的祖先——称它为这个分量的根。任务就是识别出这些根。对每个顶点计算 low：从它的子树出发，先走树边，再至多走一条指向仍然“开放”（在栈中）的顶点的边，所能到达的最小 dfn。如果 low[u] < dfn[u]，说明 u 下面有顶点能到达更早的开放顶点，而后者又能到达 u，所以 u 属于根在更高处的某个分量。如果 low[u] = dfn[u]，说明 u 下面没有任何顶点能向上逃出去：u 是一个根，自 u 入栈以来压入栈中的顶点恰好就是它的分量——把它们弹出。已经弹出的顶点属于已完成的分量，必须忽略。'],
    pitfalls: [
      ['Updating low through a vertex that is no longer on the stack merges separate components.', '通过已经不在栈中的顶点更新 low，会把不同的分量错误地合并。'],
      ['The outer loop must start a DFS from every unvisited vertex, not just vertex 1.', '外层循环要从每个未访问的顶点开始 DFS，而不只是顶点 1。'],
      ['Deep recursion: a path of 10⁵ vertices needs a large stack.', '递归很深：一条 10⁵ 个顶点的链需要很大的栈空间。'],
    ],
  },
  'cut-bridge': {
    problem: ['In an undirected graph, a cut vertex (bridge) is a vertex (edge) whose removal increases the number of connected components. Count the cut vertices and the bridges.', '在无向图中，如果删除某个顶点（某条边）会使连通块数增加，它就称为割点（割边）。求割点数和割边数。'],
    why: ['Removing a vertex or edge and re-checking connectivity each time is O(n · m). One DFS is enough. In the DFS tree of an undirected graph every non-tree edge connects a vertex to one of its ancestors (a back edge). Let low[v] be the highest point — smallest dfn — that the subtree of v can reach using such back edges. Consider a tree edge from u down to v. If low[v] > dfn[u], the subtree of v has no back edge reaching u or above, so the tree edge is its only connection to the rest: a bridge. If low[v] ≥ dfn[u], the subtree cannot get strictly above u, so deleting u separates it: u is a cut vertex. The root has nothing above it, so that test is meaningless there; instead the root is a cut vertex exactly when it has two or more children in the DFS tree.', '每次删掉一个顶点或一条边再重新检查连通性，是 O(n · m)。其实一次 DFS 就够了。在无向图的 DFS 树中，每条非树边都连接一个顶点和它的某个祖先（返祖边）。设 low[v] 为 v 的子树借助这些返祖边所能到达的最高位置——即最小的 dfn。考虑一条从 u 向下到 v 的树边。如果 low[v] > dfn[u]，v 的子树没有任何返祖边能到达 u 或更高的地方，这条树边就是它与外界的唯一联系：它是割边。如果 low[v] ≥ dfn[u]，这棵子树无法到达严格高于 u 的地方，所以删掉 u 就会把它分离出去：u 是割点。根的上方什么也没有，这个判据对根没有意义；根是割点，当且仅当它在 DFS 树中有两个或更多孩子。'],
    pitfalls: [
      ['Skipping "the parent vertex" instead of "the edge we came by" is wrong when there are parallel edges.', '跳过“父顶点”而不是“来时的那条边”，在有重边时是错的。'],
      ['Bridge uses >, cut vertex uses ≥ — mixing them up is the classic mistake.', '割边用 >，割点用 ≥——弄混它们是最经典的错误。'],
      ['Count each cut vertex once, even if several children satisfy the condition.', '即使有多个孩子满足条件，每个割点也只能计一次。'],
    ],
  },
  lca: {
    problem: ['Given a rooted tree and q pairs of vertices, find for each pair their lowest common ancestor — the deepest vertex that is an ancestor of both.', '给定一棵有根树和 q 对顶点，对每一对求它们的最近公共祖先——同时是两者祖先的最深的顶点。'],
    why: ['The naive method raises the deeper vertex to the depth of the other and then moves both up one step at a time until they meet — O(n) per query on a deep tree. Speed it up by taking big jumps. Store for every vertex its ancestor 1, 2, 4, 8, … levels up; the 2ʲ-th ancestor is the 2ʲ⁻¹-th ancestor of the 2ʲ⁻¹-th ancestor, so the table fills quickly. Levelling the depths is then a matter of jumping by the binary digits of the difference. For the second phase use monotonicity: jumping k levels from both vertices lands on the same vertex exactly when k is at least the distance to the LCA. So try the jumps from largest to smallest and take a jump only if the two landing vertices differ. The vertices end up directly below the LCA.', '朴素的做法是先把较深的顶点提升到与另一个相同的深度，然后两个顶点一起每次向上走一步直到相遇——在很深的树上每次询问是 O(n)。通过大步跳跃可以加速。为每个顶点保存它向上 1、2、4、8……层的祖先；第 2ʲ 级祖先就是第 2ʲ⁻¹ 级祖先的第 2ʲ⁻¹ 级祖先，所以这张表很快就能填好。对齐深度只需按深度差的二进制位来跳。第二阶段利用单调性：两个顶点同时向上跳 k 层会落在同一个顶点上，当且仅当 k 不小于到 LCA 的距离。所以从大到小尝试各种跳跃，只有当两个落点不同时才真的跳。最后两个顶点会停在 LCA 的正下方。'],
    pitfalls: [
      ['The loop over j must run from large to small in both phases.', '两个阶段中 j 的循环都必须从大到小。'],
      ['Returning u instead of its parent after the second phase.', '第二阶段结束后返回了 u，而不是它的父亲。'],
      ['Forgetting the case where one vertex is an ancestor of the other.', '忘记处理其中一个顶点本身就是另一个的祖先的情况。'],
      ['The table height must cover log₂ n: 20 levels handle a million vertices.', '表的层数要覆盖 log₂ n：20 层可以应付一百万个顶点。'],
    ],
  },
  'tree-diameter': {
    problem: ['Find the diameter of a tree: the number of edges on the longest path between any two vertices.', '求树的直径：任意两个顶点之间最长路径上的边数。'],
    why: ['Trying every pair of vertices is O(n²). Two searches are enough because of one fact: starting from any vertex s, the vertex u farthest from s is an endpoint of some diameter. Sketch of why: take a true diameter from a to b. The path from s towards u must leave the diameter somewhere, and since u is at least as far from s as a or b is, swapping the corresponding end of the diameter for u cannot make it shorter. Once one endpoint is known, the other is simply the vertex farthest from it. In a tree, distances from one vertex are found by a single BFS or DFS, since there is exactly one path between any two vertices.', '枚举每一对顶点是 O(n²)。只需两次搜索就够了，原因是这样一个事实：从任意顶点 s 出发，离 s 最远的顶点 u 一定是某条直径的端点。大致的理由：取一条真正的直径 a 到 b。从 s 走向 u 的路径总要在某处离开这条直径，而 u 到 s 的距离不小于 a 或 b 到 s 的距离，所以把直径相应的一端换成 u，长度不会变短。一旦知道了一个端点，另一个端点就是离它最远的顶点。在树上，从一个顶点出发的所有距离只需一次 BFS 或 DFS 即可求出，因为任意两点之间恰好只有一条路径。'],
    pitfalls: [
      ['The two-search method fails when edge weights can be negative; use tree DP then.', '边权可能为负时，两次搜索的方法是错的；那时要用树形 DP。'],
      ['The distance array must be reset before the second search.', '第二次搜索之前要把距离数组重新初始化。'],
      ['A tree with one vertex has diameter 0.', '只有一个顶点的树，直径为 0。'],
    ],
  },
  hld: {
    problem: ['Given a rooted tree and q pairs of vertices, find the lowest common ancestor of each pair using heavy-light decomposition.', '给定一棵有根树和 q 对顶点，用树链剖分求每一对顶点的最近公共祖先。'],
    why: ['Many tree problems ask about paths, while our best tools — prefix sums, segment trees — work on arrays. Heavy-light decomposition cuts the tree into vertical chains so that every chain is a contiguous piece of one array and every path consists of only a few pieces. At each vertex call the child with the largest subtree heavy and the others light. Stepping down to a light child at least halves the size of the subtree you are in, so on the way from the root to any vertex there are at most log n light edges — and hence at most log n + 1 chains. To process a path, repeatedly take the endpoint whose chain starts deeper, handle the part of the path on that chain in one go, and jump to the parent of the chain\'s top. When both endpoints are on the same chain, the shallower one is the LCA.', '很多树上的问题问的是路径，而我们最好用的工具——前缀和、线段树——都是针对数组的。树链剖分把树切成若干条竖直的链，使每条链都是同一个数组中连续的一段，并且每条路径只由少数几段组成。在每个顶点处，把子树最大的孩子称为重儿子，其余的称为轻儿子。每走到一个轻儿子，所在子树的大小至少减半，所以从根到任何顶点的路上至多有 log n 条轻边——也就至多 log n + 1 条链。处理一条路径时，反复选取链顶更深的那个端点，一次性处理路径在这条链上的部分，然后跳到链顶的父亲。当两个端点位于同一条链上时，较浅的那个就是 LCA。'],
    pitfalls: [
      ['Comparing the depths of the two vertices instead of the depths of their chain tops.', '比较的是两个顶点自身的深度，而不是它们链顶的深度。'],
      ['Visiting a light child before the heavy child breaks the contiguity of chains in dfn order.', '先访问轻儿子再访问重儿子，会破坏链在 dfn 序中的连续性。'],
      ['Two DFS passes are required: sizes first, chains second.', '需要两遍 DFS：先求子树大小，再划分链。'],
    ],
  },
  dinic: {
    problem: ['A directed graph has a capacity on every edge. Find the largest amount of flow that can be sent from vertex 1 (the source) to vertex n (the sink) without exceeding any capacity.', '有向图的每条边都有一个容量。求在不超过任何边的容量的前提下，从顶点 1（源点）到顶点 n（汇点）最多能输送多少流量。'],
    why: ['The obvious approach — keep finding a path with spare capacity and push flow along it — can paint itself into a corner: an early path may use an edge in a way that blocks better combinations. The fix is the residual graph. Whenever flow is sent along an edge, add the same amount of capacity to a reverse edge. Sending flow along the reverse edge later means cancelling part of the earlier decision. With reverse edges, the flow is maximum exactly when no source-to-sink path with spare capacity remains (the max-flow min-cut theorem). Dinic\'s algorithm organises the search for such paths: a BFS layers the vertices by distance from the source, and a DFS only pushes flow from each layer to the next, which finds many shortest augmenting paths per phase. Each phase increases the distance to the sink, so there are at most n phases.', '最直接的做法——不断找一条还有剩余容量的路径并沿它推流——可能把自己逼进死角：较早的一条路径占用某条边的方式，可能阻碍了更好的组合。解决办法是残量网络。每当沿一条边送出流量，就给它的反向边增加同样多的容量。之后沿反向边送流，就相当于撤销先前决定的一部分。有了反向边，当且仅当不再存在从源点到汇点的、有剩余容量的路径时，流达到最大（最大流最小割定理）。Dinic 算法把寻找这种路径的过程组织起来：BFS 按到源点的距离给顶点分层，DFS 只把流量从一层推向下一层，这样每个阶段能找到许多条最短的增广路。每个阶段都会使到汇点的距离增大，所以至多有 n 个阶段。'],
    pitfalls: [
      ['Edges must be stored in pairs starting at an even index so that id ^ 1 is the reverse edge.', '边必须从偶数下标开始成对存储，这样 id ^ 1 才是反向边。'],
      ['Forgetting to reset the current-arc array before each phase.', '每个阶段开始前忘记重置当前弧数组。'],
      ['Without the current-arc optimisation the DFS retries dead edges and becomes far slower.', '没有当前弧优化，DFS 会反复尝试已经走不通的边，慢很多。'],
      ['The total flow may exceed int; accumulate it in long long.', '总流量可能超出 int；要用 long long 累加。'],
    ],
  },
  hungarian: {
    problem: ['A bipartite graph has nl vertices on the left and nr on the right; an edge means that pair may be matched. Each vertex may be matched at most once. Find the largest possible number of matched pairs.', '二分图左边有 nl 个顶点，右边有 nr 个顶点；一条边表示这两个顶点可以配对。每个顶点最多配对一次。求最多能配成多少对。'],
    why: ['Greedy matching can get stuck: a left vertex may find all its partners taken although a larger matching exists. The remedy is to let earlier choices be revised. Left vertex u looks at a partner v. If v is free, take it. If v is taken by w, ask w to find a different partner — recursively, by the same procedure; if w succeeds, v becomes free for u. A successful chain of such requests is an augmenting path: it alternates between edges not in the matching and edges in it, and starts and ends at unmatched vertices. Swapping the roles of its edges increases the matching by one and keeps everyone on the path matched. A matching is maximum precisely when no augmenting path exists, so trying each left vertex once is enough.', '贪心地配对可能卡住：某个左部点发现它的所有对象都已被占用，但其实存在更大的匹配。补救的办法是允许修改之前的选择。左部点 u 考察一个对象 v。如果 v 空闲，就选它。如果 v 已被 w 占用，就请 w 另找一个对象——递归地使用同样的过程；如果 w 成功了，v 就空出来给 u。这样一串成功的请求就是一条增广路：它在非匹配边和匹配边之间交替，并且起点和终点都是未匹配的顶点。把这条路上的边的角色互换，匹配数增加一，路上原本已匹配的顶点仍然保持匹配。当且仅当不存在增广路时，匹配是最大的；所以对每个左部点尝试一次就够了。'],
    pitfalls: [
      ['The visited array must be cleared before each left vertex, not once at the start.', 'vis 数组要在每个左部点开始前清空，而不是只在最开始清空一次。'],
      ['Marking v as visited after the recursive call (instead of before) can recurse forever.', '在递归调用之后（而不是之前）才标记 v 已访问，可能导致无限递归。'],
      ['It is O(n · m); for very large graphs use Hopcroft–Karp or a flow algorithm.', '复杂度是 O(n · m)；图非常大时应使用 Hopcroft–Karp 或网络流。'],
    ],
  },
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
  kmp: {
    problem: ['Given a text and a pattern, find every position at which the pattern occurs in the text.', '给定文本串和模式串，求模式串在文本串中每一次出现的位置。'],
    why: ['The naive method lines the pattern up at each position and compares; after a mismatch it moves the pattern one step and starts comparing from scratch, re-reading text it has already seen — O(n · m) in the worst case. KMP never re-reads. Suppose the first j characters of the pattern matched and the next one did not. Those j text characters are known: they equal the pattern\'s own first j characters. The pattern can only match again at a shift where its beginning agrees with the end of what was just matched — that is, where a prefix of the matched part equals a suffix of it. Such a prefix-suffix is called a border, and the longest border of every pattern prefix can be computed in advance from the pattern alone. On a mismatch, keep the longest border and continue comparing from there.', '朴素的方法是把模式串对准每个位置逐一比较；失配后把模式串移动一位，再从头开始比较，重复读取已经看过的文本——最坏情况 O(n · m)。KMP 从不重读。假设模式串的前 j 个字符已经匹配，而下一个字符失配了。这 j 个文本字符是已知的：它们就等于模式串自己的前 j 个字符。模式串下一次可能匹配的位置，必须使它的开头与刚才匹配部分的结尾相吻合——也就是说，已匹配部分的某个前缀等于它的某个后缀。这样的“前缀 = 后缀”称为 border，而模式串每个前缀的最长 border 可以只根据模式串本身预先算出。失配时，保留最长的 border，从那里继续比较。'],
    pitfalls: [
      ['Falling back with j = nxt[j] instead of nxt[j − 1] (or the other way round, depending on the indexing convention).', '回退时把 j = nxt[j − 1] 写成 j = nxt[j]（或者相反，取决于下标约定）。'],
      ['Resetting j to 0 after a full match misses overlapping occurrences such as "aa" in "aaa".', '完整匹配之后把 j 重置为 0，会漏掉重叠的出现，例如 “aaa” 中的 “aa”。'],
      ['Using if instead of while for the fallback handles only one step back.', '回退时用 if 而不是 while，只能退一步。'],
    ],
  },
  manacher: {
    problem: ['Find the length of the longest substring of a string that reads the same forwards and backwards.', '求一个字符串中最长的回文子串（正读反读都相同）的长度。'],
    why: ['Expanding around each centre character by character is O(n²) on strings like "aaaa…". Palindromes are symmetric, and that symmetry lets earlier results be reused. Keep the palindrome found so far that extends furthest to the right, with centre c and right end r. For a new centre i inside it, look at the mirror position 2c − i on the other side of c. Everything around the mirror, as far as the big palindrome reaches, is repeated around i in reverse. So the palindrome at i is at least as long as the one at the mirror — capped at the distance to r, beyond which nothing is known. Only then compare characters, and only beyond r. Each successful comparison moves r to the right, and r can move right at most n times in total, hence linear time. Inserting a separator between all characters gives odd and even palindromes a common form.', '以每个位置为中心逐字符向外扩展，在 “aaaa…” 这样的串上是 O(n²)。回文是对称的，而对称性使得之前的结果可以复用。维护目前找到的、右端最靠右的那个回文串，设它的中心为 c、右端为 r。对于位于其中的新中心 i，看它关于 c 的对称位置 2c − i。在大回文串覆盖的范围内，对称点周围的内容会倒过来在 i 的周围重复出现。所以 i 处的回文至少和对称点处的一样长——但不能超过到 r 的距离，因为 r 之外的情况还不知道。之后才需要比较字符，而且只比较 r 之外的部分。每次成功的比较都会把 r 向右推，而 r 总共最多右移 n 次，所以是线性时间。在所有字符之间插入分隔符，就把奇数长度和偶数长度的回文统一成了同一种形式。'],
    pitfalls: [
      ['Forgetting the cap r − i copies information from outside the known palindrome.', '忘记用 r − i 封顶，会把已知回文之外的信息错误地复制过来。'],
      ['Without sentinels at both ends the expansion loop runs off the string.', '两端没有哨兵时，扩展的循环会越界。'],
      ['The two sentinels must be different characters, or they match each other.', '两个哨兵必须是不同的字符，否则它们会互相匹配。'],
    ],
  },
  'z-function': {
    problem: ['For a string s, compute for every position i the length of the longest common prefix of s and the suffix of s starting at i.', '对字符串 s，求出每个位置 i 的值：从 i 开始的后缀与 s 本身的最长公共前缀的长度。'],
    why: ['Comparing from scratch at every position is O(n²). The saving comes from remembering one match: the segment [l, r) that matched a prefix of s and reaches furthest right. Inside that segment the string is a copy of its own beginning: s[l..r) equals s[0..r − l). So for a position i inside it, what follows i looks exactly like what follows i − l, at least until the segment ends. The value z[i − l] is already known; if it stays inside the segment, z[i] is the same and nothing needs comparing. If it reaches the end of the segment, take what is certain (r − i) and compare onward from r. Every successful comparison pushes r to the right, so the total number of comparisons is linear.', '在每个位置都从头比较是 O(n²)。优化来自记住一段匹配：与 s 的前缀匹配、并且右端最靠右的那一段 [l, r)。在这一段内，字符串就是它自己开头的复制品：s[l..r) 等于 s[0..r − l)。所以对于段内的位置 i，从 i 往后的内容与从 i − l 往后的内容完全一样——至少在这一段结束之前如此。z[i − l] 已经算好了；如果它没有超出这一段，z[i] 就等于它，不需要任何比较。如果它到达了这一段的末尾，就先取可以确定的部分（r − i），再从 r 开始继续比较。每次成功的比较都会把 r 向右推，所以比较的总次数是线性的。'],
    pitfalls: [
      ['Taking z[i − l] without the cap r − i claims a match that was never verified.', '直接取 z[i − l] 而不用 r − i 封顶，会把从未验证过的部分当作匹配。'],
      ['The expansion loop needs the bound i + z[i] < n.', '扩展循环必须有边界条件 i + z[i] < n。'],
      ['When matching with p + "#" + t, the separator must not occur in either string.', '用 p + "#" + t 做匹配时，分隔符不能在两个串中出现。'],
    ],
  },
  'ac-automaton': {
    problem: ['Given n patterns and a text, count the total number of occurrences of all the patterns in the text.', '给定 n 个模式串和一个文本串，求所有模式串在文本中出现的总次数。'],
    why: ['Running KMP once per pattern costs the text length times the number of patterns. To search for all patterns at once, put them into a trie, so that reading the text means walking down the trie. The difficulty is what to do when the walk cannot continue. Exactly as in KMP, do not start over: move to the longest proper suffix of what has been read that is still a path in the trie, and try again from there. That destination is the node\'s fail link. Fail links are computed level by level with a BFS, because the fail link of a node always points to a shallower node. Two refinements make the search a simple loop: missing trie edges are filled in with the edge of the fail node, and each node\'s match count absorbs the count of its fail node, since every pattern ending there also ends here.', '对每个模式串各跑一遍 KMP，代价是文本长度乘以模式串个数。要同时搜索所有模式串，就把它们放进一棵字典树，这样读文本就相当于在字典树上往下走。难点在于走不下去时怎么办。和 KMP 完全一样，不要从头再来：转移到“已读内容的最长真后缀中、仍然是字典树上一条路径的那个”，从那里再试。这个转移目标就是结点的 fail 指针。fail 指针用 BFS 逐层计算，因为一个结点的 fail 总是指向更浅的结点。再加上两点改进，搜索就变成了一个简单的循环：字典树上缺失的边用 fail 结点的对应边补上；每个结点的匹配计数加上它 fail 结点的计数，因为凡是在那里结束的模式串，也同时在这里结束。'],
    pitfalls: [
      ['Computing fail links with a DFS: they need the shallower levels to be finished first, so BFS is required.', '用 DFS 求 fail 指针：它依赖更浅的层先算完，所以必须用 BFS。'],
      ['Forgetting to combine counts along fail links misses patterns that are suffixes of other patterns.', '忘记沿 fail 指针累加计数，会漏掉那些是其他模式串后缀的模式串。'],
      ['The root\'s children have fail = root; pushing the root itself into the queue creates a self-loop bug.', '根的孩子的 fail 指向根；把根本身也放进队列会产生自环的错误。'],
    ],
  },
  'suffix-array': {
    problem: ['Sort all suffixes of a string in lexicographic order and print their starting positions.', '把一个字符串的所有后缀按字典序排序，输出它们的起始位置。'],
    why: ['Sorting the suffixes with ordinary string comparison is too slow, because comparing two suffixes can take O(n). The doubling method makes every comparison O(1). Suppose all suffixes have been ranked by their first k characters. The first 2k characters of the suffix starting at i are its first k characters followed by the first k characters of the suffix starting at i + k — and the ranks of both halves are known. So comparing two suffixes by their first 2k characters is just comparing two pairs of integers. Sort by those pairs, assign new ranks (equal pairs get equal ranks), and double k. Starting from single characters, k reaches n after log n rounds, by which time all ranks are distinct and the order is final.', '用普通的字符串比较给后缀排序太慢，因为比较两个后缀可能需要 O(n)。倍增法让每次比较都是 O(1)。假设所有后缀已经按前 k 个字符排好了名次。从 i 开始的后缀的前 2k 个字符，就是它的前 k 个字符，后面接上从 i + k 开始的后缀的前 k 个字符——而这两半的名次都是已知的。所以按前 2k 个字符比较两个后缀，只是比较两个整数二元组。按这些二元组排序，重新分配名次（相同的二元组名次相同），再把 k 翻倍。从单个字符开始，经过 log n 轮 k 就达到 n，此时所有名次互不相同，顺序也就最终确定了。'],
    pitfalls: [
      ['A suffix shorter than k has no second half; its second key must be smaller than any real rank.', '长度不足 k 的后缀没有后一半；它的第二关键字必须比任何真实的名次都小。'],
      ['Assigning new ranks in place corrupts comparisons still in progress; write to a temporary array.', '直接在原数组上更新名次会破坏仍在进行的比较；应先写入临时数组。'],
      ['With std::sort each round is O(n log n); the radix-sort version brings the total to O(n log n).', '使用 std::sort 时每轮是 O(n log n)；改用基数排序可使总复杂度降到 O(n log n)。'],
    ],
  },
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
}
