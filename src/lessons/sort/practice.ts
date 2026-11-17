import type { Practice } from '../../engine/types'

/** Problems on online judges for each lesson, easiest first within a judge. Titles are checked with `npm run check:practice`. */
export const PRACTICE: Record<string, Practice[]> = {
  'bubble-sort': [
    { judge: 'luogu', id: 'P1116', title: 'P1116 车厢重组' },
    { judge: 'luogu', id: 'P1059', title: 'P1059 [NOIP 2006 普及组] 明明的随机数' },
  ],
  'selection-sort': [
    { judge: 'luogu', id: 'P1059', title: 'P1059 [NOIP 2006 普及组] 明明的随机数' },
    { judge: 'luogu', id: 'P1093', title: 'P1093 [NOIP 2007 普及组] 奖学金' },
  ],
  'insertion-sort': [
    { judge: 'luogu', id: 'P1059', title: 'P1059 [NOIP 2006 普及组] 明明的随机数' },
    { judge: 'luogu', id: 'P1093', title: 'P1093 [NOIP 2007 普及组] 奖学金' },
  ],
  'counting-sort': [
    { judge: 'luogu', id: 'P1271', title: 'P1271 【深基9.例1】选举学生会' },
  ],
  'merge-sort': [
    { judge: 'acwing', id: '789', title: '787. 归并排序' },
    { judge: 'acwing', id: '790', title: '788. 逆序对的数量' },
    { judge: 'luogu', id: 'P1177', title: 'P1177 【模板】排序' },
    { judge: 'luogu', id: 'P1908', title: 'P1908 逆序对' },
  ],
  'quick-sort': [
    { judge: 'acwing', id: '787', title: '785. 快速排序' },
    { judge: 'acwing', id: '788', title: '786. 第k个数' },
    { judge: 'luogu', id: 'P1177', title: 'P1177 【模板】排序' },
    { judge: 'luogu', id: 'P1923', title: 'P1923 【深基9.例4】求第 k 小的数' },
  ],
  'heap-sort': [
    { judge: 'acwing', id: '840', title: '838. 堆排序' },
    { judge: 'acwing', id: '841', title: '839. 模拟堆' },
    { judge: 'luogu', id: 'P3378', title: 'P3378 【模板】堆' },
    { judge: 'luogu', id: 'P1090', title: 'P1090 [NOIP 2004 提高组] 合并果子' },
  ],
  'radix-sort': [
    { judge: 'luogu', id: 'P1177', title: 'P1177 【模板】排序' },
  ],
}
