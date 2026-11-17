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
  broken: {
    from: 'a = b; b = r;', to: 'b = r; a = b;',
    why: ['The pair (a, b) must become (b, r) — __both__ new values are computed from the old pair. Assigning b first destroys the old b before a can take it, so a receives r as well, and the pair becomes (r, r). The next step then divides r by itself, the remainder is 0, and the program prints 0.', '这一对数 (a, b) 要变成 (b, r)——两个新值__都__由原来的那一对算出。先给 b 赋值，就在 a 拿到原来的 b 之前把它覆盖了，于是 a 得到的也是 r，这一对数变成了 (r, r)。下一步 r 除以它自己，余数是 0，程序输出 0。'],
  },
  run(inp, t, bug = false) {
    const rd = reader(inp)
    let a = rd.int(), b = rd.int()
    need(Number.isSafeInteger(a) && Number.isSafeInteger(b) && a >= 0 && b >= 0, 'Expected two non-negative integers below 2^53.', '需要两个小于 2^53 的非负整数。')
    const rows: (string | number)[][] = []
    while (b) {
      const r = a % b
      if (!bug && rows.length > 0) t.ask(() => {
        const opts = [...new Set([r, a - b, Math.floor(a / b)])].filter(x => x >= 0).sort((x, y) => x - y)
        return opts.length < 2 ? undefined : [[`Next pair: gcd(${a}, ${b}) = gcd(${b}, ?)`, `下一对：gcd(${a}, ${b}) = gcd(${b}, ?)`], opts.map(x => [String(x), String(x)] as const), opts.indexOf(r)]
      })
      rows.push([a, b, Math.floor(a / b), r])
      t.s('mod', () => [[`${a} = ${Math.floor(a / b)} × ${b} + ${r}, so gcd(${a}, ${b}) = gcd(${b}, ${r}).`, `${a} = ${Math.floor(a / b)} × ${b} + ${r}，所以 gcd(${a}, ${b}) = gcd(${b}, ${r})。`], grid('steps', rows, gt({ act: [[rows.length - 1, 3]] }), { cols: ['a', 'b', 'a / b', 'a mod b'] })])
      if (bug) { b = r; a = b } else { a = b; b = r }
    }
    t.s('done', () => [[bug ? `b is 0: the program prints a = ${a}.` : `The remainder is 0: the gcd is ${a}.`, bug ? `b 为 0：程序输出 a = ${a}。` : `余数为 0：最大公约数是 ${a}。`], grid('steps', rows.length ? rows : [[a, 0, '', '']], rows.length ? gt({ ok: [[rows.length - 1, 1]] }) : {}, { cols: ['a', 'b', 'a / b', 'a mod b'] }), vars({ gcd: a })])
    t.out(a)
  },
}

