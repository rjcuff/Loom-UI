import type { Metadata } from "next"
import Link from "next/link"

import { siteConfig } from "@/config/site"
import { Button } from "@/components/ui/button"
import { BlockBrowser, type BlockEntry } from "@/components/block-browser"
import { Index } from "@/registry/__index__"

export const metadata: Metadata = {
  title: `Blocks | ${siteConfig.titleSuffix}`,
  description:
    "Whole sections built from loom components. Copy one in and get every piece it uses, wired together and ready to edit.",
  alternates: { canonical: "/blocks" },
  openGraph: {
    type: "website",
    url: `${siteConfig.url}/blocks`,
    siteName: siteConfig.name,
    title: `Blocks | ${siteConfig.titleSuffix}`,
    description:
      "Whole sections built from loom components. Copy one in and get every piece it uses.",
    images: [siteConfig.ogImage],
  },
}

/**
 * Heights are per block because a block is a page, and a login screen is not
 * the length of a dashboard. Sized to show the whole thing without the frame
 * scrolling, which is the point of previewing it at all.
 */
const HEIGHTS: Record<string, number> = {
  "analytics-dashboard": 900,
  "onboarding-flow": 780,
  "login-form": 720,
  "signup-form": 940,
}

function blocks(): BlockEntry[] {
  return Object.values(Index)
    .filter((item) => item.type === "registry:block")
    .map((item) => ({
      name: item.name,
      title: item.title,
      description: item.description,
      category: item.categories?.[0] ?? "other",
      height: HEIGHTS[item.name] ?? 800,
    }))
}

export default function BlocksPage() {
  return (
    <>
      <section className="border-border/60 border-b">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-start px-5 pt-20 pb-14 text-left sm:items-center sm:pt-28 sm:text-center">
          <h1 className="animate-rise text-display font-semibold text-balance sm:text-5xl">
            Blocks, already assembled
          </h1>

          <p className="animate-rise text-muted-foreground mt-5 max-w-xl text-base text-pretty [animation-delay:60ms] sm:text-lg">
            A component shows what one piece does. A block shows what they do
            together. Copy one in and every piece it uses comes with it.
          </p>

          <div className="animate-rise mt-8 grid w-full grid-cols-2 gap-3 [animation-delay:120ms] sm:flex sm:w-auto">
            <Button asChild size="lg" className="min-w-0">
              <Link href="#analytics-dashboard">Browse blocks</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="min-w-0">
              <Link href="/docs/components">
                <span className="sm:hidden">Components</span>
                <span className="hidden sm:inline">View components</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-5 pb-24">
        <BlockBrowser blocks={blocks()} />
      </div>
    </>
  )
}
