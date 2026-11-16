import type { GEdge, Lesson, Rng, Tone, Tones } from '../../engine/types'
import { arr, genTree, graph, grid, gt, Heap, layoutTree, need, parentsOf, reader, span, tn, vars, type E, type P } from '../../engine/h'

const cpp = String.raw
const rndNum = (digits: number, r: Rng) => Number(String(r.int(1, 9)) + Array.from({ length: digits - 1 }, () => r.int(0, 9)).join(''))

const gcd: Lesson = {
  id: 'gcd', title: ['Euclidean algorithm', '辗转相除法（欧几里得算法）'], level: 'J', cat: 'math', diff: 3,
  blurb: ['gcd(a, b) = gcd(b, a mod b): replace the pair by a smaller one until the remainder is zero.', 'gcd(a, b) = gcd(b, a mod b)：不断把这一对数换成更小的一对，直到余数为零。'],
  ideas: [
    ['Any common divisor of a and b also divides a − b, and therefore a mod b — so the set of common divisors does not change.', 'a 和 b 的任何公约数也整除 a − b，进而整除 a mod b——所以公约数的集合保持不变。'],
    ['Hence gcd(a, b) = gcd(b, a mod b), and gcd(a, 0) = a.', '因此 gcd(a, b) = gcd(b, a mod b)，且 gcd(a, 0) = a。'],
    ['Every two steps the larger number at least halves, so it takes O(log min(a, b)) steps.', '每两步较大的数至少减半，所以只需 O(log min(a, b)) 步。'],
    ['lcm(a, b) = a / gcd(a, b) × b — divide first to avoid overflow.', 'lcm(a, b) = a / gcd(a, b) × b——先除后乘，避免溢出。'],
  ],
  time: 'O(log min(a, b))', space: 'O(1)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int main() {
    long long a, b;
    scanf("%lld%lld", &a, &b);
    while (b) {
        long long r = a % b;  //@mod
        a = b; b = r;
    }
    printf("%lld\n", a);  //@done
}`,
  notes: [
    ['mod', ['If a < b the first step simply swaps them, since a mod b = a.', '如果 a < b，第一步相当于交换两数，因为 a mod b = a。']],
    ['done', ['When b reaches 0, a holds the greatest common divisor.', 'b 变为 0 时，a 就是最大公约数。']],
  ],
  input: ['Two non-negative integers a b. Prints gcd(a, b). (In the generator, n is the number of decimal digits.)', '两个非负整数 a b。输出 gcd(a, b)。（生成器中 n 表示十进制位数。）'],
  sizes: [2, 3, 5], lab: [3, 6, 9, 12, 15],
  gen: (n, r) => { const g = n >= 3 ? r.int(2, 9) : 1, d = Math.min(n, 15) - (g > 1 ? 1 : 0); return `${rndNum(d, r) * g} ${rndNum(Math.max(1, d - r.int(0, 1)), r) * g}\n` },
  run(inp, t) {
    const rd = reader(inp)
    let a = rd.int(), b = rd.int()
    need(Number.isSafeInteger(a) && Number.isSafeInteger(b) && a >= 0 && b >= 0, 'Expected two non-negative integers below 2^53.', '需要两个小于 2^53 的非负整数。')
    const rows: (string | number)[][] = []
    while (b) {
      const r = a % b
      rows.push([a, b, Math.floor(a / b), r])
      t.s('mod', () => [[`${a} = ${Math.floor(a / b)} × ${b} + ${r}, so gcd(${a}, ${b}) = gcd(${b}, ${r}).`, `${a} = ${Math.floor(a / b)} × ${b} + ${r}，所以 gcd(${a}, ${b}) = gcd(${b}, ${r})。`], grid('steps', rows, gt({ act: [[rows.length - 1, 3]] }), { cols: ['a', 'b', 'a / b', 'a mod b'] })])
      a = b; b = r
    }
    t.s('done', () => [[`The remainder is 0: the gcd is ${a}.`, `余数为 0：最大公约数是 ${a}。`], grid('steps', rows.length ? rows : [[a, 0, '', '']], rows.length ? gt({ ok: [[rows.length - 1, 1]] }) : {}, { cols: ['a', 'b', 'a / b', 'a mod b'] }), vars({ gcd: a })])
    t.out(a)
  },
}

const exgcd: Lesson = {
  id: 'exgcd', title: ['Extended Euclid & Bézout', '扩展欧几里得算法与裴蜀定理'], level: 'S', cat: 'math', diff: 7,
  blurb: ['While Euclid\'s algorithm unwinds, carry coefficients back up to get x and y with a·x + b·y = gcd(a, b).', '在欧几里得算法回溯的过程中，把系数一路带回来，得到满足 a·x + b·y = gcd(a, b) 的 x 和 y。'],
  ideas: [
    ['Bézout: a·x + b·y = c has integer solutions exactly when gcd(a, b) divides c.', '裴蜀定理：a·x + b·y = c 有整数解，当且仅当 gcd(a, b) 整除 c。'],
    ['Base case b = 0: a·1 + 0·0 = a, so x = 1, y = 0.', '边界 b = 0：a·1 + 0·0 = a，所以 x = 1，y = 0。'],
    ['Suppose b·x′ + (a mod b)·y′ = g is solved. Substitute a mod b = a − ⌊a/b⌋·b and regroup.', '假设已解出 b·x′ + (a mod b)·y′ = g。代入 a mod b = a − ⌊a/b⌋·b 并整理。'],
    ['This gives x = y′ and y = x′ − ⌊a/b⌋·y′.', '于是得到 x = y′，y = x′ − ⌊a/b⌋·y′。'],
    ['Modular inverse: if gcd(a, m) = 1, then a·x + m·y = 1 means x is the inverse of a modulo m.', '模逆元：若 gcd(a, m) = 1，则由 a·x + m·y = 1 可知 x 就是 a 在模 m 意义下的逆元。'],
  ],
  time: 'O(log min(a, b))', space: 'O(log min(a, b))',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

long long exgcd(long long a, long long b, long long &x, long long &y) {
    if (!b) { x = 1; y = 0; return a; }  //@base
    long long g = exgcd(b, a % b, y, x);  //@down
    y -= a / b * x;  //@up
    return g;
}

int main() {
    long long a, b, x, y;
    scanf("%lld%lld", &a, &b);
    long long g = exgcd(a, b, x, y);
    printf("%lld %lld %lld\n", x, y, g);  //@done
}`,
  notes: [
    ['base', ['gcd(a, 0) = a = a·1 + 0·0.', 'gcd(a, 0) = a = a·1 + 0·0。']],
    ['down', ['Passing (y, x) swapped means the callee writes x′ into y and y′ into x — that already performs x = y′.', '把 (y, x) 交换着传进去，被调用者就把 x′ 写进 y、把 y′ 写进 x——这已经完成了 x = y′。']],
    ['up', ['y currently holds x′, and x holds y′: y = x′ − ⌊a/b⌋·y′.', '此时 y 中是 x′，x 中是 y′：y = x′ − ⌊a/b⌋·y′。']],
  ],
  input: ['Two positive integers a b. Prints x, y and g with a·x + b·y = g = gcd(a, b). (n is the number of decimal digits.)', '两个正整数 a b。输出满足 a·x + b·y = g = gcd(a, b) 的 x、y 和 g。（n 表示十进制位数。）'],
  sizes: [2, 3, 4], lab: [2, 4, 6, 8, 9],
  gen: (n, r) => `${rndNum(Math.min(n, 9), r)} ${rndNum(Math.max(1, Math.min(n, 9) - r.int(0, 1)), r)}\n`,
  run(inp, t) {
    const rd = reader(inp), a0 = rd.int(), b0 = rd.int()
    need(Number.isInteger(a0) && Number.isInteger(b0) && a0 >= 0 && b0 >= 0 && a0 <= 1e9 && b0 <= 1e9, 'Expected two integers between 0 and 10^9.', '需要两个 0 到 10^9 之间的整数。')
    const rows: (string | number)[][] = []
    const view = (hi: Record<string, Tone>) => grid('one row per recursive call', rows, hi, { cols: ['a', 'b', 'a / b', 'x', 'y'] })
    let a = a0, b = b0
    while (b) {
      rows.push([a, b, Math.floor(a / b), '', ''])
      t.s('down', () => [[`exgcd(${a}, ${b}) calls exgcd(${b}, ${a % b}).`, `exgcd(${a}, ${b}) 调用 exgcd(${b}, ${a % b})。`], view(gt({ act: [[rows.length - 1, 0], [rows.length - 1, 1]] }))])
      ;[a, b] = [b, a % b]
    }
    const g = a
    let x = 1, y = 0
    rows.push([a, 0, '', 1, 0])
    t.s('base', () => [[`b = 0: gcd = ${g}, with x = 1, y = 0 (${g}·1 + 0·0 = ${g}).`, `b = 0：gcd = ${g}，取 x = 1，y = 0（${g}·1 + 0·0 = ${g}）。`], view(gt({ ok: [[rows.length - 1, 3], [rows.length - 1, 4]] }))])
    for (let k = rows.length - 2; k >= 0; k--) {
      const q = rows[k][2] as number, px = x, py = y
      x = py; y = px - q * py
      rows[k][3] = x; rows[k][4] = y
      t.s('up', () => [[`Back in exgcd(${rows[k][0]}, ${rows[k][1]}): x = y′ = ${py}, y = x′ − ${q}·y′ = ${px} − ${q}·${py} = ${y}. Check: ${rows[k][0]}·(${x}) + ${rows[k][1]}·(${y}) = ${g}.`, `回到 exgcd(${rows[k][0]}, ${rows[k][1]})：x = y′ = ${py}，y = x′ − ${q}·y′ = ${px} − ${q}·${py} = ${y}。验证：${rows[k][0]}·(${x}) + ${rows[k][1]}·(${y}) = ${g}。`], view(gt({ cmp: [[k + 1, 3], [k + 1, 4]], act: [[k, 3], [k, 4]] }))])
    }
    t.s('done', () => [[`${a0}·(${x}) + ${b0}·(${y}) = ${g}.`, `${a0}·(${x}) + ${b0}·(${y}) = ${g}。`], view(gt({ ok: [[0, 3], [0, 4]] })), vars({ x, y, gcd: g })])
    t.out(`${x} ${y} ${g}`)
  },
}

