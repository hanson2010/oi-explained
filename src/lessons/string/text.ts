import type { L } from '../../engine/types'
import type { Prose } from '../extras'

/** The problem each lesson solves, why the method works, and common mistakes. */
export const TEXT: Record<string, Prose> = {
  kmp: {
    problem: ['Given a text and a pattern, find every position at which the pattern occurs in the text.', '给定文本串和模式串，求模式串在文本串中每一次出现的位置。'],
    why: ['The naive method lines the pattern up at each position and compares; after a mismatch it moves the pattern one step and starts comparing from scratch, re-reading text it has already seen — O(n · m) in the worst case. KMP never re-reads. Suppose the first j characters of the pattern matched and the next one did not. Those j text characters are known: they equal the pattern\'s own first j characters. The pattern can only match again at a shift where its beginning agrees with the end of what was just matched — that is, where a prefix of the matched part equals a suffix of it. Such a prefix-suffix is called a border, and the longest border of every pattern prefix can be computed in advance from the pattern alone. On a mismatch, keep the longest border and continue comparing from there.', '朴素的方法是把模式串对准每个位置逐一比较；失配后把模式串移动一位，再从头开始比较，重复读取已经看过的文本——最坏情况 O(n · m)。KMP 从不重读。假设模式串的前 j 个字符已经匹配，而下一个字符失配了。这 j 个文本字符是已知的：它们就等于模式串自己的前 j 个字符。模式串下一次可能匹配的位置，必须使它的开头与刚才匹配部分的结尾相吻合——也就是说，已匹配部分的某个前缀等于它的某个后缀。这样的“前缀 = 后缀”称为 border，而模式串每个前缀的最长 border 可以只根据模式串本身预先算出。失配时，保留最长的 border，从那里继续比较。'],
    pitfalls: [
      ['Falling back with j = nxt[j] instead of nxt[j − 1] (or the other way round, depending on the indexing convention).', '回退时把 j = nxt[j − 1] 写成 j = nxt[j]（或者相反，取决于下标约定）。'],
      ['Resetting j to 0 after a full match misses overlapping occurrences such as "aa" in "aaa".', '完整匹配之后把 j 重置为 0，会漏掉重叠的出现，例如 “aaa” 中的 “aa”。'],
      ['Using if instead of while for the fallback handles only one step back.', '回退时用 if 而不是 while，只能退一步。'],
    ],
  },
  manacher: {
    problem: ['Find the length of the longest substring of a string that reads the same forwards and backwards.', '求一个字符串中最长的回文子串（正读反读都相同）的长度。'],
    why: ['Expanding around each centre character by character is O(n²) on strings like "aaaa…". Palindromes are symmetric, and that symmetry lets earlier results be reused. Keep the palindrome found so far that extends furthest to the right, with centre c and right end r. For a new centre i inside it, look at the mirror position 2c − i on the other side of c. Everything around the mirror, as far as the big palindrome reaches, is repeated around i in reverse. So the palindrome at i is at least as long as the one at the mirror — capped at the distance to r, beyond which nothing is known. Only then compare characters, and only beyond r. Each successful comparison moves r to the right, and r can move right at most n times in total, hence linear time. Inserting a separator between all characters gives odd and even palindromes a common form.', '以每个位置为中心逐字符向外扩展，在 “aaaa…” 这样的串上是 O(n²)。回文是对称的，而对称性使得之前的结果可以复用。维护目前找到的、右端最靠右的那个回文串，设它的中心为 c、右端为 r。对于位于其中的新中心 i，看它关于 c 的对称位置 2c − i。在大回文串覆盖的范围内，对称点周围的内容会倒过来在 i 的周围重复出现。所以 i 处的回文至少和对称点处的一样长——但不能超过到 r 的距离，因为 r 之外的情况还不知道。之后才需要比较字符，而且只比较 r 之外的部分。每次成功的比较都会把 r 向右推，而 r 总共最多右移 n 次，所以是线性时间。在所有字符之间插入分隔符，就把奇数长度和偶数长度的回文统一成了同一种形式。'],
    pitfalls: [
      ['Forgetting the cap r − i copies information from outside the known palindrome.', '忘记用 r − i 封顶，会把已知回文之外的信息错误地复制过来。'],
      ['Without sentinels at both ends the expansion loop runs off the string.', '两端没有哨兵时，扩展的循环会越界。'],
      ['The two sentinels must be different characters, or they match each other.', '两个哨兵必须是不同的字符，否则它们会互相匹配。'],
    ],
  },
  'z-function': {
    problem: ['For a string s, compute for every position i the length of the longest common prefix of s and the suffix of s starting at i.', '对字符串 s，求出每个位置 i 的值：从 i 开始的后缀与 s 本身的最长公共前缀的长度。'],
    why: ['Comparing from scratch at every position is O(n²). The saving comes from remembering one match: the segment [l, r) that matched a prefix of s and reaches furthest right. Inside that segment the string is a copy of its own beginning: s[l..r) equals s[0..r − l). So for a position i inside it, what follows i looks exactly like what follows i − l, at least until the segment ends. The value z[i − l] is already known; if it stays inside the segment, z[i] is the same and nothing needs comparing. If it reaches the end of the segment, take what is certain (r − i) and compare onward from r. Every successful comparison pushes r to the right, so the total number of comparisons is linear.', '在每个位置都从头比较是 O(n²)。优化来自记住一段匹配：与 s 的前缀匹配、并且右端最靠右的那一段 [l, r)。在这一段内，字符串就是它自己开头的复制品：s[l..r) 等于 s[0..r − l)。所以对于段内的位置 i，从 i 往后的内容与从 i − l 往后的内容完全一样——至少在这一段结束之前如此。z[i − l] 已经算好了；如果它没有超出这一段，z[i] 就等于它，不需要任何比较。如果它到达了这一段的末尾，就先取可以确定的部分（r − i），再从 r 开始继续比较。每次成功的比较都会把 r 向右推，所以比较的总次数是线性的。'],
    pitfalls: [
      ['Taking z[i − l] without the cap r − i claims a match that was never verified.', '直接取 z[i − l] 而不用 r − i 封顶，会把从未验证过的部分当作匹配。'],
      ['The expansion loop needs the bound i + z[i] < n.', '扩展循环必须有边界条件 i + z[i] < n。'],
      ['When matching with p + "#" + t, the separator must not occur in either string.', '用 p + "#" + t 做匹配时，分隔符不能在两个串中出现。'],
    ],
  },
  'ac-automaton': {
    problem: ['Given n patterns and a text, count the total number of occurrences of all the patterns in the text.', '给定 n 个模式串和一个文本串，求所有模式串在文本中出现的总次数。'],
    why: ['Running KMP once per pattern costs the text length times the number of patterns. To search for all patterns at once, put them into a trie, so that reading the text means walking down the trie. The difficulty is what to do when the walk cannot continue. Exactly as in KMP, do not start over: move to the longest proper suffix of what has been read that is still a path in the trie, and try again from there. That destination is the node\'s fail link. Fail links are computed level by level with a BFS, because the fail link of a node always points to a shallower node. Two refinements make the search a simple loop: missing trie edges are filled in with the edge of the fail node, and each node\'s match count absorbs the count of its fail node, since every pattern ending there also ends here.', '对每个模式串各跑一遍 KMP，代价是文本长度乘以模式串个数。要同时搜索所有模式串，就把它们放进一棵字典树，这样读文本就相当于在字典树上往下走。难点在于走不下去时怎么办。和 KMP 完全一样，不要从头再来：转移到“已读内容的最长真后缀中、仍然是字典树上一条路径的那个”，从那里再试。这个转移目标就是结点的 fail 指针。fail 指针用 BFS 逐层计算，因为一个结点的 fail 总是指向更浅的结点。再加上两点改进，搜索就变成了一个简单的循环：字典树上缺失的边用 fail 结点的对应边补上；每个结点的匹配计数加上它 fail 结点的计数，因为凡是在那里结束的模式串，也同时在这里结束。'],
    pitfalls: [
      ['Computing fail links with a DFS: they need the shallower levels to be finished first, so BFS is required.', '用 DFS 求 fail 指针：它依赖更浅的层先算完，所以必须用 BFS。'],
      ['Forgetting to combine counts along fail links misses patterns that are suffixes of other patterns.', '忘记沿 fail 指针累加计数，会漏掉那些是其他模式串后缀的模式串。'],
      ['The root\'s children have fail = root; pushing the root itself into the queue creates a self-loop bug.', '根的孩子的 fail 指向根；把根本身也放进队列会产生自环的错误。'],
    ],
  },
  'suffix-array': {
    problem: ['Sort all suffixes of a string in lexicographic order and print their starting positions.', '把一个字符串的所有后缀按字典序排序，输出它们的起始位置。'],
    why: ['Sorting the suffixes with ordinary string comparison is too slow, because comparing two suffixes can take O(n). The doubling method makes every comparison O(1). Suppose all suffixes have been ranked by their first k characters. The first 2k characters of the suffix starting at i are its first k characters followed by the first k characters of the suffix starting at i + k — and the ranks of both halves are known. So comparing two suffixes by their first 2k characters is just comparing two pairs of integers. Sort by those pairs, assign new ranks (equal pairs get equal ranks), and double k. Starting from single characters, k reaches n after log n rounds, by which time all ranks are distinct and the order is final.', '用普通的字符串比较给后缀排序太慢，因为比较两个后缀可能需要 O(n)。倍增法让每次比较都是 O(1)。假设所有后缀已经按前 k 个字符排好了名次。从 i 开始的后缀的前 2k 个字符，就是它的前 k 个字符，后面接上从 i + k 开始的后缀的前 k 个字符——而这两半的名次都是已知的。所以按前 2k 个字符比较两个后缀，只是比较两个整数二元组。按这些二元组排序，重新分配名次（相同的二元组名次相同），再把 k 翻倍。从单个字符开始，经过 log n 轮 k 就达到 n，此时所有名次互不相同，顺序也就最终确定了。'],
    pitfalls: [
      ['A suffix shorter than k has no second half; its second key must be smaller than any real rank.', '长度不足 k 的后缀没有后一半；它的第二关键字必须比任何真实的名次都小。'],
      ['Assigning new ranks in place corrupts comparisons still in progress; write to a temporary array.', '直接在原数组上更新名次会破坏仍在进行的比较；应先写入临时数组。'],
      ['With std::sort each round is O(n log n); the radix-sort version brings the total to O(n log n).', '使用 std::sort 时每轮是 O(n log n)；改用基数排序可使总复杂度降到 O(n log n)。'],
    ],
  },
}

