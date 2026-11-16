import type { L, Variant } from '../../engine/types'
import { arr, need, span, tn, vars } from '../../engine/h'

const cpp = String.raw

/**
 * Versions to learn first: the lesson's own method before one optimisation.
 * `label` names the lesson's own version next to it. The rule and the list are in specs/earlier-versions.md.
 */
export const FIRST: Record<string, { first: Variant; label: L }> = {
  'fast-pow': {
    label: ['Loop over the bits', '按二进制位循环'],
    first: {
      label: ['Recursive halving', '递归折半'],
      blurb: ['aᵇ is the square of a^(b/2), times one more a when b is odd. The recursion halves b at every level — already log b multiplications — but it needs a stack as deep as b has bits.', 'aᵇ 等于 a^(b/2) 的平方，b 为奇数时再多乘一个 a。递归每深入一层，b 就减半——乘法次数已经是 log b——但它需要一个与 b 的二进制位数一样深的栈。'],
      time: 'O(log b)', space: 'O(log b)',
      code: cpp`#include <bits/stdc++.h>
using namespace std;

long long m;

long long power(long long a, long long b) {
    if (b == 0) return 1 % m;  //@base
    long long h = power(a, b / 2);  //@half
    h = h * h % m;  //@sq
    if (b & 1) h = h * a % m;  //@mul
    return h;
}

int main() {
    long long a, b;
    scanf("%lld%lld%lld", &a, &b, &m);
    printf("%lld\n", power(a % m, b));  //@done
}`,
      notes: [
        ['half', ['The same problem with half the exponent. Going down, the exponents are b with its lowest bits removed one by one.', '指数减半的同一个问题。一路向下，指数依次是 b 去掉最低一位、两位……之后的数。']],
        ['sq', ['Squaring the half-result doubles the exponent.', '把一半的结果平方，指数就翻倍。']],
        ['mul', ['An odd b has one a left over after halving.', 'b 为奇数时，折半之后还剩下一个 a。']],
      ],
      run(inp, t) {
        const tk = inp.split(/\s+/).filter(Boolean)
        need(tk.length >= 3 && tk.slice(0, 3).every(s => /^\d+$/.test(s)), 'Expected three non-negative integers.', '需要三个非负整数。')
        const m = BigInt(tk[2]), b0 = BigInt(tk[1])
        need(m > 0n, 'm must be positive.', 'm 必须为正。')
        const a = BigInt(tk[0]) % m, levels: bigint[] = []
        for (let b = b0; ; b /= 2n) { levels.push(b); if (b === 0n) break }
        const view = (k: number, done: number) => arr('exponent at each level of the recursion', levels.map(String), tn({ ok: span(done, levels.length - 1), act: k }))
        for (let k = 1; k < levels.length; k++) t.s('half', () => [[`power(a, ${levels[k - 1]}) needs power(a, ${levels[k]}) first.`, `power(a, ${levels[k - 1]}) 需要先算出 power(a, ${levels[k]})。`], view(k, levels.length), vars({ depth: k })])
        let h = 1n % m
        t.s('base', () => [[`Exponent 0: the answer is 1 mod m = ${h}.`, `指数为 0：答案是 1 mod m = ${h}。`], view(levels.length - 1, levels.length - 1), vars({ h: String(h) })])
        for (let k = levels.length - 2; k >= 0; k--) {
          const b = levels[k], old = h
          h = (h * h) % m
          const sq = h
          t.s('sq', () => [[`Back at exponent ${b}: ${old}² mod ${m} = ${sq}.`, `回到指数 ${b}：${old}² mod ${m} = ${sq}。`], view(k, k + 1), vars({ h: String(sq) })])
          if (b & 1n) {
            h = (h * a) % m
            const r = h
            t.s('mul', () => [[`${b} is odd: one more factor, ${sq} × ${a} mod ${m} = ${r}.`, `${b} 是奇数：再乘一个 a，${sq} × ${a} mod ${m} = ${r}。`], view(k, k), vars({ h: String(r) })])
          }
        }
        t.s('done', () => [[`Result: ${h}. The recursion was ${levels.length - 1} level(s) deep.`, `结果：${h}。递归深度为 ${levels.length - 1} 层。`], view(0, 0), vars({ answer: String(h) })])
        t.out(h)
      },
    },
  },
}
