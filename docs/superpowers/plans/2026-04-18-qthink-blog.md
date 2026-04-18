# qthink Blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a modern, visually rich personal blog called "qthink" with Next.js 15 App Router, Contentlayer2 for MDX content, Tailwind CSS 4, dark mode, search, and deploy-ready for Vercel.

**Architecture:** Next.js 15 App Router with static generation (SSG) for all pages. Content authored in MDX files under `content/posts/`, processed by Contentlayer2 into type-safe data at build time. Tailwind CSS 4 for styling with CSS-first configuration. Client-side search via Fuse.js with a build-time generated index.

**Tech Stack:** Next.js 15.5.x, TypeScript, Contentlayer2 0.5.x, Tailwind CSS 4.x, next-themes 0.4.x, rehype-pretty-code 0.14.x, shiki 4.x, Fuse.js 7.x

**Design Spec:** `docs/superpowers/specs/2026-04-18-qthink-blog-design.md`

**Testing Strategy:** No test framework per spec. Verification via TypeScript type checking (`tsc --noEmit`), `next build`, and manual browser testing with `next dev`.

---

## File Structure

```
qthink/
├── app/
│   ├── layout.tsx                    # Root layout: ThemeProvider, fonts, Header, Footer
│   ├── page.tsx                      # Home: Hero, featured posts, latest posts, category chips
│   ├── not-found.tsx                 # Custom 404 page
│   ├── posts/[slug]/page.tsx         # Post detail: MDX rendering, TOC, prev/next nav
│   ├── categories/[category]/page.tsx # Category listing
│   ├── tags/[tag]/page.tsx           # Tag listing
│   ├── search/page.tsx               # Client-side search with Fuse.js
│   ├── about/page.tsx                # About page (MDX content)
│   ├── sitemap.ts                    # Dynamic sitemap generation
│   └── robots.ts                     # robots.txt generation
├── components/
│   ├── layout/
│   │   ├── header.tsx                # Top navigation bar + mobile menu + theme toggle
│   │   └── footer.tsx                # Footer with copyright + social links
│   ├── posts/
│   │   ├── post-card.tsx             # Card component for post listings
│   │   └── post-list.tsx             # Responsive grid of PostCards
│   ├── search/
│   │   └── search-client.tsx         # Client component: search input + results
│   ├── mdx/
│   │   ├── mdx-components.tsx        # MDX component overrides (headings, links, images, code)
│   │   ├── mdx-content.tsx           # "use client" wrapper for useMDXComponent hook
│   │   └── callout.tsx               # Callout/admonition component
│   └── ui/
│       ├── theme-toggle.tsx          # Dark/light/system mode toggle button
│       └── toc.tsx                   # Table of contents sidebar (scroll-aware)
├── content/
│   ├── posts/
│   │   ├── hello-world.mdx           # Sample post: tech category
│   │   ├── life-in-spring.mdx        # Sample post: life category
│   │   └── on-thinking.mdx           # Sample post: thinking category, featured
│   └── about.mdx                     # About page content
├── lib/
│   ├── utils.ts                      # Shared utilities (cn, formatDate, readingTime)
│   └── generate-search-index.mts     # Build script: generates public/search-index.json
├── styles/
│   └── globals.css                   # Tailwind imports, CSS variables, theme, prose overrides
├── contentlayer.config.ts            # Contentlayer2 document types + MDX plugins
├── next.config.ts                    # Next.js config with Contentlayer plugin
├── tsconfig.json
├── package.json
└── .gitignore
```

---

## Task 1: Project Scaffolding & Core Dependencies

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `.gitignore`, `app/layout.tsx`, `app/page.tsx`, `styles/globals.css`

- [ ] **Step 1: Initialize Next.js 15 project**

```bash
cd /Users/qiaoyuan/Desktop/project/vercel/qthink
npx create-next-app@15 . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --turbopack --yes
```

This scaffolds into the existing `qthink/` directory with App Router, TypeScript, Tailwind CSS, ESLint.

- [ ] **Step 2: Verify scaffolding works**

```bash
cd /Users/qiaoyuan/Desktop/project/vercel/qthink
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 3: Install all project dependencies**

```bash
cd /Users/qiaoyuan/Desktop/project/vercel/qthink
npm install contentlayer2 next-contentlayer2 next-themes rehype-pretty-code shiki fuse.js clsx date-fns gray-matter rehype-slug rehype-autolink-headings
```

- [ ] **Step 4: Install dev dependencies**

```bash
cd /Users/qiaoyuan/Desktop/project/vercel/qthink
npm install -D @types/node
```

- [ ] **Step 5: Verify all dependencies installed**

```bash
cd /Users/qiaoyuan/Desktop/project/vercel/qthink
npm ls contentlayer2 next-contentlayer2 next-themes rehype-pretty-code shiki fuse.js
```

Expected: All packages listed without MISSING errors.

- [ ] **Step 6: Commit**

```bash
cd /Users/qiaoyuan/Desktop/project/vercel/qthink
git add -A
git commit -m "feat: scaffold Next.js 15 project with core dependencies"
```

---

## Task 2: Contentlayer2 Configuration & Sample Content

**Files:**
- Create: `contentlayer.config.ts`, `content/posts/hello-world.mdx`, `content/posts/life-in-spring.mdx`, `content/posts/on-thinking.mdx`, `content/about.mdx`
- Modify: `next.config.ts`, `tsconfig.json`

- [ ] **Step 1: Create Contentlayer config**

Create `contentlayer.config.ts`:

```typescript
import { defineDocumentType, makeSource } from "contentlayer2/source-files";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

