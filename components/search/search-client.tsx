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
