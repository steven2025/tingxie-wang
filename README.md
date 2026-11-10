# 生字词语听写 · GitHub Pages 发布目录

本目录是**唯一的发布源**，只包含线上需要的静态文件；本地脚本、临时图片、朗读稿、云函数源码**都不在这里**。

## 目录结构

```
docs/
├── index.html                    # 前端（语文 + 英语双入口）
├── manifest.json                 # PWA 清单
├── service-worker.js             # 离线缓存（页面/JSON 走 network-first）
├── .nojekyll                     # 跳过 Jekyll 处理
├── data/
│   ├── 三年级上册_index.json      # 语文：23 课次，250 生字 + 250 词语
│   └── 英语三年级上册_index.json  # 英语：6 Unit，108 单词
└── icons/
    ├── icon-144.png
    ├── icon-180.png
    ├── icon-192.png
    ├── icon-512.png
    ├── icon-maskable-192.png
    └── icon-maskable-512.png
```

音频不走 GitHub：全部语文/英语音频存腾讯云 COS，前端按索引里的绝对 URL 直接播放。

## 发布步骤（GitHub 网页操作）

1. 把 `docs` 整个目录上传到仓库根目录（或直接把它作为仓库内容）。
2. 打开仓库 **Settings → Pages**：
   - **Source** 选 `Deploy from a branch`
   - **Branch** 选 `main`，目录选 **`/docs`**，保存。
3. 等待 1-2 分钟，访问 `https://<你的用户名>.github.io/<仓库名>/`。
4. 手机/平板浏览器打开后，用「添加到主屏幕」安装 PWA（需 HTTPS，GitHub Pages 默认满足）。

## 日常更新

1. 在项目根目录重新生成/替换文件后，运行：

   ```powershell
   python D:\生字词听写\_make_docs.py
   ```

   会把 `index.html`、两个索引 JSON、`manifest.json`、`service-worker.js`、`icons/` 同步进 `docs/`。
2. 提交并推送 `docs/` 变更即可。

> 注意：音频片段的 URL 按「课次/位置序号」命名（如 `3s/l08/sz/010.mp3`）。**一旦调整某课生字顺序，必须重新合成该课音频**，否则播放会错位。

## 更新后客户端不生效怎么办

- 浏览器强制刷新一次（Ctrl+F5 / 手机上关闭标签重开）。
- PWA 已安装的：卸载后重新安装，或等待 Service Worker 自动更新（页面与 JSON 为 network-first，通常刷新即生效）。
- 若仍显示旧课次顺序，检查 GitHub Pages 是否已完成构建（Actions 页面看部署状态）。