/** Where each problem shows up outside contests, shown on the Problem tab. Same inline markup as the Ideas story. */
export const REAL: Record<string, L> = {
  kmp: ['**Ctrl+F** in a long document, or `grep` over gigabytes of logs: find every place where a word occurs, reading the text only once and never stepping back.', '在长文档里按 **Ctrl+F**，或者用 `grep` 搜索几个 GB 的日志：找出一个词出现的所有位置，而且文本只读一遍，从不回退。'],
  manacher: ['**DNA** contains palindrome-like stretches (the two strands read the same in opposite directions) that mark where enzymes cut it, and biologists scan whole genomes for such symmetric regions. Checking every centre naively is quadratic; Manacher\'s idea does it in one pass.', '**DNA** 中有类似回文的片段（两条链沿相反方向读起来相同），它们是酶切割的标记位点，生物学家要在整个基因组里寻找这样的对称区域。朴素地检查每个中心是平方级的，Manacher 的思路只需扫描一遍。'],
  'z-function': ['How much of a **file\'s beginning repeats later**? Compression tools exploit such repeats, and a spam filter can check at every position how long a known phrase matches.', '一个**文件的开头在后面重复出现**了多少？压缩工具利用的正是这种重复，垃圾邮件过滤器也可以在每个位置检查某个已知短语能匹配多长。'],
  'ac-automaton': ['An **antivirus scanner** checks a file against a million virus signatures in a single pass, and a chat filter looks for thousands of banned words at once — searching for each one separately would take forever.', '**杀毒软件**只扫一遍文件，就能和上百万条病毒特征码比对；聊天过滤器要同时查找几千个违禁词——如果一个词一个词地分别搜索，根本来不及。'],
  'suffix-array': ['Searching a **genome of three billion letters** for any fragment in a few milliseconds. Full-text search engines and the compression behind `bzip2` are built on sorted suffixes too.', '在**三十亿个字母的基因组**里，几毫秒内找到任意一个片段。全文搜索引擎和 `bzip2` 背后的压缩方法，也建立在排好序的后缀之上。'],
}
