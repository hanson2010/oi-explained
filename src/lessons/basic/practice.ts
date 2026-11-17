import type { Practice } from '../../engine/types'

/** Problems on online judges for each lesson, easiest first within a judge. Titles are checked with `npm run check:practice`. */
export const PRACTICE: Record<string, Practice[]> = {
  'base-conversion': [
    { judge: 'acwing', id: '3376', title: '3373. 进制转换' },
    { judge: 'luogu', id: 'P1143', title: 'P1143 进制转换' },
    { judge: 'luogu', id: 'P1017', title: 'P1017 [NOIP 2000 提高组] 进制转换' },
  ],
  enumeration: [
    { judge: 'acwing', id: '6211', title: '6208. 百鸡问题' },
    { judge: 'luogu', id: 'P2089', title: 'P2089 烤鸡' },
    { judge: 'luogu', id: 'P1618', title: 'P1618 三连击（升级版）' },
  ],
  simulation: [
    { judge: 'acwing', id: '3562', title: '3559. 围圈报数' },
    { judge: 'luogu', id: 'P1996', title: 'P1996 约瑟夫问题' },
    { judge: 'luogu', id: 'P1563', title: 'P1563 [NOIP 2016 提高组] 玩具谜题' },
  ],
  'prefix-sum': [
    { judge: 'acwing', id: '797', title: '795. 前缀和' },
    { judge: 'acwing', id: '798', title: '796. 子矩阵的和' },
    { judge: 'luogu', id: 'P8218', title: 'P8218 【深进1.例1】求区间和' },
    { judge: 'cf', id: '313B', title: '313B. Ilya and Queries' },
  ],
  'binary-search': [
    { judge: 'acwing', id: '791', title: '789. 数的范围' },
    { judge: 'luogu', id: 'P2249', title: 'P2249 【深基13.例1】查找' },
    { judge: 'luogu', id: 'P1102', title: 'P1102 A-B 数对' },
    { judge: 'cf', id: '474B', title: '474B. Worms' },
  ],
  difference: [
    { judge: 'acwing', id: '799', title: '797. 差分' },
    { judge: 'acwing', id: '800', title: '798. 差分矩阵' },
    { judge: 'luogu', id: 'P2367', title: 'P2367 语文成绩' },
    { judge: 'luogu', id: 'P3397', title: 'P3397 地毯' },
    { judge: 'cf', id: '276C', title: '276C. Little Girl and Maximum Sum' },
  ],
  'fast-pow': [
    { judge: 'acwing', id: '877', title: '875. 快速幂' },
    { judge: 'luogu', id: 'P1226', title: 'P1226 【模板】快速幂' },
  ],
  hanoi: [
    { judge: 'acwing', id: '98', title: '96. 奇怪的汉诺塔' },
    { judge: 'luogu', id: 'P1760', title: 'P1760 通天之汉诺塔' },
    { judge: 'luogu', id: 'P1096', title: 'P1096 [NOIP 2007 普及组] Hanoi 双塔问题' },
    { judge: 'cf', id: '392B', title: '392B. Tower of Hanoi' },
  ],
  'bignum-add': [
    { judge: 'acwing', id: '793', title: '791. 高精度加法' },
    { judge: 'luogu', id: 'P1601', title: 'P1601 高精度加法' },
    { judge: 'luogu', id: 'P1255', title: 'P1255 数楼梯' },
  ],
  'bignum-mul': [
    { judge: 'acwing', id: '795', title: '793. 高精度乘法' },
    { judge: 'luogu', id: 'P1303', title: 'P1303 A*B Problem' },
    { judge: 'luogu', id: 'P1009', title: 'P1009 [NOIP 1998 普及组] 阶乘之和' },
  ],
  'bignum-sub': [
    { judge: 'acwing', id: '794', title: '792. 高精度减法' },
    { judge: 'luogu', id: 'P2142', title: 'P2142 高精度减法' },
  ],
  'bignum-div': [
    { judge: 'acwing', id: '796', title: '794. 高精度除法' },
    { judge: 'luogu', id: 'P1480', title: 'P1480 A/B Problem（高精度除法Ⅰ）' },
  ],
  'coord-compress': [
    { judge: 'acwing', id: '804', title: '802. 区间和' },
    { judge: 'luogu', id: 'B3694', title: 'B3694 【模板】数列离散化' },
    { judge: 'luogu', id: 'P1955', title: 'P1955 [NOI2015] 程序自动分析' },
    { judge: 'cf', id: '61E', title: '61E. Enemy is weak' },
  ],
}
