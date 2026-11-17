import type { Practice } from '../../engine/types'

/** Problems on online judges for each lesson, easiest first within a judge. Titles are checked with `npm run check:practice`. */
export const PRACTICE: Record<string, Practice[]> = {
  stack: [
    { judge: 'acwing', id: '3696', title: '3693. 括号匹配' },
    { judge: 'acwing', id: '830', title: '828. 模拟栈' },
    { judge: 'luogu', id: 'P1739', title: 'P1739 表达式括号匹配' },
    { judge: 'luogu', id: 'P4387', title: 'P4387 【深基15.习9】验证栈序列' },
    { judge: 'cf', id: '5C', title: '5C. Longest Regular Bracket Sequence' },
  ],
  'linked-list': [
    { judge: 'acwing', id: '828', title: '826. 单链表' },
    { judge: 'acwing', id: '829', title: '827. 双链表' },
    { judge: 'luogu', id: 'B3631', title: 'B3631 单向链表' },
    { judge: 'luogu', id: 'P1160', title: 'P1160 队列安排' },
    { judge: 'cf', id: '1154E', title: '1154E. Two Teams' },
  ],
  'bt-traversal': [
    { judge: 'acwing', id: '1261', title: '1259. 二叉树遍历' },
    { judge: 'luogu', id: 'B3642', title: 'B3642 二叉树的遍历' },
    { judge: 'luogu', id: 'P1305', title: 'P1305 新二叉树' },
    { judge: 'luogu', id: 'P1030', title: 'P1030 [NOIP 2001 普及组] 求先序排列' },
  ],
  huffman: [
    { judge: 'acwing', id: '150', title: '148. 合并果子' },
    { judge: 'acwing', id: '151', title: '149. 荷马史诗' },
    { judge: 'luogu', id: 'P1090', title: 'P1090 [NOIP 2004 提高组] 合并果子' },
    { judge: 'luogu', id: 'P2168', title: 'P2168 [NOI2015] 荷马史诗' },
  ],
  bst: [
    { judge: 'acwing', id: '3789', title: '3786. 二叉排序树' },
    { judge: 'luogu', id: 'P5076', title: 'P5076 【深基16.例7】普通二叉树（简化版）' },
  ],
  'monotonic-queue': [
    { judge: 'acwing', id: '156', title: '154. 滑动窗口' },
    { judge: 'acwing', id: '137', title: '135. 最大子序和' },
    { judge: 'luogu', id: 'P2032', title: 'P2032 扫描' },
    { judge: 'luogu', id: 'P1886', title: 'P1886 【模板】单调队列 / 滑动窗口' },
  ],
  'sparse-table': [
    { judge: 'acwing', id: '1272', title: '1270. 数列区间最大值' },
    { judge: 'acwing', id: '1275', title: '1273. 天才的记忆' },
    { judge: 'luogu', id: 'P3865', title: 'P3865 【模板】ST 表 & RMQ 问题' },
    { judge: 'luogu', id: 'P2880', title: 'P2880 [USACO07JAN] Balanced Lineup G' },
    { judge: 'cf', id: '359D', title: '359D. Pair of Numbers' },
  ],
  dsu: [
    { judge: 'acwing', id: '838', title: '836. 合并集合' },
    { judge: 'acwing', id: '839', title: '837. 连通块中点的数量' },
    { judge: 'luogu', id: 'P3367', title: 'P3367 【模板】并查集' },
    { judge: 'luogu', id: 'P1551', title: 'P1551 亲戚' },
    { judge: 'cf', id: '1167C', title: '1167C. News Distribution' },
  ],
  fenwick: [
    { judge: 'acwing', id: '1266', title: '1264. 动态求连续区间和' },
    { judge: 'acwing', id: '243', title: '241. 楼兰图腾' },
    { judge: 'luogu', id: 'P3374', title: 'P3374 【模板】树状数组 1' },
    { judge: 'luogu', id: 'P3368', title: 'P3368 【模板】树状数组 2' },
    { judge: 'cf', id: '1676H2', title: '1676H2. Maximum Crossings (Hard Version)' },
  ],
  'segment-tree': [
    { judge: 'acwing', id: '244', title: '243. 一个简单的整数问题2' },
    { judge: 'luogu', id: 'P3372', title: 'P3372 【模板】线段树 1' },
    { judge: 'luogu', id: 'P3373', title: 'P3373 【模板】线段树 2' },
    { judge: 'cf', id: '52C', title: '52C. Circular RMQ' },
  ],
  trie: [
    { judge: 'acwing', id: '837', title: '835. Trie字符串统计' },
    { judge: 'acwing', id: '144', title: '142. 前缀统计' },
    { judge: 'luogu', id: 'P8306', title: 'P8306 【模板】字典树 / Trie' },
    { judge: 'luogu', id: 'P2580', title: 'P2580 于是他错误的点名开始了' },
  ],
  'hash-table': [
    { judge: 'acwing', id: '842', title: '840. 模拟散列表' },
    { judge: 'luogu', id: 'P4305', title: 'P4305 [JLOI2011] 不重复数字' },
    { judge: 'cf', id: '4C', title: '4C. Registration System' },
  ],
  'sweep-line': [
    { judge: 'acwing', id: '3071', title: '3068. 扫描线' },
    { judge: 'acwing', id: '249', title: '247. 亚特兰蒂斯' },
    { judge: 'luogu', id: 'P5490', title: 'P5490 【模板】扫描线 & 矩形面积并' },
    { judge: 'cf', id: '610D', title: '610D. Vika and Segments' },
  ],
  treap: [
    { judge: 'acwing', id: '255', title: '253. 普通平衡树' },
    { judge: 'luogu', id: 'P3369', title: 'P3369 【模板】普通平衡树' },
  ],
  'sqrt-decomposition': [
    { judge: 'acwing', id: '244', title: '243. 一个简单的整数问题2' },
    { judge: 'luogu', id: 'P3372', title: 'P3372 【模板】线段树 1' },
    { judge: 'luogu', id: 'P2801', title: 'P2801 教主的魔法' },
    { judge: 'cf', id: '13E', title: '13E. Holes' },
  ],
  'leftist-heap': [
    { judge: 'acwing', id: '2716', title: '2714. 左偏树' },
    { judge: 'luogu', id: 'P3377', title: 'P3377 【模板】可并堆 1' },
  ],
  'persistent-seg': [
    { judge: 'acwing', id: '257', title: '255. 第K小数' },
    { judge: 'luogu', id: 'P3834', title: 'P3834 【模板】可持久化线段树 2（静态区间第 k 小）' },
    { judge: 'cf', id: '840D', title: '840D. Destiny' },
  ],
  cdq: [
    { judge: 'acwing', id: '2817', title: '2815. 三维偏序' },
    { judge: 'luogu', id: 'P3810', title: 'P3810 【模板】三维偏序 / 陌上花开' },
  ],
}
