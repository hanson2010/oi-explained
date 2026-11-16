import type { Lesson, Rng, Tones } from '../../engine/types'
import { arr, graph, layoutBin, need, reader, span, tn, vars } from '../../engine/h'

const cpp = String.raw
const read = (inp: string) => { const rd = reader(inp), n = rd.int(); need(n >= 1, 'n must be at least 1.', 'n 至少为 1。'); return { n, a: rd.ints(n), ids: span(0, n - 1) } }
const bars = (a: number[], ids: number[], tone?: Tones, ptr?: Record<string, number>) => arr('a', a, tone, ptr, { bars: true, ids })
const gen = (n: number, r: Rng) => `${n}\n${r.ints(n, 1, n <= 40 ? 60 : 1000000).join(' ')}\n`
const fmtIn: Lesson['input'] = ['n, then n integers. Prints them in ascending order.', 'n，随后 n 个整数。按升序输出。']
const swap = (a: number[], i: number, j: number) => { const x = a[i]; a[i] = a[j]; a[j] = x }
const QUAD = [10, 100, 1000, 3000], NLOGN = [10, 100, 1000, 10000, 100000]

const bubble: Lesson = {
  id: 'bubble-sort', title: ['Bubble sort', '冒泡排序'], level: 'J', cat: 'sort', diff: 3,
  blurb: ['Swap out-of-order neighbours; each pass floats the largest remaining value to the end.', '交换逆序的相邻元素；每一趟都把剩余的最大值“冒”到末尾。'],
  ideas: [
    ['Compare neighbours a[j] and a[j+1]; swap them if they are in the wrong order.', '比较相邻的 a[j] 与 a[j+1]，顺序不对就交换。'],
    ['After pass i the i largest values are in their final places, so each pass is one shorter.', '第 i 趟结束后，最大的 i 个值已经就位，所以每趟少比较一次。'],
    ['A pass with no swap proves the array is sorted — stop early.', '如果某一趟没有发生交换，说明已经有序，可以提前结束。'],
    ['It is stable: equal values never jump over each other.', '它是稳定排序：相等的元素不会互相越过。'],
  ],
  time: 'O(n²)', space: 'O(1)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, a[5005];

int main() {
    scanf("%d", &n);
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    for (int i = 0; i < n - 1; i++) {
        bool swapped = false;
        for (int j = 0; j < n - 1 - i; j++) {
            if (a[j] > a[j + 1]) {  //@cmp
                swap(a[j], a[j + 1]);  //@swap
                swapped = true;
            }
        }
        if (!swapped) break;  //@early
    }
    for (int i = 0; i < n; i++) printf("%d ", a[i]);  //@done
}`,
  notes: [
    ['cmp', ['Strict > keeps equal elements in their original order (stability).', '用严格的 > 才能让相等元素保持原有顺序（稳定性）。']],
    ['swap', ['Each swap removes exactly one inversion.', '每次交换恰好消除一个逆序对。']],
    ['early', ['Best case O(n) on already sorted input.', '对已经有序的输入，最好情况为 O(n)。']],
  ],
  input: fmtIn, sizes: [6, 9, 12], lab: QUAD, gen,
  run(inp, t) {
    const { n, a, ids } = read(inp)
    for (let i = 0; i < n - 1; i++) {
      let swapped = false
      const done = span(n - i, n - 1)
      for (let j = 0; j < n - 1 - i; j++) {
        t.s('cmp', () => [[`Compare a[${j}] = ${a[j]} and a[${j + 1}] = ${a[j + 1]}.`, `比较 a[${j}] = ${a[j]} 与 a[${j + 1}] = ${a[j + 1]}。`], bars(a, ids, tn({ ok: done, cmp: [j, j + 1] }), { j }), vars({ pass: i + 1 })])
        if (a[j] > a[j + 1]) {
          swap(a, j, j + 1); swap(ids, j, j + 1); swapped = true
          t.s('swap', () => [[`${a[j + 1]} > ${a[j]}: swap them.`, `${a[j + 1]} > ${a[j]}：交换。`], bars(a, ids, tn({ ok: done, act: [j, j + 1] }), { j }), vars({ pass: i + 1 })])
        }
      }
      if (!swapped) {
        t.s('early', () => [['No swap in this pass: the array is sorted.', '这一趟没有交换：数组已经有序。'], bars(a, ids, tn({ ok: span(0, n - 1) }))])
        break
      }
    }
    t.s('done', () => [['Sorted.', '排序完成。'], bars(a, ids, tn({ ok: span(0, n - 1) }))])
    t.out(a.join(' '))
  },
}

const selection: Lesson = {
  id: 'selection-sort', title: ['Selection sort', '选择排序'], level: 'J', cat: 'sort', diff: 3,
  blurb: ['Repeatedly pick the smallest remaining value and put it next in line.', '反复从未排序部分选出最小值，放到已排序部分的末尾。'],
  ideas: [
    ['Split the array into a sorted prefix and an unsorted suffix.', '把数组分成已排序的前缀和未排序的后缀。'],
    ['Scan the suffix for its minimum, then swap it into position i.', '扫描后缀找到最小值，再把它交换到位置 i。'],
    ['Always n(n−1)/2 comparisons, but at most n − 1 swaps.', '比较次数恒为 n(n−1)/2，但交换至多 n − 1 次。'],
    ['Not stable: the long-distance swap can carry a value past its equals.', '不稳定：远距离交换可能让元素越过与它相等的元素。'],
  ],
  time: 'O(n²)', space: 'O(1)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, a[5005];

int main() {
    scanf("%d", &n);
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    for (int i = 0; i < n - 1; i++) {
        int k = i;  //@start
        for (int j = i + 1; j < n; j++)
            if (a[j] < a[k]) k = j;  //@scan
        swap(a[i], a[k]);  //@swap
    }
    for (int i = 0; i < n; i++) printf("%d ", a[i]);  //@done
}`,
  notes: [
    ['start', ['k remembers where the smallest value seen so far lives.', 'k 记录目前见到的最小值所在的位置。']],
    ['scan', ['Only the index is updated; no data moves during the scan.', '扫描过程中只更新下标，不移动数据。']],
    ['swap', ['One swap per round puts the minimum in its final place.', '每轮只交换一次，把最小值放到最终位置。']],
  ],
  input: fmtIn, sizes: [6, 9, 12], lab: QUAD, gen,
  run(inp, t) {
    const { n, a, ids } = read(inp)
    for (let i = 0; i < n - 1; i++) {
      let k = i
      const done = span(0, i - 1)
      t.s('start', () => [[`Round ${i + 1}: look for the minimum of a[${i}..${n - 1}].`, `第 ${i + 1} 轮：在 a[${i}..${n - 1}] 中找最小值。`], bars(a, ids, tn({ ok: done, act: k }), { i, k })])
      for (let j = i + 1; j < n; j++) {
        const better = a[j] < a[k]
        if (better) k = j
        t.s('scan', () => [better ? [`a[${j}] = ${a[j]} is smaller: k = ${j}.`, `a[${j}] = ${a[j]} 更小：k = ${j}。`] : [`a[${j}] = ${a[j]} is not smaller than a[${k}] = ${a[k]}.`, `a[${j}] = ${a[j]} 不比 a[${k}] = ${a[k]} 小。`], bars(a, ids, tn({ ok: done, cmp: j, act: k }), { i, j, k })])
      }
      swap(a, i, k); swap(ids, i, k)
      t.s('swap', () => [[`Swap the minimum ${a[i]} into position ${i}.`, `把最小值 ${a[i]} 交换到位置 ${i}。`], bars(a, ids, tn({ ok: span(0, i) }), { i })])
    }
    t.s('done', () => [['Sorted.', '排序完成。'], bars(a, ids, tn({ ok: span(0, n - 1) }))])
    t.out(a.join(' '))
  },
}

