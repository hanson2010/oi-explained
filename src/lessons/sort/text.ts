import type { L } from '../../engine/types'
import type { Prose } from '../extras'

/** The problem each lesson solves, why the method works, and common mistakes. */
export const TEXT: Record<string, Prose> = {
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
}

/** Where each problem shows up outside contests, shown on the Problem tab. Same inline markup as the Ideas story. */
export const REAL: Record<string, L> = {
  'bubble-sort': ['Children lining up **by height** in a PE class: neighbours compare and swap places until nobody has to move. Too slow for big data, but it is how many people would sort by instinct, and it is the easiest sort to prove correct.', '体育课上按**身高**排队：相邻两个人比一比、换一换，直到没有人需要动。它对大数据太慢，却是很多人凭直觉会用的排法，也是最容易证明正确的排序。'],
  'selection-sort': ['Picking a team: choose the best remaining player, then the next best, and so on. It makes the **fewest swaps** of any simple sort, which matters when moving an item is expensive — think of rearranging heavy boxes on a shelf.', '选队员：先挑剩下的人里最好的，再挑次好的，依此类推。它是简单排序中**交换次数最少**的，当移动一件东西代价很高时就有意义——比如重新摆放货架上的重箱子。'],
  'insertion-sort': ['Sorting a **hand of playing cards**: pick up one card at a time and slide it into place among the cards already in order. Standard libraries switch to insertion sort for short or nearly sorted pieces because nothing beats it there.', '整理**手里的扑克牌**：每次拿起一张，插到已经排好的牌中合适的位置。标准库在数据很短或几乎有序时会切换到插入排序，因为这种情况下没有比它更快的。'],
  'counting-sort': ['Ranking a million **exam scores** between 0 and 100: nobody compares students pairwise — you count how many got each score. Histograms of pixel brightness in a photo editor are built the same way.', '给一百万个 0 到 100 分的**考试成绩**排名：没有人会两两比较考生——只要数出每个分数有多少人。修图软件里的亮度直方图也是这样统计出来的。'],
  'merge-sort': ['Sorting a file **larger than memory**: sort chunks that fit, then merge the sorted chunks — this is how databases sort on disk. Python\'s and Java\'s built-in sorts are merge sorts at heart, chosen because equal items keep their order.', '对**比内存还大**的文件排序：先把能装下的小块分别排好，再把有序的块归并起来——数据库在磁盘上排序就是这样做的。Python 和 Java 的内置排序本质上都是归并排序，选它是因为相等的元素能保持原有顺序。'],
  'quick-sort': ['C++ `std::sort` starts as a quicksort: on average it is the **fastest general-purpose sort** on real hardware. Its partition step alone answers "what is the median salary?" without sorting everything (`nth_element`).', 'C++ 的 `std::sort` 以快速排序为主体：平均而言它是真实硬件上**最快的通用排序**。单是它的“划分”一步，就能在不完全排序的情况下回答“工资的中位数是多少”（`nth_element`）。'],
  'heap-sort': ['A hospital **emergency room** always treats the most urgent patient next, while new patients keep arriving. An operating system picks the next task to run, and a game server the next timed event, from exactly this structure.', '医院**急诊室**总是先处理最紧急的病人，同时不断有新病人到来。操作系统挑选下一个要运行的任务、游戏服务器挑选下一个定时事件，用的正是这种结构。'],
  'radix-sort': ['Old **punched-card machines** sorted census cards one column at a time — radix sort is older than the electronic computer. Today it sorts phone numbers, postcodes and IP addresses, where keys are short and of fixed length.', '早期的**穿孔卡片机**一次按一列给人口普查卡片排序——基数排序比电子计算机还古老。今天它用来排电话号码、邮政编码和 IP 地址这类短而定长的键。'],
}
