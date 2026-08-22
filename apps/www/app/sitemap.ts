import type { MetadataRoute } from "next"

import { siteConfig } from "@/config/site"
import { source } from "@/lib/source"

/**
 * The entry pages carry more weight than any single component page, so they say
 * so rather than letting 38 component pages sit level with the home page.
 */
function priorityFor(url: string) {
  if (
    url === "/docs/introduction" ||
    url === "/docs/installation" ||
    url === "/docs/theming"
  )
    return 0.9
  if (url === "/docs/components") return 0.9
  return 0.7
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  const docs = source
    .getPages()
    .filter((page) => page.data.published !== false)
    .map((page) => ({
      url: `${siteConfig.url}${page.url}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: priorityFor(page.url),
    }))

  return [
    {
      url: siteConfig.url,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    ...docs,
  ]
}
