# qthink - 个人博客设计文档

## 概述

qthink 是一个通用个人博客，内容涵盖技术分享、思想感悟、生活日记等多种类型。追求现代视觉丰富的设计风格，以 Next.js + MDX 为核心构建，部署到 Vercel。

## 技术栈

| 技术 | 用途 |
|------|------|
| Next.js 15 (App Router, TypeScript) | 应用框架 |
| Contentlayer2 | MDX 内容处理，类型安全 |
| Tailwind CSS 4 | 样式方案 |
| next-themes | 暗色模式 |
| rehype-pretty-code + shiki | 代码高亮 |
| Fuse.js | 客户端全文搜索 |
| Vercel | 部署平台 |

## 项目结构

```
qthink/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # 根布局（主题、字体、导航）
│   ├── page.tsx                # 首页（最新文章列表）
│   ├── posts/
│   │   └── [slug]/
│   │       └── page.tsx        # 文章详情页
│   ├── categories/
│   │   └── [category]/
│   │       └── page.tsx        # 分类文章列表
│   ├── tags/
│   │   └── [tag]/
│   │       └── page.tsx        # 标签文章列表
│   ├── search/
│   │   └── page.tsx            # 搜索页
│   └── about/
│       └── page.tsx            # 关于页面
├── components/                 # UI 组件
│   ├── layout/                 # 导航栏、页脚、侧边栏
│   ├── posts/                  # 文章卡片、文章列表
│   ├── search/                 # 搜索组件
│   ├── mdx/                    # MDX 自定义组件
│   └── ui/                     # 通用 UI 组件（按钮、标签等）
├── content/                    # MDX 文章内容
│   └── posts/
│       └── hello-world.mdx
├── contentlayer.config.ts      # Contentlayer 内容模型定义
├── lib/                        # 工具函数
├── styles/                     # 全局样式
├── public/                     # 静态资源
├── next.config.ts
├── tsconfig.json
└── package.json
```

## 内容模型

每篇文章的 MDX frontmatter 字段：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 文章标题 |
| date | date | 是 | 发布日期 |
| description | string | 是 | 文章摘要 |
| category | enum: "tech" \| "life" \| "thinking" | 是 | 分类 |
| tags | string[] | 否 | 标签列表 |
| cover | string | 否 | 封面图片路径 |
| draft | boolean | 否 | 是否为草稿，默认 false |
| featured | boolean | 否 | 是否置顶/精选，默认 false |

## 页面设计

### 视觉风格

- 现代、视觉丰富，有设计感但不花哨
- 大胆使用色彩渐变、卡片阴影、微动效（hover 过渡、页面切换）
- 舒适的阅读排版，中文优先的字体栈（思源黑体 / Inter 混排）
- 亮色/暗色双主题，暗色不是简单反色，而是精心调配的深色调色板

### 通用布局

- **顶部导航栏**：Logo/站名、导航链接（首页、分类、标签、搜索、关于）、暗色模式切换按钮
- **页脚**：版权信息、社交链接
- **响应式设计**：移动端汉堡菜单，桌面端水平导航

### 首页（`/`）

- **Hero 区域**：个人标语/签名 + 简短介绍，带有视觉吸引力的背景（渐变或几何图案）
- **精选文章区**：横向大卡片展示 featured 文章，带封面图、标题、摘要
- **最新文章列表**：卡片式布局（响应式网格），每张卡片包含封面、标题、日期、分类标签、摘要
- **分类快捷入口**：以 pill/chip 形式展示各分类

### 文章详情页（`/posts/[slug]`）

- **文章头部**：标题、日期、分类、标签、预计阅读时间
- **封面图**（如有）：全宽展示
- **MDX 正文**：自定义排版样式，代码高亮、图片、引用、提示框等
- **侧边目录（TOC）**：桌面端右侧固定，跟随滚动高亮当前章节
- **底部**：上一篇/下一篇导航

### 分类页（`/categories/[category]`）

- 顶部展示分类名称和描述
- 该分类下的文章列表，复用首页卡片组件

### 标签页（`/tags/[tag]`）

- 类似分类页，展示某标签下的所有文章

### 搜索页（`/search`）

- 搜索框 + 实时结果列表
- 支持按标题、摘要、标签匹配

### 关于页（`/about`）

- 个人介绍 MDX 页面，支持自定义内容

## 技术实现细节

### 暗色模式

- 使用 `next-themes` 管理主题状态，支持 system/light/dark 三种模式
- Tailwind CSS 4 通过 CSS 变量（`@theme`）定义两套调色板，使用 `@custom-variant dark` 策略
- 首次加载无闪烁（通过 `next-themes` 的 script 注入在 HTML 渲染前设置 class）

### 代码高亮

- 使用 `rehype-pretty-code` + `shiki`，构建时静态高亮，零运行时 JS
- 支持行高亮、代码标题、语言标识
- 亮色/暗色主题各一套代码配色

### MDX 自定义组件

- 自定义渲染 `h1-h6`（带锚点链接）、`img`（Next.js Image 优化）、`a`（外部链接新窗口）、`pre/code`（代码块样式）
- 可扩展的提示框组件（Callout）：info / warning / tip 等类型

### 搜索实现

- 构建时通过脚本从 Contentlayer 输出生成搜索索引 JSON（包含标题、摘要、标签、slug）
- 运行时客户端使用 Fuse.js 模糊搜索，无需后端服务
- 搜索索引文件放在 `public/` 下，按需懒加载

### SEO 与性能

- 每个页面通过 Next.js `generateMetadata` 生成 title、description、Open Graph 标签
- `sitemap.xml` 和 `robots.txt` 自动生成
- 图片使用 `next/image` 自动优化（WebP、懒加载、响应式尺寸）
- 静态生成（SSG）所有页面，构建时通过 `generateStaticParams` 预渲染

### 错误处理

- 自定义 404 页面（`not-found.tsx`），保持博客整体风格
- 文章 slug 不存在时返回 404

### 测试策略

- 暂不引入测试框架，保持项目轻量
- 依赖 TypeScript 类型检查 + Contentlayer 的内容验证确保正确性
- 未来可按需引入 Vitest + Testing Library

## 未来可扩展功能

以下功能不在第一版实现，记录备用：

- **RSS 订阅**：生成 `/feed.xml`，支持 RSS 阅读器订阅
- **评论系统**：接入 Giscus（基于 GitHub Discussions），无需自建后端
- **国际化 i18n**：支持中/英双语内容和界面
- **阅读统计 / 访客分析**：接入 Umami 或 Plausible，隐私友好的分析方案
- **Newsletter 邮件订阅**：集成邮件订阅服务
- **CMS 接入**：对接 Notion API 或 Sanity，实现非技术用户友好的内容管理
- **文章系列/专栏功能**：支持多篇文章组成系列，带序号和导航
