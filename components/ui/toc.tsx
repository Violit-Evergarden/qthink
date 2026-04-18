"use client";

import { useEffect, useState } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents({ headings }: { headings: TocItem[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );

    for (const { id } of headings) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="hidden xl:block">
      <div className="sticky top-24">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-(--color-text-muted)">
          目录
        </p>
        <ul className="space-y-2 border-l border-(--color-border)">
          {headings.map((heading) => (
            <li
              key={heading.id}
              style={{ paddingLeft: `${(heading.level - 2) * 12 + 12}px` }}
            >
              <a
                href={`#${heading.id}`}
                className={`block text-sm leading-6 transition-colors ${
                  activeId === heading.id
                    ? "border-l-2 -ml-px border-(--color-accent) font-medium text-(--color-accent)"
                    : "text-(--color-text-muted) hover:text-(--color-text-secondary)"
                }`}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