const numGrid = (n: number, tone: (i: number) => Tone | undefined, name: string) => {
  const cells: (number | string)[][] = [], tones: Record<string, Tone> = {}
  for (let i = 1; i <= n; i++) {
    const r = Math.floor((i - 1) / 10), c = (i - 1) % 10
    ;(cells[r] ??= new Array<number | string>(10).fill(''))[c] = i
    const x = tone(i)
    if (x) tones[r + ',' + c] = x
  }
  return grid(name, cells, tones, { sq: true })
}

const sieve: Lesson = {
  id: 'sieve', title: ['Sieve of Eratosthenes', '埃氏筛法'], level: 'J', cat: 'math', diff: 4,
  blurb: ['Walk upward from 2; every number still standing is prime, and its multiples are crossed out.', '从 2 开始往上走；每个还没被划掉的数都是素数，然后划掉它的所有倍数。'],
  ideas: [
    ['A composite number has a prime factor smaller than itself, so it gets crossed out before we reach it.', '合数一定有比它小的素因子，所以在走到它之前就已经被划掉了。'],
    ['Therefore a number that is still unmarked when we arrive must be prime.', '因此，走到某个数时它还没被标记，它就一定是素数。'],
    ['Start crossing at i²: smaller multiples k·i with k < i were already removed by a smaller prime factor of k.', '从 i² 开始划：更小的倍数 k·i（k < i）已经被 k 的某个更小的素因子划掉了。'],
    ['Total work is n/2 + n/3 + n/5 + … = O(n log log n) — nearly linear.', '总工作量是 n/2 + n/3 + n/5 + … = O(n log log n)——几乎是线性的。'],
  ],
  time: 'O(n log log n)', space: 'O(n)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, cnt;
bool comp[10000005];

int main() {
    scanf("%d", &n);
    for (int i = 2; i <= n; i++) {
        if (comp[i]) continue;
        cnt++;  //@prime
        for (long long j = 1LL * i * i; j <= n; j += i)
            comp[j] = true;  //@cross
    }
    printf("%d\n", cnt);  //@done
}`,
  notes: [
    ['prime', ['Not crossed out by any smaller prime, so it is prime.', '没有被任何更小的素数划掉，所以它是素数。']],
    ['cross', ['1LL * i * i avoids int overflow when i is large.', '1LL * i * i 避免 i 较大时 int 溢出。']],
  ],
  input: ['n — prints the number of primes ≤ n.', 'n —— 输出不超过 n 的素数个数。'],
  sizes: [30, 50, 100], lab: [100, 10000, 1000000, 3000000],
  gen: n => `${n}\n`,
  run(inp, t) {
    const n = reader(inp).int()
    need(n >= 1 && n <= 2e7, 'n must be between 1 and 20,000,000.', 'n 须在 1 到 20,000,000 之间。')
    const comp = new Uint8Array(n + 1), isP = new Uint8Array(n + 1)
    let cnt = 0
    const view = (hi: Tones) => numGrid(n, i => hi[i] ?? (i === 1 ? 'dim' : comp[i] ? 'dim' : isP[i] ? 'ok' : undefined), 'green = prime, faded = crossed out')
    for (let i = 2; i <= n; i++) {
      if (comp[i]) continue
      cnt++; isP[i] = 1
      t.s('prime', () => [[`${i} was never crossed out: it is prime.${i * i > n ? '' : ` Cross out its multiples from ${i}² = ${i * i}.`}`, `${i} 没有被划掉：它是素数。${i * i > n ? '' : `从 ${i}² = ${i * i} 开始划掉它的倍数。`}`], view({ [i]: 'act' }), vars({ primes: cnt })])
      for (let j = i * i; j <= n; j += i) {
        const again = comp[j] === 1
        comp[j] = 1
        t.s('cross', () => [[`${j} = ${j / i} × ${i}: cross it out${again ? ' (already crossed by a smaller prime).' : '.'}`, `${j} = ${j / i} × ${i}：划掉${again ? '（已被更小的素数划过）。' : '。'}`], view({ [i]: 'act', [j]: again ? 'cmp' : 'bad' }), vars({ primes: cnt })])
      }
    }
    t.s('done', () => [[`${cnt} prime(s) up to ${n}.`, `不超过 ${n} 的素数共 ${cnt} 个。`], view({}), vars({ primes: cnt })])
    t.out(cnt)
  },
}

const linearSieve: Lesson = {
  id: 'linear-sieve', title: ['Linear sieve (Euler)', '线性筛法（欧拉筛）'], level: 'J', cat: 'math', diff: 4,
  blurb: ['Arrange for every composite to be crossed out exactly once — by its smallest prime factor — and the sieve becomes truly linear.', '让每个合数只被划掉一次——由它的最小素因子负责——筛法就真正成为线性的。'],
  ideas: [
    ['The Eratosthenes sieve crosses a number like 30 several times (by 2, 3 and 5).', '埃氏筛会把 30 这样的数划掉好几次（被 2、3、5 各划一次）。'],
    ['For each i, cross out i × p for the primes p found so far, smallest first.', '对每个 i，按从小到大的顺序，用已找到的素数 p 划掉 i × p。'],
    ['Stop as soon as p divides i: for any larger prime q, the smallest prime factor of i × q is p, not q.', '一旦 p 整除 i 就停止：对更大的素数 q，i × q 的最小素因子是 p 而不是 q。'],
    ['So each composite m is crossed exactly once, when i = m / (smallest prime factor of m).', '于是每个合数 m 恰好被划一次，发生在 i = m / (m 的最小素因子) 的时候。'],
    ['The same loop can compute multiplicative functions such as Euler\'s φ along the way.', '同一个循环还能顺便求出欧拉函数 φ 等积性函数。'],
  ],
  time: 'O(n)', space: 'O(n)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, cnt, prime[1000005];
bool comp[10000005];

int main() {
    scanf("%d", &n);
    for (int i = 2; i <= n; i++) {
        if (!comp[i]) prime[cnt++] = i;  //@prime
        for (int k = 0; k < cnt && 1LL * i * prime[k] <= n; k++) {
            comp[i * prime[k]] = true;  //@cross
            if (i % prime[k] == 0) break;  //@stop
        }
    }
    printf("%d\n", cnt);  //@done
}`,
  notes: [
    ['prime', ['Unmarked on arrival means prime, exactly as before.', '走到时未被标记就是素数，与埃氏筛相同。']],
    ['cross', ['prime[k] is the smallest prime factor of i × prime[k] as long as we have not passed the break.', '只要还没有执行到 break，prime[k] 就是 i × prime[k] 的最小素因子。']],
    ['stop', ['The key line: without it the sieve is still correct but no longer linear.', '关键的一行：去掉它筛法仍然正确，但不再是线性的。']],
  ],
  input: ['n — prints the number of primes ≤ n.', 'n —— 输出不超过 n 的素数个数。'],
  sizes: [20, 30, 50], lab: [100, 10000, 1000000, 3000000],
  gen: n => `${n}\n`,
  run(inp, t) {
    const n = reader(inp).int()
    need(n >= 1 && n <= 2e7, 'n must be between 1 and 20,000,000.', 'n 须在 1 到 20,000,000 之间。')
    const comp = new Uint8Array(n + 1), prime: number[] = []
    const view = (hi: Tones) => [numGrid(n, i => hi[i] ?? (i === 1 || comp[i] ? 'dim' : prime.includes(i) ? 'ok' : undefined), 'green = prime, faded = crossed out'), arr('primes', prime.slice(0, 20))] as const
    for (let i = 2; i <= n; i++) {
      if (!comp[i]) { prime.push(i); t.s('prime', () => [[`${i} is unmarked: prime.`, `${i} 未被标记：是素数。`], ...view({ [i]: 'act' })]) }
      for (let k = 0; k < prime.length && i * prime[k] <= n; k++) {
        const p = prime[k]
        comp[i * p] = 1
        t.s('cross', () => [[`i = ${i}: cross out ${i} × ${p} = ${i * p} (smallest prime factor ${p}).`, `i = ${i}：划掉 ${i} × ${p} = ${i * p}（最小素因子为 ${p}）。`], ...view({ [i]: 'act', [p]: 'cmp', [i * p]: 'bad' })])
        if (i % p === 0) {
          t.s('stop', () => [[`${p} divides ${i}: stop — larger primes would not be the smallest factor.`, `${p} 整除 ${i}：停止——更大的素数不会是最小素因子。`], ...view({ [i]: 'act', [p]: 'cmp' })])
          break
        }
      }
    }
    t.s('done', () => [[`${prime.length} prime(s) up to ${n}; every composite was crossed out exactly once.`, `不超过 ${n} 的素数共 ${prime.length} 个；每个合数恰好被划掉一次。`], ...view({})])
    t.out(prime.length)
  },
}

