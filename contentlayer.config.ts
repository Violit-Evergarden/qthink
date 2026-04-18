import { defineDocumentType, makeSource } from "contentlayer2/source-files";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

export const Post = defineDocumentType(() => ({
  name: "Post",
  filePathPattern: "posts/**/*.mdx",
  contentType: "mdx",
  fields: {
    title: { type: "string", required: true },
    date: { type: "date", required: true },
    description: { type: "string", required: true },
    category: {
      type: "enum",
      options: ["tech", "life", "thinking"],
      required: true,
    },
    tags: { type: "list", of: { type: "string" }, default: [] },
    cover: { type: "string" },
    draft: { type: "boolean", default: false },
    featured: { type: "boolean", default: false },
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (post) => post._raw.flattenedPath.replace("posts/", ""),
    },
    readingTime: {
      type: "string",
      resolve: (post) => {
        const wordsPerMinute = 300;
        const chars = post.body.raw.length;
        const minutes = Math.ceil(chars / wordsPerMinute);
        return `${minutes} min read`;
      },
    },
  },
}));

export const About = defineDocumentType(() => ({
  name: "About",
  filePathPattern: "about.mdx",
  contentType: "mdx",
  fields: {},
}));

export default makeSource({
  contentDirPath: "content",
  documentTypes: [Post, About],
  mdx: {
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        { behavior: "wrap", properties: { className: ["anchor"] } },
      ],
      [
        rehypePrettyCode,
        {
          theme: { dark: "github-dark", light: "github-light" },
          keepBackground: false,
        },
      ],
    ],
  },
});
