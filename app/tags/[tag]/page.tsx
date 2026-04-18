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
    robots: { index: false, follow: true },
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
