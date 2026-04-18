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
