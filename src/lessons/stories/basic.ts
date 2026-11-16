import { arr, grid, gt, span, tn } from '../../engine/h'
import type { Extras } from '../rich'
import { row } from './util'

export const BASIC: Record<string, Extras> = {
  'base-conversion': {
    story: [
      { kind: 'naive', title: ['Start from what the digits mean', '先想清楚每一位数字的含义'],
        body: ['In base k a number is `d₀ + d₁·k + d₂·k² + …`, every digit between 0 and k − 1. You could hunt for the **highest** digit first: find the largest power of k that fits, see how many times it fits, continue with the rest. It works, but you must first find that power and then carry a table of powers around.', '在 k 进制下，一个数就是 `d₀ + d₁·k + d₂·k² + …`，每一位都在 0 到 k − 1 之间。可以先找**最高位**：找出不超过它的最大的 k 的幂，看能放下几个，再处理剩下的部分。这样可行，但得先找到那个幂，还要带着一张幂表一路算下去。'],
        fig: () => [grid('156 in base 8, highest digit first', [[64, 8, 1], [2, 3, 4], [28, 4, 0]], gt({ cmp: row(0, 0, 2), ok: row(1, 0, 2) }), { rows: ['power of 8', 'how many fit', 'what is left'] })] },
      { kind: 'insight', title: ['One division splits off the lowest digit', '除一次，就分离出最低位'],
        body: ['Every term except d₀ is a multiple of k. So ==n mod k is exactly d₀==, and ==n / k is the same number with that digit removed==: `d₁ + d₂·k + …`. No powers are needed — the lowest digit simply falls out.', '除了 d₀ 以外，每一项都是 k 的倍数。所以 ==n mod k 恰好就是 d₀==，而 ==n / k 就是去掉这一位之后的数==：`d₁ + d₂·k + …`。根本不需要幂——最低位自己就掉出来了。'],
        fig: () => [grid('156 = 19 × 8 + 4', [[156], [4], [19]], gt({ ok: [[1, 0]], act: [[2, 0]] }), { rows: ['n', 'n mod 8  → digit', 'n / 8  → what remains'] })] },
      { kind: 'how', title: ['Repeat until nothing is left, then reverse', '反复做到除尽，再把结果倒过来'],
        body: ['Divide again and again; each division peels off one digit. They come out __lowest first__, but we write numbers highest first — so ==reverse the digits== at the end. Digits 10–15 are written as the letters A–F.', '一遍一遍地除下去，每除一次剥下一位。数字是__从低位到高位__出来的，而书写时高位在前——所以最后要==把这些数字倒过来==。10–15 这几个数字用字母 A–F 表示。'],
        fig: () => [grid('156 → base 8', [[156, 19, 2], [4, 3, 2], [19, 2, 0]], gt({ ok: row(1, 0, 2), dim: [[2, 2]] }), { rows: ['n', 'n mod 8', 'n / 8'], cols: ['step 1', 'step 2', 'step 3'] }), arr('digits as produced → reversed: 234', [4, 3, 2], tn({ ok: span(0, 2) }))] },
      { kind: 'result', title: ['One step per digit', '每一位只需一步'],
        body: ['A number n has about **log_k n** digits, so that is the number of divisions. Going back is the mirror image: start from 0 and, for each digit from the highest down, do `value = value × k + digit`.', '数 n 大约有 **log_k n** 位，这也就是除法的次数。反过来转换正好是镜像操作：从 0 开始，从最高位到最低位，依次做 `value = value × k + digit`。'] },
    ],
    flow: [
      { id: 'init', kind: 'start', text: ['res = ""   ("0" if n = 0)', 'res = ""（n = 0 时为 "0"）'], on: [] },
      { id: 'loop', kind: 'test', text: ['n > 0 ?', 'n > 0 ？'], no: 'rev', on: [] },
      { id: 'digit', text: ['append the digit n mod k', '把数字 n mod k 接到 res 末尾'] },
      { id: 'div', text: ['n = n / k', 'n = n / k'], next: 'loop' },
      { id: 'rev', kind: 'end', text: ['reverse res and print it', '把 res 反转后输出'] },
    ],
  },

  difference: {
    story: [
      { kind: 'naive', title: ['Start simple: update every element of the range', '先从最简单的做起：把区间里的每个数都改一遍'],
        body: ['For each operation walk from l to r and add v. One operation can touch **n elements**, so q operations cost up to **n × q** additions — although nobody looks at the array until the very end.', '对每个操作，从 l 走到 r，逐个加上 v。一次操作可能要改 **n 个元素**，q 次操作最多就是 **n × q** 次加法——可是直到最后才会有人去看这个数组。'],
        fig: () => [arr('a   — add 3 to positions 2..5: four writes', [6, 1, 5, 9, 9, 3], tn({ act: span(1, 4) }), { l: 1, r: 4 }, { base: 1 })] },
      { kind: 'insight', title: ['Inside the range, neighbours rise together', '在区间内部，相邻的数是一起升高的'],
        body: ['Look at the differences `d[i] = a[i] − a[i−1]`. When a whole range rises by v, the differences __inside__ it do not change at all. Only ==two== of them do: at l, where the range begins (+v), and just after r, where it ends (−v).', '来看相邻两数的差 `d[i] = a[i] − a[i−1]`。整个区间一起加上 v 时，区间__内部__的差完全不变。发生变化的只有==两处==：区间开始的位置 l（+v），以及区间结束后的下一个位置 r + 1（−v）。'],
        fig: () => [
          arr('a after adding 3 to positions 2..5', [6, 4, 8, 12, 12, 3], tn({ act: span(1, 4) }), undefined, { base: 1 }),
          arr('d: only d[2] (−5 → −2) and d[6] (−6 → −9) changed', [6, -2, 4, 4, 0, -9], tn({ ok: 1, bad: 5, dim: [0, 2, 3, 4] }), undefined, { base: 1 }),
        ] },
      { kind: 'how', title: ['Two assignments per operation, one prefix sum at the end', '每次操作改两个数，最后做一次前缀和'],
        body: ['Keep d instead of a. Each operation is `d[l] += v; d[r+1] −= v`. When all operations are done, rebuild the array with ==a[i] = a[i−1] + d[i]== — a prefix sum, because `a[i] = d[1] + d[2] + … + d[i]`.', '维护 d 而不是 a。每次操作就是 `d[l] += v; d[r+1] −= v`。全部操作结束后，用 ==a[i] = a[i−1] + d[i]== 把数组还原出来——这就是前缀和，因为 `a[i] = d[1] + d[2] + … + d[i]`。'],
        fig: () => [arr('d', [6, -2, 4, 4, 0, -9], tn({ cmp: span(0, 3) }), undefined, { base: 1 }), arr('a = prefix sums of d', [6, 4, 8, 12, 12, 3], tn({ ok: 3 }), undefined, { base: 1 })] },
      { kind: 'result', title: ['Updates in O(1) — as long as you read only at the end', '修改 O(1)——前提是最后才读'],
        body: ['**O(1) per operation** and O(n) once to rebuild. Difference and prefix sum are ==inverse operations==: one turns range updates into point updates, the other turns range queries into point lookups. If reads and updates are mixed, you need a Fenwick or segment tree instead.', '**每次操作 O(1)**，最后还原一次 O(n)。差分与前缀和==互为逆运算==：一个把区间修改变成单点修改，另一个把区间查询变成单点查值。如果修改和查询交替出现，就需要树状数组或线段树了。'] },
    ],
    flow: [
      { id: 'build', kind: 'start', text: ['d[i] = a[i] − a[i−1]  for every i', '对每个 i：d[i] = a[i] − a[i−1]'] },
      { id: 'more', kind: 'test', text: ['another operation (l, r, v) ?', '还有操作 (l, r, v) ？'], no: 'restore', on: [] },
      { id: 'addl', text: ['d[l] += v', 'd[l] += v'] },
      { id: 'addr', text: ['d[r + 1] −= v', 'd[r + 1] −= v'], next: 'more' },
      { id: 'restore', kind: 'end', text: ['a[i] = a[i−1] + d[i];  print a', 'a[i] = a[i−1] + d[i]；输出 a'] },
    ],
  },

  hanoi: {
    story: [
      { kind: 'naive', title: ['Start simple: try it by hand', '先从最简单的做起：动手试试'],
        body: ['With three disks you can puzzle it out in seven moves. With ten disks the same trial and error is hopeless: the shortest solution has **1023 moves**, and one wrong move sends you in circles. You need a plan, not a search.', '三个盘子时，摸索一下，七步就能完成。十个盘子时再这样试就没希望了：最短的解法也要 **1023 步**，走错一步就会原地打转。我们需要的是一个计划，而不是瞎试。'],
        fig: () => [grid('start: everything on A', [[1, '', ''], [2, '', ''], [3, '', '']], gt({ cmp: [[0, 0], [1, 0]], act: [[2, 0]] }), { cols: ['A', 'B', 'C'], sq: true })] },
      { kind: 'insight', title: ['The largest disk dictates the plan', '最大的盘子决定了整个计划'],
        body: ['The largest disk has to reach C at some point. It can only move when ==nothing is on top of it and C is empty== — that is, when all n − 1 smaller disks sit together on the spare peg B. So the plan is forced: clear the way, move the big one, bring the others back on top.', '最大的盘子迟早要移到 C。它能移动的条件是==它上面没有盘子，而且 C 是空的==——也就是说，其余 n − 1 个较小的盘子必须全都叠在辅助柱 B 上。所以计划别无选择：先让路，再移大盘，最后把其余的盘子搬回它上面。'],
        fig: () => [grid('the only moment disk 3 can move', [['', '', ''], ['', 1, ''], [3, 2, '']], gt({ act: [[2, 0]], cmp: [[1, 1], [2, 1]], ok: [[2, 2]] }), { cols: ['A', 'B', 'C'], sq: true })] },
      { kind: 'how', title: ['Two of the three steps are the same puzzle, one disk smaller', '三步里有两步，是少一个盘子的同一个问题'],
        body: ['Move n − 1 disks A → B, move the largest A → C, move n − 1 disks B → C. The first and last steps are ==the original problem with n − 1 disks== and the pegs renamed, so the function calls itself. You do not need to see how the smaller problem is solved — only __trust__ that the function does what it promises, and stop at n = 0, where there is nothing to do.', '把 n − 1 个盘子从 A 移到 B，把最大的盘子从 A 移到 C，再把 n − 1 个盘子从 B 移到 C。第一步和第三步就是==盘子数为 n − 1 的原问题==，只是柱子换了名字，所以函数调用它自己。你不需要看清小问题是怎么解决的——只要__相信__函数能完成它承诺的事，并在 n = 0（什么都不用做）时停下来。'],
        fig: () => [grid('hanoi(n, A, B, C)', [['hanoi(n − 1, A, C, B)', 'A → C', 'hanoi(n − 1, B, A, C)']], gt({ cmp: [[0, 0], [0, 2]], act: [[0, 1]] }), { cols: ['1: clear the way', '2: largest disk', '3: bring them back'] })] },
      { kind: 'result', title: ['The number of moves doubles with every disk', '每多一个盘子，步数就翻一倍'],
        body: ['T(n) = 2 · T(n − 1) + 1 = **2ⁿ − 1**. That is not a flaw of the program — no solution can be shorter. Exponential growth is the thing to remember: 20 disks take a million moves, 64 disks more than the age of the universe in seconds.', 'T(n) = 2 · T(n − 1) + 1 = **2ⁿ − 1**。这不是程序写得不好——任何解法都不可能更短。要记住的是指数增长有多快：20 个盘子要一百万步，64 个盘子所需的步数比宇宙年龄的秒数还多。'],
        fig: () => [grid('moves = 2ⁿ − 1', [[3, 10, 20, 64], [7, '1 023', '1 048 575', '≈ 1.8 × 10¹⁹']], gt({ ok: [[1, 0]], cmp: [[1, 1], [1, 2]], bad: [[1, 3]] }), { rows: ['n', 'moves'] })] },
    ],
    flow: [
      { id: 'call', kind: 'start', text: ['hanoi(n, from, via, to)', 'hanoi(n, from, via, to)'], on: [] },
      { id: 'base', kind: 'test', text: ['n = 0 ?', 'n = 0 ？'], yes: 'ret', on: [] },
      { id: 'first', text: ['hanoi(n − 1, from, to, via)', 'hanoi(n − 1, from, to, via)'] },
      { id: 'move', text: ['print  from → to', '输出 from → to'] },
      { id: 'second', text: ['hanoi(n − 1, via, from, to)', 'hanoi(n − 1, via, from, to)'] },
      { id: 'ret', kind: 'end', text: ['return', '返回'], on: [] },
    ],
  },

  'bignum-add': {
    story: [
      { kind: 'naive', title: ['Start simple: use a built-in integer', '先从最简单的做起：用内置整数类型'],
        body: ['`long long` holds numbers up to about 9 × 10¹⁸ — **19 digits**. One more digit and the value silently wraps around to nonsense. The numbers here have hundreds of thousands of digits; no built-in type comes close.', '`long long` 能表示的最大值约为 9 × 10¹⁸——也就是 **19 位**。再多一位，数值就会悄悄溢出，变成毫无意义的结果。而这里的数有几十万位，任何内置类型都远远不够。'],
        fig: () => [grid('how many digits fit?', [['≈ 2.1 × 10⁹', '≈ 9.2 × 10¹⁸', '10¹⁰⁰⁰⁰⁰'], [10, 19, '100 001']], gt({ ok: [[1, 0], [1, 1]], bad: [[1, 2]] }), { rows: ['largest value', 'digits'], cols: ['int', 'long long', 'needed here'] })] },
      { kind: 'insight', title: ['You already know the algorithm: column addition', '这个算法你早就会了：列竖式'],
        body: ['At school you add long numbers column by column, from the right, carrying 1 when a column reaches 10. That method never looks at the number as a whole — only at ==one digit of each number and a carry==. So store one decimal digit per array cell and let a loop do the columns.', '在学校里，长的数是一列一列加的：从右往左，满十进一。这个方法从不把整个数当作一个整体——每次只看==两个数各一位，再加一个进位==。所以让数组的每个格子存一位十进制数字，再用循环逐列处理。'],
        fig: () => [grid('6059 + 36', [['', 6, 0, 5, 9], ['+', '', '', 3, 6], ['', 6, 0, 9, 5]], gt({ cmp: [[0, 4], [1, 4]], ok: row(2, 1, 4) }))] },
      { kind: 'how', title: ['Store the digits backwards', '把数字倒着存'],
        body: ['Put the ones digit in cell 0. Then ==cell i of both numbers has the same weight 10ⁱ==, however long each number is, and a result that grows by a digit (99 + 1) simply gets one more cell __at the end__. Per column: `sum = a[i] + b[i] + carry`, write `sum % 10`, carry `sum / 10` — never more than 9 + 9 + 1 = 19, so the carry is 0 or 1.', '把个位放在第 0 格。这样无论两个数各有多长，==两个数的第 i 格权值都是 10ⁱ==；结果多出一位时（比如 99 + 1），只要__在末尾__再加一格。每一列：`sum = a[i] + b[i] + carry`，写下 `sum % 10`，进位为 `sum / 10`——和最多是 9 + 9 + 1 = 19，所以进位只能是 0 或 1。'],
        fig: () => [grid('6059 + 36, lowest digit first', [[9, 5, 0, 6], [6, 3, '', ''], [0, 1, 0, 0], [5, 9, 0, 6]], gt({ cmp: [[0, 0], [1, 0]], bad: [[2, 1]], ok: row(3, 0, 3) }), { rows: ['a', 'b', 'carry in', 'c'], cols: ['10⁰', '10¹', '10²', '10³'] })] },
      { kind: 'result', title: ['One pass, any length', '扫一遍，多长都行'],
        body: ['**O(n)** for n digits. The loop must keep going while a carry is left, or 99 + 1 prints 00. The same reversed layout carries over to high-precision subtraction, multiplication and division.', 'n 位数只需 **O(n)**。只要还有进位，循环就必须继续，否则 99 + 1 会输出 00。同样的倒序存储方式也适用于高精度减法、乘法和除法。'] },
    ],
    flow: [
      { id: 'rev', kind: 'start', text: ['store both numbers lowest digit first;  carry = 0', '两个数都按低位在前存放；carry = 0'] },
      { id: 'loop', kind: 'test', text: ['digits left, or carry > 0 ?', '还有数位，或 carry > 0 ？'], no: 'done', on: [] },
      { id: 'digit', text: ['sum = a[i] + b[i] + carry', 'sum = a[i] + b[i] + carry'] },
      { id: 'write', text: ['c[i] = sum mod 10;  carry = sum / 10;  i++', 'c[i] = sum mod 10；carry = sum / 10；i++'], next: 'loop', on: ['digit'] },
      { id: 'done', kind: 'end', text: ['print c from its last cell to its first', '从 c 的最后一格到第一格依次输出'] },
    ],
  },

  'bignum-mul': {
    story: [
      { kind: 'naive', title: ['Start with long multiplication on paper', '先看纸上的竖式乘法'],
        body: ['Multiply the first number by each digit of the second, write every partial product on its own row shifted one place further left, then add the rows. Correct — but as a program it needs a row per digit, a carry inside every row, and a multi-row addition at the end.', '用第二个数的每一位去乘第一个数，每个部分积单独写一行，并且逐行向左多错一位，最后把各行加起来。结果是对的——但写成程序，就要为每一位准备一行，每行内部要处理进位，最后还要做一次多行加法。'],
        fig: () => [grid('123 × 45', [['', '', 1, 2, 3], ['', '', '×', 4, 5], ['', '', 6, 1, 5], ['', 4, 9, 2, ''], ['', 5, 5, 3, 5]], gt({ cmp: row(2, 2, 4), alt: row(3, 1, 3), ok: row(4, 1, 4) }), { rows: ['a', 'b', 'a × 5', 'a × 4, shifted', 'sum'] })] },
      { kind: 'insight', title: ['Digit i times digit j belongs in cell i + j', '第 i 位乘第 j 位，结果属于第 i + j 格'],
        body: ['With the ones digit in cell 0, digit i of a is worth 10ⁱ and digit j of b is worth 10ʲ, so their product is worth ==10^(i+j)==. The shifting of the rows is nothing but this rule. So forget the rows: add every product `a[i] × b[j]` straight into `c[i + j]`.', '把个位放在第 0 格后，a 的第 i 位权值是 10ⁱ，b 的第 j 位权值是 10ʲ，所以它们的乘积权值是 ==10^(i+j)==。竖式里各行的错位，其实就是这条规则。所以不必再写那些行了：把每个乘积 `a[i] × b[j]` 直接加到 `c[i + j]` 上。'],
        fig: () => [grid('123 × 45: where each product goes', [['15 → c[0]', '12 → c[1]'], ['10 → c[1]', '8 → c[2]'], ['5 → c[2]', '4 → c[3]']], gt({ cmp: [[0, 1], [1, 0]], alt: [[1, 1], [2, 0]] }), { rows: ['a[0] = 3', 'a[1] = 2', 'a[2] = 1'], cols: ['b[0] = 5', 'b[1] = 4'] })] },
      { kind: 'how', title: ['Collect first, carry afterwards', '先全部累加，再统一进位'],
        body: ['While products pile up, a cell may hold 22 or 130 — that is fine, it is just a number. __One pass at the end__ turns every cell into a single digit: keep `c[i] % 10`, push `c[i] / 10` into the next cell. Then skip the leading zeros (but keep one digit, so that 0 prints as 0).', '乘积累加的过程中，一个格子里可能是 22，也可能是 130——没关系，它只是一个数。__最后扫一遍__，把每个格子都变成一位数字：保留 `c[i] % 10`，把 `c[i] / 10` 推到下一格。然后跳过前导零（但至少保留一位，这样 0 才会输出 0）。'],
        fig: () => [arr('c after collecting all products', [15, 22, 13, 4, 0], tn({ cmp: span(0, 3) })), arr('c after the carry pass — read backwards: 5535', [5, 3, 5, 5, 0], tn({ ok: span(0, 3), dim: 4 }))] },
      { kind: 'result', title: ['n × m small multiplications', 'n × m 次小乘法'],
        body: ['Every digit meets every digit once: **O(n · m)**, and the result has at most n + m digits. A cell never exceeds 81 × min(n, m), so `int` is safe for thousands of digits. Faster methods exist (FFT), but this one covers almost every contest problem.', '每一位都与对方的每一位相乘一次：**O(n · m)**，结果最多 n + m 位。一个格子的值不会超过 81 × min(n, m)，所以几千位以内用 `int` 是安全的。还有更快的方法（FFT），但这个方法已经能应付绝大多数竞赛题。'] },
    ],
    flow: [
      { id: 'init', kind: 'start', text: ['store both numbers lowest digit first;  c[] = 0', '两个数都按低位在前存放；c[] = 0'], on: [] },
      { id: 'acc', text: ['for every i and j:  c[i + j] += a[i] × b[j]', '对每一对 i、j：c[i + j] += a[i] × b[j]'] },
      { id: 'carry', text: ['for i upward:  c[i+1] += c[i] / 10;  c[i] = c[i] mod 10', 'i 从小到大：c[i+1] += c[i] / 10；c[i] = c[i] mod 10'] },
      { id: 'strip', text: ['skip leading zeros (keep one digit)', '跳过前导零（至少保留一位）'] },
      { id: 'end', kind: 'end', text: ['print c from the top digit down', '从最高位向下输出 c'], on: [] },
    ],
  },
}
