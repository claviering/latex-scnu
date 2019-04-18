# 华南师范大学本科毕业论文 latex 模板

SEO: 华师毕业论文模板, 华师本科毕业论文模板, 华师论文模板, latex 模板, 毕业论文模板, SCNU, SCNU 论文模板, SCNU 本科论文模板

## 使用

## 目录结构

    latex
    ├── abstract 中英文摘要
    ├── appendix 附录
    ├── body 论文正文
    ├── code 引用代码
    ├── contents 目录
    ├── cover 封面
    ├── graphics 论文图片
    ├── image 项目图片
    ├── reference 参考文献
    ├── state-auth 授权页面
    ├── thanks 致谢
    ├── main.cls 引入各种包
    └── main.tex input 各个章节, 入口文件

## 使用 Usage

`make`

不需要编译生成参考文献

`make pdf`

## 字体

默认就是宋体

## 字号大小

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
```

## 论文写作要求

- 严格的学术规范，论文规范，
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


## 论文答辩

- 论文答辩5页ppt。
- 12个人，一个上午。
- 为什么这么做。
- 有思想。
- 答辩的时候主要体现：工作量、工作态度、学术规范等。
- 不需要原创性！是自己的工作即可。比如，多写代码。
- 毕业论文一大忌就是：没有突出自己的工作！你们一定要明确表明自己想做什么，怎么分析、设计，最终做了什么。

## 命令说明

```tex
% 设置 1.5 倍行距
\usepackage{setspace}
\begin{spacing}{1.5}
\end{spacing}
```

## 添加空白页

正文前的空白页不加底部页面 `\afterpage{\blankpage} `

正文中的空白页，添加底部页面 `\afterpage{\null\newpage}`

## 封面

正式论文装订最后统一使用学校发的封面，打印的封面仅仅给答辩老师看的，那种封面好看就用那种，无所谓。

```tex
\input{cover/image} % 图片封面
\input{cover/index} % 文字封面
```

## 排版细节

- 一个章节文字要多，显得有话可说
- 章节里注意分段，一个段落不能太长，注意行数
- 章节排版要新开一页，并且要在单数页
- 表格要有表头
- 图片要有说明

## 文献

文章中引用到的文献才写到参考文献中

## 页眉设置

`\newcommand{\thesistitlefancyhead}{论文题目设置为页眉} % 定义论文题目为页眉`

### 图片封面

<center>

![图片封面](./image/cover-image.png)

</center>

### 文字封面

<center>

![文字封面](./image/cover-index.png)

</center>

## 参考

> [Github](https://github.com/yujunhui/scnuthesis)

> [online Latex](https://www.overleaf.com/read/wvkfxdwmhjdq)

> [OChicken](https://github.com/OChicken/SCUT-Bachelor-Thesis-Template)