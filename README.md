# 英语学习 Lab

一个持续扩展的英语学习空间，当前包括词汇学习与 IELTS 口语语料练习。纯静态网页，不需要服务器或账号。

## 当前功能

- **单词学习**：每天 100 个目标；GRE、IELTS、NAWL 筛选；释义、音标、例句、搜索与浏览器内进度。
- **IELTS 口语 Lab**：真题收集、答题思路、自然表达素材、个人答案积累。
- **本地保存**：学习进度、题目、提纲、个人表达素材和答案保存在当前浏览器的本地存储中，不会上传到服务器。

口语真题由学习者自行录入，建议记下题目来源、考试时间或链接，便于核实。内置的答题框架和表达素材是学习辅助内容，不是标准答案或背诵模板。

## 词库来源与许可

- **Word Atlas**：7,298 条词目，含中文释义、音标、CEFR 等级和主题。署名：Word Atlas contributors — [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)。来源：[designfuchen/word-atlas](https://github.com/designfuchen/word-atlas)。应用将其转换为卡片字段并与现有数据去重。上游说明内容由 AI 生成、自动检查、未逐条人工审校；不是官方 IELTS 词表。
- **NAWL 1.0**：963 条开放许可学术词目及英文释义，按 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) 提供。来源：[New Academic Word List](https://www.newgeneralservicelist.com/new-academic-word-list)。
- **GRE / IELTS 示例词**：20 条原有示例词。

**NGSL 与 AKL 已移除。** 若同一个词也由保留的 Word Atlas、NAWL 或原有示例词提供，该词会作为保留来源的一部分继续显示。

OpenEtymology 的公开 GRE8000 / TOEFL 词书文件按 CC BY-SA 4.0 开放，但 TXT 仅含词目，完整词典数据库不包含在仓库中，也不在该数据许可范围内。为避免生成大量没有释义的卡片，当前未加载这些词目。来源：[OpenEtymology 数据许可](https://github.com/openetymology/OpenEtymology/blob/main/DATA_LICENSE.md)。

## 本地预览

在项目文件夹打开终端运行：

```bash
python -m http.server 8000
```

然后访问 `http://localhost:8000`。

## GitHub Pages

仓库设置选择 **Settings → Pages → Deploy from a branch → main → /(root)**。发布地址：

`https://leahsun35.github.io/gre-ielts-vocab/`