export const Post = defineDocumentType(() => ({
  name: "Post",
  filePathPattern: "posts/**/*.mdx",
  contentType: "mdx",
  fields: {
    title: { type: "string", required: true },
    date: { type: "date", required: true },
    description: { type: "string", required: true },
    category: {
      type: "enum",
      options: ["tech", "life", "thinking"],
      required: true,
    },
    tags: { type: "list", of: { type: "string" }, default: [] },
    cover: { type: "string" },
    draft: { type: "boolean", default: false },
    featured: { type: "boolean", default: false },
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (post) => post._raw.flattenedPath.replace("posts/", ""),
    },
    readingTime: {
      type: "string",
      resolve: (post) => {
        const wordsPerMinute = 300;
        const chars = post.body.raw.length;
        const minutes = Math.ceil(chars / wordsPerMinute);
        return `${minutes} min read`;
      },
    },
  },
}));

export const About = defineDocumentType(() => ({
  name: "About",
  filePathPattern: "about.mdx",
  contentType: "mdx",
  fields: {},
}));

export default makeSource({
  contentDirPath: "content",
  documentTypes: [Post, About],
  mdx: {
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        { behavior: "wrap", properties: { className: ["anchor"] } },
      ],
      [
        rehypePrettyCode,
        {
          theme: { dark: "github-dark", light: "github-light" },
          keepBackground: false,
        },
      ],
    ],
  },
});
```

- [ ] **Step 2: Update next.config.ts for Contentlayer**

Replace the contents of `next.config.ts`:

```typescript
import { withContentlayer } from "next-contentlayer2";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default withContentlayer(nextConfig);
```

- [ ] **Step 3: Update tsconfig.json for Contentlayer**

Add to `compilerOptions.paths` in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "contentlayer/generated": ["./.contentlayer/generated"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".contentlayer/generated"
  ]
}
```

- [ ] **Step 4: Create sample post — tech category**

Create `content/posts/hello-world.mdx`:

```mdx
---
title: "Hello World — 用 Next.js 搭建个人博客"
date: 2026-04-18
description: "记录使用 Next.js 15 + Contentlayer2 + Tailwind CSS 4 搭建个人博客的过程与思考。"
category: tech
tags: ["Next.js", "React", "Tailwind CSS", "博客"]
featured: true
---

## 为什么要搭建个人博客

在信息碎片化的时代，拥有一个属于自己的写作空间变得越来越重要。

### 技术选型

选择 Next.js 作为框架，原因有三：

1. **优秀的 SSG 支持** — 博客天然适合静态生成
2. **React 生态** — 丰富的组件库和工具链
3. **Vercel 部署** — 零配置部署，极致体验

### 代码示例

```typescript
const greeting = "Hello, qthink!";
console.log(greeting);
```

> 一个好的博客，不仅是技术的展示，更是思维的沉淀。

## 下一步计划

- 完善文章分类和标签系统
- 添加搜索功能
- 优化阅读体验
```

- [ ] **Step 5: Create sample post — life category**

Create `content/posts/life-in-spring.mdx`:

```mdx
---
title: "春日随笔"
date: 2026-04-15
description: "春天的阳光透过窗户洒进来，是时候记录一些生活中的小确幸。"
category: life
tags: ["随笔", "生活"]
---

## 阳光与咖啡

春日的午后，阳光透过窗帘的缝隙，在桌面上画出斑驳的光影。一杯咖啡，一本书，这是最惬意的时光。

## 散步的意义

每天傍晚的散步成了固定的仪式。不带耳机，不看手机，只是走路和观察。

城市的细节在慢速中显现：

- 街角新开的花店
- 老梧桐树上冒出的新芽
- 楼下阿姨遛的那只总是很开心的金毛

简单的事物，往往蕴含着最真实的快乐。
```

- [ ] **Step 6: Create sample post — thinking category (featured)**

Create `content/posts/on-thinking.mdx`:

```mdx
---
title: "关于独立思考"
date: 2026-04-10
description: "在信息过载的时代，如何保持独立思考的能力？一些个人的观察与实践。"
category: thinking
tags: ["思考", "认知", "方法论"]
featured: true
---

## 信息过载的困境

我们每天接触的信息量远超大脑的处理能力。社交媒体的算法推荐让我们不断看到自己想看的内容，形成了信息茧房。

## 三个实践

### 1. 延迟判断

看到一个观点，先不急于赞同或反对。给自己 24 小时的冷静期。

### 2. 寻找反面

主动寻找与自己立场相反的论据。如果找不到好的反驳理由，那可能是自己的理解还不够深入。

### 3. 写作是最好的思考工具

> 写作不是思考的记录，写作本身就是思考。

把模糊的想法写下来，逼迫自己把思路理清。很多时候，写着写着就发现了自己逻辑上的漏洞。

## 结语

独立思考不是目的，而是手段。它帮助我们在纷繁的世界里找到属于自己的坐标。
```

- [ ] **Step 7: Create about page content**

Create `content/about.mdx`:

```mdx
---
---

## 关于 qthink

这是我的个人博客，记录技术学习、生活感悟和独立思考。

### 关于我

一个热爱技术与写作的人。相信写作是最好的学习方式，分享是最好的成长路径。

### 关于这个博客

qthink — "思考"的意思。希望这里的每一篇文章都经过认真的思考。

**技术栈：** Next.js / React / Tailwind CSS / MDX

### 联系方式

- GitHub: [github.com/qthink](https://github.com/qthink)
- Email: hello@qthink.dev
```

- [ ] **Step 8: Verify Contentlayer builds**

```bash
cd /Users/qiaoyuan/Desktop/project/vercel/qthink
npm run build
```

Expected: Build succeeds, `.contentlayer/generated` directory created with type definitions and processed content.

- [ ] **Step 9: Commit**

```bash
cd /Users/qiaoyuan/Desktop/project/vercel/qthink
git add contentlayer.config.ts content/ next.config.ts tsconfig.json
git commit -m "feat: configure Contentlayer2 with content model and sample posts"
```

---

## Task 3: Global Styles, Theme System & Fonts

**Files:**
- Create: `components/ui/theme-toggle.tsx`
- Modify: `styles/globals.css` (or `app/globals.css` depending on scaffolding), `app/layout.tsx`