const MOD = 1000000007
const pascal: Lesson = {
  id: 'pascal', title: ["Pascal's triangle & combinations", '杨辉三角与组合数'], level: 'J', cat: 'math', diff: 4,
  blurb: ['C(n, k) = C(n−1, k−1) + C(n−1, k): build every binomial coefficient by adding the two numbers above it.', 'C(n, k) = C(n−1, k−1) + C(n−1, k)：每个组合数都是它上方两个数之和。'],
  ideas: [
    ['C(n, k) counts the ways to choose k of n items.', 'C(n, k) 表示从 n 个物品中选 k 个的方案数。'],
    ['Look at the last item: either it is chosen (C(n−1, k−1) ways) or not (C(n−1, k) ways). Rule of sum.', '考虑最后一个物品：要么选它（C(n−1, k−1) 种），要么不选（C(n−1, k) 种）。由加法原理相加。'],
    ['The edges are C(n, 0) = C(n, n) = 1.', '边界是 C(n, 0) = C(n, n) = 1。'],
    ['This is a recurrence (递推): each row is computed from the row above — no division, so it works under any modulus.', '这是一个递推：每一行都由上一行算出——不涉及除法，所以对任意模数都适用。'],
    ['Row n also gives the coefficients of (a + b)ⁿ — the binomial theorem.', '第 n 行同时也是 (a + b)ⁿ 展开式的系数——二项式定理。'],
  ],
  time: 'O(n²)', space: 'O(n²)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

const int MOD = 1e9 + 7;
int n, c[2005][2005];

int main() {
    scanf("%d", &n);
    for (int i = 0; i <= n; i++) {
        c[i][0] = 1;  //@edge
        for (int j = 1; j <= i; j++)
            c[i][j] = (c[i - 1][j - 1] + c[i - 1][j]) % MOD;  //@add
    }
    for (int j = 0; j <= n; j++) printf("%d ", c[n][j]);  //@done
}`,
  notes: [
    ['edge', ['Exactly one way to choose nothing.', '什么都不选只有一种方案。']],
    ['add', ['c[i−1][i] is 0, so the right edge C(i, i) = 1 needs no special case.', 'c[i−1][i] 为 0，所以右边界 C(i, i) = 1 无需特判。']],
  ],
  input: ['n — prints row n of the triangle, C(n, 0) … C(n, n), modulo 1 000 000 007.', 'n —— 输出杨辉三角第 n 行 C(n, 0) … C(n, n)，对 1 000 000 007 取模。'],
  sizes: [5, 6, 8], lab: [10, 100, 1000, 2000],
  gen: n => `${n}\n`,
  run(inp, t) {
    const n = reader(inp).int()
    need(n >= 0 && n <= 3000, 'n must be between 0 and 3000.', 'n 须在 0 到 3000 之间。')
    const c = Array.from({ length: n + 1 }, (_, i) => new Int32Array(i + 2))
    const view = (i: number, j: number, tone: Record<string, Tone>) => grid('c[i][j] = C(i, j)', c.map((row, x) => span(0, n).map(y => (y <= x && (x < i || (x === i && y <= j)) ? row[y] : ''))), tone, { rows: span(0, n).map(x => 'i=' + x), cols: span(0, n).map(x => 'j=' + x) })
    for (let i = 0; i <= n; i++) {
      c[i][0] = 1
      t.s('edge', () => [[`C(${i}, 0) = 1.`, `C(${i}, 0) = 1。`], view(i, 0, gt({ ok: [[i, 0]] }))])
      for (let j = 1; j <= i; j++) {
        c[i][j] = (c[i - 1][j - 1] + c[i - 1][j]) % MOD
        t.s('add', () => [[`C(${i}, ${j}) = C(${i - 1}, ${j - 1}) + C(${i - 1}, ${j}) = ${c[i - 1][j - 1]} + ${c[i - 1][j]} = ${c[i][j]}.`, `C(${i}, ${j}) = C(${i - 1}, ${j - 1}) + C(${i - 1}, ${j}) = ${c[i - 1][j - 1]} + ${c[i - 1][j]} = ${c[i][j]}。`], view(i, j, gt({ cmp: [[i - 1, j - 1], [i - 1, j]], act: [[i, j]] }))])
      }
    }
    t.s('done', () => [[`Row ${n} is complete.`, `第 ${n} 行计算完毕。`], view(n, n, gt({ ok: span(0, n).map(j => [n, j] as [number, number]) }))])
    t.out(Array.from(c[n].subarray(0, n + 1)).join(' '))
  },
}

const fmt = (x: number) => { const s = (Math.abs(x) < 5e-10 ? 0 : x).toFixed(2); return s.replace(/\.?0+$/, '') || '0' }
const gauss: Lesson = {
  id: 'gauss', title: ['Gaussian elimination', '高斯消元法'], level: 'S', cat: 'math', diff: 7,
  blurb: ['Solve n linear equations by row operations: make each column zero everywhere except on the diagonal.', '用初等行变换解 n 元线性方程组：让每一列除了对角线之外全部变成 0。'],
  ideas: [
    ['Write the system as an augmented matrix [A | b]. Three row operations never change the solutions: swap rows, scale a row, add a multiple of one row to another.', '把方程组写成增广矩阵 [A | b]。三种行变换不改变解：交换两行、某行乘以非零常数、把一行的倍数加到另一行。'],
    ['For each column pick a pivot row, normalise it to 1, and subtract it from every other row to clear the column.', '对每一列选一个主元行，把主元化为 1，再用它把其他行在这一列上消成 0。'],
    ['Choose the row with the largest absolute value as pivot: dividing by a tiny number magnifies rounding error.', '选绝对值最大的一行作为主元：除以很小的数会放大舍入误差。'],
    ['If a column has no non-zero pivot, the system has no unique solution.', '如果某一列找不到非零主元，方程组就没有唯一解。'],
    ['Afterwards the matrix is the identity and the last column is the answer (Gauss–Jordan).', '消元结束后左边是单位阵，最后一列就是答案（高斯–约旦消元）。'],
  ],
  time: 'O(n³)', space: 'O(n²)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n;
double a[205][205];

int main() {
    scanf("%d", &n);
    for (int i = 0; i < n; i++)
        for (int j = 0; j <= n; j++) scanf("%lf", &a[i][j]);
    for (int c = 0; c < n; c++) {
        int p = c;
        for (int i = c + 1; i < n; i++)
            if (fabs(a[i][c]) > fabs(a[p][c])) p = i;
        if (fabs(a[p][c]) < 1e-9) { puts("No Solution"); return 0; }  //@none
        swap(a[c], a[p]);  //@pivot
        for (int j = n; j >= c; j--) a[c][j] /= a[c][c];  //@norm
        for (int i = 0; i < n; i++) {
            if (i == c) continue;
            for (int j = n; j >= c; j--) a[i][j] -= a[i][c] * a[c][j];  //@elim
        }
    }
    for (int i = 0; i < n; i++) printf("%.2f\n", a[i][n]);  //@done
}`,
  notes: [
    ['none', ['Compare with a small epsilon, never with == 0, when working in floating point.', '浮点数运算中要与一个很小的 eps 比较，绝不能用 == 0。']],
    ['pivot', ['Partial pivoting: bring the largest candidate into the pivot position.', '列主元：把绝对值最大的候选换到主元位置。']],
    ['norm', ['j runs downward so that a[c][c] itself is divided last.', 'j 从大到小循环，这样 a[c][c] 自己最后才被除。']],
    ['elim', ['Again j runs downward so the multiplier a[i][c] stays intact until the end.', '同样 j 从大到小，保证乘数 a[i][c] 到最后才被改掉。']],
  ],
  input: ['n, then n rows of n + 1 numbers: the coefficients and the right-hand side. Prints the solution to 2 decimals, or "No Solution".', 'n，随后 n 行各 n + 1 个数：系数和等号右边的常数。输出保留两位小数的解，或 “No Solution”。'],
  sizes: [2, 3, 4], lab: [10, 50, 100, 200],
  gen(n, r) {
    const x = r.ints(n, -5, 5), rows: string[] = []
    for (let i = 0; i < n; i++) { const a = r.ints(n, -9, 9); rows.push([...a, a.reduce((s, v, j) => s + v * x[j], 0)].join(' ')) }
    return `${n}\n${rows.join('\n')}\n`
  },
  run(inp, t) {
    const rd = reader(inp), n = rd.int()
    need(n >= 1 && n <= 300, 'n must be between 1 and 300.', 'n 须在 1 到 300 之间。')
    const a = Array.from({ length: n }, () => rd.ints(n + 1))
    const cols = [...span(1, n).map(i => 'x' + i), '= b']
    const view = (tone: Record<string, Tone>) => grid('augmented matrix [A | b]', a.map(r => r.map(fmt)), tone, { cols })
    const row = (i: number) => span(0, n).map(j => [i, j] as [number, number])
    for (let c = 0; c < n; c++) {
      let p = c
      for (let i = c + 1; i < n; i++) if (Math.abs(a[i][c]) > Math.abs(a[p][c])) p = i
      if (Math.abs(a[p][c]) < 1e-9) { t.s('none', () => [[`Column ${c + 1} has no non-zero pivot: no unique solution.`, `第 ${c + 1} 列找不到非零主元：没有唯一解。`], view(gt({ bad: span(c, n - 1).map(i => [i, c] as [number, number]) }))]); t.out('No Solution'); return }
      ;[a[c], a[p]] = [a[p], a[c]]
      t.s('pivot', () => [[p === c ? `Column ${c + 1}: row ${c + 1} already holds the largest pivot ${fmt(a[c][c])}.` : `Column ${c + 1}: the largest pivot ${fmt(a[c][c])} is in row ${p + 1} — swap rows ${c + 1} and ${p + 1}.`, p === c ? `第 ${c + 1} 列：第 ${c + 1} 行的主元 ${fmt(a[c][c])} 已是最大。` : `第 ${c + 1} 列：最大的主元 ${fmt(a[c][c])} 在第 ${p + 1} 行——交换第 ${c + 1} 行和第 ${p + 1} 行。`], view({ ...gt({ cmp: row(p) }), ...gt({ vis: row(c), act: [[c, c]] }) })])
      const d = a[c][c]
      for (let j = n; j >= c; j--) a[c][j] /= d
      t.s('norm', () => [[`Divide row ${c + 1} by ${fmt(d)} so the pivot becomes 1.`, `第 ${c + 1} 行除以 ${fmt(d)}，使主元变为 1。`], view(gt({ vis: row(c), ok: [[c, c]] }))])
      for (let i = 0; i < n; i++) {
        if (i === c) continue
        const k = a[i][c]
        for (let j = n; j >= c; j--) a[i][j] -= k * a[c][j]
        t.s('elim', () => [[`Row ${i + 1} −= ${fmt(k)} × row ${c + 1}: the entry in column ${c + 1} becomes 0.`, `第 ${i + 1} 行 −= ${fmt(k)} × 第 ${c + 1} 行：第 ${c + 1} 列的元素变为 0。`], view({ ...gt({ vis: row(c), cmp: row(i) }), ...gt({ ok: [[c, c]], act: [[i, c]] }) })])
      }
    }
    t.s('done', () => [['The left part is the identity: the last column is the solution.', '左边已是单位阵：最后一列就是解。'], view(gt({ ok: span(0, n - 1).map(i => [i, n] as [number, number]) }))])
    t.out(a.map(r => r[n].toFixed(2)).join('\n'))
  },
}

