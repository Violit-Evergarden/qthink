import { allAbouts } from "contentlayer/generated";
import { MdxContent } from "@/components/mdx/mdx-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "关于",
  description: "关于 qthink 博客和作者",
};

export default function AboutPage() {
  const about = allAbouts[0];

  if (!about) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold">关于</h1>
        <p className="mt-4 text-(--color-text-secondary)">内容即将更新...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <MdxContent code={about.body.code} />
    </div>
  );
}