- [ ] **Step 1: Set up Tailwind CSS 4 globals with theme variables**

Replace the contents of the global CSS file (likely `app/globals.css` after scaffolding):

```css
@import "tailwindcss";

/* Light theme (default) */
:root {
  --color-bg: #ffffff;
  --color-bg-secondary: #f8f9fa;
  --color-bg-card: #ffffff;
  --color-text: #1a1a2e;
  --color-text-secondary: #6b7280;
  --color-text-muted: #9ca3af;
  --color-border: #e5e7eb;
  --color-accent: #6366f1;
  --color-accent-hover: #4f46e5;
  --color-accent-light: #eef2ff;
  --color-gradient-from: #6366f1;
  --color-gradient-via: #8b5cf6;
  --color-gradient-to: #ec4899;
  --color-card-shadow: rgba(0, 0, 0, 0.08);
  --color-card-shadow-hover: rgba(0, 0, 0, 0.15);
}

/* Dark theme */
.dark {
  --color-bg: #0f172a;
  --color-bg-secondary: #1e293b;
  --color-bg-card: #1e293b;
  --color-text: #e2e8f0;
  --color-text-secondary: #94a3b8;
  --color-text-muted: #64748b;
  --color-border: #334155;
  --color-accent: #818cf8;
  --color-accent-hover: #a5b4fc;
  --color-accent-light: rgba(99, 102, 241, 0.15);
  --color-gradient-from: #818cf8;
  --color-gradient-via: #a78bfa;
  --color-gradient-to: #f472b6;
  --color-card-shadow: rgba(0, 0, 0, 0.3);
  --color-card-shadow-hover: rgba(0, 0, 0, 0.5);
}

@theme inline {
  --color-bg: var(--color-bg);
  --color-bg-secondary: var(--color-bg-secondary);
  --color-bg-card: var(--color-bg-card);
  --color-text: var(--color-text);
  --color-text-secondary: var(--color-text-secondary);
  --color-text-muted: var(--color-text-muted);
  --color-border: var(--color-border);
  --color-accent: var(--color-accent);
  --color-accent-hover: var(--color-accent-hover);
  --color-accent-light: var(--color-accent-light);
  --color-gradient-from: var(--color-gradient-from);
  --color-gradient-via: var(--color-gradient-via);
  --color-gradient-to: var(--color-gradient-to);
  --color-card-shadow: var(--color-card-shadow);
  --color-card-shadow-hover: var(--color-card-shadow-hover);
}

/* Base styles */
body {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: "Inter", "Noto Sans SC", system-ui, sans-serif;
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* Selection highlight */
::selection {
  background-color: var(--color-accent-light);
  color: var(--color-accent);
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background-color: var(--color-text-muted);
  border-radius: 4px;
}

/* Code block overrides for rehype-pretty-code */
[data-rehype-pretty-code-figure] pre {
  padding: 1rem 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid var(--color-border);
  overflow-x: auto;
}

[data-rehype-pretty-code-figure] code {
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 0.875rem;
  line-height: 1.7;
}

[data-rehype-pretty-code-figure] [data-line] {
  padding: 0 1rem;
  margin: 0 -1rem;
}

[data-rehype-pretty-code-figure] [data-highlighted-line] {
  background-color: var(--color-accent-light);
}

/* Inline code */
:not(pre) > code {
  background-color: var(--color-bg-secondary);
  padding: 0.15em 0.4em;
  border-radius: 0.25rem;
  font-size: 0.875em;
  font-family: "JetBrains Mono", "Fira Code", monospace;
}
```

- [ ] **Step 2: Create theme toggle component**

Create `components/ui/theme-toggle.tsx`:

```tsx
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-9" />;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-(--color-bg-secondary)"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}
```

- [ ] **Step 3: Create utility functions**

Create `lib/utils.ts`:

```typescript
import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const categoryMap: Record<string, { label: string; color: string }> = {
  tech: { label: "技术", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  life: { label: "生活", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
  thinking: { label: "思考", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
};
```

- [ ] **Step 4: Update root layout with ThemeProvider and fonts**

Replace `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "qthink — 思考 · 记录 · 分享",
    template: "%s | qthink",
  },
  description: "一个关于技术、生活与思考的个人博客",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Verify build**

```bash
cd /Users/qiaoyuan/Desktop/project/vercel/qthink
npm run build
```

Expected: Build succeeds.

- [ ] **Step 6: Commit**

```bash
cd /Users/qiaoyuan/Desktop/project/vercel/qthink
git add app/globals.css app/layout.tsx components/ui/theme-toggle.tsx lib/utils.ts
git commit -m "feat: add global styles, theme system, and utility functions"
```

---

## Task 4: Header & Footer Layout Components

**Files:**
- Create: `components/layout/header.tsx`, `components/layout/footer.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create Header component**

Create `components/layout/header.tsx`:

```tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const navLinks = [
  { href: "/", label: "首页" },
  { href: "/categories/tech", label: "技术" },
  { href: "/categories/life", label: "生活" },
  { href: "/categories/thinking", label: "思考" },
  { href: "/search", label: "搜索" },
  { href: "/about", label: "关于" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-(--color-border) bg-(--color-bg)/80 backdrop-blur-lg">
      <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold bg-gradient-to-r from-(--color-gradient-from) via-(--color-gradient-via) to-(--color-gradient-to) bg-clip-text text-transparent"
        >
          qthink
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-(--color-text-secondary) transition-colors hover:bg-(--color-bg-secondary) hover:text-(--color-text)"
            >
              {link.label}
            </Link>
          ))}
          <div className="ml-2">
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-(--color-bg-secondary)"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-(--color-border) md:hidden">
          <div className="mx-auto max-w-5xl space-y-1 px-6 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-(--color-text-secondary) transition-colors hover:bg-(--color-bg-secondary) hover:text-(--color-text)"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
```

