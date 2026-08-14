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
    .filter((name) => name.endsWith("-demo"))
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

  return (
    <div
      data-view={name}
      className="bg-background flex min-h-svh items-center justify-center p-12"
    >
      <Component />
    </div>
  )
}