const insertion: Lesson = {
  id: 'insertion-sort', title: ['Insertion sort', '插入排序'], level: 'J', cat: 'sort', diff: 3,
  blurb: ['Grow a sorted prefix by sliding each new value left into its place — like sorting cards in your hand.', '像整理手里的扑克牌一样，把每个新元素向左插入到已排序前缀中的合适位置。'],
  ideas: [
    ['a[0..i−1] is already sorted; take x = a[i] out.', 'a[0..i−1] 已经有序；取出 x = a[i]。'],
    ['Shift every element larger than x one step right, then drop x into the gap.', '把所有比 x 大的元素右移一格，再把 x 放进空位。'],
    ['The work equals the number of inversions, so nearly sorted input is nearly O(n).', '工作量等于逆序对数，所以对基本有序的数据接近 O(n)。'],
  ],
  time: 'O(n²)', space: 'O(1)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, a[5005];

int main() {
    scanf("%d", &n);
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    for (int i = 1; i < n; i++) {
        int x = a[i], j = i - 1;  //@take
        while (j >= 0 && a[j] > x) {
            a[j + 1] = a[j];  //@shift
            j--;
        }
        a[j + 1] = x;  //@put
    }
    for (int i = 0; i < n; i++) printf("%d ", a[i]);  //@done
}`,
  notes: [
    ['take', ['Save a[i] first — the shifts below overwrite its cell.', '先把 a[i] 存起来——下面的移动会覆盖它的位置。']],
    ['shift', ['Check j ≥ 0 before a[j]: the order of the two conditions matters.', '先判断 j ≥ 0 再访问 a[j]：两个条件的顺序不能颠倒。']],
    ['put', ['j stopped at the last element ≤ x, so x belongs right after it.', 'j 停在最后一个 ≤ x 的元素处，x 应放在它后面。']],
  ],
  input: fmtIn, sizes: [6, 9, 12], lab: QUAD, gen,
  run(inp, t) {
    const { n, a, ids } = read(inp)
    for (let i = 1; i < n; i++) {
      const x = a[i], xid = ids[i]
      let j = i - 1
      t.s('take', () => [[`Take x = a[${i}] = ${x}; a[0..${i - 1}] is sorted.`, `取出 x = a[${i}] = ${x}；a[0..${i - 1}] 已有序。`], bars(a, ids, tn({ ok: span(0, i - 1), act: i }), { i }), vars({ x })])
      while (j >= 0 && a[j] > x) {
        // Swapping x leftward is equivalent to shifting and keeps the animation continuous.
        a[j + 1] = a[j]; ids[j + 1] = ids[j]; a[j] = x; ids[j] = xid
        t.s('shift', () => [[`${a[j + 1]} > ${x}: shift it right.`, `${a[j + 1]} > ${x}：右移一格。`], bars(a, ids, tn({ ok: span(0, i), cmp: j + 1, act: j }), { j }), vars({ x })])
        j--
      }
      t.s('put', () => [[`x = ${x} settles at position ${j + 1}.`, `x = ${x} 落在位置 ${j + 1}。`], bars(a, ids, tn({ ok: span(0, i), act: j + 1 })), vars({ x })])
    }
    t.s('done', () => [['Sorted.', '排序完成。'], bars(a, ids, tn({ ok: span(0, n - 1) }))])
    t.out(a.join(' '))
  },
}

const counting: Lesson = {
  id: 'counting-sort', title: ['Counting sort', '计数排序'], level: 'J', cat: 'sort', diff: 3,
  blurb: ['Count how often each value occurs, then write the values back in order — no comparisons at all.', '统计每个值出现的次数，再按顺序写回——完全不需要比较。'],
  ideas: [
    ['When values lie in a small range [0, k], use the value itself as an array index.', '当值域是较小的 [0, k] 时，直接把值当作数组下标。'],
    ['cnt[v] = how many times v appears.', 'cnt[v] = v 出现的次数。'],
    ['Walk v from 0 to k and output v exactly cnt[v] times.', 'v 从 0 到 k 依次输出 cnt[v] 次。'],
    ['O(n + k) beats the O(n log n) comparison bound, but only while k stays small.', 'O(n + k) 突破了比较排序的 O(n log n) 下界，但前提是 k 不大。'],
  ],
  time: 'O(n + k)', space: 'O(k)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, k, cnt[1000005];

int main() {
    scanf("%d%d", &n, &k);
    for (int i = 0; i < n; i++) {
        int x; scanf("%d", &x);
        cnt[x]++;  //@count
    }
    for (int v = 0; v <= k; v++)
        while (cnt[v]--) printf("%d ", v);  //@emit
}`,
  notes: [
    ['count', ['The input does not even need to be stored — only the tallies.', '甚至不需要保存输入，只保存计数即可。']],
    ['emit', ['Total work of the two nested loops is n + k, not n · k.', '两层循环的总工作量是 n + k，而不是 n · k。']],
  ],
  input: ['n k, then n integers in [0, k].', 'n k，随后 n 个 [0, k] 范围内的整数。'],
  sizes: [8, 12, 18], lab: [10, 1000, 100000, 500000],
  gen: (n, r) => { const k = n <= 40 ? 9 : 1000; return `${n} ${k}\n${r.ints(n, 0, k).join(' ')}\n` },
  run(inp, t) {
    const rd = reader(inp), n = rd.int(), k = rd.int()
    need(k >= 0 && k <= 2e6, 'k must be between 0 and 2,000,000.', 'k 须在 0 到 2,000,000 之间。')
    const a = rd.ints(n), cnt = new Array<number>(k + 1).fill(0), out: number[] = []
    a.forEach((x, i) => {
      need(Number.isInteger(x) && x >= 0 && x <= k, 'Values must be integers in [0, k].', '数值须为 [0, k] 内的整数。')
      cnt[x]++
      t.s('count', () => [[`a[${i}] = ${x}: cnt[${x}] becomes ${cnt[x]}.`, `a[${i}] = ${x}：cnt[${x}] 变为 ${cnt[x]}。`], arr('a', a, tn({ dim: span(0, i - 1), act: i })), arr('cnt', cnt, tn({ act: x }))])
    })
    for (let v = 0; v <= k; v++) while (cnt[v] > 0) {
      cnt[v]--; out.push(v)
      t.s('emit', () => [[`Output ${v}; ${cnt[v]} more of it left.`, `输出 ${v}；它还剩 ${cnt[v]} 个。`], arr('cnt', cnt, tn({ act: v, dim: span(0, v - 1) })), arr('output', out, tn({ ok: out.length - 1 }))])
    }
    t.out(out.join(' '))
  },
}

