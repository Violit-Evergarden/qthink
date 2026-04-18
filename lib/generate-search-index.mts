import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "fs";
import { join } from "path";
import matter from "gray-matter";

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

const files = readdirSync(contentDir).filter((f) => f.endsWith(".mdx"));
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
