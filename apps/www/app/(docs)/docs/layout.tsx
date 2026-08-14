import { DocsMobileNav } from "@/components/docs-mobile-nav"
import { DocsSidebar } from "@/components/docs-sidebar"

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // The whole three-column set sits in the same centered container as the site
  // header, so the sidebar, the article and the table of contents line up with
  // the nav above them instead of drifting to the left edge.
  return (
    <div className="mx-auto w-full max-w-6xl px-5">
      <DocsMobileNav />
      <div className="lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-10">
        <DocsSidebar />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  )
}
