import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { mdxComponents } from "@/mdx-components"
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"

import { DOCS_ENTRY, getNeighboursFromConfig } from "@/config/docs"
import { pageTitle, siteConfig } from "@/config/site"
import { source } from "@/lib/source"
import { absoluteUrl } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DocsTableOfContents } from "@/components/docs-toc"
import { docSchema, JsonLd, type Crumb } from "@/components/structured-data"

// The docs tree is fully known at build time, so prerender all of it and
// reject anything that is not in the tree.
export const dynamic = "force-static"
export const dynamicParams = false
export const revalidate = false

interface DocPageProps {
  params: Promise<{ slug?: string[] }>
}

export function generateStaticParams() {
  return source.generateParams()
}

async function getDocFromParams({ params }: DocPageProps) {
  const { slug } = await params
  const page = source.getPage(slug)

  if (!page || page.data.published === false) {
    notFound()
  }

  return page
}

export async function generateMetadata({
  params,
}: DocPageProps): Promise<Metadata> {
  const page = await getDocFromParams({ params })
  const { title, description } = page.data

  // The tab shows the page's own name ("Weave Text", "Installation")
  // followed by what this site is, so a stray tab is still identifiable.
  const tabTitle = pageTitle(title)
  const summary = description ?? siteConfig.description

  // A card drawn for this page in particular, from /og/<slug>.
  const ogImage = {
    url: absoluteUrl(`/og/${page.slugs.join("/")}`),
    width: 1200,
    height: 630,
    alt: title,
  }

  return {
    title: tabTitle,
    description: summary,
    alternates: { canonical: page.url },
    openGraph: {
      type: "article",
      title: tabTitle,
      description: summary,
      url: absoluteUrl(page.url),
      siteName: siteConfig.name,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: tabTitle,
      description: summary,
      creator: "@ryancuff_",
      images: [ogImage],
    },
  }
}

/**
 * The trail a docs URL implies: the site, the docs root, the section, the page.
 * Search results show it under the title, so it is worth being exact.
 */
function crumbsFor(url: string, title: string): Crumb[] {
  const crumbs: Crumb[] = [
    { name: siteConfig.name, url: "/" },
    { name: "Docs", url: DOCS_ENTRY },
  ]

  // `/docs/components/weave-text` has a section worth naming; `/docs/installation`
  // does not, and the page itself closes the trail either way.
  if (url.startsWith("/docs/components/")) {
    crumbs.push({ name: "Components", url: "/docs/components" })
  }

  return [...crumbs, { name: title, url }]
}

export default async function DocPage({ params }: DocPageProps) {
  const page = await getDocFromParams({ params })
  const doc = page.data
  const MDX = doc.body
  const neighbours = getNeighboursFromConfig(page.url)

  return (
    <div className="flex items-start gap-8">
      <JsonLd
        schema={docSchema({
          title: doc.title,
          description: doc.description ?? siteConfig.description,
          url: page.url,
          crumbs: crumbsFor(page.url, doc.title),
        })}
      />

      <article className="max-w-3xl min-w-0 flex-1 py-8 lg:py-10">
        <header className="flex flex-col gap-2">
          <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight">
            {doc.title}
          </h1>
          {doc.description ? (
            <p className="text-muted-foreground text-lg text-balance">
              {doc.description}
            </p>
          ) : null}
        </header>

        <div className="mt-8">
          <MDX components={mdxComponents} />
        </div>

        {neighbours.previous || neighbours.next ? (
          <nav className="border-border mt-16 flex items-center gap-2 border-t pt-6">
            {neighbours.previous ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={neighbours.previous.url}>
                  <ArrowLeftIcon />
                  {neighbours.previous.name}
                </Link>
              </Button>
            ) : null}
            {neighbours.next ? (
              <Button variant="outline" size="sm" className="ml-auto" asChild>
                <Link href={neighbours.next.url}>
                  {neighbours.next.name}
                  <ArrowRightIcon />
                </Link>
              </Button>
            ) : null}
          </nav>
        ) : null}
      </article>

      <div className="sticky top-14 hidden max-h-[calc(100svh-3.5rem)] w-56 shrink-0 overflow-y-auto py-10 xl:block">
        <DocsTableOfContents toc={doc.toc} />
      </div>
    </div>
  )
}