- [ ] **Step 2: Create Footer component**

Create `components/layout/footer.tsx`:

```tsx
import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-(--color-border) bg-(--color-bg-secondary)">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-sm text-(--color-text-muted)">
            &copy; {new Date().getFullYear()} qthink. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="https://github.com/qthink"
              target="_blank"
              rel="noopener noreferrer"
              className="text-(--color-text-muted) transition-colors hover:text-(--color-text)"
              aria-label="GitHub"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Integrate Header and Footer into root layout**

Update `app/layout.tsx` — add imports and wrap children:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "qthink — 思考 · 记录 · 分享",
    template: "%s | qthink",
  },
  description: "一个关于技术、生活与思考的个人博客",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Verify build and check in dev**

```bash
cd /Users/qiaoyuan/Desktop/project/vercel/qthink
npm run build
```

Expected: Build succeeds. Run `npm run dev` and visit http://localhost:3000 to verify header, footer, and theme toggle work.

- [ ] **Step 5: Commit**

```bash
cd /Users/qiaoyuan/Desktop/project/vercel/qthink
git add components/layout/ app/layout.tsx
git commit -m "feat: add Header with mobile menu and Footer components"
```

---

## Task 5: PostCard & PostList Components

**Files:**
- Create: `components/posts/post-card.tsx`, `components/posts/post-list.tsx`

- [ ] **Step 1: Create PostCard component**

Create `components/posts/post-card.tsx`:

```tsx
import Link from "next/link";
import Image from "next/image";
import { formatDate, categoryMap } from "@/lib/utils";

interface PostCardProps {
  title: string;
  slug: string;
  date: string;
  description: string;
  category: string;
  tags: string[];
  cover?: string;
  featured?: boolean;
}