const merge: Lesson = {
  id: 'merge-sort', title: ['Merge sort', '归并排序'], level: 'S', cat: 'sort', diff: 5,
  blurb: ['Divide and conquer: sort each half recursively, then merge two sorted halves in linear time.', '分治：递归地排好左右两半，再用线性时间把两个有序段合并。'],
  ideas: [
    ['Divide: split [l, r] at the middle. Conquer: sort both halves. Combine: merge.', '分：在中点把 [l, r] 切开。治：分别排好两半。合：归并。'],
    ['Merging two sorted runs needs only two pointers: repeatedly take the smaller front element.', '合并两个有序段只需两个指针：不断取两段队首中较小的那个。'],
    ['There are log n levels and each level merges n elements in total → O(n log n), always.', '共 log n 层，每层总共合并 n 个元素 → 任何情况下都是 O(n log n)。'],
    ['Taking from the left on ties (≤) makes it stable. Counting how many left elements remain when the right one is taken counts inversions.', '相等时先取左边（≤）保证稳定。取右边元素时左段剩余的个数，累加起来就是逆序对数。'],
  ],
  time: 'O(n log n)', space: 'O(n)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, a[1000005], tmp[1000005];

void msort(int l, int r) {
    if (l >= r) return;
    int mid = (l + r) / 2;  //@split
    msort(l, mid);
    msort(mid + 1, r);
    int i = l, j = mid + 1, k = l;
    while (i <= mid && j <= r)
        tmp[k++] = a[i] <= a[j] ? a[i++] : a[j++];  //@take
    while (i <= mid) tmp[k++] = a[i++];  //@rest
    while (j <= r) tmp[k++] = a[j++];
    for (k = l; k <= r; k++) a[k] = tmp[k];  //@copy
}

int main() {
    scanf("%d", &n);
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    msort(0, n - 1);
    for (int i = 0; i < n; i++) printf("%d ", a[i]);
}`,
  notes: [
    ['split', ['A range of one element is sorted by definition — the base case above.', '只有一个元素的区间天然有序——这就是上面的递归边界。']],
    ['take', ['≤ (not <) keeps equal elements in order: the left one goes first.', '用 ≤（而不是 <）让相等元素保持顺序：左边的先走。']],
    ['rest', ['One run is exhausted; the remainder of the other is already sorted.', '一段取完后，另一段剩下的部分本来就有序，直接接上。']],
    ['copy', ['The merge cannot be done in place, hence the auxiliary array.', '归并无法原地完成，所以需要辅助数组。']],
  ],
  input: fmtIn, sizes: [6, 8, 12], lab: NLOGN, gen,
  run(inp, t) {
    const { n, a } = read(inp), tmp = new Array<number>(n).fill(0)
    const blank = (l: number, k: number, r: number) => tmp.map((x, i) => (i >= l && i < k ? x : '')).slice(0, Math.max(r + 1, n))
    const go = (l: number, r: number) => {
      if (l >= r) return
      const mid = (l + r) >> 1
      t.s('split', () => [[`Split [${l}, ${r}] into [${l}, ${mid}] and [${mid + 1}, ${r}].`, `把 [${l}, ${r}] 分成 [${l}, ${mid}] 和 [${mid + 1}, ${r}]。`], arr('a', a, tn({ dim: [...span(0, l - 1), ...span(r + 1, n - 1)], cmp: span(l, mid), alt: span(mid + 1, r) }), { l, mid, r })])
      go(l, mid); go(mid + 1, r)
      let i = l, j = mid + 1, k = l
      const view = (pick?: number) => [
        arr('a', a, tn({ dim: [...span(0, l - 1), ...span(r + 1, n - 1), ...span(l, i - 1), ...span(mid + 1, j - 1)], cmp: span(i, mid), alt: span(j, r), ...(pick === undefined ? {} : { act: pick }) }), { i, j }),
        arr('tmp', blank(l, k, r), tn({ ok: span(l, k - 1) })),
      ] as const
      while (i <= mid && j <= r) {
        const left = a[i] <= a[j], pick = left ? i : j
        tmp[k] = a[pick]
        t.s('take', () => [[`${a[i]} ${left ? '≤' : '>'} ${a[j]}: take ${a[pick]} from the ${left ? 'left' : 'right'} run.`, `${a[i]} ${left ? '≤' : '>'} ${a[j]}：从${left ? '左' : '右'}段取出 ${a[pick]}。`], ...view(pick)])
        if (left) i++; else j++
        k++
      }
      while (i <= mid || j <= r) {
        const pick = i <= mid ? i : j
        tmp[k] = a[pick]
        t.s('rest', () => [[`One run is empty: append ${a[pick]}.`, `有一段已取完：直接接上 ${a[pick]}。`], ...view(pick)])
        if (i <= mid) i++; else j++
        k++
      }
      for (k = l; k <= r; k++) a[k] = tmp[k]
      t.s('copy', () => [[`Copy back: a[${l}..${r}] is now sorted.`, `拷贝回原数组：a[${l}..${r}] 已有序。`], arr('a', a, tn({ dim: [...span(0, l - 1), ...span(r + 1, n - 1)], ok: span(l, r) }))])
    }
    go(0, n - 1)
    t.out(a.join(' '))
  },
}

const quick: Lesson = {
  id: 'quick-sort', title: ['Quicksort', '快速排序'], level: 'S', cat: 'sort', diff: 5,
  blurb: ['Pick a pivot, sweep two pointers inward to partition around it, and recurse on both sides.', '选一个基准，用两个指针向中间扫描完成划分，再递归处理两侧。'],
  ideas: [
    ['Partition: afterwards everything on the left is ≤ pivot and everything on the right is ≥ pivot.', '划分：结束后左侧元素都 ≤ 基准，右侧元素都 ≥ 基准。'],
    ['i walks right past values < pivot, j walks left past values > pivot; when both stop, swap.', 'i 向右跳过 < 基准的值，j 向左跳过 > 基准的值；两者都停下时交换。'],
    ['The work is done before recursing (merge sort does it after).', '工作在递归之前完成（归并排序则是在递归之后）。'],
    ['Average O(n log n); a bad pivot gives O(n²). Taking the middle (or a random) element avoids the sorted-input trap.', '平均 O(n log n)；基准选得差会退化到 O(n²)。取中间（或随机）元素可以避开有序数据的陷阱。'],
  ],
  time: 'O(n log n) avg', space: 'O(log n)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, a[1000005];

void qsort(int l, int r) {
    int i = l, j = r, p = a[(l + r) / 2];  //@pivot
    while (i <= j) {
        while (a[i] < p) i++;  //@left
        while (a[j] > p) j--;  //@right
        if (i <= j) {
            swap(a[i], a[j]);  //@swap
            i++; j--;
        }
    }
    if (l < j) qsort(l, j);  //@rec
    if (i < r) qsort(i, r);
}

int main() {
    scanf("%d", &n);
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    qsort(0, n - 1);
    for (int i = 0; i < n; i++) printf("%d ", a[i]);  //@done
}`,
  notes: [
    ['pivot', ['Copy the pivot value: the element itself will move during partitioning.', '要保存基准的值：划分过程中这个元素本身会被移动。']],
    ['left', ['Strict < guarantees the scan stops at the pivot at the latest, so i never runs off the range.', '严格的 < 保证扫描最迟在基准处停下，i 不会越界。']],
    ['swap', ['Both pointers then step past the swapped pair.', '交换后两个指针都越过这对元素。']],
    ['rec', ['After the loop j < i: the parts are [l, j] and [i, r].', '循环结束后 j < i：两部分是 [l, j] 和 [i, r]。']],
  ],
  input: fmtIn, sizes: [7, 9, 12], lab: NLOGN, gen,
  run(inp, t) {
    const { n, a, ids } = read(inp)
    const fixed = new Set<number>()
    const go = (l: number, r: number) => {
      let i = l, j = r
      const p = a[(l + r) >> 1]
      const tone = (extra: Tones = {}) => ({ ...tn({ dim: [...span(0, l - 1), ...span(r + 1, n - 1)], ok: [...fixed] }), ...extra })
      t.s('pivot', () => [[`Partition [${l}, ${r}] around pivot ${p}.`, `以基准 ${p} 划分区间 [${l}, ${r}]。`], bars(a, ids, tone({ [(l + r) >> 1]: 'alt' }), { i, j }), vars({ pivot: p })])
      while (i <= j) {
        while (a[i] < p) { i++; t.s('left', () => [[`a[${i - 1}] < ${p}: move i right.`, `a[${i - 1}] < ${p}：i 右移。`], bars(a, ids, tone({ [i]: 'cmp', [j]: 'cmp' }), { i, j }), vars({ pivot: p })]) }
        while (a[j] > p) { j--; t.s('right', () => [[`a[${j + 1}] > ${p}: move j left.`, `a[${j + 1}] > ${p}：j 左移。`], bars(a, ids, tone({ [i]: 'cmp', [j]: 'cmp' }), { i, j }), vars({ pivot: p })]) }
        if (i <= j) {
          swap(a, i, j); swap(ids, i, j)
          t.s('swap', () => [[i === j ? `i = j = ${i}: nothing to swap, step past it.` : `Swap a[${i}] and a[${j}], then step both pointers.`, i === j ? `i = j = ${i}：无需交换，直接越过。` : `交换 a[${i}] 与 a[${j}]，两个指针各走一步。`], bars(a, ids, tone({ [i]: 'act', [j]: 'act' }), { i, j }), vars({ pivot: p })])
          i++; j--
        }
      }
      for (let k = j + 1; k < i; k++) fixed.add(k)
      if (l >= j) fixed.add(l)
      if (i >= r) fixed.add(r)
      t.s('rec', () => [[`Done: [${l}, ${j}] ≤ ${p} ≤ [${i}, ${r}]. Recurse on each side.`, `划分完成：[${l}, ${j}] ≤ ${p} ≤ [${i}, ${r}]。分别递归两侧。`], bars(a, ids, tone(tn({ cmp: span(l, j), alt: span(i, r) }))), vars({ pivot: p })])
      if (l < j) go(l, j)
      if (i < r) go(i, r)
    }
    go(0, n - 1)
    t.s('done', () => [['Sorted.', '排序完成。'], bars(a, ids, tn({ ok: span(0, n - 1) }))])
    t.out(a.join(' '))
  },
}

