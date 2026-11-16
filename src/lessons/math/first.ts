import type { L, Variant } from '../../engine/types'
import { arr, need, reader, tn, vars } from '../../engine/h'

const cpp = String.raw

/**
 * Versions to learn first: the lesson's own method before one optimisation.
 * `label` names the lesson's own version next to it. The rule and the list are in specs/earlier-versions.md.
 */
export const FIRST: Record<string, { first: Variant; label: L }> = {
  gcd: {
    label: ['Remainder', '取余数'],
    first: {
      label: ['Repeated subtraction', '反复相减'],
      blurb: ['Replace the larger number by the difference, again and again. The common divisors never change — but when one number is much larger than the other, the same subtraction is repeated many times.', '不断把较大的数换成两数之差。公约数始终不变——但当一个数比另一个大得多时，同样的减法要重复很多次。'],
      time: 'O(max(a, b))', space: 'O(1)', maxN: 15,
      code: cpp`#include <bits/stdc++.h>
using namespace std;

int main() {
    long long a, b;
    scanf("%lld%lld", &a, &b);
    while (a && b) {
        if (a >= b) a -= b;  //@suba
        else b -= a;  //@subb
    }
    printf("%lld\n", a + b);  //@done
}`,
      notes: [
        ['suba', ['Subtracting b from a keeps every common divisor. If a is still not below b, the next round subtracts b again — all of those rounds together are one a mod b.', '从 a 中减去 b 不会改变任何公约数。如果 a 仍然不小于 b，下一轮还要再减一次 b——这些轮次合起来，就是一次 a mod b。']],
        ['done', ['One of the two is 0 now, so the sum is the other one: the gcd.', '此时两数之一为 0，所以它们的和就是另一个数：即最大公约数。']],
      ],
      run(inp, t) {
        const rd = reader(inp)
        let a = rd.int(), b = rd.int(), k = 0
        need(Number.isSafeInteger(a) && Number.isSafeInteger(b) && a >= 0 && b >= 0, 'Expected two non-negative integers below 2^53.', '需要两个小于 2^53 的非负整数。')
        while (a && b) {
          const onA = a >= b, oa = a, ob = b
          if (onA) a -= b; else b -= a
          k++
          const kk = k, na = a, nb = b
          t.s(onA ? 'suba' : 'subb', () => [onA ? [`${oa} ≥ ${ob}: a = ${oa} − ${ob} = ${na}.`, `${oa} ≥ ${ob}：a = ${oa} − ${ob} = ${na}。`] : [`${oa} < ${ob}: b = ${ob} − ${oa} = ${nb}.`, `${oa} < ${ob}：b = ${ob} − ${oa} = ${nb}。`], arr('a, b', [na, nb], tn({ act: onA ? 0 : 1 })), vars({ subtractions: kk })])
        }
        const g = a + b
        t.s('done', () => [[`One number is 0 after ${k} subtraction(s): the gcd is ${g}.`, `经过 ${k} 次减法后有一个数变为 0：最大公约数是 ${g}。`], arr('a, b', [a, b], tn({ ok: a ? 0 : 1 })), vars({ gcd: g })])
        t.out(g)
      },
    },
  },
}
