import type { Practice } from '../../engine/types'

/** Problems on online judges for each lesson, easiest first within a judge. Titles are checked with `npm run check:practice`. */
export const PRACTICE: Record<string, Practice[]> = {
  gcd: [
    { judge: 'acwing', id: '874', title: '872. 最大公约数' },
    { judge: 'luogu', id: 'P1029', title: 'P1029 [NOIP 2001 普及组] 最大公约数和最小公倍数问题' },
    { judge: 'cf', id: '1458A', title: '1458A. Row GCD' },
  ],
  'prime-factor': [
    { judge: 'acwing', id: '869', title: '867. 分解质因数' },
    { judge: 'acwing', id: '451', title: '449. 质因数分解' },
    { judge: 'luogu', id: 'P1075', title: 'P1075 [NOIP 2012 普及组] 质因数分解' },
    { judge: 'cf', id: '1294C', title: '1294C. Product of Three Numbers' },
  ],
  sieve: [
    { judge: 'acwing', id: '870', title: '868. 筛质数' },
    { judge: 'acwing', id: '198', title: '196. 质数距离' },
    { judge: 'luogu', id: 'P3912', title: 'P3912 素数个数' },
    { judge: 'luogu', id: 'P1217', title: 'P1217 [USACO1.5] 回文质数 Prime Palindromes' },
    { judge: 'cf', id: '26A', title: '26A. Almost Prime' },
  ],
  'linear-sieve': [
    { judge: 'acwing', id: '870', title: '868. 筛质数' },
    { judge: 'luogu', id: 'P3383', title: 'P3383 【模板】线性筛素数' },
    { judge: 'luogu', id: 'P2158', title: 'P2158 [SDOI2008] 仪仗队' },
    { judge: 'cf', id: '776B', title: '776B. Sherlock and his girlfriend' },
  ],
  pascal: [
    { judge: 'acwing', id: '887', title: '885. 求组合数 I' },
    { judge: 'luogu', id: 'P5732', title: 'P5732 【深基5.习7】杨辉三角' },
    { judge: 'luogu', id: 'P2822', title: 'P2822 [NOIP 2016 提高组] 组合数问题' },
  ],
  'matrix-power': [
    { judge: 'acwing', id: '207', title: '205. 斐波那契' },
    { judge: 'acwing', id: '1305', title: '1303. 斐波那契前 n 项和' },
    { judge: 'luogu', id: 'P1962', title: 'P1962 斐波那契数列' },
    { judge: 'luogu', id: 'P3390', title: 'P3390 【模板】矩阵快速幂' },
    { judge: 'cf', id: '185A', title: '185A. Plant' },
  ],
  exgcd: [
    { judge: 'acwing', id: '879', title: '877. 扩展欧几里得算法' },
    { judge: 'acwing', id: '205', title: '203. 同余方程' },
    { judge: 'luogu', id: 'P1082', title: 'P1082 [NOIP 2012 提高组] 同余方程' },
    { judge: 'luogu', id: 'P5656', title: 'P5656 【模板】二元一次不定方程 (exgcd)' },
    { judge: 'cf', id: '7C', title: '7C. Line' },
  ],
  gauss: [
    { judge: 'acwing', id: '885', title: '883. 高斯消元解线性方程组' },
    { judge: 'luogu', id: 'P3389', title: 'P3389 【模板】高斯消元法' },
    { judge: 'luogu', id: 'P2455', title: 'P2455 [SDOI2006] 线性方程组' },
  ],
  'mod-inverse': [
    { judge: 'acwing', id: '878', title: '876. 快速幂求逆元' },
    { judge: 'luogu', id: 'P3811', title: 'P3811 【模板】模意义下的乘法逆元' },
    { judge: 'luogu', id: 'P2613', title: 'P2613 【模板】有理数取余' },
  ],
  'binomial-mod': [
    { judge: 'acwing', id: '888', title: '886. 求组合数 II' },
    { judge: 'luogu', id: 'B3717', title: 'B3717 组合数问题' },
    { judge: 'cf', id: '300C', title: '300C. Beautiful Numbers' },
  ],
  crt: [
    { judge: 'acwing', id: '1300', title: '1298. 曹冲养猪' },
    { judge: 'acwing', id: '206', title: '204. 表达整数的奇怪方式' },
    { judge: 'luogu', id: 'P1495', title: 'P1495 【模板】中国剩余定理（CRT）/ 曹冲养猪' },
    { judge: 'luogu', id: 'P4777', title: 'P4777 【模板】扩展中国剩余定理（EXCRT）' },
  ],
  'incl-excl': [
    { judge: 'acwing', id: '892', title: '890. 能被整除的数' },
    { judge: 'luogu', id: 'P1450', title: 'P1450 [HAOI2008] 硬币购物' },
    { judge: 'luogu', id: 'P5505', title: 'P5505 [JSOI2011] 分特产' },
    { judge: 'cf', id: '451E', title: '451E. Devu and Flowers' },
  ],
  'convex-hull': [
    { judge: 'acwing', id: '2938', title: '2935. 信用卡凸包' },
    { judge: 'luogu', id: 'P2742', title: 'P2742 【模板】二维凸包 / [USACO5.1] 圈奶牛Fencing the Cows' },
  ],
  bsgs: [
    { judge: 'acwing', id: '3127', title: '3124. BSGS' },
    { judge: 'luogu', id: 'P3846', title: 'P3846 【模板】BSGS / [TJOI2007] 可爱的质数' },
    { judge: 'luogu', id: 'P2485', title: 'P2485 [SDOI2011] 计算器' },
  ],
  'nim-sg': [
    { judge: 'acwing', id: '893', title: '891. Nim游戏' },
    { judge: 'acwing', id: '895', title: '893. 集合-Nim游戏' },
    { judge: 'luogu', id: 'P2197', title: 'P2197 【模板】Nim 游戏' },
    { judge: 'cf', id: '1194D', title: '1194D. 1-2-K Game' },
  ],
  prufer: [
    { judge: 'acwing', id: '2421', title: '2419. prufer序列' },
    { judge: 'luogu', id: 'P6086', title: 'P6086 【模板】Prüfer（Prufer）序列' },
  ],
  'xor-basis': [
    { judge: 'acwing', id: '3167', title: '3164. 线性基' },
    { judge: 'luogu', id: 'P3812', title: 'P3812 【模板】线性基' },
    { judge: 'cf', id: '1101G', title: '1101G. (Zero XOR Subset)-less' },
  ],
  determinant: [
    { judge: 'acwing', id: '4374', title: '4371. 计算行列式' },
    { judge: 'luogu', id: 'P7112', title: 'P7112 【模板】行列式求值' },
  ],
  mobius: [
    { judge: 'acwing', id: '217', title: '215. 破译密码' },
    { judge: 'luogu', id: 'P3455', title: 'P3455 [POI 2007] ZAP-Queries' },
    { judge: 'luogu', id: 'P2522', title: 'P2522 [HAOI2011] Problem b' },
    { judge: 'cf', id: '803F', title: '803F. Coprime Subsequences' },
  ],
  ntt: [
    { judge: 'acwing', id: '3125', title: '3122. 多项式乘法' },
    { judge: 'luogu', id: 'P3803', title: 'P3803 【模板】多项式乘法（FFT）' },
    { judge: 'cf', id: '1096G', title: '1096G. Lucky Tickets' },
  ],
}
