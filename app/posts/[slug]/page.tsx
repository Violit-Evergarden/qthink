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
      <div className="relative xl:flex xl:gap-12">
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
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
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

        {/* TOC sidebar - hidden below xl */}
        <aside className="hidden xl:block w-56 shrink-0">
          <TableOfContents headings={headings} />
        </aside>
      </div>
    </div>
  );
}
