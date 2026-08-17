import type { MetadataRoute } from "next"

import { siteConfig } from "@/config/site"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // `/view` is a bare demo frame for screen recordings and `/api` answers
      // JSON. Neither is a landing page, and both would dilute the pages that
      // are one.
      disallow: ["/view/", "/api/"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  }
}