const exgcd: Lesson = {
  id: 'exgcd', title: ['Extended Euclid & Bézout', '扩展欧几里得算法与裴蜀定理'], level: 'S', cat: 'math', diff: 7,
  needs: ['gcd'],
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
  broken: {
    from: 'long long g = exgcd(b, a % b, y, x);  //@down', to: 'long long g = exgcd(b, a % b, x, y);  //@down',
    why: ['The inner call solves b·x′ + (a mod b)·y′ = g, and the outer pair needs __x = y′__. Passing (y, x) swapped is what puts y′ into x and x′ into y. Passed in order, x gets x′ and y gets y′, so the update y −= ⌊a/b⌋·x computes y′ − ⌊a/b⌋·x′ instead: the printed x and y no longer satisfy a·x + b·y = g.', '内层调用解的是 b·x′ + (a mod b)·y′ = g，而外层需要的是 __x = y′__。把 (y, x) 交换着传进去，正是为了让 y′ 写进 x、x′ 写进 y。按原顺序传入，x 得到 x′、y 得到 y′，于是 y −= ⌊a/b⌋·x 算出的是 y′ − ⌊a/b⌋·x′：输出的 x 和 y 不再满足 a·x + b·y = g。'],
  },
  run(inp, t, bug = false) {
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
      if (!bug && px !== py) t.ask(() => {
        const opts = [px, py].sort((u, v) => u - v)
        return [[`Back in exgcd(${rows[k][0]}, ${rows[k][1]}): the call below returned x′ = ${px}, y′ = ${py}. What is x here?`, `回到 exgcd(${rows[k][0]}, ${rows[k][1]})：下层返回 x′ = ${px}，y′ = ${py}。这里的 x 是多少？`], opts.map(v => [String(v), String(v)] as const), opts.indexOf(py)]
      })
      if (bug) { x = px; y = py - q * px } else { x = py; y = px - q * py }
      rows[k][3] = x; rows[k][4] = y
      if (bug) t.s('up', () => [[`Back in exgcd(${rows[k][0]}, ${rows[k][1]}): x = ${x}, y = ${py} − ${q}·${px} = ${y}.`, `回到 exgcd(${rows[k][0]}, ${rows[k][1]})：x = ${x}，y = ${py} − ${q}·${px} = ${y}。`], view(gt({ cmp: [[k + 1, 3], [k + 1, 4]], act: [[k, 3], [k, 4]] }))])
      else t.s('up', () => [[`Back in exgcd(${rows[k][0]}, ${rows[k][1]}): x = y′ = ${py}, y = x′ − ${q}·y′ = ${px} − ${q}·${py} = ${y}. Check: ${rows[k][0]}·(${x}) + ${rows[k][1]}·(${y}) = ${g}.`, `回到 exgcd(${rows[k][0]}, ${rows[k][1]})：x = y′ = ${py}，y = x′ − ${q}·y′ = ${px} − ${q}·${py} = ${y}。验证：${rows[k][0]}·(${x}) + ${rows[k][1]}·(${y}) = ${g}。`], view(gt({ cmp: [[k + 1, 3], [k + 1, 4]], act: [[k, 3], [k, 4]] }))])
    }
    t.s('done', () => [bug ? [`The program prints x = ${x}, y = ${y}, g = ${g}.`, `程序输出 x = ${x}，y = ${y}，g = ${g}。`] : [`${a0}·(${x}) + ${b0}·(${y}) = ${g}.`, `${a0}·(${x}) + ${b0}·(${y}) = ${g}。`], view(gt({ ok: [[0, 3], [0, 4]] })), vars({ x, y, gcd: g })])
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
  needs: ['prime-factor'],
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
  broken: {
    from: 'j <= n; j += i)', to: 'j < n; j += i)',
    why: ['The count covers the numbers up to n, __n included__, so n itself has to be crossed out if it is composite. With `j < n` the multiples stop one short: n is never crossed out by any prime, and a composite n is counted as a prime.', '要统计的是不超过 n 的数，__包括 n 本身__，所以如果 n 是合数，它也必须被划掉。写成 `j < n` 后倍数少走了一步：没有任何素数会划掉 n，于是合数 n 被当成素数数了进去。'],
  },
  run(inp, t, bug = false) {
    const n = reader(inp).int()
    need(n >= 1 && n <= 2e7, 'n must be between 1 and 20,000,000.', 'n 须在 1 到 20,000,000 之间。')
    const comp = new Uint8Array(n + 1), isP = new Uint8Array(n + 1)
    let cnt = 0
    const view = (hi: Tones) => numGrid(n, i => hi[i] ?? (i === 1 ? 'dim' : comp[i] ? 'dim' : isP[i] ? 'ok' : undefined), 'green = prime, faded = crossed out')
    for (let i = 2; i <= n; i++) {
      if (comp[i]) continue
      cnt++; isP[i] = 1
      t.s('prime', () => [[`${i} was never crossed out: it is prime.${i * i > n ? '' : ` Cross out its multiples from ${i}² = ${i * i}.`}`, `${i} 没有被划掉：它是素数。${i * i > n ? '' : `从 ${i}² = ${i * i} 开始划掉它的倍数。`}`], view({ [i]: 'act' }), vars({ primes: cnt })])
      if (!bug && i * i <= n && i > 2) t.ask(() => {
        const opts = [...new Set([2 * i, i * i, i * (i + 1)])].sort((x, y) => x - y)
        return [[`${i} is prime. Which multiple of ${i} is the first one it crosses out?`, `${i} 是素数。它划掉的第一个倍数是多少？`], opts.map(x => [String(x), String(x)] as const), opts.indexOf(i * i)]
      })
      for (let j = i * i; bug ? j < n : j <= n; j += i) {
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
  needs: ['sieve'],
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
  broken: {
    from: '1LL * i * prime[k] <= n', to: '1LL * i * prime[k] < n',
    why: ['Every composite m ≤ n is crossed out exactly once, when i = m / (its smallest prime factor) — and that includes m = n. With `<` the product i × prime[k] may never equal n, so a composite n is never crossed out, is later found unmarked, and is counted as a prime.', '每个不超过 n 的合数 m 都恰好在 i = m /（它的最小素因子）时被划掉一次——m = n 也不例外。写成 `<` 后，乘积 i × prime[k] 永远不会等于 n，于是合数 n 从未被划掉，之后走到它时发现它未被标记，就把它当成素数数了进去。'],
  },
  run(inp, t, bug = false) {
    const n = reader(inp).int()
    need(n >= 1 && n <= 2e7, 'n must be between 1 and 20,000,000.', 'n 须在 1 到 20,000,000 之间。')
    const comp = new Uint8Array(n + 1), prime: number[] = []
    const view = (hi: Tones) => [numGrid(n, i => hi[i] ?? (i === 1 || comp[i] ? 'dim' : prime.includes(i) ? 'ok' : undefined), 'green = prime, faded = crossed out'), arr('primes', prime.slice(0, 20))] as const
    for (let i = 2; i <= n; i++) {
      if (!comp[i]) { prime.push(i); t.s('prime', () => [[`${i} is unmarked: prime.`, `${i} 未被标记：是素数。`], ...view({ [i]: 'act' })]) }
      for (let k = 0; k < prime.length && (bug ? i * prime[k] < n : i * prime[k] <= n); k++) {
        const p = prime[k]
        comp[i * p] = 1
        t.s('cross', () => [[`i = ${i}: cross out ${i} × ${p} = ${i * p} (smallest prime factor ${p}).`, `i = ${i}：划掉 ${i} × ${p} = ${i * p}（最小素因子为 ${p}）。`], ...view({ [i]: 'act', [p]: 'cmp', [i * p]: 'bad' })])
        if (i % p === 0) {
          t.s('stop', () => [[`${p} divides ${i}: stop — larger primes would not be the smallest factor.`, `${p} 整除 ${i}：停止——更大的素数不会是最小素因子。`], ...view({ [i]: 'act', [p]: 'cmp' })])
          break
        }
      }
    }
    if (bug) t.s('done', () => [[`The program counts ${prime.length} prime(s).`, `程序数出 ${prime.length} 个素数。`], ...view({})])
    else t.s('done', () => [[`${prime.length} prime(s) up to ${n}; every composite was crossed out exactly once.`, `不超过 ${n} 的素数共 ${prime.length} 个；每个合数恰好被划掉一次。`], ...view({})])
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
  broken: {
    from: 'for (int j = 1; j <= i; j++)', to: 'for (int j = 1; j < i; j++)',
    why: ['Row i has i + 1 entries, C(i, 0) … C(i, i), and the right edge C(i, i) = 1 is produced by the sum c[i − 1][i − 1] + c[i − 1][i] = 1 + 0. With `j < i` that last cell is never computed and stays 0. Every row loses its right edge, and since each row is built from the one above, the zero spreads inward.', '第 i 行有 i + 1 项：C(i, 0) … C(i, i)，右边界 C(i, i) = 1 正是由 c[i − 1][i − 1] + c[i − 1][i] = 1 + 0 算出来的。写成 `j < i` 后，最后这一格从未被计算，一直是 0。每一行都丢了右边界，而每一行又由上一行算出，于是这个 0 一路向里扩散。'],
  },
  run(inp, t, bug = false) {
    const n = reader(inp).int()
    need(n >= 0 && n <= 3000, 'n must be between 0 and 3000.', 'n 须在 0 到 3000 之间。')
    const c = Array.from({ length: n + 1 }, (_, i) => new Int32Array(i + 2))
    const view = (i: number, j: number, tone: Record<string, Tone>) => grid('c[i][j] = C(i, j)', c.map((row, x) => span(0, n).map(y => (y <= x && (x < i || (x === i && y <= j)) ? row[y] : ''))), tone, { rows: span(0, n).map(x => 'i=' + x), cols: span(0, n).map(x => 'j=' + x) })
    for (let i = 0; i <= n; i++) {
      c[i][0] = 1
      t.s('edge', () => [[`C(${i}, 0) = 1.`, `C(${i}, 0) = 1。`], view(i, 0, gt({ ok: [[i, 0]] }))])
      for (let j = 1; bug ? j < i : j <= i; j++) {
        c[i][j] = (c[i - 1][j - 1] + c[i - 1][j]) % MOD
        t.s('add', () => [[`C(${i}, ${j}) = C(${i - 1}, ${j - 1}) + C(${i - 1}, ${j}) = ${c[i - 1][j - 1]} + ${c[i - 1][j]} = ${c[i][j]}.`, `C(${i}, ${j}) = C(${i - 1}, ${j - 1}) + C(${i - 1}, ${j}) = ${c[i - 1][j - 1]} + ${c[i - 1][j]} = ${c[i][j]}。`], view(i, j, gt({ cmp: [[i - 1, j - 1], [i - 1, j]], act: [[i, j]] }))])
      }
    }
    t.s('done', () => [[`Row ${n} is complete.`, `第 ${n} 行计算完毕。`], view(n, n, gt({ ok: span(0, n).map(j => [n, j] as [number, number]) }))])
    t.out(Array.from(c[n].subarray(0, n + 1)).join(' '))
  },
}

/** printf("%.2f"): exact ties (x · 8 an odd integer) round to even, and a negative zero keeps its sign. toFixed rounds ties away from zero. */
const printf2 = (x: number) => {
  const m = Math.abs(x) * 8
  if (Number.isInteger(m) && m % 2 === 1) {
    const lo = Math.floor(Math.abs(x) * 100), h = lo % 2 === 0 ? lo : lo + 1
    return (x < 0 ? '-' : '') + (h / 100).toFixed(2)
  }
  return Object.is(x, -0) ? '-0.00' : x.toFixed(2)
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
  broken: {
    from: 'for (int j = n; j >= c; j--) a[i][j] -= a[i][c] * a[c][j];  //@elim', to: 'for (int j = c; j <= n; j++) a[i][j] -= a[i][c] * a[c][j];  //@elim',
    why: ['The multiplier a[i][c] is read at every step of the loop, and the first step of an upward loop is j = c, which __overwrites a[i][c] itself__ with 0. From then on the multiplier is 0 and nothing else in row i changes: the column is cleared but the row is not reduced, so the solution comes out wrong. Running j downward changes a[i][c] last.', '乘数 a[i][c] 在循环的每一步都要用到，而从小到大循环的第一步就是 j = c，它__把 a[i][c] 自己__改成了 0。从这以后乘数就是 0，第 i 行的其余部分都没有变化：这一列是消成 0 了，这一行却没有真正被消元，于是解是错的。让 j 从大到小循环，a[i][c] 就会最后才被改动。'],
  },
  run(inp, t, bug = false) {
    const rd = reader(inp), n = rd.int()
    need(n >= 1 && n <= 300, 'n must be between 1 and 300.', 'n 须在 1 到 300 之间。')
    const a = Array.from({ length: n }, () => rd.ints(n + 1))
    const cols = [...span(1, n).map(i => 'x' + i), '= b']
    const view = (tone: Record<string, Tone>) => grid('augmented matrix [A | b]', a.map(r => r.map(fmt)), tone, { cols })
    const row = (i: number) => span(0, n).map(j => [i, j] as [number, number])
    for (let c = 0; c < n; c++) {
      let p = c
      for (let i = c + 1; i < n; i++) if (Math.abs(a[i][c]) > Math.abs(a[p][c])) p = i
      if (!bug && c > 0 && n - c >= 2 && span(c, n - 1).filter(i => Math.abs(a[i][c]) === Math.abs(a[p][c])).length === 1) t.ask(() => {
        const opts = span(c, Math.min(n - 1, c + 3))
        if (!opts.includes(p)) opts[opts.length - 1] = p
        return [[`Column ${c + 1}: which row becomes the pivot row?`, `第 ${c + 1} 列：哪一行成为主元行？`], opts.map(i => [`row ${i + 1} (${fmt(a[i][c])})`, `第 ${i + 1} 行（${fmt(a[i][c])}）`] as const), opts.indexOf(p)]
      })
      if (Math.abs(a[p][c]) < 1e-9) { t.s('none', () => [[`Column ${c + 1} has no non-zero pivot: no unique solution.`, `第 ${c + 1} 列找不到非零主元：没有唯一解。`], view(gt({ bad: span(c, n - 1).map(i => [i, c] as [number, number]) }))]); t.out('No Solution'); return }
      ;[a[c], a[p]] = [a[p], a[c]]
      t.s('pivot', () => [[p === c ? `Column ${c + 1}: row ${c + 1} already holds the largest pivot ${fmt(a[c][c])}.` : `Column ${c + 1}: the largest pivot ${fmt(a[c][c])} is in row ${p + 1} — swap rows ${c + 1} and ${p + 1}.`, p === c ? `第 ${c + 1} 列：第 ${c + 1} 行的主元 ${fmt(a[c][c])} 已是最大。` : `第 ${c + 1} 列：最大的主元 ${fmt(a[c][c])} 在第 ${p + 1} 行——交换第 ${c + 1} 行和第 ${p + 1} 行。`], view({ ...gt({ cmp: row(p) }), ...gt({ vis: row(c), act: [[c, c]] }) })])
      const d = a[c][c]
      for (let j = n; j >= c; j--) a[c][j] /= d
      t.s('norm', () => [[`Divide row ${c + 1} by ${fmt(d)} so the pivot becomes 1.`, `第 ${c + 1} 行除以 ${fmt(d)}，使主元变为 1。`], view(gt({ vis: row(c), ok: [[c, c]] }))])
      for (let i = 0; i < n; i++) {
        if (i === c) continue
        const k = a[i][c]
        if (bug) for (let j = c; j <= n; j++) a[i][j] -= a[i][c] * a[c][j]
        else for (let j = n; j >= c; j--) a[i][j] -= k * a[c][j]
        t.s('elim', () => [[`Row ${i + 1} −= ${fmt(k)} × row ${c + 1}: the entry in column ${c + 1} becomes 0.`, `第 ${i + 1} 行 −= ${fmt(k)} × 第 ${c + 1} 行：第 ${c + 1} 列的元素变为 0。`], view({ ...gt({ vis: row(c), cmp: row(i) }), ...gt({ ok: [[c, c]], act: [[i, c]] }) })])
      }
    }
    t.s('done', () => [bug ? ['The program prints the last column.', '程序输出最后一列。'] : ['The left part is the identity: the last column is the solution.', '左边已是单位阵：最后一列就是解。'], view(gt({ ok: span(0, n - 1).map(i => [i, n] as [number, number]) }))])
    t.out(a.map(r => printf2(r[n])).join('\n'))
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
  broken: {
    from: 'res ^= sg[pile[i]];  //@xor', to: 'res += sg[pile[i]];  //@xor',
    why: ['Independent games combine like Nim piles, and Nim piles combine by __XOR__, not by addition: two piles with the same SG value cancel, because the second player can copy every move. With `+`, any non-zero SG value makes the total non-zero, so positions such as SG values 1, 2 and 3 — XOR 0, a loss for the player to move — are reported as First.', '独立的游戏像 Nim 的各堆那样组合，而 Nim 的各堆是用__异或__而不是加法组合的：两堆 SG 值相同的石子会互相抵消，因为后手可以模仿先手的每一步。用 `+` 的话，只要有一个 SG 值非零，总和就非零，于是像 SG 值为 1、2、3 这样的局面——异或为 0，先手必败——被报告为 First。'],
  },
  run(inp, t, bug = false) {
    const rd = reader(inp), m = rd.int(), mv = rd.ints(m), k = rd.int(), pile = rd.ints(k)
    need(m >= 1 && m <= 100 && mv.every(x => Number.isInteger(x) && x >= 1), 'Give between 1 and 100 positive moves.', '需要 1 到 100 个正整数着法。')
    need(pile.every(x => Number.isInteger(x) && x >= 0 && x <= 2e6), 'Pile sizes must be between 0 and 2,000,000.', '每堆石子数须在 0 到 2,000,000 之间。')
    const mx = pile.reduce((a, b) => Math.max(a, b), 0), sg = new Int32Array(mx + 1), seen = new Uint8Array(m + 2)
    for (let x = 1; x <= mx; x++) {
      seen.fill(0)
      const from: number[] = []
      for (const d of mv) if (x >= d) { seen[sg[x - d]] = 1; from.push(x - d) }
      if (!bug && from.length && x > 1) t.ask(() => {
        const vals = [...new Set(from.map(y => sg[y]))].sort((u, v) => u - v)
        let mex = 0
        while (vals.includes(mex)) mex++
        const opts = [...new Set([mex, Math.max(...vals) + 1, 0, 1])].slice(0, 4).sort((u, v) => u - v)
        return opts.length < 2 ? undefined : [[`From ${x} the reachable positions have SG values {${vals.join(', ')}}. What is SG(${x})?`, `从 ${x} 能到达的局面的 SG 值是 {${vals.join(', ')}}。SG(${x}) 是多少？`], opts.map(v => [String(v), String(v)] as const), opts.indexOf(mex)]
      })
      while (seen[sg[x]]) sg[x]++
      t.s('mex', () => [[from.length ? `x = ${x}: reachable ${from.map(y => `${y} (SG ${sg[y]})`).join(', ')} → mex = ${sg[x]}.` : `x = ${x}: no move possible → SG = 0.`, from.length ? `x = ${x}：能到达 ${from.map(y => `${y}（SG ${sg[y]}）`).join('、')} → mex = ${sg[x]}。` : `x = ${x}：无法行动 → SG = 0。`], arr('SG(x)', Array.from(sg.subarray(0, Math.min(mx, 40) + 1), (v, i) => (i <= x ? v : '')), tn({ cmp: from, act: x })), vars({ moves: mv.join(', ') })])
    }
    let res = 0
    pile.forEach((p, i) => {
      const before = res
      res = bug ? res + sg[p] : res ^ sg[p]
      const op = bug ? '+' : 'xor'
      t.s('xor', () => [[`Pile ${i + 1} has ${p} stones: SG = ${sg[p]}; ${before} ${op} ${sg[p]} = ${res}.`, `第 ${i + 1} 堆有 ${p} 个石子：SG = ${sg[p]}；${before} ${op} ${sg[p]} = ${res}。`], arr('piles', pile, tn({ dim: span(0, i - 1), act: i })), arr('SG of each pile', pile.map(x => sg[x]), tn({ dim: span(0, i - 1), act: i })), vars({ xor: res })])
    })
    t.s('done', () => [bug ? [`res = ${res}: the program prints ${res ? 'First' : 'Second'}.`, `res = ${res}：程序输出 ${res ? 'First' : 'Second'}。`] : res ? [`XOR = ${res} ≠ 0: the first player wins.`, `异或 = ${res} ≠ 0：先手必胜。`] : ['XOR = 0: the second player wins.', '异或 = 0：后手必胜。'], arr('piles', pile), arr('SG of each pile', pile.map(x => sg[x])), vars({ xor: res })])
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
  broken: {
    from: 'for (int i = n - 2, t = k + 1; i >= 0; i--) {', to: 'for (int i = n - 2, t = 2; i >= 0; i--) {',
    why: ['When the upper sweep starts, the stack already holds the finished lower hull, ending at the rightmost point. t = k + 1 lets the upper sweep pop __only its own points__. With t = 2 it may pop into the lower hull: as soon as the next point lies on the line through the last two lower-hull points, the rightmost point — a true corner of the hull — is popped and lost.', '上凸壳开始扫描时，栈里已经是建好的下凸壳，最后一个是最右边的点。t = k + 1 让上凸壳的扫描__只能弹出它自己压入的点__。写成 t = 2 后，它可能弹进下凸壳里去：只要下一个点落在下凸壳最后两点所在的直线上，最右边的点——凸包真正的一个顶点——就被弹掉丢失了。'],
  },
  run(inp, t, bug = false) {
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
    const floor = bug ? 2 : h.length + 1
    for (let i = n - 2; i >= 0; i--) sweep(i, floor, 'upop', 'upush', ['Upper hull', '上凸壳'])
    if (n > 1) h.pop()
    let area2 = 0
    for (let i = 0; i < h.length; i++) { const a = pts[h[i]], b = pts[h[(i + 1) % h.length]]; area2 += a[0] * b[1] - a[1] * b[0] }
    t.s('done', () => [bug ? [`The stack holds ${h.length} point(s); twice the area of that polygon is ${area2}.`, `栈里有 ${h.length} 个点；这个多边形面积的两倍是 ${area2}。`] : [`The hull has ${h.length} vertex/vertices; twice its area is ${area2}.`, `凸包有 ${h.length} 个顶点；面积的两倍是 ${area2}。`], view({}, true), vars({ vertices: h.length, 'area × 2': area2 })])
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
  broken: {
    from: 'priority_queue<int, vector<int>, greater<int>> leaves;', to: 'priority_queue<int> leaves;',
    why: ['The Prüfer sequence is defined by always removing the leaf with the __smallest__ label, and that rule is what makes the sequence unique and reversible. A plain priority_queue is a max-heap, so the program removes the largest leaf each time and writes down a different sequence.', 'Prüfer 序列的定义是：每次删去编号__最小__的叶子，正是这条规则让序列唯一、可以还原。不加参数的 priority_queue 是大根堆，于是程序每次删去的是编号最大的叶子，写出来的是另一个序列。'],
  },
  run(inp, t, bug = false) {
    const rd = reader(inp), n = rd.int(), es: E[] = []
    need(n >= 1, 'n must be at least 1.', 'n 至少为 1。')
    for (let i = 0; i < n - 1; i++) { const u = rd.int() - 1, v = rd.int() - 1; need(u >= 0 && u < n && v >= 0 && v < n, 'Vertex out of range.', '顶点编号越界。'); es.push([u, v, 1]) }
    need(parentsOf(n, es, 0).every(p => p !== -2), 'The edges must form a tree.', '这些边必须构成一棵树。')
    const g: [number, number][][] = Array.from({ length: n }, () => []), deg = new Int32Array(n), gone = new Uint8Array(n), out: number[] = [], et: Tones = {}
    es.forEach(([u, v], i) => { g[u].push([v, i]); g[v].push([u, i]); deg[u]++; deg[v]++ })
    const pos = t.on ? layoutTree(n, es, 0) : [], ed = es.map(([u, v]) => ({ u, v }))
    const leaves = new Heap<number>((a, b) => (bug ? a > b : a < b))
    for (let i = 0; i < n; i++) if (deg[i] === 1) leaves.push(i)
    const view = (hi: Tones) => { const tone: Tones = {}; for (let i = 0; i < n; i++) if (gone[i]) tone[i] = 'dim'; else if (deg[i] === 1) tone[i] = 'cmp'; return [graph(pos, ed, { tone: { ...tone, ...hi }, et, name: 'blue = current leaves' }), arr('Prüfer sequence', out.length ? out : ['—'], out.length ? tn({ act: out.length - 1 }) : {})] as const }
    t.s('init', () => [[`Leaves: ${leaves.a.slice().sort((a, b) => a - b).map(x => x + 1).join(', ') || 'none'}.`, `叶子：${leaves.a.slice().sort((a, b) => a - b).map(x => x + 1).join('、') || '无'}。`], ...view({})])
    for (let k = 0; k < n - 2; k++) {
      if (!bug && k > 0 && leaves.size >= 2) t.ask(() => {
        const ls = leaves.a.slice().sort((x, y) => x - y), all = [...new Set([...ls.slice(0, 3), ls[ls.length - 1]])]
        const rot = k % all.length, opts = [...all.slice(rot), ...all.slice(0, rot)]
        return [['Which leaf is removed next?', '下一个删去的是哪个叶子？'], opts.map(x => [`vertex ${x + 1}`, `顶点 ${x + 1}`] as const), opts.indexOf(ls[0])]
      })
      const u = leaves.pop()
      gone[u] = 1
      for (const [v, e] of g[u]) {
        if (gone[v]) continue
        out.push(v + 1); et[e] = 'dim'
        if (bug) t.s('leaf', () => [[`The heap gives leaf ${u + 1}; its neighbour ${v + 1} goes into the sequence, then ${u + 1} is deleted.`, `堆给出叶子 ${u + 1}；把它的邻居 ${v + 1} 写入序列，然后删去 ${u + 1}。`], ...view({ [u]: 'bad', [v]: 'act' })])
        else t.s('leaf', () => [[`Smallest leaf is ${u + 1}; its neighbour ${v + 1} goes into the sequence, then ${u + 1} is deleted.`, `最小的叶子是 ${u + 1}；把它的邻居 ${v + 1} 写入序列，然后删去 ${u + 1}。`], ...view({ [u]: 'bad', [v]: 'act' })])
        if (--deg[v] === 1) { leaves.push(v); t.s('newleaf', () => [[`${v + 1} has become a leaf.`, `${v + 1} 变成了叶子。`], ...view({ [v]: 'ok' })]) }
      }
    }
    t.out(out.join(' '))
  },
}

const primeFactor: Lesson = {
  id: 'prime-factor', title: ['Prime factorisation', '分解质因数'], level: 'J', cat: 'math', diff: 3,
  blurb: ['Divide out 2, then 3, then every later number while it divides — and stop at the square root of what is left.', '先把 2 除尽，再除 3，再依次往后试——试到剩下的数的平方根为止。'],
  ideas: [
    ['Every integer above 1 is a product of primes in exactly one way. Finding that product is factorisation.', '每个大于 1 的整数都能唯一地写成若干质数的乘积。把这个乘积找出来就是分解质因数。'],
    ['Try p = 2, 3, 4, … and divide n by p as long as it divides. Each division yields one prime factor.', '依次试 p = 2, 3, 4, …，只要 p 能整除 n 就一直除。每除一次就得到一个质因数。'],
    ['A composite p never divides: its own prime factors were divided out earlier.', '合数 p 永远不会整除 n：它自己的质因数早就被除尽了。'],
    ['If p · p > n, then n has no factor left except itself: whatever remains above 1 is prime.', '如果 p · p > n，n 除了它自身就没有别的因数了：剩下的数只要大于 1 就是质数。'],
  ],
  time: 'O(√n)', space: 'O(1)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int main() {
    long long n;
    scanf("%lld", &n);
    for (long long p = 2; p * p <= n; p++) {  //@try
        while (n % p == 0) {
            printf("%lld ", p);  //@take
            n /= p;
        }
    }
    if (n > 1) printf("%lld", n);  //@last
}`,
  notes: [
    ['try', ['n shrinks as factors are removed, so this bound tightens while the loop runs.', 'n 会随着因数被除掉而变小，所以这个上界在循环过程中不断收紧。']],
    ['take', ['"while", not "if": 8 = 2 · 2 · 2 contains the prime 2 three times.', '是 while 而不是 if：8 = 2 · 2 · 2 含有三个质因数 2。']],
    ['last', ['A number has at most one prime factor above its square root; if there is one, this is it.', '一个数至多有一个大于其平方根的质因数；如果有，就是这里剩下的数。']],
  ],
  input: ['n (2 ≤ n ≤ 10¹⁴). Prints its prime factors in non-decreasing order, each as often as it occurs. (In the generator, n is the number of digits.)', 'n（2 ≤ n ≤ 10¹⁴）。按从小到大的顺序输出它的质因数，重复的质因数重复输出。（生成器中 n 表示位数。）'],
  sizes: [2, 3, 4], lab: [4, 8, 11, 14],
  gen: (n, r) => `${n <= 1 ? r.int(2, 9) : n <= 8 ? r.int(10 ** (n - 1), 10 ** n - 1) : Math.floor(10 ** (n - 1) * (1 + 9 * r.next()))}\n`,
  broken: {
    from: 'while (n % p == 0) {', to: 'if (n % p == 0) {',
    why: ['A prime can occur __several times__: 8 = 2 · 2 · 2. `if` divides by p only once and then moves on to p + 1, so the remaining copies of p are never taken out. They stay inside n — the program prints 8 as "2 4", with a composite number at the end.', '一个质数可能__出现好几次__：8 = 2 · 2 · 2。`if` 只除一次 p 就去试 p + 1 了，剩下的那几个 p 再也没有被除掉。它们留在 n 里——程序把 8 输出成 “2 4”，最后还跟着一个合数。'],
  },
  run(inp, t, bug = false) {
    const N = reader(inp).int(), fs: number[] = []
    need(Number.isInteger(N) && N >= 2 && N <= 1e14, 'n must be an integer between 2 and 10¹⁴.', 'n 须为 2 到 10¹⁴ 之间的整数。')
    let n = N
    const found = () => fs.length > 0 && arr(`prime factors of ${N} found so far`, fs)
    for (let p = 2; p * p <= n; p++) {
      if (n % p !== 0) { t.s('try', () => [[`p = ${p}: ${p} × ${p} = ${p * p} ≤ ${n}, but ${p} does not divide ${n}.`, `p = ${p}：${p} × ${p} = ${p * p} ≤ ${n}，但 ${p} 不能整除 ${n}。`], found(), vars({ n, p })]); continue }
      while (n % p === 0) {
        const old = n
        n /= p; fs.push(p)
        const now = n
        t.s('take', () => [[`${p} divides ${old}: take the factor ${p}, leaving ${old} ÷ ${p} = ${now}.`, `${p} 能整除 ${old}：取出质因数 ${p}，剩下 ${old} ÷ ${p} = ${now}。`], arr(`prime factors of ${N} found so far`, fs, tn({ act: fs.length - 1 })), vars({ n: now, p })])
        if (bug) break
        if (now > 1) t.ask(() => [[`${now} is left. Is ${p} tried again before moving on to ${p + 1}?`, `还剩 ${now}。在去试 ${p + 1} 之前，还要再试一次 ${p} 吗？`], [[`yes: ${p} divides ${now}`, `要：${p} 能整除 ${now}`], [`no: ${p} does not divide ${now}`, `不要：${p} 不能整除 ${now}`]], now % p === 0 ? 0 : 1])
      }
    }
    const rest = n
    if (n > 1) fs.push(n)
    t.s('last', () => [rest > 1 ? [`No p with p × p ≤ ${rest} is left, so ${rest} has no smaller factor: it is prime.`, `已经没有满足 p × p ≤ ${rest} 的 p 了，所以 ${rest} 没有更小的因数：它是质数。`] : ['Nothing is left: n has become 1.', '什么都没剩下：n 已经变成 1。'],
      arr(`${N} =`, fs, tn({ ok: span(0, fs.length - 1) })), vars({ n: rest })])
    t.out(fs.join(' '))
  },
}

const isPrimeN = (x: number) => { if (x < 2) return false; for (let d = 2; d * d <= x; d++) if (x % d === 0) return false; return true }
const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71]

const modInverse: Lesson = {
  id: 'mod-inverse', title: ['Modular inverse (Fermat)', '乘法逆元（费马小定理）'], level: 'S', cat: 'math', diff: 7,
  needs: ['fast-pow'],
  blurb: ['Under a prime modulus, dividing by b is multiplying by b^(p − 2). Fast exponentiation does the rest.', '在质数模下，除以 b 就是乘以 b^(p − 2)。剩下的交给快速幂。'],
  ideas: [
    ['Remainders can be added, subtracted and multiplied freely — but not divided: 6 / 2 = 3, yet (6 mod 5) / 2 is not an integer.', '余数可以随意相加、相减、相乘——但不能直接相除：6 / 2 = 3，而 (6 mod 5) / 2 不是整数。'],
    ['The inverse of b modulo p is the number b⁻¹ with b · b⁻¹ ≡ 1. Dividing by b means multiplying by it.', 'b 模 p 的逆元是满足 b · b⁻¹ ≡ 1 的数 b⁻¹。除以 b 就是乘以它。'],
    ['Fermat\'s little theorem: for a prime p and b not divisible by p, b^(p − 1) ≡ 1 (mod p).', '费马小定理：p 是质数且 b 不是 p 的倍数时，b^(p − 1) ≡ 1 (mod p)。'],
    ['Split off one factor: b · b^(p − 2) ≡ 1. So b^(p − 2) is the inverse.', '拆出一个因子：b · b^(p − 2) ≡ 1。所以 b^(p − 2) 就是逆元。'],
    ['Fast exponentiation computes it in about log₂ p multiplications.', '用快速幂大约 log₂ p 次乘法就能算出来。'],
  ],
  time: 'O(log p)', space: 'O(1)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

long long power(long long a, long long b, long long p) {
    long long res = 1;
    for (a %= p; b > 0; b >>= 1) {
        if (b & 1) res = res * a % p;  //@mul
        a = a * a % p;  //@sq
    }
    return res;
}

int main() {
    long long a, b, p;
    scanf("%lld%lld%lld", &a, &b, &p);
    long long inv = power(b, p - 2, p);  //@fermat
    printf("%lld\n", a % p * inv % p);  //@done
}`,
  notes: [
    ['mul', ['This bit of the exponent is 1: the current square belongs in the product.', '指数的这一位是 1：当前的平方项要乘进结果。']],
    ['sq', ['With p below 2³¹ every product stays below 2⁶², inside long long.', 'p 小于 2³¹ 时，每个乘积都小于 2⁶²，不会超出 long long。']],
    ['fermat', ['b^(p − 2), because b · b^(p − 2) = b^(p − 1) ≡ 1.', '取 b^(p − 2)，因为 b · b^(p − 2) = b^(p − 1) ≡ 1。']],
    ['done', ['a / b becomes a · b⁻¹, reduced modulo p after each multiplication.', 'a / b 变成 a · b⁻¹，每乘一次都对 p 取模。']],
  ],
  input: ['a b p — p is a prime below 2³¹ and b is not a multiple of p. Prints a / b modulo p: the number x with b · x ≡ a (mod p). (In the generator, n is the number of bits of p.)', 'a b p —— p 是小于 2³¹ 的质数，b 不是 p 的倍数。输出 a / b 模 p 的值：即满足 b · x ≡ a (mod p) 的数 x。（生成器中 n 表示 p 的二进制位数。）'],
  sizes: [4, 5, 6], lab: [4, 8, 16, 24, 30],
  gen(n, r) {
    const lo = Math.max(2, 2 ** (n - 1)), hi = Math.max(3, 2 ** n - 1)
    let p = r.int(lo, hi)
    while (!isPrimeN(p)) p = p >= hi ? lo : p + 1
    return `${r.int(1, Math.max(1, p - 1))} ${r.int(1, Math.max(1, p - 1))} ${p}\n`
  },
  broken: {
    from: 'long long inv = power(b, p - 2, p);  //@fermat', to: 'long long inv = power(b, p - 1, p);  //@fermat',
    why: ['Fermat\'s little theorem says b^(p − 1) ≡ 1. That is exactly why b^(p − 1) is __useless__ as an inverse: multiplying by it multiplies by 1. The inverse is the power one lower, b^(p − 2), because b · b^(p − 2) = b^(p − 1) ≡ 1. With p − 1 the program prints a mod p and never divides at all.', '费马小定理说 b^(p − 1) ≡ 1。正因为如此，b^(p − 1) 作为逆元__毫无用处__：乘以它就是乘以 1。逆元是低一次的幂 b^(p − 2)，因为 b · b^(p − 2) = b^(p − 1) ≡ 1。用 p − 1 时，程序输出的是 a mod p，根本没有做除法。'],
  },
  run(inp, t, bug = false) {
    const rd = reader(inp), a = rd.int(), b = rd.int(), p = rd.int()
    need(Number.isInteger(p) && p >= 2 && p < 2 ** 31 && isPrimeN(p), 'p must be a prime below 2³¹.', 'p 必须是小于 2³¹ 的质数。')
    need(Number.isInteger(a) && a >= 0 && Number.isInteger(b) && b > 0 && b % p !== 0, 'Need a ≥ 0, b > 0 and b not divisible by p.', '需要 a ≥ 0、b > 0，且 b 不是 p 的倍数。')
    const P = BigInt(p), e = p - (bug ? 1 : 2), bits = e.toString(2).split('').map(Number), n = bits.length
    // For a small p, the whole multiplication table row of b: every remainder appears once.
    const row = (hit?: number) => p <= 23 && grid(`${b} · x mod ${p}: every remainder 1 … ${p - 1} appears exactly once`, [span(1, p - 1), span(1, p - 1).map(x => (b % p) * x % p)], gt({ ok: hit === undefined ? [] : [[0, hit - 1], [1, hit - 1]] }), { rows: ['x', `${b} · x`] })
    let base = BigInt(b % p), res = 1n, k = 0
    const view = (tone: 'act' | 'cmp') => arr(`exponent p − 2 = ${e} in binary (bit k is at the right end)`, bits, tn({ dim: span(n - k, n - 1), [tone]: n - 1 - k }), undefined, { base: 0 })
    if (bug) t.s('fermat', () => [[`The program computes inv = ${b}^(${p} − 1) = ${b}^${e} mod ${p}.`, `程序计算 inv = ${b}^(${p} − 1) = ${b}^${e} mod ${p}。`], row(), vars({ a, b, p })])
    else t.s('fermat', () => [[`Dividing by ${b} modulo ${p} means multiplying by its inverse, and by Fermat the inverse is ${b}^(${p} − 2) = ${b}^${e} mod ${p}.`, `模 ${p} 意义下除以 ${b}，就是乘以它的逆元；由费马小定理，逆元是 ${b}^(${p} − 2) = ${b}^${e} mod ${p}。`], row(), vars({ a, b, p })])
    for (let x = e; x > 0; x = Math.floor(x / 2)) {
      if (x % 2 === 1) {
        const old = res
        res = res * base % P
        t.s('mul', () => [[`Bit ${k} is 1: res = ${old} × ${base} mod ${p} = ${res}.`, `第 ${k} 位是 1：res = ${old} × ${base} mod ${p} = ${res}。`], view('act'), vars({ 'b^(2^k)': String(base), res: String(res), k })])
      }
      const old = base
      base = base * base % P
      t.s('sq', () => [[`Square: ${old}² mod ${p} = ${base}, ready for bit ${k + 1}.`, `平方：${old}² mod ${p} = ${base}，为第 ${k + 1} 位做准备。`], view('cmp'), vars({ 'b^(2^k)': String(base), res: String(res), k: k + 1 })])
      k++
    }
    const inv = Number(res), ans = Number(BigInt(a % p) * res % P)
    if (bug) t.s('done', () => [[`inv = ${inv}. The program prints ${a} × ${inv} mod ${p} = ${ans}.`, `inv = ${inv}。程序输出 ${a} × ${inv} mod ${p} = ${ans}。`], row(), vars({ inverse: inv, answer: ans })])
    else t.s('done', () => [[`The inverse of ${b} is ${inv}: ${b} × ${inv} mod ${p} = 1. So a / b = ${a} × ${inv} mod ${p} = ${ans}.`, `${b} 的逆元是 ${inv}：${b} × ${inv} mod ${p} = 1。所以 a / b = ${a} × ${inv} mod ${p} = ${ans}。`], row(inv), vars({ inverse: inv, answer: ans })])
    t.out(ans)
  },
}

const egcd = (a: number, b: number): [number, number, number] => { if (!b) return [a, 1, 0]; const [g, x, y] = egcd(b, a % b); return [g, y, x - Math.floor(a / b) * y] }
const crt: Lesson = {
  id: 'crt', title: ['Chinese remainder theorem', '中国剩余定理'], level: 'S', cat: 'math', diff: 7,
  needs: ['exgcd'],
  blurb: ['Several remainders, one number: satisfy the conditions one at a time, each time stepping by the product of the moduli already dealt with.', '已知一个数除以几个数的余数，求这个数：一次满足一个条件，每次的步长是已处理过的各个模数的乘积。'],
  ideas: [
    ['If the moduli are pairwise coprime, the remainders determine exactly one number below the product of the moduli.', '如果各个模数两两互质，这些余数在小于模数之积的范围内恰好确定一个数。'],
    ['Keep a solution x of the conditions seen so far, and M, the product of their moduli. Every x + M · t is a solution too.', '维护一个满足已处理条件的解 x，以及这些条件的模数之积 M。所有的 x + M · t 也都是解。'],
    ['For the next condition x ≡ r (mod m), choose t so that x + M · t ≡ r (mod m).', '对下一个条件 x ≡ r (mod m)，选择 t 使得 x + M · t ≡ r (mod m)。'],
    ['That is M · t ≡ r − x (mod m), so t = (r − x) · M⁻¹ mod m. The inverse exists because M and m are coprime.', '也就是 M · t ≡ r − x (mod m)，所以 t = (r − x) · M⁻¹ mod m。因为 M 与 m 互质，这个逆元一定存在。'],
    ['m need not be prime, so the inverse comes from the extended Euclidean algorithm, not from Fermat.', 'm 不一定是质数，所以逆元要用扩展欧几里得算法来求，而不能用费马小定理。'],
  ],
  time: 'O(k log m)', space: 'O(1)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

long long exgcd(long long a, long long b, long long &x, long long &y) {
    if (!b) { x = 1; y = 0; return a; }
    long long g = exgcd(b, a % b, y, x);
    y -= a / b * x;
    return g;
}

int main() {
    int k;
    scanf("%d", &k);
    long long M = 1, x = 0;  // x satisfies every condition read so far, modulo M
    while (k--) {
        long long m, r, inv, tmp;
        scanf("%lld%lld", &m, &r);
        exgcd(M % m, m, inv, tmp);  //@inv
        long long t = ((r - x) % m * (inv % m) % m + m) % m;  //@step
        x += M * t;  //@merge
        M *= m;
    }
    printf("%lld\n", x);  //@done
}`,
  notes: [
    ['inv', ['inv satisfies M · inv ≡ 1 (mod m). It may come out negative.', 'inv 满足 M · inv ≡ 1 (mod m)。它可能是负数。']],
    ['step', ['Both factors are reduced modulo m first, and the final "+ m) % m" turns a negative remainder into a proper one.', '两个因子都先对 m 取模，最后的 “+ m) % m” 把负的余数变成正常的余数。']],
    ['merge', ['Adding a multiple of M keeps all earlier conditions true; t was chosen to make the new one true as well.', '加上 M 的倍数不会破坏之前的任何条件；而 t 的取值正好让新的条件也成立。']],
  ],
  input: ['k, then k lines "m r" meaning x ≡ r (mod m), with 0 ≤ r < m. The moduli are pairwise coprime and their product is at most 10¹⁵. Prints the smallest such x ≥ 0. (n is the number of conditions.)', 'k，随后 k 行 “m r”，表示 x ≡ r (mod m)，其中 0 ≤ r < m。各模数两两互质，乘积不超过 10¹⁵。输出满足所有条件的最小非负整数 x。（n 为条件的个数。）'],
  sizes: [2, 3, 4], lab: [2, 5, 9, 13],
  gen(n, r) {
    const ms = r.shuffle(n <= 4 ? [2, 3, 5, 7, 11] : PRIMES.slice(0, 13)).slice(0, n)
    return `${ms.length}\n` + ms.map(m => `${m} ${r.int(0, m - 1)}`).join('\n') + '\n'
  },
  broken: {
    from: 'long long t = ((r - x) % m * (inv % m) % m + m) % m;  //@step', to: 'long long t = (r - x) % m * (inv % m) % m;  //@step',
    why: ['In C++ the remainder of a negative number is __negative__: (−7) % 5 = −2. Both r − x and inv can be negative, so t may come out below 0. x + M · t still satisfies every condition, but it is no longer the smallest non-negative solution — it may even be negative. The final "+ m) % m" is what turns any remainder into one between 0 and m − 1.', '在 C++ 中，负数的余数是__负的__：(−7) % 5 = −2。r − x 和 inv 都可能是负数，所以 t 可能小于 0。x + M · t 仍然满足所有条件，但它不再是最小的非负解——甚至可能是负数。最后的 “+ m) % m” 正是把任何余数变到 0 到 m − 1 之间的那一步。'],
  },
  run(inp, t, bug = false) {
    const rd = reader(inp), k = rd.int(), cs = span(1, k).map(() => rd.ints(2))
    let prod = 1
    for (const [m, r] of cs) {
      need(Number.isInteger(m) && m >= 1 && Number.isInteger(r) && r >= 0 && r < m, 'Each line needs m ≥ 1 and 0 ≤ r < m.', '每一行须满足 m ≥ 1 且 0 ≤ r < m。')
      need(egcd(prod, m)[0] === 1, 'The moduli must be pairwise coprime.', '各个模数必须两两互质。')
      prod *= m
      need(prod <= 1e15, 'The product of the moduli must not exceed 10¹⁵.', '模数的乘积不能超过 10¹⁵。')
    }
    let M = 1, x = 0
    const table = (i: number, tone: Tone) => grid('conditions', cs.map(([m, r], j) => [`x ≡ ${r} (mod ${m})`, j < i || (j === i && tone === 'ok') ? x % m : '']), Object.fromEntries(cs.flatMap((c, j) => (j < i || (j === i && tone === 'ok') ? [[`${j},0`, 'ok' as Tone], [`${j},1`, 'ok' as Tone]] : j === i ? [[`${j},0`, tone]] : []))), { cols: ['condition', 'current x mod m'] })
    for (let i = 0; i < k; i++) {
      // The broken version keeps the coefficient exactly as exgcd returns it, possibly negative, as the C++ does.
      const [m, r] = cs[i], inv = bug ? egcd(M % m, m)[1] : ((egcd(M % m, m)[1] % m) + m) % m, x0 = x, M0 = M
      t.s('inv', () => [[`Next: x ≡ ${r} (mod ${m}). So far x = ${x0}, and x + ${M0} · t fits all earlier conditions. The inverse of ${M0} modulo ${m} is ${inv}.`, `下一个条件：x ≡ ${r} (mod ${m})。目前 x = ${x0}，而 x + ${M0} · t 满足之前的所有条件。${M0} 模 ${m} 的逆元是 ${inv}。`], table(i, 'act'), vars({ x: x0, M: M0 })])
      const tt = bug ? (((r - x) % m) * (inv % m)) % m : ((((r - x) % m) * inv) % m + m) % m
      t.s('step', () => [[`Need ${x0} + ${M0} · t ≡ ${r} (mod ${m}): t = (${r} − ${x0}) · ${inv} mod ${m} = ${tt}.`, `需要 ${x0} + ${M0} · t ≡ ${r} (mod ${m})：t = (${r} − ${x0}) · ${inv} mod ${m} = ${tt}。`], table(i, 'act'), vars({ x: x0, M: M0, t: tt })])
      x += M * tt; M *= m
      const x1 = x, M1 = M
      t.s('merge', () => [[`x = ${x0} + ${M0} · ${tt} = ${x1}. It now fits ${i + 1} condition${i ? 's' : ''}, and so does every x + ${M1} · t.`, `x = ${x0} + ${M0} · ${tt} = ${x1}。它现在满足前 ${i + 1} 个条件，所有的 x + ${M1} · t 也是如此。`], table(i, 'ok'), vars({ x: x1, M: M1 })])
    }
    const res = x
    if (bug) t.s('done', () => [[`The program prints x = ${res}.`, `程序输出 x = ${res}。`], table(k, 'ok'), vars({ answer: res })])
    else t.s('done', () => [[`The smallest solution is ${res}; all solutions are ${res} + ${M} · t.`, `最小的解是 ${res}；全部的解是 ${res} + ${M} · t。`], table(k, 'ok'), vars({ answer: res })])
    t.out(res)
  },
}

const binomialMod: Lesson = {
  id: 'binomial-mod', title: ['Binomial coefficients mod p', '组合数取模'], level: 'S', cat: 'math', diff: 6,
  needs: ['pascal', 'mod-inverse'],
  blurb: ['Precompute factorials and inverse factorials once; then every C(n, k) is two multiplications.', '把阶乘和阶乘的逆元预处理一次，之后每个 C(n, k) 只需两次乘法。'],
  ideas: [
    ['C(n, k) = n! / (k! · (n − k)!). Modulo a prime, the two divisions become multiplications by inverses.', 'C(n, k) = n! / (k! · (n − k)!)。在质数模下，两次除法变成乘以逆元。'],
    ['fact[i] = fact[i − 1] · i mod p, built upward in one loop.', 'fact[i] = fact[i − 1] · i mod p，一个循环从小到大算出。'],
    ['One fast exponentiation gives the inverse of the largest factorial.', '用一次快速幂求出最大的那个阶乘的逆元。'],
    ['Then walk downward: 1 / (i − 1)! = (1 / i!) · i. So all inverse factorials cost one inverse in total.', '然后从大到小推：1 / (i − 1)! = (1 / i!) · i。所以所有阶乘的逆元总共只需要求一次逆。'],
    ['The same two tables answer every counting formula made of factorials.', '凡是由阶乘组成的计数公式，都可以用这两张表来计算。'],
  ],
  time: 'O(n + log p + q)', space: 'O(n)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

const int N = 1000005;
long long p, fact[N], inv[N];

long long power(long long a, long long b) {
    long long res = 1;
    for (a %= p; b > 0; b >>= 1) {
        if (b & 1) res = res * a % p;
        a = a * a % p;
    }
    return res;
}

int main() {
    int q, top = 0;
    scanf("%d%lld", &q, &p);
    vector<pair<int, int>> ask(q);
    for (auto &[n, k] : ask) { scanf("%d%d", &n, &k); top = max(top, n); }
    fact[0] = 1;
    for (int i = 1; i <= top; i++) fact[i] = fact[i - 1] * i % p;  //@fact
    inv[top] = power(fact[top], p - 2);  //@last
    for (int i = top; i >= 1; i--) inv[i - 1] = inv[i] * i % p;  //@down
    for (auto [n, k] : ask)
        printf("%lld\n", k < 0 || k > n ? 0 : fact[n] * inv[k] % p * inv[n - k] % p);  //@query
}`,
  notes: [
    ['fact', ['i! = (i − 1)! · i, reduced modulo p at every step.', 'i! = (i − 1)! · i，每一步都对 p 取模。']],
    ['last', ['The only exponentiation in the program.', '整个程序里唯一的一次快速幂。']],
    ['down', ['Multiplying 1 / i! by i cancels the factor i: the result is 1 / (i − 1)!.', '1 / i! 乘以 i，约掉了因子 i：结果就是 1 / (i − 1)!。']],
    ['query', ['Choosing more than n out of n is impossible: 0 ways.', '从 n 个中选出多于 n 个是不可能的：方案数为 0。']],
  ],
  input: ['q p, then q lines "n k". p is a prime below 2³¹ and larger than every n (n ≤ 10⁶). Prints C(n, k) mod p for each line. (In the generator, n is the largest n asked.)', 'q p，随后 q 行 “n k”。p 是小于 2³¹ 的质数，并且比所有的 n 都大（n ≤ 10⁶）。对每一行输出 C(n, k) mod p。（生成器中 n 表示询问中最大的 n。）'],
  sizes: [6, 9, 12], lab: [10, 1000, 100000, 1000000],
  gen(n, r) {
    const p = n < 13 ? 13 : n < 31 ? 31 : 1000000007, q = n <= 30 ? 3 : 1000
    return `${q} ${p}\n${n} ${r.int(1, n - 1)}\n` + span(2, q).map(() => { const m = r.int(1, n); return `${m} ${r.int(0, 19) === 0 ? m + 1 : r.int(0, m)}` }).join('\n') + '\n'
  },
  broken: {
    from: 'inv[i - 1] = inv[i] * i % p;  //@down', to: 'inv[i - 1] = inv[i] * (i - 1) % p;  //@down',
    why: ['i! = (i − 1)! · i, so 1 / (i − 1)! = (1 / i!) · __i__: multiplying by i cancels the one factor that i! has and (i − 1)! does not. Multiplying by i − 1 cancels the wrong factor; worse, at i = 1 it multiplies by 0, so inv[0] becomes 0, and every C(n, 0) and C(n, n) comes out 0.', 'i! = (i − 1)! · i，所以 1 / (i − 1)! = (1 / i!) · __i__：乘以 i，正好约掉 i! 比 (i − 1)! 多出的那个因子。乘以 i − 1 约掉的是另一个因子；更糟的是，i = 1 时乘的是 0，于是 inv[0] 变成 0，所有的 C(n, 0) 和 C(n, n) 都算成了 0。'],
  },
  run(inp, t, bug = false) {
    const rd = reader(inp), q = rd.int(), p = rd.int()
    need(Number.isInteger(p) && p >= 2 && p < 2 ** 31 && isPrimeN(p), 'p must be a prime below 2³¹.', 'p 必须是小于 2³¹ 的质数。')
    const ask = span(1, q).map(() => rd.ints(2)), top = Math.max(0, ...ask.map(x => x[0]))
    need(ask.every(([n]) => Number.isInteger(n) && n >= 0) && top <= 1e6 && top < p, 'Need 0 ≤ n ≤ 10⁶ and n < p.', '需要 0 ≤ n ≤ 10⁶ 且 n < p。')
    const P = BigInt(p), mul = p < 9e7 ? (a: number, b: number) => a * b % p : (a: number, b: number) => Number(BigInt(a) * BigInt(b) % P)
    const fact = new Array<number>(top + 1).fill(0), inv = new Array<number>(top + 1).fill(0), out: number[] = []
    const cells = (a: number[], from: number, to: number) => a.map((v, i) => (i >= from && i <= to ? v : ''))
    const view = (fTo: number, iFrom: number, hiF: Tones = {}, hiI: Tones = {}) => [arr(`fact[i] = i! mod ${p}`, cells(fact, 0, fTo), hiF, undefined, { base: 0 }), arr(`inv[i] = 1 / i! mod ${p}`, cells(inv, iFrom, top), hiI, undefined, { base: 0 })] as const
    fact[0] = 1
    for (let i = 1; i <= top; i++) {
      fact[i] = mul(fact[i - 1], i)
      t.s('fact', () => [[`fact[${i}] = fact[${i - 1}] · ${i} = ${fact[i - 1]} · ${i} mod ${p} = ${fact[i]}.`, `fact[${i}] = fact[${i - 1}] · ${i} = ${fact[i - 1]} · ${i} mod ${p} = ${fact[i]}。`], ...view(i, top + 1, tn({ cmp: i - 1, act: i }))])
    }
    let res = 1, base = fact[top]
    for (let e = p - 2; e > 0; e = Math.floor(e / 2)) { t.tick(); if (e % 2) res = mul(res, base); base = mul(base, base) }
    inv[top] = res
    t.s('last', () => [[`inv[${top}] = fact[${top}]^(p − 2) = ${fact[top]}^${p - 2} mod ${p} = ${inv[top]}. Check: ${fact[top]} · ${inv[top]} mod ${p} = 1.`, `inv[${top}] = fact[${top}]^(p − 2) = ${fact[top]}^${p - 2} mod ${p} = ${inv[top]}。检验：${fact[top]} · ${inv[top]} mod ${p} = 1。`], ...view(top, top, tn({ cmp: top }), tn({ act: top }))])
    for (let i = top; i >= 1; i--) {
      if (!bug && i >= 2) t.ask(() => {
        const all = [i - 1, i, i + 1], rot = i % 3, opts = [...all.slice(rot), ...all.slice(0, rot)]
        return [[`inv[${i}] = 1 / ${i}! is known. inv[${i - 1}] = 1 / ${i - 1}! is inv[${i}] multiplied by what?`, `已知 inv[${i}] = 1 / ${i}!。inv[${i - 1}] = 1 / ${i - 1}! 等于 inv[${i}] 乘以多少？`], opts.map(x => [String(x), String(x)] as const), opts.indexOf(i)]
      })
      const f = bug ? i - 1 : i
      inv[i - 1] = mul(inv[i], f)
      t.s('down', () => [[`inv[${i - 1}] = inv[${i}] · ${f} = ${inv[i]} · ${f} mod ${p} = ${inv[i - 1]}.`, `inv[${i - 1}] = inv[${i}] · ${f} = ${inv[i]} · ${f} mod ${p} = ${inv[i - 1]}。`], ...view(top, i - 1, {}, tn({ cmp: i, act: i - 1 }))])
    }
    for (const [n, k] of ask) {
      const c = k < 0 || k > n ? 0 : mul(mul(fact[n], inv[k]), inv[n - k])
      out.push(c)
      t.s('query', () => [k < 0 || k > n ? [`C(${n}, ${k}) = 0: you cannot choose ${k} out of ${n}.`, `C(${n}, ${k}) = 0：从 ${n} 个中不可能选出 ${k} 个。`] : [`C(${n}, ${k}) = fact[${n}] · inv[${k}] · inv[${n - k}] = ${fact[n]} · ${inv[k]} · ${inv[n - k]} mod ${p} = ${c}.`, `C(${n}, ${k}) = fact[${n}] · inv[${k}] · inv[${n - k}] = ${fact[n]} · ${inv[k]} · ${inv[n - k]} mod ${p} = ${c}。`],
        ...view(top, 0, k < 0 || k > n ? {} : tn({ act: n }), k < 0 || k > n ? {} : tn({ act: [k, n - k] })), arr('answers', out.slice(0, 16))])
    }
    t.out(out.join('\n'))
  },
}

const inclExcl: Lesson = {
  id: 'incl-excl', title: ['Inclusion–exclusion', '容斥原理'], level: 'S', cat: 'math', diff: 7,
  needs: ['bitmask-dp'],
  blurb: ['To count the union of overlapping sets: add the single sets, subtract the pairs, add the triples, … One term for every subset.', '求若干个互相重叠的集合的并集大小：加上单个集合，减去两两的交，加上三个的交……每个子集对应一项。'],
  ideas: [
    ['Numbers divisible by 2 or by 3: adding the two counts takes the multiples of 6 twice, so subtract them once.', '能被 2 或 3 整除的数：把两个个数相加，6 的倍数被算了两次，所以要减掉一次。'],
    ['In general, the size of a union is the sum over all non-empty groups of sets of ± the size of their intersection: + for an odd group, − for an even one.', '一般地，并集的大小等于对所有非空的集合组合求和：± 它们交集的大小，奇数个集合取 +，偶数个取 −。'],
    ['Here the intersection is easy: the numbers up to n divisible by all primes of a group number ⌊n / product⌋.', '这里交集很好算：不超过 n 且能被一组质数全部整除的数，共有 ⌊n / 乘积⌋ 个。'],
    ['The groups are the non-empty subsets of the k primes: enumerate them as bitmasks 1 … 2ᵏ − 1.', '这些组合就是 k 个质数的所有非空子集：用二进制掩码 1 … 2ᵏ − 1 来枚举。'],
    ['The cost is 2ᵏ terms, so the principle is practical only for a small number of conditions.', '代价是 2ᵏ 项，所以只有条件个数较少时容斥才实用。'],
  ],
  time: 'O(2ᵏ · k)', space: 'O(k)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int main() {
    long long n, p[20];
    int k;
    scanf("%lld%d", &n, &k);
    for (int i = 0; i < k; i++) scanf("%lld", &p[i]);
    long long ans = 0;
    for (int mask = 1; mask < (1 << k); mask++) {  //@mask
        long long prod = 1;
        int bits = 0;
        for (int i = 0; i < k; i++)
            if (mask >> i & 1) {
                bits++;
                if (prod > n / p[i]) { prod = n + 1; break; }  //@big
                prod *= p[i];
            }
        if (bits & 1) ans += n / prod;  //@add
        else ans -= n / prod;  //@sub
    }
    printf("%lld\n", ans);  //@done
}`,
  notes: [
    ['mask', ['Bit i of mask says whether prime i is in the group. 0 is skipped: the empty group is not a term.', 'mask 的第 i 位表示第 i 个质数是否在这一组里。跳过 0：空的组合不是一项。']],
    ['big', ['The product would exceed n, so no number up to n is divisible by it. Stop before it overflows.', '乘积将会超过 n，所以不超过 n 的数里没有它的倍数。要在溢出之前就停下。']],
    ['add', ['An odd number of primes: these numbers are added.', '奇数个质数：这些数要加上。']],
    ['sub', ['An even number of primes: these numbers were counted too often and are subtracted.', '偶数个质数：这些数被多算了，要减掉。']],
  ],
  input: ['n k, then k different primes (k ≤ 20, n ≤ 10¹⁵). Prints how many of the integers 1 … n are divisible by at least one of the primes. (In the generator, n is the number of primes.)', 'n k，随后是 k 个不同的质数（k ≤ 20，n ≤ 10¹⁵）。输出 1 … n 中至少能被其中一个质数整除的整数的个数。（生成器中 n 表示质数的个数。）'],
  sizes: [2, 3, 4], lab: [4, 8, 12, 16, 20],
  gen(n, r) {
    const ps = r.shuffle(PRIMES.slice(0, n <= 6 ? 6 : 20)).slice(0, Math.min(n, 20)).sort((a, b) => a - b)
    return `${n <= 6 ? r.int(30, 200) : r.int(1000000000, 1000000000000)} ${ps.length}\n${ps.join(' ')}\n`
  },
  broken: {
    from: 'else ans -= n / prod;  //@sub', to: 'else ans += n / prod;  //@sub',
    why: ['Adding every intersection counts a number divisible by two of the primes three times — once for each prime and once for the pair — instead of once. The signs __alternate__ precisely to undo that: a number divisible by exactly j of the primes appears in C(j, 1) − C(j, 2) + C(j, 3) − … = 1 terms. Without the minus sign the program counts far too many.', '把所有交集都加上，一个能被两个质数整除的数会被数三次——两个质数各一次，这一对再一次——而不是一次。符号__交替__正是为了抵消这一点：恰好能被其中 j 个质数整除的数，出现在 C(j, 1) − C(j, 2) + C(j, 3) − … = 1 项中。去掉减号后，程序数出的个数大大偏多。'],
  },
  run(inp, t, bug = false) {
    const rd = reader(inp), n = rd.int(), k = rd.int()
    need(Number.isInteger(n) && n >= 1 && n <= 1e15 && Number.isInteger(k) && k >= 1 && k <= 20, 'Need 1 ≤ n ≤ 10¹⁵ and 1 ≤ k ≤ 20.', '需要 1 ≤ n ≤ 10¹⁵ 且 1 ≤ k ≤ 20。')
    const p = rd.ints(k), rows: (string | number)[][] = []
    need(new Set(p).size === k && p.every(isPrimeN), 'The k numbers must be different primes.', '这 k 个数必须是互不相同的质数。')
    let ans = 0
    const table = (tone: Tone) => grid('one term per group of primes', rows.slice(-12), gt({ [tone]: span(0, 4).map(c => [Math.min(rows.length, 12) - 1, c] as [number, number]) }), { cols: ['group', 'product', 'sign', '⌊n / product⌋', 'total'] })
    for (let mask = 1; mask < 1 << k; mask++) {
      let prod = 1, bits = 0
      const group: number[] = []
      for (let i = 0; i < k; i++) if (mask >> i & 1) {
        bits++; group.push(p[i]); t.tick()
        if (prod > Math.floor(n / p[i])) { prod = n + 1; break }
        prod *= p[i]
      }
      const cnt = Math.floor(n / prod), odd = bits % 2 === 1
      if (!bug && mask > 1) t.ask(() => [[`The group {${group.join(', ')}} has ${bits} prime${bits === 1 ? '' : 's'}. Is its term added or subtracted?`, `组合 {${group.join(', ')}} 有 ${bits} 个质数。这一项是加还是减？`], [['added', '加上'], ['subtracted', '减去']], odd ? 0 : 1])
      ans += odd || bug ? cnt : -cnt
      if (t.on) rows.push([`{${group.join(', ')}}`, prod > n ? `> ${n}` : prod, odd || bug ? '+' : '−', cnt, ans])
      const total = ans
      if (bug) t.s(odd ? 'add' : 'sub', () => [[`${group.length === 1 ? `Multiples of ${group[0]}` : `Multiples of all of ${group.join(', ')}`} up to ${n}: ${cnt}. Add them. Total ${total}.`, `不超过 ${n} 的数中，${group.length === 1 ? `${group[0]} 的倍数` : `同时是 ${group.join('、')} 的倍数的数`}有 ${cnt} 个。加上。合计 ${total}。`], table('ok'), vars({ n, mask: mask.toString(2).padStart(k, '0'), total })])
      else t.s(odd ? 'add' : 'sub', () => [[`${group.length === 1 ? `Multiples of ${group[0]}` : `Multiples of all of ${group.join(', ')}`} up to ${n}: ${cnt}. ${bits} prime${bits === 1 ? '' : 's'} — ${odd ? 'odd, add' : 'even, subtract'}. Total ${total}.`, `不超过 ${n} 的数中，${group.length === 1 ? `${group[0]} 的倍数` : `同时是 ${group.join('、')} 的倍数的数`}有 ${cnt} 个。共 ${bits} 个质数——${odd ? '奇数个，加上' : '偶数个，减去'}。合计 ${total}。`], table(odd ? 'ok' : 'bad'), vars({ n, mask: mask.toString(2).padStart(k, '0'), total })])
    }
    const res = ans
    if (bug) t.s('done', () => [[`The program prints ${res}.`, `程序输出 ${res}。`], vars({ answer: res })])
    else t.s('done', () => [[`${res} of the numbers 1 … ${n} are divisible by at least one of ${p.join(', ')}.`, `1 … ${n} 中有 ${res} 个数至少能被 ${p.join('、')} 中的一个整除。`], vars({ answer: res })])
    t.out(res)
  },
}

type M2 = [bigint, bigint, bigint, bigint]
const MOD9 = 1000000007n
const mul2 = (x: M2, y: M2): M2 => [(x[0] * y[0] + x[1] * y[2]) % MOD9, (x[0] * y[1] + x[1] * y[3]) % MOD9, (x[2] * y[0] + x[3] * y[2]) % MOD9, (x[2] * y[1] + x[3] * y[3]) % MOD9]
const show2 = (name: string, m: M2, tone?: Tone) => grid(name, [[String(m[0]), String(m[1])], [String(m[2]), String(m[3])]], tone ? gt({ [tone]: [[0, 0], [0, 1], [1, 0], [1, 1]] }) : undefined)
const matrixPower: Lesson = {
  id: 'matrix-power', title: ['Fast matrix power: Fibonacci', '矩阵快速幂：斐波那契数'], level: 'S', cat: 'math', diff: 6,
  needs: ['fast-pow'],
  blurb: ['One step of a linear recurrence is a multiplication by a fixed matrix, so n steps are that matrix to the power n — and powers can be computed by squaring.', '线性递推的一步相当于乘上一个固定的矩阵，所以 n 步就是这个矩阵的 n 次幂——而幂可以用反复平方来算。'],
  ideas: [
    ['The pair (F(n + 1), F(n)) turns into (F(n + 2), F(n + 1)) by a fixed rule that only adds and copies.', '数对 (F(n + 1), F(n)) 按一条固定的规则变成 (F(n + 2), F(n + 1))，这条规则只有相加和照抄。'],
    ['Such a rule is a matrix: [[1, 1], [1, 0]] times the column (F(n + 1), F(n)) gives the next column.', '这样的规则就是一个矩阵：[[1, 1], [1, 0]] 乘以列向量 (F(n + 1), F(n))，得到下一个列向量。'],
    ['Applying it n times is multiplying by the matrix n times: by its n-th power.', '把它作用 n 次，就是乘上这个矩阵 n 次：也就是乘上它的 n 次幂。'],
    ['Matrix multiplication is associative, so fast exponentiation works unchanged — with the identity matrix in place of 1.', '矩阵乘法满足结合律，所以快速幂可以原封不动地使用——只是把 1 换成单位矩阵。'],
    ['About log₂ n matrix products of constant size, instead of n additions.', '大约 log₂ n 次固定大小的矩阵乘法，取代了 n 次加法。'],
  ],
  time: 'O(log n)', space: 'O(1)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

typedef long long ll;
const ll MOD = 1e9 + 7;
struct Mat { ll a[2][2]; };

Mat mul(const Mat& x, const Mat& y) {
    Mat z;
    for (int i = 0; i < 2; i++)
        for (int j = 0; j < 2; j++)
            z.a[i][j] = (x.a[i][0] * y.a[0][j] + x.a[i][1] * y.a[1][j]) % MOD;  //@cell
    return z;
}

int main() {
    ll n;
    scanf("%lld", &n);
    Mat res = {{{1, 0}, {0, 1}}}, m = {{{1, 1}, {1, 0}}};  //@init
    for (; n > 0; n >>= 1) {
        if (n & 1) res = mul(res, m);  //@mul
        m = mul(m, m);  //@sq
    }
    printf("%lld\n", res.a[0][1]);  //@done
}`,
  notes: [
    ['cell', ['Row i of x times column j of y. Two products below 10¹⁸ each still fit in long long together.', 'x 的第 i 行乘以 y 的第 j 列。两个都小于 10¹⁸ 的乘积相加，仍在 long long 范围内。']],
    ['init', ['res starts as the identity matrix, which changes nothing when multiplied — the matrix "1".', 'res 的初值是单位矩阵，乘上它什么都不变——它就是矩阵里的 “1”。']],
    ['mul', ['The lowest bit of n is 1: this power of m belongs in the answer.', 'n 的最低位是 1：m 的这一个幂要乘进答案。']],
    ['done', ['The n-th power is [[F(n + 1), F(n)], [F(n), F(n − 1)]].', 'n 次幂等于 [[F(n + 1), F(n)], [F(n), F(n − 1)]]。']],
  ],
  input: ['n (0 ≤ n ≤ 10¹⁵). Prints the Fibonacci number F(n) modulo 1 000 000 007, where F(0) = 0 and F(1) = 1. (In the generator, n is the number of bits of n.)', 'n（0 ≤ n ≤ 10¹⁵）。输出斐波那契数 F(n) 对 1 000 000 007 取模的值，其中 F(0) = 0，F(1) = 1。（生成器中 n 表示 n 的二进制位数。）'],
  sizes: [3, 4, 5], lab: [4, 8, 16, 32, 50],
  gen(n, r) {
    let b = 1
    for (let i = 1; i < n; i++) b = b * 2 + r.int(0, 1)
    return `${b}\n`
  },
  broken: {
    from: 'printf("%lld\\n", res.a[0][1]);  //@done', to: 'printf("%lld\\n", res.a[0][0]);  //@done',
    why: ['Mⁿ = [[F(n + 1), F(n)], [F(n), F(n − 1)]]: the top-left entry is __one step ahead__. F(n) sits off the diagonal, in a[0][1] (or a[1][0]). Printing a[0][0] gives F(n + 1) — for n = 5 the program prints 8 instead of 5.', 'Mⁿ = [[F(n + 1), F(n)], [F(n), F(n − 1)]]：左上角那一项__多走了一步__。F(n) 在对角线之外，在 a[0][1]（或 a[1][0]）。输出 a[0][0] 得到的是 F(n + 1)——n = 5 时程序输出 8 而不是 5。'],
  },
  run(inp, t, bug = false) {
    const N = reader(inp).int()
    need(Number.isInteger(N) && N >= 0 && N <= 1e15, 'n must be between 0 and 10¹⁵.', 'n 须在 0 到 10¹⁵ 之间。')
    const bits = N.toString(2).split('').map(Number), len = bits.length
    let res: M2 = [1n, 0n, 0n, 1n], m: M2 = [1n, 1n, 1n, 0n], k = 0
    const bar = (tone: 'act' | 'cmp') => arr('n in binary (bit k is at the right end)', bits, tn({ dim: span(len - k, len - 1), [tone]: len - 1 - k }), undefined, { base: 0 })
    t.s('init', () => [['res = the identity matrix; m = [[1, 1], [1, 0]], the matrix of one Fibonacci step.', 'res = 单位矩阵；m = [[1, 1], [1, 0]]，即斐波那契递推一步所对应的矩阵。'], bar('cmp'), show2('res', res), show2('m', m)])
    for (let x = N; x > 0; x = Math.floor(x / 2)) {
      if (x % 2 === 1) {
        res = mul2(res, m)
        const r0 = res
        t.s('mul', () => [[`Bit ${k} is 1: res = res · m.`, `第 ${k} 位是 1：res = res · m。`], bar('act'), show2('res', r0, 'act'), show2(`m = M^${2 ** k}`, m)])
      }
      m = mul2(m, m)
      const m0 = m
      t.s('sq', () => [[`Square m: it is now M^${2 ** (k + 1)}, ready for bit ${k + 1}.`, `把 m 平方：它现在是 M^${2 ** (k + 1)}，为第 ${k + 1} 位做准备。`], bar('cmp'), show2('res', res), show2(`m = M^${2 ** (k + 1)}`, m0, 'cmp')])
      k++
    }
    const ans = bug ? res[0] : res[1]
    if (bug) t.s('done', () => [[`res = M^${N}; the program prints res.a[0][0] = ${ans}.`, `res = M^${N}；程序输出 res.a[0][0] = ${ans}。`], grid('res', [[String(res[0]), String(res[1])], [String(res[2]), String(res[3])]], gt({ ok: [[0, 0]] })), vars({ answer: String(ans) })])
    else t.s('done', () => [[`res = M^${N} = [[F(n+1), F(n)], [F(n), F(n−1)]], so F(${N}) = ${ans}.`, `res = M^${N} = [[F(n+1), F(n)], [F(n), F(n−1)]]，所以 F(${N}) = ${ans}。`], grid('res', [[String(res[0]), String(res[1])], [String(res[2]), String(res[3])]], gt({ ok: [[0, 1]] })), vars({ answer: String(ans) })])
    t.out(ans)
  },
}

const mulmodN = (a: number, b: number, p: number) => (a * (b >>> 16) % p * 65536 + a * (b & 65535)) % p
const xorBasis: Lesson = {
  id: 'xor-basis', title: ['Linear basis (XOR basis)', '线性基'], level: 'N', cat: 'math', diff: 9,
  needs: ['gauss'],
  blurb: ['Boil n numbers down to at most 60 that produce exactly the same XOR values — then the largest XOR is found greedily, bit by bit.', '把 n 个数浓缩成至多 60 个数，它们能异或出的值与原来完全一样——之后从高位到低位贪心，就能得到最大的异或和。'],
  ideas: [
    ['Treat a number as a vector of bits. XOR is then addition of vectors, without carries.', '把一个数看成由二进制位组成的向量。异或就是不进位的向量加法。'],
    ['A basis is a small set of numbers whose XOR combinations are exactly the XOR combinations of all the given numbers.', '线性基是一小组数，它们能异或出的值，恰好就是所有给定的数能异或出的值。'],
    ['Keep at most one basis number for each bit position: p[i] has its highest 1 at bit i.', '每个二进制位上至多保留一个数：p[i] 的最高位的 1 在第 i 位。'],
    ['To insert x, scan its bits from the top. If bit i is 1 and p[i] is empty, store x there. Otherwise XOR x with p[i], which clears that bit, and go on.', '插入 x 时，从高位到低位扫描。如果第 i 位是 1 而 p[i] 为空，就把 x 存进去。否则让 x 异或上 p[i]，把这一位消掉，然后继续。'],
    ['If x becomes 0, it was already a combination of the basis and adds nothing.', '如果 x 变成了 0，说明它本来就能由线性基中的数异或得到，不带来任何新东西。'],
  ],
  time: 'O(n · 60)', space: 'O(60)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

long long p[61];  // p[i]: the basis number whose highest 1 is bit i, or 0

void insert(long long x) {
    for (int i = 60; i >= 0; i--) {
        if (!(x >> i & 1)) continue;
        if (!p[i]) { p[i] = x; return; }  //@keep
        x ^= p[i];  //@reduce
    }
}  //@zero

int main() {
    int n;
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        long long x;
        scanf("%lld", &x);
        insert(x);
    }
    long long ans = 0;
    for (int i = 60; i >= 0; i--)
        if ((ans ^ p[i]) > ans) ans ^= p[i];  //@max
    printf("%lld\n", ans);  //@done
}`,
  notes: [
    ['keep', ['No basis number starts at this bit yet: x fills the gap.', '还没有哪个基中的数以这一位为最高位：x 正好填上这个空缺。']],
    ['reduce', ['p[i] also has bit i set, so the XOR clears it. What x can combine to is unchanged.', 'p[i] 的第 i 位也是 1，所以异或之后这一位被消掉。x 能参与异或出的值并不会因此改变。']],
    ['zero', ['x was reduced to 0: it is a combination of numbers already in the basis.', 'x 被消成了 0：它可以由基中已有的数异或得到。']],
    ['max', ['Taking p[i] can only change bits i and below. If it makes the answer larger, it sets bit i, which outweighs everything lower.', '选用 p[i] 只会改变第 i 位及更低的位。如果它能让答案变大，就说明它把第 i 位变成了 1，这比所有更低的位加起来都重要。']],
  ],
  input: ['n, then n integers from 0 to 2⁵⁰. Prints the largest value obtainable as the XOR of some of them.', 'n，随后 n 个 0 到 2⁵⁰ 之间的整数。从中选出若干个数，输出它们的异或和的最大值。'],
  sizes: [3, 4, 5], lab: [10, 1000, 20000, 100000],
  gen: (n, r) => `${n}\n${span(1, n).map(() => (n <= 30 ? r.int(1, 31) : Math.floor(r.next() * 2 ** 50))).join(' ')}\n`,
  broken: {
    from: 'if ((ans ^ p[i]) > ans) ans ^= p[i];  //@max', to: 'if (p[i]) ans ^= p[i];  //@max',
    why: ['XOR can clear bits as well as set them. p[i] always has bit i set, and if the answer already has bit i set — because a higher basis number brought it along — taking p[i] __clears__ it, and no lower bits can make up for that. Taking every basis number ignores this, so the result is a possible XOR but not the largest.', '异或既能把某一位变成 1，也能把它变成 0。p[i] 的第 i 位一定是 1，如果答案的第 i 位已经是 1——因为某个更高的基中的数顺带把它带了进来——再选 p[i] 就会把它__清掉__，而更低的位加起来也补不回来。把基中的每个数都选上，就忽略了这一点，得到的是一个能异或出的值，却不是最大的。'],
  },
  run(inp, t, bug = false) {
    const rd = reader(inp), n = rd.int(), xs = span(1, n).map(() => rd.str())
    need(xs.every(s => /^\d+$/.test(s) && BigInt(s) <= 1n << 60n), 'The numbers must be integers between 0 and 2⁶⁰.', '这些数必须是 0 到 2⁶⁰ 之间的整数。')
    const a = xs.map(BigInt), p = new Array<bigint>(61).fill(0n)
    const W = Math.max(1, ...a.map(x => x.toString(2).length)), bin = (x: bigint) => x.toString(2).padStart(W, '0')
    const basis = (hi: number, tone: Tone) => grid('basis: p[i] has its highest 1 at bit i', span(0, W - 1).map(k => [p[W - 1 - k] ? bin(p[W - 1 - k]) : '']), hi < 0 ? undefined : { [`${W - 1 - hi},0`]: tone }, { rows: span(0, W - 1).map(k => 'p[' + (W - 1 - k) + ']') })
    const list = (i: number) => arr('numbers', a.map(bin), tn({ dim: span(0, i - 1), act: i }))
    for (let j = 0; j < n; j++) {
      let x = a[j], kept = false
      for (let i = 60; i >= 0; i--) {
        if (!((x >> BigInt(i)) & 1n)) continue
        t.tick()
        if (!p[i]) {
          p[i] = x; kept = true
          const v = x
          t.s('keep', () => [[`${bin(v)} has its highest 1 at bit ${i}, and p[${i}] is empty: keep it there.`, `${bin(v)} 的最高位的 1 在第 ${i} 位，而 p[${i}] 为空：把它存进去。`], list(j), basis(i, 'ok'), vars({ x: bin(v) })])
          break
        }
        const old = x
        x ^= p[i]
        const v = x
        t.s('reduce', () => [[`Bit ${i} of ${bin(old)} is 1 and p[${i}] = ${bin(p[i])}: XOR them, leaving ${bin(v)}.`, `${bin(old)} 的第 ${i} 位是 1，而 p[${i}] = ${bin(p[i])}：异或之后剩下 ${bin(v)}。`], list(j), basis(i, 'cmp'), vars({ x: bin(v) })])
      }
      if (!kept) t.s('zero', () => [[`${bin(a[j])} has been reduced to 0: it is a combination of the basis, and is not needed.`, `${bin(a[j])} 被消成了 0：它能由基中的数异或得到，不需要保留。`], list(j), basis(-1, 'ok'), vars({ x: bin(0n) })])
    }
    let ans = 0n
    for (let i = 60; i >= 0; i--) {
      if (!p[i]) continue
      const old = ans, take = bug || (ans ^ p[i]) > ans
      if (!bug) t.ask(() => [[`The answer so far is ${bin(old)}, and p[${i}] = ${bin(p[i])}. Is p[${i}] taken?`, `目前的答案是 ${bin(old)}，p[${i}] = ${bin(p[i])}。要选 p[${i}] 吗？`], [['yes', '选'], ['no', '不选']], take ? 0 : 1])
      if (take) ans ^= p[i]
      const v = ans
      if (bug) t.s('max', () => [[`p[${i}] = ${bin(p[i])}: ${bin(old)} xor p[${i}] = ${bin(v)}.`, `p[${i}] = ${bin(p[i])}：${bin(old)} xor p[${i}] = ${bin(v)}。`], basis(i, 'ok'), vars({ answer: bin(v) })])
      else t.s('max', () => [take ? [`p[${i}] = ${bin(p[i])}: taking it turns ${bin(old)} into ${bin(v)}, which is larger. Take it.`, `p[${i}] = ${bin(p[i])}：选它能把 ${bin(old)} 变成 ${bin(v)}，变大了。选上。`] : [`p[${i}] = ${bin(p[i])}: bit ${i} of the answer is already 1, taking it would clear it. Skip.`, `p[${i}] = ${bin(p[i])}：答案的第 ${i} 位已经是 1，选它反而会把这一位消掉。跳过。`], basis(i, take ? 'ok' : 'dim'), vars({ answer: bin(v) })])
    }
    const res = ans
    t.s('done', () => [bug ? [`The program prints ${bin(res)} = ${res}.`, `程序输出 ${bin(res)} = ${res}。`] : [`The largest XOR is ${bin(res)} = ${res}.`, `最大的异或和是 ${bin(res)} = ${res}。`], basis(-1, 'ok'), vars({ answer: String(res) })])
    t.out(res)
  },
}

const bsgs: Lesson = {
  id: 'bsgs', title: ['Baby-step giant-step', '大步小步算法（BSGS）'], level: 'N', cat: 'math', diff: 8,
  needs: ['hash-table', 'mod-inverse'],
  blurb: ['To solve aˣ ≡ b (mod p), write x = i · m − j with m ≈ √p. Store the m small steps in a hash table, then take m big steps and look each one up.', '要解 aˣ ≡ b (mod p)，把 x 写成 i · m − j，其中 m ≈ √p。把 m 个“小步”存进哈希表，再走 m 个“大步”，每一步都去表里查一查。'],
  ideas: [
    ['The powers of a repeat with a period dividing p − 1, so if a solution exists, one lies in 0 … p − 1.', 'a 的幂会循环，周期整除 p − 1，所以如果有解，就一定有一个解在 0 … p − 1 之间。'],
    ['Trying every x costs p steps. Split x into two parts instead: x = i · m − j with 0 ≤ j < m and 1 ≤ i ≤ m.', '逐个尝试 x 需要 p 步。换个办法，把 x 拆成两部分：x = i · m − j，其中 0 ≤ j < m，1 ≤ i ≤ m。'],
    ['Then aˣ ≡ b becomes a^(i·m) ≡ b · aʲ: the unknowns i and j are on different sides.', '于是 aˣ ≡ b 变成 a^(i·m) ≡ b · aʲ：未知数 i 和 j 被分到了等号的两边。'],
    ['Baby steps: store b · aʲ for every j in a hash table. Giant steps: compute a^(i·m) for i = 1, 2, … and look for it in the table.', '小步：把每个 j 对应的 b · aʲ 存进哈希表。大步：依次计算 i = 1, 2, … 时的 a^(i·m)，并到表里去找。'],
    ['The first hit gives the smallest x, provided the table keeps the largest j for each value.', '只要哈希表里对每个值保留最大的 j，第一次命中得到的就是最小的 x。'],
  ],
  time: 'O(√p)', space: 'O(√p)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int main() {
    long long a, b, p;
    scanf("%lld%lld%lld", &a, &b, &p);
    a %= p; b %= p;
    if (b == 1 % p) { puts("0"); return 0; }  //@zero
    long long m = 1;
    while (m * m < p) m++;  //@size
    unordered_map<long long, long long> tab;
    long long cur = b;
    for (long long j = 0; j < m; j++) { tab[cur] = j; cur = cur * a % p; }  //@baby
    long long am = 1;
    for (long long j = 0; j < m; j++) am = am * a % p;  //@step
    cur = 1;
    for (long long i = 1; i <= m; i++) {
        cur = cur * am % p;  //@giant
        if (tab.count(cur)) { printf("%lld\n", i * m - tab[cur]); return 0; }  //@hit
    }
    puts("-1");  //@none
}`,
  notes: [
    ['zero', ['a⁰ = 1, so x = 0 works. The search below only finds x ≥ 1.', 'a⁰ = 1，所以 x = 0 就是解。下面的搜索只能找到 x ≥ 1 的解。']],
    ['size', ['m is the smallest integer with m² ≥ p, so i · m − j reaches every x from 1 to p.', 'm 是满足 m² ≥ p 的最小整数，这样 i · m − j 能取遍 1 到 p 的每个 x。']],
    ['baby', ['A later j overwrites an earlier one with the same value: the table keeps the largest j, which gives the smallest x.', '值相同时，后面的 j 会覆盖前面的：表里保留的是最大的 j，对应最小的 x。']],
    ['step', ['One giant step multiplies by aᵐ.', '每走一大步，就是乘上一个 aᵐ。']],
    ['hit', ['a^(i·m) = b · aʲ. Since a has an inverse modulo p, this means a^(i·m − j) = b.', 'a^(i·m) = b · aʲ。由于 a 在模 p 下有逆元，这就意味着 a^(i·m − j) = b。']],
  ],
  input: ['a b p — p is a prime below 2³¹ and a is not a multiple of p. Prints the smallest x ≥ 0 with aˣ ≡ b (mod p), or −1 if there is none. (In the generator, n is the number of bits of p.)', 'a b p —— p 是小于 2³¹ 的质数，a 不是 p 的倍数。输出满足 aˣ ≡ b (mod p) 的最小非负整数 x，无解则输出 −1。（生成器中 n 表示 p 的二进制位数。）'],
  sizes: [4, 5, 6], lab: [4, 8, 16, 24, 30],
  gen(n, r) {
    const lo = Math.max(3, 2 ** (n - 1)), hi = Math.max(5, 2 ** n - 1)
    let p = r.int(lo, hi)
    while (!isPrimeN(p)) p = p >= hi ? lo : p + 1
    const a = r.int(2, p - 1)
    let b = r.int(1, p - 1)
    if (r.int(0, 3)) { b = 1; for (let k = r.int(1, Math.min(p - 2, 200)); k > 0; k--) b = mulmodN(b, a, p) }
    return `${a} ${b} ${p}\n`
  },
  broken: {
    from: 'printf("%lld\\n", i * m - tab[cur]);', to: 'printf("%lld\\n", i * m + tab[cur]);',
    why: ['A hit means a^(i·m) = b · aʲ. Dividing both sides by aʲ gives a^(i·m − j) = b, so the exponent is i·m __minus__ j: the baby steps multiplied b by a, which moves the target forward, and that has to be taken back. With + j the printed x is 2j too large whenever j > 0.', '命中意味着 a^(i·m) = b · aʲ。两边同时除以 aʲ，得到 a^(i·m − j) = b，所以指数是 i·m __减去__ j：小步是在 b 上乘 a，相当于把目标往前推了，现在要退回来。写成 + j 时，只要 j > 0，输出的 x 就大了 2j。'],
  },
  run(inp, t, bug = false) {
    const rd = reader(inp), a0 = rd.int(), b0 = rd.int(), p = rd.int()
    need(Number.isInteger(p) && p >= 2 && p < 2 ** 31 && isPrimeN(p), 'p must be a prime below 2³¹.', 'p 必须是小于 2³¹ 的质数。')
    need(Number.isInteger(a0) && Number.isInteger(b0) && a0 >= 0 && b0 >= 0 && a0 % p !== 0, 'Need a, b ≥ 0 and a not divisible by p.', '需要 a, b ≥ 0，且 a 不是 p 的倍数。')
    const a = a0 % p, b = b0 % p
    if (b === 1 % p) { t.s('zero', () => [[`b = 1 and a⁰ = 1: the answer is 0.`, `b = 1，而 a⁰ = 1：答案是 0。`], vars({ a, b, p, answer: 0 })]); t.out(0); return }
    let m = 1
    while (m * m < p) m++
    const tab = new Map<number, number>(), small = m <= 16, js: number[] = [], vals: number[] = []
    const baby = (hit = -1) => small && grid(`baby steps: b · aʲ mod ${p}`, [js, vals], gt({ ok: hit < 0 ? [] : [[0, hit], [1, hit]] }), { rows: ['j', 'b · aʲ'] })
    t.s('size', () => [[`m = ${m} is the smallest number with m² ≥ ${p}. Write x = i · ${m} − j with 0 ≤ j < ${m} and 1 ≤ i ≤ ${m}.`, `m = ${m} 是满足 m² ≥ ${p} 的最小的数。把 x 写成 i · ${m} − j，其中 0 ≤ j < ${m}，1 ≤ i ≤ ${m}。`], vars({ a, b, p, m })])
    let cur = b
    for (let j = 0; j < m; j++) {
      tab.set(cur, j)
      if (small) { js.push(j); vals.push(cur) }
      const v = cur
      t.s('baby', () => [[`Baby step j = ${j}: b · a^${j} = ${v}. Store it.`, `小步 j = ${j}：b · a^${j} = ${v}。存进表里。`], baby(j), vars({ a, b, p, m })])
      cur = mulmodN(cur, a, p)
    }
    let am = 1
    for (let j = 0; j < m; j++) { am = mulmodN(am, a, p); t.tick() }
    t.s('step', () => [[`One giant step multiplies by a^${m} = ${am}.`, `每一大步乘上 a^${m} = ${am}。`], baby(), vars({ 'a^m': am, m })])
    cur = 1
    for (let i = 1; i <= m; i++) {
      cur = mulmodN(cur, am, p)
      const v = cur, j = tab.get(cur)
      if (j !== undefined) {
        const x = bug ? i * m + j : i * m - j
        if (bug) t.s('hit', () => [[`Giant step i = ${i}: a^${i * m} = ${v}, which is in the table at j = ${j}. The program prints ${i} · ${m} + ${j} = ${x}.`, `大步 i = ${i}：a^${i * m} = ${v}，它在表中，对应 j = ${j}。程序输出 ${i} · ${m} + ${j} = ${x}。`], baby(j), vars({ a, b, p, answer: x })])
        else t.s('hit', () => [[`Giant step i = ${i}: a^${i * m} = ${v}, which is in the table at j = ${j}. So x = ${i} · ${m} − ${j} = ${x}.`, `大步 i = ${i}：a^${i * m} = ${v}，它在表中，对应 j = ${j}。所以 x = ${i} · ${m} − ${j} = ${x}。`], baby(j), vars({ a, b, p, answer: x })])
        t.out(x); return
      }
      t.s('giant', () => [[`Giant step i = ${i}: a^${i * m} = ${v} is not in the table.`, `大步 i = ${i}：a^${i * m} = ${v}，不在表中。`], baby(), vars({ i, 'a^(i·m)': v })])
    }
    t.s('none', () => [[`All ${m} giant steps missed: no power of ${a} is ${b} modulo ${p}.`, `${m} 个大步全都没有命中：${a} 的任何次幂模 ${p} 都不等于 ${b}。`], baby(), vars({ answer: -1 })])
    t.out(-1)
  },
}

const determinant: Lesson = {
  id: 'determinant', title: ['Determinant', '行列式'], level: 'N', cat: 'math', diff: 9,
  needs: ['gauss', 'gcd'],
  blurb: ['Turn the matrix into a triangle with row operations that only flip the sign of the determinant or leave it alone; then multiply the diagonal.', '用只会改变行列式符号、或者完全不改变它的行变换，把矩阵化成三角形；然后把对角线上的数乘起来。'],
  ideas: [
    ['The determinant of a triangular matrix is the product of its diagonal.', '三角矩阵的行列式等于对角线上各数的乘积。'],
    ['Adding a multiple of one row to another does not change the determinant. Swapping two rows flips its sign.', '把一行的若干倍加到另一行上，行列式不变。交换两行，行列式变号。'],
    ['So eliminate below the diagonal column by column, keeping count of the swaps.', '所以逐列把对角线下方消成 0，同时记下交换的次数。'],
    ['To clear a[j][i] without dividing, run Euclid\'s algorithm on the pair (a[i][i], a[j][i]) with whole rows: subtract a multiple, swap, repeat until one is 0.', '要在不做除法的前提下把 a[j][i] 消成 0，就对 (a[i][i], a[j][i]) 这一对数做辗转相除，只不过操作的是整行：减去若干倍，交换，如此重复直到其中一个变成 0。'],
    ['No division means it works modulo any number, prime or not.', '不用除法，意味着它对任意模数都适用，不管是不是质数。'],
  ],
  time: 'O(n³ + n² log p)', space: 'O(n²)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

int n;
long long p, a[205][205];

long long norm(long long x) {  // the remainder of x that is closest to 0
    x %= p;
    if (x > p / 2) x -= p;
    if (x < -(p / 2)) x += p;
    return x;
}

int main() {
    scanf("%d%lld", &n, &p);
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++) { scanf("%lld", &a[i][j]); a[i][j] = norm(a[i][j]); }
    long long sign = 1;
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            while (a[j][i] != 0) {
                long long q = a[i][i] / a[j][i];  //@quot
                for (int k = i; k < n; k++) a[i][k] = norm(a[i][k] - q * a[j][k]);  //@sub
                swap(a[i], a[j]);  //@swap
                sign = -sign;
            }
    long long det = sign;
    for (int i = 0; i < n; i++) det = norm(det * a[i][i]);  //@diag
    printf("%lld\n", ((det % p) + p) % p);  //@done
}`,
  notes: [
    ['quot', ['The quotient of Euclid\'s algorithm, rounded toward zero.', '辗转相除中的商，向零取整。']],
    ['sub', ['Row i minus q times row j: the determinant is unchanged, and a[i][i] becomes the remainder, smaller than a[j][i].', '第 i 行减去第 j 行的 q 倍：行列式不变，而 a[i][i] 变成余数，绝对值小于 a[j][i]。']],
    ['swap', ['The smaller number goes to the bottom, as in Euclid\'s algorithm. Each swap flips the sign.', '较小的数换到下面，和辗转相除一样。每交换一次，符号就变一次。']],
    ['diag', ['Below the diagonal everything is 0 now, so the determinant is the product of the diagonal, times the sign.', '现在对角线下方全是 0，所以行列式等于对角线上各数之积，再乘上符号。']],
  ],
  input: ['n p (n ≤ 200, 2 ≤ p < 2³¹), then an n × n table of integers. Prints the determinant modulo p, as a number from 0 to p − 1.', 'n p（n ≤ 200，2 ≤ p < 2³¹），随后是 n × n 的整数表格。输出行列式对 p 取模的值，范围在 0 到 p − 1 之间。'],
  sizes: [2, 3, 4], lab: [5, 20, 50, 100],
  gen: (n, r) => `${n} 998244353\n` + span(1, n).map(() => span(1, n).map(() => (n <= 30 ? r.int(-4, 9) : r.int(0, 998244352))).join(' ')).join('\n') + '\n',
  broken: {
    from: 'long long det = sign;', to: 'long long det = 1;',
    why: ['Each Euclid step ends with a row swap, and every swap __multiplies the determinant by −1__; sign keeps track of how many there were. Starting the product from 1 forgets them: whenever the number of swaps is odd, the program prints −det mod p instead of det.', '辗转相除的每一步都以一次交换两行结束，而每次交换都会__让行列式乘以 −1__；sign 记录的就是交换了多少次。从 1 开始连乘就把它们忘了：只要交换的次数是奇数，程序输出的就是 −det mod p 而不是 det。'],
  },
  run(inp, t, bug = false) {
    const rd = reader(inp), n = rd.int(), p = rd.int()
    need(Number.isInteger(n) && n >= 1 && n <= 200 && Number.isInteger(p) && p >= 2 && p < 2 ** 31, 'Need 1 ≤ n ≤ 200 and 2 ≤ p < 2³¹.', '需要 1 ≤ n ≤ 200 且 2 ≤ p < 2³¹。')
    const half = Math.floor(p / 2), P = BigInt(p)
    const norm = (x: number) => { x %= p; if (x > half) x -= p; if (x < -half) x += p; return x }
    // x − q · y, exactly: the product can pass 2⁵³ when p is large.
    const subMul = (x: number, q: number, y: number) => (Math.abs(q) * Math.abs(y) < 2 ** 52 ? norm(x - q * y) : norm(Number((BigInt(x) - BigInt(q) * BigInt(y)) % P)))
    let a = span(1, n).map(() => rd.ints(n).map(norm)), sign = 1
    const view = (i: number, j: number, col: number) => {
      const tones: Record<string, Tone> = {}
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) tones[`${r},${c}`] = c < r && c < col ? 'dim' : r === i ? 'act' : r === j ? 'cmp' : c < r && a[r][c] === 0 ? 'dim' : (undefined as unknown as Tone)
      for (const k in tones) if (!tones[k]) delete tones[k]
      return grid('the matrix (remainders written as the number closest to 0)', a, tones, { rows: span(1, n).map(r => 'row ' + r) })
    }
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) while (a[j][i] !== 0) {
      const q = Math.trunc(a[i][i] / a[j][i]), x = a[i][i], y = a[j][i]
      for (let k = i; k < n; k++) { a[i][k] = subMul(a[i][k], q, a[j][k]); t.tick() }
      t.s('sub', () => [[`Column ${i + 1}: ${x} = ${q} · ${y} + ${a[i][i]}. Subtract ${q} × row ${j + 1} from row ${i + 1}; the determinant does not change.`, `第 ${i + 1} 列：${x} = ${q} · ${y} + ${a[i][i]}。从第 ${i + 1} 行中减去第 ${j + 1} 行的 ${q} 倍；行列式不变。`], view(i, j, i), vars({ sign: sign > 0 ? '+' : '−' })])
      const tmp = a[i]; a[i] = a[j]; a[j] = tmp
      sign = -sign
      const sg = sign
      t.s('swap', () => [[`Swap rows ${i + 1} and ${j + 1}: the sign flips to ${sg > 0 ? '+' : '−'}.${a[j][i] === 0 ? ` The entry below the diagonal is now 0.` : ''}`, `交换第 ${i + 1} 行和第 ${j + 1} 行：符号变为 ${sg > 0 ? '+' : '−'}。${a[j][i] === 0 ? '对角线下方的这个数已经是 0 了。' : ''}`], view(i, j, i), vars({ sign: sg > 0 ? '+' : '−' })])
    }
    a = a.slice()
    let det = bug ? 1 : sign
    for (let i = 0; i < n; i++) det = subMul(0, -det, a[i][i])
    const d = det, res = ((det % p) + p) % p
    const sgn = bug || sign > 0 ? '' : '− '
    t.s('diag', () => [[`The matrix is triangular: determinant = ${sgn}${a.map((row, i) => (row[i] < 0 ? `(${row[i]})` : row[i])).join(' · ')} = ${d} (mod ${p}).`, `矩阵已化为三角形：行列式 = ${sgn}${a.map((row, i) => (row[i] < 0 ? `(${row[i]})` : row[i])).join(' · ')} = ${d}（mod ${p}）。`], grid('triangular form', a, Object.fromEntries(span(0, n - 1).map(i => [`${i},${i}`, 'ok' as Tone])), { rows: span(1, n).map(r => 'row ' + r) }), vars({ sign: sign > 0 ? '+' : '−' })])
    t.s('done', () => [[`As a remainder from 0 to p − 1: ${res}.`, `写成 0 到 p − 1 之间的余数：${res}。`], vars({ answer: res })])
    t.out(res)
  },
}

const mobius: Lesson = {
  id: 'mobius', title: ['Möbius inversion: counting coprime pairs', '莫比乌斯反演：统计互质数对'], level: 'N', cat: 'math', diff: 9,
  needs: ['linear-sieve', 'incl-excl'],
  blurb: ['Replace the condition "gcd = 1" by a sum of μ(d) over the common divisors d. The sums can then be swapped, and each d contributes ⌊n/d⌋ · ⌊m/d⌋.', '把条件“gcd = 1”换成对公约数 d 求和的 μ(d)。这样求和顺序就可以交换，每个 d 的贡献是 ⌊n/d⌋ · ⌊m/d⌋。'],
  ideas: [
    ['Count the pairs (i, j) with 1 ≤ i ≤ n, 1 ≤ j ≤ m and gcd(i, j) = 1. Checking each pair costs n · m gcds.', '统计满足 1 ≤ i ≤ n、1 ≤ j ≤ m 且 gcd(i, j) = 1 的数对 (i, j)。逐对检查需要算 n · m 次 gcd。'],
    ['The Möbius function μ(d) is 1 for d = 1, (−1)ᵏ for a product of k different primes, and 0 if a square divides d.', '莫比乌斯函数 μ(d)：d = 1 时为 1；d 是 k 个不同质数的乘积时为 (−1)ᵏ；d 含有平方因子时为 0。'],
    ['Its key property: the sum of μ(d) over all divisors d of g is 1 if g = 1 and 0 otherwise.', '它的关键性质：对 g 的所有约数 d 求 μ(d) 之和，g = 1 时结果是 1，否则是 0。'],
    ['So [gcd(i, j) = 1] equals the sum of μ(d) over the common divisors d of i and j.', '所以 [gcd(i, j) = 1] 等于对 i 和 j 的所有公约数 d 求和的 μ(d)。'],
    ['Swap the sums: for a fixed d, the pairs with d dividing both number ⌊n/d⌋ · ⌊m/d⌋. μ comes from the linear sieve.', '交换求和顺序：对固定的 d，两个数都能被 d 整除的数对有 ⌊n/d⌋ · ⌊m/d⌋ 个。μ 用线性筛求出。'],
  ],
  time: 'O(min(n, m))', space: 'O(min(n, m))',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

const int N = 10000005;
int mu[N], pr[N / 10], cnt;
bool comp[N];

int main() {
    long long n, m;
    scanf("%lld%lld", &n, &m);
    int k = min(n, m);
    mu[1] = 1;  //@one
    for (int i = 2; i <= k; i++) {
        if (!comp[i]) { pr[cnt++] = i; mu[i] = -1; }  //@prime
        for (int j = 0; j < cnt && (long long)i * pr[j] <= k; j++) {
            comp[i * pr[j]] = true;
            if (i % pr[j] == 0) { mu[i * pr[j]] = 0; break; }  //@square
            mu[i * pr[j]] = -mu[i];  //@flip
        }
    }
    long long ans = 0;
    for (int d = 1; d <= k; d++) ans += mu[d] * (n / d) * (m / d);  //@term
    printf("%lld\n", ans);  //@done
}`,
  notes: [
    ['prime', ['A prime is a product of one prime: μ = −1.', '质数是一个质数的乘积：μ = −1。']],
    ['square', ['pr[j] divides i, so pr[j]² divides the product: μ = 0. As in the linear sieve, stop here.', 'pr[j] 整除 i，所以乘积含有 pr[j]²：μ = 0。与线性筛一样，到这里就停。']],
    ['flip', ['One more prime factor, different from all the others: the sign changes.', '多了一个与其他质因数都不同的质因数：符号改变。']],
    ['term', ['The pairs in which both numbers are multiples of d, with the sign μ(d).', '两个数都是 d 的倍数的数对的个数，带上符号 μ(d)。']],
  ],
  input: ['n m (both at most 10⁷). Prints the number of pairs (i, j) with 1 ≤ i ≤ n, 1 ≤ j ≤ m and gcd(i, j) = 1.', 'n m（都不超过 10⁷）。输出满足 1 ≤ i ≤ n、1 ≤ j ≤ m 且 gcd(i, j) = 1 的数对 (i, j) 的个数。'],
  sizes: [6, 10, 14], lab: [10, 1000, 100000, 1000000, 5000000],
  gen: (n, r) => `${n} ${Math.max(1, n - r.int(0, n >> 2))}\n`,
  broken: {
    from: 'mu[i * pr[j]] = -mu[i];  //@flip', to: 'mu[i * pr[j]] = mu[i];  //@flip',
    why: ['μ(d) is (−1)ᵏ for a product of k different primes, so one more new prime factor __flips the sign__. Copying μ(i) unchanged makes every square-free d > 1 inherit −1 from its smallest prime: μ(6) comes out −1 instead of +1. The pairs divisible by 6 are then subtracted a second time instead of being added back.', '对 k 个不同质数的乘积，μ(d) = (−1)ᵏ，所以多一个新的质因数，__符号就要翻转__。原样复制 μ(i)，会让每个大于 1 的无平方因子数都从它最小的质因子那里继承 −1：μ(6) 算成了 −1 而不是 +1。于是两个数都是 6 的倍数的数对被再减了一次，而不是加回来。'],
  },
  run(inp, t, bug = false) {
    const rd = reader(inp), n = rd.int(), m = rd.int()
    need(Number.isInteger(n) && Number.isInteger(m) && n >= 1 && m >= 1 && n <= 1e7 && m <= 1e7, 'n and m must be between 1 and 10⁷.', 'n 和 m 须在 1 到 10⁷ 之间。')
    const k = Math.min(n, m), mu = new Int8Array(k + 1), comp = new Uint8Array(k + 1), known = new Uint8Array(k + 1), pr: number[] = []
    const small = k <= 24
    const table = (hi: Record<number, Tone> = {}, terms?: number[]) => small && grid('the Möbius function', [span(1, k), span(1, k).map(d => (known[d] ? mu[d] : '')), ...(terms ? [span(1, k).map(d => (d <= terms.length ? terms[d - 1] : ''))] : [])], Object.fromEntries(Object.entries(hi).flatMap(([d, tone]) => [[`0,${+d - 1}`, tone], [`1,${+d - 1}`, tone]])), { rows: ['d', 'μ(d)', ...(terms ? ['term'] : [])] })
    mu[1] = 1; known[1] = 1
    t.s('one', () => [['μ(1) = 1.', 'μ(1) = 1。'], table({ 1: 'ok' })])
    for (let i = 2; i <= k; i++) {
      if (!comp[i]) { pr.push(i); mu[i] = -1; known[i] = 1; t.s('prime', () => [[`${i} is prime: μ(${i}) = −1.`, `${i} 是质数：μ(${i}) = −1。`], table({ [i]: 'act' })]) }
      for (let j = 0; j < pr.length && i * pr[j] <= k; j++) {
        const x = i * pr[j], q = pr[j]
        comp[x] = 1; known[x] = 1
        if (i % q === 0) { mu[x] = 0; t.s('square', () => [[`${x} = ${i} · ${q}, and ${q} already divides ${i}: ${x} contains ${q}², so μ(${x}) = 0.`, `${x} = ${i} · ${q}，而 ${q} 已经整除 ${i}：${x} 含有 ${q}²，所以 μ(${x}) = 0。`], table({ [i]: 'cmp', [x]: 'bad' })]); break }
        if (!bug && mu[i] !== 0) t.ask(() => [[`${x} = ${i} · ${q}, where ${q} is a new prime and μ(${i}) = ${mu[i]}. What is μ(${x})?`, `${x} = ${i} · ${q}，其中 ${q} 是一个新的质因数，μ(${i}) = ${mu[i]}。μ(${x}) 是多少？`], [['−1', '−1'], ['0', '0'], ['1', '1']], -mu[i] + 1])
        mu[x] = bug ? mu[i] : -mu[i]
        if (bug) t.s('flip', () => [[`${x} = ${i} · ${q}: μ(${x}) = μ(${i}) = ${mu[x]}.`, `${x} = ${i} · ${q}：μ(${x}) = μ(${i}) = ${mu[x]}。`], table({ [i]: 'cmp', [x]: 'act' })])
        else t.s('flip', () => [[`${x} = ${i} · ${q} with a new prime ${q}: μ(${x}) = −μ(${i}) = ${mu[x]}.`, `${x} = ${i} · ${q}，${q} 是一个新的质因数：μ(${x}) = −μ(${i}) = ${mu[x]}。`], table({ [i]: 'cmp', [x]: 'act' })])
      }
    }
    let ans = 0
    const terms: number[] = []
    for (let d = 1; d <= k; d++) {
      const term = mu[d] * Math.floor(n / d) * Math.floor(m / d)
      ans += term
      if (small) terms.push(term)
      const total = ans
      t.s('term', () => [mu[d] === 0 ? [`d = ${d}: μ = 0, no contribution.`, `d = ${d}：μ = 0，没有贡献。`] : [`d = ${d}: μ = ${mu[d]}, and ⌊${n}/${d}⌋ · ⌊${m}/${d}⌋ = ${Math.floor(n / d)} · ${Math.floor(m / d)} pairs are both multiples of ${d}. Term ${term}, total ${total}.`, `d = ${d}：μ = ${mu[d]}，两个数都是 ${d} 的倍数的数对有 ⌊${n}/${d}⌋ · ⌊${m}/${d}⌋ = ${Math.floor(n / d)} · ${Math.floor(m / d)} 个。这一项是 ${term}，累计 ${total}。`], table({ [d]: mu[d] > 0 ? 'ok' : mu[d] < 0 ? 'bad' : 'dim' }, terms.slice()), vars({ n, m, total })])
    }
    const res = ans
    t.s('done', () => [bug ? [`The program prints ${res}.`, `程序输出 ${res}。`] : [`${res} of the ${n * m} pairs are coprime.`, `${n * m} 个数对中有 ${res} 对互质。`], vars({ answer: res })])
    t.out(res)
  },
}

const MODN = 998244353
const powN = (a: number, e: number) => { let r = 1; for (a %= MODN; e > 0; e = Math.floor(e / 2)) { if (e % 2) r = mulmodN(r, a, MODN); a = mulmodN(a, a, MODN) } return r }
const ntt: Lesson = {
  id: 'ntt', title: ['Fast polynomial multiplication (NTT)', '快速多项式乘法（NTT）'], level: 'N', cat: 'math', diff: 10,
  needs: ['mod-inverse', 'merge-sort'],
  blurb: ['Evaluate both polynomials at the same cleverly chosen points, multiply the values point by point, and interpolate back — each of the three in n log n.', '在同一组精心挑选的点上求出两个多项式的值，把对应的值两两相乘，再插值还原——三步每一步都只需 n log n。'],
  ideas: [
    ['Multiplying coefficient lists directly costs n · m. But two polynomials given by their values at the same points multiply in linear time: just multiply the values.', '直接用系数相乘需要 n · m 次运算。但如果两个多项式是用同一组点上的取值给出的，相乘只需线性时间：把对应的值相乘即可。'],
    ['A polynomial of degree below L is fixed by its values at L points. So: evaluate, multiply pointwise, interpolate.', '次数小于 L 的多项式由它在 L 个点上的值唯一确定。所以：求值，逐点相乘，再插值。'],
    ['Choose the points as the powers of ω, a number with ω^L = 1 and no smaller power equal to 1. Squaring these points gives only half as many different values.', '把这些点取成 ω 的各次幂，其中 ω^L = 1，且更小的幂都不等于 1。把这些点平方之后，只剩下一半个数的不同的值。'],
    ['Split the polynomial into even and odd coefficients: A(x) = E(x²) + x · O(x²). Both halves are needed only at the squared points — two problems of half the size.', '把多项式按偶次项和奇次项拆开：A(x) = E(x²) + x · O(x²)。两个部分都只需要在平方之后的点上求值——变成两个规模减半的问题。'],
    ['Modulo 998244353 = 119 · 2²³ + 1 such an ω exists for every power of two up to 2²³: ω = 3^((p − 1) / L). All arithmetic is exact.', '在模 998244353 = 119 · 2²³ + 1 意义下，对不超过 2²³ 的每个 2 的幂 L，都存在这样的 ω：ω = 3^((p − 1) / L)。所有运算都是精确的。'],
  ],
  time: 'O(n log n)', space: 'O(n)',
  code: cpp`#include <bits/stdc++.h>
using namespace std;

const long long MOD = 998244353, G = 3;
const int N = 1 << 19;
int n, m, len = 1, rev[N];
long long a[N], b[N];

long long power(long long x, long long e) {
    long long r = 1;
    for (x %= MOD; e > 0; e >>= 1) {
        if (e & 1) r = r * x % MOD;
        x = x * x % MOD;
    }
    return r;
}

void ntt(long long* f, int inv) {  // values at the powers of ω (inv = 1), or back to coefficients (inv = -1)
    for (int i = 0; i < len; i++)
        if (i < rev[i]) swap(f[i], f[rev[i]]);  //@rev
    for (int h = 1; h < len; h <<= 1) {
        long long wn = power(inv == 1 ? G : power(G, MOD - 2), (MOD - 1) / (2 * h));  //@layer
        for (int i = 0; i < len; i += 2 * h) {
            long long w = 1;
            for (int j = i; j < i + h; j++, w = w * wn % MOD) {
                long long x = f[j], y = f[j + h] * w % MOD;
                f[j] = (x + y) % MOD; f[j + h] = (x - y + MOD) % MOD;  //@fly
            }
        }
    }
    if (inv == -1) {
        long long il = power(len, MOD - 2);
        for (int i = 0; i < len; i++) f[i] = f[i] * il % MOD;  //@scale
    }
}

int main() {
    scanf("%d%d", &n, &m);
    for (int i = 0; i <= n; i++) scanf("%lld", &a[i]);
    for (int i = 0; i <= m; i++) scanf("%lld", &b[i]);
    while (len <= n + m) len <<= 1;  //@size
    for (int i = 0; i < len; i++) rev[i] = (rev[i >> 1] >> 1) | ((i & 1) ? len >> 1 : 0);
    ntt(a, 1); ntt(b, 1);
    for (int i = 0; i < len; i++) a[i] = a[i] * b[i] % MOD;  //@mul
    ntt(a, -1);
    for (int i = 0; i <= n + m; i++) printf("%lld ", a[i]);  //@done
}`,
  notes: [
    ['rev', ['The recursion sorts the coefficients by their index read backwards in binary. Doing that reordering first lets the rest run as plain loops.', '递归会把系数按“下标的二进制倒过来读”的顺序排好。先做完这个重排，剩下的部分就可以写成普通的循环。']],
    ['layer', ['wn is a number whose 2h-th power is 1: the ω for blocks of length 2h. The inverse transform uses its inverse.', 'wn 的 2h 次幂等于 1：它就是长度为 2h 的块所用的 ω。逆变换用的是它的逆元。']],
    ['fly', ['One "butterfly": from E and O at a squared point, the values at the two points x and −x are E + x·O and E − x·O.', '一次“蝴蝶操作”：由 E 和 O 在平方点上的值，得到 x 和 −x 这两个点上的值 E + x·O 和 E − x·O。']],
    ['scale', ['Interpolation is the same transform with ω replaced by its inverse, followed by a division by the length.', '插值就是把 ω 换成它的逆元再做一遍同样的变换，最后除以长度。']],
    ['size', ['The product has n + m + 1 coefficients; the length is the next power of two that holds them.', '乘积有 n + m + 1 个系数；长度取能容纳它们的最小的 2 的幂。']],
  ],
  input: ['n m (the degrees), then the n + 1 coefficients of the first polynomial and the m + 1 of the second, from the constant term up. Prints the n + m + 1 coefficients of the product modulo 998 244 353. (In the generator both degrees are n.)', 'n m（两个多项式的次数），随后是第一个多项式的 n + 1 个系数和第二个多项式的 m + 1 个系数，从常数项开始。输出乘积的 n + m + 1 个系数，对 998 244 353 取模。（生成器中两个次数都是 n。）'],
  sizes: [1, 2, 3], lab: [4, 64, 1024, 16384, 65536],
  gen: (n, r) => `${n} ${n}\n${r.ints(n + 1, n <= 8 ? 1 : 0, n <= 8 ? 5 : MODN - 1).join(' ')}\n${r.ints(n + 1, n <= 8 ? 1 : 0, n <= 8 ? 5 : MODN - 1).join(' ')}\n`,
  broken: {
    from: 'long long wn = power(inv == 1 ? G : power(G, MOD - 2), (MOD - 1) / (2 * h));  //@layer', to: 'long long wn = power(G, (MOD - 1) / (2 * h));  //@layer',
    why: ['Interpolation is the same transform run with ω replaced by __ω⁻¹__. Run with ω again, it does not undo the first transform but applies it twice, and that maps coefficient i to position −i: apart from the constant term, the coefficients come out in reverse order around the length. For (1 + 2x)(1 + 3x) the program prints 1 0 6 instead of 1 5 6.', '插值就是把 ω 换成 __ω⁻¹__ 再做一遍同样的变换。如果仍用 ω，它不会撤销第一次变换，而是又做了一次，这会把第 i 项系数送到位置 −i：除常数项外，各项系数绕着长度倒了过来。对 (1 + 2x)(1 + 3x)，程序输出 1 0 6 而不是 1 5 6。'],
  },
  run(inp, t, bug = false) {
    const rd = reader(inp), n = rd.int(), m = rd.int()
    need(Number.isInteger(n) && Number.isInteger(m) && n >= 0 && m >= 0 && n + m < 1 << 19, 'The degrees must be at least 0 and their sum below 524,288.', '两个次数都不能为负，且它们的和要小于 524,288。')
    let len = 1
    while (len <= n + m) len <<= 1
    const a = new Array<number>(len).fill(0), b = new Array<number>(len).fill(0)
    for (let i = 0; i <= n; i++) a[i] = ((rd.int() % MODN) + MODN) % MODN
    for (let i = 0; i <= m; i++) b[i] = ((rd.int() % MODN) + MODN) % MODN
    const rev = new Int32Array(len)
    for (let i = 0; i < len; i++) rev[i] = (rev[i >> 1] >> 1) | (i & 1 ? len >> 1 : 0)
    const small = len <= 8, show = (name: string, f: number[], tone?: Tone) => small && arr(name, f, tone ? tn({ [tone]: span(0, len - 1) }) : undefined, undefined, { base: 0 })
    t.s('size', () => [[`The product has ${n + m + 1} coefficients: work with length ${len}, padding with zeros.`, `乘积有 ${n + m + 1} 个系数：取长度 ${len}，不足的部分补 0。`], show('a (coefficients)', a), show('b (coefficients)', b)])
    const transform = (f: number[], inv: number, name: string) => {
      for (let i = 0; i < len; i++) if (i < rev[i]) { const x = f[i]; f[i] = f[rev[i]]; f[rev[i]] = x }
      t.s('rev', () => [[`${name}: reorder by bit-reversed index, so that each half-size subproblem sits in one block.`, `${name}：按下标的二进制反转重新排列，让每个规模减半的子问题占据连续的一块。`], show(name, f, 'cmp')])
      for (let h = 1; h < len; h <<= 1) {
        const wn = powN(inv === 1 || bug ? 3 : powN(3, MODN - 2), (MODN - 1) / (2 * h))
        for (let i = 0; i < len; i += 2 * h) {
          let w = 1
          for (let j = i; j < i + h; j++) {
            const x = f[j], y = mulmodN(f[j + h], w, MODN)
            f[j] = (x + y) % MODN; f[j + h] = (x - y + MODN) % MODN
            w = mulmodN(w, wn, MODN); t.tick()
          }
        }
        t.s('layer', () => [[`${name}: combine blocks of length ${h} into blocks of length ${2 * h} (ω = ${wn}).`, `${name}：把长度为 ${h} 的块两两合并成长度为 ${2 * h} 的块（ω = ${wn}）。`], show(name, f, 'act'), vars({ 'block length': 2 * h, ω: wn })])
      }
      if (inv === -1) {
        const il = powN(len, MODN - 2)
        for (let i = 0; i < len; i++) f[i] = mulmodN(f[i], il, MODN)
        t.s('scale', () => [[`Divide by the length ${len}: these are the coefficients of the product.`, `除以长度 ${len}：得到的就是乘积的各项系数。`], show('a · b (coefficients)', f, 'ok')])
      }
    }
    transform(a, 1, 'a (values)'); transform(b, 1, 'b (values)')
    for (let i = 0; i < len; i++) a[i] = mulmodN(a[i], b[i], MODN)
    t.s('mul', () => [['Multiply the values at each point: these are the values of the product polynomial.', '把每个点上的两个值相乘：得到的就是乘积多项式在这些点上的值。'], show('a · b (values)', a, 'act'), show('b (values)', b)])
    transform(a, -1, 'a · b (back to coefficients)')
    const res = a.slice(0, n + m + 1)
    t.s('done', () => [bug ? [`The program prints ${res.slice(0, 12).join(', ')}${res.length > 12 ? ', …' : ''}.`, `程序输出 ${res.slice(0, 12).join('，')}${res.length > 12 ? '，……' : ''}。`] : [`The product: ${res.slice(0, 12).join(', ')}${res.length > 12 ? ', …' : ''}.`, `乘积的系数：${res.slice(0, 12).join('，')}${res.length > 12 ? '，……' : ''}。`], arr('coefficients of the product', res.slice(0, 16), tn({ ok: span(0, Math.min(15, n + m)) }), undefined, { base: 0 })])
    t.out(res.join(' '))
  },
}

export default [gcd, exgcd, sieve, linearSieve, pascal, gauss, nimSg, hull, prufer, primeFactor, modInverse, crt, binomialMod, inclExcl, matrixPower, xorBasis, bsgs, determinant, mobius, ntt]
