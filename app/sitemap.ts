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
