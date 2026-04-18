"use client";

import { useMDXComponent } from "next-contentlayer2/hooks";
import { mdxComponents } from "./mdx-components";

export function MdxContent({ code }: { code: string }) {
  const MDXContent = useMDXComponent(code);
  return <MDXContent components={mdxComponents} />;
}
