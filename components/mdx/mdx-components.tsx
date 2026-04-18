import Image from "next/image";
import Link from "next/link";
import type { MDXComponents } from "mdx/types";
import { Callout } from "./callout";

export const mdxComponents: MDXComponents = {
  h1: (props) => (
    <h1 className="mt-10 mb-4 text-3xl font-bold tracking-tight" {...props} />
  ),
  h2: (props) => (
    <h2 className="mt-8 mb-3 text-2xl font-semibold tracking-tight border-b border-(--color-border) pb-2" {...props} />
  ),
  h3: (props) => (
    <h3 className="mt-6 mb-2 text-xl font-semibold" {...props} />
  ),
  h4: (props) => (
    <h4 className="mt-4 mb-2 text-lg font-semibold" {...props} />
  ),
  p: (props) => (
    <p className="mb-4 leading-7 text-(--color-text-secondary)" {...props} />
  ),
  a: ({ href, children, ...props }) => {
    const isExternal = href?.startsWith("http");
    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-(--color-accent) underline underline-offset-4 transition-colors hover:text-(--color-accent-hover)"
          {...props}
        >
          {children}
        </a>
      );
    }
    return (
      <Link
        href={href ?? "#"}
        className="font-medium text-(--color-accent) underline underline-offset-4 transition-colors hover:text-(--color-accent-hover)"
        {...props}
      >
        {children}
      </Link>
    );
  },
  img: ({ src, alt, ...props }) => (
    <span className="my-6 block overflow-hidden rounded-xl">
      <Image
        src={src ?? ""}
        alt={alt ?? ""}
        width={800}
        height={450}
        className="w-full"
        {...props}
      />
    </span>
  ),
  ul: (props) => (
    <ul className="mb-4 ml-6 list-disc space-y-1 text-(--color-text-secondary)" {...props} />
  ),
  ol: (props) => (
    <ol className="mb-4 ml-6 list-decimal space-y-1 text-(--color-text-secondary)" {...props} />
  ),
  li: (props) => (
    <li className="leading-7" {...props} />
  ),
  blockquote: (props) => (
    <blockquote
      className="my-6 border-l-4 border-(--color-accent)/40 pl-4 italic text-(--color-text-muted)"
      {...props}
    />
  ),
  hr: () => <hr className="my-8 border-(--color-border)" />,
  strong: (props) => (
    <strong className="font-semibold text-(--color-text)" {...props} />
  ),
  Callout,
};
