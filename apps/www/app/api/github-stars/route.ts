import { NextResponse } from "next/server"

import { siteConfig } from "@/config/site"

/**
 * The header is rendered inside statically generated pages, so the count
 * cannot be fetched during the render without freezing it at build time.
 * It comes from here instead, cached for an hour, which is one call to
 * GitHub for the whole site rather than one per visitor. Unauthenticated
 * requests are limited to sixty an hour per IP, and this stays well inside
 * that without a token.
 */
export const revalidate = 3600

const REPO = siteConfig.links.github.replace(/^https:\/\/github\.com\//, "")

export async function GET() {
  try {
    const response = await fetch(`https://api.github.com/repos/${REPO}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      next: { revalidate },
    })

    if (!response.ok) {
      return NextResponse.json({ stars: null })
    }

    const data: unknown = await response.json()
    const stars =
      typeof data === "object" &&
      data !== null &&
      "stargazers_count" in data &&
      typeof data.stargazers_count === "number"
        ? data.stargazers_count
        : null

    return NextResponse.json({ stars })
  } catch {
    // A rate limit or an outage should cost the header its badge, nothing
    // more, so the failure is swallowed and reported as "no count".
    return NextResponse.json({ stars: null })
  }
}
