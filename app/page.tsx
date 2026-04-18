import Link from "next/link";
import { allPosts } from "contentlayer/generated";
import { compareDesc } from "date-fns";
import { PostCard } from "@/components/posts/post-card";
import { PostList } from "@/components/posts/post-list";
import { categoryMap } from "@/lib/utils";
import { siteConfig } from "@/lib/constants";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteConfig.url}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function HomePage() {
  const posts = allPosts
    .filter((p) => !p.draft)
    .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)));

  const featuredPosts = posts.filter((p) => p.featured);
  const latestPosts = posts.slice(0, 6);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-5xl px-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl py-10 px-8 my-8">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-(--color-gradient-from)/10 via-(--color-gradient-via)/5 to-transparent" />
        <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
          <span className="bg-gradient-to-r from-(--color-gradient-from) via-(--color-gradient-via) to-(--color-gradient-to) bg-clip-text text-transparent">
            qthink
          </span>
        </h1>
        <p className="mb-1 text-lg text-(--color-text-secondary)">
          思考 · 记录 · 分享
        </p>
        <p className="mb-5 max-w-xl text-sm leading-relaxed text-(--color-text-muted)">
          一个关于技术、生活与思考的个人博客。在这里记录学习的过程、生活的感悟，以及对世界的独立思考。
        </p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(categoryMap).map(([key, { label, color }]) => (
            <Link
              key={key}
              href={`/categories/${key}`}
              className={`rounded-full px-3.5 py-1 text-sm font-medium transition-transform hover:scale-105 ${color}`}
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
    </>
  );
}
