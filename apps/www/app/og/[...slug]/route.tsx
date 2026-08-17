import { ImageResponse } from "next/og"

import { siteConfig } from "@/config/site"
import { source } from "@/lib/source"

/**
 * Share cards, one per docs page, so a link to Weave Text in a thread reads as
 * Weave Text rather than as the same site image every other page posts.
 *
 * This lives at `/og/<doc slug>` rather than as an `opengraph-image` file
 * beside the page: that route is an optional catch-all, and nothing may follow
 * a catch-all segment in a URL.
 */
export const dynamic = "force-static"
export const dynamicParams = false

const SIZE = { width: 1200, height: 630 }

export function generateStaticParams() {
  return source
    .getPages()
    .filter((page) => page.slugs.length > 0)
    .map((page) => ({ slug: page.slugs }))
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params
  const page = source.getPage(slug)

  const title = page?.data.title ?? siteConfig.name
  const description = page?.data.description ?? siteConfig.description

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#0f1115",
        padding: "72px",
      }}
    >
      {/* The threads, running the full width above the title. */}
      <div
        style={{
          display: "flex",
          height: "10px",
          width: "100%",
          background:
            "linear-gradient(90deg, #4d7cfe 0%, #46b7d8 45%, #6fe0d0 100%)",
          borderRadius: "999px",
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div
          style={{
            display: "flex",
            fontSize: 68,
            fontWeight: 700,
            color: "#f5f7fa",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 30,
            color: "#9aa4b2",
            lineHeight: 1.35,
            // A long description would otherwise push the footer off the
            // card, so the block is capped rather than trusted.
            maxHeight: "162px",
            overflow: "hidden",
          }}
        >
          {description}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 26,
          color: "#f5f7fa",
        }}
      >
        <div style={{ display: "flex", fontWeight: 600 }}>
          {siteConfig.name}
        </div>
        <div style={{ display: "flex", color: "#6fe0d0" }}>
          {siteConfig.url.replace("https://", "")}
        </div>
      </div>
    </div>,
    SIZE
  )
}
