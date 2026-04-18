import { SearchClient } from "@/components/search/search-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "搜索",
  description: "搜索 qthink 博客中的所有文章",
};

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-bold">搜索</h1>
      <SearchClient />
    </div>
  );
}
