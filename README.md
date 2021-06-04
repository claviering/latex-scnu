# 华南师范大学本科毕业论文 latex 模板
> 本文基于 [claviering/latex-scnu](https://github.com/claviering/latex-scnu)，结合2017级论文实际写作要求修改而成。

## 目录结构

    latex
    ├── abstract 中英文摘要
    ├── appendix 附录
    ├── body 论文正文
    ├── code 引用代码
    ├── contents 目录
    ├── cover 封面
    ├── graphics 论文图片
    ├── reference 参考文献
    ├── state-auth 授权页面
    ├── thanks 致谢
    ├── requirements 论文要求
    ├── main.cls 引入各种包
    └── main.tex input 各个章节, 入口文件

## 使用指南

1. 阅读论文要求
2. 阅读本文档
3. 通读本项目内容，关注
   1. 图片插入 includegraphics
   2. 表格插入 table
   3. 代码插入 lstlistings
   4. 所有注释
4. 修改页眉
5. 写作论文
6. 加上引用，推荐使用谷歌学术导出BibTex，修改 `reference/ref.bib`
7. 参照论文要求当中的Checklist进行自查

### 编译文档
> 推荐使用命令行，因为vscode的workshop recipes可能会导致引用无效

生成完整文档：`make`

不生成参考文献：`make pdf`

### 页眉设置

main.cls 78行

`\newcommand{\thesistitlefancyhead}{论文题目设置为页眉} % 定义论文题目为页眉`

### 字号设置
根据要求，部分中文为黑体。
中文默认就是宋体，英文默认是Times New Roman。

```tex
{\zihao{-6}小六}
{\zihao{6}六号}
{\zihao{-5}小五}
{\zihao{5}五号}
{\zihao{-4}小四}
{\zihao{-3}小三}
{\zihao{-2}小二}
{\zihao{2}二号}
{\zihao{-1}小一}
{\zihao{1}一号}
{\heiti 黑体}
```


### 封面

正式论文装订最后统一使用学校发的封面，打印的封面仅仅给答辩老师看的，那种封面好看就用那种，无所谓。

```tex
\input{cover/image} % 图片封面
\input{cover/index} % 文字封面
```

## 论文写作建议

- **严格的学术规范，论文规范**
- 标题。
- 图表需要自己做自己做。
- 内容思考过。
- 论文的排版。
- 代码量，工作量，论文里面不要出现代码，但是可以有一小段核心代码。
- 不要写科普性。
- 如何分析问题，怎么设计方法，实现解决方案。
- 摘要很重要，超级重要。
- 做了什么，怎么做，做出什么？结果怎么样？。
- 客观性严谨，有理有据。
- 工作+文章。
- 长篇大论，不要出现一小段一小段。
- 有话可说，一章很多字，不要小段落。
- 不要凑字数。
- 有什么难度？有什么工作量？。
- 论文里面图要有意义。

### 论文排版

- 一个章节文字要多，显得有话可说
- 章节里注意分段，一个段落不能太长，注意行数
- 章节排版要新开一页，并且要在单数页
- 表格要有表头
- 图片要有说明

### 论文答辩

- 为什么这么做。
- 有思想。
- 答辩的时候主要体现：工作量、工作态度、学术规范等。
- 不需要原创性！是自己的工作即可。比如，多写代码。
- 毕业论文一大忌就是：没有突出自己的工作！你们一定要明确表明自己想做什么，怎么分析、设计，最终做了什么。

## 参考

> [Github](https://github.com/yujunhui/scnuthesis)

> [online Latex](https://www.overleaf.com/read/wvkfxdwmhjdq)

> [OChicken](https://github.com/OChicken/SCUT-Bachelor-Thesis-Template)