const nimSg: Lesson = {
  id: 'nim-sg', title: ['Nim & the SG function', 'Nim 博弈与 SG 函数'], level: 'N', cat: 'math', diff: 9,
  blurb: ['Give every position a Grundy number by mex; a sum of independent games is lost for the player to move exactly when the XOR is 0.', '用 mex 给每个局面算出 SG 值；若干独立游戏之和，先手必败当且仅当各 SG 值的异或为 0。'],
  ideas: [
    ['Impartial game: both players have the same moves, and whoever cannot move loses.', '公平组合游戏：双方可走的着法相同，无法行动的一方输。'],
    ['SG(x) = mex of the SG values of all positions reachable from x, where mex is the smallest non-negative integer not present.', 'SG(x) = 从 x 能到达的所有局面的 SG 值的 mex，其中 mex 是没有出现的最小非负整数。'],
    ['SG(x) = 0 means every move leads to a non-zero position: the player to move loses.', 'SG(x) = 0 表示每一步都走到非零局面：先手必败。'],
    ['Sprague–Grundy theorem: several independent games played together behave like one Nim pile each, of size SG.', 'Sprague–Grundy 定理：若干独立游戏同时进行，每个游戏相当于一堆大小为其 SG 值的 Nim 石子。'],
    ['So XOR all the SG values: non-zero ⇒ the first player wins. Classic Nim is the case SG(x) = x.', '于是把所有 SG 值异或起来：非零 ⇒ 先手必胜。经典 Nim 就是 SG(x) = x 的情形。'],
  ],
  time: 'O(max · m + piles)', space: 'O(max)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int m, k, mv[105], pile[100005], sg[1000005];

int main() {
    scanf("%d", &m);
    for (int i = 0; i < m; i++) scanf("%d", &mv[i]);
    scanf("%d", &k);
    int mx = 0;
    for (int i = 0; i < k; i++) scanf("%d", &pile[i]), mx = max(mx, pile[i]);
    for (int x = 1; x <= mx; x++) {
        bool seen[128] = {false};
        for (int i = 0; i < m; i++)
            if (x >= mv[i]) seen[sg[x - mv[i]]] = true;
        while (seen[sg[x]]) sg[x]++;  //@mex
    }
    int res = 0;
    for (int i = 0; i < k; i++) res ^= sg[pile[i]];  //@xor
    puts(res ? "First" : "Second");  //@done
}`,
  notes: [
    ['mex', ['With m moves at most m values are reachable, so the mex is at most m — the seen[] array stays tiny.', '只有 m 种着法时最多能到达 m 个值，所以 mex 至多为 m——seen[] 数组很小。']],
    ['xor', ['Each pile is an independent game; XOR combines them.', '每一堆是一个独立的游戏；用异或把它们合起来。']],
    ['done', ['Non-zero XOR: the first player can always move to a zero position.', '异或非零：先手总能走到一个异或为 0 的局面。']],
  ],
  input: ['m and the m allowed numbers of stones to take; then k and the k pile sizes. Players alternate taking an allowed number from one pile; whoever cannot move loses. Prints First or Second. (n is the largest pile.)', 'm 以及每次允许取走的 m 种石子数；然后是 k 以及 k 堆石子的数量。双方轮流从某一堆取走允许的数量；无法行动者输。输出 First 或 Second。（n 为最大的一堆。）'],
  sizes: [6, 9, 12], lab: [10, 1000, 100000, 500000],
  gen: (n, r) => { const mv = r.pick([[1, 2], [1, 3], [1, 3, 4], [2, 3], [1, 2, 3]]); return `${mv.length}\n${mv.join(' ')}\n3\n${n} ${r.int(1, n)} ${r.int(1, n)}\n` },
  run(inp, t) {
    const rd = reader(inp), m = rd.int(), mv = rd.ints(m), k = rd.int(), pile = rd.ints(k)
    need(m >= 1 && m <= 100 && mv.every(x => Number.isInteger(x) && x >= 1), 'Give between 1 and 100 positive moves.', '需要 1 到 100 个正整数着法。')
    need(pile.every(x => Number.isInteger(x) && x >= 0 && x <= 2e6), 'Pile sizes must be between 0 and 2,000,000.', '每堆石子数须在 0 到 2,000,000 之间。')
    const mx = pile.reduce((a, b) => Math.max(a, b), 0), sg = new Int32Array(mx + 1), seen = new Uint8Array(m + 2)
    for (let x = 1; x <= mx; x++) {
      seen.fill(0)
      const from: number[] = []
      for (const d of mv) if (x >= d) { seen[sg[x - d]] = 1; from.push(x - d) }
      while (seen[sg[x]]) sg[x]++
      t.s('mex', () => [[from.length ? `x = ${x}: reachable ${from.map(y => `${y} (SG ${sg[y]})`).join(', ')} → mex = ${sg[x]}.` : `x = ${x}: no move possible → SG = 0.`, from.length ? `x = ${x}：能到达 ${from.map(y => `${y}（SG ${sg[y]}）`).join('、')} → mex = ${sg[x]}。` : `x = ${x}：无法行动 → SG = 0。`], arr('SG(x)', Array.from(sg.subarray(0, Math.min(mx, 40) + 1), (v, i) => (i <= x ? v : '')), tn({ cmp: from, act: x })), vars({ moves: mv.join(', ') })])
    }
    let res = 0
    pile.forEach((p, i) => {
      const before = res
      res ^= sg[p]
      t.s('xor', () => [[`Pile ${i + 1} has ${p} stones: SG = ${sg[p]}; ${before} xor ${sg[p]} = ${res}.`, `第 ${i + 1} 堆有 ${p} 个石子：SG = ${sg[p]}；${before} xor ${sg[p]} = ${res}。`], arr('piles', pile, tn({ dim: span(0, i - 1), act: i })), arr('SG of each pile', pile.map(x => sg[x]), tn({ dim: span(0, i - 1), act: i })), vars({ xor: res })])
    })
    t.s('done', () => [res ? [`XOR = ${res} ≠ 0: the first player wins.`, `异或 = ${res} ≠ 0：先手必胜。`] : ['XOR = 0: the second player wins.', '异或 = 0：后手必胜。'], arr('piles', pile), arr('SG of each pile', pile.map(x => sg[x])), vars({ xor: res })])
    t.out(res ? 'First' : 'Second')
  },
}

const hull: Lesson = {
  id: 'convex-hull', title: ['Convex hull (Andrew)', '二维凸包（Andrew 算法）'], level: 'N', cat: 'math', diff: 8,
  blurb: ['Sort the points, then sweep twice keeping a stack that only ever turns left — the cross product tells left from right.', '把点排序后扫描两遍，维护一个始终“向左拐”的栈——用叉积判断向左还是向右。'],
  ideas: [
    ['Cross product (b − a) × (c − a): positive means c lies to the left of the ray a → b, negative to the right, zero on the line.', '叉积 (b − a) × (c − a)：为正表示 c 在射线 a → b 的左侧，为负在右侧，为零则共线。'],
    ['Sort the points by x, then by y.', '把点按 x 坐标排序，x 相同按 y 排序。'],
    ['Lower hull: sweep left to right; while the last two stack points and the new one do not make a left turn, pop.', '下凸壳：从左到右扫描；只要栈顶两点与新点不构成左拐，就弹出栈顶。'],
    ['Upper hull: sweep back right to left with the same rule, never popping into the lower hull.', '上凸壳：再从右到左用同样的规则扫描一遍，但不能弹到下凸壳里去。'],
    ['Using ≤ 0 drops collinear points. The doubled area is the sum of cross products of consecutive hull vertices.', '用 ≤ 0 判断会去掉共线的点。凸包面积的两倍等于相邻顶点叉积之和。'],
  ],
  time: 'O(n log n)', space: 'O(n)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

typedef pair<long long, long long> P;
int n;
P p[1000005], h[2000005];

long long cross(P a, P b, P c) {
    return (b.first - a.first) * (c.second - a.second) - (b.second - a.second) * (c.first - a.first);
}

int main() {
    scanf("%d", &n);
    for (int i = 0; i < n; i++) scanf("%lld%lld", &p[i].first, &p[i].second);
    sort(p, p + n);
    n = unique(p, p + n) - p;  //@sort
    int k = 0;
    for (int i = 0; i < n; i++) {
        while (k >= 2 && cross(h[k - 2], h[k - 1], p[i]) <= 0) k--;  //@pop
        h[k++] = p[i];  //@push
    }
    for (int i = n - 2, t = k + 1; i >= 0; i--) {
        while (k >= t && cross(h[k - 2], h[k - 1], p[i]) <= 0) k--;  //@upop
        h[k++] = p[i];  //@upush
    }
    if (n > 1) k--;
    long long area2 = 0;
    for (int i = 0; i < k; i++) area2 += h[i].first * h[(i + 1) % k].second - h[i].second * h[(i + 1) % k].first;
    printf("%d %lld\n", k, area2);  //@done
}`,
  notes: [
    ['sort', ['pair compares by first, then second — exactly the order needed. unique removes duplicate points.', 'pair 先比较 first 再比较 second——正是所需的顺序。unique 去掉重复的点。']],
    ['pop', ['Not a left turn: the middle point is inside (or on) the hull, so it goes.', '不是左拐：中间那个点在凸包内部（或边上），所以弹掉。']],
    ['upop', ['t = k + 1 protects the finished lower hull from being popped.', 't = k + 1 保护已经建好的下凸壳不被弹出。']],
    ['done', ['The last point pushed is the starting point again, hence k−−.', '最后压入的点又回到了起点，所以要 k−−。']],
  ],
  input: ['n, then n points "x y" with integer coordinates. Prints the number of hull vertices and twice the hull area.', 'n，随后 n 个整数坐标的点 “x y”。输出凸包的顶点数和凸包面积的两倍。'],
  sizes: [6, 9, 12], lab: [10, 1000, 100000, 300000],
  gen: (n, r) => `${n}\n` + span(1, n).map(() => `${r.int(0, n <= 30 ? 12 : 1000000)} ${r.int(0, n <= 30 ? 9 : 1000000)}`).join('\n') + '\n',
  run(inp, t) {
    const rd = reader(inp), n0 = rd.int()
    need(n0 >= 1, 'n must be at least 1.', 'n 至少为 1。')
    let pts = Array.from({ length: n0 }, () => [rd.int(), rd.int()] as [number, number])
    for (const [x, y] of pts) need(Number.isInteger(x) && Number.isInteger(y) && Math.abs(x) <= 1e7 && Math.abs(y) <= 1e7, 'Coordinates must be integers with |x|, |y| ≤ 10^7.', '坐标须为绝对值不超过 10^7 的整数。')
    pts.sort((a, b) => { t.tick(); return a[0] - b[0] || a[1] - b[1] })
    pts = pts.filter((p, i) => i === 0 || p[0] !== pts[i - 1][0] || p[1] !== pts[i - 1][1])
    const n = pts.length, cross = (a: number[], b: number[], c: number[]) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
    let pos: P[] = []
    if (t.on) {
      const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys)
      pos = pts.map(p => ({ x: x1 > x0 ? (p[0] - x0) / (x1 - x0) : 0.5, y: y1 > y0 ? 1 - (p[1] - y0) / (y1 - y0) : 0.5 }))
    }
    const h: number[] = []
    const view = (hi: Tones, closed = false, cand?: number) => {
      const es: GEdge[] = []
      for (let i = 0; i + 1 < h.length; i++) es.push({ u: h[i], v: h[i + 1], tone: 'ok' })
      if (closed && h.length > 2) es.push({ u: h[h.length - 1], v: h[0], tone: 'ok' })
      if (cand !== undefined && h.length) es.push({ u: h[h.length - 1], v: cand, dash: true, tone: 'act' })
      return graph(pos, es, { small: true, tone: { ...tn({ ok: h }), ...hi }, sub: pts.map(p => `${p[0]},${p[1]}`), name: 'caption = coordinates' })
    }
    t.s('sort', () => [[`Sort the ${n} distinct point(s) by x, then y.`, `把 ${n} 个不同的点按 x、再按 y 排序。`], view({})])
    const sweep = (i: number, floor: number, popTag: string, pushTag: string, name: [string, string]) => {
      while (h.length >= floor && cross(pts[h[h.length - 2]], pts[h[h.length - 1]], pts[i]) <= 0) {
        const mid = h[h.length - 1], c = cross(pts[h[h.length - 2]], pts[mid], pts[i])
        t.s(popTag, () => [[`${name[0]}: cross = ${c} ≤ 0 — (${pts[mid]}) is not a left turn before (${pts[i]}): pop it.`, `${name[1]}：叉积 = ${c} ≤ 0——到 (${pts[i]}) 时 (${pts[mid]}) 处不是左拐：弹出。`], view({ [mid]: 'bad', [i]: 'act' }, false, i)])
        h.pop()
      }
      h.push(i)
      t.s(pushTag, () => [[`${name[0]}: push (${pts[i]}).`, `${name[1]}：压入 (${pts[i]})。`], view({ [i]: 'act' })])
    }
    for (let i = 0; i < n; i++) sweep(i, 2, 'pop', 'push', ['Lower hull', '下凸壳'])
    const floor = h.length + 1
    for (let i = n - 2; i >= 0; i--) sweep(i, floor, 'upop', 'upush', ['Upper hull', '上凸壳'])
    if (n > 1) h.pop()
    let area2 = 0
    for (let i = 0; i < h.length; i++) { const a = pts[h[i]], b = pts[h[(i + 1) % h.length]]; area2 += a[0] * b[1] - a[1] * b[0] }
    t.s('done', () => [[`The hull has ${h.length} vertex/vertices; twice its area is ${area2}.`, `凸包有 ${h.length} 个顶点；面积的两倍是 ${area2}。`], view({}, true), vars({ vertices: h.length, 'area × 2': area2 })])
    t.out(`${h.length} ${area2}`)
  },
}

