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