const heap: Lesson = {
  id: 'heap-sort', title: ['Binary heap & heap sort', '二叉堆与堆排序'], level: 'S', cat: 'sort', diff: 6,
  blurb: ['A complete binary tree stored in an array, where every parent ≥ its children. Pop the maximum n times to sort.', '用数组存储的完全二叉树，每个父结点都 ≥ 子结点。连续取出 n 次最大值即完成排序。'],
  ideas: [
    ['Array as tree: the children of node i are 2i and 2i + 1, its parent is i / 2 (1-based).', '数组即树：结点 i 的孩子是 2i 和 2i + 1，父亲是 i / 2（下标从 1 开始）。'],
    ['Sift-down: if a node is smaller than its larger child, swap with it and continue below.', '下沉：若结点小于较大的孩子，就与之交换并继续向下。'],
    ['Build the heap bottom-up from n / 2 down to 1 — O(n) in total.', '从 n / 2 到 1 自底向上建堆——总共只需 O(n)。'],
    ['Then swap the root (maximum) with the last element, shrink the heap, sift the new root down.', '然后把堆顶（最大值）与末尾交换，堆大小减一，再让新的堆顶下沉。'],
    ['The same heap is what priority_queue uses: push and pop in O(log n).', 'priority_queue 用的就是这种堆：插入和弹出都是 O(log n)。'],
  ],
  time: 'O(n log n)', space: 'O(1)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, a[1000005];

void down(int i, int size) {
    while (2 * i <= size) {
        int c = 2 * i;
        if (c < size && a[c + 1] > a[c]) c++;  //@child
        if (a[i] >= a[c]) break;  //@stop
        swap(a[i], a[c]);  //@swap
        i = c;
    }
}

int main() {
    scanf("%d", &n);
    for (int i = 1; i <= n; i++) scanf("%d", &a[i]);
    for (int i = n / 2; i >= 1; i--) down(i, n);  //@build
    for (int size = n; size > 1; size--) {
        swap(a[1], a[size]);  //@extract
        down(1, size - 1);
    }
    for (int i = 1; i <= n; i++) printf("%d ", a[i]);  //@done
}`,
  notes: [
    ['child', ['Pick the larger child, so that after the swap the new parent dominates both.', '选较大的孩子，这样交换后新的父结点比两个孩子都大。']],
    ['stop', ['Heap property restored at i — and everything below was already a heap.', 'i 处已满足堆性质——它下面的部分原本就是堆。']],
    ['build', ['Nodes after n / 2 are leaves, already heaps of size one.', 'n / 2 之后的结点都是叶子，本身就是大小为 1 的堆。']],
    ['extract', ['The maximum moves to its final position at the end of the array.', '最大值被放到数组末尾，即它的最终位置。']],
  ],
  input: fmtIn, sizes: [6, 9, 12], lab: NLOGN, gen,
  run(inp, t) {
    const rd = reader(inp), n = rd.int(), a = [0, ...rd.ints(n)]
    const pos = t.on ? layoutBin(1, i => (2 * i <= n ? 2 * i : -1), i => (2 * i + 1 <= n ? 2 * i + 1 : -1)) : []
    const es = span(2, n).map(i => ({ u: i >> 1, v: i }))
    let size = n
    const view = (tone: Tones) => {
      const all = { ...tn({ ok: span(size + 1, n), dim: 0 }), ...tone }
      return [graph(pos, es, { label: a, tone: all, et: Object.fromEntries(es.map((e, k) => [k, e.v > size ? 'dim' as const : undefined])) }), arr('a (1-based)', a, all)] as const
    }
    const down = (i: number) => {
      while (2 * i <= size) {
        let c = 2 * i
        if (c < size && a[c + 1] > a[c]) c++
        const ii = i, cc = c
        t.s('child', () => [[`Node ${ii} (${a[ii]}): its larger child is node ${cc} (${a[cc]}).`, `结点 ${ii}（${a[ii]}）：较大的孩子是结点 ${cc}（${a[cc]}）。`], ...view(tn({ act: ii, cmp: cc }))])
        if (a[i] >= a[c]) { t.s('stop', () => [[`${a[ii]} ≥ ${a[cc]}: the heap property holds, stop.`, `${a[ii]} ≥ ${a[cc]}：满足堆性质，停止。`], ...view(tn({ ok: ii }))]); break }
        swap(a, i, c)
        t.s('swap', () => [[`${a[cc]} < ${a[ii]}: swap, continue from node ${cc}.`, `${a[cc]} < ${a[ii]}：交换，并从结点 ${cc} 继续。`], ...view(tn({ act: cc, cmp: ii }))])
        i = c
      }
    }
    for (let i = n >> 1; i >= 1; i--) { t.s('build', () => [[`Build: sift node ${i} down.`, `建堆：让结点 ${i} 下沉。`], ...view(tn({ act: i }))]); down(i) }
    for (; size > 1;) {
      swap(a, 1, size)
      const s = size--
      t.s('extract', () => [[`Move the maximum ${a[s]} to position ${s}; the heap shrinks to ${s - 1}.`, `把最大值 ${a[s]} 放到位置 ${s}；堆缩小为 ${s - 1}。`], ...view(tn({ act: 1 }))])
      down(1)
    }
    size = 0
    t.s('done', () => [['Sorted.', '排序完成。'], ...view({})])
    t.out(a.slice(1).join(' '))
  },
}

const radix: Lesson = {
  id: 'radix-sort', title: ['Bucket & radix sort', '桶排序与基数排序'], level: 'S', cat: 'sort', diff: 6,
  blurb: ['Sort by one digit at a time — ones, tens, hundreds — using ten buckets and a stable pass per digit.', '每次只按一位数字排序——个位、十位、百位——每一位用十个桶做一趟稳定排序。'],
  ideas: [
    ['Bucket sort: drop each number into the bucket of its key, then read the buckets in order.', '桶排序：把每个数放进其关键字对应的桶，再按桶的顺序读出。'],
    ['Radix sort repeats that for every digit, from the least significant upward.', '基数排序对每一位重复这个过程，从最低位开始。'],
    ['It works only because each pass is stable: ties on the current digit keep the order earned from lower digits.', '它之所以正确，是因为每一趟都稳定：当前位相同的数，保持由低位排出的顺序。'],
    ['Prefix sums of the bucket sizes tell where each bucket ends; filling from the back keeps stability.', '对桶的大小求前缀和，就知道每个桶的结束位置；从后往前填保证稳定。'],
  ],
  time: 'O(d · (n + 10))', space: 'O(n)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, a[1000005], b[1000005];

int main() {
    scanf("%d", &n);
    int mx = 0;
    for (int i = 0; i < n; i++) scanf("%d", &a[i]), mx = max(mx, a[i]);
    for (long long e = 1; mx / e > 0; e *= 10) {
        int cnt[10] = {0};
        for (int i = 0; i < n; i++) cnt[a[i] / e % 10]++;  //@count
        for (int d = 1; d < 10; d++) cnt[d] += cnt[d - 1];  //@prefix
        for (int i = n - 1; i >= 0; i--) b[--cnt[a[i] / e % 10]] = a[i];  //@place
        for (int i = 0; i < n; i++) a[i] = b[i];  //@copy
    }
    for (int i = 0; i < n; i++) printf("%d ", a[i]);
}`,
  notes: [
    ['count', ['a[i] / e % 10 extracts the digit worth e.', 'a[i] / e % 10 取出权值为 e 的那一位。']],
    ['prefix', ['Now cnt[d] is one past the last slot of bucket d.', '此时 cnt[d] 是桶 d 最后一个位置的后一位。']],
    ['place', ['Going backwards puts later elements in later slots — exactly what stability requires.', '从后往前处理，使靠后的元素进入靠后的位置——正是稳定性所要求的。']],
  ],
  input: ['n, then n non-negative integers.', 'n，随后 n 个非负整数。'],
  sizes: [6, 8, 10], lab: [10, 1000, 100000, 300000],
  gen: (n, r) => `${n}\n${r.ints(n, 0, n <= 40 ? 999 : 999999).join(' ')}\n`,
  run(inp, t) {
    const { n, a } = read(inp), b = new Array<number>(n).fill(0)
    for (const x of a) need(Number.isInteger(x) && x >= 0, 'Values must be non-negative integers.', '数值须为非负整数。')
    const mx = Math.max(...a.slice(0, 1), a.reduce((m, x) => Math.max(m, x), 0))
    for (let e = 1; Math.floor(mx / e) > 0; e *= 10) {
      const cnt = new Array<number>(10).fill(0), dg = (x: number) => Math.floor(x / e) % 10
      const shown = () => a.map(x => String(x).padStart(String(mx).length, '0'))
      for (let i = 0; i < n; i++) {
        cnt[dg(a[i])]++
        t.s('count', () => [[`Digit of ${a[i]} at place ${e} is ${dg(a[i])}: bucket ${dg(a[i])} now holds ${cnt[dg(a[i])]}.`, `${a[i]} 在 ${e} 位上的数字是 ${dg(a[i])}：桶 ${dg(a[i])} 现有 ${cnt[dg(a[i])]} 个。`], arr('a', shown(), tn({ act: i })), arr('cnt (bucket sizes)', cnt, tn({ act: dg(a[i]) })), vars({ place: e })])
      }
      for (let d = 1; d < 10; d++) cnt[d] += cnt[d - 1]
      t.s('prefix', () => [['Prefix sums: cnt[d] = where bucket d ends.', '求前缀和：cnt[d] = 桶 d 的结束位置。'], arr('a', shown()), arr('cnt (bucket ends)', cnt, tn({ cmp: span(0, 9) })), vars({ place: e })])
      const filled = new Set<number>()
      for (let i = n - 1; i >= 0; i--) {
        const p = --cnt[dg(a[i])]
        b[p] = a[i]; filled.add(p)
        t.s('place', () => [[`${a[i]} (digit ${dg(a[i])}) goes to slot ${p}.`, `${a[i]}（数字 ${dg(a[i])}）放到位置 ${p}。`], arr('a', shown(), tn({ act: i, dim: span(i + 1, n - 1) })), arr('cnt (bucket ends)', cnt, tn({ act: dg(a[i]) })), arr('b', b.map((x, k) => (filled.has(k) ? x : '')), tn({ ok: [...filled], act: p })), vars({ place: e })])
      }
      for (let i = 0; i < n; i++) a[i] = b[i]
      t.s('copy', () => [[`Sorted by the last ${String(e).length} digit(s).`, `已按最低 ${String(e).length} 位排好序。`], arr('a', a, tn({ ok: span(0, n - 1) })), vars({ place: e })])
    }
    t.out(a.join(' '))
  },
}

export default [bubble, selection, insertion, counting, merge, quick, heap, radix]