const prufer: Lesson = {
  id: 'prufer', title: ['Prüfer sequence', 'Prüfer 序列'], level: 'N', cat: 'math', diff: 9,
  blurb: ['Repeatedly delete the smallest leaf and write down its neighbour: a labelled tree on n vertices becomes a sequence of n − 2 labels.', '反复删去编号最小的叶子，并记下它的邻居：一棵 n 个顶点的有标号树就变成了长度为 n − 2 的序列。'],
  ideas: [
    ['Repeat n − 2 times: take the leaf with the smallest label, append its only neighbour to the sequence, delete the leaf.', '重复 n − 2 次：取出编号最小的叶子，把它唯一的邻居写入序列，然后删掉这个叶子。'],
    ['Two vertices remain at the end; they are not recorded.', '最后剩下两个顶点，不需要记录。'],
    ['A vertex of degree d appears exactly d − 1 times, so leaves never appear.', '度数为 d 的顶点恰好出现 d − 1 次，所以叶子不会出现在序列里。'],
    ['The process can be reversed, so trees and sequences correspond one to one.', '这个过程可以逆向进行，所以树与序列一一对应。'],
    ['There are n choices for each of the n − 2 entries: Cayley\'s formula, nⁿ⁻² labelled trees.', '序列的 n − 2 个位置各有 n 种取值：这就是 Cayley 公式——有标号树共 nⁿ⁻² 棵。'],
  ],
  time: 'O(n log n)', space: 'O(n)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n, deg[300005];
bool gone[300005];
vector<int> g[300005];

int main() {
    scanf("%d", &n);
    for (int i = 1; i < n; i++) {
        int u, v; scanf("%d%d", &u, &v);
        g[u].push_back(v); g[v].push_back(u);
        deg[u]++; deg[v]++;
    }
    priority_queue<int, vector<int>, greater<int>> leaves;
    for (int i = 1; i <= n; i++) if (deg[i] == 1) leaves.push(i);  //@init
    for (int k = 0; k < n - 2; k++) {
        int u = leaves.top(); leaves.pop();
        gone[u] = true;
        for (int v : g[u]) {
            if (gone[v]) continue;
            printf("%d ", v);  //@leaf
            if (--deg[v] == 1) leaves.push(v);  //@newleaf
        }
    }
}`,
  notes: [
    ['init', ['A min-heap always yields the smallest remaining leaf.', '小根堆总是给出当前编号最小的叶子。']],
    ['leaf', ['A leaf has exactly one neighbour that is still present.', '叶子恰好有一个尚未被删除的邻居。']],
    ['newleaf', ['Losing a neighbour may turn v into a leaf, which then joins the heap.', '失去一个邻居后 v 可能变成叶子，于是加入堆。']],
  ],
  input: ['n, then n − 1 tree edges "u v". Prints the Prüfer sequence (n − 2 numbers; nothing if n ≤ 2).', 'n，随后 n − 1 条树边 “u v”。输出 Prüfer 序列（共 n − 2 个数；n ≤ 2 时不输出）。'],
  sizes: [6, 8, 10], lab: [10, 1000, 100000, 300000],
  gen(n, r) {
    const perm = r.shuffle(span(1, n))
    return `${n}\n` + genTree(n, r).map(([u, v]) => `${perm[u]} ${perm[v]}`).join('\n') + '\n'
  },
  run(inp, t) {
    const rd = reader(inp), n = rd.int(), es: E[] = []
    need(n >= 1, 'n must be at least 1.', 'n 至少为 1。')
    for (let i = 0; i < n - 1; i++) { const u = rd.int() - 1, v = rd.int() - 1; need(u >= 0 && u < n && v >= 0 && v < n, 'Vertex out of range.', '顶点编号越界。'); es.push([u, v, 1]) }
    need(parentsOf(n, es, 0).every(p => p !== -2), 'The edges must form a tree.', '这些边必须构成一棵树。')
    const g: [number, number][][] = Array.from({ length: n }, () => []), deg = new Int32Array(n), gone = new Uint8Array(n), out: number[] = [], et: Tones = {}
    es.forEach(([u, v], i) => { g[u].push([v, i]); g[v].push([u, i]); deg[u]++; deg[v]++ })
    const pos = t.on ? layoutTree(n, es, 0) : [], ed = es.map(([u, v]) => ({ u, v }))
    const leaves = new Heap<number>((a, b) => a < b)
    for (let i = 0; i < n; i++) if (deg[i] === 1) leaves.push(i)
    const view = (hi: Tones) => { const tone: Tones = {}; for (let i = 0; i < n; i++) if (gone[i]) tone[i] = 'dim'; else if (deg[i] === 1) tone[i] = 'cmp'; return [graph(pos, ed, { tone: { ...tone, ...hi }, et, name: 'blue = current leaves' }), arr('Prüfer sequence', out.length ? out : ['—'], out.length ? tn({ act: out.length - 1 }) : {})] as const }
    t.s('init', () => [[`Leaves: ${leaves.a.slice().sort((a, b) => a - b).map(x => x + 1).join(', ') || 'none'}.`, `叶子：${leaves.a.slice().sort((a, b) => a - b).map(x => x + 1).join('、') || '无'}。`], ...view({})])
    for (let k = 0; k < n - 2; k++) {
      const u = leaves.pop()
      gone[u] = 1
      for (const [v, e] of g[u]) {
        if (gone[v]) continue
        out.push(v + 1); et[e] = 'dim'
        t.s('leaf', () => [[`Smallest leaf is ${u + 1}; its neighbour ${v + 1} goes into the sequence, then ${u + 1} is deleted.`, `最小的叶子是 ${u + 1}；把它的邻居 ${v + 1} 写入序列，然后删去 ${u + 1}。`], ...view({ [u]: 'bad', [v]: 'act' })])
        if (--deg[v] === 1) { leaves.push(v); t.s('newleaf', () => [[`${v + 1} has become a leaf.`, `${v + 1} 变成了叶子。`], ...view({ [v]: 'ok' })]) }
      }
    }
    t.out(out.join(' '))
  },
}

export default [gcd, exgcd, sieve, linearSieve, pascal, gauss, nimSg, hull, prufer]
