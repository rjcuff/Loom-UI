import { DocsMobileNav } from "@/components/docs-mobile-nav"
import { DocsSidebar } from "@/components/docs-sidebar"

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full">
      <DocsMobileNav />
      {/* The sidebar hugs the left edge rather than sitting inside a centered
          container; the article carries its own max width for readability. */}
      <div className="lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-10">
        <DocsSidebar />
        <div className="min-w-0 px-5 lg:px-0 lg:pr-8">{children}</div>
      </div>
    </div>
  )
}