export function PostCard({
  title,
  slug,
  date,
  description,
  category,
  tags,
  cover,
  featured,
}: PostCardProps) {
  const cat = categoryMap[category] ?? { label: category, color: "bg-gray-100 text-gray-700" };

  return (
    <Link href={`/posts/${slug}`} className="group block">
      <article
        className={`overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-bg-card) shadow-[0_2px_8px_var(--color-card-shadow)] transition-all duration-300 hover:shadow-[0_8px_24px_var(--color-card-shadow-hover)] hover:-translate-y-1 ${
          featured ? "ring-2 ring-(--color-accent)/30" : ""
        }`}
      >
        {cover && (
          <div className="relative aspect-[16/9] overflow-hidden">
            <Image
              src={cover}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}
        <div className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${cat.color}`}>
              {cat.label}
            </span>
            <span className="text-xs text-(--color-text-muted)">{formatDate(date)}</span>
          </div>
          <h3 className="mb-2 text-lg font-semibold leading-snug text-(--color-text) transition-colors group-hover:text-(--color-accent)">
            {title}
          </h3>
          <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-(--color-text-secondary)">
            {description}
          </p>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-(--color-bg-secondary) px-2 py-0.5 text-xs text-(--color-text-muted)"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
```

- [ ] **Step 2: Create PostList component**

Create `components/posts/post-list.tsx`:

```tsx
import { PostCard } from "./post-card";

interface Post {
  title: string;
  slug: string;
  date: string;
  description: string;
  category: string;
  tags: string[];
  cover?: string;
  featured?: boolean;
}

interface PostListProps {
  posts: Post[];
  columns?: 2 | 3;
}

export function PostList({ posts, columns = 2 }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="py-12 text-center text-(--color-text-muted)">
        暂无文章
      </div>
    );
  }

  return (
    <div
      className={`grid gap-6 ${
        columns === 3
          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-1 md:grid-cols-2"
      }`}
    >
      {posts.map((post) => (
        <PostCard key={post.slug} {...post} />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
cd /Users/qiaoyuan/Desktop/project/vercel/qthink
npm run build
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
cd /Users/qiaoyuan/Desktop/project/vercel/qthink
git add components/posts/
git commit -m "feat: add PostCard and PostList components"
```

---

## Task 6: Home Page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Build the home page**

Replace `app/page.tsx`:

```tsx
import Link from "next/link";
import { allPosts } from "contentlayer/generated";
import { compareDesc } from "date-fns";
import { PostCard } from "@/components/posts/post-card";
import { PostList } from "@/components/posts/post-list";
import { categoryMap } from "@/lib/utils";

export default function HomePage() {
  const posts = allPosts
    .filter((p) => !p.draft)
    .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)));

  const featuredPosts = posts.filter((p) => p.featured);
  const latestPosts = posts.slice(0, 6);

  return (
    <div className="mx-auto max-w-5xl px-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-(--color-gradient-from)/10 via-(--color-gradient-via)/5 to-transparent rounded-3xl" />
        <div className="max-w-2xl">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="bg-gradient-to-r from-(--color-gradient-from) via-(--color-gradient-via) to-(--color-gradient-to) bg-clip-text text-transparent">
              qthink
            </span>
          </h1>
          <p className="mb-2 text-xl text-(--color-text-secondary)">
            思考 · 记录 · 分享
          </p>
          <p className="text-base leading-relaxed text-(--color-text-muted)">
            一个关于技术、生活与思考的个人博客。在这里记录学习的过程、生活的感悟，以及对世界的独立思考。
          </p>
        </div>
      </section>

      {/* Category Chips */}
      <section className="mb-12">
        <div className="flex flex-wrap gap-3">
          {Object.entries(categoryMap).map(([key, { label, color }]) => (
            <Link
              key={key}
              href={`/categories/${key}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-transform hover:scale-105 ${color}`}
            >
              {label}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-bold">精选文章</h2>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            {featuredPosts.map((post) => (
              <PostCard
                key={post.slug}
                title={post.title}
                slug={post.slug}
                date={post.date}
                description={post.description}
                category={post.category}
                tags={post.tags}
                cover={post.cover}
                featured
              />
            ))}
          </div>
        </section>
      )}

      {/* Latest Posts */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-bold">最新文章</h2>
        <PostList
          posts={latestPosts.map((post) => ({
            title: post.title,
            slug: post.slug,
            date: post.date,
            description: post.description,
            category: post.category,
            tags: post.tags,
            cover: post.cover,
          }))}
        />
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Verify build and dev**

```bash
cd /Users/qiaoyuan/Desktop/project/vercel/qthink
npm run build
```

Expected: Build succeeds. Run `npm run dev` and visit http://localhost:3000 — you should see the Hero, category chips, featured posts, and latest posts.

- [ ] **Step 3: Commit**

```bash
cd /Users/qiaoyuan/Desktop/project/vercel/qthink
git add app/page.tsx
git commit -m "feat: build home page with Hero, featured posts, and latest posts"
```

---

## Task 7: MDX Components & Code Highlighting

**Files:**
- Create: `components/mdx/mdx-components.tsx`, `components/mdx/callout.tsx`

- [ ] **Step 1: Create Callout component**

Create `components/mdx/callout.tsx`:

```tsx
interface CalloutProps {
  type?: "info" | "warning" | "tip";
  children: React.ReactNode;
}

const styles = {
  info: "border-blue-500/30 bg-blue-50 text-blue-900 dark:bg-blue-950/30 dark:text-blue-200",
  warning: "border-amber-500/30 bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200",
  tip: "border-green-500/30 bg-green-50 text-green-900 dark:bg-green-950/30 dark:text-green-200",
};

const icons = {
  info: "ℹ️",
  warning: "⚠️",
  tip: "💡",
};

export function Callout({ type = "info", children }: CalloutProps) {
  return (
    <div className={`my-6 rounded-xl border-l-4 p-4 ${styles[type]}`}>
      <div className="flex gap-3">
        <span className="text-lg leading-7">{icons[type]}</span>
        <div className="prose-sm flex-1">{children}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create MDX components mapping**

Create `components/mdx/mdx-components.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";
import type { MDXComponents } from "mdx/types";
import { Callout } from "./callout";

export const mdxComponents: MDXComponents = {
  h1: (props) => (
    <h1 className="mt-10 mb-4 text-3xl font-bold tracking-tight" {...props} />
  ),
  h2: (props) => (
    <h2 className="mt-8 mb-3 text-2xl font-semibold tracking-tight border-b border-(--color-border) pb-2" {...props} />
  ),
  h3: (props) => (
    <h3 className="mt-6 mb-2 text-xl font-semibold" {...props} />
  ),
  h4: (props) => (
    <h4 className="mt-4 mb-2 text-lg font-semibold" {...props} />
  ),
  p: (props) => (
    <p className="mb-4 leading-7 text-(--color-text-secondary)" {...props} />
  ),
  a: ({ href, children, ...props }) => {
    const isExternal = href?.startsWith("http");
    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-(--color-accent) underline underline-offset-4 transition-colors hover:text-(--color-accent-hover)"
          {...props}
        >
          {children}
        </a>
      );
    }
    return (
      <Link
        href={href ?? "#"}
        className="font-medium text-(--color-accent) underline underline-offset-4 transition-colors hover:text-(--color-accent-hover)"
        {...props}
      >
        {children}
      </Link>
    );
  },
  img: ({ src, alt, ...props }) => (
    <span className="my-6 block overflow-hidden rounded-xl">
      <Image
        src={src ?? ""}
        alt={alt ?? ""}
        width={800}
        height={450}
        className="w-full"
        {...props}
      />
    </span>
  ),
  ul: (props) => (
    <ul className="mb-4 ml-6 list-disc space-y-1 text-(--color-text-secondary)" {...props} />
  ),
  ol: (props) => (
    <ol className="mb-4 ml-6 list-decimal space-y-1 text-(--color-text-secondary)" {...props} />
  ),
  li: (props) => (
    <li className="leading-7" {...props} />
  ),
  blockquote: (props) => (
    <blockquote
      className="my-6 border-l-4 border-(--color-accent)/40 pl-4 italic text-(--color-text-muted)"
      {...props}
    />
  ),
  hr: () => <hr className="my-8 border-(--color-border)" />,
  strong: (props) => (
    <strong className="font-semibold text-(--color-text)" {...props} />
  ),
  Callout,
};
```

- [ ] **Step 3: Create MDX content client wrapper**

Create `components/mdx/mdx-content.tsx`:

```tsx
"use client";

import { useMDXComponent } from "next-contentlayer2/hooks";
import { mdxComponents } from "./mdx-components";

export function MdxContent({ code }: { code: string }) {
  const MDXContent = useMDXComponent(code);
  return <MDXContent components={mdxComponents} />;
}
```

This is the client component boundary needed because `useMDXComponent` is a React hook. It will be imported by both the post detail page and about page.

- [ ] **Step 4: Verify build**

```bash
cd /Users/qiaoyuan/Desktop/project/vercel/qthink
npm run build
```

Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
cd /Users/qiaoyuan/Desktop/project/vercel/qthink
git add components/mdx/
git commit -m "feat: add MDX component overrides, Callout, and client content wrapper"
```

---

## Task 8: Post Detail Page with TOC

**Files:**
- Create: `app/posts/[slug]/page.tsx`, `components/ui/toc.tsx`

- [ ] **Step 1: Create TOC component**

Create `components/ui/toc.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents({ headings }: { headings: TocItem[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );

    for (const { id } of headings) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="hidden xl:block">
      <div className="sticky top-24">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-(--color-text-muted)">
          目录
        </p>
        <ul className="space-y-2 border-l border-(--color-border)">
          {headings.map((heading) => (
            <li
              key={heading.id}
              style={{ paddingLeft: `${(heading.level - 2) * 12 + 12}px` }}
            >
              <a
                href={`#${heading.id}`}
                className={`block text-sm leading-6 transition-colors ${
                  activeId === heading.id
                    ? "border-l-2 -ml-px border-(--color-accent) font-medium text-(--color-accent)"
                    : "text-(--color-text-muted) hover:text-(--color-text-secondary)"
                }`}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Create post detail page**

Create `app/posts/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { allPosts } from "contentlayer/generated";
import { compareDesc } from "date-fns";
import { formatDate, categoryMap } from "@/lib/utils";
import { MdxContent } from "@/components/mdx/mdx-content";
import { TableOfContents } from "@/components/ui/toc";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function getPost(slug: string) {
  return allPosts.find((p) => p.slug === slug && !p.draft);
}

function extractHeadings(raw: string) {
  const headings: { id: string; text: string; level: number }[] = [];
  const regex = /^(#{2,4})\s+(.+)$/gm;
  let match;
  while ((match = regex.exec(raw)) !== null) {
    const text = match[2].trim();
    headings.push({
      id: text
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fff]+/g, "-")
        .replace(/^-|-$/g, ""),
      text,
      level: match[1].length,
    });
  }
  return headings;
}

export async function generateStaticParams() {
  return allPosts
    .filter((p) => !p.draft)
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const cat = categoryMap[post.category] ?? { label: post.category, color: "" };
  const headings = extractHeadings(post.body.raw);

  const sortedPosts = allPosts
    .filter((p) => !p.draft)
    .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)));
  const currentIndex = sortedPosts.findIndex((p) => p.slug === post.slug);
  const prevPost = currentIndex < sortedPosts.length - 1 ? sortedPosts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? sortedPosts[currentIndex - 1] : null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex gap-12">
        {/* Main content */}
        <article className="min-w-0 flex-1">
          {/* Post header */}
          <header className="mb-8">
            <div className="mb-4 flex items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${cat.color}`}>
                {cat.label}
              </span>
              <span className="text-sm text-(--color-text-muted)">{formatDate(post.date)}</span>
              <span className="text-sm text-(--color-text-muted)">{post.readingTime}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {post.title}
            </h1>
            {post.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag: string) => (
                  <Link
                    key={tag}
                    href={`/tags/${tag}`}
                    className="rounded-md bg-(--color-bg-secondary) px-2.5 py-1 text-xs text-(--color-text-muted) transition-colors hover:text-(--color-accent)"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </header>

          {/* Cover image */}
          {post.cover && (
            <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-2xl">
              <Image src={post.cover} alt={post.title} fill className="object-cover" />
            </div>
          )}

          {/* MDX content */}
          <div className="prose-custom">
            <MdxContent code={post.body.code} />
          </div>

          {/* Prev/Next navigation */}
          <nav className="mt-12 grid grid-cols-2 gap-4 border-t border-(--color-border) pt-8">
            {prevPost ? (
              <Link
                href={`/posts/${prevPost.slug}`}
                className="group rounded-xl border border-(--color-border) p-4 transition-colors hover:border-(--color-accent)/30"
              >
                <span className="text-xs text-(--color-text-muted)">上一篇</span>
                <p className="mt-1 text-sm font-medium group-hover:text-(--color-accent)">
                  {prevPost.title}
                </p>
              </Link>
            ) : (
              <div />
            )}
            {nextPost ? (
              <Link
                href={`/posts/${nextPost.slug}`}
                className="group rounded-xl border border-(--color-border) p-4 text-right transition-colors hover:border-(--color-accent)/30"
              >
                <span className="text-xs text-(--color-text-muted)">下一篇</span>
                <p className="mt-1 text-sm font-medium group-hover:text-(--color-accent)">
                  {nextPost.title}
                </p>
              </Link>
            ) : (
              <div />
            )}
          </nav>
        </article>

        {/* TOC sidebar */}
        <aside className="w-56 shrink-0">
          <TableOfContents headings={headings} />
        </aside>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify build and test post page**

```bash
cd /Users/qiaoyuan/Desktop/project/vercel/qthink
npm run build
```

Expected: Build succeeds with static pages generated for each post. Run `npm run dev`, click a post card from home page — should see full article with TOC and prev/next nav.

- [ ] **Step 4: Commit**

```bash
cd /Users/qiaoyuan/Desktop/project/vercel/qthink
git add app/posts/ components/ui/toc.tsx
git commit -m "feat: add post detail page with MDX rendering, TOC, and prev/next navigation"
```

---

## Task 9: Category & Tag Pages

**Files:**
- Create: `app/categories/[category]/page.tsx`, `app/tags/[tag]/page.tsx`

- [ ] **Step 1: Create category page**

Create `app/categories/[category]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { allPosts } from "contentlayer/generated";
import { compareDesc } from "date-fns";
import { PostList } from "@/components/posts/post-list";
import { categoryMap } from "@/lib/utils";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ category: string }>;
}

const validCategories = ["tech", "life", "thinking"] as const;

export function generateStaticParams() {
  return validCategories.map((category) => ({ category }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const cat = categoryMap[category];
  if (!cat) return {};
  return {
    title: `${cat.label} — 分类`,
    description: `qthink 博客中关于「${cat.label}」的所有文章`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  if (!validCategories.includes(category as typeof validCategories[number])) {
    notFound();
  }

  const cat = categoryMap[category]!;
  const posts = allPosts
    .filter((p) => !p.draft && p.category === category)
    .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)));

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-bold">{cat.label}</h1>
        <p className="mt-2 text-(--color-text-secondary)">
          共 {posts.length} 篇文章
        </p>
      </header>
      <PostList
        posts={posts.map((post) => ({
          title: post.title,
          slug: post.slug,
          date: post.date,
          description: post.description,
          category: post.category,
          tags: post.tags,
          cover: post.cover,
        }))}
      />
    </div>
  );
}
```

- [ ] **Step 2: Create tag page**

Create `app/tags/[tag]/page.tsx`:

```tsx
import { allPosts } from "contentlayer/generated";
import { compareDesc } from "date-fns";
import { PostList } from "@/components/posts/post-list";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ tag: string }>;
}

export function generateStaticParams() {
  const tags = new Set<string>();
  for (const post of allPosts) {
    if (!post.draft) {
      for (const tag of post.tags) {
        tags.add(tag);
      }
    }
  }
  return Array.from(tags).map((tag) => ({ tag }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  return {
    title: `#${decoded} — 标签`,
    description: `qthink 博客中标记「${decoded}」的所有文章`,
  };
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);

  const posts = allPosts
    .filter((p) => !p.draft && p.tags.includes(decoded))
    .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)));

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-bold">#{decoded}</h1>
        <p className="mt-2 text-(--color-text-secondary)">
          共 {posts.length} 篇文章
        </p>
      </header>
      <PostList
        posts={posts.map((post) => ({
          title: post.title,
          slug: post.slug,
          date: post.date,
          description: post.description,
          category: post.category,
          tags: post.tags,
          cover: post.cover,
        }))}
      />
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
cd /Users/qiaoyuan/Desktop/project/vercel/qthink
npm run build
```

Expected: Build succeeds with static pages for each category and tag.

- [ ] **Step 4: Commit**

```bash
cd /Users/qiaoyuan/Desktop/project/vercel/qthink
git add app/categories/ app/tags/
git commit -m "feat: add category and tag listing pages"
```

---

## Task 10: Search Functionality

**Files:**
- Create: `lib/generate-search-index.mts`, `components/search/search-client.tsx`, `app/search/page.tsx`
- Modify: `package.json` (add build script)

- [ ] **Step 1: Create search index generation script**

Create `lib/generate-search-index.mts`:

```typescript
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import matter from "gray-matter";
import { globSync } from "glob";

const contentDir = join(process.cwd(), "content/posts");
const outputPath = join(process.cwd(), "public/search-index.json");

interface SearchEntry {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  date: string;
}

const files = globSync("**/*.mdx", { cwd: contentDir });
const index: SearchEntry[] = [];

for (const file of files) {
  const raw = readFileSync(join(contentDir, file), "utf-8");
  const { data } = matter(raw);
  if (data.draft) continue;
  index.push({
    slug: file.replace(/\.mdx$/, ""),
    title: data.title,
    description: data.description,
    category: data.category,
    tags: data.tags ?? [],
    date: data.date instanceof Date ? data.date.toISOString() : String(data.date),
  });
}

mkdirSync(join(process.cwd(), "public"), { recursive: true });
writeFileSync(outputPath, JSON.stringify(index));
console.log(`Search index generated: ${index.length} posts`);
```

- [ ] **Step 2: Add prebuild script to package.json**

In `package.json`, add to `"scripts"`:

```json
{
  "scripts": {
    "prebuild": "tsx lib/generate-search-index.mts",
    "generate-search": "tsx lib/generate-search-index.mts"
  }
}
```

Also install tsx as a dev dependency:

```bash
cd /Users/qiaoyuan/Desktop/project/vercel/qthink
npm install -D tsx glob
```

- [ ] **Step 3: Create search client component**

Create `components/search/search-client.tsx`:

```tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import Fuse from "fuse.js";
import Link from "next/link";
import { formatDate, categoryMap } from "@/lib/utils";

interface SearchEntry {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  date: string;
}

export function SearchClient() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchEntry[]>([]);
  const [fuse, setFuse] = useState<Fuse<SearchEntry> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/search-index.json")
      .then((res) => res.json())
      .then((data: SearchEntry[]) => {
        setFuse(
          new Fuse(data, {
            keys: [
              { name: "title", weight: 0.4 },
              { name: "description", weight: 0.3 },
              { name: "tags", weight: 0.2 },
              { name: "category", weight: 0.1 },
            ],
            threshold: 0.3,
            includeScore: true,
          })
        );
        setLoading(false);
      });
  }, []);

  const search = useCallback(
    (q: string) => {
      setQuery(q);
      if (!fuse || q.trim() === "") {
        setResults([]);
        return;
      }
      const res = fuse.search(q).map((r) => r.item);
      setResults(res);
    },
    [fuse]
  );

  return (
    <div>
      {/* Search input */}
      <div className="relative mb-8">
        <svg
          className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-(--color-text-muted)"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => search(e.target.value)}
          placeholder="搜索文章标题、摘要、标签..."
          className="w-full rounded-xl border border-(--color-border) bg-(--color-bg-card) py-3 pl-12 pr-4 text-base outline-none transition-colors focus:border-(--color-accent) focus:ring-2 focus:ring-(--color-accent)/20"
          autoFocus
        />
      </div>

      {/* Results */}
      {loading ? (
        <div className="py-8 text-center text-(--color-text-muted)">加载搜索索引...</div>
      ) : query && results.length === 0 ? (
        <div className="py-8 text-center text-(--color-text-muted)">
          未找到与「{query}」相关的文章
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((item) => {
            const cat = categoryMap[item.category] ?? { label: item.category, color: "" };
            return (
              <Link
                key={item.slug}
                href={`/posts/${item.slug}`}
                className="block rounded-xl border border-(--color-border) bg-(--color-bg-card) p-5 transition-all hover:shadow-[0_4px_12px_var(--color-card-shadow)] hover:-translate-y-0.5"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cat.color}`}>
                    {cat.label}
                  </span>
                  <span className="text-xs text-(--color-text-muted)">{formatDate(item.date)}</span>
                </div>
                <h3 className="mb-1 text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-(--color-text-secondary) line-clamp-2">{item.description}</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create search page**

Create `app/search/page.tsx`:

```tsx
import { SearchClient } from "@/components/search/search-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "搜索",
  description: "搜索 qthink 博客中的所有文章",
};

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-bold">搜索</h1>
      <SearchClient />
    </div>
  );
}
```

- [ ] **Step 5: Generate search index and verify build**

```bash
cd /Users/qiaoyuan/Desktop/project/vercel/qthink
npm run generate-search
npm run build
```

Expected: `public/search-index.json` created with 3 entries. Build succeeds. Run `npm run dev`, visit `/search`, type a query — results should appear in real time.

- [ ] **Step 6: Commit**

```bash
cd /Users/qiaoyuan/Desktop/project/vercel/qthink
git add lib/generate-search-index.mts components/search/ app/search/ package.json package-lock.json public/search-index.json
git commit -m "feat: add client-side search with Fuse.js and build-time index"
```

---

## Task 11: About Page & Custom 404

**Files:**
- Create: `app/about/page.tsx`, `app/not-found.tsx`

- [ ] **Step 1: Create about page**

Create `app/about/page.tsx`:

```tsx
import { allAbouts } from "contentlayer/generated";
import { MdxContent } from "@/components/mdx/mdx-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "关于",
  description: "关于 qthink 博客和作者",
};

export default function AboutPage() {
  const about = allAbouts[0];

  if (!about) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold">关于</h1>
        <p className="mt-4 text-(--color-text-secondary)">内容即将更新...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <MdxContent code={about.body.code} />
    </div>
  );
}
```

- [ ] **Step 2: Create custom 404 page**

Create `app/not-found.tsx`:

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="text-center">
        <p className="text-7xl font-bold bg-gradient-to-r from-(--color-gradient-from) via-(--color-gradient-via) to-(--color-gradient-to) bg-clip-text text-transparent">
          404
        </p>
        <h1 className="mt-4 text-2xl font-semibold">页面未找到</h1>
        <p className="mt-2 text-(--color-text-secondary)">
          你访问的页面不存在或已被移动。
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-(--color-accent) px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-(--color-accent-hover)"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
cd /Users/qiaoyuan/Desktop/project/vercel/qthink
npm run build
```

Expected: Build succeeds. Run `npm run dev`, visit `/about` and `/nonexistent` to verify both pages render correctly.

- [ ] **Step 4: Commit**

```bash
cd /Users/qiaoyuan/Desktop/project/vercel/qthink
git add app/about/ app/not-found.tsx
git commit -m "feat: add About page and custom 404 page"
```

---

## Task 12: SEO — Sitemap, Robots, Final Polish

**Files:**
- Create: `app/sitemap.ts`, `app/robots.ts`

- [ ] **Step 1: Create dynamic sitemap**

Create `app/sitemap.ts`:

```typescript
import { allPosts } from "contentlayer/generated";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://qthink.dev";

  const posts = allPosts
    .filter((p) => !p.draft)
    .map((post) => ({
      url: `${baseUrl}/posts/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  const categories = ["tech", "life", "thinking"].map((cat) => ({
    url: `${baseUrl}/categories/${cat}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    ...posts,
    ...categories,
  ];
}
```

- [ ] **Step 2: Create robots.txt**

Create `app/robots.ts`:

```typescript
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://qthink.dev/sitemap.xml",
  };
}
```

- [ ] **Step 3: Add .gitignore entries**

Append to `.gitignore`:

```
# Contentlayer
.contentlayer
```

- [ ] **Step 4: Final build verification**

```bash
cd /Users/qiaoyuan/Desktop/project/vercel/qthink
npm run build
```

Expected: Full build succeeds with all pages statically generated:
- `/` (home)
- `/posts/hello-world`, `/posts/life-in-spring`, `/posts/on-thinking`
- `/categories/tech`, `/categories/life`, `/categories/thinking`
- `/tags/Next.js`, `/tags/React`, etc.
- `/search`, `/about`
- `/sitemap.xml`, `/robots.txt`

- [ ] **Step 5: Full dev verification**

```bash
cd /Users/qiaoyuan/Desktop/project/vercel/qthink
npm run dev
```

Manual checks at http://localhost:3000:
1. Home page: Hero, category chips, featured posts, latest posts render correctly
2. Theme toggle: switches between light/dark, no flash on reload
3. Post detail: click any post, verify MDX renders, TOC works, prev/next nav works
4. Categories: click a category chip, verify filtered post list
5. Tags: click a tag on a post, verify filtered list
6. Search: visit `/search`, type a query, verify real-time results
7. About: visit `/about`, verify MDX content renders
8. 404: visit `/nonexistent`, verify custom 404 page
9. Mobile: resize browser, verify responsive layout and mobile menu
10. Sitemap: visit `/sitemap.xml`, verify XML output

- [ ] **Step 6: Commit**

```bash
cd /Users/qiaoyuan/Desktop/project/vercel/qthink
git add app/sitemap.ts app/robots.ts .gitignore
git commit -m "feat: add sitemap, robots.txt, and final SEO configuration"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Project scaffolding & dependencies | package.json, tsconfig.json, next.config.ts |
| 2 | Contentlayer2 config & sample content | contentlayer.config.ts, content/posts/*.mdx |
| 3 | Global styles, theme & fonts | globals.css, theme-toggle.tsx, utils.ts, layout.tsx |
| 4 | Header & Footer components | header.tsx, footer.tsx, layout.tsx |
| 5 | PostCard & PostList components | post-card.tsx, post-list.tsx |
| 6 | Home page | app/page.tsx |
| 7 | MDX components & code highlighting | mdx-components.tsx, callout.tsx |
| 8 | Post detail page with TOC | app/posts/[slug]/page.tsx, toc.tsx |
| 9 | Category & Tag pages | app/categories/[category]/page.tsx, app/tags/[tag]/page.tsx |
| 10 | Search functionality | generate-search-index.mts, search-client.tsx, app/search/page.tsx |
| 11 | About page & 404 | app/about/page.tsx, app/not-found.tsx |
| 12 | SEO — sitemap, robots, final polish | app/sitemap.ts, app/robots.ts |
