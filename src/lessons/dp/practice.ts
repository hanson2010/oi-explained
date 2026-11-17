import type { Practice } from '../../engine/types'

/** Problems on online judges for each lesson, easiest first within a judge. Titles are checked with `npm run check:practice`. */
export const PRACTICE: Record<string, Practice[]> = {
  lis: [
    { judge: 'acwing', id: '897', title: '895. 最长上升子序列' },
    { judge: 'acwing', id: '898', title: '896. 最长上升子序列 II' },
    { judge: 'luogu', id: 'B3637', title: 'B3637 最长上升子序列' },
    { judge: 'luogu', id: 'P1020', title: 'P1020 [NOIP 1999 提高组] 导弹拦截' },
    { judge: 'cf', id: '340D', title: '340D. Bubble Sort Graph' },
  ],
  knapsack: [
    { judge: 'acwing', id: '2', title: '2. 01背包问题' },
    { judge: 'acwing', id: '425', title: '423. 采药' },
    { judge: 'luogu', id: 'P1048', title: 'P1048 [NOIP 2005 普及组] 采药' },
    { judge: 'luogu', id: 'P1060', title: 'P1060 [NOIP 2006 普及组] 开心的金明' },
  ],
  'interval-dp': [
    { judge: 'acwing', id: '284', title: '282. 石子合并' },
    { judge: 'acwing', id: '1070', title: '1068. 环形石子合并' },
    { judge: 'luogu', id: 'P1775', title: 'P1775 石子合并（弱化版）' },
    { judge: 'luogu', id: 'P1880', title: 'P1880 [NOI1995] 石子合并' },
    { judge: 'cf', id: '1114D', title: '1114D. Flood Fill' },
  ],
  lcs: [
    { judge: 'acwing', id: '899', title: '897. 最长公共子序列' },
    { judge: 'acwing', id: '904', title: '902. 最短编辑距离' },
    { judge: 'luogu', id: 'P2758', title: 'P2758 编辑距离' },
    { judge: 'luogu', id: 'P1439', title: 'P1439 两个排列的最长公共子序列' },
  ],
  'tree-dp': [
    { judge: 'acwing', id: '287', title: '285. 没有上司的舞会' },
    { judge: 'luogu', id: 'P1352', title: 'P1352 没有上司的舞会' },
    { judge: 'luogu', id: 'P2015', title: 'P2015 二叉苹果树' },
  ],
  'bitmask-dp': [
    { judge: 'acwing', id: '93', title: '91. 最短Hamilton路径' },
    { judge: 'luogu', id: 'P1171', title: 'P1171 售货员的难题' },
    { judge: 'luogu', id: 'P1433', title: 'P1433 吃奶酪' },
    { judge: 'cf', id: '8C', title: '8C. Looking for Order' },
  ],
  'expect-dp': [
    { judge: 'acwing', id: '219', title: '217. 绿豆蛙的归宿' },
    { judge: 'luogu', id: 'P4316', title: 'P4316 绿豆蛙的归宿' },
    { judge: 'cf', id: '839C', title: '839C. Journey' },
  ],
}
