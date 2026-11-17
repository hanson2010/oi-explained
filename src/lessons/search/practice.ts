import type { Practice } from '../../engine/types'

/** Problems on online judges for each lesson, easiest first within a judge. Titles are checked with `npm run check:practice`. */
export const PRACTICE: Record<string, Practice[]> = {
  permutations: [
    { judge: 'acwing', id: '844', title: '842. 排列数字' },
    { judge: 'acwing', id: '96', title: '94. 递归实现排列型枚举' },
    { judge: 'luogu', id: 'P1706', title: 'P1706 全排列问题' },
    { judge: 'luogu', id: 'P1088', title: 'P1088 [NOIP 2004 普及组] 火星人' },
  ],
  'n-queens': [
    { judge: 'acwing', id: '845', title: '843. n-皇后问题' },
    { judge: 'luogu', id: 'P1219', title: 'P1219 [USACO1.5] 八皇后 Checker Challenge' },
    { judge: 'luogu', id: 'P1562', title: 'P1562 还是 N 皇后' },
  ],
  'bfs-maze': [
    { judge: 'acwing', id: '846', title: '844. 走迷宫' },
    { judge: 'acwing', id: '1078', title: '1076. 迷宫问题' },
    { judge: 'luogu', id: 'P1746', title: 'P1746 离开中山路' },
    { judge: 'luogu', id: 'P1443', title: 'P1443 马的遍历' },
  ],
  'flood-fill': [
    { judge: 'acwing', id: '1099', title: '1097. 池塘计数' },
    { judge: 'acwing', id: '1100', title: '1098. 城堡问题' },
    { judge: 'luogu', id: 'P1451', title: 'P1451 求细胞数量' },
    { judge: 'luogu', id: 'P1596', title: 'P1596 [USACO10OCT] Lake Counting S' },
    { judge: 'cf', id: '723D', title: '723D. Lakes in Berland' },
  ],
  'memo-search': [
    { judge: 'acwing', id: '903', title: '901. 滑雪' },
    { judge: 'luogu', id: 'P1464', title: 'P1464 [PacNW 1999] Function' },
    { judge: 'luogu', id: 'P1434', title: 'P1434 [SHOI2002] 滑雪' },
  ],
  'a-star': [
    { judge: 'acwing', id: '181', title: '179. 八数码' },
    { judge: 'acwing', id: '180', title: '178. 第K短路' },
    { judge: 'luogu', id: 'P1379', title: 'P1379 八数码难题' },
    { judge: 'luogu', id: 'P2901', title: 'P2901 [USACO08MAR] Cow Jogging G' },
  ],
  'bidir-bfs': [
    { judge: 'acwing', id: '192', title: '190. 字串变换' },
    { judge: 'luogu', id: 'P1379', title: 'P1379 八数码难题' },
  ],
  iddfs: [
    { judge: 'acwing', id: '172', title: '170. 加成序列' },
    { judge: 'luogu', id: 'P2324', title: 'P2324 [SCOI2005] 骑士精神' },
    { judge: 'luogu', id: 'P1763', title: 'P1763 埃及分数' },
  ],
}
