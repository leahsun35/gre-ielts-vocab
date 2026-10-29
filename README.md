# 词汇岛 · GRE & IELTS

纯静态的中英词汇学习网页。每天目标为 100 个词；学习记录保存在当前浏览器。

## 词库来源与许可

词条统一保存在 `vocabulary.json`。合并时按单词去重，并保留 `sources` 来源标记。

- **NGSL 1.01**：2,801 个词条；英语释义。来源项目许可为 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)。官方项目页：[New General Service List](https://www.newgeneralservicelist.com/new-general-service-list)。
- **NAWL 1.0**：963 个词条；英语释义。来源项目许可为 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)。官方项目页：[New Academic Word List](https://www.newgeneralservicelist.com/new-academic-word-list)。
- **AKL**：930 个公开词目，按词性分类；官方页面提供词目，但未提供释义。词条许可为 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)，引用 Paquot, M. (2010), *Academic Vocabulary in Learner Writing*, pp. 56–58. [UCLouvain 项目页](https://uclouvain.be/en/research-institutes/ilc/cecl/the-academic-keyword-list-akl)。
- **GRE / IELTS 示例词**：原有 20 个手工示例词。

NGSL 和 NAWL 当前导入的是 1.01 / 1.0 文件版本；项目官方网站目前也提供 1.2 版本。词表来源本身可再利用，但筛选考试词时应注意：NGSL/NAWL/AKL 是通用或学术英语词表，不是官方 GRE/IELTS 必考词清单。AKL 官方列表存在重复词项，因此应用按词去重，筛选计数按唯一词条计算。

AVL 没有转载进仓库：其官方使用页面明确要求不要把列表放到其他网站。

## 本地预览

在此文件夹打开终端运行：

```bash
python -m http.server 8000
```

访问 `http://localhost:8000`。

## GitHub Pages

仓库设置中选择 **Settings → Pages → Deploy from a branch → main → /(root)**。之后访问：

`https://leahsun35.github.io/gre-ielts-vocab/`

每次推送到 main 后，GitHub Pages 会自动更新。