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
