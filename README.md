# 词汇岛 · GRE & IELTS

一个纯静态的中英双语背词网页。无需安装、服务器、账号或 API；词库保存在 `vocabulary.json`，学习记录保存在当前浏览器。

## 本地预览

浏览器会限制直接读取本地 JSON 文件，请在此文件夹打开终端运行：

```bash
python -m http.server 8000
```

然后访问 `http://localhost:8000`。部署到 GitHub Pages 后不需要这一步。

## 发布到 GitHub Pages

1. 在 GitHub 右上角点 **+ → New repository**，仓库名填 `gre-ielts-vocab`。
2. 选 **Public**（免费 Pages 最方便），创建时不要勾选 README、license 或 `.gitignore`，保持空仓库。
3. 在仓库页点 **Add file → Upload files**，上传本文件夹中的所有文件，再点 **Commit changes**。
4. 打开 **Settings → Pages**，在 **Build and deployment** 里选 **Deploy from a branch**；分支选 `main`，目录选 `/(root)`，保存。
5. 等待发布完成。Pages 设置页会显示网址，通常是 `https://你的用户名.github.io/gre-ielts-vocab/`。

## 添加词条

编辑 `vocabulary.json`，每条需有 `word`、`exam`（`GRE` 或 `IELTS`）、`pos`、`pronunciation`、`meaning` 和 `example` 字段。上传更新后，Pages 会自动重新发布。当前内置 20 个示例词条，便于体验第一版功能。
