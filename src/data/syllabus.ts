import type { Level } from '../engine/types'

/** [difficulty, 中文, English, lesson ids covering this point] — transcribed from specs/NOI_Syllabus_Edition_2025.md. */
export type Item = [diff: number, zh: string, en: string, lessons?: string[]]
export interface Group { zh: string; en: string; items: Item[] }
export interface Section { no: string; zh: string; en: string; groups: Group[] }
export interface SylLevel { id: Level; no: string; sections: Section[] }

const g = (zh: string, en: string, items: Item[]): Group => ({ zh, en, items })

export const SYLLABUS: SylLevel[] = [
  {
    id: 'J', no: '2.1', sections: [
      { no: '2.1.1', zh: '基础知识与编程环境', en: 'Basics and programming environment', groups: [g('', '', [
        [1, '计算机的基本构成（CPU、内存、I/O设备等）', 'Basic computer components (CPU, memory, I/O devices)'],
        [1, 'Windows、Linux等操作系统的基本概念及其常见操作', 'Operating system concepts and common operations (Windows, Linux)'],
        [1, '计算机网络和Internet的基本概念', 'Basic concepts of computer networks and the Internet'],
        [1, '计算机的历史和常见用途', 'History and common uses of computers'],
        [1, 'NOI以及相关活动的历史', 'History of NOI and related events'],
        [1, 'NOI以及相关活动的规则', 'Rules of NOI and related events'],
        [1, '位、字节与字', 'Bits, bytes and words'],
        [1, '程序设计语言以及程序编译和运行的基本概念', 'Programming languages; compiling and running programs'],
        [1, '使用图形界面新建、复制、删除、移动文件或目录', 'Managing files and directories in a graphical interface'],
        [1, '使用 Windows 系统下的集成开发环境（例如Dev-C++等）', 'Using an IDE on Windows (e.g. Dev-C++)'],
        [1, '使用Linux系统下的集成开发环境（例如Code::Blocks等）', 'Using an IDE on Linux (e.g. Code::Blocks)'],
        [1, '常用编译命令g++的基本使用', 'Basic use of the g++ compiler'],
      ])] },
      { no: '2.1.2', zh: 'C++程序设计', en: 'C++ programming', groups: [
        g('程序基本概念', 'Program basics', [
          [1, '标识符、关键字、常量、变量、字符串、表达式的概念', 'Identifiers, keywords, constants, variables, strings, expressions'],
          [1, '常量与变量的命名、定义及作用', 'Naming, defining and using constants and variables'],
          [2, '头文件与名字空间的概念', 'Header files and namespaces'],
          [2, '编辑、编译、解释、调试的概念', 'Editing, compiling, interpreting, debugging'],
        ]),
        g('基本数据类型', 'Basic data types', [
          [1, '整数型：int、long long', 'Integers: int, long long'],
          [1, '实数型：float、double', 'Reals: float, double'],
          [1, '字符型：char', 'Characters: char'],
          [1, '布尔型：bool', 'Booleans: bool'],
        ]),
        g('程序基本语句', 'Basic statements', [
          [2, 'cin语句、scanf语句、cout语句、printf语句、赋值语句、复合语句', 'cin, scanf, cout, printf, assignment and compound statements'],
          [2, 'if语句、switch语句、多层条件语句', 'if, switch and nested conditionals'],
          [2, 'for语句、while语句、do while语句', 'for, while and do-while loops'],
          [3, '多层循环语句', 'Nested loops'],
        ]),
        g('基本运算', 'Basic operations', [
          [1, '算术运算：加、减、乘、除、整除、求余', 'Arithmetic: + − × ÷, integer division, remainder'],
          [1, '关系运算：大于、大于等于、小于、小于等于、等于、不等于', 'Relational operators'],
          [1, '逻辑运算：与（&&）、或（||）、非（!）', 'Logical operators: &&, ||, !'],
          [1, '变量自增与自减运算', 'Increment and decrement'],
          [1, '三目运算', 'The ternary operator'],
          [2, '位运算：与（&）、或（|）、非（~）、异或（^）、左移（<<）、右移（>>）', 'Bitwise operators: & | ~ ^ << >>'],
        ]),
        g('数学库常用函数', 'Common math functions', [
          [3, '绝对值函数、四舍五入函数、下取整函数、上取整函数、平方根函数、常用三角函数、对数函数、指数函数', 'abs, round, floor, ceil, sqrt, trigonometric, logarithm and exponential functions'],
        ]),
        g('结构化程序设计', 'Structured programming', [
          [1, '顺序结构、分支结构和循环结构', 'Sequence, selection and iteration'],
          [2, '自顶向下、逐步求精的模块化程序设计', 'Top-down, stepwise-refinement modular design'],
          [2, '流程图的概念及流程图描述', 'Flowcharts'],
        ]),
        g('数组', 'Arrays', [
          [1, '数组与数组下标', 'Arrays and indices'],
          [1, '数组的读入与输出', 'Reading and printing arrays'],
          [3, '二维数组与多维数组', 'Two- and multi-dimensional arrays'],
        ]),
        g('字符串的处理', 'String handling', [
          [2, '字符数组与相关函数', 'Character arrays and related functions'],
          [2, 'string类与相关函数', 'The string class and related functions'],
        ]),
        g('函数与递归', 'Functions and recursion', [
          [2, '函数定义与调用、形参与实参', 'Defining and calling functions; parameters and arguments'],
          [3, '传值参数与传引用参数', 'Pass by value and pass by reference'],
          [2, '常量与变量的作用范围', 'Scope of constants and variables'],
          [2, '递归函数', 'Recursive functions', ['hanoi']],
        ]),
        g('结构体与联合体', 'Structs and unions', [
          [3, '结构体', 'Structs'],
          [3, '联合体', 'Unions'],
        ]),
        g('指针与引用', 'Pointers and references', [
          [4, '指针', 'Pointers'],
          [4, '基于指针的数组访问', 'Array access through pointers'],
          [4, '字符指针', 'Character pointers'],
          [4, '指向结构体的指针', 'Pointers to structs'],
          [5, '引用', 'References'],
        ]),
        g('文件及基本读写', 'Files and basic I/O', [
          [2, '文件的基本概念、文本文件的基本操作', 'File concepts; basic text-file operations'],
          [2, '文本文件类型与二进制文件类型', 'Text files and binary files'],
          [2, '文件重定向、文件读写等操作', 'File redirection, reading and writing files'],
        ]),
        g('STL模板', 'STL', [
          [3, '常用函数与算法模板：min、max、swap、sort', 'Common functions and algorithms: min, max, swap, sort'],
          [4, '栈（stack）、队列（queue）、链表（list）、向量（vector）等容器', 'Containers: stack, queue, list, vector'],
        ]),
      ] },
      { no: '2.1.3', zh: '数据结构', en: 'Data structures', groups: [
        g('线性结构', 'Linear structures', [
          [3, '链表：单链表、双向链表、循环链表', 'Linked lists: singly, doubly, circular'],
          [3, '栈', 'Stack', ['stack']],
          [3, '队列', 'Queue', ['bfs-maze']],
        ]),
        g('简单树', 'Simple trees', [
          [3, '树的定义与相关概念', 'Trees: definition and terminology'],
          [4, '树的表示与存储', 'Representing and storing trees'],
          [3, '二叉树的定义与基本性质', 'Binary trees: definition and basic properties'],
          [4, '二叉树的表示与存储', 'Representing and storing binary trees', ['bt-traversal']],
          [4, '二叉树的遍历：前序、中序、后序', 'Binary tree traversals: pre-, in-, post-order', ['bt-traversal']],
        ]),
        g('特殊树', 'Special trees', [
          [4, '完全二叉树的定义与基本性质', 'Complete binary trees: definition and properties'],
          [4, '完全二叉树的数组表示法', 'Array representation of complete binary trees', ['heap-sort']],
          [4, '哈夫曼树的定义和构造、哈夫曼编码', 'Huffman trees and Huffman coding', ['huffman']],
          [4, '二叉搜索树的定义和构造', 'Binary search trees: definition and construction', ['bst']],
        ]),
        g('简单图', 'Simple graphs', [
          [3, '图的定义与相关概念', 'Graphs: definition and terminology'],
          [4, '图的表示与存储：邻接矩阵', 'Graph storage: adjacency matrix', ['floyd']],
          [4, '图的表示与存储：邻接表', 'Graph storage: adjacency list', ['graph-dfs']],
        ]),
      ] },
      { no: '2.1.4', zh: '算法', en: 'Algorithms', groups: [
        g('算法概念与描述', 'Concept and description of algorithms', [
          [1, '算法概念', 'What an algorithm is'],
          [2, '算法描述：自然语言描述、流程图描述、伪代码描述', 'Describing algorithms: natural language, flowcharts, pseudocode'],
        ]),
        g('入门算法', 'First algorithms', [
          [1, '枚举法', 'Enumeration (brute force)'],
          [1, '模拟法', 'Simulation'],
        ]),
        g('基础算法', 'Basic algorithms', [
          [3, '贪心法', 'Greedy', ['huffman']],
          [3, '递推法', 'Recurrence (iteration)', ['pascal']],
          [4, '递归法', 'Recursion', ['hanoi']],
          [4, '二分法', 'Binary search', ['binary-search']],
          [4, '倍增法', 'Doubling', ['fast-pow', 'sparse-table']],
        ]),
        g('算法策略', 'Algorithmic techniques', [
          [3, '前缀和', 'Prefix sums', ['prefix-sum']],
          [4, '差分', 'Difference arrays', ['difference']],
        ]),
        g('数值处理算法', 'Numeric algorithms', [
          [4, '高精度的加法', 'High-precision addition', ['bignum-add']],
          [4, '高精度的减法', 'High-precision subtraction'],
          [4, '高精度的乘法', 'High-precision multiplication', ['bignum-mul']],
          [4, '高精度整数除以单精度整数的商和余数', 'High-precision ÷ single-precision: quotient and remainder'],
        ]),
        g('排序算法', 'Sorting', [
          [3, '排序的基本概念', 'Basic concepts of sorting'],
          [3, '冒泡排序', 'Bubble sort', ['bubble-sort']],
          [3, '选择排序', 'Selection sort', ['selection-sort']],
          [3, '插入排序', 'Insertion sort', ['insertion-sort']],
          [3, '计数排序', 'Counting sort', ['counting-sort']],
        ]),
        g('搜索算法', 'Search', [
          [5, '深度优先搜索', 'Depth-first search', ['n-queens']],
          [5, '广度优先搜索', 'Breadth-first search', ['bfs-maze']],
        ]),
        g('图论算法', 'Graph algorithms', [
          [4, '深度优先遍历', 'Depth-first traversal', ['graph-dfs']],
          [4, '广度优先遍历', 'Breadth-first traversal', ['graph-bfs']],
          [5, '泛洪算法（Flood Fill）', 'Flood fill', ['flood-fill']],
        ]),
        g('动态规划', 'Dynamic programming', [
          [4, '动态规划的基本思路', 'The basic idea of dynamic programming', ['lis']],
          [4, '简单一维动态规划', 'Simple one-dimensional DP', ['lis']],
          [5, '简单背包类型动态规划', 'Simple knapsack DP', ['knapsack']],
          [5, '简单区间类型动态规划', 'Simple interval DP', ['interval-dp']],
        ]),
      ] },
      { no: '2.1.5', zh: '数学与其他', en: 'Mathematics and others', groups: [
        g('数及其运算', 'Numbers and arithmetic', [
          [1, '自然数、整数、有理数、实数及其算术运算（加、减、乘、除）', 'Natural, integer, rational and real numbers and their arithmetic'],
          [1, '进制与进制转换：二进制、八进制、十进制、十六进制', 'Number bases and conversion: binary, octal, decimal, hexadecimal', ['base-conversion']],
        ]),
        g('初等数学', 'Elementary mathematics', [
          [1, '代数（初中部分）', 'Algebra (junior secondary)'],
          [1, '几何（初中部分）', 'Geometry (junior secondary)'],
        ]),
        g('初等数论', 'Elementary number theory', [
          [3, '整除、因数、倍数、指数、质（素）数、合数', 'Divisibility, factors, multiples, exponents, primes, composites'],
          [3, '取整', 'Floor and ceiling'],
          [3, '模运算与取余', 'Modular arithmetic and remainders'],
          [3, '整数唯一分解定理', 'The fundamental theorem of arithmetic'],
          [3, '辗转相除法（欧几里得算法）', 'The Euclidean algorithm', ['gcd']],
          [4, '素数筛法：埃氏筛法与线性筛法', 'Prime sieves: Eratosthenes and the linear sieve', ['sieve', 'linear-sieve']],
        ]),
        g('离散与组合数学', 'Discrete mathematics and combinatorics', [
          [2, '集合', 'Sets'],
          [2, '加法原理', 'The rule of sum'],
          [2, '乘法原理', 'The rule of product'],
          [4, '排列', 'Permutations'],
          [4, '组合', 'Combinations', ['pascal']],
          [4, '杨辉三角', "Pascal's triangle", ['pascal']],
        ]),
        g('其他', 'Others', [
          [2, 'ASCII码', 'ASCII'],
        ]),
      ] },
    ],
  },
  {
    id: 'S', no: '2.2', sections: [
      { no: '2.2.1', zh: '基础知识与编程环境', en: 'Basics and programming environment', groups: [g('', '', [
        [5, 'Linux系统终端中常用的文件与目录操作命令', 'Common file and directory commands in a Linux terminal'],
        [5, 'Linux系统下常见文本编辑工具的使用', 'Common text editors on Linux'],
        [5, '常用编译命令g++与相关编译选项', 'g++ and its common options'],
        [5, '在Linux系统终端中运行程序，使用time命令查看程序用时', 'Running programs in a terminal; timing them with time'],
        [5, '调试工具GDB的使用', 'Debugging with GDB'],
      ])] },
      { no: '2.2.2', zh: 'C++程序设计', en: 'C++ programming', groups: [
        g('类（class）', 'Classes', [
          [6, '类的概念及简单应用', 'Classes: concept and simple use'],
          [6, '成员函数和运算符重载', 'Member functions and operator overloading'],
        ]),
        g('STL模板', 'STL', [
          [5, '容器（container）和迭代器（iterator）', 'Containers and iterators'],
          [5, '对（pair）、元组（tuple）', 'pair and tuple'],
          [5, '集合（set）、多重集合（multiset）', 'set and multiset'],
          [5, '双端队列（deque）、优先队列（priority_queue）', 'deque and priority_queue'],
          [5, '映射（map）、多重映射（multimap）', 'map and multimap'],
          [5, '位集合（bitset）', 'bitset'],
          [5, '算法模板库中的常用函数', 'Common functions of the algorithm library'],
        ]),
      ] },
      { no: '2.2.3', zh: '数据结构', en: 'Data structures', groups: [
        g('线性结构', 'Linear structures', [
          [5, '双端栈', 'Double-ended stack'],
          [5, '双端队列', 'Deque', ['monotonic-queue']],
          [5, '单调队列', 'Monotonic queue', ['monotonic-queue']],
          [6, '优先队列', 'Priority queue', ['heap-sort', 'dijkstra']],
          [6, 'ST表（Sparse Table）', 'Sparse table', ['sparse-table']],
        ]),
        g('集合与森林', 'Sets and forests', [
          [6, '并查集', 'Disjoint set union', ['dsu']],
          [6, '树的孩子兄弟表示法', 'Left-child right-sibling representation'],
        ]),
        g('特殊树', 'Special trees', [
          [6, '二叉堆', 'Binary heap', ['heap-sort']],
          [6, '树状数组', 'Fenwick tree (binary indexed tree)', ['fenwick']],
          [6, '线段树', 'Segment tree', ['segment-tree']],
          [6, '字典树（Trie）', 'Trie', ['trie']],
          [7, '笛卡尔树', 'Cartesian tree'],
          [8, '平衡树：AVL、Treap、Splay等', 'Balanced trees: AVL, Treap, Splay, …', ['treap']],
        ]),
        g('常见图', 'Common graphs', [
          [5, '稀疏图', 'Sparse graphs'],
          [6, '偶图（二分图）', 'Bipartite graphs', ['bipartite']],
          [6, '欧拉图', 'Eulerian graphs'],
          [6, '有向无环图', 'Directed acyclic graphs', ['topo-sort']],
          [7, '连通图与强连通图', 'Connected and strongly connected graphs', ['tarjan-scc']],
          [7, '双连通图', 'Biconnected graphs', ['cut-bridge']],
        ]),
        g('哈希表', 'Hash tables', [
          [5, '数值哈希函数构造', 'Hash functions for numbers'],
          [6, '字符串哈希函数构造', 'Hash functions for strings'],
          [6, '哈希冲突的常用处理方法', 'Common ways of resolving collisions'],
        ]),
      ] },
      { no: '2.2.4', zh: '算法', en: 'Algorithms', groups: [
        g('复杂度分析', 'Complexity analysis', [
          [6, '时间复杂度分析', 'Time complexity analysis'],
          [6, '空间复杂度分析', 'Space complexity analysis'],
        ]),
        g('算法策略', 'Algorithmic techniques', [
          [6, '离散化', 'Coordinate compression'],
          [7, '扫描线', 'Sweep line'],
        ]),
        g('基础算法', 'Basic algorithms', [
          [6, '分治算法', 'Divide and conquer', ['merge-sort']],
        ]),
        g('排序算法', 'Sorting', [
          [5, '归并排序', 'Merge sort', ['merge-sort']],
          [5, '快速排序', 'Quicksort', ['quick-sort']],
          [6, '堆排序', 'Heap sort', ['heap-sort']],
          [5, '桶排序', 'Bucket sort', ['radix-sort']],
          [6, '基数排序', 'Radix sort', ['radix-sort']],
        ]),
        g('字符串算法', 'String algorithms', [
          [6, '字符串匹配：KMP算法', 'String matching: KMP', ['kmp']],
          [7, 'Manacher算法', "Manacher's algorithm", ['manacher']],
        ]),
        g('搜索算法', 'Search', [
          [6, '搜索的剪枝优化', 'Pruning', ['n-queens']],
          [6, '记忆化搜索', 'Memoised search'],
          [7, '启发式搜索', 'Heuristic search', ['a-star']],
          [7, '双向广度优先搜索', 'Bidirectional BFS'],
          [7, '迭代加深搜索', 'Iterative deepening'],
        ]),
        g('图论算法', 'Graph algorithms', [
          [6, '最小生成树：Prim和Kruskal等算法', 'Minimum spanning tree: Prim, Kruskal', ['prim', 'kruskal']],
          [6, '单源最短路：Bellman-Ford、Dijkstra、SPFA等算法', 'Single-source shortest paths: Bellman-Ford, Dijkstra, SPFA', ['dijkstra', 'spfa']],
          [7, '单源次短路', 'Second-shortest path'],
          [6, 'Floyd-Warshall算法', 'Floyd-Warshall', ['floyd']],
          [6, '有向无环图的拓扑排序', 'Topological sort of a DAG', ['topo-sort']],
          [6, '欧拉道路和欧拉回路', 'Euler paths and circuits'],
          [6, '二分图的判定', 'Testing bipartiteness', ['bipartite']],
          [7, '强连通分量', 'Strongly connected components', ['tarjan-scc']],
          [7, '割点、割边', 'Cut vertices and bridges', ['cut-bridge']],
          [6, '树的重心、直径、DFS序与欧拉序', 'Tree centroid, diameter, DFS order, Euler tour', ['tree-diameter']],
          [6, '树上差分、子树和与倍增', 'Tree differences, subtree sums, binary lifting', ['lca']],
          [6, '最近公共祖先', 'Lowest common ancestor', ['lca']],
        ]),
        g('动态规划', 'Dynamic programming', [
          [6, '多维动态规划', 'Multi-dimensional DP', ['lcs']],
          [6, '树型动态规划', 'Tree DP', ['tree-dp']],
          [7, '状态压缩动态规划', 'Bitmask DP', ['bitmask-dp']],
          [8, '动态规划的常用优化', 'Common DP optimisations', ['monotonic-queue']],
        ]),
      ] },
      { no: '2.2.5', zh: '数学与其他', en: 'Mathematics and others', groups: [
        g('初等数学', 'Elementary mathematics', [
          [5, '代数（高中部分）', 'Algebra (senior secondary)'],
          [6, '几何（高中部分）', 'Geometry (senior secondary)'],
        ]),
        g('初等数论', 'Elementary number theory', [
          [5, '同余式', 'Congruences'],
          [7, '欧拉定理和欧拉函数', "Euler's theorem and totient function"],
          [7, '费马小定理', "Fermat's little theorem"],
          [7, '威尔逊定理', "Wilson's theorem"],
          [7, '裴蜀定理', "Bézout's identity", ['exgcd']],
          [7, '模运算意义下的逆元', 'Modular inverses', ['exgcd']],
          [7, '扩展欧几里得算法', 'Extended Euclidean algorithm', ['exgcd']],
          [7, '中国剩余定理', 'Chinese remainder theorem'],
        ]),
        g('离散与组合数学', 'Discrete mathematics and combinatorics', [
          [6, '多重集合', 'Multisets'],
          [6, '等价关系与等价类', 'Equivalence relations and classes'],
          [6, '多重集上的排列', 'Permutations of multisets'],
          [6, '多重集上的组合', 'Combinations of multisets'],
          [6, '错排列、圆排列', 'Derangements and circular permutations'],
          [6, '鸽巢原理', 'The pigeonhole principle'],
          [6, '二项式定理', 'The binomial theorem'],
          [7, '容斥原理', 'Inclusion–exclusion'],
          [7, '卡特兰（Catalan）数', 'Catalan numbers'],
        ]),
        g('线性代数', 'Linear algebra', [
          [5, '向量与矩阵的概念', 'Vectors and matrices'],
          [6, '向量的运算', 'Vector operations'],
          [6, '矩阵的初等变换', 'Elementary row operations', ['gauss']],
          [6, '矩阵的运算：加法、减法、乘法与转置', 'Matrix addition, subtraction, multiplication, transpose'],
          [6, '特殊矩阵的概念：单位阵、三角阵、对称阵和稀疏矩阵', 'Special matrices: identity, triangular, symmetric, sparse'],
          [7, '高斯消元法', 'Gaussian elimination', ['gauss']],
        ]),
      ] },
    ],
  },
  {
    id: 'N', no: '2.3', sections: [
      { no: '2.3.1', zh: 'C++程序设计', en: 'C++ programming', groups: [g('', '', [
        [8, '面向对象的程序设计思想（OOP）', 'Object-oriented programming'],
      ])] },
      { no: '2.3.2', zh: '数据结构', en: 'Data structures', groups: [
        g('线性结构', 'Linear structures', [
          [8, '块状链表', 'Unrolled linked list'],
        ]),
        g('复杂树', 'Advanced trees', [
          [8, '树链剖分', 'Heavy-light decomposition', ['hld']],
          [10, '动态树：LCT', 'Dynamic trees: link-cut tree'],
          [9, '树套树', 'Tree of trees (nested structures)'],
          [9, 'k-d树', 'k-d tree'],
          [8, '虚树', 'Virtual tree'],
        ]),
        g('可合并堆', 'Mergeable heaps', [
          [8, '左偏树', 'Leftist heap', ['leftist-heap']],
          [10, '二项堆', 'Binomial heap'],
        ]),
        g('可持久化数据结构', 'Persistent data structures', [
          [8, '可持久化线段树', 'Persistent segment tree'],
          [9, '其他可持久化数据结构', 'Other persistent data structures'],
        ]),
      ] },
      { no: '2.3.3', zh: '算法', en: 'Algorithms', groups: [
        g('算法策略', 'Algorithmic techniques', [
          [8, '分块', 'Square-root decomposition', ['sqrt-decomposition']],
          [8, '离线处理思想', 'Offline processing'],
          [9, '复杂分治思想', 'Advanced divide and conquer'],
          [9, '平衡规划思想', 'Balancing (trade-off) techniques', ['sqrt-decomposition']],
          [9, '构造思想', 'Constructive techniques'],
        ]),
        g('字符串算法', 'String algorithms', [
          [8, '扩展KMP算法', 'Extended KMP (Z-function)', ['z-function']],
          [8, '有穷自动机的概念', 'Finite automata'],
          [8, 'AC自动机', 'Aho–Corasick automaton', ['ac-automaton']],
          [8, '后缀数组', 'Suffix array', ['suffix-array']],
          [9, '后缀树', 'Suffix tree'],
          [10, '后缀自动机', 'Suffix automaton'],
        ]),
        g('图论算法', 'Graph algorithms', [
          [8, '基环树', 'Unicyclic graphs (pseudotrees)'],
          [10, '最小树形图', 'Minimum arborescence'],
          [8, '2-SAT', '2-SAT'],
          [8, '网络流', 'Network flow', ['dinic']],
          [10, '图的支配集、独立集与覆盖集', 'Dominating, independent and covering sets'],
          [8, '匈牙利算法', 'The Hungarian algorithm (bipartite matching)', ['hungarian']],
          [10, 'KM算法', 'Kuhn–Munkres algorithm'],
          [10, '一般图的匹配', 'Matching in general graphs'],
        ]),
        g('动态规划', 'Dynamic programming', [
          [9, '复杂动态规划模型的构建', 'Building advanced DP models'],
          [9, '复杂动态规划模型的优化', 'Optimising advanced DP models'],
        ]),
      ] },
      { no: '2.3.4', zh: '数学与其他', en: 'Mathematics and others', groups: [
        g('初等数论', 'Elementary number theory', [
          [8, '原根和指数', 'Primitive roots and indices'],
          [8, '大步小步（Baby Step Giant Step，BSGS）算法', 'Baby-step giant-step'],
          [9, '狄利克雷（Dirichlet）卷积', 'Dirichlet convolution'],
          [10, '二次剩余', 'Quadratic residues'],
          [10, '二次同余式', 'Quadratic congruences'],
        ]),
        g('离散与组合数学', 'Discrete mathematics and combinatorics', [
          [9, '群及其基本性质', 'Groups and their basic properties'],
          [9, '置换群与循环群', 'Permutation groups and cyclic groups'],
          [9, '母函数', 'Generating functions'],
          [9, '莫比乌斯反演', 'Möbius inversion'],
          [9, 'Burnside引理与Pólya定理', "Burnside's lemma and Pólya's theorem"],
          [9, '斯特林（Stirling）数', 'Stirling numbers'],
          [9, '无根树的Prüfer 序列', 'Prüfer sequences of unrooted trees', ['prufer']],
        ]),
        g('线性代数', 'Linear algebra', [
          [9, '逆矩阵', 'Inverse matrices'],
          [9, '行列式', 'Determinants'],
          [9, '向量空间与线性相关', 'Vector spaces and linear dependence'],
          [9, '基与线性基', 'Bases and linear (XOR) bases'],
        ]),
        g('高等数学', 'Calculus', [
          [8, '多项式函数的微分', 'Differentiating polynomials'],
          [8, '多项式函数的积分', 'Integrating polynomials'],
          [10, '泰勒（Taylor）级数', 'Taylor series'],
          [10, '快速傅里叶变换', 'Fast Fourier transform'],
        ]),
        g('概率论', 'Probability', [
          [8, '概率的基本概念', 'Basic concepts of probability'],
          [9, '离散随机变量的期望与方差', 'Expectation and variance of discrete random variables'],
          [9, '条件概率', 'Conditional probability'],
          [9, '贝叶斯公式', "Bayes' formula"],
        ]),
        g('博弈论', 'Game theory', [
          [9, '尼姆（Nim）博弈', 'Nim', ['nim-sg']],
          [9, 'SG函数', 'Sprague–Grundy function', ['nim-sg']],
        ]),
        g('最优化', 'Optimisation', [
          [10, '单纯形法', 'The simplex method'],
        ]),
        g('计算几何', 'Computational geometry', [
          [8, '点、线、面之间位置关系的判定', 'Relative position of points, lines and planes', ['convex-hull']],
          [8, '一般图形面积的计算', 'Area of general figures'],
          [8, '二维凸包', '2-D convex hull', ['convex-hull']],
          [9, '半平面交', 'Half-plane intersection'],
        ]),
        g('信息论', 'Information theory', [
          [10, '熵、互信息、条件熵、相对熵', 'Entropy, mutual information, conditional and relative entropy'],
        ]),
        g('其他', 'Others', [
          [10, '信息复杂度的概念', 'Information complexity'],
          [10, '描述复杂度的概念', 'Descriptive (Kolmogorov) complexity'],
          [10, '通讯复杂度的概念', 'Communication complexity'],
        ]),
      ] },
    ],
  },
]

export const SECTION_COUNT = SYLLABUS.reduce((s, l) => s + l.sections.reduce((a, x) => a + x.groups.reduce((b, y) => b + y.items.length, 0), 0), 0)
