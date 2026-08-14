import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
} from "fumadocs-mdx/config"
import rehypePrettyCode from "rehype-pretty-code"
import { z } from "zod"

import { transformers } from "@/lib/highlight-code"

export default defineConfig({
  mdxOptions: {
    rehypePlugins: (plugins) => {
      // Drop fumadocs' bundled highlighter so rehype-pretty-code owns code
      // blocks and matches the highlighting used by <ComponentSource />.
      plugins.shift()
      plugins.push([
        rehypePrettyCode,
        {
          theme: {
            light: "github-light-default",
            dark: "github-dark",
          },
          transformers,
        },
      ])

      return plugins
    },
  },
})

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: frontmatterSchema.extend({
      date: z.date().optional(),
      published: z.boolean().optional().default(true),
      links: z
        .object({
          source: z.string().optional(),
        })
        .optional(),
    }),
  },
})
