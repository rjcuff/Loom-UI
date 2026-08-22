import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getRegistryComponent } from "@/lib/registry"
import { Index } from "@/registry/__index__"

/**
 * A demo on its own, with no header, sidebar or table of contents around it.
 * Screen recordings point here, so the frame contains the component and
 * nothing that would date the capture the next time the chrome changes.
 */
export const dynamic = "force-static"
export const dynamicParams = false
export const revalidate = false

export function generateStaticParams() {
  return Object.keys(Index)
    .filter(
      (name) => name.endsWith("-demo") || Index[name].type === "registry:block"
    )
    .map((name) => ({ name }))
}

// Not a page anyone should land on from a search result.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function ViewPage({
  params,
}: {
  params: Promise<{ name: string }>
}) {
  const { name } = await params
  const Component = getRegistryComponent(name)

  if (!Component) {
    notFound()
  }

  // A block is a whole page and brings its own padding, background and
  // heading order. Centring it in a padded box the way a single demo is
  // centred would inset a layout that is meant to run to the edges.
  const isBlock = Index[name]?.type === "registry:block"

  if (isBlock) {
    return (
      <div data-view={name}>
        <Component />
      </div>
    )
  }

  return (
    <div
      data-view={name}
      className="bg-background flex min-h-svh items-center justify-center p-12"
    >
      <Component />
    </div>
  )
}
