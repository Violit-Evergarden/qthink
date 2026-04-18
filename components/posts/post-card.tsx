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
